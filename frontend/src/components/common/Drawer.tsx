import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'md',
  className,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    sm: 'max-w-[380px]',
    md: 'max-w-[440px]',
    lg: 'max-w-[480px]',
  }[width];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'relative w-full h-full bg-[#181c22] border-l border-[#262a31] shadow-2xl flex flex-col z-10 text-[#dfe2eb]',
          widthClass,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#262a31] bg-[#1c2026]">
          <div className="min-w-0 pr-2">
            <h3 className="text-[15px] font-semibold text-[#dfe2eb] truncate leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[12px] text-[#8c90a0] truncate mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#8c90a0] hover:text-[#dfe2eb] hover:bg-[#262a31] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-[#262a31] bg-[#1c2026] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
