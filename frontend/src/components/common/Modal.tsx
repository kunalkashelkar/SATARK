import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-[480px]',
    md: 'max-w-[560px]',
    lg: 'max-w-[640px]',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full rounded-lg bg-[#181c22] border border-[#262a31] shadow-2xl z-10 flex flex-col overflow-hidden text-[#dfe2eb]',
          maxWidthClass,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[#262a31] bg-[#1c2026]">
          <div className="min-w-0 pr-3">
            <h3 className="text-[16px] font-semibold text-[#dfe2eb] leading-snug">
              {title}
            </h3>
            {description && (
              <p className="text-[12px] text-[#8c90a0] mt-1 leading-normal">{description}</p>
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

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[70vh] space-y-3 text-[13px]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-3.5 border-t border-[#262a31] bg-[#1c2026] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
