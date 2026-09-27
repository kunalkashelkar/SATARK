import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  highlight?: boolean;
  alert?: boolean;
  className?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  highlight,
  alert,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg bg-[#181c22] border border-[#262a31] transition-all min-w-0 flex flex-col justify-between',
        highlight && 'border-[#afc6ff]/40 bg-[#1c2436]',
        alert && 'border-rose-500/40 bg-rose-950/20',
        onClick && 'cursor-pointer hover:border-[#3b414d] hover:bg-[#1c2026]',
        className
      )}
    >
      <div className="flex items-center justify-between text-[#8c90a0] mb-2 min-w-0">
        <span className="text-[12px] font-medium uppercase tracking-wider text-[#8c90a0] truncate">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-[#8c90a0] shrink-0 ml-2" />}
      </div>
      <div className="flex items-baseline justify-between gap-2 min-w-0">
        <span className="text-[26px] font-semibold font-mono tracking-tight text-[#dfe2eb] leading-none truncate">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-[11px] font-medium font-mono shrink-0 px-1.5 py-0.5 rounded',
              trendPositive
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-rose-400 bg-rose-500/10'
            )}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[12px] text-[#8c90a0] mt-2 leading-tight truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
