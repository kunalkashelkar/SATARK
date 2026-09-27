import { apiClient } from './client';
import { RemediationMandate, VerificationRecord, RemediationRegression } from '@/data/mock/remediation';

export const adaptBackendRemediation = (item: any): RemediationMandate => {
  let artifacts = [];
  if (typeof item.artifacts === 'string') {
    try { artifacts = JSON.parse(item.artifacts); } catch { artifacts = []; }
  } else if (Array.isArray(item.artifacts)) {
    artifacts = item.artifacts;
  }

  let milestones = [];
  if (typeof item.milestones === 'string') {
    try { milestones = JSON.parse(item.milestones); } catch { milestones = []; }
  } else if (Array.isArray(item.milestones)) {
    milestones = item.milestones;
  }

  return {
    id: item.remediation_id || item.id,
    findingId: item.finding_public_id || item.finding_id,
    cseId: item.cse_public_id || item.cse_id,
    cseName: item.cse_name || `${item.cse_id} Operational Liaison`,
    controlRef: item.control_ref || 'CTRL-07 v3.2',
    mandateTitle: item.mandate_title || item.title || 'Supervisory Corrective Mandate',
    actionSummary: item.action_summary || 'Mandatory supervisory remediation ordered following finding adjudication.',
    owner: item.owner || 'Entity Appointed Officer',
    priority: (item.priority as any) || 'HIGH',
    dueDate: item.due_date || '14 Oct 2026',
    daysRemaining: item.days_remaining ?? 14,
    evidenceProgress: item.evidence_progress || '1/3',
    status: (item.status as any) || 'OPEN',
    artifacts,
    milestones
  };
};

export const adaptBackendVerification = (item: any): VerificationRecord => {
  let submittedArtifacts = [];
  if (typeof item.submitted_artifacts === 'string') {
    try { submittedArtifacts = JSON.parse(item.submitted_artifacts); } catch { submittedArtifacts = []; }
  } else if (Array.isArray(item.submitted_artifacts)) {
    submittedArtifacts = item.submitted_artifacts;
  }

  const gateChecklist = (item.gates || []).map((g: any) => ({
    id: g.gate_id || g.id,
    type: g.gate_type,
    label: g.label,
    verified: Boolean(g.verified),
    required: Boolean(g.required),
    evidenceRequirement: g.evidence_requirement,
    note: g.note
  }));

  return {
    id: item.verification_id || item.id,
    mandateId: item.mandate_public_id || item.remediation_id,
    findingId: item.finding_public_id || item.finding_id,
    cseId: item.cse_public_id || item.cse_id,
    cseName: item.cse_name || `${item.cse_id} Operational Liaison`,
    controlId: item.control_id || 'CTRL-07 v3.2',
    cycle: item.cycle || 'Q3 2026',
    leadExaminer: item.lead_examiner || 'NC-8802 (Lead Examiner)',
    statutoryStandard: item.statutory_standard || 'NCIIPC Framework Sec 12(a) & Rule 4.8.2',
    submittedAt: item.submitted_at || 'Recently',
    evaluatedAt: item.evaluated_at || 'Recently',
    verificationVerdict: (item.verification_verdict as any) || 'UNDER_SUPERVISORY_REVIEW',
    confidenceScore: item.confidence_score || 85,
    evidenceCompleteness: item.evidence_completeness || 80,
    merkleRootHash: item.merkle_root_hash || '0x9af8b12204cc19ef7b28a994c1e40019283746194180',
    remedialSummary: item.remedial_summary || 'Mandate requires cryptographic verification of Level 2 SOAR dispatch telemetry.',
    supervisoryRationale: item.supervisory_rationale || 'Supervisory verification gate attestation.',
    submittedArtifacts,
    gateChecklist
  };
};

export const remediationApi = {
  getAll: async (params?: { cse_id?: string; status?: string; priority?: string; search?: string }): Promise<RemediationMandate[]> => {
    const query = new URLSearchParams();
    if (params?.cse_id && params.cse_id !== 'ALL') query.set('cse_id', params.cse_id);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.priority && params.priority !== 'ALL') query.set('priority', params.priority);
    if (params?.search) query.set('search', params.search);

    const res = await apiClient.get<any[]>(`/remediation?${query.toString()}`);
    return res.data.map(adaptBackendRemediation);
  },

  getByCseId: async (cseId: string): Promise<RemediationMandate[]> => {
    const res = await apiClient.get<any[]>(`/remediation/cse/${cseId}`);
    return res.data.map(adaptBackendRemediation);
  },

  getById: async (id: string): Promise<RemediationMandate> => {
    const res = await apiClient.get<any>(`/remediation/${id}`);
    return adaptBackendRemediation(res.data);
  },

  submitArtifact: async (id: string, payload: { artifact_id: string; artifact_name?: string; sha256_hash: string }): Promise<RemediationMandate> => {
    const res = await apiClient.post<any>(`/remediation/${id}/submit`, payload);
    return adaptBackendRemediation(res.data);
  },

  verifyRemediation: async (id: string, payload: { verification_verdict: string; supervisory_rationale?: string }): Promise<RemediationMandate> => {
    const res = await apiClient.post<any>(`/remediation/${id}/verify`, payload);
    return adaptBackendRemediation(res.data);
  },

  reopenRemediation: async (id: string, payload: { reason: string; inquiry_notes?: string }): Promise<RemediationMandate> => {
    const res = await apiClient.post<any>(`/remediation/${id}/reopen`, payload);
    return adaptBackendRemediation(res.data);
  },

  // Verification Gate Endpoints
  getVerifications: async (params?: { cse_id?: string; verdict?: string }): Promise<VerificationRecord[]> => {
    const query = new URLSearchParams();
    if (params?.cse_id && params.cse_id !== 'ALL') query.set('cse_id', params.cse_id);
    if (params?.verdict && params.verdict !== 'ALL') query.set('verdict', params.verdict);

    const res = await apiClient.get<any[]>(`/verification?${query.toString()}`);
    return res.data.map(adaptBackendVerification);
  },

  getVerificationById: async (id: string): Promise<VerificationRecord> => {
    const res = await apiClient.get<any>(`/verification/${id}`);
    return adaptBackendVerification(res.data);
  },

  verifyGate: async (verificationId: string, gateId: string, verified: boolean, notes?: string): Promise<VerificationRecord> => {
    const res = await apiClient.post<any>(`/verification/${verificationId}/gates/${gateId}/verify`, { verified, notes });
    return adaptBackendVerification(res.data);
  },

  sealVerification: async (verificationId: string, rationale?: string): Promise<VerificationRecord> => {
    const res = await apiClient.post<any>(`/verification/${verificationId}/seal`, { rationale });
    return adaptBackendVerification(res.data);
  },

  reopenVerification: async (verificationId: string, reason: string, rationale?: string): Promise<VerificationRecord> => {
    const res = await apiClient.post<any>(`/verification/${verificationId}/reopen`, { reason, rationale });
    return adaptBackendVerification(res.data);
  }
};
