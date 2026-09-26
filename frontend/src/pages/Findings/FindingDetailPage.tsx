import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockFindings } from '@/data/mock/findings';
import { FindingStatus } from '@/types';

export const FindingDetailPage: React.FC = () => {
  const { findingId } = useParams<{ findingId: string }>();
  const finding = mockFindings.find(f => f.id.toLowerCase() === (findingId || 'fnd-0142').toLowerCase()) || mockFindings[0];

  // State management
  const [currentStatus, setCurrentStatus] = useState<FindingStatus>(finding.status);
  const [examinerNote, setExaminerNote] = useState<string>(finding.decisionNotes || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'VALIDATE' | 'QUALIFY' | 'REJECT' | 'OVERRIDE' | 'REQUEST_EVD'>('VALIDATE');
  const [adjudicationRef, setAdjudicationRef] = useState<string>('NCIIPC-SEC-70B-CRIT-07');
  const [modalJustification, setModalJustification] = useState<string>('');

  // Selected timeline node for inspection
  const [inspectedEvent, setInspectedEvent] = useState<{
    id: string;
    time: string;
    desc: string;
    ref: string;
  } | null>({
    id: 'GAP-0071',
    time: '10:42:15 IST',
    desc: 'CRITICAL SUPERVISORY BREACH: Required Tier-2 regulatory dispatch record was never generated.',
    ref: 'NONE (ABSENT)'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopyDigest = (digest: string) => {
    navigator.clipboard.writeText(digest);
    showToast(`Cryptographic digest copied to clipboard: ${digest.slice(0, 16)}...`);
  };

  const openDecisionModal = (type: 'VALIDATE' | 'QUALIFY' | 'REJECT' | 'OVERRIDE' | 'REQUEST_EVD') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleConfirmDecision = () => {
    let newStatus: FindingStatus = currentStatus;
    if (modalType === 'VALIDATE') newStatus = 'VALIDATED';
    else if (modalType === 'QUALIFY') newStatus = 'QUALIFIED';
    else if (modalType === 'REJECT') newStatus = 'REJECTED';
    else if (modalType === 'OVERRIDE') newStatus = 'OVERRIDDEN';
    else if (modalType === 'REQUEST_EVD') newStatus = 'UNDER_REVIEW';

    setCurrentStatus(newStatus);
    finding.status = newStatus;
    finding.decisionNotes = modalJustification || examinerNote;
    finding.decisionReason = adjudicationRef;
    finding.decidedBy = 'NC-8802 (Lead Examiner)';
    finding.decidedAt = new Date().toISOString();

    setIsModalOpen(false);
    showToast(`Statutory Adjudication committed: ${newStatus} under ${adjudicationRef}`);
  };

  const handleSaveNote = () => {
    finding.decisionNotes = examinerNote;
    showToast('Examiner ledger note cryptographically committed.');
  };

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'VALIDATED':
        return (
          <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-secondary text-[11px] font-bold font-label-caps tracking-wide flex items-center gap-1 border border-secondary/40">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            VALIDATED (NON-COMPLIANCE)
          </span>
        );
      case 'QUALIFIED':
        return (
          <span className="px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary text-[11px] font-bold font-label-caps tracking-wide flex items-center gap-1 border border-tertiary/40">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            QUALIFIED WITH CAVEAT
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 py-0.5 rounded-full bg-error-container/30 text-error text-[11px] font-bold font-label-caps tracking-wide flex items-center gap-1 border border-error/40">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            REJECTED (FALSE POSITIVE)
          </span>
        );
      case 'OVERRIDDEN':
        return (
          <span className="px-2 py-0.5 rounded-full bg-surface-variant text-on-surface text-[11px] font-bold font-label-caps tracking-wide flex items-center gap-1 border border-outline">
            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
            WEIGHT OVERRIDDEN
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary text-[11px] font-bold font-label-caps tracking-wide flex items-center gap-1 border border-tertiary/30">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            UNDER REVIEW
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full text-on-surface antialiased pb-24">
      {/* TOP BREADCRUMB & CONTEXT STRIP */}
      <div className="flex items-center justify-between py-2 border-b border-[#30363d]/40 mb-3 text-body-sm">
        <div className="flex items-center gap-2 font-code-sm text-body-sm">
          <span className="text-on-surface-variant">SAT-SA</span>
          <span className="text-outline">/</span>
          <span className="text-on-surface-variant">Assessment</span>
          <span className="text-outline">/</span>
          <Link to="/findings" className="text-primary hover:underline hover:text-primary-fixed">Findings</Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded text-code-sm">{finding.id}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-high font-code-sm text-code-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
            <span>SUPERVISORY RECORD ID: <span className="text-on-surface font-medium">SR-2026-IND-0142</span></span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-high font-code-sm text-code-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
            <span>SNAPSHOT: 26-SEP-2026 14:18:02 IST</span>
          </div>
        </div>
      </div>

      {/* HEADER BLOCK */}
      <div className="bg-surface-container-low rounded-lg p-4 mb-4 border border-[#30363d]">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <div className="flex flex-col gap-1 min-w-0 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-code-md text-headline-sm text-primary font-bold tracking-tight">{finding.id}</span>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-[11px] font-bold font-label-caps tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                CRITICAL PRIORITY
              </span>
              {getStatusBadge()}
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-code-sm text-code-sm">
                CONTROL: <span className="text-on-surface font-semibold">CTRL-07 (v3.2)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-code-sm text-code-sm">
                CASE: <span className="text-primary font-medium">CASE-1042</span>
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
              {finding.title}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {finding.whyFlagged}
            </p>
          </div>

          {/* Quick Metrics Gauges */}
          <div className="flex items-center gap-3 bg-surface-container px-3 py-2 rounded-lg border border-[#30363d]/60">
            <div className="flex flex-col items-center px-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Evidence Strength</span>
              <span className="font-code-md text-body-lg text-secondary font-bold">94%</span>
              <span className="text-[10px] text-secondary font-medium tracking-tight uppercase">STRONG</span>
            </div>
            <div className="w-[1px] h-8 bg-[#30363d]"></div>
            <div className="flex flex-col items-center px-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Completeness</span>
              <span className="font-code-md text-body-lg text-primary font-bold">78%</span>
              <span className="text-[10px] text-on-surface-variant uppercase">3 OF 4 ARTIFACTS</span>
            </div>
            <div className="w-[1px] h-8 bg-[#30363d]"></div>
            <div className="flex flex-col items-center px-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Uncertainty</span>
              <span className="font-code-md text-body-lg text-tertiary font-bold">MODERATE</span>
              <span className="text-[10px] text-tertiary uppercase">TRACEABLE GAP</span>
            </div>
          </div>
        </div>

        {/* Metadata Sub-strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-3 border-t border-[#30363d]/60 font-body-sm text-body-sm">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-outline">apartment</span>
            <span>Entity:</span>
            <Link to={`/supervision/cse-assessments/${finding.cseId}`} className="text-primary hover:underline font-medium">
              {finding.cseId} ({finding.cseName})
            </Link>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-outline">bolt</span>
            <span>Sector:</span>
            <span className="text-on-surface font-medium">Critical Infrastructure / Power</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-outline">verified_user</span>
            <span>Statutory Baseline:</span>
            <span className="text-on-surface font-medium">NCIIPC-CSF-v3.2</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-outline">event_repeat</span>
            <span>Cycle:</span>
            <span className="text-on-surface font-medium">Q3 2026 (Active Regulatory Cycle)</span>
          </div>
        </div>

        {/* Protocol Advisory Notice */}
        <div className="mt-3 flex items-center gap-2 p-2 rounded bg-surface-container-lowest/80 border border-[#30363d]/80 text-on-surface-variant text-body-sm">
          <span className="material-symbols-outlined text-primary text-[18px]">info</span>
          <span className="font-code-sm text-code-sm">
            <strong className="text-on-surface">STATUTORY PROTOCOL NOTICE:</strong> System-generated supervisory signal — human examiner evaluation required. Does not constitute an automatic regulatory non-compliance verdict.
          </span>
        </div>
      </div>

      {/* TOP ACTION QUICK SWITCHER BAR */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-4 text-body-sm">
        <div className="flex items-center gap-1.5 flex-nowrap">
          <Link to="/findings" className="flex items-center gap-1 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface border border-[#30363d] transition-colors font-medium text-code-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>Back to Findings</span>
          </Link>
          <Link to={`/supervision/cse-assessments/${finding.cseId}`} className="flex items-center gap-1 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-[#30363d] transition-colors text-code-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[15px]">domain</span>
            <span>Open {finding.cseId} Assessment</span>
          </Link>
          <Link to="/analytics/execution-gaps" className="flex items-center gap-1 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-[#30363d] transition-colors text-code-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[15px]">rule_folder</span>
            <span>Execution Gap (GAP-0071)</span>
          </Link>
          <Link to="/analytics/negative-space" className="flex items-center gap-1 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-[#30363d] transition-colors text-code-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[15px]">contrast</span>
            <span>Negative Space (NS-0041)</span>
          </Link>
          <Link to="/evidence" className="flex items-center gap-1 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-[#30363d] transition-colors text-code-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[15px]">folder_open</span>
            <span>Evidence Explorer (CASE-1042)</span>
          </Link>
          <Link to="/analytics/historical-intelligence" className="flex items-center gap-1 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-[#30363d] transition-colors text-code-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[15px]">timeline</span>
            <span>Historical Intelligence</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface border border-[#30363d] text-code-sm"
            onClick={() => handleCopyDigest('SHA256:9f8a3c7198df5b3a4a4087bce920436d6a2f7c0042eb88b2c5890e0c1f4b321a')}
          >
            <span className="material-symbols-outlined text-[14px]">key</span>
            <span>Copy Digest</span>
          </button>
        </div>
      </div>

      {/* THREE COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start mb-6">
        
        {/* LEFT COLUMN: Finding Architecture & Supervisory Reasoning Chain */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Finding Architecture Summary Card */}
          <div className="bg-surface-container-low rounded-lg p-3.5 border border-[#30363d]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#30363d]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
                <span className="font-headline-sm text-body-md font-semibold text-on-surface">Finding Architecture</span>
              </div>
              <span className="text-code-sm font-code-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">MULTI-SIGNAL</span>
            </div>
            <div className="space-y-2.5 text-body-sm">
              <div className="flex justify-between items-center py-1 border-b border-[#30363d]/40">
                <span className="text-on-surface-variant">Primary Trigger:</span>
                <span className="font-code-sm text-code-sm text-error bg-error-container/20 px-1.5 py-0.5 rounded">Execution Gap (GAP-0071)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#30363d]/40">
                <span className="text-on-surface-variant">Supporting Signals:</span>
                <span className="text-right font-code-sm text-code-sm text-on-surface">3 Signals Fused</span>
              </div>
              <div className="pl-2 space-y-1 font-code-sm text-code-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>• Negative Space:</span>
                  <span className="text-tertiary">NS-0041 (Telemetry Void)</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>• Temporal Recurrence:</span>
                  <span className="text-on-surface">3rd Cycle Recurrence</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>• Sequence Anomaly:</span>
                  <span className="text-primary">PD-0031 (Skip-Step)</span>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-between items-center text-label-caps font-label-caps text-on-surface-variant mb-1">
                  <span>Signal Weight Distribution</span>
                  <span className="font-code-sm text-code-sm text-primary">Fused Index: 0.89</span>
                </div>
                {/* Multi-segment progress bar */}
                <div className="w-full h-2 rounded bg-surface-container-highest flex overflow-hidden">
                  <div className="bg-error" style={{ width: '48%' }} title="GAP-0071: 48%"></div>
                  <div className="bg-tertiary" style={{ width: '26%' }} title="NS-0041: 26%"></div>
                  <div className="bg-primary" style={{ width: '16%' }} title="PD-0031: 16%"></div>
                  <div className="bg-secondary" style={{ width: '10%' }} title="Historical: 10%"></div>
                </div>
                <div className="flex justify-between text-[10px] text-outline mt-1 font-code-sm">
                  <span className="text-error">GAP 48%</span>
                  <span className="text-tertiary">NS 26%</span>
                  <span className="text-primary">PD 16%</span>
                  <span className="text-secondary">HIST 10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explainable Reasoning Chain */}
          <div className="bg-surface-container-low rounded-lg p-3.5 border border-[#30363d]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#30363d]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">account_tree</span>
                <span className="font-headline-sm text-body-md font-semibold text-on-surface">Supervisory Reasoning Chain</span>
              </div>
              <span className="font-code-sm text-[11px] text-secondary bg-secondary-container/20 px-1.5 py-0.5 rounded">DETERMINISTIC</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
              Verifiable audit trail detailing how the telemetry synthesis engine elevated this finding to examiner review:
            </p>
            <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#30363d]">
              {/* Step 1 */}
              <div className="relative group">
                <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface-container-low"></div>
                <div className="font-code-sm text-code-sm text-primary font-semibold uppercase">Step 1 • Expected Mandate</div>
                <div className="text-body-sm text-on-surface font-medium">Statutory Baseline Mandate</div>
                <div className="text-[11px] text-on-surface-variant font-code-sm mt-0.5">
                  CTRL-07 requires Priority-1 SOC triage to generate Tier-2 escalation record within 60 minutes.
                </div>
              </div>
              {/* Step 2 */}
              <div className="relative group">
                <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-tertiary border-2 border-surface-container-low"></div>
                <div className="font-code-sm text-code-sm text-tertiary font-semibold uppercase">Step 2 • Telemetry Observation</div>
                <div className="text-body-sm text-on-surface font-medium">Observed Ingestion Disparity</div>
                <div className="text-[11px] text-on-surface-variant font-code-sm mt-0.5">
                  Incident <span className="text-on-surface">INV-338</span> triaged at 09:42 IST marked P1 severity; zero transmission record followed before containment response.
                </div>
              </div>
              {/* Step 3 */}
              <div className="relative group">
                <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-error border-2 border-surface-container-low"></div>
                <div className="font-code-sm text-code-sm text-error font-semibold uppercase">Step 3 • Execution Gap Flag</div>
                <div className="text-body-sm text-on-surface font-medium">Missing Procedural Node (GAP-0071)</div>
                <div className="text-[11px] text-on-surface-variant font-code-sm mt-0.5">
                  Gap engine confirmed 45-minute missing communication window between triage and local response.
                </div>
              </div>
              {/* Step 4 */}
              <div className="relative group">
                <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface-container-low"></div>
                <div className="font-code-sm text-code-sm text-primary font-semibold uppercase">Step 4 • Corroboration</div>
                <div className="text-body-sm text-on-surface font-medium">Cryptographic Evidence Matched</div>
                <div className="text-[11px] text-on-surface-variant font-code-sm mt-0.5">
                  Verified records <span className="text-secondary font-mono">EVD-742</span> and <span className="text-secondary font-mono">EVD-761</span> ingested. Escalation telemetry absent from bundle.
                </div>
              </div>
              {/* Step 5 */}
              <div className="relative group">
                <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-tertiary border-2 border-surface-container-low"></div>
                <div className="font-code-sm text-code-sm text-tertiary font-semibold uppercase">Step 5 • Negative Space Fusion</div>
                <div className="text-body-sm text-on-surface font-medium">Absence Corroborated with Cycle History</div>
                <div className="text-[11px] text-on-surface-variant font-code-sm mt-0.5">
                  Pattern identical to previous un-remediated non-compliances <span className="text-on-surface font-mono">GAP-0032</span> (Q2 2025) and <span className="text-on-surface font-mono">GAP-0051</span> (Q4 2025).
                </div>
              </div>
              {/* Step 6 */}
              <div className="relative group">
                <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-error border-2 border-surface-container-low"></div>
                <div className="font-code-sm text-code-sm text-error font-semibold uppercase">Step 6 • Synthesis Output</div>
                <div className="text-body-sm text-on-surface font-medium">Candidate FND-0142 Constructed</div>
                <div className="text-[11px] text-on-surface-variant font-code-sm mt-0.5">
                  Synthesis algorithm scored candidate confidence at 94%, elevating to High Criticality queue.
                </div>
              </div>
              {/* Step 7 */}
              <div className="relative group">
                <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-surface-container-low"></div>
                <div className="font-code-sm text-code-sm text-secondary font-semibold uppercase">Step 7 • Human Boundary</div>
                <div className="text-body-sm text-on-surface font-medium">Statutory Adjudication Gate</div>
                <div className="text-[11px] text-on-surface-variant font-code-sm mt-0.5">
                  Awaiting certified supervisory verification or formal qualification from designated examiner.
                </div>
              </div>
            </div>
          </div>

          {/* Capability Discrepancy Widget */}
          <div className="bg-surface-container-low rounded-lg p-3.5 border border-[#30363d]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#30363d]">
              <span className="font-headline-sm text-body-md font-semibold text-on-surface">Capability Discrepancy</span>
              <span className="font-code-sm text-[11px] text-error bg-error-container/20 px-1.5 py-0.5 rounded">DELTA: -20%</span>
            </div>
            <div className="space-y-2 font-body-sm text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Self-Assessed Capability:</span>
                <span className="font-code-sm text-secondary font-semibold">HIGH (24 / 25 Controls)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Supervisory Depth Rating:</span>
                <span className="font-code-sm text-tertiary font-semibold">MEDIUM (19 / 25 Controls)</span>
              </div>
              <div className="p-2 rounded bg-surface-container text-body-sm text-on-surface-variant border border-[#30363d]/50">
                <span className="text-on-surface font-medium">Analytical Note:</span> 5 controls across NorthGrid SOC exhibit "shallow documentation" pattern: self-attested procedures present in policy documentation, but zero operational log entries found in supervisory air-gap ingestion.
              </div>
            </div>
          </div>

        </div>

        {/* CENTER COLUMN: Expected vs Observed & Evidence Timeline */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Visual Comparator (USP Core) */}
          <div className="bg-surface-container-low rounded-lg p-4 border border-[#30363d]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#30363d]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">compare</span>
                <span className="font-headline-sm text-body-md font-semibold text-on-surface">Process Sequence: Expected vs. Observed</span>
              </div>
              <span className="font-code-sm text-code-sm text-outline">TRACE: CASE-1042</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              Comparative forensic reconstruction demonstrating the exact point of regulatory execution failure:
            </p>

            {/* EXPECTED FLOW */}
            <div className="p-3 rounded-lg bg-surface-container mb-3 border border-[#30363d]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-caps text-label-caps text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  Statutory Expected Sequence (CTRL-07 Mandate)
                </span>
                <span className="font-code-sm text-[11px] text-on-surface-variant">Required Artifacts: 5</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-code-sm text-code-sm">
                <div className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-center min-w-[70px]">
                  <div className="text-[10px] text-on-surface-variant">T0</div>
                  <div className="font-medium text-[11px]">Alert</div>
                </div>
                <span className="material-symbols-outlined text-outline text-[14px]">arrow_forward</span>
                <div className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-center min-w-[70px]">
                  <div className="text-[10px] text-on-surface-variant">T+6m</div>
                  <div className="font-medium text-[11px]">Case Open</div>
                </div>
                <span className="material-symbols-outlined text-outline text-[14px]">arrow_forward</span>
                <div className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-center min-w-[70px]">
                  <div className="text-[10px] text-on-surface-variant">T+30m</div>
                  <div className="font-medium text-[11px]">Triage P1</div>
                </div>
                <span className="material-symbols-outlined text-outline text-[14px]">arrow_forward</span>
                <div className="px-2.5 py-1 rounded bg-primary/20 text-primary border border-primary/40 text-center min-w-[90px]">
                  <div className="text-[10px] text-primary-fixed">T+60m [MANDATORY]</div>
                  <div className="font-bold text-[11px]">Escalation</div>
                </div>
                <span className="material-symbols-outlined text-outline text-[14px]">arrow_forward</span>
                <div className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-center min-w-[70px]">
                  <div className="text-[10px] text-on-surface-variant">T+116m</div>
                  <div className="font-medium text-[11px]">Response</div>
                </div>
                <span className="material-symbols-outlined text-outline text-[14px]">arrow_forward</span>
                <div className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-center min-w-[70px]">
                  <div className="text-[10px] text-on-surface-variant">T+171m</div>
                  <div className="font-medium text-[11px]">Closure</div>
                </div>
              </div>
            </div>

            {/* OBSERVED FLOW */}
            <div className="p-3 rounded-lg bg-surface-container-lowest border border-error/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-caps text-label-caps text-error font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  Observed Ingested Telemetry (NorthGrid SOC Logs)
                </span>
                <span className="font-code-sm text-[11px] text-error font-semibold">FAIL: MISSING STEP</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-code-sm text-code-sm">
                <div className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-center min-w-[70px]">
                  <div className="text-[10px] text-secondary">09:12 IST</div>
                  <div className="font-medium text-[11px]">ALR-8821</div>
                </div>
                <span className="material-symbols-outlined text-outline text-[14px]">arrow_forward</span>
                <div className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-center min-w-[70px]">
                  <div className="text-[10px] text-secondary">09:18 IST</div>
                  <div className="font-medium text-[11px]">CASE-1042</div>
                </div>
                <span className="material-symbols-outlined text-outline text-[14px]">arrow_forward</span>
                <div className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-center min-w-[70px]">
                  <div className="text-[10px] text-secondary">09:42 IST</div>
                  <div className="font-medium text-[11px]">INV-338</div>
                </div>
                <span className="material-symbols-outlined text-error text-[14px]">close</span>
                {/* MISSING STEP CALLOUT */}
                <div className="px-2.5 py-1 rounded bg-error-container/30 text-error border border-dashed border-error text-center min-w-[105px]">
                  <div className="text-[10px] text-error font-bold uppercase">NO LOG RECORD</div>
                  <div className="font-bold text-[11px]">[GAP: ESCALATION]</div>
                </div>
                <span className="material-symbols-outlined text-outline text-[14px]">arrow_forward</span>
                <div className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-center min-w-[70px]">
                  <div className="text-[10px] text-secondary">11:08 IST</div>
                  <div className="font-medium text-[11px]">RESP-104</div>
                </div>
                <span className="material-symbols-outlined text-outline text-[14px]">arrow_forward</span>
                <div className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-center min-w-[70px]">
                  <div className="text-[10px] text-secondary">12:03 IST</div>
                  <div className="font-medium text-[11px]">CLS-421</div>
                </div>
              </div>
              <div className="mt-2.5 p-2 rounded bg-surface-container text-body-sm font-code-sm text-on-surface-variant flex items-center justify-between">
                <span className="text-error font-medium">GAP-0071 Impact:</span>
                <span>Unmonitored Interval: <strong className="text-on-surface">1h 26m</strong> (Exceeded SLA by +26 mins)</span>
              </div>
            </div>
          </div>

          {/* Execution Gap Details & Supporting Signals Grid */}
          <div className="bg-surface-container-low rounded-lg p-4 border border-[#30363d]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#30363d]">
              <span className="font-headline-sm text-body-md font-semibold text-on-surface">Fused Supporting Signals (4 Nodes)</span>
              <span className="font-code-sm text-code-sm text-on-surface-variant">ENGINE: SAT-ANALYTICS v1.8</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Signal 1 */}
              <div className="p-2.5 rounded bg-surface-container border border-error/40 hover:border-error transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-code-sm text-code-sm text-error font-bold">GAP-0071 (Primary)</span>
                  <span className="text-[10px] font-bold text-error uppercase px-1 rounded bg-error-container/30">CRITICAL</span>
                </div>
                <div className="text-body-sm font-semibold text-on-surface">Missing Sequential Process Step</div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  Telemetry pipeline registered zero transmission to CERT-In / NCIIPC within 60m threshold.
                </div>
              </div>
              {/* Signal 2 */}
              <div className="p-2.5 rounded bg-surface-container border border-tertiary/40 hover:border-tertiary transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-code-sm text-code-sm text-tertiary font-bold">NS-0041 (Corroborator)</span>
                  <span className="text-[10px] font-bold text-tertiary uppercase px-1 rounded bg-tertiary-container/30">CONFIRMED VOID</span>
                </div>
                <div className="text-body-sm font-semibold text-on-surface">Negative Space Telemetry Void</div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  Escalation Dossier schema completely unpopulated in air-gapped forensic capture bundle.
                </div>
              </div>
              {/* Signal 3 */}
              <div className="p-2.5 rounded bg-surface-container border border-[#30363d] hover:border-outline transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-code-sm text-code-sm text-on-surface font-bold">HISTORICAL RECURRENCE</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase px-1 rounded bg-surface-container-high">3RD CYCLE</span>
                </div>
                <div className="text-body-sm font-semibold text-on-surface">Repeated Non-Compliance Profile</div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  Identical control execution failure noted in Q2 2025 (GAP-0032) and Q4 2025 (GAP-0051).
                </div>
              </div>
              {/* Signal 4 */}
              <div className="p-2.5 rounded bg-surface-container border border-primary/40 hover:border-primary transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-code-sm text-code-sm text-primary font-bold">PD-0031 (Behavioral)</span>
                  <span className="text-[10px] font-bold text-primary uppercase px-1 rounded bg-primary-container/30">DEVIATION</span>
                </div>
                <div className="text-body-sm font-semibold text-on-surface">Direct Investigation-to-Containment Jump</div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  Analyst jumped directly from local memory dump to IP isolation, bypassing statutory notification.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Evidence Timeline */}
          <div className="bg-surface-container-low rounded-lg p-4 border border-[#30363d]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#30363d]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">history_toggle_off</span>
                <span className="font-headline-sm text-body-md font-semibold text-on-surface">Interactive Forensics Timeline</span>
              </div>
              <span className="font-code-sm text-[11px] text-on-surface-variant">CLICK NODE FOR RAW TELEMETRY</span>
            </div>
            <div className="space-y-2 font-code-sm text-code-sm">
              {/* Event 1 */}
              <div 
                className="p-2.5 rounded bg-surface-container hover:bg-surface-container-high cursor-pointer flex items-center justify-between border-l-2 border-secondary transition-all"
                onClick={() => setInspectedEvent({
                  id: 'ALR-8821',
                  time: '09:12:04 IST',
                  desc: 'Critical SCADA Outstation Disconnect Alert triggered via SIEM collector #4.',
                  ref: 'EVD-742-A'
                })}
              >
                <div className="flex items-center gap-2">
                  <span className="text-secondary font-semibold">09:12:04</span>
                  <span className="text-on-surface font-medium">ALR-8821 Ingested</span>
                  <span className="text-[11px] text-outline">SCADA Outstation 04</span>
                </div>
                <span className="text-[11px] text-secondary font-medium uppercase">Ingested &amp; Verified</span>
              </div>

              {/* Event 2 */}
              <div 
                className="p-2.5 rounded bg-surface-container hover:bg-surface-container-high cursor-pointer flex items-center justify-between border-l-2 border-secondary transition-all"
                onClick={() => setInspectedEvent({
                  id: 'CASE-1042',
                  time: '09:18:22 IST',
                  desc: 'Automated incident dossier initialized. Assigned to Shift Team Bravo.',
                  ref: 'EVD-742-B'
                })}
              >
                <div className="flex items-center gap-2">
                  <span className="text-secondary font-semibold">09:18:22</span>
                  <span className="text-on-surface font-medium">CASE-1042 Instantiated</span>
                  <span className="text-[11px] text-outline">Tier-1 Dispatch</span>
                </div>
                <span className="text-[11px] text-secondary font-medium uppercase">Ingested &amp; Verified</span>
              </div>

              {/* Event 3 */}
              <div 
                className="p-2.5 rounded bg-surface-container hover:bg-surface-container-high cursor-pointer flex items-center justify-between border-l-2 border-primary transition-all"
                onClick={() => setInspectedEvent({
                  id: 'INV-338',
                  time: '09:42:15 IST',
                  desc: 'Analyst initiated volatile memory acquisition on Substation RTU Gateway.',
                  ref: 'EVD-742'
                })}
              >
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold">09:42:15</span>
                  <span className="text-on-surface font-medium">INV-338 Escalation Flag</span>
                  <span className="text-[11px] text-outline">Priority 1 Triage Recorded</span>
                </div>
                <span className="text-[11px] text-primary font-medium uppercase">EVD-742 Linked</span>
              </div>

              {/* Event 4 (GAP) */}
              <div 
                className="p-2.5 rounded bg-error-container/20 hover:bg-error-container/30 cursor-pointer flex items-center justify-between border-l-2 border-error transition-all"
                onClick={() => setInspectedEvent({
                  id: 'GAP-0071',
                  time: '10:42:15 IST',
                  desc: 'CRITICAL SUPERVISORY BREACH: Required Tier-2 regulatory dispatch record was never generated.',
                  ref: 'NONE (ABSENT)'
                })}
              >
                <div className="flex items-center gap-2">
                  <span className="text-error font-semibold">10:42:15</span>
                  <span className="text-error font-bold">MISSING: Supervisory Escalation</span>
                  <span className="text-[11px] text-error">CTRL-07 Timeout Exceeded</span>
                </div>
                <span className="text-[11px] text-error font-bold uppercase">GAP-0071 FLAG</span>
              </div>

              {/* Event 5 */}
              <div 
                className="p-2.5 rounded bg-surface-container hover:bg-surface-container-high cursor-pointer flex items-center justify-between border-l-2 border-secondary transition-all"
                onClick={() => setInspectedEvent({
                  id: 'RESP-104',
                  time: '11:08:40 IST',
                  desc: 'Containment execution completed. Remote telemetry isolate engaged.',
                  ref: 'EVD-761'
                })}
              >
                <div className="flex items-center gap-2">
                  <span className="text-secondary font-semibold">11:08:40</span>
                  <span className="text-on-surface font-medium">RESP-104 Containment Record</span>
                  <span className="text-[11px] text-outline">Direct Isolation</span>
                </div>
                <span className="text-[11px] text-secondary font-medium uppercase">EVD-761 Linked</span>
              </div>

              {/* Event 6 */}
              <div 
                className="p-2.5 rounded bg-surface-container hover:bg-surface-container-high cursor-pointer flex items-center justify-between border-l-2 border-outline transition-all"
                onClick={() => setInspectedEvent({
                  id: 'CLS-421',
                  time: '12:03:11 IST',
                  desc: 'Incident closed by Lead Operations Engineer. Escalation deficiency marked as unresolved in post-mortem.',
                  ref: 'EVD-779'
                })}
              >
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant font-semibold">12:03:11</span>
                  <span className="text-on-surface font-medium">CLS-421 Incident Post-Mortem</span>
                  <span className="text-[11px] text-outline">Internal Wrap-up</span>
                </div>
                <span className="text-[11px] text-outline font-medium uppercase">Ingested</span>
              </div>
            </div>

            {/* Dynamic Timeline Event Inspector Box */}
            {inspectedEvent && (
              <div className="mt-3 p-3 rounded bg-surface-container-lowest border border-[#30363d]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-code-sm text-code-sm text-primary font-bold">{inspectedEvent.id}</span>
                  <span className="font-code-sm text-[11px] text-on-surface-variant">{inspectedEvent.time}</span>
                </div>
                <div className="text-body-sm text-on-surface mb-1">{inspectedEvent.desc}</div>
                <div className="font-code-sm text-[11px] text-outline">
                  Evidence Reference: <span className="text-secondary font-mono">{inspectedEvent.ref}</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Human-in-the-Loop Decision Panel */}
        <div className="lg:col-span-3 flex flex-col gap-4 sticky top-16">
          
          {/* HUMAN DECISION ACTION BOX */}
          <div className="bg-surface-container-low rounded-lg p-4 border-2 border-primary/40 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#30363d]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">gavel</span>
                <span className="font-headline-sm text-body-md font-bold text-on-surface">Examiner Decision</span>
              </div>
              <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container font-semibold">SUPERVISOR</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
              Empirical machine signal synthesis complete. Formal supervisory adjudication rests strictly with the examiner:
            </p>

            {/* Current Working Status */}
            <div className="p-2.5 rounded bg-surface-container-lowest border border-[#30363d] mb-4">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Active Determination:</span>
                <span className="font-code-sm text-code-sm font-bold text-tertiary">
                  {currentStatus.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-outline mt-1 font-code-sm">
                <span>Assigned: NC-8802</span>
                <span>Role: Lead Examiner</span>
              </div>
            </div>

            {/* 5 Interactive Decision Buttons */}
            <div className="flex flex-col gap-2">
              <button 
                className="w-full flex items-center justify-between px-3 py-2 rounded bg-secondary hover:bg-secondary-fixed-dim text-on-secondary font-semibold text-body-sm transition-all shadow-sm"
                onClick={() => openDecisionModal('VALIDATE')}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Validate Finding</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button 
                className="w-full flex items-center justify-between px-3 py-2 rounded border border-tertiary text-tertiary bg-tertiary-container/10 hover:bg-tertiary-container/20 font-semibold text-body-sm transition-all"
                onClick={() => openDecisionModal('QUALIFY')}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">rule</span>
                  <span>Qualify Finding</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button 
                className="w-full flex items-center justify-between px-3 py-2 rounded border border-error text-error bg-error-container/10 hover:bg-error-container/20 font-semibold text-body-sm transition-all"
                onClick={() => openDecisionModal('REJECT')}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  <span>Reject Candidate</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button 
                className="w-full flex items-center justify-between px-3 py-2 rounded border border-outline-variant text-on-surface bg-surface-container hover:bg-surface-container-high font-semibold text-body-sm transition-all"
                onClick={() => openDecisionModal('OVERRIDE')}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
                  <span>Override Weights</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button 
                className="w-full flex items-center justify-between px-3 py-2 rounded border border-primary text-primary bg-primary-container/10 hover:bg-primary-container/20 font-semibold text-body-sm transition-all"
                onClick={() => openDecisionModal('REQUEST_EVD')}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                  <span>Request Evidence</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>

            {/* Examiner Notes Sub-section */}
            <div className="mt-4 pt-3 border-t border-[#30363d]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-headline-sm text-body-sm font-semibold text-on-surface">Statutory Ledger Note</span>
                <span className="font-code-sm text-[10px] text-outline">CRYPTOGRAPHICALLY LOGGED</span>
              </div>
              <textarea 
                className="w-full p-2 rounded bg-surface-container-lowest border border-[#30363d] text-body-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none resize-none font-body-sm"
                rows={3}
                placeholder="Enter supervisory observations, mitigating circumstances, or statutory justifications..."
                value={examinerNote}
                onChange={(e) => setExaminerNote(e.target.value)}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-outline font-code-sm">Examiner: NC-8802</span>
                <button 
                  className="px-3 py-1 rounded bg-primary-container hover:bg-inverse-primary text-on-primary-container font-medium text-code-sm transition-colors flex items-center gap-1"
                  onClick={handleSaveNote}
                >
                  <span className="material-symbols-outlined text-[14px]">save</span>
                  <span>Commit Note</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sampling & Remediation State Card */}
          <div className="bg-surface-container-low rounded-lg p-3.5 border border-[#30363d]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#30363d]">
              <span className="font-headline-sm text-body-sm font-semibold text-on-surface">Supervisory Sampling</span>
              <span className="font-code-sm text-[10px] text-secondary bg-secondary-container/20 px-1 rounded">ACTIVE CASE</span>
            </div>
            <div className="space-y-2 text-body-sm">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Recommended Sample:</span>
                <Link to="/supervision/sampling" className="font-code-sm text-code-sm text-primary font-medium hover:underline">
                  CASE-1042
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Sampling Strategy:</span>
                <span className="text-on-surface font-code-sm text-code-sm">Risk-Based Priority</span>
              </div>
              <div className="pt-2 border-t border-[#30363d]/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-on-surface-variant">Open Remediation:</span>
                  <Link to="/remediation" className="font-code-sm text-[11px] text-error font-bold hover:underline">
                    REM-0038
                  </Link>
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  Workflow recertification mandated under CTRL-07. Overdue by 14 calendar days.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* LOWER COMPREHENSIVE SECTIONS */}
      <div className="space-y-4">
        
        {/* SUPPORTING EVIDENCE LEDGER */}
        <div className="bg-surface-container-low rounded-lg p-4 border border-[#30363d]">
          <div className="flex flex-wrap items-center justify-between pb-2 mb-3 border-b border-[#30363d] gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">folder_special</span>
              <span className="font-headline-sm text-body-md font-semibold text-on-surface">Supporting Evidence Ledger (Air-Gapped Ingestion Store)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-code-sm text-code-sm text-outline">INGESTION BATCH: BATCH-2026-09-IND</span>
              <button 
                className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-code-sm border border-[#30363d]"
                onClick={() => showToast('All evidence cryptographic checksums re-verified against FIPS ledger.')}
              >
                Verify All Checksums
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-on-surface-variant font-label-caps text-label-caps uppercase">
                  <th className="py-2 px-3">Evidence ID</th>
                  <th className="py-2 px-3">Artifact Description</th>
                  <th className="py-2 px-3">Control Link</th>
                  <th className="py-2 px-3">Presence Status</th>
                  <th className="py-2 px-3">Cryptographic Digest (SHA-256)</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/40 font-code-sm text-code-sm">
                <tr className="hover:bg-surface-container transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-primary">EVD-742</td>
                  <td className="py-2.5 px-3 font-body-sm text-on-surface">Investigation Worklog &amp; SIEM Triage Snapshot</td>
                  <td className="py-2.5 px-3 text-on-surface-variant">CTRL-07.1</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-[11px] font-bold">PRESENT / VERIFIED</span>
                  </td>
                  <td className="py-2.5 px-3 text-outline text-[11px]">8f3b99a1...c031</td>
                  <td className="py-2.5 px-3 text-right">
                    <Link to="/evidence" className="text-primary hover:underline font-code-sm text-[11px]">Inspect Payload</Link>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-primary">EVD-761</td>
                  <td className="py-2.5 px-3 font-body-sm text-on-surface">Containment Execution Log &amp; Firewall ACL Push</td>
                  <td className="py-2.5 px-3 text-on-surface-variant">CTRL-07.4</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-[11px] font-bold">PRESENT / VERIFIED</span>
                  </td>
                  <td className="py-2.5 px-3 text-outline text-[11px]">4e1acc42...90ab</td>
                  <td className="py-2.5 px-3 text-right">
                    <Link to="/evidence" className="text-primary hover:underline font-code-sm text-[11px]">Inspect Payload</Link>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container transition-colors bg-error-container/5">
                  <td className="py-2.5 px-3 font-semibold text-error">ESC-221</td>
                  <td className="py-2.5 px-3 font-body-sm text-error font-medium">Tier-2 Escalation Telemetry &amp; Regulatory Transmission Record</td>
                  <td className="py-2.5 px-3 text-error">CTRL-07.2</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-[11px] font-bold">NOT_SUBMITTED (VOID)</span>
                  </td>
                  <td className="py-2.5 px-3 text-error text-[11px]">------------------------</td>
                  <td className="py-2.5 px-3 text-right">
                    <button 
                      className="text-error font-bold hover:underline font-code-sm text-[11px]"
                      onClick={() => openDecisionModal('REQUEST_EVD')}
                    >
                      Issue Demand
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CRYPTOGRAPHIC PROVENANCE & CHAIN-OF-CUSTODY */}
        <div className="bg-surface-container-low rounded-lg p-4 border border-[#30363d]">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#30363d]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">enhanced_encryption</span>
              <span className="font-headline-sm text-body-md font-semibold text-on-surface">Cryptographic Provenance &amp; Verification Hashes</span>
            </div>
            <span className="font-code-sm text-[11px] text-secondary bg-secondary-container/20 px-2 py-0.5 rounded">FIPS-140-2 LEVEL 3 COMPLIANT</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-code-sm text-code-sm">
            <div className="p-2.5 rounded bg-surface-container border border-[#30363d]">
              <div className="text-[11px] text-on-surface-variant uppercase mb-1">Supervisory Finding Hash</div>
              <div className="text-on-surface font-mono text-[11px] break-all select-all">
                9f8a3c7198df5b3a4a4087bce920436d6a2f7c0042eb88b2c5890e0c1f4b321a
              </div>
              <div className="mt-2 text-right">
                <button 
                  className="text-primary hover:underline text-[11px]"
                  onClick={() => handleCopyDigest('9f8a3c7198df5b3a4a4087bce920436d6a2f7c0042eb88b2c5890e0c1f4b321a')}
                >
                  Copy Hash
                </button>
              </div>
            </div>
            <div className="p-2.5 rounded bg-surface-container border border-[#30363d]">
              <div className="text-[11px] text-on-surface-variant uppercase mb-1">Ingestion Submission ID</div>
              <div className="text-on-surface font-mono text-[12px]">
                SUB-2026-0148 (Air-Gapped TLS 1.3)
              </div>
              <div className="text-[11px] text-outline mt-2">
                Ingested: 26-Sep-2026 14:02:11 IST
              </div>
            </div>
            <div className="p-2.5 rounded bg-surface-container border border-[#30363d]">
              <div className="text-[11px] text-on-surface-variant uppercase mb-1">System Version Manifest</div>
              <div className="text-[11px] text-on-surface space-y-0.5">
                <div>Framework: <span className="text-primary">NCIIPC-CSF-v3.2</span></div>
                <div>Rule Base: <span className="text-secondary">R-2.4-STABLE</span></div>
                <div>Analytics Engine: <span className="text-on-surface font-bold">SAT-AN-1.8.4</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* AUDIT & DECISION HISTORY LEDGER */}
        <div className="bg-surface-container-low rounded-lg p-4 border border-[#30363d]">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#30363d]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-outline text-[18px]">history_edu</span>
              <span className="font-headline-sm text-body-md font-semibold text-on-surface">Audit &amp; Statutory Adjudication Ledger</span>
            </div>
            <span className="font-code-sm text-[11px] text-on-surface-variant">IMMUTABLE LOG</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-on-surface-variant font-label-caps text-label-caps uppercase">
                  <th className="py-2 px-3">Timestamp (IST)</th>
                  <th className="py-2 px-3">Actor / Agent</th>
                  <th className="py-2 px-3">Action Recorded</th>
                  <th className="py-2 px-3">Details / Rationale</th>
                  <th className="py-2 px-3 text-right">Audit Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/40 font-code-sm text-code-sm">
                <tr className="hover:bg-surface-container">
                  <td className="py-2 px-3 text-outline">26-09-2026 14:18:02</td>
                  <td className="py-2 px-3 text-secondary font-medium">SYS:SAT-FUSION-ENG</td>
                  <td className="py-2 px-3 text-on-surface">Finding Synthesized</td>
                  <td className="py-2 px-3 font-body-sm text-on-surface-variant">Elevated from GAP-0071 + NS-0041 multi-signal correlation.</td>
                  <td className="py-2 px-3 text-right text-outline text-[11px]">AUD-99120</td>
                </tr>
                <tr className="hover:bg-surface-container">
                  <td className="py-2 px-3 text-outline">26-09-2026 14:19:10</td>
                  <td className="py-2 px-3 text-primary font-medium">SYS:AUTO-DISPATCH</td>
                  <td className="py-2 px-3 text-on-surface">Assigned to Supervisory Queue</td>
                  <td className="py-2 px-3 font-body-sm text-on-surface-variant">Dispatched to Lead Examiner NC-8802 (NCIIPC Core).</td>
                  <td className="py-2 px-3 text-right text-outline text-[11px]">AUD-99124</td>
                </tr>
                <tr className="hover:bg-surface-container">
                  <td className="py-2 px-3 text-outline">26-09-2026 14:22:45</td>
                  <td className="py-2 px-3 text-on-surface font-semibold">NC-8802 (Examiner)</td>
                  <td className="py-2 px-3 text-tertiary">Workspace Opened</td>
                  <td className="py-2 px-3 font-body-sm text-on-surface-variant">Cryptographic snapshot verified and forensic session initialized.</td>
                  <td className="py-2 px-3 text-right text-outline text-[11px]">AUD-99138</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* PERSISTENT STICKY BOTTOM EXAMINER BAR */}
      <div className="fixed bottom-0 left-[250px] right-0 h-14 bg-surface-container-high/95 backdrop-blur-md border-t border-[#30363d] px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3 font-code-sm text-code-sm">
          <span className="text-on-surface-variant">Target: <strong className="text-on-surface">CSE-014 / CTRL-07</strong></span>
          <span className="text-outline">|</span>
          <span className="text-on-surface-variant">Finding: <strong className="text-primary">{finding.id}</strong></span>
          <span className="text-outline">|</span>
          <span className="text-on-surface-variant">
            Status: <span className="text-tertiary font-bold">{currentStatus.replace('_', ' ')}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="px-3 py-1.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface border border-[#30363d] text-code-sm" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            ↑ Top
          </button>
          <button 
            className="px-3 py-1.5 rounded bg-surface-container text-primary hover:bg-surface-container-high border border-primary/40 text-code-sm"
            onClick={() => openDecisionModal('REQUEST_EVD')}
          >
            Request Evidence
          </button>
          <button 
            className="px-4 py-1.5 rounded bg-secondary hover:bg-secondary-fixed-dim text-on-secondary font-bold text-code-sm"
            onClick={() => openDecisionModal('VALIDATE')}
          >
            Validate Finding
          </button>
        </div>
      </div>

      {/* MODAL DIALOG: EXAMINER STATUTORY DETERMINATION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-[#30363d] rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">policy</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  {modalType === 'VALIDATE' && 'Validate Statutory Non-Compliance'}
                  {modalType === 'QUALIFY' && 'Qualify Finding with Caveats'}
                  {modalType === 'REJECT' && 'Reject Candidate (False Positive)'}
                  {modalType === 'OVERRIDE' && 'Override Model Weightings'}
                  {modalType === 'REQUEST_EVD' && 'Statutory Evidence Demand'}
                </span>
              </div>
              <button className="text-outline hover:text-on-surface" onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="space-y-3 font-body-sm text-body-sm">
              <p className="text-on-surface-variant">
                Please provide statutory justification and official regulatory references for this determination:
              </p>
              <div className="space-y-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Adjudication Code / Legal Reference</label>
                <input 
                  type="text"
                  className="w-full p-2 rounded bg-surface-container-lowest border border-[#30363d] text-body-sm text-on-surface font-code-sm focus:border-primary focus:outline-none"
                  value={adjudicationRef}
                  onChange={(e) => setAdjudicationRef(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Examiner Justification &amp; Directives</label>
                <textarea 
                  rows={3}
                  className="w-full p-2 rounded bg-surface-container-lowest border border-[#30363d] text-body-sm text-on-surface focus:border-primary focus:outline-none"
                  placeholder="Enter findings rationale, specific non-compliance statutory basis, and directive to entity..."
                  value={modalJustification}
                  onChange={(e) => setModalJustification(e.target.value)}
                />
              </div>
              <div className="p-2.5 rounded bg-surface-container text-code-sm text-outline border border-[#30363d]">
                Signed: <span className="text-on-surface">Supervisor NC-8802 (NCIIPC Statutory Authority)</span><br/>
                Notice: Submission triggers automated tamper-evident ledger entry and notifies entity liaison.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#30363d]">
              <button 
                className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-code-sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-1.5 rounded font-bold text-code-sm ${
                  modalType === 'VALIDATE' ? 'bg-secondary text-on-secondary hover:bg-secondary-fixed-dim' :
                  modalType === 'QUALIFY' ? 'bg-tertiary-container text-on-tertiary-container' :
                  modalType === 'REJECT' ? 'bg-error-container text-error' :
                  modalType === 'OVERRIDE' ? 'bg-surface-variant text-on-surface' :
                  'bg-primary-container text-on-primary-container'
                }`}
                onClick={handleConfirmDecision}
              >
                Confirm Adjudication
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 bg-surface-container-high border border-secondary text-on-surface px-4 py-2.5 rounded shadow-xl font-code-sm text-code-sm flex items-center gap-2 z-50">
          <span className="material-symbols-outlined text-secondary text-[18px]">task_alt</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
