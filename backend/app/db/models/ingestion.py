import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    job_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. ING-2026-0927-01
    filename = Column(String(255), nullable=False)
    source = Column(String(64), nullable=False, index=True)  # SIEM, TICKETING, EDR, GATEWAY, etc.
    status = Column(String(32), default="PROCESSING", nullable=False, index=True)  # PROCESSING, COMPLETED, FAILED, PARTIAL
    rows_processed = Column(Integer, default=0, nullable=False)
    rows_rejected = Column(Integer, default=0, nullable=False)
    records_created = Column(Integer, default=0, nullable=False)
    records_updated = Column(Integer, default=0, nullable=False)
    sha256 = Column(String(64), nullable=True, index=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_summary = Column(Text, nullable=True)  # JSON or text summary of validation and row errors
    rejected_rows_sample = Column(Text, nullable=True)  # JSON array of sample rejected rows with reasons


class Asset(Base):
    __tablename__ = "assets"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    asset_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. ASSET-HMI-21
    cse_id = Column(String(32), nullable=False, index=True, default="CSE-014")
    asset_type = Column(String(64), nullable=False)
    environment = Column(String(32), nullable=False)  # OT, IT
    network_segment = Column(String(64), nullable=False, index=True)  # SEGMENT-OT-01
    criticality = Column(String(32), nullable=False, default="HIGH")  # CRITICAL, HIGH, MEDIUM
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class DeclaredCapability(Base):
    __tablename__ = "declared_capabilities"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    capability_id = Column(String(64), unique=True, nullable=False, index=True)  # CAP-001
    cse_id = Column(String(32), nullable=False, index=True)  # CSE-014
    control_id = Column(String(32), nullable=False, index=True)  # CTRL-07
    capability = Column(String(255), nullable=False)
    status = Column(String(32), default="DECLARED", nullable=False)
    source_document = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ReportedSOCMetric(Base):
    __tablename__ = "reported_soc_metrics"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    metric_id = Column(String(64), unique=True, nullable=False, index=True)  # MET-001
    cse_id = Column(String(32), nullable=False, index=True)
    period = Column(String(32), nullable=False, index=True)  # 2026-Q3
    metric = Column(String(128), nullable=False)
    reported_value = Column(Float, nullable=False)
    unit = Column(String(32), nullable=False)
    source = Column(String(128), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class OperationalCase(Base):
    __tablename__ = "operational_cases"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    case_id = Column(String(64), unique=True, nullable=False, index=True)  # CASE-3001
    alert_id = Column(String(64), nullable=True, index=True)  # ALR-7001
    cse_id = Column(String(32), nullable=False, index=True)  # CSE-014
    assigned_analyst = Column(String(128), nullable=True)
    alert_time = Column(DateTime(timezone=True), nullable=True)
    triage_time = Column(DateTime(timezone=True), nullable=True)
    investigation_time = Column(DateTime(timezone=True), nullable=True)
    escalation_time = Column(DateTime(timezone=True), nullable=True)
    closure_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(32), default="OPEN", nullable=False, index=True)  # ESCALATED, OPEN, CLOSED
    severity = Column(String(32), default="HIGH", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
