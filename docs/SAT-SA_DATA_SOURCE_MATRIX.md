# SAT-SA Authoritative Data Source Matrix

This document maps every operational field displayed across the frontend application to its authoritative backend API endpoint, backend service, database table, and dynamic analytical calculation.

No operational values in the website are invented, randomized, or hardcoded. When database records are not present, components render clean zero/empty states.

---

| Page | Component | Displayed Field | Frontend Variable | API Endpoint | Backend Service | Database / Analytical Source | Calculation / Derivation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Overview** (`/overview`) | KPI Card | CSEs Assessed | `metrics.csesAssessed` | `GET /api/v1/overview` | `SupervisoryService.get_overview` | `cses` table | `COUNT(cses.id)` |
| **Overview** (`/overview`) | KPI Card | High-Priority Signals | `metrics.highPrioritySignals` | `GET /api/v1/overview` | `SupervisoryService.get_overview` | `signals`, `findings` tables | `COUNT(priority IN ('CRITICAL', 'HIGH'))` |
| **Overview** (`/overview`) | KPI Card | Evidence Readiness | `metrics.evidenceReadiness` | `GET /api/v1/overview` | `SupervisoryService.get_overview` | `cses` table | `AVG(cses.evidence_readiness)` |
| **Overview** (`/overview`) | KPI Card | Open Findings | `metrics.openFindings` | `GET /api/v1/overview` | `SupervisoryService.get_overview` | `findings` table | `COUNT(status IN ('CANDIDATE', 'UNDER_REVIEW'))` |
| **Overview** (`/overview`) | KPI Card | Open Remediation | `metrics.openRemediation` | `GET /api/v1/overview` | `SupervisoryService.get_overview` | `remediations` table | `COUNT(status IN ('OPEN', 'IN_PROGRESS', 'UNDER_VERIFICATION', 'REOPENED'))` |
| **Overview** (`/overview`) | Priority Feed | Top Attention Items | `findings` slice / `data.priority_feed` | `GET /api/v1/overview` | `SupervisoryService.get_overview` | `findings` table | `SELECT * FROM findings WHERE priority IN ('CRITICAL', 'HIGH') AND status != 'REJECTED' ORDER BY updated_at DESC LIMIT 5` |
| **Overview** (`/overview`) | Chart / Engine Breakdown | Distribution Bar Chart | `metrics.signalDistribution` | `GET /api/v1/overview` | `SupervisoryService.get_overview` | `findings`, `signals` tables | Grouped by `signal_type` across active records |
| **Overview** (`/overview`) | Posture Card | Expected vs Observed Gap | `metrics.expectedVsObservedMetrics` | `GET /api/v1/overview` | `SupervisoryService.get_overview` | `cses`, `findings` tables | Dynamic gap percentage calculated from mandated threshold (95%) minus observed telemetry |
| **Overview** (`/overview`) | Posture Card | Evidence Readiness & Integrity | `metrics.evidenceQuality` | `GET /api/v1/overview` | `SupervisoryService.get_overview` | `evidence` table | Validated FIPS SHA-256 digests count / total evidence records count |
| **CSE List** (`/supervision/cses`) | Data Table | CSE Public ID | `cse.cseId` | `GET /api/v1/cses` | `CSEService.get_all` | `cses.public_id` | Direct database column |
| **CSE List** (`/supervision/cses`) | Data Table | CSE Name & Sector | `cse.cseName`, `cse.sector` | `GET /api/v1/cses` | `CSEService.get_all` | `cses.name`, `cses.sector` | Direct database column |
| **CSE List** (`/supervision/cses`) | Data Table | Evidence Readiness Bar | `cse.evidenceReadiness` | `GET /api/v1/cses` | `CSEService.get_all` | `cses.evidence_readiness` | Ingested evidence ratio per entity |
| **CSE List** (`/supervision/cses`) | Data Table | Primary Signal | `cse.primarySignal` | `GET /api/v1/cses` | `CSEService.get_all` | `findings`, `signals` tables | Top unresolved signal type for the entity |
| **CSE Detail** (`/supervision/cses/:id`) | Header & Badges | Entity Metadata | `cse.sector`, `cse.socType`, `cse.status` | `GET /api/v1/cses/{id}` | `CSEService.get_by_public_id` | `cses` table | Authoritative CSE record |
| **CSE Detail** (`/supervision/cses/:id`) | Capability Card | Claimed vs Observed Capability | `cse.claimedCapability`, `cse.observedCapability` | `GET /api/v1/cses/{id}` | `CSEService.get_by_public_id` | `cses`, `controls`, `evidence` | Controls attested vs controls verified via telemetry |
| **CSE Detail** (`/supervision/cses/:id`) | Process Snapshot | Alerts, Cases, Investigations, Responses, Closures | `evidenceCounts.*` | `GET /api/v1/evidence?cse_id={id}` | `EvidenceService.get_all` | `evidence` table | `COUNT(record_type)` for specific entity |
| **Review Queue** (`/review/findings`) | Summary Cards | Active Inquiries Count | `summaryCounts.totalRequiringReview` | `GET /api/v1/findings` | `FindingService.get_all` | `findings` table | `COUNT(status IN ('CANDIDATE', 'UNDER_REVIEW'))` |
| **Review Queue** (`/review/findings`) | Data Table | Finding Attributes | `f.id`, `f.title`, `f.priority`, `f.status` | `GET /api/v1/findings` | `FindingService.get_all` | `findings` table | Real supervisory findings from DB |
| **Examiner Workspace** (`/findings/:id`) | Detail Panels | Why Flagged, Expected, Observed, Difference | `finding.whyFlagged`, `finding.expected`, `finding.observed` | `GET /api/v1/findings/{id}/workspace` | `FindingService.get_workspace` | `findings`, `controls`, `signals` | Computed analytical deviation from baseline |
| **Examiner Workspace** (`/findings/:id`) | Decision Form | Adjudication Action & Note | `updateFindingDecision()` | `POST /api/v1/findings/{id}/adjudicate` | `FindingService.adjudicate` | `findings`, `audit_events` | Immutable state mutation and audit logging |
| **Analysis Hub** (`/analysis`) | KPI Cards | Total Signals, Critical Signals, Active Engines | `hubMetrics.*` | `GET /api/v1/analysis/hub/metrics` | `engine_registry.list_engines` | `signals`, `findings` tables | Dynamic aggregation across analytical engines |
| **Engine Detail** (`/analysis/:slug`) | Signal Grid & Drawer | Engine Signals | `backendSignals` | `GET /api/v1/analysis/engines/{slug}/signals` | `engine_registry.execute_engine` | Analytical engine run | Real engine-computed telemetry signals |
| **Evidence Vault** (`/evidence`) | KPI Cards | Total, Ready, Review Required | `summaryCounts.*` | `GET /api/v1/evidence` | `EvidenceService.get_all` | `evidence` table | `COUNT(*)` grouped by validation status |
| **Evidence Vault** (`/evidence`) | Table & Drawer | SHA-256 Digest & Custody | `item.hash`, `item.provenance` | `GET /api/v1/evidence/{id}` | `EvidenceService.get_by_id` | `evidence`, `evidence_provenance` | Cryptographic SHA-256 and enclave custody record |
| **Sampling** (`/sampling`) | Summary Cards | Stratified Sample Pool | `samples.length`, `summaryCounts.*` | `GET /api/v1/sampling` | `SupervisoryService.get_sampling_items` | `sampling_items` table | Authoritatively generated stratified cases |
| **Remediation** (`/remediation`) | Stage Tabs | Open Mandates, Verifications, Regressions | `remediations`, `verifications`, `regressions` | `GET /api/v1/remediation`, `GET /api/v1/remediation/verifications` | `SupervisoryService.list_remediations` | `remediations`, `verification_results` | Live lifecycle stages from database |
| **Governance** (`/governance`) | Audit Ledger | Immutable Audit Records | `auditTrail` | `GET /api/v1/governance/audit` | `AuditService.get_events` | `audit_events` table | Append-only ledger of all mutations |
| **Governance** (`/governance`) | Administration | Users, Roles, Access Rules | `users`, `roles`, `cseAccessRules` | `GET /api/v1/governance/users`, `roles`, `access-rules` | `GovernanceService` | `users`, `user_roles`, `cse_access_rules` | Authoritative security administration records |
| **Evidence Graph** (`/graph`) | Interactive Topology | Topology Nodes & Edges | `apiNodes`, `apiLinks` | `GET /api/v1/graph?cse_id={id}` | `GraphService.build_topology` | `cses`, `controls`, `evidence`, `signals`, `findings`, `remediations` | Relational database graph projection |
| **Navigation / Topbar** | Topbar Badge & Dropdown | Active Entity Count | `cses.length` | `GET /api/v1/cses` | `CSEService.get_all` | `cses` table | `COUNT(cses.id)` |
