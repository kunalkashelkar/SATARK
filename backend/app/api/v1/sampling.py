from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.dependencies import get_current_active_user
from app.db.models.user import User
from app.schemas.supervisory import (
    SamplingRunCreate,
    SamplingRunResponse,
    SamplingItemResponse,
)
from app.services.supervisory_service import SupervisoryService

router = APIRouter(prefix="/sampling", tags=["Supervisory Sampling"])


@router.post("/runs", response_model=SamplingRunResponse, status_code=status.HTTP_201_CREATED)
def create_sampling_run(
    payload: SamplingRunCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Generate an auditable, reproducible, stratified supervisory sampling run
    stratified by sector, tier, risk, and anomaly presence.
    """
    return SupervisoryService.create_sampling_run(db=db, current_user=current_user, payload=payload)


@router.get("/runs/{run_id}", response_model=SamplingRunResponse)
def get_sampling_run(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve parameters and members of a specific sampling run.
    """
    return SupervisoryService.get_sampling_run(db=db, run_id=run_id)


@router.get("/runs/{run_id}/items", response_model=List[SamplingItemResponse])
def get_sampling_run_items(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve members of a specific sampling run.
    """
    return SupervisoryService.list_sampling_items(db=db, run_id=run_id)


@router.get("/runs/{run_id}/export")
def export_sampling_run(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Export sampling run items as CSV.
    """
    csv_content = SupervisoryService.export_sampling_run_csv(db=db, run_id=run_id)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={run_id}_sample_export.csv"},
    )


@router.get("", response_model=List[SamplingItemResponse])
def list_sampling_items(
    cse_id: Optional[str] = Query(None),
    methodology: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List recommended and selected samples with multi-criteria filtering.
    """
    return SupervisoryService.list_sampling_items(
        db=db,
        cse_id=cse_id,
        methodology=methodology,
        priority=priority,
        status_filter=status,
        search=search,
    )


@router.get("/cse/{cse_id}", response_model=List[SamplingItemResponse])
def get_sampling_by_cse(
    cse_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve samples for a specific CSE.
    """
    return SupervisoryService.list_sampling_items(db=db, cse_id=cse_id)


@router.post("/items/{item_id}/toggle", response_model=SamplingItemResponse)
def toggle_sampling_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Toggle a sample between RECOMMENDED and SELECTED for examination.
    """
    return SupervisoryService.toggle_sampling_item_selection(db=db, item_id=item_id)
