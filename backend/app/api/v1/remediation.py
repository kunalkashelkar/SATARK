from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.dependencies import get_current_active_user
from app.db.models.user import User
from app.schemas.supervisory import (
    RemediationCreate,
    RemediationUpdate,
    RemediationResponse,
    RemediationSubmitRequest,
    RemediationVerifyRequest,
    RemediationReopenRequest,
)
from app.services.supervisory_service import SupervisoryService

router = APIRouter(prefix="/remediation", tags=["Supervisory Remediation"])


@router.get("", response_model=List[RemediationResponse])
def list_remediations(
    cse_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List remediation mandates with filtering by CSE, lifecycle status, priority, and search.
    """
    return SupervisoryService.list_remediations(
        db=db,
        cse_id=cse_id,
        status_filter=status,
        priority=priority,
        search=search,
    )


@router.get("/cse/{cse_id}", response_model=List[RemediationResponse])
def get_remediations_by_cse(
    cse_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List remediation mandates for a specific CSE.
    """
    return SupervisoryService.list_remediations(db=db, cse_id=cse_id)


@router.get("/{id}", response_model=RemediationResponse)
def get_remediation_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve full details of a single remediation mandate.
    """
    return SupervisoryService.get_remediation(db=db, identifier=id)


@router.post("", response_model=RemediationResponse, status_code=status.HTTP_201_CREATED)
def create_remediation_mandate(
    payload: RemediationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new statutory remediation mandate tied to a validated finding.
    """
    return SupervisoryService.create_remediation(db=db, current_user=current_user, payload=payload)


@router.patch("/{id}", response_model=RemediationResponse)
def update_remediation_mandate(
    id: str,
    payload: RemediationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update remediation details, owner, deadline, or telemetry artifacts.
    """
    return SupervisoryService.update_remediation(db=db, current_user=current_user, identifier=id, payload=payload)


@router.post("/{id}/submit", response_model=RemediationResponse)
def submit_remediation_artifact(
    id: str,
    payload: RemediationSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Submit corrective telemetry artifact with cryptographic SHA-256 digest.
    Transitions lifecycle to SUBMITTED / UNDER_VERIFICATION.
    """
    return SupervisoryService.submit_remediation(db=db, current_user=current_user, identifier=id, payload=payload)


@router.post("/{id}/verify", response_model=RemediationResponse)
def verify_remediation(
    id: str,
    payload: RemediationVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Complete supervisory verification and transition mandate to CLOSED.
    """
    return SupervisoryService.verify_remediation(db=db, current_user=current_user, identifier=id, payload=payload)


@router.post("/{id}/reopen", response_model=RemediationResponse)
def reopen_remediation(
    id: str,
    payload: RemediationReopenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Reopen mandate when submitted proof is deficient or regression is flagged.
    Transitions lifecycle to REOPENED with statutory reason recorded.
    """
    return SupervisoryService.reopen_remediation(db=db, current_user=current_user, identifier=id, payload=payload)
