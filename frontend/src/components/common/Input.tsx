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
      sm: 'h-8 text-[12px]',
      md: 'h-9 text-[13px]',
      lg: 'h-10 text-[14px]',
    }[sizeVariant];

    return (
      <div className="relative flex items-center w-full min-w-0">
        {icon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-[#8c90a0]">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-[#181c22] border border-[#262a31] text-[#dfe2eb] placeholder-[#8c90a0] rounded-md transition-colors font-sans focus:outline-none focus:border-[#afc6ff] focus:ring-1 focus:ring-[#afc6ff] disabled:opacity-50',
            heightClass,
            icon ? 'pl-9' : 'px-3',
            iconRight ? 'pr-9' : 'px-3',
            className
          )}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 flex items-center pointer-events-none text-[#8c90a0]">
            {iconRight}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
