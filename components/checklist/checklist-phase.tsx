'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChecklistPhase as Phase } from '@/lib/types/checklist';
import { ChecklistItemRow } from './checklist-item-row';

interface ChecklistPhaseProps {
  phase: Phase;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  defaultOpen?: boolean;
  visaFilter?: string | null;
}

export function ChecklistPhase({
  phase,
  checked,
  onToggle,
  defaultOpen = false,
  visaFilter,
}: ChecklistPhaseProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Filter items by visa type if a filter is active
  const visibleItems = visaFilter
    ? phase.items.filter(
        (item) => !item.visaFilter || item.visaFilter.includes(visaFilter)
      )
    : phase.items.filter((item) => !item.visaFilter);

  if (visibleItems.length === 0) return null;

  const completedCount = visibleItems.filter((item) => checked[item.id]).length;
  const totalCount = visibleItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="rounded-xl border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="font-lora text-base font-semibold">{phase.title}</h3>
            <span className="text-xs text-muted-foreground">{phase.timeframe}</span>
          </div>
          {phase.description && !open && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {phase.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t px-5 py-4 space-y-2">
          {phase.description && (
            <p className="mb-3 text-sm text-muted-foreground">{phase.description}</p>
          )}
          {visibleItems.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              isChecked={!!checked[item.id]}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
