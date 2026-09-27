import React from 'react';
import { cn } from '@/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-2 pb-1 border-b border-[#262a31]/60', className)}>
      {breadcrumbs && <div className="text-xs text-[#8c90a0] mb-1">{breadcrumbs}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[22px] md:text-[24px] font-semibold tracking-tight text-[#dfe2eb] leading-tight">
              {title}
            </h1>
            {badge && <div className="inline-flex items-center">{badge}</div>}
          </div>
          {description && (
            <p className="text-[13px] md:text-[14px] text-[#8c90a0] leading-snug max-w-4xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
