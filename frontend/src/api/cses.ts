import { apiClient } from './client';
import { mockCSEs } from '@/data/mock/cses';
import { CSEAssessment } from '@/types';

export const csesApi = {
  getAll: async (): Promise<CSEAssessment[]> => {
    const res = await apiClient.get('/api/v1/supervision/cses', [...mockCSEs]);
    return res.data;
  },
  getById: async (id: string): Promise<CSEAssessment | undefined> => {
    const found = mockCSEs.find(c => c.cseId.toLowerCase() === id.toLowerCase() || c.id === id);
    const res = await apiClient.get(`/api/v1/supervision/cses/${id}`, found);
    return res.data;
  }
};
