import React from 'react';
import { cn } from '@/utils/cn';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'full' | 'wide' | 'narrow';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = 'wide',
}) => {
  const maxWidthClass = {
    full: 'max-w-full',
    wide: 'max-w-[1600px]',
    narrow: 'max-w-6xl',
  }[maxWidth];

  return (
    <div
      className={cn(
        'w-full min-w-0 mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6',
        maxWidthClass,
        className
      )}
    >
      {children}
    </div>
  );
};
