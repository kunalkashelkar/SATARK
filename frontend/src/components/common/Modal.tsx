import React, { useEffect } from 'react';
import { X } from 'lucide-react';
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
        className="fixed inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full rounded-md bg-[#131922] border border-[#212c3d] shadow-2xl z-10 flex flex-col overflow-hidden text-[#f1f5f9]',
          maxWidthClass,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 border-b border-[#212c3d] bg-[#0e141c]">
          <div className="min-w-0 pr-3">
            <h3 className="text-[15px] font-semibold text-[#f1f5f9] leading-snug">
              {title}
            </h3>
            {description && (
              <p className="text-[12px] text-[#94a3b8] mt-0.5 leading-normal">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#161e29] transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-130px)] space-y-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#212c3d] bg-[#0e141c]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
