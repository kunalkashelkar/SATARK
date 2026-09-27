import { apiClient } from './client';
import { CSEAssessment } from '@/types';

export interface PaginatedCSEResponse {
  items: CSEAssessment[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export const cseApi = {
  getAll: async (params?: { search?: string; sector?: string; tier?: string; status?: string }): Promise<CSEAssessment[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.sector && params.sector !== 'ALL') query.set('sector', params.sector);
    if (params?.tier && params.tier !== 'ALL') query.set('tier', params.tier);
    if (params?.status && params.status !== 'ALL') query.set('assessment_status', params.status);
    query.set('page_size', '100');

    const res = await apiClient.get<PaginatedCSEResponse | CSEAssessment[]>(`/cses?${query.toString()}`);
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return res.data.items || [];
  },

  getById: async (id: string): Promise<CSEAssessment> => {
    const res = await apiClient.get<CSEAssessment>(`/cses/${id}`);
    return res.data;
  },

  create: async (payload: any): Promise<CSEAssessment> => {
    const res = await apiClient.post<CSEAssessment>('/cses', payload);
    return res.data;
  },

  update: async (id: string, payload: any): Promise<CSEAssessment> => {
    const res = await apiClient.patch<CSEAssessment>(`/cses/${id}`, payload);
    return res.data;
  }
};

// Compatibility export
export const csesApi = cseApi;
