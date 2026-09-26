import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface SampleCase {
  id: string;
  cseId: string;
  cseName: string;
  sector: string;
  primaryVector: string;
  contributingSignals: string[];
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceStrength: 'Strong' | 'Moderate' | 'Weak';
  evidenceList: string;
  method: 'Risk-Based' | 'Evidence-Based' | 'Anomaly-Based' | 'Coverage-Based' | 'Recurrence-Based' | 'Baseline';
}

interface QueuedExamination {
  caseId: string;
  targetCse: string;
  trigger: string;
  assignedGroup: string;
  status: string;
}

export const SamplingPage: React.FC = () => {
  // Screen Filters
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Q3-2026');
  const [selectedCse, setSelectedCse] = useState<string>('CSE-014');
  const [activeMethodWeight, setActiveMethodWeight] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  // Multi-selection checkboxes
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  
  // Focused case in right inspector drawer
  const [focusedCaseId, setFocusedCaseId] = useState<string>('CASE-1042');

  // Examination set queue
  const [examinationQueue, setExaminationQueue] = useState<QueuedExamination[]>([
    {
      caseId: 'CASE-1042',
      targetCse: 'CSE-014 (Energy)',
      trigger: "Execution Gap GAP-0071 / Recurrence Q3 '26",
      assignedGroup: 'Examiner 07 (Air-gap Unit)',
      status: 'Ready for Examination'
    },
    {
      caseId: 'CASE-1037',
      targetCse: 'CSE-014 (Energy)',
      trigger: 'Negative Space NS-0038 / Closure evidence missing',
      assignedGroup: 'Examiner 02 (Energy Grid Spec)',
      status: 'Ready for Examination'
    }
  ]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const sampleCases: SampleCase[] = [
    {
      id: 'CASE-1042',
      cseId: 'CSE-014',
      cseName: 'NorthGrid Transmission',
      sector: 'Energy / Transmission',
      primaryVector: 'Repeated execution gap with missing escalation telemetry to NCIIPC',
      contributingSignals: ['GAP-0071 Escalation', 'NS-0041 Esc Telemetry'],
      priority: 'CRITICAL',
      evidenceStrength: 'Strong',
      evidenceList: 'EVD-742, EVD-761',
      method: 'Risk-Based'
    },
    {
      id: 'CASE-1037',
      cseId: 'CSE-014',
      cseName: 'NorthGrid Transmission',
      sector: 'Energy / Transmission',
      primaryVector: 'Missing investigation closure evidence & response validation docket',
      contributingSignals: ['NS-0038 Closure Doc'],
      priority: 'HIGH',
      evidenceStrength: 'Moderate',
      evidenceList: 'EVD-688',
      method: 'Evidence-Based'
    },
    {
      id: 'CASE-1021',
      cseId: 'CSE-014',
      cseName: 'NorthGrid Transmission',
      sector: 'Energy / Transmission',
      primaryVector: 'Non-conforming investigation step skip before containment execution',
      contributingSignals: ['PD-0031 Step Bypass'],
      priority: 'HIGH',
      evidenceStrength: 'Strong',
      evidenceList: 'EVD-594, EVD-601',
      method: 'Anomaly-Based'
    },
    {
      id: 'CASE-1008',
      cseId: 'CSE-014',
      cseName: 'NorthGrid Transmission',
      sector: 'Energy / Transmission',
      primaryVector: 'Unverified privileged bastion log submission with mismatched checksum',
      contributingSignals: ['NS-0031 Bastion Hash'],
      priority: 'MEDIUM',
      evidenceStrength: 'Moderate',
      evidenceList: 'EVD-512',
      method: 'Risk-Based'
    },
    {
      id: 'CASE-0987',
      cseId: 'CSE-007',
      cseName: 'State Bank of Bharat',
      sector: 'Banking / Core',
      primaryVector: 'Telemetry gap on perimeter authentication switch during critical patching',
      contributingSignals: ['CTRL-04 Perimeter Gap'],
      priority: 'HIGH',
      evidenceStrength: 'Moderate',
      evidenceList: 'EVD-441',
      method: 'Coverage-Based'
    },
    {
      id: 'CASE-0912',
      cseId: 'CSE-021',
      cseName: 'Vanguard Telecom',
      sector: 'Telecom / Backbone',
      primaryVector: 'Root escalation failure reappearing post-Q1 remediation sign-off',
      contributingSignals: ['Hist. Recurrence (3x)'],
      priority: 'HIGH',
      evidenceStrength: 'Strong',
      evidenceList: 'EVD-311, EVD-320',
      method: 'Recurrence-Based'
    },
    {
      id: 'CASE-0844',
      cseId: 'CSE-011',
      cseName: 'TransRail Intermodal',
      sector: 'Transport / Rail',
      primaryVector: 'Extended containment lag (>4.2 hrs) without supervisor sign-off recorded',
      contributingSignals: ['PD-0019 Delay'],
      priority: 'MEDIUM',
      evidenceStrength: 'Moderate',
      evidenceList: 'EVD-214',
      method: 'Risk-Based'
    },
    {
      id: 'CASE-0792',
      cseId: 'CSE-003',
      cseName: 'Apex Lifesciences',
      sector: 'Healthcare / Hospital',
      primaryVector: 'Discrepancy between SIEM ingest timestamp and analyst manual docket',
      contributingSignals: ['CNS-0012 Inconsistency'],
      priority: 'MEDIUM',
      evidenceStrength: 'Weak',
      evidenceList: 'EVD-188',
      method: 'Evidence-Based'
    },
    {
      id: 'CASE-1052',
      cseId: 'CSE-018',
      cseName: 'HydroGrid Generation',
      sector: 'Energy / Hydro',
      primaryVector: 'Neutral control baseline validation check without flag triggers',
      contributingSignals: ['Control Group Ref'],
      priority: 'LOW',
      evidenceStrength: 'Strong',
      evidenceList: 'EVD-802, EVD-805',
      method: 'Baseline'
    }
  ];

  const filteredCases = sampleCases.filter(c => {
    if (selectedCse !== 'ALL' && c.cseId !== selectedCse) return false;
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
    if (methodFilter !== 'ALL' && c.method !== methodFilter) return false;
    if (activeMethodWeight !== 'ALL' && c.method !== activeMethodWeight) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchCse = c.cseId.toLowerCase().includes(q);
      const matchSector = c.sector.toLowerCase().includes(q);
      const matchDesc = c.primaryVector.toLowerCase().includes(q);
      if (!matchId && !matchCse && !matchSector && !matchDesc) return false;
    }
    return true;
  });

  const activeFocus = sampleCases.find(c => c.id === focusedCaseId) || sampleCases[0];

  const handleToggleSelectAll = () => {
    if (selectedCaseIds.length === filteredCases.length) {
      setSelectedCaseIds([]);
    } else {
      setSelectedCaseIds(filteredCases.map(c => c.id));
    }
  };

  const handleToggleCase = (id: string) => {
    setSelectedCaseIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectTopFive = () => {
    const top5 = sampleCases
      .filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH')
      .slice(0, 5)
      .map(c => c.id);
    setSelectedCaseIds(top5);
    showToast('Selected top 5 high-priority supervisory candidates.');
  };

  const handleAddBatchToQueue = () => {
    if (selectedCaseIds.length === 0) {
      showToast('Please select at least one case to add to the examination set.');
      return;
    }
    const newItems: QueuedExamination[] = [];
    selectedCaseIds.forEach(id => {
      if (!examinationQueue.some(q => q.caseId === id)) {
        const c = sampleCases.find(item => item.id === id);
        if (c) {
          newItems.push({
            caseId: c.id,
            targetCse: `${c.cseId} (${c.sector.split('/')[0].trim()})`,
            trigger: c.primaryVector,
            assignedGroup: 'Examiner 07 (Air-gap Unit)',
            status: 'Ready for Examination'
          });
        }
      }
    });
    setExaminationQueue([...examinationQueue, ...newItems]);
    setSelectedCaseIds([]);
    showToast(`Added ${newItems.length} cases to active supervisory examination queue.`);
  };

  const handleAddSingleToQueue = (caseId: string) => {
    if (!examinationQueue.some(q => q.caseId === caseId)) {
      const c = sampleCases.find(item => item.id === caseId);
      if (c) {
        setExaminationQueue([
          ...examinationQueue,
          {
            caseId: c.id,
            targetCse: `${c.cseId} (${c.sector.split('/')[0].trim()})`,
            trigger: c.primaryVector,
            assignedGroup: 'Examiner 07 (Air-gap Unit)',
            status: 'Ready for Examination'
          }
        ]);
        showToast(`Case ${caseId} added to active supervisory queue.`);
      }
    } else {
      showToast(`Case ${caseId} is already in the examination set.`);
    }
  };

  const handleRemoveQueue = (caseId: string) => {
    setExaminationQueue(prev => prev.filter(q => q.caseId !== caseId));
    showToast(`Case ${caseId} removed from examination queue.`);
  };

  return (
    <div className="flex flex-col w-full pb-xl space-y-md text-on-surface antialiased">
      
      {/* TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col gap-sm mb-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-xs font-code-sm text-code-sm text-on-surface-variant">
            <span className="text-primary font-semibold">SAT-SA</span>
            <span>/</span>
            <span className="text-on-surface-variant">Supervision</span>
            <span>/</span>
            <span className="text-on-surface font-medium">Recommended Samples</span>
          </div>
          <div className="flex items-center gap-xs text-outline font-code-sm text-code-sm">
            <span className="material-symbols-outlined text-[14px] text-secondary">memory</span>
            <span>ENGINE RUNTIME: BUILD 4.9.22-AIRGAP</span>
          </div>
        </div>

        {/* Title and Toolbar row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md pt-xs">
          <div>
            <div className="flex items-center gap-sm">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                Supervisory Sampling Engine
              </h1>
              <span className="px-sm py-[2px] rounded bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase tracking-wider font-semibold">
                Live Pipeline
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mt-xs">
              Evidence-driven case selection engine for focused supervisory examination. Identifies high-leverage examination targets from operational dossiers across critical sector entities.
            </p>
          </div>

          {/* Action buttons & Selector controls */}
          <div className="flex flex-wrap items-center gap-xs">
            <div className="bg-surface-container px-sm py-xs rounded flex items-center gap-xs border border-[#30363d]/40">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Period:</span>
              <select 
                className="bg-transparent font-code-sm text-code-sm text-on-surface focus:outline-none cursor-pointer"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="Q3-2026">Q3 2026</option>
                <option value="Q2-2026">Q2 2026</option>
                <option value="Q1-2026">Q1 2026</option>
              </select>
            </div>

            <div className="bg-surface-container px-sm py-xs rounded flex items-center gap-xs border border-[#30363d]/40">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Target CSE:</span>
              <select 
                className="bg-transparent font-code-sm text-code-sm text-primary font-medium focus:outline-none cursor-pointer"
                value={selectedCse}
                onChange={(e) => setSelectedCse(e.target.value)}
              >
                <option value="ALL">All Monitored CSEs (6)</option>
                <option value="CSE-014">CSE-014 (NorthGrid Energy)</option>
                <option value="CSE-007">CSE-007 (Apex Banking)</option>
                <option value="CSE-021">CSE-021 (Vanguard Telecom)</option>
                <option value="CSE-011">CSE-011 (TransRail Intermodal)</option>
                <option value="CSE-003">CSE-003 (Apex Lifesciences)</option>
                <option value="CSE-018">CSE-018 (HydroGrid Generation)</option>
              </select>
            </div>

            <button 
              className="flex items-center gap-xs px-sm py-xs rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm transition-colors cursor-pointer border border-[#30363d]/40"
              onClick={() => showToast('Sampling weights recalculated against latest telemetry batches.')}
            >
              <span className="material-symbols-outlined text-[16px] text-primary">autorenew</span>
              <span>Recalculate Samples</span>
            </button>

            <button 
              className="flex items-center gap-xs px-md py-xs rounded bg-primary text-on-primary hover:bg-primary/90 font-body-sm text-body-sm font-semibold transition-colors shadow-sm cursor-pointer"
              onClick={() => showToast('Exporting Official Supervisory Sampling Order (PDF)...')}
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export Mandate (PDF)</span>
            </button>
          </div>
        </div>

        {/* Statutory supervisory banner */}
        <div className="mt-xs p-sm bg-surface-container-low rounded flex items-start gap-sm border border-[#30363d]/60">
          <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-[1px]">shield_with_heart</span>
          <div className="flex-1">
            <span className="font-code-sm text-code-sm text-tertiary font-bold tracking-wide">
              STATUTORY SUPERVISORY PROTOCOL // NCIIPC DIRECTIVE 2026-B:
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant ml-xs">
              Sampling recommendations prioritize operational cases for human examiner scrutiny based on observed evidentiary signals and non-reporting anomalies. Selection does not constitute an automatic regulatory sanction or confirmed operational breach.
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-xs font-code-sm text-code-sm text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>MANDATE ACTIVE</span>
          </div>
        </div>
      </div>

      {/* SUMMARY METRICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-sm mb-lg">
        {/* Card 1 */}
        <div className="p-md rounded bg-surface-container-low flex flex-col justify-between border border-[#30363d]/60">
          <div className="flex items-center justify-between mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">Cases Analysed</span>
            <span className="material-symbols-outlined text-outline text-[18px]">inventory_2</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">100</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">dossiers</span>
          </div>
          <div className="mt-xs pt-xs font-code-sm text-code-sm text-on-surface-variant flex items-center justify-between border-t border-[#30363d]/40">
            <span>CSE-014 scope:</span>
            <span className="text-primary font-semibold">12 cases</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-md rounded bg-surface-container-low flex flex-col justify-between border border-[#30363d]/60">
          <div className="flex items-center justify-between mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">Recommended</span>
            <span className="material-symbols-outlined text-primary text-[18px]">fact_check</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md font-bold text-primary">20</span>
            <span className="font-code-sm text-code-sm text-secondary font-medium">20.0% ratio</span>
          </div>
          <div className="mt-xs pt-xs font-code-sm text-code-sm text-on-surface-variant flex items-center justify-between border-t border-[#30363d]/40">
            <span>CSE-014 scope:</span>
            <span className="text-primary font-semibold">4 cases</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-md rounded bg-surface-container-low flex flex-col justify-between border border-[#30363d]/60">
          <div className="flex items-center justify-between mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-error font-semibold">High / Critical</span>
            <span className="material-symbols-outlined text-error text-[18px]">priority_high</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md font-bold text-error">8</span>
            <span className="font-code-sm text-code-sm text-error/80">urgent queue</span>
          </div>
          <div className="mt-xs pt-xs font-code-sm text-code-sm text-on-surface-variant flex items-center justify-between border-t border-[#30363d]/40">
            <span>CSE-014 Critical:</span>
            <span className="text-error font-semibold">2 cases</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-md rounded bg-surface-container-low flex flex-col justify-between border border-[#30363d]/60">
          <div className="flex items-center justify-between mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">Evidence-Based</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">contract_edit</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md font-bold text-secondary">12</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">neg space/gap</span>
          </div>
          <div className="mt-xs pt-xs font-code-sm text-code-sm text-on-surface-variant flex items-center justify-between border-t border-[#30363d]/40">
            <span>Telemetry gaps:</span>
            <span className="text-secondary font-semibold">7 triggers</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="p-md rounded bg-surface-container-low flex flex-col justify-between border border-[#30363d]/60">
          <div className="flex items-center justify-between mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-tertiary font-semibold">Recurring Candidates</span>
            <span className="material-symbols-outlined text-tertiary text-[18px]">history</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md font-bold text-tertiary">5</span>
            <span className="font-code-sm text-code-sm text-tertiary-fixed-dim">persistence</span>
          </div>
          <div className="mt-xs pt-xs font-code-sm text-code-sm text-on-surface-variant flex items-center justify-between border-t border-[#30363d]/40">
            <span>Multi-quarter:</span>
            <span className="text-on-surface font-semibold">Q2 '25 - Q3 '26</span>
          </div>
        </div>

        {/* Card 6 */}
        <div className="p-md rounded bg-surface-container-low flex flex-col justify-between border border-[#30363d]/60">
          <div className="flex items-center justify-between mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">Selected for Review</span>
            <span className="material-symbols-outlined text-primary text-[18px]">assignment_turned_in</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md font-bold text-primary">
              {selectedCaseIds.length}
            </span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">/ 20 queued</span>
          </div>
          <div className="mt-xs pt-xs font-code-sm text-code-sm text-on-surface-variant flex items-center justify-between border-t border-[#30363d]/40">
            <span>Target Quota:</span>
            <span className="text-on-surface font-semibold">5 cases</span>
          </div>
        </div>
      </div>

      {/* SAMPLING METHODOLOGY SELECTOR & HORIZONTAL ENGINE PIPELINE */}
      <div className="p-md rounded bg-surface-container mb-lg flex flex-col gap-md border border-[#30363d]/60">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-sm">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
            <span className="font-label-caps text-label-caps uppercase font-bold text-on-surface tracking-wider">
              Active Methodology Weights:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-xs">
            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm font-semibold flex items-center gap-xs transition-colors ${
                activeMethodWeight === 'ALL' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setActiveMethodWeight('ALL')}
            >
              <span>All Categories</span>
              <span className="px-1 rounded bg-surface-container-lowest text-primary text-[10px]">20</span>
            </button>
            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm flex items-center gap-xs transition-colors ${
                activeMethodWeight === 'Risk-Based' ? 'bg-primary-container text-on-primary-container font-semibold' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setActiveMethodWeight('Risk-Based')}
            >
              <span>Risk-Based</span>
              <span className="px-1 rounded bg-surface-container-lowest text-primary text-[10px]">8</span>
            </button>
            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm flex items-center gap-xs transition-colors ${
                activeMethodWeight === 'Evidence-Based' ? 'bg-primary-container text-on-primary-container font-semibold' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setActiveMethodWeight('Evidence-Based')}
            >
              <span>Evidence-Based</span>
              <span className="px-1 rounded bg-surface-container-lowest text-on-surface-variant text-[10px]">4</span>
            </button>
            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm flex items-center gap-xs transition-colors ${
                activeMethodWeight === 'Coverage-Based' ? 'bg-primary-container text-on-primary-container font-semibold' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setActiveMethodWeight('Coverage-Based')}
            >
              <span>Coverage-Based</span>
              <span className="px-1 rounded bg-surface-container-lowest text-on-surface-variant text-[10px]">3</span>
            </button>
            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm flex items-center gap-xs transition-colors ${
                activeMethodWeight === 'Recurrence-Based' ? 'bg-primary-container text-on-primary-container font-semibold' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setActiveMethodWeight('Recurrence-Based')}
            >
              <span>Recurrence-Based</span>
              <span className="px-1 rounded bg-surface-container-lowest text-on-surface-variant text-[10px]">2</span>
            </button>
            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm flex items-center gap-xs transition-colors ${
                activeMethodWeight === 'Anomaly-Based' ? 'bg-primary-container text-on-primary-container font-semibold' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setActiveMethodWeight('Anomaly-Based')}
            >
              <span>Anomaly-Based</span>
              <span className="px-1 rounded bg-surface-container-lowest text-on-surface-variant text-[10px]">1</span>
            </button>
          </div>
        </div>

        {/* Visual Centerpiece: Sampling Pipeline Flow Diagram */}
        <div className="p-sm rounded bg-surface-container-lowest overflow-x-auto border border-[#30363d]/40">
          <div className="min-w-[900px] flex items-center justify-between gap-xs py-xs text-center font-code-sm text-code-sm">
            <div className="flex-1 p-sm rounded bg-surface-container flex flex-col items-center">
              <span className="text-outline text-[10px] tracking-wider uppercase font-semibold">STAGE 01</span>
              <span className="text-on-surface font-bold mt-[2px]">Population Dossiers</span>
              <div className="flex items-center gap-xs mt-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">folder_open</span>
                <span className="text-primary font-bold">100 Cases</span>
              </div>
              <span className="text-[10px] text-outline mt-xs">6 Supervised CSEs</span>
            </div>
            <span className="material-symbols-outlined text-outline text-[16px]">trending_flat</span>

            <div className="flex-1 p-sm rounded bg-surface-container flex flex-col items-center">
              <span className="text-outline text-[10px] tracking-wider uppercase font-semibold">STAGE 02</span>
              <span className="text-on-surface font-bold mt-[2px]">Telemetry Ingest</span>
              <div className="flex items-center gap-xs mt-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary">input</span>
                <span className="text-secondary font-bold">184 Evidence Files</span>
              </div>
              <span className="text-[10px] text-outline mt-xs">Hash Verified / Logs</span>
            </div>
            <span className="material-symbols-outlined text-outline text-[16px]">trending_flat</span>

            <div className="flex-1 p-sm rounded bg-surface-container flex flex-col items-center">
              <span className="text-outline text-[10px] tracking-wider uppercase font-semibold">STAGE 03</span>
              <span className="text-on-surface font-bold mt-[2px]">Signal Fusion</span>
              <div className="flex items-center gap-xs mt-xs text-tertiary">
                <span className="material-symbols-outlined text-[16px]">hub</span>
                <span className="font-bold">Gaps + Neg Space</span>
              </div>
              <span className="text-[10px] text-outline mt-xs">Recurrence Correlated</span>
            </div>
            <span className="material-symbols-outlined text-outline text-[16px]">trending_flat</span>

            <div className="flex-1 p-sm rounded bg-surface-container flex flex-col items-center">
              <span className="text-outline text-[10px] tracking-wider uppercase font-semibold">STAGE 04</span>
              <span className="text-on-surface font-bold mt-[2px]">Multi-Vector Weights</span>
              <div className="flex items-center gap-xs mt-xs text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-primary">scale</span>
                <span className="font-bold">Risk Scoring</span>
              </div>
              <span className="text-[10px] text-outline mt-xs">Algorithmic Rank</span>
            </div>
            <span className="material-symbols-outlined text-outline text-[16px]">trending_flat</span>

            <div className="flex-1 p-sm rounded bg-surface-container-high flex flex-col items-center border border-secondary/40">
              <span className="text-secondary text-[10px] tracking-wider uppercase font-bold">STAGE 05</span>
              <span className="text-on-surface font-bold mt-[2px]">Target Sample</span>
              <div className="flex items-center gap-xs mt-xs text-secondary">
                <span className="material-symbols-outlined text-[16px]">fact_check</span>
                <span className="font-bold">20 Candidates</span>
              </div>
              <span className="text-[10px] text-on-surface-variant mt-xs">Ranked by Leverage</span>
            </div>
            <span className="material-symbols-outlined text-outline text-[16px]">trending_flat</span>

            <div className="flex-1 p-sm rounded bg-surface-container flex flex-col items-center">
              <span className="text-outline text-[10px] tracking-wider uppercase font-semibold">STAGE 06</span>
              <span className="text-on-surface font-bold mt-[2px]">Supervisor Order</span>
              <div className="flex items-center gap-xs mt-xs text-primary">
                <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
                <span className="font-bold">{examinationQueue.length} Queued</span>
              </div>
              <span className="text-[10px] text-outline mt-xs">Air-Gap Examiner Set</span>
            </div>
          </div>
        </div>
      </div>

      {/* SPLIT VIEW: RECOMMENDED SAMPLE TABLE & INTERACTIVE INSPECTION DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md mb-lg items-start">
        
        {/* LEFT PANEL: RECOMMENDED SAMPLES TABLE (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-sm">
          {/* Search & Filters toolbar */}
          <div className="p-sm rounded bg-surface-container flex flex-col md:flex-row items-stretch md:items-center justify-between gap-sm border border-[#30363d]/60">
            <div className="flex-1 relative flex items-center">
              <span className="material-symbols-outlined absolute left-sm text-outline text-[18px]">search</span>
              <input 
                type="text"
                className="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm pl-9 pr-sm py-xs rounded focus:outline-none focus:ring-1 focus:ring-primary border border-[#30363d]/40"
                placeholder="Search Case ID, CSE, Signal (e.g. CASE-1042, GAP-0071, Energy)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-xs">
              <select 
                className="bg-surface-container-high px-sm py-xs rounded font-code-sm text-code-sm text-on-surface focus:outline-none cursor-pointer border border-[#30363d]/40"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="HIGH">High Only</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low / Baseline</option>
              </select>
              <select 
                className="bg-surface-container-high px-sm py-xs rounded font-code-sm text-code-sm text-on-surface focus:outline-none cursor-pointer border border-[#30363d]/40"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="ALL">All Methods</option>
                <option value="Risk-Based">Risk-Based</option>
                <option value="Evidence-Based">Evidence-Based</option>
                <option value="Anomaly-Based">Anomaly-Based</option>
                <option value="Coverage-Based">Coverage-Based</option>
                <option value="Recurrence-Based">Recurrence-Based</option>
                <option value="Baseline">Baseline Group</option>
              </select>
            </div>
          </div>

          {/* Batch Action Bar */}
          <div className="p-xs px-sm rounded bg-surface-container-low flex items-center justify-between border border-[#30363d]/40">
            <div className="flex items-center gap-sm">
              <span className="font-code-sm text-code-sm text-on-surface-variant font-medium">
                Active Selections: <strong className="text-primary font-bold">{selectedCaseIds.length}</strong> cases
              </span>
              <span className="text-outline-variant">|</span>
              <button 
                className="font-code-sm text-code-sm text-primary hover:underline cursor-pointer"
                onClick={handleSelectTopFive}
              >
                + Select Top 5 High Priority
              </button>
              <span className="text-outline-variant">|</span>
              <button 
                className="font-code-sm text-code-sm text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setSelectedCaseIds([])}
              >
                Clear Selection
              </button>
            </div>
            <button 
              className="px-sm py-[4px] rounded bg-primary text-on-primary font-body-sm text-body-sm font-semibold flex items-center gap-xs hover:bg-primary/90 transition-colors cursor-pointer"
              onClick={handleAddBatchToQueue}
            >
              <span className="material-symbols-outlined text-[16px]">playlist_add</span>
              <span>Add to Examination Set</span>
            </button>
          </div>

          {/* Data Table */}
          <div className="rounded bg-surface-container-lowest overflow-x-auto shadow-sm border border-[#30363d]/60">
            <table className="w-full text-left font-body-sm text-body-sm border-collapse">
              <thead>
                <tr className="bg-surface-container-high font-label-caps text-label-caps uppercase text-on-surface-variant">
                  <th className="p-sm w-10 text-center">
                    <input 
                      type="checkbox"
                      className="rounded bg-surface-container text-primary cursor-pointer"
                      checked={selectedCaseIds.length > 0 && selectedCaseIds.length === filteredCases.length}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                  <th className="p-sm">Case ID</th>
                  <th className="p-sm">CSE &amp; Sector</th>
                  <th className="p-sm">Primary Selection Vector</th>
                  <th className="p-sm">Contributing Signals</th>
                  <th className="p-sm">Priority</th>
                  <th className="p-sm">Evidence</th>
                  <th className="p-sm">Method</th>
                  <th className="p-sm text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="font-code-sm text-code-sm divide-y divide-[#30363d]/30 text-on-surface">
                {filteredCases.map(c => {
                  const isFocused = c.id === focusedCaseId;
                  const isChecked = selectedCaseIds.includes(c.id);
                  return (
                    <tr 
                      key={c.id}
                      className={`hover:bg-surface-container transition-colors cursor-pointer ${
                        isFocused ? 'bg-surface-container/80 border-l-2 border-primary' : ''
                      }`}
                      onClick={() => setFocusedCaseId(c.id)}
                    >
                      <td className="p-sm text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          className="rounded bg-surface-container cursor-pointer"
                          checked={isChecked}
                          onChange={() => handleToggleCase(c.id)}
                        />
                      </td>
                      <td className="p-sm font-bold text-primary flex items-center gap-xs">
                        <span>{c.id}</span>
                        {c.priority === 'CRITICAL' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                        )}
                      </td>
                      <td className="p-sm">
                        <div className="text-on-surface font-semibold">{c.cseId}</div>
                        <div className="text-[10px] text-outline uppercase font-label-caps">{c.sector}</div>
                      </td>
                      <td className="p-sm font-body-sm text-body-sm text-on-surface max-w-[190px]">
                        <span className="line-clamp-2">{c.primaryVector}</span>
                      </td>
                      <td className="p-sm">
                        <div className="flex flex-col gap-[2px]">
                          {c.contributingSignals.map((sig, idx) => (
                            <span key={idx} className="px-xs py-[2px] rounded bg-surface-container-high text-[10px] w-fit font-medium">
                              {sig}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-sm">
                        {c.priority === 'CRITICAL' && (
                          <span className="px-sm py-[2px] rounded bg-error text-on-error font-label-caps text-label-caps font-bold">CRITICAL</span>
                        )}
                        {c.priority === 'HIGH' && (
                          <span className="px-sm py-[2px] rounded bg-error-container text-on-error-container font-label-caps text-label-caps font-bold">HIGH</span>
                        )}
                        {c.priority === 'MEDIUM' && (
                          <span className="px-sm py-[2px] rounded bg-surface-container-high text-tertiary font-label-caps text-label-caps font-semibold">MEDIUM</span>
                        )}
                        {c.priority === 'LOW' && (
                          <span className="px-sm py-[2px] rounded bg-surface-container-high text-secondary font-label-caps text-label-caps font-semibold">LOW</span>
                        )}
                      </td>
                      <td className="p-sm">
                        <span className={c.evidenceStrength === 'Strong' ? 'text-secondary font-semibold' : 'text-on-surface font-medium'}>
                          {c.evidenceStrength}
                        </span>
                        <div className="text-[10px] text-outline">{c.evidenceList}</div>
                      </td>
                      <td className="p-sm text-on-surface-variant font-label-caps text-label-caps">{c.method}</td>
                      <td className="p-sm text-right">
                        <button 
                          className="px-sm py-[2px] rounded bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary transition-colors text-xs font-semibold cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFocusedCaseId(c.id);
                          }}
                        >
                          Focus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL: ACTIVE INSPECTION DRAWER (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-sm">
          <div className="p-md rounded bg-surface-container shadow-md flex flex-col gap-md border border-[#30363d]/60">
            {/* Drawer Header */}
            <div className="flex flex-col gap-xs pb-sm bg-surface-container-high p-sm rounded border border-[#30363d]/40">
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-outline font-semibold">CASE INSPECTION DOSSIER</span>
                <span className={`px-sm py-[2px] rounded font-label-caps text-label-caps font-bold ${
                  activeFocus.priority === 'CRITICAL' ? 'bg-error text-on-error' : 'bg-error-container text-on-error-container'
                }`}>
                  {activeFocus.priority} PRIORITY
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-xs">
                <div className="font-headline-sm text-headline-sm font-bold text-primary">{activeFocus.id}</div>
                <span className="font-code-sm text-code-sm text-secondary font-semibold">Method: {activeFocus.method}</span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface font-medium flex items-center justify-between">
                <span>{activeFocus.cseName}</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">{activeFocus.cseId} ({activeFocus.sector.split('/')[0].trim()})</span>
              </div>
            </div>

            {/* Explainability Engine: Why Selected */}
            <div className="flex flex-col gap-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps uppercase text-primary font-bold tracking-wider">Explainability Engine</span>
                <span className="font-code-sm text-code-sm text-secondary">Confidence: 94.8%</span>
              </div>
              <div className="p-sm rounded bg-surface-container-low flex flex-col gap-xs border border-[#30363d]/40">
                <div className="flex items-center gap-xs text-error font-code-sm text-code-sm font-bold">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                  <span>Primary Signal: Execution Gap (GAP-0071)</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Statutory 6-hour escalation step was completely bypassed during active ICS telecommunication alert triage.
                </p>
              </div>
              <div className="p-sm rounded bg-surface-container-low flex flex-col gap-xs border border-[#30363d]/40">
                <div className="flex items-center gap-xs text-tertiary font-code-sm text-code-sm font-bold">
                  <span className="material-symbols-outlined text-[16px]">radar</span>
                  <span>Negative Space: NS-0041</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Expected telemetry artefact <code className="font-code-sm text-code-sm text-primary">ESC-221</code> (NCIIPC statutory dispatch record) was never generated or lodged.
                </p>
              </div>
              <div className="p-sm rounded bg-surface-container-low flex flex-col gap-xs border border-[#30363d]/40">
                <div className="flex items-center gap-xs text-on-surface font-code-sm text-code-sm font-bold">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">history_toggle_off</span>
                  <span>Historical Recurrence: Persistence Factor</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Identical escalation omission previously observed in Q2 2025 and Q4 2025 audits for substation control nodes.
                </p>
              </div>
            </div>

            {/* Associated Evidence Docket */}
            <div className="flex flex-col gap-xs">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold tracking-wider">Associated Evidence Docket</span>
              <div className="p-sm rounded bg-surface-container-lowest font-code-sm text-code-sm flex flex-col gap-[6px] border border-[#30363d]/40">
                <div className="flex items-center justify-between">
                  <span className="text-outline">Alert Trigger:</span>
                  <span className="text-on-surface font-semibold">ALR-8821 (SCADA telemetry drop)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-outline">Investigation Ticket:</span>
                  <span className="text-primary font-semibold">INV-338 (Present)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-outline">Evidence Hashes:</span>
                  <span className="text-secondary">EVD-742, EVD-761 (SHA-256 match)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-outline">Escalation Receipt:</span>
                  <span className="text-error font-bold">ESC-221 (MISSING - Negative Space)</span>
                </div>
              </div>
            </div>

            {/* Recommended Examiner Protocols */}
            <div className="flex flex-col gap-xs">
              <span className="font-label-caps text-label-caps uppercase text-primary font-bold tracking-wider">Recommended Examiner Protocols</span>
              <ol className="list-decimal list-inside font-body-sm text-body-sm text-on-surface space-y-xs">
                <li>Reconstruct analyst investigation timeline between <span className="font-code-sm text-code-sm text-secondary">09:14 UTC</span> and <span className="font-code-sm text-code-sm text-secondary">10:18 UTC</span>.</li>
                <li>Issue formal statutory evidence demand for <span className="font-code-sm text-code-sm text-primary">ESC-221</span> cryptographically timestamped gateway logs.</li>
                <li>Reconcile against open regulatory finding <Link to="/findings/FND-0142" className="text-primary underline font-code-sm text-code-sm">FND-0142</Link>.</li>
              </ol>
            </div>

            {/* Human Decision Controls */}
            <div className="flex flex-col gap-xs pt-xs">
              <button 
                className="w-full py-xs px-sm rounded bg-primary text-on-primary hover:bg-primary/90 font-body-sm text-body-sm font-semibold flex items-center justify-center gap-xs transition-colors shadow-sm cursor-pointer"
                onClick={() => handleAddSingleToQueue(activeFocus.id)}
              >
                <span className="material-symbols-outlined text-[16px]">add_task</span>
                <span>+ Add {activeFocus.id} to Examination Set</span>
              </button>
              <div className="grid grid-cols-2 gap-xs">
                <Link 
                  to="/findings/FND-0142" 
                  className="py-xs px-sm rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm text-center flex items-center justify-center gap-xs transition-colors border border-[#30363d]/40"
                >
                  <span className="material-symbols-outlined text-[16px] text-tertiary">open_in_new</span>
                  <span>Open FND-0142</span>
                </Link>
                <Link 
                  to="/evidence" 
                  className="py-xs px-sm rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm text-center flex items-center justify-center gap-xs transition-colors border border-[#30363d]/40"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">folder_special</span>
                  <span>View Dossier</span>
                </Link>
              </div>
              <button 
                className="w-full py-xs px-sm rounded bg-surface-container-low hover:bg-surface-container-high text-outline hover:text-on-surface font-code-sm text-code-sm flex items-center justify-center gap-xs transition-colors cursor-pointer border border-[#30363d]/40"
                onClick={() => showToast(`Flagged operational exemption caveat for ${activeFocus.id}.`)}
              >
                <span className="material-symbols-outlined text-[14px]">flag</span>
                <span>Flag Operational Exemption</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ACTIVE EXAMINATION SET (Supervisory Queue Builder) */}
      <div className="p-md rounded bg-surface-container mb-lg flex flex-col gap-md border border-[#30363d]/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
          <div className="flex items-center gap-sm">
            <div className="w-7 h-7 rounded bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-on-primary-container">rule</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Active Supervisory Examination Set</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Examiner dispatch order queue ready for statutory subpoena or targeted on-site verification.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-xs">
            <div className="flex items-center gap-xs px-sm py-xs rounded bg-surface-container-lowest font-code-sm text-code-sm border border-[#30363d]/40">
              <span className="text-outline">Total Queued:</span>
              <span className="text-primary font-bold">{examinationQueue.length} cases</span>
            </div>
            <button 
              className="px-md py-xs rounded bg-secondary text-on-secondary hover:bg-secondary/90 font-body-sm text-body-sm font-semibold flex items-center gap-xs transition-colors shadow-sm cursor-pointer"
              onClick={() => showToast('Formal supervisory examination orders dispatched to assigned examiner teams.')}
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Dispatch Examination Order</span>
            </button>
          </div>
        </div>

        {/* Examination Queue Table */}
        <div className="rounded bg-surface-container-lowest overflow-x-auto border border-[#30363d]/40">
          <table className="w-full text-left font-body-sm text-body-sm border-collapse">
            <thead>
              <tr className="bg-surface-container-high font-label-caps text-label-caps uppercase text-on-surface-variant">
                <th className="p-sm">Queued Case</th>
                <th className="p-sm">Target CSE</th>
                <th className="p-sm">Key Regulatory Trigger</th>
                <th className="p-sm">Assigned Examiner Group</th>
                <th className="p-sm">Status</th>
                <th className="p-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-code-sm text-code-sm divide-y divide-[#30363d]/30 text-on-surface">
              {examinationQueue.map(item => (
                <tr key={item.caseId} className="hover:bg-surface-container transition-colors">
                  <td className="p-sm font-bold text-primary">{item.caseId}</td>
                  <td className="p-sm">{item.targetCse}</td>
                  <td className="p-sm font-body-sm text-body-sm text-on-surface">{item.trigger}</td>
                  <td className="p-sm">
                    <select className="bg-surface-container px-sm py-[2px] rounded text-on-surface font-code-sm text-code-sm focus:outline-none cursor-pointer border border-[#30363d]/40">
                      <option value="EX-07">Examiner 07 (Air-gap Unit)</option>
                      <option value="EX-02">Examiner 02 (Energy Grid Spec)</option>
                      <option value="EX-11">Examiner 11 (Audit Oversight)</option>
                    </select>
                  </td>
                  <td className="p-sm">
                    <span className="px-sm py-[2px] rounded bg-secondary/20 text-secondary font-label-caps text-label-caps font-semibold">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-sm text-right">
                    <button 
                      className="text-error hover:underline font-code-sm text-code-sm cursor-pointer"
                      onClick={() => handleRemoveQueue(item.caseId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
