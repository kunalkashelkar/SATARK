# SAT-SA: Supervisory Analytical Tool for SOC Assessment

**National Critical Information Infrastructure Protection Centre (NCIIPC)**  
*Air-Gapped Sovereign Supervisory Analytical Engine & SOC Assessment Platform*

---

## 1. Overview

SAT-SA (Supervisory Analytical Tool for SOC Assessment) is an authoritative, decoupled supervisory platform designed to independently evaluate, verify, and validate security operational capabilities across Critical Sector Entities (CSEs). 

Operating under statutory regulatory mandates (such as Section 70B of the Information Technology Act), SAT-SA ingests raw operational evidence (SIEM alerts, EDR telemetry, firewall/gateway flows, case management dossiers, ticketing logs, and authentication records), normalizes events to the Open Cybersecurity Schema Framework (OCSF), and executes ten decoupled analytical engines to surface operational discrepancies, negative spaces, and process non-conformance.

### Key Capabilities:
- **10 Autonomous Analytical Engines**: Execution Gap, Negative Space, Telemetry Coverage, Process Conformance (Petri-net), Investigation Quality, Behavioural Shift, Historical Drift, Peer Benchmarking, Cross-Source Consistency, and Metric Integrity.
- **Human-in-the-Loop Adjudication**: Full supervisory workflow supporting validation, statutory qualification, rejection, override, and formal evidence demand.
- **Stratified Supervisory Sampling**: Risk-based, anomaly-driven, and peer-benchmarked sampling methodology with reproducible seed configurations.
- **Remediation & Gate-Based Verification**: Post-finding remediation mandates sealed with cryptographic hash verification and deficiency reopening.
- **Append-Only Cryptographic Audit Ledger**: Immutable audit trail recording every state mutation, user action, and cryptographic attestation.
- **Multi-Layer Knowledge Graph**: Interactive topological mapping of CSEs, controls, evidence files, analytical signals, findings, and remediation mandates.

---

## 2. Architecture & Components

| Layer | Technology Stack | Description |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Recharts | Sovereign UI conforming to NCIIPC supervisory design tokens. Zero operational mock fallbacks. |
| **Backend API** | FastAPI, Python 3.12+, Pydantic v2 | High-performance asynchronous REST API implementing statutory supervisory workflows. |
| **Relational Database** | PostgreSQL 16 (or local SQLite fallback) | ACID relational storage managed via Alembic database migrations. |
| **Telemetry Analytics** | ClickHouse / DuckDB / Parquet | High-speed analytical column stores for OCSF normalized telemetry inspection. |
| **Containerization** | Docker, Docker Compose, Nginx | Standard multi-container air-gapped sovereign deployment stack. |

---

## 3. Deployment & Quick Start

### 3.1 Single-Host Production Deployment (Docker Compose)
In production deployment, SAT-SA is accessible through a single host endpoint via an internal Nginx reverse proxy. PostgreSQL and internal backend ports are isolated inside the internal container network and never exposed publicly.

```
Browser
  ↓
Single SAT-SA Host (http://<host>:8000 or http://<host>:80)
  ↓
Nginx Reverse Proxy
  ├── Frontend Static Assets (React SPA)
  ├── /health & /ready (Root Health Checks)
  └── /api/* → FastAPI Backend (:8001)
                  ↓
             PostgreSQL (:5432) + Parquet / Canonical Evidence Vault
```

#### Step-by-Step Production Launch:
1. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
2. **Build and Launch Containerized Stack**:
   ```bash
   docker compose up -d --build
   ```
   *Note: Containers automatically handle database readiness checks, execute `alembic upgrade head`, and seed the synthetic demonstration dataset.*
3. **Verify Deployment Health**:
   ```bash
   curl -s http://localhost:8000/health
   curl -s http://localhost:8000/ready
   ```
4. **Access the Application**:
   Navigate your browser to `http://localhost:8000` (or your configured `HOST_PORT`).

#### Common Lifecycle Commands:
- **View Container Logs**:
  ```bash
  docker compose logs -f backend
  ```
- **Run Migrations Manually**:
  ```bash
  docker compose exec backend alembic upgrade head
  ```
- **Re-seed / Reset Synthetic Dataset**:
  ```bash
  docker compose exec backend python3 scripts/seed_demo.py --reset --seed --verify
  ```
- **Restart Stack**:
  ```bash
  docker compose restart
  ```
- **Stop Stack (Preserving Data Volumes)**:
  ```bash
  docker compose down
  ```
- **Backup PostgreSQL Database**:
  ```bash
  docker compose exec postgres pg_dump -U sat_sa -d sat_sa > backup_sat_sa_$(date +%Y%m%d).sql
  ```
- **Restore PostgreSQL Database**:
  ```bash
  docker compose exec -T postgres psql -U sat_sa -d sat_sa < backup_sat_sa.sql
  ```

---

### 3.2 Standalone Local Development
For development without Docker containers:

#### Step 1: Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run migrations and seed synthetic dataset
alembic upgrade head
python3 scripts/seed_demo.py --seed --verify

# Launch FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

#### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts local Vite development server
```

---

## 4. Default Demonstration Credentials

| Role | Username | Password | Enclave Permissions |
|---|---|---|---|
| **Lead Supervisor** | `lead_supervisor` | `Supervisor@2026!` | Full supervisory oversight, qualification, override, evidence demand |
| **Lead Examiner** | `lead_examiner` | `Examiner@2026!` | Technical evaluation, evidence verification, gate validation |

---

## 5. End-to-End Core Demo Workflow

1. **Authentication**: Login as `lead_supervisor` at `/login`.
2. **Supervisory Overview**: Review live sector portfolio KPIs, critical entities, and open gap trends at `/overview`.
3. **Critical Sector Entity**: Navigate to `/supervision/cses` and open **CSE-014** (Western Grid Operations).
4. **Analytical Signals**: Navigate to `/analysis/execution-gap` and inspect **SIG-2004** (Mandatory Tier-2 Regulatory SOAR Escalation Dispatch Omission).
5. **Evidence Tracing**: Trace supporting telemetry **EV-1042** at `/evidence`, verifying SHA-256 hash `3d9eb5...` and provenance.
6. **Finding Adjudication**: Open Finding **FND-021** at `/review`, validate evidence, and issue formal decision.
7. **Remediation Mandate**: Open Remediation **RM-008** at `/remediation` and inspect required statutory artifacts.
8. **Supervisory Verification**: Review Verification Record **VR-004**, toggle gates, and verify proof.
9. **Audit Ledger & Graph**: Inspect the immutable audit ledger at `/governance?tab=audit` and view the entity graph at `/graph`.

---

## 6. Verification & Test Commands

- **Backend Pytest Suite (78 Tests - 100% Pass)**:
  ```bash
  cd backend && .venv/bin/pytest -q
  ```
- **Database Verification Tool**:
  ```bash
  cd backend && .venv/bin/python scripts/seed_demo.py --verify
  ```
- **Frontend Production Build Verification**:
  ```bash
  cd frontend && npm run build
  ```

---

## 7. Documentation Index
- [Setup Guide](docs/SAT-SA_SETUP.md)
- [API Reference](docs/SAT-SA_API.md)
- [Demo Walkthrough Script](docs/SAT-SA_DEMO.md)
- [Frontend/Backend Integration Status](docs/SAT-SA_INTEGRATION_STATUS.md)
- [Prototype Readiness Audit](docs/SAT-SA_PROTOTYPE_READINESS.md)
