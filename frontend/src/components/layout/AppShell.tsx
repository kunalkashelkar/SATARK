import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell: React.FC = () => {
  const location = useLocation();

  // Determine section and page labels based on current route
  const path = location.pathname;
  let section = "Overview";
  let page = "";

  if (path.startsWith('/supervision')) {
    section = "Supervision";
    if (path.includes('cse-assessments')) page = "CSE Assessments";
    else if (path.includes('priority-queue')) page = "Priority Queue";
    else if (path.includes('sampling')) page = "Recommended Samples";
  } else if (path.startsWith('/analytics')) {
    section = "Analytics";
    if (path.includes('execution-gaps')) page = "Execution Gaps";
    else if (path.includes('negative-space')) page = "Negative Space";
    else if (path.includes('process-analysis')) page = "Process Analysis";
    else if (path.includes('evidence-quality')) page = "Evidence Quality";
    else if (path.includes('behavioural-analysis')) page = "Behavioural Analysis";
    else if (path.includes('coverage')) page = "Coverage";
    else if (path.includes('consistency')) page = "Consistency";
    else if (path.includes('historical-intelligence')) page = "Historical Trends";
    else if (path.includes('peer-comparison')) page = "Peer Comparison";
  } else if (path.startsWith('/findings')) {
    section = "Assessment";
    page = path.split('/')[2] ? `Finding ${path.split('/')[2]}` : "Findings";
  } else if (path.startsWith('/evidence')) {
    section = "Assessment";
    page = "Evidence";
  } else if (path.startsWith('/remediation')) {
    section = "Assessment";
    page = "Remediation";
  } else if (path.startsWith('/verification')) {
    section = "Assessment";
    page = "Verification";
  } else if (path.startsWith('/intelligence')) {
    section = "Intelligence";
    page = "Signal Discovery";
  } else if (path.startsWith('/governance')) {
    section = "Governance";
    page = path.includes('audit') ? "Audit" : "Administration";
  }

  return (
    <div className="min-h-screen bg-[#10141a] text-[#dfe2eb] flex font-sans antialiased">
      <Sidebar />
      <div className="pl-[250px] flex-1 flex flex-col min-h-screen min-w-0">
        <Topbar section={section} page={page} />
        <main className="w-full pt-14 px-6 bg-[#10141a] flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
