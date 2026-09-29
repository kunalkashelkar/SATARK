import React from 'react';
import { cn } from '@/utils/cn';
import { Card } from './Card';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Priority } from '@/types';

interface SignalCardProps {
  code: string;
  title: string;
  description?: string;
  severity?: Priority | string;
  category?: string;
  score?: number | string;
  controlId?: string;
  evidenceCount?: number | string;
  timestamp?: string;
  cseName?: string;
  actions?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({
  code,
  title,
  description,
  severity,
  category,
  score,
  controlId,
  evidenceCount,
  timestamp,
  cseName,
  actions,
  className,
  onClick,
}) => {
  return (
    <Card
      dense
      interactive={!!onClick}
      onClick={onClick}
      className={cn('flex flex-col justify-between gap-2.5', className)}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-[10px] font-semibold text-[#60a5fa] bg-[#3b82f6]/10 px-1.5 py-0.5 rounded border border-[#3b82f6]/30 shrink-0">
              {code}
            </span>
            {category && (
              <span className="text-[10px] font-mono uppercase text-[#64748b] truncate">
                {category}
              </span>
            )}
          </div>
          {severity && (
            ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(severity.toUpperCase()) ? (
              <PriorityBadge priority={severity.toUpperCase() as Priority} />
            ) : (
              <StatusBadge status={severity} />
            )
          )}
        </div>

        <h4 className="text-[13px] font-semibold text-[#f1f5f9] leading-snug line-clamp-2">
          {title}
        </h4>

        {description && (
          <p className="text-[12px] text-[#94a3b8] leading-normal line-clamp-2">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#212c3d] text-[11px] font-mono text-[#64748b]">
        <div className="flex items-center gap-3 truncate">
          {score !== undefined && (
            <span>Score: <strong className="text-[#f1f5f9] font-semibold">{score}</strong></span>
          )}
          {controlId && (
            <span>Control: <strong className="text-[#cbd5e1]">{controlId}</strong></span>
          )}
          {evidenceCount !== undefined && (
            <span>Evidence: <strong className="text-[#60a5fa]">{evidenceCount}</strong></span>
          )}
          {cseName && <span className="text-[#94a3b8]">{cseName}</span>}
          {timestamp && <span>{timestamp}</span>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </Card>
  );
};
