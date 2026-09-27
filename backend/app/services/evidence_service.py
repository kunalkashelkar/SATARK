import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.core.logging import logger
from app.db.models.evidence import Evidence, EvidenceProvenance, EvidenceControlLink
from app.db.models.cse import CSE
from app.db.models.control import Control
from app.schemas.evidence import (
    EvidenceIngestRequest,
    EvidenceResponse,
    EvidenceProvenanceResponse,
    EvidenceControlLinkResponse,
    PaginatedEvidenceResponse,
    EvidenceIntegrityResponse,
    EvidenceValidateRequest,
)
from app.evidence.canonical_model import CanonicalEvent
from app.evidence.normalization import EventNormalizer
from app.evidence.storage import EvidenceStorage
from app.evidence.clickhouse_adapter import clickhouse_adapter


class EvidenceService:
    @staticmethod
    def _find_cse(db: Session, cse_identifier: str) -> Optional[CSE]:
        """Find CSE by public_id (CSE-014) or id UUID."""
        cse = db.query(CSE).filter(CSE.public_id == cse_identifier).first()
        if cse:
            return cse
        try:
            val_uuid = uuid.UUID(cse_identifier)
            return db.query(CSE).filter(CSE.id == val_uuid).first()
        except ValueError:
            return None

    @staticmethod
    def _find_control(db: Session, control_identifier: str) -> Optional[Control]:
        """Find Control by public_id (CTRL-07), code (SOC.MON.07), or id UUID."""
        ctrl = db.query(Control).filter(
            or_(Control.public_id == control_identifier, Control.code == control_identifier)
        ).first()
        if ctrl:
            return ctrl
        try:
            val_uuid = uuid.UUID(control_identifier)
            return db.query(Control).filter(Control.id == val_uuid).first()
        except ValueError:
            return None

    @staticmethod
    def _find_evidence(db: Session, evidence_identifier: str) -> Optional[Evidence]:
        """Find Evidence by public_id (EV-1042) or id UUID."""
        ev = db.query(Evidence).filter(Evidence.public_id == evidence_identifier).first()
        if ev:
            return ev
        try:
            val_uuid = uuid.UUID(evidence_identifier)
            return db.query(Evidence).filter(Evidence.id == val_uuid).first()
        except ValueError:
            return None

    @classmethod
    def _format_evidence_response(cls, ev: Evidence) -> EvidenceResponse:
        cse = ev.cse
        entity_name = f"{cse.public_id} ({cse.name})" if cse else None

        # Parse custody chain from json if string
        prov_resp = None
        if ev.provenance:
            custody = []
            if ev.provenance.custody_chain:
                try:
                    custody = json.loads(ev.provenance.custody_chain)
                except Exception:
                    custody = [s.strip() for s in ev.provenance.custody_chain.split(",") if s.strip()]
            
            prov_resp = EvidenceProvenanceResponse(
                id=str(ev.provenance.id),
                evidence_id=str(ev.public_id),
                collector=ev.provenance.collector,
                transmission_token=ev.provenance.transmission_token,
                source_host=ev.provenance.source_host,
                source_ip=ev.provenance.source_ip,
                signature=ev.provenance.signature,
                custody_chain=custody,
                received_by=ev.provenance.received_by,
                ingested_at=ev.provenance.ingested_at,
                enclave_timestamp=ev.provenance.ingested_at,
                sha256=ev.sha256,
                collector_version="sat-collector-v2.8-fips",
                schema_version="OCSF-1.1.0-SECURITY_FINDING",
            )

        ctrl_links = []
        for cl in ev.control_links:
            ctrl_links.append(
                EvidenceControlLinkResponse(
                    id=str(cl.id),
                    evidence_id=str(ev.public_id),
                    control_id=str(cl.control.public_id if cl.control else cl.control_id),
                    control_code=cl.control.code if cl.control else None,
                    control_title=cl.control.title if cl.control else None,
                    mapping_type=cl.mapping_type,
                    confidence=cl.confidence,
                    notes=cl.notes,
                    created_at=cl.created_at,
                )
            )

        # Build mock or real associated signals and findings for supervisory graph
        associated_signals = []
        if ev.source_system:
            associated_signals.append({
                "signal_id": f"SIG-{ev.public_id}",
                "name": f"{ev.source_system} Ingestion Signal",
                "severity": "HIGH" if ev.category in ("ALERT", "ESCALATION") else "MEDIUM",
                "timestamp": ev.received_at.isoformat() if ev.received_at else None,
            })

        associated_findings = []
        if ev.control:
            associated_findings.append({
                "finding_id": f"FND-{ev.control.public_id.replace('CTRL-', '01')}",
                "control_code": ev.control.code,
                "title": f"Conformance observation for {ev.control.code}",
                "status": "OPEN" if ev.state in ("NOT_SUBMITTED", "ABSENT_CONFIRMED") else "RESOLVED",
            })

        return EvidenceResponse(
            id=str(ev.id),
            evidence_id=ev.public_id,
            public_id=ev.public_id,
            cse_id=ev.cse.public_id if ev.cse else str(ev.cse_id),
            entity=entity_name,
            control_id=str(ev.control.public_id) if ev.control else (str(ev.control_id) if ev.control_id else None),
            control_code=ev.control.code if ev.control else None,
            category=ev.category,
            state=ev.state,
            validation_status=ev.validation_status,
            sha256=ev.sha256,
            hash=ev.sha256,
            source_system=ev.source_system,
            source_event_id=ev.source_event_id,
            file_path=ev.file_path,
            file_size=ev.file_size,
            file_type=ev.file_type,
            received_at=ev.received_at,
            created_at=ev.created_at,
            updated_at=ev.updated_at,
            provenance=prov_resp,
            control_links=ctrl_links,
            associated_signals=associated_signals,
            associated_findings=associated_findings,
        )

    @classmethod
    def ingest_evidence(cls, db: Session, payload: EvidenceIngestRequest) -> EvidenceResponse:
        """Complete ingestion pipeline:
        Parse -> Validate -> Normalize to OCSF -> Generate genuine SHA-256 -> Store Parquet -> Provenance & DB
        Prevents silent replacement of existing evidence.
        """
        cse = cls._find_cse(db, payload.cse_id)
        if not cse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"CSE with identifier '{payload.cse_id}' not found.",
            )

        public_id = payload.evidence_id
        if not public_id:
            public_id = f"EV-{uuid.uuid4().hex[:6].upper()}"

        # Prevent silent replacement: verify evidence doesn't already exist
        existing = db.query(Evidence).filter(Evidence.public_id == public_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Evidence with ID '{public_id}' already exists. Silent replacement is prohibited.",
            )

        # Find target control if specified
        control = None
        ctrl_ident = payload.control_code or payload.control_id
        if ctrl_ident:
            control = cls._find_control(db, ctrl_ident)

        # 1. Parse & Normalize to Canonical OCSF Events
        canonical_events: List[CanonicalEvent] = []
        if payload.events:
            canonical_events = EventNormalizer.normalize_batch(
                records=payload.events,
                source=payload.source_system,
                cse_id=cse.public_id,
            )
        elif payload.raw_payload:
            try:
                raw_json = json.loads(payload.raw_payload)
                if isinstance(raw_json, list):
                    canonical_events = EventNormalizer.normalize_batch(raw_json, payload.source_system, cse.public_id)
                elif isinstance(raw_json, dict):
                    canonical_events = [EventNormalizer.normalize_record(raw_json, payload.source_system, cse.public_id)]
            except Exception:
                # Raw text payload wrapped into synthetic canonical event
                canonical_events = [
                    CanonicalEvent(
                        event_id=f"EVT-{uuid.uuid4().hex[:8]}",
                        timestamp=datetime.now(timezone.utc),
                        cse_id=cse.public_id,
                        source=payload.source_system,
                        event_class="security_finding",
                        raw_reference=payload.source_event_id or f"RAW-{uuid.uuid4().hex[:8]}",
                        metadata={"raw_payload": payload.raw_payload[:1000]},
                    )
                ]
        else:
            # Default empty / attestation record
            canonical_events = [
                CanonicalEvent(
                    event_id=f"EVT-{uuid.uuid4().hex[:8]}",
                    timestamp=datetime.now(timezone.utc),
                    cse_id=cse.public_id,
                    source=payload.source_system,
                    event_class="security_finding",
                    raw_reference=payload.source_event_id or f"EVD-{public_id}",
                    metadata={"category": payload.category, "state": payload.state},
                )
            ]

        # 2. Cryptographic Storage & Genuine SHA-256 Calculation
        file_path, sha256_hash, file_size = EvidenceStorage.store_canonical_events_as_parquet(
            events=canonical_events,
            cse_id=cse.public_id,
            evidence_id=public_id,
        )

        # 3. Stream to ClickHouse analytical telemetry buffer / store
        try:
            clickhouse_adapter.insert_canonical_events(canonical_events)
        except Exception as exc:
            logger.warning(f"Telemetry stream to ClickHouse failed: {exc}")

        # 4. Save Evidence record in PostgreSQL
        evidence = Evidence(
            public_id=public_id,
            cse_id=cse.id,
            control_id=control.id if control else None,
            category=payload.category,
            state=payload.state,
            validation_status="VALID" if payload.state == "PRESENT" else "PENDING_VALIDATION",
            sha256=sha256_hash,
            source_system=payload.source_system,
            source_event_id=payload.source_event_id or (canonical_events[0].raw_reference if canonical_events else None),
            file_path=file_path,
            file_size=file_size,
            file_type="PARQUET",
        )
        db.add(evidence)
        db.flush()

        # 5. Save Provenance
        prov_input = payload.provenance
        custody_json = json.dumps(
            prov_input.custody_chain if prov_input and prov_input.custody_chain else [
                f"{cse.public_id} SOC Telemetry Forwarder",
                "Air-Gap Transmission Broker",
                "NCIIPC Supervisory Ingestion Gateway",
                "Supervisory Enclave Vault"
            ]
        )

        provenance = EvidenceProvenance(
            evidence_id=evidence.id,
            collector=prov_input.collector if prov_input else "COL-02",
            transmission_token=prov_input.transmission_token if prov_input else f"TOK-{uuid.uuid4().hex[:12]}",
            source_host=prov_input.source_host if prov_input else f"soc-gw.{cse.public_id.lower()}.gov",
            source_ip=prov_input.source_ip if prov_input else "10.14.0.12",
            signature=prov_input.signature if prov_input else f"HMAC-SHA256-{sha256_hash[:16]}",
            custody_chain=custody_json,
            received_by=prov_input.received_by if prov_input else "NCIIPC Automated Enclave Gateway",
        )
        db.add(provenance)

        # 6. Save Control Link if control exists
        if control:
            ctrl_link = EvidenceControlLink(
                evidence_id=evidence.id,
                control_id=control.id,
                mapping_type="DIRECT",
                confidence=1.0,
                notes=f"Linked to {control.code} upon canonical ingestion.",
            )
            db.add(ctrl_link)

        db.commit()
        db.refresh(evidence)

        logger.info(f"Successfully ingested evidence '{public_id}' with genuine SHA-256: {sha256_hash}")
        return cls._format_evidence_response(evidence)

    @classmethod
    def get_evidence_by_id(cls, db: Session, evidence_id: str) -> EvidenceResponse:
        evidence = cls._find_evidence(db, evidence_id)
        if not evidence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Evidence with identifier '{evidence_id}' not found.",
            )
        return cls._format_evidence_response(evidence)

    @classmethod
    def list_evidence(
        cls,
        db: Session,
        search: Optional[str] = None,
        evidence_id: Optional[str] = None,
        cse_id: Optional[str] = None,
        control_code: Optional[str] = None,
        validation_status: Optional[str] = None,
        category: Optional[str] = None,
        state: Optional[str] = None,
        submission_window_start: Optional[datetime] = None,
        submission_window_end: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedEvidenceResponse:
        query = db.query(Evidence).join(CSE, Evidence.cse_id == CSE.id)

        if evidence_id:
            query = query.filter(Evidence.public_id.ilike(f"%{evidence_id}%"))

        if cse_id and cse_id.upper() != "ALL":
            cse_match = cls._find_cse(db, cse_id)
            if cse_match:
                query = query.filter(Evidence.cse_id == cse_match.id)
            else:
                query = query.filter(CSE.public_id.ilike(f"%{cse_id}%"))

        if control_code and control_code.upper() != "ALL":
            query = query.outerjoin(Control, Evidence.control_id == Control.id).filter(
                or_(
                    Control.code.ilike(f"%{control_code}%"),
                    Control.public_id.ilike(f"%{control_code}%")
                )
            )

        if validation_status and validation_status.upper() != "ALL":
            query = query.filter(Evidence.validation_status == validation_status.upper())

        if category and category.upper() != "ALL":
            query = query.filter(Evidence.category == category.upper())

        if state and state.upper() != "ALL":
            query = query.filter(Evidence.state == state.upper())

        if submission_window_start:
            query = query.filter(Evidence.received_at >= submission_window_start)
        if submission_window_end:
            query = query.filter(Evidence.received_at <= submission_window_end)

        if search:
            s = f"%{search}%"
            query = query.filter(
                or_(
                    Evidence.public_id.ilike(s),
                    Evidence.source_system.ilike(s),
                    Evidence.source_event_id.ilike(s),
                    Evidence.sha256.ilike(s),
                    CSE.public_id.ilike(s),
                    CSE.name.ilike(s),
                )
            )

        total = query.count()
        pages = max(1, (total + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        records = query.order_by(desc(Evidence.received_at)).offset(offset).limit(page_size).all()

        items = [cls._format_evidence_response(r) for r in records]
        return PaginatedEvidenceResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            pages=pages,
        )

    @classmethod
    def validate_evidence(
        cls,
        db: Session,
        evidence_id: str,
        payload: EvidenceValidateRequest,
    ) -> EvidenceResponse:
        evidence = cls._find_evidence(db, evidence_id)
        if not evidence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Evidence with identifier '{evidence_id}' not found.",
            )

        decision = payload.decision.upper()
        if decision not in ("VALID", "INVALID", "REJECTED"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Validation decision must be one of: VALID, INVALID, REJECTED",
            )

        evidence.validation_status = decision
        if decision == "VALID":
            if evidence.state in ("NOT_SUBMITTED", "UNKNOWN"):
                evidence.state = "PRESENT"
        elif decision in ("INVALID", "REJECTED"):
            # Preserve or flag evidence state
            pass

        db.commit()
        db.refresh(evidence)
        logger.info(f"Evidence '{evidence.public_id}' validation updated to {decision}")
        return cls._format_evidence_response(evidence)

    @classmethod
    def verify_integrity(cls, db: Session, evidence_id: str) -> EvidenceIntegrityResponse:
        """Verify cryptographic integrity of evidence file against stored SHA-256."""
        evidence = cls._find_evidence(db, evidence_id)
        if not evidence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Evidence with identifier '{evidence_id}' not found.",
            )

        file_path = evidence.file_path
        if not file_path or not os.path.exists(file_path):
            return EvidenceIntegrityResponse(
                evidence_id=str(evidence.id),
                public_id=evidence.public_id,
                expected_sha256=evidence.sha256,
                computed_sha256="",
                is_valid=False,
                file_exists=False,
                file_path=file_path,
                file_size=0,
                verification_timestamp=datetime.now(timezone.utc),
                status="FILE_NOT_FOUND",
            )

        computed_hash = EvidenceStorage.compute_sha256(file_path)
        actual_size = os.path.getsize(file_path)
        is_match = (computed_hash.lower() == evidence.sha256.lower())

        status_str = "INTEGRITY_VERIFIED" if is_match else "HASH_MISMATCH_DETECTED"
        if not is_match:
            logger.warning(
                f"INTEGRITY ALERT: SHA-256 mismatch on {evidence.public_id}! "
                f"Expected: {evidence.sha256}, Computed: {computed_hash}"
            )

        return EvidenceIntegrityResponse(
            evidence_id=str(evidence.id),
            public_id=evidence.public_id,
            expected_sha256=evidence.sha256,
            computed_sha256=computed_hash,
            is_valid=is_match,
            file_exists=True,
            file_path=file_path,
            file_size=actual_size,
            verification_timestamp=datetime.now(timezone.utc),
            status=status_str,
        )
