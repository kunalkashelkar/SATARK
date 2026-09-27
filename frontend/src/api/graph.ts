import { apiClient } from './client';

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  sublabel: string;
  status: 'VERIFIED' | 'CRITICAL' | 'WARNING' | 'PENDING' | 'NEUTRAL';
  x: number;
  y: number;
  detail_url?: string;
  data: {
    entity: string;
    details: string;
    sha256?: string;
    source?: string;
    timestamp?: string;
    findingId?: string;
    evidenceId?: string;
  };
}

export interface GraphLink {
  from: string;
  to: string;
  label?: string;
  type?: 'normal' | 'gap' | 'verified';
}

export interface GraphResponse {
  nodes: GraphNode[];
  links: GraphLink[];
  summary: {
    total_nodes: number;
    total_edges: number;
    entity_counts: Record<string, number>;
  };
}

export const graphApi = {
  getGraph: async (params?: { 
    cse_id?: string; 
    control_id?: string; 
    evidence_id?: string; 
    signal_id?: string; 
    finding_id?: string 
  }): Promise<GraphResponse> => {
    const query = new URLSearchParams();
    if (params?.cse_id && params.cse_id !== 'ALL') query.set('cse_id', params.cse_id);
    if (params?.control_id) query.set('control_id', params.control_id);
    if (params?.evidence_id) query.set('evidence_id', params.evidence_id);
    if (params?.signal_id) query.set('signal_id', params.signal_id);
    if (params?.finding_id) query.set('finding_id', params.finding_id);

    const res = await apiClient.get<GraphResponse>(`/graph?${query.toString()}`);
    return res.data;
  }
};
