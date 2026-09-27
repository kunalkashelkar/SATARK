import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  GitFork, 
  FileCheck2, 
  ArrowRight,
  Info,
  Layers,
  AlertTriangle,
  Filter,
  CheckCircle2,
  ExternalLink
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
  Cell 
} from 'recharts';

export const DashboardOverviewPage: React.FC = () => {
  const { cses, findings, remediations, samples, metrics, setActiveFindingId } = useSupervisory();
  const navigate = useNavigate();

  // Filter high-value attention items (Priority CRITICAL or HIGH that are not REJECTED)
  const priorityAttentionItems = findings.filter(
    f => (f.priority === 'CRITICAL' || f.priority === 'HIGH') && f.status !== 'REJECTED'
  ).slice(0, 3);

  // Top recommended samples preview (Section 8)
  const topSamples = samples.slice(0, 3);

  return (
    <PageContainer>
      {/* 1. STANDARD PAGE HEADER (Section 8) */}
      <PageHeader
        title="Supervisory Overview"
        description="Current assessment posture and items requiring supervisory attention."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#94a3b8] bg-[#111622] px-3 py-1.5 rounded border border-[#212c3d]">
              Cycle: <strong className="text-[#f1f5f9]">Q3 2026 Active Assessment</strong>
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

      {/* 2. FOCUSED KPI ROW (Strictly Section 8: Limited 5 Essential KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 min-w-0">
        <KpiCard
          title="CSEs Assessed"
          value={metrics.csesAssessed}
          subtitle={`${new Set(cses.map(c => c.sector)).size} Critical Sectors`}
          trend="+3 on-cycle"
          trendPositive={true}
          semantic="blue"
          icon={Building2}
          onClick={() => navigate('/supervision/cses')}
        />
        <KpiCard
          title="High-Priority Signals"
          value={metrics.highPrioritySignals}
          subtitle="Requires Examiner Review"
          trend="Immediate"
          trendPositive={false}
          semantic="red"
          alert={true}
          icon={AlertTriangle}
          onClick={() => navigate('/review?priority=HIGH')}
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
          title="Open Findings"
          value={metrics.openFindings}
          subtitle="Active Supervisory Inquiries"
          semantic="amber"
          icon={GitFork}
          onClick={() => navigate('/review')}
        />
        <KpiCard
          title="Open Remediation"
          value={metrics.openRemediation}
          subtitle="Under Verification Gate"
          semantic="cyan"
          icon={Layers}
          className="col-span-2 sm:col-span-1"
          onClick={() => navigate('/remediation')}
        />
      </div>

      {/* 3. MIDDLE SECTION (Section 8: Priority Attention + Signal Summary on Left, Assessment Posture on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-w-0">
        {/* Left: Priority Attention & Signal Summary (7 Cols) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#212c3d]">
              <SectionHeader
                title="Priority Attention"
                subtitle="Immediate human examiner review required"
                badge={
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-1" />
                }
                className="mb-0"
              />
              <Link
                to="/review"
                className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Complete Queue ({findings.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* High-Priority Attention Items (Clickable to Finding / Examiner Workspace) */}
            <div className="space-y-2 mb-3">
              {priorityAttentionItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded bg-[#0d121a] border border-[#212c3d] hover:border-[#3b82f6]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2.5 min-w-0"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link 
                        to={`/assessments/${item.cseId}`}
                        className="font-mono text-[10px] font-semibold text-[#60a5fa] hover:underline px-1.5 py-0.5 rounded bg-[#111622] border border-[#212c3d]"
                        title="Open CSE Dossier"
                      >
                        {item.cseId}
                      </Link>
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
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Signal Summary (Compact visualization as per Section 8) */}
            <div className="pt-2 border-t border-[#212c3d]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider font-mono">
                  Supervisory Signal Summary
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
              Explore Contextual Engines →
            </Link>
          </div>
        </Card>

        {/* Right: Assessment Posture (5 Cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#212c3d]">
              <SectionHeader
                title="Assessment Posture"
                subtitle="Core supervisory indicators & telemetry integrity"
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
                  <span className="text-[#cbd5e1] font-medium font-sans">Expected vs Observed Assurance</span>
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
                  <span className="text-[#cbd5e1] font-medium font-sans">Capability Discrepancy</span>
                  <span className="text-[#f59e0b] font-mono font-bold">5 Controls Flagged</span>
                </div>
                <p className="text-[11px] text-[#94a3b8] leading-tight font-sans">
                  Claimed 24/7 autonomous escalation capability exceeds observed evidence records across 2 entities.
                </p>
                <div className="mt-1.5 text-right">
                  <Link to="/analysis/capability" className="text-[10px] font-mono text-[#60a5fa] hover:underline">
                    View Discrepancy Breakdown →
                  </Link>
                </div>
              </div>

              {/* Telemetry Integrity Status Grid */}
              <div className="p-3 rounded bg-[#0d121a] border border-[#212c3d]">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-[#cbd5e1] font-medium font-sans">Evidence Readiness &amp; Integrity</span>
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

      {/* 4. RECOMMENDED SAMPLING PREVIEW (Section 8: Compact preview only, no huge wall of analytics) */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#212c3d]">
          <SectionHeader
            title="Recommended Sampling Preview"
            subtitle="Risk-weighted allocation of examiner manual investigation bandwidth"
            className="mb-0"
          />
          <Link
            to="/sampling"
            className="text-[11px] font-mono text-[#60a5fa] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View Sampling ({samples.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-w-0">
          {topSamples.map((sample) => (
            <div 
              key={sample.id} 
              className="p-3 rounded bg-[#0d121a] border border-[#212c3d] hover:border-[#3b82f6]/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-[11px] text-[#60a5fa]">{sample.caseId}</span>
                  <StatusBadge status={sample.priority} />
                </div>
                <div className="text-[12px] font-semibold text-[#f1f5f9] truncate">{sample.cseName}</div>
                <div className="text-[10px] text-[#64748b] font-mono mt-0.5">{sample.cseId} • {sample.controlId}</div>
                <p className="text-[11px] text-[#cbd5e1] mt-1.5 line-clamp-2 leading-tight">
                  <strong className="text-[#64748b]">Reason: </strong>{sample.samplingReason}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#212c3d] flex items-center justify-between text-[10px]">
                <span className="font-mono text-[#94a3b8] uppercase">{sample.methodology.replace(/_/g, ' ')}</span>
                <span className="text-[#10b981] font-mono">Evidence: {sample.evidenceStrength}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
};
