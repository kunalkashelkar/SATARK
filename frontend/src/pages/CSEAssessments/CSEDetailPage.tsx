import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockCSEs } from '@/data/mock/cses';
import { mockFindings } from '@/data/mock/findings';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { KpiCard } from '@/components/common/KpiCard';
import { Building2, ShieldAlert, ArrowRight, AlertTriangle, Layers } from 'lucide-react';

export const CSEDetailPage: React.FC = () => {
  const { cseId } = useParams<{ cseId: string }>();
  const cse = mockCSEs.find(c => c.cseId.toLowerCase() === (cseId || 'cse-014').toLowerCase()) || mockCSEs[0];
  const cseFindings = mockFindings.filter(f => f.cseId === cse.cseId);

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="p-5 rounded-lg bg-[#0e1626] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-blue-400">{cse.cseId}</span>
            <PriorityBadge priority={cse.supervisoryPriority} />
            <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
              {cse.sector}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {cse.status}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-1">{cse.cseName}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Assessment Period: <strong className="text-slate-300">{cse.period}</strong>
          </p>
        </div>

        <Link
          to="/supervision/cses"
          className="text-xs text-blue-400 hover:text-blue-300 self-start md:self-center font-medium"
        >
          ← Back to CSE Portfolio
        </Link>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard title="Evidence Readiness" value={`${cse.evidenceReadiness}%`} subtitle="Validation Pass" />
        <KpiCard title="Supervisory Priority" value={cse.supervisoryPriority} subtitle="Attention Allocation" />
        <KpiCard title="Open Findings" value={cse.openFindingsCount} subtitle="Active Examination" highlight />
        <KpiCard title="Execution Gaps" value={cse.executionGapsCount} subtitle="Omitted Procedures" />
        <KpiCard title="Negative Space" value={cse.negativeSpaceCount} subtitle="Missing Telemetry" />
      </div>

      {/* Capability Discrepancy USP Section */}
      <div className="p-5 rounded-lg bg-[#0e1626] border border-amber-500/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Capability Discrepancy Engine
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-bold">
            Capability Discrepancy — Requires Examiner Review
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Supervisory comparison of claimed institutional capability versus evidence-backed operational performance.
          <em className="text-slate-500 not-italic block mt-0.5">
            (Rule: Signal indicates capability discrepancy for human review, not an automatic failure declaration)
          </em>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3 rounded bg-slate-900 border border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Claimed Capability (Self-Assessment)
            </div>
            <div className="text-sm font-bold text-slate-200 mt-1">Investigation Capability: {cse.claimedCapability}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              CSE claims full L3 forensics investigation and rapid Tier-2 escalation across all OT and SCADA subnets.
            </p>
          </div>

          <div className="p-3 rounded bg-amber-950/20 border border-amber-800/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Observed Capability (Operational Evidence)
            </div>
            <div className="text-sm font-bold text-amber-300 mt-1">
              Evidence-backed Investigation Depth: {cse.observedCapability}
            </div>
            <ul className="text-[11px] text-slate-300 mt-1 list-disc list-inside space-y-0.5">
              <li>Incomplete investigation actions on critical alerts</li>
              <li>Weak evidence coverage on SCADA boundary switches</li>
              <li>Repeated shallow triage notes under 4 minutes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Associated Findings */}
      <div className="rounded-lg bg-[#0e1626] border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          Candidate Findings for {cse.cseId} ({cseFindings.length})
        </h3>

        <div className="space-y-3">
          {cseFindings.map(f => (
            <div key={f.id} className="p-4 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400">{f.id}</span>
                  <PriorityBadge priority={f.priority} />
                  <span className="text-xs font-semibold text-slate-200">{f.title}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{f.whyFlagged}</div>
              </div>

              <Link
                to={`/assessment/findings/${f.id}`}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-xs font-medium flex items-center gap-1 transition-colors"
              >
                Inspect Finding <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
