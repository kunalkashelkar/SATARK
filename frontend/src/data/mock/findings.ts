import { Finding } from '@/types';

export const mockFindings: Finding[] = [
  {
    id: 'FND-2041',
    cseId: 'CSE-014',
    cseName: 'Northern Power Grid Transmission Co.',
    controlId: 'CTRL-07',
    controlName: 'Mandatory Escalation for Critical Substation Anomaly',
    title: 'Critical case closed without required escalation',
    whyFlagged: 'Alert ALR-44218 classified as Critical OT Telemetry Breached, but Case CASE-1042 was transitioned directly to Closure without recording mandatory Level 2 supervisory escalation.',
    signalType: 'EXECUTION_GAP',
    priority: 'HIGH',
    evidenceStrength: 'HIGH',
    completeness: 94,
    uncertainty: 'LOW',
    status: 'CANDIDATE',
    expectedState: 'Escalation required within 30 minutes for Critical OT alerts before closure authorization.',
    observedState: 'Case closed at 10:22 without escalation record or supervisor sign-off.',
    gapSummary: 'Execution Gap: Missing Escalation Step',
    supportingSignals: [
      {
        type: 'EXECUTION_GAP',
        label: 'Missing Escalation',
        description: 'Mandatory step omitted between Investigation and Closure.'
      },
      {
        type: 'PROCESS_DEVIATION',
        label: 'Workflow Bypass',
        description: 'Premature transition into closure node without prerequisite gateway token.'
      },
      {
        type: 'HISTORICAL_RECURRENCE',
        label: 'Recurrence Pattern',
        description: '3rd occurrence of unescalated critical closure for CSE-014 in 2026.'
      },
      {
        type: 'CROSS_SOURCE_CONSISTENCY',
        label: 'Evidence Mismatch',
        description: 'Discrepancy between SIEM critical severity flag and ticket resolution notes.'
      }
    ],
    timeline: [
      { time: '09:12', event: 'Alert Created (ALR-44218)', type: 'alert', description: 'SCADA PLC integrity alert triggered' },
      { time: '09:18', event: 'Case Opened (CASE-1042)', type: 'case', description: 'Assigned to Shift Analyst A-04' },
      { time: '09:31', event: 'Investigation Started', type: 'investigation', description: 'Triage performed on IP endpoints' },
      { time: '10:04', event: 'Investigation Updated', type: 'investigation', description: 'Marked as probable maintenance activity' },
      { time: '10:16', event: 'Response Initiated', type: 'response', description: 'Field engineer queried' },
      { time: '10:20', event: 'Mandatory Escalation Missing', type: 'gap', isGap: true, description: 'Expected L2 Incident Commander notification omitted' },
      { time: '10:22', event: 'Case Closed (CLS-1042)', type: 'closure', description: 'Closed with disposition: benign maintenance' }
    ],
    sourceEvidence: [
      { recordId: 'ALR-44218', recordType: 'SIEM Alert', title: 'OT Substation Telemetry Mismatch', timestamp: '2026-08-14 09:12:04' },
      { recordId: 'CASE-1042', recordType: 'SOAR Ticket', title: 'Case Incident Package CASE-1042', timestamp: '2026-08-14 09:18:22' },
      { recordId: 'INV-1042', recordType: 'Investigation Note', title: 'Analyst Triage Summary & Artifacts', timestamp: '2026-08-14 10:04:15' },
      { recordId: 'CLS-1042', recordType: 'Closure Record', title: 'Case Closure Sign-off & Reason', timestamp: '2026-08-14 10:22:40' }
    ],
    provenance: {
      sha256: '9b71f92e7d3a82fbc625801c4e9124a9829f0e1d526738914bca82f91734bc12',
      submissionId: 'SUB-2026-0814-CSE014',
      sourceSystem: 'CSE-014 Splunk SOAR / OT-SOC',
      assessmentPeriod: '01 Aug 2026 — 31 Aug 2026',
      controlVersion: 'CTRL-07 v3.2',
      ruleVersion: 'EXEC-GAP-1.4',
      analyticsEngineVersion: 'SAT-SA-0.9-Engine'
    }
  },
  {
    id: 'FND-2042',
    cseId: 'CSE-009',
    cseName: 'Apex Interbank Settlement System',
    controlId: 'CTRL-12',
    controlName: 'Continuous Telemetry on Payment Switch Clusters',
    title: 'Negative Space: Missing 22% expected telemetry on core payment switches',
    whyFlagged: 'Submitted logs during high-volume settlement window reveal zero security event records from cluster SW-03 across 12 consecutive hours.',
    signalType: 'NEGATIVE_SPACE',
    priority: 'HIGH',
    evidenceStrength: 'HIGH',
    completeness: 88,
    uncertainty: 'LOW',
    status: 'CANDIDATE',
    expectedState: '100% active telemetry coverage required for Core Payment Gateway switch clusters.',
    observedState: 'Observed telemetry coverage is 78%, candidate negative space on node SW-03.',
    gapSummary: 'Negative Space: Missing Core Switch Event Stream',
    supportingSignals: [
      {
        type: 'NEGATIVE_SPACE',
        label: 'Candidate Negative Space',
        description: 'Absence of expected telemetry across active processing window.'
      },
      {
        type: 'COVERAGE_GAP',
        label: 'Subnet Blindspot',
        description: 'Asset inventory indicates SW-03 online, but log submission has zero records.'
      }
    ],
    timeline: [
      { time: '00:00', event: 'Settlement Window Open', type: 'case', description: 'Batch processing scheduled' },
      { time: '04:00', event: 'Switch Telemetry Discontinuity', type: 'gap', isGap: true, description: 'Expected audit events absent' },
      { time: '12:00', event: 'Window Concluded', type: 'closure', description: 'Submission packet assembled with gap' }
    ],
    sourceEvidence: [
      { recordId: 'SUB-EV-8821', recordType: 'Syslog Manifest', title: 'Payment Switch Event Stream SW-01..04', timestamp: '2026-08-18 00:00:00' },
      { recordId: 'AST-SW-03', recordType: 'Asset Inventory', title: 'Critical Infrastructure Hardware Registry', timestamp: '2026-08-01 00:00:00' }
    ],
    provenance: {
      sha256: '4f29a88310c9d74e0192a831bce9812948271048bce928410294812048124819',
      submissionId: 'SUB-2026-0820-CSE009',
      sourceSystem: 'Apex Core Gateway Syslog',
      assessmentPeriod: '01 Aug 2026 — 31 Aug 2026',
      controlVersion: 'CTRL-12 v2.1',
      ruleVersion: 'NEG-SPACE-2.0',
      analyticsEngineVersion: 'SAT-SA-0.9-Engine'
    }
  }
];
