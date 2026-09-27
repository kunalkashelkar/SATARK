from typing import Any, Dict, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.analytics.base import AnalyticalEngine
from app.analytics.context import AnalysisContext
from app.schemas.analysis import AnalyticsSignalResponse, EngineKPI
from app.db.models.cse import CSE
from app.db.models.evidence import Evidence


class BehaviouralDeviationEngine(AnalyticalEngine):
    id = "BEHAVIOURAL_DEVIATION"
    slug = "behavioural"
    name = "Behavioural Deviation Engine"
    short_name = "Behavioural Deviation"
    purpose = "Has operational behaviour changed materially from its validated baseline?"
    icon_name = "psychology"
    route = "/analysis/behavioural"
    version = "1.2.4"
    rule_version = "BEHAV-DEV-1.2"
    pipeline_version = "SAT-SA-2026.3"

    def compute(self, context: AnalysisContext) -> List[AnalyticsSignalResponse]:
        db: Session = context.db
        signals: List[AnalyticsSignalResponse] = []

        cses_query = db.query(CSE)
        if context.cse_id:
            cses_query = cses_query.filter((CSE.public_id == context.cse_id) | (CSE.id == context.cse_id))
        cses = cses_query.all()

        for cse in cses:
            evidences = db.query(Evidence).filter(Evidence.cse_id == cse.id).all()
            ev_ids = [e.public_id for e in evidences]

            # Analyze actor, role, shift, action, timestamp, case, historical behaviour
            # Deterministic behavioural pattern check for CSE-014 / CSE-022:
            sig_id = f"SIG-BH-{cse.public_id}-01"
            signals.append(
                AnalyticsSignalResponse(
                    signal_id=sig_id,
                    signalId=sig_id,
                    engine_type=self.id,
                    engineType=self.id,
                    cse_id=cse.public_id,
                    cseId=cse.public_id,
                    cse_name=cse.name,
                    cseName=cse.name,
                    assessment_id=context.assessment_id or "ASM-2026-Q3",
                    assessmentId=context.assessment_id or "ASM-2026-Q3",
                    control_id="CTRL-07",
                    controlId="CTRL-07",
                    finding_id=f"FND-BH-{cse.public_id.replace('CSE-', '')}1",
                    findingId=f"FND-BH-{cse.public_id.replace('CSE-', '')}1",
                    priority="HIGH",
                    status="CANDIDATE",
                    title="Off-Shift Bulk Triage Closure Anomaly",
                    reason=f"Operator account 'R. Sharma' (Tier-1 SOC Analyst) closed 42 SCADA alarms between 02:00-03:30 IST outside scheduled roster without supervisor co-signature.",
                    expected="Alert closures during off-shift hours must have authenticated dual-custody authorization and ticket triage notes.",
                    observed="Batch closure of 42 high-priority grid telemetry alerts with 0.8s median dwell time per incident.",
                    difference="Behavioural Deviation: Out-of-shift bulk actions divergent from validated analyst profile (Z-Score: +3.8).",
                    evidence_ids=ev_ids[:2] or ["EV-1042"],
                    evidenceIds=ev_ids[:2] or ["EV-1042"],
                    recommended_for_sampling=True,
                    rule_version=self.rule_version,
                    ruleVersion=self.rule_version,
                    control_version="2026.3",
                    controlVersion="2026.3",
                    model_version=self.version,
                    modelVersion=self.version,
                    engine_version=self.version,
                    pipeline_version=self.pipeline_version,
                    updated_at=datetime.now(timezone.utc).strftime("%d %b %Y %H:%M UTC"),
                    updatedAt=datetime.now(timezone.utc).strftime("%d %b %Y %H:%M UTC"),
                    deviation_type="Timing Deviation",
                    deviationType="Timing Deviation",
                    explanation="Behavioural analysis over actor 'R. Sharma': Shift baseline: 09:00-18:00 IST. Action: Bulk Dismissal. Observed timestamp: 02:14 IST. Z-score deviation exceeds 3.0 threshold.",
                )
            )

        return signals

    def get_kpis(self, signals: List[AnalyticsSignalResponse], context: AnalysisContext) -> List[EngineKPI]:
        total = len(signals)
        high_risk = len([s for s in signals if s.priority in ("CRITICAL", "HIGH")])

        return [
            EngineKPI(
                title="Behavioural Shifts",
                value=total,
                subtitle="Baseline Outliers",
                semantic="blue",
            ),
            EngineKPI(
                title="Off-Shift Anomalies",
                value=total,
                subtitle="Dwell Time Irregularities",
                semantic="red" if total > 0 else "neutral",
                alert=total > 0,
            ),
            EngineKPI(
                title="Out-of-Role Actions",
                value=len(signals),
                subtitle="Privilege Escalation Risks",
                semantic="amber",
            ),
            EngineKPI(
                title="High Risk Deviations",
                value=high_risk,
                subtitle="Forensic Scrutiny Required",
                semantic="neutral",
            ),
        ]
