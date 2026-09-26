import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  ExternalLink, 
  Search, 
  Filter, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  AlertCircle, 
  ArrowUpRight, 
  TrendingUp, 
  Sliders, 
  ChevronRight,
  ChevronLeft,
  Calendar,
  Building,
  Upload,
  UserCheck,
  Send,
  HelpCircle,
  FileCode,
  FileCheck,
  Ban,
  Activity
} from 'lucide-react';

interface RemediationMandate {
  id: string;
  findingId: string;
  cseId: string;
  cseName: string;
  controlRef: string;
  mandateTitle: string;
  actionSummary: string;
  owner: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  dueDate: string;
  daysRemaining: number;
  evidenceProgress: string; // e.g. "2/3"
  status: 'OPEN' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_VERIFICATION' | 'CLOSED' | 'REOPENED';
  reopenReason?: string;
  artifacts: Array<{
    id: string;
    name: string;
    hash: string;
    status: 'PRESENT_VERIFIED' | 'MISSING_MANDATORY' | 'PENDING_INGESTION';
  }>;
  milestones: Array<{
    date: string;
    title: string;
    actor: string;
    detail: string;
    completed: boolean;
  }>;
}

const INITIAL_MANDATES: RemediationMandate[] = [
  {
    id: 'REM-0038',
    findingId: 'FND-0142',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    controlRef: 'CTRL-07 v3.2',
    mandateTitle: 'Undocumented Escalation Omission During Grid Outage Incident INV-338',
    actionSummary: 'Review CTRL-07 escalation workflow & submit cryptographic telemetry for INV-338 tier-2 dispatch.',
    owner: 'CSE-014 Evidence Team',
    priority: 'CRITICAL',
    dueDate: '04 Oct 2026',
    daysRemaining: 8,
    evidenceProgress: '2/3',
    status: 'OPEN',
    artifacts: [
      { id: 'EVD-742', name: 'Investigation Worklog (INV-338 Triage Runbook)', hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-761', name: 'Containment Firewall Push Logs (SCADA Boundary)', hash: 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2', status: 'PRESENT_VERIFIED' },
      { id: 'ESC-221', name: 'Tier-3 Escalation Dispatch Telemetry Packet', hash: 'PENDING_UPLOAD_HASH', status: 'MISSING_MANDATORY' }
    ],
    milestones: [
      { date: '26 Sep 2026 14:18 IST', title: 'Finding FND-0142 Synthesized', actor: 'SYS:SAT-FUSION', detail: 'Automated gap synthesis identified CTRL-07 breach.', completed: true },
      { date: '26 Sep 2026 14:20 IST', title: 'Remediation Mandate REM-0038 Instantiated', actor: 'NC-8802 (Lead Examiner)', detail: 'Lead Examiner validated mandate conditions.', completed: true },
      { date: '26 Sep 2026 14:22 IST', title: 'Assigned to CSE-014 Evidence Team', actor: 'NC-8802 (Lead Examiner)', detail: 'State set to OPEN with 8-day SLA horizon.', completed: true },
      { date: '27 Sep 2026 09:15 IST', title: 'Formal Evidence Demand for ESC-221 Dispatched', actor: 'NC-8802 (Lead Examiner)', detail: 'Demanded raw cryptographic dispatch payload.', completed: true },
      { date: '04 Oct 2026 23:59 IST', title: 'Statutory Response Deadline', actor: 'CSE-014 Compliance', detail: 'Mandatory CSE compliance boundary.', completed: false },
      { date: 'Pending Verification', title: 'Supervisory Verification & Final Enclave Seal', actor: 'Supervisory Board', detail: 'Formal sign-off logged with immutable audit hash.', completed: false }
    ]
  },
  {
    id: 'REM-0035',
    findingId: 'FND-0131',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    controlRef: 'CTRL-11',
    mandateTitle: 'SIEM Perimeter Log Synchronization Failure',
    actionSummary: 'Reconcile SOC perimeter firewall sync logs with NCIIPC baseline SIEM feeds.',
    owner: 'SOC Operations',
    priority: 'HIGH',
    dueDate: '30 Sep 2026',
    daysRemaining: 4,
    evidenceProgress: '2/3',
    status: 'UNDER_VERIFICATION',
    artifacts: [
      { id: 'EVD-688', name: 'NTP Synchronization Audit Feed', hash: '9b82109abcf1425e...7710a', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-689', name: 'Firewall Collector Syslog Export', hash: '5561a0918bca4401...8812f', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-690', name: 'Packet Integrity Attestation', hash: '12ef448102a01499...1192e', status: 'PENDING_INGESTION' }
    ],
    milestones: [
      { date: '22 Sep 2026 10:14 IST', title: 'Mandate Instantiated', actor: 'NC-8802', detail: 'Mandate issued following SIEM gap triage', completed: true },
      { date: '25 Sep 2026 16:30 IST', title: 'Telemetry Ingested by Entity', actor: 'CSE-014 SysAdmin', detail: 'First 2 packets signed and submitted', completed: true },
      { date: '26 Sep 2026 09:00 IST', title: 'Verification Cycle Started', actor: 'NC-4190 (Examiner)', detail: 'Cross-verifying clock offsets against telemetry', completed: true }
    ]
  },
  {
    id: 'REM-0029',
    findingId: 'FND-0118',
    cseId: 'CSE-021',
    cseName: 'TelcoGrid Telecom',
    controlRef: 'CTRL-04',
    mandateTitle: 'Privileged Access Bypass on Core IMS Gateway',
    actionSummary: 'Multi-factor authentication bypass verification on core gateway nodes.',
    owner: 'SOC Supervisor',
    priority: 'CRITICAL',
    dueDate: '18 Sep 2026',
    daysRemaining: -9,
    evidenceProgress: '3/3',
    status: 'CLOSED',
    artifacts: [
      { id: 'EVD-512', name: 'PAM Cluster Policy Diff v4.1', hash: '4f9910ae4481c002...9901b', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-513', name: 'RADIUS Authentication Audit Trail', hash: '09ab1209cc542911...4401c', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-514', name: 'Hardware Token Seed Attestation', hash: '881a4bca990013ef...2284d', status: 'PRESENT_VERIFIED' }
    ],
    milestones: [
      { date: '10 Sep 2026', title: 'Mandate Open', actor: 'NC-8802', detail: 'Triggered from PAM negative space deduction', completed: true },
      { date: '15 Sep 2026', title: 'Proof Submitted', actor: 'CSE-021 Team', detail: 'All hardware tokens and RADIUS logs submitted', completed: true },
      { date: '18 Sep 2026', title: 'Statutory Verification & Seal', actor: 'NC-8802 (Supervisory Board)', detail: 'Full conformance verified; closed with seal 0x33b8...10f4', completed: true }
    ]
  },
  {
    id: 'REM-0026',
    findingId: 'FND-0109',
    cseId: 'CSE-008',
    cseName: 'ReserveBank Interconnect',
    controlRef: 'CTRL-09',
    mandateTitle: 'Cryptographic Key Rotation Cadence Failure on HSM Batch Pipeline',
    actionSummary: 'Cryptographic key rotation cadence failure on HSM batch pipeline.',
    owner: 'Compliance Team',
    priority: 'MEDIUM',
    dueDate: '10 Sep 2026',
    daysRemaining: -17,
    evidenceProgress: '1/3',
    status: 'REOPENED',
    reopenReason: 'Submitted HSM logs omitted Master Key Derivation cycle. Verification rejected.',
    artifacts: [
      { id: 'EVD-401', name: 'HSM Partition Health Report', hash: 'e01a88b4491910ef...1133a', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-402', name: 'Master Key Derivation Cycle Sign-off', hash: 'UNAVAILABLE', status: 'MISSING_MANDATORY' },
      { id: 'EVD-403', name: 'Zeroization Procedure Test Trace', hash: 'UNAVAILABLE', status: 'MISSING_MANDATORY' }
    ],
    milestones: [
      { date: '28 Aug 2026', title: 'Mandate Created', actor: 'NC-8802', detail: 'Key rotation SLA lapsed by 45 days', completed: true },
      { date: '08 Sep 2026', title: 'Proof Rejected', actor: 'NC-4190 (Examiner)', detail: 'Omitted derivation logs', completed: true },
      { date: '10 Sep 2026', title: 'Mandate Reopened', actor: 'Supervisory Enclave', detail: 'Flagged deficient proof, SLA breached', completed: true }
    ]
  },
  {
    id: 'REM-0021',
    findingId: 'FND-0098',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    controlRef: 'CTRL-12',
    mandateTitle: 'SCADA Tele-measurement Boundary Telemetry Ingestion Failure',
    actionSummary: 'SCADA tele-measurement boundary verification telemetry ingestion failure.',
    owner: 'CSE-014 Evidence Team',
    priority: 'HIGH',
    dueDate: '22 Sep 2026',
    daysRemaining: -5,
    evidenceProgress: '2/2',
    status: 'CLOSED',
    artifacts: [
      { id: 'EVD-331', name: 'Modbus Protocol Telemetry Stream Signatures', hash: '77ac001928bc991a...3319f', status: 'PRESENT_VERIFIED' },
      { id: 'EVD-332', name: 'DNP3 Secure Authentication Session Logs', hash: 'aa1944ef00192bc9...8811d', status: 'PRESENT_VERIFIED' }
    ],
    milestones: [
      { date: '12 Sep 2026', title: 'Mandate Open', actor: 'NC-8802', detail: 'SCADA gateway drop noticed', completed: true },
      { date: '20 Sep 2026', title: 'Telemetry Re-ingested', actor: 'CSE-014 SysAdmin', detail: 'Backfilled 96 hours of lost telemetry', completed: true },
      { date: '22 Sep 2026', title: 'Closed & Sealed', actor: 'NC-8802', detail: 'Verification confirmed against RTU mirrors', completed: true }
    ]
  },
  {
    id: 'REM-0018',
    findingId: 'FND-0089',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    controlRef: 'CTRL-07 v3.2',
    mandateTitle: 'Investigation Queue Backlog Exceeding Statutory Standard',
    actionSummary: 'Investigation queue backlog exceeding statutory 4-hour assessment standard.',
    owner: 'SOC Operations',
    priority: 'CRITICAL',
    dueDate: '12 Sep 2026',
    daysRemaining: -15,
    evidenceProgress: '0/2',
    status: 'OPEN',
    artifacts: [
      { id: 'EVD-210', name: 'Queue Clearing Audit Trail', hash: 'UNAVAILABLE', status: 'MISSING_MANDATORY' },
      { id: 'EVD-211', name: 'Staffing Escalation Protocol Roster', hash: 'UNAVAILABLE', status: 'MISSING_MANDATORY' }
    ],
    milestones: [
      { date: '01 Sep 2026', title: 'Mandate Issued', actor: 'NC-8802', detail: 'Critical queue backlog breach', completed: true },
      { date: '12 Sep 2026', title: 'SLA Breached', actor: 'SYS:TIMELOCK', detail: 'Statutory deadline expired with zero submissions', completed: true }
    ]
  }
];

export const RemediationPage: React.FC = () => {
  const [mandates, setMandates] = useState<RemediationMandate[]>(INITIAL_MANDATES);
  const [selectedMandateId, setSelectedMandateId] = useState<string>('REM-0038');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCse, setSelectedCse] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeFilterPill, setActiveFilterPill] = useState<string>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showRecordResponseModal, setShowRecordResponseModal] = useState<boolean>(false);
  const [newMandateForm, setNewMandateForm] = useState({
    cseId: 'CSE-014',
    findingId: 'FND-0142',
    horizon: '7 Days',
    priority: 'CRITICAL' as const,
    protocol: ''
  });
  const [responseNotes, setResponseNotes] = useState<string>('');
  const [deliberationNote, setDeliberationNote] = useState<string>(
    'Awaiting tier-3 dispatch telemetry ESC-221 from CSE-014. Closure gate locked until cryptographic log submission confirmed.'
  );

  const selectedMandate = mandates.find(m => m.id === selectedMandateId) || mandates[0];

  const handleShowNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const filteredMandates = mandates.filter(m => {
    if (activeFilterPill === 'OPEN_ACTIVE' && !['OPEN', 'IN_PROGRESS', 'SUBMITTED'].includes(m.status)) return false;
    if (activeFilterPill === 'UNDER_VERIF' && m.status !== 'UNDER_VERIFICATION') return false;
    if (activeFilterPill === 'OVERDUE' && m.daysRemaining >= 0) return false;
    if (activeFilterPill === 'REOPENED' && m.status !== 'REOPENED') return false;

    if (selectedCse !== 'ALL' && m.cseId !== selectedCse) return false;
    if (selectedPriority !== 'ALL' && m.priority !== selectedPriority) return false;
    if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.id.toLowerCase().includes(q) ||
        m.findingId.toLowerCase().includes(q) ||
        m.cseId.toLowerCase().includes(q) ||
        m.mandateTitle.toLowerCase().includes(q) ||
        m.controlRef.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateMandate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRem: RemediationMandate = {
      id: `REM-${Math.floor(1000 + Math.random() * 9000)}`,
      findingId: newMandateForm.findingId,
      cseId: newMandateForm.cseId,
      cseName: newMandateForm.cseId === 'CSE-014' ? 'NorthGrid Energy' : 'TelcoGrid Telecom',
      controlRef: 'CTRL-07 v3.2',
      mandateTitle: `Directive issued for ${newMandateForm.findingId}`,
      actionSummary: newMandateForm.protocol || 'Review and submit cryptographic attestation.',
      owner: `${newMandateForm.cseId} Security Team`,
      priority: newMandateForm.priority,
      dueDate: '14 Oct 2026',
      daysRemaining: 14,
      evidenceProgress: '0/2',
      status: 'OPEN',
      artifacts: [
        { id: `EVD-${Math.floor(800 + Math.random() * 100)}`, name: 'Baseline Artifact', hash: 'PENDING', status: 'MISSING_MANDATORY' }
      ],
      milestones: [
        { date: 'Today', title: 'Mandate Created', actor: 'NC-8802 (Lead Examiner)', detail: 'Direct supervisory order enacted', completed: true }
      ]
    };

    setMandates([newRem, ...mandates]);
    setSelectedMandateId(newRem.id);
    setShowCreateModal(false);
    handleShowNotification(`Supervisory Mandate ${newRem.id} cryptographically registered and pushed to Enclave.`);
  };

  const handleMarkDeficient = () => {
    setMandates(prev => prev.map(m => {
      if (m.id === selectedMandateId) {
        return {
          ...m,
          status: 'REOPENED',
          reopenReason: deliberationNote || 'Supervisory rejection: insufficient evidence chain.'
        };
      }
      return m;
    }));
    handleShowNotification(`Mandate ${selectedMandateId} formally marked DEFICIENT and REOPENED.`);
  };

  const handleStartVerification = () => {
    setMandates(prev => prev.map(m => {
      if (m.id === selectedMandateId) {
        return { ...m, status: 'UNDER_VERIFICATION' };
      }
      return m;
    }));
    handleShowNotification(`Formal Supervisory Verification Pipeline Initiated for ${selectedMandateId}.`);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-950/95 border border-blue-500/40 text-blue-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="text-xs font-mono">{notification}</span>
          <button onClick={() => setNotification(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: HEADER & COMMAND BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-[#181c22] border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-800/60">
              Statutory Supervisory Lifecycle
            </span>
            <span className="text-xs font-mono text-slate-400">Section 15 • NCIIPC Rule 4.8.2</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            Remediation & Supervisory Mandates
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Supervisory oversight of corrective actions, mandatory evidence ingestion, and formal verification gates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/evidence"
            className="px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            Evidence Explorer
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all"
          >
            <FileCheck className="w-3.5 h-3.5" />
            + Create Remediation Mandate
          </button>
        </div>
      </div>

      {/* SECTION 2: 8-KPI METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {/* KPI 1 */}
        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Open</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="mt-1">
            <div className="text-xl font-bold text-slate-100">10</div>
            <div className="text-[10px] font-mono text-slate-400">Total Unresolved</div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">In Progress</span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          </div>
          <div className="mt-1">
            <div className="text-xl font-bold text-slate-100">4</div>
            <div className="text-[10px] font-mono text-slate-400">Active CSE SOC</div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Submitted</span>
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          </div>
          <div className="mt-1">
            <div className="text-xl font-bold text-slate-100">3</div>
            <div className="text-[10px] font-mono text-slate-400">CSE Ingested</div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Under Review</span>
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          </div>
          <div className="mt-1">
            <div className="text-xl font-bold text-purple-300">2</div>
            <div className="text-[10px] font-mono text-purple-400">Active Examiner</div>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Closed</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="mt-1">
            <div className="text-xl font-bold text-emerald-400">7</div>
            <div className="text-[10px] font-mono text-emerald-500">Verified & Sealed</div>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Reopened</span>
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
          </div>
          <div className="mt-1">
            <div className="text-xl font-bold text-amber-400">2</div>
            <div className="text-[10px] font-mono text-amber-500">Deficient Proof</div>
          </div>
        </div>

        {/* KPI 7 */}
        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Overdue</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="mt-1">
            <div className="text-xl font-bold text-rose-400">3</div>
            <div className="text-[10px] font-mono text-rose-500">SLA Breached</div>
          </div>
        </div>

        {/* KPI 8 */}
        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Awaiting EVD</span>
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
          </div>
          <div className="mt-1">
            <div className="text-xl font-bold text-slate-100">4</div>
            <div className="text-[10px] font-mono text-slate-400">Pending Ingestion</div>
          </div>
        </div>
      </div>

      {/* Telemetry Status Ribbon */}
      <div className="px-4 py-2 rounded-lg bg-[#10141a] border border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500">Supervisory Verification Rate:</span>
            <strong className="text-emerald-400 font-semibold">70.0%</strong>
          </span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500">Evidence Fulfillment Ratio:</span>
            <strong className="text-blue-400 font-semibold">67.4% (31/46 Artefacts)</strong>
          </span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500">Air-Gap Enclave Status:</span>
            <strong className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SYNCED (TLS 1.3 / FIPS-140-2 L3)
            </strong>
          </span>
        </div>
        <span className="text-slate-500">Node Checksum: 0x9AF8...204C</span>
      </div>

      {/* SECTION 3: STATUTORY LIFECYCLE GOVERNANCE MODEL */}
      <div className="p-4 rounded-lg bg-[#181c22] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Statutory Lifecycle Governance Model
            </span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Gate Enforcement: <span className="text-blue-400 font-semibold">STRICT</span> (Non-linear bypass locked)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {/* Stage 1 */}
          <div className="p-3 rounded bg-[#1c2026] border-t-2 border-blue-500 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-blue-400">
              <span>01. MANDATE OPEN</span>
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">Finding Synthesized</span>
            <span className="text-[11px] text-slate-400 leading-snug">
              Mandate emitted from verified gap or negative space signal.
            </span>
          </div>

          {/* Stage 2 */}
          <div className="p-3 rounded bg-[#1c2026] border-t-2 border-amber-500 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
              <span>02. IN PROGRESS</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">SOC Remediation Active</span>
            <span className="text-[11px] text-slate-400 leading-snug">
              Entity drafting protocols and gathering cryptographic evidence.
            </span>
          </div>

          {/* Stage 3 */}
          <div className="p-3 rounded bg-[#1c2026] border-t-2 border-blue-400 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-blue-300">
              <span>03. SUBMITTED</span>
              <Upload className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">Evidence Ingested</span>
            <span className="text-[11px] text-slate-400 leading-snug">
              Telemetry staged into the air-gapped supervisory enclave.
            </span>
          </div>

          {/* Stage 4 */}
          <div className="p-3 rounded bg-[#1c2026] border-t-2 border-purple-500 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-purple-400">
              <span>04. VERIFICATION</span>
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">Examiner Evaluation</span>
            <span className="text-[11px] text-slate-400 leading-snug">
              Process trace comparison & cryptological validation.
            </span>
          </div>

          {/* Stage 5 */}
          <div className="p-3 rounded bg-[#1c2026] border-t-2 border-emerald-500 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
              <span>05. CLOSED</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">Verified & Sealed</span>
            <span className="text-[11px] text-slate-400 leading-snug">
              Formal sign-off logged with immutable audit hash.
            </span>
          </div>
        </div>

        {/* Branching Callout for Reopened Loop */}
        <div className="p-2 rounded bg-[#10141a] border border-slate-800 flex items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-amber-400 font-semibold uppercase">Regression Loop:</span>
            <span>CLOSED → [REOPENED (Verification Deficient or Telemetry Disproved)] → IN PROGRESS. Remediation is revocable on recurring gaps.</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">Autonomous Rule: 4.8.2-REV</span>
        </div>
      </div>

      {/* SECTION 4: SEARCH & FILTER BAR */}
      <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search remediation ID, finding, CSE, control..."
              className="w-full pl-9 pr-3 py-1.5 rounded bg-[#10141a] border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="md:col-span-2">
            <select
              value={selectedCse}
              onChange={(e) => setSelectedCse(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#10141a] border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Supervised CSEs</option>
              <option value="CSE-014">CSE-014 (NorthGrid)</option>
              <option value="CSE-021">CSE-021 (TelcoGrid)</option>
              <option value="CSE-008">CSE-008 (BankReserve)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#10141a] border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Priority: All</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#10141a] border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Status: All</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_VERIFICATION">UNDER VERIFICATION</option>
              <option value="CLOSED">CLOSED</option>
              <option value="REOPENED">REOPENED</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center gap-1.5">
            <button
              onClick={() => {
                setSelectedCse('ALL');
                setSelectedPriority('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
                setActiveFilterPill('ALL');
              }}
              className="w-full py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] border border-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Quick View Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 pr-1 shrink-0">Views:</span>
          <button
            onClick={() => setActiveFilterPill('ALL')}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] whitespace-nowrap transition-colors ${
              activeFilterPill === 'ALL'
                ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 font-semibold'
                : 'bg-[#1c2026] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All ({mandates.length})
          </button>
          <button
            onClick={() => setActiveFilterPill('OPEN_ACTIVE')}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] whitespace-nowrap transition-colors ${
              activeFilterPill === 'OPEN_ACTIVE'
                ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 font-semibold'
                : 'bg-[#1c2026] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Open & Active (3)
          </button>
          <button
            onClick={() => setActiveFilterPill('UNDER_VERIF')}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeFilterPill === 'UNDER_VERIF'
                ? 'bg-purple-900/60 text-purple-200 border border-purple-700/60 font-semibold'
                : 'bg-[#1c2026] text-purple-400 hover:text-purple-200 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Under Verification (1)
          </button>
          <button
            onClick={() => setActiveFilterPill('OVERDUE')}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeFilterPill === 'OVERDUE'
                ? 'bg-rose-900/60 text-rose-200 border border-rose-700/60 font-semibold'
                : 'bg-[#1c2026] text-rose-400 hover:text-rose-200 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Overdue SLA (3)
          </button>
          <button
            onClick={() => setActiveFilterPill('REOPENED')}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] whitespace-nowrap transition-colors ${
              activeFilterPill === 'REOPENED'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-700/60 font-semibold'
                : 'bg-[#1c2026] text-amber-400 hover:text-amber-200 border border-slate-800'
            }`}
          >
            Reopened (1)
          </button>
          <span className="text-slate-600 px-1">|</span>
          <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
            Scope: <span className="text-slate-400">CTRL-07 Baseline Scope</span>
          </span>
        </div>
      </div>

      {/* SECTION 5 & 6: MAIN WORKSPACE (TABLE + SPLIT DETAIL DRAWER) */}
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* MAIN REMEDIATION TABLE */}
        <div className={`col-span-12 transition-all duration-200 ${drawerOpen ? 'xl:col-span-7' : 'xl:col-span-12'}`}>
          <div className="rounded-lg bg-[#181c22] border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-[#1c2026] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-100">Active Remediation Mandates</span>
                <span className="px-2 py-0.5 rounded bg-[#262a31] text-[10px] font-mono text-slate-300">
                  {filteredMandates.length} Displayed
                </span>
              </div>
              {!drawerOpen && (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="px-2.5 py-1 rounded bg-[#262a31] hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  Inspect Dossier
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#10141a] text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">REM ID</th>
                    <th className="py-2.5 px-3">Finding & CSE</th>
                    <th className="py-2.5 px-3">Control</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Corrective Mandate</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Statutory Due</th>
                    <th className="py-2.5 px-3">Evidence</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-body-sm">
                  {filteredMandates.map((m) => {
                    const isSelected = m.id === selectedMandateId;
                    return (
                      <tr
                        key={m.id}
                        onClick={() => {
                          setSelectedMandateId(m.id);
                          setDrawerOpen(true);
                        }}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-950/30 border-l-2 border-blue-400'
                            : 'hover:bg-[#1c2026]'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                          {m.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-medium text-slate-200">{m.findingId}</div>
                          <div className="text-[10px] text-slate-400 truncate">{m.cseName}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                          {m.controlRef}
                        </td>
                        <td className="py-3 px-3">
                          <div className="line-clamp-2 text-slate-200 text-xs">
                            {m.actionSummary}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Owner: {m.owner}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              m.priority === 'CRITICAL'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                                : m.priority === 'HIGH'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {m.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                          <div className="text-slate-300">{m.dueDate}</div>
                          <div
                            className={`text-[10px] font-semibold ${
                              m.daysRemaining < 0
                                ? 'text-rose-400'
                                : m.daysRemaining <= 4
                                ? 'text-amber-400'
                                : 'text-blue-400'
                            }`}
                          >
                            {m.daysRemaining < 0
                              ? `OVERDUE (+${Math.abs(m.daysRemaining)}d)`
                              : `${m.daysRemaining} Days Left`}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-[#1c2026] text-slate-300 border border-slate-700/60 font-mono text-[10px]">
                            {m.evidenceProgress}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              m.status === 'CLOSED'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                                : m.status === 'UNDER_VERIFICATION'
                                ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                                : m.status === 'REOPENED'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                                : m.status === 'SUBMITTED'
                                ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMandateId(m.id);
                              setDrawerOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-[#1c2026] hover:bg-slate-700 text-blue-400 text-[11px] font-mono transition-colors"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-3 bg-[#10141a] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Showing 1 - {filteredMandates.length} of {mandates.length} Mandates</span>
              <div className="flex items-center gap-1">
                <button disabled className="px-2 py-0.5 rounded bg-[#181c22] text-slate-600 cursor-not-allowed">
                  &lt; Prev
                </button>
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold">1</span>
                <button className="px-2 py-0.5 rounded bg-[#181c22] hover:bg-[#262a31] text-slate-300">
                  Next &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Analytical Velocity Sparkline Inset */}
          <div className="mt-4 p-4 rounded-lg bg-[#181c22] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                Supervisory Resolution Velocity (Trailing 8 Weeks)
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" /> +14.2% Closure Speed
              </span>
            </div>
            <div className="h-20 w-full flex items-end gap-1.5 pt-2">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-900/40 rounded-t h-10 hover:bg-blue-600 transition-colors" title="W1: 4 Mandates"></div>
                <span className="text-[10px] font-mono text-slate-500">W1</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-900/50 rounded-t h-12 hover:bg-blue-600 transition-colors" title="W2: 6 Mandates"></div>
                <span className="text-[10px] font-mono text-slate-500">W2</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-900/40 rounded-t h-8 hover:bg-blue-600 transition-colors" title="W3: 3 Mandates"></div>
                <span className="text-[10px] font-mono text-slate-500">W3</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-900/60 rounded-t h-14 hover:bg-blue-600 transition-colors" title="W4: 7 Mandates"></div>
                <span className="text-[10px] font-mono text-slate-500">W4</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-900/70 rounded-t h-16 hover:bg-blue-600 transition-colors" title="W5: 9 Mandates"></div>
                <span className="text-[10px] font-mono text-slate-500">W5</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-emerald-500 rounded-t h-20 hover:brightness-110 transition-colors" title="W6: 12 Mandates Verified"></div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">W6</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-900/70 rounded-t h-14 hover:bg-blue-600 transition-colors" title="W7: 8 Mandates"></div>
                <span className="text-[10px] font-mono text-slate-500">W7</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-purple-500 rounded-t h-16 hover:brightness-110 transition-colors" title="Current Week: Active Verification"></div>
                <span className="text-[10px] font-mono text-purple-400 font-bold">W8</span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAIL DRAWER / SPLIT WORKSPACE */}
        {drawerOpen && (
          <div className="col-span-12 xl:col-span-5 space-y-4">
            <div className="p-4 rounded-lg bg-[#181c22] border border-slate-800 space-y-4">
              {/* Header Bar of Detail Drawer */}
              <div className="space-y-1.5 pb-2 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold font-mono text-blue-400">{selectedMandate.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        selectedMandate.priority === 'CRITICAL'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {selectedMandate.priority} PRIORITY
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 text-[10px] font-mono">
                      {selectedMandate.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1 rounded hover:bg-[#262a31] text-slate-400 hover:text-slate-200"
                    title="Close Panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[11px] font-mono text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-slate-200 font-semibold">{selectedMandate.cseName} ({selectedMandate.cseId})</span>
                  <span>•</span>
                  <span>Control: {selectedMandate.controlRef}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">
                    Statutory Due: {selectedMandate.dueDate}
                  </span>
                </div>
              </div>

              {/* Synthesized Finding Context Card */}
              <div className="p-3 rounded bg-[#1c2026] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1 font-bold">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> Synthesized Finding Context
                  </span>
                  <Link
                    to={`/assessment/findings/${selectedMandate.findingId}`}
                    className="text-[11px] font-mono text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    Open {selectedMandate.findingId} <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="text-xs font-semibold text-slate-100">
                  {selectedMandate.findingId}: {selectedMandate.mandateTitle}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-blue-400 font-mono text-[10px]">
                    Primary: GAP-0071 (Execution Gap)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-purple-400 font-mono text-[10px]">
                    Supporting: NS-0041 (Negative Space)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-amber-400 font-mono text-[10px]">
                    Recurrence: Q2 2025, Q4 2025
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Mandatory SOC Tier-2 dispatched alert escalation was completely missing from SCADA ingress logs during critical fault INV-338. Expected escalation protocol per CTRL-07 was unexecuted.
                </p>
              </div>

              {/* Remediation Action Mandate */}
              <div className="p-3 rounded bg-[#1c2026] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    Remediation Action Mandate [{selectedMandate.id.replace('REM', 'ACT')}]
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    STATUTORY ARTICLE 19
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#10141a] border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-mono">
                  "{selectedMandate.actionSummary}"
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                  <span className="text-slate-400">Assigned: {selectedMandate.owner}</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Awaiting Cryptographic Fulfillment
                  </span>
                </div>
                <button
                  onClick={() => setShowRecordResponseModal(true)}
                  className="w-full mt-1 py-1.5 rounded bg-[#262a31] hover:bg-slate-700 text-blue-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  Record CSE Submission / Response
                </button>
              </div>

              {/* Remediation Evidence Ledger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Remediation Evidence Ledger</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedMandate.artifacts.filter(a => a.status === 'PRESENT_VERIFIED').length} / {selectedMandate.artifacts.length} Verified Artefacts
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedMandate.artifacts.map((art) => {
                    const isVerified = art.status === 'PRESENT_VERIFIED';
                    return (
                      <div
                        key={art.id}
                        className={`p-2.5 rounded border transition-colors ${
                          isVerified
                            ? 'bg-[#1c2026] border-slate-800'
                            : 'bg-rose-950/20 border-rose-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-slate-200">
                              {isVerified ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Ban className="w-4 h-4 text-rose-400 shrink-0" />
                              )}
                              <span className={isVerified ? 'text-blue-400' : 'text-rose-400 font-bold'}>
                                {art.id}
                              </span>
                              <span className="text-slate-400 font-normal">({art.name})</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs">
                              SHA-256: {art.hash}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap ${
                              isVerified
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            }`}
                          >
                            {isVerified ? 'PRESENT & VERIFIED' : 'MISSING MANDATORY'}
                          </span>
                        </div>

                        {!isVerified && (
                          <div className="mt-2 pt-2 border-t border-rose-900/30 space-y-1.5">
                            <div className="p-1.5 rounded bg-[#10141a] text-[10px] text-slate-300 font-mono leading-tight">
                              <span className="text-rose-400 font-bold">Regulatory Notice:</span> "Expected evidence has not yet been submitted. Does not independently prove non-execution, but precludes statutory closure until cryptographically sealed."
                            </div>
                            <button
                              onClick={() => handleShowNotification(`Formal Statutory Demand issued to ${selectedMandate.cseName} for Artefact ${art.id}.`)}
                              className="w-full py-1 rounded bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/60 text-rose-200 text-xs font-mono flex items-center justify-center gap-1 transition-colors"
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              Issue Statutory Demand for {art.id}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestone Progression Ledger */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-200">Milestone Progression Ledger</span>
                <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {selectedMandate.milestones.map((ms, idx) => (
                    <div key={idx} className={`relative flex items-start gap-2 ${!ms.completed ? 'opacity-50' : ''}`}>
                      <div
                        className={`absolute -left-4 mt-1 w-2.5 h-2.5 rounded-full ${
                          ms.completed ? 'bg-emerald-400' : 'bg-slate-700 border border-slate-600'
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className={`font-semibold ${ms.completed ? 'text-slate-200' : 'text-slate-400'}`}>
                            {ms.title}
                          </span>
                          <span className="text-[10px] text-slate-500">{ms.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{ms.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supervisory Verification Suite (Interactive Decision Suite) */}
              <div className="p-3 rounded bg-[#1c2026] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-slate-200">Supervisory Verification Suite</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Lead NC-8802</span>
                </div>

                {/* Verification Checklist */}
                <div className="space-y-1.5 p-2 rounded bg-[#10141a] text-xs font-mono text-slate-300">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked disabled className="rounded bg-slate-800 text-emerald-500" />
                    <span className="line-through text-slate-500">Mandate Scope Communicated & Acknowledged</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="rounded bg-slate-800 text-blue-500" />
                    <span className="text-rose-400 font-semibold">Mandatory Telemetry ESC-221 Submitted</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="rounded bg-slate-800 text-blue-500" />
                    <span className="text-slate-400">Workflow Conformance Validated via Process Trace</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" disabled className="rounded bg-slate-800 text-blue-500" />
                    <span className="text-slate-400">Cryptographic Hash Sealed (FIPS-140-2 Level 3)</span>
                  </label>
                </div>

                {/* Verification Note */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">
                    Examiner Supervisory Deliberation Note
                  </label>
                  <textarea
                    rows={2}
                    value={deliberationNote}
                    onChange={(e) => setDeliberationNote(e.target.value)}
                    className="w-full p-2 rounded bg-[#10141a] border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Decision Suite Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleStartVerification}
                    className="py-1.5 px-3 rounded bg-[#262a31] hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    Start Verification
                  </button>
                  <button
                    onClick={() => {
                      if (selectedMandate.artifacts.some(a => a.status === 'MISSING_MANDATORY')) {
                        handleShowNotification('Supervisory Safeguard: Mandatory evidence ESC-221 is absent. Closure is statutorily prohibited.');
                      } else {
                        setMandates(prev => prev.map(m => m.id === selectedMandateId ? { ...m, status: 'CLOSED' } : m));
                        handleShowNotification(`Mandate ${selectedMandateId} formally verified and sealed.`);
                      }
                    }}
                    className={`py-1.5 px-3 rounded text-xs font-mono flex items-center justify-center gap-1.5 transition-colors ${
                      selectedMandate.artifacts.some(a => a.status === 'MISSING_MANDATORY')
                        ? 'bg-[#1c2026] text-slate-500 border border-slate-800 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Record Verified (Close)
                  </button>
                  <button
                    onClick={handleMarkDeficient}
                    className="py-1.5 px-3 rounded bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/60 text-amber-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    Mark Deficient (Reopen)
                  </button>
                  <button
                    onClick={() => handleShowNotification(`Supplementary Telemetry Order dispatched to ${selectedMandate.cseName}.`)}
                    className="py-1.5 px-3 rounded bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/60 text-blue-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    Request Telemetry
                  </button>
                </div>
              </div>

              {/* Related Objects Graph Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400">Related Objects Cross-Index</span>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-slate-300">CSE-014</span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-slate-300">CASE-1042</span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-slate-300">INV-338</span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-slate-300">CTRL-07</span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-blue-400">GAP-0071</span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-purple-400">NS-0041</span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-slate-300">PD-0031</span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-slate-300">FND-0142</span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-emerald-400">EVD-742</span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-emerald-400">EVD-761</span>
                  <span className="px-2 py-0.5 rounded bg-[#10141a] text-rose-400 font-bold">ESC-221</span>
                </div>
              </div>

              {/* Historical Recurrence Track */}
              <div className="p-3 rounded bg-[#10141a] border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
                  <span>Historical Recurrence Track</span>
                  <span className="text-amber-400 font-semibold">Recurrence Risk: HIGH</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Precedent matches found: <strong className="text-slate-200">Q2 2025</strong> (Escalation Gap verified), <strong className="text-slate-200">Q4 2025</strong> (Remediated), <strong className="text-slate-200">Q1 2026</strong> (Statutory Seal Verified). Current Q3 2026 gap signifies behavioral regression in operational handover procedures.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 7: CRYPTOGRAPHICALLY SEALED AUDIT TRAIL */}
      <div className="p-4 rounded-lg bg-[#181c22] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">
              Cryptographically Sealed Supervisory Audit Trail
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Append-Only Immutable Enclave Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] text-slate-400">
            <thead className="bg-[#10141a] text-slate-500 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Timestamp (UTC+05:30)</th>
                <th className="py-2 px-3">Actor / Signature</th>
                <th className="py-2 px-3">Operation Scope</th>
                <th className="py-2 px-3">Finding & Entity</th>
                <th className="py-2 px-3">State Transition</th>
                <th className="py-2 px-3 text-right">Integrity Digest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-[#1c2026]">
                <td className="py-2 px-3 whitespace-nowrap text-slate-200">26 Sep 2026 14:18:02</td>
                <td className="py-2 px-3 text-blue-400 font-semibold">SYS:SAT-FUSION</td>
                <td className="py-2 px-3 text-slate-200">Mandate REM-0038 Created</td>
                <td className="py-2 px-3">FND-0142 | CSE-014</td>
                <td className="py-2 px-3">
                  <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300">NEW → OPEN</span>
                </td>
                <td className="py-2 px-3 text-right text-slate-500">0x4b78...901e</td>
              </tr>
              <tr className="hover:bg-[#1c2026]">
                <td className="py-2 px-3 whitespace-nowrap text-slate-200">26 Sep 2026 14:22:15</td>
                <td className="py-2 px-3 text-slate-300">NC-8802 (Lead Examiner)</td>
                <td className="py-2 px-3 text-slate-200">Assigned to CSE-014 Team</td>
                <td className="py-2 px-3">FND-0142 | CSE-014</td>
                <td className="py-2 px-3">
                  <span className="px-1.5 py-0.5 rounded bg-[#10141a] text-slate-300">STATE: OPEN</span>
                </td>
                <td className="py-2 px-3 text-right text-slate-500">0x81c2...12ad</td>
              </tr>
              <tr className="hover:bg-[#1c2026]">
                <td className="py-2 px-3 whitespace-nowrap text-slate-200">27 Sep 2026 09:15:40</td>
                <td className="py-2 px-3 text-slate-300">NC-8802 (Lead Examiner)</td>
                <td className="py-2 px-3 text-rose-400">Statutory Demand Issued: ESC-221</td>
                <td className="py-2 px-3">REM-0038 | CSE-014</td>
                <td className="py-2 px-3">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300">AIR-GAP QUEUED</span>
                </td>
                <td className="py-2 px-3 text-right text-slate-500">0xe912...cf44</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE REMEDIATION MANDATE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-lg bg-[#181c22] border border-slate-800 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-slate-100">Create Supervisory Remediation Mandate</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMandate} className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Supervised Entity (CSE)</label>
                  <select
                    value={newMandateForm.cseId}
                    onChange={(e) => setNewMandateForm({ ...newMandateForm, cseId: e.target.value })}
                    className="w-full mt-1 p-2 rounded bg-[#10141a] border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="CSE-014">CSE-014 (NorthGrid Energy)</option>
                    <option value="CSE-021">CSE-021 (TelcoGrid Telecom)</option>
                    <option value="CSE-008">CSE-008 (BankReserve Interconnect)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Trigger Finding Reference</label>
                  <select
                    value={newMandateForm.findingId}
                    onChange={(e) => setNewMandateForm({ ...newMandateForm, findingId: e.target.value })}
                    className="w-full mt-1 p-2 rounded bg-[#10141a] border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="FND-0142">FND-0142 (CTRL-07 Escalation Omission)</option>
                    <option value="FND-0131">FND-0131 (CTRL-11 SIEM Gap)</option>
                    <option value="FND-0109">FND-0109 (CTRL-09 HSM Key Cadence)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Statutory SLA Horizon</label>
                  <select
                    value={newMandateForm.horizon}
                    onChange={(e) => setNewMandateForm({ ...newMandateForm, horizon: e.target.value })}
                    className="w-full mt-1 p-2 rounded bg-[#10141a] border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option>7 Days (Critical Incident Standard)</option>
                    <option>14 Days (Standard Operational)</option>
                    <option>30 Days (Architectural Hardening)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400">Priority Classification</label>
                  <select
                    value={newMandateForm.priority}
                    onChange={(e) => setNewMandateForm({ ...newMandateForm, priority: e.target.value as any })}
                    className="w-full mt-1 p-2 rounded bg-[#10141a] border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="CRITICAL">CRITICAL (Statutory Escalation)</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400">Mandated Corrective Action Protocol</label>
                <textarea
                  rows={3}
                  value={newMandateForm.protocol}
                  onChange={(e) => setNewMandateForm({ ...newMandateForm, protocol: e.target.value })}
                  placeholder="Formulate explicit supervisory directives, required cryptographic evidence artefacts, and testing specifications..."
                  className="w-full mt-1 p-2 rounded bg-[#10141a] border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-2 rounded bg-[#10141a] border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mandate will be cryptographically signed by Supervisor NC-8841 and pushed to the CSE Air-Gap Gateway.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Enact & Sign Mandate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD CSE RESPONSE */}
      {showRecordResponseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg bg-[#181c22] border border-slate-800 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-slate-100">Record CSE Response / Submission</h3>
              </div>
              <button onClick={() => setShowRecordResponseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#10141a] text-slate-300">
                <div className="text-[10px] text-slate-500 uppercase">Target Mandate</div>
                <div className="font-bold text-blue-400">{selectedMandate.id} - {selectedMandate.mandateTitle}</div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400">Response Narrative</label>
                <textarea
                  rows={3}
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Record formal CSE statement or telemetry submission reference..."
                  className="w-full mt-1 p-2 rounded bg-[#10141a] border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded border border-dashed border-slate-700 bg-[#10141a] flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors">
                <Upload className="w-6 h-6 text-blue-400 mb-1" />
                <span className="text-xs text-slate-300">Attach Telemetry or Cryptographic Proof (Tar.gz / JSON)</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Air-gap hash digest computed automatically upon receipt</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRecordResponseModal(false)}
                  className="px-4 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowRecordResponseModal(false);
                    handleShowNotification(`Response for ${selectedMandate.id} recorded and queued for verification.`);
                  }}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
