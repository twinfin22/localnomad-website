'use client';

import { useState } from 'react';
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

const isNegative = (value: string) =>
  value.startsWith('No') || value.startsWith('Not ');

export function SEAComparisonTable({ data }: SEAComparisonTableProps) {
  const [visible, setVisible] = useState<Set<string>>(
    () => new Set(data.visas.map((v) => v.country)),
  );

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-lora text-2xl font-bold text-primary">
          {data.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{data.description}</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Last updated: {data.lastUpdated}
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Compare:</p>
        <div className="flex flex-wrap gap-2">
          {data.visas.map((visa) => {
            const active = visible.has(visa.country);
            return (
              <button
                key={visa.country}
                type="button"
                onClick={() => toggle(visa.country)}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                  active
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-neutral-200 bg-neutral-100 text-muted-foreground/60 hover:border-neutral-400 hover:bg-neutral-200',
                )}
              >
                {active && <span className="text-xs">✓</span>}
                <span>{FLAG_MAP[visa.country]}</span>
                {visa.country}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[160px] border-b border-r bg-[#1B4965] px-4 py-3 text-left text-xs font-semibold text-white">
                Country
              </th>
              {filtered.map((visa) => (
                <th
                  key={visa.country}
                  className="min-w-[200px] border-b bg-[#1B4965] px-4 py-3 text-left text-xs font-semibold text-white"
                >
                  <span className="mr-1.5 text-base">{FLAG_MAP[visa.country]}</span>
                  {visa.country}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.columns.map((column, rowIndex) => (
              <tr
                key={column.id}
                className={cn(rowIndex % 2 === 1 && 'bg-neutral-50')}
              >
                <td className="sticky left-0 z-10 border-r bg-white px-4 py-3 text-xs font-medium text-primary">
                  {column.displayName}
                </td>
                {filtered.map((visa) => {
                  const value = visa.data[column.id] ?? '';
                  const negative =
                    column.dataType === 'boolean-text' && isNegative(value);
                  return (
                    <td
                      key={`${visa.country}-${column.id}`}
                      className={cn(
                        'px-4 py-3 text-xs text-muted-foreground',
                        negative && 'bg-red-50 text-red-700',
                      )}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.sources.length > 0 && (
        <div>
          <h3 className="font-lora text-lg font-semibold text-primary">Sources</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {data.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground/80">{data.disclaimer}</p>
    </div>
  );
}
