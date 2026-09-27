import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { UserRole } from '@/types';
import { AUTHORITATIVE_ENGINES } from '@/data/mock/analysis';

interface NavItemProps {
  to: string;
  iconName: string;
  label: string;
  badge?: string | number;
  badgeColor?: string;
  collapsed?: boolean;
  isFocusedRole?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ 
  to, 
  iconName, 
  label, 
  badge, 
  badgeColor = 'bg-[#7f1d1d]/40 text-[#fecaca] border border-[#ef4444]/40',
  collapsed = false,
  isFocusedRole = false
}) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/overview' && location.pathname.startsWith(to));

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={
        `flex items-center justify-between px-2.5 py-1.5 rounded font-sans text-[12px] transition-colors group select-none ${
          isActive
            ? 'bg-[#1d4ed8]/20 text-[#60a5fa] font-semibold border-l-2 border-[#3b82f6]'
            : isFocusedRole 
            ? 'text-[#cbd5e1] hover:bg-[#161e29] hover:text-[#f1f5f9]'
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
};

export const Sidebar: React.FC<{ isCollapsed?: boolean; onToggleCollapse?: () => void }> = ({
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { metrics, userRole, setUserRole } = useSupervisory();
  const location = useLocation();

  // Role-aware primary focus mappings (Section 2)
  const isSupervisor = userRole === 'SUPERVISOR';
  const isExaminer = userRole === 'EXAMINER';

  // Analysis Hub expandable state: auto-expand if on an analysis route, or user toggle
  const isAnalysisRoute = location.pathname.startsWith('/analysis');
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState<boolean>(() => {
    return isAnalysisRoute;
  });

  // Automatically expand if navigated into /analysis routes
  useEffect(() => {
    if (isAnalysisRoute) {
      setIsAnalysisExpanded(true);
    }
  }, [isAnalysisRoute]);

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

      {/* Primary Navigation System (Strictly Section 3 & PART 24 Navigation Structure) */}
      <nav className="flex-1 px-2 py-2 flex flex-col gap-0.5 text-[12px]">
        {/* SECTION 1: OVERVIEW */}
        <NavItem 
          to="/overview" 
          iconName="dashboard" 
          label="Overview" 
          collapsed={isCollapsed} 
          isFocusedRole={isSupervisor}
        />

        {/* SECTION 2: SUPERVISION */}
        {!isCollapsed && (
          <div className="px-2 pt-2.5 pb-0.5 text-[10px] uppercase text-[#64748b] font-semibold tracking-wider font-mono">
            Supervision
          </div>
        )}
        <NavItem 
          to="/supervision/cses" 
          iconName="domain_verification" 
          label="CSE Assessments" 
          badge={metrics.csesAssessed}
          badgeColor="bg-[#161e29] text-[#93c5fd] border border-[#212c3d]"
          collapsed={isCollapsed} 
          isFocusedRole={isSupervisor}
        />
        <NavItem 
          to="/review/findings" 
          iconName="assignment_late" 
          label="Review Queue" 
          badge={`${metrics.highPrioritySignals} High`}
          badgeColor="bg-rose-950/40 text-rose-300 border border-rose-500/40"
          collapsed={isCollapsed} 
          isFocusedRole={isSupervisor || isExaminer}
        />
        <NavItem 
          to="/sampling" 
          iconName="filter_list" 
          label="Sampling" 
          badge={`${metrics.csesAssessed} Queued`}
          badgeColor="bg-[#161e29] text-[#38bdf8] border border-[#212c3d]"
          collapsed={isCollapsed} 
          isFocusedRole={isSupervisor}
        />

        {/* SECTION 3: ANALYSIS (Expandable Analysis Hub Parent with 10 Engines) */}
        {!isCollapsed && (
          <div className="px-2 pt-2.5 pb-0.5 text-[10px] uppercase text-[#64748b] font-semibold tracking-wider font-mono">
            Analysis
          </div>
        )}
        <div>
          <div className="flex items-center">
            <NavLink
              to="/analysis"
              title={isCollapsed ? "Analysis Hub" : undefined}
              onClick={() => {
                if (!isAnalysisExpanded) setIsAnalysisExpanded(true);
              }}
              className={({ isActive }) =>
                `flex-1 flex items-center justify-between px-2.5 py-1.5 rounded font-sans text-[12px] transition-colors group select-none ${
                  location.pathname === '/analysis'
                    ? 'bg-[#1d4ed8]/20 text-[#60a5fa] font-semibold border-l-2 border-[#3b82f6]'
                    : isAnalysisRoute
                    ? 'text-[#60a5fa] font-medium'
                    : 'text-[#94a3b8] hover:bg-[#161e29] hover:text-[#f1f5f9]'
                }`
              }
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-[17px] shrink-0 text-[#64748b] group-hover:text-[#94a3b8]">
                  analytics
                </span>
                {!isCollapsed && <span className="truncate">Analysis Hub</span>}
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold tracking-tight bg-[#161e29] text-[#cbd5e1] border border-[#212c3d]">
                    10
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsAnalysisExpanded(!isAnalysisExpanded);
                    }}
                    className="p-0.5 rounded hover:bg-[#212c3d] text-[#64748b] hover:text-[#f1f5f9] transition-colors"
                    title={isAnalysisExpanded ? "Collapse engines" : "Expand 10 engines"}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isAnalysisExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                </div>
              )}
            </NavLink>
          </div>

          {/* Child 10 Engines (Visible ONLY when Analysis Hub is expanded) */}
          {!isCollapsed && isAnalysisExpanded && (
            <div className="flex flex-col gap-0.5 pl-3 mt-1 mb-1 border-l border-[#212c3d] ml-3.5">
              {AUTHORITATIVE_ENGINES.map((engine) => {
                const isChildActive = location.pathname === engine.route;
                return (
                  <NavLink
                    key={engine.id}
                    to={engine.route}
                    title={engine.purpose}
                    className={`flex items-center justify-between px-2 py-1 rounded text-[11px] transition-colors group select-none ${
                      isChildActive
                        ? 'bg-[#1d4ed8]/20 text-[#60a5fa] font-medium border-l-2 border-[#3b82f6]'
                        : 'text-[#94a3b8] hover:bg-[#161e29] hover:text-[#f1f5f9]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-mono text-[#64748b] group-hover:text-[#94a3b8]">↳</span>
                      <span className="truncate">{engine.shortName}</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#64748b] px-1 py-0.2 rounded bg-[#0d121c]">
                      {engine.signalCount}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 4: ASSESSMENT */}
        {!isCollapsed && (
          <div className="px-2 pt-2.5 pb-0.5 text-[10px] uppercase text-[#64748b] font-semibold tracking-wider font-mono">
            Assessment
          </div>
        )}
        <NavItem 
          to="/review/findings" 
          iconName="assignment" 
          label="Findings" 
          badge={metrics.openFindings}
          badgeColor="bg-[#161e29] text-[#93c5fd] border border-[#212c3d]"
          collapsed={isCollapsed} 
          isFocusedRole={isExaminer}
        />
        <NavItem 
          to="/evidence" 
          iconName="inventory_2" 
          label="Evidence Explorer" 
          badge={`${metrics.evidenceReadiness}%`}
          badgeColor="bg-[#161e29] text-[#10b981] border border-[#212c3d]"
          collapsed={isCollapsed} 
          isFocusedRole={isExaminer}
        />

        {/* SECTION 5: REMEDIATION */}
        {!isCollapsed && (
          <div className="px-2 pt-2.5 pb-0.5 text-[10px] uppercase text-[#64748b] font-semibold tracking-wider font-mono">
            Remediation
          </div>
        )}
        <NavItem 
          to="/remediation" 
          iconName="published_with_changes" 
          label="Remediation" 
          badge={metrics.openRemediation}
          badgeColor="bg-[#161e29] text-amber-400 border border-[#212c3d]"
          collapsed={isCollapsed} 
          isFocusedRole={isExaminer}
        />

        {/* SECTION 6: GOVERNANCE */}
        {!isCollapsed && (
          <div className="px-2 pt-2.5 pb-0.5 text-[10px] uppercase text-[#64748b] font-semibold tracking-wider font-mono">
            Governance
          </div>
        )}
        <NavItem 
          to="/governance" 
          iconName="gavel" 
          label="Governance" 
          badge="Ledger"
          badgeColor="bg-[#161e29] text-[#7bdb80] border border-[#212c3d]"
          collapsed={isCollapsed} 
          isFocusedRole={isSupervisor}
        />
      </nav>

      {/* Bottom Area: User Profile, Role Selector, Enclave Indicator (Section 2, 3 & 21) */}
      <div className="p-2.5 bg-[#0d121c] border-t border-[#212c3d] text-[10px] text-[#64748b] flex flex-col gap-1.5 font-mono">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[#f1f5f9] font-semibold">NC-8802 (Lead)</span>
              {/* Role Switcher */}
              <select
                aria-label="Active Supervisory Role"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="text-[9px] text-[#10b981] bg-[#111622] px-1.5 py-0.5 rounded border border-[#212c3d] font-mono cursor-pointer focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="SUPERVISOR">SUPERVISOR</option>
                <option value="EXAMINER">EXAMINER</option>
              </select>
            </div>
            <div className="text-[9px] text-[#94a3b8] flex items-center gap-1.5 pt-0.5 border-t border-[#212c3d]/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shrink-0 animate-pulse" />
              <span className="truncate">SECURE ENCLAVE • OFFLINE</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" title="SECURE ENCLAVE • OFFLINE" />
            <span className="text-[9px] text-[#60a5fa]">{userRole.slice(0, 3)}</span>
          </div>
        )}
      </div>
    </aside>
  );
};
