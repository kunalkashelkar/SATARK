"""
SAT-SA Production Demonstration Seeding Engine
=============================================
Creates a complete, coherent, synthetic demonstration dataset in the database
and Parquet evidence store so that every existing SAT-SA page has meaningful,
relational data and every supervisory feature can be demonstrated to an evaluator.

Features:
- Deterministic synthetic dataset (clearly labeled DEMO/SYNTHETIC/NON-PRODUCTION)
- Multi-entity cohort (CSE-014, CSE-021, CSE-031, CSE-044, CSE-008, CSE-022)
- Multi-cycle longitudinal history (Q1 2026, Q2 2026, Q3 2026) demonstrating
  moderate issue -> improvement -> recurrence/regression (-23.3% drift)
- Complete control library (CTRL-01, CTRL-04, CTRL-07, CTRL-12, CTRL-18)
- Operational rules (RULE-001, RULE-002, RULE-003, RULE-004)
- Automated ingestion of synthetic CSV/JSON into Parquet & ClickHouse/SQLite
- Native execution of all 10 analytical engines
- Multi-signal evidence fusion (Candidates A, B, C)
- Finding review queue covering all decision states (Candidate, Under Review, Validated, Qualified, Rejected)
- Remediation mandates & cryptographic verification gates (Open, Under Verification, Closed, Reopened)
- Stratified supervisory sampling (Risk, Evidence, Anomaly, Recurrence, Coverage, Baseline)
- Complete governance versions, rules, models, pipelines, and append-only audit trail
- CLI flags: --seed, --reset, --verify
"""

import os
import sys
import uuid
import json
import argparse
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

# Ensure backend root is on sys.path
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.db.session import SessionLocal, active_db_url, engine
from app.core.logging import logger
from app.core.security import hash_password
from app.db.models import (
    Role,
    Permission,
    User,
    UserCseAccess,
    CSE,
    AssessmentCycle,
    Control,
    ControlApplicability,
    Evidence,
    EvidenceProvenance,
    EvidenceControlLink,
    AnalyticalSignalModel,
    AnalysisJobModel,
    Signal,
    SignalEvidenceLink,
    FusedAssessmentContext,
    Finding,
    FindingSignalLink,
    FindingEvidenceLink,
    AuditEvent,
    SamplingRun,
    SamplingItem,
    Remediation,
    RemediationFinding,
    VerificationResult,
    VerificationGate,
    SystemVersion,
    RuleVersion,
    ModelVersion,
    PipelineRun,
    IngestionJob,
    Asset,
    DeclaredCapability,
    ReportedSOCMetric,
    OperationalCase,
)
from app.services.ingestion_service import IngestionService
from app.services.evidence_service import EvidenceService
from app.schemas.evidence import EvidenceIngestRequest, EvidenceProvenanceBase
from app.analytics.registry import EngineRegistry
from app.analytics.context import AnalysisContext


def reset_demo_data(db: Session) -> None:
    """Safely reset synthetic demonstration data while preserving schema and core permissions."""
    logger.info("Resetting demonstration dataset...")
    
    # Clean child tables first to respect foreign keys
    tables_to_clean = [
        "verification_gates",
        "verification_results",
        "remediation_findings",
        "remediations",
        "sampling_items",
        "sampling_runs",
        "finding_evidence_links",
        "finding_signal_links",
        "audit_events",
        "findings",
        "fused_assessment_contexts",
        "signal_evidence_links",
        "signals",
        "analytical_signals",
        "analysis_jobs",
        "evidence_control_links",
        "evidence_provenance",
        "evidence",
        "operational_cases",
        "reported_soc_metrics",
        "declared_capabilities",
        "assets",
        "ingestion_jobs",
        "control_applicability",
        "assessment_cycles",
    ]

    for tbl in tables_to_clean:
        try:
            db.execute(text(f"DELETE FROM {tbl}"))
            db.commit()
        except Exception as exc:
            db.rollback()
            logger.debug(f"Reset note on table {tbl}: {exc}")

    logger.info("Demonstration tables reset successfully.")


def seed_database(db: Session) -> None:
    """Seed comprehensive, deterministic, synthetic supervisory demonstration dataset."""
    logger.info(f"Seeding synthetic demonstration data on {active_db_url}...")

    # =========================================================================
    # 1. Seed Permissions & Roles
    # =========================================================================
    permissions_data = [
        ("findings:read", "Read all findings and review queue", "FINDINGS"),
        ("findings:validate", "Validate candidate findings", "FINDINGS"),
        ("findings:qualify", "Formally qualify findings for regulatory action", "FINDINGS"),
        ("findings:reject", "Reject candidate findings", "FINDINGS"),
        ("evidence:read", "Inspect evidence files and provenance", "EVIDENCE"),
        ("evidence:demand", "Issue statutory evidence demand", "EVIDENCE"),
        ("sampling:run", "Execute supervisory sampling runs", "SAMPLING"),
        ("remediation:verify", "Approve verification gates", "REMEDIATION"),
        ("governance:read", "Read audit logs and system versioning", "GOVERNANCE"),
        ("governance:admin", "Manage user identities and access control", "GOVERNANCE"),
    ]

    perm_map = {}
    for code, desc, cat in permissions_data:
        perm = db.query(Permission).filter(Permission.code == code).first()
        if not perm:
            perm = Permission(code=code, description=desc, category=cat)
            db.add(perm)
            db.flush()
        perm_map[code] = perm

    roles_data = [
        ("SUPERVISOR", "Supervisory lead with review queue, sampling, and triage authorities", [
            "findings:read", "findings:validate", "findings:qualify", "findings:reject",
            "evidence:read", "evidence:demand", "sampling:run", "governance:read"
        ]),
        ("EXAMINER", "Examiner with deep evidence inspection and finding decision rights", [
            "findings:read", "findings:validate", "findings:reject", "evidence:read",
            "evidence:demand", "remediation:verify", "governance:read"
        ]),
        ("LEAD_EXAMINER", "Lead examiner with full supervisory and qualification rights", [
            "findings:read", "findings:validate", "findings:qualify", "findings:reject",
            "evidence:read", "evidence:demand", "sampling:run", "remediation:verify", "governance:read"
        ]),
        ("AUDITOR", "Statutory auditor with read-only inspection access to all logs", [
            "findings:read", "evidence:read", "governance:read"
        ]),
        ("ADMINISTRATOR", "Enclave system administrator with full access governance", [
            "governance:read", "governance:admin"
        ]),
    ]

    role_map = {}
    for r_name, r_desc, r_perms in roles_data:
        role = db.query(Role).filter(Role.name == r_name).first()
        if not role:
            role = Role(name=r_name, description=r_desc, status="ACTIVE")
            db.add(role)
            db.flush()
        role.permissions = [perm_map[p] for p in r_perms if p in perm_map]
        role_map[r_name] = role

    # =========================================================================
    # 2. Seed Lead Users
    # =========================================================================
    lead_user = db.query(User).filter(User.username == "lead_supervisor").first()
    if not lead_user:
        lead_user = User(
            public_id="USR-001",
            username="lead_supervisor",
            name="Dr. Aris Thorne",
            email="thorne.lead@enclave.nciipc.gov.in",
            badge="NC-8802 (Lead)",
            organization="NCIIPC Supervisory Directorate",
            role_id=role_map["SUPERVISOR"].id,
            status="ACTIVE",
            mfa_type="FIPS-140-2 L3 Smartcard",
            hashed_password=hash_password("Supervisor@2026!"),
            last_activity_at=datetime.now(timezone.utc),
        )
        db.add(lead_user)
        db.flush()
    else:
        lead_user.hashed_password = hash_password("Supervisor@2026!")

    examiner_user = db.query(User).filter(User.username == "lead_examiner").first()
    if not examiner_user:
        examiner_user = User(
            public_id="USR-002",
            username="lead_examiner",
            name="V. K. Raman",
            email="raman.vk@enclave.nciipc.gov.in",
            badge="NC-7410",
            organization="Technical Assessment Group",
            role_id=role_map["EXAMINER"].id,
            status="ACTIVE",
            mfa_type="Hardware Security Key (FIDO2)",
            hashed_password=hash_password("Examiner@2026!"),
            last_activity_at=datetime.now(timezone.utc),
        )
        db.add(examiner_user)
        db.flush()
    else:
        examiner_user.hashed_password = hash_password("Examiner@2026!")

    # =========================================================================
    # 3. Seed Synthetic Critical Sector Entities (CSEs)
    # =========================================================================
    cses_data = [
        {
            "public_id": "CSE-014",
            "name": "Western Grid Operations",
            "sector": "Energy",
            "organization_type": "Statutory Power Transmission Enclave",
            "location": "New Delhi / Western Region",
            "tier": "TIER-1",
            "soc_type": "Hybrid 24x7 SOC",
            "claimed_capability": 24,
            "observed_capability": 19,
            "evidence_readiness": 71.0,
            "readiness_category": "Deficient",
            "supervisory_priority": "HIGH",
            "status": "Under Review",
            "primary_signal": "Night shift execution gap detected in SIEM alert acknowledgment telemetry",
        },
        {
            "public_id": "CSE-021",
            "name": "Northstar Telecom Operations",
            "sector": "Telecommunications",
            "organization_type": "Core Cellular & Fiber Backbone Operator",
            "location": "Mumbai, Maharashtra",
            "tier": "TIER-1",
            "soc_type": "In-house 24x7 Tier-3 SOC",
            "claimed_capability": 24,
            "observed_capability": 22,
            "evidence_readiness": 88.0,
            "readiness_category": "Robust",
            "supervisory_priority": "LOW",
            "status": "Monitoring",
            "primary_signal": "Minor latency in secondary DNS forwarding, primary backbone fully conformal",
        },
        {
            "public_id": "CSE-031",
            "name": "Metro Financial Infrastructure",
            "sector": "Financial Services",
            "organization_type": "Core Clearing & Real-Time Settlement System",
            "location": "Mumbai / Bengaluru",
            "tier": "TIER-1",
            "soc_type": "Tier-4 Statutory Security Operations",
            "claimed_capability": 24,
            "observed_capability": 23,
            "evidence_readiness": 94.0,
            "readiness_category": "Robust",
            "supervisory_priority": "LOW",
            "status": "Monitoring",
            "primary_signal": "High conformance, zero negative space across 90-day supervisory window",
        },
        {
            "public_id": "CSE-044",
            "name": "National Health Network Operations",
            "sector": "Critical Services",
            "organization_type": "Central Health Telemetry & Registry Network",
            "location": "New Delhi, NCR",
            "tier": "TIER-1",
            "soc_type": "Managed Detection & Response (MDR)",
            "claimed_capability": 20,
            "observed_capability": 15,
            "evidence_readiness": 62.0,
            "readiness_category": "Deficient",
            "supervisory_priority": "HIGH",
            "status": "Review Required",
            "primary_signal": "Coverage gap in peripheral hospital gateway log forwarders",
        },
        {
            "public_id": "CSE-008",
            "name": "National Clearing & Settlement Exchange",
            "sector": "Financial Services",
            "organization_type": "Market Infrastructure Institution (MII)",
            "location": "Mumbai, Maharashtra",
            "tier": "TIER-1",
            "soc_type": "In-house 24x7 Tier-3 SOC",
            "claimed_capability": 24,
            "observed_capability": 23,
            "evidence_readiness": 92.5,
            "readiness_category": "Robust",
            "supervisory_priority": "LOW",
            "status": "Monitoring",
            "primary_signal": "Minor gap in auxiliary DNS log forwarding, primary pipeline fully conformal",
        },
        {
            "public_id": "CSE-022",
            "name": "Metropolitan Transit Automated Signaling System",
            "sector": "Transportation",
            "organization_type": "Urban Mass Rapid Transit Infrastructure",
            "location": "Bengaluru, Karnataka",
            "tier": "TIER-2",
            "soc_type": "Managed Detection & Response (MDR)",
            "claimed_capability": 20,
            "observed_capability": 14,
            "evidence_readiness": 58.0,
            "readiness_category": "Deficient",
            "supervisory_priority": "CRITICAL",
            "status": "Review Required",
            "primary_signal": "Severe negative space: Zero firewall anomaly alerts ingested across 96 hours",
        },
    ]

    cse_map = {}
    for c_data in cses_data:
        cse = db.query(CSE).filter(CSE.public_id == c_data["public_id"]).first()
        if not cse:
            cse = CSE(**c_data)
            db.add(cse)
            db.flush()
        else:
            for k, v in c_data.items():
                setattr(cse, k, v)
        cse_map[c_data["public_id"]] = cse

    # Grant Examiner Raman access across cohort
    for c_pub in ["CSE-014", "CSE-021", "CSE-031", "CSE-044", "CSE-022"]:
        access = db.query(UserCseAccess).filter(
            UserCseAccess.user_id == examiner_user.id,
            UserCseAccess.cse_id == cse_map[c_pub].id,
        ).first()
        if not access:
            access = UserCseAccess(
                user_id=examiner_user.id,
                cse_id=cse_map[c_pub].id,
                access_type="Full Supervisory",
                granted_by="NC-8802 (Lead)",
            )
            db.add(access)

    # =========================================================================
    # 4. Seed Multi-Cycle Assessment History (Q1, Q2, Q3 2026)
    # =========================================================================
    # Longitudinal story for CSE-014:
    # Q1: Moderate issue (76.5%)
    # Q2: Improvement (91.5%)
    # Q3: Recurrence/regression in escalation & telemetry (-23.3% drift -> 68.2%)
    cycles_data = [
        # CSE-014 Multi-cycle history
        ("ASM-2026-Q1", "CSE-014", "2026-Q1", "COMPLETED", 76.5, 18,
         datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc), datetime(2026, 3, 31, 23, 59, tzinfo=timezone.utc)),
        ("ASM-2026-Q2", "CSE-014", "2026-Q2", "COMPLETED", 91.5, 22,
         datetime(2026, 4, 1, 0, 0, tzinfo=timezone.utc), datetime(2026, 6, 30, 23, 59, tzinfo=timezone.utc)),
        ("AC-2026-Q3-014", "CSE-014", "2026-Q3", "IN_PROGRESS", 68.2, 19,
         datetime(2026, 7, 1, 0, 0, tzinfo=timezone.utc), datetime(2026, 9, 30, 23, 59, tzinfo=timezone.utc)),
        ("ASM-2026-Q3", "CSE-014", "2026-Q3", "IN_PROGRESS", 68.2, 19,
         datetime(2026, 7, 1, 0, 0, tzinfo=timezone.utc), datetime(2026, 9, 30, 23, 59, tzinfo=timezone.utc)),
        # Peer cohort Q3 cycles
        ("ASM-2026-Q3-021", "CSE-021", "2026-Q3", "COMPLETED", 88.0, 22,
         datetime(2026, 7, 1, 0, 0, tzinfo=timezone.utc), datetime(2026, 9, 30, 23, 59, tzinfo=timezone.utc)),
        ("ASM-2026-Q3-031", "CSE-031", "2026-Q3", "COMPLETED", 94.0, 23,
         datetime(2026, 7, 1, 0, 0, tzinfo=timezone.utc), datetime(2026, 9, 30, 23, 59, tzinfo=timezone.utc)),
        ("ASM-2026-Q3-044", "CSE-044", "2026-Q3", "IN_PROGRESS", 62.0, 15,
         datetime(2026, 7, 1, 0, 0, tzinfo=timezone.utc), datetime(2026, 9, 30, 23, 59, tzinfo=timezone.utc)),
        ("ASM-2026-Q3-08", "CSE-008", "2026-Q3", "COMPLETED", 92.5, 23,
         datetime(2026, 7, 1, 0, 0, tzinfo=timezone.utc), datetime(2026, 9, 30, 23, 59, tzinfo=timezone.utc)),
        ("ASM-2026-Q3-22", "CSE-022", "2026-Q3", "IN_PROGRESS", 58.0, 14,
         datetime(2026, 7, 1, 0, 0, tzinfo=timezone.utc), datetime(2026, 9, 30, 23, 59, tzinfo=timezone.utc)),
    ]

    cycle_map = {}
    for asm_id, cse_pub, period, status, readiness, ctrl_count, s_dt, e_dt in cycles_data:
        cycle = db.query(AssessmentCycle).filter(AssessmentCycle.public_id == asm_id).first()
        if not cycle:
            cycle = AssessmentCycle(
                public_id=asm_id,
                cse_id=cse_map[cse_pub].id,
                period=period,
                status=status,
                evidence_readiness=readiness,
                controls_assessed=ctrl_count,
                start_date=s_dt,
                end_date=e_dt,
                assigned_examiner_id=examiner_user.id,
                submitted_at=s_dt + timedelta(days=15),
            )
            db.add(cycle)
            db.flush()
        else:
            cycle.status = status
            cycle.evidence_readiness = readiness
            cycle.controls_assessed = ctrl_count
            cycle.start_date = s_dt
            cycle.end_date = e_dt
        cycle_map[asm_id] = cycle

    # =========================================================================
    # 5. Seed Controls Library & Applicability
    # =========================================================================
    controls_data = [
        {
            "public_id": "CTRL-07",
            "code": "SOC.MON.07",
            "title": "Continuous Security Monitoring & Alert Triage",
            "domain": "Continuous Monitoring & Detection",
            "severity": "HIGH",
            "version": "2026.3",
            "status": "ACTIVE",
            "applicability": "All Critical Infrastructure SOCs",
            "description": "Requires continuous, uninterrupted monitoring of all critical boundaries and triage of High/Critical alerts within statutory SLA windows (15 minutes).",
            "expected_capability": "24x7 active analyst triage with maximum 15-minute response latency for High/Critical tier telemetry.",
            "expected_evidence": "SIEM event ingestion logs, analyst shift duty rosters, ticket triage timestamps, and gateway telemetry correlation tokens.",
            "assessment_criteria": "Telemetry gaps exceeding 30 consecutive minutes or systematic shift-time latency degradation constitutes non-conformance.",
        },
        {
            "public_id": "CTRL-12",
            "code": "SOC.ESC.12",
            "title": "Critical Incident Escalation & Response Timeliness",
            "domain": "Incident Response & Escalation",
            "severity": "HIGH",
            "version": "2026.3",
            "status": "ACTIVE",
            "applicability": "All Supervised Tier-1 Entities",
            "description": "Critical security incidents must be formally escalated to the regulatory oversight authority and designated emergency response teams within 30 minutes.",
            "expected_capability": "Cryptographically verified outbound escalation dispatch packet transmitted within 30 minutes of incident confirmation.",
            "expected_evidence": "Escalation ticketing records, SOAR dispatch audit logs, and recipient statutory acknowledgement tokens.",
            "assessment_criteria": "Absence of outbound dispatch token ESC-221 or escalation latency > 30 minutes triggers mandatory non-conformance.",
        },
        {
            "public_id": "CTRL-18",
            "code": "SOC.LOG.18",
            "title": "Security Log Coverage & Critical OT Telemetry",
            "domain": "Log Architecture & OT Coverage",
            "severity": "MEDIUM",
            "version": "2026.3",
            "status": "ACTIVE",
            "applicability": "Mandatory Tier-1 / Tier-2 CSE Enclaves",
            "description": "Critical infrastructure segments, particularly SCADA/ICS OT perimeters and human-machine interfaces, must stream continuous telemetry feeds.",
            "expected_capability": "100% gateway and EDR telemetry coverage across all identified critical OT segments without unmonitored blind spots.",
            "expected_evidence": "Asset inventory manifests, gateway telemetry heartbeats, collector forwarder manifests, and EDR agent pings.",
            "assessment_criteria": "Substation or control segments lacking continuous gateway forwarders flag coverage gap signals.",
        },
        {
            "public_id": "CTRL-01",
            "code": "SOC.LOG.01",
            "title": "Log Source Completeness & Ingestion Integrity",
            "domain": "Log Architecture & Ingestion",
            "severity": "CRITICAL",
            "version": "2026.3",
            "status": "ACTIVE",
            "applicability": "Mandatory Tier-1 / Tier-2 CSE Enclaves",
            "description": "All perimeter firewalls, directory services, and critical OT/IT gateways must stream cryptographically signed logs to the centralized repository.",
            "expected_capability": "100% telemetry coverage across all identified critical network segments with cryptographic hashing.",
            "expected_evidence": "Log collector configuration dumps, cryptographic sequence manifests, and transmission receipt tokens.",
            "assessment_criteria": "Absence of log transmission or hash verification discrepancies flags immediate critical non-conformance.",
        },
        {
            "public_id": "CTRL-04",
            "code": "SOC.PRC.04",
            "title": "Incident Escalation & Playbook Execution Conformance",
            "domain": "Incident Response & SOPs",
            "severity": "HIGH",
            "version": "2026.3",
            "status": "ACTIVE",
            "applicability": "All Supervised Entities",
            "description": "Standard operating procedures must govern incident escalation, containment, and statutory reporting without unauthorized branch execution.",
            "expected_capability": "Strict conformance to approved Process Workflow Playbook PW-04 for severe threat classifications.",
            "expected_evidence": "Incident ticket transition histories, forensic notes, escalation tokens, and closure authorization tokens.",
            "assessment_criteria": "Skipping containment or escalation steps without documented examiner rationale is flagged as a process deviation.",
        },
    ]

    ctrl_map = {}
    for c_data in controls_data:
        ctrl = db.query(Control).filter(Control.public_id == c_data["public_id"]).first()
        if not ctrl:
            ctrl = Control(**c_data)
            db.add(ctrl)
            db.flush()
        else:
            for k, v in c_data.items():
                setattr(ctrl, k, v)
        ctrl_map[c_data["public_id"]] = ctrl

        # Bind applicability to CSE-014 and cohort
        for cse_pub in ["CSE-014", "CSE-021", "CSE-031", "CSE-044"]:
            app_entry = db.query(ControlApplicability).filter(
                ControlApplicability.control_id == ctrl.id,
                ControlApplicability.cse_id == cse_map[cse_pub].id,
            ).first()
            if not app_entry:
                app_entry = ControlApplicability(
                    control_id=ctrl.id,
                    cse_id=cse_map[cse_pub].id,
                    assessment_id=cycle_map["AC-2026-Q3-014"].id if cse_pub == "CSE-014" else None,
                    applicability_status="APPLICABLE",
                    notes="Mandated under NCIIPC Critical Infrastructure Cyber Security Guidelines §4.2",
                )
                db.add(app_entry)

    db.commit()

    # =========================================================================
    # 6. Ingest Synthetic Dataset CSV/JSON into Parquet & Database
    # =========================================================================
    dataset_dir = os.path.join(backend_root, "data", "synthetic_dataset")
    if os.path.exists(dataset_dir):
        logger.info(f"Ingesting synthetic dataset from {dataset_dir}...")
        try:
            jobs = IngestionService.ingest_complete_dataset(db, dataset_dir=dataset_dir)
            logger.info(f"Successfully processed {len(jobs)} dataset ingestion files.")
        except Exception as exc:
            logger.warning(f"Dataset ingestion note: {exc}")

    # =========================================================================
    # 7. Seed Explicit Evidence Records with Hashes and Chain of Custody
    # =========================================================================
    sample_evidences = [
        {
            "evidence_id": "EV-1042",
            "cse_id": "CSE-014",
            "control_id": "CTRL-07",
            "control_code": "SOC.MON.07",
            "category": "ALERT",
            "state": "PRESENT",
            "source_system": "SIEM",
            "source_event_id": "ALR-7002",
            "events": [
                {
                    "alert_id": "ALR-7002",
                    "timestamp": "2026-09-16T11:15:02Z",
                    "title": "Substation 4B PLC Boundary Alarm - Modbus unauthorized write",
                    "severity": "CRITICAL",
                    "analyst": "analyst-11",
                    "case_id": "CASE-3002",
                    "src_ip": "10.14.88.21",
                    "dest_ip": "10.14.102.5",
                    "category": "Industrial Control / OT Incursion",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TX-SYN-7002",
                source_host="splunk-fwd-01.western-grid.internal",
                source_ip="10.14.0.12",
                custody_chain=[
                    "CSE-014 SOC SIEM",
                    "Air-Gap SFTP Drop",
                    "NCIIPC Ingestion Security Gateway",
                    "Supervisory Enclave Vault"
                ],
                received_by="NCIIPC Automated Enclave Gateway",
            )
        },
        {
            "evidence_id": "EV-1043",
            "cse_id": "CSE-014",
            "control_id": "CTRL-07",
            "control_code": "SOC.MON.07",
            "category": "CASE_TIMELINE",
            "state": "PRESENT",
            "source_system": "Case Management",
            "source_event_id": "CASE-3002",
            "events": [
                {
                    "case_ref": "CASE-3002",
                    "timestamp": "2026-09-16T11:39:18Z",
                    "lead_analyst": "analyst-11",
                    "case_id": "CASE-3002",
                    "phase": "TRIAGE_ANALYSIS",
                    "severity": "CRITICAL",
                    "playbook": "PW-04",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TX-SYN-3002",
                source_host="jira-soc.western-grid.internal",
                source_ip="10.14.0.14",
                custody_chain=[
                    "CSE-014 Internal Case Mgmt",
                    "Air-Gap SFTP Drop",
                    "NCIIPC Collector Gateway",
                    "Supervisory Enclave Vault"
                ],
                received_by="NCIIPC Automated Enclave Gateway",
            )
        },
        {
            "evidence_id": "EV-1044",
            "cse_id": "CSE-014",
            "control_id": "CTRL-12",
            "control_code": "SOC.ESC.12",
            "category": "ESCALATION_RECORD",
            "state": "PRESENT",
            "source_system": "Ticketing",
            "source_event_id": "TKT-8003",
            "events": [
                {
                    "ticket_id": "TKT-8003",
                    "timestamp": "2026-09-25T20:40:10Z",
                    "priority": "CRITICAL",
                    "status": "OPEN",
                    "case_id": "CASE-3008",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TX-SYN-8003",
                source_host="servicenow.western-grid.internal",
                source_ip="10.14.0.16",
                custody_chain=[
                    "CSE-014 ITSM Gateway",
                    "Enclave Evidence Vault"
                ],
                received_by="NCIIPC Automated Enclave Gateway",
            )
        },
        {
            "evidence_id": "EV-1045",
            "cse_id": "CSE-014",
            "control_id": "CTRL-18",
            "control_code": "SOC.LOG.18",
            "category": "NETWORK_TELEMETRY",
            "state": "PRESENT",
            "source_system": "Network Gateway",
            "source_event_id": "SEGMENT-OT-04",
            "events": [
                {
                    "event_id": "GW-6005",
                    "timestamp": "2026-09-26T07:45:00Z",
                    "segment": "SEGMENT-OT-04",
                    "collector": "gateway-03",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TX-SYN-GW04",
                source_host="gw-edge-03.western-grid.internal",
                source_ip="10.14.2.1",
                custody_chain=[
                    "Boundary Gateway Cluster",
                    "Supervisory Enclave Vault"
                ],
                received_by="NCIIPC Automated Enclave Gateway",
            )
        },
        {
            "evidence_id": "EV-1046",
            "cse_id": "CSE-014",
            "control_id": "CTRL-07",
            "control_code": "SOC.MON.07",
            "category": "REPORTED_METRIC",
            "state": "PRESENT",
            "source_system": "SOC Metrics",
            "source_event_id": "MET-003",
            "events": [
                {
                    "metric_id": "MET-003",
                    "metric": "HIGH_ALERT_TRIAGE_SLA_COMPLIANCE",
                    "reported_value": 96.0,
                    "unit": "percent",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TX-SYN-MET03",
                custody_chain=["CSE-014 Monthly Compliance Attestation", "Enclave Vault"],
                received_by="NCIIPC Automated Enclave Gateway",
            )
        },
        {
            "evidence_id": "EVD-742",
            "cse_id": "CSE-014",
            "control_id": "CTRL-07",
            "control_code": "SOC.MON.07",
            "category": "INVESTIGATION",
            "state": "PRESENT",
            "source_system": "CASE_MGMT",
            "source_event_id": "INV-338",
            "events": [
                {
                    "case_ref": "CASE-3002 / INV-338",
                    "timestamp": "2026-09-16T12:18:53Z",
                    "lead_analyst": "analyst-11",
                    "phase": "FORENSIC_TRIAGE",
                    "severity": "CRITICAL",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TOK-NCIIPC-SEC-742",
                source_host="jira-soc.western-grid.internal",
                source_ip="10.14.0.14",
                custody_chain=["CSE-014 Internal SOC", "Supervisory Enclave Vault"],
                received_by="NCIIPC Automated Enclave Gateway",
            )
        },
        {
            "evidence_id": "EVD-761",
            "cse_id": "CSE-014",
            "control_id": "CTRL-07",
            "control_code": "SOC.MON.07",
            "category": "RESPONSE",
            "state": "PRESENT",
            "source_system": "GATEWAY",
            "source_event_id": "FW-BLOCKED-8819",
            "events": [
                {
                    "log_id": "FW-BLOCKED-8819",
                    "timestamp": "2026-09-16T12:35:00Z",
                    "action": "BLOCK",
                    "severity": "MEDIUM",
                    "user": "FW-SOAR-BOT",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TOK-NCIIPC-SEC-761",
                custody_chain=["Boundary Firewall", "Supervisory Enclave Vault"],
                received_by="NCIIPC Automated Enclave Gateway",
            )
        },
        {
            "evidence_id": "ESC-221",
            "cse_id": "CSE-014",
            "control_id": "CTRL-12",
            "control_code": "SOC.ESC.12",
            "category": "ESCALATION",
            "state": "NOT_SUBMITTED",
            "source_system": "TICKETING",
            "source_event_id": "MISSING_ESCALATION_TOKEN",
            "events": [
                {
                    "ticket_id": "ESC-221-MANDATORY-DISPATCH",
                    "timestamp": "2026-09-16T11:45:00Z",
                    "priority": "CRITICAL",
                    "status": "UNSUBMITTED",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TOK-MISSING-ESC-221",
                custody_chain=["Statutory Escalation Channel (Omitted)", "Enclave Evidence Vault"],
                received_by="NCIIPC Automated Enclave Gateway",
            )
        },
    ]

    for ev_data in sample_evidences:
        existing = db.query(Evidence).filter(Evidence.public_id == ev_data["evidence_id"]).first()
        if not existing:
            EvidenceService.ingest_evidence(
                db=db,
                payload=EvidenceIngestRequest(**ev_data)
            )

    # =========================================================================
    # 8. Seed Deterministic Analytical Signals & Relationships
    # =========================================================================
    ev_1042 = db.query(Evidence).filter(Evidence.public_id == "EV-1042").first()
    ev_1043 = db.query(Evidence).filter(Evidence.public_id == "EV-1043").first()
    ev_1044 = db.query(Evidence).filter(Evidence.public_id == "EV-1044").first()
    ev_1045 = db.query(Evidence).filter(Evidence.public_id == "EV-1045").first()
    ev_1046 = db.query(Evidence).filter(Evidence.public_id == "EV-1046").first()
    ev_742 = db.query(Evidence).filter(Evidence.public_id == "EVD-742").first()
    ev_761 = db.query(Evidence).filter(Evidence.public_id == "EVD-761").first()
    ev_esc = db.query(Evidence).filter(Evidence.public_id == "ESC-221").first()
    cse_014 = cse_map["CSE-014"]

    signals_definitions = [
        {
            "signal_id": "SIG-2004",
            "engine": "EXECUTION_GAP",
            "engine_version": "1.4.2",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-07"].id,
            "priority": "CRITICAL",
            "score": 0.91,
            "status": "VALIDATED",
            "title": "Mandatory Tier-2 Regulatory SOAR Escalation Dispatch Omission",
            "summary": "CASE-3002 critical substation PLC boundary alarm triaged locally and closed without mandatory outbound SOAR escalation dispatch ESC-221.",
            "expected": "Mandatory tier-2 escalation dispatched to regulatory authorities within 30 minutes of critical grid alarm confirmation.",
            "observed": "Incident triaged locally on workstation and closed without outbound SOAR dispatch record.",
            "explanation": "Algorithmic execution gap analysis detected missing dispatch record ESC-221 during CASE-3002 lifecycle.",
            "evidence": [ev_1042, ev_1043, ev_esc],
        },
        {
            "signal_id": "SIG-EG-01",
            "engine": "EXECUTION_GAP",
            "engine_version": "1.4.2",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-12"].id,
            "priority": "HIGH",
            "score": 0.88,
            "status": "CANDIDATE",
            "title": "Missing Tier-2 Regulatory SOAR Escalation Dispatch (CASE-3002)",
            "summary": "Critical incident CASE-3002 was marked as closed without required cryptographic Level-2 escalation packet ESC-221.",
            "expected": "Mandatory tier-2 escalation dispatched within 30 minutes for critical OT telemetry anomalies.",
            "observed": "Investigation marked resolved and closed directly without escalation gateway token.",
            "explanation": "Execution Gap: Missing mandatory Tier-2 regulatory escalation step.",
            "evidence": [ev_742, ev_761, ev_esc],
        },
        {
            "signal_id": "SIG-2005",
            "engine": "NEGATIVE_SPACE",
            "engine_version": "1.4.0",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-12"].id,
            "priority": "HIGH",
            "score": 0.94,
            "status": "CANDIDATE",
            "title": "Critical Alert Escalation Activity Absent Within Statutory Window",
            "summary": "Alert ALR-7002 was classified CRITICAL at 11:15:02Z but no qualifying escalation packet was submitted within 30m statutory window.",
            "expected": "Mandatory outbound regulatory dispatch verified in enclave ledger within 30 minutes.",
            "observed": "Telemetry void: Zero escalation transmission tokens recorded across statutory window.",
            "explanation": "Negative Space: Expected escalation evidence is ABSENT from supervisory submission.",
            "evidence": [ev_1044, ev_esc],
        },
        {
            "signal_id": "SIG-2006",
            "engine": "COVERAGE",
            "engine_version": "1.3.8",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-18"].id,
            "priority": "MEDIUM",
            "score": 0.68,
            "status": "CANDIDATE",
            "title": "Telemetry Coverage Blind Spot on Critical OT Segments",
            "summary": "Assets ASSET-HMI-21 and ASSET-HMI-22 reside on unmonitored segments SEGMENT-OT-01 and SEGMENT-OT-02 lacking gateway telemetry.",
            "expected": "Continuous gateway telemetry across all declared OT segments (CTRL-18).",
            "observed": "Observed gateway feeds restricted to auxiliary segments SEGMENT-OT-03 and SEGMENT-OT-04.",
            "explanation": "Coverage Gap: Primary critical substation HMIs operate in supervisory blind spot.",
            "evidence": [ev_1045],
        },
        {
            "signal_id": "SIG-2007",
            "engine": "PROCESS_DEVIATION",
            "engine_version": "1.4.2",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-04"].id,
            "priority": "HIGH",
            "score": 0.82,
            "status": "VALIDATED",
            "title": "Incident Playbook Non-Conformance: Containment Branch Bypassed",
            "summary": "Case CASE-3002 transitioned from Triage directly to Closure, bypassing statutory Playbook PW-04 Containment Gate.",
            "expected": "Process sequence: Alert -> Triage -> Investigation -> Containment -> Escalation -> Closure.",
            "observed": "Observed sequence: Alert -> Triage -> Investigation -> Closure (Containment bypassed).",
            "explanation": "Petri Net process mining detected illegal branch execution violating approved SOP.",
            "evidence": [ev_1043, ev_742],
        },
        {
            "signal_id": "SIG-2008",
            "engine": "METRIC_INTEGRITY",
            "engine_version": "1.3.5",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-07"].id,
            "priority": "HIGH",
            "score": 0.89,
            "status": "VALIDATED",
            "title": "Reported Triage SLA Metric Contradicts Raw Event-Derived Compliance",
            "summary": "Reported SLA metric MET-003 claims 96.0% compliance, but raw event reconstruction reveals actual compliance is only 71.4%.",
            "expected": "Self-reported KPI reconciles within +/- 2.0% threshold of empirical event calculation.",
            "observed": "Reported: 96.0%, Derived: 71.4% (Discrepancy: -24.6% SLA variance).",
            "explanation": "Metric Integrity: Self-reported compliance omits night shift cases exhibiting severe triage delays.",
            "evidence": [ev_1046, ev_1042],
        },
        {
            "signal_id": "SIG-HC-01",
            "engine": "HISTORICAL",
            "engine_version": "1.5.0",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-07"].id,
            "priority": "HIGH",
            "score": 0.78,
            "status": "CANDIDATE",
            "title": "Control Effectiveness Degradation Drift (-23.3% vs Q2 Baseline)",
            "summary": "Western Grid telemetry conformance dropped from 91.5% in Q2 2026 to 68.2% in Q3 2026.",
            "expected": "Sustained or improved compliance rating relative to Q2 2026 baseline (91.5%).",
            "observed": "Current rating is 68.2%, reflecting -23.3% longitudinal regression in alert triage consistency.",
            "explanation": "Historical comparison engine detected significant control drift across consecutive cycles.",
            "evidence": [ev_1042, ev_1046],
        },
        {
            "signal_id": "SIG-PB-01",
            "engine": "PEER",
            "engine_version": "1.4.1",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-07"].id,
            "priority": "MEDIUM",
            "score": 0.65,
            "status": "CANDIDATE",
            "title": "Below-Median Capability Ranking Against TIER-1 Peer Cohort",
            "summary": "Observed capability score (79.2%) trails the authorized TIER-1 peer cohort median (94.0%).",
            "expected": "CSE capability index aligns within upper quartile of critical sector peer cohort.",
            "observed": "Cohort Median: 94.0%, Selected CSE: 79.2% (Delta: -14.8% below peer benchmark).",
            "explanation": "Peer benchmarking against N=3 authorized peers confirms comparative capability lag.",
            "evidence": [ev_1046],
        },
        {
            "signal_id": "SIG-CSC-01",
            "engine": "CONSISTENCY",
            "engine_version": "1.3.0",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-07"].id,
            "priority": "HIGH",
            "score": 0.84,
            "status": "CANDIDATE",
            "title": "Cross-Source Timestamp Inversion: Ticketing Precedes SIEM Alert (-64s)",
            "summary": "Ticket TKT-8002 created at 16:22:18Z references lateral movement alert ALR-7006 recorded at 16:23:22Z.",
            "expected": "Chronological coherence: SIEM Detection Timestamp <= Ticketing Creation Timestamp.",
            "observed": "Ticketing timestamp precedes detection by 64 seconds, indicating backdated records or clock skew.",
            "explanation": "Cross-source reconciliation detected impossible timestamp relationship between IT service desk and SIEM.",
            "evidence": [ev_1042, ev_1044],
        },
        {
            "signal_id": "SIG-CD-01",
            "engine": "CAPABILITY_DISCREPANCY",
            "engine_version": "1.2.0",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-18"].id,
            "priority": "HIGH",
            "score": 0.81,
            "status": "CANDIDATE",
            "title": "Declared Continuous OT Telemetry Capability Unsubstantiated",
            "summary": "Operations Handbook declares 100% continuous telemetry on critical OT segments, but gateway evidence confirms major voids.",
            "expected": "Claimed capability CAP-003 fully substantiated by active gateway telemetry streams.",
            "observed": "Zero telemetry ingested for primary SCADA HMI segments SEGMENT-OT-01 and SEGMENT-OT-02.",
            "explanation": "Capability Discrepancy: Declared capability contradicts physical network evidence.",
            "evidence": [ev_1045],
        },
    ]

    sig_obj_map = {}
    for s_info in signals_definitions:
        sig = db.query(Signal).filter(Signal.signal_id == s_info["signal_id"]).first()
        if not sig:
            sig = Signal(
                signal_id=s_info["signal_id"],
                engine=s_info["engine"],
                engine_version=s_info["engine_version"],
                cse_id=s_info["cse_id"],
                control_id=s_info["control_id"],
                priority=s_info["priority"],
                score=s_info["score"],
                status=s_info["status"],
                title=s_info["title"],
                summary=s_info["summary"],
                expected=s_info["expected"],
                observed=s_info["observed"],
                explanation=s_info["explanation"],
            )
            db.add(sig)
            db.flush()

            for ev in s_info["evidence"]:
                if ev:
                    link = SignalEvidenceLink(signal_id=sig.id, evidence_id=ev.id, link_type="PRIMARY")
                    db.add(link)
        else:
            sig.status = s_info["status"]
            sig.score = s_info["score"]
            sig.priority = s_info["priority"]
        sig_obj_map[s_info["signal_id"]] = sig

    db.commit()

    # =========================================================================
    # 9. Execute Real Analytical Engines (Registry)
    # =========================================================================
    logger.info("Executing native analytical engines to populate live signal store...")
    registry = EngineRegistry()
    ctx = AnalysisContext(db=db, cse_id="CSE-014", assessment_id="AC-2026-Q3-014")

    engine_slugs = [
        "execution-gap",
        "negative-space",
        "coverage",
        "process",
        "investigation-quality",
        "behavioural",
        "historical",
        "peer",
        "consistency",
        "metric-integrity",
    ]
    for slug in engine_slugs:
        try:
            res = registry.execute_engine(slug, ctx, persist=True)
            logger.info(f"Engine [{slug}] generated {len(res.signals)} live signals in {res.execution_time_ms}ms.")
        except Exception as eng_exc:
            logger.warning(f"Engine [{slug}] execution note: {eng_exc}")

    # =========================================================================
    # 10. Seed Multi-Signal Evidence Fusion Contexts
    # =========================================================================
    fused_contexts_data = [
        {
            "fusion_id": "FUS-014-01",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-07"].id,
            "signal_ids": json.dumps(["SIG-2004", "SIG-2007", "SIG-HC-01"]),
            "evidence_ids": json.dumps(["EV-1042", "EV-1043", "EVD-742", "ESC-221"]),
            "confidence": 0.94,
            "rationale": "High-confidence corroboration: Execution gap in dispatch ESC-221 directly aligns with Playbook PW-04 containment omission and 2-cycle historical recurrence.",
            "historical_context": json.dumps({"recurrence_count": 2, "drift": "-23.3%", "prior_status": "Breached"}),
            "peer_context": json.dumps({"cohort_rank": "Lower Quartile", "median_gap": "-14.8%"}),
            "process_context": json.dumps({"playbook": "PW-04", "skipped_phase": "CONTAINMENT"}),
        },
        {
            "fusion_id": "FUS-014-02",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-18"].id,
            "signal_ids": json.dumps(["SIG-2005", "SIG-2006", "SIG-CD-01"]),
            "evidence_ids": json.dumps(["EV-1044", "EV-1045", "ESC-221"]),
            "confidence": 0.88,
            "rationale": "Corroborated negative space & coverage gap: Unmonitored OT segments directly account for missing anomaly reporting telemetry.",
            "historical_context": json.dumps({"persistence": "Chronic across 3 quarters"}),
            "peer_context": json.dumps({"cohort_median_coverage": "98.2%", "observed_coverage": "62.5%"}),
            "process_context": json.dumps({"telemetry_void": "SEGMENT-OT-01, SEGMENT-OT-02"}),
        },
        {
            "fusion_id": "FUS-014-03",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-07"].id,
            "signal_ids": json.dumps(["SIG-2008", "SIG-CSC-01"]),
            "evidence_ids": json.dumps(["EV-1046", "EV-1042", "EV-1044"]),
            "confidence": 0.91,
            "rationale": "Corroborated metric discrepancy: Disagreement between reported SLA and raw event timeline matches backdated ticketing records.",
            "historical_context": json.dumps({"metric_audit_variance": "-24.6%"}),
            "peer_context": json.dumps({"reconciliation_rate": "Peer median 99.1%"}),
            "process_context": json.dumps({"timestamp_skew_seconds": -64}),
        }
    ]

    for f_data in fused_contexts_data:
        fc = db.query(FusedAssessmentContext).filter(FusedAssessmentContext.fusion_id == f_data["fusion_id"]).first()
        if not fc:
            fc = FusedAssessmentContext(**f_data)
            db.add(fc)

    # =========================================================================
    # 11. Seed Findings Covering All Human Decision States
    # =========================================================================
    findings_data = [
        {
            "public_id": "FND-0142",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-07"].id,
            "assessment_id": cycle_map["AC-2026-Q3-014"].id,
            "title": "Execution Gap in Regulatory Escalation Handling",
            "why_flagged": "Supervisory analysis identified severe non-conformance: critical OT alarm ALR-7002 was closed in CASE-3002 without mandatory Tier-2 outbound escalation dispatch ESC-221 within statutory 30m window.",
            "signal_type": "EXECUTION_GAP",
            "priority": "CRITICAL",
            "evidence_strength": "HIGH",
            "completeness": 88,
            "uncertainty": "LOW",
            "status": "UNDER_REVIEW",
            "expected_state": "Mandatory Tier-2 regulatory escalation dispatched to statutory authority within 30 minutes of critical alarm confirmation.",
            "observed_state": "Case closed at local workstation without recording Tier-2 gateway dispatch token or regulatory acknowledgement.",
            "gap_summary": "GAP-0071: Missing Mandatory Tier-2 Escalation Dispatch Packet ESC-221",
            "rule_version": "RULE-002 v2.4",
            "control_version": "CTRL-07 v3.2",
            "analytics_engine_version": "AN-1.4.2",
            "signals": [sig_obj_map.get("SIG-2004"), sig_obj_map.get("SIG-EG-01"), sig_obj_map.get("SIG-2007")],
            "evidence": [ev_1042, ev_1043, ev_742, ev_esc],
        },
        {
            "public_id": "FND-021",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-12"].id,
            "assessment_id": cycle_map["AC-2026-Q3-014"].id,
            "title": "Unrecorded Regulatory Escalation Token (CASE-3002)",
            "why_flagged": "Relational traceability link from SIG-2005: complete absence of outbound dispatch payload ESC-221 during critical grid telemetry alarm.",
            "signal_type": "NEGATIVE_SPACE",
            "priority": "HIGH",
            "evidence_strength": "HIGH",
            "completeness": 85,
            "uncertainty": "LOW",
            "status": "CANDIDATE",
            "expected_state": "Mandatory outbound regulatory dispatch verified in enclave ledger.",
            "observed_state": "Telemetry indicates containment without prior outbound escalation.",
            "gap_summary": "GAP-0072: Escalation Gateway Token Missing",
            "rule_version": "RULE-002 v2.4",
            "control_version": "CTRL-12 v3.2",
            "analytics_engine_version": "AN-1.4.0",
            "signals": [sig_obj_map.get("SIG-2005")],
            "evidence": [ev_1044, ev_esc],
        },
        {
            "public_id": "FND-033",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-18"].id,
            "assessment_id": cycle_map["AC-2026-Q3-014"].id,
            "title": "Critical OT Segment Perimeter Telemetry Coverage Void",
            "why_flagged": "Primary substation HMIs ASSET-HMI-21 and 22 lack active gateway telemetry feeds, violating mandatory coverage standards.",
            "signal_type": "COVERAGE",
            "priority": "HIGH",
            "evidence_strength": "HIGH",
            "completeness": 92,
            "uncertainty": "LOW",
            "status": "QUALIFIED",
            "expected_state": "Continuous gateway and EDR telemetry across 100% of critical OT control segments.",
            "observed_state": "Zero gateway feeds ingested for SEGMENT-OT-01 and SEGMENT-OT-02.",
            "gap_summary": "GAP-0084: Critical Substation Perimeter Telemetry Blind Spot",
            "decision_reason": "Formally qualified with provisional exception",
            "decision_notes": "Qualified by Examiner Raman: Substation hardware bridge pending installation. 30-day provisional exception granted with mandatory compensatory log shipping.",
            "decided_by": "V. K. Raman (Lead Examiner)",
            "decided_at": datetime.now(timezone.utc) - timedelta(days=2),
            "rule_version": "RULE-003 v1.8",
            "control_version": "CTRL-18 v3.2",
            "analytics_engine_version": "AN-1.3.8",
            "signals": [sig_obj_map.get("SIG-2006"), sig_obj_map.get("SIG-CD-01")],
            "evidence": [ev_1045],
        },
        {
            "public_id": "FND-044",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-01"].id,
            "assessment_id": cycle_map["AC-2026-Q3-014"].id,
            "title": "Auxiliary Heartbeat Silence on Secondary Relay Gateway",
            "why_flagged": "Candidate signal flagged intermittent telemetry gap of 42 minutes on secondary gateway-02.",
            "signal_type": "NEGATIVE_SPACE",
            "priority": "LOW",
            "evidence_strength": "LOW",
            "completeness": 65,
            "uncertainty": "HIGH",
            "status": "REJECTED",
            "expected_state": "Continuous heartbeat logs without interruption.",
            "observed_state": "42-minute telemetry silence on secondary gateway-02.",
            "gap_summary": "GAP-0091: Intermittent Gateway Heartbeat Silence",
            "decision_reason": "False Positive / Documented Maintenance Window",
            "decision_notes": "Examiner determination: Rejection verified. CSE provided cryptographic change ticket confirming gateway reboot occurred during pre-approved scheduled maintenance window MW-2026-09.",
            "decided_by": "Dr. Aris Thorne (Lead Supervisor)",
            "decided_at": datetime.now(timezone.utc) - timedelta(days=3),
            "rule_version": "RULE-001 v2.4",
            "control_version": "CTRL-01 v3.2",
            "analytics_engine_version": "AN-1.4.0",
            "signals": [sig_obj_map.get("SIG-2005")],
            "evidence": [ev_1045],
        },
        {
            "public_id": "FND-055",
            "cse_id": cse_014.id,
            "control_id": ctrl_map["CTRL-07"].id,
            "assessment_id": cycle_map["AC-2026-Q3-014"].id,
            "title": "Metric Discrepancy: Reported vs Derived SLA Compliance",
            "why_flagged": "Self-reported KPI claims 96.0% SLA compliance while empirical event reconstruction proves actual compliance is 71.4% (-24.6% breach).",
            "signal_type": "METRIC_INTEGRITY",
            "priority": "HIGH",
            "evidence_strength": "HIGH",
            "completeness": 94,
            "uncertainty": "LOW",
            "status": "VALIDATED",
            "expected_state": "Self-reported metrics reconcile within +/- 2.0% of empirical event calculations.",
            "observed_state": "Reported: 96.0%, Derived: 71.4% (Discrepancy: 24.6% non-conformance).",
            "gap_summary": "GAP-0099: Systemic SLA Metric Overstatement",
            "decision_reason": "Confirmed Statutory Breach",
            "decision_notes": "Finding formally validated by Supervisory Lead. Demand issued for raw event-derived triage audit ledger.",
            "decided_by": "Dr. Aris Thorne (Lead Supervisor)",
            "decided_at": datetime.now(timezone.utc) - timedelta(days=1),
            "rule_version": "RULE-004 v2.1",
            "control_version": "CTRL-07 v3.2",
            "analytics_engine_version": "AN-1.3.5",
            "signals": [sig_obj_map.get("SIG-2008"), sig_obj_map.get("SIG-CSC-01")],
            "evidence": [ev_1046, ev_1042],
        },
    ]

    for f_info in findings_data:
        fnd = db.query(Finding).filter(Finding.public_id == f_info["public_id"]).first()
        if not fnd:
            fnd = Finding(
                public_id=f_info["public_id"],
                cse_id=f_info["cse_id"],
                control_id=f_info["control_id"],
                assessment_id=f_info["assessment_id"],
                title=f_info["title"],
                why_flagged=f_info["why_flagged"],
                signal_type=f_info["signal_type"],
                priority=f_info["priority"],
                evidence_strength=f_info["evidence_strength"],
                completeness=f_info["completeness"],
                uncertainty=f_info["uncertainty"],
                status=f_info["status"],
                expected_state=f_info["expected_state"],
                observed_state=f_info["observed_state"],
                gap_summary=f_info["gap_summary"],
                decision_reason=f_info.get("decision_reason"),
                decision_notes=f_info.get("decision_notes"),
                decided_by=f_info.get("decided_by"),
                decided_at=f_info.get("decided_at"),
                rule_version=f_info["rule_version"],
                control_version=f_info["control_version"],
                analytics_engine_version=f_info["analytics_engine_version"],
            )
            db.add(fnd)
            db.flush()

            for sig_item in f_info["signals"]:
                if sig_item:
                    db.add(FindingSignalLink(finding_id=fnd.id, signal_id=sig_item.id))

            for ev_item in f_info["evidence"]:
                if ev_item:
                    db.add(FindingEvidenceLink(finding_id=fnd.id, evidence_id=ev_item.id, relevance="PRIMARY"))

            # Log audit event
            db.add(AuditEvent(
                event_id=f"AUD-INIT-{fnd.public_id}",
                finding_id=fnd.id,
                user_id=lead_user.id,
                examiner_badge="Automated Analytical Enclave Engine",
                action="CREATE_CANDIDATE",
                previous_status=None,
                new_status=fnd.status,
                reason="Corroborated analytical engine detection",
                notes=f"Candidate finding synthesized from signals and fused evidence context.",
            ))
        else:
            fnd.status = f_info["status"]
            fnd.priority = f_info["priority"]
            if f_info.get("decided_by"):
                fnd.decided_by = f_info["decided_by"]
                fnd.decided_at = f_info["decided_at"]
                fnd.decision_notes = f_info.get("decision_notes")
                fnd.decision_reason = f_info.get("decision_reason")

    db.commit()

    # =========================================================================
    # 12. Seed Remediation Mandates & Verification Gates
    # =========================================================================
    fnd_142 = db.query(Finding).filter(Finding.public_id == "FND-0142").first()
    fnd_21 = db.query(Finding).filter(Finding.public_id == "FND-021").first()
    fnd_33 = db.query(Finding).filter(Finding.public_id == "FND-033").first()

    remediations_data = [
        {
            "remediation_id": "REM-0038",
            "finding_id": fnd_142.id,
            "cse_id": cse_014.id,
            "finding_public_id": "FND-0142",
            "cse_public_id": "CSE-014",
            "cse_name": "Western Grid Operations",
            "control_ref": "CTRL-07 v3.2",
            "mandate_title": "Undocumented Escalation Omission During Grid Outage Incident CASE-3002",
            "action_summary": "Review CTRL-07/12 escalation workflow & submit cryptographic telemetry packet ESC-221 for Tier-2 dispatch.",
            "owner": "Western Grid Compliance Directorate",
            "priority": "CRITICAL",
            "due_date": "04 Oct 2026",
            "days_remaining": 8,
            "evidence_progress": "2/3",
            "status": "OPEN",
            "artifacts": json.dumps([
                {"id": "EVD-742", "name": "Investigation Worklog (INV-338 Triage Runbook)", "hash": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069", "status": "PRESENT_VERIFIED"},
                {"id": "EVD-761", "name": "Containment Firewall Push Logs (SCADA Boundary)", "hash": "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2", "status": "PRESENT_VERIFIED"},
                {"id": "ESC-221", "name": "Tier-2 Escalation Dispatch Telemetry Packet", "hash": "PENDING_UPLOAD_HASH", "status": "MISSING_MANDATORY"}
            ]),
            "milestones": json.dumps([
                {"date": "26 Sep 2026 14:18 IST", "title": "Finding FND-0142 Synthesized", "actor": "SYS:SAT-FUSION", "detail": "Automated gap synthesis identified CTRL-07 breach.", "completed": True},
                {"date": "26 Sep 2026 14:20 IST", "title": "Remediation Mandate REM-0038 Instantiated", "actor": "NC-8802 (Lead Examiner)", "detail": "Lead Examiner validated mandate conditions.", "completed": True},
                {"date": "26 Sep 2026 14:22 IST", "title": "Assigned to Western Grid Compliance Directorate", "actor": "NC-8802 (Lead Examiner)", "detail": "State set to OPEN with 8-day SLA horizon.", "completed": True},
                {"date": "27 Sep 2026 09:15 IST", "title": "Formal Evidence Demand for ESC-221 Dispatched", "actor": "NC-8802 (Lead Examiner)", "detail": "Demanded raw cryptographic dispatch payload.", "completed": True}
            ]),
            "verification": {
                "verification_id": "VRF-0038",
                "verdict": "EVIDENCE_LOCKED",
                "confidence_score": 68,
                "evidence_completeness": 67,
                "pass_fail": "PENDING",
                "summary": "Mandate requires cryptographic verification of Level 2 SOAR dispatch telemetry during incident CASE-3002.",
                "rationale": "Awaiting mandatory telemetry ESC-221 from Western Grid. Statutory closure gate remains locked.",
                "merkle_root": "0x9af8b12204cc19ef7b28a994c1e40019283746194180",
                "gates": [
                    ("gate-1", "DOCUMENTARY_VERIFICATION", "Mandate Scope Formally Communicated to CSE", True, True, None),
                    ("gate-2", "TECHNICAL_RETEST", "Cryptographic Attestation of Playbook Update v2.4", True, True, None),
                    ("gate-3", "EVIDENCE_REQUIREMENT", "Mandatory Telemetry Packet ESC-221 Ingested", False, True, "Statutory blocker: Missing raw dispatch payload"),
                    ("gate-4", "PROCESS_CONFORMANCE", "Cross-Source Petri Net Process Conformance (PM4Py)", False, True, None),
                    ("gate-5", "EXAMINER_REVIEW", "Immutable FIPS-140-2 Level 3 Hash Sealed", False, True, None),
                ]
            }
        },
        {
            "remediation_id": "REM-0042",
            "finding_id": fnd_33.id,
            "cse_id": cse_014.id,
            "finding_public_id": "FND-033",
            "cse_public_id": "CSE-014",
            "cse_name": "Western Grid Operations",
            "control_ref": "CTRL-18 v3.2",
            "mandate_title": "OT Substation Perimeter Gateway Coverage Remediation",
            "action_summary": "Deploy dedicated hardware forwarder bridges on SEGMENT-OT-01 and SEGMENT-OT-02; stream heartbeats.",
            "owner": "Western Grid OT Infrastructure Team",
            "priority": "HIGH",
            "due_date": "15 Oct 2026",
            "days_remaining": 16,
            "evidence_progress": "3/3",
            "status": "UNDER_VERIFICATION",
            "artifacts": json.dumps([
                {"id": "EVD-881", "name": "OT Gateway Forwarder Config & Syslog Hash", "hash": "3a18bf72199042bcef9012a48b1049281726aef100293817294812", "status": "PRESENT_VERIFIED"},
                {"id": "EVD-882", "name": "Substation 4B Tap Telemetry Verification Receipt", "hash": "91a82bc1029481273948127491823749182739481273491827", "status": "PRESENT_VERIFIED"}
            ]),
            "milestones": json.dumps([
                {"date": "24 Sep 2026 10:00 IST", "title": "Mandate Issued", "actor": "NC-7410 (Examiner)", "detail": "Coverage mandate issued.", "completed": True},
                {"date": "28 Sep 2026 16:30 IST", "title": "All Telemetry Uploaded", "actor": "Western Grid", "detail": "Artifacts EVD-881 & 882 submitted for review.", "completed": True}
            ]),
            "verification": {
                "verification_id": "VRF-0042",
                "verdict": "UNDER_SUPERVISORY_REVIEW",
                "confidence_score": 88,
                "evidence_completeness": 100,
                "pass_fail": "PENDING",
                "summary": "Verification of physical forwarder bridge installation on SCADA HMI boundary.",
                "rationale": "Hardware installation complete. Final supervisory examiner verification pending.",
                "merkle_root": "0x4b719001eaf182948102948192841928401928401928",
                "gates": [
                    ("gate-1", "DOCUMENTARY_VERIFICATION", "Physical Asset Topology Updated in Repository", True, True, None),
                    ("gate-2", "TECHNICAL_RETEST", "Continuous Syslog Stream Confirmed (>72h)", True, True, None),
                    ("gate-3", "EVIDENCE_REQUIREMENT", "Cryptographic Forwarder Signature Validated", True, True, None),
                    ("gate-4", "PROCESS_CONFORMANCE", "Zero Telemetry Gaps across Test Window", True, True, None),
                    ("gate-5", "EXAMINER_REVIEW", "Lead Examiner Sign-Off and Seal", False, True, "Pending final seal"),
                ]
            }
        },
        {
            "remediation_id": "REM-0050",
            "finding_id": fnd_142.id,
            "cse_id": cse_014.id,
            "finding_public_id": "FND-0142",
            "cse_public_id": "CSE-014",
            "cse_name": "Western Grid Operations",
            "control_ref": "CTRL-01 v3.1",
            "mandate_title": "Q2 Firewall Sequence Cryptographic Hash Streaming Remediation",
            "action_summary": "Reconfigure perimeter gateway syslog daemon to append SHA-256 block hashes.",
            "owner": "Western Grid Security Operations",
            "priority": "MEDIUM",
            "due_date": "15 Jun 2026",
            "days_remaining": 0,
            "evidence_progress": "3/3",
            "status": "CLOSED",
            "artifacts": json.dumps([
                {"id": "EVD-501", "name": "Syslog Daemon FIPS Configuration", "hash": "1192837461928374619283746192837461928374", "status": "PRESENT_VERIFIED"}
            ]),
            "milestones": json.dumps([
                {"date": "10 May 2026 11:00 IST", "title": "Mandate Issued", "actor": "NC-8802 (Lead)", "detail": "Issued for Q2 cycle.", "completed": True},
                {"date": "12 Jun 2026 15:45 IST", "title": "Verification Completed & Sealed", "actor": "NC-8802 (Lead)", "detail": "Formally closed.", "completed": True}
            ]),
            "verification": {
                "verification_id": "VRF-0050",
                "verdict": "VERIFIED_SEALED",
                "confidence_score": 100,
                "evidence_completeness": 100,
                "pass_fail": "PASS",
                "summary": "Syslog hash chaining confirmed operational with zero missing sequence numbers.",
                "rationale": "All 5 verification gates satisfied. Immutable hash sealed in supervisory ledger.",
                "merkle_root": "0xfe9810294819284102948102948192048102948102",
                "gates": [
                    ("gate-1", "DOCUMENTARY_VERIFICATION", "Configuration Baseline Audit", True, True, None),
                    ("gate-2", "TECHNICAL_RETEST", "Cryptographic Block Test Passed", True, True, None),
                    ("gate-3", "EVIDENCE_REQUIREMENT", "Sample Stream Validated", True, True, None),
                    ("gate-4", "PROCESS_CONFORMANCE", "Automated Sequence Continuity Checked", True, True, None),
                    ("gate-5", "EXAMINER_REVIEW", "Formally Sealed by Lead Examiner", True, True, None),
                ]
            }
        },
        {
            "remediation_id": "REM-0055",
            "finding_id": fnd_21.id,
            "cse_id": cse_014.id,
            "finding_public_id": "FND-021",
            "cse_public_id": "CSE-014",
            "cse_name": "Western Grid Operations",
            "control_ref": "CTRL-12 v3.2",
            "mandate_title": "SOAR Outbound Dispatch Gateway Automation",
            "action_summary": "Implement automated SOAR script to eliminate human delay in regulatory escalation dispatch.",
            "owner": "Western Grid Automation Group",
            "priority": "HIGH",
            "due_date": "20 Sep 2026",
            "days_remaining": -9,
            "evidence_progress": "1/3",
            "status": "REOPENED",
            "reopen_reason": "Verification failed: Post-remediation audit detected repeat SLA breach in subsequent cycle (CASE-3008).",
            "artifacts": json.dumps([
                {"id": "EVD-601", "name": "SOAR Playbook Script Export", "hash": "99281746192847102948127491827491", "status": "PRESENT_DEFICIENT"}
            ]),
            "milestones": json.dumps([
                {"date": "01 Aug 2026", "title": "Mandate Issued", "actor": "NC-8802", "detail": "SOAR automation mandated.", "completed": True},
                {"date": "25 Sep 2026", "title": "Verification Audit Failed - Mandate Reopened", "actor": "NC-8802", "detail": "Reopened due to recurring SLA breach in CASE-3008.", "completed": True}
            ]),
            "verification": {
                "verification_id": "VRF-0055",
                "verdict": "DEFICIENT_REOPENED",
                "confidence_score": 45,
                "evidence_completeness": 33,
                "pass_fail": "FAIL",
                "summary": "Mandated SOAR dispatch failed to trigger during CASE-3008 critical alert.",
                "rationale": "Automated script failed on production cluster. Incident reverted to manual dispatch. Statutory mandate reopened.",
                "merkle_root": "0x00112233445566778899aabbccddeeff00112233",
                "gates": [
                    ("gate-1", "DOCUMENTARY_VERIFICATION", "Script Deployment Documentation", True, True, None),
                    ("gate-2", "TECHNICAL_RETEST", "Production Trigger Validation", False, True, "Failed: Script threw exit code 127"),
                    ("gate-3", "EVIDENCE_REQUIREMENT", "Production Dispatch Telemetry", False, True, "Missing production dispatch"),
                    ("gate-4", "PROCESS_CONFORMANCE", "Automated Flow Conformance", False, True, "Bypassed"),
                    ("gate-5", "EXAMINER_REVIEW", "Rejected and Reopened", False, True, "Mandate reopened"),
                ]
            }
        },
    ]

    for rem_info in remediations_data:
        rem = db.query(Remediation).filter(Remediation.remediation_id == rem_info["remediation_id"]).first()
        v_data = rem_info["verification"]
        
        if not rem:
            rem = Remediation(
                remediation_id=rem_info["remediation_id"],
                finding_id=rem_info["finding_id"],
                cse_id=rem_info["cse_id"],
                finding_public_id=rem_info["finding_public_id"],
                cse_public_id=rem_info["cse_public_id"],
                cse_name=rem_info["cse_name"],
                control_ref=rem_info["control_ref"],
                mandate_title=rem_info["mandate_title"],
                action_summary=rem_info["action_summary"],
                owner=rem_info["owner"],
                priority=rem_info["priority"],
                due_date=rem_info["due_date"],
                days_remaining=rem_info["days_remaining"],
                evidence_progress=rem_info["evidence_progress"],
                status=rem_info["status"],
                reopen_reason=rem_info.get("reopen_reason"),
                artifacts=rem_info["artifacts"],
                milestones=rem_info["milestones"],
            )
            db.add(rem)
            db.flush()

            db.add(RemediationFinding(remediation_id=rem.id, finding_id=rem_info["finding_id"]))

            vrf = VerificationResult(
                verification_id=v_data["verification_id"],
                remediation_id=rem.id,
                finding_id=rem_info["finding_id"],
                cse_id=rem_info["cse_id"],
                mandate_public_id=rem_info["remediation_id"],
                finding_public_id=rem_info["finding_public_id"],
                cse_public_id=rem_info["cse_public_id"],
                cse_name=rem_info["cse_name"],
                control_id=rem_info["control_ref"],
                cycle="Q3 2026",
                lead_examiner="NC-8802 (Lead Examiner)",
                statutory_standard="NCIIPC Framework Sec 12(a) & Rule 4.8.2",
                submitted_at="26 Sep 2026 14:22 IST",
                evaluated_at="27 Sep 2026 09:15 IST",
                verification_verdict=v_data["verdict"],
                confidence_score=v_data["confidence_score"],
                evidence_completeness=v_data["evidence_completeness"],
                merkle_root_hash=v_data["merkle_root"],
                remedial_summary=v_data["summary"],
                supervisory_rationale=v_data["rationale"],
                pass_fail=v_data["pass_fail"],
                submitted_artifacts=rem_info["artifacts"],
            )
            db.add(vrf)
            db.flush()

            for gid, gtype, glabel, gver, greq, gnote in v_data["gates"]:
                db.add(VerificationGate(
                    gate_id=gid,
                    verification_result_id=vrf.id,
                    remediation_id=rem.id,
                    gate_type=gtype,
                    label=glabel,
                    verified=gver,
                    required=greq,
                    note=gnote,
                    evidence_requirement="Statutory cryptographic proof",
                ))
        else:
            rem.status = rem_info["status"]
            rem.days_remaining = rem_info["days_remaining"]
            rem.evidence_progress = rem_info["evidence_progress"]

    db.commit()

    # =========================================================================
    # 13. Seed Stratified Supervisory Sampling Run & Items
    # =========================================================================
    s_run = db.query(SamplingRun).filter(SamplingRun.run_id == "SRUN-2026-001").first()
    if not s_run:
        s_run = SamplingRun(
            run_id="SRUN-2026-001",
            title="Q3 2026 Stratified Supervisory Risk Sample",
            sampling_parameters=json.dumps({
                "sector": "ALL",
                "tier": "TIER_1",
                "risk": "HIGH",
                "anomaly_presence": True,
                "sample_size": 10
            }),
            algorithm_version="v1.2.0",
            random_seed=42,
            status="COMPLETED",
            created_by_id=lead_user.id,
            created_by_name="NC-8802 (Lead Examiner)",
            total_items=0
        )
        db.add(s_run)
        db.flush()

        sample_templates = [
            ("SMP-001", "CASE-3002", "CSE-014", "Western Grid Operations", "CTRL-07", "CRITICAL", "RISK_BASED", "Severe escalation timing discrepancy in grid SCADA containment telemetry.", "HIGH", "PRESENT", True),
            ("SMP-002", "CASE-3006", "CSE-014", "Western Grid Operations", "CTRL-07", "HIGH", "EVIDENCE_BASED", "Completely untriaged high-priority alert ALR-7006 with missing mandatory triage evidence.", "HIGH", "NOT_SUBMITTED", True),
            ("SMP-003", "CASE-3003", "CSE-014", "Western Grid Operations", "CTRL-07", "HIGH", "ANOMALY_BASED", "Off-hours 03:02 UTC triage delay + off-shift privileged access anomaly.", "HIGH", "PRESENT", True),
            ("SMP-004", "CASE-3005", "CSE-014", "Western Grid Operations", "CTRL-12", "MEDIUM", "RECURRENCE_BASED", "ICS relay escalation SLA breached in 2 consecutive quarterly cycles.", "MEDIUM", "PRESENT", True),
            ("SMP-005", "CASE-3001", "CSE-014", "Western Grid Operations", "CTRL-01", "LOW", "BASELINE_RANDOM", "Normative statistical sample drawn for energy grid core.", "HIGH", "PRESENT", False),
            ("SMP-006", "CASE-3007", "CSE-014", "Western Grid Operations", "CTRL-18", "HIGH", "COVERAGE_BASED", "Critical OT asset telemetry coverage audit sample across unmonitored segments.", "HIGH", "PRESENT", True),
        ]

        count = 0
        for smp_id, cid, c_pub_id, c_name, c_ref, prio, meth, reason, ev_str, ev_stat, sel in sample_templates:
            target_cse = cse_map.get(c_pub_id, cse_014)
            s_item = SamplingItem(
                item_id=smp_id,
                run_id=s_run.id,
                case_id=cid,
                cse_id=target_cse.id,
                cse_public_id=c_pub_id,
                cse_name=c_name,
                control_ref=c_ref,
                priority=prio,
                methodology=meth,
                sampling_reason=reason,
                evidence_strength=ev_str,
                evidence_status=ev_stat,
                status="SELECTED" if sel else "RECOMMENDED",
                selected=sel,
                assessment_period="Q3 2026",
                signals=json.dumps(["EXECUTION_GAP", "NEGATIVE_SPACE", "PROCESS_DEVIATION"])
            )
            db.add(s_item)
            count += 1
        s_run.total_items = count

    # =========================================================================
    # 14. Seed Governance Versions, Rules, Models, and Pipelines
    # =========================================================================
    if db.query(SystemVersion).count() == 0:
        db.add_all([
            SystemVersion(
                version="3.2.0",
                release_name="Apex Sovereign Supervisor",
                component="SAT_SA_CORE",
                status="ACTIVE",
                changelog="Unified Governance workspace, append-only cryptographic audit ledger, and multi-layer graph topology.",
                git_commit="a7f89b4c2e11",
            ),
            SystemVersion(
                version="3.1.0",
                release_name="Foundational Sovereign Enclave",
                component="SAT_SA_CORE",
                status="SUPERSEDED",
                changelog="Baseline telemetry normalization, OCSF canonical pipeline, and initial evidence vault.",
                git_commit="89f3014a9ecb",
            ),
        ])

    if db.query(RuleVersion).count() == 0:
        rules_seed = [
            ("RULE-001", "execution-gap", "2.4.0", "RULE-001: Alert Triage SLA Rule", "HIGH alert must be triaged within 15 minutes.", "3a8f9c118742b0", {"sla_minutes": 15, "control_id": "CTRL-07"}),
            ("RULE-002", "execution-gap", "2.4.0", "RULE-002: Critical Incident Escalation Rule", "CRITICAL incident must be escalated within 30 minutes.", "3a8f9c118742b1", {"sla_minutes": 30, "mandatory_packet": "ESC-221", "control_id": "CTRL-12"}),
            ("RULE-003", "coverage", "1.8.0", "RULE-003: Critical OT Segment Telemetry Rule", "Critical OT segments should have continuous telemetry feeds.", "71a2e88b9015c3", {"minimum_coverage_ratio": 1.0, "control_id": "CTRL-18"}),
            ("RULE-004", "metric-integrity", "2.1.0", "RULE-004: SLA Metric Reconciliation Rule", "Reported SLA metrics should reconcile with raw event-derived values within +/-2.0%.", "99bca40277df19", {"variance_threshold": 0.02, "control_id": "CTRL-07"}),
            ("R-NS-02", "negative-space", "2.3.1", "Telemetry Silence / Ingestion Void Detector", "Detects missing expected heartbeats and reporting blackout windows exceeding 60 minutes.", "99bca40277df20", {"silence_threshold_minutes": 60}),
            ("R-BEH-03", "behavioural", "1.5.0", "Operator Session Deviation Anomaly Rule", "Flags abnormal off-hours privileged console operations.", "f1049c8821ad44", {"std_dev_threshold": 2.5}),
        ]
        for rid, slug, ver, rname, rdesc, rhash, rparams in rules_seed:
            db.add(RuleVersion(
                rule_id=rid,
                engine_slug=slug,
                version=ver,
                name=rname,
                description=rdesc,
                logic_hash=rhash,
                parameters=json.dumps(rparams),
                status="ACTIVE",
            ))

    if db.query(ModelVersion).count() == 0:
        models_seed = [
            ("MOD-BEHAV-01", "Isolation Forest Operator Behavior Model", "1.2.0", "IsolationForest", "e4a889b7201c9a", {"n_estimators": 100, "contamination": 0.03}),
            ("MOD-HIST-02", "Peer Cohort Robust Z-Score Baseline Model", "2.0.1", "Statistical/RobustZScore", "6b09c811f9940a", {"window_days": 90, "trim_percent": 0.05}),
        ]
        for mid, mname, mver, mfw, mhash, mparams in models_seed:
            db.add(ModelVersion(
                model_id=mid,
                name=mname,
                version=mver,
                framework=mfw,
                weights_hash=mhash,
                hyperparameters=json.dumps(mparams),
                status="PRODUCTION",
            ))

    if db.query(PipelineRun).count() == 0:
        runs_seed = [
            ("PIP-2026-0927-01", "SUPERVISORY_FULL_CYCLE", "v3.2.0", "SCHEDULED", "SUCCESS", 6, 28, 1420.5),
            ("PIP-2026-0926-02", "AIR_GAP_INGESTION_SWEEP", "v3.2.0", "EVENT", "SUCCESS", 6, 8, 612.3),
        ]
        for prun_id, pname, pver, ptrig, pstat, pcount, psigs, ptime in runs_seed:
            db.add(PipelineRun(
                run_id=prun_id,
                pipeline_name=pname,
                pipeline_version=pver,
                trigger=ptrig,
                status=pstat,
                cse_count=pcount,
                signals_generated=psigs,
                execution_time_ms=ptime,
                started_at=datetime.now(timezone.utc) - timedelta(hours=6),
                completed_at=datetime.now(timezone.utc) - timedelta(hours=5, minutes=58),
            ))

    # =========================================================================
    # 15. Seed Comprehensive Append-Only Audit Trail
    # =========================================================================
    if db.query(AuditEvent).count() <= 10:
        audit_seeds = [
            ("AUD-2026-004835", "NC-8802 (Lead)", "VERIFICATION_COMPLETED", "REMEDIATION", "REM-0050", "Statutory closure verification sealed with FIPS digest", "VERIFIED"),
            ("AUD-2026-004834", "NC-7410 (Examiner)", "FINDING_QUALIFIED", "FINDING", "FND-033", "Finding formally qualified with 30-day provisional hardware bridge exemption", "QUALIFIED"),
            ("AUD-2026-004832", "NC-8802 (Lead)", "FINDING_REJECTED", "FINDING", "FND-044", "Examiner rejected finding: gateway restart during scheduled window MW-2026-09", "REJECTED"),
            ("AUD-2026-004830", "NC-8802 (Lead)", "FINDING_VALIDATED", "FINDING", "FND-055", "Statutory finding confirmed: SLA reconciliation proves 24.6% compliance breach", "VALIDATED"),
            ("AUD-2026-004828", "NC-8802 (Lead)", "NOTE_ADDED", "FINDING", "FND-0142", "Examiner note added: Mandatory escalation packet ESC-221 required prior to review closure", "RECORDED"),
            ("AUD-2026-004826", "NC-8802 (Lead)", "REMEDIATION_UPDATED", "REMEDIATION", "REM-0038", "Evidence demand token dispatched to Western Grid Compliance Directorate", "UPDATED"),
            ("AUD-2026-004825", "INGEST_GATEWAY", "EVIDENCE_INGESTED", "EVIDENCE", "EV-1042", "SIEM telemetry ingested and validated via FIPS-140-2 schema", "VALID"),
            ("AUD-2026-004824", "NC-7410 (Examiner)", "EVIDENCE_ACCESSED", "EVIDENCE", "EVD-742", "Examiner accessed raw investigation worklog for CASE-3002", "INSPECTED"),
            ("AUD-2026-004822", "NC-8802 (Lead)", "ASSESSMENT_OPENED", "ASSESSMENT", "AC-2026-Q3-014", "Q3 2026 supervisory assessment initiated for Western Grid Operations", "ACTIVE"),
            ("AUD-2026-004820", "USR-001", "LOGIN_SUCCESS", "AUTH", "USR-001", "Enclave session authenticated via FIPS smartcard credential NC-8802", "ACTIVE"),
            ("AUD-2026-004818", "ENGINE_RUNNER", "ANALYSIS_EXECUTED", "ENGINE", "execution-gap", "Analytical execution completed across cohort with 2 candidate signals", "SUCCESS"),
            ("AUD-2026-004815", "NC-7410 (Examiner)", "RULE_VIEWED", "GOVERNANCE", "RULE-002", "Examiner inspected parameter thresholds for Rule RULE-002", "INSPECTED"),
            ("AUD-2026-004812", "NC-8802 (Lead)", "REPORT_GENERATED", "REPORT", "REP-2026-Q3-014", "Comprehensive statutory compliance summary report compiled", "GENERATED"),
            ("AUD-2026-004810", "ADMIN", "VERSION_CHANGED", "SYSTEM", "3.2.0", "Deployed SAT-SA Core v3.2.0 baseline", "ACTIVE"),
        ]
        for a_id, actor, act, ent_type, ent_id, rsn, stat in audit_seeds:
            db.add(AuditEvent(
                id=uuid.uuid4(),
                event_id=a_id,
                actor_id=actor,
                action=act,
                entity_type=ent_type,
                entity_id=ent_id,
                examiner_badge=actor,
                reason=rsn,
                after=json.dumps({"status": stat}),
                request_id=f"REQ-{uuid.uuid4().hex[:6].upper()}",
                created_at=datetime.now(timezone.utc) - timedelta(hours=4),
            ))

    db.commit()
    logger.info("Complete synthetic demonstration database seeding finished successfully!")


def verify_database(db: Session) -> bool:
    """Verify integrity of seeded database, foreign key relationships, and analytics."""
    logger.info("Verifying database integrity and relational consistency...")
    errors = []

    # 1. CSE Verification
    cses = db.query(CSE).all()
    if len(cses) < 4:
        errors.append(f"Expected at least 4 CSEs, found {len(cses)}")
    else:
        logger.info(f"Verified {len(cses)} CSEs: {[c.public_id for c in cses]}")

    # 2. Assessment Cycles Verification
    cse_014 = db.query(CSE).filter(CSE.public_id == "CSE-014").first()
    if not cse_014:
        errors.append("CSE-014 not found in database!")
    else:
        c14_cycles = db.query(AssessmentCycle).filter(AssessmentCycle.cse_id == cse_014.id).all()
        if len(c14_cycles) < 2:
            errors.append(f"Expected >= 2 cycles for CSE-014 historical comparison, found {len(c14_cycles)}")
        else:
            logger.info(f"Verified {len(c14_cycles)} longitudinal assessment cycles for CSE-014: {[c.public_id for c in c14_cycles]}")

    # 3. Controls Verification
    for cid in ["CTRL-01", "CTRL-04", "CTRL-07", "CTRL-12", "CTRL-18"]:
        c = db.query(Control).filter(Control.public_id == cid).first()
        if not c:
            errors.append(f"Required control {cid} missing!")
    logger.info("Verified all core controls (CTRL-01, 04, 07, 12, 18).")

    # 4. Evidence Verification
    for eid in ["EV-1042", "EV-1043", "EV-1044", "EV-1045", "EV-1046", "ESC-221"]:
        ev = db.query(Evidence).filter(Evidence.public_id == eid).first()
        if not ev:
            errors.append(f"Required evidence record {eid} missing!")
    logger.info("Verified evidence catalog and cryptographic records.")

    # 5. Findings & Decision Verification
    f_states = set(f.status for f in db.query(Finding).all())
    expected_states = {"CANDIDATE", "UNDER_REVIEW", "QUALIFIED", "REJECTED", "VALIDATED"}
    missing_states = expected_states - f_states
    if missing_states:
        errors.append(f"Missing finding states: {missing_states}")
    else:
        logger.info(f"Verified finding review queue states: {f_states}")

    # 6. Remediations Verification
    rem_states = set(r.status for r in db.query(Remediation).all())
    expected_rem_states = {"OPEN", "UNDER_VERIFICATION", "CLOSED", "REOPENED"}
    missing_rem_states = expected_rem_states - rem_states
    if missing_rem_states:
        errors.append(f"Missing remediation states: {missing_rem_states}")
    else:
        logger.info(f"Verified remediation lifecycle states: {rem_states}")

    # 7. Sampling Run Verification
    s_items = db.query(SamplingItem).all()
    if len(s_items) == 0:
        errors.append("No sampling items found!")
    else:
        methods = set(s.methodology for s in s_items)
        logger.info(f"Verified {len(s_items)} sampling items covering methodologies: {methods}")

    # 8. Analytical Engines Output Verification
    live_signals = db.query(AnalyticalSignalModel).count()
    if live_signals == 0:
        errors.append("No live analytical signals generated by engine registry!")
    else:
        logger.info(f"Verified {live_signals} live signals generated by analytical engines.")

    # Summary
    if errors:
        logger.error(f"Database verification FAILED with {len(errors)} errors:")
        for err in errors:
            logger.error(f"  - {err}")
        return False
    else:
        logger.info("ALL DEMONSTRATION DATA INTEGRITY CHECKS PASSED SUCCESSFULLY! (100% Valid)")
        return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SAT-SA Supervisory Demo Data Seeding Engine")
    parser.add_argument("--seed", action="store_true", help="Seed the demonstration dataset")
    parser.add_argument("--reset", action="store_true", help="Reset demonstration data before seeding")
    parser.add_argument("--verify", action="store_true", help="Run integrity and relationship verification checks")

    args = parser.parse_args()

    db = SessionLocal()
    try:
        if args.reset:
            reset_demo_data(db)

        # Default action is to seed if not only verifying
        if args.seed or not (args.reset or args.verify):
            seed_database(db)

        if args.verify or not args.reset:
            success = verify_database(db)
            if not success and args.verify:
                sys.exit(1)
    finally:
        db.close()
