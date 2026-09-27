import React from 'react';
import { cn } from '@/utils/cn';

interface FilterBarProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, actions, className }) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#181c22] border border-[#262a31] min-w-0',
        className
      )}
    >
      <div className="flex items-center gap-2.5 flex-wrap min-w-0 flex-1">{children}</div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">{actions}</div>
      )}
    </div>
  );
};
