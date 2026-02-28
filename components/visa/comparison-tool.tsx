'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { Visa, VisaSummary } from '@/lib/types/visa';
import { ComparisonCard } from './comparison-card';

const MAX_SLOTS_DESKTOP = 4;
const DEFAULT_SLOTS = 2;

interface ComparisonToolProps {
  visas: Visa[];
  summaries: VisaSummary[];
  country: string;
}

export function ComparisonTool({
  visas,
  summaries,
  country,
}: ComparisonToolProps) {
  const t = useTranslations('Comparison');
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedTypes = useMemo(() => {
    const param = searchParams.get('visas');
    if (!param) return [];
    return param
      .split(',')
      .filter((slug) => summaries.some((s) => s.type === slug));
  }, [searchParams, summaries]);

  const slotCount = Math.max(
    selectedTypes.length,
    DEFAULT_SLOTS
  );

  const updateUrl = useCallback(
    (types: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (types.length > 0) {
        params.set('visas', types.join(','));
      } else {
        params.delete('visas');
      }
      router.replace(`/${country}/compare?${params.toString()}`);
    },
    [searchParams, router, country]
  );

  const handleSelect = useCallback(
    (index: number, value: string) => {
      const next = [...selectedTypes];
      if (value === '') {
        next.splice(index, 1);
      } else if (index < next.length) {
        next[index] = value;
      } else {
        next.push(value);
      }
      updateUrl(next);
    },
    [selectedTypes, updateUrl]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const next = selectedTypes.filter((_, i) => i !== index);
      updateUrl(next);
    },
    [selectedTypes, updateUrl]
  );

  const handleAdd = useCallback(() => {
    // Adding a slot is done implicitly by rendering an extra empty slot
    // We push an empty string to trigger a new slot in the URL
    // Actually, we just need to ensure slotCount increases — no URL change needed
    // The slot renders as empty until user selects a visa
    updateUrl([...selectedTypes, '']);
  }, [selectedTypes, updateUrl]);

  const visaMap = useMemo(() => {
    const map = new Map<string, Visa>();
    visas.forEach((v) => map.set(v.type, v));
    return map;
  }, [visas]);

  // Build slots: selectedTypes padded to at least DEFAULT_SLOTS
  const slots: (string | null)[] = [];
  for (let i = 0; i < Math.max(slotCount, DEFAULT_SLOTS); i++) {
    slots.push(selectedTypes[i] ?? null);
  }

  // Cap at MAX_SLOTS_DESKTOP
  const displaySlots = slots.slice(0, MAX_SLOTS_DESKTOP);

  const canAddSlot =
    displaySlots.length < MAX_SLOTS_DESKTOP &&
    displaySlots.every((s) => s !== null);

  return (
    <div className="mt-8">
      {/* Selector area */}
      <div className="flex flex-wrap items-center gap-3">
        {displaySlots.map((slug, index) => (
          <div key={index} className="flex items-center gap-2">
            <select
              value={slug ?? ''}
              onChange={(e) => handleSelect(index, e.target.value)}
              className="rounded-md border bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label={t('selectVisa')}
            >
              <option value="">{t('selectVisa')}</option>
              {summaries.map((s) => (
                <option
                  key={s.type}
                  value={s.type}
                  disabled={
                    selectedTypes.includes(s.type) && selectedTypes[index] !== s.type
                  }
                >
                  {s.shortName}
                </option>
              ))}
            </select>
            {slug && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
                aria-label={t('removeVisa')}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        {canAddSlot && (
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-md border border-dashed border-primary/40 px-4 py-2 text-sm text-primary hover:border-primary hover:bg-primary/5"
          >
            + {t('addVisa')}
          </button>
        )}
      </div>

      {/* Comparison grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 overflow-x-auto md:grid-cols-4">
        {displaySlots.map((slug, index) => {
          if (!slug) {
            return (
              <div
                key={`empty-${index}`}
                className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed bg-white p-6 text-center text-sm text-muted-foreground"
              >
                {t('emptySlot')}
              </div>
            );
          }

          const visa = visaMap.get(slug);
          if (!visa) {
            return (
              <div
                key={`missing-${index}`}
                className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed bg-white p-6 text-center text-sm text-muted-foreground"
              >
                {t('emptySlot')}
              </div>
            );
          }

          return (
            <ComparisonCard key={visa.type} visa={visa} country={country} />
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-xs text-muted-foreground">{t('disclaimer')}</p>
    </div>
  );
}
