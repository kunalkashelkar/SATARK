import hashlib
import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.evidence.canonical_model import CanonicalEvent
from app.evidence.normalization import (
    EventNormalizer,
    SIEMParser,
    TicketingParser,
    EDRParser,
    NetworkGatewayParser,
    AuthenticationParser,
    CaseManagementParser,
    SOCMetricsParser,
)
from app.evidence.storage import EvidenceStorage
from app.evidence.duckdb_adapter import duckdb_adapter
from app.evidence.clickhouse_adapter import clickhouse_adapter

client = TestClient(app)


@pytest.fixture(scope="module")
def supervisor_token():
    res = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_supervisor", "password": "Supervisor@2026!"},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.fixture(scope="module")
def examiner_token():
    res = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_examiner", "password": "Examiner@2026!"},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


# =========================================================================
# 1. CANONICAL MODEL & NORMALIZATION PARSERS
# =========================================================================
def test_all_seven_normalizers():
    """Verify normalization across all 7 required SOC sources preserving original references."""
    # 1. SIEM
    siem = EventNormalizer.normalize_record(
        {"alert_id": "ALR-881", "rule_name": "SCADA Breach", "severity": "CRITICAL", "analyst": "A. Sen"},
        "SIEM", "CSE-014"
    )
    assert siem.source == "SIEM"
    assert siem.event_class == "security_finding"
    assert siem.raw_reference == "ALR-881"
    assert siem.actor == "A. Sen"
    assert siem.severity == "CRITICAL"
    assert siem.metadata["rule_name"] == "SCADA Breach"

    # 2. Ticketing
    tick = EventNormalizer.normalize_record(
        {"ticket_id": "INC-4412", "status": "IN_PROGRESS", "assignee": "K. Dave", "priority": "HIGH"},
        "TICKETING", "CSE-014"
    )
    assert tick.source == "TICKETING"
    assert tick.raw_reference == "INC-4412"
    assert tick.action == "IN_PROGRESS"
    assert tick.actor == "K. Dave"

    # 3. EDR
    edr = EventNormalizer.normalize_record(
        {"detection_id": "EDR-901", "hostname": "srv-scada", "process_name": "mal.exe", "action": "BLOCKED"},
        "EDR", "CSE-014"
    )
    assert edr.source == "EDR"
    assert edr.raw_reference == "EDR-901"
    assert edr.action == "BLOCKED"
    assert edr.metadata["hostname"] == "srv-scada"

    # 4. Network Gateway
    gw = EventNormalizer.normalize_record(
        {"log_id": "GW-9901", "action": "DROP", "dest_port": 502, "protocol": "TCP"},
        "GATEWAY", "CSE-014"
    )
    assert gw.source == "GATEWAY"
    assert gw.raw_reference == "GW-9901"
    assert gw.action == "DROP"
    assert gw.metadata["dest_port"] == 502

    # 5. Authentication
    auth = EventNormalizer.normalize_record(
        {"auth_id": "AUTH-102", "username": "admin_ot", "success": False, "client_ip": "10.14.2.5"},
        "AUTH", "CSE-014"
    )
    assert auth.source == "AUTH"
    assert auth.raw_reference == "AUTH-102"
    assert auth.actor == "admin_ot"
    assert auth.action == "LOGIN_FAILED"
    assert auth.severity == "HIGH"

    # 6. Case Management
    cm = EventNormalizer.normalize_record(
        {"case_ref": "CASE-1042", "lead_analyst": "V. Rao", "phase": "CONTAINMENT"},
        "CASE_MGMT", "CSE-014"
    )
    assert cm.source == "CASE_MGMT"
    assert cm.raw_reference == "CASE-1042"
    assert cm.action == "CONTAINMENT"
    assert cm.actor == "V. Rao"

    # 7. SOC Metrics
    met = EventNormalizer.normalize_record(
        {"metric_id": "MT-MTTR-01", "name": "MTTR_SCADA", "value": 14.5, "unit": "minutes"},
        "METRICS", "CSE-014"
    )
    assert met.source == "METRICS"
    assert met.raw_reference == "MT-MTTR-01"
    assert met.metadata["reported_value"] == 14.5


# =========================================================================
# 2. EVIDENCE LIST & SEARCH APIS
# =========================================================================
def test_get_evidence_list_and_filters(supervisor_token):
    """Verify GET /api/v1/evidence supports search, pagination, and multi-criteria filters."""
    # List all
    res = client.get(
        "/api/v1/evidence",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert data["total"] >= 1
    assert data["page"] == 1

    # Filter by CSE
    res_cse = client.get(
        "/api/v1/evidence?cse_id=CSE-014",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_cse.status_code == 200
    for item in res_cse.json()["items"]:
        assert item["cse_id"] == "CSE-014"

    # Filter by category
    res_cat = client.get(
        "/api/v1/evidence?category=ALERT",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_cat.status_code == 200
    for item in res_cat.json()["items"]:
        assert item["category"] == "ALERT"

    # Search keyword
    res_search = client.get(
        "/api/v1/evidence?search=EV-1042",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_search.status_code == 200
    assert len(res_search.json()["items"]) >= 1
    assert res_search.json()["items"][0]["evidence_id"] == "EV-1042"


def test_get_evidence_detail_and_provenance(supervisor_token):
    """Verify GET /api/v1/evidence/{evidence_id} returns detail, hash, and provenance."""
    res = client.get(
        "/api/v1/evidence/EV-1042",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["evidence_id"] == "EV-1042"
    assert data["cse_id"] == "CSE-014"
    assert len(data["sha256"]) == 64
    assert data["provenance"] is not None
    assert data["provenance"]["collector"] in ("sat-collector-v2.8-fips", "COL-SIEM-02")
    assert len(data["provenance"]["custody_chain"]) >= 2
    assert len(data["control_links"]) >= 1
    assert data["control_links"][0]["control_code"] == "SOC.MON.07"


# =========================================================================
# 3. EVIDENCE INGESTION & GENUINE CRYPTOGRAPHIC SHA-256
# =========================================================================
def test_evidence_ingestion_and_sha256(supervisor_token):
    """Verify POST /api/v1/evidence produces genuine cryptographic SHA-256 and Parquet artifact."""
    import uuid
    test_id = f"EV-TEST-{uuid.uuid4().hex[:6].upper()}"

    payload = {
        "evidence_id": test_id,
        "cse_id": "CSE-014",
        "control_code": "CTRL-07",
        "category": "ALERT",
        "state": "PRESENT",
        "source_system": "SIEM",
        "source_event_id": "ALR-TEST-001",
        "events": [
            {
                "alert_id": "ALR-TEST-001",
                "timestamp": "2026-09-27T10:00:00Z",
                "title": "SCADA Unauthorized Variable Access",
                "severity": "HIGH",
                "analyst": "T. Tester",
                "case_id": "CASE-9999",
            }
        ],
        "provenance": {
            "collector": "sat-collector-v2.8-fips",
            "transmission_token": "TOK-TEST-TOKEN",
            "source_host": "sec-gw.northgrid.internal",
            "source_ip": "10.14.0.50",
            "custody_chain": ["Air-Gap Ingest", "Supervisory Vault"],
        }
    }

    res = client.post(
        "/api/v1/evidence",
        json=payload,
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["evidence_id"] == test_id
    assert data["sha256"] is not None
    assert len(data["sha256"]) == 64

    # Verify Parquet file exists on disk and recomputed hash matches exactly
    file_path = data["file_path"]
    assert os.path.exists(file_path)

    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        hasher.update(f.read())
    recomputed = hasher.hexdigest()

    assert data["sha256"] == recomputed, "DB hash must match genuine cryptographic disk SHA-256"


def test_prevent_silent_replacement(supervisor_token):
    """Verify that attempting to re-ingest an existing evidence_id returns 409 Conflict."""
    payload = {
        "evidence_id": "EV-1042",
        "cse_id": "CSE-014",
        "category": "ALERT",
        "state": "PRESENT",
        "source_system": "SIEM",
    }
    res = client.post(
        "/api/v1/evidence",
        json=payload,
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 409
    error_msg = res.json().get("error", {}).get("message", "") or res.json().get("detail", "")
    assert "already exists" in error_msg


# =========================================================================
# 4. VALIDATION & INTEGRITY VERIFICATION
# =========================================================================
def test_evidence_validation_endpoint(supervisor_token):
    """Verify POST /api/v1/evidence/{evidence_id}/validate updates validation status."""
    res = client.post(
        "/api/v1/evidence/ESC-221/validate",
        json={"decision": "VALID", "notes": "Attested by lead supervisor"},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    assert res.json()["validation_status"] == "VALID"
    assert res.json()["state"] == "PRESENT"


def test_evidence_integrity_endpoint(supervisor_token):
    """Verify GET /api/v1/evidence/{evidence_id}/integrity returns INTEGRITY_VERIFIED."""
    res = client.get(
        "/api/v1/evidence/EV-1042/integrity",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["evidence_id"] is not None
    assert data["public_id"] == "EV-1042"
    assert data["file_exists"] is True
    assert data["is_valid"] is True
    assert data["status"] == "INTEGRITY_VERIFIED"
    assert data["expected_sha256"] == data["computed_sha256"]


def test_tamper_detection(supervisor_token, tmp_path):
    """Verify that hash tampering is detected immediately during integrity verification."""
    import uuid
    tamper_id = f"EV-TAMPER-{uuid.uuid4().hex[:6].upper()}"
    res = client.post(
        "/api/v1/evidence",
        json={
            "evidence_id": tamper_id,
            "cse_id": "CSE-014",
            "category": "ALERT",
            "source_system": "SIEM",
            "events": [{"alert_id": "A-1", "title": "Before tampering"}],
        },
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 201
    file_path = res.json()["file_path"]

    # Tamper with the file by appending junk bytes
    with open(file_path, "ab") as f:
        f.write(b"TAMPERED_MALICIOUS_EXTRA_BYTES")

    # Now verify integrity: must detect discrepancy
    verify_res = client.get(
        f"/api/v1/evidence/{tamper_id}/integrity",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert verify_res.status_code == 200
    vdata = verify_res.json()
    assert vdata["is_valid"] is False
    assert vdata["status"] == "HASH_MISMATCH_DETECTED"
    assert vdata["computed_sha256"] != vdata["expected_sha256"]


# =========================================================================
# 5. DUCKDB & ANALYTICAL SQL OVER PARQUET
# =========================================================================
def test_duckdb_parquet_analytics():
    """Verify local SQL analytics directly over Parquet evidence files using DuckDB."""
    parquet_path = "data/evidence/CSE-014/EV-1042.parquet"
    assert os.path.exists(parquet_path)

    # Run SQL directly on the Parquet file
    records = duckdb_adapter.query_parquet(
        parquet_path=parquet_path,
        sql_filter="source = 'SIEM'"
    )
    assert len(records) >= 1
    assert records[0]["cse_id"] == "CSE-014"
    assert "event_id" in records[0]
    assert "severity" in records[0]

    # Run analytical aggregation query
    agg = duckdb_adapter.query(
        f"SELECT severity, COUNT(*) as cnt FROM read_parquet('{parquet_path}') GROUP BY severity"
    )
    assert len(agg) >= 1
    assert "cnt" in agg[0]


# =========================================================================
# 6. CLICKHOUSE ADAPTER & OFFLINE BUFFER
# =========================================================================
def test_clickhouse_adapter_offline_resilience():
    """Verify ClickHouse adapter operates gracefully in offline air-gapped environments."""
    events = [
        CanonicalEvent(
            event_id="EVT-CH-001",
            cse_id="CSE-014",
            source="SIEM",
            raw_reference="RAW-CH-01",
        )
    ]
    inserted = clickhouse_adapter.insert_canonical_events(events)
    assert inserted == 1

    # Analytical query over offline buffer works
    rows = clickhouse_adapter.query("SELECT * FROM canonical_telemetry_events WHERE event_id = 'EVT-CH-001'")
    assert len(rows) >= 1
    assert rows[0]["event_id"] == "EVT-CH-001"


# =========================================================================
# 7. RBAC ON EVIDENCE
# =========================================================================
def test_examiner_rbac_scope(examiner_token):
    """Verify Examiner Raman can access CSE-014 evidence, but is forbidden on unauthorized CSE-008."""
    # Raman is authorized for CSE-014
    res_ok = client.get(
        "/api/v1/evidence/EV-1042",
        headers={"Authorization": f"Bearer {examiner_token}"},
    )
    assert res_ok.status_code == 200

    # Ingest evidence for CSE-008 (Western Gas Transmission)
    # First ingest as supervisor
    sup_res = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_supervisor", "password": "Supervisor@2026!"},
    )
    sup_token = sup_res.json()["access_token"]
    client.post(
        "/api/v1/evidence",
        json={
            "evidence_id": "EV-008-RESTRICTED",
            "cse_id": "CSE-008",
            "category": "ALERT",
            "source_system": "SIEM",
        },
        headers={"Authorization": f"Bearer {sup_token}"},
    )

    # Raman tries to access CSE-008 evidence: forbidden
    res_forbidden = client.get(
        "/api/v1/evidence/EV-008-RESTRICTED",
        headers={"Authorization": f"Bearer {examiner_token}"},
    )
    assert res_forbidden.status_code == 403
