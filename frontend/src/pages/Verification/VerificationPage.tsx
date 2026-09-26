import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  Unlock,
  Ban,
  FileText,
  Search,
  Filter,
  RefreshCw,
  X,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  FileCheck,
  Fingerprint,
  Calendar,
  Building,
  KeyRound,
  Download,
  Terminal,
  Activity,
  UserCheck,
  FileWarning
} from 'lucide-react';

interface VerificationRecord {
  id: string; // e.g. VRF-0012
  mandateId: string; // e.g. REM-0038
  findingId: string; // e.g. FND-0142
  cseId: string;
  cseName: string;
  controlId: string;
  cycle: string;
  leadExaminer: string;
  statutoryStandard: string;
  submittedAt: string;
  evaluatedAt?: string;
  verificationVerdict: 'VERIFIED_SEALED' | 'UNDER_SUPERVISORY_REVIEW' | 'DEFICIENT_REOPENED' | 'EVIDENCE_LOCKED';
  confidenceScore: number;
  evidenceCompleteness: number; // percentage
  merkleRootHash: string;
  remedialSummary: string;
  gateChecklist: Array<{
    id: string;
    label: string;
    verified: boolean;
    required: boolean;
    note?: string;
  }>;
  submittedArtifacts: Array<{
    id: string;
    name: string;
    hash: string;
    verified: boolean;
  }>;
  supervisoryRationale: string;
}

const INITIAL_VERIFICATION_RECORDS: VerificationRecord[] = [
  {
    id: 'VRF-0038',
    mandateId: 'REM-0038',
    findingId: 'FND-0142',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    controlId: 'CTRL-07 v3.2',
    cycle: 'Q3 2026',
    leadExaminer: 'NC-8802 (Lead Examiner)',
    statutoryStandard: 'NCIIPC Framework Sec 12(a) & Rule 4.8.2',
    submittedAt: '26 Sep 2026 14:22 IST',
    evaluatedAt: '27 Sep 2026 09:15 IST',
    verificationVerdict: 'EVIDENCE_LOCKED',
    confidenceScore: 68,
    evidenceCompleteness: 67, // 2 of 3 artifacts
    merkleRootHash: '0x9af8b12204cc19ef...4180',
    remedialSummary: 'Mandate requires cryptographic verification of Level 2 SOAR dispatch telemetry during incident INV-338.',
    gateChecklist: [
      { id: 'gate-1', label: 'Mandate Scope Formally Communicated to CSE', verified: true, required: true },
      { id: 'gate-2', label: 'Cryptographic Attestation of Playbook Update v2.4', verified: true, required: true },
      { id: 'gate-3', label: 'Mandatory Telemetry Packet ESC-221 Ingested', verified: false, required: true, note: 'Statutory blocker: Missing raw dispatch payload' },
      { id: 'gate-4', label: 'Cross-Source Petri Net Process Conformance (PM4Py)', verified: false, required: true },
      { id: 'gate-5', label: 'Immutable FIPS-140-2 Level 3 Hash Sealed', verified: false, required: true }
    ],
    submittedArtifacts: [
      { id: 'EVD-742', name: 'INV-338 Triage Runbook Audit Export', hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', verified: true },
      { id: 'EVD-761', name: 'Containment Firewall Push Logs (SCADA Gateway)', hash: 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2', verified: true },
      { id: 'ESC-221', name: 'Tier-3 Escalation Dispatch Telemetry Packet', hash: 'NOT_SUBMITTED', verified: false }
    ],
    supervisoryRationale: 'Awaiting mandatory telemetry ESC-221 from NorthGrid. Statutory closure gate remains locked. Reopening loop active if deadline expires without submission.'
  },
  {
    id: 'VRF-0035',
    mandateId: 'REM-0035',
    findingId: 'FND-0131',
    cseId: 'CSE-014',
    cseName: 'NorthGrid Energy',
    controlId: 'CTRL-11',
    cycle: 'Q3 2026',
    leadExaminer: 'NC-4190 (Examiner)',
    statutoryStandard: 'NCIIPC Perimeter SIEM Sync Standard',
    submittedAt: '25 Sep 2026 16:30 IST',
    evaluatedAt: '26 Sep 2026 11:20 IST',
    verificationVerdict: 'UNDER_SUPERVISORY_REVIEW',
    confidenceScore: 84,
    evidenceCompleteness: 85,
    merkleRootHash: '0x33b81109fade1211...0911',
    remedialSummary: 'Reconciliation of SOC perimeter firewall syslog timestamps with central NCIIPC SIEM collectors.',
    gateChecklist: [
      { id: 'gate-1', label: 'NTP Offset Within Statutory 50ms Boundary', verified: true, required: true },
      { id: 'gate-2', label: 'Syslog Collector Mirror Checksum Verified', verified: true, required: true },
      { id: 'gate-3', label: '48-Hour Live Telemetry Capture Stream Ingested', verified: true, required: true },
      { id: 'gate-4', label: 'Supervisor Sign-off on Clock Drift Tolerance', verified: false, required: true }
    ],
    submittedArtifacts: [
      { id: 'EVD-688', name: 'NTP Stratum-1 Audit Feed', hash: '9b82109abcf1425e...7710a', verified: true },
      { id: 'EVD-689', name: 'Firewall Collector Syslog Export (48h)', hash: '5561a0918bca4401...8812f', verified: true }
    ],
    supervisoryRationale: 'Submissions satisfy technical criteria. Final sign-off pending clock-drift analysis verification.'
  },
  {
    id: 'VRF-0029',
    mandateId: 'REM-0029',
    findingId: 'FND-0118',
    cseId: 'CSE-021',
    cseName: 'TelcoGrid Telecom',
    controlId: 'CTRL-04',
    cycle: 'Q3 2026',
    leadExaminer: 'NC-8802 (Lead Examiner)',
    statutoryStandard: 'Critical Telecom Gateway MFA Mandate',
    submittedAt: '15 Sep 2026 09:10 IST',
    evaluatedAt: '18 Sep 2026 14:00 IST',
    verificationVerdict: 'VERIFIED_SEALED',
    confidenceScore: 98,
    evidenceCompleteness: 100,
    merkleRootHash: '0x71a099bf4431e089...9944',
    remedialSummary: 'MFA token bypass closure on core IMS interconnect router clusters.',
    gateChecklist: [
      { id: 'gate-1', label: 'PAM Policy v4.1 Cryptographically Signed', verified: true, required: true },
      { id: 'gate-2', label: 'RADIUS Challenge-Response Audit Trail Ingested', verified: true, required: true },
      { id: 'gate-3', label: 'Hardware Token Seed Attestation Received', verified: true, required: true },
      { id: 'gate-4', label: 'Lead Examiner Sign-off Executed & Sealed', verified: true, required: true }
    ],
    submittedArtifacts: [
      { id: 'EVD-512', name: 'PAM Cluster Policy Diff v4.1', hash: '4f9910ae4481c002...9901b', verified: true },
      { id: 'EVD-513', name: 'RADIUS Authentication Audit Trail', hash: '09ab1209cc542911...4401c', verified: true },
      { id: 'EVD-514', name: 'Hardware Token Seed Attestation', hash: '881a4bca990013ef...2284d', verified: true }
    ],
    supervisoryRationale: 'Full statutory compliance verified. Immutable enclave lock engaged on 18 Sep 2026.'
  },
  {
    id: 'VRF-0026',
    mandateId: 'REM-0026',
    findingId: 'FND-0109',
    cseId: 'CSE-008',
    cseName: 'ReserveBank Interconnect',
    controlId: 'CTRL-09',
    cycle: 'Q3 2026',
    leadExaminer: 'NC-4190 (Examiner)',
    statutoryStandard: 'Financial Sector HSM Key Rotation Mandate',
    submittedAt: '05 Sep 2026 11:00 IST',
    evaluatedAt: '08 Sep 2026 15:45 IST',
    verificationVerdict: 'DEFICIENT_REOPENED',
    confidenceScore: 32,
    evidenceCompleteness: 33,
    merkleRootHash: '0x1109aef884439001...1200',
    remedialSummary: 'HSM partition key rotation cycle proof.',
    gateChecklist: [
      { id: 'gate-1', label: 'Partition Health Report Ingested', verified: true, required: true },
      { id: 'gate-2', label: 'Master Key Derivation Cycle Verified', verified: false, required: true, note: 'Rejected: Derivation logs omitted' },
      { id: 'gate-3', label: 'Zeroization Procedure Test Trace', verified: false, required: true, note: 'Rejected: Missing witness signature' }
    ],
    submittedArtifacts: [
      { id: 'EVD-401', name: 'HSM Partition Health Report', hash: 'e01a88b4491910ef...1133a', verified: true },
      { id: 'EVD-402', name: 'Master Key Derivation Log', hash: 'OMITTED', verified: false }
    ],
    supervisoryRationale: 'Deficient proof submitted. Mandate reverted to IN PROGRESS with immediate regulatory warning issued.'
  }
];

export const VerificationPage: React.FC = () => {
  const [records, setRecords] = useState<VerificationRecord[]>(INITIAL_VERIFICATION_RECORDS);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('VRF-0038');
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deliberationText, setDeliberationText] = useState<string>(
    'Verification hold maintained. Mandate REM-0038 cannot proceed to CLOSED state until ESC-221 cryptographic verification completes.'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedRecord = records.find(r => r.id === selectedRecordId) || records[0];

  const filteredRecords = records.filter(r => {
    if (filterVerdict !== 'ALL' && r.verificationVerdict !== filterVerdict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.mandateId.toLowerCase().includes(q) ||
        r.findingId.toLowerCase().includes(q) ||
        r.cseName.toLowerCase().includes(q) ||
        r.controlId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleGate = (gateId: string) => {
    setRecords(prev => prev.map(rec => {
      if (rec.id === selectedRecordId) {
        return {
          ...rec,
          gateChecklist: rec.gateChecklist.map(g => g.id === gateId ? { ...g, verified: !g.verified } : g)
        };
      }
      return rec;
    }));
    showToast('Checklist state updated in air-gapped working memory.');
  };

  const handleFormalSeal = () => {
    const unverifiedRequired = selectedRecord.gateChecklist.filter(g => g.required && !g.verified);
    if (unverifiedRequired.length > 0) {
      showToast(`Statutory Violation: Cannot seal while ${unverifiedRequired.length} required gates are unfulfilled.`);
      return;
    }

    setRecords(prev => prev.map(r => {
      if (r.id === selectedRecordId) {
        return {
          ...r,
          verificationVerdict: 'VERIFIED_SEALED',
          confidenceScore: 99
        };
      }
      return r;
    }));
    showToast(`Verification ${selectedRecord.id} cryptographically SEALED under FIPS-140-2 Level 3.`);
  };

  const handleMarkDeficient = () => {
    setRecords(prev => prev.map(r => {
      if (r.id === selectedRecordId) {
        return {
          ...r,
          verificationVerdict: 'DEFICIENT_REOPENED',
          confidenceScore: 25
        };
      }
      return r;
    }));
    showToast(`Record ${selectedRecord.id} marked DEFICIENT. Corrective loop re-opened in Remediation.`);
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-950/95 border border-blue-500/40 text-blue-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="text-xs font-mono">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER & BREADCRUMBS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-[#181c22] border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              Statutory Verification Console
            </span>
            <span className="text-xs font-mono text-slate-400">Section 16 • FIPS-140-2 L3 Enforcement</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            Evidence Verification & Statutory Closure
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict human-in-the-loop validation of submitted remediation telemetry before granting irrevocable statutory closure.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/remediation"
            className="px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Remediation Mandates
          </Link>
          <button
            onClick={() => showToast('Verification ledger synchronized with enclave hardware roots.')}
            className="px-3 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            Sync Ledger
          </button>
        </div>
      </div>

      {/* STATUTORY MANDATE RULE CARD */}
      <div className="p-3.5 rounded-lg bg-[#181c22] border border-amber-900/40 flex items-start gap-3">
        <div className="p-2 rounded bg-amber-950/60 border border-amber-800/60 text-amber-400 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-xs font-mono leading-relaxed space-y-1">
          <div className="font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
            <span>Statutory Verification Rule 4.8.2</span>
            <span className="text-slate-500 font-normal">| Non-Automatic Closure Barrier</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            "Status change to CLOSED requires evidence-backed examiner verification. CSE response or artifact ingestion does <strong className="text-slate-200">NOT</strong> automatically imply verification. Non-linear closure bypass is locked by cryptographic enclave policy."
          </p>
        </div>
      </div>

      {/* KPI METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Total Verification Queued</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-slate-100">4 Dossiers</div>
            <div className="text-[10px] font-mono text-slate-500">Supervisory Scope</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rose-400">Locked on Evidence</span>
            <Ban className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-rose-400">1 Critical Hold</div>
            <div className="text-[10px] font-mono text-rose-500">Missing Mandatory (ESC-221)</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-purple-400">Under Review</span>
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-purple-300">1 Review Active</div>
            <div className="text-[10px] font-mono text-purple-400">Clock Drift Analysis</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-400">Statutoriily Sealed</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-emerald-400">1 Irrevocable</div>
            <div className="text-[10px] font-mono text-emerald-500">FIPS-140-2 Level 3 Hash</div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-3 rounded-lg bg-[#181c22] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verification ID, mandate, finding, CSE, control..."
              className="w-full pl-9 pr-3 py-1.5 rounded bg-[#10141a] border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-slate-500">Verdict:</span>
          <select
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-[#10141a] border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Verdicts</option>
            <option value="EVIDENCE_LOCKED">EVIDENCE LOCKED</option>
            <option value="UNDER_SUPERVISORY_REVIEW">UNDER REVIEW</option>
            <option value="VERIFIED_SEALED">VERIFIED & SEALED</option>
            <option value="DEFICIENT_REOPENED">DEFICIENT (REOPENED)</option>
          </select>
        </div>
      </div>

      {/* SPLIT WORKSPACE: VERIFICATION LIST (5 COLS) + DETAIL VERIFICATION SUITE (7 COLS) */}
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* LIST COLUMN */}
        <div className="col-span-12 lg:col-span-5 space-y-2">
          <div className="rounded-lg bg-[#181c22] border border-slate-800 overflow-hidden">
            <div className="px-3.5 py-2.5 bg-[#1c2026] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                Verification Queue ({filteredRecords.length})
              </span>
              <span className="text-[10px] font-mono text-slate-400">Strict Gate Mode</span>
            </div>

            <div className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredRecords.map((r) => {
                const isSelected = r.id === selectedRecordId;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecordId(r.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-950/30 border-l-2 border-blue-400'
                        : 'hover:bg-[#1c2026]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-400">{r.id}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.verificationVerdict === 'VERIFIED_SEALED'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : r.verificationVerdict === 'EVIDENCE_LOCKED'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            : r.verificationVerdict === 'UNDER_SUPERVISORY_REVIEW'
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {r.verificationVerdict.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="mt-1 text-slate-200 font-medium">
                      {r.mandateId} • {r.findingId}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{r.cseName}</span>
                      <span>{r.controlId}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Evidence Completeness</span>
                        <span className="font-bold text-slate-300">{r.evidenceCompleteness}%</span>
                      </div>
                      <div className="w-full bg-[#10141a] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            r.evidenceCompleteness === 100
                              ? 'bg-emerald-400'
                              : r.evidenceCompleteness >= 75
                              ? 'bg-blue-400'
                              : 'bg-rose-400'
                          }`}
                          style={{ width: `${r.evidenceCompleteness}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DETAIL & VERIFICATION SUITE COLUMN */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="p-4 rounded-lg bg-[#181c22] border border-slate-800 space-y-4">
            {/* Header of Active Dossier */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-mono text-blue-400">{selectedRecord.id}</span>
                  <span className="text-xs font-mono text-slate-400">• Mandate {selectedRecord.mandateId}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedRecord.verificationVerdict === 'VERIFIED_SEALED'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : selectedRecord.verificationVerdict === 'EVIDENCE_LOCKED'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : selectedRecord.verificationVerdict === 'UNDER_SUPERVISORY_REVIEW'
                        ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    {selectedRecord.verificationVerdict.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  Entity: <strong className="text-slate-100">{selectedRecord.cseName} ({selectedRecord.cseId})</strong> | Control: {selectedRecord.controlId}
                </div>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-400">
                <div>Examiner: {selectedRecord.leadExaminer}</div>
                <div className="text-slate-500">Submitted: {selectedRecord.submittedAt}</div>
              </div>
            </div>

            {/* Directive & Finding Cross-Reference */}
            <div className="p-3 rounded bg-[#1c2026] border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-400" /> Remediation Action Scope
                </span>
                <Link
                  to={`/assessment/findings/${selectedRecord.findingId}`}
                  className="text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  View {selectedRecord.findingId} <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-slate-200 leading-relaxed">
                "{selectedRecord.remedialSummary}"
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>Statutory Standard: {selectedRecord.statutoryStandard}</span>
                <span>Merkle Digest: {selectedRecord.merkleRootHash}</span>
              </div>
            </div>

            {/* Gate Checklist (Interactive Verification Matrix) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-slate-200">Enclave Gate Verification Matrix</span>
                <span className="text-[11px] text-slate-400">
                  {selectedRecord.gateChecklist.filter(g => g.verified).length} / {selectedRecord.gateChecklist.length} Gates Verified
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {selectedRecord.gateChecklist.map((gate) => (
                  <div
                    key={gate.id}
                    onClick={() => handleToggleGate(gate.id)}
                    className={`p-2.5 rounded border transition-colors cursor-pointer flex items-start gap-2.5 ${
                      gate.verified
                        ? 'bg-[#1c2026] border-emerald-900/50 text-slate-200'
                        : 'bg-rose-950/20 border-rose-900/40 text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={gate.verified}
                      onChange={() => {}} // handled by parent onClick
                      className="mt-0.5 rounded bg-slate-800 text-emerald-500 cursor-pointer"
                    />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className={gate.verified ? 'text-slate-200' : 'text-rose-300 font-semibold'}>
                          {gate.label}
                        </span>
                        {gate.required && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                            MANDATORY
                          </span>
                        )}
                      </div>
                      {gate.note && (
                        <p className="text-[10px] text-rose-400 font-medium">{gate.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingested Evidence Verification Dossier */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-200">Submitted Evidence Artifacts</span>
              <div className="space-y-1.5 font-mono text-xs">
                {selectedRecord.submittedArtifacts.map((art) => (
                  <div
                    key={art.id}
                    className="p-2 rounded bg-[#10141a] border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {art.verified ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Ban className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span className={art.verified ? 'text-blue-400 font-bold' : 'text-rose-400 font-bold'}>
                          {art.id}
                        </span>
                        <span className="text-slate-300 truncate">({art.name})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        SHA-256: {art.hash}
                      </div>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        art.verified
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      }`}
                    >
                      {art.verified ? 'VERIFIED IN ENCLAVE' : 'NOT SUBMITTED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Examiner Deliberation & Decision Box */}
            <div className="p-3.5 rounded bg-[#1c2026] border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-purple-400" /> Examiner Supervisory Deliberation
                </span>
                <span className="text-[10px] text-slate-400">Formal Verification Record</span>
              </div>

              <textarea
                rows={2}
                value={deliberationText}
                onChange={(e) => setDeliberationText(e.target.value)}
                className="w-full p-2 rounded bg-[#10141a] border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleFormalSeal}
                  className="py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Grant Verification & Seal Enclave
                </button>
                <button
                  onClick={handleMarkDeficient}
                  className="py-2 px-3 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-800/60 text-amber-200 font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  Mark Deficient & Reopen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
