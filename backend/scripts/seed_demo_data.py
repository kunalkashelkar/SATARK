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
)


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

    logger.info("Database and deterministic evidence seeding successfully completed!")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
