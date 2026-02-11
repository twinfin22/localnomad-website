'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Flag,
  Plane,
  GraduationCap,
  Briefcase,
  FileText,
  Laptop,
  Building2,
  Home,
  Rocket,
  Compass,
  type LucideIcon,
} from 'lucide-react';

// Icon map for dynamic rendering
const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  Flag,
  Plane,
  GraduationCap,
  Briefcase,
  FileText,
  Laptop,
  Building2,
  Home,
  Rocket,
  Compass,
};

interface QuizOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

interface QuizQuestionProps {
  title: string;
  subtitle?: string;
  options: QuizOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  onBack?: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastQuestion?: boolean;
}

export function QuizQuestion({
  title,
  subtitle,
  options,
  selectedValue,
  onSelect,
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isLastQuestion = false,
}: QuizQuestionProps) {
  // Dynamic icon component
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  // Determine if we should use compact layout (many options)
  const useCompactLayout = options.length > 6;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col min-h-[60vh]">
      {/* Question */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-slate-400">{subtitle}</p>
        )}
      </div>

      {/* Options - scrollable area */}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className={cn(
          'grid gap-2',
          useCompactLayout && 'sm:grid-cols-2'
        )}>
          {options.map((option) => {
            const isSelected = selectedValue === option.value;

            return (
              <button
                key={option.value}
                onClick={() => onSelect(option.value)}
                className={cn(
                  'w-full rounded-xl border-2 text-left transition-all duration-200',
                  'hover:border-cyan-500/50 hover:bg-cyan-500/5',
                  useCompactLayout ? 'p-3' : 'p-4',
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-700 bg-slate-800/50'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Icon or checkbox */}
                  <div
                    className={cn(
                      'rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                      useCompactLayout ? 'w-8 h-8' : 'w-10 h-10',
                      isSelected
                        ? 'bg-cyan-500 text-slate-900'
                        : 'bg-slate-700 text-slate-400'
                    )}
                  >
                    {isSelected ? (
                      <Check className={useCompactLayout ? 'w-4 h-4' : 'w-5 h-5'} />
                    ) : (
                      getIcon(option.icon) || (
                        <div className="w-2 h-2 rounded-full bg-slate-500" />
                      )
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        'font-medium transition-colors',
                        useCompactLayout ? 'text-sm' : 'text-base',
                        isSelected ? 'text-white' : 'text-slate-200'
                      )}
                    >
                      {option.label}
                    </div>
                    {option.description && !useCompactLayout && (
                      <div className="text-sm text-slate-400 mt-0.5">
                        {option.description}
                      </div>
                    )}
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className={cn(
                        'rounded-full bg-cyan-500 flex items-center justify-center',
                        useCompactLayout ? 'w-5 h-5' : 'w-6 h-6'
                      )}>
                        <Check className={useCompactLayout ? 'w-3 h-3 text-slate-900' : 'w-4 h-4 text-slate-900'} />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-[#0B1120] via-[#0B1120] to-transparent">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={!canGoBack}
            className={cn(
              'text-slate-400 hover:text-white hover:bg-slate-800',
              !canGoBack && 'opacity-0 pointer-events-none'
            )}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={onNext}
            disabled={!canGoNext}
            className={cn(
              'bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium px-6',
              !canGoNext && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLastQuestion ? 'See Results' : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
