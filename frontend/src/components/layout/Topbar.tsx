import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';
import { UserRole } from '@/types';

export const Topbar: React.FC<{ isCollapsed?: boolean; onToggleCollapse?: () => void }> = ({
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { userRole, setUserRole, auditTrail } = useSupervisory();
  const location = useLocation();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Dynamic breadcrumbs based on pathname
  const path = location.pathname;
  const segments = path.split('/').filter(Boolean);

  const getBreadcrumbs = () => {
    if (segments.length === 0 || segments[0] === 'overview') {
      return [{ label: 'Overview', to: '/overview' }];
    }

    const items = [];
    if (segments[0] === 'assessments') {
      items.push({ label: 'Assessments', to: '/assessments' });
      if (segments[1]) {
        items.push({ label: segments[1].toUpperCase(), to: `/assessments/${segments[1]}` });
      }
    } else if (segments[0] === 'review' || segments[0] === 'findings') {
      items.push({ label: 'Review Queue', to: '/review' });
      if (segments[1]) {
        items.push({ label: `Workspace: ${segments[1]}`, to: `/review/${segments[1]}` });
      }
    } else if (segments[0] === 'evidence') {
      items.push({ label: 'Evidence Explorer', to: '/evidence' });
      if (segments[1]) {
        items.push({ label: segments[1], to: `/evidence/${segments[1]}` });
      }
    } else if (segments[0] === 'remediation') {
      items.push({ label: 'Remediation', to: '/remediation' });
      if (segments[1]) {
        items.push({ label: segments[1], to: `/remediation/${segments[1]}` });
      }
    } else if (segments[0] === 'governance') {
      items.push({ label: 'Governance', to: '/governance' });
      if (segments[1]) {
        items.push({ label: segments[1].charAt(0).toUpperCase() + segments[1].slice(1), to: `/governance/${segments[1]}` });
      }
    } else if (segments[0] === 'analysis') {
      items.push({ label: 'Analysis Hub', to: '/analysis' });
      if (segments[1]) {
        items.push({ label: segments[1].replace('-', ' ').toUpperCase(), to: `/analysis/${segments[1]}` });
      }
    } else {
      items.push({ label: segments[0].charAt(0).toUpperCase() + segments[0].slice(1), to: `/${segments[0]}` });
    }
    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header 
      className={`fixed top-0 right-0 h-14 bg-[#1c2026]/95 backdrop-blur-md z-40 px-6 flex items-center justify-between border-b border-[#262a31] transition-all duration-200 ${
        isCollapsed ? 'left-[68px]' : 'left-[250px]'
      }`}
    >
      <div className="flex items-center gap-3">
        {onToggleCollapse && (
          <button 
            type="button" 
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:bg-[#262a31] text-[#8c90a0] hover:text-[#dfe2eb] transition-colors"
            title="Toggle Sidebar"
          >
            <span className="material-symbols-outlined text-[18px]">menu</span>
          </button>
        )}

        {/* Dynamic Contextual Breadcrumbs */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#c2c6d6]">
          <Link to="/overview" className="text-[#afc6ff] font-bold hover:underline">
            SAT-SA
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.to}>
              <span className="text-[#8c90a0]">/</span>
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-[#dfe2eb] font-semibold bg-[#262a31] px-2 py-0.5 rounded">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to} className="text-[#c2c6d6] hover:text-[#afc6ff] transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-[#262a31]">
          <span className="w-2 h-2 rounded-full bg-[#7bdb80] animate-pulse"></span>
          <span className="font-mono text-[10px] text-[#7bdb80] font-medium tracking-wide">
            INTERNAL / AIR-GAPPED (TLS 1.3 / FIPS-140-2)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Audit Sync Counter */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#262a31]">
          <span className="material-symbols-outlined text-[15px] text-[#7bdb80]">verified_user</span>
          <span className="font-mono text-xs text-[#dfe2eb]">Audit Ledger: SYNCED ({auditTrail.length})</span>
        </div>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 pl-2.5 pr-2 py-1 rounded bg-[#262a31] hover:bg-[#323742] transition-colors border border-[#3b414d]"
          >
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold text-[#dfe2eb] leading-tight">
                {userRole === 'SUPERVISOR' && 'Supervisor'}
                {userRole === 'EXAMINER' && 'Lead Examiner'}
                {userRole === 'AUDITOR' && 'Statutory Auditor'}
                {userRole === 'ADMINISTRATOR' && 'Enclave Admin'}
              </span>
              <span className="text-[9px] text-[#7bdb80] leading-tight font-mono uppercase tracking-wider">
                {userRole}
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#1f6feb] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[16px]">
                {userRole === 'SUPERVISOR' ? 'verified' : userRole === 'EXAMINER' ? 'gavel' : userRole === 'AUDITOR' ? 'policy' : 'admin_panel_settings'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[14px] text-[#8c90a0]">arrow_drop_down</span>
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-[#1c2026] border border-[#262a31] rounded-lg shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 border-b border-[#262a31] text-[10px] text-[#8c90a0] uppercase font-mono">
                Switch Active Persona
              </div>
              {(['SUPERVISOR', 'EXAMINER', 'AUDITOR', 'ADMINISTRATOR'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#262a31] transition-colors ${
                    userRole === r ? 'text-[#afc6ff] font-bold bg-[#181c22]' : 'text-[#dfe2eb]'
                  }`}
                  onClick={() => {
                    setUserRole(r);
                    setRoleDropdownOpen(false);
                  }}
                >
                  <span>{r === 'SUPERVISOR' ? 'Supervisor (Strategic)' : r === 'EXAMINER' ? 'Examiner (Adjudication)' : r === 'AUDITOR' ? 'Auditor (Provenance)' : 'Administrator (Config)'}</span>
                  {userRole === r && (
                    <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
