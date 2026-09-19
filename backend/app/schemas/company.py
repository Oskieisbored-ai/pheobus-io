from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CompanyBase(BaseModel):
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    employee_range: Optional[str] = None
    headquarters_city: Optional[str] = None
    headquarters_country: Optional[str] = None
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyResponse(CompanyBase):
    id: int
    logo_url: Optional[str] = None
    sub_industry: Optional[str] = None
    short_description: Optional[str] = None
    employee_count: Optional[int] = None
    revenue_range: Optional[str] = None
    annual_revenue: Optional[int] = None
    founded_year: Optional[int] = None
    headquarters_state: Optional[str] = None
    full_address: Optional[str] = None
    twitter_url: Optional[str] = None
    facebook_url: Optional[str] = None
    crunchbase_url: Optional[str] = None
    tech_stack: list = []
    tags: list = []
    keywords: list = []
    total_funding: Optional[int] = None
    latest_funding_round: Optional[str] = None
    source: Optional[str] = None
    data_quality_score: int = 0
    created_at: datetime
    contact_count: int = 0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    google_search_url: Optional[str] = None
    google_maps_url: Optional[str] = None

    class Config:
        from_attributes = True


class CompanySearchFilters(BaseModel):
    q: Optional[str] = None
    name: Optional[str] = None
    domain: Optional[str] = None
    industry: Optional[List[str]] = None
    employee_range: Optional[List[str]] = None
    revenue_range: Optional[List[str]] = None
    country: Optional[str] = None
    city: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    has_funding: Optional[bool] = None
    founded_after: Optional[int] = None
    founded_before: Optional[int] = None
    page: int = 1
    per_page: int = 25
    sort_by: str = "created_at"
    sort_order: str = "desc"


class PaginatedCompanies(BaseModel):
    companies: List[CompanyResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
