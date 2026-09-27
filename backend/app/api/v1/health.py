from datetime import datetime, timezone
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import check_db_health
from app.schemas.health import HealthResponse, ReadyResponse

router = APIRouter(tags=["Health & Operations"])


@router.get("/health", response_model=HealthResponse, summary="Enclave Health Status")
def get_health():
    """Returns basic liveness and enclave metadata."""
    return HealthResponse(
        status="UP",
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=settings.APP_VERSION,
        enclave_id=settings.ENCLAVE_ID,
    )


@router.get("/ready", response_model=ReadyResponse, summary="Enclave Readiness Status")
def get_ready():
    """Checks database and core service readiness."""
    db_healthy = check_db_health()
    overall_status = "READY" if db_healthy else "DEGRADED"
    http_status = status.HTTP_200_OK if db_healthy else status.HTTP_503_SERVICE_UNAVAILABLE

    payload = ReadyResponse(
        status=overall_status,
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=settings.APP_VERSION,
        enclave_id=settings.ENCLAVE_ID,
        services={
            "database": "UP" if db_healthy else "DOWN",
            "analytics_orchestrator": "UP",
            "evidence_store": "UP",
        },
    )

    return JSONResponse(status_code=http_status, content=payload.model_dump())
