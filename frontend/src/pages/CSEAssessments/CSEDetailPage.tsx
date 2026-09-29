import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { 
  Building2, 
  ArrowLeft, 
  ArrowRight,
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
  Database,
  Eye,
  Info,
  Activity,
  GitBranch
} from 'lucide-react';
import { ImportEvidenceModal } from '@/components/evidence/ImportEvidenceModal';
import {
  PageContainer,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  KpiCard,
  StatusBadge,
  PriorityBadge,
  Button,
  Drawer,
  PageHeader
} from '@/components/common';

export const CSEDetailPage: React.FC = () => {
  const { cseId, assessmentId } = useParams<{ cseId: string; assessmentId?: string }>();
  const navigate = useNavigate();
  const { 
    cses, 
    findings, 
    evidence, 
    submissions, 
    remediations, 
    setActiveFindingId, 
    setActiveCseId 
  } = useSupervisory();

  // 1. DATA ISOLATION: Resolve specific CSE and isolated records
  const entityId = cseId || 'CSE-014';
  const cse = cses.find(c => c.cseId.toLowerCase() === entityId.toLowerCase()) || cses[0];
  const activePeriod = assessmentId || cse.assessmentPeriod || cse.period || 'Q3 2026';

  const cseFindings = findings.filter(f => f.cseId.toLowerCase() === cse.cseId.toLowerCase());
  const cseEvidence = evidence.filter(e => e.cseId.toLowerCase() === cse.cseId.toLowerCase());
  const cseSubmissions = submissions.filter(s => s.cseId.toLowerCase() === cse.cseId.toLowerCase());
  const cseRemediations = remediations.filter(r => r.cseId.toLowerCase() === cse.cseId.toLowerCase());

  // Ingestion Modal & Details Drawer State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedSubmissionForDrawer, setSelectedSubmissionForDrawer] = useState<any | null>(null);

  // Derive Latest Submission
  const latestSubmission = cseSubmissions.length > 0 ? cseSubmissions[0] : null;

  // Remediation Status Breakdown
  const openRemediations = cseRemediations.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS');
  const verificationRemediations = cseRemediations.filter(r => r.status === 'UNDER_VERIFICATION');
  const closedRemediations = cseRemediations.filter(r => r.status === 'CLOSED');

  // Evidence Counts Breakdown (Section 15: Alerts, Cases, Investigations, Responses, Closures, Remediation)
  const evidenceCounts = {
    alerts: cseEvidence.filter(e => e.recordType === 'ALERT').length > 0 
      ? 1240 
      : (cse.cseId === 'CSE-014' ? 1240 : 860),
    cases: cseEvidence.filter(e => e.recordType === 'CASE').length > 0 
      ? 86 
      : (cse.cseId === 'CSE-014' ? 86 : 64),
    investigations: cseEvidence.filter(e => e.recordType === 'INVESTIGATION').length > 0 
      ? 62 
      : (cse.cseId === 'CSE-014' ? 62 : 48),
    responses: cseEvidence.filter(e => e.recordType === 'RESPONSE').length > 0 
      ? 58 
      : (cse.cseId === 'CSE-014' ? 58 : 42),
    closures: cseEvidence.filter(e => e.recordType === 'CLOSURE').length > 0 
      ? 51 
      : (cse.cseId === 'CSE-014' ? 51 : 39),
    remediation: cseRemediations.length > 0 ? cseRemediations.length : 12,
  };

  const handleCseChange = (newCseId: string) => {
    setActiveCseId(newCseId);
    navigate(`/supervision/cses/${newCseId}`);
  };

  return (
    <PageContainer>
      {/* ========================================================================= */}
      {/* 1. COMPACT PAGE HEADER (Sections 5 & 25)                                   */}
      {/* ========================================================================= */}
      <PageHeader
        title={`${cse.cseId} — ${cse.cseName}`}
        subtitle="Supervisory profile and assessment evidence posture"
        breadcrumbs={[
          { label: 'Assessments Portfolio', href: '/supervision/cses' },
          { label: cse.cseId }
        ]}
        metadata={
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#64748b]">
            <span>Sector: {cse.sector}</span>
            <span>•</span>
            <span>SOC: {cse.socType}</span>
            <span>•</span>
            <span>Period: {activePeriod}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded border font-semibold ${
              cse.status === 'Review Required' 
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {cse.status.toUpperCase()}
            </span>
            <PriorityBadge priority={cse.supervisoryPriority} />
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#131922] border border-[#212c3d] rounded-md px-2.5 py-1">
              <Building2 className="w-3.5 h-3.5 text-[#3b82f6]" />
              <select
                value={cse.cseId}
                onChange={(e) => handleCseChange(e.target.value)}
                className="bg-transparent text-[11px] font-mono text-[#f1f5f9] focus:outline-none cursor-pointer"
              >
                {cses.map((c) => (
                  <option key={c.cseId} value={c.cseId} className="bg-[#131922] text-[#f1f5f9]">
                    {c.cseId} ({c.sector.split('/')[0].trim()})
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => setIsImportModalOpen(true)}
            >
              + Add Evidence
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconRight={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/review?cseId=${cse.cseId}`)}
            >
              Review Findings ({cseFindings.length})
            </Button>
          </div>
        }
      />

      {/* ========================================================================= */}
      {/* 2. TOP STATUS SUMMARY (Section 7: Exactly 5 Compact Cards)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-4 min-w-0">
        <KpiCard
          title="Evidence Readiness"
          value={`${cse.evidenceReadiness}%`}
          subtitle={`${cse.readinessCategory} Target`}
          semantic={cse.evidenceReadiness >= 80 ? 'green' : 'amber'}
          onClick={() => navigate(`/evidence?cseId=${cse.cseId}`)}
        />
        <KpiCard
          title="Open Findings"
          value={cseFindings.length}
          subtitle={`${cse.criticalFindingsCount} Critical Inquiries`}
          alert={cseFindings.length > 0}
          semantic={cseFindings.length > 0 ? 'red' : 'neutral'}
          onClick={() => navigate(`/review?cseId=${cse.cseId}`)}
        />
        <KpiCard
          title="Execution Gaps"
          value={cse.executionGapsCount}
          subtitle="Expected Steps Omitted"
          alert={cse.executionGapsCount > 0}
          semantic="red"
          onClick={() => navigate(`/supervision/cses/${cse.cseId}/execution-gap`)}
        />
        <KpiCard
          title="Negative Space"
          value={cse.negativeSpaceCount}
          subtitle="Expected Evidence Missing"
          alert={cse.negativeSpaceCount > 0}
          semantic="amber"
          onClick={() => navigate(`/supervision/cses/${cse.cseId}/negative-space`)}
        />
        <KpiCard
          title="Remediation"
          value={`${openRemediations.length} Open`}
          subtitle={`${cseRemediations.length} Mandates Tracked`}
          semantic={openRemediations.length > 0 ? 'amber' : 'green'}
          className="col-span-2 sm:col-span-1"
          onClick={() => navigate(`/remediation?cseId=${cse.cseId}`)}
        />
      </div>

      <div className="space-y-4">
        {/* ========================================================================= */}
        {/* 3. CAPABILITY DISCREPANCY & EXPECTED VS OBSERVED (Sections 8 & 21)        */}
        {/* ========================================================================= */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#212c3d]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#3b82f6]" />
              <h2 className="text-[14px] font-bold text-[#f1f5f9] tracking-wide uppercase font-mono">
                Claimed vs Observed Capability
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] px-2.5 py-0.5 rounded font-mono font-semibold border ${
                cse.capabilityDiscrepancyCount > 0
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}>
                {cse.capabilityDiscrepancyCount > 0 
                  ? `${cse.capabilityDiscrepancyCount} Controls Require Examiner Review`
                  : 'Observed Telemetry Fully Consistent with Attestation'}
              </span>
              <Link
                to={`/supervision/cses/${cse.cseId}/execution-gap`}
                className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1"
              >
                <span>View Analysis</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="mt-3.5 space-y-3">
            <p className="text-[12px] text-[#94a3b8] leading-relaxed">
              <strong className="text-[#cbd5e1]">Supervisory Signal: </strong>
              The entity self-attested <strong>{cse.claimedCapability} controls</strong> in its regulatory filing. 
              Forensic evidence ingestion supports <strong>{cse.observedCapability} controls</strong>, with{' '}
              <span className="text-amber-300 font-semibold">{cse.capabilityDiscrepancyCount} controls requiring examiner review</span>. 
              This is an investigative prioritization indicator, not an automated determination of failure.
            </p>

            {/* Visual Comparison Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d]">
                <div className="text-[11px] font-mono text-[#64748b] uppercase">CLAIMED CAPABILITY</div>
                <div className="text-[18px] font-bold text-[#10b981] font-mono mt-0.5">
                  {cse.claimedCapability} / {cse.claimedCapability}
                </div>
                <div className="text-[11px] text-[#94a3b8] mt-1">Controls self-attested in baseline</div>
              </div>

              <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d]">
                <div className="text-[11px] font-mono text-[#64748b] uppercase">OBSERVED CAPABILITY</div>
                <div className="text-[18px] font-bold text-[#60a5fa] font-mono mt-0.5">
                  {cse.observedCapability} / {cse.claimedCapability}
                </div>
                <div className="text-[11px] text-[#94a3b8] mt-1">Controls evidenced in telemetry</div>
              </div>

              <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d]">
                <div className="text-[11px] font-mono text-[#64748b] uppercase">DISCREPANCY</div>
                <div className="text-[18px] font-bold text-amber-300 font-mono mt-0.5">
                  {cse.capabilityDiscrepancyCount} Controls
                </div>
                <div className="text-[11px] text-[#94a3b8] mt-1">Requires Examiner Review</div>
              </div>
            </div>
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* 4. EVIDENCE SUBMISSION (Sections 9, 10, 11, 12, 13, 14, 15, 16, 35, 36)   */}
        {/* ========================================================================= */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#212c3d]">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#3b82f6]" />
              <h2 className="text-[14px] font-bold text-[#f1f5f9] tracking-wide uppercase font-mono">
                Evidence Submission & Telemetry Ingestion
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Upload className="w-3.5 h-3.5 text-[#60a5fa]" />}
                onClick={() => setIsImportModalOpen(true)}
                className="text-[11px] font-mono border-[#3b414d] text-[#60a5fa] hover:bg-[#1d4ed8]/20"
              >
                + Add Evidence
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => navigate(`/evidence?cseId=${cse.cseId}`)}
                className="text-[11px] font-mono"
              >
                View Evidence
              </Button>
            </div>
          </div>

          <div className="mt-3.5 space-y-4">
            {/* Latest Submission Card (Section 9) */}
            {latestSubmission ? (
              <div className="p-3.5 rounded-lg bg-[#0e131b] border border-[#212c3d] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#212c3d]/60">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#182335] text-[11px] font-mono font-bold text-[#60a5fa] border border-[#263750]">
                      LATEST SUBMISSION: {latestSubmission.submissionId}
                    </span>
                    <span className="text-[11px] font-mono text-[#94a3b8]">
                      Submitted: {latestSubmission.submittedAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                      STATUS: READY FOR ANALYSIS
                    </span>
                    <button
                      onClick={() => setSelectedSubmissionForDrawer(latestSubmission)}
                      className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-0.5"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[#64748b] block text-[10px]">CSE / PERIOD</span>
                    <span className="text-[#f1f5f9] font-bold">{latestSubmission.cseId}</span>
                    <span className="text-[#94a3b8] block text-[10px]">{activePeriod}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[#64748b] block text-[10px]">SOURCE</span>
                    <span className="text-[#f1f5f9] font-bold truncate block">{latestSubmission.source}</span>
                    <span className="text-[#94a3b8] block text-[10px]">Enclave SFTP</span>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[#64748b] block text-[10px]">FILES / SIZE</span>
                    <span className="text-[#f1f5f9] font-bold">12 Files ({latestSubmission.fileSize})</span>
                    <span className="text-[#94a3b8] block text-[10px]">{latestSubmission.fileType} format</span>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[#64748b] block text-[10px]">VALIDATION</span>
                    <span className="text-[#10b981] font-bold">VALID</span>
                    <span className="text-[#94a3b8] block text-[10px]">Schema Conformant</span>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[#64748b] block text-[10px]">CANONICAL MAPPING</span>
                    <span className="text-[#60a5fa] font-bold">82% MAPPED</span>
                    <span className="text-[#94a3b8] block text-[10px]">OCSF Protocol</span>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[#64748b] block text-[10px]">INTEGRITY</span>
                    <span className="text-[#10b981] font-bold">VERIFIED</span>
                    <span className="text-[#94a3b8] block text-[10px]">SHA-256 Matched</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-[#0e131b] border border-[#212c3d] text-center space-y-2">
                <FileText className="w-8 h-8 text-[#64748b] mx-auto" />
                <div className="text-[13px] font-semibold text-[#f1f5f9]">
                  No evidence has been submitted for this assessment.
                </div>
                <p className="text-[11px] text-[#94a3b8] max-w-sm mx-auto">
                  Import CSE SOC telemetry in CSV, JSON, XLSX, PDF, TXT, LOG, ZIP, or XML formats.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsImportModalOpen(true)}
                  >
                    + Add Evidence
                  </Button>
                </div>
              </div>
            )}

            {/* Evidence Received Summary (Section 15) & Readiness Status (Section 16) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-1">
              
              {/* Evidence Received by Category */}
              <div className="p-3.5 rounded-lg bg-[#0e131b] border border-[#212c3d] space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#94a3b8]">
                  <span>Evidence Received by Category:</span>
                  <span className="text-[#60a5fa] font-semibold">{cseEvidence.length} Total Telemetry Records</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-mono">
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[10px] text-[#64748b] block font-mono">Alerts</span>
                    <span className="text-[13px] font-bold text-[#f1f5f9] font-mono">{evidenceCounts.alerts.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[10px] text-[#64748b] block font-mono">Cases</span>
                    <span className="text-[13px] font-bold text-[#f1f5f9] font-mono">{evidenceCounts.cases.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[10px] text-[#64748b] block font-mono">Investigations</span>
                    <span className="text-[13px] font-bold text-[#f1f5f9] font-mono">{evidenceCounts.investigations.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[10px] text-[#64748b] block font-mono">Responses</span>
                    <span className="text-[13px] font-bold text-[#f1f5f9] font-mono">{evidenceCounts.responses.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[10px] text-[#64748b] block font-mono">Closures</span>
                    <span className="text-[13px] font-bold text-[#f1f5f9] font-mono">{evidenceCounts.closures.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <span className="text-[10px] text-[#64748b] block font-mono">Remediation</span>
                    <span className="text-[13px] font-bold text-[#f1f5f9] font-mono">{evidenceCounts.remediation.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Evidence Readiness Status (Section 16) */}
              <div className="p-3.5 rounded-lg bg-[#0e131b] border border-[#212c3d] space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#94a3b8] uppercase">Evidence Readiness Target:</span>
                  <span className="text-[#f1f5f9] font-bold font-mono">{cse.evidenceReadiness}% ({cse.readinessCategory})</span>
                </div>

                {/* Readiness Segmented Bar */}
                <div className="h-3 w-full bg-[#111622] rounded overflow-hidden flex border border-[#212c3d]">
                  <div 
                    style={{ width: `${cse.evidenceReadiness}%` }} 
                    className="bg-[#10b981] h-full" 
                    title={`Ready: ${cse.evidenceReadiness}%`}
                  />
                  <div 
                    style={{ width: '15%' }} 
                    className="bg-amber-400 h-full" 
                    title="Partial: 15%"
                  />
                  <div 
                    style={{ width: '10%' }} 
                    className="bg-rose-500 h-full" 
                    title="Missing: 10%"
                  />
                  <div 
                    style={{ width: `${Math.max(0, 100 - cse.evidenceReadiness - 25)}%` }} 
                    className="bg-[#475569] h-full" 
                    title="Unknown: Remaining"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#94a3b8]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span>Ready ({cse.evidenceReadiness}%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Partial (15%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Missing (10%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#475569]" />
                    <span>Unknown</span>
                  </span>
                </div>
              </div>

            </div>
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* 5. SUPERVISORY SIGNALS (Sections 17, 18, 19, 23)                           */}
        {/* ========================================================================= */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-[#212c3d]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#3b82f6]" />
              <h2 className="text-[14px] font-bold text-[#f1f5f9] tracking-wide uppercase font-mono">
                Supervisory Signals & Deviations
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#8c90a0]">
              Identified for {cse.cseId} ({activePeriod})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3.5">
            {/* Signal 1: Execution Gap (Section 18) */}
            <div className="p-3.5 rounded-lg bg-[#0e131b] border border-[#212c3d] hover:border-[#3b414d] transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-[13px] font-bold text-[#f1f5f9]">Execution Gap</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30">
                    HIGH · {cse.executionGapsCount} Identified
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-snug">
                Expected process steps not observed in the available evidence (e.g. statutory Tier-2 escalation omission).
              </p>
              <div className="pt-1 flex justify-end">
                <Link
                  to={`/supervision/cses/${cse.cseId}/execution-gap`}
                  className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1"
                >
                  <span>View Execution Gaps</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Signal 2: Negative Space (Section 19) */}
            <div className="p-3.5 rounded-lg bg-[#0e131b] border border-[#212c3d] hover:border-[#3b414d] transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-[13px] font-bold text-[#f1f5f9]">Negative Space</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                    MEDIUM · {cse.negativeSpaceCount} Candidates
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-snug">
                Expected evidence that was not observed in the submitted evidence (e.g. missing SCADA stream telemetry).
              </p>
              <div className="pt-1 flex justify-end">
                <Link
                  to={`/supervision/cses/${cse.cseId}/negative-space`}
                  className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1"
                >
                  <span>View Negative Space</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Signal 3: Process Deviation */}
            <div className="p-3.5 rounded-lg bg-[#0e131b] border border-[#212c3d] hover:border-[#3b414d] transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-[13px] font-bold text-[#f1f5f9]">Process Deviation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                    MEDIUM · {cse.processDeviationsCount} Deviations
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-snug">
                Workflow sequences transitioning directly into incident closure without supervisory gateway authorization token.
              </p>
              <div className="pt-1 flex justify-end">
                <Link
                  to={`/supervision/cses/${cse.cseId}/process`}
                  className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1"
                >
                  <span>View Process Analysis</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Signal 4: Historical Recurrence (Section 23) */}
            <div className="p-3.5 rounded-lg bg-[#0e131b] border border-[#212c3d] hover:border-[#3b414d] transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#60a5fa] shrink-0" />
                  <span className="text-[13px] font-bold text-[#f1f5f9]">Historical Recurrence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-mono font-bold border border-blue-500/30">
                    LOW · 3 Recurring Breaches
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-snug">
                Last recurrence logged in Q1 2026. Trend: Persistent repeat variance across consecutive assessment cycles.
              </p>
              <div className="pt-1 flex justify-end">
                <Link
                  to={`/supervision/cses/${cse.cseId}/history`}
                  className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1"
                >
                  <span>View History</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* 6. FINDINGS (Section 20: Compact Table & Action to Examiner Workspace)    */}
        {/* ========================================================================= */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-[#212c3d]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3b82f6]" />
              <h2 className="text-[14px] font-bold text-[#f1f5f9] tracking-wide uppercase font-mono">
                Supervisory Findings ({cseFindings.length})
              </h2>
            </div>
            <Link
              to={`/review?cseId=${cse.cseId}`}
              className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1"
            >
              <span>View All Findings ({cseFindings.length})</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="mt-3.5">
            {cseFindings.length > 0 ? (
              <div className="rounded-lg bg-[#0e131b] border border-[#212c3d] overflow-x-auto min-w-0">
                <table className="w-full text-left text-[12px] text-[#dfe2eb]">
                  <thead className="bg-[#111622] text-[#8c90a0] font-mono uppercase text-[10px] border-b border-[#212c3d]">
                    <tr>
                      <th className="py-2.5 px-3">Finding ID</th>
                      <th className="py-2.5 px-3">Signal Type</th>
                      <th className="py-2.5 px-3">Title & Summary</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Evidence</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#212c3d]/60">
                    {cseFindings.slice(0, 5).map((f) => (
                      <tr key={f.id} className="hover:bg-[#111723] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#60a5fa] whitespace-nowrap">
                          {f.id}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#ffb693] whitespace-nowrap">
                          {f.signalType.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-3 max-w-[280px]">
                          <div className="font-semibold text-[#f1f5f9] truncate">{f.title}</div>
                          <div className="text-[11px] text-[#8c90a0] truncate">{f.whyFlagged}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <PriorityBadge priority={f.priority} />
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusBadge status={f.status} />
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                            {f.evidenceStrength} ({f.completeness}%)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="primary"
                            iconRight={<ArrowRight className="w-3 h-3" />}
                            onClick={() => {
                              setActiveFindingId(f.id);
                              navigate(`/review/${f.id}`);
                            }}
                            className="text-[11px] font-mono py-1 px-2.5 bg-[#1d4ed8] hover:bg-[#2563eb]"
                          >
                            Examiner Workspace
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-[#0e131b] border border-[#212c3d] text-center text-[#94a3b8] text-[12px]">
                No supervisory findings currently require review for this CSE.
              </div>
            )}
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* 7. PROCESS SNAPSHOT (Section 22: Alerts → Cases → Investigations...)      */}
        {/* ========================================================================= */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-[#212c3d]">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#3b82f6]" />
              <h2 className="text-[14px] font-bold text-[#f1f5f9] tracking-wide uppercase font-mono">
                Operational Process Snapshot
              </h2>
            </div>
            <Link
              to={`/supervision/cses/${cse.cseId}/process`}
              className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1"
            >
              <span>Detailed Process Analysis</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="mt-3.5">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
              <div className="p-3 rounded-lg bg-[#0e131b] border border-[#212c3d] relative">
                <span className="text-[10px] text-[#64748b] block uppercase">1. Alerts</span>
                <span className="text-[16px] font-bold text-[#f1f5f9] mt-0.5 block">{evidenceCounts.alerts.toLocaleString()}</span>
                <span className="text-[10px] text-[#10b981] mt-0.5 block">100% Ingested</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0e131b] border border-[#212c3d] relative">
                <span className="text-[10px] text-[#64748b] block uppercase">2. Cases</span>
                <span className="text-[16px] font-bold text-[#f1f5f9] mt-0.5 block">{evidenceCounts.cases.toLocaleString()}</span>
                <span className="text-[10px] text-[#60a5fa] mt-0.5 block">6.9% Escalated</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0e131b] border border-[#212c3d] relative">
                <span className="text-[10px] text-[#64748b] block uppercase">3. Investigations</span>
                <span className="text-[16px] font-bold text-[#f1f5f9] mt-0.5 block">{evidenceCounts.investigations.toLocaleString()}</span>
                <span className="text-[10px] text-[#60a5fa] mt-0.5 block">72% Active Triage</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0e131b] border border-[#212c3d] relative">
                <span className="text-[10px] text-[#64748b] block uppercase">4. Responses</span>
                <span className="text-[16px] font-bold text-[#f1f5f9] mt-0.5 block">{evidenceCounts.responses.toLocaleString()}</span>
                <span className="text-[10px] text-amber-300 mt-0.5 block">93% Contained</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0e131b] border border-[#212c3d] relative col-span-2 sm:col-span-1">
                <span className="text-[10px] text-[#64748b] block uppercase">5. Closures</span>
                <span className="text-[16px] font-bold text-[#f1f5f9] mt-0.5 block">{evidenceCounts.closures.toLocaleString()}</span>
                <span className="text-[10px] text-[#10b981] mt-0.5 block">88% Formal Sign-off</span>
              </div>
            </div>
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* 8. REMEDIATION (Section 24: Simple Summary & Link to Remediation)          */}
        {/* ========================================================================= */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-[#212c3d]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-[14px] font-bold text-[#f1f5f9] tracking-wide uppercase font-mono">
                Remediation Status
              </h2>
            </div>
            <Link
              to={`/remediation?cseId=${cse.cseId}`}
              className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1"
            >
              <span>View Remediation Hub</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="mt-3.5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d]">
                <span className="text-[10px] font-mono text-[#64748b] block uppercase">OPEN MANDATES</span>
                <span className="text-[18px] font-bold text-amber-300 font-mono mt-0.5 block">
                  {openRemediations.length} Open
                </span>
                <span className="text-[11px] text-[#94a3b8] mt-1 block">Awaiting CSE corrective artifact</span>
              </div>

              <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d]">
                <span className="text-[10px] font-mono text-[#64748b] block uppercase">UNDER VERIFICATION</span>
                <span className="text-[18px] font-bold text-[#60a5fa] font-mono mt-0.5 block">
                  {verificationRemediations.length} In Review
                </span>
                <span className="text-[11px] text-[#94a3b8] mt-1 block">Statutory verification gates</span>
              </div>

              <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d]">
                <span className="text-[10px] font-mono text-[#64748b] block uppercase">CLOSED & RESOLVED</span>
                <span className="text-[18px] font-bold text-[#10b981] font-mono mt-0.5 block">
                  {closedRemediations.length > 0 ? closedRemediations.length : 4} Closed
                </span>
                <span className="text-[11px] text-[#94a3b8] mt-1 block">Cryptographically sealed</span>
              </div>
            </div>

            {cseRemediations.length > 0 && (
              <div className="pt-1 space-y-2">
                {cseRemediations.slice(0, 2).map((r) => (
                  <div 
                    key={r.id} 
                    className="p-3 rounded-lg bg-[#0e131b] border border-[#212c3d] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-[#10b981]">{r.id}</span>
                        <span className="text-[12px] font-semibold text-[#f1f5f9] truncate">{r.mandateTitle}</span>
                      </div>
                      <p className="text-[11px] text-[#8c90a0] truncate mt-0.5">{r.actionSummary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={r.status} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/remediation/${r.id}`)}
                        className="text-[11px] font-mono py-1 px-2"
                      >
                        Inspect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 9. SUBMISSION DETAILS DRAWER (Section 12: Clean Details View)              */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={Boolean(selectedSubmissionForDrawer)}
        onClose={() => setSelectedSubmissionForDrawer(null)}
        title={`Submission Details: ${selectedSubmissionForDrawer?.submissionId || ''}`}
        width="md"
      >
        {selectedSubmissionForDrawer && (
          <div className="space-y-4 text-[12px] font-mono">
            <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Submission ID:</span>
                <span className="text-[#60a5fa] font-bold">{selectedSubmissionForDrawer.submissionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Target CSE:</span>
                <span className="text-[#f1f5f9]">{selectedSubmissionForDrawer.cseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Assessment Period:</span>
                <span className="text-[#f1f5f9]">{selectedSubmissionForDrawer.assessmentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Source Node:</span>
                <span className="text-[#cbd5e1]">{selectedSubmissionForDrawer.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Submitted Timestamp:</span>
                <span className="text-[#cbd5e1]">{selectedSubmissionForDrawer.submittedAt}</span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-2">
              <div className="text-[11px] font-bold text-[#f1f5f9] uppercase">Validation & Provenance</div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Format Check:</span>
                <span className="text-[#10b981] font-bold">VALID ({selectedSubmissionForDrawer.fileType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Schema Version:</span>
                <span className="text-[#10b981] font-bold">OCSF-1.1.0 CONFORMANT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Canonical Mapping:</span>
                <span className="text-[#60a5fa] font-bold">{selectedSubmissionForDrawer.mappingStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">SHA-256 Digest:</span>
                <span className="text-[#94a3b8] text-[10px] break-all">{selectedSubmissionForDrawer.hash}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSubmissionForDrawer(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedSubmissionForDrawer(null);
                  navigate(`/evidence?cseId=${selectedSubmissionForDrawer.cseId}`);
                }}
              >
                Inspect in Evidence Explorer
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* 10. IMPORT EVIDENCE MODAL (Sections 10, 11, 35, 36)                        */}
      {/* ========================================================================= */}
      <ImportEvidenceModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        preselectedCseId={cse.cseId}
      />
    </PageContainer>
  );
};
