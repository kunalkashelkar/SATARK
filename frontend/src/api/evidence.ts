import { apiClient } from './client';
import { MockEvidenceRecord } from '@/data/mock/evidence';

export interface EvidenceResponseItem {
  id: string;
  evidence_id: string;
  public_id: string;
  cse_id: string;
  entity?: string;
  category: string;
  state: string;
  source_system: string;
  source_event_id?: string;
  control_id?: string;
  control_code?: string;
  validation_status: string;
  sha256: string;
  hash: string;
  file_path?: string;
  file_size: number;
  file_type: string;
  received_at: string;
  created_at: string;
  updated_at?: string;
  provenance?: {
    id: string;
    evidence_id: string;
    collector: string;
    transmission_token?: string;
    source_host?: string;
    source_ip?: string;
    signature?: string;
    custody_chain: string[];
    received_by: string;
    collector_version?: string;
    schema_version?: string;
    sha256: string;
    ingested_at: string;
    enclave_timestamp?: string;
  };
  control_links: Array<{
    id: string;
    evidence_id: string;
    control_id: string;
    control_code?: string;
    control_title?: string;
    mapping_type: string;
    confidence: number;
    notes?: string;
  }>;
  associated_signals: Array<{
    id: string;
    signal_id: string;
    engine: string;
    title: string;
    priority: string;
    score: number;
  }>;
  associated_findings: Array<{
    id: string;
    finding_id: string;
    title: string;
    priority: string;
    status: string;
  }>;
}

export interface PaginatedEvidenceResponse {
  items: EvidenceResponseItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// Transform backend EvidenceResponseItem into frontend MockEvidenceRecord format
export const adaptBackendEvidence = (item: EvidenceResponseItem): MockEvidenceRecord => {
  const dateObj = new Date(item.received_at || item.created_at || Date.now());
  const timestampDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timestampTime = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
  const timestamp = `${timestampDate} ${timestampTime}`;

  const findingLink = item.associated_findings?.[0]?.finding_id || '';
  const signalLink = item.associated_signals?.[0]?.signal_id || '';
  const gapOrFinding = [findingLink, signalLink].filter(Boolean).join(' / ');

  const controlRef = item.control_links?.[0]?.control_code || item.control_id || 'CTRL-07';

  return {
    id: item.public_id || item.evidence_id || item.id,
    type: `${item.category} Record`,
    recordType: (item.category as any) || 'EVIDENCE',
    cseId: item.cse_id,
    entity: item.entity || `${item.cse_id} Operational Enclave`,
    submissionId: item.provenance?.transmission_token || `SUB-${item.cse_id}-001`,
    caseRef: item.source_event_id || `CASE-${item.public_id}`,
    source: item.provenance?.source_host || item.source_system || 'Air-Gapped Ingestion Gateway',
    sourceSink: `${item.source_system} / OCSF Canonical Model`,
    timestampDate,
    timestampTime,
    timestamp,
    status: (item.state as any) || 'PRESENT',
    integrity: item.validation_status === 'VALID' ? 'VERIFIED (SHA-256)' : item.validation_status,
    hash: item.sha256 || item.hash || 'PENDING_UPLOAD_HASH',
    gapOrFinding,
    gapNote: item.associated_findings?.[0]?.title || `Telemetry linked to ${controlRef}`,
    title: `${item.category} Telemetry — ${item.public_id} (${controlRef})`,
    provenance: item.provenance ? {
      sha256: item.provenance.sha256 || item.sha256,
      collectorVersion: item.provenance.collector_version || 'sat-collector-v2.8-fips',
      enclaveTimestamp: item.provenance.enclave_timestamp || item.received_at,
      custodyChain: item.provenance.custody_chain?.length ? item.provenance.custody_chain : ['Origin Node', 'Air-Gap SFTP Drop', 'NCIIPC Collector Gateway', 'Supervisory Enclave Vault'],
      schemaVersion: item.provenance.schema_version || 'OCSF-1.1.0-SECURITY_FINDING'
    } : undefined
  };
};

export const evidenceApi = {
  getAll: async (params?: { 
    search?: string; 
    cse_id?: string; 
    category?: string; 
    state?: string; 
    validation_status?: string 
  }): Promise<MockEvidenceRecord[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.cse_id && params.cse_id !== 'ALL') query.set('cse_id', params.cse_id);
    if (params?.category && params.category !== 'ALL') query.set('category', params.category);
    if (params?.state && params.state !== 'ALL') query.set('state', params.state);
    if (params?.validation_status && params.validation_status !== 'ALL') query.set('validation_status', params.validation_status);
    query.set('page_size', '200');

    const res = await apiClient.get<PaginatedEvidenceResponse | EvidenceResponseItem[]>(`/evidence?${query.toString()}`);
    const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
    return items.map(adaptBackendEvidence);
  },

  getRawItems: async (params?: any): Promise<EvidenceResponseItem[]> => {
    const res = await apiClient.get<PaginatedEvidenceResponse | EvidenceResponseItem[]>(`/evidence?page_size=200`);
    return Array.isArray(res.data) ? res.data : (res.data.items || []);
  },

  getByCseId: async (cseId: string): Promise<MockEvidenceRecord[]> => {
    const res = await apiClient.get<PaginatedEvidenceResponse | EvidenceResponseItem[]>(`/evidence/cse/${cseId}?page_size=100`);
    const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
    return items.map(adaptBackendEvidence);
  },

  getById: async (id: string): Promise<MockEvidenceRecord> => {
    const res = await apiClient.get<EvidenceResponseItem>(`/evidence/${id}`);
    return adaptBackendEvidence(res.data);
  },

  getRawById: async (id: string): Promise<EvidenceResponseItem> => {
    const res = await apiClient.get<EvidenceResponseItem>(`/evidence/${id}`);
    return res.data;
  },

  validate: async (id: string, decision: 'VALID' | 'INVALID' | 'REJECTED', notes?: string): Promise<EvidenceResponseItem> => {
    const res = await apiClient.post<EvidenceResponseItem>(`/evidence/${id}/validate`, {
      decision,
      notes,
    });
    return res.data;
  },

  ingest: async (payload: any): Promise<EvidenceResponseItem> => {
    const res = await apiClient.post<EvidenceResponseItem>('/evidence', payload);
    return res.data;
  }
};
