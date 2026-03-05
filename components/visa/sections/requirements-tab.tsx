'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Check,
  X,
  Zap,
  TriangleAlert,
  Lightbulb,
  DollarSign,
  Briefcase,
  Shield,
  AlertTriangle,
  Stamp,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { linkifyText } from '@/lib/linkify-text';
import type { Visa, KoreaVisa, Requirement } from '@/lib/types/visa';

interface RequirementsTabProps {
  visa: Visa;
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: typeof Check; labelKey: string }
> = {
  visaStatus: { icon: Stamp, labelKey: 'visaStatus' },
  pointsSystem: { icon: BarChart3, labelKey: 'pointsSystem' },
  income: { icon: DollarSign, labelKey: 'incomeRequirement' },
};

const CATEGORY_ORDER = ['visaStatus', 'pointsSystem', 'income'];

export function RequirementsTab({ visa }: RequirementsTabProps) {
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

  // Ordered categories: known order first, then any extras
  const orderedCategories = useMemo(() => {
    const result: string[] = [];
    for (const cat of CATEGORY_ORDER) {
      if (grouped.has(cat)) result.push(cat);
    }
    for (const cat of grouped.keys()) {
      if (!result.includes(cat)) result.push(cat);
    }
    return result;
  }, [grouped]);

  const renderItem = (item: Requirement) => {
    const isNegative = item.id.startsWith('no-');
    return (
      <li key={item.id} className="flex items-start gap-3">
        {isNegative ? (
          <X className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        ) : item.required ? (
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        ) : (
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        )}
        <div>
          <span
            className={cn(
              'text-base font-medium',
              isNegative && 'text-red-600'
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
    const labels: Record<string, string> = {
      visaStatus: t('visaStatus'),
      pointsSystem: t('pointsSystem'),
      income: t('incomeRequirement'),
    };
    return labels[category] ?? category;
  };

  const renderCategoryHeader = (category: string) => {
    const config = CATEGORY_CONFIG[category];
    if (!config) return null;
    const Icon = config.icon;
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
        const items = grouped.get(category) ?? [];
        const isIncome = category === 'income';

        return (
          <div key={category}>
            {catIndex > 0 && <div className="my-6 border-t" />}

            {renderCategoryHeader(category)}

            <div className="pl-7">
              <ul className="mt-3 space-y-3">{items.map(renderItem)}</ul>

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
          <div className="grid gap-6 sm:grid-cols-2">
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
              <div className="rounded-md bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-lora text-lg font-semibold text-amber-800">
                    {t('taxImplications')}
                  </h3>
                </div>
                <div className="mt-3 space-y-2 pl-7 text-sm text-amber-900">
                  <p>
                    <span className="font-medium">{t('taxThreshold')}:</span>{' '}
                    {koreaVisa.taxImplications.threshold}
                  </p>
                  <p>{koreaVisa.taxImplications.notes}</p>
                  <p className="text-xs text-amber-700">
                    {t('source')}: {koreaVisa.taxImplications.source}
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
