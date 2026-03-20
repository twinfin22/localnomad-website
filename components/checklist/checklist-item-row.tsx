'use client';

import { useState } from 'react';
import { ChevronDown, ExternalLink, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChecklistItem } from '@/lib/types/checklist';

interface ChecklistItemRowProps {
  item: ChecklistItem;
  isChecked: boolean;
  onToggle: (id: string) => void;
}

export function ChecklistItemRow({
  item,
  isChecked,
  onToggle,
}: ChecklistItemRowProps) {
  const [open, setOpen] = useState(false);
  const hasDetail = item.description || item.tips?.length || item.warnings?.length || item.link;

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex min-h-[52px] items-center gap-3 px-4 py-3">
        <label className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggle(item.id)}
            aria-label={item.label}
            className="h-5 w-5 cursor-pointer accent-primary"
          />
        </label>
        <button
          type="button"
          onClick={() => hasDetail && setOpen(!open)}
          aria-expanded={hasDetail ? open : undefined}
          className={cn(
            'flex flex-1 items-center gap-3 text-left',
            !hasDetail && 'cursor-default'
          )}
        >
          <div className={cn('flex-1', isChecked && 'text-muted-foreground line-through')}>
            <span className="text-sm font-medium">{item.label}</span>
            {!item.required && (
              <span className="ml-2 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                optional
              </span>
            )}
          </div>
          {hasDetail && (
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          )}
        </button>
      </div>

      {open && hasDetail && (
        <div className="border-t px-4 py-3 pl-[72px]">
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}

          {item.tips && item.tips.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {item.tips.map((tip, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground"
                >
                  {tip}
                </li>
              ))}
            </ul>
          )}

          {item.link && (
            <a
              href={item.link}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              {...(item.link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {item.linkLabel || 'Learn more'}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {item.warnings && item.warnings.length > 0 && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="space-y-1">
                {item.warnings.map((warning, i) => (
                  <p key={i}>{warning}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
