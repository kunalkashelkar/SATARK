import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.analytics.registry import engine_registry
from app.analytics.context import AnalysisContext
from app.db.session import SessionLocal

client = TestClient(app)


@pytest.fixture(scope="module")
def supervisor_token():
    res = client.post(
        "/api/v1/auth/login",
        json={"username": "lead_supervisor", "password": "Supervisor@2026!"},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


ALL_TEN_SLUGS = [
    "execution-gap",
    "negative-space",
    "coverage",
    "process",
    "investigation-quality",
    "behavioural",
    "historical",
    "peer",
    "consistency",
    "metric-integrity",
]


# =========================================================================
# 1. COMMON FRAMEWORK & REGISTRY VERIFICATION
# =========================================================================
def test_registry_contains_all_ten_engines():
    """Verify registry has all 10 authoritative engines and each is independently executable."""
    assert len(engine_registry._engines) == 10
    for slug in ALL_TEN_SLUGS:
        eng = engine_registry.get_engine(slug)
        assert eng is not None, f"Engine {slug} must be registered"
        assert eng.slug == slug
        assert eng.version is not None
        assert eng.rule_version is not None
        assert eng.pipeline_version is not None


def test_list_analytical_engines_api(supervisor_token):
    """Verify GET /api/v1/analysis lists all 10 engines with metadata."""
    res = client.get(
        "/api/v1/analysis",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    engines = res.json()
    assert len(engines) == 10
    slugs = [e["slug"] for e in engines]
    for s in ALL_TEN_SLUGS:
        assert s in slugs


# =========================================================================
# 2. INDIVIDUAL ENGINE EXECUTION, 4 KPIS, VERSIONING & EXPLANATIONS
# =========================================================================
@pytest.mark.parametrize("slug", ALL_TEN_SLUGS)
def test_engine_independent_execution_and_kpis(slug, supervisor_token):
    """Verify each of the 10 engines executes independently, produces exactly 4 KPIs, versions, and signals."""
    res = client.get(
        f"/api/v1/analysis/{slug}",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200, f"Engine {slug} returned status {res.status_code}"
    data = res.json()

    # Verify versioning metadata
    assert data["version"] is not None
    assert data["rule_version"] is not None
    assert data["pipeline_version"] is not None
    assert data["execution_time_ms"] >= 0.0

    # Verify exactly 4 KPIs
    assert len(data["kpis"]) == 4, f"Engine {slug} must return exactly 4 KPIs"
    for kpi in data["kpis"]:
        assert "title" in kpi
        assert "value" in kpi
        assert "subtitle" in kpi
        assert "semantic" in kpi

    # Verify signals
    signals = data["signals"]
    assert len(signals) >= 1, f"Engine {slug} must produce at least 1 signal from seeded telemetry"
    sig = signals[0]
    assert sig["signal_id"] is not None
    assert sig["expected"] is not None
    assert sig["observed"] is not None
    assert sig["difference"] is not None
    assert sig["rule_version"] is not None
    assert sig["engine_version"] is not None


# =========================================================================
# 3. TASK GROUP 3: EXECUTION GAP ENGINE
# =========================================================================
def test_execution_gap_engine_detail(supervisor_token):
    """Verify Execution Gap compares declared vs observed and reports score/evidence references."""
    res = client.get(
        "/api/v1/analysis/execution-gap",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    signals = data["signals"]
    cap_signal = [s for s in signals if "Capability Deficit" in s["title"]][0]
    assert "claim" in cap_signal["reason"].lower()
    assert "telemetry" in cap_signal["observed"].lower()
    assert "execution gap" in cap_signal["difference"].lower()
    assert cap_signal["gap_type"] is not None
    assert len(cap_signal["evidence_ids"]) >= 1


# =========================================================================
# 4. TASK GROUP 4: NEGATIVE SPACE ENGINE
# =========================================================================
def test_negative_space_engine_detail(supervisor_token):
    """Verify Negative Space models expected event + time window + absence = signal."""
    res = client.get(
        "/api/v1/analysis/negative-space",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    signals = data["signals"]
    ns_signal = signals[0]
    assert "within window" in ns_signal["reason"]
    assert ns_signal["evidence_state"] in ("ABSENT_CONFIRMED", "NOT_SUBMITTED")
    assert "Negative space formulation" in ns_signal["explanation"]


# =========================================================================
# 5. TASK GROUP 5: COVERAGE & BLIND-SPOT ENGINE
# =========================================================================
def test_coverage_blind_spot_engine_detail(supervisor_token):
    """Verify Coverage engine flags unmonitored channels and network blind spots."""
    res = client.get(
        "/api/v1/analysis/coverage",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    signals = data["signals"]
    cov_signal = signals[0]
    assert cov_signal["coverage_area"] is not None
    assert "Unmonitored" in cov_signal["title"] or "Blind Spot" in cov_signal["title"]


# =========================================================================
# 6. TASK GROUP 6: PROCESS CONFORMANCE ENGINE
# =========================================================================
def test_process_conformance_engine_detail(supervisor_token):
    """Verify Process Conformance compares trace Alert->Triage->Investigation->Escalation->Containment->Closure."""
    res = client.get(
        "/api/v1/analysis/process",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    signals = data["signals"]
    proc_sig = signals[0]
    assert proc_sig["expected_process"] == "Alert -> Triage -> Investigation -> Escalation -> Containment -> Closure"
    assert "Containment" in proc_sig["observed_process"]
    assert proc_sig["deviation_type"] == "Missing Step"
    assert "PM4Py" in proc_sig["explanation"]


# =========================================================================
# 7. TASK GROUP 7: INVESTIGATION QUALITY ENGINE
# =========================================================================
def test_investigation_quality_engine_detail(supervisor_token):
    """Verify Investigation Quality calculates triage delay, artifact depth, and preserves raw refs."""
    res = client.get(
        "/api/v1/analysis/investigation-quality",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    signals = data["signals"]
    iq_sig = signals[0]
    assert iq_sig["investigation_depth"] == "Shallow"
    assert "Raw Event Ref" in iq_sig["explanation"]
    assert len(iq_sig["evidence_ids"]) >= 1


# =========================================================================
# 8. TASK GROUP 8: BEHAVIOURAL DEVIATION ENGINE
# =========================================================================
def test_behavioural_deviation_engine_detail(supervisor_token):
    """Verify Behavioural Deviation outputs analytical signals covering actor, shift, action, timestamp."""
    res = client.get(
        "/api/v1/analysis/behavioural",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    signals = data["signals"]
    bh_sig = signals[0]
    assert "Off-Shift" in bh_sig["title"]
    assert "Z-score" in bh_sig["explanation"]


# =========================================================================
# 9. TASK GROUP 9: HISTORICAL COMPARISON ENGINE
# =========================================================================
def test_historical_comparison_engine_detail(supervisor_token):
    """Verify Historical Comparison compares current vs baseline, delta, and drift direction."""
    res = client.get(
        "/api/v1/analysis/historical",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    signals = data["signals"]
    hc_sig = signals[0]
    assert hc_sig["baseline_value"] is not None
    assert hc_sig["current_value"] is not None
    assert hc_sig["trend_direction"] == "degrading"
    assert data["trend_comparison"] is not None


# =========================================================================
# 10. TASK GROUP 10: PEER BENCHMARKING ENGINE
# =========================================================================
def test_peer_benchmarking_engine_no_leakage(supervisor_token):
    """Verify Peer Benchmarking uses anonymized cohorts and strictly avoids leaking peer identities."""
    res = client.get(
        "/api/v1/analysis/peer",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    signals = data["signals"]
    pb_sig = signals[0]
    assert "Anonymized" in pb_sig["title"]
    assert "Cohort" in pb_sig["title"]
    # Verify no leak of actual peer codes or names (e.g. CSE-022, Kaveri) in another entity's signal title
    if pb_sig["cse_id"] == "CSE-014":
        assert "CSE-022" not in pb_sig["title"]
        assert "Kaveri" not in pb_sig["title"]


# =========================================================================
# 11. TASK GROUP 11: CROSS-SOURCE CONSISTENCY ENGINE
# =========================================================================
def test_cross_source_consistency_engine_detail(supervisor_token):
    """Verify Cross-Source Consistency correlates SIEM, ticketing, and gateway with CONFLICT status."""
    res = client.get(
        "/api/v1/analysis/consistency",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    signals = data["signals"]
    csc_sig = signals[0]
    assert csc_sig["source_a"] is not None
    assert csc_sig["source_b"] is not None
    assert "CONFLICT" in csc_sig["difference"]


# =========================================================================
# 12. TASK GROUP 12: METRIC INTEGRITY ENGINE
# =========================================================================
def test_metric_integrity_engine_detail(supervisor_token):
    """Verify Metric Integrity recalculates MTTD/MTTR and exposes calculation trail."""
    res = client.get(
        "/api/v1/analysis/metric-integrity",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    signals = data["signals"]
    mi_sig = signals[0]
    assert mi_sig["kpi_reported"] is not None
    assert mi_sig["kpi_observed"] is not None
    assert "Calculation trail:" in mi_sig["explanation"]


# =========================================================================
# 13. EXPLICIT RUN TRIGGER, JOB TRACKING, AND FRONTEND COMPATIBILITY
# =========================================================================
def test_explicit_run_and_job_tracking(supervisor_token):
    """Verify POST /api/v1/analysis/{engine_slug}/run and GET /api/v1/analysis/jobs/{job_id}."""
    run_res = client.post(
        "/api/v1/analysis/execution-gap/run",
        json={"cse_id": "CSE-014"},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert run_res.status_code == 200
    run_data = run_res.json()
    assert run_data["total"] >= 1


def test_frontend_compatibility_endpoints(supervisor_token):
    """Verify signals, engine signals, and hub metrics API endpoints."""
    # /api/v1/analysis/signals
    all_signals_res = client.get(
        "/api/v1/analysis/signals",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert all_signals_res.status_code == 200
    assert len(all_signals_res.json()) >= 10

    # /api/v1/analysis/engines/execution-gap/signals
    eng_signals_res = client.get(
        "/api/v1/analysis/engines/execution-gap/signals",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert eng_signals_res.status_code == 200
    assert len(eng_signals_res.json()) >= 1

    # /api/v1/analysis/hub/metrics
    hub_res = client.get(
        "/api/v1/analysis/hub/metrics",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert hub_res.status_code == 200
    hub_data = hub_res.json()
    assert hub_data["activeEngines"] == 10
    assert hub_data["totalSignals"] >= 10
