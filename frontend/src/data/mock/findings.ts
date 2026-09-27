import { Finding } from '@/types';

export const mockFindings: Finding[] = [
  {
    id: 'FND-0142',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Transmission Sys',
    controlId: 'CTRL-07',
    controlName: 'Mandatory Tier-2 Escalation Protocol (v3.2)',
    title: 'Execution Gap in Escalation Handling',
    whyFlagged: 'System identified a supervisory signal because the observed evidence differs from the expected process baseline: investigation process bypassed mandatory Tier-2 regulatory transmission protocol within statutory time window. Alert ALR-44218 was closed in CASE-1042 without required Level-2 incident escalation token.',
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
    id: 'FND-0137',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Transmission Sys',
    controlId: 'CTRL-12',
    controlName: 'Security Audit Log Cryptographic Integrity (v3.1)',
    title: 'Missing SIEM Hash Stream on Substation Bus 4',
    whyFlagged: 'System identified a supervisory signal: operational log archives lacked expected tamper-evident SHA-256 integrity trees for 14 continuous hours during peak load.',
    signalType: 'NEGATIVE_SPACE',
    priority: 'HIGH',
    evidenceStrength: 'HIGH',
    completeness: 74,
    uncertainty: 'MEDIUM',
    status: 'CANDIDATE',
    expectedState: 'Cryptographic hash trees computed every 15 minutes across all collector pipelines.',
    observedState: 'Zero hashes submitted for collector cluster 04 between 02:00 and 16:00 IST.',
    gapSummary: 'NS-0043: Void in Cryptographic Verification Stream',
    supportingSignals: [
      { type: 'NEGATIVE_SPACE', label: 'NS-0043: Void in SIEM Hash Stream', description: 'Zero audit block receipts recorded for cluster 04.' },
      { type: 'COVERAGE_GAP', label: 'Substation Bus 4 Blindspot', description: 'Collector online but zero hashed block transmissions.' }
    ],
    timeline: [
      { time: '02:00:00', event: 'Log Collector Check-in', type: 'alert', description: 'Routine heartbeat registered' },
      { time: '02:15:00', event: 'Expected Hash Block Missing', type: 'gap', isGap: true, description: 'Periodic SHA-256 merkle receipt omitted' },
      { time: '16:00:00', event: 'Hash Stream Resumed', type: 'closure', description: 'Collector resumed transmission with 14h void' }
    ],
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
    }
  },
  {
    id: 'FND-0131',
    cseId: 'CSE-007',
    cseName: 'State Bank of Bharat Interbank Core',
    controlId: 'CTRL-04',
    controlName: 'Privileged Administrative Access & MFA (v2.4)',
    title: 'Bypassed Mandatory Hardware MFA Step on Gateway',
    whyFlagged: 'System identified a supervisory signal: privileged session opened with emergency token without corresponding hardware FIDO2 token challenge.',
    signalType: 'PROCESS_DEVIATION',
    priority: 'HIGH',
    evidenceStrength: 'HIGH',
    completeness: 88,
    uncertainty: 'LOW',
    status: 'VALIDATED',
    expectedState: 'Dual-custody hardware MFA challenge required for all root bastion sessions.',
    observedState: 'Direct credential override logged without token challenge receipt.',
    gapSummary: 'PD-0019: Direct Access Deviation',
    supportingSignals: [
      { type: 'PROCESS_DEVIATION', label: 'Bypassed MFA Step', description: 'Emergency break-glass procedure skipped verification.' },
      { type: 'BEHAVIOURAL', label: 'Off-hours Root Bastion Access', description: 'Privileged session opened at 03:14 IST on Sunday.' }
    ],
    timeline: [
      { time: '03:12:00', event: 'Session Initiation', type: 'case', description: 'Root console requested' },
      { time: '03:14:00', event: 'MFA Challenge Skipped', type: 'gap', isGap: true, description: 'Bypassed FIDO2 challenge gateway' },
      { time: '03:45:00', event: 'Session Terminated', type: 'closure', description: 'Session closed without dual sign-off' }
    ],
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
    }
  },
  {
    id: 'FND-0128',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Transmission Sys',
    controlId: 'CTRL-09',
    controlName: 'Patch Verification on Relay Firewalls (v3.0)',
    title: 'Recurrent Delay in Firmware Advisory Remediations',
    whyFlagged: 'System identified a supervisory signal: vulnerability VULN-2026-8819 remained unpatched for 45 days past statutory 14-day energy sector deadline across multiple cycles.',
    signalType: 'HISTORICAL_RECURRENCE',
    priority: 'MEDIUM',
    evidenceStrength: 'HIGH',
    completeness: 91,
    uncertainty: 'LOW',
    status: 'QUALIFIED',
    expectedState: 'Critical ICS CVEs addressed and verified within 14 calendar days.',
    observedState: 'Patch applied on Day 45; mitigated by physical network air-gap.',
    gapSummary: 'REC-0014: Repeat Patch Expiration Pattern',
    supportingSignals: [
      { type: 'HISTORICAL_RECURRENCE', label: 'Q2/Q4 Pattern Match', description: 'Identical delay pattern observed in 2 previous assessment cycles.' }
    ],
    timeline: [
      { time: 'Day 0', event: 'Advisory Published', type: 'alert', description: 'Critical firmware CVE issued' },
      { time: 'Day 14', event: 'Statutory Deadline Passed', type: 'gap', isGap: true, description: 'Zero patch deployment record' },
      { time: 'Day 45', event: 'Delayed Patch Applied', type: 'closure', description: 'Manual patch deployment verified' }
    ],
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
    }
  },
  {
    id: 'FND-0119',
    cseId: 'CSE-021',
    cseName: 'Videsh Sanchar Telecom Backbone',
    controlId: 'CTRL-15',
    controlName: 'Endpoint Detection & Containment Latency (v1.9)',
    title: 'EDR Telemetry Outage During Incident Window',
    whyFlagged: 'System identified a supervisory signal: host agent terminated unexpectedly during scanning; containment signal failed transmission to regulatory collector.',
    signalType: 'EXECUTION_GAP',
    priority: 'HIGH',
    evidenceStrength: 'MEDIUM',
    completeness: 69,
    uncertainty: 'HIGH',
    status: 'CANDIDATE',
    expectedState: 'Heartbeat signal every 60s from all edge gateways with continuous containment telemetry.',
    observedState: 'No heartbeat recorded for 3 hours prior to manual operator reboot.',
    gapSummary: 'GAP-0062: EDR Telemetry Silent',
    supportingSignals: [
      { type: 'EXECUTION_GAP', label: 'GAP-0062: EDR Unresponsive', description: 'Agent unresponsive during detection.' },
      { type: 'NEGATIVE_SPACE', label: 'NS-0019: Agent Heartbeat Void', description: 'Missing 180 consecutive heartbeat packets.' }
    ],
    timeline: [
      { time: '14:00:00', event: 'Agent Active', type: 'alert', description: 'Heartbeat normal' },
      { time: '14:01:00', event: 'Heartbeat Ceased', type: 'gap', isGap: true, description: 'Unannounced telemetry outage' },
      { time: '17:05:00', event: 'Operator Reboot', type: 'closure', description: 'Agent restored after 3h silent gap' }
    ],
    sourceEvidence: [],
    provenance: {
      sha256: '14bca82f91734bc129b71f92e7d3a82fbc625801c4e9124a9829f0e1d5267389',
      submissionId: 'SUB-2026-0819-CSE021',
      sourceSystem: 'Videsh Core SOC Ingestion',
      assessmentPeriod: 'Q3 2026',
      controlVersion: 'CTRL-v1.9',
      ruleVersion: 'R-2.4',
      analyticsEngineVersion: 'AN-1.8'
    }
  },
  {
    id: 'FND-0107',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Transmission Sys',
    controlId: 'CTRL-11',
    controlName: 'Substation Bus Telemetry Monitoring (v3.2)',
    title: 'Coverage Void on Substation Bus 4 PLC Links',
    whyFlagged: 'System identified a supervisory signal: telemetry gap detected initially, but corroborated as planned scheduled downtime with formal advance notification.',
    signalType: 'COVERAGE_GAP',
    priority: 'LOW',
    evidenceStrength: 'HIGH',
    completeness: 85,
    uncertainty: 'LOW',
    status: 'REJECTED',
    expectedState: 'All busbars active with continuous telemetry or registered maintenance exception.',
    observedState: 'Bus 4 telemetry offline during pre-notified scheduled relay replacement.',
    gapSummary: 'False Positive: Valid Maintenance Window with Advance Waiver',
    supportingSignals: [
      { type: 'COVERAGE_GAP', label: 'Substation Bus 4 Offline', description: 'Advance waiver filed in NCIIPC portal.' }
    ],
    timeline: [
      { time: '08:00:00', event: 'Maintenance Window Open', type: 'alert', description: 'Notified scheduled maintenance' },
      { time: '12:00:00', event: 'Relay Replacement Complete', type: 'closure', description: 'Telemetry stream restored' }
    ],
    sourceEvidence: [],
    provenance: {
      sha256: 'bc129b71f92e7d3a82fbc625801c4e9124a9829f0e1d526738914bca82f91734',
      submissionId: 'SUB-2026-0814-CSE014',
      sourceSystem: 'NorthGrid Splunk SOAR / OT-SOC Enclave',
      assessmentPeriod: 'Q3 2026',
      controlVersion: 'CTRL-v3.2',
      ruleVersion: 'R-2.4',
      analyticsEngineVersion: 'AN-1.8'
    }
  },
  {
    id: 'FND-0098',
    cseId: 'CSE-011',
    cseName: 'Reserve Clearing House Settlement',
    controlId: 'CTRL-07',
    controlName: 'Inter-Bank Transaction Timestamp Synchronization (v2.0)',
    title: 'Timestamp Drift in Settlement Confirmation Packets',
    whyFlagged: 'System identified a supervisory signal: NTP drift anomaly flagged by baseline comparator; overridden by director exemption due to verified microsecond PTP standard.',
    signalType: 'CROSS_SOURCE_CONSISTENCY',
    priority: 'MEDIUM',
    evidenceStrength: 'LOW',
    completeness: 58,
    uncertainty: 'HIGH',
    status: 'OVERRIDDEN',
    expectedState: 'Standard NTP drift < 10ms across settlement nodes.',
    observedState: 'PTP IEEE-1588 nanosecond clock used instead of standard NTP daemon.',
    gapSummary: 'Director Exemption Granted (PTP Standards Conformance)',
    supportingSignals: [
      { type: 'CROSS_SOURCE_CONSISTENCY', label: 'Timestamp Drift', description: 'System used precision time protocol IEEE-1588.' }
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
    }
  },
  {
    id: 'FND-2042',
    cseId: 'CSE-007',
    cseName: 'State Bank of Bharat Interbank Core',
    controlId: 'CTRL-12',
    controlName: 'Continuous Telemetry on Payment Switch Clusters (v2.1)',
    title: 'Negative Space: Missing 22% Expected Telemetry on Core Payment Switches',
    whyFlagged: 'System identified a supervisory signal: submitted operational logs during peak interbank settlement window reveal zero security audit records from cluster SW-03 across 12 consecutive hours.',
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
