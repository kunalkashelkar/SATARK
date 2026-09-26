import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockCSEs } from '@/data/mock/cses';
import { CSEAssessment } from '@/types';

export const CSEAssessmentsListPage: React.FC = () => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedReadiness, setSelectedReadiness] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSignal, setSelectedSignal] = useState('ALL');
  const [showReviewRequiredOnly, setShowReviewRequiredOnly] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState<keyof CSEAssessment>('supervisoryPriority');
  const [sortAsc, setSortAsc] = useState(false);

  // Expanded Rows State
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    'CSE-014': true // Default expanded as in Stitch design
  });

  const toggleExpand = (cseId: string) => {
    setExpandedRows(prev => ({ ...prev, [cseId]: !prev[cseId] }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSector('ALL');
    setSelectedPriority('ALL');
    setSelectedReadiness('ALL');
    setSelectedStatus('ALL');
    setSelectedSignal('ALL');
    setShowReviewRequiredOnly(false);
  };

  // Filter & Sort Logic
  const filteredCSEs = useMemo(() => {
    return mockCSEs.filter(cse => {
      // Review required pill filter
      if (showReviewRequiredOnly && cse.status !== 'Review Required') return false;

      // Text search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match = cse.cseId.toLowerCase().includes(q) ||
                      cse.cseName.toLowerCase().includes(q) ||
                      cse.sector.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Sector filter
      if (selectedSector !== 'ALL' && cse.sector !== selectedSector) return false;

      // Priority filter
      if (selectedPriority !== 'ALL' && cse.supervisoryPriority !== selectedPriority) return false;

      // Readiness category filter
      if (selectedReadiness !== 'ALL' && cse.readinessCategory !== selectedReadiness) return false;

      // Status filter
      if (selectedStatus !== 'ALL' && cse.status !== selectedStatus) return false;

      // Signal filter
      if (selectedSignal === 'gap' && cse.executionGapsCount === 0) return false;
      if (selectedSignal === 'negative' && cse.negativeSpaceCount === 0) return false;
      if (selectedSignal === 'deviation' && cse.processDeviationsCount === 0) return false;

      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === valB) return 0;
      if (valA === undefined) return 1;
      if (valB === undefined) return -1;
      const res = valA > valB ? 1 : -1;
      return sortAsc ? res : -res;
    });
  }, [searchTerm, selectedSector, selectedPriority, selectedReadiness, selectedStatus, selectedSignal, showReviewRequiredOnly, sortField, sortAsc]);

  const handleSort = (field: keyof CSEAssessment) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2eb] pb-12">
      {/* PAGE HEADER & ACTION BAR */}
      <section className="py-4 border-b-0 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Breadcrumb + Title combo */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#c2c6d6]">
              <Link to="/overview" className="hover:text-[#afc6ff] transition-colors">SAT-SA</Link>
              <span className="text-[#8c90a0]">/</span>
              <span className="text-[#c2c6d6]">Supervision</span>
              <span className="text-[#8c90a0]">/</span>
              <span className="text-[#afc6ff] font-medium">CSE Assessments</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#dfe2eb]">CSE Assessments</h1>
              <span className="px-2 py-0.5 rounded bg-[#262a31] font-mono text-xs text-[#7bdb80] font-medium">
                CYCLE: ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#c2c6d6] max-w-3xl">
              Review assessment status, evidence readiness, supervisory signals, findings, and remediation across Critical Sector Entities (CSEs).
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Period Selector */}
            <div className="flex items-center bg-[#1c2026] px-3 py-1.5 rounded text-[#dfe2eb] font-mono text-xs gap-1.5 shadow-sm border border-[#262a31]">
              <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">calendar_month</span>
              <span className="font-medium text-[#dfe2eb]">Q3 2026</span>
              <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">expand_more</span>
            </div>

            {/* Export Dropdown Button */}
            <button 
              type="button"
              onClick={() => alert('Exporting assessment dossier summary (CSV/JSON)...')}
              className="flex items-center gap-1 bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-sm border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[16px] text-[#c2c6d6]">ios_share</span>
              <span>Export</span>
            </button>

            {/* Sync Timestamp */}
            <div className="flex items-center gap-1.5 bg-[#181c22] px-3 py-1.5 rounded border border-[#262a31]">
              <button 
                type="button" 
                onClick={() => alert('Synchronizing operational evidence snapshots across entities...')}
                className="text-[#c2c6d6] hover:text-[#afc6ff] transition-colors" 
                title="Sync data"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
              </button>
              <span className="font-mono text-[11px] text-[#8c90a0] whitespace-nowrap">
                Last synced: 26 Sep 2026, 20:45 IST
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: SUMMARY STRIP (KPI DENSE BANNER) */}
      <section className="mt-2 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 bg-[#181c22] p-1 rounded-xl shadow-sm border border-[#262a31]">
          {/* Total CSEs */}
          <div className="bg-[#1c2026] px-4 py-2.5 rounded flex flex-col justify-between">
            <span className="text-[11px] text-[#c2c6d6] uppercase tracking-wider font-semibold">Total CSEs</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-2xl font-bold text-[#dfe2eb]">10</span>
              <span className="font-mono text-xs text-[#8c90a0]">Registered</span>
            </div>
          </div>

          {/* Assessed */}
          <div className="bg-[#1c2026] px-4 py-2.5 rounded flex flex-col justify-between">
            <span className="text-[11px] text-[#c2c6d6] uppercase tracking-wider font-semibold">Assessed Cycle</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-2xl font-bold text-[#afc6ff]">8</span>
              <span className="font-mono text-xs text-[#7bdb80] font-medium">80% In-Scope</span>
            </div>
          </div>

          {/* Review Required */}
          <div className="bg-[#1c2026] px-4 py-2.5 rounded flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#c2c6d6] uppercase tracking-wider font-semibold">Review Required</span>
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-2xl font-bold text-[#ffb4ab]">6</span>
              <span className="font-mono text-xs text-[#c2c6d6]">Actionable</span>
            </div>
          </div>

          {/* Evidence Ready */}
          <div className="bg-[#1c2026] px-4 py-2.5 rounded flex flex-col justify-between">
            <span className="text-[11px] text-[#c2c6d6] uppercase tracking-wider font-semibold">Evidence Ready</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-2xl font-bold text-[#7bdb80]">6</span>
              <span className="font-mono text-xs text-[#8c90a0]">≥75% Complete</span>
            </div>
          </div>

          {/* High Priority */}
          <div className="bg-[#1c2026] px-4 py-2.5 rounded flex flex-col justify-between">
            <span className="text-[11px] text-[#c2c6d6] uppercase tracking-wider font-semibold">High Priority</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-2xl font-bold text-[#ffb693]">3</span>
              <span className="font-mono text-[10px] text-[#ffb693]">014, 007, 021</span>
            </div>
          </div>

          {/* Open Findings */}
          <div className="bg-[#1c2026] px-4 py-2.5 rounded flex flex-col justify-between">
            <span className="text-[11px] text-[#c2c6d6] uppercase tracking-wider font-semibold">Open Findings</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-2xl font-bold text-[#dfe2eb]">40</span>
              <span className="font-mono text-xs text-[#ffb4ab]">1 Overdue</span>
            </div>
          </div>
        </div>

        {/* Quick Filter Control Row */}
        <div className="flex items-center justify-between mt-1 px-1">
          <button
            type="button"
            onClick={() => setShowReviewRequiredOnly(!showReviewRequiredOnly)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase font-semibold transition-all shadow-sm border ${
              showReviewRequiredOnly
                ? 'bg-[#1f6feb] text-white border-[#afc6ff]'
                : 'bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] border-[#424754]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
            <span>Show Review Required Only (6)</span>
            <span className="material-symbols-outlined text-[14px]">filter_list</span>
          </button>
          <span className="font-mono text-[11px] text-[#8c90a0]">
            Threshold: Evidence sufficiency strictly evaluated under ISO/IEC 27001 & NCIIPC SOP-04
          </span>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE FILTER & SEARCH BAR */}
      <section className="bg-[#181c22] p-2.5 rounded-xl mb-4 shadow-sm border border-[#262a31]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8c90a0]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by CSE ID, entity name, or sector..."
              className="w-full bg-[#1c2026] pl-9 pr-8 py-1.5 rounded text-xs text-[#dfe2eb] placeholder:text-[#8c90a0] focus:outline-none focus:bg-[#31353c] transition-colors border border-[#262a31]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c90a0] hover:text-[#dfe2eb]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Sector Filter */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-[#1c2026] text-[#dfe2eb] text-xs px-2.5 py-1.5 rounded focus:outline-none border border-[#262a31] cursor-pointer"
          >
            <option value="ALL">All Sectors</option>
            <option value="Energy">Energy</option>
            <option value="Banking">Banking</option>
            <option value="Telecom">Telecom</option>
            <option value="Transport">Transport</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-[#1c2026] text-[#dfe2eb] text-xs px-2.5 py-1.5 rounded focus:outline-none border border-[#262a31] cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Readiness Filter */}
          <select
            value={selectedReadiness}
            onChange={(e) => setSelectedReadiness(e.target.value)}
            className="bg-[#1c2026] text-[#dfe2eb] text-xs px-2.5 py-1.5 rounded focus:outline-none border border-[#262a31] cursor-pointer"
          >
            <option value="ALL">All Readiness</option>
            <option value="Deficient">Deficient (&lt;75%)</option>
            <option value="Acceptable">Acceptable (75-89%)</option>
            <option value="Robust">Robust (≥90%)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#1c2026] text-[#dfe2eb] text-xs px-2.5 py-1.5 rounded focus:outline-none border border-[#262a31] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Review Required">Review Required</option>
            <option value="Under Review">Under Review</option>
            <option value="Monitoring">Monitoring</option>
          </select>

          {/* Signal Filter */}
          <select
            value={selectedSignal}
            onChange={(e) => setSelectedSignal(e.target.value)}
            className="bg-[#1c2026] text-[#dfe2eb] text-xs px-2.5 py-1.5 rounded focus:outline-none border border-[#262a31] cursor-pointer"
          >
            <option value="ALL">All Signals</option>
            <option value="gap">Has Execution Gaps</option>
            <option value="negative">Has Negative Space</option>
            <option value="deviation">Has Deviations</option>
          </select>

          {/* Clear Filter */}
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[#8c90a0] hover:text-[#dfe2eb] hover:bg-[#1c2026] text-xs transition-colors border border-transparent hover:border-[#262a31]"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Clear</span>
          </button>

          {/* Results Count Badge */}
          <div className="ml-auto flex items-center gap-1.5 bg-[#1c2026] px-3 py-1 rounded border border-[#262a31]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7bdb80]"></span>
            <span className="font-mono text-xs text-[#c2c6d6] font-medium">
              Showing {filteredCSEs.length} of {mockCSEs.length} assessed entities
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 3: MAIN CSE ASSESSMENT TABLE */}
      <section className="bg-[#181c22] rounded-xl overflow-hidden shadow-md border border-[#262a31]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1c2026] text-[#c2c6d6] uppercase tracking-wider text-[11px] font-semibold select-none border-b border-[#262a31]">
                <th 
                  onClick={() => handleSort('cseId')}
                  className="py-2.5 px-4 cursor-pointer hover:text-[#dfe2eb] transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Entity (ID / Name)</span>
                    <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('sector')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#dfe2eb] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Sector</span>
                    <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                  </div>
                </th>
                <th className="py-2.5 px-3">Period</th>
                <th 
                  onClick={() => handleSort('evidenceReadiness')}
                  className="py-2.5 px-4 cursor-pointer hover:text-[#dfe2eb] transition-colors min-w-[150px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Evidence Readiness</span>
                    <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('supervisoryPriority')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#dfe2eb] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center" title="Execution Gaps detected">Execution Gap</th>
                <th className="py-2.5 px-3 text-center" title="Negative Space candidates detected">Negative Space</th>
                <th className="py-2.5 px-3 text-center" title="Process deviations identified">Deviation</th>
                <th 
                  onClick={() => handleSort('openFindingsCount')}
                  className="py-2.5 px-3 text-center cursor-pointer hover:text-[#dfe2eb]"
                >
                  Findings
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap">Remediation</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a31]">
              {filteredCSEs.map((cse) => {
                const isExpanded = !!expandedRows[cse.cseId];
                const isCritical = cse.supervisoryPriority === 'CRITICAL';
                const isHigh = cse.supervisoryPriority === 'HIGH';
                const isDeficient = cse.readinessCategory === 'Deficient';

                return (
                  <React.Fragment key={cse.id}>
                    <tr 
                      className={`hover:bg-[#1c2026] transition-colors group cursor-pointer ${
                        isExpanded ? 'bg-[#1c2026]/60' : 'bg-[#181c22]'
                      }`}
                      onClick={() => toggleExpand(cse.cseId)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`material-symbols-outlined text-[18px] text-[#8c90a0] group-hover:text-[#afc6ff] transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-[#afc6ff]' : ''
                          }`}>
                            expand_circle_down
                          </span>
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-bold text-[#afc6ff] group-hover:underline">
                              {cse.cseId}
                            </span>
                            <span className="text-[12px] text-[#dfe2eb] font-medium truncate max-w-[200px]">
                              {cse.cseName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[#c2c6d6] font-mono text-xs">
                          <span className="material-symbols-outlined text-[15px] text-[#ffb693]">
                            {cse.sector === 'Energy' ? 'bolt' : cse.sector === 'Banking' ? 'account_balance' : 'router'}
                          </span>
                          <span>{cse.sector}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-xs text-[#8c90a0] whitespace-nowrap">
                        {cse.period}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className={`font-bold ${isDeficient ? 'text-[#ffb4ab]' : 'text-[#7bdb80]'}`}>
                              {cse.evidenceReadiness}%
                            </span>
                            <span className={`uppercase text-[10px] tracking-wider font-semibold ${
                              isDeficient ? 'text-[#ffb4ab]' : 'text-[#7bdb80]'
                            }`}>
                              {cse.readinessCategory}
                            </span>
                          </div>
                          <div className="w-full bg-[#31353c] h-1.5 rounded-full overflow-hidden flex">
                            <div 
                              className={`h-full rounded-full ${isDeficient ? 'bg-[#ffb4ab]' : 'bg-[#7bdb80]'}`}
                              style={{ width: `${cse.evidenceReadiness}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide font-mono ${
                          isCritical
                            ? 'bg-[#93000a] text-[#ffdad6]'
                            : isHigh
                            ? 'bg-[#c55100]/40 text-[#ffb693]'
                            : 'bg-[#262a31] text-[#c2c6d6]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isCritical ? 'bg-[#ffb4ab] animate-pulse' : isHigh ? 'bg-[#ffb693]' : 'bg-[#c2c6d6]'
                          }`} />
                          {cse.supervisoryPriority}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <Link
                          to="/analytics/execution-gaps"
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded font-mono text-xs font-bold transition-colors ${
                            cse.executionGapsCount > 0 
                              ? 'bg-[#1c2026] text-[#ffb4ab] hover:bg-[#ffb4ab] hover:text-[#690005]'
                              : 'text-[#8c90a0]'
                          }`}
                        >
                          {cse.executionGapsCount}
                        </Link>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <Link
                          to="/analytics/negative-space"
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded font-mono text-xs font-bold transition-colors ${
                            cse.negativeSpaceCount > 0 
                              ? 'bg-[#1c2026] text-[#ffb693] hover:bg-[#ffb693] hover:text-[#561f00]'
                              : 'text-[#8c90a0]'
                          }`}
                        >
                          {cse.negativeSpaceCount}
                        </Link>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <Link
                          to="/analytics/process-analysis"
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded font-mono text-xs font-bold transition-colors ${
                            cse.processDeviationsCount > 0 
                              ? 'bg-[#1c2026] text-[#afc6ff] hover:bg-[#afc6ff] hover:text-[#002d6d]'
                              : 'text-[#8c90a0]'
                          }`}
                        >
                          {cse.processDeviationsCount}
                        </Link>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <Link
                          to="/findings"
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-xs font-bold text-[#dfe2eb] hover:text-[#afc6ff] hover:underline"
                        >
                          {cse.openFindingsCount}
                        </Link>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono text-xs text-[#c2c6d6]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb693]"></span>
                          <span>{cse.remediationCount} Active</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono border ${
                          cse.status === 'Review Required'
                            ? 'bg-[#93000a]/20 text-[#ffb4ab] border-[#ffb4ab]/30'
                            : cse.status === 'Under Review'
                            ? 'bg-[#c55100]/20 text-[#ffb693] border-[#ffb693]/30'
                            : 'bg-[#262a31] text-[#c2c6d6] border-[#424754]'
                        }`}>
                          {cse.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/supervision/cse-assessments/${cse.cseId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#1f6feb] hover:bg-[#1f6feb]/90 text-white rounded font-medium text-xs transition-colors shadow-sm"
                        >
                          <span>Inspect</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>

                    {/* EXPANDABLE SUPERVISORY PROFILE DRAWER */}
                    {isExpanded && (
                      <tr className="bg-[#10141a] border-b border-[#262a31]">
                        <td colSpan={12} className="p-4 pl-12">
                          <div className="bg-[#181c22] rounded-lg p-4 border border-[#262a31] space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262a31] pb-3">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#afc6ff] text-[20px]">troubleshoot</span>
                                <span className="font-semibold text-xs text-[#dfe2eb] uppercase tracking-wider">
                                  Supervisory Signal Synthesis & Capability Discrepancy — {cse.cseId}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/20">
                                  Discrepancy: {cse.capabilityDiscrepancyCount} Controls Flagged
                                </span>
                                <Link
                                  to={`/supervision/cse-assessments/${cse.cseId}`}
                                  className="text-xs text-[#afc6ff] hover:underline flex items-center gap-0.5 font-medium"
                                >
                                  Open Comprehensive Dossier <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                </Link>
                              </div>
                            </div>

                            {/* Discrepancy Breakdown Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              {/* Claimed vs Observed */}
                              <div className="p-3 bg-[#1c2026] rounded border border-[#262a31] space-y-2">
                                <span className="text-[10px] text-[#8c90a0] uppercase font-semibold block">
                                  Capability Verification
                                </span>
                                <div className="flex items-center justify-between font-mono">
                                  <span className="text-[#c2c6d6]">Claimed Controls:</span>
                                  <span className="font-bold text-[#dfe2eb]">{cse.claimedCapability}</span>
                                </div>
                                <div className="flex items-center justify-between font-mono">
                                  <span className="text-[#c2c6d6]">Evidence-Backed Observed:</span>
                                  <span className="font-bold text-[#ffb4ab]">{cse.observedCapability}</span>
                                </div>
                                <div className="pt-1 border-t border-[#262a31] text-[11px] text-[#ffb693] font-mono">
                                  Capability Discrepancy: {cse.claimedCapability - cse.observedCapability} controls lack operational proof
                                </div>
                              </div>

                              {/* Signals Summary */}
                              <div className="p-3 bg-[#1c2026] rounded border border-[#262a31] space-y-1.5 md:col-span-2">
                                <span className="text-[10px] text-[#8c90a0] uppercase font-semibold block">
                                  Primary Supervisory Signals Identified
                                </span>
                                <div className="space-y-1">
                                  {cse.signalsSummary.map((sig, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#c2c6d6]">
                                      <span className="material-symbols-outlined text-[14px] text-[#ffb4ab] shrink-0 mt-0.5">warning</span>
                                      <span>{sig}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Quick Action Navigation links */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                              <span className="text-[#8c90a0]">Drill down:</span>
                              <Link to="/findings/FND-0142" className="px-2 py-0.5 rounded bg-[#262a31] text-[#afc6ff] hover:bg-[#31353c] transition-colors">
                                Finding FND-0142 (CTRL-07) →
                              </Link>
                              <Link to="/analytics/execution-gaps" className="px-2 py-0.5 rounded bg-[#262a31] text-[#ffb4ab] hover:bg-[#31353c] transition-colors">
                                Execution Gap GAP-0071 →
                              </Link>
                              <Link to="/analytics/negative-space" className="px-2 py-0.5 rounded bg-[#262a31] text-[#ffb693] hover:bg-[#31353c] transition-colors">
                                Negative Space NS-0041 →
                              </Link>
                              <Link to="/evidence" className="px-2 py-0.5 rounded bg-[#262a31] text-[#7bdb80] hover:bg-[#31353c] transition-colors">
                                Source Records (EVD-742, EVD-761) →
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
