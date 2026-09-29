import React from 'react';
import { cn } from '@/utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Priority } from '@/types';

interface ExpectedObservedCardProps {
  title: string;
  expected: string | React.ReactNode;
  observed: string | React.ReactNode;
  difference?: string | React.ReactNode;
  deviation?: string | React.ReactNode;
  signal?: string | React.ReactNode;
  evidence?: string | React.ReactNode;
  priority?: Priority | string;
  category?: string;
  className?: string;
}

export const ExpectedObservedCard: React.FC<ExpectedObservedCardProps> = ({
  title,
  expected,
  observed,
  difference,
  deviation,
  signal,
  evidence,
  priority,
  category,
  className,
}) => {
  const displayDiff = deviation || difference;

  return (
    <Card className={cn('flex flex-col justify-between', className)} dense>
      <CardHeader className="pb-2 mb-2">
        <div className="flex items-center justify-between w-full min-w-0 gap-2">
          <CardTitle className="text-[13px] text-[#f1f5f9]">{title}</CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            {category && (
              <span className="text-[10px] font-mono uppercase bg-[#10151e] border border-[#212c3d] text-[#64748b] px-1.5 py-0.5 rounded">
                {category}
              </span>
            )}
            {priority && (
              ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(priority.toUpperCase()) ? (
                <PriorityBadge priority={priority.toUpperCase() as Priority} />
              ) : (
                <StatusBadge status={priority} />
              )
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-[12px]">
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-[#0e141c] border border-[#212c3d]">
          <div>
            <div className="text-[10px] font-mono uppercase font-semibold text-[#64748b] mb-0.5">
              Expected
            </div>
            <div className="text-[#cbd5e1] font-mono text-[12px] leading-tight">{expected}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-semibold text-[#64748b] mb-0.5">
              Observed
            </div>
            <div className="text-[#f1f5f9] font-mono text-[12px] font-medium leading-tight">{observed}</div>
          </div>
        </div>

        {(displayDiff || signal || evidence) && (
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
            {displayDiff && (
              <div>
                <span className="text-[#64748b] font-mono uppercase text-[10px]">Deviation: </span>
                <span className="text-rose-400 font-mono font-semibold">{displayDiff}</span>
              </div>
            )}
            {evidence && (
              <div>
                <span className="text-[#64748b] font-mono uppercase text-[10px]">Evidence: </span>
                <span className="text-[#60a5fa] font-mono font-medium">{evidence}</span>
              </div>
            )}
            {signal && !evidence && (
              <div>
                <span className="text-[#64748b] font-mono uppercase text-[10px]">Signal: </span>
                <span className="text-[#f59e0b] font-mono">{signal}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
