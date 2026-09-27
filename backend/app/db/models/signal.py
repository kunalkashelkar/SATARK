import uuid
from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class Signal(Base):
    __tablename__ = "signals"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    signal_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. SIG-2004, SIG-EG-01
    engine = Column(String(64), nullable=False, index=True)  # e.g. EXECUTION_GAP, execution-gap
    engine_version = Column(String(32), default="1.0.0", nullable=False)
    rule_version = Column(String(32), default="R-2.4", nullable=False)
    model_version = Column(String(32), nullable=True)  # e.g. MOD-BEHAV-01 or null
    pipeline_version = Column(String(32), default="v3.1.0", nullable=False)
    cse_id = Column(GUID, ForeignKey("cses.id", ondelete="CASCADE"), nullable=False, index=True)
    control_id = Column(GUID, ForeignKey("controls.id", ondelete="SET NULL"), nullable=True, index=True)
    priority = Column(String(16), default="MEDIUM", nullable=False, index=True)  # CRITICAL, HIGH, MEDIUM, LOW
    score = Column(Float, default=0.0, nullable=False)
    status = Column(String(32), default="CANDIDATE", nullable=False, index=True)  # CANDIDATE, UNDER_REVIEW, VALIDATED, DISMISSED
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    expected = Column(Text, nullable=False)
    observed = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    cse = relationship("CSE", backref="signals")
    control = relationship("Control", backref="signals")
    evidence_links = relationship("SignalEvidenceLink", back_populates="signal", cascade="all, delete-orphan")


class SignalEvidenceLink(Base):
    __tablename__ = "signal_evidence_links"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    signal_id = Column(GUID, ForeignKey("signals.id", ondelete="CASCADE"), nullable=False, index=True)
    evidence_id = Column(GUID, ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False, index=True)
    link_type = Column(String(32), default="PRIMARY", nullable=False)  # PRIMARY, SUPPORTING
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    signal = relationship("Signal", back_populates="evidence_links")
    evidence = relationship("Evidence")

    __table_args__ = (
        UniqueConstraint("signal_id", "evidence_id", name="uq_signal_evidence_link"),
    )


class FusedAssessmentContext(Base):
    __tablename__ = "fused_assessment_contexts"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    fusion_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. FUS-014-01
    cse_id = Column(GUID, ForeignKey("cses.id", ondelete="CASCADE"), nullable=False, index=True)
    control_id = Column(GUID, ForeignKey("controls.id", ondelete="SET NULL"), nullable=True, index=True)
    signal_ids = Column(Text, nullable=False)  # JSON array
    evidence_ids = Column(Text, nullable=False)  # JSON array
    confidence = Column(Float, default=1.0, nullable=False)
    rationale = Column(Text, nullable=False)
    historical_context = Column(Text, nullable=True)  # JSON
    peer_context = Column(Text, nullable=True)  # JSON
    process_context = Column(Text, nullable=True)  # JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    cse = relationship("CSE")
    control = relationship("Control")
