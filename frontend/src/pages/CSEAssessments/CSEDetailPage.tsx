import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockCSEs } from '@/data/mock/cses';
import { mockFindings } from '@/data/mock/findings';

export const CSEDetailPage: React.FC = () => {
  const { cseId } = useParams<{ cseId: string }>();
  const entityId = cseId || 'CSE-014';
  const cse = mockCSEs.find(c => c.cseId.toLowerCase() === entityId.toLowerCase()) || mockCSEs[0];
  const findings = mockFindings.filter(f => f.cseId.toLowerCase() === cse.cseId.toLowerCase());

  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'signals'>('overview');

  return (
    <div className="flex flex-col w-full text-[#dfe2eb] pb-16 space-y-4">
      {/* 1. TOP BREADCRUMB & PAGE HEADER */}
      <div className="flex flex-col gap-1 pt-2">
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#c2c6d6]">
          <Link to="/overview" className="hover:text-[#afc6ff] transition-colors">SAT-SA</Link>
          <span className="text-[#8c90a0]">/</span>
          <span className="text-[#c2c6d6]">Supervision</span>
          <span className="text-[#8c90a0]">/</span>
          <Link to="/supervision/cse-assessments" className="hover:text-[#afc6ff] transition-colors">
            CSE Assessments
          </Link>
          <span className="text-[#8c90a0]">/</span>
          <span className="text-[#afc6ff] font-semibold">{cse.cseId}</span>
        </div>

        {/* Title Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#dfe2eb]">
              {cse.cseId} — Critical Infrastructure Entity ({cse.sector} Sector)
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#93000a] text-[#ffdad6] rounded text-[11px] font-bold uppercase tracking-wider font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-ping"></span>
              <span>CRITICAL</span>
              <span className="opacity-60">|</span>
              <span>REVIEW REQUIRED</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/supervision/cse-assessments"
              className="px-3 py-1.5 bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] rounded text-xs flex items-center gap-1.5 transition-colors border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to CSE Assessments</span>
            </Link>
            <button
              type="button"
              onClick={() => alert(`Exporting complete assessment dossier for ${cse.cseId}...`)}
              className="px-3 py-1.5 bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] rounded text-xs flex items-center gap-1.5 transition-colors border border-[#262a31]"
            >
              <span className="material-symbols-outlined text-[16px]">ios_share</span>
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-[#181c22] rounded font-mono text-xs text-[#c2c6d6] border border-[#262a31] mt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8c90a0]">Assessment Period:</span>
            <span className="text-[#dfe2eb] font-semibold">{cse.period}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#8c90a0]">Last Updated:</span>
            <span className="text-[#dfe2eb]">24 Sep 2026, 18:30 IST</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#8c90a0]">Assessment Status:</span>
            <span className="text-[#ffb4ab] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span> {cse.status}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#8c90a0]">Evidence Readiness:</span>
            <span className="text-[#ffb693] font-semibold">{cse.evidenceReadiness}%</span>
            <span className="text-[#ffb4ab] text-[11px]">(-19% vs benchmark)</span>
          </div>
        </div>
      </div>

      {/* 2. COMPACT SUPERVISORY SUMMARY TILES (6 Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Tile 1 */}
        <div className="p-3 bg-[#1c2026] rounded flex flex-col justify-between hover:bg-[#262a31] transition-colors border border-[#262a31]">
          <div className="text-[11px] text-[#c2c6d6] uppercase font-semibold">Entity Identity</div>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-[#afc6ff]">{cse.cseId}</div>
            <div className="text-xs text-[#c2c6d6] truncate">{cse.cseName}</div>
          </div>
          <div className="mt-1 font-mono text-xs text-[#8c90a0] flex items-center justify-between">
            <span>{cse.sector} Sector</span>
            <span className="material-symbols-outlined text-[14px]">bolt</span>
          </div>
        </div>

        {/* Tile 2 */}
        <div className="p-3 bg-[#1c2026] rounded flex flex-col justify-between hover:bg-[#262a31] transition-colors border border-[#262a31] group">
          <div className="text-[11px] text-[#c2c6d6] uppercase font-semibold flex items-center justify-between">
            <span>Evidence Readiness</span>
            <span className="material-symbols-outlined text-[14px] text-[#ffb693]">warning</span>
          </div>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-[#ffb693]">{cse.evidenceReadiness}%</div>
            <div className="text-xs text-[#ffb4ab]">Deficient Target (-19%)</div>
          </div>
          <Link to="/evidence" className="mt-1 font-mono text-xs text-[#afc6ff] flex items-center gap-1 group-hover:underline">
            <span>/evidence?cse=014</span>
            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
          </Link>
        </div>

        {/* Tile 3 */}
        <div className="p-3 bg-[#1c2026] rounded flex flex-col justify-between hover:bg-[#262a31] transition-colors border border-[#262a31] group">
          <div className="text-[11px] text-[#c2c6d6] uppercase font-semibold flex items-center justify-between">
            <span>Open Findings</span>
            <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
          </div>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-[#dfe2eb]">
              {cse.openFindingsCount} <span className="text-xs font-normal text-[#8c90a0]">total</span>
            </div>
            <div className="text-xs text-[#ffb4ab] font-medium">{cse.criticalFindingsCount} Critical / High</div>
          </div>
          <Link to="/findings" className="mt-1 font-mono text-xs text-[#afc6ff] flex items-center gap-1 group-hover:underline">
            <span>/findings?cse=014</span>
            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
          </Link>
        </div>

        {/* Tile 4 */}
        <div className="p-3 bg-[#1c2026] rounded flex flex-col justify-between hover:bg-[#262a31] transition-colors border border-[#262a31] group">
          <div className="text-[11px] text-[#c2c6d6] uppercase font-semibold">Execution Gaps</div>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-[#ffb4ab]">{cse.executionGapsCount}</div>
            <div className="text-xs text-[#c2c6d6]">Candidates flagged</div>
          </div>
          <Link to="/analytics/execution-gaps" className="mt-1 font-mono text-xs text-[#afc6ff] flex items-center gap-1 group-hover:underline">
            <span>/execution-gaps</span>
            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
          </Link>
        </div>

        {/* Tile 5 */}
        <div className="p-3 bg-[#1c2026] rounded flex flex-col justify-between hover:bg-[#262a31] transition-colors border border-[#262a31] group">
          <div className="text-[11px] text-[#c2c6d6] uppercase font-semibold">Negative Space</div>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-[#ffb693]">{cse.negativeSpaceCount}</div>
            <div className="text-xs text-[#c2c6d6]">Missing artefacts</div>
          </div>
          <Link to="/analytics/negative-space" className="mt-1 font-mono text-xs text-[#afc6ff] flex items-center gap-1 group-hover:underline">
            <span>/negative-space</span>
            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
          </Link>
        </div>

        {/* Tile 6 */}
        <div className="p-3 bg-[#1c2026] rounded flex flex-col justify-between hover:bg-[#262a31] transition-colors border border-[#262a31] group">
          <div className="text-[11px] text-[#c2c6d6] uppercase font-semibold">Open Remediation</div>
          <div className="mt-1">
            <div className="text-xl font-bold font-mono text-[#7bdb80]">
              {cse.remediationCount} <span className="text-xs font-normal text-[#8c90a0]">active</span>
            </div>
            <div className="text-xs text-[#c2c6d6]">1 under verification</div>
          </div>
          <Link to="/remediation" className="mt-1 font-mono text-xs text-[#afc6ff] flex items-center gap-1 group-hover:underline">
            <span>/remediation</span>
            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* 3. CAPABILITY DISCREPANCY (CORE SUPERVISORY USP) */}
      <div className="p-4 bg-[#1c2026] rounded-xl flex flex-col gap-3 border border-[#262a31]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#262a31]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#afc6ff] text-[20px]">difference</span>
            <h2 className="text-base text-[#dfe2eb] font-semibold">
              Capability Discrepancy Analysis
            </h2>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#262a31] text-[#c2c6d6]">
              Core Supervisory USP
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30 font-mono text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">priority_high</span>
            <span>Observed Discrepancy: {cse.capabilityDiscrepancyCount} Controls · Status: Review Required</span>
          </div>
        </div>

        {/* Two-Column Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Claimed */}
          <div className="p-3 bg-[#181c22] rounded-lg flex flex-col gap-2 border border-[#262a31]">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7bdb80]"></span>
                <span className="text-[11px] uppercase text-[#dfe2eb] font-semibold tracking-wider font-mono">
                  Claimed Capability
                </span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#262a31] text-[#7bdb80] font-semibold">
                {cse.claimedCapability} / 25 Controls Attested
              </span>
            </div>
            <p className="text-xs text-[#c2c6d6] mb-1">
              Self-attested operational state declared in compliance submission dated 12 Aug 2026.
            </p>

            <div className="space-y-1.5">
              {[
                { name: 'Alert Triage & Ingestion', status: 'High (Fully Operational)' },
                { name: 'Investigation Workflow', status: 'High (Fully Operational)' },
                { name: 'Evidence Retention (Log Archival)', status: 'High (180-Day Mandate)' },
                { name: 'Escalation Handling & SLA', status: 'High (<15m Escalation)' },
                { name: 'Incident Containment Response', status: 'High (Automated Action)' },
                { name: 'Closure Validation & Sign-off', status: 'High (Dual Authority)' },
              ].map((item, i) => (
                <div key={i} className="p-2 bg-[#1c2026] rounded flex items-center justify-between text-xs border border-[#262a31]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#7bdb80] text-[16px]">check_circle</span>
                    <span className="font-medium text-[#dfe2eb]">{item.name}</span>
                  </div>
                  <span className="font-mono text-xs text-[#7bdb80]">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Observed */}
          <div className="p-3 bg-[#181c22] rounded-lg flex flex-col gap-2 border border-[#262a31]">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
                <span className="text-[11px] uppercase text-[#dfe2eb] font-semibold tracking-wider font-mono">
                  Observed Capability (Telemetry)
                </span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#262a31] text-[#ffb4ab] font-semibold">
                {cse.observedCapability} / 25 Controls Evidenced
              </span>
            </div>
            <p className="text-xs text-[#c2c6d6] mb-1">
              Derived from air-gapped forensic log ingestion and verification engine runs.
            </p>

            <div className="space-y-1.5">
              {[
                { name: 'Alert Triage & Ingestion', status: 'Evidenced (99.1% ingest)', ok: true },
                { name: 'Investigation Workflow', status: 'Incomplete Action Artifacts', ok: false },
                { name: 'Evidence Retention (Log Archival)', status: 'Negative Space on Switch SW-03', ok: false },
                { name: 'Escalation Handling & SLA', status: 'Execution Gap (GAP-0071)', ok: false },
                { name: 'Incident Containment Response', status: 'Evidenced (Field Action Confirmed)', ok: true },
                { name: 'Closure Validation & Sign-off', status: 'Missing Dual Authorization', ok: false },
              ].map((item, i) => (
                <div key={i} className="p-2 bg-[#1c2026] rounded flex items-center justify-between text-xs border border-[#262a31]">
                  <div className="flex items-center gap-1.5">
                    <span className={`material-symbols-outlined text-[16px] ${item.ok ? 'text-[#7bdb80]' : 'text-[#ffb4ab]'}`}>
                      {item.ok ? 'verified' : 'cancel'}
                    </span>
                    <span className="font-medium text-[#dfe2eb]">{item.name}</span>
                  </div>
                  <span className={`font-mono text-xs ${item.ok ? 'text-[#7bdb80]' : 'text-[#ffb4ab]'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statutory rule footer */}
        <div className="p-2.5 rounded bg-[#0a0e14] border border-[#262a31] flex items-center gap-2 text-xs text-[#c2c6d6]">
          <span className="material-symbols-outlined text-[#afc6ff] text-[18px]">info</span>
          <span>
            <strong className="text-[#dfe2eb]">Mandatory Semantic Rule:</strong> Missing Evidence ≠ Confirmed Failure. Capability Discrepancy is a supervisory signal allocating human examiner review, not an automated sanction.
          </span>
        </div>
      </div>

      {/* 4. ASSOCIATED FINDINGS & EVIDENCE WORKSPACE SHORTCUT */}
      <div className="bg-[#1c2026] p-4 rounded-xl border border-[#262a31] space-y-3">
        <div className="flex items-center justify-between border-b border-[#262a31] pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#afc6ff] text-[18px]">warning</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#dfe2eb]">
              Active Supervisory Findings for {cse.cseId} ({findings.length})
            </h3>
          </div>
          <Link to="/findings" className="text-xs text-[#afc6ff] hover:underline font-medium">
            View All Findings Queue →
          </Link>
        </div>

        <div className="space-y-2">
          {findings.map(f => (
            <div 
              key={f.id}
              className="p-3 rounded bg-[#181c22] border border-[#262a31] hover:border-[#424754] transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-[#afc6ff]">{f.id}</span>
                  <span className="px-2 py-0.5 rounded bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/20 font-bold">
                    {f.priority}
                  </span>
                  <span className="text-[#c2c6d6] font-semibold">{f.controlId} ({f.controlName})</span>
                </div>
                <div className="text-xs text-[#dfe2eb] font-semibold">{f.title}</div>
                <p className="text-[11px] text-[#c2c6d6] max-w-3xl">{f.whyFlagged}</p>
              </div>

              <Link
                to={`/findings/${f.id}`}
                className="px-3 py-1.5 bg-[#1f6feb] hover:bg-[#1f6feb]/90 text-white rounded font-medium text-xs flex items-center gap-1.5 self-start md:self-center transition-colors shadow-sm whitespace-nowrap"
              >
                <span>Examiner Workspace</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
