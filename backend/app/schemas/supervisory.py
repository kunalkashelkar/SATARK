from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ----------------------------------------------------
# Overview Schemas
# ----------------------------------------------------
class PriorityFeedItem(BaseModel):
    id: str
    public_id: str
    cse_id: str
    cse_name: str
    control_id: Optional[str] = None
    title: str
    signal_type: str
    priority: str
    evidence_strength: str
    expected_state: str
    observed_state: str
    gap_summary: str
    why_flagged: str
    status: str


class CseStatusItem(BaseModel):
    id: str
    cse_id: str
    name: str
    sector: str
    tier: str
    status: str
    evidence_readiness: int
    open_findings: int
    open_remediations: int


class EngineDistributionItem(BaseModel):
    name: str
    count: int
    fill: str
    type: str


class QuickActionItem(BaseModel):
    id: str
    label: str
    description: str
    action_type: str
    target_url: str


class OverviewResponse(BaseModel):
    # The five core supervisory KPIs
    csesAssessed: int
    highPrioritySignals: int
    evidenceReadiness: int
    openFindings: int
    openRemediation: int

    # Extended feed and context
    priority_feed: List[PriorityFeedItem]
    cse_status: List[CseStatusItem]
    engine_distribution: List[EngineDistributionItem]
    quick_actions: List[QuickActionItem]

    # Frontend dashboard compatibility
    totalRegisteredCSEs: int
    activeFindings: int
    executionGaps: int
    negativeSpace: int
    samplesRecommended: int
    signalDistribution: List[EngineDistributionItem]
    expectedVsObservedMetrics: Dict[str, Any]
    evidenceQuality: Dict[str, Any]


# ----------------------------------------------------
# Sampling Schemas
# ----------------------------------------------------
class SamplingParameters(BaseModel):
    sector: str = "ALL"
    tier: str = "ALL"
    risk: str = "ALL"
    anomaly_presence: bool = False
    sample_size: int = 10


class SamplingRunCreate(BaseModel):
    title: str = "Stratified Supervisory Sampling Run"
    parameters: SamplingParameters = Field(default_factory=SamplingParameters)
    random_seed: Optional[int] = 42


class SamplingItemResponse(BaseModel):
    id: str
    item_id: str
    run_id: str
    case_id: str
    cse_id: str
    control_id: Optional[str] = None
    finding_id: Optional[str] = None
    cse_public_id: str
    cse_name: str
    control_ref: str
    priority: str
    methodology: str
    sampling_reason: str
    evidence_strength: str
    evidence_status: str
    status: str
    selected: bool
    assessment_period: str
    signals: List[str]
    created_at: datetime


class SamplingRunResponse(BaseModel):
    id: str
    run_id: str
    title: str
    sampling_parameters: Dict[str, Any]
    algorithm_version: str
    random_seed: Optional[int] = None
    status: str
    created_by_name: str
    total_items: int
    created_at: datetime
    items: Optional[List[SamplingItemResponse]] = None


# ----------------------------------------------------
# Remediation Schemas
# ----------------------------------------------------
class RemediationArtifact(BaseModel):
    id: str
    name: str
    hash: str
    status: str  # PRESENT_VERIFIED, MISSING_MANDATORY, PENDING_INGESTION


class RemediationMilestone(BaseModel):
    date: str
    title: str
    actor: str
    detail: str
    completed: bool


class RemediationCreate(BaseModel):
    finding_id: str
    cse_id: str
    mandate_title: str
    action_summary: str
    owner: str
    priority: str = "HIGH"
    due_date: str
    artifacts: Optional[List[RemediationArtifact]] = None


class RemediationUpdate(BaseModel):
    action_summary: Optional[str] = None
    owner: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    days_remaining: Optional[int] = None
    artifacts: Optional[List[RemediationArtifact]] = None


class RemediationSubmitRequest(BaseModel):
    artifact_id: str
    artifact_name: str
    hash: str
    notes: Optional[str] = None


class RemediationVerifyRequest(BaseModel):
    notes: Optional[str] = "Supervisory verification passed."


class RemediationReopenRequest(BaseModel):
    reason: str
    notes: Optional[str] = None


class RemediationResponse(BaseModel):
    id: str
    remediation_id: str
    finding_id: str
    finding_public_id: str
    cse_id: str
    cse_public_id: str
    cse_name: str
    control_ref: str
    mandate_title: str
    action_summary: str
    owner: str
    priority: str
    due_date: str
    days_remaining: int
    evidence_progress: str
    status: str
    reopen_reason: Optional[str] = None
    artifacts: List[RemediationArtifact]
    milestones: List[RemediationMilestone]
    created_at: datetime
    updated_at: datetime


# ----------------------------------------------------
# Verification Schemas
# ----------------------------------------------------
class VerificationGateResponse(BaseModel):
    id: str
    gate_id: str
    verification_result_id: str
    remediation_id: str
    gate_type: str
    label: str
    verified: bool
    required: bool
    note: Optional[str] = None
    evidence_requirement: Optional[str] = None


class GateVerifyRequest(BaseModel):
    verified: bool
    notes: Optional[str] = None


class VerificationSealRequest(BaseModel):
    rationale: Optional[str] = "All statutory gates verified and sealed with FIPS digest."


class VerificationReopenRequest(BaseModel):
    reason: str
    rationale: Optional[str] = "Deficient proof or regression detected."


class VerificationResultResponse(BaseModel):
    id: str
    verification_id: str
    remediation_id: str
    finding_id: Optional[str] = None
    mandate_public_id: str
    finding_public_id: str
    cse_id: str
    cse_public_id: str
    cse_name: str
    control_id: str
    cycle: str
    lead_examiner: str
    statutory_standard: str
    submitted_at: str
    evaluated_at: Optional[str] = None
    verification_verdict: str
    confidence_score: int
    evidence_completeness: int
    merkle_root_hash: str
    remedial_summary: str
    supervisory_rationale: str
    submitted_artifacts: List[Dict[str, Any]]
    pass_fail: str
    failure_reason: Optional[str] = None
    gates: List[VerificationGateResponse]
    created_at: datetime
    updated_at: datetime
