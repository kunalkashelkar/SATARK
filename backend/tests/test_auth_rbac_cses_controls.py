import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_valid_login_supervisor():
    """Verify that lead supervisor can authenticate with valid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_supervisor", "password": "Supervisor@2026!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "lead_supervisor"
    assert data["user"]["role"] == "SUPERVISOR"
    assert data["user"]["display_name"] == "Dr. Aris Thorne"
    assert data["user"]["status"] == "ACTIVE"


def test_invalid_login_wrong_password():
    """Verify that invalid password returns 401."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_supervisor", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_invalid_login_unknown_user():
    """Verify that unknown username returns 401."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "unknown_operative", "password": "AnyPassword!"},
    )
    assert response.status_code == 401


def test_get_me_endpoint():
    """Verify /auth/me returns currently authenticated user."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_supervisor", "password": "Supervisor@2026!"},
    )
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    user_info = response.json()
    assert user_info["id"] == "USR-001"
    assert user_info["username"] == "lead_supervisor"
    assert user_info["role"] == "SUPERVISOR"


def test_unauthorized_without_token():
    """Verify that protected endpoints reject requests without token."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_cse_list_and_detail_supervisor():
    """Verify supervisor can list and inspect all CSEs."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_supervisor", "password": "Supervisor@2026!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List CSEs
    list_res = client.get("/api/v1/cses", headers=headers)
    assert list_res.status_code == 200
    data = list_res.json()
    assert data["total"] >= 3
    cse_ids = [item["cseId"] for item in data["items"]]
    assert "CSE-014" in cse_ids
    assert "CSE-008" in cse_ids

    # Detail CSE-014
    detail_res = client.get("/api/v1/cses/CSE-014", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["cseId"] == "CSE-014"
    assert detail["claimedCapability"] == 24
    assert detail["observedCapability"] == 19
    assert detail["capabilityDiscrepancyCount"] == 5
    assert len(detail["applicableControls"]) >= 1


def test_examiner_access_scope_restriction():
    """Verify that examiner has access only to assigned CSEs (CSE-014, CSE-022) but NOT unassigned (CSE-008)."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_examiner", "password": "Examiner@2026!"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Examiner CAN access assigned CSE-014
    ok_res = client.get("/api/v1/cses/CSE-014", headers=headers)
    assert ok_res.status_code == 200

    # Examiner CANNOT access unassigned CSE-008 -> 403 Forbidden
    forbidden_res = client.get("/api/v1/cses/CSE-008", headers=headers)
    assert forbidden_res.status_code == 403
    assert forbidden_res.json()["error"]["code"] == "FORBIDDEN"

    # Examiner CANNOT register new CSE -> 403 Forbidden
    create_res = client.post(
        "/api/v1/cses",
        headers=headers,
        json={
            "public_id": "CSE-999",
            "name": "Unauthorized Test CSE",
            "sector": "Energy",
        },
    )
    assert create_res.status_code == 403


def test_supervisor_cse_creation_and_update():
    """Verify supervisor can create and update a CSE."""
    import time
    unique_id = f"CSE-{int(time.time() * 1000) % 100000}"

    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_supervisor", "password": "Supervisor@2026!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create new CSE
    create_res = client.post(
        "/api/v1/cses",
        headers=headers,
        json={
            "public_id": unique_id,
            "name": "State Telecommunications Backbone Gateway",
            "sector": "Telecommunications",
            "tier": "TIER-1",
            "claimed_capability": 24,
            "observed_capability": 22,
            "supervisory_priority": "MEDIUM",
        },
    )
    assert create_res.status_code == 201
    assert create_res.json()["cseId"] == unique_id

    # Update new CSE
    patch_res = client.patch(
        f"/api/v1/cses/{unique_id}",
        headers=headers,
        json={"status": "Monitoring", "supervisory_priority": "LOW"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Monitoring"
    assert patch_res.json()["supervisoryPriority"] == "LOW"


def test_control_library_crud():
    """Verify regulatory control catalog listing, detail, creation and update."""
    import time
    unique_ctrl = f"CTRL-{int(time.time() * 1000) % 100000}"
    unique_code = f"SOC.ENC.{int(time.time() * 1000) % 100000}"

    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_supervisor", "password": "Supervisor@2026!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List controls
    list_res = client.get("/api/v1/governance/controls", headers=headers)
    assert list_res.status_code == 200
    controls = list_res.json()
    assert len(controls) >= 3
    ctrl_ids = [c["control_id"] for c in controls]
    assert "CTRL-07" in ctrl_ids

    # Detail CTRL-07
    detail_res = client.get("/api/v1/governance/controls/CTRL-07", headers=headers)
    assert detail_res.status_code == 200
    ctrl = detail_res.json()
    assert ctrl["code"] == "SOC.MON.07"
    assert ctrl["severity"] == "HIGH"
    assert "expected_outcomes" in ctrl
    assert "expected_evidence" in ctrl

    # Create new control
    create_res = client.post(
        "/api/v1/governance/controls",
        headers=headers,
        json={
            "control_id": unique_ctrl,
            "code": unique_code,
            "title": "Air-Gapped Cryptographic Key Custody",
            "domain": "Cryptographic Protection",
            "severity": "CRITICAL",
            "expected_capability": "HSM air-gap enforcement",
            "expected_outcomes": "Dual-custody key split verification",
        },
    )
    assert create_res.status_code == 201
    assert create_res.json()["control_id"] == unique_ctrl

    # Update control
    patch_res = client.patch(
        f"/api/v1/governance/controls/{unique_ctrl}",
        headers=headers,
        json={"severity": "HIGH", "status": "ACTIVE"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["severity"] == "HIGH"


def test_assessment_cycles_apis():
    """Verify assessment cycle creation and retrieval."""
    import time
    unique_asm = f"ASM-{int(time.time() * 1000) % 100000}"

    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_supervisor", "password": "Supervisor@2026!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List assessments
    list_res = client.get("/api/v1/assessments", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 3

    # Create new assessment for CSE-014
    create_res = client.post(
        "/api/v1/cses/CSE-014/assessments",
        headers=headers,
        json={
            "public_id": unique_asm,
            "period": "2026-Q4",
            "status": "IN_PROGRESS",
            "assigned_examiner_username": "lead_examiner",
        },
    )
    assert create_res.status_code == 201
    assert create_res.json()["public_id"] == unique_asm
    assert create_res.json()["assigned_examiner_name"] == "V. K. Raman"
