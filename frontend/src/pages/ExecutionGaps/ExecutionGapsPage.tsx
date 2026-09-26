import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ExecutionGap {
  id: string;
  cseId: string;
  caseId: string;
  processStep: string;
  expectedState: string;
  observedState: string;
  gapType: 'Missing Step' | 'Delayed Step' | 'Incorrect Sequence' | 'Incomplete Execution' | 'Unverified Execution';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceLink: string;
  evidenceStatus: 'NOT_FOUND (MISSING)' | 'VERIFIED' | 'DELAYED';
  status: 'Candidate' | 'Under Review' | 'Validated' | 'Overridden';
}

export const ExecutionGapsPage: React.FC = () => {
  // Filter States
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Q3 2026');
  const [selectedCse, setSelectedCse] = useState<string>('CSE-014');
  const [gapTypeFilter, setGapTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('GAP-0071');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [stepFilter, setStepFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Gap for drill-down inspection
  const [selectedGapId, setSelectedGapId] = useState<string>('GAP-0071');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const gapEntries: ExecutionGap[] = [
    {
      id: 'GAP-0071',
      cseId: 'CSE-014',
      caseId: 'CASE-1042',
      processStep: 'Escalation',
      expectedState: 'Escalation performed',
      observedState: 'No escalation record',
      gapType: 'Missing Step',
      priority: 'CRITICAL',
      evidenceLink: 'NOT_FOUND (MISSING)',
      evidenceStatus: 'NOT_FOUND (MISSING)',
      status: 'Candidate'
    },
    {
      id: 'GAP-0068',
      cseId: 'CSE-014',
      caseId: 'CASE-1037',
      processStep: 'Response',
      expectedState: 'Within SLA (1h)',
      observedState: 'Recorded 4h late',
      gapType: 'Delayed Step',
      priority: 'HIGH',
      evidenceLink: 'EVD-761',
      evidenceStatus: 'DELAYED',
      status: 'Candidate'
    },
    {
      id: 'GAP-0062',
      cseId: 'CSE-007',
      caseId: 'CASE-0987',
      processStep: 'Investigation',
      expectedState: 'Started within 30m',
      observedState: 'Initiated after 2.5h',
      gapType: 'Delayed Step',
      priority: 'HIGH',
      evidenceLink: 'EVD-644',
      evidenceStatus: 'DELAYED',
      status: 'Under Review'
    },
    {
      id: 'GAP-0058',
      cseId: 'CSE-021',
      caseId: 'CASE-0912',
      processStep: 'Evidence Collection',
      expectedState: 'Complete telemetry attached',
      observedState: 'Firewall missing',
      gapType: 'Incomplete Execution',
      priority: 'MEDIUM',
      evidenceLink: 'EVD-593',
      evidenceStatus: 'NOT_FOUND (MISSING)',
      status: 'Candidate'
    },
    {
      id: 'GAP-0053',
      cseId: 'CSE-014',
      caseId: 'CASE-1011',
      processStep: 'Escalation',
      expectedState: 'Senior analyst sign-off',
      observedState: 'Closed without Tier-3',
      gapType: 'Missing Step',
      priority: 'CRITICAL',
      evidenceLink: 'NOT_FOUND',
      evidenceStatus: 'NOT_FOUND (MISSING)',
      status: 'Under Review'
    },
    {
      id: 'GAP-0049',
      cseId: 'CSE-011',
      caseId: 'CASE-0884',
      processStep: 'Response',
      expectedState: 'Automated containment',
      observedState: 'Manual script out-of-order',
      gapType: 'Incorrect Sequence',
      priority: 'MEDIUM',
      evidenceLink: 'EVD-412',
      evidenceStatus: 'VERIFIED',
      status: 'Candidate'
    }
  ];

  const filteredGaps = gapEntries.filter(gap => {
    if (selectedCse !== 'ALL' && gap.cseId !== selectedCse) return false;
    if (gapTypeFilter !== 'ALL' && gap.gapType !== gapTypeFilter) return false;
    if (priorityFilter !== 'ALL' && gap.priority !== priorityFilter) return false;
    if (stepFilter !== 'ALL' && gap.processStep !== stepFilter) return false;
    if (statusFilter !== 'ALL' && gap.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = gap.id.toLowerCase().includes(q);
      const matchCase = gap.caseId.toLowerCase().includes(q);
      const matchCse = gap.cseId.toLowerCase().includes(q);
      const matchStep = gap.processStep.toLowerCase().includes(q);
      if (!matchId && !matchCase && !matchCse && !matchStep) return false;
    }
    return true;
  });

  const activeGap = gapEntries.find(g => g.id === selectedGapId) || gapEntries[0];

  return (
    <div className="flex flex-col w-full text-on-surface font-body-md antialiased pb-xl space-y-md">
      
      {/* TOP BREADCRUMB & BACK LINK ROW */}
      <div className="flex items-center justify-between py-xs flex-wrap gap-2">
        <div className="flex items-center gap-xs font-code-sm text-code-sm text-on-surface-variant">
          <Link to={`/supervision/cse-assessments/${selectedCse}`} className="text-primary hover:underline flex items-center gap-xs">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to CSE Assessment ({selectedCse})
          </Link>
          <span>/</span>
          <span className="text-on-surface">Execution Gaps</span>
          <span>/</span>
          <span className="text-secondary font-mono">CASE-1042</span>
        </div>
        <div className="flex items-center gap-sm">
          <span className="font-code-sm text-code-sm text-outline">ENGINE CONFORMANCE ID: PRM-88392-G</span>
          <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
        </div>
      </div>

      {/* PAGE HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md p-md bg-surface-container rounded-lg shadow-sm border border-[#30363d]/60">
        <div className="space-y-xs">
          <div className="flex items-center gap-sm">
            <span className="px-xs py-0.5 rounded bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase tracking-wider font-bold">
              Regulatory Supervision
            </span>
            <span className="text-outline font-code-sm text-code-sm">REQ-REF: NCIIPC-CTRL-07</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
            Execution Gap Analysis
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-3xl">
            Identify expected SOC process steps that were not observed, were delayed, or deviated from the regulatory baseline workflow. Evidence-backed conformance auditing.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-sm">
          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Period</label>
            <div className="relative mt-0.5">
              <select 
                className="appearance-none bg-surface-container-low text-on-surface font-code-sm text-code-sm px-sm py-1.5 pr-lg rounded focus:outline-none focus:bg-surface-container-high cursor-pointer border border-[#30363d]/40"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="Q3 2026">Q3 2026</option>
                <option value="Q2 2026">Q2 2026</option>
                <option value="Q1 2026">Q1 2026</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-2 text-[16px] pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Entity Subject</label>
            <div className="relative mt-0.5">
              <select 
                className="appearance-none bg-surface-container-low text-on-surface font-code-sm text-code-sm px-sm py-1.5 pr-lg rounded focus:outline-none focus:bg-surface-container-high cursor-pointer font-medium border border-[#30363d]/40"
                value={selectedCse}
                onChange={(e) => setSelectedCse(e.target.value)}
              >
                <option value="CSE-014">CSE-014 (Energy Sector, Critical Priority)</option>
                <option value="ALL">All Monitored CSEs (6)</option>
                <option value="CSE-007">CSE-007 (Financial Services, Tier 1)</option>
                <option value="CSE-021">CSE-021 (Telecommunications Backbone)</option>
                <option value="CSE-011">CSE-011 (Nuclear Core Instrumentation)</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-2 text-[16px] pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>

          <div className="flex items-center gap-xs self-end mt-2 lg:mt-0">
            <button 
              className="flex items-center gap-xs px-sm py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded font-code-sm text-code-sm transition-colors border border-[#30363d]/40"
              onClick={() => showToast('Exporting Execution Gap Conformance Dossier (PDF/JSON)...')}
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export Analysis</span>
            </button>
            <button 
              className="flex items-center gap-xs px-sm py-1.5 bg-primary text-on-primary font-code-sm text-code-sm rounded hover:bg-primary-fixed-dim transition-colors font-medium"
              onClick={() => showToast('Process mining conformance re-synchronized with latest air-gapped logs.')}
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY STRIP (METRICS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-sm">
        <div className="p-sm bg-surface-container-low rounded border border-[#30363d]/60 flex flex-col justify-between">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">Total Execution Gaps</span>
          <div className="flex items-baseline gap-xs mt-1">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">25</span>
            <span className="font-code-sm text-code-sm text-outline">across 6 CSEs</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full w-full"></div>
          </div>
        </div>

        <div className="p-sm bg-surface-container-low rounded border border-[#30363d]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">Critical Gaps</span>
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
          </div>
          <div className="flex items-baseline gap-xs mt-1">
            <span className="font-headline-lg text-headline-lg font-bold text-error">4</span>
            <span className="font-code-sm text-code-sm text-error/80">Immediate Action</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-error h-full" style={{ width: '16%' }}></div>
          </div>
        </div>

        <div className="p-sm bg-surface-container-low rounded border border-[#30363d]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">High Priority</span>
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
          </div>
          <div className="flex items-baseline gap-xs mt-1">
            <span className="font-headline-lg text-headline-lg font-bold text-tertiary">5</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">SLA Breaches</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-tertiary h-full" style={{ width: '20%' }}></div>
          </div>
        </div>

        <div className="p-sm bg-surface-container-low rounded border border-[#30363d]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">Medium</span>
            <span className="w-2 h-2 rounded-full bg-on-tertiary-fixed-variant"></span>
          </div>
          <div className="flex items-baseline gap-xs mt-1">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">10</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">Telemetry Deficits</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-on-tertiary-fixed-variant h-full" style={{ width: '40%' }}></div>
          </div>
        </div>

        <div className="p-sm bg-surface-container-low rounded border border-[#30363d]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">Low</span>
            <span className="w-2 h-2 rounded-full bg-primary-fixed-dim"></span>
          </div>
          <div className="flex items-baseline gap-xs mt-1">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface-variant">6</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">Doc Latency</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary-fixed-dim h-full" style={{ width: '24%' }}></div>
          </div>
        </div>

        {/* Active Entity Badge */}
        <div className="p-sm bg-surface-container rounded border-l-2 border-primary border border-[#30363d]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">Selected: {selectedCse}</span>
            <span className="material-symbols-outlined text-primary text-[14px]">tune</span>
          </div>
          <div className="mt-1">
            <div className="font-headline-sm text-headline-sm font-bold text-on-surface leading-tight">7 Candidates</div>
            <div className="font-code-sm text-code-sm text-on-surface-variant mt-0.5">
              <span className="text-error font-semibold">2 Crit</span> • <span className="text-tertiary">2 High</span> • 2 Med • 1 Low
            </div>
          </div>
          <span className="font-label-caps text-label-caps text-outline uppercase mt-1">NorthGrid Transmission</span>
        </div>
      </div>

      {/* PRIMARY COMPONENT 1: EXPECTED VS OBSERVED PROCESS SWIMLANE (HERO SECTION) */}
      <div className="bg-surface-container rounded-lg p-md space-y-md shadow-sm border border-[#30363d]/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
          <div className="flex items-center gap-sm">
            <span className="p-xs rounded bg-surface-container-high text-primary material-symbols-outlined text-[20px]">account_tree</span>
            <div>
              <div className="flex items-center gap-xs">
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Process Conformance Swimlane</h2>
                <span className="px-xs py-0.5 rounded bg-surface-container-highest font-code-sm text-code-sm text-primary">CASE-1042</span>
                <span className="font-code-sm text-code-sm text-outline">CTRL-07 / Rule R-2.4</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Direct alignment of statutory regulatory process against empirical evidence telemetry timestamped for CSE-014.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-sm text-body-sm flex-wrap">
            <div className="flex items-center gap-xs font-code-sm text-code-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <span className="text-on-surface-variant">Verified Step</span>
            </div>
            <div className="flex items-center gap-xs font-code-sm text-code-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
              <span className="text-on-surface-variant">Missing Step (Critical)</span>
            </div>
            <div className="flex items-center gap-xs font-code-sm text-code-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
              <span className="text-on-surface-variant">SLA Violation</span>
            </div>
          </div>
        </div>

        {/* SIDE-BY-SIDE / DUAL-SWIMLANE VISUALIZATION */}
        <div className="overflow-x-auto pb-sm">
          <div className="min-w-[960px] grid grid-cols-8 gap-xs">
            {/* Step 1: Alert */}
            <div className="flex flex-col bg-surface-container-low rounded p-xs space-y-xs border border-[#30363d]/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">01. ALERT</span>
                <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
              </div>
              <div className="p-xs rounded bg-surface-container font-code-sm text-[11px] leading-tight text-on-surface-variant">
                <span className="text-outline uppercase text-[9px] block">Expected</span>
                Ingested &amp; timestamped
              </div>
              <div className="p-xs rounded bg-surface-container-high font-code-sm text-[11px] leading-tight text-on-surface">
                <span className="text-secondary uppercase text-[9px] block">Observed (09:14)</span>
                ALR-8821 timestamped
              </div>
              <div className="flex items-center justify-center gap-xs text-[10px] text-secondary font-code-sm pt-xs">
                <span>Match</span> • <span>0m delta</span>
              </div>
            </div>

            {/* Step 2: Triage */}
            <div className="flex flex-col bg-surface-container-low rounded p-xs space-y-xs border border-[#30363d]/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">02. TRIAGE</span>
                <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
              </div>
              <div className="p-xs rounded bg-surface-container font-code-sm text-[11px] leading-tight text-on-surface-variant">
                <span className="text-outline uppercase text-[9px] block">Expected</span>
                Initial triage &lt; 15m
              </div>
              <div className="p-xs rounded bg-surface-container-high font-code-sm text-[11px] leading-tight text-on-surface">
                <span className="text-secondary uppercase text-[9px] block">Observed (09:21)</span>
                Completed (7m SLA)
              </div>
              <div className="flex items-center justify-center gap-xs text-[10px] text-secondary font-code-sm pt-xs">
                <span>Match</span> • <span>-8m SLA</span>
              </div>
            </div>

            {/* Step 3: Case Open */}
            <div className="flex flex-col bg-surface-container-low rounded p-xs space-y-xs border border-[#30363d]/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">03. CASE OPEN</span>
                <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
              </div>
              <div className="p-xs rounded bg-surface-container font-code-sm text-[11px] leading-tight text-on-surface-variant">
                <span className="text-outline uppercase text-[9px] block">Expected</span>
                Case formalized
              </div>
              <div className="p-xs rounded bg-surface-container-high font-code-sm text-[11px] leading-tight text-on-surface">
                <span className="text-secondary uppercase text-[9px] block">Observed (09:34)</span>
                CASE-1042 opened
              </div>
              <div className="flex items-center justify-center gap-xs text-[10px] text-secondary font-code-sm pt-xs">
                <span>Match</span> • <span>Formalized</span>
              </div>
            </div>

            {/* Step 4: Investigate */}
            <div className="flex flex-col bg-surface-container-low rounded p-xs space-y-xs border border-[#30363d]/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">04. INVESTIGATE</span>
                <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
              </div>
              <div className="p-xs rounded bg-surface-container font-code-sm text-[11px] leading-tight text-on-surface-variant">
                <span className="text-outline uppercase text-[9px] block">Expected</span>
                Initiate &lt; 30m
              </div>
              <div className="p-xs rounded bg-surface-container-high font-code-sm text-[11px] leading-tight text-on-surface">
                <span className="text-secondary uppercase text-[9px] block">Observed (10:02)</span>
                INV-338 active
              </div>
              <div className="flex items-center justify-center gap-xs text-[10px] text-secondary font-code-sm pt-xs">
                <span>Match</span> • <span>28m elapsed</span>
              </div>
            </div>

            {/* Step 5: Telemetry */}
            <div className="flex flex-col bg-surface-container-low rounded p-xs space-y-xs border border-[#30363d]/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">05. TELEMETRY</span>
                <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
              </div>
              <div className="p-xs rounded bg-surface-container font-code-sm text-[11px] leading-tight text-on-surface-variant">
                <span className="text-outline uppercase text-[9px] block">Expected</span>
                Required telemetry
              </div>
              <div className="p-xs rounded bg-surface-container-high font-code-sm text-[11px] leading-tight text-on-surface">
                <span className="text-secondary uppercase text-[9px] block">Observed (11:46)</span>
                EVD-742 attached
              </div>
              <div className="flex items-center justify-center gap-xs text-[10px] text-secondary font-code-sm pt-xs">
                <span>Match</span> • <span>Verified SHA</span>
              </div>
            </div>

            {/* Step 6: Escalation (GAP: MISSING) */}
            <div className="flex flex-col bg-surface-container-low rounded p-xs space-y-xs border-t-2 border-error border-x border-b border-[#30363d]/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-error uppercase font-bold">06. ESCALATION</span>
                <span className="material-symbols-outlined text-error text-[16px]">cancel</span>
              </div>
              <div className="p-xs rounded bg-surface-container font-code-sm text-[11px] leading-tight text-on-surface-variant">
                <span className="text-outline uppercase text-[9px] block">Expected (Mandatory)</span>
                Tier-2/Tier-3 Escalation
              </div>
              <div className="p-xs rounded bg-error/20 font-code-sm text-[11px] leading-tight text-error font-medium">
                <span className="text-error uppercase text-[9px] block">Observed</span>
                NO ESCALATION RECORD
              </div>
              <div className="flex items-center justify-center gap-xs text-[10px] text-error font-code-sm pt-xs font-bold uppercase">
                <span>Missing Step</span> • <span>Crit</span>
              </div>
            </div>

            {/* Step 7: Response (GAP: DELAYED) */}
            <div className="flex flex-col bg-surface-container-low rounded p-xs space-y-xs border-t-2 border-tertiary border-x border-b border-[#30363d]/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-tertiary uppercase font-bold">07. RESPONSE</span>
                <span className="material-symbols-outlined text-tertiary text-[16px]">warning</span>
              </div>
              <div className="p-xs rounded bg-surface-container font-code-sm text-[11px] leading-tight text-on-surface-variant">
                <span className="text-outline uppercase text-[9px] block">Expected</span>
                Mitigation &lt; 1h SLA
              </div>
              <div className="p-xs rounded bg-tertiary-container/30 font-code-sm text-[11px] leading-tight text-tertiary font-medium">
                <span className="text-tertiary uppercase text-[9px] block">Observed (15:08)</span>
                Recorded 4h late (EVD-761)
              </div>
              <div className="flex items-center justify-center gap-xs text-[10px] text-tertiary font-code-sm pt-xs font-bold uppercase">
                <span>Delayed Step</span> • <span>+240m</span>
              </div>
            </div>

            {/* Step 8: Closure */}
            <div className="flex flex-col bg-surface-container-low rounded p-xs space-y-xs border border-[#30363d]/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">08. CLOSURE</span>
                <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
              </div>
              <div className="p-xs rounded bg-surface-container font-code-sm text-[11px] leading-tight text-on-surface-variant">
                <span className="text-outline uppercase text-[9px] block">Expected</span>
                Sign-off report
              </div>
              <div className="p-xs rounded bg-surface-container-high font-code-sm text-[11px] leading-tight text-on-surface">
                <span className="text-secondary uppercase text-[9px] block">Observed (17:42)</span>
                CLS-421 documented
              </div>
              <div className="flex items-center justify-center gap-xs text-[10px] text-secondary font-code-sm pt-xs">
                <span>Match</span> • <span>Signed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Discrepancy Callout Strip */}
        <div className="p-sm bg-surface-container-low rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-md border-l-4 border-error border border-[#30363d]/40">
          <div className="flex items-start gap-sm">
            <span className="material-symbols-outlined text-error text-[20px] mt-0.5">report_problem</span>
            <div>
              <span className="font-label-caps text-label-caps uppercase text-error font-bold tracking-wider">Observed Discrepancy Detected</span>
              <p className="font-body-sm text-body-sm text-on-surface">
                Escalation bypassed prior to containment response. Mandatory Tier-2 notification criteria met in <span className="font-code-sm text-code-sm text-primary">CASE-1042</span> (Critical Grid Telemetry Delta), but no corresponding escalation record or authorization ledger exists in submitted evidence package.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-xs shrink-0 w-full md:w-auto">
            <Link 
              to="/analytics/negative-space"
              className="px-sm py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-code-sm text-code-sm rounded transition-colors text-center border border-[#30363d]/40"
            >
              Negative Space Evidence
            </Link>
            <Link 
              to="/analytics/process-analysis"
              className="px-sm py-1 bg-primary-container text-on-primary-container font-code-sm text-code-sm rounded hover:bg-opacity-90 transition-colors text-center font-medium"
            >
              Process Mining Conformance
            </Link>
          </div>
        </div>
      </div>

      {/* GAP TYPES FILTER PILLS & MULTI-FILTER BAR */}
      <div className="space-y-sm">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-xs">
          <button 
            className={`px-sm py-1 rounded font-code-sm text-code-sm transition-colors ${
              gapTypeFilter === 'ALL' ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
            onClick={() => setGapTypeFilter('ALL')}
          >
            All Gaps <span className="text-outline ml-1">(25)</span>
          </button>
          <button 
            className={`px-sm py-1 rounded font-code-sm text-code-sm transition-colors flex items-center gap-xs ${
              gapTypeFilter === 'Missing Step' ? 'bg-primary-container text-on-primary-container font-semibold' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
            onClick={() => setGapTypeFilter('Missing Step')}
          >
            <span className="w-2 h-2 rounded-full bg-error"></span>
            <span>Missing Step (9)</span>
          </button>
          <button 
            className={`px-sm py-1 rounded font-code-sm text-code-sm transition-colors ${
              gapTypeFilter === 'Delayed Step' ? 'bg-primary-container text-on-primary-container font-semibold' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
            onClick={() => setGapTypeFilter('Delayed Step')}
          >
            Delayed Step (7)
          </button>
          <button 
            className={`px-sm py-1 rounded font-code-sm text-code-sm transition-colors ${
              gapTypeFilter === 'Incorrect Sequence' ? 'bg-primary-container text-on-primary-container font-semibold' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
            onClick={() => setGapTypeFilter('Incorrect Sequence')}
          >
            Incorrect Sequence (4)
          </button>
          <button 
            className={`px-sm py-1 rounded font-code-sm text-code-sm transition-colors ${
              gapTypeFilter === 'Incomplete Execution' ? 'bg-primary-container text-on-primary-container font-semibold' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
            onClick={() => setGapTypeFilter('Incomplete Execution')}
          >
            Incomplete Execution (3)
          </button>
          <button 
            className={`px-sm py-1 rounded font-code-sm text-code-sm transition-colors ${
              gapTypeFilter === 'Unverified Execution' ? 'bg-primary-container text-on-primary-container font-semibold' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
            onClick={() => setGapTypeFilter('Unverified Execution')}
          >
            Unverified Execution (2)
          </button>
        </div>

        {/* Complex Multi-Filter Bar */}
        <div className="p-sm bg-surface-container-low rounded flex flex-wrap items-center gap-sm border border-[#30363d]/60">
          <div className="flex items-center gap-xs flex-1 min-w-[220px] bg-surface-container px-sm py-1 rounded border border-[#30363d]/40">
            <span className="material-symbols-outlined text-[16px] text-outline">search</span>
            <input 
              type="text"
              className="bg-transparent font-code-sm text-code-sm text-on-surface focus:outline-none w-full placeholder:text-outline"
              placeholder="Search gap ID, case, evidence, rule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-xs flex-wrap">
            <select 
              className="bg-surface-container text-on-surface font-code-sm text-code-sm px-sm py-1 rounded focus:outline-none cursor-pointer border border-[#30363d]/40"
              value={selectedCse}
              onChange={(e) => setSelectedCse(e.target.value)}
            >
              <option value="ALL">Filter by CSE: All CSEs</option>
              <option value="CSE-014">CSE-014 (Selected)</option>
              <option value="CSE-007">CSE-007</option>
              <option value="CSE-021">CSE-021</option>
              <option value="CSE-011">CSE-011</option>
            </select>

            <select 
              className="bg-surface-container text-on-surface font-code-sm text-code-sm px-sm py-1 rounded focus:outline-none cursor-pointer border border-[#30363d]/40"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">Priority: All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select 
              className="bg-surface-container text-on-surface font-code-sm text-code-sm px-sm py-1 rounded focus:outline-none cursor-pointer border border-[#30363d]/40"
              value={stepFilter}
              onChange={(e) => setStepFilter(e.target.value)}
            >
              <option value="ALL">Process Step: All</option>
              <option value="Escalation">Escalation</option>
              <option value="Response">Response</option>
              <option value="Investigation">Investigation</option>
              <option value="Evidence Collection">Evidence Collection</option>
            </select>

            <select 
              className="bg-surface-container text-on-surface font-code-sm text-code-sm px-sm py-1 rounded focus:outline-none cursor-pointer border border-[#30363d]/40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="Candidate">Candidate</option>
              <option value="Under Review">Under Review</option>
              <option value="Validated">Validated</option>
              <option value="Overridden">Overridden</option>
            </select>

            <button 
              className="px-sm py-1 text-on-surface-variant hover:text-on-surface font-code-sm text-code-sm transition-colors"
              onClick={() => {
                setGapTypeFilter('ALL');
                setSearchTerm('');
                setPriorityFilter('ALL');
                setStepFilter('ALL');
                setStatusFilter('ALL');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TABLE: IDENTIFIED EXECUTION GAPS */}
      <div className="bg-surface-container rounded-lg overflow-hidden shadow-sm border border-[#30363d]/60">
        <div className="p-sm bg-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-xs">
            <span className="font-label-caps text-label-caps text-on-surface uppercase font-bold">Identified Execution Gaps Log</span>
            <span className="px-xs py-0.5 rounded bg-surface-container-highest font-code-sm text-code-sm text-primary">
              {filteredGaps.length} Entries Displayed
            </span>
          </div>
          <div className="font-code-sm text-code-sm text-outline">
            Deterministic Telemetry Match: FIPS-140-2 Validated
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm text-on-surface">
            <thead className="bg-surface-container-highest/50 font-label-caps text-label-caps text-on-surface-variant uppercase">
              <tr>
                <th className="py-2.5 px-sm">Gap ID</th>
                <th className="py-2.5 px-sm">CSE</th>
                <th className="py-2.5 px-sm">Case ID</th>
                <th className="py-2.5 px-sm">Process Step</th>
                <th className="py-2.5 px-sm">Expected State</th>
                <th className="py-2.5 px-sm">Observed State</th>
                <th className="py-2.5 px-sm">Gap Type</th>
                <th className="py-2.5 px-sm">Priority</th>
                <th className="py-2.5 px-sm">Evidence Link</th>
                <th className="py-2.5 px-sm">Status</th>
                <th className="py-2.5 px-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/40 font-code-sm text-code-sm">
              {filteredGaps.map(gap => {
                const isSelected = gap.id === selectedGapId;
                return (
                  <tr 
                    key={gap.id}
                    className={`hover:bg-surface-container-highest transition-colors cursor-pointer ${
                      isSelected ? 'bg-surface-container-highest/80 border-l-2 border-primary' : ''
                    }`}
                    onClick={() => setSelectedGapId(gap.id)}
                  >
                    <td className="py-2 px-sm font-semibold text-primary">{gap.id}</td>
                    <td className="py-2 px-sm text-on-surface">{gap.cseId}</td>
                    <td className="py-2 px-sm text-on-surface-variant font-mono">{gap.caseId}</td>
                    <td className="py-2 px-sm font-medium text-on-surface">{gap.processStep}</td>
                    <td className="py-2 px-sm text-outline">{gap.expectedState}</td>
                    <td className="py-2 px-sm text-error font-medium">{gap.observedState}</td>
                    <td className="py-2 px-sm">
                      <span className="px-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px]">
                        {gap.gapType}
                      </span>
                    </td>
                    <td className="py-2 px-sm">
                      {gap.priority === 'CRITICAL' && (
                        <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-error-container text-on-error-container text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-error"></span> CRITICAL
                        </span>
                      )}
                      {gap.priority === 'HIGH' && (
                        <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-tertiary-container text-on-tertiary-container text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> HIGH
                        </span>
                      )}
                      {gap.priority === 'MEDIUM' && (
                        <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-fixed-variant"></span> MEDIUM
                        </span>
                      )}
                      {gap.priority === 'LOW' && (
                        <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-surface-container text-outline text-[11px]">
                          LOW
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-sm">
                      {gap.evidenceLink.startsWith('NOT') ? (
                        <span className="text-error font-mono text-[11px]">{gap.evidenceLink}</span>
                      ) : (
                        <Link to="/evidence" className="text-primary hover:underline font-mono text-[11px]">
                          {gap.evidenceLink}
                        </Link>
                      )}
                    </td>
                    <td className="py-2 px-sm">
                      <span className={gap.status === 'Under Review' ? 'text-secondary font-medium' : 'text-primary font-medium'}>
                        {gap.status}
                      </span>
                    </td>
                    <td className="py-2 px-sm text-right">
                      {isSelected ? (
                        <button className="px-sm py-0.5 bg-primary text-on-primary rounded text-code-sm font-medium hover:bg-primary-fixed-dim">
                          Active Review →
                        </button>
                      ) : (
                        <button className="px-sm py-0.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded text-code-sm border border-[#30363d]/40">
                          Review Gap
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTERACTIVE DRILL-DOWN PANEL FOR SELECTED GAP (GAP-0071) */}
      <div className="bg-surface-container rounded-lg p-md space-y-md shadow-md border-t-2 border-primary border border-[#30363d]/60">
        
        {/* Detail Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm pb-sm border-b border-surface-container-highest">
          <div className="space-y-xs">
            <div className="flex items-center gap-sm flex-wrap">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Execution Gap {activeGap.id}</span>
              <span className="px-xs py-0.5 rounded bg-error-container text-on-error-container font-label-caps text-label-caps font-bold">
                {activeGap.priority} PRIORITY
              </span>
              <span className="px-xs py-0.5 rounded bg-surface-container-high text-primary font-code-sm text-code-sm">
                CANDIDATE SIGNAL
              </span>
            </div>
            <div className="flex items-center gap-sm font-code-sm text-code-sm text-on-surface-variant flex-wrap">
              <span>Target: <span className="text-on-surface font-semibold">{activeGap.cseId} (NorthGrid Transmission)</span></span>
              <span>•</span>
              <span>Case: <span className="text-primary font-mono font-semibold">{activeGap.caseId}</span></span>
              <span>•</span>
              <span>Awaiting Human Examiner Decision</span>
            </div>
          </div>
          <div className="flex items-center gap-xs">
            <Link 
              to="/findings/FND-0142"
              className="px-sm py-1.5 bg-primary-container text-on-primary-container font-code-sm text-code-sm rounded hover:bg-opacity-90 transition-colors flex items-center gap-xs font-medium"
            >
              <span>Open Finding FND-0142 in Workspace</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Split: Reasoning Chain & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
          
          {/* Left Column: Analytical Reasoning Chain (7 cols) */}
          <div className="lg:col-span-7 space-y-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                Why Was This Gap Flagged? (Analytical Reasoning Chain)
              </span>
              <span className="font-code-sm text-[11px] text-outline">ENGINE: SAT-SA-INFER-V1</span>
            </div>

            <div className="bg-surface-container-low rounded p-sm space-y-sm border border-[#30363d]/40">
              <ol className="space-y-sm text-body-sm">
                <li className="flex items-start gap-sm">
                  <span className="w-5 h-5 rounded-full bg-surface-container-highest text-primary font-code-sm text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
                  <div>
                    <span className="font-semibold text-on-surface">Expected Process Definition:</span>
                    <p className="text-on-surface-variant font-code-sm text-code-sm mt-0.5">
                      Control CTRL-07 / Rule R-2.4 mandates immediate Tier-2 or Tier-3 escalation when an alert has critical impact score &gt;= 8 on SCADA/Grid sub-telemetry.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="w-5 h-5 rounded-full bg-surface-container-highest text-primary font-code-sm text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
                  <div>
                    <span className="font-semibold text-on-surface">Observed Telemetry:</span>
                    <p className="text-on-surface-variant font-code-sm text-code-sm mt-0.5">
                      Case CASE-1042 was flagged with Severity 9 at 09:34. Investigation closed straight to response at 15:08 without an intermediate escalation trigger event.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="w-5 h-5 rounded-full bg-surface-container-highest text-primary font-code-sm text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
                  <div>
                    <span className="font-semibold text-on-surface">Evidence Check:</span>
                    <p className="text-on-surface-variant font-code-sm text-code-sm mt-0.5">
                      Evidence store queried for <code className="text-primary bg-surface px-1 py-0.5 rounded">ESC-*</code> records matching case token <code className="text-primary bg-surface px-1 py-0.5 rounded">UUID-88910</code>; returned <span className="text-error font-bold">NOT_FOUND</span> across all verified entity pools.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="w-5 h-5 rounded-full bg-surface-container-highest text-error font-code-sm text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-bold">4</span>
                  <div>
                    <span className="font-semibold text-error">Supervisory Signal Inferred:</span>
                    <p className="text-on-surface-variant font-code-sm text-code-sm mt-0.5">
                      Execution Gap: Missing Step (Mandatory Escalation Node bypassed). Confidence Score: 98.4%.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="w-5 h-5 rounded-full bg-surface-container-highest text-tertiary font-code-sm text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-bold">5</span>
                  <div>
                    <span className="font-semibold text-tertiary">Priority Assignment:</span>
                    <p className="text-on-surface-variant font-code-sm text-code-sm mt-0.5">
                      Assigned <span className="text-error font-bold uppercase">Critical</span> priority due to Designated Critical Information Infrastructure (CII - Energy Sector) regulatory threshold.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="w-5 h-5 rounded-full bg-surface-container-highest text-secondary font-code-sm text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-bold">6</span>
                  <div>
                    <span className="font-semibold text-secondary">Human Examiner Review Required:</span>
                    <p className="text-on-surface-variant font-code-sm text-code-sm mt-0.5">
                      Signal Candidate is staged pending regulatory validation before entering formal CSE non-compliance registry.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Evidence Fusion & Signal Convergence Strip */}
            <div className="p-sm bg-surface-container-low rounded space-y-xs border border-[#30363d]/40">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
                  Evidence Fusion &amp; Signal Convergence
                </span>
                <span className="font-code-sm text-[11px] text-secondary">RESULT: FINDING CANDIDATE FND-0142</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-xs pt-xs">
                <div className="p-xs bg-surface-container rounded border-l-2 border-primary">
                  <span className="font-label-caps text-[10px] text-outline uppercase">Primary Signal</span>
                  <div className="font-code-sm text-code-sm font-semibold text-on-surface">Execution Gap</div>
                  <div className="font-body-sm text-[11px] text-on-surface-variant">Missing Escalation Step</div>
                </div>
                <div className="p-xs bg-surface-container rounded border-l-2 border-tertiary">
                  <span className="font-label-caps text-[10px] text-outline uppercase">Supporting Signal</span>
                  <div className="font-code-sm text-code-sm font-semibold text-on-surface">Negative Space</div>
                  <div className="font-body-sm text-[11px] text-on-surface-variant">Record NOT_SUBMITTED</div>
                </div>
                <div className="p-xs bg-surface-container rounded border-l-2 border-error">
                  <span className="font-label-caps text-[10px] text-outline uppercase">Historical Trend</span>
                  <div className="font-code-sm text-code-sm font-semibold text-on-surface">Recurrence</div>
                  <div className="font-body-sm text-[11px] text-on-surface-variant">Similar gap in Q2 2026</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Process Timeline Preview & Rule Provenance (5 cols) */}
          <div className="lg:col-span-5 space-y-sm flex flex-col justify-between">
            <div className="space-y-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                  Process Timeline Visualizer
                </span>
                <span className="font-code-sm text-[11px] text-outline">CASE-1042 SEQUENCE</span>
              </div>

              {/* Vertical Timeline with missing red node */}
              <div className="bg-surface-container-low rounded p-sm relative border border-[#30363d]/40">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-surface-container-highest"></div>
                <div className="space-y-sm relative">
                  <div className="flex items-center gap-sm">
                    <span className="w-3 h-3 rounded-full bg-secondary z-10 ml-1.5 shrink-0"></span>
                    <div className="flex items-baseline justify-between w-full font-code-sm text-code-sm">
                      <span className="text-on-surface">09:14 • Alert ALR-8821</span>
                      <span className="text-secondary text-[11px]">Ingested</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="w-3 h-3 rounded-full bg-secondary z-10 ml-1.5 shrink-0"></span>
                    <div className="flex items-baseline justify-between w-full font-code-sm text-code-sm">
                      <span className="text-on-surface">09:34 • Case CASE-1042</span>
                      <span className="text-secondary text-[11px]">Formalized</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="w-3 h-3 rounded-full bg-secondary z-10 ml-1.5 shrink-0"></span>
                    <div className="flex items-baseline justify-between w-full font-code-sm text-code-sm">
                      <span className="text-on-surface">10:02 • Inv INV-338</span>
                      <span className="text-secondary text-[11px]">Active</span>
                    </div>
                  </div>
                  {/* MISSING NODE */}
                  <div className="flex items-center gap-sm p-1 rounded bg-error/10 border border-error/30">
                    <span className="w-3 h-3 rounded-full bg-error z-10 ml-1 shrink-0 animate-ping"></span>
                    <div className="flex items-baseline justify-between w-full font-code-sm text-code-sm">
                      <span className="text-error font-bold">13:20 (Expected) • Escalation</span>
                      <span className="text-error font-bold text-[11px] uppercase">GAP MISSING</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="w-3 h-3 rounded-full bg-tertiary z-10 ml-1.5 shrink-0"></span>
                    <div className="flex items-baseline justify-between w-full font-code-sm text-code-sm">
                      <span className="text-on-surface">15:08 • Response EVD-761</span>
                      <span className="text-tertiary text-[11px]">+4h SLA</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="w-3 h-3 rounded-full bg-secondary z-10 ml-1.5 shrink-0"></span>
                    <div className="flex items-baseline justify-between w-full font-code-sm text-code-sm">
                      <span className="text-on-surface">17:42 • Closure CLS-421</span>
                      <span className="text-secondary text-[11px]">Signed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rule Provenance & Technical Metadata */}
            <div className="p-sm bg-surface-container-low rounded space-y-xs border border-[#30363d]/40">
              <span className="font-label-caps text-label-caps uppercase text-outline font-bold">
                Expected Process Definition &amp; Rule Provenance
              </span>
              <div className="font-code-sm text-[11px] space-y-1 text-on-surface-variant">
                <div className="flex justify-between">
                  <span className="text-outline">Control:</span>
                  <span className="text-on-surface">CTRL-07 (Incident Escalation Mgmt)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Rule Version:</span>
                  <span className="text-on-surface">R-2.4 (Statutory Baseline 2026.1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Analytics Engine:</span>
                  <span className="text-on-surface">SAT-SA Conformance v1.4.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">FIPS-140-2 Hashing:</span>
                  <span className="text-primary font-mono">SHA-256 (3c8f...9a12)</span>
                </div>
              </div>
            </div>

            {/* Recommended Review Path */}
            <div className="p-sm bg-surface-container-low rounded space-y-xs border border-[#30363d]/40">
              <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                Recommended Review Path
              </span>
              <div className="font-body-sm text-[11px] space-y-1 text-on-surface-variant">
                <div className="flex items-center gap-xs">
                  <span className="text-outline">1.</span>
                  <span>Verify SOC ticketing system audit log for unsubmitted ESC ticket drafts.</span>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="text-outline">2.</span>
                  <span>Cross-reference CISO paging records via Telecommunications annex.</span>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="text-outline">3.</span>
                  <span>If confirmed absent, validate finding candidate FND-0142.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* EVIDENCE SUPPORTING THIS GAP */}
        <div className="space-y-xs pt-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
              Evidence Items Supporting This Gap
            </span>
            <span className="font-code-sm text-[11px] text-outline">6 Artifacts Ingested</span>
          </div>

          <div className="overflow-x-auto rounded bg-surface-container-low border border-[#30363d]/40">
            <table className="w-full text-left font-code-sm text-code-sm">
              <thead className="bg-surface-container-high/40 text-outline text-[11px] uppercase">
                <tr>
                  <th className="py-2 px-sm">Evidence ID</th>
                  <th className="py-2 px-sm">Stage</th>
                  <th className="py-2 px-sm">Source Subsystem</th>
                  <th className="py-2 px-sm">Timestamp</th>
                  <th className="py-2 px-sm">Availability Status</th>
                  <th className="py-2 px-sm">Data Integrity</th>
                  <th className="py-2 px-sm text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/30 text-on-surface">
                <tr className="hover:bg-surface-container/60">
                  <td className="py-1.5 px-sm text-primary font-mono">ALR-8821</td>
                  <td className="py-1.5 px-sm text-on-surface-variant">Alert</td>
                  <td className="py-1.5 px-sm">SOC SIEM (Grid SCADA)</td>
                  <td className="py-1.5 px-sm text-outline">14 Sep 2026 09:14</td>
                  <td className="py-1.5 px-sm"><span className="text-secondary font-medium">PRESENT</span></td>
                  <td className="py-1.5 px-sm text-secondary">100% Verified</td>
                  <td className="py-1.5 px-sm text-right">
                    <Link to="/evidence" className="text-primary hover:underline text-[11px]">View Evidence</Link>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container/60">
                  <td className="py-1.5 px-sm text-primary font-mono">CASE-1042</td>
                  <td className="py-1.5 px-sm text-on-surface-variant">Case</td>
                  <td className="py-1.5 px-sm">SOC Case Mgmt</td>
                  <td className="py-1.5 px-sm text-outline">14 Sep 2026 09:34</td>
                  <td className="py-1.5 px-sm"><span className="text-secondary font-medium">PRESENT</span></td>
                  <td className="py-1.5 px-sm text-secondary">100% Verified</td>
                  <td className="py-1.5 px-sm text-right">
                    <Link to="/evidence" className="text-primary hover:underline text-[11px]">View Evidence</Link>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container/60">
                  <td className="py-1.5 px-sm text-primary font-mono">INV-338</td>
                  <td className="py-1.5 px-sm text-on-surface-variant">Investigation</td>
                  <td className="py-1.5 px-sm">Analyst Notes &amp; PCAP</td>
                  <td className="py-1.5 px-sm text-outline">14 Sep 2026 10:02</td>
                  <td className="py-1.5 px-sm"><span className="text-secondary font-medium">PRESENT</span></td>
                  <td className="py-1.5 px-sm text-secondary">100% Verified</td>
                  <td className="py-1.5 px-sm text-right">
                    <Link to="/evidence" className="text-primary hover:underline text-[11px]">View Evidence</Link>
                  </td>
                </tr>
                <tr className="bg-error/10">
                  <td className="py-1.5 px-sm text-error font-mono font-bold">ESC-221 (Expected)</td>
                  <td className="py-1.5 px-sm text-error">Escalation</td>
                  <td className="py-1.5 px-sm text-error">SOC Workflow Engine</td>
                  <td className="py-1.5 px-sm text-error">—</td>
                  <td className="py-1.5 px-sm"><span className="text-error font-bold uppercase">NOT_SUBMITTED / MISSING</span></td>
                  <td className="py-1.5 px-sm text-outline">—</td>
                  <td className="py-1.5 px-sm text-right">
                    <Link to="/analytics/negative-space" className="text-error font-semibold hover:underline text-[11px]">Check Negative Space</Link>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container/60">
                  <td className="py-1.5 px-sm text-primary font-mono">EVD-761</td>
                  <td className="py-1.5 px-sm text-on-surface-variant">Response</td>
                  <td className="py-1.5 px-sm">Containment Log</td>
                  <td className="py-1.5 px-sm text-outline">14 Sep 2026 15:08</td>
                  <td className="py-1.5 px-sm"><span className="text-secondary font-medium">PRESENT</span></td>
                  <td className="py-1.5 px-sm text-tertiary">98% Verified</td>
                  <td className="py-1.5 px-sm text-right">
                    <Link to="/evidence" className="text-primary hover:underline text-[11px]">View Evidence</Link>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container/60">
                  <td className="py-1.5 px-sm text-primary font-mono">CLS-421</td>
                  <td className="py-1.5 px-sm text-on-surface-variant">Closure</td>
                  <td className="py-1.5 px-sm">Sign-off Doc</td>
                  <td className="py-1.5 px-sm text-outline">14 Sep 2026 17:42</td>
                  <td className="py-1.5 px-sm"><span className="text-secondary font-medium">PRESENT</span></td>
                  <td className="py-1.5 px-sm text-secondary">100% Verified</td>
                  <td className="py-1.5 px-sm text-right">
                    <Link to="/evidence" className="text-primary hover:underline text-[11px]">View Evidence</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* HUMAN-IN-THE-LOOP EXAMINER DECISION PANEL (STATUTORY) */}
        <div className="p-md bg-surface-container-high rounded-lg space-y-sm border border-primary/30">
          <div className="flex items-center gap-xs text-primary font-label-caps text-label-caps uppercase font-bold tracking-wider">
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            <span>Human-in-the-Loop Examiner Decision Authority</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            <span className="text-on-surface font-semibold">Statutory Supervisory Notice:</span> Execution gap candidates are synthetically inferred from expected-versus-observed telemetry. Final regulatory assessment, citation issuance, and compliance rating penalties remain strictly with the designated human examiner.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-sm pt-xs">
            <div className="flex flex-wrap items-center gap-xs">
              <Link 
                to="/findings/FND-0142" 
                className="px-sm py-1.5 bg-primary text-on-primary font-code-sm text-code-sm rounded hover:bg-primary-fixed-dim transition-colors font-medium flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Validate Finding Candidate</span>
              </Link>
              <button 
                className="px-sm py-1.5 bg-surface-container hover:bg-surface-container-highest text-on-surface font-code-sm text-code-sm rounded transition-colors flex items-center gap-xs border border-[#30363d]/40"
                onClick={() => showToast('Execution Gap GAP-0071 qualified with operational caveats.')}
              >
                <span className="material-symbols-outlined text-[16px]">rule</span>
                <span>Qualify Gap</span>
              </button>
              <button 
                className="px-sm py-1.5 bg-surface-container hover:bg-surface-container-highest text-on-surface font-code-sm text-code-sm rounded transition-colors flex items-center gap-xs border border-[#30363d]/40"
                onClick={() => showToast('Priority override committed to audit log.')}
              >
                <span className="material-symbols-outlined text-[16px]">low_priority</span>
                <span>Override Priority</span>
              </button>
              <button 
                className="px-sm py-1.5 bg-surface-container hover:bg-surface-container-highest text-on-surface font-code-sm text-code-sm rounded transition-colors flex items-center gap-xs border border-[#30363d]/40"
                onClick={() => showToast('Formal statutory demand issued for ESC-221 telemetry bundle.')}
              >
                <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                <span>Request Missing Evidence</span>
              </button>
              <button 
                className="px-sm py-1.5 bg-surface-container hover:bg-error/20 text-error font-code-sm text-code-sm rounded transition-colors flex items-center gap-xs border border-error/30"
                onClick={() => showToast('Execution Gap candidate marked as rejected (false positive).')}
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                <span>Reject Signal</span>
              </button>
            </div>

            <div className="flex items-center gap-xs font-code-sm text-code-sm text-outline">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>Logged under Examiner Session: NC-SUPV-04</span>
            </div>
          </div>
        </div>

      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-surface-container-high border border-secondary text-on-surface px-4 py-2.5 rounded shadow-xl font-code-sm text-code-sm flex items-center gap-2 z-50">
          <span className="material-symbols-outlined text-secondary text-[18px]">task_alt</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
