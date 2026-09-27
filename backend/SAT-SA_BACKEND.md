# SAT-SA Backend Architecture & Implementation Specification

**System:** Supervisory Analytics Tool for SOC Assessment (SAT-SA)  
**Security Enclave:** NCIIPC / ENCLAVE-70B  
**Frontend Version:** OPS-v4.8  
**Backend Specification:** Derived from the SAT-SA Frontend Architecture & Specification Guide  
**Deployment:** Offline / Air-Gapped Institutional Environment  
**Primary API Framework:** FastAPI + Python  
**Application Database:** PostgreSQL  
**Analytical Storage:** ClickHouse  
**Local Analytical Queries:** DuckDB  
**Process Mining:** PM4Py  
**Evidence Files:** Parquet / filesystem-backed immutable evidence store  
**Frontend Contract:** React + Vite

---

# 1. Purpose

This document defines the SAT-SA backend required to power the existing frontend.

The frontend is organized as a supervisory console with:

- Overview
- CSE Assessments
- Review Queue
- Findings
- Examiner Workspace
- Evidence Explorer
- Sampling
- Analysis Hub
- 10 analytical engines
- Remediation
- Governance
- Supervisory Evidence Graph

The backend must therefore provide a **single consistent data and decision-support layer** for these pages.

The frontend specification explicitly defines shared records for CSEs, findings, evidence, remediation plans, verification gates, audit events, and user roles, with relational references linking the entities across the workflow. fileciteturn1file0L225-L235

The backend contract is consequently:

```text
Frontend
   ↓
FastAPI REST API
   ↓
Authentication + RBAC + Validation + Audit
   ↓
Application Services
   ├── CSE / Assessment Service
   ├── Evidence Service
   ├── Analysis Service
   ├── Finding Service
   ├── Sampling Service
   ├── Remediation Service
   ├── Governance Service
   └── Graph Service
   ↓
PostgreSQL + ClickHouse + DuckDB + Evidence Store
```

---

# 2. Backend Objectives

## 2.1 Functional objectives

The backend must:

1. Authenticate enclave users.
2. Authorize requests by role and CSE access scope.
3. Serve every frontend route through stable API contracts.
4. Persist all data instead of using frontend mock/dummy records.
5. Maintain relational integrity across CSE, control, evidence, signal, finding, remediation, and verification entities.
6. Ingest operational SOC evidence.
7. Validate and hash evidence.
8. Normalize heterogeneous source data into a canonical evidence model.
9. Calculate expected versus observed operational outcomes.
10. Run the 10 analytical engines.
11. Produce explainable analytical signals.
12. Fuse independent signals into finding candidates.
13. Keep the examiner in the human decision loop.
14. Generate risk-prioritized supervisory samples.
15. Track remediation and verification gates.
16. Maintain an auditable governance ledger.
17. Version control libraries, rules, models, and analytical pipelines.
18. Expose the evidence-control-signal graph.
19. Operate without cloud services or external AI APIs.

---

# 3. Frontend-to-Backend Contract

The frontend route architecture is the primary API contract.

The source frontend defines `/login`, `/overview`, CSE supervision, review/findings, evidence, sampling, analysis, remediation, governance, and graph routes. fileciteturn1file0L71-L95

## 3.1 Route-to-API mapping

| Frontend Route | Backend API | Primary Data |
|---|---|---|
| `/login` | `POST /api/v1/auth/login` | user/session |
| `/overview` | `GET /api/v1/overview` | KPIs, priority signals, CSE triage |
| `/supervision/cses` | `GET /api/v1/cses` | CSE list |
| `/supervision/cses/:cseId` | `GET /api/v1/cses/{cse_id}` | CSE detail |
| `/review/findings` | `GET /api/v1/review/queue` | review candidates |
| `/findings` | `GET /api/v1/findings` | findings inventory |
| `/findings/:findingId` | `GET /api/v1/findings/{finding_id}` | examiner workspace |
| `/evidence` | `GET /api/v1/evidence` | evidence catalogue |
| `/sampling` | `GET/POST /api/v1/sampling` | sample cohorts |
| `/analysis` | `GET /api/v1/analysis` | engine registry + signals |
| `/analysis/:engineSlug` | `GET /api/v1/analysis/{engine_slug}` | engine KPIs + telemetry |
| `/remediation` | `GET /api/v1/remediation` | remediation lifecycle |
| `/governance` | `GET /api/v1/governance/*` | audit/admin/control/version data |
| `/graph` | `GET /api/v1/graph` | evidence-control-signal graph |

---

# 4. API Base Contract

## Base URL

```text
/api/v1
```

## Content type

```http
Content-Type: application/json
Authorization: Bearer <access-token>
```

## Standard response envelope

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "page_size": 25,
    "total": 100
  }
}
```

## Standard error envelope

```json
{
  "success": false,
  "error": {
    "code": "FINDING_NOT_FOUND",
    "message": "Finding FND-021 does not exist",
    "details": {}
  }
}
```

---

# 5. Recommended Backend Repository Structure

```text
backend/
│
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── deps.py
│   │   ├── router.py
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── overview.py
│   │       ├── cses.py
│   │       ├── review.py
│   │       ├── findings.py
│   │       ├── evidence.py
│   │       ├── sampling.py
│   │       ├── analysis.py
│   │       ├── remediation.py
│   │       ├── governance.py
│   │       ├── graph.py
│   │       └── ingestion.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── permissions.py
│   │   ├── audit.py
│   │   ├── hashing.py
│   │   ├── logging.py
│   │   └── exceptions.py
│   │
│   ├── db/
│   │   ├── session.py
│   │   ├── postgres.py
│   │   ├── clickhouse.py
│   │   ├── duckdb.py
│   │   ├── models/
│   │   └── migrations/
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── overview.py
│   │   ├── cse.py
│   │   ├── control.py
│   │   ├── evidence.py
│   │   ├── signal.py
│   │   ├── finding.py
│   │   ├── sampling.py
│   │   ├── remediation.py
│   │   ├── verification.py
│   │   ├── governance.py
│   │   └── graph.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── overview_service.py
│   │   ├── cse_service.py
│   │   ├── evidence_service.py
│   │   ├── finding_service.py
│   │   ├── sampling_service.py
│   │   ├── remediation_service.py
│   │   ├── governance_service.py
│   │   └── graph_service.py
│   │
│   ├── analytics/
│   │   ├── orchestrator.py
│   │   ├── base_engine.py
│   │   ├── execution_gap.py
│   │   ├── negative_space.py
│   │   ├── coverage.py
│   │   ├── process_conformance.py
│   │   ├── investigation_quality.py
│   │   ├── behavioural.py
│   │   ├── historical.py
│   │   ├── peer.py
│   │   ├── consistency.py
│   │   └── metric_integrity.py
│   │
│   ├── evidence/
│   │   ├── ingestion.py
│   │   ├── normalization.py
│   │   ├── validation.py
│   │   ├── provenance.py
│   │   └── storage.py
│   │
│   ├── fusion/
│   │   ├── signal_fusion.py
│   │   ├── priority.py
│   │   └── finding_generation.py
│   │
│   ├── sampling/
│   │   ├── stratified.py
│   │   ├── risk.py
│   │   └── export.py
│   │
│   └── graph/
│       ├── builder.py
│       └── queries.py
│
├── tests/
├── scripts/
│   ├── seed_demo_data.py
│   ├── create_admin.py
│   └── run_analysis.py
│
├── alembic.ini
├── pyproject.toml
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

# 6. Core Data Model

The frontend requires relational integrity across:

```text
CSE-014
   ↓
CTRL-07
   ↓
EV-1042
   ↓
FND-021
   ↓
RM-008
   ↓
VR-004
```

This relationship must exist in the backend database rather than only in frontend state. fileciteturn1file0L227-L235

## 6.1 Main PostgreSQL entities

```text
users
roles
permissions
user_cse_access

cses
assessment_cycles
controls
control_applicability

evidence
evidence_provenance
evidence_control_links

signals
signal_evidence_links

findings
finding_signal_links
finding_evidence_links

remediations
remediation_findings

verification_gates
verification_results

sampling_runs
sampling_items

audit_events

system_versions
rule_versions
model_versions
pipeline_runs
```

---

# 7. Entity Schemas

## 7.1 User

```json
{
  "id": "USR-001",
  "username": "supervisor01",
  "display_name": "Supervisor",
  "role": "SUPERVISOR",
  "status": "ACTIVE",
  "last_login_at": "2026-09-27T10:30:00Z"
}
```

## 7.2 Role

Required frontend roles include:

```text
SUPERVISOR
EXAMINER
```

The frontend explicitly stores the active user role using `userRole`. fileciteturn1file0L227-L235

Recommended permission model:

```text
SUPERVISOR
├── read all authorized CSEs
├── review findings
├── manage sampling
├── view governance
├── administer access
└── view system versions

EXAMINER
├── read assigned CSEs
├── inspect evidence
├── review findings
├── validate / qualify / reject findings
├── request evidence
└── manage assigned remediation verification
```

The exact organization-specific permission matrix should remain configurable rather than hard-coded.

---

# 8. CSE and Assessment APIs

## 8.1 List CSEs

```http
GET /api/v1/cses
```

### Query parameters

```text
sector
tier
assessment_status
readiness_min
readiness_max
search
page
page_size
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "cse_id": "CSE-014",
        "name": "Entity 14",
        "sector": "Energy",
        "tier": "TIER-1",
        "assessment_status": "IN_PROGRESS",
        "evidence_readiness": 87.4,
        "open_findings": 4
      }
    ]
  }
}
```

The frontend expects the CSE list to expose tier, sector, assessment cycle status, evidence readiness, open findings count, and actions. fileciteturn1file0L141-L145

## 8.2 CSE detail

```http
GET /api/v1/cses/{cse_id}
```

Must return:

```text
CSE Profile
Assessment Period
Evidence Readiness
Capability Discrepancy Matrix
Expected vs Observed Snapshot
Process Snapshot
Findings
Remediation Summary
Active Signals
```

---

# 9. Overview API

## Endpoint

```http
GET /api/v1/overview
```

The frontend strictly limits Overview to five KPI cards:

1. CSEs Assessed
2. High-Priority Signals
3. Evidence Readiness
4. Open Findings
5. Open Remediation

It also expects a priority attention feed, CSE status grid, cross-engine signal distribution, and quick actions. fileciteturn1file0L131-L139

## Response contract

```json
{
  "success": true,
  "data": {
    "kpis": {
      "cses_assessed": 18,
      "high_priority_signals": 12,
      "evidence_readiness_pct": 87.4,
      "open_findings": 23,
      "open_remediation": 9
    },
    "priority_feed": [],
    "cse_status": [],
    "engine_distribution": [],
    "quick_actions": []
  }
}
```

The backend should calculate these values from authoritative records, not duplicate counters stored independently.

---

# 10. Evidence Architecture

The frontend defines Evidence Explorer as an immutable registry with search by Evidence ID, CSE, or Control Code, filtering by validation status, category, and submission window, plus checksums, mappings, signals, findings, and provenance. fileciteturn1file0L185-L190

## 10.1 Evidence lifecycle

```text
INGEST
  ↓
PARSE
  ↓
SCHEMA VALIDATION
  ↓
HASH
  ↓
NORMALIZE
  ↓
CONTROL MAPPING
  ↓
STORE
  ↓
ANALYZE
  ↓
LINK TO SIGNALS
  ↓
LINK TO FINDINGS
```

## 10.2 Evidence states

Use the frontend-defined states:

```text
PRESENT
ABSENT_CONFIRMED
NOT_SUBMITTED
NOT_APPLICABLE
UNKNOWN
```

fileciteturn1file0L114-L125

## 10.3 Evidence record

```json
{
  "evidence_id": "EV-1042",
  "cse_id": "CSE-014",
  "control_code": "CTRL-07",
  "category": "SOC_LOG",
  "state": "PRESENT",
  "validation_status": "VALID",
  "sha256": "....",
  "source_system": "SIEM",
  "source_event_id": "SIEM-992144",
  "received_at": "2026-09-27T09:20:00Z",
  "provenance": {
    "source": "SIEM",
    "collector": "COL-02",
    "transmission_token": "TX-8842"
  }
}
```

---

# 11. Canonical Evidence Model

The backend should normalize source-specific records before analytical processing.

## Input sources

```text
SIEM
Ticketing
EDR
Network Gateway
Authentication
Incident Management
Case Management
SOC Metrics
Policy / Control Documents
```

## Normalization pipeline

```text
Raw Source
   ↓
Parser
   ↓
Schema Validation
   ↓
Field Mapping
   ↓
Canonical Event
   ↓
OCSF-aligned Event Class
   ↓
ClickHouse
```

## Canonical event example

```json
{
  "event_id": "EVT-001",
  "timestamp": "2026-09-27T08:15:20Z",
  "cse_id": "CSE-014",
  "source": "SIEM",
  "event_class": "security_finding",
  "actor": "analyst-22",
  "case_id": "CASE-992",
  "action": "ESCALATE",
  "severity": "HIGH",
  "raw_reference": "SIEM-992144"
}
```

The canonical record should preserve a reference to the original source record so every analytical result can be traced backward.

---

# 12. Analytical Storage

## PostgreSQL

Use PostgreSQL for transactional application state:

```text
Users
Roles
CSEs
Controls
Findings
Evidence metadata
Remediation
Verification
Sampling
Audit metadata
System versions
```

## ClickHouse

Use ClickHouse for large-volume analytical telemetry:

```text
SOC events
Alert streams
Case timelines
Gateway telemetry
Authentication logs
Investigation activity
Metrics history
```

## DuckDB

Use DuckDB for local ad-hoc analytical queries over Parquet/evidence files.

Typical use:

```text
Parquet evidence
     ↓
DuckDB SQL
     ↓
temporary / examiner-scoped analysis
```

## Separation rule

```text
PostgreSQL  = transactional truth
ClickHouse  = analytical event truth
Parquet     = evidence artifact truth
DuckDB      = local analytical workspace
```

Do not duplicate business truth between all stores.

---

# 13. Analytical Engine Architecture

The frontend specifies ten engines and a common engine page template consisting of:

```text
Header + Purpose
      ↓
4 KPI Cards
      ↓
Filter Bar
      ↓
Actionable Telemetry Table
      ↓
Optional Trend / Comparison
      ↓
Analytics Signal Drawer
```

fileciteturn1file0L166-L183

The backend should implement one common engine interface.

## 13.1 Base engine interface

```python
class AnalyticalEngine:
    slug: str
    name: str
    version: str

    def compute(
        self,
        cse_id: str,
        start_time,
        end_time,
        filters: dict
    ) -> list:
        ...

    def explain(self, signal) -> dict:
        ...

    def get_kpis(self, signals: list) -> dict:
        ...
```

## 13.2 Engine registry

```python
ENGINE_REGISTRY = {
    "execution-gap": ExecutionGapEngine,
    "negative-space": NegativeSpaceEngine,
    "coverage": CoverageEngine,
    "process": ProcessConformanceEngine,
    "investigation-quality": InvestigationQualityEngine,
    "behavioural": BehaviouralDeviationEngine,
    "historical": HistoricalComparisonEngine,
    "peer": PeerBenchmarkingEngine,
    "consistency": CrossSourceConsistencyEngine,
    "metric-integrity": MetricIntegrityEngine,
}
```

---

# 14. Engine 1 — Execution Gap

Frontend purpose:

> Detect discrepancies between declared policies/capabilities and logged operational telemetry. fileciteturn1file0L171-L173

## Backend flow

```text
Declared Capability / Control
        ↓
Expected Operational Behaviour
        ↓
Observed Telemetry
        ↓
Compare
        ↓
Gap Score
        ↓
Signal
```

Example:

```text
Expected:
24x7 monitoring

Observed:
Monitoring activity exists only during defined shift windows

Result:
Execution Gap Signal
```

Signal payload:

```json
{
  "signal_id": "SIG-1001",
  "engine": "execution-gap",
  "cse_id": "CSE-014",
  "control_id": "CTRL-07",
  "severity": "HIGH",
  "score": 0.91,
  "expected": {},
  "observed": {},
  "explanation": {}
}
```

---

# 15. Engine 2 — Negative Space

Frontend purpose:

> Detect expected operational activity that failed to occur within defined timeframes. fileciteturn1file0L172-L174

Backend must model both:

```text
Expected event
AND
Observed event
```

A negative-space signal is created when an expected activity has no matching observed activity during its validity window.

```text
Expected:
Every high-severity alert → triage within 15 min

Observed:
No triage event within window

Result:
Negative Space Signal
```

This requires an expected-event definition table.

---

# 16. Engine 3 — Coverage & Blind-Spot

Frontend purpose:

> Identify unmonitored network segments, missing log sources, and control gaps. fileciteturn1file0L173-L175

Backend inputs:

```text
Asset inventory
Network segments
Log source inventory
Control applicability
Telemetry frequency
Last-seen timestamps
```

Output:

```text
coverage_pct
missing_sources
blind_spots
affected_controls
signals
```

---

# 17. Engine 4 — Process Conformance

Frontend purpose:

> Detect deviations from approved incident-handling and escalation procedures. fileciteturn1file0L174-L176

Use process event sequences:

```text
Alert
  ↓
Triage
  ↓
Investigation
  ↓
Escalation
  ↓
Containment
  ↓
Closure
```

PM4Py can be used to compare observed process traces against the approved process model.

The backend should return:

```json
{
  "case_id": "CASE-992",
  "expected_path": [],
  "observed_path": [],
  "deviations": [],
  "conformance_score": 0.74
}
```

---

# 18. Engine 5 — Investigation Quality

Frontend purpose:

> Analyze dwell times, artifact collection depth, and triage rigor. fileciteturn1file0L175-L177

Example metrics:

```text
mean_triage_time
median_investigation_time
artifact_collection_depth
reopened_case_ratio
escalation_delay
closure_quality_indicator
```

Every derived metric must retain links to the raw events used to compute it.

---

# 19. Engine 6 — Behavioural Deviation

Frontend purpose:

> Identify analyst behavioural anomalies, out-of-band actions, and shift discrepancies. fileciteturn1file0L177-L178

The backend should compare activity against approved operational context:

```text
actor
role
shift
action type
time
case
peer/history baseline
```

Important:

This engine produces an analytical signal for examination. It must not independently make personnel or regulatory decisions.

---

# 20. Engine 7 — Historical Comparison

Frontend purpose:

> Detect longitudinal drift against historical quarterly baselines. fileciteturn1file0L178-L179

Backend should maintain periodized baselines:

```text
CSE
  ↓
Quarter / Assessment Period
  ↓
Metric Baseline
  ↓
Current Metric
  ↓
Delta
  ↓
Drift Signal
```

Return:

```json
{
  "metric": "MTTD",
  "current": 18.2,
  "baseline": 11.4,
  "delta_pct": 59.65,
  "period": "2026-Q3"
}
```

---

# 21. Engine 8 — Peer Benchmarking

Frontend purpose:

> Compare entities with anonymized peers in the same sector. fileciteturn1file0L179-L180

Backend requirements:

```text
sector filtering
tier filtering
peer cohort definition
anonymization
metric normalization
minimum cohort protection
```

Peer outputs should never expose another entity's identifying information unless explicitly authorized.

---

# 22. Engine 9 — Cross-Source Consistency

Frontend purpose:

> Correlate SIEM alerts, ticketing, and gateway telemetry. fileciteturn1file0L180-L181

Example:

```text
SIEM Alert
   ↕
Incident Ticket
   ↕
Gateway Event
```

Backend correlation fields:

```text
event timestamp
asset
IP / host reference
case_id
alert_id
source reference
actor
event type
```

Output:

```text
MATCHED
PARTIAL_MATCH
CONFLICT
MISSING_CORRESPONDENCE
```

---

# 23. Engine 10 — Metric Integrity

Frontend purpose:

> Verify reported MTTR/MTTD metrics against raw underlying event data. fileciteturn1file0L180-L181

Backend calculation:

```text
Raw Event Timeline
      ↓
Recalculate Metric
      ↓
Compare With Submitted Metric
      ↓
Difference
      ↓
Integrity Signal
```

Example:

```json
{
  "metric": "MTTR",
  "reported": 42.0,
  "recalculated": 58.7,
  "difference": 16.7,
  "difference_pct": 39.76,
  "status": "DISCREPANCY"
}
```

---

# 24. Signal Data Model

All analytical engines should emit a common signal structure.

```json
{
  "signal_id": "SIG-2004",
  "engine": "execution-gap",
  "engine_version": "1.2.0",
  "cse_id": "CSE-014",
  "control_id": "CTRL-07",
  "priority": "HIGH",
  "score": 0.88,
  "status": "ACTIVE",
  "title": "Declared monitoring capability not supported by observed telemetry",
  "summary": "...",
  "expected": {},
  "observed": {},
  "evidence_ids": [
    "EV-1042"
  ],
  "explanation": {
    "rules": [],
    "metrics": [],
    "contributing_factors": []
  },
  "created_at": "2026-09-27T10:10:00Z"
}
```

This directly supports the frontend's `AnalyticsSignalDrawer`.

---

# 25. Evidence Fusion

The backend should not convert a single weak signal directly into a final finding.

Use:

```text
Signal 1
Signal 2
Signal 3
Evidence
Historical context
Peer context
Process context
       ↓
Evidence Fusion
       ↓
Finding Candidate
```

## Fusion record

```json
{
  "fusion_id": "FUS-021",
  "cse_id": "CSE-014",
  "signal_ids": [
    "SIG-2004",
    "SIG-2011",
    "SIG-2032"
  ],
  "evidence_ids": [
    "EV-1042",
    "EV-1048"
  ],
  "confidence": 0.91,
  "rationale": "Multiple independent evidence paths indicate the same control discrepancy."
}
```

---

# 26. Finding Lifecycle

The frontend defines:

```text
CANDIDATE
   ↓
UNDER REVIEW
   ↓
VALIDATED
   ↓
QUALIFIED

Alternative terminal states:
REJECTED
OVERRIDDEN
```

fileciteturn1file0L120-L123

## API

### List findings

```http
GET /api/v1/findings
```

### Review queue

```http
GET /api/v1/review/queue
```

### Finding detail

```http
GET /api/v1/findings/{finding_id}
```

### Examiner actions

```http
POST /api/v1/findings/{finding_id}/validate
POST /api/v1/findings/{finding_id}/qualify
POST /api/v1/findings/{finding_id}/reject
POST /api/v1/findings/{finding_id}/override
POST /api/v1/findings/{finding_id}/evidence-demand
```

Every state change must:

1. Check authorization.
2. Validate lifecycle transition.
3. Store examiner identity.
4. Store timestamp.
5. Require reason where appropriate.
6. Write an audit event.
7. Preserve the prior state.

---

# 27. Examiner Workspace API

The frontend requires:

- Why Flagged
- Expected vs Observed
- Supporting Evidence & Provenance
- Human-in-the-loop actions
- Remediation linkage

fileciteturn1file0L147-L157

## Endpoint

```http
GET /api/v1/findings/{finding_id}/workspace
```

Response:

```json
{
  "finding": {},
  "why_flagged": {
    "rules": [],
    "statistics": [],
    "engine_signals": []
  },
  "expected_vs_observed": {},
  "evidence": [],
  "provenance": [],
  "decision_history": [],
  "remediation": [],
  "available_actions": []
}
```

---

# 28. Human-in-the-Loop Enforcement

The backend must make analytical output advisory rather than an automatic final regulatory determination.

The system should expose:

```text
AI / Rules / Analytics
        ↓
Signal
        ↓
Finding Candidate
        ↓
Human Examiner
        ↓
Decision
```

Never:

```text
AI
 ↓
Final Regulatory Finding
```

All examiner actions must be separately recorded in the audit ledger.

---

# 29. Sampling Engine

The frontend defines supervisory sampling by:

- risk score
- anomaly presence
- sector tier
- cohort generation
- sample export

fileciteturn1file0L159-L164

## Endpoints

```http
GET  /api/v1/sampling
POST /api/v1/sampling/runs
GET  /api/v1/sampling/runs/{run_id}
GET  /api/v1/sampling/runs/{run_id}/items
GET  /api/v1/sampling/runs/{run_id}/export
```

## Sampling input

```json
{
  "sector": "Energy",
  "tier": "TIER-1",
  "sample_size": 25,
  "risk_weight": 0.6,
  "anomaly_weight": 0.25,
  "random_weight": 0.15
}
```

The sampling algorithm must store the input parameters and random seed/version so that the sample can be reproduced and audited.

---

# 30. Remediation API

The frontend defines three remediation stages:

```text
Open Remediation
Verification Gates
Reopened / Regression
```

fileciteturn1file0L192-L197

## Lifecycle

```text
OPEN
  ↓
IN PROGRESS
  ↓
SUBMITTED
  ↓
UNDER VERIFICATION
  ↓
CLOSED

Failure:
UNDER VERIFICATION
  ↓
REOPENED
```

fileciteturn1file0L120-L125

## Endpoints

```http
GET  /api/v1/remediation
GET  /api/v1/remediation/{remediation_id}
POST /api/v1/remediation
PATCH /api/v1/remediation/{remediation_id}
POST /api/v1/remediation/{remediation_id}/submit
POST /api/v1/remediation/{remediation_id}/verify
POST /api/v1/remediation/{remediation_id}/reopen
```

---

# 31. Verification Gates

A verification gate should contain:

```json
{
  "verification_id": "VR-004",
  "remediation_id": "RM-008",
  "type": "TECHNICAL_RETEST",
  "status": "PENDING",
  "criteria": {},
  "evidence_required": [],
  "result": null,
  "examiner_id": null
}
```

Verification must retain:

```text
verification criteria
submitted evidence
technical test result
reviewer
timestamp
result
reason
```

---

# 32. Governance APIs

The frontend defines four governance tabs:

1. Audit Ledger
2. Administration
3. Control Library
4. System Versions

fileciteturn1file0L199-L205

## 32.1 Audit Ledger

```http
GET /api/v1/governance/audit
GET /api/v1/governance/audit/{event_id}
```

Audit event:

```json
{
  "event_id": "AUD-00992",
  "actor_id": "USR-001",
  "action": "FINDING_VALIDATED",
  "entity_type": "FINDING",
  "entity_id": "FND-021",
  "before": {},
  "after": {},
  "timestamp": "2026-09-27T11:14:00Z",
  "request_id": "REQ-8831"
}
```

Audit events should be append-only.

---

# 33. Administration

## Endpoints

```http
GET  /api/v1/governance/users
GET  /api/v1/governance/users/{user_id}
POST /api/v1/governance/users
PATCH /api/v1/governance/users/{user_id}
GET  /api/v1/governance/roles
GET  /api/v1/governance/access
```

Access control must support:

```text
User
  ↓
Role
  ↓
Permissions
  ↓
CSE Scope
```

---

# 34. Control Library

## Endpoints

```http
GET /api/v1/governance/controls
GET /api/v1/governance/controls/{control_id}
```

Control record:

```json
{
  "control_id": "CTRL-07",
  "code": "SOC.MON.07",
  "title": "Continuous Security Monitoring",
  "severity": "HIGH",
  "applicability": [],
  "expected_outcomes": [],
  "expected_evidence": [],
  "active": true,
  "version": "2026.3"
}
```

Controls must define how expected operational outcomes and expected evidence are derived.

---

# 35. System Versions

The frontend explicitly exposes rule sets, model weights, and pipeline version history through System Versions. fileciteturn1file0L199-L205

## Endpoints

```http
GET /api/v1/governance/versions
GET /api/v1/governance/versions/rules
GET /api/v1/governance/versions/models
GET /api/v1/governance/versions/pipelines
```

Every analytical signal should retain:

```text
engine version
rule version
model version, if applicable
pipeline version
execution timestamp
```

This provides reproducibility.

---

# 36. Expected vs Observed Model

This is a core backend concept because the frontend explicitly displays Expected vs Observed snapshots and finding explanations. fileciteturn1file0L143-L156

## 36.1 Expected outcome

Expected outcome can be generated from:

```text
Applicable Control
+
Assessment Context
+
Policy / SOP
+
Control Version
+
Defined Time Window
```

Result:

```json
{
  "metric": "high_severity_triage",
  "expected": {
    "count": 100,
    "max_response_minutes": 15,
    "required": true
  }
}
```

## 36.2 Observed outcome

Observed outcome comes from canonical telemetry:

```json
{
  "metric": "high_severity_triage",
  "observed": {
    "count": 93,
    "median_response_minutes": 21,
    "missing_within_sla": 11
  }
}
```

## 36.3 Comparison

```text
Expected
   ↓
Observed
   ↓
Normalization
   ↓
Difference
   ↓
Contextual interpretation
   ↓
Signal
```

Do not infer a violation solely from a numeric difference. The engine should expose the evidence and rule that produced the signal for examiner review.

---

# 37. Risk and Priority Model

The frontend uses four priority states:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

fileciteturn1file0L114-L119

Backend should separate:

```text
raw analytical score
contextual risk score
display priority
```

Example:

```json
{
  "raw_score": 0.86,
  "contextual_risk": 0.78,
  "priority": "HIGH"
}
```

The threshold mapping should be versioned and stored in the System Versions module.

---

# 38. Graph API

The frontend includes:

```text
/graph
SupervisoryEvidenceGraphPage
```

and is expected to provide an evidence-control-signal fusion graph. fileciteturn1file0L73-L88

## Endpoint

```http
GET /api/v1/graph
```

## Optional filters

```text
cse_id
finding_id
control_id
signal_id
```

## Response

```json
{
  "nodes": [
    {
      "id": "CSE-014",
      "type": "cse",
      "label": "CSE-014"
    },
    {
      "id": "CTRL-07",
      "type": "control",
      "label": "CTRL-07"
    },
    {
      "id": "EV-1042",
      "type": "evidence",
      "label": "EV-1042"
    },
    {
      "id": "SIG-2004",
      "type": "signal",
      "label": "SIG-2004"
    }
  ],
  "edges": [
    {
      "source": "CSE-014",
      "target": "CTRL-07",
      "relationship": "SUBJECT_TO"
    },
    {
      "source": "CTRL-07",
      "target": "EV-1042",
      "relationship": "SUPPORTED_BY"
    },
    {
      "source": "EV-1042",
      "target": "SIG-2004",
      "relationship": "GENERATED"
    }
  ]
}
```

NetworkX can be used as an in-memory graph construction/query layer while PostgreSQL remains the authoritative relational store.

---

# 39. Search and Filtering

The frontend uses compact search + filters, especially for Evidence and analytical pages. Its shared `FilterBar` is specified as Search + 3–5 dropdown filters + reset. fileciteturn1file0L209-L221

Backend query design should support:

```text
search
status
priority
sector
tier
engine
control
date range
CSE
```

Use indexed columns for high-frequency filters.

For large telemetry tables, query ClickHouse instead of PostgreSQL.

---

# 40. Pagination

Every large collection endpoint should support:

```text
page
page_size
```

or cursor pagination for telemetry.

Example:

```http
GET /api/v1/findings?page=1&page_size=25
```

Telemetry:

```http
GET /api/v1/analysis/execution-gap/signals?cursor=...
```

Never load millions of SOC events into the browser.

---

# 41. Authentication

The frontend login is an enclave authentication gateway. fileciteturn1file0L73-L76

Recommended backend flow:

```text
POST /auth/login
     ↓
Credential verification
     ↓
Role resolution
     ↓
CSE authorization scope
     ↓
Session / access token
     ↓
Frontend
```

Recommended response:

```json
{
  "access_token": "....",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "USR-001",
    "role": "SUPERVISOR"
  }
}
```

For the production enclave, authentication should be replaceable with the organization's approved identity/cryptographic mechanism without changing the rest of the API contract.

---

# 42. API Security

The backend should implement:

```text
TLS inside enclave
JWT/session validation
RBAC
CSE-level authorization
Request validation
Rate limiting where appropriate
Audit logging
Input size limits
Secure file upload validation
Hash verification
Database least privilege
Secrets via environment/secret store
```

Never send:

```text
database credentials
internal filesystem paths
raw secrets
unfiltered sensitive logs
```

to the frontend.

---

# 43. Evidence Integrity

For each evidence artifact:

```text
Receive
  ↓
SHA-256
  ↓
Store hash
  ↓
Validate metadata
  ↓
Store artifact
```

On later access or verification:

```text
Stored artifact
      ↓
SHA-256
      ↓
Compare with original hash
      ↓
Integrity result
```

Example:

```json
{
  "evidence_id": "EV-1042",
  "stored_hash": "abc...",
  "calculated_hash": "abc...",
  "integrity_status": "VALID"
}
```

---

# 44. Auditability

Every security-relevant mutation must create an audit event.

Minimum events:

```text
LOGIN_SUCCESS
LOGIN_FAILURE
ACCESS_DENIED

EVIDENCE_INGESTED
EVIDENCE_VALIDATED
EVIDENCE_HASH_MISMATCH

SIGNAL_CREATED
FINDING_CREATED
FINDING_VALIDATED
FINDING_QUALIFIED
FINDING_REJECTED
FINDING_OVERRIDDEN
EVIDENCE_DEMAND_CREATED

REMEDIATION_CREATED
REMEDIATION_SUBMITTED
VERIFICATION_COMPLETED
REMEDIATION_REOPENED

USER_CREATED
USER_UPDATED
ACCESS_CHANGED

CONTROL_CREATED
CONTROL_UPDATED

RULE_VERSION_ACTIVATED
MODEL_VERSION_ACTIVATED
PIPELINE_EXECUTED
```

---

# 45. Background Processing

Analytical processing should not block normal frontend API requests.

Recommended execution pattern:

```text
API Request
   ↓
Create Analysis Job
   ↓
Queue / Local Worker
   ↓
Analytics Engine
   ↓
Persist Signals
   ↓
Update Job
   ↓
Frontend polls / refreshes
```

Possible offline message broker:

```text
Redpanda
or
Local Kafka
```

For a prototype, a local worker process is sufficient.

The production architecture can replace it with the approved enclave-local broker without changing the analytical interfaces.

---

# 46. Analysis Job Model

```json
{
  "job_id": "JOB-991",
  "engine": "execution-gap",
  "cse_id": "CSE-014",
  "status": "RUNNING",
  "progress": 42,
  "started_at": "2026-09-27T11:00:00Z",
  "completed_at": null,
  "rule_version": "RULE-2026.3",
  "pipeline_version": "PIPE-4.8"
}
```

API:

```http
POST /api/v1/analysis/{engine_slug}/run
GET  /api/v1/analysis/jobs/{job_id}
```

---

# 47. Analysis Hub API

The frontend Analysis Hub is a navigation/orientation page with four KPI cards and an engine registry. fileciteturn1file0L166-L170

## Endpoint

```http
GET /api/v1/analysis
```

Response:

```json
{
  "kpis": {
    "active_signals": 42,
    "critical_signals": 5,
    "engines_active": 10,
    "analysis_runs_today": 16
  },
  "engines": [
    {
      "slug": "execution-gap",
      "name": "Execution Gap Engine",
      "purpose": "...",
      "active_signals": 8,
      "status": "ACTIVE"
    }
  ]
}
```

---

# 48. Generic Engine API

```http
GET /api/v1/analysis/{engine_slug}
```

Query:

```text
cse_id
assessment_cycle
priority
status
start_date
end_date
page
page_size
```

Response:

```json
{
  "engine": {
    "slug": "execution-gap",
    "name": "Execution Gap Engine",
    "version": "1.2.0"
  },
  "kpis": {
    "total_signals": 17,
    "high_priority": 5,
    "average_score": 0.71,
    "new_since_last_run": 3
  },
  "signals": [],
  "trend": []
}
```

---

# 49. Frontend State Synchronization

The frontend maintains a centralized `SupervisoryContext` containing:

```text
cses
findings
evidences
remediations
verifications
auditEvents
userRole
```

fileciteturn1file0L225-L235

The backend should therefore expose resources with stable IDs and predictable relationships rather than page-specific duplicated objects.

Recommended frontend loading pattern:

```text
App load
  ↓
GET /auth/me
  ↓
GET /overview
  ↓
Page-specific requests on navigation
```

Do not load the entire system into global state.

Use server-side fetching for large tables and details.

---

# 50. Frontend Drawer Contract

The frontend uses contextual drawers for:

```text
Analytics Signal
Evidence
Finding
Audit Event
User
Control
Version
```

The backend should therefore return compact detail endpoints.

Examples:

```http
GET /api/v1/signals/{signal_id}
GET /api/v1/evidence/{evidence_id}
GET /api/v1/findings/{finding_id}
GET /api/v1/governance/audit/{event_id}
GET /api/v1/governance/users/{user_id}
GET /api/v1/governance/controls/{control_id}
GET /api/v1/governance/versions/{version_id}
```

---

# 51. Suggested PostgreSQL Relationships

```text
users
  ├──< user_cse_access >── cses
  │
  ├──< audit_events
  │
  └── roles

cses
  ├──< assessment_cycles
  ├──< evidence
  ├──< signals
  ├──< findings
  └──< remediations

controls
  ├──< control_applicability
  ├──< evidence_control_links
  └──< expected_outcomes

evidence
  ├──< evidence_provenance
  ├──< evidence_control_links
  ├──< signal_evidence_links
  └──< finding_evidence_links

signals
  ├──< signal_evidence_links
  └──< finding_signal_links

findings
  ├──< finding_evidence_links
  ├──< finding_signal_links
  └──< remediation_findings

remediations
  └──< verification_gates
```

---

# 52. Database IDs

Human-readable IDs should match frontend conventions:

```text
CSE-014
CTRL-07
EV-1042
SIG-2004
FND-021
RM-008
VR-004
AUD-00992
```

Internally, PostgreSQL may use UUID primary keys.

Recommended:

```text
internal_pk = UUID
public_id   = human-readable stable identifier
```

Never use a visible sequential ID as the only authorization/security boundary.

---

# 53. API Versioning

Use:

```text
/api/v1/*
```

When changing response structure materially:

```text
/api/v2/*
```

Do not silently break the frontend contract.

---

# 54. Health and Operations Endpoints

```http
GET /health
GET /ready
GET /api/v1/system/status
```

Example:

```json
{
  "status": "READY",
  "services": {
    "postgresql": "UP",
    "clickhouse": "UP",
    "duckdb": "READY",
    "analytics": "UP",
    "evidence_store": "UP"
  },
  "version": "OPS-v4.8"
}
```

---

# 55. Environment Configuration

Example `.env.example`:

```env
APP_NAME=SAT-SA
APP_ENV=development
APP_VERSION=OPS-v4.8

API_HOST=0.0.0.0
API_PORT=8001

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sat_sa
POSTGRES_USER=sat_sa
POSTGRES_PASSWORD=CHANGE_ME

CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_DB=sat_sa_analytics

EVIDENCE_ROOT=/data/evidence

JWT_SECRET=CHANGE_ME
JWT_EXPIRE_MINUTES=60

LOG_LEVEL=INFO

ANALYTICS_WORKER_ENABLED=true
```

Production secrets must not be committed to Git.

---

# 56. Docker Architecture

For development/prototype:

```yaml
services:

  backend:
    build: .
    ports:
      - "8001:8001"
    depends_on:
      - postgres
      - clickhouse

  postgres:
    image: postgres

  clickhouse:
    image: clickhouse/clickhouse-server
```

Optional:

```text
worker
redpanda
```

The frontend should communicate only with the FastAPI service.

---

# 57. Backend-to-Frontend Connection

The final runtime flow should be:

```text
React / Vite
    │
    │ HTTP
    ▼
FastAPI :8001
    │
    ├── Auth
    ├── RBAC
    ├── API
    ├── Audit
    │
    ├─────────────► PostgreSQL
    │
    ├─────────────► ClickHouse
    │
    ├─────────────► DuckDB
    │
    ├─────────────► Evidence Store
    │
    └─────────────► Analytical Engines
```

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:8001/api/v1
```

Production enclave:

```env
VITE_API_BASE_URL=https://<approved-enclave-host>/api/v1
```

---

# 58. Frontend Dummy Data Removal

The backend integration should replace hard-coded frontend values for:

```text
CSEs
Findings
Evidence
Signals
Remediation
Verification
Audit events
Users
Controls
System versions
KPIs
Charts
Graph nodes/edges
```

The frontend may retain static:

```text
labels
icons
route metadata
UI configuration
empty-state copy
```

It should not retain fake operational records once the backend is connected.

---

# 59. API Integration Sequence

Implement the connection in this order:

```text
1. /health
2. /auth/login
3. /auth/me
4. /overview
5. /cses
6. /findings
7. /evidence
8. /analysis
9. /sampling
10. /remediation
11. /governance
12. /graph
13. analysis jobs
14. evidence ingestion
```

This sequence lets the frontend become progressively live without requiring every analytical engine to be finished first.

---

# 60. Minimum Prototype Backend

For an SIH/prototype environment, the smallest real backend should contain:

```text
FastAPI
PostgreSQL
Authentication
RBAC
CSE CRUD
Evidence CRUD
Signal CRUD
Finding lifecycle
Remediation lifecycle
Audit ledger
Overview KPI aggregation
One working analytical engine
Graph endpoint
```

The other nine engines can share the same `AnalyticalEngine` contract and be activated incrementally.

However, the API shape should be designed for all ten from the beginning.

---

# 61. Production Analytical Architecture

```text
                  ┌──────────────────┐
                  │ Raw SOC Sources  │
                  └────────┬─────────┘
                           │
                    Local ingestion
                           │
                           ▼
                  ┌──────────────────┐
                  │ Canonical Mapper │
                  │ + Validation     │
                  └────────┬─────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
     ┌─────────────────┐        ┌────────────────┐
     │ Evidence Store  │        │   ClickHouse   │
     │ Parquet + Hash  │        │ Operational OLAP│
     └────────┬────────┘        └───────┬────────┘
              │                         │
              ▼                         ▼
          DuckDB                  Analytics Layer
                                        │
               ┌────────────────────────┼────────────────────┐
               ▼                        ▼                    ▼
        Process Mining            10 Engines          Historical/Peer
               │                        │                    │
               └────────────────────────┼────────────────────┘
                                        ▼
                                Evidence Fusion
                                        │
                                        ▼
                                  Risk / Priority
                                        │
                                        ▼
                                Finding Candidate
                                        │
                                        ▼
                                  Human Examiner
                                        │
                           ┌────────────┴────────────┐
                           ▼                         ▼
                      Finding Decision          Remediation
                                                     │
                                                     ▼
                                                Verification
```

---

# 62. Error Handling

Use consistent HTTP semantics:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Too Many Requests
500 Internal Server Error
503 Service Unavailable
```

Examples:

```text
403 CSE_ACCESS_DENIED
409 INVALID_LIFECYCLE_TRANSITION
409 EVIDENCE_HASH_MISMATCH
404 FINDING_NOT_FOUND
422 INVALID_ENGINE_FILTER
```

---

# 63. Testing Strategy

## Unit tests

Test:

```text
priority calculation
lifecycle transitions
expected-vs-observed calculations
sampling logic
RBAC checks
hash verification
engine computations
```

## Integration tests

Test:

```text
FastAPI ↔ PostgreSQL
FastAPI ↔ ClickHouse
Evidence ingestion → database
Engine → signal persistence
Signal → finding generation
Finding → remediation
Remediation → verification
Audit creation
```

## End-to-end test

```text
Login
  ↓
Overview
  ↓
CSE
  ↓
Analysis Signal
  ↓
Evidence Drawer
  ↓
Finding
  ↓
Validate
  ↓
Remediation
  ↓
Verification
  ↓
Audit Ledger
```

---

# 64. API Documentation

FastAPI should expose:

```text
/docs
/redoc
/openapi.json
```

The OpenAPI contract must be version-controlled and reviewed whenever frontend response structures change.

---

# 65. Seed Data for Prototype

Use deterministic seed data rather than random values.

Required relationships:

```text
CSE-014
  ├── CTRL-07
  │     ├── EV-1042
  │     │     └── SIG-2004
  │     │             └── FND-021
  │     │                    └── RM-008
  │     │                           └── VR-004
  │
  └── additional evidence/signals
```

This lets every frontend drawer and drilldown demonstrate a complete traceable workflow.

---

# 66. Definition of Done

The backend is considered integrated only when:

### Authentication

```text
[ ] Login works
[ ] /auth/me works
[ ] Unauthorized routes are blocked
[ ] Role permissions work
```

### Overview

```text
[ ] 5 KPIs are backend-driven
[ ] Priority feed is backend-driven
[ ] CSE grid is backend-driven
[ ] Engine distribution is backend-driven
```

### Supervision

```text
[ ] CSE list loads from API
[ ] CSE detail loads from API
[ ] Expected vs observed data is real
```

### Assessment

```text
[ ] Review queue is backend-driven
[ ] Findings lifecycle works
[ ] Examiner actions work
[ ] Decision history persists
```

### Evidence

```text
[ ] Evidence search works
[ ] Filters work
[ ] Evidence hash is stored
[ ] Provenance is visible
[ ] Evidence-to-control links work
```

### Analysis

```text
[ ] Analysis hub loads dynamically
[ ] All 10 engines are registered
[ ] Engine APIs exist
[ ] Signal drawer loads backend data
[ ] Engine version is visible/auditable
```

### Sampling

```text
[ ] Sample run can be generated
[ ] Parameters are stored
[ ] Sample items are persisted
[ ] Export works
```

### Remediation

```text
[ ] Open actions load
[ ] Verification gates load
[ ] Reopened/regression items load
[ ] Lifecycle transitions are enforced
```

### Governance

```text
[ ] Audit ledger is append-only
[ ] User administration is protected
[ ] CSE access is enforced
[ ] Control library is persisted
[ ] System versions are persisted
```

### Graph

```text
[ ] CSE/control/evidence/signal/finding relationships render
[ ] Graph nodes are clickable
[ ] Graph links resolve to detail APIs
```

---

# 67. Recommended Implementation Order

## Phase 1 — Backend foundation

```text
FastAPI
PostgreSQL
Alembic
Pydantic schemas
auth
RBAC
logging
health checks
```

## Phase 2 — Core supervisory data

```text
CSE
controls
evidence
findings
remediation
verification
audit
```

## Phase 3 — Frontend integration

```text
overview
cses
findings
evidence
remediation
governance
```

## Phase 4 — Analytical platform

```text
ClickHouse
canonical events
analysis orchestrator
signal persistence
```

## Phase 5 — Ten engines

```text
execution-gap
negative-space
coverage
process
investigation-quality
behavioural
historical
peer
consistency
metric-integrity
```

## Phase 6 — Advanced capabilities

```text
evidence fusion
sampling
graph
process mining
large-scale analysis
model/version management
```

---

# 68. Final Backend Contract

The SAT-SA backend should be understood as seven connected layers:

```text
LAYER 1 — ACCESS
Authentication + RBAC + CSE scope

LAYER 2 — DATA
CSEs + Controls + Evidence + Cases + Audit

LAYER 3 — NORMALIZATION
Raw SOC evidence → Canonical events

LAYER 4 — ANALYTICS
10 analytical engines

LAYER 5 — FUSION
Signals + Evidence + Context → Finding Candidate

LAYER 6 — EXAMINATION
Human review + validation + qualification + rejection + override

LAYER 7 — FOLLOW-THROUGH
Remediation + Verification + Governance
```

The complete supervisory chain is:

```text
SOC Evidence
     ↓
Evidence Validation
     ↓
Canonical Events
     ↓
Expected vs Observed
     ↓
10 Analytical Engines
     ↓
Signals
     ↓
Evidence Fusion
     ↓
Finding Candidate
     ↓
Examiner Workspace
     ↓
Human Decision
     ↓
Remediation
     ↓
Verification
     ↓
Audit Ledger
```

This preserves the frontend's progressive-disclosure workflow while giving every screen a persistent backend source of truth.

---

# 69. Frontend Compatibility Notes

The frontend specification already establishes:

- the route hierarchy,
- the 10 analytical engines,
- finding/remediation/evidence lifecycle semantics,
- shared entity relationships,
- centralized application state,
- and the expected detail drawers/modals.

Those frontend contracts should be treated as the stable integration boundary. fileciteturn1file0L22-L65

The frontend build and lint baseline is already reported as clean (`tsc -b && vite build`, followed by `oxlint` with zero errors across 77 files), so backend work should focus on replacing data sources and wiring interactions without unnecessarily changing the established UI contract. fileciteturn1file0L239-L248

---

# 70. Immediate Implementation Target

For the current prototype, the backend should first make this exact path fully real:

```text
Login
  ↓
Overview
  ↓
CSE Assessments
  ↓
CSE Detail
  ↓
Analysis
  ↓
Signal
  ↓
Evidence
  ↓
Finding
  ↓
Examiner Decision
  ↓
Remediation
  ↓
Verification
  ↓
Audit
```

Once this vertical slice is working with PostgreSQL-backed data and real API calls, the remaining engines and analytical capabilities can be added behind the same frontend contract.

