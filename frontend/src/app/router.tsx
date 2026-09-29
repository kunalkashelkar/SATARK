import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/Login/LoginPage';
import { DashboardOverviewPage } from '@/pages/Dashboard/OverviewPage';
import { CSEAssessmentsListPage } from '@/pages/CSEAssessments/CSEAssessmentsListPage';
import { CSEDetailPage } from '@/pages/CSEAssessments/CSEDetailPage';
import { ReviewQueuePage } from '@/pages/ReviewQueue/ReviewQueuePage';
import { FindingsListPage } from '@/pages/Findings/FindingsListPage';
import { FindingDetailPage } from '@/pages/Findings/FindingDetailPage';
import { EvidenceExplorerPage } from '@/pages/EvidenceExplorer/EvidenceExplorerPage';
import { RemediationPage } from '@/pages/Remediation/RemediationPage';
import { GovernanceHubPage } from '@/pages/Governance/GovernanceHubPage';
import { AnalysisHubPage } from '@/pages/Analysis/AnalysisHubPage';
import { EngineDetailPage } from '@/pages/Analysis/EngineDetailPage';
import { ExecutionGapPage } from '@/pages/Analysis/ExecutionGapPage';
import { NegativeSpacePage } from '@/pages/Analysis/NegativeSpacePage';
import { CoverageBlindSpotsPage } from '@/pages/Analysis/CoverageBlindSpotsPage';
import { ProcessConformancePage } from '@/pages/Analysis/ProcessConformancePage';
import { InvestigationQualityPage } from '@/pages/Analysis/InvestigationQualityPage';
import { BehaviouralDeviationPage } from '@/pages/Analysis/BehaviouralDeviationPage';
import { HistoricalComparisonPage } from '@/pages/Analysis/HistoricalComparisonPage';
import { PeerBenchmarkingPage } from '@/pages/Analysis/PeerBenchmarkingPage';
import { CrossSourceConsistencyPage } from '@/pages/Analysis/CrossSourceConsistencyPage';
import { MetricIntegrityPage } from '@/pages/Analysis/MetricIntegrityPage';

import { SupervisoryEvidenceGraphPage } from '@/pages/Graph/SupervisoryEvidenceGraphPage';
import { SamplingPage } from '@/pages/Sampling/SamplingPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected App Shell */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/overview" element={<DashboardOverviewPage />} />

          {/* 1. Supervision & CSE Assessments Routes (PART 3) */}
          <Route path="/supervision" element={<Navigate to="/supervision/cses" replace />} />
          <Route path="/supervision/cses" element={<CSEAssessmentsListPage />} />
          <Route path="/supervision/cses/:cseId" element={<CSEDetailPage />} />
          <Route path="/supervision/cses/:cseId/assessments/:assessmentId" element={<CSEDetailPage />} />
          <Route path="/supervision/cses/:cseId/execution-gap" element={<ExecutionGapPage />} />
          <Route path="/supervision/cses/:cseId/negative-space" element={<NegativeSpacePage />} />
          <Route path="/supervision/cses/:cseId/coverage" element={<CoverageBlindSpotsPage />} />
          <Route path="/supervision/cses/:cseId/process" element={<ProcessConformancePage />} />
          <Route path="/supervision/cses/:cseId/investigation-quality" element={<InvestigationQualityPage />} />
          <Route path="/supervision/cses/:cseId/behavioural" element={<BehaviouralDeviationPage />} />
          <Route path="/supervision/cses/:cseId/history" element={<HistoricalComparisonPage />} />
          <Route path="/supervision/cses/:cseId/peer" element={<PeerBenchmarkingPage />} />
          <Route path="/supervision/cses/:cseId/consistency" element={<CrossSourceConsistencyPage />} />
          <Route path="/supervision/cses/:cseId/metric-integrity" element={<MetricIntegrityPage />} />
          <Route path="/assessments" element={<CSEAssessmentsListPage />} />
          <Route path="/assessments/:cseId" element={<CSEDetailPage />} />

          {/* 2. Review Queue & Examiner Workspace Routes (PART 2 & 3) */}
          <Route path="/review" element={<ReviewQueuePage />} />
          <Route path="/review/findings" element={<ReviewQueuePage />} />
          <Route path="/review/findings/:findingId" element={<FindingDetailPage />} />
          <Route path="/review/:findingId" element={<FindingDetailPage />} />
          <Route path="/examiner/findings/:findingId" element={<FindingDetailPage />} />
          <Route path="/findings" element={<FindingsListPage />} />
          <Route path="/findings/:findingId" element={<FindingDetailPage />} />

          {/* 3. Supervisory Evidence Graph */}
          <Route path="/graph" element={<SupervisoryEvidenceGraphPage />} />
          <Route path="/evidence-graph" element={<SupervisoryEvidenceGraphPage />} />

          {/* 4. Evidence Routes */}
          <Route path="/evidence" element={<EvidenceExplorerPage />} />
          <Route path="/evidence/:evidenceId" element={<EvidenceExplorerPage />} />

          {/* 5. Sampling Routes */}
          <Route path="/sampling" element={<SamplingPage />} />

          {/* 6. Remediation Workspace (Lifecycle Stages: Open, Verification, Regression) */}
          <Route path="/remediation" element={<RemediationPage />} />
          <Route path="/remediation/open" element={<RemediationPage defaultStage="open" />} />
          <Route path="/remediation/verification" element={<RemediationPage defaultStage="verification" />} />
          <Route path="/remediation/regression" element={<RemediationPage defaultStage="regression" />} />
          <Route path="/remediation/:remediationId" element={<RemediationPage />} />

          {/* Verification redirects to unified Remediation workspace */}
          <Route path="/verification" element={<Navigate to="/remediation?stage=verification" replace />} />
          <Route path="/verification/:verificationId" element={<Navigate to="/remediation?stage=verification" replace />} />

          {/* 7. Governance Workspace Routes (Audit, Administration, Controls, Versions) */}
          <Route path="/governance" element={<GovernanceHubPage />} />
          <Route path="/governance/audit" element={<GovernanceHubPage initialTab="audit" />} />
          <Route path="/governance/admin" element={<GovernanceHubPage initialTab="administration" />} />
          <Route path="/governance/administration" element={<GovernanceHubPage initialTab="administration" />} />
          <Route path="/governance/controls" element={<GovernanceHubPage initialTab="controls" />} />
          <Route path="/governance/versions" element={<GovernanceHubPage initialTab="versions" />} />
          <Route path="/audit" element={<Navigate to="/governance?tab=audit" replace />} />
          <Route path="/administration" element={<Navigate to="/governance?tab=administration" replace />} />

          {/* 8. Authoritative Analysis Hub & 10 Nested Engine Routes */}
          <Route path="/analysis" element={<AnalysisHubPage />} />
          <Route path="/analysis/execution-gap" element={<ExecutionGapPage />} />
          <Route path="/analysis/negative-space" element={<NegativeSpacePage />} />
          <Route path="/analysis/coverage" element={<CoverageBlindSpotsPage />} />
          <Route path="/analysis/process" element={<ProcessConformancePage />} />
          <Route path="/analysis/investigation-quality" element={<InvestigationQualityPage />} />
          <Route path="/analysis/behavioural" element={<BehaviouralDeviationPage />} />
          <Route path="/analysis/historical" element={<HistoricalComparisonPage />} />
          <Route path="/analysis/peer" element={<PeerBenchmarkingPage />} />
          <Route path="/analysis/consistency" element={<CrossSourceConsistencyPage />} />
          <Route path="/analysis/metric-integrity" element={<MetricIntegrityPage />} />
          <Route path="/analysis/:engineSlug" element={<EngineDetailPage />} />

          {/* Legacy / Alternate Path Aliases */}
          <Route path="/supervision/cse-assessments" element={<Navigate to="/supervision/cses" replace />} />
          <Route path="/supervision/cse-assessments/:cseId" element={<CSEDetailPage />} />
          <Route path="/supervision/priority" element={<Navigate to="/review" replace />} />
          <Route path="/supervision/sampling" element={<Navigate to="/sampling" replace />} />
          <Route path="/assessment/findings" element={<Navigate to="/review" replace />} />
          <Route path="/assessment/findings/:findingId" element={<FindingDetailPage />} />
          <Route path="/assessment/evidence" element={<Navigate to="/evidence" replace />} />
          <Route path="/assessment/remediation" element={<Navigate to="/remediation" replace />} />
          <Route path="/assessment/verification" element={<Navigate to="/verification" replace />} />

          {/* Legacy Analytics Direct Routes -> mapped to nested /analysis routes */}
          <Route path="/analytics/execution-gaps" element={<Navigate to="/analysis/execution-gap" replace />} />
          <Route path="/analytics/negative-space" element={<Navigate to="/analysis/negative-space" replace />} />
          <Route path="/analytics/process" element={<Navigate to="/analysis/process" replace />} />
          <Route path="/analytics/capability" element={<Navigate to="/analysis/metric-integrity" replace />} />
          <Route path="/analytics/process-analysis" element={<Navigate to="/analysis/process" replace />} />
          <Route path="/analytics/evidence-quality" element={<Navigate to="/analysis/investigation-quality" replace />} />
          <Route path="/analytics/behavioural-analysis" element={<Navigate to="/analysis/behavioural" replace />} />
          <Route path="/analytics/behavioural" element={<Navigate to="/analysis/behavioural" replace />} />
          <Route path="/analytics/coverage" element={<Navigate to="/analysis/coverage" replace />} />
          <Route path="/analytics/coverage-analysis" element={<Navigate to="/analysis/coverage" replace />} />
          <Route path="/analytics/consistency" element={<Navigate to="/analysis/consistency" replace />} />
          <Route path="/analytics/consistency-analysis" element={<Navigate to="/analysis/consistency" replace />} />
          <Route path="/analytics/historical-intelligence" element={<Navigate to="/analysis/historical" replace />} />
          <Route path="/intelligence/historical" element={<Navigate to="/analysis/historical" replace />} />
          <Route path="/analytics/peer-comparison" element={<Navigate to="/analysis/peer" replace />} />
          <Route path="/intelligence/peer" element={<Navigate to="/analysis/peer" replace />} />
          <Route path="/intelligence/signal-discovery" element={<Navigate to="/analysis/execution-gap" replace />} />
          <Route path="/analytics/signal-discovery" element={<Navigate to="/analysis/execution-gap" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
