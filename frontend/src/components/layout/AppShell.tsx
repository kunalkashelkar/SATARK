import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useSupervisory } from '@/context/SupervisoryContext';

import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export const AppShell: React.FC = () => {
  const { isAuthenticated } = useSupervisory();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-[#0c1017] text-[#f1f5f9] flex font-sans antialiased">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      <div 
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-200 ${
          isCollapsed ? 'pl-[68px]' : 'pl-[250px]'
        }`}
      >
        <Topbar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
        <main className="w-full pt-14 pb-8 bg-[#0c1017] flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 pt-2.5 pb-0.5">
            <Breadcrumbs />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
