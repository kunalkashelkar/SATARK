from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.dependencies import get_current_active_user
from app.db.models.user import User
from app.schemas.supervisory import OverviewResponse
from app.services.supervisory_service import SupervisoryService

router = APIRouter(tags=["Supervisory Overview"])


@router.get("/overview", response_model=OverviewResponse)
def get_supervisory_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Authoritative Supervisory Overview.
    Returns the 5 essential KPIs (CSEs Assessed, High-Priority Signals,
    Evidence Readiness, Open Findings, Open Remediation), along with
    the priority feed, CSE postures, engine distribution, and quick actions.
    """
    return SupervisoryService.get_overview(db=db)


@router.get("/supervision/overview", response_model=OverviewResponse)
def get_supervision_overview_alias(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Compatibility alias for existing frontend dashboardApi.getOverviewMetrics.
    """
    return SupervisoryService.get_overview(db=db)
