import React from 'react';

interface TopbarProps {
  section?: string;
  page?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  section = "Supervision", 
  page = "CSE Assessments" 
}) => {
  return (
    <header className="fixed top-0 left-[250px] right-0 h-14 bg-[#1c2026]/95 backdrop-blur-md z-40 px-6 flex items-center justify-between border-b border-[#262a31]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#c2c6d6]">
          <span className="text-[#afc6ff] font-semibold">SAT-SA</span>
          <span className="text-[#8c90a0]">/</span>
          <span>{section}</span>
          {page && (
            <>
              <span className="text-[#8c90a0]">/</span>
              <span className="text-[#dfe2eb] font-medium">{page}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#262a31]">
          <span className="w-2 h-2 rounded-full bg-[#7bdb80] animate-pulse"></span>
          <span className="font-mono text-[11px] text-[#7bdb80] font-medium tracking-wide">
            INTERNAL / AIR-GAPPED (TLS 1.3 / FIPS-140-2)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#262a31]">
          <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">verified_user</span>
          <span className="font-mono text-xs text-[#dfe2eb]">Audit: SYNCED</span>
        </div>

        <button 
          type="button"
          className="relative p-1.5 rounded hover:bg-[#262a31] transition-colors text-[#c2c6d6] hover:text-[#dfe2eb]"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#afc6ff]"></span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-[#262a31]">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-[#dfe2eb] leading-tight">Supervisor</span>
            <span className="text-[10px] text-[#c2c6d6] leading-tight uppercase tracking-wider font-semibold">NCIIPC</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#afc6ff] flex items-center justify-center text-[#002d6d]">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
