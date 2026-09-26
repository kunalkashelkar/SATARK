import { Priority, FindingStatus, SignalType } from './common';

export interface Finding {
  id: string;
  cseId: string;
  cseName: string;
  controlId: string;
  controlName: string;
  title: string;
  whyFlagged: string;
  signalType: SignalType;
  priority: Priority;
  evidenceStrength: 'HIGH' | 'MEDIUM' | 'LOW';
  completeness: number; // percentage
  uncertainty: 'LOW' | 'MEDIUM' | 'HIGH';
  status: FindingStatus;
  
  // Expected vs Observed reasoning chain
  expectedState: string;
  observedState: string;
  gapSummary: string;
  
  supportingSignals: {
    type: SignalType;
    label: string;
    description: string;
  }[];
  
  timeline: {
    time: string;
    event: string;
    type: 'alert' | 'case' | 'investigation' | 'action' | 'escalation' | 'response' | 'closure' | 'gap';
    isGap?: boolean;
    description?: string;
  }[];
  
  sourceEvidence: {
    recordId: string;
    recordType: string;
    title: string;
    timestamp: string;
  }[];
  
  provenance: {
    sha256: string;
    submissionId: string;
    sourceSystem: string;
    assessmentPeriod: string;
    controlVersion: string;
    ruleVersion: string;
    analyticsEngineVersion: string;
  };

  decisionNotes?: string;
  decisionReason?: string;
  decidedBy?: string;
  decidedAt?: string;
}
