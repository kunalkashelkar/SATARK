import React, { useState } from 'react';
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
  badgeColor = 'bg-[#93000a] text-[#ffdad6]',
  collapsed = false
}) => (
  <NavLink
    to={to}
    title={collapsed ? label : undefined}
    className={({ isActive }) =>
      `flex items-center justify-between px-3 py-2 rounded font-sans text-xs transition-colors group ${
        isActive
          ? 'bg-[#1f6feb] text-white font-semibold shadow-sm'
          : 'text-[#c2c6d6] hover:bg-[#1c2026] hover:text-[#dfe2eb]'
      }`
    }
  >
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="material-symbols-outlined text-[18px] shrink-0">{iconName}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </div>
    {!collapsed && badge !== undefined && (
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight ${badgeColor}`}>
        {badge}
      </span>
    )}
  </NavLink>
);

export const Sidebar: React.FC<{ isCollapsed?: boolean; onToggleCollapse?: () => void }> = ({
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { metrics } = useSupervisory();

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#181c22] border-r border-[#262a31] flex flex-col z-50 overflow-y-auto select-none transition-all duration-200 ${
        isCollapsed ? 'w-[68px]' : 'w-[250px]'
      }`}
    >
      {/* Brand Header */}
      <div className="p-3.5 pb-2.5 bg-[#1c2026] border-b border-[#262a31]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7bdb80] animate-pulse"></div>
            {!isCollapsed && (
              <span className="text-[10px] uppercase text-[#dfe2eb] tracking-wider font-bold truncate">
                Govt of India / NCIIPC
              </span>
            )}
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded text-[#8c90a0] hover:text-[#dfe2eb] hover:bg-[#262a31] transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <div className="text-xl text-[#afc6ff] tracking-tight font-bold font-mono">
            SAT-SA
          </div>
          {!isCollapsed && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#262a31] text-[#7bdb80] font-mono font-semibold">
              v4.8
            </span>
          )}
        </div>
        {!isCollapsed && (
          <div className="text-[11px] text-[#8c90a0] leading-tight mt-0.5">
            Supervisory Analytics Tool
          </div>
        )}
      </div>

      {/* Streamlined Primary Navigation Groups (6 items total) */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-1">
        {/* 1. OVERVIEW */}
        {!isCollapsed && (
          <div className="px-3 pt-1 pb-1 text-[10px] uppercase text-[#8c90a0] font-semibold tracking-wider font-mono">
            Supervisory Portfolio
          </div>
        )}
        <NavItem 
          to="/overview" 
          iconName="dashboard" 
          label="Overview" 
          collapsed={isCollapsed} 
        />

        {/* 2. SUPERVISION */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1 text-[10px] uppercase text-[#8c90a0] font-semibold tracking-wider font-mono">
            Supervision &amp; Queue
          </div>
        )}
        <NavItem 
          to="/assessments" 
          iconName="domain_verification" 
          label="Assessments" 
          badge={metrics.csesAssessed}
          badgeColor="bg-[#262a31] text-[#afc6ff]"
          collapsed={isCollapsed} 
        />
        <NavItem 
          to="/review" 
          iconName="assignment_late" 
          label="Review Queue" 
          badge={`${metrics.highPrioritySignals} High`}
          badgeColor="bg-[#93000a] text-[#ffdad6]"
          collapsed={isCollapsed} 
        />

        {/* 3. EVIDENCE */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1 text-[10px] uppercase text-[#8c90a0] font-semibold tracking-wider font-mono">
            Evidence Vault
          </div>
        )}
        <NavItem 
          to="/evidence" 
          iconName="inventory_2" 
          label="Evidence Explorer" 
          badge={`${metrics.evidenceReadiness}%`}
          badgeColor="bg-[#262a31] text-[#7bdb80]"
          collapsed={isCollapsed} 
        />

        {/* 4. REMEDIATION */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1 text-[10px] uppercase text-[#8c90a0] font-semibold tracking-wider font-mono">
            Corrective Action
          </div>
        )}
        <NavItem 
          to="/remediation" 
          iconName="published_with_changes" 
          label="Remediation" 
          badge={metrics.openRemediation}
          badgeColor="bg-[#262a31] text-[#eab308]"
          collapsed={isCollapsed} 
        />

        {/* 5. GOVERNANCE */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1 text-[10px] uppercase text-[#8c90a0] font-semibold tracking-wider font-mono">
            Governance
          </div>
        )}
        <NavItem 
          to="/governance" 
          iconName="policy" 
          label="Governance &amp; Audit" 
          collapsed={isCollapsed} 
        />

        {/* 6. GROUPED ANALYSIS (Secondary Hub) */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1 text-[10px] uppercase text-[#8c90a0] font-semibold tracking-wider font-mono flex items-center justify-between">
            <span>Analytics Hub</span>
            <span className="text-[9px] text-[#afc6ff] uppercase font-mono">Grouped</span>
          </div>
        )}
        <NavItem 
          to="/analysis" 
          iconName="analytics" 
          label="Analysis Engines" 
          badge="8 Models"
          badgeColor="bg-[#262a31] text-[#8c90a0]"
          collapsed={isCollapsed} 
        />
      </nav>

      {/* Footer Enclave Status */}
      <div className="p-3 bg-[#0a0e14] border-t border-[#262a31] text-[10px] text-[#8c90a0] flex flex-col gap-1 font-mono">
        <div className="flex items-center justify-between">
          <span className="truncate">{isCollapsed ? 'NC' : 'SYS-ID: NC-4029'}</span>
          <span className="w-2 h-2 rounded-full bg-[#7bdb80]" title="FIPS 140-2 Air-gapped enclave synced"></span>
        </div>
        {!isCollapsed && (
          <div className="text-[9px] text-[#5b6070] flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-[#7bdb80]">lock</span>
            <span>AIR-GAPPED TLS 1.3</span>
          </div>
        )}
      </div>
    </aside>
  );
};
