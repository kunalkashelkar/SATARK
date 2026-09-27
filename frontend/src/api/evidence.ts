import { apiClient } from './client';
import { mockEvidenceList, MockEvidenceRecord } from '@/data/mock/evidence';

export const evidenceApi = {
  getAll: async (): Promise<MockEvidenceRecord[]> => {
    const res = await apiClient.get('/api/v1/evidence', [...mockEvidenceList]);
    return res.data;
  },
  getByCseId: async (cseId: string): Promise<MockEvidenceRecord[]> => {
    const matches = mockEvidenceList.filter(e => e.cseId.toLowerCase() === cseId.toLowerCase());
    const res = await apiClient.get(`/api/v1/supervision/cses/${cseId}/evidence`, matches);
    return res.data;
  },
  getById: async (id: string): Promise<MockEvidenceRecord | undefined> => {
    const found = mockEvidenceList.find(e => e.id.toLowerCase() === id.toLowerCase());
    const res = await apiClient.get(`/api/v1/evidence/${id}`, found);
    return res.data;
  }
};
