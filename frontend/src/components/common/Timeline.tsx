import React from 'react';
import { cn } from '@/utils/cn';

export interface TimelineEvent {
  id?: string;
  timestamp: string;
  title: string;
  description?: string;
  actor?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className }) => {
  return (
    <div className={cn('relative pl-4 space-y-4 border-l border-[#262a31]', className)}>
      {events.map((evt, idx) => {
        const markerColors = {
          success: 'bg-emerald-400 border-emerald-950',
          warning: 'bg-amber-400 border-amber-950',
          error: 'bg-rose-400 border-rose-950',
          info: 'bg-[#afc6ff] border-[#10141a]',
          neutral: 'bg-[#8c90a0] border-[#10141a]',
        }[evt.status || 'neutral'];

        return (
          <div key={evt.id || idx} className="relative group">
            {/* Small circular event marker */}
            <div
              className={cn(
                'absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2',
                markerColors
              )}
            />

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] md:text-[13px] font-semibold text-[#dfe2eb]">
                    {evt.title}
                  </span>
                  {evt.badge && <div className="inline-flex">{evt.badge}</div>}
                </div>
                <span className="text-[11px] font-mono text-[#8c90a0]">
                  {evt.timestamp}
                </span>
              </div>

              {evt.description && (
                <p className="text-[12px] text-[#c2c6d6] leading-relaxed mt-0.5">
                  {evt.description}
                </p>
              )}

              {evt.actor && (
                <div className="text-[11px] text-[#8c90a0] font-mono mt-0.5">
                  Actor: <span className="text-[#dfe2eb]">{evt.actor}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
