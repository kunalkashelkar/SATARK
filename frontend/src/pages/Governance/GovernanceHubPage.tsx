import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { AuditTrailItem } from '@/data/mock/audit';
import {
  SystemUser,
  AdminRole,
  CseAccessRule,
  SecurityConfigItem,
  SupervisoryControl,
  SystemComponentVersion,
  mockAdminRoles,
  mockCseAccessRules,
  mockSecurityConfig,
} from '@/data/mock/governance';
import { governanceApi } from '@/api';
import {
  Search,
  Shield,
  ShieldCheck,
  Lock,
  History,
  Users,
  SlidersHorizontal,
  Key,
  Database,
  Cpu,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Eye,
  Copy,
  Check,
  Filter,
  Layers,
  FileText,
  UserCheck,
  Terminal,
  Server,
  BookOpen,
  Info,
  Building,
  RotateCcw
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  KpiCard,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatusBadge,
  PriorityBadge,
  Tabs,
  Modal,
  Button,
  Drawer,
  Timeline
} from '@/components/common';

type GovernanceTab = 'audit' | 'administration' | 'controls' | 'versions';

interface GovernanceHubPageProps {
  initialTab?: GovernanceTab | string;
}

export const GovernanceHubPage: React.FC<GovernanceHubPageProps> = ({ initialTab = 'audit' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { auditTrail, cses, findings } = useSupervisory();

  // Synced Active Tab
  const tabFromUrl = searchParams.get('tab') as GovernanceTab | null;
  const resolvedTab = tabFromUrl || (initialTab === 'admin' ? 'administration' : initialTab) || 'audit';
  const [activeTab, setActiveTab] = useState<string>(resolvedTab);

  useEffect(() => {
    if (tabFromUrl && ['audit', 'administration', 'controls', 'versions'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (initialTab) {
      setActiveTab(initialTab === 'admin' ? 'administration' : initialTab);
    }
  }, [tabFromUrl, initialTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tabId);
      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // TAB 1: AUDIT LEDGER STATE & FILTERS
  // ---------------------------------------------------------------------------
  const [auditSearch, setAuditSearch] = useState('');
  const [auditUserFilter, setAuditUserFilter] = useState('ALL');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditResultFilter, setAuditResultFilter] = useState('ALL');
  const [selectedAuditEvent, setSelectedAuditEvent] = useState<AuditTrailItem | null>(null);

  const filteredAuditEvents = useMemo(() => {
    return auditTrail.filter(ev => {
      if (auditSearch) {
        const q = auditSearch.toLowerCase();
        const match =
          ev.id.toLowerCase().includes(q) ||
          ev.actor.toLowerCase().includes(q) ||
          ev.action.toLowerCase().includes(q) ||
          ev.targetObject.toLowerCase().includes(q) ||
          ev.reason.toLowerCase().includes(q) ||
          (ev.evidenceRef && ev.evidenceRef.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (auditUserFilter !== 'ALL' && !ev.actor.toLowerCase().includes(auditUserFilter.toLowerCase())) return false;
      if (auditActionFilter !== 'ALL' && !ev.action.toLowerCase().includes(auditActionFilter.toLowerCase())) return false;
      if (auditResultFilter !== 'ALL' && ev.result !== auditResultFilter) return false;
      return true;
    });
  }, [auditTrail, auditSearch, auditUserFilter, auditActionFilter, auditResultFilter]);

  const auditKpis = useMemo(() => {
    const eventsToday = auditTrail.length;
    const findingActions = auditTrail.filter(e => e.action.toLowerCase().includes('finding') || e.targetObject.startsWith('FND')).length;
    const evidenceActions = auditTrail.filter(e => e.action.toLowerCase().includes('evidence') || e.action.toLowerCase().includes('telemetry') || (e.evidenceRef && e.evidenceRef.length > 0)).length;
    const accessConfigActions = auditTrail.filter(e => e.action.toLowerCase().includes('verification') || e.action.toLowerCase().includes('decision') || e.actorType === 'SYSTEM').length;

    return { eventsToday, findingActions, evidenceActions, accessConfigActions };
  }, [auditTrail]);

  // ---------------------------------------------------------------------------
  // TAB 2: ADMINISTRATION STATE & SUB-TABS
  // ---------------------------------------------------------------------------
  const [adminSubTab, setAdminSubTab] = useState<'users' | 'roles' | 'access' | 'security'>('users');
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>(mockAdminRoles);
  const [cseAccessRules, setCseAccessRules] = useState<CseAccessRule[]>(mockCseAccessRules);
  const [securityConfigs] = useState<SecurityConfigItem[]>(mockSecurityConfig);

  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [editAccessUser, setEditAccessUser] = useState<SystemUser | null>(null);

  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminUserRoleFilter, setAdminUserRoleFilter] = useState('ALL');

  useEffect(() => {
    governanceApi.getUsers().then(res => setUsers(res)).catch(() => {});
    governanceApi.getRoles().then(res => setRoles(res)).catch(() => {});
    governanceApi.getAccessRules().then(res => setCseAccessRules(res)).catch(() => {});
    governanceApi.getControls().then(res => setControls(res)).catch(() => {});
    governanceApi.getSystemVersions().then(res => setVersions(res)).catch(() => {});
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (adminUserSearch) {
        const q = adminUserSearch.toLowerCase();
        const match =
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.badge.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.organization.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (adminUserRoleFilter !== 'ALL' && u.role !== adminUserRoleFilter) return false;
      return true;
    });
  }, [users, adminUserSearch, adminUserRoleFilter]);

  // ---------------------------------------------------------------------------
  // TAB 3: CONTROL LIBRARY STATE & FILTERS
  // ---------------------------------------------------------------------------
  const [controls, setControls] = useState<SupervisoryControl[]>([]);
  const [controlSearch, setControlSearch] = useState('');
  const [controlDomainFilter, setControlDomainFilter] = useState('ALL');
  const [controlStatusFilter, setControlStatusFilter] = useState('ALL');
  const [selectedControl, setSelectedControl] = useState<SupervisoryControl | null>(null);

  const filteredControls = useMemo(() => {
    return controls.filter(c => {
      if (controlSearch) {
        const q = controlSearch.toLowerCase();
        const match =
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.expectedCapability.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (controlDomainFilter !== 'ALL' && c.domain !== controlDomainFilter) return false;
      if (controlStatusFilter !== 'ALL' && c.status !== controlStatusFilter) return false;
      return true;
    });
  }, [controls, controlSearch, controlDomainFilter, controlStatusFilter]);

  const controlKpis = useMemo(() => {
    const total = controls.length;
    const active = controls.filter(c => c.status === 'ACTIVE').length;
    const underReview = controls.filter(c => c.status === 'UNDER_REVIEW').length;
    const baselineVersions = new Set(controls.map(c => c.version)).size;
    return { total, active, underReview, baselineVersions };
  }, [controls]);

  // ---------------------------------------------------------------------------
  // TAB 4: SYSTEM VERSIONS STATE
  // ---------------------------------------------------------------------------
  const [versions, setVersions] = useState<SystemComponentVersion[]>([]);
  const [versionSearch, setVersionSearch] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<SystemComponentVersion | null>(null);

  const filteredVersions = useMemo(() => {
    return versions.filter(v => {
      if (versionSearch) {
        const q = versionSearch.toLowerCase();
        const match =
          v.component.toLowerCase().includes(q) ||
          v.version.toLowerCase().includes(q) ||
          v.type.toLowerCase().includes(q) ||
          v.usedBy.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [versions, versionSearch]);

  const versionKpis = useMemo(() => {
    const currentSys = versions.find(v => v.type === 'Core System')?.version || 'v0.9.4';
    const activeRule = versions.find(v => v.type === 'Rule Engine')?.version || 'R-2.4';
    const activeCtrl = versions.find(v => v.type === 'Control Baseline')?.version || 'v3.2';
    const activeModel = versions.find(v => v.type === 'Supervisory Model')?.version || 'v2.1';
    return { currentSys, activeRule, activeCtrl, activeModel };
  }, [versions]);

  // Copy hash indicator
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // ---------------------------------------------------------------------------
  // MAIN LIFECYCLE TABS (Section 6)
  // ---------------------------------------------------------------------------
  const mainTabs = [
    {
      id: 'audit',
      label: '1. Audit Ledger',
      count: auditTrail.length,
      icon: <span className="material-symbols-outlined text-[15px]">history_edu</span>
    },
    {
      id: 'administration',
      label: '2. Administration',
      icon: <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
    },
    {
      id: 'controls',
      label: '3. Control Library',
      count: controls.length,
      icon: <span className="material-symbols-outlined text-[15px]">library_books</span>
    },
    {
      id: 'versions',
      label: '4. System Versions',
      count: versions.length,
      icon: <span className="material-symbols-outlined text-[15px]">info</span>
    }
  ];

  return (
    <PageContainer>
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER (Section 5)                                                */}
      {/* ========================================================================= */}
      <PageHeader
        title="Governance"
        description="Manage supervisory controls, access, system configuration, and audit history."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2 py-0.5 rounded border border-[#7bdb80]/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7bdb80]" />
              FIPS-140-2 L3 SIGNED
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#64748b]">
            <span>Air-Gap Node:</span>
            <span className="text-[#38bdf8] font-bold">NCIIPC-ENCLAVE-01</span>
          </div>
        }
      />

      {/* ========================================================================= */}
      {/* 2. GOVERNANCE TAB BAR (Section 6)                                         */}
      {/* ========================================================================= */}
      <div className="border-b border-[#212c3d] pb-1">
        <Tabs
          tabs={mainTabs}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AUDIT LEDGER (Section 7)                                           */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4 min-w-0">
          {/* Summary Cards (Max 4 KPI cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              title="Events Today"
              value={auditKpis.eventsToday}
              subtitle="All chronological entries"
              semantic="blue"
              icon={Clock}
            />
            <KpiCard
              title="Finding Actions"
              value={auditKpis.findingActions}
              subtitle="Adjudication & promotions"
              semantic="purple"
              icon={FileText}
            />
            <KpiCard
              title="Evidence Actions"
              value={auditKpis.evidenceActions}
              subtitle="Demands, uploads & digests"
              semantic="cyan"
              icon={FileCheck}
            />
            <KpiCard
              title="Supervisory Reviews"
              value={auditKpis.accessConfigActions}
              subtitle="Verification & gate decisions"
              semantic="green"
              icon={ShieldCheck}
            />
          </div>

          {/* Filter Bar */}
          <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] flex flex-wrap items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
              <Input
                icon={<Search className="w-4 h-4 text-[#64748b]" />}
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit ID, actor, action, target object..."
                sizeVariant="sm"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Select
                sizeVariant="sm"
                value={auditUserFilter}
                onChange={(e) => setAuditUserFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Users & Daemons' },
                  { value: 'Examiner', label: 'NCIIPC Examiners' },
                  { value: 'Core', label: 'Air-Gap Ingest Daemons' },
                  { value: 'CSE', label: 'CSE Evidence Teams' }
                ]}
              />

              <Select
                sizeVariant="sm"
                value={auditResultFilter}
                onChange={(e) => setAuditResultFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Results' },
                  { value: 'SUCCESS', label: 'Success' },
                  { value: 'FAILED', label: 'Failed' },
                  { value: 'QUALIFIED', label: 'Qualified' },
                  { value: 'REJECTED', label: 'Rejected' }
                ]}
              />

              {(auditSearch || auditUserFilter !== 'ALL' || auditResultFilter !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAuditSearch('');
                    setAuditUserFilter('ALL');
                    setAuditResultFilter('ALL');
                  }}
                  className="text-[#94a3b8] hover:text-[#e2e8f0]"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Audit Table */}
          <div className="rounded-lg bg-[#111622] border border-[#212c3d] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#212c3d] bg-[#161e29]/70 text-[#94a3b8] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                    <th className="py-2.5 px-3 font-semibold">User / Actor</th>
                    <th className="py-2.5 px-3 font-semibold">Action</th>
                    <th className="py-2.5 px-3 font-semibold">Target Object</th>
                    <th className="py-2.5 px-3 font-semibold">Result</th>
                    <th className="py-2.5 px-3 font-semibold">Control Ver.</th>
                    <th className="py-2.5 px-3 font-semibold">Rule Ver.</th>
                    <th className="py-2.5 px-3 font-semibold">Evidence Ref</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212c3d]/60 font-sans">
                  {filteredAuditEvents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#64748b]">
                        <History className="w-8 h-8 mx-auto mb-2 text-[#475569] opacity-60" />
                        <p className="text-[13px] font-medium text-[#94a3b8]">No audit ledger events match the current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAuditEvents.map((ev) => (
                      <tr
                        key={ev.id}
                        onClick={() => setSelectedAuditEvent(ev)}
                        className="hover:bg-[#161e29]/50 transition-colors cursor-pointer group"
                      >
                        {/* Timestamp */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-[#94a3b8] block">{ev.timestamp}</span>
                          <span className="font-mono text-[10px] text-[#64748b]">{ev.id}</span>
                        </td>

                        {/* User / Actor */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col max-w-[150px]">
                            <span className="font-medium text-[#e2e8f0] truncate">{ev.actor}</span>
                            <span className="text-[10px] font-mono text-[#64748b] truncate">{ev.actorRole}</span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-3">
                          <span className="font-medium text-[#38bdf8] block truncate">{ev.action}</span>
                          <span className="text-[10px] text-[#94a3b8] truncate block max-w-xs">{ev.reason}</span>
                        </td>

                        {/* Target */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono text-[11px] font-bold text-[#e2e8f0] bg-[#161e29] px-2 py-0.5 rounded border border-[#212c3d]">
                            {ev.targetObject}
                          </span>
                        </td>

                        {/* Result */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <StatusBadge status={ev.result} />
                        </td>

                        {/* Control Ver */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#94a3b8]">
                          {ev.controlVersion || 'CTRL-v3.2'}
                        </td>

                        {/* Rule Ver */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#94a3b8]">
                          {ev.ruleVersion || 'R-2.4'}
                        </td>

                        {/* Evidence Ref */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#38bdf8]">
                          {ev.evidenceRef || '—'}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAuditEvent(ev);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ADMINISTRATION (Section 9)                                         */}
      {/* ========================================================================= */}
      {activeTab === 'administration' && (
        <div className="space-y-4 min-w-0">
          {/* Summary Cards (Max 4 KPI cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              title="Enclave Users"
              value={users.length}
              subtitle="Active operator accounts"
              semantic="blue"
              icon={Users}
            />
            <KpiCard
              title="Supervisory Roles"
              value={roles.length}
              subtitle="Tiered RBAC governance"
              semantic="purple"
              icon={Shield}
            />
            <KpiCard
              title="CSE Access Grants"
              value={cseAccessRules.length}
              subtitle="Authorized entity scopes"
              semantic="green"
              icon={Building}
            />
            <KpiCard
              title="Security Perimeter"
              value="HARDENED"
              subtitle="FIPS 140-2 Level 3 HSM"
              semantic="cyan"
              icon={Lock}
            />
          </div>

          {/* Sub-Tabs / Segmented Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#111622] border border-[#212c3d] w-fit text-[12px] font-mono">
            <button
              onClick={() => setAdminSubTab('users')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                adminSubTab === 'users'
                  ? 'bg-[#161e29] text-[#38bdf8] border border-[#212c3d]'
                  : 'text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setAdminSubTab('roles')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                adminSubTab === 'roles'
                  ? 'bg-[#161e29] text-[#38bdf8] border border-[#212c3d]'
                  : 'text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              Roles ({roles.length})
            </button>
            <button
              onClick={() => setAdminSubTab('access')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                adminSubTab === 'access'
                  ? 'bg-[#161e29] text-[#38bdf8] border border-[#212c3d]'
                  : 'text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              CSE Access ({cseAccessRules.length})
            </button>
            <button
              onClick={() => setAdminSubTab('security')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                adminSubTab === 'security'
                  ? 'bg-[#161e29] text-[#38bdf8] border border-[#212c3d]'
                  : 'text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              Security Configuration
            </button>
          </div>

          {/* SUB-TAB 1: USERS */}
          {adminSubTab === 'users' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] flex flex-wrap items-center justify-between gap-3 text-[12px]">
                <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
                  <Input
                    icon={<Search className="w-4 h-4 text-[#64748b]" />}
                    value={adminUserSearch}
                    onChange={(e) => setAdminUserSearch(e.target.value)}
                    placeholder="Search user name, username, badge, email..."
                    sizeVariant="sm"
                  />
                </div>
                <Select
                  sizeVariant="sm"
                  value={adminUserRoleFilter}
                  onChange={(e) => setAdminUserRoleFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Roles' },
                    { value: 'SUPERVISOR', label: 'Supervisor' },
                    { value: 'LEAD_EXAMINER', label: 'Lead Examiner' },
                    { value: 'EXAMINER', label: 'Examiner' },
                    { value: 'AUDITOR', label: 'Auditor' },
                    { value: 'ADMINISTRATOR', label: 'Administrator' }
                  ]}
                />
              </div>

              <div className="rounded-lg bg-[#111622] border border-[#212c3d] overflow-hidden">
                <table className="w-full text-left border-collapse text-[12px]">
                  <thead>
                    <tr className="border-b border-[#212c3d] bg-[#161e29]/70 text-[#94a3b8] font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-semibold">User</th>
                      <th className="py-2.5 px-3 font-semibold">Role</th>
                      <th className="py-2.5 px-3 font-semibold">Organization</th>
                      <th className="py-2.5 px-3 font-semibold">Access Scope</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold">Last Activity</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#212c3d]/60 font-sans">
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className="hover:bg-[#161e29]/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3">
                          <span className="font-semibold text-[#e2e8f0] block group-hover:text-[#38bdf8]">{u.name}</span>
                          <span className="font-mono text-[10px] text-[#64748b]">{u.username} • {u.badge}</span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono text-[11px] font-bold text-[#afc6ff] bg-[#161e29] px-2 py-0.5 rounded border border-[#212c3d]">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#94a3b8] text-[11px]">
                          {u.organization}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#7bdb80]">
                          {u.cseScope.join(', ')}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#94a3b8]">
                          {u.lastActivity}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="w-3.5 h-3.5" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(u);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditAccessUser(u);
                              }}
                            >
                              Edit Access
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: ROLES */}
          {adminSubTab === 'roles' && (
            <div className="rounded-lg bg-[#111622] border border-[#212c3d] overflow-hidden">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#212c3d] bg-[#161e29]/70 text-[#94a3b8] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Role</th>
                    <th className="py-2.5 px-3 font-semibold">Description</th>
                    <th className="py-2.5 px-3 font-semibold">Access Scope</th>
                    <th className="py-2.5 px-3 font-semibold">Active Operators</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212c3d]/60 font-sans">
                  {roles.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRole(r)}
                      className="hover:bg-[#161e29]/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-[#38bdf8] font-mono text-[12px] block">{r.roleName}</span>
                        <span className="font-mono text-[10px] text-[#64748b]">{r.id}</span>
                      </td>
                      <td className="py-3 px-3 text-[#94a3b8] text-[12px] max-w-md">
                        {r.description}
                      </td>
                      <td className="py-3 px-3 text-[#e2e8f0] text-[11px] font-mono">
                        {r.accessScope}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[12px] text-[#7bdb80] font-bold">
                        {r.userCount} Operators
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Shield className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRole(r);
                          }}
                        >
                          View Permissions
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB-TAB 3: CSE ACCESS */}
          {adminSubTab === 'access' && (
            <div className="rounded-lg bg-[#111622] border border-[#212c3d] overflow-hidden">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#212c3d] bg-[#161e29]/70 text-[#94a3b8] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">User / Role</th>
                    <th className="py-2.5 px-3 font-semibold">CSE Entity</th>
                    <th className="py-2.5 px-3 font-semibold">Access Type</th>
                    <th className="py-2.5 px-3 font-semibold">Authorized Scope</th>
                    <th className="py-2.5 px-3 font-semibold">Granted By</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212c3d]/60 font-sans">
                  {cseAccessRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-[#161e29]/50 transition-colors">
                      <td className="py-3 px-3 font-medium text-[#e2e8f0]">
                        {rule.userOrRole}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#38bdf8] font-mono">{rule.cseId}</span>
                        <span className="text-[#94a3b8] text-[11px] block">{rule.cseName}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#7bdb80]">
                        {rule.accessType}
                      </td>
                      <td className="py-3 px-3 text-[#94a3b8] text-[11px]">
                        {rule.scope}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#64748b]">
                        {rule.grantedBy} ({rule.grantedDate})
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={rule.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB-TAB 4: SECURITY CONFIGURATION */}
          {adminSubTab === 'security' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/30 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-[#94a3b8]">
                  <strong className="text-[#e2e8f0] font-mono uppercase">Enclave Security Assurance:</strong> System operates in complete offline air-gapped isolation with continuous hardware HSM cryptographic validation. Cryptographic credentials and private keys are hardware-bound and never exposed in the interface.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {securityConfigs.map((sec) => (
                  <Card key={sec.id} className="space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#212c3d]">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#38bdf8]" />
                        <span className="font-mono text-[12px] font-bold text-[#e2e8f0]">{sec.title}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#7bdb80]/10 text-[#7bdb80] border border-[#7bdb80]/20">
                        {sec.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#94a3b8] leading-relaxed">
                      {sec.description}
                    </p>
                    <div className="p-2.5 rounded bg-[#161e29]/70 border border-[#212c3d] font-mono text-[11px]">
                      <span className="text-[#64748b] block text-[10px] uppercase">Enforced Value:</span>
                      <span className="text-[#38bdf8] font-bold">{sec.value}</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#64748b]">
                      Standard: <span className="text-[#94a3b8]">{sec.standard}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONTROL LIBRARY (Section 10)                                       */}
      {/* ========================================================================= */}
      {activeTab === 'controls' && (
        <div className="space-y-4 min-w-0">
          {/* Summary Cards (Max 4 KPI cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              title="Total Controls"
              value={controlKpis.total}
              subtitle="Statutory standard catalog"
              semantic="blue"
              icon={BookOpen}
            />
            <KpiCard
              title="Active Standards"
              value={controlKpis.active}
              subtitle="NCIIPC CSF v3.2 Enforced"
              semantic="green"
              icon={CheckCircle2}
            />
            <KpiCard
              title="Controls Under Review"
              value={controlKpis.underReview}
              subtitle="Pending revision cycle"
              semantic="amber"
              icon={Clock}
            />
            <KpiCard
              title="Baseline Versions"
              value={controlKpis.baselineVersions}
              subtitle="Applicable statutory revisions"
              semantic="purple"
              icon={SlidersHorizontal}
            />
          </div>

          {/* Filter Bar */}
          <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] flex flex-wrap items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
              <Input
                icon={<Search className="w-4 h-4 text-[#64748b]" />}
                value={controlSearch}
                onChange={(e) => setControlSearch(e.target.value)}
                placeholder="Search control ID, title, domain, expected criteria..."
                sizeVariant="sm"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Select
                sizeVariant="sm"
                value={controlDomainFilter}
                onChange={(e) => setControlDomainFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Domains' },
                  { value: 'Telemetry & Ingestion', label: 'Telemetry & Ingestion' },
                  { value: 'Identity & Access Management', label: 'Identity & Access' },
                  { value: 'SOC Operations & Incident Handling', label: 'SOC Operations' },
                  { value: 'Vulnerability & Patch Management', label: 'Vulnerability / Patch' },
                  { value: 'Monitoring & SIEM Synchronization', label: 'SIEM Synchronization' },
                  { value: 'Log Management & Integrity', label: 'Log Integrity' },
                  { value: 'Incident Response & Containment', label: 'Incident Containment' }
                ]}
              />

              <Select
                sizeVariant="sm"
                value={controlStatusFilter}
                onChange={(e) => setControlStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'UNDER_REVIEW', label: 'Under Review' },
                  { value: 'DEPRECATED', label: 'Deprecated' }
                ]}
              />

              {(controlSearch || controlDomainFilter !== 'ALL' || controlStatusFilter !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setControlSearch('');
                    setControlDomainFilter('ALL');
                    setControlStatusFilter('ALL');
                  }}
                  className="text-[#94a3b8] hover:text-[#e2e8f0]"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Control Table */}
          <div className="rounded-lg bg-[#111622] border border-[#212c3d] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#212c3d] bg-[#161e29]/70 text-[#94a3b8] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Control ID</th>
                    <th className="py-2.5 px-3 font-semibold">Control Name</th>
                    <th className="py-2.5 px-3 font-semibold">Domain</th>
                    <th className="py-2.5 px-3 font-semibold">Version</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Applicability</th>
                    <th className="py-2.5 px-3 font-semibold">Last Updated</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212c3d]/60 font-sans">
                  {filteredControls.map((ctrl) => (
                    <tr
                      key={ctrl.id}
                      onClick={() => setSelectedControl(ctrl)}
                      className="hover:bg-[#161e29]/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-[12px] font-bold text-[#38bdf8] group-hover:underline">
                          {ctrl.id}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#e2e8f0] block">{ctrl.name}</span>
                        <span className="text-[11px] text-[#94a3b8] line-clamp-1">{ctrl.description}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[#c2c6d6] text-[11px]">
                        {ctrl.domain}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#7bdb80] font-bold">
                        {ctrl.version}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={ctrl.status} />
                      </td>
                      <td className="py-3 px-3 text-[#94a3b8] text-[11px]">
                        {ctrl.applicability}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#64748b]">
                        {ctrl.lastUpdated}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedControl(ctrl);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SYSTEM VERSIONS (Section 13)                                       */}
      {/* ========================================================================= */}
      {activeTab === 'versions' && (
        <div className="space-y-4 min-w-0">
          {/* Summary Cards (Max 4 KPI cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              title="Current System Version"
              value={versionKpis.currentSys}
              subtitle="Production hardened node"
              semantic="blue"
              icon={Server}
            />
            <KpiCard
              title="Active Rule Version"
              value={versionKpis.activeRule}
              subtitle="Deterministic rule engine"
              semantic="green"
              icon={Cpu}
            />
            <KpiCard
              title="Active Control Baseline"
              value={versionKpis.activeCtrl}
              subtitle="NCIIPC statutory standard"
              semantic="purple"
              icon={BookOpen}
            />
            <KpiCard
              title="Active Model Engine"
              value={versionKpis.activeModel}
              subtitle="Risk & process mining"
              semantic="cyan"
              icon={Layers}
            />
          </div>

          {/* Search Bar */}
          <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] flex items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                icon={<Search className="w-4 h-4 text-[#64748b]" />}
                value={versionSearch}
                onChange={(e) => setVersionSearch(e.target.value)}
                placeholder="Search component name, version, type, dependency..."
                sizeVariant="sm"
              />
            </div>
            <span className="text-[11px] font-mono text-[#64748b]">
              Immutable Version Manifest v0.9.4
            </span>
          </div>

          {/* Versions Table */}
          <div className="rounded-lg bg-[#111622] border border-[#212c3d] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#212c3d] bg-[#161e29]/70 text-[#94a3b8] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Component</th>
                    <th className="py-2.5 px-3 font-semibold">Version</th>
                    <th className="py-2.5 px-3 font-semibold">Type</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Released</th>
                    <th className="py-2.5 px-3 font-semibold">Active Since</th>
                    <th className="py-2.5 px-3 font-semibold">Used By</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212c3d]/60 font-sans">
                  {filteredVersions.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVersion(v)}
                      className="hover:bg-[#161e29]/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#e2e8f0] block group-hover:text-[#38bdf8]">{v.component}</span>
                        <span className="text-[10px] font-mono text-[#64748b]">{v.hashSignature}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[12px] font-bold text-[#7bdb80]">
                        {v.version}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-[#afc6ff] bg-[#161e29] px-2 py-0.5 rounded border border-[#212c3d]">
                          {v.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#94a3b8]">
                        {v.released}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#e2e8f0]">
                        {v.activeSince}
                      </td>
                      <td className="py-3 px-3 text-[#94a3b8] text-[11px]">
                        {v.usedBy}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVersion(v);
                          }}
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 1: AUDIT EVENT DETAIL DRAWER (Section 7)                           */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!selectedAuditEvent}
        onClose={() => setSelectedAuditEvent(null)}
        title={selectedAuditEvent ? `Audit Ledger Event ${selectedAuditEvent.id}` : 'Audit Record'}
        subtitle={
          selectedAuditEvent ? `${selectedAuditEvent.timestamp} • Actor ${selectedAuditEvent.actor}` : ''
        }
        width="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-mono text-[#7bdb80] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cryptographically Verified Block
            </span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedAuditEvent(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedAuditEvent && (
          <div className="space-y-4 text-[12px]">
            {/* Read-Only Historical Notice */}
            <div className="p-3 rounded-lg bg-[#161e29] border border-[#212c3d] flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed text-[#94a3b8]">
                <strong className="text-[#e2e8f0] font-mono uppercase">Read-Only Immutable Record:</strong> This entry is stored in the append-only cryptographic ledger. Historical alteration, retroactive editing, or deletion is locked under enclave FIPS-140-2 policy.
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="p-3.5 rounded-lg bg-[#161e29]/70 border border-[#212c3d] grid grid-cols-2 gap-3 font-mono">
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Event ID</span>
                <span className="text-[#38bdf8] font-bold text-[13px]">{selectedAuditEvent.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Execution Result</span>
                <div className="mt-0.5"><StatusBadge status={selectedAuditEvent.result} /></div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Actor</span>
                <span className="text-[#e2e8f0] font-sans font-medium text-[12px]">{selectedAuditEvent.actor}</span>
                <span className="text-[#64748b] block text-[10px]">{selectedAuditEvent.actorDetail}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Actor Role</span>
                <span className="text-[#e2e8f0]">{selectedAuditEvent.actorRole}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Target Object</span>
                <span className="text-[#7bdb80] font-bold">{selectedAuditEvent.targetObject}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Linked Context</span>
                <span className="text-[#e2e8f0]">{selectedAuditEvent.linkedObject}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Control Version</span>
                <span className="text-[#e2e8f0]">{selectedAuditEvent.controlVersion || 'CTRL-v3.2'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Rule Engine Version</span>
                <span className="text-[#e2e8f0]">{selectedAuditEvent.ruleVersion || 'R-2.4'}</span>
              </div>
            </div>

            {/* State Transition */}
            <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-1.5 font-mono">
              <span className="text-[10px] text-[#94a3b8] uppercase font-semibold block">
                Object State Transition:
              </span>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-[#161e29] border border-[#212c3d] text-[#64748b] text-[11px]">
                  {selectedAuditEvent.previousState}
                </span>
                <span className="text-[#38bdf8]">→</span>
                <span className="px-2 py-1 rounded bg-[#161e29] border border-[#38bdf8]/30 text-[#38bdf8] font-bold text-[11px]">
                  {selectedAuditEvent.newState}
                </span>
              </div>
            </div>

            {/* Event Reason / Notes */}
            <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-1.5 font-sans">
              <span className="text-[10px] font-mono text-[#94a3b8] uppercase font-semibold block">
                Supervisory Rationale &amp; Audit Notes:
              </span>
              <p className="text-[#e2e8f0] text-[12px] leading-relaxed">
                {selectedAuditEvent.reason}
              </p>
            </div>

            {/* Evidence Reference */}
            {selectedAuditEvent.evidenceRef && (
              <div className="p-3 rounded-lg bg-[#161e29]/50 border border-[#212c3d] flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#38bdf8]" />
                  <span className="text-[#94a3b8]">Evidence Ref:</span>
                  <span className="text-[#7bdb80] font-bold">{selectedAuditEvent.evidenceRef}</span>
                </div>
                <Link to="/evidence" className="text-[#38bdf8] hover:underline flex items-center gap-1 text-[11px]">
                  <span>Evidence Explorer</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* DRAWER 2: USER DETAIL DRAWER (Administration)                             */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name || 'Operator Profile'}
        subtitle={selectedUser ? `${selectedUser.badge} • ${selectedUser.role}` : ''}
        width="md"
      >
        {selectedUser && (
          <div className="space-y-4 text-[12px]">
            <div className="p-3.5 rounded-lg bg-[#161e29]/70 border border-[#212c3d] grid grid-cols-2 gap-3 font-mono">
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Username</span>
                <span className="text-[#38bdf8] font-bold text-[12px]">{selectedUser.username}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Status</span>
                <div className="mt-0.5"><StatusBadge status={selectedUser.status} /></div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Email Address</span>
                <span className="text-[#e2e8f0] text-[11px]">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Assigned Role</span>
                <span className="text-[#7bdb80] font-bold">{selectedUser.role}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Organization</span>
                <span className="text-[#e2e8f0] font-sans">{selectedUser.organization}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">MFA Mechanism</span>
                <span className="text-[#38bdf8] text-[11px]">{selectedUser.mfaType}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase font-semibold block">
                Authorized CSE Supervisory Scopes
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {selectedUser.cseScope.map(cse => (
                  <span key={cse} className="px-2 py-0.5 rounded bg-[#161e29] border border-[#212c3d] text-[#e2e8f0]">
                    {cse}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase font-semibold block">
                Enclave Cryptographic Permissions ({selectedUser.permissions.length})
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                {selectedUser.permissions.map(perm => (
                  <div key={perm} className="p-2 rounded bg-[#161e29]/70 border border-[#212c3d] text-[#7bdb80] flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-[#7bdb80]" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* DRAWER 3: ROLE PERMISSIONS DRAWER (Administration)                        */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        title={selectedRole ? `Role Specification: ${selectedRole.roleName}` : 'Role Specification'}
        subtitle={selectedRole ? `ID: ${selectedRole.id} • ${selectedRole.userCount} Assigned Operators` : ''}
        width="md"
      >
        {selectedRole && (
          <div className="space-y-4 text-[12px]">
            <div className="p-3.5 rounded-lg bg-[#161e29] border border-[#212c3d] space-y-1">
              <span className="text-[10px] font-mono text-[#64748b] uppercase block">Role Description</span>
              <p className="text-[#e2e8f0] text-[12px] leading-relaxed font-sans">{selectedRole.description}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#161e29]/70 border border-[#212c3d] space-y-1 font-mono">
              <span className="text-[10px] text-[#64748b] uppercase block">Jurisdictional Scope</span>
              <span className="text-[#38bdf8] font-medium">{selectedRole.accessScope}</span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase font-semibold block">
                Authorized Capabilities ({selectedRole.permissions.length})
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                {selectedRole.permissions.map(perm => (
                  <div key={perm} className="p-2 rounded bg-[#111622] border border-[#212c3d] text-[#7bdb80] flex items-center justify-between">
                    <span>{perm}</span>
                    <span className="text-[10px] text-[#64748b]">FIPS Enforced</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* DRAWER 4: CONTROL DETAIL DRAWER (Section 10 & 11)                         */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!selectedControl}
        onClose={() => setSelectedControl(null)}
        title={selectedControl ? `${selectedControl.id}: ${selectedControl.name}` : 'Control Standard'}
        subtitle={selectedControl ? `${selectedControl.domain} • Standard Version ${selectedControl.version}` : ''}
        width="md"
      >
        {selectedControl && (
          <div className="space-y-5 text-[12px]">
            {/* Metadata Grid */}
            <div className="p-3.5 rounded-lg bg-[#161e29]/70 border border-[#212c3d] grid grid-cols-2 gap-3 font-mono">
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Control ID</span>
                <span className="text-[#38bdf8] font-bold text-[13px]">{selectedControl.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Status</span>
                <div className="mt-0.5"><StatusBadge status={selectedControl.status} /></div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Domain</span>
                <span className="text-[#e2e8f0] font-sans">{selectedControl.domain}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Current Version</span>
                <span className="text-[#7bdb80] font-bold">{selectedControl.version}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Applicability</span>
                <span className="text-[#e2e8f0]">{selectedControl.applicability}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Last Updated</span>
                <span className="text-[#e2e8f0]">{selectedControl.lastUpdated}</span>
              </div>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-1">
              <span className="text-[10px] font-mono text-[#94a3b8] uppercase font-semibold block">
                Standard Requirement Summary:
              </span>
              <p className="text-[#e2e8f0] text-[12px] leading-relaxed">
                {selectedControl.description}
              </p>
            </div>

            {/* Connection to Assessment Workflow & Expected vs Observed (Section 11) */}
            <div className="space-y-3 p-3.5 rounded-lg bg-[#161e29]/50 border border-[#212c3d]">
              <span className="text-[11px] font-mono text-[#38bdf8] uppercase font-bold flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Assessment Workflow &amp; Expected Baseline Architecture
              </span>

              <div className="space-y-2 text-[12px]">
                <div className="p-2.5 rounded bg-[#111622] border border-[#212c3d]">
                  <span className="text-[10px] font-mono text-[#7bdb80] uppercase font-bold block">
                    Expected Capability (Model Standard):
                  </span>
                  <p className="text-[#e2e8f0] mt-0.5">{selectedControl.expectedCapability}</p>
                </div>

                <div className="p-2.5 rounded bg-[#111622] border border-[#212c3d]">
                  <span className="text-[10px] font-mono text-[#38bdf8] uppercase font-bold block">
                    Expected Ingestion Evidence (OCSF Telemetry):
                  </span>
                  <p className="text-[#e2e8f0] mt-0.5">{selectedControl.expectedEvidence}</p>
                </div>

                <div className="p-2.5 rounded bg-[#111622] border border-[#212c3d]">
                  <span className="text-[10px] font-mono text-amber-300 uppercase font-bold block">
                    Assessment Evaluation Criteria:
                  </span>
                  <p className="text-[#e2e8f0] mt-0.5">{selectedControl.assessmentCriteria}</p>
                </div>
              </div>
            </div>

            {/* Related Rules & Findings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] space-y-1.5">
                <span className="text-[10px] font-mono text-[#94a3b8] uppercase font-semibold block">
                  Related Rules ({selectedControl.relatedRules.length})
                </span>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  {selectedControl.relatedRules.map(r => (
                    <span key={r} className="px-1.5 py-0.5 rounded bg-[#161e29] text-[#afc6ff] border border-[#212c3d]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] space-y-1.5">
                <span className="text-[10px] font-mono text-[#94a3b8] uppercase font-semibold block">
                  Related Findings ({selectedControl.relatedFindings.length})
                </span>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  {selectedControl.relatedFindings.map(fId => (
                    <Link
                      key={fId}
                      to={`/review/${fId}`}
                      className="px-1.5 py-0.5 rounded bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 hover:underline flex items-center gap-1"
                    >
                      <span>{fId}</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Version History (Section 12) */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase font-semibold block">
                Standard Version History
              </span>
              <div className="space-y-1.5">
                {selectedControl.versionHistory.map(vh => (
                  <div
                    key={vh.version}
                    className={`p-2.5 rounded-lg border text-[11px] flex items-center justify-between ${
                      vh.active
                        ? 'bg-[#161e29] border-[#38bdf8]/40 text-[#e2e8f0]'
                        : 'bg-[#111622] border-[#212c3d] text-[#64748b]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className={`font-bold ${vh.active ? 'text-[#7bdb80]' : 'text-[#64748b]'}`}>
                          {vh.version}
                        </span>
                        <span>•</span>
                        <span>Released: {vh.releaseDate}</span>
                        {vh.active && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#7bdb80]/15 text-[#7bdb80]">
                            ACTIVE BASELINE
                          </span>
                        )}
                      </div>
                      <span className="text-[#94a3b8] text-[10px] mt-0.5 block">{vh.changes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* DRAWER 5: SYSTEM VERSION DETAIL DRAWER (Section 14)                       */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!selectedVersion}
        onClose={() => setSelectedVersion(null)}
        title={selectedVersion ? `${selectedVersion.component} (${selectedVersion.version})` : 'Component Version'}
        subtitle={selectedVersion ? `Type: ${selectedVersion.type} • Status: ${selectedVersion.status}` : ''}
        width="md"
      >
        {selectedVersion && (
          <div className="space-y-4 text-[12px]">
            {/* Reproducibility Context Callout (Section 14) */}
            <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/30 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed text-[#94a3b8]">
                <strong className="text-[#e2e8f0] font-mono uppercase">Finding Reproducibility Guarantee:</strong> Every supervisory assessment and finding records the exact cryptographic digest of this component version at runtime, ensuring mathematical reproducibility during subsequent regulatory inquiries.
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="p-3.5 rounded-lg bg-[#161e29]/70 border border-[#212c3d] grid grid-cols-2 gap-3 font-mono">
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Component</span>
                <span className="text-[#38bdf8] font-bold text-[12px]">{selectedVersion.component}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Version</span>
                <span className="text-[#7bdb80] font-bold text-[12px]">{selectedVersion.version}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Component Type</span>
                <span className="text-[#e2e8f0]">{selectedVersion.type}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Status</span>
                <div className="mt-0.5"><StatusBadge status={selectedVersion.status} /></div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Release Date</span>
                <span className="text-[#e2e8f0]">{selectedVersion.released}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Active Horizon</span>
                <span className="text-[#e2e8f0]">{selectedVersion.activeSince}</span>
              </div>
            </div>

            {/* Description & Change Summary */}
            <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-2">
              <div>
                <span className="text-[10px] font-mono text-[#94a3b8] uppercase font-semibold block">Description:</span>
                <p className="text-[#e2e8f0] mt-0.5">{selectedVersion.description}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#94a3b8] uppercase font-semibold block">Change Summary:</span>
                <p className="text-[#94a3b8] text-[11px] mt-0.5">{selectedVersion.changeSummary}</p>
              </div>
            </div>

            {/* Dependencies & Integrations */}
            <div className="p-3.5 rounded-lg bg-[#161e29]/50 border border-[#212c3d] space-y-1.5 font-mono">
              <span className="text-[10px] text-[#64748b] uppercase block">Enclave Dependencies:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedVersion.dependencies.map(dep => (
                  <span key={dep} className="px-2 py-0.5 rounded bg-[#111622] border border-[#212c3d] text-[#e2e8f0] text-[11px]">
                    {dep}
                  </span>
                ))}
              </div>
            </div>

            {/* Cryptographic Hash Signature */}
            <div className="p-3 rounded-lg bg-[#161e29]/70 border border-[#212c3d] flex items-center justify-between font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7bdb80]" />
                <span className="text-[#94a3b8]">Digest:</span>
                <span className="text-[#7bdb80] truncate max-w-[210px]">{selectedVersion.hashSignature}</span>
              </div>
              <button
                onClick={() => copyToClipboard(selectedVersion.hashSignature)}
                className="text-[#94a3b8] hover:text-[#e2e8f0]"
                title="Copy digest"
              >
                {copiedText === selectedVersion.hashSignature ? (
                  <Check className="w-3.5 h-3.5 text-[#7bdb80]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* MODAL: EDIT ACCESS SIMULATION                                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!editAccessUser}
        onClose={() => setEditAccessUser(null)}
        title={editAccessUser ? `Modify Access Grants: ${editAccessUser.name}` : 'Modify Access'}
        description="Simulate modification of operator role and supervised entity jurisdictional scopes."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditAccessUser(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditAccessUser(null);
              }}
            >
              Commit Grants
            </Button>
          </>
        }
      >
        {editAccessUser && (
          <div className="space-y-3 text-[12px]">
            <div>
              <label className="text-[11px] font-mono text-[#94a3b8] uppercase block mb-1">
                Assigned Supervisory Role:
              </label>
              <Select
                sizeVariant="sm"
                value={editAccessUser.role}
                onChange={() => {}}
                options={[
                  { value: 'SUPERVISOR', label: 'Supervisor' },
                  { value: 'LEAD_EXAMINER', label: 'Lead Examiner' },
                  { value: 'EXAMINER', label: 'Examiner' },
                  { value: 'AUDITOR', label: 'Auditor' },
                  { value: 'ADMINISTRATOR', label: 'Administrator' }
                ]}
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#94a3b8] uppercase block mb-1">
                Jurisdictional Entity Scope:
              </label>
              <div className="p-2.5 rounded bg-[#161e29] border border-[#212c3d] font-mono text-[11px] space-y-1.5">
                {cses.map(cse => (
                  <label key={cse.cseId} className="flex items-center gap-2 cursor-pointer text-[#e2e8f0]">
                    <input
                      type="checkbox"
                      defaultChecked={editAccessUser.cseScope.includes('ALL_ENTITIES') || editAccessUser.cseScope.includes(cse.cseId)}
                      className="rounded border-[#212c3d] text-[#38bdf8] focus:ring-0"
                    />
                    <span>{cse.cseId} — {cse.cseName}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#161e29] border border-[#212c3d] text-[11px] text-[#94a3b8]">
              Dual-Authorization Requirement: Access grant modifications are committed to the immutable audit ledger with FIPS-140-2 Level 3 signature.
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};
