import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ExecutionGapsPage } from '@/pages/ExecutionGaps/ExecutionGapsPage';
import { NegativeSpacePage } from '@/pages/NegativeSpace/NegativeSpacePage';
import { ProcessAnalysisPage } from '@/pages/ProcessAnalysis/ProcessAnalysisPage';
import { EvidenceQualityPage } from '@/pages/EvidenceQuality/EvidenceQualityPage';
import { BehaviouralAnalysisPage } from '@/pages/BehaviouralAnalysis/BehaviouralAnalysisPage';
import { CoveragePage } from '@/pages/Coverage/CoveragePage';
import { ConsistencyPage } from '@/pages/Consistency/ConsistencyPage';
import { HistoricalIntelligencePage } from '@/pages/HistoricalIntelligence/HistoricalIntelligencePage';
import { PeerComparisonPage } from '@/pages/PeerComparison/PeerComparisonPage';
import {
  PageContainer,
  PageHeader,
  Tabs,
  Button
} from '@/components/common';
import { ArrowLeft } from 'lucide-react';

type AnalysisTab = 
  | 'execution-gap'
  | 'negative-space'
  | 'process'
  | 'evidence-quality'
  | 'behaviour'
  | 'coverage'
  | 'consistency'
  | 'historical'
  | 'peer';

const TABS = [
  { id: 'execution-gap', label: 'Execution Gap', icon: <span className="material-symbols-outlined text-[15px]">rule_folder</span>, count: 'GAP-0071' },
  { id: 'negative-space', label: 'Negative Space', icon: <span className="material-symbols-outlined text-[15px]">contrast</span>, count: 'NS-0041' },
  { id: 'process', label: 'Process Analysis', icon: <span className="material-symbols-outlined text-[15px]">account_tree</span>, count: 'Petri-Net' },
  { id: 'evidence-quality', label: 'Evidence Quality', icon: <span className="material-symbols-outlined text-[15px]">verified</span>, count: 'FIPS-140' },
  { id: 'behaviour', label: 'Behavioural Analysis', icon: <span className="material-symbols-outlined text-[15px]">psychology</span>, count: 'Triage' },
  { id: 'coverage', label: 'Coverage Void', icon: <span className="material-symbols-outlined text-[15px]">radar</span>, count: 'Telemetry' },
  { id: 'consistency', label: 'Consistency', icon: <span className="material-symbols-outlined text-[15px]">stacked_line_chart</span>, count: 'Cross-Src' },
  { id: 'historical', label: 'Historical Recurrence', icon: <span className="material-symbols-outlined text-[15px]">timeline</span>, count: '3 Cycles' },
  { id: 'peer', label: 'Peer Cohort', icon: <span className="material-symbols-outlined text-[15px]">compare_arrows</span>, count: 'Cohort' },
];

export const AnalysisHubPage: React.FC<{ initialTab?: AnalysisTab }> = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromQuery = (searchParams.get('tab') as AnalysisTab) || initialTab || 'execution-gap';
  const [activeTab, setActiveTab] = useState<string>(tabFromQuery);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as AnalysisTab;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <PageContainer>
      {/* 1. STANDARD PAGE HEADER */}
      <PageHeader
        title="Analytical Engines Hub"
        description="Secondary supervisory analytical engines evaluating execution gaps, telemetry voids, process models, and historical intelligence."
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/review')}
          >
            Return to Review Queue
          </Button>
        }
      />

      {/* 2. TABS */}
      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* 3. ENGINE CONTENT */}
      <div className="min-w-0 mt-2">
        {activeTab === 'execution-gap' && <ExecutionGapsPage />}
        {activeTab === 'negative-space' && <NegativeSpacePage />}
        {activeTab === 'process' && <ProcessAnalysisPage />}
        {activeTab === 'evidence-quality' && <EvidenceQualityPage />}
        {activeTab === 'behaviour' && <BehaviouralAnalysisPage />}
        {activeTab === 'coverage' && <CoveragePage />}
        {activeTab === 'consistency' && <ConsistencyPage />}
        {activeTab === 'historical' && <HistoricalIntelligencePage />}
        {activeTab === 'peer' && <PeerComparisonPage />}
      </div>
    </PageContainer>
  );
};
