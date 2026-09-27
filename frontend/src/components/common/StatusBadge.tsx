import React from 'react';
import { cn } from '@/utils/cn';

export type BadgeCategory = 'priority' | 'evidence' | 'finding' | 'remediation' | 'general';

interface StatusBadgeProps {
  status: string;
  category?: BadgeCategory;
  className?: string;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  category,
  className,
  dot = false,
}) => {
  const norm = (status || '').toUpperCase().trim();

  // Color mapping based on status tokens
  let style = 'bg-[#262a31] text-[#dfe2eb] border-[#3b414d]';
  let dotColor = 'bg-[#8c90a0]';

  // Priority
  if (norm === 'CRITICAL') {
    style = 'bg-rose-500/15 text-rose-300 border-rose-500/40';
    dotColor = 'bg-rose-400';
  } else if (norm === 'HIGH') {
    style = 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    dotColor = 'bg-amber-400';
  } else if (norm === 'MEDIUM') {
    style = 'bg-blue-500/15 text-blue-300 border-blue-500/40';
    dotColor = 'bg-blue-400';
  } else if (norm === 'LOW') {
    style = 'bg-slate-500/15 text-slate-300 border-slate-500/40';
    dotColor = 'bg-slate-400';
  }

  // Evidence
  else if (norm === 'PRESENT' || norm === 'VERIFIED') {
    style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    dotColor = 'bg-emerald-400';
  } else if (norm === 'ABSENT_CONFIRMED' || norm === 'ABSENT' || norm === 'MISSING') {
    style = 'bg-rose-500/15 text-rose-300 border-rose-500/40';
    dotColor = 'bg-rose-400';
  } else if (norm === 'NOT_SUBMITTED' || norm === 'PENDING') {
    style = 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    dotColor = 'bg-amber-400';
  } else if (norm === 'NOT_APPLICABLE' || norm === 'N/A') {
    style = 'bg-slate-600/15 text-slate-400 border-slate-600/40';
    dotColor = 'bg-slate-400';
  } else if (norm === 'UNKNOWN') {
    style = 'bg-purple-500/15 text-purple-300 border-purple-500/40';
    dotColor = 'bg-purple-400';
  }

  // Finding Status
  else if (norm === 'VALIDATED') {
    style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    dotColor = 'bg-emerald-400';
  } else if (norm === 'UNDER REVIEW' || norm === 'UNDER_REVIEW') {
    style = 'bg-blue-500/15 text-blue-300 border-blue-500/40';
    dotColor = 'bg-blue-400';
  } else if (norm === 'QUALIFIED') {
    style = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
    dotColor = 'bg-cyan-400';
  } else if (norm === 'CANDIDATE') {
    style = 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    dotColor = 'bg-amber-400';
  } else if (norm === 'REJECTED') {
    style = 'bg-slate-600/20 text-slate-400 border-slate-600/40';
    dotColor = 'bg-slate-500';
  } else if (norm === 'OVERRIDDEN') {
    style = 'bg-purple-500/15 text-purple-300 border-purple-500/40';
    dotColor = 'bg-purple-400';
  }

  // Remediation Status
  else if (norm === 'CLOSED') {
    style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    dotColor = 'bg-emerald-400';
  } else if (norm === 'UNDER VERIFICATION' || norm === 'UNDER_VERIFICATION') {
    style = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
    dotColor = 'bg-cyan-400';
  } else if (norm === 'SUBMITTED') {
    style = 'bg-blue-500/15 text-blue-300 border-blue-500/40';
    dotColor = 'bg-blue-400';
  } else if (norm === 'IN PROGRESS' || norm === 'IN_PROGRESS') {
    style = 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    dotColor = 'bg-amber-400';
  } else if (norm === 'OPEN') {
    style = 'bg-rose-500/15 text-rose-300 border-rose-500/40';
    dotColor = 'bg-rose-400';
  } else if (norm === 'REOPENED') {
    style = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    dotColor = 'bg-rose-500';
  }

  // Display label formatting: replace underscore with space
  const label = norm.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium font-mono uppercase tracking-wider rounded border leading-tight shrink-0 select-none',
        style,
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />}
      <span>{label}</span>
    </span>
  );
};
