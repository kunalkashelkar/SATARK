import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { 
  PageContainer, 
  Button,
  Input,
  LoadingState,
  EmptyState,
  ErrorState,
  PageHeader 
} from '@/components/common';
import { 
  ArrowRight, 
  Layers, 
  AlertTriangle, 
  Clock, 
  Activity, 
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
  FolderSync,
  Play,
  GitBranch,
  EyeOff,
  FileCheck,
  History,
  Users,
  Split,
  Calculator
} from 'lucide-react';

export type EngineStatus = 'COMPLETED' | 'RUNNING' | 'WARNING' | 'FAILED' | 'NOT_RUN';

export interface AnalyticalModule {
  id: string;
  slug: string;
  name: string;
  purpose: string;
  route: string;
  iconName: string;
  status: EngineStatus;
  signalType: string;
  ruleVersion: string;
}

const AUTHORITATIVE_MODULES: AnalyticalModule[] = [
  {
    id: 'EXECUTION_GAP',
    slug: 'execution-gap',
    name: 'Execution Gap',
    purpose: 'Identifies mandated security controls and SOC procedures claimed but absent in execution telemetry.',
    route: '/analysis/execution-gap',
    iconName: 'rule_folder',
    status: 'COMPLETED',
    signalType: 'EXECUTION_GAP',
    ruleVersion: 'R-2.4'
  },
  {
    id: 'NEGATIVE_SPACE',
    slug: 'negative-space',
    name: 'Negative Space',
    purpose: 'Detects systemic omissions and missing corroborating artifacts across expected timeline windows.',
    route: '/analysis/negative-space',
    iconName: 'contrast',
    status: 'WARNING',
    signalType: 'NEGATIVE_SPACE',
    ruleVersion: 'R-2.4'
  },
  {
    id: 'COVERAGE',
    slug: 'coverage',
    name: 'Coverage & Blind Spots',
    purpose: 'Audits monitoring perimeter boundaries, unmonitored assets, and telemetry dark zones.',
    route: '/analysis/coverage',
    iconName: 'radar',
    status: 'COMPLETED',
    signalType: 'COVERAGE_GAP',
    ruleVersion: 'R-2.1'
  },
  {
    id: 'PROCESS_CONFORMANCE',
    slug: 'process',
    name: 'Process Conformance',
    purpose: 'Validates temporal incident handling progression against statutory SOP workflow sequences.',
    route: '/analysis/process',
    iconName: 'account_tree',
    status: 'COMPLETED',
    signalType: 'PROCESS_DEVIATION',
    ruleVersion: 'R-2.4'
  },
  {
    id: 'INVESTIGATION_QUALITY',
    slug: 'investigation-quality',
    name: 'Investigation Quality',
    purpose: 'Evaluates forensic triage depth, evidentiary linkage sufficiency, and closure justifications.',
    route: '/analysis/investigation-quality',
    iconName: 'verified',
    status: 'COMPLETED',
    signalType: 'INVESTIGATION',
    ruleVersion: 'R-1.9'
  },
  {
    id: 'BEHAVIOURAL_DEVIATION',
    slug: 'behavioural',
    name: 'Behavioural Deviation',
    purpose: 'Surfaces shifts from historical operator behavior, abnormal triage delays, and off-hour ticket surges.',
    route: '/analysis/behavioural',
    iconName: 'psychology',
    status: 'COMPLETED',
    signalType: 'BEHAVIOURAL',
    ruleVersion: 'R-2.0'
  },
  {
    id: 'HISTORICAL_COMPARISON',
    slug: 'historical',
    name: 'Historical Comparison',
    purpose: 'Tracks recurring control deficiencies and regression patterns across consecutive assessment cycles.',
    route: '/analysis/historical',
    iconName: 'timeline',
    status: 'COMPLETED',
    signalType: 'HISTORICAL_RECURRENCE',
    ruleVersion: 'R-1.8'
  },
  {
    id: 'PEER_BENCHMARKING',
    slug: 'peer',
    name: 'Peer Benchmarking',
    purpose: 'Quantifies control assurance posture relative to authorized critical sector peer cohorts.',
    route: '/analysis/peer',
    iconName: 'compare_arrows',
    status: 'COMPLETED',
    signalType: 'PEER_DEVIATION',
    ruleVersion: 'R-2.2'
  },
  {
    id: 'CROSS_SOURCE_CONSISTENCY',
    slug: 'consistency',
    name: 'Cross-Source Consistency',
    purpose: 'Correlates independent telemetry logs, ticketing feeds, and SIEM records for forensic agreement.',
    route: '/analysis/consistency',
    iconName: 'stacked_line_chart',
    status: 'COMPLETED',
    signalType: 'CROSS_SOURCE_CONSISTENCY',
    ruleVersion: 'R-2.3'
  },
  {
    id: 'METRIC_INTEGRITY',
    slug: 'metric-integrity',
    name: 'Metric Integrity',
    purpose: 'Validates reported SLA figures and compliance metrics against immutable event log timestamps.',
    route: '/analysis/metric-integrity',
    iconName: 'difference',
    status: 'COMPLETED',
    signalType: 'METRIC_INTEGRITY',
    ruleVersion: 'R-1.9'
  }
];

export const AnalysisHubPage: React.FC = () => {
  const { 
    cses, 
    findings, 
    auditTrail, 
    activeCseId, 
    refreshAllData, 
    isLoading 
  } = useSupervisory();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active Assessment Context
  const currentCSE = cses.find(c => c.cseId.toLowerCase() === activeCseId.toLowerCase()) 
    || cses.find(c => c.cseId === 'CSE-014') 
    || cses[0];

  const assessmentContextTitle = currentCSE 
    ? `${currentCSE.cseId} (${currentCSE.cseName}) — ${currentCSE.period || 'Q3 2026'}`
    : 'Supervisory Enclave Portfolio Assessment';

  // Real timestamp of last analytical run
  const lastAnalysisRun = useMemo(() => {
    if (auditTrail && auditTrail.length > 0) {
      const analysisEvent = auditTrail.find(a => 
        a.action.toLowerCase().includes('analysis') || 
        a.action.toLowerCase().includes('engine') || 
        a.action.toLowerCase().includes('signal')
      );
      if (analysisEvent) return analysisEvent.timestamp;
      return auditTrail[0].timestamp;
    }
    const dates = findings.map(f => f.decidedAt).filter(Boolean);
    if (dates.length > 0) {
      return new Date(dates[0] as string).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return '29 Sep 2026, 14:30 IST';
  }, [auditTrail, findings]);

  // Overall Processing Status
  const overallProcessingStatus = useMemo(() => {
    if (isLoading) return 'ANALYSIS RUNNING';
    const hasWarnings = findings.some(f => f.priority === 'CRITICAL');
    if (hasWarnings) return 'OPERATIONAL (ATTENTION REQUIRED)';
    return 'OPERATIONAL (ALL ENGINES SYNCED)';
  }, [isLoading, findings]);

  // Derive genuine counts of signals and findings generated per engine
  const engineStats = useMemo(() => {
    const stats: Record<string, { signals: number; criticalFindings: number; lastRun: string }> = {};

    AUTHORITATIVE_MODULES.forEach(mod => {
      const matchingFindings = findings.filter(f => f.signalType === mod.signalType);
      const criticalCount = matchingFindings.filter(f => f.priority === 'CRITICAL' || f.priority === 'HIGH').length;

      stats[mod.id] = {
        signals: matchingFindings.length,
        criticalFindings: criticalCount,
        lastRun: lastAnalysisRun
      };
    });

    return stats;
  }, [findings, lastAnalysisRun]);

  const handleRefresh = async () => {
    try {
      setLoadError(null);
      await refreshAllData();
    } catch (err: any) {
      setLoadError(err?.message || 'Failed refreshing analytical engine states.');
    }
  };

  // Filter modules
  const filteredModules = useMemo(() => {
    return AUTHORITATIVE_MODULES.filter(mod => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = mod.name.toLowerCase().includes(q) || mod.purpose.toLowerCase().includes(q) || mod.slug.includes(q);
        if (!matches) return false;
      }

      if (statusFilter !== 'ALL' && mod.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [searchTerm, statusFilter]);

  // Status Badge Rendering with Restrained Visual Differentiation
  const renderStatusBadge = (status: EngineStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Completed</span>
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-950/40 text-blue-300 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Running</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950/40 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Warning</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-950/40 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Failed</span>
          </span>
        );
      case 'NOT_RUN':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 text-slate-400 border border-slate-700/40">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>Not Run</span>
          </span>
        );
    }
  };

  const getEngineIcon = (id: string) => {
    switch (id) {
      case 'EXECUTION_GAP': return <GitBranch className="w-4 h-4 text-[#3b82f6]" />;
      case 'NEGATIVE_SPACE': return <EyeOff className="w-4 h-4 text-amber-400" />;
      case 'COVERAGE': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'PROCESS_CONFORMANCE': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'INVESTIGATION_QUALITY': return <FileCheck className="w-4 h-4 text-purple-400" />;
      case 'BEHAVIOURAL_DEVIATION': return <SlidersHorizontal className="w-4 h-4 text-indigo-400" />;
      case 'HISTORICAL_COMPARISON': return <History className="w-4 h-4 text-sky-400" />;
      case 'PEER_BENCHMARKING': return <Users className="w-4 h-4 text-indigo-400" />;
      case 'CROSS_SOURCE_CONSISTENCY': return <Split className="w-4 h-4 text-teal-400" />;
      case 'METRIC_INTEGRITY': return <Calculator className="w-4 h-4 text-cyan-400" />;
      default: return <Layers className="w-4 h-4 text-[#3b82f6]" />;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Analysis Hub"
        subtitle="Autonomous supervisory analytical engines"
        metadata={
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              10 Engines
            </span>
            <span>•</span>
            <span>Assessment: {assessmentContextTitle}</span>
            <span>•</span>
            <span>Last Run: {lastAnalysisRun}</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Sync
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconRight={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/review')}
            >
              Review Queue ({findings.length})
            </Button>
          </div>
        }
      />

      {/* 2. OPERATIONAL STATUS BAR & FILTER CONTROLS */}
      <div className="bg-[#111622] border border-[#212c3d] rounded-lg p-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <Input
            icon={<Search className="w-4 h-4 text-[#64748b]" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter analytical engine by name, slug, or purpose..."
            sizeVariant="sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0d121a] p-0.5 rounded border border-[#212c3d] text-[11px] font-mono">
            {(['ALL', 'COMPLETED', 'WARNING'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === st 
                    ? 'bg-[#1f6feb] text-white font-semibold' 
                    : 'text-[#94a3b8] hover:text-[#f1f5f9]'
                }`}
              >
                {st === 'ALL' ? 'All Engines (10)' : st === 'COMPLETED' ? 'Completed (9)' : 'Warning (1)'}
              </button>
            ))}
          </div>

          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="text-[11px] font-mono text-[#8c90a0] hover:text-[#f1f5f9] px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 3. ANALYTICAL ENGINE GRID */}
      {isLoading && findings.length === 0 ? (
        <LoadingState message="Connecting to analytical engine telemetry..." />
      ) : loadError ? (
        <ErrorState
          title="Analysis Hub Connection Error"
          message={loadError}
          onRetry={handleRefresh}
        />
      ) : filteredModules.length === 0 ? (
        <EmptyState
          title="No analytical engines found"
          description="No engines match your current filter parameters."
          action={
            <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredModules.map((engine) => {
            const stat = engineStats[engine.id] || { signals: 0, criticalFindings: 0, lastRun: lastAnalysisRun };
            const isWarning = engine.status === 'WARNING';

            return (
              <div
                key={engine.id}
                onClick={() => navigate(engine.route)}
                className={`rounded-lg bg-[#111622] border transition-all cursor-pointer flex flex-col justify-between p-4 group hover:border-[#3b82f6]/70 shadow-sm ${
                  isWarning ? 'border-amber-500/40 hover:border-amber-500' : 'border-[#212c3d]'
                }`}
              >
                {/* Engine Card Top: Icon, Name, Status Badge */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-[#0b0f17] border border-[#212c3d] flex items-center justify-center text-[#3b82f6] shrink-0 group-hover:border-[#3b82f6] transition-colors">
                        {getEngineIcon(engine.id)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#f1f5f9] text-[14px] leading-tight truncate group-hover:text-[#60a5fa] transition-colors">
                          {engine.name}
                        </h3>
                        <span className="font-mono text-[10px] text-[#64748b]">
                          {engine.slug} • {engine.ruleVersion}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {renderStatusBadge(engine.status)}
                    </div>
                  </div>

                  {/* One-Line Purpose */}
                  <p className="text-[12px] text-[#94a3b8] leading-snug line-clamp-2 min-h-[34px]">
                    {engine.purpose}
                  </p>
                </div>

                {/* Engine Card Bottom: Real Stats, Last Run & Action */}
                <div className="pt-3 mt-3 border-t border-[#212c3d] space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-[#0d121a] border border-[#212c3d]">
                      <span className="text-[#64748b] block text-[10px] uppercase">Signals Generated</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-[#f1f5f9] text-[13px]">{stat.signals}</span>
                        {stat.criticalFindings > 0 && (
                          <span className="text-[10px] text-rose-400">
                            ({stat.criticalFindings} critical)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-[#0d121a] border border-[#212c3d]">
                      <span className="text-[#64748b] block text-[10px] uppercase">Execution Cycle</span>
                      <span className="text-[#cbd5e1] font-medium block truncate mt-0.5 text-[11px]">
                        {currentCSE?.period || 'Q3 2026'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <div className="flex items-center gap-1 text-[#64748b] font-mono text-[10px]">
                      <Clock className="w-3 h-3" />
                      <span>{stat.lastRun}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(engine.route);
                      }}
                      className="font-mono text-[11px] text-[#60a5fa] hover:text-[#93c5fd] hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Open Analysis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
