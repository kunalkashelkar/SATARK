import { Priority } from './common';

export interface CSEAssessment {
  id: string;
  cseId: string;
  cseName: string;
  sector: string;
  period: string;
  evidenceReadiness: number; // percentage
  supervisoryPriority: Priority;
  executionGapsCount: number;
  negativeSpaceCount: number;
  processDeviationsCount: number;
  openFindingsCount: number;
  remediationCount: number;
  status: 'UNDER_EXAMINATION' | 'PENDING_SUBMISSION' | 'ASSESSMENT_COMPLETED';
  claimedCapability: 'HIGH' | 'MEDIUM' | 'LOW';
  observedCapability: 'HIGH' | 'MEDIUM' | 'LOW';
  capabilityDiscrepancy: boolean;
  signalsSummary: string[];
}
