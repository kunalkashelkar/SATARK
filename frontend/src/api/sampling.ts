import { apiClient, API_BASE_URL } from './client';
import { RecommendedSample } from '@/types';

export interface SamplingRunPayload {
  title?: string;
  parameters?: {
    sector?: string;
    tier?: string;
    risk?: string;
    anomaly_presence?: boolean;
    sample_size?: number;
  };
  random_seed?: number;
}

export interface SamplingRunResponse {
  id: string;
  run_id: string;
  title: string;
  algorithm_version: string;
  random_seed: number;
  status: string;
  created_by_name: string;
  total_items: number;
  items: RecommendedSample[];
  created_at: string;
}

export const adaptBackendSample = (item: any): RecommendedSample => {
  return {
    id: item.item_id || item.id,
    caseId: item.case_id || `CASE-${item.item_id || item.id}`,
    cseId: item.cse_public_id || item.cse_id,
    cseName: item.cse_name || `${item.cse_id} Operational Unit`,
    controlId: item.control_ref || item.control_id || 'CTRL-07',
    priority: (item.priority as any) || 'HIGH',
    methodology: (item.methodology as any) || 'RISK_BASED',
    samplingReason: item.sampling_reason || 'Stratified supervisory sampling candidate',
    evidenceStrength: (item.evidence_strength as any) || 'HIGH',
    evidenceStatus: (item.evidence_status as any) || 'PRESENT',
    status: item.selected ? 'SELECTED' : ((item.status as any) || 'RECOMMENDED'),
    selected: Boolean(item.selected),
    assessmentPeriod: item.assessment_period || 'Q3 2026',
    signals: typeof item.signals === 'string' ? JSON.parse(item.signals) : (item.signals || ['EXECUTION_GAP'])
  };
};

export const samplingApi = {
  getAll: async (params?: { cse_id?: string; methodology?: string; priority?: string; status?: string; search?: string }): Promise<RecommendedSample[]> => {
    const query = new URLSearchParams();
    if (params?.cse_id && params.cse_id !== 'ALL') query.set('cse_id', params.cse_id);
    if (params?.methodology && params.methodology !== 'ALL') query.set('methodology', params.methodology);
    if (params?.priority && params.priority !== 'ALL') query.set('priority', params.priority);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await apiClient.get<any[]>(`/sampling?${query.toString()}`);
    return res.data.map(adaptBackendSample);
  },

  getByCseId: async (cseId: string): Promise<RecommendedSample[]> => {
    const res = await apiClient.get<any[]>(`/sampling/cse/${cseId}`);
    return res.data.map(adaptBackendSample);
  },

  createRun: async (payload: SamplingRunPayload): Promise<SamplingRunResponse> => {
    const res = await apiClient.post<SamplingRunResponse>('/sampling/runs', payload);
    return res.data;
  },

  getRun: async (runId: string): Promise<SamplingRunResponse> => {
    const res = await apiClient.get<SamplingRunResponse>(`/sampling/runs/${runId}`);
    return res.data;
  },

  getRunItems: async (runId: string): Promise<RecommendedSample[]> => {
    const res = await apiClient.get<any[]>(`/sampling/runs/${runId}/items`);
    return res.data.map(adaptBackendSample);
  },

  toggleItem: async (itemId: string): Promise<RecommendedSample> => {
    const res = await apiClient.post<any>(`/sampling/items/${itemId}/toggle`);
    return adaptBackendSample(res.data);
  },

  getExportUrl: (runId: string = 'SRUN-2026-001'): string => {
    return `${API_BASE_URL}/sampling/runs/${runId}/export`;
  }
};
