import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { FindingStatus } from '@/types';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Contrast, 
  Clock, 
  Key, 
  Check, 
  X, 
  Send, 
  Gavel, 
  Info,
  ExternalLink,
  GitFork
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatusBadge,
  Tabs,
  Modal,
  Button
} from '@/components/common';

export const FindingDetailPage: React.FC = () => {
  const { findingId } = useParams<{ findingId: string }>();
  const { findings, evidence, remediations, verifications, updateFindingDecision, requestEvidenceDemand } = useSupervisory();

  const id = findingId || 'FND-0142';
  const finding = findings.find(f => f.id.toLowerCase() === id.toLowerCase()) || findings[0];
  const relatedRemediation = remediations.find(r => r.findingId.toLowerCase() === finding.id.toLowerCase());
  const relatedVerification = verifications.find(v => v.findingId.toLowerCase() === finding.id.toLowerCase());

  // Local state for decision form and bottom tabs
  const [decisionNotes, setDecisionNotes] = useState(finding.decisionNotes || '');
  const [selectedBottomTab, setSelectedBottomTab] = useState<string>('evidence');
  const [inspectedTimelineEvent, setInspectedTimelineEvent] = useState<any>(
    finding.timeline.find(t => t.isGap) || finding.timeline[0]
  );
  const [modalAction, setModalAction] = useState<FindingStatus | 'REQUEST_EVD' | null>(null);
  const [modalReason, setModalReason] = useState('NCIIPC-SEC-70B-CRIT-07');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleExecuteDecision = () => {
    if (!modalAction) return;

    if (modalAction === 'REQUEST_EVD') {
      requestEvidenceDemand(finding.id, decisionNotes || 'Demanded Tier-2 escalation records per Section 70B');
      showNotification(`Evidence Demand Dispatched for ${finding.id}. State set to UNDER REVIEW.`);
    } else {
      updateFindingDecision(finding.id, {
        status: modalAction,
        notes: decisionNotes,
        reason: modalReason
      });
      showNotification(`Human Examiner Adjudication saved: ${modalAction}`);
    }
    setModalAction(null);
  };

  const bottomTabs = [
    { id: 'evidence', label: 'Supporting Evidence', count: finding.sourceEvidence.length, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: 'Forensics Timeline', count: finding.timeline.length, icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'provenance', label: 'Cryptographic Provenance', icon: <Key className="w-3.5 h-3.5" /> },
  ];

  return (
    <PageContainer>
      {/* 1. TOP BREADCRUMB & CONTEXT STRIP */}
      <PageHeader
        title={`Workspace: ${finding.id}`}
        description={`${finding.cseName} (${finding.cseId}) — ${finding.title}`}
        badge={<StatusBadge status={finding.priority} />}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/review"
              className="p-1.5 rounded-md bg-[#181c22] hover:bg-[#262a31] text-[#8c90a0] hover:text-[#dfe2eb] transition-colors border border-[#262a31] inline-flex items-center gap-1 text-[12px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Review Queue</span>
            </Link>
            <Link
              to={`/assessments/${finding.cseId}`}
              className="px-2.5 py-1.5 bg-[#181c22] hover:bg-[#262a31] text-[#afc6ff] text-[12px] font-mono rounded-md border border-[#262a31] flex items-center gap-1"
            >
              <span>{finding.cseId} Dossier</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="px-2.5 py-1 rounded bg-[#181c22] border border-[#262a31] text-[10px] font-mono text-[#7bdb80]">
              FIPS-140-2 CERTIFIED
            </span>
          </div>
        }
      />

      {/* 2. THREE-PANEL EXAMINER WORKSPACE (Section 18: Left 25%, Center 50%, Right 25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-w-0">
        
        {/* LEFT PANEL: Finding Summary & Supporting Signals (3 Cols) */}
        <div className="lg:col-span-3 space-y-4 min-w-0">
          <Card dense className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#262a31]/60">
              <span className="font-mono text-[12px] font-bold text-[#afc6ff]">{finding.id}</span>
              <StatusBadge status={finding.priority} />
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-[#8c90a0] font-mono uppercase">Critical Sector Entity</div>
              <div className="font-semibold text-[13px] text-[#dfe2eb] truncate">
                {finding.cseName} ({finding.cseId})
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-[#8c90a0] font-mono uppercase">Mandatory Control</div>
              <div className="font-mono text-[12px] text-[#dfe2eb] font-semibold">{finding.controlId}</div>
              <div className="text-[11px] text-[#8c90a0] leading-tight">{finding.controlName}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-[#8c90a0] font-mono uppercase">Detection Engine</div>
              <span className="inline-block px-2 py-0.5 rounded bg-[#1c2026] text-[#ffb693] font-mono text-[11px] font-medium border border-[#262a31]">
                {finding.signalType.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-[#8c90a0] font-mono uppercase">Current Adjudication</div>
              <div><StatusBadge status={finding.status} /></div>
            </div>

            <div className="pt-2 border-t border-[#262a31]/60 space-y-1">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#dfe2eb]">
                <Info className="w-3.5 h-3.5 text-[#afc6ff]" />
                <span>Why Flagged?</span>
              </div>
              <p className="text-[12px] text-[#8c90a0] leading-snug">
                "{finding.whyFlagged}"
              </p>
            </div>
          </Card>

          {/* Supporting Signals List */}
          <Card dense className="space-y-2">
            <h3 className="text-[12px] font-semibold text-[#dfe2eb] uppercase tracking-wider font-mono">
              Supporting Signals ({finding.supportingSignals.length})
            </h3>
            <div className="space-y-2">
              {finding.supportingSignals.map((sig, idx) => (
                <div key={idx} className="p-2 rounded bg-[#14181f] border border-[#262a31] text-[12px] space-y-0.5">
                  <div className="font-mono text-[11px] font-semibold text-[#afc6ff]">{sig.label}</div>
                  <div className="text-[11px] text-[#8c90a0] leading-snug">{sig.description}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Remediation & Verification State (Items 13 & 14) */}
          <Card dense className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#262a31]/60">
              <h3 className="text-[12px] font-semibold text-[#dfe2eb] uppercase tracking-wider font-mono">
                Remediation Lifecycle
              </h3>
              <span className="text-[10px] font-mono text-[#8c90a0]">GATE ENFORCED</span>
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="p-2 rounded bg-[#14181f] border border-[#262a31] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8c90a0] font-mono">Mandate Status:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {relatedRemediation ? relatedRemediation.status : 'AWAITING ADJUDICATION'}
                  </span>
                </div>
                {relatedRemediation && (
                  <div className="text-[11px] text-[#afc6ff] font-mono flex items-center justify-between pt-0.5">
                    <span>{relatedRemediation.id}</span>
                    <Link to="/remediation" className="hover:underline text-[10px]">Inspect Mandate →</Link>
                  </div>
                )}
              </div>

              <div className="p-2 rounded bg-[#14181f] border border-[#262a31] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8c90a0] font-mono">Verification Gate:</span>
                  <span className="font-mono font-bold text-[#10b981]">
                    {relatedVerification ? relatedVerification.verificationVerdict.replace(/_/g, ' ') : 'NOT_INITIATED'}
                  </span>
                </div>
                {relatedVerification && (
                  <div className="text-[11px] text-[#10b981] font-mono flex items-center justify-between pt-0.5">
                    <span>{relatedVerification.id}</span>
                    <Link to="/verification" className="hover:underline text-[10px]">Verification Gate →</Link>
                  </div>
                )}
              </div>
              <div className="text-[10px] text-[#64748b] font-mono">
                Principle: SUBMITTED ≠ VERIFIED (Formal supervisory seal mandatory prior to closure)
              </div>
            </div>
          </Card>
        </div>

        {/* CENTER PANEL: EXPECTED VS OBSERVED (6 Cols) */}
        <div className="lg:col-span-6 space-y-4 min-w-0">
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#262a31]/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#afc6ff] text-[18px]">compare_arrows</span>
                <h3 className="text-[14px] md:text-[15px] font-semibold text-[#dfe2eb]">
                  Expected vs Observed Sequence
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8c90a0] bg-[#14181f] px-2 py-0.5 rounded border border-[#262a31]">
                CASE-1042 FORENSIC TRACE
              </span>
            </div>

            {/* EXPECTED PROCESS */}
            <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#7bdb80] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7bdb80]" />
                  Expected Process (CTRL-07 Mandate)
                </span>
                <span className="text-[10px] text-[#8c90a0] font-mono">Standard Baseline</span>
              </div>
              
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-mono text-[12px]">
                {['Alert', 'Case', 'Investigation', 'Escalation', 'Response', 'Closure'].map((step, idx) => (
                  <React.Fragment key={step}>
                    <div className={`px-2 py-1 rounded text-center shrink-0 ${
                      step === 'Escalation' 
                        ? 'bg-[#1f6feb]/20 text-[#afc6ff] border border-[#1f6feb]/50 font-bold' 
                        : 'bg-[#1c2026] text-[#c2c6d6]'
                    }`}>
                      <div className="text-[9px] text-[#8c90a0]">Step {idx + 1}</div>
                      <div>{step}</div>
                    </div>
                    {idx < 5 && <span className="text-[#8c90a0] text-xs">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* OBSERVED PROCESS (MISSING STEP HIGHLIGHTED) */}
            <div className="p-3 rounded-lg bg-[#14181f] border border-rose-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  Observed Process (NorthGrid Telemetry)
                </span>
                <span className="text-[10px] font-mono text-rose-400 font-bold">MISSING STEP DETECTED</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-mono text-[12px]">
                {['Alert', 'Case', 'Investigation', 'Response', 'Closure'].map((step, idx) => (
                  <React.Fragment key={step}>
                    {idx === 3 && (
                      <>
                        <div className="px-2 py-1 rounded text-center shrink-0 bg-rose-950/40 text-rose-300 border-2 border-dashed border-rose-400/80">
                          <div className="text-[9px] uppercase font-bold text-rose-300">OMITTED</div>
                          <div className="font-bold line-through">Escalation</div>
                        </div>
                        <span className="text-rose-400 text-xs font-bold">✗</span>
                      </>
                    )}
                    <div className="px-2 py-1 rounded text-center shrink-0 bg-[#1c2026] text-[#c2c6d6]">
                      <div className="text-[9px] text-[#8c90a0]">Step {idx >= 3 ? idx + 2 : idx + 1}</div>
                      <div>{step}</div>
                    </div>
                    {idx < 4 && <span className="text-[#8c90a0] text-xs">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* EXECUTION GAP DETAIL */}
            <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31] space-y-1.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-rose-300 uppercase flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-rose-400" />
                  Execution Gap
                </span>
                <span className="text-[10px] font-mono text-[#8c90a0]">GAP-0071</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-[#181c22] border border-[#262a31]/50">
                  <span className="text-[#8c90a0]">Expected:</span>
                  <div className="text-[#7bdb80] font-semibold mt-0.5">Escalation within 30m</div>
                </div>
                <div className="p-2 rounded bg-[#181c22] border border-[#262a31]/50">
                  <span className="text-[#8c90a0]">Observed:</span>
                  <div className="text-rose-300 font-semibold mt-0.5">No escalation record</div>
                </div>
              </div>
            </div>

            {/* NEGATIVE SPACE DETAIL */}
            <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31] space-y-1.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-amber-400" />
                  Negative Space
                </span>
                <span className="text-[10px] font-mono text-[#8c90a0]">NS-0041</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-[#181c22] border border-[#262a31]/50">
                  <span className="text-[#8c90a0]">Expected:</span>
                  <div className="text-[#dfe2eb] font-semibold mt-0.5">Record ESC-221</div>
                </div>
                <div className="p-2 rounded bg-[#181c22] border border-[#262a31]/50">
                  <span className="text-[#8c90a0]">Submitted:</span>
                  <div className="text-[#ffb693] font-semibold mt-0.5">None (0)</div>
                </div>
                <div className="p-2 rounded bg-[#181c22] border border-[#262a31]/50">
                  <span className="text-[#8c90a0]">Evidence State:</span>
                  <div className="text-rose-300 font-bold mt-0.5">NOT_SUBMITTED</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT PANEL: EXAMINER DECISION (Human Decision) (3 Cols) */}
        <div className="lg:col-span-3 space-y-4 min-w-0">
          <Card className="border border-[#1f6feb]/50 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-[#262a31]/60">
              <div className="flex items-center gap-1.5">
                <Gavel className="w-4 h-4 text-[#afc6ff]" />
                <h3 className="font-semibold text-[14px] text-[#dfe2eb]">Human Adjudication</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f6feb]/20 text-[#afc6ff] font-mono font-bold">
                DECISION
              </span>
            </div>

            <p className="text-[12px] text-[#8c90a0] leading-snug">
              System signals are exploratory. Statutory regulatory determination rests strictly with the human examiner:
            </p>

            {/* Current Decision State */}
            <div className="p-2.5 rounded-lg bg-[#14181f] border border-[#262a31] text-[12px] font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-[#8c90a0]">Decision Status:</span>
                <span className="font-bold text-[#afc6ff]">{finding.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c90a0]">Decided By:</span>
                <span className="text-[#dfe2eb] truncate max-w-[130px]">{finding.decidedBy || 'NC-8802'}</span>
              </div>
              {finding.decidedAt && (
                <div className="flex justify-between text-[10px] text-[#8c90a0]">
                  <span>Decided At:</span>
                  <span>{new Date(finding.decidedAt).toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            {/* Decision Buttons with Normalized Control Heights */}
            <div className="space-y-2">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-between bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                iconRight={<Check className="w-3.5 h-3.5" />}
                onClick={() => setModalAction('VALIDATED')}
              >
                Validate Finding
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full justify-between border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-semibold"
                iconRight={<AlertTriangle className="w-3.5 h-3.5" />}
                onClick={() => setModalAction('QUALIFIED' as any)}
              >
                Qualify Finding
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full justify-between border-rose-500/40 text-rose-300 hover:bg-rose-500/10 font-semibold"
                iconRight={<X className="w-3.5 h-3.5" />}
                onClick={() => setModalAction('REJECTED' as any)}
              >
                Reject (False Positive)
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full justify-between border-[#3b414d] text-[#c2c6d6] hover:bg-[#262a31]"
                iconRight={<span className="material-symbols-outlined text-[15px]">published_with_changes</span>}
                onClick={() => setModalAction('OVERRIDDEN' as any)}
              >
                Override Model Weight
              </Button>

              <Button
                variant="secondary"
                size="md"
                className="w-full justify-between bg-[#1f6feb] text-white hover:bg-[#388bfd]"
                iconRight={<Send className="w-3.5 h-3.5" />}
                onClick={() => setModalAction('REQUEST_EVD')}
              >
                Request Evidence Demand
              </Button>
            </div>

            {/* Decision Notes */}
            <div className="space-y-1.5 pt-2 border-t border-[#262a31]/60">
              <label className="text-[11px] font-mono uppercase font-semibold text-[#8c90a0]">
                Examiner Ledger Notes:
              </label>
              <textarea
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Enter statutory justification, instructions to entity, or mitigating notes..."
                rows={3}
                className="w-full p-2.5 rounded-md bg-[#14181f] border border-[#262a31] text-[12px] text-[#dfe2eb] placeholder:text-[#8c90a0] focus:outline-none focus:border-[#afc6ff] resize-none"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* 3. BOTTOM PANEL: EVIDENCE + TIMELINE + PROVENANCE (Tabs) */}
      <Card className="space-y-3">
        <Tabs
          tabs={bottomTabs}
          activeTab={selectedBottomTab}
          onChange={(tabId) => setSelectedBottomTab(tabId)}
        />

        {/* Tab 1: Supporting Evidence */}
        {selectedBottomTab === 'evidence' && (
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left text-[12px] text-[#dfe2eb]">
              <thead className="bg-[#1c2026] text-[#8c90a0] font-mono text-[11px] uppercase border-b border-[#262a31]">
                <tr>
                  <th className="py-2.5 px-3">Record ID</th>
                  <th className="py-2.5 px-3">Record Type</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a31]/60">
                {finding.sourceEvidence.map((ev) => (
                  <tr key={ev.recordId} className="hover:bg-[#14181f]">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#afc6ff]">{ev.recordId}</td>
                    <td className="py-2.5 px-3 font-mono text-[#c2c6d6] text-[11px]">{ev.recordType}</td>
                    <td className="py-2.5 px-3 font-medium text-[#dfe2eb]">{ev.title}</td>
                    <td className="py-2.5 px-3 font-mono text-[#8c90a0] text-[11px]">{ev.timestamp}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Link to="/evidence" className="text-[#afc6ff] hover:underline font-mono text-[11px]">
                        Inspect in Vault
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Timeline */}
        {selectedBottomTab === 'timeline' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {finding.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setInspectedTimelineEvent(item)}
                    className={`p-2.5 rounded-md border text-[12px] cursor-pointer transition-colors flex items-center justify-between ${
                      item.isGap
                        ? 'bg-rose-950/20 border-rose-500/50 text-rose-300'
                        : inspectedTimelineEvent?.time === item.time
                        ? 'bg-[#14181f] border-[#1f6feb] text-[#dfe2eb]'
                        : 'bg-[#14181f] border-[#262a31] text-[#c2c6d6] hover:border-[#3b414d]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#afc6ff]">{item.time}</span>
                      <span className="font-medium">{item.event}</span>
                    </div>
                    {item.isGap && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold">
                        GAP
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {inspectedTimelineEvent && (
                <div className="p-3.5 rounded-lg bg-[#14181f] border border-[#262a31] space-y-2 text-[12px]">
                  <div className="font-mono text-[12px] font-bold text-[#afc6ff] flex items-center justify-between">
                    <span>Event Details: {inspectedTimelineEvent.event}</span>
                    <span className="text-[#8c90a0]">{inspectedTimelineEvent.time}</span>
                  </div>
                  <p className="text-[#dfe2eb] leading-relaxed">
                    {inspectedTimelineEvent.description || 'Observed event recorded in SOAR incident audit trail.'}
                  </p>
                  {inspectedTimelineEvent.isGap && (
                    <div className="p-2 rounded bg-rose-950/30 border border-rose-500/40 text-rose-300 text-[11px] font-mono">
                      Statutory 30-minute Tier-2 regulatory escalation was NOT transmitted.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Provenance */}
        {selectedBottomTab === 'provenance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[12px]">
            <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31] space-y-1">
              <span className="text-[10px] text-[#8c90a0] uppercase">Cryptographic Digest (SHA-256)</span>
              <div className="text-[11px] text-[#7bdb80] break-all select-all font-bold">
                {finding.provenance.sha256}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31] space-y-1">
              <span className="text-[10px] text-[#8c90a0] uppercase">Submission &amp; Source System</span>
              <div className="text-[12px] text-[#dfe2eb]">{finding.provenance.sourceSystem}</div>
              <div className="text-[11px] text-[#afc6ff]">ID: {finding.provenance.submissionId}</div>
            </div>

            <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31] space-y-1">
              <span className="text-[10px] text-[#8c90a0] uppercase">Control &amp; Analytics Versions</span>
              <div className="text-[12px] text-[#dfe2eb]">Control: {finding.provenance.controlVersion}</div>
              <div className="text-[12px] text-[#dfe2eb]">Rule: {finding.provenance.ruleVersion}</div>
              <div className="text-[11px] text-[#8c90a0]">Engine: {finding.provenance.analyticsEngineVersion}</div>
            </div>
          </div>
        )}
      </Card>

      {/* STANDARDIZED MODAL: CONFIRM ADJUDICATION */}
      <Modal
        isOpen={!!modalAction}
        onClose={() => setModalAction(null)}
        title={`Confirm Decision: ${modalAction}`}
        description="This action commits a formal human supervisory adjudication record to the immutable audit ledger."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalAction(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExecuteDecision}>
              Commit Adjudication
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#8c90a0] uppercase">
              Statutory Legal Reference:
            </label>
            <input
              type="text"
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-[#14181f] border border-[#262a31] font-mono text-[12px] text-[#dfe2eb] focus:outline-none focus:border-[#afc6ff]"
            />
          </div>

          <div className="p-2.5 rounded-md bg-[#14181f] border border-[#262a31] text-[11px] text-[#8c90a0]">
            Signatory: <strong className="text-[#dfe2eb]">NC-8802 (Lead Examiner, NCIIPC)</strong>
          </div>
        </div>
      </Modal>

      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#181c22] border border-[#7bdb80] text-[#dfe2eb] px-4 py-2.5 rounded-lg shadow-xl text-[12px] font-mono flex items-center gap-2 z-50">
          <CheckCircle2 className="w-4 h-4 text-[#7bdb80]" />
          <span>{toastMsg}</span>
        </div>
      )}
    </PageContainer>
  );
};
