'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, ChevronDown, Info, MapPin, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleChecklistItem } from '@/lib/actions/dashboard';
import type { Document as VisaDocument } from '@/lib/types/visa';
import type { ChecklistItem } from '@/lib/types/dashboard';

interface ChecklistCardProps {
  documents: VisaDocument[];
  userVisaId: string;
  initialChecklist: ChecklistItem[];
}

export function ChecklistCard({
  documents,
  userVisaId,
  initialChecklist,
}: ChecklistCardProps) {
  const t = useTranslations('VisaDetail');
  const [isPending, startTransition] = useTransition();
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialChecklist.forEach((item) => {
      map[item.document_id] = item.checked;
    });
    return map;
  });

  const requiredDocs = documents.filter((doc) => doc.required);
  const optionalDocs = documents.filter((doc) => !doc.required);
  const completedCount = documents.filter((doc) => checkedMap[doc.id]).length;
  const totalCount = documents.length;

  const handleToggle = (docId: string) => {
    const newChecked = !checkedMap[docId];

    // Optimistic update
    setCheckedMap((prev) => ({ ...prev, [docId]: newChecked }));

    startTransition(async () => {
      try {
        await toggleChecklistItem(userVisaId, docId, newChecked);
      } catch {
        // Revert on error
        setCheckedMap((prev) => ({ ...prev, [docId]: !newChecked }));
      }
    });
  };

  return (
    <section>
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">
          {t('requiredDocuments')}{' '}
          <span className="text-base font-normal text-muted-foreground">
            ({t('completed', { count: completedCount, total: totalCount })})
          </span>
        </h2>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{
            width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Required documents */}
      <div className="mt-6 space-y-1">
        {requiredDocs.map((doc) => (
          <DashboardDocRow
            key={doc.id}
            doc={doc}
            isChecked={!!checkedMap[doc.id]}
            onToggle={handleToggle}
            isPending={isPending}
            t={t}
          />
        ))}
      </div>

      {/* Optional documents */}
      {optionalDocs.length > 0 && (
        <div className="mt-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
            {t('optionalDocuments')}
          </h3>
          <div className="mt-3 space-y-1">
            {optionalDocs.map((doc) => (
              <DashboardDocRow
                key={doc.id}
                doc={doc}
                isChecked={!!checkedMap[doc.id]}
                onToggle={handleToggle}
                isPending={isPending}
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function DashboardDocRow({
  doc,
  isChecked,
  onToggle,
  isPending,
  t,
}: {
  doc: VisaDocument;
  isChecked: boolean;
  onToggle: (id: string) => void;
  isPending: boolean;
  t: ReturnType<typeof useTranslations<'VisaDetail'>>;
}) {
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
            disabled={isPending}
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
