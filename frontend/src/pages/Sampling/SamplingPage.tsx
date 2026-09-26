import React from 'react';
import { mockSamples } from '@/data/mock/samples';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SamplingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Supervisory Sampling Engine</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Algorithmic selection prioritizing high-risk cases, negative-space candidates, and coverage baselines.
          </p>
        </div>
      </div>

      {/* Sampling Methodology Strip */}
      <div className="p-4 rounded-lg bg-[#0e1626] border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Active Sampling Distribution (28 Recommended Cases)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500">Risk-Based</div>
            <div className="font-mono font-bold text-blue-400 mt-0.5">8 (29%)</div>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500">Evidence-Based</div>
            <div className="font-mono font-bold text-blue-400 mt-0.5">5 (18%)</div>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500">Coverage-Based</div>
            <div className="font-mono font-bold text-blue-400 mt-0.5">4 (14%)</div>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500">Recurrence-Based</div>
            <div className="font-mono font-bold text-blue-400 mt-0.5">3 (11%)</div>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500">Anomaly-Based</div>
            <div className="font-mono font-bold text-blue-400 mt-0.5">3 (11%)</div>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500">Peer-Based</div>
            <div className="font-mono font-bold text-blue-400 mt-0.5">2 (7%)</div>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500">Baseline/Random</div>
            <div className="font-mono font-bold text-blue-400 mt-0.5">3 (10%)</div>
          </div>
        </div>
      </div>

      {/* Sampling Queue Table */}
      <div className="rounded-lg bg-[#0e1626] border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">CSE</th>
              <th className="py-3 px-4">Methodology</th>
              <th className="py-3 px-4">Sampling Reason</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Evidence Strength</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {mockSamples.map(sample => (
              <tr key={sample.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-blue-400">{sample.caseId}</td>
                <td className="py-3 px-4 text-slate-200">
                  <div className="font-semibold">{sample.cseId}</div>
                  <div className="text-[10px] text-slate-500">{sample.cseName}</div>
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                  {sample.methodology.replace('_', ' ')}
                </td>
                <td className="py-3 px-4 text-slate-400 max-w-xs">{sample.samplingReason}</td>
                <td className="py-3 px-4">
                  <PriorityBadge priority={sample.priority} />
                </td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{sample.evidenceStrength}</td>
                <td className="py-3 px-4 text-right">
                  <Link
                    to="/assessment/findings/FND-2041"
                    className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors inline-flex items-center gap-1"
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
