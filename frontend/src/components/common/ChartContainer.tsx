import React from 'react';
import { cn } from '@/utils/cn';

interface ChartContainerProps {
  children: React.ReactNode;
  height?: 'sm' | 'md' | 'lg' | number;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  height = 'md',
  className,
  title,
  subtitle,
  actions,
}) => {
  let heightClass = 'h-[240px]'; // default medium (220-280px)

  if (typeof height === 'number') {
    heightClass = `h-[${height}px]`;
  } else if (height === 'sm') {
    heightClass = 'h-[200px]'; // 180-220px
  } else if (height === 'md') {
    heightClass = 'h-[240px]'; // 220-280px
  } else if (height === 'lg') {
    heightClass = 'h-[300px]'; // 280-340px
  }

  return (
    <div className={cn('w-full min-w-0 flex flex-col', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#262a31]/50">
          <div>
            {title && (
              <h4 className="text-[13px] md:text-[14px] font-semibold text-[#dfe2eb] leading-tight">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-[11px] text-[#8c90a0] leading-snug mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div
        className={cn('w-full min-w-0 relative overflow-hidden', heightClass)}
        style={typeof height === 'number' ? { height: `${height}px` } : undefined}
      >
        {children}
      </div>
    </div>
  );
};
