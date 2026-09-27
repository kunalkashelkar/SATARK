import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  overview: 'Overview',
  supervision: 'Supervision',
  cses: 'CSE Assessments',
  assessments: 'CSE Assessments',
  review: 'Review Queue',
  findings: 'Findings',
  examiner: 'Examiner Workspace',
  evidence: 'Evidence Vault',
  sampling: 'Supervisory Sampling',
  remediation: 'Remediation',
  verification: 'Verification Gates',
  governance: 'Governance',
  audit: 'Audit Ledger',
  admin: 'Administration',
  administration: 'Administration',
  analysis: 'Analysis Engines',
  'execution-gap': 'Execution Gap',
  'negative-space': 'Negative Space',
  process: 'Process Analysis',
  'evidence-quality': 'Evidence Quality',
  behaviour: 'Behavioural Analysis',
  behavioural: 'Behavioural Analysis',
  coverage: 'Coverage Void',
  consistency: 'Consistency',
  historical: 'Historical Intelligence',
  peer: 'Peer Cohort',
  capability: 'Capability Discrepancy',
  graph: 'Evidence Graph'
};

export const Breadcrumbs: React.FC<{ customTrail?: Array<{ label: string; to?: string }> }> = ({ 
  customTrail 
}) => {
  const location = useLocation();

  if (location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  // If a custom trail is provided, render it
  if (customTrail && customTrail.length > 0) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-mono text-[#8c90a0] mb-2 select-none">
        <Link to="/overview" className="hover:text-[#60a5fa] transition-colors flex items-center gap-1">
          <Home className="w-3 h-3 text-[#64748b]" />
          <span>Home</span>
        </Link>
        {customTrail.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-[#3a4454] shrink-0" />
            {item.to && idx < customTrail.length - 1 ? (
              <Link to={item.to} className="hover:text-[#60a5fa] transition-colors truncate max-w-[150px]">
                {item.label}
              </Link>
            ) : (
              <span className="text-[#f1f5f9] font-semibold truncate max-w-[200px]">
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  // Derive trail from current location pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  let currentPath = '';

  const trail = pathParts.map((part) => {
    currentPath += `/${part}`;
    const label = ROUTE_LABELS[part.toLowerCase()] || part.toUpperCase();
    return { label, to: currentPath };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-mono text-[#8c90a0] mb-2 select-none">
      <Link to="/overview" className="hover:text-[#60a5fa] transition-colors flex items-center gap-1">
        <Home className="w-3 h-3 text-[#64748b]" />
        <span>SAT-SA</span>
      </Link>
      {trail.map((item, idx) => {
        const isLast = idx === trail.length - 1;
        return (
          <React.Fragment key={item.to}>
            <ChevronRight className="w-3 h-3 text-[#3a4454] shrink-0" />
            {!isLast ? (
              <Link to={item.to} className="hover:text-[#60a5fa] transition-colors truncate max-w-[150px]">
                {item.label}
              </Link>
            ) : (
              <span className="text-[#f1f5f9] font-semibold truncate max-w-[220px]">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
