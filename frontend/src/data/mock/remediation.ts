import { Priority, RemediationStatus } from '@/types';

export interface RemediationMandate {
  id: string;
  findingId: string;
  cseId: string;
  cseName: string;
  controlRef: string;
  mandateTitle: string;
  actionSummary: string;
  owner: string;
  priority: Priority;
  dueDate: string;
  daysRemaining: number;
  evidenceProgress: string; // e.g. "2/3"
  status: RemediationStatus;
  reopenReason?: string;
  artifacts: Array<{
    id: string;
    name: string;
    hash: string;
    status: 'PRESENT_VERIFIED' | 'MISSING_MANDATORY' | 'PENDING_INGESTION';
  }>;
  milestones: Array<{
    date: string;
    title: string;
    actor: string;
    detail: string;
    completed: boolean;
  }>;
}

export const mockRemediations: RemediationMandate[] = [
  {
    id: 'REM-0038',
    findingId: 'FND-0142',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    controlRef: 'CTRL-07 v3.2',
    mandateTitle: 'Undocumented Escalation Omission During Grid Outage Incident INV-338',
    actionSummary: 'Review CTRL-07 escalation workflow & submit cryptographic telemetry for INV-338 tier-2 dispatch.',
    owner: 'CSE-014 Evidence Team',
    priority: 'CRITICAL',
    dueDate: '04 Oct 2026',
    daysRemaining: 8,
    evidenceProgress: '2/3',
    status: 'OPEN',
    artifacts: [
      { id: 'EVD-742', name: 'Investigation Worklog (INV-338 Triage Runbook)', hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-761', name: 'Containment Firewall Push Logs (SCADA Boundary)', hash: 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2', status: 'PRESENT_VERIFIED' },
      { id: 'ESC-221', name: 'Tier-2 Escalation Dispatch Telemetry Packet', hash: 'PENDING_UPLOAD_HASH', status: 'MISSING_MANDATORY' }
    ],
    milestones: [
      { date: '26 Sep 2026 14:18 IST', title: 'Finding FND-0142 Synthesized', actor: 'SYS:SAT-FUSION', detail: 'Automated gap synthesis identified CTRL-07 breach.', completed: true },
      { date: '26 Sep 2026 14:20 IST', title: 'Remediation Mandate REM-0038 Instantiated', actor: 'NC-8802 (Lead Examiner)', detail: 'Lead Examiner validated mandate conditions.', completed: true },
      { date: '26 Sep 2026 14:22 IST', title: 'Assigned to CSE-014 Evidence Team', actor: 'NC-8802 (Lead Examiner)', detail: 'State set to OPEN with 8-day SLA horizon.', completed: true },
      { date: '27 Sep 2026 09:15 IST', title: 'Formal Evidence Demand for ESC-221 Dispatched', actor: 'NC-8802 (Lead Examiner)', detail: 'Demanded raw cryptographic dispatch payload.', completed: true },
      { date: '04 Oct 2026 23:59 IST', title: 'Statutory Response Deadline', actor: 'CSE-014 Compliance', detail: 'Mandatory CSE compliance boundary.', completed: false },
      { date: 'Pending Verification', title: 'Supervisory Verification & Final Enclave Seal', actor: 'Supervisory Board', detail: 'Formal sign-off logged with immutable audit hash.', completed: false }
    ]
  },
  {
    id: 'REM-0035',
    findingId: 'FND-0131',
    cseId: 'CSE-007',
    cseName: 'State Bank of Bharat Interbank Core',
    controlRef: 'CTRL-04 v2.4',
    mandateTitle: 'Enforce Dual-Custody Hardware MFA Challenge on Root Bastion',
    actionSummary: 'Remediate bastion gateway bypass by binding hardware security keys to all emergency maintenance tokens.',
    owner: 'SBI Security Operations Center',
    priority: 'HIGH',
    dueDate: '10 Oct 2026',
    daysRemaining: 14,
    evidenceProgress: '3/3',
    status: 'UNDER_VERIFICATION',
    artifacts: [
      { id: 'EVD-881', name: 'CyberArk Bastion Session Audit', hash: '88bca82f91734bc129b71f92e7d3a82fbc625801c4e9124a9829f0e1d52673891', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-882', name: 'FIDO2 Token Challenge Audit Trail', hash: '129b71f92e7d3a82fbc625801c4e9124a9829f0e1d5267389188bca82f91734b', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-883', name: 'Dual-Custody Policy Enforcement Export', hash: '82f91734bc129b71f92e7d3a82fbc625801c4e9124a9829f0e1d5267389188bc', status: 'PRESENT_VERIFIED' }
    ],
    milestones: [
      { date: '11 Aug 2026 11:20 IST', title: 'Bypass Detected in PAM Audit', actor: 'SYS:SAT-BEHAVIOUR', detail: 'Identified unauthenticated console session.', completed: true },
      { date: '12 Aug 2026 10:00 IST', title: 'Mandate Dispatched to Entity', actor: 'NC-8802 (Lead Examiner)', detail: 'Direct intervention required.', completed: true },
      { date: '20 Sep 2026 16:30 IST', title: 'Remediation Evidence Uploaded', actor: 'SBI Compliance Officer', detail: 'Submitted 3 cryptographic evidence blocks.', completed: true },
      { date: 'Current', title: 'Examiner Verification Gate Pending', actor: 'NC-8802 (Lead Examiner)', detail: 'Awaiting final human verification review.', completed: false }
    ]
  },
  {
    id: 'REM-0031',
    findingId: 'FND-0128',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    controlRef: 'CTRL-09 v3.0',
    mandateTitle: 'ICS Firewall Firmware Patch Cadence Standardization',
    actionSummary: 'Implement automated 14-day statutory patch staging pipeline for all critical relay firewalls.',
    owner: 'NorthGrid Substation OT Team',
    priority: 'MEDIUM',
    dueDate: '18 Oct 2026',
    daysRemaining: 22,
    evidenceProgress: '1/2',
    status: 'IN_PROGRESS',
    artifacts: [
      { id: 'EVD-642', name: 'Nessus OT Infrastructure Scan Verification', hash: '9124a9829f0e1d526738914bca82f91734bc129b71f92e7d3a82fbc625801c4e', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-643', name: 'Patch Window Automation Policy Runbook', hash: 'PENDING_UPLOAD_HASH', status: 'MISSING_MANDATORY' }
    ],
    milestones: [
      { date: '04 Aug 2026', title: 'Recurrent Delay Pattern Identified', actor: 'SYS:SAT-HISTORICAL', detail: 'Pattern detected across Q2 and Q4 cycles.', completed: true },
      { date: '10 Aug 2026', title: 'Corrective Action Plan Mandated', actor: 'NC-8802 (Lead Examiner)', detail: 'Mandated automated staging pipeline.', completed: true }
    ]
  },
  {
    id: 'REM-0026',
    findingId: 'FND-0109',
    cseId: 'CSE-008',
    cseName: 'ReserveBank Interconnect',
    controlRef: 'CTRL-09 v2.1',
    mandateTitle: 'HSM Partition Key Rotation and Witness Sign-off',
    actionSummary: 'Implement automated HSM key derivation cycle and dual-officer zeroization attestation.',
    owner: 'RBI Crypto Operations Unit',
    priority: 'HIGH',
    dueDate: '25 Sep 2026',
    daysRemaining: 0,
    evidenceProgress: '1/3',
    status: 'REOPENED',
    reopenReason: 'Master Key Derivation logs omitted and witness signature missing during HSM zeroization audit.',
    artifacts: [
      { id: 'EVD-401', name: 'HSM Partition Health Report', hash: 'e01a88b4491910ef7719ab2940212f718820129bc625801c4e9124a9829f0e1d', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-402', name: 'Master Key Derivation Log', hash: 'PENDING_UPLOAD_HASH', status: 'MISSING_MANDATORY' },
      { id: 'EVD-403', name: 'Zeroization Procedure Test Trace', hash: 'PENDING_UPLOAD_HASH', status: 'MISSING_MANDATORY' }
    ],
    milestones: [
      { date: '05 Sep 2026', title: 'Remediation Dispatched', actor: 'NC-4190 (Examiner)', detail: 'Initial mandate issued.', completed: true },
      { date: '18 Sep 2026', title: 'Initial Evidence Ingested', actor: 'RBI Officer', detail: 'Single partition report uploaded.', completed: true },
      { date: '25 Sep 2026', title: 'Verification Gate Failed — Reopened', actor: 'NC-4190 (Examiner)', detail: 'Derivation logs omitted. Mandate formally reopened.', completed: true }
    ]
  },
  {
    id: 'REM-0029',
    findingId: 'FND-0118',
    cseId: 'CSE-021',
    cseName: 'TelcoGrid Telecom',
    controlRef: 'CTRL-04 v3.0',
    mandateTitle: 'Critical Telecom Gateway MFA Bypass Remediation',
    actionSummary: 'Enforce mandatory hardware token challenge on all core IMS interconnect router administration portals.',
    owner: 'TelcoGrid Security Engineering',
    priority: 'CRITICAL',
    dueDate: '15 Sep 2026',
    daysRemaining: 0,
    evidenceProgress: '3/3',
    status: 'CLOSED',
    artifacts: [
      { id: 'EVD-512', name: 'PAM Cluster Policy Diff v4.1', hash: '4f9910ae4481c002882910fa7281bc22718820129bc625801c4e9124a9829f0e', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-513', name: 'RADIUS Authentication Audit Trail', hash: '09ab1209cc54291129b71f92e7d3a82fbc625801c4e9124a9829f0e1d5267389', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-514', name: 'Hardware Token Seed Attestation', hash: '881a4bca990013ef82f91734bc129b71f92e7d3a82fbc625801c4e9124a9829f', status: 'PRESENT_VERIFIED' }
    ],
    milestones: [
      { date: '15 Aug 2026', title: 'MFA Bypass Discovered', actor: 'NC-8802 (Lead Examiner)', detail: 'Gateway console exposed.', completed: true },
      { date: '01 Sep 2026', title: 'Hardware Tokens Deployed', actor: 'TelcoGrid Lead', detail: 'FIDO2 physical keys provisioned.', completed: true },
      { date: '18 Sep 2026', title: 'Statutorily Verified & Closed', actor: 'NC-8802 (Lead Examiner)', detail: 'FIPS enclave lock engaged.', completed: true }
    ]
  },
  {
    id: 'REM-0024',
    findingId: 'FND-0098',
    cseId: 'CSE-011',
    cseName: 'Reserve Clearing House FinTech',
    controlRef: 'CTRL-07 v2.0',
    mandateTitle: 'PTP IEEE-1588 Precision Time Synchronization Verification',
    actionSummary: 'Formally submit calibration certificate for microsecond PTP time server infrastructure.',
    owner: 'RCH Infrastructure Director',
    priority: 'LOW',
    dueDate: '15 Sep 2026',
    daysRemaining: 0,
    evidenceProgress: '2/2',
    status: 'CLOSED',
    artifacts: [
      { id: 'EVD-981', name: 'IEEE-1588 Grandmaster Clock Calibration Certificate', hash: '92e7d3a82fbc625801c4e9124a9829f0e1d526738914bca82f91734bc129b71f', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-982', name: 'Director Exemption Documentation Ref DEX-441', hash: 'c625801c4e9124a9829f0e1d526738914bca82f91734bc129b71f92e7d3a82fb', status: 'PRESENT_VERIFIED' }
    ],
    milestones: [
      { date: '10 Aug 2026', title: 'NTP Drift Discrepancy Flagged', actor: 'SYS:SAT-CONSISTENCY', detail: 'Initial signal generated.', completed: true },
      { date: '18 Aug 2026', title: 'Exemption Evidence Verified', actor: 'NC-8802 (Lead Examiner)', detail: 'PTP compliance certified.', completed: true },
      { date: '25 Aug 2026', title: 'Remediation Closed & Sealed', actor: 'NC-8802 (Lead Examiner)', detail: 'Case resolved under statutory exemption.', completed: true }
    ]
  }
];

export interface VerificationRecord {
  id: string; // e.g. VRF-0038
  mandateId: string; // e.g. REM-0038
  findingId: string; // e.g. FND-0142
  cseId: string;
  cseName: string;
  controlId: string;
  cycle: string;
  leadExaminer: string;
  statutoryStandard: string;
  submittedAt: string;
  evaluatedAt?: string;
  verificationVerdict: 'VERIFIED_SEALED' | 'UNDER_SUPERVISORY_REVIEW' | 'DEFICIENT_REOPENED' | 'EVIDENCE_LOCKED';
  confidenceScore: number;
  evidenceCompleteness: number; // percentage
  merkleRootHash: string;
  remedialSummary: string;
  gateChecklist: Array<{
    id: string;
    label: string;
    verified: boolean;
    required: boolean;
    note?: string;
  }>;
  submittedArtifacts: Array<{
    id: string;
    name: string;
    hash: string;
    verified: boolean;
  }>;
  supervisoryRationale: string;
}

export const mockVerifications: VerificationRecord[] = [
  {
    id: 'VRF-0038',
    mandateId: 'REM-0038',
    findingId: 'FND-0142',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    controlId: 'CTRL-07 v3.2',
    cycle: 'Q3 2026',
    leadExaminer: 'NC-8802 (Lead Examiner)',
    statutoryStandard: 'NCIIPC Framework Sec 12(a) & Rule 4.8.2',
    submittedAt: '26 Sep 2026 14:22 IST',
    evaluatedAt: '27 Sep 2026 09:15 IST',
    verificationVerdict: 'EVIDENCE_LOCKED',
    confidenceScore: 68,
    evidenceCompleteness: 67, // 2 of 3 artifacts
    merkleRootHash: '0x9af8b12204cc19ef7b28a994c1e40019283746194180',
    remedialSummary: 'Mandate requires cryptographic verification of Level 2 SOAR dispatch telemetry during incident INV-338.',
    gateChecklist: [
      { id: 'gate-1', label: 'Mandate Scope Formally Communicated to CSE', verified: true, required: true },
      { id: 'gate-2', label: 'Cryptographic Attestation of Playbook Update v2.4', verified: true, required: true },
      { id: 'gate-3', label: 'Mandatory Telemetry Packet ESC-221 Ingested', verified: false, required: true, note: 'Statutory blocker: Missing raw dispatch payload' },
      { id: 'gate-4', label: 'Cross-Source Petri Net Process Conformance (PM4Py)', verified: false, required: true },
      { id: 'gate-5', label: 'Immutable FIPS-140-2 Level 3 Hash Sealed', verified: false, required: true }
    ],
    submittedArtifacts: [
      { id: 'EVD-742', name: 'INV-338 Triage Runbook Audit Export', hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', verified: true },
      { id: 'EVD-761', name: 'Containment Firewall Push Logs (SCADA Boundary)', hash: 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2', verified: true },
      { id: 'ESC-221', name: 'Tier-2 Escalation Dispatch Telemetry Packet', hash: 'NOT_SUBMITTED', verified: false }
    ],
    supervisoryRationale: 'Awaiting mandatory telemetry ESC-221 from NorthGrid. Statutory closure gate remains locked. Reopening loop active if deadline expires without submission.'
  },
  {
    id: 'VRF-0035',
    mandateId: 'REM-0035',
    findingId: 'FND-0131',
    cseId: 'CSE-007',
    cseName: 'State Bank of Bharat Interbank Core',
    controlId: 'CTRL-04 v2.4',
    cycle: 'Q3 2026',
    leadExaminer: 'NC-8802 (Lead Examiner)',
    statutoryStandard: 'NCIIPC Framework Sec 12(a) & Rule 4.2.1',
    submittedAt: '20 Sep 2026 16:30 IST',
    evaluatedAt: '24 Sep 2026 11:00 IST',
    verificationVerdict: 'UNDER_SUPERVISORY_REVIEW',
    confidenceScore: 92,
    evidenceCompleteness: 100,
    merkleRootHash: '0x88bca82f91734bc129b71f92e7d3a82fbc625801c4e9',
    remedialSummary: 'Verification of dual-custody hardware MFA tokens on CyberArk bastion cluster.',
    gateChecklist: [
      { id: 'gate-1', label: 'Mandate Scope Formally Communicated to CSE', verified: true, required: true },
      { id: 'gate-2', label: 'FIDO2 Challenge Audit Telemetry Ingested', verified: true, required: true },
      { id: 'gate-3', label: 'Dual-Custody Policy Verified Against Baseline', verified: true, required: true },
      { id: 'gate-4', label: 'Independent Supervisory Re-Audit Run', verified: true, required: true },
      { id: 'gate-5', label: 'Formal Examiner Verification Sign-off', verified: false, required: true, note: 'Pending Lead Examiner signature' }
    ],
    submittedArtifacts: [
      { id: 'EVD-881', name: 'CyberArk Bastion Session Audit', hash: '88bca82f91734bc129b71f92e7d3a82fbc625801c4e9124a9829f0e1d52673891', verified: true },
      { id: 'EVD-882', name: 'FIDO2 Token Challenge Audit Trail', hash: '129b71f92e7d3a82fbc625801c4e9124a9829f0e1d5267389188bca82f91734b', verified: true },
      { id: 'EVD-883', name: 'Dual-Custody Policy Enforcement Export', hash: '82f91734bc129b71f92e7d3a82fbc625801c4e9124a9829f0e1d5267389188bc', verified: true }
    ],
    supervisoryRationale: 'Evidence complete. Verification checklist 4/5 gates verified. Ready for formal examiner closure sign-off.'
  },
  {
    id: 'VRF-0029',
    mandateId: 'REM-0029',
    findingId: 'FND-0118',
    cseId: 'CSE-021',
    cseName: 'TelcoGrid Telecom',
    controlId: 'CTRL-04 v3.0',
    cycle: 'Q3 2026',
    leadExaminer: 'NC-8802 (Lead Examiner)',
    statutoryStandard: 'Critical Telecom Gateway MFA Mandate Sec 8.1',
    submittedAt: '15 Sep 2026 09:10 IST',
    evaluatedAt: '18 Sep 2026 14:00 IST',
    verificationVerdict: 'VERIFIED_SEALED',
    confidenceScore: 98,
    evidenceCompleteness: 100,
    merkleRootHash: '0x71a099bf4431e08966bca82910fa7281bc22718820129bc625801c4e9124a982',
    remedialSummary: 'MFA token bypass closure on core IMS interconnect router clusters.',
    gateChecklist: [
      { id: 'gate-1', label: 'PAM Policy v4.1 Cryptographically Signed', verified: true, required: true },
      { id: 'gate-2', label: 'RADIUS Challenge-Response Audit Trail Ingested', verified: true, required: true },
      { id: 'gate-3', label: 'Hardware Token Seed Attestation Received', verified: true, required: true },
      { id: 'gate-4', label: 'Lead Examiner Sign-off Executed & Sealed', verified: true, required: true }
    ],
    submittedArtifacts: [
      { id: 'EVD-512', name: 'PAM Cluster Policy Diff v4.1', hash: '4f9910ae4481c002882910fa7281bc22718820129bc625801c4e9124a9829f0e', verified: true },
      { id: 'EVD-513', name: 'RADIUS Authentication Audit Trail', hash: '09ab1209cc54291129b71f92e7d3a82fbc625801c4e9124a9829f0e1d5267389', verified: true },
      { id: 'EVD-514', name: 'Hardware Token Seed Attestation', hash: '881a4bca990013ef82f91734bc129b71f92e7d3a82fbc625801c4e9124a9829f', verified: true }
    ],
    supervisoryRationale: 'Full statutory compliance verified. Immutable enclave lock engaged on 18 Sep 2026.'
  },
  {
    id: 'VRF-0026',
    mandateId: 'REM-0026',
    findingId: 'FND-0109',
    cseId: 'CSE-008',
    cseName: 'ReserveBank Interconnect',
    controlId: 'CTRL-09 v2.1',
    cycle: 'Q3 2026',
    leadExaminer: 'NC-4190 (Examiner)',
    statutoryStandard: 'Financial Sector HSM Key Rotation Mandate Sec 14',
    submittedAt: '05 Sep 2026 11:00 IST',
    evaluatedAt: '08 Sep 2026 15:45 IST',
    verificationVerdict: 'DEFICIENT_REOPENED',
    confidenceScore: 32,
    evidenceCompleteness: 33,
    merkleRootHash: '0x1109aef884439001e01a88b4491910ef7719ab2940212f718820129bc625801c',
    remedialSummary: 'HSM partition key rotation cycle proof.',
    gateChecklist: [
      { id: 'gate-1', label: 'Partition Health Report Ingested', verified: true, required: true },
      { id: 'gate-2', label: 'Master Key Derivation Cycle Verified', verified: false, required: true, note: 'Rejected: Derivation logs omitted' },
      { id: 'gate-3', label: 'Zeroization Procedure Test Trace', verified: false, required: true, note: 'Rejected: Missing witness signature' }
    ],
    submittedArtifacts: [
      { id: 'EVD-401', name: 'HSM Partition Health Report', hash: 'e01a88b4491910ef7719ab2940212f718820129bc625801c4e9124a9829f0e1d', verified: true },
      { id: 'EVD-402', name: 'Master Key Derivation Log', hash: 'OMITTED_DEFICIENT', verified: false }
    ],
    supervisoryRationale: 'Deficient proof submitted. Mandate reverted to REOPENED with immediate regulatory warning issued.'
  }
];

export interface RemediationRegression {
  id: string; // e.g. REG-0014
  findingId: string; // e.g. FND-0128
  remediationId: string; // e.g. REM-0031
  verificationId?: string; // e.g. VRF-0022
  cseId: string;
  cseName: string;
  controlId: string;
  priority: Priority;
  reason: string;
  signalType: string;
  status: 'ACTIVE_REGRESSION' | 'UNDER_REMEDIAL_ACTION' | 'RESOLVED';
  reopenedDate: string;
  newEvidenceRecord: string;
  originalFindingSummary: string;
  historyTimeline: Array<{
    date: string;
    title: string;
    actor: string;
    detail: string;
  }>;
}

export const mockRegressions: RemediationRegression[] = [
  {
    id: 'REG-0014',
    findingId: 'FND-0128',
    remediationId: 'REM-0031',
    verificationId: 'VRF-0022',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    controlId: 'CTRL-09 v3.0',
    priority: 'HIGH',
    reason: 'Repeated Execution Gap — Firewall Patch Expiration Recurrence',
    signalType: 'HISTORICAL_RECURRENCE',
    status: 'ACTIVE_REGRESSION',
    reopenedDate: '24 Sep 2026',
    newEvidenceRecord: 'EVD-642 (Nessus OT Infrastructure Report)',
    originalFindingSummary: 'Control CTRL-09 (Firewall Patch Verification) was verified in Q2 2025, but re-breached in Q3 2026 after temporary manual patch exception expired without automated deployment pipeline.',
    historyTimeline: [
      { date: '15 Jan 2025', title: 'Original Finding Identified', actor: 'SYS:SAT-HISTORICAL', detail: 'Patch delay detected on relay firewalls.' },
      { date: '20 Feb 2025', title: 'Remediation Mandate Closed', actor: 'NC-8802 (Lead Examiner)', detail: 'Temporary exception verified with physical airgap.' },
      { date: '14 Aug 2026', title: 'Temporary Exception Expired', actor: 'SYS:SAT-BEHAVIOUR', detail: 'Exception window passed without statutory automation.' },
      { date: '24 Sep 2026', title: 'Regression Flagged & Reopened', actor: 'Supervisory Enclave', detail: 'Signal HISTORICAL_RECURRENCE triggered. Remediation reopened in workspace.' }
    ]
  },
  {
    id: 'REG-0008',
    findingId: 'FND-0109',
    remediationId: 'REM-0026',
    verificationId: 'VRF-0026',
    cseId: 'CSE-008',
    cseName: 'ReserveBank Interconnect',
    controlId: 'CTRL-09 v2.1',
    priority: 'CRITICAL',
    reason: 'Verification Failed — Master Key Derivation Logs Omitted',
    signalType: 'EXECUTION_GAP',
    status: 'ACTIVE_REGRESSION',
    reopenedDate: '08 Sep 2026',
    newEvidenceRecord: 'EVD-401 (HSM Health Report Missing Witness Signature)',
    originalFindingSummary: 'Mandatory cryptographic witness signatures for HSM partition zeroization and derivation keys were missing from the submitted verification bundle.',
    historyTimeline: [
      { date: '05 Sep 2026', title: 'Remediation Submitted by CSE', actor: 'RBI Crypto Team', detail: 'Uploaded partition report without derivation logs.' },
      { date: '08 Sep 2026', title: 'Verification Gate Failed', actor: 'NC-4190 (Examiner)', detail: 'Gate 2 & 3 failed verification check. Telemetry incomplete.' },
      { date: '08 Sep 2026', title: 'Mandate Formally Reopened', actor: 'NC-4190 (Examiner)', detail: 'Status set to REOPENED. Corrective loop active.' }
    ]
  }
];
