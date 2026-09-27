export interface MockEvidenceRecord {
  id: string;
  type: string;
  recordType: 'ALERT' | 'CASE' | 'INVESTIGATION' | 'ACTION' | 'EVIDENCE' | 'ESCALATION' | 'RESPONSE' | 'CLOSURE' | 'ASSET' | 'EXCEPTION' | 'REMEDIATION';
  cseId: string;
  entity: string;
  submissionId?: string;
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
  provenance?: {
    sha256: string;
    collectorVersion: string;
    enclaveTimestamp: string;
    custodyChain: string[];
    schemaVersion: string;
  };
}

export const mockEvidenceList: MockEvidenceRecord[] = [
  // --- CSE-014 (NorthGrid Transmission Sys) ---
  {
    id: 'EV-1042',
    type: 'Alert Record',
    recordType: 'ALERT',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid Transmission Sys)',
    submissionId: 'SUB-014-027',
    caseRef: 'CASE-1042 / ALR-44218',
    source: 'SOC Alert Submission Gateway',
    sourceSink: 'Splunk Forwarder / OCSF Pipeline',
    timestampDate: '26 Sep 2026',
    timestampTime: '09:12:04 IST',
    timestamp: '2026-09-26 09:12:04',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: 'e81a3c77b919a99477e6f8812dd014a9ecba19001258d4a982141a0e1b239401',
    gapOrFinding: 'GAP-0071 / FND-0142',
    gapNote: 'Initial OT SCADA boundary telemetry alarm triggering CASE-1042 escalation inquiry.',
    title: 'SOC Alert Export — Q2 (Substation 4B PLC Boundary Alarm)',
    provenance: {
      sha256: 'e81a3c77b919a99477e6f8812dd014a9ecba19001258d4a982141a0e1b239401',
      collectorVersion: 'sat-collector-v2.8-fips',
      enclaveTimestamp: '2026-09-26T09:12:04.112Z',
      custodyChain: ['CSE-014 SOC SIEM', 'Air-Gap SFTP Drop', 'NCIIPC Ingestion Security Gateway', 'Supervisory Enclave Vault'],
      schemaVersion: 'OCSF-1.1.0-SECURITY_FINDING'
    }
  },
  {
    id: 'EVD-742',
    type: 'Investigation Record',
    recordType: 'INVESTIGATION',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid Transmission Sys)',
    submissionId: 'SUB-014-027',
    caseRef: 'CASE-1042 / INV-338',
    source: 'SOC Case Management',
    sourceSink: 'API::enclave_agent_v3',
    timestampDate: '26 Sep 2026',
    timestampTime: '09:42:18 IST',
    timestamp: '2026-09-26 09:42:18',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: '9f8a3c22b918a99477e6f8812dd014a9ecba19001258d4a982141a0e1b2394',
    gapOrFinding: 'GAP-0071 / FND-0142',
    gapNote: 'Escalation breach observed in flow sequence',
    title: 'Investigation Worklog & SIEM Triage Snapshot (INV-338)',
    provenance: {
      sha256: '9f8a3c22b918a99477e6f8812dd014a9ecba19001258d4a982141a0e1b2394',
      collectorVersion: 'sat-collector-v2.8-fips',
      enclaveTimestamp: '2026-09-26T09:42:18.412Z',
      custodyChain: ['CSE-014 Internal SOC', 'Air-Gap SFTP Drop', 'NCIIPC Collector Gateway', 'Supervisory Enclave Vault'],
      schemaVersion: 'OCSF-1.1.0-SECURITY_FINDING'
    }
  },
  {
    id: 'EVD-761',
    type: 'Response Record',
    recordType: 'RESPONSE',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid Transmission Sys)',
    submissionId: 'SUB-014-028',
    caseRef: 'CASE-1042 / RSP-089',
    source: 'SOC Response System',
    sourceSink: 'SOAR Playbook Auto',
    timestampDate: '26 Sep 2026',
    timestampTime: '11:08:44 IST',
    timestamp: '2026-09-26 11:08:44',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: 'd4a1b028ec31a0029bce83719001e389291bacef9810419284102948124819',
    gapOrFinding: 'FND-0142',
    gapNote: 'Containment logged without prior escalation',
    title: 'Containment Firewall Push Logs (SCADA Boundary)',
    provenance: {
      sha256: 'd4a1b028ec31a0029bce83719001e389291bacef9810419284102948124819',
      collectorVersion: 'sat-collector-v2.8-fips',
      enclaveTimestamp: '2026-09-26T11:08:44.102Z',
      custodyChain: ['CSE-014 Boundary Firewall', 'NCIIPC Collector Gateway', 'Supervisory Enclave Vault'],
      schemaVersion: 'OCSF-1.1.0-NETWORK_ACTIVITY'
    }
  },
  {
    id: 'ESC-221',
    type: 'Escalation Evidence',
    recordType: 'ESCALATION',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid Transmission Sys)',
    submissionId: 'SUB-014-EXPECTED',
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
    gapNote: 'Expected per CTRL-07 mandatory regulatory protocol. Missing Evidence != Confirmed Failure',
    title: 'Tier-2 Escalation Telemetry & Regulatory Transmission Record',
    provenance: {
      sha256: 'UNVERIFIED_PENDING_SUBMISSION',
      collectorVersion: 'sat-validator-v2.8',
      enclaveTimestamp: '2026-09-26T10:45:00.000Z',
      custodyChain: ['Awaiting Formal Statutory Production by CSE-014'],
      schemaVersion: 'OCSF-1.1.0-INCIDENT_ESCALATION'
    }
  },
  {
    id: 'EVD-681',
    type: 'Alert Telemetry',
    recordType: 'ALERT',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid Transmission Sys)',
    submissionId: 'SUB-014-027',
    caseRef: 'CASE-1011 / ALR-8821',
    source: 'SOC SIEM Pipeline',
    sourceSink: 'Kafka Enclave Sink',
    timestampDate: '14 Sep 2026',
    timestampTime: '08:31:02 IST',
    timestamp: '2026-09-14 08:31:02',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: '5b3a98ce1122a001928374619283019283019284102948120481248194411a1',
    gapOrFinding: 'FND-0131',
    gapNote: 'Substation RTU Alarm Trigger',
    title: 'Substation PLC Boundary Telemetry Alarm'
  },
  {
    id: 'EVD-604',
    type: 'Closure Record',
    recordType: 'CLOSURE',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid Transmission Sys)',
    submissionId: 'SUB-014-027',
    caseRef: 'CASE-1007 / CLS-421',
    source: 'SOC Case Management',
    sourceSink: 'Closure Workflow Sign',
    timestampDate: '12 Sep 2026',
    timestampTime: '17:21:40 IST',
    timestamp: '2026-09-12 17:21:40',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: 'cc238b7e0991928374619283019283019284019284019284019284019284019',
    gapOrFinding: 'PD-0031',
    gapNote: 'Skip-step containment closure',
    title: 'Case Resolution Dossier & Post-Mortem Sign-off'
  },
  {
    id: 'EVD-711',
    type: 'SIEM Archive Stream',
    recordType: 'EVIDENCE',
    cseId: 'CSE-014',
    entity: 'CSE-014 (NorthGrid Transmission Sys)',
    submissionId: 'SUB-014-027',
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
    gapNote: '14-hour missing hash stream during maintenance window',
    title: 'Collector 04 Cryptographic Hash Stream Archive'
  },

  // --- CSE-001 (Apex Interbank Settlement Network) ---
  {
    id: 'EVD-001-A1',
    type: 'RTGS Settlement Stream',
    recordType: 'EVIDENCE',
    cseId: 'CSE-001',
    entity: 'CSE-001 (Apex Interbank Settlement Network)',
    submissionId: 'SUB-001-018',
    caseRef: 'CASE-4401 / RTGS-SYN',
    source: 'Core Switch Ingestion Node',
    sourceSink: 'FinTech MQ Gateway',
    timestampDate: '22 Sep 2026',
    timestampTime: '14:10:02 IST',
    timestamp: '2026-09-22 14:10:02',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: '3bc948102948192048120491824091820491820491820491820491820491820',
    gapOrFinding: 'GAP-0032',
    gapNote: 'High-value transactions over 50Cr',
    title: 'Real-Time Gross Settlement Journal Feed (RTGS-01)'
  },
  {
    id: 'EVD-001-B2',
    type: 'SWIFT Gateway Audit',
    recordType: 'ACTION',
    cseId: 'CSE-001',
    entity: 'CSE-001 (Apex Interbank Settlement Network)',
    submissionId: 'SUB-001-018',
    caseRef: 'CASE-4401 / SWF-AUD',
    source: 'SWIFT Alliance Access Vault',
    sourceSink: 'HSM Cryptographic Bus',
    timestampDate: '22 Sep 2026',
    timestampTime: '15:22:19 IST',
    timestamp: '2026-09-22 15:22:19',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: '77a018240192840192840192840192840192840192840192840192840192840',
    gapOrFinding: 'GAP-0032',
    gapNote: 'Cryptographic envelope signature audit',
    title: 'SWIFT Gateway HSM Envelope Signatures Log'
  },

  // --- CSE-007 (State Bank of Bharat Interbank Core) ---
  {
    id: 'EVD-881',
    type: 'PAM Log Record',
    recordType: 'ACTION',
    cseId: 'CSE-007',
    entity: 'CSE-007 (State Bank of Bharat Interbank Core)',
    submissionId: 'SUB-007-042',
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
    gapNote: 'Bypassed mandatory dual-custody MFA step',
    title: 'CyberArk Bastion Session Audit Trail'
  },
  {
    id: 'EVD-8821',
    type: 'Switch Event Stream',
    recordType: 'EVIDENCE',
    cseId: 'CSE-007',
    entity: 'CSE-007 (State Bank of Bharat Interbank Core)',
    submissionId: 'SUB-007-042',
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
    gapNote: 'Missing SW-03 node logs during settlement window',
    title: 'Payment Switch Event Stream SW-01..04'
  },
  {
    id: 'AST-SW-03',
    type: 'Asset Inventory',
    recordType: 'ASSET',
    cseId: 'CSE-007',
    entity: 'CSE-007 (State Bank of Bharat Interbank Core)',
    submissionId: 'SUB-007-042',
    caseRef: 'CASE-1182 / AST',
    source: 'Hardware Registry',
    sourceSink: 'CMDB Connector',
    timestampDate: '01 Aug 2026',
    timestampTime: '00:00:00 IST',
    timestamp: '2026-08-01 00:00:00',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: '120481248194f29a88310c9d74e0192a831bce9812948271048bce9284102948',
    gapOrFinding: 'FND-2042',
    gapNote: 'Confirms asset online during telemetry void',
    title: 'Core Switch Cluster Node SW-03 Asset Specification'
  },

  // --- CSE-005 (National Public Service Core Portal) ---
  {
    id: 'EVD-005-U1',
    type: 'Auth Token Vault',
    recordType: 'ACTION',
    cseId: 'CSE-005',
    entity: 'CSE-005 (National Public Service Core Portal)',
    submissionId: 'SUB-005-031',
    caseRef: 'CASE-5501 / SSO-GATE',
    source: 'Identity Management SSO Enclave',
    sourceSink: 'SAML Assertion Store',
    timestampDate: '24 Sep 2026',
    timestampTime: '12:00:45 IST',
    timestamp: '2026-09-24 12:00:45',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: 'e819401928401928401928401928401928401928401928401928401928401928',
    gapOrFinding: 'GAP-0062',
    gapNote: 'Session validation token lifecycle logs',
    title: 'National SSO Assertion Authorization Audit Journal'
  },

  // --- CSE-006 (All-India Tele-Health Infrastructure) ---
  {
    id: 'EVD-006-T1',
    type: 'HL7 Data Bus Log',
    recordType: 'ALERT',
    cseId: 'CSE-006',
    entity: 'CSE-006 (All-India Tele-Health Infrastructure)',
    submissionId: 'SUB-006-012',
    caseRef: 'CASE-6602 / HL7-ROUTER',
    source: 'Health Data Exchange Router',
    sourceSink: 'Kafka Ingestion Queue',
    timestampDate: '23 Sep 2026',
    timestampTime: '08:30:12 IST',
    timestamp: '2026-09-23 08:30:12',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: '9a01824019284019284019284019284019284019284019284019284019284019',
    gapOrFinding: 'PD-0024',
    gapNote: 'Telemetry latency alert batch',
    title: 'HL7 / FHIR Message Broker Queue Telemetry'
  }
];
