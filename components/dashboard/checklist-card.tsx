'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';
import { toggleChecklistItem } from '@/lib/actions/dashboard';
import { DocumentRow } from '@/components/visa/document-row';
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
          <DocumentRow
            key={doc.id}
            doc={doc}
            isChecked={!!checkedMap[doc.id]}
            onToggle={handleToggle}
            disabled={isPending}
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
              <DocumentRow
                key={doc.id}
                doc={doc}
                isChecked={!!checkedMap[doc.id]}
                onToggle={handleToggle}
                disabled={isPending}
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

