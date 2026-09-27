import json
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from app.core.logging import logger
from app.analytics.base import AnalyticalEngine
from app.analytics.context import AnalysisContext
from app.analytics.engines.execution_gap import ExecutionGapEngine
from app.analytics.engines.negative_space import NegativeSpaceEngine
from app.analytics.engines.coverage import CoverageBlindSpotEngine
from app.analytics.engines.process import ProcessConformanceEngine
from app.analytics.engines.investigation_quality import InvestigationQualityEngine
from app.analytics.engines.behavioural import BehaviouralDeviationEngine
from app.analytics.engines.historical import HistoricalComparisonEngine
from app.analytics.engines.peer import PeerBenchmarkingEngine
from app.analytics.engines.consistency import CrossSourceConsistencyEngine
from app.analytics.engines.metric_integrity import MetricIntegrityEngine
from app.db.models.analysis import AnalyticalSignalModel, AnalysisJobModel
from app.db.models.cse import CSE
from app.db.models.control import Control
from app.schemas.analysis import (
    AnalyticsEngineMetaResponse,
    AnalyticsSignalResponse,
    EngineKPI,
    EngineRunResponse,
)


class EngineRegistry:
    def __init__(self):
        self._engines: Dict[str, AnalyticalEngine] = {}
        self._register_default_engines()

    def _register_default_engines(self):
        engines = [
            ExecutionGapEngine(),
            NegativeSpaceEngine(),
            CoverageBlindSpotEngine(),
            ProcessConformanceEngine(),
            InvestigationQualityEngine(),
            BehaviouralDeviationEngine(),
            HistoricalComparisonEngine(),
            PeerBenchmarkingEngine(),
            CrossSourceConsistencyEngine(),
            MetricIntegrityEngine(),
        ]
        for eng in engines:
            self._engines[eng.slug] = eng

    def get_engine(self, slug: str) -> Optional[AnalyticalEngine]:
        # Support slug or ID lookup
        if slug in self._engines:
            return self._engines[slug]
        for eng in self._engines.values():
            if eng.id.lower() == slug.lower().replace("-", "_"):
                return eng
        return None

    def list_engines(self, db: Optional[Session] = None) -> List[AnalyticsEngineMetaResponse]:
        metas = []
        for eng in self._engines.values():
            signal_count = 0
            if db:
                signal_count = db.query(AnalyticalSignalModel).filter(
                    (AnalyticalSignalModel.engine_slug == eng.slug) | (AnalyticalSignalModel.engine_type == eng.id)
                ).count()
            metas.append(eng.get_meta(signal_count=signal_count))
        return metas

    def execute_engine(
        self,
        slug: str,
        context: AnalysisContext,
        persist: bool = True
    ) -> EngineRunResponse:
        engine = self.get_engine(slug)
        if not engine:
            raise KeyError(f"Analytical engine with slug '{slug}' not found.")

        start_time = time.perf_counter()
        signals = engine.compute(context)
        exec_ms = round((time.perf_counter() - start_time) * 1000, 2)

        kpis = engine.get_kpis(signals, context)
        trend = engine.get_trend_comparison(signals, context)

        # Persist signals and execution job record in PostgreSQL/SQLite
        if persist and context.db:
            db = context.db
            job_id = f"JOB-{engine.slug[:6].upper()}-{uuid.uuid4().hex[:8].upper()}"

            for sig in signals:
                # Resolve CSE and Control UUIDs
                cse = db.query(CSE).filter(CSE.public_id == sig.cse_id).first()
                ctrl = db.query(Control).filter(Control.public_id == sig.control_id).first() if sig.control_id else None

                existing = db.query(AnalyticalSignalModel).filter(
                    AnalyticalSignalModel.signal_id == sig.signal_id
                ).first()

                if not existing:
                    signal_model = AnalyticalSignalModel(
                        signal_id=sig.signal_id,
                        engine_type=sig.engine_type,
                        engine_slug=engine.slug,
                        cse_id=cse.id if cse else None,
                        control_id=ctrl.id if ctrl else None,
                        finding_id=sig.finding_id,
                        priority=sig.priority,
                        status=sig.status,
                        title=sig.title,
                        reason=sig.reason,
                        expected=sig.expected,
                        observed=sig.observed,
                        difference=sig.difference,
                        evidence_ids=json.dumps(sig.evidence_ids),
                        recommended_for_sampling=sig.recommended_for_sampling,
                        rule_version=sig.rule_version,
                        control_version=sig.control_version,
                        model_version=sig.model_version,
                        engine_version=engine.version,
                        pipeline_version=engine.pipeline_version,
                        details=json.dumps({
                            "gap_type": sig.gap_type,
                            "evidence_state": sig.evidence_state,
                            "coverage_area": sig.coverage_area,
                            "deviation_type": sig.deviation_type,
                            "explanation": sig.explanation,
                        }),
                    )
                    db.add(signal_model)

            # Record job execution
            job = AnalysisJobModel(
                job_id=job_id,
                engine_slug=engine.slug,
                status="COMPLETED",
                parameters=json.dumps(context.parameters),
                result_summary=json.dumps({
                    "signals_count": len(signals),
                    "kpis": [k.model_dump() for k in kpis],
                }),
                execution_time_ms=exec_ms,
                completed_at=datetime.now(timezone.utc),
            )
            db.add(job)
            db.commit()

        meta = engine.get_meta(signal_count=len(signals))
        return EngineRunResponse(
            engine_metadata=meta,
            version=engine.version,
            rule_version=engine.rule_version,
            pipeline_version=engine.pipeline_version,
            execution_time_ms=exec_ms,
            executed_at=datetime.now(timezone.utc),
            kpis=kpis,
            signals=signals,
            trend_comparison=trend,
            total=len(signals),
            page=1,
            page_size=50,
        )


engine_registry = EngineRegistry()
