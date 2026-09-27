from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class EvidenceProvenanceBase(BaseModel):
    collector: str = Field(default="COL-02", description="Collector component identifier")
    transmission_token: Optional[str] = Field(None, description="Cryptographic secure transmission token")
    source_host: Optional[str] = Field(None, description="Host origin of telemetry stream")
    source_ip: Optional[str] = Field(None, description="Network IP of ingestion sender")
    signature: Optional[str] = Field(None, description="HMAC or digital signature")
    custody_chain: Optional[List[str]] = Field(default_factory=list, description="Chain of custody hops")
    received_by: str = Field(default="NCIIPC Automated Enclave Gateway")
    collector_version: Optional[str] = Field(default="sat-collector-v2.8-fips")
    schema_version: Optional[str] = Field(default="OCSF-1.1.0-SECURITY_FINDING")


class EvidenceProvenanceResponse(EvidenceProvenanceBase):
    id: str
    evidence_id: str
    sha256: str
    ingested_at: datetime
    enclave_timestamp: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EvidenceControlLinkBase(BaseModel):
    control_id: str
    mapping_type: str = Field(default="DIRECT", description="DIRECT, SUPPORTING, or DERIVED")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    notes: Optional[str] = None


class EvidenceControlLinkResponse(EvidenceControlLinkBase):
    id: str
    evidence_id: str
    control_code: Optional[str] = None
    control_title: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceBase(BaseModel):
    category: str = Field(default="ALERT", description="ALERT, CASE, INVESTIGATION, ACTION, EVIDENCE, ESCALATION, RESPONSE, etc.")
    state: str = Field(default="PRESENT", description="PRESENT, ABSENT_CONFIRMED, NOT_SUBMITTED, NOT_APPLICABLE, UNKNOWN")
    source_system: str = Field(default="SIEM", description="SIEM, TICKETING, EDR, GATEWAY, AUTH, CASE_MGMT, METRICS")
    source_event_id: Optional[str] = None


class EvidenceIngestRequest(EvidenceBase):
    evidence_id: Optional[str] = Field(None, description="Optional public ID like EV-1042")
    cse_id: str = Field(..., description="CSE public code (e.g. CSE-014) or UUID")
    control_id: Optional[str] = Field(None, description="Control ID or code (e.g. CTRL-07)")
    control_code: Optional[str] = None
    events: Optional[List[Dict[str, Any]]] = Field(None, description="Raw telemetry events to normalize and store as Parquet")
    raw_payload: Optional[str] = Field(None, description="Raw JSON or text payload if no structured event list")
    provenance: Optional[EvidenceProvenanceBase] = None


class EvidenceValidateRequest(BaseModel):
    decision: str = Field(..., description="VALID, INVALID, or REJECTED")
    notes: Optional[str] = None
    validated_by: Optional[str] = Field(None, description="Examiner or supervisor username/badge")


class EvidenceIntegrityResponse(BaseModel):
    evidence_id: str
    public_id: str
    expected_sha256: str
    computed_sha256: str
    is_valid: bool
    file_exists: bool
    file_path: Optional[str] = None
    file_size: int
    verification_timestamp: datetime
    status: str  # INTEGRITY_VERIFIED or HASH_MISMATCH_DETECTED


class EvidenceResponse(EvidenceBase):
    id: str
    evidence_id: str  # Alias of public_id for frontend compatibility
    public_id: str
    cse_id: str
    entity: Optional[str] = None
    control_id: Optional[str] = None
    control_code: Optional[str] = None
    validation_status: str
    sha256: str
    hash: str  # Frontend alias for sha256
    file_path: Optional[str] = None
    file_size: int = 0
    file_type: str = "PARQUET"
    received_at: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    provenance: Optional[EvidenceProvenanceResponse] = None
    control_links: List[EvidenceControlLinkResponse] = Field(default_factory=list)
    associated_signals: List[Dict[str, Any]] = Field(default_factory=list)
    associated_findings: List[Dict[str, Any]] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class PaginatedEvidenceResponse(BaseModel):
    items: List[EvidenceResponse]
    total: int
    page: int
    page_size: int
    pages: int
