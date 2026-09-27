import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';

interface NavItemProps {
  to: string;
  iconName: string;
  label: string;
  badge?: string | number;
  badgeColor?: string;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ 
  to, 
  iconName, 
  label, 
  badge, 
  badgeColor = 'bg-[#7f1d1d]/40 text-[#fecaca] border border-[#ef4444]/40',
  collapsed = false
}) => (
  <NavLink
    to={to}
    title={collapsed ? label : undefined}
    className={({ isActive }) =>
      `flex items-center justify-between px-2.5 py-1.5 rounded font-sans text-[12px] transition-colors group select-none ${
        isActive
          ? 'bg-[#1d4ed8]/20 text-[#60a5fa] font-semibold border-l-2 border-[#3b82f6]'
          : 'text-[#94a3b8] hover:bg-[#161e29] hover:text-[#f1f5f9]'
      }`
    }
  >
    <div className="flex items-center gap-2 min-w-0">
      <span className="material-symbols-outlined text-[17px] shrink-0 text-[#64748b] group-hover:text-[#94a3b8]">
        {iconName}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </div>
    {!collapsed && badge !== undefined && (
      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold tracking-tight ${badgeColor}`}>
        {badge}
      </span>
    )}
  </NavLink>
);

export const Sidebar: React.FC<{ isCollapsed?: boolean; onToggleCollapse?: () => void }> = ({
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { metrics, userRole } = useSupervisory();

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#111622] border-r border-[#212c3d] flex flex-col z-50 overflow-y-auto select-none transition-all duration-200 ${
        isCollapsed ? 'w-[68px]' : 'w-[250px]'
      }`}
    >
      {/* Brand Header */}
      <div className="p-3 bg-[#0d121c] border-b border-[#212c3d]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            {!isCollapsed && (
              <span className="text-[10px] uppercase text-[#94a3b8] tracking-wider font-semibold font-mono truncate">
                NCIIPC / ENCLAVE-70B
              </span>
            )}
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#161e29] transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <div className="text-[18px] text-[#60a5fa] tracking-tight font-bold font-mono">
            SAT-SA
          </div>
          {!isCollapsed && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#161e29] text-[#10b981] font-mono font-medium border border-[#212c3d]">
              OPS-v4.8
            </span>
          )}
        </div>
        {!isCollapsed && (
          <div className="text-[11px] text-[#64748b] leading-tight font-mono mt-0.5">
            Supervisory Analytics Console
          </div>
        )}
      </div>

      {/* Primary Navigation Sections (adhering strictly to Web Fuzzer layout & Section 3) */}
      <nav className="flex-1 px-2 py-2 flex flex-col gap-0.5 text-[12px]">
        {/* Core Operations */}
        {!isCollapsed && (
          <div className="px-2 pt-1.5 pb-0.5 text-[10px] uppercase text-[#64748b] font-semibold tracking-wider font-mono">
            Operations
          </div>
        )}
        <NavItem 
          to="/overview" 
          iconName="dashboard" 
          label="Dashboard" 
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/assessments" 
          iconName="domain_verification" 
          label="CSE Assessments" 
          badge={metrics.csesAssessed}
          badgeColor="bg-[#161e29] text-[#93c5fd] border border-[#212c3d]"
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/review" 
          iconName="assignment_late" 
          label="Findings" 
          badge={`${metrics.highPrioritySignals} High`}
          badgeColor="bg-rose-950/40 text-rose-300 border border-rose-500/40"
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/graph" 
          iconName="account_tree" 
          label="Evidence Graph" 
          collapsed={isCollapsed} 
        />

        {/* Analytical Engines (Section 3: Gaps, Negative Space, Process, Quality, Sampling, Historical) */}
        {!isCollapsed && (
          <div className="px-2 pt-2.5 pb-0.5 text-[10px] uppercase text-[#64748b] font-semibold tracking-wider font-mono">
            Analytical Engines
          </div>
        )}
        <NavItem 
          to="/analysis/execution-gap" 
          iconName="rule_folder" 
          label="Execution Gaps" 
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/analysis/negative-space" 
          iconName="contrast" 
          label="Negative Space" 
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/analysis/process" 
          iconName="alt_route" 
          label="Process Analysis" 
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/analysis/evidence-quality" 
          iconName="verified" 
          label="Evidence Quality" 
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/sampling" 
          iconName="filter_list" 
          label="Sampling" 
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/analysis/historical" 
          iconName="history" 
          label="Historical Intel" 
          collapsed={isCollapsed} 
        />

        {/* Verification & Governance */}
        {!isCollapsed && (
          <div className="px-2 pt-2.5 pb-0.5 text-[10px] uppercase text-[#64748b] font-semibold tracking-wider font-mono">
            Verification &amp; Audit
          </div>
        )}
        <NavItem 
          to="/evidence" 
          iconName="inventory_2" 
          label="Evidence Vault" 
          badge={`${metrics.evidenceReadiness}%`}
          badgeColor="bg-[#161e29] text-[#10b981] border border-[#212c3d]"
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/remediation" 
          iconName="published_with_changes" 
          label="Remediation" 
          badge={metrics.openRemediation}
          badgeColor="bg-[#161e29] text-amber-400 border border-[#212c3d]"
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/governance/audit" 
          iconName="history_edu" 
          label="Audit Ledger" 
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/governance/admin" 
          iconName="admin_panel_settings" 
          label="Administration" 
          collapsed={isCollapsed} 
        />
      </nav>

      {/* Bottom Area: User Profile, Role, Secure Enclave Indicator (Section 3 & 21) */}
      <div className="p-2.5 bg-[#0d121c] border-t border-[#212c3d] text-[10px] text-[#64748b] flex flex-col gap-1.5 font-mono">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[#f1f5f9] font-semibold">NC-8802 (Lead)</span>
              <span className="text-[9px] text-[#10b981] px-1 rounded bg-[#10b981]/15 border border-[#10b981]/30">
                {userRole}
              </span>
            </div>
            <div className="text-[9px] text-[#94a3b8] flex items-center gap-1.5 pt-0.5 border-t border-[#212c3d]/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shrink-0 animate-pulse" />
              <span className="truncate">SECURE ENCLAVE • OFFLINE</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" title="SECURE ENCLAVE • OFFLINE" />
            <span className="text-[9px]">NC</span>
          </div>
        )}
      </div>
    </aside>
  );
};
