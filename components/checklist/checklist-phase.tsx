'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChecklistItem, ChecklistItemState, ChecklistPhase as Phase } from '@/lib/types/checklist';
import { ChecklistItemRow } from './checklist-item-row';

type PhaseState = 'done' | 'active' | 'upcoming' | 'blocked';

interface ChecklistPhaseProps {
  phase: Phase;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  defaultOpen?: boolean;
  getItemState: (id: string) => ChecklistItemState;
  newlyUnlocked: string[];
  allItems?: ChecklistItem[];
  phaseIndex?: number;
  totalPhases?: number;
  phaseState?: PhaseState;
  unlocksMap?: Record<string, string[]>;
}

export function ChecklistPhase({
  phase,
  checked,
  onToggle,
  defaultOpen = false,
  getItemState,
  newlyUnlocked,
  allItems = [],
  phaseIndex = 0,
  totalPhases = 1,
  phaseState = 'upcoming',
  unlocksMap = {},
}: ChecklistPhaseProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Sync open state when defaultOpen changes (e.g. tier switch or auto-expand)
  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  if (phase.items.length === 0) return null;

  // Group items by state
  const actionableItems = phase.items.filter((i) => getItemState(i.id) === 'actionable');
  const blockedItems = phase.items.filter((i) => getItemState(i.id) === 'blocked');
  const doneItems = phase.items.filter((i) => getItemState(i.id) === 'done');

  // Progress: exclude blocked from denominator (GOV.UK pattern)
  const nonBlockedTotal = actionableItems.length + doneItems.length;
  const completedCount = doneItems.length;
  const progress = nonBlockedTotal > 0 ? (completedCount / nonBlockedTotal) * 100 : 0;

  const isLastPhase = phaseIndex === totalPhases - 1;

  const dotClass = cn(
    'absolute left-0 top-5 flex h-3 w-3 items-center justify-center rounded-full',
    phaseState === 'done' && 'bg-green-500',
    phaseState === 'active' && 'bg-primary motion-safe:animate-pulse',
    phaseState === 'upcoming' && 'border-2 border-muted-foreground/30 bg-transparent',
    phaseState === 'blocked' && 'border-2 border-muted-foreground/20 bg-transparent',
  );

  const lineClass = cn(
    'absolute left-[5px] top-8 w-0 border-l-2',
    phaseState === 'done' ? 'border-green-500' : 'border-muted-foreground/20 border-dashed',
  );

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div className={dotClass}>
        {phaseState === 'blocked' && <Lock style={{ width: 8, height: 8 }} className="text-muted-foreground/40" />}
      </div>

      {/* Connector line to next phase */}
      {!isLastPhase && (
        <div className={cn(lineClass, '-bottom-4')} />
      )}

      <div className="rounded-xl border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left"
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
            {completedCount}/{nonBlockedTotal}
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

          {/* Actionable items */}
          {actionableItems.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              state="actionable"
              onToggle={onToggle}
              isGate={item.isGate}
              estimatedWait={item.isGate ? item.estimatedWait : undefined}
              isNewlyUnlocked={newlyUnlocked.includes(item.id)}
              unlocksLabels={item.isGate ? unlocksMap[item.id] : undefined}
            />
          ))}

          {/* Blocked items — GOV.UK "Cannot start yet" pattern */}
          {blockedItems.map((item) => {
            const blockedByLabel = (item.blockedBy ?? [])
              .map((gateId) => allItems.find((i) => i.id === gateId)?.label ?? gateId)
              .filter(Boolean)
              .join(', ');

            return (
              <ChecklistItemRow
                key={item.id}
                item={item}
                state="blocked"
                onToggle={onToggle}
                blockedByLabel={blockedByLabel || undefined}
                estimatedWait={item.estimatedWait}
              />
            );
          })}

          {/* Done items */}
          {doneItems.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              state="done"
              onToggle={onToggle}
              isGate={item.isGate}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
