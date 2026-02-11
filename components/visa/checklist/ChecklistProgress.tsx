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
          <span className="text-sm font-medium text-white">
            {completed} of {total} documents ready
          </span>
          <span className="text-sm text-slate-400">{percentage}%</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              allRequiredDone
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : 'bg-gradient-to-r from-cyan-500 to-cyan-400'
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
              allRequiredDone ? 'bg-emerald-500' : 'bg-cyan-500'
            )}
          />
          <span className="text-slate-400">
            Required: {requiredCompleted}/{requiredTotal}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-600" />
          <span className="text-slate-400">
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
