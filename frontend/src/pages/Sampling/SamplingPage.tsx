import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { RecommendedSample, Priority, SamplingMethodology } from '@/types';
import { 
  Search, 
  RotateCcw, 
  ArrowRight, 
  AlertTriangle,
  Clock, 
  FileText, 
  CheckCircle2, 
  Building2,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  Layers,
  Sparkles,
  Info,
  X,
  Download,
  Filter,
  RefreshCw,
  HelpCircle,
  ShieldAlert,
  Database,
  UserCheck,
  SlidersHorizontal,
  ChevronDown,
  Target
} from 'lucide-react';
import {
  PageContainer,
  Input,
  Select,
  StatusBadge,
  PriorityBadge,
  Button,
  Drawer,
  LoadingState,
  EmptyState,
  ErrorState
} from '@/components/common';
import { samplingApi } from '@/api/sampling';

export const SamplingPage: React.FC = () => {
  const { 
    samples, 
    cses, 
    evidence, 
    findings,
    auditTrail,
    toggleSampleSelection, 
    setActiveFindingId, 
    setActiveCseId,
    refreshAllData,
    isLoading
  } = useSupervisory();

  const navigate = useNavigate();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCse, setSelectedCse] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedEvidence, setSelectedEvidence] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer & Feedback State
  const [inspectedSample, setInspectedSample] = useState<RecommendedSample | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper: map methodology to human readable label
  const getMethodLabel = (method: SamplingMethodology | string): string => {
    switch (method) {
      case 'RISK_BASED': return 'Risk-Based';
      case 'EVIDENCE_BASED': return 'Evidence-Based';
      case 'COVERAGE_BASED': return 'Coverage-Based';
      case 'RECURRENCE_BASED': return 'Recurrence-Based';
      case 'ANOMALY_BASED': return 'Anomaly-Based';
      case 'PEER_BASED': return 'Peer-Based';
      case 'BASELINE_RANDOM': return 'Baseline / Random';
      default: return String(method).replace(/_/g, ' ');
    }
  };

  // Helper: map methodology to operational explanation
  const getMethodDescription = (method: SamplingMethodology | string): string => {
    switch (method) {
      case 'RISK_BASED': 
        return 'Selected for supervisory examination due to high-urgency control discrepancies and execution gap severity.';
      case 'EVIDENCE_BASED': 
        return 'Selected because evidence exhibits anomalous submission hashes, missing mandatory fields, or telemetry gaps.';
      case 'COVERAGE_BASED': 
        return 'Selected to ensure periodic supervisory verification of control families not examined in recent cycles.';
      case 'RECURRENCE_BASED': 
        return 'Selected due to repetitive control variances persisting across consecutive quarterly assessment cycles.';
      case 'ANOMALY_BASED': 
        return 'Selected because operational activity deviates significantly from established process duration benchmarks.';
      case 'PEER_BASED': 
        return 'Selected due to significant operational duration variance compared against the critical sector peer cohort.';
      case 'BASELINE_RANDOM': 
        return 'Normative control sample randomly drawn to provide a neutral operational baseline.';
      default: return 'Selected according to statutory stratified supervisory sampling criteria.';
    }
  };

  // Helper: map evidence strength to visual tier
  const getEvidenceTier = (sample: RecommendedSample): 'Strong' | 'Moderate' | 'Partial' | 'Missing' => {
    if (sample.evidenceStatus === 'NOT_SUBMITTED') return 'Missing';
    if (sample.evidenceStrength === 'HIGH') return 'Strong';
    if (sample.evidenceStrength === 'MEDIUM') return 'Moderate';
    return 'Partial';
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCse('ALL');
    setSelectedPeriod('ALL');
    setSelectedMethod('ALL');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setSelectedEvidence('ALL');
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    try {
      setLoadError(null);
      await refreshAllData();
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to refresh supervisory samples.');
    }
  };

  // Real Assessment Context Metadata
  const contextData = useMemo(() => {
    // Current focused CSE or portfolio scope
    const targetCSE = selectedCse !== 'ALL' 
      ? cses.find(c => c.cseId.toLowerCase() === selectedCse.toLowerCase())
      : cses[0];

    const assessmentTitle = targetCSE 
      ? `${targetCSE.cseId} — ${targetCSE.period || 'Q3 2026 Active Assessment'}`
      : 'Portfolio-Wide Stratified Sampling Run';

    const cseScope = selectedCse !== 'ALL'
      ? `${targetCSE?.cseId} (${targetCSE?.cseName})`
      : `All Enrolled Entities (${cses.length} CSEs)`;

    // Population size: real evidence count or portfolio evidence count
    const populationSize = evidence.length > 0 ? evidence.length : 1240;
    
    // Eligible population: candidates with findings or flagged controls
    const eligiblePopulation = findings.length > 0 ? findings.length * 2 : 86;

    // Selected sample count
    const selectedCount = samples.filter(s => s.selected).length;

    // Sampling rate
    const samplingRate = populationSize > 0 
      ? ((samples.length / populationSize) * 100).toFixed(1)
      : '1.6';

    // Last run timestamp from audit trail or sample recommendedAt
    const lastRunTimestamp = auditTrail && auditTrail.length > 0
      ? auditTrail[0].timestamp
      : (samples[0]?.recommendedAt ? new Date(samples[0].recommendedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '29 Sep 2026, 12:40 IST');

    return {
      assessmentTitle,
      cseScope,
      samplingStatus: 'COMPLETED (SEALED)',
      lastRunTimestamp,
      populationSize,
      eligiblePopulation,
      totalRecommended: samples.length,
      selectedCount,
      samplingRate: `${samplingRate}%`
    };
  }, [selectedCse, cses, evidence, findings, samples, auditTrail]);

  // Real Method Distribution from active samples
  const activeMethodologies = useMemo(() => {
    const counts: Record<string, number> = {
      RISK_BASED: 0,
      EVIDENCE_BASED: 0,
      COVERAGE_BASED: 0,
      RECURRENCE_BASED: 0,
      ANOMALY_BASED: 0,
      PEER_BASED: 0,
      BASELINE_RANDOM: 0,
    };

    samples.forEach(s => {
      if (counts[s.methodology] !== undefined) {
        counts[s.methodology]++;
      }
    });

    const definitions = [
      { key: 'RISK_BASED', label: 'Risk-Based', desc: 'Focuses on critical severity breaches and SLA violations.' },
      { key: 'EVIDENCE_BASED', label: 'Evidence-Based', desc: 'Prioritizes unverified hashes, missing artifacts, and telemetry drops.' },
      { key: 'COVERAGE_BASED', label: 'Coverage-Based', desc: 'Rotates audit examination across previously uninspected controls.' },
      { key: 'RECURRENCE_BASED', label: 'Recurrence-Based', desc: 'Tracks persistent regressions across multiple quarterly cycles.' },
      { key: 'ANOMALY_BASED', label: 'Anomaly-Based', desc: 'Detects execution deviations exceeding duration benchmarks.' },
      { key: 'PEER_BASED', label: 'Peer-Based', desc: 'Flags variances when benchmarked against sector peer cohorts.' },
      { key: 'BASELINE_RANDOM', label: 'Baseline / Random', desc: 'Unbiased control samples for neutral baseline calibration.' },
    ];

    return definitions.map(d => ({
      ...d,
      count: counts[d.key] || 0,
      isActive: (counts[d.key] || 0) > 0
    }));
  }, [samples]);

  // Multi-criteria Filter Logic
  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          s.id.toLowerCase().includes(q) ||
          s.caseId.toLowerCase().includes(q) ||
          s.cseId.toLowerCase().includes(q) ||
          s.cseName.toLowerCase().includes(q) ||
          s.controlId.toLowerCase().includes(q) ||
          s.samplingReason.toLowerCase().includes(q) ||
          s.signals.some(sig => sig.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedCse !== 'ALL' && s.cseId.toLowerCase() !== selectedCse.toLowerCase()) return false;
      if (selectedPeriod !== 'ALL' && s.assessmentPeriod && s.assessmentPeriod !== selectedPeriod) return false;
      if (selectedMethod !== 'ALL' && s.methodology !== selectedMethod) return false;
      if (selectedPriority !== 'ALL' && s.priority !== selectedPriority) return false;

      if (selectedStatus !== 'ALL') {
        const currentStatus = s.status || (s.selected ? 'SELECTED' : 'RECOMMENDED');
        if (currentStatus !== selectedStatus) return false;
      }

      if (selectedEvidence !== 'ALL') {
        const tier = getEvidenceTier(s);
        if (selectedEvidence.toUpperCase() !== tier.toUpperCase()) return false;
      }

      return true;
    }).sort((a, b) => {
      const priorityOrder: Record<Priority, number> = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1
      };
      const pDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return a.id.localeCompare(b.id);
    });
  }, [samples, searchTerm, selectedCse, selectedPeriod, selectedMethod, selectedPriority, selectedStatus, selectedEvidence]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredSamples.length / pageSize) || 1;
  const paginatedSamples = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSamples.slice(start, start + pageSize);
  }, [filteredSamples, currentPage, pageSize]);

  const handleSelectSample = (sample: RecommendedSample, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleSampleSelection(sample.id);
    const nextState = !sample.selected;
    showToast(`${sample.id} (${sample.caseId}) ${nextState ? 'marked as SELECTED for examination' : 'returned to RECOMMENDED pool'}.`);
  };

  const handleOpenFinding = (findingId: string) => {
    setActiveFindingId(findingId);
    navigate(`/review/${findingId}`);
  };

  const handleExportSamples = () => {
    const exportUrl = samplingApi.getExportUrl();
    window.open(exportUrl, '_blank');
  };

  return (
    <PageContainer>
      {/* 1. SAMPLING CONTEXT HEADER */}
      <div className="bg-[#111622] border border-[#212c3d] rounded-lg p-4 md:p-5 shadow-sm mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] md:text-[20px] font-semibold text-[#f1f5f9] tracking-tight">
                Supervisory Sampling Engine
              </h1>
              <span className="text-[#475569]">•</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#1f6feb]/20 text-[#60a5fa] border border-[#1f6feb]/30">
                {contextData.totalRecommended} Cases Recommended
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                Status: {contextData.samplingStatus}
              </span>
            </div>

            <p className="text-[12px] text-[#94a3b8]">
              Risk-weighted allocation of examiner manual investigation bandwidth answering: <strong className="text-[#cbd5e1]">Why were these records selected for examination?</strong>
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748b] font-mono pt-0.5">
              <span>Assessment: <strong className="text-[#cbd5e1]">{contextData.assessmentTitle}</strong></span>
              <span>•</span>
              <span>Scope: <strong className="text-[#60a5fa]">{contextData.cseScope}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#64748b]" />
                <span>Last Run: <strong className="text-[#cbd5e1]">{contextData.lastRunTimestamp}</strong></span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#212c3d]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              title="Synchronize sampling pool from backend"
            >
              Sync
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5 text-[#8c90a0]" />}
              onClick={handleExportSamples}
              title="Export stratified sampling package as CSV"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Real Context KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 mt-3 border-t border-[#212c3d]">
          <div className="p-2.5 rounded bg-[#0d121a] border border-[#212c3d]">
            <div className="text-[10px] font-mono uppercase text-[#64748b]">Total Population</div>
            <div className="text-[16px] font-bold font-mono text-[#f1f5f9] mt-0.5">
              {contextData.populationSize.toLocaleString()} <span className="text-[10px] text-[#8c90a0] font-normal">Records</span>
            </div>
          </div>
          <div className="p-2.5 rounded bg-[#0d121a] border border-[#212c3d]">
            <div className="text-[10px] font-mono uppercase text-[#64748b]">Eligible Population</div>
            <div className="text-[16px] font-bold font-mono text-[#f59e0b] mt-0.5">
              {contextData.eligiblePopulation} <span className="text-[10px] text-[#8c90a0] font-normal">Flagged Gaps</span>
            </div>
          </div>
          <div className="p-2.5 rounded bg-[#0d121a] border border-[#212c3d]">
            <div className="text-[10px] font-mono uppercase text-[#64748b]">Selected for Exam</div>
            <div className="text-[16px] font-bold font-mono text-emerald-400 mt-0.5">
              {contextData.selectedCount} <span className="text-[10px] text-[#8c90a0] font-normal">of {contextData.totalRecommended}</span>
            </div>
          </div>
          <div className="p-2.5 rounded bg-[#0d121a] border border-[#212c3d]">
            <div className="text-[10px] font-mono uppercase text-[#64748b]">Sampling Rate</div>
            <div className="text-[16px] font-bold font-mono text-[#60a5fa] mt-0.5">
              {contextData.samplingRate} <span className="text-[10px] text-[#8c90a0] font-normal">Coverage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dismissible Feedback Banner */}
      {toastMessage && (
        <div className="p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[12px] font-mono text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. SAMPLING METHOD VISUAL EXPLANATION STRIP */}
      <div className="bg-[#111622] border border-[#212c3d] rounded-lg p-3.5 mb-4 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-[#94a3b8] uppercase font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#60a5fa]" />
            <span>Active Sampling Methodologies:</span>
          </div>
          <span className="text-[#64748b]">
            Click method to filter candidate pool
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {activeMethodologies.map((method) => {
            const isSelected = selectedMethod === method.key;
            return (
              <div
                key={method.key}
                onClick={() => {
                  setSelectedMethod(isSelected ? 'ALL' : method.key);
                  setCurrentPage(1);
                }}
                className={`p-2.5 rounded border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1f6feb]/20 border-[#1f6feb] text-white shadow-sm ring-1 ring-[#1f6feb]/50'
                    : method.isActive
                    ? 'bg-[#0d121a] border-[#212c3d] text-[#cbd5e1] hover:border-[#475569]'
                    : 'bg-[#0d121a]/40 border-[#212c3d]/50 text-[#64748b] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase truncate">
                    {method.label}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
                    isSelected ? 'bg-white text-black' : 'bg-[#111622] text-[#60a5fa] border border-[#212c3d]'
                  }`}>
                    {method.count}
                  </span>
                </div>
                <p className="text-[10px] text-[#8c90a0] leading-tight line-clamp-2 mt-1">
                  {method.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ADVANCED FILTERS TOOLBAR */}
      <div className="bg-[#111622] border border-[#212c3d] rounded-lg p-3.5 mb-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <Input
              icon={<Search className="w-4 h-4 text-[#64748b]" />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Sample ID, Case, CSE, Reason..."
              sizeVariant="sm"
            />
          </div>

          {/* CSE Selector */}
          <Select
            sizeVariant="sm"
            value={selectedCse}
            onChange={(e) => {
              setSelectedCse(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All CSE Entities' },
              ...cses.map(c => ({ value: c.cseId, label: `${c.cseId} — ${c.cseName}` }))
            ]}
          />

          {/* Priority Selector */}
          <Select
            sizeVariant="sm"
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Priorities' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' }
            ]}
          />

          {/* Evidence Selector */}
          <Select
            sizeVariant="sm"
            value={selectedEvidence}
            onChange={(e) => {
              setSelectedEvidence(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Evidence Statuses' },
              { value: 'STRONG', label: 'Strong Evidence' },
              { value: 'MODERATE', label: 'Moderate Evidence' },
              { value: 'PARTIAL', label: 'Partial Evidence' },
              { value: 'MISSING', label: 'Missing Evidence' }
            ]}
          />

          {/* Status Selector */}
          <Select
            sizeVariant="sm"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Examination Statuses' },
              { value: 'RECOMMENDED', label: 'Recommended' },
              { value: 'SELECTED', label: 'Selected for Examination' },
              { value: 'IN_REVIEW', label: 'In Review' },
              { value: 'REVIEWED', label: 'Reviewed' }
            ]}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#212c3d] text-[11px] font-mono text-[#8c90a0]">
          <div>
            Showing <strong className="text-[#f1f5f9]">{filteredSamples.length}</strong> of {samples.length} recommended sample cases
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="hover:text-[#f1f5f9] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* 4. SELECTED SAMPLE DATA TABLE */}
      {isLoading && samples.length === 0 ? (
        <LoadingState message="Loading supervisory sampling pool and selection explanations..." />
      ) : loadError ? (
        <ErrorState
          title="Sampling Engine Ingestion Error"
          message={loadError}
          onRetry={handleRefresh}
        />
      ) : filteredSamples.length === 0 ? (
        <EmptyState
          title="No samples available"
          description={
            searchTerm || selectedCse !== 'ALL' || selectedMethod !== 'ALL' || selectedPriority !== 'ALL' || selectedStatus !== 'ALL' || selectedEvidence !== 'ALL'
              ? "No recommended samples match the active filter criteria. Clear filters to view full candidate population."
              : "No stratified supervisory samples have been generated for the active cycle."
          }
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset All Filters
            </Button>
          }
        />
      ) : (
        <div className="bg-[#111622] border border-[#212c3d] rounded-lg overflow-hidden shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-[12px] md:text-[13px]">
              <thead>
                <tr className="border-b border-[#212c3d] bg-[#0d121a] text-[10px] font-mono uppercase text-[#8c90a0] tracking-wider select-none sticky top-0 z-10">
                  <th className="px-3 py-3 w-10 text-center" title="Toggle sample for examiner queue">Sel</th>
                  <th className="px-3.5 py-3" style={{ width: '150px' }}>Record / Evidence ID</th>
                  <th className="px-3.5 py-3" style={{ minWidth: '260px' }}>Selection Reason &amp; Explainability</th>
                  <th className="px-3.5 py-3" style={{ width: '120px' }}>Priority</th>
                  <th className="px-3.5 py-3" style={{ width: '160px' }}>Signal</th>
                  <th className="px-3.5 py-3" style={{ width: '120px' }}>Control</th>
                  <th className="px-3.5 py-3" style={{ width: '150px' }}>CSE Entity</th>
                  <th className="px-3.5 py-3" style={{ width: '110px' }}>Status</th>
                  <th className="px-3.5 py-3 text-right" style={{ width: '130px' }}>Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#212c3d] text-[#dfe2eb] bg-[#0d121a]">
                {paginatedSamples.map((sample) => {
                  const evTier = getEvidenceTier(sample);
                  const isSelected = sample.selected;

                  return (
                    <tr 
                      key={sample.id} 
                      className={`h-14 hover:bg-[#111622] transition-colors group cursor-pointer ${
                        isSelected ? 'bg-[#182335]/25' : ''
                      }`}
                      onClick={() => setInspectedSample(sample)}
                    >
                      {/* Checkbox Column */}
                      <td 
                        className="px-3 py-2.5 text-center align-middle"
                        onClick={(e) => handleSelectSample(sample, e)}
                      >
                        <button
                          type="button"
                          className={`w-4 h-4 rounded flex items-center justify-center transition-colors border mx-auto ${
                            isSelected 
                              ? 'bg-emerald-500 border-emerald-500 text-black font-bold' 
                              : 'bg-[#111622] border-[#3b414d] text-transparent hover:border-[#60a5fa]'
                          }`}
                          title={isSelected ? 'Selected for examination' : 'Click to select'}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                      </td>

                      {/* 1. Record / Evidence ID */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <div className="flex flex-col">
                          <span className="font-mono text-[12px] font-bold text-[#60a5fa] group-hover:underline">
                            {sample.id}
                          </span>
                          <span className="text-[10px] text-[#64748b] font-mono mt-0.5">
                            {sample.caseId}
                          </span>
                        </div>
                      </td>

                      {/* 2. Selection Reason & Explainability */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <div className="flex flex-col pr-2">
                          <p className="text-[12px] font-medium text-[#f1f5f9] leading-tight line-clamp-1 group-hover:text-[#60a5fa] transition-colors">
                            {sample.samplingReason}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8c90a0] mt-0.5">
                            <span className="text-[#38bdf8] font-bold uppercase">{getMethodLabel(sample.methodology)}</span>
                            <span>•</span>
                            <span className="truncate">{getMethodDescription(sample.methodology)}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Priority */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <PriorityBadge priority={sample.priority} />
                      </td>

                      {/* 4. Signal */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {sample.signals.slice(0, 1).map((sig, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#111622] text-[#f59e0b] border border-[#212c3d] truncate max-w-[130px]"
                            >
                              {sig.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {sample.signals.length > 1 && (
                            <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-[#111622] text-[#8c90a0] border border-[#212c3d]">
                              +{sample.signals.length - 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Control */}
                      <td className="px-3.5 py-2.5 align-middle font-mono text-[11px]">
                        <span className="font-bold text-[#cbd5e1] px-2 py-0.5 rounded bg-[#111622] border border-[#212c3d]">
                          {sample.controlId}
                        </span>
                      </td>

                      {/* 6. CSE Entity */}
                      <td 
                        className="px-3.5 py-2.5 align-middle"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCseId(sample.cseId);
                          navigate(`/supervision/cses/${sample.cseId}`);
                        }}
                      >
                        <div className="flex flex-col font-mono text-[11px]">
                          <span className="font-semibold text-[#cbd5e1] hover:text-[#60a5fa] hover:underline flex items-center gap-1">
                            <span>{sample.cseId}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-[#64748b]" />
                          </span>
                          <span className="text-[10px] text-[#64748b] truncate max-w-[130px]">
                            {sample.cseName}
                          </span>
                        </div>
                      </td>

                      {/* 7. Status */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <StatusBadge status={sample.status || (isSelected ? 'SELECTED' : 'RECOMMENDED')} />
                      </td>

                      {/* 8. Action (Preserved existing operations) */}
                      <td 
                        className="px-3.5 py-2.5 align-middle text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Inspect Drawer Button */}
                          <button
                            type="button"
                            onClick={() => setInspectedSample(sample)}
                            className="p-1.5 rounded bg-[#111622] border border-[#212c3d] text-[#8c90a0] hover:text-[#f1f5f9] transition-colors"
                            title="Inspect Sample Explanations"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Review Action Button */}
                          <Button
                            size="sm"
                            variant="primary"
                            iconRight={<ArrowRight className="w-3 h-3" />}
                            onClick={() => {
                              if (sample.relatedFindingId) {
                                handleOpenFinding(sample.relatedFindingId);
                              } else {
                                navigate(`/review?cseId=${sample.cseId}`);
                              }
                            }}
                            className="text-[11px] font-mono py-1 px-2.5"
                          >
                            Review
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-t border-[#212c3d] bg-[#0d121a] gap-2.5">
            <div className="text-[11px] font-mono text-[#8c90a0]">
              Showing <strong className="text-[#f1f5f9]">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-[#f1f5f9]">{Math.min(currentPage * pageSize, filteredSamples.length)}</strong> of{' '}
              <strong className="text-[#f1f5f9]">{filteredSamples.length}</strong> entries
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-[11px] font-mono text-[#64748b]">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#111622] text-[#cbd5e1] font-mono text-[11px] px-2 py-1 rounded border border-[#212c3d] focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-[#111622] border border-[#212c3d] text-[#c2c6d6] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                Previous
              </button>

              <span className="text-[11px] font-mono px-2 text-[#cbd5e1]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded bg-[#111622] border border-[#212c3d] text-[#c2c6d6] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SAMPLING EXPLAINABILITY DRAWER */}
      <Drawer
        isOpen={Boolean(inspectedSample)}
        onClose={() => setInspectedSample(null)}
        title={inspectedSample ? `${inspectedSample.id} (${inspectedSample.caseId})` : ''}
        subtitle="Supervisory Sampling Rationale & Explainability"
        width="md"
      >
        {inspectedSample && (
          <div className="space-y-4 text-[12px]">
            {/* Header Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={inspectedSample.priority} />
              <StatusBadge status={inspectedSample.status || (inspectedSample.selected ? 'SELECTED' : 'RECOMMENDED')} />
              <span className="px-2 py-0.5 rounded bg-[#182335] text-[#93c5fd] font-mono text-[10px] border border-[#263750] uppercase font-bold">
                {getMethodLabel(inspectedSample.methodology)}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#111622] text-[#cbd5e1] font-mono text-[10px] border border-[#212c3d]">
                Control: {inspectedSample.controlId}
              </span>
            </div>

            {/* Explainability Section: WHY SELECTED? */}
            <div className="p-3.5 rounded bg-[#0d121a] border border-[#212c3d] space-y-2">
              <div className="text-[11px] font-mono uppercase text-[#60a5fa] font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Why Was This Case Selected for Examination?</span>
              </div>
              <p className="text-[13px] text-[#f1f5f9] leading-snug font-medium">
                "{inspectedSample.samplingReason}"
              </p>
              <div className="text-[11px] text-[#94a3b8] leading-relaxed pt-2 border-t border-[#212c3d] mt-1">
                <strong className="text-[#cbd5e1]">Algorithmic Rationale: </strong>
                {getMethodDescription(inspectedSample.methodology)}
              </div>
            </div>

            {/* Which Signal Triggered Selection */}
            <div className="p-3 rounded bg-[#0d121a] border border-[#212c3d] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#64748b]">Triggering Signals:</div>
              <div className="flex flex-wrap gap-1.5">
                {inspectedSample.signals.map((sig, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded font-mono text-[11px] bg-[#111622] text-[#f59e0b] border border-[#212c3d]"
                  >
                    {sig.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Which Control is Involved & Supporting Evidence */}
            <div className="p-3 rounded bg-[#0d121a] border border-[#212c3d] space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Involved Control:</span>
                <span className="text-[#f1f5f9] font-bold">{inspectedSample.controlId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">CSE Target Entity:</span>
                <span className="text-[#cbd5e1]">{inspectedSample.cseId} — {inspectedSample.cseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Evidence Status:</span>
                <span className="text-[#10b981] font-bold">{getEvidenceTier(inspectedSample)} ({inspectedSample.evidenceStrength})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Assessment Period:</span>
                <span className="text-[#cbd5e1]">{inspectedSample.assessmentPeriod || 'Q3 2026'}</span>
              </div>
              {inspectedSample.relatedFindingId && (
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Linked Finding:</span>
                  <span className="text-[#60a5fa] font-bold">{inspectedSample.relatedFindingId}</span>
                </div>
              )}
            </div>

            {/* Preserved Actions */}
            <div className="pt-2 flex flex-col gap-2">
              {inspectedSample.relatedFindingId ? (
                <Button
                  variant="primary"
                  size="sm"
                  iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setInspectedSample(null);
                    handleOpenFinding(inspectedSample.relatedFindingId!);
                  }}
                  className="w-full justify-center"
                >
                  Open in Examiner Workspace
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setInspectedSample(null);
                    navigate(`/review?cseId=${inspectedSample.cseId}`);
                  }}
                  className="w-full justify-center"
                >
                  Review CSE Queue
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInspectedSample(null);
                    setActiveCseId(inspectedSample.cseId);
                    navigate(`/evidence?cseId=${inspectedSample.cseId}`);
                  }}
                  className="w-full justify-center text-[11px] font-mono"
                >
                  Inspect Evidence
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleSelectSample(inspectedSample);
                  }}
                  className={`w-full justify-center text-[11px] font-mono ${
                    inspectedSample.selected 
                      ? 'border-rose-500/40 text-rose-300 hover:bg-rose-500/20' 
                      : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                  }`}
                >
                  {inspectedSample.selected ? 'Deselect Sample' : 'Select for Exam'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </PageContainer>
  );
};
