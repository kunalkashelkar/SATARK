from typing import Any, Dict, Optional
from sqlalchemy.orm import Session


class AnalysisContext:
    def __init__(
        self,
        db: Session,
        cse_id: Optional[str] = None,
        assessment_id: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None,
    ):
        self.db = db
        self.cse_id = cse_id
        self.assessment_id = assessment_id
        self.parameters = parameters or {}
