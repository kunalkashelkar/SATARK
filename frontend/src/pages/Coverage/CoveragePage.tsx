import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ControlCoverageItem {
  id: string;
  name: string;
  expected: number;
  observed: number;
  coveragePct: number;
  status: 'FULL' | 'PARTIAL' | 'GAP' | 'N/A';
  strength: 'STRONG' | 'MEDIUM' | 'WEAK';
  uncertainty: string;
  signals: string[];
}

const MOCK_CONTROLS: ControlCoverageItem[] = [
  {
    id: 'CTRL-01',
    name: 'Incident Detection & Correlation Pipeline',
    expected: 8,
    observed: 8,
    coveragePct: 100,
    status: 'FULL',
    strength: 'STRONG',
    uncertainty: 'LOW (±2%)',
    signals: ['1 Signal'],
  },
  {
    id: 'CTRL-03',
    name: 'Investigation Case Management Timelines',
    expected: 6,
    observed: 5,
    coveragePct: 83,
    status: 'PARTIAL',
    strength: 'STRONG',
    uncertainty: 'MODERATE',
    signals: ['2 Signals'],
  },
  {
    id: 'CTRL-07',
    name: 'Incident Escalation & Review Process',
    expected: 7,
    observed: 4,
    coveragePct: 57,
    status: 'GAP',
    strength: 'MEDIUM',
    uncertainty: 'MODERATE (±14%)',
    signals: ['GAP-0071', 'NS-0041', '+1'],
  },
  {
    id: 'CTRL-11',
    name: 'Evidence Cryptographic Retention & Integrity',
    expected: 5,
    observed: 5,
    coveragePct: 100,
    status: 'FULL',
    strength: 'STRONG',
    uncertainty: 'LOW',
    signals: ['0 Signals'],
  },
  {
    id: 'CTRL-15',
    name: 'Response Validation & Containment Efficacy',
    expected: 6,
    observed: 4,
    coveragePct: 67,
    status: 'PARTIAL',
    strength: 'MEDIUM',
    uncertainty: 'MODERATE',
    signals: ['2 Signals'],
  },
  {
    id: 'CTRL-18',
    name: 'Forensic Preservation & Memory Image Capture',
    expected: 5,
    observed: 5,
    coveragePct: 100,
    status: 'FULL',
    strength: 'STRONG',
    uncertainty: 'LOW',
    signals: ['1 Signal'],
  },
  {
    id: 'CTRL-22',
    name: 'Cross-Enclave SIEM Forwarding & Heartbeats',
    expected: 4,
    observed: 4,
    coveragePct: 100,
    status: 'FULL',
    strength: 'STRONG',
    uncertainty: 'LOW',
    signals: ['0 Signals'],
  },
  {
    id: 'CTRL-25',
    name: 'Privileged Access Revocation on Compromise',
    expected: 5,
    observed: 3,
    coveragePct: 60,
    status: 'GAP',
    strength: 'WEAK',
    uncertainty: 'HIGH (±18%)',
    signals: ['BHV-0012', 'GAP-0062'],
  },
];

export const CoveragePage: React.FC = () => {
  const [selectedControl, setSelectedControl] = useState<string>('CTRL-07');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FULL' | 'PARTIAL' | 'GAP'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState<null | 'request' | 'finding' | 'note' | 'unmapped'>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const filteredControls = MOCK_CONTROLS.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.signals.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setActionSuccessMsg('Evidence telemetry coverage re-calculated against Q3 statutory index.');
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

      {/* Top Operational Banner / Header */}
      <div className="flex flex-col gap-2 mb-6">
        {/* Breadcrumb & System State */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 font-mono text-xs text-[#c2c6d6]">
            <Link to="/overview" className="text-[#afc6ff] hover:underline">SAT-SA</Link>
            <span className="text-[#8c90a0]">/</span>
            <span className="text-[#afc6ff]">Analytics</span>
            <span className="text-[#8c90a0]">/</span>
            <span className="text-[#dfe2eb] font-semibold">Coverage Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#262a31] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#7bdb80] animate-pulse"></span>
              <span className="font-mono text-xs text-[#7bdb80] font-semibold tracking-wider">
                EVIDENCE COVERAGE ENGINE: ACTIVE
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#1c2026] font-mono text-xs text-[#c2c6d6]">
              <span className="text-[#8c90a0]">SIG-HASH:</span>{' '}
              <span className="text-[#afc6ff] font-medium">9a7f4e82...d82c0199</span>
            </div>
          </div>
        </div>

        {/* Title & Action Bar */}
        <div className="flex flex-wrap items-end justify-between gap-4 pt-1">
          <div className="flex flex-col max-w-3xl">
            <h1 className="text-2xl lg:text-3xl text-[#dfe2eb] tracking-tight font-bold">Coverage Analysis</h1>
            <p className="text-sm text-[#c2c6d6] mt-1">
              Measure expected versus observed evidence coverage across controls, CSEs, assessment periods, and evidentiary sources. Detect telemetry degradation before regulatory review.
            </p>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs transition-colors shadow-sm"
              id="btn-refresh"
            >
              <span className={`material-symbols-outlined text-[16px] text-[#afc6ff] ${isRefreshing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setActiveModal('note')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs transition-colors shadow-sm"
              id="btn-configure"
            >
              <span className="material-symbols-outlined text-[16px] text-[#c2c6d6]">tune</span>
              <span>Configure Coverage</span>
            </button>
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#1f6feb] text-white hover:bg-[#afc6ff] hover:text-[#002d6d] text-xs font-semibold transition-all shadow-sm">
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Export Analysis</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
              <div className="hidden group-hover:flex flex-col absolute right-0 top-full mt-1 bg-[#262a31] shadow-xl rounded py-1 z-30 min-w-[150px] border border-[#31353c]">
                <button
                  onClick={() => handleExecuteAction('Generated PDF Report SEC-403.')}
                  className="px-3 py-1.5 hover:bg-[#31353c] text-xs text-[#dfe2eb] flex items-center justify-between text-left"
                >
                  <span>PDF Report</span>
                  <span className="font-mono text-[10px] text-[#8c90a0]">SEC-403</span>
                </button>
                <button
                  onClick={() => handleExecuteAction('Exported raw CSV telemetry ledger.')}
                  className="px-3 py-1.5 hover:bg-[#31353c] text-xs text-[#dfe2eb] flex items-center justify-between text-left"
                >
                  <span>CSV Ledger</span>
                  <span className="font-mono text-[10px] text-[#8c90a0]">RAW</span>
                </button>
                <button
                  onClick={() => handleExecuteAction('Generated JSON Bundle (FIPS-140 signed).')}
                  className="px-3 py-1.5 hover:bg-[#31353c] text-xs text-[#dfe2eb] flex items-center justify-between text-left"
                >
                  <span>JSON Bundle</span>
                  <span className="font-mono text-[10px] text-[#8c90a0]">FIPS</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Mandate Banner */}
        <div className="mt-2 p-3.5 rounded bg-[#181c22] border border-[#262a31] shadow-sm flex items-start gap-3">
          <div className="p-1 rounded bg-[#c55100]/20 text-[#ffb693] mt-0.5 shrink-0">
            <span className="material-symbols-outlined text-[20px]">policy</span>
          </div>
          <div className="flex flex-col gap-0.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase text-[#ffb693] tracking-wider font-bold">
                HUMAN-IN-THE-LOOP INSTITUTIONAL MANDATE (NCIIPC DIRECTIVE SEC-403)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#262a31] font-mono text-[10px] text-[#c2c6d6]">
                STATUTORY ENFORCEMENT
              </span>
            </div>
            <p className="text-xs text-[#c2c6d6] leading-relaxed">
              <span className="text-[#dfe2eb] font-semibold">Evidence Uncovered ≠ Control Failure.</span> Uncovered or partially represented controls reflect gaps in evidentiary substantiation or mapping alignment. Automated heuristics surface coverage deltas; accredited supervisory triage and manual evidentiary review are strictly required before escalation.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
        {/* Card 1 */}
        <div className="flex flex-col p-3 rounded bg-[#181c22] border border-[#262a31] shadow-sm hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[11px] uppercase tracking-wider text-[#8c90a0] font-semibold">Overall Coverage</span>
            <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">pie_chart</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-[#afc6ff]">86%</span>
            <span className="font-mono text-xs text-[#7bdb80] font-medium">Target Met</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-[#c2c6d6]">
            <span>Baseline: 86%</span>
            <span className="font-mono text-[#dfe2eb]">17/20 Controls</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col p-3 rounded bg-[#181c22] border border-[#262a31] shadow-sm hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[11px] uppercase tracking-wider text-[#8c90a0] font-semibold">Fully Covered</span>
            <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">check_circle</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-[#7bdb80]">16<span className="text-sm text-[#c2c6d6]">/20</span></span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-[#c2c6d6]">
            <span>Comprehensive</span>
            <span className="font-mono text-[#7bdb80] font-semibold">80.0%</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col p-3 rounded bg-[#181c22] border border-[#262a31] shadow-sm hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[11px] uppercase tracking-wider text-[#8c90a0] font-semibold">Partial Coverage</span>
            <span className="material-symbols-outlined text-[16px] text-[#ffb693]">timelapse</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-[#ffb693]">3</span>
            <span className="text-xs text-[#c2c6d6]">Controls</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-[#c2c6d6]">
            <span>Partial Telemetry</span>
            <span className="font-mono text-[#ffb693] font-semibold">15.0%</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col p-3 rounded bg-[#181c22] border border-[#262a31] shadow-sm hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[11px] uppercase tracking-wider text-[#8c90a0] font-semibold">Coverage Gaps</span>
            <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">warning</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-[#ffb4ab]">4</span>
            <span className="text-xs text-[#c2c6d6]">Critical</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-[#c2c6d6]">
            <span>Sub-threshold</span>
            <span className="font-mono text-[#ffb4ab] font-semibold">Action Req</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="flex flex-col p-3 rounded bg-[#181c22] border border-[#262a31] shadow-sm hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[11px] uppercase tracking-wider text-[#8c90a0] font-semibold">Unmapped Evidence</span>
            <span className="material-symbols-outlined text-[16px] text-[#c2c6d6]">folder_off</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-[#dfe2eb]">7</span>
            <span className="text-xs text-[#c2c6d6]">Artifacts</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-[#c2c6d6]">
            <span>Orphaned / Raw</span>
            <span className="font-mono text-[#afc6ff] font-semibold">Queue: P1</span>
          </div>
        </div>

        {/* Card 6 */}
        <div className="flex flex-col p-3 rounded bg-[#181c22] border border-[#262a31] shadow-sm hover:bg-[#1c2026] transition-colors">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[11px] uppercase tracking-wider text-[#8c90a0] font-semibold">Requires Review</span>
            <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">rule</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-[#dfe2eb]">5</span>
            <span className="text-xs text-[#afc6ff]">Flagged</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-[#c2c6d6]">
            <span>Supervisory Backlog</span>
            <span className="font-mono text-[#ffb693] font-semibold">Triage</span>
          </div>
        </div>
      </div>

      {/* Filter & Analysis Scope Bar */}
      <div className="p-3.5 rounded bg-[#181c22] border border-[#262a31] shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* CSE Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#8c90a0] uppercase font-semibold">Regulated Entity (CSE)</label>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1c2026] text-xs text-[#dfe2eb] border border-[#262a31]">
                <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">domain</span>
                <span className="font-medium">CSE-014 (NorthGrid Energy)</span>
                <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">arrow_drop_down</span>
              </div>
            </div>

            {/* Sector */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#8c90a0] uppercase font-semibold">Designated Sector</label>
              <div className="px-3 py-1.5 rounded bg-[#1c2026] text-xs text-[#dfe2eb] border border-[#262a31]">
                <span>Energy (Critical Power Grid)</span>
              </div>
            </div>

            {/* Period */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#8c90a0] uppercase font-semibold">Audit Period</label>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1c2026] text-xs text-[#dfe2eb] border border-[#262a31]">
                <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">calendar_today</span>
                <span>Q3 2026 (Active Scope)</span>
              </div>
            </div>

            {/* Coverage Status Quick Chips */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#8c90a0] uppercase font-semibold">Coverage Status Filter</label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    statusFilter === 'ALL'
                      ? 'bg-[#afc6ff] text-[#002d6d]'
                      : 'bg-[#1c2026] hover:bg-[#262a31] text-[#c2c6d6]'
                  }`}
                >
                  All (20)
                </button>
                <button
                  onClick={() => setStatusFilter('FULL')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    statusFilter === 'FULL'
                      ? 'bg-[#afc6ff] text-[#002d6d] font-semibold'
                      : 'bg-[#1c2026] hover:bg-[#262a31] text-[#c2c6d6]'
                  }`}
                >
                  FULL (16)
                </button>
                <button
                  onClick={() => setStatusFilter('PARTIAL')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    statusFilter === 'PARTIAL'
                      ? 'bg-[#afc6ff] text-[#002d6d] font-semibold'
                      : 'bg-[#1c2026] hover:bg-[#262a31] text-[#c2c6d6]'
                  }`}
                >
                  PARTIAL (3)
                </button>
                <button
                  onClick={() => setStatusFilter('GAP')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    statusFilter === 'GAP'
                      ? 'bg-[#ffb4ab] text-[#690005] font-semibold'
                      : 'bg-[#1c2026] hover:bg-[#262a31] text-[#ffb4ab]'
                  }`}
                >
                  GAP (4)
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end">
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#c2c6d6] hover:text-[#dfe2eb] text-xs border border-[#262a31]"
            >
              Reset
            </button>
            <button
              onClick={handleRefresh}
              className="px-3.5 py-1.5 rounded bg-[#afc6ff] text-[#002d6d] hover:bg-[#d9e2ff] text-xs font-semibold shadow-sm"
            >
              Apply Scope
            </button>
          </div>
        </div>
      </div>

      {/* Central Analytical Split (Expected vs Observed & Gap Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        {/* Card 1: Expected vs Observed Deep Dive (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs text-[#afc6ff] font-bold">CTRL-07</span>
                <span className="px-1.5 py-0.5 rounded bg-[#ffb4ab]/20 text-[#ffb4ab] text-[10px] uppercase font-bold">
                  REQUIRES EXAMINER REVIEW
                </span>
              </div>
              <h2 className="text-lg text-[#dfe2eb] font-semibold mt-1">Incident Escalation & Review</h2>
            </div>
            <span className="material-symbols-outlined text-[20px] text-[#ffb693]">analytics</span>
          </div>
          <p className="text-xs text-[#c2c6d6] mt-1">
            Automated telemetry extraction from NorthGrid SIEM and IT Service Orchestrator vs statutory evidentiary baseline.
          </p>

          {/* Meter Visual */}
          <div className="mt-3 p-3.5 rounded bg-[#1c2026] border border-[#262a31]">
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#ffb4ab]">57.1%</span>
                <span className="font-mono text-xs text-[#8c90a0]">Evidence Yield</span>
              </div>
              <div className="font-mono text-xs text-[#dfe2eb]">
                <span className="text-[#dfe2eb] font-semibold">4</span> observed /{' '}
                <span className="text-[#8c90a0]">7 expected</span>
              </div>
            </div>
            {/* Custom Dual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-[#31353c] overflow-hidden flex">
              <div className="h-full bg-[#7bdb80]" style={{ width: '57.1%' }} title="Verified: 57.1%"></div>
              <div className="h-full bg-[#ffb693]" style={{ width: '14.3%' }} title="Partial: 14.3%"></div>
              <div className="h-full bg-[#ffb4ab]" style={{ width: '28.6%' }} title="Missing: 28.6%"></div>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-[#c2c6d6] uppercase tracking-wider font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#7bdb80]"></span> Verified (4)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ffb693]"></span> Partial (1)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span> Missing (2)
              </span>
            </div>
          </div>

          {/* Critical Caveat Callout */}
          <div className="mt-3 p-2.5 rounded bg-[#1c2026]/70 border border-[#262a31] flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#afc6ff] shrink-0 mt-0.5">info</span>
            <p className="text-xs text-[#c2c6d6] leading-relaxed">
              <span className="text-[#dfe2eb] font-medium">Analytical Protocol SEC-403-B:</span> Evidence coverage is below the expected requirement (4 ÷ 7 = 57.1%); does not imply control execution failure. Verifies only that required machine-readable corroboration was absent during indexing.
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31]">
              <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Unresolved Gaps</span>
              <div className="text-base font-bold text-[#ffb4ab] mt-0.5">3 Items</div>
              <span className="font-mono text-[11px] text-[#c2c6d6]">Telemetry absent</span>
            </div>
            <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31]">
              <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Mapping Confidence</span>
              <div className="text-base font-bold text-[#7bdb80] mt-0.5">74.2%</div>
              <span className="font-mono text-[11px] text-[#c2c6d6]">Heuristic scoring</span>
            </div>
          </div>
        </div>

        {/* Card 2: Coverage Gap Breakdown & Status Composition (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base text-[#dfe2eb] font-semibold">Gap Item Anatomy</h2>
            <span className="font-mono text-xs text-[#afc6ff]">CTRL-07 DEFICIT</span>
          </div>
          <p className="text-xs text-[#c2c6d6] mb-3">
            Granular taxonomy of unobserved elements required by standard incident handling mandates.
          </p>

          {/* SVG Donut Chart and Legend */}
          <div className="flex items-center gap-3 p-2.5 rounded bg-[#1c2026] border border-[#262a31] mb-3">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle className="text-[#31353c]" cx="18" cy="18" fill="none" r="14" stroke="currentColor" strokeWidth="3.5" />
                {/* Missing: 2 items (50%) */}
                <circle className="text-[#ffb4ab]" cx="18" cy="18" fill="none" r="14" stroke="currentColor" strokeDasharray="44 88" strokeDashoffset="0" strokeWidth="3.5" />
                {/* Not Submitted: 1 item (25%) */}
                <circle className="text-[#ffb693]" cx="18" cy="18" fill="none" r="14" stroke="currentColor" strokeDasharray="22 88" strokeDashoffset="-44" strokeWidth="3.5" />
                {/* Pending Mapping: 1 item (25%) */}
                <circle className="text-[#afc6ff]" cx="18" cy="18" fill="none" r="14" stroke="currentColor" strokeDasharray="22 88" strokeDashoffset="-66" strokeWidth="3.5" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-base font-bold text-[#dfe2eb] leading-none">4</span>
                <span className="text-[9px] text-[#8c90a0] uppercase font-mono">Gaps</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#dfe2eb]">
                  <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span> Missing
                </span>
                <span className="font-mono text-[#c2c6d6]">2 (50%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#dfe2eb]">
                  <span className="w-2 h-2 rounded-full bg-[#ffb693]"></span> Not Submitted
                </span>
                <span className="font-mono text-[#c2c6d6]">1 (25%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#dfe2eb]">
                  <span className="w-2 h-2 rounded-full bg-[#afc6ff]"></span> Pending Map
                </span>
                <span className="font-mono text-[#c2c6d6]">1 (25%)</span>
              </div>
            </div>
          </div>

          {/* Specific Gap Item List */}
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="p-2 rounded bg-[#1c2026] flex items-center justify-between border border-[#262a31]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">close</span>
                <span className="font-mono text-xs text-[#dfe2eb] truncate">EVD-REQ-07.3: Out-of-band PagerDuty logs</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#ffb4ab]/20 text-[#ffb4ab] font-bold shrink-0">
                MISSING
              </span>
            </div>
            <div className="p-2 rounded bg-[#1c2026] flex items-center justify-between border border-[#262a31]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">close</span>
                <span className="font-mono text-xs text-[#dfe2eb] truncate">EVD-REQ-07.5: Post-Incident Stakeholder Signoff</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#ffb4ab]/20 text-[#ffb4ab] font-bold shrink-0">
                MISSING
              </span>
            </div>
            <div className="p-2 rounded bg-[#1c2026] flex items-center justify-between border border-[#262a31]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-[#ffb693]">hourglass_bottom</span>
                <span className="font-mono text-xs text-[#dfe2eb] truncate">EVD-REQ-07.6: Board Severity Notification</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#ffb693]/20 text-[#ffb693] font-bold shrink-0">
                NOT SUBMITTED
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Negative Space Integration (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-1.5 py-0.5 rounded bg-[#1f6feb] text-white text-[10px] uppercase font-bold">
                CORRELATED SIGNAL
              </span>
              <span className="font-mono text-xs text-[#8c90a0]">PIPELINE #4</span>
            </div>
            <h2 className="text-base text-[#dfe2eb] font-semibold">Negative Space Feed</h2>
            <p className="text-xs text-[#c2c6d6] mt-1">
              CTRL-07 evidentiary deficit directly links to active supervisory candidate:
            </p>
            <div className="p-3 rounded bg-[#1c2026] border border-[#262a31] mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#afc6ff] font-bold">NS-0041</span>
                <span className="px-1.5 py-0.5 rounded bg-[#ffb4ab]/20 text-[#ffb4ab] text-[10px] font-bold">
                  HIGH SEVERITY
                </span>
              </div>
              <div className="text-xs font-semibold text-[#dfe2eb]">Escalation Telemetry Absent from Security Archive</div>
              <p className="text-xs text-[#c2c6d6] mt-1">
                Log extraction completed across 18 SIEM nodes, but P1/P0 escalation events failed to produce corresponding ITSM webhooks.
              </p>
              <div className="mt-2 pt-2 border-t border-[#262a31] flex items-center justify-between font-mono text-xs text-[#8c90a0]">
                <span>Hypothesis Confidence</span>
                <span className="text-[#7bdb80] font-bold">88.4%</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2">
            <Link
              to="/analytics/negative-space"
              className="w-full py-1.5 px-3 rounded bg-[#262a31] hover:bg-[#31353c] text-[#afc6ff] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Open Negative Space Analysis</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Coverage Ledger (Dense Data Table) */}
      <div className="flex flex-col p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#dfe2eb] font-semibold">Control Coverage Ledger</span>
              <span className="px-2 py-0.5 rounded bg-[#1c2026] font-mono text-xs text-[#c2c6d6]">
                {filteredControls.length} of 20 Controls Indexed
              </span>
            </div>
            <p className="text-xs text-[#c2c6d6]">
              Deterministic expected-to-observed evidentiary mapping per NCIIPC SOC Framework v2.4.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1c2026] border border-[#262a31]">
              <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">search</span>
              <input
                className="bg-transparent text-xs text-[#dfe2eb] placeholder:text-[#8c90a0] focus:outline-none w-56"
                placeholder="Filter controls, signals, or tags..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setActiveModal('note')}
              className="px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs flex items-center gap-1.5 border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>Columns</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border border-[#262a31] rounded">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1c2026] text-[11px] text-[#8c90a0] uppercase tracking-wider font-semibold border-b border-[#262a31]">
                <th className="py-2.5 px-3.5">Control ID</th>
                <th className="py-2.5 px-3.5">Control Specification</th>
                <th className="py-2.5 px-3.5 text-right">Expected</th>
                <th className="py-2.5 px-3.5 text-right">Observed</th>
                <th className="py-2.5 px-3.5">Coverage %</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">Evidence Strength</th>
                <th className="py-2.5 px-3.5">Uncertainty</th>
                <th className="py-2.5 px-3.5">Signals</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a31] text-xs font-sans">
              {filteredControls.map((ctrl) => {
                const isSelected = selectedControl === ctrl.id;
                return (
                  <tr
                    key={ctrl.id}
                    onClick={() => setSelectedControl(ctrl.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#1c2026]' : 'hover:bg-[#1c2026]/60'
                    }`}
                  >
                    <td className="py-2.5 px-3.5 font-mono text-xs font-bold text-[#afc6ff]">
                      <div className="flex items-center gap-1.5">
                        {ctrl.status === 'GAP' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-ping"></span>
                        )}
                        <span>{ctrl.id}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-[#dfe2eb] font-medium">{ctrl.name}</td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#c2c6d6]">{ctrl.expected}</td>
                    <td
                      className={`py-2.5 px-3.5 text-right font-mono font-semibold ${
                        ctrl.coveragePct === 100
                          ? 'text-[#7bdb80]'
                          : ctrl.coveragePct >= 70
                          ? 'text-[#ffb693]'
                          : 'text-[#ffb4ab]'
                      }`}
                    >
                      {ctrl.observed}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 rounded-full bg-[#31353c] overflow-hidden">
                          <div
                            className={`h-full ${
                              ctrl.coveragePct === 100
                                ? 'bg-[#7bdb80]'
                                : ctrl.coveragePct >= 70
                                ? 'bg-[#ffb693]'
                                : 'bg-[#ffb4ab]'
                            }`}
                            style={{ width: `${ctrl.coveragePct}%` }}
                          ></div>
                        </div>
                        <span
                          className={`font-mono text-xs font-bold ${
                            ctrl.coveragePct === 100
                              ? 'text-[#7bdb80]'
                              : ctrl.coveragePct >= 70
                              ? 'text-[#ffb693]'
                              : 'text-[#ffb4ab]'
                          }`}
                        >
                          {ctrl.coveragePct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ctrl.status === 'FULL'
                            ? 'bg-[#007124]/30 text-[#91f294]'
                            : ctrl.status === 'PARTIAL'
                            ? 'bg-[#c55100]/30 text-[#ffb693]'
                            : 'bg-[#93000a]/40 text-[#ffb4ab]'
                        }`}
                      >
                        {ctrl.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-medium ${
                          ctrl.strength === 'STRONG'
                            ? 'bg-[#1c2026] text-[#7bdb80]'
                            : ctrl.strength === 'MEDIUM'
                            ? 'bg-[#1c2026] text-[#ffb693]'
                            : 'bg-[#1c2026] text-[#ffb4ab]'
                        }`}
                      >
                        {ctrl.strength}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-[#c2c6d6]">{ctrl.uncertainty}</td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1">
                        {ctrl.signals.map((sig, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-1.5 py-0.5 rounded bg-[#262a31] font-mono text-[10px] text-[#dfe2eb]"
                          >
                            {sig}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedControl(ctrl.id);
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

        {/* Table Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-1 text-xs">
          <div className="font-mono text-[#c2c6d6]">
            Showing <span className="text-[#dfe2eb] font-semibold">{filteredControls.length}</span> of{' '}
            <span className="text-[#dfe2eb] font-semibold">20</span> core monitored security controls
          </div>
          <div className="flex items-center gap-1 font-mono">
            <span className="px-2 py-0.5 rounded bg-[#1f6feb] text-white font-bold">1</span>
            <span className="px-2 py-0.5 rounded bg-[#1c2026] text-[#c2c6d6]">2</span>
            <span className="px-2 py-0.5 rounded bg-[#1c2026] text-[#c2c6d6]">3</span>
          </div>
        </div>
      </div>

      {/* Control Coverage Matrix (Heatmap / Evidence Lifecycle vs Controls) */}
      <div className="flex flex-col p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-col">
            <h2 className="text-base text-[#dfe2eb] font-semibold">Control Coverage Matrix</h2>
            <p className="text-xs text-[#c2c6d6]">
              Mapping controls across incident response lifecycle stages to uncover systemic phase-level blindspots.
            </p>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase text-[#c2c6d6] font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7bdb80]"></span> Covered</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ffb693]"></span> Partial</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]"></span> Missing</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#31353c]"></span> N/A</span>
          </div>
        </div>

        {/* Matrix Grid Layout */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px] flex flex-col gap-1">
            {/* Header Lifecycle Stages */}
            <div className="grid grid-cols-8 gap-1 text-[11px] text-[#8c90a0] uppercase font-mono font-semibold pb-1 border-b border-[#262a31]">
              <div className="col-span-1">Control</div>
              <div className="text-center">Alert</div>
              <div className="text-center">Case</div>
              <div className="text-center">Investigation</div>
              <div className="text-center">Escalation</div>
              <div className="text-center">Response</div>
              <div className="text-center">Closure</div>
              <div className="text-center">Remediation</div>
            </div>

            {/* Matrix Row 1: CTRL-01 */}
            <div className="grid grid-cols-8 gap-1 items-center p-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] transition-colors">
              <div className="font-mono text-xs text-[#afc6ff] font-bold pl-1">CTRL-01</div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded bg-[#31353c]" title="N/A"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded bg-[#31353c]" title="N/A"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded bg-[#31353c]" title="N/A"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
            </div>

            {/* Matrix Row 2: CTRL-03 */}
            <div className="grid grid-cols-8 gap-1 items-center p-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] transition-colors">
              <div className="font-mono text-xs text-[#afc6ff] font-bold pl-1">CTRL-03</div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded bg-[#31353c]" title="N/A"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#ffb693]" title="Partial"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded bg-[#31353c]" title="N/A"></span></div>
            </div>

            {/* Matrix Row 3: CTRL-07 (Focus) */}
            <div className="grid grid-cols-8 gap-1 items-center p-1.5 rounded bg-[#262a31] border border-[#ffb4ab]/40 shadow-sm">
              <div className="font-mono text-xs text-[#ffb4ab] font-bold pl-1 flex items-center gap-1">
                <span>CTRL-07</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded bg-[#31353c]" title="N/A"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#ffb693] ring-2 ring-[#ffb693]/40" title="Partial Escalation Record"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#ffb4ab] ring-2 ring-[#ffb4ab]/40 animate-pulse" title="Missing Response Evidence"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#ffb4ab] ring-2 ring-[#ffb4ab]/40" title="Missing Remediation Validation"></span></div>
            </div>

            {/* Matrix Row 4: CTRL-11 */}
            <div className="grid grid-cols-8 gap-1 items-center p-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] transition-colors">
              <div className="font-mono text-xs text-[#afc6ff] font-bold pl-1">CTRL-11</div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
            </div>

            {/* Matrix Row 5: CTRL-15 */}
            <div className="grid grid-cols-8 gap-1 items-center p-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] transition-colors">
              <div className="font-mono text-xs text-[#afc6ff] font-bold pl-1">CTRL-15</div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded bg-[#31353c]" title="N/A"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#ffb693]" title="Partial"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#ffb4ab]" title="Missing"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#7bdb80]" title="Covered"></span></div>
              <div className="flex justify-center"><span className="w-3.5 h-3.5 rounded-full bg-[#ffb693]" title="Partial"></span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Panels & Deep Dives (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Panel A: Evidence-to-Control Mapping & Unmapped Queue */}
        <div className="flex flex-col p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base text-[#dfe2eb] font-semibold">Evidence-to-Control Mapping</h2>
            <span className="px-1.5 py-0.5 rounded bg-[#1c2026] font-mono text-[11px] text-[#afc6ff]">
              INGESTION STREAM
            </span>
          </div>
          <p className="text-xs text-[#c2c6d6] mb-3">
            Verified ingested records assigned to CTRL-07, with automated attribution scores.
          </p>

          <div className="flex flex-col gap-1.5 mb-3">
            {/* Item 1 */}
            <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#7bdb80]">verified</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-[#dfe2eb] font-bold">EVD-742</span>
                    <span className="text-xs text-[#c2c6d6]">Investigation Record</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#8c90a0]">Source: Jira Case Mgmt • Target: CTRL-07</span>
                </div>
              </div>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#007124]/30 text-[#91f294] font-semibold">
                MAPPED 96%
              </span>
            </div>

            {/* Item 2 */}
            <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#7bdb80]">verified</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-[#dfe2eb] font-bold">EVD-761</span>
                    <span className="text-xs text-[#c2c6d6]">Response Containment Log</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#8c90a0]">Source: Cortex XSOAR • Target: CTRL-07</span>
                </div>
              </div>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#007124]/30 text-[#91f294] font-semibold">
                MAPPED 92%
              </span>
            </div>

            {/* Item 3 */}
            <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#ffb693]">warning</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-[#dfe2eb] font-bold">ESC-221</span>
                    <span className="text-xs text-[#c2c6d6]">Escalation Syslog Payload</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#8c90a0]">Source: Syslog Gateway • Target: CTRL-07</span>
                </div>
              </div>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#c55100]/30 text-[#ffb693] font-semibold">
                PARTIAL 74%
              </span>
            </div>
          </div>

          {/* Unmapped Queue Spotlight */}
          <div className="p-3 rounded bg-[#262a31] border border-[#31353c] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#afc6ff] animate-pulse"></span>
                <span className="text-[10px] text-[#afc6ff] uppercase font-bold tracking-wider">
                  UNMAPPED TELEMETRY CANDIDATE
                </span>
              </div>
              <span className="font-mono text-xs text-[#8c90a0]">QUEUE ID: #109</span>
            </div>
            <div className="mt-1">
              <div className="font-mono text-xs text-[#dfe2eb] font-bold">EVD-781 — Case Note Raw Export (.json)</div>
              <p className="text-xs text-[#c2c6d6] mt-0.5">
                Orphaned evidentiary item with high similarity to CTRL-07. Heuristic classification suggestions:
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-1.5 py-0.5 rounded bg-[#1c2026] font-mono text-[11px] text-[#dfe2eb]">
                  Suggested: <span className="text-[#7bdb80] font-bold">CTRL-03 (78%)</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#1c2026] font-mono text-[11px] text-[#dfe2eb]">
                  Secondary: <span className="text-[#ffb693] font-bold">CTRL-07 (64%)</span>
                </span>
              </div>
            </div>
            <div className="mt-2.5 flex justify-end">
              <button
                onClick={() => setActiveModal('unmapped')}
                className="px-3 py-1.5 rounded bg-[#1f6feb] text-white text-xs font-semibold hover:bg-[#afc6ff] hover:text-[#002d6d] transition-colors shadow-sm"
              >
                Review Mapping & Assign
              </button>
            </div>
          </div>
        </div>

        {/* Panel B: Capability Coverage & Longitudinal Trajectory */}
        <div className="flex flex-col p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base text-[#dfe2eb] font-semibold">Capability vs Evidence Trajectory</h2>
            <span className="font-mono text-xs text-[#7bdb80]">Q3 2026 BENCHMARK</span>
          </div>
          <p className="text-xs text-[#c2c6d6] mb-3">
            Comparison between entity self-claimed capabilities and verifiable machine evidence, plus 4-quarter trend.
          </p>

          {/* Claimed vs Backed Comparison */}
          <div className="p-3 rounded bg-[#1c2026] border border-[#262a31] mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#dfe2eb] font-medium">Claimed Capability vs Verified Ground Truth</span>
              <Link to="/supervision/cses/CSE-014" className="font-mono text-xs text-[#afc6ff] hover:underline">
                Open CSE Detail
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mt-2">
              <div className="p-2 rounded bg-[#181c22] border border-[#262a31]">
                <span className="text-[10px] text-[#8c90a0] uppercase font-mono">Self-Claimed</span>
                <div className="text-lg font-bold text-[#dfe2eb]">24</div>
                <span className="font-mono text-[10px] text-[#8c90a0]">Capabilities</span>
              </div>
              <div className="p-2 rounded bg-[#181c22] border border-[#262a31]">
                <span className="text-[10px] text-[#8c90a0] uppercase font-mono">Evidence-Backed</span>
                <div className="text-lg font-bold text-[#7bdb80]">19</div>
                <span className="font-mono text-[10px] text-[#7bdb80]">79.2% Substantive</span>
              </div>
              <div className="p-2 rounded bg-[#181c22] border border-[#262a31]">
                <span className="text-[10px] text-[#8c90a0] uppercase font-mono">Discrepancy</span>
                <div className="text-lg font-bold text-[#ffb4ab]">5</div>
                <span className="font-mono text-[10px] text-[#ffb4ab]">Unsubstantiated</span>
              </div>
            </div>
          </div>

          {/* Longitudinal Trendline */}
          <div className="flex flex-col p-3 rounded bg-[#1c2026] border border-[#262a31] flex-1 justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-[#8c90a0] uppercase font-semibold">
                Longitudinal Historical Coverage (Trailing 4 Quarters)
              </span>
              <span className="font-mono text-xs text-[#ffb693]">−5% from Q1 Peak</span>
            </div>
            {/* Inline SVG Visualization */}
            <div className="relative w-full h-24">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
                <line className="text-[#31353c]" stroke="currentColor" strokeDasharray="2 2" strokeWidth="1" x1="0" x2="400" y1="20" y2="20" />
                <line className="text-[#31353c]" stroke="currentColor" strokeDasharray="2 2" strokeWidth="1" x1="0" x2="400" y1="60" y2="60" />
                <defs>
                  <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1f6feb" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1f6feb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon fill="url(#trendGradient)" points="40,65 140,50 240,25 340,40 340,90 40,90" />
                <polyline fill="none" points="40,65 140,50 240,25 340,40" stroke="#afc6ff" strokeWidth="2.5" />
                <circle className="fill-[#afc6ff] stroke-[#10141a]" cx="40" cy="65" r="4" strokeWidth="2" />
                <circle className="fill-[#afc6ff] stroke-[#10141a]" cx="140" cy="50" r="4" strokeWidth="2" />
                <circle className="fill-[#7bdb80] stroke-[#10141a]" cx="240" cy="25" r="4" strokeWidth="2" />
                <circle className="fill-[#ffb693] stroke-[#10141a]" cx="340" cy="40" r="4" strokeWidth="2" />
              </svg>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px] pt-1">
              <div><span className="text-[#8c90a0]">Q2 '25:</span> <span className="text-[#dfe2eb] font-semibold">79%</span></div>
              <div><span className="text-[#8c90a0]">Q4 '25:</span> <span className="text-[#dfe2eb] font-semibold">84%</span></div>
              <div><span className="text-[#8c90a0]">Q1 '26:</span> <span className="text-[#7bdb80] font-bold">91%</span></div>
              <div><span className="text-[#8c90a0]">Q3 '26:</span> <span className="text-[#ffb693] font-bold">86%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Evidence Fusion Graph & Examiner Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Panel C: Evidence Fusion & Traceability Graph (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#afc6ff]">hub</span>
              <h2 className="text-base text-[#dfe2eb] font-semibold">Evidence Fusion & Traceability Chain</h2>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#1c2026] font-mono text-[11px] text-[#dfe2eb]">
              SYNTHESIS GRAPH
            </span>
          </div>
          <p className="text-xs text-[#c2c6d6] mb-3">
            Multi-signal convergence connecting low evidence coverage to active supervisory findings.
          </p>

          {/* Fusion Flow Representation */}
          <div className="p-3.5 rounded bg-[#1c2026] border border-[#262a31] flex flex-col gap-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Signal 1 */}
              <div className="p-2 rounded bg-[#181c22] border border-[#262a31] flex flex-col">
                <span className="text-[10px] text-[#ffb4ab] uppercase font-bold">Coverage Gap</span>
                <span className="font-mono text-xs text-[#dfe2eb] font-bold">CTRL-07 (57%)</span>
                <span className="text-[11px] text-[#c2c6d6] leading-tight mt-0.5">3 records missing</span>
              </div>
              {/* Signal 2 */}
              <div className="p-2 rounded bg-[#181c22] border border-[#262a31] flex flex-col">
                <span className="text-[10px] text-[#ffb693] uppercase font-bold">Negative Space</span>
                <span className="font-mono text-xs text-[#dfe2eb] font-bold">NS-0041</span>
                <span className="text-[11px] text-[#c2c6d6] leading-tight mt-0.5">Absent syslog telemetry</span>
              </div>
              {/* Signal 3 */}
              <div className="p-2 rounded bg-[#181c22] border border-[#262a31] flex flex-col">
                <span className="text-[10px] text-[#afc6ff] uppercase font-bold">Execution Gap</span>
                <span className="font-mono text-xs text-[#dfe2eb] font-bold">GAP-0071</span>
                <span className="text-[11px] text-[#c2c6d6] leading-tight mt-0.5">P1 webhook silence</span>
              </div>
            </div>

            <div className="flex items-center justify-center py-1 text-[#8c90a0]">
              <span className="material-symbols-outlined text-[18px]">south</span>
              <span className="font-mono text-[11px] text-[#c2c6d6] px-2">
                Correlated via Process Deviation (PD-0031) • 2 Quarters Recurrence
              </span>
              <span className="material-symbols-outlined text-[18px]">south</span>
            </div>

            {/* Synthesis Result Finding Candidate */}
            <div className="p-3 rounded bg-[#262a31] border border-[#31353c] shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-[#ffb4ab]/20 text-[#ffb4ab]">
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#ffb4ab] font-bold">FND-0142</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#ffb693]/20 text-[#ffb693] text-[9px] font-bold uppercase">
                      UNDER REVIEW
                    </span>
                  </div>
                  <span className="text-xs text-[#dfe2eb] font-medium">
                    Uncorroborated Critical Incident Escalation Chain
                  </span>
                  <span className="font-mono text-[10px] text-[#8c90a0]">Severity: P1 | Regulatory Breach Risk: Elevated</span>
                </div>
              </div>
              <Link
                to="/assessment/findings/FND-0142"
                className="px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#31353c] text-[#afc6ff] text-xs font-semibold border border-[#31353c]"
              >
                View Dossier
              </Link>
            </div>
          </div>
        </div>

        {/* Panel D: Examiner Actions & Uncertainty Parameters (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base text-[#dfe2eb] font-semibold">Supervisory Actions</h2>
              <span className="text-[10px] text-[#7bdb80] font-bold font-mono">SEC-403 AUTHORIZED</span>
            </div>
            <p className="text-xs text-[#c2c6d6] mb-3">
              Accredited examiner actions to adjudicate coverage deficits for CTRL-07.
            </p>

            {/* Examiner Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setActiveModal('request')}
                className="p-2.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-left flex flex-col transition-colors border border-[#262a31] shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-[#afc6ff] text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">outbox</span>
                  <span>Request Evidence</span>
                </div>
                <span className="font-mono text-[10px] text-[#8c90a0] mt-1">Solicit missing ESC-221 logs</span>
              </button>

              <button
                onClick={() => handleExecuteAction('Control marked Not Applicable under Sec-403 statutory exemption.')}
                className="p-2.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-left flex flex-col transition-colors border border-[#262a31] shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-[#ffb693] text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">do_not_disturb_on</span>
                  <span>Mark Not Applicable</span>
                </div>
                <span className="font-mono text-[10px] text-[#8c90a0] mt-1">Statutory exemption reason</span>
              </button>

              <button
                onClick={() => setActiveModal('finding')}
                className="p-2.5 rounded bg-[#1f6feb] text-white hover:bg-[#afc6ff] hover:text-[#002d6d] text-left flex flex-col transition-colors shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">assignment_late</span>
                  <span>Create Finding Candidate</span>
                </div>
                <span className="font-mono text-[10px] opacity-80 mt-1">Push to /findings queue</span>
              </button>

              <button
                onClick={() => setActiveModal('note')}
                className="p-2.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-left flex flex-col transition-colors border border-[#262a31] shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-[#dfe2eb] text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">note_add</span>
                  <span>Add Examiner Note</span>
                </div>
                <span className="font-mono text-[10px] text-[#8c90a0] mt-1">Attach memo to audit record</span>
              </button>
            </div>

            {/* Uncertainty Indices */}
            <div className="p-3 rounded bg-[#1c2026] border border-[#262a31]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">
                  Model Uncertainty Parameters
                </span>
                <span className="font-mono text-[10px] text-[#7bdb80] font-bold">FIPS-140 COMPLIANT</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#c2c6d6]">Coverage Integrity:</span>
                  <span className="font-mono text-[#dfe2eb] font-bold">86.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#c2c6d6]">Mapping Confidence:</span>
                  <span className="font-mono text-[#7bdb80] font-bold">92.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#c2c6d6]">Dataset Completeness:</span>
                  <span className="font-mono text-[#dfe2eb] font-bold">86.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#c2c6d6]">Unknown Records:</span>
                  <span className="font-mono text-[#ffb693] font-bold">3 items</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#8c90a0] pt-2 border-t border-[#262a31]">
            <span>EXAMINER-ID: NC-8802</span>
            <span>SESSION: ENCRYPTED-TLS-1.3</span>
          </div>
        </div>
      </div>

      {/* Modals Suite */}
      {/* 1. Request Evidence Modal */}
      {activeModal === 'request' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#181c22] border border-[#262a31] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#afc6ff]">outbox</span>
                <h3 className="text-base font-bold text-[#dfe2eb]">Issue Formal Evidence Subpoena</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#8c90a0] hover:text-[#dfe2eb]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs text-[#c2c6d6]">
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Target Regulated Entity</label>
                <div className="p-2 rounded bg-[#1c2026] text-[#dfe2eb] font-mono mt-1">CSE-014 (NorthGrid Energy)</div>
              </div>
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Missing Corroboration Artifacts</label>
                <div className="p-2 rounded bg-[#1c2026] text-[#ffb4ab] font-mono mt-1">
                  EVD-REQ-07.3: Out-of-band PagerDuty logs<br />
                  EVD-REQ-07.5: Post-Incident Stakeholder Signoff
                </div>
              </div>
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Statutory Return Deadline</label>
                <input
                  type="date"
                  defaultValue="2026-10-15"
                  className="w-full p-2 rounded bg-[#1c2026] border border-[#262a31] text-[#dfe2eb] font-mono mt-1 focus:outline-none"
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
                onClick={() => handleExecuteAction('Formal Evidence Subpoena dispatched under Sec-403 statutory authority.')}
                className="px-4 py-1.5 rounded bg-[#1f6feb] hover:bg-[#afc6ff] hover:text-[#002d6d] text-white text-xs font-semibold"
              >
                Issue Subpoena
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Create Finding Candidate Modal */}
      {activeModal === 'finding' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#181c22] border border-[#262a31] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb4ab]">assignment_late</span>
                <h3 className="text-base font-bold text-[#dfe2eb]">Create Finding Candidate from Coverage Gap</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#8c90a0] hover:text-[#dfe2eb]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs text-[#c2c6d6]">
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Correlated Control</label>
                <div className="p-2 rounded bg-[#1c2026] text-[#dfe2eb] font-mono mt-1">CTRL-07 (Incident Escalation & Review)</div>
              </div>
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Finding Candidate Title</label>
                <input
                  type="text"
                  defaultValue="Unsubstantiated Severity-1 Incident Escalation Telemetry"
                  className="w-full p-2 rounded bg-[#1c2026] border border-[#262a31] text-[#dfe2eb] mt-1 focus:outline-none"
                />
              </div>
              <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31] text-[11px]">
                <span className="text-[#ffb693] font-bold">Rule Check:</span> Evidence coverage is 57.1%. Signal will be pushed to the Examiner Triage queue with FIPS cryptographic timestamp.
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
                onClick={() => handleExecuteAction('Finding Candidate FND-0143 submitted to /findings queue.')}
                className="px-4 py-1.5 rounded bg-[#1f6feb] hover:bg-[#afc6ff] hover:text-[#002d6d] text-white text-xs font-semibold"
              >
                Submit Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add Note / Configure Modal */}
      {activeModal === 'note' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#181c22] border border-[#262a31] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#afc6ff]">note_add</span>
                <h3 className="text-base font-bold text-[#dfe2eb]">Attach Examiner Note</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#8c90a0] hover:text-[#dfe2eb]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2 text-xs text-[#c2c6d6]">
              <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Supervisory Observation</label>
              <textarea
                rows={4}
                defaultValue="Examined SIEM retention policy for CSE-014; missing PagerDuty webhook evidence appears linked to out-of-band maintenance during Q3 incident response window."
                className="w-full p-2.5 rounded bg-[#1c2026] border border-[#262a31] text-[#dfe2eb] focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262a31]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-xs text-[#c2c6d6]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteAction('Examiner Note sealed into cryptographic audit ledger.')}
                className="px-4 py-1.5 rounded bg-[#afc6ff] text-[#002d6d] font-semibold text-xs hover:bg-[#d9e2ff]"
              >
                Save Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Unmapped Queue Review Modal */}
      {activeModal === 'unmapped' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#181c22] border border-[#262a31] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7bdb80]">rule</span>
                <h3 className="text-base font-bold text-[#dfe2eb]">Assign Unmapped Telemetry Artifact</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#8c90a0] hover:text-[#dfe2eb]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs text-[#c2c6d6]">
              <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31]">
                <span className="font-mono text-xs text-[#dfe2eb] font-bold">EVD-781 — Case Note Raw Export (.json)</span>
                <div className="text-[11px] text-[#8c90a0] mt-0.5">Ingested via TLS 1.3 stream from CSE-014 ServiceNow connector.</div>
              </div>
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Assign to Target Control</label>
                <select className="w-full p-2 rounded bg-[#1c2026] border border-[#262a31] text-[#dfe2eb] mt-1 focus:outline-none">
                  <option value="CTRL-07">CTRL-07: Incident Escalation & Review Process (Recommended 64%)</option>
                  <option value="CTRL-03">CTRL-03: Investigation Case Management Timelines (78%)</option>
                  <option value="CTRL-15">CTRL-15: Response Validation & Containment Efficacy</option>
                </select>
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
                onClick={() => handleExecuteAction('Artifact EVD-781 successfully mapped to CTRL-07. Coverage increased to 71.4%.')}
                className="px-4 py-1.5 rounded bg-[#7bdb80] text-[#00390e] font-semibold text-xs hover:bg-[#97f999]"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
