import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  to: string;
  iconName: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, iconName, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-1.5 rounded font-sans text-xs transition-colors ${
        isActive
          ? 'bg-[#1f6feb] text-white font-semibold'
          : 'text-[#c2c6d6] hover:bg-[#1c2026] hover:text-[#dfe2eb]'
      }`
    }
  >
    <span className="material-symbols-outlined text-[16px]">{iconName}</span>
    <span>{label}</span>
  </NavLink>
);

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[250px] bg-[#181c22] border-r border-[#262a31] flex flex-col z-50 overflow-y-auto select-none">
      {/* Brand Header */}
      <div className="p-4 pb-2 bg-[#1c2026] border-b border-[#262a31]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#7bdb80] animate-pulse"></div>
          <span className="text-[11px] uppercase text-[#dfe2eb] tracking-wider font-bold">
            Govt of India / NCIIPC
          </span>
        </div>
        <div className="text-xl text-[#afc6ff] tracking-tight font-bold font-mono">
          SAT-SA
        </div>
        <div className="text-xs text-[#c2c6d6]">
          Supervisory Analytics Tool
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-2 py-2 flex flex-col gap-1">
        {/* OVERVIEW */}
        <div className="px-3 pt-2 pb-1 text-[11px] uppercase text-[#8c90a0] font-semibold tracking-wider">
          Overview
        </div>
        <NavItem to="/overview" iconName="dashboard" label="Overview" />

        {/* SUPERVISION */}
        <div className="px-3 pt-3 pb-1 text-[11px] uppercase text-[#8c90a0] font-semibold tracking-wider">
          Supervision
        </div>
        <NavItem to="/supervision/cse-assessments" iconName="domain_verification" label="CSE Assessments" />
        <NavItem to="/supervision/priority-queue" iconName="low_priority" label="Priority Queue" />
        <NavItem to="/supervision/sampling" iconName="fact_check" label="Recommended Samples" />

        {/* ANALYTICS */}
        <div className="px-3 pt-3 pb-1 text-[11px] uppercase text-[#8c90a0] font-semibold tracking-wider">
          Analytics
        </div>
        <NavItem to="/analytics/execution-gaps" iconName="rule_folder" label="Execution Gaps" />
        <NavItem to="/analytics/negative-space" iconName="contrast" label="Negative Space" />
        <NavItem to="/analytics/process-analysis" iconName="account_tree" label="Process Analysis" />
        <NavItem to="/analytics/evidence-quality" iconName="verified" label="Evidence Quality" />
        <NavItem to="/analytics/behavioural-analysis" iconName="psychology" label="Behavioural Analysis" />
        <NavItem to="/analytics/coverage" iconName="radar" label="Coverage" />
        <NavItem to="/analytics/consistency" iconName="stacked_line_chart" label="Consistency" />

        {/* ASSESSMENT */}
        <div className="px-3 pt-3 pb-1 text-[11px] uppercase text-[#8c90a0] font-semibold tracking-wider">
          Assessment
        </div>
        <NavItem to="/findings" iconName="warning" label="Findings" />
        <NavItem to="/evidence" iconName="inventory" label="Evidence" />
        <NavItem to="/remediation" iconName="published_with_changes" label="Remediation" />
        <NavItem to="/verification" iconName="security" label="Verification" />

        {/* INTELLIGENCE */}
        <div className="px-3 pt-3 pb-1 text-[11px] uppercase text-[#8c90a0] font-semibold tracking-wider">
          Intelligence
        </div>
        <NavItem to="/analytics/historical-intelligence" iconName="timeline" label="Historical Trends" />
        <NavItem to="/analytics/peer-comparison" iconName="compare_arrows" label="Peer Comparison" />
        <NavItem to="/intelligence/signal-discovery" iconName="bubble_chart" label="Signal Discovery" />

        {/* GOVERNANCE */}
        <div className="px-3 pt-3 pb-1 text-[11px] uppercase text-[#8c90a0] font-semibold tracking-wider">
          Governance
        </div>
        <NavItem to="/governance/audit" iconName="policy" label="Audit" />
        <NavItem to="/governance/administration" iconName="admin_panel_settings" label="Administration" />
      </nav>

      {/* Footer Enclave Status */}
      <div className="p-3 bg-[#0a0e14] border-t border-[#262a31] text-[11px] text-[#8c90a0] flex items-center justify-between font-mono">
        <span>SYS-ID: NC-4029</span>
        <span className="w-2 h-2 rounded-full bg-[#7bdb80]"></span>
      </div>
    </aside>
  );
};
