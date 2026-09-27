import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class SamplingRun(Base):
    __tablename__ = "sampling_runs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    run_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. SRUN-2026-001
    title = Column(String(255), nullable=False)
    sampling_parameters = Column(Text, nullable=False)  # JSON: sector, tier, risk, anomaly_presence, sample_size
    algorithm_version = Column(String(32), default="v1.2.0", nullable=False)
    random_seed = Column(Integer, nullable=True)
    status = Column(String(32), default="COMPLETED", nullable=False)
    created_by_id = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_by_name = Column(String(128), default="Lead Supervisor", nullable=False)
    total_items = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    created_by = relationship("User")
    items = relationship("SamplingItem", back_populates="run", cascade="all, delete-orphan")


class SamplingItem(Base):
    __tablename__ = "sampling_items"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    item_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. SMP-001
    run_id = Column(GUID, ForeignKey("sampling_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    case_id = Column(String(64), nullable=False, index=True)  # e.g. CASE-014-CTRL07
    cse_id = Column(GUID, ForeignKey("cses.id", ondelete="CASCADE"), nullable=False, index=True)
    control_id = Column(GUID, ForeignKey("controls.id", ondelete="SET NULL"), nullable=True, index=True)
    finding_id = Column(GUID, ForeignKey("findings.id", ondelete="SET NULL"), nullable=True, index=True)
    
    cse_public_id = Column(String(64), nullable=False, index=True)  # e.g. CSE-014
    cse_name = Column(String(255), nullable=False)
    control_ref = Column(String(64), nullable=False)  # e.g. CTRL-07
    priority = Column(String(16), default="HIGH", nullable=False, index=True)  # CRITICAL, HIGH, MEDIUM, LOW
    methodology = Column(String(32), default="RISK_BASED", nullable=False, index=True)
    # RISK_BASED, EVIDENCE_BASED, COVERAGE_BASED, RECURRENCE_BASED, ANOMALY_BASED, PEER_BASED, BASELINE_RANDOM
    sampling_reason = Column(Text, nullable=False)
    evidence_strength = Column(String(16), default="HIGH", nullable=False)  # HIGH, MEDIUM, LOW
    evidence_status = Column(String(32), default="PRESENT", nullable=False)  # PRESENT, NOT_SUBMITTED, etc.
    status = Column(String(32), default="RECOMMENDED", nullable=False, index=True)  # RECOMMENDED, SELECTED, EXAMINED
    selected = Column(Boolean, default=False, nullable=False)
    assessment_period = Column(String(32), default="Q3 2026", nullable=False)
    signals = Column(Text, default="[]", nullable=False)  # JSON array of string signal types
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    run = relationship("SamplingRun", back_populates="items")
    cse = relationship("CSE")
    control = relationship("Control")
    finding = relationship("Finding")
