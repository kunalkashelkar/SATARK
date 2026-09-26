import { RecommendedSample } from '@/types';

export const mockSamples: RecommendedSample[] = [
  {
    id: 'SMP-01',
    caseId: 'CASE-1042',
    cseId: 'CSE-014',
    cseName: 'Northern Power Grid Transmission Co.',
    methodology: 'RISK_BASED',
    samplingReason: 'Execution Gap + Historical Recurrence on Critical OT Control CTRL-07',
    signals: ['Execution Gap', 'Process Deviation', 'Historical Recurrence'],
    priority: 'HIGH',
    evidenceStrength: 'HIGH',
    selected: true,
    controlId: 'CTRL-07'
  },
  {
    id: 'SMP-02',
    caseId: 'CASE-1182',
    cseId: 'CSE-009',
    cseName: 'Apex Interbank Settlement System',
    methodology: 'COVERAGE_BASED',
    samplingReason: 'Negative Space candidate: 22% missing telemetry on Core Payment Switch',
    signals: ['Negative Space', 'Coverage Gap'],
    priority: 'HIGH',
    evidenceStrength: 'MEDIUM',
    selected: true,
    controlId: 'CTRL-12'
  },
  {
    id: 'SMP-03',
    caseId: 'CASE-1098',
    cseId: 'CSE-021',
    cseName: 'National Rail Logistics Freight Core',
    methodology: 'ANOMALY_BASED',
    samplingReason: 'Unusually rapid closure duration (4 minutes vs 42 minute peer median)',
    signals: ['Process Deviation', 'Workload Anomaly'],
    priority: 'MEDIUM',
    evidenceStrength: 'HIGH',
    selected: true,
    controlId: 'CTRL-04'
  },
  {
    id: 'SMP-04',
    caseId: 'CASE-0921',
    cseId: 'CSE-003',
    cseName: 'Coastal Petroleum Refinery Automation',
    methodology: 'RECURRENCE_BASED',
    samplingReason: 'Persistent remediation regression on emergency trip sensor alerts',
    signals: ['Historical Recurrence', 'Remediation Regression'],
    priority: 'MEDIUM',
    evidenceStrength: 'HIGH',
    selected: false,
    controlId: 'CTRL-09'
  },
  {
    id: 'SMP-05',
    caseId: 'CASE-1205',
    cseId: 'CSE-007',
    cseName: 'Strategic Port Container Terminal',
    methodology: 'BASELINE_RANDOM',
    samplingReason: 'Periodic baseline random sample across Maritime sector cohort',
    signals: ['Baseline Verification'],
    priority: 'LOW',
    evidenceStrength: 'HIGH',
    selected: false,
    controlId: 'CTRL-01'
  }
];
