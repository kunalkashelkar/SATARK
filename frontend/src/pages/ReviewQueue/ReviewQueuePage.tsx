import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { Finding, Priority } from '@/types';
import { 
  Search, 
  RotateCcw, 
  ArrowRight, 
  AlertTriangle,
  Clock, 
  FileText, 
  CheckCircle2 
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  Input,
  Select,
  StatusBadge,
  Button
} from '@/components/common';

export const ReviewQueuePage: React.FC = () => {
  const { findings, cses, setActiveFindingId } = useSupervisory();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCse, setSelectedCse] = useState('ALL');
  const [selectedSignal, setSelectedSignal] = useState(searchParams.get('signal') || 'ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedStrength, setSelectedStrength] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');

  useEffect(() => {
    const signalParam = searchParams.get('signal');
    if (signalParam) {
      setSelectedSignal(signalParam);
    }
  }, [searchParams]);

  // Clear filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCse('ALL');
    setSelectedSignal('ALL');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setSelectedStrength('ALL');
    setSelectedSector('ALL');
    setSearchParams({});
  };

  // Filter logic
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          f.id.toLowerCase().includes(q) ||
          f.cseId.toLowerCase().includes(q) ||
          f.cseName.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.controlId.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedCse !== 'ALL' && f.cseId !== selectedCse) return false;
      if (selectedSignal !== 'ALL' && f.signalType !== selectedSignal) return false;
      if (selectedPriority !== 'ALL' && f.priority !== selectedPriority) return false;

      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'AWAITING_EVIDENCE' && f.status === 'UNDER_REVIEW') return true;
        if (selectedStatus === 'AWAITING_DECISION' && f.status === 'CANDIDATE') return true;
        if (f.status !== selectedStatus) return false;
      }

      if (selectedStrength !== 'ALL' && f.evidenceStrength !== selectedStrength) return false;

      if (selectedSector !== 'ALL') {
        const cse = cses.find(c => c.cseId === f.cseId);
        if (cse && cse.sector !== selectedSector) return false;
      }

      return true;
    });
  }, [findings, cses, searchTerm, selectedCse, selectedSignal, selectedPriority, selectedStatus, selectedStrength, selectedSector]);

  // Counts for quick filter pills
  const summaryCounts = useMemo(() => {
    return {
      critical: findings.filter(f => f.priority === 'CRITICAL').length,
      high: findings.filter(f => f.priority === 'HIGH').length,
      medium: findings.filter(f => f.priority === 'MEDIUM').length,
      awaitingEvidence: findings.filter(f => f.status === 'UNDER_REVIEW').length,
      awaitingDecision: findings.filter(f => f.status === 'CANDIDATE').length
    };
  }, [findings]);

  return (
    <PageContainer>
      {/* 1. STANDARD PAGE HEADER */}
      <PageHeader
        title="Supervisory Review Queue"
        description="Prioritized operational discrepancy candidates requiring human supervisory adjudication."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2.5 py-1 rounded-md border border-[#7bdb80]/20">
              Certified Human Boundary Active
            </span>
          </div>
        }
      />

      {/* 2. STANDARDIZED QUICK-FILTER KPI TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 min-w-0">
        <div
          onClick={() => setSelectedPriority(selectedPriority === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
            selectedPriority === 'CRITICAL'
              ? 'bg-rose-950/30 border-rose-500/60'
              : 'bg-[#181c22] border-[#262a31] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#ffb4ab]">
            <span>Critical Priority</span>
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          </div>
          <div className="text-[24px] font-semibold font-mono text-rose-300 mt-1 leading-none">
            {summaryCounts.critical}
          </div>
          <div className="text-[11px] text-[#8c90a0] mt-1">SLA &lt;24h Immediate</div>
        </div>

        <div
          onClick={() => setSelectedPriority(selectedPriority === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
            selectedPriority === 'HIGH'
              ? 'bg-amber-950/30 border-amber-500/60'
              : 'bg-[#181c22] border-[#262a31] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-amber-300">
            <span>High Priority</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-[24px] font-semibold font-mono text-amber-300 mt-1 leading-none">
            {summaryCounts.high}
          </div>
          <div className="text-[11px] text-[#8c90a0] mt-1">Statutory 7-Day Review</div>
        </div>

        <div
          onClick={() => setSelectedPriority(selectedPriority === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
            selectedPriority === 'MEDIUM'
              ? 'bg-blue-950/30 border-blue-500/60'
              : 'bg-[#181c22] border-[#262a31] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-blue-300">
            <span>Medium Priority</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-[24px] font-semibold font-mono text-blue-300 mt-1 leading-none">
            {summaryCounts.medium}
          </div>
          <div className="text-[11px] text-[#8c90a0] mt-1">Assessment Cycle Routine</div>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'AWAITING_EVIDENCE' ? 'ALL' : 'AWAITING_EVIDENCE')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
            selectedStatus === 'AWAITING_EVIDENCE'
              ? 'bg-[#1c2436] border-[#afc6ff]/60'
              : 'bg-[#181c22] border-[#262a31] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#afc6ff]">
            <span>Awaiting Evidence</span>
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="text-[24px] font-semibold font-mono text-[#afc6ff] mt-1 leading-none">
            {summaryCounts.awaitingEvidence}
          </div>
          <div className="text-[11px] text-[#8c90a0] mt-1">Demands Dispatched</div>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'AWAITING_DECISION' ? 'ALL' : 'AWAITING_DECISION')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between col-span-2 sm:col-span-1 ${
            selectedStatus === 'AWAITING_DECISION'
              ? 'bg-emerald-950/30 border-emerald-500/60'
              : 'bg-[#181c22] border-[#262a31] hover:border-[#3b414d]'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-emerald-300">
            <span>Awaiting Decision</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-[24px] font-semibold font-mono text-emerald-300 mt-1 leading-none">
            {summaryCounts.awaitingDecision}
          </div>
          <div className="text-[11px] text-[#8c90a0] mt-1">Candidate Items</div>
        </div>
      </div>

      {/* 3. STANDARDIZED FILTER TOOLBAR */}
      <div className="p-3.5 rounded-lg bg-[#181c22] border border-[#262a31] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="lg:col-span-2">
            <Input
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search finding ID, CSE, control..."
              sizeVariant="sm"
            />
          </div>

          <Select
            sizeVariant="sm"
            value={selectedCse}
            onChange={(e) => setSelectedCse(e.target.value)}
            options={[
              { value: 'ALL', label: 'All CSEs' },
              ...cses.map(c => ({ value: c.cseId, label: `${c.cseId} - ${c.cseName}` }))
            ]}
          />

          <Select
            sizeVariant="sm"
            value={selectedSignal}
            onChange={(e) => setSelectedSignal(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Signals' },
              { value: 'EXECUTION_GAP', label: 'Execution Gap' },
              { value: 'NEGATIVE_SPACE', label: 'Negative Space' },
              { value: 'CAPABILITY_DISCREPANCY', label: 'Capability Discrepancy' },
              { value: 'PROCESS_DEVIATION', label: 'Process Deviation' },
              { value: 'CROSS_SOURCE_INCONSISTENCY', label: 'Inconsistency' },
            ]}
          />

          <Select
            sizeVariant="sm"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Priorities' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' },
            ]}
          />

          <Select
            sizeVariant="sm"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'CANDIDATE', label: 'Candidate' },
              { value: 'UNDER_REVIEW', label: 'Under Review' },
              { value: 'VALIDATED', label: 'Validated' },
              { value: 'QUALIFIED', label: 'Qualified' },
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'OVERRIDDEN', label: 'Overridden' },
            ]}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#262a31] text-[12px]">
          <span className="text-[#8c90a0] font-mono text-[11px]">
            Filtered Candidates: <strong className="text-[#dfe2eb]">{filteredFindings.length}</strong> of {findings.length}
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] text-[#8c90a0] hover:text-[#dfe2eb] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* 4. COMPACT STANDARDIZED QUEUE CARDS (Adhering to Section 17) */}
      <div className="space-y-3 min-w-0">
        {filteredFindings.map((finding) => (
          <div
            key={finding.id}
            className="p-3.5 rounded-lg bg-[#181c22] border border-[#262a31] hover:border-[#3b414d] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-[#afc6ff] px-2 py-0.5 rounded bg-[#1c2026] border border-[#262a31]">
                  {finding.id}
                </span>
                <span className="font-mono text-[11px] text-[#dfe2eb] font-medium">
                  {finding.cseId} ({finding.cseName})
                </span>
                <span className="text-[#8c90a0]">•</span>
                <span className="font-mono text-[11px] text-[#ffb693] font-medium">
                  {finding.signalType.replace(/_/g, ' ')}
                </span>
                <StatusBadge status={finding.priority} />
                <span className="text-[11px] text-[#8c90a0] font-mono bg-[#14181f] px-1.5 py-0.5 rounded">
                  {finding.controlId}
                </span>
              </div>

              <div>
                <h3 className="text-[13px] md:text-[14px] font-semibold text-[#dfe2eb] truncate">
                  {finding.title}
                </h3>
                <p className="text-[12px] text-[#8c90a0] leading-snug line-clamp-1 mt-0.5 max-w-4xl">
                  <strong className="text-[#c2c6d6] font-mono uppercase text-[10px]">Reason: </strong>
                  {finding.whyFlagged}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] font-mono">
                <span className="text-[#8c90a0]">
                  Evidence Strength: <strong className="text-[#7bdb80]">{finding.evidenceStrength}</strong> ({finding.sourceEvidence.length} records)
                </span>
                <span className="text-[#8c90a0]">•</span>
                <span className="text-[#8c90a0]">
                  Completeness: <strong className="text-[#afc6ff]">{finding.completeness}%</strong>
                </span>
                <span className="text-[#8c90a0]">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#8c90a0]">Status:</span>
                  <StatusBadge status={finding.status} />
                </div>
              </div>
            </div>

            <div className="shrink-0 self-start lg:self-center">
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
    </PageContainer>
  );
};
