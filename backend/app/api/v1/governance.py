from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.dependencies import get_current_active_user
from app.api.deps import require_role
from app.db.models.user import User
from app.schemas.governance import (
    AuditEventResponse,
    AuditListResponse,
    UserAdminCreate,
    UserAdminUpdate,
    UserAdminResponse,
    RoleResponse,
    AccessRuleResponse,
    SystemVersionResponse,
    RuleVersionResponse,
    ModelVersionResponse,
    PipelineRunResponse,
)
from app.services.audit_service import AuditService
from app.services.governance_service import GovernanceService

router = APIRouter(prefix="/governance", tags=["Supervisory Governance & Administration"])


# ====================================================
# TASK GROUP 1 — AUDIT LEDGER
# ====================================================
@router.get("/audit", response_model=AuditListResponse, summary="Query Append-Only Audit Ledger")
def get_audit_trail(
    action: Optional[str] = Query(None, description="Filter by event action (e.g. LOGIN_SUCCESS, EVIDENCE_INGESTED)"),
    actor_id: Optional[str] = Query(None, description="Filter by actor identifier"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type (e.g. USER, FINDING, EVIDENCE)"),
    entity_id: Optional[str] = Query(None, description="Filter by entity identifier"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve cryptographic, append-only audit events from the immutable ledger.
    """
    return AuditService.list_events(
        db=db,
        action=action,
        actor_id=actor_id,
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit,
        offset=offset,
    )


@router.get("/audit/{event_id}", response_model=AuditEventResponse, summary="Get Audit Record by ID")
def get_audit_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve a specific audit event record by event_id (e.g. AUD-2026-xxxx) or UUID.
    """
    event = AuditService.get_event(db=db, event_id=event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audit event '{event_id}' not found in immutable ledger."
        )
    return event


# ====================================================
# TASK GROUP 2 — ADMINISTRATION
# ====================================================
@router.get("/users", response_model=List[UserAdminResponse], summary="List Sovereign Enclave Users")
def list_governance_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List all provisioned users, their active roles, and CSE scopes.
    """
    return GovernanceService.list_users(db=db)


@router.get("/users/{id}", response_model=UserAdminResponse, summary="Get Enclave User Details")
def get_governance_user(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve detailed profile, badge, and scope for a specific enclave user.
    """
    return GovernanceService.get_user(db=db, user_id=id)


@router.post(
    "/users",
    response_model=UserAdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Provision New Enclave User"
)
def create_governance_user(
    payload: UserAdminCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("ADMINISTRATOR", "SUPERVISOR")),
):
    """
    Provision a new enclave operator with cryptographic credentials and supervisory scope.
    Restricted to ADMINISTRATOR and SUPERVISOR roles.
    """
    return GovernanceService.create_user(db=db, payload=payload, actor_user=admin_user)


@router.patch("/users/{id}", response_model=UserAdminResponse, summary="Update Enclave User Account")
def update_governance_user(
    id: str,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("ADMINISTRATOR", "SUPERVISOR")),
):
    """
    Update profile, status, credentials, or assigned CSE scope for an enclave operator.
    Restricted to ADMINISTRATOR and SUPERVISOR roles.
    """
    return GovernanceService.update_user(db=db, user_id=id, payload=payload, actor_user=admin_user)


@router.get("/roles", response_model=List[RoleResponse], summary="List RBAC Roles")
def list_governance_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List system roles, assigned permissions, and active member counts.
    """
    return GovernanceService.list_roles(db=db)


@router.get("/access", response_model=List[AccessRuleResponse], summary="List CSE Access Rules")
def list_governance_access(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List active user-to-entity access delegations and supervisory scoping rules.
    """
    return GovernanceService.list_access(db=db)


# ====================================================
# TASK GROUP 3 — VERSION MANAGEMENT
# ====================================================
@router.get("/versions", response_model=List[SystemVersionResponse], summary="List Core System Releases")
def list_system_versions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List deployed system baseline versions and changelogs.
    """
    return GovernanceService.list_system_versions(db=db)


@router.get("/versions/rules", response_model=List[RuleVersionResponse], summary="List Rule Versions")
def list_rule_versions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List active analytical engine rule specifications and cryptographic hashes.
    """
    return GovernanceService.list_rule_versions(db=db)


@router.get("/versions/models", response_model=List[ModelVersionResponse], summary="List ML/Statistical Model Versions")
def list_model_versions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List frozen machine learning / statistical anomaly detection model versions.
    """
    return GovernanceService.list_model_versions(db=db)


@router.get("/versions/pipelines", response_model=List[PipelineRunResponse], summary="List Pipeline Execution Runs")
def list_pipeline_runs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List supervisory pipeline execution history, generated signal metrics, and run durations.
    """
    return GovernanceService.list_pipeline_runs(db=db)
