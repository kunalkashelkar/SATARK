from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.analytics.base import AnalyticalEngine
from app.analytics.context import AnalysisContext
from app.schemas.analysis import AnalyticsSignalResponse, EngineKPI
from app.db.models.cse import CSE
from app.db.models.control import Control
from app.db.models.evidence import Evidence


class ExecutionGapEngine(AnalyticalEngine):
    id = "EXECUTION_GAP"
    slug = "execution-gap"
    name = "Execution Gap Engine"
    short_name = "Execution Gap"
    purpose = "What should have happened but was not sufficiently evidenced?"
    icon_name = "rule_folder"
    route = "/analysis/execution-gap"
    version = "1.4.2"
    rule_version = "EXEC-GAP-1.4"
    pipeline_version = "SAT-SA-2026.3"

    def compute(self, context: AnalysisContext) -> List[AnalyticsSignalResponse]:
        db: Session = context.db
        signals: List[AnalyticsSignalResponse] = []

        # Query CSEs
        cses_query = db.query(CSE)
        if context.cse_id:
            cses_query = cses_query.filter((CSE.public_id == context.cse_id) | (CSE.id == context.cse_id))
        cses = cses_query.all()

        for cse in cses:
            # Check gap between claimed capability and observed capability
            cap_diff = cse.claimed_capability - cse.observed_capability
            evidences = db.query(Evidence).filter(Evidence.cse_id == cse.id).all()
            ev_ids = [e.public_id for e in evidences]

            if cap_diff > 0:
                sig_id = f"SIG-EG-{cse.public_id}-01"
                sig = AnalyticsSignalResponse(
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
                    finding_id=f"FND-{cse.public_id.replace('CSE-', '')}01",
                    findingId=f"FND-{cse.public_id.replace('CSE-', '')}01",
                    priority="CRITICAL" if cap_diff >= 4 else "HIGH",
                    status="CANDIDATE",
                    title=f"Declared Monitoring Capability Deficit ({cap_diff} Controls Unverified)",
                    reason=f"{cse.name} claims {cse.claimed_capability}/24 active supervisory controls, but telemetry verifies only {cse.observed_capability}.",
                    expected=f"Attestation backed by cryptographic evidence for all {cse.claimed_capability} claimed SOC capabilities.",
                    observed=f"Only {cse.observed_capability} controls possess verifiable telemetry streams in the supervisory enclave.",
                    difference=f"Execution Gap: {cap_diff} controls lack continuous forensic telemetry.",
                    evidence_ids=ev_ids[:3],
                    evidenceIds=ev_ids[:3],
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
                    gap_type="Incomplete Execution",
                    gapType="Incomplete Execution",
                    evidence_state="ABSENT_CONFIRMED" if not ev_ids else "PRESENT",
                    evidenceState="ABSENT_CONFIRMED" if not ev_ids else "PRESENT",
                    explanation=f"Algorithmic execution gap analysis computed an operational deficiency score of {cap_diff * 4.16:.1f}%.",
                )
                signals.append(sig)

            # Check individual unsubmitted or absent evidence
            for ev in evidences:
                if ev.state in ("NOT_SUBMITTED", "ABSENT_CONFIRMED"):
                    sig_id = f"SIG-EG-{ev.public_id}"
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
                            control_id=ev.control.public_id if ev.control else "CTRL-08",
                            controlId=ev.control.public_id if ev.control else "CTRL-08",
                            finding_id=f"FND-{cse.public_id.replace('CSE-', '')}02",
                            findingId=f"FND-{cse.public_id.replace('CSE-', '')}02",
                            priority="HIGH",
                            status="CANDIDATE",
                            title=f"Missing Operational Dispatch for {ev.public_id}",
                            reason=f"Evidence artifact {ev.public_id} marked as {ev.state} during mandatory control verification.",
                            expected="Mandatory cryptographic artifact ingested into supervisory enclave vault.",
                            observed=f"Evidence state is {ev.state}.",
                            difference="Unrecorded Execution / Missing Telemetry Dispatch",
                            evidence_ids=[ev.public_id],
                            evidenceIds=[ev.public_id],
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
                            gap_type="Missing Execution",
                            gapType="Missing Execution",
                            evidence_state=ev.state,
                            evidenceState=ev.state,
                        )
                    )

        return signals

    def get_kpis(self, signals: List[AnalyticsSignalResponse], context: AnalysisContext) -> List[EngineKPI]:
        total_signals = len(signals)
        high_priority = len([s for s in signals if s.priority in ("CRITICAL", "HIGH")])
        affected_cses = len(set(s.cse_id for s in signals))
        critical_count = len([s for s in signals if s.priority == "CRITICAL"])

        return [
            EngineKPI(
                title="Execution Gaps",
                value=total_signals,
                subtitle="Identified Discrepancies",
                semantic="blue",
            ),
            EngineKPI(
                title="High Priority",
                value=high_priority,
                subtitle="Immediate Examiner Attention",
                semantic="red",
                alert=high_priority > 0,
            ),
            EngineKPI(
                title="Affected CSEs",
                value=affected_cses,
                subtitle="Critical Infrastructure Entities",
                semantic="neutral",
            ),
            EngineKPI(
                title="Critical Omissions",
                value=critical_count,
                subtitle="Severe Capability Gaps",
                semantic="amber" if critical_count > 0 else "green",
            ),
        ]
