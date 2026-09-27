import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-[#10141a] text-[#dfe2eb] flex font-sans antialiased">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      <div 
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-200 ${
          isCollapsed ? 'pl-[68px]' : 'pl-[250px]'
        }`}
      >
        <Topbar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
        <main className="w-full pt-14 pb-8 bg-[#10141a] flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
