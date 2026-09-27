import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ShieldAlert, 
  GitFork, 
  FileCheck2, 
  ArrowRight,
  ExternalLink,
  Info,
  Layers,
  AlertTriangle,
  ZapOff,
  Contrast,
  Filter,
  CheckCircle2,
  TrendingUp,
  Activity,
  Calendar,
  FileSearch,
  ChevronRight
} from 'lucide-react';
import { 
  PageContainer, 
  PageHeader, 
  SectionHeader, 
  Card, 
  KpiCard, 
  StatusBadge, 
  ChartContainer,
  Button 
} from '@/components/common';
import { useSupervisory } from '@/context/SupervisoryContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const DashboardOverviewPage: React.FC = () => {
  const { cses, findings, remediations, samples, metrics, setActiveFindingId } = useSupervisory();
  const navigate = useNavigate();

  // Filter high-value attention items (Priority CRITICAL or HIGH that are not REJECTED)
  const priorityAttentionItems = findings.filter(
    f => (f.priority === 'CRITICAL' || f.priority === 'HIGH') && f.status !== 'REJECTED'
  ).slice(0, 3);

  // Execution Gap Trend data (Section 5 bottom panel 1)
  const executionGapTrend = [
    { period: 'Q4 2025', gaps: 8, escalationMissing: 5, processAbort: 3 },
    { period: 'Q1 2026', gaps: 11, escalationMissing: 7, processAbort: 4 },
    { period: 'Q2 2026', gaps: 15, escalationMissing: 9, processAbort: 6 },
    { period: 'Q3 2026', gaps: 14, escalationMissing: 8, processAbort: 6 },
  ];

  // Negative Space Distribution data (Section 5 bottom panel 2)
  const negativeSpaceDistribution = [
    { state: 'PRESENT', count: 184, percentage: 74, fill: '#10b981' },
    { state: 'ABSENT_CONFIRMED', count: 22, percentage: 9, fill: '#3b82f6' },
    { state: 'NOT_SUBMITTED', count: 30, percentage: 12, fill: '#f59e0b' },
    { state: 'NOT_APPLICABLE', count: 12, percentage: 5, fill: '#64748b' },
  ];

  // Assessment Coverage by Critical Asset (Section 5 bottom panel 3)
  const coverageData = [
    { asset: 'SOC Telemetry Ingestion', coverage: 94, benchmark: 90 },
    { asset: 'Incident Escalation Records', coverage: 78, benchmark: 85 },
    { asset: 'Forensic Hash Provenance', coverage: 91, benchmark: 90 },
    { asset: 'Threat Intel Ingestion', coverage: 82, benchmark: 80 },
    { asset: 'Audit Log Integrity', coverage: 88, benchmark: 85 },
  ];

  // Finding Recurrence across cycles (Section 5 bottom panel 4)
  const recurrenceData = [
    { period: 'Q4 2025', newFindings: 18, recurringGaps: 6 },
    { period: 'Q1 2026', newFindings: 21, recurringGaps: 9 },
    { period: 'Q2 2026', newFindings: 19, recurringGaps: 14 },
    { period: 'Q3 2026', newFindings: 22, recurringGaps: 16 },
  ];

  return (
    <PageContainer>
      {/* 1. TOP BAR / PAGE HEADER */}
      <PageHeader
        title="Supervisory Operations Overview"
        description="Continuous supervisory assurance posture, active CSE assessments, execution gap detections, and forensic audit signals."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#94a3b8] bg-[#111622] px-3 py-1.5 rounded border border-[#212c3d]">
              Assessment Period: <strong className="text-[#f1f5f9]">Q3 2026 Active Cycle</strong>
            </span>
            <Button
              variant="primary"
              size="md"
              iconRight={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/review')}
            >
              Review Queue ({findings.length})
            </Button>
          </div>
        }
      />

      {/* 2. TOP KPI ROW (Strictly Section 5: 6 specific cards with subtle differentiation) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 min-w-0">
        <KpiCard
          title="CSEs Assessed"
          value={metrics.csesAssessed}
          subtitle="4 Critical Sectors"
          trend="+3 on-cycle"
          trendPositive={true}
          semantic="blue"
          icon={Building2}
          onClick={() => navigate('/assessments')}
        />
        <KpiCard
          title="Findings"
          value={findings.length}
          subtitle={`${metrics.highPrioritySignals} Critical / High`}
          trend="+6 this cycle"
          trendPositive={false}
          semantic="amber"
          icon={AlertTriangle}
          onClick={() => navigate('/review')}
        />
        <KpiCard
          title="Execution Gaps"
          value={14}
          subtitle="Process & Escalation Failures"
          trend="4 Critical"
          trendPositive={false}
          semantic="red"
          icon={ZapOff}
          onClick={() => navigate('/analysis/execution-gap')}
        />
        <KpiCard
          title="Negative Space"
          value="28 Gaps"
          subtitle="19% Missing / Unsubmitted"
          trend="Review Req."
          trendPositive={false}
          semantic="purple"
          icon={Contrast}
          onClick={() => navigate('/analysis/negative-space')}
        />
        <KpiCard
          title="Evidence Readiness"
          value={`${metrics.evidenceReadiness}%`}
          subtitle="FIPS Schema & Hash Verified"
          trend="+4.2%"
          trendPositive={true}
          semantic="green"
          icon={FileCheck2}
          onClick={() => navigate('/evidence')}
        />
        <KpiCard
          title="Recommended Samples"
          value={samples.length}
          subtitle="Risk-Allocated Bandwidth"
          trend="100% Queued"
          trendPositive={true}
          semantic="cyan"
          icon={Filter}
          onClick={() => navigate('/sampling')}
        />
      </div>

      {/* 3. MIDDLE SECTION (Section 5: Left = Supervisory Risk / Priority Overview, Right = Evidence Readiness / Assessment Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-w-0">
        {/* Left: Supervisory Risk / Priority Overview (7 Cols) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#212c3d]">
              <SectionHeader
                title="Supervisory Risk / Priority Overview"
                subtitle="High-priority detections requiring immediate examiner adjudication"
                badge={
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-1" />
                }
                className="mb-0"
              />
              <Link
                to="/review"
                className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Full Queue ({findings.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* High-Priority Finding Drilldown Cards */}
            <div className="space-y-2 mb-3">
              {priorityAttentionItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded bg-[#0d121a] border border-[#212c3d] hover:border-[#3b82f6]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2.5 min-w-0"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[10px] font-semibold text-[#60a5fa] px-1.5 py-0.5 rounded bg-[#111622] border border-[#212c3d]">
                        {item.cseId}
                      </span>
                      <span className="text-[11px] text-[#cbd5e1] font-medium truncate max-w-[180px]">
                        {item.cseName}
                      </span>
                      <span className="text-[#64748b]">•</span>
                      <span className="font-mono text-[10px] text-[#f59e0b] font-medium">
                        {item.signalType.replace(/_/g, ' ')}
                      </span>
                      <StatusBadge status={item.priority} />
                      <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.2 rounded border border-[#10b981]/20">
                        Evidence: {item.evidenceStrength}
                      </span>
                    </div>
                    <div className="text-[12px] font-medium text-[#f1f5f9] truncate">
                      {item.title}
                    </div>
                    <p className="text-[11px] text-[#94a3b8] leading-tight line-clamp-1">
                      <strong className="text-[#cbd5e1]">Expected: </strong>{item.expectedState} → <strong className="text-[#f87171]">Gap: </strong>{item.gapSummary || item.whyFlagged}
                    </p>
                  </div>

                  <div className="shrink-0 self-start md:self-center">
                    <Button
                      size="sm"
                      variant="primary"
                      iconRight={<ArrowRight className="w-3 h-3" />}
                      onClick={() => {
                        setActiveFindingId(item.id);
                        navigate(`/review/${item.id}`);
                      }}
                    >
                      Examine
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Signal Distribution Bar Chart */}
            <div className="pt-2 border-t border-[#212c3d]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider font-mono">
                  Detection Signal Breakdown
                </span>
                <span className="text-[10px] text-[#64748b] font-mono">
                  Click bar to filter queue
                </span>
              </div>
              <ChartContainer height={140} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={metrics.signalDistribution} 
                    layout="vertical" 
                    margin={{ top: 0, right: 15, left: 30, bottom: 0 }}
                    onClick={(state: any) => {
                      if (state?.activePayload?.[0]?.payload) {
                        const payload = state.activePayload[0].payload;
                        navigate(`/review?signal=${payload.type}`);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <XAxis type="number" stroke="#475569" fontSize={10} hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      width={85} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111622', borderColor: '#212c3d', borderRadius: 4, fontSize: 11 }}
                      itemStyle={{ color: '#f1f5f9' }}
                      formatter={(val) => [`${val} Signals`, 'Volume']}
                    />
                    <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                      {metrics.signalDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-[#212c3d] flex items-center justify-between text-[11px] text-[#64748b]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#60a5fa]" />
              <span>Multi-signal fusion engine (deterministic, non-black-box)</span>
            </span>
            <Link to="/analysis" className="text-[#60a5fa] hover:underline font-mono text-[10px]">
              Explore Engines →
            </Link>
          </div>
        </Card>

        {/* Right: Evidence Readiness / Assessment Status (5 Cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#212c3d]">
              <SectionHeader
                title="Evidence Readiness & Assessment Status"
                subtitle="Verification gates, telemetry integrity, and negative space"
                className="mb-0"
              />
              <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/30">
                ACTIVE ENCLAVE
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Expected vs Observed Assurance Progress Bar */}
              <div className="p-3 rounded bg-[#0d121a] border border-[#212c3d]">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#cbd5e1] font-medium font-sans">Assurance Gap (Expected vs Observed)</span>
                  <span className="text-[#f87171] font-mono font-bold">-15% Gap</span>
                </div>
                <div className="w-full bg-[#111622] h-2 rounded overflow-hidden flex border border-[#212c3d]">
                  <div className="bg-[#10b981] h-full" style={{ width: '81%' }} title="Observed Assurance: 81%"></div>
                  <div className="bg-[#ef4444] h-full" style={{ width: '19%' }} title="Execution Gap: 19%"></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#64748b] mt-1 font-mono">
                  <span>Observed Telemetry: 81%</span>
                  <span>Mandated Threshold: 96%</span>
                </div>
              </div>

              {/* Capability Discrepancy Indicator */}
              <div className="p-3 rounded bg-[#0d121a] border border-[#212c3d]">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#cbd5e1] font-medium font-sans">Capability Discrepancy Index</span>
                  <span className="text-[#f59e0b] font-mono font-bold">5 Controls Flagged</span>
                </div>
                <p className="text-[11px] text-[#94a3b8] leading-tight font-sans">
                  Claimed 24/7 autonomous escalation capability does not match observed evidence records across 2 entities.
                </p>
              </div>

              {/* Telemetry Integrity Status Grid */}
              <div className="p-3 rounded bg-[#0d121a] border border-[#212c3d]">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-[#cbd5e1] font-medium font-sans">Cryptographic &amp; Schema Integrity</span>
                  <span className="text-[#10b981] font-mono font-bold">{metrics.evidenceReadiness}% Overall</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                  <div className="p-1.5 rounded bg-[#111622] border border-[#212c3d]">
                    <div className="text-[#64748b]">FIPS Schema</div>
                    <div className="text-[#10b981] font-bold">100%</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#111622] border border-[#212c3d]">
                    <div className="text-[#64748b]">Completeness</div>
                    <div className="text-[#10b981] font-bold">88%</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#111622] border border-[#212c3d]">
                    <div className="text-[#64748b]">SHA-256 Valid</div>
                    <div className="text-[#10b981] font-bold">100%</div>
                  </div>
                </div>
              </div>

              {/* Evidence State Chips Legend */}
              <div className="p-2.5 rounded bg-[#0d121a] border border-[#212c3d] text-[10px] font-mono">
                <div className="text-[#64748b] mb-1.5 uppercase font-semibold">Evidence State Taxonomy</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">PRESENT</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#3b82f6]/15 text-[#60a5fa] border border-[#3b82f6]/30">ABSENT_CONFIRMED</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30">NOT_SUBMITTED</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#64748b]/15 text-[#94a3b8] border border-[#64748b]/30">NOT_APPLICABLE</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#475569]/15 text-[#cbd5e1] border border-[#475569]/30">UNKNOWN</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-[#212c3d] text-[10px] text-[#94a3b8] flex items-center justify-between font-mono">
            <span>Mandatory Rule: Missing Evidence ≠ Non-compliance</span>
            <Link to="/evidence" className="text-[#60a5fa] hover:underline">
              Inspect Vault →
            </Link>
          </div>
        </Card>
      </div>

      {/* 4. BOTTOM ANALYTICAL PANELS (Strictly Section 5: 5 Large Analytical Panels) */}
      <div className="space-y-4">
        {/* Row 1: Analytical Charts (Panels 1, 2, 3, 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 min-w-0">
          {/* Panel 1: Execution Gap Trend */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#212c3d]">
                <div className="text-[12px] font-semibold text-[#f1f5f9] font-sans">
                  1. Execution Gap Trend
                </div>
                <span className="text-[10px] font-mono text-[#f87171] bg-[#ef4444]/10 px-1.5 py-0.2 rounded border border-[#ef4444]/20">
                  +14 Active
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] mb-2 leading-tight">
                Process abortions vs missing escalation records across cycles:
              </p>
              <ChartContainer height={140} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={executionGapTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111622', borderColor: '#212c3d', borderRadius: 4, fontSize: 10 }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Bar dataKey="escalationMissing" name="Escalation Missing" fill="#ef4444" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="processAbort" name="Process Abort" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="pt-2 mt-1 border-t border-[#212c3d] flex items-center justify-between text-[10px] text-[#64748b]">
              <span>Cycle Q3 2026</span>
              <Link to="/analysis/execution-gap" className="text-[#60a5fa] hover:underline font-mono">
                Drill-down →
              </Link>
            </div>
          </Card>

          {/* Panel 2: Negative Space Trend */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#212c3d]">
                <div className="text-[12px] font-semibold text-[#f1f5f9] font-sans">
                  2. Negative Space Trend
                </div>
                <span className="text-[10px] font-mono text-[#fbbf24] bg-[#f59e0b]/10 px-1.5 py-0.2 rounded border border-[#f59e0b]/20">
                  28 Unsubmitted
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] mb-2 leading-tight">
                Distribution of expected vs submitted operational evidence:
              </p>
              <ChartContainer height={140} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={negativeSpaceDistribution} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="state" stroke="#64748b" fontSize={8} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111622', borderColor: '#212c3d', borderRadius: 4, fontSize: 10 }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Bar dataKey="percentage" name="Percentage (%)" radius={[2, 2, 0, 0]}>
                      {negativeSpaceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="pt-2 mt-1 border-t border-[#212c3d] flex items-center justify-between text-[10px] text-[#64748b]">
              <span>74% Present Verified</span>
              <Link to="/analysis/negative-space" className="text-[#60a5fa] hover:underline font-mono">
                Inspect Gaps →
              </Link>
            </div>
          </Card>

          {/* Panel 3: Assessment Coverage */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#212c3d]">
                <div className="text-[12px] font-semibold text-[#f1f5f9] font-sans">
                  3. Assessment Coverage
                </div>
                <span className="text-[10px] font-mono text-[#34d399] bg-[#10b981]/10 px-1.5 py-0.2 rounded border border-[#10b981]/20">
                  88% Avg
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] mb-2 leading-tight">
                Coverage across mandated critical asset control domains:
              </p>
              <div className="space-y-1.5 pt-1">
                {coverageData.slice(0, 4).map((c, i) => (
                  <div key={i} className="text-[10px]">
                    <div className="flex justify-between text-[#cbd5e1] mb-0.5">
                      <span className="truncate max-w-[150px]">{c.asset}</span>
                      <span className="font-mono">{c.coverage}%</span>
                    </div>
                    <div className="w-full bg-[#0d121a] h-1.5 rounded overflow-hidden flex border border-[#212c3d]">
                      <div 
                        className={`h-full ${c.coverage >= c.benchmark ? 'bg-[#10b981]' : 'bg-[#f59e0b]'}`} 
                        style={{ width: `${c.coverage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 mt-1 border-t border-[#212c3d] flex items-center justify-between text-[10px] text-[#64748b]">
              <span>Sector Benchmark: 85%</span>
              <Link to="/analysis/coverage" className="text-[#60a5fa] hover:underline font-mono">
                Coverage Matrix →
              </Link>
            </div>
          </Card>

          {/* Panel 4: Finding Recurrence */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#212c3d]">
                <div className="text-[12px] font-semibold text-[#f1f5f9] font-sans">
                  4. Finding Recurrence
                </div>
                <span className="text-[10px] font-mono text-[#c084fc] bg-[#a855f7]/10 px-1.5 py-0.2 rounded border border-[#a855f7]/20">
                  16 Recurring
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] mb-2 leading-tight">
                New supervisory findings vs recurring systemic gaps:
              </p>
              <ChartContainer height={140} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recurrenceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111622', borderColor: '#212c3d', borderRadius: 4, fontSize: 10 }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Bar dataKey="newFindings" name="New Findings" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="recurringGaps" name="Recurring Gaps" fill="#a855f7" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="pt-2 mt-1 border-t border-[#212c3d] flex items-center justify-between text-[10px] text-[#64748b]">
              <span>Control Drift Analysis</span>
              <Link to="/analysis/historical" className="text-[#60a5fa] hover:underline font-mono">
                Historical Drift →
              </Link>
            </div>
          </Card>
        </div>

        {/* Panel 5: Recommended Samples Table (Section 5 bottom panel 5 & Section 8) */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#212c3d]">
            <div>
              <div className="text-[14px] font-semibold text-[#f1f5f9] font-sans flex items-center gap-2">
                <span>5. Recommended Supervisory Samples</span>
                <span className="text-[10px] font-mono text-[#60a5fa] px-1.5 py-0.2 rounded bg-[#111622] border border-[#212c3d]">
                  Statutory Sampling Queue
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] font-sans">
                Evidence-driven and risk-weighted allocation of examiner manual investigation bandwidth.
              </p>
            </div>
            <Link
              to="/sampling"
              className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Dedicated Sampling Workspace ({samples.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Structured Sample Table (Section 8 Columns) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-[#212c3d] bg-[#0d121a] text-[#94a3b8] font-mono text-[10px] uppercase">
                  <th className="py-2 px-3 font-semibold">Case / Alert ID</th>
                  <th className="py-2 px-3 font-semibold">CSE Entity</th>
                  <th className="py-2 px-3 font-semibold">Priority</th>
                  <th className="py-2 px-3 font-semibold">Sampling Reason</th>
                  <th className="py-2 px-3 font-semibold">Supporting Signals</th>
                  <th className="py-2 px-3 font-semibold">Evidence Strength</th>
                  <th className="py-2 px-3 font-semibold">Review Status</th>
                  <th className="py-2 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212c3d]/60 font-sans">
                {samples.map((sample) => (
                  <tr 
                    key={sample.id} 
                    className="hover:bg-[#161e2b] transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[#60a5fa]">
                      {sample.caseId}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#f1f5f9]">{sample.cseName}</div>
                      <div className="text-[10px] text-[#64748b] font-mono">{sample.cseId} • {sample.controlId}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={sample.priority} />
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#111622] text-[#fbbf24] border border-[#212c3d]">
                        {sample.methodology.replace(/_/g, ' ')}
                      </span>
                      <p className="text-[10px] text-[#94a3b8] mt-0.5 line-clamp-1 max-w-xs">
                        {sample.samplingReason}
                      </p>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-[#cbd5e1]">
                      {sample.signals ? sample.signals.join(', ') : 'Execution Gap, Escalation Failure'}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded border border-[#10b981]/20">
                        {sample.evidenceStrength}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px]">
                      <span className="text-[#94a3b8] bg-[#111622] px-1.5 py-0.5 rounded border border-[#212c3d]">
                        QUEUED_FOR_EXAMINATION
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate('/sampling')}
                      >
                        Examine Case
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
