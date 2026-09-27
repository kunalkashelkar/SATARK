import os
from typing import Any, Dict, List, Optional
import httpx
from app.core.logging import logger
from app.evidence.canonical_model import CanonicalEvent


class ClickHouseAdapter:
    """ClickHouse analytical telemetry adapter for large-scale SOC event streams.
    Utilizes ClickHouse HTTP interface on port 8123.
    Provides graceful offline fallback when running in air-gapped dev or isolated test environments.
    """

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        database: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
    ):
        self.host = host or os.getenv("CLICKHOUSE_HOST", "localhost")
        self.port = port or int(os.getenv("CLICKHOUSE_PORT", "8123"))
        self.database = database or os.getenv("CLICKHOUSE_DB", "default")
        self.user = user or os.getenv("CLICKHOUSE_USER", "default")
        self.password = password or os.getenv("CLICKHOUSE_PASSWORD", "")
        self.base_url = f"http://{self.host}:{self.port}"
        
        # Offline memory buffer for air-gapped / test environments without ClickHouse server
        self._offline_buffer: List[Dict[str, Any]] = []

    def is_available(self) -> bool:
        """Check if ClickHouse service is live and reachable."""
        try:
            with httpx.Client(timeout=1.0) as client:
                res = client.get(f"{self.base_url}/ping")
                return res.status_code == 200 and res.text.strip() == "Ok."
        except Exception:
            return False

    def ensure_schema(self) -> bool:
        """Create canonical telemetry events table in ClickHouse if available."""
        if not self.is_available():
            logger.info("ClickHouse not detected; telemetry pipeline running in offline local mode.")
            return False

        ddl = f"""
        CREATE TABLE IF NOT EXISTS {self.database}.canonical_telemetry_events (
            event_id String,
            timestamp DateTime64(3, 'UTC'),
            cse_id LowCardinality(String),
            source LowCardinality(String),
            event_class LowCardinality(String),
            actor Nullable(String),
            case_id Nullable(String),
            asset_id Nullable(String),
            action Nullable(String),
            severity LowCardinality(String),
            raw_reference String,
            metadata String
        ) ENGINE = MergeTree()
        ORDER BY (cse_id, source, timestamp, event_id);
        """
        try:
            with httpx.Client(timeout=5.0) as client:
                auth = (self.user, self.password) if self.password else None
                res = client.post(
                    self.base_url,
                    params={"query": ddl},
                    auth=auth
                )
                return res.status_code == 200
        except Exception as exc:
            logger.warning(f"ClickHouse schema initialization skipped: {exc}")
            return False

    def insert_canonical_events(self, events: List[CanonicalEvent]) -> int:
        """Stream normalized canonical events to ClickHouse, or buffer offline."""
        if not events:
            return 0

        import json

        # Store in local offline buffer for fallback queries
        for e in events:
            d = e.model_dump()
            d["timestamp"] = e.timestamp.isoformat()
            d["metadata"] = json.dumps(e.metadata or {})
            self._offline_buffer.append(d)

        if not self.is_available():
            logger.debug(f"ClickHouse offline: buffered {len(events)} events locally.")
            return len(events)

        try:
            import json
            # JSONEachRow format
            payload = "\n".join([json.dumps({
                "event_id": e.event_id,
                "timestamp": e.timestamp.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                "cse_id": e.cse_id,
                "source": e.source,
                "event_class": e.event_class,
                "actor": e.actor,
                "case_id": e.case_id,
                "asset_id": e.asset_id,
                "action": e.action,
                "severity": e.severity,
                "raw_reference": e.raw_reference,
                "metadata": json.dumps(e.metadata or {}),
            }) for e in events])

            with httpx.Client(timeout=10.0) as client:
                auth = (self.user, self.password) if self.password else None
                query = f"INSERT INTO {self.database}.canonical_telemetry_events FORMAT JSONEachRow"
                res = client.post(
                    self.base_url,
                    params={"query": query},
                    content=payload,
                    headers={"Content-Type": "application/json"},
                    auth=auth,
                )
                if res.status_code == 200:
                    logger.info(f"Ingested {len(events)} canonical events to ClickHouse.")
                    return len(events)
                else:
                    logger.warning(f"ClickHouse insert status {res.status_code}: {res.text}")
                    return len(events)
        except Exception as exc:
            logger.warning(f"ClickHouse ingestion fallback active: {exc}")
            return len(events)

    def query(self, sql: str) -> List[Dict[str, Any]]:
        """Run SQL analytical query against ClickHouse or offline buffer."""
        if self.is_available():
            try:
                with httpx.Client(timeout=15.0) as client:
                    auth = (self.user, self.password) if self.password else None
                    res = client.post(
                        self.base_url,
                        params={"query": f"{sql} FORMAT JSON"},
                        auth=auth,
                    )
                    if res.status_code == 200:
                        return res.json().get("data", [])
            except Exception as exc:
                logger.error(f"ClickHouse query failed: {exc}")

        # Fallback query over offline buffer using DuckDB
        from app.evidence.duckdb_adapter import duckdb_adapter
        try:
            import pyarrow as pa
            if not self._offline_buffer:
                return []
            table = pa.Table.from_pylist(self._offline_buffer)
            duck_conn = duckdb_adapter.get_connection()
            duck_conn.register("canonical_telemetry_events", table)
            cursor = duck_conn.execute(sql)
            columns = [c[0] for c in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
        except Exception as exc:
            logger.warning(f"Offline fallback telemetry query error: {exc}")
            return self._offline_buffer


clickhouse_adapter = ClickHouseAdapter()
