import { mockCSEs } from '../data/mock/cses';
import { mockFindings } from '../data/mock/findings';
import { mockSamples } from '../data/mock/samples';
import { CSEAssessment, Finding, RecommendedSample } from '@/types';

export const dashboardApi = {
  getOverviewMetrics: async () => {
    return {
      csesAssessed: 24,
      activeFindings: 17,
      highPrioritySignals: 6,
      evidenceReadiness: 92,
      executionGaps: 31,
      negativeSpace: 14,
      samplesRecommended: 28,
      openRemediation: 9,
      signalDistribution: [
        { name: 'Execution Gap', count: 31, fill: '#ef4444' },
        { name: 'Negative Space', count: 14, fill: '#f97316' },
        { name: 'Process Deviation', count: 22, fill: '#eab308' },
        { name: 'Investigation', count: 18, fill: '#3b82f6' },
        { name: 'Behavioural', count: 12, fill: '#8b5cf6' },
        { name: 'Historical', count: 16, fill: '#ec4899' },
        { name: 'Consistency', count: 9, fill: '#06b6d4' },
        { name: 'Coverage', count: 11, fill: '#10b981' },
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
        readinessPct: 92,
        schema: 100,
        completeness: 94,
        relationships: 89,
        timestampQuality: 97,
        coverage: 86,
        crossFileConsistency: 91,
      }
    };
  }
};

export const csesApi = {
  getAll: async (): Promise<CSEAssessment[]> => {
    return [...mockCSEs];
  },
  getById: async (id: string): Promise<CSEAssessment | undefined> => {
    return mockCSEs.find(c => c.cseId.toLowerCase() === id.toLowerCase() || c.id === id);
  }
};

export const findingsApi = {
  getAll: async (): Promise<Finding[]> => {
    return [...mockFindings];
  },
  getById: async (id: string): Promise<Finding | undefined> => {
    return mockFindings.find(f => f.id.toLowerCase() === id.toLowerCase());
  },
  updateDecision: async (id: string, decision: any): Promise<Finding | undefined> => {
    const finding = mockFindings.find(f => f.id.toLowerCase() === id.toLowerCase());
    if (finding) {
      finding.status = decision.status;
      finding.decisionNotes = decision.notes;
      finding.decisionReason = decision.reason;
      finding.decidedBy = 'examiner_07';
      finding.decidedAt = new Date().toISOString();
    }
    return finding;
  }
};

export const samplingApi = {
  getAll: async (): Promise<RecommendedSample[]> => {
    return [...mockSamples];
  }
};
