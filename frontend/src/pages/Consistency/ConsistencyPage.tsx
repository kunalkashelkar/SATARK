import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ConsistencySignal {
  id: string;
  caseId: string;
  caseTitle: string;
  sourceA: string;
  sourceB: string;
  checkType: string;
  difference: string;
  status: 'CONFLICT' | 'MINOR_MISMATCH' | 'UNRESOLVED' | 'CONSISTENT';
  strength: string;
  uncertainty: string;
}

const MOCK_SIGNALS: ConsistencySignal[] = [
  {
    id: 'CON-0018',
    caseId: 'CASE-1042',
    caseTitle: 'High-Voltage Substation Trip',
    sourceA: 'Case Mgmt (ITSM)',
    sourceB: 'Investigation (SOAR)',
    checkType: 'Lifecycle Status',
    difference: 'OPEN vs CLOSED',
    status: 'CONFLICT',
    strength: 'STRONG (94%)',
    uncertainty: 'LOW',
  },
  {
    id: 'CON-0021',
    caseId: 'CASE-1042',
    caseTitle: 'High-Voltage Substation Trip',
    sourceA: 'Investigation System',
    sourceB: 'Escalation Ledger',
    checkType: 'Event Timestamp',
    difference: '14:32:04 vs 14:47:19 (+15m 15s)',
    status: 'MINOR_MISMATCH',
    strength: 'MEDIUM (78%)',
    uncertainty: 'LOW',
  },
  {
    id: 'CON-0027',
    caseId: 'CASE-1042',
    caseTitle: 'High-Voltage Substation Trip',
    sourceA: 'Escalation System',
    sourceB: 'Response Repository',
    checkType: 'Reference ID',
    difference: 'ESC-221 vs Missing Record',
    status: 'UNRESOLVED',
    strength: 'MEDIUM (71%)',
    uncertainty: 'MODERATE',
  },
  {
    id: 'CON-0031',
    caseId: 'CASE-1042',
    caseTitle: 'High-Voltage Substation Trip',
    sourceA: 'Response Dispatch',
    sourceB: 'Closure Audit Ledger',
    checkType: 'Outcome State',
    difference: 'COMPLETED vs PENDING',
    status: 'CONFLICT',
    strength: 'STRONG (89%)',
    uncertainty: 'MODERATE',
  },
  {
    id: 'CON-0038',
    caseId: 'CASE-1088',
    caseTitle: 'SCADA Relay Anomaly',
    sourceA: 'SIEM Ingest Stream',
    sourceB: 'Evidence Archive',
    checkType: 'Checksum Hash',
    difference: '9a7f...d82c vs 9a7f...d82d (1-bit shift)',
    status: 'UNRESOLVED',
    strength: 'HIGH (91%)',
    uncertainty: 'LOW',
  },
  {
    id: 'CON-0044',
    caseId: 'CASE-1102',
    caseTitle: 'Grid Frequency Drift Delta',
    sourceA: 'Case Management',
    sourceB: 'Incident Response Log',
    checkType: 'Assigned Role',
    difference: 'NC-8802 vs NC-8809',
    status: 'MINOR_MISMATCH',
    strength: 'MEDIUM (82%)',
    uncertainty: 'LOW',
  },
];

export const ConsistencyPage: React.FC = () => {
  const [selectedSignalId, setSelectedSignalId] = useState<string>('CON-0018');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONSISTENT' | 'MINOR_MISMATCH' | 'CONFLICT' | 'UNRESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('CASE-1042');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState<null | 'proof' | 'override' | 'finding'>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [examinerNotes, setExaminerNotes] = useState(
    'Lead Examiner NC-8802 note: Significant operational discrepancy between SOAR closure and active ITSM ticket. Correlating with GAP-0071 and ESC-221 ingestion hold before issuing statutory notice.'
  );

  const selectedSignal = MOCK_SIGNALS.find((s) => s.id === selectedSignalId) || MOCK_SIGNALS[0];

  const filteredSignals = MOCK_SIGNALS.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.caseId.toLowerCase().includes(q) ||
        s.caseTitle.toLowerCase().includes(q) ||
        s.checkType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setActionSuccessMsg('Telemetry streams re-synchronized; clock drift normalized across 5 subsystems.');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }, 700);
  };

  const handleExecuteAction = (msg: string) => {
    setActiveModal(null);
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4500);
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

      {/* 1. Breadcrumb & Status Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-1 mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[#c2c6d6] font-mono text-xs">
            <Link to="/overview" className="hover:text-[#dfe2eb] text-[#afc6ff]">SAT-SA</Link>
            <span className="text-[#8c90a0]">/</span>
            <span className="text-[#afc6ff]">Analytics</span>
            <span className="text-[#8c90a0]">/</span>
            <span className="text-[#dfe2eb] font-medium">Consistency Analysis</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#dfe2eb] tracking-tight">Consistency Analysis</h1>
            <span className="px-1.5 py-0.5 bg-[#262a31] text-[#afc6ff] font-mono text-xs rounded">
              NCIIPC-SEC-CON-04
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#007124]/30 text-[#91f294] font-mono text-xs rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7bdb80] animate-pulse"></span>
              AIR-GAPPED ENGINE: ACTIVE
            </span>
          </div>
          <p className="text-xs text-[#c2c6d6] max-w-4xl">
            Compare related evidence across sources to identify conflicts, mismatches, and unresolved operational inconsistencies across critical telemetry streams.
          </p>
        </div>

        {/* Right Header Action Suite */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs rounded border border-[#262a31] transition-colors shadow-sm"
          >
            <span className={`material-symbols-outlined text-[16px] text-[#afc6ff] ${isRefreshing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>Refresh Telemetry</span>
          </button>
          <button
            onClick={() => setActiveModal('proof')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs rounded border border-[#262a31] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Configure Checks</span>
          </button>
          <button
            onClick={() => handleExecuteAction('Reconciliation report exported in FIPS-140 signed format.')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1f6feb] hover:bg-[#afc6ff] hover:text-[#002d6d] text-white text-xs font-semibold rounded transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Reconciliation</span>
          </button>
        </div>
      </div>

      {/* Sovereign Statutory Boundary Notice */}
      <div className="p-3 bg-[#181c22] border border-[#262a31] rounded flex items-start gap-2.5 shadow-sm mb-4">
        <span className="material-symbols-outlined text-[#ffb693] shrink-0 mt-0.5 text-[20px]">policy</span>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-[#ffb693] uppercase font-bold tracking-wider">
            <span>Statutory Interpretation Boundary</span>
            <span className="text-[#8c90a0]">•</span>
            <span className="font-mono text-xs text-[#c2c6d6] normal-case">Sec. 70(B) IT Act 2000 & NCIIPC Guidelines</span>
          </div>
          <p className="text-xs text-[#c2c6d6] leading-relaxed">
            Consistency checks identify analytical discrepancies and divergent timestamps across telemetry streams. A detected conflict indicates an evidentiary or timing discrepancy requiring accredited human verification, not an automated finding of intentional non-compliance or breach.
          </p>
        </div>
      </div>

      {/* 3. KPI Strip (6 Dense Metric Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {/* Card 1 */}
        <div className="p-3 bg-[#181c22] border border-[#262a31] rounded flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Records Compared</span>
          <div className="my-1 flex items-baseline gap-1">
            <span className="text-2xl text-[#dfe2eb] font-bold font-mono">1,248</span>
          </div>
          <span className="font-mono text-[11px] text-[#c2c6d6] truncate">Cross-source triangulations</span>
        </div>

        {/* Card 2 */}
        <div className="p-3 bg-[#181c22] border border-[#262a31] rounded flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Consistency Rate</span>
            <span className="text-[#7bdb80] font-mono text-xs">+1.4%</span>
          </div>
          <div className="my-1 flex items-baseline gap-1">
            <span className="text-2xl text-[#7bdb80] font-bold font-mono">92.0%</span>
            <span className="font-mono text-[11px] text-[#8c90a0]">target 95%</span>
          </div>
          <div className="w-full bg-[#31353c] h-1 rounded overflow-hidden">
            <div className="bg-[#7bdb80] h-full" style={{ width: '92%' }}></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-3 bg-[#181c22] border border-[#262a31] rounded flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Consistency Signals</span>
          <div className="my-1 flex items-baseline gap-1">
            <span className="text-2xl text-[#ffb693] font-bold font-mono">14</span>
            <span className="font-mono text-xs text-[#c2c6d6]">active</span>
          </div>
          <span className="font-mono text-[11px] text-[#8c90a0]">Portfolio-wide drift</span>
        </div>

        {/* Card 4 */}
        <div className="p-3 bg-[#181c22] border border-[#262a31] rounded flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">High-Priority</span>
            <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
          </div>
          <div className="my-1 flex items-baseline gap-1">
            <span className="text-2xl text-[#ffb4ab] font-bold font-mono">4</span>
            <span className="font-mono text-xs text-[#ffb4ab]">critical</span>
          </div>
          <span className="font-mono text-[11px] text-[#8c90a0]">Lifecycle state conflicts</span>
        </div>

        {/* Card 5 */}
        <div className="p-3 bg-[#181c22] border border-[#262a31] rounded flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">State Divergences</span>
          <div className="my-1 flex items-baseline gap-1">
            <span className="text-2xl text-[#dfe2eb] font-bold font-mono">9</span>
            <span className="font-mono text-xs text-[#ffb693]">material</span>
          </div>
          <span className="font-mono text-[11px] text-[#8c90a0]">ITSM / SOAR mismatches</span>
        </div>

        {/* Card 6 */}
        <div className="p-3 bg-[#181c22] border border-[#262a31] rounded flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Requires Review</span>
            <span className="px-1 bg-[#1c2026] font-mono text-[10px] text-[#afc6ff] rounded">NC-8802</span>
          </div>
          <div className="my-1 flex items-baseline gap-1">
            <span className="text-2xl text-[#afc6ff] font-bold font-mono">6</span>
            <span className="font-mono text-xs text-[#c2c6d6]">dockets</span>
          </div>
          <span className="font-mono text-[11px] text-[#c2c6d6]">Lead examiner queue</span>
        </div>
      </div>

      {/* 4. Scope Selectors & Filtering System */}
      <div className="p-3 bg-[#181c22] border border-[#262a31] rounded flex flex-col gap-2.5 shadow-sm mb-4">
        {/* Filter Selectors Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-[#8c90a0] uppercase font-semibold">Target Entity (CSE)</label>
            <div className="flex items-center justify-between px-2 py-1.5 bg-[#1c2026] rounded text-[#dfe2eb] font-mono text-xs border border-[#262a31]">
              <span className="truncate">CSE-014 (NorthGrid)</span>
              <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-[#8c90a0] uppercase font-semibold">Critical Sector</label>
            <div className="flex items-center justify-between px-2 py-1.5 bg-[#1c2026] rounded text-[#dfe2eb] font-mono text-xs border border-[#262a31]">
              <span className="truncate">Energy (GridSec)</span>
              <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-[#8c90a0] uppercase font-semibold">Audit Period</label>
            <div className="flex items-center justify-between px-2 py-1.5 bg-[#1c2026] rounded text-[#dfe2eb] font-mono text-xs border border-[#262a31]">
              <span className="truncate">Q3 2026 (Live Scope)</span>
              <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-[#8c90a0] uppercase font-semibold">Telemetry Streams</label>
            <div className="flex items-center justify-between px-2 py-1.5 bg-[#1c2026] rounded text-[#dfe2eb] font-mono text-xs border border-[#262a31]">
              <span className="truncate">All (SIEM, SOAR, ITSM)</span>
              <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-[#8c90a0] uppercase font-semibold">Signal Severity</label>
            <div className="flex items-center justify-between px-2 py-1.5 bg-[#1c2026] rounded text-[#dfe2eb] font-mono text-xs border border-[#262a31]">
              <span className="truncate">All Severities (P1-P4)</span>
              <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] text-[#8c90a0] uppercase font-semibold">Resolution State</label>
            <div className="flex items-center justify-between px-2 py-1.5 bg-[#1c2026] rounded text-[#dfe2eb] font-mono text-xs border border-[#262a31]">
              <span className="truncate">All Statuses</span>
              <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">expand_more</span>
            </div>
          </div>
        </div>

        {/* Sub-row: Quick Chips + Fast Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pt-1 border-t border-[#262a31]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-[#1f6feb] text-white font-semibold'
                  : 'bg-[#1c2026] hover:bg-[#262a31] text-[#c2c6d6]'
              }`}
            >
              All (6)
            </button>
            <button
              onClick={() => setStatusFilter('CONFLICT')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                statusFilter === 'CONFLICT'
                  ? 'bg-[#ffb4ab] text-[#690005] font-semibold'
                  : 'bg-[#1c2026] hover:bg-[#262a31] text-[#ffb4ab]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
              Conflict (2)
            </button>
            <button
              onClick={() => setStatusFilter('MINOR_MISMATCH')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                statusFilter === 'MINOR_MISMATCH'
                  ? 'bg-[#ffb693] text-[#351000] font-semibold'
                  : 'bg-[#1c2026] hover:bg-[#262a31] text-[#ffb693]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb693]"></span>
              Minor Mismatch (2)
            </button>
            <button
              onClick={() => setStatusFilter('UNRESOLVED')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                statusFilter === 'UNRESOLVED'
                  ? 'bg-[#afc6ff] text-[#002d6d] font-semibold'
                  : 'bg-[#1c2026] hover:bg-[#262a31] text-[#afc6ff]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#afc6ff]"></span>
              Unresolved (2)
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[300px]">
            <span className="material-symbols-outlined text-[16px] text-[#8c90a0] absolute left-2.5 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              className="w-full pl-8 pr-3 py-1 bg-[#1c2026] text-[#dfe2eb] placeholder:text-[#8c90a0] font-mono text-xs rounded border border-[#262a31] outline-none focus:border-[#afc6ff] transition-colors"
              placeholder="Filter by Case ID, Signal ID (CON-0018)..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 5. Primary Cross-Source Consistency Ledger (Table View) */}
      <div className="bg-[#181c22] border border-[#262a31] rounded overflow-hidden shadow-sm flex flex-col mb-4">
        <div className="px-4 py-2.5 bg-[#0a0e14] flex items-center justify-between border-b border-[#262a31]">
          <div className="flex items-center gap-2">
            <span className="text-base text-[#dfe2eb] font-semibold">Cross-Source Verification Register</span>
            <span className="font-mono text-xs text-[#c2c6d6] bg-[#1c2026] px-2 py-0.5 rounded border border-[#262a31]">
              Scope: CSE-014 / Focus: CASE-1042
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#8c90a0] font-mono text-xs">
            <span>{filteredSignals.length} Filtered Signals</span>
            <span>•</span>
            <span className="text-[#afc6ff] cursor-pointer hover:underline">Batch Select (0)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#dfe2eb]">
            <thead className="bg-[#1c2026] text-[#8c90a0] text-[10px] uppercase font-mono tracking-wider border-b border-[#262a31]">
              <tr>
                <th className="py-2.5 px-3">Signal ID</th>
                <th className="py-2.5 px-3">Case / Operational Entity</th>
                <th className="py-2.5 px-3">Source A</th>
                <th className="py-2.5 px-3">Source B</th>
                <th className="py-2.5 px-3">Verification Check</th>
                <th className="py-2.5 px-3">Observed Difference</th>
                <th className="py-2.5 px-3">Consistency Status</th>
                <th className="py-2.5 px-3">Strength</th>
                <th className="py-2.5 px-3">Uncertainty</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a31] font-mono">
              {filteredSignals.map((sig) => {
                const isSelected = selectedSignalId === sig.id;
                return (
                  <tr
                    key={sig.id}
                    onClick={() => setSelectedSignalId(sig.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#1c2026]' : 'hover:bg-[#1c2026]/60'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-[#afc6ff]">
                      <div className="flex items-center gap-1.5">
                        {sig.status === 'CONFLICT' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-ping"></span>
                        )}
                        <span>{sig.id}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#dfe2eb] font-sans">{sig.caseId}</div>
                      <div className="text-[10px] text-[#8c90a0]">{sig.caseTitle}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#c2c6d6]">{sig.sourceA}</td>
                    <td className="py-2.5 px-3 text-[#c2c6d6]">{sig.sourceB}</td>
                    <td className="py-2.5 px-3 text-[#dfe2eb] font-sans font-medium">{sig.checkType}</td>
                    <td
                      className={`py-2.5 px-3 font-mono font-medium ${
                        sig.status === 'CONFLICT'
                          ? 'text-[#ffb4ab]'
                          : sig.status === 'MINOR_MISMATCH'
                          ? 'text-[#ffb693]'
                          : 'text-[#afc6ff]'
                      }`}
                    >
                      {sig.difference}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          sig.status === 'CONFLICT'
                            ? 'bg-[#93000a]/40 text-[#ffb4ab]'
                            : sig.status === 'MINOR_MISMATCH'
                            ? 'bg-[#c55100]/30 text-[#ffb693]'
                            : 'bg-[#1c2026] text-[#afc6ff] border border-[#262a31]'
                        }`}
                      >
                        {sig.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#7bdb80] font-medium">{sig.strength}</td>
                    <td className="py-2.5 px-3 text-[#c2c6d6]">{sig.uncertainty}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSignalId(sig.id);
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          isSelected
                            ? 'bg-[#1f6feb] text-white'
                            : 'hover:bg-[#262a31] text-[#afc6ff]'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Deep-Dive Split Layout: Selected Signal Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start mb-4">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* A. Multi-Source Cross-Reconciliation Matrix */}
          <div className="bg-[#181c22] border border-[#262a31] rounded p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#afc6ff] text-[20px]">dataset</span>
                <span className="text-base text-[#dfe2eb] font-semibold">A. Multi-Source Cross-Reconciliation Matrix</span>
              </div>
              <span className="font-mono text-xs text-[#8c90a0]">{selectedSignal.caseId} / 5 Subsystems</span>
            </div>
            <p className="text-xs text-[#c2c6d6]">
              Cross-tabular triangulation across all 5 accredited SOC databases. Inconsistencies detected in primary status and event delta.
            </p>
            <div className="overflow-x-auto border border-[#262a31] rounded mt-1">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#1c2026] text-[#8c90a0] text-[10px] uppercase border-b border-[#262a31]">
                  <tr>
                    <th className="py-2 px-3">Subsystem Stream</th>
                    <th className="py-2 px-3">Status Vector</th>
                    <th className="py-2 px-3">Source Time (IST)</th>
                    <th className="py-2 px-3">Operator</th>
                    <th className="py-2 px-3">Telemetry Ref</th>
                    <th className="py-2 px-3">Operational State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262a31]">
                  {/* ITSM: Conflict */}
                  <tr className="bg-[#1c2026]/70 hover:bg-[#262a31] transition-colors">
                    <td className="py-2 px-3 font-medium text-[#dfe2eb] flex items-center gap-1.5 font-sans">
                      <span className="w-2 h-2 rounded bg-[#afc6ff]"></span> Case Mgmt (ITSM v4.2)
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 bg-[#93000a]/40 text-[#ffb4ab] rounded font-bold">OPEN</span>
                    </td>
                    <td className="py-2 px-3 text-[#dfe2eb]">14:11:00</td>
                    <td className="py-2 px-3 text-[#c2c6d6]">NC-8802</td>
                    <td className="py-2 px-3 text-[#afc6ff]">{selectedSignal.caseId}</td>
                    <td className="py-2 px-3 text-[#ffb693] font-sans">In Progress</td>
                  </tr>
                  {/* SOAR: Conflict */}
                  <tr className="bg-[#1c2026]/70 hover:bg-[#262a31] transition-colors">
                    <td className="py-2 px-3 font-medium text-[#dfe2eb] flex items-center gap-1.5 font-sans">
                      <span className="w-2 h-2 rounded bg-[#7bdb80]"></span> Investigation (SOAR Core)
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 bg-[#007124]/40 text-[#91f294] rounded font-bold">CLOSED</span>
                    </td>
                    <td className="py-2 px-3 text-[#dfe2eb]">14:32:00</td>
                    <td className="py-2 px-3 text-[#c2c6d6]">NC-8802</td>
                    <td className="py-2 px-3 text-[#afc6ff]">INV-882</td>
                    <td className="py-2 px-3 text-[#7bdb80] font-sans">Verified</td>
                  </tr>
                  {/* Escalation: Delay */}
                  <tr className="bg-[#1c2026]/70 hover:bg-[#262a31] transition-colors">
                    <td className="py-2 px-3 font-medium text-[#dfe2eb] flex items-center gap-1.5 font-sans">
                      <span className="w-2 h-2 rounded bg-[#ffb693]"></span> Escalation Ledger (CTRL-07)
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 bg-[#262a31] text-[#ffb693] rounded font-semibold">ESCALATED</span>
                    </td>
                    <td className="py-2 px-3 text-[#ffb693] font-semibold">14:47:19 (+15m)</td>
                    <td className="py-2 px-3 text-[#c2c6d6]">NC-8802</td>
                    <td className="py-2 px-3 text-[#afc6ff]">ESC-221</td>
                    <td className="py-2 px-3 text-[#dfe2eb] font-sans">Substation Triage</td>
                  </tr>
                  {/* Response */}
                  <tr className="bg-[#1c2026]/70 hover:bg-[#262a31] transition-colors">
                    <td className="py-2 px-3 font-medium text-[#dfe2eb] flex items-center gap-1.5 font-sans">
                      <span className="w-2 h-2 rounded bg-[#8c90a0]"></span> Response Dispatch (SOP-04)
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 bg-[#262a31] text-[#dfe2eb] rounded">COMPLETED</span>
                    </td>
                    <td className="py-2 px-3 text-[#dfe2eb]">15:10:00</td>
                    <td className="py-2 px-3 text-[#c2c6d6]">NC-8809</td>
                    <td className="py-2 px-3 text-[#afc6ff]">RES-118</td>
                    <td className="py-2 px-3 text-[#7bdb80] font-sans">Contained</td>
                  </tr>
                  {/* Closure: Conflict */}
                  <tr className="bg-[#1c2026]/70 hover:bg-[#262a31] transition-colors">
                    <td className="py-2 px-3 font-medium text-[#dfe2eb] flex items-center gap-1.5 font-sans">
                      <span className="w-2 h-2 rounded bg-[#ffb4ab]"></span> Closure Ledger (Audit Root)
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 bg-[#93000a]/40 text-[#ffb4ab] rounded font-bold">PENDING</span>
                    </td>
                    <td className="py-2 px-3 text-[#dfe2eb]">15:21:00</td>
                    <td className="py-2 px-3 text-[#c2c6d6]">NC-8802</td>
                    <td className="py-2 px-3 text-[#afc6ff]">CLS-1042</td>
                    <td className="py-2 px-3 text-[#ffb4ab] font-sans">Awaiting Verif.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* B. Cross-Source Chronological Timeline & Clock Synchronization */}
          <div className="bg-[#181c22] border border-[#262a31] rounded p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7bdb80] text-[20px]">pace</span>
                <span className="text-base text-[#dfe2eb] font-semibold">B. Chronological Alignment & Clock Drift</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-[#7bdb80] bg-[#007124]/20 px-2 py-0.5 rounded border border-[#007124]/40">
                <span>Normalized Clock Drift: +0.42s</span>
                <span className="text-[#8c90a0]">•</span>
                <span>NTP Synced</span>
              </div>
            </div>

            {/* Stepped Horizontal Timeline */}
            <div className="pt-2 pb-1">
              <div className="relative flex items-center justify-between px-4">
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-[#31353c] z-0"></div>
                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#1c2026] border border-[#262a31] flex items-center justify-center shadow">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#7bdb80]"></div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#dfe2eb] mt-1">14:02:10</span>
                  <span className="text-[10px] text-[#8c90a0] font-mono">SIEM Alert</span>
                </div>
                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#1c2026] border border-[#262a31] flex items-center justify-center shadow">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#afc6ff]"></div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#dfe2eb] mt-1">14:11:00</span>
                  <span className="text-[10px] text-[#8c90a0] font-mono">ITSM Opened</span>
                </div>
                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#1c2026] border border-[#262a31] flex items-center justify-center shadow">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#7bdb80]"></div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#dfe2eb] mt-1">14:32:04</span>
                  <span className="text-[10px] text-[#8c90a0] font-mono">SOAR Start</span>
                </div>
                {/* Step 4 (Discrepancy) */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#c55100]/40 border border-[#ffb693] flex items-center justify-center shadow animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffb693]"></div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#ffb693] mt-1">14:47:19</span>
                  <span className="text-[10px] text-[#ffb693] font-bold font-mono">+15m Gap</span>
                </div>
                {/* Step 5 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#1c2026] border border-[#262a31] flex items-center justify-center shadow">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#dfe2eb]"></div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#dfe2eb] mt-1">15:10:00</span>
                  <span className="text-[10px] text-[#8c90a0] font-mono">Response</span>
                </div>
                {/* Step 6 (Conflict) */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-[#93000a]/40 border border-[#ffb4ab] flex items-center justify-center shadow">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]"></div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#ffb4ab] mt-1">15:21:44</span>
                  <span className="text-[10px] text-[#ffb4ab] font-bold font-mono">Audit Block</span>
                </div>
              </div>
            </div>

            <div className="p-2 bg-[#1c2026] rounded text-[#8c90a0] font-mono text-[11px] flex items-center justify-between border border-[#262a31]">
              <span>Target Sequence SLA: ≤ 180s between step transitions</span>
              <span className="text-[#ffb693]">Observed Outlier: Substation Triage Dispatch (+915s)</span>
            </div>
          </div>

          {/* C. Entity Relationship & Reference Integrity Graph */}
          <div className="bg-[#181c22] border border-[#262a31] rounded p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#afc6ff] text-[20px]">hub</span>
                <span className="text-base text-[#dfe2eb] font-semibold">C. Reference Integrity & Lineage Graph</span>
              </div>
              <span className="font-mono text-xs text-[#c2c6d6]">Traceability: 83.3% Linked</span>
            </div>

            {/* Node Graph Visualization */}
            <div className="p-3 bg-[#0a0e14] rounded flex flex-wrap items-center justify-between gap-2 border border-[#262a31]">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1c2026] rounded border border-[#262a31]">
                <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">confirmation_number</span>
                <span className="font-mono text-xs text-[#dfe2eb] font-semibold">CASE-1042</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">arrow_forward</span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1c2026] rounded border border-[#262a31]">
                <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">biotech</span>
                <span className="font-mono text-xs text-[#dfe2eb] font-semibold">INV-882</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">arrow_forward</span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1c2026] rounded border border-[#262a31]">
                <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">folder_open</span>
                <span className="font-mono text-xs text-[#dfe2eb] font-semibold">EVD-742</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">arrow_forward</span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1c2026] rounded border border-[#262a31]">
                <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">priority_high</span>
                <span className="font-mono text-xs text-[#dfe2eb] font-semibold">ESC-221</span>
              </div>
              {/* Disconnected / Lag Link */}
              <div className="flex items-center gap-1 text-[#ffb693]">
                <span className="font-mono text-[11px] font-bold">-- 15m hold --</span>
                <span className="material-symbols-outlined text-[16px]">warning</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1c2026] rounded border border-[#262a31]">
                <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">engineering</span>
                <span className="font-mono text-xs text-[#dfe2eb] font-semibold">RES-118</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">arrow_forward</span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1c2026] rounded border border-[#ffb4ab]/40">
                <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">lock_clock</span>
                <span className="font-mono text-xs text-[#ffb4ab] font-semibold">CLS-1042</span>
              </div>
            </div>
          </div>

          {/* D. Multi-Signal Evidence Fusion Card */}
          <div className="bg-[#181c22] border border-[#262a31] rounded p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb693] text-[20px]">cyclone</span>
                <span className="text-base text-[#dfe2eb] font-semibold">D. Multi-Signal Evidence Fusion</span>
              </div>
              <span className="px-2 py-0.5 bg-[#1f6feb]/20 text-[#afc6ff] font-mono text-xs rounded border border-[#1f6feb]/30">
                Supervisory Candidate Synthesis
              </span>
            </div>
            <p className="text-xs text-[#c2c6d6]">
              Cross-module automated synthesis combines signal CON-0018 with related analytical signals into a unified supervisory candidate docket.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-1">
              <div className="p-2 bg-[#1c2026] rounded border border-[#262a31]">
                <span className="text-[10px] text-[#ffb4ab] uppercase font-bold font-mono">Consistency</span>
                <div className="font-mono text-xs font-semibold text-[#dfe2eb]">CON-0018</div>
                <div className="text-[10px] text-[#8c90a0] truncate font-mono">Status Mismatch</div>
              </div>
              <div className="p-2 bg-[#1c2026] rounded border border-[#262a31]">
                <span className="text-[10px] text-[#ffb693] uppercase font-bold font-mono">Execution Gap</span>
                <div className="font-mono text-xs font-semibold text-[#dfe2eb]">GAP-0071</div>
                <div className="text-[10px] text-[#8c90a0] truncate font-mono">Missing Escalation</div>
              </div>
              <div className="p-2 bg-[#1c2026] rounded border border-[#262a31]">
                <span className="text-[10px] text-[#afc6ff] uppercase font-bold font-mono">Negative Space</span>
                <div className="font-mono text-xs font-semibold text-[#dfe2eb]">NS-0041</div>
                <div className="text-[10px] text-[#8c90a0] truncate font-mono">Missing SOAR Proof</div>
              </div>
              <div className="p-2 bg-[#1c2026] rounded border border-[#262a31]">
                <span className="text-[10px] text-[#dfe2eb] uppercase font-bold font-mono">Process Dev.</span>
                <div className="font-mono text-xs font-semibold text-[#dfe2eb]">PD-0031</div>
                <div className="text-[10px] text-[#8c90a0] truncate font-mono">Workflow Bypass</div>
              </div>
              <div className="p-2 bg-[#1c2026] rounded border border-[#262a31]">
                <span className="text-[10px] text-[#7bdb80] uppercase font-bold font-mono">Recurrence</span>
                <div className="font-mono text-xs font-semibold text-[#dfe2eb]">2 Cycles</div>
                <div className="text-[10px] text-[#8c90a0] truncate font-mono">Q2 '25 / Q3 '26</div>
              </div>
            </div>

            <div className="p-3 bg-[#1c2026] border border-[#31353c] rounded flex flex-col md:flex-row md:items-center justify-between gap-3 mt-2 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#1f6feb]/20 flex items-center justify-center text-[#afc6ff] font-bold">
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#dfe2eb]">Fused Finding Candidate: FND-0142</div>
                  <div className="font-mono text-xs text-[#c2c6d6]">Severe SCADA Incident Escalation Bypass (Priority P1)</div>
                </div>
              </div>
              <Link
                to="/assessment/findings/FND-0142"
                className="px-3.5 py-1.5 bg-[#1f6feb] text-white text-xs font-semibold rounded hover:bg-[#afc6ff] hover:text-[#002d6d] transition-colors shrink-0 shadow-sm text-center"
              >
                Open Finding FND-0142 →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* E. Active Inspection Docket & Comparator */}
          <div className="bg-[#181c22] border border-[#262a31] rounded p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#afc6ff] text-[18px]">difference</span>
                <span className="text-[11px] text-[#dfe2eb] uppercase font-bold tracking-wider">Inspection Docket</span>
              </div>
              <span className="px-1.5 py-0.5 bg-[#93000a]/40 text-[#ffb4ab] font-mono text-[10px] rounded font-bold">
                {selectedSignal.id}
              </span>
            </div>
            <div className="text-base text-[#dfe2eb] font-semibold">{selectedSignal.checkType} Conflict</div>
            <p className="text-xs text-[#c2c6d6]">
              Case remains in <span className="text-[#dfe2eb] font-semibold font-mono">OPEN</span> state within operational ticketing while automated SOAR pipeline emitted formal cryptographic <span className="text-[#dfe2eb] font-semibold font-mono">CLOSED</span> assertion.
            </p>

            {/* Side-by-Side Card Comparison */}
            <div className="flex flex-col gap-2 pt-1">
              {/* Source A */}
              <div className="p-3 bg-[#1c2026] border border-[#262a31] rounded flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#8c90a0] uppercase font-mono">Source A: ITSM System</span>
                  <span className="px-1 bg-[#262a31] text-[#afc6ff] font-mono text-[10px] rounded">db_prod_case</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[#c2c6d6]">Lifecycle Value:</span>
                  <span className="font-mono text-sm font-bold text-[#ffb4ab]">OPEN</span>
                </div>
                <div className="font-mono text-[10px] text-[#8c90a0]">
                  Last touched: 14:11:00 IST by Operator OP-412
                </div>
              </div>

              {/* Source B */}
              <div className="p-3 bg-[#1c2026] border border-[#262a31] rounded flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#8c90a0] uppercase font-mono">Source B: SOAR Core Engine</span>
                  <span className="px-1 bg-[#262a31] text-[#7bdb80] font-mono text-[10px] rounded">soar_core_api</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[#c2c6d6]">Lifecycle Value:</span>
                  <span className="font-mono text-sm font-bold text-[#7bdb80]">CLOSED</span>
                </div>
                <div className="font-mono text-[10px] text-[#8c90a0]">
                  FIPS-140 Signed Token at 14:32:04 IST
                </div>
              </div>
            </div>

            {/* Analytical Provenance Details */}
            <div className="pt-2 flex flex-col gap-1 border-t border-[#262a31]">
              <div className="text-[10px] text-[#8c90a0] uppercase font-mono font-semibold">Analytical Provenance</div>
              <div className="p-2.5 bg-[#0a0e14] rounded font-mono text-[11px] flex flex-col gap-1 border border-[#262a31]">
                <div className="flex justify-between">
                  <span className="text-[#8c90a0]">Control Schema:</span>
                  <span className="text-[#dfe2eb]">CTRL-v3.2 (Incident Escalation)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c90a0]">Rule Engine:</span>
                  <span className="text-[#dfe2eb]">R-2.4 (Reconciliation)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c90a0]">Execution Node:</span>
                  <span className="text-[#dfe2eb]">AN-1.8 (DuckDB v0.10)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c90a0]">Evidence SHA:</span>
                  <span className="text-[#afc6ff] truncate font-mono">a83f9104...77bc</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c90a0]">Docket ID:</span>
                  <span className="text-[#dfe2eb]">SUB-2026-0814</span>
                </div>
              </div>
            </div>
          </div>

          {/* F. Examiner Review & Decision Suite (Human-in-the-Loop) */}
          <div className="bg-[#181c22] border border-[#262a31] rounded p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#7bdb80] text-[18px]">verified_user</span>
                <span className="text-[11px] text-[#dfe2eb] uppercase font-bold tracking-wider">Examiner Action Suite</span>
              </div>
              <span className="font-mono text-[10px] text-[#8c90a0]">HITL Mandate</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleExecuteAction('Signal CON-0018 validated as substantiated discrepancy.')}
                className="p-2 bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs rounded text-left flex items-center gap-1.5 transition-colors border border-[#262a31]"
              >
                <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">check_circle</span>
                <span>Validate Signal</span>
              </button>
              <button
                onClick={() => setActiveModal('proof')}
                className="p-2 bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs rounded text-left flex items-center gap-1.5 transition-colors border border-[#262a31]"
              >
                <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">add_to_photos</span>
                <span>Request Proof</span>
              </button>
              <button
                onClick={() => setActiveModal('override')}
                className="p-2 bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs rounded text-left flex items-center gap-1.5 transition-colors border border-[#262a31]"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ffb693]">swap_horiz</span>
                <span>Override State</span>
              </button>
              <button
                onClick={() => handleExecuteAction('Discrepancy resolved as normal asynchronous synchronization lag.')}
                className="p-2 bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs rounded text-left flex items-center gap-1.5 transition-colors border border-[#262a31]"
              >
                <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">sync_problem</span>
                <span>Sync Lag</span>
              </button>
            </div>

            {/* Deliberation Notes Textarea */}
            <div className="flex flex-col gap-1 pt-1">
              <label className="text-[10px] text-[#8c90a0] uppercase font-mono">
                Examiner Deliberation Notes (NC-8802)
              </label>
              <textarea
                className="w-full p-2 bg-[#1c2026] text-[#dfe2eb] font-mono text-xs rounded border border-[#262a31] outline-none focus:border-[#afc6ff] transition-colors resize-none leading-relaxed"
                rows={3}
                value={examinerNotes}
                onChange={(e) => setExaminerNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleExecuteAction('Deliberation notes saved to encrypted audit ledger.')}
                className="flex-1 py-1.5 bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs font-medium rounded transition-colors text-center border border-[#262a31]"
              >
                Save Notes
              </button>
              <button
                onClick={() => setActiveModal('finding')}
                className="flex-1 py-1.5 bg-[#1f6feb] text-white text-xs font-semibold rounded hover:bg-[#afc6ff] hover:text-[#002d6d] transition-colors text-center shadow-sm"
              >
                Create Finding
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Bottom Analytics, Trends & Methodology Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {/* Card 1: Consistency by Evidence Type */}
        <div className="p-4 bg-[#181c22] border border-[#262a31] rounded shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Consistency by Evidence Type</span>
            <span className="material-symbols-outlined text-[18px] text-[#afc6ff]">pie_chart</span>
          </div>
          <div className="flex flex-col gap-2 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[#dfe2eb] mb-0.5">
                <span>Alerts & Signals</span>
                <span className="text-[#7bdb80]">96%</span>
              </div>
              <div className="w-full bg-[#1c2026] h-1.5 rounded overflow-hidden">
                <div className="bg-[#7bdb80] h-full" style={{ width: '96%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[#dfe2eb] mb-0.5">
                <span>Case Lifecycle</span>
                <span className="text-[#7bdb80]">94%</span>
              </div>
              <div className="w-full bg-[#1c2026] h-1.5 rounded overflow-hidden">
                <div className="bg-[#7bdb80] h-full" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[#dfe2eb] mb-0.5">
                <span>Investigation SOAR</span>
                <span className="text-[#7bdb80]">91%</span>
              </div>
              <div className="w-full bg-[#1c2026] h-1.5 rounded overflow-hidden">
                <div className="bg-[#7bdb80] h-full" style={{ width: '91%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[#dfe2eb] mb-0.5">
                <span>Escalation Handshakes</span>
                <span className="text-[#ffb693]">87%</span>
              </div>
              <div className="w-full bg-[#1c2026] h-1.5 rounded overflow-hidden">
                <div className="bg-[#ffb693] h-full" style={{ width: '87%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Historical Consistency Trend */}
        <div className="p-4 bg-[#181c22] border border-[#262a31] rounded shadow-sm flex flex-col gap-2 justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Historical Trend (Recurrence)</span>
            <span className="material-symbols-outlined text-[18px] text-[#7bdb80]">trending_up</span>
          </div>
          <div className="h-20 w-full flex items-end pt-1">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 200 60">
              <polyline fill="none" points="10,40 60,30 120,15 180,22" stroke="#afc6ff" strokeWidth="2" />
              <circle cx="10" cy="40" fill="#afc6ff" r="3" />
              <circle cx="60" cy="30" fill="#afc6ff" r="3" />
              <circle cx="120" cy="15" fill="#7bdb80" r="3" />
              <circle cx="180" cy="22" fill="#afc6ff" r="3" />
            </svg>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px] text-[#8c90a0] pt-1 border-t border-[#262a31]">
            <div><span>Q2 '25</span><div className="text-[#dfe2eb] font-bold">88%</div></div>
            <div><span>Q4 '25</span><div className="text-[#dfe2eb] font-bold">91%</div></div>
            <div><span>Q1 '26</span><div className="text-[#7bdb80] font-bold">94%</div></div>
            <div><span>Q3 '26</span><div className="text-[#afc6ff] font-bold">92%</div></div>
          </div>
          <div className="text-[10px] text-[#8c90a0] font-mono text-center">
            Identified pattern recurrence across 2 assessment cycles
          </div>
        </div>

        {/* Card 3: Analytical Uncertainty & Limitations */}
        <div className="p-4 bg-[#181c22] border border-[#262a31] rounded shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Uncertainty Matrix</span>
            <span className="material-symbols-outlined text-[18px] text-[#ffb693]">query_stats</span>
          </div>
          <div className="flex flex-col gap-1.5 font-mono text-xs">
            <div className="flex justify-between py-0.5">
              <span className="text-[#c2c6d6]">Cross-Source Match:</span>
              <span className="text-[#dfe2eb] font-bold">92% Validated</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#c2c6d6]">Data Completeness:</span>
              <span className="text-[#dfe2eb] font-bold">86% Ingested</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#c2c6d6]">Clock Drift Window:</span>
              <span className="text-[#dfe2eb] font-bold">±30s Tolerance</span>
            </div>
            <div className="flex justify-between py-0.5 pt-1 border-t border-[#262a31]">
              <span className="text-[#dfe2eb] font-semibold">Net Uncertainty:</span>
              <span className="px-1.5 py-0.5 bg-[#c55100]/30 text-[#ffb693] rounded font-bold text-[10px]">
                MODERATE
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Formal Calculation Methodology */}
        <div className="p-4 bg-[#181c22] border border-[#262a31] rounded shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Calculation Methodology</span>
            <span className="material-symbols-outlined text-[18px] text-[#afc6ff]">functions</span>
          </div>
          <div className="p-2 bg-[#0a0e14] rounded font-mono text-[10px] text-[#afc6ff] border border-[#262a31] leading-relaxed">
            Consistency Rate = (C_comp / T_valid) * 100<br />
            = (1,148 / 1,248) * 100<br />
            = 92.0% Verified
          </div>
          <p className="text-[11px] text-[#c2c6d6] leading-relaxed">
            Calculated across cross-indexed SHA-256 tuples under FIPS-140-2 isolation. Triangulation requires at least 2 independent timestamps.
          </p>
          <div className="flex items-center justify-between pt-1 text-[#8c90a0] font-mono text-[10px]">
            <span>NCIIPC Engine v3.2</span>
            <span className="text-[#7bdb80]">ISO/IEC 27004</span>
          </div>
        </div>
      </div>

      {/* Modals Suite */}
      {/* 1. Request Proof Modal */}
      {activeModal === 'proof' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#181c22] border border-[#262a31] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#afc6ff]">add_to_photos</span>
                <h3 className="text-base font-bold text-[#dfe2eb]">Request Corroborating Raw Telemetry</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#8c90a0] hover:text-[#dfe2eb]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs text-[#c2c6d6]">
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Discrepant Signal</label>
                <div className="p-2 rounded bg-[#1c2026] text-[#dfe2eb] font-mono mt-1">
                  CON-0018: CASE-1042 (OPEN vs CLOSED conflict)
                </div>
              </div>
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Telemetry Source Request</label>
                <div className="p-2 rounded bg-[#1c2026] text-[#ffb693] font-mono mt-1">
                  Demand raw JSON payload of SOAR closure event INV-882 including digital signature token.
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262a31]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-xs text-[#c2c6d6]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteAction('Telemetry extraction request dispatched to CSE-014 agent.')}
                className="px-4 py-1.5 rounded bg-[#1f6feb] hover:bg-[#afc6ff] hover:text-[#002d6d] text-white text-xs font-semibold"
              >
                Dispatch Telemetry Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Override State Modal */}
      {activeModal === 'override' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#181c22] border border-[#262a31] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb693]">swap_horiz</span>
                <h3 className="text-base font-bold text-[#dfe2eb]">Human-in-the-Loop State Override</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#8c90a0] hover:text-[#dfe2eb]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs text-[#c2c6d6]">
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Select Authoritative State</label>
                <select className="w-full p-2 rounded bg-[#1c2026] border border-[#262a31] text-[#dfe2eb] mt-1 focus:outline-none">
                  <option value="OPEN">Enforce OPEN (ITSM authoritative - case active)</option>
                  <option value="CLOSED">Enforce CLOSED (SOAR cryptographic closure authoritative)</option>
                  <option value="SPLIT">Mark Contested / Escalate to Lead Director</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Statutory Justification Reason</label>
                <input
                  type="text"
                  defaultValue="Manual review of engineer dispatch confirms ongoing field remediation despite automation trigger."
                  className="w-full p-2 rounded bg-[#1c2026] border border-[#262a31] text-[#dfe2eb] mt-1 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262a31]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-xs text-[#c2c6d6]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteAction('Supervisory override sealed with examiner key NC-8802.')}
                className="px-4 py-1.5 rounded bg-[#ffb693] text-[#351000] hover:bg-[#ffdbcc] text-xs font-semibold"
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Create Finding Modal */}
      {activeModal === 'finding' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#181c22] border border-[#262a31] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb4ab]">gavel</span>
                <h3 className="text-base font-bold text-[#dfe2eb]">Create Finding Candidate from Consistency Conflict</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#8c90a0] hover:text-[#dfe2eb]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs text-[#c2c6d6]">
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Finding Candidate Reference</label>
                <div className="p-2 rounded bg-[#1c2026] text-[#ffb4ab] font-mono mt-1">FND-0142 (Severity: P1)</div>
              </div>
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Title</label>
                <input
                  type="text"
                  defaultValue="Unreconciled State Divergence in Critical Substation Incident Handling"
                  className="w-full p-2 rounded bg-[#1c2026] border border-[#262a31] text-[#dfe2eb] mt-1 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262a31]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-xs text-[#c2c6d6]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteAction('Finding Candidate FND-0142 registered with multi-signal fusion links.')}
                className="px-4 py-1.5 rounded bg-[#1f6feb] hover:bg-[#afc6ff] hover:text-[#002d6d] text-white text-xs font-semibold"
              >
                Confirm Finding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
