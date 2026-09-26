import React from 'react';
import { Priority } from '@/types';
import { cn } from '@/utils/cn';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const styles: Record<Priority, string> = {
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  return (
    <span
      className={cn(
        'px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded border',
        styles[priority],
        className
      )}
    >
      {priority}
    </span>
  );
};
