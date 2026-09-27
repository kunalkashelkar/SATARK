import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    public_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. EV-1042
    cse_id = Column(GUID, ForeignKey("cses.id", ondelete="CASCADE"), nullable=False, index=True)
    control_id = Column(GUID, ForeignKey("controls.id", ondelete="SET NULL"), nullable=True, index=True)
    category = Column(String(64), default="SOC_LOG", nullable=False, index=True)
    state = Column(String(32), default="PRESENT", nullable=False, index=True)  # PRESENT, ABSENT_CONFIRMED, NOT_SUBMITTED, etc.
    validation_status = Column(String(32), default="PENDING_VALIDATION", nullable=False, index=True)  # VALID, INVALID, MAPPED, etc.
    sha256 = Column(String(64), nullable=False, index=True)
    source_system = Column(String(64), default="SIEM", nullable=False, index=True)
    source_event_id = Column(String(128), nullable=True)
    file_path = Column(String(255), nullable=True)
    file_size = Column(Integer, default=0, nullable=False)
    file_type = Column(String(16), default="PARQUET", nullable=False)
    received_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    cse = relationship("CSE", backref="evidences")
    control = relationship("Control", backref="evidences")
    provenance = relationship("EvidenceProvenance", back_populates="evidence", uselist=False, cascade="all, delete-orphan")
    control_links = relationship("EvidenceControlLink", back_populates="evidence", cascade="all, delete-orphan")


class EvidenceProvenance(Base):
    __tablename__ = "evidence_provenance"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    evidence_id = Column(GUID, ForeignKey("evidence.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    collector = Column(String(128), default="COL-02", nullable=False)
    transmission_token = Column(String(128), nullable=True)
    source_host = Column(String(128), nullable=True)
    source_ip = Column(String(64), nullable=True)
    signature = Column(String(255), nullable=True)
    custody_chain = Column(Text, nullable=True)
    received_by = Column(String(128), default="NCIIPC Automated Enclave Gateway", nullable=False)
    ingested_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    evidence = relationship("Evidence", back_populates="provenance")


class EvidenceControlLink(Base):
    __tablename__ = "evidence_control_links"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    evidence_id = Column(GUID, ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False, index=True)
    control_id = Column(GUID, ForeignKey("controls.id", ondelete="CASCADE"), nullable=False, index=True)
    mapping_type = Column(String(32), default="DIRECT", nullable=False)  # DIRECT, SUPPORTING, DERIVED
    confidence = Column(Float, default=1.0, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    evidence = relationship("Evidence", back_populates="control_links")
    control = relationship("Control")

    __table_args__ = (
        UniqueConstraint("evidence_id", "control_id", name="uq_evidence_control_link"),
    )
