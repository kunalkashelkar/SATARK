import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { 
  authApi, 
  overviewApi, 
  cseApi, 
  findingApi, 
  evidenceApi, 
  remediationApi, 
  samplingApi, 
  governanceApi 
} from '@/api';
import { MockEvidenceRecord } from '@/data/mock/evidence';
import { RemediationMandate, VerificationRecord, RemediationRegression } from '@/data/mock/remediation';
import { CSEAssessment, Finding, FindingStatus, RecommendedSample, UserRole, CSESubmission } from '@/types';
import { AuditTrailItem } from '@/data/mock/audit';

interface SupervisoryContextType {
  cses: CSEAssessment[];
  findings: Finding[];
  evidence: MockEvidenceRecord[];
  submissions: CSESubmission[];
  remediations: RemediationMandate[];
  verifications: VerificationRecord[];
  regressions: RemediationRegression[];
  samples: RecommendedSample[];
  auditTrail: AuditTrailItem[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  loginWithCredentials: (username: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshAllData: () => Promise<void>;
  
  // Active selection
  activeFindingId: string;
  setActiveFindingId: (id: string) => void;
  activeCseId: string;
  setActiveCseId: (id: string) => void;

  // Actions
  updateFindingDecision: (
    findingId: string, 
    decision: { status: FindingStatus; notes?: string; reason?: string }
  ) => Promise<void>;
  requestEvidenceDemand: (findingId: string, justification: string) => Promise<void>;
  submitRemediationArtifact: (mandateId: string, artifactId: string, hash: string) => Promise<void>;
  verifyGate: (verificationId: string, gateId: string, verified: boolean) => Promise<void>;
  sealVerification: (verificationId: string) => Promise<void>;
  reopenVerification: (verificationId: string, reason: string) => Promise<void>;
  toggleSampleSelection: (sampleId: string) => Promise<void>;
  addSubmissionAndEvidence: (payload: { submission: CSESubmission; evidence: MockEvidenceRecord }) => Promise<void>;

  // Derived Metrics for Overview & Dashboards
  metrics: {
    csesAssessed: number;
    highPrioritySignals: number;
    evidenceReadiness: number;
    openFindings: number;
    openRemediation: number;
    signalDistribution: Array<{ name: string; count: number; fill: string; type: string }>;
  };
}

const SupervisoryContext = createContext<SupervisoryContextType | undefined>(undefined);

export const SupervisoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cses, setCses] = useState<CSEAssessment[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [evidence, setEvidence] = useState<MockEvidenceRecord[]>([]);
  const [submissions, setSubmissions] = useState<CSESubmission[]>([]);
  const [remediations, setRemediations] = useState<RemediationMandate[]>([]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [regressions, setRegressions] = useState<RemediationRegression[]>([]);
  const [samples, setSamples] = useState<RecommendedSample[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrailItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (sessionStorage.getItem('sat_role') as UserRole) || 'SUPERVISOR';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('sat_auth') === 'true';
  });

  const [activeFindingId, setActiveFindingId] = useState<string>('FND-0142');
  const [activeCseId, setActiveCseId] = useState<string>('CSE-014');

  // Backend Data Fetcher
  const refreshAllData = useCallback(async () => {
    if (!sessionStorage.getItem('sat_token')) {
      return;
    }
    setIsLoading(true);
    try {
      const [
        csesData,
        findingsData,
        evidenceData,
        remediationsData,
        verificationsData,
        samplesData,
        auditData
      ] = await Promise.all([
        cseApi.getAll().catch(() => []),
        findingApi.getAll().catch(() => []),
        evidenceApi.getAll().catch(() => []),
        remediationApi.getAll().catch(() => []),
        remediationApi.getVerifications().catch(() => []),
        samplingApi.getAll().catch(() => []),
        governanceApi.getAuditTrail().catch(() => [])
      ]);

      setCses(csesData);
      setFindings(findingsData);
      setEvidence(evidenceData);
      setRemediations(remediationsData);
      setVerifications(verificationsData);
      setSamples(samplesData);
      setAuditTrail(auditData);

      // Reconstruct regressions from deficient/reopened verifications and remediations
      const derivedRegressions: RemediationRegression[] = [];
      verificationsData.forEach((v: VerificationRecord) => {
        if (v.verificationVerdict === 'DEFICIENT_REOPENED') {
          derivedRegressions.push({
            id: `REG-${v.id}`,
            findingId: v.findingId,
            remediationId: v.mandateId,
            verificationId: v.id,
            cseId: v.cseId,
            cseName: v.cseName,
            controlId: v.controlId,
            priority: 'HIGH',
            reason: v.supervisoryRationale || 'Verification Gates Deficient',
            signalType: 'EXECUTION_GAP',
            status: 'ACTIVE_REGRESSION',
            reopenedDate: v.evaluatedAt || new Date().toISOString(),
            newEvidenceRecord: 'Awaiting Re-submission Telemetry',
            originalFindingSummary: v.remedialSummary,
            historyTimeline: [
              { date: v.submittedAt || new Date().toISOString(), title: 'Verification Submitted', actor: 'CSE Liaison', detail: 'Initial artifact package.' },
              { date: v.evaluatedAt || new Date().toISOString(), title: 'Verification Gate Failed', actor: v.leadExaminer, detail: v.supervisoryRationale || 'Deficient proof.' }
            ]
          });
        }
      });
      setRegressions(derivedRegressions);

    } catch (err) {
      console.error('Failed refreshing supervisory data from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount or when authenticated changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    }
  }, [isAuthenticated, refreshAllData]);

  const loginWithCredentials = async (username: string, password?: string) => {
    const res = await authApi.login(username, password);
    const role = (res.user.role as UserRole) || 'SUPERVISOR';
    sessionStorage.setItem('sat_token', res.access_token);
    sessionStorage.setItem('sat_auth', 'true');
    sessionStorage.setItem('sat_role', role);
    sessionStorage.setItem('sat_username', res.user.username);
    setUserRole(role);
    setIsAuthenticated(true);
    await refreshAllData();
  };

  const login = (role: UserRole) => {
    const username = role === 'SUPERVISOR' ? 'lead_supervisor' : 'lead_examiner';
    loginWithCredentials(username);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setIsAuthenticated(false);
    sessionStorage.removeItem('sat_token');
    sessionStorage.removeItem('sat_auth');
    sessionStorage.removeItem('sat_role');
    sessionStorage.removeItem('sat_username');
  };

  // Add evidence submission and update CSE readiness
  const addSubmissionAndEvidence = async ({ submission, evidence: newEvidence }: { submission: CSESubmission; evidence: MockEvidenceRecord }) => {
    setSubmissions(prev => [submission, ...prev]);

    try {
      await evidenceApi.ingest({
        evidence_id: newEvidence.id,
        cse_id: submission.cseId,
        category: newEvidence.recordType,
        state: 'PRESENT',
        source_system: newEvidence.source || 'PORTAL',
        events: [{
          submission_id: submission.submissionId,
          filename: submission.fileName,
          hash: newEvidence.hash
        }],
        provenance: newEvidence.provenance
      });
      await refreshAllData();
    } catch {
      setEvidence(prev => [newEvidence, ...prev]);
    }
  };

  // Update finding decision (Validate, Qualify, Reject, Override, etc.)
  const updateFindingDecision = async (
    findingId: string,
    decision: { status: FindingStatus; notes?: string; reason?: string }
  ) => {
    try {
      await findingApi.updateDecision(findingId, decision);
      await refreshAllData();
    } catch (err) {
      console.error('Error updating finding decision:', err);
      // Local optimistic update
      setFindings(prev => prev.map(f => {
        if (f.id.toLowerCase() === findingId.toLowerCase()) {
          return {
            ...f,
            status: decision.status,
            decisionNotes: decision.notes || f.decisionNotes,
            decisionReason: decision.reason || f.decisionReason,
            decidedBy: 'NC-8802 (Lead Examiner)',
            decidedAt: new Date().toISOString()
          };
        }
        return f;
      }));
    }
  };

  // Request evidence demand
  const requestEvidenceDemand = async (findingId: string, justification: string) => {
    try {
      await findingApi.evidenceDemand(findingId, {
        notes: justification,
        reason: 'STATUTORY_EVIDENCE_DEMAND_SEC_70B'
      });
      await refreshAllData();
    } catch (err) {
      console.error('Error requesting evidence demand:', err);
      updateFindingDecision(findingId, {
        status: 'UNDER_REVIEW',
        notes: justification,
        reason: 'STATUTORY_EVIDENCE_DEMAND_SEC_70B'
      });
    }
  };

  // Submit remediation evidence
  const submitRemediationArtifact = async (mandateId: string, artifactId: string, hash: string) => {
    try {
      await remediationApi.submitArtifact(mandateId, {
        artifact_id: artifactId,
        sha256_hash: hash
      });
      await refreshAllData();
    } catch (err) {
      console.error('Error submitting remediation artifact:', err);
      setRemediations(prev => prev.map(m => {
        if (m.id === mandateId) {
          const updatedArtifacts = m.artifacts.map(a => 
            a.id === artifactId ? { ...a, hash, status: 'PRESENT_VERIFIED' as const } : a
          );
          const verifiedCount = updatedArtifacts.filter(a => a.status === 'PRESENT_VERIFIED').length;
          return {
            ...m,
            artifacts: updatedArtifacts,
            evidenceProgress: `${verifiedCount}/${updatedArtifacts.length}`,
            status: 'UNDER_VERIFICATION'
          };
        }
        return m;
      }));
    }
  };

  // Verify gate in verification record
  const verifyGate = async (verificationId: string, gateId: string, verified: boolean) => {
    try {
      await remediationApi.verifyGate(verificationId, gateId, verified);
      await refreshAllData();
    } catch (err) {
      console.error('Error verifying gate:', err);
      setVerifications(prev => prev.map(v => {
        if (v.id === verificationId) {
          const updatedChecklist = v.gateChecklist.map(g => 
            g.id === gateId ? { ...g, verified } : g
          );
          const allRequiredVerified = updatedChecklist.filter(g => g.required).every(g => g.verified);
          return {
            ...v,
            gateChecklist: updatedChecklist,
            verificationVerdict: allRequiredVerified ? 'UNDER_SUPERVISORY_REVIEW' : 'EVIDENCE_LOCKED'
          };
        }
        return v;
      }));
    }
  };

  // Seal verification and close remediation
  const sealVerification = async (verificationId: string) => {
    try {
      await remediationApi.sealVerification(verificationId, 'All required supervisory verification gates verified and sealed by Lead Examiner.');
      await refreshAllData();
    } catch (err) {
      console.error('Error sealing verification:', err);
      setVerifications(prev => prev.map(v => {
        if (v.id === verificationId) {
          return {
            ...v,
            verificationVerdict: 'VERIFIED_SEALED',
            supervisoryRationale: 'All required supervisory verification gates verified and sealed by Lead Examiner NC-8802.'
          };
        }
        return v;
      }));
    }
  };

  // Reopen verification when deficient proof or regression occurs
  const reopenVerification = async (verificationId: string, reason: string) => {
    try {
      await remediationApi.reopenVerification(verificationId, reason, reason);
      await refreshAllData();
    } catch (err) {
      console.error('Error reopening verification:', err);
      setVerifications(prev => prev.map(v => {
        if (v.id === verificationId) {
          return {
            ...v,
            verificationVerdict: 'DEFICIENT_REOPENED',
            supervisoryRationale: reason
          };
        }
        return v;
      }));
    }
  };

  // Toggle sample selection
  const toggleSampleSelection = async (sampleId: string) => {
    try {
      await samplingApi.toggleItem(sampleId);
      await refreshAllData();
    } catch (err) {
      console.error('Error toggling sample selection:', err);
      setSamples(prev => prev.map(s => {
        if (s.id === sampleId) {
          const nextSelected = !s.selected;
          return {
            ...s,
            selected: nextSelected,
            status: nextSelected ? 'SELECTED' : 'RECOMMENDED'
          };
        }
        return s;
      }));
    }
  };

  // Derived metrics calculated dynamically from real backend data
  const metrics = useMemo(() => {
    const csesAssessed = cses.length;
    const highPrioritySignals = findings.filter(f => f.priority === 'CRITICAL' || f.priority === 'HIGH').length;
    const evidenceReadiness = cses.length ? Math.round(cses.reduce((acc, c) => acc + (c.evidenceReadiness || 0), 0) / cses.length) : 0;
    const openFindings = findings.filter(f => f.status === 'UNDER_REVIEW' || f.status === 'CANDIDATE').length;
    const openRemediation = remediations.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS' || r.status === 'UNDER_VERIFICATION').length;

    const signalDistribution = [
      { name: 'Execution Gap', count: findings.filter(f => f.signalType === 'EXECUTION_GAP').length || 1, fill: '#ef4444', type: 'EXECUTION_GAP' },
      { name: 'Negative Space', count: findings.filter(f => f.signalType === 'NEGATIVE_SPACE').length || 1, fill: '#ffb693', type: 'NEGATIVE_SPACE' },
      { name: 'Process Dev', count: findings.filter(f => f.signalType === 'PROCESS_DEVIATION').length || 1, fill: '#eab308', type: 'PROCESS_DEVIATION' },
      { name: 'Behavioural', count: findings.filter(f => f.signalType === 'BEHAVIOURAL').length || 1, fill: '#8b5cf6', type: 'BEHAVIOURAL' },
      { name: 'Historical', count: findings.filter(f => f.signalType === 'HISTORICAL_RECURRENCE').length || 1, fill: '#ec4899', type: 'HISTORICAL_RECURRENCE' },
      { name: 'Consistency', count: findings.filter(f => f.signalType === 'CROSS_SOURCE_CONSISTENCY').length || 1, fill: '#7bdb80', type: 'CROSS_SOURCE_CONSISTENCY' },
      { name: 'Coverage', count: findings.filter(f => f.signalType === 'COVERAGE_GAP').length || 1, fill: '#10b981', type: 'COVERAGE_GAP' }
    ];

    return {
      csesAssessed,
      highPrioritySignals,
      evidenceReadiness,
      openFindings,
      openRemediation,
      signalDistribution
    };
  }, [cses, findings, remediations]);

  return (
    <SupervisoryContext.Provider
      value={{
        cses,
        findings,
        evidence,
        submissions,
        remediations,
        verifications,
        regressions,
        samples,
        auditTrail,
        userRole,
        setUserRole,
        isAuthenticated,
        login,
        loginWithCredentials,
        logout,
        isLoading,
        refreshAllData,
        activeFindingId,
        setActiveFindingId,
        activeCseId,
        setActiveCseId,
        updateFindingDecision,
        requestEvidenceDemand,
        submitRemediationArtifact,
        verifyGate,
        sealVerification,
        reopenVerification,
        toggleSampleSelection,
        addSubmissionAndEvidence,
        metrics
      }}
    >
      {children}
    </SupervisoryContext.Provider>
  );
};

export const useSupervisory = () => {
  const context = useContext(SupervisoryContext);
  if (!context) {
    throw new Error('useSupervisory must be used within a SupervisoryProvider');
  }
  return context;
};
