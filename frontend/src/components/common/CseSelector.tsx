import React from 'react';
import { useSupervisory } from '@/context/SupervisoryContext';
import { Building2, ChevronDown } from 'lucide-react';

interface CseSelectorProps {
  value: string;
  onChange: (cseId: string) => void;
  includeAllOption?: boolean;
  allLabel?: string;
  sizeVariant?: 'sm' | 'md';
  className?: string;
  label?: string;
}

export const CseSelector: React.FC<CseSelectorProps> = ({
  value,
  onChange,
  includeAllOption = false,
  allLabel = 'All Entities (Cross-Sector Portfolio)',
  sizeVariant = 'sm',
  className = '',
  label
}) => {
  const { cses } = useSupervisory();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-[11px] font-mono uppercase tracking-wider text-[#8c90a0] flex items-center gap-1.5">
          <Building2 className="w-3 h-3 text-[#afc6ff]" />
          <span>{label}</span>
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-md bg-[#14181f] border border-[#262a31] text-[#dfe2eb] font-sans transition-colors focus:outline-none focus:border-[#afc6ff] cursor-pointer pr-8 ${
            sizeVariant === 'sm' ? 'py-1.5 px-2.5 text-[12px]' : 'py-2 px-3 text-[13px]'
          }`}
        >
          {includeAllOption && (
            <option value="ALL" className="bg-[#14181f] text-[#afc6ff] font-semibold">
              {allLabel}
            </option>
          )}
          {cses.map((c) => (
            <option key={c.cseId} value={c.cseId} className="bg-[#14181f] text-[#dfe2eb]">
              {c.cseId} — {c.cseName} ({c.sector})
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8c90a0]">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
