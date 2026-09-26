import { RemediationStatus, Priority } from './common';

export interface RemediationItem {
  id: string;
  findingId: string;
  cseId: string;
  cseName: string;
  controlId: string;
  title: string;
  requiredAction: string;
  cseResponse: string;
  evidenceSubmittedCount: number;
  processRecordsCount: number;
  status: RemediationStatus;
  priority: Priority;
  assignedExaminer: string;
  deadline: string;
  lastUpdated: string;
  verificationNotes?: string;
  verifiedAt?: string;
}
