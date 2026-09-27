import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.db.models.cse import CSE
from app.db.models.control import Control
from app.db.models.evidence import Evidence
from app.db.models.signal import Signal
from app.db.models.finding import Finding, AuditEvent
from app.services.fusion_service import FusionService

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


@pytest.fixture(autouse=True)
def reset_test_findings_state():
    db = SessionLocal()
    try:
        f1 = db.query(Finding).filter(Finding.public_id == "FND-0142").first()
        if f1:
            f1.status = "UNDER_REVIEW"
        f2 = db.query(Finding).filter(Finding.public_id == "FND-021").first()
        if f2:
            f2.status = "CANDIDATE"
        db.commit()
    finally:
        db.close()
    yield


# =========================================================================
# 1. TASK GROUP 1: SIGNAL MODEL & API
# =========================================================================
def test_get_signal_detail(supervisor_token):
    """Verify GET /api/v1/signals/{signal_id} returns common signal fields."""
    res = client.get(
        "/api/v1/signals/SIG-2004",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    sig = res.json()
    assert sig["signal_id"] == "SIG-2004"
    assert sig["engine"] == "EXECUTION_GAP"
    assert sig["engine_version"] == "1.4.2"
    assert sig["cse_id"] == "CSE-014"
    assert sig["priority"] == "CRITICAL"
    assert sig["score"] > 0.0
    assert sig["status"] in ("CANDIDATE", "UNDER_REVIEW")
    assert sig["title"] is not None
    assert sig["summary"] is not None
    assert sig["expected"] is not None
    assert sig["observed"] is not None
    assert sig["explanation"] is not None
    assert len(sig["evidence_ids"]) >= 1


# =========================================================================
# 2. TASK GROUP 2: EVIDENCE FUSION
# =========================================================================
def test_evidence_fusion_service():
    """Verify FusionService combines signals, evidence, history, peer, and process without collapsing into an opaque score."""
    db = SessionLocal()
    try:
        fusion = FusionService.fuse_context(
            db=db,
            cse_identifier="CSE-014",
            control_identifier="CTRL-07",
            fusion_id="FUS-TEST-01",
        )
        assert fusion.fusion_id == "FUS-TEST-01"
        assert fusion.cse_id == "CSE-014"
        assert len(fusion.signal_ids) >= 1
        assert len(fusion.evidence_ids) >= 1
        assert 0.0 <= fusion.confidence <= 1.0
        assert len(fusion.rationale) > 20
        # Check that individual context facets are preserved
        assert fusion.historical_context["drift_direction"] == "degrading"
        assert "Cohort" in fusion.peer_context["cohort"]
        assert "PW-04" in fusion.process_context["playbook"]
    finally:
        db.close()


# =========================================================================
# 3. TASK GROUP 3 & 4: FINDING APIS & REVIEW QUEUE
# =========================================================================
def test_list_findings_and_filters(supervisor_token):
    """Verify GET /api/v1/findings supports search, CSE, priority, status filters."""
    # List all
    res = client.get(
        "/api/v1/findings",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 2
    ids = [f["id"] for f in items]
    assert "FND-0142" in ids

    # Filter by CSE
    res_cse = client.get(
        "/api/v1/findings?cse_id=CSE-014",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_cse.status_code == 200
    for f in res_cse.json():
        assert f["cse_id"] == "CSE-014"

    # Search keyword
    res_search = client.get(
        "/api/v1/findings?search=Escalation",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_search.status_code == 200
    assert len(res_search.json()) >= 1


def test_review_queue_endpoint(supervisor_token):
    """Verify GET /api/v1/review/queue returns summary counts and items."""
    res = client.get(
        "/api/v1/review/queue",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert data["summary"]["total_queued"] >= 1
    assert data["summary"]["critical"] >= 1
    assert len(data["items"]) >= 1


# =========================================================================
# 4. TASK GROUP 5: EXAMINER WORKSPACE
# =========================================================================
def test_examiner_workspace_retrieval(supervisor_token):
    """Verify GET /api/v1/findings/{finding_id}/workspace returns all required workspace facets."""
    res = client.get(
        "/api/v1/findings/FND-0142/workspace",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()

    assert data["finding"]["id"] == "FND-0142"
    assert data["why_flagged"] is not None
    assert "expected_trace" in data["expected_vs_observed"]
    assert "observed_trace" in data["expected_vs_observed"]
    assert len(data["supporting_evidence"]) >= 1
    assert data["provenance"]["sha256"] is not None
    assert len(data["decision_history"]) >= 1  # Contains creation audit event
    assert len(data["available_actions"]) >= 1
    assert data["remediation"] is not None


# =========================================================================
# 5. TASK GROUP 6: HUMAN DECISION ENFORCEMENT & AUDIT LOGS
# =========================================================================
def test_lifecycle_validation_and_audit(examiner_token):
    """Verify Examiner can VALIDATE a candidate finding, changing lifecycle and creating AuditEvent."""
    res = client.post(
        "/api/v1/findings/FND-0142/validate",
        json={"notes": "Telemetry inspected; escalation packet confirmed missing.", "reason": "NCIIPC-SEC-70B-CRIT-07"},
        headers={"Authorization": f"Bearer {examiner_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "VALIDATED"
    assert data["decided_by"] is not None
    assert data["decided_at"] is not None

    # Check audit event was created
    ws_res = client.get(
        "/api/v1/findings/FND-0142/workspace",
        headers={"Authorization": f"Bearer {examiner_token}"},
    )
    history = ws_res.json()["decision_history"]
    validate_event = [e for e in history if e["action"] == "VALIDATE"]
    assert len(validate_event) >= 1
    assert validate_event[0]["new_status"] == "VALIDATED"


def test_lifecycle_qualification(supervisor_token):
    """Verify Lead Supervisor can formally QUALIFY a validated finding."""
    res = client.post(
        "/api/v1/findings/FND-0142/qualify",
        json={"notes": "Formally qualified for statutory supervisory mandate.", "reason": "Section 70B Non-Compliance"},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "QUALIFIED"


def test_lifecycle_invalid_transition_enforcement(supervisor_token):
    """Verify backend rejects invalid lifecycle state transitions with 400 Bad Request."""
    # First set FND-0142 to QUALIFIED
    client.post(
        "/api/v1/findings/FND-0142/qualify",
        json={"notes": "Qualify first"},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    # Transition from QUALIFIED to VALIDATED is prohibited
    res = client.post(
        "/api/v1/findings/FND-0142/validate",
        json={"notes": "Invalid backwards jump"},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 400
    error_msg = res.json().get("error", {}).get("message", "") or res.json().get("detail", "")
    assert "Invalid lifecycle transition" in error_msg


def test_lifecycle_rejection(supervisor_token):
    """Verify Examiner can REJECT a candidate finding (e.g. FND-021)."""
    res = client.post(
        "/api/v1/findings/FND-021/reject",
        json={"notes": "Documented emergency bypass approved by grid regulator.", "reason": "Approved Maintenance Window"},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "REJECTED"


def test_lifecycle_override_and_evidence_demand(examiner_token):
    """Verify override and evidence demand actions on a finding."""
    # Evidence Demand moves finding back to UNDER_REVIEW
    res_dem = client.post(
        "/api/v1/findings/FND-021/evidence-demand",
        json={"notes": "Demand submission of emergency bypass authorization slip within 48h.", "reason": "Section 70B Demand"},
        headers={"Authorization": f"Bearer {examiner_token}"},
    )
    assert res_dem.status_code == 200
    assert res_dem.json()["status"] == "UNDER_REVIEW"

    # Override
    res_ovr = client.post(
        "/api/v1/findings/FND-021/override",
        json={"notes": "Examiner discretionary override applied.", "reason": "Model Weight Recalibration"},
        headers={"Authorization": f"Bearer {examiner_token}"},
    )
    assert res_ovr.status_code == 200
    assert res_ovr.json()["status"] == "OVERRIDDEN"


# =========================================================================
# 6. TASK GROUP 7: RELATIONAL TRACEABILITY
# =========================================================================
def test_relational_traceability_chain(supervisor_token):
    """Verify relational navigation across: CSE-014 -> CTRL-07 -> EV-1042 -> SIG-2004 -> FND-021 / FND-0142."""
    db = SessionLocal()
    try:
        # 1. Start at CSE-014
        cse = db.query(CSE).filter(CSE.public_id == "CSE-014").first()
        assert cse is not None

        # 2. Check Control CTRL-07
        ctrl = db.query(Control).filter(Control.public_id == "CTRL-07").first()
        assert ctrl is not None

        # 3. Check Evidence EV-1042
        ev = db.query(Evidence).filter(Evidence.public_id == "EV-1042", Evidence.cse_id == cse.id).first()
        assert ev is not None
        assert ev.control_id == ctrl.id

        # 4. Check Signal SIG-2004 linked to EV-1042
        sig = db.query(Signal).filter(Signal.signal_id == "SIG-2004").first()
        assert sig is not None
        linked_ev_ids = [l.evidence.public_id for l in sig.evidence_links if l.evidence]
        assert "EV-1042" in linked_ev_ids

        # 5. Check Finding FND-0142 linked to SIG-2004 and EV-1042
        fnd = db.query(Finding).filter(Finding.public_id == "FND-0142").first()
        assert fnd is not None
        linked_sig_ids = [l.signal.signal_id for l in fnd.signal_links if l.signal]
        assert "SIG-2004" in linked_sig_ids

        linked_fnd_ev_ids = [l.evidence.public_id for l in fnd.evidence_links if l.evidence]
        assert "EV-1042" in linked_fnd_ev_ids

        # Traceability chain verified end-to-end
    finally:
        db.close()
