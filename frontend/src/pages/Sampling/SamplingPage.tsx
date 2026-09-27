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
  X
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  Card,
  KpiCard,
  Input,
  Select,
  StatusBadge,
  PriorityBadge,
  Button,
  Drawer
} from '@/components/common';

export const SamplingPage: React.FC = () => {
  const { samples, cses, toggleSampleSelection, setActiveFindingId, setActiveCseId } = useSupervisory();
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
  const pageSize = 10;

  // Drawer & Toast State
  const [inspectedSample, setInspectedSample] = useState<RecommendedSample | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      default: return method;
    }
  };

  // Helper: map methodology to operational description
  const getMethodDescription = (method: SamplingMethodology | string): string => {
    switch (method) {
      case 'RISK_BASED': 
        return 'Priority for supervisory review due to high-urgency control discrepancies and execution breaches.';
      case 'EVIDENCE_BASED': 
        return 'Selected because evidence exhibits anomalies, conflicting hashes, or missing mandatory telemetry.';
      case 'COVERAGE_BASED': 
        return 'Selected to verify supervisory coverage of controls not recently examined in prior cycles.';
      case 'RECURRENCE_BASED': 
        return 'Selected due to repetitive control variances persisting across consecutive quarterly assessment cycles.';
      case 'ANOMALY_BASED': 
        return 'Selected because operational activity deviates significantly from established process duration benchmarks.';
      case 'PEER_BASED': 
        return 'Selected due to significant operational duration variance compared against the critical sector peer cohort.';
      case 'BASELINE_RANDOM': 
        return 'Normative control sample randomly drawn to provide a neutral operational baseline.';
      default: return '';
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

  // 1. Dynamic 4 Top Summary Cards (Derived from centralized samples data)
  const summaryCounts = useMemo(() => {
    const totalSamples = samples.length;
    const highPriority = samples.filter(s => s.priority === 'CRITICAL' || s.priority === 'HIGH').length;
    const evidenceBased = samples.filter(s => s.methodology === 'EVIDENCE_BASED').length;
    const recurringOrAnomaly = samples.filter(s => s.methodology === 'RECURRENCE_BASED' || s.methodology === 'ANOMALY_BASED').length;

    return {
      totalSamples,
      highPriority,
      evidenceBased,
      recurringOrAnomaly
    };
  }, [samples]);

  // Method Distribution breakdown for horizontal pills
  const methodCounts = useMemo(() => {
    return {
      RISK_BASED: samples.filter(s => s.methodology === 'RISK_BASED').length,
      EVIDENCE_BASED: samples.filter(s => s.methodology === 'EVIDENCE_BASED').length,
      COVERAGE_BASED: samples.filter(s => s.methodology === 'COVERAGE_BASED').length,
      RECURRENCE_BASED: samples.filter(s => s.methodology === 'RECURRENCE_BASED').length,
      ANOMALY_BASED: samples.filter(s => s.methodology === 'ANOMALY_BASED').length,
      PEER_BASED: samples.filter(s => s.methodology === 'PEER_BASED').length,
      BASELINE_RANDOM: samples.filter(s => s.methodology === 'BASELINE_RANDOM').length,
    };
  }, [samples]);

  // 2. Multi-criteria Filter Logic
  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      // Search across Sample ID, Case ID, CSE ID, CSE Name, Control ID, Reason, Signals
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

      // CSE Filter
      if (selectedCse !== 'ALL' && s.cseId.toLowerCase() !== selectedCse.toLowerCase()) return false;

      // Period Filter
      if (selectedPeriod !== 'ALL' && s.assessmentPeriod && s.assessmentPeriod !== selectedPeriod) return false;

      // Method Filter
      if (selectedMethod !== 'ALL' && s.methodology !== selectedMethod) return false;

      // Priority Filter
      if (selectedPriority !== 'ALL' && s.priority !== selectedPriority) return false;

      // Status Filter
      if (selectedStatus !== 'ALL') {
        const currentStatus = s.status || (s.selected ? 'SELECTED' : 'RECOMMENDED');
        if (currentStatus !== selectedStatus) return false;
      }

      // Evidence Filter
      if (selectedEvidence !== 'ALL') {
        const tier = getEvidenceTier(s);
        if (selectedEvidence.toUpperCase() !== tier.toUpperCase()) return false;
      }

      return true;
    }).sort((a, b) => {
      // Default Sort: Priority descending, then ID
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
  }, [filteredSamples, currentPage]);

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

  return (
    <PageContainer>
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER (Section 5)                                                */}
      {/* ========================================================================= */}
      <PageHeader
        title="Supervisory Sampling"
        description="Recommended cases for focused supervisory examination."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#93c5fd] bg-[#182335] px-2.5 py-0.5 rounded border border-[#263750] font-medium">
              Cycle: Q3 2026 Active Assessment
            </span>
            <span className="text-[11px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2.5 py-0.5 rounded border border-[#7bdb80]/30 font-medium">
              Risk & Evidence Prioritization Active
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            {/* Quick CSE Filter */}
            <div className="flex items-center gap-1.5 bg-[#111622] border border-[#212c3d] rounded-md px-2.5 py-1">
              <Building2 className="w-3.5 h-3.5 text-[#64748b]" />
              <select
                value={selectedCse}
                onChange={(e) => {
                  setSelectedCse(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-[11px] font-mono text-[#cbd5e1] focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#111622] text-[#f1f5f9]">All CSEs Portfolio</option>
                {cses.map(c => (
                  <option key={c.cseId} value={c.cseId} className="bg-[#111622] text-[#f1f5f9]">
                    {c.cseId} — {c.cseName.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-3 h-3 text-[#8c90a0]" />}
              onClick={resetFilters}
              className="text-[11px] font-mono"
            >
              Reset Filters
            </Button>
          </div>
        }
      />

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

      {/* ========================================================================= */}
      {/* 2. TOP SUMMARY (Section 7: Exactly 4 Compact KPI Cards Matching Overview) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4 min-w-0">
        <KpiCard
          title="Recommended Samples"
          value={summaryCounts.totalSamples}
          subtitle="Target Supervisory Selection"
          semantic="blue"
          icon={Layers}
          onClick={() => setSelectedMethod('ALL')}
        />
        <KpiCard
          title="High Priority"
          value={summaryCounts.highPriority}
          subtitle="SLA <24h Focus Cases"
          semantic="red"
          alert={true}
          icon={AlertTriangle}
          onClick={() => setSelectedPriority('HIGH')}
        />
        <KpiCard
          title="Evidence-Based"
          value={summaryCounts.evidenceBased}
          subtitle="Telemetry Gaps & Anomalies"
          semantic="amber"
          icon={FileText}
          onClick={() => setSelectedMethod('EVIDENCE_BASED')}
        />
        <KpiCard
          title="Recurring / Anomaly"
          value={summaryCounts.recurringOrAnomaly}
          subtitle="Multi-cycle Regressions & Spikes"
          semantic="green"
          icon={Clock}
          onClick={() => setSelectedMethod('RECURRENCE_BASED')}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. METHODOLOGY BREAKDOWN & FILTER BAR (Sections 10, 11, 17)                */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-3 mb-4">
        
        {/* Methodologies Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#212c3d] text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-[#94a3b8] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#60a5fa]" />
            <span>Sampling Methodologies:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Methods', count: summaryCounts.totalSamples },
              { id: 'RISK_BASED', label: 'Risk-Based', count: methodCounts.RISK_BASED },
              { id: 'EVIDENCE_BASED', label: 'Evidence-Based', count: methodCounts.EVIDENCE_BASED },
              { id: 'COVERAGE_BASED', label: 'Coverage-Based', count: methodCounts.COVERAGE_BASED },
              { id: 'RECURRENCE_BASED', label: 'Recurrence-Based', count: methodCounts.RECURRENCE_BASED },
              { id: 'ANOMALY_BASED', label: 'Anomaly-Based', count: methodCounts.ANOMALY_BASED },
              { id: 'PEER_BASED', label: 'Peer-Based', count: methodCounts.PEER_BASED },
              { id: 'BASELINE_RANDOM', label: 'Baseline', count: methodCounts.BASELINE_RANDOM },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMethod(m.id);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors flex items-center gap-1 ${
                  selectedMethod === m.id
                    ? 'bg-[#1d4ed8] text-white font-bold'
                    : 'bg-[#161e29] text-[#94a3b8] hover:text-[#f1f5f9] border border-[#212c3d]'
                }`}
              >
                <span>{m.label}</span>
                <span className={`px-1 rounded text-[9px] ${selectedMethod === m.id ? 'bg-black/30 text-white' : 'bg-[#111622] text-[#64748b]'}`}>
                  {m.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Inputs Grid */}
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
              { value: 'ALL', label: 'All CSEs' },
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
              { value: 'ALL', label: 'All Evidence' },
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
              { value: 'ALL', label: 'All Statuses' },
              { value: 'RECOMMENDED', label: 'Recommended' },
              { value: 'SELECTED', label: 'Selected' },
              { value: 'IN_REVIEW', label: 'In Review' },
              { value: 'REVIEWED', label: 'Reviewed' }
            ]}
          />
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#8c90a0] pt-1">
          <div>
            Filtered Samples: <strong className="text-[#f1f5f9]">{filteredSamples.length}</strong> of {samples.length}
          </div>
          <div>
            Selected for Examination: <strong className="text-[#10b981]">{samples.filter(s => s.selected).length}</strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN SAMPLING TABLE (Sections 8, 9, 12, 13, 14, 15, 16, 20)           */}
      {/* ========================================================================= */}
      <Card className="p-0 overflow-hidden">
        {filteredSamples.length > 0 ? (
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left text-[12px] text-[#dfe2eb]">
              <thead className="bg-[#111722] text-[#8c90a0] font-mono uppercase text-[10px] border-b border-[#212c3d]">
                <tr>
                  <th className="py-3 px-3.5 w-10 text-center">Sel</th>
                  <th className="py-3 px-3.5">Sample / Case</th>
                  <th className="py-3 px-3.5">CSE / Sector</th>
                  <th className="py-3 px-3.5">Methodology</th>
                  <th className="py-3 px-3.5">Primary Sampling Reason</th>
                  <th className="py-3 px-3.5">Supporting Signals</th>
                  <th className="py-3 px-3.5">Priority</th>
                  <th className="py-3 px-3.5">Evidence</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212c3d]/60 bg-[#0e131b]">
                {paginatedSamples.map((sample) => {
                  const evTier = getEvidenceTier(sample);
                  const isSelected = sample.selected;

                  return (
                    <tr 
                      key={sample.id} 
                      className={`hover:bg-[#111722] transition-colors group cursor-pointer ${
                        isSelected ? 'bg-[#182335]/30' : ''
                      }`}
                      onClick={() => setInspectedSample(sample)}
                    >
                      {/* Checkbox Column */}
                      <td 
                        className="py-3 px-3 text-center whitespace-nowrap"
                        onClick={(e) => handleSelectSample(sample, e)}
                      >
                        <button
                          type="button"
                          className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                            isSelected 
                              ? 'bg-[#10b981] border-[#10b981] text-black font-bold' 
                              : 'bg-[#111622] border-[#3b414d] text-transparent hover:border-[#60a5fa]'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                      </td>

                      {/* 1. Sample & Case ID */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-[#60a5fa] group-hover:underline">
                          {sample.id}
                        </div>
                        <div className="text-[10px] text-[#64748b] font-mono mt-0.5">
                          {sample.caseId} · {sample.controlId}
                        </div>
                      </td>

                      {/* 2. CSE */}
                      <td 
                        className="py-3 px-3.5 whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCseId(sample.cseId);
                          navigate(`/supervision/cses/${sample.cseId}`);
                        }}
                      >
                        <div className="font-semibold text-[#f1f5f9] hover:text-[#60a5fa] flex items-center gap-1">
                          <span>{sample.cseId}</span>
                          <ExternalLink className="w-3 h-3 text-[#64748b]" />
                        </div>
                        <div className="text-[10px] text-[#8c90a0] truncate max-w-[130px]">
                          {sample.cseName}
                        </div>
                      </td>

                      {/* 3. Methodology */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold bg-[#182335] text-[#93c5fd] border border-[#263750]">
                          {getMethodLabel(sample.methodology)}
                        </span>
                      </td>

                      {/* 4. Reason */}
                      <td className="py-3 px-3.5 max-w-[280px]">
                        <p className="text-[11px] text-[#cbd5e1] leading-snug line-clamp-2">
                          {sample.samplingReason}
                        </p>
                      </td>

                      {/* 5. Supporting Signals */}
                      <td className="py-3 px-3.5 max-w-[180px]">
                        <div className="flex flex-wrap gap-1">
                          {sample.signals.slice(0, 2).map((sig, idx) => (
                            <span 
                              key={idx} 
                              className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-[#161e29] text-[#ffb693] border border-[#212c3d] truncate max-w-[120px]"
                            >
                              {sig}
                            </span>
                          ))}
                          {sample.signals.length > 2 && (
                            <span className="px-1 rounded font-mono text-[9px] bg-[#161e29] text-[#8c90a0]">
                              +{sample.signals.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Priority */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <PriorityBadge priority={sample.priority} />
                      </td>

                      {/* 7. Evidence */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          evTier === 'Strong'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : evTier === 'Moderate'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : evTier === 'Partial'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}>
                          {evTier}
                        </span>
                      </td>

                      {/* 8. Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <StatusBadge status={sample.status || (isSelected ? 'SELECTED' : 'RECOMMENDED')} />
                      </td>

                      {/* 9. Action */}
                      <td 
                        className="py-3 px-3.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Selection Button */}
                          <button
                            type="button"
                            onClick={(e) => handleSelectSample(sample, e)}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-colors border ${
                              isSelected 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                                : 'bg-[#161e29] text-[#cbd5e1] border-[#212c3d] hover:bg-[#212c3d]'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>

                          {/* Quick Inspect Drawer Button */}
                          <button
                            type="button"
                            onClick={() => setInspectedSample(sample)}
                            className="p-1.5 rounded bg-[#161e29] border border-[#212c3d] text-[#8c90a0] hover:text-[#f1f5f9] transition-colors"
                            title="Inspect Sample Context"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Review Finding Button */}
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
                            className="text-[10px] font-mono py-1 px-2 bg-[#1d4ed8] hover:bg-[#2563eb]"
                          >
                            Review →
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State (Section 46) */
          <div className="p-8 text-center space-y-2.5">
            <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto" />
            <h3 className="text-[14px] font-bold text-[#f1f5f9]">
              No recommended samples for the selected filters.
            </h3>
            <p className="text-[11px] text-[#8c90a0] max-w-sm mx-auto font-mono">
              Adjust your search keywords, sampling methodology, priority, or entity filter to view candidates.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-[11px] font-mono"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredSamples.length > 0 && (
          <div className="p-3 bg-[#111722] border-t border-[#212c3d] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#8c90a0]">
            <div>
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredSamples.length)}–
              {Math.min(currentPage * pageSize, filteredSamples.length)} of {filteredSamples.length} recommended samples
            </div>
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="text-[10px] py-0.5 px-2"
              >
                Previous
              </Button>
              <span className="px-2 text-[#cbd5e1]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="text-[10px] py-0.5 px-2"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 5. SAMPLE DETAIL DRAWER (Section 21)                                      */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={Boolean(inspectedSample)}
        onClose={() => setInspectedSample(null)}
        title={inspectedSample ? `${inspectedSample.id} (${inspectedSample.caseId})` : ''}
        subtitle="Supervisory Sampling Rationale & Case Inspector"
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
              <span className="px-2 py-0.5 rounded bg-[#161e29] text-[#cbd5e1] font-mono text-[10px] border border-[#212c3d]">
                Control: {inspectedSample.controlId}
              </span>
            </div>

            {/* Why Selected? Section (Section 12 & 35) */}
            <div className="p-3.5 rounded bg-[#0e131b] border border-[#212c3d] space-y-1.5">
              <div className="text-[11px] font-mono uppercase text-[#60a5fa] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Why Was This Case Selected?</span>
              </div>
              <p className="text-[12px] text-[#f1f5f9] leading-relaxed">
                "{inspectedSample.samplingReason}"
              </p>
              <div className="text-[11px] text-[#8c90a0] leading-snug pt-1 border-t border-[#212c3d]/60 mt-1">
                <strong>Method Rationale: </strong>
                {getMethodDescription(inspectedSample.methodology)}
              </div>
            </div>

            {/* Supporting Signals (Section 13) */}
            <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#64748b]">Supporting Supervisory Signals:</div>
              <div className="flex flex-wrap gap-1.5">
                {inspectedSample.signals.map((sig, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded font-mono text-[11px] bg-[#161e29] text-[#ffb693] border border-[#212c3d]"
                  >
                    {sig}
                  </span>
                ))}
              </div>
            </div>

            {/* Target CSE & Telemetry Details */}
            <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Target Entity:</span>
                <span className="text-[#f1f5f9] font-bold">{inspectedSample.cseId} — {inspectedSample.cseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Evidence Status:</span>
                <span className="text-[#10b981] font-bold">{getEvidenceTier(inspectedSample)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Assessment Period:</span>
                <span className="text-[#cbd5e1]">{inspectedSample.assessmentPeriod || 'Q3 2026'}</span>
              </div>
              {inspectedSample.relatedFindingId && (
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Related Finding:</span>
                  <span className="text-[#60a5fa] font-bold">{inspectedSample.relatedFindingId}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
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
                  className="w-full justify-center bg-[#1d4ed8] hover:bg-[#2563eb]"
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
                  className="w-full justify-center bg-[#1d4ed8] hover:bg-[#2563eb]"
                >
                  Inspect CSE Review Queue
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInspectedSample(null);
                    setActiveCseId(inspectedSample.cseId);
                    navigate(`/supervision/cses/${inspectedSample.cseId}`);
                  }}
                  className="w-full justify-center text-[11px] font-mono"
                >
                  View CSE Profile
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
