import React, { useState } from 'react';
import {
  Shield,
  Users,
  Key,
  Database,
  Lock,
  Cpu,
  Activity,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowRight,
  ExternalLink,
  Layers,
  FileText,
  UserCheck,
  UserX,
  X,
  Clock,
  Terminal,
  Server,
  HardDrive
} from 'lucide-react';

interface SystemUser {
  id: string;
  name: string;
  badge: string;
  email: string;
  role: 'SUPER_ADMIN' | 'LEAD_EXAMINER' | 'EXAMINER' | 'SUPERVISOR' | 'AUDITOR' | 'CSE_LIAISON';
  org: string;
  cseScope: string[];
  mfa: 'FIPS-140-2 L3 Smartcard' | 'Hardware Security Key' | 'Gateway Token';
  status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING';
  lastActive: string;
  permissions: string[];
}

const SYSTEM_USERS: SystemUser[] = [
  {
    id: 'USR-001',
    name: 'Dr. Vikram Malhotra',
    badge: 'DIR-0012',
    email: 'v.malhotra@nciipc.gov.in',
    role: 'SUPER_ADMIN',
    org: 'NCIIPC HQ - Directorate',
    cseScope: ['ALL_ENTITIES'],
    mfa: 'FIPS-140-2 L3 Smartcard',
    status: 'ACTIVE',
    lastActive: '3 mins ago (Console 01)',
    permissions: ['SYSTEM_ROOT', 'USER_PROVISION', 'POLICY_OVERRIDE', 'ENCLAVE_SIGN', 'AUDIT_EXPORT']
  },
  {
    id: 'USR-104',
    name: 'Sarah Jenkins',
    badge: 'NC-8802',
    email: 's.jenkins@nciipc.gov.in',
    role: 'LEAD_EXAMINER',
    org: 'NCIIPC Supervisory Division - Energy & Finance',
    cseScope: ['CSE-014', 'CSE-021', 'CSE-033'],
    mfa: 'FIPS-140-2 L3 Smartcard',
    status: 'ACTIVE',
    lastActive: 'Just now (Workstation EX-04)',
    permissions: ['ASSESSMENT_WRITE', 'FINDING_PROMOTE', 'SIGNAL_OVERRIDE', 'REMEDIATION_CLOSE', 'SAMPLING_EXECUTE']
  },
  {
    id: 'USR-117',
    name: 'Amitabh Sharma',
    badge: 'NC-8915',
    email: 'a.sharma@nciipc.gov.in',
    role: 'EXAMINER',
    org: 'NCIIPC Supervisory Division - Telecom & Transport',
    cseScope: ['CSE-014', 'CSE-045'],
    mfa: 'Hardware Security Key',
    status: 'ACTIVE',
    lastActive: '14 mins ago (Workstation EX-09)',
    permissions: ['ASSESSMENT_READ', 'SIGNAL_ANNOTATE', 'EVIDENCE_VERIFY', 'SAMPLING_REVIEW']
  },
  {
    id: 'USR-109',
    name: 'Priya Sundaram',
    badge: 'NC-9104',
    email: 'p.sundaram@nciipc.gov.in',
    role: 'SUPERVISOR',
    org: 'Supervisory Review Board',
    cseScope: ['ALL_ENTITIES'],
    mfa: 'FIPS-140-2 L3 Smartcard',
    status: 'ACTIVE',
    lastActive: '42 mins ago (Workstation SR-02)',
    permissions: ['ASSESSMENT_SIGN_OFF', 'FINDING_RATIFY', 'INJUNCTION_APPROVE', 'AUDIT_READ']
  },
  {
    id: 'USR-204',
    name: 'Devin Vance',
    badge: 'AUD-3301',
    email: 'd.vance@gov-audit.internal',
    role: 'AUDITOR',
    org: 'CAG Independent Oversight Enclave',
    cseScope: ['ALL_ENTITIES (READ-ONLY)'],
    mfa: 'Hardware Security Key',
    status: 'ACTIVE',
    lastActive: '2 hours ago (Audit Pod 03)',
    permissions: ['AUDIT_INSPECT', 'LEDGER_VERIFY', 'HASH_SEAL_VALIDATE', 'CHAIN_CUSTODY_EXPORT']
  },
  {
    id: 'USR-219',
    name: 'Rajesh K. Verma',
    badge: 'LIA-014-A',
    email: 'r.verma@nationalpower.gov.in',
    role: 'CSE_LIAISON',
    org: 'PowerGrid Critical Infra (CSE-014)',
    cseScope: ['CSE-014'],
    mfa: 'Gateway Token',
    status: 'ACTIVE',
    lastActive: '5 hours ago (Gateway-014)',
    permissions: ['REMEDIATION_SUBMIT', 'EVIDENCE_UPLOAD', 'FINDING_VIEW_ASSIGNED']
  }
];

const ADMIN_AUDIT_LOG = [
  {
    id: 'ADM-2026-0819',
    timestamp: '2026-09-27 02:18:04 UTC',
    actor: 'Dr. Vikram Malhotra (USR-001)',
    action: 'POLICY_SCHEMA_UPDATE',
    target: 'NCIIPC-CSF Schema v3.2 [CTRL-07 Refinement]',
    result: 'COMMITTED (Merkle Root 9b4e..)',
    severity: 'INFO'
  },
  {
    id: 'ADM-2026-0818',
    timestamp: '2026-09-26 19:44:12 UTC',
    actor: 'Dr. Vikram Malhotra (USR-001)',
    action: 'SCOPE_GRANT',
    target: 'USR-104 (Sarah Jenkins) granted CSE-033 scope',
    result: 'ACTIVE (Dual-Auth Approved)',
    severity: 'INFO'
  },
  {
    id: 'ADM-2026-0817',
    timestamp: '2026-09-26 14:10:55 UTC',
    actor: 'System Overseer (DAEMON)',
    action: 'AIRGAP_HASH_INTEGRITY_CHECK',
    target: 'Cryptographic Ledger Volume /var/log/sat-audit',
    result: 'VERIFIED (1,842 blocks zero drift)',
    severity: 'SUCCESS'
  },
  {
    id: 'ADM-2026-0816',
    timestamp: '2026-09-25 11:22:30 UTC',
    actor: 'Dr. Vikram Malhotra (USR-001)',
    action: 'OFFLINE_MODEL_REGISTRATION',
    target: 'PM4Py Conformance Engine (v2.3.1-airgap)',
    result: 'STAGED (SHA256 verified)',
    severity: 'INFO'
  }
];

export const AdministrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES' | 'SCOPES' | 'CONTROLS' | 'MODELS' | 'ENCLAVE'>('USERS');
  const [selectedUser, setSelectedUser] = useState<SystemUser>(SYSTEM_USERS[1]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    badge: '',
    email: '',
    role: 'EXAMINER' as SystemUser['role'],
    org: 'NCIIPC Supervisory Division',
    cseScope: 'CSE-014',
    mfa: 'FIPS-140-2 L3 Smartcard' as SystemUser['mfa']
  });

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    triggerNotification(`Air-gapped credential generated for ${newUser.name} (${newUser.badge}). Provisioning dispatch queued.`);
    setShowCreateModal(false);
  };

  const filteredUsers = SYSTEM_USERS.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner: Air-Gapped Institutional Governance Enclave */}
      <div className="bg-[#181c22] border border-[#2a3038] rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#afc6ff]/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#afc6ff]/10 border border-[#afc6ff]/30 flex items-center justify-center text-[#afc6ff]">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                  SAT-SA System Administration & Governance
                </h1>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[#7bdb80]/15 text-[#7bdb80] border border-[#7bdb80]/30">
                  ENCLAVE ISOLATED
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[#afc6ff]/15 text-[#afc6ff] border border-[#afc6ff]/30">
                  NCIIPC SEC-09 HARDENED
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Root administration of cryptographic identities, supervisory scopes, offline model registries, and NCIIPC-CSF framework rule schemas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerNotification('Running cryptographic identity verification on all 24 registered keys...')}
              className="px-3.5 py-2 rounded-lg bg-[#20252d] hover:bg-[#262c36] text-slate-200 border border-[#343c48] text-xs font-mono flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              Verify Enclave Keys
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-lg bg-[#afc6ff] hover:bg-[#c2d5ff] text-[#041d40] text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-md shadow-[#afc6ff]/20"
            >
              <Plus className="w-4 h-4" />
              Provision Identity
            </button>
          </div>
        </div>

        {notification && (
          <div className="mt-4 p-3 rounded-lg bg-[#7bdb80]/15 border border-[#7bdb80]/40 text-[#7bdb80] text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* 8-KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Active Users', value: '24', icon: Users, color: 'text-white' },
          { label: 'Administrators', value: '3', icon: Key, color: 'text-[#afc6ff]' },
          { label: 'Lead Examiners', value: '8', icon: Shield, color: 'text-[#7bdb80]' },
          { label: 'Supervisors', value: '5', icon: UserCheck, color: 'text-[#afc6ff]' },
          { label: 'CSE Scopes', value: '8 Entities', icon: Database, color: 'text-white' },
          { label: 'Active Controls', value: '20 CSF', icon: FileCheck, color: 'text-[#ffb693]' },
          { label: 'Ruleset Version', value: 'R-2.4', icon: Layers, color: 'text-slate-300' },
          { label: 'Model Engine', value: 'AN-1.8 (Off)', icon: Cpu, color: 'text-[#7bdb80]' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[#181c22] border border-[#2a3038] rounded-lg p-3 hover:border-[#384250] transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className={`text-base font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2a3038] pb-1 overflow-x-auto">
        {[
          { id: 'USERS', label: 'Identity & Access (24 Users)', icon: Users },
          { id: 'ROLES', label: 'Role Permissions (6 Defined)', icon: Lock },
          { id: 'SCOPES', label: 'CSE Authorization Scopes', icon: Database },
          { id: 'CONTROLS', label: 'Control Framework Schemas (20)', icon: FileCheck },
          { id: 'MODELS', label: 'Offline Model Registry', icon: Cpu },
          { id: 'ENCLAVE', label: 'Enclave Security & HSM', icon: HardDrive }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-mono flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#181c22] text-[#afc6ff] border-t-2 border-l border-r border-[#afc6ff] border-b-transparent font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181c22]/50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: USERS (Main Admin Surface) */}
      {activeTab === 'USERS' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Table Panel: User Directory (7 cols) */}
          <div className="xl:col-span-7 space-y-4">
            <div className="bg-[#181c22] border border-[#2a3038] rounded-xl p-4 shadow-xl space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search name, badge, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#12161b] border border-[#2e3642] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#afc6ff] font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-[#12161b] border border-[#2e3642] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-[#afc6ff]"
                  >
                    <option value="ALL">All Roles (24)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (3)</option>
                    <option value="LEAD_EXAMINER">LEAD_EXAMINER (8)</option>
                    <option value="EXAMINER">EXAMINER (6)</option>
                    <option value="SUPERVISOR">SUPERVISOR (5)</option>
                    <option value="AUDITOR">AUDITOR (1)</option>
                    <option value="CSE_LIAISON">CSE_LIAISON (1)</option>
                  </select>
                </div>
              </div>

              {/* Dense User Table */}
              <div className="overflow-x-auto rounded-lg border border-[#262c35]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#12161b] text-slate-400 border-b border-[#262c35]">
                    <tr>
                      <th className="py-2.5 px-3">Identity / Badge</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">CSE Scope</th>
                      <th className="py-2.5 px-3">MFA Method</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202630]">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUser.id === user.id;
                      return (
                        <tr
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#afc6ff]/10 text-white' : 'hover:bg-[#1a1f26] text-slate-300'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {user.name}
                              {user.role === 'SUPER_ADMIN' && <Key className="w-3 h-3 text-[#ffb693]" />}
                            </div>
                            <div className="text-[11px] text-slate-400">{user.badge} • {user.email}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              user.role === 'SUPER_ADMIN' ? 'bg-[#ffb693]/15 text-[#ffb693] border-[#ffb693]/30' :
                              user.role === 'LEAD_EXAMINER' ? 'bg-[#afc6ff]/15 text-[#afc6ff] border-[#afc6ff]/30' :
                              user.role === 'SUPERVISOR' ? 'bg-[#7bdb80]/15 text-[#7bdb80] border-[#7bdb80]/30' :
                              user.role === 'AUDITOR' ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' :
                              'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {user.cseScope.map((s, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-[#222832] text-slate-300 border border-[#2f3744]">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[11px]">
                            {user.mfa}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-[10px] text-[#afc6ff] hover:underline flex items-center justify-end gap-1">
                              Inspect <ArrowRight className="w-3 h-3" />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Admin Audit Trail Preview */}
            <div className="bg-[#181c22] border border-[#2a3038] rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#afc6ff]" />
                  <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                    Recent Administrative Change Records
                  </h3>
                </div>
                <a href="#/governance/audit" className="text-[11px] font-mono text-[#afc6ff] hover:underline flex items-center gap-1">
                  View Full Cryptographic Audit Log <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-2">
                {ADMIN_AUDIT_LOG.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-[#12161b] border border-[#262c35] text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#222832] text-slate-400 border border-[#2e3744]">{log.id}</span>
                      <span className="text-white font-semibold">{log.action}</span>
                      <span className="text-slate-400 truncate max-w-xs">{log.target}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span>{log.actor}</span>
                      <span className="text-[#7bdb80]">{log.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Selected User Dossier & Authorization Inspector (5 cols) */}
          <div className="xl:col-span-5 space-y-4">
            <div className="bg-[#181c22] border border-[#2a3038] rounded-xl p-5 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#2a3038] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#afc6ff]/20 border border-[#afc6ff]/40 flex items-center justify-center text-[#afc6ff] font-bold font-mono">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white font-mono">{selectedUser.name}</h2>
                    <p className="text-xs text-slate-400 font-mono">{selectedUser.badge} • {selectedUser.org}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#7bdb80]/15 text-[#7bdb80] border border-[#7bdb80]/30">
                  {selectedUser.status}
                </span>
              </div>

              {/* Key Attributes */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#12161b] border border-[#262c35]">
                  <div className="text-slate-500 text-[10px] uppercase">Assigned System Role</div>
                  <div className="text-white font-bold mt-0.5">{selectedUser.role}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#12161b] border border-[#262c35]">
                  <div className="text-slate-500 text-[10px] uppercase">Active Session</div>
                  <div className="text-[#7bdb80] font-medium mt-0.5">{selectedUser.lastActive}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#12161b] border border-[#262c35] col-span-2">
                  <div className="text-slate-500 text-[10px] uppercase">Cryptographic MFA Token</div>
                  <div className="text-slate-200 mt-0.5 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#afc6ff]" />
                    {selectedUser.mfa}
                  </div>
                </div>
              </div>

              {/* CSE Access Scopes (ABAC Enclave) */}
              <div>
                <div className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Authorized Critical Entities</span>
                  <span className="text-[10px] text-[#afc6ff]">Statutory Grant (Sec 70B)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.cseScope.map((cse, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-[#202632] border border-[#303947] text-white text-xs font-mono flex items-center gap-1.5">
                      <Database className="w-3 h-3 text-[#afc6ff]" />
                      {cse}
                    </span>
                  ))}
                </div>
              </div>

              {/* Granular Entitlements Matrix */}
              <div>
                <div className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider mb-2">
                  RBAC / ABAC Granted Entitlements
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedUser.permissions.map((perm, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#12161b] border border-[#242a34] text-xs font-mono flex items-center justify-between">
                      <span className="text-slate-300">{perm}</span>
                      <span className="text-[10px] text-[#7bdb80] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> PERMITTED
                      </span>
                    </div>
                  ))}
                  {selectedUser.role !== 'SUPER_ADMIN' && (
                    <div className="p-2 rounded bg-[#12161b]/50 border border-[#242a34]/50 text-xs font-mono flex items-center justify-between opacity-60">
                      <span className="text-slate-500">POLICY_OVERRIDE / ENCLAVE_SIGN</span>
                      <span className="text-[10px] text-red-400 flex items-center gap-1">
                        <X className="w-3 h-3" /> DENIED (ROLE RESTRICTED)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sovereign Actions */}
              <div className="pt-3 border-t border-[#2a3038] flex items-center gap-3">
                <button
                  onClick={() => triggerNotification(`Revocation token queued for ${selectedUser.badge}. Session invalidation in progress.`)}
                  className="flex-1 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/50 text-xs font-mono transition-colors"
                >
                  Suspend Credential
                </button>
                <button
                  onClick={() => triggerNotification(`Cryptographic key rotation triggered for ${selectedUser.badge}.`)}
                  className="flex-1 py-2 rounded-lg bg-[#202632] hover:bg-[#28303f] text-slate-200 border border-[#343e50] text-xs font-mono transition-colors"
                >
                  Rotate HSM Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONTROLS & SCHEMAS */}
      {activeTab === 'CONTROLS' && (
        <div className="bg-[#181c22] border border-[#2a3038] rounded-xl p-5 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a3038] pb-4">
            <div>
              <h2 className="text-base font-bold text-white font-mono">NCIIPC-CSF Framework Control Schemas (v3.2)</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Authoritative definition of 20 critical controls governing incident triage, telemetry, and evidence verification.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#7bdb80]/15 text-[#7bdb80] border border-[#7bdb80]/30 text-xs font-mono">
                Active Schema: v3.2-REL
              </span>
              <button
                onClick={() => triggerNotification('Exporting JSON schema definitions for local airgap validator...')}
                className="px-3 py-1.5 rounded bg-[#202632] text-slate-200 border border-[#303947] text-xs font-mono hover:bg-[#28303e]"
              >
                Export Schema JSON
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'CTRL-07', title: 'SOC Evidence Traceability', category: 'VERIFICATION', status: 'REFINED IN v3.2', weight: 'CRITICAL', note: 'Requires cryptographically stamped SOAR and ITSM artifacts.' },
              { id: 'CTRL-01', title: 'Continuous Telemetry Ingestion', category: 'COLLECTION', status: 'UNCHANGED', weight: 'MANDATORY', note: 'Unbroken syslog and flow forwarder availability.' },
              { id: 'CTRL-04', title: 'Root Cause Verification', category: 'INVESTIGATION', status: 'UPDATED', weight: 'HIGH', note: 'Zero unverified closures permitted per Rule 4.8.2.' },
              { id: 'CTRL-12', title: 'Clock Synchronization Drift', category: 'INTEGRITY', status: 'ENFORCED', weight: 'MANDATORY', note: 'Strict +/- 1.0s NTP sync across perimeter sensors.' },
              { id: 'CTRL-16', title: 'Containment Escalation Velocity', category: 'RESPONSE', status: 'ACTIVE', weight: 'HIGH', note: 'Sub-30 minute containment for Tier 1 severity.' },
              { id: 'CTRL-20', title: 'Remediation Dual-Attestation', category: 'GOVERNANCE', status: 'ACTIVE', weight: 'MANDATORY', note: 'Supervisory sign-off required prior to ticket closure.' }
            ].map((ctrl) => (
              <div key={ctrl.id} className="p-4 rounded-lg bg-[#12161b] border border-[#262c35] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#afc6ff]">{ctrl.id}</span>
                  <span className="px-2 py-0.5 rounded bg-[#222832] text-slate-300 text-[10px] border border-[#2e3744]">
                    {ctrl.category}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white font-mono">{ctrl.title}</div>
                <p className="text-xs text-slate-400 font-mono">{ctrl.note}</p>
                <div className="pt-2 border-t border-[#1c222c] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#ffb693]">{ctrl.weight}</span>
                  <span className="text-[#7bdb80]">{ctrl.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: OFFLINE MODEL REGISTRY */}
      {activeTab === 'MODELS' && (
        <div className="bg-[#181c22] border border-[#2a3038] rounded-xl p-5 shadow-xl space-y-6">
          <div className="border-b border-[#2a3038] pb-4">
            <h2 className="text-base font-bold text-white font-mono">Offline Supervisory Analytics & Process Engines</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              In accordance with Air-Gap Mandate SEC-09, zero external API endpoints or cloud LLMs are utilized. All statistical and process mining engines execute strictly in-memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-[#12161b] border border-[#262c35] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                  <Activity className="w-4 h-4 text-[#afc6ff]" /> PM4Py Alpha/Heuristics
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#7bdb80]/15 text-[#7bdb80] border border-[#7bdb80]/30">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Conformance checking engine calculating fitness, precision, and deviation penalties across incident resolution traces.
              </p>
              <div className="text-[11px] font-mono text-slate-500 space-y-1">
                <div>Version: <span className="text-slate-300">v2.3.1-airgap</span></div>
                <div>Digest: <span className="text-slate-400">sha256:e3b0c442...</span></div>
                <div>Runtime: <span className="text-[#7bdb80]">Embedded Local CPython</span></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#12161b] border border-[#262c35] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                  <Database className="w-4 h-4 text-[#7bdb80]" /> DuckDB / Polars In-Memory
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#7bdb80]/15 text-[#7bdb80] border border-[#7bdb80]/30">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Vectorized columnar OLAP engine executing negative space deduction, cross-quarter trends, and telemetry alignment.
              </p>
              <div className="text-[11px] font-mono text-slate-500 space-y-1">
                <div>Version: <span className="text-slate-300">DuckDB v0.10.2</span></div>
                <div>Digest: <span className="text-slate-400">sha256:88a104f2...</span></div>
                <div>Isolation: <span className="text-[#7bdb80]">Zero External Socket Calls</span></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#12161b] border border-[#262c35] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                  <Cpu className="w-4 h-4 text-[#ffb693]" /> Local Signal Discovery Kernel
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#7bdb80]/15 text-[#7bdb80] border border-[#7bdb80]/30">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Deterministic rule-based heuristics & graph relation clustering for unsupervised candidate signal generation.
              </p>
              <div className="text-[11px] font-mono text-slate-500 space-y-1">
                <div>Version: <span className="text-slate-300">AN-1.8 Engine</span></div>
                <div>Rule Integrity: <span className="text-[#7bdb80]">Signed by Director HQ</span></div>
                <div>Offline Proof: <span className="text-[#7bdb80]">100% Deterministic</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ENCLAVE & HSM */}
      {(activeTab === 'ROLES' || activeTab === 'SCOPES' || activeTab === 'ENCLAVE') && (
        <div className="bg-[#181c22] border border-[#2a3038] rounded-xl p-5 shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-[#afc6ff]" />
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Cryptographic Hardware Security & Air-Gap Assurance
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Hardware cryptographic boundary operating in compliance with FIPS 140-2 Level 3 and NCIIPC Sovereign Mandate.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg bg-[#12161b] border border-[#262c35] space-y-2">
              <div className="text-slate-400 uppercase text-[10px]">HSM Module Status</div>
              <div className="text-white font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7bdb80]" />
                Enclave SafeNet Luna PCIe HSM [ONLINE]
              </div>
              <p className="text-slate-500">
                All findings ratifications and supervisory injunctions are signed using 4096-bit RSA keys rooted in hardware.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#12161b] border border-[#262c35] space-y-2">
              <div className="text-slate-400 uppercase text-[10px]">Audit Log Cryptographic Sealing</div>
              <div className="text-white font-bold text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#afc6ff]" />
                Merkle Tree Root: 9b4e18ac... [CONTINUOUS]
              </div>
              <p className="text-slate-500">
                1,842 ledger blocks verified with zero hash chain degradation. Tamper-evident write-once architecture.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROVISION NEW USER */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181c22] border border-[#2a3038] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#2a3038] pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#afc6ff]" />
                <h3 className="text-sm font-bold text-white font-mono">Provision Air-Gapped Supervisory Identity</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Sengupta"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-[#12161b] border border-[#2c3440] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#afc6ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Institutional Badge ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NC-9240"
                    value={newUser.badge}
                    onChange={(e) => setNewUser({ ...newUser, badge: e.target.value })}
                    className="w-full bg-[#12161b] border border-[#2c3440] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#afc6ff]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="m.sengupta@nciipc.gov.in"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-[#12161b] border border-[#2c3440] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#afc6ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Supervisory Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full bg-[#12161b] border border-[#2c3440] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#afc6ff]"
                  >
                    <option value="EXAMINER">EXAMINER</option>
                    <option value="LEAD_EXAMINER">LEAD_EXAMINER</option>
                    <option value="SUPERVISOR">SUPERVISOR</option>
                    <option value="AUDITOR">AUDITOR</option>
                    <option value="CSE_LIAISON">CSE_LIAISON</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Assigned Scope</label>
                  <select
                    value={newUser.cseScope}
                    onChange={(e) => setNewUser({ ...newUser, cseScope: e.target.value })}
                    className="w-full bg-[#12161b] border border-[#2c3440] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#afc6ff]"
                  >
                    <option value="CSE-014">CSE-014 (PowerGrid)</option>
                    <option value="CSE-021">CSE-021 (Western Grid)</option>
                    <option value="CSE-033">CSE-033 (Northern Load)</option>
                    <option value="ALL_ENTITIES">ALL_ENTITIES (HQ Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hardware MFA Method</label>
                <select
                  value={newUser.mfa}
                  onChange={(e) => setNewUser({ ...newUser, mfa: e.target.value as any })}
                  className="w-full bg-[#12161b] border border-[#2c3440] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#afc6ff]"
                >
                  <option value="FIPS-140-2 L3 Smartcard">FIPS-140-2 Level 3 Smartcard</option>
                  <option value="Hardware Security Key">YubiKey FIPS Hardware Key</option>
                  <option value="Gateway Token">Air-Gapped Gateway Token</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#2a3038] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#202632] hover:bg-[#28303f] text-slate-300 text-xs font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#afc6ff] hover:bg-[#c2d5ff] text-[#041d40] text-xs font-mono font-bold transition-all shadow-md shadow-[#afc6ff]/20"
                >
                  Generate Enclave Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
