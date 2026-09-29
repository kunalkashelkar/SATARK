from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ExpectedVsObservedRequest(BaseModel):
    control: str = Field(..., description="Control public ID, code, or UUID, e.g. CTRL-07 or SOC.MON.07")
    cse: str = Field(..., description="CSE public ID or UUID, e.g. CSE-014")
    assessment_period: Optional[str] = Field("2026-Q3", description="Assessment period/cycle, e.g. 2026-Q3")


class ExpectedVsObservedResponse(BaseModel):
    control_id: str
    control_code: str
    control_title: str
    cse_id: str
    cse_name: str
    assessment_period: str
    expected: str
    observed: str
    difference: str
    supporting_events: List[Dict[str, Any]] = Field(default_factory=list)
    supporting_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    rule_version: str
    discrepancy_score: float = 0.0
    status: str = "CONFORMING"  # CONFORMING, DISCREPANCY_FLAGGED, INSUFFICIENT_EVIDENCE
