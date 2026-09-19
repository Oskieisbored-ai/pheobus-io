"""
Email finder engine — tries multiple strategies to discover professional emails.

Strategy chain:
1. Common pattern generation (first.last@domain, flast@domain, etc.)
2. Hunter.io API (free tier: 25 searches/month)
3. Web scraping (company contact pages, about pages)
4. SMTP verification of generated patterns
"""

import asyncio
import re
import dns.resolver
from typing import Optional, List, Tuple
from dataclasses import dataclass
import httpx
from app.core.config import settings


@dataclass
class EmailResult:
    email: str
    confidence: float  # 0.0 - 1.0
    source: str  # "pattern", "hunter", "scrape", "smtp_verified"
    verified: bool = False


# Common email patterns used by businesses (ordered by popularity)
EMAIL_PATTERNS = [
    "{first}.{last}",          # john.doe@company.com (most common)
    "{first}{last}",           # johndoe@company.com
    "{f}{last}",               # jdoe@company.com
    "{first}_{last}",          # john_doe@company.com
    "{first}",                 # john@company.com
    "{last}.{first}",          # doe.john@company.com
    "{f}.{last}",              # j.doe@company.com
    "{first}{l}",              # johnd@company.com
    "{last}",                  # doe@company.com
    "{first}-{last}",          # john-doe@company.com
    "{f}{l}",                  # jd@company.com
    "{last}{first}",           # doejohn@company.com
    "{last}{f}",               # doej@company.com
]


def generate_patterns(first_name: str, last_name: str, domain: str) -> List[str]:
    """Generate all possible email addresses from name + domain."""
    first = first_name.lower().strip()
    last = last_name.lower().strip()
    f = first[0] if first else ""
    l = last[0] if last else ""

    emails = []
    for pattern in EMAIL_PATTERNS:
        email = pattern.format(first=first, last=last, f=f, l=l) + f"@{domain}"
        # Clean up any special chars
        email = re.sub(r'[^a-z0-9.@_-]', '', email)
        emails.append(email)

    return emails


async def check_mx_record(domain: str) -> bool:
    """Verify the domain has MX records (accepts email)."""
    try:
        loop = asyncio.get_event_loop()
        records = await loop.run_in_executor(None, lambda: dns.resolver.resolve(domain, 'MX'))
        return len(records) > 0
    except Exception:
        return False


async def smtp_verify_email(email: str) -> Tuple[bool, str]:
    """
    Verify email exists via SMTP RCPT TO.
    Returns (is_valid, status) where status is 'valid', 'invalid', 'catch_all', or 'unknown'.
    """
    import smtplib

    domain = email.split("@")[1]

    try:
        loop = asyncio.get_event_loop()
        records = await loop.run_in_executor(None, lambda: dns.resolver.resolve(domain, 'MX'))
        mx_host = str(records[0].exchange).rstrip(".")
    except Exception:
        return False, "unknown"

    try:
        def _verify():
            server = smtplib.SMTP(timeout=10)
            server.connect(mx_host, 25)
            server.helo("pheobus.io")
            server.mail("verify@pheobus.io")
            code, _ = server.rcpt(email)
            server.quit()
            return code

        code = await loop.run_in_executor(None, _verify)

        if code == 250:
            return True, "valid"
        elif code == 550:
            return False, "invalid"
        else:
            return False, "unknown"
    except Exception:
        return False, "unknown"


async def search_hunter(
    domain: str,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
) -> Optional[EmailResult]:
    """Search Hunter.io for email (free tier: 25 requests/month)."""
    if not settings.HUNTER_API_KEY:
        return None

    async with httpx.AsyncClient() as client:
        params = {"domain": domain, "api_key": settings.HUNTER_API_KEY}
        if first_name:
            params["first_name"] = first_name
        if last_name:
            params["last_name"] = last_name

        try:
            resp = await client.get(
                "https://api.hunter.io/v2/email-finder",
                params=params,
                timeout=15,
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                email = data.get("email")
                score = data.get("score", 0)
                if email:
                    return EmailResult(
                        email=email,
                        confidence=score / 100.0,
                        source="hunter",
                        verified=score > 90,
                    )
        except Exception:
            pass
    return None


async def scrape_company_emails(domain: str) -> List[EmailResult]:
    """Scrape company website for email addresses."""
    from bs4 import BeautifulSoup

    found_emails = []
    pages_to_check = [
        f"https://{domain}",
        f"https://{domain}/contact",
        f"https://{domain}/about",
        f"https://{domain}/team",
        f"https://{domain}/contact-us",
        f"https://www.{domain}",
        f"https://www.{domain}/contact",
    ]

    email_regex = re.compile(
        r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    )

    async with httpx.AsyncClient(
        headers={"User-Agent": settings.USER_AGENT},
        follow_redirects=True,
        timeout=15,
    ) as client:
        for url in pages_to_check:
            try:
                resp = await client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "lxml")
                    text = soup.get_text()
                    emails = email_regex.findall(text)

                    # Also check mailto: links
                    for a_tag in soup.find_all("a", href=True):
                        href = a_tag["href"]
                        if href.startswith("mailto:"):
                            email = href.replace("mailto:", "").split("?")[0]
                            emails.append(email)

                    for email in set(emails):
                        email = email.lower().strip()
                        # Filter out common junk
                        if not any(skip in email for skip in [
                            "example.com", "sentry.io", "wixpress",
                            "schema.org", ".png", ".jpg", ".gif",
                        ]):
                            found_emails.append(EmailResult(
                                email=email,
                                confidence=0.7,
                                source="scrape",
                            ))

                await asyncio.sleep(settings.SCRAPE_RATE_LIMIT)
            except Exception:
                continue

    return found_emails


async def find_email(
    first_name: str,
    last_name: str,
    domain: str,
    verify: bool = True,
) -> List[EmailResult]:
    """
    Main email finding pipeline. Tries all strategies and returns
    results sorted by confidence.
    """
    results: List[EmailResult] = []

    # Check domain has MX records first
    has_mx = await check_mx_record(domain)
    if not has_mx:
        return results

    # Strategy 1: Hunter.io API
    hunter_result = await search_hunter(domain, first_name, last_name)
    if hunter_result:
        results.append(hunter_result)

    # Strategy 2: Pattern generation + SMTP verification
    patterns = generate_patterns(first_name, last_name, domain)
    if verify:
        for email in patterns[:5]:  # only verify top 5 patterns to be nice
            is_valid, status = await smtp_verify_email(email)
            if is_valid:
                results.append(EmailResult(
                    email=email,
                    confidence=0.95,
                    source="smtp_verified",
                    verified=True,
                ))
                break  # Found a verified one, stop
    else:
        # Without verification, add top patterns with lower confidence
        for i, email in enumerate(patterns[:3]):
            results.append(EmailResult(
                email=email,
                confidence=0.6 - (i * 0.1),
                source="pattern",
            ))

    # Strategy 3: Web scraping
    scraped = await scrape_company_emails(domain)
    # Cross-reference scraped emails with our person
    for scraped_email in scraped:
        local = scraped_email.email.split("@")[0].lower()
        if first_name.lower() in local or last_name.lower() in local:
            scraped_email.confidence = 0.85
            results.append(scraped_email)
        else:
            # Still useful as company email pattern discovery
            scraped_email.confidence = 0.3
            results.append(scraped_email)

    # Sort by confidence descending
    results.sort(key=lambda r: r.confidence, reverse=True)

    # Deduplicate
    seen = set()
    unique = []
    for r in results:
        if r.email not in seen:
            seen.add(r.email)
            unique.append(r)

    return unique
