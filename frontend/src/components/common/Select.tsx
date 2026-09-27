import React from 'react';
import { cn } from '@/utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  sizeVariant?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, sizeVariant = 'md', label, ...props }, ref) => {
    const heightClass = {
      sm: 'h-8 text-[12px]',
      md: 'h-9 text-[13px]',
      lg: 'h-10 text-[14px]',
    }[sizeVariant];

    return (
      <div className="relative flex items-center min-w-0">
        <select
          ref={ref}
          className={cn(
            'w-full bg-[#181c22] border border-[#262a31] text-[#dfe2eb] rounded-md transition-colors font-sans focus:outline-none focus:border-[#afc6ff] focus:ring-1 focus:ring-[#afc6ff] appearance-none pr-8 pl-3 disabled:opacity-50 cursor-pointer',
            heightClass,
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#181c22] text-[#dfe2eb]">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 pointer-events-none text-[#8c90a0]">
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
