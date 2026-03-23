'use client';

import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';
import { useSimpleChecklist } from '@/hooks/use-local-checklist';
import type { Document as VisaDocument } from '@/lib/types/visa';
import { DocumentRow } from './document-row';

type DocSourceKey = 'docSourceSelf' | 'docSourceEmployer' | 'docSourceInstitution' | 'docSourceGovernment';

/** Categorize a document's where_to_get into a translation key */
function categorizeSource(whereToGet?: string): DocSourceKey {
  if (!whereToGet) return 'docSourceSelf';
  const lower = whereToGet.toLowerCase();
  if (lower.includes('employer') || lower.includes('company') || lower.includes('sponsor'))
    return 'docSourceEmployer';
  if (lower.includes('universit') || lower.includes('school') || lower.includes('institution') || lower.includes('apostil'))
    return 'docSourceInstitution';
  if (lower.includes('government') || lower.includes('immigration') || lower.includes('embassy') || lower.includes('consulate') || lower.includes('police') || lower.includes('office'))
    return 'docSourceGovernment';
  return 'docSourceSelf';
}

interface DocumentChecklistProps {
  documents: VisaDocument[];
  visaType: string;
  country: string;
}

export function DocumentChecklist({
  documents,
  visaType,
  country,
}: DocumentChecklistProps) {
  const t = useTranslations('VisaDetail');

  const storageKey = `localnomad:checklist:${country}:${visaType}`;
  const { checked, toggle: toggleDocument } = useSimpleChecklist(storageKey);

  const completedCount = documents.filter(
    (doc) => checked[doc.id]
  ).length;
  const totalCount = documents.length;

  // Group documents by source (where_to_get) for visual organization
  const groupBySource = (docs: typeof documents) => {
    const groups = new Map<DocSourceKey, typeof documents>();
    for (const doc of docs) {
      const source = categorizeSource(doc.where_to_get);
      const arr = groups.get(source) ?? [];
      arr.push(doc);
      groups.set(source, arr);
    }
    return groups;
  };

  const sourceLabels: Record<DocSourceKey, string> = {
    docSourceSelf: t('docSourceSelf'),
    docSourceEmployer: t('docSourceEmployer'),
    docSourceInstitution: t('docSourceInstitution'),
    docSourceGovernment: t('docSourceGovernment'),
  };

  const requiredDocs = documents.filter((doc) => doc.required);
  const optionalDocs = documents.filter((doc) => !doc.required);
  const requiredGroups = groupBySource(requiredDocs);

  return (
    <div>
      {/* Document Checklist */}
      <section className="mt-8">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-lora text-xl font-semibold">
            {t('requiredDocuments')}{' '}
            <span className="text-base font-normal text-muted-foreground">
              ({t('completed', { count: completedCount, total: totalCount })})
            </span>
          </h2>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Required documents grouped by source */}
        <div className="mt-6 space-y-6">
          {Array.from(requiredGroups.entries()).map(([source, docs]) => (
            <div key={source}>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {sourceLabels[source]}
              </h3>
              <div className="space-y-1">
                {docs.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    isChecked={!!checked[doc.id]}
                    onToggle={toggleDocument}
                    t={t}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Optional documents */}
        {optionalDocs.length > 0 && (
          <div className="mt-8">
            <h3 className="font-lora flex items-center gap-2 text-lg font-semibold text-muted-foreground">
              {t('optionalDocuments')}
            </h3>
            <div className="mt-3 space-y-1">
              {optionalDocs.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  isChecked={!!checked[doc.id]}
                  onToggle={toggleDocument}
                  t={t}
                />
              ))}
            </div>
          </div>
        )}
      </section>

    </div>
  );
}

// Backwards-compatible alias (deprecated — use DocumentChecklist)
export { DocumentChecklist as ActionZone };
