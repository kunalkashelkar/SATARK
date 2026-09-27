import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/Login/LoginPage';
import { DashboardOverviewPage } from '@/pages/Dashboard/OverviewPage';
import { CSEAssessmentsListPage } from '@/pages/CSEAssessments/CSEAssessmentsListPage';
import { CSEDetailPage } from '@/pages/CSEAssessments/CSEDetailPage';
import { ReviewQueuePage } from '@/pages/ReviewQueue/ReviewQueuePage';
import { FindingDetailPage } from '@/pages/Findings/FindingDetailPage';
import { EvidenceExplorerPage } from '@/pages/EvidenceExplorer/EvidenceExplorerPage';
import { RemediationPage } from '@/pages/Remediation/RemediationPage';
import { GovernanceHubPage } from '@/pages/Governance/GovernanceHubPage';
import { AnalysisHubPage } from '@/pages/Analysis/AnalysisHubPage';

import { SupervisoryEvidenceGraphPage } from '@/pages/Graph/SupervisoryEvidenceGraphPage';
import { SamplingPage } from '@/pages/Sampling/SamplingPage';

// Wrapper for parameterized subtabs in Analysis
const AnalysisSubTabRoute: React.FC = () => {
  const { subTab } = useParams<{ subTab: string }>();
  return <AnalysisHubPage initialTab={subTab as any} />;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected App Shell */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<DashboardOverviewPage />} />

          {/* 1. Assessments Routes */}
          <Route path="/assessments" element={<CSEAssessmentsListPage />} />
          <Route path="/assessments/:cseId" element={<CSEDetailPage />} />

          {/* 2. Review Queue & Examiner Workspace Routes */}
          <Route path="/review" element={<ReviewQueuePage />} />
          <Route path="/review/:findingId" element={<FindingDetailPage />} />
          <Route path="/findings" element={<ReviewQueuePage />} />
          <Route path="/findings/:findingId" element={<FindingDetailPage />} />

          {/* 3. Supervisory Evidence Graph (Attack-Surface to Supervisory Graph) */}
          <Route path="/graph" element={<SupervisoryEvidenceGraphPage />} />
          <Route path="/evidence-graph" element={<SupervisoryEvidenceGraphPage />} />

          {/* 4. Evidence Routes */}
          <Route path="/evidence" element={<EvidenceExplorerPage />} />
          <Route path="/evidence/:evidenceId" element={<EvidenceExplorerPage />} />

          {/* 5. Sampling Routes */}
          <Route path="/sampling" element={<SamplingPage />} />

          {/* 6. Remediation Routes */}
          <Route path="/remediation" element={<RemediationPage />} />
          <Route path="/remediation/:remediationId" element={<RemediationPage />} />

          {/* 7. Governance Routes */}
          <Route path="/governance" element={<GovernanceHubPage />} />
          <Route path="/governance/audit" element={<GovernanceHubPage initialTab="audit" />} />
          <Route path="/governance/admin" element={<GovernanceHubPage initialTab="admin" />} />
          <Route path="/governance/administration" element={<GovernanceHubPage initialTab="admin" />} />
          <Route path="/audit" element={<Navigate to="/governance/audit" replace />} />
          <Route path="/administration" element={<Navigate to="/governance/admin" replace />} />

          {/* 8. Grouped Analysis Hub Routes */}
          <Route path="/analysis" element={<AnalysisHubPage />} />
          <Route path="/analysis/:subTab" element={<AnalysisSubTabRoute />} />

          {/* Legacy / Alternate Path Aliases */}
          <Route path="/supervision/cses" element={<Navigate to="/assessments" replace />} />
          <Route path="/supervision/cses/:cseId" element={<CSEDetailPage />} />
          <Route path="/supervision/cse-assessments" element={<Navigate to="/assessments" replace />} />
          <Route path="/supervision/cse-assessments/:cseId" element={<CSEDetailPage />} />
          <Route path="/supervision/priority" element={<Navigate to="/review" replace />} />
          <Route path="/supervision/sampling" element={<Navigate to="/review" replace />} />
          <Route path="/assessment/findings" element={<Navigate to="/review" replace />} />
          <Route path="/assessment/findings/:findingId" element={<FindingDetailPage />} />
          <Route path="/assessment/evidence" element={<Navigate to="/evidence" replace />} />
          <Route path="/assessment/remediation" element={<Navigate to="/remediation" replace />} />
          <Route path="/assessment/verification" element={<Navigate to="/remediation" replace />} />
          <Route path="/verification" element={<Navigate to="/remediation" replace />} />

          {/* Legacy Analytics Direct Routes -> mapped to Analysis Hub */}
          <Route path="/analytics/execution-gaps" element={<AnalysisHubPage initialTab="execution-gap" />} />
          <Route path="/analytics/negative-space" element={<AnalysisHubPage initialTab="negative-space" />} />
          <Route path="/analytics/process" element={<AnalysisHubPage initialTab="process" />} />
          <Route path="/analytics/process-analysis" element={<AnalysisHubPage initialTab="process" />} />
          <Route path="/analytics/evidence-quality" element={<AnalysisHubPage initialTab="evidence-quality" />} />
          <Route path="/analytics/behavioural-analysis" element={<AnalysisHubPage initialTab="behaviour" />} />
          <Route path="/analytics/behavioural" element={<AnalysisHubPage initialTab="behaviour" />} />
          <Route path="/analytics/coverage" element={<AnalysisHubPage initialTab="coverage" />} />
          <Route path="/analytics/coverage-analysis" element={<AnalysisHubPage initialTab="coverage" />} />
          <Route path="/analytics/consistency" element={<AnalysisHubPage initialTab="consistency" />} />
          <Route path="/analytics/consistency-analysis" element={<AnalysisHubPage initialTab="consistency" />} />
          <Route path="/analytics/historical-intelligence" element={<AnalysisHubPage initialTab="historical" />} />
          <Route path="/intelligence/historical" element={<AnalysisHubPage initialTab="historical" />} />
          <Route path="/analytics/peer-comparison" element={<AnalysisHubPage initialTab="peer" />} />
          <Route path="/intelligence/peer" element={<AnalysisHubPage initialTab="peer" />} />
          <Route path="/intelligence/signal-discovery" element={<AnalysisHubPage initialTab="execution-gap" />} />
          <Route path="/analytics/signal-discovery" element={<AnalysisHubPage initialTab="execution-gap" />} />
        </Route>

        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
