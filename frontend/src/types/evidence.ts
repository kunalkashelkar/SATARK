import { EvidenceStatus } from './common';

export interface EvidenceRecord {
  id: string;
  cseId: string;
  caseId: string;
  recordType: 'ALERT' | 'CASE' | 'INVESTIGATION' | 'ACTION' | 'EVIDENCE' | 'ESCALATION' | 'RESPONSE' | 'CLOSURE' | 'ASSET' | 'EXCEPTION';
  title: string;
  sourceSystem: string;
  status: EvidenceStatus;
  timestamp: string;
  hash: string;
  metadata: Record<string, any>;
}
