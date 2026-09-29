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
  AlertTriangle,
  ArrowRight,
  Database,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  EyeOff,
  SearchCode,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  FileSearch,
  ScanEye,
  Activity
} from 'lucide-react';

interface NegativeSpaceMatrixRow {
  signalId: string;
  expectedActivity: string;
  requiredEvidence: string;
  observedEvidence: string;
  missingEvidence: string;
  controlId: string;
  controlVersion: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'CANDIDATE' | 'UNDER_REVIEW' | 'VALIDATED' | 'DISMISSED';
  supportingEvidence: string[];
  cseId: string;
  cseName: string;
  findingId?: string;
  ruleVersion: string;
  modelVersion: string;
  evidenceSearched: string;
  evidenceState: string;
  updatedAt: string;
  title: string;
  reason: string;
  explanation: string;
}

export const NegativeSpacePage: React.FC<{ forcedSlug?: string }> = () => {
  const { cseId: routeCseId } = useParams<{ cseId?: string }>();
  const navigate = useNavigate();
  const { cses, findings } = useSupervisory();

  // Filters State
  const [selectedControl, setSelectedControl] = useState<string>('ALL');
  const [selectedCse, setSelectedCse] = useState<string>(routeCseId || 'ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected item for drawer and active inspection
  const [selectedRow, setSelectedRow] = useState<NegativeSpaceMatrixRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Live signals state
  const [backendSignals, setBackendSignals] = useState<AnalyticsSignal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastAnalysisTimestamp, setLastAnalysisTimestamp] = useState<string>('29 Sep 2026, 16:24 UTC');

  // Load Negative Space signals from API with fallback
  useEffect(() => {
    setIsLoading(true);
    analysisApi.getSignalsBySlug('negative-space')
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          const adapted: AnalyticsSignal[] = res.map((s: any) => ({
            signalId: s.signalId || s.signal_id || s.id,
            engineType: 'NEGATIVE_SPACE',
            cseId: s.cseId || s.cse_id,
            cseName: s.cseName || s.cse_name || `${s.cseId || s.cse_id} Operational Node`,
            assessmentId: s.assessmentId || s.assessment_id || 'ASM-2026-Q3',
            controlId: s.controlId || s.control_id || 'CTRL-07',
            findingId: s.findingId || s.finding_id,
            priority: (s.priority as any) || 'HIGH',
            status: (s.status as any) || 'CANDIDATE',
            title: s.title,
            reason: s.reason || s.explanation || s.title,
            expected: s.expected || 'Mandatory operational activity within statutory window',
            observed: s.observed || 'Zero matching operational evidence or delayed response observed',
            difference: s.difference || 'Negative Space Detected: Expected activity absent from supervisory vault',
            evidenceIds: s.evidenceIds || s.evidence_ids || [],
            recommendedForSampling: s.recommendedForSampling ?? s.recommended_for_sampling ?? true,
            ruleVersion: s.ruleVersion || s.rule_version || 'NEG-SPACE-1.2',
            controlVersion: s.controlVersion || s.control_version || '2026.3',
            modelVersion: s.modelVersion || s.model_version || '1.2.0',
            updatedAt: s.updatedAt || s.updated_at || 'Recently',
            evidenceState: s.evidenceState || s.evidence_state || 'ABSENT_CONFIRMED',
            gapType: s.gapType || s.gap_type
          }));
          setBackendSignals(adapted);
          const firstRes: any = res[0];
          if (firstRes?.updatedAt || firstRes?.updated_at) {
            setLastAnalysisTimestamp(firstRes.updatedAt || firstRes.updated_at);
          }
        }
      })
      .catch(() => {
        // Handled silently, fallback used
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Merge backend signals and contextual findings with signalType === 'NEGATIVE_SPACE'
  const allNegativeSpaceSignals = useMemo(() => {
    let sourceSignals: AnalyticsSignal[] = backendSignals.length > 0
      ? backendSignals
      : getSignalsByEngineSlug('negative-space');

    const findingsAsSignals: AnalyticsSignal[] = findings
      .filter(f => f.signalType === 'NEGATIVE_SPACE')
      .map(f => ({
        signalId: `SIG-${f.id}`,
        engineType: 'NEGATIVE_SPACE',
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
        ruleVersion: f.provenance?.ruleVersion || 'NEG-SPACE-1.2',
        controlVersion: f.provenance?.controlVersion || 'CTRL-07 v3.2',
        modelVersion: f.provenance?.analyticsEngineVersion || 'Stat-Baseline-2.0',
        updatedAt: 'Recently',
        evidenceState: 'ABSENT_CONFIRMED'
      }));

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

  // Transform signals into Expected vs Observed Matrix rows
  const matrixRows: NegativeSpaceMatrixRow[] = useMemo(() => {
    return allNegativeSpaceSignals.map(sig => {
      // Missing evidence breakdown
      const missingItem = sig.evidenceState === 'ABSENT_CONFIRMED'
        ? (sig.evidenceIds.length > 0 ? `Confirmed absent: ${sig.evidenceIds.join(', ')}` : 'Expected activity telemetry parcel confirmed absent in vault')
        : (sig.difference || 'Unsubmitted statutory operational proof');

      // Observed evidence breakdown
      const observedItem = sig.observed.toLowerCase().includes('zero') || sig.observed.toLowerCase().includes('complete absence')
        ? 'Zero matching telemetry packets observed in supervisory enclave'
        : sig.observed;

      // Evidence searched
      const evidenceSearched = `Supervisory Vault: Enclave telemetry ingest, SIEM alert streams (${sig.cseId}), Gateway packets`;

      return {
        signalId: sig.signalId,
        expectedActivity: sig.expected,
        requiredEvidence: `${sig.controlId} Mandatory Stream / Cryptographic Digest`,
        observedEvidence: observedItem,
        missingEvidence: missingItem,
        controlId: sig.controlId,
        controlVersion: sig.controlVersion || '2026.3',
        severity: sig.priority,
        status: sig.status,
        supportingEvidence: sig.evidenceIds,
        cseId: sig.cseId,
        cseName: sig.cseName,
        findingId: sig.findingId,
        ruleVersion: sig.ruleVersion || 'NEG-SPACE-1.2',
        modelVersion: sig.modelVersion || '1.2.0',
        evidenceSearched,
        evidenceState: sig.evidenceState || 'ABSENT_CONFIRMED',
        updatedAt: sig.updatedAt,
        title: sig.title,
        reason: sig.reason,
        explanation: (sig as any).explanation || `Negative space formulation: Expected activity [${sig.title}] evaluated across statutory window: zero conforming audit records located.`
      };
    });
  }, [allNegativeSpaceSignals]);

  // Unique controls for dropdown
  const controlOptions = useMemo(() => {
    const list = Array.from(new Set(matrixRows.map(r => r.controlId)));
    return ['ALL', ...list.sort()];
  }, [matrixRows]);

  // Unique CSE options
  const cseOptions = useMemo(() => {
    const map = new Map<string, string>();
    matrixRows.forEach(r => map.set(r.cseId, r.cseName));
    cses.forEach(c => map.set(c.cseId || c.id, c.cseName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [matrixRows, cses]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return matrixRows.filter(row => {
      if (selectedControl !== 'ALL' && row.controlId !== selectedControl) {
        return false;
      }
      if (selectedCse !== 'ALL' && row.cseId !== selectedCse) {
        return false;
      }
      if (selectedSeverity !== 'ALL' && row.severity !== selectedSeverity) {
        return false;
      }
      if (selectedStatus !== 'ALL' && row.status !== selectedStatus) {
        return false;
      }
      if (selectedDateFilter === 'RECENT' && !row.updatedAt.toLowerCase().includes('recently') && !row.updatedAt.includes('2026')) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          row.title.toLowerCase().includes(q) ||
          row.expectedActivity.toLowerCase().includes(q) ||
          row.missingEvidence.toLowerCase().includes(q) ||
          row.reason.toLowerCase().includes(q) ||
          row.cseName.toLowerCase().includes(q) ||
          row.cseId.toLowerCase().includes(q) ||
          row.controlId.toLowerCase().includes(q) ||
          (row.findingId && row.findingId.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [matrixRows, selectedControl, selectedCse, selectedSeverity, selectedStatus, selectedDateFilter, searchQuery]);

  // Primary active focus row for visualization (defaults to first filtered or selected)
  const activeFocusRow = useMemo(() => {
    if (selectedRow) return selectedRow;
    if (filteredRows.length > 0) return filteredRows[0];
    return null;
  }, [selectedRow, filteredRows]);

  const handleOpenDrawer = (row: NegativeSpaceMatrixRow) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedControl('ALL');
    setSelectedCse('ALL');
    setSelectedSeverity('ALL');
    setSelectedStatus('ALL');
    setSelectedDateFilter('ALL');
    setSearchQuery('');
  };

  return (
    <PageContainer>
      <div className="space-y-6">

        {/* 1. STANDARDIZED PAGE HEADER */}
        <PageHeader
          title="Negative Space"
          subtitle="Missing evidence and unobserved activity"
          badge={
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-500/30 font-semibold uppercase">
              Engine 02
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
              <span className="text-[#cbd5e1] font-semibold">{selectedCse !== 'ALL' ? selectedCse : 'All Regulated CSEs'}</span>
              <span>•</span>
              <span>{filteredRows.length} Omission Signals</span>
              <span>•</span>
              <span>Rule: NEG-SPACE-1.2 · Model: v1.2.0</span>
            </div>
          }
          actions={
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
              <span className="text-[11px] font-mono text-[#cbd5e1]">
                {lastAnalysisTimestamp}
              </span>
            </div>
          }
        />

        {/* 7. FILTERS (Section 7) */}
        <div className="p-3.5 rounded-lg bg-[#0d121c] border border-[#212c3d] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search control, evidence, activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111622] border border-[#212c3d] rounded text-[12px] text-[#f1f5f9] placeholder:text-[#64748b] pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            {/* Control Filter */}
            <select
              value={selectedControl}
              onChange={(e) => setSelectedControl(e.target.value)}
              className="bg-[#111622] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="ALL">All Controls</option>
              {controlOptions.filter(c => c !== 'ALL').map(ctrl => (
                <option key={ctrl} value={ctrl}>{ctrl}</option>
              ))}
            </select>

            {/* CSE Filter */}
            <select
              value={selectedCse}
              onChange={(e) => setSelectedCse(e.target.value)}
              className="bg-[#111622] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="ALL">All CSEs</option>
              {cseOptions.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-[#111622] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Severity</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
            </select>

            {/* Status Filter */}
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

            {/* Date Filter */}
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="bg-[#111622] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="ALL">All Dates / Cycles</option>
              <option value="RECENT">Recent Cycle (Q3 2026)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#94a3b8]">
              {filteredRows.length} signal(s) match
            </span>
            {(selectedControl !== 'ALL' || selectedCse !== 'ALL' || selectedSeverity !== 'ALL' || selectedStatus !== 'ALL' || selectedDateFilter !== 'ALL' || searchQuery) && (
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

        {/* 4. VISUALIZE: EXPECTED → OBSERVED → MISSING (Section 4) */}
        {activeFocusRow && (
          <div className="rounded-md bg-[#131922] border border-[#212c3d] p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#212c3d]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3b82f6]" />
                <h2 className="text-[13px] font-semibold text-[#f1f5f9] uppercase tracking-wider font-mono">
                  Progression: Expected → Observed → Missing
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#60a5fa] bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/30">
                {activeFocusRow.controlId} • {activeFocusRow.cseId}
              </span>
            </div>

            {/* 3-Stage Pipeline Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
              
              {/* STAGE 1: EXPECTED */}
              <div className="rounded-lg bg-[#0d121c] border border-emerald-500/40 p-3.5 space-y-2 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      1. Expected
                    </span>
                    <span className="text-[10px] font-mono text-[#64748b]">Mandatory Baseline</span>
                  </div>
                  <div className="text-[12px] font-medium text-[#f1f5f9] leading-snug pt-1">
                    {activeFocusRow.expectedActivity}
                  </div>
                </div>
                <div className="pt-2 border-t border-[#212c3d] text-[10px] font-mono text-emerald-400/80">
                  Required: {activeFocusRow.requiredEvidence}
                </div>
              </div>

              {/* STAGE 2: OBSERVED */}
              <div className="rounded-lg bg-[#0d121c] border border-blue-500/40 p-3.5 space-y-2 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full pointer-events-none" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase font-bold text-blue-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      2. Observed
                    </span>
                    <span className="text-[10px] font-mono text-[#64748b]">Vault Telemetry</span>
                  </div>
                  <div className="text-[12px] text-[#cbd5e1] leading-snug pt-1">
                    {activeFocusRow.observedEvidence}
                  </div>
                </div>
                <div className="pt-2 border-t border-[#212c3d] text-[10px] font-mono text-blue-400/80">
                  Searched: {activeFocusRow.evidenceSearched.split(':')[0]}
                </div>
              </div>

              {/* STAGE 3: MISSING */}
              <div className="rounded-lg bg-[#0d121c] border border-rose-500/40 p-3.5 space-y-2 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full pointer-events-none" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase font-bold text-rose-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      3. Missing (Negative Space)
                    </span>
                    <span className="text-[10px] font-mono text-rose-400/80 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/30">
                      Confirmed Omission
                    </span>
                  </div>
                  <div className="text-[12px] font-semibold text-rose-300 leading-snug pt-1">
                    {activeFocusRow.missingEvidence}
                  </div>
                </div>
                <div className="pt-2 border-t border-[#212c3d] text-[10px] font-mono text-rose-400/80 flex items-center justify-between">
                  <span>State: {activeFocusRow.evidenceState}</span>
                  <button
                    onClick={() => handleOpenDrawer(activeFocusRow)}
                    className="text-[#38bdf8] hover:underline"
                  >
                    Examine Detail →
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. EXPECTED VS OBSERVED MATRIX & 5. RESULTS TABLE (Sections 3 & 5) */}
        <div className="rounded-md bg-[#131922] border border-[#212c3d] overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-[#212c3d] flex items-center justify-between bg-[#0e141c]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#3b82f6]" />
              <span className="text-[13px] font-semibold text-[#f1f5f9]">
                Expected vs Observed Matrix ({filteredRows.length})
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#94a3b8]">
              Select row to inspect
            </span>
          </div>

          {filteredRows.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#64748b] mx-auto" />
              <div className="text-[14px] font-semibold text-[#f1f5f9]">
                No omissions identified
              </div>
              <p className="text-[12px] text-[#94a3b8] max-w-md mx-auto">
                All expected activity and evidence streams are confirmed present for the selected filters.
              </p>
              {(selectedControl !== 'ALL' || selectedCse !== 'ALL' || selectedSeverity !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
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
                    <th className="py-2.5 px-3 min-w-[190px]">Expected Activity</th>
                    <th className="py-2.5 px-3 min-w-[170px]">Required Evidence</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Observed Evidence</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Missing Evidence</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Supporting Evidence</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#212c3d]">
                  {filteredRows.map(row => {
                    const isSelected = activeFocusRow?.signalId === row.signalId;
                    return (
                      <tr
                        key={row.signalId}
                        onClick={() => setSelectedRow(row)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#192438] border-l-2 border-[#38bdf8]' : 'hover:bg-[#161e29]/70'
                        }`}
                      >
                        {/* Control */}
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-[#60a5fa]">{row.controlId}</div>
                          <div className="text-[10px] text-[#94a3b8] font-mono">{row.cseId}</div>
                        </td>

                        {/* Expected Activity */}
                        <td className="py-3 px-3 text-[#cbd5e1] max-w-[210px]" title={row.expectedActivity}>
                          <div className="font-medium text-[#f1f5f9] truncate">{row.expectedActivity}</div>
                          <div className="text-[10px] text-[#64748b] truncate">{row.title}</div>
                        </td>

                        {/* Required Evidence */}
                        <td className="py-3 px-3 text-[#94a3b8] font-mono text-[11px] max-w-[180px]" title={row.requiredEvidence}>
                          <div className="truncate text-[#38bdf8]">{row.requiredEvidence}</div>
                          <div className="text-[10px] text-[#64748b]">v{row.controlVersion}</div>
                        </td>

                        {/* Observed Evidence */}
                        <td className="py-3 px-3 text-[#94a3b8] max-w-[190px]" title={row.observedEvidence}>
                          <div className="truncate text-[#cbd5e1]">{row.observedEvidence}</div>
                          <div className="text-[10px] font-mono text-[#64748b]">Telemetry Query</div>
                        </td>

                        {/* Missing Evidence */}
                        <td className="py-3 px-3 max-w-[200px]" title={row.missingEvidence}>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 block truncate">
                            {row.missingEvidence}
                          </span>
                        </td>

                        {/* Severity */}
                        <td className="py-3 px-3">
                          <PriorityBadge priority={row.severity} />
                        </td>

                        {/* Supporting Evidence */}
                        <td className="py-3 px-3 font-mono text-[11px]">
                          {row.supportingEvidence.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {row.supportingEvidence.map(ev => (
                                <span key={ev} className="px-1.5 py-0.5 rounded bg-[#0d121c] border border-[#212c3d] text-[10px] text-[#38bdf8]">
                                  {ev}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#64748b] font-mono italic">Zero Artifacts</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDrawer(row)}
                            >
                              Detail
                            </Button>
                            {row.findingId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/review/findings/${row.findingId}`)}
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

        {/* 6. DETAIL VIEW / DRAWER (Section 6) */}
        {selectedRow && (
          <Drawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title={`Negative Space: ${selectedRow.signalId}`}
            subtitle={`${selectedRow.title} • ${selectedRow.cseName} (${selectedRow.cseId})`}
            width="lg"
            footer={
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  {selectedRow.findingId && (
                    <Button
                      variant="primary"
                      size="sm"
                      iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setDrawerOpen(false);
                        navigate(`/review/findings/${selectedRow.findingId}`);
                      }}
                    >
                      Open Finding ({selectedRow.findingId})
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
                    Inspect Vault
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
                  <PriorityBadge priority={selectedRow.severity} />
                  <StatusBadge status={selectedRow.status} />
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-500/30 font-semibold">
                    {selectedRow.controlId}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#94a3b8]">{selectedRow.updatedAt}</span>
              </div>

              <div className="p-3.5 rounded-md bg-[#131922] border border-[#212c3d] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#38bdf8] uppercase tracking-wider font-semibold">
                  <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
                  Supervisory Negative Space Formulation
                </div>
                <p className="text-[12px] text-[#cbd5e1] leading-relaxed">
                  {selectedRow.explanation}
                </p>
                <div className="text-[11px] text-[#94a3b8] pt-1">
                  <strong>Trigger context:</strong> {selectedRow.reason}
                </div>
              </div>

              {/* Expected Requirement vs Missing Activity/Evidence */}
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold font-mono">
                  Operational Negative Space Breakdown
                </div>

                {/* Expected Requirement */}
                <div className="p-3 rounded bg-[#0d121c] border border-emerald-500/30 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Expected Requirement
                  </div>
                  <p className="text-[#e2e8f0] text-[12px] leading-relaxed">
                    {selectedRow.expectedActivity}
                  </p>
                  <div className="text-[10px] font-mono text-emerald-400/80 pt-1">
                    Standard: {selectedRow.requiredEvidence}
                  </div>
                </div>

                {/* Missing Activity / Evidence */}
                <div className="p-3 rounded bg-[#0d121c] border border-rose-500/30 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Missing Activity &amp; Evidence
                  </div>
                  <p className="text-[#f87171] text-[12px] font-medium leading-relaxed">
                    {selectedRow.missingEvidence}
                  </p>
                  <div className="text-[10px] font-mono text-rose-400/80 pt-1">
                    Telemetry Void State: {selectedRow.evidenceState}
                  </div>
                </div>
              </div>

              {/* Evidence Searched (Section 6) */}
              <div className="p-3 rounded-lg bg-[#0d121c] border border-[#212c3d] space-y-2">
                <div className="text-[11px] font-mono uppercase text-[#38bdf8] font-semibold flex items-center gap-1.5">
                  <SearchCode className="w-3.5 h-3.5" />
                  Evidence Searched &amp; Ingestion Trace
                </div>
                <div className="text-[11px] text-[#cbd5e1] leading-relaxed">
                  {selectedRow.evidenceSearched}
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#64748b]">
                  <span>Scope: {selectedRow.cseId} Supervisory Vault</span>
                  <Link to="/evidence" className="text-[#38bdf8] hover:underline flex items-center gap-1">
                    Open Evidence Explorer <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Supporting Evidence List */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-[#64748b] uppercase font-semibold">
                  Supporting Evidence Records ({selectedRow.supportingEvidence.length})
                </div>
                {selectedRow.supportingEvidence.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedRow.supportingEvidence.map(evId => (
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
                  <div className="p-2.5 rounded bg-[#0d121c] border border-[#212c3d] text-[11px] text-[#64748b] italic">
                    Zero supporting evidence submitted by CSE for this operational checkpoint.
                  </div>
                )}
              </div>

              {/* Control, Rule & Signal Traceability */}
              <div className="p-3 rounded-lg bg-[#0d121c] border border-[#212c3d] space-y-2">
                <div className="text-[11px] font-mono uppercase text-[#64748b] font-semibold">
                  Governance &amp; Finding Traceability
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#94a3b8]">Applicable Control:</span>
                    <div className="text-[#60a5fa] font-mono mt-0.5 font-medium">{selectedRow.controlId} (v{selectedRow.controlVersion})</div>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Supervisory Signal:</span>
                    <div className="text-[#f1f5f9] font-mono mt-0.5">{selectedRow.signalId}</div>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Analytical Rule:</span>
                    <div className="text-[#cbd5e1] font-mono mt-0.5">{selectedRow.ruleVersion}</div>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Formal Finding:</span>
                    <div className="text-[#38bdf8] font-mono mt-0.5">
                      {selectedRow.findingId ? (
                        <Link to={`/review/findings/${selectedRow.findingId}`} className="hover:underline flex items-center gap-1">
                          {selectedRow.findingId} <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-[#64748b]">Candidate signal only</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Drawer>
        )}

      </div>
    </PageContainer>
  );
};
