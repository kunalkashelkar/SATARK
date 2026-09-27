import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class User(Base):
    __tablename__ = "users"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    public_id = Column(String(32), unique=True, nullable=False, index=True)  # e.g. USR-001
    username = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, nullable=False, index=True)
    badge = Column(String(64), nullable=True)
    organization = Column(String(128), default="NCIIPC", nullable=False)
    role_id = Column(GUID, ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False, index=True)
    status = Column(String(20), default="ACTIVE", nullable=False, index=True)
    mfa_type = Column(String(64), default="FIPS-140-2 L3 Smartcard", nullable=False)
    hashed_password = Column(String(255), nullable=True)
    last_activity_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    role = relationship("Role", back_populates="users")
