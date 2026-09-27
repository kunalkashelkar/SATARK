from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundException, ConflictException
from app.db.models.assessment import AssessmentCycle
from app.db.models.cse import CSE
from app.db.models.user import User
from app.schemas.assessment import (
    AssessmentCycleItem,
    AssessmentCycleCreateRequest,
    AssessmentCycleUpdateRequest,
)


class AssessmentService:
    @staticmethod
    def _to_item(cycle: AssessmentCycle) -> AssessmentCycleItem:
        return AssessmentCycleItem(
            id=cycle.public_id,
            public_id=cycle.public_id,
            cse_id=cycle.cse.public_id if cycle.cse else "",
            cse_name=cycle.cse.name if cycle.cse else "",
            period=cycle.period,
            status=cycle.status,
            evidence_readiness=round(cycle.evidence_readiness, 1),
            controls_assessed=cycle.controls_assessed,
            start_date=cycle.start_date,
            end_date=cycle.end_date,
            assigned_examiner_id=cycle.assigned_examiner.public_id if cycle.assigned_examiner else None,
            assigned_examiner_name=cycle.assigned_examiner.name if cycle.assigned_examiner else None,
            submitted_at=cycle.submitted_at,
            created_at=cycle.created_at,
        )

    @classmethod
    def list_assessments(
        cls,
        db: Session,
        cse_id: Optional[str] = None,
        period: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[AssessmentCycleItem]:
        query = db.query(AssessmentCycle)

        if cse_id:
            query = query.join(CSE).filter(or_(CSE.public_id == cse_id, CSE.id == cse_id))

        if period and period.upper() != "ALL":
            query = query.filter(AssessmentCycle.period == period.strip())

        if status and status.upper() != "ALL":
            query = query.filter(AssessmentCycle.status == status.strip())

        cycles = query.order_by(AssessmentCycle.created_at.desc()).all()
        return [cls._to_item(c) for c in cycles]

    @classmethod
    def _find_assessment(cls, db: Session, assessment_id: str) -> Optional[AssessmentCycle]:
        import uuid
        query = db.query(AssessmentCycle)
        try:
            val_uuid = uuid.UUID(str(assessment_id))
            return query.filter((AssessmentCycle.public_id == assessment_id) | (AssessmentCycle.id == val_uuid)).first()
        except (ValueError, AttributeError):
            return query.filter(AssessmentCycle.public_id == assessment_id).first()

    @classmethod
    def get_assessment(cls, db: Session, assessment_id: str) -> AssessmentCycleItem:
        cycle = cls._find_assessment(db, assessment_id)
        if not cycle:
            raise NotFoundException("AssessmentCycle", assessment_id)

        return cls._to_item(cycle)

    @classmethod
    def create_assessment(
        cls,
        db: Session,
        cse_id: str,
        data: AssessmentCycleCreateRequest
    ) -> AssessmentCycleItem:
        import uuid
        cse_query = db.query(CSE)
        try:
            cse_uuid = uuid.UUID(str(cse_id))
            cse = cse_query.filter((CSE.public_id == cse_id) | (CSE.id == cse_uuid)).first()
        except (ValueError, AttributeError):
            cse = cse_query.filter(CSE.public_id == cse_id).first()

        if not cse:
            raise NotFoundException("CSE", cse_id)

        existing = db.query(AssessmentCycle).filter(
            AssessmentCycle.public_id == data.public_id
        ).first()
        if existing:
            raise ConflictException(f"Assessment cycle '{data.public_id}' already exists")

        examiner = None
        if data.assigned_examiner_username:
            examiner = db.query(User).filter(
                or_(
                    User.username == data.assigned_examiner_username,
                    User.public_id == data.assigned_examiner_username,
                )
            ).first()

        cycle = AssessmentCycle(
            public_id=data.public_id,
            cse_id=cse.id,
            period=data.period,
            status=data.status,
            start_date=data.start_date,
            end_date=data.end_date,
            assigned_examiner_id=examiner.id if examiner else None,
        )
        db.add(cycle)
        db.commit()
        db.refresh(cycle)
        return cls._to_item(cycle)

    @classmethod
    def update_assessment(
        cls,
        db: Session,
        assessment_id: str,
        data: AssessmentCycleUpdateRequest
    ) -> AssessmentCycleItem:
        cycle = cls._find_assessment(db, assessment_id)
        if not cycle:
            raise NotFoundException("AssessmentCycle", assessment_id)

        if data.status:
            cycle.status = data.status
        if data.period:
            cycle.period = data.period
        if data.start_date is not None:
            cycle.start_date = data.start_date
        if data.end_date is not None:
            cycle.end_date = data.end_date
        if data.controls_assessed is not None:
            cycle.controls_assessed = data.controls_assessed
        if data.evidence_readiness is not None:
            cycle.evidence_readiness = data.evidence_readiness

        if data.assigned_examiner_username is not None:
            if data.assigned_examiner_username == "":
                cycle.assigned_examiner_id = None
            else:
                examiner = db.query(User).filter(
                    or_(
                        User.username == data.assigned_examiner_username,
                        User.public_id == data.assigned_examiner_username,
                    )
                ).first()
                if examiner:
                    cycle.assigned_examiner_id = examiner.id

        db.commit()
        db.refresh(cycle)
        return cls._to_item(cycle)
