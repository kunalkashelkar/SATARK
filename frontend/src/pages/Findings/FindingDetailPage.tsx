import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockFindings } from '@/data/mock/findings';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { 
  ShieldAlert, 
  Clock, 
  GitFork, 
  FileCheck2, 
  Database, 
  Check, 
  X, 
  FileQuestion,
  HelpCircle,
  FileSignature
} from 'lucide-react';
import { FindingStatus } from '@/types';

export const FindingDetailPage: React.FC = () => {
  const { findingId } = useParams<{ findingId: string }>();
  const finding = mockFindings.find(f => f.id.toLowerCase() === (findingId || 'fnd-2041').toLowerCase()) || mockFindings[0];

  const [currentStatus, setCurrentStatus] = useState<FindingStatus>(finding.status);
  const [decisionNotes, setDecisionNotes] = useState(finding.decisionNotes || '');
  const [decisionReason, setDecisionReason] = useState(finding.decisionReason || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleDecision = (status: FindingStatus) => {
    setCurrentStatus(status);
  };

  const handleSave = () => {
    finding.status = currentStatus;
    finding.decisionNotes = decisionNotes;
    finding.decisionReason = decisionReason;
    finding.decidedBy = 'examiner_07';
    finding.decidedAt = new Date().toISOString();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-[#0e1626] border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-blue-400">{finding.id}</span>
            <PriorityBadge priority={finding.priority} />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {finding.signalType.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              STATUS: {currentStatus}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-100 mt-1.5">{finding.title}</h2>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
            <span>Entity: <strong className="text-slate-300">{finding.cseName}</strong> ({finding.cseId})</span>
            <span>Control: <strong className="text-slate-300">{finding.controlId}</strong></span>
          </div>
        </div>

        {/* Back Link */}
        <Link
          to="/assessment/findings"
          className="text-xs text-blue-400 hover:text-blue-300 font-medium self-start md:self-center"
        >
          ← Back to Findings Queue
        </Link>
      </div>

      {/* Main 3-Column Grid: Left (Why Flagged), Center (Expected vs Observed), Right (Decision Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Why Flagged & Signals (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-lg bg-[#0e1626] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Why Was This Flagged?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded border border-slate-800">
              {finding.whyFlagged}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500">Evidence Strength</div>
                <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5">{finding.evidenceStrength}</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500">Completeness</div>
                <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5">{finding.completeness}%</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500">Uncertainty</div>
                <div className="text-xs font-bold font-mono text-blue-400 mt-0.5">{finding.uncertainty}</div>
              </div>
            </div>
          </div>

          {/* Supporting Signals List */}
          <div className="p-4 rounded-lg bg-[#0e1626] border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Supporting Independent Signals ({finding.supportingSignals.length})
            </h4>
            <div className="space-y-2">
              {finding.supportingSignals.map((sig, i) => (
                <div key={i} className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>{sig.label}</span>
                    <span className="text-[9px] font-mono text-blue-400">{sig.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{sig.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Expected vs Observed (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-lg bg-[#0e1626] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <GitFork className="w-4 h-4 text-blue-400" />
                Expected vs Observed
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded font-mono">
                DISCREPANCY
              </span>
            </div>

            {/* Expected State */}
            <div className="p-3 rounded bg-blue-950/20 border border-blue-800/40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                Expected Operational State
              </div>
              <p className="text-xs text-slate-200">{finding.expectedState}</p>
            </div>

            {/* Observed State */}
            <div className="p-3 rounded bg-rose-950/20 border border-rose-800/40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                Observed Operational State
              </div>
              <p className="text-xs text-slate-200">{finding.observedState}</p>
            </div>

            {/* Gap Summary */}
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400">
              Result: {finding.gapSummary}
            </div>
          </div>

          {/* Source Evidence Quick Peek */}
          <div className="p-4 rounded-lg bg-[#0e1626] border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Source Evidence Records ({finding.sourceEvidence.length})
            </h4>
            <div className="space-y-1.5">
              {finding.sourceEvidence.map((ev, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80 text-xs">
                  <div>
                    <span className="font-mono text-blue-400 font-bold">{ev.recordId}</span>
                    <span className="text-slate-400 ml-2 text-[11px]">{ev.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{ev.recordType}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Examiner Decision Panel (Human in the Loop) (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-lg bg-[#0e1626] border border-blue-500/30 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                <FileSignature className="w-4 h-4 text-blue-400" />
                <span>Human Examiner Decision</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                System detects & prioritizes. The human examiner makes the final finding determination.
              </p>
            </div>

            {/* Decision Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDecision('VALIDATED')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded border transition-colors ${
                  currentStatus === 'VALIDATED'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/30'
                }`}
              >
                <Check className="w-3.5 h-3.5" /> Validate
              </button>

              <button
                type="button"
                onClick={() => handleDecision('REJECTED')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded border transition-colors ${
                  currentStatus === 'REJECTED'
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-rose-950/20 text-rose-400 border-rose-800/40 hover:bg-rose-900/30'
                }`}
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>

              <button
                type="button"
                onClick={() => handleDecision('QUALIFIED')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded border transition-colors ${
                  currentStatus === 'QUALIFIED'
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-amber-950/20 text-amber-400 border-amber-800/40 hover:bg-amber-900/30'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" /> Qualify
              </button>

              <button
                type="button"
                onClick={() => handleDecision('OVERRIDDEN')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded border transition-colors ${
                  currentStatus === 'OVERRIDDEN'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-purple-950/20 text-purple-400 border-purple-800/40 hover:bg-purple-900/30'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" /> Override
              </button>
            </div>

            <button
              type="button"
              onClick={() => alert('Evidence request workflow logged for CSE submission')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <FileQuestion className="w-3.5 h-3.5 text-blue-400" />
              Request Additional Evidence
            </button>

            {/* Examiner Notes & Reason Inputs */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Examiner Rationale / Reason
                </label>
                <input
                  type="text"
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="e.g. Confirmed unescalated Critical alert violates Control CTRL-07"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Supervisory Notes & Corrective Instructions
                </label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Enter detailed assessment notes for CSE remediation..."
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors shadow-sm"
              >
                Commit Examiner Decision
              </button>

              {savedSuccess && (
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 text-[11px] text-center font-medium animate-fade-in">
                  Decision successfully committed to audit trail
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Timeline Row */}
      <div className="p-5 rounded-lg bg-[#0e1626] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Operational Evidence Timeline (Reconstructed Event Sequence)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Timezone: UTC+05:30 (IST)</span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {finding.timeline.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              <span
                className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 ${
                  step.isGap
                    ? 'bg-rose-500 border-rose-300 animate-ping'
                    : 'bg-slate-900 border-blue-500'
                }`}
              />
              <div className="w-16 font-mono text-xs font-bold text-slate-400 pt-0.5">{step.time}</div>
              <div className={`p-2.5 rounded border text-xs flex-1 ${
                step.isGap 
                  ? 'bg-rose-950/30 border-rose-500/50 text-rose-300' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-200'
              }`}>
                <div className="font-semibold flex items-center justify-between">
                  <span>{step.event}</span>
                  {step.isGap && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded font-bold">
                      EXECUTION GAP
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-[11px] text-slate-400 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provenance & Cryptographic Traceability Row */}
      <div className="p-4 rounded-lg bg-[#090d17] border border-slate-800/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          Evidence Provenance & Verification Hashes
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">SHA-256 Digest</div>
            <div className="text-slate-300 truncate mt-0.5" title={finding.provenance.sha256}>
              {finding.provenance.sha256.substring(0, 24)}...
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Submission ID</div>
            <div className="text-slate-300 mt-0.5">{finding.provenance.submissionId}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Control / Rule Version</div>
            <div className="text-slate-300 mt-0.5">{finding.provenance.controlVersion} / {finding.provenance.ruleVersion}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Analytics Engine</div>
            <div className="text-slate-300 mt-0.5">{finding.provenance.analyticsEngineVersion}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
