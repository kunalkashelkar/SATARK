import React from 'react';
import { GitFork, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExecutionGapsPage: React.FC = () => {
  const gaps = [
    {
      caseId: 'CASE-1042',
      cseId: 'CSE-014',
      controlId: 'CTRL-07',
      expected: 'Escalation to L2 Incident Commander',
      observed: 'Direct Closure after initial triage',
      gap: 'Missing Escalation',
      records: '4 records',
      severity: 'HIGH'
    },
    {
      caseId: 'CASE-1098',
      cseId: 'CSE-021',
      controlId: 'CTRL-04',
      expected: 'Full IP endpoint forensic capture',
      observed: 'Partial log extract only',
      gap: 'Incomplete Investigation',
      records: '6 records',
      severity: 'MEDIUM'
    },
    {
      caseId: 'CASE-1130',
      cseId: 'CSE-003',
      controlId: 'CTRL-09',
      expected: 'Sensor verification telemetry hash',
      observed: 'Unsigned free-text note',
      gap: 'Missing Cryptographic Proof',
      records: '2 records',
      severity: 'HIGH'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Execution Gap Analysis</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Analytical detection of what operational steps should have executed according to controls, but did not.
        </p>
      </div>

      {/* Comparison Diagram Card */}
      <div className="p-5 rounded-lg bg-[#0e1626] border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Process Flow Discrepancy Model
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded bg-blue-950/20 border border-blue-800/40">
            <span className="text-[10px] font-bold uppercase text-blue-400">Expected Process Sequence</span>
            <div className="flex items-center gap-2 mt-3 font-mono text-xs text-slate-200">
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Alert</span> →
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Case</span> →
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Investigation</span> →
              <span className="px-2 py-1 bg-blue-900/60 rounded border border-blue-500 font-bold text-blue-300">Escalation</span> →
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Closure</span>
            </div>
          </div>

          <div className="p-4 rounded bg-rose-950/20 border border-rose-800/40">
            <span className="text-[10px] font-bold uppercase text-rose-400">Observed Operational Execution</span>
            <div className="flex items-center gap-2 mt-3 font-mono text-xs text-slate-200">
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Alert</span> →
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Case</span> →
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Investigation</span> →
              <span className="px-2 py-1 bg-rose-900/60 rounded border border-rose-500 font-bold text-rose-300 line-through">Escalation</span> →
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Closure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Gaps Table */}
      <div className="rounded-lg bg-[#0e1626] border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">CSE</th>
              <th className="py-3 px-4">Expected Action</th>
              <th className="py-3 px-4">Observed Operational State</th>
              <th className="py-3 px-4">Execution Gap Detected</th>
              <th className="py-3 px-4">Evidence Records</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {gaps.map((g, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-blue-400">{g.caseId}</td>
                <td className="py-3 px-4 font-mono text-slate-300">{g.cseId}</td>
                <td className="py-3 px-4 text-slate-300">{g.expected}</td>
                <td className="py-3 px-4 text-slate-400">{g.observed}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono font-semibold text-[10px]">
                    {g.gap}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">{g.records}</td>
                <td className="py-3 px-4 text-right">
                  <Link
                    to="/assessment/findings/FND-2041"
                    className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded border border-blue-500/30 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    Examine <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
