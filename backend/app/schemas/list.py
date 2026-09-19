from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ListCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#6366f1"
    icon: Optional[str] = "users"


class ListUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class ListResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    list_type: str
    color: str
    icon: str
    contact_count: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AddToListRequest(BaseModel):
    contact_ids: List[int]


class RemoveFromListRequest(BaseModel):
    contact_ids: List[int]
