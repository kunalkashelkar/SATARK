import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple
import pyarrow as pa
import pyarrow.parquet as pq
from app.core.logging import logger
from app.evidence.canonical_model import CanonicalEvent


class EvidenceStorage:
    """Manages immutable file system storage and cryptographic hashing of evidence artifacts."""

    STORAGE_ROOT = os.getenv("EVIDENCE_ROOT", "data/evidence")

    @classmethod
    def _ensure_dir(cls, directory: str) -> None:
        os.makedirs(directory, exist_ok=True)

    @classmethod
    def compute_sha256(cls, file_path: str) -> str:
        """Calculate genuine cryptographic SHA-256 checksum of an on-disk evidence file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Evidence file not found: {file_path}")

        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    @classmethod
    def compute_bytes_sha256(cls, data: bytes) -> str:
        """Calculate genuine cryptographic SHA-256 checksum of raw in-memory bytes."""
        return hashlib.sha256(data).hexdigest()

    @classmethod
    def store_canonical_events_as_parquet(
        cls,
        events: List[CanonicalEvent],
        cse_id: str,
        evidence_id: str
    ) -> Tuple[str, str, int]:
        """Serialize a batch of canonical events into an immutable Parquet evidence artifact.
        Returns: (file_path, sha256_checksum, file_size_bytes)
        """
        cse_dir = os.path.join(cls.STORAGE_ROOT, cse_id)
        cls._ensure_dir(cse_dir)

        file_name = f"{evidence_id}.parquet"
        file_path = os.path.join(cse_dir, file_name)

        # Prepare columnar data for PyArrow
        event_ids = []
        timestamps = []
        cse_ids = []
        sources = []
        event_classes = []
        actors = []
        case_ids = []
        actions = []
        severities = []
        raw_references = []
        metadata_jsons = []

        for e in events:
            event_ids.append(e.event_id)
            timestamps.append(e.timestamp)
            cse_ids.append(e.cse_id)
            sources.append(e.source)
            event_classes.append(e.event_class)
            actors.append(e.actor or "")
            case_ids.append(e.case_id or "")
            actions.append(e.action or "")
            severities.append(e.severity)
            raw_references.append(e.raw_reference)
            metadata_jsons.append(json.dumps(e.metadata or {}))

        arrow_table = pa.Table.from_arrays(
            [
                pa.array(event_ids, type=pa.string()),
                pa.array(timestamps, type=pa.timestamp("ms")),
                pa.array(cse_ids, type=pa.string()),
                pa.array(sources, type=pa.string()),
                pa.array(event_classes, type=pa.string()),
                pa.array(actors, type=pa.string()),
                pa.array(case_ids, type=pa.string()),
                pa.array(actions, type=pa.string()),
                pa.array(severities, type=pa.string()),
                pa.array(raw_references, type=pa.string()),
                pa.array(metadata_jsons, type=pa.string()),
            ],
            names=[
                "event_id",
                "timestamp",
                "cse_id",
                "source",
                "event_class",
                "actor",
                "case_id",
                "action",
                "severity",
                "raw_reference",
                "metadata",
            ],
        )

        pq.write_table(arrow_table, file_path, compression="SNAPPY")
        file_size = os.path.getsize(file_path)
        sha256_hash = cls.compute_sha256(file_path)

        logger.info(f"Stored Parquet evidence: {file_path} ({file_size} bytes, SHA-256: {sha256_hash[:12]}...)")
        return file_path, sha256_hash, file_size

    @classmethod
    def read_parquet_records(cls, file_path: str) -> List[Dict[str, Any]]:
        """Read Parquet file and return records as dictionaries."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Parquet file not found: {file_path}")

        table = pq.read_table(file_path)
        pydict = table.to_pylist()
        for record in pydict:
            if "metadata" in record and isinstance(record["metadata"], str):
                try:
                    record["metadata"] = json.loads(record["metadata"])
                except Exception:
                    pass
        return pydict
