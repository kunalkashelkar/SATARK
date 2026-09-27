from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_auth, require_role
from app.db.models.user import User
from app.schemas.control import (
    ControlItemResponse,
    ControlCreateRequest,
    ControlUpdateRequest,
)
from app.services.control_service import ControlService

router = APIRouter(prefix="/governance/controls", tags=["Control Library & Governance"])


@router.get("", response_model=List[ControlItemResponse], summary="List Regulatory Control Library")
def list_controls(
    search: Optional[str] = Query(None, description="Search by title, code or domain"),
    domain: Optional[str] = Query(None, description="Filter by domain"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM)"),
    status: Optional[str] = Query(None, description="Filter by status (ACTIVE, UNDER_REVIEW)"),
    active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Retrieve statutory cybersecurity control catalogue."""
    return ControlService.list_controls(
        db=db,
        search=search,
        domain=domain,
        severity=severity,
        status=status,
        active=active,
    )


@router.get("/{control_id}", response_model=ControlItemResponse, summary="Retrieve Control Detail")
def get_control(
    control_id: str,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Retrieve full regulatory control specification with expected capabilities and evidence."""
    return ControlService.get_control(db, control_id)


@router.post(
    "",
    response_model=ControlItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Control Specification"
)
def create_control(
    data: ControlCreateRequest,
    current_user: User = Depends(require_role("SUPERVISOR", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """Register a new supervisory control in the statutory library (Supervisors only)."""
    return ControlService.create_control(db, data)


@router.patch("/{control_id}", response_model=ControlItemResponse, summary="Update Control Specification")
def update_control(
    control_id: str,
    data: ControlUpdateRequest,
    current_user: User = Depends(require_role("SUPERVISOR", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """Update title, severity, or expected outcomes for a control."""
    return ControlService.update_control(db, control_id, data)
