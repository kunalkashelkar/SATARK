from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundException, ConflictException
from app.db.models.control import Control
from app.schemas.control import (
    ControlItemResponse,
    ControlCreateRequest,
    ControlUpdateRequest,
)


class ControlService:
    @staticmethod
    def _to_response(ctrl: Control) -> ControlItemResponse:
        return ControlItemResponse(
            id=ctrl.public_id,
            control_id=ctrl.public_id,
            code=ctrl.code,
            name=ctrl.title,
            title=ctrl.title,
            domain=ctrl.domain,
            severity=ctrl.severity,
            version=ctrl.version,
            status=ctrl.status,
            active=ctrl.active,
            applicability=ctrl.applicability,
            description=ctrl.description,
            expected_capability=ctrl.expected_capability,
            expected_outcomes=ctrl.expected_outcomes or ctrl.expected_capability,
            expected_evidence=ctrl.expected_evidence,
            assessment_criteria=ctrl.assessment_criteria,
            lastUpdated=ctrl.updated_at.strftime("%Y-%m-%d") if ctrl.updated_at else None,
            created_at=ctrl.created_at,
            updated_at=ctrl.updated_at,
        )

    @classmethod
    def list_controls(
        cls,
        db: Session,
        search: Optional[str] = None,
        domain: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        active: Optional[bool] = None,
    ) -> List[ControlItemResponse]:
        query = db.query(Control)

        if search:
            search_clean = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Control.title.ilike(search_clean),
                    Control.code.ilike(search_clean),
                    Control.public_id.ilike(search_clean),
                    Control.domain.ilike(search_clean),
                )
            )

        if domain and domain.upper() != "ALL":
            query = query.filter(Control.domain.ilike(f"%{domain.strip()}%"))

        if severity and severity.upper() != "ALL":
            query = query.filter(Control.severity == severity.strip())

        if status and status.upper() != "ALL":
            query = query.filter(Control.status == status.strip())

        if active is not None:
            query = query.filter(Control.active == active)

        controls = query.order_by(Control.code.asc()).all()
        return [cls._to_response(c) for c in controls]

    @classmethod
    def _find_control(cls, db: Session, control_id: str) -> Optional[Control]:
        import uuid
        query = db.query(Control)
        try:
            val_uuid = uuid.UUID(str(control_id))
            return query.filter(
                or_(Control.public_id == control_id, Control.code == control_id, Control.id == val_uuid)
            ).first()
        except (ValueError, AttributeError):
            return query.filter(
                or_(Control.public_id == control_id, Control.code == control_id)
            ).first()

    @classmethod
    def get_control(cls, db: Session, control_id: str) -> ControlItemResponse:
        ctrl = cls._find_control(db, control_id)
        if not ctrl:
            raise NotFoundException("Control", control_id)

        return cls._to_response(ctrl)

    @classmethod
    def create_control(cls, db: Session, data: ControlCreateRequest) -> ControlItemResponse:
        existing = db.query(Control).filter(
            or_(Control.public_id == data.control_id, Control.code == data.code)
        ).first()
        if existing:
            raise ConflictException(f"Control with ID '{data.control_id}' or Code '{data.code}' already exists")

        ctrl = Control(
            public_id=data.control_id,
            code=data.code,
            title=data.title,
            domain=data.domain,
            severity=data.severity,
            version=data.version,
            status=data.status,
            active=data.active,
            applicability=data.applicability,
            description=data.description,
            expected_capability=data.expected_capability,
            expected_outcomes=data.expected_outcomes,
            expected_evidence=data.expected_evidence,
            assessment_criteria=data.assessment_criteria,
        )
        db.add(ctrl)
        db.commit()
        db.refresh(ctrl)
        return cls._to_response(ctrl)

    @classmethod
    def update_control(cls, db: Session, control_id: str, data: ControlUpdateRequest) -> ControlItemResponse:
        ctrl = cls._find_control(db, control_id)
        if not ctrl:
            raise NotFoundException("Control", control_id)

        update_data = data.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(ctrl, key, val)

        db.commit()
        db.refresh(ctrl)
        return cls._to_response(ctrl)
