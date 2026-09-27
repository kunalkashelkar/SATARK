import { apiClient } from './client';
import { Finding, FindingStatus } from '@/types';

export interface FindingDecisionPayload {
  status?: FindingStatus | string;
  notes?: string;
  reason?: string;
}

export interface EvidenceDemandPayload {
  notes: string;
  reason?: string;
  requested_records?: string[];
}

export interface ReviewQueueResponse {
  findings: Finding[];
  total: number;
  unreviewed_count: number;
  priority_breakdown: Record<string, number>;
  signal_distribution: Record<string, number>;
}

export const findingApi = {
  getAll: async (params?: { cse_id?: string; priority?: string; status?: string; search?: string }): Promise<Finding[]> => {
    const query = new URLSearchParams();
    if (params?.cse_id && params.cse_id !== 'ALL') query.set('cse_id', params.cse_id);
    if (params?.priority && params.priority !== 'ALL') query.set('priority', params.priority);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    query.set('page_size', '200');

    const res = await apiClient.get<Finding[]>(`/findings?${query.toString()}`);
    return res.data;
  },

  getReviewQueue: async (params?: { cse_id?: string; priority?: string; status?: string; search?: string }): Promise<ReviewQueueResponse> => {
    const query = new URLSearchParams();
    if (params?.cse_id && params.cse_id !== 'ALL') query.set('cse_id', params.cse_id);
    if (params?.priority && params.priority !== 'ALL') query.set('priority', params.priority);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await apiClient.get<ReviewQueueResponse>(`/review/queue?${query.toString()}`);
    return res.data;
  },

  getById: async (id: string): Promise<Finding> => {
    const res = await apiClient.get<Finding>(`/findings/${id}`);
    return res.data;
  },

  getWorkspace: async (id: string): Promise<any> => {
    const res = await apiClient.get<any>(`/findings/${id}/workspace`);
    return res.data;
  },

  getByCseId: async (cseId: string): Promise<Finding[]> => {
    const res = await apiClient.get<Finding[]>(`/supervision/cses/${cseId}/findings`);
    return res.data;
  },

  // Action: validate
  validate: async (id: string, payload?: FindingDecisionPayload): Promise<Finding> => {
    const res = await apiClient.post<Finding>(`/findings/${id}/validate`, payload || {});
    return res.data;
  },

  // Action: qualify
  qualify: async (id: string, payload?: FindingDecisionPayload): Promise<Finding> => {
    const res = await apiClient.post<Finding>(`/findings/${id}/qualify`, payload || {});
    return res.data;
  },

  // Action: reject
  reject: async (id: string, payload?: FindingDecisionPayload): Promise<Finding> => {
    const res = await apiClient.post<Finding>(`/findings/${id}/reject`, payload || {});
    return res.data;
  },

  // Action: override
  override: async (id: string, payload?: FindingDecisionPayload): Promise<Finding> => {
    const res = await apiClient.post<Finding>(`/findings/${id}/override`, payload || {});
    return res.data;
  },

  // Action: evidence demand
  evidenceDemand: async (id: string, payload: EvidenceDemandPayload): Promise<Finding> => {
    const res = await apiClient.post<Finding>(`/findings/${id}/evidence-demand`, payload);
    return res.data;
  },

  // Compatibility adjudication action
  updateDecision: async (id: string, decision: { status: any; notes?: string; reason?: string }): Promise<Finding> => {
    const status = decision.status;
    if (status === 'VALIDATED') {
      return findingApi.validate(id, decision);
    } else if (status === 'QUALIFIED') {
      return findingApi.qualify(id, decision);
    } else if (status === 'REJECTED') {
      return findingApi.reject(id, decision);
    } else if (status === 'OVERRIDDEN') {
      return findingApi.override(id, decision);
    } else if (status === 'UNDER_REVIEW') {
      return findingApi.evidenceDemand(id, { notes: decision.notes || 'Evidence demanded', reason: decision.reason });
    }
    const res = await apiClient.post<Finding>(`/review/findings/${id}/adjudicate`, decision);
    return res.data;
  }
};

// Compatibility export
export const findingsApi = findingApi;
