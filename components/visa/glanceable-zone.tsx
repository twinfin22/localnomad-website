import { getTranslations } from 'next-intl/server';
import {
  Check,
  X,
  Calendar,
  DollarSign,
  Clock,
  Timer,
  Shield,
  AlertTriangle,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Visa, KoreaVisa } from '@/lib/types/visa';

interface GlanceableZoneProps {
  visa: Visa;
}

export async function GlanceableZone({ visa }: GlanceableZoneProps) {
  const t = await getTranslations('VisaDetail');

  const isKoreaVisa = visa.country === 'kr';
  const koreaVisa = isKoreaVisa ? (visa as KoreaVisa) : null;

  return (
    <div>
      {/* Title area */}
      <h1 className="font-lora text-3xl font-bold text-primary">
        {visa.name}
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">{visa.tagline}</p>

      {/* Warnings */}
      {visa.warnings && visa.warnings.length > 0 && (
        <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <h2 className="text-xl font-semibold text-amber-800">
              {t('warnings')}
            </h2>
          </div>
          <ul className="mt-3 space-y-2">
            {visa.warnings.map((warning, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-amber-800"
              >
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Requirements card */}
      <div className="mt-8 rounded-lg border bg-white p-5">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Check className="h-5 w-5 text-primary" />
          {t('keyRequirements')}
        </h2>
        <ul className="mt-4 space-y-3">
          {visa.eligibility.map((item) => {
            const isNegative = item.id.startsWith('no-');
            return (
              <li key={item.id} className="flex items-start gap-3">
                {isNegative ? (
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                ) : (
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
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
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Summary cards grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          icon={<Calendar className="h-5 w-5 text-primary" />}
          label={t('duration')}
          value={visa.duration.initial}
        />
        <SummaryCard
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          label={t('fees')}
          value={visa.fees.application}
        />
        <SummaryCard
          icon={<Clock className="h-5 w-5 text-primary" />}
          label={t('processingTime')}
          value={visa.processingTime.typical}
        />
        <SummaryCard
          icon={<Timer className="h-5 w-5 text-primary" />}
          label={t('maxStay')}
          value={visa.duration.maxTotal ?? '-'}
        />
      </div>

      {/* Income + Work highlight box */}
      {(visa.incomeRequirement || visa.workPermission) && (
        <div className="mt-8 rounded-lg border bg-white p-5">
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
                {/* Proof methods (runtime check — not in TS types) */}
                {'proofMethods' in visa.incomeRequirement && (
                  <details className="mt-3">
                    <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium text-primary hover:underline">
                      {t('howToProveIncome')}
                    </summary>
                    <ul className="mt-2 space-y-1.5 pl-4">
                      {(
                        visa.incomeRequirement as {
                          proofMethods: string[];
                        }
                      ).proofMethods.map((method, index) => (
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
        <div className="mt-8 rounded-lg border bg-white p-5">
          <details>
            <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 text-xl font-semibold">
              <Shield className="h-5 w-5 text-primary" />
              {t('insuranceDetails')}
            </summary>
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
          </details>
        </div>
      )}

      {/* Tax implications (runtime check — not in TS types) */}
      {'taxImplications' in visa && (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <details>
            <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 text-xl font-semibold text-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {t('taxImplications')}
            </summary>
            <div className="mt-3 space-y-2 text-sm text-amber-900">
              <p>
                <span className="font-medium">{t('taxThreshold')}:</span>{' '}
                {
                  (visa as { taxImplications: { threshold: string } })
                    .taxImplications.threshold
                }
              </p>
              <p>
                {
                  (visa as { taxImplications: { notes: string } })
                    .taxImplications.notes
                }
              </p>
              <p className="text-xs text-amber-700">
                {t('source')}:{' '}
                {
                  (visa as { taxImplications: { source: string } })
                    .taxImplications.source
                }
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-primary/20 bg-white p-4 text-center">
      <div className="flex justify-center">{icon}</div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
