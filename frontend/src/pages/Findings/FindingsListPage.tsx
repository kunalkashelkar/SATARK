import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { Finding, FindingStatus, Priority } from '@/types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight,
  Send,
  X,
  Check,
  Building2,
  Calendar,
  Filter,
  Activity,
  GitBranch,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Modal, Button, PageContainer } from '@/components/common';

export const FindingsListPage: React.FC = () => {
  const {
    findings,
    cses,
    remediations,
    updateFindingDecision,
    requestEvidenceDemand
  } = useSupervisory();

  // Selected finding ID for detail view drawer
  const [selectedFindingId, setSelectedFindingId] = useState<string>(() => {
    return findings[0]?.id || 'FND-0142';
  });

  // Filter States
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterControl, setFilterControl] = useState<string>('ALL');
  const [filterCse, setFilterCse] = useState<string>('ALL');
  const [filterSignalType, setFilterSignalType] = useState<string>('ALL');
  const [filterExaminer, setFilterExaminer] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Examiner action state & modal
  const [modalAction, setModalAction] = useState<FindingStatus | 'REQUEST_EVD' | null>(null);
  const [modalReason, setModalReason] = useState('NCIIPC-SEC-70B-CRIT-07');
  const [actionNotes, setActionNotes] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Derive unique filter lists from actual findings
  const uniqueControls = useMemo(() => {
    const set = new Set<string>();
    findings.forEach(f => {
      if (f.controlId) set.add(f.controlId);
    });
    return Array.from(set).sort();
  }, [findings]);

  const uniqueCses = useMemo(() => {
    const map = new Map<string, string>();
    findings.forEach(f => {
      if (f.cseId) map.set(f.cseId, f.cseName || f.cseId);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [findings]);

  const uniqueFindingTypes = useMemo(() => {
    const set = new Set<string>();
    findings.forEach(f => {
      if (f.signalType) set.add(f.signalType);
    });
    return Array.from(set).sort();
  }, [findings]);

  const uniqueExaminers = useMemo(() => {
    const set = new Set<string>();
    findings.forEach(f => {
      if (f.decidedBy) set.add(f.decidedBy);
    });
    if (set.size === 0) set.add('NC-8802 (Lead Examiner)');
    return Array.from(set).sort();
  }, [findings]);

  const uniqueDates = useMemo(() => {
    const set = new Set<string>();
    findings.forEach(f => {
      if (f.provenance?.assessmentPeriod) {
        set.add(f.provenance.assessmentPeriod);
      }
    });
    return Array.from(set).sort();
  }, [findings]);

  // Actual Summary Metrics
  const summaryCounts = useMemo(() => {
    let openCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let confirmedCount = 0;
    let remediationPendingCount = 0;
    let closedCount = 0;

    findings.forEach(f => {
      // Priority counts (High includes CRITICAL + HIGH)
      if (f.priority === 'CRITICAL' || f.priority === 'HIGH') {
        highCount += 1;
      } else if (f.priority === 'MEDIUM') {
        mediumCount += 1;
      } else if (f.priority === 'LOW') {
        lowCount += 1;
      }

      // Status classification
      if (f.status === 'VALIDATED') {
        confirmedCount += 1;
      }

      // Check linked remediation status
      const linkedRem = remediations.find(r => r.findingId?.toLowerCase() === f.id.toLowerCase());
      const isRemPending = linkedRem && (linkedRem.status === 'OPEN' || linkedRem.status === 'IN_PROGRESS' || linkedRem.status === 'SUBMITTED' || linkedRem.status === 'UNDER_VERIFICATION');

      if (isRemPending) {
        remediationPendingCount += 1;
      }

      if (f.status === 'REJECTED' || (linkedRem && linkedRem.status === 'CLOSED')) {
        closedCount += 1;
      }

      // Open: any finding that is actively requiring attention (Candidate, Under Review, or Validated with pending remediation)
      if (f.status === 'CANDIDATE' || f.status === 'UNDER_REVIEW' || isRemPending) {
        openCount += 1;
      }
    });

    return {
      open: openCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      confirmed: confirmedCount,
      remediationPending: remediationPendingCount,
      closed: closedCount
    };
  }, [findings, remediations]);

  // Filtered Findings
  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      if (filterPriority !== 'ALL') {
        if (filterPriority === 'HIGH' && f.priority !== 'HIGH' && f.priority !== 'CRITICAL') return false;
        if (filterPriority !== 'HIGH' && f.priority !== filterPriority) return false;
      }

      if (filterStatus !== 'ALL') {
        if (filterStatus === 'CONFIRMED' && f.status !== 'VALIDATED') return false;
        else if (filterStatus === 'CLOSED') {
          const linkedRem = remediations.find(r => r.findingId?.toLowerCase() === f.id.toLowerCase());
          if (f.status !== 'REJECTED' && (!linkedRem || linkedRem.status !== 'CLOSED')) return false;
        } else if (filterStatus === 'REMEDIATION_PENDING') {
          const linkedRem = remediations.find(r => r.findingId?.toLowerCase() === f.id.toLowerCase());
          if (!linkedRem || (linkedRem.status !== 'OPEN' && linkedRem.status !== 'IN_PROGRESS' && linkedRem.status !== 'SUBMITTED' && linkedRem.status !== 'UNDER_VERIFICATION')) return false;
        } else if (filterStatus === 'OPEN') {
          const linkedRem = remediations.find(r => r.findingId?.toLowerCase() === f.id.toLowerCase());
          const isRemPending = linkedRem && (linkedRem.status === 'OPEN' || linkedRem.status === 'IN_PROGRESS' || linkedRem.status === 'SUBMITTED' || linkedRem.status === 'UNDER_VERIFICATION');
          if (f.status !== 'CANDIDATE' && f.status !== 'UNDER_REVIEW' && !isRemPending) return false;
        } else if (f.status !== filterStatus) {
          return false;
        }
      }

      if (filterControl !== 'ALL' && f.controlId !== filterControl) return false;
      if (filterCse !== 'ALL' && f.cseId !== filterCse) return false;
      if (filterSignalType !== 'ALL' && f.signalType !== filterSignalType) return false;

      if (filterExaminer !== 'ALL') {
        const examiner = f.decidedBy || 'NC-8802 (Lead Examiner)';
        if (!examiner.toLowerCase().includes(filterExaminer.toLowerCase())) return false;
      }

      if (filterDate !== 'ALL') {
        if (f.provenance?.assessmentPeriod !== filterDate) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          f.id.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.controlId.toLowerCase().includes(q) ||
          f.cseId.toLowerCase().includes(q) ||
          f.cseName.toLowerCase().includes(q) ||
          f.whyFlagged.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [findings, filterPriority, filterStatus, filterControl, filterCse, filterSignalType, filterExaminer, filterDate, searchQuery, remediations]);

  // Selected Finding object for the Detail view
  const activeFinding = useMemo(() => {
    return findings.find(f => f.id.toLowerCase() === selectedFindingId.toLowerCase()) || filteredFindings[0] || findings[0];
  }, [findings, selectedFindingId, filteredFindings]);

  // Linked remediation for the active finding
  const activeRemediation = useMemo(() => {
    if (!activeFinding) return undefined;
    return remediations.find(r => r.findingId?.toLowerCase() === activeFinding.id.toLowerCase());
  }, [remediations, activeFinding]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setFilterPriority('ALL');
    setFilterStatus('ALL');
    setFilterControl('ALL');
    setFilterCse('ALL');
    setFilterSignalType('ALL');
    setFilterExaminer('ALL');
    setFilterDate('ALL');
    setSearchQuery('');
  };

  // Execute Examiner Decision
  const handleExecuteDecision = async () => {
    if (!modalAction || !activeFinding) return;

    if (modalAction === 'REQUEST_EVD') {
      await requestEvidenceDemand(
        activeFinding.id,
        actionNotes || 'Demanded Tier-2 escalation records per Section 70B'
      );
      showNotification(`Evidence Demand Dispatched for ${activeFinding.id}. Status updated.`);
    } else {
      await updateFindingDecision(activeFinding.id, {
        status: modalAction,
        notes: actionNotes || activeFinding.decisionNotes,
        reason: modalReason
      });
      showNotification(`Human Examiner Decision Saved: ${modalAction} for ${activeFinding.id}`);
    }
    setModalAction(null);
    setActionNotes('');
  };

  return (
    <PageContainer>
      {/* 1. STANDARDIZED SAT-SA PAGE HEADER */}
      <div className="bg-[#111622] border border-[#212c3d] rounded-lg p-4 md:p-5 shadow-sm mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] md:text-[20px] font-semibold text-[#f1f5f9] tracking-tight">
                Findings Adjudication
              </h1>
              <span className="text-[#475569]">•</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#1f6feb]/20 text-[#60a5fa] border border-[#1f6feb]/30">
                {findings.length} Available Records
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                SEC-70B Adjudication
              </span>
            </div>

            <p className="text-[12px] text-[#94a3b8]">
              Authoritative supervisory findings ledger. Primary question: <strong className="text-[#cbd5e1]">&ldquo;What findings require supervisory action?&rdquo;</strong>
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748b] font-mono pt-0.5">
              <span>Standard: <strong className="text-[#cbd5e1]">NCIIPC Guidelines Sec 70B</strong></span>
              <span>•</span>
              <span>Assessment Scope: <strong className="text-[#60a5fa]">{uniqueCses.length} Entities Enrolled</strong></span>
              <span>•</span>
              <span>Examiner Node: <strong className="text-[#cbd5e1]">NC-8802 (Lead Examiner)</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#212c3d]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Filters
            </Button>
            <Link to="/remediation">
              <Button
                variant="secondary"
                size="sm"
                iconRight={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Remediation Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. ACTUAL SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
        {/* Open */}
        <div 
          onClick={() => setFilterStatus(filterStatus === 'OPEN' ? 'ALL' : 'OPEN')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'OPEN' 
              ? 'bg-[#1d4ed8]/20 border-[#3b82f6]' 
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Open</span>
            <Activity className="w-3.5 h-3.5 text-[#60a5fa]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#60a5fa]">{summaryCounts.open}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Pending review</div>
        </div>

        {/* High */}
        <div 
          onClick={() => setFilterPriority(filterPriority === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterPriority === 'HIGH' 
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' 
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">High / Crit</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">{summaryCounts.high}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Elevated risk posture</div>
        </div>

        {/* Medium */}
        <div 
          onClick={() => setFilterPriority(filterPriority === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterPriority === 'MEDIUM' 
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Medium</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">{summaryCounts.medium}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Standard deviations</div>
        </div>

        {/* Low */}
        <div 
          onClick={() => setFilterPriority(filterPriority === 'LOW' ? 'ALL' : 'LOW')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterPriority === 'LOW' 
              ? 'bg-slate-500/20 border-slate-400 text-slate-200' 
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Low</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-[#cbd5e1]">{summaryCounts.low}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Minor observations</div>
        </div>

        {/* Confirmed */}
        <div 
          onClick={() => setFilterStatus(filterStatus === 'CONFIRMED' ? 'ALL' : 'CONFIRMED')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'CONFIRMED' 
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Confirmed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{summaryCounts.confirmed}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Validated by examiner</div>
        </div>

        {/* Remediation Pending */}
        <div 
          onClick={() => setFilterStatus(filterStatus === 'REMEDIATION_PENDING' ? 'ALL' : 'REMEDIATION_PENDING')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'REMEDIATION_PENDING' 
              ? 'bg-purple-500/15 border-purple-500/40 text-purple-300' 
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Rem. Pending</span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">{summaryCounts.remediationPending}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Mandate ongoing</div>
        </div>

        {/* Closed */}
        <div 
          onClick={() => setFilterStatus(filterStatus === 'CLOSED' ? 'ALL' : 'CLOSED')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'CLOSED' 
              ? 'bg-slate-700/40 border-slate-500 text-slate-200' 
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Closed</span>
            <Check className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-[#cbd5e1]">{summaryCounts.closed}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Rejected or sealed</div>
        </div>
      </div>

      {/* 3. FILTERS BAR */}
      <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] mb-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[#212c3d] text-xs">
          <div className="flex items-center gap-2 text-[#94a3b8] font-mono">
            <Filter className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span className="uppercase font-semibold tracking-wider text-[11px]">Supervisory Filters</span>
            <span>({filteredFindings.length} matching)</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search finding ID, control, CSE..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#131922] border border-[#212c3d] rounded-md text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {/* Priority Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#64748b]">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#64748b]">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open (Active)</option>
              <option value="CANDIDATE">Candidate</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CONFIRMED">Confirmed (Validated)</option>
              <option value="REMEDIATION_PENDING">Remediation Pending</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="REJECTED">Rejected</option>
              <option value="OVERRIDDEN">Overridden</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Control Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#64748b]">Control</label>
            <select
              value={filterControl}
              onChange={(e) => setFilterControl(e.target.value)}
              className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="ALL">All Controls</option>
              {uniqueControls.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* CSE Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-slate-400">CSE</label>
            <select
              value={filterCse}
              onChange={(e) => setFilterCse(e.target.value)}
              className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All CSEs</option>
              {uniqueCses.map(cse => (
                <option key={cse.id} value={cse.id}>{cse.id} - {cse.name}</option>
              ))}
            </select>
          </div>

          {/* Finding Type (Signal Type) Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-slate-400">Finding Type</label>
            <select
              value={filterSignalType}
              onChange={(e) => setFilterSignalType(e.target.value)}
              className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Finding Types</option>
              {uniqueFindingTypes.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Assigned Examiner Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-slate-400">Assigned Examiner</label>
            <select
              value={filterExaminer}
              onChange={(e) => setFilterExaminer(e.target.value)}
              className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Examiners</option>
              {uniqueExaminers.map(ex => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          {/* Date / Assessment Cycle Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#64748b]">Date / Period</label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="ALL">All Periods</option>
              {uniqueDates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SPLIT: 2. Findings Table (Left) & 4. Finding Detail (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* 2. FINDINGS TABLE (7 Cols on xl) */}
        <div className="xl:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-mono text-[#94a3b8]">
              Showing <span className="text-[#f1f5f9] font-bold">{filteredFindings.length}</span> Findings
            </div>
            <div className="text-xs font-mono text-[#64748b]">
              Click row to inspect details
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#212c3d] bg-[#111622] shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0d121c] text-[#94a3b8] font-mono text-[11px] uppercase border-b border-[#212c3d] select-none">
                <tr>
                  <th className="py-2.5 px-3">Finding ID</th>
                  <th className="py-2.5 px-3">Control</th>
                  <th className="py-2.5 px-3">Issue</th>
                  <th className="py-2.5 px-2 text-center">Priority</th>
                  <th className="py-2.5 px-2 text-center">Score</th>
                  <th className="py-2.5 px-2 text-center">Evidence</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Assigned</th>
                  <th className="py-2.5 px-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212c3d]">
                {filteredFindings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#64748b] font-mono text-xs">
                      No findings match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFindings.map((finding) => {
                    const isSelected = activeFinding && finding.id === activeFinding.id;
                    const linkedRem = remediations.find(r => r.findingId?.toLowerCase() === finding.id.toLowerCase());
                    const assignedExaminer = finding.decidedBy || 'NC-8802';
                    const updatedDate = finding.decidedAt 
                      ? new Date(finding.decidedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                      : finding.provenance?.assessmentPeriod || 'Q3 2026';

                    return (
                      <tr
                        key={finding.id}
                        onClick={() => setSelectedFindingId(finding.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#1d4ed8]/20 text-[#f1f5f9] font-medium border-l-2 border-l-[#3b82f6]'
                            : 'hover:bg-[#161e29] text-[#cbd5e1]'
                        }`}
                      >
                        {/* 1. Finding ID */}
                        <td className="py-2.5 px-3 font-mono font-bold text-[#60a5fa] shrink-0">
                          {finding.id}
                        </td>

                        {/* 2. Control */}
                        <td className="py-2.5 px-3 font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-[#131922] border border-[#212c3d] text-[#cbd5e1]">
                            {finding.controlId}
                          </span>
                        </td>

                        {/* 3. Issue */}
                        <td className="py-3 px-3 max-w-[200px]">
                          <div className="font-semibold text-slate-200 truncate" title={finding.title}>
                            {finding.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate" title={finding.cseName}>
                            {finding.cseId} • {finding.signalType.replace(/_/g, ' ')}
                          </div>
                        </td>

                        {/* 4. Priority */}
                        <td className="py-3 px-2 text-center font-mono">
                          {finding.priority === 'CRITICAL' && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 text-[10px]">
                              CRIT
                            </span>
                          )}
                          {finding.priority === 'HIGH' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30 text-[10px]">
                              HIGH
                            </span>
                          )}
                          {finding.priority === 'MEDIUM' && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px]">
                              MED
                            </span>
                          )}
                          {finding.priority === 'LOW' && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                              LOW
                            </span>
                          )}
                        </td>

                        {/* 5. Score */}
                        <td className="py-3 px-2 text-center font-mono">
                          <div className="font-bold text-slate-200">
                            {finding.completeness}%
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {finding.uncertainty === 'LOW' ? 'High Conf' : finding.uncertainty === 'MEDIUM' ? 'Med Conf' : 'Low Conf'}
                          </div>
                        </td>

                        {/* 6. Evidence */}
                        <td className="py-3 px-2 text-center font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                            {finding.sourceEvidence?.length || 0}
                          </span>
                        </td>

                        {/* 7. Status */}
                        <td className="py-3 px-3">
                          {finding.status === 'VALIDATED' && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                              CONFIRMED
                            </span>
                          )}
                          {finding.status === 'UNDER_REVIEW' && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-semibold border border-amber-500/30">
                              UNDER REVIEW
                            </span>
                          )}
                          {finding.status === 'CANDIDATE' && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] border border-blue-500/30">
                              CANDIDATE
                            </span>
                          )}
                          {finding.status === 'QUALIFIED' && (
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30">
                              QUALIFIED
                            </span>
                          )}
                          {finding.status === 'REJECTED' && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-700">
                              REJECTED
                            </span>
                          )}
                          {finding.status === 'OVERRIDDEN' && (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] border border-rose-500/30">
                              OVERRIDDEN
                            </span>
                          )}
                          {linkedRem && (
                            <div className="text-[10px] text-purple-400 font-mono mt-0.5">
                              Rem: {linkedRem.status}
                            </div>
                          )}
                        </td>

                        {/* 8. Assigned */}
                        <td className="py-3 px-3 text-slate-300 font-mono text-[11px] truncate max-w-[100px]" title={assignedExaminer}>
                          {assignedExaminer}
                        </td>

                        {/* 9. Updated */}
                        <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-400">
                          {updatedDate}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. FINDING DETAIL SECTION (5 Cols on xl) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {activeFinding ? (
            <div className="rounded-lg border border-[#212c3d] bg-[#111622] p-4 md:p-5 shadow-sm space-y-4">
              
              {/* DETAIL HEADER */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#212c3d]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-[#60a5fa]">{activeFinding.id}</span>
                    <span className="px-2 py-0.5 rounded bg-[#131922] font-mono text-[11px] text-[#cbd5e1] border border-[#212c3d]">
                      {activeFinding.controlId}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                      activeFinding.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      activeFinding.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {activeFinding.priority}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#f1f5f9] mt-1 leading-snug">
                    {activeFinding.title}
                  </h2>
                  <div className="text-xs text-[#94a3b8] mt-0.5">
                    {activeFinding.cseName} ({activeFinding.cseId})
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono uppercase text-[#64748b]">Status</div>
                  <div className="font-mono text-xs font-bold text-emerald-400 mt-0.5">
                    {activeFinding.status}
                  </div>
                </div>
              </div>

              {/* SECTION: WHAT (Finding description) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-blue-400 tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <span>WHAT — Finding Description</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <p className="font-medium text-white mb-1.5">
                    "{activeFinding.whyFlagged}"
                  </p>
                  <p className="text-slate-400">
                    {activeFinding.gapSummary || 'Supervisory deviation detected across regulatory evidence trails and operational activity logs.'}
                  </p>
                </div>
              </div>

              {/* SECTION: WHY (Expected vs Observed) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-amber-400 tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>WHY — Expected vs Observed</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-emerald-500/30">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                      Expected Requirement
                    </span>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                      {activeFinding.expectedState || 'Strict adherence to prescribed regulatory cadence and mandatory artifact submission within statutory window.'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-rose-500/30">
                    <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block mb-1">
                      Observed Reality
                    </span>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                      {activeFinding.observedState || 'Telemetry indicates omission or gap in expected escalation pathway and milestone documentation.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION: SIGNALS (Analytical signals) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-purple-400 tracking-wider">
                  <Activity className="w-3.5 h-3.5" />
                  <span>SIGNALS — Analytical Signals</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs flex items-start gap-2.5">
                    <div className="p-1 rounded bg-purple-500/20 text-purple-400 mt-0.5">
                      <GitBranch className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-mono font-semibold text-purple-300">
                        Primary Signal: {activeFinding.signalType.replace(/_/g, ' ')}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                        Confidence {activeFinding.completeness}% • Uncertainty {activeFinding.uncertainty} • Strength {activeFinding.evidenceStrength}
                      </div>
                    </div>
                  </div>

                  {activeFinding.supportingSignals && activeFinding.supportingSignals.length > 0 && (
                    <div className="grid grid-cols-1 gap-1.5">
                      {activeFinding.supportingSignals.map((sig, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-950/50 border border-slate-800/80 text-[11px] flex justify-between items-center">
                          <span className="font-mono text-blue-400 font-semibold">{sig.label}</span>
                          <span className="text-slate-400 truncate max-w-[240px]">{sig.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: PROOF (Evidence) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-emerald-400 tracking-wider">
                    <Shield className="w-3.5 h-3.5" />
                    <span>PROOF — Evidence ({activeFinding.sourceEvidence?.length || 0})</span>
                  </div>
                  <Link
                    to="/evidence"
                    className="text-[11px] font-mono text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Evidence Vault</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/70">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-2.5">Record ID</th>
                        <th className="py-2 px-2">Type</th>
                        <th className="py-2 px-2">Description</th>
                        <th className="py-2 px-2.5 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {activeFinding.sourceEvidence && activeFinding.sourceEvidence.length > 0 ? (
                        activeFinding.sourceEvidence.map((ev) => (
                          <tr key={ev.recordId} className="hover:bg-slate-900/40">
                            <td className="py-2 px-2.5 font-bold text-blue-400">{ev.recordId}</td>
                            <td className="py-2 px-2 text-slate-300">{ev.recordType}</td>
                            <td className="py-2 px-2 text-slate-400 truncate max-w-[150px]" title={ev.title}>
                              {ev.title}
                            </td>
                            <td className="py-2 px-2.5 text-right text-slate-500">{ev.timestamp}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-3 px-2.5 text-center text-slate-500">
                            No direct evidence records mapped.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION: TRACEABILITY (Control / Rule / Analysis version) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>TRACEABILITY — Control / Rule / Analysis Version</span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 font-mono text-[11px]">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Control Ver</div>
                    <div className="text-white font-semibold mt-0.5">
                      {activeFinding.provenance?.controlVersion || 'CTRL-v3.2'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Rule Ver</div>
                    <div className="text-blue-400 font-semibold mt-0.5">
                      {activeFinding.provenance?.ruleVersion || 'RULE-2026.4'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Engine Ver</div>
                    <div className="text-emerald-400 font-semibold mt-0.5">
                      {activeFinding.provenance?.analyticsEngineVersion || 'AN-v1.8.2'}
                    </div>
                  </div>
                </div>
                {activeFinding.provenance?.sha256 && (
                  <div className="p-2 rounded bg-slate-950/50 border border-slate-800 text-[10px] font-mono text-slate-400 break-all">
                    <span className="text-slate-500 font-bold uppercase mr-1">SHA256:</span>
                    {activeFinding.provenance.sha256}
                  </div>
                )}
              </div>

              {/* SECTION: DECISION (Examiner action) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-blue-400 tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>DECISION — Examiner Action</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Lead Examiner NC-8802
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/30 space-y-2">
                  <div className="text-xs text-slate-300">
                    Execute binding supervisory determination for <strong className="text-white font-mono">{activeFinding.id}</strong>:
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                      onClick={() => setModalAction('VALIDATED')}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Validate / Confirm
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-center border-amber-500/50 text-amber-300 hover:bg-amber-500/10 text-xs"
                      onClick={() => setModalAction('QUALIFIED')}
                    >
                      Qualify Finding
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-center border-rose-500/50 text-rose-300 hover:bg-rose-500/10 text-xs"
                      onClick={() => setModalAction('REJECTED')}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Reject (False Pos)
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="justify-center bg-blue-600 hover:bg-blue-500 text-white text-xs"
                      onClick={() => setModalAction('REQUEST_EVD')}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Demand Evidence
                    </Button>
                  </div>
                </div>
              </div>

              {/* SECTION: REMEDIATION (Current remediation state) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-purple-400 tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>REMEDIATION — Current Remediation State</span>
                  </div>
                  <Link
                    to="/remediation"
                    className="text-[11px] font-mono text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Mandates</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  {activeRemediation ? (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-white">{activeRemediation.id}</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-semibold border border-purple-500/30">
                          {activeRemediation.status}
                        </span>
                      </div>
                      <div className="text-slate-300 text-[11px] leading-snug">
                        {activeRemediation.actionSummary}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Evidence Verified:</span>
                          <span className="text-emerald-400 font-bold">{activeRemediation.evidenceProgress}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Statutory Deadline:</span>
                          <span className="text-slate-300">{activeRemediation.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 flex items-center justify-between py-1">
                      <span>No active remediation mandate issued for this finding.</span>
                      <span className="text-slate-500 font-mono text-[11px]">STATE: PENDING ADJUDICATION</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-500 font-mono text-xs">
              Select a finding to inspect supervisory details.
            </div>
          )}
        </div>

      </div>

      {/* ADJUDICATION / EVIDENCE DEMAND MODAL */}
      <Modal
        isOpen={!!modalAction}
        onClose={() => setModalAction(null)}
        title={modalAction === 'REQUEST_EVD' ? `Dispatch Evidence Demand: ${activeFinding?.id}` : `Adjudicate Finding: ${modalAction}`}
        description="Formal supervisory determinations are cryptographically logged to the statutory audit ledger."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalAction(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExecuteDecision}>
              Commit Supervisory Action
            </Button>
          </>
        }
      >
        <div className="space-y-3 font-sans text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase">
              Statutory Regulatory Citation:
            </label>
            <input
              type="text"
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              className="w-full h-8 px-3 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase">
              Examiner Ledger Notes:
            </label>
            <textarea
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Record supervisory justification, evidence deficiency reasons, or directions to CSE..."
              rows={3}
              className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none font-mono"
            />
          </div>

          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Signatory:</span>
            <span className="text-white font-semibold">NC-8802 (Lead Examiner, NCIIPC)</span>
          </div>
        </div>
      </Modal>

      {/* TOAST CONFIRMATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#111622] border border-emerald-500/40 text-[#f1f5f9] px-4 py-2.5 rounded-lg shadow-xl text-xs font-mono flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

    </PageContainer>
  );
};
