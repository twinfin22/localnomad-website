'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  FileText,
  ListChecks,
  ChevronDown,
  Info,
  MapPin,
  Clock,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleChecklistItem } from '@/lib/actions/dashboard';
import type {
  Document as VisaDocument,
  ApplicationStep,
} from '@/lib/types/visa';
import type { ChecklistItem } from '@/lib/types/dashboard';

interface ActionZoneProps {
  documents: VisaDocument[];
  applicationSteps: ApplicationStep[];
  visaType: string;
  country: string;
  /** If provided, user is logged in */
  isLoggedIn?: boolean;
  /** If provided, user has this visa tracked in Supabase */
  userVisaId?: string;
  /** Pre-loaded checklist from Supabase for logged-in users */
  serverChecklist?: ChecklistItem[];
}

function readChecklist(key: string): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, boolean>;
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to read checklist from localStorage:', error.message);
      }
    }
  }
  return {};
}

function useChecklist(storageKey: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    typeof window !== 'undefined' ? readChecklist(storageKey) : {}
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setChecked(readChecklist(storageKey));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storageKey]);

  const toggle = useCallback(
    (docId: string) => {
      setChecked((prev) => {
        const next = { ...prev, [docId]: !prev[docId] };
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (error: unknown) {
          if (error instanceof Error) {
            if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to save checklist to localStorage:', error.message);
      }
          }
        }
        return next;
      });
    },
    [storageKey]
  );

  return { checked, toggle };
}

function useSupabaseChecklist(
  userVisaId: string,
  initialChecklist: ChecklistItem[]
) {
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialChecklist.forEach((item) => {
      map[item.document_id] = item.checked;
    });
    return map;
  });

  const toggle = useCallback(
    (docId: string) => {
      const newChecked = !checked[docId];
      setChecked((prev) => ({ ...prev, [docId]: newChecked }));

      startTransition(async () => {
        try {
          await toggleChecklistItem(userVisaId, docId, newChecked);
        } catch {
          setChecked((prev) => ({ ...prev, [docId]: !newChecked }));
        }
      });
    },
    [checked, userVisaId]
  );

  return { checked, toggle, isPending };
}

export function ActionZone({
  documents,
  applicationSteps,
  visaType,
  country,
  isLoggedIn,
  userVisaId,
  serverChecklist,
}: ActionZoneProps) {
  const t = useTranslations('VisaDetail');
  const tAuth = useTranslations('Auth');

  // Use Supabase checklist for logged-in users with tracked visa, localStorage otherwise
  const useServer = isLoggedIn && userVisaId && serverChecklist;

  const storageKey = `localnomad:checklist:${country}:${visaType}`;
  const localChecklist = useChecklist(storageKey);
  const supabaseChecklist = useSupabaseChecklist(
    userVisaId ?? '',
    serverChecklist ?? []
  );

  const checked = useServer ? supabaseChecklist.checked : localChecklist.checked;
  const toggleDocument = useServer
    ? supabaseChecklist.toggle
    : localChecklist.toggle;

  const requiredDocs = documents.filter((doc) => doc.required);
  const optionalDocs = documents.filter((doc) => !doc.required);
  const completedCount = documents.filter(
    (doc) => checked[doc.id]
  ).length;
  const totalCount = documents.length;

  return (
    <div>
      {/* Document Checklist */}
      <section className="mt-12">
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
              isChecked={!!checked[doc.id]}
              onToggle={toggleDocument}
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
                  isChecked={!!checked[doc.id]}
                  onToggle={toggleDocument}
                  t={t}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Save progress CTA for anonymous users */}
      {!isLoggedIn && (
        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {tAuth('saveProgress')}{' '}
            <a
              href={`/${country === 'korea' ? 'en' : 'en'}/login`}
              className="font-medium text-primary hover:underline"
            >
              {tAuth('logIn')}
            </a>
          </p>
        </div>
      )}

      {/* Application Steps */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t('applicationSteps')}</h2>
        </div>

        <div className="mt-6 space-y-4">
          {applicationSteps.map((step) => (
            <div
              key={step.id}
              className="rounded-lg border bg-white p-5"
            >
              <div className="flex items-start gap-4">
                {/* Step number circle */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold">{step.title}</h3>
                    {step.duration && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        <Clock className="h-3 w-3" />
                        {step.duration}
                      </span>
                    )}
                  </div>

                  <details className="mt-2">
                    <summary className="flex min-h-[44px] cursor-pointer items-center gap-1 text-sm text-primary hover:underline">
                      <ChevronDown className="chevron h-4 w-4 transition-transform duration-200 [details[open]>summary>&]:rotate-180" />
                      {t('details')}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    {step.tips && step.tips.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {step.tips.map((tip, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                    {step.links && step.links.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {step.links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary underline underline-offset-2 hover:text-primary/80"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </details>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DocumentRow({
  doc,
  isChecked,
  onToggle,
  t,
}: {
  doc: VisaDocument;
  isChecked: boolean;
  onToggle: (id: string) => void;
  t: ReturnType<typeof useTranslations<'VisaDetail'>>;
}) {
  return (
    <div className="rounded-lg border bg-white">
      <details>
        <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
          <label
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggle(doc.id)}
              aria-label={doc.name}
              className="h-5 w-5 cursor-pointer accent-primary"
            />
          </label>
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
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 [details[open]>summary>&]:rotate-180" />
        </summary>
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
      </details>
    </div>
  );
}
