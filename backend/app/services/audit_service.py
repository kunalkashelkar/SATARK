import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.models.finding import AuditEvent
from app.db.models.user import User
from app.schemas.governance import AuditEventResponse, AuditListResponse

logger = logging.getLogger(__name__)


class AuditService:
    @classmethod
    def log_event(
        cls,
        db: Session,
        action: str,
        actor_id: Optional[str] = "SYSTEM",
        entity_type: str = "SYSTEM",
        entity_id: Optional[str] = None,
        before: Optional[Union[Dict[str, Any], str]] = None,
        after: Optional[Union[Dict[str, Any], str]] = None,
        user_id: Optional[uuid.UUID] = None,
        examiner_badge: Optional[str] = "SYSTEM",
        finding_id: Optional[uuid.UUID] = None,
        remediation_id: Optional[uuid.UUID] = None,
        previous_status: Optional[str] = None,
        new_status: Optional[str] = None,
        reason: Optional[str] = None,
        notes: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> AuditEvent:
        """
        Append-only cryptographic/immutable audit logging.
        Never overwrites or deletes old records.
        """
        # Format before/after JSON strings
        before_str = before if isinstance(before, str) or before is None else json.dumps(before, default=str)
        after_str = after if isinstance(after, str) or after is None else json.dumps(after, default=str)

        # Generate unique event ID
        event_id = f"AUD-{datetime.now(timezone.utc).strftime('%Y')}-{uuid.uuid4().hex[:8].upper()}"

        event = AuditEvent(
            id=uuid.uuid4(),
            event_id=event_id,
            actor_id=actor_id or "SYSTEM",
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            examiner_badge=examiner_badge or "SYSTEM",
            action=action,
            before=before_str,
            after=after_str,
            finding_id=finding_id,
            remediation_id=remediation_id,
            target_type=entity_type,
            target_id=entity_id,
            previous_status=previous_status,
            new_status=new_status,
            reason=reason,
            notes=notes,
            request_id=request_id or f"REQ-{uuid.uuid4().hex[:6].upper()}",
            created_at=datetime.now(timezone.utc),
        )

        db.add(event)
        try:
            db.commit()
            db.refresh(event)
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to commit append-only audit event: {e}")
            raise e

        logger.info(f"AUDIT_LEDGER: [{action}] by {actor_id} on {entity_type}:{entity_id} -> {event_id}")
        return event

    @classmethod
    def list_events(
        cls,
        db: Session,
        action: Optional[str] = None,
        actor_id: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> AuditListResponse:
        """
        Query append-only audit ledger with comprehensive filtering.
        """
        query = db.query(AuditEvent)

        if action:
            query = query.filter(AuditEvent.action == action)
        if actor_id:
            query = query.filter(AuditEvent.actor_id == actor_id)
        if entity_type:
            query = query.filter(AuditEvent.entity_type == entity_type)
        if entity_id:
            query = query.filter((AuditEvent.entity_id == entity_id) | (AuditEvent.target_id == entity_id))

        total = query.count()
        records = query.order_by(desc(AuditEvent.created_at)).offset(offset).limit(limit).all()

        items = [
            AuditEventResponse(
                id=str(r.id),
                event_id=r.event_id,
                actor_id=r.actor_id or r.examiner_badge or "SYSTEM",
                action=r.action,
                entity_type=r.entity_type,
                entity_id=r.entity_id or r.target_id,
                before=r.before,
                after=r.after,
                timestamp=r.created_at,
                request_id=r.request_id,
                examiner_badge=r.examiner_badge,
                target_type=r.target_type,
                target_id=r.target_id,
                previous_status=r.previous_status,
                new_status=r.new_status,
                reason=r.reason,
                notes=r.notes,
                created_at=r.created_at,
            )
            for r in records
        ]

        return AuditListResponse(items=items, total=total)

    @classmethod
    def get_event(cls, db: Session, event_id: str) -> Optional[AuditEventResponse]:
        """
        Retrieve a single immutable audit event by event_id or primary UUID.
        """
        query = db.query(AuditEvent).filter(AuditEvent.event_id == event_id)
        try:
            val_uuid = uuid.UUID(event_id)
            query = db.query(AuditEvent).filter((AuditEvent.event_id == event_id) | (AuditEvent.id == val_uuid))
        except (ValueError, AttributeError):
            pass

        r = query.first()
        if not r:
            return None

        return AuditEventResponse(
            id=str(r.id),
            event_id=r.event_id,
            actor_id=r.actor_id or r.examiner_badge or "SYSTEM",
            action=r.action,
            entity_type=r.entity_type,
            entity_id=r.entity_id or r.target_id,
            before=r.before,
            after=r.after,
            timestamp=r.created_at,
            request_id=r.request_id,
            examiner_badge=r.examiner_badge,
            target_type=r.target_type,
            target_id=r.target_id,
            previous_status=r.previous_status,
            new_status=r.new_status,
            reason=r.reason,
            notes=r.notes,
            created_at=r.created_at,
        )
