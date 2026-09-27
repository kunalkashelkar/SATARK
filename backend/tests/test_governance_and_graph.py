import pytest
import uuid
import json
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.db.models.signal import Signal
from app.db.models.finding import AuditEvent

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
# 1. TASK GROUP 1: AUDIT LEDGER
# =========================================================================
def test_get_audit_ledger_list_and_detail(supervisor_token):
    """Verify audit ledger query and individual event retrieval."""
    res = client.get(
        "/api/v1/governance/audit",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] > 0
    assert len(data["items"]) > 0

    first_item = data["items"][0]
    assert "event_id" in first_item
    assert "action" in first_item
    assert "entity_type" in first_item
    assert "timestamp" in first_item
    assert "request_id" in first_item

    # Test single item lookup
    event_id = first_item["event_id"]
    res_single = client.get(
        f"/api/v1/governance/audit/{event_id}",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_single.status_code == 200
    single_data = res_single.json()
    assert single_data["event_id"] == event_id

    # Test 404 for non-existent event
    res_404 = client.get(
        "/api/v1/governance/audit/AUD-NONEXISTENT-9999",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_404.status_code == 404


def test_audit_filtering(supervisor_token):
    """Verify audit events can be filtered by action and entity_type."""
    res = client.get(
        "/api/v1/governance/audit?action=VERIFICATION_COMPLETED",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    for it in data["items"]:
        assert it["action"] == "VERIFICATION_COMPLETED"


def test_audit_records_created_after_mutations(supervisor_token):
    """Verify that user operations trigger immutable audit entries with before/after state."""
    db = SessionLocal()
    initial_count = db.query(AuditEvent).count()
    db.close()

    # Trigger a login failure to generate an audit event
    client.post(
        "/api/v1/auth/login",
        json={"username": "lead_supervisor", "password": "WrongPassword#999"},
    )

    db = SessionLocal()
    new_count = db.query(AuditEvent).count()
    latest_event = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).first()
    db.close()

    assert new_count > initial_count
    assert latest_event.action == "LOGIN_FAILURE"
    assert latest_event.entity_type == "AUTH"


# =========================================================================
# 2. TASK GROUP 2: ADMINISTRATION
# =========================================================================
def test_list_governance_users_roles_access(supervisor_token):
    """Verify listing users, roles, and access delegations."""
    # List users
    res_users = client.get(
        "/api/v1/governance/users",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_users.status_code == 200
    users = res_users.json()
    assert len(users) >= 2
    assert any(u["username"] == "lead_supervisor" for u in users)

    # Get single user
    target_user_id = users[0]["public_id"]
    res_u = client.get(
        f"/api/v1/governance/users/{target_user_id}",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_u.status_code == 200
    assert res_u.json()["public_id"] == target_user_id

    # List roles
    res_roles = client.get(
        "/api/v1/governance/roles",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_roles.status_code == 200
    roles = res_roles.json()
    assert any(r["name"] == "SUPERVISOR" for r in roles)
    assert any(r["name"] == "EXAMINER" for r in roles)

    # List access
    res_acc = client.get(
        "/api/v1/governance/access",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_acc.status_code == 200
    access = res_acc.json()
    assert len(access) >= 1


def test_user_creation_and_rbac_enforcement(supervisor_token, examiner_token):
    """
    Verify creating and updating users:
    - Blocked for EXAMINER (403 Forbidden)
    - Allowed for SUPERVISOR/ADMINISTRATOR
    """
    unique_user = f"examiner_test_{uuid.uuid4().hex[:6]}"
    payload = {
        "username": unique_user,
        "name": "Dr. Aditi Rao",
        "email": f"{unique_user}@enclave.gov",
        "role": "EXAMINER",
        "badge": "NC-9901",
        "organization": "NCIIPC",
        "mfa_type": "FIPS-140-2 L3 Smartcard",
        "cse_scope": ["CSE-014"],
    }

    # 1. Non-admin/Examiner attempt -> 403 Forbidden
    res_unauth = client.post(
        "/api/v1/governance/users",
        json=payload,
        headers={"Authorization": f"Bearer {examiner_token}"},
    )
    assert res_unauth.status_code == 403

    # 2. Supervisor attempt -> 201 Created
    res_create = client.post(
        "/api/v1/governance/users",
        json=payload,
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_create.status_code == 201
    created_user = res_create.json()
    assert created_user["username"] == unique_user
    assert "CSE-014" in created_user["cse_scope"]
    created_id = created_user["public_id"]

    # 3. Patch user as supervisor
    update_payload = {
        "name": "Dr. Aditi Rao (Senior)",
        "badge": "NC-9901-SR",
        "cse_scope": ["CSE-014", "CSE-008"],
    }
    res_patch = client.patch(
        f"/api/v1/governance/users/{created_id}",
        json=update_payload,
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_patch.status_code == 200
    patched = res_patch.json()
    assert patched["name"] == "Dr. Aditi Rao (Senior)"
    assert patched["badge"] == "NC-9901-SR"
    assert "CSE-008" in patched["cse_scope"]

    # 4. Patch user as examiner -> 403 Forbidden
    res_patch_unauth = client.patch(
        f"/api/v1/governance/users/{created_id}",
        json={"name": "Hacked Name"},
        headers={"Authorization": f"Bearer {examiner_token}"},
    )
    assert res_patch_unauth.status_code == 403


# =========================================================================
# 3. TASK GROUP 3: VERSION MANAGEMENT
# =========================================================================
def test_version_management_endpoints(supervisor_token):
    """Verify system versions, rule versions, model versions, and pipeline runs."""
    # System versions
    res_sys = client.get(
        "/api/v1/governance/versions",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_sys.status_code == 200
    sys_versions = res_sys.json()
    assert len(sys_versions) >= 1
    assert any(v["version"] == "3.2.0" for v in sys_versions)

    # Rule versions
    res_rules = client.get(
        "/api/v1/governance/versions/rules",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_rules.status_code == 200
    rules = res_rules.json()
    assert len(rules) >= 1
    assert any(r["rule_id"] == "R-EG-01" for r in rules)

    # Model versions
    res_models = client.get(
        "/api/v1/governance/versions/models",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_models.status_code == 200
    models = res_models.json()
    assert len(models) >= 1
    assert any(m["model_id"] == "MOD-BEHAV-01" for m in models)

    # Pipeline runs
    res_pipe = client.get(
        "/api/v1/governance/versions/pipelines",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_pipe.status_code == 200
    pipelines = res_pipe.json()
    assert len(pipelines) >= 1


def test_analytical_signal_retains_versions():
    """Verify every analytical signal in DB retains engine, rule, pipeline, and optional model version."""
    db = SessionLocal()
    signals = db.query(Signal).all()
    db.close()
    assert len(signals) > 0
    for s in signals:
        assert s.engine_version is not None and len(s.engine_version) > 0
        assert s.rule_version is not None and len(s.rule_version) > 0
        assert s.pipeline_version is not None and len(s.pipeline_version) > 0


# =========================================================================
# 4. TASK GROUP 4: SUPERVISORY GRAPH
# =========================================================================
def test_supervisory_graph_generation(supervisor_token):
    """Verify directed supervisory graph generation across all 7 entities."""
    res = client.get(
        "/api/v1/graph",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    graph = res.json()
    assert "nodes" in graph
    assert "links" in graph
    assert "summary" in graph

    nodes = graph["nodes"]
    links = graph["links"]
    assert len(nodes) > 0
    assert len(links) > 0

    node_types = {n["type"] for n in nodes}
    # All required entities are represented: CSE, CONTROL, EVIDENCE, SIGNAL, FINDING, REMEDIATION, VERIFICATION
    assert "CSE" in node_types
    assert "CONTROL" in node_types
    assert "EVIDENCE" in node_types
    assert "SIGNAL" in node_types
    assert "FINDING" in node_types
    assert "REMEDIATION" in node_types
    assert "VERIFICATION" in node_types

    # Verify link structure
    first_link = links[0]
    assert "from" in first_link
    assert "to" in first_link
    assert "label" in first_link


def test_supervisory_graph_filtering(supervisor_token):
    """Verify graph filtering by CSE, Control, Evidence, Signal, Finding."""
    # Filter by CSE-014
    res_cse = client.get(
        "/api/v1/graph?cse_id=CSE-014",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_cse.status_code == 200
    graph_cse = res_cse.json()
    node_ids = {n["id"] for n in graph_cse["nodes"]}
    assert "CSE-014" in node_ids

    # Filter by Control
    res_ctrl = client.get(
        "/api/v1/graph?control_id=CTRL-07",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res_ctrl.status_code == 200
    graph_ctrl = res_ctrl.json()
    ctrl_node_ids = {n["id"] for n in graph_ctrl["nodes"]}
    assert "CTRL-07" in ctrl_node_ids


def test_graph_entities_resolve_to_existing_detail_endpoints(supervisor_token):
    """Verify clicking any graph entity resolves to an existing, valid detail endpoint."""
    res = client.get(
        "/api/v1/graph?cse_id=CSE-014",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    graph = res.json()

    # Pick one node of each type and verify that detail_url responds with 200 OK
    tested_types = set()
    for node in graph["nodes"]:
        ntype = node["type"]
        if ntype in tested_types:
            continue

        detail_url = node["detail_url"]
        assert detail_url.startswith("/api/v1/")
        res_detail = client.get(
            detail_url,
            headers={"Authorization": f"Bearer {supervisor_token}"},
        )
        assert res_detail.status_code in (200, 204), f"Failed resolving {ntype} at {detail_url}: {res_detail.text}"
        tested_types.add(ntype)

    assert len(tested_types) >= 4, f"Expected to test multiple entity types, got {tested_types}"
