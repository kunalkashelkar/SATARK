import { EvidenceStatus } from './common';

export interface EvidenceRecord {
  id: string;
  evidenceId?: string;
  cseId: string;
  caseId: string;
  submissionId?: string;
  recordType: 'ALERT' | 'CASE' | 'INVESTIGATION' | 'ACTION' | 'EVIDENCE' | 'ESCALATION' | 'RESPONSE' | 'CLOSURE' | 'ASSET' | 'EXCEPTION' | 'REMEDIATION';
  category?: string;
  title: string;
  sourceSystem: string;
  source?: string;
  status: EvidenceStatus;
  timestamp: string;
  hash: string;
  integrity?: string;
  metadata?: Record<string, any>;
  provenance?: {
    sha256: string;
    collectorVersion: string;
    enclaveTimestamp: string;
    custodyChain: string[];
    schemaVersion: string;
  };
}
