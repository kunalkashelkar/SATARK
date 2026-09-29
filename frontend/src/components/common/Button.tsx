import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  className,
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-7 px-2.5 text-[11px] gap-1.5 rounded',
    md: 'h-8 px-3 text-[12px] gap-2 rounded',
    lg: 'h-9 px-3.5 text-[13px] gap-2 rounded-md',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#3b82f6] text-white hover:bg-[#2563eb] active:bg-[#1d4ed8] border border-blue-500/30 shadow-xs font-medium',
    secondary:
      'bg-[#131922] text-[#cbd5e1] hover:bg-[#1a2332] hover:text-[#f1f5f9] border border-[#212c3d] active:bg-[#10151e] font-medium',
    outline:
      'bg-transparent text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#131922] border border-[#212c3d] font-medium',
    danger:
      'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 active:bg-rose-500/30 font-medium',
    ghost:
      'bg-transparent text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#131922]/50 border border-transparent font-medium',
  }[variant];

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-sans tracking-tight transition-colors focus:outline-none focus:ring-1 focus:ring-[#3b82f6] disabled:opacity-50 disabled:pointer-events-none select-none shrink-0 cursor-pointer',
        sizeClasses,
        variantClasses,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children && <span className="truncate">{children}</span>}
      {!loading && iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
    </button>
  );
};
