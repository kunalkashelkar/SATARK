import { mockCSEs } from '../data/mock/cses';
import { mockFindings } from '../data/mock/findings';
import { mockSamples } from '../data/mock/samples';
import { CSEAssessment, Finding, RecommendedSample } from '@/types';

export const dashboardApi = {
  getOverviewMetrics: async () => {
    return {
      csesAssessed: 8,
      totalRegisteredCSEs: 10,
      activeFindings: 40,
      highPrioritySignals: 8,
      evidenceReadiness: 79,
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
        readinessPct: 79,
        schema: 100,
        completeness: 88,
        relationships: 82,
        timestampQuality: 94,
        coverage: 76,
        crossFileConsistency: 85,
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
  updateDecision: async (id: string, decision: { status: any; notes: string; reason: string }): Promise<Finding | undefined> => {
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
