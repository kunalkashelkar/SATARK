from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ControlItemResponse(BaseModel):
    id: str                  # CTRL-07
    control_id: str          # CTRL-07
    code: str                # SOC.MON.07
    name: str                # Title for frontend compatibility
    title: str
    domain: str
    severity: str            # CRITICAL, HIGH, MEDIUM, LOW
    version: str             # e.g. 2026.3
    status: str              # ACTIVE, UNDER_REVIEW, DEPRECATED
    active: bool
    applicability: str
    description: Optional[str] = None
    expected_capability: Optional[str] = None
    expected_outcomes: Optional[str] = None
    expected_evidence: Optional[str] = None
    assessment_criteria: Optional[str] = None
    lastUpdated: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ControlCreateRequest(BaseModel):
    control_id: str = Field(..., description="Unique public code, e.g. CTRL-13")
    code: str = Field(..., description="Regulatory code, e.g. SOC.NET.13")
    title: str
    domain: str
    severity: str = "HIGH"
    version: str = "2026.3"
    status: str = "ACTIVE"
    active: bool = True
    applicability: str = "All Critical Infrastructure SOCs"
    description: Optional[str] = None
    expected_capability: Optional[str] = None
    expected_outcomes: Optional[str] = None
    expected_evidence: Optional[str] = None
    assessment_criteria: Optional[str] = None


class ControlUpdateRequest(BaseModel):
    title: Optional[str] = None
    code: Optional[str] = None
    domain: Optional[str] = None
    severity: Optional[str] = None
    version: Optional[str] = None
    status: Optional[str] = None
    active: Optional[bool] = None
    applicability: Optional[str] = None
    description: Optional[str] = None
    expected_capability: Optional[str] = None
    expected_outcomes: Optional[str] = None
    expected_evidence: Optional[str] = None
    assessment_criteria: Optional[str] = None
