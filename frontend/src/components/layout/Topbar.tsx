import React from 'react';
import { Bell, Search, ShieldCheck } from 'lucide-react';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  title = "Supervisory Overview", 
  subtitle = "National Critical Information Infrastructure Protection Centre (NCIIPC)" 
}) => {
  return (
    <header className="h-14 bg-[#0d1322]/80 backdrop-blur border-b border-slate-800/80 sticky top-0 z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            {title}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Evidence / Finding Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search CSE, Finding, Control..."
            className="w-full bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Environment Status Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] text-slate-300 font-mono">PKI Valid</span>
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"></span>
        </button>
      </div>
    </header>
  );
};
