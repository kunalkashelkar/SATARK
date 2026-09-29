import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  sizeVariant?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, iconRight, sizeVariant = 'md', ...props }, ref) => {
    const heightClass = {
      sm: 'h-7 text-[11px] rounded',
      md: 'h-8 text-[12px] rounded',
      lg: 'h-9 text-[13px] rounded-md',
    }[sizeVariant];

    return (
      <div className="relative flex items-center w-full min-w-0">
        {icon && (
          <div className="absolute left-2.5 flex items-center pointer-events-none text-[#64748b]">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-[#131922] border border-[#212c3d] text-[#f1f5f9] placeholder-[#64748b] transition-colors font-sans focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] disabled:opacity-50',
            heightClass,
            icon ? 'pl-8' : 'px-2.5',
            iconRight ? 'pr-8' : 'px-2.5',
            className
          )}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-2.5 flex items-center pointer-events-none text-[#64748b]">
            {iconRight}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
