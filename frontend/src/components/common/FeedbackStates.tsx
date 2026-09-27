import React from 'react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no items matching the current filter criteria.',
  icon,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-[#262a31] bg-[#181c22]/50 space-y-3',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-[#1c2026] flex items-center justify-center text-[#8c90a0]">
        {icon || <span className="material-symbols-outlined text-[20px]">inbox</span>}
      </div>
      <div className="space-y-1">
        <h4 className="text-[14px] font-semibold text-[#dfe2eb]">{title}</h4>
        <p className="text-[12px] text-[#8c90a0] max-w-sm">{description}</p>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading supervisory telemetry...',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center space-y-3',
        className
      )}
    >
      <div className="w-8 h-8 rounded-full border-2 border-[#1f6feb] border-t-transparent animate-spin" />
      <p className="text-[12px] font-mono text-[#8c90a0] tracking-wide">{message}</p>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Telemetry ingestion error',
  message = 'Failed to load analytical model or telemetry data.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-rose-500/30 bg-rose-950/15 space-y-3',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
        <span className="material-symbols-outlined text-[20px]">warning</span>
      </div>
      <div className="space-y-1">
        <h4 className="text-[14px] font-semibold text-rose-300">{title}</h4>
        <p className="text-[12px] text-[#c2c6d6] max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-3 py-1.5 rounded-md bg-[#262a31] hover:bg-[#323742] text-[12px] font-medium text-[#dfe2eb] border border-[#3b414d]"
        >
          Retry Ingestion
        </button>
      )}
    </div>
  );
};
