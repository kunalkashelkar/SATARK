import React from 'react';
import { 
  ShieldAlert, 
  Building2, 
  CheckCircle2, 
  Layers, 
  GitFork, 
  FileSearch, 
  ArrowUpRight 
} from 'lucide-react';
import { KpiCard } from '@/components/common/KpiCard';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { mockCSEs } from '@/data/mock/cses';
import { mockSamples } from '@/data/mock/samples';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const DashboardOverviewPage: React.FC = () => {
  const signalData = [
    { name: 'Execution Gap', count: 31, fill: '#ef4444' },
    { name: 'Negative Space', count: 14, fill: '#f97316' },
    { name: 'Process Dev', count: 22, fill: '#eab308' },
    { name: 'Investigation', count: 18, fill: '#3b82f6' },
    { name: 'Behavioural', count: 12, fill: '#8b5cf6' },
    { name: 'Historical', count: 16, fill: '#ec4899' },
    { name: 'Consistency', count: 9, fill: '#06b6d4' },
    { name: 'Coverage', count: 11, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Supervisory Portfolio Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-CSE operational evidence analysis, priority queues, and analytical gap detection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
            Cycle: Aug 2026 Assessment
          </span>
        </div>
      </div>

      {/* Top 8 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="CSEs Assessed" value="24" subtitle="4 Critical Sectors" icon={Building2} />
        <KpiCard title="Active Findings" value="17" subtitle="4 Validated, 13 Candidate" icon={ShieldAlert} highlight />
        <KpiCard title="High Priority Signals" value="06" subtitle="Immediate Attention" trend="+2" />
        <KpiCard title="Evidence Readiness" value="92%" subtitle="Schema & Integrity Pass" trend="+4%" trendPositive />
        <KpiCard title="Execution Gaps" value="31" subtitle="Omitted Mandatory Steps" icon={GitFork} />
        <KpiCard title="Negative Space" value="14" subtitle="Expected Telemetry Gaps" icon={FileSearch} />
        <KpiCard title="Samples Recommended" value="28" subtitle="Supervisory Sampling" icon={Layers} />
        <KpiCard title="Open Remediation" value="09" subtitle="Under Verification" icon={CheckCircle2} />
      </div>

      {/* Main Grid: Priority Queue & Signal Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supervisory Priority Queue (2 Cols) */}
        <div className="lg:col-span-2 rounded-lg bg-[#0e1626] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Supervisory Priority Queue</h3>
              <p className="text-xs text-slate-400 mt-0.5">High-priority entities requiring immediate supervisory examination</p>
            </div>
            <Link to="/supervision/cses" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All CSEs <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">CSE</th>
                  <th className="py-2.5 px-3">Sector</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Key Signal</th>
                  <th className="py-2.5 px-3">Capability Discrepancy</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {mockCSEs.map((cse) => (
                  <tr key={cse.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      <div>{cse.cseId}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[160px]">{cse.cseName}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{cse.sector}</td>
                    <td className="py-2.5 px-3">
                      <PriorityBadge priority={cse.supervisoryPriority} />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                      {cse.signalsSummary[0] || 'Nominal'}
                    </td>
                    <td className="py-2.5 px-3">
                      {cse.capabilityDiscrepancy ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                          Review Required
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Conforming</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/supervision/cses/${cse.cseId}`}
                        className="px-2.5 py-1 text-[11px] font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded border border-blue-500/30 transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signal Distribution (1 Col) */}
        <div className="rounded-lg bg-[#0e1626] border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1">Signal Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Multiple independent signals fused across portfolio</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signalData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={10} hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={85} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 4, fontSize: 11 }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Signals Fused: 139</span>
            <span className="text-blue-400 font-mono">Non-black-box</span>
          </div>
        </div>
      </div>

      {/* Expected vs Observed & Evidence Quality Strips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expected vs Observed Core Card */}
        <div className="rounded-lg bg-[#0e1626] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Expected vs Observed Assurance
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono">
              Core Assurance
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Aggregated divergence between normative control baseline and observed operational proof.
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Expected Investigation Completion: 96%</span>
                <span className="text-rose-400 font-mono font-bold">Observed: 81% (-15%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '81%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Expected Escalation Coverage: 92%</span>
                <span className="text-amber-400 font-mono font-bold">Observed: 71% (-21%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '71%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Execution Gap: 15% · Negative Space: 8%</span>
            <Link to="/analytics/execution-gaps" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
              View Analytics →
            </Link>
          </div>
        </div>

        {/* Evidence Readiness & Quality */}
        <div className="rounded-lg bg-[#0e1626] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Evidence Trust & Readiness
            </h3>
            <span className="text-emerald-400 font-mono text-xs font-bold">92% Overall</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Validation layer ensures analytics are not executed on unverified or corrupt submissions.
          </p>

          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500">Schema</div>
              <div className="font-mono font-bold text-emerald-400 mt-0.5">100%</div>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500">Completeness</div>
              <div className="font-mono font-bold text-emerald-400 mt-0.5">94%</div>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500">Relationships</div>
              <div className="font-mono font-bold text-amber-400 mt-0.5">89%</div>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500">Timestamp Quality</div>
              <div className="font-mono font-bold text-emerald-400 mt-0.5">97%</div>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500">Coverage</div>
              <div className="font-mono font-bold text-amber-400 mt-0.5">86%</div>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500">Cross-File Consistency</div>
              <div className="font-mono font-bold text-emerald-400 mt-0.5">91%</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
            <span>Semantic rule: Missing Evidence ≠ Confirmed Failure</span>
            <Link to="/analytics/evidence-quality" className="text-blue-400 hover:text-blue-300">
              Details →
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended Samples Queue */}
      <div className="rounded-lg bg-[#0e1626] border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Recommended Supervisory Samples (28 Cases)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Risk-based and coverage-based sampling allocating limited manual examination bandwidth
            </p>
          </div>
          <Link
            to="/supervision/sampling"
            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            Open Examination Queue
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockSamples.slice(0, 3).map((s) => (
            <div key={s.id} className="p-3 rounded bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-blue-400">{s.caseId}</span>
                  <PriorityBadge priority={s.priority} />
                </div>
                <div className="text-xs font-semibold text-slate-300">{s.cseName}</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{s.samplingReason}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-mono uppercase">{s.methodology.replace('_', ' ')}</span>
                <span className="text-emerald-400 font-semibold">Evidence: {s.evidenceStrength}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
