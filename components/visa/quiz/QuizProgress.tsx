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
      <div className="relative h-2 bg-surface rounded-full overflow-hidden mb-4">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary transition-all duration-500 ease-out"
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
                  isCompleted && 'bg-primary text-background',
                  isCurrent && 'bg-primary/20 text-primary ring-2 ring-primary',
                  !isCompleted && !isCurrent && 'bg-surface text-muted-foreground'
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
                  isCurrent && 'text-primary font-medium',
                  isCompleted && 'text-muted-foreground',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
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
