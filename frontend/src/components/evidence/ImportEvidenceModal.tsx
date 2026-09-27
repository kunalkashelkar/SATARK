import React, { useState } from 'react';
import { useSupervisory } from '@/context/SupervisoryContext';
import { 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Database, 
  Workflow, 
  Hash, 
  X,
  FileCode,
  Layers,
  Cpu
} from 'lucide-react';
import { Button, Modal } from '@/components/common';

interface ImportEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCseId?: string;
}

export const ImportEvidenceModal: React.FC<ImportEvidenceModalProps> = ({
  isOpen,
  onClose,
  preselectedCseId
}) => {
  const { cses, addSubmissionAndEvidence } = useSupervisory();

  // Workflow Steps: 1: Configure & Select, 2: Validate & Map, 3: Ingest & Result
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [targetCseId, setTargetCseId] = useState<string>(preselectedCseId || 'CSE-014');
  const [period, setPeriod] = useState<string>('Q3 2026');
  const [submissionChannel, setSubmissionChannel] = useState<string>('Air-Gapped SFTP Enclave Drop (FIPS)');
  const [sourceSystem, setSourceSystem] = useState<string>('SOC Incident Management & SOAR');
  const [category, setCategory] = useState<'ALERT' | 'CASE' | 'INVESTIGATION' | 'ACTION' | 'EVIDENCE' | 'ESCALATION' | 'RESPONSE' | 'CLOSURE' | 'ASSET' | 'EXCEPTION' | 'REMEDIATION'>('ESCALATION');
  
  // File state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: 'CSV' | 'JSON' | 'XLSX' | 'PDF' | 'TXT' | 'LOG' | 'ZIP' | 'XML';
    size: string;
    hash: string;
  } | null>({
    name: 'northgrid_tier2_escalation_records_q3.json',
    type: 'JSON',
    size: '14.8 MB',
    hash: 'e81a3c77b919a99477e6f8812dd014a9ecba19001258d4a982141a0e1b239401'
  });

  const [validationState, setValidationState] = useState<'IDLE' | 'VALIDATING' | 'PASSED' | 'FAILED'>('IDLE');
  const [validationSteps, setValidationSteps] = useState([
    { label: 'Format & Integrity Verification (FIPS 140-2)', status: 'VALID', ok: true },
    { label: 'OCSF / Canonical Schema Conformance', status: 'VALID', ok: true },
    { label: 'Canonical Entity Attribution (Source CSE Check)', status: 'MAPPED', ok: true },
    { label: 'Cryptographic SHA-256 Digest Match', status: 'VERIFIED', ok: true },
  ]);

  const targetCse = cses.find(c => c.cseId === targetCseId) || cses[0];

  const handleRunValidation = () => {
    setValidationState('VALIDATING');
    setTimeout(() => {
      setValidationState('PASSED');
      setStep(2);
    }, 900);
  };

  const handleCommitSubmission = () => {
    if (!selectedFile) return;

    const submissionId = `SUB-${targetCse.cseId.replace('CSE-', '')}-${Math.floor(100 + Math.random() * 900)}`;
    const evidenceId = `EVD-${targetCse.cseId.replace('CSE-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    addSubmissionAndEvidence({
      submission: {
        submissionId,
        cseId: targetCse.cseId,
        assessmentId: `ASM-2026-${period.replace(' ', '-')}-${targetCse.cseId.replace('CSE-', '')}`,
        fileName: selectedFile.name,
        fileType: selectedFile.type as any,
        fileSize: selectedFile.size,
        submittedAt: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-GB')} IST`,
        source: sourceSystem,
        status: 'MAPPED',
        hash: selectedFile.hash,
        mappingStatus: 'CONFIRMED',
        category: category as any,
        recordCount: 840
      },
      evidence: {
        id: evidenceId,
        type: `${category} Telemetry Record`,
        recordType: category as any,
        cseId: targetCse.cseId,
        entity: `${targetCse.cseId} (${targetCse.cseName})`,
        submissionId,
        caseRef: `INGEST-${period} / ${category}-STREAM`,
        source: sourceSystem,
        sourceSink: submissionChannel,
        timestampDate: 'Today',
        timestampTime: 'Just Now',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: 'PRESENT',
        integrity: 'VERIFIED (SHA-256)',
        hash: selectedFile.hash,
        gapOrFinding: 'INGESTED_REGULATORY_SUBMISSION',
        gapNote: `Ingested through ${submissionChannel}. Mapped to canonical ${category} category.`,
        title: `Regulatory Telemetry Dossier: ${selectedFile.name}`,
        provenance: {
          sha256: selectedFile.hash,
          collectorVersion: 'sat-ingest-v3.4-fips',
          enclaveTimestamp: new Date().toISOString(),
          custodyChain: [
            `${targetCse.cseId} Submitting Liaison`,
            submissionChannel,
            'NCIIPC Ingestion Security Gateway',
            'Enclave Canonical Evidence Vault'
          ],
          schemaVersion: 'OCSF-1.1.0'
        }
      }
    });

    setStep(3);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setValidationState('IDLE');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#0e131b] border border-[#212c3d] rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-[#111722] border-b border-[#212c3d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#182335] border border-[#263750] flex items-center justify-center text-[#60a5fa]">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#f1f5f9] font-sans flex items-center gap-2">
                <span>Import CSE Evidence & Telemetry</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#161e29] text-[#10b981] border border-[#212c3d]">
                  STAGE {step} OF 3
                </span>
              </h2>
              <p className="text-[11px] text-[#94a3b8] font-mono">
                Regulatory ingestion pipeline for Critical Sector Entity evidence submissions
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#161e29] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress & Architecture Flow Banner */}
        <div className="px-5 py-2.5 bg-[#090d14] border-b border-[#212c3d] flex items-center justify-between text-[11px] font-mono text-[#94a3b8]">
          <div className="flex items-center gap-2">
            <span className={step >= 1 ? 'text-[#60a5fa] font-semibold' : 'text-[#64748b]'}>1. Source & File</span>
            <span className="text-[#334155]">→</span>
            <span className={step >= 2 ? 'text-[#60a5fa] font-semibold' : 'text-[#64748b]'}>2. Validation & Mapping</span>
            <span className="text-[#334155]">→</span>
            <span className={step >= 3 ? 'text-[#10b981] font-semibold' : 'text-[#64748b]'}>3. Vault Repository</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#10b981]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FIPS-140-2 / OCSF CANONICAL INGESTION</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* STEP 1: Select CSE, Parameters, and File */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Target CSE Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-[#94a3b8]">
                    Target Critical Sector Entity (CSE):
                  </label>
                  <select
                    value={targetCseId}
                    onChange={(e) => setTargetCseId(e.target.value)}
                    className="w-full py-2 px-3 rounded bg-[#111622] border border-[#212c3d] text-[12px] text-[#f1f5f9] font-sans focus:outline-none focus:border-[#3b82f6]"
                  >
                    {cses.map((c) => (
                      <option key={c.cseId} value={c.cseId}>
                        {c.cseId} — {c.cseName} ({c.sector})
                      </option>
                    ))}
                  </select>
                  <div className="text-[10px] text-[#64748b] font-mono">
                    Sector: <span className="text-[#cbd5e1]">{targetCse.sector}</span> · SOC: <span className="text-[#cbd5e1]">{targetCse.socType}</span>
                  </div>
                </div>

                {/* Assessment Period */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-[#94a3b8]">
                    Regulatory Assessment Period:
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full py-2 px-3 rounded bg-[#111622] border border-[#212c3d] text-[12px] text-[#f1f5f9] font-sans focus:outline-none focus:border-[#3b82f6]"
                  >
                    <option value="Q3 2026">Q3 2026 (Active Regulatory Cycle)</option>
                    <option value="Q2 2026">Q2 2026 (Historical Baseline)</option>
                    <option value="Q1 2026">Q1 2026 (Annual Filing)</option>
                  </select>
                </div>

                {/* Canonical Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-[#94a3b8]">
                    Canonical Evidence Lifecycle Category:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full py-2 px-3 rounded bg-[#111622] border border-[#212c3d] text-[12px] text-[#f1f5f9] font-sans focus:outline-none focus:border-[#3b82f6]"
                  >
                    <option value="ESCALATION">ESCALATION (Mandatory Regulatory Step)</option>
                    <option value="INVESTIGATION">INVESTIGATION (Triage & Forensic Notes)</option>
                    <option value="ALERT">ALERT (SIEM Telemetry & Detection Alarms)</option>
                    <option value="CASE">CASE (Incident Dossier & Case Management)</option>
                    <option value="RESPONSE">RESPONSE (SOAR & Firewall Containment)</option>
                    <option value="CLOSURE">CLOSURE (Resolution & Root Cause Sign-off)</option>
                    <option value="EVIDENCE">EVIDENCE (Raw Transaction & Switch Streams)</option>
                    <option value="ACTION">ACTION (PAM / Privileged Access Audit)</option>
                    <option value="ASSET">ASSET (Configuration & Asset Registry)</option>
                    <option value="EXCEPTION">EXCEPTION (Formal Risk Variance Record)</option>
                    <option value="REMEDIATION">REMEDIATION (Corrective Action Verification)</option>
                  </select>
                </div>

                {/* Submission Channel */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-[#94a3b8]">
                    Ingestion Protocol / Channel:
                  </label>
                  <select
                    value={submissionChannel}
                    onChange={(e) => setSubmissionChannel(e.target.value)}
                    className="w-full py-2 px-3 rounded bg-[#111622] border border-[#212c3d] text-[12px] text-[#f1f5f9] font-sans focus:outline-none focus:border-[#3b82f6]"
                  >
                    <option value="Air-Gapped SFTP Enclave Drop (FIPS)">Air-Gapped SFTP Enclave Drop (FIPS)</option>
                    <option value="Encrypted Batch Storage Bucket (Offline)">Encrypted Batch Storage Bucket (Offline)</option>
                    <option value="Automated Supervisory Agent Pull">Automated Supervisory Agent Pull</option>
                    <option value="Manual Statutory Liaison Submission">Manual Statutory Liaison Submission</option>
                  </select>
                </div>
              </div>

              {/* File Dropzone Area */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase text-[#94a3b8]">
                    Evidence Artifact / Telemetry File:
                  </label>
                  <span className="text-[11px] font-mono text-[#60a5fa] bg-[#1d4ed8]/10 px-2 py-0.5 rounded border border-[#1d4ed8]/30">
                    Supported: CSV · JSON · XLSX · PDF · TXT · LOG · ZIP · XML
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-[#111622] border-2 border-dashed border-[#263750] hover:border-[#3b82f6]/50 transition-colors flex flex-col items-center justify-center text-center space-y-2">
                  <FileCode className="w-8 h-8 text-[#60a5fa]/70" />
                  <div className="space-y-0.5">
                    <p className="text-[12px] font-medium text-[#f1f5f9]">
                      Select or drop regulatory submission file
                    </p>
                    <p className="text-[11px] text-[#64748b] font-mono">
                      Air-gapped cryptographic engine verifies format integrity, schema conformance & SHA-256
                    </p>
                  </div>

                  <input
                    type="file"
                    id="evidence-file-input"
                    className="hidden"
                    accept=".csv,.json,.xlsx,.pdf,.txt,.log,.zip,.xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const ext = file.name.split('.').pop()?.toUpperCase() as any;
                        const validExt = ['CSV', 'JSON', 'XLSX', 'PDF', 'TXT', 'LOG', 'ZIP', 'XML'].includes(ext) ? ext : 'LOG';
                        setSelectedFile({
                          name: file.name,
                          type: validExt,
                          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                          hash: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
                        });
                      }
                    }}
                  />

                  <div className="pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => document.getElementById('evidence-file-input')?.click()}
                      className="text-[11px] font-mono border-[#3b414d] text-[#60a5fa] hover:bg-[#1d4ed8]/20"
                    >
                      Browse Local File...
                    </Button>
                  </div>

                  {/* Preset Sample Files across all 8 supported formats */}
                  <div className="pt-2 text-[10px] font-mono text-[#64748b]">Or select sample artifact preset:</div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedFile({
                        name: 'northgrid_tier2_escalation_records_q3.json',
                        type: 'JSON',
                        size: '14.8 MB',
                        hash: 'e81a3c77b919a99477e6f8812dd014a9ecba19001258d4a982141a0e1b239401'
                      })}
                      className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
                        selectedFile?.type === 'JSON' ? 'bg-[#1d4ed8]/30 border-[#60a5fa] text-[#93c5fd]' : 'bg-[#161e29] border-[#212c3d] text-[#93c5fd] hover:bg-[#1d4ed8]/20'
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFile({
                        name: 'interbank_core_settlement_audit.csv',
                        type: 'CSV',
                        size: '42.1 MB',
                        hash: '4f29a88310c9d74e0192a831bce9812948271048bce928410294812048124819'
                      })}
                      className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
                        selectedFile?.type === 'CSV' ? 'bg-[#1d4ed8]/30 border-[#60a5fa] text-[#93c5fd]' : 'bg-[#161e29] border-[#212c3d] text-[#93c5fd] hover:bg-[#1d4ed8]/20'
                      }`}
                    >
                      CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFile({
                        name: 'soc_shift_handover_matrix.xlsx',
                        type: 'XLSX',
                        size: '18.4 MB',
                        hash: '7b28a90192840192840192840192840192840192840192840192840192840192'
                      })}
                      className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
                        selectedFile?.type === 'XLSX' ? 'bg-[#1d4ed8]/30 border-[#60a5fa] text-[#93c5fd]' : 'bg-[#161e29] border-[#212c3d] text-[#93c5fd] hover:bg-[#1d4ed8]/20'
                      }`}
                    >
                      XLSX
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFile({
                        name: 'statutory_soc_incident_report_inv338.pdf',
                        type: 'PDF',
                        size: '8.6 MB',
                        hash: '9a01824019284019284019284019284019284019284019284019284019284019'
                      })}
                      className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
                        selectedFile?.type === 'PDF' ? 'bg-[#1d4ed8]/30 border-[#60a5fa] text-[#93c5fd]' : 'bg-[#161e29] border-[#212c3d] text-[#93c5fd] hover:bg-[#1d4ed8]/20'
                      }`}
                    >
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFile({
                        name: 'soc_tier2_analyst_runbook_notes.txt',
                        type: 'TXT',
                        size: '1.2 MB',
                        hash: '5d18401928401928401928401928401928401928401928401928401928401928'
                      })}
                      className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
                        selectedFile?.type === 'TXT' ? 'bg-[#1d4ed8]/30 border-[#60a5fa] text-[#93c5fd]' : 'bg-[#161e29] border-[#212c3d] text-[#93c5fd] hover:bg-[#1d4ed8]/20'
                      }`}
                    >
                      TXT
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFile({
                        name: 'boundary_firewall_containment.log',
                        type: 'LOG',
                        size: '88.5 MB',
                        hash: '120481248194f29a88310c9d74e0192a831bce9812948271048bce9284102948'
                      })}
                      className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
                        selectedFile?.type === 'LOG' ? 'bg-[#1d4ed8]/30 border-[#60a5fa] text-[#93c5fd]' : 'bg-[#161e29] border-[#212c3d] text-[#93c5fd] hover:bg-[#1d4ed8]/20'
                      }`}
                    >
                      LOG
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFile({
                        name: 'scada_pcap_forensics_bundle.zip',
                        type: 'ZIP',
                        size: '142.0 MB',
                        hash: '3f90182401928401928401928401928401928401928401928401928401928401'
                      })}
                      className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
                        selectedFile?.type === 'ZIP' ? 'bg-[#1d4ed8]/30 border-[#60a5fa] text-[#93c5fd]' : 'bg-[#161e29] border-[#212c3d] text-[#93c5fd] hover:bg-[#1d4ed8]/20'
                      }`}
                    >
                      ZIP
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFile({
                        name: 'identity_saml_auth_audit_trail.xml',
                        type: 'XML',
                        size: '24.3 MB',
                        hash: 'e819401928401928401928401928401928401928401928401928401928401928'
                      })}
                      className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
                        selectedFile?.type === 'XML' ? 'bg-[#1d4ed8]/30 border-[#60a5fa] text-[#93c5fd]' : 'bg-[#161e29] border-[#212c3d] text-[#93c5fd] hover:bg-[#1d4ed8]/20'
                      }`}
                    >
                      XML
                    </button>
                  </div>
                </div>

                {/* Selected File Card */}
                {selectedFile && (
                  <div className="p-3 rounded bg-[#141b27] border border-[#212c3d] flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="p-1.5 rounded bg-[#1d4ed8]/20 text-[#60a5fa] font-mono font-bold text-[11px]">
                        {selectedFile.type}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#f1f5f9] truncate">{selectedFile.name}</div>
                        <div className="text-[10px] text-[#64748b] font-mono truncate">
                          Size: {selectedFile.size} · SHA-256: {selectedFile.hash.slice(0, 24)}...
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                      READY TO VALIDATE
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Validation Pipeline & Canonical Schema Mapping */}
          {step === 2 && selectedFile && (
            <div className="space-y-4">
              {/* Validation Result Card (Section 12) */}
              <div className="p-3.5 rounded-lg bg-[#0b0f17] border border-[#212c3d] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#212c3d]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    <span className="text-[12px] font-bold text-[#f1f5f9] font-sans uppercase tracking-wider">
                      File Validation & Verification Result
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/30">
                    STATUS: READY
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <div className="text-[#64748b] text-[10px]">FILE / FORMAT</div>
                    <div className="text-[#f1f5f9] font-bold truncate">{selectedFile.name}</div>
                    <div className="text-[#60a5fa]">{selectedFile.type} ({selectedFile.size})</div>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <div className="text-[#64748b] text-[10px]">VALIDATION & SCHEMA</div>
                    <div className="text-[#10b981] font-bold">FORMAT: VALID</div>
                    <div className="text-[#10b981]">SCHEMA: VALID</div>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <div className="text-[#64748b] text-[10px]">CANONICAL MAPPING</div>
                    <div className="text-[#60a5fa] font-bold">MAPPED (OCSF)</div>
                    <div className="text-[#94a3b8]">{category} RECORD</div>
                  </div>
                  <div className="p-2 rounded bg-[#111622] border border-[#212c3d]">
                    <div className="text-[#64748b] text-[10px]">INTEGRITY</div>
                    <div className="text-[#10b981] font-bold">VERIFIED</div>
                    <div className="text-[#94a3b8] truncate">{selectedFile.hash.slice(0, 14)}...</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {validationSteps.map((s, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#111622] border border-[#212c3d] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                        <span className="text-[#cbd5e1]">{s.label}</span>
                      </div>
                      <span className="font-mono text-[#10b981] font-semibold text-[10px]">{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Architecture Mapping Visualization */}
              <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-3">
                <div className="text-[11px] font-mono uppercase text-[#94a3b8] flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5 text-[#60a5fa]" />
                  <span>Canonical Evidence Lifecycle Ingestion Flow:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded bg-[#0e131b] border border-[#212c3d] space-y-1">
                    <span className="text-[#64748b] block text-[10px]">RAW SUBMISSION</span>
                    <span className="text-[#f1f5f9] font-semibold truncate block">{selectedFile.name}</span>
                    <span className="text-[#94a3b8] text-[10px] block">Source: {submissionChannel}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0e131b] border border-[#212c3d] space-y-1">
                    <span className="text-[#64748b] block text-[10px]">CANONICAL SCHEMA</span>
                    <span className="text-[#60a5fa] font-semibold">{category} RECORD</span>
                    <span className="text-[#94a3b8] text-[10px] block">OCSF v1.1.0 Protocol</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0e131b] border border-[#212c3d] space-y-1">
                    <span className="text-[#64748b] block text-[10px]">DESTINATION</span>
                    <span className="text-[#10b981] font-semibold">{targetCse.cseId} Vault</span>
                    <span className="text-[#94a3b8] text-[10px] block">Readiness: +7% Projected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Success Confirmation & Ingestion Summary */}
          {step === 3 && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 mx-auto flex items-center justify-center text-[#10b981]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-[16px] font-bold text-[#f1f5f9]">
                  Evidence Ingested & Committed to Enclave Vault
                </h3>
                <p className="text-[12px] text-[#94a3b8] max-w-md mx-auto">
                  Artifact attributed to <strong className="text-[#f1f5f9]">{targetCse.cseId} ({targetCse.cseName})</strong>. 
                  Evidence readiness updated and reflected in supervisory models.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] text-left max-w-md mx-auto text-[11px] font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Entity:</span>
                  <span className="text-[#f1f5f9]">{targetCse.cseId} — {targetCse.cseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Category:</span>
                  <span className="text-[#60a5fa] font-semibold">{category} RECORD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Status:</span>
                  <span className="text-[#10b981] font-bold">PRESENT (VERIFIED)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">SHA-256 Digest:</span>
                  <span className="text-[#94a3b8] truncate max-w-[200px]">{selectedFile?.hash}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#111722] border-t border-[#212c3d] flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAndClose}
          >
            {step === 3 ? 'Close Ingestion Console' : 'Cancel'}
          </Button>

          <div>
            {step === 1 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunValidation}
                iconRight={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Validate & Map Schema
              </Button>
            )}

            {step === 2 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCommitSubmission}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  iconRight={<Database className="w-3.5 h-3.5" />}
                >
                  Add to Assessment
                </Button>
              </div>
            )}

            {step === 3 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleResetAndClose}
              >
                Done
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
