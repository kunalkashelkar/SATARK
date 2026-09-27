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
    sm: 'h-8 px-2.5 text-[12px] gap-1.5',
    md: 'h-9 px-3.5 text-[13px] gap-2',
    lg: 'h-10 px-4 text-[14px] gap-2',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#1f6feb] text-white hover:bg-[#388bfd] active:bg-[#005cc5] border border-blue-400/30 shadow-sm font-medium',
    secondary:
      'bg-[#262a31] text-[#dfe2eb] hover:bg-[#31353c] hover:text-white border border-[#3b414d] active:bg-[#1c2026] font-medium',
    outline:
      'bg-transparent text-[#c2c6d6] hover:text-[#dfe2eb] hover:bg-[#262a31]/60 border border-[#3b414d] font-medium',
    danger:
      'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 active:bg-rose-500/40 font-medium',
    ghost:
      'bg-transparent text-[#8c90a0] hover:text-[#dfe2eb] hover:bg-[#262a31]/50 border border-transparent font-medium',
  }[variant];

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-sans tracking-wide transition-colors focus:outline-none focus:ring-1 focus:ring-[#afc6ff] disabled:opacity-50 disabled:pointer-events-none select-none shrink-0',
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
