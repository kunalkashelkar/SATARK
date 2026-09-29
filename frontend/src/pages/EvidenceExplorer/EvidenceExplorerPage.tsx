import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { MockEvidenceRecord } from '@/data/mock/evidence';
import {
  Search,
  RotateCcw,
  Key,
  Clock,
  FileText,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Upload,
  ArrowRight,
  Layers,
  AlertTriangle,
  Database,
  Building2,
  Copy,
  Check,
  Eye,
  Filter,
  Activity,
  Workflow,
  ShieldAlert,
  Hash,
  Shield,
  FileCheck2,
  History,
  FileCode,
  FolderGit2
} from 'lucide-react';
import { ImportEvidenceModal } from '@/components/evidence/ImportEvidenceModal';
import { StatusBadge, Button, PageContainer, PageHeader } from '@/components/common';

export const EvidenceExplorerPage: React.FC = () => {
  const { evidence, cses, findings, setActiveFindingId, setActiveCseId } = useSupervisory();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters State
  const [filterEvidenceId, setFilterEvidenceId] = useState('');
  const [filterCse, setFilterCse] = useState(searchParams.get('cseId') || 'ALL');
  const [filterSource, setFilterSource] = useState('ALL');
  const [filterEvidenceType, setFilterEvidenceType] = useState(searchParams.get('category') || 'ALL');
  const [filterControl, setFilterControl] = useState('ALL');
  const [filterDate, setFilterDate] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'ALL');
  const [filterFinding, setFilterFinding] = useState(searchParams.get('findingId') || 'ALL');
  const [filterSignal, setFilterSignal] = useState('ALL');

  // Selected evidence record for the right-hand inspection panel
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(() => {
    return searchParams.get('evidenceId') || 'EV-1042';
  });

  const [copiedHash, setCopiedHash] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Sync incoming URL parameters on mount / changes
  useEffect(() => {
    const eid = searchParams.get('evidenceId');
    if (eid) setSelectedEvidenceId(eid);

    const cseParam = searchParams.get('cseId');
    if (cseParam) setFilterCse(cseParam);

    const catParam = searchParams.get('category');
    if (catParam) setFilterEvidenceType(catParam);

    const statParam = searchParams.get('status');
    if (statParam) setFilterStatus(statParam);

    const findParam = searchParams.get('findingId');
    if (findParam) setFilterFinding(findParam);
  }, [searchParams]);

  // Derive unique filter dropdown choices from real data
  const uniqueSources = useMemo(() => {
    const set = new Set<string>();
    evidence.forEach(e => {
      if (e.source) set.add(e.source);
    });
    return Array.from(set).sort();
  }, [evidence]);

  const uniqueEvidenceTypes = useMemo(() => {
    const set = new Set<string>();
    evidence.forEach(e => {
      if (e.recordType) set.add(e.recordType);
    });
    return Array.from(set).sort();
  }, [evidence]);

  const uniqueControls = useMemo(() => {
    const set = new Set<string>();
    findings.forEach(f => {
      if (f.controlId) set.add(f.controlId);
    });
    return Array.from(set).sort();
  }, [findings]);

  const uniqueDates = useMemo(() => {
    const set = new Set<string>();
    evidence.forEach(e => {
      if (e.timestampDate) set.add(e.timestampDate);
    });
    return Array.from(set).sort();
  }, [evidence]);

  const uniqueFindingRefs = useMemo(() => {
    const set = new Set<string>();
    evidence.forEach(e => {
      if (e.gapOrFinding) set.add(e.gapOrFinding);
    });
    findings.forEach(f => {
      set.add(f.id);
    });
    return Array.from(set).sort();
  }, [evidence, findings]);

  const uniqueSignals = useMemo(() => {
    const set = new Set<string>();
    findings.forEach(f => {
      if (f.signalType) set.add(f.signalType);
      f.supportingSignals?.forEach(s => set.add(s.type));
    });
    return Array.from(set).sort();
  }, [findings]);

  // Helper to resolve related finding object from finding reference string
  const getRelatedFinding = (gapOrFinding?: string) => {
    if (!gapOrFinding) return undefined;
    const match = gapOrFinding.match(/FND-\d+/i) || gapOrFinding.match(/FG-\d+/i);
    const fid = match ? match[0] : gapOrFinding;
    return findings.find(f => f.id.toLowerCase() === fid.toLowerCase());
  };

  // Helper to extract case docket reference
  const extractCaseId = (caseRef?: string) => {
    if (!caseRef) return null;
    const match = caseRef.match(/CASE-\d+/i);
    return match ? match[0] : null;
  };

  // Filtered Evidence list
  const filteredEvidence = useMemo(() => {
    return evidence.filter(item => {
      // Evidence ID filter
      if (filterEvidenceId.trim()) {
        const query = filterEvidenceId.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(query) || (item.submissionId && item.submissionId.toLowerCase().includes(query));
        if (!matchesId) return false;
      }

      // CSE Filter
      if (filterCse !== 'ALL' && item.cseId.toLowerCase() !== filterCse.toLowerCase()) {
        return false;
      }

      // Source Filter
      if (filterSource !== 'ALL' && item.source !== filterSource) {
        return false;
      }

      // Evidence Type Filter
      if (filterEvidenceType !== 'ALL' && item.recordType !== filterEvidenceType) {
        return false;
      }

      // Status Filter
      if (filterStatus !== 'ALL' && item.status !== filterStatus) {
        return false;
      }

      // Date Filter
      if (filterDate !== 'ALL' && item.timestampDate !== filterDate) {
        return false;
      }

      // Finding Filter
      if (filterFinding !== 'ALL') {
        const hasDirectFinding = item.gapOrFinding && item.gapOrFinding.toLowerCase().includes(filterFinding.toLowerCase());
        const mappedFinding = findings.find(f => f.id.toLowerCase() === filterFinding.toLowerCase() && f.sourceEvidence.some(se => se.recordId.toLowerCase() === item.id.toLowerCase()));
        if (!hasDirectFinding && !mappedFinding) return false;
      }

      // Control Filter
      if (filterControl !== 'ALL') {
        const relFinding = getRelatedFinding(item.gapOrFinding);
        const controlMatch = relFinding?.controlId === filterControl;
        const mappedBySource = findings.some(f => f.controlId === filterControl && f.sourceEvidence.some(se => se.recordId.toLowerCase() === item.id.toLowerCase()));
        if (!controlMatch && !mappedBySource) return false;
      }

      // Signal Filter
      if (filterSignal !== 'ALL') {
        const relFinding = getRelatedFinding(item.gapOrFinding);
        const signalMatch = relFinding && (relFinding.signalType === filterSignal || relFinding.supportingSignals?.some(s => s.type === filterSignal));
        if (!signalMatch) return false;
      }

      return true;
    });
  }, [evidence, filterEvidenceId, filterCse, filterSource, filterEvidenceType, filterStatus, filterDate, filterFinding, filterControl, filterSignal, findings]);

  // Selected Evidence record for detail panel
  const activeRecord = useMemo(() => {
    return evidence.find(e => e.id.toLowerCase() === selectedEvidenceId.toLowerCase()) || filteredEvidence[0] || evidence[0];
  }, [evidence, selectedEvidenceId, filteredEvidence]);

  // Correlated Finding for Active Record
  const activeRelatedFinding = useMemo(() => {
    if (!activeRecord) return undefined;
    return getRelatedFinding(activeRecord.gapOrFinding) || findings.find(f => f.sourceEvidence?.some(se => se.recordId.toLowerCase() === activeRecord.id.toLowerCase()));
  }, [activeRecord, findings]);

  // Copy hash to clipboard
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Reset Filters handler
  const handleResetFilters = () => {
    setFilterEvidenceId('');
    setFilterCse('ALL');
    setFilterSource('ALL');
    setFilterEvidenceType('ALL');
    setFilterControl('ALL');
    setFilterDate('ALL');
    setFilterStatus('ALL');
    setFilterFinding('ALL');
    setFilterSignal('ALL');
    setSearchParams({});
  };

  return (
    <PageContainer>
      <PageHeader
        title="Evidence Explorer"
        subtitle="Telemetric evidence repository and provenance"
        metadata={
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {evidence.length} Records
            </span>
            <span>•</span>
            <span>Enclave: Air-Gapped (TLS 1.3 / FIPS-140-2)</span>
            <span>•</span>
            <span>Digest: SHA-256 Ledger</span>
            <span>•</span>
            <span>Scope: {cses.length} Entities</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Filters
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => setIsImportModalOpen(true)}
            >
              Ingest Evidence
            </Button>
          </div>
        }
      />

      {/* 3-COLUMN PRODUCTION-GRADE EVIDENCE INVESTIGATION WORKSPACE */}
      {/* LEFT (Filters 3 Cols) | CENTER (Evidence Results 5 Cols) | RIGHT (Selected Details 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: FILTERS (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] shadow-sm space-y-3.5">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#212c3d]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#60a5fa]">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-mono text-[#64748b] hover:text-[#f1f5f9] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* 1. Evidence ID Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400">Evidence ID / Submission</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={filterEvidenceId}
                  onChange={(e) => setFilterEvidenceId(e.target.value)}
                  placeholder="e.g. EV-1042, EVD-742..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* 2. CSE Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#64748b]">Critical Sector Entity (CSE)</label>
              <select
                value={filterCse}
                onChange={(e) => setFilterCse(e.target.value)}
                className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="ALL">All CSEs</option>
                {cses.map(cse => (
                  <option key={cse.cseId} value={cse.cseId}>
                    {cse.cseId} — {cse.cseName.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Source Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#64748b]">Evidence Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="ALL">All Sources</option>
                {uniqueSources.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 4. Evidence Type Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#64748b]">Evidence Type</label>
              <select
                value={filterEvidenceType}
                onChange={(e) => setFilterEvidenceType(e.target.value)}
                className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="ALL">All Types</option>
                {uniqueEvidenceTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 5. Control Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#64748b]">Regulatory Control</label>
              <select
                value={filterControl}
                onChange={(e) => setFilterControl(e.target.value)}
                className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="ALL">All Controls</option>
                {uniqueControls.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 6. Date Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#64748b]">Date Timestamp</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="ALL">All Dates</option>
                {uniqueDates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* 7. Status Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#64748b]">Evidence Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">PRESENT (Verified)</option>
                <option value="NOT_SUBMITTED">NOT SUBMITTED (Missing)</option>
                <option value="ABSENT_CONFIRMED">ABSENT CONFIRMED</option>
                <option value="NOT_APPLICABLE">NOT APPLICABLE</option>
                <option value="UNKNOWN">UNKNOWN</option>
              </select>
            </div>

            {/* 8. Finding Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#64748b]">Supervisory Finding</label>
              <select
                value={filterFinding}
                onChange={(e) => setFilterFinding(e.target.value)}
                className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="ALL">All Findings</option>
                {uniqueFindingRefs.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* 9. Signal Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#64748b]">Analytical Signal</label>
              <select
                value={filterSignal}
                onChange={(e) => setFilterSignal(e.target.value)}
                className="w-full h-8 px-2 bg-[#131922] border border-[#212c3d] rounded text-xs text-[#cbd5e1] focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="ALL">All Signal Types</option>
                {uniqueSignals.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Matching Count Footer */}
            <div className="pt-2 border-t border-[#212c3d] text-[11px] font-mono text-[#94a3b8] flex items-center justify-between">
              <span>Matching Artifacts:</span>
              <span className="font-bold text-[#f1f5f9]">{filteredEvidence.length} / {evidence.length}</span>
            </div>

          </div>
        </div>

        {/* CENTER COLUMN: EVIDENCE RESULTS TABLE (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 text-xs font-mono text-[#94a3b8]">
            <div>
              Results: <span className="text-[#f1f5f9] font-bold">{filteredEvidence.length}</span> artifacts
            </div>
            <div className="text-[11px] text-[#64748b]">
              Click row to inspect full dossier
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#212c3d] bg-[#111622] shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0d121c] text-[#94a3b8] font-mono text-[10px] uppercase border-b border-[#212c3d] select-none">
                <tr>
                  <th className="py-2.5 px-3">Evidence ID</th>
                  <th className="py-2.5 px-2.5">Source</th>
                  <th className="py-2.5 px-2">Type</th>
                  <th className="py-2.5 px-2.5">Timestamp</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2">Control</th>
                  <th className="py-2.5 px-3">Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredEvidence.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-mono text-xs">
                      No evidence records match the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvidence.map((item) => {
                    const isSelected = activeRecord && item.id === activeRecord.id;
                    const relFinding = getRelatedFinding(item.gapOrFinding) || findings.find(f => f.sourceEvidence?.some(se => se.recordId.toLowerCase() === item.id.toLowerCase()));
                    const controlRef = relFinding?.controlId || 'CTRL-07';
                    const findingLabel = item.gapOrFinding ? (item.gapOrFinding.split('/')[1]?.trim() || item.gapOrFinding) : relFinding ? relFinding.id : '—';

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedEvidenceId(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-950/40 text-white font-medium border-l-2 border-l-blue-400'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        {/* 1. Evidence ID */}
                        <td className="py-3 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                          {item.id}
                          {item.submissionId && (
                            <div className="text-[10px] text-slate-500 font-normal">
                              {item.submissionId}
                            </div>
                          )}
                        </td>

                        {/* 2. Source */}
                        <td className="py-3 px-2.5 max-w-[130px]">
                          <div className="truncate text-slate-200 font-medium" title={item.source}>
                            {item.source}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate" title={item.entity}>
                            {item.cseId}
                          </div>
                        </td>

                        {/* 3. Type */}
                        <td className="py-3 px-2 whitespace-nowrap font-mono text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                            {item.recordType}
                          </span>
                        </td>

                        {/* 4. Timestamp */}
                        <td className="py-3 px-2.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                          <div>{item.timestampDate || '26 Sep 2026'}</div>
                          <div className="text-[10px] text-slate-500">{item.timestampTime || '09:12 IST'}</div>
                        </td>

                        {/* 5. Status */}
                        <td className="py-3 px-2 whitespace-nowrap">
                          <StatusBadge status={item.status} />
                        </td>

                        {/* 6. Related Control */}
                        <td className="py-3 px-2 whitespace-nowrap font-mono text-[11px]">
                          <span className="text-emerald-400 font-semibold">
                            {controlRef}
                          </span>
                        </td>

                        {/* 7. Related Finding */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                          {item.gapOrFinding || relFinding ? (
                            <span className="text-amber-400 font-bold hover:underline flex items-center gap-1">
                              <span>{findingLabel}</span>
                              <ChevronRight className="w-3 h-3 text-amber-500" />
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED EVIDENCE DETAILS PANEL (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {activeRecord ? (
            <div className="rounded-lg border border-[#212c3d] bg-[#111622] p-4 md:p-5 shadow-sm space-y-4 text-xs font-sans">
              
              {/* DETAIL HEADER */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#212c3d]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-[#60a5fa]">{activeRecord.id}</span>
                    <span className="px-2 py-0.5 rounded bg-[#131922] font-mono text-[10px] uppercase font-bold text-[#cbd5e1] border border-[#212c3d]">
                      {activeRecord.recordType}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-[#f1f5f9] mt-1 leading-snug">
                    {activeRecord.title}
                  </h2>
                  <div className="text-[11px] text-[#94a3b8] mt-0.5 font-mono">
                    CSE: {activeRecord.cseId} ({activeRecord.entity})
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <StatusBadge status={activeRecord.status} />
                </div>
              </div>

              {/* 1. FULL METADATA */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-blue-400 tracking-wider">
                  <Database className="w-3.5 h-3.5" />
                  <span>Full Metadata</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Source System:</span>
                    <span className="text-slate-200">{activeRecord.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ingestion Channel:</span>
                    <span className="text-slate-200">{activeRecord.sourceSink}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submission ID:</span>
                    <span className="text-blue-400 font-bold">{activeRecord.submissionId || 'SUB-014-027'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Case Docket Ref:</span>
                    <span className="text-slate-200 font-semibold">{activeRecord.caseRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="text-slate-300">{activeRecord.timestamp}</span>
                  </div>
                  {activeRecord.gapNote && (
                    <div className="pt-2 border-t border-slate-800 text-slate-400 text-[11px] font-sans italic">
                      "{activeRecord.gapNote}"
                    </div>
                  )}
                </div>
              </div>

              {/* 2. PROVENANCE & VALIDATION */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-emerald-400 tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Provenance & Validation</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Integrity State:</span>
                      <span className="text-emerald-400 font-bold">{activeRecord.integrity || 'VERIFIED (SHA-256)'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Schema Conformity:</span>
                      <span className="text-blue-400 font-bold">{activeRecord.provenance?.schemaVersion || 'OCSF-v1.1.0'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Collector Version:</span>
                    <span className="text-slate-300">{activeRecord.provenance?.collectorVersion || 'sat-collector-v2.8-fips'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Enclave Time:</span>
                    <span className="text-slate-400">{activeRecord.provenance?.enclaveTimestamp || activeRecord.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* 3. CRYPTOGRAPHIC HASH */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
                    <Hash className="w-3.5 h-3.5 text-blue-400" />
                    <span>Cryptographic Digest (SHA-256)</span>
                  </div>
                  <button
                    onClick={() => handleCopyHash(activeRecord.hash)}
                    className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] font-mono text-emerald-400 break-all select-all">
                  {activeRecord.hash}
                </div>
              </div>

              {/* 4. CHAIN OF CUSTODY */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-amber-400 tracking-wider">
                  <History className="w-3.5 h-3.5" />
                  <span>Chain of Custody</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                  {(activeRecord.provenance?.custodyChain || [
                    `${activeRecord.cseId} Submitting Liaison`,
                    'Air-Gap SFTP Ingestion Drop',
                    'NCIIPC Collector Gateway',
                    'Supervisory Enclave Vault'
                  ]).map((node, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] font-mono">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                      <div className="text-slate-300">
                        <span className="text-slate-500 mr-1.5">Step {idx + 1}:</span>
                        <span>{node}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. CORRELATIONS & CROSS-NAVIGATION: SIGNALS, FINDINGS, CONTROLS, CASE */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-mono uppercase font-bold text-blue-400 tracking-wider">
                  Correlated Entities & Cross-Navigation
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  {/* Evidence → Finding */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase">Related Finding:</span>
                    <div className="mt-1 font-bold text-amber-300">
                      {activeRelatedFinding ? activeRelatedFinding.id : activeRecord.gapOrFinding || 'None'}
                    </div>
                    {activeRelatedFinding ? (
                      <Link
                        to={`/findings?evidenceId=${activeRecord.id}`}
                        onClick={() => setActiveFindingId(activeRelatedFinding.id)}
                        className="mt-2 text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Inspect Finding</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="mt-2 text-[10px] text-slate-600">No active finding link</span>
                    )}
                  </div>

                  {/* Evidence → Control */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase">Related Control:</span>
                    <div className="mt-1 font-bold text-emerald-400">
                      {activeRelatedFinding?.controlId || 'CTRL-07'}
                    </div>
                    <Link
                      to={`/governance/controls`}
                      className="mt-2 text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Control Definition</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Evidence → Signal */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase">Related Signal:</span>
                    <div className="mt-1 font-bold text-purple-300 truncate" title={activeRelatedFinding?.signalType}>
                      {activeRelatedFinding?.signalType ? activeRelatedFinding.signalType.replace(/_/g, ' ') : 'EXECUTION_GAP'}
                    </div>
                    <Link
                      to={`/analysis/execution-gap`}
                      className="mt-2 text-[10px] text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <span>Signal Analysis</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Evidence → Case */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase">Related Case:</span>
                    <div className="mt-1 font-bold text-slate-200">
                      {extractCaseId(activeRecord.caseRef) || 'CASE-1042'}
                    </div>
                    <Link
                      to={`/supervision/cses/${activeRecord.cseId}`}
                      onClick={() => setActiveCseId(activeRecord.cseId)}
                      className="mt-2 text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>CSE Case Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-500 font-mono text-xs">
              Select an evidence item from the results list to view details.
            </div>
          )}
        </div>

      </div>

      {/* IMPORT EVIDENCE MODAL */}
      <ImportEvidenceModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        preselectedCseId={filterCse !== 'ALL' ? filterCse : 'CSE-014'}
      />

    </PageContainer>
  );
};
