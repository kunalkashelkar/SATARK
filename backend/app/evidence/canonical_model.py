from datetime import datetime, timezone
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field


class CanonicalEvent(BaseModel):
    """OCSF-aligned supervisory canonical telemetry event.
    Provides standard telemetry schema while retaining original source identifiers and extensions.
    """
    event_id: str = Field(..., description="Unique canonical event ID (e.g. EVT-001)")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    cse_id: str = Field(..., description="Public identifier of the Critical Sector Entity (e.g. CSE-014)")
    source: str = Field(..., description="Telemetry origin system: SIEM, Ticketing, EDR, Gateway, etc.")
    event_class: str = Field(
        default="security_finding",
        description="OCSF event class (e.g. security_finding, incident_case, authentication, network_activity, metric)"
    )
    actor: Optional[str] = Field(None, description="Analyst, operator, or service account involved")
    case_id: Optional[str] = Field(None, description="Correlated ticket or incident reference (e.g. CASE-992)")
    action: Optional[str] = Field(None, description="Operational action performed (e.g. TRIAGE, ESCALATE, BLOCK, LOGIN)")
    severity: str = Field(default="MEDIUM", description="Severity classification: CRITICAL, HIGH, MEDIUM, LOW, INFORMATIONAL")
    raw_reference: str = Field(..., description="Original raw source identifier for end-to-end provenance")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Source-specific unmapped telemetry attributes")

    model_config = ConfigDict(from_attributes=True)
