import { Finding } from '@/types';

export const mockFindings: Finding[] = [
  {
    id: 'FND-0142',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Transmission Sys',
    controlId: 'CTRL-07',
    controlName: 'Mandatory Tier-2 Escalation Protocol (v3.2)',
    title: 'Execution Gap in Escalation Handling',
    whyFlagged: 'Investigation process bypassed mandatory Tier-2 regulatory transmission protocol within statutory time window. Alert ALR-44218 was closed in CASE-1042 without required Level-2 incident escalation token.',
    signalType: 'EXECUTION_GAP',
    priority: 'CRITICAL',
    evidenceStrength: 'HIGH',
    completeness: 78,
    uncertainty: 'LOW',
    status: 'UNDER_REVIEW',
    expectedState: 'Mandatory Tier-2 regulatory escalation required within 30 minutes for critical OT telemetry anomalies prior to case closure.',
    observedState: 'Investigation marked resolved and closed directly at 10:22 without recording Tier-2 escalation gateway token or supervisor authorization.',
    gapSummary: 'GAP-0071: Missing Mandatory Tier-2 Escalation Step',
    supportingSignals: [
      {
        type: 'EXECUTION_GAP',
        label: 'GAP-0071: Missing Escalation Step',
        description: 'Mandatory Tier-2 regulatory escalation token completely omitted from CASE-1042 audit sequence.'
      },
      {
        type: 'NEGATIVE_SPACE',
        label: 'NS-0041: Candidate Negative Space in SCADA Log Stream',
        description: 'Absence of expected substation telemetry audit trail during the 09:15-10:30 incident window.'
      },
      {
        type: 'PROCESS_DEVIATION',
        label: 'PD-0031: Gateway Token Bypass in Case Closure',
        description: 'Premature transition from Investigation directly into Closure state in SOAR event log.'
      },
      {
        type: 'CROSS_SOURCE_CONSISTENCY',
        label: 'CON-0018: Inconsistency Between Alert Priority & Resolution Disposition',
        description: 'SIEM logged priority as CRITICAL OT BREACH while ticket disposition recorded benign maintenance.'
      },
      {
        type: 'HISTORICAL_RECURRENCE',
        label: 'Historical Recurrence: 3rd Breach across 4 Evaluation Cycles',
        description: 'Similar unescalated critical closure pattern identified in Q2 2025 and Q1 2026.'
      }
    ],
    timeline: [
      { time: '09:12:04', event: 'Alert Created (ALR-44218)', type: 'alert', description: 'SCADA PLC boundary telemetry integrity alarm triggered on Substation 4B' },
      { time: '09:18:22', event: 'Case Opened (CASE-1042)', type: 'case', description: 'Incident assigned to Shift Forensics Analyst A-04' },
      { time: '09:31:10', event: 'Investigation Commenced', type: 'investigation', description: 'Analyst queried endpoint access logs; noted unusual packet sequence' },
      { time: '10:04:15', event: 'Investigation Note Updated', type: 'investigation', description: 'Logged potential routine maintenance overlap; recommended review' },
      { time: '10:16:00', event: 'Response Action Dispatched', type: 'response', description: 'Internal ticket forwarded to field relay engineer' },
      { time: '10:20:00', event: 'Expected Mandatory Escalation Omitted (GAP-0071)', type: 'gap', isGap: true, description: 'Statutory 30-minute Tier-2 regulatory escalation notification was NOT transmitted' },
      { time: '10:22:40', event: 'Case Closed (CLS-1042)', type: 'closure', description: 'Ticket closed with disposition "benign telemetry discrepancy" without supervisory sign-off' }
    ],
    sourceEvidence: [
      { recordId: 'EVD-742', recordType: 'SIEM Alert Record', title: 'OT Substation Boundary Telemetry Mismatch Log', timestamp: '2026-08-14 09:12:04' },
      { recordId: 'EVD-761', recordType: 'SOAR Ticket Package', title: 'Incident Dossier CASE-1042 (Analyst Worknotes & Audit Log)', timestamp: '2026-08-14 09:18:22' },
      { recordId: 'ESC-221', recordType: 'Escalation Ledger', title: 'Regulatory Transmission Gateway Audit Ledger (Zero Record Found)', timestamp: '2026-08-14 10:20:00' },
      { recordId: 'REM-0038', recordType: 'Remediation Mandate', title: 'Mandatory SOAR Playbook v3.2 Gateway Enforcement Protocol', timestamp: '2026-08-20 11:00:00' }
    ],
    provenance: {
      sha256: '9b71f92e7d3a82fbc625801c4e9124a9829f0e1d526738914bca82f91734bc12',
      submissionId: 'SUB-2026-0814-CSE014',
      sourceSystem: 'NorthGrid Splunk SOAR / OT-SOC Enclave',
      assessmentPeriod: 'Q3 2026',
      controlVersion: 'CTRL-v3.2',
      ruleVersion: 'R-2.4',
      analyticsEngineVersion: 'AN-1.8'
    },
    decisionNotes: '',
    decisionReason: '',
    decidedBy: 'examiner_07',
    decidedAt: undefined
  },
  {
    id: 'FND-2042',
    cseId: 'CSE-007',
    cseName: 'State Bank of Bharat Interbank Core',
    controlId: 'CTRL-12',
    controlName: 'Continuous Telemetry on Payment Switch Clusters (v2.1)',
    title: 'Negative Space: Missing 22% Expected Telemetry on Core Payment Switches',
    whyFlagged: 'Submitted operational logs during peak interbank settlement window reveal zero security audit records from cluster SW-03 across 12 consecutive hours.',
    signalType: 'NEGATIVE_SPACE',
    priority: 'HIGH',
    evidenceStrength: 'HIGH',
    completeness: 88,
    uncertainty: 'LOW',
    status: 'CANDIDATE',
    expectedState: '100% active telemetry coverage required for Core Payment Gateway switch clusters.',
    observedState: 'Observed telemetry coverage is 78%, candidate negative space identified on node SW-03.',
    gapSummary: 'NS-0028: Missing Core Switch Event Stream',
    supportingSignals: [
      {
        type: 'NEGATIVE_SPACE',
        label: 'NS-0028: Candidate Negative Space',
        description: 'Absence of expected telemetry across active processing window.'
      },
      {
        type: 'COVERAGE_GAP',
        label: 'Subnet Blindspot',
        description: 'Asset inventory indicates SW-03 online, but log submission has zero records.'
      }
    ],
    timeline: [
      { time: '00:00:00', event: 'Settlement Window Open', type: 'case', description: 'Batch processing scheduled' },
      { time: '04:00:00', event: 'Switch Telemetry Discontinuity', type: 'gap', isGap: true, description: 'Expected audit events absent' },
      { time: '12:00:00', event: 'Window Concluded', type: 'closure', description: 'Submission packet assembled with gap' }
    ],
    sourceEvidence: [
      { recordId: 'EVD-8821', recordType: 'Syslog Manifest', title: 'Payment Switch Event Stream SW-01..04', timestamp: '2026-08-18 00:00:00' },
      { recordId: 'AST-SW-03', recordType: 'Asset Inventory', title: 'Critical Infrastructure Hardware Registry', timestamp: '2026-08-01 00:00:00' }
    ],
    provenance: {
      sha256: '4f29a88310c9d74e0192a831bce9812948271048bce928410294812048124819',
      submissionId: 'SUB-2026-0820-CSE007',
      sourceSystem: 'Apex Core Gateway Syslog',
      assessmentPeriod: 'Q3 2026',
      controlVersion: 'CTRL-v2.1',
      ruleVersion: 'R-2.4',
      analyticsEngineVersion: 'AN-1.8'
    }
  }
];
