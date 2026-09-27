import React, { useState, useMemo } from 'react';
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
  ExternalLink
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  FilterBar,
  Input,
  Select,
  DataTable,
  Column,
  Card,
  StatusBadge,
  Tabs,
  Timeline,
  Button
} from '@/components/common';

export const EvidenceExplorerPage: React.FC = () => {
  const { evidence, cses } = useSupervisory();

  // 3 Tabs: Explorer, Timeline, Provenance
  const [activeTab, setActiveTab] = useState<string>('explorer');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCse, setSelectedCse] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');

  // Selected item for inspection panel
  const [selectedEvidence, setSelectedEvidence] = useState<MockEvidenceRecord | null>(evidence[0] || null);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCse('ALL');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSelectedSource('ALL');
  };

  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.caseRef.toLowerCase().includes(q) ||
          item.entity.toLowerCase().includes(q) ||
          item.hash.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedCse !== 'ALL' && item.cseId !== selectedCse) return false;
      if (selectedType !== 'ALL' && item.recordType !== selectedType) return false;
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
      if (selectedSource !== 'ALL' && !item.source.toLowerCase().includes(selectedSource.toLowerCase())) return false;

      return true;
    });
  }, [evidence, searchTerm, selectedCse, selectedType, selectedStatus, selectedSource]);

  const navTabs = [
    { id: 'explorer', label: '1. Vault Explorer', icon: <FileText className="w-3.5 h-3.5" />, count: filteredEvidence.length },
    { id: 'timeline', label: '2. Ingestion Chronology', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'provenance', label: '3. Chain of Custody', icon: <Key className="w-3.5 h-3.5" /> },
  ];

  const columns: Column<MockEvidenceRecord>[] = [
    {
      header: 'Evidence ID',
      width: '120px',
      cell: (item) => (
        <span className="font-mono font-bold text-[12px] text-[#afc6ff]">
          {item.id}
        </span>
      ),
    },
    {
      header: 'Category',
      width: '140px',
      cell: (item) => (
        <span className="font-mono text-[11px] text-[#c2c6d6] px-1.5 py-0.5 rounded bg-[#1c2026] border border-[#262a31]">
          {item.recordType}
        </span>
      ),
    },
    {
      header: 'Title & Context',
      cell: (item) => (
        <div className="flex flex-col min-w-0 pr-2">
          <span className="font-semibold text-[13px] text-[#dfe2eb] truncate">
            {item.title}
          </span>
          <span className="text-[11px] text-[#8c90a0] font-mono mt-0.5 truncate">
            {item.entity} · Ref: {item.caseRef}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      width: '130px',
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Digest',
      width: '110px',
      cell: (item) => (
        <span className="font-mono text-[11px] text-[#8c90a0] truncate block max-w-[100px]">
          {item.hash}
        </span>
      ),
    },
    {
      header: 'Action',
      width: '80px',
      className: 'text-right',
      headerClassName: 'text-right',
      cell: () => (
        <span className="text-[11px] text-[#afc6ff] font-mono hover:underline">
          View
        </span>
      ),
    },
  ];

  const timelineEvents = evidence.slice(0, 8).map((ev) => ({
    id: ev.id,
    timestamp: ev.timestampTime || ev.timestamp,
    title: `${ev.id} — ${ev.title}`,
    description: `Ingested from ${ev.source} for ${ev.entity} (${ev.cseId}). SHA-256 Digest: ${ev.hash}`,
    actor: ev.source,
    badge: <StatusBadge status={ev.status} />,
    status: (ev.status === 'PRESENT' ? 'success' : ev.status === 'NOT_SUBMITTED' ? 'warning' : 'error') as any,
  }));

  return (
    <PageContainer>
      {/* 1. STANDARD PAGE HEADER */}
      <PageHeader
        title="Evidence Vault"
        description="Centralized air-gapped cryptographic repository for ingested SOC telemetry and regulatory artifacts."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2.5 py-1 rounded-md border border-[#7bdb80]/20">
              FIPS-140-2 LEVEL 3 DIGEST VERIFIED
            </span>
          </div>
        }
      />

      {/* 2. TABS */}
      <Tabs
        tabs={navTabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
      />

      {/* TAB 1: VAULT EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="space-y-4 min-w-0">
          {/* STANDARDIZED FILTER TOOLBAR */}
          <div className="p-3.5 rounded-lg bg-[#181c22] border border-[#262a31] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              <div className="lg:col-span-2">
                <Input
                  icon={<Search className="w-4 h-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search ID, title, case ref, hash..."
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
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Categories' },
                  { value: 'Escalation Record', label: 'Escalation Record' },
                  { value: 'Incident Record', label: 'Incident Record' },
                  { value: 'Telemetry Stream', label: 'Telemetry Stream' },
                  { value: 'Closure Token', label: 'Closure Token' },
                ]}
              />

              <Select
                sizeVariant="sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'PRESENT', label: 'PRESENT' },
                  { value: 'NOT_SUBMITTED', label: 'NOT_SUBMITTED' },
                  { value: 'ABSENT_CONFIRMED', label: 'ABSENT_CONFIRMED' },
                ]}
              />

              <Select
                sizeVariant="sm"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Sources' },
                  { value: 'SOAR', label: 'SOAR Platform' },
                  { value: 'SIEM', label: 'SIEM Core' },
                  { value: 'SCADA', label: 'SCADA OT Historian' },
                ]}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262a31] text-[12px]">
              <span className="text-[#8c90a0] font-mono text-[11px]">
                Showing <strong className="text-[#dfe2eb]">{filteredEvidence.length}</strong> of {evidence.length} Artifacts
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

          {/* SPLIT TABLE & INSPECTION CARD (Adhering to Section 18 & 21) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-w-0">
            {/* Table (8 Cols) */}
            <div className="lg:col-span-8 min-w-0">
              <DataTable<MockEvidenceRecord>
                columns={columns}
                data={filteredEvidence}
                keyExtractor={(item) => item.id}
                onRowClick={(item) => setSelectedEvidence(item)}
                emptyMessage="No evidence records found matching criteria."
              />
            </div>

            {/* Evidence Inspection Card (4 Cols - normalized width approx 380-480px on desktop) */}
            <div className="lg:col-span-4 min-w-0">
              <Card className="space-y-3.5">
                {selectedEvidence ? (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-[#262a31]/60">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#afc6ff]" />
                        <span className="font-mono text-[13px] font-bold text-[#dfe2eb]">
                          {selectedEvidence.id}
                        </span>
                      </div>
                      <StatusBadge status={selectedEvidence.status} />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[13px] font-semibold text-[#dfe2eb] leading-snug">
                        {selectedEvidence.title}
                      </h4>
                      <div className="text-[11px] text-[#8c90a0] font-mono">
                        {selectedEvidence.entity} ({selectedEvidence.cseId})
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31] text-[12px] font-mono space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#8c90a0]">Case Reference:</span>
                        <span className="text-[#dfe2eb] font-semibold">{selectedEvidence.caseRef}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8c90a0]">Source System:</span>
                        <span className="text-[#dfe2eb]">{selectedEvidence.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8c90a0]">Timestamp:</span>
                        <span className="text-[#dfe2eb]">{selectedEvidence.timestampTime || selectedEvidence.timestamp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8c90a0]">Integrity Check:</span>
                        <span className="text-[#7bdb80] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>FIPS Verified</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono">
                      <span className="text-[#8c90a0] uppercase">SHA-256 Digest:</span>
                      <div className="p-2 rounded bg-[#10141a] border border-[#262a31] text-[#7bdb80] break-all select-all font-semibold">
                        {selectedEvidence.hash}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-[#8c90a0] font-mono uppercase">
                        Supervisory Provenance:
                      </span>
                      <p className="text-[12px] text-[#c2c6d6] leading-relaxed">
                        {selectedEvidence.gapNote || selectedEvidence.title}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#262a31]/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#8c90a0]">Enclave Storage</span>
                      <span className="text-[#7bdb80]">READ-ONLY / IMMUTABLE</span>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center text-[12px] text-[#8c90a0]">
                    Select an evidence artifact from the ledger to inspect cryptographic metadata.
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INGESTION CHRONOLOGY */}
      {activeTab === 'timeline' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#262a31]/60">
            <div>
              <h3 className="text-[14px] md:text-[15px] font-semibold text-[#dfe2eb]">
                Chronological Ingestion Ledger
              </h3>
              <p className="text-[12px] text-[#8c90a0] mt-0.5">
                Real-time forensic telemetry stream from monitored critical entities
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2 py-0.5 rounded border border-[#7bdb80]/20">
              STREAM SYNCHRONIZED
            </span>
          </div>

          <Timeline events={timelineEvents} />
        </Card>
      )}

      {/* TAB 3: CHAIN OF CUSTODY */}
      {activeTab === 'provenance' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#262a31]/60">
            <div>
              <h3 className="text-[14px] md:text-[15px] font-semibold text-[#dfe2eb]">
                Cryptographic Chain of Custody &amp; Enclave Provenance
              </h3>
              <p className="text-[12px] text-[#8c90a0] mt-0.5">
                Every evidence artifact is hashed upon boundary entry with hardware root of trust
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#7bdb80]">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS 1.3 / FIPS-140-2</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 font-mono text-[12px]">
            <div className="p-3.5 rounded-lg bg-[#14181f] border border-[#262a31] space-y-1.5">
              <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Boundary Gate</span>
              <div className="text-[13px] font-semibold text-[#dfe2eb]">Hardware HSM Enclave</div>
              <div className="text-[11px] text-[#7bdb80]">Active Key: PUB-HSM-2026-X9</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#14181f] border border-[#262a31] space-y-1.5">
              <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Digest Algorithm</span>
              <div className="text-[13px] font-semibold text-[#dfe2eb]">SHA-256 (NIST Approved)</div>
              <div className="text-[11px] text-[#afc6ff]">Collision Resistance Verified</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#14181f] border border-[#262a31] space-y-1.5">
              <span className="text-[10px] text-[#8c90a0] uppercase font-semibold">Retention Guarantee</span>
              <div className="text-[13px] font-semibold text-[#dfe2eb]">WORM (Write Once Read Many)</div>
              <div className="text-[11px] text-[#7bdb80]">3-Year Regulatory Hold</div>
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
};
