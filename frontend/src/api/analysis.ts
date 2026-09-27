import { apiClient } from './client';
import { 
  AUTHORITATIVE_ENGINES, 
  mockAnalyticsSignals, 
  AnalyticsEngineMeta, 
  AnalyticsSignal,
  EngineType,
  getAnalysisHubMetrics
} from '@/data/mock/analysis';

export const analysisApi = {
  getEngines: async (): Promise<AnalyticsEngineMeta[]> => {
    const res = await apiClient.get('/api/v1/analysis/engines', [...AUTHORITATIVE_ENGINES]);
    return res.data;
  },
  getEngineBySlug: async (slug: string): Promise<AnalyticsEngineMeta | undefined> => {
    const found = AUTHORITATIVE_ENGINES.find(e => e.slug === slug);
    const res = await apiClient.get(`/api/v1/analysis/engines/${slug}`, found);
    return res.data;
  },
  getSignals: async (): Promise<AnalyticsSignal[]> => {
    const res = await apiClient.get('/api/v1/analysis/signals', [...mockAnalyticsSignals]);
    return res.data;
  },
  getSignalsByEngine: async (engineType: EngineType): Promise<AnalyticsSignal[]> => {
    const signals = mockAnalyticsSignals.filter(s => s.engineType === engineType);
    const res = await apiClient.get(`/api/v1/analysis/engines/${engineType}/signals`, signals);
    return res.data;
  },
  getSignalsBySlug: async (slug: string): Promise<AnalyticsSignal[]> => {
    const engine = AUTHORITATIVE_ENGINES.find(e => e.slug === slug);
    const signals = engine ? mockAnalyticsSignals.filter(s => s.engineType === engine.id) : [];
    const res = await apiClient.get(`/api/v1/analysis/engines/${slug}/signals`, signals);
    return res.data;
  },
  getHubMetrics: async () => {
    const metrics = getAnalysisHubMetrics();
    const res = await apiClient.get('/api/v1/analysis/hub/metrics', metrics);
    return res.data;
  }
};
