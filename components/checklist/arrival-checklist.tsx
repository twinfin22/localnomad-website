'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Printer, Sparkles } from 'lucide-react';
import { useLocalChecklist } from '@/hooks/use-local-checklist';
import { VisaTierSelector } from './visa-tier-selector';
import { ChecklistPhase } from './checklist-phase';
import type { CountryChecklist, VisaTier } from '@/lib/types/checklist';

interface ArrivalChecklistProps {
  data: CountryChecklist;
  country: string;
  defaultTier?: VisaTier;
}

export function ArrivalChecklist({ data, country, defaultTier = 'tourist' }: ArrivalChecklistProps) {
  const t = useTranslations('Checklist');
  const [tier, setTier] = useState<VisaTier>(defaultTier);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastExiting, setToastExiting] = useState(false);

  // All items flat — for hook + gate label lookup
  const allItems = useMemo(() => data.phases.flatMap((p) => p.items), [data.phases]);

  const { checked, toggle, getItemState, newlyUnlocked, clearNewlyUnlocked, tierCounts } =
    useLocalChecklist({ country, tier, items: allItems });

  // Toast + scroll when gate unlocks
  useEffect(() => {
    if (newlyUnlocked.length === 0) return;

    const count = newlyUnlocked.length;
    setToastMsg(`${count} item${count > 1 ? 's' : ''} unlocked!`);
    setToastExiting(false);
    const exitTimer = setTimeout(() => setToastExiting(true), 2800);
    const toastTimer = setTimeout(() => { setToastMsg(null); setToastExiting(false); }, 3000);

    // Scroll to first newly unlocked item (give React a tick to render data-state)
    const scrollTimer = setTimeout(() => {
      const el = document.querySelector('[data-state="newly-unlocked"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);

    // Clear after animation completes
    const clearTimer = setTimeout(() => clearNewlyUnlocked(), 500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(toastTimer);
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [newlyUnlocked, clearNewlyUnlocked]);

  const handleTierChange = useCallback((newTier: VisaTier) => {
    setTier(newTier);
  }, []);

  // Compute gate → blocked item labels map
  const unlocksMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    allItems.forEach((item) => {
      if (item.blockedBy) {
        item.blockedBy.forEach((gateId) => {
          if (!map[gateId]) map[gateId] = [];
          map[gateId].push(item.label);
        });
      }
    });
    return map;
  }, [allItems]);

  // Filter phases by tier and compute auto-open per phase
  const filteredPhases = useMemo(() => {
    let prevPhaseDone = true;
    return data.phases
      .map((phase) => {
        const tierItems = phase.items.filter((item) => item.visaTier.includes(tier));
        if (tierItems.length === 0) return null;

        const hasActionable = tierItems.some((i) => getItemState(i.id) === 'actionable');
        const allDone = tierItems.every((i) => getItemState(i.id) === 'done');
        const allBlocked = tierItems.every((i) => getItemState(i.id) === 'blocked');

        const defaultOpen =
          tier === 'tourist' ? true : prevPhaseDone && hasActionable;

        if (!allDone) prevPhaseDone = false;

        const phaseState: 'done' | 'active' | 'blocked' | 'upcoming' = allDone
          ? 'done'
          : hasActionable
          ? 'active'
          : allBlocked
          ? 'blocked'
          : 'upcoming';

        return { phase: { ...phase, items: tierItems }, defaultOpen, phaseState };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [data.phases, tier, getItemState]);

  // Overall progress: tier-filtered, all items in denominator (matches tier selector count)
  const { totalCount, completedCount, progress } = useMemo(() => {
    const tierItems = allItems.filter((i) => i.visaTier.includes(tier));
    const done = tierItems.filter((i) => getItemState(i.id) === 'done');
    const total = tierItems.length;
    return {
      totalCount: total,
      completedCount: done.length,
      progress: total > 0 ? (done.length / total) * 100 : 0,
    };
  }, [allItems, tier, getItemState]);

  return (
    <div>
      {/* Toast notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white shadow-lg ${toastExiting ? 'toast-exit' : 'toast-enter'}`}>
          <Sparkles className="h-4 w-4" />
          {toastMsg}
        </div>
      )}

      {/* Sticky progress bar */}
      <div className="sticky top-[70px] z-30 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t('completed', { count: completedCount, total: totalCount })}
            </span>
            <span className="text-sm font-semibold text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Visa tier selector (non-sticky) */}
        <VisaTierSelector
          country={country}
          selectedTier={tier}
          onTierChange={handleTierChange}
          tierCounts={tierCounts}
        />

        {/* Phases */}
        <div className="relative space-y-4">
          {filteredPhases.map(({ phase, defaultOpen, phaseState }, index) => (
            <ChecklistPhase
              key={phase.id}
              phase={phase}
              checked={checked}
              onToggle={toggle}
              defaultOpen={defaultOpen}
              getItemState={getItemState}
              newlyUnlocked={newlyUnlocked}
              allItems={allItems}
              phaseIndex={index}
              totalPhases={filteredPhases.length}
              phaseState={phaseState}
              unlocksMap={unlocksMap}
            />
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4 print-hide">
          <a
            href={data.blogUrl}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            {t('readFullGuide')}
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Printer className="h-4 w-4" />
            {t('print')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t('resetConfirm'))) {
                localStorage.removeItem(`localnomad:checklist:${country}:${tier}`);
                window.location.reload();
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
          >
            {t('resetChecklist')}
          </button>
        </div>

        {/* Last updated */}
        <p className="pt-2 text-xs text-muted-foreground">
          {t('lastUpdated', { date: data.lastUpdated })}
        </p>

        {/* Disclaimer */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-xs text-muted-foreground">
          <p>{t('disclaimer')}</p>
        </div>
      </div>
    </div>
  );
}
