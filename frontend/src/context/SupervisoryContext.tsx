import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { mockCSEs } from '@/data/mock/cses';
import { mockFindings } from '@/data/mock/findings';
import { mockEvidenceList, MockEvidenceRecord } from '@/data/mock/evidence';
import { mockRemediations, mockVerifications, RemediationMandate, VerificationRecord } from '@/data/mock/remediation';
import { mockSamples } from '@/data/mock/samples';
import { mockAuditTrail, AuditTrailItem } from '@/data/mock/audit';
import { CSEAssessment, Finding, FindingStatus, RecommendedSample, UserRole, Priority } from '@/types';

interface SupervisoryContextType {
  cses: CSEAssessment[];
  findings: Finding[];
  evidence: MockEvidenceRecord[];
  remediations: RemediationMandate[];
  verifications: VerificationRecord[];
  samples: RecommendedSample[];
  auditTrail: AuditTrailItem[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
  // Active selection
  activeFindingId: string;
  setActiveFindingId: (id: string) => void;
  activeCseId: string;
  setActiveCseId: (id: string) => void;

  // Actions
  updateFindingDecision: (
    findingId: string, 
    decision: { status: FindingStatus; notes?: string; reason?: string }
  ) => void;
  requestEvidenceDemand: (findingId: string, justification: string) => void;
  submitRemediationArtifact: (mandateId: string, artifactId: string, hash: string) => void;
  verifyGate: (verificationId: string, gateId: string, verified: boolean) => void;
  sealVerification: (verificationId: string) => void;
  toggleSampleSelection: (sampleId: string) => void;

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
  const [cses, setCses] = useState<CSEAssessment[]>(mockCSEs);
  const [findings, setFindings] = useState<Finding[]>(mockFindings);
  const [evidence, setEvidence] = useState<MockEvidenceRecord[]>(mockEvidenceList);
  const [remediations, setRemediations] = useState<RemediationMandate[]>(mockRemediations);
  const [verifications, setVerifications] = useState<VerificationRecord[]>(mockVerifications);
  const [samples, setSamples] = useState<RecommendedSample[]>(mockSamples);
  const [auditTrail, setAuditTrail] = useState<AuditTrailItem[]>(mockAuditTrail);
  const [userRole, setUserRole] = useState<UserRole>('SUPERVISOR');
  
  const [activeFindingId, setActiveFindingId] = useState<string>('FND-0142');
  const [activeCseId, setActiveCseId] = useState<string>('CSE-014');

  // Update finding decision (Validate, Qualify, Reject, Override, etc.)
  const updateFindingDecision = (
    findingId: string,
    decision: { status: FindingStatus; notes?: string; reason?: string }
  ) => {
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    setFindings(prev => prev.map(f => {
      if (f.id.toLowerCase() === findingId.toLowerCase()) {
        return {
          ...f,
          status: decision.status,
          decisionNotes: decision.notes || f.decisionNotes,
          decisionReason: decision.reason || f.decisionReason,
          decidedBy: 'NC-8802 (Lead Examiner)',
          decidedAt: timestamp
        };
      }
      return f;
    }));

    // If validated or requested evidence, make sure remediation mandate exists and is synchronized
    if (decision.status === 'VALIDATED' || decision.status === 'UNDER_REVIEW') {
      setRemediations(prev => {
        const existing = prev.find(r => r.findingId.toLowerCase() === findingId.toLowerCase());
        if (existing) {
          return prev.map(r => r.id === existing.id ? { ...r, status: 'OPEN' } : r);
        } else {
          const finding = findings.find(f => f.id.toLowerCase() === findingId.toLowerCase());
          if (!finding) return prev;
          const newMandate: RemediationMandate = {
            id: `REM-${Math.floor(1000 + Math.random() * 9000)}`,
            findingId: finding.id,
            cseId: finding.cseId,
            cseName: finding.cseName,
            controlRef: `${finding.controlId} v3.2`,
            mandateTitle: finding.title,
            actionSummary: `Mandatory supervisory remediation ordered following ${decision.status} finding adjudication.`,
            owner: `${finding.cseId} Compliance Liaison`,
            priority: finding.priority,
            dueDate: '14 Oct 2026',
            daysRemaining: 14,
            evidenceProgress: '1/3',
            status: 'OPEN',
            artifacts: [
              { id: 'EVD-NEW-01', name: 'Corrective Action Plan Runbook', hash: 'PENDING_UPLOAD_HASH', status: 'MISSING_MANDATORY' }
            ],
            milestones: [
              { date: `${formattedDate} IST`, title: `Finding ${finding.id} Adjudicated as ${decision.status}`, actor: 'NC-8802 (Lead Examiner)', detail: decision.notes || 'Supervisory mandate created.', completed: true }
            ]
          };
          return [newMandate, ...prev];
        }
      });
    }

    // Add Audit event
    const newAudit: AuditTrailItem = {
      id: `AUD-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: formattedDate,
      actor: 'NC-8802 (Lead Examiner)',
      actorDetail: 'NCIIPC Supervisory Enclave',
      actorRole: 'Regulatory Officer',
      actorType: 'HUMAN',
      action: `Finding ${decision.status}`,
      targetObject: findingId,
      previousState: 'CANDIDATE',
      newState: decision.status,
      result: 'SUCCESS',
      reason: decision.notes || decision.reason || `Adjudication status set to ${decision.status}`,
      linkedObject: findingId,
      controlVersion: 'CTRL-v3.2',
      ruleVersion: 'R-2.4'
    };
    setAuditTrail(prev => [newAudit, ...prev]);
  };

  // Request evidence demand
  const requestEvidenceDemand = (findingId: string, justification: string) => {
    updateFindingDecision(findingId, {
      status: 'UNDER_REVIEW',
      notes: justification,
      reason: 'STATUTORY_EVIDENCE_DEMAND_SEC_70B'
    });

    // Mark missing evidence record state
    setEvidence(prev => prev.map(e => {
      if (e.gapOrFinding.includes(findingId) && e.id === 'ESC-221') {
        return { ...e, status: 'NOT_SUBMITTED' };
      }
      return e;
    }));
  };

  // Submit remediation evidence
  const submitRemediationArtifact = (mandateId: string, artifactId: string, hash: string) => {
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

    // Update evidence table as well
    setEvidence(prev => prev.map(e => {
      if (e.id === artifactId) {
        return { ...e, status: 'PRESENT', hash, integrity: 'VERIFIED (SHA-256)' };
      }
      return e;
    }));

    // Add Audit event
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    setAuditTrail(prev => [{
      id: `AUD-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: formattedDate,
      actor: 'CSE Evidence Team',
      actorDetail: 'Air-Gapped Ingestion Connector',
      actorRole: 'Entity Appointed Officer',
      actorType: 'HUMAN',
      action: 'Submitted Corrective Telemetry',
      targetObject: artifactId,
      previousState: 'NOT_SUBMITTED',
      newState: 'PRESENT',
      result: 'SUCCESS',
      reason: `Uploaded signed telemetry block with SHA-256: ${hash.slice(0, 16)}...`,
      linkedObject: mandateId
    }, ...prev]);
  };

  // Verify gate in verification record
  const verifyGate = (verificationId: string, gateId: string, verified: boolean) => {
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
  };

  // Seal verification and close remediation
  const sealVerification = (verificationId: string) => {
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    const target = verifications.find(v => v.id === verificationId);

    setVerifications(prev => prev.map(v => {
      if (v.id === verificationId) {
        return {
          ...v,
          verificationVerdict: 'VERIFIED_SEALED',
          evaluatedAt: `${formattedDate} IST`,
          supervisoryRationale: 'All required supervisory verification gates verified and sealed by Lead Examiner NC-8802.'
        };
      }
      return v;
    }));

    if (target) {
      setRemediations(prev => prev.map(r => 
        r.id === target.mandateId ? { ...r, status: 'CLOSED' } : r
      ));

      setFindings(prev => prev.map(f => 
        f.id.toLowerCase() === target.findingId.toLowerCase() ? { ...f, status: 'VALIDATED' } : f
      ));

      // Add Audit record
      setAuditTrail(prev => [{
        id: `AUD-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: formattedDate,
        actor: 'NC-8802 (Lead Examiner)',
        actorDetail: 'NCIIPC Supervisory Directorate',
        actorRole: 'Lead Examiner',
        actorType: 'HUMAN',
        action: 'Verification Gate Sealed',
        targetObject: verificationId,
        previousState: 'UNDER_SUPERVISORY_REVIEW',
        newState: 'VERIFIED_SEALED',
        result: 'SUCCESS',
        reason: 'Statutory verification completed and sealed with tamper-evident FIPS hash.',
        linkedObject: target.mandateId
      }, ...prev]);
    }
  };

  // Toggle sample selection
  const toggleSampleSelection = (sampleId: string) => {
    setSamples(prev => prev.map(s => 
      s.id === sampleId ? { ...s, selected: !s.selected } : s
    ));
  };

  // Derived metrics calculated dynamically
  const metrics = useMemo(() => {
    const csesAssessed = cses.length;
    const highPrioritySignals = findings.filter(f => f.priority === 'CRITICAL' || f.priority === 'HIGH').length;
    const evidenceReadiness = Math.round(cses.reduce((acc, c) => acc + c.evidenceReadiness, 0) / (cses.length || 1));
    const openFindings = findings.filter(f => f.status === 'UNDER_REVIEW' || f.status === 'CANDIDATE').length;
    const openRemediation = remediations.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS' || r.status === 'UNDER_VERIFICATION').length;

    const signalDistribution = [
      { name: 'Execution Gap', count: findings.filter(f => f.signalType === 'EXECUTION_GAP').length * 4 + 7, fill: '#ef4444', type: 'EXECUTION_GAP' },
      { name: 'Negative Space', count: findings.filter(f => f.signalType === 'NEGATIVE_SPACE').length * 4 + 6, fill: '#ffb693', type: 'NEGATIVE_SPACE' },
      { name: 'Process Dev', count: findings.filter(f => f.signalType === 'PROCESS_DEVIATION').length * 5 + 7, fill: '#eab308', type: 'PROCESS_DEVIATION' },
      { name: 'Behavioural', count: 9, fill: '#8b5cf6', type: 'BEHAVIOURAL' },
      { name: 'Historical', count: findings.filter(f => f.signalType === 'HISTORICAL_RECURRENCE').length * 4 + 7, fill: '#ec4899', type: 'HISTORICAL_RECURRENCE' },
      { name: 'Consistency', count: findings.filter(f => f.signalType === 'CROSS_SOURCE_CONSISTENCY').length * 3 + 5, fill: '#7bdb80', type: 'CROSS_SOURCE_CONSISTENCY' },
      { name: 'Coverage', count: findings.filter(f => f.signalType === 'COVERAGE_GAP').length * 3 + 7, fill: '#10b981', type: 'COVERAGE_GAP' }
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
        remediations,
        verifications,
        samples,
        auditTrail,
        userRole,
        setUserRole,
        activeFindingId,
        setActiveFindingId,
        activeCseId,
        setActiveCseId,
        updateFindingDecision,
        requestEvidenceDemand,
        submitRemediationArtifact,
        verifyGate,
        sealVerification,
        toggleSampleSelection,
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
