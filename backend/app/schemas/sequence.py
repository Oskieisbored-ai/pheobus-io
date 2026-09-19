from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SequenceStepCreate(BaseModel):
    step_type: str  # email, wait, task, linkedin_connect, linkedin_message
    delay_days: int = 0
    delay_hours: int = 0
    subject: Optional[str] = None
    body: Optional[str] = None
    task_note: Optional[str] = None
    task_type: Optional[str] = None


class SequenceStepResponse(BaseModel):
    id: int
    order: int
    step_type: str
    delay_days: int
    delay_hours: int
    subject: Optional[str] = None
    body: Optional[str] = None
    task_note: Optional[str] = None
    task_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SequenceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    steps: List[SequenceStepCreate] = []
    send_window_start: str = "09:00"
    send_window_end: str = "17:00"
    send_days: List[str] = ["mon", "tue", "wed", "thu", "fri"]
    track_opens: bool = True
    track_clicks: bool = True
    stop_on_reply: bool = True


class SequenceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    send_window_start: Optional[str] = None
    send_window_end: Optional[str] = None
    send_days: Optional[List[str]] = None


class SequenceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: str
    owner_id: int
    total_enrolled: int
    total_replied: int
    total_bounced: int
    total_opened: int
    total_clicked: int
    steps: List[SequenceStepResponse] = []
    send_window_start: str
    send_window_end: str
    send_days: list
    track_opens: bool
    track_clicks: bool
    stop_on_reply: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EnrollContactsRequest(BaseModel):
    contact_ids: List[int]
