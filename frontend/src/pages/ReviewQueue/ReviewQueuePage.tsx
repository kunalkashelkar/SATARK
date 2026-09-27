import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { Finding, Priority, FindingStatus } from '@/types';
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
  MoreVertical,
  Send,
  Eye,
  ShieldAlert,
  HelpCircle,
  X
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  Card,
  Input,
  Select,
  StatusBadge,
  PriorityBadge,
  Button,
  Drawer,
  Modal
} from '@/components/common';

export const ReviewQueuePage: React.FC = () => {
  const { findings, cses, setActiveFindingId, requestEvidenceDemand } = useSupervisory();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isFindingsView = location.pathname.startsWith('/findings');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCse, setSelectedCse] = useState(searchParams.get('cseId') || 'ALL');
  const [selectedSignal, setSelectedSignal] = useState(searchParams.get('signal') || 'ALL');
  const [selectedPriority, setSelectedPriority] = useState(searchParams.get('priority') || 'ALL');
  const [selectedEvidence, setSelectedEvidence] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'ACTIVE');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Drawer & Modal State
  const [drawerFinding, setDrawerFinding] = useState<Finding | null>(null);
  const [evidenceModalFinding, setEvidenceModalFinding] = useState<Finding | null>(null);
  const [requestedEvidenceText, setRequestedEvidenceText] = useState('Regulatory gateway transmission logs and statutory escalation token.');
  const [isSubmittingDemand, setIsSubmittingDemand] = useState(false);
  const [demandSuccessMsg, setDemandSuccessMsg] = useState<string | null>(null);

  // Sync URL parameters on mount / changes
  useEffect(() => {
    const priorityParam = searchParams.get('priority');
    if (priorityParam) setSelectedPriority(priorityParam);

    const cseParam = searchParams.get('cseId');
    if (cseParam) setSelectedCse(cseParam);

    const signalParam = searchParams.get('signal');
    if (signalParam) setSelectedSignal(signalParam);

    const statusParam = searchParams.get('status');
    if (statusParam) setSelectedStatus(statusParam);
  }, [searchParams]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCse('ALL');
    setSelectedSignal('ALL');
    setSelectedPriority('ALL');
    setSelectedEvidence('ALL');
    setSelectedStatus('ACTIVE');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Helper: Determine evidence display tier
  const getEvidenceTier = (f: Finding): 'Strong' | 'Partial' | 'Missing' => {
    if (f.evidenceStrength === 'HIGH' || f.completeness >= 75) return 'Strong';
    if (f.evidenceStrength === 'MEDIUM' || (f.completeness >= 40 && f.completeness < 75)) return 'Partial';
    return 'Missing';
  };

  // 1. Dynamic Top Summary Counts (Derived strictly from centralized findings data)
  const summaryCounts = useMemo(() => {
    const activeItems = findings.filter(f => f.status === 'CANDIDATE' || f.status === 'UNDER_REVIEW');
    const highPriorityActive = activeItems.filter(f => f.priority === 'CRITICAL' || f.priority === 'HIGH');
    const evidenceRequired = activeItems.filter(f => getEvidenceTier(f) === 'Missing' || getEvidenceTier(f) === 'Partial');
    const underReview = findings.filter(f => f.status === 'UNDER_REVIEW');

    return {
      totalRequiringReview: activeItems.length,
      highPriority: highPriorityActive.length,
      evidenceRequired: evidenceRequired.length,
      underReview: underReview.length
    };
  }, [findings]);

  // 2. Filter logic with multi-criteria support
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      // Search across Finding ID, CSE ID, CSE Name, Signal, Control ID, Title
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          f.id.toLowerCase().includes(q) ||
          f.cseId.toLowerCase().includes(q) ||
          f.cseName.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.controlId.toLowerCase().includes(q) ||
          f.signalType.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // CSE Filter
      if (selectedCse !== 'ALL' && f.cseId.toLowerCase() !== selectedCse.toLowerCase()) return false;

      // Signal Filter
      if (selectedSignal !== 'ALL' && f.signalType !== selectedSignal) return false;

      // Priority Filter
      if (selectedPriority !== 'ALL' && f.priority !== selectedPriority) return false;

      // Evidence Filter
      if (selectedEvidence !== 'ALL') {
        const tier = getEvidenceTier(f);
        if (selectedEvidence === 'STRONG' && tier !== 'Strong') return false;
        if (selectedEvidence === 'PARTIAL' && tier !== 'Partial') return false;
        if (selectedEvidence === 'MISSING' && tier !== 'Missing') return false;
      }

      // Status Filter (Default 'ACTIVE' = CANDIDATE + UNDER_REVIEW)
      if (selectedStatus === 'ACTIVE') {
        if (f.status !== 'CANDIDATE' && f.status !== 'UNDER_REVIEW') return false;
      } else if (selectedStatus !== 'ALL') {
        if (f.status !== selectedStatus) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort priority: CRITICAL > HIGH > MEDIUM > LOW
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
  }, [findings, searchTerm, selectedCse, selectedSignal, selectedPriority, selectedEvidence, selectedStatus]);

  // Paginated findings
  const totalPages = Math.ceil(filteredFindings.length / pageSize) || 1;
  const paginatedFindings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFindings.slice(start, start + pageSize);
  }, [filteredFindings, currentPage]);

  const handleOpenFinding = (findingId: string) => {
    setActiveFindingId(findingId);
    navigate(`/review/${findingId}`);
  };

  const handleOpenEvidenceDemand = (f: Finding) => {
    setEvidenceModalFinding(f);
    setRequestedEvidenceText(`Statutory dispatch telemetry and audit verification payload for ${f.controlId}.`);
  };

  const handleConfirmEvidenceDemand = () => {
    if (!evidenceModalFinding) return;
    setIsSubmittingDemand(true);

    setTimeout(() => {
      requestEvidenceDemand(evidenceModalFinding.id, requestedEvidenceText);
      setIsSubmittingDemand(false);
      setDemandSuccessMsg(`Evidence demand dispatched for ${evidenceModalFinding.id}. Finding moved to UNDER_REVIEW.`);
      setEvidenceModalFinding(null);
      setTimeout(() => setDemandSuccessMsg(null), 4000);
    }, 500);
  };

  return (
    <PageContainer>
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER (Section 5)                                                */}
      {/* ========================================================================= */}
      <PageHeader
        title={isFindingsView ? "Supervisory Findings" : "Supervisory Review Queue"}
        description={isFindingsView ? "Authoritative inventory of findings, qualified issues, and candidate signals." : "Items requiring supervisory or examiner attention."}
        badge={
          <span className="text-[11px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2.5 py-0.5 rounded border border-[#7bdb80]/30 font-medium">
            Human-in-the-Loop Active
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
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

      {/* Success Notification Banner */}
      {demandSuccessMsg && (
        <div className="p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[12px] font-mono text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{demandSuccessMsg}</span>
          </div>
          <button onClick={() => setDemandSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TOP SUMMARY (Section 6: Max 4 Compact Summary Cards)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4 min-w-0">
        <div 
          onClick={() => setSelectedStatus('ACTIVE')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            selectedStatus === 'ACTIVE' 
              ? 'bg-[#182335] border-[#3b82f6]' 
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="text-[11px] font-mono uppercase text-[#94a3b8] flex items-center justify-between">
            <span>Total Requiring Review</span>
            <span className="w-2 h-2 rounded-full bg-[#60a5fa]" />
          </div>
          <div className="text-[24px] font-bold font-mono text-[#f1f5f9] mt-1 leading-none">
            {summaryCounts.totalRequiringReview}
          </div>
          <div className="text-[11px] text-[#8c90a0] mt-1.5 font-mono">Active triage backlog</div>
        </div>

        <div 
          onClick={() => {
            setSelectedPriority('HIGH');
            setSelectedStatus('ACTIVE');
          }}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            selectedPriority === 'HIGH' || selectedPriority === 'CRITICAL'
              ? 'bg-rose-950/20 border-rose-500/60' 
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="text-[11px] font-mono uppercase text-rose-300 flex items-center justify-between">
            <span>High Priority</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-[24px] font-bold font-mono text-rose-300 mt-1 leading-none">
            {summaryCounts.highPriority}
          </div>
          <div className="text-[11px] text-[#8c90a0] mt-1.5 font-mono">Critical & High SLA &lt;24h</div>
        </div>

        <div 
          onClick={() => {
            setSelectedEvidence('MISSING');
            setSelectedStatus('ACTIVE');
          }}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            selectedEvidence === 'MISSING' 
              ? 'bg-amber-950/20 border-amber-500/60' 
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="text-[11px] font-mono uppercase text-amber-300 flex items-center justify-between">
            <span>Evidence Required</span>
            <FileText className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-[24px] font-bold font-mono text-amber-300 mt-1 leading-none">
            {summaryCounts.evidenceRequired}
          </div>
          <div className="text-[11px] text-[#8c90a0] mt-1.5 font-mono">Demands / Missing Telemetry</div>
        </div>

        <div 
          onClick={() => setSelectedStatus('UNDER_REVIEW')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            selectedStatus === 'UNDER_REVIEW' 
              ? 'bg-[#1c2436] border-[#60a5fa]' 
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="text-[11px] font-mono uppercase text-[#60a5fa] flex items-center justify-between">
            <span>Under Review</span>
            <Clock className="w-3.5 h-3.5 text-[#60a5fa]" />
          </div>
          <div className="text-[24px] font-bold font-mono text-[#60a5fa] mt-1 leading-none">
            {summaryCounts.underReview}
          </div>
          <div className="text-[11px] text-[#8c90a0] mt-1.5 font-mono">Active Examiner Inquiries</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FILTER BAR (Section 14 & 16)                                           */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-3 mb-4">
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
              placeholder="Search Finding ID, CSE, Signal, Control..."
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
              { value: 'CRITICAL', label: 'Critical Priority' },
              { value: 'HIGH', label: 'High Priority' },
              { value: 'MEDIUM', label: 'Medium Priority' },
              { value: 'LOW', label: 'Low Priority' }
            ]}
          />

          {/* Signal Selector */}
          <Select
            sizeVariant="sm"
            value={selectedSignal}
            onChange={(e) => {
              setSelectedSignal(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Signals' },
              { value: 'EXECUTION_GAP', label: 'Execution Gap' },
              { value: 'NEGATIVE_SPACE', label: 'Negative Space' },
              { value: 'PROCESS_DEVIATION', label: 'Process Deviation' },
              { value: 'HISTORICAL_RECURRENCE', label: 'Historical Recurrence' },
              { value: 'CROSS_SOURCE_CONSISTENCY', label: 'Consistency Discrepancy' },
              { value: 'CAPABILITY_DISCREPANCY', label: 'Capability Discrepancy' },
              { value: 'BEHAVIOURAL', label: 'Behavioural Anomaly' }
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
              { value: 'ACTIVE', label: 'Active (Review Required)' },
              { value: 'ALL', label: 'All Statuses' },
              { value: 'CANDIDATE', label: 'Candidate' },
              { value: 'UNDER_REVIEW', label: 'Under Review' },
              { value: 'VALIDATED', label: 'Validated' },
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'OVERRIDDEN', label: 'Overridden' }
            ]}
          />
        </div>

        {/* Filter Summary & Evidence Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#212c3d] text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#8c90a0]">Evidence Filter:</span>
            <div className="flex items-center gap-1">
              {['ALL', 'STRONG', 'PARTIAL', 'MISSING'].map((evKey) => (
                <button
                  key={evKey}
                  onClick={() => {
                    setSelectedEvidence(evKey);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono transition-colors ${
                    selectedEvidence === evKey
                      ? 'bg-[#1d4ed8] text-white font-bold'
                      : 'bg-[#161e29] text-[#94a3b8] hover:text-[#f1f5f9] border border-[#212c3d]'
                  }`}
                >
                  {evKey === 'ALL' ? 'All Evidence' : evKey}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[#8c90a0]">
            Showing <strong className="text-[#f1f5f9]">{filteredFindings.length}</strong> items requiring attention
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT = REVIEW TABLE (Sections 7, 8, 11, 12, 19, 21, 26)       */}
      {/* ========================================================================= */}
      <Card className="p-0 overflow-hidden">
        {filteredFindings.length > 0 ? (
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left text-[12px] text-[#dfe2eb]">
              <thead className="bg-[#111722] text-[#8c90a0] font-mono uppercase text-[10px] border-b border-[#212c3d]">
                <tr>
                  <th className="py-3 px-3.5">Finding ID</th>
                  <th className="py-3 px-3.5">CSE / Sector</th>
                  <th className="py-3 px-3.5">Signal</th>
                  <th className="py-3 px-3.5">Priority</th>
                  <th className="py-3 px-3.5">Evidence</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Why Flagged</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212c3d]/60 bg-[#0e131b]">
                {paginatedFindings.map((finding) => {
                  const evTier = getEvidenceTier(finding);
                  const isMissingEvidence = evTier === 'Missing';

                  return (
                    <tr 
                      key={finding.id} 
                      className="hover:bg-[#111722] transition-colors group cursor-pointer"
                      onClick={() => handleOpenFinding(finding.id)}
                    >
                      {/* 1. Finding ID */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#60a5fa] group-hover:underline">
                            {finding.id}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#64748b] font-mono mt-0.5">
                          {finding.controlId}
                        </div>
                      </td>

                      {/* 2. CSE / Entity */}
                      <td 
                        className="py-3 px-3.5 whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/supervision/cses/${finding.cseId}`);
                        }}
                      >
                        <div className="font-semibold text-[#f1f5f9] hover:text-[#60a5fa] flex items-center gap-1">
                          <span>{finding.cseId}</span>
                          <ExternalLink className="w-3 h-3 text-[#64748b]" />
                        </div>
                        <div className="text-[10px] text-[#8c90a0] truncate max-w-[130px]">
                          {finding.cseName}
                        </div>
                      </td>

                      {/* 3. Signal */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded font-mono text-[11px] font-medium bg-[#182335] text-[#ffb693] border border-[#263750]">
                          {finding.signalType.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* 4. Priority */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <PriorityBadge priority={finding.priority} />
                      </td>

                      {/* 5. Evidence Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            evTier === 'Strong'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : evTier === 'Partial'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}>
                            {evTier} ({finding.completeness}%)
                          </span>
                        </div>
                        <div className="text-[10px] text-[#64748b] font-mono mt-0.5">
                          {finding.sourceEvidence.length} records
                        </div>
                      </td>

                      {/* 6. Review Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <StatusBadge status={finding.status} />
                      </td>

                      {/* 7. Why Flagged */}
                      <td className="py-3 px-3.5 max-w-[280px]">
                        <div className="font-semibold text-[#f1f5f9] truncate">
                          {finding.title}
                        </div>
                        <div className="text-[11px] text-[#8c90a0] truncate mt-0.5">
                          {finding.whyFlagged}
                        </div>
                      </td>

                      {/* 8. Action */}
                      <td 
                        className="py-3 px-3.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Request Evidence Quick Action */}
                          {isMissingEvidence && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEvidenceDemand(finding)}
                              className="text-[10px] font-mono py-1 px-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                            >
                              Request Evd
                            </Button>
                          )}

                          {/* Quick Inspect Drawer Button */}
                          <button
                            onClick={() => setDrawerFinding(finding)}
                            className="p-1.5 rounded bg-[#161e29] border border-[#212c3d] text-[#8c90a0] hover:text-[#f1f5f9] transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Primary Examiner Workspace Button */}
                          <Button
                            size="sm"
                            variant="primary"
                            iconRight={<ArrowRight className="w-3 h-3" />}
                            onClick={() => handleOpenFinding(finding.id)}
                            className="text-[11px] font-mono py-1 px-2.5 bg-[#1d4ed8] hover:bg-[#2563eb]"
                          >
                            Open →
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
          /* Empty State (Section 31) */
          <div className="p-8 text-center space-y-2.5">
            <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto" />
            <h3 className="text-[14px] font-bold text-[#f1f5f9]">
              No items currently require review.
            </h3>
            <p className="text-[11px] text-[#8c90a0] max-w-sm mx-auto font-mono">
              All active supervisory signals have been reviewed, or no findings match your selected filter criteria.
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

        {/* Pagination Bar (Section 18) */}
        {filteredFindings.length > 0 && (
          <div className="p-3 bg-[#111722] border-t border-[#212c3d] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#8c90a0]">
            <div>
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredFindings.length)}–
              {Math.min(currentPage * pageSize, filteredFindings.length)} of {filteredFindings.length} review items
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
      {/* 5. CONTEXTUAL DETAIL DRAWER (Section 30)                                  */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={Boolean(drawerFinding)}
        onClose={() => setDrawerFinding(null)}
        title={drawerFinding ? `${drawerFinding.id} — ${drawerFinding.cseId}` : ''}
        subtitle="Supervisory Finding Context Preview"
        width="md"
      >
        {drawerFinding && (
          <div className="space-y-4 text-[12px]">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={drawerFinding.priority} />
              <StatusBadge status={drawerFinding.status} />
              <span className="px-2 py-0.5 rounded bg-[#182335] text-[#93c5fd] font-mono text-[10px] border border-[#263750]">
                {drawerFinding.signalType.replace(/_/g, ' ')}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#161e29] text-[#cbd5e1] font-mono text-[10px] border border-[#212c3d]">
                Control: {drawerFinding.controlId}
              </span>
            </div>

            {/* Title & Description */}
            <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-1.5">
              <div className="text-[13px] font-bold text-[#f1f5f9]">
                {drawerFinding.title}
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                {drawerFinding.whyFlagged}
              </p>
            </div>

            {/* Expected vs Observed Summary */}
            <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#64748b]">Analytical Discrepancy</div>
              <div className="space-y-1 text-[11px]">
                <div>
                  <span className="text-[#10b981] font-mono font-semibold">Expected: </span>
                  <span className="text-[#cbd5e1]">{drawerFinding.expectedState}</span>
                </div>
                <div>
                  <span className="text-rose-300 font-mono font-semibold">Observed: </span>
                  <span className="text-[#cbd5e1]">{drawerFinding.observedState}</span>
                </div>
              </div>
            </div>

            {/* Evidence & Provenance */}
            <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Evidence Strength:</span>
                <span className="text-[#10b981] font-bold">{drawerFinding.evidenceStrength}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Completeness:</span>
                <span className="text-[#60a5fa] font-bold">{drawerFinding.completeness}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Supporting Telemetry:</span>
                <span className="text-[#cbd5e1]">{drawerFinding.sourceEvidence.length} records</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Assessment Period:</span>
                <span className="text-[#cbd5e1]">{drawerFinding.provenance.assessmentPeriod}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  setDrawerFinding(null);
                  handleOpenFinding(drawerFinding.id);
                }}
                className="w-full justify-center bg-[#1d4ed8] hover:bg-[#2563eb]"
              >
                Open in Examiner Workspace
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDrawerFinding(null);
                    navigate(`/supervision/cses/${drawerFinding.cseId}`);
                  }}
                  className="w-full justify-center text-[11px] font-mono"
                >
                  View CSE Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const f = drawerFinding;
                    setDrawerFinding(null);
                    handleOpenEvidenceDemand(f);
                  }}
                  className="w-full justify-center text-[11px] font-mono border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                >
                  Demand Evidence
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* 6. REQUEST EVIDENCE MODAL (Section 24)                                    */}
      {/* ========================================================================= */}
      {evidenceModalFinding && (
        <Modal
          isOpen={Boolean(evidenceModalFinding)}
          onClose={() => setEvidenceModalFinding(null)}
          title="Request Additional Evidence"
          maxWidth="md"
        >
          <div className="space-y-4 text-[12px]">
            <p className="text-[#94a3b8] leading-relaxed">
              Dispatch a formal statutory evidence demand to the Critical Sector Entity compliance liaison under Section 70B regulatory powers.
            </p>

            <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Finding ID:</span>
                <span className="text-[#60a5fa] font-bold">{evidenceModalFinding.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Target CSE:</span>
                <span className="text-[#f1f5f9]">{evidenceModalFinding.cseId} ({evidenceModalFinding.cseName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Control Reference:</span>
                <span className="text-[#cbd5e1]">{evidenceModalFinding.controlId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Statutory Authority:</span>
                <span className="text-[#10b981] font-bold">NCIIPC-SEC-70B-DEMAND</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-[#94a3b8] block">
                Requested Evidence Artifact / Specification:
              </label>
              <textarea
                value={requestedEvidenceText}
                onChange={(e) => setRequestedEvidenceText(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded bg-[#111622] border border-[#212c3d] text-[12px] text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] font-mono resize-none"
                placeholder="Specify required raw telemetry logs, ticket records, or cryptographic audit tokens..."
              />
            </div>

            <div className="p-2.5 rounded bg-[#182335] border border-[#263750] text-[11px] text-[#93c5fd] font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#60a5fa]" />
              <span>Submission will transition finding state to UNDER_REVIEW and record an immutable audit event.</span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEvidenceModalFinding(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSubmittingDemand}
                onClick={handleConfirmEvidenceDemand}
                iconRight={<Send className="w-3.5 h-3.5" />}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold"
              >
                {isSubmittingDemand ? 'Dispatching Demand...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};
