import { Priority, SamplingMethodology } from './common';

export interface RecommendedSample {
  id: string;
  caseId: string;
  cseId: string;
  cseName: string;
  methodology: SamplingMethodology;
  samplingReason: string;
  signals: string[];
  priority: Priority;
  evidenceStrength: 'HIGH' | 'MEDIUM' | 'LOW';
  selected: boolean;
  controlId: string;
  status?: 'RECOMMENDED' | 'SELECTED' | 'IN_REVIEW' | 'REVIEWED';
  assessmentPeriod?: string;
  evidenceStatus?: 'PRESENT' | 'NOT_SUBMITTED' | 'PARTIAL' | 'UNKNOWN';
  relatedFindingId?: string;
  recommendedAt?: string;
}
