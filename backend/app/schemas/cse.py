from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ApplicableControlItem(BaseModel):
    control_id: str  # public_id, e.g. CTRL-07
    code: str        # SOC.MON.07
    title: str
    domain: str
    severity: str
    applicability_status: str
    expected_capability: Optional[str] = None
    expected_evidence: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AssessmentCycleResponse(BaseModel):
    id: str           # public_id, e.g. ASM-2026-Q3
    period: str       # 2026-Q3
    status: str
    evidence_readiness: float
    controls_assessed: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    assigned_examiner: Optional[str] = None
    submitted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CSEListItem(BaseModel):
    id: str            # public_id, e.g. CSE-014
    cseId: str         # public_id, e.g. CSE-014
    cseName: str
    sector: str
    organizationType: str
    location: str
    tier: str
    socType: str
    period: str
    evidenceReadiness: float
    readinessCategory: str
    supervisoryPriority: str
    status: str
    claimedCapability: int
    observedCapability: int
    capabilityDiscrepancyCount: int
    openFindingsCount: int
    criticalFindingsCount: int
    executionGapsCount: int
    negativeSpaceCount: int
    processDeviationsCount: int
    remediationCount: int
    primarySignal: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CSEDetailResponse(CSEListItem):
    signalsSummary: List[str] = Field(default_factory=list)
    applicableControls: List[ApplicableControlItem] = Field(default_factory=list)
    assessmentCycles: List[AssessmentCycleResponse] = Field(default_factory=list)


class PaginatedCSEResponse(BaseModel):
    items: List[CSEListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class CSECreateRequest(BaseModel):
    public_id: str = Field(..., description="Unique public code, e.g. CSE-025")
    name: str
    sector: str
    organization_type: str = "Critical Sector Entity"
    location: str = "India"
    tier: str = "TIER-1"
    soc_type: str = "Hybrid 24x7 SOC"
    claimed_capability: int = 24
    observed_capability: int = 20
    supervisory_priority: str = "HIGH"
    status: str = "Under Review"
    primary_signal: Optional[str] = None


class CSEUpdateRequest(BaseModel):
    name: Optional[str] = None
    sector: Optional[str] = None
    organization_type: Optional[str] = None
    location: Optional[str] = None
    tier: Optional[str] = None
    soc_type: Optional[str] = None
    claimed_capability: Optional[int] = None
    observed_capability: Optional[int] = None
    supervisory_priority: Optional[str] = None
    status: Optional[str] = None
    primary_signal: Optional[str] = None
