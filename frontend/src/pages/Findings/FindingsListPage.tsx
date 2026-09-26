import React, { useState } from 'react';
import { mockFindings } from '@/data/mock/findings';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Filter } from 'lucide-react';
import { SignalType } from '@/types';

export const FindingsListPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filterTabs = [
    { id: 'ALL', label: 'All Signals' },
    { id: 'EXECUTION_GAP', label: 'Execution Gap' },
    { id: 'NEGATIVE_SPACE', label: 'Negative Space' },
    { id: 'PROCESS_DEVIATION', label: 'Process' },
    { id: 'HISTORICAL_RECURRENCE', label: 'Historical' },
  ];

  const filtered = selectedFilter === 'ALL' 
    ? mockFindings 
    : mockFindings.filter(f => f.signalType === selectedFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Supervisory Findings Queue</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evidence-fused finding candidates requiring human examiner validation, qualification, or remediation triggers.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <Filter className="w-3.5 h-3.5 text-slate-500 mr-2" />
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              selectedFilter === tab.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Finding Cards Grid */}
      <div className="space-y-4">
        {filtered.map(finding => (
          <div
            key={finding.id}
            className="p-5 rounded-lg bg-[#0e1626] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-blue-400">{finding.id}</span>
                <PriorityBadge priority={finding.priority} />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {finding.signalType.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {finding.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100">{finding.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{finding.whyFlagged}</p>

              {/* Supporting Signal Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Signals:</span>
                {finding.supportingSignals.map((sig, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    ✓ {sig.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Meta Column & Action Button */}
            <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5 min-w-[200px]">
              <div className="text-right space-y-1">
                <div className="text-xs text-slate-300 font-semibold">{finding.cseName}</div>
                <div className="text-[11px] font-mono text-slate-500">{finding.controlId}</div>
                <div className="text-[11px] text-emerald-400 font-mono">Evidence Strength: {finding.evidenceStrength}</div>
              </div>

              <Link
                to={`/assessment/findings/${finding.id}`}
                className="mt-4 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors"
              >
                Examine Finding <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
