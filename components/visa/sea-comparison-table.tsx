'use client';

import { Fragment, useState } from 'react';
import { cn } from '@/lib/utils';
import type { SEAComparisonData } from '@/lib/types/sea';

interface SEAComparisonTableProps {
  data: SEAComparisonData;
}

const FLAG_MAP: Record<string, string> = {
  Thailand: '🇹🇭',
  Indonesia: '🇮🇩',
  Malaysia: '🇲🇾',
  Philippines: '🇵🇭',
};

const VISA_SHORT: Record<string, string> = {
  Thailand: 'DTV',
  Indonesia: 'E33G',
  Malaysia: 'DE Rantau',
  Philippines: 'DNV',
};

// Row grouping for visual scanning
const ROW_GROUPS: { label: string; ids: string[] }[] = [
  {
    label: 'Basics',
    ids: ['officialName', 'visaCategory', 'duration', 'maxStay', 'extensionRules'],
  },
  {
    label: 'Financial',
    ids: ['financialRequirement', 'incomeProof', 'applicationFee'],
  },
  {
    label: 'Rules & Eligibility',
    ids: [
      'healthInsurance',
      'remoteWorkAllowed',
      'localWorkAllowed',
      'processingTime',
      'dependents',
      'multipleEntry',
    ],
  },
  {
    label: 'Tax & Updates',
    ids: ['taxImplications', 'recentChanges'],
  },
];

// Key fields to highlight in the table
const KEY_FIELDS = new Set([
  'duration',
  'maxStay',
  'financialRequirement',
  'applicationFee',
]);

const isNegative = (value: string) =>
  value.startsWith('No') || value.startsWith('Not ');

const isPositive = (value: string) =>
  value.startsWith('Yes');

// Split "main text †footnote" into [main, footnote | null]
function splitFootnote(text: string): [string, string | null] {
  const idx = text.indexOf('†');
  if (idx === -1) return [text, null];
  return [text.slice(0, idx).trim(), text.slice(idx + 1).trim()];
}

function FootnoteTooltip({ note }: { note: string }) {
  return (
    <span className="group/fn relative ml-1 inline-flex cursor-help">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-[10px] font-medium text-amber-700">
        !
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-border/60 bg-white px-3 py-2 text-xs leading-relaxed text-muted-foreground opacity-0 shadow-lg transition-opacity group-hover/fn:pointer-events-auto group-hover/fn:opacity-100">
        {note}
      </span>
    </span>
  );
}

function BooleanBadge({ value }: { value: string }) {
  if (isPositive(value)) {
    const detail = value.replace(/^Yes\s*[—–-]\s*/, '');
    const [main, footnote] = splitFootnote(detail);
    return (
      <span>
        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">
          ✓
        </span>
        <span className="text-emerald-800">{main || 'Yes'}</span>
        {footnote && <FootnoteTooltip note={footnote} />}
      </span>
    );
  }
  if (isNegative(value)) {
    const detail = value.replace(/^No\s*[—–-]\s*|^Not\s+/, '');
    const [main, footnote] = splitFootnote(detail);
    return (
      <span>
        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-red-700">
          ✗
        </span>
        <span className="text-red-800">{main ? `No — ${main}` : 'No'}</span>
        {footnote && <FootnoteTooltip note={footnote} />}
      </span>
    );
  }
  const [main, footnote] = splitFootnote(value);
  return (
    <span>
      {main}
      {footnote && <FootnoteTooltip note={footnote} />}
    </span>
  );
}

// Extract a short value for summary cards
function extractShort(visa: { data: Record<string, string> }, field: string): string {
  const val = visa.data[field] ?? '';
  // For duration, grab just the first part
  if (field === 'duration') {
    const m = val.match(/^[\d]+ (?:year|month|day)s?/i);
    return m ? m[0] : val.split('.')[0];
  }
  // For financial requirement, grab the first monetary amount
  if (field === 'financialRequirement') {
    const m = val.match(/(?:USD|THB|IDR|MYR)\s?[\d,]+(?:\/\w+)?/);
    return m ? m[0] : val.split(',')[0];
  }
  // For application fee
  if (field === 'applicationFee') {
    const m = val.match(/~?\s?USD\s?[\d,–-]+/);
    return m ? m[0].trim() : val.split('(')[0].trim();
  }
  return val;
}

export function SEAComparisonTable({ data }: SEAComparisonTableProps) {
  const [visible, setVisible] = useState<Set<string>>(
    () => new Set(data.visas.map((v) => v.country)),
  );
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const toggle = (country: string) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(country)) {
        if (next.size <= 1) return prev;
        next.delete(country);
      } else {
        next.add(country);
      }
      return next;
    });
  };

  const filtered = data.visas.filter((v) => visible.has(v.country));

  // Build column lookup
  const columnMap = new Map(data.columns.map((c) => [c.id, c]));

  return (
    <div className="space-y-8">
      {/* Toggle hint */}
      <p className="text-center text-sm text-muted-foreground/60">
        Tap a card to toggle countries in the comparison below
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {data.visas.map((visa) => {
          const active = visible.has(visa.country);
          return (
            <button
              key={visa.country}
              type="button"
              onClick={() => toggle(visa.country)}
              className={cn(
                'group relative cursor-pointer rounded-xl border p-4 text-left transition-all duration-200',
                active
                  ? 'border-primary/30 bg-white shadow-sm hover:shadow-md'
                  : 'border-neutral-200 bg-neutral-50 opacity-50 hover:opacity-75',
              )}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  ✓
                </span>
              )}
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{FLAG_MAP[visa.country]}</span>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {visa.country}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {VISA_SHORT[visa.country]}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Duration</span>
                  <span className="font-lora text-sm font-bold text-primary">
                    {extractShort(visa, 'duration')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Fee</span>
                  <span className="font-lora text-sm font-bold">
                    {extractShort(visa, 'applicationFee')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Income</span>
                  <span className="font-lora text-sm font-bold">
                    {extractShort(visa, 'financialRequirement')}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grouped comparison table */}
      <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[160px] border-b border-r bg-primary px-5 py-3.5 text-left text-sm font-semibold text-white">
                &nbsp;
              </th>
              {filtered.map((visa) => (
                <th
                  key={visa.country}
                  className="min-w-[220px] border-b bg-primary px-5 py-3.5 text-left text-sm font-semibold text-white"
                >
                  <span className="mr-1.5 text-base">
                    {FLAG_MAP[visa.country]}
                  </span>
                  {visa.country}
                  <span className="ml-1.5 font-normal text-white/60">
                    {VISA_SHORT[visa.country]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROW_GROUPS.map((group) => {
              const groupColumns = group.ids
                .map((id) => columnMap.get(id))
                .filter(Boolean);
              if (groupColumns.length === 0) return null;

              return (
                <Fragment key={group.label}>
                  {/* Group header */}
                  <tr>
                    <td
                      colSpan={filtered.length + 1}
                      className="border-b border-t border-primary/10 bg-primary/[0.04] px-5 py-2.5 text-xs font-semibold tracking-wide text-primary uppercase"
                    >
                      {group.label}
                    </td>
                  </tr>
                  {/* Group rows */}
                  {groupColumns.map((column, rowIndex) => {
                    if (!column) return null;
                    const isKey = KEY_FIELDS.has(column.id);
                    return (
                      <tr
                        key={column.id}
                        className={cn(
                          'transition-colors hover:bg-primary/[0.02]',
                          rowIndex % 2 === 1 && 'bg-neutral-50/50',
                        )}
                      >
                        <td
                          className={cn(
                            'sticky left-0 z-10 border-r bg-white px-5 py-3.5 text-sm text-primary',
                            isKey ? 'font-bold' : 'font-medium',
                          )}
                        >
                          {column.displayName}
                        </td>
                        {filtered.map((visa) => {
                          const value = visa.data[column.id] ?? '';
                          const isBool = column.dataType === 'boolean-text';
                          return (
                            <td
                              key={`${visa.country}-${column.id}`}
                              className={cn(
                                'px-5 py-3.5 text-sm leading-relaxed text-muted-foreground',
                                isKey && 'font-semibold text-foreground',
                              )}
                            >
                              {isBool ? (
                                <BooleanBadge value={value} />
                              ) : (
                                value
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sources — collapsible */}
      {data.sources.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-white">
          <button
            type="button"
            onClick={() => setSourcesOpen((o) => !o)}
            className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/[0.02]"
          >
            <span>Sources ({data.sources.length})</span>
            <span
              className={cn(
                'text-xs text-muted-foreground transition-transform',
                sourcesOpen && 'rotate-180',
              )}
            >
              ▼
            </span>
          </button>
          {sourcesOpen && (
            <ul className="border-t px-4 py-3 space-y-2">
              {data.sources.map((source) => (
                <li key={source.url} className="text-sm text-muted-foreground">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-primary/30 underline-offset-2 hover:text-primary hover:decoration-primary"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-sm leading-relaxed text-muted-foreground/70">
        {data.disclaimer}
      </p>

      {/* Last updated */}
      <p className="text-xs text-muted-foreground/50">
        Last updated: {data.lastUpdated}
      </p>
    </div>
  );
}

