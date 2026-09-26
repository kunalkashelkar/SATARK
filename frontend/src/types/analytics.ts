export interface ExecutionGapItem {
  id: string;
  caseId: string;
  cseId: string;
  controlId: string;
  expectedStep: string;
  observedStep: string;
  gapStatus: 'MISSING' | 'INCOMPLETE' | 'OUT_OF_SEQUENCE' | 'PREMATURE_CLOSURE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  evidenceCount: number;
}

export interface NegativeSpaceItem {
  id: string;
  cseId: string;
  assetGroup: string;
  expectedCoveragePct: number;
  observedCoveragePct: number;
  coverageGapPct: number;
  evidenceType: string;
  contextCheckReason: string;
  examinerReviewRequired: boolean;
}

export interface ProcessNode {
  id: string;
  name: string;
  count: number;
  medianDurationMinutes: number;
  deviationPercentage: number;
  hasGap?: boolean;
}
