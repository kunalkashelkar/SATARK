import { apiClient } from './client';
import { mockFindings } from '@/data/mock/findings';
import { Finding } from '@/types';

export const findingsApi = {
  getAll: async (): Promise<Finding[]> => {
    const res = await apiClient.get('/api/v1/review/findings', [...mockFindings]);
    return res.data;
  },
  getById: async (id: string): Promise<Finding | undefined> => {
    const found = mockFindings.find(f => f.id.toLowerCase() === id.toLowerCase());
    const res = await apiClient.get(`/api/v1/review/findings/${id}`, found);
    return res.data;
  },
  getByCseId: async (cseId: string): Promise<Finding[]> => {
    const matches = mockFindings.filter(f => f.cseId.toLowerCase() === cseId.toLowerCase());
    const res = await apiClient.get(`/api/v1/supervision/cses/${cseId}/findings`, matches);
    return res.data;
  },
  updateDecision: async (id: string, decision: { status: any; notes: string; reason: string }): Promise<Finding | undefined> => {
    const finding = mockFindings.find(f => f.id.toLowerCase() === id.toLowerCase());
    if (finding) {
      finding.status = decision.status;
      finding.decisionNotes = decision.notes;
      finding.decisionReason = decision.reason;
      finding.decidedBy = 'NC-8802 (Lead Examiner)';
      finding.decidedAt = new Date().toISOString();
    }
    const res = await apiClient.post(`/api/v1/review/findings/${id}/adjudicate`, decision, finding);
    return res.data;
  }
};
