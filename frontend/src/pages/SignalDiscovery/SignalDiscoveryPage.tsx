import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface SignalItem {
  id: string;
  taxonomyType: string;
  title: string;
  pattern: string;
  entities: string;
  occurrences: number;
  strengthLabel: 'STRONG' | 'MED-HIGH' | 'MEDIUM';
  strengthPct: number;
  temporalContext: string;
  cycles: string;
  uncertainty: 'LOW' | 'MODERATE' | 'HIGH';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'UNDER REVIEW' | 'CANDIDATE';
}

const MOCK_SIGNALS: SignalItem[] = [
  {
    id: 'SIG-0024',
    taxonomyType: 'Execution Gap',
    title: 'Missing escalation after investigation in high-voltage dispatch',
    pattern: 'Pattern: INV_CLOSE without ESC_DISPATCH in SCADA zone',
    entities: '3 CSEs (014, 021, 027)',
    occurrences: 7,
    strengthLabel: 'STRONG',
    strengthPct: 88,
    temporalContext: 'Recurring (3 cycles)',
    cycles: 'Q2-25, Q4-25, Q3-26',
    uncertainty: 'MODERATE',
    priority: 'CRITICAL',
    status: 'UNDER REVIEW',
  },
  {
    id: 'SIG-0021',
    taxonomyType: 'Negative Space',
    title: 'Expected escalation telemetry absent from cold storage archives',
    pattern: 'Zero ingest for syslog channel port 514 across 180 days',
    entities: '4 CSEs (004, 014, 019, 031)',
    occurrences: 9,
    strengthLabel: 'MED-HIGH',
    strengthPct: 74,
    temporalContext: 'Recurring (2 cycles)',
    cycles: 'Q1-26, Q3-26',
    uncertainty: 'MODERATE',
    priority: 'HIGH',
    status: 'CANDIDATE',
  },
  {
    id: 'SIG-0018',
    taxonomyType: 'Process Deviation',
    title: 'Investigation → Containment bypass without supervisor digital signoff',
    pattern: 'Workflow step 04 skipped directly to rule isolation',
    entities: '2 CSEs (014, 021)',
    occurrences: 5,
    strengthLabel: 'STRONG',
    strengthPct: 91,
    temporalContext: 'Current Cycle',
    cycles: 'Q3-26 only',
    uncertainty: 'LOW',
    priority: 'MEDIUM',
    status: 'UNDER REVIEW',
  },
  {
    id: 'SIG-0015',
    taxonomyType: 'Consistency',
    title: 'Case closure marked without corresponding response ledger artifact',
    pattern: 'SOAR ticket closed state decoupled from SIEM event log',
    entities: '3 CSEs (008, 014, 029)',
    occurrences: 4,
    strengthLabel: 'MEDIUM',
    strengthPct: 62,
    temporalContext: 'Recurring (2 cycles)',
    cycles: 'Q4-25, Q3-26',
    uncertainty: 'HIGH',
    priority: 'MEDIUM',
    status: 'CANDIDATE',
  },
  {
    id: 'SIG-0012',
    taxonomyType: 'Capability Discrepancy',
    title: 'Claimed high-depth memory forensics exceeds observed artifact depth',
    pattern: 'Self-assessment asserts L3 forensic capability; L1 logs supplied',
    entities: '5 CSEs (002, 009, 014, 021, 035)',
    occurrences: 11,
    strengthLabel: 'STRONG',
    strengthPct: 94,
    temporalContext: 'Recurring (4 cycles)',
    cycles: 'Q3-24 to Q3-26',
    uncertainty: 'LOW',
    priority: 'HIGH',
    status: 'UNDER REVIEW',
  },
];

export const SignalDiscoveryPage: React.FC = () => {
  const [selectedSignalId, setSelectedSignalId] = useState<string>('SIG-0024');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState<null | 'create-finding' | 'request-evidence' | 'note'>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const categories = [
    'All (24)',
    'Execution Gap (7)',
    'Negative Space (5)',
    'Process Deviation (4)',
    'Behavioural (3)',
    'Historical (4)',
    'Consistency (5)',
    'Coverage (3)',
    'Capability Discrepancy (2)',
    'Cross-Source (5)',
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setActionSuccessMsg('Signal Discovery Engine v4.1 re-indexed 24 candidate patterns across portfolio.');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }, 700);
  };

  const handleExecuteAction = (msg: string) => {
    setActiveModal(null);
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  const selectedSignal = MOCK_SIGNALS.find((s) => s.id === selectedSignalId) || MOCK_SIGNALS[0];

  return (
    <div className="flex flex-col w-full pb-16 text-[#dfe2eb]">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-16 right-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded bg-[#1f6feb] text-white shadow-xl text-xs font-mono border border-blue-400 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & Institutional Status Ribbon */}
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 font-mono text-xs text-[#c2c6d6]">
            <Link to="/overview" className="text-[#afc6ff] hover:underline">SAT-SA</Link>
            <span className="text-[#8c90a0]">/</span>
            <span className="text-[#c2c6d6]">Intelligence</span>
            <span className="text-[#8c90a0]">/</span>
            <span className="text-[#dfe2eb] font-semibold">Signal Discovery</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#262a31] font-mono text-xs text-[#7bdb80] border border-[#262a31]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7bdb80] animate-pulse"></span>
              <span>DISCOVERY ENGINE v4.1 // SYNCED</span>
            </div>
            <div className="font-mono text-xs text-[#8c90a0]">HASH: 9a7f...d82e</div>
          </div>
        </div>

        {/* Title and Action Row */}
        <div className="flex flex-wrap items-end justify-between gap-4 mt-1">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl text-[#dfe2eb] font-bold tracking-tight">Signal Discovery</h1>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#007124]/30 text-[#91f294] text-[11px] font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7bdb80]"></span>
                PATTERN DETECTION ENGINE: ACTIVE
              </span>
            </div>
            <p className="text-sm text-[#c2c6d6] mt-1">
              Identify emerging supervisory patterns across evidence telemetry, process logs, verified findings, and cross-cycle historical archives.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal('note')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs transition-colors border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Configure Analysis</span>
            </button>
            <button
              onClick={() => handleExecuteAction('Signal catalog exported in STIX 2.1 / JSON format.')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs transition-colors border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export Index (STIX/JSON)</span>
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#1f6feb] hover:bg-[#afc6ff] hover:text-[#002d6d] text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>Refresh Stream</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supervisory Notice Banner */}
      <div className="my-3 p-3.5 rounded bg-[#262a31] border border-[#31353c] flex items-start gap-3">
        <div className="w-8 h-8 rounded bg-[#1f6feb]/20 flex items-center justify-center shrink-0 text-[#afc6ff]">
          <span className="material-symbols-outlined text-[20px]">policy</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase text-[#afc6ff] font-bold tracking-wider">
              Human-In-The-Loop Institutional Mandate
            </span>
            <span className="font-mono text-xs text-[#8c90a0]">// NCIIPC DIRECTIVE SEC-402</span>
          </div>
          <p className="text-xs text-[#c2c6d6] mt-1 leading-relaxed">
            <span className="text-[#dfe2eb] font-semibold">Signal candidate ≠ Confirmed finding.</span> Discovered anomalies reflect fused observational and structural discrepancies surfaced by automated heuristics. Accredited supervisory triage and manual evidentiary substantiation are strictly required before escalation to formal non-compliance.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 self-center font-mono text-xs text-[#8c90a0]">
          <span>STRICT SUPERVISION MODE</span>
          <span className="material-symbols-outlined text-[#7bdb80] text-[18px]">verified</span>
        </div>
      </div>

      {/* Summary KPI Strip (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5">
        <div className="p-3 rounded bg-[#181c22] border border-[#262a31] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8c90a0]">Signals Detected</span>
            <span className="material-symbols-outlined text-[16px]">radar</span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#dfe2eb] font-mono">24</span>
            <span className="text-xs text-[#c2c6d6]">total</span>
          </div>
          <div className="font-mono text-[11px] text-[#8c90a0] truncate">Scope: Portfolio-wide</div>
        </div>

        <div className="p-3 rounded bg-[#181c22] border border-[#262a31] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8c90a0]">New Ingested</span>
            <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">bolt</span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#afc6ff] font-mono">8</span>
            <span className="text-xs text-[#afc6ff] font-mono">+2 this wk</span>
          </div>
          <div className="font-mono text-[11px] text-[#8c90a0] truncate">Period: Q3 2026 Batch</div>
        </div>

        <div className="p-3 rounded bg-[#181c22] border border-[#262a31] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8c90a0]">Recurring Patterns</span>
            <span className="material-symbols-outlined text-[16px] text-[#ffb693]">history</span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#ffb693] font-mono">7</span>
            <span className="text-xs text-[#c2c6d6]">cycles</span>
          </div>
          <div className="font-mono text-[11px] text-[#8c90a0] truncate">&gt;= 2 Cycles Persistence</div>
        </div>

        <div className="p-3 rounded bg-[#181c22] border border-[#262a31] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8c90a0]">Cross-Source</span>
            <span className="material-symbols-outlined text-[16px] text-[#dfe2eb]">hub</span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#dfe2eb] font-mono">5</span>
            <span className="text-xs text-[#c2c6d6]">discrepant</span>
          </div>
          <div className="font-mono text-[11px] text-[#8c90a0] truncate">Multi-system divergence</div>
        </div>

        <div className="p-3 rounded bg-[#181c22] border border-[#262a31] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8c90a0]">High Priority</span>
            <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">priority_high</span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#ffb4ab] font-mono">4</span>
            <span className="text-xs text-[#ffb4ab]">urgent</span>
          </div>
          <div className="font-mono text-[11px] text-[#8c90a0] truncate">Critical entity impact</div>
        </div>

        <div className="p-3 rounded bg-[#181c22] border border-[#262a31] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#c2c6d6]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8c90a0]">Under Review</span>
            <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">assignment_ind</span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#7bdb80] font-mono">6</span>
            <span className="text-xs text-[#c2c6d6]">assigned</span>
          </div>
          <div className="font-mono text-[11px] text-[#8c90a0] truncate">Lead: Examiner NC-88</div>
        </div>
      </div>

      {/* Scope Bar & Filter Pill Strip */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded bg-[#181c22] border border-[#262a31] mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#c2c6d6]">
              <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">filter_alt</span>
              <span className="uppercase tracking-wider font-semibold">Scope:</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1c2026] text-[#dfe2eb] font-mono text-xs border border-[#262a31]">
              <span className="text-[#8c90a0]">CSE:</span>
              <span className="font-semibold text-[#afc6ff]">All CSEs (Focus: CSE-014 PowerGrid GridSec)</span>
              <span className="material-symbols-outlined text-[14px] text-[#8c90a0]">arrow_drop_down</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1c2026] text-[#dfe2eb] font-mono text-xs border border-[#262a31]">
              <span className="text-[#8c90a0]">Period:</span>
              <span className="font-semibold">Q3 2026</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1c2026] text-[#dfe2eb] font-mono text-xs border border-[#262a31]">
              <span className="text-[#8c90a0]">Min Recurrence:</span>
              <span className="font-semibold">≥ 2 Cycles</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1c2026] text-[#dfe2eb] font-mono text-xs border border-[#262a31]">
              <span className="text-[#8c90a0]">Status:</span>
              <span className="font-semibold text-[#7bdb80]">Candidate + Under Review</span>
            </div>
          </div>
          <div className="font-mono text-xs text-[#8c90a0]">
            MATCHED 24 PATTERNS
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#262a31]">
          {categories.map((cat) => {
            const isCatActive = activeCategory === cat.split(' ')[0];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat.split(' ')[0])}
                className={`px-3 py-1 rounded text-xs uppercase font-mono transition-colors ${
                  isCatActive
                    ? 'bg-[#1f6feb] text-white font-semibold'
                    : 'bg-[#1c2026] text-[#c2c6d6] hover:text-[#dfe2eb] hover:bg-[#262a31]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Signal Discovery Main Ledger Table */}
      <div className="rounded bg-[#181c22] border border-[#262a31] overflow-hidden mb-5">
        <div className="px-4 py-2.5 bg-[#0a0e14] flex items-center justify-between border-b border-[#262a31]">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#dfe2eb] font-bold font-mono">
              Signal Register // Prioritized Stream
            </span>
            <span className="font-mono text-[11px] text-[#8c90a0]">SORT: PRIORITY [DESC] • AUTO-CORRELATED</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#c2c6d6]">
            <span className="w-2 h-2 rounded-full bg-[#afc6ff]"></span>
            <span>Showing 5 High-Impact Signals</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1c2026] text-[10px] uppercase tracking-wider text-[#8c90a0] font-mono border-b border-[#262a31]">
              <tr>
                <th className="py-2.5 px-3">Signal ID</th>
                <th className="py-2.5 px-3">Taxonomy Type</th>
                <th className="py-2.5 px-3">Pattern Hypothesis / Core Anomaly</th>
                <th className="py-2.5 px-3">Affected Entities</th>
                <th className="py-2.5 px-3 text-center">Occurrences</th>
                <th className="py-2.5 px-3">Evidence Strength</th>
                <th className="py-2.5 px-3">Temporal Context</th>
                <th className="py-2.5 px-3">Uncertainty</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a31]">
              {MOCK_SIGNALS.map((sig) => {
                const isSelected = selectedSignalId === sig.id;
                return (
                  <tr
                    key={sig.id}
                    onClick={() => setSelectedSignalId(sig.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#1c2026]' : 'hover:bg-[#1c2026]/60'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#afc6ff]">
                        <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">
                          {isSelected ? 'arrow_right' : 'radio_button_unchecked'}
                        </span>
                        {sig.id}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#0a0e14] font-mono text-[10px] text-[#ffb693] font-medium border border-[#262a31]">
                        {sig.taxonomyType}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-semibold text-[#dfe2eb]">{sig.title}</div>
                      <div className="font-mono text-[11px] text-[#8c90a0] truncate mt-0.5">{sig.pattern}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-xs text-[#dfe2eb]">{sig.entities}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono text-xs font-bold text-[#dfe2eb] px-2 py-0.5 rounded bg-[#0a0e14] border border-[#262a31]">
                        {sig.occurrences} ×
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-[#7bdb80]">{sig.strengthLabel}</span>
                          <span className="text-[#8c90a0]">{sig.strengthPct}%</span>
                        </div>
                        <div className="w-20 h-1.5 rounded-full bg-[#0a0e14] overflow-hidden">
                          <div className="h-full bg-[#7bdb80] rounded-full" style={{ width: `${sig.strengthPct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-xs text-[#dfe2eb]">{sig.temporalContext}</div>
                      <div className="font-mono text-[10px] text-[#8c90a0]">{sig.cycles}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-[#0a0e14] font-mono text-[10px] text-[#c2c6d6]">
                        {sig.uncertainty}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          sig.priority === 'CRITICAL'
                            ? 'bg-[#93000a]/40 text-[#ffb4ab]'
                            : 'bg-[#262a31] text-[#ffb693]'
                        }`}
                      >
                        {sig.priority}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#007124]/30 text-[#91f294] font-mono text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7bdb80]"></span>
                        {sig.status}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`px-2.5 py-1 rounded font-mono text-xs font-semibold ${
                          isSelected ? 'bg-[#1f6feb] text-white' : 'text-[#afc6ff] hover:bg-[#262a31]'
                        }`}
                      >
                        {isSelected ? 'Active Focus' : 'Inspect'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Workspace Section for Active Signal */}
      <div className="flex flex-col gap-4">
        {/* Active Signal Banner & Action Bar */}
        <div className="p-4 rounded bg-[#181c22] border border-[#262a31] flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#1f6feb]/20 text-[#afc6ff] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">troubleshoot</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#afc6ff]">{selectedSignal.id}</span>
                <span className="px-2 py-0.5 rounded bg-[#1c2026] text-[10px] uppercase font-mono text-[#ffb693] border border-[#262a31]">
                  {selectedSignal.taxonomyType}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#93000a]/40 text-[#ffb4ab] text-[10px] uppercase font-bold font-mono">
                  Priority: {selectedSignal.priority}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#007124]/30 text-[#91f294] text-[10px] uppercase font-bold font-mono">
                  {selectedSignal.status}
                </span>
              </div>
              <div className="text-base text-[#dfe2eb] font-semibold mt-1">
                {selectedSignal.title}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveModal('create-finding')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1f6feb] text-white text-xs font-semibold shadow-sm hover:bg-[#afc6ff] hover:text-[#002d6d] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add_task</span>
              <span>Create Finding Candidate</span>
            </button>
            <button
              onClick={() => setActiveModal('request-evidence')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs transition-colors border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[16px]">contact_support</span>
              <span>Request Missing Evidence</span>
            </button>
            <button
              onClick={() => setActiveModal('note')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs transition-colors border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Add Note</span>
            </button>
            <button
              onClick={() => handleExecuteAction(`Signal ${selectedSignal.id} dismissed with examiner justification.`)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1c2026] hover:bg-[#93000a]/30 text-[#ffb4ab] text-xs transition-colors border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[16px]">block</span>
              <span>Dismiss Signal</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (8 cols): Reasoning, Pipeline Sequence, Multi-Entity */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Step-by-Step Pattern Reasoning Chain */}
            <div className="p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#afc6ff] text-[18px]">schema</span>
                  <span className="text-xs uppercase text-[#dfe2eb] font-bold tracking-wider font-mono">
                    Algorithmic Reasoning Chain
                  </span>
                </div>
                <span className="font-mono text-xs text-[#8c90a0]">TRACE: SAT-ENG-REASON-8821</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3 rounded bg-[#1c2026] border border-[#262a31]">
                  <div className="w-6 h-6 rounded-full bg-[#1f6feb] text-white font-mono text-xs flex items-center justify-center shrink-0 font-bold">1</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#dfe2eb]">High-Impact Alert Triage Correlated</span>
                      <span className="font-mono text-xs text-[#7bdb80]">EVD-742 • MATCH</span>
                    </div>
                    <p className="text-xs text-[#c2c6d6] mt-1">
                      Alert logs indicate initial triage on OT telemetry ingress in substation SCADA routing node. Alert classified as Severity-1 by analyst.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3 rounded bg-[#1c2026] border border-[#262a31]">
                  <div className="w-6 h-6 rounded-full bg-[#1f6feb] text-white font-mono text-xs flex items-center justify-center shrink-0 font-bold">2</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#dfe2eb]">Standard Control Condition Triggered: CTRL-07</span>
                      <span className="font-mono text-xs text-[#afc6ff]">RULE_MATCH: MANDATORY_DISPATCH</span>
                    </div>
                    <p className="text-xs text-[#c2c6d6] mt-1">
                      Under NCIIPC Grid Security Standard 4.2.1, confirmed Level-1 investigations into busbar control telemetry require formal incident escalation to Sectoral CERT within 60 minutes.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3 rounded bg-[#1c2026] border border-[#93000a]/40">
                  <div className="w-6 h-6 rounded-full bg-[#93000a] text-white font-mono text-xs flex items-center justify-center shrink-0 font-bold">3</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#ffb4ab]">Missing Escalation Telemetry (Negative Space)</span>
                      <span className="font-mono text-xs text-[#ffb4ab]">EVD-ABSENT • DELTA 100%</span>
                    </div>
                    <p className="text-xs text-[#c2c6d6] mt-1">
                      No outgoing API callback, encrypted dispatch telegram, or external dispatch ledger artifact recorded in case log <span className="font-mono text-[#dfe2eb]">CASE-1042</span>. Workflow skipped straight to internal resolution note.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3 p-3 rounded bg-[#1c2026] border border-[#262a31]">
                  <div className="w-6 h-6 rounded-full bg-[#262a31] text-[#dfe2eb] font-mono text-xs flex items-center justify-center shrink-0 font-bold">4</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#dfe2eb]">Cross-Period & Peer Corroboration</span>
                      <span className="font-mono text-xs text-[#ffb693]">3 CSEs • 7 OCCURRENCES</span>
                    </div>
                    <p className="text-xs text-[#c2c6d6] mt-1">
                      Same signature found in CSE-014 (3 cases), CSE-021 (2 cases), and CSE-027 (2 cases) across Q2-2025, Q4-2025, and Q3-2026 cycles.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start gap-3 p-3 rounded bg-[#1c2026] border border-[#262a31]">
                  <div className="w-6 h-6 rounded-full bg-[#007124] text-white font-mono text-xs flex items-center justify-center shrink-0 font-bold">5</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#7bdb80]">Signal Candidate Emitted</span>
                      <span className="font-mono text-xs text-[#7bdb80]">CONFIDENCE: STRONG</span>
                    </div>
                    <p className="text-xs text-[#c2c6d6] mt-1">
                      Candidate queued for accredited supervisory validation. Root hypothesis: Operational friction or intentional suppression of external escalation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expected vs Observed Visual Sequence */}
            <div className="p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase text-[#dfe2eb] font-bold tracking-wider font-mono">
                  Process Trajectory Comparison
                </span>
                <span className="font-mono text-xs text-[#8c90a0]">STANDARD: SOP-SEC-2024-V2</span>
              </div>

              {/* Expected Pipeline */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 font-mono text-xs text-[#7bdb80] mb-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span className="uppercase font-bold tracking-wider">Expected Operational Flow</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <div className="p-2 rounded bg-[#1c2026] text-center border border-[#262a31]">
                    <div className="font-mono text-[10px] text-[#8c90a0]">01. INGEST</div>
                    <div className="text-xs font-semibold text-[#dfe2eb]">Alert</div>
                  </div>
                  <div className="p-2 rounded bg-[#1c2026] text-center border border-[#262a31]">
                    <div className="font-mono text-[10px] text-[#8c90a0]">02. TRIAGE</div>
                    <div className="text-xs font-semibold text-[#dfe2eb]">Case Open</div>
                  </div>
                  <div className="p-2 rounded bg-[#1c2026] text-center border border-[#262a31]">
                    <div className="font-mono text-[10px] text-[#8c90a0]">03. ANALYSIS</div>
                    <div className="text-xs font-semibold text-[#dfe2eb]">Investigation</div>
                  </div>
                  <div className="p-2 rounded bg-[#007124]/30 text-center border border-[#007124]/50">
                    <div className="font-mono text-[10px] text-[#7bdb80]">04. ESCALATE</div>
                    <div className="text-xs font-bold text-[#7bdb80]">CTRL-07 Signal</div>
                  </div>
                  <div className="p-2 rounded bg-[#1c2026] text-center border border-[#262a31]">
                    <div className="font-mono text-[10px] text-[#8c90a0]">05. REMEDIATE</div>
                    <div className="text-xs font-semibold text-[#dfe2eb]">Response</div>
                  </div>
                  <div className="p-2 rounded bg-[#1c2026] text-center border border-[#262a31]">
                    <div className="font-mono text-[10px] text-[#8c90a0]">06. AUDIT</div>
                    <div className="text-xs font-semibold text-[#dfe2eb]">Closure</div>
                  </div>
                </div>
              </div>

              {/* Observed Pipeline */}
              <div>
                <div className="flex items-center gap-1.5 font-mono text-xs text-[#ffb4ab] mb-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span className="uppercase font-bold tracking-wider">Observed Telemetry Trace ({selectedSignal.id})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <div className="p-2 rounded bg-[#1c2026] text-center border border-[#262a31]">
                    <div className="font-mono text-[10px] text-[#8c90a0]">01. INGEST</div>
                    <div className="text-xs font-semibold text-[#dfe2eb]">Alert</div>
                  </div>
                  <div className="p-2 rounded bg-[#1c2026] text-center border border-[#262a31]">
                    <div className="font-mono text-[10px] text-[#8c90a0]">02. TRIAGE</div>
                    <div className="text-xs font-semibold text-[#dfe2eb]">Case Open</div>
                  </div>
                  <div className="p-2 rounded bg-[#1c2026] text-center border border-[#262a31]">
                    <div className="font-mono text-[10px] text-[#8c90a0]">03. ANALYSIS</div>
                    <div className="text-xs font-semibold text-[#dfe2eb]">Investigation</div>
                  </div>
                  <div className="p-2 rounded bg-[#93000a]/40 text-center border border-[#ffb4ab] animate-pulse">
                    <div className="font-mono text-[10px] text-[#ffb4ab] font-bold">04. ESCALATE</div>
                    <div className="text-xs font-bold text-[#ffb4ab]">GAP: ABSENT</div>
                  </div>
                  <div className="p-2 rounded bg-[#1c2026] text-center border border-[#262a31]">
                    <div className="font-mono text-[10px] text-[#8c90a0]">05. REMEDIATE</div>
                    <div className="text-xs font-semibold text-[#dfe2eb]">Response</div>
                  </div>
                  <div className="p-2 rounded bg-[#1c2026] text-center border border-[#262a31]">
                    <div className="font-mono text-[10px] text-[#8c90a0]">06. AUDIT</div>
                    <div className="text-xs font-semibold text-[#dfe2eb]">Closure</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Occurrences Across Covered Entities */}
            <div className="p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase text-[#dfe2eb] font-bold tracking-wider font-mono">
                  Multi-Entity Recurrence Index
                </span>
                <span className="font-mono text-xs text-[#8c90a0]">7 VALIDATED CASE INSTANCES</span>
              </div>
              <div className="overflow-x-auto border border-[#262a31] rounded">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#1c2026] text-[10px] uppercase text-[#8c90a0] border-b border-[#262a31]">
                    <tr>
                      <th className="py-2 px-3">Entity</th>
                      <th className="py-2 px-3">Assessment Cycle</th>
                      <th className="py-2 px-3">Case Reference</th>
                      <th className="py-2 px-3">Trigger Alert</th>
                      <th className="py-2 px-3">Omission Window</th>
                      <th className="py-2 px-3 text-right">Artifact Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262a31]">
                    <tr className="bg-[#1c2026]/70 hover:bg-[#262a31] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#afc6ff]">CSE-014 (PowerGrid)</td>
                      <td className="py-2.5 px-3 text-[#dfe2eb]">Q3 2026 (Current)</td>
                      <td className="py-2.5 px-3 text-[#dfe2eb]">CASE-1042</td>
                      <td className="py-2.5 px-3 text-[#c2c6d6]">SCADA_SUB_04_ANOM</td>
                      <td className="py-2.5 px-3 text-[#ffb4ab]">Missing 100%</td>
                      <td className="py-2.5 px-3 text-right text-[#7bdb80] font-semibold">Flagged</td>
                    </tr>
                    <tr className="bg-[#1c2026]/70 hover:bg-[#262a31] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#afc6ff]">CSE-014 (PowerGrid)</td>
                      <td className="py-2.5 px-3 text-[#dfe2eb]">Q4 2025</td>
                      <td className="py-2.5 px-3 text-[#dfe2eb]">CASE-0881</td>
                      <td className="py-2.5 px-3 text-[#c2c6d6]">VOLT_FREQ_TRIP_L1</td>
                      <td className="py-2.5 px-3 text-[#ffb4ab]">Missing 100%</td>
                      <td className="py-2.5 px-3 text-right text-[#8c90a0]">Archived</td>
                    </tr>
                    <tr className="bg-[#1c2026]/70 hover:bg-[#262a31] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#afc6ff]">CSE-014 (PowerGrid)</td>
                      <td className="py-2.5 px-3 text-[#dfe2eb]">Q2 2025</td>
                      <td className="py-2.5 px-3 text-[#dfe2eb]">CASE-0512</td>
                      <td className="py-2.5 px-3 text-[#c2c6d6]">RELAY_SYNCH_UNAUTH</td>
                      <td className="py-2.5 px-3 text-[#ffb4ab]">Missing 100%</td>
                      <td className="py-2.5 px-3 text-right text-[#8c90a0]">Archived</td>
                    </tr>
                    <tr className="bg-[#1c2026]/70 hover:bg-[#262a31] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#dfe2eb]">CSE-021 (HydroCorp)</td>
                      <td className="py-2.5 px-3 text-[#dfe2eb]">Q3 2026</td>
                      <td className="py-2.5 px-3 text-[#dfe2eb]">CASE-1109</td>
                      <td className="py-2.5 px-3 text-[#c2c6d6]">TURBINE_PLC_AUTH_ERR</td>
                      <td className="py-2.5 px-3 text-[#ffb4ab]">Missing 100%</td>
                      <td className="py-2.5 px-3 text-right text-[#7bdb80] font-semibold">Flagged</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Fusion, Confidence, Traceability Graph */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Evidence Fusion Breakdown Card */}
            <div className="p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase text-[#dfe2eb] font-bold tracking-wider font-mono">
                  Evidence Fusion Composition
                </span>
                <span className="font-mono text-xs text-[#afc6ff]">MULTI-STREAM</span>
              </div>
              <div className="flex flex-col gap-2.5">
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-[#dfe2eb]">Process Workflow Evidence</span>
                    <span className="font-bold text-[#dfe2eb]">35%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0a0e14] overflow-hidden">
                    <div className="h-full bg-[#afc6ff]" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-[#dfe2eb]">Case Management Telemetry</span>
                    <span className="font-bold text-[#dfe2eb]">25%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0a0e14] overflow-hidden">
                    <div className="h-full bg-[#afc6ff]" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-[#dfe2eb]">SIEM Investigation Logs</span>
                    <span className="font-bold text-[#dfe2eb]">20%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0a0e14] overflow-hidden">
                    <div className="h-full bg-[#afc6ff]" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <div className="p-2 rounded bg-[#93000a]/20 border border-[#93000a]/40">
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-[#ffb4ab] font-semibold">Escalation Dispatch Logs</span>
                    <span className="font-bold text-[#ffb4ab]">0% (ABSENT)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0a0e14] overflow-hidden">
                    <div className="h-full bg-[#ffb4ab]" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-[#dfe2eb]">Remediation & Response Artifacts</span>
                    <span className="font-bold text-[#dfe2eb]">10%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0a0e14] overflow-hidden">
                    <div className="h-full bg-[#7bdb80]" style={{ width: '10%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-[#dfe2eb]">Historical Cross-Cycle Match</span>
                    <span className="font-bold text-[#dfe2eb]">10%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0a0e14] overflow-hidden">
                    <div className="h-full bg-[#ffb693]" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Signal Confidence & Uncertainty Context */}
            <div className="p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs uppercase text-[#dfe2eb] font-bold tracking-wider font-mono">
                  Analytical Confidence Matrix
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">verified</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31]">
                  <div className="text-[10px] uppercase text-[#8c90a0] font-mono">Evidence Strength</div>
                  <div className="text-base font-bold text-[#7bdb80] mt-0.5">STRONG</div>
                  <div className="font-mono text-[10px] text-[#c2c6d6]">88% correlation</div>
                </div>
                <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31]">
                  <div className="text-[10px] uppercase text-[#8c90a0] font-mono">Completeness</div>
                  <div className="text-base font-bold text-[#dfe2eb] mt-0.5">78%</div>
                  <div className="font-mono text-[10px] text-[#c2c6d6]">2 gaps in trail</div>
                </div>
                <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31]">
                  <div className="text-[10px] uppercase text-[#8c90a0] font-mono">Cross-Source</div>
                  <div className="text-base font-bold text-[#afc6ff] mt-0.5">92%</div>
                  <div className="font-mono text-[10px] text-[#c2c6d6]">3 feeds match</div>
                </div>
                <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31]">
                  <div className="text-[10px] uppercase text-[#8c90a0] font-mono">Uncertainty</div>
                  <div className="text-base font-bold text-[#ffb693] mt-0.5">MODERATE</div>
                  <div className="font-mono text-[10px] text-[#c2c6d6]">Manual flow</div>
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#0a0e14] font-mono text-[11px] text-[#8c90a0] border border-[#262a31] leading-relaxed">
                <span className="text-[#dfe2eb] font-semibold">Methodological Disclaimer:</span> Confidence score reflects purely empirical data coverage and pattern matching strength against certified baseline templates.
              </div>
            </div>

            {/* Traceability & Knowledge Graph */}
            <div className="p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase text-[#dfe2eb] font-bold tracking-wider font-mono">
                  Traceability & Knowledge Graph
                </span>
                <span className="font-mono text-xs text-[#afc6ff]">NODES: 9</span>
              </div>
              <div className="p-2.5 rounded bg-[#0a0e14] flex flex-col gap-1 font-mono text-xs border border-[#262a31]">
                <div className="flex items-center justify-between p-1.5 rounded bg-[#1c2026] border border-[#262a31]">
                  <span className="text-[#afc6ff] font-bold">{selectedSignal.id} (Signal Node)</span>
                  <span className="text-[#8c90a0] text-[10px]">Root Focus</span>
                </div>
                <div className="pl-3 flex flex-col gap-1 pt-1">
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[#ffb693]">• GAP-0071</span>
                    <span className="text-[#8c90a0] text-[10px]">Execution Gap</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[#afc6ff]">• NS-0041</span>
                    <span className="text-[#8c90a0] text-[10px]">Missing ESC Log</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[#7bdb80]">• PD-0031</span>
                    <span className="text-[#8c90a0] text-[10px]">CTRL-07 Deviation</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <Link to="/assessment/findings/FND-0142" className="text-[#ffb4ab] hover:underline font-bold">
                      • FND-0142
                    </Link>
                    <span className="text-[#8c90a0] text-[10px]">Candidate Finding</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[#dfe2eb]">• CASE-1042 / INV-338</span>
                    <span className="text-[#8c90a0] text-[10px]">Active Cases</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[#c2c6d6]">• EVD-742 / EVD-761</span>
                    <span className="text-[#8c90a0] text-[10px]">Ingested Logs</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[#7bdb80]">• REM-0038</span>
                    <span className="text-[#8c90a0] text-[10px]">Remediation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutional Taxonomy Quick Reference */}
            <div className="p-4 rounded bg-[#181c22] border border-[#262a31] shadow-sm">
              <span className="text-xs uppercase text-[#dfe2eb] font-bold tracking-wider mb-2 block font-mono">
                SAT-SA Signal Taxonomy Classes
              </span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                <div className="p-1.5 rounded bg-[#1c2026] text-[#c2c6d6] border border-[#262a31]">
                  <span className="text-[#afc6ff] font-semibold">1. Process</span> • Workflow delta
                </div>
                <div className="p-1.5 rounded bg-[#1c2026] text-[#c2c6d6] border border-[#262a31]">
                  <span className="text-[#7bdb80] font-semibold">2. Coverage</span> • Telemetry blindspot
                </div>
                <div className="p-1.5 rounded bg-[#1c2026] text-[#c2c6d6] border border-[#262a31]">
                  <span className="text-[#ffb693] font-semibold">3. Consistency</span> • Divergence
                </div>
                <div className="p-1.5 rounded bg-[#1c2026] text-[#c2c6d6] border border-[#262a31]">
                  <span className="text-[#dfe2eb] font-semibold">4. Historical</span> • Recurrence
                </div>
                <div className="p-1.5 rounded bg-[#1c2026] text-[#c2c6d6] border border-[#262a31]">
                  <span className="text-[#afc6ff] font-semibold">5. Behavioural</span> • Shift patterns
                </div>
                <div className="p-1.5 rounded bg-[#1c2026] text-[#c2c6d6] border border-[#262a31]">
                  <span className="text-[#ffb4ab] font-semibold">6. Capability</span> • Claim vs fact
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modals Suite */}
      {/* 1. Create Finding Modal */}
      {activeModal === 'create-finding' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#181c22] border border-[#262a31] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#afc6ff]">add_task</span>
                <h3 className="text-base font-bold text-[#dfe2eb]">Create Finding Candidate from {selectedSignal.id}</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#8c90a0] hover:text-[#dfe2eb]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs text-[#c2c6d6]">
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Discovered Signal</label>
                <div className="p-2 rounded bg-[#1c2026] text-[#dfe2eb] font-mono mt-1">
                  {selectedSignal.id}: {selectedSignal.title}
                </div>
              </div>
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Proposed Finding Designation</label>
                <input
                  type="text"
                  defaultValue="FND-0142: Unsubstantiated SCADA Incident Escalation Chain"
                  className="w-full p-2 rounded bg-[#1c2026] border border-[#262a31] text-[#dfe2eb] mt-1 focus:outline-none"
                />
              </div>
              <div className="p-2.5 rounded bg-[#1c2026] border border-[#262a31] text-[11px]">
                <span className="text-[#7bdb80] font-bold">Traceability Seal:</span> Signal occurrence will bind 3 covered CSEs (014, 021, 027) with 7 verified incident traces.
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
                onClick={() => handleExecuteAction(`Finding Candidate dispatched for ${selectedSignal.id} to /findings queue.`)}
                className="px-4 py-1.5 rounded bg-[#1f6feb] hover:bg-[#afc6ff] hover:text-[#002d6d] text-white text-xs font-semibold"
              >
                Submit Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Request Missing Evidence Modal */}
      {activeModal === 'request-evidence' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#181c22] border border-[#262a31] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb693]">contact_support</span>
                <h3 className="text-base font-bold text-[#dfe2eb]">Formal Telemetry Demand</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#8c90a0] hover:text-[#dfe2eb]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs text-[#c2c6d6]">
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Demanded Record Specification</label>
                <div className="p-2 rounded bg-[#1c2026] text-[#ffb4ab] font-mono mt-1">
                  Demand outgoing syslog/API webhook telegram logs for CASE-1042 Level-1 escalation.
                </div>
              </div>
              <div>
                <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Target Recipient Enclaves</label>
                <div className="p-2 rounded bg-[#1c2026] text-[#dfe2eb] font-mono mt-1">
                  CSE-014 (NorthGrid), CSE-021 (HydroCorp), CSE-027 (Transco)
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
                onClick={() => handleExecuteAction('Formal telemetry demand dispatched to 3 regulated entities.')}
                className="px-4 py-1.5 rounded bg-[#1f6feb] hover:bg-[#afc6ff] hover:text-[#002d6d] text-white text-xs font-semibold"
              >
                Dispatch Demand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add Note Modal */}
      {activeModal === 'note' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#181c22] border border-[#262a31] rounded-lg p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#afc6ff]">edit_note</span>
                <h3 className="text-base font-bold text-[#dfe2eb]">Attach Examiner Deliberation</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#8c90a0] hover:text-[#dfe2eb]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2 text-xs text-[#c2c6d6]">
              <label className="text-[11px] text-[#8c90a0] uppercase font-mono">Note Body</label>
              <textarea
                rows={4}
                defaultValue="Pattern matches structural bypass observed during earlier monsoon load shedding windows. Cross-referencing grid frequency logs."
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
                onClick={() => handleExecuteAction('Examiner deliberation memo committed to audit trail.')}
                className="px-4 py-1.5 rounded bg-[#afc6ff] text-[#002d6d] font-semibold text-xs hover:bg-[#d9e2ff]"
              >
                Save Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
