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
  semantic?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan' | 'neutral';
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
  semantic,
  className,
  onClick,
}) => {
  // Map semantic to subtle top border or accent dot
  const semanticBorderMap = {
    blue: 'border-t-2 border-t-[#3b82f6]',
    green: 'border-t-2 border-t-[#10b981]',
    amber: 'border-t-2 border-t-[#f59e0b]',
    red: 'border-t-2 border-t-[#ef4444]',
    purple: 'border-t-2 border-t-[#a855f7]',
    cyan: 'border-t-2 border-t-[#06b6d4]',
    neutral: 'border-t-2 border-t-[#64748b]',
  };

  const semanticIconMap = {
    blue: 'text-[#60a5fa]',
    green: 'text-[#34d399]',
    amber: 'text-[#fbbf24]',
    red: 'text-[#f87171]',
    purple: 'text-[#c084fc]',
    cyan: 'text-[#38bdf8]',
    neutral: 'text-[#94a3b8]',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3.5 rounded-md bg-[#131922] border border-[#212c3d] transition-all min-w-0 flex flex-col justify-between shadow-xs',
        semantic && semanticBorderMap[semantic],
        highlight && 'border-[#3b82f6]/50 bg-[#162032]',
        alert && 'border-[#ef4444]/50 bg-[#24151a]',
        onClick && 'cursor-pointer hover:border-[#3b4b63] hover:bg-[#161e2b]',
        className
      )}
    >
      <div className="flex items-center justify-between text-[#8c90a0] mb-1.5 min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] truncate font-sans">
          {title}
        </span>
        {Icon && (
          <div className="p-1 rounded bg-[#0d121a] border border-[#212c3d]/60 shrink-0 ml-2">
            <Icon className={cn('w-3.5 h-3.5', semantic ? semanticIconMap[semantic] : 'text-[#94a3b8]')} />
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-1.5 min-w-0">
        <span className="text-[24px] font-bold font-mono tracking-tight text-[#f1f5f9] leading-none truncate">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-[10px] font-semibold font-mono shrink-0 px-1.5 py-0.5 rounded border',
              trendPositive
                ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30'
                : 'text-[#f87171] bg-[#ef4444]/10 border-[#ef4444]/30'
            )}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[11px] text-[#64748b] mt-2 leading-tight truncate font-sans">
          {subtitle}
        </p>
      )}
    </div>
  );
};
