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
    
    # Auto-ensure all tables exist in active database (Postgres or SQLite fallback)
    try:
        from app.db.session import engine, Base
        import app.db.models  # noqa
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema validated/created successfully.")
    except Exception as exc:
        logger.warning(f"Error ensuring database tables: {exc}")

    # Auto-seed demonstration data if requested and users table is empty
    try:
        from app.db.session import SessionLocal
        from app.db.models.user import User
        db = SessionLocal()
        user_count = db.query(User).count()
        if user_count == 0:
            logger.info("Database empty, running initial demonstration seed...")
            from scripts.seed_demo_data import seed_database
            seed_database(db=db)
            logger.info("Demonstration database seeded successfully.")
        db.close()
    except Exception as exc:
        logger.warning(f"Note on startup seeding check: {exc}")

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

# Register CORS Middleware — allow all origins for cross-origin Vercel→Render deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
