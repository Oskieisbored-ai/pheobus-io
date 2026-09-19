from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)

    # Identity
    first_name = Column(String(100), nullable=False, index=True)
    last_name = Column(String(100), nullable=False, index=True)
    full_name = Column(String(200), index=True)
    headline = Column(String(300))
    avatar_url = Column(String(512))

    # Contact info
    email = Column(String(255), index=True)
    email_status = Column(String(20), default="unknown")  # verified, unverified, invalid, catch-all
    email_confidence = Column(Float, default=0.0)  # 0.0 - 1.0
    personal_email = Column(String(255))
    phone = Column(String(50))
    phone_type = Column(String(20))  # mobile, direct, hq
    mobile_phone = Column(String(50))
    work_phone = Column(String(50))

    # Professional
    title = Column(String(200), index=True)
    seniority = Column(String(50), index=True)  # c_suite, vp, director, manager, senior, entry
    department = Column(String(100), index=True)  # engineering, sales, marketing, hr, finance, etc.
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    company_name = Column(String(255), index=True)  # denormalized for speed

    # Location
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), index=True)

    # Online presence
    linkedin_url = Column(String(512))
    twitter_url = Column(String(512))
    github_url = Column(String(512))
    personal_website = Column(String(512))

    # Enrichment data
    skills = Column(JSON, default=list)
    education = Column(JSON, default=list)  # [{school, degree, field, year}]
    work_history = Column(JSON, default=list)  # [{company, title, start, end}]
    languages = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    bio = Column(Text)

    # Scoring & intent
    lead_score = Column(Integer, default=0)
    intent_signals = Column(JSON, default=list)

    # Meta
    source = Column(String(50))  # "linkedin", "hunter", "scrape", "user", "enrichment"
    source_url = Column(String(512))
    is_verified = Column(Boolean, default=False)
    data_quality_score = Column(Integer, default=0)
    last_enriched_at = Column(DateTime(timezone=True))
    last_contacted_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="contacts")
    list_memberships = relationship("ListMember", back_populates="contact")
    enrollments = relationship("SequenceEnrollment", back_populates="contact")
    activities = relationship("Activity", back_populates="contact")
