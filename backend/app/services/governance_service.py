import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import networkx as nx
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.exceptions import NotFoundException, BadRequestException
from app.core.security import get_password_hash
from app.db.models.user import User
from app.db.models.role import Role, role_permissions
from app.db.models.permission import Permission
from app.db.models.user_cse_access import UserCseAccess
from app.db.models.cse import CSE
from app.db.models.control import Control, ControlApplicability
from app.db.models.evidence import Evidence, EvidenceControlLink
from app.db.models.signal import Signal, SignalEvidenceLink
from app.db.models.finding import Finding, FindingSignalLink, FindingEvidenceLink
from app.db.models.remediation import Remediation, RemediationFinding
from app.db.models.verification import VerificationResult
from app.db.models.governance import SystemVersion, RuleVersion, ModelVersion, PipelineRun

from app.schemas.governance import (
    UserAdminCreate,
    UserAdminUpdate,
    UserAdminResponse,
    RoleResponse,
    AccessRuleResponse,
    SystemVersionResponse,
    RuleVersionResponse,
    ModelVersionResponse,
    PipelineRunResponse,
    GraphNode,
    GraphResponse,
)
from app.services.audit_service import AuditService

logger = logging.getLogger(__name__)


class GovernanceService:
    # ----------------------------------------------------
    # Administration: Users, Roles, Access
    # ----------------------------------------------------
    @classmethod
    def list_users(cls, db: Session) -> List[UserAdminResponse]:
        users = db.query(User).order_by(User.created_at.asc()).all()
        result = []
        for u in users:
            role_name = u.role.name if u.role else "USER"
            perms = [p.code for p in u.role.permissions] if u.role and u.role.permissions else []
            scope_rules = db.query(UserCseAccess).filter(UserCseAccess.user_id == u.id).all()
            cse_scope = [r.cse.public_id for r in scope_rules if r.cse]

            result.append(
                UserAdminResponse(
                    id=str(u.id),
                    public_id=u.public_id,
                    username=u.username,
                    name=u.name,
                    email=u.email,
                    badge=u.badge,
                    role=role_name,
                    organization=u.organization,
                    mfa_type=u.mfa_type,
                    status=u.status,
                    last_activity_at=u.last_activity_at,
                    lastActivity=u.last_activity_at.strftime("%d %b %H:%M") if u.last_activity_at else "Never",
                    permissions=perms,
                    cse_scope=cse_scope,
                    created_at=u.created_at,
                )
            )
        return result

    @classmethod
    def get_user(cls, db: Session, user_id: str) -> UserAdminResponse:
        u = cls._find_user(db, user_id)
        role_name = u.role.name if u.role else "USER"
        perms = [p.code for p in u.role.permissions] if u.role and u.role.permissions else []
        scope_rules = db.query(UserCseAccess).filter(UserCseAccess.user_id == u.id).all()
        cse_scope = [r.cse.public_id for r in scope_rules if r.cse]

        return UserAdminResponse(
            id=str(u.id),
            public_id=u.public_id,
            username=u.username,
            name=u.name,
            email=u.email,
            badge=u.badge,
            role=role_name,
            organization=u.organization,
            mfa_type=u.mfa_type,
            status=u.status,
            last_activity_at=u.last_activity_at,
            lastActivity=u.last_activity_at.strftime("%d %b %H:%M") if u.last_activity_at else "Never",
            permissions=perms,
            cse_scope=cse_scope,
            created_at=u.created_at,
        )

    @classmethod
    def create_user(cls, db: Session, payload: UserAdminCreate, actor_user: Optional[User] = None) -> UserAdminResponse:
        # Check uniqueness
        if db.query(User).filter(User.username == payload.username).first():
            raise BadRequestException(f"Username '{payload.username}' is already registered.")
        if db.query(User).filter(User.email == payload.email).first():
            raise BadRequestException(f"Email '{payload.email}' is already registered.")

        # Find role
        role = db.query(Role).filter(Role.name == payload.role).first()
        if not role:
            # Default to EXAMINER if not found
            role = db.query(Role).filter(Role.name == "EXAMINER").first()
            if not role:
                raise NotFoundException("Role", payload.role)

        # Generate public_id
        count = db.query(User).count() + 1
        public_id = f"USR-{count:03d}"

        user = User(
            id=uuid.uuid4(),
            public_id=public_id,
            username=payload.username,
            name=payload.name,
            email=payload.email,
            badge=payload.badge or f"NC-{uuid.uuid4().hex[:4].upper()}",
            organization=payload.organization,
            role_id=role.id,
            status="ACTIVE",
            mfa_type=payload.mfa_type,
            hashed_password=get_password_hash(payload.password or "EnclaveDefault#2026"),
            created_at=datetime.now(timezone.utc),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Scope assignment
        if payload.cse_scope:
            for cse_pub_id in payload.cse_scope:
                cse = db.query(CSE).filter(CSE.public_id == cse_pub_id).first()
                if cse:
                    access = UserCseAccess(
                        id=uuid.uuid4(),
                        user_id=user.id,
                        cse_id=cse.id,
                        access_type="Full Supervisory" if role.name in ["SUPERVISOR", "LEAD_EXAMINER"] else "Read + Review",
                        granted_by=actor_user.username if actor_user else "SYSTEM",
                        created_at=datetime.now(timezone.utc),
                    )
                    db.add(access)
            db.commit()

        # Audit event: USER_CREATED
        AuditService.log_event(
            db=db,
            action="USER_CREATED",
            actor_id=actor_user.public_id if actor_user else "ADMIN",
            entity_type="USER",
            entity_id=user.public_id,
            before=None,
            after={
                "public_id": user.public_id,
                "username": user.username,
                "role": role.name,
                "organization": user.organization,
            },
            examiner_badge=actor_user.badge if actor_user else "ADMIN",
            reason=f"Administrator provisioned user account {user.public_id}",
        )

        return cls.get_user(db, user.public_id)

    @classmethod
    def update_user(cls, db: Session, user_id: str, payload: UserAdminUpdate, actor_user: Optional[User] = None) -> UserAdminResponse:
        user = cls._find_user(db, user_id)
        before_state = {
            "name": user.name,
            "email": user.email,
            "role": user.role.name if user.role else "USER",
            "status": user.status,
            "badge": user.badge,
        }

        if payload.name is not None:
            user.name = payload.name
        if payload.email is not None:
            user.email = payload.email
        if payload.badge is not None:
            user.badge = payload.badge
        if payload.organization is not None:
            user.organization = payload.organization
        if payload.status is not None:
            user.status = payload.status
        if payload.mfa_type is not None:
            user.mfa_type = payload.mfa_type
        if payload.password:
            user.hashed_password = get_password_hash(payload.password)

        role_changed = False
        if payload.role:
            target_role = db.query(Role).filter(Role.name == payload.role).first()
            if target_role and target_role.id != user.role_id:
                user.role_id = target_role.id
                role_changed = True

        db.commit()
        db.refresh(user)

        # Update CSE scope if provided
        access_changed = False
        if payload.cse_scope is not None:
            db.query(UserCseAccess).filter(UserCseAccess.user_id == user.id).delete()
            for cse_pub_id in payload.cse_scope:
                cse = db.query(CSE).filter(CSE.public_id == cse_pub_id).first()
                if cse:
                    access = UserCseAccess(
                        id=uuid.uuid4(),
                        user_id=user.id,
                        cse_id=cse.id,
                        access_type="Full Supervisory" if user.role and user.role.name in ["SUPERVISOR", "LEAD_EXAMINER"] else "Read + Review",
                        granted_by=actor_user.username if actor_user else "SYSTEM",
                        created_at=datetime.now(timezone.utc),
                    )
                    db.add(access)
            db.commit()
            access_changed = True

        after_state = {
            "name": user.name,
            "email": user.email,
            "role": user.role.name if user.role else "USER",
            "status": user.status,
            "badge": user.badge,
        }

        # Audit event: USER_UPDATED
        AuditService.log_event(
            db=db,
            action="USER_UPDATED",
            actor_id=actor_user.public_id if actor_user else "ADMIN",
            entity_type="USER",
            entity_id=user.public_id,
            before=before_state,
            after=after_state,
            examiner_badge=actor_user.badge if actor_user else "ADMIN",
            reason=f"Administrator updated profile for {user.public_id}",
        )

        if access_changed or role_changed:
            AuditService.log_event(
                db=db,
                action="ACCESS_CHANGED",
                actor_id=actor_user.public_id if actor_user else "ADMIN",
                entity_type="USER_ACCESS",
                entity_id=user.public_id,
                before={"role": before_state["role"]},
                after={"role": after_state["role"], "cse_scope": payload.cse_scope},
                examiner_badge=actor_user.badge if actor_user else "ADMIN",
                reason=f"Supervisory access policy modified for {user.public_id}",
            )

        return cls.get_user(db, user.public_id)

    @classmethod
    def list_roles(cls, db: Session) -> List[RoleResponse]:
        roles = db.query(Role).all()
        result = []
        for r in roles:
            user_count = db.query(User).filter(User.role_id == r.id).count()
            perms = [p.code for p in r.permissions] if r.permissions else []
            result.append(
                RoleResponse(
                    id=str(r.id),
                    name=r.name,
                    roleName=r.name,
                    description=r.description or f"Standard {r.name} role",
                    status=r.status,
                    user_count=user_count,
                    permissions=perms,
                )
            )
        return result

    @classmethod
    def list_access(cls, db: Session) -> List[AccessRuleResponse]:
        access_records = db.query(UserCseAccess).all()
        result = []
        for rec in access_records:
            u = rec.user
            c = rec.cse
            if not u or not c:
                continue
            result.append(
                AccessRuleResponse(
                    id=str(rec.id),
                    user_id=str(u.id),
                    username=u.username,
                    userOrRole=f"{u.name} ({u.role.name if u.role else 'USER'})",
                    cse_id=str(c.id),
                    cse_public_id=c.public_id,
                    cse_name=c.name,
                    access_type=rec.access_type,
                    scope=f"{c.sector} • {c.tier}",
                    status="Active" if u.status == "ACTIVE" else "Revoked",
                    granted_by=rec.granted_by or "SUPERVISOR",
                    grantedDate=rec.created_at.strftime("%d %b %Y"),
                    created_at=rec.created_at,
                )
            )
        return result

    # ----------------------------------------------------
    # Version Management
    # ----------------------------------------------------
    @classmethod
    def list_system_versions(cls, db: Session) -> List[SystemVersionResponse]:
        versions = db.query(SystemVersion).order_by(desc(SystemVersion.deployed_at)).all()
        return [
            SystemVersionResponse(
                id=str(v.id),
                version=v.version,
                release_name=v.release_name,
                component=v.component,
                status=v.status,
                changelog=v.changelog,
                git_commit=v.git_commit,
                deployed_at=v.deployed_at,
                created_at=v.created_at,
            )
            for v in versions
        ]

    @classmethod
    def list_rule_versions(cls, db: Session) -> List[RuleVersionResponse]:
        rules = db.query(RuleVersion).order_by(desc(RuleVersion.effective_from)).all()
        result = []
        for r in rules:
            params = {}
            if r.parameters:
                try:
                    params = json.loads(r.parameters)
                except Exception:
                    pass
            result.append(
                RuleVersionResponse(
                    id=str(r.id),
                    rule_id=r.rule_id,
                    engine_slug=r.engine_slug,
                    version=r.version,
                    name=r.name,
                    description=r.description,
                    logic_hash=r.logic_hash,
                    parameters=params,
                    status=r.status,
                    effective_from=r.effective_from,
                    created_at=r.created_at,
                )
            )
        return result

    @classmethod
    def list_model_versions(cls, db: Session) -> List[ModelVersionResponse]:
        models = db.query(ModelVersion).order_by(desc(ModelVersion.trained_at)).all()
        result = []
        for m in models:
            hyper = {}
            if m.hyperparameters:
                try:
                    hyper = json.loads(m.hyperparameters)
                except Exception:
                    pass
            result.append(
                ModelVersionResponse(
                    id=str(m.id),
                    model_id=m.model_id,
                    name=m.name,
                    version=m.version,
                    framework=m.framework,
                    weights_hash=m.weights_hash,
                    hyperparameters=hyper,
                    status=m.status,
                    trained_at=m.trained_at,
                    created_at=m.created_at,
                )
            )
        return result

    @classmethod
    def list_pipeline_runs(cls, db: Session) -> List[PipelineRunResponse]:
        runs = db.query(PipelineRun).order_by(desc(PipelineRun.started_at)).all()
        return [
            PipelineRunResponse(
                id=str(pr.id),
                run_id=pr.run_id,
                pipeline_name=pr.pipeline_name,
                pipeline_version=pr.pipeline_version,
                trigger=pr.trigger,
                status=pr.status,
                cse_count=pr.cse_count,
                signals_generated=pr.signals_generated,
                execution_time_ms=pr.execution_time_ms,
                started_at=pr.started_at,
                completed_at=pr.completed_at,
                created_at=pr.created_at,
            )
            for pr in runs
        ]

    # ----------------------------------------------------
    # Supervisory Graph (NetworkX construction & filtering)
    # ----------------------------------------------------
    @classmethod
    def build_supervisory_graph(
        cls,
        db: Session,
        cse_id: Optional[str] = None,
        control_id: Optional[str] = None,
        evidence_id: Optional[str] = None,
        signal_id: Optional[str] = None,
        finding_id: Optional[str] = None,
    ) -> GraphResponse:
        """
        Builds directed multi-layer topological graph:
        CSE -> CONTROL -> EVIDENCE -> SIGNAL -> FINDING -> REMEDIATION -> VERIFICATION
        Constructed and queried via NetworkX.
        PostgreSQL/SQLite remains the relational source of truth.
        """
        G = nx.DiGraph()

        # 1. Fetch Relational Data
        cses = db.query(CSE).all()
        controls = db.query(Control).all()
        evidence_items = db.query(Evidence).all()
        signals = db.query(Signal).all()
        findings = db.query(Finding).all()
        remediations = db.query(Remediation).all()
        verifications = db.query(VerificationResult).all()

        # Maps for quick UUID -> public_id resolution
        cse_map = {c.id: c.public_id for c in cses}
        ctrl_map = {c.id: c.public_id for c in controls}
        ev_map = {e.id: e.public_id for e in evidence_items}
        sig_map = {s.id: s.signal_id for s in signals}
        fnd_map = {f.id: f.public_id for f in findings}
        rem_map = {r.id: r.remediation_id for r in remediations}

        # Also reverse maps (public_id -> id)
        cse_rev = {c.public_id: c.id for c in cses}
        ctrl_rev = {c.public_id: c.id for c in controls}

        # 2. Add Nodes to NetworkX Graph
        for c in cses:
            node_id = c.public_id
            status = "CRITICAL" if c.tier == "Tier-1" else "VERIFIED"
            G.add_node(
                node_id,
                id=node_id,
                type="CSE",
                label=f"{c.public_id}: {c.name}",
                sublabel=f"{c.sector} Sector • {c.tier} Priority",
                status=status,
                detail_url=f"/api/v1/cses/{c.public_id}",
                data={
                    "entity": c.name,
                    "details": f"Critical infrastructure sector: {c.sector}. Mandated under statutory surveillance.",
                    "source": "Entity Regulatory Profile",
                    "timestamp": "Q3 2026 Active Cycle",
                },
                layer=0,
            )

        for ctrl in controls:
            node_id = ctrl.public_id
            status = "CRITICAL" if ctrl.status in ["ACTIVE", "CRITICAL"] else "VERIFIED"
            G.add_node(
                node_id,
                id=node_id,
                type="CONTROL",
                label=f"{ctrl.public_id}: {ctrl.title}",
                sublabel=f"Domain: {ctrl.domain or 'Supervisory'}",
                status=status,
                detail_url=f"/api/v1/controls/{ctrl.public_id}",
                data={
                    "entity": ctrl.title,
                    "details": ctrl.description or "Mandatory supervisory control baseline.",
                    "source": "NCIIPC-CSF v3.2",
                },
                layer=1,
            )

        for ev in evidence_items:
            node_id = ev.public_id
            status = "VERIFIED" if ev.validation_status == "VALID" else ("CRITICAL" if ev.state == "NOT_SUBMITTED" else "WARNING")
            G.add_node(
                node_id,
                id=node_id,
                type="EVIDENCE",
                label=f"{ev.public_id}: {ev.category}",
                sublabel=f"State: {ev.state} • Valid: {ev.validation_status}",
                status=status,
                detail_url=f"/api/v1/evidence/{ev.public_id}",
                data={
                    "entity": ev.category,
                    "evidenceId": ev.public_id,
                    "details": f"Source: {ev.source_system}. SHA-256 attested digest.",
                    "sha256": ev.sha256,
                    "source": ev.source_system,
                    "timestamp": ev.received_at.strftime("%d %b %Y %H:%M") if ev.received_at else "",
                },
                layer=2,
            )

        for sig in signals:
            node_id = sig.signal_id
            status = "CRITICAL" if sig.priority in ["CRITICAL", "HIGH"] else "WARNING"
            G.add_node(
                node_id,
                id=node_id,
                type="SIGNAL",
                label=f"{sig.signal_id}: {sig.title}",
                sublabel=f"Engine: {sig.engine} • Score: {sig.score:.2f}",
                status=status,
                detail_url=f"/api/v1/signals/{sig.signal_id}",
                data={
                    "entity": sig.title,
                    "details": sig.summary,
                    "source": f"{sig.engine} (Eng: {sig.engine_version}, Rule: {sig.rule_version})",
                    "timestamp": sig.created_at.strftime("%d %b %Y %H:%M") if sig.created_at else "",
                },
                layer=3,
            )

        for fnd in findings:
            node_id = fnd.public_id
            status = "CRITICAL" if fnd.priority in ["CRITICAL", "HIGH"] else "WARNING"
            G.add_node(
                node_id,
                id=node_id,
                type="FINDING",
                label=f"{fnd.public_id}: {fnd.title}",
                sublabel=f"Status: {fnd.status} • Priority: {fnd.priority}",
                status=status,
                detail_url=f"/api/v1/findings/{fnd.public_id}",
                data={
                    "entity": fnd.title,
                    "findingId": fnd.public_id,
                    "details": getattr(fnd, "gap_summary", None) or getattr(fnd, "why_flagged", "") or fnd.title,
                    "source": "Examiner Adjudication Dossier",
                    "timestamp": fnd.created_at.strftime("%d %b %Y %H:%M") if fnd.created_at else "",
                },
                layer=4,
            )

        for rem in remediations:
            node_id = rem.remediation_id
            status = "CRITICAL" if rem.status in ["OPEN", "REOPENED"] else ("WARNING" if rem.status == "UNDER_REVIEW" else "VERIFIED")
            title_text = getattr(rem, "mandate_title", None) or getattr(rem, "remediation_id", "Remediation")
            summary_text = getattr(rem, "action_summary", None) or title_text
            G.add_node(
                node_id,
                id=node_id,
                type="REMEDIATION",
                label=f"{rem.remediation_id}: {title_text}",
                sublabel=f"Status: {rem.status} • SLA: {rem.days_remaining}d remaining",
                status=status,
                detail_url=f"/api/v1/remediation/{rem.remediation_id}",
                data={
                    "entity": title_text,
                    "remediationId": rem.remediation_id,
                    "details": summary_text,
                    "source": "Remediation Lifecycle Engine",
                    "timestamp": rem.created_at.strftime("%d %b %Y %H:%M") if rem.created_at else "",
                },
                layer=5,
            )

        for ver in verifications:
            node_id = ver.verification_id
            status = "VERIFIED" if ver.pass_fail == "PASS" else "CRITICAL"
            G.add_node(
                node_id,
                id=node_id,
                type="VERIFICATION",
                label=f"{ver.verification_id}: Verification Gate",
                sublabel=f"Verdict: {ver.verification_verdict} • Confidence: {ver.confidence_score}%",
                status=status,
                detail_url=f"/api/v1/verification/{ver.verification_id}",
                data={
                    "entity": ver.statutory_standard,
                    "verificationId": ver.verification_id,
                    "details": ver.supervisory_rationale or "Cryptographic gate attestation.",
                    "sha256": ver.merkle_root_hash,
                    "source": "Statutory Gate Authority",
                    "timestamp": ver.submitted_at or (ver.created_at.strftime("%d %b %Y %H:%M") if ver.created_at else ""),
                },
                layer=6,
            )

        # 3. Add Edges according to Relational Links
        # CSE -> CONTROL (ControlApplicability)
        applicabilities = db.query(ControlApplicability).all()
        for app in applicabilities:
            c_pub = cse_map.get(app.cse_id)
            ctrl_pub = ctrl_map.get(app.control_id)
            if c_pub and ctrl_pub and G.has_node(c_pub) and G.has_node(ctrl_pub):
                G.add_edge(c_pub, ctrl_pub, label="MANDATES", type="normal")

        # CONTROL -> EVIDENCE (EvidenceControlLink)
        ev_ctrl_links = db.query(EvidenceControlLink).all()
        for ec in ev_ctrl_links:
            ctrl_pub = ctrl_map.get(ec.control_id)
            ev_pub = ev_map.get(ec.evidence_id)
            if ctrl_pub and ev_pub and G.has_node(ctrl_pub) and G.has_node(ev_pub):
                G.add_edge(ctrl_pub, ev_pub, label="EVALUATES", type="normal")

        # EVIDENCE -> SIGNAL (SignalEvidenceLink)
        sig_ev_links = db.query(SignalEvidenceLink).all()
        for se in sig_ev_links:
            sig_pub = sig_map.get(se.signal_id)
            ev_pub = ev_map.get(se.evidence_id)
            if ev_pub and sig_pub and G.has_node(ev_pub) and G.has_node(sig_pub):
                G.add_edge(ev_pub, sig_pub, label="TRIGGERS", type="gap" if se.link_type == "PRIMARY" else "normal")

        # SIGNAL -> FINDING (FindingSignalLink)
        fnd_sig_links = db.query(FindingSignalLink).all()
        for fs in fnd_sig_links:
            fnd_pub = fnd_map.get(fs.finding_id)
            sig_pub = sig_map.get(fs.signal_id)
            if sig_pub and fnd_pub and G.has_node(sig_pub) and G.has_node(fnd_pub):
                G.add_edge(sig_pub, fnd_pub, label="CORROBORATES", type="gap")

        # FINDING -> REMEDIATION (Remediation.finding_id or RemediationFinding)
        for rem in remediations:
            r_pub = rem.remediation_id
            if rem.finding_id and rem.finding_id in fnd_map:
                f_pub = fnd_map[rem.finding_id]
                if G.has_node(f_pub) and G.has_node(r_pub):
                    G.add_edge(f_pub, r_pub, label="DEMANDS", type="normal")

        rem_fnds = db.query(RemediationFinding).all()
        for rf in rem_fnds:
            r_pub = rem_map.get(rf.remediation_id)
            f_pub = fnd_map.get(rf.finding_id)
            if f_pub and r_pub and G.has_node(f_pub) and G.has_node(r_pub):
                G.add_edge(f_pub, r_pub, label="DEMANDS", type="normal")

        # REMEDIATION -> VERIFICATION (VerificationResult.remediation_id)
        for ver in verifications:
            v_pub = ver.verification_id
            r_pub = rem_map.get(ver.remediation_id)
            if r_pub and v_pub and G.has_node(r_pub) and G.has_node(v_pub):
                G.add_edge(r_pub, v_pub, label="VALIDATES", type="verified")

        # Fallback relational linkages to guarantee connected paths
        for ev in evidence_items:
            ev_pub = ev.public_id
            c_pub = cse_map.get(ev.cse_id)
            if c_pub and ev_pub and G.has_node(c_pub) and G.has_node(ev_pub):
                if not G.has_edge(c_pub, ev_pub) and G.in_degree(ev_pub) == 0:
                    G.add_edge(c_pub, ev_pub, label="SUBMITS", type="normal")

        for sig in signals:
            sig_pub = sig.signal_id
            c_pub = cse_map.get(sig.cse_id)
            ctrl_pub = ctrl_map.get(sig.control_id) if sig.control_id else None
            if ctrl_pub and sig_pub and G.has_node(ctrl_pub) and G.has_node(sig_pub) and G.in_degree(sig_pub) == 0:
                G.add_edge(ctrl_pub, sig_pub, label="ANALYZES", type="gap")
            elif c_pub and sig_pub and G.has_node(c_pub) and G.has_node(sig_pub) and G.in_degree(sig_pub) == 0:
                G.add_edge(c_pub, sig_pub, label="FLAGS", type="gap")

        for fnd in findings:
            f_pub = fnd.public_id
            c_pub = cse_map.get(fnd.cse_id)
            ctrl_pub = ctrl_map.get(fnd.control_id) if fnd.control_id else None
            if ctrl_pub and f_pub and G.has_node(ctrl_pub) and G.has_node(f_pub) and G.in_degree(f_pub) == 0:
                G.add_edge(ctrl_pub, f_pub, label="VIOLATES", type="gap")
            elif c_pub and f_pub and G.has_node(c_pub) and G.has_node(f_pub) and G.in_degree(f_pub) == 0:
                G.add_edge(c_pub, f_pub, label="INCIDENT", type="gap")

        # 4. Subgraph Filtering with NetworkX
        target_nodes = set()
        filter_applied = {}

        if cse_id:
            filter_applied["cse_id"] = cse_id
            for n, d in G.nodes(data=True):
                if d.get("type") == "CSE" and (n == cse_id or cse_id.lower() in n.lower() or cse_id in str(d.get("label", ""))):
                    target_nodes.add(n)

        if control_id:
            filter_applied["control_id"] = control_id
            for n, d in G.nodes(data=True):
                if d.get("type") == "CONTROL" and (n == control_id or control_id.lower() in n.lower()):
                    target_nodes.add(n)

        if evidence_id:
            filter_applied["evidence_id"] = evidence_id
            for n, d in G.nodes(data=True):
                if d.get("type") == "EVIDENCE" and (n == evidence_id or evidence_id.lower() in n.lower()):
                    target_nodes.add(n)

        if signal_id:
            filter_applied["signal_id"] = signal_id
            for n, d in G.nodes(data=True):
                if d.get("type") == "SIGNAL" and (n == signal_id or signal_id.lower() in n.lower()):
                    target_nodes.add(n)

        if finding_id:
            filter_applied["finding_id"] = finding_id
            for n, d in G.nodes(data=True):
                if d.get("type") == "FINDING" and (n == finding_id or finding_id.lower() in n.lower()):
                    target_nodes.add(n)

        # If filters were applied, retain the connected components of matching nodes
        if filter_applied and target_nodes:
            undirected_G = G.to_undirected()
            connected_nodes = set()
            for t_node in target_nodes:
                if t_node in undirected_G:
                    # Collect component nodes
                    comp = nx.node_connected_component(undirected_G, t_node)
                    connected_nodes.update(comp)
            if connected_nodes:
                G = G.subgraph(connected_nodes).copy()
        elif filter_applied and not target_nodes:
            # Filter matched nothing
            G = nx.DiGraph()

        # 5. Compute Visual Layout Coordinates (Topological Layer Staggering)
        layer_x_coords = {
            0: 80,    # CSE
            1: 280,   # CONTROL
            2: 480,   # EVIDENCE
            3: 680,   # SIGNAL
            4: 880,   # FINDING
            5: 1080,  # REMEDIATION
            6: 1280,  # VERIFICATION
        }

        # Group nodes by layer
        layer_buckets: Dict[int, List[str]] = {i: [] for i in range(7)}
        for n, data in G.nodes(data=True):
            layer_idx = data.get("layer", 0)
            layer_buckets.setdefault(layer_idx, []).append(n)

        nodes_output: List[GraphNode] = []
        for layer_idx, node_ids in layer_buckets.items():
            count = len(node_ids)
            x = layer_x_coords.get(layer_idx, 80 + layer_idx * 200)
            for idx, n in enumerate(node_ids):
                # Distribute Y across 80..520
                if count <= 1:
                    y = 260.0
                else:
                    y = 80.0 + (idx * (440.0 / (count - 1)))

                d = G.nodes[n]
                nodes_output.append(
                    GraphNode(
                        id=d.get("id", n),
                        type=d.get("type", "NODE"),
                        label=d.get("label", n),
                        sublabel=d.get("sublabel", ""),
                        status=d.get("status", "NEUTRAL"),
                        x=round(x, 1),
                        y=round(y, 1),
                        detail_url=d.get("detail_url", f"/api/v1/overview"),
                        data=d.get("data", {}),
                    )
                )

        links_output: List[Dict[str, Any]] = []
        for u, v, data in G.edges(data=True):
            links_output.append({
                "from": u,
                "to": v,
                "label": data.get("label", "RELATION"),
                "type": data.get("type", "normal"),
            })

        return GraphResponse(
            nodes=nodes_output,
            links=links_output,
            summary={
                "total_nodes": len(nodes_output),
                "total_edges": len(links_output),
                "filters_applied": filter_applied,
            },
        )

    # ----------------------------------------------------
    # Private Helper
    # ----------------------------------------------------
    @classmethod
    def _find_user(cls, db: Session, user_id: str) -> User:
        query = db.query(User).filter(User.public_id == user_id)
        try:
            val_uuid = uuid.UUID(user_id)
            query = db.query(User).filter((User.public_id == user_id) | (User.id == val_uuid))
        except (ValueError, AttributeError):
            pass

        user = query.first()
        if not user:
            raise NotFoundException("User", user_id)
        return user
