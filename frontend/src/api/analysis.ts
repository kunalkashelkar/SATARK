import { apiClient } from './client';
import { 
  AnalyticsEngineMeta, 
  AnalyticsSignal, 
  EngineType 
} from '@/data/mock/analysis';

export interface HubMetricsResponse {
  totalSignals: number;
  criticalSignals: number;
  activeEngines: number;
  affectedCSEs: number;
  meanHealthScore: number;
}

export const analysisApi = {
  getEngines: async (): Promise<AnalyticsEngineMeta[]> => {
    const res = await apiClient.get<AnalyticsEngineMeta[]>('/analysis/engines');
    return res.data;
  },

  getEngineBySlug: async (slug: string): Promise<AnalyticsEngineMeta> => {
    const res = await apiClient.get<AnalyticsEngineMeta>(`/analysis/engines/${slug}`);
    return res.data;
  },

  getSignals: async (): Promise<AnalyticsSignal[]> => {
    const res = await apiClient.get<AnalyticsSignal[]>('/analysis/signals');
    return res.data;
  },

  getSignalsByEngine: async (engineType: EngineType | string): Promise<AnalyticsSignal[]> => {
    const res = await apiClient.get<AnalyticsSignal[]>(`/analysis/engines/${engineType}/signals`);
    return res.data;
  },

  getSignalsBySlug: async (slug: string): Promise<AnalyticsSignal[]> => {
    const res = await apiClient.get<AnalyticsSignal[]>(`/analysis/engines/${slug}/signals`);
    return res.data;
  },

  getHubMetrics: async (): Promise<HubMetricsResponse> => {
    const res = await apiClient.get<HubMetricsResponse>('/analysis/hub/metrics');
    return res.data;
  },

  runEngine: async (slug: string, cseId?: string): Promise<any> => {
    const res = await apiClient.post<any>(`/analysis/engines/${slug}/run`, {
      cse_id: cseId,
      persist: true
    });
    return res.data;
  },

  getJobStatus: async (jobId: string): Promise<any> => {
    const res = await apiClient.get<any>(`/analysis/jobs/${jobId}`);
    return res.data;
  }
};
