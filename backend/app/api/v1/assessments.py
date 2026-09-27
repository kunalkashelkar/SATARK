from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_auth, require_role, check_cse_access
from app.db.models.user import User
from app.schemas.assessment import (
    AssessmentCycleItem,
    AssessmentCycleCreateRequest,
    AssessmentCycleUpdateRequest,
)
from app.services.assessment_service import AssessmentService

router = APIRouter(tags=["Assessment Cycles"])


@router.get("/assessments", response_model=List[AssessmentCycleItem], summary="List All Assessment Cycles")
def list_assessments(
    cse_id: Optional[str] = Query(None, description="Filter by CSE identifier"),
    period: Optional[str] = Query(None, description="Filter by period (e.g. 2026-Q3)"),
    status: Optional[str] = Query(None, description="Filter by assessment status"),
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """List supervisory assessment cycles with optional CSE and period filters."""
    if cse_id:
        check_cse_access(cse_id, current_user, db)
    return AssessmentService.list_assessments(db, cse_id=cse_id, period=period, status=status)


@router.get("/cses/{cse_id}/assessments", response_model=List[AssessmentCycleItem], summary="List CSE Assessment Cycles")
def list_cse_assessments(
    cse_id: str,
    period: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Retrieve all assessment cycles for a specific Critical Sector Entity."""
    check_cse_access(cse_id, current_user, db)
    return AssessmentService.list_assessments(db, cse_id=cse_id, period=period, status=status)


@router.post(
    "/cses/{cse_id}/assessments",
    response_model=AssessmentCycleItem,
    status_code=status.HTTP_201_CREATED,
    summary="Initiate New Assessment Cycle"
)
def create_cse_assessment(
    cse_id: str,
    data: AssessmentCycleCreateRequest,
    current_user: User = Depends(require_role("SUPERVISOR", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """Initiate a new statutory assessment cycle for a CSE (Supervisors only)."""
    check_cse_access(cse_id, current_user, db)
    return AssessmentService.create_assessment(db, cse_id, data)


@router.get("/assessments/{assessment_id}", response_model=AssessmentCycleItem, summary="Get Assessment Cycle Detail")
def get_assessment(
    assessment_id: str,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Get single assessment cycle metadata."""
    item = AssessmentService.get_assessment(db, assessment_id)
    check_cse_access(item.cse_id, current_user, db)
    return item


@router.patch("/assessments/{assessment_id}", response_model=AssessmentCycleItem, summary="Update Assessment Cycle")
def update_assessment(
    assessment_id: str,
    data: AssessmentCycleUpdateRequest,
    current_user: User = Depends(require_role("SUPERVISOR", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """Update assessment cycle status, timeframe or assigned examiner."""
    item = AssessmentService.get_assessment(db, assessment_id)
    check_cse_access(item.cse_id, current_user, db)
    return AssessmentService.update_assessment(db, assessment_id, data)
