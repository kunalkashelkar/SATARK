import { apiClient } from './client';
import { mockSubmissions } from '@/data/mock/submissions';
import { CSESubmission } from '@/types';

export const submissionsApi = {
  getAll: async (): Promise<CSESubmission[]> => {
    const res = await apiClient.get('/api/v1/submissions', [...mockSubmissions]);
    return res.data;
  },
  getByCseId: async (cseId: string): Promise<CSESubmission[]> => {
    const matches = mockSubmissions.filter(s => s.cseId.toLowerCase() === cseId.toLowerCase());
    const res = await apiClient.get(`/api/v1/supervision/cses/${cseId}/submissions`, matches);
    return res.data;
  }
};
