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
  Layers
} from 'lucide-react';
import { 
  PageContainer, 
  PageHeader, 
  SectionHeader, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  KpiCard, 
  StatusBadge, 
  ChartContainer,
  Button 
} from '@/components/common';
import { useSupervisory } from '@/context/SupervisoryContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const DashboardOverviewPage: React.FC = () => {
  const { cses, findings, remediations, samples, metrics, setActiveFindingId } = useSupervisory();
  const navigate = useNavigate();

  // Filter high-value attention items (Priority CRITICAL or HIGH that are not REJECTED)
  const priorityAttentionItems = findings.filter(
    f => (f.priority === 'CRITICAL' || f.priority === 'HIGH') && f.status !== 'REJECTED'
  ).slice(0, 3);

  // Top recommended samples
  const topSamples = samples.slice(0, 3);

  return (
    <PageContainer>
      {/* 1. STANDARD PAGE HEADER */}
      <PageHeader
        title="Supervisory Overview"
        description="Current supervisory posture, high-priority detection signals, and items requiring examiner adjudication."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#c2c6d6] bg-[#181c22] px-3 py-1.5 rounded-md border border-[#262a31]">
              Cycle: Q3 2026 Active Assessment
            </span>
            <Button
              variant="primary"
              size="md"
              iconRight={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/review')}
            >
              Review Queue
            </Button>
          </div>
        }
      />

      {/* 2. STANDARDIZED KPI ROW (5 Equal Dimensions) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 min-w-0">
        <KpiCard
          title="CSEs Assessed"
          value={metrics.csesAssessed}
          subtitle="4 Critical Sectors"
          icon={Building2}
          onClick={() => navigate('/assessments')}
        />
        <KpiCard
          title="High-Priority Signals"
          value={metrics.highPrioritySignals}
          subtitle="Requires Examiner Review"
          icon={ShieldAlert}
          alert
          onClick={() => navigate('/review?signal=EXECUTION_GAP')}
        />
        <KpiCard
          title="Evidence Readiness"
          value={`${metrics.evidenceReadiness}%`}
          subtitle="FIPS Schema & Hash Verified"
          icon={FileCheck2}
          onClick={() => navigate('/evidence')}
        />
        <KpiCard
          title="Open Findings"
          value={metrics.openFindings}
          subtitle="Active Supervisory Inquiries"
          icon={GitFork}
          onClick={() => navigate('/review')}
        />
        <KpiCard
          title="Open Remediation"
          value={metrics.openRemediation}
          subtitle="Under Verification Cycle"
          icon={Layers}
          highlight
          className="col-span-2 sm:col-span-1"
          onClick={() => navigate('/remediation')}
        />
      </div>

      {/* 3. PRIORITY ATTENTION SECTION */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#262a31]">
          <SectionHeader
            title="Priority Attention"
            subtitle="Immediate human examiner review required"
            badge={
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse ml-1" />
            }
            className="mb-0"
          />
          <Link
            to="/review"
            className="text-[12px] font-mono text-[#afc6ff] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Complete Queue ({findings.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {priorityAttentionItems.map((item) => (
            <div 
              key={item.id}
              className="p-3.5 rounded-lg bg-[#14181f] border border-[#262a31] hover:border-[#3b414d] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-[#afc6ff] px-2 py-0.5 rounded bg-[#1c2026] border border-[#262a31]">
                    {item.cseId}
                  </span>
                  <span className="text-[12px] text-[#c2c6d6] font-medium truncate max-w-[200px]">
                    {item.cseName}
                  </span>
                  <span className="text-[#8c90a0]">•</span>
                  <span className="font-mono text-[11px] text-[#ffb693] font-medium">
                    {item.signalType.replace(/_/g, ' ')}
                  </span>
                  <StatusBadge status={item.priority} />
                  <span className="text-[11px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2 py-0.5 rounded border border-[#7bdb80]/20">
                    Strength: {item.evidenceStrength}
                  </span>
                </div>
                <div className="text-[13px] md:text-[14px] font-semibold text-[#dfe2eb] truncate">
                  {item.title}
                </div>
                <p className="text-[12px] text-[#8c90a0] leading-snug line-clamp-2 max-w-4xl">
                  <strong className="text-[#c2c6d6]">Why Flagged: </strong>
                  {item.whyFlagged}
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
                  Review Finding
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. SIGNAL SUMMARY & ASSESSMENT POSTURE (Viewport balanced 7/5 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        {/* Signal Summary Chart (7 Cols) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#262a31]/60">
              <SectionHeader
                title="Supervisory Signal Summary"
                subtitle="Distribution across monitored telemetry"
                className="mb-0"
              />
              <span className="text-[10px] font-mono text-[#8c90a0] bg-[#1c2026] px-2 py-0.5 rounded border border-[#262a31]">
                Interactive Filter
              </span>
            </div>
            <p className="text-[12px] text-[#8c90a0] mb-2 leading-tight">
              Click any signal bar to filter the Review Queue directly by that detection type:
            </p>

            <ChartContainer height={220} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={metrics.signalDistribution} 
                  layout="vertical" 
                  margin={{ top: 0, right: 20, left: 35, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state?.activePayload?.[0]?.payload) {
                      const payload = state.activePayload[0].payload;
                      navigate(`/review?signal=${payload.type}`);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <XAxis type="number" stroke="#64748b" fontSize={10} hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    width={90} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c2026', borderColor: '#262a31', borderRadius: 6, fontSize: 11 }}
                    itemStyle={{ color: '#dfe2eb' }}
                    formatter={(val) => [`${val} Detected Signals`, 'Volume']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {metrics.signalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="pt-2.5 mt-2 border-t border-[#262a31] flex items-center justify-between text-[12px] text-[#8c90a0]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#afc6ff]" />
              <span>Multi-signal fusion engine (non-black-box)</span>
            </span>
            <Link to="/analysis" className="text-[#afc6ff] hover:underline font-mono text-[11px]">
              Explore Engines →
            </Link>
          </div>
        </Card>

        {/* Assessment Posture Strip (5 Cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#262a31]/60">
              <SectionHeader
                title="Assessment Posture"
                subtitle="Core supervisory indicators"
                className="mb-0"
              />
              <span className="text-[10px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2 py-0.5 rounded border border-[#7bdb80]/20">
                Active Enclave
              </span>
            </div>

            <div className="space-y-2.5 mt-2">
              {/* Expected vs Observed */}
              <div className="p-2.5 rounded-lg bg-[#14181f] border border-[#262a31]">
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-[#c2c6d6] font-medium">Expected vs Observed Assurance</span>
                  <span className="text-[#ffb4ab] font-mono font-bold">-15% Gap</span>
                </div>
                <div className="w-full bg-[#10141a] h-2 rounded-full overflow-hidden flex">
                  <div className="bg-[#7bdb80] h-full" style={{ width: '81%' }} title="Observed Assurance: 81%"></div>
                  <div className="bg-[#ef4444] h-full" style={{ width: '19%' }} title="Execution Gap: 19%"></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#8c90a0] mt-1 font-mono">
                  <span>Observed: 81%</span>
                  <span>Expected: 96%</span>
                </div>
              </div>

              {/* Capability Discrepancy */}
              <div className="p-2.5 rounded-lg bg-[#14181f] border border-[#262a31]">
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-[#c2c6d6] font-medium">Capability Discrepancy</span>
                  <span className="text-[#eab308] font-mono font-bold">5 Controls Flagged</span>
                </div>
                <p className="text-[11px] text-[#8c90a0] leading-tight">
                  Claimed capability exceeds observed evidence across 2 critical entities.
                </p>
              </div>

              {/* Evidence Integrity */}
              <div className="p-2.5 rounded-lg bg-[#14181f] border border-[#262a31]">
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-[#c2c6d6] font-medium">Evidence Readiness &amp; Integrity</span>
                  <span className="text-[#7bdb80] font-mono font-bold">{metrics.evidenceReadiness}% Overall</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                  <div className="p-1 rounded bg-[#10141a] border border-[#262a31]">
                    <div className="text-[#8c90a0]">Schema</div>
                    <div className="text-[#7bdb80] font-semibold">100%</div>
                  </div>
                  <div className="p-1 rounded bg-[#10141a] border border-[#262a31]">
                    <div className="text-[#8c90a0]">Complete</div>
                    <div className="text-[#7bdb80] font-semibold">88%</div>
                  </div>
                  <div className="p-1 rounded bg-[#10141a] border border-[#262a31]">
                    <div className="text-[#8c90a0]">SHA-256</div>
                    <div className="text-[#7bdb80] font-semibold">100%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2.5 mt-2 border-t border-[#262a31] text-[11px] text-[#8c90a0] flex items-center justify-between">
            <span>Mandatory: Missing Evidence ≠ Non-compliance</span>
            <Link to="/evidence" className="text-[#afc6ff] hover:underline font-mono">
              Inspect Vault →
            </Link>
          </div>
        </Card>
      </div>

      {/* 5. RECOMMENDED SUPERVISORY SAMPLING */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#262a31]">
          <SectionHeader
            title="Recommended Supervisory Sampling"
            subtitle="Risk-based and coverage-based allocation of manual examiner bandwidth"
            className="mb-0"
          />
          <Link
            to="/review"
            className="text-[12px] font-mono text-[#dfe2eb] hover:text-[#afc6ff] flex items-center gap-1.5 shrink-0"
          >
            <span>Review Queue</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#afc6ff]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 min-w-0">
          {topSamples.map((sample) => (
            <div 
              key={sample.id} 
              className="p-3.5 rounded-lg bg-[#14181f] border border-[#262a31] hover:border-[#3b414d] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-[12px] text-[#afc6ff]">{sample.caseId}</span>
                  <StatusBadge status={sample.priority} />
                </div>
                <div className="text-[13px] font-semibold text-[#dfe2eb] truncate">{sample.cseName}</div>
                <div className="text-[11px] text-[#8c90a0] font-mono mt-0.5">{sample.cseId} · {sample.controlId}</div>
                <p className="text-[12px] text-[#c2c6d6] mt-2 line-clamp-2 leading-snug">
                  <strong className="text-[#8c90a0]">Reason: </strong>{sample.samplingReason}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#262a31] flex items-center justify-between text-[11px]">
                <span className="font-mono text-[#8c90a0] uppercase">{sample.methodology.replace(/_/g, ' ')}</span>
                <span className="text-[#7bdb80] font-medium">Evidence: {sample.evidenceStrength}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
};
