from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.dependencies import get_current_active_user
from app.db.models.user import User
from app.schemas.supervisory import (
    VerificationResultResponse,
    GateVerifyRequest,
    VerificationSealRequest,
    VerificationReopenRequest,
)
from app.services.supervisory_service import SupervisoryService

router = APIRouter(prefix="/verification", tags=["Verification Gates"])


@router.get("", response_model=List[VerificationResultResponse])
def list_verifications(
    cse_id: Optional[str] = Query(None),
    verdict: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List statutory verification records and gate assessments across entities.
    """
    return SupervisoryService.list_verifications(db=db, cse_id=cse_id, verdict=verdict)


@router.get("/{id}", response_model=VerificationResultResponse)
def get_verification_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get verification record details, checklist of gates, and submitted artifacts.
    """
    return SupervisoryService.get_verification(db=db, identifier=id)


@router.post("/{id}/gates/{gate_id}/verify", response_model=VerificationResultResponse)
def verify_gate(
    id: str,
    gate_id: str,
    payload: GateVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Evaluate and toggle an individual statutory verification gate (Pass/Fail).
    """
    return SupervisoryService.verify_gate(
        db=db,
        current_user=current_user,
        verification_id=id,
        gate_id=gate_id,
        verified=payload.verified,
        notes=payload.notes,
    )


@router.post("/{id}/seal", response_model=VerificationResultResponse)
def seal_verification(
    id: str,
    payload: VerificationSealRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Finalize and seal supervisory verification (VERIFIED_SEALED).
    Closes the linked remediation mandate.
    """
    return SupervisoryService.seal_verification(
        db=db,
        current_user=current_user,
        verification_id=id,
        rationale=payload.rationale,
    )


@router.post("/{id}/reopen", response_model=VerificationResultResponse)
def reopen_verification(
    id: str,
    payload: VerificationReopenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Mark verification as DEFICIENT_REOPENED and return linked remediation to REOPENED.
    """
    return SupervisoryService.reopen_verification(
        db=db,
        current_user=current_user,
        verification_id=id,
        reason=payload.reason,
        rationale=payload.rationale,
    )
