from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Sequence(Base):
    __tablename__ = "sequences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(20), default="draft")  # draft, active, paused, archived
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)

    # Sequence settings
    send_as_reply = Column(Boolean, default=False)
    track_opens = Column(Boolean, default=True)
    track_clicks = Column(Boolean, default=True)
    stop_on_reply = Column(Boolean, default=True)
    timezone = Column(String(50), default="America/New_York")
    send_window_start = Column(String(5), default="09:00")
    send_window_end = Column(String(5), default="17:00")
    send_days = Column(JSON, default=lambda: ["mon", "tue", "wed", "thu", "fri"])

    # Stats (denormalized for dashboard)
    total_enrolled = Column(Integer, default=0)
    total_replied = Column(Integer, default=0)
    total_bounced = Column(Integer, default=0)
    total_opened = Column(Integer, default=0)
    total_clicked = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="sequences")
    steps = relationship("SequenceStep", back_populates="sequence", cascade="all, delete-orphan",
                         order_by="SequenceStep.order")
    enrollments = relationship("SequenceEnrollment", back_populates="sequence", cascade="all, delete-orphan")


class SequenceStep(Base):
    __tablename__ = "sequence_steps"

    id = Column(Integer, primary_key=True, index=True)
    sequence_id = Column(Integer, ForeignKey("sequences.id", ondelete="CASCADE"), index=True)
    order = Column(Integer, nullable=False)
    step_type = Column(String(20), nullable=False)  # email, wait, task, linkedin_connect, linkedin_message
    delay_days = Column(Integer, default=0)
    delay_hours = Column(Integer, default=0)

    # Email step fields
    subject = Column(String(500))
    body = Column(Text)
    template_id = Column(Integer)

    # Task step fields
    task_note = Column(Text)
    task_type = Column(String(50))  # call, manual_email, linkedin, custom

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sequence = relationship("Sequence", back_populates="steps")


class SequenceEnrollment(Base):
    __tablename__ = "sequence_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    sequence_id = Column(Integer, ForeignKey("sequences.id", ondelete="CASCADE"), index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="CASCADE"), index=True)
    status = Column(String(20), default="active")  # active, paused, completed, replied, bounced, unsubscribed
    current_step = Column(Integer, default=0)
    next_action_at = Column(DateTime(timezone=True))
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

    sequence = relationship("Sequence", back_populates="enrollments")
    contact = relationship("Contact", back_populates="enrollments")
