# SAT-SA Synthetic Demonstration Dataset Documentation

## Overview

The SAT-SA application runs on a complete, deterministic, synthetic supervisory demonstration dataset in the backend database (SQLite/PostgreSQL) and Parquet telemetry vault.

**Environment & Classification:** `DEMONSTRATION ENVIRONMENT • SYNTHETIC DATA (NON-PRODUCTION)`  
All records represent synthetic supervisory test fixtures and deliberately do **not** reflect real critical sector entity (CSE) operational data.

---

## 1. Quick Start & CLI Commands

The seeding mechanism is located at [`backend/scripts/seed_demo.py`](file:///home/kunal/157/Supervisory-Analytical-Tool/backend/scripts/seed_demo.py) (and [`backend/scripts/seed_demo_data.py`](file:///home/kunal/157/Supervisory-Analytical-Tool/backend/scripts/seed_demo_data.py)).

### Seed Database
Populates the database, runs the ingestion pipeline, stores Parquet files, and executes all analytical engines:
```bash
cd backend
python scripts/seed_demo.py --seed
```

### Reset Database
Cleans all demonstration tables while preserving database schema and administrative users:
```bash
cd backend
python scripts/seed_demo.py --reset
```

### Full Clean Seed & Verification
Resets, seeds, and runs automated relational integrity checks:
```bash
cd backend
python scripts/seed_demo.py --reset --seed --verify
```

---

## 2. Synthetic Entity (CSE) Cohort

| CSE ID | Synthetic Name | Sector | Tier | Claimed Cap | Observed Cap | Readiness | Priority | Supervisory Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CSE-014** | **Western Grid Operations** | Energy | TIER-1 | 24 | 19 | 71.0% | HIGH | Under Review |
| **CSE-021** | **Northstar Telecom Operations** | Telecommunications | TIER-1 | 24 | 22 | 88.0% | LOW | Monitoring |
| **CSE-031** | **Metro Financial Infrastructure** | Financial Services | TIER-1 | 24 | 23 | 94.0% | LOW | Monitoring |
| **CSE-044** | **National Health Network Operations** | Critical Services | TIER-1 | 20 | 15 | 62.0% | HIGH | Review Required |
| **CSE-008** | **National Clearing & Settlement Exchange** | Financial Services | TIER-1 | 24 | 23 | 92.5% | LOW | Monitoring |
| **CSE-022** | **Metropolitan Transit Automated Signaling System** | Transportation | TIER-2 | 20 | 14 | 58.0% | CRITICAL | Review Required |

---

## 3. Longitudinal Assessment Cycles

To support genuine **Historical Comparison** and **Control Drift Analysis**, multi-quarter cycles are seeded for primary entity `CSE-014`:

| Cycle ID | Period | Status | Readiness | Controls Assessed | Longitudinal Phase |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ASM-2026-Q1` | 2026-Q1 | COMPLETED | 76.5% | 18 | **Baseline**: Moderate issue state |
| `ASM-2026-Q2` | 2026-Q2 | COMPLETED | 91.5% | 22 | **Improvement**: Post-remediation uplift |
| `AC-2026-Q3-014` | 2026-Q3 | IN_PROGRESS | 68.2% | 19 | **Regression / Drift**: -23.3% performance degradation |

---

## 4. Control Library & Operational Rules

### Core Controls
- **`CTRL-07`**: Continuous Security Monitoring & Alert Triage (`SOC.MON.07`, HIGH) — Requires 24x7 monitoring and 15-minute triage SLA for High/Critical tier telemetry.
- **`CTRL-12`**: Critical Incident Escalation & Response Timeliness (`SOC.ESC.12`, HIGH) — Critical incidents must be escalated within 30 minutes with cryptographic dispatch proof (`ESC-221`).
- **`CTRL-18`**: Security Log Coverage & Critical OT Telemetry (`SOC.LOG.18`, MEDIUM) — Critical infrastructure and SCADA HMIs must stream continuous telemetry feeds.
- **`CTRL-01`**: Log Source Completeness & Ingestion Integrity (`SOC.LOG.01`, CRITICAL) — Perimeter firewalls and gateways must stream signed logs.
- **`CTRL-04`**: Incident Escalation & Playbook Execution Conformance (`SOC.PRC.04`, HIGH) — Strict conformance to Process Workflow Playbook `PW-04`.

### Operational Rules (`RuleVersion`)
- **`RULE-001`**: HIGH alert must be triaged within 15 minutes (`CTRL-07`)
- **`RULE-002`**: CRITICAL incident must be escalated within 30 minutes (`CTRL-12`)
- **`RULE-003`**: Critical OT segments should have continuous telemetry (`CTRL-18`)
- **`RULE-004`**: Reported SLA metrics should reconcile with raw event-derived values within ±2.0% (`CTRL-07`)

---

## 5. End-to-End Analytical Scenarios

### Scenario A — Execution Gap (`SIG-2004`, `SIG-EG-01`)
- **Expected**: Mandatory Tier-2 regulatory dispatch (`ESC-221`) transmitted within 30m of critical grid alarm `ALR-7002`.
- **Observed**: Incident `CASE-3002` triaged locally and closed without outbound SOAR dispatch record.
- **Result**: Execution Gap Signal emitted, feeding Finding `FND-0142` and Remediation `REM-0038`.

### Scenario B — Negative Space (`SIG-2005`)
- **Expected**: Outbound escalation evidence submitted into statutory channel.
- **Observed**: Telemetry void across 30m window; packet `ESC-221` has status `NOT_SUBMITTED`.
- **Result**: Negative space signal confirming complete absence of expected statutory submission.

### Scenario C — Process Deviation (`SIG-2007`)
- **Expected**: Playbook sequence `Alert -> Triage -> Investigation -> Containment -> Escalation -> Closure`.
- **Observed**: `CASE-3002` bypassed Containment step directly into Closure.
- **Result**: Petri net process non-conformance flag under Playbook `PW-04`.

### Scenario D — Coverage Gap & Capability Discrepancy (`SIG-2006`, `SIG-CD-01`)
- **Declared**: Capability `CAP-003` claims 100% continuous telemetry across all OT segments.
- **Observed**: Physical telemetry feeds exist only on `SEGMENT-OT-03` and `SEGMENT-OT-04`. Primary SCADA HMIs (`ASSET-HMI-21`, `ASSET-HMI-22`) operate in an unmonitored blind spot.
- **Result**: Coverage signal and Capability Discrepancy signal.

### Scenario E — Metric Integrity Discrepancy (`SIG-2008`)
- **Reported**: Self-reported triage SLA compliance `MET-003` claims 96.0%.
- **Derived**: Empirical event reconstruction from case timestamps proves actual compliance is 71.4%.
- **Result**: Metric Integrity signal with 24.6% non-conformance delta.

### Scenario F — Cross-Source Inconsistency (`SIG-CSC-01`)
- **Observation**: Ticket `TKT-8002` timestamp (`16:22:18Z`) precedes SIEM detection alert `ALR-7006` (`16:23:22Z`) by 64 seconds.
- **Result**: Inconsistency signal highlighting backdated ticketing or clock skew.

---

## 6. Page-by-Page Data Mapping

| Sidebar Page | Route | Backend Source / API | Seeded Data Elements |
| :--- | :--- | :--- | :--- |
| **Overview** | `/overview` | `GET /api/v1/overview` | Dynamic portfolio KPIs: 6 CSEs, 8 priority signals, 78% readiness, 2 open findings, 3 open remediations, engine breakdown |
| **CSE Assessments** | `/assessments` | `GET /api/v1/cses`, `GET /api/v1/assessments` | 6 CSEs across Energy, Telecom, Finance, Health, Transport; multi-cycle dropdowns (Q1, Q2, Q3) |
| **Review Queue** | `/review` | `GET /api/v1/review/queue` | 5 findings across all priority tiers (Critical, High, Low) and statuses (`CANDIDATE`, `UNDER_REVIEW`, `VALIDATED`) |
| **Sampling** | `/sampling` | `GET /api/v1/sampling` | Run `SRUN-2026-001` with 6 items (`SMP-001` to `SMP-006`) covering Risk, Evidence, Anomaly, Recurrence, Coverage, Baseline Random |
| **Analysis Hub** | `/analysis` | `GET /api/v1/analysis/engines` | Metadata, runtime status, and signal counts for all 10 analytical engines |
| **Execution Gap** | `/analysis/execution-gap` | `GET /api/v1/analysis/engines/execution-gap` | Live signals `SIG-2004`, `SIG-EG-01` comparing declared vs observed SLA |
| **Negative Space** | `/analysis/negative-space` | `GET /api/v1/analysis/engines/negative-space` | Missing escalation packet `ESC-221` with `NOT_SUBMITTED` state |
| **Coverage & Blind Spots** | `/analysis/coverage` | `GET /api/v1/analysis/engines/coverage` | Unmonitored segments `SEGMENT-OT-01`, `SEGMENT-OT-02` against assets `ASSET-HMI-21/22` |
| **Process Conformance** | `/analysis/process` | `GET /api/v1/analysis/engines/process` | Playbook `PW-04` compliance and bypassed containment step in `CASE-3002` |
| **Investigation Quality** | `/analysis/investigation-quality` | `GET /api/v1/analysis/engines/investigation-quality` | Forensic depth analysis across 9 cases, flagging shallow investigations and missing evidence |
| **Behavioural Deviation** | `/analysis/behavioural` | `GET /api/v1/analysis/engines/behavioural` | Off-shift login anomaly (22:00-06:00 UTC) from analyst authentication Parquet telemetry |
| **Historical Comparison** | `/analysis/historical` | `GET /api/v1/analysis/engines/historical` | -23.3% performance degradation computed across Q1 (76.5%), Q2 (91.5%), Q3 (68.2%) |
| **Peer Benchmarking** | `/analysis/peer` | `GET /api/v1/analysis/engines/peer` | CSE-014 (79.2%) vs authorized TIER-1 peer cohort median (94.0%) across N=3 peers |
| **Cross-Source Consistency**| `/analysis/consistency` | `GET /api/v1/analysis/engines/consistency` | 64s timestamp mismatch between ticketing record and SIEM alert |
| **Metric Integrity** | `/analysis/metric-integrity` | `GET /api/v1/analysis/engines/metric-integrity` | 96.0% self-reported SLA vs 71.4% raw event-derived SLA |
| **Findings** | `/findings` | `GET /api/v1/findings` | 5 findings covering `CANDIDATE`, `UNDER_REVIEW`, `VALIDATED`, `QUALIFIED`, `REJECTED` with examiner decisions |
| **Evidence Explorer** | `/evidence` | `GET /api/v1/evidence` | 5 primary evidence items (`EV-1042` - `EV-1046`, `ESC-221`) with SHA-256 hashes, provenance, and custody chains |
| **Remediation** | `/remediation` | `GET /api/v1/remediation` | 4 mandates (`REM-0038`, `REM-0042`, `REM-0050`, `REM-0055`) covering `OPEN`, `UNDER_VERIFICATION`, `CLOSED`, `REOPENED` |
| **Governance** | `/governance` | `GET /api/v1/governance/*` | Core Controls, Rules (`RULE-001` - `004`), System Versions, Model Versions, and 23 Audit Events |

---

## 7. Examiner Adjudication Walkthrough

1. **Log In**: Open frontend, authenticate as Lead Supervisor (`lead_supervisor` / `Supervisor@2026!`) or Lead Examiner (`lead_examiner` / `Examiner@2026!`).
2. **Review Overview**: Observe 6 assessed CSEs, high-priority feed, and readiness indicators.
3. **Open Review Queue**: Navigate to `/review`, click on finding `FND-0142` (Execution Gap).
4. **Inspect Evidence & Signals**: Examine What, Why, Signals (`SIG-2004`), and Proof (`EV-1042`, `ESC-221`).
5. **Adjudicate**: Execute Confirm/Validate or Qualify decision. The action appends an immutable entry to the append-only audit ledger (`/governance`).
6. **Inspect Remediation**: Navigate to `/remediation`, view mandate `REM-0038` and associated verification gates (`VRF-0038`).
7. **Trace Historical Drift**: Open `/analysis/historical` to view longitudinal drift from Q1 to Q3.
