from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class ContactBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    company_name: Optional[str] = None
    company_id: Optional[int] = None
    seniority: Optional[str] = None
    department: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    linkedin_url: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    company_name: Optional[str] = None
    seniority: Optional[str] = None
    department: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    linkedin_url: Optional[str] = None


class ContactResponse(ContactBase):
    id: int
    full_name: Optional[str] = None
    headline: Optional[str] = None
    avatar_url: Optional[str] = None
    email_status: str = "unknown"
    email_confidence: float = 0.0
    personal_email: Optional[str] = None
    mobile_phone: Optional[str] = None
    work_phone: Optional[str] = None
    twitter_url: Optional[str] = None
    github_url: Optional[str] = None
    skills: list = []
    education: list = []
    work_history: list = []
    lead_score: int = 0
    source: Optional[str] = None
    is_verified: bool = False
    data_quality_score: int = 0
    last_enriched_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContactSearchFilters(BaseModel):
    q: Optional[str] = None  # general text search
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    seniority: Optional[List[str]] = None  # ["c_suite", "vp", "director"]
    department: Optional[List[str]] = None  # ["engineering", "sales"]
    location: Optional[str] = None
    country: Optional[str] = None
    email_status: Optional[str] = None
    has_email: Optional[bool] = None
    has_phone: Optional[bool] = None
    company_size: Optional[List[str]] = None  # ["1-10", "11-50"]
    tags: Optional[List[str]] = None
    page: int = 1
    per_page: int = 25
    sort_by: str = "created_at"
    sort_order: str = "desc"


class ContactBulkAction(BaseModel):
    contact_ids: List[int]
    action: str  # "add_to_list", "remove_from_list", "enroll_sequence", "export", "delete"
    target_id: Optional[int] = None  # list_id or sequence_id


class PaginatedContacts(BaseModel):
    contacts: List[ContactResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
