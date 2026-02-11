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
      <h4 className="text-sm font-medium text-slate-400 mb-4">
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
                  isCurrent && 'bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/30',
                  !isCompleted && !isCurrent && 'bg-slate-800/50 border-slate-700'
                )}
              >
                {/* Visa code badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'text-sm font-bold uppercase',
                      isCompleted && 'text-emerald-400',
                      isCurrent && 'text-cyan-400',
                      !isCompleted && !isCurrent && 'text-slate-400'
                    )}
                  >
                    {step.visaType.toUpperCase()}
                  </span>
                  {isCompleted && (
                    <Check className="w-4 h-4 text-emerald-400" />
                  )}
                </div>

                {/* Visa name */}
                <div className="text-sm text-slate-300">{step.visaName}</div>

                {/* Duration */}
                <div className="text-xs text-slate-500 mt-1">{step.duration}</div>
              </div>

              {/* Arrow between steps */}
              {!isLast && (
                <ArrowRight className="w-5 h-5 text-slate-600 mx-2 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Path description */}
      {path.length > 1 && (
        <p className="text-xs text-slate-500 mt-4">
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
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <span>Path:</span>
      {path.map((step, index) => (
        <span key={step.visaType} className="flex items-center">
          <span className="font-medium text-slate-400 uppercase">
            {step.visaType}
          </span>
          {index < path.length - 1 && (
            <ArrowRight className="w-3 h-3 mx-1 text-slate-600" />
          )}
        </span>
      ))}
    </div>
  );
}
