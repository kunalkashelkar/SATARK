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
    <div className={cn('relative pl-4 space-y-3.5 border-l border-[#212c3d]', className)}>
      {events.map((evt, idx) => {
        const markerColors = {
          success: 'bg-emerald-400 border-[#0c1017]',
          warning: 'bg-amber-400 border-[#0c1017]',
          error: 'bg-rose-400 border-[#0c1017]',
          info: 'bg-[#60a5fa] border-[#0c1017]',
          neutral: 'bg-[#64748b] border-[#0c1017]',
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
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-semibold text-[#f1f5f9]">
                    {evt.title}
                  </span>
                  {evt.badge && <div className="inline-flex">{evt.badge}</div>}
                </div>
                <span className="text-[10px] font-mono text-[#64748b]">
                  {evt.timestamp}
                </span>
              </div>

              {evt.description && (
                <p className="text-[11px] text-[#94a3b8] leading-normal mt-0.5">
                  {evt.description}
                </p>
              )}

              {evt.actor && (
                <span className="text-[10px] font-mono text-[#64748b] mt-0.5">
                  Actor: <strong className="text-[#cbd5e1] font-normal">{evt.actor}</strong>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
