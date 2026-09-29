import React from 'react';
import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 border-b border-[#212c3d] overflow-x-auto min-w-0 select-none',
        className
      )}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors relative shrink-0 cursor-pointer border-b-2 -mb-[1px]',
              isActive
                ? 'text-[#60a5fa] border-[#3b82f6] bg-[#131922]/60'
                : 'text-[#94a3b8] border-transparent hover:text-[#f1f5f9] hover:bg-[#131922]/30'
            )}
          >
            {tab.icon && <span className="inline-flex shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold leading-tight',
                  isActive
                    ? 'bg-[#3b82f6]/20 text-[#60a5fa]'
                    : 'bg-[#10151e] border border-[#212c3d] text-[#64748b]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
