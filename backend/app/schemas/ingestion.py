from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class IngestionJobResponse(BaseModel):
    id: str
    job_id: str
    filename: str
    source: str
    status: str
    rows_processed: int
    rows_rejected: int
    records_created: int
    records_updated: int
    sha256: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_summary: Optional[str] = None
    rejected_rows_sample: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class IngestionRunRequest(BaseModel):
    dataset_directory: Optional[str] = Field(None, description="Optional custom directory path to synthetic dataset files")
    cse_id: Optional[str] = Field("CSE-014", description="Target CSE identifier")


class IngestionRunResponse(BaseModel):
    total_files: int
    completed_jobs: int
    failed_jobs: int
    total_rows_processed: int
    total_rows_rejected: int
    total_records_created: int
    total_records_updated: int
    jobs: List[IngestionJobResponse]
