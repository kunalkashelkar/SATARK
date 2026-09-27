import { apiClient } from './client';
import { mockSamples } from '@/data/mock/samples';
import { RecommendedSample } from '@/types';

export const samplingApi = {
  getAll: async (): Promise<RecommendedSample[]> => {
    const res = await apiClient.get('/api/v1/sampling', [...mockSamples]);
    return res.data;
  },
  getByCseId: async (cseId: string): Promise<RecommendedSample[]> => {
    const matches = mockSamples.filter(s => s.cseId.toLowerCase() === cseId.toLowerCase() || s.cseName.toLowerCase().includes(cseId.toLowerCase()));
    const res = await apiClient.get(`/api/v1/sampling/cse/${cseId}`, matches);
    return res.data;
  }
};
