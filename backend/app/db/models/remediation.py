import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class Remediation(Base):
    __tablename__ = "remediations"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    remediation_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. REM-0038
    finding_id = Column(GUID, ForeignKey("findings.id", ondelete="CASCADE"), nullable=False, index=True)
    cse_id = Column(GUID, ForeignKey("cses.id", ondelete="CASCADE"), nullable=False, index=True)
    
    finding_public_id = Column(String(64), nullable=False, index=True)  # e.g. FND-0142
    cse_public_id = Column(String(64), nullable=False, index=True)      # e.g. CSE-014
    cse_name = Column(String(255), nullable=False)
    control_ref = Column(String(64), nullable=False)                    # e.g. CTRL-07 v3.2
    mandate_title = Column(String(255), nullable=False)
    action_summary = Column(Text, nullable=False)
    owner = Column(String(255), nullable=False)
    priority = Column(String(16), default="HIGH", nullable=False, index=True)  # CRITICAL, HIGH, MEDIUM, LOW
    due_date = Column(String(64), nullable=False)
    days_remaining = Column(Integer, default=14, nullable=False)
    evidence_progress = Column(String(32), default="0/3", nullable=False)
    
    # Lifecycle: OPEN -> IN_PROGRESS -> SUBMITTED -> UNDER_VERIFICATION -> CLOSED
    # Failure path: UNDER_VERIFICATION -> REOPENED
    status = Column(String(32), default="OPEN", nullable=False, index=True)
    reopen_reason = Column(Text, nullable=True)
    
    artifacts = Column(Text, default="[]", nullable=False)   # JSON array of { id, name, hash, status }
    milestones = Column(Text, default="[]", nullable=False)  # JSON array of { date, title, actor, detail, completed }
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    finding = relationship("Finding", backref="remediations")
    cse = relationship("CSE")
    finding_links = relationship("RemediationFinding", back_populates="remediation", cascade="all, delete-orphan")
    verification_results = relationship("VerificationResult", back_populates="remediation", cascade="all, delete-orphan")
    verification_gates = relationship("VerificationGate", back_populates="remediation", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="remediation")


class RemediationFinding(Base):
    __tablename__ = "remediation_findings"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    remediation_id = Column(GUID, ForeignKey("remediations.id", ondelete="CASCADE"), nullable=False, index=True)
    finding_id = Column(GUID, ForeignKey("findings.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    remediation = relationship("Remediation", back_populates="finding_links")
    finding = relationship("Finding")
