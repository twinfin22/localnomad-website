'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  onStepClick?: (step: number) => void;
}

export function QuizProgress({
  currentStep,
  totalSteps,
  stepLabels = ['Nationality', 'Status', 'Goal', 'Background', 'Results'],
  onStepClick,
}: QuizProgressProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Progress bar */}
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {stepLabels.slice(0, totalSteps).map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isClickable = stepNumber < currentStep && onStepClick;

          return (
            <button
              key={label}
              onClick={() => isClickable && onStepClick(stepNumber)}
              disabled={!isClickable}
              className={cn(
                'flex flex-col items-center gap-1 transition-all',
                isClickable && 'cursor-pointer hover:opacity-80',
                !isClickable && 'cursor-default'
              )}
            >
              {/* Step circle */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  isCompleted && 'bg-cyan-500 text-slate-900',
                  isCurrent && 'bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-500',
                  !isCompleted && !isCurrent && 'bg-slate-800 text-slate-500'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>

              {/* Step label - hidden on mobile */}
              <span
                className={cn(
                  'text-xs hidden sm:block transition-colors',
                  isCurrent && 'text-cyan-400 font-medium',
                  isCompleted && 'text-slate-400',
                  !isCompleted && !isCurrent && 'text-slate-600'
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
