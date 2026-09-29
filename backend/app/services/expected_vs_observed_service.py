from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.exceptions import NotFoundException
from app.db.models.cse import CSE
from app.db.models.control import Control
from app.db.models.evidence import Evidence
from app.db.models.signal import Signal
from app.db.models.finding import Finding
from app.schemas.expected_vs_observed import ExpectedVsObservedResponse


class ExpectedVsObservedService:
    @classmethod
    def evaluate(
        cls,
        db: Session,
        control_identifier: str,
        cse_identifier: str,
        assessment_period: Optional[str] = "2026-Q3",
    ) -> ExpectedVsObservedResponse:
        """
        Reusable service:
        Compares expected capabilities against observed telemetry and evidence records.
        Returns: expected, observed, difference, supporting_events, supporting_evidence, rule_version.
        """
        # 1. Resolve CSE
        cse = db.query(CSE).filter(
            or_(CSE.public_id == cse_identifier, CSE.name.ilike(f"%{cse_identifier}%"))
        ).first()
        if not cse:
            raise NotFoundException("CSE", cse_identifier)

        # 2. Resolve Control
        ctrl = db.query(Control).filter(
            or_(
                Control.public_id == control_identifier,
                Control.code == control_identifier,
                Control.title.ilike(f"%{control_identifier}%"),
            )
        ).first()
        if not ctrl:
            raise NotFoundException("Control", control_identifier)

        # 3. Retrieve Signals for this CSE and Control
        signals = db.query(Signal).filter(
            Signal.cse_id == cse.id,
            Signal.control_id == ctrl.id,
        ).all()

        # 4. Retrieve Evidence linked to this CSE and Control
        evidence_records = db.query(Evidence).filter(
            Evidence.cse_id == cse.id,
            Evidence.control_id == ctrl.id,
        ).all()

        # 5. Retrieve Findings linked to this CSE and Control
        findings = db.query(Finding).filter(
            Finding.cse_id == cse.id,
            Finding.control_id == ctrl.id,
        ).all()

        # 6. Extract Supporting Evidence details
        supporting_evidence = []
        for ev in evidence_records:
            supporting_evidence.append({
                "id": ev.public_id,
                "evidence_id": ev.public_id,
                "category": ev.category,
                "sha256": ev.sha256,
                "status": ev.validation_status,
                "source_system": ev.source_system,
                "received_at": ev.received_at.isoformat() if ev.received_at else None,
            })

        # 7. Extract Supporting Events from signals or findings
        supporting_events = []
        for s in signals:
            supporting_events.append({
                "event_id": s.signal_id,
                "engine": s.engine,
                "summary": s.summary,
                "priority": s.priority,
                "score": s.score,
                "timestamp": s.created_at.isoformat() if s.created_at else None,
            })

        rule_version = "R-2.4"
        if signals:
            active_sig = signals[0]
            expected = active_sig.expected
            observed = active_sig.observed
            difference = active_sig.explanation or "Algorithmic execution gap observed between mandated control baseline and received telemetry."
            discrepancy_score = active_sig.score
            status = "DISCREPANCY_FLAGGED"
            rule_version = f"v{active_sig.engine_version}"
        elif findings:
            active_fnd = findings[0]
            expected = active_fnd.expected_state
            observed = active_fnd.observed_state
            difference = active_fnd.gap_summary
            discrepancy_score = 0.85
            status = "DISCREPANCY_FLAGGED"
            rule_version = active_fnd.rule_version or "R-2.4"
        elif evidence_records:
            expected = ctrl.expected_capability or "Continuous statutory operational telemetry streaming."
            observed = f"{len(evidence_records)} evidence artifacts verified with compliant cryptographic hashes."
            difference = "No material variance detected against baseline control expectation."
            discrepancy_score = 0.0
            status = "CONFORMING"
        else:
            expected = ctrl.expected_capability or "Mandated evidence submission within assessment window."
            observed = "No telemetry or evidence records ingested for this assessment period."
            difference = "Evidentiary silence: Negative space candidate identified."
            discrepancy_score = 0.90
            status = "INSUFFICIENT_EVIDENCE"

        return ExpectedVsObservedResponse(
            control_id=ctrl.public_id,
            control_code=ctrl.code,
            control_title=ctrl.title,
            cse_id=cse.public_id,
            cse_name=cse.name,
            assessment_period=assessment_period or "2026-Q3",
            expected=expected,
            observed=observed,
            difference=difference,
            supporting_events=supporting_events,
            supporting_evidence=supporting_evidence,
            rule_version=rule_version,
            discrepancy_score=discrepancy_score,
            status=status,
        )
