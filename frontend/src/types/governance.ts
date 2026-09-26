export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  targetId: string;
  targetType: string;
  result: 'SUCCESS' | 'QUALIFIED' | 'REJECTED';
  controlVersion: string;
  ruleVersion: string;
  evidenceRef: string;
}

export interface AdminSystemHealth {
  deploymentMode: 'AIR_GAPPED_OFFLINE';
  internalPkiStatus: 'VALID';
  storageUsedGb: number;
  totalStorageGb: number;
  activeExaminers: number;
  rulesLoaded: number;
}
