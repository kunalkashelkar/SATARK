import { Priority } from './common';

export interface CSEAssessment {
  id: string;
  cseId: string;
  cseName: string;
  sector: 'Energy' | 'Banking' | 'Telecom' | 'Transport' | 'Oil & Gas';
  period: string;
  evidenceReadiness: number; // percentage (e.g., 71% for CSE-014)
  readinessCategory: 'Deficient' | 'Acceptable' | 'Robust';
  supervisoryPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  executionGapsCount: number;
  negativeSpaceCount: number;
  processDeviationsCount: number;
  openFindingsCount: number;
  criticalFindingsCount: number;
  remediationCount: number;
  status: 'Review Required' | 'Under Review' | 'Monitoring';
  claimedCapability: number; // e.g. 24 controls claimed
  observedCapability: number; // e.g. 19 controls observed
  capabilityDiscrepancyCount: number; // 5 controls
  primarySignal: string;
  signalsSummary: string[];
}
