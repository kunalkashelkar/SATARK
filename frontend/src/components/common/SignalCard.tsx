import React from 'react';
import { cn } from '@/utils/cn';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';

interface SignalCardProps {
  code: string;
  title: string;
  description?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
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
      className={cn('flex flex-col justify-between gap-2', className)}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[11px] font-semibold text-[#afc6ff] bg-[#1f6feb]/15 px-1.5 py-0.5 rounded border border-[#1f6feb]/30 shrink-0">
              {code}
            </span>
            {category && (
              <span className="text-[10px] font-mono uppercase text-[#8c90a0]">
                {category}
              </span>
            )}
          </div>
          {severity && <StatusBadge status={severity} />}
        </div>

        <h4 className="text-[13px] md:text-[14px] font-semibold text-[#dfe2eb] leading-snug line-clamp-2">
          {title}
        </h4>

        {description && (
          <p className="text-[12px] text-[#8c90a0] leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#262a31]/60 text-[11px] text-[#8c90a0] mt-1">
        <div className="flex items-center gap-2 truncate">
          {cseName && <span className="font-mono text-[#c2c6d6] font-medium">{cseName}</span>}
          {timestamp && <span>{timestamp}</span>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </Card>
  );
};
