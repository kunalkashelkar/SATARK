import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    verification_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. VRF-0038
    remediation_id = Column(GUID, ForeignKey("remediations.id", ondelete="CASCADE"), nullable=False, index=True)
    finding_id = Column(GUID, ForeignKey("findings.id", ondelete="SET NULL"), nullable=True, index=True)
    cse_id = Column(GUID, ForeignKey("cses.id", ondelete="CASCADE"), nullable=False, index=True)

    mandate_public_id = Column(String(64), nullable=False, index=True)  # e.g. REM-0038
    finding_public_id = Column(String(64), nullable=False, index=True)  # e.g. FND-0142
    cse_public_id = Column(String(64), nullable=False, index=True)      # e.g. CSE-014
    cse_name = Column(String(255), nullable=False)
    control_id = Column(String(64), nullable=False)                     # e.g. CTRL-07 v3.2
    cycle = Column(String(32), default="Q3 2026", nullable=False)
    lead_examiner = Column(String(128), default="NC-8802 (Lead Examiner)", nullable=False)
    statutory_standard = Column(String(255), default="NCIIPC Framework Sec 12(a)", nullable=False)
    submitted_at = Column(String(64), nullable=False)
    evaluated_at = Column(String(64), nullable=True)
    
    # Verdict: VERIFIED_SEALED, UNDER_SUPERVISORY_REVIEW, DEFICIENT_REOPENED, EVIDENCE_LOCKED
    verification_verdict = Column(String(64), default="EVIDENCE_LOCKED", nullable=False, index=True)
    confidence_score = Column(Integer, default=70, nullable=False)
    evidence_completeness = Column(Integer, default=67, nullable=False)
    merkle_root_hash = Column(String(128), nullable=False)
    remedial_summary = Column(Text, nullable=False)
    supervisory_rationale = Column(Text, nullable=False)
    
    # Submitted artifacts JSON array of { id, name, hash, verified }
    submitted_artifacts = Column(Text, default="[]", nullable=False)
    
    # Pass/Fail evaluation
    pass_fail = Column(String(16), default="PENDING", nullable=False)  # PASS, FAIL, PENDING
    failure_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    remediation = relationship("Remediation", back_populates="verification_results")
    finding = relationship("Finding")
    cse = relationship("CSE")
    gates = relationship("VerificationGate", back_populates="verification_result", cascade="all, delete-orphan")


class VerificationGate(Base):
    __tablename__ = "verification_gates"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    gate_id = Column(String(64), nullable=False, index=True)  # e.g. gate-1, gate-2
    verification_result_id = Column(GUID, ForeignKey("verification_results.id", ondelete="CASCADE"), nullable=False, index=True)
    remediation_id = Column(GUID, ForeignKey("remediations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    gate_type = Column(String(64), default="DOCUMENTARY_VERIFICATION", nullable=False)
    # DOCUMENTARY_VERIFICATION, TECHNICAL_RETEST, EXAMINER_REVIEW, EVIDENCE_REQUIREMENT, PROCESS_CONFORMANCE
    label = Column(String(255), nullable=False)
    verified = Column(Boolean, default=False, nullable=False)
    required = Column(Boolean, default=True, nullable=False)
    note = Column(Text, nullable=True)
    evidence_requirement = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    verification_result = relationship("VerificationResult", back_populates="gates")
    remediation = relationship("Remediation", back_populates="verification_gates")
