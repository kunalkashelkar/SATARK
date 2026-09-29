import React from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'No telemetry matches the selected supervisory filter criteria.',
  icon,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center rounded-md border border-[#212c3d] bg-[#10151e] space-y-2.5',
        className
      )}
    >
      <div className="w-8 h-8 rounded-full bg-[#131922] border border-[#212c3d] flex items-center justify-center text-[#64748b]">
        {icon || <Inbox className="w-4 h-4" />}
      </div>
      <div className="space-y-0.5 max-w-sm">
        <h4 className="text-[13px] font-semibold text-[#f1f5f9]">{title}</h4>
        <p className="text-[11px] text-[#94a3b8]">{description}</p>
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
        'flex flex-col items-center justify-center p-8 text-center space-y-2.5',
        className
      )}
    >
      <div className="w-6 h-6 rounded-full border-2 border-[#3b82f6] border-t-transparent animate-spin" />
      <p className="text-[11px] font-mono text-[#94a3b8] tracking-wider uppercase">{message}</p>
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
  title = 'Telemetry retrieval error',
  message = 'Failed to retrieve analytical signals or assessment telemetry.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center rounded-md border border-rose-500/30 bg-rose-950/15 space-y-2.5',
        className
      )}
    >
      <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div className="space-y-0.5 max-w-sm">
        <h4 className="text-[13px] font-semibold text-rose-300">{title}</h4>
        <p className="text-[11px] text-[#94a3b8]">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Retry
        </Button>
      )}
    </div>
  );
};
