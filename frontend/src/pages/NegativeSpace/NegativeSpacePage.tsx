import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface NegativeSpaceCandidate {
  id: string;
  cseId: string;
  cseName: string;
  caseRef: string;
  expectedEvidence: string;
  evidenceSubtype: string;
  controlId: string;
  evidenceState: 'NOT_SUBMITTED' | 'ABSENT_CONFIRMED' | 'UNKNOWN' | 'NOT_APPLICABLE' | 'PRESENT';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  machineConfidence: number;
  hypotheses: { text: string; subtext: string; pct: number }[];
}

export const NegativeSpacePage: React.FC = () => {
  // Screen Filters
  const [cycle, setCycle] = useState<string>('Q3 2026');
  const [targetCse, setTargetCse] = useState<string>('CSE-014');
  const [searchQuery, setSearchQuery] = useState<string>('NS-0041');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [controlFilter, setControlFilter] = useState<string>('ALL');
  const [highPriorityOnly, setHighPriorityOnly] = useState<boolean>(false);

  // Selected candidate in drawer
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('NS-0041');

  // Interactive Form State in Drawer
  const [evidenceSpec, setEvidenceSpec] = useState<string>('Formal Tier-2 Incident Escalation ticket log & SOC supervisor sign-off');
  const [adjudicationNotes, setAdjudicationNotes] = useState<string>('');
  const [selectedHypothesisIdx, setSelectedHypothesisIdx] = useState<number>(0);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const candidates: NegativeSpaceCandidate[] = [
    {
      id: 'NS-0041',
      cseId: 'CSE-014',
      cseName: 'Energy (NorthGrid)',
      caseRef: 'CASE-1042',
      expectedEvidence: 'Escalation Sign-off',
      evidenceSubtype: 'Tier-2 Escalation Record',
      controlId: 'CTRL-07',
      evidenceState: 'NOT_SUBMITTED',
      priority: 'HIGH',
      machineConfidence: 74,
      hypotheses: [
        {
          text: 'Evidence not submitted to repository',
          subtext: 'Artifact exists within CSE perimeter ticketing server but omitted during batch upload.',
          pct: 74
        },
        {
          text: 'Schema translation mismatch',
          subtext: 'Escalation record logged under alternate custom field in NorthGrid Jira instance.',
          pct: 18
        },
        {
          text: 'Process failure (Evidence never created)',
          subtext: 'Escalation protocol was bypassed during live incident triage.',
          pct: 8
        }
      ]
    },
    {
      id: 'NS-0038',
      cseId: 'CSE-014',
      cseName: 'Energy (NorthGrid)',
      caseRef: 'CASE-1037',
      expectedEvidence: 'SCADA Bastion Access Log',
      evidenceSubtype: 'Privileged Session Recording',
      controlId: 'CTRL-19',
      evidenceState: 'ABSENT_CONFIRMED',
      priority: 'HIGH',
      machineConfidence: 89,
      hypotheses: [
        {
          text: 'Session recording daemon crashed during switchover',
          subtext: 'Daemon telemetry shows SIGSEGV at 04:12 IST.',
          pct: 82
        },
        {
          text: 'Log transmission blocked by gateway firewall',
          subtext: 'Outbound port 514 unrouted during maintenance.',
          pct: 18
        }
      ]
    },
    {
      id: 'NS-0034',
      cseId: 'CSE-014',
      cseName: 'Energy (NorthGrid)',
      caseRef: 'CASE-1021',
      expectedEvidence: 'Response Validation Signoff',
      evidenceSubtype: 'Post-Containment Review',
      controlId: 'CTRL-12',
      evidenceState: 'NOT_SUBMITTED',
      priority: 'MEDIUM',
      machineConfidence: 65,
      hypotheses: [
        {
          text: 'Signoff delayed pending shift change',
          subtext: 'Lead engineer signed ticket manually in physical logbook.',
          pct: 65
        },
        {
          text: 'Incomplete evidence bundle export',
          subtext: 'Attachment dropped during automated zip extraction.',
          pct: 35
        }
      ]
    },
    {
      id: 'NS-0031',
      cseId: 'CSE-014',
      cseName: 'Energy (NorthGrid)',
      caseRef: 'CASE-1008',
      expectedEvidence: 'Investigation Closure Artifact',
      evidenceSubtype: 'Root Cause Validation Memo',
      controlId: 'CTRL-04',
      evidenceState: 'UNKNOWN',
      priority: 'LOW',
      machineConfidence: 50,
      hypotheses: [
        {
          text: 'Archived under legacy filing code',
          subtext: 'Cross-indexing ongoing in NCIIPC intake engine.',
          pct: 50
        }
      ]
    },
    {
      id: 'NS-0029',
      cseId: 'CSE-007',
      cseName: 'Banking (Apex)',
      caseRef: 'CASE-0994',
      expectedEvidence: 'Swift Core Isolation Log',
      evidenceSubtype: 'Firewall Network Partition',
      controlId: 'CTRL-07',
      evidenceState: 'NOT_SUBMITTED',
      priority: 'HIGH',
      machineConfidence: 78,
      hypotheses: [
        {
          text: 'Partition executed via out-of-band console',
          subtext: 'Serial port capture not mirrored to Syslog.',
          pct: 78
        }
      ]
    },
    {
      id: 'NS-0026',
      cseId: 'CSE-021',
      cseName: 'Telecom (TelcoBharat)',
      caseRef: 'CASE-0982',
      expectedEvidence: 'SS7 Gateway Auth Traces',
      evidenceSubtype: 'Signalling Audit Ledger',
      controlId: 'CTRL-15',
      evidenceState: 'ABSENT_CONFIRMED',
      priority: 'HIGH',
      machineConfidence: 91,
      hypotheses: [
        {
          text: 'Diameter protocol bypass anomaly',
          subtext: 'Auth bypass detected in edge roaming node.',
          pct: 91
        }
      ]
    }
  ];

  const filteredCandidates = candidates.filter(item => {
    if (targetCse !== 'ALL' && item.cseId !== targetCse) return false;
    if (stateFilter !== 'ALL' && item.evidenceState !== stateFilter) return false;
    if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;
    if (controlFilter !== 'ALL' && item.controlId !== controlFilter) return false;
    if (highPriorityOnly && item.priority !== 'HIGH' && item.priority !== 'CRITICAL') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchCase = item.caseRef.toLowerCase().includes(q);
      const matchEvidence = item.expectedEvidence.toLowerCase().includes(q);
      const matchControl = item.controlId.toLowerCase().includes(q);
      if (!matchId && !matchCase && !matchEvidence && !matchControl) return false;
    }
    return true;
  });

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  const handleResetFilters = () => {
    setTargetCse('CSE-014');
    setSearchQuery('');
    setStateFilter('ALL');
    setPriorityFilter('ALL');
    setControlFilter('ALL');
    setHighPriorityOnly(false);
  };

  const handleDispatchInjunction = () => {
    showToast(`Official Evidence Injunction dispatched for ${activeCandidate.id} under NCIIPC Rule 14.`);
  };

  return (
    <div className="flex flex-col w-full text-on-surface antialiased pb-xl space-y-md">
      
      {/* TOP BREADCRUMB & CONTEXT BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-y-sm py-sm mb-sm font-code-sm text-code-sm text-on-surface-variant">
        <div className="flex items-center gap-xs">
          <span className="text-primary font-semibold">SAT-SA</span>
          <span>/</span>
          <Link to="/analytics/execution-gaps" className="hover:text-primary transition-colors">Analytics</Link>
          <span>/</span>
          <span className="text-on-surface font-semibold">Negative Space</span>
          <span className="ml-sm px-xs py-0.5 rounded bg-primary-container/20 text-primary text-[10px] font-bold uppercase tracking-wider">
            {targetCse} Selected
          </span>
        </div>
        <div className="flex items-center gap-sm">
          <span className="inline-flex items-center gap-xs px-sm py-0.5 rounded bg-surface-container-high text-outline text-[11px] font-label-caps">
            <span className="material-symbols-outlined text-[13px] text-secondary">verified</span>
            CANON: Missing Evidence ≠ Confirmed Failure
          </span>
          <span className="inline-flex items-center gap-xs px-sm py-0.5 rounded bg-surface-container-high text-secondary text-[11px] font-label-caps">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            AIR-GAPPED / INTERNAL ENCLAVE
          </span>
        </div>
      </div>

      {/* TITLE + HEADER TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-md mb-lg">
        <div>
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[28px]">contrast</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Negative Space Analysis
            </h1>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs max-w-4xl">
            Identify expected evidence that is absent, unavailable, unconfirmed, or not submitted according to control, process, and supervisory assessment models.
          </p>
        </div>

        {/* Global Screen Controls */}
        <div className="flex flex-wrap items-center gap-xs font-body-sm text-body-sm">
          <div className="flex items-center bg-surface-container px-sm py-xs rounded border border-[#30363d]/40">
            <span className="text-on-surface-variant mr-xs text-[11px] font-label-caps uppercase">Cycle</span>
            <select 
              className="bg-transparent text-on-surface font-medium focus:outline-none cursor-pointer"
              value={cycle}
              onChange={(e) => setCycle(e.target.value)}
            >
              <option className="bg-surface-container-high" value="Q3 2026">Q3 2026 (Active Cycle)</option>
              <option className="bg-surface-container-high" value="Q2 2026">Q2 2026 (Audited)</option>
              <option className="bg-surface-container-high" value="Q1 2026">Q1 2026 (Archived)</option>
            </select>
          </div>

          <div className="flex items-center bg-surface-container px-sm py-xs rounded border border-[#30363d]/40">
            <span className="text-on-surface-variant mr-xs text-[11px] font-label-caps uppercase">Target CSE</span>
            <select 
              className="bg-transparent text-primary font-semibold focus:outline-none cursor-pointer"
              value={targetCse}
              onChange={(e) => setTargetCse(e.target.value)}
            >
              <option className="bg-surface-container-high" value="CSE-014">CSE-014 (NorthGrid Energy)</option>
              <option className="bg-surface-container-high" value="ALL">All Monitored CSEs (6)</option>
              <option className="bg-surface-container-high" value="CSE-007">CSE-007 (Apex Banking)</option>
              <option className="bg-surface-container-high" value="CSE-021">CSE-021 (TelcoBharat)</option>
              <option className="bg-surface-container-high" value="CSE-011">CSE-011 (RailSignalling Corp)</option>
            </select>
          </div>

          <button 
            className="flex items-center gap-xs px-sm py-xs rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-[#30363d]/40"
            onClick={() => showToast('Exporting Negative Space Dossier Package (ZIP/PDF)...')}
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export Package</span>
          </button>

          <button 
            className="flex items-center gap-xs px-sm py-xs rounded bg-primary-container hover:bg-primary-container/80 text-on-primary-container transition-all"
            onClick={() => showToast('Deduction engine re-synchronized with latest evidence intake.')}
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Sync Engine</span>
          </button>
        </div>
      </div>

      {/* SUMMARY METRICS STRIP (Bento Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-sm mb-lg">
        {/* Total Candidates */}
        <div className="bg-surface-container p-md rounded flex flex-col justify-between border border-[#30363d]/60">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Negative Space</span>
            <span className="material-symbols-outlined text-[16px] text-primary">data_loss_prevention</span>
          </div>
          <div className="mt-sm">
            <div className="font-headline-lg text-headline-lg text-primary font-bold">15</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">Across 6 CSE Enclaves</div>
          </div>
        </div>

        {/* Not Submitted */}
        <div className="bg-surface-container p-md rounded flex flex-col justify-between border border-[#30363d]/60">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Not Submitted</span>
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
          </div>
          <div className="mt-sm">
            <div className="font-headline-lg text-headline-lg text-tertiary font-bold">08</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">Telemetry not ingested</div>
          </div>
        </div>

        {/* Absent Confirmed */}
        <div className="bg-surface-container p-md rounded flex flex-col justify-between border border-[#30363d]/60">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Absent Confirmed</span>
            <span className="w-2 h-2 rounded-full bg-error"></span>
          </div>
          <div className="mt-sm">
            <div className="font-headline-lg text-headline-lg text-error font-bold">04</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">Source confirms absent</div>
          </div>
        </div>

        {/* Unknown */}
        <div className="bg-surface-container p-md rounded flex flex-col justify-between border border-[#30363d]/60">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Unknown / Blind</span>
            <span className="w-2 h-2 rounded-full bg-outline"></span>
          </div>
          <div className="mt-sm">
            <div className="font-headline-lg text-headline-lg text-outline font-bold">03</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">Telemetry inconclusive</div>
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-surface-container p-md rounded flex flex-col justify-between border border-[#30363d]/60">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">High Priority</span>
            <span className="material-symbols-outlined text-[16px] text-tertiary">priority_high</span>
          </div>
          <div className="mt-sm">
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold">06</div>
            <div className="font-body-sm text-body-sm text-tertiary">Actionable Items</div>
          </div>
        </div>

        {/* Active Selection (CSE-014 Context) */}
        <div className="bg-surface-container-high p-md rounded flex flex-col justify-between col-span-2 md:col-span-3 lg:col-span-1 border border-primary/40">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">CSE-014 Status</span>
            <Link to="/supervision/cse-assessments/CSE-014" className="text-primary hover:text-primary-fixed text-xs font-semibold flex items-center">
              Open CSE <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div className="mt-xs">
            <div className="flex items-baseline gap-xs">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">4</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Candidates</span>
            </div>
            <div className="font-code-sm text-code-sm text-on-surface-variant text-[11px] mt-xs">
              Readiness: <span className="text-secondary font-semibold">71%</span> | Gaps: <span className="text-tertiary font-semibold">7</span>
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL CENTERPIECE: PROCEDURAL PIPELINE DIAGRAM */}
      <div className="bg-surface-container p-md rounded mb-lg border border-[#30363d]/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-sm mb-md gap-xs">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-secondary text-[20px]">account_tree</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Negative Space Deduction Architecture</span>
          </div>
          <div className="flex items-center gap-sm font-code-sm text-code-sm text-on-surface-variant text-[11px]">
            <span>Model: NCIIPC-NSD-v2.1</span>
            <span>•</span>
            <span className="text-primary">Interactive Trace: CASE-1042 / CTRL-07</span>
          </div>
        </div>

        {/* Pipeline Step Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-sm relative">
          {/* Step 1 */}
          <div className="bg-surface-container-low p-sm rounded flex flex-col justify-between border border-[#30363d]/40">
            <div>
              <div className="flex items-center justify-between font-label-caps text-label-caps text-outline uppercase mb-xs">
                <span>Stage 01</span>
                <span className="material-symbols-outlined text-[14px] text-outline">gavel</span>
              </div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">Expected Evidence</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Control mandate, SOC Playbook, or regulation prescribes telemetry.
              </p>
            </div>
            <div className="mt-sm pt-xs bg-surface-container p-xs rounded font-code-sm text-code-sm text-[11px] text-primary">
              Mandate: CTRL-07 Escalation
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-surface-container-low p-sm rounded flex flex-col justify-between border border-[#30363d]/40">
            <div>
              <div className="flex items-center justify-between font-label-caps text-label-caps text-outline uppercase mb-xs">
                <span>Stage 02</span>
                <span className="material-symbols-outlined text-[14px] text-outline">rule</span>
              </div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">Expected Coverage</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Condition-triggered rule: Alert Level = Critical &amp; SLA &gt; 30m triggers escalation artifact.
              </p>
            </div>
            <div className="mt-sm pt-xs bg-surface-container p-xs rounded font-code-sm text-code-sm text-[11px] text-secondary">
              Condition: Triage &gt; P1
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-surface-container-low p-sm rounded flex flex-col justify-between border border-[#30363d]/40">
            <div>
              <div className="flex items-center justify-between font-label-caps text-label-caps text-outline uppercase mb-xs">
                <span>Stage 03</span>
                <span className="material-symbols-outlined text-[14px] text-outline">input</span>
              </div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">Observed Telemetry</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Submitted audit batch SUB-2026-0914 ingested. Alert &amp; Case found; Escalation record missing.
              </p>
            </div>
            <div className="mt-sm pt-xs bg-surface-container p-xs rounded font-code-sm text-code-sm text-[11px] text-tertiary">
              Found: Case, PCAP | Missed: ESC
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-surface-container-low p-sm rounded flex flex-col justify-between border border-[#30363d]/40">
            <div>
              <div className="flex items-center justify-between font-label-caps text-label-caps text-outline uppercase mb-xs">
                <span>Stage 04</span>
                <span className="material-symbols-outlined text-[14px] text-outline">category</span>
              </div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">Canonical Taxonomy</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Classifier categorizes the void into one of 5 defined state vectors.
              </p>
            </div>
            <div className="mt-sm pt-xs bg-surface-container p-xs rounded font-code-sm text-code-sm text-[11px] text-tertiary font-bold">
              State: NOT_SUBMITTED
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-surface-container-high p-sm rounded flex flex-col justify-between border border-primary/40">
            <div>
              <div className="flex items-center justify-between font-label-caps text-label-caps text-primary uppercase mb-xs font-bold">
                <span>Stage 05</span>
                <span className="material-symbols-outlined text-[14px] text-primary">flag</span>
              </div>
              <div className="font-body-md text-body-md font-semibold text-primary">Negative-Space Candidate</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Flagged for Examiner verification. Injunction request generated.
              </p>
            </div>
            <div className="mt-sm pt-xs bg-primary-container/20 p-xs rounded font-code-sm text-code-sm text-[11px] text-primary font-bold">
              Candidate: NS-0041 (Active)
            </div>
          </div>
        </div>

        {/* Canonical State Legend Pills */}
        <div className="mt-md pt-sm flex flex-wrap items-center justify-between gap-sm text-[11px] font-label-caps border-t border-[#30363d]/40">
          <span className="text-outline uppercase font-semibold">Canonical Evidence Taxonomy:</span>
          <div className="flex flex-wrap items-center gap-xs">
            <span className="px-sm py-0.5 rounded bg-secondary/15 text-secondary flex items-center gap-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>PRESENT: Telemetry verified in vault
            </span>
            <span className="px-sm py-0.5 rounded bg-tertiary/15 text-tertiary flex items-center gap-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>NOT_SUBMITTED: Expected by rule, not uploaded
            </span>
            <span className="px-sm py-0.5 rounded bg-error/15 text-error flex items-center gap-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>ABSENT_CONFIRMED: Source confirms no generation
            </span>
            <span className="px-sm py-0.5 rounded bg-outline/15 text-on-surface-variant flex items-center gap-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>UNKNOWN: Telemetry inconclusive
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-surface-container p-sm rounded mb-md flex flex-col lg:flex-row gap-sm items-stretch lg:items-center justify-between border border-[#30363d]/60">
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input 
            type="text"
            className="w-full bg-surface-container-lowest text-on-surface pl-9 pr-sm py-xs text-body-sm font-body-sm rounded focus:outline-none focus:bg-surface-container-high placeholder:text-outline border border-[#30363d]/40"
            placeholder="Search by Candidate ID, Case, Control, or Evidence type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-xs">
          <select 
            className="bg-surface-container-lowest text-on-surface text-body-sm font-body-sm px-sm py-xs rounded focus:outline-none cursor-pointer border border-[#30363d]/40"
            value={targetCse}
            onChange={(e) => setTargetCse(e.target.value)}
          >
            <option value="ALL">All CSEs</option>
            <option value="CSE-014">CSE-014 (NorthGrid)</option>
            <option value="CSE-007">CSE-007 (Apex Bank)</option>
            <option value="CSE-021">CSE-021 (TelcoBharat)</option>
            <option value="CSE-011">CSE-011 (RailSignalling)</option>
          </select>

          <select 
            className="bg-surface-container-lowest text-on-surface text-body-sm font-body-sm px-sm py-xs rounded focus:outline-none cursor-pointer border border-[#30363d]/40"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="ALL">All States</option>
            <option value="NOT_SUBMITTED">NOT_SUBMITTED</option>
            <option value="ABSENT_CONFIRMED">ABSENT_CONFIRMED</option>
            <option value="UNKNOWN">UNKNOWN</option>
            <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
          </select>

          <select 
            className="bg-surface-container-lowest text-on-surface text-body-sm font-body-sm px-sm py-xs rounded focus:outline-none cursor-pointer border border-[#30363d]/40"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <select 
            className="bg-surface-container-lowest text-on-surface text-body-sm font-body-sm px-sm py-xs rounded focus:outline-none cursor-pointer border border-[#30363d]/40"
            value={controlFilter}
            onChange={(e) => setControlFilter(e.target.value)}
          >
            <option value="ALL">All Controls</option>
            <option value="CTRL-07">CTRL-07 (Escalation)</option>
            <option value="CTRL-12">CTRL-12 (Validation)</option>
            <option value="CTRL-04">CTRL-04 (Closure)</option>
            <option value="CTRL-15">CTRL-15 (Access Log)</option>
            <option value="CTRL-19">CTRL-19 (SCADA Bastion)</option>
          </select>

          <button 
            className={`px-sm py-xs rounded text-body-sm font-body-sm font-medium transition-colors flex items-center gap-xs border border-[#30363d]/40 ${
              highPriorityOnly ? 'bg-tertiary text-on-tertiary-fixed font-bold' : 'bg-surface-container-high hover:bg-surface-container-highest text-tertiary'
            }`}
            onClick={() => setHighPriorityOnly(!highPriorityOnly)}
          >
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span>High Priority Only</span>
          </button>

          <button 
            className="px-sm py-xs rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-body-sm font-body-sm transition-colors"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        </div>
      </div>

      {/* MAIN SPLIT WORKSPACE: TABLE + DETAIL INSPECTOR DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-md items-start mb-lg">
        
        {/* DATA TABLE COLUMN */}
        <div className="xl:col-span-7 bg-surface-container rounded overflow-hidden shadow-sm border border-[#30363d]/60">
          <div className="p-sm bg-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Candidate Telemetry Voids</span>
              <span className="px-xs py-0.5 rounded bg-surface-container text-primary font-code-sm text-code-sm text-[11px]">
                Showing {filteredCandidates.length} of {candidates.length}
              </span>
            </div>
            <div className="text-[11px] font-label-caps text-outline">CLICK ROW TO INSPECT PROVENANCE</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low font-label-caps text-label-caps uppercase text-on-surface-variant">
                <tr>
                  <th className="py-xs px-sm">ID</th>
                  <th className="py-xs px-sm">CSE &amp; Sector</th>
                  <th className="py-xs px-sm">Case Ref</th>
                  <th className="py-xs px-sm">Expected Evidence</th>
                  <th className="py-xs px-sm">Control</th>
                  <th className="py-xs px-sm">Evidence State</th>
                  <th className="py-xs px-sm">Priority</th>
                  <th className="py-xs px-sm text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/40">
                {filteredCandidates.map(candidate => {
                  const isSelected = candidate.id === selectedCandidateId;
                  return (
                    <tr 
                      key={candidate.id}
                      className={`cursor-pointer hover:bg-surface-container-high transition-colors ${
                        isSelected ? 'bg-surface-container-highest border-l-2 border-primary' : 'bg-surface-container'
                      }`}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                    >
                      <td className="py-sm px-sm font-code-sm text-code-sm text-primary font-bold">{candidate.id}</td>
                      <td className="py-sm px-sm">
                        <div className="font-medium text-on-surface">{candidate.cseId}</div>
                        <div className="text-[11px] text-on-surface-variant">{candidate.cseName}</div>
                      </td>
                      <td className="py-sm px-sm font-code-sm text-code-sm text-on-surface">{candidate.caseRef}</td>
                      <td className="py-sm px-sm">
                        <div className="font-medium text-on-surface">{candidate.expectedEvidence}</div>
                        <div className="text-[11px] text-outline">{candidate.evidenceSubtype}</div>
                      </td>
                      <td className="py-sm px-sm font-code-sm text-code-sm text-on-surface-variant">{candidate.controlId}</td>
                      <td className="py-sm px-sm">
                        {candidate.evidenceState === 'NOT_SUBMITTED' && (
                          <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-tertiary/15 text-tertiary text-[11px] font-label-caps">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>NOT_SUBMITTED
                          </span>
                        )}
                        {candidate.evidenceState === 'ABSENT_CONFIRMED' && (
                          <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-error/15 text-error text-[11px] font-label-caps">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>ABSENT_CONFIRMED
                          </span>
                        )}
                        {candidate.evidenceState === 'UNKNOWN' && (
                          <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-outline/15 text-on-surface-variant text-[11px] font-label-caps">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>UNKNOWN
                          </span>
                        )}
                      </td>
                      <td className="py-sm px-sm">
                        <span className={`px-xs py-0.5 rounded text-[11px] font-bold ${
                          candidate.priority === 'HIGH' ? 'bg-tertiary/20 text-tertiary' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {candidate.priority}
                        </span>
                      </td>
                      <td className="py-sm px-sm text-right">
                        <button className={`px-xs py-1 rounded text-[11px] font-semibold ${
                          isSelected ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface'
                        }`}>
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CANDIDATE INSPECTION DRAWER */}
        <div className="xl:col-span-5 bg-surface-container rounded p-md flex flex-col gap-md border border-[#30363d]/60 shadow-md">
          {/* Drawer Header */}
          <div className="flex items-start justify-between pb-sm bg-surface-container-high p-sm rounded border border-[#30363d]/40">
            <div>
              <div className="flex items-center gap-xs font-code-sm text-code-sm">
                <span className="text-primary font-bold text-base">{activeCandidate.id}</span>
                <span className="text-outline">|</span>
                <span className="text-secondary font-semibold">{activeCandidate.cseId} ({activeCandidate.cseName})</span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Case: <span className="text-on-surface font-semibold">{activeCandidate.caseRef}</span> • Control: <span className="text-primary font-semibold">{activeCandidate.controlId}</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-xs px-xs py-0.5 rounded bg-tertiary/20 text-tertiary text-[11px] font-label-caps uppercase font-bold">
              {activeCandidate.evidenceState}
            </span>
          </div>

          {/* SECTION A: Analytical Logic Trace */}
          <div className="bg-surface-container-low p-sm rounded border border-[#30363d]/40">
            <div className="font-label-caps text-label-caps uppercase text-primary font-bold mb-xs flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">psychology_alt</span>
              Analytical Ingestion Chain
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant space-y-xs">
              <div className="flex items-start gap-xs">
                <span className="font-code-sm text-code-sm text-outline">01</span>
                <div><strong className="text-on-surface">Control Presumption:</strong> NCIIPC Rule 12(b) &amp; SOC SOP §4.2 mandate Tier-2 Supervisor Sign-off for Critical Alerts.</div>
              </div>
              <div className="flex items-start gap-xs">
                <span className="font-code-sm text-code-sm text-outline">02</span>
                <div><strong className="text-on-surface">Triage Severity Match:</strong> CASE-1042 was classified as <span className="text-error font-semibold">P1 / CRITICAL</span>.</div>
              </div>
              <div className="flex items-start gap-xs">
                <span className="font-code-sm text-code-sm text-outline">03</span>
                <div><strong className="text-on-surface">Telemetry Parsing:</strong> Submission batch <code className="font-code-sm text-code-sm text-primary">SUB-2026-0914</code> contains alert logs, PCAP, and ticket memo.</div>
              </div>
              <div className="flex items-start gap-xs">
                <span className="font-code-sm text-code-sm text-outline">04</span>
                <div><strong className="text-tertiary">Negative Space Finding:</strong> Escalation form artifact <code className="font-code-sm text-code-sm text-tertiary">ESC-221</code> is missing from repository.</div>
              </div>
            </div>
          </div>

          {/* SECTION B: Non-Accusatory Context & Possible Explanations */}
          <div className="bg-surface-container-low p-sm rounded border border-[#30363d]/40">
            <div className="flex items-center justify-between mb-xs">
              <span className="font-label-caps text-label-caps uppercase text-outline font-bold">Candidate Hypotheses (Non-Accusatory)</span>
              <span className="font-code-sm text-code-sm text-secondary text-[11px]">Machine Confidence: {activeCandidate.machineConfidence}%</span>
            </div>
            <div className="space-y-xs text-body-sm font-body-sm">
              {activeCandidate.hypotheses.map((hyp, idx) => (
                <label 
                  key={idx}
                  className="flex items-start gap-sm p-xs rounded bg-surface-container cursor-pointer hover:bg-surface-container-high transition-colors border border-[#30363d]/30"
                >
                  <input 
                    type="radio" 
                    name="hypothesis"
                    className="mt-1 accent-primary"
                    checked={selectedHypothesisIdx === idx}
                    onChange={() => setSelectedHypothesisIdx(idx)}
                  />
                  <div className="flex-1">
                    <span className="text-on-surface font-medium">{hyp.text}</span>
                    <p className="text-on-surface-variant text-[11px]">{hyp.subtext}</p>
                  </div>
                  <span className="font-code-sm text-code-sm text-secondary text-[11px] font-bold">{hyp.pct}%</span>
                </label>
              ))}
            </div>
            <div className="mt-xs pt-xs font-code-sm text-code-sm text-[11px] text-tertiary flex items-center gap-xs">
              <span className="material-symbols-outlined text-[13px]">info</span>
              Missing evidence does NOT confirm process violation. Field inquiry required.
            </div>
          </div>

          {/* SECTION C: Surrounding Evidence Traceability */}
          <div className="bg-surface-container-low p-sm rounded border border-[#30363d]/40">
            <div className="font-label-caps text-label-caps uppercase text-outline font-bold mb-xs">
              Surrounding Evidence Traceability Chain
            </div>
            <div className="space-y-xs font-code-sm text-code-sm text-[12px]">
              <div className="flex items-center justify-between p-xs rounded bg-surface-container border border-[#30363d]/20">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-secondary text-[14px]">check_circle</span>
                  <span className="text-on-surface font-medium">CASE-1042 (Case Core Record)</span>
                </div>
                <span className="text-secondary font-bold">PRESENT / VERIFIED</span>
              </div>
              <div className="flex items-center justify-between p-xs rounded bg-surface-container border border-[#30363d]/20">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-secondary text-[14px]">check_circle</span>
                  <span className="text-on-surface font-medium">INV-338 (SOC Investigation Log)</span>
                </div>
                <span className="text-secondary font-bold">PRESENT / VERIFIED</span>
              </div>
              <div className="flex items-center justify-between p-xs rounded bg-surface-container border border-[#30363d]/20">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-secondary text-[14px]">check_circle</span>
                  <span className="text-on-surface font-medium">EVD-742 (Network PCAP Telemetry)</span>
                </div>
                <span className="text-secondary font-bold">PRESENT / VERIFIED</span>
              </div>
              <div className="flex items-center justify-between p-xs rounded bg-tertiary/10 border border-tertiary/30">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-tertiary text-[14px]">help</span>
                  <span className="text-tertiary font-bold">ESC-221 (Escalation Sign-off)</span>
                </div>
                <span className="text-tertiary font-bold">NOT_SUBMITTED</span>
              </div>
            </div>
            <div className="mt-sm flex items-center gap-xs">
              <button 
                className="flex-1 px-xs py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-code-sm text-code-sm text-[11px] text-center transition-colors border border-[#30363d]/40"
                onClick={() => showToast('SHA-256 Provenance Ledger verified against FIPS repository.')}
              >
                SHA-256 Provenance
              </button>
              <button 
                className="flex-1 px-xs py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-code-sm text-code-sm text-[11px] text-center transition-colors border border-[#30363d]/40"
                onClick={() => showToast('Raw Ingestion Manifest (JSON) copied to clipboard.')}
              >
                Raw Telemetry JSON
              </button>
            </div>
          </div>

          {/* SECTION D: Signal Fusion & Cross-Module Links */}
          <div className="bg-surface-container-low p-sm rounded border border-[#30363d]/40">
            <div className="font-label-caps text-label-caps uppercase text-outline font-bold mb-xs">
              Signal Fusion &amp; Cross-Module Links
            </div>
            <div className="grid grid-cols-2 gap-xs font-body-sm text-body-sm">
              <Link 
                to="/analytics/execution-gaps" 
                className="p-xs rounded bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col justify-between border border-[#30363d]/30"
              >
                <span className="text-[11px] font-label-caps text-outline uppercase">Execution Gap</span>
                <span className="text-tertiary font-medium text-xs mt-xs flex items-center justify-between">
                  GAP-0071 (Missing Step)
                  <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
                </span>
              </Link>
              <Link 
                to="/findings/FND-0142" 
                className="p-xs rounded bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col justify-between border border-[#30363d]/30"
              >
                <span className="text-[11px] font-label-caps text-outline uppercase">Related Finding</span>
                <span className="text-primary font-medium text-xs mt-xs flex items-center justify-between">
                  FND-0142 (Escalation Defect)
                  <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
                </span>
              </Link>
            </div>
          </div>

          {/* SECTION E: Examiner Human-in-the-Loop Action Panel */}
          <div className="bg-surface-container-high p-sm rounded border border-primary/30">
            <div className="font-label-caps text-label-caps uppercase text-secondary font-bold mb-xs flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">shield_person</span>
              Examiner Supervisory Determination
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-xs mb-sm">
              <button 
                className="px-xs py-1.5 rounded bg-primary-container hover:bg-primary-container/80 text-on-primary-container font-body-sm text-body-sm font-semibold transition-colors text-center"
                onClick={() => showToast(`Validated Negative Space ${activeCandidate.id} as candidate deficiency.`)}
              >
                Validate
              </button>
              <button 
                className="px-xs py-1.5 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm transition-colors text-center border border-[#30363d]/40"
                onClick={() => showToast(`Qualified Negative Space ${activeCandidate.id} with operational context.`)}
              >
                Qualify
              </button>
              <button 
                className="px-xs py-1.5 rounded bg-surface-container hover:bg-surface-container-highest text-error font-body-sm text-body-sm transition-colors text-center border border-error/30"
                onClick={() => showToast(`Rejected candidate ${activeCandidate.id} (Mitigated or exempted).`)}
              >
                Reject
              </button>
              <button 
                className="px-xs py-1.5 rounded bg-tertiary hover:bg-tertiary/90 text-on-tertiary-fixed font-body-sm text-body-sm font-semibold transition-colors text-center"
                onClick={handleDispatchInjunction}
              >
                Request
              </button>
            </div>

            {/* Inline Evidence Injunction Form */}
            <div className="bg-surface-container-lowest p-sm rounded space-y-xs border border-[#30363d]/40">
              <div className="font-label-caps text-label-caps text-on-surface font-semibold uppercase">
                Official Evidence Injunction Notice (NCIIPC Rule 14)
              </div>
              <div>
                <label className="font-code-sm text-code-sm text-outline text-[11px] block">Evidence Specification</label>
                <input 
                  type="text"
                  className="w-full bg-surface-container px-xs py-1 text-on-surface font-code-sm text-code-sm text-xs rounded focus:outline-none border border-[#30363d]/40"
                  value={evidenceSpec}
                  onChange={(e) => setEvidenceSpec(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-xs">
                <div>
                  <label className="font-code-sm text-code-sm text-outline text-[11px] block">Statutory Basis</label>
                  <input 
                    type="text" 
                    readOnly
                    className="w-full bg-surface-container px-xs py-1 text-on-surface font-code-sm text-code-sm text-xs rounded focus:outline-none border border-[#30363d]/40"
                    value="NCIIPC Rule 12(b) / Critical Infra"
                  />
                </div>
                <div>
                  <label className="font-code-sm text-code-sm text-outline text-[11px] block">Recipient Channel</label>
                  <input 
                    type="text" 
                    readOnly
                    className="w-full bg-surface-container px-xs py-1 text-on-surface font-code-sm text-code-sm text-xs rounded focus:outline-none border border-[#30363d]/40"
                    value="NorthGrid CISO Enclave Desk"
                  />
                </div>
              </div>
              <div>
                <label className="font-code-sm text-code-sm text-outline text-[11px] block">Examiner Adjudication Notes</label>
                <textarea 
                  rows={2}
                  className="w-full bg-surface-container p-xs text-on-surface font-body-sm text-body-sm text-xs rounded focus:outline-none placeholder:text-outline border border-[#30363d]/40"
                  placeholder="Record examiner reasoning prior to sending request..."
                  value={adjudicationNotes}
                  onChange={(e) => setAdjudicationNotes(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between pt-xs">
                <span className="text-[11px] font-code-sm text-outline">Audit Entry: NC-4029-LOG</span>
                <button 
                  className="px-sm py-1 rounded bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-xs"
                  onClick={handleDispatchInjunction}
                >
                  <span className="material-symbols-outlined text-[14px]">send</span>
                  <span>Dispatch Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* EVIDENCE COVERAGE & CONTROL BREAKDOWN (Analytics Mosaic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
        {/* Coverage by Control */}
        <div className="bg-surface-container p-md rounded flex flex-col justify-between border border-[#30363d]/60">
          <div>
            <div className="flex items-center justify-between mb-sm">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Evidence Coverage</span>
              <span className="font-code-sm text-code-sm text-primary">By Prescribed Control</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
              Percentage of required evidence artifacts confirmed present across evaluated cases.
            </p>
            <div className="space-y-sm font-code-sm text-code-sm text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-on-surface font-medium">CTRL-07 (Escalation Protocol)</span>
                  <span className="text-tertiary font-bold">80%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-on-surface font-medium">CTRL-12 (Response Validation)</span>
                  <span className="text-secondary font-bold">75%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-on-surface font-medium">CTRL-04 (Investigation Closure)</span>
                  <span className="text-secondary font-bold">83%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '83%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-on-surface font-medium">CTRL-15 (Identity Audit Ledger)</span>
                  <span className="text-secondary font-bold">100%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-on-surface font-medium">CTRL-19 (SCADA Bastion Recording)</span>
                  <span className="text-error font-bold">43%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-error h-full rounded-full" style={{ width: '43%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-md pt-sm font-label-caps text-label-caps text-outline uppercase border-t border-[#30363d]/40">
            Vulnerability Index: High void rate in CTRL-19 SCADA Enclaves
          </div>
        </div>

        {/* Evidence State Distribution */}
        <div className="bg-surface-container p-md rounded flex flex-col justify-between border border-[#30363d]/60">
          <div>
            <div className="flex items-center justify-between mb-sm">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Taxonomy Distribution</span>
              <span className="font-code-sm text-code-sm text-outline">N=120 Artifacts</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
              Proportion of telemetry evidence classified by canonical supervisory state.
            </p>
            <div className="flex items-center justify-center my-md">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                <path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="72, 100" strokeLinecap="round" strokeWidth="4"></path>
                <path className="text-tertiary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="11, 100" strokeDashoffset="-72" strokeWidth="4"></path>
                <path className="text-error" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="7, 100" strokeDashoffset="-83" strokeWidth="4"></path>
                <path className="text-outline" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="6, 100" strokeDashoffset="-90" strokeWidth="4"></path>
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-xs font-code-sm text-code-sm text-[11px]">
              <div className="flex items-center gap-xs">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="text-on-surface">PRESENT: 72%</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="text-on-surface">NOT_SUBMITTED: 11%</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                <span className="text-on-surface">ABSENT: 7%</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="w-2 h-2 rounded-full bg-outline"></span>
                <span className="text-on-surface">UNKNOWN: 6%</span>
              </div>
            </div>
          </div>
          <div className="mt-md pt-sm font-label-caps text-label-caps text-outline uppercase border-t border-[#30363d]/40">
            24% Aggregate Non-Positive Space Telemetry
          </div>
        </div>

        {/* Negative Space by CSE */}
        <div className="bg-surface-container p-md rounded flex flex-col justify-between border border-[#30363d]/60">
          <div>
            <div className="flex items-center justify-between mb-sm">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Candidates by CSE</span>
              <span className="font-code-sm text-code-sm text-secondary">National Sector Rank</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
              Enclave distribution of detected negative space candidates across critical sectors.
            </p>
            <div className="space-y-sm font-body-sm text-body-sm">
              <div className="flex items-center justify-between p-xs rounded bg-surface-container-high border border-primary/30">
                <div className="flex items-center gap-xs">
                  <span className="font-code-sm text-code-sm text-primary font-bold">CSE-014</span>
                  <span className="text-on-surface">NorthGrid Energy</span>
                </div>
                <span className="px-xs py-0.5 rounded bg-tertiary/20 text-tertiary font-bold font-code-sm text-code-sm text-xs">4 Candidates</span>
              </div>
              <div className="flex items-center justify-between p-xs rounded bg-surface-container-low border border-[#30363d]/40">
                <div className="flex items-center gap-xs">
                  <span className="font-code-sm text-code-sm text-outline font-bold">CSE-007</span>
                  <span className="text-on-surface">State Bank of Bharat</span>
                </div>
                <span className="px-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-code-sm text-code-sm text-xs">3 Candidates</span>
              </div>
              <div className="flex items-center justify-between p-xs rounded bg-surface-container-low border border-[#30363d]/40">
                <div className="flex items-center gap-xs">
                  <span className="font-code-sm text-code-sm text-outline font-bold">CSE-021</span>
                  <span className="text-on-surface">Videsh Sanchar Corp</span>
                </div>
                <span className="px-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-code-sm text-code-sm text-xs">3 Candidates</span>
              </div>
              <div className="flex items-center justify-between p-xs rounded bg-surface-container-low border border-[#30363d]/40">
                <div className="flex items-center gap-xs">
                  <span className="font-code-sm text-code-sm text-outline font-bold">CSE-011</span>
                  <span className="text-on-surface">Reserve Clearing House</span>
                </div>
                <span className="px-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-code-sm text-code-sm text-xs">2 Candidates</span>
              </div>
            </div>
          </div>
          <div className="mt-md pt-sm font-label-caps text-label-caps text-outline uppercase border-t border-[#30363d]/40">
            Energy Sector accounts for 27% of all active negative space alerts
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
