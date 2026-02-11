'use client';

import { cn } from '@/lib/utils';

interface ChecklistProgressProps {
  completed: number;
  total: number;
  requiredCompleted: number;
  requiredTotal: number;
  className?: string;
}

export function ChecklistProgress({
  completed,
  total,
  requiredCompleted,
  requiredTotal,
  className,
}: ChecklistProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const requiredPercentage =
    requiredTotal > 0 ? Math.round((requiredCompleted / requiredTotal) * 100) : 0;

  const allRequiredDone = requiredCompleted === requiredTotal && requiredTotal > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {completed} of {total} documents ready
          </span>
          <span className="text-sm text-muted-foreground">{percentage}%</span>
        </div>
        <div className="h-3 bg-surface rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              allRequiredDone
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : 'bg-gradient-to-r from-primary to-primary/80'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Required vs optional breakdown */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              allRequiredDone ? 'bg-emerald-500' : 'bg-primary'
            )}
          />
          <span className="text-muted-foreground">
            Required: {requiredCompleted}/{requiredTotal}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-surface" />
          <span className="text-muted-foreground">
            Optional: {completed - requiredCompleted}/{total - requiredTotal}
          </span>
        </div>
      </div>

      {/* Status message */}
      {allRequiredDone && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <p className="text-sm text-emerald-400">
            All required documents are ready. You can proceed with your application.
          </p>
        </div>
      )}
    </div>
  );
}
