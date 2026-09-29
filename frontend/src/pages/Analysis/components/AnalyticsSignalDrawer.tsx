import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Drawer, 
  PriorityBadge, 
  StatusBadge, 
  Button 
} from '@/components/common';
import { AnalyticsSignal, getEngineByType } from '@/data/mock/analysis';
import { 
  FileText, 
  ExternalLink, 
  ShieldAlert, 
  Layers, 
  GitCommit, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Database,
  Filter,
  Info,
  Activity
} from 'lucide-react';

interface AnalyticsSignalDrawerProps {
  signal: AnalyticsSignal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsSignalDrawer: React.FC<AnalyticsSignalDrawerProps> = ({
  signal,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();

  if (!signal) return null;

  const engineMeta = getEngineByType(signal.engineType);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${signal.signalId}: ${signal.title}`}
      subtitle={`${engineMeta?.shortName || signal.engineType} • ${signal.cseName}`}
      width="lg"
      footer={
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-1.5">
            {signal.findingId && (
              <Button
                variant="primary"
                size="sm"
                iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  navigate(`/review/findings/${signal.findingId}`);
                }}
              >
                Open Finding ({signal.findingId})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              iconRight={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                navigate(`/supervision/cses/${signal.cseId}`);
              }}
            >
              Open CSE
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1 text-[12px]">
        {/* 1. Header Badges */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262a31]">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={signal.priority} />
            <StatusBadge status={signal.status} />
            {signal.recommendedForSampling && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950/40 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                Sampling Recommended
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-[#94a3b8]">{signal.updatedAt}</span>
        </div>

        {/* 2. Explainability: WHY WAS THIS SIGNAL GENERATED? (Section 23) */}
        <div className="p-3.5 rounded-lg bg-[#111622] border border-[#212c3d] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#60a5fa] uppercase tracking-wider font-semibold">
            <Info className="w-4 h-4 text-[#3b82f6]" />
            Supervisory Signal Explainability
          </div>
          <p className="text-[12px] text-[#cbd5e1] leading-relaxed">
            {signal.reason}
          </p>
        </div>

        {/* 3. Structured Comparison: Expected vs Observed vs Difference (Section 19 & 23) */}
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold font-mono">
            Analytical Comparison
          </div>
          <div className="space-y-2">
            {/* Expected */}
            <div className="p-3 rounded bg-[#0d121c] border border-emerald-500/30">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Expected Operational State
              </div>
              <p className="text-[#e2e8f0] text-[12px] leading-relaxed">
                {signal.expected}
              </p>
            </div>

            {/* Observed */}
            <div className="p-3 rounded bg-[#0d121c] border border-rose-500/30">
              <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Observed Evidence State
              </div>
              <p className="text-[#e2e8f0] text-[12px] leading-relaxed">
                {signal.observed}
              </p>
            </div>

            {/* Difference / Gap */}
            <div className="p-2.5 rounded bg-[#161e29] border border-amber-500/30 flex items-start gap-2">
              <Activity className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  Identified Analytical Variance
                </div>
                <div className="text-[12px] font-medium text-[#f1f5f9] mt-0.5">
                  {signal.difference}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Engine-Specific Section */}
        {signal.engineType === 'PROCESS_CONFORMANCE' && (
          <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] space-y-2">
            <div className="text-[11px] font-mono uppercase text-[#38bdf8] font-semibold">
              Process Sequence Conformance (Petri Net Analysis)
            </div>
            {signal.expectedProcess && (
              <div className="text-[11px] font-mono text-[#94a3b8] bg-[#0d121c] p-2 rounded border border-[#212c3d]">
                <strong className="text-emerald-400">Expected: </strong>
                {signal.expectedProcess}
              </div>
            )}
            {signal.observedProcess && (
              <div className="text-[11px] font-mono text-[#94a3b8] bg-[#0d121c] p-2 rounded border border-[#212c3d]">
                <strong className="text-rose-400">Observed: </strong>
                {signal.observedProcess}
              </div>
            )}
            {signal.deviationType && (
              <div className="text-[11px] text-[#e2e8f0]">
                Deviation Type: <span className="text-amber-400 font-mono font-medium">{signal.deviationType}</span>
              </div>
            )}
          </div>
        )}

        {signal.engineType === 'NEGATIVE_SPACE' && (
          <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] space-y-2">
            <div className="text-[11px] font-mono uppercase text-[#38bdf8] font-semibold">
              Evidence Requirement State
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#0d121c] border border-[#212c3d]">
              <span className="text-[#94a3b8]">Status:</span>
              <span className="font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/30 border border-amber-500/30">
                {signal.evidenceState || 'NOT_SUBMITTED'}
              </span>
            </div>
            <p className="text-[11px] text-[#94a3b8] italic">
              Note: Unsubmitted or absent evidence triggers supervisory inquiry; it is not treated as an automatic breach.
            </p>
          </div>
        )}

        {signal.engineType === 'CROSS_SOURCE_CONSISTENCY' && (signal.sourceA || signal.sourceB) && (
          <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] space-y-2">
            <div className="text-[11px] font-mono uppercase text-[#38bdf8] font-semibold">
              Cross-Source Ingestion Discrepancy
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-[#0d121c] border border-[#212c3d]">
                <div className="text-[#94a3b8] mb-1">Source A (Primary)</div>
                <div className="text-[#f1f5f9]">{signal.sourceA}</div>
              </div>
              <div className="p-2 rounded bg-[#0d121c] border border-[#212c3d]">
                <div className="text-[#94a3b8] mb-1">Source B (Secondary)</div>
                <div className="text-[#f1f5f9]">{signal.sourceB}</div>
              </div>
            </div>
          </div>
        )}

        {signal.engineType === 'METRIC_INTEGRITY' && (signal.kpiReported || signal.kpiObserved) && (
          <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] space-y-2">
            <div className="text-[11px] font-mono uppercase text-[#38bdf8] font-semibold">
              Reported Metric vs Forensic Log Telemetry
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-[#0d121c] border border-blue-500/30">
                <div className="text-[#93c5fd] mb-1">Entity Attested KPI</div>
                <div className="text-emerald-400 font-semibold">{signal.kpiReported}</div>
              </div>
              <div className="p-2 rounded bg-[#0d121c] border border-rose-500/30">
                <div className="text-[#fda4af] mb-1">Observed Forensic Telemetry</div>
                <div className="text-rose-400 font-semibold">{signal.kpiObserved}</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Key Context & Entity Metadata */}
        <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] space-y-2">
          <div className="text-[11px] font-mono uppercase text-[#64748b] font-semibold">
            Supervisory Context
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#94a3b8]">Regulated CSE:</span>
              <div className="text-[#f1f5f9] font-medium mt-0.5">{signal.cseName} ({signal.cseId})</div>
            </div>
            <div>
              <span className="text-[#94a3b8]">Assessment Period:</span>
              <div className="text-[#f1f5f9] font-mono mt-0.5">{signal.assessmentId}</div>
            </div>
            <div>
              <span className="text-[#94a3b8]">Applicable Control:</span>
              <div className="text-[#60a5fa] font-mono mt-0.5">{signal.controlId} ({signal.controlVersion})</div>
            </div>
            <div>
              <span className="text-[#94a3b8]">Related Finding:</span>
              <div className="text-[#f1f5f9] font-mono mt-0.5">
                {signal.findingId ? (
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/review/findings/${signal.findingId}`);
                    }}
                    className="text-[#38bdf8] hover:underline"
                  >
                    {signal.findingId}
                  </button>
                ) : (
                  <span className="text-[#64748b]">No candidate logged</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Supporting Evidence Parcels (Section 19 & 26) */}
        <div className="space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold font-mono flex items-center justify-between">
            <span>Supporting Evidence Items ({signal.evidenceIds.length})</span>
            <button
              onClick={() => {
                onClose();
                navigate('/evidence');
              }}
              className="text-[#60a5fa] hover:underline text-[10px] lowercase"
            >
              open explorer →
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {signal.evidenceIds.map(evId => (
              <button
                key={evId}
                onClick={() => {
                  onClose();
                  navigate(`/evidence/${evId}`);
                }}
                className="px-2.5 py-1 rounded bg-[#0d121c] border border-[#212c3d] text-[11px] font-mono text-[#38bdf8] hover:bg-[#161e29] hover:border-[#3b82f6] transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3 h-3 text-[#94a3b8]" />
                {evId}
              </button>
            ))}
          </div>
        </div>

        {/* 7. Evidence Fusion & Sampling Context (Section 27 & 28) */}
        <div className="p-3 rounded-lg bg-[#0d121c] border border-[#212c3d] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#a78bfa] font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Evidence Fusion Integration
            </span>
            <span className="text-[10px] font-mono text-[#94a3b8]">
              Automated Synthesis
            </span>
          </div>
          <p className="text-[11px] text-[#94a3b8] leading-relaxed">
            This signal is correlated by the SAT-SA Evidence Fusion layer with cross-source telemetry to generate candidate finding {signal.findingId || 'records'}. Final supervisory actions require human examiner validation.
          </p>
          {signal.recommendedForSampling && (
            <div className="pt-2 border-t border-[#212c3d] flex items-center justify-between">
              <span className="text-[11px] text-sky-400 font-mono flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Recommended for Supervisory Sampling
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate('/sampling');
                }}
              >
                Open Sampling
              </Button>
            </div>
          )}
        </div>

        {/* 8. Version Traceability & Provenance (Section 24) */}
        <div className="p-2.5 rounded bg-[#0d121c] border border-[#212c3d] text-[10px] font-mono text-[#64748b] space-y-1">
          <div className="flex justify-between">
            <span>Rule Engine Version:</span>
            <span className="text-[#94a3b8]">{signal.ruleVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>Control Schema:</span>
            <span className="text-[#94a3b8]">{signal.controlVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>Analytical Model:</span>
            <span className="text-[#94a3b8]">{signal.modelVersion}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
