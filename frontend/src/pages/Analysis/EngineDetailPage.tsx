import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  PageContainer, 
  PageHeader, 
  KpiCard, 
  PriorityBadge, 
  StatusBadge, 
  Button,
  Input,
  Select
} from '@/components/common';
import { 
  AUTHORITATIVE_ENGINES, 
  AnalyticsSignal, 
  getEngineBySlug, 
  getSignalsByEngineSlug 
} from '@/data/mock/analysis';
import { AnalyticsSignalDrawer } from './components/AnalyticsSignalDrawer';
import { 
  ArrowLeft, 
  Filter, 
  Search, 
  RotateCcw, 
  ExternalLink, 
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Building2,
  FileCheck2,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

export const EngineDetailPage: React.FC<{ forcedSlug?: string }> = ({ forcedSlug }) => {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const navigate = useNavigate();

  const slug = forcedSlug || engineSlug || 'execution-gap';
  const engineMeta = getEngineBySlug(slug) || AUTHORITATIVE_ENGINES[0];

  // Selected Signal for Drawer
  const [selectedSignal, setSelectedSignal] = useState<AnalyticsSignal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCse, setSelectedCse] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [secondaryFilter, setSecondaryFilter] = useState('ALL');

  // Load signals for this engine
  const allEngineSignals = useMemo(() => {
    return getSignalsByEngineSlug(engineMeta.slug);
  }, [engineMeta.slug]);

  // Unique CSEs for dropdown
  const cseOptions = useMemo(() => {
    const list = Array.from(new Set(allEngineSignals.map(s => `${s.cseName} (${s.cseId})`)));
    return ['ALL', ...list];
  }, [allEngineSignals]);

  // Filtered signals
  const filteredSignals = useMemo(() => {
    return allEngineSignals.filter(signal => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          signal.title.toLowerCase().includes(q) ||
          signal.reason.toLowerCase().includes(q) ||
          signal.cseName.toLowerCase().includes(q) ||
          signal.cseId.toLowerCase().includes(q) ||
          signal.controlId.toLowerCase().includes(q) ||
          (signal.findingId && signal.findingId.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // CSE Filter
      if (selectedCse !== 'ALL') {
        const matchesCse = `${signal.cseName} (${signal.cseId})` === selectedCse;
        if (!matchesCse) return false;
      }

      // Priority
      if (selectedPriority !== 'ALL' && signal.priority !== selectedPriority) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL' && signal.status !== selectedStatus) {
        return false;
      }

      // Secondary engine-specific filter
      if (secondaryFilter !== 'ALL') {
        if (signal.gapType && signal.gapType !== secondaryFilter) return false;
        if (signal.evidenceState && signal.evidenceState !== secondaryFilter) return false;
        if (signal.coverageArea && signal.coverageArea !== secondaryFilter) return false;
        if (signal.deviationType && signal.deviationType !== secondaryFilter) return false;
      }

      return true;
    });
  }, [allEngineSignals, searchQuery, selectedCse, selectedPriority, selectedStatus, secondaryFilter]);

  // KPI Calculations (Strictly Max 4 KPI Cards per Section 21)
  const kpis: Array<{
    title: string;
    value: string | number;
    subtitle: string;
    semantic: 'blue' | 'red' | 'neutral' | 'green' | 'amber';
    alert?: boolean;
  }> = useMemo(() => {
    const totalSignals = allEngineSignals.length;
    const highPriority = allEngineSignals.filter(s => s.priority === 'CRITICAL' || s.priority === 'HIGH').length;
    const affectedCses = new Set(allEngineSignals.map(s => s.cseId)).size;
    const affectedControls = new Set(allEngineSignals.map(s => s.controlId)).size;

    switch (engineMeta.id) {
      case 'EXECUTION_GAP':
        return [
          { title: 'Execution Gaps', value: totalSignals, subtitle: 'Identified Discrepancies', semantic: 'blue' },
          { title: 'High Priority', value: highPriority, subtitle: 'Immediate Examiner Attention', semantic: 'red', alert: highPriority > 0 },
          { title: 'Affected CSEs', value: affectedCses, subtitle: 'Critical Infrastructure Entities', semantic: 'neutral' },
          { title: 'Affected Controls', value: affectedControls, subtitle: 'Statutory Control Standards', semantic: 'green' },
        ];
      case 'NEGATIVE_SPACE':
        const confirmedMissing = allEngineSignals.filter(s => s.evidenceState === 'ABSENT_CONFIRMED').length;
        const unsubmitted = allEngineSignals.filter(s => s.evidenceState === 'NOT_SUBMITTED' || s.evidenceState === 'UNKNOWN').length;
        return [
          { title: 'Negative-Space Candidates', value: totalSignals, subtitle: 'Expected Records Evaluated', semantic: 'blue' },
          { title: 'High Priority', value: highPriority, subtitle: 'Significant Evidentiary Gaps', semantic: 'red', alert: highPriority > 0 },
          { title: 'Confirmed Missing', value: confirmedMissing, subtitle: 'Confirmed Absent Records', semantic: 'amber' },
          { title: 'Unsubmitted / Unknown', value: unsubmitted, subtitle: 'Pending Regulatory Ingestion', semantic: 'neutral' },
        ];
      case 'COVERAGE':
        return [
          { title: 'Coverage Signals', value: totalSignals, subtitle: 'Telemetry Void Inquiries', semantic: 'blue' },
          { title: 'Affected CSEs', value: affectedCses, subtitle: 'Entities with Monitoring Voids', semantic: 'neutral' },
          { title: 'Affected Assets', value: totalSignals * 6, subtitle: 'Perimeter & SCADA Nodes', semantic: 'amber' },
          { title: 'Affected Controls', value: affectedControls, subtitle: 'Boundary & Telemetry Rules', semantic: 'green' },
        ];
      case 'PROCESS_CONFORMANCE':
        return [
          { title: 'Cases Analyzed', value: 48, subtitle: 'SOAR & Triage Execution Traces', semantic: 'neutral' },
          { title: 'Deviations', value: totalSignals, subtitle: 'Observed Petri-Net Variants', semantic: 'blue' },
          { title: 'High Priority', value: highPriority, subtitle: 'Bypassed Statutory Stages', semantic: 'red', alert: highPriority > 0 },
          { title: 'Process Patterns', value: '4 Sequences', subtitle: 'Standardized Ingestion Chains', semantic: 'green' },
        ];
      case 'INVESTIGATION_QUALITY':
        return [
          { title: 'Investigations Analyzed', value: 64, subtitle: 'Completed Incident Dossiers', semantic: 'neutral' },
          { title: 'Signals Detected', value: totalSignals, subtitle: 'Deficient Quality Flags', semantic: 'blue' },
          { title: 'Evidence-Link Issues', value: 2, subtitle: 'Broken Telemetry Cross-Links', semantic: 'amber' },
          { title: 'Outcome Consistency', value: '78.2%', subtitle: 'Corroborated Resolution Rationale', semantic: 'green' },
        ];
      case 'BEHAVIOURAL_DEVIATION':
        return [
          { title: 'Behavioural Signals', value: totalSignals, subtitle: 'Operational Shifts Flagged', semantic: 'blue' },
          { title: 'CSEs Affected', value: affectedCses, subtitle: 'Baseline Anomaly Detected', semantic: 'neutral' },
          { title: 'Baselines Available', value: '6 Entities', subtitle: 'Validated Statistical Windows', semantic: 'green' },
          { title: 'Significant Deviations', value: highPriority, subtitle: 'Exceeding 3-Sigma Threshold', semantic: 'red', alert: highPriority > 0 },
        ];
      case 'HISTORICAL_COMPARISON':
        return [
          { title: 'Current Assessment', value: 'Q3 2026', subtitle: 'Active Evaluation Cycle', semantic: 'neutral' },
          { title: 'Previous Assessments', value: '3 Cycles', subtitle: 'Comparative Baseline Data', semantic: 'blue' },
          { title: 'Recurring Issues', value: totalSignals, subtitle: 'Persistent Control Failures', semantic: 'amber' },
          { title: 'Significant Changes', value: 2, subtitle: 'Material Remediation Regressions', semantic: 'red', alert: true },
        ];
      case 'PEER_BENCHMARKING':
        return [
          { title: 'CSEs Evaluated', value: affectedCses, subtitle: 'Regulated Critical Operators', semantic: 'neutral' },
          { title: 'Peer Cohorts', value: '4 Sectors', subtitle: 'Authorized Aggregated Baselines', semantic: 'blue' },
          { title: 'Metrics Compared', value: 12, subtitle: 'Operational Telemetry Ratios', semantic: 'green' },
          { title: 'Contextual Deviations', value: totalSignals, subtitle: 'Cohort Baseline Outliers', semantic: 'amber' },
        ];
      case 'CROSS_SOURCE_CONSISTENCY':
        return [
          { title: 'Consistency Checks', value: 36, subtitle: 'Independent Ingestion Streams', semantic: 'neutral' },
          { title: 'Discrepancies', value: totalSignals, subtitle: 'Parity Variance Detected', semantic: 'blue' },
          { title: 'High Priority', value: highPriority, subtitle: 'Significant Event Deficit', semantic: 'red', alert: highPriority > 0 },
          { title: 'Affected CSEs', value: affectedCses, subtitle: 'Divergent Pipeline Records', semantic: 'green' },
        ];
      case 'METRIC_INTEGRITY':
        return [
          { title: 'Metrics Reviewed', value: 24, subtitle: 'Self-Attested KPI Submissions', semantic: 'neutral' },
          { title: 'Inconsistencies', value: totalSignals, subtitle: 'Attestation-Telemetry Gaps', semantic: 'blue' },
          { title: 'High Priority', value: highPriority, subtitle: 'Discrepancies > 15%', semantic: 'red', alert: highPriority > 0 },
          { title: 'Affected CSEs', value: affectedCses, subtitle: 'Entities with Attestation Gaps', semantic: 'green' },
        ];
      default:
        return [
          { title: 'Total Signals', value: totalSignals, subtitle: 'Active Detections', semantic: 'blue' },
          { title: 'High Priority', value: highPriority, subtitle: 'Requires Review', semantic: 'red' },
          { title: 'Affected CSEs', value: affectedCses, subtitle: 'Entities Impacted', semantic: 'neutral' },
          { title: 'Affected Controls', value: affectedControls, subtitle: 'Applicable Standards', semantic: 'green' },
        ];
    }
  }, [engineMeta, allEngineSignals]);

  const handleOpenSignal = (signal: AnalyticsSignal) => {
    setSelectedSignal(signal);
    setDrawerOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCse('ALL');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setSecondaryFilter('ALL');
  };

  return (
    <PageContainer>
      {/* 1. STANDARD PAGE HEADER (Section 7 & 8) */}

      <PageHeader
        title={engineMeta.name}
        description={engineMeta.purpose}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              icon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => navigate('/analysis')}
            >
              Back to Analysis Hub
            </Button>
            <span className="text-[11px] font-mono text-[#94a3b8] bg-[#111622] px-3 py-1.5 rounded border border-[#212c3d]">
              Engine: <strong className="text-[#38bdf8]">{engineMeta.id}</strong>
            </span>
          </div>
        }
      />

      {/* 2. SMALL SUMMARY: STRICTLY MAXIMUM 4 KPI CARDS (Section 21) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 min-w-0">
        {kpis.map((kpi, idx) => (
          <KpiCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            semantic={kpi.semantic}
            alert={kpi.alert}
          />
        ))}
      </div>

      {/* 3. OPTIONAL COMPACT VISUALIZATION (MAX 1 SIMPLE CHART - Section 22) */}
      {engineMeta.id === 'HISTORICAL_COMPARISON' && (
        <div className="p-4 rounded-lg bg-[#111622] border border-[#212c3d]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12px] font-semibold text-[#f1f5f9] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">timeline</span>
              Remediation Persistence & Recurrence Trend Across Assessment Cycles
            </div>
            <span className="text-[10px] font-mono text-[#94a3b8]">3 Assessment Cycles Compared</span>
          </div>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { cycle: 'Q2 2025', recurrences: 3, resolved: 8 },
                { cycle: 'Q4 2025', recurrences: 2, resolved: 11 },
                { cycle: 'Q3 2026 (Active)', recurrences: 4, resolved: 7 },
              ]}>
                <XAxis dataKey="cycle" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111622', borderColor: '#212c3d', fontSize: '11px', color: '#f1f5f9' }}
                />
                <Bar dataKey="recurrences" fill="#f43f5e" name="Recurring Issues" radius={[3, 3, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" name="Sustained Controls" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {engineMeta.id === 'BEHAVIOURAL_DEVIATION' && (
        <div className="p-4 rounded-lg bg-[#111622] border border-[#212c3d]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12px] font-semibold text-[#f1f5f9] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">psychology</span>
              Baseline vs Current Operational Behaviour Distribution
            </div>
            <span className="text-[10px] font-mono text-[#94a3b8]">3-Sigma Statistical Window</span>
          </div>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { metric: 'Off-Hours Closures (%)', Baseline: 5.2, Current: 18.6 },
                { metric: 'Manual Escalations (/mo)', Baseline: 28, Current: 3 },
                { metric: 'Triage Latency (min)', Baseline: 12, Current: 44 },
              ]}>
                <XAxis dataKey="metric" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111622', borderColor: '#212c3d', fontSize: '11px', color: '#f1f5f9' }}
                />
                <Bar dataKey="Baseline" fill="#3b82f6" name="Validated Baseline" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Current" fill="#f59e0b" name="Observed Current" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. FILTER SYSTEM (Section 20: General + Engine-Specific + [More Filters]) */}
      <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search signals, controls, CSEs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d121c] border border-[#212c3d] rounded text-[12px] text-[#f1f5f9] pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          {/* CSE Selector */}
          <select
            value={selectedCse}
            onChange={(e) => setSelectedCse(e.target.value)}
            className="bg-[#0d121c] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#3b82f6]"
          >
            <option value="ALL">All Regulated CSEs</option>
            {cseOptions.filter(c => c !== 'ALL').map(cse => (
              <option key={cse} value={cse}>{cse}</option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-[#0d121c] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#3b82f6]"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Action Row: More Filters + Reset */}
          <div className="flex items-center gap-2">
            <Button
              variant={showMoreFilters ? 'secondary' : 'outline'}
              size="sm"
              icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="flex-1 justify-center"
            >
              {showMoreFilters ? 'Hide Filters' : 'More Filters'}
            </Button>
            {(searchQuery || selectedCse !== 'ALL' || selectedPriority !== 'ALL' || secondaryFilter !== 'ALL') && (
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

        {/* Collapsible Secondary Filters (Section 20) */}
        {showMoreFilters && (
          <div className="pt-2 border-t border-[#212c3d] grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] font-mono text-[#94a3b8] uppercase mb-1 block">Review Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[#0d121c] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="ALL">All Statuses</option>
                <option value="CANDIDATE">Candidate</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="VALIDATED">Validated</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
            </div>

            {/* Engine specific secondary filter */}
            {engineMeta.id === 'EXECUTION_GAP' && (
              <div>
                <label className="text-[10px] font-mono text-[#94a3b8] uppercase mb-1 block">Gap Type</label>
                <select
                  value={secondaryFilter}
                  onChange={(e) => setSecondaryFilter(e.target.value)}
                  className="w-full bg-[#0d121c] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="ALL">All Gap Types</option>
                  <option value="Missing Execution">Missing Execution</option>
                  <option value="Delayed Execution">Delayed Execution</option>
                  <option value="Incorrect Sequence">Incorrect Sequence</option>
                  <option value="Incomplete Execution">Incomplete Execution</option>
                </select>
              </div>
            )}

            {engineMeta.id === 'NEGATIVE_SPACE' && (
              <div>
                <label className="text-[10px] font-mono text-[#94a3b8] uppercase mb-1 block">Evidence State</label>
                <select
                  value={secondaryFilter}
                  onChange={(e) => setSecondaryFilter(e.target.value)}
                  className="w-full bg-[#0d121c] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="ALL">All Evidence States</option>
                  <option value="ABSENT_CONFIRMED">Confirmed Missing</option>
                  <option value="NOT_SUBMITTED">Not Submitted</option>
                  <option value="NOT_APPLICABLE">Not Applicable</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>
            )}

            {engineMeta.id === 'COVERAGE' && (
              <div>
                <label className="text-[10px] font-mono text-[#94a3b8] uppercase mb-1 block">Coverage Area</label>
                <select
                  value={secondaryFilter}
                  onChange={(e) => setSecondaryFilter(e.target.value)}
                  className="w-full bg-[#0d121c] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="ALL">All Coverage Areas</option>
                  <option value="Asset Coverage">Asset Coverage</option>
                  <option value="Monitoring Coverage">Monitoring Coverage</option>
                  <option value="Alert-Class Coverage">Alert-Class Coverage</option>
                  <option value="Investigation Coverage">Investigation Coverage</option>
                </select>
              </div>
            )}

            {engineMeta.id === 'PROCESS_CONFORMANCE' && (
              <div>
                <label className="text-[10px] font-mono text-[#94a3b8] uppercase mb-1 block">Deviation Type</label>
                <select
                  value={secondaryFilter}
                  onChange={(e) => setSecondaryFilter(e.target.value)}
                  className="w-full bg-[#0d121c] border border-[#212c3d] rounded text-[12px] text-[#cbd5e1] px-2.5 py-1.5 focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="ALL">All Deviations</option>
                  <option value="Missing Step">Missing Step</option>
                  <option value="Unexpected Step">Unexpected Step</option>
                  <option value="Sequence Deviation">Sequence Deviation</option>
                  <option value="Closure Anomaly">Closure Anomaly</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. MAIN ANALYTICAL OUTPUT TABLE (Sections 9-18) */}
      <div className="rounded-lg bg-[#111622] border border-[#212c3d] overflow-hidden">
        <div className="p-3 border-b border-[#212c3d] flex items-center justify-between bg-[#0d121c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">
              {engineMeta.iconName}
            </span>
            <span className="text-[13px] font-semibold text-[#f1f5f9]">
              Analytical Signals ({filteredSignals.length})
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#94a3b8]">
            Click row for signal explainability & evidence trace
          </span>
        </div>

        {filteredSignals.length === 0 ? (
          /* Empty State (Section 33) */
          <div className="p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-[#64748b] text-[36px]">filter_list_off</span>
            <div className="text-[14px] font-semibold text-[#f1f5f9]">
              No {engineMeta.shortName} signals match the current filters
            </div>
            <p className="text-[12px] text-[#94a3b8] max-w-md mx-auto">
              Adjust your search keywords, CSE selection, or priority filters to view available analytical signals.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleResetFilters}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#0d121c] text-[#94a3b8] font-mono uppercase text-[10px] tracking-wider border-b border-[#212c3d]">
                {/* Engine-specific table headers as specified in Sections 9-18 */}
                {engineMeta.id === 'EXECUTION_GAP' && (
                  <tr>
                    <th className="py-2.5 px-3">CSE</th>
                    <th className="py-2.5 px-3">Control</th>
                    <th className="py-2.5 px-3">Expected Step</th>
                    <th className="py-2.5 px-3">Observed Evidence</th>
                    <th className="py-2.5 px-3">Gap Type</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Evidence</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                )}
                {engineMeta.id === 'NEGATIVE_SPACE' && (
                  <tr>
                    <th className="py-2.5 px-3">Evidence Requirement</th>
                    <th className="py-2.5 px-3">CSE</th>
                    <th className="py-2.5 px-3">Control</th>
                    <th className="py-2.5 px-3">Evidence State</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Related Finding</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                )}
                {engineMeta.id === 'COVERAGE' && (
                  <tr>
                    <th className="py-2.5 px-3">CSE</th>
                    <th className="py-2.5 px-3">Coverage Area</th>
                    <th className="py-2.5 px-3">Expected</th>
                    <th className="py-2.5 px-3">Observed</th>
                    <th className="py-2.5 px-3">Gap</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                )}
                {engineMeta.id === 'PROCESS_CONFORMANCE' && (
                  <tr>
                    <th className="py-2.5 px-3">Signal / Case</th>
                    <th className="py-2.5 px-3">CSE</th>
                    <th className="py-2.5 px-3">Expected Sequence</th>
                    <th className="py-2.5 px-3">Observed Sequence</th>
                    <th className="py-2.5 px-3">Deviation</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                )}
                {engineMeta.id === 'INVESTIGATION_QUALITY' && (
                  <tr>
                    <th className="py-2.5 px-3">Investigation</th>
                    <th className="py-2.5 px-3">CSE</th>
                    <th className="py-2.5 px-3">Evidence Linkage</th>
                    <th className="py-2.5 px-3">Investigation Depth</th>
                    <th className="py-2.5 px-3">Outcome Consistency</th>
                    <th className="py-2.5 px-3">Signal</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                )}
                {engineMeta.id === 'BEHAVIOURAL_DEVIATION' && (
                  <tr>
                    <th className="py-2.5 px-3">CSE</th>
                    <th className="py-2.5 px-3">Metric</th>
                    <th className="py-2.5 px-3">Baseline</th>
                    <th className="py-2.5 px-3">Current</th>
                    <th className="py-2.5 px-3">Deviation</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                )}
                {engineMeta.id === 'HISTORICAL_COMPARISON' && (
                  <tr>
                    <th className="py-2.5 px-3">Signal Title</th>
                    <th className="py-2.5 px-3">CSE</th>
                    <th className="py-2.5 px-3">Periods Compared</th>
                    <th className="py-2.5 px-3">Recurrence / Trend</th>
                    <th className="py-2.5 px-3">Observed Change</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                )}
                {engineMeta.id === 'PEER_BENCHMARKING' && (
                  <tr>
                    <th className="py-2.5 px-3">CSE</th>
                    <th className="py-2.5 px-3">Metric</th>
                    <th className="py-2.5 px-3">CSE Value</th>
                    <th className="py-2.5 px-3">Peer Baseline</th>
                    <th className="py-2.5 px-3">Contextual Deviation</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                )}
                {engineMeta.id === 'CROSS_SOURCE_CONSISTENCY' && (
                  <tr>
                    <th className="py-2.5 px-3">CSE</th>
                    <th className="py-2.5 px-3">Source A (Telemetry)</th>
                    <th className="py-2.5 px-3">Source B (Collector)</th>
                    <th className="py-2.5 px-3">Discrepancy</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                )}
                {engineMeta.id === 'METRIC_INTEGRITY' && (
                  <tr>
                    <th className="py-2.5 px-3">KPI Under Review</th>
                    <th className="py-2.5 px-3">CSE</th>
                    <th className="py-2.5 px-3">Attested Value</th>
                    <th className="py-2.5 px-3">Forensic Value</th>
                    <th className="py-2.5 px-3">Difference</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                )}
              </thead>

              <tbody className="divide-y divide-[#212c3d]">
                {filteredSignals.map(signal => (
                  <tr
                    key={signal.signalId}
                    onClick={() => handleOpenSignal(signal)}
                    className="hover:bg-[#161e29]/70 cursor-pointer transition-colors"
                  >
                    {/* Execution Gap Row */}
                    {engineMeta.id === 'EXECUTION_GAP' && (
                      <>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#f1f5f9]">{signal.cseName}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.cseId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#60a5fa]">{signal.controlId}</td>
                        <td className="py-3 px-3 text-[#cbd5e1] max-w-[220px] truncate" title={signal.expected}>
                          {signal.expected}
                        </td>
                        <td className="py-3 px-3 text-[#94a3b8] max-w-[220px] truncate" title={signal.observed}>
                          {signal.observed}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#161e29] border border-[#212c3d] text-amber-300">
                            {signal.gapType || 'Execution Variance'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <PriorityBadge priority={signal.priority} />
                        </td>
                        <td className="py-3 px-3 font-mono text-[#38bdf8] text-[11px]">
                          {signal.evidenceIds.join(', ')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenSignal(signal); }}>
                            Review
                          </Button>
                        </td>
                      </>
                    )}

                    {/* Negative Space Row */}
                    {engineMeta.id === 'NEGATIVE_SPACE' && (
                      <>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#f1f5f9]">{signal.title}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.signalId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[#f1f5f9]">{signal.cseName}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.cseId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#60a5fa]">{signal.controlId}</td>
                        <td className="py-3 px-3">
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                            signal.evidenceState === 'ABSENT_CONFIRMED'
                              ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                              : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                          }`}>
                            {signal.evidenceState || 'NOT_SUBMITTED'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <PriorityBadge priority={signal.priority} />
                        </td>
                        <td className="py-3 px-3 font-mono text-[#38bdf8]">
                          {signal.findingId || '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenSignal(signal); }}>
                            Review
                          </Button>
                        </td>
                      </>
                    )}

                    {/* Coverage & Blind Spots Row */}
                    {engineMeta.id === 'COVERAGE' && (
                      <>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#f1f5f9]">{signal.cseName}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.cseId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-cyan-300">{signal.coverageArea}</td>
                        <td className="py-3 px-3 text-[#cbd5e1] max-w-[200px] truncate" title={signal.expected}>
                          {signal.expected}
                        </td>
                        <td className="py-3 px-3 text-[#94a3b8] max-w-[200px] truncate" title={signal.observed}>
                          {signal.observed}
                        </td>
                        <td className="py-3 px-3 text-amber-300 font-medium">
                          {signal.difference}
                        </td>
                        <td className="py-3 px-3">
                          <PriorityBadge priority={signal.priority} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenSignal(signal); }}>
                            Review
                          </Button>
                        </td>
                      </>
                    )}

                    {/* Process Conformance Row */}
                    {engineMeta.id === 'PROCESS_CONFORMANCE' && (
                      <>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#f1f5f9]">{signal.title}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.signalId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[#f1f5f9]">{signal.cseName}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.cseId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-400 text-[11px] max-w-[200px] truncate">
                          {signal.expectedProcess || signal.expected}
                        </td>
                        <td className="py-3 px-3 font-mono text-rose-400 text-[11px] max-w-[200px] truncate">
                          {signal.observedProcess || signal.observed}
                        </td>
                        <td className="py-3 px-3 text-amber-300">
                          {signal.deviationType || signal.difference}
                        </td>
                        <td className="py-3 px-3">
                          <PriorityBadge priority={signal.priority} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenSignal(signal); }}>
                            Review
                          </Button>
                        </td>
                      </>
                    )}

                    {/* Investigation Quality Row */}
                    {engineMeta.id === 'INVESTIGATION_QUALITY' && (
                      <>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#f1f5f9]">{signal.title}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.signalId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[#f1f5f9]">{signal.cseName}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.cseId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                            signal.evidenceLinkage === 'Broken' ? 'bg-rose-950/40 text-rose-300 border-rose-500/40' : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                          }`}>
                            {signal.evidenceLinkage || 'Partial'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#cbd5e1]">{signal.investigationDepth || 'Adequate'}</td>
                        <td className="py-3 px-3 text-[#94a3b8]">{signal.outcomeConsistency || 'Consistent'}</td>
                        <td className="py-3 px-3">
                          <PriorityBadge priority={signal.priority} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenSignal(signal); }}>
                            Review
                          </Button>
                        </td>
                      </>
                    )}

                    {/* Behavioural Deviation Row */}
                    {engineMeta.id === 'BEHAVIOURAL_DEVIATION' && (
                      <>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#f1f5f9]">{signal.cseName}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.cseId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#60a5fa]">{signal.metricName || 'Activity Volume'}</td>
                        <td className="py-3 px-3 font-mono text-emerald-400">{signal.baselineValue || '5.2%'}</td>
                        <td className="py-3 px-3 font-mono text-amber-400">{signal.currentValue || '18.6%'}</td>
                        <td className="py-3 px-3 text-rose-300 font-medium">{signal.difference}</td>
                        <td className="py-3 px-3">
                          <PriorityBadge priority={signal.priority} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenSignal(signal); }}>
                            Review
                          </Button>
                        </td>
                      </>
                    )}

                    {/* Historical Comparison Row */}
                    {engineMeta.id === 'HISTORICAL_COMPARISON' && (
                      <>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#f1f5f9]">{signal.title}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.signalId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[#f1f5f9]">{signal.cseName}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.cseId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#38bdf8]">{signal.historicalPeriod || 'Q4 2025 vs Q3 2026'}</td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-500/40">
                            {signal.trendDirection?.toUpperCase() || 'RECURRENT'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#cbd5e1] max-w-[260px] truncate" title={signal.difference}>
                          {signal.difference}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenSignal(signal); }}>
                            Review
                          </Button>
                        </td>
                      </>
                    )}

                    {/* Peer Benchmarking Row */}
                    {engineMeta.id === 'PEER_BENCHMARKING' && (
                      <>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#f1f5f9]">{signal.cseName}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.cseId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#60a5fa]">{signal.metricName}</td>
                        <td className="py-3 px-3 font-mono text-amber-400">{signal.currentValue}</td>
                        <td className="py-3 px-3 font-mono text-emerald-400">{signal.peerCohortValue}</td>
                        <td className="py-3 px-3 text-[#cbd5e1]">{signal.difference}</td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenSignal(signal); }}>
                            Review
                          </Button>
                        </td>
                      </>
                    )}

                    {/* Cross-Source Consistency Row */}
                    {engineMeta.id === 'CROSS_SOURCE_CONSISTENCY' && (
                      <>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#f1f5f9]">{signal.cseName}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.cseId}</div>
                        </td>
                        <td className="py-3 px-3 text-[#94a3b8] text-[11px] max-w-[200px] truncate" title={signal.sourceA}>
                          {signal.sourceA}
                        </td>
                        <td className="py-3 px-3 text-[#94a3b8] text-[11px] max-w-[200px] truncate" title={signal.sourceB}>
                          {signal.sourceB}
                        </td>
                        <td className="py-3 px-3 text-amber-300 font-medium">
                          {signal.difference}
                        </td>
                        <td className="py-3 px-3">
                          <PriorityBadge priority={signal.priority} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenSignal(signal); }}>
                            Review
                          </Button>
                        </td>
                      </>
                    )}

                    {/* Metric Integrity Row */}
                    {engineMeta.id === 'METRIC_INTEGRITY' && (
                      <>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#f1f5f9]">{signal.title}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.signalId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[#f1f5f9]">{signal.cseName}</div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">{signal.cseId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-400">{signal.kpiReported}</td>
                        <td className="py-3 px-3 font-mono text-rose-400">{signal.kpiObserved}</td>
                        <td className="py-3 px-3 text-amber-300 font-medium">{signal.difference}</td>
                        <td className="py-3 px-3">
                          <PriorityBadge priority={signal.priority} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenSignal(signal); }}>
                            Review
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. COMMON SIGNAL DETAIL DRAWER (Section 19) */}
      <AnalyticsSignalDrawer
        signal={selectedSignal}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </PageContainer>
  );
};
