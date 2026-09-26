import React from 'react';
import { EvidenceStatus } from '@/types';
import { cn } from '@/utils/cn';

interface EvidenceStatusBadgeProps {
  status: EvidenceStatus;
  className?: string;
}

export const EvidenceStatusBadge: React.FC<EvidenceStatusBadgeProps> = ({ status, className }) => {
  const styles: Record<EvidenceStatus, { text: string; label: string }> = {
    PRESENT: { text: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'PRESENT' },
    ABSENT_CONFIRMED: { text: 'bg-rose-500/10 text-rose-400 border-rose-500/30', label: 'ABSENT CONFIRMED' },
    NOT_SUBMITTED: { text: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'NOT SUBMITTED' },
    NOT_APPLICABLE: { text: 'bg-slate-500/10 text-slate-400 border-slate-500/30', label: 'NOT APPLICABLE' },
    UNKNOWN: { text: 'bg-purple-500/10 text-purple-400 border-purple-500/30', label: 'UNKNOWN' },
  };

  const current = styles[status] || styles.UNKNOWN;

  return (
    <span
      className={cn(
        'px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded border',
        current.text,
        className
      )}
    >
      {current.label}
    </span>
  );
};
