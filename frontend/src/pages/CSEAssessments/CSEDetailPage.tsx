import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { 
  Building2, 
  ArrowLeft, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  ShieldAlert,
  GitFork,
  ExternalLink
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  KpiCard,
  StatusBadge,
  Tabs,
  Button
} from '@/components/common';

export const CSEDetailPage: React.FC = () => {
  const { cseId } = useParams<{ cseId: string }>();
  const navigate = useNavigate();
  const { cses, findings, evidence, remediations, setActiveFindingId } = useSupervisory();

  const entityId = cseId || 'CSE-014';
  const cse = cses.find(c => c.cseId.toLowerCase() === entityId.toLowerCase()) || cses[0];
  const cseFindings = findings.filter(f => f.cseId.toLowerCase() === cse.cseId.toLowerCase());
  const cseEvidence = evidence.filter(e => e.cseId.toLowerCase() === cse.cseId.toLowerCase());
  const cseRemediations = remediations.filter(r => r.cseId.toLowerCase() === cse.cseId.toLowerCase());

  // Progressive disclosure tabs
  const [activeTab, setActiveTab] = useState<string>('summary');
  
  // Analysis sub-tabs
  const [analysisSubTab, setAnalysisSubTab] = useState<string>('execution-gap');

  const mainTabs = [
    { id: 'summary', label: '1. Summary', icon: <span className="material-symbols-outlined text-[15px]">overview</span> },
    { id: 'findings', label: '2. Findings', count: cseFindings.length, icon: <span className="material-symbols-outlined text-[15px]">warning</span> },
    { id: 'evidence', label: '3. Evidence', count: cseEvidence.length, icon: <span className="material-symbols-outlined text-[15px]">inventory_2</span> },
    { id: 'analysis', label: '4. Analysis (7 Engines)', icon: <span className="material-symbols-outlined text-[15px]">analytics</span> },
    { id: 'remediation', label: '5. Remediation', count: cseRemediations.length, icon: <span className="material-symbols-outlined text-[15px]">published_with_changes</span> },
  ];

  const analysisTabs = [
    { id: 'execution-gap', label: 'Execution Gap', icon: <span className="material-symbols-outlined text-[14px]">rule_folder</span> },
    { id: 'negative-space', label: 'Negative Space', icon: <span className="material-symbols-outlined text-[14px]">contrast</span> },
    { id: 'process', label: 'Process Deviations', icon: <span className="material-symbols-outlined text-[14px]">account_tree</span> },
    { id: 'behaviour', label: 'Behavioural', icon: <span className="material-symbols-outlined text-[14px]">psychology</span> },
    { id: 'coverage', label: 'Coverage Void', icon: <span className="material-symbols-outlined text-[14px]">radar</span> },
    { id: 'consistency', label: 'Consistency', icon: <span className="material-symbols-outlined text-[14px]">stacked_line_chart</span> },
    { id: 'historical', label: 'Historical Recurrence', icon: <span className="material-symbols-outlined text-[14px]">timeline</span> },
  ];

  return (
    <PageContainer>
      {/* 1. STANDARD PAGE HEADER */}
      <PageHeader
        title={`${cse.cseId} — ${cse.cseName}`}
        description={`Assessment Period: ${cse.period} · Cycle: Q3 2026 Active Assessment · ${cse.sector} Sector`}
        badge={
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#181c22] text-[#c2c6d6] border border-[#262a31]">
              {cse.sector}
            </span>
            <StatusBadge status={cse.supervisoryPriority} />
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
              cse.status === 'Review Required'
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {cse.status}
            </span>
          </div>
        }
        actions={
          <Link
            to="/assessments"
            className="p-1.5 rounded-md bg-[#181c22] hover:bg-[#262a31] text-[#8c90a0] hover:text-[#dfe2eb] transition-colors border border-[#262a31] inline-flex items-center gap-1 text-[12px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Assessments Portfolio</span>
          </Link>
        }
      />

      {/* 2. STANDARDIZED 5-KPI ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 min-w-0">
        <KpiCard
          title="Evidence Readiness"
          value={`${cse.evidenceReadiness}%`}
          subtitle={`${cse.readinessCategory} Target`}
        />
        <KpiCard
          title="Capability Discrepancy"
          value={`${cse.capabilityDiscrepancyCount} Controls`}
          subtitle={`Claimed ${cse.claimedCapability} vs Observed ${cse.observedCapability}`}
          alert={cse.capabilityDiscrepancyCount > 0}
        />
        <KpiCard
          title="High Priority Signals"
          value={cseFindings.filter(f => f.priority === 'CRITICAL' || f.priority === 'HIGH').length}
          subtitle="Requires Examiner Adjudication"
          alert
        />
        <KpiCard
          title="Open Findings"
          value={cseFindings.length}
          subtitle={`${cse.criticalFindingsCount} Critical Inquiries`}
        />
        <KpiCard
          title="Remediation Mandates"
          value={cseRemediations.length}
          subtitle="Under Verification Stage"
          highlight
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* 3. TABS CONTAINER */}
      <div className="space-y-4 min-w-0">
        <Tabs
          tabs={mainTabs}
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t)}
        />

        {/* TAB 1: SUMMARY */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Capability Discrepancy Card */}
            <Card className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#262a31]/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#afc6ff] text-[18px]">difference</span>
                  <h3 className="text-[14px] md:text-[15px] font-semibold text-[#dfe2eb]">
                    Capability Discrepancy Analysis
                  </h3>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded bg-[#14181f] font-mono text-amber-300 border border-[#262a31]">
                  {cse.capabilityDiscrepancyCount > 0
                    ? "Claimed capability exceeds observed evidence"
                    : "Observed evidence is consistent with claimed capability"}
                </span>
              </div>

              <p className="text-[12px] text-[#8c90a0] leading-snug">
                <strong className="text-[#dfe2eb]">Supervisory Interpretation: </strong>
                {cse.capabilityDiscrepancyCount > 0 ? (
                  <span>
                    The entity self-attested <strong>{cse.claimedCapability}</strong> controls in its regulatory filing. However, supervisory air-gapped forensic log ingestion provides evidentiary support for <strong>{cse.observedCapability}</strong> controls ({cse.capabilityDiscrepancyCount} control discrepancy requiring examiner inquiry). This is an investigative prioritization signal, not an automatic determination of non-compliance.
                  </span>
                ) : (
                  <span>
                    Observed forensic evidence is consistent with the claimed capability baseline across all assessed controls.
                  </span>
                )}
              </p>

              {/* Comparison Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-[#dfe2eb] uppercase tracking-wider font-mono">
                      Claimed Capability
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#1c2026] text-[11px] font-bold text-[#7bdb80] font-mono border border-[#262a31]">
                      {cse.claimedCapability} Controls
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    <div className="p-2 rounded bg-[#181c22] flex items-center justify-between border border-[#262a31]/50">
                      <span className="text-[#c2c6d6]">Mandatory Tier-2 Escalation</span>
                      <span className="text-[#7bdb80] font-mono text-[11px]">Attested &lt;30m</span>
                    </div>
                    <div className="p-2 rounded bg-[#181c22] flex items-center justify-between border border-[#262a31]/50">
                      <span className="text-[#c2c6d6]">Substation SCADA Telemetry Stream</span>
                      <span className="text-[#7bdb80] font-mono text-[11px]">Continuous Log Attested</span>
                    </div>
                    <div className="p-2 rounded bg-[#181c22] flex items-center justify-between border border-[#262a31]/50">
                      <span className="text-[#c2c6d6]">Dual-Authority Incident Closure</span>
                      <span className="text-[#7bdb80] font-mono text-[11px]">Attested Sign-off</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-[#dfe2eb] uppercase tracking-wider font-mono">
                      Observed Telemetry Evidence
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#1c2026] text-[11px] font-bold text-rose-300 font-mono border border-[#262a31]">
                      {cse.observedCapability} Controls
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    <div className="p-2 rounded bg-[#181c22] flex items-center justify-between border border-[#262a31]/50">
                      <span className="text-[#c2c6d6]">Mandatory Tier-2 Escalation</span>
                      <span className="text-rose-300 font-mono text-[11px] font-medium">Execution Gap (GAP-0071)</span>
                    </div>
                    <div className="p-2 rounded bg-[#181c22] flex items-center justify-between border border-[#262a31]/50">
                      <span className="text-[#c2c6d6]">Substation SCADA Telemetry Stream</span>
                      <span className="text-amber-300 font-mono text-[11px] font-medium">Negative Space (NS-0041)</span>
                    </div>
                    <div className="p-2 rounded bg-[#181c22] flex items-center justify-between border border-[#262a31]/50">
                      <span className="text-[#c2c6d6]">Dual-Authority Incident Closure</span>
                      <span className="text-amber-300 font-mono text-[11px] font-medium">Process Dev (PD-0031)</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Key Supervisory Signals */}
            <Card className="space-y-3">
              <h3 className="text-[13px] md:text-[14px] font-semibold text-[#dfe2eb] uppercase tracking-wider font-mono">
                Key Supervisory Signals ({cse.signalsSummary.length})
              </h3>
              <div className="space-y-2">
                {cse.signalsSummary.map((sig, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#14181f] border border-[#262a31] flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#afc6ff] shrink-0" />
                      <span className="font-medium text-[#dfe2eb] truncate">{sig}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className="text-[#afc6ff] hover:underline font-mono text-[11px] shrink-0 ml-2"
                    >
                      View Analysis →
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: FINDINGS */}
        {activeTab === 'findings' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[12px] text-[#8c90a0]">
              <span>Supervisory Findings associated with {cse.cseId} ({cseFindings.length} Total):</span>
              <Link to="/review" className="text-[#afc6ff] hover:underline font-mono text-[11px]">
                Complete Review Queue →
              </Link>
            </div>

            {cseFindings.map((finding) => (
              <div
                key={finding.id}
                className="p-3.5 rounded-lg bg-[#181c22] border border-[#262a31] hover:border-[#3b414d] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#afc6ff] px-2 py-0.5 rounded bg-[#1c2026] border border-[#262a31]">
                      {finding.id}
                    </span>
                    <StatusBadge status={finding.priority} />
                    <span className="text-[11px] font-mono text-[#ffb693]">
                      {finding.signalType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-[#8c90a0]">
                      Control: <strong className="text-[#dfe2eb]">{finding.controlId}</strong>
                    </span>
                    <span className="text-[10px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2 py-0.5 rounded border border-[#7bdb80]/20">
                      Strength: {finding.evidenceStrength} ({finding.completeness}%)
                    </span>
                  </div>
                  <div className="text-[13px] md:text-[14px] font-semibold text-[#dfe2eb] truncate">
                    {finding.title}
                  </div>
                  <p className="text-[12px] text-[#8c90a0] line-clamp-2 leading-snug">{finding.whyFlagged}</p>
                </div>

                <div className="shrink-0 self-start md:self-center">
                  <Button
                    size="sm"
                    variant="primary"
                    iconRight={<ArrowRight className="w-3 h-3" />}
                    onClick={() => {
                      setActiveFindingId(finding.id);
                      navigate(`/review/${finding.id}`);
                    }}
                  >
                    Examiner Workspace
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[12px] text-[#8c90a0]">
              <span>Relevant Ingested Telemetry for {cse.cseId} ({cseEvidence.length} Records):</span>
              <Link to="/evidence" className="text-[#afc6ff] hover:underline font-mono text-[11px]">
                Evidence Explorer →
              </Link>
            </div>

            <div className="rounded-lg bg-[#181c22] border border-[#262a31] overflow-x-auto min-w-0">
              <table className="w-full text-left text-[12px] text-[#dfe2eb]">
                <thead className="bg-[#1c2026] text-[#8c90a0] font-mono uppercase text-[11px] border-b border-[#262a31]">
                  <tr>
                    <th className="py-2.5 px-3">Evidence ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">SHA-256 Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262a31]/60">
                  {cseEvidence.map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#14181f]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#afc6ff]">{ev.id}</td>
                      <td className="py-2.5 px-3 text-[#c2c6d6] font-mono text-[11px]">{ev.type}</td>
                      <td className="py-2.5 px-3 text-[#dfe2eb] font-medium">{ev.title}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={ev.status} /></td>
                      <td className="py-2.5 px-3 text-[#8c90a0] font-mono text-[11px]">{ev.timestampTime || ev.timestamp}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-[#8c90a0] truncate max-w-[120px]">{ev.hash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ANALYSIS (Contextual Analytical Engines) */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <Tabs
              tabs={analysisTabs}
              activeTab={analysisSubTab}
              onChange={(t) => setAnalysisSubTab(t)}
            />

            <Card className="space-y-4">
              {analysisSubTab === 'execution-gap' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#262a31]/60">
                    <h3 className="text-[14px] font-semibold text-[#dfe2eb] font-mono uppercase">
                      Execution Gap Engine: GAP-0071
                    </h3>
                    <StatusBadge status="CRITICAL" />
                  </div>
                  <p className="text-[12px] text-[#8c90a0]">
                    <strong>Question:</strong> "What should have happened but did not?"
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
                    <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31]">
                      <div className="font-mono text-[#7bdb80] font-semibold mb-1 uppercase text-[11px]">
                        Expected Process Step
                      </div>
                      <p className="text-[#dfe2eb]">Mandatory Tier-2 regulatory transmission within 30 minutes of Critical OT telemetry anomaly.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31]">
                      <div className="font-mono text-rose-300 font-semibold mb-1 uppercase text-[11px]">
                        Observed Action
                      </div>
                      <p className="text-[#dfe2eb]">Zero transmission record generated. Case closed directly at 10:22 without sign-off token.</p>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Link
                      to="/review/FND-0142"
                      className="px-3 py-1.5 bg-[#1f6feb] text-white rounded-md text-[12px] font-semibold flex items-center gap-1 hover:bg-[#388bfd]"
                    >
                      <span>Examiner Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {analysisSubTab === 'negative-space' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#262a31]/60">
                    <h3 className="text-[14px] font-semibold text-[#dfe2eb] font-mono uppercase">
                      Negative Space Engine: NS-0041
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono font-medium border border-amber-500/30">
                      CANDIDATE VOID
                    </span>
                  </div>
                  <p className="text-[12px] text-[#8c90a0]">
                    <strong>Question:</strong> "What evidence should exist but does not?"
                  </p>
                  <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31] text-[12px] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#8c90a0]">Expected Evidence:</span>
                      <span className="text-[#dfe2eb]">Escalation record ESC-221</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8c90a0]">Submitted Evidence:</span>
                      <span className="text-rose-300">None (0 of 1 ingested)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8c90a0]">Evidence State:</span>
                      <StatusBadge status="NOT_SUBMITTED" />
                    </div>
                  </div>
                </div>
              )}

              {analysisSubTab !== 'execution-gap' && analysisSubTab !== 'negative-space' && (
                <div className="p-4 text-center text-[12px] text-[#8c90a0]">
                  Analytical telemetry computed for {cse.cseId}. View complete cross-portfolio trends in the{' '}
                  <Link to={`/analysis?tab=${analysisSubTab}`} className="text-[#afc6ff] hover:underline font-semibold">
                    Analysis Hub
                  </Link>.
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 5: REMEDIATION */}
        {activeTab === 'remediation' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[12px] text-[#8c90a0]">
              <span>Remediation Lifecycle for {cse.cseId} ({cseRemediations.length} Active Mandates):</span>
              <Link to="/remediation" className="text-[#afc6ff] hover:underline font-mono text-[11px]">
                Remediation Hub →
              </Link>
            </div>

            {cseRemediations.map((rem) => (
              <Card key={rem.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#7bdb80]">{rem.id}</span>
                    <span className="text-[13px] font-semibold text-[#dfe2eb]">{rem.mandateTitle}</span>
                  </div>
                  <StatusBadge status={rem.status} />
                </div>

                {/* Lifecycle Progress Bar */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono pt-1">
                  <div className="p-1.5 rounded bg-[#1c2026] text-[#7bdb80] border border-[#7bdb80]/30 font-medium">
                    1. Finding
                  </div>
                  <div className="p-1.5 rounded bg-[#1c2026] text-[#7bdb80] border border-[#7bdb80]/30 font-medium">
                    2. Mandate
                  </div>
                  <div className="p-1.5 rounded bg-[#14181f] text-amber-300 border border-amber-500/30 font-medium">
                    3. Evidence ({rem.evidenceProgress})
                  </div>
                  <div className="p-1.5 rounded bg-[#10141a] text-[#8c90a0] border border-[#262a31]">
                    4. Verification
                  </div>
                  <div className="p-1.5 rounded bg-[#10141a] text-[#8c90a0] border border-[#262a31]">
                    5. Closure
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
