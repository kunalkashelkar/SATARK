import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class Control(Base):
    __tablename__ = "controls"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    public_id = Column(String(32), unique=True, nullable=False, index=True)  # e.g. CTRL-07
    code = Column(String(64), unique=True, nullable=False, index=True)  # e.g. SOC.MON.07
    title = Column(String(255), nullable=False)
    domain = Column(String(64), nullable=False, index=True)
    severity = Column(String(16), default="HIGH", nullable=False, index=True)
    version = Column(String(32), default="2026.3", nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False, index=True)
    active = Column(Boolean, default=True, nullable=False, index=True)
    applicability = Column(String(128), default="All Critical Infrastructure SOCs", nullable=False)
    description = Column(Text, nullable=True)
    expected_capability = Column(Text, nullable=True)
    expected_outcomes = Column(Text, nullable=True)
    expected_evidence = Column(Text, nullable=True)
    assessment_criteria = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    applicabilities = relationship("ControlApplicability", back_populates="control", cascade="all, delete-orphan")


class ControlApplicability(Base):
    __tablename__ = "control_applicability"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    control_id = Column(GUID, ForeignKey("controls.id", ondelete="CASCADE"), nullable=False, index=True)
    cse_id = Column(GUID, ForeignKey("cses.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(GUID, ForeignKey("assessment_cycles.id", ondelete="SET NULL"), nullable=True, index=True)
    applicability_status = Column(String(32), default="APPLICABLE", nullable=False)  # APPLICABLE, EXEMPT, MODIFIED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    control = relationship("Control", back_populates="applicabilities")
    cse = relationship("CSE", back_populates="control_applicabilities")
    assessment = relationship("AssessmentCycle", back_populates="control_applicabilities")

    __table_args__ = (
        UniqueConstraint("control_id", "cse_id", "assessment_id", name="uq_control_cse_assessment"),
    )
