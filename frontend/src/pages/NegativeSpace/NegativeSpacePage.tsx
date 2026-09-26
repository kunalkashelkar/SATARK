import React from 'react';
import { FileSearch, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NegativeSpacePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Negative Space Detection</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Identifying what evidence should exist in submitted logs but is completely absent.
        </p>
      </div>

      {/* Core Analytical Principle Callout */}
      <div className="p-4 rounded-lg bg-[#0e1626] border border-blue-500/40 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
          <HelpCircle className="w-4 h-4" />
          <span>Core Semantic Rule: Missing Evidence ≠ Confirmed Failure</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Negative space flags an omission candidate against the Expected Evidence Registry. Possible causes include incomplete submissions, incorrect mapping, or legitimate asset exemptions. All candidates require human examiner review rather than automated punitive assumptions.
        </p>
      </div>

      {/* Negative Space Analysis Walkthrough */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg bg-[#0e1626] border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Expected Coverage vs Observed Telemetry (CSE-009)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Core Settlement Gateway Critical Assets</span>
              <span className="font-mono text-slate-200">100% Expected</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Observed Security Telemetry Received</span>
              <span className="font-mono text-amber-400 font-bold">78% Observed</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '78%' }}></div>
            </div>
            <div className="p-2.5 rounded bg-rose-950/20 border border-rose-800/40 text-rose-300 font-mono text-[11px] mt-2">
              Result: 22% Coverage Gap on Core Switch Cluster SW-03 → NEGATIVE SPACE CANDIDATE
            </div>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-[#0e1626] border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Examiner Context Check Protocol
          </h3>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Check for incomplete submission archives or transmission truncation</li>
            <li>Verify syslog mapping table versions across CSE clusters</li>
            <li>Review approved scheduled maintenance exemptions</li>
            <li>Confirm asset decommissioning or IP re-allocation records</li>
          </ul>
          <div className="pt-2">
            <Link
              to="/assessment/findings/FND-2042"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors"
            >
              Open Candidate Finding FND-2042 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
