import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class CSE(Base):
    __tablename__ = "cses"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    public_id = Column(String(32), unique=True, nullable=False, index=True)  # e.g. CSE-014
    name = Column(String(128), nullable=False, index=True)
    sector = Column(String(64), nullable=False, index=True)
    organization_type = Column(String(64), nullable=False, default="Critical Sector Entity")
    location = Column(String(128), nullable=False, default="India")
    tier = Column(String(16), nullable=False, default="TIER-1", index=True)
    soc_type = Column(String(64), nullable=False, default="Hybrid 24x7 SOC")
    claimed_capability = Column(Integer, default=24, nullable=False)
    observed_capability = Column(Integer, default=19, nullable=False)
    evidence_readiness = Column(Float, default=0.0, nullable=False)
    readiness_category = Column(String(20), default="Acceptable", nullable=False)
    supervisory_priority = Column(String(20), default="HIGH", nullable=False, index=True)
    status = Column(String(32), default="Under Review", nullable=False, index=True)
    primary_signal = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    assessment_cycles = relationship("AssessmentCycle", back_populates="cse", cascade="all, delete-orphan")
    control_applicabilities = relationship("ControlApplicability", back_populates="cse", cascade="all, delete-orphan")
