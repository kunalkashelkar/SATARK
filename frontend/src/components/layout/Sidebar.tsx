import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  ListFilter, 
  Layers, 
  GitFork, 
  FileSearch, 
  ShieldAlert, 
  History, 
  Users, 
  CheckCircle2, 
  FileText,
  Sliders,
  LogOut,
  Shield
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors',
        isActive
          ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      )
    }
  >
    <div className="flex items-center gap-2.5">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    {badge !== undefined && (
      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
        {badge}
      </span>
    )}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 select-none z-30">
      {/* Platform Branding */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
              SAT-SA
              <span className="text-[10px] px-1 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono">
                SECURE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">NCIIPC SOC Assessment</div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Overview
          </div>
          <NavItem to="/overview" icon={LayoutDashboard} label="Supervisory Overview" />
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Supervision
          </div>
          <div className="space-y-1">
            <NavItem to="/supervision/cses" icon={Building2} label="CSE Assessments" badge="24" />
            <NavItem to="/supervision/priority" icon={ListFilter} label="Priority Queue" badge="6" />
            <NavItem to="/supervision/sampling" icon={Layers} label="Supervisory Sampling" badge="28" />
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Examiner Workspace
          </div>
          <div className="space-y-1">
            <NavItem to="/assessment/findings" icon={ShieldAlert} label="Findings & Signals" badge="17" />
            <NavItem to="/assessment/evidence" icon={FileSearch} label="Evidence Explorer" />
            <NavItem to="/assessment/remediation" icon={CheckCircle2} label="Remediation & Verify" badge="9" />
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Analytics Engines
          </div>
          <div className="space-y-1">
            <NavItem to="/analytics/execution-gaps" icon={GitFork} label="Execution Gaps" badge="31" />
            <NavItem to="/analytics/negative-space" icon={FileSearch} label="Negative Space" badge="14" />
            <NavItem to="/analytics/process" icon={GitFork} label="Process Conformance" />
            <NavItem to="/analytics/evidence-quality" icon={CheckCircle2} label="Evidence Quality" badge="92%" />
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Intelligence
          </div>
          <div className="space-y-1">
            <NavItem to="/intelligence/historical" icon={History} label="Historical Trends" />
            <NavItem to="/intelligence/peer" icon={Users} label="Peer Comparison" />
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Governance
          </div>
          <div className="space-y-1">
            <NavItem to="/governance/audit" icon={FileText} label="Audit Trail" />
            <NavItem to="/governance/administration" icon={Sliders} label="Administration" />
          </div>
        </div>
      </div>

      {/* Air-gap / Environment Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#090d17] text-[11px]">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Air-Gapped Enclave
          </span>
          <span className="font-mono text-[10px] text-slate-500">v0.9.4</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-slate-400">
          <div className="flex flex-col">
            <span className="font-medium text-slate-300">examiner_07</span>
            <span className="text-[10px] text-slate-500">Senior Examiner</span>
          </div>
          <NavLink to="/login" className="p-1 hover:text-rose-400 text-slate-500 transition-colors" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
