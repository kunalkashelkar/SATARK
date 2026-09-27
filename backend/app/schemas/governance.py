from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


# ----------------------------------------------------
# Audit Ledger Schemas
# ----------------------------------------------------
class AuditEventResponse(BaseModel):
    id: str
    event_id: str
    actor_id: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    before: Optional[str] = None
    after: Optional[str] = None
    timestamp: datetime
    request_id: Optional[str] = None
    examiner_badge: Optional[str] = None
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime


class AuditListResponse(BaseModel):
    items: List[AuditEventResponse]
    total: int


# ----------------------------------------------------
# Administration Schemas
# ----------------------------------------------------
class UserAdminCreate(BaseModel):
    username: str
    name: str
    email: str
    role: str = "EXAMINER"  # SUPERVISOR, EXAMINER, LEAD_EXAMINER, AUDITOR, ADMINISTRATOR
    badge: Optional[str] = None
    organization: str = "NCIIPC"
    mfa_type: str = "FIPS-140-2 L3 Smartcard"
    password: Optional[str] = "EnclaveDefault#2026"
    cse_scope: Optional[List[str]] = []


class UserAdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    badge: Optional[str] = None
    organization: Optional[str] = None
    status: Optional[str] = None  # ACTIVE, SUSPENDED, PROVISIONING
    mfa_type: Optional[str] = None
    cse_scope: Optional[List[str]] = None
    password: Optional[str] = None


class UserAdminResponse(BaseModel):
    id: str
    public_id: str
    username: str
    name: str
    email: str
    badge: Optional[str] = None
    role: str
    organization: str
    mfa_type: str
    status: str
    last_activity_at: Optional[datetime] = None
    lastActivity: Optional[str] = None
    permissions: List[str] = []
    cse_scope: List[str] = []
    created_at: datetime


class RoleResponse(BaseModel):
    id: str
    name: str
    roleName: str
    description: Optional[str] = None
    status: str
    user_count: int
    permissions: List[str] = []


class AccessRuleResponse(BaseModel):
    id: str
    user_id: str
    username: str
    userOrRole: str
    cse_id: str
    cse_public_id: str
    cse_name: str
    access_type: str
    scope: str
    status: str
    granted_by: Optional[str] = None
    grantedDate: str
    created_at: datetime


# ----------------------------------------------------
# Version Management Schemas
# ----------------------------------------------------
class SystemVersionResponse(BaseModel):
    id: str
    version: str
    release_name: str
    component: str
    status: str
    changelog: Optional[str] = None
    git_commit: Optional[str] = None
    deployed_at: datetime
    created_at: datetime


class RuleVersionResponse(BaseModel):
    id: str
    rule_id: str
    engine_slug: str
    version: str
    name: str
    description: Optional[str] = None
    logic_hash: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    status: str
    effective_from: datetime
    created_at: datetime


class ModelVersionResponse(BaseModel):
    id: str
    model_id: str
    name: str
    version: str
    framework: str
    weights_hash: Optional[str] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    status: str
    trained_at: datetime
    created_at: datetime


class PipelineRunResponse(BaseModel):
    id: str
    run_id: str
    pipeline_name: str
    pipeline_version: str
    trigger: str
    status: str
    cse_count: int
    signals_generated: int
    execution_time_ms: float
    started_at: datetime
    completed_at: datetime
    created_at: datetime


# ----------------------------------------------------
# Supervisory Graph Schemas
# ----------------------------------------------------
class GraphNode(BaseModel):
    id: str
    type: str  # CSE, CONTROL, EVIDENCE, SIGNAL, FINDING, REMEDIATION, VERIFICATION
    label: str
    sublabel: str
    status: str  # CRITICAL, WARNING, VERIFIED, PENDING, NEUTRAL
    x: float
    y: float
    detail_url: str
    data: Dict[str, Any] = {}


class GraphLink(BaseModel):
    from_node: str = Field(..., alias="from")
    to_node: str = Field(..., alias="to")
    label: Optional[str] = None
    type: Optional[str] = "normal"

    model_config = ConfigDict(populate_by_name=True)


class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    links: List[Dict[str, Any]]
    summary: Dict[str, Any]
