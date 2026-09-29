import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { CSEAssessment, Priority } from '@/types';
import { 
  Search, 
  RotateCcw, 
  ArrowRight, 
  Upload, 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  Layers
} from 'lucide-react';
import {
  PageContainer,
  Input,
  Select,
  PriorityBadge,
  Button,
  LoadingState,
  EmptyState,
  ErrorState
} from '@/components/common';
import { ImportEvidenceModal } from '@/components/evidence/ImportEvidenceModal';

type SortField = 'cseId' | 'cseName' | 'period' | 'evidenceReadiness' | 'openFindingsCount' | 'supervisoryPriority' | 'status' | 'lastSubmission';
type SortDirection = 'asc' | 'desc';

export const CSEAssessmentsListPage: React.FC = () => {
  const { cses, setActiveCseId, refreshAllData, isLoading } = useSupervisory();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedReadiness, setSelectedReadiness] = useState('ALL');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('supervisoryPriority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Ingestion Modal & Error State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSector('ALL');
    setSelectedPeriod('ALL');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setSelectedReadiness('ALL');
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted CSEs
  const filteredCSEs = useMemo(() => {
    return cses.filter((cse) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          cse.cseId.toLowerCase().includes(q) ||
          cse.cseName.toLowerCase().includes(q) ||
          cse.sector.toLowerCase().includes(q) ||
          (cse.socType && cse.socType.toLowerCase().includes(q)) ||
          (cse.primarySignal && cse.primarySignal.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedSector !== 'ALL' && !cse.sector.toLowerCase().includes(selectedSector.toLowerCase())) return false;
      if (selectedPeriod !== 'ALL' && cse.period !== selectedPeriod) return false;
      if (selectedPriority !== 'ALL' && cse.supervisoryPriority !== selectedPriority) return false;
      if (selectedStatus !== 'ALL' && cse.status !== selectedStatus) return false;

      if (selectedReadiness !== 'ALL') {
        if (selectedReadiness === 'Deficient' && cse.evidenceReadiness >= 80) return false;
        if (selectedReadiness === 'Acceptable' && (cse.evidenceReadiness < 80 || cse.evidenceReadiness >= 90)) return false;
        if (selectedReadiness === 'Robust' && cse.evidenceReadiness < 90) return false;
      }

      return true;
    });
  }, [cses, searchTerm, selectedSector, selectedPeriod, selectedPriority, selectedStatus, selectedReadiness]);

  const sortedCSEs = useMemo(() => {
    const list = [...filteredCSEs];
    const priorityWeight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

    list.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'supervisoryPriority') {
        comparison = (priorityWeight[b.supervisoryPriority] || 0) - (priorityWeight[a.supervisoryPriority] || 0);
      } else if (sortField === 'evidenceReadiness') {
        comparison = (a.evidenceReadiness || 0) - (b.evidenceReadiness || 0);
      } else if (sortField === 'openFindingsCount') {
        comparison = (a.openFindingsCount || 0) - (b.openFindingsCount || 0);
      } else if (sortField === 'cseId') {
        comparison = a.cseId.localeCompare(b.cseId);
      } else if (sortField === 'cseName') {
        comparison = a.cseName.localeCompare(b.cseName);
      } else if (sortField === 'period') {
        comparison = (a.period || '').localeCompare(b.period || '');
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      } else if (sortField === 'lastSubmission') {
        comparison = (a.lastSubmission || '').localeCompare(b.lastSubmission || '');
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [filteredCSEs, sortField, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(sortedCSEs.length / pageSize) || 1;
  const paginatedCSEs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCSEs.slice(start, start + pageSize);
  }, [sortedCSEs, currentPage, pageSize]);

  const handleRowClick = (cse: CSEAssessment) => {
    setActiveCseId(cse.cseId);
    navigate(`/supervision/cses/${cse.cseId}`);
  };

  const handleRefresh = async () => {
    try {
      setLoadError(null);
      await refreshAllData();
    } catch (err: any) {
      setLoadError(err?.message || 'Failed refreshing CSE assessment records from backend.');
    }
  };

  // Status Badge Component adhering strictly to real states
  const renderAssessmentStatusBadge = (status: string) => {
    let colorClasses = 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    let dotColor = 'bg-slate-400';
    let isPulse = false;

    if (status === 'Review Required') {
      colorClasses = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      dotColor = 'bg-rose-400';
      isPulse = true;
    } else if (status === 'Under Review' || status === 'Processing' || status === 'Analysis') {
      colorClasses = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      dotColor = 'bg-amber-400';
    } else if (status === 'Remediation' || status === 'Remediation Mandated') {
      colorClasses = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      dotColor = 'bg-cyan-400';
    } else if (status === 'Monitoring' || status === 'Closed' || status === 'Compliant') {
      colorClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      dotColor = 'bg-emerald-400';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono uppercase border ${colorClasses}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isPulse ? 'animate-pulse' : ''}`} />
        <span>{status}</span>
      </span>
    );
  };

  return (
    <PageContainer>
      {/* 1. PRODUCTION ASSESSMENT HEADER */}
      <div className="bg-[#111622] border border-[#212c3d] rounded-lg p-4 md:p-5 shadow-sm mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] md:text-[20px] font-semibold text-[#f1f5f9] tracking-tight">
                CSE Assessments
              </h1>
              <span className="text-[#475569]">•</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#1f6feb]/20 text-[#60a5fa] border border-[#1f6feb]/30">
                {cses.length} Entities Enrolled
              </span>
            </div>
            <p className="text-[12px] text-[#94a3b8]">
              Statutory assessment posture, evidence readiness telemetry, and active compliance review management across Critical Sector Entities.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748b] font-mono pt-0.5">
              <span>Environment: <strong className="text-emerald-400">Air-Gapped Enclave (TLS 1.3 / FIPS-140-2)</strong></span>
              <span>•</span>
              <span>Regulatory Standard: <strong className="text-[#cbd5e1]">NCIIPC Guidelines Sec 70B</strong></span>
              <span>•</span>
              <span>Active Cycle: <strong className="text-[#60a5fa]">Q3 2026</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#212c3d]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              title="Synchronize latest assessment status from backend"
            >
              Sync
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => setIsImportModalOpen(true)}
            >
              Import Evidence
            </Button>
          </div>
        </div>
      </div>

      {/* 2. ADVANCED FILTERS TOOLBAR */}
      <div className="bg-[#111622] border border-[#212c3d] rounded-lg p-3.5 mb-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="lg:col-span-2">
            <Input
              icon={<Search className="w-4 h-4 text-[#64748b]" />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search CSE ID, entity name, sector..."
              sizeVariant="sm"
            />
          </div>

          <Select
            sizeVariant="sm"
            value={selectedSector}
            onChange={(e) => {
              setSelectedSector(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Critical Sectors' },
              { value: 'Energy', label: 'Energy / Power' },
              { value: 'Banking', label: 'Banking / Financial Services' },
              { value: 'Telecom', label: 'Telecommunications' },
              { value: 'Transport', label: 'Transportation' },
              { value: 'Government', label: 'Government / Public Sector' },
              { value: 'Healthcare', label: 'Healthcare' },
              { value: 'Information Technology', label: 'IT & Digital Services' },
            ]}
          />

          <Select
            sizeVariant="sm"
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Assessment Cycles' },
              { value: 'Q3 2026', label: 'Q3 2026 (Active)' },
              { value: 'Q2 2026', label: 'Q2 2026' },
              { value: 'Q1 2026', label: 'Q1 2026' },
            ]}
          />

          <Select
            sizeVariant="sm"
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Assessment Statuses' },
              { value: 'Review Required', label: 'Review Required' },
              { value: 'Under Review', label: 'Under Review' },
              { value: 'Monitoring', label: 'Monitoring' },
            ]}
          />
        </div>

        {/* Readiness Categorization Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2.5 border-t border-[#212c3d] gap-2 text-[12px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#8c90a0] font-mono text-[11px]">Evidence Readiness:</span>
            <div className="flex items-center gap-1.5">
              {(['ALL', 'Deficient', 'Acceptable', 'Robust'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedReadiness(r);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-0.5 rounded font-mono text-[11px] transition-colors ${
                    selectedReadiness === r
                      ? 'bg-[#1f6feb] text-white font-semibold'
                      : 'bg-[#0d121a] text-[#c2c6d6] hover:bg-[#212c3d] border border-[#212c3d]'
                  }`}
                >
                  {r === 'ALL' ? 'All' : r === 'Deficient' ? '<80% Deficient' : r === 'Acceptable' ? '80-89% Acceptable' : '≥90% Robust'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#8c90a0]">
              Showing <strong className="text-[#f1f5f9]">{sortedCSEs.length}</strong> matching assessments
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-[11px] text-[#8c90a0] hover:text-[#f1f5f9] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. ASSESSMENT DATA TABLE / EMPTY / ERROR / LOADING STATES */}
      {isLoading && cses.length === 0 ? (
        <LoadingState message="Loading Critical Sector Entity assessments and evidence telemetry..." />
      ) : loadError ? (
        <ErrorState
          title="Failed to Load CSE Assessments"
          message={loadError}
          onRetry={handleRefresh}
        />
      ) : sortedCSEs.length === 0 ? (
        <EmptyState
          title="No assessments available"
          description={
            searchTerm || selectedSector !== 'ALL' || selectedPeriod !== 'ALL' || selectedPriority !== 'ALL' || selectedStatus !== 'ALL' || selectedReadiness !== 'ALL'
              ? "No assessments match the current filter criteria. Clear filters to view all enrolled entities."
              : "No Critical Sector Entities are registered in the current assessment cycle."
          }
          action={
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset All Filters
              </Button>
              <Button variant="primary" size="sm" icon={<Upload className="w-3.5 h-3.5" />} onClick={() => setIsImportModalOpen(true)}>
                Import Evidence
              </Button>
            </div>
          }
        />
      ) : (
        <div className="bg-[#111622] border border-[#212c3d] rounded-lg overflow-hidden shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-[12px] md:text-[13px]">
              <thead>
                <tr className="border-b border-[#212c3d] bg-[#0d121a] text-[11px] font-mono font-medium text-[#8c90a0] uppercase tracking-wider select-none sticky top-0 z-10">
                  <th 
                    onClick={() => handleSort('cseId')}
                    className="px-3.5 py-3 cursor-pointer hover:text-[#f1f5f9] transition-colors"
                    style={{ width: '130px' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>CSE ID</span>
                      {sortField === 'cseId' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#60a5fa]" /> : <ArrowDown className="w-3 h-3 text-[#60a5fa]" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('cseName')}
                    className="px-3.5 py-3 cursor-pointer hover:text-[#f1f5f9] transition-colors"
                    style={{ minWidth: '220px' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>CSE Name & Sector</span>
                      {sortField === 'cseName' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#60a5fa]" /> : <ArrowDown className="w-3 h-3 text-[#60a5fa]" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('period')}
                    className="px-3.5 py-3 cursor-pointer hover:text-[#f1f5f9] transition-colors"
                    style={{ width: '140px' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Cycle / Period</span>
                      {sortField === 'period' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#60a5fa]" /> : <ArrowDown className="w-3 h-3 text-[#60a5fa]" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('supervisoryPriority')}
                    className="px-3.5 py-3 cursor-pointer hover:text-[#f1f5f9] transition-colors"
                    style={{ width: '110px' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Priority</span>
                      {sortField === 'supervisoryPriority' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#60a5fa]" /> : <ArrowDown className="w-3 h-3 text-[#60a5fa]" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('evidenceReadiness')}
                    className="px-3.5 py-3 cursor-pointer hover:text-[#f1f5f9] transition-colors"
                    style={{ width: '180px' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Evidence Readiness</span>
                      {sortField === 'evidenceReadiness' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#60a5fa]" /> : <ArrowDown className="w-3 h-3 text-[#60a5fa]" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('openFindingsCount')}
                    className="px-3.5 py-3 cursor-pointer hover:text-[#f1f5f9] transition-colors text-center"
                    style={{ width: '110px' }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Findings</span>
                      {sortField === 'openFindingsCount' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#60a5fa]" /> : <ArrowDown className="w-3 h-3 text-[#60a5fa]" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('status')}
                    className="px-3.5 py-3 cursor-pointer hover:text-[#f1f5f9] transition-colors"
                    style={{ width: '150px' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Assessment Status</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#60a5fa]" /> : <ArrowDown className="w-3 h-3 text-[#60a5fa]" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('lastSubmission')}
                    className="px-3.5 py-3 cursor-pointer hover:text-[#f1f5f9] transition-colors"
                    style={{ width: '150px' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Last Updated</span>
                      {sortField === 'lastSubmission' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#60a5fa]" /> : <ArrowDown className="w-3 h-3 text-[#60a5fa]" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </th>

                  <th className="px-3.5 py-3 text-right" style={{ width: '90px' }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#212c3d] text-[#dfe2eb]">
                {paginatedCSEs.map((cse, idx) => {
                  const isRobust = cse.evidenceReadiness >= 90;
                  const isAcceptable = cse.evidenceReadiness >= 80 && cse.evidenceReadiness < 90;
                  const barColor = isRobust ? 'bg-emerald-400' : isAcceptable ? 'bg-amber-400' : 'bg-rose-500';

                  return (
                    <tr
                      key={cse.cseId || idx}
                      onClick={() => handleRowClick(cse)}
                      className="h-14 hover:bg-[#0d121a] cursor-pointer transition-colors group"
                    >
                      {/* CSE ID */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <span className="font-mono text-[12px] font-bold text-[#60a5fa] px-2 py-0.5 rounded bg-[#111622] border border-[#212c3d] group-hover:border-[#3b82f6]/50 transition-colors">
                          {cse.cseId}
                        </span>
                      </td>

                      {/* CSE Name & Sector */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-semibold text-[#f1f5f9] text-[13px] truncate group-hover:text-[#60a5fa] transition-colors">
                            {cse.cseName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#8c90a0] font-mono mt-0.5 truncate">
                            <span className="text-[#cbd5e1]">{cse.sector}</span>
                            <span>•</span>
                            <span>{cse.organizationType || cse.socType || 'Critical Entity'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Assessment Cycle / Period */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <div className="flex flex-col font-mono text-[11px]">
                          <span className="text-[#f1f5f9] font-medium">
                            {cse.period || 'Q3 2026'}
                          </span>
                          <span className="text-[#64748b] text-[10px] truncate">
                            {cse.assessmentPeriod || 'Annual Mandatory'}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <PriorityBadge priority={cse.supervisoryPriority} />
                      </td>

                      {/* Evidence Readiness */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="font-bold text-[#f1f5f9]">{cse.evidenceReadiness}%</span>
                            <span className={`text-[10px] ${isRobust ? 'text-emerald-400' : isAcceptable ? 'text-amber-400' : 'text-rose-400'}`}>
                              {cse.readinessCategory || (isRobust ? 'Robust' : isAcceptable ? 'Acceptable' : 'Deficient')}
                            </span>
                          </div>
                          <div className="w-full bg-[#0d121a] h-1.5 rounded-full overflow-hidden border border-[#212c3d]">
                            <div 
                              className={`h-full ${barColor}`}
                              style={{ width: `${Math.min(100, Math.max(0, cse.evidenceReadiness))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Findings */}
                      <td className="px-3.5 py-2.5 align-middle text-center">
                        <div className="inline-flex items-center justify-center font-mono text-[12px] font-bold px-2 py-0.5 rounded bg-[#0d121a] border border-[#212c3d] text-[#f1f5f9]">
                          {cse.openFindingsCount}
                          {cse.criticalFindingsCount > 0 && (
                            <span className="ml-1 text-[10px] text-rose-400 font-normal">
                              ({cse.criticalFindingsCount} crit)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Assessment Status */}
                      <td className="px-3.5 py-2.5 align-middle">
                        {renderAssessmentStatusBadge(cse.status)}
                      </td>

                      {/* Last Updated */}
                      <td className="px-3.5 py-2.5 align-middle font-mono text-[11px] text-[#8c90a0]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#64748b]" />
                          <span>{cse.lastSubmission || '26 Sep 2026'}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-3.5 py-2.5 align-middle text-right">
                        <span className="text-[12px] text-[#60a5fa] font-mono inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. PAGINATION FOOTER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-t border-[#212c3d] bg-[#0d121a] gap-2.5">
            <div className="text-[11px] font-mono text-[#8c90a0]">
              Showing <strong className="text-[#f1f5f9]">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-[#f1f5f9]">{Math.min(currentPage * pageSize, sortedCSEs.length)}</strong> of{' '}
              <strong className="text-[#f1f5f9]">{sortedCSEs.length}</strong> entries
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-[11px] font-mono text-[#64748b]">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#111622] text-[#cbd5e1] font-mono text-[11px] px-2 py-1 rounded border border-[#212c3d] focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-[#111622] border border-[#212c3d] text-[#c2c6d6] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-[11px] font-mono px-2 text-[#cbd5e1]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded bg-[#111622] border border-[#212c3d] text-[#c2c6d6] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. IMPORT EVIDENCE MODAL (Preserved Existing Action) */}
      <ImportEvidenceModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </PageContainer>
  );
};
