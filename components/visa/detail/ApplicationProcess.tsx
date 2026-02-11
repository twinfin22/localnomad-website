'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import type { ApplicationStep } from '@/lib/visa/types';

interface ApplicationProcessProps {
  steps: ApplicationStep[];
  processingTime?: {
    typical: string;
    expedited?: string;
    notes?: string;
  };
  className?: string;
}

export function ApplicationProcess({
  steps,
  processingTime,
  className,
}: ApplicationProcessProps) {
  const [expandedStep, setExpandedStep] = useState<number>(0); // First step expanded by default

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? -1 : index);
  };

  return (
    <div id="process" className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-foreground">Application Process</h2>
        {processingTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{processingTime.typical}</span>
          </div>
        )}
      </div>

      {/* Timeline - Accordion */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-2">
          {steps.map((step, index) => {
            const isExpanded = expandedStep === index;

            return (
              <div key={step.id} className="relative pl-12">
                {/* Step number */}
                <div className={cn(
                  'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                  isExpanded
                    ? 'bg-primary text-background'
                    : 'bg-primary/10 border border-primary/30'
                )}>
                  <span className={cn(
                    'text-sm font-medium',
                    isExpanded ? 'text-background' : 'text-primary'
                  )}>
                    {step.step}
                  </span>
                </div>

                {/* Clickable header */}
                <button
                  onClick={() => toggleStep(index)}
                  className={cn(
                    'w-full text-left rounded-xl border transition-all',
                    isExpanded
                      ? 'bg-surface border-border'
                      : 'bg-surface/30 border-border/50 hover:bg-surface/50'
                  )}
                >
                  <div className="p-3 flex items-center justify-between gap-3">
                    <h4 className="font-medium text-foreground text-sm">{step.title}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {step.duration && (
                        <span className="text-xs text-muted-foreground">
                          {step.duration}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-border/50">
                      <p className="text-sm text-muted-foreground mt-3 mb-3">{step.description}</p>

                      {/* Tips */}
                      {step.tips && step.tips.length > 0 && (
                        <div className="space-y-1">
                          {step.tips.slice(0, 3).map((tip, tipIndex) => (
                            <div
                              key={tipIndex}
                              className="flex items-start gap-2 text-xs text-muted-foreground"
                            >
                              <Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Links */}
                      {step.links && step.links.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {step.links.map((link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary"
                            >
                              {link.label}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Processing time notes */}
      {processingTime?.notes && (
        <p className="text-xs text-muted-foreground mt-2">{processingTime.notes}</p>
      )}
    </div>
  );
}
