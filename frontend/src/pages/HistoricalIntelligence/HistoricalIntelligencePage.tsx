import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface HistoricalFinding {
  id: string;
  firstLastSeen: string;
  signalType: string;
  control: string;
  occurrences: string;
  historicalStatus: 'Closed' | 'Candidate' | 'Under Review';
  currentPosture: string;
  verification: string;
}

const mockHistoricalFindings: HistoricalFinding[] = [
  {
    id: 'FND-0098',
    firstLastSeen: 'Q2 2025 / Q3 2026',
    signalType: 'Execution Gap',
    control: 'CTRL-07',
    occurrences: '4 rounds',
    historicalStatus: 'Closed',
    currentPosture: 'Recurring Signal',
    verification: 'Verified (Q1 2026)',
  },
  {
    id: 'FND-0104',
    firstLastSeen: 'Q4 2025 / Q3 2026',
    signalType: 'Negative Space',
    control: 'CTRL-12',
    occurrences: '3 rounds',
    historicalStatus: 'Closed',
    currentPosture: 'Recurring Signal',
    verification: 'Verified (Q2 2026)',
  },
  {
    id: 'FND-0112',
    firstLastSeen: 'Q1 2026 / Q2 2026',
    signalType: 'Process Deviation',
    control: 'CTRL-04',
    occurrences: '2 rounds',
    historicalStatus: 'Closed',
    currentPosture: 'Resolved',
    verification: 'Verified (Q2 2026)',
  },
  {
    id: 'FND-0142',
    firstLastSeen: 'Q3 2026 / Current',
    signalType: 'Gap + Neg Space',
    control: 'CTRL-07',
    occurrences: '1 (Active Round)',
    historicalStatus: 'Candidate',
    currentPosture: 'Under Review',
    verification: 'Pending Examiner',
  },
];

export const HistoricalIntelligencePage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Q3-2026');
  const [selectedEntity, setSelectedEntity] = useState('CSE-014');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeSignalType, setActiveSignalType] = useState('execution-gaps');
  const [showAttestationModal, setShowAttestationModal] = useState(false);
  const [attestationSaved, setAttestationSaved] = useState(false);
  const [attestationText, setAttestationText] = useState(
    'Observed telemetry establishes that Execution Gap signals occurred in Q2 2025, Q4 2025, and reappeared in Q3 2026 following Q1 2026 verified remediation. Control CTRL-07 has maintained version v3.2 since Q2 2026. Human examiner review confirms recurrence stems from automated grid failover routing.'
  );

  return (
    <div className="flex flex-col w-full space-y-6 text-[#dfe2eb]">
      {/* TOP BREADCRUMB, HEADER & CONTROLS */}
      <section className="flex flex-col gap-2 pb-4 border-b border-[#31353c]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 font-mono text-xs text-[#8c90a0] mb-1">
              <span>SAT-SA</span>
              <span>/</span>
              <span>Intelligence</span>
              <span>/</span>
              <span className="text-[#afc6ff] font-medium">Historical Trends</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-bold text-[#dfe2eb] tracking-tight">Historical Intelligence</h1>
              <span className="px-2 py-0.5 rounded bg-[#262a31] text-[#8c90a0] font-mono text-xs uppercase tracking-wider">
                Provenance Engine v4.2
              </span>
            </div>
            <p className="text-xs text-[#c2c6d6] max-w-4xl mt-1">
              Analyze recurring supervisory signals, remediation history, and operational changes across assessment periods. Provides temporal and evidentiary context for supervisory findings without predictive bias.
            </p>
          </div>

          {/* Institutional Controls Toolbar */}
          <div className="flex flex-wrap items-center gap-2 bg-[#181c22] p-1.5 rounded-lg border border-[#262a31]">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-[#1c2026] rounded border border-[#262a31]">
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Period:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent font-mono text-xs text-[#dfe2eb] focus:outline-none cursor-pointer"
              >
                <option value="Q3-2026" className="bg-[#262a31]">Q3 2026 (Active)</option>
                <option value="Q2-2026" className="bg-[#262a31]">Q2 2026</option>
                <option value="Q1-2026" className="bg-[#262a31]">Q1 2026</option>
                <option value="Q4-2025" className="bg-[#262a31]">Q4 2025</option>
              </select>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-[#1c2026] rounded border border-[#262a31]">
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Entity:</span>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="bg-transparent font-mono text-xs text-[#afc6ff] font-medium focus:outline-none cursor-pointer"
              >
                <option value="CSE-014" className="bg-[#262a31]">CSE-014 (Energy Sector / Tier-1 Critical)</option>
                <option value="CSE-008" className="bg-[#262a31]">CSE-008 (Telecommunications / Tier-1)</option>
                <option value="CSE-021" className="bg-[#262a31]">CSE-021 (Financial Clearing / Tier-1)</option>
              </select>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-[#1c2026] rounded border border-[#262a31]">
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Filter:</span>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-transparent font-mono text-xs text-[#c2c6d6] focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#262a31]">All Signal Types</option>
                <option value="execution-gaps" className="bg-[#262a31]">Execution Gaps (GAP)</option>
                <option value="negative-space" className="bg-[#262a31]">Negative Space (NS)</option>
                <option value="process-deviations" className="bg-[#262a31]">Process Deviations</option>
                <option value="remediation-regression" className="bg-[#262a31]">Remediation Regressions</option>
              </select>
            </div>
            <button
              onClick={() => alert('Exporting cryptographic historical ledger (JSON-LD / FIPS SHA-256 attested)...')}
              className="flex items-center gap-1 px-3 py-1 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs font-mono transition-colors border border-[#262a31]"
              title="Export Ledger as Cryptographically Signed JSON-LD / CSV"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export History</span>
            </button>
            <button
              onClick={() => alert('Telemetry records synchronized across historical store.')}
              className="p-1 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#c2c6d6] hover:text-[#dfe2eb] transition-colors border border-[#262a31]"
              title="Sync Telemetry Records"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
          </div>
        </div>

        {/* Statutory Doctrine Note */}
        <div className="flex items-start gap-2.5 p-3 rounded bg-[#181c22] border border-[#7bdb80]/30 bg-[#7bdb80]/5 mt-2">
          <span className="material-symbols-outlined text-[#7bdb80] text-[20px] shrink-0 mt-0.5">gavel</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-[#7bdb80] font-bold uppercase tracking-wider font-mono">
              Supervisory Doctrine (NCIIPC / CERT-In Standard Operating Instruction §14-B)
            </span>
            <p className="text-xs text-[#c2c6d6] leading-relaxed">
              Historical recurrence is an empirical supervisory signal requiring context examination. It does not independently establish statutory non-compliance, nor does past remediation guarantee permanent elimination of process deviation. All signal classifications reflect verified telemetry observations without automated punitive weighting.
            </p>
          </div>
        </div>
      </section>

      {/* SUMMARY METRICS STRIP */}
      <section className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Metric 1 */}
          <div className="p-3 rounded bg-[#1c2026] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between text-[#8c90a0]">
              <span className="text-[10px] uppercase tracking-wider font-bold">Historical Signals</span>
              <span className="material-symbols-outlined text-[16px]">history_toggle_off</span>
            </div>
            <div className="my-1">
              <span className="text-2xl font-bold text-[#dfe2eb] font-mono">18</span>
            </div>
            <span className="font-mono text-[11px] text-[#c2c6d6]">Across Sector Cohort</span>
          </div>
          {/* Metric 2 */}
          <div className="p-3 rounded bg-[#1c2026] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between text-[#ffb693]">
              <span className="text-[10px] uppercase tracking-wider font-bold">Recurring Signals</span>
              <span className="material-symbols-outlined text-[16px]">replay</span>
            </div>
            <div className="my-1">
              <span className="text-2xl font-bold text-[#ffb693] font-mono">8</span>
            </div>
            <span className="font-mono text-[11px] text-[#c2c6d6]">Multi-quarter recurrence</span>
          </div>
          {/* Metric 3 */}
          <div className="p-3 rounded bg-[#1c2026] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between text-[#ffb4ab]">
              <span className="text-[10px] uppercase tracking-wider font-bold">Persistent Signals</span>
              <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
            </div>
            <div className="my-1">
              <span className="text-2xl font-bold text-[#ffb4ab] font-mono">4</span>
            </div>
            <span className="font-mono text-[11px] text-[#c2c6d6]">Uninterrupted 3+ quarters</span>
          </div>
          {/* Metric 4 */}
          <div className="p-3 rounded bg-[#1c2026] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between text-[#ffdbcc]">
              <span className="text-[10px] uppercase tracking-wider font-bold">Reopened Findings</span>
              <span className="material-symbols-outlined text-[16px]">lock_open_right</span>
            </div>
            <div className="my-1">
              <span className="text-2xl font-bold text-[#ffdbcc] font-mono">1</span>
            </div>
            <span className="font-mono text-[11px] text-[#c2c6d6]">Re-activated post closure</span>
          </div>
          {/* Metric 5 */}
          <div className="p-3 rounded bg-[#1c2026] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between text-[#7bdb80]">
              <span className="text-[10px] uppercase tracking-wider font-bold">Remediated</span>
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
            </div>
            <div className="my-1">
              <span className="text-2xl font-bold text-[#7bdb80] font-mono">5</span>
            </div>
            <span className="font-mono text-[11px] text-[#c2c6d6]">Statutorily verified</span>
          </div>
          {/* Metric 6 */}
          <div className="p-3 rounded bg-[#262a31] flex flex-col justify-between border border-[#424754]/50 shadow-sm">
            <div className="flex items-center justify-between text-[#afc6ff]">
              <span className="text-[10px] uppercase tracking-wider font-bold">Current Period (CSE-014)</span>
              <span className="material-symbols-outlined text-[16px]">radar</span>
            </div>
            <div className="my-1">
              <span className="text-2xl font-bold text-[#afc6ff] font-mono">6</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px] text-[#7bdb80]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7bdb80] animate-pulse"></span>
              <span>Active in Q3 2026</span>
            </div>
          </div>
        </div>

        {/* Entity Focused Context Banner */}
        <div className="flex flex-wrap items-center justify-between p-3 px-4 rounded bg-[#181c22] font-mono text-xs border border-[#262a31]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#afc6ff] text-[#002d6d] font-bold text-[10px]">ENTITY FOCUS</span>
            <span className="text-[#dfe2eb] font-semibold">CSE-014 (NorthGrid Transmission System, Energy)</span>
            <span className="text-[#8c90a0]">|</span>
            <span className="text-[#c2c6d6]">5 Previous Findings Recorded</span>
            <span className="text-[#8c90a0]">|</span>
            <span className="text-[#ffb693]">2 Recurring Signals</span>
            <span className="text-[#8c90a0]">|</span>
            <span className="text-[#7bdb80]">3 Remediated</span>
            <span className="text-[#8c90a0]">|</span>
            <span className="text-[#ffb4ab]">1 Reopened Candidate</span>
          </div>
          <div className="flex items-center gap-1 text-[#8c90a0] text-[11px]">
            <span>Assigned Examiner: EX-8802 (NCIIPC Power Desk)</span>
          </div>
        </div>
      </section>

      {/* MAIN 2-COLUMN SECTION: HISTORICAL TREND CHART & SIGNAL LIFECYCLE PIPELINE */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* 7-Quarter Timeline & Signal Volume Breakdown (8 Cols) */}
        <div className="xl:col-span-8 p-5 rounded-lg bg-[#1c2026] flex flex-col gap-4 border border-[#262a31]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#afc6ff] text-[20px]">show_chart</span>
                <span className="text-base font-semibold text-[#dfe2eb]">Historical Supervisory Signal Trend</span>
              </div>
              <span className="text-xs text-[#c2c6d6]">7-Quarter Multi-Signal Volume Observation (Q1 2025 — Q3 2026)</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0a0e14] font-mono text-[11px] text-[#8c90a0] border border-[#262a31]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8c90a0]"></span>
              <span>Predictive forecasting suppressed</span>
            </div>
          </div>

          {/* Metric Filter Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveSignalType('execution-gaps')}
              className={`px-3 py-1 rounded font-mono text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeSignalType === 'execution-gaps'
                  ? 'bg-[#afc6ff] text-[#002d6d]'
                  : 'bg-[#262a31] text-[#c2c6d6] hover:text-[#dfe2eb]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#afc6ff]"></span>
              <span>Execution Gaps</span>
            </button>
            <button
              onClick={() => setActiveSignalType('negative-space')}
              className={`px-3 py-1 rounded font-mono text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeSignalType === 'negative-space'
                  ? 'bg-[#7bdb80] text-[#00390e]'
                  : 'bg-[#262a31] text-[#c2c6d6] hover:text-[#dfe2eb]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#7bdb80]"></span>
              <span>Negative Space</span>
            </button>
            <button
              onClick={() => setActiveSignalType('process-deviations')}
              className={`px-3 py-1 rounded font-mono text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeSignalType === 'process-deviations'
                  ? 'bg-[#ffb693] text-[#561f00]'
                  : 'bg-[#262a31] text-[#c2c6d6] hover:text-[#dfe2eb]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#ffb693]"></span>
              <span>Process Deviations</span>
            </button>
            <button
              onClick={() => setActiveSignalType('regression')}
              className={`px-3 py-1 rounded font-mono text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeSignalType === 'regression'
                  ? 'bg-[#ffb4ab] text-[#690005]'
                  : 'bg-[#262a31] text-[#c2c6d6] hover:text-[#dfe2eb]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
              <span>Remediation Regression</span>
            </button>
          </div>

          {/* High-Precision SVG Multi-Series Bar & Area Visualization */}
          <div className="w-full bg-[#0a0e14] p-4 rounded flex flex-col gap-2 border border-[#262a31]">
            <div className="flex items-center justify-between text-[#8c90a0] font-mono text-xs pb-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-[#afc6ff] inline-block"></span> Execution Gaps (Peak: 7)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-[#7bdb80] inline-block"></span> Negative Space</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-[#ffb693] inline-block"></span> Process Deviations</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-[#ffb4ab] inline-block"></span> Regression</span>
              </div>
              <span className="text-[10px]">Y: Signal Count (Unit: Discrete Observations)</span>
            </div>

            {/* Inline SVG Visualization */}
            <div className="relative w-full h-56 flex items-end">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 700 200">
                {/* Grid Lines */}
                <line stroke="#262a31" strokeWidth="1" x1="0" x2="700" y1="180" y2="180" />
                <line stroke="#1c2026" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="700" y1="135" y2="135" />
                <line stroke="#1c2026" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="700" y1="90" y2="90" />
                <line stroke="#1c2026" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="700" y1="45" y2="45" />

                {/* Historical Baseline Area (4-quarter average ~ 3.5) */}
                <rect fill="#8c90a0" height="2" opacity="0.3" strokeDasharray="4 2" width="700" x="0" y="105" />

                {/* Q1 2025: Gaps 4, NS 2, Dev 1, Reg 0 (X=50) */}
                <g className="transition-all hover:opacity-80">
                  <rect fill="#afc6ff" height="64" rx="2" width="12" x="35" y="116" />
                  <rect fill="#7bdb80" height="32" rx="2" width="12" x="49" y="148" />
                  <rect fill="#ffb693" height="16" rx="2" width="12" x="63" y="164" />
                </g>

                {/* Q2 2025: Gaps 5, NS 3, Dev 2, Reg 1 (X=145) */}
                <g className="transition-all hover:opacity-80">
                  <rect fill="#afc6ff" height="80" rx="2" width="12" x="130" y="100" />
                  <rect fill="#7bdb80" height="48" rx="2" width="12" x="144" y="132" />
                  <rect fill="#ffb693" height="32" rx="2" width="12" x="158" y="148" />
                  <rect fill="#ffb4ab" height="16" rx="2" width="6" x="172" y="164" />
                </g>

                {/* Q3 2025: Gaps 3, NS 2, Dev 1, Reg 0 (X=245) */}
                <g className="transition-all hover:opacity-80">
                  <rect fill="#afc6ff" height="48" rx="2" width="12" x="235" y="132" />
                  <rect fill="#7bdb80" height="32" rx="2" width="12" x="249" y="148" />
                  <rect fill="#ffb693" height="16" rx="2" width="12" x="263" y="164" />
                </g>

                {/* Q4 2025: Gaps 4, NS 2, Dev 2, Reg 1 (X=345) */}
                <g className="transition-all hover:opacity-80">
                  <rect fill="#afc6ff" height="64" rx="2" width="12" x="330" y="116" />
                  <rect fill="#7bdb80" height="32" rx="2" width="12" x="344" y="148" />
                  <rect fill="#ffb693" height="32" rx="2" width="12" x="358" y="148" />
                  <rect fill="#ffb4ab" height="16" rx="2" width="6" x="372" y="164" />
                </g>

                {/* Q1 2026: Gaps 2, NS 1, Dev 1, Reg 0 (X=445) Remediation verified round */}
                <g className="transition-all hover:opacity-80">
                  <rect fill="#afc6ff" height="32" rx="2" width="12" x="435" y="148" />
                  <rect fill="#7bdb80" height="16" rx="2" width="12" x="449" y="164" />
                  <rect fill="#ffb693" height="16" rx="2" width="12" x="463" y="164" />
                </g>

                {/* Q2 2026: Gaps 3, NS 2, Dev 1, Reg 1 (X=545) */}
                <g className="transition-all hover:opacity-80">
                  <rect fill="#afc6ff" height="48" rx="2" width="12" x="530" y="132" />
                  <rect fill="#7bdb80" height="32" rx="2" width="12" x="544" y="148" />
                  <rect fill="#ffb693" height="16" rx="2" width="12" x="558" y="164" />
                  <rect fill="#ffb4ab" height="16" rx="2" width="6" x="572" y="164" />
                </g>

                {/* Q3 2026 (CURRENT PERIOD): Gaps 7, NS 4, Dev 3, Reg 1 (X=640) PEAK */}
                <g className="transition-all hover:opacity-80">
                  <rect fill="#1f6feb" height="122" opacity="0.12" rx="4" width="70" x="618" y="60" />
                  <rect fill="#afc6ff" height="112" rx="2" width="12" x="625" y="68" />
                  <rect fill="#7bdb80" height="64" rx="2" width="12" x="639" y="116" />
                  <rect fill="#ffb693" height="48" rx="2" width="12" x="653" y="132" />
                  <rect fill="#ffb4ab" height="16" rx="2" width="8" x="667" y="164" />
                </g>
              </svg>
            </div>

            {/* Quarter Scale Axis */}
            <div className="grid grid-cols-7 text-center font-mono text-[11px] text-[#8c90a0] pt-1">
              <div>Q1 2025</div>
              <div>Q2 2025</div>
              <div>Q3 2025</div>
              <div>Q4 2025</div>
              <div>Q1 2026 <span className="text-[#7bdb80] font-semibold">(Verified)</span></div>
              <div>Q2 2026</div>
              <div className="text-[#afc6ff] font-bold bg-[#262a31] rounded py-0.5 border border-[#1f6feb]/30">
                Q3 2026 (Now)
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#c2c6d6]">
            <span>* Historical observations only. Predictive forecasting strictly suppressed per NCIIPC audit guidelines.</span>
            <span className="font-mono text-[11px] text-[#8c90a0]">Dataset Hash: 0x98A1...E7B</span>
          </div>
        </div>

        {/* Current Period vs Historical Context Matrix (4 Cols) */}
        <div className="xl:col-span-4 p-5 rounded-lg bg-[#1c2026] flex flex-col justify-between gap-4 border border-[#262a31]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-[#dfe2eb]">Observed Baseline Delta</span>
              <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#afc6ff] font-mono text-[11px]">
                Q3 2026 vs Baseline
              </span>
            </div>
            <p className="text-xs text-[#c2c6d6]">
              Comparison between Q3 2026 active telemetry and the 4-quarter rolling historical average for entity CSE-014.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {/* Row 1 */}
            <div className="p-2.5 rounded bg-[#181c22] flex items-center justify-between border border-[#262a31]">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#dfe2eb]">Execution Gaps</span>
                <span className="font-mono text-[10px] text-[#8c90a0]">Baseline: 3.0 avg</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[#afc6ff] font-mono">7</span>
                <span className="font-mono text-[10px] text-[#ffb4ab] block">+4 delta (elevated)</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="p-2.5 rounded bg-[#181c22] flex items-center justify-between border border-[#262a31]">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#dfe2eb]">Negative Space</span>
                <span className="font-mono text-[10px] text-[#8c90a0]">Baseline: 2.0 avg</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[#7bdb80] font-mono">4</span>
                <span className="font-mono text-[10px] text-[#ffb693] block">+2 delta</span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="p-2.5 rounded bg-[#181c22] flex items-center justify-between border border-[#262a31]">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#dfe2eb]">Process Deviations</span>
                <span className="font-mono text-[10px] text-[#8c90a0]">Baseline: 1.25 avg</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[#ffb693] font-mono">3</span>
                <span className="font-mono text-[10px] text-[#ffb693] block">+2 delta</span>
              </div>
            </div>

            {/* Row 4 */}
            <div className="p-2.5 rounded bg-[#181c22] flex items-center justify-between border border-[#262a31]">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#dfe2eb]">Recurring Signal Rate</span>
                <span className="font-mono text-[10px] text-[#8c90a0]">Baseline: 1.0 avg</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[#ffb4ab] font-mono">2</span>
                <span className="font-mono text-[10px] text-[#ffb4ab] block">+1 recurrence</span>
              </div>
            </div>
          </div>

          <div className="p-2 bg-[#0a0e14] rounded font-mono text-[11px] text-[#8c90a0] leading-tight border border-[#262a31]">
            Delta reflects raw signal volume divergence from the 4-quarter rolling historical baseline. Does not denote automatic regulatory failure.
          </div>
        </div>
      </section>

      {/* SIGNAL LIFECYCLE PIPELINE: HERO CONCEPTUAL FLOW */}
      <section className="p-5 rounded-lg bg-[#1c2026] flex flex-col gap-4 border border-[#262a31]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-[#afc6ff] tracking-wider font-bold">Provenance Architecture</span>
            <h2 className="text-xl font-bold text-[#dfe2eb]">Signal Lifecycle Pipeline</h2>
            <span className="text-xs text-[#c2c6d6]">
              Traceability path from first empirical detection through remediation, independent verification, and operational regression.
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#262a31] rounded font-mono text-xs text-[#dfe2eb] border border-[#424754]/40">
            <span className="text-[10px] text-[#8c90a0] uppercase font-bold">Active Exemplar:</span>
            <span className="text-[#afc6ff] font-semibold">CTRL-07 / Incident Escalation GAP</span>
          </div>
        </div>

        {/* Pipeline Stages Horizontal Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Stage 1 */}
          <div className="p-3 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31] hover:bg-[#262a31]/50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-[#8c90a0]">Stage 01</span>
              <span className="w-2 h-2 rounded-full bg-[#8c90a0]"></span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-[#dfe2eb]">First Occurrence</span>
              <span className="font-mono text-[11px] text-[#afc6ff]">Q2 2025 (GAP-0032)</span>
              <p className="text-[11px] text-[#c2c6d6] mt-1 leading-snug">Initial telemetry divergence in SCADA notification queue.</p>
            </div>
            <div className="mt-2 pt-1 font-mono text-[10px] text-[#8c90a0] border-t border-[#262a31]">Evidence: EVD-312</div>
          </div>

          {/* Stage 2 */}
          <div className="p-3 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31] hover:bg-[#262a31]/50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-[#ffb693]">Stage 02</span>
              <span className="w-2 h-2 rounded-full bg-[#ffb693]"></span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-[#dfe2eb]">Recurrence</span>
              <span className="font-mono text-[11px] text-[#ffb693]">Q4 2025 (GAP-0051)</span>
              <p className="text-[11px] text-[#c2c6d6] mt-1 leading-snug">Identical bypass pattern in Tier-2 grid dispatch alert logs.</p>
            </div>
            <div className="mt-2 pt-1 font-mono text-[10px] text-[#8c90a0] border-t border-[#262a31]">Evidence: EVD-498</div>
          </div>

          {/* Stage 3 */}
          <div className="p-3 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31] hover:bg-[#262a31]/50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-[#8c90a0]">Stage 03</span>
              <span className="w-2 h-2 rounded-full bg-[#8c90a0]"></span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-[#dfe2eb]">Remediation Init</span>
              <span className="font-mono text-[11px] text-[#dfe2eb]">Q1 2026 (CAP-014)</span>
              <p className="text-[11px] text-[#c2c6d6] mt-1 leading-snug">CSE submitted formal patch & revised SOAR playbook routing.</p>
            </div>
            <div className="mt-2 pt-1 font-mono text-[10px] text-[#8c90a0] border-t border-[#262a31]">Doc: CAP-CSE014-01</div>
          </div>

          {/* Stage 4 */}
          <div className="p-3 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31] hover:bg-[#262a31]/50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-[#7bdb80]">Stage 04</span>
              <span className="w-2 h-2 rounded-full bg-[#7bdb80]"></span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-[#dfe2eb]">Verification</span>
              <span className="font-mono text-[11px] text-[#7bdb80] font-medium">Q1 2026 Confirmed</span>
              <p className="text-[11px] text-[#c2c6d6] mt-1 leading-snug">Air-gapped telemetry simulation confirmed SLA adherence.</p>
            </div>
            <div className="mt-2 pt-1 font-mono text-[10px] text-[#8c90a0] border-t border-[#262a31]">Audit: VER-9041</div>
          </div>

          {/* Stage 5 */}
          <div className="p-3 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31] hover:bg-[#262a31]/50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-[#ffb4ab]">Stage 05</span>
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-[#dfe2eb]">Regression</span>
              <span className="font-mono text-[11px] text-[#ffb4ab]">Q3 2026 (GAP-0071)</span>
              <p className="text-[11px] text-[#c2c6d6] mt-1 leading-snug">Missing escalation in incident CASE-1042 following node reboot.</p>
            </div>
            <div className="mt-2 pt-1 font-mono text-[10px] text-[#8c90a0] border-t border-[#262a31]">Evidence: EVD-742</div>
          </div>

          {/* Stage 6: Current State */}
          <div className="p-3 rounded bg-[#262a31] flex flex-col justify-between border border-[#ffb4ab]/40 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-[#afc6ff] font-bold">Current State</span>
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse"></span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-[#ffb4ab]">RECURRING SIGNAL</span>
              <span className="font-mono text-[11px] text-[#dfe2eb] font-semibold">Under Investigation</span>
              <p className="text-[11px] text-[#c2c6d6] mt-1 leading-snug">Aggregated into Finding Candidate FND-0142.</p>
            </div>
            <Link
              to="/findings/FND-0142"
              className="mt-2 pt-1 font-mono text-[10px] text-[#afc6ff] flex items-center justify-between hover:underline border-t border-[#31353c]"
            >
              <span>Priority: Tier-1</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SEVEN HISTORICAL SIGNAL STATES TAXONOMY */}
      <section className="p-5 rounded-lg bg-[#1c2026] flex flex-col gap-3 border border-[#262a31]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-[#8c90a0] tracking-wider font-bold">Supervisory Classification</span>
            <h3 className="text-base font-semibold text-[#dfe2eb]">Seven Defined Historical Signal States</h3>
          </div>
          <span className="font-mono text-xs text-[#8c90a0]">Standard NCIIPC State Machine Definition v2.1</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {/* State 1 */}
          <div className="p-2.5 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-[#8c90a0]"></span>
              <span className="font-mono text-[11px] text-[#8c90a0] font-bold">Count: 2</span>
            </div>
            <div className="my-1">
              <span className="text-xs font-semibold text-[#dfe2eb] block">First Occurrence</span>
              <p className="text-[11px] text-[#c2c6d6] mt-0.5">Signal observed for the first time in entity assessment history.</p>
            </div>
            <span className="text-[10px] text-[#8c90a0] uppercase font-mono font-bold">State: FOCC</span>
          </div>

          {/* State 2 */}
          <div className="p-2.5 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-[#ffb693]"></span>
              <span className="font-mono text-[11px] text-[#ffb693] font-bold">Count: 2</span>
            </div>
            <div className="my-1">
              <span className="text-xs font-semibold text-[#ffb693] block">Recurrence</span>
              <p className="text-[11px] text-[#c2c6d6] mt-0.5">Previously observed signal reappears after prior occurrence interval.</p>
            </div>
            <span className="text-[10px] text-[#ffb693] uppercase font-mono font-bold">State: RECUR (Active)</span>
          </div>

          {/* State 3 */}
          <div className="p-2.5 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
              <span className="font-mono text-[11px] text-[#ffb4ab] font-bold">Count: 1</span>
            </div>
            <div className="my-1">
              <span className="text-xs font-semibold text-[#ffb4ab] block">Persistence</span>
              <p className="text-[11px] text-[#c2c6d6] mt-0.5">Signal remains present across consecutive periods without interlude.</p>
            </div>
            <span className="text-[10px] text-[#ffb4ab] uppercase font-mono font-bold">State: PERS</span>
          </div>

          {/* State 4 */}
          <div className="p-2.5 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-[#ffdbcc]"></span>
              <span className="font-mono text-[11px] text-[#ffdbcc] font-bold">Count: 1</span>
            </div>
            <div className="my-1">
              <span className="text-xs font-semibold text-[#ffdbcc] block">Reopening</span>
              <p className="text-[11px] text-[#c2c6d6] mt-0.5">Previously formally closed finding candidate becomes active again.</p>
            </div>
            <span className="text-[10px] text-[#ffdbcc] uppercase font-mono font-bold">State: REOP</span>
          </div>

          {/* State 5 */}
          <div className="p-2.5 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
              <span className="font-mono text-[11px] text-[#ffb4ab] font-bold">Count: 1</span>
            </div>
            <div className="my-1">
              <span className="text-xs font-semibold text-[#ffb4ab] block">Remediation Regr.</span>
              <p className="text-[11px] text-[#c2c6d6] mt-0.5">Signal returns following formal statutorily verified remediation.</p>
            </div>
            <span className="text-[10px] text-[#ffb4ab] uppercase font-mono font-bold">State: REGR</span>
          </div>

          {/* State 6 */}
          <div className="p-2.5 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-[#7bdb80]"></span>
              <span className="font-mono text-[11px] text-[#7bdb80] font-bold">Count: 3</span>
            </div>
            <div className="my-1">
              <span className="text-xs font-semibold text-[#7bdb80] block">Improvement</span>
              <p className="text-[11px] text-[#c2c6d6] mt-0.5">Observed deviations cease or decrease below statistical thresholds.</p>
            </div>
            <span className="text-[10px] text-[#7bdb80] uppercase font-mono font-bold">State: IMPR</span>
          </div>

          {/* State 7 */}
          <div className="p-2.5 rounded bg-[#181c22] flex flex-col justify-between border border-[#262a31]">
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-[#afc6ff]"></span>
              <span className="font-mono text-[11px] text-[#afc6ff] font-bold">Count: 1</span>
            </div>
            <div className="my-1">
              <span className="text-xs font-semibold text-[#afc6ff] block">Control Change</span>
              <p className="text-[11px] text-[#c2c6d6] mt-0.5">Applicable statutory rule or control schema version revised.</p>
            </div>
            <span className="text-[10px] text-[#afc6ff] uppercase font-mono font-bold">CTRL-07 v3.2</span>
          </div>
        </div>
      </section>

      {/* CHRONOLOGICAL DRILLDOWN TIMELINE & HISTORICAL FINDINGS TABLE */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Chronological Drilldown (4 Cols) */}
        <div className="xl:col-span-4 p-5 rounded-lg bg-[#1c2026] flex flex-col gap-4 border border-[#262a31]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-semibold text-[#dfe2eb]">CSE-014 Timeline</span>
              <span className="text-xs text-[#c2c6d6]">Sequential Event Telemetry</span>
            </div>
            <span className="material-symbols-outlined text-[#8c90a0]">timeline</span>
          </div>

          {/* Timeline Items */}
          <div className="relative pl-4 flex flex-col gap-4 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#31353c]">
            {/* Node 1 */}
            <div className="relative flex items-start gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#8c90a0] absolute -left-[14px] top-1 ring-4 ring-[#1c2026]"></div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="font-bold text-[#dfe2eb]">Q1 2025</span>
                  <span className="text-[#8c90a0]">• Baseline Established</span>
                </div>
                <p className="text-xs text-[#c2c6d6]">No major supervisory signal detected in audit round. Initial schema v3.0.</p>
              </div>
            </div>

            {/* Node 2 */}
            <div className="relative flex items-start gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#afc6ff] absolute -left-[14px] top-1 ring-4 ring-[#1c2026]"></div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="font-bold text-[#dfe2eb]">Q2 2025</span>
                  <span className="text-[#afc6ff] font-semibold">• Execution Gap Identified</span>
                </div>
                <p className="text-xs text-[#c2c6d6]">GAP-0032 in SCADA telemetry. Escalation delay exceeding 45 minutes.</p>
                <span className="font-mono text-[11px] text-[#afc6ff]">Ref: FND-0098</span>
              </div>
            </div>

            {/* Node 3 */}
            <div className="relative flex items-start gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#8c90a0] absolute -left-[14px] top-1 ring-4 ring-[#1c2026]"></div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="font-bold text-[#dfe2eb]">Q3 2025</span>
                  <span className="text-[#8c90a0]">• Remediation Initiated</span>
                </div>
                <p className="text-xs text-[#c2c6d6]">CSE CISO filed Corrective Action Plan CAP-014. Telemetry monitors placed.</p>
              </div>
            </div>

            {/* Node 4 */}
            <div className="relative flex items-start gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffb693] absolute -left-[14px] top-1 ring-4 ring-[#1c2026]"></div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="font-bold text-[#dfe2eb]">Q4 2025</span>
                  <span className="text-[#ffb693] font-semibold">• Execution Gap Recurred</span>
                </div>
                <p className="text-xs text-[#c2c6d6]">GAP-0051 logged during regional grid switchover drill. Rule updated to v3.1.</p>
              </div>
            </div>

            {/* Node 5 */}
            <div className="relative flex items-start gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#7bdb80] absolute -left-[14px] top-1 ring-4 ring-[#1c2026]"></div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="font-bold text-[#dfe2eb]">Q1 2026</span>
                  <span className="text-[#7bdb80] font-semibold">• Remediation Verified</span>
                </div>
                <p className="text-xs text-[#c2c6d6]">Examiner verified SOAR escalation compliance. Finding FND-0098 closed.</p>
              </div>
            </div>

            {/* Node 6 */}
            <div className="relative flex items-start gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffb693] absolute -left-[14px] top-1 ring-4 ring-[#1c2026]"></div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="font-bold text-[#dfe2eb]">Q2 2026</span>
                  <span className="text-[#ffb693] font-semibold">• Negative Space Detected</span>
                </div>
                <p className="text-xs text-[#c2c6d6]">NS-0028 in SCADA log retention. CTRL-07 schema revised to v3.2.</p>
              </div>
            </div>

            {/* Node 7 (Active) */}
            <div className="relative flex items-start gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab] absolute -left-[14px] top-1 ring-4 ring-[#1c2026] animate-pulse"></div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="font-bold text-[#ffb4ab]">Q3 2026</span>
                  <span className="text-[#ffb4ab] font-semibold">• Recurrence & Candidate</span>
                </div>
                <p className="text-xs text-[#c2c6d6]">GAP-0071 + NS-0041. Finding Candidate FND-0142 under active supervision.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Findings Master Table (8 Cols) */}
        <div className="xl:col-span-8 p-5 rounded-lg bg-[#1c2026] flex flex-col justify-between gap-4 border border-[#262a31]">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#afc6ff] text-[20px]">table_chart</span>
                <span className="text-base font-semibold text-[#dfe2eb]">Historical Findings & Candidates Ledger</span>
              </div>
              <span className="px-2.5 py-0.5 bg-[#262a31] rounded font-mono text-xs text-[#8c90a0] border border-[#424754]/40">
                Entity: CSE-014 (All Periods)
              </span>
            </div>
            <p className="text-xs text-[#c2c6d6]">
              Complete evidentiary record across historical assessment quarters including prior verification outcomes and current supervisory postures.
            </p>
          </div>

          {/* High Density Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0a0e14] text-[#8c90a0] text-[11px] uppercase tracking-wider font-mono border-b border-[#31353c]">
                  <th className="py-2.5 px-3">Finding ID</th>
                  <th className="py-2.5 px-3">First / Last Seen</th>
                  <th className="py-2.5 px-3">Signal Type</th>
                  <th className="py-2.5 px-3">Control</th>
                  <th className="py-2.5 px-3">Occurrences</th>
                  <th className="py-2.5 px-3">Historical Status</th>
                  <th className="py-2.5 px-3">Current Posture</th>
                  <th className="py-2.5 px-3">Verification</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#31353c] font-mono text-xs">
                {mockHistoricalFindings.map((fnd) => (
                  <tr key={fnd.id} className="hover:bg-[#262a31]/50 transition-colors">
                    <td className={`py-2.5 px-3 font-bold ${fnd.id === 'FND-0142' ? 'text-[#ffb4ab]' : 'text-[#afc6ff]'}`}>
                      {fnd.id}
                    </td>
                    <td className="py-2.5 px-3 text-[#8c90a0]">{fnd.firstLastSeen}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-[#1f6feb]/20 text-[#afc6ff] text-[11px]">
                        {fnd.signalType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#dfe2eb]">{fnd.control}</td>
                    <td className="py-2.5 px-3 text-[#dfe2eb] font-semibold">{fnd.occurrences}</td>
                    <td className="py-2.5 px-3">
                      {fnd.historicalStatus === 'Closed' ? (
                        <span className="text-[#7bdb80] font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7bdb80]"></span> Closed
                        </span>
                      ) : (
                        <span className="text-[#8c90a0] font-medium">{fnd.historicalStatus}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          fnd.currentPosture === 'Under Review'
                            ? 'bg-[#1f6feb] text-white'
                            : 'bg-[#0a0e14] text-[#ffb693]'
                        }`}
                      >
                        {fnd.currentPosture}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 ${fnd.verification.includes('Verified') ? 'text-[#7bdb80]' : 'text-[#ffb4ab]'}`}>
                      {fnd.verification}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/findings/${fnd.id}`}
                        className="px-2.5 py-1 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] font-semibold text-[11px] transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8c90a0] pt-1">
            <span>Displaying 4 supervisory records for CSE-014</span>
            <span>Sort: By Recurrence Count (Desc)</span>
          </div>
        </div>
      </section>

      {/* CONTROL DRIFT & HISTORICAL REMEDIATION/VERIFICATION LEDGER */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Provenance Safeguard: Control Version Drift (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-lg bg-[#1c2026] flex flex-col justify-between gap-4 border border-[#262a31]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#afc6ff] text-[20px]">verified</span>
                <span className="text-base font-semibold text-[#dfe2eb]">Control Schema Drift Safeguard</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#262a31] font-mono text-xs text-[#afc6ff]">Provenance Engine</span>
            </div>
            <p className="text-xs text-[#c2c6d6]">
              Historical comparisons must account for rule-version revisions to avoid false regression attributions caused by tightened regulatory standards.
            </p>
          </div>

          {/* Version Audit Stack for CTRL-07 */}
          <div className="flex flex-col gap-2">
            <div className="p-3 rounded bg-[#181c22] flex flex-col gap-1 border border-[#262a31]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#dfe2eb]">CTRL-07 v3.0 (Q1 2025 — Q3 2025)</span>
                <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#8c90a0] text-[10px] font-mono">Archived</span>
              </div>
              <p className="text-xs text-[#c2c6d6]">Baseline criteria: Standard manual ticket escalation within 60 minutes of Tier-1 alarm.</p>
            </div>

            <div className="p-3 rounded bg-[#181c22] flex flex-col gap-1 border border-[#262a31]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#dfe2eb]">CTRL-07 v3.1 (Q4 2025 — Q1 2026)</span>
                <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#8c90a0] text-[10px] font-mono">Superseded</span>
              </div>
              <p className="text-xs text-[#c2c6d6]">Refined SLA timings: Automated API dispatch mandatory within &lt;15m for Critical SCADA nodes.</p>
            </div>

            <div className="p-3 rounded bg-[#262a31] flex flex-col gap-1 border border-[#1f6feb]/40 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#afc6ff]">CTRL-07 v3.2 (Q2 2026 — Present)</span>
                <span className="px-1.5 py-0.5 rounded bg-[#1f6feb] text-white font-mono text-[10px] font-bold">Active Standard</span>
              </div>
              <p className="text-xs text-[#dfe2eb] leading-snug">
                Mandatory Tier-2/Tier-3 cryptographic evidence logging with verifiable air-gap sync timestamps.
              </p>
              <div className="flex items-center gap-1 font-mono text-xs text-[#7bdb80] pt-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Current signals evaluated strictly under v3.2 criteria</span>
              </div>
            </div>
          </div>

          <div className="p-2 bg-[#0a0e14] rounded font-mono text-[11px] text-[#8c90a0] border border-[#262a31]">
            Safeguard verified: No cross-version schema distortion detected for Q3 2026 evaluation.
          </div>
        </div>

        {/* Historical Remediation & Verification Ledger (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-lg bg-[#1c2026] flex flex-col justify-between gap-4 border border-[#262a31]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#7bdb80] text-[20px]">published_with_changes</span>
                <span className="text-base font-semibold text-[#dfe2eb]">Remediation & Independent Verification Ledger</span>
              </div>
              <span className="font-mono text-xs text-[#8c90a0]">Statutory Audits</span>
            </div>
            <p className="text-xs text-[#c2c6d6]">
              Supervisory doctrine holds that a remediation marked "Verified" in prior rounds does not prevent subsequent regression or operational drift.
            </p>
          </div>

          {/* Verification History Cards */}
          <div className="flex flex-col gap-2.5">
            {/* Ledger Entry 1 */}
            <div className="p-3 rounded bg-[#181c22] flex flex-col gap-1 border border-[#262a31]">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#dfe2eb]">FND-0098 (Incident Escalation Delay)</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#007124]/30 text-[#7bdb80] font-mono text-[10px] font-bold border border-[#007124]/40">
                    VERIFIED CLOSED
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#8c90a0]">Audit Date: 12-FEB-2026 (Q1 2026)</span>
              </div>
              <p className="text-xs text-[#c2c6d6]">
                Remediation Artifact: SOAR playbook v2.4 deployment log with 1,200 synthetic escalations confirmed &lt;120s dispatch.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-1 pt-1 font-mono text-xs border-t border-[#262a31]">
                <span className="text-[#8c90a0]">Verifier: Examiner Desk 04 (NCIIPC Core)</span>
                <span className="text-[#ffb4ab] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span> Regressed in Q3 2026 (GAP-0071)
                </span>
              </div>
            </div>

            {/* Ledger Entry 2 */}
            <div className="p-3 rounded bg-[#181c22] flex flex-col gap-1 border border-[#262a31]">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#dfe2eb]">FND-0104 (SCADA Network Telemetry Retention)</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#007124]/30 text-[#7bdb80] font-mono text-[10px] font-bold border border-[#007124]/40">
                    VERIFIED CLOSED
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#8c90a0]">Audit Date: 19-MAY-2026 (Q2 2026)</span>
              </div>
              <p className="text-xs text-[#c2c6d6]">
                Remediation Artifact: WORM storage cluster allocation certificate & 180-day retention tamper-evident hash chain.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-1 pt-1 font-mono text-xs border-t border-[#262a31]">
                <span className="text-[#8c90a0]">Verifier: Examiner Desk 09 (Telemetry Lab)</span>
                <span className="text-[#7bdb80] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span> Stable (No Active Regression)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs font-mono text-[#8c90a0]">
            <span>Independent verification requires re-execution against raw sensor evidence.</span>
            <Link to="/remediation" className="text-[#afc6ff] hover:underline flex items-center gap-1">
              <span>Open Complete Remediation Registry</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* INTERACTIVE RECURRING SIGNAL DETAIL DRAWER / WORKSPACE (FND-0142 / GAP-0071) */}
      <section className="p-5 rounded-lg bg-[#262a31] border border-[#ffb4ab]/40 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#93000a] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-[#ffb4ab] font-bold">Active Investigation Drilldown</span>
                <span className="font-mono text-xs text-[#8c90a0]">• Signal GAP-0071</span>
              </div>
              <h3 className="text-lg font-bold text-[#dfe2eb]">Finding Candidate: FND-0142 (Escalation Bypass Recurrence)</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#93000a]/40 text-[#ffb4ab] font-mono text-xs font-bold uppercase border border-[#93000a]/60">
              Critical Priority
            </span>
            <span className="px-2.5 py-0.5 rounded bg-[#1c2026] font-mono text-xs text-[#dfe2eb] font-medium border border-[#31353c]">
              Control: CTRL-07
            </span>
          </div>
        </div>

        {/* 3-Column Detailed Synthesis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Multi-quarter trace */}
          <div className="p-3 rounded bg-[#1c2026] flex flex-col gap-2 justify-between border border-[#31353c]">
            <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Multi-Quarter Empirical Trace</span>
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 bg-[#181c22] rounded border border-[#262a31]">
                <span>Q2 2025: GAP-0032</span>
                <span className="text-[#8c90a0]">45m delay</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#181c22] rounded border border-[#262a31]">
                <span>Q4 2025: GAP-0051</span>
                <span className="text-[#8c90a0]">38m delay</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#93000a]/30 text-[#ffb4ab] font-bold rounded border border-[#93000a]/50">
                <span>Q3 2026: GAP-0071</span>
                <span>Bypass (No dispatch)</span>
              </div>
            </div>
            <span className="text-xs text-[#c2c6d6]">Pattern demonstrates recurring operational breakdown post maintenance reboots.</span>
          </div>

          {/* Evidentiary Provenance Links */}
          <div className="p-3 rounded bg-[#1c2026] flex flex-col gap-2 justify-between border border-[#31353c]">
            <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Historical Evidence References</span>
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <Link
                to="/evidence"
                className="p-2 bg-[#181c22] rounded hover:bg-[#262a31] transition-colors flex items-center justify-between text-[#dfe2eb] border border-[#262a31]"
              >
                <span>EVD-312 (Q2 2025 SCADA log)</span>
                <span className="material-symbols-outlined text-[14px]">file_open</span>
              </Link>
              <Link
                to="/evidence"
                className="p-2 bg-[#181c22] rounded hover:bg-[#262a31] transition-colors flex items-center justify-between text-[#dfe2eb] border border-[#262a31]"
              >
                <span>EVD-498 (Q4 2025 Alert trace)</span>
                <span className="material-symbols-outlined text-[14px]">file_open</span>
              </Link>
              <Link
                to="/evidence"
                className="p-2 bg-[#181c22] rounded hover:bg-[#262a31] transition-colors flex items-center justify-between text-[#afc6ff] font-bold border border-[#1f6feb]/30"
              >
                <span>EVD-742 (Q3 2026 Incident CASE-1042)</span>
                <span className="material-symbols-outlined text-[14px]">file_open</span>
              </Link>
            </div>
            <span className="text-xs text-[#c2c6d6]">Cryptographic evidence packages verified with SHA-256 integrity seal.</span>
          </div>

          {/* Multi-Signal Fusion */}
          <div className="p-3 rounded bg-[#1c2026] flex flex-col gap-2 justify-between border border-[#31353c]">
            <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Cross-Signal Fusion Analysis</span>
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <div className="p-2 bg-[#181c22] rounded flex items-center justify-between border border-[#262a31]">
                <span>Execution Gap</span>
                <span className="text-[#ffb4ab] font-bold">GAP-0071</span>
              </div>
              <div className="p-2 bg-[#181c22] rounded flex items-center justify-between border border-[#262a31]">
                <span>Negative Space</span>
                <span className="text-[#ffb693] font-bold">NS-0041</span>
              </div>
              <div className="p-2 bg-[#181c22] rounded flex items-center justify-between border border-[#262a31]">
                <span>Historical Status</span>
                <span className="text-[#afc6ff] font-bold">Recurring (3rd cycle)</span>
              </div>
            </div>
            <span className="text-xs text-[#c2c6d6]">Combined signals satisfy threshold for statutory Finding Candidate promotion.</span>
          </div>
        </div>

        {/* Actions for Workspace */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 bg-[#1c2026] p-3 rounded border border-[#31353c]">
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#8c90a0]">
            <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">verified_user</span>
            <span>Examiner action required to formalize statutory notice</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/findings"
              className="px-3 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs transition-colors border border-[#31353c]"
            >
              View Previous Findings
            </Link>
            <Link
              to="/analytics/peer-comparison"
              className="px-3 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs transition-colors border border-[#31353c]"
            >
              Compare Peer Cohort
            </Link>
            <Link
              to="/findings/FND-0142"
              className="px-4 py-1.5 rounded bg-[#1f6feb] text-white text-xs font-semibold hover:brightness-110 transition-colors flex items-center gap-1"
            >
              <span>Open Examiner Workspace (FND-0142)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* EXAMINER SYNTHESIS & HUMAN-IN-THE-LOOP ACTIONS */}
      <footer className="p-5 rounded-lg bg-[#1c2026] flex flex-col gap-4 border border-[#262a31]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7bdb80] text-[22px]">psychology</span>
            <h3 className="text-base font-semibold text-[#dfe2eb]">Examiner Interpretation & Human-in-the-Loop Governance</h3>
          </div>
          <span className="font-mono text-xs text-[#8c90a0]">Draft Note • Supervisory Session NC-9021</span>
        </div>

        <div className="p-3 rounded bg-[#181c22] text-xs text-[#c2c6d6] leading-relaxed border border-[#262a31]">
          <span className="text-[#dfe2eb] font-semibold">FACTUAL TELEMETRY SYNTHESIS:</span>{' '}
          {attestationText}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Human in the Loop Control Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAttestationModal(true)}
              className="px-4 py-2 rounded bg-[#1f6feb] text-white text-xs font-semibold hover:brightness-110 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Add Examiner Attestation Note</span>
            </button>
            <Link
              to="/evidence"
              className="px-4 py-2 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs transition-colors flex items-center gap-1.5 border border-[#31353c]"
            >
              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
              <span>Review Evidence Explorer</span>
            </Link>
            <Link
              to="/analytics/peer-comparison"
              className="px-4 py-2 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs transition-colors flex items-center gap-1.5 border border-[#31353c]"
            >
              <span className="material-symbols-outlined text-[16px]">groups</span>
              <span>Inspect Peer Cohort</span>
            </Link>
          </div>

          {/* Quick Navigation Cross-Links */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#8c90a0]">
            <span>Cross-Nav:</span>
            <Link to="/supervision/cse-assessments/CSE-014" className="text-[#afc6ff] hover:underline">
              /cses/CSE-014
            </Link>
            <span>•</span>
            <Link to="/analytics/execution-gaps" className="text-[#afc6ff] hover:underline">
              /analytics/execution-gaps
            </Link>
            <span>•</span>
            <Link to="/analytics/negative-space" className="text-[#afc6ff] hover:underline">
              /analytics/negative-space
            </Link>
          </div>
        </div>
      </footer>

      {/* Attestation Modal */}
      {showAttestationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181c22] border border-[#262a31] rounded-lg max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#31353c] pb-3">
              <div className="flex items-center gap-2 text-[#7bdb80]">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
                <span className="font-bold text-sm">Examiner Attestation & Historical Interpretation</span>
              </div>
              <button
                onClick={() => setShowAttestationModal(false)}
                className="text-[#8c90a0] hover:text-[#dfe2eb]"
              >
                ✕
              </button>
            </div>

            {attestationSaved ? (
              <div className="p-4 bg-[#007124]/20 border border-[#007124]/40 rounded text-center space-y-2">
                <span className="material-symbols-outlined text-[32px] text-[#7bdb80]">task_alt</span>
                <div className="text-sm font-bold text-[#7bdb80]">Examiner Attestation Notarized</div>
                <p className="text-xs text-[#c2c6d6]">
                  Attestation recorded in Audit Trail ledger under FIPS-140-2 notary block #90412.
                </p>
                <button
                  onClick={() => {
                    setShowAttestationModal(false);
                    setAttestationSaved(false);
                  }}
                  className="mt-3 px-4 py-1.5 rounded bg-[#1f6feb] text-white text-xs font-semibold"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#c2c6d6]">
                  Provide sworn supervisory remarks regarding multi-quarter recurrence for <strong>CSE-014</strong>, control <strong>CTRL-07</strong>.
                </p>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[#8c90a0] block font-mono text-[11px] mb-1">Attesting Examiner</label>
                    <input
                      disabled
                      value="EX-8802 (NCIIPC Core Supervisor Desk)"
                      className="w-full bg-[#1c2026] text-[#dfe2eb] p-2 rounded border border-[#31353c] font-mono text-xs cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[#8c90a0] block font-mono text-[11px] mb-1">Supervisory Session Note</label>
                    <textarea
                      rows={4}
                      value={attestationText}
                      onChange={(e) => setAttestationText(e.target.value)}
                      className="w-full bg-[#1c2026] text-[#dfe2eb] p-2 rounded border border-[#31353c] font-sans text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#31353c]">
                  <button
                    onClick={() => setShowAttestationModal(false)}
                    className="px-3 py-1.5 rounded bg-[#262a31] text-[#c2c6d6] text-xs hover:bg-[#31353c]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setAttestationSaved(true)}
                    className="px-4 py-1.5 rounded bg-[#1f6feb] text-white text-xs font-semibold hover:brightness-110"
                  >
                    Save & Sign Attestation
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
