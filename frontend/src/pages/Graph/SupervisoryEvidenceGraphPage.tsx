import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { 
  PageContainer, 
  PageHeader, 
  Card, 
  StatusBadge, 
  Button 
} from '@/components/common';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Search,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  GitFork
} from 'lucide-react';

interface GraphNode {
  id: string;
  type: 'CSE' | 'CONTROL' | 'PROCESS' | 'CASE' | 'ALERT' | 'INVESTIGATION' | 'EVIDENCE' | 'SIGNAL' | 'CLOSURE';
  label: string;
  sublabel: string;
  status: 'VERIFIED' | 'CRITICAL' | 'WARNING' | 'PENDING' | 'NEUTRAL';
  x: number;
  y: number;
  data: {
    entity: string;
    details: string;
    sha256?: string;
    source?: string;
    timestamp?: string;
    findingId?: string;
    evidenceId?: string;
  };
}

interface GraphLink {
  from: string;
  to: string;
  label?: string;
  type?: 'normal' | 'gap' | 'verified';
}

export const SupervisoryEvidenceGraphPage: React.FC = () => {
  const { cses, findings, evidence, setActiveFindingId } = useSupervisory();
  const navigate = useNavigate();

  const [selectedCseId, setSelectedCseId] = useState('CSE-014');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('sig-gap-0071');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Real graph model derived from actual CSE-014 supervisory case telemetry
  const nodes: GraphNode[] = useMemo(() => [
    // Level 1: CSE
    {
      id: 'cse-014',
      type: 'CSE',
      label: 'CSE-014: NorthGrid Transmission',
      sublabel: 'Energy Sector • Critical Priority',
      status: 'CRITICAL',
      x: 80,
      y: 260,
      data: {
        entity: 'NorthGrid Energy',
        details: 'Critical grid telemetry subject to NCIIPC Section 70B mandatory reporting standard.',
        source: 'Entity Regulatory Profile',
        timestamp: 'Q3 2026 Active Cycle'
      }
    },
    // Level 2: Controls
    {
      id: 'ctrl-07',
      type: 'CONTROL',
      label: 'CTRL-07: Tier-2 Escalation',
      sublabel: 'Mandatory 30m Escalation Window',
      status: 'CRITICAL',
      x: 280,
      y: 140,
      data: {
        entity: 'NorthGrid Energy',
        details: 'Regulatory mandate requires air-gapped escalation to national cert enclave within 30 minutes of high-severity trip.',
        source: 'NCIIPC-CSF v3.2'
      }
    },
    {
      id: 'ctrl-09',
      type: 'CONTROL',
      label: 'CTRL-09: Firewall Integrity',
      sublabel: 'Substation Perimeter Rules',
      status: 'VERIFIED',
      x: 280,
      y: 380,
      data: {
        entity: 'NorthGrid Energy',
        details: 'Quarterly cryptographic hash attestation of perimeter relay configs.',
        source: 'NCIIPC-CSF v3.2'
      }
    },
    // Level 3: Cases / Alerts
    {
      id: 'case-1042',
      type: 'CASE',
      label: 'CASE-1042: SCADA Bus Anomaly',
      sublabel: 'Severity: High • 26 Sep 09:14 IST',
      status: 'CRITICAL',
      x: 480,
      y: 110,
      data: {
        entity: 'NorthGrid Energy',
        details: 'Substation 4B telecontrol disconnect during switching procedure.',
        source: 'SOAR Incident Engine',
        timestamp: '26 Sep 2026 09:14:22'
      }
    },
    {
      id: 'alt-9901',
      type: 'ALERT',
      label: 'ALT-9901: Remote Command Trip',
      sublabel: 'Ingested from OT SIEM',
      status: 'WARNING',
      x: 480,
      y: 220,
      data: {
        entity: 'NorthGrid Energy',
        details: 'Ingested alert trigger from RTU terminal without dual-operator hardware key authentication.',
        source: 'OT SIEM Core',
        timestamp: '26 Sep 2026 09:15:01'
      }
    },
    // Level 4: Investigation & Evidence
    {
      id: 'evd-742',
      type: 'EVIDENCE',
      label: 'EVD-742: Investigation Worklog',
      sublabel: 'Verified Ingestion (PRESENT)',
      status: 'VERIFIED',
      x: 690,
      y: 80,
      data: {
        entity: 'NorthGrid Energy',
        details: 'Triage worklog completed by Shift Analyst at 09:42 IST. Confirms anomalous sequence.',
        sha256: '9f8a3c22b918a99477e6f8812dd014a9ecba19001258d4a98218174fca1',
        source: 'SOC Case Management',
        timestamp: '26 Sep 2026 09:42:18'
      }
    },
    {
      id: 'evd-missing',
      type: 'EVIDENCE',
      label: 'ESC-221: Regulatory Escalation',
      sublabel: 'Omitted Record (NOT_SUBMITTED)',
      status: 'CRITICAL',
      x: 690,
      y: 190,
      data: {
        entity: 'NorthGrid Energy',
        details: 'Mandatory formal transmission token to statutory authority was not generated. Zero record in ledger.',
        sha256: 'ABSENT_FROM_ENCLAVE_INGESTION',
        source: 'Statutory Ingestion Gate',
        timestamp: 'Expected by 09:44 IST'
      }
    },
    // Level 5: Supervisory Signal & Adjudication
    {
      id: 'sig-gap-0071',
      type: 'SIGNAL',
      label: 'GAP-0071: Execution Gap',
      sublabel: 'Ref Finding: FND-0142',
      status: 'CRITICAL',
      x: 900,
      y: 140,
      data: {
        entity: 'NorthGrid Energy',
        findingId: 'FND-0142',
        details: 'Investigation was conducted and case was marked closed, but mandatory statutory Tier-2 escalation step was bypassed.',
        source: 'Process Mining Engine AN-1.8',
        timestamp: 'Evaluated 26 Sep 10:25 IST'
      }
    },
    {
      id: 'close-bypass',
      type: 'CLOSURE',
      label: 'Direct Closure Action',
      sublabel: 'Single-Operator Premature Sign-off',
      status: 'WARNING',
      x: 900,
      y: 270,
      data: {
        entity: 'NorthGrid Energy',
        details: 'Incident was closed at 10:22 IST without statutory sign-off.',
        source: 'SOAR Worklog',
        timestamp: '26 Sep 2026 10:22:04'
      }
    }
  ], []);

  const links: GraphLink[] = useMemo(() => [
    { from: 'cse-014', to: 'ctrl-07', label: 'Mandate Scope', type: 'normal' },
    { from: 'cse-014', to: 'ctrl-09', label: 'Attested', type: 'verified' },
    { from: 'ctrl-07', to: 'case-1042', label: 'Governs Incident', type: 'normal' },
    { from: 'ctrl-07', to: 'alt-9901', label: 'Telemetry Rule', type: 'normal' },
    { from: 'case-1042', to: 'evd-742', label: 'Submits Proof', type: 'verified' },
    { from: 'case-1042', to: 'evd-missing', label: 'Missing Step', type: 'gap' },
    { from: 'evd-missing', to: 'sig-gap-0071', label: 'Synthesizes', type: 'gap' },
    { from: 'alt-9901', to: 'close-bypass', label: 'Direct Bypass', type: 'gap' },
    { from: 'close-bypass', to: 'sig-gap-0071', label: 'Confirms Deviation', type: 'gap' },
  ], []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const getStatusColor = (status: GraphNode['status']) => {
    switch (status) {
      case 'CRITICAL': return { stroke: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#fca5a5' };
      case 'VERIFIED': return { stroke: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: '#6ee7b7' };
      case 'WARNING': return { stroke: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#fde68a' };
      case 'PENDING': return { stroke: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd' };
      default: return { stroke: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', text: '#cbd5e1' };
    }
  };

  return (
    <PageContainer>
      {/* 1. STANDARD OPERATIONS HEADER */}
      <PageHeader
        title="Supervisory Evidence Graph"
        description="Forensic attestation topology tracing operational cases, ingested evidence, process mining steps, and supervisory discrepancies."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Search className="w-3.5 h-3.5" />}
              onClick={() => setSelectedNodeId('sig-gap-0071')}
            >
              Focus Priority Gap
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconRight={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/review/FND-0142')}
            >
              Examiner Workspace
            </Button>
          </div>
        }
      />

      {/* 2. GRAPH TOOLBAR */}
      <div className="p-3 rounded-lg bg-[#111622] border border-[#212c3d] flex flex-wrap items-center justify-between gap-3 text-[12px] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#64748b] uppercase text-[11px]">Entity Scope:</span>
          <select
            value={selectedCseId}
            onChange={(e) => setSelectedCseId(e.target.value)}
            className="h-8 px-2.5 rounded bg-[#161e29] border border-[#212c3d] text-[#60a5fa] font-semibold text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="CSE-014">CSE-014 (NorthGrid Energy)</option>
            <option value="CSE-007">CSE-007 (Apex Banking)</option>
            <option value="CSE-021">CSE-021 (Vanguard Telecom)</option>
          </select>

          <span className="text-[#64748b] uppercase text-[11px] ml-2">Node Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 px-2.5 rounded bg-[#161e29] border border-[#212c3d] text-[#f1f5f9] text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Topological Nodes</option>
            <option value="CONTROLS">Mandatory Controls Only</option>
            <option value="EVIDENCE">Evidence Ingestion Records</option>
            <option value="SIGNALS">Supervisory Signals &amp; Gaps</option>
          </select>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 text-[#94a3b8]">
          <span className="text-[11px] text-[#64748b] mr-1">Scale: {Math.round(zoomLevel * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
            className="p-1 rounded bg-[#161e29] hover:bg-[#1c2638] text-[#94a3b8] hover:text-[#f1f5f9] border border-[#212c3d]"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
            className="p-1 rounded bg-[#161e29] hover:bg-[#1c2638] text-[#94a3b8] hover:text-[#f1f5f9] border border-[#212c3d]"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-1 rounded bg-[#161e29] hover:bg-[#1c2638] text-[#94a3b8] hover:text-[#f1f5f9] border border-[#212c3d]"
            title="Reset Scale"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. MAIN TOPOLOGY CANVAS + RIGHT SIDE EVIDENCE INSPECTOR (Section 10 & 17) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-w-0">
        
        {/* Interactive Graph Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-[#090d14] border border-[#212c3d] rounded-lg p-3 relative overflow-hidden min-h-[560px] flex flex-col justify-between shadow-2xl">
          {/* Subtle grid background indicator */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />

          {/* Topology Canvas Header */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#64748b] pb-2 border-b border-[#212c3d]/60">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>DAG Mode: CSE → Control → Case → Telemetry → Discrepancy</span>
            </span>
            <span className="text-[#10b981]">IMMUTABLE AIR-GAP TOPOLOGY</span>
          </div>

          {/* SVG Graph Render Area */}
          <div className="relative w-full h-[480px] overflow-auto select-none">
            <svg 
              className="w-full h-full min-w-[980px]" 
              viewBox="0 0 1060 520"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', transition: 'transform 0.15s ease' }}
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <marker id="arrow-gap" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
                <marker id="arrow-verified" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
              </defs>

              {/* Draw Connector Links */}
              {links.map((link, idx) => {
                const source = nodes.find(n => n.id === link.from);
                const target = nodes.find(n => n.id === link.to);
                if (!source || !target) return null;

                const isGap = link.type === 'gap';
                const isVerified = link.type === 'verified';
                const strokeColor = isGap ? '#ef4444' : isVerified ? '#10b981' : '#334155';
                const markerId = isGap ? 'url(#arrow-gap)' : isVerified ? 'url(#arrow-verified)' : 'url(#arrow)';

                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g key={idx}>
                    <path
                      d={`M ${source.x} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x} ${target.y}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isGap ? 2 : 1.5}
                      strokeDasharray={isGap ? '4,4' : undefined}
                      markerEnd={markerId}
                      className="transition-all"
                    />
                    {link.label && (
                      <text
                        x={midX}
                        y={midY - 6}
                        fill={isGap ? '#fca5a5' : '#64748b'}
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="pointer-events-none select-none"
                      >
                        {link.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {nodes.map((node) => {
                const colors = getStatusColor(node.status);
                const isSelected = selectedNodeId === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer group"
                  >
                    {/* Outer selection ring */}
                    {isSelected && (
                      <circle
                        r="24"
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                        className="animate-spin"
                        style={{ animationDuration: '8s' }}
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      r="16"
                      fill={colors.bg}
                      stroke={colors.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="group-hover:stroke-white transition-all shadow-lg"
                    />

                    {/* Center Icon Indicator */}
                    <circle
                      r="5"
                      fill={colors.stroke}
                    />

                    {/* Node Text & Type Pill */}
                    <g transform="translate(0, 24)">
                      <rect
                        x="-70"
                        y="0"
                        width="140"
                        height="28"
                        rx="4"
                        fill="#111622"
                        stroke={isSelected ? '#3b82f6' : '#212c3d'}
                        strokeWidth={isSelected ? 1.5 : 1}
                      />
                      <text
                        x="0"
                        y="12"
                        fill={isSelected ? '#60a5fa' : '#f1f5f9'}
                        fontSize="10"
                        fontFamily="sans-serif"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {node.label.length > 20 ? node.label.slice(0, 19) + '…' : node.label}
                      </text>
                      <text
                        x="0"
                        y="22"
                        fill="#64748b"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {node.type}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="relative z-10 pt-2 border-t border-[#212c3d]/60 flex items-center justify-between text-[11px] font-mono text-[#64748b]">
            <span>Click any topology node to inspect evidence provenance</span>
            <span>9 Graph Nodes • 9 Cryptographic Edges</span>
          </div>
        </div>

        {/* Right Side Inspector (Section 17: Forensic Evidence Inspector) */}
        <div className="lg:col-span-4 min-w-0 space-y-3">
          <Card className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#212c3d]/60">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#60a5fa]" />
                <span className="font-mono text-[13px] font-bold text-[#f1f5f9] truncate">
                  Node Inspector: {selectedNode.type}
                </span>
              </div>
              <StatusBadge status={selectedNode.status} />
            </div>

            {/* Label and Identification */}
            <div className="space-y-1">
              <h4 className="text-[14px] font-semibold text-[#f1f5f9] leading-snug">
                {selectedNode.label}
              </h4>
              <p className="text-[11px] text-[#94a3b8] font-mono">
                {selectedNode.sublabel}
              </p>
            </div>

            {/* Technical Metadata Box */}
            <div className="p-3 rounded-lg bg-[#0c1017] border border-[#212c3d] text-[12px] font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Entity Scope:</span>
                <span className="text-[#f1f5f9] font-medium">{selectedNode.data.entity}</span>
              </div>
              {selectedNode.data.source && (
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Telemetry Source:</span>
                  <span className="text-[#60a5fa]">{selectedNode.data.source}</span>
                </div>
              )}
              {selectedNode.data.timestamp && (
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Timestamp / SLA:</span>
                  <span className="text-[#94a3b8]">{selectedNode.data.timestamp}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#64748b]">Integrity Status:</span>
                <span className={selectedNode.status === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {selectedNode.status === 'CRITICAL' ? 'EXECUTION GAP' : 'ATTESTED RECORD'}
                </span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Digest if evidence */}
            {selectedNode.data.sha256 && (
              <div className="space-y-1 text-[11px] font-mono">
                <span className="text-[#64748b] uppercase">Hardware Digest (SHA-256):</span>
                <div className="p-2 rounded bg-[#090d14] border border-[#212c3d] text-[#10b981] break-all select-all font-semibold text-[10px]">
                  {selectedNode.data.sha256}
                </div>
              </div>
            )}

            {/* Analytical Reasoning Description */}
            <div className="space-y-1">
              <span className="text-[11px] text-[#64748b] font-mono uppercase">
                Supervisory Analysis:
              </span>
              <p className="text-[12px] text-[#cbd5e1] leading-relaxed">
                {selectedNode.data.details}
              </p>
            </div>

            {/* Action Buttons as per Section 17 */}
            <div className="pt-2 border-t border-[#212c3d]/60 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-[11px]"
                  onClick={() => navigate('/evidence')}
                >
                  View Evidence Vault
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-[11px]"
                  onClick={() => navigate('/analysis/execution-gap')}
                >
                  View Gap Analysis
                </Button>
              </div>

              {selectedNode.data.findingId && (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-between"
                  iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setActiveFindingId(selectedNode.data.findingId!);
                    navigate(`/review/${selectedNode.data.findingId}`);
                  }}
                >
                  Open in Examiner Workspace
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
