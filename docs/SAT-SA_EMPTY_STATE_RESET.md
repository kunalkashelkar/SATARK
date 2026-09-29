# SAT-SA Complete Operational Data Reset Specification & Report

## Executive Summary

The **Supervisory Analytics Tool for SOC Assessment (SAT-SA)** has undergone a **Complete Operational Data Reset**. The prototype starts in a pristine, zero-operational-record state:
- **0** Critical Sector Entities (CSEs) assessed
- **0** Operational evidence files ingested
- **0** Analytical signals produced
- **0** Supervisory findings (Candidate, Under Review, Validated, Qualified, Rejected, Overridden)
- **0** Remediation mandates
- **0** Verification gates / results
- **0** Sampling runs / items
- **0** Operational audit events
- **0** Operational topology graph relationships / disconnected controls

No pre-seeded dummy operational information appears anywhere on the user interface.

---

## 1. Operational Tables Reset Order

The reset script [`scripts/reset_operational_data.py`](file:///home/kunal/157/Supervisory-Analytical-Tool/scripts/reset_operational_data.py) executes safe, dependency-ordered deletions preserving foreign key integrity without using arbitrary `DROP TABLE` or blanket `TRUNCATE CASCADE`:

```
1. verification_gates
2. verification_results
3. remediation_findings
4. remediations
5. sampling_items
6. sampling_runs
7. finding_evidence_links
8. finding_signal_links
9. findings
10. signal_evidence_links
11. signals
12. fused_assessment_contexts
13. analytical_signals
14. analysis_jobs
15. evidence_control_links
16. evidence_provenance
17. evidence
18. operational_cases
19. reported_soc_metrics
20. declared_capabilities
21. assets
22. ingestion_jobs
23. control_applicability
24. assessment_cycles
25. cses
26. audit_events (operational records only)
```

### Strictly Preserved Core Schema & Configuration
The following systemic and administrative configurations are untouched:
- **Users**: Authentication profiles (`lead_supervisor`, `lead_examiner`, test accounts)
- **Roles & Permissions**: Full RBAC role hierarchies (`SUPERVISOR`, `EXAMINER`, `AUDITOR`, `ADMIN`, `ANALYST`)
- **Statutory Controls**: Regulatory control library (`CTRL-01` through `CTRL-15`, NCIIPC-CSF baseline)
- **System Versions**: Component versions (`SystemVersion`, `RuleVersion`, `ModelVersion`)
- **Engine Registry**: All 10 analytical engine definitions remain active and registered.

---

## 2. Analytical & Telemetry Storage Reset

- **ClickHouse / DuckDB**: Telemetry buffers for operational cases, EDR signals, and gateway telemetry are purged on reset.
- **Runtime Evidence Storage**: Runtime evidence directory `backend/data/evidence/` is cleared of uploaded artifacts.
- **Source Synthetic Dataset Preserved**: The synthetic evidence package in `data/synthetic_dataset/` remains intact outside the runtime folder. It only enters the system when explicitly uploaded through the Multi-File Upload interface or executed via `POST /api/v1/ingestion/run`.

---

## 3. Frontend Zero-State & Fallback Removal

All hardcoded dummy entity references and fallback mock datasets were removed from frontend components:
- **Context Baseline**: Initial active entity identifiers in [`SupervisoryContext.tsx`](file:///home/kunal/157/Supervisory-Analytical-Tool/frontend/src/context/SupervisoryContext.tsx) initialized to empty strings `""` (no default `CSE-014` or `FND-0142`).
- **Dashboard `/overview`**:
  - `csesAssessed`: 0
  - `highPrioritySignals`: 0
  - `evidenceReadiness`: 0%
  - `openFindings`: 0
  - `openRemediation`: 0
  - Priority Attention: `"No items require examiner review."`
  - CSE Status Grid: Empty state
  - Signal Summary: `"No analytical signals available."`
  - Recommended Sampling: `"No sampling runs or candidate cases available."`
- **Supervisory Evidence Graph `/graph`**:
  - Pruned isolated control nodes when no operational entities exist (`0 nodes, 0 edges`).
  - Empty state canvas rendered with clear guidance: `"No Graph Relationships Available"`.
  - Inspector pane gracefully handles empty state: `"No Node Selected"`.
- **CSE Detail `/supervision/cses/:id`**: Returns 404 / clean empty state when entity does not exist.
- **Examiner Workspace `/review/:findingId`**: Gracefully displays `"No finding selected"` / `"Finding not found"`.

---

## 4. Execution & Verification

### Running the Operational Reset
```bash
python scripts/reset_operational_data.py
```

### Ingestion → Repopulation Workflow
1. User navigates to **Data Ingestion** or executes `POST /api/v1/ingestion/upload` / `POST /api/v1/ingestion/run`.
2. Evidence files are cryptographically digested (SHA-256), validated, and written to database tables.
3. Analytical engines can now run against ingested data via `POST /api/v1/analysis/:slug/run`.
4. Analytical signals, findings, and graph topologies populate automatically based exclusively on ingested evidence.
