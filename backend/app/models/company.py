from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    domain = Column(String(255), unique=True, index=True)
    logo_url = Column(String(512))
    industry = Column(String(100), index=True)
    sub_industry = Column(String(100))
    description = Column(Text)
    short_description = Column(String(500))

    # Size & financials
    employee_count = Column(Integer)
    employee_range = Column(String(50))  # "1-10", "11-50", "51-200", etc.
    revenue_range = Column(String(50))   # "$1M-$10M", "$10M-$50M", etc.
    annual_revenue = Column(Integer)
    founded_year = Column(Integer)

    # Location
    headquarters_city = Column(String(100))
    headquarters_state = Column(String(100))
    headquarters_country = Column(String(100), index=True)
    full_address = Column(String(500))

    # Online presence
    website_url = Column(String(512))
    linkedin_url = Column(String(512))
    twitter_url = Column(String(512))
    facebook_url = Column(String(512))
    crunchbase_url = Column(String(512))

    # Tech & tags
    tech_stack = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    keywords = Column(JSON, default=list)
    sic_codes = Column(JSON, default=list)
    naics_codes = Column(JSON, default=list)

    # Funding
    total_funding = Column(Integer)
    latest_funding_round = Column(String(50))
    latest_funding_amount = Column(Integer)
    investors = Column(JSON, default=list)

    # Meta
    source = Column(String(50))  # "scrape", "api", "user", "enrichment"
    data_quality_score = Column(Integer, default=0)  # 0-100
    last_enriched_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    contacts = relationship("Contact", back_populates="company")
