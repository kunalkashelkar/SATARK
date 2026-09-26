import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockFindings } from '@/data/mock/findings';
import { Finding, FindingStatus } from '@/types';

interface ExtendedFinding extends Finding {
  sector: string;
  primarySignalLabel: string;
  secondarySignalLabel?: string;
  uncLabel: string;
  caseDocket: string;
  artifactsCount: number;
}

export const FindingsListPage: React.FC = () => {
  // Enhanced findings set matching the Stitch queue design exactly
  const allFindings: ExtendedFinding[] = useMemo(() => [
    {
      ...mockFindings[0], // FND-0142
      sector: 'Energy / Power',
      primarySignalLabel: 'Exec Gap (GAP-0071)',
      secondarySignalLabel: '+ Negative Space',
      uncLabel: 'Strong (Low Unc)',
      caseDocket: 'CASE-1042',
      artifactsCount: 4,
    },
    {
      id: 'FND-0137',
      cseId: 'CSE-014',
      cseName: 'NorthGrid Transmission Sys',
      sector: 'Energy / Power',
      controlId: 'CTRL-12',
      controlName: 'Security Audit Log Cryptographic Integrity (v3.1)',
      title: 'Missing SIEM Hash Stream on Substation Bus 4',
      whyFlagged: 'Operational log archives lacked expected tamper-evident SHA-256 integrity trees for 14 continuous hours.',
      signalType: 'NEGATIVE_SPACE',
      priority: 'HIGH',
      evidenceStrength: 'MEDIUM',
      completeness: 74,
      uncertainty: 'MEDIUM',
      status: 'CANDIDATE',
      expectedState: 'Cryptographic hash trees computed every 15 minutes across all collector pipelines.',
      observedState: 'Zero hashes submitted for collector cluster 04 between 02:00 and 16:00 IST.',
      gapSummary: 'NS-0043: Void in Cryptographic Verification Stream',
      supportingSignals: [
        { type: 'NEGATIVE_SPACE', label: 'Missing SIEM Hash Stream', description: 'Zero audit block receipts recorded.' }
      ],
      timeline: [],
      sourceEvidence: [
        { recordId: 'EVD-711', recordType: 'Log Stream', title: 'Collector 04 Stream Archive', timestamp: '2026-08-12 02:00:00' }
      ],
      provenance: {
        sha256: '2a49b819fbc71029481bce9812948271048bce9284102948120481248194411a',
        submissionId: 'SUB-2026-0814-CSE014',
        sourceSystem: 'NorthGrid Splunk SOAR / OT-SOC Enclave',
        assessmentPeriod: 'Q3 2026',
        controlVersion: 'CTRL-v3.1',
        ruleVersion: 'R-2.4',
        analyticsEngineVersion: 'AN-1.8'
      },
      primarySignalLabel: 'Negative Space',
      secondarySignalLabel: 'Missing SIEM Hash',
      uncLabel: 'Mod (Med Unc)',
      caseDocket: 'CASE-1038',
      artifactsCount: 3,
    },
    {
      id: 'FND-0131',
      cseId: 'CSE-007',
      cseName: 'State Bank of Bharat Interbank Core',
      sector: 'Banking / BFSI',
      controlId: 'CTRL-04',
      controlName: 'Privileged Administrative Access & MFA (v2.4)',
      title: 'Bypassed Mandatory Hardware MFA Step on Gateway',
      whyFlagged: 'Privileged session opened with emergency token without corresponding FIDO2 token challenge.',
      signalType: 'PROCESS_DEVIATION',
      priority: 'HIGH',
      evidenceStrength: 'HIGH',
      completeness: 88,
      uncertainty: 'LOW',
      status: 'VALIDATED',
      expectedState: 'Dual-custody hardware MFA required for all root bastion sessions.',
      observedState: 'Direct credential override logged without token challenge token.',
      gapSummary: 'PD-0019: Direct Access Deviation',
      supportingSignals: [
        { type: 'PROCESS_DEVIATION', label: 'Bypassed MFA Step', description: 'Emergency break-glass procedure skipped verification.' }
      ],
      timeline: [],
      sourceEvidence: [
        { recordId: 'EVD-881', recordType: 'PAM Log', title: 'CyberArk Bastion Session Audit', timestamp: '2026-08-11 11:20:00' }
      ],
      provenance: {
        sha256: '88bca82f91734bc129b71f92e7d3a82fbc625801c4e9124a9829f0e1d52673891',
        submissionId: 'SUB-2026-0820-CSE007',
        sourceSystem: 'Apex Core Gateway Syslog',
        assessmentPeriod: 'Q3 2026',
        controlVersion: 'CTRL-v2.4',
        ruleVersion: 'R-2.4',
        analyticsEngineVersion: 'AN-1.8'
      },
      primarySignalLabel: 'Process Dev (PD-0019)',
      secondarySignalLabel: 'Bypassed MFA Step',
      uncLabel: 'Strong (Low Unc)',
      caseDocket: 'CASE-1029',
      artifactsCount: 5,
    },
    {
      id: 'FND-0128',
      cseId: 'CSE-014',
      cseName: 'NorthGrid Transmission Sys',
      sector: 'Energy / Power',
      controlId: 'CTRL-09',
      controlName: 'Patch Verification on Relay Firewalls (v3.0)',
      title: 'Recurrent Delay in Firmware Advisory Remediations',
      whyFlagged: 'Vulnerability VULN-2026-8819 unpatched for 45 days past statutory 14-day energy sector deadline.',
      signalType: 'HISTORICAL_RECURRENCE',
      priority: 'MEDIUM',
      evidenceStrength: 'HIGH',
      completeness: 91,
      uncertainty: 'LOW',
      status: 'QUALIFIED',
      expectedState: 'Critical ICS CVEs addressed within 14 calendar days.',
      observedState: 'Patch applied on Day 45; mitigated by physical network isolation.',
      gapSummary: 'REC-0014: Repeat Patch Expiration',
      supportingSignals: [
        { type: 'HISTORICAL_RECURRENCE', label: 'Q2/Q4 Pattern Match', description: 'Identical delay pattern observed in 2 previous assessment cycles.' }
      ],
      timeline: [],
      sourceEvidence: [
        { recordId: 'EVD-642', recordType: 'Vulnerability Scan', title: 'Nessus OT Infrastructure Report', timestamp: '2026-08-04 15:00:00' }
      ],
      provenance: {
        sha256: '9124a9829f0e1d526738914bca82f91734bc129b71f92e7d3a82fbc625801c4e',
        submissionId: 'SUB-2026-0814-CSE014',
        sourceSystem: 'NorthGrid Splunk SOAR / OT-SOC Enclave',
        assessmentPeriod: 'Q3 2026',
        controlVersion: 'CTRL-v3.0',
        ruleVersion: 'R-2.4',
        analyticsEngineVersion: 'AN-1.8'
      },
      primarySignalLabel: 'Recurrence',
      secondarySignalLabel: 'Q2/Q4 Pattern Match',
      uncLabel: 'Strong (Low Unc)',
      caseDocket: 'CASE-1017',
      artifactsCount: 4,
    },
    {
      id: 'FND-0119',
      cseId: 'CSE-021',
      cseName: 'Videsh Sanchar Corp Telecom',
      sector: 'Telecom / Fiber',
      controlId: 'CTRL-15',
      controlName: 'Endpoint Detection & Containment Latency (v1.9)',
      title: 'EDR Telemetry Outage During Incident Window',
      whyFlagged: 'Host agent terminated unexpectedly during scanning; containment signal failed transmission.',
      signalType: 'EXECUTION_GAP',
      priority: 'HIGH',
      evidenceStrength: 'MEDIUM',
      completeness: 69,
      uncertainty: 'HIGH',
      status: 'CANDIDATE',
      expectedState: 'Heartbeat signal every 60s from all edge gateways.',
      observedState: 'No heartbeat recorded for 3 hours prior to manual operator reboot.',
      gapSummary: 'GAP-0062: EDR Unresponsive',
      supportingSignals: [
        { type: 'EXECUTION_GAP', label: 'GAP-0062: EDR Silent', description: 'Agent unresponsive during detection.' }
      ],
      timeline: [],
      sourceEvidence: [],
      provenance: {
        sha256: '14bca82f91734bc129b71f92e7d3a82fbc625801c4e9124a9829f0e1d5267389',
        submissionId: 'SUB-2026-0819-CSE021',
        sourceSystem: 'Videsh Core SOC Ingestion',
        assessmentPeriod: 'Q3 2026',
        controlVersion: 'CTRL-v1.9',
        ruleVersion: 'R-2.4',
        analyticsEngineVersion: 'AN-1.8'
      },
      primarySignalLabel: 'Exec Gap (GAP-0062)',
      secondarySignalLabel: 'EDR Unresponsive',
      uncLabel: 'Mod (High Unc)',
      caseDocket: 'CASE-1004',
      artifactsCount: 2,
    },
    {
      id: 'FND-0107',
      cseId: 'CSE-014',
      cseName: 'NorthGrid Transmission Sys',
      sector: 'Energy / Power',
      controlId: 'CTRL-11',
      controlName: 'Substation Bus Telemetry Monitoring (v3.2)',
      title: 'Coverage Void on Substation Bus 4 PLC Links',
      whyFlagged: 'Telemetry gap detected initially, but corroborated as planned scheduled downtime with formal advance notification.',
      signalType: 'COVERAGE_GAP',
      priority: 'LOW',
      evidenceStrength: 'HIGH',
      completeness: 85,
      uncertainty: 'LOW',
      status: 'REJECTED',
      expectedState: 'All busbars active with continuous telemetry.',
      observedState: 'Bus 4 telemetry offline during pre-notified scheduled relay replacement.',
      gapSummary: 'False Positive: Valid Maintenance Window',
      supportingSignals: [
        { type: 'COVERAGE_GAP', label: 'Substation Bus 4 Offline', description: 'Advance waiver filed in NCIIPC portal.' }
      ],
      timeline: [],
      sourceEvidence: [],
      provenance: {
        sha256: 'bc129b71f92e7d3a82fbc625801c4e9124a9829f0e1d526738914bca82f91734',
        submissionId: 'SUB-2026-0814-CSE014',
        sourceSystem: 'NorthGrid Splunk SOAR / OT-SOC Enclave',
        assessmentPeriod: 'Q3 2026',
        controlVersion: 'CTRL-v3.2',
        ruleVersion: 'R-2.4',
        analyticsEngineVersion: 'AN-1.8'
      },
      primarySignalLabel: 'Coverage Gap',
      secondarySignalLabel: 'Substation Bus 4',
      uncLabel: 'Strong (Low Unc)',
      caseDocket: 'CASE-0994',
      artifactsCount: 3,
    },
    {
      id: 'FND-0098',
      cseId: 'CSE-011',
      cseName: 'Reserve Clearing House FinTech',
      sector: 'Banking / BFSI',
      controlId: 'CTRL-07',
      controlName: 'Inter-Bank Transaction Timestamp Synchronization (v2.0)',
      title: 'Timestamp Drift in Settlement Confirmation Packets',
      whyFlagged: 'NTP drift anomaly overridden by director exemption due to verified microsecond hardware clock synchronization standard.',
      signalType: 'CROSS_SOURCE_CONSISTENCY',
      priority: 'MEDIUM',
      evidenceStrength: 'LOW',
      completeness: 58,
      uncertainty: 'HIGH',
      status: 'OVERRIDDEN',
      expectedState: 'Standard NTP drift < 10ms.',
      observedState: 'PTP IEEE-1588 nanosecond clock used instead of standard NTP daemon.',
      gapSummary: 'Director Exemption Granted',
      supportingSignals: [
        { type: 'CROSS_SOURCE_CONSISTENCY', label: 'Timestamp Drift', description: 'System used precision time protocol.' }
      ],
      timeline: [],
      sourceEvidence: [],
      provenance: {
        sha256: '92e7d3a82fbc625801c4e9124a9829f0e1d526738914bca82f91734bc129b71f',
        submissionId: 'SUB-2026-0810-CSE011',
        sourceSystem: 'RCH Financial Telemetry Ingest',
        assessmentPeriod: 'Q3 2026',
        controlVersion: 'CTRL-v2.0',
        ruleVersion: 'R-2.4',
        analyticsEngineVersion: 'AN-1.8'
      },
      primarySignalLabel: 'Inconsistency',
      secondarySignalLabel: 'Timestamp Drift',
      uncLabel: 'Weak (High Unc)',
      caseDocket: 'CASE-0982',
      artifactsCount: 2,
    },
  ], []);

  // Filter & Search states
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('FND-0142');
  const [scopeCse, setScopeCse] = useState<string>('CSE-014');
  const [signalTypeFilter, setSignalTypeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [evidenceStrengthFilter, setEvidenceStrengthFilter] = useState<string>('');
  const [controlFilter, setControlFilter] = useState<string>('');

  // Active selected finding in right-hand drawer
  const [selectedFindingId, setSelectedFindingId] = useState<string>('FND-0142');

  // Filter computation
  const filteredFindings = useMemo(() => {
    return allFindings.filter((item) => {
      // Status pill tab filter
      if (selectedStatusTab !== 'ALL' && item.status !== selectedStatusTab) {
        return false;
      }
      // CSE Scope filter
      if (scopeCse !== 'ALL' && item.cseId !== scopeCse) {
        return false;
      }
      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesCSE = item.cseId.toLowerCase().includes(query) || item.cseName.toLowerCase().includes(query);
        const matchesCase = item.caseDocket.toLowerCase().includes(query);
        const matchesTitle = item.title.toLowerCase().includes(query);
        if (!matchesId && !matchesCSE && !matchesCase && !matchesTitle) {
          return false;
        }
      }
      // Signal type filter
      if (signalTypeFilter && item.signalType !== signalTypeFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter && item.priority !== priorityFilter) {
        return false;
      }
      // Evidence strength filter
      if (evidenceStrengthFilter && item.evidenceStrength !== evidenceStrengthFilter) {
        return false;
      }
      // Control filter
      if (controlFilter && item.controlId !== controlFilter) {
        return false;
      }
      return true;
    });
  }, [allFindings, selectedStatusTab, scopeCse, searchTerm, signalTypeFilter, priorityFilter, evidenceStrengthFilter, controlFilter]);

  const activeFinding = allFindings.find(f => f.id === selectedFindingId) || allFindings[0];

  const handleResetFilters = () => {
    setSelectedStatusTab('ALL');
    setSearchTerm('');
    setScopeCse('ALL');
    setSignalTypeFilter('');
    setPriorityFilter('');
    setEvidenceStrengthFilter('');
    setControlFilter('');
  };

  return (
    <div className="flex flex-col w-full text-on-surface antialiased pb-20">
      
      {/* BREADCRUMB & CONTEXT HEADER */}
      <div className="flex flex-col gap-sm mb-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-xs font-code-sm text-code-sm text-on-surface-variant">
            <span>SAT-SA</span>
            <span>/</span>
            <span>Assessment</span>
            <span>/</span>
            <span className="text-primary font-semibold">Findings</span>
            <span className="ml-sm px-xs py-0.5 rounded bg-surface-container-high text-outline text-[10px] font-mono tracking-wider">v4.8-GOV-FIPS</span>
          </div>

          <div className="flex items-center gap-sm flex-wrap">
            <div className="flex items-center gap-xs px-sm py-xs rounded bg-surface-container-high text-on-surface text-body-sm">
              <span className="material-symbols-outlined text-[16px] text-outline">calendar_month</span>
              <span className="font-code-sm text-code-sm">Assessment Period:</span>
              <select className="bg-transparent font-code-sm text-code-sm text-primary font-semibold focus:outline-none cursor-pointer">
                <option className="bg-surface-container text-on-surface">Q3 2026 (Active Cycle)</option>
                <option className="bg-surface-container text-on-surface">Q2 2026 (Archived)</option>
                <option className="bg-surface-container text-on-surface">Q1 2026 (Archived)</option>
              </select>
            </div>

            <div className="flex items-center gap-xs px-sm py-xs rounded bg-surface-container-high text-on-surface text-body-sm">
              <span className="material-symbols-outlined text-[16px] text-outline">filter_alt</span>
              <span className="font-code-sm text-code-sm">Scope:</span>
              <select 
                className="bg-transparent font-code-sm text-code-sm text-primary font-semibold focus:outline-none cursor-pointer"
                value={scopeCse}
                onChange={(e) => setScopeCse(e.target.value)}
              >
                <option className="bg-surface-container text-on-surface" value="CSE-014">CSE-014 (NorthGrid Energy)</option>
                <option className="bg-surface-container text-on-surface" value="ALL">All Monitored CSEs (6)</option>
                <option className="bg-surface-container text-on-surface" value="CSE-007">CSE-007 (State Bank of Bharat)</option>
                <option className="bg-surface-container text-on-surface" value="CSE-021">CSE-021 (Videsh Sanchar Corp)</option>
                <option className="bg-surface-container text-on-surface" value="CSE-011">CSE-011 (Reserve Clearing House)</option>
              </select>
            </div>

            <button className="flex items-center gap-xs px-sm py-xs rounded bg-surface-container-high hover:bg-surface-container text-on-surface transition-colors font-body-sm text-body-sm shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-outline">file_download</span>
              <span>Export Dossier</span>
            </button>
            <button className="flex items-center gap-xs px-sm py-xs rounded bg-surface-container-high hover:bg-surface-container text-secondary transition-colors font-body-sm text-body-sm shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">sync</span>
              <span className="font-code-sm text-code-sm">Sync Telemetry</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col mt-2">
          <div className="flex items-center gap-md flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Findings &amp; Supervisory Candidates</h1>
            <div className="px-sm py-xs rounded bg-primary-container/20 text-primary font-code-sm text-code-sm font-semibold tracking-wide flex items-center gap-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>SYNTHESIS ENGINE RUN: LIVE (DELTA T -14m)</span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-4xl mt-xs">
            Review evidence-based supervisory finding candidates, supporting signals, evidence strength, uncertainty indicators, and examiner assessment status across critical sector entities.
          </p>
        </div>
      </div>

      {/* STATUTORY SUPERVISORY DOCTRINE BANNER */}
      <div className="p-md rounded bg-surface-container-low mb-lg shadow-sm border border-[#30363d]/60">
        <div className="flex items-start gap-md">
          <div className="p-xs rounded bg-tertiary-container/30 text-tertiary mt-0.5">
            <span className="material-symbols-outlined text-[20px]">gavel</span>
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <div className="flex items-center gap-sm">
              <span className="font-label-caps text-label-caps uppercase text-tertiary font-bold tracking-wider">
                NCIIPC Statutory Supervisory Directive (Section 70A, IT Act)
              </span>
              <span className="font-code-sm text-[11px] text-outline">REF: DIR-2026-FND-SYN</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              <span className="text-on-surface font-semibold">FINDING CANDIDATES INDICATE EVIDENCE DISCREPANCIES REQUIRING EXAMINER EXAMINATION.</span>{' '}
              They do not constitute automatic statutory non-compliance. Human Examiner validation, qualification, or administrative override is mandated before any formal regulatory sanction, penalty proceeding, or CSE compliance scoring downgrade is recorded.
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-xs text-right pr-xs">
            <span className="font-code-sm text-code-sm text-outline">Mandatory SLA: 14 Days</span>
            <span className="font-code-sm text-code-sm text-secondary font-semibold">Active Docket: CASE-1042</span>
          </div>
        </div>
      </div>

      {/* SUMMARY METRICS STRIP (8 Compact Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-sm mb-lg">
        {/* Total Findings */}
        <div className="p-sm rounded bg-surface-container-low border border-[#30363d]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-outline">Total Findings</span>
            <span className="material-symbols-outlined text-[16px] text-outline">inventory_2</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">40</span>
            <span className="font-code-sm text-[11px] text-outline">Across 6 CSEs</span>
          </div>
          <div className="mt-xs pt-xs bg-surface-container-highest/20 flex items-center justify-between font-code-sm text-[11px] text-primary">
            <span>CSE-014:</span>
            <span className="font-bold">8 Scope</span>
          </div>
        </div>

        {/* Candidates */}
        <div className="p-sm rounded bg-surface-container-low border border-[#30363d]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-outline">Candidates</span>
            <span className="material-symbols-outlined text-[16px] text-primary">pending_actions</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md text-primary font-bold">18</span>
            <span className="font-code-sm text-[11px] text-outline">Pending Assign</span>
          </div>
          <div className="mt-xs pt-xs bg-surface-container-highest/20 flex items-center justify-between font-code-sm text-[11px] text-on-surface-variant">
            <span>Unassigned:</span>
            <span className="font-semibold text-primary">12</span>
          </div>
        </div>

        {/* Under Review */}
        <div className="p-sm rounded bg-surface-container-low border border-[#30363d]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-outline">Under Review</span>
            <span className="material-symbols-outlined text-[16px] text-tertiary">query_stats</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md text-tertiary font-bold">10</span>
            <span className="font-code-sm text-[11px] text-outline">Active Inquiries</span>
          </div>
          <div className="mt-xs pt-xs bg-surface-container-highest/20 flex items-center justify-between font-code-sm text-[11px] text-on-surface-variant">
            <span>FND-0142:</span>
            <span className="text-tertiary font-semibold">Active</span>
          </div>
        </div>

        {/* Validated */}
        <div className="p-sm rounded bg-surface-container-low border border-[#30363d]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-outline">Validated</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md text-secondary font-bold">5</span>
            <span className="font-code-sm text-[11px] text-outline">Formal Record</span>
          </div>
          <div className="mt-xs pt-xs bg-surface-container-highest/20 flex items-center justify-between font-code-sm text-[11px] text-on-surface-variant">
            <span>Remediating:</span>
            <span className="text-secondary font-semibold">5 / 5</span>
          </div>
        </div>

        {/* Qualified */}
        <div className="p-sm rounded bg-surface-container-low border border-[#30363d]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-outline">Qualified</span>
            <span className="material-symbols-outlined text-[16px] text-primary">rule_folder</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">3</span>
            <span className="font-code-sm text-[11px] text-outline">Context Note</span>
          </div>
          <div className="mt-xs pt-xs bg-surface-container-highest/20 flex items-center justify-between font-code-sm text-[11px] text-on-surface-variant">
            <span>Mitigated:</span>
            <span className="text-on-surface font-semibold">3 Active</span>
          </div>
        </div>

        {/* Rejected */}
        <div className="p-sm rounded bg-surface-container-low border border-[#30363d]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-outline">Rejected</span>
            <span className="material-symbols-outlined text-[16px] text-outline">cancel</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md text-on-surface-variant font-bold">2</span>
            <span className="font-code-sm text-[11px] text-outline">False Anomaly</span>
          </div>
          <div className="mt-xs pt-xs bg-surface-container-highest/20 flex items-center justify-between font-code-sm text-[11px] text-on-surface-variant">
            <span>Audit Trail:</span>
            <span className="text-outline font-semibold">Signed</span>
          </div>
        </div>

        {/* Overridden */}
        <div className="p-sm rounded bg-surface-container-low border border-[#30363d]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-outline">Overridden</span>
            <span className="material-symbols-outlined text-[16px] text-tertiary">admin_panel_settings</span>
          </div>
          <div className="flex items-baseline gap-xs">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">2</span>
            <span className="font-code-sm text-[11px] text-outline">Director Exemption</span>
          </div>
          <div className="mt-xs pt-xs bg-surface-container-highest/20 flex items-center justify-between font-code-sm text-[11px] text-on-surface-variant">
            <span>Policy Waiver:</span>
            <span className="text-tertiary font-semibold">FIPS-02</span>
          </div>
        </div>

        {/* Severity Profile */}
        <div className="p-sm rounded bg-surface-container-low border border-[#30363d]/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-xs">
            <span className="font-label-caps text-label-caps uppercase text-outline">Severity Profile</span>
            <span className="material-symbols-outlined text-[16px] text-error">warning</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between">
              <span className="font-code-md text-code-md text-error font-bold">4 Crit</span>
              <span className="font-code-md text-code-md text-tertiary font-bold">12 High</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1 flex overflow-hidden">
              <div className="bg-error h-full" style={{ width: '10%' }}></div>
              <div className="bg-tertiary h-full" style={{ width: '30%' }}></div>
              <div className="bg-primary h-full" style={{ width: '45%' }}></div>
              <div className="bg-secondary h-full" style={{ width: '15%' }}></div>
            </div>
          </div>
          <div className="mt-xs pt-xs bg-surface-container-highest/20 flex items-center justify-between font-code-sm text-[10px] text-outline">
            <span>CSE-014: 1C 3H 3M 1L</span>
          </div>
        </div>
      </div>

      {/* STATUS PILLS & COMPREHENSIVE FILTER ENGINE */}
      <div className="flex flex-col gap-sm p-md rounded bg-surface-container-low mb-lg shadow-sm border border-[#30363d]/60">
        
        {/* Quick Status Pill Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-sm">
          <div className="flex items-center gap-xs overflow-x-auto pb-1 max-w-full">
            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm font-semibold flex items-center gap-xs transition-colors ${
                selectedStatusTab === 'ALL' 
                  ? 'bg-primary-container text-on-primary-container' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
              onClick={() => setSelectedStatusTab('ALL')}
            >
              <span>All Findings</span>
              <span className="px-1.5 py-0.2 rounded bg-on-primary-container/20 text-[10px]">{allFindings.length}</span>
            </button>

            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm transition-colors flex items-center gap-xs ${
                selectedStatusTab === 'CANDIDATE' 
                  ? 'bg-primary-container text-on-primary-container font-semibold' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
              onClick={() => setSelectedStatusTab('CANDIDATE')}
            >
              <span>Candidates</span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-primary text-[10px]">
                {allFindings.filter(f => f.status === 'CANDIDATE').length}
              </span>
            </button>

            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm transition-colors flex items-center gap-xs ${
                selectedStatusTab === 'UNDER_REVIEW' 
                  ? 'bg-surface-container-high text-tertiary font-bold border border-tertiary/40' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
              onClick={() => setSelectedStatusTab('UNDER_REVIEW')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              <span>Under Review</span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-tertiary text-[10px]">
                {allFindings.filter(f => f.status === 'UNDER_REVIEW').length}
              </span>
            </button>

            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm transition-colors flex items-center gap-xs ${
                selectedStatusTab === 'VALIDATED' 
                  ? 'bg-surface-container-high text-secondary font-bold border border-secondary/40' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
              onClick={() => setSelectedStatusTab('VALIDATED')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>Validated</span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-secondary text-[10px]">
                {allFindings.filter(f => f.status === 'VALIDATED').length}
              </span>
            </button>

            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm transition-colors flex items-center gap-xs ${
                selectedStatusTab === 'QUALIFIED' 
                  ? 'bg-surface-container-high text-primary font-bold border border-primary/40' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
              onClick={() => setSelectedStatusTab('QUALIFIED')}
            >
              <span>Qualified</span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-outline text-[10px]">
                {allFindings.filter(f => f.status === 'QUALIFIED').length}
              </span>
            </button>

            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm transition-colors flex items-center gap-xs ${
                selectedStatusTab === 'REJECTED' 
                  ? 'bg-surface-container-high text-error font-bold border border-error/40' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
              onClick={() => setSelectedStatusTab('REJECTED')}
            >
              <span>Rejected</span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-outline text-[10px]">
                {allFindings.filter(f => f.status === 'REJECTED').length}
              </span>
            </button>

            <button 
              className={`px-sm py-xs rounded font-code-sm text-code-sm transition-colors flex items-center gap-xs ${
                selectedStatusTab === 'OVERRIDDEN' 
                  ? 'bg-surface-container-high text-on-surface font-bold border border-outline' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
              onClick={() => setSelectedStatusTab('OVERRIDDEN')}
            >
              <span>Overridden</span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-outline text-[10px]">
                {allFindings.filter(f => f.status === 'OVERRIDDEN').length}
              </span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-sm">
            <button 
              className="px-sm py-xs rounded bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-body-sm text-body-sm flex items-center gap-xs"
              onClick={handleResetFilters}
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset Filters</span>
            </button>
            <Link 
              to="/findings/FND-0142"
              className="px-sm py-xs rounded bg-primary text-on-primary hover:bg-primary-fixed transition-colors font-body-sm text-body-sm font-semibold flex items-center gap-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
              <span>Open Lead Candidate (FND-0142)</span>
            </Link>
          </div>
        </div>

        {/* Filter Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-sm pt-xs">
          <div className="relative lg:col-span-2">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-outline text-[18px]">search</span>
            <input 
              type="text"
              className="w-full pl-9 pr-sm py-xs bg-surface-container text-on-surface font-code-sm text-code-sm rounded focus:bg-surface-container-high focus:outline-none placeholder:text-outline border border-[#30363d]/40"
              placeholder="Search finding ID, CSE, docket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <select 
              className="w-full px-sm py-xs bg-surface-container text-on-surface font-code-sm text-code-sm rounded focus:bg-surface-container-high focus:outline-none border border-[#30363d]/40"
              value={signalTypeFilter}
              onChange={(e) => setSignalTypeFilter(e.target.value)}
            >
              <option value="">All Signal Types</option>
              <option value="EXECUTION_GAP">Execution Gap (Primary)</option>
              <option value="NEGATIVE_SPACE">Negative Space</option>
              <option value="PROCESS_DEVIATION">Process Deviation</option>
              <option value="HISTORICAL_RECURRENCE">Historical Recurrence</option>
              <option value="CROSS_SOURCE_CONSISTENCY">Evidence Inconsistency</option>
              <option value="COVERAGE_GAP">Coverage Gap</option>
            </select>
          </div>

          <div className="flex flex-col">
            <select 
              className="w-full px-sm py-xs bg-surface-container text-on-surface font-code-sm text-code-sm rounded focus:bg-surface-container-high focus:outline-none border border-[#30363d]/40"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div className="flex flex-col">
            <select 
              className="w-full px-sm py-xs bg-surface-container text-on-surface font-code-sm text-code-sm rounded focus:bg-surface-container-high focus:outline-none border border-[#30363d]/40"
              value={evidenceStrengthFilter}
              onChange={(e) => setEvidenceStrengthFilter(e.target.value)}
            >
              <option value="">Evidence Strength</option>
              <option value="HIGH">Strong (≥ 80%)</option>
              <option value="MEDIUM">Moderate (60-79%)</option>
              <option value="LOW">Weak (&lt; 60%)</option>
            </select>
          </div>

          <div className="flex flex-col">
            <select 
              className="w-full px-sm py-xs bg-surface-container text-on-surface font-code-sm text-code-sm rounded focus:bg-surface-container-high focus:outline-none border border-[#30363d]/40"
              value={controlFilter}
              onChange={(e) => setControlFilter(e.target.value)}
            >
              <option value="">All Controls</option>
              <option value="CTRL-07">CTRL-07 (Boundary / Escalation)</option>
              <option value="CTRL-12">CTRL-12 (Log Integrity &amp; SIEM)</option>
              <option value="CTRL-04">CTRL-04 (Access &amp; Identity)</option>
              <option value="CTRL-09">CTRL-09 (Patch Verification)</option>
              <option value="CTRL-11">CTRL-11 (Telemetry Coverage)</option>
              <option value="CTRL-15">CTRL-15 (Malware &amp; Endpoint)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SPLIT SCREEN INSPECTION LAYOUT (Table 7 Cols : Detail Drawer 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start mb-xl">
        
        {/* LEFT PANEL: PRIMARY FINDINGS TABLE (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-sm">
          <div className="flex items-center justify-between p-sm rounded bg-surface-container-low border border-[#30363d]/60">
            <div className="flex items-center gap-xs font-label-caps text-label-caps uppercase text-on-surface-variant font-bold tracking-wider">
              <span className="material-symbols-outlined text-[16px] text-primary">format_list_bulleted</span>
              <span>Corroborated Supervisory Candidates (Filtered: {filteredFindings.length} Total)</span>
            </div>
            <div className="flex items-center gap-xs font-code-sm text-[11px] text-outline">
              <span>Sort: Risk Rank DESC</span>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="w-full overflow-x-auto rounded bg-surface-container-low shadow-sm border border-[#30363d]/60">
            <table className="w-full text-left font-body-sm text-body-sm text-on-surface">
              <thead className="bg-surface-container font-label-caps text-label-caps text-outline uppercase tracking-wider">
                <tr>
                  <th className="py-sm px-sm">Finding ID</th>
                  <th className="py-sm px-sm">CSE &amp; Sector</th>
                  <th className="py-sm px-sm">Control</th>
                  <th className="py-sm px-sm">Signals</th>
                  <th className="py-sm px-sm">Priority</th>
                  <th className="py-sm px-sm">Strength</th>
                  <th className="py-sm px-sm">Status</th>
                  <th className="py-sm px-sm text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/40">
                {filteredFindings.map((finding) => {
                  const isSelected = finding.id === selectedFindingId;
                  return (
                    <tr 
                      key={finding.id}
                      className={`hover:bg-surface-container transition-colors cursor-pointer relative ${
                        isSelected ? 'bg-surface-container font-medium' : ''
                      }`}
                      onClick={() => setSelectedFindingId(finding.id)}
                    >
                      <td className="py-sm px-sm font-code-md text-code-md font-bold text-primary flex items-center gap-xs">
                        {isSelected && (
                          <span className="w-1.5 h-6 rounded-full bg-primary absolute left-0 top-2.5"></span>
                        )}
                        <span>{finding.id}</span>
                      </td>

                      <td className="py-sm px-sm">
                        <div className="font-semibold text-on-surface">{finding.cseId}</div>
                        <div className="font-code-sm text-[11px] text-outline">{finding.sector}</div>
                      </td>

                      <td className="py-sm px-sm">
                        <span className="px-xs py-0.5 rounded bg-surface-container-highest font-code-sm text-code-sm text-on-surface">
                          {finding.controlId}
                        </span>
                      </td>

                      <td className="py-sm px-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-code-sm text-[11px] font-medium ${
                            finding.signalType === 'EXECUTION_GAP' ? 'text-error' :
                            finding.signalType === 'NEGATIVE_SPACE' ? 'text-tertiary' :
                            finding.signalType === 'PROCESS_DEVIATION' ? 'text-primary' :
                            'text-on-surface'
                          }`}>
                            {finding.primarySignalLabel}
                          </span>
                          {finding.secondarySignalLabel && (
                            <span className="font-code-sm text-[10px] text-outline">{finding.secondarySignalLabel}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-sm px-sm">
                        {finding.priority === 'CRITICAL' && (
                          <span className="px-xs py-0.5 rounded bg-error-container/30 text-error font-code-sm text-[11px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>CRIT
                          </span>
                        )}
                        {finding.priority === 'HIGH' && (
                          <span className="px-xs py-0.5 rounded bg-tertiary-container/20 text-tertiary font-code-sm text-[11px] font-semibold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>HIGH
                          </span>
                        )}
                        {finding.priority === 'MEDIUM' && (
                          <span className="px-xs py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-code-sm text-[11px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>MED
                          </span>
                        )}
                        {finding.priority === 'LOW' && (
                          <span className="px-xs py-0.5 rounded bg-surface-container-highest text-outline font-code-sm text-[11px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>LOW
                          </span>
                        )}
                      </td>

                      <td className="py-sm px-sm">
                        <div className="flex flex-col">
                          <span className="font-code-sm text-code-sm font-bold text-secondary">{finding.completeness}%</span>
                          <span className="font-label-caps text-[9px] uppercase text-outline">{finding.uncLabel}</span>
                        </div>
                      </td>

                      <td className="py-sm px-sm">
                        {finding.status === 'UNDER_REVIEW' && (
                          <span className="px-xs py-0.5 rounded bg-tertiary-container/30 text-tertiary font-code-sm text-[11px] font-semibold uppercase">
                            Under Review
                          </span>
                        )}
                        {finding.status === 'VALIDATED' && (
                          <span className="px-xs py-0.5 rounded bg-secondary-container/20 text-secondary font-code-sm text-[11px] font-bold">
                            VALIDATED
                          </span>
                        )}
                        {finding.status === 'CANDIDATE' && (
                          <span className="px-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-code-sm text-[11px]">
                            CANDIDATE
                          </span>
                        )}
                        {finding.status === 'QUALIFIED' && (
                          <span className="px-xs py-0.5 rounded bg-primary-container/20 text-primary font-code-sm text-[11px]">
                            QUALIFIED
                          </span>
                        )}
                        {finding.status === 'REJECTED' && (
                          <span className="px-xs py-0.5 rounded bg-surface-container text-outline font-code-sm text-[11px]">
                            REJECTED
                          </span>
                        )}
                        {finding.status === 'OVERRIDDEN' && (
                          <span className="px-xs py-0.5 rounded bg-surface-container-highest text-tertiary font-code-sm text-[11px]">
                            OVERRIDDEN
                          </span>
                        )}
                      </td>

                      <td className="py-sm px-sm text-right">
                        <Link 
                          to={`/findings/${finding.id}`}
                          className={`p-xs rounded transition-colors inline-flex items-center justify-center ${
                            isSelected 
                              ? 'bg-primary text-on-primary' 
                              : 'hover:bg-surface-container-highest text-outline hover:text-on-surface'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION & METADATA FOOTER */}
          <div className="flex items-center justify-between p-sm rounded bg-surface-container-low font-code-sm text-code-sm text-outline border border-[#30363d]/60">
            <div>Showing 1 - {filteredFindings.length} of 40 Total Findings (CSE-014: 8 candidates)</div>
            <div className="flex items-center gap-xs">
              <button className="px-sm py-xs rounded bg-surface-container text-on-surface hover:bg-surface-container-high disabled:opacity-40" disabled>Previous</button>
              <span className="px-sm py-xs rounded bg-surface-container-high text-primary font-bold">1</span>
              <button className="px-sm py-xs rounded bg-surface-container text-on-surface hover:bg-surface-container-high">2</button>
              <button className="px-sm py-xs rounded bg-surface-container text-on-surface hover:bg-surface-container-high">Next</button>
            </div>
          </div>

          {/* CORRELATED SOC ARCHITECTURE CONTEXT */}
          <div className="p-md rounded bg-surface-container-low shadow-sm border border-[#30363d]/60 mt-xs">
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-caps text-label-caps uppercase text-outline font-bold tracking-wider">Supervisory Entity Telemetry Profile</span>
              <span className="font-code-sm text-code-sm text-secondary">Status: AIR-GAP CONNECTED</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
              <div className="p-sm rounded bg-surface-container border border-[#30363d]/40">
                <span className="font-label-caps text-[10px] uppercase text-outline block mb-0.5">Entity Monitored</span>
                <span className="font-body-md text-body-md font-bold text-on-surface">{activeFinding.cseName}</span>
                <span className="font-code-sm text-[11px] text-primary block mt-0.5">{activeFinding.cseId} (Sector: {activeFinding.sector})</span>
              </div>
              <div className="p-sm rounded bg-surface-container border border-[#30363d]/40">
                <span className="font-label-caps text-[10px] uppercase text-outline block mb-0.5">Telemetry Integrity</span>
                <span className="font-body-md text-body-md font-bold text-secondary">96.8% Validated</span>
                <span className="font-code-sm text-[11px] text-outline block mt-0.5">384 Logs Parsed / Q3</span>
              </div>
              <div className="p-sm rounded bg-surface-container border border-[#30363d]/40">
                <span className="font-label-caps text-[10px] uppercase text-outline block mb-0.5">Assigned Examiner</span>
                <span className="font-body-md text-body-md font-bold text-on-surface">Lead Examiner NC-8802</span>
                <span className="font-code-sm text-[11px] text-outline block mt-0.5">NCIIPC Sub-Division 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: ACTIVE FINDING DETAIL DRAWER (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-sm">
          
          {/* DRAWER HEADER & ACTION STRIP */}
          <div className="p-md rounded bg-surface-container-low shadow-md border border-[#30363d]/60">
            <div className="flex items-center justify-between mb-xs">
              <div className="flex items-center gap-xs">
                {activeFinding.priority === 'CRITICAL' && (
                  <span className="px-xs py-0.5 rounded bg-error-container/30 text-error font-code-sm text-code-sm font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                    CRITICAL PRIORITY
                  </span>
                )}
                {activeFinding.priority === 'HIGH' && (
                  <span className="px-xs py-0.5 rounded bg-tertiary-container/30 text-tertiary font-code-sm text-code-sm font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    HIGH PRIORITY
                  </span>
                )}
                <span className="px-xs py-0.5 rounded bg-tertiary-container/30 text-tertiary font-code-sm text-code-sm font-semibold uppercase">
                  {activeFinding.status.replace('_', ' ')}
                </span>
              </div>
              <span className="font-code-sm text-code-sm text-outline">SYNTH: R-2.4 (AN-1.8)</span>
            </div>

            <div className="flex items-baseline justify-between mt-sm">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-outline font-bold tracking-wider">Candidate Record</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">{activeFinding.id}</h2>
              </div>
              <div className="text-right">
                <span className="font-label-caps text-label-caps uppercase text-outline font-bold tracking-wider">Linked Case Docket</span>
                <div className="font-code-md text-code-md text-primary font-bold">{activeFinding.caseDocket}</div>
              </div>
            </div>

            <div className="flex items-center gap-md mt-sm pt-sm bg-surface-container-highest/20 font-body-sm text-body-sm text-on-surface-variant flex-wrap">
              <div>Entity: <span className="font-semibold text-on-surface">{activeFinding.cseId}</span> ({activeFinding.cseName})</div>
              <div>•</div>
              <div>Control: <span className="font-mono text-primary font-semibold">{activeFinding.controlId}</span></div>
              <div>•</div>
              <div>Period: <span className="font-mono text-on-surface">Q3 2026</span></div>
            </div>
          </div>

          {/* PRIMARY CALL TO ACTION: EXAMINER WORKSPACE DIRECT */}
          <div className="p-md rounded bg-surface-container shadow-sm flex flex-col gap-sm border border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[20px] text-primary">security</span>
                <span className="font-body-md text-body-md font-bold text-on-surface">Examiner Decision Engine</span>
              </div>
              <span className="font-code-sm text-code-sm text-secondary">Active Session</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Submit human qualification, formal validation into the statutory record, or override with justification.
            </p>
            <Link 
              to={`/findings/${activeFinding.id}`}
              className="w-full py-sm px-md rounded bg-primary text-on-primary hover:bg-primary-fixed transition-colors font-body-md text-body-md font-bold flex items-center justify-center gap-sm shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
              <span>Open Examiner Workspace (/findings/{activeFinding.id})</span>
            </Link>

            <div className="grid grid-cols-3 gap-xs pt-xs">
              <Link 
                to="/analytics/execution-gaps" 
                className="py-xs px-xs rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-code-sm text-[11px] text-center transition-colors border border-[#30363d]/40"
              >
                GAP-0071 View
              </Link>
              <Link 
                to="/analytics/negative-space" 
                className="py-xs px-xs rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-code-sm text-[11px] text-center transition-colors border border-[#30363d]/40"
              >
                NS-0041 Audit
              </Link>
              <Link 
                to="/analytics/historical-intelligence" 
                className="py-xs px-xs rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-code-sm text-[11px] text-center transition-colors border border-[#30363d]/40"
              >
                Historic Diff
              </Link>
            </div>
          </div>

          {/* FINDING REASONING CHAIN (Multi-Signal Evidence Fusion) */}
          <div className="p-md rounded bg-surface-container-low shadow-sm flex flex-col gap-md border border-[#30363d]/60">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-outline font-bold tracking-wider">Finding Reasoning Chain &amp; Synthesis</span>
              <span className="px-xs py-0.5 rounded bg-primary-container/20 text-primary font-code-sm text-[10px]">Deterministic Logic</span>
            </div>

            {/* Expected vs Observed Contrast Box */}
            <div className="flex flex-col gap-xs p-sm rounded bg-surface-container border border-[#30363d]/40">
              <div className="flex flex-col gap-0.5">
                <span className="font-label-caps text-[10px] uppercase text-outline font-bold">Mandated Baseline (CTRL-07 v3.2)</span>
                <div className="font-body-sm text-body-sm text-on-surface">
                  {activeFinding.expectedState}
                </div>
              </div>
              <div className="flex flex-col gap-0.5 pt-xs border-t border-[#30363d]/40 mt-xs">
                <span className="font-label-caps text-[10px] uppercase text-error font-bold">Observed Supervisory Telemetry</span>
                <div className="font-body-sm text-body-sm text-error">
                  {activeFinding.observedState}
                </div>
              </div>
            </div>

            {/* 4-Signal Fusion Grid */}
            <div className="flex flex-col gap-xs">
              <span className="font-label-caps text-[10px] uppercase text-outline font-bold">Corroborating Signal Fusion (4 Vectors)</span>
              
              <div className="p-xs rounded bg-surface-container flex items-start gap-sm border border-error/30">
                <div className="p-1 rounded bg-error-container/40 text-error mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">rule_folder</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-xs">
                    <span className="font-code-sm text-code-sm text-error font-bold">Primary: GAP-0071</span>
                    <span className="font-code-sm text-[10px] text-outline">• Execution Gap</span>
                  </div>
                  <span className="font-body-sm text-[12px] text-on-surface-variant">Step 4 (Escalate to Tier-2 CERT) completely omitted in workflow run.</span>
                </div>
              </div>

              <div className="p-xs rounded bg-surface-container flex items-start gap-sm border border-tertiary/30">
                <div className="p-1 rounded bg-tertiary-container/40 text-tertiary mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">contrast</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-xs">
                    <span className="font-code-sm text-code-sm text-tertiary font-bold">Supporting: NS-0041</span>
                    <span className="font-code-sm text-[10px] text-outline">• Negative Space</span>
                  </div>
                  <span className="font-body-sm text-[12px] text-on-surface-variant">Expected artifact ESC-221 was not generated during incident lifecycle.</span>
                </div>
              </div>

              <div className="p-xs rounded bg-surface-container flex items-start gap-sm border border-[#30363d]/40">
                <div className="p-1 rounded bg-primary-container/40 text-primary mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">history</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-xs">
                    <span className="font-code-sm text-code-sm text-primary font-bold">Supporting: HIST-REC</span>
                    <span className="font-code-sm text-[10px] text-outline">• Historical Recurrence</span>
                  </div>
                  <span className="font-body-sm text-[12px] text-on-surface-variant">Identical escalation gaps observed in Q2 2025 (GAP-0032) and Q4 2025 (GAP-0051).</span>
                </div>
              </div>

              <div className="p-xs rounded bg-surface-container flex items-start gap-sm border border-[#30363d]/40">
                <div className="p-1 rounded bg-surface-container-highest text-on-surface mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">account_tree</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-xs">
                    <span className="font-code-sm text-code-sm text-on-surface font-bold">Supporting: PD-0031</span>
                    <span className="font-code-sm text-[10px] text-outline">• Process Deviation</span>
                  </div>
                  <span className="font-body-sm text-[12px] text-on-surface-variant">Premature jump from initial investigation directly to case closure at 17:42.</span>
                </div>
              </div>
            </div>
          </div>

          {/* EVIDENCE STRENGTH & QUALITY METRICS */}
          <div className="p-md rounded bg-surface-container-low shadow-sm flex flex-col gap-sm border border-[#30363d]/60">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-outline font-bold tracking-wider">Evidence Quality &amp; Confidence</span>
              <span className="px-xs py-0.5 rounded bg-secondary-container/20 text-secondary font-code-sm text-[10px] font-bold">Uncertainty: LOW</span>
            </div>
            <div className="grid grid-cols-4 gap-xs text-center py-xs">
              <div className="p-xs rounded bg-surface-container border border-[#30363d]/30">
                <span className="font-label-caps text-[9px] uppercase text-outline block">Strength</span>
                <span className="font-code-md text-code-md font-bold text-secondary">Strong</span>
              </div>
              <div className="p-xs rounded bg-surface-container border border-[#30363d]/30">
                <span className="font-label-caps text-[9px] uppercase text-outline block">Complete</span>
                <span className="font-code-md text-code-md font-bold text-primary">{activeFinding.completeness}%</span>
              </div>
              <div className="p-xs rounded bg-surface-container border border-[#30363d]/30">
                <span className="font-label-caps text-[9px] uppercase text-outline block">Traceable</span>
                <span className="font-code-md text-code-md font-bold text-secondary">91%</span>
              </div>
              <div className="p-xs rounded bg-surface-container border border-[#30363d]/30">
                <span className="font-label-caps text-[9px] uppercase text-outline block">Integrity</span>
                <span className="font-code-md text-code-md font-bold text-secondary">96%</span>
              </div>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant bg-surface-container p-xs rounded border border-[#30363d]/40">
              <span className="text-on-surface font-semibold">Integrity Proof:</span> Primary telemetry traceable with SHA-256 notarization across 3 corroborating systems (ITSM, Syslog-NG, and SIEM Ingest).
            </p>
          </div>

          {/* CORRELATED EVIDENCE ARTIFACTS TABLE */}
          <div className="p-md rounded bg-surface-container-low shadow-sm flex flex-col gap-sm border border-[#30363d]/60">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-outline font-bold tracking-wider">Correlated Dossier Artifacts</span>
              <span className="font-code-sm text-[11px] text-outline">4 Required Elements</span>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left font-body-sm text-[12px]">
                <thead className="bg-surface-container font-label-caps text-[10px] text-outline uppercase">
                  <tr>
                    <th className="py-xs px-xs">Artifact ID</th>
                    <th className="py-xs px-xs">Type</th>
                    <th className="py-xs px-xs">Source</th>
                    <th className="py-xs px-xs">Status</th>
                    <th className="py-xs px-xs text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]/30">
                  <tr className="hover:bg-surface-container/40">
                    <td className="py-xs px-xs font-mono font-bold text-primary">ALR-8821</td>
                    <td className="py-xs px-xs text-on-surface">Alert Log</td>
                    <td className="py-xs px-xs text-outline">SIEM Ingest</td>
                    <td className="py-xs px-xs"><span className="px-1 rounded bg-secondary-container/20 text-secondary text-[10px] font-bold">PRESENT</span></td>
                    <td className="py-xs px-xs text-right font-mono text-[10px] text-secondary">SHA-256 OK</td>
                  </tr>
                  <tr className="hover:bg-surface-container/40">
                    <td className="py-xs px-xs font-mono font-bold text-primary">CASE-1042</td>
                    <td className="py-xs px-xs text-on-surface">Docket Record</td>
                    <td className="py-xs px-xs text-outline">ITSM Core</td>
                    <td className="py-xs px-xs"><span className="px-1 rounded bg-secondary-container/20 text-secondary text-[10px] font-bold">PRESENT</span></td>
                    <td className="py-xs px-xs text-right font-mono text-[10px] text-secondary">SHA-256 OK</td>
                  </tr>
                  <tr className="hover:bg-surface-container/40">
                    <td className="py-xs px-xs font-mono font-bold text-primary">INV-338</td>
                    <td className="py-xs px-xs text-on-surface">Analyst Notes</td>
                    <td className="py-xs px-xs text-outline">SOC Desk</td>
                    <td className="py-xs px-xs"><span className="px-1 rounded bg-secondary-container/20 text-secondary text-[10px] font-bold">PRESENT</span></td>
                    <td className="py-xs px-xs text-right font-mono text-[10px] text-secondary">SHA-256 OK</td>
                  </tr>
                  <tr className="bg-error-container/10">
                    <td className="py-xs px-xs font-mono font-bold text-error">ESC-221</td>
                    <td className="py-xs px-xs text-error font-medium">Escalation Rec</td>
                    <td className="py-xs px-xs text-outline">SOC Workflow</td>
                    <td className="py-xs px-xs"><span className="px-1 rounded bg-error-container/40 text-error text-[10px] font-bold">NOT SUBMITTED</span></td>
                    <td className="py-xs px-xs text-right font-mono text-[10px] text-error font-bold">MISSING</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
