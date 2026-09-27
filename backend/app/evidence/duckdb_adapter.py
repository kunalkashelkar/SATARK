import os
from typing import Any, Dict, List, Optional
import duckdb
from app.core.logging import logger


class DuckDBAdapter:
    """Local analytical query engine over Parquet and columnar evidence files.
    Allows high-performance offline SQL analytics without external database servers.
    """

    def __init__(self, db_path: str = ":memory:"):
        self.db_path = db_path
        self._connection: Optional[duckdb.DuckDBPyConnection] = None

    def get_connection(self) -> duckdb.DuckDBPyConnection:
        if self._connection is None:
            self._connection = duckdb.connect(self.db_path)
        return self._connection

    def query(self, sql: str, params: Optional[List[Any]] = None) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        try:
            if params:
                cursor = conn.execute(sql, params)
            else:
                cursor = conn.execute(sql)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            return [dict(zip(columns, row)) for row in rows]
        except Exception as exc:
            logger.error(f"DuckDB query error: {exc} | Query: {sql}")
            raise exc

    def query_parquet(self, parquet_path: str, sql_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Run SQL directly against a Parquet evidence file."""
        if not os.path.exists(parquet_path):
            raise FileNotFoundError(f"Parquet evidence file not found: {parquet_path}")

        base_query = f"SELECT * FROM read_parquet('{parquet_path}')"
        if sql_filter:
            base_query += f" WHERE {sql_filter}"

        return self.query(base_query)


duckdb_adapter = DuckDBAdapter()
