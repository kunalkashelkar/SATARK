import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.db.models import User, CSE, Control, Role

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["version"] == "OPS-v4.8"
    assert "enclave_id" in data


def test_ready_endpoint():
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "READY"
    assert data["services"]["database"] == "UP"


def test_api_v1_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"


def test_database_entities():
    db = SessionLocal()
    try:
        # Verify seeded roles
        roles = db.query(Role).all()
        assert len(roles) >= 2

        # Verify seeded CSEs
        cses = db.query(CSE).all()
        assert len(cses) >= 3
        cse_ids = [c.public_id for c in cses]
        assert "CSE-014" in cse_ids

        # Verify seeded controls
        ctrl = db.query(Control).filter(Control.public_id == "CTRL-07").first()
        assert ctrl is not None
        assert ctrl.code == "SOC.MON.07"
        assert ctrl.severity == "HIGH"

        # Verify lead user
        lead_user = db.query(User).filter(User.username == "lead_supervisor").first()
        assert lead_user is not None
        assert lead_user.public_id == "USR-001"
    finally:
        db.close()
