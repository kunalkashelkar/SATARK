import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface PeerMetricRow {
  name: string;
  dotColor: string;
  cseValue: string;
  peerMedian: string;
  peerRange: string;
  differential: string;
  differentialColor: string;
  recurrenceContext: string;
  recurrenceColor: string;
  actionPath: string;
  actionText: string;
}

const mockPeerMetrics: PeerMetricRow[] = [
  {
    name: 'Execution Gaps',
    dotColor: 'bg-[#ffb4ab]',
    cseValue: '7',
    peerMedian: '2.8',
    peerRange: '2 – 4',
    differential: '+4.2',
    differentialColor: 'bg-[#93000a]/30 text-[#ffb4ab]',
    recurrenceContext: 'Recurring (3 Qtrs)',
    recurrenceColor: 'text-[#ffb693]',
    actionPath: '/analytics/execution-gaps',
    actionText: 'View Gaps',
  },
  {
    name: 'Negative Space',
    dotColor: 'bg-[#ffb693]',
    cseValue: '4',
    peerMedian: '1.6',
    peerRange: '1 – 3',
    differential: '+2.4',
    differentialColor: 'bg-[#c55100]/30 text-[#ffb693]',
    recurrenceContext: 'Recurring (2 Qtrs)',
    recurrenceColor: 'text-[#ffb693]',
    actionPath: '/analytics/negative-space',
    actionText: 'Inspect Space',
  },
  {
    name: 'Process Deviations',
    dotColor: 'bg-[#ffb693]',
    cseValue: '3',
    peerMedian: '1.2',
    peerRange: '1 – 2',
    differential: '+1.8',
    differentialColor: 'bg-[#c55100]/30 text-[#ffb693]',
    recurrenceContext: 'Current Baseline',
    recurrenceColor: 'text-[#c2c6d6]',
    actionPath: '/analytics/process-analysis',
    actionText: 'Audit Workflows',
  },
  {
    name: 'Evidence Readiness',
    dotColor: 'bg-[#afc6ff]',
    cseValue: '71%',
    peerMedian: '89%',
    peerRange: '68% – 94%',
    differential: '-18 pp',
    differentialColor: 'bg-[#c55100]/30 text-[#ffb693]',
    recurrenceContext: 'Persistent Lag',
    recurrenceColor: 'text-[#ffb693]',
    actionPath: '/analytics/evidence-quality',
    actionText: 'Evaluate Quality',
  },
  {
    name: 'Evidence Coverage',
    dotColor: 'bg-[#7bdb80]',
    cseValue: '86%',
    peerMedian: '86%',
    peerRange: '80% – 92%',
    differential: '0 pp',
    differentialColor: 'bg-[#007124]/30 text-[#7bdb80]',
    recurrenceContext: 'Consistent',
    recurrenceColor: 'text-[#7bdb80]',
    actionPath: '/analytics/coverage',
    actionText: 'View Coverage',
  },
  {
    name: 'Behavioural Signals',
    dotColor: 'bg-[#afc6ff]',
    cseValue: '2',
    peerMedian: '1.0',
    peerRange: '0 – 2',
    differential: '+1.0',
    differentialColor: 'bg-[#262a31] text-[#c2c6d6]',
    recurrenceContext: 'Normal Variance',
    recurrenceColor: 'text-[#c2c6d6]',
    actionPath: '/analytics/behavioural-analysis',
    actionText: 'Examine Patterns',
  },
  {
    name: 'Consistency Signals',
    dotColor: 'bg-[#7bdb80]',
    cseValue: '1',
    peerMedian: '1.2',
    peerRange: '1 – 2',
    differential: '-0.2',
    differentialColor: 'bg-[#007124]/30 text-[#7bdb80]',
    recurrenceContext: 'Stable',
    recurrenceColor: 'text-[#7bdb80]',
    actionPath: '/analytics/consistency',
    actionText: 'View Continuity',
  },
];

export const PeerComparisonPage: React.FC = () => {
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [showComparatorDrawer, setShowComparatorDrawer] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const handleSyncTelemetry = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 2500);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full space-y-6 text-[#dfe2eb]">
      {/* STATUTORY SAFEGUARD BANNER (HUMAN-IN-THE-LOOP MANDATE) */}
      <div className="bg-[#181c22] px-4 py-2.5 rounded-lg flex items-center justify-between border border-[#262a31] shadow-sm">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#7bdb80] text-[20px]">gavel</span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] uppercase text-[#7bdb80] font-bold tracking-wider font-mono">
              Statutory Supervisory Safeguard:
            </span>
            <span className="text-[#c2c6d6]">
              Cohort comparison provides contextual baseline evidence for examiner review; it does not constitute a public ranking or automated finding.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-[#8c90a0]">
          <span className="material-symbols-outlined text-[14px]">verified</span>
          <span>NCIIPC-SOP-SEC7.4 COMPLIANT</span>
        </div>
      </div>

      {/* BREADCRUMB & HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 font-mono text-xs text-[#c2c6d6]">
            <span>SAT-SA</span>
            <span>/</span>
            <span>Intelligence</span>
            <span>/</span>
            <span>Peer Comparison</span>
            <span>/</span>
            <span className="text-[#afc6ff] font-semibold">CSE-014 (NorthGrid Energy)</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#dfe2eb] tracking-tight">Peer Comparison</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#262a31] text-[#afc6ff] font-medium border border-[#424754]/40">
              COHORT ID: EN-Q3-26
            </span>
          </div>
          <p className="text-xs text-[#c2c6d6] max-w-3xl">
            Compare supervisory metrics against a defined cohort of comparable CSEs. Strictly cohort-relative, non-punitive, and calibrated for human audit.
          </p>
        </div>

        {/* HEADER QUICK ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowConfigDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs font-mono transition-colors border border-[#424754]/40"
          >
            <span className="material-symbols-outlined text-[16px] text-[#afc6ff]">tune</span>
            <span>Configure Cohort</span>
          </button>
          <button
            onClick={() => setShowComparatorDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs font-mono transition-colors border border-[#424754]/40"
          >
            <span className="material-symbols-outlined text-[16px] text-[#ffb693]">compare_arrows</span>
            <span>Compare 2 CSEs (014 vs 021)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] text-xs font-mono transition-colors border border-[#424754]/40"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export Dossier</span>
          </button>
          <button
            onClick={handleSyncTelemetry}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#1f6feb] hover:bg-[#1f6feb]/85 text-white text-xs font-semibold font-mono transition-colors"
          >
            <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
              {syncDone ? 'check' : 'sync'}
            </span>
            <span>{isSyncing ? 'Syncing...' : syncDone ? 'Telemetry Synced' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* CSE & COHORT CONTEXT BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Active CSE Metadata Card */}
        <div className="lg:col-span-4 bg-[#181c22] p-5 rounded-xl border border-[#262a31] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase text-[#8c90a0] tracking-wider font-bold">Active Subject</span>
              <span className="px-2 py-0.5 rounded bg-[#007124]/30 text-[#7bdb80] font-mono text-[10px] font-bold border border-[#007124]/50">
                TIER-1 CRITICAL
              </span>
            </div>
            <div className="text-xl font-bold text-[#dfe2eb]">NorthGrid Energy (CSE-014)</div>
            <div className="text-xs text-[#c2c6d6] mt-1">Sector: Energy / High-Voltage Transmission Grid</div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 mt-4 bg-[#1c2026] p-3 rounded-lg border border-[#262a31]">
            <div>
              <div className="text-[10px] text-[#8c90a0] uppercase font-bold">Period</div>
              <div className="font-mono text-xs text-[#dfe2eb] font-medium">Q3 2026</div>
            </div>
            <div>
              <div className="text-[10px] text-[#8c90a0] uppercase font-bold">Scope</div>
              <div className="font-mono text-xs text-[#dfe2eb] font-medium">25 Controls</div>
            </div>
            <div>
              <div className="text-[10px] text-[#8c90a0] uppercase font-bold">Schema</div>
              <div className="font-mono text-xs text-[#afc6ff] font-medium">CSF v3.2</div>
            </div>
          </div>
        </div>

        {/* Defined Cohort Definition Card */}
        <div className="lg:col-span-8 bg-[#181c22] p-5 rounded-xl border border-[#262a31] flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-[#8c90a0] tracking-wider font-bold">Baseline Cohort Definition</span>
                <span className="px-2 py-0.5 rounded bg-[#262a31] text-[#dfe2eb] font-mono text-xs border border-[#31353c]">
                  Energy Sector Baseline (N=5)
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-[#7bdb80]">
                <span className="w-2 h-2 rounded-full bg-[#7bdb80]"></span>
                <span>Air-Gapped Telemetry Verified</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#1c2026] p-3 rounded-lg border border-[#262a31]">
                <div className="text-[10px] text-[#8c90a0] uppercase font-bold mb-1">Cohort Members</div>
                <div className="flex flex-wrap gap-1 font-mono text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-[#1f6feb] text-white font-semibold">CSE-014</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#dfe2eb]">CSE-021</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#dfe2eb]">CSE-027</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#dfe2eb]">CSE-031*</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#dfe2eb]">CSE-044</span>
                </div>
              </div>
              <div className="bg-[#1c2026] p-3 rounded-lg border border-[#262a31]">
                <div className="text-[10px] text-[#8c90a0] uppercase font-bold mb-1">Homogeneity Index</div>
                <div className="font-mono text-sm text-[#dfe2eb] font-semibold">94.2% Control Parity</div>
                <div className="text-xs text-[#8c90a0] mt-0.5">Equal sub-critical grid infrastructure</div>
              </div>
              <div className="bg-[#1c2026] p-3 rounded-lg border border-[#262a31]">
                <div className="text-[10px] text-[#8c90a0] uppercase font-bold mb-1">Assessment Window</div>
                <div className="font-mono text-sm text-[#dfe2eb] font-semibold">15 Jul - 30 Sep 2026</div>
                <div className="text-xs text-[#7bdb80] mt-0.5">Synchronous quarterly submission</div>
              </div>
            </div>
          </div>
          {/* Cohort Caveat / Warning */}
          <div className="mt-3 px-3 py-1.5 rounded bg-[#262a31] flex items-center justify-between border border-[#31353c]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#ffb693]">info</span>
              <span className="text-xs text-[#c2c6d6]">
                <strong>Cohort Schema Notice:</strong> 1 cohort member (CSE-031) utilizes Framework v3.1; historical comparability is moderated.
              </span>
            </div>
            <button
              onClick={() => setShowConfigDrawer(true)}
              className="font-mono text-xs text-[#afc6ff] hover:underline flex items-center gap-0.5"
            >
              <span>Review Calibration</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY KPI COMPARISON CARDS (7 MAJOR SUPERVISORY METRICS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase text-[#8c90a0] tracking-wider font-bold">
              Supervisory Metric Differentials (Non-Ranking Context)
            </span>
          </div>
          <span className="font-mono text-xs text-[#8c90a0]">Median Calculated: 18 Oct 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* 1. Evidence Readiness */}
          <div className="bg-[#181c22] p-3 rounded-xl flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="text-[10px] uppercase text-[#8c90a0] font-bold truncate">Readiness</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-[#dfe2eb] font-mono">71%</span>
                <span className="font-mono text-xs text-[#8c90a0]">Med: 89%</span>
              </div>
            </div>
            <div className="mt-2 pt-1 bg-[#1c2026] p-1.5 rounded border border-[#262a31]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#ffb693]">arrow_downward</span>
                <span className="font-mono text-xs text-[#ffb693] font-semibold">-18 pp</span>
              </div>
              <span className="text-[10px] text-[#c2c6d6] leading-tight block mt-0.5">Below cohort median</span>
            </div>
          </div>

          {/* 2. Execution Gaps */}
          <div className="bg-[#181c22] p-3 rounded-xl flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="text-[10px] uppercase text-[#8c90a0] font-bold truncate">Execution Gaps</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-[#ffb4ab] font-mono">7</span>
                <span className="font-mono text-xs text-[#8c90a0]">Med: 2.8</span>
              </div>
            </div>
            <div className="mt-2 pt-1 bg-[#1c2026] p-1.5 rounded border border-[#262a31]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#ffb4ab]">arrow_upward</span>
                <span className="font-mono text-xs text-[#ffb4ab] font-semibold">+4.2</span>
              </div>
              <span className="text-[10px] text-[#c2c6d6] leading-tight block mt-0.5">Above cohort median</span>
            </div>
          </div>

          {/* 3. Negative Space */}
          <div className="bg-[#181c22] p-3 rounded-xl flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="text-[10px] uppercase text-[#8c90a0] font-bold truncate">Negative Space</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-[#ffb693] font-mono">4</span>
                <span className="font-mono text-xs text-[#8c90a0]">Med: 1.6</span>
              </div>
            </div>
            <div className="mt-2 pt-1 bg-[#1c2026] p-1.5 rounded border border-[#262a31]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#ffb693]">arrow_upward</span>
                <span className="font-mono text-xs text-[#ffb693] font-semibold">+2.4</span>
              </div>
              <span className="text-[10px] text-[#c2c6d6] leading-tight block mt-0.5">Above cohort median</span>
            </div>
          </div>

          {/* 4. Process Deviations */}
          <div className="bg-[#181c22] p-3 rounded-xl flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="text-[10px] uppercase text-[#8c90a0] font-bold truncate">Process Dev.</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-[#dfe2eb] font-mono">3</span>
                <span className="font-mono text-xs text-[#8c90a0]">Med: 1.2</span>
              </div>
            </div>
            <div className="mt-2 pt-1 bg-[#1c2026] p-1.5 rounded border border-[#262a31]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#ffb693]">arrow_upward</span>
                <span className="font-mono text-xs text-[#ffb693] font-semibold">+1.8</span>
              </div>
              <span className="text-[10px] text-[#c2c6d6] leading-tight block mt-0.5">Above cohort median</span>
            </div>
          </div>

          {/* 5. Open Findings */}
          <div className="bg-[#181c22] p-3 rounded-xl flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="text-[10px] uppercase text-[#8c90a0] font-bold truncate">Open Findings</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-[#ffb4ab] font-mono">8</span>
                <span className="font-mono text-xs text-[#8c90a0]">Med: 3.4</span>
              </div>
            </div>
            <div className="mt-2 pt-1 bg-[#1c2026] p-1.5 rounded border border-[#262a31]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#ffb4ab]">arrow_upward</span>
                <span className="font-mono text-xs text-[#ffb4ab] font-semibold">+4.6</span>
              </div>
              <span className="text-[10px] text-[#c2c6d6] leading-tight block mt-0.5">Above cohort median</span>
            </div>
          </div>

          {/* 6. Evidence Coverage */}
          <div className="bg-[#181c22] p-3 rounded-xl flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="text-[10px] uppercase text-[#8c90a0] font-bold truncate">Coverage</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-[#7bdb80] font-mono">86%</span>
                <span className="font-mono text-xs text-[#8c90a0]">Med: 86%</span>
              </div>
            </div>
            <div className="mt-2 pt-1 bg-[#1c2026] p-1.5 rounded border border-[#262a31]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#7bdb80]">check</span>
                <span className="font-mono text-xs text-[#7bdb80] font-semibold">0 pp</span>
              </div>
              <span className="text-[10px] text-[#c2c6d6] leading-tight block mt-0.5">At cohort median</span>
            </div>
          </div>

          {/* 7. Open Remediation */}
          <div className="bg-[#181c22] p-3 rounded-xl flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="text-[10px] uppercase text-[#8c90a0] font-bold truncate">Remediation</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-[#dfe2eb] font-mono">3</span>
                <span className="font-mono text-xs text-[#8c90a0]">Med: 1.4</span>
              </div>
            </div>
            <div className="mt-2 pt-1 bg-[#1c2026] p-1.5 rounded border border-[#262a31]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#ffb693]">arrow_upward</span>
                <span className="font-mono text-xs text-[#ffb693] font-semibold">+1.6</span>
              </div>
              <span className="text-[10px] text-[#c2c6d6] leading-tight block mt-0.5">Above cohort median</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE VISUALIZER: METRIC COMPARISON & COHORT DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Horizontal Range & Deviation Bars */}
        <div className="lg:col-span-7 bg-[#181c22] p-5 rounded-xl border border-[#262a31] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#dfe2eb]">Cohort Range & Entity Positioning</h2>
              <div className="text-xs text-[#c2c6d6]">Min-Max peer dispersion with active entity pointer</div>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-[#c2c6d6]">
              <div className="flex items-center gap-1">
                <span className="w-3 h-1.5 rounded-full bg-[#31353c]"></span>
                <span>Cohort Range</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#7bdb80]"></span>
                <span>Median</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#afc6ff]"></span>
                <span>CSE-014</span>
              </div>
            </div>
          </div>

          {/* Range Indicators */}
          <div className="space-y-4 flex-1 flex flex-col justify-around">
            {/* 1. Evidence Readiness */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#dfe2eb]">Evidence Readiness (%)</span>
                <div className="font-mono">
                  <span className="text-[#afc6ff] font-semibold">71%</span>
                  <span className="text-[#8c90a0]"> / Peer Med: 89% (Range: 68% - 94%)</span>
                </div>
              </div>
              <div className="relative w-full h-5 bg-[#1c2026] rounded flex items-center px-1 border border-[#262a31]">
                <div className="absolute h-2.5 rounded bg-[#31353c]" style={{ left: '68%', width: '26%' }}></div>
                <div className="absolute top-1 bottom-1 w-1 bg-[#7bdb80] rounded" style={{ left: '89%' }}></div>
                <div className="absolute w-3.5 h-3.5 rounded-full bg-[#afc6ff] ring-2 ring-[#10141a] -ml-1.5 shadow" style={{ left: '71%' }}></div>
              </div>
            </div>

            {/* 2. Execution Gaps */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#dfe2eb]">Execution Gaps (Count)</span>
                <div className="font-mono">
                  <span className="text-[#ffb4ab] font-semibold">7 gaps</span>
                  <span className="text-[#8c90a0]"> / Peer Med: 2.8 (Range: 2 - 4)</span>
                </div>
              </div>
              <div className="relative w-full h-5 bg-[#1c2026] rounded flex items-center px-1 border border-[#262a31]">
                <div className="absolute h-2.5 rounded bg-[#31353c]" style={{ left: '25%', width: '25%' }}></div>
                <div className="absolute top-1 bottom-1 w-1 bg-[#7bdb80] rounded" style={{ left: '35%' }}></div>
                <div className="absolute w-3.5 h-3.5 rounded-full bg-[#ffb4ab] ring-2 ring-[#10141a] -ml-1.5 shadow" style={{ left: '87.5%' }}></div>
              </div>
            </div>

            {/* 3. Negative Space */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#dfe2eb]">Negative Space (Unobserved Controls)</span>
                <div className="font-mono">
                  <span className="text-[#ffb693] font-semibold">4 controls</span>
                  <span className="text-[#8c90a0]"> / Peer Med: 1.6 (Range: 1 - 3)</span>
                </div>
              </div>
              <div className="relative w-full h-5 bg-[#1c2026] rounded flex items-center px-1 border border-[#262a31]">
                <div className="absolute h-2.5 rounded bg-[#31353c]" style={{ left: '20%', width: '40%' }}></div>
                <div className="absolute top-1 bottom-1 w-1 bg-[#7bdb80] rounded" style={{ left: '32%' }}></div>
                <div className="absolute w-3.5 h-3.5 rounded-full bg-[#ffb693] ring-2 ring-[#10141a] -ml-1.5 shadow" style={{ left: '80%' }}></div>
              </div>
            </div>

            {/* 4. Open Findings */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#dfe2eb]">Open Statutory Findings (Count)</span>
                <div className="font-mono">
                  <span className="text-[#ffb4ab] font-semibold">8 open</span>
                  <span className="text-[#8c90a0]"> / Peer Med: 3.4 (Range: 2 - 5)</span>
                </div>
              </div>
              <div className="relative w-full h-5 bg-[#1c2026] rounded flex items-center px-1 border border-[#262a31]">
                <div className="absolute h-2.5 rounded bg-[#31353c]" style={{ left: '20%', width: '30%' }}></div>
                <div className="absolute top-1 bottom-1 w-1 bg-[#7bdb80] rounded" style={{ left: '34%' }}></div>
                <div className="absolute w-3.5 h-3.5 rounded-full bg-[#ffb4ab] ring-2 ring-[#10141a] -ml-1.5 shadow" style={{ left: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Distribution Dot Plot for Execution Gaps */}
        <div className="lg:col-span-5 bg-[#181c22] p-5 rounded-xl border border-[#262a31] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-[#dfe2eb]">Dot Plot: Execution Gaps</h2>
              <span className="font-mono text-xs text-[#afc6ff]">N=5 CSEs</span>
            </div>
            <p className="text-xs text-[#c2c6d6] mb-4">
              Specific peer distribution showing clustering of comparable CSEs at 2–3 gaps while CSE-014 exhibits an isolated concentration of 7.
            </p>

            {/* SVG Inline Dot Plot Visualization */}
            <div className="bg-[#1c2026] p-4 rounded-lg border border-[#262a31]">
              <svg className="w-full h-36" fill="none" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
                {/* Axis Baseline */}
                <line stroke="#31353c" strokeWidth="2" x1="30" x2="380" y1="90" y2="90" />
                {/* Axis Ticks & Labels (1 to 7 gaps) */}
                <g className="fill-[#8c90a0] font-mono text-[10px]" textAnchor="middle">
                  <text x="50" y="110">1</text>
                  <text x="100" y="110">2</text>
                  <text x="150" y="110">3</text>
                  <text x="200" y="110">4</text>
                  <text x="250" y="110">5</text>
                  <text x="300" y="110">6</text>
                  <text x="350" y="110">7</text>
                </g>
                {/* Peer Med Zone Highlight */}
                <rect fill="#7bdb80" fillOpacity="0.08" height="70" rx="4" width="120" x="90" y="20" />
                <line stroke="#7bdb80" strokeDasharray="3 3" strokeWidth="1.5" x1="140" x2="140" y1="20" y2="90" />
                <text className="fill-[#7bdb80] font-mono text-[10px]" textAnchor="middle" x="140" y="15">
                  MEDIAN (2.8)
                </text>
                {/* Peer CSE-021: 2 gaps */}
                <circle cx="100" cy="78" fill="#31353c" r="7" className="hover:fill-[#dfe2eb] cursor-pointer" />
                <text className="fill-[#8c90a0] font-mono text-[9px]" textAnchor="middle" x="100" y="55">
                  CSE-021 (2)
                </text>
                {/* Peer CSE-027: 2 gaps (stacked) */}
                <circle cx="100" cy="62" fill="#31353c" r="7" className="hover:fill-[#dfe2eb] cursor-pointer" />
                {/* Peer CSE-031: 3 gaps */}
                <circle cx="150" cy="78" fill="#31353c" r="7" className="hover:fill-[#dfe2eb] cursor-pointer" />
                <text className="fill-[#8c90a0] font-mono text-[9px]" textAnchor="middle" x="150" y="55">
                  CSE-031 (3)
                </text>
                {/* Peer CSE-044: 4 gaps */}
                <circle cx="200" cy="78" fill="#31353c" r="7" className="hover:fill-[#dfe2eb] cursor-pointer" />
                <text className="fill-[#8c90a0] font-mono text-[9px]" textAnchor="middle" x="200" y="55">
                  CSE-044 (4)
                </text>
                {/* Target: CSE-014: 7 gaps */}
                <circle cx="350" cy="78" fill="#ffb4ab" r="9" className="cursor-pointer" />
                <circle cx="350" cy="78" r="14" stroke="#ffb4ab" strokeOpacity="0.4" strokeWidth="2" />
                <text className="fill-[#ffb4ab] font-mono text-[10px] font-bold" textAnchor="middle" x="350" y="48">
                  CSE-014 (7)
                </text>
              </svg>
            </div>
          </div>
          <div className="mt-4 p-2 bg-[#1c2026] rounded flex items-center justify-between text-[#c2c6d6] font-mono text-xs border border-[#262a31]">
            <span>Statistical Outlier Confidence: <strong className="text-[#dfe2eb]">p &lt; 0.04</strong></span>
            <Link to="/analytics/execution-gaps" className="text-[#afc6ff] hover:underline flex items-center gap-1">
              <span>Drilldown gaps</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AUDITABLE DEVIATION & SIGNAL-LEVEL COMPARISON TABLE */}
      <div className="bg-[#181c22] p-5 rounded-xl border border-[#262a31]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#dfe2eb]">Signal & Metric Supervisory Audit Table</h2>
            <p className="text-xs text-[#c2c6d6]">Neutral baseline differentials with statutory recurrence indicators</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Display Mode:</span>
            <span className="px-2 py-0.5 rounded bg-[#262a31] text-[#dfe2eb] font-mono text-xs font-semibold border border-[#31353c]">
              All 7 Metrics
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1c2026] text-[#c2c6d6] text-[11px] uppercase tracking-wider font-mono border-b border-[#31353c]">
                <th className="py-2.5 px-3">Signal / Metric Name</th>
                <th className="py-2.5 px-3">CSE-014</th>
                <th className="py-2.5 px-3">Cohort Median</th>
                <th className="py-2.5 px-3">Cohort Range</th>
                <th className="py-2.5 px-3">Differential</th>
                <th className="py-2.5 px-3">Recurrence Context</th>
                <th className="py-2.5 px-3 text-right">Supervisory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#31353c] font-mono text-xs">
              {mockPeerMetrics.map((row) => (
                <tr key={row.name} className="hover:bg-[#1c2026]/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[#dfe2eb] flex items-center gap-2 font-sans">
                    <span className={`w-2 h-2 rounded-full ${row.dotColor}`}></span>
                    <span>{row.name}</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#dfe2eb]">{row.cseValue}</td>
                  <td className="py-2.5 px-3 text-[#c2c6d6]">{row.peerMedian}</td>
                  <td className="py-2.5 px-3 text-[#8c90a0]">{row.peerRange}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${row.differentialColor}`}>
                      {row.differential}
                    </span>
                  </td>
                  <td className={`py-2.5 px-3 font-medium ${row.recurrenceColor}`}>
                    {row.recurrenceContext}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      to={row.actionPath}
                      className="text-[#afc6ff] hover:underline inline-flex items-center gap-0.5 text-xs font-sans"
                    >
                      <span>{row.actionText}</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONTROL SCOPE & VERSION COMPATIBILITY PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Applicability Breakdown */}
        <div className="lg:col-span-6 bg-[#181c22] p-5 rounded-xl border border-[#262a31]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#dfe2eb]">Control Scope & Observation Matrix</h2>
              <div className="text-xs text-[#c2c6d6]">Applicable vs verified evidence controls</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#262a31] text-[#afc6ff] font-mono text-xs border border-[#31353c]">
              25 Scope Baseline
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#1c2026] p-3 rounded-lg border border-[#262a31]">
              <div className="text-[10px] text-[#8c90a0] uppercase font-bold">CSE-014 (NorthGrid)</div>
              <div className="mt-1 flex items-baseline gap-1 font-mono">
                <span className="text-xl font-bold text-[#dfe2eb]">19 / 25</span>
                <span className="text-xs text-[#ffb693]">Observed</span>
              </div>
              <div className="w-full bg-[#262a31] h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#afc6ff] h-full" style={{ width: '76%' }}></div>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-[#8c90a0] mt-1.5">
                <span>5 Discrepancies</span>
                <span>1 Unverified</span>
              </div>
            </div>

            <div className="bg-[#1c2026] p-3 rounded-lg border border-[#262a31]">
              <div className="text-[10px] text-[#8c90a0] uppercase font-bold">Cohort Peer Median</div>
              <div className="mt-1 flex items-baseline gap-1 font-mono">
                <span className="text-xl font-bold text-[#7bdb80]">22 / 24</span>
                <span className="text-xs text-[#7bdb80]">Observed</span>
              </div>
              <div className="w-full bg-[#262a31] h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#7bdb80] h-full" style={{ width: '91.6%' }}></div>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-[#8c90a0] mt-1.5">
                <span>1.8 Discrepancies</span>
                <span>0.2 Unverified</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-[#c2c6d6] bg-[#1c2026] p-3 rounded-lg border border-[#262a31] leading-relaxed">
            <strong className="text-[#dfe2eb]">Examiner Insight:</strong> CSE-014 has declared full applicability for 25 controls, but 5 core OT monitoring controls lack verified continuous telemetry, compared to the cohort average of &lt; 2 unverified.
          </div>
        </div>

        {/* Version Compatibility Indicator */}
        <div className="lg:col-span-6 bg-[#181c22] p-5 rounded-xl border border-[#262a31] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-semibold text-[#dfe2eb]">Schema & Taxonomy Compatibility</h2>
                <div className="text-xs text-[#c2c6d6]">NCIIPC-CSF Version distribution across cohort members</div>
              </div>
              <span className="material-symbols-outlined text-[#afc6ff] text-[20px]">schema</span>
            </div>

            {/* Version Status Chips */}
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between p-3 rounded bg-[#1c2026] border border-[#262a31]">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7bdb80]"></span>
                  <div>
                    <span className="text-xs font-semibold text-[#dfe2eb]">CSF v3.2 (Current Standard)</span>
                    <span className="block font-mono text-[11px] text-[#8c90a0]">Strict air-gapped schema validation</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#007124]/30 text-[#7bdb80] font-bold border border-[#007124]/40">
                    4 / 5 CSEs
                  </span>
                  <span className="block font-mono text-[10px] text-[#8c90a0] mt-0.5">CSE-014, 021, 027, 044</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-[#1c2026] border border-[#262a31]">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffb693]"></span>
                  <div>
                    <span className="text-xs font-semibold text-[#dfe2eb]">CSF v3.1 (Legacy Bridge)</span>
                    <span className="block font-mono text-[11px] text-[#8c90a0]">Telemetry mapping moderated by heuristic parser</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#c55100]/30 text-[#ffb693] font-bold border border-[#c55100]/40">
                    1 / 5 CSEs
                  </span>
                  <span className="block font-mono text-[10px] text-[#8c90a0] mt-0.5">CSE-031</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-[#262a31] rounded flex items-center gap-2 text-xs text-[#ffb693] border border-[#ffb693]/30">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Cross-version baseline standard deviation is adjusted +4.1% to prevent artificial false signals.</span>
          </div>
        </div>
      </div>

      {/* HISTORICAL COHORT TRAJECTORY (LONGITUDINAL TREND) */}
      <div className="bg-[#181c22] p-5 rounded-xl border border-[#262a31]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#dfe2eb]">Longitudinal Cohort Deviation Trajectory</h2>
            <p className="text-xs text-[#c2c6d6]">Historical deviation delta (Δ) from cohort median over 4 sequential quarters</p>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs text-[#c2c6d6]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7bdb80]"></span>
              <span>Zero Line (Cohort Median)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
              <span>CSE-014 Historical Trajectory</span>
            </div>
          </div>
        </div>

        {/* Multi-period Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div>
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Q2 2025</span>
              <div className="text-lg font-semibold text-[#ffb693] mt-1 font-mono">+1.9 Δ</div>
            </div>
            <span className="text-[11px] text-[#c2c6d6] mt-1">Initial baseline divergence</span>
          </div>

          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div>
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Q4 2025</span>
              <div className="text-lg font-semibold text-[#ffb4ab] mt-1 font-mono">+2.5 Δ</div>
            </div>
            <span className="text-[11px] text-[#c2c6d6] mt-1">Pre-remediation peak</span>
          </div>

          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div>
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Q1 2026</span>
              <div className="text-lg font-semibold text-[#7bdb80] mt-1 font-mono">-1.3 Δ</div>
            </div>
            <span className="text-[11px] text-[#7bdb80] mt-1">Post-Remediation DIP</span>
          </div>

          <div className="bg-[#1c2026] p-3 rounded-lg flex flex-col justify-between border border-[#ffb4ab]/40">
            <div>
              <span className="text-[10px] uppercase text-[#8c90a0] font-bold">Q3 2026 (Active)</span>
              <div className="text-lg font-semibold text-[#ffb4ab] mt-1 font-mono">+4.2 Δ</div>
            </div>
            <span className="text-[11px] text-[#ffb4ab] mt-1">Resurgence / Grid Expansion</span>
          </div>
        </div>

        {/* Explanatory Longitudinal Note */}
        <div className="p-3 bg-[#1c2026] rounded-lg flex items-start gap-3 border border-[#262a31]">
          <span className="material-symbols-outlined text-[20px] text-[#afc6ff] shrink-0 mt-0.5">insights</span>
          <div className="space-y-0.5 text-xs text-[#c2c6d6] leading-relaxed">
            <div className="font-semibold text-[#dfe2eb]">Supervisory Audit Notice: Post-Remediation Resurgence</div>
            <p>
              Prior verified remediation in Q1 2026 temporarily brought CSE-014 to <strong>-1.3 below cohort median</strong>. The subsequent Q3 2026 resurgence (+4.2 Δ) directly correlates with the integration of 14 new regional transmission substations that have yet to complete synchronized log forwarding.
            </p>
          </div>
        </div>
      </div>

      {/* STATUTORY REVIEW PROMPTS (HUMAN-IN-THE-LOOP ACTIONS) */}
      <footer className="bg-[#181c22] p-5 rounded-xl border border-[#262a31] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#dfe2eb]">Statutory Review Prompts</h2>
            <p className="text-xs text-[#c2c6d6]">Automated evidentiary prompts requiring supervisory assessment sign-off</p>
          </div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#262a31] text-[#8c90a0]">6 Direct Actions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Prompt 1 */}
          <div className="bg-[#1c2026] p-4 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#ffb4ab] font-semibold">SIGNAL-GAP-71</span>
                <span className="px-1.5 py-0.5 rounded bg-[#93000a]/30 text-[#ffb4ab] text-[10px] font-bold uppercase">Urgent</span>
              </div>
              <div className="text-sm font-semibold text-[#dfe2eb]">Execution Gap Resurgence</div>
              <p className="text-xs text-[#c2c6d6] mt-1 leading-snug">
                NorthGrid exhibits 7 execution gaps vs peer median of 2.8. Review sub-station telemetry drift before next cycle approval.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#262a31]">
              <Link to="/analytics/execution-gaps" className="text-[#afc6ff] hover:underline font-mono text-xs flex items-center justify-between">
                <span>Investigate in Execution Gaps</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Prompt 2 */}
          <div className="bg-[#1c2026] p-4 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#ffb693] font-semibold">READINESS-LAG-18</span>
                <span className="px-1.5 py-0.5 rounded bg-[#c55100]/30 text-[#ffb693] text-[10px] font-bold uppercase">Review</span>
              </div>
              <div className="text-sm font-semibold text-[#dfe2eb]">Readiness Divergence (-18 pp)</div>
              <p className="text-xs text-[#c2c6d6] mt-1 leading-snug">
                71% readiness lag is driven by unverified SIEM log hash chains. Evaluate air-gapped cryptographic validation queue.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#262a31]">
              <Link to="/analytics/evidence-quality" className="text-[#afc6ff] hover:underline font-mono text-xs flex items-center justify-between">
                <span>Open Evidence Quality</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Prompt 3 */}
          <div className="bg-[#1c2026] p-4 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#7bdb80] font-semibold">FINDING-FND-0142</span>
                <span className="px-1.5 py-0.5 rounded bg-[#007124]/30 text-[#7bdb80] text-[10px] font-bold uppercase">Statutory</span>
              </div>
              <div className="text-sm font-semibold text-[#dfe2eb]">Unmitigated Finding Variance</div>
              <p className="text-xs text-[#c2c6d6] mt-1 leading-snug">
                8 open findings compare against 3.4 peer median. 3 findings relate directly to high-voltage substation relay access controls.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#262a31]">
              <Link to="/findings/FND-0142" className="text-[#afc6ff] hover:underline font-mono text-xs flex items-center justify-between">
                <span>Open FND-0142 Dossier</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Prompt 4 */}
          <div className="bg-[#1c2026] p-4 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#afc6ff] font-semibold">SPACE-UNOBS-04</span>
                <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#dfe2eb] text-[10px] font-bold uppercase">Telemetry</span>
              </div>
              <div className="text-sm font-semibold text-[#dfe2eb]">OT Relay Negative Space</div>
              <p className="text-xs text-[#c2c6d6] mt-1 leading-snug">
                4 unobserved controls are concentrated in SCADA boundary isolations. Cohort median unobserved count is 1.6.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#262a31]">
              <Link to="/analytics/negative-space" className="text-[#afc6ff] hover:underline font-mono text-xs flex items-center justify-between">
                <span>Inspect Negative Space</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Prompt 5 */}
          <div className="bg-[#1c2026] p-4 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#8c90a0] font-semibold">REMED-TRACK-03</span>
                <span className="px-1.5 py-0.5 rounded bg-[#262a31] text-[#8c90a0] text-[10px] font-bold uppercase">Remediation</span>
              </div>
              <div className="text-sm font-semibold text-[#dfe2eb]">Overdue Corrective Actions</div>
              <p className="text-xs text-[#c2c6d6] mt-1 leading-snug">
                CSE-014 has 3 remediation packages active, compared to 1.4 cohort median. Confirm milestone completion dates.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#262a31]">
              <Link to="/remediation" className="text-[#afc6ff] hover:underline font-mono text-xs flex items-center justify-between">
                <span>Audit Remediation Queue</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Prompt 6 */}
          <div className="bg-[#1c2026] p-4 rounded-lg flex flex-col justify-between border border-[#262a31]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#ffb693] font-semibold">SCHEMA-CALIB</span>
                <span className="px-1.5 py-0.5 rounded bg-[#c55100]/30 text-[#ffb693] text-[10px] font-bold uppercase">Taxonomy</span>
              </div>
              <div className="text-sm font-semibold text-[#dfe2eb]">Inspect Control Drift</div>
              <p className="text-xs text-[#c2c6d6] mt-1 leading-snug">
                Confirm whether CSE-031's v3.1 schema causes undue skew in baseline gap medians prior to issuing formal directive.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#262a31]">
              <button
                onClick={() => setShowConfigDrawer(true)}
                className="text-[#afc6ff] hover:underline font-mono text-xs flex items-center justify-between w-full"
              >
                <span>Inspect Control Drift</span>
                <span className="material-symbols-outlined text-[16px]">tune</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* COLLAPSIBLE DRAWER 1: COHORT CONFIGURATION DRAWER */}
      {showConfigDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:w-[480px] bg-[#181c22] border-l border-[#262a31] h-full shadow-2xl flex flex-col">
            <div className="p-4 bg-[#1c2026] border-b border-[#262a31] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#afc6ff] text-[20px]">tune</span>
                <h3 className="text-base font-semibold text-[#dfe2eb]">Cohort Configuration</h3>
              </div>
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="text-[#8c90a0] hover:text-[#dfe2eb] p-1 rounded"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase text-[#8c90a0] font-bold block mb-1">Sector Baseline</label>
                <select className="w-full bg-[#1c2026] p-2.5 rounded text-[#dfe2eb] border border-[#262a31] outline-none">
                  <option>Energy / Critical Infrastructure (5 CSEs)</option>
                  <option>Banking & Financial Services (BFSI) (8 CSEs)</option>
                  <option>Telecommunications Backbone (4 CSEs)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-[#8c90a0] font-bold block mb-1">Assessment Window Period</label>
                <select className="w-full bg-[#1c2026] p-2.5 rounded text-[#dfe2eb] border border-[#262a31] outline-none">
                  <option>Q3 2026 (Active Supervisory Cycle)</option>
                  <option>Q2 2026 (Historical Post-Audit)</option>
                  <option>Q1 2026 (Baseline Audit)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-[#8c90a0] font-bold block mb-1">Active Cohort Entities</label>
                <div className="space-y-1.5 bg-[#1c2026] p-3 rounded border border-[#262a31]">
                  <label className="flex items-center gap-2 text-[#dfe2eb]">
                    <input checked disabled type="checkbox" className="rounded" />
                    <span>CSE-014 (NorthGrid Energy) — [Subject]</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#dfe2eb]">
                    <input defaultChecked type="checkbox" className="rounded" />
                    <span>CSE-021 (Southern Hydro Grid)</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#dfe2eb]">
                    <input defaultChecked type="checkbox" className="rounded" />
                    <span>CSE-027 (Eastern Power Distribution)</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#dfe2eb]">
                    <input defaultChecked type="checkbox" className="rounded" />
                    <span>CSE-031 (TransNational Transmission) [v3.1]</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#dfe2eb]">
                    <input defaultChecked type="checkbox" className="rounded" />
                    <span>CSE-044 (Western Thermal Energy)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-[#8c90a0] font-bold block mb-1">Statistical Metric Type</label>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <button className="py-2 px-3 rounded bg-[#1f6feb] text-white font-semibold">Median (Default)</button>
                  <button className="py-2 px-3 rounded bg-[#1c2026] text-[#c2c6d6] hover:bg-[#262a31] border border-[#262a31]">
                    Mean Average
                  </button>
                </div>
                <p className="text-[#8c90a0] mt-1 text-[11px]">
                  Statutory guidelines require Median calculation to minimize skew from small sample cohorts (N&lt;10).
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#1c2026] border-t border-[#262a31] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="px-4 py-2 rounded bg-[#262a31] text-[#c2c6d6] text-xs hover:bg-[#31353c]"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="px-4 py-2 rounded bg-[#1f6feb] text-white text-xs font-semibold hover:brightness-110"
              >
                Apply Recalibration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLLAPSIBLE DRAWER 2: SIDE-BY-SIDE CSE COMPARATOR DRAWER (CSE-014 vs CSE-021) */}
      {showComparatorDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:w-[580px] bg-[#181c22] border-l border-[#262a31] h-full shadow-2xl flex flex-col">
            <div className="p-4 bg-[#1c2026] border-b border-[#262a31] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb693] text-[20px]">compare_arrows</span>
                <div>
                  <h3 className="text-base font-semibold text-[#dfe2eb]">Side-by-Side Examiner Comparator</h3>
                  <span className="font-mono text-xs text-[#8c90a0]">CSE-014 (NorthGrid) vs CSE-021 (Southern Hydro)</span>
                </div>
              </div>
              <button
                onClick={() => setShowComparatorDrawer(false)}
                className="text-[#8c90a0] hover:text-[#dfe2eb] p-1 rounded"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#1c2026] rounded-lg border border-[#262a31]">
                <div>
                  <span className="text-[10px] uppercase text-[#afc6ff] font-bold">Entity 1 (Subject)</span>
                  <div className="text-sm font-bold text-[#dfe2eb]">CSE-014</div>
                  <span className="text-xs text-[#c2c6d6]">NorthGrid Energy</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#7bdb80] font-bold">Entity 2 (Peer Subject)</span>
                  <div className="text-sm font-bold text-[#dfe2eb]">CSE-021</div>
                  <span className="text-xs text-[#c2c6d6]">Southern Hydro Grid</span>
                </div>
              </div>

              {/* Comparative Data Rows */}
              <div className="space-y-2.5">
                <div className="p-3 bg-[#1c2026] rounded-lg border border-[#262a31]">
                  <div className="text-[10px] text-[#8c90a0] uppercase font-bold mb-1">NCIIPC Scope Version</div>
                  <div className="grid grid-cols-2 font-mono text-xs">
                    <span className="text-[#dfe2eb]">NCIIPC-CSF v3.2 (25 Controls)</span>
                    <span className="text-[#dfe2eb]">NCIIPC-CSF v3.2 (24 Controls)</span>
                  </div>
                </div>

                <div className="p-3 bg-[#1c2026] rounded-lg border border-[#262a31]">
                  <div className="text-[10px] text-[#8c90a0] uppercase font-bold mb-1">Execution Gaps</div>
                  <div className="grid grid-cols-2 text-base font-bold font-mono">
                    <span className="text-[#ffb4ab]">7 gaps</span>
                    <span className="text-[#7bdb80]">2 gaps</span>
                  </div>
                  <div className="mt-1 text-[11px] text-[#8c90a0]">Differential: +5 gaps in CSE-014 (Substation OT Scope)</div>
                </div>

                <div className="p-3 bg-[#1c2026] rounded-lg border border-[#262a31]">
                  <div className="text-[10px] text-[#8c90a0] uppercase font-bold mb-1">Evidence Readiness Rate</div>
                  <div className="grid grid-cols-2 text-base font-bold font-mono">
                    <span className="text-[#ffb693]">71%</span>
                    <span className="text-[#7bdb80]">94%</span>
                  </div>
                  <div className="mt-1 text-[11px] text-[#8c90a0]">CSE-021 maintains real-time air-gapped cryptographic hashing</div>
                </div>

                <div className="p-3 bg-[#1c2026] rounded-lg border border-[#262a31]">
                  <div className="text-[10px] text-[#8c90a0] uppercase font-bold mb-1">Negative Space Controls</div>
                  <div className="grid grid-cols-2 font-mono text-xs font-semibold">
                    <span className="text-[#ffb693]">4 controls</span>
                    <span className="text-[#7bdb80]">1 control</span>
                  </div>
                </div>

                <div className="p-3 bg-[#1c2026] rounded-lg border border-[#262a31]">
                  <div className="text-[10px] text-[#8c90a0] uppercase font-bold mb-1">Open Remediation Items</div>
                  <div className="grid grid-cols-2 font-mono text-xs font-semibold">
                    <span className="text-[#dfe2eb]">3 Active</span>
                    <span className="text-[#dfe2eb]">1 Active</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#1c2026] rounded text-[#c2c6d6] text-xs leading-relaxed border border-[#262a31]">
                <strong className="text-[#dfe2eb]">Dual Audit Summary:</strong> Both entities share identical Siemens OT switchgear architecture. CSE-021 demonstrates successful multi-site ingestion while CSE-014 has delayed agent deployment across 14 substations.
              </div>
            </div>

            <div className="p-4 bg-[#1c2026] border-t border-[#262a31] flex items-center justify-between">
              <span className="font-mono text-xs text-[#8c90a0]">COMP-ID: EN-014-021</span>
              <button
                onClick={() => setShowComparatorDrawer(false)}
                className="px-4 py-2 rounded bg-[#262a31] text-[#dfe2eb] text-xs hover:bg-[#31353c]"
              >
                Close Comparator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
