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
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  highlight,
  className
}) => {
  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-[#0e1626] border border-slate-800 transition-all hover:border-slate-700',
        highlight && 'border-blue-500/30 bg-blue-950/10',
        className
      )}
    >
      <div className="flex items-center justify-between text-slate-400 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold font-mono text-slate-100">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-[11px] font-semibold font-mono',
              trendPositive ? 'text-emerald-400' : 'text-rose-400'
            )}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
};
