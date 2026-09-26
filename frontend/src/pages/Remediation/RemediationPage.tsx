import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { PriorityBadge } from '@/components/common/PriorityBadge';

export const RemediationPage: React.FC = () => {
  const remediations = [
    {
      id: 'REM-104',
      findingId: 'FND-2041',
      cseId: 'CSE-014',
      title: 'Mandatory Escalation for Critical Substation Anomaly',
      action: 'Implement mandatory Level 2 supervisor escalation token in SOAR playbooks',
      response: 'Revised playbook v2.4 deployed and audit logs submitted for last 48 hours',
      status: 'UNDER_VERIFICATION',
      priority: 'HIGH' as const,
      evidenceSubmitted: '3 docs, 2 process logs'
    },
    {
      id: 'REM-105',
      findingId: 'FND-2042',
      cseId: 'CSE-009',
      title: 'Continuous Telemetry on Payment Switch Clusters',
      action: 'Restore and verify Syslog forwarding daemon on cluster SW-03',
      response: 'Syslog daemon restarted with failover buffering',
      status: 'OPEN',
      priority: 'HIGH' as const,
      evidenceSubmitted: 'Pending verification'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Remediation & Verification</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tracking corrective action lifecycles. Status change to CLOSED requires evidence-backed verification.
        </p>
      </div>

      <div className="rounded-lg bg-[#0e1626] border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Remediation ID</th>
              <th className="py-3 px-4">CSE</th>
              <th className="py-3 px-4">Required Action</th>
              <th className="py-3 px-4">CSE Response</th>
              <th className="py-3 px-4">Submitted Proof</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {remediations.map((rem) => (
              <tr key={rem.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-blue-400">
                  {rem.id}
                  <div className="text-[10px] text-slate-500 font-normal">{rem.findingId}</div>
                </td>
                <td className="py-3 px-4 font-mono text-slate-300">{rem.cseId}</td>
                <td className="py-3 px-4 text-slate-300 max-w-xs">{rem.action}</td>
                <td className="py-3 px-4 text-slate-400 max-w-xs">{rem.response}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-emerald-400">{rem.evidenceSubmitted}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {rem.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => alert(`Verification workflow started for ${rem.id}`)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    Verify Evidence <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
