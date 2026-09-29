import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  PageContainer, 
  PageHeader,
  PriorityBadge, 
  StatusBadge, 
  Button,
  Drawer
} from '@/components/common';
import { 
  AnalyticsSignal, 
  getSignalsByEngineSlug 
} from '@/data/mock/analysis';
import { analysisApi } from '@/api';
import { useSupervisory } from '@/context/SupervisoryContext';
import { 
  ArrowLeft, 
  Search, 
  RotateCcw, 
  ExternalLink, 
  FileText, 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Database,
  Filter,
  Clock,
  Activity,
  SlidersHorizontal,
  ChevronRight,
  Check,
  Building2,
  Calendar,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Scale
} from 'lucide-react';

interface ExpectedObservedItem {
  dimension: string;
  expected: string;
  observed: string;
  gapNote?: string;
  isMismatch?: boolean;
}

export const ExecutionGapPage: React.FC<{ forcedSlug?: string }> = () => {
  const { cseId: routeCseId } = useParams<{ cseId?: string }>();
  const navigate = useNavigate();
  const { cses, findings, activeCseId } = useSupervisory();

  // Selected Scope Filter
  const [selectedCse, setSelectedCse] = useState<string>(routeCseId || 'ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Signal for Drawer and Expected vs Observed Inspection
  const [selectedSignal, setSelectedSignal] = useState<AnalyticsSignal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Live signals state
  const [backendSignals, setBackendSignals] = useState<AnalyticsSignal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastAnalysisTimestamp, setLastAnalysisTimestamp] = useState<string>('29 Sep 2026, 16:17 UTC');

  // Load Execution Gap signals from API with fallback to mockAnalyticsSignals
  useEffect(() => {
    setIsLoading(true);
    analysisApi.getSignalsBySlug('execution-gap')
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          const adapted: AnalyticsSignal[] = res.map((s: any) => ({
            signalId: s.signalId || s.signal_id || s.id,
            engineType: 'EXECUTION_GAP',
            cseId: s.cseId || s.cse_id,
            cseName: s.cseName || s.cse_name || `${s.cseId || s.cse_id} Operational Node`,
            assessmentId: s.assessmentId || s.assessment_id || 'ASM-2026-Q3',
            controlId: s.controlId || s.control_id || 'CTRL-07',
            findingId: s.findingId || s.finding_id,
            priority: (s.priority as any) || 'HIGH',
            status: (s.status as any) || 'CANDIDATE',
            title: s.title,
            reason: s.reason || s.explanation || s.title,
            expected: s.expected || 'Mandatory operational execution baseline',
            observed: s.observed || 'Observed deviation from mandated control execution',
            difference: s.difference || 'Execution variance identified',
            evidenceIds: s.evidenceIds || s.evidence_ids || [],
            recommendedForSampling: s.recommendedForSampling ?? s.recommended_for_sampling ?? true,
            ruleVersion: s.ruleVersion || s.rule_version || 'EXEC-GAP-1.4',
            controlVersion: s.controlVersion || s.control_version || '2026.3',
            modelVersion: s.modelVersion || s.model_version || '1.4.2',
            updatedAt: s.updatedAt || s.updated_at || 'Recently',
            gapType: s.gapType || s.gap_type || 'Missing Execution'
          }));
          setBackendSignals(adapted);
          const firstRes: any = res[0];
          if (firstRes?.updatedAt || firstRes?.updated_at) {
            setLastAnalysisTimestamp(firstRes.updatedAt || firstRes.updated_at);
          }
        }
      })
      .catch(() => {
        // Handled silently, will use fallback
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Merge backend signals and contextual findings of type EXECUTION_GAP
  const allExecutionGapSignals = useMemo(() => {
    let sourceSignals: AnalyticsSignal[] = backendSignals.length > 0 
      ? backendSignals 
      : getSignalsByEngineSlug('execution-gap');

    // Also enrich with any findings specifically flagged with signalType === 'EXECUTION_GAP'
    const findingsAsSignals: AnalyticsSignal[] = findings
      .filter(f => f.signalType === 'EXECUTION_GAP')
      .map(f => ({
        signalId: `SIG-${f.id}`,
        engineType: 'EXECUTION_GAP',
        cseId: f.cseId,
        cseName: f.cseName,
        assessmentId: f.provenance?.assessmentPeriod || 'ASM-2026-Q3',
        controlId: f.controlId,
        findingId: f.id,
        priority: f.priority,
        status: (f.status === 'UNDER_REVIEW' ? 'UNDER_REVIEW' : f.status === 'VALIDATED' ? 'VALIDATED' : 'CANDIDATE') as any,
        title: f.title,
        reason: f.whyFlagged,
        expected: f.expectedState,
        observed: f.observedState,
        difference: f.gapSummary,
        evidenceIds: f.sourceEvidence?.map(e => e.recordId) || [],
        recommendedForSampling: true,
        ruleVersion: f.provenance?.ruleVersion || 'EXEC-GAP-1.4',
        controlVersion: f.provenance?.controlVersion || 'CTRL-07 v3.2',
        modelVersion: f.provenance?.analyticsEngineVersion || 'PM4Py-1.6.4',
        updatedAt: 'Recently',
        gapType: 'Missing Execution'
      }));

    // Deduplicate by findingId or signalId
    const seen = new Set<string>();
    const merged: AnalyticsSignal[] = [];

    for (const sig of [...sourceSignals, ...findingsAsSignals]) {
      const key = `${sig.cseId}-${sig.controlId}-${sig.findingId || sig.signalId}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(sig);
      }
    }

    return merged;
  }, [backendSignals, findings]);

  // Unique CSE options from real data
  const cseOptions = useMemo(() => {
    const map = new Map<string, string>();
    allExecutionGapSignals.forEach(s => {
      map.set(s.cseId, s.cseName);
    });
    cses.forEach(c => {
      map.set(c.cseId || c.id, c.cseName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allExecutionGapSignals, cses]);

  // Filtered signals
  const filteredSignals = useMemo(() => {
    return allExecutionGapSignals.filter(signal => {
      if (selectedCse !== 'ALL' && signal.cseId !== selectedCse) {
        return false;
      }
      if (selectedPriority !== 'ALL' && signal.priority !== selectedPriority) {
        return false;
      }
      if (selectedStatus !== 'ALL' && signal.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          signal.title.toLowerCase().includes(q) ||
          signal.reason.toLowerCase().includes(q) ||
          signal.cseName.toLowerCase().includes(q) ||
          signal.cseId.toLowerCase().includes(q) ||
          signal.controlId.toLowerCase().includes(q) ||
          (signal.findingId && signal.findingId.toLowerCase().includes(q)) ||
          signal.difference.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [allExecutionGapSignals, selectedCse, selectedPriority, selectedStatus, searchQuery]);

  // Primary active signal for the comparison section (defaults to first filtered or first available)
  const activeFocusSignal = useMemo(() => {
    if (selectedSignal) return selectedSignal;
    if (filteredSignals.length > 0) return filteredSignals[0];
    return null;
  }, [selectedSignal, filteredSignals]);

  // Derive Expected vs Observed 5-item breakdown strictly from real data
  const comparisonItems: ExpectedObservedItem[] = useMemo(() => {
    if (!activeFocusSignal) return [];

    // Find linked finding if available to get rich timeline / evidence details
    const linkedFinding = findings.find(f => 
      (activeFocusSignal.findingId && f.id.toLowerCase() === activeFocusSignal.findingId.toLowerCase()) ||
      (f.cseId === activeFocusSignal.cseId && f.controlId === activeFocusSignal.controlId)
    );

    // 1. Control expectation
    const controlExpectation = activeFocusSignal.expected;
    const actualActivity = activeFocusSignal.observed;

    // 2. Required process vs Actual timing/process
    const requiredProcess = linkedFinding?.timeline 
      ? `Sequence: ${linkedFinding.timeline.map(t => t.event).join(' → ')}`
      : `Mandated lifecycle execution under ${activeFocusSignal.controlId}`;
    const actualProcess = linkedFinding?.timeline
      ? linkedFinding.timeline.filter(t => !t.isGap).map(t => `${t.time} ${t.event}`).join('; ')
      : activeFocusSignal.observed;

    // 3. Required timing
    const requiredTiming = linkedFinding?.expectedState.includes('minutes') || linkedFinding?.expectedState.includes('hours')
      ? linkedFinding.expectedState
      : 'Statutory SLA: Immediate execution upon condition trigger (within statutory window)';
    const actualTiming = linkedFinding?.observedState.includes('at') || activeFocusSignal.updatedAt
      ? `${activeFocusSignal.updatedAt} • ${activeFocusSignal.gapType || 'Timing Variance'}`
      : 'Timing recorded outside statutory boundary or not dispatched';

    // 4. Required evidence
    const requiredEvidence = activeFocusSignal.evidenceIds.length > 0
      ? `Cryptographic telemetry parcels: ${activeFocusSignal.evidenceIds.join(', ')}`
      : 'Cryptographic proof package with valid SHA-256 header';
    const actualEvidence = activeFocusSignal.evidenceIds.length > 0
      ? `${activeFocusSignal.evidenceIds.length} parcel(s) submitted; verification gap detected (${activeFocusSignal.evidenceState || 'Partial/Absent'})`
      : 'Omitted or unverified in supervisory enclave vault';

    // 5. Expected metric vs Actual metric
    const expectedMetric = linkedFinding
      ? `Completeness: 100% required (${linkedFinding.completeness}% observed)`
      : 'Conformant execution rate: 100.0% statutory threshold';
    const actualMetric = activeFocusSignal.difference;

    return [
      {
        dimension: 'Control Expectation',
        expected: controlExpectation,
        observed: actualActivity,
        gapNote: activeFocusSignal.difference,
        isMismatch: true
      },
      {
        dimension: 'Required Process',
        expected: requiredProcess,
        observed: actualProcess,
        gapNote: activeFocusSignal.gapType || 'Execution Sequence Deficit',
        isMismatch: true
      },
      {
        dimension: 'Required Timing',
        expected: requiredTiming,
        observed: actualTiming,
        gapNote: 'Statutory timeframe threshold exceeded or bypassed',
        isMismatch: true
      },
      {
        dimension: 'Required Evidence',
        expected: requiredEvidence,
        observed: actualEvidence,
        gapNote: 'Forensic telemetry ledger gap',
        isMismatch: true
      },
      {
        dimension: 'Expected Metric',
        expected: expectedMetric,
        observed: actualMetric,
        gapNote: activeFocusSignal.difference,
        isMismatch: true
      }
    ];
  }, [activeFocusSignal, findings]);

  const handleOpenDrawer = (sig: AnalyticsSignal) => {
    setSelectedSignal(sig);
    setDrawerOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedCse('ALL');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
  };

  // Active CSE metadata for header
  const activeCseMeta = useMemo(() => {
    if (selectedCse !== 'ALL') {
      return cses.find(c => c.cseId === selectedCse || c.id === selectedCse);
    }
    if (activeFocusSignal) {
      return cses.find(c => c.cseId === activeFocusSignal.cseId || c.id === activeFocusSignal.cseId);
    }
    return cses[0];
  }, [selectedCse, activeFocusSignal, cses]);

  return (
    <PageContainer>
      <div className="space-y-6">

        {/* 1. STANDARDIZED PAGE HEADER */}
        <PageHeader
          title="Execution Gap"
          subtitle="Expected vs observed execution"
          badge={
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30 font-semibold uppercase">
              Engine 01
            </span>
          }
          breadcrumbs={
            <Link
              to="/analysis"
              className="inline-flex items-center gap-1.5 text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Analysis Hub</span>
            </Link>
          }
          metadata={
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#cbd5e1] font-semibold">{activeCseMeta ? `${activeCseMeta.cseName} (${activeCseMeta.cseId || activeCseMeta.id})` : 'All Regulated CSEs'}</span>
              <span>•</span>
              <span>Cycle: Q3 2026 · ASM-2026-Q3</span>
              <span>•</span>
              <span>Model: v1.4.2 · Rule: EXEC-GAP-1.4</span>
            </div>
          }
          actions={
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
              <span className="text-[11px] font-mono text-[#94a3b8]">
                {lastAnalysisTimestamp}
              </span>
            </div>
          }
        />

        {/* FILTERS & SCOPE SELECTOR */}
        <div className="p-3.5 rounded-lg bg-[#0d121c] border border-[#212c3d] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative min-w-[220px] flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search control, CSE, finding, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111622] border border-[#212c3d] rounded text-[12px] text-[#f1f5f9] placeholder:text-[#64748b] pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            {/* CSE Selector */}
            <select
              value={selectedCse}
              onChange={(e) => setSelectedCse(e.target.value)}
              className="bg-[#111622] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="ALL">All Regulated CSEs</option>
              {cseOptions.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>

            {/* Priority Selector */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-[#111622] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Status Selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#111622] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="ALL">All Statuses</option>
              <option value="CANDIDATE">Candidate</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VALIDATED">Validated</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#94a3b8]">
              {filteredSignals.length} {filteredSignals.length === 1 ? 'gap' : 'gaps'} identified
            </span>
            {(selectedCse !== 'ALL' || selectedPriority !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* 2. EXPECTED VS OBSERVED COMPARISON (Section 2) */}
        {activeFocusSignal ? (
          <div className="rounded-md bg-[#131922] border border-[#212c3d] overflow-hidden shadow-xs">
            {/* Header banner for Comparison */}
            <div className="p-3.5 border-b border-[#212c3d] bg-[#0e141c] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#3b82f6]" />
                  <h2 className="text-[14px] font-semibold text-[#f8fafc]">
                    Expected vs Observed
                  </h2>
                  <span className="font-mono text-[11px] text-[#60a5fa] px-2 py-0.5 rounded bg-blue-950/40 border border-blue-500/30">
                    {activeFocusSignal.controlId} • {activeFocusSignal.cseId}
                  </span>
                </div>
                <p className="text-[12px] text-[#94a3b8] mt-0.5">
                  Focus: <strong className="text-[#f1f5f9]">{activeFocusSignal.title}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDrawer(activeFocusSignal)}
                  iconRight={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Detail
                </Button>
                {activeFocusSignal.findingId && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/review/findings/${activeFocusSignal.findingId}`)}
                    iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Finding
                  </Button>
                )}
              </div>
            </div>

            {/* TWO-COLUMN LAYOUT: EXPECTED vs OBSERVED */}
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* COLUMN 1: EXPECTED */}
              <div className="rounded-lg bg-[#0d121c] border border-emerald-500/30 overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-emerald-950/20 border-b border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[12px] font-mono uppercase font-bold text-emerald-300 tracking-wider">
                      EXPECTED
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    Statutory Baseline Model
                  </span>
                </div>

                <div className="p-4 space-y-4 text-[12px] flex-1">
                  {/* Control Expectation */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Control Expectation ({activeFocusSignal.controlId})
                    </div>
                    <div className="p-2.5 rounded bg-[#131922] border border-[#212c3d] text-[#e2e8f0] font-medium leading-relaxed">
                      {comparisonItems[0]?.expected || activeFocusSignal.expected}
                    </div>
                  </div>

                  {/* Required Process */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                      Required Process
                    </div>
                    <div className="p-2.5 rounded bg-[#131922] border border-[#212c3d] text-[#e2e8f0] leading-relaxed">
                      {comparisonItems[1]?.expected}
                    </div>
                  </div>

                  {/* Required Timing */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Required Timing
                    </div>
                    <div className="p-2.5 rounded bg-[#131922] border border-[#212c3d] text-[#e2e8f0] font-mono text-[11px]">
                      {comparisonItems[2]?.expected}
                    </div>
                  </div>

                  {/* Required Evidence */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      Required Evidence
                    </div>
                    <div className="p-2.5 rounded bg-[#131922] border border-[#212c3d] text-[#e2e8f0] font-mono text-[11px]">
                      {comparisonItems[3]?.expected}
                    </div>
                  </div>

                  {/* Expected Metric */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      Expected Metric
                    </div>
                    <div className="p-2.5 rounded bg-[#131922] border border-[#212c3d] text-emerald-300 font-mono text-[12px] font-semibold">
                      {comparisonItems[4]?.expected}
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMN 2: OBSERVED */}
              <div className="rounded-md bg-[#0e141c] border border-rose-500/30 overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-rose-950/20 border-b border-rose-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="text-[12px] font-mono uppercase font-bold text-rose-300 tracking-wider">
                      OBSERVED
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400/80 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
                    Forensic Telemetry Evidence
                  </span>
                </div>

                <div className="p-4 space-y-4 text-[12px] flex-1">
                  {/* Actual Activity */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      Actual Activity
                    </div>
                    <div className="p-2.5 rounded bg-[#131922] border border-rose-500/30 text-[#f87171] font-medium leading-relaxed">
                      {comparisonItems[0]?.observed || activeFocusSignal.observed}
                    </div>
                  </div>

                  {/* Actual Timing / Process */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      Actual Timing
                    </div>
                    <div className="p-2.5 rounded bg-[#131922] border border-[#212c3d] text-[#e2e8f0] font-mono text-[11px]">
                      {comparisonItems[2]?.observed}
                    </div>
                  </div>

                  {/* Actual Evidence */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      Actual Evidence
                    </div>
                    <div className="p-2.5 rounded bg-[#131922] border border-[#212c3d] text-[#e2e8f0] font-mono text-[11px] flex items-center justify-between">
                      <span>{comparisonItems[3]?.observed}</span>
                      <Link 
                        to="/evidence" 
                        className="text-[#3b82f6] hover:underline text-[11px] flex items-center gap-1 ml-2 shrink-0"
                      >
                        Inspect Vault <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Actual Metric */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      Actual Metric / Analytical Variance
                    </div>
                    <div className="p-2.5 rounded bg-[#131922] border border-amber-500/30 text-amber-300 font-medium text-[12px]">
                      {comparisonItems[4]?.observed}
                    </div>
                  </div>

                  {/* Summary Gap Highlight */}
                  <div className="p-2.5 rounded bg-[#131922] border border-amber-500/40 text-[11px] space-y-1">
                    <div className="font-mono text-amber-400 font-semibold uppercase flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Identified Execution Gap
                    </div>
                    <div className="text-[#cbd5e1]">
                      {activeFocusSignal.difference}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* 3. GAP RESULTS TABLE (Section 3) */}
        <div className="rounded-md bg-[#131922] border border-[#212c3d] overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-[#212c3d] flex items-center justify-between bg-[#0e141c]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#3b82f6]" />
              <span className="text-[13px] font-semibold text-[#f1f5f9]">
                Execution Gap Results ({filteredSignals.length})
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#94a3b8]">
              Select row to update Expected vs Observed view
            </span>
          </div>

          {filteredSignals.length === 0 ? (
            /* 6. EMPTY STATE (Section 6) */
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#64748b] mx-auto" />
              <div className="text-[14px] font-semibold text-[#f1f5f9]">
                No execution gaps identified
              </div>
              <p className="text-[12px] text-[#94a3b8] max-w-md mx-auto">
                No omissions or deviations detected for the selected filters.
              </p>
              {(selectedCse !== 'ALL' || selectedPriority !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={handleResetFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#0d121c] text-[#94a3b8] font-mono uppercase text-[10px] tracking-wider border-b border-[#212c3d]">
                  <tr>
                    <th className="py-2.5 px-3">Control</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Expected</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Observed</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Gap</th>
                    <th className="py-2.5 px-3">Evidence</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#212c3d]">
                  {filteredSignals.map(signal => {
                    const isSelected = activeFocusSignal?.signalId === signal.signalId;
                    return (
                      <tr
                        key={signal.signalId}
                        onClick={() => setSelectedSignal(signal)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#192438] border-l-2 border-[#38bdf8]' : 'hover:bg-[#161e29]/70'
                        }`}
                      >
                        {/* Control */}
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-[#60a5fa]">{signal.controlId}</div>
                          <div className="text-[10px] text-[#94a3b8] font-mono">{signal.cseId}</div>
                        </td>

                        {/* Expected */}
                        <td className="py-3 px-3 text-[#cbd5e1] max-w-[220px]" title={signal.expected}>
                          <div className="truncate text-[#e2e8f0] font-medium">{signal.expected}</div>
                          <div className="text-[10px] text-[#64748b] truncate">{signal.title}</div>
                        </td>

                        {/* Observed */}
                        <td className="py-3 px-3 text-[#f87171] max-w-[220px]" title={signal.observed}>
                          <div className="truncate">{signal.observed}</div>
                          <div className="text-[10px] text-[#94a3b8] font-mono">{signal.gapType || 'Execution Variance'}</div>
                        </td>

                        {/* Gap */}
                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#161e29] border border-amber-500/30 text-amber-300 block truncate max-w-[200px]" title={signal.difference}>
                            {signal.difference}
                          </span>
                        </td>

                        {/* Evidence */}
                        <td className="py-3 px-3 font-mono text-[#38bdf8] text-[11px]">
                          {signal.evidenceIds.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {signal.evidenceIds.slice(0, 2).map(ev => (
                                <span key={ev} className="px-1.5 py-0.5 rounded bg-[#0d121c] border border-[#212c3d] text-[10px]">
                                  {ev}
                                </span>
                              ))}
                              {signal.evidenceIds.length > 2 && (
                                <span className="text-[10px] text-[#94a3b8]">+{signal.evidenceIds.length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#64748b]">Void</span>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3">
                          <PriorityBadge priority={signal.priority} />
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <StatusBadge status={signal.status} />
                        </td>

                        {/* Action */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDrawer(signal)}
                            >
                              Detail
                            </Button>
                            {signal.findingId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/review/findings/${signal.findingId}`)}
                              >
                                Finding
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. DETAIL DRAWER (Section 4 & Section 5 Traceability) */}
        {selectedSignal && (
          <Drawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title={`${selectedSignal.signalId}: ${selectedSignal.title}`}
            subtitle={`Execution Gap Engine • ${selectedSignal.cseName} (${selectedSignal.cseId})`}
            width="lg"
            footer={
              <div className="flex items-center justify-between gap-2 w-full">
                {/* 5. Traceability Direct Navigation */}
                <div className="flex items-center gap-2">
                  {selectedSignal.findingId && (
                    <Button
                      variant="primary"
                      size="sm"
                      iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setDrawerOpen(false);
                        navigate(`/review/findings/${selectedSignal.findingId}`);
                      }}
                    >
                      Open Finding ({selectedSignal.findingId})
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    iconRight={<ExternalLink className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/evidence');
                    }}
                  >
                    Inspect Evidence Vault
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDrawerOpen(false)}
                >
                  Close
                </Button>
              </div>
            }
          >
            <div className="space-y-4 py-1 text-[12px]">
              {/* Header Badges */}
              <div className="flex items-center justify-between pb-3 border-b border-[#262a31]">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={selectedSignal.priority} />
                  <StatusBadge status={selectedSignal.status} />
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-500/30 font-semibold">
                    {selectedSignal.controlId}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#94a3b8]">{selectedSignal.updatedAt}</span>
              </div>

              {/* Analytical Reasoning */}
              <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#60a5fa] uppercase tracking-wider font-semibold">
                  <Activity className="w-3.5 h-3.5 text-[#60a5fa]" />
                  Analytical Reasoning
                </div>
                <p className="text-[12px] text-[#cbd5e1] leading-relaxed">
                  {selectedSignal.reason}
                </p>
              </div>

              {/* Models Comparison: Expected Model vs Observed Model vs Difference */}
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold font-mono">
                  Operational Model Discrepancy
                </div>

                {/* Expected Model */}
                <div className="p-3 rounded bg-[#0d121c] border border-emerald-500/30 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Expected Model
                  </div>
                  <p className="text-[#e2e8f0] text-[12px] leading-relaxed">
                    {selectedSignal.expected}
                  </p>
                </div>

                {/* Observed Model */}
                <div className="p-3 rounded bg-[#0d121c] border border-rose-500/30 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Observed Model
                  </div>
                  <p className="text-[#e2e8f0] text-[12px] leading-relaxed">
                    {selectedSignal.observed}
                  </p>
                </div>

                {/* Difference */}
                <div className="p-3 rounded bg-[#131922] border border-amber-500/40 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Difference (Execution Variance)
                  </div>
                  <p className="text-[#f1f5f9] text-[12px] font-medium leading-relaxed">
                    {selectedSignal.difference}
                  </p>
                </div>
              </div>

              {/* Supporting Evidence with direct links */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#64748b] uppercase font-semibold">
                  <span>Supporting Evidence ({selectedSignal.evidenceIds.length})</span>
                  <Link
                    to="/evidence"
                    className="text-[#38bdf8] hover:underline text-[10px] flex items-center gap-1"
                  >
                    Open evidence explorer <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                {selectedSignal.evidenceIds.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSignal.evidenceIds.map(evId => (
                      <div
                        key={evId}
                        onClick={() => {
                          setDrawerOpen(false);
                          navigate(`/evidence/${evId}`);
                        }}
                        className="p-2.5 rounded bg-[#0d121c] border border-[#212c3d] hover:border-[#38bdf8] cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#38bdf8]" />
                          <span className="font-mono text-[11px] text-[#f1f5f9] font-medium">{evId}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#94a3b8] hover:text-[#38bdf8]">
                          Inspect →
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded bg-[#0d121c] border border-[#212c3d] text-[11px] text-[#64748b] italic">
                    No evidence submitted in supervisory vault for this execution checkpoint.
                  </div>
                )}
              </div>

              {/* Linked Finding Traceability */}
              <div className="p-3 rounded-lg bg-[#0d121c] border border-[#212c3d] space-y-2">
                <div className="text-[11px] font-mono uppercase text-[#64748b] font-semibold">
                  Traceability &amp; Adjudication Linkage
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#94a3b8]">Regulated CSE:</span>
                    <div className="text-[#f1f5f9] font-medium mt-0.5">{selectedSignal.cseName} ({selectedSignal.cseId})</div>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Assessment Docket:</span>
                    <div className="text-[#f1f5f9] font-mono mt-0.5">{selectedSignal.assessmentId}</div>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Mandatory Control:</span>
                    <div className="text-[#60a5fa] font-mono mt-0.5">{selectedSignal.controlId} ({selectedSignal.controlVersion})</div>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Formal Finding:</span>
                    <div className="text-[#38bdf8] font-mono mt-0.5">
                      {selectedSignal.findingId ? (
                        <Link to={`/review/findings/${selectedSignal.findingId}`} className="hover:underline flex items-center gap-1">
                          {selectedSignal.findingId} <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-[#64748b]">Candidate signal only</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rule / Control Version (Section 4) */}
              <div className="p-3 rounded bg-[#0d121c] border border-[#212c3d] text-[10px] font-mono text-[#64748b] space-y-1.5">
                <div className="flex justify-between">
                  <span>Rule Engine Version:</span>
                  <span className="text-[#94a3b8] font-bold">{selectedSignal.ruleVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Control Specification Version:</span>
                  <span className="text-[#94a3b8] font-bold">{selectedSignal.controlVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Analytical Model Version:</span>
                  <span className="text-[#94a3b8] font-bold">{selectedSignal.modelVersion}</span>
                </div>
              </div>
            </div>
          </Drawer>
        )}

      </div>
    </PageContainer>
  );
};
