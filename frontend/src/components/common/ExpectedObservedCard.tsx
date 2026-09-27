import React from 'react';
import { cn } from '@/utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { StatusBadge } from './StatusBadge';

interface ExpectedObservedCardProps {
  title: string;
  expected: string | React.ReactNode;
  observed: string | React.ReactNode;
  difference?: string | React.ReactNode;
  signal?: string | React.ReactNode;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
  className?: string;
}

export const ExpectedObservedCard: React.FC<ExpectedObservedCardProps> = ({
  title,
  expected,
  observed,
  difference,
  signal,
  priority,
  category,
  className,
}) => {
  return (
    <Card className={cn('flex flex-col justify-between', className)} dense>
      <CardHeader className="pb-2 mb-2">
        <div className="flex items-center justify-between w-full min-w-0 gap-2">
          <CardTitle className="text-[13px] md:text-[14px] text-[#dfe2eb]">{title}</CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            {category && (
              <span className="text-[10px] font-mono uppercase bg-[#262a31] text-[#8c90a0] px-1.5 py-0.5 rounded">
                {category}
              </span>
            )}
            {priority && <StatusBadge status={priority} />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-[12px] md:text-[13px]">
        <div className="grid grid-cols-2 gap-2 p-2 rounded bg-[#10141a]/60 border border-[#262a31]/50">
          <div>
            <div className="text-[10px] font-mono uppercase font-semibold text-[#8c90a0] mb-0.5">
              Expected
            </div>
            <div className="text-[#c2c6d6] font-mono leading-tight">{expected}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-semibold text-[#8c90a0] mb-0.5">
              Observed
            </div>
            <div className="text-[#dfe2eb] font-mono font-medium leading-tight">{observed}</div>
          </div>
        </div>

        {(difference || signal) && (
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            {difference && (
              <div>
                <span className="text-[#8c90a0] font-mono uppercase text-[10px]">Difference: </span>
                <span className="text-rose-400 font-mono font-semibold">{difference}</span>
              </div>
            )}
            {signal && (
              <div>
                <span className="text-[#8c90a0] font-mono uppercase text-[10px]">Signal: </span>
                <span className="text-amber-400 font-mono">{signal}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
