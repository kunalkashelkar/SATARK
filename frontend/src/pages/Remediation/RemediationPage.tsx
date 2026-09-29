import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { RemediationMandate, VerificationRecord } from '@/data/mock/remediation';
import { Priority, RemediationStatus } from '@/types';
import {
  Search,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  ShieldCheck,
  FileText,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Gavel,
  History,
  FileCheck,
  Building,
  User,
  Check,
  X,
  Layers,
  Activity,
  ArrowRight,
  Copy,
  FolderGit2
} from 'lucide-react';
import { StatusBadge, PriorityBadge, Button, Modal, PageContainer } from '@/components/common';

interface RemediationPageProps {
  defaultStage?: 'open' | 'verification' | 'regression';
}

export const RemediationPage: React.FC<RemediationPageProps> = ({ defaultStage }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { remediationId: urlRemediationId } = useParams<{ remediationId?: string }>();

  const {
    cses,
    findings,
    remediations,
    verifications,
    submitRemediationArtifact,
    verifyGate,
    sealVerification,
    reopenVerification
  } = useSupervisory();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCse, setFilterCse] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Selected Remediation Record for Right-side Detail View
  const [selectedRemediationId, setSelectedRemediationId] = useState<string>(() => {
    return urlRemediationId || remediations[0]?.id || 'REM-0038';
  });

  // Modals & Action States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSubmitEvidenceOpen, setIsSubmitEvidenceOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [isAddMandateOpen, setIsAddMandateOpen] = useState(false);

  // Form Inputs
  const [formOwner, setFormOwner] = useState('');
  const [formActionSummary, setFormActionSummary] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formArtifactId, setFormArtifactId] = useState('ESC-221');
  const [formArtifactHash, setFormArtifactHash] = useState('e81a3c77b919a99477e6f8812dd014a9ecba19001258d4a982141a0e1b239401');
  const [formExaminerNotes, setFormExaminerNotes] = useState('');
  const [reopenReason, setReopenReason] = useState('Verification gates deficient. Missing statutory Tier-2 escalation records.');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync incoming URL param
  useEffect(() => {
    if (urlRemediationId) {
      setSelectedRemediationId(urlRemediationId);
    }
  }, [urlRemediationId]);

  // Actual Summary Metrics
  const summaryCounts = useMemo(() => {
    let openRemediation = 0;
    let pendingVerification = 0;
    let overdue = 0;
    let closed = 0;
    let reopened = 0;

    remediations.forEach(r => {
      if (r.status === 'CLOSED') {
        closed += 1;
      } else if (r.status === 'REOPENED') {
        reopened += 1;
      } else if (r.status === 'UNDER_VERIFICATION') {
        pendingVerification += 1;
      } else {
        openRemediation += 1;
      }

      if (r.daysRemaining <= 0 && r.status !== 'CLOSED') {
        overdue += 1;
      }
    });

    return {
      openRemediation,
      pendingVerification,
      overdue,
      closed,
      reopened
    };
  }, [remediations]);

  // Filtered Remediations
  const filteredRemediations = useMemo(() => {
    return remediations.filter(r => {
      if (filterCse !== 'ALL' && r.cseId !== filterCse) return false;
      if (filterPriority !== 'ALL' && r.priority !== filterPriority) return false;

      if (filterStatus !== 'ALL') {
        if (filterStatus === 'OVERDUE') {
          if (r.daysRemaining > 0 || r.status === 'CLOSED') return false;
        } else if (r.status !== filterStatus) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.id.toLowerCase().includes(q) ||
          r.findingId.toLowerCase().includes(q) ||
          r.mandateTitle.toLowerCase().includes(q) ||
          r.actionSummary.toLowerCase().includes(q) ||
          r.owner.toLowerCase().includes(q) ||
          r.cseName.toLowerCase().includes(q) ||
          r.cseId.toLowerCase().includes(q) ||
          r.controlRef.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [remediations, filterCse, filterPriority, filterStatus, searchQuery]);

  // Active Remediation Record for Detail View
  const activeRemediation = useMemo(() => {
    return remediations.find(r => r.id.toLowerCase() === selectedRemediationId.toLowerCase()) || filteredRemediations[0] || remediations[0];
  }, [remediations, selectedRemediationId, filteredRemediations]);

  // Linked Verification Record for Active Remediation
  const activeVerification = useMemo(() => {
    if (!activeRemediation) return undefined;
    return verifications.find(v => v.mandateId?.toLowerCase() === activeRemediation.id.toLowerCase() || v.findingId?.toLowerCase() === activeRemediation.findingId.toLowerCase());
  }, [verifications, activeRemediation]);

  // Linked Finding Record
  const activeFinding = useMemo(() => {
    if (!activeRemediation) return undefined;
    return findings.find(f => f.id.toLowerCase() === activeRemediation.findingId.toLowerCase());
  }, [findings, activeRemediation]);

  // Populate edit fields when activeRemediation changes
  useEffect(() => {
    if (activeRemediation) {
      setFormOwner(activeRemediation.owner);
      setFormActionSummary(activeRemediation.actionSummary);
      setFormDueDate(activeRemediation.dueDate);
    }
  }, [activeRemediation]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterCse('ALL');
    setFilterStatus('ALL');
    setFilterPriority('ALL');
  };

  // ACTION 1: ASSIGN OWNER
  const handleAssignOwner = () => {
    if (!activeRemediation || !formOwner.trim()) return;
    activeRemediation.owner = formOwner;
    showNotification(`Assigned owner updated to "${formOwner}" for ${activeRemediation.id}`);
    setIsAssignModalOpen(false);
  };

  // ACTION 2: UPDATE REMEDIATION
  const handleUpdateRemediation = () => {
    if (!activeRemediation) return;
    activeRemediation.actionSummary = formActionSummary;
    activeRemediation.dueDate = formDueDate;
    if (formOwner) activeRemediation.owner = formOwner;
    showNotification(`Remediation details successfully updated for ${activeRemediation.id}`);
    setIsUpdateModalOpen(false);
  };

  // ACTION 3: SUBMIT EVIDENCE
  const handleSubmitEvidence = async () => {
    if (!activeRemediation) return;
    await submitRemediationArtifact(activeRemediation.id, formArtifactId, formArtifactHash);
    showNotification(`Corrective telemetry artifact ${formArtifactId} submitted for ${activeRemediation.id}. State set to UNDER VERIFICATION.`);
    setIsSubmitEvidenceOpen(false);
  };

  // ACTION 4: VERIFY GATES & CLOSE
  const handleVerifyGateToggle = async (gateId: string, currentVal: boolean) => {
    if (!activeVerification) return;
    await verifyGate(activeVerification.id, gateId, !currentVal);
    showNotification(`Verification gate ${gateId} updated to ${!currentVal ? 'PASSED' : 'PENDING'}.`);
  };

  // ACTION 5: CLOSE / SEAL
  const handleCloseAndSeal = async () => {
    if (!activeVerification) return;
    await sealVerification(activeVerification.id);
    if (activeRemediation) {
      activeRemediation.status = 'CLOSED';
    }
    showNotification(`Remediation ${activeRemediation?.id} formally verified and SEALED as CLOSED.`);
    setIsCloseModalOpen(false);
  };

  // ACTION 6: REOPEN
  const handleReopen = async () => {
    if (!activeVerification) return;
    await reopenVerification(activeVerification.id, reopenReason);
    if (activeRemediation) {
      activeRemediation.status = 'REOPENED';
    }
    showNotification(`Remediation ${activeRemediation?.id} marked DEFICIENT and REOPENED.`);
    setIsReopenModalOpen(false);
  };

  return (
    <PageContainer>
      {/* 1. STANDARDIZED SAT-SA PAGE HEADER */}
      <div className="bg-[#111622] border border-[#212c3d] rounded-lg p-4 md:p-5 shadow-sm mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] md:text-[20px] font-semibold text-[#f1f5f9] tracking-tight">
                Remediation Lifecycle
              </h1>
              <span className="text-[#475569]">•</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#1f6feb]/20 text-[#60a5fa] border border-[#1f6feb]/30">
                {remediations.length} Active Mandates
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                Lifecycle Verification
              </span>
            </div>

            <p className="text-[12px] text-[#94a3b8]">
              Corrective action tracking and verification gates. Primary question: <strong className="text-[#cbd5e1]">&ldquo;What is being done about confirmed findings, and has remediation been verified?&rdquo;</strong>
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748b] font-mono pt-0.5">
              <span>Standard: <strong className="text-[#cbd5e1]">NCIIPC Mandatory Corrective Directives</strong></span>
              <span>•</span>
              <span>Scope: <strong className="text-[#60a5fa]">{cses.length} Critical Entities</strong></span>
              <span>•</span>
              <span>Audit Status: <strong className="text-emerald-400">Cryptographic Verification Active</strong></span>
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
            <Link to="/findings">
              <Button
                variant="secondary"
                size="sm"
                iconRight={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Findings Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. ACTUAL SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {/* Open remediation */}
        <div
          onClick={() => setFilterStatus(filterStatus === 'OPEN' ? 'ALL' : 'OPEN')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'OPEN'
              ? 'bg-[#1d4ed8]/20 border-[#3b82f6]'
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Open Remediation</span>
            <Clock className="w-3.5 h-3.5 text-[#60a5fa]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#60a5fa]">{summaryCounts.openRemediation}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Active remedial action</div>
        </div>

        {/* Pending verification */}
        <div
          onClick={() => setFilterStatus(filterStatus === 'UNDER_VERIFICATION' ? 'ALL' : 'UNDER_VERIFICATION')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'UNDER_VERIFICATION'
              ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Pending Verification</span>
            <Activity className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">{summaryCounts.pendingVerification}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Evidence submitted</div>
        </div>

        {/* Overdue */}
        <div
          onClick={() => setFilterStatus(filterStatus === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'OVERDUE'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Overdue</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">{summaryCounts.overdue}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">SLA deadline passed</div>
        </div>

        {/* Closed */}
        <div
          onClick={() => setFilterStatus(filterStatus === 'CLOSED' ? 'ALL' : 'CLOSED')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'CLOSED'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Closed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{summaryCounts.closed}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Verified & sealed</div>
        </div>

        {/* Reopened */}
        <div
          onClick={() => setFilterStatus(filterStatus === 'REOPENED' ? 'ALL' : 'REOPENED')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterStatus === 'REOPENED'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-[#111622] border-[#212c3d] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Reopened</span>
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">{summaryCounts.reopened}</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Deficient or regression</div>
        </div>
      </div>

      {/* 3. LIFECYCLE PROGRESSION BANNER */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 mb-6">
        <div className="text-xs font-mono uppercase font-bold text-slate-400 mb-2.5 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Statutory Supervisory Remediation Lifecycle</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 uppercase">Stage 1</span>
            <span className="text-blue-400 font-bold mt-0.5">Finding</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Adjudicated Lead Record</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 uppercase">Stage 2</span>
            <span className="text-amber-400 font-bold mt-0.5">Action Required</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Formal Mandate Assigned</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 uppercase">Stage 3</span>
            <span className="text-purple-400 font-bold mt-0.5">Remediation Evidence</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Corrective Telemetry Ingest</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 uppercase">Stage 4</span>
            <span className="text-emerald-400 font-bold mt-0.5">Verification</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Examiner Gate Attestation</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 uppercase">Stage 5</span>
            <span className="text-white font-bold mt-0.5">Closed / Reopened</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Cryptographic Seal or Deficient</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search finding ID, mandate, owner, CSE..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterCse}
            onChange={(e) => setFilterCse(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All CSEs</option>
            {cses.map(c => (
              <option key={c.cseId} value={c.cseId}>{c.cseId} - {c.cseName.split(' ')[0]}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="UNDER_VERIFICATION">Under Verification</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
            <option value="OVERDUE">Overdue</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-8 px-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* TWO-COLUMN PRODUCTION VIEW: TABLE (Left 7 cols) & DETAIL VIEW (Right 5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* 2. REMEDIATION TABLE (7 Cols)                                             */}
        {/* Columns: Finding | Required Action | Owner | Due Date | Evidence Submitted | Verification | Status */}
        {/* ========================================================================= */}
        <div className="xl:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-400">
            <div>
              Showing <span className="text-white font-bold">{filteredRemediations.length}</span> Remediation Mandates
            </div>
            <div className="text-[11px] text-slate-500">
              Click row to inspect details &amp; verify
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#212c3d] bg-[#111622] shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0c1017] text-[#94a3b8] font-mono text-[10px] uppercase border-b border-[#212c3d] select-none">
                <tr>
                  <th className="py-3 px-3">Finding</th>
                  <th className="py-3 px-3">Required Action</th>
                  <th className="py-3 px-2.5">Owner</th>
                  <th className="py-3 px-2.5">Due Date</th>
                  <th className="py-3 px-2 text-center">Evidence Submitted</th>
                  <th className="py-3 px-2.5">Verification</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212c3d]/70">
                {filteredRemediations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#94a3b8] font-mono text-xs">
                      No remediation records match the current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRemediations.map((r) => {
                    const isSelected = activeRemediation && r.id === activeRemediation.id;
                    const linkedVerif = verifications.find(v => v.mandateId?.toLowerCase() === r.id.toLowerCase() || v.findingId?.toLowerCase() === r.findingId.toLowerCase());
                    const verifiedGates = linkedVerif ? linkedVerif.gateChecklist.filter(g => g.verified).length : 0;
                    const totalGates = linkedVerif ? linkedVerif.gateChecklist.length : 0;

                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRemediationId(r.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#1f6feb]/15 text-[#f1f5f9] font-medium border-l-2 border-l-[#1f6feb]'
                            : 'hover:bg-[#18202f] text-[#cbd5e1]'
                        }`}
                      >
                        {/* 1. Finding */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-mono font-bold text-[#60a5fa]">
                            {r.findingId}
                          </div>
                          <div className="text-[10px] font-mono text-[#94a3b8]">
                            {r.id} • {r.cseId}
                          </div>
                        </td>

                        {/* 2. Required Action */}
                        <td className="py-3 px-3 max-w-[200px]">
                          <div className="font-semibold text-[#f1f5f9] truncate" title={r.mandateTitle}>
                            {r.mandateTitle}
                          </div>
                          <div className="text-[11px] text-[#94a3b8] line-clamp-1 mt-0.5" title={r.actionSummary}>
                            {r.actionSummary}
                          </div>
                        </td>

                        {/* 3. Owner */}
                        <td className="py-3 px-2.5 font-mono text-[11px] text-[#cbd5e1] whitespace-nowrap">
                          {r.owner}
                        </td>

                        {/* 4. Due Date */}
                        <td className="py-3 px-2.5 font-mono text-[11px] whitespace-nowrap">
                          <div className="text-[#cbd5e1]">{r.dueDate}</div>
                          <div className={`text-[10px] ${
                            r.daysRemaining <= 0
                              ? 'text-rose-400 font-bold'
                              : r.daysRemaining <= 7
                              ? 'text-amber-400'
                              : 'text-[#94a3b8]'
                          }`}>
                            {r.daysRemaining <= 0 ? 'OVERDUE' : `${r.daysRemaining}d left`}
                          </div>
                        </td>

                        {/* 5. Evidence Submitted */}
                        <td className="py-3 px-2 text-center font-mono text-xs whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-[#18202f] text-emerald-400 font-bold border border-[#212c3d]">
                            {r.evidenceProgress}
                          </span>
                        </td>

                        {/* 6. Verification */}
                        <td className="py-3 px-2.5 whitespace-nowrap font-mono text-[11px]">
                          {linkedVerif ? (
                            <div>
                              <span className={`font-bold ${
                                linkedVerif.verificationVerdict === 'VERIFIED_SEALED'
                                  ? 'text-emerald-400'
                                  : linkedVerif.verificationVerdict === 'DEFICIENT_REOPENED'
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }`}>
                                {linkedVerif.verificationVerdict.replace(/_/g, ' ')}
                              </span>
                              <div className="text-[10px] text-[#94a3b8]">
                                Gates: {verifiedGates}/{totalGates}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#94a3b8] text-[10px]">AWAITING INGEST</span>
                          )}
                        </td>

                        {/* 7. Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DETAIL VIEW (5 Cols)                                                   */}
        {/* Finding | Required Action | Assigned Owner | Evidence | Verification Result | Examiner Notes | History */}
        {/* ========================================================================= */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {activeRemediation ? (
            <div className="rounded-xl border border-[#212c3d] bg-[#111622] p-5 shadow-sm space-y-4 text-xs font-sans">
              
              {/* DETAIL HEADER */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#212c3d]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-[#60a5fa]">{activeRemediation.id}</span>
                    <span className="px-2 py-0.5 rounded bg-[#18202f] font-mono text-[10px] text-[#cbd5e1] border border-[#212c3d]">
                      Finding: {activeRemediation.findingId}
                    </span>
                    <PriorityBadge priority={activeRemediation.priority} />
                  </div>
                  <h2 className="text-sm font-bold text-white mt-1 leading-snug">
                    {activeRemediation.mandateTitle}
                  </h2>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    CSE: {activeRemediation.cseName} ({activeRemediation.cseId}) • {activeRemediation.controlRef}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <StatusBadge status={activeRemediation.status} />
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Due: {activeRemediation.dueDate}
                  </div>
                </div>
              </div>

              {/* 1. FINDING & REQUIRED ACTION */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-blue-400 tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Finding &amp; Required Action</span>
                  </div>
                  <Link
                    to={`/findings?findingId=${activeRemediation.findingId}`}
                    className="text-[10px] font-mono text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Finding</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="text-white font-medium">
                    {activeFinding ? activeFinding.title : activeRemediation.mandateTitle}
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {activeRemediation.actionSummary}
                  </p>
                </div>
              </div>

              {/* 2. ASSIGNED OWNER & SLA */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Assigned Owner &amp; Commitment</span>
                  </div>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="text-[10px] font-mono text-blue-400 hover:underline"
                  >
                    Reassign Owner
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Appointed Owner:</span>
                    <span className="text-white font-semibold">{activeRemediation.owner}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">SLA Window:</span>
                    <span className={activeRemediation.daysRemaining <= 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {activeRemediation.dueDate} ({activeRemediation.daysRemaining}d remaining)
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. EVIDENCE */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-emerald-400 tracking-wider">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Remediation Evidence ({activeRemediation.evidenceProgress})</span>
                  </div>
                  <button
                    onClick={() => setIsSubmitEvidenceOpen(true)}
                    className="text-[10px] font-mono text-emerald-400 hover:underline"
                  >
                    + Submit Evidence
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                  {activeRemediation.artifacts && activeRemediation.artifacts.length > 0 ? (
                    activeRemediation.artifacts.map((art) => (
                      <div key={art.id} className="p-2 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                        <div>
                          <span className="text-blue-400 font-bold mr-2">{art.id}</span>
                          <span className="text-slate-200">{art.name}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          art.status === 'PRESENT_VERIFIED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {art.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 font-mono text-[11px] text-center py-2">
                      No artifacts submitted yet.
                    </div>
                  )}
                </div>
              </div>

              {/* 4. VERIFICATION RESULT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-purple-400 tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verification Result &amp; Gates</span>
                  </div>
                  {activeVerification && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {activeVerification.statutoryStandard}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2.5">
                  {activeVerification ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">Verdict:</span>
                        <StatusBadge status={activeVerification.verificationVerdict} />
                      </div>

                      {/* Interactive Gate Checklist */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-mono uppercase text-slate-500">
                          Mandatory Verification Gates (Examiner Checklist):
                        </div>
                        {activeVerification.gateChecklist.map((gate) => (
                          <div
                            key={gate.id}
                            onClick={() => handleVerifyGateToggle(gate.id, gate.verified)}
                            className="p-2 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-850 text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={gate.verified}
                                onChange={() => {}}
                                className="cursor-pointer rounded border-slate-700 text-blue-500"
                              />
                              <span className={gate.verified ? 'text-slate-200' : 'text-slate-400'}>
                                {gate.label}
                              </span>
                            </div>
                            <span className={`font-mono text-[10px] font-bold ${
                              gate.verified ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {gate.verified ? 'PASSED' : 'PENDING'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500 font-mono text-[11px] text-center py-2">
                      Verification dossier not yet generated. Awaiting corrective evidence.
                    </div>
                  )}
                </div>
              </div>

              {/* 5. EXAMINER NOTES */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
                  <Gavel className="w-3.5 h-3.5 text-blue-400" />
                  <span>Examiner Rationale &amp; Notes</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 font-sans leading-relaxed">
                  {activeVerification?.supervisoryRationale || 'Examiner review pending. Statutory verification requires cryptographic evidence verification prior to closure.'}
                </div>
              </div>

              {/* 6. HISTORY / TIMELINE */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
                  <History className="w-3.5 h-3.5 text-blue-400" />
                  <span>History &amp; Milestones</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                  {activeRemediation.milestones && activeRemediation.milestones.length > 0 ? (
                    activeRemediation.milestones.map((m, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[11px] font-mono">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                        <div>
                          <div className="text-slate-200 font-medium">{m.title} ({m.date})</div>
                          <div className="text-slate-500 text-[10px]">{m.actor} • {m.detail}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 font-mono text-[11px] text-center py-1">
                      No milestones recorded.
                    </div>
                  )}
                </div>
              </div>

              {/* 5. PRESERVED ACTIONS STRIP: Assign | Update | Submit Evidence | Verify | Close | Reopen */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="text-xs font-mono uppercase font-bold text-blue-400 tracking-wider">
                  Supervisory Actions
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Action 1: Assign */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center border-slate-700 text-slate-300 text-xs font-mono"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    Assign Owner
                  </Button>

                  {/* Action 2: Update */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center border-slate-700 text-slate-300 text-xs font-mono"
                    onClick={() => setIsUpdateModalOpen(true)}
                  >
                    Update Details
                  </Button>

                  {/* Action 3: Submit Evidence */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="justify-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono"
                    onClick={() => setIsSubmitEvidenceOpen(true)}
                  >
                    Submit Evidence
                  </Button>

                  {/* Action 4: Verify Gates */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-xs font-mono"
                    onClick={() => {
                      if (activeVerification) {
                        const allPassed = activeVerification.gateChecklist.every(g => g.verified);
                        activeVerification.gateChecklist.forEach(g => {
                          verifyGate(activeVerification.id, g.id, !allPassed);
                        });
                        showNotification(`All verification gates marked ${!allPassed ? 'PASSED' : 'PENDING'}.`);
                      }
                    }}
                  >
                    Verify All Gates
                  </Button>

                  {/* Action 5: Close / Seal */}
                  <Button
                    variant="primary"
                    size="sm"
                    className="justify-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono"
                    onClick={() => setIsCloseModalOpen(true)}
                  >
                    Close &amp; Seal
                  </Button>

                  {/* Action 6: Reopen */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center border-rose-500/50 text-rose-300 hover:bg-rose-500/10 text-xs font-mono"
                    onClick={() => setIsReopenModalOpen(true)}
                  >
                    Reopen Mandate
                  </Button>
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-500 font-mono text-xs">
              Select a remediation mandate to inspect.
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ASSIGN OWNER                                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Remediation Owner: ${activeRemediation?.id}`}
        description="Designate the responsible CSE operational officer or liaison team."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAssignOwner}>
              Save Assignment
            </Button>
          </>
        }
      >
        <div className="space-y-3 font-sans text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase">
              Assigned Owner / Entity Liaison:
            </label>
            <input
              type="text"
              value={formOwner}
              onChange={(e) => setFormOwner(e.target.value)}
              className="w-full h-8 px-3 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              placeholder="e.g. CSE-014 Forensics Team Lead"
            />
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: UPDATE DETAILS                                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update Remediation Details: ${activeRemediation?.id}`}
        description="Update remediation action summary, owner, or SLA due date."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateRemediation}>
              Commit Updates
            </Button>
          </>
        }
      >
        <div className="space-y-3 font-sans text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase">
              Action Summary:
            </label>
            <textarea
              rows={3}
              value={formActionSummary}
              onChange={(e) => setFormActionSummary(e.target.value)}
              className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase">
              SLA Due Date:
            </label>
            <input
              type="text"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              className="w-full h-8 px-3 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              placeholder="e.g. 14 Oct 2026"
            />
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: SUBMIT EVIDENCE                                                  */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isSubmitEvidenceOpen}
        onClose={() => setIsSubmitEvidenceOpen(false)}
        title={`Submit Remediation Evidence: ${activeRemediation?.id}`}
        description="Ingest corrective telemetry records into the supervisory verification gateway."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsSubmitEvidenceOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmitEvidence}>
              Ingest Artifact &amp; Advance Stage
            </Button>
          </>
        }
      >
        <div className="space-y-3 font-sans text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase">
              Artifact ID:
            </label>
            <input
              type="text"
              value={formArtifactId}
              onChange={(e) => setFormArtifactId(e.target.value)}
              className="w-full h-8 px-3 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase">
              SHA-256 Digest:
            </label>
            <input
              type="text"
              value={formArtifactHash}
              onChange={(e) => setFormArtifactHash(e.target.value)}
              className="w-full h-8 px-3 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: CLOSE & SEAL                                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title={`Seal Verification & Close Remediation: ${activeRemediation?.id}`}
        description="Human-in-the-loop statutory closure seals the mandate into the permanent audit record."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsCloseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCloseAndSeal} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Confirm Closure &amp; Seal
            </Button>
          </>
        }
      >
        <div className="space-y-3 font-sans text-xs">
          <div className="p-3 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
            Closure confirmation requires all statutory verification gates to be confirmed. Mandate will transition to CLOSED.
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Attesting Examiner:</span>
            <span className="text-white font-semibold">NC-8802 (Lead Examiner, NCIIPC)</span>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: REOPEN MANDATE                                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        title={`Reopen Mandate: ${activeRemediation?.id}`}
        description="Mark evidence deficient or flag regression, reverting mandate to REOPENED."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsReopenModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleReopen} className="bg-rose-600 hover:bg-rose-500 text-white">
              Confirm Reopen
            </Button>
          </>
        }
      >
        <div className="space-y-3 font-sans text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase">
              Examiner Deficient Rationale:
            </label>
            <textarea
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500 resize-none font-mono"
            />
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
