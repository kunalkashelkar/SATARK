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
  FileCode,
  Copy,
  Check,
  Eye,
  X,
  Workflow
} from 'lucide-react';
import { ImportEvidenceModal } from '@/components/evidence/ImportEvidenceModal';
import {
  PageContainer,
  PageHeader,
  Card,
  KpiCard,
  Input,
  Select,
  StatusBadge,
  PriorityBadge,
  Button,
  Drawer,
  Timeline
} from '@/components/common';

export const EvidenceExplorerPage: React.FC = () => {
  const { evidence, cses, findings, setActiveFindingId, setActiveCseId } = useSupervisory();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCse, setSelectedCse] = useState(searchParams.get('cseId') || 'ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'ALL');
  const [selectedFinding, setSelectedFinding] = useState(searchParams.get('findingId') || 'ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected item for slide-over drawer
  const [inspectedEvidence, setInspectedEvidence] = useState<MockEvidenceRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'timeline' | 'provenance'>('overview');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Sync URL search params
  useEffect(() => {
    const cseParam = searchParams.get('cseId');
    if (cseParam) setSelectedCse(cseParam);

    const categoryParam = searchParams.get('category');
    if (categoryParam) setSelectedCategory(categoryParam);

    const statusParam = searchParams.get('status');
    if (statusParam) setSelectedStatus(statusParam);

    const findingParam = searchParams.get('findingId');
    if (findingParam) setSelectedFinding(findingParam);
  }, [searchParams]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCse('ALL');
    setSelectedPeriod('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedFinding('ALL');
    setCurrentPage(1);
    setSearchParams({});
  };

  // 1. Dynamic 4 Top Summary Cards (Derived from centralized evidence dataset)
  const summaryCounts = useMemo(() => {
    const totalEvidence = evidence.length;
    const readyEvidence = evidence.filter(e => e.status === 'PRESENT').length;
    const requiresReview = evidence.filter(e => e.gapOrFinding && e.gapOrFinding.length > 0).length;
    const missingOrIncomplete = evidence.filter(e => e.status === 'NOT_SUBMITTED' || e.status === 'ABSENT_CONFIRMED').length;

    return {
      totalEvidence,
      readyEvidence,
      requiresReview,
      missingOrIncomplete
    };
  }, [evidence]);

  // 2. Multi-criteria Filter Logic
  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
      // Search across ID, title, caseRef, entity, cseId, hash, category, finding reference
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.caseRef.toLowerCase().includes(q) ||
          item.entity.toLowerCase().includes(q) ||
          item.cseId.toLowerCase().includes(q) ||
          item.recordType.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          item.hash.toLowerCase().includes(q) ||
          (item.gapOrFinding && item.gapOrFinding.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // CSE Filter
      if (selectedCse !== 'ALL' && item.cseId.toLowerCase() !== selectedCse.toLowerCase()) return false;

      // Period Filter (if provided in record or defaulted to Q3 2026)
      if (selectedPeriod !== 'ALL') {
        const itemPeriod = item.provenance?.enclaveTimestamp ? 'Q3 2026' : 'Q3 2026';
        if (itemPeriod !== selectedPeriod) return false;
      }

      // Category Filter
      if (selectedCategory !== 'ALL' && item.recordType !== selectedCategory) return false;

      // Status Filter
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;

      // Related Finding Filter
      if (selectedFinding !== 'ALL' && (!item.gapOrFinding || !item.gapOrFinding.includes(selectedFinding))) return false;

      return true;
    }).sort((a, b) => {
      // Sort: PRESENT first, then ID
      return a.id.localeCompare(b.id);
    });
  }, [evidence, searchTerm, selectedCse, selectedPeriod, selectedCategory, selectedStatus, selectedFinding]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredEvidence.length / pageSize) || 1;
  const paginatedEvidence = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvidence.slice(start, start + pageSize);
  }, [filteredEvidence, currentPage]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleOpenFinding = (findingRef: string) => {
    // Extract finding ID, e.g. "GAP-0071 / FND-0142" -> "FND-0142"
    const match = findingRef.match(/FND-\d+/i) || findingRef.match(/FG-\d+/i);
    const fid = match ? match[0] : findingRef;
    setActiveFindingId(fid);
    navigate(`/review/${fid}`);
  };

  // Helper: map recordType to human readable label
  const getCategoryLabel = (type: string): string => {
    switch (type) {
      case 'ALERT': return 'Alerts';
      case 'CASE': return 'Cases';
      case 'INVESTIGATION': return 'Investigations';
      case 'ACTION': return 'Actions';
      case 'EVIDENCE': return 'Evidence';
      case 'ESCALATION': return 'Escalations';
      case 'RESPONSE': return 'Responses';
      case 'CLOSURE': return 'Closures';
      case 'ASSET': return 'Assets';
      case 'EXCEPTION': return 'Exceptions';
      case 'REMEDIATION': return 'Remediation';
      default: return type;
    }
  };

  // Construct timeline steps for inspected evidence item
  const getTimelineSteps = (item: MockEvidenceRecord) => {
    return [
      {
        id: '1',
        timestamp: `${item.timestampDate || '26 Sep 2026'}, 09:12 IST`,
        title: 'Telemetry Dropped to Ingestion Gateway',
        description: `Ingested from ${item.source} via air-gapped SFTP drop with initial transport checksum validation.`,
        actor: `${item.cseId} Submitting Liaison`,
        status: 'success' as const
      },
      {
        id: '2',
        timestamp: `${item.timestampDate || '26 Sep 2026'}, 09:14 IST`,
        title: 'Format & Cryptographic Integrity Confirmed',
        description: `SHA-256 computed: ${item.hash.slice(0, 24)}... Hardware root of trust verified.`,
        actor: 'NCIIPC Security Enclave',
        status: 'success' as const
      },
      {
        id: '3',
        timestamp: `${item.timestampDate || '26 Sep 2026'}, 09:15 IST`,
        title: 'Canonical Schema Mapping (OCSF v1.1.0)',
        description: `Normalized into canonical ${getCategoryLabel(item.recordType)} structure with 0 schema violations.`,
        actor: 'SAT-SA Ingestion Engine',
        status: 'success' as const
      },
      {
        id: '4',
        timestamp: `${item.timestampDate || '26 Sep 2026'}, 09:18 IST`,
        title: 'Supervisory Model Correlation & Signal Fusion',
        description: item.gapOrFinding 
          ? `Telemetry compared against Expected Baseline. Identified discrepancy: ${item.gapOrFinding}.` 
          : 'Telemetry correlated with operational baseline. Consistent with normative parameters.',
        actor: 'Supervisory Analytics Engine',
        status: item.gapOrFinding ? ('warning' as const) : ('success' as const)
      }
    ];
  };

  return (
    <PageContainer>
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER (Section 4)                                                */}
      {/* ========================================================================= */}
      <PageHeader
        title="Evidence Explorer"
        description="Review evidence submitted by CSEs and trace it to assessments, controls, findings, and supervisory signals."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#93c5fd] bg-[#182335] px-2.5 py-0.5 rounded border border-[#263750] font-medium">
              Air-Gapped Vault Active
            </span>
            <span className="text-[11px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2.5 py-0.5 rounded border border-[#7bdb80]/30 font-medium">
              FIPS 140-2 Level 3 Verified
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5 text-white" />}
              onClick={() => setIsImportModalOpen(true)}
              className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-medium"
            >
              + Add Evidence
            </Button>
          </div>
        }
      />

      {/* ========================================================================= */}
      {/* 2. SUMMARY CARDS (Section 4: Exactly 4 Compact KPI Cards Matching Overview) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4 min-w-0">
        <KpiCard
          title="Total Evidence"
          value={summaryCounts.totalEvidence}
          subtitle="Artifacts in Supervisory Vault"
          semantic="blue"
          icon={Database}
          onClick={() => setSelectedStatus('ALL')}
        />
        <KpiCard
          title="Ready Evidence"
          value={summaryCounts.readyEvidence}
          subtitle="Schema & Integrity Verified"
          semantic="green"
          icon={CheckCircle2}
          onClick={() => setSelectedStatus('PRESENT')}
        />
        <KpiCard
          title="Requires Review"
          value={summaryCounts.requiresReview}
          subtitle="Linked to Supervisory Signals"
          semantic="amber"
          alert={summaryCounts.requiresReview > 0}
          icon={AlertTriangle}
          onClick={() => setSelectedFinding('FND')}
        />
        <KpiCard
          title="Missing / Incomplete"
          value={summaryCounts.missingOrIncomplete}
          subtitle="Demands / Candidate Voids"
          semantic="red"
          alert={summaryCounts.missingOrIncomplete > 0}
          icon={FileText}
          onClick={() => setSelectedStatus('NOT_SUBMITTED')}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. FILTER BAR (Section 5)                                                 */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <Input
              icon={<Search className="w-4 h-4 text-[#64748b]" />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Evidence ID, File, CSE, Finding..."
              sizeVariant="sm"
            />
          </div>

          {/* CSE Selector */}
          <Select
            sizeVariant="sm"
            value={selectedCse}
            onChange={(e) => {
              setSelectedCse(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All CSEs Portfolio' },
              ...cses.map(c => ({ value: c.cseId, label: `${c.cseId} — ${c.cseName.split(' ')[0]}` }))
            ]}
          />

          {/* Category Selector */}
          <Select
            sizeVariant="sm"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Categories' },
              { value: 'ALERT', label: 'Alerts' },
              { value: 'CASE', label: 'Cases' },
              { value: 'INVESTIGATION', label: 'Investigations' },
              { value: 'ACTION', label: 'Actions' },
              { value: 'EVIDENCE', label: 'Evidence' },
              { value: 'ESCALATION', label: 'Escalations' },
              { value: 'RESPONSE', label: 'Responses' },
              { value: 'CLOSURE', label: 'Closures' },
              { value: 'ASSET', label: 'Assets' },
              { value: 'EXCEPTION', label: 'Exceptions' },
              { value: 'REMEDIATION', label: 'Remediation' }
            ]}
          />

          {/* Status Selector */}
          <Select
            sizeVariant="sm"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PRESENT', label: 'Present' },
              { value: 'NOT_SUBMITTED', label: 'Not Submitted' },
              { value: 'ABSENT_CONFIRMED', label: 'Confirmed Missing' },
              { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
              { value: 'UNKNOWN', label: 'Unknown' }
            ]}
          />

          {/* Assessment Period */}
          <Select
            sizeVariant="sm"
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Periods' },
              { value: 'Q3 2026', label: 'Q3 2026 (Active)' },
              { value: 'Q2 2026', label: 'Q2 2026 (Baseline)' },
              { value: 'Q1 2026', label: 'Q1 2026' }
            ]}
          />
        </div>

        {/* Filter Summary & Quick Status Links */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#212c3d] text-[11px] font-mono text-[#8c90a0]">
          <div className="flex items-center gap-2">
            <span>Filter Status:</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'ALL', label: 'All Evidence' },
                { id: 'PRESENT', label: 'Present' },
                { id: 'NOT_SUBMITTED', label: 'Missing' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedStatus(st.id);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    selectedStatus === st.id
                      ? 'bg-[#1d4ed8] text-white font-bold'
                      : 'bg-[#161e29] text-[#94a3b8] hover:text-[#f1f5f9] border border-[#212c3d]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-[#f1f5f9]">{filteredEvidence.length}</strong> of {evidence.length} Artifacts
            </span>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] text-[#8c90a0] hover:text-[#f1f5f9] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN EVIDENCE TABLE (Section 7: Full-Width Clean Table)                */}
      {/* ========================================================================= */}
      <Card className="p-0 overflow-hidden">
        {filteredEvidence.length > 0 ? (
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left text-[12px] text-[#dfe2eb]">
              <thead className="bg-[#111722] text-[#8c90a0] font-mono uppercase text-[10px] border-b border-[#212c3d]">
                <tr>
                  <th className="py-3 px-3.5">Evidence ID</th>
                  <th className="py-3 px-3.5">Title & Artifact</th>
                  <th className="py-3 px-3.5">CSE / Sector</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Source Node</th>
                  <th className="py-3 px-3.5">Related Finding</th>
                  <th className="py-3 px-3.5">Updated</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212c3d]/60 bg-[#0e131b]">
                {paginatedEvidence.map((item) => {
                  const hasFinding = Boolean(item.gapOrFinding);

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-[#111722] transition-colors group cursor-pointer"
                      onClick={() => {
                        setInspectedEvidence(item);
                        setDrawerTab('overview');
                      }}
                    >
                      {/* 1. Evidence ID */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#60a5fa] group-hover:underline">
                          {item.id}
                        </span>
                        {item.submissionId && (
                          <div className="text-[10px] text-[#64748b] font-mono mt-0.5">
                            {item.submissionId}
                          </div>
                        )}
                      </td>

                      {/* 2. Title & Artifact */}
                      <td className="py-3 px-3.5 max-w-[280px]">
                        <div className="font-semibold text-[#f1f5f9] truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-[#8c90a0] font-mono truncate mt-0.5">
                          Ref: {item.caseRef}
                        </div>
                      </td>

                      {/* 3. CSE */}
                      <td 
                        className="py-3 px-3.5 whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCseId(item.cseId);
                          navigate(`/supervision/cses/${item.cseId}`);
                        }}
                      >
                        <div className="font-semibold text-[#f1f5f9] hover:text-[#60a5fa] flex items-center gap-1">
                          <span>{item.cseId}</span>
                          <ExternalLink className="w-3 h-3 text-[#64748b]" />
                        </div>
                        <div className="text-[10px] text-[#8c90a0] truncate max-w-[130px]">
                          {item.entity.split('(')[1]?.replace(')', '') || item.entity}
                        </div>
                      </td>

                      {/* 4. Category */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold bg-[#182335] text-[#93c5fd] border border-[#263750]">
                          {getCategoryLabel(item.recordType)}
                        </span>
                      </td>

                      {/* 5. Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* 6. Source Node */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="text-[#cbd5e1] truncate max-w-[150px]">
                          {item.source}
                        </div>
                        <div className="text-[10px] text-[#64748b] font-mono mt-0.5">
                          {item.sourceSink}
                        </div>
                      </td>

                      {/* 7. Related Finding */}
                      <td 
                        className="py-3 px-3.5 whitespace-nowrap"
                        onClick={(e) => {
                          if (hasFinding) {
                            e.stopPropagation();
                            handleOpenFinding(item.gapOrFinding);
                          }
                        }}
                      >
                        {hasFinding ? (
                          <span className="font-mono text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1">
                            <span>{item.gapOrFinding.split('/')[1]?.trim() || item.gapOrFinding}</span>
                            <ArrowRight className="w-3 h-3 text-amber-400" />
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#64748b] font-mono">None (Conformant)</span>
                        )}
                      </td>

                      {/* 8. Updated */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-[#8c90a0]">
                        {item.timestampDate || '26 Sep 2026'}
                      </td>

                      {/* 9. Action */}
                      <td 
                        className="py-3 px-3.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setInspectedEvidence(item);
                              setDrawerTab('overview');
                            }}
                            className="p-1.5 rounded bg-[#161e29] border border-[#212c3d] text-[#8c90a0] hover:text-[#f1f5f9] transition-colors"
                            title="Inspect Evidence Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <Button
                            size="sm"
                            variant="primary"
                            iconRight={<ArrowRight className="w-3 h-3" />}
                            onClick={() => {
                              setInspectedEvidence(item);
                              setDrawerTab('overview');
                            }}
                            className="text-[10px] font-mono py-1 px-2.5 bg-[#1d4ed8] hover:bg-[#2563eb]"
                          >
                            Inspect
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State (Section 21) */
          <div className="p-8 text-center space-y-2.5">
            <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto" />
            <h3 className="text-[14px] font-bold text-[#f1f5f9]">
              No evidence matches the current filters.
            </h3>
            <p className="text-[11px] text-[#8c90a0] max-w-sm mx-auto font-mono">
              Clear your search query, CSE selection, category, or status filter to view vault evidence.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-[11px] font-mono"
              >
                Clear Filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
                className="text-[11px] font-mono bg-[#1d4ed8] hover:bg-[#2563eb]"
              >
                + Add Evidence
              </Button>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredEvidence.length > 0 && (
          <div className="p-3 bg-[#111722] border-t border-[#212c3d] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#8c90a0]">
            <div>
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredEvidence.length)}–
              {Math.min(currentPage * pageSize, filteredEvidence.length)} of {filteredEvidence.length} artifacts
            </div>
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="text-[10px] py-0.5 px-2"
              >
                Previous
              </Button>
              <span className="px-2 text-[#cbd5e1]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="text-[10px] py-0.5 px-2"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 5. EVIDENCE DETAIL DRAWER (Sections 9, 10, 11, 12, 17)                    */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={Boolean(inspectedEvidence)}
        onClose={() => setInspectedEvidence(null)}
        title={inspectedEvidence ? `${inspectedEvidence.id} — ${getCategoryLabel(inspectedEvidence.recordType)}` : ''}
        subtitle="Supervisory Evidence Dossier & Provenance Ledger"
        width="md"
      >
        {inspectedEvidence && (
          <div className="space-y-4 text-[12px]">
            {/* Drawer Subtabs */}
            <div className="flex border-b border-[#212c3d] text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setDrawerTab('overview')}
                className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                  drawerTab === 'overview'
                    ? 'border-[#3b82f6] text-[#60a5fa] font-bold'
                    : 'border-transparent text-[#8c90a0] hover:text-[#dfe2eb]'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('timeline')}
                className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                  drawerTab === 'timeline'
                    ? 'border-[#3b82f6] text-[#60a5fa] font-bold'
                    : 'border-transparent text-[#8c90a0] hover:text-[#dfe2eb]'
                }`}
              >
                Ingestion Timeline
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('provenance')}
                className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                  drawerTab === 'provenance'
                    ? 'border-[#3b82f6] text-[#60a5fa] font-bold'
                    : 'border-transparent text-[#8c90a0] hover:text-[#dfe2eb]'
                }`}
              >
                Provenance &amp; Custody
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {drawerTab === 'overview' && (
              <div className="space-y-4">
                {/* Header Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={inspectedEvidence.status} />
                  <span className="px-2 py-0.5 rounded bg-[#182335] text-[#93c5fd] font-mono text-[10px] border border-[#263750] uppercase font-bold">
                    {getCategoryLabel(inspectedEvidence.recordType)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#161e29] text-[#cbd5e1] font-mono text-[10px] border border-[#212c3d]">
                    CSE: {inspectedEvidence.cseId}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#161e29] text-[#cbd5e1] font-mono text-[10px] border border-[#212c3d]">
                    Cycle: Q3 2026
                  </span>
                </div>

                {/* Evidence Title & Summary */}
                <div className="p-3.5 rounded bg-[#0e131b] border border-[#212c3d] space-y-1.5">
                  <div className="text-[13px] font-bold text-[#f1f5f9]">
                    {inspectedEvidence.title}
                  </div>
                  <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                    {inspectedEvidence.gapNote || 'Cryptographically sealed regulatory artifact ingested into air-gapped supervisory enclave.'}
                  </p>
                </div>

                {/* Evidence Readiness Checklist (Section 9) */}
                <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#64748b]">Evidence Readiness Verification</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-[#10b981]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Format: Valid</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#10b981]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Schema: OCSF v1.1.0</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#10b981]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mapping: Canonical</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#10b981]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Integrity: FIPS Hash Verified</span>
                    </div>
                  </div>
                </div>

                {/* Expected vs Observed Connection (Section 11) */}
                {inspectedEvidence.gapOrFinding && (
                  <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-2">
                    <div className="text-[10px] font-mono uppercase text-[#60a5fa] font-bold flex items-center gap-1">
                      <Workflow className="w-3.5 h-3.5" />
                      <span>Expected vs Observed Discrepancy</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-[#10b981] font-mono font-semibold">Expected: </span>
                        <span className="text-[#cbd5e1]">Regulatory protocol requires mandatory Tier-2 escalation telemetry before case closure.</span>
                      </div>
                      <div>
                        <span className="text-rose-300 font-mono font-semibold">Observed: </span>
                        <span className="text-[#cbd5e1]">Direct closure recorded without statutory escalation token.</span>
                      </div>
                      <div className="text-[10px] font-mono text-amber-300 pt-0.5">
                        Difference: Execution Gap (GAP-0071)
                      </div>
                    </div>
                  </div>
                )}

                {/* Related Finding Section (Section 9 & 12) */}
                {inspectedEvidence.gapOrFinding && (
                  <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-[#64748b]">Related Supervisory Finding</span>
                      <PriorityBadge priority="CRITICAL" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <div>
                        <span className="font-bold text-[#60a5fa]">
                          {inspectedEvidence.gapOrFinding.split('/')[1]?.trim() || inspectedEvidence.gapOrFinding}
                        </span>
                        <span className="text-[#8c90a0] block text-[10px]">Status: UNDER_REVIEW</span>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        iconRight={<ArrowRight className="w-3 h-3" />}
                        onClick={() => {
                          const fid = inspectedEvidence.gapOrFinding;
                          setInspectedEvidence(null);
                          handleOpenFinding(fid);
                        }}
                        className="text-[10px] font-mono py-1 px-2.5 bg-[#1d4ed8] hover:bg-[#2563eb]"
                      >
                        Open Finding
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const cid = inspectedEvidence.cseId;
                      setInspectedEvidence(null);
                      setActiveCseId(cid);
                      navigate(`/supervision/cses/${cid}`);
                    }}
                    className="w-full justify-center text-[11px] font-mono"
                  >
                    View CSE Profile ({inspectedEvidence.cseId})
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: TIMELINE (Section 10) */}
            {drawerTab === 'timeline' && (
              <div className="space-y-3">
                <div className="text-[11px] font-mono text-[#8c90a0]">
                  Chronological ingestion & analysis lifecycle for {inspectedEvidence.id}:
                </div>
                <Timeline events={getTimelineSteps(inspectedEvidence)} />
              </div>
            )}

            {/* TAB 3: PROVENANCE (Section 9 & 17) */}
            {drawerTab === 'provenance' && (
              <div className="space-y-3 font-mono text-[11px]">
                <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Source Node:</span>
                    <span className="text-[#dfe2eb]">{inspectedEvidence.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Ingestion Channel:</span>
                    <span className="text-[#cbd5e1]">{inspectedEvidence.sourceSink}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Submission ID:</span>
                    <span className="text-[#60a5fa] font-bold">{inspectedEvidence.submissionId || 'SUB-014-027'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Collector Version:</span>
                    <span className="text-[#cbd5e1]">{inspectedEvidence.provenance?.collectorVersion || 'sat-collector-v2.8-fips'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Schema Version:</span>
                    <span className="text-[#10b981] font-bold">{inspectedEvidence.provenance?.schemaVersion || 'OCSF-1.1.0'}</span>
                  </div>
                </div>

                {/* Cryptographic SHA-256 Digest */}
                <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-[#64748b] uppercase">
                    <span>Cryptographic SHA-256 Digest:</span>
                    <button
                      onClick={() => handleCopyHash(inspectedEvidence.hash)}
                      className="text-[#60a5fa] hover:text-[#93c5fd] flex items-center gap-1 font-mono"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2 rounded bg-[#080c12] border border-[#212c3d] text-[#10b981] break-all select-all font-mono text-[10px]">
                    {inspectedEvidence.hash}
                  </div>
                </div>

                {/* Chain of Custody */}
                <div className="p-3 rounded bg-[#0e131b] border border-[#212c3d] space-y-2">
                  <div className="text-[10px] text-[#64748b] uppercase">Immutable Chain of Custody:</div>
                  <div className="space-y-1">
                    {(inspectedEvidence.provenance?.custodyChain || [
                      `${inspectedEvidence.cseId} Submitting Liaison`,
                      'Air-Gap SFTP Ingestion Drop',
                      'NCIIPC Collector Gateway',
                      'Supervisory Enclave Vault'
                    ]).map((node, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                        <span className="text-[#cbd5e1]">{node}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* 6. IMPORT EVIDENCE MODAL (Section 14 & 15)                                 */}
      {/* ========================================================================= */}
      <ImportEvidenceModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        preselectedCseId={selectedCse !== 'ALL' ? selectedCse : 'CSE-014'}
      />
    </PageContainer>
  );
};
