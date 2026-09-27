import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { RemediationMandate } from '@/data/mock/remediation';
import { 
  Search, 
  Send
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  Input,
  Select,
  Card,
  StatusBadge,
  Tabs,
  Modal,
  Button
} from '@/components/common';

export const RemediationPage: React.FC = () => {
  const { 
    remediations, 
    verifications, 
    submitRemediationArtifact, 
    verifyGate, 
    sealVerification 
  } = useSupervisory();

  // Tabs: Open Remediation, Verification, Reopened / Regression
  const [activeTab, setActiveTab] = useState<string>('open');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected mandate for evidence submission demo modal
  const [uploadModalMandate, setUploadModalMandate] = useState<RemediationMandate | null>(null);
  const [mockArtifactHash, setMockArtifactHash] = useState('c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2');

  const filteredMandates = remediations.filter(m => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = m.id.toLowerCase().includes(q) ||
                    m.findingId.toLowerCase().includes(q) ||
                    m.cseName.toLowerCase().includes(q) ||
                    m.mandateTitle.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    return true;
  });

  const handleUploadSubmit = () => {
    if (!uploadModalMandate) return;
    submitRemediationArtifact(uploadModalMandate.id, 'ESC-221', mockArtifactHash);
    setUploadModalMandate(null);
  };

  const tabs = [
    { 
      id: 'open', 
      label: '1. Open Remediation', 
      count: remediations.filter(r => r.status !== 'CLOSED').length, 
      icon: <span className="material-symbols-outlined text-[15px]">published_with_changes</span> 
    },
    { 
      id: 'verification', 
      label: '2. Verification Gates', 
      count: verifications.length, 
      icon: <span className="material-symbols-outlined text-[15px]">verified</span> 
    },
    { 
      id: 'regression', 
      label: '3. Reopened / Regression', 
      icon: <span className="material-symbols-outlined text-[15px]">history</span> 
    },
  ];

  return (
    <PageContainer>
      {/* 1. STANDARD PAGE HEADER */}
      <PageHeader
        title="Supervisory Remediation &amp; Verification"
        description="Supervisory lifecycle tracking corrective actions, evidence submissions, and independent examiner verification gates."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2.5 py-1 rounded-md border border-[#7bdb80]/20">
              Semantic Rule: Submission ≠ Automatic Closure
            </span>
          </div>
        }
      />

      {/* 2. TABS */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
      />

      {/* --- TAB 1: OPEN REMEDIATION --- */}
      {activeTab === 'open' && (
        <div className="space-y-4 min-w-0">
          {/* Filter Bar */}
          <div className="p-3.5 rounded-lg bg-[#181c22] border border-[#262a31] flex flex-wrap items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                icon={<Search className="w-4 h-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search mandate ID, finding ID, entity..."
                sizeVariant="sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#8c90a0] font-mono text-[11px]">Status:</span>
              <Select
                sizeVariant="sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'OPEN', label: 'OPEN' },
                  { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
                  { value: 'SUBMITTED', label: 'SUBMITTED' },
                  { value: 'UNDER_VERIFICATION', label: 'UNDER_VERIFICATION' },
                  { value: 'CLOSED', label: 'CLOSED' },
                  { value: 'REOPENED', label: 'REOPENED' },
                ]}
              />
            </div>
          </div>

          {/* Mandates List */}
          <div className="space-y-3 min-w-0">
            {filteredMandates.map((m) => (
              <Card key={m.id} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#7bdb80] px-2 py-0.5 rounded bg-[#14181f] border border-[#262a31]">
                      {m.id}
                    </span>
                    <Link
                      to={`/review/${m.findingId}`}
                      className="font-mono text-[11px] text-[#afc6ff] hover:underline"
                    >
                      Ref: {m.findingId}
                    </Link>
                    <span className="text-[#8c90a0]">•</span>
                    <span className="text-[12px] font-semibold text-[#dfe2eb]">{m.cseName}</span>
                    <span className="text-[11px] font-mono text-[#8c90a0]">[{m.controlRef}]</span>
                  </div>

                  <StatusBadge status={m.status} />
                </div>

                <div>
                  <h3 className="text-[14px] font-semibold text-[#dfe2eb]">{m.mandateTitle}</h3>
                  <p className="text-[12px] text-[#8c90a0] mt-0.5 leading-snug">{m.actionSummary}</p>
                </div>

                {/* Progressive Lifecycle Stage Indicator */}
                <div className="p-2 rounded-lg bg-[#14181f] border border-[#262a31]">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 text-center font-mono text-[10px]">
                    <div className="p-1 rounded bg-[#1c2026] text-[#7bdb80] font-semibold">
                      1. Flagged
                    </div>
                    <div className="p-1 rounded bg-[#1c2026] text-[#7bdb80] font-semibold">
                      2. Action Plan
                    </div>
                    <div className="p-1 rounded bg-[#1c2026] text-[#7bdb80] font-semibold">
                      3. Response
                    </div>
                    <div className={`p-1 rounded font-semibold ${
                      m.artifacts.some(a => a.status === 'PRESENT_VERIFIED') 
                        ? 'bg-[#1c2026] text-[#7bdb80]' 
                        : 'bg-[#181c22] text-amber-300'
                    }`}>
                      4. Evidence ({m.evidenceProgress})
                    </div>
                    <div className={`p-1 rounded font-semibold ${
                      m.status === 'UNDER_VERIFICATION' ? 'bg-[#1f6feb]/20 text-[#afc6ff] border border-[#1f6feb]/40' :
                      m.status === 'CLOSED' ? 'bg-[#1c2026] text-[#7bdb80]' : 'bg-[#10141a] text-[#8c90a0]'
                    }`}>
                      5. Verification Gate
                    </div>
                    <div className={`p-1 rounded font-semibold ${
                      m.status === 'CLOSED' ? 'bg-emerald-950/30 text-emerald-300' : 'bg-[#10141a] text-[#8c90a0]'
                    }`}>
                      6. Sealed Closure
                    </div>
                  </div>
                </div>

                {/* Artifacts Checklist */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[#8c90a0] font-mono text-[11px]">Artifacts:</span>
                    {m.artifacts.map((art) => (
                      <span
                        key={art.id}
                        className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 ${
                          art.status === 'PRESENT_VERIFIED'
                            ? 'bg-[#7bdb80]/10 text-[#7bdb80] border border-[#7bdb80]/20'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        <span>{art.id}</span>
                        {art.status === 'PRESENT_VERIFIED' ? '✓' : '✗'}
                      </span>
                    ))}
                  </div>

                  {m.status !== 'CLOSED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Send className="w-3 h-3" />}
                      onClick={() => setUploadModalMandate(m)}
                    >
                      Simulate Evidence Ingestion
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: VERIFICATION GATES --- */}
      {activeTab === 'verification' && (
        <div className="space-y-4 min-w-0">
          <div className="p-3 rounded-lg bg-[#181c22] border border-[#262a31] text-[12px] text-[#8c90a0] flex items-center justify-between">
            <span>Independent Examiner Verification Gates (Human-in-the-Loop):</span>
            <span className="font-mono text-[#7bdb80] font-semibold">{verifications.length} Verification Records</span>
          </div>

          {verifications.map((v) => (
            <Card key={v.id} className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#262a31]/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-[#afc6ff]">{v.id}</span>
                    <span className="text-[#8c90a0]">•</span>
                    <span className="text-[13px] font-semibold text-[#dfe2eb]">{v.cseName}</span>
                    <span className="text-[11px] font-mono text-[#8c90a0]">Mandate: {v.mandateId}</span>
                  </div>
                  <div className="text-[11px] text-[#8c90a0] font-mono mt-0.5">
                    Lead Examiner: <strong className="text-[#dfe2eb]">{v.leadExaminer}</strong> · Standard: {v.statutoryStandard}
                  </div>
                </div>

                <StatusBadge status={v.verificationVerdict} />
              </div>

              {/* Gate Checklist */}
              <div className="space-y-2">
                <span className="text-[12px] font-semibold text-[#dfe2eb] font-mono uppercase">
                  Mandatory Verification Checklist:
                </span>
                <div className="space-y-1.5">
                  {v.gateChecklist.map((gate) => (
                    <div
                      key={gate.id}
                      className="p-2.5 rounded-lg bg-[#14181f] border border-[#262a31] flex items-center justify-between text-[12px]"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={gate.verified}
                          onChange={(e) => verifyGate(v.id, gate.id, e.target.checked)}
                          disabled={v.verificationVerdict === 'VERIFIED_SEALED'}
                          className="cursor-pointer rounded border-[#3b414d]"
                        />
                        <span className={`font-medium ${gate.verified ? 'text-[#dfe2eb]' : 'text-[#8c90a0]'}`}>
                          {gate.label}
                        </span>
                      </div>
                      <span className={`font-mono text-[10px] font-bold ${
                        gate.verified ? 'text-[#7bdb80]' : 'text-rose-400'
                      }`}>
                        {gate.verified ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rationale & Action */}
              <div className="p-3 rounded-lg bg-[#14181f] border border-[#262a31] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
                <div className="space-y-0.5">
                  <span className="text-[#8c90a0] font-mono text-[10px] uppercase font-bold">
                    Examiner Rationale:
                  </span>
                  <p className="text-[#dfe2eb] text-[12px] leading-snug">{v.supervisoryRationale}</p>
                </div>

                {v.verificationVerdict !== 'VERIFIED_SEALED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                    onClick={() => sealVerification(v.id)}
                  >
                    Seal Verification &amp; Close
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* --- TAB 3: REOPENED / REGRESSION --- */}
      {activeTab === 'regression' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#262a31]/60">
            <h3 className="text-[14px] font-semibold text-[#dfe2eb] font-mono uppercase">
              Remediation Regression &amp; Reopening Audit
            </h3>
            <span className="text-[11px] text-[#8c90a0] font-mono">Multi-cycle tracking</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-[#14181f] border border-[#262a31] space-y-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-rose-300">
                  REC-0014: Repeat Patch Expiration
                </span>
                <span className="text-[#8c90a0] font-mono">NorthGrid (CSE-014)</span>
              </div>
              <p className="text-[#dfe2eb] leading-relaxed">
                Control CTRL-09 (Firewall Patch Verification) was verified in Q2 2025, but re-breached in Q3 2026 after temporary manual patch exception expired.
              </p>
              <div className="text-[11px] text-[#8c90a0] font-mono">
                Status: <strong className="text-amber-300">Persistent Regression Active</strong>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STANDARDIZED MODAL FOR SIMULATING EVIDENCE INGESTION */}
      <Modal
        isOpen={!!uploadModalMandate}
        onClose={() => setUploadModalMandate(null)}
        title="Simulate Corrective Evidence Ingestion"
        description={
          uploadModalMandate
            ? `Simulating upload of required corrective telemetry ESC-221 for ${uploadModalMandate.id}`
            : ''
        }
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setUploadModalMandate(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUploadSubmit}>
              Simulate Ingestion
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-[12px]">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#8c90a0] uppercase">
              Cryptographic SHA-256 Digest:
            </label>
            <input
              type="text"
              value={mockArtifactHash}
              onChange={(e) => setMockArtifactHash(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-[#14181f] border border-[#262a31] font-mono text-[12px] text-[#7bdb80] focus:outline-none focus:border-[#afc6ff]"
            />
          </div>

          <div className="p-2.5 rounded-md bg-[#14181f] border border-[#262a31] text-[11px] text-[#8c90a0]">
            Notice: Ingesting evidence automatically transitions mandate to <strong>UNDER_VERIFICATION</strong>. Human verification remains strictly required before closure.
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
