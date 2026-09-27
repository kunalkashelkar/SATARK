import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PageContainer, 
  PageHeader, 
  KpiCard, 
  Button 
} from '@/components/common';
import { 
  AUTHORITATIVE_ENGINES, 
  getAnalysisHubMetrics 
} from '@/data/mock/analysis';
import { 
  ArrowRight, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  Building2,
  FolderSync
} from 'lucide-react';

export const AnalysisHubPage: React.FC = () => {
  const navigate = useNavigate();
  const metrics = getAnalysisHubMetrics();

  return (
    <PageContainer>
      {/* 1. STANDARD PAGE HEADER (Section 4) */}
      <PageHeader
        title="Analysis Hub"
        description="Review the analytical engines used to identify supervisory signals from CSE evidence."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#94a3b8] bg-[#111622] px-3 py-1.5 rounded border border-[#212c3d]">
              Architecture: <strong className="text-[#38bdf8]">10 Autonomous Engines</strong>
            </span>
            <Button
              variant="outline"
              size="md"
              iconRight={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/review')}
            >
              Review Queue
            </Button>
          </div>
        }
      />

      {/* 2. SMALL SUMMARY: STRICTLY MAXIMUM 4 KPI CARDS (Section 4 & 21) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 min-w-0">
        <KpiCard
          title="Active Engines"
          value={metrics.activeEngines}
          subtitle="Authoritative Analytical Pipeline"
          semantic="green"
          icon={Layers}
        />
        <KpiCard
          title="Signals Detected"
          value={68}
          subtitle="Forensic Evidence Signals"
          semantic="blue"
          icon={FolderSync}
        />
        <KpiCard
          title="Engines Requiring Review"
          value={metrics.enginesRequiringReview}
          subtitle="Contains Unreviewed Signals"
          semantic="red"
          alert={metrics.enginesRequiringReview > 0}
          icon={AlertTriangle}
        />
        <KpiCard
          title="Assessments Analyzed"
          value={metrics.assessmentsAnalyzed}
          subtitle="Regulated CSE Cohorts"
          semantic="neutral"
          icon={Building2}
        />
      </div>

      {/* 3. ENGINE DIRECTORY TABLE: COMPACT, CLEAN & INTUITIVE (Section 4 & 5) */}
      <div className="rounded-lg bg-[#111622] border border-[#212c3d] overflow-hidden">
        <div className="p-3 border-b border-[#212c3d] flex items-center justify-between bg-[#0d121c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">hub</span>
            <span className="text-[13px] font-semibold text-[#f1f5f9]">
              Analytical Engines Directory ({AUTHORITATIVE_ENGINES.length})
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#94a3b8]">
            Click any engine to inspect its signals and evidence traces
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-[#0d121c] text-[#94a3b8] font-mono uppercase text-[10px] tracking-wider border-b border-[#212c3d]">
              <tr>
                <th className="py-2.5 px-4 w-[240px]">Engine</th>
                <th className="py-2.5 px-4">Supervisory Question & Purpose</th>
                <th className="py-2.5 px-4 text-center w-[100px]">Signals</th>
                <th className="py-2.5 px-4 text-center w-[110px]">Status</th>
                <th className="py-2.5 px-4 text-right w-[110px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212c3d]">
              {AUTHORITATIVE_ENGINES.map((engine, idx) => (
                <tr
                  key={engine.id}
                  onClick={() => navigate(engine.route)}
                  className="hover:bg-[#161e29]/70 cursor-pointer transition-colors group"
                >
                  {/* Engine Name + Icon */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-[#0d121c] border border-[#212c3d] flex items-center justify-center text-[#38bdf8] shrink-0 group-hover:border-[#3b82f6] transition-colors">
                        <span className="material-symbols-outlined text-[18px]">
                          {engine.iconName}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-[#f1f5f9] group-hover:text-[#60a5fa] transition-colors">
                          {engine.shortName}
                        </div>
                        <div className="text-[10px] font-mono text-[#64748b]">
                          {idx + 1}. {engine.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Purpose / Simple Human-Readable Question (Section 5) */}
                  <td className="py-3.5 px-4 text-[#cbd5e1] leading-relaxed">
                    <span className="font-medium text-[#e2e8f0]">"{engine.purpose}"</span>
                  </td>

                  {/* Signals Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#0d121c] text-[#38bdf8] border border-[#212c3d]">
                      {engine.signalCount}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {engine.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(engine.route);
                      }}
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
};
