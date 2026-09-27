import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { RemediationMandate, VerificationRecord, RemediationRegression } from '@/data/mock/remediation';
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
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Eye,
  Gavel,
  History,
  FileCheck,
  Fingerprint,
  Building,
  RotateCcw,
  SlidersHorizontal,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  KpiCard,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatusBadge,
  PriorityBadge,
  Tabs,
  Modal,
  Button,
  Drawer,
  Timeline,
  ExpectedObservedCard
} from '@/components/common';

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
    regressions,
    submitRemediationArtifact,
    verifyGate,
    sealVerification,
    reopenVerification
  } = useSupervisory();

  // Active Lifecycle Stage (Tab) synced with URL query ?stage=
  const stageFromUrl = searchParams.get('stage') as 'open' | 'verification' | 'regression' | null;
  const initialStage = defaultStage || stageFromUrl || 'open';
  const [activeTab, setActiveTab] = useState<string>(initialStage);

  useEffect(() => {
    if (stageFromUrl && ['open', 'verification', 'regression'].includes(stageFromUrl)) {
      setActiveTab(stageFromUrl);
    } else if (defaultStage) {
      setActiveTab(defaultStage);
    }
  }, [stageFromUrl, defaultStage]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('stage', tabId);
      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // FILTER STATES (Per Tab)
  // ---------------------------------------------------------------------------
  // Tab 1 Filters
  const [openSearch, setOpenSearch] = useState('');
  const [openCseFilter, setOpenCseFilter] = useState('ALL');
  const [openPriorityFilter, setOpenPriorityFilter] = useState('ALL');
  const [openStatusFilter, setOpenStatusFilter] = useState('ALL');

  // Tab 2 Filters
  const [verifSearch, setVerifSearch] = useState('');
  const [verifCseFilter, setVerifCseFilter] = useState('ALL');
  const [verifVerdictFilter, setVerifVerdictFilter] = useState('ALL');

  // Tab 3 Filters
  const [regSearch, setRegSearch] = useState('');
  const [regCseFilter, setRegCseFilter] = useState('ALL');
  const [regStatusFilter, setRegStatusFilter] = useState('ALL');

  // ---------------------------------------------------------------------------
  // DETAIL DRAWERS
  // ---------------------------------------------------------------------------
  const [selectedRemediation, setSelectedRemediation] = useState<RemediationMandate | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRecord | null>(null);
  const [selectedRegression, setSelectedRegression] = useState<RemediationRegression | null>(null);

  // If URL has /remediation/:remediationId, open drawer automatically
  useEffect(() => {
    if (urlRemediationId) {
      const found = remediations.find(r => r.id.toLowerCase() === urlRemediationId.toLowerCase());
      if (found) {
        setSelectedRemediation(found);
      }
    }
  }, [urlRemediationId, remediations]);

  // Keep selected records updated when context updates
  useEffect(() => {
    if (selectedRemediation) {
      const fresh = remediations.find(r => r.id === selectedRemediation.id);
      if (fresh) setSelectedRemediation(fresh);
    }
  }, [remediations]);

  useEffect(() => {
    if (selectedVerification) {
      const fresh = verifications.find(v => v.id === selectedVerification.id);
      if (fresh) setSelectedVerification(fresh);
    }
  }, [verifications]);

  useEffect(() => {
    if (selectedRegression) {
      const fresh = regressions.find(r => r.id === selectedRegression.id);
      if (fresh) setSelectedRegression(fresh);
    }
  }, [regressions]);

  // ---------------------------------------------------------------------------
  // MODALS
  // ---------------------------------------------------------------------------
  const [uploadModalMandate, setUploadModalMandate] = useState<RemediationMandate | null>(null);
  const [mockArtifactHash, setMockArtifactHash] = useState('c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2');
  const [isAddRemediationOpen, setIsAddRemediationOpen] = useState(false);
  const [newMandateForm, setNewMandateForm] = useState({
    findingId: 'FND-0142',
    cseId: 'CSE-014',
    title: '',
    actionSummary: '',
    owner: 'CSE Evidence Team',
    priority: 'HIGH' as Priority,
    dueDate: '2026-10-15'
  });

  // Reopen prompt state for Examiner
  const [reopenPromptVerif, setReopenPromptVerif] = useState<VerificationRecord | null>(null);
  const [reopenReasonText, setReopenReasonText] = useState('Deficient proof submitted. Telemetry packet incomplete and failed mandatory process check.');

  // Copy hash indicator
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // ---------------------------------------------------------------------------
  // FILTERED DATASETS
  // ---------------------------------------------------------------------------
  // Tab 1: Open Remediations
  const filteredRemediations = useMemo(() => {
    return remediations.filter(m => {
      if (openSearch) {
        const q = openSearch.toLowerCase();
        const match =
          m.id.toLowerCase().includes(q) ||
          m.findingId.toLowerCase().includes(q) ||
          m.cseName.toLowerCase().includes(q) ||
          m.cseId.toLowerCase().includes(q) ||
          m.controlRef.toLowerCase().includes(q) ||
          m.mandateTitle.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (openCseFilter !== 'ALL' && m.cseId !== openCseFilter) return false;
      if (openPriorityFilter !== 'ALL' && m.priority !== openPriorityFilter) return false;
      if (openStatusFilter !== 'ALL' && m.status !== openStatusFilter) return false;
      return true;
    });
  }, [remediations, openSearch, openCseFilter, openPriorityFilter, openStatusFilter]);

  // Tab 2: Verification Records
  const filteredVerifications = useMemo(() => {
    return verifications.filter(v => {
      if (verifSearch) {
        const q = verifSearch.toLowerCase();
        const match =
          v.id.toLowerCase().includes(q) ||
          v.mandateId.toLowerCase().includes(q) ||
          v.findingId.toLowerCase().includes(q) ||
          v.cseName.toLowerCase().includes(q) ||
          v.cseId.toLowerCase().includes(q) ||
          v.controlId.toLowerCase().includes(q) ||
          v.remedialSummary.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (verifCseFilter !== 'ALL' && v.cseId !== verifCseFilter) return false;
      if (verifVerdictFilter !== 'ALL' && v.verificationVerdict !== verifVerdictFilter) return false;
      return true;
    });
  }, [verifications, verifSearch, verifCseFilter, verifVerdictFilter]);

  // Tab 3: Regressions
  const filteredRegressions = useMemo(() => {
    return regressions.filter(r => {
      if (regSearch) {
        const q = regSearch.toLowerCase();
        const match =
          r.id.toLowerCase().includes(q) ||
          r.findingId.toLowerCase().includes(q) ||
          r.remediationId.toLowerCase().includes(q) ||
          r.cseName.toLowerCase().includes(q) ||
          r.cseId.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q) ||
          r.controlId.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (regCseFilter !== 'ALL' && r.cseId !== regCseFilter) return false;
      if (regStatusFilter !== 'ALL' && r.status !== regStatusFilter) return false;
      return true;
    });
  }, [regressions, regSearch, regCseFilter, regStatusFilter]);

  // ---------------------------------------------------------------------------
  // KPI DERIVATIONS (Max 4 cards per tab, derived dynamically)
  // ---------------------------------------------------------------------------
  // Tab 1 KPIs
  const tab1Kpis = useMemo(() => {
    const totalOpen = remediations.filter(r => r.status !== 'CLOSED').length;
    const highCrit = remediations.filter(r => (r.priority === 'CRITICAL' || r.priority === 'HIGH') && r.status !== 'CLOSED').length;
    const dueSoon = remediations.filter(r => r.daysRemaining > 0 && r.daysRemaining <= 14 && r.status !== 'CLOSED').length;
    const overdueOrReopened = remediations.filter(r => (r.daysRemaining === 0 || r.status === 'REOPENED') && r.status !== 'CLOSED').length;

    return { totalOpen, highCrit, dueSoon, overdueOrReopened };
  }, [remediations]);

  // Tab 2 KPIs
  const tab2Kpis = useMemo(() => {
    const awaiting = verifications.length;
    const gatesPending = verifications.filter(v => v.gateChecklist.some(g => g.required && !g.verified)).length;
    const verifiedSealed = verifications.filter(v => v.verificationVerdict === 'VERIFIED_SEALED').length;
    const failedReopened = verifications.filter(v => v.verificationVerdict === 'DEFICIENT_REOPENED').length;

    return { awaiting, gatesPending, verifiedSealed, failedReopened };
  }, [verifications]);

  // Tab 3 KPIs
  const tab3Kpis = useMemo(() => {
    const totalReg = regressions.length;
    const activeLoops = regressions.filter(r => r.status === 'ACTIVE_REGRESSION').length;
    const failedVerifs = regressions.filter(r => r.reason.toLowerCase().includes('verification failed')).length;
    const recurrentPatterns = regressions.filter(r => r.signalType === 'HISTORICAL_RECURRENCE').length;

    return { totalReg, activeLoops, failedVerifs, recurrentPatterns };
  }, [regressions]);

  // Handle Simulate Ingestion
  const handleUploadSubmit = () => {
    if (!uploadModalMandate) return;
    submitRemediationArtifact(uploadModalMandate.id, 'ESC-221', mockArtifactHash);
    setUploadModalMandate(null);
  };

  // Handle Examiner Seal
  const handleSealVerification = (vId: string) => {
    sealVerification(vId);
  };

  // Handle Examiner Reopen
  const handleReopenSubmit = () => {
    if (!reopenPromptVerif) return;
    reopenVerification(reopenPromptVerif.id, reopenReasonText);
    setReopenPromptVerif(null);
  };

  // Lifecycle Tabs (Section 7)
  const tabs = [
    {
      id: 'open',
      label: '1. Open Remediation',
      count: remediations.filter(r => r.status !== 'CLOSED').length,
      icon: <span className="material-symbols-outlined text-[15px]">published_with_changes</span>
    },
    {
      id: 'verification',
      label: '2. Verification Gates',
      count: verifications.length,
      icon: <span className="material-symbols-outlined text-[15px]">verified</span>
    },
    {
      id: 'regression',
      label: '3. Reopened / Regression',
      count: regressions.length,
      icon: <span className="material-symbols-outlined text-[15px]">history</span>
    }
  ];

  return (
    <PageContainer>
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER (Section 6)                                                */}
      {/* ========================================================================= */}
      <PageHeader
        title="Remediation"
        description="Track corrective actions, verification, and reopened findings."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
              Supervisory Life Cycle
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddRemediationOpen(true)}
            >
              Add Remediation
            </Button>
          </div>
        }
      />

      {/* ========================================================================= */}
      {/* 2. LIFECYCLE TABS (Section 7: STAGE 1 → STAGE 2 → STAGE 3)                */}
      {/* ========================================================================= */}
      <div className="border-b border-[#212c3d] pb-1">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OPEN REMEDIATION (Section 8)                                       */}
      {/* ========================================================================= */}
      {activeTab === 'open' && (
        <div className="space-y-4 min-w-0">
          {/* Summary Cards (Max 4 KPI Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              title="Open Remediations"
              value={tab1Kpis.totalOpen}
              subtitle="Active statutory mandates"
              semantic="blue"
              icon={Clock}
            />
            <KpiCard
              title="High Priority"
              value={tab1Kpis.highCrit}
              subtitle="Critical / High severity"
              semantic="red"
              icon={AlertTriangle}
            />
            <KpiCard
              title="Due Soon"
              value={tab1Kpis.dueSoon}
              subtitle="SLA window < 14 days"
              semantic="amber"
              icon={Clock}
            />
            <KpiCard
              title="Overdue / Reopened"
              value={tab1Kpis.overdueOrReopened}
              subtitle="Failed gates or SLA elapsed"
              semantic="purple"
              icon={RotateCcw}
            />
          </div>

          {/* Filter Bar */}
          <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] flex flex-wrap items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
              <Input
                icon={<Search className="w-4 h-4 text-[#64748b]" />}
                value={openSearch}
                onChange={(e) => setOpenSearch(e.target.value)}
                placeholder="Search finding ID, mandate, entity, control..."
                sizeVariant="sm"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Select
                sizeVariant="sm"
                value={openCseFilter}
                onChange={(e) => setOpenCseFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All CSEs' },
                  ...cses.map(c => ({ value: c.cseId, label: `${c.cseId} - ${c.cseName}` }))
                ]}
              />

              <Select
                sizeVariant="sm"
                value={openPriorityFilter}
                onChange={(e) => setOpenPriorityFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Priorities' },
                  { value: 'CRITICAL', label: 'Critical' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'LOW', label: 'Low' }
                ]}
              />

              <Select
                sizeVariant="sm"
                value={openStatusFilter}
                onChange={(e) => setOpenStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'OPEN', label: 'Open' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'SUBMITTED', label: 'Submitted' },
                  { value: 'UNDER_VERIFICATION', label: 'Under Verification' },
                  { value: 'CLOSED', label: 'Closed' },
                  { value: 'REOPENED', label: 'Reopened' }
                ]}
              />

              {(openSearch || openCseFilter !== 'ALL' || openPriorityFilter !== 'ALL' || openStatusFilter !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOpenSearch('');
                    setOpenCseFilter('ALL');
                    setOpenPriorityFilter('ALL');
                    setOpenStatusFilter('ALL');
                  }}
                  className="text-[#94a3b8] hover:text-[#e2e8f0]"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Main Remediation Table */}
          <div className="rounded-lg bg-[#111622] border border-[#212c3d] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#212c3d] bg-[#161e29]/70 text-[#94a3b8] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Finding</th>
                    <th className="py-2.5 px-3 font-semibold">CSE</th>
                    <th className="py-2.5 px-3 font-semibold">Issue</th>
                    <th className="py-2.5 px-3 font-semibold">Priority</th>
                    <th className="py-2.5 px-3 font-semibold">Owner</th>
                    <th className="py-2.5 px-3 font-semibold">Due Date</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212c3d]/60 font-sans">
                  {filteredRemediations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#64748b]">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-[#475569] opacity-60" />
                        <p className="text-[13px] font-medium text-[#94a3b8]">No remediation records match the current filters.</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-[#38bdf8]"
                          onClick={() => {
                            setOpenSearch('');
                            setOpenCseFilter('ALL');
                            setOpenPriorityFilter('ALL');
                            setOpenStatusFilter('ALL');
                          }}
                        >
                          Clear Filters
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    filteredRemediations.map((m) => (
                      <tr
                        key={m.id}
                        onClick={() => setSelectedRemediation(m)}
                        className="hover:bg-[#161e29]/50 transition-colors cursor-pointer group"
                      >
                        {/* Finding */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] font-bold text-[#38bdf8] group-hover:underline">
                              {m.findingId}
                            </span>
                            <span className="font-mono text-[10px] text-[#64748b]">
                              {m.id}
                            </span>
                          </div>
                        </td>

                        {/* CSE */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col max-w-[160px]">
                            <span className="font-medium text-[#e2e8f0] truncate">{m.cseName}</span>
                            <span className="font-mono text-[10px] text-[#64748b]">{m.cseId} • {m.controlRef}</span>
                          </div>
                        </td>

                        {/* Issue */}
                        <td className="py-3 px-3">
                          <div className="max-w-md">
                            <span className="font-medium text-[#e2e8f0] block truncate">{m.mandateTitle}</span>
                            <span className="text-[11px] text-[#94a3b8] line-clamp-1 mt-0.5">{m.actionSummary}</span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <PriorityBadge priority={m.priority} />
                        </td>

                        {/* Owner */}
                        <td className="py-3 px-3 whitespace-nowrap text-[#94a3b8] text-[11px] font-mono">
                          {m.owner}
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-[#e2e8f0] font-mono text-[11px]">{m.dueDate}</span>
                            <span className={`text-[10px] font-mono ${
                              m.daysRemaining <= 0
                                ? 'text-rose-400 font-bold'
                                : m.daysRemaining <= 7
                                ? 'text-amber-400'
                                : 'text-[#64748b]'
                            }`}>
                              {m.daysRemaining <= 0 ? 'SLA Elapsed' : `${m.daysRemaining} days left`}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <StatusBadge status={m.status} />
                        </td>

                        {/* Action */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="w-3.5 h-3.5" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRemediation(m);
                              }}
                            >
                              View
                            </Button>
                            {m.status !== 'CLOSED' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={<Send className="w-3 h-3 text-[#38bdf8]" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadModalMandate(m);
                                }}
                                title="Simulate Evidence Ingestion"
                              >
                                Ingest
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VERIFICATION GATES (Section 11)                                    */}
      {/* ========================================================================= */}
      {activeTab === 'verification' && (
        <div className="space-y-4 min-w-0">
          {/* Summary Cards (Max 4 KPI Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              title="Awaiting Verification"
              value={tab2Kpis.awaiting}
              subtitle="Verification dossiers"
              semantic="blue"
              icon={ShieldCheck}
            />
            <KpiCard
              title="Gates Pending"
              value={tab2Kpis.gatesPending}
              subtitle="Unverified gate conditions"
              semantic="amber"
              icon={Clock}
            />
            <KpiCard
              title="Statutorily Sealed"
              value={tab2Kpis.verifiedSealed}
              subtitle="FIPS-140-2 Level 3 Hash"
              semantic="green"
              icon={Lock}
            />
            <KpiCard
              title="Failed / Reopened"
              value={tab2Kpis.failedReopened}
              subtitle="Deficient proof flagged"
              semantic="red"
              icon={XCircle}
            />
          </div>

          {/* Filter Bar */}
          <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] flex flex-wrap items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
              <Input
                icon={<Search className="w-4 h-4 text-[#64748b]" />}
                value={verifSearch}
                onChange={(e) => setVerifSearch(e.target.value)}
                placeholder="Search verification ID, mandate, finding, CSE..."
                sizeVariant="sm"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Select
                sizeVariant="sm"
                value={verifCseFilter}
                onChange={(e) => setVerifCseFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All CSEs' },
                  ...cses.map(c => ({ value: c.cseId, label: `${c.cseId} - ${c.cseName}` }))
                ]}
              />

              <Select
                sizeVariant="sm"
                value={verifVerdictFilter}
                onChange={(e) => setVerifVerdictFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Verdicts' },
                  { value: 'UNDER_SUPERVISORY_REVIEW', label: 'Under Review' },
                  { value: 'EVIDENCE_LOCKED', label: 'Evidence Locked' },
                  { value: 'VERIFIED_SEALED', label: 'Verified & Sealed' },
                  { value: 'DEFICIENT_REOPENED', label: 'Deficient (Reopened)' }
                ]}
              />

              {(verifSearch || verifCseFilter !== 'ALL' || verifVerdictFilter !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVerifSearch('');
                    setVerifCseFilter('ALL');
                    setVerifVerdictFilter('ALL');
                  }}
                  className="text-[#94a3b8] hover:text-[#e2e8f0]"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Verification Table */}
          <div className="rounded-lg bg-[#111622] border border-[#212c3d] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#212c3d] bg-[#161e29]/70 text-[#94a3b8] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Finding</th>
                    <th className="py-2.5 px-3 font-semibold">CSE</th>
                    <th className="py-2.5 px-3 font-semibold">Remediation</th>
                    <th className="py-2.5 px-3 font-semibold">Verification Standard</th>
                    <th className="py-2.5 px-3 font-semibold">Gates</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212c3d]/60 font-sans">
                  {filteredVerifications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#64748b]">
                        <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-[#475569] opacity-60" />
                        <p className="text-[13px] font-medium text-[#94a3b8]">No verification dossiers match the current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredVerifications.map((v) => {
                      const verifiedCount = v.gateChecklist.filter(g => g.verified).length;
                      const totalCount = v.gateChecklist.length;
                      return (
                        <tr
                          key={v.id}
                          onClick={() => setSelectedVerification(v)}
                          className="hover:bg-[#161e29]/50 transition-colors cursor-pointer group"
                        >
                          {/* Finding */}
                          <td className="py-3 px-3">
                            <span className="font-mono text-[11px] font-bold text-[#38bdf8] group-hover:underline block">
                              {v.findingId}
                            </span>
                            <span className="font-mono text-[10px] text-[#64748b]">{v.id}</span>
                          </td>

                          {/* CSE */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col max-w-[160px]">
                              <span className="font-medium text-[#e2e8f0] truncate">{v.cseName}</span>
                              <span className="font-mono text-[10px] text-[#64748b]">{v.cseId} • {v.controlId}</span>
                            </div>
                          </td>

                          {/* Remediation */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-mono text-[11px] font-bold text-[#7bdb80] bg-[#7bdb80]/10 px-2 py-0.5 rounded border border-[#7bdb80]/20">
                              {v.mandateId}
                            </span>
                          </td>

                          {/* Verification */}
                          <td className="py-3 px-3">
                            <div className="max-w-md">
                              <span className="font-medium text-[#e2e8f0] block truncate">{v.statutoryStandard}</span>
                              <span className="text-[11px] text-[#94a3b8] line-clamp-1 mt-0.5">{v.remedialSummary}</span>
                            </div>
                          </td>

                          {/* Gates */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-[11px] font-bold ${
                                verifiedCount === totalCount ? 'text-[#7bdb80]' : 'text-amber-400'
                              }`}>
                                {verifiedCount}/{totalCount}
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-[#1e293b] overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    verifiedCount === totalCount ? 'bg-[#7bdb80]' : 'bg-amber-400'
                                  }`}
                                  style={{ width: `${(verifiedCount / totalCount) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <StatusBadge status={v.verificationVerdict} />
                          </td>

                          {/* Action */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<Eye className="w-3.5 h-3.5" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVerification(v);
                              }}
                            >
                              Review
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REOPENED / REGRESSION (Section 15)                                  */}
      {/* ========================================================================= */}
      {activeTab === 'regression' && (
        <div className="space-y-4 min-w-0">
          {/* Summary Cards (Max 4 KPI Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              title="Total Regressions"
              value={tab3Kpis.totalReg}
              subtitle="Multi-cycle recurrence"
              semantic="red"
              icon={RotateCcw}
            />
            <KpiCard
              title="Active Reopened Loops"
              value={tab3Kpis.activeLoops}
              subtitle="Pending re-remediation"
              semantic="amber"
              icon={Clock}
            />
            <KpiCard
              title="Verification Failures"
              value={tab3Kpis.failedVerifs}
              subtitle="Deficient proof rejections"
              semantic="purple"
              icon={XCircle}
            />
            <KpiCard
              title="Recurrent Pattern Signals"
              value={tab3Kpis.recurrentPatterns}
              subtitle="Cross-cycle persistence"
              semantic="blue"
              icon={History}
            />
          </div>

          {/* Filter Bar */}
          <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] flex flex-wrap items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
              <Input
                icon={<Search className="w-4 h-4 text-[#64748b]" />}
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                placeholder="Search regression ID, finding ID, entity, reason..."
                sizeVariant="sm"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Select
                sizeVariant="sm"
                value={regCseFilter}
                onChange={(e) => setRegCseFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All CSEs' },
                  ...cses.map(c => ({ value: c.cseId, label: `${c.cseId} - ${c.cseName}` }))
                ]}
              />

              <Select
                sizeVariant="sm"
                value={regStatusFilter}
                onChange={(e) => setRegStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'ACTIVE_REGRESSION', label: 'Active Regression' },
                  { value: 'UNDER_REMEDIAL_ACTION', label: 'Under Remedial Action' },
                  { value: 'RESOLVED', label: 'Resolved' }
                ]}
              />

              {(regSearch || regCseFilter !== 'ALL' || regStatusFilter !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRegSearch('');
                    setRegCseFilter('ALL');
                    setRegStatusFilter('ALL');
                  }}
                  className="text-[#94a3b8] hover:text-[#e2e8f0]"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Main Regression Table */}
          <div className="rounded-lg bg-[#111622] border border-[#212c3d] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#212c3d] bg-[#161e29]/70 text-[#94a3b8] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Finding</th>
                    <th className="py-2.5 px-3 font-semibold">CSE</th>
                    <th className="py-2.5 px-3 font-semibold">Previous Remediation</th>
                    <th className="py-2.5 px-3 font-semibold">Reason Reopened</th>
                    <th className="py-2.5 px-3 font-semibold">Priority</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212c3d]/60 font-sans">
                  {filteredRegressions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#64748b]">
                        <History className="w-8 h-8 mx-auto mb-2 text-[#475569] opacity-60" />
                        <p className="text-[13px] font-medium text-[#94a3b8]">No regression records match the current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRegressions.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRegression(r)}
                        className="hover:bg-[#161e29]/50 transition-colors cursor-pointer group"
                      >
                        {/* Finding */}
                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] font-bold text-[#38bdf8] group-hover:underline block">
                            {r.findingId}
                          </span>
                          <span className="font-mono text-[10px] text-[#64748b]">{r.id}</span>
                        </td>

                        {/* CSE */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col max-w-[160px]">
                            <span className="font-medium text-[#e2e8f0] truncate">{r.cseName}</span>
                            <span className="font-mono text-[10px] text-[#64748b]">{r.cseId} • {r.controlId}</span>
                          </div>
                        </td>

                        {/* Previous Remediation */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono text-[11px] font-bold text-[#7bdb80] bg-[#7bdb80]/10 px-2 py-0.5 rounded border border-[#7bdb80]/20">
                            {r.remediationId}
                          </span>
                          {r.verificationId && (
                            <span className="block font-mono text-[10px] text-[#64748b] mt-0.5">
                              via {r.verificationId}
                            </span>
                          )}
                        </td>

                        {/* Reason */}
                        <td className="py-3 px-3">
                          <div className="max-w-md">
                            <span className="font-medium text-rose-300 block truncate">{r.reason}</span>
                            <span className="text-[11px] text-[#94a3b8] line-clamp-1 mt-0.5">
                              {r.originalFindingSummary}
                            </span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <PriorityBadge priority={r.priority} />
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <StatusBadge status={r.status} />
                        </td>

                        {/* Action */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRegression(r);
                            }}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 1: REMEDIATION DETAIL DRAWER (Section 10)                          */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!selectedRemediation}
        onClose={() => setSelectedRemediation(null)}
        title={selectedRemediation?.mandateTitle || 'Remediation Mandate'}
        subtitle={
          selectedRemediation
            ? `Mandate ${selectedRemediation.id} • Ref ${selectedRemediation.findingId}`
            : ''
        }
        width="md"
        footer={
          selectedRemediation && (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/supervision/cses/${selectedRemediation.cseId}`)}
              >
                View CSE Profile
              </Button>
              <div className="flex items-center gap-2">
                {selectedRemediation.status !== 'CLOSED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Send className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setUploadModalMandate(selectedRemediation);
                      setSelectedRemediation(null);
                    }}
                  >
                    Ingest Telemetry
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRemediation(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )
        }
      >
        {selectedRemediation && (
          <div className="space-y-5 text-[12px]">
            {/* Metadata Grid */}
            <div className="p-3.5 rounded-lg bg-[#161e29]/70 border border-[#212c3d] grid grid-cols-2 gap-3 font-mono">
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Remediation ID</span>
                <span className="text-[#38bdf8] font-bold text-[13px]">{selectedRemediation.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Status</span>
                <div className="mt-0.5"><StatusBadge status={selectedRemediation.status} /></div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Target Entity</span>
                <span className="text-[#e2e8f0] font-sans font-medium text-[12px]">{selectedRemediation.cseName}</span>
                <span className="text-[#64748b] block text-[10px]">({selectedRemediation.cseId})</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Control Reference</span>
                <span className="text-[#e2e8f0]">{selectedRemediation.controlRef}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Assigned Owner</span>
                <span className="text-[#e2e8f0]">{selectedRemediation.owner}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">SLA Due Date</span>
                <span className="text-[#e2e8f0]">{selectedRemediation.dueDate} ({selectedRemediation.daysRemaining}d left)</span>
              </div>
            </div>

            {/* Finding Summary & Link to Examiner Workspace */}
            <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#94a3b8] uppercase font-semibold">
                  Underlying Supervisory Finding
                </span>
                <Link
                  to={`/review/${selectedRemediation.findingId}`}
                  className="text-[11px] font-mono text-[#38bdf8] hover:underline flex items-center gap-1"
                >
                  <span>Open Finding in Examiner Workspace</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-[#e2e8f0] text-[12px] leading-relaxed">
                {selectedRemediation.actionSummary}
              </p>
            </div>

            {/* Expected vs Observed Discrepancy Connection (Section 19) */}
            <ExpectedObservedCard
              title="Supervisory Traceability Matrix"
              expected="CTRL-07 escalation procedure fully followed with cryptographic SOAR telemetry proof."
              observed="Escalation evidence omitted for incident INV-338; discrepancy indicates execution gap."
              difference="Execution Gap / Unrecorded Tier-2 Escalation"
              signal="EXECUTION_GAP"
              priority={selectedRemediation.priority as any}
            />

            {/* Lifecycle Progress Bar (Section 17) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase font-semibold block">
                Remediation Lifecycle Progression
              </span>
              <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
                <div className="p-1.5 rounded bg-[#161e29] text-[#7bdb80] border border-[#212c3d] font-semibold">
                  1. Flagged
                </div>
                <div className="p-1.5 rounded bg-[#161e29] text-[#7bdb80] border border-[#212c3d] font-semibold">
                  2. Plan Formulated
                </div>
                <div className={`p-1.5 rounded font-semibold border ${
                  selectedRemediation.artifacts.some(a => a.status === 'PRESENT_VERIFIED')
                    ? 'bg-[#161e29] text-[#7bdb80] border-[#212c3d]'
                    : 'bg-amber-950/30 text-amber-300 border-amber-800/40'
                }`}>
                  3. Evidence ({selectedRemediation.evidenceProgress})
                </div>
                <div className={`p-1.5 rounded font-semibold border ${
                  selectedRemediation.status === 'UNDER_VERIFICATION'
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/40'
                    : selectedRemediation.status === 'CLOSED'
                    ? 'bg-[#161e29] text-[#7bdb80] border-[#212c3d]'
                    : 'bg-[#111622] text-[#64748b] border-[#212c3d]'
                }`}>
                  4. Verification Gate
                </div>
                <div className={`p-1.5 rounded font-semibold border ${
                  selectedRemediation.status === 'CLOSED'
                    ? 'bg-emerald-950/40 text-[#7bdb80] border-emerald-800/50'
                    : 'bg-[#111622] text-[#64748b] border-[#212c3d]'
                }`}>
                  5. Sealed Closure
                </div>
              </div>
            </div>

            {/* Required Corrective Evidence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#94a3b8] uppercase font-semibold">
                  Required Corrective Evidence ({selectedRemediation.evidenceProgress})
                </span>
                <Link
                  to="/evidence"
                  className="text-[11px] font-mono text-[#38bdf8] hover:underline flex items-center gap-1"
                >
                  <span>Evidence Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2">
                {selectedRemediation.artifacts.map((art) => (
                  <div
                    key={art.id}
                    className="p-2.5 rounded-lg bg-[#111622] border border-[#212c3d] flex items-center justify-between text-[12px]"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#94a3b8]" />
                      <div>
                        <span className="font-mono text-[11px] font-bold text-[#e2e8f0]">{art.id}</span>
                        <span className="text-[#94a3b8] ml-2 text-[11px]">{art.name}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        art.status === 'PRESENT_VERIFIED'
                          ? 'bg-[#7bdb80]/10 text-[#7bdb80] border border-[#7bdb80]/20'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      }`}
                    >
                      {art.status === 'PRESENT_VERIFIED' ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Gate Shortcut */}
            <div className="p-3 rounded-lg bg-[#161e29]/50 border border-[#212c3d] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#94a3b8] uppercase block">Verification Gate</span>
                <span className="text-[12px] text-[#e2e8f0]">
                  {selectedRemediation.status === 'UNDER_VERIFICATION'
                    ? 'Artifacts submitted — awaiting human verification sign-off'
                    : selectedRemediation.status === 'CLOSED'
                    ? 'Verification sealed & closed'
                    : 'Pending prerequisite evidence upload'}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedRemediation(null);
                  handleTabChange('verification');
                }}
              >
                Open Verification
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* DRAWER 2: VERIFICATION DETAIL DRAWER (Section 13)                         */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!selectedVerification}
        onClose={() => setSelectedVerification(null)}
        title={selectedVerification ? `Verification Dossier ${selectedVerification.id}` : 'Verification'}
        subtitle={
          selectedVerification
            ? `Mandate ${selectedVerification.mandateId} • Ref ${selectedVerification.findingId}`
            : ''
        }
        width="md"
        footer={
          selectedVerification && (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                icon={<XCircle className="w-3.5 h-3.5" />}
                onClick={() => setReopenPromptVerif(selectedVerification)}
                disabled={selectedVerification.verificationVerdict === 'VERIFIED_SEALED'}
              >
                Reopen Remediation
              </Button>

              <div className="flex items-center gap-2">
                {selectedVerification.verificationVerdict !== 'VERIFIED_SEALED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                    icon={<Lock className="w-3.5 h-3.5" />}
                    onClick={() => handleSealVerification(selectedVerification.id)}
                  >
                    Mark Verified &amp; Seal
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVerification(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )
        }
      >
        {selectedVerification && (
          <div className="space-y-5 text-[12px]">
            {/* Non-Automatic Closure Barrier Banner */}
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px] leading-relaxed">
                <span className="font-bold text-amber-300 font-mono uppercase">
                  Human-in-the-Loop Statutory Rule 4.8.2:
                </span>
                <p className="text-[#94a3b8]">
                  Status change to CLOSED requires independent evidence-backed examiner review. Telemetry ingestion does <strong className="text-[#e2e8f0]">NOT</strong> automatically imply verification.
                </p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="p-3.5 rounded-lg bg-[#161e29]/70 border border-[#212c3d] grid grid-cols-2 gap-3 font-mono">
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Verification ID</span>
                <span className="text-[#38bdf8] font-bold text-[13px]">{selectedVerification.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Verdict</span>
                <div className="mt-0.5"><StatusBadge status={selectedVerification.verificationVerdict} /></div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Entity</span>
                <span className="text-[#e2e8f0] font-sans font-medium text-[12px]">{selectedVerification.cseName}</span>
                <span className="text-[#64748b] block text-[10px]">({selectedVerification.cseId})</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Statutory Standard</span>
                <span className="text-[#e2e8f0] font-sans text-[11px]">{selectedVerification.statutoryStandard}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Lead Examiner</span>
                <span className="text-[#e2e8f0]">{selectedVerification.leadExaminer}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Submitted At</span>
                <span className="text-[#e2e8f0]">{selectedVerification.submittedAt}</span>
              </div>
            </div>

            {/* Verification Checklist (Interactive Gates) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#94a3b8] uppercase font-semibold">
                  Mandatory Verification Checklist ({selectedVerification.gateChecklist.filter(g => g.verified).length}/{selectedVerification.gateChecklist.length})
                </span>
                <span className="text-[10px] font-mono text-[#64748b]">
                  Toggle to update verification state
                </span>
              </div>

              <div className="space-y-2">
                {selectedVerification.gateChecklist.map((gate) => (
                  <div
                    key={gate.id}
                    className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] flex items-start justify-between gap-3 text-[12px]"
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={gate.verified}
                        onChange={(e) => verifyGate(selectedVerification.id, gate.id, e.target.checked)}
                        disabled={selectedVerification.verificationVerdict === 'VERIFIED_SEALED'}
                        className="mt-0.5 cursor-pointer rounded border-[#212c3d] text-[#38bdf8] focus:ring-0"
                      />
                      <div>
                        <span className={`font-medium ${gate.verified ? 'text-[#e2e8f0]' : 'text-[#94a3b8]'}`}>
                          {gate.label}
                        </span>
                        {gate.note && (
                          <span className="text-[10px] font-mono text-rose-400 block mt-0.5">
                            {gate.note}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`font-mono text-[10px] font-bold shrink-0 ${
                      gate.verified ? 'text-[#7bdb80]' : 'text-rose-400'
                    }`}>
                      {gate.verified ? 'PASSED' : 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submitted Artifacts */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase font-semibold block">
                Submitted Verification Artifacts ({selectedVerification.submittedArtifacts.length})
              </span>
              <div className="space-y-2">
                {selectedVerification.submittedArtifacts.map((art) => (
                  <div
                    key={art.id}
                    className="p-2.5 rounded-lg bg-[#111622] border border-[#212c3d] flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#38bdf8]" />
                      <div>
                        <span className="font-mono font-bold text-[#e2e8f0]">{art.id}</span>
                        <span className="text-[#94a3b8] ml-2">{art.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-[#64748b] truncate max-w-[120px]">{art.hash}</span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        art.verified ? 'text-[#7bdb80] bg-[#7bdb80]/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {art.verified ? 'VALID' : 'UNVERIFIED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Examiner Rationale */}
            <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-1.5">
              <span className="text-[10px] font-mono text-[#94a3b8] uppercase font-semibold block">
                Supervisory Rationale:
              </span>
              <p className="text-[#e2e8f0] text-[12px] leading-relaxed font-sans">
                {selectedVerification.supervisoryRationale}
              </p>
            </div>

            {/* Merkle Root Digest */}
            <div className="p-3 rounded-lg bg-[#161e29]/70 border border-[#212c3d] flex items-center justify-between font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-[#38bdf8]" />
                <span className="text-[#94a3b8]">Merkle Root:</span>
                <span className="text-[#7bdb80] truncate max-w-[200px]">{selectedVerification.merkleRootHash}</span>
              </div>
              <button
                onClick={() => copyToClipboard(selectedVerification.merkleRootHash)}
                className="text-[#94a3b8] hover:text-[#e2e8f0]"
                title="Copy hash"
              >
                {copiedHash === selectedVerification.merkleRootHash ? (
                  <Check className="w-3.5 h-3.5 text-[#7bdb80]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* DRAWER 3: REGRESSION DETAIL DRAWER (Section 16)                           */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!selectedRegression}
        onClose={() => setSelectedRegression(null)}
        title={selectedRegression ? `Regression Audit ${selectedRegression.id}` : 'Regression'}
        subtitle={
          selectedRegression
            ? `Finding ${selectedRegression.findingId} • Remediation ${selectedRegression.remediationId}`
            : ''
        }
        width="md"
        footer={
          selectedRegression && (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedRegression(null);
                  handleTabChange('open');
                }}
              >
                Return to Open Remediation
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/review/${selectedRegression.findingId}`)}
                  icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                >
                  Open Finding
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRegression(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )
        }
      >
        {selectedRegression && (
          <div className="space-y-5 text-[12px]">
            {/* Metadata Grid */}
            <div className="p-3.5 rounded-lg bg-[#161e29]/70 border border-[#212c3d] grid grid-cols-2 gap-3 font-mono">
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Regression ID</span>
                <span className="text-rose-400 font-bold text-[13px]">{selectedRegression.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Status</span>
                <div className="mt-0.5"><StatusBadge status={selectedRegression.status} /></div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">CSE</span>
                <span className="text-[#e2e8f0] font-sans font-medium text-[12px]">{selectedRegression.cseName}</span>
                <span className="text-[#64748b] block text-[10px]">({selectedRegression.cseId})</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Control</span>
                <span className="text-[#e2e8f0]">{selectedRegression.controlId}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Reopened Date</span>
                <span className="text-[#e2e8f0]">{selectedRegression.reopenedDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Signal Type</span>
                <span className="text-rose-300 font-bold">{selectedRegression.signalType}</span>
              </div>
            </div>

            {/* Reopening Rationale */}
            <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase font-semibold block">
                Reason Reopened / Regression Trigger
              </span>
              <p className="text-rose-300 font-medium text-[12px]">
                {selectedRegression.reason}
              </p>
              <p className="text-[#94a3b8] text-[12px] leading-relaxed">
                {selectedRegression.originalFindingSummary}
              </p>
            </div>

            {/* New Evidence Flagged */}
            <div className="p-3 rounded-lg bg-[#161e29]/50 border border-[#212c3d] flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#38bdf8]" />
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase block font-mono">New Correlated Evidence</span>
                  <span className="font-mono text-[#e2e8f0]">{selectedRegression.newEvidenceRecord}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/evidence')}
                className="text-[#38bdf8]"
              >
                Inspect Telemetry
              </Button>
            </div>

            {/* Historical Remediation Timeline (Section 16) */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase font-semibold block">
                Multi-Cycle Lifecycle Chronology
              </span>
              <Timeline
                events={selectedRegression.historyTimeline.map((item, idx) => ({
                  id: String(idx),
                  timestamp: item.date,
                  title: item.title,
                  actor: item.actor,
                  description: item.detail,
                  status: idx === selectedRegression.historyTimeline.length - 1 ? 'error' : 'neutral'
                }))}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD REMEDIATION MANDATE                                          */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddRemediationOpen}
        onClose={() => setIsAddRemediationOpen(false)}
        title="Add Remediation Mandate"
        description="Instantiate a formal statutory remediation mandate against an adjudicated supervisory finding."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddRemediationOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsAddRemediationOpen(false);
              }}
            >
              Issue Mandate
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-[12px]">
          <div>
            <label className="text-[11px] font-mono text-[#94a3b8] uppercase block mb-1">
              Adjudicated Finding:
            </label>
            <Select
              sizeVariant="sm"
              value={newMandateForm.findingId}
              onChange={(e) => setNewMandateForm({ ...newMandateForm, findingId: e.target.value })}
              options={findings.map(f => ({
                value: f.id,
                label: `${f.id} - ${f.cseName} (${f.controlId})`
              }))}
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#94a3b8] uppercase block mb-1">
              Mandate Title:
            </label>
            <Input
              value={newMandateForm.title}
              onChange={(e) => setNewMandateForm({ ...newMandateForm, title: e.target.value })}
              placeholder="e.g. Implement Hardware MFA Enforcement on SCADA Gateway"
              sizeVariant="sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#94a3b8] uppercase block mb-1">
                Priority:
              </label>
              <Select
                sizeVariant="sm"
                value={newMandateForm.priority}
                onChange={(e) => setNewMandateForm({ ...newMandateForm, priority: e.target.value as Priority })}
                options={[
                  { value: 'CRITICAL', label: 'CRITICAL' },
                  { value: 'HIGH', label: 'HIGH' },
                  { value: 'MEDIUM', label: 'MEDIUM' },
                  { value: 'LOW', label: 'LOW' }
                ]}
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#94a3b8] uppercase block mb-1">
                SLA Due Date:
              </label>
              <Input
                type="date"
                value={newMandateForm.dueDate}
                onChange={(e) => setNewMandateForm({ ...newMandateForm, dueDate: e.target.value })}
                sizeVariant="sm"
              />
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#161e29] border border-[#212c3d] text-[11px] text-[#94a3b8]">
            Notice: Mandates instantiated by supervisory examiners generate an immutable entry in the audit trail and start the statutory SLA clock.
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: SIMULATE EVIDENCE INGESTION                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!uploadModalMandate}
        onClose={() => setUploadModalMandate(null)}
        title="Simulate Corrective Evidence Ingestion"
        description={
          uploadModalMandate
            ? `Simulate ingestion of required corrective telemetry packet ESC-221 for mandate ${uploadModalMandate.id}`
            : ''
        }
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setUploadModalMandate(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUploadSubmit}>
              Ingest &amp; Transition to Verification
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-[12px]">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#94a3b8] uppercase block">
              Cryptographic SHA-256 Digest:
            </label>
            <input
              type="text"
              value={mockArtifactHash}
              onChange={(e) => setMockArtifactHash(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-[#161e29] border border-[#212c3d] font-mono text-[12px] text-[#7bdb80] focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          <div className="p-2.5 rounded-md bg-[#161e29] border border-[#212c3d] text-[11px] text-[#94a3b8] leading-relaxed">
            Ingesting this artifact automatically transitions the mandate status to <strong className="text-[#38bdf8]">UNDER_VERIFICATION</strong>. Human examiner verification remains strictly required before closure can be granted.
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: EXAMINER REOPEN VERIFICATION PROMPT                              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!reopenPromptVerif}
        onClose={() => setReopenPromptVerif(null)}
        title="Reopen Remediation Mandate"
        description={
          reopenPromptVerif
            ? `Mark verification ${reopenPromptVerif.id} as deficient and re-open mandate ${reopenPromptVerif.mandateId}`
            : ''
        }
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setReopenPromptVerif(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleReopenSubmit}>
              Confirm Reopen
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-[12px]">
          <div>
            <label className="text-[11px] font-mono text-[#94a3b8] uppercase block mb-1">
              Examiner Deficient Rationale:
            </label>
            <textarea
              rows={3}
              value={reopenReasonText}
              onChange={(e) => setReopenReasonText(e.target.value)}
              className="w-full p-2.5 rounded bg-[#161e29] border border-[#212c3d] text-[#e2e8f0] font-sans text-[12px] focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
            Reopening this mandate will revert its status to <strong>REOPENED</strong>, log a new entry in the Reopened / Regression tab, and flag the finding for supervisory re-evaluation.
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
