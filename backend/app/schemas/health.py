from typing import Dict
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="UP", description="Overall system health status")
    timestamp: str = Field(description="ISO-8601 timestamp of the check")
    version: str = Field(description="Current application version")
    enclave_id: str = Field(description="Host security enclave identifier")


class ReadyResponse(BaseModel):
    status: str = Field(description="Readiness status ('READY' or 'DEGRADED')")
    timestamp: str = Field(description="ISO-8601 timestamp")
    version: str = Field(description="Application version")
    enclave_id: str = Field(description="Host security enclave identifier")
    services: Dict[str, str] = Field(description="Individual backend dependency health statuses")
