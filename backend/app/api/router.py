from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.cses import router as cses_router
from app.api.v1.assessments import router as assessments_router
from app.api.v1.controls import router as controls_router
from app.api.v1.evidence import router as evidence_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.findings import router as findings_router
from app.api.v1.overview import router as overview_router
from app.api.v1.sampling import router as sampling_router
from app.api.v1.remediation import router as remediation_router
from app.api.v1.verification import router as verification_router
from app.api.v1.governance import router as governance_router
from app.api.v1.graph import router as graph_router

api_router = APIRouter()

# Register V1 modules
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(cses_router)
api_router.include_router(assessments_router)
api_router.include_router(controls_router, prefix="/governance/controls")
api_router.include_router(controls_router, prefix="/controls")
api_router.include_router(evidence_router)
api_router.include_router(analysis_router)
api_router.include_router(findings_router)
api_router.include_router(overview_router)
api_router.include_router(sampling_router)
api_router.include_router(remediation_router)
api_router.include_router(verification_router)
api_router.include_router(governance_router)
api_router.include_router(graph_router)
