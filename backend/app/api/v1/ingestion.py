from typing import List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_auth
from app.db.models.user import User
from app.schemas.ingestion import (
    IngestionJobResponse,
    IngestionRunRequest,
    IngestionRunResponse,
)
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion Pipeline"])


@router.post(
    "/upload",
    response_model=IngestionJobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and Ingest a Single Dataset File (CSV or JSON)"
)
async def upload_dataset_file(
    file: UploadFile = File(..., description="CSV or JSON dataset file"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Uploads, validates, hashes, normalizes, and stores records from an individual CSV or JSON dataset file."""
    if not (file.filename.endswith(".csv") or file.filename.endswith(".json")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format: {file.filename}. Only .csv and .json files are accepted."
        )

    content = await file.read()
    job = IngestionService.process_file_content(
        db=db,
        filename=file.filename,
        content_bytes=content
    )
    return IngestionJobResponse(
        id=str(job.id),
        job_id=job.job_id,
        filename=job.filename,
        source=job.source,
        status=job.status,
        rows_processed=job.rows_processed,
        rows_rejected=job.rows_rejected,
        records_created=job.records_created,
        records_updated=job.records_updated,
        sha256=job.sha256,
        started_at=job.started_at,
        completed_at=job.completed_at,
        error_summary=job.error_summary,
        rejected_rows_sample=job.rejected_rows_sample,
    )


@router.post(
    "/run",
    response_model=IngestionRunResponse,
    summary="Execute Complete Batch Ingestion of Synthetic Dataset"
)
def run_dataset_ingestion(
    payload: IngestionRunRequest = IngestionRunRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Executes the full automated synthetic dataset ingestion pipeline across all 15 dataset files."""
    dataset_dir = payload.dataset_directory or "backend/data/synthetic_dataset"
    jobs = IngestionService.ingest_complete_dataset(db=db, dataset_dir=dataset_dir)

    job_responses = [
        IngestionJobResponse(
            id=str(j.id),
            job_id=j.job_id,
            filename=j.filename,
            source=j.source,
            status=j.status,
            rows_processed=j.rows_processed,
            rows_rejected=j.rows_rejected,
            records_created=j.records_created,
            records_updated=j.records_updated,
            sha256=j.sha256,
            started_at=j.started_at,
            completed_at=j.completed_at,
            error_summary=j.error_summary,
            rejected_rows_sample=j.rejected_rows_sample,
        )
        for j in jobs
    ]

    total_proc = sum(j.rows_processed for j in jobs)
    total_rej = sum(j.rows_rejected for j in jobs)
    total_creat = sum(j.records_created for j in jobs)
    total_upd = sum(j.records_updated for j in jobs)
    completed_cnt = sum(1 for j in jobs if j.status in ("COMPLETED", "PARTIAL"))
    failed_cnt = sum(1 for j in jobs if j.status == "FAILED")

    return IngestionRunResponse(
        total_files=len(jobs),
        completed_jobs=completed_cnt,
        failed_jobs=failed_cnt,
        total_rows_processed=total_proc,
        total_rows_rejected=total_rej,
        total_records_created=total_creat,
        total_records_updated=total_upd,
        jobs=job_responses,
    )


@router.get(
    "/jobs/{job_id}",
    response_model=IngestionJobResponse,
    summary="Get Ingestion Job Status"
)
def get_ingestion_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Retrieve execution metrics, validation results, and sample rejected rows for a specific ingestion job."""
    job = IngestionService.get_job(db=db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingestion job '{job_id}' not found."
        )
    return IngestionJobResponse(
        id=str(job.id),
        job_id=job.job_id,
        filename=job.filename,
        source=job.source,
        status=job.status,
        rows_processed=job.rows_processed,
        rows_rejected=job.rows_rejected,
        records_created=job.records_created,
        records_updated=job.records_updated,
        sha256=job.sha256,
        started_at=job.started_at,
        completed_at=job.completed_at,
        error_summary=job.error_summary,
        rejected_rows_sample=job.rejected_rows_sample,
    )


@router.get(
    "/history",
    response_model=List[IngestionJobResponse],
    summary="List Ingestion Job History"
)
def list_ingestion_history(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Retrieve audit history of all dataset ingestion jobs with row counts, hashes, and timestamps."""
    jobs = IngestionService.list_jobs(db=db, limit=limit)
    return [
        IngestionJobResponse(
            id=str(j.id),
            job_id=j.job_id,
            filename=j.filename,
            source=j.source,
            status=j.status,
            rows_processed=j.rows_processed,
            rows_rejected=j.rows_rejected,
            records_created=j.records_created,
            records_updated=j.records_updated,
            sha256=j.sha256,
            started_at=j.started_at,
            completed_at=j.completed_at,
            error_summary=j.error_summary,
            rejected_rows_sample=j.rejected_rows_sample,
        )
        for j in jobs
    ]
