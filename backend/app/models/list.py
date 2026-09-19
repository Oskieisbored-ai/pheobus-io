from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ContactList(Base):
    __tablename__ = "contact_lists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    list_type = Column(String(20), default="static")  # static, dynamic
    dynamic_filters = Column(Text)  # JSON filter config for dynamic lists
    color = Column(String(7), default="#6366f1")  # hex color tag
    icon = Column(String(50), default="users")
    contact_count = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="lists")
    members = relationship("ListMember", back_populates="contact_list", cascade="all, delete-orphan")


class ListMember(Base):
    __tablename__ = "list_members"

    id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("contact_lists.id", ondelete="CASCADE"), index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="CASCADE"), index=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    contact_list = relationship("ContactList", back_populates="members")
    contact = relationship("Contact", back_populates="list_memberships")
