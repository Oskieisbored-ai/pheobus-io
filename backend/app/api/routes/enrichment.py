from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.contact import Contact
from app.models.company import Company
from app.scrapers.email_finder import find_email, EmailResult
from app.scrapers.company_enricher import enrich_company

router = APIRouter(prefix="/enrichment", tags=["Enrichment"])


class FindEmailRequest(BaseModel):
    first_name: str
    last_name: str
    domain: str
    verify: bool = True


class FindEmailResponse(BaseModel):
    email: Optional[str] = None
    confidence: float = 0.0
    source: str = ""
    verified: bool = False
    all_results: list = []


class EnrichCompanyRequest(BaseModel):
    domain: str


class EnrichContactRequest(BaseModel):
    contact_id: int


class BulkEnrichRequest(BaseModel):
    contact_ids: List[int]


@router.post("/find-email", response_model=FindEmailResponse)
async def find_email_endpoint(
    req: FindEmailRequest,
    current_user: User = Depends(get_current_user),
):
    results = await find_email(
        first_name=req.first_name,
        last_name=req.last_name,
        domain=req.domain,
        verify=req.verify,
    )

    if not results:
        return FindEmailResponse()

    best = results[0]
    return FindEmailResponse(
        email=best.email,
        confidence=best.confidence,
        source=best.source,
        verified=best.verified,
        all_results=[
            {
                "email": r.email,
                "confidence": r.confidence,
                "source": r.source,
                "verified": r.verified,
            }
            for r in results[:10]
        ],
    )


@router.post("/enrich-company")
async def enrich_company_endpoint(
    req: EnrichCompanyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = await enrich_company(req.domain)

    # Upsert company in database
    existing = db.query(Company).filter(Company.domain == req.domain).first()
    if existing:
        for attr in [
            "name", "description", "short_description", "industry",
            "employee_count", "employee_range", "founded_year",
            "headquarters_city", "headquarters_state", "headquarters_country",
            "logo_url", "website_url", "linkedin_url", "twitter_url",
            "facebook_url", "tech_stack",
        ]:
            new_val = getattr(data, attr, None)
            if new_val:
                setattr(existing, attr, new_val)
        existing.last_enriched_at = datetime.now(timezone.utc)
        existing.source = "enrichment"
        db.commit()
        db.refresh(existing)
        return {"status": "updated", "company_id": existing.id, "data": data.__dict__}
    else:
        company = Company(
            name=data.name or req.domain,
            domain=req.domain,
            description=data.description,
            short_description=data.short_description,
            industry=data.industry,
            employee_count=data.employee_count,
            employee_range=data.employee_range,
            founded_year=data.founded_year,
            headquarters_city=data.headquarters_city,
            headquarters_state=data.headquarters_state,
            headquarters_country=data.headquarters_country,
            logo_url=data.logo_url,
            website_url=data.website_url,
            linkedin_url=data.linkedin_url,
            twitter_url=data.twitter_url,
            facebook_url=data.facebook_url,
            tech_stack=data.tech_stack or [],
            source="enrichment",
            last_enriched_at=datetime.now(timezone.utc),
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        return {"status": "created", "company_id": company.id, "data": data.__dict__}


@router.post("/enrich-contact")
async def enrich_contact_endpoint(
    req: EnrichContactRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = db.query(Contact).filter(Contact.id == req.contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    results = {}

    # Find email if missing
    if not contact.email and contact.company_name:
        # Try to get domain from company
        domain = None
        if contact.company_id:
            company = db.query(Company).filter(Company.id == contact.company_id).first()
            if company and company.domain:
                domain = company.domain

        if domain:
            email_results = await find_email(
                first_name=contact.first_name,
                last_name=contact.last_name,
                domain=domain,
                verify=True,
            )
            if email_results:
                best = email_results[0]
                contact.email = best.email
                contact.email_confidence = best.confidence
                contact.email_status = "verified" if best.verified else "unverified"
                results["email"] = best.email

    contact.last_enriched_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "enriched", "results": results}
