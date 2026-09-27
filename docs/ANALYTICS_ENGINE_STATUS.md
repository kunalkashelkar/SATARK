# Analytical Engine Status — SAT-SA (Supervisory Analytical Tool)

This document details the operational status, input sources, analytical outputs, automated verification results, and known limitations for all ten supervisory analytical engines integrated into the SAT-SA platform.

All engines operate against the ingested synthetic SOC dataset (`01_CSE_Assessment_Master.json` through `15_Expected_Operational_Rules.json`), utilizing DuckDB Parquet querying alongside relational PostgreSQL / SQLite metadata.

---

## Analytical Engine Summary Matrix

| # | Engine Name | Slug | Version | Status | Primary Inputs | Core Outputs | Test Result | Limitations & Boundary Handling |
|---|---|---|---|---|---|---|---|---|
| **1** | Execution Gap | `execution-gap` | `1.2.4` | **OPERATIONAL** | Control Library (`CTRL-07`, `CTRL-09`), Declared Capabilities (`CAP-EDR-01`, `CAP-FW-01`), Network Gateway Telemetry, SIEM alerts | Execution gap ratio, Control deficit KPI, Capability deficit signals (`SIG-EG-CAP-DEFICIT`), contextual score | **PASSED** (`test_execution_gap_engine_detail`) | Requires declared capabilities table; flags deficit if declared capabilities lack matching telemetry. |
| **2** | Negative Space | `negative-space` | `1.2.4` | **OPERATIONAL** | Operational Cases (`06_Case_Management_Records.csv`), SIEM alerts (`04_SIEM_Alerts.csv`), SLA thresholds | Expected event, window SLA, matched event, absence reason, negative space formulation (`SIG-NS-CASE-3003-TRIAGE`) | **PASSED** (`test_negative_space_engine_detail`) | Dependent on timestamp accuracy in case management records for SLA window calculation. |
| **3** | Coverage & Blind-Spot | `coverage` | `1.2.4` | **OPERATIONAL** | Asset Inventory (`03_Asset_Inventory.csv`), Network Gateway Parquet (`08_Network_Gateway_Telemetry.csv`), Log sources | Asset coverage %, Network segment coverage %, Unmonitored critical OT segment signals (`SIG-COV-SEG-SUBSTATION-OT`) | **PASSED** (`test_coverage_blind_spot_engine_detail`) | Requires defined network segments in asset inventory to identify zero-telemetry blind spots. |
| **4** | Process Conformance | `process` | `1.2.4` | **OPERATIONAL** | Case Event Sequences (`05_Case_Events.csv`), Expected Playbooks (`15_Expected_Operational_Rules.json`), PM4Py / Petri-net | Trace fitness %, Deviation counts, Expected vs Observed traces, missing step signals (`SIG-PRC-PW-04-DEV`) | **PASSED** (`test_process_conformance_engine_detail`) | Requires ordered timestamps in case events log; flags skipped playbook containment actions. |
| **5** | Investigation Quality | `investigation-quality` | `1.2.4` | **OPERATIONAL** | Case Management (`06_Case_Management_Records.csv`), Case Events Parquet (`05_Case_Events.csv`), Raw refs | Dwell time, Artifact collection depth, Triage duration, Shallow inquiry signals (`SIG-IQ-CASE-3003-DEFICIT`), Raw Event Refs | **PASSED** (`test_investigation_quality_engine_detail`) | Relies on forensic artifact logging tags in event logs (`ARTIFACT_COLLECTION`). |
| **6** | Behavioural Deviation | `behavioural` | `1.2.4` | **OPERATIONAL** | Authentication Logs (`10_Authentication_Logs.csv`), Analyst Shifts, Dwell times | Off-shift logins, Dwell anomalies, Z-score deviations, Shift timing signals (`SIG-BH-analyst-03-AUTH-9003`) | **PASSED** (`test_behavioural_deviation_engine_detail`) | Requires standard analyst shift definitions (08:00–18:00 UTC) to identify unforecasted off-hours logins. |
| **7** | Historical Comparison | `historical` | `1.2.4` | **OPERATIONAL** | Assessment Cycles (`AssessmentCycle`), Reported Metrics (`11_Reported_SOC_Metrics.csv`) | Baseline drift, Drift direction (`degrading`), Historical delta KPI, Explicit Insufficient Baseline reporting | **PASSED** (`test_historical_comparison_engine_detail`) | **Non-fabrication guarantee**: If `< 2` historical cycles exist for an entity, explicitly returns `INSUFFICIENT_BASELINE` without fabricating data. |
| **8** | Peer Benchmarking | `peer` | `1.2.4` | **OPERATIONAL** | Ingested CSE Entities (`01_CSE_Assessment_Master.json`), Sector cohorts (Power / Grid) | Anonymized peer cohort percentiles, Entity anonymization, Explicit Insufficient Cohort reporting | **PASSED** (`test_peer_benchmarking_engine_no_leakage`) | **Privacy & non-fabrication guarantee**: If peer population `< 3`, returns `INSUFFICIENT_COHORT`. Strict anonymization prevents peer entity ID leakage. |
| **9** | Cross-Source Consistency | `consistency` | `1.2.4` | **OPERATIONAL** | SIEM Alerts (`04`), Case Management (`06`), Ticketing (`09`), EDR Telemetry (`07`), Gateway Telemetry (`08`) | Classification into `MATCHED`, `PARTIAL_MATCH`, `CONFLICT`, `MISSING_CORRESPONDENCE`, Clock drift signals | **PASSED** (`test_cross_source_consistency_engine_detail`) | Matches cases against ticket IDs; detects detached escalation records and irreconcilable temporal drift. |
| **10** | Metric Integrity | `metric-integrity` | `1.2.4` | **OPERATIONAL** | Reported Metrics (`11_Reported_SOC_Metrics.csv`) vs Underlying Operational Cases & Events | Reported vs Recalculated MTTD, MTTR, SLA compliance %, Recalculation trail, Audit discrepancy signals | **PASSED** (`test_metric_integrity_engine_detail`) | Detects supervisory audit anomalies when reported SOC metrics diverge from underlying telemetry. |

---

## Common Engine Contract Compliance

Every engine conforms to the standardized Python contract:

```python
class AnalyticsEngine(ABC):
    slug: str
    name: str
    version: str
    rule_version: str
    pipeline_version: str

    @abstractmethod
    def compute(self, context: AnalysisContext) -> List[AnalyticsSignalResponse]:
        """Execute calculation over ingested telemetry and generate signals."""
        pass

    @abstractmethod
    def explain(self, signal: AnalyticsSignalResponse) -> str:
        """Provide detailed audit rationale and calculation trail."""
        pass

    @abstractmethod
    def get_kpis(self, signals: List[AnalyticsSignalResponse], context: AnalysisContext) -> List[EngineKPI]:
        """Produce 4 standardized supervisory KPIs."""
        pass
```

### Response Schema Guarantees
Every engine response exposes:
1. **4 KPIs**: Standardized supervisory indicators (`EngineKPI`) with semantic status coloring (`blue`, `red`, `amber`, `neutral`).
2. **Filters & Pagination**: `cse_id`, `priority`, `status`, `start_date`, `end_date`, `page`, `page_size`.
3. **Signals**: Structured findings with evidence references, expected vs observed behaviors, difference categorization, and recommendation flags.
4. **Trend / Comparison**: Comparative historical or peer baseline context when sufficient data exists.
5. **Audit Explanations**: Human-readable explanations including calculation trail and raw event references.
6. **Engine Versioning**: `engine_version`, `rule_version`, `pipeline_version`, and execution timestamps on every signal.

---

## Analysis REST API Specifications

The following endpoints are implemented and fully tested:

- **`GET /api/v1/analysis`**: List metadata, versions, and execution status for all 10 analytical engines.
- **`GET /api/v1/analysis/{engine_slug}`**: Retrieve engine execution results, 4 KPIs, and signals with filtering (`cse_id`, `priority`, `status`, `start_date`, `end_date`, pagination).
- **`POST /api/v1/analysis/{engine_slug}/run`**: Trigger an explicit analytical execution and signal persistence job.
- **`GET /api/v1/analysis/jobs/{job_id}`**: Query job status, execution duration, and result summary.
- **`GET /api/v1/analysis/signals`**: Global repository-wide signals query across all engines.
- **`GET /api/v1/analysis/hub/metrics`**: Summary analytics hub metrics for supervisory dashboard integration.

---

## Automated Verification

The complete engine suite was validated with `pytest -v tests/test_analysis_engines.py` and the full backend suite:

```bash
backend/.venv/bin/pytest tests/test_analysis_engines.py
# 24 passed in 11.89s

backend/.venv/bin/pytest
# 78 passed in 30.25s (100% test pass rate)
```
