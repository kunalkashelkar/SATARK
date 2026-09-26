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
import { VerificationPage } from '@/pages/Verification/VerificationPage';

import { ProcessAnalysisPage } from '@/pages/ProcessAnalysis/ProcessAnalysisPage';
import { EvidenceQualityPage } from '@/pages/EvidenceQuality/EvidenceQualityPage';

import { EvidenceExplorerPage } from '@/pages/EvidenceExplorer/EvidenceExplorerPage';

import { HistoricalIntelligencePage } from '@/pages/HistoricalIntelligence/HistoricalIntelligencePage';

import { PeerComparisonPage } from '@/pages/PeerComparison/PeerComparisonPage';
import { BehaviouralAnalysisPage } from '@/pages/BehaviouralAnalysis/BehaviouralAnalysisPage';
import { CoveragePage } from '@/pages/Coverage/CoveragePage';
import { ConsistencyPage } from '@/pages/Consistency/ConsistencyPage';
import { SignalDiscoveryPage } from '@/pages/SignalDiscovery/SignalDiscoveryPage';
import { AuditTrailPage } from '@/pages/Audit/AuditTrailPage';
import { AdministrationPage } from '@/pages/Administration/AdministrationPage';

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
          <Route path="/analytics/process-analysis" element={<ProcessAnalysisPage />} />
          <Route path="/analytics/evidence-quality" element={<EvidenceQualityPage />} />
          <Route path="/analytics/behavioural-analysis" element={<BehaviouralAnalysisPage />} />
          <Route path="/analytics/behavioural" element={<BehaviouralAnalysisPage />} />
          <Route path="/analytics/coverage" element={<CoveragePage />} />
          <Route path="/analytics/coverage-analysis" element={<CoveragePage />} />
          <Route path="/analytics/consistency" element={<ConsistencyPage />} />
          <Route path="/analytics/consistency-analysis" element={<ConsistencyPage />} />

          {/* Assessment & Examiner Workspace Routes */}
          <Route path="/assessment/findings" element={<FindingsListPage />} />
          <Route path="/assessment/findings/:findingId" element={<FindingDetailPage />} />
          <Route path="/evidence" element={<EvidenceExplorerPage />} />
          <Route path="/assessment/evidence" element={<EvidenceExplorerPage />} />
          <Route path="/remediation" element={<RemediationPage />} />
          <Route path="/assessment/remediation" element={<RemediationPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/assessment/verification" element={<VerificationPage />} />

          {/* Intelligence Routes */}
          <Route path="/analytics/historical-intelligence" element={<HistoricalIntelligencePage />} />
          <Route path="/intelligence/historical" element={<HistoricalIntelligencePage />} />
          <Route path="/analytics/peer-comparison" element={<PeerComparisonPage />} />
          <Route path="/intelligence/peer" element={<PeerComparisonPage />} />
          <Route path="/intelligence/signal-discovery" element={<SignalDiscoveryPage />} />
          <Route path="/analytics/signal-discovery" element={<SignalDiscoveryPage />} />

          {/* Governance Routes */}
          <Route path="/governance/audit" element={<AuditTrailPage />} />
          <Route path="/audit" element={<AuditTrailPage />} />
          <Route path="/governance/administration" element={<AdministrationPage />} />
          <Route path="/administration" element={<AdministrationPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
