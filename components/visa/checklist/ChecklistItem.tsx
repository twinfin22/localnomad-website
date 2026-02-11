'use client';

import { cn } from '@/lib/utils';
import { Check, FileText, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { Document } from '@/lib/visa/types';

interface ChecklistItemProps {
  document: Document;
  checked: boolean;
  onToggle: () => void;
}

const difficultyConfig = {
  easy: { label: 'Easy', color: 'text-emerald-400 bg-emerald-500/10' },
  medium: { label: 'Medium', color: 'text-amber-400 bg-amber-500/10' },
  hard: { label: 'Hard', color: 'text-red-400 bg-red-500/10' },
};

export function ChecklistItem({
  document,
  checked,
  onToggle,
}: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false);

  // Estimate difficulty based on processing time
  const getDifficulty = (): 'easy' | 'medium' | 'hard' => {
    if (!document.processing_time) return 'easy';
    if (document.processing_time.toLowerCase().includes('week')) return 'medium';
    if (document.processing_time.toLowerCase().includes('month')) return 'hard';
    return 'easy';
  };

  const difficulty = getDifficulty();
  const config = difficultyConfig[difficulty];

  return (
    <div
      className={cn(
        'rounded-xl border transition-all',
        checked
          ? 'bg-emerald-500/5 border-emerald-500/30'
          : 'bg-surface/50 border-border hover:border-elevated'
      )}
    >
      {/* Main row */}
      <div className="p-4 flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            'w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
            checked
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-border hover:border-primary'
          )}
        >
          {checked && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4
                className={cn(
                  'font-medium transition-colors',
                  checked ? 'text-muted-foreground line-through' : 'text-foreground'
                )}
              >
                {document.name}
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                {document.description}
              </p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {document.processing_time && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {document.processing_time}
                </span>
              )}
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  config.color
                )}
              >
                {config.label}
              </span>
              {document.required && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Required
                </span>
              )}
            </div>
          </div>

          {/* Tips preview */}
          {document.tips && document.tips.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={cn(
                  'w-3 h-3 transition-transform',
                  expanded && 'rotate-180'
                )}
              />
              {expanded ? 'Hide tips' : `${document.tips.length} tips available`}
            </button>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && document.tips && document.tips.length > 0 && (
        <div className="px-4 pb-4 pt-0 ml-10">
          <div className="space-y-2">
            {document.tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm"
              >
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>

          {document.where_to_get && (
            <div className="mt-3 p-3 rounded-lg bg-surface/50">
              <span className="text-xs text-muted-foreground">Where to get: </span>
              <span className="text-xs text-foreground">
                {document.where_to_get}
              </span>
            </div>
          )}

          {document.cost && (
            <div className="mt-2 text-xs text-muted-foreground">
              Estimated cost: <span className="text-foreground">{document.cost}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
