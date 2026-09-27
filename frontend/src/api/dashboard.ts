import { apiClient } from './client';

export interface DashboardMetrics {
  csesAssessed: number;
  totalRegisteredCSEs: number;
  activeFindings: number;
  highPrioritySignals: number;
  evidenceReadiness: number;
  executionGaps: number;
  negativeSpace: number;
  samplesRecommended: number;
  openRemediation: number;
  signalDistribution: Array<{ name: string; count: number; fill: string }>;
  expectedVsObservedMetrics: {
    expectedInvestigationCompletion: number;
    observedInvestigationCompletion: number;
    executionGapPct: number;
    expectedEscalationCoverage: number;
    observedEscalationCoverage: number;
    negativeSpacePct: number;
  };
  evidenceQuality: {
    readinessPct: number;
    schema: number;
    completeness: number;
    relationships: number;
    timestampQuality: number;
    coverage: number;
    crossFileConsistency: number;
  };
}

export const dashboardApi = {
  getOverviewMetrics: async (): Promise<DashboardMetrics> => {
    const mock = {
      csesAssessed: 10,
      totalRegisteredCSEs: 10,
      activeFindings: 40,
      highPrioritySignals: 8,
      evidenceReadiness: 81,
      executionGaps: 25,
      negativeSpace: 14,
      samplesRecommended: 20,
      openRemediation: 14,
      signalDistribution: [
        { name: 'Execution Gap', count: 25, fill: '#ef4444' },
        { name: 'Negative Space', count: 14, fill: '#ffb693' },
        { name: 'Process Deviation', count: 15, fill: '#eab308' },
        { name: 'Investigation', count: 12, fill: '#afc6ff' },
        { name: 'Behavioural', count: 9, fill: '#8b5cf6' },
        { name: 'Historical', count: 11, fill: '#ec4899' },
        { name: 'Consistency', count: 8, fill: '#7bdb80' },
        { name: 'Coverage Gap', count: 10, fill: '#10b981' },
      ],
      expectedVsObservedMetrics: {
        expectedInvestigationCompletion: 96,
        observedInvestigationCompletion: 81,
        executionGapPct: 15,
        expectedEscalationCoverage: 92,
        observedEscalationCoverage: 71,
        negativeSpacePct: 8,
      },
      evidenceQuality: {
        readinessPct: 81,
        schema: 100,
        completeness: 88,
        relationships: 82,
        timestampQuality: 94,
        coverage: 76,
        crossFileConsistency: 85,
      }
    };

    const res = await apiClient.get('/api/v1/supervision/overview', mock);
    return res.data;
  }
};
