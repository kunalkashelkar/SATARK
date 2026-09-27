import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  dense?: boolean;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  dense = false,
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-[#181c22] border border-[#262a31] rounded-lg text-[#dfe2eb] min-w-0 transition-all',
        dense ? 'p-3' : 'p-4',
        interactive && 'hover:border-[#3b414d] hover:bg-[#1c2026] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, actions }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 pb-2.5 mb-3 border-b border-[#262a31]/60 min-w-0',
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className, badge }) => {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <h3
        className={cn(
          'text-[14px] md:text-[15px] font-semibold text-[#dfe2eb] leading-snug truncate',
          className
        )}
      >
        {children}
      </h3>
      {badge && <div className="inline-flex shrink-0">{badge}</div>}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={cn('space-y-3 min-w-0', className)}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[#262a31]/60 text-xs text-[#8c90a0]',
        className
      )}
    >
      {children}
    </div>
  );
};
