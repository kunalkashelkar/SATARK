from typing import Any, Dict, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.analytics.base import AnalyticalEngine
from app.analytics.context import AnalysisContext
from app.schemas.analysis import AnalyticsSignalResponse, EngineKPI
from app.db.models.cse import CSE
from app.db.models.evidence import Evidence


class NegativeSpaceEngine(AnalyticalEngine):
    id = "NEGATIVE_SPACE"
    slug = "negative-space"
    name = "Negative Space Engine"
    short_name = "Negative Space"
    purpose = "What evidence should exist but is missing or unavailable?"
    icon_name = "contrast"
    route = "/analysis/negative-space"
    version = "1.2.0"
    rule_version = "NEG-SPACE-1.2"
    pipeline_version = "SAT-SA-2026.3"

    def compute(self, context: AnalysisContext) -> List[AnalyticsSignalResponse]:
        db: Session = context.db
        signals: List[AnalyticsSignalResponse] = []

        cses_query = db.query(CSE)
        if context.cse_id:
            cses_query = cses_query.filter((CSE.public_id == context.cse_id) | (CSE.id == context.cse_id))
        cses = cses_query.all()

        from app.db.models.ingestion import OperationalCase

        for cse in cses:
            # Query operational cases for actual SLA negative space omissions
            cases = db.query(OperationalCase).filter(OperationalCase.cse_id == cse.public_id).all()
            for c in cases:
                # Rule 001: High alert triage within 15 mins
                if c.severity in ("HIGH", "CRITICAL") and c.alert_time:
                    expected_event = "High Severity Alert Triage"
                    window = "15 minutes"
                    if not c.triage_time:
                        # Completely missing triage event
                        sig_id = f"SIG-NS-{c.case_id}-NO-TRIAGE"
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
                                finding_id=f"FND-NS-{c.case_id}",
                                findingId=f"FND-NS-{c.case_id}",
                                priority="CRITICAL" if c.severity == "CRITICAL" else "HIGH",
                                status="CANDIDATE",
                                title=f"Negative Space: Unperformed Triage for {c.case_id}",
                                reason=f"Alert {c.alert_id} ({c.severity}) generated at {c.alert_time} has no corresponding TRIAGE event in telemetry.",
                                expected=f"{expected_event} inside SLA window of {window}.",
                                observed=f"Zero triage activity recorded. Status remains {c.status}.",
                                difference=f"Negative Space Detected: Expected triage missing inside {window} window. Absence Reason: Analyst abandoned or queue timeout.",
                                evidence_ids=[c.alert_id] if c.alert_id else [],
                                evidenceIds=[c.alert_id] if c.alert_id else [],
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
                                evidence_state="ABSENT_CONFIRMED",
                                evidenceState="ABSENT_CONFIRMED",
                                explanation=f"Negative space formulation: Expected event: {expected_event} | Window: {window} | Matched Event: None | Absence Reason: No telemetry received inside SLA boundary.",
                            )
                        )
                    else:
                        delta_mins = (c.triage_time - c.alert_time).total_seconds() / 60.0
                        if delta_mins > 15.0:
                            sig_id = f"SIG-NS-{c.case_id}-TRIAGE-SLA"
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
                                    finding_id=f"FND-NS-{c.case_id}",
                                    findingId=f"FND-NS-{c.case_id}",
                                    priority="HIGH",
                                    status="CANDIDATE",
                                    title=f"Negative Space: No Triage Inside SLA Window for {c.case_id}",
                                    reason=f"Alert {c.alert_id} ({c.severity}) was required within window [{window}], but triage was delayed to {delta_mins:.1f} mins.",
                                    expected=f"{expected_event} inside SLA window of {window}.",
                                    observed=f"No triage event occurred between 0 and 15 mins. Matched event occurred at +{delta_mins:.1f} mins.",
                                    difference=f"Negative Space Detected: Expected activity absent in [0, 15m] window. Absence Reason: Delayed operational pickup.",
                                    evidence_ids=[c.alert_id] if c.alert_id else [],
                                    evidenceIds=[c.alert_id] if c.alert_id else [],
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
                                    evidence_state="ABSENT_CONFIRMED",
                                    evidenceState="ABSENT_CONFIRMED",
                                    explanation=f"Negative space formulation: Expected event: {expected_event} | Window: {window} | Matched Event: Delayed Triage ({delta_mins:.1f}m) | Absence Reason: Operational response absent in required statutory window.",
                                )
                            )

            # Model: Expected mandatory evidence window + absence of matching submission = Signal
            expected_windows = [
                ("SOC Escalation Dispatches", "CTRL-12", "30 minutes post-critical alert", "ESCALATION"),
                ("Firewall Ingress Rejection Audit Logs", "CTRL-07", "Hourly batch submission", "GATEWAY"),
                ("Privileged Credential Escalation Trajectories", "CTRL-07", "Continuous real-time stream", "AUTH"),
            ]

            evidences = db.query(Evidence).filter(Evidence.cse_id == cse.id).all()
            ev_categories = set(e.category for e in evidences)
            ev_sources = set(e.source_system for e in evidences)

            for item_name, ctrl_code, time_window, req_cat in expected_windows:
                is_missing = (req_cat not in ev_categories and req_cat not in ev_sources)
                # Check if there is an explicit unsubmitted record
                unsubmitted = [e for e in evidences if (e.category == req_cat or e.source_system == req_cat) and e.state in ("NOT_SUBMITTED", "ABSENT_CONFIRMED")]

                if is_missing or unsubmitted:
                    ev_ref = unsubmitted[0].public_id if unsubmitted else "MISSING-EXPECTED"
                    sig_id = f"SIG-NS-{cse.public_id}-{req_cat}"
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
                            control_id=ctrl_code,
                            controlId=ctrl_code,
                            finding_id=f"FND-NS-{cse.public_id.replace('CSE-', '')}1",
                            findingId=f"FND-NS-{cse.public_id.replace('CSE-', '')}1",
                            priority="HIGH",
                            status="CANDIDATE",
                            title=f"Absence of Mandatory {item_name}",
                            reason=f"Operational stream '{item_name}' was required within window [{time_window}], but zero valid telemetry packets were observed.",
                            expected=f"Telemetry event stream for {item_name} received within {time_window}.",
                            observed=f"Complete absence of matching events. Telemetry gap confirmed in supervisory enclave.",
                            difference=f"Negative Space Detected: Expected activity [{item_name}] unrecorded.",
                            evidence_ids=[ev_ref] if ev_ref != "MISSING-EXPECTED" else [],
                            evidenceIds=[ev_ref] if ev_ref != "MISSING-EXPECTED" else [],
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
                            evidence_state="ABSENT_CONFIRMED" if unsubmitted else "NOT_SUBMITTED",
                            evidenceState="ABSENT_CONFIRMED" if unsubmitted else "NOT_SUBMITTED",
                            explanation=f"Negative space formulation: Expected event ({item_name}) + window ({time_window}) + absence of observation => Confirmed Omission.",
                        )
                    )

        return signals

    def get_kpis(self, signals: List[AnalyticsSignalResponse], context: AnalysisContext) -> List[EngineKPI]:
        total = len(signals)
        confirmed_absent = len([s for s in signals if s.evidence_state == "ABSENT_CONFIRMED"])
        not_submitted = len([s for s in signals if s.evidence_state == "NOT_SUBMITTED"])
        high_prio = len([s for s in signals if s.priority in ("CRITICAL", "HIGH")])

        return [
            EngineKPI(
                title="Missing Artifacts",
                value=total,
                subtitle="Expected But Unobserved",
                semantic="blue",
            ),
            EngineKPI(
                title="Confirmed Absent",
                value=confirmed_absent,
                subtitle="Statutory Ingestion Breaches",
                semantic="red",
                alert=confirmed_absent > 0,
            ),
            EngineKPI(
                title="Not Submitted",
                value=not_submitted,
                subtitle="Pending Transmission Window",
                semantic="amber",
            ),
            EngineKPI(
                title="Critical Omissions",
                value=high_prio,
                subtitle="High Impact Evidence Gaps",
                semantic="neutral",
            ),
        ]
