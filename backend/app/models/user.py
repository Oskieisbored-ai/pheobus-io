from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    plan = Column(String(50), default="free")  # free, pro, enterprise
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    members = relationship("User", back_populates="workspace")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    avatar_url = Column(String(512))
    role = Column(String(50), default="member")  # admin, member
    is_active = Column(Boolean, default=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    workspace = relationship("Workspace", back_populates="members")
    lists = relationship("ContactList", back_populates="owner")
    sequences = relationship("Sequence", back_populates="owner")
    activities = relationship("Activity", back_populates="user")
