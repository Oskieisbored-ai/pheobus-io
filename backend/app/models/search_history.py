from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    search_type = Column(String(20), nullable=False)  # people, companies
    query_text = Column(String(500))
    filters = Column(JSON, default=dict)
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
