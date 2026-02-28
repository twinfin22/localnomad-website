'use client';

import { useState } from 'react';
import { ChevronDown, Info, MapPin, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document as VisaDocument } from '@/lib/types/visa';
import type { useTranslations } from 'next-intl';

interface DocumentRowProps {
  doc: VisaDocument;
  isChecked: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
  t: ReturnType<typeof useTranslations<'VisaDetail'>>;
}

export function DocumentRow({
  doc,
  isChecked,
  onToggle,
  disabled,
  t,
}: DocumentRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex min-h-[52px] items-center gap-3 px-4 py-3">
        <label className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center">
          <input
            id={`doc-${doc.id}`}
            name={`doc-${doc.id}`}
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggle(doc.id)}
            disabled={disabled}
            aria-label={doc.name}
            className="h-5 w-5 cursor-pointer accent-primary disabled:opacity-50"
          />
        </label>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div className={cn('flex-1', isChecked && 'text-muted-foreground line-through')}>
            <span className="text-sm font-medium">
              {doc.name}
            </span>
            {doc.nameKorean && (
              <span className="ml-2 text-xs">
                ({doc.nameKorean})
              </span>
            )}
          </div>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <div className="border-t px-4 py-3 pl-[72px]">
          <p className="text-sm text-muted-foreground">{doc.description}</p>

          {doc.tips && doc.tips.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-foreground">
                {t('documentTips')}
              </p>
              <ul className="mt-1.5 space-y-1">
                {doc.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {doc.where_to_get && (
            <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
              <span>
                <span className="font-medium text-foreground">
                  {t('whereToGet')}:
                </span>{' '}
                {doc.where_to_get}
              </span>
            </div>
          )}

          {doc.processing_time && (
            <div className="mt-1.5 flex items-start gap-2 text-sm text-muted-foreground">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
              <span>
                <span className="font-medium text-foreground">
                  {t('estimatedTime')}:
                </span>{' '}
                {doc.processing_time}
              </span>
            </div>
          )}

          {doc.cost && (
            <div className="mt-1.5 flex items-start gap-2 text-sm text-muted-foreground">
              <DollarSign className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
              <span>
                <span className="font-medium text-foreground">
                  {t('cost')}:
                </span>{' '}
                {doc.cost}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
