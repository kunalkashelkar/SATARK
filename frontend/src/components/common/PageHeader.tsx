import React from 'react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string; // backwards compatibility
  metadata?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode | BreadcrumbItem[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  metadata,
  badge,
  actions,
  breadcrumbs,
  className,
}) => {
  const displaySubtitle = subtitle || description;

  return (
    <div className={cn('flex flex-col gap-2 pb-3 mb-4 border-b border-[#212c3d]', className)}>
      {breadcrumbs && (
        <div className="text-[11px] font-mono text-[#64748b] mb-0.5">
          {Array.isArray(breadcrumbs) ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-[#3a4454]">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-[#3b82f6] text-[#94a3b8] transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-[#cbd5e1]">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            breadcrumbs
          )}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[18px] md:text-[20px] font-semibold tracking-tight text-[#f1f5f9] leading-tight">
              {title}
            </h1>
            {badge && <div className="inline-flex items-center">{badge}</div>}
          </div>
          {displaySubtitle && (
            <p className="text-[12px] text-[#94a3b8] leading-normal max-w-4xl truncate">
              {displaySubtitle}
            </p>
          )}
          {metadata && (
            <div className="text-[11px] font-mono text-[#64748b] pt-0.5 flex items-center gap-2">
              {metadata}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
