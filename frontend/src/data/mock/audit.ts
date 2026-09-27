export interface AuditTrailItem {
  id: string;
  timestamp: string;
  actor: string;
  actorDetail: string;
  actorRole: string;
  actorType: 'HUMAN' | 'SYSTEM';
  action: string;
  targetObject: string;
  previousState: string;
  newState: string;
  result: 'SUCCESS' | 'FAILED' | 'QUALIFIED' | 'REJECTED';
  reason: string;
  linkedObject: string;
  controlVersion?: string;
  ruleVersion?: string;
  evidenceRef?: string;
}

export const mockAuditTrail: AuditTrailItem[] = [
  {
    id: 'AUD-2026-004829',
    timestamp: '26 Sep 14:40:12',
    actor: 'NCIIPC Examiner',
    actorDetail: 'NC-8802 (Lead Examiner)',
    actorRole: 'Examiner / Regulatory Officer',
    actorType: 'HUMAN',
    action: 'Verification Gate Checked',
    targetObject: 'REM-0038',
    previousState: 'OPEN',
    newState: 'UNDER_SUPERVISORY_REVIEW',
    result: 'SUCCESS',
    reason: 'Human verification gate held: Checklist 2/5 verified, awaiting ESC-221 raw payload',
    linkedObject: 'FND-0142',
    controlVersion: 'CTRL-07 v3.2',
    ruleVersion: 'R-2.4',
    evidenceRef: 'EVD-742, EVD-761'
  },
  {
    id: 'AUD-2026-004828',
    timestamp: '26 Sep 14:22:00',
    actor: 'NC-8802 (Examiner)',
    actorDetail: 'NCIIPC Delhi Enclave',
    actorRole: 'Lead Examiner',
    actorType: 'HUMAN',
    action: 'Adjudication Note Committed',
    targetObject: 'FND-0142',
    previousState: 'CANDIDATE',
    newState: 'UNDER_REVIEW',
    result: 'SUCCESS',
    reason: 'Statutory directive issued demanding Tier-2 escalation telemetry under Section 70B',
    linkedObject: 'CSE-014',
    controlVersion: 'CTRL-07 v3.2',
    ruleVersion: 'R-2.4',
    evidenceRef: 'EVD-742'
  },
  {
    id: 'AUD-2026-004825',
    timestamp: '26 Sep 14:18:02',
    actor: 'Air-Gap Ingest Core',
    actorDetail: 'DELHI-AIRGAP-01',
    actorRole: 'Automated Core FIPS Daemon',
    actorType: 'SYSTEM',
    action: 'Finding Synthesized',
    targetObject: 'FND-0142',
    previousState: 'RAW_STREAM',
    newState: 'CANDIDATE',
    result: 'SUCCESS',
    reason: 'Correlated GAP-0071 (Missing Escalation) + NS-0041 (Log Stream Void)',
    linkedObject: 'CSE-014',
    controlVersion: 'CTRL-07 v3.2',
    ruleVersion: 'R-2.4',
    evidenceRef: 'SUB-2026-0814-CSE014'
  },
  {
    id: 'AUD-2026-004820',
    timestamp: '24 Sep 11:00:00',
    actor: 'Lead Examiner NC-8802',
    actorDetail: 'NCIIPC Core',
    actorRole: 'Lead Examiner',
    actorType: 'HUMAN',
    action: 'Decision Validated',
    targetObject: 'FND-0131',
    previousState: 'UNDER_REVIEW',
    newState: 'VALIDATED',
    result: 'SUCCESS',
    reason: 'Confirmed root console access occurred without mandatory FIDO2 hardware challenge',
    linkedObject: 'CSE-007',
    controlVersion: 'CTRL-04 v2.4',
    ruleVersion: 'R-2.4',
    evidenceRef: 'EVD-881'
  }
];
