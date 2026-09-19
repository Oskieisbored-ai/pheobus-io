"""
Company enrichment engine — gathers company info from public sources.

Sources:
1. Website scraping (meta tags, about pages, structured data)
2. Clearbit free tier
3. SEC EDGAR (for public companies)
4. GitHub API (for tech companies)
"""

import asyncio
import json
import re
from typing import Optional, Dict, Any
from dataclasses import dataclass, field
from bs4 import BeautifulSoup
import httpx
from app.core.config import settings


@dataclass
class CompanyData:
    name: Optional[str] = None
    domain: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    industry: Optional[str] = None
    employee_count: Optional[int] = None
    employee_range: Optional[str] = None
    founded_year: Optional[int] = None
    headquarters_city: Optional[str] = None
    headquarters_state: Optional[str] = None
    headquarters_country: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    facebook_url: Optional[str] = None
    tech_stack: list = field(default_factory=list)
    social_links: dict = field(default_factory=dict)
    revenue_range: Optional[str] = None
    source: str = "enrichment"


def estimate_employee_range(count: Optional[int]) -> Optional[str]:
    if count is None:
        return None
    ranges = [
        (1, 10, "1-10"),
        (11, 50, "11-50"),
        (51, 200, "51-200"),
        (201, 500, "201-500"),
        (501, 1000, "501-1000"),
        (1001, 5000, "1001-5000"),
        (5001, 10000, "5001-10000"),
        (10001, float('inf'), "10001+"),
    ]
    for low, high, label in ranges:
        if low <= count <= high:
            return label
    return None


async def scrape_website_meta(domain: str) -> CompanyData:
    """Extract company info from website meta tags and structured data."""
    data = CompanyData(domain=domain)

    async with httpx.AsyncClient(
        headers={"User-Agent": settings.USER_AGENT},
        follow_redirects=True,
        timeout=15,
    ) as client:
        for url in [f"https://{domain}", f"https://www.{domain}"]:
            try:
                resp = await client.get(url)
                if resp.status_code != 200:
                    continue

                soup = BeautifulSoup(resp.text, "lxml")
                data.website_url = url

                # Title / name
                og_site_name = soup.find("meta", property="og:site_name")
                if og_site_name:
                    data.name = og_site_name.get("content", "").strip()

                if not data.name:
                    title_tag = soup.find("title")
                    if title_tag:
                        raw = title_tag.text.strip()
                        data.name = raw.split("|")[0].split("-")[0].split("—")[0].strip()

                # Description
                og_desc = soup.find("meta", property="og:description")
                meta_desc = soup.find("meta", attrs={"name": "description"})
                if og_desc:
                    data.description = og_desc.get("content", "").strip()
                elif meta_desc:
                    data.description = meta_desc.get("content", "").strip()

                if data.description and len(data.description) > 300:
                    data.short_description = data.description[:297] + "..."
                else:
                    data.short_description = data.description

                # Logo
                og_image = soup.find("meta", property="og:image")
                if og_image:
                    data.logo_url = og_image.get("content", "")

                # Social links
                for a_tag in soup.find_all("a", href=True):
                    href = a_tag["href"]
                    if "linkedin.com/company" in href:
                        data.linkedin_url = href
                    elif "twitter.com/" in href or "x.com/" in href:
                        data.twitter_url = href
                    elif "facebook.com/" in href:
                        data.facebook_url = href

                # JSON-LD structured data
                for script in soup.find_all("script", type="application/ld+json"):
                    try:
                        ld = json.loads(script.string)
                        if isinstance(ld, dict):
                            if ld.get("@type") == "Organization":
                                data.name = data.name or ld.get("name")
                                data.description = data.description or ld.get("description")
                                if "address" in ld:
                                    addr = ld["address"]
                                    if isinstance(addr, dict):
                                        data.headquarters_city = addr.get("addressLocality")
                                        data.headquarters_state = addr.get("addressRegion")
                                        data.headquarters_country = addr.get("addressCountry")
                                if "foundingDate" in ld:
                                    try:
                                        data.founded_year = int(str(ld["foundingDate"])[:4])
                                    except (ValueError, TypeError):
                                        pass
                                if "numberOfEmployees" in ld:
                                    emp = ld["numberOfEmployees"]
                                    if isinstance(emp, dict) and "value" in emp:
                                        try:
                                            data.employee_count = int(emp["value"])
                                        except (ValueError, TypeError):
                                            pass
                    except (json.JSONDecodeError, TypeError):
                        continue

                # Tech stack detection from HTML
                data.tech_stack = detect_tech_stack(resp.text, resp.headers)

                break  # Got data from one URL, done
            except Exception:
                continue

    if data.employee_count:
        data.employee_range = estimate_employee_range(data.employee_count)

    return data


def detect_tech_stack(html: str, headers: dict) -> list:
    """Detect technologies from HTML source and headers."""
    techs = []
    checks = {
        "React": [r'react\.production', r'__NEXT_DATA__', r'_next/static'],
        "Next.js": [r'__NEXT_DATA__', r'_next/static'],
        "Vue.js": [r'vue\.runtime', r'__vue__', r'nuxt'],
        "Angular": [r'ng-version', r'angular\.js'],
        "WordPress": [r'wp-content', r'wp-includes'],
        "Shopify": [r'cdn\.shopify\.com', r'Shopify\.theme'],
        "Webflow": [r'webflow\.com'],
        "Squarespace": [r'squarespace\.com'],
        "HubSpot": [r'hs-scripts\.com', r'hubspot'],
        "Google Analytics": [r'google-analytics\.com', r'gtag', r'UA-\d+'],
        "Google Tag Manager": [r'googletagmanager\.com'],
        "Segment": [r'cdn\.segment\.com', r'analytics\.js'],
        "Intercom": [r'intercom', r'widget\.intercom\.io'],
        "Drift": [r'drift\.com', r'js\.driftt\.com'],
        "Zendesk": [r'zendesk\.com'],
        "Stripe": [r'js\.stripe\.com'],
        "Cloudflare": [r'cloudflare'],
        "AWS": [r'amazonaws\.com'],
        "Tailwind CSS": [r'tailwindcss', r'tw-'],
        "Bootstrap": [r'bootstrap\.min', r'bootstrap\.css'],
        "jQuery": [r'jquery\.min\.js', r'jquery-\d'],
    }

    html_lower = html.lower()
    for tech, patterns in checks.items():
        for pattern in patterns:
            if re.search(pattern, html_lower):
                techs.append(tech)
                break

    # Check server header
    server = headers.get("server", "").lower()
    if "nginx" in server:
        techs.append("Nginx")
    elif "apache" in server:
        techs.append("Apache")
    elif "cloudflare" in server and "Cloudflare" not in techs:
        techs.append("Cloudflare")

    return list(set(techs))


async def search_clearbit(domain: str) -> Optional[CompanyData]:
    """Clearbit company lookup (free tier)."""
    if not settings.CLEARBIT_API_KEY:
        return None

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(
                f"https://company.clearbit.com/v2/companies/find",
                params={"domain": domain},
                headers={"Authorization": f"Bearer {settings.CLEARBIT_API_KEY}"},
            )
            if resp.status_code == 200:
                co = resp.json()
                data = CompanyData(
                    name=co.get("name"),
                    domain=domain,
                    description=co.get("description"),
                    industry=co.get("category", {}).get("industry"),
                    employee_count=co.get("metrics", {}).get("employees"),
                    founded_year=co.get("foundedYear"),
                    headquarters_city=co.get("geo", {}).get("city"),
                    headquarters_state=co.get("geo", {}).get("state"),
                    headquarters_country=co.get("geo", {}).get("country"),
                    logo_url=co.get("logo"),
                    linkedin_url=co.get("linkedin", {}).get("handle"),
                    twitter_url=co.get("twitter", {}).get("handle"),
                    facebook_url=co.get("facebook", {}).get("handle"),
                    tech_stack=co.get("tech", []),
                    source="clearbit",
                )
                if data.employee_count:
                    data.employee_range = estimate_employee_range(data.employee_count)
                return data
        except Exception:
            pass
    return None


async def enrich_company(domain: str) -> CompanyData:
    """
    Main company enrichment pipeline.
    Merges data from all available sources.
    """
    # Try all sources in parallel
    website_task = scrape_website_meta(domain)
    clearbit_task = search_clearbit(domain)

    website_data, clearbit_data = await asyncio.gather(
        website_task,
        clearbit_task,
        return_exceptions=True,
    )

    # Start with website data as base
    if isinstance(website_data, Exception):
        result = CompanyData(domain=domain)
    else:
        result = website_data

    # Merge clearbit data (fill gaps)
    if clearbit_data and not isinstance(clearbit_data, Exception):
        for attr in [
            "name", "description", "industry", "employee_count", "employee_range",
            "founded_year", "headquarters_city", "headquarters_state",
            "headquarters_country", "logo_url", "linkedin_url", "twitter_url",
            "facebook_url", "revenue_range",
        ]:
            existing = getattr(result, attr, None)
            new_val = getattr(clearbit_data, attr, None)
            if not existing and new_val:
                setattr(result, attr, new_val)

        # Merge tech stacks
        if clearbit_data.tech_stack:
            combined = list(set(result.tech_stack + clearbit_data.tech_stack))
            result.tech_stack = combined

    return result
