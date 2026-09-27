import { Priority } from './common';

export type CSESector =
  | 'Energy / Power'
  | 'Banking / Financial Services'
  | 'Telecommunications'
  | 'Transportation'
  | 'Government / Public Sector'
  | 'Healthcare'
  | 'Information Technology / Digital Services'
  | 'Critical Infrastructure'
  | 'Energy'
  | 'Banking'
  | 'Telecom'
  | 'Transport'
  | string;

export interface CSEAssessment {
  id: string;
  cseId: string;
  cseName: string;
  sector: CSESector;
  organizationType: string;
  location: string;
  period: string;
  assessmentPeriod?: string;
  socType: string;
  evidenceReadiness: number; // percentage (e.g. 71 for CSE-014)
  readinessCategory: 'Deficient' | 'Acceptable' | 'Robust';
  supervisoryPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  executionGapsCount: number;
  negativeSpaceCount: number;
  processDeviationsCount: number;
  openFindingsCount: number;
  criticalFindingsCount: number;
  remediationCount: number;
  remediationStatus: 'OPEN' | 'IN_PROGRESS' | 'UNDER_VERIFICATION' | 'CLOSED';
  lastSubmission: string;
  status: 'Review Required' | 'Under Review' | 'Monitoring';
  claimedCapability: number; // e.g. 24 controls claimed
  observedCapability: number; // e.g. 19 controls observed
  capabilityDiscrepancyCount: number; // 5 controls
  primarySignal: string;
  signalsSummary: string[];
}

export interface CSEAssessmentRecord {
  assessmentId: string;
  cseId: string;
  assessmentPeriod: string;
  assessmentStatus: string;
  controlsAssessed: number;
  evidenceReadiness: number;
  submittedAt: string;
}

export interface CSESubmission {
  submissionId: string;
  cseId: string;
  assessmentId: string;
  fileName: string;
  fileType: 'CSV' | 'JSON' | 'XLSX' | 'PDF' | 'TXT' | 'LOG' | 'ZIP' | 'XML';
  fileSize: string;
  submittedAt: string;
  source: string;
  status: 'PENDING_VALIDATION' | 'VALIDATED' | 'SCHEMA_ERROR' | 'MAPPED';
  hash: string;
  mappingStatus: 'AUTOMATIC_MAPPED' | 'MANUAL_REQUIRED' | 'CONFIRMED';
  category: 'ALERT' | 'CASE' | 'INVESTIGATION' | 'ACTION' | 'EVIDENCE' | 'ESCALATION' | 'RESPONSE' | 'CLOSURE' | 'ASSET' | 'EXCEPTION' | 'REMEDIATION';
  recordCount: number;
}
