import { apiClient } from './client';

export interface PriorityFeedItem {
  id: string;
  public_id: string;
  cse_id: string;
  cse_name: string;
  control_id?: string;
  title: string;
  signal_type: string;
  priority: string;
  evidence_strength: string;
  expected_state: string;
  observed_state: string;
  gap_summary: string;
  why_flagged: string;
  status: string;
}

export interface CseStatusItem {
  id: string;
  cse_id: string;
  name: string;
  sector: string;
  tier: string;
  status: string;
  evidence_readiness: number;
  open_findings: number;
  open_remediations: number;
}

export interface EngineDistributionItem {
  name: string;
  count: number;
  fill: string;
  type: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  action_type: string;
  target_url: string;
}

export interface DashboardMetrics {
  csesAssessed: number;
  totalRegisteredCSEs: number;
  activeFindings: number;
  highPrioritySignals: number;
  evidenceReadiness: number;
  executionGaps: number;
  negativeSpace: number;
  samplesRecommended: number;
  openFindings: number;
  openRemediation: number;
  priority_feed: PriorityFeedItem[];
  cse_status: CseStatusItem[];
  engine_distribution: EngineDistributionItem[];
  quick_actions: QuickActionItem[];
  signalDistribution: EngineDistributionItem[];
  expectedVsObservedMetrics: {
    expectedInvestigationCompletion: number;
    observedInvestigationCompletion: number;
    executionGapPct: number;
    expectedEscalationCoverage: number;
    observedEscalationCoverage: number;
    negativeSpacePct: number;
  };
  evidenceQuality: {
    readinessPct: number;
    schema: number;
    completeness: number;
    relationships: number;
    timestampQuality: number;
    coverage: number;
    crossFileConsistency: number;
  };
}

export const overviewApi = {
  getOverviewMetrics: async (): Promise<DashboardMetrics> => {
    const res = await apiClient.get<DashboardMetrics>('/overview');
    return res.data;
  }
};

// Compatibility export
export const dashboardApi = overviewApi;
