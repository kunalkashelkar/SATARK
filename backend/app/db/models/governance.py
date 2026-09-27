import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from sqlalchemy.sql import func
from app.db.session import Base
from app.db.guid import GUID


class SystemVersion(Base):
    __tablename__ = "system_versions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    version = Column(String(32), unique=True, nullable=False, index=True)  # e.g. "3.2.0"
    release_name = Column(String(128), nullable=False)  # e.g. "Apex Supervisor"
    component = Column(String(64), default="SAT_SA_CORE", nullable=False)
    status = Column(String(32), default="ACTIVE", nullable=False)  # ACTIVE, SUPERSEDED, DEPRECATED
    changelog = Column(Text, nullable=True)
    git_commit = Column(String(64), nullable=True)
    deployed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class RuleVersion(Base):
    __tablename__ = "rule_versions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    rule_id = Column(String(64), nullable=False, index=True)  # e.g. "R-EG-01"
    engine_slug = Column(String(64), nullable=False, index=True)  # e.g. "execution-gap"
    version = Column(String(32), nullable=False)  # e.g. "2.4.0"
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    logic_hash = Column(String(64), nullable=True)  # SHA-256 of rule logic/spec
    parameters = Column(Text, nullable=True)  # JSON dictionary of thresholds/params
    status = Column(String(32), default="ACTIVE", nullable=False)  # ACTIVE, SUPERSEDED, DRAFT
    effective_from = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    model_id = Column(String(64), nullable=False, index=True)  # e.g. "MOD-BEHAV-01"
    name = Column(String(255), nullable=False)
    version = Column(String(32), nullable=False)  # e.g. "1.2.0"
    framework = Column(String(64), nullable=False)  # e.g. "IsolationForest", "LightGBM", "Statistical/ZScore"
    weights_hash = Column(String(64), nullable=True)  # SHA-256 of frozen model weights
    hyperparameters = Column(Text, nullable=True)  # JSON dictionary
    status = Column(String(32), default="PRODUCTION", nullable=False)  # PRODUCTION, STAGING, RETIRED
    trained_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    run_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. "PIP-2026-0927-01"
    pipeline_name = Column(String(128), default="SUPERVISORY_FULL_CYCLE", nullable=False)
    pipeline_version = Column(String(32), default="v3.1.0", nullable=False)
    trigger = Column(String(64), default="SCHEDULED", nullable=False)  # SCHEDULED, MANUAL, EVENT
    status = Column(String(32), default="SUCCESS", nullable=False)  # SUCCESS, FAILED, RUNNING
    cse_count = Column(Integer, default=0, nullable=False)
    signals_generated = Column(Integer, default=0, nullable=False)
    execution_time_ms = Column(Float, default=0.0, nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
