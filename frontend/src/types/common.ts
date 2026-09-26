export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EvidenceStatus = 
  | 'PRESENT' 
  | 'ABSENT_CONFIRMED' 
  | 'NOT_SUBMITTED' 
  | 'NOT_APPLICABLE' 
  | 'UNKNOWN';

export type FindingStatus = 
  | 'CANDIDATE' 
  | 'UNDER_REVIEW' 
  | 'VALIDATED' 
  | 'QUALIFIED' 
  | 'REJECTED' 
  | 'OVERRIDDEN';

export type RemediationStatus = 
  | 'OPEN' 
  | 'IN_PROGRESS' 
  | 'SUBMITTED' 
  | 'UNDER_VERIFICATION' 
  | 'CLOSED' 
  | 'REOPENED';

export type SignalType = 
  | 'EXECUTION_GAP'
  | 'NEGATIVE_SPACE'
  | 'PROCESS_DEVIATION'
  | 'INVESTIGATION'
  | 'BEHAVIOURAL'
  | 'HISTORICAL_RECURRENCE'
  | 'PEER_DEVIATION'
  | 'CROSS_SOURCE_CONSISTENCY'
  | 'COVERAGE_GAP'
  | 'METRIC_INTEGRITY'
  | 'CAPABILITY_DISCREPANCY';

export type SamplingMethodology =
  | 'RISK_BASED'
  | 'EVIDENCE_BASED'
  | 'COVERAGE_BASED'
  | 'RECURRENCE_BASED'
  | 'ANOMALY_BASED'
  | 'PEER_BASED'
  | 'BASELINE_RANDOM';
