import { apiClient } from './client';
import { AuditTrailItem } from '@/data/mock/audit';
import { 
  SystemUser, 
  AdminRole, 
  CseAccessRule, 
  SupervisoryControl, 
  SystemComponentVersion 
} from '@/data/mock/governance';

export interface AuditListResponse {
  items: Array<{
    id: string;
    event_id: string;
    actor_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    before?: string;
    after?: string;
    timestamp: string;
    request_id?: string;
    examiner_badge?: string;
    target_type?: string;
    target_id?: string;
    previous_status?: string;
    new_status?: string;
    reason?: string;
    notes?: string;
    created_at: string;
  }>;
  total: number;
}

export const adaptBackendAuditEvent = (item: any): AuditTrailItem => {
  const dateObj = new Date(item.timestamp || item.created_at || Date.now());
  const formattedDate = dateObj.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return {
    id: item.event_id || item.id,
    timestamp: formattedDate,
    actor: item.examiner_badge || item.actor_id || 'System Enclave Core',
    actorDetail: 'NCIIPC Air-Gapped Supervisory Node',
    actorRole: 'Regulatory Officer',
    actorType: (item.actor_id?.startsWith('USR') || item.actor_id?.startsWith('NC-')) ? 'HUMAN' : 'SYSTEM',
    action: item.action?.replace(/_/g, ' ') || 'State Mutation',
    targetObject: item.entity_id || item.target_id || 'SYSTEM',
    previousState: item.previous_status || 'INITIAL',
    newState: item.new_status || 'VERIFIED',
    result: (item.action?.includes('FAILURE') || item.action?.includes('DENIED')) ? 'REJECTED' : 'SUCCESS',
    reason: item.reason || item.notes || `Operation executed: ${item.action}`,
    linkedObject: item.entity_id,
    controlVersion: 'CTRL-v3.2',
    ruleVersion: 'R-2.4'
  };
};

export const adaptBackendControl = (item: any): SupervisoryControl => {
  return {
    id: item.public_id || item.code || item.id,
    name: item.title,
    domain: item.domain || 'Operational Controls',
    status: (item.status as any) || 'ACTIVE',
    version: item.version || '2026.3',
    applicability: item.applicability || 'Mandatory Tier-1 / Tier-2 Enclaves',
    description: item.description || '',
    expectedCapability: item.expected_capability || '',
    expectedEvidence: item.expected_evidence || '',
    assessmentCriteria: item.assessment_criteria || '',
    lastUpdated: item.updated_at || '2026-08-20',
    relatedRules: item.related_rules || [],
    relatedFindings: item.related_findings || [],
    versionHistory: item.version_history || [
      { version: item.version || '2026.3', releaseDate: '2026-06-01', changes: 'Initial baseline', active: true }
    ]
  };
};

export const adaptBackendUser = (item: any): SystemUser => {
  return {
    id: item.public_id || item.id,
    username: item.username,
    name: item.name,
    email: item.email,
    role: (item.role as any) || 'EXAMINER',
    badge: item.badge || 'NC-0000',
    organization: item.organization || 'NCIIPC',
    status: (item.status as any) || 'ACTIVE',
    lastActivity: item.lastActivity || 'Recently',
    mfaType: item.mfa_type || 'FIPS-140-2 L3 Smartcard',
    cseScope: item.cse_scope || [],
    permissions: item.permissions || ['VIEW_EVIDENCE', 'AUDIT_REVIEW']
  };
};

export const governanceApi = {
  // 1. Audit Ledger
  getAuditTrail: async (params?: { action?: string; actor_id?: string; entity_type?: string; limit?: number; offset?: number }): Promise<AuditTrailItem[]> => {
    const query = new URLSearchParams();
    if (params?.action && params.action !== 'ALL') query.set('action', params.action);
    if (params?.actor_id && params.actor_id !== 'ALL') query.set('actor_id', params.actor_id);
    if (params?.entity_type && params.entity_type !== 'ALL') query.set('entity_type', params.entity_type);
    query.set('limit', String(params?.limit || 200));

    const res = await apiClient.get<AuditListResponse>(`/governance/audit?${query.toString()}`);
    return (res.data.items || []).map(adaptBackendAuditEvent);
  },

  getAuditEvent: async (eventId: string): Promise<AuditTrailItem> => {
    const res = await apiClient.get<any>(`/governance/audit/${eventId}`);
    return adaptBackendAuditEvent(res.data);
  },

  // 2. Administration & Users
  getUsers: async (): Promise<SystemUser[]> => {
    const res = await apiClient.get<any[]>('/governance/users');
    return res.data.map(adaptBackendUser);
  },

  createUser: async (payload: any): Promise<SystemUser> => {
    const res = await apiClient.post<any>('/governance/users', payload);
    return adaptBackendUser(res.data);
  },

  updateUser: async (id: string, payload: any): Promise<SystemUser> => {
    const res = await apiClient.patch<any>(`/governance/users/${id}`, payload);
    return adaptBackendUser(res.data);
  },

  getRoles: async (): Promise<AdminRole[]> => {
    const res = await apiClient.get<AdminRole[]>('/governance/roles');
    return res.data;
  },

  getAccessRules: async (): Promise<CseAccessRule[]> => {
    const res = await apiClient.get<CseAccessRule[]>('/governance/access');
    return res.data;
  },

  // 3. Control Library
  getControls: async (params?: { domain?: string; severity?: string; status?: string; search?: string }): Promise<SupervisoryControl[]> => {
    const query = new URLSearchParams();
    if (params?.domain && params.domain !== 'ALL') query.set('domain', params.domain);
    if (params?.severity && params.severity !== 'ALL') query.set('severity', params.severity);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await apiClient.get<any[]>(`/controls?${query.toString()}`);
    return res.data.map(adaptBackendControl);
  },

  getControl: async (controlId: string): Promise<SupervisoryControl> => {
    const res = await apiClient.get<any>(`/controls/${controlId}`);
    return adaptBackendControl(res.data);
  },

  createControl: async (payload: any): Promise<SupervisoryControl> => {
    const res = await apiClient.post<any>('/controls', payload);
    return adaptBackendControl(res.data);
  },

  updateControl: async (controlId: string, payload: any): Promise<SupervisoryControl> => {
    const res = await apiClient.patch<any>(`/controls/${controlId}`, payload);
    return adaptBackendControl(res.data);
  },

  // 4. System Versions
  getSystemVersions: async (): Promise<SystemComponentVersion[]> => {
    const res = await apiClient.get<any[]>('/governance/versions');
    return res.data.map((v: any, index: number) => ({
      id: v.id || `VER-00${index + 1}`,
      component: v.release_name || v.component || 'SAT-SA Platform',
      version: v.version || 'v4.8.2',
      type: 'Core System' as const,
      status: (v.status as any) || 'Active',
      released: v.released || '2026-08-01',
      activeSince: v.active_since || '2026-08-15',
      usedBy: 'Supervisory Enclave System',
      description: v.changelog || 'Core system release baseline',
      changeSummary: v.changelog || 'Authoritative engine synchronization',
      dependencies: ['FastAPI Backend', 'SQLite / Postgres', 'Docker Enclave'],
      previousVersion: 'v4.8.1',
      hashSignature: v.git_commit || 'a7f89b4c2e11'
    }));
  },

  getRuleVersions: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>('/governance/versions/rules');
    return res.data;
  },

  getModelVersions: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>('/governance/versions/models');
    return res.data;
  },

  getPipelineRuns: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>('/governance/versions/pipelines');
    return res.data;
  }
};
