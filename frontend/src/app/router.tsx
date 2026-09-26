import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/Login/LoginPage';
import { DashboardOverviewPage } from '@/pages/Dashboard/OverviewPage';
import { CSEAssessmentsListPage } from '@/pages/CSEAssessments/CSEAssessmentsListPage';
import { CSEDetailPage } from '@/pages/CSEAssessments/CSEDetailPage';
import { FindingsListPage } from '@/pages/Findings/FindingsListPage';
import { FindingDetailPage } from '@/pages/Findings/FindingDetailPage';
import { ExecutionGapsPage } from '@/pages/ExecutionGaps/ExecutionGapsPage';
import { NegativeSpacePage } from '@/pages/NegativeSpace/NegativeSpacePage';
import { SamplingPage } from '@/pages/Sampling/SamplingPage';
import { RemediationPage } from '@/pages/Remediation/RemediationPage';

// Placeholder components for secondary prototype views
const ProcessAnalysisPage = () => (
  <div className="p-6 rounded-lg bg-[#0e1626] border border-slate-800 text-slate-300">
    <h2 className="text-lg font-bold mb-2">Process Conformance & PM4Py Integration</h2>
    <p className="text-xs text-slate-400">Reconstructed Petri net / event-log transition deviations across alert-to-closure nodes.</p>
  </div>
);
import { EvidenceQualityPage } from '@/pages/EvidenceQuality/EvidenceQualityPage';

const EvidenceExplorerPage = () => (
  <div className="p-6 rounded-lg bg-[#0e1626] border border-slate-800 text-slate-300">
    <h2 className="text-lg font-bold mb-2">Evidence Explorer</h2>
    <p className="text-xs text-slate-400">Searchable repository of raw canonical evidence records (Alerts, Cases, Investigations, Actions, Closures).</p>
  </div>
);

const HistoricalTrendsPage = () => (
  <div className="p-6 rounded-lg bg-[#0e1626] border border-slate-800 text-slate-300">
    <h2 className="text-lg font-bold mb-2">Historical Recurrence & Control Drift</h2>
    <p className="text-xs text-slate-400">Multi-cycle finding recurrence tracking and remediation regression models.</p>
  </div>
);

const PeerComparisonPage = () => (
  <div className="p-6 rounded-lg bg-[#0e1626] border border-slate-800 text-slate-300">
    <h2 className="text-lg font-bold mb-2">Cohort-Based Peer Benchmarking</h2>
    <p className="text-xs text-slate-400">Access-controlled comparative deviation analysis against segmented sector cohorts.</p>
  </div>
);

const AuditPage = () => (
  <div className="p-6 rounded-lg bg-[#0e1626] border border-slate-800 text-slate-300">
    <h2 className="text-lg font-bold mb-2">System Audit Trail & Accountability Log</h2>
    <p className="text-xs text-slate-400">Tamper-evident logs of all examiner validations, rule versions, and cryptographic custody events.</p>
  </div>
);

const AdministrationPage = () => (
  <div className="p-6 rounded-lg bg-[#0e1626] border border-slate-800 text-slate-300">
    <h2 className="text-lg font-bold mb-2">Platform Administration & Enclave Health</h2>
    <p className="text-xs text-slate-400">Air-gapped deployment status, control libraries, rule catalog, and system health.</p>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected App Shell */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<DashboardOverviewPage />} />

          {/* Supervision Routes */}
          <Route path="/supervision/cses" element={<CSEAssessmentsListPage />} />
          <Route path="/supervision/cses/:cseId" element={<CSEDetailPage />} />
          <Route path="/supervision/priority" element={<DashboardOverviewPage />} />
          <Route path="/supervision/sampling" element={<SamplingPage />} />

          {/* Analytics Routes */}
          <Route path="/analytics/execution-gaps" element={<ExecutionGapsPage />} />
          <Route path="/analytics/negative-space" element={<NegativeSpacePage />} />
          <Route path="/analytics/process" element={<ProcessAnalysisPage />} />
          <Route path="/analytics/evidence-quality" element={<EvidenceQualityPage />} />

          {/* Assessment & Examiner Workspace Routes */}
          <Route path="/assessment/findings" element={<FindingsListPage />} />
          <Route path="/assessment/findings/:findingId" element={<FindingDetailPage />} />
          <Route path="/assessment/evidence" element={<EvidenceExplorerPage />} />
          <Route path="/assessment/remediation" element={<RemediationPage />} />

          {/* Intelligence Routes */}
          <Route path="/intelligence/historical" element={<HistoricalTrendsPage />} />
          <Route path="/intelligence/peer" element={<PeerComparisonPage />} />

          {/* Governance Routes */}
          <Route path="/governance/audit" element={<AuditPage />} />
          <Route path="/governance/administration" element={<AdministrationPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
