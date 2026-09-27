from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_auth, require_role, check_cse_access
from app.db.models.user import User
from app.schemas.cse import (
    CSEListItem,
    CSEDetailResponse,
    PaginatedCSEResponse,
    CSECreateRequest,
    CSEUpdateRequest,
)
from app.services.cse_service import CSEService

router = APIRouter(prefix="/cses", tags=["CSE Assessments"])


@router.get("", response_model=PaginatedCSEResponse, summary="List Supervised Critical Sector Entities")
def list_cses(
    search: Optional[str] = Query(None, description="Search by name, code or sector"),
    sector: Optional[str] = Query(None, description="Filter by sector category"),
    tier: Optional[str] = Query(None, description="Filter by tier (TIER-1, TIER-2)"),
    assessment_status: Optional[str] = Query(None, description="Filter by assessment status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Retrieve paginated and filtered inventory of supervised CSEs."""
    return CSEService.list_cses(
        db=db,
        search=search,
        sector=sector,
        tier=tier,
        assessment_status=assessment_status,
        page=page,
        page_size=page_size,
    )


@router.get("/{cse_id}", response_model=CSEDetailResponse, summary="Retrieve CSE Assessment Detail")
def get_cse_detail(
    cse_id: str,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Retrieve full contextual profile of a CSE, with applicable controls and assessment cycles."""
    # Check authorization / access scope
    check_cse_access(cse_id, current_user, db)
    return CSEService.get_cse_detail(db, cse_id)


@router.post("", response_model=CSEListItem, status_code=status.HTTP_201_CREATED, summary="Register New CSE")
def create_cse(
    data: CSECreateRequest,
    current_user: User = Depends(require_role("SUPERVISOR", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """Register a new Critical Sector Entity in the supervisory enclave (Supervisors only)."""
    return CSEService.create_cse(db, data)


@router.patch("/{cse_id}", response_model=CSEListItem, summary="Update CSE Assessment Metadata")
def update_cse(
    cse_id: str,
    data: CSEUpdateRequest,
    current_user: User = Depends(require_role("SUPERVISOR", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """Update profile metadata or supervisory posture of an existing CSE."""
    check_cse_access(cse_id, current_user, db)
    return CSEService.update_cse(db, cse_id, data)
