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

## 3. Quick Start (Local Prototype)

### Prerequisites
- Python 3.12+
- Node.js 20+ & npm 10+
- (Optional) Docker & Docker Compose for containerized stack

### Step 1: Backend Setup & Database Migration
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run migrations to head
alembic upgrade head

# Ingest and seed synthetic SOC master dataset
python3 -m app.ingestion.pipeline
python3 scripts/seed_demo_data.py

# Launch FastAPI backend on port 8001
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run build    # Validates type safety and asset compilation
npm run dev      # Starts Vite dev server on port 5173 / 8000
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

- **Backend Pytest Suite (78 Tests)**:
  ```bash
  cd backend && .venv/bin/pytest -q
  ```
- **Frontend Type & Bundle Compilation**:
  ```bash
  cd frontend && npm run build
  ```
- **Frontend Code Quality**:
  ```bash
  cd frontend && npx oxlint
  ```

---

## 7. Documentation Index
- [Setup Guide](docs/SAT-SA_SETUP.md)
- [API Reference](docs/SAT-SA_API.md)
- [Demo Walkthrough Script](docs/SAT-SA_DEMO.md)
- [Frontend/Backend Integration Status](docs/SAT-SA_INTEGRATION_STATUS.md)
- [Prototype Readiness Audit](docs/SAT-SA_PROTOTYPE_READINESS.md)
