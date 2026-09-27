from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import register_exception_handlers
from app.api.router import api_router
from app.api.v1.health import router as root_health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Initializing {settings.APP_NAME} Backend ({settings.APP_VERSION}) on port {settings.API_PORT}...")
    logger.info(f"Enclave ID: {settings.ENCLAVE_ID}, Environment: {settings.APP_ENV}")
    yield
    logger.info(f"Shutting down {settings.APP_NAME} Backend.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Supervisory Analytics Tool for SOC Assessment (SAT-SA) Backend API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Register CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Centralized Exception Handlers
register_exception_handlers(app)

# Include root health routes: GET /health and GET /ready
app.include_router(root_health_router)

# Include API v1 router: GET /api/v1/*
app.include_router(api_router, prefix=settings.API_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=(settings.APP_ENV == "development"),
        log_level=settings.LOG_LEVEL.lower(),
    )
