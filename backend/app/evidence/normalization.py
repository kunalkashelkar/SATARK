import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.evidence.canonical_model import CanonicalEvent


class BaseEventParser:
    source_name: str = "GENERIC"

    @classmethod
    def parse_record(cls, raw: Dict[str, Any], cse_id: str) -> CanonicalEvent:
        raise NotImplementedError


class SIEMParser(BaseEventParser):
    source_name: str = "SIEM"

    @classmethod
    def parse_record(cls, raw: Dict[str, Any], cse_id: str) -> CanonicalEvent:
        raw_ref = str(raw.get("alert_id") or raw.get("id") or raw.get("event_id") or f"SIEM-{uuid.uuid4().hex[:8]}")
        ts = raw.get("timestamp") or raw.get("time") or datetime.now(timezone.utc)
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.now(timezone.utc)

        return CanonicalEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:12]}",
            timestamp=ts,
            cse_id=cse_id,
            source="SIEM",
            event_class="security_finding",
            actor=raw.get("analyst") or raw.get("user") or raw.get("assigned_to"),
            case_id=raw.get("case_id") or raw.get("incident_id"),
            action=raw.get("action") or raw.get("disposition") or "ALERT_TRIGGERED",
            severity=str(raw.get("severity", "HIGH")).upper(),
            raw_reference=raw_ref,
            metadata={
                "rule_name": raw.get("rule_name") or raw.get("title"),
                "src_ip": raw.get("src_ip"),
                "dest_ip": raw.get("dest_ip"),
                "category": raw.get("category", "Threat Detection"),
            },
        )


class TicketingParser(BaseEventParser):
    source_name: str = "TICKETING"

    @classmethod
    def parse_record(cls, raw: Dict[str, Any], cse_id: str) -> CanonicalEvent:
        raw_ref = str(raw.get("ticket_id") or raw.get("id") or f"TICK-{uuid.uuid4().hex[:8]}")
        ts = raw.get("created_at") or raw.get("timestamp") or datetime.now(timezone.utc)
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.now(timezone.utc)

        return CanonicalEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:12]}",
            timestamp=ts,
            cse_id=cse_id,
            source="TICKETING",
            event_class="incident_case",
            actor=raw.get("assignee") or raw.get("owner"),
            case_id=raw.get("case_id") or raw_ref,
            action=raw.get("status") or "TICKET_OPENED",
            severity=str(raw.get("priority", "MEDIUM")).upper(),
            raw_reference=raw_ref,
            metadata={
                "sla_minutes": raw.get("sla_minutes", 15),
                "triage_time_minutes": raw.get("triage_time_minutes"),
                "resolution": raw.get("resolution"),
            },
        )


class EDRParser(BaseEventParser):
    source_name: str = "EDR"

    @classmethod
    def parse_record(cls, raw: Dict[str, Any], cse_id: str) -> CanonicalEvent:
        raw_ref = str(raw.get("detection_id") or raw.get("id") or f"EDR-{uuid.uuid4().hex[:8]}")
        ts = raw.get("timestamp") or datetime.now(timezone.utc)
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.now(timezone.utc)

        return CanonicalEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:12]}",
            timestamp=ts,
            cse_id=cse_id,
            source="EDR",
            event_class="endpoint_detection",
            actor=raw.get("process_owner") or raw.get("user"),
            case_id=raw.get("case_id"),
            action=raw.get("action") or raw.get("mitigation") or "PROCESS_BLOCKED",
            severity=str(raw.get("severity", "HIGH")).upper(),
            raw_reference=raw_ref,
            metadata={
                "hostname": raw.get("hostname"),
                "process_name": raw.get("process_name"),
                "sha256": raw.get("sha256"),
            },
        )


class NetworkGatewayParser(BaseEventParser):
    source_name: str = "GATEWAY"

    @classmethod
    def parse_record(cls, raw: Dict[str, Any], cse_id: str) -> CanonicalEvent:
        raw_ref = str(raw.get("log_id") or raw.get("id") or f"GW-{uuid.uuid4().hex[:8]}")
        ts = raw.get("timestamp") or datetime.now(timezone.utc)
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.now(timezone.utc)

        return CanonicalEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:12]}",
            timestamp=ts,
            cse_id=cse_id,
            source="GATEWAY",
            event_class="network_activity",
            actor=raw.get("user") or raw.get("src_zone"),
            case_id=raw.get("case_id"),
            action=str(raw.get("action", "ALLOW")).upper(),
            severity=str(raw.get("severity", "LOW")).upper(),
            raw_reference=raw_ref,
            metadata={
                "bytes_transferred": raw.get("bytes", 0),
                "dest_port": raw.get("dest_port"),
                "protocol": raw.get("protocol", "TCP"),
            },
        )


class AuthenticationParser(BaseEventParser):
    source_name: str = "AUTH"

    @classmethod
    def parse_record(cls, raw: Dict[str, Any], cse_id: str) -> CanonicalEvent:
        raw_ref = str(raw.get("auth_id") or raw.get("id") or f"AUTH-{uuid.uuid4().hex[:8]}")
        ts = raw.get("timestamp") or datetime.now(timezone.utc)
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.now(timezone.utc)

        status_action = "LOGIN_SUCCESS" if raw.get("success", True) else "LOGIN_FAILED"

        return CanonicalEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:12]}",
            timestamp=ts,
            cse_id=cse_id,
            source="AUTH",
            event_class="authentication",
            actor=raw.get("username") or raw.get("account"),
            case_id=None,
            action=raw.get("action") or status_action,
            severity="HIGH" if not raw.get("success", True) else "INFORMATIONAL",
            raw_reference=raw_ref,
            metadata={
                "mfa_method": raw.get("mfa_method", "Smartcard"),
                "client_ip": raw.get("client_ip"),
            },
        )


class CaseManagementParser(BaseEventParser):
    source_name: str = "CASE_MGMT"

    @classmethod
    def parse_record(cls, raw: Dict[str, Any], cse_id: str) -> CanonicalEvent:
        raw_ref = str(raw.get("case_ref") or raw.get("id") or f"CASE-{uuid.uuid4().hex[:8]}")
        ts = raw.get("timestamp") or datetime.now(timezone.utc)
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.now(timezone.utc)

        return CanonicalEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:12]}",
            timestamp=ts,
            cse_id=cse_id,
            source="CASE_MGMT",
            event_class="incident_case",
            actor=raw.get("lead_analyst") or raw.get("investigator"),
            case_id=raw.get("case_id") or raw_ref,
            action=raw.get("step") or raw.get("phase") or "INVESTIGATION_STEP",
            severity=str(raw.get("severity", "MEDIUM")).upper(),
            raw_reference=raw_ref,
            metadata={
                "stage": raw.get("stage", "TRIAGE"),
                "playbook": raw.get("playbook", "PW-04"),
            },
        )


class SOCMetricsParser(BaseEventParser):
    source_name: str = "METRICS"

    @classmethod
    def parse_record(cls, raw: Dict[str, Any], cse_id: str) -> CanonicalEvent:
        raw_ref = str(raw.get("metric_id") or raw.get("id") or f"MET-{uuid.uuid4().hex[:8]}")
        ts = raw.get("timestamp") or datetime.now(timezone.utc)
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.now(timezone.utc)

        return CanonicalEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:12]}",
            timestamp=ts,
            cse_id=cse_id,
            source="METRICS",
            event_class="metric",
            actor="SYSTEM_METRIC_AGGREGATOR",
            case_id=None,
            action="METRIC_REPORTED",
            severity="INFORMATIONAL",
            raw_reference=raw_ref,
            metadata={
                "metric_name": raw.get("name") or raw.get("metric"),
                "reported_value": raw.get("value"),
                "unit": raw.get("unit", "minutes"),
            },
        )


class EventNormalizer:
    PARSERS = {
        "SIEM": SIEMParser,
        "TICKETING": TicketingParser,
        "EDR": EDRParser,
        "GATEWAY": NetworkGatewayParser,
        "NETWORK_GATEWAY": NetworkGatewayParser,
        "AUTH": AuthenticationParser,
        "AUTHENTICATION": AuthenticationParser,
        "CASE_MGMT": CaseManagementParser,
        "CASE_MANAGEMENT": CaseManagementParser,
        "METRICS": SOCMetricsParser,
        "SOC_METRICS": SOCMetricsParser,
    }

    @classmethod
    def normalize_record(cls, raw: Dict[str, Any], source: str, cse_id: str) -> CanonicalEvent:
        parser_cls = cls.PARSERS.get(source.upper(), SIEMParser)
        return parser_cls.parse_record(raw, cse_id)

    @classmethod
    def normalize_batch(cls, records: List[Dict[str, Any]], source: str, cse_id: str) -> List[CanonicalEvent]:
        return [cls.normalize_record(r, source, cse_id) for r in records]
