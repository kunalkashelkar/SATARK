from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field


class EngineKPI(BaseModel):
    title: str
    value: Union[str, int, float]
    subtitle: str
    semantic: str = Field(default="neutral", description="blue, red, neutral, green, amber")
    alert: Optional[bool] = False


class AnalyticsEngineMetaResponse(BaseModel):
    id: str  # EngineType enum or string
    slug: str
    name: str
    short_name: Optional[str] = None
    shortName: Optional[str] = None
    purpose: str
    icon_name: Optional[str] = None
    iconName: Optional[str] = None
    signal_count: int = 0
    signalCount: int = 0
    status: str = "Active"
    route: str
    version: str = "1.0.0"

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class AnalyticsSignalResponse(BaseModel):
    signal_id: str
    signalId: str
    engine_type: str
    engineType: str
    cse_id: str
    cseId: str
    cse_name: str
    cseName: str
    assessment_id: str
    assessmentId: str
    control_id: str
    controlId: str
    finding_id: Optional[str] = None
    findingId: Optional[str] = None
    priority: str = "MEDIUM"
    status: str = "CANDIDATE"
    title: str
    reason: str
    expected: str
    observed: str
    difference: str
    evidence_ids: List[str] = Field(default_factory=list)
    evidenceIds: List[str] = Field(default_factory=list)
    recommended_for_sampling: bool = False
    recommendedForSampling: bool = False
    rule_version: str = "1.0.0"
    ruleVersion: str = "1.0.0"
    control_version: str = "2026.3"
    controlVersion: str = "2026.3"
    model_version: str = "1.0.0"
    modelVersion: str = "1.0.0"
    engine_version: str = "1.0.0"
    pipeline_version: str = "SAT-SA-2026.3"
    updated_at: str = ""
    updatedAt: str = ""

    # Engine-specific attributes
    gap_type: Optional[str] = None
    gapType: Optional[str] = None
    evidence_state: Optional[str] = None
    evidenceState: Optional[str] = None
    coverage_area: Optional[str] = None
    coverageArea: Optional[str] = None
    deviation_type: Optional[str] = None
    deviationType: Optional[str] = None
    expected_process: Optional[str] = None
    expectedProcess: Optional[str] = None
    observed_process: Optional[str] = None
    observedProcess: Optional[str] = None
    investigation_depth: Optional[str] = None
    investigationDepth: Optional[str] = None
    evidence_linkage: Optional[str] = None
    evidenceLinkage: Optional[str] = None
    outcome_consistency: Optional[str] = None
    outcomeConsistency: Optional[str] = None
    metric_name: Optional[str] = None
    metricName: Optional[str] = None
    baseline_value: Optional[Union[str, int, float]] = None
    baselineValue: Optional[Union[str, int, float]] = None
    current_value: Optional[Union[str, int, float]] = None
    currentValue: Optional[Union[str, int, float]] = None
    peer_cohort_value: Optional[Union[str, int, float]] = None
    peerCohortValue: Optional[Union[str, int, float]] = None
    historical_period: Optional[str] = None
    historicalPeriod: Optional[str] = None
    trend_direction: Optional[str] = None
    trendDirection: Optional[str] = None
    source_a: Optional[str] = None
    sourceA: Optional[str] = None
    source_b: Optional[str] = None
    sourceB: Optional[str] = None
    kpi_reported: Optional[str] = None
    kpiReported: Optional[str] = None
    kpi_observed: Optional[str] = None
    kpiObserved: Optional[str] = None
    explanation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class EngineRunRequest(BaseModel):
    cse_id: Optional[str] = Field(None, description="Optional target CSE ID to compute for")
    assessment_id: Optional[str] = Field(None, description="Assessment cycle ID")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Engine specific overrides")


class EngineRunResponse(BaseModel):
    engine_metadata: AnalyticsEngineMetaResponse
    version: str
    rule_version: str
    pipeline_version: str
    execution_time_ms: float
    executed_at: datetime
    kpis: List[EngineKPI]
    signals: List[AnalyticsSignalResponse]
    trend_comparison: Optional[Dict[str, Any]] = None
    total: int
    page: int = 1
    page_size: int = 50


class AnalysisJobResponse(BaseModel):
    job_id: str
    engine_slug: str
    status: str
    execution_time_ms: float
    created_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[EngineRunResponse] = None
