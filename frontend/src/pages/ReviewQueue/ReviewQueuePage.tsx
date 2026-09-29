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
  Send,
  Eye,
  ShieldAlert,
  HelpCircle,
  X,
  Filter,
  RefreshCw,
  UserCheck,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import {
  PageContainer,
  Input,
  Select,
  StatusBadge,
  PriorityBadge,
  Button,
  Drawer,
  Modal,
  LoadingState,
  EmptyState,
  ErrorState
} from '@/components/common';

export const ReviewQueuePage: React.FC = () => {
  const { 
    findings, 
    cses, 
    auditTrail,
    userRole,
    setActiveFindingId, 
    setActiveCseId,
    requestEvidenceDemand,
    refreshAllData,
    isLoading
  } = useSupervisory();

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCse, setSelectedCse] = useState(searchParams.get('cseId') || 'ALL');
  const [selectedControl, setSelectedControl] = useState(searchParams.get('controlId') || 'ALL');
  const [selectedSignal, setSelectedSignal] = useState(searchParams.get('signal') || 'ALL');
  const [selectedPriority, setSelectedPriority] = useState(searchParams.get('priority') || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'ACTIVE');
  const [selectedAssignment, setSelectedAssignment] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');

  // Pagination & Group Collapsing State
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  // Drawer & Evidence Demand Modal State
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

    const controlParam = searchParams.get('controlId');
    if (controlParam) setSelectedControl(controlParam);

    const signalParam = searchParams.get('signal');
    if (signalParam) setSelectedSignal(signalParam);

    const statusParam = searchParams.get('status');
    if (statusParam) setSelectedStatus(statusParam);
  }, [searchParams]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCse('ALL');
    setSelectedControl('ALL');
    setSelectedSignal('ALL');
    setSelectedPriority('ALL');
    setSelectedStatus('ACTIVE');
    setSelectedAssignment('ALL');
    setSelectedPeriod('ALL');
    setSearchParams({});
  };

  const handleRefresh = async () => {
    try {
      setLoadError(null);
      await refreshAllData();
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to refresh review queue.');
    }
  };

  // Unique Controls and Periods from real findings
  const availableControls = useMemo(() => {
    const ctrlSet = new Set<string>();
    findings.forEach(f => {
      if (f.controlId) ctrlSet.add(f.controlId);
    });
    return Array.from(ctrlSet).sort();
  }, [findings]);

  const availablePeriods = useMemo(() => {
    const periodSet = new Set<string>();
    findings.forEach(f => {
      if (f.provenance?.assessmentPeriod) periodSet.add(f.provenance.assessmentPeriod);
    });
    return Array.from(periodSet).sort();
  }, [findings]);

  // Available Examiners from decidedBy / audit
  const availableExaminers = useMemo(() => {
    const exSet = new Set<string>();
    findings.forEach(f => {
      if (f.decidedBy) exSet.add(f.decidedBy);
    });
    return Array.from(exSet).sort();
  }, [findings]);

  // Last analysis timestamp
  const lastUpdatedTimestamp = useMemo(() => {
    if (auditTrail && auditTrail.length > 0) {
      return auditTrail[0].timestamp;
    }
    const dates = findings.map(f => f.decidedAt).filter(Boolean);
    if (dates.length > 0) {
      return new Date(dates[0] as string).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return '29 Sep 2026, 14:30 IST';
  }, [auditTrail, findings]);

  // Count of pending review items
  const pendingReviewCount = useMemo(() => {
    return findings.filter(f => f.status === 'CANDIDATE' || f.status === 'UNDER_REVIEW').length;
  }, [findings]);

  // Filtered Findings
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      // Search across Finding ID, CSE ID, CSE Name, Title, Control ID, Signal Type
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

      // Control Filter
      if (selectedControl !== 'ALL' && f.controlId.toLowerCase() !== selectedControl.toLowerCase()) return false;

      // Signal Filter
      if (selectedSignal !== 'ALL' && f.signalType !== selectedSignal) return false;

      // Priority Filter
      if (selectedPriority !== 'ALL' && f.priority !== selectedPriority) return false;

      // Assignment Filter
      if (selectedAssignment !== 'ALL') {
        if (selectedAssignment === 'UNASSIGNED' && f.decidedBy) return false;
        if (selectedAssignment !== 'UNASSIGNED' && f.decidedBy !== selectedAssignment) return false;
      }

      // Period / Date Filter
      if (selectedPeriod !== 'ALL') {
        if (f.provenance?.assessmentPeriod !== selectedPeriod) return false;
      }

      // Status Filter ('ACTIVE' = CANDIDATE + UNDER_REVIEW)
      if (selectedStatus === 'ACTIVE') {
        if (f.status !== 'CANDIDATE' && f.status !== 'UNDER_REVIEW') return false;
      } else if (selectedStatus !== 'ALL') {
        if (f.status !== selectedStatus) return false;
      }

      return true;
    });
  }, [findings, searchTerm, selectedCse, selectedControl, selectedSignal, selectedPriority, selectedStatus, selectedAssignment, selectedPeriod]);

  // Grouping using actual priority: HIGH (including CRITICAL), MEDIUM, LOW
  const groupedFindings = useMemo(() => {
    const highGroup: Finding[] = [];
    const mediumGroup: Finding[] = [];
    const lowGroup: Finding[] = [];

    filteredFindings.forEach(f => {
      if (f.priority === 'CRITICAL' || f.priority === 'HIGH') {
        highGroup.push(f);
      } else if (f.priority === 'MEDIUM') {
        mediumGroup.push(f);
      } else {
        lowGroup.push(f);
      }
    });

    return [
      {
        id: 'HIGH',
        label: 'HIGH PRIORITY',
        subtitle: 'Critical & High Severity — Requires Immediate Supervisory Adjudication',
        count: highGroup.length,
        items: highGroup,
        colorBadge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        dotColor: 'bg-rose-500'
      },
      {
        id: 'MEDIUM',
        label: 'MEDIUM PRIORITY',
        subtitle: 'Secondary Discrepancies & Process Variance Inquiries',
        count: mediumGroup.length,
        items: mediumGroup,
        colorBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dotColor: 'bg-amber-500'
      },
      {
        id: 'LOW',
        label: 'LOW PRIORITY',
        subtitle: 'Informational Signals & Minor Sampling Anomalies',
        count: lowGroup.length,
        items: lowGroup,
        colorBadge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
        dotColor: 'bg-slate-400'
      }
    ];
  }, [filteredFindings]);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

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
      {/* 1. OPERATIONAL WORKLIST HEADER */}
      <div className="bg-[#111622] border border-[#212c3d] rounded-lg p-4 md:p-5 shadow-sm mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] md:text-[20px] font-semibold text-[#f1f5f9] tracking-tight">
                Review Queue
              </h1>
              <span className="text-[#475569]">•</span>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
                {pendingReviewCount} Pending Review
              </span>
              <span className="text-[11px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2 py-0.5 rounded border border-[#7bdb80]/30 font-medium">
                Active Enclave
              </span>
            </div>

            <p className="text-[12px] text-[#94a3b8]">
              Immediate operational worklist of analytical signals, negative space gaps, and statutory candidate findings awaiting supervisor decision.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748b] font-mono pt-0.5">
              <span>Assessment Cycle: <strong className="text-[#cbd5e1]">Q3 2026 Active Assessment</strong></span>
              <span>•</span>
              <span>Active Scope: <strong className="text-[#60a5fa]">{cses.length} Enrolled Entities</strong></span>
              <span>•</span>
              <span>Role: <strong className="text-[#cbd5e1]">{userRole} (NC-8802)</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#64748b]" />
                <span>Last Updated: <strong className="text-[#cbd5e1]">{lastUpdatedTimestamp}</strong></span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#212c3d]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              title="Synchronize queue with backend"
            >
              Sync
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-3 h-3 text-[#8c90a0]" />}
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

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

      {/* 2. OPERATIONAL FILTERS TOOLBAR */}
      <div className="bg-[#111622] border border-[#212c3d] rounded-lg p-3.5 mb-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Free Text Search */}
          <Input
            icon={<Search className="w-4 h-4 text-[#64748b]" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Finding ID, CSE, Control, Issue..."
            sizeVariant="sm"
          />

          {/* Priority Filter */}
          <Select
            sizeVariant="sm"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Priorities' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' }
            ]}
          />

          {/* Control Filter */}
          <Select
            sizeVariant="sm"
            value={selectedControl}
            onChange={(e) => setSelectedControl(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Controls' },
              ...availableControls.map(c => ({ value: c, label: `Control: ${c}` }))
            ]}
          />

          {/* CSE Filter */}
          <Select
            sizeVariant="sm"
            value={selectedCse}
            onChange={(e) => setSelectedCse(e.target.value)}
            options={[
              { value: 'ALL', label: 'All CSEs' },
              ...cses.map(c => ({ value: c.cseId, label: `${c.cseId} — ${c.cseName}` }))
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Signal Type Filter */}
          <Select
            sizeVariant="sm"
            value={selectedSignal}
            onChange={(e) => setSelectedSignal(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Signal Types' },
              { value: 'EXECUTION_GAP', label: 'Execution Gap' },
              { value: 'NEGATIVE_SPACE', label: 'Negative Space' },
              { value: 'PROCESS_DEVIATION', label: 'Process Deviation' },
              { value: 'HISTORICAL_RECURRENCE', label: 'Historical Recurrence' },
              { value: 'CROSS_SOURCE_CONSISTENCY', label: 'Consistency Discrepancy' },
              { value: 'CAPABILITY_DISCREPANCY', label: 'Capability Discrepancy' },
              { value: 'BEHAVIOURAL', label: 'Behavioural Anomaly' }
            ]}
          />

          {/* Status Filter */}
          <Select
            sizeVariant="sm"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
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

          {/* Assignment Filter */}
          <Select
            sizeVariant="sm"
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Assignments' },
              { value: 'UNASSIGNED', label: 'Unassigned / System Flagged' },
              ...availableExaminers.map(ex => ({ value: ex, label: `Assigned: ${ex}` }))
            ]}
          />

          {/* Assessment Period / Date Filter */}
          <Select
            sizeVariant="sm"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Assessment Periods' },
              ...availablePeriods.map(p => ({ value: p, label: `Period: ${p}` }))
            ]}
          />
        </div>

        {/* Filter Results Summary */}
        <div className="flex items-center justify-between pt-2 border-t border-[#212c3d] text-[11px] font-mono text-[#8c90a0]">
          <div>
            Showing <strong className="text-[#f1f5f9]">{filteredFindings.length}</strong> active review items in worklist
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="hover:text-[#f1f5f9] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* 3. WORKLIST CONTENT: LOADING / ERROR / EMPTY / PRIORITY-GROUPED QUEUE */}
      {isLoading && findings.length === 0 ? (
        <LoadingState message="Loading supervisory review worklist..." />
      ) : loadError ? (
        <ErrorState
          title="Review Queue Ingestion Error"
          message={loadError}
          onRetry={handleRefresh}
        />
      ) : filteredFindings.length === 0 ? (
        <EmptyState
          title="No items currently require supervisory review."
          description={
            searchTerm || selectedCse !== 'ALL' || selectedControl !== 'ALL' || selectedSignal !== 'ALL' || selectedPriority !== 'ALL' || selectedStatus !== 'ACTIVE'
              ? "All findings matching the active filters have been adjudicated or cleared. Reset filters to view other candidate signals."
              : "All analytical outputs have been validated or resolved in the active assessment scope."
          }
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset All Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {groupedFindings.map((group) => {
            if (group.count === 0 && selectedPriority !== 'ALL' && selectedPriority !== group.id) {
              return null;
            }

            const isCollapsed = collapsedGroups[group.id];

            return (
              <div 
                key={group.id}
                className="bg-[#111622] border border-[#212c3d] rounded-lg overflow-hidden shadow-sm"
              >
                {/* Group Header Bar */}
                <div 
                  onClick={() => toggleGroup(group.id)}
                  className="px-4 py-3 bg-[#0d121a] border-b border-[#212c3d] flex items-center justify-between cursor-pointer hover:bg-[#141b27] transition-colors select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${group.dotColor}`} />
                    <span className="font-mono text-[12px] font-bold tracking-wider text-[#f1f5f9]">
                      {group.label}
                    </span>
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${group.colorBadge} font-bold`}>
                      {group.count} Items
                    </span>
                    <span className="hidden md:inline text-[11px] text-[#64748b]">
                      • {group.subtitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[#8c90a0]">
                    <span className="text-[11px] font-mono">
                      {isCollapsed ? 'Expand' : 'Collapse'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Queue Items Table */}
                {!isCollapsed && group.count > 0 && (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-left text-[12px] md:text-[13px]">
                      <thead>
                        <tr className="border-b border-[#212c3d] bg-[#111622] text-[10px] font-mono uppercase text-[#8c90a0] tracking-wider select-none">
                          <th className="px-3.5 py-2.5" style={{ width: '130px' }}>Priority &amp; ID</th>
                          <th className="px-3.5 py-2.5" style={{ minWidth: '240px' }}>Finding / Issue</th>
                          <th className="px-3.5 py-2.5" style={{ width: '160px' }}>CSE Entity</th>
                          <th className="px-3.5 py-2.5" style={{ width: '150px' }}>Signal Type</th>
                          <th className="px-3.5 py-2.5 text-center" style={{ width: '100px' }}>Evidence</th>
                          <th className="px-3.5 py-2.5" style={{ width: '110px' }}>Score</th>
                          <th className="px-3.5 py-2.5" style={{ width: '150px' }}>Assignment &amp; Age</th>
                          <th className="px-3.5 py-2.5" style={{ width: '120px' }}>Status</th>
                          <th className="px-3.5 py-2.5 text-right" style={{ width: '140px' }}>Action</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#212c3d] text-[#dfe2eb] bg-[#0d121a]">
                        {group.items.map((item) => {
                          const evidenceCount = item.sourceEvidence ? item.sourceEvidence.length : 0;
                          const score = item.completeness || 80;
                          const ageDisplay = item.decidedAt 
                            ? new Date(item.decidedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                            : 'On-Cycle';

                          return (
                            <tr
                              key={item.id}
                              onClick={() => handleOpenFinding(item.id)}
                              className="h-14 hover:bg-[#111622] cursor-pointer transition-colors group"
                            >
                              {/* 1. Priority & ID */}
                              <td className="px-3.5 py-2.5 align-middle">
                                <div className="flex flex-col space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <PriorityBadge priority={item.priority} />
                                  </div>
                                  <div className="flex items-center gap-1 font-mono text-[11px]">
                                    <span className="font-bold text-[#60a5fa] group-hover:underline">
                                      {item.id}
                                    </span>
                                    <span className="text-[#475569]">•</span>
                                    <span className="text-[#94a3b8]">{item.controlId}</span>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Finding / Issue */}
                              <td className="px-3.5 py-2.5 align-middle">
                                <div className="flex flex-col pr-2">
                                  <span className="font-medium text-[#f1f5f9] text-[13px] leading-snug line-clamp-1 group-hover:text-[#60a5fa] transition-colors">
                                    {item.title}
                                  </span>
                                  <p className="text-[11px] text-[#8c90a0] line-clamp-1 mt-0.5 font-sans">
                                    <strong className="text-[#cbd5e1]">Gap: </strong>{item.gapSummary || item.whyFlagged}
                                  </p>
                                </div>
                              </td>

                              {/* 3. CSE Entity */}
                              <td 
                                className="px-3.5 py-2.5 align-middle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCseId(item.cseId);
                                  navigate(`/supervision/cses/${item.cseId}`);
                                }}
                              >
                                <div className="flex flex-col font-mono text-[11px]">
                                  <span className="font-semibold text-[#cbd5e1] hover:text-[#60a5fa] hover:underline flex items-center gap-1">
                                    <span>{item.cseId}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-[#64748b]" />
                                  </span>
                                  <span className="text-[10px] text-[#64748b] truncate max-w-[150px]">
                                    {item.cseName}
                                  </span>
                                </div>
                              </td>

                              {/* 4. Signal Type */}
                              <td className="px-3.5 py-2.5 align-middle">
                                <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] font-medium bg-[#111622] text-[#f59e0b] border border-[#212c3d] truncate max-w-[140px]">
                                  {item.signalType.replace(/_/g, ' ')}
                                </span>
                              </td>

                              {/* 5. Evidence Count */}
                              <td className="px-3.5 py-2.5 align-middle text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-mono text-[11px] font-bold text-[#f1f5f9]">
                                    {evidenceCount} Records
                                  </span>
                                  <span className="text-[9px] font-mono text-[#10b981]">
                                    Strength: {item.evidenceStrength}
                                  </span>
                                </div>
                              </td>

                              {/* 6. Score */}
                              <td className="px-3.5 py-2.5 align-middle">
                                <div className="flex flex-col font-mono text-[11px]">
                                  <span className="font-bold text-[#10b981]">{score}%</span>
                                  <span className="text-[9px] text-[#64748b]">Confidence</span>
                                </div>
                              </td>

                              {/* 7. Assignment & Age */}
                              <td className="px-3.5 py-2.5 align-middle">
                                <div className="flex flex-col font-mono text-[11px]">
                                  <span className="text-[#cbd5e1] truncate max-w-[140px]">
                                    {item.decidedBy || 'Unassigned (Lead)'}
                                  </span>
                                  <span className="text-[10px] text-[#64748b] flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    <span>{ageDisplay}</span>
                                  </span>
                                </div>
                              </td>

                              {/* 8. Status */}
                              <td className="px-3.5 py-2.5 align-middle">
                                <StatusBadge status={item.status} />
                              </td>

                              {/* 9. Action (Existing Actions Only) */}
                              <td 
                                className="px-3.5 py-2.5 align-middle text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-end gap-1.5">
                                  {item.evidenceStrength === 'LOW' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenEvidenceDemand(item)}
                                      className="text-[10px] font-mono py-1 px-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                                      title="Request statutory evidence"
                                    >
                                      Demand
                                    </Button>
                                  )}

                                  <button
                                    onClick={() => setDrawerFinding(item)}
                                    className="p-1.5 rounded bg-[#111622] border border-[#212c3d] text-[#8c90a0] hover:text-[#f1f5f9] transition-colors"
                                    title="Quick Preview"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  <Button
                                    size="sm"
                                    variant="primary"
                                    iconRight={<ArrowRight className="w-3 h-3" />}
                                    onClick={() => handleOpenFinding(item.id)}
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
                )}

                {!isCollapsed && group.count === 0 && (
                  <div className="p-4 text-center text-[12px] font-mono text-[#64748b] bg-[#0d121a]">
                    No items in this priority tier require review.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. CONTEXTUAL DETAIL DRAWER (Preserved existing review functionality) */}
      <Drawer
        isOpen={Boolean(drawerFinding)}
        onClose={() => setDrawerFinding(null)}
        title={drawerFinding ? `${drawerFinding.id} — ${drawerFinding.cseId}` : ''}
        subtitle="Supervisory Finding Context"
        width="md"
      >
        {drawerFinding && (
          <div className="space-y-4 text-[12px]">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={drawerFinding.priority} />
              <StatusBadge status={drawerFinding.status} />
              <span className="px-2 py-0.5 rounded bg-[#111622] text-[#f59e0b] font-mono text-[10px] border border-[#212c3d]">
                {drawerFinding.signalType.replace(/_/g, ' ')}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#111622] text-[#cbd5e1] font-mono text-[10px] border border-[#212c3d]">
                Control: {drawerFinding.controlId}
              </span>
            </div>

            <div className="p-3 rounded bg-[#0d121a] border border-[#212c3d] space-y-1.5">
              <div className="text-[13px] font-bold text-[#f1f5f9]">
                {drawerFinding.title}
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                {drawerFinding.whyFlagged}
              </p>
            </div>

            <div className="p-3 rounded bg-[#0d121a] border border-[#212c3d] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#64748b]">Analytical Discrepancy</div>
              <div className="space-y-1 text-[11px]">
                <div>
                  <span className="text-[#10b981] font-mono font-semibold">Expected State: </span>
                  <span className="text-[#cbd5e1]">{drawerFinding.expectedState}</span>
                </div>
                <div>
                  <span className="text-rose-400 font-mono font-semibold">Observed Gap: </span>
                  <span className="text-[#cbd5e1]">{drawerFinding.observedState}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded bg-[#0d121a] border border-[#212c3d] space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Evidence Strength:</span>
                <span className="text-[#10b981] font-bold">{drawerFinding.evidenceStrength}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Confidence Score:</span>
                <span className="text-[#60a5fa] font-bold">{drawerFinding.completeness}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Supporting Records:</span>
                <span className="text-[#cbd5e1]">{drawerFinding.sourceEvidence.length} records</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Assessment Period:</span>
                <span className="text-[#cbd5e1]">{drawerFinding.provenance.assessmentPeriod}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  setDrawerFinding(null);
                  handleOpenFinding(drawerFinding.id);
                }}
                className="w-full justify-center"
              >
                Open in Examiner Workspace
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDrawerFinding(null);
                    setActiveCseId(drawerFinding.cseId);
                    navigate(`/supervision/cses/${drawerFinding.cseId}`);
                  }}
                  className="w-full justify-center text-[11px] font-mono"
                >
                  CSE Dossier
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

      {/* 5. REQUEST EVIDENCE DEMAND MODAL (Preserved existing functionality) */}
      {evidenceModalFinding && (
        <Modal
          isOpen={Boolean(evidenceModalFinding)}
          onClose={() => setEvidenceModalFinding(null)}
          title="Request Statutory Evidence Demand"
          maxWidth="md"
        >
          <div className="space-y-4 text-[12px]">
            <p className="text-[#94a3b8] leading-relaxed">
              Dispatch a formal statutory evidence demand to the Critical Sector Entity compliance liaison under Section 70B regulatory powers.
            </p>

            <div className="p-3 rounded bg-[#0d121a] border border-[#212c3d] font-mono space-y-1.5">
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
                Requested Evidence Specification:
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
