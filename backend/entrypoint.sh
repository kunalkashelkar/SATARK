#!/usr/bin/env bash
set -e

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [INFO] Starting SAT-SA Enclave Container Entrypoint..."

# Wait for PostgreSQL if DATABASE_URL points to postgres
if [[ "$DATABASE_URL" == *"postgres"* ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [INFO] Verifying PostgreSQL availability..."
    python3 -c "
import time, sys, os
from sqlalchemy import create_engine, text

db_url = os.getenv('DATABASE_URL')
for attempt in range(1, 31):
    try:
        engine = create_engine(db_url, connect_args={'connect_timeout': 3})
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        print(f'[INFO] Database connection established on attempt {attempt}.')
        sys.exit(0)
    except Exception as e:
        print(f'[WAIT] Database not ready yet (attempt {attempt}/30): {e}')
        time.sleep(2)
print('[ERROR] Could not connect to database after 30 attempts.')
if os.getenv('DB_SQLITE_FALLBACK_ON_ERROR', 'false').lower() == 'true':
    print('[WARN] Falling back to SQLite database as configured.')
    sys.exit(0)
sys.exit(1)
"
fi

# Run Database Migrations (alembic upgrade head)
if [ "${AUTO_MIGRATE:-true}" = "true" ]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [INFO] Applying database migrations (alembic upgrade head)..."
    alembic upgrade head || {
        echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [WARN] Alembic upgrade encountered an issue or database already initialized."
    }
fi

# Seed Synthetic Demonstration Data if requested
if [ "${AUTO_SEED:-true}" = "true" ]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [INFO] Seeding synthetic demonstration dataset..."
    python3 scripts/seed_demo.py --seed || {
        echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [WARN] Demonstration seeding note (continuing startup)..."
    }
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [INFO] Starting Uvicorn production server on port ${API_PORT:-8001}..."
exec uvicorn app.main:app --host "${API_HOST:-0.0.0.0}" --port "${API_PORT:-8001}" --workers "${WORKERS:-2}" --log-level "${LOG_LEVEL:-info}"
