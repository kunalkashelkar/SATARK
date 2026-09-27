from typing import Any, Dict, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.analytics.base import AnalyticalEngine
from app.analytics.context import AnalysisContext
from app.schemas.analysis import AnalyticsSignalResponse, EngineKPI
from app.db.models.cse import CSE
from app.db.models.evidence import Evidence


class CoverageBlindSpotEngine(AnalyticalEngine):
    id = "COVERAGE"
    slug = "coverage"
    name = "Coverage & Blind-Spot Engine"
    short_name = "Coverage & Blind Spots"
    purpose = "Where is monitoring or evidence coverage incomplete?"
    icon_name = "radar"
    route = "/analysis/coverage"
    version = "1.3.1"
    rule_version = "COV-BLIND-1.3"
    pipeline_version = "SAT-SA-2026.3"

    def compute(self, context: AnalysisContext) -> List[AnalyticsSignalResponse]:
        db: Session = context.db
        signals: List[AnalyticsSignalResponse] = []

        cses_query = db.query(CSE)
        if context.cse_id:
            cses_query = cses_query.filter((CSE.public_id == context.cse_id) | (CSE.id == context.cse_id))
        cses = cses_query.all()

        STANDARD_SOURCES = ["SIEM", "EDR", "GATEWAY", "AUTH", "CASE_MGMT"]

        for cse in cses:
            evidences = db.query(Evidence).filter(Evidence.cse_id == cse.id).all()
            observed_sources = set(e.source_system for e in evidences)
            ev_ids = [e.public_id for e in evidences]

            # 1. Missing log sources check
            missing_sources = [s for s in STANDARD_SOURCES if s not in observed_sources]
            for ms in missing_sources:
                sig_id = f"SIG-COV-{cse.public_id}-{ms}"
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
                        finding_id=f"FND-COV-{cse.public_id.replace('CSE-', '')}1",
                        findingId=f"FND-COV-{cse.public_id.replace('CSE-', '')}1",
                        priority="HIGH" if ms in ("EDR", "GATEWAY") else "MEDIUM",
                        status="CANDIDATE",
                        title=f"Unmonitored Telemetry Channel ({ms} Stream Omitted)",
                        reason=f"Supervisory framework requires active {ms} feed, but zero {ms} telemetry feeds have registered for {cse.name}.",
                        expected=f"Continuous or periodic telemetry feed ingested from {ms} boundary components.",
                        observed=f"Source {ms} is completely missing from current assessment window.",
                        difference=f"Coverage Blind Spot: {ms} unmonitored.",
                        evidence_ids=ev_ids[:2],
                        evidenceIds=ev_ids[:2],
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
                        coverage_area="Monitoring Coverage",
                        coverageArea="Monitoring Coverage",
                        explanation=f"Algorithmic coverage analysis flagged absence of {ms} telemetry channel in enclave inventory.",
                    )
                )

            # 2. Network blind spots check (e.g. SCADA OT boundary segment unmonitored)
            if cse.tier == "TIER-1" and "GATEWAY" not in observed_sources:
                sig_id = f"SIG-COV-NET-{cse.public_id}"
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
                        priority="CRITICAL",
                        status="CANDIDATE",
                        title="Critical OT Perimeter Network Blind Spot",
                        reason=f"Tier-1 facility {cse.name} lacks verified network boundary gateway feeds for SCADA control zones.",
                        expected="100% flow and firewall log capture across perimeter and safety instrumentation switches.",
                        observed="Zero boundary network gateway telemetry submitted.",
                        difference="Critical Network Blind Spot / SCADA Zone Vulnerability",
                        evidence_ids=ev_ids[:1],
                        evidenceIds=ev_ids[:1],
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
                        coverage_area="Asset Coverage",
                        coverageArea="Asset Coverage",
                    )
                )

        return signals

    def get_kpis(self, signals: List[AnalyticsSignalResponse], context: AnalysisContext) -> List[EngineKPI]:
        total = len(signals)
        critical_spots = len([s for s in signals if s.priority == "CRITICAL"])
        missing_sources = len([s for s in signals if "Channel" in s.title])
        affected_cses = len(set(s.cse_id for s in signals))

        return [
            EngineKPI(
                title="Coverage Gaps",
                value=total,
                subtitle="Identified Blind Spots",
                semantic="blue",
            ),
            EngineKPI(
                title="Critical Blind Spots",
                value=critical_spots,
                subtitle="Perimeter Deficits",
                semantic="red",
                alert=critical_spots > 0,
            ),
            EngineKPI(
                title="Missing Log Sources",
                value=missing_sources,
                subtitle="Unregistered Collectors",
                semantic="amber",
            ),
            EngineKPI(
                title="Affected CSEs",
                value=affected_cses,
                subtitle="Incomplete Enclave Scope",
                semantic="neutral",
            ),
        ]
