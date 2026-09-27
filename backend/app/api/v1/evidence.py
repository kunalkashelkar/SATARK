from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_auth, check_cse_access
from app.db.models.user import User
from app.schemas.evidence import (
    EvidenceIngestRequest,
    EvidenceResponse,
    PaginatedEvidenceResponse,
    EvidenceValidateRequest,
    EvidenceIntegrityResponse,
)
from app.services.evidence_service import EvidenceService

router = APIRouter(prefix="/evidence", tags=["Evidence Vault & Integrity"])


@router.post("", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED, summary="Ingest Canonical Evidence")
def ingest_evidence(
    payload: EvidenceIngestRequest,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Ingest SOC telemetry/evidence record:
    Normalizes payload to OCSF canonical event model, computes genuine SHA-256 hash,
    writes immutable Parquet artifact, registers provenance, and stores in vault.
    Guarantees no silent replacement of existing evidence.
    """
    check_cse_access(payload.cse_id, current_user, db)
    return EvidenceService.ingest_evidence(db=db, payload=payload)


@router.get("", response_model=PaginatedEvidenceResponse, summary="Query and Filter Evidence Vault")
def list_evidence(
    search: Optional[str] = Query(None, description="Search across evidence ID, source, entity, hash"),
    evidence_id: Optional[str] = Query(None, description="Filter by exact or partial Evidence ID (e.g. EV-1042)"),
    cse_id: Optional[str] = Query(None, description="Filter by CSE code or ID (e.g. CSE-014)"),
    control_code: Optional[str] = Query(None, description="Filter by Control code or ID (e.g. CTRL-07, SOC.MON.07)"),
    validation_status: Optional[str] = Query(None, description="Filter by validation status (e.g. VALID, PENDING_VALIDATION)"),
    category: Optional[str] = Query(None, description="Filter by category (ALERT, CASE, INVESTIGATION, etc.)"),
    state: Optional[str] = Query(None, description="Filter by state (PRESENT, ABSENT_CONFIRMED, NOT_SUBMITTED, etc.)"),
    submission_window_start: Optional[datetime] = Query(None, description="Filter by submission window start (ISO-8601)"),
    submission_window_end: Optional[datetime] = Query(None, description="Filter by submission window end (ISO-8601)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Retrieve paginated and filtered list of evidence records with provenance and control links."""
    return EvidenceService.list_evidence(
        db=db,
        search=search,
        evidence_id=evidence_id,
        cse_id=cse_id,
        control_code=control_code,
        validation_status=validation_status,
        category=category,
        state=state,
        submission_window_start=submission_window_start,
        submission_window_end=submission_window_end,
        page=page,
        page_size=page_size,
    )


@router.get("/cse/{cse_id}", response_model=PaginatedEvidenceResponse, summary="List Evidence for CSE")
def list_cse_evidence(
    cse_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Retrieve evidence submissions specifically assigned to or ingested for a given CSE."""
    check_cse_access(cse_id, current_user, db)
    return EvidenceService.list_evidence(db=db, cse_id=cse_id, page=page, page_size=page_size)


@router.get("/{evidence_id}", response_model=EvidenceResponse, summary="Retrieve Evidence Record Detail")
def get_evidence_detail(
    evidence_id: str,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Retrieve complete evidence artifact details including provenance, hash, custody chain, and control mappings."""
    evidence = EvidenceService.get_evidence_by_id(db=db, evidence_id=evidence_id)
    check_cse_access(evidence.cse_id, current_user, db)
    return evidence


@router.post("/{evidence_id}/validate", response_model=EvidenceResponse, summary="Validate Evidence Submission")
def validate_evidence(
    evidence_id: str,
    payload: EvidenceValidateRequest,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Perform supervisory validation on evidence (VALID, INVALID, REJECTED)."""
    evidence = EvidenceService.get_evidence_by_id(db=db, evidence_id=evidence_id)
    check_cse_access(evidence.cse_id, current_user, db)
    return EvidenceService.validate_evidence(db=db, evidence_id=evidence_id, payload=payload)


@router.get("/{evidence_id}/integrity", response_model=EvidenceIntegrityResponse, summary="Cryptographic Integrity Verification")
def verify_evidence_integrity(
    evidence_id: str,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Verify cryptographic integrity of evidence artifact:
    Reads on-disk Parquet artifact, re-computes genuine SHA-256 hash,
    and detects any discrepancy or tampering.
    """
    evidence = EvidenceService.get_evidence_by_id(db=db, evidence_id=evidence_id)
    check_cse_access(evidence.cse_id, current_user, db)
    return EvidenceService.verify_integrity(db=db, evidence_id=evidence_id)
