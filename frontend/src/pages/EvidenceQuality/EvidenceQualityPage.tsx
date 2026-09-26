import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface EvidenceRecord {
  id: string;
  classification: string;
  entity: string;
  caseRef: string;
  control: string;
  source: string;
  timestamp: string;
  status: 'PRESENT' | 'NOT_SUBMITTED' | 'ABSENT_CONFIRMED' | 'UNKNOWN' | 'NOT_APPLICABLE';
  traceability: 'Traceable' | 'Unverified' | 'Incomplete';
  integrity: 'Verified (SHA-256)' | 'Hash Pending' | 'Tamper Suspected';
  consistency: 'Consistent' | 'Potential Conflict' | 'Unknown';
}

const mockEvidenceRecords: EvidenceRecord[] = [
  {
    id: 'EVD-742',
    classification: 'Investigation Evd',
    entity: 'CSE-014',
    caseRef: 'CASE-1042',
    control: 'CTRL-07',
    source: 'SOC Case System',
    timestamp: '14 Sep 2026 11:46',
    status: 'PRESENT',
    traceability: 'Traceable',
    integrity: 'Verified (SHA-256)',
    consistency: 'Consistent',
  },
  {
    id: 'EVD-761',
    classification: 'Response Evidence',
    entity: 'CSE-014',
    caseRef: 'CASE-1042',
    control: 'CTRL-07',
    source: 'SOC Case System',
    timestamp: '14 Sep 2026 15:08',
    status: 'PRESENT',
    traceability: 'Traceable',
    integrity: 'Verified (SHA-256)',
    consistency: 'Consistent',
  },
  {
    id: 'ESC-221',
    classification: 'Escalation Evd',
    entity: 'CSE-014',
    caseRef: 'CASE-1042',
    control: 'CTRL-07',
    source: 'SOC Workflow Engine',
    timestamp: '—',
    status: 'NOT_SUBMITTED',
    traceability: 'Unverified',
    integrity: 'Hash Pending',
    consistency: 'Unknown',
  },
  {
    id: 'EVD-733',
    classification: 'Investigation Evd',
    entity: 'CSE-014',
    caseRef: 'CASE-1037',
    control: 'CTRL-12',
    source: 'SOC Case System',
    timestamp: '12 Sep 2026 09:22',
    status: 'PRESENT',
    traceability: 'Traceable',
    integrity: 'Verified (SHA-256)',
    consistency: 'Potential Conflict',
  },
  {
    id: 'EVD-801',
    classification: 'Perimeter FW Log',
    entity: 'CSE-014',
    caseRef: 'Unlinked',
    control: 'Unknown',
    source: 'Edge SCADA Sys',
    timestamp: '10 Sep 2026 02:14',
    status: 'PRESENT',
    traceability: 'Incomplete',
    integrity: 'Verified (SHA-256)',
    consistency: 'Consistent',
  },
  {
    id: 'EVD-803',
    classification: 'Audit Trail Log',
    entity: 'CSE-014',
    caseRef: 'CASE-1021',
    control: 'CTRL-04',
    source: 'Bastion Proxy',
    timestamp: '08 Sep 2026 14:30',
    status: 'UNKNOWN',
    traceability: 'Traceable',
    integrity: 'Hash Pending',
    consistency: 'Consistent',
  },
  {
    id: 'EVD-644',
    classification: 'Triage PCAP Capture',
    entity: 'CSE-014',
    caseRef: 'CASE-0987',
    control: 'CTRL-02',
    source: 'Network TAP',
    timestamp: '02 Sep 2026 18:05',
    status: 'PRESENT',
    traceability: 'Traceable',
    integrity: 'Verified (SHA-256)',
    consistency: 'Consistent',
  },
];

export const EvidenceQualityPage: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState('CSE-014');
  const [selectedPeriod, setSelectedPeriod] = useState('Q3 2026');
  const [selectedSource, setSelectedSource] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord>(mockEvidenceRecords[0]);
  const [showInjunctionNotice, setShowInjunctionNotice] = useState(false);
  const [noticeSubmitted, setNoticeSubmitted] = useState(false);

  // Filtered evidence rows
  const filteredRecords = mockEvidenceRecords.filter((rec) => {
    const matchesSearch =
      rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.caseRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.control.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.classification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Context Header Bar */}
      <section className="flex flex-col gap-2 pb-4 pt-1 border-b border-[#31353c]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 font-mono text-xs text-[#c2c6d6]">
              <span className="hover:text-[#afc6ff] cursor-pointer transition-colors">SAT-SA</span>
              <span>/</span>
              <span className="hover:text-[#afc6ff] cursor-pointer transition-colors">Analytics</span>
              <span>/</span>
              <span className="text-[#afc6ff] font-semibold">Evidence Quality</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl text-[#dfe2eb] tracking-tight font-bold">Evidence Quality</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#262a31] text-[#8c90a0]">
                v4.8-GOV-FIPS
              </span>
            </div>
            <p className="text-xs text-[#c2c6d6] max-w-4xl">
              Assess whether submitted and observed evidence is complete, traceable, internally consistent, and sufficiently reliable for supervisory review.
            </p>
          </div>

          {/* Global Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center bg-[#262a31] rounded px-3 py-1.5 gap-2 border border-[#424754]/40">
              <span className="text-[11px] uppercase text-[#8c90a0] font-bold">Period:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                aria-label="Filter by Period"
                className="bg-transparent text-[#dfe2eb] font-mono focus:outline-none cursor-pointer"
              >
                <option value="Q3 2026" className="bg-[#262a31]">Q3 2026</option>
                <option value="Q2 2026" className="bg-[#262a31]">Q2 2026</option>
                <option value="Q1 2026" className="bg-[#262a31]">Q1 2026</option>
              </select>
            </div>
            <div className="flex items-center bg-[#262a31] rounded px-3 py-1.5 gap-2 border border-[#424754]/40">
              <span className="text-[11px] uppercase text-[#8c90a0] font-bold">Entity:</span>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                aria-label="Filter by Entity"
                className="bg-transparent text-[#dfe2eb] font-mono focus:outline-none cursor-pointer"
              >
                <option value="CSE-014" className="bg-[#262a31]">CSE-014 (Energy Sector, Critical Priority)</option>
                <option value="CSE-009" className="bg-[#262a31]">CSE-009 (Finance Sector, Tier 1)</option>
                <option value="CSE-023" className="bg-[#262a31]">CSE-023 (Telecom Sector, Tier 1)</option>
              </select>
            </div>
            <div className="flex items-center bg-[#262a31] rounded px-3 py-1.5 gap-2 border border-[#424754]/40">
              <span className="text-[11px] uppercase text-[#8c90a0] font-bold">Source:</span>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                aria-label="Filter by Source"
                className="bg-transparent text-[#dfe2eb] font-mono focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#262a31]">All Sources (SIEM, Case, Firewall, Audit)</option>
                <option value="SIEM" className="bg-[#262a31]">SIEM Telemetry Logs</option>
                <option value="Case" className="bg-[#262a31]">SOC Case Management</option>
                <option value="FW" className="bg-[#262a31]">Perimeter Edge FW</option>
              </select>
            </div>
            <button
              onClick={() => alert('Exporting Audit Compliance Report (PDF/SHA-256 ledger)...')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#31353c] hover:bg-[#353940] text-[#dfe2eb] font-mono transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export Audit</span>
            </button>
            <button
              onClick={() => alert('Telemetry store synchronized. Ingestion hashes verified.')}
              className="p-1.5 rounded bg-[#31353c] hover:bg-[#353940] text-[#c2c6d6] hover:text-[#dfe2eb] transition-colors"
              title="Sync Telemetry Store"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>
      </section>

      {/* Hero Summary Strip & Synthesis Engine */}
      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          {/* Main Score Card */}
          <div className="xl:col-span-4 bg-[#181c22] rounded-lg p-5 flex flex-col justify-between relative overflow-hidden border border-[#262a31]">
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#afc6ff]/5 pointer-events-none blur-2xl"></div>
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-[#8c90a0] font-bold">Supervisory Index</span>
                <span className="text-xl text-[#dfe2eb] font-bold">Evidence Readiness</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#c55100]/30 text-[#ffb693] font-mono text-xs font-semibold border border-[#c55100]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb693] animate-pulse"></span>
                REVIEW REQUIRED
              </span>
            </div>
            <div className="my-4 flex items-baseline gap-4">
              <span className="text-[44px] leading-none font-bold text-[#ffb693] font-mono">71%</span>
              <div className="flex flex-col">
                <span className="font-mono text-xs text-[#ffb4ab] font-medium">-19% vs 90% Benchmark</span>
                <span className="text-xs text-[#c2c6d6]">Statutory Minimum: 85%</span>
              </div>
            </div>
            {/* Metric bar indicator */}
            <div className="w-full flex flex-col gap-1.5">
              <div className="w-full h-2 bg-[#31353c] rounded-full overflow-hidden flex">
                <div className="bg-[#ffb693] h-full rounded-full transition-all duration-500" style={{ width: '71%' }}></div>
              </div>
              <div className="flex justify-between font-mono text-[11px] text-[#8c90a0]">
                <span>0%</span>
                <span className="text-[#ffb693] font-semibold">Current: 71%</span>
                <span>Target: 90%</span>
              </div>
            </div>
          </div>

          {/* Synthesis Formula & Compact Stat Matrix */}
          <div className="xl:col-span-8 bg-[#181c22] rounded-lg p-5 flex flex-col justify-between gap-4 border border-[#262a31]">
            {/* Formula Display */}
            <div className="flex flex-col gap-1 bg-[#0a0e14] p-3 rounded border border-[#262a31]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase text-[#8c90a0] tracking-wider font-bold">
                  Formula: Ingestion Synthesis Engine v2.4
                </span>
                <span className="font-mono text-[11px] text-[#7bdb80]">Weight: EQUAL_WEIGHT_BALANCED</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-[#dfe2eb] py-1">
                <span className="text-[#afc6ff] font-medium">Completeness <span className="text-[#c2c6d6]">(82%)</span></span>
                <span className="text-[#8c90a0] font-bold">+</span>
                <span className="text-[#7bdb80] font-medium">Traceability <span className="text-[#c2c6d6]">(91%)</span></span>
                <span className="text-[#8c90a0] font-bold">+</span>
                <span className="text-[#7bdb80] font-medium">Integrity <span className="text-[#c2c6d6]">(96%)</span></span>
                <span className="text-[#8c90a0] font-bold">+</span>
                <span className="text-[#afc6ff] font-medium">Consistency <span className="text-[#c2c6d6]">(87%)</span></span>
                <span className="text-[#8c90a0] font-bold">+</span>
                <span className="text-[#ffb693] font-medium">Coverage <span className="text-[#c2c6d6]">(72%)</span></span>
                <span className="text-[#8c90a0]">→</span>
                <span className="px-2 py-0.5 rounded bg-[#c55100]/30 text-[#ffb693] font-semibold border border-[#c55100]/40">
                  Readiness (71%)
                </span>
              </div>
            </div>

            {/* 6 Compact Stat Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="bg-[#1c2026] p-3 rounded flex flex-col border border-[#262a31]">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Records Ingested</span>
                <span className="text-xl text-[#dfe2eb] font-bold mt-1 font-mono">184</span>
                <span className="font-mono text-[10px] text-[#c2c6d6]">225 Target</span>
              </div>
              <div className="bg-[#1c2026] p-3 rounded flex flex-col border border-[#262a31]">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Completeness</span>
                <span className="text-xl text-[#afc6ff] font-bold mt-1 font-mono">82%</span>
                <span className="font-mono text-[10px] text-[#ffb693]">41 Deficits</span>
              </div>
              <div className="bg-[#1c2026] p-3 rounded flex flex-col border border-[#262a31]">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Traceability</span>
                <span className="text-xl text-[#7bdb80] font-bold mt-1 font-mono">91%</span>
                <span className="font-mono text-[10px] text-[#c2c6d6]">17 Unlinked</span>
              </div>
              <div className="bg-[#1c2026] p-3 rounded flex flex-col border border-[#262a31]">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Integrity</span>
                <span className="text-xl text-[#7bdb80] font-bold mt-1 font-mono">96%</span>
                <span className="font-mono text-[10px] text-[#7bdb80]">177 SHA-256</span>
              </div>
              <div className="bg-[#1c2026] p-3 rounded flex flex-col border border-[#262a31]">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Consistency</span>
                <span className="text-xl text-[#afc6ff] font-bold mt-1 font-mono">87%</span>
                <span className="font-mono text-[10px] text-[#ffb4ab]">24 Clashes</span>
              </div>
              <div className="bg-[#1c2026] p-3 rounded flex flex-col border border-[#262a31]">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Control Scope</span>
                <span className="text-xl text-[#ffb693] font-bold mt-1 font-mono">72%</span>
                <span className="font-mono text-[10px] text-[#c2c6d6]">18/25 Rules</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Evidence Quality Dimension Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#afc6ff]">analytics</span>
            <h2 className="text-lg text-[#dfe2eb] font-semibold">Evidence Quality Dimensions</h2>
          </div>
          <span className="font-mono text-xs text-[#8c90a0]">Supervisory Evaluation Standard NCIIPC-DOC-2026-EQ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1: Completeness */}
          <div className="bg-[#181c22] rounded-lg p-4 flex flex-col justify-between hover:bg-[#1c2026] transition-colors border border-[#262a31]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#8c90a0] tracking-wider font-bold">Dimension 01</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#1f6feb]/20 text-[#afc6ff] font-semibold">82%</span>
              </div>
              <h3 className="text-sm text-[#dfe2eb] font-semibold mt-1">Completeness</h3>
              <p className="text-xs text-[#c2c6d6] italic">"Is expected evidence available?"</p>
              <div className="mt-2 flex flex-col gap-1 font-mono text-[11px] bg-[#0a0e14] p-2 rounded">
                <div className="flex justify-between text-[#dfe2eb]">
                  <span>Available:</span>
                  <span className="text-[#7bdb80] font-medium">184 records</span>
                </div>
                <div className="flex justify-between text-[#dfe2eb]">
                  <span>Missing / Delayed:</span>
                  <span className="text-[#ffb4ab] font-medium">41 records</span>
                </div>
              </div>
            </div>
            <Link
              to="/analytics/negative-space"
              className="mt-3 flex items-center justify-between text-[#afc6ff] font-mono text-xs hover:underline pt-2 border-t border-[#262a31]"
            >
              <span>Review Negative Space (4)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Card 2: Traceability */}
          <div className="bg-[#181c22] rounded-lg p-4 flex flex-col justify-between hover:bg-[#1c2026] transition-colors border border-[#262a31]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#8c90a0] tracking-wider font-bold">Dimension 02</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#007124]/20 text-[#7bdb80] font-semibold">91%</span>
              </div>
              <h3 className="text-sm text-[#dfe2eb] font-semibold mt-1">Traceability</h3>
              <p className="text-xs text-[#c2c6d6] italic">"Can evidence be traced to source & period?"</p>
              <div className="mt-2 flex flex-col gap-1 font-mono text-[11px] bg-[#0a0e14] p-2 rounded">
                <div className="flex justify-between text-[#dfe2eb]">
                  <span>Fully Mapped:</span>
                  <span className="text-[#7bdb80] font-medium">167 records</span>
                </div>
                <div className="flex justify-between text-[#dfe2eb]">
                  <span>Unlinked / Orphaned:</span>
                  <span className="text-[#ffb693] font-medium">17 records</span>
                </div>
              </div>
            </div>
            <Link
              to="/evidence"
              className="mt-3 flex items-center justify-between text-[#afc6ff] font-mono text-xs hover:underline pt-2 border-t border-[#262a31]"
            >
              <span>Review Traceability Gaps</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Card 3: Cryptographic Integrity */}
          <div className="bg-[#181c22] rounded-lg p-4 flex flex-col justify-between hover:bg-[#1c2026] transition-colors border border-[#262a31]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#8c90a0] tracking-wider font-bold">Dimension 03</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#007124]/20 text-[#7bdb80] font-semibold">96%</span>
              </div>
              <h3 className="text-sm text-[#dfe2eb] font-semibold mt-1">Cryptographic Integrity</h3>
              <p className="text-xs text-[#c2c6d6] italic">"Can evidence tampering be ruled out?"</p>
              <div className="mt-2 flex flex-col gap-1 font-mono text-[11px] bg-[#0a0e14] p-2 rounded">
                <div className="flex justify-between text-[#dfe2eb]">
                  <span>SHA-256 Validated:</span>
                  <span className="text-[#7bdb80] font-medium">177 records</span>
                </div>
                <div className="flex justify-between text-[#dfe2eb]">
                  <span>Pending / Tamper:</span>
                  <span className="text-[#8c90a0] font-medium">7 pending (0 tamper)</span>
                </div>
              </div>
            </div>
            <Link
              to="/governance/audit"
              className="mt-3 flex items-center justify-between text-[#afc6ff] font-mono text-xs hover:underline pt-2 border-t border-[#262a31]"
            >
              <span>View Provenance Ledger</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Card 4: Cross-Source Consistency */}
          <div className="bg-[#181c22] rounded-lg p-4 flex flex-col justify-between hover:bg-[#1c2026] transition-colors border border-[#262a31]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#8c90a0] tracking-wider font-bold">Dimension 04</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#1f6feb]/20 text-[#afc6ff] font-semibold">87%</span>
              </div>
              <h3 className="text-sm text-[#dfe2eb] font-semibold mt-1">Cross-Source Consistency</h3>
              <p className="text-xs text-[#c2c6d6] italic">"Do related telemetry sources corroborate?"</p>
              <div className="mt-2 flex flex-col gap-1 font-mono text-[11px] bg-[#0a0e14] p-2 rounded">
                <div className="flex justify-between text-[#dfe2eb]">
                  <span>Corroborated:</span>
                  <span className="text-[#7bdb80] font-medium">160 records</span>
                </div>
                <div className="flex justify-between text-[#dfe2eb]">
                  <span>Conflicts Detected:</span>
                  <span className="text-[#ffb4ab] font-medium">24 clashes</span>
                </div>
              </div>
            </div>
            <Link
              to="/analytics/consistency"
              className="mt-3 flex items-center justify-between text-[#afc6ff] font-mono text-xs hover:underline pt-2 border-t border-[#262a31]"
            >
              <span>Review Consistency</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Card 5: Control Coverage */}
          <div className="bg-[#181c22] rounded-lg p-4 flex flex-col justify-between hover:bg-[#1c2026] transition-colors border border-[#262a31]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#8c90a0] tracking-wider font-bold">Dimension 05</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#c55100]/30 text-[#ffb693] font-semibold">72%</span>
              </div>
              <h3 className="text-sm text-[#dfe2eb] font-semibold mt-1">Control Coverage</h3>
              <p className="text-xs text-[#c2c6d6] italic">"Is full supervisory scope evidenced?"</p>
              <div className="mt-2 flex flex-col gap-1 font-mono text-[11px] bg-[#0a0e14] p-2 rounded">
                <div className="flex justify-between text-[#dfe2eb]">
                  <span>Covered Categories:</span>
                  <span className="text-[#7bdb80] font-medium">18 Categories</span>
                </div>
                <div className="flex justify-between text-[#dfe2eb]">
                  <span>Missing / Unknown:</span>
                  <span className="text-[#ffb4ab] font-medium">4 Missing (3 Unk)</span>
                </div>
              </div>
            </div>
            <Link
              to="/analytics/coverage"
              className="mt-3 flex items-center justify-between text-[#afc6ff] font-mono text-xs hover:underline pt-2 border-t border-[#262a31]"
            >
              <span>Review Coverage</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Ingestion Taxonomy Breakdown & Doctrine Banner */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase text-[#8c90a0] tracking-wider font-bold">Ingestion Taxonomy</span>
            <span className="text-xs text-[#c2c6d6]">Classified by formal regulatory evidence disposition:</span>
          </div>
          <span className="font-mono text-xs text-[#8c90a0]">Total Sampled: 184</span>
        </div>

        {/* Interactive Horizontal Bar Strip */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-3 bg-[#31353c] rounded-full overflow-hidden flex cursor-pointer">
            <div className="bg-[#7bdb80] h-full transition-all hover:brightness-110" style={{ width: '72%' }} title="PRESENT: 72% (133)"></div>
            <div className="bg-[#ffb693] h-full transition-all hover:brightness-110" style={{ width: '11%' }} title="NOT_SUBMITTED: 11% (20)"></div>
            <div className="bg-[#ffb4ab] h-full transition-all hover:brightness-110" style={{ width: '7%' }} title="ABSENT_CONFIRMED: 7% (13)"></div>
            <div className="bg-[#afc6ff] h-full transition-all hover:brightness-110" style={{ width: '6%' }} title="UNKNOWN: 6% (11)"></div>
            <div className="bg-[#8c90a0] h-full transition-all hover:brightness-110" style={{ width: '4%' }} title="NOT_APPLICABLE: 4% (7)"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="flex items-center gap-2 bg-[#181c22] p-2 px-3 rounded border border-[#262a31]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7bdb80]"></span>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold text-[#dfe2eb]">PRESENT: 72%</span>
                <span className="text-[11px] text-[#c2c6d6]">133 records active</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#181c22] p-2 px-3 rounded border border-[#262a31]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffb693]"></span>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold text-[#dfe2eb]">NOT_SUBMITTED: 11%</span>
                <span className="text-[11px] text-[#c2c6d6]">20 unsubmitted</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#181c22] p-2 px-3 rounded border border-[#262a31]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]"></span>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold text-[#dfe2eb]">ABSENT_CONFIRMED: 7%</span>
                <span className="text-[11px] text-[#c2c6d6]">13 confirmed missing</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#181c22] p-2 px-3 rounded border border-[#262a31]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#afc6ff]"></span>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold text-[#dfe2eb]">UNKNOWN: 6%</span>
                <span className="text-[11px] text-[#c2c6d6]">11 insufficient logs</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#181c22] p-2 px-3 rounded border border-[#262a31]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8c90a0]"></span>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold text-[#dfe2eb]">NOT_APPLICABLE: 4%</span>
                <span className="text-[11px] text-[#c2c6d6]">7 exempt records</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Doctrine Callout */}
        <div className="bg-[#181c22] rounded-lg p-3 flex items-start gap-3 border border-[#ffb693]/30 bg-[#ffb693]/5">
          <span className="material-symbols-outlined text-[20px] text-[#ffb693]">gavel</span>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase text-[#ffb693] font-bold tracking-wider">
              Supervisory Doctrine
            </span>
            <p className="text-xs text-[#dfe2eb] mt-1 leading-relaxed">
              <strong className="text-[#ffb693]">NOT_SUBMITTED ≠ Operational Failure. Missing Evidence ≠ Confirmed Failure.</strong>{' '}
              Unsubmitted evidence requires examiner inquiry, evidentiary clarification, and documented verification before any statutory violation or adverse finding is generated.
            </p>
          </div>
        </div>
      </section>

      {/* Granular Evidence Ingestion Ledger Table */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg text-[#dfe2eb] font-semibold">Evidence Ingestion & Verification Ledger</h2>
            <p className="text-xs text-[#c2c6d6]">Granular record review with hash attestation and cross-source linkage.</p>
          </div>
          {/* Filter Controls Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center bg-[#262a31] rounded px-3 py-1.5 gap-2 min-w-[280px] border border-[#424754]/40">
              <span className="material-symbols-outlined text-[16px] text-[#8c90a0]">search</span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Evidence ID, Case, Control..."
                className="bg-transparent text-[#dfe2eb] text-xs focus:outline-none w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#262a31] text-[#dfe2eb] font-mono text-xs px-3 py-1.5 rounded focus:outline-none cursor-pointer border border-[#424754]/40"
            >
              <option value="ALL">Status: All States</option>
              <option value="PRESENT">PRESENT</option>
              <option value="NOT_SUBMITTED">NOT_SUBMITTED</option>
              <option value="UNKNOWN">UNKNOWN</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="px-3 py-1.5 rounded bg-[#1c2026] text-[#c2c6d6] hover:text-[#dfe2eb] font-mono text-xs transition-colors border border-[#262a31]"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#181c22] rounded-lg overflow-x-auto border border-[#262a31]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1c2026] text-[#c2c6d6] text-[11px] uppercase tracking-wider border-b border-[#31353c] font-mono">
                <th className="py-2.5 px-3">Evidence ID</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Case Ref</th>
                <th className="py-2.5 px-3">Control</th>
                <th className="py-2.5 px-3">Telemetry Source</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Taxonomy Status</th>
                <th className="py-2.5 px-3">Traceability</th>
                <th className="py-2.5 px-3">Cryptographic Integrity</th>
                <th className="py-2.5 px-3">Consistency</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#31353c] font-mono text-xs">
              {filteredRecords.map((rec) => {
                const isSelected = selectedEvidence.id === rec.id;
                return (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedEvidence(rec)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c2026] border-l-2 border-[#1f6feb]'
                        : rec.status === 'NOT_SUBMITTED'
                        ? 'bg-[#93000a]/10 hover:bg-[#93000a]/20'
                        : 'hover:bg-[#1c2026]/50'
                    }`}
                  >
                    <td className={`py-2.5 px-3 font-semibold ${rec.status === 'NOT_SUBMITTED' ? 'text-[#ffb4ab]' : 'text-[#afc6ff]'}`}>
                      {rec.id}
                    </td>
                    <td className="py-2.5 px-3 text-[#dfe2eb] font-sans">{rec.classification}</td>
                    <td className="py-2.5 px-3 text-[#dfe2eb]">{rec.entity}</td>
                    <td className="py-2.5 px-3 text-[#afc6ff] hover:underline">
                      <Link to={`/findings/FND-0142`} onClick={(e) => e.stopPropagation()}>
                        {rec.caseRef}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-[#dfe2eb]">{rec.control}</td>
                    <td className="py-2.5 px-3 text-[#dfe2eb] font-sans">{rec.source}</td>
                    <td className="py-2.5 px-3 text-[#c2c6d6]">{rec.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          rec.status === 'PRESENT'
                            ? 'text-[#7bdb80]'
                            : rec.status === 'NOT_SUBMITTED'
                            ? 'text-[#ffb693]'
                            : rec.status === 'UNKNOWN'
                            ? 'text-[#afc6ff]'
                            : 'text-[#8c90a0]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rec.status === 'PRESENT'
                              ? 'bg-[#7bdb80]'
                              : rec.status === 'NOT_SUBMITTED'
                              ? 'bg-[#ffb693]'
                              : rec.status === 'UNKNOWN'
                              ? 'bg-[#afc6ff]'
                              : 'bg-[#8c90a0]'
                          }`}
                        ></span>
                        {rec.status}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 ${rec.traceability === 'Traceable' ? 'text-[#7bdb80]' : 'text-[#ffb4ab]'}`}>
                      {rec.traceability}
                    </td>
                    <td className={`py-2.5 px-3 ${rec.integrity.includes('SHA') ? 'text-[#7bdb80]' : 'text-[#8c90a0]'}`}>
                      {rec.integrity}
                    </td>
                    <td className={`py-2.5 px-3 ${rec.consistency === 'Consistent' ? 'text-[#7bdb80]' : rec.consistency === 'Potential Conflict' ? 'text-[#ffb4ab] font-semibold' : 'text-[#8c90a0]'}`}>
                      {rec.consistency}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvidence(rec);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                          isSelected
                            ? 'bg-[#1f6feb] text-white'
                            : 'bg-[#31353c] text-[#dfe2eb] hover:bg-[#353940]'
                        }`}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Split Panel: Forensic Provenance Inspection & Cross-Source Conflict Spotlight */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Forensic Provenance Inspection Card (Left 7 Cols) */}
        <div className="xl:col-span-7 bg-[#181c22] rounded-lg p-5 flex flex-col justify-between border border-[#262a31]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#31353c]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#afc6ff]">fingerprint</span>
                <span className="text-base text-[#dfe2eb] font-semibold">Forensic Provenance & Integrity Inspection</span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#007124]/20 text-[#7bdb80] border border-[#007124]/40">
                FIPS-140-2 Validated
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Selected Record</span>
                <span className="font-mono text-sm text-[#afc6ff] font-bold">{selectedEvidence.id}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Associated Finding</span>
                <span className="font-mono text-sm text-[#dfe2eb] font-medium">FND-0142</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Related Gap</span>
                <span className="font-mono text-sm text-[#ffb693] font-medium">GAP-0071</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Negative Space Ref</span>
                <span className="font-mono text-sm text-[#dfe2eb] font-medium">NS-0041</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Submission Batch</span>
                <span className="font-mono text-sm text-[#dfe2eb] font-medium">SUB-2026-0914</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Control Baseline</span>
                <span className="font-mono text-sm text-[#dfe2eb] font-medium">CTRL-07 / R-2.4</span>
              </div>
            </div>

            {/* Cryptographic Digest Box */}
            <div className="flex flex-col gap-1 bg-[#0a0e14] p-3 rounded border border-[#262a31]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#8c90a0] font-bold">SHA-256 Ingestion Attestation</span>
                <span className="font-mono text-[11px] text-[#7bdb80] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Notarized Ledger
                </span>
              </div>
              <code className="font-mono text-xs text-[#c2c6d6] break-all select-all">
                {selectedEvidence.id === 'EVD-742'
                  ? '7f3a8b29c410e5d61482f3a91c2b5e7d801124fa93bc716e45d9082156a91c2e'
                  : '3e827101fa284bb721894d01844bca99281014e7a8374921f009184ba21948cd'}
              </code>
            </div>

            {/* Linked Deficit Sub-Record (ESC-221) */}
            <div className="bg-[#93000a]/10 p-3 rounded flex flex-col gap-1 border border-[#93000a]/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#ffb4ab] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">report_problem</span>
                  Cross-Linked Missing Evidence: ESC-221
                </span>
                <span className="font-mono text-[11px] text-[#ffb693]">Workflow Gap</span>
              </div>
              <p className="text-xs text-[#dfe2eb] leading-relaxed">
                Case <strong>CASE-1042</strong> triggered an escalation workflow event in SOC Case System at 11:46, yet the corresponding escalation evidence record <strong>ESC-221</strong> from the SOC Workflow Engine was not submitted within the statutory 4-hour window.
              </p>
            </div>
          </div>

          {/* Action Cross-References */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#262a31] mt-3">
            <Link
              to="/evidence"
              className="px-3 py-1.5 rounded bg-[#1c2026] text-[#afc6ff] font-mono text-xs hover:bg-[#262a31] transition-colors border border-[#262a31]"
            >
              View in Evidence Explorer
            </Link>
            <Link
              to="/findings/FND-0142"
              className="px-3 py-1.5 rounded bg-[#1f6feb] text-white font-mono text-xs font-semibold hover:brightness-110 transition-colors"
            >
              Open Examiner Workspace (/findings/FND-0142)
            </Link>
            <button
              onClick={() => setShowInjunctionNotice(true)}
              className="px-3 py-1.5 rounded bg-[#1c2026] text-[#ffb693] font-mono text-xs hover:bg-[#262a31] transition-colors border border-[#262a31]"
            >
              Request Missing Escalation Telemetry
            </button>
          </div>
        </div>

        {/* Cross-Source Conflict Spotlight & Quick Issue Registry (Right 5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {/* Cross-Source Conflict Spotlight Card */}
          <div className="bg-[#181c22] rounded-lg p-5 flex flex-col gap-3 border border-[#262a31]">
            <div className="flex items-center justify-between pb-2 border-b border-[#31353c]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ffb693]">sync_problem</span>
                <h3 className="text-base text-[#dfe2eb] font-semibold">Cross-Source Conflict Spotlight</h3>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#93000a]/30 text-[#ffb4ab] font-semibold border border-[#93000a]/40">
                High Severity
              </span>
            </div>
            <div className="flex flex-col gap-2 bg-[#1c2026] p-3 rounded border border-[#262a31]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#afc6ff] font-semibold">CASE-1042 Telemetry Mismatch</span>
                <span className="text-[10px] text-[#8c90a0] uppercase font-bold">Delta Detected</span>
              </div>
              <div className="text-xs text-[#c2c6d6] flex flex-col gap-1.5 mt-1">
                <div className="flex items-start gap-2">
                  <span className="text-[#ffb4ab] font-bold font-mono text-[11px]">SRC A:</span>
                  <span><strong>SOC Case System:</strong> Record lists <em>"Escalation not required; tier 1 resolved"</em>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#ffb4ab] font-bold font-mono text-[11px]">SRC B:</span>
                  <span><strong>Incident Triage Log:</strong> Explicitly logs <em>"Tier-3 Escalation triggered at 13:20 by Lead Analyst"</em>.</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-[#31353c] flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#ffb693] font-medium">Potential Fabricated or Premature Closure</span>
                <Link to="/analytics/consistency" className="font-mono text-xs text-[#afc6ff] hover:underline">
                  Review Conflict →
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 bg-[#1c2026] p-3 rounded border border-[#262a31] opacity-80">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#dfe2eb] font-semibold">CASE-1037 Normal Sampling Delta</span>
                <span className="text-[10px] text-[#7bdb80] uppercase font-bold">Consistent</span>
              </div>
              <p className="text-xs text-[#c2c6d6]">
                SIEM alert count (14) vs Firewall flow log drops (18 drops). Discrepancy is within acceptable sampling jitter thresholds (&lt;5%).
              </p>
            </div>
          </div>

          {/* Active Evidence Quality Issues Registry (EQ-001 -> EQ-006) */}
          <div className="bg-[#181c22] rounded-lg p-5 flex flex-col gap-3 border border-[#262a31]">
            <div className="flex items-center justify-between pb-2 border-b border-[#31353c]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#afc6ff]">format_list_bulleted</span>
                <h3 className="text-base text-[#dfe2eb] font-semibold">Active Quality Issues</h3>
              </div>
              <span className="font-mono text-xs text-[#8c90a0]">6 Active Discrepancies</span>
            </div>
            <div className="flex flex-col gap-2 font-mono text-xs max-h-[220px] overflow-y-auto pr-1">
              {/* EQ-001 */}
              <div className="flex items-center justify-between p-2 bg-[#1c2026] rounded hover:bg-[#262a31] transition-colors border border-[#262a31]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#ffb4ab]">EQ-001</span>
                  <span className="text-[#dfe2eb] font-sans">Missing Escalation Record (CASE-1042)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ffb4ab] font-semibold">Critical</span>
                  <Link to="/findings/FND-0142" className="px-2 py-0.5 rounded bg-[#31353c] text-[#afc6ff]">
                    Review
                  </Link>
                </div>
              </div>
              {/* EQ-002 */}
              <div className="flex items-center justify-between p-2 bg-[#1c2026] rounded hover:bg-[#262a31] transition-colors border border-[#262a31]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#ffb693]">EQ-002</span>
                  <span className="text-[#dfe2eb] font-sans">Traceability Gap on Perimeter FW (EVD-801)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ffb693] font-semibold">Medium</span>
                  <Link to="/evidence" className="px-2 py-0.5 rounded bg-[#31353c] text-[#dfe2eb]">
                    Link
                  </Link>
                </div>
              </div>
              {/* EQ-003 */}
              <div className="flex items-center justify-between p-2 bg-[#1c2026] rounded hover:bg-[#262a31] transition-colors border border-[#262a31]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#ffb4ab]">EQ-003</span>
                  <span className="text-[#dfe2eb] font-sans">Cross-Source Timestamp Skew (CASE-1042)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ffb4ab] font-semibold">High</span>
                  <Link to="/analytics/consistency" className="px-2 py-0.5 rounded bg-[#31353c] text-[#afc6ff]">
                    Investigate
                  </Link>
                </div>
              </div>
              {/* EQ-004 */}
              <div className="flex items-center justify-between p-2 bg-[#1c2026] rounded hover:bg-[#262a31] transition-colors border border-[#262a31]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#8c90a0]">EQ-004</span>
                  <span className="text-[#dfe2eb] font-sans">Ingestion Hash Verification Pending (EVD-811)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8c90a0] font-semibold">Low</span>
                  <button onClick={() => alert('Hash integrity verified for EVD-811')} className="px-2 py-0.5 rounded bg-[#31353c] text-[#dfe2eb]">
                    Run Check
                  </button>
                </div>
              </div>
              {/* EQ-005 */}
              <div className="flex items-center justify-between p-2 bg-[#1c2026] rounded hover:bg-[#262a31] transition-colors border border-[#262a31]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#ffb693]">EQ-005</span>
                  <span className="text-[#dfe2eb] font-sans">Indeterminate Telemetry State Bastion (EVD-803)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ffb693] font-semibold">Medium</span>
                  <button onClick={() => setShowInjunctionNotice(true)} className="px-2 py-0.5 rounded bg-[#31353c] text-[#dfe2eb]">
                    Inquire
                  </button>
                </div>
              </div>
              {/* EQ-006 */}
              <div className="flex items-center justify-between p-2 bg-[#1c2026] rounded hover:bg-[#262a31] transition-colors border border-[#262a31]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#ffb4ab]">EQ-006</span>
                  <span className="text-[#dfe2eb] font-sans">Incomplete Coverage OT Gateway (CTRL-19)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ffb4ab] font-semibold">High</span>
                  <Link to="/analytics/coverage" className="px-2 py-0.5 rounded bg-[#31353c] text-[#afc6ff]">
                    Action
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Quarter Historical Evidence Quality Trajectory */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#afc6ff]">timeline</span>
            <h2 className="text-lg text-[#dfe2eb] font-semibold">3-Quarter Historical Evidence Quality Trajectory</h2>
          </div>
          <span className="font-mono text-xs text-[#7bdb80]">Trajectory: Continuous Improvement (+4% Q1→Q3)</span>
        </div>
        <div className="bg-[#181c22] rounded-lg p-5 border border-[#262a31]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1c2026] text-[#c2c6d6] text-[11px] uppercase tracking-wider border-b border-[#31353c] font-mono">
                  <th className="py-2.5 px-3">Dimension / Quarter</th>
                  <th className="py-2.5 px-3 text-center">Q1 2026</th>
                  <th className="py-2.5 px-3 text-center">Q2 2026</th>
                  <th className="py-2.5 px-3 text-center bg-[#262a31] text-[#afc6ff] font-bold">Q3 2026 (Current)</th>
                  <th className="py-2.5 px-3 text-center">Delta (Q1 → Q3)</th>
                  <th className="py-2.5 px-3 text-center">Benchmark (Gov Target)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#31353c] font-mono text-xs">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#dfe2eb] font-sans">Completeness</td>
                  <td className="py-2.5 px-3 text-center text-[#c2c6d6]">78%</td>
                  <td className="py-2.5 px-3 text-center text-[#c2c6d6]">80%</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#afc6ff] bg-[#262a31]/40">82%</td>
                  <td className="py-2.5 px-3 text-center text-[#7bdb80]">+4%</td>
                  <td className="py-2.5 px-3 text-center text-[#8c90a0]">90%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#dfe2eb] font-sans">Traceability</td>
                  <td className="py-2.5 px-3 text-center text-[#c2c6d6]">86%</td>
                  <td className="py-2.5 px-3 text-center text-[#c2c6d6]">89%</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#7bdb80] bg-[#262a31]/40">91%</td>
                  <td className="py-2.5 px-3 text-center text-[#7bdb80]">+5%</td>
                  <td className="py-2.5 px-3 text-center text-[#8c90a0]">95%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#dfe2eb] font-sans">Cryptographic Integrity</td>
                  <td className="py-2.5 px-3 text-center text-[#c2c6d6]">94%</td>
                  <td className="py-2.5 px-3 text-center text-[#c2c6d6]">95%</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#7bdb80] bg-[#262a31]/40">96%</td>
                  <td className="py-2.5 px-3 text-center text-[#7bdb80]">+2%</td>
                  <td className="py-2.5 px-3 text-center text-[#8c90a0]">99%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#dfe2eb] font-sans">Cross-Source Consistency</td>
                  <td className="py-2.5 px-3 text-center text-[#c2c6d6]">84%</td>
                  <td className="py-2.5 px-3 text-center text-[#c2c6d6]">85%</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#afc6ff] bg-[#262a31]/40">87%</td>
                  <td className="py-2.5 px-3 text-center text-[#7bdb80]">+3%</td>
                  <td className="py-2.5 px-3 text-center text-[#8c90a0]">90%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#dfe2eb] font-sans">Control Coverage</td>
                  <td className="py-2.5 px-3 text-center text-[#c2c6d6]">69%</td>
                  <td className="py-2.5 px-3 text-center text-[#c2c6d6]">71%</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#ffb693] bg-[#262a31]/40">72%</td>
                  <td className="py-2.5 px-3 text-center text-[#7bdb80]">+3%</td>
                  <td className="py-2.5 px-3 text-center text-[#8c90a0]">85%</td>
                </tr>
                <tr className="bg-[#1c2026] font-semibold font-mono">
                  <td className="py-2.5 px-3 text-[#dfe2eb] font-bold">SYNTHESIS READINESS INDEX</td>
                  <td className="py-2.5 px-3 text-center text-[#ffb693]">67%</td>
                  <td className="py-2.5 px-3 text-center text-[#ffb693]">69%</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#ffb693] bg-[#262a31] text-sm">71%</td>
                  <td className="py-2.5 px-3 text-center text-[#7bdb80] font-bold">+4%</td>
                  <td className="py-2.5 px-3 text-center text-[#7bdb80] font-bold">90% Target</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Human-in-the-Loop Examiner Actions Footer */}
      <footer className="my-6 p-5 bg-[#181c22] rounded-lg flex flex-col gap-4 border border-[#262a31]">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[24px] text-[#afc6ff]">policy</span>
          <div className="flex flex-col">
            <h4 className="text-base text-[#dfe2eb] font-bold">Human-in-the-Loop Supervisory Qualification</h4>
            <p className="text-xs text-[#c2c6d6] mt-1 leading-relaxed max-w-4xl">
              Evidence quality indicators describe empirical usability of submitted records. They do not independently determine statutory non-compliance.
              The appointed supervisory examiner must review, qualify, or issue statutory Evidence Injunctions prior to regulatory sanction.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#31353c]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => alert('Supervisory Evidence Readiness attestation notarized.')}
              className="px-4 py-2 rounded bg-[#1f6feb] text-white font-semibold text-xs hover:brightness-110 transition-colors"
            >
              Validate Evidence Readiness
            </button>
            <button
              onClick={() => setShowInjunctionNotice(true)}
              className="px-4 py-2 rounded bg-[#93000a] text-white font-semibold text-xs hover:brightness-110 transition-colors"
            >
              Issue Evidence Injunction / Request Data
            </button>
            <button
              onClick={() => alert('Telemetry set qualified with statutory examiner remarks.')}
              className="px-4 py-2 rounded bg-[#31353c] hover:bg-[#353940] text-[#dfe2eb] text-xs transition-colors"
            >
              Qualify Telemetry Set
            </button>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <Link
              to="/findings/FND-0142"
              className="px-3 py-1.5 rounded bg-[#1c2026] text-[#afc6ff] hover:underline border border-[#262a31]"
            >
              Open Examiner Workspace (FND-0142)
            </Link>
            <Link
              to="/governance/audit"
              className="px-3 py-1.5 rounded bg-[#1c2026] text-[#dfe2eb] hover:text-[#afc6ff] border border-[#262a31]"
            >
              View Provenance Ledger
            </Link>
          </div>
        </div>
      </footer>

      {/* Evidence Injunction Modal */}
      {showInjunctionNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181c22] border border-[#262a31] rounded-lg max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#31353c] pb-3">
              <div className="flex items-center gap-2 text-[#ffb4ab]">
                <span className="material-symbols-outlined text-[20px]">policy</span>
                <span className="font-bold text-sm">Issue Statutory Evidence Request / Injunction</span>
              </div>
              <button
                onClick={() => setShowInjunctionNotice(false)}
                className="text-[#8c90a0] hover:text-[#dfe2eb]"
              >
                ✕
              </button>
            </div>

            {noticeSubmitted ? (
              <div className="p-4 bg-[#007124]/20 border border-[#007124]/40 rounded text-center space-y-2">
                <span className="material-symbols-outlined text-[32px] text-[#7bdb80]">verified</span>
                <div className="text-sm font-bold text-[#7bdb80]">Evidence Injunction Dispatched</div>
                <p className="text-xs text-[#c2c6d6]">
                  Formal statutory notice dispatched to CSE-014 CISO Desk. Response logged to Audit Trail with 72-hour compliance deadline.
                </p>
                <button
                  onClick={() => {
                    setShowInjunctionNotice(false);
                    setNoticeSubmitted(false);
                  }}
                  className="mt-3 px-4 py-1.5 rounded bg-[#1f6feb] text-white text-xs font-semibold"
                >
                  Close Notice
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#c2c6d6]">
                  Under NCIIPC Directive 2026-EQ-14, request missing telemetry records (e.g. <strong>ESC-221</strong>) or seek formal clarification for cross-source discrepancies before statutory sanctions.
                </p>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[#8c90a0] block font-mono text-[11px] mb-1">Target Entity & Control</label>
                    <input
                      disabled
                      value="CSE-014 · CTRL-07 · Missing ESC-221 (Escalation Telemetry)"
                      className="w-full bg-[#1c2026] text-[#dfe2eb] p-2 rounded border border-[#31353c] font-mono text-xs cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[#8c90a0] block font-mono text-[11px] mb-1">Statutory Response Window</label>
                    <select className="w-full bg-[#1c2026] text-[#dfe2eb] p-2 rounded border border-[#31353c] font-mono text-xs">
                      <option>72 Hours (Urgent Incident Telemetry)</option>
                      <option>7 Days (Standard Audit Injunction)</option>
                      <option>14 Days (Comprehensive Log Re-submission)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#8c90a0] block font-mono text-[11px] mb-1">Examiner Note & Statutory Reference</label>
                    <textarea
                      rows={3}
                      defaultValue="Clarification requested regarding CASE-1042 discrepancy between SOC Case System and Incident Triage Log. Please submit authenticated syslog and workflow records for ESC-221."
                      className="w-full bg-[#1c2026] text-[#dfe2eb] p-2 rounded border border-[#31353c] font-sans text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#31353c]">
                  <button
                    onClick={() => setShowInjunctionNotice(false)}
                    className="px-3 py-1.5 rounded bg-[#262a31] text-[#c2c6d6] text-xs hover:bg-[#31353c]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setNoticeSubmitted(true)}
                    className="px-4 py-1.5 rounded bg-[#93000a] text-white text-xs font-semibold hover:brightness-110"
                  >
                    Dispatch Injunction Notice
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
