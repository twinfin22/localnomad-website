'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { getActiveVisa, getChecklist, toggleChecklistItem } from '@/lib/actions/dashboard';
import type { Document as VisaDocument } from '@/lib/types/visa';
import { DocumentRow } from './document-row';
import type { ChecklistItem } from '@/lib/types/dashboard';

const COUNTRY_SLUG_TO_CODE: Record<string, string> = {
  korea: 'kr',
  taiwan: 'tw',
  japan: 'jp',
  china: 'cn',
};

interface DocumentChecklistProps {
  documents: VisaDocument[];
  visaType: string;
  country: string;
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

function useLocalChecklist(storageKey: string) {
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

export function DocumentChecklist({
  documents,
  visaType,
  country,
}: DocumentChecklistProps) {
  const t = useTranslations('VisaDetail');
  const tAuth = useTranslations('Auth');
  const { user, loading: authLoading } = useUser();

  const [userVisaId, setUserVisaId] = useState<string | undefined>();
  const [serverChecklist, setServerChecklist] = useState<ChecklistItem[]>([]);
  const [authResolved, setAuthResolved] = useState(false);

  // Fetch active visa + checklist when user is authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAuthResolved(true);
      return;
    }

    let cancelled = false;
    (async () => {
      const activeVisa = await getActiveVisa();
      if (cancelled) return;

      if (
        activeVisa &&
        activeVisa.country === COUNTRY_SLUG_TO_CODE[country] &&
        activeVisa.goal_visa_type === visaType
      ) {
        const checklist = await getChecklist(activeVisa.id);
        if (cancelled) return;
        setUserVisaId(activeVisa.id);
        setServerChecklist(checklist);
      }
      setAuthResolved(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, country, visaType]);

  const useServer = authResolved && !!user && !!userVisaId;

  const storageKey = `localnomad:checklist:${country}:${visaType}`;
  const localChecklist = useLocalChecklist(storageKey);
  const supabaseChecklist = useSupabaseChecklist(
    userVisaId ?? '',
    serverChecklist
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
      {authResolved && !user && (
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
    </div>
  );
}

// Backwards-compatible alias (deprecated — use DocumentChecklist)
export { DocumentChecklist as ActionZone };
