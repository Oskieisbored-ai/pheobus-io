from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    workspace_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    role: str
    workspace_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()
