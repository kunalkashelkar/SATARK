import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, active_db_url
from app.core.logging import logger
from app.db.models import (
    Role,
    Permission,
    User,
    CSE,
    AssessmentCycle,
    Control,
    ControlApplicability,
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
    AuditEvent,
)
import json



def seed_database(db: Session) -> None:
    logger.info(f"Seeding demo supervisory data on {active_db_url}...")

    # 1. Seed Permissions
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

    # 2. Seed Roles
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
        # Bind permissions
        role.permissions = [perm_map[p] for p in r_perms if p in perm_map]
        role_map[r_name] = role

    from app.core.security import hash_password

    # 3. Seed Lead Supervisor User (NC-8802 Lead)
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
    else:
        examiner_user.hashed_password = hash_password("Examiner@2026!")

    # 4. Seed Critical Sector Entities (CSEs)
    cses_data = [
        {
            "public_id": "CSE-014",
            "name": "Northern Regional Power Grid Control Center",
            "sector": "Energy / Power",
            "organization_type": "Statutory Power Transmission Enclave",
            "location": "New Delhi / NCR",
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
            "public_id": "CSE-008",
            "name": "National Clearing & Settlement Exchange",
            "sector": "Banking / Financial Services",
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
        cse_map[c_data["public_id"]] = cse

    # 5. Seed Assessment Cycles
    cycles_data = [
        ("ASM-2026-Q3", "CSE-014", "2026-Q3", "IN_PROGRESS", 71.0, 19),
        ("ASM-2026-Q3-08", "CSE-008", "2026-Q3", "IN_PROGRESS", 92.5, 23),
        ("ASM-2026-Q3-22", "CSE-022", "2026-Q3", "IN_PROGRESS", 58.0, 14),
    ]

    cycle_map = {}
    for asm_id, cse_pub, period, status, readiness, ctrl_count in cycles_data:
        cycle = db.query(AssessmentCycle).filter(AssessmentCycle.public_id == asm_id).first()
        if not cycle:
            cycle = AssessmentCycle(
                public_id=asm_id,
                cse_id=cse_map[cse_pub].id,
                period=period,
                status=status,
                evidence_readiness=readiness,
                controls_assessed=ctrl_count,
                submitted_at=datetime.now(timezone.utc),
            )
            db.add(cycle)
            db.flush()
        cycle_map[asm_id] = cycle

    # 6. Seed Supervisory Controls
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
            "description": "Requires continuous, uninterrupted monitoring of all critical boundaries and triage of High/Critical alerts within statutory SLA windows.",
            "expected_capability": "24x7 active analyst triage with maximum 15-minute response latency for High/Critical tier telemetry.",
            "expected_evidence": "SIEM event ingestion logs, analyst shift duty rosters, ticket triage timestamps, and gateway telemetry correlation tokens.",
            "assessment_criteria": "Telemetry gaps exceeding 30 consecutive minutes or systematic shift-time latency degradation constitutes non-conformance.",
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

    for ctrl_data in controls_data:
        ctrl = db.query(Control).filter(Control.public_id == ctrl_data["public_id"]).first()
        if not ctrl:
            ctrl = Control(**ctrl_data)
            db.add(ctrl)
            db.flush()

        # Link applicability to CSE-014
        app_entry = db.query(ControlApplicability).filter(
            ControlApplicability.control_id == ctrl.id,
            ControlApplicability.cse_id == cse_map["CSE-014"].id,
        ).first()
        if not app_entry:
            app_entry = ControlApplicability(
                control_id=ctrl.id,
                cse_id=cse_map["CSE-014"].id,
                assessment_id=cycle_map["ASM-2026-Q3"].id,
                applicability_status="APPLICABLE",
                notes="Mandated under NCIIPC Critical Infrastructure Cyber Security Guidelines §4.2",
            )
            db.add(app_entry)

    # 7. Seed User CSE Access Scope (Examiner Raman is granted CSE-014 and CSE-022, but not CSE-008)
    from app.db.models.user_cse_access import UserCseAccess
    for allowed_cse in ["CSE-014", "CSE-022"]:
        access = db.query(UserCseAccess).filter(
            UserCseAccess.user_id == examiner_user.id,
            UserCseAccess.cse_id == cse_map[allowed_cse].id,
        ).first()
        if not access:
            access = UserCseAccess(
                user_id=examiner_user.id,
                cse_id=cse_map[allowed_cse].id,
                access_type="Full Supervisory",
                granted_by="NC-8802 (Lead)",
            )
            db.add(access)

    db.commit()

    # 8. Seed Deterministic Evidence Records with genuine Parquet artifacts and SHA-256 hashes
    from app.services.evidence_service import EvidenceService
    from app.schemas.evidence import EvidenceIngestRequest, EvidenceProvenanceBase
    from app.db.models.evidence import Evidence

    sample_evidences = [
        {
            "evidence_id": "EV-1042",
            "cse_id": "CSE-014",
            "control_id": "CTRL-07",
            "control_code": "SOC.MON.07",
            "category": "ALERT",
            "state": "PRESENT",
            "source_system": "SIEM",
            "source_event_id": "ALR-44218",
            "events": [
                {
                    "alert_id": "ALR-44218",
                    "timestamp": "2026-09-26T09:12:04Z",
                    "title": "Substation 4B PLC Boundary Alarm - Modbus unauthorized write",
                    "severity": "CRITICAL",
                    "analyst": "R. Sharma",
                    "case_id": "CASE-1042",
                    "src_ip": "10.14.88.21",
                    "dest_ip": "10.14.102.5",
                    "category": "Industrial Control / OT Incursion",
                },
                {
                    "alert_id": "ALR-44219",
                    "timestamp": "2026-09-26T09:12:35Z",
                    "title": "Substation 4B Telemetry Ingestion Failure",
                    "severity": "HIGH",
                    "analyst": "R. Sharma",
                    "case_id": "CASE-1042",
                    "src_ip": "10.14.88.21",
                    "dest_ip": "10.14.102.5",
                    "category": "OT Telemetry Interruption",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TOK-NCIIPC-SEC-44218",
                source_host="splunk-fwd-01.northgrid.internal",
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
            "evidence_id": "EVD-742",
            "cse_id": "CSE-014",
            "control_id": "CTRL-08",
            "control_code": "SOC.PRC.08",
            "category": "INVESTIGATION",
            "state": "PRESENT",
            "source_system": "CASE_MGMT",
            "source_event_id": "INV-338",
            "events": [
                {
                    "case_ref": "CASE-1042 / INV-338",
                    "timestamp": "2026-09-26T09:42:18Z",
                    "lead_analyst": "S. Kulkarni",
                    "case_id": "CASE-1042",
                    "phase": "TRIAGE_ANALYSIS",
                    "severity": "HIGH",
                    "playbook": "PW-04",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TOK-NCIIPC-SEC-742",
                source_host="jira-soc.northgrid.internal",
                source_ip="10.14.0.14",
                custody_chain=[
                    "CSE-014 Internal SOC",
                    "Air-Gap SFTP Drop",
                    "NCIIPC Collector Gateway",
                    "Supervisory Enclave Vault"
                ],
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
            "source_event_id": "RSP-089",
            "events": [
                {
                    "log_id": "FW-BLOCKED-8819",
                    "timestamp": "2026-09-26T11:08:44Z",
                    "action": "BLOCK",
                    "severity": "MEDIUM",
                    "user": "FW-SOAR-BOT",
                    "dest_port": 502,
                    "bytes": 1024,
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TOK-NCIIPC-SEC-761",
                source_host="ng-fw-cluster.northgrid.internal",
                source_ip="10.14.2.1",
                custody_chain=[
                    "CSE-014 Boundary Firewall",
                    "NCIIPC Collector Gateway",
                    "Supervisory Enclave Vault"
                ],
                received_by="NCIIPC Automated Enclave Gateway",
            )
        },
        {
            "evidence_id": "ESC-221",
            "cse_id": "CSE-014",
            "control_id": "CTRL-08",
            "control_code": "SOC.PRC.08",
            "category": "ESCALATION",
            "state": "NOT_SUBMITTED",
            "source_system": "TICKETING",
            "source_event_id": "MISSING_ESCALATION",
            "events": [
                {
                    "ticket_id": "TICK-EXPECTED-MISSING",
                    "timestamp": "2026-09-26T10:00:00Z",
                    "priority": "HIGH",
                    "status": "UNSUBMITTED",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TOK-MISSING-ESC",
                custody_chain=["Expected Statutory Channel", "Enclave Evidence Vault"],
                received_by="NCIIPC Automated Enclave Gateway",
            )
        },
        {
            "evidence_id": "EV-2019",
            "cse_id": "CSE-022",
            "control_id": "CTRL-07",
            "control_code": "SOC.MON.07",
            "category": "ALERT",
            "state": "PRESENT",
            "source_system": "EDR",
            "source_event_id": "EDR-DET-9921",
            "events": [
                {
                    "detection_id": "EDR-DET-9921",
                    "timestamp": "2026-09-26T08:15:00Z",
                    "hostname": "kaveri-scada-hmi-01",
                    "process_name": "cmd.exe",
                    "action": "PROCESS_TERMINATED",
                    "severity": "CRITICAL",
                    "sha256": "4a1b028ec31a0029bce83719001e389291bacef9810419284102948124819231",
                }
            ],
            "provenance": EvidenceProvenanceBase(
                collector="sat-collector-v2.8-fips",
                transmission_token="TOK-KAVERI-EDR-9921",
                source_host="edr-broker.kaveri.internal",
                source_ip="10.22.4.8",
                custody_chain=["Kaveri EDR Server", "Air-Gap Gateway", "Supervisory Enclave Vault"],
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

    # 9. Seed Signals, Evidence Links, and Fused Contexts
    from app.db.models.signal import Signal, SignalEvidenceLink, FusedAssessmentContext
    from app.db.models.finding import Finding, FindingSignalLink, FindingEvidenceLink, AuditEvent

    ctrl_07 = db.query(Control).filter(Control.public_id == "CTRL-07").first()
    ev_1042 = db.query(Evidence).filter(Evidence.public_id == "EV-1042").first()
    ev_742 = db.query(Evidence).filter(Evidence.public_id == "EVD-742").first()
    ev_761 = db.query(Evidence).filter(Evidence.public_id == "EVD-761").first()
    ev_esc = db.query(Evidence).filter(Evidence.public_id == "ESC-221").first()
    cse_014 = cse_map["CSE-014"]

    # Seed SIG-2004 (and SIG-EG-01) for Relational Traceability
    signals_data = [
        {
            "signal_id": "SIG-2004",
            "engine": "EXECUTION_GAP",
            "engine_version": "1.4.2",
            "cse_id": cse_014.id,
            "control_id": ctrl_07.id if ctrl_07 else None,
            "priority": "CRITICAL",
            "score": 0.88,
            "status": "CANDIDATE",
            "title": "Mandatory Tier-2 Regulatory SOAR Escalation Dispatch Omission",
            "summary": "CASE-1042 OT SCADA alarm triaged locally and closed without mandatory Tier-2 outbound escalation dispatch.",
            "expected": "Mandatory tier-2 escalation dispatched to regulatory authorities within 15 minutes of grid outage classification.",
            "observed": "Incident triaged locally on workstation EX-04 and closed without outbound SOAR dispatch record.",
            "explanation": "Algorithmic execution gap analysis detected missing dispatch record ESC-221 during CASE-1042 lifecycle.",
            "evidence": [ev_1042, ev_742, ev_esc],
        },
        {
            "signal_id": "SIG-EG-01",
            "engine": "EXECUTION_GAP",
            "engine_version": "1.4.2",
            "cse_id": cse_014.id,
            "control_id": ctrl_07.id if ctrl_07 else None,
            "priority": "HIGH",
            "score": 0.75,
            "status": "CANDIDATE",
            "title": "Missing Tier-2 Regulatory SOAR Escalation Dispatch",
            "summary": "Incident INV-338 was marked as closed without required cryptographic Level-2 escalation packet ESC-221.",
            "expected": "Mandatory tier-2 escalation dispatched within 30 minutes for critical OT telemetry anomalies.",
            "observed": "Investigation marked resolved and closed directly without escalation gateway token.",
            "explanation": "Execution Gap: Missing mandatory Tier-2 regulatory escalation step.",
            "evidence": [ev_742, ev_761, ev_esc],
        },
    ]

    sig_obj_map = {}
    for s_info in signals_data:
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
        sig_obj_map[s_info["signal_id"]] = sig

    db.commit()

    # 10. Seed Fused Assessment Context
    from app.services.fusion_service import FusionService
    try:
        FusionService.fuse_context(
            db=db,
            cse_identifier="CSE-014",
            control_identifier="CTRL-07",
            fusion_id="FUS-014-01",
        )
    except Exception as exc:
        logger.warning(f"Fusion seeding note: {exc}")

    # 11. Seed Findings (FND-0142 and FND-021)
    findings_data = [
        {
            "public_id": "FND-0142",
            "cse_id": cse_014.id,
            "control_id": ctrl_07.id if ctrl_07 else None,
            "assessment_id": cycle_map["ASM-2026-Q3"].id,
            "title": "Execution Gap in Escalation Handling",
            "why_flagged": "System identified a supervisory signal because the observed evidence differs from the expected process baseline: investigation process bypassed mandatory Tier-2 regulatory transmission protocol within statutory time window. Alert ALR-44218 was closed in CASE-1042 without required Level-2 incident escalation token.",
            "signal_type": "EXECUTION_GAP",
            "priority": "CRITICAL",
            "evidence_strength": "HIGH",
            "completeness": 78,
            "uncertainty": "LOW",
            "status": "UNDER_REVIEW",
            "expected_state": "Mandatory Tier-2 regulatory escalation required within 30 minutes for critical OT telemetry anomalies prior to case closure.",
            "observed_state": "Investigation marked resolved and closed directly at 10:22 without recording Tier-2 escalation gateway token or supervisor authorization.",
            "gap_summary": "GAP-0071: Missing Mandatory Tier-2 Escalation Step",
            "rule_version": "R-2.4",
            "control_version": "CTRL-v3.2",
            "analytics_engine_version": "AN-1.8",
            "signals": [sig_obj_map.get("SIG-2004"), sig_obj_map.get("SIG-EG-01")],
            "evidence": [ev_1042, ev_742, ev_761, ev_esc],
        },
        {
            "public_id": "FND-021",
            "cse_id": cse_014.id,
            "control_id": ctrl_07.id if ctrl_07 else None,
            "assessment_id": cycle_map["ASM-2026-Q3"].id,
            "title": "Unrecorded Regulatory Escalation Token (CASE-1042)",
            "why_flagged": "Relational traceability link from SIG-2004: absence of dispatch record ESC-221 for SCADA substation PLC boundary alarm.",
            "signal_type": "EXECUTION_GAP",
            "priority": "HIGH",
            "evidence_strength": "HIGH",
            "completeness": 85,
            "uncertainty": "LOW",
            "status": "CANDIDATE",
            "expected_state": "Mandatory outbound regulatory dispatch verified in enclave ledger.",
            "observed_state": "Telemetry indicates containment without prior escalation.",
            "gap_summary": "GAP-0072: Escalation Gateway Token Missing",
            "rule_version": "R-2.4",
            "control_version": "CTRL-v3.2",
            "analytics_engine_version": "AN-1.8",
            "signals": [sig_obj_map.get("SIG-2004")],
            "evidence": [ev_1042, ev_742],
        }
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
                rule_version=f_info["rule_version"],
                control_version=f_info["control_version"],
                analytics_engine_version=f_info["analytics_engine_version"],
            )
            db.add(fnd)
            db.flush()

            for sig_item in f_info["signals"]:
                if sig_item:
                    slink = FindingSignalLink(finding_id=fnd.id, signal_id=sig_item.id)
                    db.add(slink)

            for ev_item in f_info["evidence"]:
                if ev_item:
                    elink = FindingEvidenceLink(finding_id=fnd.id, evidence_id=ev_item.id, relevance="PRIMARY")
                    db.add(elink)

            # Add initial candidate audit event
            init_audit = AuditEvent(
                event_id=f"AUD-INIT-{fnd.public_id}",
                finding_id=fnd.id,
                user_id=lead_user.id,
                examiner_badge="Automated Analytical Enclave Engine",
                action="CREATE_CANDIDATE",
                previous_status=None,
                new_status=fnd.status,
                reason="Corroborated analytical engine detection",
                notes="Candidate finding promoted from analytical signals and fused evidence context.",
            )
            db.add(init_audit)

    db.commit()

    # 10. Seed Remediation Mandates & Verification Gates
    fnd_142 = db.query(Finding).filter(Finding.public_id == "FND-0142").first()
    fnd_21 = db.query(Finding).filter(Finding.public_id == "FND-021").first()
    cse_014 = db.query(CSE).filter(CSE.public_id == "CSE-014").first()
    cse_007 = db.query(CSE).filter(CSE.public_id == "CSE-007").first()

    rem_38 = db.query(Remediation).filter(Remediation.remediation_id == "REM-0038").first()
    if not rem_38 and fnd_142 and cse_014:
        rem_38 = Remediation(
            remediation_id="REM-0038",
            finding_id=fnd_142.id,
            cse_id=cse_014.id,
            finding_public_id="FND-0142",
            cse_public_id="CSE-014",
            cse_name="NorthGrid Energy",
            control_ref="CTRL-07 v3.2",
            mandate_title="Undocumented Escalation Omission During Grid Outage Incident INV-338",
            action_summary="Review CTRL-07 escalation workflow & submit cryptographic telemetry for INV-338 tier-2 dispatch.",
            owner="CSE-014 Evidence Team",
            priority="CRITICAL",
            due_date="04 Oct 2026",
            days_remaining=8,
            evidence_progress="2/3",
            status="OPEN",
            artifacts=json.dumps([
                {"id": "EVD-742", "name": "Investigation Worklog (INV-338 Triage Runbook)", "hash": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069", "status": "PRESENT_VERIFIED"},
                {"id": "EVD-761", "name": "Containment Firewall Push Logs (SCADA Boundary)", "hash": "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2", "status": "PRESENT_VERIFIED"},
                {"id": "ESC-221", "name": "Tier-2 Escalation Dispatch Telemetry Packet", "hash": "PENDING_UPLOAD_HASH", "status": "MISSING_MANDATORY"}
            ]),
            milestones=json.dumps([
                {"date": "26 Sep 2026 14:18 IST", "title": "Finding FND-0142 Synthesized", "actor": "SYS:SAT-FUSION", "detail": "Automated gap synthesis identified CTRL-07 breach.", "completed": True},
                {"date": "26 Sep 2026 14:20 IST", "title": "Remediation Mandate REM-0038 Instantiated", "actor": "NC-8802 (Lead Examiner)", "detail": "Lead Examiner validated mandate conditions.", "completed": True},
                {"date": "26 Sep 2026 14:22 IST", "title": "Assigned to CSE-014 Evidence Team", "actor": "NC-8802 (Lead Examiner)", "detail": "State set to OPEN with 8-day SLA horizon.", "completed": True},
                {"date": "27 Sep 2026 09:15 IST", "title": "Formal Evidence Demand for ESC-221 Dispatched", "actor": "NC-8802 (Lead Examiner)", "detail": "Demanded raw cryptographic dispatch payload.", "completed": True}
            ])
        )
        db.add(rem_38)
        db.flush()

        db.add(RemediationFinding(remediation_id=rem_38.id, finding_id=fnd_142.id))

        # Seed Verification Result for REM-0038
        vrf_38 = VerificationResult(
            verification_id="VRF-0038",
            remediation_id=rem_38.id,
            finding_id=fnd_142.id,
            cse_id=cse_014.id,
            mandate_public_id="REM-0038",
            finding_public_id="FND-0142",
            cse_public_id="CSE-014",
            cse_name="NorthGrid Energy",
            control_id="CTRL-07 v3.2",
            cycle="Q3 2026",
            lead_examiner="NC-8802 (Lead Examiner)",
            statutory_standard="NCIIPC Framework Sec 12(a) & Rule 4.8.2",
            submitted_at="26 Sep 2026 14:22 IST",
            evaluated_at="27 Sep 2026 09:15 IST",
            verification_verdict="EVIDENCE_LOCKED",
            confidence_score=68,
            evidence_completeness=67,
            merkle_root_hash="0x9af8b12204cc19ef7b28a994c1e40019283746194180",
            remedial_summary="Mandate requires cryptographic verification of Level 2 SOAR dispatch telemetry during incident INV-338.",
            supervisory_rationale="Awaiting mandatory telemetry ESC-221 from NorthGrid. Statutory closure gate remains locked.",
            submitted_artifacts=json.dumps([
                {"id": "EVD-742", "name": "INV-338 Triage Runbook Audit Export", "hash": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069", "verified": True},
                {"id": "EVD-761", "name": "Containment Firewall Push Logs (SCADA Boundary)", "hash": "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2", "verified": True},
                {"id": "ESC-221", "name": "Tier-2 Escalation Dispatch Telemetry Packet", "hash": "NOT_SUBMITTED", "verified": False}
            ]),
            pass_fail="PENDING"
        )
        db.add(vrf_38)
        db.flush()

        gates_data = [
            ("gate-1", "DOCUMENTARY_VERIFICATION", "Mandate Scope Formally Communicated to CSE", True, True, None),
            ("gate-2", "TECHNICAL_RETEST", "Cryptographic Attestation of Playbook Update v2.4", True, True, None),
            ("gate-3", "EVIDENCE_REQUIREMENT", "Mandatory Telemetry Packet ESC-221 Ingested", False, True, "Statutory blocker: Missing raw dispatch payload"),
            ("gate-4", "PROCESS_CONFORMANCE", "Cross-Source Petri Net Process Conformance (PM4Py)", False, True, None),
            ("gate-5", "EXAMINER_REVIEW", "Immutable FIPS-140-2 Level 3 Hash Sealed", False, True, None),
        ]
        for gid, gtype, glabel, gver, greq, gnote in gates_data:
            db.add(VerificationGate(
                gate_id=gid,
                verification_result_id=vrf_38.id,
                remediation_id=rem_38.id,
                gate_type=gtype,
                label=glabel,
                verified=gver,
                required=greq,
                note=gnote,
                evidence_requirement="Statutory cryptographic proof"
            ))

    # 11. Seed Stratified Supervisory Sampling Run & Items
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
            ("SMP-001", "CASE-014-CTRL07", "CSE-014", "NorthGrid Energy", "CTRL-07", "CRITICAL", "RISK_BASED", "Severe escalation timing discrepancy in grid SCADA containment telemetry.", "HIGH", "PRESENT", True),
            ("SMP-002", "CASE-007-CTRL04", "CSE-007", "State Bank of Bharat Interbank Core", "CTRL-04", "HIGH", "EVIDENCE_BASED", "Missing MFA hardware challenge proof on interbank root bastion.", "MEDIUM", "NOT_SUBMITTED", False),
            ("SMP-003", "CASE-009-CTRL02", "CSE-009", "Airports Authority Operations", "CTRL-02", "HIGH", "ANOMALY_BASED", "Privileged session duration deviated +320% from peer airport cohort.", "HIGH", "PRESENT", False),
            ("SMP-004", "CASE-014-CTRL09", "CSE-014", "NorthGrid Energy", "CTRL-09", "MEDIUM", "RECURRENCE_BASED", "ICS relay firewall patching SLA breached in 2 consecutive cycles.", "HIGH", "PRESENT", True),
            ("SMP-005", "CASE-003-CTRL01", "CSE-003", "National Stock Exchange Core", "CTRL-01", "LOW", "BASELINE_RANDOM", "Normative statistical sample drawn for financial matching core.", "HIGH", "PRESENT", False),
        ]

        count = 0
        for smp_id, cid, c_pub_id, c_name, c_ref, prio, meth, reason, ev_str, ev_stat, sel in sample_templates:
            target_cse = db.query(CSE).filter(CSE.public_id == c_pub_id).first() or cse_014
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
                signals=json.dumps(["EXECUTION_GAP", "NEGATIVE_SPACE"])
            )
            db.add(s_item)
            count += 1
        s_run.total_items = count

    # 13. Seed Governance Versions
    if db.query(SystemVersion).count() == 0:
        sys_v1 = SystemVersion(
            version="3.2.0",
            release_name="Apex Sovereign Supervisor",
            component="SAT_SA_CORE",
            status="ACTIVE",
            changelog="Unified Governance workspace, append-only cryptographic audit ledger, and multi-layer graph topology.",
            git_commit="a7f89b4c2e11",
        )
        sys_v2 = SystemVersion(
            version="3.1.0",
            release_name="Foundational Sovereign Enclave",
            component="SAT_SA_CORE",
            status="SUPERSEDED",
            changelog="Baseline telemetry normalization, OCSF canonical pipeline, and initial evidence vault.",
            git_commit="89f3014a9ecb",
        )
        db.add_all([sys_v1, sys_v2])

    if db.query(RuleVersion).count() == 0:
        rules_seed = [
            ("R-EG-01", "execution-gap", "2.4.0", "Tier-2 Incident Escalation Timeliness Rule", "Mandates cryptographic dispatch proof within 30 minutes of high-severity incident.", "3a8f9c118742b0", {"sla_minutes": 30, "mandatory_packet": "ESC-221"}),
            ("R-NS-02", "negative-space", "2.3.1", "Telemetry Silence / Ingestion Void Detector", "Detects missing expected heartbeats and reporting blackout windows exceeding 60 minutes.", "99bca40277df19", {"silence_threshold_minutes": 60}),
            ("R-COV-01", "coverage", "1.8.0", "Substation Relay Perimeter Coverage Baseline", "Evaluates proportion of critical OT control surfaces mapped to live evidence.", "71a2e88b9015c3", {"minimum_coverage_ratio": 0.85}),
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
            ("PIP-2026-0927-01", "SUPERVISORY_FULL_CYCLE", "v3.1.0", "SCHEDULED", "SUCCESS", 8, 24, 1420.5),
            ("PIP-2026-0926-02", "AIR_GAP_INGESTION_SWEEP", "v3.1.0", "EVENT", "SUCCESS", 8, 6, 612.3),
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
                started_at=datetime.now(timezone.utc),
                completed_at=datetime.now(timezone.utc),
            ))

    # 14. Seed Initial Append-Only Audit Trail Records
    if db.query(AuditEvent).count() == 0:
        audit_seeds = [
            ("AUD-2026-004829", "NC-8802", "VERIFICATION_COMPLETED", "REMEDIATION", "REM-001", "Human verification gate checked and sealed with FIPS digest", "VERIFIED"),
            ("AUD-2026-004828", "NC-8802", "FINDING_QUALIFIED", "FINDING", "FND-0142", "Statutory supervisory determination: Finding formally qualified", "QUALIFIED"),
            ("AUD-2026-004825", "INGEST_GATEWAY", "EVIDENCE_INGESTED", "EVIDENCE", "EVD-742", "Raw investigation worklog ingested and verified with SHA-256", "VALID"),
            ("AUD-2026-004820", "USR-001", "LOGIN_SUCCESS", "AUTH", "USR-001", "Enclave session authentication verified via FIPS smartcard", "ACTIVE"),
            ("AUD-2026-004815", "ENGINE_RUNNER", "ANALYSIS_EXECUTED", "ENGINE", "execution-gap", "Analytical engine execution completed across 8 entities", "SUCCESS"),
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
                created_at=datetime.now(timezone.utc),
            ))

    db.commit()
    logger.info("Database, evidence, signals, findings, sampling, remediation, governance, and audit seeding completed!")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
