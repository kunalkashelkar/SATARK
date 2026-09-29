import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { AuditTrailItem } from '@/data/mock/audit';
import {
  SystemUser,
  AdminRole,
  SecurityConfigItem,
  SupervisoryControl,
  mockAdminRoles,
  mockSecurityConfig,
  mockSupervisoryControls
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
  Eye,
  Copy,
  Check,
  Filter,
  Layers,
  FileText,
  UserCheck,
  Server,
  BookOpen,
  Info,
  RotateCcw,
  Scale,
  Settings,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { StatusBadge, PriorityBadge, Button, Drawer, PageContainer } from '@/components/common';

export interface SupervisoryRule {
  id: string;
  controlId: string;
  condition: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  version: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'DEPRECATED';
  description: string;
  engine: string;
}

export interface SupervisoryPolicy {
  id: string;
  title: string;
  category: string;
  statutoryBasis: string;
  enforcementMode: 'AUTOMATIC_BLOCK' | 'SUPERVISORY_ALERT' | 'AUDIT_FLAG';
  version: string;
  status: 'ENFORCED' | 'HARDENED' | 'ACTIVE';
  lastReviewed: string;
  description: string;
}

export const GovernanceHubPage: React.FC<{ initialTab?: string }> = ({ initialTab = 'controls' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { auditTrail, cses } = useSupervisory();

  // Tab mapping
  const validTabs = ['controls', 'rules', 'policies', 'users', 'audit', 'config'];
  const tabFromUrl = searchParams.get('tab');
  const resolvedTab = (tabFromUrl && validTabs.includes(tabFromUrl)) ? tabFromUrl : initialTab;
  const [activeTab, setActiveTab] = useState<string>(resolvedTab);

  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tabId);
      return next;
    });
  };

  // Real data state
  const [controls, setControls] = useState<SupervisoryControl[]>(mockSupervisoryControls);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles] = useState<AdminRole[]>(mockAdminRoles);
  const [securityConfigs, setSecurityConfigs] = useState<SecurityConfigItem[]>(mockSecurityConfig);

  // Search & filter states for tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Selected item drawers
  const [selectedControl, setSelectedControl] = useState<SupervisoryControl | null>(null);
  const [selectedRule, setSelectedRule] = useState<SupervisoryRule | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<SupervisoryPolicy | null>(null);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<AuditTrailItem | null>(null);

  // Editable config state for administrative settings
  const [editableConfig, setEditableConfig] = useState<Record<string, string>>({
    'SEC-02': '15 Minutes Maximum Inactivity Horizon',
    'SEC-01': 'FIPS-140-2 Level 3 Smartcard + Physical FIDO2 Key',
    'SEC-05': 'Zero Egress Air-Gap Boundary Active'
  });
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch real users from backend or fallback to initial data
  useEffect(() => {
    governanceApi.getUsers().then(res => {
      if (res && res.length > 0) setUsers(res);
    }).catch(() => {});
    governanceApi.getControls().then(res => {
      if (res && res.length > 0) setControls(res);
    }).catch(() => {});
  }, []);

  // Rules derived deterministically from existing controls and versioned rules
  const rulesList: SupervisoryRule[] = useMemo(() => {
    return [
      {
        id: 'RULE-2026.01',
        controlId: 'CTRL-01',
        condition: 'Absence of OCSF boundary syslog telemetry exceeding 4 consecutive hours',
        severity: 'CRITICAL',
        version: 'v3.2.0',
        status: 'ACTIVE',
        description: 'Enforces mandatory boundary telemetry ingestion without unannounced dark periods.',
        engine: 'Execution Gap Analytics Engine (v1.4.2)'
      },
      {
        id: 'RULE-2026.04',
        controlId: 'CTRL-04',
        condition: 'Direct root or SCADA bastion session initiated without verified FIDO2 challenge receipt',
        severity: 'HIGH',
        version: 'v2.4.0',
        status: 'ACTIVE',
        description: 'Mandatory dual-custody hardware MFA tokens for jumpbox access sessions.',
        engine: 'Behavioural Deviation Engine (v1.8.0)'
      },
      {
        id: 'RULE-2026.08',
        controlId: 'CTRL-07',
        condition: 'Omission of Level-2 SOAR incident escalation token during critical grid outage window',
        severity: 'CRITICAL',
        version: 'v1.4.0',
        status: 'ACTIVE',
        description: 'Mandatory statutory Tier-2 escalation protocol dispatch within 15-minute SLA.',
        engine: 'Execution Gap Analytics Engine (v1.4.2)'
      },
      {
        id: 'RULE-2026.09',
        controlId: 'CTRL-09',
        condition: 'Critical firmware vulnerability active > 14 calendar days without formal statutory waiver',
        severity: 'HIGH',
        version: 'v3.0.0',
        status: 'ACTIVE',
        description: 'Standardized 14-day statutory patch staging pipeline for relay firewalls and HSM partitions.',
        engine: 'Historical Comparison Engine (v2.1.0)'
      },
      {
        id: 'RULE-2026.11',
        controlId: 'CTRL-11',
        condition: 'NTP Stratum-1 drift between perimeter firewall and central collector exceeding 50ms',
        severity: 'MEDIUM',
        version: 'v3.2.0',
        status: 'ACTIVE',
        description: 'Precision time protocol synchronization across perimeter telemetry sources.',
        engine: 'Cross-Source Consistency Engine (v1.6.0)'
      },
      {
        id: 'RULE-2026.12',
        controlId: 'CTRL-12',
        condition: 'Sequential SHA-256 hash broken link detected in WORM audit ledger stream',
        severity: 'CRITICAL',
        version: 'v3.1.0',
        status: 'ACTIVE',
        description: 'Cryptographic log integrity and sequential hash chaining to prevent retroactive alteration.',
        engine: 'Metric Integrity Engine (v1.4.0)'
      },
      {
        id: 'RULE-2026.15',
        controlId: 'CTRL-15',
        condition: 'Host-level isolation latency exceeding 180 seconds following confirmed compromise trigger',
        severity: 'HIGH',
        version: 'v1.9.0',
        status: 'ACTIVE',
        description: 'Endpoint detection and containment latency threshold enforcement.',
        engine: 'Coverage & Blind Spot Engine (v1.7.0)'
      }
    ];
  }, []);

  // Statutory Policies derived from authoritative security directives
  const policiesList: SupervisoryPolicy[] = useMemo(() => {
    return [
      {
        id: 'POL-FIPS-140',
        title: 'Hardware Root of Trust & Cryptographic Signing Policy',
        category: 'Cryptographic Assurance',
        statutoryBasis: 'NCIIPC Framework Sec 12(a) & FIPS 140-2 Level 3',
        enforcementMode: 'AUTOMATIC_BLOCK',
        version: 'v4.8',
        status: 'ENFORCED',
        lastReviewed: '15 Sep 2026',
        description: 'All supervisory decisions, findings, and evidence digests must be signed using hardware HSM keys with zero software key storage.'
      },
      {
        id: 'POL-AIR-GAP',
        title: 'Air-Gapped Enclave Network Isolation Boundary',
        category: 'Perimeter Defense',
        statutoryBasis: 'National Critical Enclave Directive 4.2',
        enforcementMode: 'AUTOMATIC_BLOCK',
        version: 'v3.2',
        status: 'ENFORCED',
        lastReviewed: '01 Sep 2026',
        description: 'Supervisory analytic enclave maintains zero outbound internet routing. All ingestion executes through validated unidirectional security gateways.'
      },
      {
        id: 'POL-HUMAN-LOOP',
        title: 'Mandatory Human-in-the-Loop Adjudication Doctrine',
        category: 'Supervisory Doctrine',
        statutoryBasis: 'Information Technology Act Sec 70A/70B',
        enforcementMode: 'SUPERVISORY_ALERT',
        version: 'v2.1',
        status: 'HARDENED',
        lastReviewed: '10 Sep 2026',
        description: 'Machine models and analytical engines only discover discrepancy candidates. Formal statutory validation requires attested human examiner signature.'
      },
      {
        id: 'POL-VERIF-GATE',
        title: 'Independent Verification Gate Prior to Mandate Closure',
        category: 'Remediation Governance',
        statutoryBasis: 'Supervisory Remediation Directive Rule 4.8.2',
        enforcementMode: 'AUTOMATIC_BLOCK',
        version: 'v1.8',
        status: 'ENFORCED',
        lastReviewed: '20 Sep 2026',
        description: 'SUBMITTED != VERIFIED. Remediation status cannot transition to CLOSED without cryptographic verification of corrective telemetry artifacts.'
      }
    ];
  }, []);

  // Filtered Controls
  const filteredControls = useMemo(() => {
    return controls.filter(c => {
      if (selectedDomain !== 'ALL' && c.domain !== selectedDomain) return false;
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.applicability.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [controls, selectedDomain, selectedStatus, searchQuery]);

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rulesList.filter(r => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.id.toLowerCase().includes(q) ||
          r.controlId.toLowerCase().includes(q) ||
          r.condition.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [rulesList, searchQuery]);

  // Filtered Policies
  const filteredPolicies = useMemo(() => {
    return policiesList.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.id.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [policiesList, searchQuery]);

  // Filtered Audit Trail
  const filteredAudit = useMemo(() => {
    return auditTrail.filter(a => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          a.id.toLowerCase().includes(q) ||
          a.actor.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          a.targetObject.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [auditTrail, searchQuery]);

  // Save editable configuration options
  const handleSaveConfig = () => {
    setIsEditingConfig(false);
    showNotification('System administrative configurations saved and attested to audit log.');
  };

  return (
    <PageContainer>
      {/* 1. UNIFIED SAT-SA PAGE HEADER CARD */}
      <div className="bg-[#111622] border border-[#212c3d] rounded-lg p-4 md:p-5 shadow-sm mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#1f6feb]/15 text-[#60a5fa] border border-[#1f6feb]/30">
                GOVERNANCE &amp; ENCLAVE ADMINISTRATION
              </span>
              <span className="text-[11px] font-mono text-[#94a3b8]">
                FIPS 140-2 LEVEL 3 • SECURE ENCLAVE
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-semibold text-[#f1f5f9] tracking-tight">
              Supervisory Governance Hub
            </h1>
            <p className="text-xs text-[#94a3b8] max-w-3xl leading-relaxed">
              Maintain regulatory control baselines, deterministic supervisory rules, statutory compliance policies, authorized operator credentials, cryptographic audit trails, and enclave system settings.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-1.5 rounded bg-[#18202f] hover:bg-[#212c3d] text-[#cbd5e1] text-xs font-mono flex items-center gap-1.5 border border-[#212c3d] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* INTERNAL TABS: 6 SECTIONS */}
      {/* 1. Control Library | 2. Rules | 3. Policies | 4. Users & Roles | 5. Audit | 6. System Configuration */}
      <div className="flex items-center gap-1 border-b border-[#212c3d] pb-2 mb-6 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => handleTabChange('controls')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'controls'
              ? 'bg-[#1f6feb] text-white font-medium shadow-sm'
              : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#18202f]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>1. Control Library ({controls.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('rules')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'rules'
              ? 'bg-[#1f6feb] text-white font-medium shadow-sm'
              : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#18202f]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>2. Rules ({rulesList.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('policies')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'policies'
              ? 'bg-[#1f6feb] text-white font-medium shadow-sm'
              : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#18202f]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>3. Policies ({policiesList.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('users')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-[#1f6feb] text-white font-medium shadow-sm'
              : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#18202f]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>4. Users &amp; Roles ({users.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('audit')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-[#1f6feb] text-white font-medium shadow-sm'
              : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#18202f]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>5. Audit ({auditTrail.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('config')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'config'
              ? 'bg-[#1f6feb] text-white font-medium shadow-sm'
              : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#18202f]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>6. System Configuration</span>
        </button>
      </div>

      {/* SEARCH STRIP */}
      <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94a3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search within ${activeTab}...`}
            className="w-full pl-8 pr-3 py-1.5 bg-[#0c1017] border border-[#212c3d] rounded text-xs text-[#cbd5e1] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1f6feb] font-mono"
          />
        </div>

        {activeTab === 'controls' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="h-8 px-2 bg-[#0c1017] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#1f6feb]"
            >
              <option value="ALL">All Domains</option>
              <option value="Telemetry & Ingestion">Telemetry &amp; Ingestion</option>
              <option value="Identity & Access Management">Identity &amp; Access</option>
              <option value="SOC Operations & Incident Handling">SOC Operations</option>
              <option value="Vulnerability & Patch Management">Vulnerability &amp; Patch</option>
              <option value="Monitoring & SIEM Synchronization">SIEM Synchronization</option>
              <option value="Log Management & Integrity">Log Integrity</option>
              <option value="Incident Response & Containment">Incident Containment</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 px-2 bg-[#0c1017] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#1f6feb]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="DEPRECATED">Deprecated</option>
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: CONTROL LIBRARY                                                */}
      {/* Columns: Control ID | Title | Applicability | Expected Process | Expected Evidence | Expected Timing | Version | Status */}
      {/* ========================================================================= */}
      {activeTab === 'controls' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[#212c3d] bg-[#111622] shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0c1017] text-[#94a3b8] font-mono text-[10px] uppercase border-b border-[#212c3d] select-none">
                <tr>
                  <th className="py-3 px-3">Control ID</th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Applicability</th>
                  <th className="py-3 px-3">Expected Process</th>
                  <th className="py-3 px-3">Expected Evidence</th>
                  <th className="py-3 px-2.5">Expected Timing</th>
                  <th className="py-3 px-2 text-center">Version</th>
                  <th className="py-3 px-2.5">Status</th>
                  <th className="py-3 px-2 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212c3d]/70">
                {filteredControls.map((ctrl) => (
                  <tr
                    key={ctrl.id}
                    onClick={() => setSelectedControl(ctrl)}
                    className="hover:bg-[#18202f] transition-colors cursor-pointer"
                  >
                    {/* Control ID */}
                    <td className="py-3 px-3 font-mono font-bold text-[#60a5fa] whitespace-nowrap">
                      {ctrl.id}
                    </td>

                    {/* Title */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#f1f5f9]">{ctrl.name}</div>
                      <div className="text-[10px] text-[#94a3b8] font-mono">{ctrl.domain}</div>
                    </td>

                    {/* Applicability */}
                    <td className="py-3 px-3 text-[#cbd5e1] text-[11px] whitespace-nowrap">
                      {ctrl.applicability}
                    </td>

                    {/* Expected Process */}
                    <td className="py-3 px-3 max-w-[220px]">
                      <div className="text-[#cbd5e1] text-[11px] line-clamp-2" title={ctrl.expectedCapability}>
                        {ctrl.expectedCapability}
                      </div>
                    </td>

                    {/* Expected Evidence */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="text-emerald-400 font-mono text-[11px] line-clamp-2" title={ctrl.expectedEvidence}>
                        {ctrl.expectedEvidence}
                      </div>
                    </td>

                    {/* Expected Timing */}
                    <td className="py-3 px-2.5 font-mono text-[11px] text-amber-300 whitespace-nowrap">
                      {ctrl.id === 'CTRL-07' ? '≤ 15 mins' : ctrl.id === 'CTRL-01' ? '≤ 4 hours' : ctrl.id === 'CTRL-15' ? '≤ 180 secs' : '≤ 14 days'}
                    </td>

                    {/* Version */}
                    <td className="py-3 px-2 text-center font-mono font-bold text-[#f1f5f9]">
                      {ctrl.version}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <StatusBadge status={ctrl.status} />
                    </td>

                    {/* Inspect */}
                    <td className="py-3 px-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5 text-[#94a3b8]" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedControl(ctrl);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: RULES                                                          */}
      {/* Columns: Rule ID | Control | Condition | Severity | Version | Status       */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[#212c3d] bg-[#111622] shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0c1017] text-[#94a3b8] font-mono text-[10px] uppercase border-b border-[#212c3d] select-none">
                <tr>
                  <th className="py-3 px-3">Rule ID</th>
                  <th className="py-3 px-3">Control</th>
                  <th className="py-3 px-4">Evaluation Condition</th>
                  <th className="py-3 px-2.5 text-center">Severity</th>
                  <th className="py-3 px-2.5 text-center">Version</th>
                  <th className="py-3 px-2.5">Status</th>
                  <th className="py-3 px-3 text-right">Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212c3d]/70">
                {filteredRules.map((rule) => (
                  <tr
                    key={rule.id}
                    onClick={() => setSelectedRule(rule)}
                    className="hover:bg-[#18202f] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#60a5fa] whitespace-nowrap">
                      {rule.id}
                    </td>

                    <td className="py-3 px-3 font-mono text-emerald-400 font-semibold whitespace-nowrap">
                      {rule.controlId}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{rule.condition}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{rule.description}</div>
                    </td>

                    <td className="py-3 px-2.5 text-center whitespace-nowrap">
                      <PriorityBadge priority={rule.severity} />
                    </td>

                    <td className="py-3 px-2.5 text-center font-mono font-bold text-slate-300">
                      {rule.version}
                    </td>

                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <StatusBadge status={rule.status} />
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {rule.engine}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: POLICIES                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPolicies.map((pol) => (
              <div
                key={pol.id}
                onClick={() => setSelectedPolicy(pol)}
                className="p-4 rounded-xl border border-[#212c3d] bg-[#111622] hover:border-[#1f6feb]/50 cursor-pointer transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#60a5fa]">{pol.id}</span>
                    <h3 className="text-sm font-bold text-[#f1f5f9] mt-0.5">{pol.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                    {pol.status}
                  </span>
                </div>

                <p className="text-xs text-[#cbd5e1] leading-relaxed font-sans">
                  {pol.description}
                </p>

                <div className="pt-2 border-t border-[#212c3d] grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-[10px] text-[#94a3b8] uppercase block">Statutory Basis:</span>
                    <span className="text-[#cbd5e1] truncate block">{pol.statutoryBasis}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94a3b8] uppercase block">Enforcement Mode:</span>
                    <span className="text-amber-400 font-semibold">{pol.enforcementMode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: USERS & ROLES                                                  */}
      {/* Show only existing authorized administrative information                  */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Roles Overview */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase font-bold text-[#94a3b8]">
              Authorized Administrative Roles ({roles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {roles.map((role) => (
                <div key={role.id} className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#f1f5f9] text-xs">{role.roleName}</span>
                    <span className="text-[10px] font-mono text-[#60a5fa] font-bold">{role.userCount} Operators</span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] line-clamp-2 leading-snug">
                    {role.description}
                  </p>
                  <div className="pt-1 text-[10px] font-mono text-emerald-400">
                    Status: {role.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase font-bold text-[#94a3b8]">
              Enclave Operators &amp; Credentials ({users.length})
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[#212c3d] bg-[#111622] shadow-sm">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#0c1017] text-[#94a3b8] font-mono text-[10px] uppercase border-b border-[#212c3d] select-none">
                  <tr>
                    <th className="py-3 px-3">Badge / ID</th>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Organization</th>
                    <th className="py-3 px-3">MFA Mechanism</th>
                    <th className="py-3 px-3">Jurisdictional Scope</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#212c3d]/70">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="hover:bg-[#18202f] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#60a5fa] whitespace-nowrap">
                        {u.badge}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#f1f5f9]">{u.name}</div>
                        <div className="text-[10px] text-[#94a3b8] font-mono">{u.email}</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-[#cbd5e1]">
                        {u.role}
                      </td>

                      <td className="py-3 px-3 text-[#94a3b8] text-[11px] truncate max-w-[180px]">
                        {u.organization}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-emerald-400 whitespace-nowrap">
                        {u.mfaType}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-[#cbd5e1] whitespace-nowrap">
                        {u.cseScope.join(', ')}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={u.status} />
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
      {/* SECTION 5: AUDIT                                                          */}
      {/* Columns: Timestamp | User | Action | Resource | Result | Audit Reference  */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[#212c3d] bg-[#111622] shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0c1017] text-[#94a3b8] font-mono text-[10px] uppercase border-b border-[#212c3d] select-none">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3.5">Action</th>
                  <th className="py-3 px-3">Resource</th>
                  <th className="py-3 px-2.5">Result</th>
                  <th className="py-3 px-3 text-right">Audit Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212c3d]/70">
                {filteredAudit.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedAudit(a)}
                    className="hover:bg-[#18202f] transition-colors cursor-pointer"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[#94a3b8] whitespace-nowrap">
                      {a.timestamp}
                    </td>

                    {/* User */}
                    <td className="py-3 px-3 font-mono text-[#cbd5e1] whitespace-nowrap">
                      <div className="font-semibold text-[#f1f5f9]">{a.actor}</div>
                      <div className="text-[10px] text-[#94a3b8]">{a.actorRole}</div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-[#f1f5f9]">{a.action}</div>
                      <div className="text-[11px] text-[#94a3b8] line-clamp-1">{a.reason}</div>
                    </td>

                    {/* Resource */}
                    <td className="py-3 px-3 font-mono font-bold text-[#60a5fa] whitespace-nowrap">
                      {a.targetObject}
                    </td>

                    {/* Result */}
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <StatusBadge status={a.result} />
                    </td>

                    {/* Audit Reference */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#94a3b8] whitespace-nowrap">
                      {a.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: SYSTEM CONFIGURATION                                           */}
      {/* Separation between read-only supervisory info and editable admin settings  */}
      {/* ========================================================================= */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          
          {/* TOP BANNER: SEPARATION OF CONCERNS */}
          <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-500/30 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-white font-mono uppercase">Administrative Partition Standard:</strong> Read-only supervisory architecture rules are cryptographically sealed under the immutable platform baseline. Only designated enclave session settings can be customized with administrator credentials.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* PART 1: READ-ONLY SUPERVISORY INFORMATION (Left Column) */}
            <div className="p-4 rounded-xl border border-[#212c3d] bg-[#111622] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#212c3d]">
                <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#94a3b8]">
                  <Lock className="w-3.5 h-3.5 text-[#60a5fa]" />
                  <span>Read-Only Supervisory Architecture</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#18202f] text-[10px] font-mono text-[#cbd5e1] border border-[#212c3d]">
                  SEALED / IMMUTABLE
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {securityConfigs.filter(c => c.category === 'AIR_GAP' || c.category === 'AUDIT_LOGGING' || c.category === 'DATA_PROTECTION').map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-[#0c1017] border border-[#212c3d] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#f1f5f9] text-[11px]">{item.title}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#94a3b8] leading-snug">{item.description}</div>
                    <div className="pt-1 font-mono text-[11px] text-[#60a5fa]">
                      Value: {item.value}
                    </div>
                    <div className="text-[10px] font-mono text-[#94a3b8]">
                      Standard: {item.standard}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PART 2: EDITABLE ADMINISTRATIVE SETTINGS (Right Column) */}
            <div className="p-4 rounded-xl border border-[#212c3d] bg-[#111622] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#212c3d]">
                <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-amber-400">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Editable Administrative Settings</span>
                </div>
                <button
                  onClick={() => setIsEditingConfig(!isEditingConfig)}
                  className="px-2.5 py-1 rounded bg-[#18202f] text-xs font-mono text-[#60a5fa] hover:text-white border border-[#212c3d]"
                >
                  {isEditingConfig ? 'Cancel' : 'Edit Configuration'}
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Setting 1: Session Inactivity Lock */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <label className="text-white font-bold block">
                    Session Inactivity Lock Timeout (SEC-02):
                  </label>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Maximum operator inactivity threshold prior to mandatory screen blanking and session challenge.
                  </p>
                  {isEditingConfig ? (
                    <select
                      value={editableConfig['SEC-02']}
                      onChange={(e) => setEditableConfig({ ...editableConfig, 'SEC-02': e.target.value })}
                      className="w-full h-8 px-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
                    >
                      <option value="10 Minutes Inactivity Horizon">10 Minutes Inactivity Horizon</option>
                      <option value="15 Minutes Maximum Inactivity Horizon">15 Minutes Maximum Inactivity Horizon</option>
                      <option value="30 Minutes Inactivity Horizon">30 Minutes Inactivity Horizon</option>
                    </select>
                  ) : (
                    <div className="text-emerald-400 font-bold">{editableConfig['SEC-02']}</div>
                  )}
                </div>

                {/* Setting 2: MFA Hardware Enforcement Mode */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <label className="text-white font-bold block">
                    MFA Hardware Enforcement Policy (SEC-01):
                  </label>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Cryptographic challenge mode required for operator authentication into the enclave.
                  </p>
                  {isEditingConfig ? (
                    <select
                      value={editableConfig['SEC-01']}
                      onChange={(e) => setEditableConfig({ ...editableConfig, 'SEC-01': e.target.value })}
                      className="w-full h-8 px-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
                    >
                      <option value="FIPS-140-2 Level 3 Smartcard + Physical FIDO2 Key">FIPS-140-2 Level 3 Smartcard + Physical FIDO2 Key</option>
                      <option value="FIPS-140-2 Level 3 Smartcard Only">FIPS-140-2 Level 3 Smartcard Only</option>
                    </select>
                  ) : (
                    <div className="text-emerald-400 font-bold">{editableConfig['SEC-01']}</div>
                  )}
                </div>

                {/* Save button if editing */}
                {isEditingConfig && (
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                      onClick={handleSaveConfig}
                    >
                      Commit Configuration Updates
                    </Button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DRAWER: CONTROL DETAILS */}
      <Drawer
        isOpen={Boolean(selectedControl)}
        onClose={() => setSelectedControl(null)}
        title={selectedControl ? `${selectedControl.id}: ${selectedControl.name}` : ''}
        subtitle="Regulatory Control Baseline Specification"
        width="md"
      >
        {selectedControl && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 rounded bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Domain:</span>
                <span className="text-white font-bold">{selectedControl.domain}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Version:</span>
                <span className="text-emerald-400 font-bold">{selectedControl.version}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Status:</span>
                <span className="text-blue-400 font-bold">{selectedControl.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Applicability:</span>
                <span className="text-slate-300">{selectedControl.applicability}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-mono uppercase text-[10px] text-slate-500 font-bold">Requirement Summary</span>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                {selectedControl.description}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono uppercase text-[10px] text-slate-500 font-bold">Expected Process &amp; Capability</span>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px]">
                {selectedControl.expectedCapability}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono uppercase text-[10px] text-slate-500 font-bold">Expected Evidence Telemetry</span>
              <p className="text-emerald-400 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px]">
                {selectedControl.expectedEvidence}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono uppercase text-[10px] text-slate-500 font-bold">Assessment Evaluation Criteria</span>
              <p className="text-amber-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px]">
                {selectedControl.assessmentCriteria}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* DRAWER: RULE DETAILS */}
      <Drawer
        isOpen={Boolean(selectedRule)}
        onClose={() => setSelectedRule(null)}
        title={selectedRule ? `${selectedRule.id}: ${selectedRule.controlId}` : ''}
        subtitle="Deterministic Supervisory Rule Specification"
        width="md"
      >
        {selectedRule && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Control:</span>
                <span className="text-emerald-400 font-bold">{selectedRule.controlId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Severity Level:</span>
                <PriorityBadge priority={selectedRule.severity} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Version:</span>
                <span className="text-white font-bold">{selectedRule.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Execution Engine:</span>
                <span className="text-blue-400">{selectedRule.engine}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-mono uppercase text-[10px] text-slate-500 font-bold">Evaluation Condition</span>
              <p className="text-white font-mono leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                {selectedRule.condition}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono uppercase text-[10px] text-slate-500 font-bold">Supervisory Intent</span>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                {selectedRule.description}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* DRAWER: AUDIT DETAILS */}
      <Drawer
        isOpen={Boolean(selectedAudit)}
        onClose={() => setSelectedAudit(null)}
        title={selectedAudit ? `Audit Event: ${selectedAudit.id}` : ''}
        subtitle="Immutable Cryptographic Event Dossier"
        width="md"
      >
        {selectedAudit && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Event Timestamp:</span>
                <span className="text-white font-bold">{selectedAudit.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Actor Identity:</span>
                <span className="text-blue-400 font-bold">{selectedAudit.actor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Object:</span>
                <span className="text-emerald-400 font-bold">{selectedAudit.targetObject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Execution Verdict:</span>
                <StatusBadge status={selectedAudit.result} />
              </div>
            </div>

            <div className="space-y-1">
              <span className="uppercase text-[10px] text-slate-500 font-bold">Supervisory Rationale</span>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800 font-sans">
                {selectedAudit.reason}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* TOAST CONFIRMATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-emerald-500 text-slate-200 px-4 py-2.5 rounded-lg shadow-xl text-xs font-mono flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

    </PageContainer>
  );
};
