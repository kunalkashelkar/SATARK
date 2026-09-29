# SAT-SA: System Setup & Execution Guide

This document describes the complete installation, database migration, synthetic dataset ingestion, and service startup procedures for the SAT-SA supervisory analytics platform.

---

## 1. System Requirements & Prerequisites

- **Operating System**: Linux (Ubuntu 22.04 LTS+, RHEL 9+, Debian 12+) or macOS.
- **Python**: Version 3.12 or higher.
- **Node.js**: Version 20.x or higher with `npm` 10+.
- **Database**: PostgreSQL 16+ (production) or local SQLite 3.38+ (prototype enclave).
- **Analytical Column Store (Optional/Recommended)**: ClickHouse 24.3+ or local embedded DuckDB.

---

## 2. Directory Structure

```text
Supervisory-Analytical-Tool/
├── docker-compose.yml       # Production/enclave multi-container definition
├── README.md                # System overview and entry point
├── docs/                    # Architectural and setup documentation
├── backend/                 # FastAPI REST backend and analytical engines
│   ├── app/                 # Application source code
│   │   ├── analytics/       # 10 Decoupled Analytical Engines
│   │   ├── api/v1/          # Standardized REST endpoint routers
│   │   ├── db/              # SQLAlchemy models, sessions, and Alembic migrations
│   │   ├── evidence/        # Telemetry ingestion, normalization, and ClickHouse adapter
│   │   └── services/        # Supervisory business logic and workflows
│   ├── data/synthetic/      # Authoritative synthetic SOC assessment dataset
│   ├── scripts/             # Demonstration seed and initialization scripts
│   └── tests/               # Pytest automated test suite (78 tests)
└── frontend/                # React 19 + TypeScript + Vite supervisory UI
    ├── src/
    │   ├── api/             # Standardized Axios API clients
    │   ├── components/      # UI components (KpiCard, Tables, Drawers, Modals)
    │   ├── context/         # Centralized SupervisoryContext state management
    │   └── pages/           # Functional supervisory workspaces
```

---

## 3. Database Migration & Initialization

### Environment Variables
Configure `backend/.env` (or copy from `backend/.env.example`):
```env
APP_NAME=SAT-SA
APP_ENV=development
API_HOST=0.0.0.0
API_PORT=8001
SECRET_KEY=sat-sa-enclave-secret-key-change-in-production
DATABASE_URL=sqlite:///./sat_sa.db
DB_SQLITE_FALLBACK_ON_ERROR=true
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
LOG_LEVEL=INFO
```

### Running Alembic Migrations From Scratch
To create or update the database schema from migration version zero:
```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

---

## 4. Dataset Ingestion & Demonstration Seeding

SAT-SA includes an end-to-end ingestion pipeline that parses raw SOC CSV and JSON files, normalizes events to OCSF schemas, generates initial baseline evidence records, and fuses signals:

```bash
cd backend
source .venv/bin/activate

# 1. Ingest synthetic SOC dataset
python3 -m app.ingestion.pipeline

# 2. Seed supervisory demonstration entities, findings, and mandates
python3 scripts/seed_demo_data.py
```

---

## 5. Starting the Backend Server

Launch the FastAPI uvicorn daemon:
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

The OpenAPI documentation is immediately available at `http://localhost:8001/docs`.

---

## 6. Starting the Frontend UI

```bash
cd frontend

# Install dependencies (first run only)
npm install

# Build check
npm run build

# Start Vite development server
npm run dev
```

Access the UI at `http://localhost:5173` or `http://localhost:8000`.

---

## 7. Containerized Deployment (Docker Compose)

For offline air-gapped server environments with Docker installed:
```bash
# Build and launch all services in detached mode
docker compose up -d

# Verify container health
docker compose ps

# View application logs
docker compose logs -f backend
```
