import React from 'react';
import { cn } from '@/utils/cn';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  icon,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-3', className)}>
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-[#8c90a0] shrink-0">{icon}</span>}
        <h2 className="text-[16px] md:text-[17px] font-semibold text-[#dfe2eb] leading-snug tracking-tight">
          {title}
        </h2>
        {badge && <div className="inline-flex items-center">{badge}</div>}
        {subtitle && (
          <span className="text-xs text-[#8c90a0] hidden sm:inline truncate">
            — {subtitle}
          </span>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
