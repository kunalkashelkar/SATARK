import uuid
from sqlalchemy import Column, String, Boolean, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class AnalyticalSignalModel(Base):
    __tablename__ = "analytical_signals"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    signal_id = Column(String(64), unique=True, nullable=False, index=True)
    engine_type = Column(String(64), nullable=False, index=True)
    engine_slug = Column(String(64), nullable=False, index=True)
    cse_id = Column(GUID, ForeignKey("cses.id", ondelete="CASCADE"), nullable=False, index=True)
    control_id = Column(GUID, ForeignKey("controls.id", ondelete="SET NULL"), nullable=True, index=True)
    assessment_id = Column(GUID, ForeignKey("assessment_cycles.id", ondelete="SET NULL"), nullable=True, index=True)
    finding_id = Column(String(64), nullable=True, index=True)
    priority = Column(String(16), default="MEDIUM", nullable=False, index=True)
    status = Column(String(32), default="CANDIDATE", nullable=False, index=True)
    title = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)
    expected = Column(Text, nullable=False)
    observed = Column(Text, nullable=False)
    difference = Column(Text, nullable=False)
    evidence_ids = Column(Text, nullable=True)  # JSON list
    recommended_for_sampling = Column(Boolean, default=False, nullable=False)
    rule_version = Column(String(64), nullable=False, default="1.0.0")
    control_version = Column(String(64), nullable=False, default="2026.3")
    model_version = Column(String(64), nullable=False, default="1.0.0")
    engine_version = Column(String(64), nullable=False, default="1.0.0")
    pipeline_version = Column(String(64), nullable=False, default="SAT-SA-2026.3")
    details = Column(Text, nullable=True)  # JSON of engine-specific attributes
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    cse = relationship("CSE", backref="analytical_signals")
    control = relationship("Control", backref="analytical_signals")
    assessment = relationship("AssessmentCycle", backref="analytical_signals")


class AnalysisJobModel(Base):
    __tablename__ = "analysis_jobs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    job_id = Column(String(64), unique=True, nullable=False, index=True)
    engine_slug = Column(String(64), nullable=False, index=True)
    status = Column(String(32), default="COMPLETED", nullable=False, index=True)  # PENDING, RUNNING, COMPLETED, FAILED
    parameters = Column(Text, nullable=True)  # JSON
    result_summary = Column(Text, nullable=True)  # JSON
    execution_time_ms = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
