import { apiClient } from './client';
import { mockRemediations, mockVerifications, RemediationMandate, VerificationRecord } from '@/data/mock/remediation';

export const remediationApi = {
  getAll: async (): Promise<RemediationMandate[]> => {
    const res = await apiClient.get('/api/v1/remediation', [...mockRemediations]);
    return res.data;
  },
  getByCseId: async (cseId: string): Promise<RemediationMandate[]> => {
    const matches = mockRemediations.filter(r => r.cseId.toLowerCase() === cseId.toLowerCase());
    const res = await apiClient.get(`/api/v1/remediation/cse/${cseId}`, matches);
    return res.data;
  },
  getVerifications: async (): Promise<VerificationRecord[]> => {
    const res = await apiClient.get('/api/v1/verification', [...mockVerifications]);
    return res.data;
  }
};
