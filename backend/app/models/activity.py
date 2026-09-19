from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)

    activity_type = Column(String(50), nullable=False, index=True)
    # Types: email_sent, email_opened, email_clicked, email_replied, email_bounced,
    #        call_made, call_logged, note_added, task_created, task_completed,
    #        contact_created, contact_updated, list_added, sequence_enrolled,
    #        linkedin_connected, linkedin_messaged, meeting_scheduled

    subject = Column(String(500))
    body = Column(Text)
    extra_data = Column(JSON, default=dict)  # flexible extra data per activity type
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activities")
    contact = relationship("Contact", back_populates="activities")
