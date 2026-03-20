'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  TriangleAlert,
  Lightbulb,
  ChevronRight,
  DollarSign,
  Briefcase,
  Shield,
  Stamp,
  BarChart3,
  GraduationCap,
  Building2,
  Globe,
  FileText,
  Landmark,
  Award,
  Clock,
  Heart,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { linkifyText } from '@/lib/linkify-text';
import type { Visa, KoreaVisa, Requirement, CommunityTip } from '@/lib/types/visa';

interface RequirementsTabProps {
  visa: Visa;
  communityTips?: CommunityTip[];
}

const FOLDABLE_REQUIREMENT_IDS = new Set([
  'no-criminal-record',
  'good-health',
  'valid-passport',
  'health-check',
  'passport-validity',
]);

const CATEGORY_ICON_MAP: Record<string, typeof Briefcase> = {
  visaStatus: Stamp,
  pointsSystem: BarChart3,
  income: DollarSign,
  investment: Landmark,
  'legitimate-funds': DollarSign,
  'employer-sponsorship': Building2,
  'education-masters': GraduationCap,
  'salary-parity': DollarSign,
  employment: Briefcase,
  education: GraduationCap,
  age: Clock,
  nationality: Globe,
  insurance: Shield,
  'professional-field': Award,
  'salary-threshold': DollarSign,
  'tax-residency': Landmark,
  'coe-required': FileText,
  'sponsor-employer': Building2,
  'language-ability': Globe,
  'work-permit': FileText,
  'psb-registration': Landmark,
  'health-check': Heart,
};

/** Split a notes paragraph into individual sentences for bullet display.
 *  Only splits after a period followed by a space and uppercase letter,
 *  avoiding false splits on abbreviations like "U.S." or "e.g." */
function splitNotes(notes: string): string[] {
  return notes
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function RequirementsTab({ visa, communityTips = [] }: RequirementsTabProps) {
  const t = useTranslations('VisaDetail');

  const isKoreaVisa = visa.country === 'kr';
  const koreaVisa = isKoreaVisa ? (visa as KoreaVisa) : null;

  // Group eligibility items by category
  const grouped = useMemo(() => {
    const map = new Map<string, Requirement[]>();
    for (const item of visa.eligibility) {
      const cat = item.category ?? '_uncategorized';
      const arr = map.get(cat) ?? [];
      arr.push(item);
      map.set(cat, arr);
    }
    return map;
  }, [visa.eligibility]);

  // Render categories in the order they appear in the data
  const orderedCategories = useMemo(() => {
    return Array.from(grouped.keys());
  }, [grouped]);

  const renderItem = (item: Requirement) => {
    const isNegative = item.sentiment === 'negative';
    const isOptional = !item.required && !isNegative;

    // Text label + color bar style
    const barColor = isNegative
      ? 'border-l-red-400'
      : isOptional
        ? 'border-l-slate-300'
        : 'border-l-primary';
    const labelText = isNegative
      ? t('labelNotAllowed')
      : isOptional
        ? t('labelOptional')
        : t('labelRequired');
    const labelColor = isNegative
      ? 'text-red-600 bg-red-50'
      : isOptional
        ? 'text-slate-500 bg-slate-100'
        : 'text-primary bg-primary/10';

    return (
      <li key={item.id} className={cn('border-l-[3px] py-2 pl-4', barColor)}>
        <div className="flex items-center gap-2">
          <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', labelColor)}>
            {labelText}
          </span>
          <span className={cn('text-base font-medium', isNegative && 'text-red-600')}>
            {item.label}
          </span>
        </div>
        {item.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {linkifyText(item.description)}
          </p>
        )}
        {item.tips && item.tips.length > 0 && (
          <ul className="mt-2 space-y-1">
            {item.tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {linkifyText(tip)}
              </li>
            ))}
          </ul>
        )}
        {item.warnings && item.warnings.length > 0 && (
          <div className="mt-2 flex items-start gap-2 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div className="space-y-1">
              {item.warnings.map((warning, i) => (
                <p key={i}>{warning}</p>
              ))}
            </div>
          </div>
        )}
      </li>
    );
  };

  const categoryLabel = (category: string) => {
    const key = `category.${category}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic key lookup with fallback
    if (t.has(key as any)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return t(key as any);
    }
    return category
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const renderCategoryHeader = (category: string) => {
    if (category === '_uncategorized') return null;
    const Icon = CATEGORY_ICON_MAP[category] ?? FileText;
    return (
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-lora text-lg font-semibold">{categoryLabel(category)}</h3>
      </div>
    );
  };

  return (
    <div>
      {/* Responsive card grid: 1col mobile (accordion), 2col desktop (cards) */}
      <div className={cn("grid grid-cols-1 gap-4", orderedCategories.length > 1 && "md:grid-cols-2")}>
        {orderedCategories.map((category) => {
          const allItems = grouped.get(category) ?? [];
          const primaryItems = allItems.filter(item => !FOLDABLE_REQUIREMENT_IDS.has(item.id));
          const foldableItems = allItems.filter(item => FOLDABLE_REQUIREMENT_IDS.has(item.id));
          const isIncome = category === 'income';

          // Group primary items by status for visual breaks
          const requiredItems = primaryItems.filter(i => i.required && i.sentiment !== 'negative');
          const optionalItems = primaryItems.filter(i => !i.required && i.sentiment !== 'negative');
          const negativeItems = primaryItems.filter(i => i.sentiment === 'negative');
          const statusGroups = [requiredItems, optionalItems, negativeItems].filter(g => g.length > 0);

          return (
            <details
              key={category}
              open
              className="group/card rounded-lg border bg-white p-4 md:open:col-span-1"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
                {renderCategoryHeader(category)}
                <svg
                  className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open/card:rotate-90 md:hidden"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>

              <div className="mt-3">
                <div className="space-y-4">
                  {statusGroups.map((group, gi) => (
                    <ul key={gi}>{group.map(renderItem)}</ul>
                  ))}
                </div>

                {foldableItems.length > 0 && (
                  <details className="mt-4">
                    <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <ChevronRight className="h-4 w-4 transition-transform [[open]>&]:rotate-90" />
                      {t('additionalRequirements', { count: foldableItems.length })}
                    </summary>
                    <ul className="mt-3">{foldableItems.map(renderItem)}</ul>
                  </details>
                )}

                {/* Income metadata */}
                {isIncome && visa.incomeRequirement && (
                  <div className="mt-4">
                    <p className="font-lora text-2xl font-bold text-primary">
                      ${visa.incomeRequirement.amount}{' '}
                      <span className="text-base font-normal text-muted-foreground">
                        {visa.incomeRequirement.currency} /{' '}
                        {visa.incomeRequirement.period}
                      </span>
                    </p>
                    {visa.incomeRequirement.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {visa.incomeRequirement.notes}
                      </p>
                    )}
                    {visa.incomeRequirement.proofMethods &&
                      visa.incomeRequirement.proofMethods.length > 0 && (
                        <details className="mt-3">
                          <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium text-primary hover:underline">
                            {t('howToProveIncome')}
                          </summary>
                          <ul className="mt-2 space-y-1.5 pl-4">
                            {visa.incomeRequirement.proofMethods.map(
                              (method, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                                  {method}
                                </li>
                              )
                            )}
                          </ul>
                        </details>
                      )}
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>

      {/* Work Permission */}
      {visa.workPermission && (
        <>
          <div className="my-5 border-t" />
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h3 className="font-lora text-lg font-semibold">{t('workPermission')}</h3>
          </div>
          <div className="pl-7">
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                visa.workPermission.allowed ? 'text-green-600' : 'text-red-600'
              )}
            >
              {visa.workPermission.allowed
                ? t('workAllowed')
                : t('workNotAllowed')}
            </p>
            {visa.workPermission.restrictions &&
              visa.workPermission.restrictions.length > 0 && (
                <ul className="mt-3">
                  {visa.workPermission.restrictions.map(
                    (restriction, index) => (
                      <li
                        key={index}
                        className="border-l-[3px] border-l-amber-400 py-2 pl-4"
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                            {t('labelRestriction')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {restriction}
                          </span>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              )}
            {visa.workPermission.notes && (
              <p className="mt-2 text-sm text-muted-foreground">
                {visa.workPermission.notes}
              </p>
            )}
          </div>
        </>
      )}

      {/* Insurance + Tax */}
      {(koreaVisa?.insuranceRequirement || koreaVisa?.taxImplications) && (
        <>
          <div className="my-5 border-t" />
          <div className={cn("grid gap-6", koreaVisa?.insuranceRequirement && koreaVisa?.taxImplications && "sm:grid-cols-2")}>
            {koreaVisa?.insuranceRequirement && (
              <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-lora text-lg font-semibold">
                    {t('insuranceDetails')}
                  </h3>
                </div>
                {/* Key-value pairs */}
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-foreground">{t('minimumCoverage')}:</dt>
                    <dd className="text-muted-foreground">{koreaVisa.insuranceRequirement.minimumCoverage}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-foreground">{t('insuranceType')}:</dt>
                    <dd className="text-muted-foreground">{koreaVisa.insuranceRequirement.type}</dd>
                  </div>
                </dl>
                {/* Notes split into bullets */}
                {koreaVisa.insuranceRequirement.notes && (
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {splitNotes(koreaVisa.insuranceRequirement.notes).map((note, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                        {linkifyText(note)}
                      </li>
                    ))}
                  </ul>
                )}
                {koreaVisa.insuranceRequirement.source && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {t('source')}: {koreaVisa.insuranceRequirement.source}
                  </p>
                )}
              </div>
            )}

            {koreaVisa?.taxImplications && (
              <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="font-lora text-lg font-semibold">
                    {t('taxImplications')}
                  </h3>
                </div>
                {/* Key-value pairs */}
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-foreground">{t('taxThreshold')}:</dt>
                    <dd className="text-muted-foreground">{koreaVisa.taxImplications.threshold}</dd>
                  </div>
                </dl>
                {/* Notes split into bullets */}
                {koreaVisa.taxImplications.notes && (
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {splitNotes(koreaVisa.taxImplications.notes).map((note, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                        {linkifyText(note)}
                      </li>
                    ))}
                  </ul>
                )}
                {koreaVisa.taxImplications.source && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {t('source')}: {koreaVisa.taxImplications.source}
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {communityTips.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <ul className="space-y-2">
            {communityTips.map((ct) => (
              <li key={ct.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="italic">{ct.tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
