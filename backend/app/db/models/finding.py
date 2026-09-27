import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class Finding(Base):
    __tablename__ = "findings"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    public_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. FND-0142, FND-021
    cse_id = Column(GUID, ForeignKey("cses.id", ondelete="CASCADE"), nullable=False, index=True)
    control_id = Column(GUID, ForeignKey("controls.id", ondelete="SET NULL"), nullable=True, index=True)
    assessment_id = Column(GUID, ForeignKey("assessment_cycles.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    why_flagged = Column(Text, nullable=False)
    signal_type = Column(String(64), nullable=False, index=True)  # EXECUTION_GAP, NEGATIVE_SPACE, etc.
    priority = Column(String(16), default="HIGH", nullable=False, index=True)  # CRITICAL, HIGH, MEDIUM, LOW
    evidence_strength = Column(String(16), default="HIGH", nullable=False)  # HIGH, MEDIUM, LOW
    completeness = Column(Integer, default=75, nullable=False)
    uncertainty = Column(String(16), default="LOW", nullable=False)  # LOW, MEDIUM, HIGH
    status = Column(String(32), default="CANDIDATE", nullable=False, index=True)  # CANDIDATE, UNDER_REVIEW, VALIDATED, QUALIFIED, REJECTED, OVERRIDDEN
    expected_state = Column(Text, nullable=False)
    observed_state = Column(Text, nullable=False)
    gap_summary = Column(Text, nullable=False)
    decision_notes = Column(Text, nullable=True)
    decision_reason = Column(Text, nullable=True)
    decided_by = Column(String(128), nullable=True)
    decided_at = Column(DateTime(timezone=True), nullable=True)
    rule_version = Column(String(32), default="R-2.4", nullable=False)
    control_version = Column(String(32), default="CTRL-v3.2", nullable=False)
    analytics_engine_version = Column(String(32), default="AN-1.8", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    cse = relationship("CSE", backref="findings")
    control = relationship("Control", backref="findings")
    assessment = relationship("AssessmentCycle", backref="findings")
    signal_links = relationship("FindingSignalLink", back_populates="finding", cascade="all, delete-orphan")
    evidence_links = relationship("FindingEvidenceLink", back_populates="finding", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="finding", cascade="all, delete-orphan")


class FindingSignalLink(Base):
    __tablename__ = "finding_signal_links"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    finding_id = Column(GUID, ForeignKey("findings.id", ondelete="CASCADE"), nullable=False, index=True)
    signal_id = Column(GUID, ForeignKey("signals.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    finding = relationship("Finding", back_populates="signal_links")
    signal = relationship("Signal")

    __table_args__ = (
        UniqueConstraint("finding_id", "signal_id", name="uq_finding_signal_link"),
    )


class FindingEvidenceLink(Base):
    __tablename__ = "finding_evidence_links"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    finding_id = Column(GUID, ForeignKey("findings.id", ondelete="CASCADE"), nullable=False, index=True)
    evidence_id = Column(GUID, ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False, index=True)
    relevance = Column(String(32), default="PRIMARY", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    finding = relationship("Finding", back_populates="evidence_links")
    evidence = relationship("Evidence")

    __table_args__ = (
        UniqueConstraint("finding_id", "evidence_id", name="uq_finding_evidence_link"),
    )


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    event_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. AUD-9912
    actor_id = Column(String(64), nullable=True, index=True)  # e.g. USR-001 or NC-8802
    finding_id = Column(GUID, ForeignKey("findings.id", ondelete="SET NULL"), nullable=True, index=True)
    remediation_id = Column(GUID, ForeignKey("remediations.id", ondelete="SET NULL"), nullable=True, index=True)
    target_type = Column(String(32), default="FINDING", nullable=False)
    target_id = Column(String(64), nullable=True)
    entity_type = Column(String(64), default="FINDING", nullable=False, index=True)
    entity_id = Column(String(64), nullable=True, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    examiner_badge = Column(String(128), nullable=True, default="SYSTEM")
    action = Column(String(64), nullable=False, index=True)  # LOGIN_SUCCESS, ACCESS_DENIED, FINDING_VALIDATED, etc.
    before = Column(Text, nullable=True)  # JSON before state
    after = Column(Text, nullable=True)   # JSON after state
    previous_status = Column(String(32), nullable=True)
    new_status = Column(String(32), nullable=True)
    reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    request_id = Column(String(64), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    finding = relationship("Finding", back_populates="audit_events")
    remediation = relationship("Remediation", back_populates="audit_events")
    user = relationship("User")
