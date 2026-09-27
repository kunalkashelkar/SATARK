from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.dependencies import get_current_active_user
from app.db.models.user import User
from app.schemas.governance import GraphResponse
from app.services.governance_service import GovernanceService

router = APIRouter(prefix="/graph", tags=["Supervisory Evidence Graph"])


@router.get("", response_model=GraphResponse, summary="Supervisory Topology Graph")
def get_supervisory_graph(
    cse_id: Optional[str] = Query(None, description="Filter topology by Critical Sector Entity ID (e.g. CSE-014)"),
    control_id: Optional[str] = Query(None, description="Filter topology by Control ID (e.g. CTRL-07)"),
    evidence_id: Optional[str] = Query(None, description="Filter topology by Evidence ID (e.g. EVD-742)"),
    signal_id: Optional[str] = Query(None, description="Filter topology by Signal ID (e.g. SIG-2004)"),
    finding_id: Optional[str] = Query(None, description="Filter topology by Finding ID (e.g. FND-0142)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Constructs and returns the directed multi-layer supervisory topology graph:
    CSE -> CONTROL -> EVIDENCE -> SIGNAL -> FINDING -> REMEDIATION -> VERIFICATION

    NetworkX constructs the directed graph and executes connected component filtering.
    PostgreSQL/SQLite remains the relational source of truth.
    Every graph entity resolves to its existing detail endpoint via `detail_url`.
    """
    return GovernanceService.build_supervisory_graph(
        db=db,
        cse_id=cse_id,
        control_id=control_id,
        evidence_id=evidence_id,
        signal_id=signal_id,
        finding_id=finding_id,
    )
