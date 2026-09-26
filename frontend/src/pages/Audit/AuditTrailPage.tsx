import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface AuditEvent {
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
  result: 'SUCCESS' | 'FAILED';
  reason: string;
  linkedObject: string;
}

const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'AUD-2026-004829',
    timestamp: '04 Oct 16:40:12',
    actor: 'NCIIPC Examiner',
    actorDetail: 'NC-8802 (Delhi)',
    actorRole: 'Examiner / Regulatory Officer',
    actorType: 'HUMAN',
    action: 'Verification Decision',
    targetObject: 'REM-0038',
    previousState: 'PENDING',
    newState: 'PENDING_EXM',
    result: 'SUCCESS',
    reason: 'Human verification gate held. Checklist 4/7 verified',
    linkedObject: 'FND-0142',
  },
  {
    id: 'AUD-2026-004828',
    timestamp: '04 Oct 16:40:02',
    actor: 'CSE-014 Evidence Team',
    actorDetail: 'SEC-AUTH-ENCLAVE',
    actorRole: 'Entity Appointed Auditor',
    actorType: 'HUMAN',
    action: 'Submitted Evidence',
    targetObject: 'ESC-221, ESC-222',
    previousState: 'NOT_SUBMIT',
    newState: 'PRESENT',
    result: 'SUCCESS',
    reason: 'Corrective escalation dispatch & authority logs',
    linkedObject: 'FND-0142',
  },
  {
    id: 'AUD-2026-004825',
    timestamp: '04 Oct 09:12:44',
    actor: 'Air-Gap Ingest Core',
    actorDetail: 'DELHI-AIRGAP-01',
    actorRole: 'Automated Core FIPS Daemon',
    actorType: 'SYSTEM',
    action: 'Hash Verified',
    targetObject: 'ESC-221',
    previousState: 'SUBMITTED',
    newState: 'VERIFIED',
    result: 'SUCCESS',
    reason: 'SHA-256: 7ac419b882...91fe match',
    linkedObject: 'FND-0142',
  },
  {
    id: 'AUD-2026-004823',
    timestamp: '28 Sep 11:04:19',
    actor: 'NCIIPC Examiner',
    actorDetail: 'NC-8802 (Delhi)',
    actorRole: 'Examiner / Lead Assessor',
    actorType: 'HUMAN',
    action: 'Requested Evidence (RFI)',
    targetObject: 'ESC-221',
    previousState: 'NOT_SUBMIT',
    newState: 'REQUESTED',
    result: 'SUCCESS',
    reason: 'Mandated escalation dispatch missing in Tier-3 triage',
    linkedObject: 'FND-0142',
  },
  {
    id: 'AUD-2026-004822',
    timestamp: '27 Sep 09:15:30',
    actor: 'Analytics Core Engine',
    actorDetail: 'SAT-AN-1.8.4',
    actorRole: 'Reasoning Engine v1.8.4',
    actorType: 'SYSTEM',
    action: 'Candidate Finding',
    targetObject: 'FND-0142',
    previousState: 'CANDIDATE',
    newState: 'UNDER_REV',
    result: 'SUCCESS',
    reason: 'Multi-signal fusion: Gap + Neg Space',
    linkedObject: 'FND-0142',
  },
  {
    id: 'AUD-2026-004820',
    timestamp: '27 Sep 09:12:05',
    actor: 'Analytics Watchdog',
    actorDetail: 'DAEMON-WTCH-09',
    actorRole: 'Continuous Triage Worker',
    actorType: 'SYSTEM',
    action: 'Generated Signal',
    targetObject: 'SIG-0024',
    previousState: 'INFERRED',
    newState: 'CANDIDATE',
    result: 'SUCCESS',
    reason: 'Execution Gap identified in CTRL-07 boundary SCADA',
    linkedObject: 'SIG-0024',
  },
  {
    id: 'AUD-2026-004819',
    timestamp: '26 Sep 10:41:50',
    actor: 'NCIIPC Examiner',
    actorDetail: 'NC-8802 (Delhi)',
    actorRole: 'Examiner / Lead Assessor',
    actorType: 'HUMAN',
    action: 'Added Note',
    targetObject: 'FND-0142',
    previousState: '—',
    newState: 'NOTE_REC',
    result: 'SUCCESS',
    reason: 'Forensic dispatch logs required under NCIIPC Sec-12(a)',
    linkedObject: 'FND-0142',
  },
  {
    id: 'AUD-2026-004821',
    timestamp: '26 Sep 10:32:18',
    actor: 'NCIIPC Examiner',
    actorDetail: 'NC-8802 (Delhi Enclave)',
    actorRole: 'Senior Examiner / Accredited Auditor',
    actorType: 'HUMAN',
    action: 'Opened Finding',
    targetObject: 'FND-0142',
    previousState: 'UNREAD',
    newState: 'UNDER_REV',
    result: 'SUCCESS',
    reason: 'Formal evidence inspection initiated following Signal Discovery SIG-0024 fusion.',
    linkedObject: 'FND-0142',
  },
  {
    id: 'AUD-2026-004815',
    timestamp: '26 Sep 08:14:02',
    actor: 'CSE-014 Pipeline',
    actorDetail: 'INGEST-CLIENT-02',
    actorRole: 'Automated Collector Worker',
    actorType: 'SYSTEM',
    action: 'Batch Ingest Failed',
    targetObject: 'EVD-739',
    previousState: 'INGESTING',
    newState: 'FAILED',
    result: 'FAILED',
    reason: 'Schema drift: Missing timestamp offset in Tier-2 stream',
    linkedObject: 'EVD-739',
  },
];

export const AuditTrailPage: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('AUD-2026-004821');
  const [activeChip, setActiveChip] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const selectedEvent = MOCK_AUDIT_EVENTS.find((e) => e.id === selectedEventId) || MOCK_AUDIT_EVENTS[0];

  const filteredEvents = MOCK_AUDIT_EVENTS.filter((e) => {
    if (activeChip === 'Human' && e.actorType !== 'HUMAN') return false;
    if (activeChip === 'System' && e.actorType !== 'SYSTEM') return false;
    if (activeChip === 'Decisions' && !e.action.includes('Decision') && !e.action.includes('Finding')) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.id.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.targetObject.toLowerCase().includes(q) ||
        e.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAction = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="flex flex-col w-full pb-16 text-[#dfe2eb]">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-16 right-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded bg-[#1f6feb] text-white shadow-xl text-xs font-mono border border-blue-400 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Command & Governance Context Ribbon */}
      <div className="p-4 bg-[#181c22] border border-[#262a31] rounded flex flex-col gap-3 mb-4 shadow-sm">
        {/* Breadcrumbs & Status Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#8c90a0]">
            <Link to="/overview" className="hover:text-[#afc6ff] text-[#afc6ff]">SAT-SA</Link>
            <span>/</span>
            <span className="hover:text-[#afc6ff]">Governance</span>
            <span>/</span>
            <span className="text-[#dfe2eb] font-semibold">Audit Trail</span>
            <span className="mx-1 text-[#424754]">|</span>
            <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#afc6ff] font-mono text-[11px]">
              GOVT OF INDIA • NCIIPC
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#262a31] border border-[#262a31]">
              <span className="w-2 h-2 rounded-full bg-[#7bdb80] animate-pulse"></span>
              <span className="font-mono text-xs text-[#7bdb80] font-semibold tracking-wide">
                INTEGRITY: 100% IMMUTABLE
              </span>
              <span className="text-[#8c90a0] text-[10px] font-mono">(FIPS-140-2 LEDGER)</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1c2026] text-[#8c90a0] font-mono text-xs border border-[#262a31]">
              <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">verified</span>
              <span>ROOT: 0x8F2A...C391</span>
            </div>
          </div>
        </div>

        {/* Header Content: Title + Actions */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="max-w-3xl">
            <h1 className="text-2xl lg:text-3xl text-[#dfe2eb] font-bold tracking-tight flex items-center gap-2">
              <span>Audit Trail</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#1f6feb] text-white tracking-wider">
                SEC-ACT-V2
              </span>
            </h1>
            <p className="text-xs text-[#c2c6d6] mt-1">
              Trace supervisory actions, decisions, evidence changes, and system events across the sovereign inspection lifecycle.
            </p>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative inline-block text-left">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs transition-colors shadow-sm border border-[#262a31]"
              >
                <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">download</span>
                <span>Export Audit</span>
                <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">expand_more</span>
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-1 w-44 rounded bg-[#262a31] border border-[#31353c] shadow-xl z-30 p-1 font-mono text-xs text-[#dfe2eb]">
                  <button
                    onClick={() => {
                      setExportOpen(false);
                      handleAction('Certified PDF Dossier generated with SHA-256 seal.');
                    }}
                    className="w-full text-left flex items-center justify-between px-3 py-1.5 rounded hover:bg-[#1c2026] transition-colors"
                  >
                    <span>PDF Dossier</span>
                    <span className="text-[#8c90a0] text-[10px]">CERTIFIED</span>
                  </button>
                  <button
                    onClick={() => {
                      setExportOpen(false);
                      handleAction('Audit Ledger exported in RFC-4180 CSV.');
                    }}
                    className="w-full text-left flex items-center justify-between px-3 py-1.5 rounded hover:bg-[#1c2026] transition-colors"
                  >
                    <span>CSV Ledger</span>
                    <span className="text-[#8c90a0] text-[10px]">RFC-4180</span>
                  </button>
                  <button
                    onClick={() => {
                      setExportOpen(false);
                      handleAction('Canonical JSON-LD cryptographically verified.');
                    }}
                    className="w-full text-left flex items-center justify-between px-3 py-1.5 rounded hover:bg-[#1c2026] transition-colors"
                  >
                    <span>JSON-LD Proof</span>
                    <span className="text-[#8c90a0] text-[10px]">CANONICAL</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleAction('Audit telemetry synchronized with all 4 sectoral nodes.')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs transition-colors shadow-sm border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">sync</span>
              <span>Refresh Telemetry</span>
            </button>
            <button
              onClick={() => handleAction('Advanced audit filters activated.')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1f6feb] text-white hover:bg-[#afc6ff] hover:text-[#002d6d] text-xs font-semibold transition-colors shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>Advanced Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Summary KPI Row (6 Dense Metric Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 mb-4">
        {/* KPI 1 */}
        <div className="bg-[#181c22] border border-[#262a31] p-3 rounded flex flex-col justify-between hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8c90a0] uppercase font-semibold font-mono tracking-wider">TOTAL EVENTS</span>
            <span className="material-symbols-outlined text-[18px] text-[#afc6ff]">data_object</span>
          </div>
          <div className="my-1">
            <div className="font-mono text-2xl font-bold text-[#dfe2eb] tracking-tight">1,842</div>
            <p className="text-[11px] text-[#8c90a0] truncate">Immutable ledger records</p>
          </div>
          <div className="w-full bg-[#262a31] h-1 rounded overflow-hidden">
            <div className="bg-[#afc6ff] h-full w-full"></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#181c22] border border-[#262a31] p-3 rounded flex flex-col justify-between hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#afc6ff] uppercase font-semibold font-mono tracking-wider">HUMAN ACTIONS</span>
            <span className="material-symbols-outlined text-[18px] text-[#afc6ff]">person_check</span>
          </div>
          <div className="my-1">
            <div className="font-mono text-2xl font-bold text-[#afc6ff] tracking-tight">624</div>
            <p className="text-[11px] text-[#8c90a0] truncate">Examiner & Supervised</p>
          </div>
          <div className="w-full bg-[#262a31] h-1 rounded overflow-hidden">
            <div className="bg-[#afc6ff] h-full" style={{ width: '33.8%' }}></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#181c22] border border-[#262a31] p-3 rounded flex flex-col justify-between hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#ffb693] uppercase font-semibold font-mono tracking-wider">SYSTEM ACTIONS</span>
            <span className="material-symbols-outlined text-[18px] text-[#ffb693]">smart_toy</span>
          </div>
          <div className="my-1">
            <div className="font-mono text-2xl font-bold text-[#ffb693] tracking-tight">1,218</div>
            <p className="text-[11px] text-[#8c90a0] truncate">Engines & Pipeline probes</p>
          </div>
          <div className="w-full bg-[#262a31] h-1 rounded overflow-hidden">
            <div className="bg-[#ffb693] h-full" style={{ width: '66.2%' }}></div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#181c22] border border-[#262a31] p-3 rounded flex flex-col justify-between hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#7bdb80] uppercase font-semibold font-mono tracking-wider">FINDING DECISIONS</span>
            <span className="material-symbols-outlined text-[18px] text-[#7bdb80]">gavel</span>
          </div>
          <div className="my-1">
            <div className="font-mono text-2xl font-bold text-[#7bdb80] tracking-tight">84</div>
            <p className="text-[11px] text-[#8c90a0] truncate">Adjudicated & Overridden</p>
          </div>
          <div className="w-full bg-[#262a31] h-1 rounded overflow-hidden">
            <div className="bg-[#7bdb80] h-full" style={{ width: '14%' }}></div>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-[#181c22] border border-[#262a31] p-3 rounded flex flex-col justify-between hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8c90a0] uppercase font-semibold font-mono tracking-wider">EVIDENCE ACTIONS</span>
            <span className="material-symbols-outlined text-[18px] text-[#dfe2eb]">enhanced_encryption</span>
          </div>
          <div className="my-1">
            <div className="font-mono text-2xl font-bold text-[#dfe2eb] tracking-tight">316</div>
            <p className="text-[11px] text-[#8c90a0] truncate">Hash verified / Ingests</p>
          </div>
          <div className="w-full bg-[#262a31] h-1 rounded overflow-hidden">
            <div className="bg-[#dfe2eb] h-full" style={{ width: '22%' }}></div>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-[#181c22] border border-[#262a31] p-3 rounded flex flex-col justify-between hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#ffb4ab] uppercase font-semibold font-mono tracking-wider">CONFIG DRIFT</span>
            <span className="material-symbols-outlined text-[18px] text-[#ffb4ab]">tune</span>
          </div>
          <div className="my-1">
            <div className="font-mono text-2xl font-bold text-[#ffb4ab] tracking-tight">27</div>
            <p className="text-[11px] text-[#8c90a0] truncate">Rule, baseline & schemas</p>
          </div>
          <div className="w-full bg-[#262a31] h-1 rounded overflow-hidden">
            <div className="bg-[#ffb4ab] h-full" style={{ width: '8%' }}></div>
          </div>
        </div>
      </div>

      {/* Section 2: Multi-Dimensional Filter Bar & Quick Chips */}
      <div className="p-3 bg-[#181c22] border border-[#262a31] rounded flex flex-col gap-2.5 mb-4 shadow-sm">
        {/* Active Focus Badge Row */}
        <div className="flex items-center justify-between flex-wrap gap-2 py-1 px-2.5 bg-[#1c2026] rounded border border-[#262a31]">
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="material-symbols-outlined text-[16px] text-[#ffb693]">target</span>
            <span className="text-[#8c90a0] uppercase">Active Inspection Scope:</span>
            <span className="font-semibold text-[#afc6ff]">CSE-014 (NorthGrid Energy)</span>
            <span className="text-[#8c90a0]">•</span>
            <span className="text-[#dfe2eb]">Period: Q3 2026</span>
            <span className="text-[#8c90a0]">•</span>
            <span className="text-[#7bdb80]">Control: CTRL-07 (Incident Escalation)</span>
            <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[10px] text-[#c2c6d6]">NODE: SEC-DLH-04</span>
          </div>
          <button
            onClick={() => {
              setActiveChip('All');
              setSearchQuery('');
            }}
            className="font-mono text-xs text-[#ffb4ab] hover:underline flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-[14px]">cancel</span>
            <span>Clear Scope</span>
          </button>
        </div>

        {/* Quick Chips Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['All', 'Human', 'System', 'Decisions'].map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-3 py-1 rounded font-mono text-xs font-semibold shrink-0 transition-colors ${
                activeChip === chip
                  ? 'bg-[#1f6feb] text-white'
                  : 'bg-[#1c2026] hover:bg-[#262a31] text-[#c2c6d6] hover:text-[#dfe2eb] border border-[#262a31]'
              }`}
            >
              {chip === 'All' ? 'All (1,842)' : chip === 'Human' ? 'Human Actions (624)' : chip === 'System' ? 'System Actions (1,218)' : 'Finding Decisions (84)'}
            </button>
          ))}
        </div>

        {/* Granular Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#8c90a0]">search</span>
          <input
            className="w-full pl-9 pr-16 py-2 rounded bg-[#1c2026] border border-[#262a31] text-[#dfe2eb] font-mono text-xs placeholder:text-[#8c90a0] focus:outline-none focus:border-[#afc6ff]"
            placeholder="Search Event ID, Actor, Action, Object ID (e.g., FND-0142, REM-0038, ESC-221, SHA-256)..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Section 3: Split Enterprise Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Left Column: Enterprise Audit Ledger Table (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="bg-[#181c22] border border-[#262a31] rounded overflow-hidden shadow-sm flex flex-col">
            {/* Table Top Bar */}
            <div className="px-4 py-2.5 bg-[#0a0e14] flex items-center justify-between border-b border-[#262a31]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#afc6ff]">receipt_long</span>
                <span className="text-xs uppercase font-mono font-bold text-[#dfe2eb]">Cryptographic Sovereign Ledger</span>
                <span className="px-1.5 py-0.5 rounded bg-[#1c2026] text-[#8c90a0] font-mono text-[10px]">
                  LIVE REPLICATION
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-[#8c90a0]">
                <span>Sort: <strong className="text-[#dfe2eb]">Timestamp (DESC)</strong></span>
                <span>•</span>
                <span>View: <strong className="text-[#7bdb80]">All Partitions</strong></span>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#1c2026] text-[#8c90a0] text-[10px] uppercase border-b border-[#262a31]">
                    <th className="py-2.5 px-3">Timestamp (IST)</th>
                    <th className="py-2.5 px-3">Actor & Role</th>
                    <th className="py-2.5 px-2">Type</th>
                    <th className="py-2.5 px-3">Action & Target</th>
                    <th className="py-2.5 px-3">Transition</th>
                    <th className="py-2.5 px-2">Result</th>
                    <th className="py-2.5 px-3">Provenance / Reason</th>
                    <th className="py-2.5 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262a31]">
                  {filteredEvents.map((evt) => {
                    const isSelected = selectedEventId === evt.id;
                    return (
                      <tr
                        key={evt.id}
                        onClick={() => setSelectedEventId(evt.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#1c2026]' : 'hover:bg-[#1c2026]/60'
                        }`}
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#dfe2eb] font-medium">{evt.timestamp}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col">
                            <span className="text-[#afc6ff] font-semibold truncate max-w-[130px]">{evt.actor}</span>
                            <span className="text-[#8c90a0] text-[10px]">{evt.actorDetail}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              evt.actorType === 'HUMAN'
                                ? 'bg-[#1f6feb]/30 text-[#afc6ff]'
                                : 'bg-[#c55100]/30 text-[#ffb693]'
                            }`}
                          >
                            {evt.actorType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col">
                            <span className="text-[#dfe2eb] font-sans font-medium">{evt.action}</span>
                            <span className="text-[#7bdb80] truncate max-w-[140px]">{evt.targetObject}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="text-[#8c90a0]">{evt.previousState}</span>
                            <span className="material-symbols-outlined text-[12px] text-[#8c90a0]">arrow_forward</span>
                            <span className="text-[#7bdb80] font-semibold">{evt.newState}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              evt.result === 'SUCCESS'
                                ? 'bg-[#007124]/30 text-[#91f294]'
                                : 'bg-[#93000a]/40 text-[#ffb4ab]'
                            }`}
                          >
                            {evt.result}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#c2c6d6] truncate max-w-[150px]" title={evt.reason}>
                          {evt.reason}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEventId(evt.id);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              isSelected
                                ? 'bg-[#1f6feb] text-white font-semibold'
                                : 'bg-[#262a31] text-[#afc6ff] hover:bg-[#31353c]'
                            }`}
                          >
                            {isSelected ? 'Active' : 'Inspect'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-2.5 bg-[#0a0e14] flex items-center justify-between border-t border-[#262a31] text-xs font-mono">
              <div className="flex items-center gap-2 text-[#8c90a0]">
                <span>Showing <strong className="text-[#dfe2eb]">{filteredEvents.length}</strong> of 1,842 events</span>
                <span className="text-[#7bdb80] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7bdb80]"></span>
                  Merkle Root Verified
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded bg-[#1f6feb] text-white font-bold">1</span>
                <span className="px-2 py-0.5 rounded bg-[#1c2026] text-[#c2c6d6]">2</span>
                <span className="px-2 py-0.5 rounded bg-[#1c2026] text-[#c2c6d6]">3</span>
              </div>
            </div>
          </div>

          {/* Temporal Cadence Sparkline */}
          <div className="bg-[#181c22] border border-[#262a31] p-3 rounded flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8c90a0] uppercase font-mono font-semibold">
                Temporal Cadence (24H Stream Activity)
              </span>
              <span className="font-mono text-xs text-[#7bdb80]">Zero-Discontinuity Observed</span>
            </div>
            {/* Inline Sparkline Density Histogram */}
            <div className="w-full h-10 flex items-end gap-1 pt-1">
              <div className="bg-[#afc6ff]/30 h-[30%] flex-1 rounded-xs"></div>
              <div className="bg-[#afc6ff]/30 h-[20%] flex-1 rounded-xs"></div>
              <div className="bg-[#afc6ff]/30 h-[15%] flex-1 rounded-xs"></div>
              <div className="bg-[#afc6ff]/40 h-[40%] flex-1 rounded-xs"></div>
              <div className="bg-[#ffb4ab] h-[90%] flex-1 rounded-xs" title="Ingest Error Spike"></div>
              <div className="bg-[#afc6ff]/50 h-[60%] flex-1 rounded-xs"></div>
              <div className="bg-[#afc6ff]/60 h-[75%] flex-1 rounded-xs"></div>
              <div className="bg-[#afc6ff]/40 h-[45%] flex-1 rounded-xs"></div>
              <div className="bg-[#7bdb80] h-[100%] flex-1 rounded-xs" title="Verification Burst"></div>
              <div className="bg-[#afc6ff]/40 h-[50%] flex-1 rounded-xs"></div>
              <div className="bg-[#afc6ff]/30 h-[25%] flex-1 rounded-xs"></div>
              <div className="bg-[#afc6ff]/20 h-[15%] flex-1 rounded-xs"></div>
            </div>
            <div className="flex items-center justify-between text-[#8c90a0] font-mono text-[10px]">
              <span>00:00 IST</span>
              <span>06:00 IST</span>
              <span>12:00 IST</span>
              <span className="text-[#7bdb80]">16:00 IST (Peak Verification)</span>
              <span>23:59 IST</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Audit Event Detail Drawer (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Statutory Human Decision Principle Box */}
          <div className="bg-[#181c22] border border-[#262a31] p-3.5 rounded shadow-sm">
            <div className="flex items-center gap-1.5 text-[#afc6ff] text-[11px] uppercase font-bold tracking-wider mb-1">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>SOVEREIGN HUMAN DECISION PRINCIPLE</span>
            </div>
            <p className="text-xs text-[#c2c6d6] leading-relaxed">
              SAT-SA automated engines detect, correlate, and score signals; <strong className="text-[#dfe2eb]">only accredited human examiners</strong> possess regulatory authority to validate findings, request evidence, or authorize closure under NCIIPC Sec-12(a).
            </p>
          </div>

          {/* Currently Selected Audit Event Card */}
          <div className="bg-[#181c22] border border-[#262a31] rounded shadow-md overflow-hidden flex flex-col">
            {/* Event Header */}
            <div className="p-3 bg-[#1c2026] border-b border-[#262a31] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-[#dfe2eb]">{selectedEvent.id}</span>
                <span className="px-2 py-0.5 rounded bg-[#1f6feb] text-white font-mono text-[10px] font-bold">
                  {selectedEvent.actorType}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-[#8c90a0]">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                <span>{selectedEvent.timestamp} 2026 IST</span>
              </div>
            </div>

            {/* Event Body */}
            <div className="p-4 flex flex-col gap-3">
              {/* Actor & Enclave Details */}
              <div className="bg-[#1c2026] border border-[#262a31] rounded p-2.5 flex flex-col gap-1">
                <span className="text-[10px] text-[#8c90a0] uppercase font-mono font-semibold">Authenticated Actor</span>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#1f6feb]/20 text-[#afc6ff] flex items-center justify-center font-bold text-xs font-mono">
                    NC
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-xs font-semibold text-[#dfe2eb] truncate">
                      {selectedEvent.actor} ({selectedEvent.actorDetail})
                    </span>
                    <span className="text-xs text-[#8c90a0] truncate">{selectedEvent.actorRole}</span>
                  </div>
                </div>
                <div className="mt-1 pt-1 border-t border-[#262a31] flex items-center justify-between font-mono text-[10px] text-[#8c90a0]">
                  <span>Session: <strong className="text-[#dfe2eb]">TLS-AIRGAP-8F21</strong></span>
                  <span className="text-[#7bdb80] font-medium">MFA-FIPS OK</span>
                </div>
              </div>

              {/* Target Object & Scope */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#8c90a0] uppercase font-mono font-semibold">Target Object & Scope</span>
                <div className="p-2.5 bg-[#0a0e14] border border-[#262a31] rounded flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#afc6ff] font-bold">{selectedEvent.targetObject}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#1c2026] font-mono text-[10px] text-[#dfe2eb]">
                      SEV: HIGH
                    </span>
                  </div>
                  <p className="text-xs text-[#c2c6d6]">{selectedEvent.action}</p>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-[#8c90a0] mt-0.5">
                    <span>CSE-014 (NorthGrid Energy)</span>
                    <span>•</span>
                    <span>Q3 2026</span>
                  </div>
                </div>
              </div>

              {/* State Transition Diagram Card */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#8c90a0] uppercase font-mono font-semibold">State Transition Workflow</span>
                <div className="p-2.5 bg-[#1c2026] border border-[#262a31] rounded flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-1 font-mono text-xs text-center">
                    <div className="flex-1 p-1 rounded bg-[#0a0e14] border border-[#262a31]">
                      <span className="text-[#8c90a0] block text-[9px] uppercase">Previous</span>
                      <span className="font-semibold text-[#dfe2eb] truncate block">{selectedEvent.previousState}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center shrink-0 px-1">
                      <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">arrow_forward</span>
                      <span className="font-mono text-[9px] text-[#afc6ff]">{selectedEvent.action.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1 p-1 rounded bg-[#1f6feb] text-white">
                      <span className="block text-[9px] uppercase opacity-80">New State</span>
                      <span className="font-bold truncate block">{selectedEvent.newState}</span>
                    </div>
                  </div>
                  <div className="p-1.5 bg-[#0a0e14] rounded text-xs text-[#c2c6d6] italic border border-[#262a31]">
                    "{selectedEvent.reason}"
                  </div>
                </div>
              </div>

              {/* Object Traceability Chain of Custody */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#8c90a0] uppercase font-mono font-semibold">
                  Traceability Chain of Custody
                </span>
                <div className="p-2.5 bg-[#0a0e14] border border-[#262a31] rounded space-y-1 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#afc6ff] shrink-0"></span>
                    <span className="text-[#dfe2eb] font-semibold">{selectedEvent.id}</span>
                    <span className="text-[#8c90a0] text-[10px]">(Audit Root)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8c90a0] shrink-0"></span>
                    <Link to="/assessment/findings/FND-0142" className="text-[#afc6ff] hover:underline">
                      FND-0142
                    </Link>
                    <span className="text-[#8c90a0] text-[10px]">(Finding)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8c90a0] shrink-0"></span>
                    <span className="text-[#dfe2eb]">CTRL-07 v3.2</span>
                    <span className="text-[#8c90a0] text-[10px]">(Escalation)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7bdb80] shrink-0"></span>
                    <span className="text-[#7bdb80]">REM-0038</span>
                    <span className="text-[#8c90a0] text-[10px]">(Remediation)</span>
                  </div>
                </div>
              </div>

              {/* Forensic Provenance & Baseline Versions */}
              <div className="p-2.5 bg-[#0a0e14] border border-[#262a31] rounded flex flex-col gap-1 font-mono text-[11px]">
                <span className="text-[10px] text-[#8c90a0] uppercase font-semibold mb-0.5">
                  Baseline Cryptographic Provenance
                </span>
                <div className="flex justify-between text-[#8c90a0]">
                  <span>Control Schema:</span>
                  <span className="text-[#dfe2eb]">NCIIPC CTRL-07 v3.2</span>
                </div>
                <div className="flex justify-between text-[#8c90a0]">
                  <span>Rule Engine:</span>
                  <span className="text-[#dfe2eb]">EXEC-GAP-R2.4</span>
                </div>
                <div className="flex justify-between text-[#8c90a0]">
                  <span>SHA-256 Digest:</span>
                  <span className="text-[#7bdb80]">7ac419...fe01824a</span>
                </div>
              </div>

              {/* Audit Primary Actions */}
              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  onClick={() => handleAction(`Certified dossier downloaded for ${selectedEvent.id}.`)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#1f6feb] text-white hover:bg-[#afc6ff] hover:text-[#002d6d] text-xs font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  <span>Download Certified Dossier</span>
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    to="/assessment/findings/FND-0142"
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#afc6ff] font-mono text-xs transition-colors text-center border border-[#262a31]"
                  >
                    <span className="material-symbols-outlined text-[14px]">account_tree</span>
                    <span>Trace Chain</span>
                  </Link>
                  <Link
                    to="/evidence"
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#7bdb80] font-mono text-xs transition-colors text-center border border-[#262a31]"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    <span>View Evidence</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Audit Immutability & Ledger Health Banner */}
      <div className="p-3.5 bg-[#181c22] border border-[#262a31] rounded flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#1c2026] border border-[#262a31] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px] text-[#7bdb80]">policy</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#dfe2eb] font-semibold">Immutable Append-Only Audit Guarantee</span>
              <span className="px-1.5 py-0.5 rounded bg-[#007124]/30 text-[#91f294] font-mono text-[10px] font-semibold">
                AIR-GAPPED COMPLIANCE
              </span>
            </div>
            <p className="text-xs text-[#8c90a0] mt-0.5">
              Audit records cannot be altered, rolled back, or deleted. Any corrective adjustment generates a forward-linked compensation entry under statutory supervision.
            </p>
          </div>
        </div>

        {/* Telemetry Health Metrics */}
        <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
          <div className="flex flex-col">
            <span className="text-[#8c90a0] text-[10px] uppercase">Retention Target</span>
            <span className="text-[#dfe2eb] font-semibold">7 Years (Statutory)</span>
          </div>
          <div className="h-6 w-px bg-[#262a31]"></div>
          <div className="flex flex-col">
            <span className="text-[#8c90a0] text-[10px] uppercase">Tamper Monitor</span>
            <span className="text-[#7bdb80] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7bdb80]"></span>
              Zero Drift
            </span>
          </div>
          <div className="h-6 w-px bg-[#262a31]"></div>
          <div className="flex flex-col">
            <span className="text-[#8c90a0] text-[10px] uppercase">Block Seal</span>
            <span className="text-[#afc6ff] font-semibold">1,842 / 1,842 OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
