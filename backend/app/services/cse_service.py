from typing import List, Optional, Tuple
from sqlalchemy import or_, desc
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundException, ConflictException
from app.db.models.cse import CSE
from app.db.models.assessment import AssessmentCycle
from app.db.models.control import Control, ControlApplicability
from app.schemas.cse import (
    CSEListItem,
    CSEDetailResponse,
    PaginatedCSEResponse,
    ApplicableControlItem,
    AssessmentCycleResponse,
    CSECreateRequest,
    CSEUpdateRequest,
)


class CSEService:
    @staticmethod
    def _to_list_item(cse: CSE) -> CSEListItem:
        discrepancy = max(0, cse.claimed_capability - cse.observed_capability)
        latest_cycle = cse.assessment_cycles[0] if cse.assessment_cycles else None
        period_str = latest_cycle.period if latest_cycle else "2026-Q3"

        return CSEListItem(
            id=cse.public_id,
            cseId=cse.public_id,
            cseName=cse.name,
            sector=cse.sector,
            organizationType=cse.organization_type,
            location=cse.location,
            tier=cse.tier,
            socType=cse.soc_type,
            period=period_str,
            evidenceReadiness=round(cse.evidence_readiness, 1),
            readinessCategory=cse.readiness_category,
            supervisoryPriority=cse.supervisory_priority,
            status=cse.status,
            claimedCapability=cse.claimed_capability,
            observedCapability=cse.observed_capability,
            capabilityDiscrepancyCount=discrepancy,
            openFindingsCount=discrepancy,  # Derived placeholder correlated to observed discrepancy
            criticalFindingsCount=1 if cse.supervisory_priority == "CRITICAL" else 0,
            executionGapsCount=2 if discrepancy > 0 else 0,
            negativeSpaceCount=1 if discrepancy > 2 else 0,
            processDeviationsCount=1 if discrepancy > 3 else 0,
            remediationCount=1 if discrepancy > 0 else 0,
            primarySignal=cse.primary_signal,
        )

    @classmethod
    def list_cses(
        cls,
        db: Session,
        search: Optional[str] = None,
        sector: Optional[str] = None,
        tier: Optional[str] = None,
        assessment_status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedCSEResponse:
        query = db.query(CSE)

        if search:
            search_clean = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    CSE.name.ilike(search_clean),
                    CSE.public_id.ilike(search_clean),
                    CSE.sector.ilike(search_clean),
                )
            )

        if sector and sector.upper() != "ALL":
            query = query.filter(CSE.sector.ilike(f"%{sector.strip()}%"))

        if tier and tier.upper() != "ALL":
            query = query.filter(CSE.tier == tier.strip())

        if assessment_status and assessment_status.upper() != "ALL":
            query = query.filter(CSE.status == assessment_status.strip())

        total = query.count()
        query = query.order_by(desc(CSE.created_at))
        query = query.offset((page - 1) * page_size).limit(page_size)

        items = [cls._to_list_item(c) for c in query.all()]
        total_pages = max(1, (total + page_size - 1) // page_size)

        return PaginatedCSEResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    @classmethod
    def _find_cse(cls, db: Session, cse_id: str) -> Optional[CSE]:
        import uuid
        query = db.query(CSE)
        try:
            val_uuid = uuid.UUID(str(cse_id))
            return query.filter((CSE.public_id == cse_id) | (CSE.id == val_uuid)).first()
        except (ValueError, AttributeError):
            return query.filter(CSE.public_id == cse_id).first()

    @classmethod
    def get_cse_detail(cls, db: Session, cse_id: str) -> CSEDetailResponse:
        cse = cls._find_cse(db, cse_id)
        if not cse:
            raise NotFoundException("CSE", cse_id)

        base_item = cls._to_list_item(cse)

        # Collect applicable controls
        applicable_controls: List[ApplicableControlItem] = []
        for app in cse.control_applicabilities:
            ctrl = app.control
            if ctrl:
                applicable_controls.append(
                    ApplicableControlItem(
                        control_id=ctrl.public_id,
                        code=ctrl.code,
                        title=ctrl.title,
                        domain=ctrl.domain,
                        severity=ctrl.severity,
                        applicability_status=app.applicability_status,
                        expected_capability=ctrl.expected_capability,
                        expected_evidence=ctrl.expected_evidence,
                    )
                )

        # Collect assessment cycles
        cycles: List[AssessmentCycleResponse] = []
        for cyc in cse.assessment_cycles:
            cycles.append(
                AssessmentCycleResponse(
                    id=cyc.public_id,
                    period=cyc.period,
                    status=cyc.status,
                    evidence_readiness=cyc.evidence_readiness,
                    controls_assessed=cyc.controls_assessed,
                    start_date=cyc.start_date,
                    end_date=cyc.end_date,
                    assigned_examiner=cyc.assigned_examiner.name if cyc.assigned_examiner else None,
                    submitted_at=cyc.submitted_at,
                )
            )

        signals_summary = []
        if cse.primary_signal:
            signals_summary.append(cse.primary_signal)
        if base_item.capabilityDiscrepancyCount > 0:
            signals_summary.append(f"{base_item.capabilityDiscrepancyCount} controls claimed but unobserved in raw operational logs.")

        return CSEDetailResponse(
            **base_item.model_dump(),
            signalsSummary=signals_summary,
            applicableControls=applicable_controls,
            assessmentCycles=cycles,
        )

    @classmethod
    def create_cse(cls, db: Session, data: CSECreateRequest) -> CSEListItem:
        existing = db.query(CSE).filter(CSE.public_id == data.public_id).first()
        if existing:
            raise ConflictException(f"Critical Sector Entity with ID '{data.public_id}' already exists")

        cse = CSE(
            public_id=data.public_id,
            name=data.name,
            sector=data.sector,
            organization_type=data.organization_type,
            location=data.location,
            tier=data.tier,
            soc_type=data.soc_type,
            claimed_capability=data.claimed_capability,
            observed_capability=data.observed_capability,
            supervisory_priority=data.supervisory_priority,
            status=data.status,
            primary_signal=data.primary_signal,
        )
        db.add(cse)
        db.commit()
        db.refresh(cse)
        return cls._to_list_item(cse)

    @classmethod
    def update_cse(cls, db: Session, cse_id: str, data: CSEUpdateRequest) -> CSEListItem:
        cse = cls._find_cse(db, cse_id)
        if not cse:
            raise NotFoundException("CSE", cse_id)

        update_data = data.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(cse, key, val)

        db.commit()
        db.refresh(cse)
        return cls._to_list_item(cse)
