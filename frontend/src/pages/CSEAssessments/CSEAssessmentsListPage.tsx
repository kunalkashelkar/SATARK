import React from 'react';
import { mockCSEs } from '@/data/mock/cses';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Link } from 'react-router-dom';
import { Building2, ArrowUpRight } from 'lucide-react';

export const CSEAssessmentsListPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Critical Sector Entities (CSEs)</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Supervisory tracking, evidence readiness scores, and open supervisory signals across designated critical entities.
        </p>
      </div>

      <div className="rounded-lg bg-[#0e1626] border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">CSE ID & Name</th>
              <th className="py-3 px-4">Sector</th>
              <th className="py-3 px-4">Assessment Period</th>
              <th className="py-3 px-4">Readiness</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Execution Gaps</th>
              <th className="py-3 px-4">Negative Space</th>
              <th className="py-3 px-4">Open Findings</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {mockCSEs.map(cse => (
              <tr key={cse.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-200">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="font-mono text-blue-400">{cse.cseId}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{cse.cseName}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300">{cse.sector}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{cse.period}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">{cse.evidenceReadiness}%</td>
                <td className="py-3 px-4">
                  <PriorityBadge priority={cse.supervisoryPriority} />
                </td>
                <td className="py-3 px-4 font-mono text-slate-300">{cse.executionGapsCount}</td>
                <td className="py-3 px-4 font-mono text-slate-300">{cse.negativeSpaceCount}</td>
                <td className="py-3 px-4 font-mono font-bold text-amber-400">{cse.openFindingsCount}</td>
                <td className="py-3 px-4 text-right">
                  <Link
                    to={`/supervision/cses/${cse.cseId}`}
                    className="px-2.5 py-1 text-xs font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded border border-blue-500/30 transition-colors inline-flex items-center gap-1"
                  >
                    Assess <ArrowUpRight className="w-3.5 h-3.5" />
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
