import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface EvidenceItem {
  id: string;
  type: string;
  entity: string;
  caseRef: string;
  source: string;
  sourceSink: string;
  timestampDate: string;
  timestampTime: string;
  status: 'PRESENT' | 'NOT_SUBMITTED' | 'ABSENT_CONFIRMED' | 'UNKNOWN' | 'NOT_APPLICABLE';
  integrity: string;
  hash: string;
  gapOrFinding: string;
  gapNote: string;
}

const mockEvidenceList: EvidenceItem[] = [
  {
    id: 'EVD-742',
    type: 'Investigation Record',
    entity: 'CSE-014 (NorthGrid)',
    caseRef: 'CASE-1042 / INV-338',
    source: 'SOC Case Management',
    sourceSink: 'API::enclave_agent_v3',
    timestampDate: '26 Sep 2026',
    timestampTime: '09:42:18 IST',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: '9f8a3c22b918a99477e6f8812dd014a9ecba19001258d4a9821',
    gapOrFinding: 'GAP-0071 / FND-0142',
    gapNote: 'Escalation breach',
  },
  {
    id: 'EVD-761',
    type: 'Response Record',
    entity: 'CSE-014',
    caseRef: 'CASE-1042 / RSP-089',
    source: 'SOC Response System',
    sourceSink: 'SOAR Playbook Auto',
    timestampDate: '26 Sep 2026',
    timestampTime: '11:08:44 IST',
    status: 'PRESENT',
    integrity: 'VERIFIED (SHA-256)',
    hash: 'd4a1b028ec31a0029bce83719001e389291bacef98104',
    gapOrFinding: 'FND-0142',
    gapNote: 'Containment logged',
  },
  {
    id: 'ESC-221',
    type: 'Escalation Evidence',
    entity: 'CSE-014',
    caseRef: 'CASE-1042 / [MISSING]',
    source: 'SOC Case Management',
    sourceSink: 'Expected Feed Absent',
    timestampDate: '26 Sep 2026',
    timestampTime: '10:45:00 IST (Exp)',
    status: 'NOT_SUBMITTED',
    integrity: 'PENDING DIGEST',
    hash: 'PENDING_CANONICAL_SUBMISSION',
    gapOrFinding: 'NS-0041 / GAP-0071',
    gapNote: 'Expected per CTRL-07',
  },
  {
    id: 'EVD-681',
    type: 'Alert Telemetry',
    entity: 'CSE-014',
    caseRef: 'CASE-1011 / ALR-8821',
    source: 'SOC SIEM Pipeline',
    sourceSink: 'Kafka Enclave Sink',
    timestampDate: '14 Sep 2026',
    timestampTime: '08:31:02 IST',
    status: 'PRESENT',
    integrity: 'VERIFIED',
    hash: '5b3a98ce1122a001928374619283019283',
    gapOrFinding: 'FND-0131',
    gapNote: 'RTU Alarm Trigger',
  },
  {
    id: 'EVD-604',
    type: 'Closure Record',
    entity: 'CSE-014',
    caseRef: 'CASE-1007 / CLS-421',
    source: 'SOC Case Management',
    sourceSink: 'Closure Workflow Sign',
    timestampDate: '12 Sep 2026',
    timestampTime: '17:21:40 IST',
    status: 'PRESENT',
    integrity: 'VERIFIED',
    hash: 'cc238b7e09919283746192830192830192',
    gapOrFinding: 'PD-0031',
    gapNote: 'Skip-step containment',
  },
  {
    id: 'EVD-519',
    type: 'Cryptographic Auth Log',
    entity: 'CSE-014',
    caseRef: 'CASE-0982 / GW-04',
    source: 'Air-Gapped HSM Vault',
    sourceSink: 'PKCS#11 Session Audit',
    timestampDate: '08 Sep 2026',
    timestampTime: '14:10:11 IST',
    status: 'PRESENT',
    integrity: 'VERIFIED',
    hash: '1198ae42c90019283746192830192830192',
    gapOrFinding: 'CTRL-12',
    gapNote: 'Key vault rotation',
  },
  {
    id: 'ESC-194',
    type: 'Tier-3 Escalation Dispatch',
    entity: 'CSE-014',
    caseRef: 'CASE-0982 / DISP-T3',
    source: 'SOC Dispatch System',
    sourceSink: 'Log Sink Audited',
    timestampDate: '08 Sep 2026',
    timestampTime: '14:35:10 IST',
    status: 'ABSENT_CONFIRMED',
    integrity: 'UNVERIFIED',
    hash: 'HASH_NULL_OMITTED_BY_ENTITY',
    gapOrFinding: 'GAP-0051 (Hist)',
    gapNote: 'Historical recurrence',
  },
  {
    id: 'EVD-488',
    type: 'Forensics Memory Dump',
    entity: 'CSE-014',
    caseRef: 'CASE-0955 / DUMP-01',
    source: 'Enclave Forensic Store',
    sourceSink: 'Encrypted Volatile RAM',
    timestampDate: '29 Aug 2026',
    timestampTime: '03:15:00 IST',
    status: 'PRESENT',
    integrity: 'VERIFIED',
    hash: '0a8f9211c47119283746192830192830192',
    gapOrFinding: 'CTRL-04',
    gapNote: 'RAM snapshot',
  },
];

export const EvidenceExplorerPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('CSE-014');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedItems, setSelectedItems] = useState<string[]>(['EVD-742', 'ESC-221']);
  const [activeDossier, setActiveDossier] = useState<EvidenceItem>(mockEvidenceList[0]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTarget, setRequestTarget] = useState({ id: 'ESC-221', caseRef: 'CASE-1042' });
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Filtered evidence items
  const filteredEvidence = mockEvidenceList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Alerts' && item.type.includes('Alert')) ||
      (selectedCategory === 'Cases' && item.caseRef.includes('CASE')) ||
      (selectedCategory === 'Investigations' && item.type.includes('Investigation')) ||
      (selectedCategory === 'Escalations' && item.type.includes('Escalation')) ||
      (selectedCategory === 'Responses' && item.type.includes('Response')) ||
      (selectedCategory === 'Closures' && item.type.includes('Closure'));

    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.caseRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gapOrFinding.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || item.status === statusFilter;

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredEvidence.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredEvidence.map((i) => i.id));
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(activeDossier.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="flex flex-col w-full space-y-6 text-[#dfe2eb]">
      {/* 1. BREADCRUMB, HEADER & TELEMETRY CONTROLS */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 font-mono text-xs text-[#8c90a0]">
            <span>SAT-SA</span>
            <span>/</span>
            <span>Assessment</span>
            <span>/</span>
            <span className="text-[#afc6ff] font-medium">Evidence Explorer</span>
          </nav>
          <div className="flex items-center gap-1.5 font-mono text-xs bg-[#181c22] px-3 py-1 rounded border border-[#262a31] text-[#c2c6d6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7bdb80]"></span>
            <span>ENCLAVE: SUB-2026-0148 PROVENANCE VALID</span>
          </div>
        </div>

        {/* Title & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="text-2xl font-bold text-[#dfe2eb] tracking-tight">Evidence Explorer</h1>
            <p className="text-xs text-[#c2c6d6] max-w-3xl mt-0.5">
              Inspect, trace, and validate evidence records supporting supervisory assessments, execution gaps, and findings under NCIIPC supervisory mandate.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs font-mono transition-colors border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[18px] text-[#8c90a0]">file_download</span>
              <span>Export Index</span>
            </button>
            <button
              onClick={() => alert('Enclave Telemetry Synced with NCIIPC Node NC-8841.')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] text-xs font-mono transition-colors border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[18px] text-[#8c90a0]">sync</span>
              <span>Refresh Telemetry</span>
            </button>
            <button
              onClick={() => {
                setRequestTarget({ id: 'ESC-221', caseRef: 'CASE-1042' });
                setShowRequestModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#1f6feb] text-white hover:brightness-110 text-xs font-semibold font-mono transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              <span>Request Evidence</span>
            </button>
          </div>
        </div>

        {/* Context Chips & Scopes */}
        <div className="flex items-center gap-2 flex-wrap mt-1 text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#262a31] text-[#dfe2eb] border border-[#31353c]">
            <span className="text-[#8c90a0] font-mono text-[10px] uppercase font-bold">Focus:</span>
            <span className="font-semibold text-[#afc6ff]">CSE-014 (NorthGrid Energy)</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#262a31] text-[#dfe2eb] border border-[#31353c]">
            <span className="text-[#8c90a0] font-mono text-[10px] uppercase font-bold">Period:</span>
            <span className="font-mono text-xs">Q3 2026 (Jul 01 - Sep 30)</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#262a31] text-[#7bdb80] border border-[#31353c]">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Enclave Ingestion: Verified</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#181c22] font-mono text-[11px] text-[#8c90a0] border border-[#262a31]">
            <span>FIPS 140-2 Level 3 HSM Enclave</span>
          </div>
        </div>
      </div>

      {/* 2. KPI SUMMARY STRIP (6 compact cards + ratio sub-strip) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-[#0a0e14] p-2 rounded-lg border border-[#262a31]">
        {/* Total */}
        <div className="bg-[#181c22] p-3 rounded flex flex-col justify-between border border-[#262a31]">
          <div className="flex items-center justify-between text-[#8c90a0]">
            <span className="text-[10px] uppercase tracking-wider font-bold">Total Evidence</span>
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#dfe2eb]">250</span>
            <span className="text-xs text-[#8c90a0]">records</span>
          </div>
          <span className="text-[11px] text-[#8c90a0] mt-1">100% scope</span>
        </div>

        {/* Present */}
        <div className="bg-[#181c22] p-3 rounded flex flex-col justify-between border border-[#262a31]">
          <div className="flex items-center justify-between text-[#7bdb80]">
            <span className="text-[10px] uppercase tracking-wider font-bold">Present</span>
            <span className="w-2 h-2 rounded-full bg-[#7bdb80]"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#7bdb80]">214</span>
            <span className="text-xs text-[#7bdb80]">85.6%</span>
          </div>
          <span className="text-[11px] text-[#8c90a0] mt-1">Validated ingest</span>
        </div>

        {/* Absent Confirmed */}
        <div className="bg-[#181c22] p-3 rounded flex flex-col justify-between border border-[#262a31]">
          <div className="flex items-center justify-between text-[#ffb4ab]">
            <span className="text-[10px] uppercase tracking-wider font-bold">Absent Confirmed</span>
            <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#ffb4ab]">8</span>
            <span className="text-xs text-[#ffb4ab]">3.2%</span>
          </div>
          <span className="text-[11px] text-[#ffb4ab]/80 mt-1">Gap Candidate</span>
        </div>

        {/* Not Submitted */}
        <div className="bg-[#181c22] p-3 rounded flex flex-col justify-between border border-[#262a31]">
          <div className="flex items-center justify-between text-[#ffb693]">
            <span className="text-[10px] uppercase tracking-wider font-bold">Not Submitted</span>
            <span className="w-2 h-2 rounded-full bg-[#ffb693]"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#ffb693]">15</span>
            <span className="text-xs text-[#ffb693]">6.0%</span>
          </div>
          <span className="text-[11px] text-[#ffb693]/90 mt-1 truncate" title="Missing submission ≠ Confirmed violation">
            Missing ≠ Violation
          </span>
        </div>

        {/* Not Applicable */}
        <div className="bg-[#181c22] p-3 rounded flex flex-col justify-between border border-[#262a31]">
          <div className="flex items-center justify-between text-[#8c90a0]">
            <span className="text-[10px] uppercase tracking-wider font-bold">Not Applicable</span>
            <span className="w-2 h-2 rounded-full bg-[#8c90a0]"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#c2c6d6]">5</span>
            <span className="text-xs text-[#8c90a0]">2.0%</span>
          </div>
          <span className="text-[11px] text-[#8c90a0] mt-1">Exempt Architecture</span>
        </div>

        {/* Unknown */}
        <div className="bg-[#181c22] p-3 rounded flex flex-col justify-between border border-[#262a31]">
          <div className="flex items-center justify-between text-[#afc6ff]">
            <span className="text-[10px] uppercase tracking-wider font-bold">Unknown Status</span>
            <span className="w-2 h-2 rounded-full bg-[#afc6ff]"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#afc6ff]">8</span>
            <span className="text-xs text-[#afc6ff]">3.2%</span>
          </div>
          <span className="text-[11px] text-[#8c90a0] mt-1">Awaiting Dispatch</span>
        </div>

        {/* Ratio Sub-strip (Spanning all 6 columns) */}
        <div className="col-span-2 md:col-span-3 lg:col-span-6 bg-[#1c2026] px-4 py-2 rounded flex flex-col lg:flex-row lg:items-center justify-between gap-2 border border-[#262a31]">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="text-[#dfe2eb] flex items-center gap-1.5">
              <span className="text-[#8c90a0]">Evidence Coverage:</span>
              <strong className="text-[#7bdb80]">86%</strong>
            </span>
            <span className="text-[#8c90a0]">|</span>
            <span className="text-[#dfe2eb] flex items-center gap-1.5">
              <span className="text-[#8c90a0]">Integrity Verified:</span>
              <strong className="text-[#afc6ff]">97%</strong>
            </span>
            <span className="text-[#8c90a0]">|</span>
            <span className="text-[#dfe2eb] flex items-center gap-1.5">
              <span className="text-[#8c90a0]">Source Consistency:</span>
              <strong className="text-[#7bdb80]">92%</strong>
            </span>
            <span className="text-[#8c90a0]">|</span>
            <span className="text-[#dfe2eb] flex items-center gap-1.5">
              <span className="text-[#8c90a0]">Mapping Confidence:</span>
              <span className="px-1.5 py-0.2 rounded bg-[#007124]/30 text-[#7bdb80] font-semibold">HIGH</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#8c90a0]">
            <span className="material-symbols-outlined text-[16px] text-[#ffb693]">info</span>
            <span className="text-[#c2c6d6] font-mono text-[11px]">
              Statutory Notice: Missing submission ≠ Confirmed statutory violation
            </span>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY PILL SELECTOR & FILTER TOOLBAR */}
      <div className="flex flex-col gap-3 bg-[#181c22] p-4 rounded-xl border border-[#262a31]">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Alerts', 'Cases', 'Investigations', 'Actions', 'Evidence Items', 'Escalations', 'Responses', 'Closures', 'Assets', 'Exceptions', 'Remediation'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1f6feb] text-white'
                  : 'bg-[#1c2026] hover:bg-[#262a31] text-[#c2c6d6] hover:text-[#dfe2eb] border border-[#262a31]'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-[#262a31] text-[#8c90a0]'
              }`}>
                {cat === 'All' ? '250' : cat === 'Alerts' ? '250' : cat === 'Cases' ? '100' : cat === 'Escalations' ? '18' : '42'}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Control Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-2 items-center text-xs">
          {/* Search Input */}
          <div className="xl:col-span-4 relative">
            <span className="material-symbols-outlined text-[18px] text-[#8c90a0] absolute left-3 top-2.5">search</span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search evidence ID (e.g. EVD-742), case, hash, signal..."
              className="w-full bg-[#0a0e14] text-[#dfe2eb] placeholder:text-[#8c90a0] pl-9 pr-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#1f6feb] border border-[#262a31]"
            />
          </div>

          {/* Dropdowns */}
          <div className="xl:col-span-2">
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full bg-[#1c2026] text-[#dfe2eb] px-2.5 py-2 rounded border border-[#262a31] focus:ring-1 focus:ring-[#1f6feb]"
            >
              <option value="CSE-014">CSE: CSE-014 (NorthGrid)</option>
              <option value="CSE-002">CSE-002 (PowerGrid East)</option>
              <option value="CSE-028">CSE-028 (HydroTrans)</option>
            </select>
          </div>

          <div className="xl:col-span-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#1c2026] text-[#dfe2eb] px-2 py-2 rounded border border-[#262a31] focus:ring-1 focus:ring-[#1f6feb]"
            >
              <option value="All">Status: All</option>
              <option value="PRESENT">Present</option>
              <option value="NOT_SUBMITTED">Not Submitted</option>
              <option value="ABSENT_CONFIRMED">Absent Confirmed</option>
              <option value="UNKNOWN">Unknown</option>
            </select>
          </div>

          <div className="xl:col-span-2">
            <select className="w-full bg-[#1c2026] text-[#dfe2eb] px-2.5 py-2 rounded border border-[#262a31] focus:ring-1 focus:ring-[#1f6feb]">
              <option>Control: CTRL-07 Escalation</option>
              <option>CTRL-04 Forensic Capture</option>
              <option>CTRL-12 HSM Auth</option>
              <option>All Controls</option>
            </select>
          </div>

          <div className="xl:col-span-1">
            <select className="w-full bg-[#1c2026] text-[#dfe2eb] px-2 py-2 rounded border border-[#262a31] focus:ring-1 focus:ring-[#1f6feb]">
              <option>Integrity: All</option>
              <option>Verified (SHA-256)</option>
              <option>Pending</option>
            </select>
          </div>

          {/* Quick Action Buttons */}
          <div className="xl:col-span-2 flex items-center justify-end gap-1.5">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setSelectedCategory('All');
              }}
              className="px-3 py-2 rounded bg-[#1c2026] text-[#8c90a0] hover:text-[#dfe2eb] transition-colors border border-[#262a31]"
            >
              Clear
            </button>
            <button
              onClick={() => alert(`Exporting ${selectedItems.length} selected records...`)}
              disabled={selectedItems.length === 0}
              className={`px-3 py-2 rounded flex items-center gap-1 font-mono transition-colors border border-[#262a31] ${
                selectedItems.length > 0
                  ? 'bg-[#1f6feb]/20 text-[#afc6ff] hover:bg-[#1f6feb]/30'
                  : 'bg-[#1c2026] text-[#8c90a0] cursor-not-allowed opacity-60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Selected ({selectedItems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* BULK SELECTION ACTION FLOATING BAR */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between bg-[#1f6feb] text-white px-4 py-2.5 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 font-semibold text-xs">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>{selectedItems.length} Evidence Records Selected</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => alert('Exporting selected records as signed JSON index...')}
              className="px-3 py-1 rounded bg-white/20 hover:bg-white/30 text-white font-medium"
            >
              Export Selected Index
            </button>
            <button
              onClick={() => alert('Marked selected records as Examiner Reviewed.')}
              className="px-3 py-1 rounded bg-white/20 hover:bg-white/30 text-white font-medium"
            >
              Mark Reviewed
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="px-3 py-1 rounded hover:bg-white/20 text-white underline ml-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 4. DENSE ENTERPRISE EVIDENCE TABLE */}
      <div className="bg-[#181c22] rounded-xl overflow-hidden border border-[#262a31]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0a0e14] text-[#8c90a0] text-[11px] uppercase tracking-wider font-mono border-b border-[#31353c]">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    checked={selectedItems.length === filteredEvidence.length && filteredEvidence.length > 0}
                    onChange={toggleSelectAll}
                    type="checkbox"
                    className="rounded bg-[#1c2026] border-0 cursor-pointer"
                  />
                </th>
                <th className="p-3">Evidence ID / Type</th>
                <th className="p-3">CSE & Incident Entity</th>
                <th className="p-3">Source System</th>
                <th className="p-3">Timestamp (UTC+05:30)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Integrity (Cryptographic)</th>
                <th className="p-3">Related Signal / Gap</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#31353c] text-[#dfe2eb]">
              {filteredEvidence.map((row) => {
                const isSelected = selectedItems.includes(row.id);
                const isActiveDossier = activeDossier.id === row.id;

                return (
                  <tr
                    key={row.id}
                    onClick={() => setActiveDossier(row)}
                    className={`transition-colors cursor-pointer ${
                      isActiveDossier
                        ? 'bg-[#1c2026] border-l-2 border-[#1f6feb]'
                        : row.status === 'NOT_SUBMITTED'
                        ? 'bg-[#c55100]/10 hover:bg-[#c55100]/20'
                        : row.status === 'ABSENT_CONFIRMED'
                        ? 'bg-[#93000a]/10 hover:bg-[#93000a]/20'
                        : 'hover:bg-[#1c2026]/50'
                    }`}
                  >
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        checked={isSelected}
                        onChange={() => toggleSelectItem(row.id)}
                        type="checkbox"
                        className="rounded bg-[#1c2026] border-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-semibold ${
                          row.status === 'NOT_SUBMITTED' ? 'text-[#ffb693]' : row.status === 'ABSENT_CONFIRMED' ? 'text-[#ffb4ab]' : 'text-[#afc6ff]'
                        }`}>
                          {row.id}
                        </span>
                        {isActiveDossier && <span className="w-1.5 h-1.5 rounded-full bg-[#1f6feb]"></span>}
                      </div>
                      <span className="text-[11px] text-[#8c90a0] block">{row.type}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-xs text-[#dfe2eb] font-semibold">{row.entity}</div>
                      <div className="font-mono text-[11px] text-[#8c90a0]">{row.caseRef}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-[#dfe2eb]">{row.source}</div>
                      <div className="font-mono text-[11px] text-[#8c90a0]">{row.sourceSink}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#c2c6d6]">
                      <div>{row.timestampDate}</div>
                      <div className="text-[#8c90a0]">{row.timestampTime}</div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                        row.status === 'PRESENT'
                          ? 'bg-[#007124]/30 text-[#7bdb80]'
                          : row.status === 'NOT_SUBMITTED'
                          ? 'bg-[#c55100]/40 text-[#ffb693]'
                          : row.status === 'ABSENT_CONFIRMED'
                          ? 'bg-[#93000a]/40 text-[#ffb4ab]'
                          : 'bg-[#262a31] text-[#afc6ff]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.status === 'PRESENT'
                            ? 'bg-[#7bdb80]'
                            : row.status === 'NOT_SUBMITTED'
                            ? 'bg-[#ffb693]'
                            : row.status === 'ABSENT_CONFIRMED'
                            ? 'bg-[#ffb4ab]'
                            : 'bg-[#afc6ff]'
                        }`}></span>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      <div className={`flex items-center gap-1 ${
                        row.integrity.includes('VERIFIED') ? 'text-[#7bdb80]' : row.status === 'NOT_SUBMITTED' ? 'text-[#8c90a0]' : 'text-[#ffb4ab]'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {row.integrity.includes('VERIFIED') ? 'verified' : 'cancel'}
                        </span>
                        <span>{row.integrity}</span>
                      </div>
                      <span className="text-[#8c90a0] block truncate w-32" title={row.hash}>
                        {row.hash.slice(0, 12)}...
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-[#262a31] text-[#ffb693] font-mono text-[11px]">
                          {row.gapOrFinding}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8c90a0] block mt-0.5">{row.gapNote}</span>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {row.status === 'NOT_SUBMITTED' ? (
                        <button
                          onClick={() => {
                            setRequestTarget({ id: row.id, caseRef: row.caseRef });
                            setShowRequestModal(true);
                          }}
                          className="px-3 py-1 rounded bg-[#c55100] text-white hover:brightness-110 font-semibold text-xs"
                        >
                          Request Evidence
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveDossier(row)}
                          className="px-3 py-1 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs transition-colors"
                        >
                          View Dossier
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="bg-[#0a0e14] p-3 flex items-center justify-between text-xs font-mono text-[#8c90a0] border-t border-[#31353c]">
          <span>Displaying {filteredEvidence.length} of 250 filtered records (Page 1 of 32)</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded bg-[#1c2026] text-[#dfe2eb] disabled:opacity-40" disabled>
              Previous
            </button>
            <span className="px-2 py-1 text-[#dfe2eb] bg-[#262a31] rounded font-semibold">1</span>
            <button className="px-2 py-1 rounded hover:bg-[#1c2026] text-[#8c90a0]">2</button>
            <button className="px-2 py-1 rounded hover:bg-[#1c2026] text-[#8c90a0]">3</button>
            <span>...</span>
            <button className="px-2 py-1 rounded hover:bg-[#1c2026] text-[#8c90a0]">32</button>
            <button className="px-2 py-1 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb]">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE EVIDENCE DETAIL DOSSIER & RELATIONAL GRAPH */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 bg-[#181c22] p-5 rounded-xl border border-[#262a31]">
        {/* Left Column: Primary Evidence Record Breakdown (7 Cols) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          {/* Dossier Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1c2026] p-4 rounded-lg border border-[#262a31]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#1f6feb]/20 text-[#afc6ff] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">folder_open</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#dfe2eb] font-mono">{activeDossier.id}</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-xs font-semibold ${
                    activeDossier.status === 'PRESENT'
                      ? 'bg-[#007124]/30 text-[#7bdb80]'
                      : activeDossier.status === 'NOT_SUBMITTED'
                      ? 'bg-[#c55100]/40 text-[#ffb693]'
                      : 'bg-[#93000a]/40 text-[#ffb4ab]'
                  }`}>
                    {activeDossier.status}
                  </span>
                </div>
                <span className="text-xs text-[#c2c6d6]">{activeDossier.type} • {activeDossier.caseRef}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyHash}
                className="px-3 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs font-mono flex items-center gap-1 transition-colors border border-[#31353c]"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
              </button>
              <button
                onClick={() => alert("Enclave FIPS 140-2 Level 3 integrity verification completed.\nDigest Matches Signed HSM Payload SUB-2026-0148.")}
                className="px-3 py-1.5 rounded bg-[#1f6feb] text-white hover:brightness-110 text-xs font-semibold font-mono flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">security_update_good</span>
                <span>Verify HSM</span>
              </button>
            </div>
          </div>

          {/* Telemetry Attributes Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#0a0e14] p-3 rounded-lg border border-[#262a31] text-xs">
            <div>
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold block">Investigator</span>
              <span className="font-mono text-[#dfe2eb] font-medium">USR-204 (Sr Incident Handler)</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold block">Ingestion Stamp</span>
              <span className="font-mono text-[#dfe2eb]">{activeDossier.timestampDate} {activeDossier.timestampTime}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold block">Related Finding</span>
              <Link to="/findings/FND-0142" className="font-mono text-[#ffb4ab] underline font-semibold">
                FND-0142
              </Link>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold block">Primary Gap</span>
              <Link to="/analytics/execution-gaps" className="font-mono text-[#ffb693] underline font-semibold">
                GAP-0071
              </Link>
            </div>
          </div>

          {/* Structured Content Preview */}
          <div className="bg-[#1c2026] p-4 rounded-lg border border-[#262a31] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Structured Payload & Observation Log</span>
              <span className="font-mono text-[11px] text-[#8c90a0]">Format: JSON Normalized</span>
            </div>
            <div className="bg-[#0a0e14] p-3 rounded font-mono text-xs space-y-1 text-[#c2c6d6] overflow-x-auto border border-[#262a31]">
              <div className="text-[#7bdb80]"><span className="text-[#8c90a0]">01</span> {'{ "trigger_event": "SCADA_RTU_GATEWAY_ALARM_ALR-8821",'}</div>
              <div><span className="text-[#8c90a0]">02</span> {'  "severity_assessment": "CRITICAL_FIPS_FAILURE",'}</div>
              <div><span className="text-[#8c90a0]">03</span> {'  "triage_action": "Automated diagnostic triage executed via Playbook-44",'}</div>
              <div className="text-[#ffb693]"><span className="text-[#8c90a0]">04</span> {'  "escalation_threshold": "REACHED_EXCEEDED_SLA_15M",'}</div>
              <div className="text-[#ffb4ab] font-semibold">
                <span className="text-[#8c90a0]">05</span> {'  "escalation_record_observed": false /* NOT OBSERVED IN CANONICAL FEED; TRIGGERS ESC-221 GAP QUERY */,'}
              </div>
              <div><span className="text-[#8c90a0]">06</span> {'  "containment_status": "ISOLATED_PORT_4821",'}</div>
              <div><span className="text-[#8c90a0]">07</span> {'  "examiner_signoff": null }'}</div>
            </div>
          </div>

          {/* Cryptographic Provenance Card */}
          <div className="bg-[#1c2026] p-4 rounded-lg border border-[#262a31] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Cryptographic Provenance & Pipeline Attestation</span>
              <span className="inline-flex items-center gap-1 font-mono text-xs text-[#7bdb80]">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                Signed by CSE-014 CISO Office
              </span>
            </div>
            <div className="bg-[#0a0e14] p-3 rounded flex flex-col gap-1.5 font-mono text-xs border border-[#262a31]">
              <div className="flex items-center justify-between">
                <span className="text-[#8c90a0]">Submission Package ID:</span>
                <span className="text-[#dfe2eb] font-semibold">SUB-2026-0148</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8c90a0]">Canonical SHA-256 Digest:</span>
                <span className="text-[#afc6ff] truncate max-w-md">{activeDossier.hash}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#262a31]">
                <span className="text-[#8c90a0]">Control Baseline:</span>
                <span className="text-[#dfe2eb]">CTRL-07 v3.2 (Supervisory Escalation Schedule)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8c90a0]">Analytics Engine Rule:</span>
                <span className="text-[#dfe2eb]">R-2.4 (Execution Disconnect Detector)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8c90a0]">Enclave Ingestion Agent:</span>
                <span className="text-[#dfe2eb]">SAT-SA AN-1.8 Air-Gapped Connector</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Relational Graph & Lineage Chain (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <div className="bg-[#1c2026] p-4 rounded-lg border border-[#262a31] flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#afc6ff] text-[18px]">account_tree</span>
                <span className="text-sm font-semibold text-[#dfe2eb]">Relational Lineage Chain</span>
              </div>
              <span className="font-mono text-[11px] text-[#8c90a0]">Traceability Level: L4 Statutory</span>
            </div>

            {/* Vertical Interactive Chain Graph */}
            <div className="relative pl-6 space-y-3 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#31353c]">
              {/* Node 1: Target Evidence */}
              <div className="relative flex items-start gap-2">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#afc6ff] ring-4 ring-[#1c2026]"></span>
                <div className="bg-[#262a31] p-2.5 rounded w-full border border-[#1f6feb]/30">
                  <span className="text-[10px] text-[#8c90a0] uppercase font-bold">Target Evidence</span>
                  <div className="font-mono text-xs text-[#afc6ff] font-bold">{activeDossier.id} ({activeDossier.type})</div>
                </div>
              </div>

              {/* Node 2: Parent Investigation */}
              <div className="relative flex items-start gap-2">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#8c90a0] ring-4 ring-[#1c2026]"></span>
                <div className="bg-[#0a0e14] p-2.5 rounded w-full border border-[#262a31]">
                  <span className="text-[10px] text-[#8c90a0] uppercase font-bold">Parent Investigation</span>
                  <div className="font-mono text-xs text-[#dfe2eb]">INV-338 (RTU Failover Analysis)</div>
                </div>
              </div>

              {/* Node 3: Root Case */}
              <div className="relative flex items-start gap-2">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#8c90a0] ring-4 ring-[#1c2026]"></span>
                <div className="bg-[#0a0e14] p-2.5 rounded w-full border border-[#262a31]">
                  <span className="text-[10px] text-[#8c90a0] uppercase font-bold">Root Security Case</span>
                  <div className="font-mono text-xs text-[#dfe2eb]">CASE-1042 (Substation Comms Drop)</div>
                </div>
              </div>

              {/* Node 4: Gap Detection */}
              <div className="relative flex items-start gap-2">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#ffb693] ring-4 ring-[#1c2026] animate-pulse"></span>
                <div className="bg-[#c55100]/20 p-2.5 rounded w-full border border-[#c55100]/40">
                  <span className="text-[10px] text-[#ffb693] uppercase font-bold">Execution Gap Detected</span>
                  <div className="font-mono text-xs text-[#ffb693] font-bold">GAP-0071 (Missing Escalation Telemetry)</div>
                  <span className="text-xs text-[#c2c6d6] block mt-0.5">Missing link to ESC-221 within 30 min window</span>
                </div>
              </div>

              {/* Node 5: Finding Candidate */}
              <div className="relative flex items-start gap-2">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#ffb4ab] ring-4 ring-[#1c2026]"></span>
                <div className="bg-[#93000a]/20 p-2.5 rounded w-full border border-[#93000a]/40">
                  <span className="text-[10px] text-[#ffb4ab] uppercase font-bold">Supervisory Finding Candidate</span>
                  <div className="font-mono text-xs text-[#ffb4ab] font-bold">FND-0142 (CTRL-07 Breach)</div>
                </div>
              </div>

              {/* Node 6: Recommended Remediation */}
              <div className="relative flex items-start gap-2">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#7bdb80] ring-4 ring-[#1c2026]"></span>
                <div className="bg-[#0a0e14] p-2.5 rounded w-full border border-[#262a31]">
                  <span className="text-[10px] text-[#8c90a0] uppercase font-bold">Remediation Action Item</span>
                  <div className="font-mono text-xs text-[#7bdb80]">REM-0038 (Escalation Relay Hardening)</div>
                </div>
              </div>
            </div>

            {/* Cross-Evidence Missing Linkage Notice */}
            <div className="bg-[#c55100]/20 p-3 rounded border border-[#c55100]/40 mt-2 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-[#ffb693] font-semibold">
                <span className="material-symbols-outlined text-[18px]">link_off</span>
                <span>Unlinked Mandatory Evidence: ESC-221</span>
              </div>
              <p className="text-[#c2c6d6] leading-relaxed">
                Control baseline CTRL-07 mandates a certified Tier-3 escalation log within 15 minutes of threshold breach. This item was omitted from submission package SUB-2026-0148.
              </p>
              <div className="flex items-center justify-end mt-1">
                <button
                  onClick={() => {
                    setRequestTarget({ id: 'ESC-221', caseRef: 'CASE-1042' });
                    setShowRequestModal(true);
                  }}
                  className="px-3 py-1 rounded bg-[#c55100] text-white hover:brightness-110 font-semibold"
                >
                  Launch Direct Evidence Query
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. EXPECTED EVIDENCE VS OBSERVED EVIDENCE MATRIX (CTRL-07 BASELINE) */}
      <div className="bg-[#181c22] p-5 rounded-xl border border-[#262a31] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#262a31] flex items-center justify-center text-[#afc6ff]">
              <span className="material-symbols-outlined text-[20px]">checklist_rtl</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#dfe2eb]">Expected Evidence Baseline Matrix</h2>
              <span className="text-xs text-[#8c90a0]">Mandated by NCIIPC Framework: CTRL-07 Incident Escalation Schedule</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/analytics/negative-space"
              className="px-3 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#afc6ff] text-xs font-mono flex items-center gap-1 border border-[#31353c]"
            >
              <span className="material-symbols-outlined text-[16px]">radar</span>
              <span>Negative Space Analysis (NS-0041)</span>
            </Link>
          </div>
        </div>

        {/* The 5 Baseline Elements */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-1 text-xs">
          {/* Item 1: Investigation Record */}
          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between gap-2 border border-[#262a31]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[#7bdb80] font-semibold">✓ PRESENT</span>
              <span className="material-symbols-outlined text-[#7bdb80] text-[18px]">task_alt</span>
            </div>
            <div>
              <span className="font-semibold text-[#dfe2eb] block">Investigation Record</span>
              <span className="font-mono text-[11px] text-[#8c90a0]">EVD-742 (INV-338)</span>
            </div>
            <div className="text-[11px] text-[#7bdb80] bg-[#007124]/20 p-1 rounded font-mono">
              Canonical hash verified
            </div>
          </div>

          {/* Item 2: Escalation Record (Breakage) */}
          <div className="bg-[#c55100]/15 p-3 rounded-lg flex flex-col justify-between gap-2 border border-[#c55100]/40">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[#ffb693] font-bold">✕ NOT_SUBMITTED</span>
              <span className="material-symbols-outlined text-[#ffb693] text-[18px]">cancel</span>
            </div>
            <div>
              <span className="font-semibold text-[#ffb693] block">Escalation Record</span>
              <span className="font-mono text-[11px] text-[#8c90a0]">ESC-221 (Expected)</span>
            </div>
            <div className="text-[11px] text-[#ffb693] bg-[#c55100]/30 p-1 rounded font-mono">
              Missing ≠ Confirmed Failure
            </div>
          </div>

          {/* Item 3: Escalation Rationale */}
          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between gap-2 border border-[#262a31]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[#8c90a0] font-semibold">? UNKNOWN</span>
              <span className="material-symbols-outlined text-[#8c90a0] text-[18px]">help_outline</span>
            </div>
            <div>
              <span className="font-semibold text-[#dfe2eb] block">Escalation Rationale</span>
              <span className="font-mono text-[11px] text-[#8c90a0]">Pending Dispatch Log</span>
            </div>
            <div className="text-[11px] text-[#8c90a0] bg-[#262a31] p-1 rounded font-mono">
              Dependent on ESC-221
            </div>
          </div>

          {/* Item 4: Response Record */}
          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between gap-2 border border-[#262a31]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[#7bdb80] font-semibold">✓ PRESENT</span>
              <span className="material-symbols-outlined text-[#7bdb80] text-[18px]">task_alt</span>
            </div>
            <div>
              <span className="font-semibold text-[#dfe2eb] block">Response Record</span>
              <span className="font-mono text-[11px] text-[#8c90a0]">EVD-761 (RSP-089)</span>
            </div>
            <div className="text-[11px] text-[#7bdb80] bg-[#007124]/20 p-1 rounded font-mono">
              Contained 11:08 IST
            </div>
          </div>

          {/* Item 5: Closure Evidence */}
          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between gap-2 border border-[#262a31]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[#7bdb80] font-semibold">✓ PRESENT</span>
              <span className="material-symbols-outlined text-[#7bdb80] text-[18px]">task_alt</span>
            </div>
            <div>
              <span className="font-semibold text-[#dfe2eb] block">Closure Evidence</span>
              <span className="font-mono text-[11px] text-[#8c90a0]">CLS-421 (Formal Sign)</span>
            </div>
            <div className="text-[11px] text-[#7bdb80] bg-[#007124]/20 p-1 rounded font-mono">
              Closed 12:03 IST
            </div>
          </div>
        </div>

        {/* Matrix Summary & Coverage Bar */}
        <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-[#262a31] text-xs">
          <div className="flex items-center gap-4">
            <span className="font-mono font-semibold text-[#dfe2eb]">CTRL-07 Evidence Fulfillment: 78%</span>
            <div className="w-48 h-2 bg-[#262a31] rounded-full overflow-hidden flex">
              <div className="bg-[#7bdb80] h-full" style={{ width: '78%' }}></div>
              <div className="bg-[#ffb693] h-full" style={{ width: '22%' }}></div>
            </div>
          </div>
          <span className="font-mono text-[#8c90a0]">1 of 5 items absent from submission package</span>
        </div>
      </div>

      {/* 7. EVIDENCE TIMELINE (CASE-1042 RECONSTRUCTION) */}
      <div className="bg-[#181c22] p-5 rounded-xl border border-[#262a31] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#262a31] flex items-center justify-center text-[#afc6ff]">
              <span className="material-symbols-outlined text-[20px]">history_toggle_off</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#dfe2eb]">Audit Chronology: CASE-1042 Incident Reconstruction</h2>
              <span className="text-xs text-[#8c90a0]">Chronological evidence sequencing highlighting execution disconnects</span>
            </div>
          </div>
          <span className="font-mono text-xs text-[#8c90a0]">Clock: Asia/Kolkata (IST)</span>
        </div>

        {/* Horizontal / Step Timeline Strip */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {/* Step 1 */}
          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div className="font-mono text-xs text-[#ffb4ab] font-semibold">09:12 IST</div>
            <div className="my-2">
              <div className="font-mono text-xs text-[#dfe2eb] font-semibold">ALR-8821</div>
              <span className="text-[11px] text-[#8c90a0] block">Alert Generated</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#93000a]/30 text-[#ffb4ab] font-mono text-[10px] w-max">Sev: Critical</span>
          </div>

          {/* Step 2 */}
          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div className="font-mono text-xs text-[#afc6ff] font-semibold">09:18 IST</div>
            <div className="my-2">
              <div className="font-mono text-xs text-[#dfe2eb] font-semibold">CASE-1042</div>
              <span className="text-[11px] text-[#8c90a0] block">Case Opened</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#c2c6d6] font-mono text-[10px] w-max">SOC Core</span>
          </div>

          {/* Step 3 */}
          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div className="font-mono text-xs text-[#7bdb80] font-semibold">09:42 IST</div>
            <div className="my-2">
              <div className="font-mono text-xs text-[#dfe2eb] font-semibold">INV-338 / EVD-742</div>
              <span className="text-[11px] text-[#8c90a0] block">Investigation Commenced</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#007124]/30 text-[#7bdb80] font-mono text-[10px] w-max">USR-204</span>
          </div>

          {/* Step 4 */}
          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div className="font-mono text-xs text-[#7bdb80] font-semibold">10:17 IST</div>
            <div className="my-2">
              <div className="font-mono text-xs text-[#dfe2eb] font-semibold">EVD-742 Att.</div>
              <span className="text-[11px] text-[#8c90a0] block">Forensic Snapshot</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#007124]/30 text-[#7bdb80] font-mono text-[10px] w-max">Verified</span>
          </div>

          {/* Step 5: (EXECUTION GAP CANDIDATE) */}
          <div className="bg-[#c55100]/20 p-3 rounded-lg flex flex-col justify-between border border-[#c55100]/50">
            <div className="font-mono text-xs text-[#ffb693] font-bold">10:45 IST</div>
            <div className="my-2">
              <div className="font-mono text-xs text-[#ffb693] font-bold">[EXPECTED ESC]</div>
              <span className="text-[11px] text-[#ffb693] block font-medium">MISSING SUBMISSION</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#c55100] text-white font-mono text-[10px] font-semibold w-max">GAP-0071</span>
          </div>

          {/* Step 6 */}
          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div className="font-mono text-xs text-[#7bdb80] font-semibold">11:08 IST</div>
            <div className="my-2">
              <div className="font-mono text-xs text-[#dfe2eb] font-semibold">EVD-761 (RSP-089)</div>
              <span className="text-[11px] text-[#8c90a0] block">Containment Logged</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#007124]/30 text-[#7bdb80] font-mono text-[10px] w-max">SOAR Auto</span>
          </div>

          {/* Step 7 */}
          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div className="font-mono text-xs text-[#c2c6d6] font-semibold">12:03 IST</div>
            <div className="my-2">
              <div className="font-mono text-xs text-[#dfe2eb] font-semibold">CLS-421</div>
              <span className="text-[11px] text-[#8c90a0] block">Case Closed</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#c2c6d6] font-mono text-[10px] w-max">Signed</span>
          </div>
        </div>

        {/* Visual Chronology Callout */}
        <div className="bg-[#1c2026] p-3 rounded-lg flex items-center gap-3 border border-[#262a31] text-xs">
          <span className="material-symbols-outlined text-[20px] text-[#ffb693] shrink-0">crisis_alert</span>
          <p className="text-[#dfe2eb] leading-relaxed">
            <strong className="text-[#ffb693]">Chronology Disconnect:</strong> The 10:45 IST mandatory escalation window is unaccounted for in canonical feeds. While subsequent containment (11:08) succeeded, the supervisory candidate <strong className="text-white font-mono">GAP-0071 / FND-0142</strong> requires accredited examiner validation before any non-compliance notation.
          </p>
        </div>
      </div>

      {/* 8. STATUTORY HUMAN-IN-THE-LOOP SAFEGUARDS & NAVIGATION BAR */}
      <footer className="bg-[#181c22] p-5 rounded-xl border border-[#262a31] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3 max-w-3xl">
          <span className="material-symbols-outlined text-[24px] text-[#afc6ff] shrink-0 mt-0.5">gavel</span>
          <div>
            <h3 className="text-sm font-semibold text-[#dfe2eb]">Statutory Supervisory Safeguard (Human-in-the-Loop)</h3>
            <p className="text-xs text-[#c2c6d6] mt-0.5 leading-relaxed">
              Evidence Explorer provides factual traceability, hash validation, and metadata normalization. The absence or presence of telemetry does not autonomously establish statutory non-compliance. Final supervisory conclusions remain the sole authority of the accredited examiner under NCIIPC guidelines.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0 text-xs">
          <Link
            to="/supervision/cses/CSE-014"
            className="px-3 py-2 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] font-medium transition-colors border border-[#262a31]"
          >
            CSE Assessment (CSE-014)
          </Link>
          <Link
            to="/analytics/negative-space"
            className="px-3 py-2 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] font-medium transition-colors border border-[#262a31]"
          >
            Negative Space
          </Link>
          <Link
            to="/findings/FND-0142"
            className="px-4 py-2 rounded bg-[#1f6feb] text-white hover:brightness-110 font-semibold transition-all"
          >
            Open Examiner Workspace (FND-0142)
          </Link>
        </div>
      </footer>

      {/* MODAL: REQUEST EVIDENCE */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181c22] w-full max-w-xl rounded-xl p-5 flex flex-col gap-4 shadow-2xl border border-[#262a31]">
            <div className="flex items-center justify-between pb-2 border-b border-[#31353c]">
              <div className="flex items-center gap-2 text-[#afc6ff]">
                <span className="material-symbols-outlined text-[20px]">send</span>
                <h3 className="font-semibold text-sm text-[#dfe2eb]">Issue Evidence Request Notice</h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-[#8c90a0] hover:text-[#dfe2eb]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-[#8c90a0] font-bold block mb-1">Target Entity</label>
                  <input
                    disabled
                    value="CSE-014 (NorthGrid Energy)"
                    className="w-full bg-[#1c2026] text-[#dfe2eb] p-2 rounded border border-[#262a31] font-mono text-xs cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[#8c90a0] font-bold block mb-1">Related Case</label>
                  <input
                    value={requestTarget.caseRef}
                    onChange={(e) => setRequestTarget({ ...requestTarget, caseRef: e.target.value })}
                    className="w-full bg-[#1c2026] text-[#dfe2eb] p-2 rounded border border-[#262a31] font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase text-[#8c90a0] font-bold block mb-1">Expected Evidence Identifier</label>
                <input
                  value={requestTarget.id}
                  onChange={(e) => setRequestTarget({ ...requestTarget, id: e.target.value })}
                  className="w-full bg-[#1c2026] text-[#dfe2eb] p-2 rounded border border-[#262a31] font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-[#8c90a0] font-bold block mb-1">Statutory Rationale & Baseline Control</label>
                <textarea
                  rows={3}
                  defaultValue="Inquiry regarding unaccounted 30m escalation dispatch interval observed during triage of ALR-8821. Submission package SUB-2026-0148 lacks corresponding tier-3 dispatch telemetry mandated by CTRL-07."
                  className="w-full bg-[#1c2026] text-[#dfe2eb] p-2 rounded border border-[#262a31] font-sans text-xs focus:outline-none"
                />
              </div>
              <div className="p-2.5 bg-[#1c2026] rounded text-[#c2c6d6] flex items-start gap-2 border border-[#262a31]">
                <span className="material-symbols-outlined text-[18px] text-[#ffb693] shrink-0 mt-0.5">info</span>
                <span>Entity will be allocated standard 72-hour formal telemetry ingestion window. This notice does not assert fault.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#31353c]">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded bg-[#262a31] text-[#c2c6d6] text-xs hover:bg-[#31353c]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Supervisory Telemetry Query Transmitted to CSE-014 CISO Office Enclave. 72-Hour Response Timer Initiated.");
                  setShowRequestModal(false);
                }}
                className="px-4 py-2 rounded bg-[#1f6feb] text-white text-xs font-semibold hover:brightness-110"
              >
                Transmit Formal Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT EVIDENCE INDEX */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181c22] w-full max-w-md rounded-xl p-5 flex flex-col gap-4 shadow-2xl border border-[#262a31]">
            <div className="flex items-center justify-between pb-2 border-b border-[#31353c]">
              <h3 className="font-semibold text-sm text-[#dfe2eb]">Export Cryptographic Index</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-[#8c90a0] hover:text-[#dfe2eb]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#c2c6d6]">
              <p>
                Exporting complete normalized evidence catalog including SHA-256 digests and air-gapped enclave provenance attestations.
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2.5 bg-[#1c2026] rounded border border-[#262a31] cursor-pointer">
                  <input defaultChecked name="exportFormat" type="radio" className="text-[#1f6feb]" />
                  <div>
                    <span className="text-[#dfe2eb] font-semibold block">JSON Ledger (Canonical Provenance)</span>
                    <span className="text-[#8c90a0] text-[11px]">Full cryptographic chain with FIPS-140-2 verification tokens</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-[#1c2026] rounded border border-[#262a31] cursor-pointer">
                  <input name="exportFormat" type="radio" className="text-[#1f6feb]" />
                  <div>
                    <span className="text-[#dfe2eb] font-semibold block">CSV Flat Index (Supervisory Audit)</span>
                    <span className="text-[#8c90a0] text-[11px]">Normalized tabular metadata suitable for spreadsheet review</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#31353c]">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded bg-[#262a31] text-[#c2c6d6] text-xs hover:bg-[#31353c]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Export generation initiated. File: SAT_SA_EVIDENCE_INDEX_CSE014_Q3_2026.json");
                  setShowExportModal(false);
                }}
                className="px-4 py-2 rounded bg-[#1f6feb] text-white text-xs font-semibold hover:brightness-110"
              >
                Generate & Download Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
