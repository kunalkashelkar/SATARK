from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class AssessmentCycleItem(BaseModel):
    id: str           # public_id, e.g. ASM-2026-Q3
    public_id: str
    cse_id: str       # CSE public ID, e.g. CSE-014
    cse_name: str
    period: str       # e.g. 2026-Q3
    status: str       # IN_PROGRESS, COMPLETED, PENDING_REVIEW
    evidence_readiness: float
    controls_assessed: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    assigned_examiner_id: Optional[str] = None
    assigned_examiner_name: Optional[str] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssessmentCycleCreateRequest(BaseModel):
    public_id: str = Field(..., description="Public assessment cycle ID, e.g. ASM-2026-Q4")
    period: str = Field(..., description="Quarterly period identifier, e.g. 2026-Q4")
    status: str = "IN_PROGRESS"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    assigned_examiner_username: Optional[str] = None


class AssessmentCycleUpdateRequest(BaseModel):
    status: Optional[str] = None
    period: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    assigned_examiner_username: Optional[str] = None
    controls_assessed: Optional[int] = None
    evidence_readiness: Optional[float] = None
