import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class AssessmentCycle(Base):
    __tablename__ = "assessment_cycles"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    public_id = Column(String(32), unique=True, nullable=False, index=True)  # e.g. ASM-2026-Q3
    cse_id = Column(GUID, ForeignKey("cses.id", ondelete="CASCADE"), nullable=False, index=True)
    period = Column(String(32), nullable=False, index=True)  # e.g. 2026-Q3
    status = Column(String(32), default="IN_PROGRESS", nullable=False, index=True)
    evidence_readiness = Column(Float, default=0.0, nullable=False)
    controls_assessed = Column(Integer, default=0, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    assigned_examiner_id = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    cse = relationship("CSE", back_populates="assessment_cycles")
    assigned_examiner = relationship("User", foreign_keys=[assigned_examiner_id])
    control_applicabilities = relationship("ControlApplicability", back_populates="assessment")
