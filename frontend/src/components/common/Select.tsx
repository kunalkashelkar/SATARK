import React from 'react';
import { ChevronDown } from 'lucide-react';
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
      sm: 'h-7 text-[11px] rounded',
      md: 'h-8 text-[12px] rounded',
      lg: 'h-9 text-[13px] rounded-md',
    }[sizeVariant];

    return (
      <div className="relative flex items-center min-w-0">
        <select
          ref={ref}
          className={cn(
            'w-full bg-[#131922] border border-[#212c3d] text-[#f1f5f9] transition-colors font-sans focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] appearance-none pr-7 pl-2.5 disabled:opacity-50 cursor-pointer',
            heightClass,
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#131922] text-[#f1f5f9]">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2 pointer-events-none text-[#64748b]">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
