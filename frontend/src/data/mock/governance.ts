export interface SystemUser {
  id: string;
  username: string;
  name: string;
  badge: string;
  email: string;
  role: 'SUPERVISOR' | 'EXAMINER' | 'LEAD_EXAMINER' | 'AUDITOR' | 'ADMINISTRATOR';
  organization: string;
  cseScope: string[];
  mfaType: 'FIPS-140-2 L3 Smartcard' | 'Hardware Security Key (FIDO2)' | 'Enclave Token';
  status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING';
  lastActivity: string;
  permissions: string[];
}

export interface AdminRole {
  id: string;
  roleName: string;
  description: string;
  accessScope: string;
  userCount: number;
  status: 'ACTIVE' | 'LOCKED';
  permissions: string[];
}

export interface CseAccessRule {
  id: string;
  userOrRole: string;
  cseId: string;
  cseName: string;
  accessType: 'Read + Review' | 'Read Only' | 'Full Supervisory' | 'Evidence Submission';
  scope: string;
  status: 'Active' | 'Pending Review' | 'Revoked';
  grantedBy: string;
  grantedDate: string;
}

export interface SecurityConfigItem {
  id: string;
  category: 'AUTHENTICATION' | 'SESSION' | 'AUDIT_LOGGING' | 'DATA_PROTECTION' | 'AIR_GAP' | 'ENVIRONMENT';
  title: string;
  description: string;
  value: string;
  status: 'ENFORCED' | 'HARDENED' | 'ACTIVE';
  standard: string;
}

export interface SupervisoryControl {
  id: string; // e.g. CTRL-07
  name: string;
  domain: string;
  version: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'DEPRECATED';
  applicability: string;
  lastUpdated: string;
  description: string;
  expectedCapability: string;
  expectedEvidence: string;
  assessmentCriteria: string;
  relatedRules: string[];
  relatedFindings: string[];
  versionHistory: Array<{
    version: string;
    releaseDate: string;
    changes: string;
    active: boolean;
  }>;
}

export interface SystemComponentVersion {
  id: string;
  component: string;
  version: string;
  type: 'Rule Engine' | 'Control Baseline' | 'Supervisory Model' | 'Core System';
  status: 'Active' | 'Current' | 'Superseded';
  released: string;
  activeSince: string;
  usedBy: string;
  description: string;
  changeSummary: string;
  dependencies: string[];
  previousVersion: string;
  hashSignature: string;
}

// -----------------------------------------------------------------------------
// MOCK DATASETS
// -----------------------------------------------------------------------------

export const mockSystemUsers: SystemUser[] = [
  {
    id: 'USR-001',
    username: 'v.malhotra',
    name: 'Dr. Vikram Malhotra',
    badge: 'DIR-0012',
    email: 'v.malhotra@nciipc.gov.in',
    role: 'ADMINISTRATOR',
    organization: 'NCIIPC HQ - Directorate',
    cseScope: ['ALL_ENTITIES'],
    mfaType: 'FIPS-140-2 L3 Smartcard',
    status: 'ACTIVE',
    lastActivity: '3 mins ago (Console 01)',
    permissions: ['SYSTEM_ROOT', 'USER_PROVISION', 'POLICY_OVERRIDE', 'ENCLAVE_SIGN', 'AUDIT_EXPORT']
  },
  {
    id: 'USR-104',
    username: 'examiner_07',
    name: 'Sarah Jenkins',
    badge: 'NC-8802',
    email: 's.jenkins@nciipc.gov.in',
    role: 'LEAD_EXAMINER',
    organization: 'NCIIPC Supervisory Division - Energy & Finance',
    cseScope: ['CSE-014', 'CSE-021', 'CSE-033'],
    mfaType: 'FIPS-140-2 L3 Smartcard',
    status: 'ACTIVE',
    lastActivity: 'Today (Workstation EX-04)',
    permissions: ['ASSESSMENT_WRITE', 'FINDING_PROMOTE', 'SIGNAL_OVERRIDE', 'REMEDIATION_CLOSE', 'SAMPLING_EXECUTE']
  },
  {
    id: 'USR-117',
    username: 'a.sharma',
    name: 'Amitabh Sharma',
    badge: 'NC-8915',
    email: 'a.sharma@nciipc.gov.in',
    role: 'EXAMINER',
    organization: 'NCIIPC Supervisory Division - Telecom & Transport',
    cseScope: ['CSE-014', 'CSE-045'],
    mfaType: 'Hardware Security Key (FIDO2)',
    status: 'ACTIVE',
    lastActivity: '14 mins ago (Workstation EX-09)',
    permissions: ['ASSESSMENT_READ', 'SIGNAL_ANNOTATE', 'EVIDENCE_VERIFY', 'SAMPLING_REVIEW']
  },
  {
    id: 'USR-109',
    username: 'p.sundaram',
    name: 'Priya Sundaram',
    badge: 'NC-9104',
    email: 'p.sundaram@nciipc.gov.in',
    role: 'SUPERVISOR',
    organization: 'Supervisory Review Board',
    cseScope: ['ALL_ENTITIES'],
    mfaType: 'FIPS-140-2 L3 Smartcard',
    status: 'ACTIVE',
    lastActivity: '42 mins ago (Workstation SR-02)',
    permissions: ['ASSESSMENT_SIGN_OFF', 'FINDING_RATIFY', 'INJUNCTION_APPROVE', 'AUDIT_READ']
  },
  {
    id: 'USR-204',
    username: 'd.vance',
    name: 'Devin Vance',
    badge: 'AUD-3301',
    email: 'd.vance@gov-audit.internal',
    role: 'AUDITOR',
    organization: 'Independent Oversight Enclave',
    cseScope: ['ALL_ENTITIES (READ-ONLY)'],
    mfaType: 'Hardware Security Key (FIDO2)',
    status: 'ACTIVE',
    lastActivity: '2 hours ago (Audit Pod 03)',
    permissions: ['AUDIT_INSPECT', 'LEDGER_VERIFY', 'HASH_SEAL_VALIDATE', 'CHAIN_CUSTODY_EXPORT']
  },
  {
    id: 'USR-219',
    username: 'r.verma',
    name: 'Rajesh K. Verma',
    badge: 'LIA-014-A',
    email: 'r.verma@powergrid.internal',
    role: 'EXAMINER',
    organization: 'NorthGrid Energy Enclave',
    cseScope: ['CSE-014'],
    mfaType: 'Enclave Token',
    status: 'ACTIVE',
    lastActivity: '5 hours ago (Gateway-014)',
    permissions: ['REMEDIATION_SUBMIT', 'EVIDENCE_UPLOAD', 'FINDING_VIEW_ASSIGNED']
  }
];

export const mockAdminRoles: AdminRole[] = [
  {
    id: 'ROL-01',
    roleName: 'Supervisor',
    description: 'Statutory oversight, finding ratification, supervisory injunction authorization, and audit review.',
    accessScope: 'All Supervised Sectors (Energy, Banking, Telecom, Transport)',
    userCount: 2,
    status: 'ACTIVE',
    permissions: ['ASSESSMENT_SIGN_OFF', 'FINDING_RATIFY', 'INJUNCTION_APPROVE', 'AUDIT_READ', 'SAMPLING_CALIBRATE']
  },
  {
    id: 'ROL-02',
    roleName: 'Examiner',
    description: 'Technical assessment, evidence verification, signal discovery, gap analysis, and mandate drafting.',
    accessScope: 'Assigned CSEs and critical infrastructure domains',
    userCount: 8,
    status: 'ACTIVE',
    permissions: ['ASSESSMENT_WRITE', 'FINDING_PROMOTE', 'SIGNAL_ANNOTATE', 'EVIDENCE_VERIFY', 'SAMPLING_EXECUTE']
  },
  {
    id: 'ROL-03',
    roleName: 'Auditor',
    description: 'Independent inspection of cryptographic ledgers, tamper-evident logs, and procedural chain-of-custody.',
    accessScope: 'Read-only access across all audit streams and historical archives',
    userCount: 3,
    status: 'ACTIVE',
    permissions: ['AUDIT_INSPECT', 'LEDGER_VERIFY', 'HASH_SEAL_VALIDATE', 'CHAIN_CUSTODY_EXPORT']
  },
  {
    id: 'ROL-04',
    roleName: 'Administrator',
    description: 'Hardware security module keys, user provisioning, air-gap policy schemas, and system manifests.',
    accessScope: 'Enclave infrastructure & access control administration',
    userCount: 2,
    status: 'ACTIVE',
    permissions: ['SYSTEM_ROOT', 'USER_PROVISION', 'POLICY_OVERRIDE', 'ENCLAVE_SIGN', 'AUDIT_EXPORT']
  }
];

export const mockCseAccessRules: CseAccessRule[] = [
  {
    id: 'ACC-001',
    userOrRole: 'examiner_07 (Sarah Jenkins)',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    accessType: 'Read + Review',
    scope: 'Assessment Data, Telemetry & Corrective Evidence',
    status: 'Active',
    grantedBy: 'Dr. Vikram Malhotra',
    grantedDate: '01 Jul 2026'
  },
  {
    id: 'ACC-002',
    userOrRole: 'examiner_07 (Sarah Jenkins)',
    cseId: 'CSE-021',
    cseName: 'TelcoGrid Telecom',
    accessType: 'Read + Review',
    scope: 'Core IMS Telemetry & Bastion Evidence',
    status: 'Active',
    grantedBy: 'Dr. Vikram Malhotra',
    grantedDate: '01 Jul 2026'
  },
  {
    id: 'ACC-003',
    userOrRole: 'a.sharma (Amitabh Sharma)',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    accessType: 'Read + Review',
    scope: 'Substation Firewall Patch Verification',
    status: 'Active',
    grantedBy: 'Sarah Jenkins',
    grantedDate: '10 Aug 2026'
  },
  {
    id: 'ACC-004',
    userOrRole: 'Supervisor Role',
    cseId: 'CSE-007',
    cseName: 'State Bank of Bharat',
    accessType: 'Full Supervisory',
    scope: 'All Financial Interconnect Findings & Verification',
    status: 'Active',
    grantedBy: 'Board Directorate',
    grantedDate: '15 May 2026'
  },
  {
    id: 'ACC-005',
    userOrRole: 'Auditor Role',
    cseId: 'ALL_CSES',
    cseName: 'All Critical Sector Entities',
    accessType: 'Read Only',
    scope: 'Cryptographic Audit Trails & Immutable Digests',
    status: 'Active',
    grantedBy: 'Statutory Mandate Sec 16',
    grantedDate: '01 Jan 2026'
  }
];

export const mockSecurityConfig: SecurityConfigItem[] = [
  {
    id: 'SEC-01',
    category: 'AUTHENTICATION',
    title: 'Multi-Factor Hardware Challenge',
    description: 'Hardware token cryptographic challenge required for all examiner and administrative console sessions.',
    value: 'FIPS-140-2 Level 3 Smartcard + Physical FIDO2 Key',
    status: 'ENFORCED',
    standard: 'NCIIPC Framework Sec 12(a)'
  },
  {
    id: 'SEC-02',
    category: 'SESSION',
    title: 'Inactivity Enclave Lock',
    description: 'Automatic session suspension and display blanking after inactivity period.',
    value: '15 Minutes Maximum Inactivity Horizon',
    status: 'HARDENED',
    standard: 'Air-Gap Security Directive 4.2'
  },
  {
    id: 'SEC-03',
    category: 'AUDIT_LOGGING',
    title: 'Tamper-Evident Ledger Chaining',
    description: 'Every supervisory action is recorded in sequential append-only SHA-256 blocks.',
    value: 'Continuous Merkle Root Anchoring (Zero Drift)',
    status: 'ENFORCED',
    standard: 'Statutory Audit Rule 8.4'
  },
  {
    id: 'SEC-04',
    category: 'DATA_PROTECTION',
    title: 'At-Rest Volume Cryptography',
    description: 'Physical disk volumes and working databases encrypted under hardware HSM keys.',
    value: 'AES-256-GCM Hardware-Backed Encryption',
    status: 'HARDENED',
    standard: 'FIPS 140-2 L3 Hardware Root'
  },
  {
    id: 'SEC-05',
    category: 'AIR_GAP',
    title: 'Network Isolation Policy',
    description: 'Complete physical and logical air-gap without internet egress, routing, or DNS resolution.',
    value: 'Zero Egress Air-Gap Boundary Active',
    status: 'ENFORCED',
    standard: 'National Critical Enclave Standard'
  },
  {
    id: 'SEC-06',
    category: 'ENVIRONMENT',
    title: 'Operational Deployment Node',
    description: 'Hardened Linux kernel with SELinux enforcing policy and immutable file systems.',
    value: 'Production Hardened Supervisory Node 01',
    status: 'ACTIVE',
    standard: 'NCIIPC Infrastructure Standard'
  }
];

export const mockSupervisoryControls: SupervisoryControl[] = [
  {
    id: 'CTRL-01',
    name: 'Boundary Telemetry Ingestion',
    domain: 'Telemetry & Ingestion',
    version: 'v3.2',
    status: 'ACTIVE',
    applicability: 'All Sectors (Mandatory)',
    lastUpdated: '15 Sep 2026',
    description: 'Critical sector entities must provide continuous OCSF-compliant syslog, firewall, and endpoint telemetry.',
    expectedCapability: 'Real-time or daily automated ingestion with cryptographic verification of transmission digests.',
    expectedEvidence: 'Firewall raw logs, SIEM export parcels, OCSF canonical alert streams.',
    assessmentCriteria: 'No telemetry gaps exceeding 4 hours; SHA-256 transmission signatures match local repository hashes.',
    relatedRules: ['RULE-2026.01', 'INGEST-01', 'OCSF-1.1'],
    relatedFindings: ['FND-0041'],
    versionHistory: [
      { version: 'v3.2', releaseDate: '15 Sep 2026', changes: 'Aligned with OCSF v1.1.0 JSON-LD schema specification.', active: true },
      { version: 'v3.1', releaseDate: '10 Jan 2026', changes: 'Added support for SCADA boundary gateway syslog protocol.', active: false },
      { version: 'v2.8', releaseDate: '04 Aug 2025', changes: 'Initial baseline for SIEM export formats.', active: false }
    ]
  },
  {
    id: 'CTRL-04',
    name: 'Privileged Access & Hardware MFA',
    domain: 'Identity & Access Management',
    version: 'v2.4',
    status: 'ACTIVE',
    applicability: 'Banking, Energy & Telecom',
    lastUpdated: '18 Sep 2026',
    description: 'Mandatory dual-custody hardware MFA tokens for root bastion and SCADA console access sessions.',
    expectedCapability: 'Hardware FIDO2 challenge verification on all administrative jumpbox portals.',
    expectedEvidence: 'PAM Bastion session logs (EVD-881), FIDO2 token attestation (EVD-882), RADIUS audit trails.',
    assessmentCriteria: 'Zero bypass of hardware multi-factor challenge on core infrastructure consoles.',
    relatedRules: ['RULE-2026.04', 'BEHAVIOUR-04', 'R-2.4'],
    relatedFindings: ['FND-0131', 'FND-0118'],
    versionHistory: [
      { version: 'v2.4', releaseDate: '18 Sep 2026', changes: 'Mandated dual-custody approval for emergency maintenance bypass.', active: true },
      { version: 'v2.0', releaseDate: '22 Feb 2026', changes: 'Enforced physical token seed verification.', active: false }
    ]
  },
  {
    id: 'CTRL-07',
    name: 'Mandatory Tier-2 Regulatory Escalation',
    domain: 'SOC Operations & Incident Handling',
    version: 'v1.4',
    status: 'ACTIVE',
    applicability: 'Energy / Power & Critical Infra',
    lastUpdated: '12 Sep 2026',
    description: 'Supervised entities must submit Level-2 SOAR escalation telemetry within statutory 15-minute SLA.',
    expectedCapability: 'Automated dispatch triggering with cryptographic timestamp verification and incident packet capture.',
    expectedEvidence: 'Tier-2 Escalation Telemetry (ESC-221), SOAR Triage Worklog (EVD-742), Push Logs (EVD-761).',
    assessmentCriteria: 'Every severity-1 event must contain corresponding dispatch packet with verified SHA-256 digest.',
    relatedRules: ['RULE-2026.08', 'EXEC-GAP-1.4', 'R-2.4'],
    relatedFindings: ['FND-0142', 'FND-0089'],
    versionHistory: [
      { version: 'v1.4', releaseDate: '12 Sep 2026', changes: 'Added mandatory cryptographic dispatch attestation requirement.', active: true },
      { version: 'v1.3', releaseDate: '14 Jan 2026', changes: 'Standardized 15-minute SLA calculation window.', active: false },
      { version: 'v1.2', releaseDate: '10 Aug 2025', changes: 'Initial baseline for critical energy sector entities.', active: false }
    ]
  },
  {
    id: 'CTRL-09',
    name: 'Patch Verification on Relay Firewalls',
    domain: 'Vulnerability & Patch Management',
    version: 'v3.0',
    status: 'ACTIVE',
    applicability: 'Energy / Substation OT & Banking HSM',
    lastUpdated: '20 Sep 2026',
    description: 'Standardized 14-day statutory patch staging pipeline for all critical relay firewalls and HSM partitions.',
    expectedCapability: 'Automated staging verification scan and dual-officer zeroization attestation.',
    expectedEvidence: 'Nessus OT Infrastructure Scan (EVD-642), HSM Health Reports (EVD-401), Derivation Logs.',
    assessmentCriteria: 'No unpatched critical vulnerabilities exceeding 14 calendar days without formal statutory waiver.',
    relatedRules: ['RULE-2026.09', 'HISTORICAL-02', 'R-2.4'],
    relatedFindings: ['FND-0128', 'FND-0109'],
    versionHistory: [
      { version: 'v3.0', releaseDate: '20 Sep 2026', changes: 'Eliminated indefinite manual patch waiver extensions.', active: true },
      { version: 'v2.1', releaseDate: '05 Mar 2026', changes: 'Added HSM key derivation zeroization proofs.', active: false }
    ]
  },
  {
    id: 'CTRL-11',
    name: 'Continuous Telemetry Monitoring',
    domain: 'Monitoring & SIEM Synchronization',
    version: 'v3.2',
    status: 'ACTIVE',
    applicability: 'Transport / Rail & Telecom',
    lastUpdated: '22 Sep 2026',
    description: 'Perimeter firewall syslog streams must synchronize with central collectors within 50ms NTP drift boundary.',
    expectedCapability: 'Precision time protocol synchronization and continuous mirror checksum checking.',
    expectedEvidence: 'NTP Stratum-1 Audit Feed (EVD-688), Collector Syslog Export (EVD-689).',
    assessmentCriteria: 'NTP offset must remain strictly within statutory 50ms envelope over 48-hour assessment windows.',
    relatedRules: ['RULE-2026.11', 'CONSISTENCY-01', 'R-2.4'],
    relatedFindings: ['FND-0076'],
    versionHistory: [
      { version: 'v3.2', releaseDate: '22 Sep 2026', changes: 'Enforced Stratum-1 atomic clock reference requirement.', active: true }
    ]
  },
  {
    id: 'CTRL-12',
    name: 'Security Audit Log Cryptographic Integrity',
    domain: 'Log Management & Integrity',
    version: 'v3.1',
    status: 'ACTIVE',
    applicability: 'All Sectors (Mandatory)',
    lastUpdated: '10 Sep 2026',
    description: 'All operational security event logs must be sealed with sequential hash chaining to prevent retroactive alteration.',
    expectedCapability: 'WORM (Write Once Read Many) storage with cryptographic Merkle tree attestation.',
    expectedEvidence: 'Immutable hash chain export, HSM signing keys, tamper-detection alerts.',
    assessmentCriteria: 'Zero broken links in sequential hash digest ledger over 365-day archive retention horizon.',
    relatedRules: ['RULE-2026.12', 'INTEGRITY-01'],
    relatedFindings: [],
    versionHistory: [
      { version: 'v3.1', releaseDate: '10 Sep 2026', changes: 'Migrated to SHA-256 with FIPS 140-2 L3 hardware seal.', active: true }
    ]
  },
  {
    id: 'CTRL-15',
    name: 'Endpoint Detection & Containment Latency',
    domain: 'Incident Response & Containment',
    version: 'v1.9',
    status: 'ACTIVE',
    applicability: 'Telecom & Defense Enclaves',
    lastUpdated: '01 Sep 2026',
    description: 'Host-level isolation of compromised endpoints must execute within 180 seconds of statutory signal detection.',
    expectedCapability: 'Automated EDR agent host network quarantine and process termination telemetry.',
    expectedEvidence: 'EDR containment log exports, host network barrier receipts.',
    assessmentCriteria: 'Containment latency SLA under 180 seconds across all verified endpoint compromises.',
    relatedRules: ['RULE-2026.15', 'COVERAGE-03'],
    relatedFindings: ['FND-0052'],
    versionHistory: [
      { version: 'v1.9', releaseDate: '01 Sep 2026', changes: 'Reduced latency SLA threshold from 300s to 180s.', active: true }
    ]
  }
];

export const mockSystemVersions: SystemComponentVersion[] = [
  {
    id: 'VER-001',
    component: 'Execution Gap Analytics Engine',
    version: 'v1.4.2',
    type: 'Rule Engine',
    status: 'Active',
    released: '15 Aug 2026',
    activeSince: 'Q3 2026 Cycle',
    usedBy: 'Examiner Workspace, Review Queue',
    description: 'Evaluates Expected Baseline telemetry vs Observed submission blocks to detect unfulfilled regulatory mandates.',
    changeSummary: 'Enhanced negative space pattern recognition for delayed Level-2 SOAR triggers during incident outages.',
    dependencies: ['OCSF v1.1.0', 'Petri Net Engine v1.6'],
    previousVersion: 'v1.3.9',
    hashSignature: 'SHA-256: 9b4e11a0cc4412ef7710aef8844390011200fa88'
  },
  {
    id: 'VER-002',
    component: 'Negative Space Discovery Engine',
    version: 'v1.2.0',
    type: 'Rule Engine',
    status: 'Active',
    released: '20 Aug 2026',
    activeSince: 'Q3 2026 Cycle',
    usedBy: 'Examiner Workspace, Review Queue',
    description: 'Identifies statistically anomalous absences in event telemetry across expected control execution windows.',
    changeSummary: 'Integrated cross-entity baseline variance matrices for Energy and Financial Sector CSEs.',
    dependencies: ['OCSF v1.1.0', 'Statistical Baseline v2.0'],
    previousVersion: 'v1.1.4',
    hashSignature: 'SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f'
  },
  {
    id: 'VER-003',
    component: 'NCIIPC Statutory Control Library',
    version: 'v3.2.0',
    type: 'Control Baseline',
    status: 'Active',
    released: '01 Jul 2026',
    activeSince: 'Q3 2026 Cycle',
    usedBy: 'CSE Assessments, Evidence Explorer, Control Library',
    description: 'Statutory supervisory control catalog defining mandatory capabilities, required evidence, and assessment criteria.',
    changeSummary: 'Formalized 7 critical control standards covering boundary telemetry, MFA, escalation, and relay patches.',
    dependencies: ['NCIIPC Framework Sec 12(a)', 'FIPS 140-2 L3 Standard'],
    previousVersion: 'v3.1.2',
    hashSignature: 'SHA-256: c3ab8ff13720e8ad9047dd39466b3c8974e592c2'
  },
  {
    id: 'VER-004',
    component: 'XGBoost Risk Prioritization Model',
    version: 'v2.1.0',
    type: 'Supervisory Model',
    status: 'Active',
    released: '10 Sep 2026',
    activeSince: 'Q3 2026 Cycle',
    usedBy: 'Review Queue, Sampling Engine',
    description: 'Deterministic gradient-boosted prioritization model scoring candidate findings and sampling targets.',
    changeSummary: 'Calibrated weights for recurrence penalties and multi-signal fusion amplifiers.',
    dependencies: ['Scikit-learn 1.4', 'XGBoost Core 2.0'],
    previousVersion: 'v2.0.1',
    hashSignature: 'SHA-256: 88bca82f91734bc129b71f92e7d3a82fbc625801'
  },
  {
    id: 'VER-005',
    component: 'Petri Net Process Conformance (PM4Py)',
    version: 'v1.6.4',
    type: 'Supervisory Model',
    status: 'Active',
    released: '05 Sep 2026',
    activeSince: 'Q3 2026 Cycle',
    usedBy: 'Examiner Workspace, Verification Gates',
    description: 'Mathematical process mining engine evaluating event logs against normative state-transition graphs.',
    changeSummary: 'Added strict transition timing guards for emergency response and firewall isolation cycles.',
    dependencies: ['PM4Py 2.7', 'OCSF v1.1.0'],
    previousVersion: 'v1.5.8',
    hashSignature: 'SHA-256: 129b71f92e7d3a82fbc625801c4e9124a9829f0e'
  },
  {
    id: 'VER-006',
    component: 'SAT-SA Air-Gapped Supervisory Console',
    version: 'v0.9.4',
    type: 'Core System',
    status: 'Current',
    released: '24 Sep 2026',
    activeSince: 'All Enclaves',
    usedBy: 'Supervisory Directorate, Examiners, Auditors',
    description: 'Offline air-gapped web console delivering supervisory decision support, evidence fusion, and verification.',
    changeSummary: 'Unified Governance workspace, consolidated Remediation lifecycle, and streamlined Evidence Explorer.',
    dependencies: ['React 18', 'Vite 8', 'Tailwind CSS', 'FIPS-140-2 Crypto Provider'],
    previousVersion: 'v0.9.2',
    hashSignature: 'SHA-256: 4f9910ae4481c002882910fa7281bc2271882012'
  }
];
