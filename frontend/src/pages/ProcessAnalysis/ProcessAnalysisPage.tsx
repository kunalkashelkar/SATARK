import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCommit,
  GitBranch,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Search,
  Filter,
  Sliders,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  FileText,
  Workflow,
  Cpu,
  BarChart3,
  Calendar,
  Building
} from 'lucide-react';

interface ProcessNode {
  id: string;
  name: string;
  stageNumber: number;
  expectedCount: number;
  observedCount: number;
  medianDuration: string;
  expectedDuration: string;
  conformanceRate: number; // percentage
  deviationType: 'CONFORMANT' | 'OMISSION_GAP' | 'SLA_BREACH' | 'ORDER_INVERSION';
  deviationDetails: string;
  associatedGapRef?: string;
  pm4pyAlignmentScore: number;
}

interface ProcessPath {
  id: string;
  variantName: string;
  frequency: number; // e.g. 68% of traces
  isHappyPath: boolean;
  steps: string[];
  casesAffected: number;
  riskRating: 'NORMAL' | 'ELEVATED' | 'HIGH';
}

const PROCESS_NODES: ProcessNode[] = [
  {
    id: 'node-alert',
    name: '01. Alert Ingestion',
    stageNumber: 1,
    expectedCount: 1420,
    observedCount: 1420,
    medianDuration: '0.4s',
    expectedDuration: '< 1.0s',
    conformanceRate: 100,
    deviationType: 'CONFORMANT',
    deviationDetails: 'Raw SIEM & SCADA telemetry ingested with verified RFC-3161 timestamps.',
    pm4pyAlignmentScore: 1.0
  },
  {
    id: 'node-triage',
    name: '02. Initial Triage',
    stageNumber: 2,
    expectedCount: 1420,
    observedCount: 1398,
    medianDuration: '7.2m',
    expectedDuration: '< 15.0m',
    conformanceRate: 98.4,
    deviationType: 'CONFORMANT',
    deviationDetails: 'Tier-1 automated prioritization active across standard SOC triage queues.',
    pm4pyAlignmentScore: 0.98
  },
  {
    id: 'node-case',
    name: '03. Case Creation',
    stageNumber: 3,
    expectedCount: 412,
    observedCount: 412,
    medianDuration: '14.0m',
    expectedDuration: '< 20.0m',
    conformanceRate: 100,
    deviationType: 'CONFORMANT',
    deviationDetails: 'Dossier CASE-1042 formalized with statutory case ID tokens.',
    pm4pyAlignmentScore: 1.0
  },
  {
    id: 'node-investigate',
    name: '04. Investigation',
    stageNumber: 4,
    expectedCount: 412,
    observedCount: 401,
    medianDuration: '28.5m',
    expectedDuration: '< 30.0m',
    conformanceRate: 97.3,
    deviationType: 'CONFORMANT',
    deviationDetails: 'Root cause analysis executed by accredited Tier-2 forensic analyst.',
    pm4pyAlignmentScore: 0.97
  },
  {
    id: 'node-telemetry',
    name: '05. Telemetry Capture',
    stageNumber: 5,
    expectedCount: 412,
    observedCount: 388,
    medianDuration: '44.0m',
    expectedDuration: '< 45.0m',
    conformanceRate: 94.1,
    deviationType: 'CONFORMANT',
    deviationDetails: 'Artifacts EVD-742 & EVD-761 cryptographically attached to dossier.',
    pm4pyAlignmentScore: 0.94
  },
  {
    id: 'node-escalate',
    name: '06. Escalation Protocol',
    stageNumber: 6,
    expectedCount: 184,
    observedCount: 122,
    medianDuration: 'FAILED / SKIPPED',
    expectedDuration: '< 60.0m',
    conformanceRate: 66.3,
    deviationType: 'OMISSION_GAP',
    deviationDetails: 'CRITICAL OMISSION: Mandatory Tier-2/Tier-3 regulatory escalation missing during SCADA INV-338.',
    associatedGapRef: 'GAP-0071',
    pm4pyAlignmentScore: 0.66
  },
  {
    id: 'node-response',
    name: '07. Response & Mitigation',
    stageNumber: 7,
    expectedCount: 412,
    observedCount: 395,
    medianDuration: '240.0m',
    expectedDuration: '< 60.0m',
    conformanceRate: 72.8,
    deviationType: 'SLA_BREACH',
    deviationDetails: 'Containment actions executed 3.2 hours past statutory SLA boundary (+192m delta).',
    associatedGapRef: 'GAP-0072',
    pm4pyAlignmentScore: 0.72
  },
  {
    id: 'node-closure',
    name: '08. Remediation Closure',
    stageNumber: 8,
    expectedCount: 412,
    observedCount: 390,
    medianDuration: '18.4h',
    expectedDuration: '< 24.0h',
    conformanceRate: 94.6,
    deviationType: 'CONFORMANT',
    deviationDetails: 'Final incident sign-off and post-mortem register logged.',
    pm4pyAlignmentScore: 0.94
  }
];

const PROCESS_VARIANTS: ProcessPath[] = [
  {
    id: 'var-1',
    variantName: 'Variant 1: Statutory Standard (Happy Path)',
    frequency: 66.3,
    isHappyPath: true,
    steps: ['Alert', 'Triage', 'Case Open', 'Investigate', 'Telemetry', 'Escalation', 'Response', 'Closure'],
    casesAffected: 273,
    riskRating: 'NORMAL'
  },
  {
    id: 'var-2',
    variantName: 'Variant 2: Escalation Omission Loop (CASE-1042 Pattern)',
    frequency: 21.8,
    isHappyPath: false,
    steps: ['Alert', 'Triage', 'Case Open', 'Investigate', 'Telemetry', '[SKIPPED ESCALATION]', 'Delayed Response', 'Closure'],
    casesAffected: 90,
    riskRating: 'HIGH'
  },
  {
    id: 'var-3',
    variantName: 'Variant 3: Premature Closure Bypass',
    frequency: 11.9,
    isHappyPath: false,
    steps: ['Alert', 'Triage', 'Case Open', '[BYPASS INVESTIGATION]', 'Closure'],
    casesAffected: 49,
    riskRating: 'ELEVATED'
  }
];

export const ProcessAnalysisPage: React.FC = () => {
  const [nodes, setNodes] = useState<ProcessNode[]>(PROCESS_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-escalate');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('var-2');
  const [selectedScope, setSelectedScope] = useState<string>('CSE-014');
  const [timeWindow, setTimeWindow] = useState<string>('Q3 2026');
  const [engineSynced, setEngineSynced] = useState<boolean>(true);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[5];
  const selectedVariant = PROCESS_VARIANTS.find(v => v.id === selectedVariantId) || PROCESS_VARIANTS[1];

  return (
    <div className="space-y-4">
      {/* TOP COMMAND & CONTEXT BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-[#181c22] border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-800/60">
              Process Mining & Conformance Engine
            </span>
            <span className="text-xs font-mono text-slate-400">PM4Py Conformance Kernel • Token Replay v1.8</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            Process Conformance & Petri Net Deviation Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical discovery of workflow deviations, skipped escalation transitions, and duration bottlenecks across incident life cycles.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1c2026] border border-slate-800 text-xs font-mono text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Fitness: <strong className="text-emerald-400">84.2%</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1c2026] border border-slate-800 text-xs font-mono text-slate-300">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Precision: <strong className="text-blue-400">89.6%</strong></span>
          </div>
          <button
            onClick={() => {
              setEngineSynced(false);
              setTimeout(() => setEngineSynced(true), 800);
            }}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${!engineSynced ? 'animate-spin' : ''}`} />
            Recompute PM4Py Alignment
          </button>
        </div>
      </div>

      {/* STATUTORY NOTICE BANNER */}
      <div className="p-3.5 rounded-lg bg-[#181c22] border border-slate-800 flex items-start gap-3">
        <div className="p-2 rounded bg-blue-950/60 border border-blue-800/60 text-blue-400 shrink-0">
          <Workflow className="w-4 h-4" />
        </div>
        <div className="text-xs font-mono leading-relaxed space-y-1">
          <div className="font-bold text-blue-300 uppercase tracking-wide flex items-center gap-2">
            <span>Sovereign Process Conformance Tenet</span>
            <span className="text-slate-500 font-normal">| Event-Log Token Replay</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            "Conformance checks compare observed discrete event traces against statutory standard workflows. Transition discrepancies identify potential execution gaps (<strong className="text-slate-200">GAP-0071</strong>) and negative space candidates (<strong className="text-slate-200">NS-0041</strong>). Process deviation indicates potential non-compliance requiring human investigation, not an automatic finding."
          </p>
        </div>
      </div>

      {/* 6-KPI SUMMARY METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Cases Replayed</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-slate-100">412</div>
            <div className="text-[10px] font-mono text-slate-500">Incident Dossiers</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-emerald-400">Fully Conformant</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-emerald-400">273 (66.3%)</div>
            <div className="text-[10px] font-mono text-emerald-500">Variant 1 Happy Path</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-rose-400">Skipped Transitions</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-rose-400">62 Omissions</div>
            <div className="text-[10px] font-mono text-rose-500">Node 06 Escalation Gaps</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-amber-400">SLA Bottlenecks</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-amber-400">48 Breaches</div>
            <div className="text-[10px] font-mono text-amber-500">Node 07 Response Delays</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-purple-400">Discovered Variants</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-purple-300">3 Top Paths</div>
            <div className="text-[10px] font-mono text-purple-400">98.2% Cumulative Coverage</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Current Scope</span>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-blue-400">CSE-014</div>
            <div className="text-[10px] font-mono text-slate-500">CASE-1042 Highlight</div>
          </div>
        </div>
      </div>

      {/* HERO SECTION: 8-STAGE PROCESS CONFORMANCE SWIMLANE */}
      <div className="p-4 rounded-lg bg-[#181c22] border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5 font-mono">
              <Workflow className="w-4 h-4 text-blue-400" />
              Standard Incident Response Conformance Pipeline (NCIIPC CSF CTRL-07)
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 text-[10px] font-mono border border-blue-800/60">
              Target: CASE-1042 / INV-338
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">Conformant Step</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-rose-400 font-bold">Omission Gap (Crit)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-amber-400">SLA Bottleneck</span>
            </div>
          </div>
        </div>

        {/* 8 Swimlane Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
          {nodes.map((n) => {
            const isSelected = n.id === selectedNodeId;
            const isOmission = n.deviationType === 'OMISSION_GAP';
            const isSlaBreach = n.deviationType === 'SLA_BREACH';
            return (
              <div
                key={n.id}
                onClick={() => setSelectedNodeId(n.id)}
                className={`p-2.5 rounded border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'ring-2 ring-blue-500 bg-[#1c2026]'
                    : isOmission
                    ? 'bg-rose-950/20 border-rose-900/60 hover:bg-rose-950/40'
                    : isSlaBreach
                    ? 'bg-amber-950/20 border-amber-900/60 hover:bg-amber-950/40'
                    : 'bg-[#14181f] border-slate-800 hover:bg-[#1c2026]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-300 truncate">{n.name}</span>
                  {isOmission ? (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : isSlaBreach ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>

                <div className="space-y-1 font-mono text-[10px]">
                  <div className="p-1 rounded bg-[#10141a] text-slate-400 flex justify-between">
                    <span>Expected:</span>
                    <span className="text-slate-300 font-semibold">{n.expectedDuration}</span>
                  </div>
                  <div
                    className={`p-1 rounded flex justify-between ${
                      isOmission
                        ? 'bg-rose-950/60 text-rose-300 font-bold'
                        : isSlaBreach
                        ? 'bg-amber-950/60 text-amber-300 font-bold'
                        : 'bg-[#10141a] text-emerald-400'
                    }`}
                  >
                    <span>Observed:</span>
                    <span>{n.medianDuration}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Conformance:</span>
                  <span
                    className={`font-bold ${
                      isOmission ? 'text-rose-400' : isSlaBreach ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {n.conformanceRate}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SPLIT WORKSPACE: PROCESS VARIANTS TABLE (6 COLS) + NODE DEVIATION INSPECTOR (6 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT: DISCOVERED PROCESS VARIANTS */}
        <div className="lg:col-span-6 space-y-3">
          <div className="rounded-lg bg-[#181c22] border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-[#1c2026] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  Discovered Process Variants (Trace Clustering)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">3 Significant Clusters</span>
            </div>

            <div className="divide-y divide-slate-800/60 font-mono text-xs">
              {PROCESS_VARIANTS.map((v) => {
                const isSelected = v.id === selectedVariantId;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-3.5 cursor-pointer transition-colors space-y-2 ${
                      isSelected
                        ? 'bg-purple-950/20 border-l-2 border-purple-400'
                        : 'hover:bg-[#1c2026]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{v.variantName}</span>
                        {v.isHappyPath && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[9px] font-bold">
                            HAPPY PATH
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.riskRating === 'HIGH'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            : v.riskRating === 'ELEVATED'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        }`}
                      >
                        {v.riskRating} RISK
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Frequency: <strong className="text-blue-400">{v.frequency}%</strong> ({v.casesAffected} Cases)</span>
                      <span>Alignment: {v.isHappyPath ? '1.00 (Ideal)' : '0.68 (Deviant)'}</span>
                    </div>

                    {/* Step pills visualization */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {v.steps.map((st, i) => (
                        <span
                          key={i}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            st.includes('SKIPPED')
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold'
                              : st.includes('Delayed')
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                              : st.includes('BYPASS')
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60 font-bold'
                              : 'bg-[#10141a] text-slate-400 border border-slate-800'
                          }`}
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: SELECTED NODE DEVIATION & ANALYTICAL REASONING INSPECTOR */}
        <div className="lg:col-span-6 space-y-3">
          <div className="p-4 rounded-lg bg-[#181c22] border border-slate-800 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-mono text-slate-100">{selectedNode.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedNode.deviationType === 'OMISSION_GAP'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : selectedNode.deviationType === 'SLA_BREACH'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    {selectedNode.deviationType.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  Node Index: 0{selectedNode.stageNumber} • Empirical Conformance: {selectedNode.conformanceRate}%
                </div>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-400">
                <div>Observed Count: <strong className="text-slate-200">{selectedNode.observedCount}</strong></div>
                <div className="text-slate-500">Expected: {selectedNode.expectedCount}</div>
              </div>
            </div>

            {/* Deviation Narrative */}
            <div className="p-3 rounded bg-[#1c2026] border border-slate-800 space-y-2 text-xs font-mono">
              <span className="text-[10px] uppercase text-slate-400 font-bold">Empirical Transition Finding</span>
              <p className="text-slate-200 leading-relaxed">
                "{selectedNode.deviationDetails}"
              </p>
              {selectedNode.associatedGapRef && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Fused Synthesis Reference:</span>
                  <Link
                    to="/analytics/execution-gaps"
                    className="text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    {selectedNode.associatedGapRef} (Execution Gaps) <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* PM4Py Alignment Breakdown */}
            <div className="p-3 rounded bg-[#10141a] border border-slate-800 space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase text-slate-400 font-bold">PM4Py Token Replay Diagnostics</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-[#181c22] border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Alignment Score</div>
                  <div className="text-sm font-bold text-slate-200">{selectedNode.pm4pyAlignmentScore * 100}%</div>
                </div>
                <div className="p-2 rounded bg-[#181c22] border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Missing Token Cost</div>
                  <div className="text-sm font-bold text-rose-400">
                    {selectedNode.deviationType === 'OMISSION_GAP' ? '1.0 (Strict Violation)' : '0.0'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/analytics/execution-gaps"
                className="py-2 px-3 rounded bg-[#1c2026] hover:bg-[#262a31] border border-slate-800 text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                Cross-Examine Execution Gap
              </Link>
              <Link
                to="/assessment/findings/FND-0142"
                className="py-2 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <FileText className="w-3.5 h-3.5" />
                Adjudicate FND-0142
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
