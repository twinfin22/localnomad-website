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
  nextLabel?: string;
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
  nextLabel = 'Continue',
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
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
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
                  'hover:border-primary/50 hover:bg-primary/5',
                  useCompactLayout ? 'p-3' : 'p-4',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Icon or checkbox */}
                  <div
                    className={cn(
                      'rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                      useCompactLayout ? 'w-8 h-8' : 'w-10 h-10',
                      isSelected
                        ? 'bg-primary text-background'
                        : 'bg-elevated text-muted-foreground'
                    )}
                  >
                    {isSelected ? (
                      <Check className={useCompactLayout ? 'w-4 h-4' : 'w-5 h-5'} />
                    ) : (
                      getIcon(option.icon) || (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      )
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        'font-medium transition-colors',
                        useCompactLayout ? 'text-sm' : 'text-base',
                        isSelected ? 'text-foreground' : 'text-foreground'
                      )}
                    >
                      {option.label}
                    </div>
                    {option.description && !useCompactLayout && (
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {option.description}
                      </div>
                    )}
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className={cn(
                        'rounded-full bg-primary flex items-center justify-center',
                        useCompactLayout ? 'w-5 h-5' : 'w-6 h-6'
                      )}>
                        <Check className={useCompactLayout ? 'w-3 h-3 text-background' : 'w-4 h-4 text-background'} />
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
      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-background via-background to-transparent">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={!canGoBack}
            className={cn(
              'text-muted-foreground hover:text-foreground hover:bg-surface',
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
              'bg-primary hover:bg-accent-hover text-background font-medium px-6',
              !canGoNext && 'opacity-50 cursor-not-allowed'
            )}
          >
            {nextLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
