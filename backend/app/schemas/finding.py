from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SignalResponse(BaseModel):
    id: str
    signal_id: str
    signalId: str
    engine: str
    engine_version: str
    cse_id: str
    cseId: str
    control_id: Optional[str] = None
    controlId: Optional[str] = None
    priority: str
    score: float
    status: str
    title: str
    summary: str
    expected: str
    observed: str
    explanation: str
    evidence_ids: List[str] = Field(default_factory=list)
    evidenceIds: List[str] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class FusionResponse(BaseModel):
    id: str
    fusion_id: str
    cse_id: str
    control_id: Optional[str] = None
    signal_ids: List[str] = Field(default_factory=list)
    evidence_ids: List[str] = Field(default_factory=list)
    confidence: float
    rationale: str
    historical_context: Optional[Dict[str, Any]] = None
    peer_context: Optional[Dict[str, Any]] = None
    process_context: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FindingDecisionRequest(BaseModel):
    notes: Optional[str] = Field(None, description="Examiner ledger notes or justification")
    reason: Optional[str] = Field("NCIIPC-SEC-70B-CRIT-07", description="Statutory or regulatory citation")
    status: Optional[str] = Field(None, description="Optional target status for generic adjudication")


class EvidenceDemandRequest(BaseModel):
    notes: str = Field(..., description="Statutory demand instruction and requested items")
    reason: Optional[str] = Field("Statutory Order under Section 70B", description="Statutory demand ground")
    requested_records: Optional[List[str]] = Field(default_factory=list)


class FindingResponse(BaseModel):
    id: str
    finding_id: str
    cse_id: str
    cseId: str
    cse_name: str
    cseName: str
    control_id: str
    controlId: str
    control_name: str
    controlName: str
    title: str
    why_flagged: str
    whyFlagged: str
    signal_type: str
    signalType: str
    priority: str
    evidence_strength: str = "HIGH"
    evidenceStrength: str = "HIGH"
    completeness: int = 75
    uncertainty: str = "LOW"
    status: str
    expected_state: str
    expectedState: str
    observed_state: str
    observedState: str
    gap_summary: str
    gapSummary: str
    supporting_signals: List[Dict[str, Any]] = Field(default_factory=list)
    supportingSignals: List[Dict[str, Any]] = Field(default_factory=list)
    timeline: List[Dict[str, Any]] = Field(default_factory=list)
    source_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    sourceEvidence: List[Dict[str, Any]] = Field(default_factory=list)
    provenance: Dict[str, Any] = Field(default_factory=dict)
    decision_notes: Optional[str] = None
    decisionNotes: Optional[str] = None
    decision_reason: Optional[str] = None
    decisionReason: Optional[str] = None
    decided_by: Optional[str] = None
    decidedBy: Optional[str] = None
    decided_at: Optional[str] = None
    decidedAt: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ExaminerWorkspaceResponse(BaseModel):
    finding: FindingResponse
    why_flagged: str
    expected_vs_observed: Dict[str, Any]
    supporting_evidence: List[Dict[str, Any]]
    provenance: Dict[str, Any]
    decision_history: List[Dict[str, Any]]
    available_actions: List[str]
    remediation: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class ReviewQueueSummary(BaseModel):
    total_queued: int
    critical: int
    high: int
    medium: int
    candidate: int
    under_review: int
    validated: int
    qualified: int


class ReviewQueueResponse(BaseModel):
    summary: ReviewQueueSummary
    items: List[FindingResponse]
    total: int
    page: int = 1
    page_size: int = 50
