#!/usr/bin/env python3
"""
scripts/reset_operational_data.py

Authoritative reset script for the SAT-SA (Supervisory Analytics Tool for SOC Assessment).
Safely purges operational/transactional records while strictly preserving:
- Database schema and migration state
- User credentials and authentication profiles (lead_supervisor, lead_examiner)
- Security roles and permissions
- Statutory supervisory control specifications
- Analytical engine registries & system component versions

Also safely resets ClickHouse/DuckDB telemetry buffers and local runtime evidence storage.
"""

import os
import shutil
import sys

# Ensure backend root is on sys.path and is current working directory for sqlite relative path resolution
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)

from app.db.session import SessionLocal, active_db_url
from app.core.logging import logger
from app.db.models import (
    # Operational tables to reset
    AuditEvent,
    VerificationGate,
    VerificationResult,
    RemediationFinding,
    Remediation,
    SamplingItem,
    SamplingRun,
    FindingEvidenceLink,
    FindingSignalLink,
    Finding,
    SignalEvidenceLink,
    Signal,
    FusedAssessmentContext,
    AnalyticalSignalModel,
    AnalysisJobModel,
    EvidenceControlLink,
    EvidenceProvenance,
    Evidence,
    OperationalCase,
    ReportedSOCMetric,
    DeclaredCapability,
    Asset,
    IngestionJob,
    ControlApplicability,
    AssessmentCycle,
    CSE,
    # System configuration / auth tables to KEEP
    User,
    Role,
    Permission,
    Control,
    SystemVersion,
    RuleVersion,
    ModelVersion,
)
from app.evidence.clickhouse_adapter import clickhouse_adapter
from app.evidence.storage import EvidenceStorage


def reset_operational_data():
    logger.info("=================================================================")
    logger.info("   SAT-SA COMPLETE OPERATIONAL DATA RESET                       ")
    logger.info("=================================================================")
    logger.info(f"Target Database: {active_db_url}")

    db = SessionLocal()
    try:
        # Step 1: Count before reset
        findings_count = db.query(Finding).count()
        signals_count = db.query(Signal).count()
        evidence_count = db.query(Evidence).count()
        cses_count = db.query(CSE).count()
        remediations_count = db.query(Remediation).count()
        sampling_runs_count = db.query(SamplingRun).count()
        audit_events_count = db.query(AuditEvent).count()

        logger.info(
            f"Pre-reset counts: CSEs={cses_count}, Evidence={evidence_count}, "
            f"Signals={signals_count}, Findings={findings_count}, "
            f"Remediations={remediations_count}, SamplingRuns={sampling_runs_count}, "
            f"AuditEvents={audit_events_count}"
        )

        # Step 2: Delete operational records in strict foreign-key dependency order
        logger.info("Purging operational verification and remediation records...")
        db.query(VerificationGate).delete(synchronize_session=False)
        db.query(VerificationResult).delete(synchronize_session=False)
        db.query(RemediationFinding).delete(synchronize_session=False)
        db.query(Remediation).delete(synchronize_session=False)

        logger.info("Purging supervisory sampling runs and items...")
        db.query(SamplingItem).delete(synchronize_session=False)
        db.query(SamplingRun).delete(synchronize_session=False)

        logger.info("Purging supervisory findings and evidence linkages...")
        db.query(FindingEvidenceLink).delete(synchronize_session=False)
        db.query(FindingSignalLink).delete(synchronize_session=False)
        db.query(Finding).delete(synchronize_session=False)

        logger.info("Purging analytical signals and analysis jobs...")
        db.query(SignalEvidenceLink).delete(synchronize_session=False)
        db.query(Signal).delete(synchronize_session=False)
        db.query(FusedAssessmentContext).delete(synchronize_session=False)
        db.query(AnalyticalSignalModel).delete(synchronize_session=False)
        db.query(AnalysisJobModel).delete(synchronize_session=False)

        logger.info("Purging evidence records, provenance, and control links...")
        db.query(EvidenceControlLink).delete(synchronize_session=False)
        db.query(EvidenceProvenance).delete(synchronize_session=False)
        db.query(Evidence).delete(synchronize_session=False)

        logger.info("Purging ingestion jobs, operational cases, assets, and metrics...")
        db.query(OperationalCase).delete(synchronize_session=False)
        db.query(ReportedSOCMetric).delete(synchronize_session=False)
        db.query(DeclaredCapability).delete(synchronize_session=False)
        db.query(Asset).delete(synchronize_session=False)
        db.query(IngestionJob).delete(synchronize_session=False)

        logger.info("Purging CSE assessment cycles and entities...")
        db.query(ControlApplicability).delete(synchronize_session=False)
        db.query(AssessmentCycle).delete(synchronize_session=False)
        db.query(CSE).delete(synchronize_session=False)

        logger.info("Purging operational audit events...")
        db.query(AuditEvent).delete(synchronize_session=False)

        db.commit()
        logger.info("Database operational records successfully purged.")

        # Step 3: Verify preservation of core configuration and authentication
        users_count = db.query(User).count()
        roles_count = db.query(Role).count()
        perms_count = db.query(Permission).count()
        controls_count = db.query(Control).count()

        logger.info(
            f"Preserved Configuration & Auth: Users={users_count}, Roles={roles_count}, "
            f"Permissions={perms_count}, Controls={controls_count}"
        )

        # Step 4: Clear ClickHouse / DuckDB runtime telemetry buffers
        logger.info("Resetting ClickHouse / DuckDB telemetry buffer...")
        clickhouse_adapter._offline_buffer.clear()
        if clickhouse_adapter.is_available():
            try:
                clickhouse_adapter.query(
                    f"TRUNCATE TABLE IF EXISTS {clickhouse_adapter.database}.canonical_telemetry_events"
                )
                logger.info("ClickHouse canonical_telemetry_events table truncated.")
            except Exception as ch_exc:
                logger.warning(f"ClickHouse truncate notice: {ch_exc}")

        # Step 5: Clear runtime evidence filesystem storage
        evidence_root = os.path.abspath(EvidenceStorage.STORAGE_ROOT)
        logger.info(f"Clearing runtime evidence storage directory: {evidence_root}")
        if os.path.exists(evidence_root):
            for item in os.listdir(evidence_root):
                item_path = os.path.join(evidence_root, item)
                try:
                    if os.path.isdir(item_path):
                        shutil.rmtree(item_path)
                    elif os.path.isfile(item_path):
                        os.unlink(item_path)
                except Exception as fs_exc:
                    logger.warning(f"Could not remove {item_path}: {fs_exc}")
        os.makedirs(evidence_root, exist_ok=True)

        logger.info("=================================================================")
        logger.info("   OPERATIONAL DATA RESET COMPLETE: ALL OPERATIONAL DATA = 0    ")
        logger.info("=================================================================")

    except Exception as exc:
        db.rollback()
        logger.error(f"Operational data reset failed: {exc}")
        raise exc
    finally:
        db.close()


if __name__ == "__main__":
    reset_operational_data()
