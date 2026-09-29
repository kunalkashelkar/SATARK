# SAT-SA: Standardized REST API Specification

**Base URL**: `http://localhost:8001/api/v1`  
**Authentication Scheme**: HTTP Bearer JWT (`Authorization: Bearer <token>`)

---

## 1. Authentication (`/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/auth/login` | Authenticate with username and password, returns JWT token and user profile. | Public |
| `GET` | `/auth/me` | Retrieve active authenticated session and enclave role. | Authenticated |
| `POST` | `/auth/refresh` | Refresh an expiring session token. | Authenticated |
| `POST` | `/auth/logout` | Revoke session and record audit event. | Authenticated |

---

## 2. Supervisory Overview (`/overview`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/overview` | Returns aggregate portfolio metrics, critical sector health, engine distribution, and high-priority findings feed. | Authenticated |

---

## 3. Critical Sector Entities (`/cses`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/cses` | Query regulated entities with filtering by sector, tier, readiness, and supervisory priority. | Authenticated |
| `GET` | `/cses/{cse_id}` | Retrieve comprehensive detail profile for a single CSE. | Authenticated |
| `GET` | `/cses/{cse_id}/readiness` | Retrieve evidence readiness metrics and statutory submission progress. | Authenticated |

---

## 4. Analytical Engines & Signals (`/analysis`, `/signals`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/analysis/hub/metrics` | Centralized aggregate KPI counts across all 10 analytical engines. | Authenticated |
| `GET` | `/analysis/engines` | Authoritative catalog of all 10 decoupled analytical engines. | Authenticated |
| `GET` | `/analysis/engines/{slug}/signals` | Retrieve signals detected by a specific analytical engine. | Authenticated |
| `GET` | `/signals` | Retrieve all signals generated across engines. | Authenticated |
| `GET` | `/signals/{signal_id}` | Full signal workspace including supporting evidence, expected vs observed, and control context. | Authenticated |

---

## 5. Findings & Human Adjudication (`/findings`, `/review`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/findings` | Retrieve filterable supervisory findings queue. | Authenticated |
| `GET` | `/findings/{finding_id}` | Retrieve finding details and relational evidence linkage. | Authenticated |
| `GET` | `/findings/{finding_id}/workspace` | Examiner workspace with expected vs observed states and decision history. | Authenticated |
| `POST` | `/findings/{finding_id}/validate` | Human decision: Validate candidate finding. | Examiner / Supervisor |
| `POST` | `/findings/{finding_id}/qualify` | Human decision: Formally qualify finding for remediation mandate under Sec 70B. | Supervisor |
| `POST` | `/findings/{finding_id}/reject` | Human decision: Reject finding (false positive/maintenance). | Examiner / Supervisor |
| `POST` | `/findings/{finding_id}/override` | Human decision: Override model score or weight. | Supervisor |
| `POST` | `/findings/{finding_id}/evidence-demand` | Issue formal statutory evidence demand to CSE. | Examiner / Supervisor |

---

## 6. Evidence Vault & Integrity (`/evidence`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/evidence` | Query paginated evidence records with provenance, status, and control links. | Authenticated |
| `GET` | `/evidence/{id}` | Full evidence detail including custody chain and SHA-256 hash. | Authenticated |
| `POST` | `/evidence` | Ingest new canonical evidence record. | Authenticated |
| `POST` | `/evidence/{id}/validate` | Validate evidence submission against technical requirements. | Examiner |
| `GET` | `/evidence/{id}/integrity` | Cryptographic integrity verification against on-disk Parquet artifact. | Authenticated |

---

## 7. Supervisory Sampling (`/sampling`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/sampling` | List recommended and selected supervisory sampling items. | Authenticated |
| `POST` | `/sampling/runs` | Execute stratified, reproducible supervisory sampling run. | Supervisor |
| `GET` | `/sampling/runs/{run_id}` | Retrieve sampling run parameters and sample items. | Authenticated |
| `GET` | `/sampling/runs/{run_id}/export` | Export sampling run items as CSV. | Authenticated |
| `POST` | `/sampling/items/{id}/toggle` | Toggle sample item between RECOMMENDED and SELECTED. | Examiner / Supervisor |

---

## 8. Remediation & Verification (`/remediation`, `/verification`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/remediation` | Query remediation mandates and corrective progress. | Authenticated |
| `GET` | `/remediation/{id}` | Detailed remediation mandate profile, milestones, and artifacts. | Authenticated |
| `POST` | `/remediation` | Create statutory remediation mandate. | Supervisor |
| `POST` | `/remediation/{id}/submit` | Submit corrective telemetry artifact with cryptographic SHA-256 digest. | Authenticated |
| `POST` | `/remediation/{id}/reopen` | Reopen mandate when submitted proof is deficient or regression detected. | Supervisor |
| `GET` | `/verification` | List statutory verification results and gate assessments. | Authenticated |
| `GET` | `/verification/{id}` | Verification checklist and gate status. | Authenticated |
| `POST` | `/verification/{id}/gates/{gate_id}/verify` | Evaluate and toggle individual verification gate. | Examiner |
| `POST` | `/verification/{id}/seal` | Formally seal verification record with immutable SHA-256 hash. | Supervisor |

---

## 9. Governance & Administration (`/governance`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/governance/audit` | Query append-only, cryptographic audit ledger. | Authenticated |
| `GET` | `/governance/users` | List system operators and role permissions. | Admin / Supervisor |
| `POST` | `/governance/users` | Provision new enclave user. | Admin |
| `GET` | `/governance/controls` | Query supervisory control library. | Authenticated |
| `GET` | `/governance/versions` | List deployed system releases and reproducibility hashes. | Authenticated |

---

## 10. Topological Knowledge Graph (`/graph`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/graph` | Multi-layer topological network graph linking CSEs, Controls, Evidence, Signals, Findings, and Remediations. | Authenticated |
