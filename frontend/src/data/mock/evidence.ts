export interface MockEvidenceRecord {
  id: string;
  type: string;
  recordType: 'ALERT' | 'CASE' | 'INVESTIGATION' | 'ACTION' | 'EVIDENCE' | 'ESCALATION' | 'RESPONSE' | 'CLOSURE' | 'ASSET' | 'EXCEPTION';
  cseId: string;
  entity: string;
  caseRef: string;
  source: string;
  sourceSink: string;
  timestampDate: string;
  timestampTime: string;
  timestamp: string;
  status: 'PRESENT' | 'NOT_SUBMITTED' | 'ABSENT_CONFIRMED' | 'UNKNOWN' | 'NOT_APPLICABLE';
  integrity: string;
  hash: string;
  gapOrFinding: string;
  gapNote: string;
  title: string;
  metadata?: Record<string, any>;
}

export const mockEvidenceList: MockEvidenceRecord[] = [
  {
    id: 'EVD-742',
    type: 'Investigation Record',
    recordType: 'INVESTIGATION',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid)',
    caseRef: 'CASE-1042 / INV-338',
    source: 'SOC Case Management',
    sourceSink: 'API::enclave_agent_v3',
    timestampDate: '26 Sep 2026',
    timestampTime: '09:42:18 IST',
    timestamp: '2026-09-26 09:42:18',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: '9f8a3c22b918a99477e6f8812dd014a9ecba19001258d4a9821',
    gapOrFinding: 'GAP-0071 / FND-0142',
    gapNote: 'Escalation breach observed in flow',
    title: 'Investigation Worklog & SIEM Triage Snapshot (INV-338)'
  },
  {
    id: 'EVD-761',
    type: 'Response Record',
    recordType: 'RESPONSE',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid)',
    caseRef: 'CASE-1042 / RSP-089',
    source: 'SOC Response System',
    sourceSink: 'SOAR Playbook Auto',
    timestampDate: '26 Sep 2026',
    timestampTime: '11:08:44 IST',
    timestamp: '2026-09-26 11:08:44',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: 'd4a1b028ec31a0029bce83719001e389291bacef98104',
    gapOrFinding: 'FND-0142',
    gapNote: 'Containment logged without prior escalation',
    title: 'Containment Firewall Push Logs (SCADA Boundary)'
  },
  {
    id: 'ESC-221',
    type: 'Escalation Evidence',
    recordType: 'ESCALATION',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid)',
    caseRef: 'CASE-1042 / [MISSING]',
    source: 'SOC Case Management',
    sourceSink: 'Expected Feed Absent',
    timestampDate: '26 Sep 2026',
    timestampTime: '10:45:00 IST (Exp)',
    timestamp: '2026-09-26 10:45:00',
    status: 'NOT_SUBMITTED',
    integrity: 'PENDING DIGEST',
    hash: 'PENDING_CANONICAL_SUBMISSION',
    gapOrFinding: 'NS-0041 / GAP-0071',
    gapNote: 'Expected per CTRL-07 mandatory regulatory protocol',
    title: 'Tier-2 Escalation Telemetry & Regulatory Transmission Record'
  },
  {
    id: 'EVD-681',
    type: 'Alert Telemetry',
    recordType: 'ALERT',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid)',
    caseRef: 'CASE-1011 / ALR-8821',
    source: 'SOC SIEM Pipeline',
    sourceSink: 'Kafka Enclave Sink',
    timestampDate: '14 Sep 2026',
    timestampTime: '08:31:02 IST',
    timestamp: '2026-09-14 08:31:02',
    status: 'PRESENT',
    integrity: 'VERIFIED',
    hash: '5b3a98ce1122a001928374619283019283',
    gapOrFinding: 'FND-0131',
    gapNote: 'RTU Alarm Trigger',
    title: 'Substation PLC Boundary Telemetry Alarm'
  },
  {
    id: 'EVD-604',
    type: 'Closure Record',
    recordType: 'CLOSURE',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid)',
    caseRef: 'CASE-1007 / CLS-421',
    source: 'SOC Case Management',
    sourceSink: 'Closure Workflow Sign',
    timestampDate: '12 Sep 2026',
    timestampTime: '17:21:40 IST',
    timestamp: '2026-09-12 17:21:40',
    status: 'PRESENT',
    integrity: 'VERIFIED',
    hash: 'cc238b7e09919283746192830192830192',
    gapOrFinding: 'PD-0031',
    gapNote: 'Skip-step containment closure',
    title: 'Case Resolution Dossier & Post-Mortem Sign-off'
  },
  {
    id: 'EVD-881',
    type: 'PAM Log Record',
    recordType: 'ACTION',
    cseId: 'CSE-007',
    entity: 'CSE-007 (State Bank of Bharat)',
    caseRef: 'CASE-1029 / SEC-412',
    source: 'CyberArk Bastion Vault',
    sourceSink: 'Syslog Agent',
    timestampDate: '11 Aug 2026',
    timestampTime: '11:20:00 IST',
    timestamp: '2026-08-11 11:20:00',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: '88bca82f91734bc129b71f92e7d3a82fbc625801c4e9124a9829f0e1d52673891',
    gapOrFinding: 'PD-0019 / FND-0131',
    gapNote: 'Bypassed mandatory MFA step',
    title: 'CyberArk Bastion Session Audit Trail'
  },
  {
    id: 'EVD-8821',
    type: 'Switch Event Stream',
    recordType: 'EVIDENCE',
    cseId: 'CSE-007',
    entity: 'CSE-007 (State Bank of Bharat)',
    caseRef: 'CASE-1182 / SW-LOG',
    source: 'Apex Core Switch Syslog',
    sourceSink: 'Collector Node 01..04',
    timestampDate: '18 Aug 2026',
    timestampTime: '00:00:00 IST',
    timestamp: '2026-08-18 00:00:00',
    status: 'PRESENT',
    integrity: 'PARTIAL',
    hash: '4f29a88310c9d74e0192a831bce9812948271048bce928410294812048124819',
    gapOrFinding: 'NS-0028 / FND-2042',
    gapNote: 'Missing SW-03 node logs',
    title: 'Payment Switch Event Stream SW-01..04'
  },
  {
    id: 'AST-SW-03',
    type: 'Asset Inventory',
    recordType: 'ASSET',
    cseId: 'CSE-007',
    entity: 'CSE-007 (State Bank of Bharat)',
    caseRef: 'CASE-1182 / AST',
    source: 'Hardware Registry',
    sourceSink: 'CMDB Connector',
    timestampDate: '01 Aug 2026',
    timestampTime: '00:00:00 IST',
    timestamp: '2026-08-01 00:00:00',
    status: 'PRESENT',
    integrity: 'VERIFIED',
    hash: '120481248194f29a88310c9d74e0192a831bce9812948271048bce9284102948',
    gapOrFinding: 'FND-2042',
    gapNote: 'Confirms asset online during void',
    title: 'Core Switch Cluster Node SW-03 Asset Specification'
  },
  {
    id: 'EVD-711',
    type: 'SIEM Archive Stream',
    recordType: 'EVIDENCE',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid)',
    caseRef: 'CASE-1038 / HASH',
    source: 'Splunk Enclave Bus',
    sourceSink: 'Substation Bus 4',
    timestampDate: '12 Aug 2026',
    timestampTime: '02:00:00 IST',
    timestamp: '2026-08-12 02:00:00',
    status: 'ABSENT_CONFIRMED',
    integrity: 'TAMPER_CHECK_FAIL',
    hash: '2a49b819fbc71029481bce9812948271048bce9284102948120481248194411a',
    gapOrFinding: 'NS-0043 / FND-0137',
    gapNote: '14 hour missing hash stream',
    title: 'Collector 04 Cryptographic Hash Stream Archive'
  }
];
