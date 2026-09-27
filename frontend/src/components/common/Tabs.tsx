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
        'flex items-center gap-1 border-b border-[#262a31] overflow-x-auto min-w-0 py-1 select-none',
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
              'flex items-center gap-2 px-3 py-1.5 text-[12px] md:text-[13px] font-medium rounded-t transition-colors relative shrink-0',
              isActive
                ? 'text-[#afc6ff] bg-[#1c2026] border-b-2 border-[#1f6feb]'
                : 'text-[#8c90a0] hover:text-[#dfe2eb] hover:bg-[#181c22]'
            )}
          >
            {tab.icon && <span className="inline-flex shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold leading-tight',
                  isActive ? 'bg-[#1f6feb]/20 text-[#afc6ff]' : 'bg-[#262a31] text-[#8c90a0]'
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
