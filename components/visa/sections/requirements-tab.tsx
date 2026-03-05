'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Check,
  X,
  Zap,
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

const CATEGORY_ICON_MAP: Record<string, typeof Check> = {
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
    const isPositive = item.sentiment === 'positive';
    return (
      <li key={item.id} className="flex items-start gap-3">
        {isNegative ? (
          <X className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        ) : isPositive ? (
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        ) : item.required ? (
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        ) : (
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        )}
        <div>
          <span
            className={cn(
              'text-base font-medium',
              isNegative && 'text-red-600',
              isPositive && 'text-green-600'
            )}
          >
            {item.label}
          </span>
          {item.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
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
        </div>
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
    <div className="rounded-lg border bg-white p-5">
      {orderedCategories.map((category, catIndex) => {
        const allItems = grouped.get(category) ?? [];
        const primaryItems = allItems.filter(item => !FOLDABLE_REQUIREMENT_IDS.has(item.id));
        const foldableItems = allItems.filter(item => FOLDABLE_REQUIREMENT_IDS.has(item.id));
        const isIncome = category === 'income';

        return (
          <div key={category}>
            {catIndex > 0 && <div className="my-6 border-t" />}

            {renderCategoryHeader(category)}

            <div className="pl-7">
              <ul className="mt-3 space-y-3">{primaryItems.map(renderItem)}</ul>

              {foldableItems.length > 0 && (
                <details className="mt-4">
                  <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ChevronRight className="h-4 w-4 transition-transform [[open]>&]:rotate-90" />
                    {t('additionalRequirements', { count: foldableItems.length })}
                  </summary>
                  <ul className="mt-3 space-y-3">{foldableItems.map(renderItem)}</ul>
                </details>
              )}

              {/* Merge income metadata into the income category */}
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
          </div>
        );
      })}

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
                <ul className="mt-2 space-y-1">
                  {visa.workPermission.restrictions.map(
                    (restriction, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                        {restriction}
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
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-lora text-lg font-semibold">
                    {t('insuranceDetails')}
                  </h3>
                </div>
                <div className="mt-3 space-y-2 pl-7 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">
                      {t('minimumCoverage')}:
                    </span>{' '}
                    {koreaVisa.insuranceRequirement.minimumCoverage}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      {t('insuranceType')}:
                    </span>{' '}
                    {koreaVisa.insuranceRequirement.type}
                  </p>
                  <p>{koreaVisa.insuranceRequirement.notes}</p>
                  {koreaVisa.insuranceRequirement.source && (
                    <p className="text-xs text-muted-foreground">
                      {t('source')}: {koreaVisa.insuranceRequirement.source}
                    </p>
                  )}
                </div>
              </div>
            )}

            {koreaVisa?.taxImplications && (
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="font-lora text-lg font-semibold">
                    {t('taxImplications')}
                  </h3>
                </div>
                <div className="mt-3 space-y-2 pl-7 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">{t('taxThreshold')}:</span>{' '}
                    {koreaVisa.taxImplications.threshold}
                  </p>
                  <p>{koreaVisa.taxImplications.notes}</p>
                  {koreaVisa.taxImplications.source && (
                    <p className="text-xs text-muted-foreground">
                      {t('source')}: {koreaVisa.taxImplications.source}
                    </p>
                  )}
                </div>
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
