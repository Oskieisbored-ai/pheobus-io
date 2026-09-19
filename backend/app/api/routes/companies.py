from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List
from math import ceil
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.company import Company
from app.models.contact import Contact
from app.schemas.company import (
    CompanyCreate, CompanyResponse, CompanySearchFilters, PaginatedCompanies,
)

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("", response_model=PaginatedCompanies)
def search_companies(
    q: Optional[str] = None,
    name: Optional[str] = None,
    domain: Optional[str] = None,
    industry: Optional[str] = None,
    employee_range: Optional[str] = None,
    country: Optional[str] = None,
    city: Optional[str] = None,
    has_funding: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Company)

    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                Company.name.ilike(search_term),
                Company.domain.ilike(search_term),
                Company.industry.ilike(search_term),
                Company.description.ilike(search_term),
            )
        )

    if name:
        query = query.filter(Company.name.ilike(f"%{name}%"))
    if domain:
        query = query.filter(Company.domain.ilike(f"%{domain}%"))
    if industry:
        industries = industry.split(",")
        query = query.filter(Company.industry.in_(industries))
    if employee_range:
        ranges = employee_range.split(",")
        query = query.filter(Company.employee_range.in_(ranges))
    if country:
        query = query.filter(Company.headquarters_country.ilike(f"%{country}%"))
    if city:
        query = query.filter(Company.headquarters_city.ilike(f"%{city}%"))
    if has_funding is True:
        query = query.filter(Company.total_funding > 0)

    total = query.count()

    sort_col = getattr(Company, sort_by, Company.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    companies_raw = query.offset((page - 1) * per_page).limit(per_page).all()

    companies = []
    for co in companies_raw:
        co_dict = CompanyResponse.model_validate(co).model_dump()
        co_dict["contact_count"] = db.query(Contact).filter(Contact.company_id == co.id).count()
        companies.append(CompanyResponse(**co_dict))

    return PaginatedCompanies(
        companies=companies,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=ceil(total / per_page) if total > 0 else 0,
    )


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    co_dict = CompanyResponse.model_validate(company).model_dump()
    co_dict["contact_count"] = db.query(Contact).filter(Contact.company_id == company.id).count()
    return CompanyResponse(**co_dict)


@router.post("", response_model=CompanyResponse, status_code=201)
def create_company(
    req: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if req.domain:
        existing = db.query(Company).filter(Company.domain == req.domain).first()
        if existing:
            raise HTTPException(status_code=400, detail="Company with this domain already exists")

    company = Company(**req.model_dump(), source="manual")
    db.add(company)
    db.commit()
    db.refresh(company)
    return CompanyResponse.model_validate(company)


@router.get("/{company_id}/contacts")
def get_company_contacts(
    company_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.schemas.contact import ContactResponse

    contacts = (
        db.query(Contact)
        .filter(Contact.company_id == company_id)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    total = db.query(Contact).filter(Contact.company_id == company_id).count()
    return {
        "contacts": [ContactResponse.model_validate(c) for c in contacts],
        "total": total,
    }
