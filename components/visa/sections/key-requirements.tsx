import {
  Check,
  X,
  Zap,
  DollarSign,
  Briefcase,
  Shield,
  AlertTriangle,
  TriangleAlert,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Visa, KoreaVisa } from '@/lib/types/visa';

interface KeyRequirementsProps {
  visa: Visa;
}

export function KeyRequirements({ visa }: KeyRequirementsProps) {
  const t = useTranslations('VisaDetail');
  const isKoreaVisa = visa.country === 'kr';
  const koreaVisa = isKoreaVisa ? (visa as KoreaVisa) : null;

  return (
    <div className="space-y-6">
      {/* Eligibility list */}
      <ul className="space-y-3">
        {visa.eligibility.map((item) => {
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
                    'text-sm font-medium',
                    isNegative && 'text-red-600'
                  )}
                >
                  {item.label}
                </span>
                {item.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.warnings && item.warnings.length > 0 && (
                  <div className="mt-2 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
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
        })}
      </ul>

      {/* Income + Work highlight box */}
      {(visa.incomeRequirement || visa.workPermission) && (
        <div className="rounded-lg border bg-white p-5">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Income */}
            {visa.incomeRequirement && (
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    {t('incomeRequirement')}
                  </h3>
                </div>
                <p className="mt-2 text-2xl font-bold text-primary">
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
                {visa.incomeRequirement.proofMethods && visa.incomeRequirement.proofMethods.length > 0 && (
                  <details className="mt-3">
                    <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium text-primary hover:underline">
                      {t('howToProveIncome')}
                    </summary>
                    <ul className="mt-2 space-y-1.5 pl-4">
                      {visa.incomeRequirement.proofMethods.map((method, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                          {method}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {/* Work permission */}
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {t('workPermission')}
                </h3>
              </div>
              <p
                className={cn(
                  'mt-2 text-sm font-medium',
                  visa.workPermission.allowed
                    ? 'text-green-600'
                    : 'text-red-600'
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
          </div>
        </div>
      )}

      {/* Insurance details (KoreaVisa only) */}
      {koreaVisa?.insuranceRequirement && (
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {t('insuranceDetails')}
            </h3>
          </div>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">
                {t('minimumCoverage')}:
              </span>{' '}
              {koreaVisa.insuranceRequirement.minimumCoverage}
            </p>
            <p>
              <span className="font-medium text-foreground">{t('insuranceType')}:</span>{' '}
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

      {/* Tax implications (Korea only) */}
      {koreaVisa?.taxImplications && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-800">
              {t('taxImplications')}
            </h3>
          </div>
          <div className="mt-3 space-y-2 text-sm text-amber-900">
            <p>
              <span className="font-medium">{t('taxThreshold')}:</span>{' '}
              {koreaVisa.taxImplications.threshold}
            </p>
            <p>{koreaVisa.taxImplications.notes}</p>
            <p className="text-xs text-amber-700">
              {t('source')}:{' '}
              {koreaVisa.taxImplications.source}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
