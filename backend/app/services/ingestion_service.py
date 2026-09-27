import csv
import io
import json
import os
import uuid
import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.logging import logger
from app.db.models.cse import CSE
from app.db.models.control import Control, ControlApplicability
from app.db.models.assessment import AssessmentCycle
from app.db.models.evidence import Evidence, EvidenceProvenance, EvidenceControlLink
from app.db.models.governance import RuleVersion
from app.db.models.ingestion import (
    IngestionJob,
    Asset,
    DeclaredCapability,
    ReportedSOCMetric,
    OperationalCase,
)
from app.evidence.canonical_model import CanonicalEvent
from app.evidence.normalization import EventNormalizer
from app.evidence.storage import EvidenceStorage
from app.evidence.clickhouse_adapter import clickhouse_adapter


class IngestionService:
    DATASET_DIR = os.getenv("SYNTHETIC_DATASET_DIR", "data/synthetic_dataset")

    @classmethod
    def compute_sha256(cls, content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()

    @classmethod
    def parse_timestamp(cls, ts_str: Optional[str]) -> Optional[datetime]:
        if not ts_str or not str(ts_str).strip():
            return None
        cleaned = str(ts_str).strip()
        try:
            return datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
        except Exception:
            for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
                try:
                    return datetime.strptime(cleaned, fmt).replace(tzinfo=timezone.utc)
                except ValueError:
                    pass
        return None

    @classmethod
    def list_jobs(cls, db: Session, limit: int = 50) -> List[IngestionJob]:
        return db.query(IngestionJob).order_by(IngestionJob.started_at.desc()).limit(limit).all()

    @classmethod
    def get_job(cls, db: Session, job_id: str) -> Optional[IngestionJob]:
        return db.query(IngestionJob).filter(IngestionJob.job_id == job_id).first()

    # -------------------------------------------------------------------------
    # Core Ingestion Router per file type
    # -------------------------------------------------------------------------
    @classmethod
    def process_file_content(
        cls,
        db: Session,
        filename: str,
        content_bytes: bytes,
        job_id: Optional[str] = None
    ) -> IngestionJob:
        if not job_id:
            job_id = f"ING-{uuid.uuid4().hex[:10].upper()}"

        file_hash = cls.compute_sha256(content_bytes)
        source = cls._detect_source(filename)

        job = IngestionJob(
            job_id=job_id,
            filename=filename,
            source=source,
            status="PROCESSING",
            rows_processed=0,
            rows_rejected=0,
            records_created=0,
            records_updated=0,
            sha256=file_hash,
            error_summary=None,
            rejected_rows_sample=None,
        )
        db.add(job)
        db.commit()

        try:
            errors: List[str] = []
            rejected_samples: List[Dict[str, Any]] = []

            if filename.endswith(".json"):
                text_data = content_bytes.decode("utf-8")
                json_data = json.loads(text_data)
                created, updated, processed, rejected = cls._ingest_json(
                    db, filename, source, json_data, file_hash, errors, rejected_samples
                )
            elif filename.endswith(".csv"):
                text_data = content_bytes.decode("utf-8-sig")
                created, updated, processed, rejected = cls._ingest_csv(
                    db, filename, source, text_data, file_hash, errors, rejected_samples
                )
            else:
                job.status = "FAILED"
                job.error_summary = f"Unsupported file extension: {filename}"
                job.completed_at = datetime.now(timezone.utc)
                db.commit()
                return job

            job.rows_processed = processed
            job.rows_rejected = rejected
            job.records_created = created
            job.records_updated = updated
            job.status = "COMPLETED" if rejected == 0 else "PARTIAL"
            if errors:
                job.error_summary = "\n".join(errors[:20])
            if rejected_samples:
                job.rejected_rows_sample = json.dumps(rejected_samples[:10])

        except Exception as exc:
            logger.error(f"Ingestion failed for {filename}: {exc}", exc_info=True)
            job.status = "FAILED"
            job.error_summary = str(exc)
            db.rollback()

        job.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(job)
        return job

    @classmethod
    def _detect_source(cls, filename: str) -> str:
        fn = filename.lower()
        if "cse_assessment_master" in fn:
            return "CSE_MASTER"
        if "control_library" in fn:
            return "CONTROL_LIBRARY"
        if "asset_inventory" in fn:
            return "ASSET_INVENTORY"
        if "siem_alerts" in fn:
            return "SIEM"
        if "case_events" in fn:
            return "CASE_EVENTS"
        if "case_management" in fn:
            return "CASE_MANAGEMENT"
        if "edr_telemetry" in fn:
            return "EDR"
        if "network_gateway" in fn or "gateway_telemetry" in fn:
            return "GATEWAY"
        if "ticketing" in fn:
            return "TICKETING"
        if "authentication" in fn:
            return "AUTH"
        if "reported_soc_metrics" in fn or "soc_metrics" in fn:
            return "SOC_METRICS"
        if "declared_capabilities" in fn:
            return "DECLARED_CAPABILITIES"
        if "evidence_manifest" in fn:
            return "EVIDENCE_MANIFEST"
        if "seed_analytical_signals" in fn:
            return "SEED_SIGNALS"
        if "expected_operational_rules" in fn or "operational_rules" in fn:
            return "OPERATIONAL_RULES"
        return "GENERIC_TELEMETRY"

    # -------------------------------------------------------------------------
    # JSON Ingestion Dispatcher
    # -------------------------------------------------------------------------
    @classmethod
    def _ingest_json(
        cls,
        db: Session,
        filename: str,
        source: str,
        data: Any,
        file_hash: str,
        errors: List[str],
        rejected: List[Dict[str, Any]]
    ) -> Tuple[int, int, int, int]:
        created = updated = processed = rej = 0

        if source == "CSE_MASTER":
            # 01_CSE_Assessment_Master.json
            processed = 1
            cse_id = data.get("cse_id")
            if not cse_id:
                errors.append("Missing required field 'cse_id' in CSE Master JSON")
                rejected.append({"record": data, "reason": "Missing cse_id"})
                return 0, 0, 1, 1

            cse = db.query(CSE).filter(CSE.public_id == cse_id).first()
            if not cse:
                cse = CSE(
                    public_id=cse_id,
                    name=data.get("cse_name", f"{cse_id} Operational Entity"),
                    sector=data.get("sector", "Energy"),
                    tier=data.get("tier", "TIER-1"),
                    organization_type="Critical Sector Entity",
                    location="India",
                    soc_type="Hybrid 24x7 SOC",
                    evidence_readiness=71.0,
                    readiness_category="Acceptable",
                    supervisory_priority="HIGH",
                    status="Under Review",
                )
                db.add(cse)
                db.flush()
                created += 1
            else:
                cse.name = data.get("cse_name", cse.name)
                cse.sector = data.get("sector", cse.sector)
                cse.tier = data.get("tier", cse.tier)
                updated += 1

            # Assessment cycle link
            cycle_id = data.get("assessment_cycle_id", "AC-2026-Q3-014")
            cycle = db.query(AssessmentCycle).filter(AssessmentCycle.public_id == cycle_id).first()
            if not cycle:
                cycle = AssessmentCycle(
                    public_id=cycle_id,
                    cse_id=cse.id,
                    period="2026-Q3",
                    status="IN_PROGRESS",
                    evidence_readiness=71.0,
                    controls_assessed=3,
                    start_date=cls.parse_timestamp(data.get("assessment_period_start")),
                    end_date=cls.parse_timestamp(data.get("assessment_period_end")),
                )
                db.add(cycle)
                db.flush()

        elif source == "EVIDENCE_MANIFEST":
            # 13_Evidence_Manifest.json
            records = data.get("records", [])
            for item in records:
                processed += 1
                ev_id = item.get("evidence_id")
                cse_code = item.get("cse_id", "CSE-014")
                if not ev_id or not cse_code:
                    errors.append(f"Invalid manifest item missing evidence_id or cse_id: {item}")
                    rejected.append({"record": item, "reason": "Missing required IDs"})
                    rej += 1
                    continue

                cse = db.query(CSE).filter(CSE.public_id == cse_code).first()
                if not cse:
                    cse = CSE(
                        public_id=cse_code,
                        name=f"{cse_code} Operations",
                        sector="Energy",
                        tier="TIER-1"
                    )
                    db.add(cse)
                    db.flush()

                ctrl_id = item.get("control_id")
                ctrl = None
                if ctrl_id:
                    ctrl = db.query(Control).filter(
                        or_(Control.public_id == ctrl_id, Control.code == ctrl_id)
                    ).first()

                ev = db.query(Evidence).filter(Evidence.public_id == ev_id).first()
                prov_data = item.get("provenance", {})
                prov_received = cls.parse_timestamp(prov_data.get("received_at")) or datetime.now(timezone.utc)

                if not ev:
                    # Generate deterministic sha256 for manifest item
                    item_hash = hashlib.sha256(json.dumps(item, sort_keys=True).encode()).hexdigest()
                    ev = Evidence(
                        public_id=ev_id,
                        cse_id=cse.id,
                        control_id=ctrl.id if ctrl else None,
                        category=item.get("category", "SOC_LOG"),
                        state=item.get("state", "PRESENT"),
                        validation_status=item.get("validation_status", "VALID"),
                        sha256=item_hash,
                        source_system=item.get("source_system", "SIEM"),
                        source_event_id=item.get("source_reference"),
                        file_type="JSON_MANIFEST",
                        received_at=prov_received,
                    )
                    db.add(ev)
                    db.flush()

                    prov = EvidenceProvenance(
                        evidence_id=ev.id,
                        collector=prov_data.get("collector_id", "COL-01"),
                        transmission_token=prov_data.get("transmission_token"),
                        received_by="NCIIPC Automated Enclave Gateway",
                        ingested_at=prov_received,
                    )
                    db.add(prov)

                    if ctrl:
                        link = EvidenceControlLink(
                            evidence_id=ev.id,
                            control_id=ctrl.id,
                            mapping_type="DIRECT",
                            confidence=1.0,
                            notes=f"Mapped via manifest from {item.get('artifact_file')}"
                        )
                        db.add(link)
                    created += 1
                else:
                    ev.state = item.get("state", ev.state)
                    ev.validation_status = item.get("validation_status", ev.validation_status)
                    if ctrl and not ev.control_id:
                        ev.control_id = ctrl.id
                    updated += 1

        elif source == "OPERATIONAL_RULES":
            # 15_Expected_Operational_Rules.json
            rules = data.get("rules", [])
            for r in rules:
                processed += 1
                rule_id = r.get("rule_id")
                if not rule_id:
                    rej += 1
                    continue
                rv = db.query(RuleVersion).filter(RuleVersion.rule_id == rule_id).first()
                if not rv:
                    rv = RuleVersion(
                        rule_id=rule_id,
                        engine_slug=r.get("engine_slug", "execution-gap"),
                        version=data.get("rules_version", "2026.3"),
                        name=r.get("name", rule_id),
                        description=r.get("description"),
                        logic_hash=cls.compute_sha256(json.dumps(r).encode()),
                        parameters=json.dumps(r.get("thresholds", {})),
                        status="ACTIVE"
                    )
                    db.add(rv)
                    created += 1
                else:
                    rv.parameters = json.dumps(r.get("thresholds", {}))
                    updated += 1

        elif source == "SEED_SIGNALS":
            # 14_Seed_Analytical_Signals.json
            # TASK 8 instruction: Do not use to bypass engines, but register reference demo metadata
            signals = data.get("signals", [])
            processed = len(signals)

        return created, updated, processed, rej

    # -------------------------------------------------------------------------
    # CSV Ingestion Dispatcher
    # -------------------------------------------------------------------------
    @classmethod
    def _ingest_csv(
        cls,
        db: Session,
        filename: str,
        source: str,
        csv_text: str,
        file_hash: str,
        errors: List[str],
        rejected: List[Dict[str, Any]]
    ) -> Tuple[int, int, int, int]:
        created = updated = processed = rej = 0

        reader = csv.DictReader(io.StringIO(csv_text))
        rows = list(reader)

        canonical_events_to_store: List[CanonicalEvent] = []
        default_cse_id = "CSE-014"

        # Resolve or ensure CSE-014
        cse_014 = db.query(CSE).filter(CSE.public_id == "CSE-014").first()
        if not cse_014:
            cse_014 = CSE(
                public_id="CSE-014",
                name="Western Grid Operations - Synthetic Entity",
                sector="Energy",
                tier="TIER-1"
            )
            db.add(cse_014)
            db.flush()

        for idx, row in enumerate(rows, start=1):
            processed += 1
            try:
                if source == "CONTROL_LIBRARY":
                    # control_id,control_code,title,severity,expected_outcome,expected_evidence
                    c_id = row.get("control_id")
                    if not c_id:
                        errors.append(f"Row {idx}: missing control_id")
                        rejected.append({"row": idx, "data": row, "reason": "Missing control_id"})
                        rej += 1
                        continue

                    ctrl = db.query(Control).filter(Control.public_id == c_id).first()
                    if not ctrl:
                        ctrl = Control(
                            public_id=c_id,
                            code=row.get("control_code", f"SOC.{c_id}"),
                            title=row.get("title", f"Supervisory Control {c_id}"),
                            severity=row.get("severity", "HIGH").upper(),
                            domain="Operational SOC Monitoring",
                            version="2026.3",
                            status="ACTIVE",
                            expected_outcomes=row.get("expected_outcome"),
                            expected_evidence=row.get("expected_evidence")
                        )
                        db.add(ctrl)
                        db.flush()

                        # Link applicability to CSE-014
                        app = ControlApplicability(
                            control_id=ctrl.id,
                            cse_id=cse_014.id,
                            applicability_status="APPLICABLE"
                        )
                        db.add(app)
                        created += 1
                    else:
                        ctrl.expected_outcomes = row.get("expected_outcome", ctrl.expected_outcomes)
                        ctrl.expected_evidence = row.get("expected_evidence", ctrl.expected_evidence)
                        updated += 1

                elif source == "ASSET_INVENTORY":
                    # asset_id,asset_type,environment,network_segment,criticality
                    a_id = row.get("asset_id")
                    if not a_id:
                        errors.append(f"Row {idx}: missing asset_id")
                        rejected.append({"row": idx, "data": row, "reason": "Missing asset_id"})
                        rej += 1
                        continue

                    asset = db.query(Asset).filter(Asset.asset_id == a_id).first()
                    if not asset:
                        asset = Asset(
                            asset_id=a_id,
                            cse_id=default_cse_id,
                            asset_type=row.get("asset_type", "Host"),
                            environment=row.get("environment", "OT"),
                            network_segment=row.get("network_segment", "SEGMENT-01"),
                            criticality=row.get("criticality", "HIGH").upper(),
                        )
                        db.add(asset)
                        created += 1
                    else:
                        asset.asset_type = row.get("asset_type", asset.asset_type)
                        asset.criticality = row.get("criticality", asset.criticality)
                        updated += 1

                elif source == "SIEM":
                    # alert_id,alert_timestamp,case_id,cse_id,asset_id,severity,alert_type,source,status
                    alert_id = row.get("alert_id")
                    if not alert_id:
                        errors.append(f"Row {idx}: missing alert_id")
                        rejected.append({"row": idx, "data": row, "reason": "Missing alert_id"})
                        rej += 1
                        continue

                    ts = cls.parse_timestamp(row.get("alert_timestamp")) or datetime.now(timezone.utc)
                    c_event = CanonicalEvent(
                        event_id=f"EVT-SIEM-{alert_id}",
                        timestamp=ts,
                        cse_id=row.get("cse_id", default_cse_id),
                        source="SIEM",
                        event_class="security_finding",
                        actor="siem-detector",
                        case_id=row.get("case_id"),
                        asset_id=row.get("asset_id"),
                        action="ALERT_GENERATED",
                        severity=row.get("severity", "HIGH").upper(),
                        raw_reference=alert_id,
                        metadata={
                            "alert_type": row.get("alert_type"),
                            "status": row.get("status"),
                            "raw_source": row.get("source"),
                        }
                    )
                    canonical_events_to_store.append(c_event)
                    created += 1

                elif source == "CASE_EVENTS":
                    # case_id,event_timestamp,event_type,actor,alert_id
                    c_id = row.get("case_id")
                    ev_type = row.get("event_type")
                    if not c_id or not ev_type:
                        errors.append(f"Row {idx}: missing case_id or event_type")
                        rejected.append({"row": idx, "data": row, "reason": "Missing required event fields"})
                        rej += 1
                        continue

                    ts = cls.parse_timestamp(row.get("event_timestamp")) or datetime.now(timezone.utc)
                    c_event = CanonicalEvent(
                        event_id=f"EVT-CASE-{c_id}-{idx}",
                        timestamp=ts,
                        cse_id=default_cse_id,
                        source="CASE_EVENTS",
                        event_class="incident_case",
                        actor=row.get("actor"),
                        case_id=c_id,
                        action=ev_type,
                        severity="HIGH" if ev_type in ("ESCALATION", "INCIDENT") else "MEDIUM",
                        raw_reference=f"{c_id}:{ev_type}",
                        metadata={"alert_id": row.get("alert_id")}
                    )
                    canonical_events_to_store.append(c_event)
                    created += 1

                elif source == "CASE_MANAGEMENT":
                    # case_id,alert_id,cse_id,assigned_analyst,alert_time,triage_time,investigation_time,escalation_time,closure_time,status,severity
                    case_id = row.get("case_id")
                    if not case_id:
                        errors.append(f"Row {idx}: missing case_id")
                        rejected.append({"row": idx, "data": row, "reason": "Missing case_id"})
                        rej += 1
                        continue

                    c_cse = row.get("cse_id", default_cse_id)
                    case = db.query(OperationalCase).filter(OperationalCase.case_id == case_id).first()
                    alert_dt = cls.parse_timestamp(row.get("alert_time"))
                    triage_dt = cls.parse_timestamp(row.get("triage_time"))
                    inv_dt = cls.parse_timestamp(row.get("investigation_time"))
                    esc_dt = cls.parse_timestamp(row.get("escalation_time"))
                    cls_dt = cls.parse_timestamp(row.get("closure_time"))

                    if not case:
                        case = OperationalCase(
                            case_id=case_id,
                            alert_id=row.get("alert_id"),
                            cse_id=c_cse,
                            assigned_analyst=row.get("assigned_analyst"),
                            alert_time=alert_dt,
                            triage_time=triage_dt,
                            investigation_time=inv_dt,
                            escalation_time=esc_dt,
                            closure_time=cls_dt,
                            status=row.get("status", "OPEN"),
                            severity=row.get("severity", "HIGH").upper(),
                        )
                        db.add(case)
                        created += 1
                    else:
                        case.status = row.get("status", case.status)
                        case.severity = row.get("severity", case.severity)
                        updated += 1

                    # Canonical case event
                    ref_ts = alert_dt or triage_dt or datetime.now(timezone.utc)
                    c_event = CanonicalEvent(
                        event_id=f"EVT-CASEMGMT-{case_id}",
                        timestamp=ref_ts,
                        cse_id=c_cse,
                        source="CASE_MGMT",
                        event_class="incident_case",
                        actor=row.get("assigned_analyst"),
                        case_id=case_id,
                        action=row.get("status", "OPEN"),
                        severity=row.get("severity", "HIGH").upper(),
                        raw_reference=case_id,
                        metadata={
                            "alert_id": row.get("alert_id"),
                            "escalated": bool(esc_dt),
                            "closed": bool(cls_dt)
                        }
                    )
                    canonical_events_to_store.append(c_event)

                elif source == "EDR":
                    # event_id,timestamp,cse_id,asset_id,case_id,event_type,object,severity
                    e_id = row.get("event_id")
                    if not e_id:
                        errors.append(f"Row {idx}: missing event_id")
                        rejected.append({"row": idx, "data": row, "reason": "Missing event_id"})
                        rej += 1
                        continue

                    ts = cls.parse_timestamp(row.get("timestamp")) or datetime.now(timezone.utc)
                    c_event = CanonicalEvent(
                        event_id=f"EVT-EDR-{e_id}",
                        timestamp=ts,
                        cse_id=row.get("cse_id", default_cse_id),
                        source="EDR",
                        event_class="endpoint_detection",
                        actor="edr-sensor",
                        case_id=row.get("case_id"),
                        asset_id=row.get("asset_id"),
                        action=row.get("event_type", "PROCESS_EVENT"),
                        severity=row.get("severity", "LOW").upper(),
                        raw_reference=e_id,
                        metadata={"object": row.get("object")}
                    )
                    canonical_events_to_store.append(c_event)
                    created += 1

                elif source == "GATEWAY":
                    # event_id,timestamp,cse_id,segment_id,event_type,collector,severity
                    gw_id = row.get("event_id")
                    if not gw_id:
                        errors.append(f"Row {idx}: missing event_id")
                        rejected.append({"row": idx, "data": row, "reason": "Missing event_id"})
                        rej += 1
                        continue

                    ts = cls.parse_timestamp(row.get("timestamp")) or datetime.now(timezone.utc)
                    c_event = CanonicalEvent(
                        event_id=f"EVT-GW-{gw_id}",
                        timestamp=ts,
                        cse_id=row.get("cse_id", default_cse_id),
                        source="GATEWAY",
                        event_class="network_activity",
                        actor=row.get("collector", "gateway"),
                        case_id=None,
                        asset_id=row.get("segment_id"),
                        action=row.get("event_type", "FLOW_FORWARDED"),
                        severity=row.get("severity", "LOW").upper(),
                        raw_reference=gw_id,
                        metadata={"segment_id": row.get("segment_id")}
                    )
                    canonical_events_to_store.append(c_event)
                    created += 1

                elif source == "TICKETING":
                    # ticket_id,timestamp,cse_id,case_id,ticket_type,severity,category,status
                    t_id = row.get("ticket_id")
                    if not t_id:
                        errors.append(f"Row {idx}: missing ticket_id")
                        rejected.append({"row": idx, "data": row, "reason": "Missing ticket_id"})
                        rej += 1
                        continue

                    ts = cls.parse_timestamp(row.get("timestamp")) or datetime.now(timezone.utc)
                    c_event = CanonicalEvent(
                        event_id=f"EVT-TKT-{t_id}",
                        timestamp=ts,
                        cse_id=row.get("cse_id", default_cse_id),
                        source="TICKETING",
                        event_class="incident_case",
                        actor="service-desk",
                        case_id=row.get("case_id"),
                        action=row.get("status", "OPEN"),
                        severity=row.get("severity", "HIGH").upper(),
                        raw_reference=t_id,
                        metadata={
                            "ticket_type": row.get("ticket_type"),
                            "category": row.get("category"),
                        }
                    )
                    canonical_events_to_store.append(c_event)
                    created += 1

                elif source == "AUTH":
                    # event_id,timestamp,cse_id,actor,action,console,network_zone
                    auth_id = row.get("event_id")
                    if not auth_id:
                        errors.append(f"Row {idx}: missing event_id")
                        rejected.append({"row": idx, "data": row, "reason": "Missing event_id"})
                        rej += 1
                        continue

                    ts = cls.parse_timestamp(row.get("timestamp")) or datetime.now(timezone.utc)
                    action = row.get("action", "LOGIN_SUCCESS")
                    c_event = CanonicalEvent(
                        event_id=f"EVT-AUTH-{auth_id}",
                        timestamp=ts,
                        cse_id=row.get("cse_id", default_cse_id),
                        source="AUTH",
                        event_class="authentication",
                        actor=row.get("actor"),
                        case_id=None,
                        action=action,
                        severity="HIGH" if "FAIL" in action else "INFORMATIONAL",
                        raw_reference=auth_id,
                        metadata={
                            "console": row.get("console"),
                            "network_zone": row.get("network_zone"),
                        }
                    )
                    canonical_events_to_store.append(c_event)
                    created += 1

                elif source == "SOC_METRICS":
                    # metric_id,cse_id,period,metric,reported_value,unit,source
                    m_id = row.get("metric_id")
                    if not m_id:
                        errors.append(f"Row {idx}: missing metric_id")
                        rejected.append({"row": idx, "data": row, "reason": "Missing metric_id"})
                        rej += 1
                        continue

                    metric_rec = db.query(ReportedSOCMetric).filter(ReportedSOCMetric.metric_id == m_id).first()
                    val = float(row.get("reported_value", 0.0))
                    if not metric_rec:
                        metric_rec = ReportedSOCMetric(
                            metric_id=m_id,
                            cse_id=row.get("cse_id", default_cse_id),
                            period=row.get("period", "2026-Q3"),
                            metric=row.get("metric", m_id),
                            reported_value=val,
                            unit=row.get("unit", "units"),
                            source=row.get("source", "SOC Report")
                        )
                        db.add(metric_rec)
                        created += 1
                    else:
                        metric_rec.reported_value = val
                        updated += 1

                elif source == "DECLARED_CAPABILITIES":
                    # capability_id,cse_id,control_id,capability,status,source_document
                    cap_id = row.get("capability_id")
                    if not cap_id:
                        errors.append(f"Row {idx}: missing capability_id")
                        rejected.append({"row": idx, "data": row, "reason": "Missing capability_id"})
                        rej += 1
                        continue

                    cap = db.query(DeclaredCapability).filter(DeclaredCapability.capability_id == cap_id).first()
                    if not cap:
                        cap = DeclaredCapability(
                            capability_id=cap_id,
                            cse_id=row.get("cse_id", default_cse_id),
                            control_id=row.get("control_id", "CTRL-07"),
                            capability=row.get("capability", "24x7 Monitoring"),
                            status=row.get("status", "DECLARED"),
                            source_document=row.get("source_document")
                        )
                        db.add(cap)
                        created += 1
                    else:
                        cap.capability = row.get("capability", cap.capability)
                        updated += 1

            except Exception as row_exc:
                errors.append(f"Row {idx} exception: {row_exc}")
                rejected.append({"row": idx, "data": row, "reason": str(row_exc)})
                rej += 1

        db.flush()

        # If we collected canonical events, store in Parquet & Stream to ClickHouse
        if canonical_events_to_store:
            try:
                # 1. Parquet artifact
                artifact_id = f"EV-INGEST-{source}-{uuid.uuid4().hex[:6].upper()}"
                parquet_path, parquet_hash, p_size = EvidenceStorage.store_canonical_events_as_parquet(
                    events=canonical_events_to_store,
                    cse_id=default_cse_id,
                    evidence_id=artifact_id
                )

                # 2. Register Evidence Vault record
                ev_record = Evidence(
                    public_id=artifact_id,
                    cse_id=cse_014.id,
                    control_id=None,
                    category=source,
                    state="PRESENT",
                    validation_status="VALID",
                    sha256=parquet_hash,
                    source_system=source,
                    file_path=parquet_path,
                    file_size=p_size,
                    file_type="PARQUET",
                    received_at=datetime.now(timezone.utc)
                )
                db.add(ev_record)
                db.flush()

                prov = EvidenceProvenance(
                    evidence_id=ev_record.id,
                    collector="INGESTION-PIPELINE-V1",
                    transmission_token=file_hash[:16],
                    received_by="NCIIPC Automated Enclave Gateway",
                    ingested_at=datetime.now(timezone.utc)
                )
                db.add(prov)

                # 3. Stream to ClickHouse (or local buffer)
                clickhouse_adapter.insert_canonical_events(canonical_events_to_store)

            except Exception as p_exc:
                logger.warning(f"Parquet/ClickHouse storage error for {filename}: {p_exc}")

        return created, updated, processed, rej

    # -------------------------------------------------------------------------
    # Batch Ingestion of complete dataset
    # -------------------------------------------------------------------------
    @classmethod
    def ingest_complete_dataset(cls, db: Session, dataset_dir: Optional[str] = None) -> List[IngestionJob]:
        target_dir = dataset_dir or cls.DATASET_DIR
        if not os.path.exists(target_dir):
            raise FileNotFoundError(f"Dataset directory not found: {target_dir}")

        files = sorted(os.listdir(target_dir))
        jobs = []

        logger.info(f"Starting complete dataset ingestion from: {target_dir} ({len(files)} files)")

        for f in files:
            f_path = os.path.join(target_dir, f)
            if not os.path.isfile(f_path) or f.startswith("."):
                continue

            with open(f_path, "rb") as fh:
                content = fh.read()

            job = cls.process_file_content(db=db, filename=f, content_bytes=content)
            jobs.append(job)

        return jobs
