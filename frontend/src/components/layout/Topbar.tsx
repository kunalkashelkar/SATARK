import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { UserRole } from '@/types';
import { Search, Bell, Shield, ChevronDown, Check } from 'lucide-react';

export const Topbar: React.FC<{ isCollapsed?: boolean; onToggleCollapse?: () => void }> = ({
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { userRole, setUserRole, logout, cses, activeCseId, setActiveCseId, metrics } = useSupervisory();
  const location = useLocation();
  const navigate = useNavigate();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Q3 2026');
  const [searchQuery, setSearchQuery] = useState('');

  const path = location.pathname;
  const segments = path.split('/').filter(Boolean);

  const getPageInfo = () => {
    if (segments.length === 0 || segments[0] === 'overview') {
      return { title: 'Assessment Overview', subtitle: 'Portfolio Posture & Priority Signals' };
    }
    if (segments[0] === 'assessments') {
      if (segments[1]) {
        const cse = cses.find(c => c.cseId.toLowerCase() === segments[1].toLowerCase());
        return { 
          title: `CSE Assessment: ${segments[1].toUpperCase()}`, 
          subtitle: cse ? `${cse.cseName} • ${cse.sector} Sector` : 'Detailed Institutional Assessment' 
        };
      }
      return { title: 'CSE Assessments', subtitle: 'Portfolio Compliance & Readiness' };
    }
    if (segments[0] === 'review' || segments[0] === 'findings') {
      if (segments[1]) {
        return { title: `Finding Workspace: ${segments[1]}`, subtitle: 'Human Supervisory Adjudication' };
      }
      return { title: 'Supervisory Review Queue', subtitle: 'High-Priority Operational Signals' };
    }
    if (segments[0] === 'graph') {
      return { title: 'Supervisory Evidence Graph', subtitle: 'Attestation vs Forensic Provenance Topology' };
    }
    if (segments[0] === 'sampling') {
      return { title: 'Supervisory Sampling Engine', subtitle: 'Evidence-Driven Case Selection' };
    }
    if (segments[0] === 'evidence') {
      return { title: 'Evidence Vault', subtitle: 'FIPS-140-2 Cryptographic Ingestion Records' };
    }
    if (segments[0] === 'remediation') {
      return { title: 'Remediation Lifecycle', subtitle: 'Corrective Action & Verification Gates' };
    }
    if (segments[0] === 'governance') {
      return { title: 'Governance & Audit', subtitle: 'Immutable Ledger & Control Specifications' };
    }
    if (segments[0] === 'analysis') {
      const sub = segments[1] ? segments[1].replace('-', ' ').toUpperCase() : 'ENGINES';
      return { title: `Analytics Hub: ${sub}`, subtitle: 'Process Mining & Telemetry Correlation' };
    }
    return { title: segments[0].toUpperCase(), subtitle: 'Government Supervisory Console' };
  };

  const { title, subtitle } = getPageInfo();

  const handleCseChange = (cseId: string) => {
    setActiveCseId(cseId);
    if (cseId !== 'ALL') {
      navigate(`/assessments/${cseId}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/review?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header 
      className={`fixed top-0 right-0 h-14 bg-[#0d121c]/95 backdrop-blur-md z-40 px-4 md:px-6 flex items-center justify-between border-b border-[#212c3d] transition-all duration-200 ${
        isCollapsed ? 'left-[68px]' : 'left-[250px]'
      }`}
    >
      {/* Left: Page Title & Contextual Subtitle (Section 3) */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleCollapse && (
          <button 
            type="button" 
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-[#161e29] text-[#64748b] hover:text-[#f1f5f9] transition-colors"
            title="Toggle Sidebar"
          >
            <span className="material-symbols-outlined text-[18px]">menu</span>
          </button>
        )}

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[14px] md:text-[15px] font-semibold text-[#f1f5f9] tracking-tight truncate leading-tight">
              {title}
            </h1>
            <span className="text-[#64748b] text-[12px] hidden sm:inline">•</span>
            <span className="text-[11px] font-mono text-[#94a3b8] hidden sm:inline truncate">
              {activeCseId} • {selectedPeriod}
            </span>
          </div>
          <p className="text-[11px] text-[#64748b] truncate leading-tight mt-0.5 hidden md:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Center & Right Controls (Section 3: Period, CSE Selector, Search, Enclave Badge, User Profile) */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* Assessment Period Selector */}
        <div className="hidden lg:flex items-center bg-[#131922] border border-[#212c3d] rounded px-2 py-1 gap-1 text-[11px] font-mono text-[#94a3b8]">
          <span className="text-[#64748b] uppercase text-[10px]">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-transparent text-[#f1f5f9] focus:outline-none cursor-pointer pr-1"
          >
            <option value="Q3 2026" className="bg-[#131922]">Q3 2026 (Active)</option>
            <option value="Q2 2026" className="bg-[#131922]">Q2 2026</option>
            <option value="Q1 2026" className="bg-[#131922]">Q1 2026</option>
          </select>
        </div>

        {/* CSE Selector Dropdown */}
        <div className="hidden sm:flex items-center bg-[#131922] border border-[#212c3d] rounded px-2 py-1 gap-1 text-[11px] font-mono text-[#94a3b8]">
          <span className="text-[#64748b] uppercase text-[10px]">Target:</span>
          <select
            value={activeCseId}
            onChange={(e) => handleCseChange(e.target.value)}
            className="bg-transparent text-[#60a5fa] font-semibold focus:outline-none cursor-pointer max-w-[130px] truncate"
          >
            <option value="ALL" className="bg-[#131922] text-[#f1f5f9]">All CSEs (6)</option>
            {cses.map((c) => (
              <option key={c.cseId} value={c.cseId} className="bg-[#131922] text-[#60a5fa]">
                {c.cseId} - {c.cseName.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Search Input */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#64748b] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search telemetry..."
            className="h-8 pl-8 pr-2.5 rounded bg-[#131922] border border-[#212c3d] text-[11px] text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] w-36 lg:w-44 transition-all font-mono"
          />
        </form>

        {/* Secure Environment Badge (Section 3 & 21) */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131922] border border-[#212c3d]">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="font-mono text-[10px] text-[#10b981] font-semibold tracking-wider">
            SECURE ENCLAVE • OFFLINE
          </span>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 rounded bg-[#131922] hover:bg-[#161e29] border border-[#212c3d] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors relative"
            title="Supervisory Notifications"
          >
            <Bell className="w-4 h-4" />
            {metrics.highPrioritySignals > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {metrics.highPrioritySignals}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg bg-[#111622] border border-[#212c3d] shadow-2xl p-3 z-50 text-[12px] space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#212c3d]">
                <span className="font-mono font-bold text-[#f1f5f9] text-[11px] uppercase">
                  Supervisory Alerts ({metrics.highPrioritySignals})
                </span>
                <span className="text-[10px] text-[#10b981] font-mono">FIPS-140-2 Realtime</span>
              </div>
              <div className="space-y-1.5">
                <div className="p-2 rounded bg-[#161e29] border border-rose-500/30 text-[11px]">
                  <div className="font-semibold text-rose-300">GAP-0071: Missing Tier-2 Escalation</div>
                  <div className="text-[#64748b] text-[10px]">NorthGrid Transmission (CSE-014) • 30m SLA Breached</div>
                </div>
                <div className="p-2 rounded bg-[#161e29] border border-amber-500/30 text-[11px]">
                  <div className="font-semibold text-amber-300">NS-0041: SCADA Log Void</div>
                  <div className="text-[#64748b] text-[10px]">Vanguard Telecom (CSE-021) • Telemetry missing</div>
                </div>
              </div>
              <div className="pt-1 text-center border-t border-[#212c3d]">
                <Link
                  to="/review"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] text-[#60a5fa] hover:underline font-mono"
                >
                  View All Review Items →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Role & Profile Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 pl-2.5 pr-2 py-1 rounded bg-[#131922] hover:bg-[#161e29] transition-colors border border-[#212c3d]"
          >
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-semibold text-[#f1f5f9] leading-tight">
                {userRole === 'SUPERVISOR' ? 'Supervisor' : 'Lead Examiner'}
              </span>
              <span className="text-[9px] text-[#10b981] leading-tight font-mono uppercase tracking-wider">
                {userRole}
              </span>
            </div>
            <div className="w-6 h-6 rounded bg-[#1d4ed8] flex items-center justify-center text-white text-[12px] font-mono font-bold">
              NC
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#111622] border border-[#212c3d] shadow-2xl p-1.5 z-50 text-[12px]">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#64748b] border-b border-[#212c3d] mb-1">
                Select Persona Role
              </div>
              {(['SUPERVISOR', 'EXAMINER'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setUserRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors font-mono text-[11px] ${
                    userRole === r ? 'bg-[#1d4ed8]/20 text-[#60a5fa] font-bold' : 'text-[#94a3b8] hover:bg-[#161e29] hover:text-[#f1f5f9]'
                  }`}
                >
                  <span>{r}</span>
                  {userRole === r && <Check className="w-3 h-3 text-[#60a5fa]" />}
                </button>
              ))}

              <div className="pt-1 mt-1 border-t border-[#212c3d]">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setRoleDropdownOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors font-mono text-[11px] text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                >
                  <span>Sign Out</span>
                  <span className="material-symbols-outlined text-[14px]">logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
