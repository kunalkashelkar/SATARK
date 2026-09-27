export type EngineType =
  | 'EXECUTION_GAP'
  | 'NEGATIVE_SPACE'
  | 'COVERAGE'
  | 'PROCESS_CONFORMANCE'
  | 'INVESTIGATION_QUALITY'
  | 'BEHAVIOURAL_DEVIATION'
  | 'HISTORICAL_COMPARISON'
  | 'PEER_BENCHMARKING'
  | 'CROSS_SOURCE_CONSISTENCY'
  | 'METRIC_INTEGRITY';

export interface AnalyticsEngineMeta {
  id: EngineType;
  slug: string;
  name: string;
  shortName: string;
  purpose: string;
  iconName: string;
  signalCount: number;
  status: 'Active' | 'Under Review';
  route: string;
}

export interface AnalyticsSignal {
  signalId: string;
  engineType: EngineType;
  cseId: string;
  cseName: string;
  assessmentId: string;
  controlId: string;
  findingId?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'CANDIDATE' | 'UNDER_REVIEW' | 'VALIDATED' | 'DISMISSED';
  title: string;
  reason: string;
  expected: string;
  observed: string;
  difference: string;
  evidenceIds: string[];
  recommendedForSampling?: boolean;
  ruleVersion: string;
  controlVersion: string;
  modelVersion: string;
  updatedAt: string;

  // Engine-specific attributes:
  gapType?: 'Missing Execution' | 'Delayed Execution' | 'Incorrect Sequence' | 'Incomplete Execution';
  evidenceState?: 'PRESENT' | 'ABSENT_CONFIRMED' | 'NOT_SUBMITTED' | 'NOT_APPLICABLE' | 'UNKNOWN';
  coverageArea?: 'Asset Coverage' | 'Monitoring Coverage' | 'Alert-Class Coverage' | 'Investigation Coverage' | 'Escalation Coverage' | 'Time-Period Coverage';
  deviationType?: 'Missing Step' | 'Unexpected Step' | 'Sequence Deviation' | 'Timing Deviation' | 'Closure Anomaly';
  expectedProcess?: string;
  observedProcess?: string;
  investigationDepth?: 'Comprehensive' | 'Adequate' | 'Shallow' | 'Unverified';
  evidenceLinkage?: 'Strong' | 'Partial' | 'Broken';
  outcomeConsistency?: 'Consistent' | 'Discrepant' | 'Unjustified';
  metricName?: string;
  baselineValue?: string | number;
  currentValue?: string | number;
  peerCohortValue?: string | number;
  historicalPeriod?: string;
  trendDirection?: 'improving' | 'degrading' | 'recurrent' | 'stable';
  sourceA?: string;
  sourceB?: string;
  kpiReported?: string;
  kpiObserved?: string;
}

export const AUTHORITATIVE_ENGINES: AnalyticsEngineMeta[] = [
  {
    id: 'EXECUTION_GAP',
    slug: 'execution-gap',
    name: 'Execution Gap Engine',
    shortName: 'Execution Gap',
    purpose: 'What should have happened but was not sufficiently evidenced?',
    iconName: 'rule_folder',
    signalCount: 18,
    status: 'Active',
    route: '/analysis/execution-gap'
  },
  {
    id: 'NEGATIVE_SPACE',
    slug: 'negative-space',
    name: 'Negative Space Engine',
    shortName: 'Negative Space',
    purpose: 'What evidence should exist but is missing or unavailable?',
    iconName: 'contrast',
    signalCount: 11,
    status: 'Active',
    route: '/analysis/negative-space'
  },
  {
    id: 'COVERAGE',
    slug: 'coverage',
    name: 'Coverage & Blind-Spot Engine',
    shortName: 'Coverage & Blind Spots',
    purpose: 'Where is monitoring or evidence coverage incomplete?',
    iconName: 'radar',
    signalCount: 7,
    status: 'Active',
    route: '/analysis/coverage'
  },
  {
    id: 'PROCESS_CONFORMANCE',
    slug: 'process',
    name: 'Process Conformance Engine',
    shortName: 'Process Conformance',
    purpose: 'Did the observed process follow the expected sequence?',
    iconName: 'account_tree',
    signalCount: 9,
    status: 'Active',
    route: '/analysis/process'
  },
  {
    id: 'INVESTIGATION_QUALITY',
    slug: 'investigation-quality',
    name: 'Investigation Quality Engine',
    shortName: 'Investigation Quality',
    purpose: 'Is the investigation sufficiently evidenced and linked to its outcome?',
    iconName: 'verified',
    signalCount: 6,
    status: 'Active',
    route: '/analysis/investigation-quality'
  },
  {
    id: 'BEHAVIOURAL_DEVIATION',
    slug: 'behavioural',
    name: 'Behavioural Deviation Engine',
    shortName: 'Behavioural Deviation',
    purpose: 'Has operational behaviour changed materially from its validated baseline?',
    iconName: 'psychology',
    signalCount: 5,
    status: 'Active',
    route: '/analysis/behavioural'
  },
  {
    id: 'HISTORICAL_COMPARISON',
    slug: 'historical',
    name: 'Historical Comparison Engine',
    shortName: 'Historical Comparison',
    purpose: 'How does the current assessment compare with previous periods?',
    iconName: 'timeline',
    signalCount: 4,
    status: 'Active',
    route: '/analysis/historical'
  },
  {
    id: 'PEER_BENCHMARKING',
    slug: 'peer',
    name: 'Peer Benchmarking Engine',
    shortName: 'Peer Benchmarking',
    purpose: 'How does the CSE compare with its authorized peer cohort?',
    iconName: 'compare_arrows',
    signalCount: 3,
    status: 'Active',
    route: '/analysis/peer'
  },
  {
    id: 'CROSS_SOURCE_CONSISTENCY',
    slug: 'consistency',
    name: 'Cross-Source Consistency Engine',
    shortName: 'Cross-Source Consistency',
    purpose: 'Do independent evidence sources agree?',
    iconName: 'stacked_line_chart',
    signalCount: 3,
    status: 'Active',
    route: '/analysis/consistency'
  },
  {
    id: 'METRIC_INTEGRITY',
    slug: 'metric-integrity',
    name: 'Metric Integrity / KPI-Outcome Analysis Engine',
    shortName: 'Metric Integrity',
    purpose: 'Do reported KPIs align with underlying operational evidence?',
    iconName: 'difference',
    signalCount: 2,
    status: 'Active',
    route: '/analysis/metric-integrity'
  }
];

export const mockAnalyticsSignals: AnalyticsSignal[] = [
  // 1. EXECUTION GAP SIGNALS
  {
    signalId: 'SIG-EG-01',
    engineType: 'EXECUTION_GAP',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-07',
    findingId: 'FND-0142',
    priority: 'CRITICAL',
    status: 'CANDIDATE',
    title: 'Missing Tier-2 Regulatory SOAR Escalation Dispatch',
    reason: 'Incident INV-338 was marked as closed without required cryptographic Level-2 escalation packet ESC-221.',
    expected: 'Mandatory tier-2 escalation dispatched to regulatory authorities within 15 minutes of grid outage classification.',
    observed: 'Incident triaged locally on workstation EX-04 and closed without outbound SOAR dispatch record.',
    difference: 'Missing Execution / Unrecorded Escalation Payload',
    gapType: 'Missing Execution',
    evidenceIds: ['EVD-742', 'EVD-761', 'ESC-221'],
    recommendedForSampling: true,
    ruleVersion: 'EXEC-GAP-1.4',
    controlVersion: 'CTRL-07 v3.2',
    modelVersion: 'PM4Py-1.6.4',
    updatedAt: '26 Sep 2026 14:18 IST'
  },
  {
    signalId: 'SIG-EG-02',
    engineType: 'EXECUTION_GAP',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-09',
    findingId: 'FND-0128',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    title: 'Delayed Relay Firewall Firmware Patch Staging',
    reason: 'Critical vulnerability VULN-2026-8819 remained unpatched for 45 days past the statutory 14-day energy boundary.',
    expected: 'Critical CVE applied to substation relay firewalls within 14 calendar days.',
    observed: 'Patch applied on Day 45 under temporary manual exception.',
    difference: 'Delayed Execution / Exceeded Statutory 14-Day Horizon',
    gapType: 'Delayed Execution',
    evidenceIds: ['EVD-642'],
    recommendedForSampling: false,
    ruleVersion: 'EXEC-GAP-1.4',
    controlVersion: 'CTRL-09 v3.0',
    modelVersion: 'XGB-2.1.0',
    updatedAt: '20 Sep 2026 11:20 IST'
  },
  {
    signalId: 'SIG-EG-03',
    engineType: 'EXECUTION_GAP',
    cseId: 'CSE-007',
    cseName: 'State Bank of Bharat',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-04',
    findingId: 'FND-0131',
    priority: 'HIGH',
    status: 'VALIDATED',
    title: 'Hardware MFA Challenge Bypass on Core Bastion Console',
    reason: 'Console session initiated without required FIDO2 physical token challenge record.',
    expected: 'Dual-custody hardware MFA challenge verified on every root jumpbox access.',
    observed: 'Root session logged with static API token bypass.',
    difference: 'Incorrect Sequence / Unauthenticated Root Session',
    gapType: 'Incorrect Sequence',
    evidenceIds: ['EVD-881', 'EVD-882'],
    recommendedForSampling: true,
    ruleVersion: 'EXEC-GAP-1.4',
    controlVersion: 'CTRL-04 v2.4',
    modelVersion: 'PM4Py-1.6.4',
    updatedAt: '24 Sep 2026 10:15 IST'
  },

  // 2. NEGATIVE SPACE SIGNALS
  {
    signalId: 'SIG-NS-01',
    engineType: 'NEGATIVE_SPACE',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-07',
    findingId: 'FND-0142',
    priority: 'HIGH',
    status: 'CANDIDATE',
    title: 'Expected Escalation Dispatch Telemetry Void',
    reason: 'Telemetry parcel ESC-221 is expected for high-severity grid disruption but has not been submitted.',
    expected: 'Raw cryptographic dispatch payload ESC-221 with valid SHA-256 header.',
    observed: 'Placeholder or missing file in submission parcel SUB-2026-0814.',
    difference: 'Negative Space / Missing Statutory Record',
    evidenceState: 'NOT_SUBMITTED',
    evidenceIds: ['ESC-221'],
    recommendedForSampling: true,
    ruleVersion: 'NEG-SPACE-1.2',
    controlVersion: 'CTRL-07 v3.2',
    modelVersion: 'Stat-Baseline-2.0',
    updatedAt: '26 Sep 2026 14:18 IST'
  },
  {
    signalId: 'SIG-NS-02',
    engineType: 'NEGATIVE_SPACE',
    cseId: 'CSE-008',
    cseName: 'ReserveBank Interconnect',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-09',
    findingId: 'FND-0109',
    priority: 'CRITICAL',
    status: 'UNDER_REVIEW',
    title: 'HSM Master Key Derivation Log Void',
    reason: 'Cryptographic derivation log omitted during partition rotation audit.',
    expected: 'Dual-officer witness derivation sign-off record (EVD-402).',
    observed: 'Record confirmed absent from encrypted enclave submission.',
    difference: 'Confirmed Absent / Missing Dual-Officer Derivation Signature',
    evidenceState: 'ABSENT_CONFIRMED',
    evidenceIds: ['EVD-401', 'EVD-402'],
    recommendedForSampling: true,
    ruleVersion: 'NEG-SPACE-1.2',
    controlVersion: 'CTRL-09 v2.1',
    modelVersion: 'Stat-Baseline-2.0',
    updatedAt: '08 Sep 2026 15:45 IST'
  },

  // 3. COVERAGE & BLIND SPOTS
  {
    signalId: 'SIG-COV-01',
    engineType: 'COVERAGE',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-01',
    findingId: 'FND-0041',
    priority: 'HIGH',
    status: 'CANDIDATE',
    title: 'Substation SCADA Gateway Telemetry Blind Spot',
    reason: 'Perimeter syslog stream dropped for 48 consecutive hours on Northern Sector Gateway 03.',
    expected: 'Continuous 24/7 boundary telemetry stream across all 12 substation ingress nodes.',
    observed: 'Gateway 03 log stream absent between 12-14 Aug 2026.',
    difference: 'Time-Period & Monitoring Coverage Void (48 Hours)',
    coverageArea: 'Monitoring Coverage',
    evidenceIds: ['EVD-761'],
    recommendedForSampling: true,
    ruleVersion: 'COVERAGE-1.3',
    controlVersion: 'CTRL-01 v3.2',
    modelVersion: 'OCSF-1.1.0',
    updatedAt: '15 Aug 2026 09:00 IST'
  },
  {
    signalId: 'SIG-COV-02',
    engineType: 'COVERAGE',
    cseId: 'CSE-021',
    cseName: 'TelcoGrid Telecom',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-15',
    findingId: 'FND-0052',
    priority: 'MEDIUM',
    status: 'UNDER_REVIEW',
    title: 'Unmonitored Edge Router Cluster During Peak Window',
    reason: '6 core interconnect routers lacked active EDR telemetry during Q3 peak maintenance window.',
    expected: '100% asset coverage across critical telecom routing fabric.',
    observed: '88% verified coverage; 6 devices unmonitored.',
    difference: 'Asset Coverage Blind Spot (12% Deficit)',
    coverageArea: 'Asset Coverage',
    evidenceIds: ['EVD-512'],
    recommendedForSampling: false,
    ruleVersion: 'COVERAGE-1.3',
    controlVersion: 'CTRL-15 v1.9',
    modelVersion: 'OCSF-1.1.0',
    updatedAt: '01 Sep 2026 12:30 IST'
  },

  // 4. PROCESS CONFORMANCE
  {
    signalId: 'SIG-PC-01',
    engineType: 'PROCESS_CONFORMANCE',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-07',
    findingId: 'FND-0142',
    priority: 'CRITICAL',
    status: 'CANDIDATE',
    title: 'Petri Net Sequence Deviation: Direct Closure Without Escalation',
    reason: 'Observed process sequence bypassed mandatory regulatory escalation transition.',
    expected: 'ACKNOWLEDGE → INVESTIGATE → ESCALATE → RESPOND → CLOSE',
    observed: 'ACKNOWLEDGE → INVESTIGATE → CLOSE',
    difference: 'Sequence Deviation: Escalation and Response phases skipped.',
    deviationType: 'Missing Step',
    expectedProcess: 'ACKNOWLEDGE → INVESTIGATE → ESCALATE → RESPOND → CLOSE',
    observedProcess: 'ACKNOWLEDGE → INVESTIGATE → CLOSE',
    evidenceIds: ['EVD-742'],
    recommendedForSampling: true,
    ruleVersion: 'PROC-CONF-1.6',
    controlVersion: 'CTRL-07 v3.2',
    modelVersion: 'PM4Py-1.6.4',
    updatedAt: '26 Sep 2026 14:18 IST'
  },
  {
    signalId: 'SIG-PC-02',
    engineType: 'PROCESS_CONFORMANCE',
    cseId: 'CSE-007',
    cseName: 'State Bank of Bharat',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-04',
    findingId: 'FND-0131',
    priority: 'HIGH',
    status: 'VALIDATED',
    title: 'Single-Operator Bastion Closure Anomaly',
    reason: 'Incident closure was executed by a single operator token without mandatory supervisor countersignature.',
    expected: 'INVESTIGATE → COUNTERSIGN → REMEDIATE → SEAL',
    observed: 'INVESTIGATE → DIRECT_CLOSE',
    difference: 'Closure Anomaly: Supervisor countersignature transition missing.',
    deviationType: 'Closure Anomaly',
    expectedProcess: 'INVESTIGATE → COUNTERSIGN → REMEDIATE → SEAL',
    observedProcess: 'INVESTIGATE → DIRECT_CLOSE',
    evidenceIds: ['EVD-881'],
    recommendedForSampling: false,
    ruleVersion: 'PROC-CONF-1.6',
    controlVersion: 'CTRL-04 v2.4',
    modelVersion: 'PM4Py-1.6.4',
    updatedAt: '20 Sep 2026 16:30 IST'
  },

  // 5. INVESTIGATION QUALITY
  {
    signalId: 'SIG-IQ-01',
    engineType: 'INVESTIGATION_QUALITY',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-07',
    findingId: 'FND-0142',
    priority: 'HIGH',
    status: 'CANDIDATE',
    title: 'Shallow Root-Cause Investigation on High-Impact Outage',
    reason: 'Incident worklog INV-338 contains only 2 action log entries for a 3-hour grid disruption.',
    expected: 'Comprehensive investigation depth with multi-source forensic telemetry linkage.',
    observed: '2 superficial triage notes; zero containment logs or root-cause forensic attachments.',
    difference: 'Investigation Depth: Shallow (2 logs vs expected >= 15)',
    investigationDepth: 'Shallow',
    evidenceLinkage: 'Partial',
    outcomeConsistency: 'Unjustified',
    evidenceIds: ['EVD-742'],
    recommendedForSampling: true,
    ruleVersion: 'INV-QUAL-1.1',
    controlVersion: 'CTRL-07 v3.2',
    modelVersion: 'OCSF-1.1.0',
    updatedAt: '26 Sep 2026 14:18 IST'
  },

  // 6. BEHAVIOURAL DEVIATION
  {
    signalId: 'SIG-BD-01',
    engineType: 'BEHAVIOURAL_DEVIATION',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-07',
    findingId: 'FND-0142',
    priority: 'HIGH',
    status: 'CANDIDATE',
    title: 'Abrupt Spike in Off-Hours Incident Auto-Closures',
    reason: 'Entity exhibited a 310% increase in incident closures occurring between 02:00 - 05:00 IST.',
    expected: 'Consistent normal closure rate of 4-6% during off-hours window.',
    observed: '18.6% of all Q3 incidents closed during off-hours without secondary review.',
    difference: 'Behavioural Deviation: +12.6% anomalous off-hours closure distribution.',
    metricName: 'Off-Hours Closure Rate',
    baselineValue: '5.2%',
    currentValue: '18.6%',
    evidenceIds: ['EVD-742', 'EVD-761'],
    recommendedForSampling: true,
    ruleVersion: 'BEH-DEV-1.4',
    controlVersion: 'CTRL-07 v3.2',
    modelVersion: 'Stat-Baseline-2.0',
    updatedAt: '22 Sep 2026 18:00 IST'
  },

  // 7. HISTORICAL COMPARISON
  {
    signalId: 'SIG-HC-01',
    engineType: 'HISTORICAL_COMPARISON',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-09',
    findingId: 'FND-0128',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    title: 'Recurrent Delay in Firewall Firmware Remediations Across 3 Cycles',
    reason: 'Control CTRL-09 patch delay pattern repeated in Q2 2025, Q4 2025, and Q3 2026.',
    expected: 'Continuous compliance following verified closure in Q2 2025.',
    observed: 'Temporary patch exception expired and identical 45-day delay re-occurred in Q3 2026.',
    difference: 'Historical Recurrence: Persistent pattern match across 3 assessment periods.',
    historicalPeriod: 'Q2 2025 vs Q4 2025 vs Q3 2026',
    trendDirection: 'recurrent',
    evidenceIds: ['EVD-642'],
    recommendedForSampling: true,
    ruleVersion: 'HIST-REC-1.8',
    controlVersion: 'CTRL-09 v3.0',
    modelVersion: 'Historical-Matrix-1.5',
    updatedAt: '24 Sep 2026 11:00 IST'
  },

  // 8. PEER BENCHMARKING
  {
    signalId: 'SIG-PB-01',
    engineType: 'PEER_BENCHMARKING',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-07',
    findingId: 'FND-0142',
    priority: 'MEDIUM',
    status: 'CANDIDATE',
    title: 'Escalation Reporting Latency Exceeds Power Sector Peer Cohort Baseline',
    reason: 'Mean escalation dispatch latency of 92 minutes compared to peer cohort benchmark of 24 minutes.',
    expected: 'Alignment with Critical Energy Sector peer baseline (24 min mean dispatch latency).',
    observed: 'NorthGrid recorded 92 min mean dispatch latency across 14 severe incidents.',
    difference: 'Contextual Variance: +68 minutes above peer cohort benchmark.',
    metricName: 'Mean Escalation Dispatch Latency',
    baselineValue: '24 Minutes (Cohort Mean)',
    currentValue: '92 Minutes',
    peerCohortValue: '24 Minutes',
    evidenceIds: ['EVD-742'],
    recommendedForSampling: false,
    ruleVersion: 'PEER-BENCH-1.2',
    controlVersion: 'CTRL-07 v3.2',
    modelVersion: 'Aggregated-Cohort-2.1',
    updatedAt: '20 Sep 2026 14:00 IST'
  },

  // 9. CROSS-SOURCE CONSISTENCY
  {
    signalId: 'SIG-CSC-01',
    engineType: 'CROSS_SOURCE_CONSISTENCY',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-11',
    findingId: 'FND-0076',
    priority: 'HIGH',
    status: 'CANDIDATE',
    title: 'Syslog Event Count vs Central Ingestion Collector Discrepancy',
    reason: 'Source syslog export claims 148,200 events, while collector mirror ingested only 104,110 events.',
    expected: '1:1 parity between entity perimeter firewall syslog export and NCIIPC collector mirror.',
    observed: 'Discrepancy of 44,090 unrecorded events during high-alert periods.',
    difference: 'Cross-Source Void: 29.7% unrecorded event deficit.',
    sourceA: 'Perimeter Firewall Syslog Export (148,200 events)',
    sourceB: 'Enclave Collector Mirror Stream (104,110 events)',
    evidenceIds: ['EVD-688', 'EVD-689'],
    recommendedForSampling: true,
    ruleVersion: 'CONSIST-1.1',
    controlVersion: 'CTRL-11 v3.2',
    modelVersion: 'OCSF-1.1.0',
    updatedAt: '22 Sep 2026 16:45 IST'
  },

  // 10. METRIC INTEGRITY
  {
    signalId: 'SIG-MI-01',
    engineType: 'METRIC_INTEGRITY',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-07',
    findingId: 'FND-0142',
    priority: 'HIGH',
    status: 'CANDIDATE',
    title: 'Reported SOAR SLA Compliance vs Timestamp-Derived Evidence',
    reason: 'Entity quarterly self-attestation reported 99.4% SLA adherence, while forensic evidence demonstrates 78.1%.',
    expected: 'Reported metric matches underlying event timestamp delta calculation.',
    observed: 'Attested 99.4% adherence vs 78.1% evidenced compliance in raw log telemetry.',
    difference: 'Metric-Data Discrepancy: -21.3% variance between attestation and forensic calculation.',
    kpiReported: '99.4% SLA Adherence',
    kpiObserved: '78.1% Forensic Adherence',
    evidenceIds: ['EVD-742', 'EVD-761'],
    recommendedForSampling: true,
    ruleVersion: 'METRIC-INT-1.0',
    controlVersion: 'CTRL-07 v3.2',
    modelVersion: 'Deterministic-KPI-1.0',
    updatedAt: '26 Sep 2026 14:18 IST'
  },
  {
    signalId: 'SIG-MI-02',
    engineType: 'METRIC_INTEGRITY',
    cseId: 'CSE-008',
    cseName: 'ReserveBank Interconnect',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-09',
    findingId: 'FND-0109',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    title: 'Reported Key Rotation Frequency vs KMS Cryptographic Audit Logs',
    reason: 'Reported 100% 90-day HSM master key rotation compliance contradicted by static key persistence.',
    expected: 'Reported key rotation cadence directly corroborated by KMS generation timestamps.',
    observed: 'Self-reported 90-day rotation; evidence reflects key active for 410 days.',
    difference: 'Metric-Data Discrepancy: +320 day unevidenced key usage variance.',
    kpiReported: '90-Day Rotation Cadence',
    kpiObserved: '410-Day Actual Lifespan',
    evidenceIds: ['EVD-401'],
    recommendedForSampling: true,
    ruleVersion: 'METRIC-INT-1.0',
    controlVersion: 'CTRL-09 v2.1',
    modelVersion: 'Deterministic-KPI-1.0',
    updatedAt: '25 Sep 2026 10:45 IST'
  },
  {
    signalId: 'SIG-CSC-02',
    engineType: 'CROSS_SOURCE_CONSISTENCY',
    cseId: 'CSE-007',
    cseName: 'State Bank of Bharat',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-04',
    findingId: 'FND-0131',
    priority: 'MEDIUM',
    status: 'VALIDATED',
    title: 'SIEM Incident Creation Timestamp vs EDR Process Termination Delay',
    reason: 'SIEM logged malware containment at 10:14:00, but endpoint EDR telemetry records process running until 10:48:22.',
    expected: 'Temporal coherence between SIEM containment status and active EDR process termination.',
    observed: '34-minute divergence between SIEM containment record and actual process termination.',
    difference: 'Temporal Cross-Source Divergence: 34 minutes uncontained execution.',
    sourceA: 'SOC SIEM Incident Record #INC-9914 (Contained 10:14)',
    sourceB: 'Host EDR Agent Telemetry (Terminated 10:48)',
    evidenceIds: ['EVD-881'],
    recommendedForSampling: false,
    ruleVersion: 'CONSIST-1.1',
    controlVersion: 'CTRL-04 v2.4',
    modelVersion: 'OCSF-1.1.0',
    updatedAt: '21 Sep 2026 17:30 IST'
  },
  {
    signalId: 'SIG-PB-02',
    engineType: 'PEER_BENCHMARKING',
    cseId: 'CSE-021',
    cseName: 'TelcoGrid Telecom',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-15',
    findingId: 'FND-0052',
    priority: 'MEDIUM',
    status: 'UNDER_REVIEW',
    title: 'Tier-1 Alarm Triage Volume Below Sector Baseline',
    reason: 'Automated triage rate of 42 alarms/shift vs peer telecom cohort average of 190 alarms/shift.',
    expected: 'Triage volume commensurate with peer telecom cohort infrastructure density.',
    observed: 'Entity records 42 alarms/shift, indicating possible silent alert suppression.',
    difference: 'Contextual Variance: -77.9% alert volume compared to peer baseline.',
    metricName: 'Triage Alarms / Shift',
    baselineValue: '190 Alarms (Cohort Median)',
    currentValue: '42 Alarms',
    peerCohortValue: '190 Alarms',
    evidenceIds: ['EVD-512'],
    recommendedForSampling: true,
    ruleVersion: 'PEER-BENCH-1.2',
    controlVersion: 'CTRL-15 v1.9',
    modelVersion: 'Aggregated-Cohort-2.1',
    updatedAt: '18 Sep 2026 09:15 IST'
  },
  {
    signalId: 'SIG-HC-02',
    engineType: 'HISTORICAL_COMPARISON',
    cseId: 'CSE-007',
    cseName: 'State Bank of Bharat',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-04',
    findingId: 'FND-0131',
    priority: 'HIGH',
    status: 'VALIDATED',
    title: 'Recurring MFA Jumpbox Bypass Finding Re-Opened',
    reason: 'Bastion authentication bypass was closed in Q4 2025 but recurred in Q3 2026 following cluster upgrade.',
    expected: 'Sustained preventive control effectiveness following verified closure in Q4 2025.',
    observed: 'Bypass mechanism re-emerged with identical signature in current Q3 assessment.',
    difference: 'Remediation Regression: Control failure recurred 6 months after prior sign-off.',
    historicalPeriod: 'Q4 2025 vs Q3 2026',
    trendDirection: 'degrading',
    evidenceIds: ['EVD-881', 'EVD-882'],
    recommendedForSampling: true,
    ruleVersion: 'HIST-REC-1.8',
    controlVersion: 'CTRL-04 v2.4',
    modelVersion: 'Historical-Matrix-1.5',
    updatedAt: '23 Sep 2026 15:20 IST'
  },
  {
    signalId: 'SIG-BD-02',
    engineType: 'BEHAVIOURAL_DEVIATION',
    cseId: 'CSE-008',
    cseName: 'ReserveBank Interconnect',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-09',
    findingId: 'FND-0109',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    title: 'Drop in Manual Escalation Ratio to Tier-2 Security Operations',
    reason: 'Manual escalation volume dropped 84% following change in shift roster without corresponding decrease in severe alerts.',
    expected: 'Escalation volume proportional to raw critical alert telemetry.',
    observed: 'Only 3 manual escalations in 30 days vs baseline of 28 escalations.',
    difference: 'Behavioural Deviation: -89.2% divergence from established operational baseline.',
    metricName: 'Monthly Manual Escalation Volume',
    baselineValue: '28 Cases',
    currentValue: '3 Cases',
    evidenceIds: ['EVD-401'],
    recommendedForSampling: true,
    ruleVersion: 'BEH-DEV-1.4',
    controlVersion: 'CTRL-09 v2.1',
    modelVersion: 'Stat-Baseline-2.0',
    updatedAt: '19 Sep 2026 13:40 IST'
  },
  {
    signalId: 'SIG-IQ-02',
    engineType: 'INVESTIGATION_QUALITY',
    cseId: 'CSE-008',
    cseName: 'ReserveBank Interconnect',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-09',
    findingId: 'FND-0109',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    title: 'Uncorroborated False-Positive Closure Without Telemetry Evidence',
    reason: 'High-severity database exfiltration alert closed as "False Positive - Testing" with zero query logs attached.',
    expected: 'Factual evidence package or authorization ticket reference attached to all false positive closures.',
    observed: 'One-line closure text without attached log extracts, hash validation, or change ticket link.',
    difference: 'Evidence Linkage: Broken / Outcome Discrepant with Threat Model',
    investigationDepth: 'Unverified',
    evidenceLinkage: 'Broken',
    outcomeConsistency: 'Discrepant',
    evidenceIds: ['EVD-401'],
    recommendedForSampling: true,
    ruleVersion: 'INV-QUAL-1.1',
    controlVersion: 'CTRL-09 v2.1',
    modelVersion: 'OCSF-1.1.0',
    updatedAt: '14 Sep 2026 17:10 IST'
  },
  {
    signalId: 'SIG-COV-03',
    engineType: 'COVERAGE',
    cseId: 'CSE-007',
    cseName: 'State Bank of Bharat',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-04',
    findingId: 'FND-0131',
    priority: 'HIGH',
    status: 'VALIDATED',
    title: 'Payment Switch DMZ Out-of-Band Channel Unmonitored',
    reason: 'Out-of-band management console lacks centralized audit logging integration.',
    expected: '100% audit logging coverage for all privileged console interfaces in payment DMZ.',
    observed: 'Out-of-band serial ports not routed to central SIEM.',
    difference: 'Monitoring Coverage Void: Privileged boundary interface unmonitored.',
    coverageArea: 'Monitoring Coverage',
    evidenceIds: ['EVD-881'],
    recommendedForSampling: true,
    ruleVersion: 'COVERAGE-1.3',
    controlVersion: 'CTRL-04 v2.4',
    modelVersion: 'OCSF-1.1.0',
    updatedAt: '12 Sep 2026 11:30 IST'
  },
  {
    signalId: 'SIG-NS-03',
    engineType: 'NEGATIVE_SPACE',
    cseId: 'CSE-021',
    cseName: 'TelcoGrid Telecom',
    assessmentId: 'ASM-2026-Q3',
    controlId: 'CTRL-15',
    findingId: 'FND-0052',
    priority: 'MEDIUM',
    status: 'UNDER_REVIEW',
    title: 'Core Signaling Link BGP Peering Authorization Void',
    reason: 'Statutory interconnection agreement renewal document absent from compliance package.',
    expected: 'Executed mutual interconnect security annex signed by both telecommunications carriers.',
    observed: 'Requirement designated as NOT_APPLICABLE by entity without supervisory exemption filing.',
    difference: 'Negative Space: Unsubstantiated exclusion of statutory evidence.',
    evidenceState: 'NOT_SUBMITTED',
    evidenceIds: ['EVD-512'],
    recommendedForSampling: false,
    ruleVersion: 'NEG-SPACE-1.2',
    controlVersion: 'CTRL-15 v1.9',
    modelVersion: 'Stat-Baseline-2.0',
    updatedAt: '05 Sep 2026 14:15 IST'
  }
];

// Helper Functions
export const getEngineBySlug = (slug: string): AnalyticsEngineMeta | undefined => {
  return AUTHORITATIVE_ENGINES.find(e => e.slug === slug);
};

export const getEngineByType = (type: EngineType): AnalyticsEngineMeta | undefined => {
  return AUTHORITATIVE_ENGINES.find(e => e.id === type);
};

export const getSignalsByEngineType = (type: EngineType): AnalyticsSignal[] => {
  return mockAnalyticsSignals.filter(s => s.engineType === type);
};

export const getSignalsByEngineSlug = (slug: string): AnalyticsSignal[] => {
  const engine = getEngineBySlug(slug);
  if (!engine) return [];
  return mockAnalyticsSignals.filter(s => s.engineType === engine.id);
};

export const getAnalysisHubMetrics = () => {
  const activeEngines = AUTHORITATIVE_ENGINES.filter(e => e.status === 'Active').length;
  const signalsDetected = mockAnalyticsSignals.length;
  // Engines with at least 1 HIGH or CRITICAL signal requiring review
  const enginesWithHighPriority = new Set(
    mockAnalyticsSignals
      .filter(s => (s.priority === 'CRITICAL' || s.priority === 'HIGH') && s.status !== 'VALIDATED')
      .map(s => s.engineType)
  );
  const enginesRequiringReview = enginesWithHighPriority.size;
  // Unique assessments analyzed
  const assessments = new Set(mockAnalyticsSignals.map(s => s.assessmentId));
  const assessmentsAnalyzed = assessments.size > 0 ? assessments.size : 6;

  return {
    activeEngines,
    signalsDetected,
    enginesRequiringReview,
    assessmentsAnalyzed: 6 // Q3 2026 across 6 active regulated CSE cohorts
  };
};
