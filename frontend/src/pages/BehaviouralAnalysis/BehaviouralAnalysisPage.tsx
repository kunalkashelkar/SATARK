import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Brain,
  Clock,
  GitCommit,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  ShieldCheck,
  Send,
  HelpCircle,
  BarChart3,
  Calendar,
  Building,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface BehaviouralSignal {
  id: string; // e.g. BHV-0012
  taxonomyCategory: 'TIMING' | 'SEQUENCE' | 'VOLUME' | 'EVIDENCE_SUBMISSION' | 'RECURRENCE' | 'CROSS_SOURCE';
  title: string;
  summary: string;
  cseId: string;
  cseName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  occurrences: number;
  status: 'UNDER_REVIEW' | 'CANDIDATE' | 'PROMOTED_TO_FINDING' | 'DISMISSED';
  shiftDescription: string;
  timingDistribution: {
    early: number; // >14d Early
    normal: number; // 7-14d Normal
    deadline: number; // 1-6d Deadline
    postLag: number; // >0d Post-Lag
  };
  operationalTrace: Array<{
    date: string;
    title: string;
    detail: string;
    status: 'COMPLETE' | 'DELAYED' | 'ACTIVE';
  }>;
  sequenceComparison?: {
    expected: string[];
    observed: string[];
    gapNote: string;
  };
  crossSourceTimestamps: Array<{
    caseId: string;
    caseTs: string;
    respTs: string;
    evdTs: string;
    status: 'CONSISTENT' | 'DISCREPANCY';
  }>;
  recurrenceHistory: Array<{
    quarter: string;
    count: number;
    compliant: boolean;
  }>;
  benignExplanations: string[];
}

const INITIAL_BEHAVIOURAL_SIGNALS: BehaviouralSignal[] = [
  {
    id: 'BHV-0012',
    taxonomyCategory: 'TIMING',
    title: 'Repeated late-stage evidence submission',
    summary: 'Evidence packages submitted near or past the supervisory cut-off window. Concentration shifted toward final 48h.',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy PLC',
    priority: 'HIGH',
    confidence: 88,
    occurrences: 6,
    status: 'UNDER_REVIEW',
    shiftDescription: 'Observed Delta Trend: +3.2 days migration toward cut-off edge compared to Q1 2026 baseline.',
    timingDistribution: {
      early: 12,
      normal: 18,
      deadline: 9,
      postLag: 6
    },
    operationalTrace: [
      { date: '01 Aug 2026', title: 'Assessment Period Kickoff', detail: 'Scope confirmed for Grid Control Substation 4 telemetry.', status: 'COMPLETE' },
      { date: '15 Aug 2026', title: 'Evidence Request Issued', detail: 'Supervisory request for 12 SIEM ingestion verify logs.', status: 'COMPLETE' },
      { date: '15 Sep 2026', title: 'Expected Submission Window Closes', detail: 'Target baseline closure date per statutory standard.', status: 'COMPLETE' },
      { date: '02 - 04 Oct 2026', title: 'Observed Late Ingestion (6 Records)', detail: 'EVD-742 (+17d), EVD-761 (+18d), ESC-221 (+19d)', status: 'DELAYED' },
      { date: '26 Sep 2026', title: 'Supervisory Adjudication Window', detail: 'Under active human examiner review by NC-8802.', status: 'ACTIVE' }
    ],
    sequenceComparison: {
      expected: ['Alert', 'Case', 'Investigation', 'Escalation', 'Response', 'Close'],
      observed: ['Alert', 'Case', 'Investigation', '[SKIPPED ESCALATION]', 'Response', 'Close'],
      gapNote: '3 documented events transitioned directly from Investigation to Incident Response without formal Escalation timestamp logs. Associated with GAP-0071.'
    },
    crossSourceTimestamps: [
      { caseId: 'CASE-1042 / INC-088', caseTs: '12:03:11', respTs: '11:08:42', evdTs: '11:20:00', status: 'CONSISTENT' },
      { caseId: 'CASE-1045 / INC-091', caseTs: '14:10:04', respTs: '[UNLOGGED]', evdTs: '14:12:00', status: 'DISCREPANCY' },
      { caseId: 'CASE-1048 / INC-094', caseTs: '18:22:15', respTs: '18:01:10', evdTs: '18:15:30', status: 'CONSISTENT' }
    ],
    recurrenceHistory: [
      { quarter: 'Q2 2025', count: 4, compliant: false },
      { quarter: 'Q4 2025', count: 0, compliant: true },
      { quarter: 'Q1 2026', count: 1, compliant: true },
      { quarter: 'Q3 2026', count: 6, compliant: false }
    ],
    benignExplanations: [
      'Air-gapped telemetry sync batches queued across weekend network isolation windows.',
      'Operational shift handovers at 18:00 IST delaying ticket closure updates.',
      'Batch verification export processing queues on local collector nodes.'
    ]
  },
  {
    id: 'BHV-0009',
    taxonomyCategory: 'SEQUENCE',
    title: 'Investigation → Response without observed escalation',
    summary: 'Investigation bypassed Tier-2/Tier-3 statutory escalation and jumped straight to remediation action.',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy PLC',
    priority: 'HIGH',
    confidence: 91,
    occurrences: 3,
    status: 'UNDER_REVIEW',
    shiftDescription: 'Step omission pattern identified in SCADA failure triage.',
    timingDistribution: { early: 5, normal: 8, deadline: 3, postLag: 2 },
    operationalTrace: [
      { date: '10 Aug 2026', title: 'Fault ALR-8821 Triggered', detail: 'SCADA gateway telemetry drop', status: 'COMPLETE' },
      { date: '10 Aug 2026', title: 'Response Executed', detail: 'Direct containment push without notification', status: 'DELAYED' }
    ],
    crossSourceTimestamps: [
      { caseId: 'CASE-1042', caseTs: '09:34:00', respTs: '15:08:00', evdTs: '11:46:00', status: 'DISCREPANCY' }
    ],
    recurrenceHistory: [
      { quarter: 'Q2 2025', count: 2, compliant: false },
      { quarter: 'Q3 2026', count: 3, compliant: false }
    ],
    benignExplanations: [
      'Automated containment script triggered before analyst log entry.'
    ]
  },
  {
    id: 'BHV-0007',
    taxonomyCategory: 'VOLUME',
    title: 'Unusual concentration of closures near assessment deadline',
    summary: '48% of tickets closed in the final 72 hours before formal regulatory audit window closes.',
    cseId: 'CSE-021',
    cseName: 'TelcoGrid Telecom',
    priority: 'MEDIUM',
    confidence: 64,
    occurrences: 4,
    status: 'CANDIDATE',
    shiftDescription: 'Bulk closure batching detected.',
    timingDistribution: { early: 2, normal: 10, deadline: 14, postLag: 0 },
    operationalTrace: [
      { date: '01 Sep 2026', title: 'Audit Notice', detail: 'NCIIPC cycle initiated', status: 'COMPLETE' },
      { date: '14 Sep 2026', title: 'Bulk Resolution', detail: '18 tickets marked closed in 6 hours', status: 'DELAYED' }
    ],
    crossSourceTimestamps: [
      { caseId: 'CASE-0911', caseTs: '10:00:00', respTs: '10:15:00', evdTs: '10:18:00', status: 'CONSISTENT' }
    ],
    recurrenceHistory: [
      { quarter: 'Q1 2026', count: 3, compliant: false },
      { quarter: 'Q3 2026', count: 4, compliant: false }
    ],
    benignExplanations: [
      'Monthly reconciliation sprint aligns with calendar cycle.'
    ]
  },
  {
    id: 'BHV-0004',
    taxonomyCategory: 'RECURRENCE',
    title: 'Repeated evidence deficiency across periods',
    summary: 'HSM cryptographic rotation seeds repeatedly missing from initial submission bundles.',
    cseId: 'CSE-008',
    cseName: 'ReserveBank Interconnect',
    priority: 'HIGH',
    confidence: 78,
    occurrences: 3,
    status: 'CANDIDATE',
    shiftDescription: 'Cross-period persistence across Q2 2025, Q4 2025, and Q3 2026.',
    timingDistribution: { early: 1, normal: 4, deadline: 2, postLag: 3 },
    operationalTrace: [
      { date: '01 Aug 2026', title: 'Key Rotation Cycle', detail: 'Master key derivation triggered', status: 'COMPLETE' }
    ],
    crossSourceTimestamps: [
      { caseId: 'CASE-0740', caseTs: '08:00:00', respTs: '08:30:00', evdTs: '[MISSING]', status: 'DISCREPANCY' }
    ],
    recurrenceHistory: [
      { quarter: 'Q2 2025', count: 1, compliant: false },
      { quarter: 'Q4 2025', count: 1, compliant: false },
      { quarter: 'Q3 2026', count: 1, compliant: false }
    ],
    benignExplanations: [
      'HSM air-gap export requires multi-party dual authorization ceremony.'
    ]
  }
];

export const BehaviouralAnalysisPage: React.FC = () => {
  const [signals, setSignals] = useState<BehaviouralSignal[]>(INITIAL_BEHAVIOURAL_SIGNALS);
  const [selectedSignalId, setSelectedSignalId] = useState<string>('BHV-0012');
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [showPromoteModal, setShowPromoteModal] = useState<boolean>(false);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [candidateTitle, setCandidateTitle] = useState<string>(
    'Systemic Late Evidence Delivery during Q3 Supervisory Cycle'
  );
  const [supervisoryJustification, setSupervisoryJustification] = useState<string>(
    'Empirical shift confirmed across 6 records. Timing compression impacts statutory verification window. Candidate created for official entity representation.'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedSignal = signals.find(s => s.id === selectedSignalId) || signals[0];

  const filteredSignals = signals.filter(s => {
    if (activeFilterCategory !== 'ALL' && s.taxonomyCategory !== activeFilterCategory) return false;
    return true;
  });

  const handlePromoteCandidate = () => {
    setSignals(prev => prev.map(s => {
      if (s.id === selectedSignalId) {
        return { ...s, status: 'PROMOTED_TO_FINDING' };
      }
      return s;
    }));
    setShowPromoteModal(false);
    showToast(`Signal ${selectedSignal.id} formally promoted to Finding Candidate queue.`);
  };

  const handleDismissSignal = () => {
    setSignals(prev => prev.map(s => {
      if (s.id === selectedSignalId) {
        return { ...s, status: 'DISMISSED' };
      }
      return s;
    }));
    showToast(`Signal ${selectedSignal.id} archived with documented supervisory justification.`);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-950/95 border border-blue-500/40 text-blue-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="text-xs font-mono">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STATUTORY BOUNDARY MANDATE BANNER */}
      <div className="p-3.5 rounded-lg bg-[#181c22] border border-amber-900/40 flex items-start gap-3">
        <div className="p-2 rounded bg-amber-950/60 border border-amber-800/60 text-amber-400 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-xs font-mono leading-relaxed space-y-1">
          <div className="font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
            <span>Statutory Interpretation Boundary</span>
            <span className="text-slate-500 font-normal">| NCIIPC Directive Sec-402 (Mandatory Applicability)</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            "Behavioural analysis identifies and quantifies observable operational patterns across timing, sequence, submission, and volume metrics derived strictly from evidence logs. It does <strong className="text-slate-200 underline decoration-amber-500 underline-offset-2">NOT infer intent, motivation, negligence, misconduct, or malicious behaviour</strong>. All signals serve solely as empirical supervisory indicators requiring human examiner contextual adjudication."
          </p>
        </div>
      </div>

      {/* TOP HEADER & BREADCRUMBS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-[#181c22] border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              SAT-SA / Analytics / <span className="text-blue-400 font-semibold">Behavioural Analysis</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="px-2 py-0.5 rounded bg-[#10141a] text-blue-400 font-mono text-[10px]">
              SCOPE: CSE-014 (NorthGrid)
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            Empirical Behavioural Pattern Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical quantification of timing compression, sequence deviations, and cross-quarter operational shifts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => showToast('Behavioural telemetry stream re-synchronized.')}
            className="px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            Refresh Telemetry
          </button>
          <Link
            to="/assessment/findings/FND-0142"
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            Inspect FND-0142
          </Link>
        </div>
      </div>

      {/* 6-KPI SUMMARY METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Signals</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-slate-100">12</div>
            <div className="text-[10px] font-mono text-slate-500">Portfolio-wide</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-amber-400">Recurring</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-amber-400">6 Signals</div>
            <div className="text-[10px] font-mono text-amber-500">&gt;=2 Cycles Persistent</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-blue-400">Timing Shifts</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-blue-400">4 Signals</div>
            <div className="text-[10px] font-mono text-blue-500">Cut-off Edge Clusters</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-rose-400">Sequence Skips</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-rose-400">5 Signals</div>
            <div className="text-[10px] font-mono text-rose-500">Deviations in Workflow</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-emerald-400">Evidence Pattern</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-slate-100">3 Signals</div>
            <div className="text-[10px] font-mono text-emerald-500">Late-Stage Pack Dumps</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-purple-400">Examiner Queue</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-purple-300">4 Active</div>
            <div className="text-[10px] font-mono text-purple-400">Adjudication Required</div>
          </div>
        </div>
      </div>

      {/* FILTER CATEGORY PILLS */}
      <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
        <span className="text-[10px] uppercase text-slate-500 mr-1 shrink-0">Filter Taxonomy:</span>
        <button
          onClick={() => setActiveFilterCategory('ALL')}
          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
            activeFilterCategory === 'ALL'
              ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 font-semibold'
              : 'bg-[#1c2026] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All ({signals.length})
        </button>
        <button
          onClick={() => setActiveFilterCategory('TIMING')}
          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
            activeFilterCategory === 'TIMING'
              ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 font-semibold'
              : 'bg-[#1c2026] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Timing (1)
        </button>
        <button
          onClick={() => setActiveFilterCategory('SEQUENCE')}
          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
            activeFilterCategory === 'SEQUENCE'
              ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 font-semibold'
              : 'bg-[#1c2026] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Sequence (1)
        </button>
        <button
          onClick={() => setActiveFilterCategory('VOLUME')}
          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
            activeFilterCategory === 'VOLUME'
              ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 font-semibold'
              : 'bg-[#1c2026] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Volume (1)
        </button>
        <button
          onClick={() => setActiveFilterCategory('RECURRENCE')}
          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
            activeFilterCategory === 'RECURRENCE'
              ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 font-semibold'
              : 'bg-[#1c2026] text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Recurrence (1)
        </button>
      </div>

      {/* SPLIT WORKBENCH: SIGNAL QUEUE TABLE (5 COLS) + DETAIL INSPECTOR (7 COLS) */}
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: SIGNAL CARDS */}
        <div className="col-span-12 lg:col-span-5 space-y-2">
          <div className="rounded-lg bg-[#181c22] border border-slate-800 overflow-hidden">
            <div className="px-3.5 py-2.5 bg-[#1c2026] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                Observed Signals ({filteredSignals.length})
              </span>
              <span className="text-[10px] font-mono text-slate-400">Sorted by Priority</span>
            </div>

            <div className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredSignals.map((sig) => {
                const isSelected = sig.id === selectedSignalId;
                return (
                  <div
                    key={sig.id}
                    onClick={() => setSelectedSignalId(sig.id)}
                    className={`p-3.5 cursor-pointer transition-colors space-y-2 ${
                      isSelected
                        ? 'bg-blue-950/30 border-l-2 border-blue-400'
                        : 'hover:bg-[#1c2026]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-blue-400">{sig.id}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#10141a] text-[10px] text-slate-400 uppercase">
                          {sig.taxonomyCategory}
                        </span>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          sig.priority === 'HIGH'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {sig.priority} PRIORITY
                      </span>
                    </div>

                    <p className="text-slate-200 font-semibold leading-snug">{sig.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{sig.summary}</p>

                    <div className="grid grid-cols-3 gap-1 p-2 rounded bg-[#10141a] text-[10px]">
                      <div>
                        <span className="text-slate-500 block">OCCURRENCES</span>
                        <span className="text-slate-200 font-bold">{sig.occurrences} instances</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">CONFIDENCE</span>
                        <span className="text-emerald-400 font-bold">{sig.confidence}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">STATUS</span>
                        <span className="text-blue-400 font-bold">{sig.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED INSPECTION WORKBENCH */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="p-4 rounded-lg bg-[#181c22] border border-slate-800 space-y-4 font-mono text-xs">
            {/* Inspector Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-400">{selectedSignal.id}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 text-[10px] border border-blue-800/60 font-bold uppercase">
                    {selectedSignal.taxonomyCategory} CONCENTRATION
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Scope: <strong className="text-slate-100">{selectedSignal.cseName} ({selectedSignal.cseId})</strong>
                </div>
              </div>

              <div className="text-right text-[11px]">
                <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold">
                  {selectedSignal.priority} PRIORITY
                </span>
                <div className="text-slate-500 mt-1">Confidence: {selectedSignal.confidence}%</div>
              </div>
            </div>

            {/* Empirical Statement Card */}
            <div className="p-3 rounded bg-[#1c2026] border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-400" /> Empirical Observation Statement
              </span>
              <p className="text-slate-200 leading-relaxed text-xs">
                {selectedSignal.summary} {selectedSignal.shiftDescription}
              </p>
            </div>

            {/* Timing Distribution Bar Visualization */}
            <div className="p-3 rounded bg-[#1c2026] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-400 font-bold">
                  Submission Timing Distribution Relative to Cut-off Window
                </span>
                <span className="text-[10px] text-slate-500">N = 45 Evidence Packages</span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div className="flex flex-col gap-1">
                  <div className="h-20 bg-[#10141a] rounded flex flex-col justify-end p-1">
                    <div className="w-full bg-emerald-500 rounded" style={{ height: '40%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">&gt;14d Early</span>
                    <span className="text-slate-200 font-bold">{selectedSignal.timingDistribution.early}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="h-20 bg-[#10141a] rounded flex flex-col justify-end p-1">
                    <div className="w-full bg-blue-500 rounded" style={{ height: '60%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">7-14d Normal</span>
                    <span className="text-slate-200 font-bold">{selectedSignal.timingDistribution.normal}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="h-20 bg-[#10141a] rounded flex flex-col justify-end p-1">
                    <div className="w-full bg-amber-500 rounded" style={{ height: '30%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">1-6d Deadline</span>
                    <span className="text-amber-400 font-bold">{selectedSignal.timingDistribution.deadline}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="h-20 bg-[#10141a] rounded flex flex-col justify-end p-1">
                    <div className="w-full bg-rose-500 rounded" style={{ height: '20%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">&gt;0d Post-Lag</span>
                    <span className="text-rose-400 font-bold">{selectedSignal.timingDistribution.postLag}</span>
                  </div>
                </div>
              </div>

              <div className="p-1.5 rounded bg-[#10141a] text-[10px] text-slate-400 flex items-center justify-between">
                <span>Observed Delta Trend: +3.2 days migration toward cut-off edge</span>
                <span className="text-amber-400 font-bold">SHIFT DETECTED</span>
              </div>
            </div>

            {/* Sequence Integrity (if present) */}
            {selectedSignal.sequenceComparison && (
              <div className="p-3 rounded bg-[#1c2026] border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Sequence Integrity Analysis</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-1.5 rounded bg-[#10141a]">
                    <span className="text-slate-500 block text-[9px] uppercase">Expected Statutory Sequence:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5 text-slate-300">
                      {selectedSignal.sequenceComparison.expected.map((s, i) => (
                        <span key={i}>{s} {i < selectedSignal.sequenceComparison!.expected.length - 1 ? '→' : ''}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-rose-950/20 border border-rose-900/40">
                    <span className="text-rose-400 block text-[9px] uppercase font-bold">Observed Sequence (Deviation):</span>
                    <div className="flex flex-wrap gap-1 mt-0.5 text-slate-300 font-semibold">
                      {selectedSignal.sequenceComparison.observed.map((s, i) => (
                        <span key={i} className={s.includes('SKIPPED') ? 'text-rose-400 font-bold' : ''}>
                          {s} {i < selectedSignal.sequenceComparison!.observed.length - 1 ? '→' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">{selectedSignal.sequenceComparison.gapNote}</p>
              </div>
            )}

            {/* Recurrence History Table */}
            <div className="p-3 rounded bg-[#1c2026] border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase text-slate-400 font-bold">Cross-Cycle Recurrence History</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedSignal.recurrenceHistory.map((rec, i) => (
                  <div key={i} className="p-2 rounded bg-[#10141a] text-center space-y-0.5">
                    <div className="text-slate-400 text-[10px]">{rec.quarter}</div>
                    <div className={`font-bold text-xs ${rec.compliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {rec.count} late
                    </div>
                    <span className={`text-[9px] block ${rec.compliant ? 'text-slate-500' : 'text-rose-400 font-semibold'}`}>
                      {rec.compliant ? 'Compliant' : 'Non-Conform'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plausible Benign Explanations Box */}
            <div className="p-3 rounded bg-[#10141a] border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px]">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Plausible Benign Operational Confounders (Must Rule Out)</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-400">
                {selectedSignal.benignExplanations.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
            </div>

            {/* Human Examiner Adjudication Suite Buttons */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 font-bold">
                Examiner Adjudication Actions
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowPromoteModal(true)}
                  className="py-2 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Create Finding Candidate
                </button>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="py-2 px-3 rounded bg-[#1c2026] hover:bg-[#262a31] border border-slate-800 text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  Request Telemetry Logs
                </button>
                <button
                  onClick={() => showToast(`Internal memorandum attached to ${selectedSignal.id}.`)}
                  className="py-2 px-3 rounded bg-[#1c2026] hover:bg-[#262a31] border border-slate-800 text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Add Supervisory Note
                </button>
                <button
                  onClick={handleDismissSignal}
                  className="py-2 px-3 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-200 font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  Dismiss Signal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: PROMOTE TO FINDING CANDIDATE */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg bg-[#181c22] border border-slate-800 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-slate-100">Create Finding Candidate from {selectedSignal.id}</h3>
              </div>
              <button onClick={() => setShowPromoteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-2 rounded bg-[#10141a] text-slate-400">
                Target Entity: <strong className="text-slate-200">{selectedSignal.cseName}</strong> | Signal: {selectedSignal.id}
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400">Candidate Title</label>
                <input
                  type="text"
                  value={candidateTitle}
                  onChange={(e) => setCandidateTitle(e.target.value)}
                  className="w-full mt-1 p-2 rounded bg-[#10141a] border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400">Supervisory Justification</label>
                <textarea
                  rows={3}
                  value={supervisoryJustification}
                  onChange={(e) => setSupervisoryJustification(e.target.value)}
                  className="w-full mt-1 p-2 rounded bg-[#10141a] border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPromoteModal(false)}
                  className="px-4 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromoteCandidate}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Confirm Candidate Promotion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST TELEMETRY */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg bg-[#181c22] border border-slate-800 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-slate-100">Issue Telemetry Request Order</h3>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Issue a formal telemetry clarification order under NCIIPC Directive Section 402 for entities connected via air-gapped diode transfer.
              </p>

              <div className="p-2.5 rounded bg-[#10141a] text-slate-400">
                Target Pipeline: <strong className="text-emerald-400">NorthGrid SIEM Edge Forwarder 02</strong>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400">Requested Window</label>
                <input
                  type="text"
                  defaultValue="2026-09-15 00:00:00 UTC - 2026-10-05 23:59:59 UTC"
                  className="w-full mt-1 p-2 rounded bg-[#10141a] border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    showToast('Telemetry order dispatched via air-gapped queue sync.');
                  }}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Dispatch Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
