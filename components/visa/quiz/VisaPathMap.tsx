'use client';

import { cn } from '@/lib/utils';
import { ArrowRight, Check } from 'lucide-react';
import type { VisaPathStep } from '@/lib/visa/types';

interface VisaPathMapProps {
  path: VisaPathStep[];
  currentStep?: number;
  className?: string;
}

export function VisaPathMap({ path, currentStep = 0, className }: VisaPathMapProps) {
  if (!path || path.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      <h4 className="text-sm font-medium text-muted-foreground mb-4">
        Suggested Visa Path
      </h4>

      <div className="flex flex-wrap items-center gap-2">
        {path.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === path.length - 1;

          return (
            <div key={step.visaType} className="flex items-center">
              {/* Step card */}
              <div
                className={cn(
                  'relative px-4 py-3 rounded-xl border transition-all',
                  isCompleted && 'bg-emerald-500/10 border-emerald-500/30',
                  isCurrent && 'bg-primary/10 border-primary/50 ring-2 ring-primary/30',
                  !isCompleted && !isCurrent && 'bg-surface border-border'
                )}
              >
                {/* Visa code badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'text-sm font-bold uppercase',
                      isCompleted && 'text-emerald-400',
                      isCurrent && 'text-primary',
                      !isCompleted && !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.visaType.toUpperCase()}
                  </span>
                  {isCompleted && (
                    <Check className="w-4 h-4 text-emerald-400" />
                  )}
                </div>

                {/* Visa name */}
                <div className="text-sm text-muted-foreground">{step.visaName}</div>

                {/* Duration */}
                <div className="text-xs text-muted-foreground mt-1">{step.duration}</div>
              </div>

              {/* Arrow between steps */}
              {!isLast && (
                <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Path description */}
      {path.length > 1 && (
        <p className="text-xs text-muted-foreground mt-4">
          This path shows a common progression. Each visa has its own requirements
          that must be met independently.
        </p>
      )}
    </div>
  );
}

// Compact inline version for results cards
export function VisaPathInline({ path }: { path: VisaPathStep[] }) {
  if (!path || path.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>Path:</span>
      {path.map((step, index) => (
        <span key={step.visaType} className="flex items-center">
          <span className="font-medium text-muted-foreground uppercase">
            {step.visaType}
          </span>
          {index < path.length - 1 && (
            <ArrowRight className="w-3 h-3 mx-1 text-muted-foreground" />
          )}
        </span>
      ))}
    </div>
  );
}
