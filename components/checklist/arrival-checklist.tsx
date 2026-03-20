'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Printer } from 'lucide-react';
import { useLocalChecklist } from '@/hooks/use-local-checklist';
import type { CountryChecklist } from '@/lib/types/checklist';
import { ChecklistPhase } from './checklist-phase';

interface ArrivalChecklistProps {
  data: CountryChecklist;
  country: string;
}

export function ArrivalChecklist({ data, country }: ArrivalChecklistProps) {
  const t = useTranslations('Checklist');
  const storageKey = `localnomad:arrival:${country}`;
  const { checked, toggle } = useLocalChecklist(storageKey);

  // Compute all item IDs for overall progress
  const allItems = useMemo(
    () => data.phases.flatMap((phase) => phase.items),
    [data.phases]
  );
  const totalCount = allItems.length;
  const completedCount = allItems.filter((item) => checked[item.id]).length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div>
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

      {/* Phases */}
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        {data.phases.map((phase, i) => (
          <ChecklistPhase
            key={phase.id}
            phase={phase}
            checked={checked}
            onToggle={toggle}
            defaultOpen={i === 0}
          />
        ))}

        {/* Footer actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
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
