from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.cses import router as cses_router
from app.api.v1.assessments import router as assessments_router
from app.api.v1.controls import router as controls_router

api_router = APIRouter()

# Register V1 modules
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(cses_router)
api_router.include_router(assessments_router)
api_router.include_router(controls_router)
