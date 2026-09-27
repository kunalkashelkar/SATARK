import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { CSEAssessment } from '@/types';
import { Search, RotateCcw, ArrowRight } from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  FilterBar,
  Input,
  Select,
  DataTable,
  Column,
  StatusBadge,
  Button
} from '@/components/common';

export const CSEAssessmentsListPage: React.FC = () => {
  const { cses, setActiveCseId } = useSupervisory();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedReadiness, setSelectedReadiness] = useState('ALL');

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSector('ALL');
    setSelectedPeriod('ALL');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setSelectedReadiness('ALL');
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
          cse.primarySignal.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedSector !== 'ALL' && cse.sector !== selectedSector) return false;
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

  const handleRowClick = (cse: CSEAssessment) => {
    setActiveCseId(cse.cseId);
    navigate(`/assessments/${cse.cseId}`);
  };

  const columns: Column<CSEAssessment>[] = [
    {
      header: 'Entity / CSE',
      width: '260px',
      cell: (cse) => (
        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-[12px] text-[#afc6ff]">
              {cse.cseId}
            </span>
            <span className="text-[11px] text-[#8c90a0]">·</span>
            <span className="text-[12px] font-semibold text-[#dfe2eb] truncate">
              {cse.cseName}
            </span>
          </div>
          <span className="text-[11px] text-[#8c90a0] font-mono mt-0.5">
            Period: {cse.period}
          </span>
        </div>
      ),
    },
    {
      header: 'Sector',
      width: '130px',
      cell: (cse) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#1c2026] text-[#c2c6d6] border border-[#262a31]">
          {cse.sector}
        </span>
      ),
    },
    {
      header: 'Priority',
      width: '110px',
      cell: (cse) => <StatusBadge status={cse.supervisoryPriority} />,
    },
    {
      header: 'Evidence Readiness',
      width: '170px',
      cell: (cse) => {
        const isRobust = cse.evidenceReadiness >= 90;
        const isAcceptable = cse.evidenceReadiness >= 80 && cse.evidenceReadiness < 90;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-[#10141a] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isRobust ? 'bg-[#7bdb80]' : isAcceptable ? 'bg-[#eab308]' : 'bg-[#ef4444]'}`}
                style={{ width: `${cse.evidenceReadiness}%` }}
              />
            </div>
            <span className="font-mono text-[12px] font-semibold text-[#dfe2eb]">
              {cse.evidenceReadiness}%
            </span>
          </div>
        );
      },
    },
    {
      header: 'Primary Signal',
      width: '220px',
      cell: (cse) => (
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-medium text-[#ffb693] font-mono truncate">
            {cse.primarySignal}
          </span>
          <span className="text-[11px] text-[#8c90a0] truncate">
            {cse.openFindingsCount} Findings Detected
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      width: '140px',
      cell: (cse) => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono uppercase border ${
          cse.status === 'Review Required' 
            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            : cse.status === 'Under Review'
            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            cse.status === 'Review Required' ? 'bg-rose-400 animate-pulse' : cse.status === 'Under Review' ? 'bg-amber-400' : 'bg-emerald-400'
          }`} />
          <span>{cse.status}</span>
        </span>
      ),
    },
    {
      header: 'Action',
      width: '100px',
      className: 'text-right',
      headerClassName: 'text-right',
      cell: () => (
        <div className="flex items-center justify-end">
          <span className="text-[12px] text-[#afc6ff] font-mono flex items-center gap-1 hover:underline">
            <span>Inspect</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 1. STANDARD PAGE HEADER */}
      <PageHeader
        title="CSE Assessments"
        description="Comprehensive portfolio of Critical Sector Entities under active supervisory assessment."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#8c90a0] bg-[#181c22] px-3 py-1.5 rounded-md border border-[#262a31]">
              Showing <strong className="text-[#dfe2eb]">{filteredCSEs.length}</strong> of {cses.length} Entities
            </span>
          </div>
        }
      />

      {/* 2. STANDARDIZED FILTER TOOLBAR */}
      <div className="p-3.5 rounded-lg bg-[#181c22] border border-[#262a31] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="lg:col-span-2">
            <Input
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by CSE ID, name, sector..."
              sizeVariant="sm"
            />
          </div>

          <Select
            sizeVariant="sm"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Sectors' },
              { value: 'Energy', label: 'Energy' },
              { value: 'Banking', label: 'Banking' },
              { value: 'Telecom', label: 'Telecom' },
              { value: 'Transport', label: 'Transport' },
            ]}
          />

          <Select
            sizeVariant="sm"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Periods' },
              { value: 'Q3 2026', label: 'Q3 2026 (Active)' },
              { value: 'Q2 2026', label: 'Q2 2026' },
              { value: 'Q1 2026', label: 'Q1 2026' },
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
              { value: 'Review Required', label: 'Review Required' },
              { value: 'Under Review', label: 'Under Review' },
              { value: 'Monitoring', label: 'Monitoring' },
            ]}
          />
        </div>

        {/* Readiness Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-[#262a31] gap-2 text-[12px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#8c90a0] font-mono text-[11px]">Readiness Filter:</span>
            <div className="flex items-center gap-1">
              {(['ALL', 'Deficient', 'Acceptable', 'Robust'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedReadiness(r)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${
                    selectedReadiness === r
                      ? 'bg-[#1f6feb] text-white font-bold'
                      : 'bg-[#14181f] text-[#c2c6d6] hover:bg-[#262a31] border border-[#262a31]'
                  }`}
                >
                  {r === 'ALL' ? 'All' : r === 'Deficient' ? '<80% Deficient' : r === 'Acceptable' ? '80-89% Acceptable' : '≥90% Robust'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-[11px] text-[#8c90a0] hover:text-[#dfe2eb] transition-colors self-end sm:self-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* 3. STANDARDIZED DATA TABLE */}
      <DataTable<CSEAssessment>
        columns={columns}
        data={filteredCSEs}
        keyExtractor={(cse) => cse.cseId}
        onRowClick={handleRowClick}
        emptyMessage="No Critical Sector Entities match the current filters."
      />
    </PageContainer>
  );
};
