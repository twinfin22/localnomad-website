'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { Visa, VisaSummary } from '@/lib/types/visa';

const MAX_SLOTS = 4;
const DEFAULT_SLOTS = 2;

interface ComparisonToolProps {
  visas: Visa[];
  summaries: VisaSummary[];
  country: string;
}

function getWorkStatus(visa: Visa, labels: {
  allowed: string;
  restricted: string;
  notAllowed: string;
}) {
  if (!visa.workPermission.allowed) return labels.notAllowed;
  if (visa.workPermission.restrictions?.length) {
    return `${labels.restricted} — ${visa.workPermission.restrictions[0]}`;
  }
  return labels.allowed;
}

export function ComparisonTool({ visas, summaries, country }: ComparisonToolProps) {
  const t = useTranslations('Comparison');
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedTypes = useMemo(() => {
    const validTypes = new Set<Visa['type']>(summaries.map((summary) => summary.type));
    const selected: Visa['type'][] = [];

    for (const type of (searchParams.get('visas') ?? '').split(',')) {
      const visaType = type as Visa['type'];
      if (validTypes.has(visaType) && !selected.includes(visaType)) {
        selected.push(visaType);
      }
      if (selected.length === MAX_SLOTS) break;
    }

    return selected;
  }, [searchParams, summaries]);

  const [visibleSlots, setVisibleSlots] = useState(() =>
    Math.max(DEFAULT_SLOTS, selectedTypes.length),
  );

  const updateUrl = useCallback(
    (types: Visa['type'][]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (types.length) params.set('visas', types.join(','));
      else params.delete('visas');
      const query = params.toString();
      router.replace(`/${country}/compare${query ? `?${query}` : ''}`);
    },
    [country, router, searchParams],
  );

  const handleSelect = useCallback(
    (index: number, type: string) => {
      const next = [...selectedTypes];
      if (!type) next.splice(index, 1);
      else if (index < next.length) next[index] = type as Visa['type'];
      else next.push(type as Visa['type']);

      const unique = [...new Set(next)].slice(0, MAX_SLOTS);
      setVisibleSlots((slots) => Math.max(DEFAULT_SLOTS, Math.min(MAX_SLOTS, Math.max(slots, unique.length))));
      updateUrl(unique);
    },
    [selectedTypes, updateUrl],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const next = selectedTypes.filter((_, selectedIndex) => selectedIndex !== index);
      setVisibleSlots(Math.max(DEFAULT_SLOTS, next.length));
      updateUrl(next);
    },
    [selectedTypes, updateUrl],
  );

  const visaMap = useMemo(
    () => new Map(visas.map((visa) => [visa.type, visa])),
    [visas],
  );
  const selectedVisas = selectedTypes
    .map((type) => visaMap.get(type))
    .filter((visa): visa is Visa => Boolean(visa));
  const slotCount = Math.max(
    DEFAULT_SLOTS,
    Math.min(MAX_SLOTS, Math.max(visibleSlots, selectedTypes.length)),
  );
  const slots = Array.from({ length: slotCount }, (_, index) => selectedTypes[index] ?? '');

  const rows = [
    { label: t('duration'), value: (visa: Visa) => [visa.duration.initial, visa.duration.extension, visa.duration.maxTotal].filter(Boolean).join('\n') },
    { label: t('fees'), value: (visa: Visa) => [visa.fees.application, visa.fees.extension].filter(Boolean).join('\n') },
    { label: t('income'), value: (visa: Visa) => visa.incomeRequirement ? `${visa.incomeRequirement.amount} ${visa.incomeRequirement.currency}${visa.incomeRequirement.notes ? ` — ${visa.incomeRequirement.notes}` : ''}` : t('noIncome') },
    { label: t('processing'), value: (visa: Visa) => visa.processingTime.governmentReview },
    { label: t('work'), value: (visa: Visa) => getWorkStatus(visa, { allowed: t('allowed'), restricted: t('restricted'), notAllowed: t('notAllowed') }) },
    { label: t('documents'), value: (visa: Visa) => String(visa.documents.length) },
    { label: t('keyRequirement'), value: (visa: Visa) => visa.keyRequirement ?? '—' },
  ];

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        {slots.map((type, index) => (
          <div key={index} className="flex items-center gap-2">
            <label htmlFor={`visa-select-${index}`} className="sr-only">
              {t('selectVisa')} {index + 1}
            </label>
            <select
              id={`visa-select-${index}`}
              value={type}
              onChange={(event) => handleSelect(index, event.target.value)}
              className="rounded-md border bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">{t('selectVisa')}</option>
              {summaries.map((summary) => (
                <option key={summary.type} value={summary.type} disabled={selectedTypes.includes(summary.type) && type !== summary.type}>
                  {summary.shortName}
                </option>
              ))}
            </select>
            {type && (
              <button type="button" onClick={() => handleRemove(index)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-neutral-100 hover:text-foreground" aria-label={t('removeVisa')}>
                &times;
              </button>
            )}
          </div>
        ))}
        {slotCount < MAX_SLOTS && selectedTypes.length === slotCount && (
          <button type="button" onClick={() => setVisibleSlots((slots) => Math.min(MAX_SLOTS, slots + 1))} className="rounded-md border border-dashed border-primary/40 px-4 py-2 text-sm text-primary hover:border-primary hover:bg-primary/5">
            + {t('addVisa')}
          </button>
        )}
      </div>

      {selectedVisas.length ? (
        <div className="mt-8 overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-[720px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-primary/[0.03]">
                <th scope="col" className="sticky left-0 z-10 min-w-36 bg-[#f7fafb] px-4 py-4 font-medium text-muted-foreground">{t('overview')}</th>
                {selectedVisas.map((visa) => (
                  <th key={visa.type} scope="col" className="min-w-48 px-4 py-4 align-top font-normal">
                    <p className="font-lora text-lg font-bold text-primary">{visa.shortName}</p>
                    <p className="mt-1 font-normal text-muted-foreground">{visa.tagline}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b last:border-b-0">
                  <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-4 align-top font-medium text-foreground">{row.label}</th>
                  {selectedVisas.map((visa) => (
                    <td key={visa.type} className="whitespace-pre-line px-4 py-4 align-top leading-relaxed text-muted-foreground">{row.value(visa)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-4" />
                {selectedVisas.map((visa) => (
                  <td key={visa.type} className="px-4 py-4">
                    <Link href={`/${country}/visa/${visa.type}`} className="font-medium text-primary hover:underline">{t('viewDetails')} &rarr;</Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-8 rounded-lg border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">{t('emptySlot')}</p>
      )}

      <p className="mt-8 text-xs text-muted-foreground">{t('disclaimer')}</p>
    </div>
  );
}
