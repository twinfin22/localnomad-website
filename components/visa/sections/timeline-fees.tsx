import {
  Calendar,
  DollarSign,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Visa } from '@/lib/types/visa';

interface TimelineFeesProps {
  visa: Visa;
}

export function TimelineFees({ visa }: TimelineFeesProps) {
  const t = useTranslations('VisaDetail');

  return (
    <div className="space-y-4">
      {/* Compact summary panel */}
      <div className="rounded-xl bg-primary/5 px-5 py-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <SummaryItem
            icon={<Calendar className="h-4 w-4 text-primary" />}
            label={t('initialDuration')}
            value={visa.duration.initial}
          />
          {visa.duration.extension && (
            <SummaryItem
              icon={<RefreshCw className="h-4 w-4 text-primary" />}
              label={t('extensionDuration')}
              value={visa.duration.extension}
            />
          )}
          {visa.duration.maxTotal && (
            <SummaryItem
              icon={<Clock className="h-4 w-4 text-primary" />}
              label={t('maxStay')}
              value={visa.duration.maxTotal}
            />
          )}
          <SummaryItem
            icon={<DollarSign className="h-4 w-4 text-primary" />}
            label={t('fees')}
            value={visa.fees.application}
          />
          {visa.fees.extension && (
            <SummaryItem
              icon={<DollarSign className="h-4 w-4 text-primary" />}
              label={t('extensionFee')}
              value={visa.fees.extension}
            />
          )}
          <SummaryItem
            icon={<Clock className="h-4 w-4 text-primary" />}
            label={t('processingTime')}
            value={visa.processingTime.governmentReview}
          />
          {visa.processingTime.totalEndToEnd && (
            <SummaryItem
              icon={<Clock className="h-4 w-4 text-primary" />}
              label={t('totalTimeline')}
              value={visa.processingTime.totalEndToEnd}
            />
          )}
          {visa.processingTime.expedited && (
            <SummaryItem
              icon={<Clock className="h-4 w-4 text-primary" />}
              label={t('expeditedProcessing')}
              value={visa.processingTime.expedited}
            />
          )}
        </div>

        {/* Notes */}
        {(visa.fees.notes || visa.processingTime.notes) && (
          <div className="mt-3 space-y-1 border-t border-primary/10 pt-3 text-sm text-muted-foreground">
            {visa.fees.notes && <p>{visa.fees.notes}</p>}
            {visa.processingTime.notes && <p>{visa.processingTime.notes}</p>}
          </div>
        )}
      </div>

      {/* Renewal info */}
      {visa.renewal && (
        <div className="rounded-xl bg-neutral-50 p-4">
          <h3 className="flex items-center gap-2 font-lora text-lg font-semibold text-foreground">
            <RefreshCw className="h-4 w-4 text-primary" />
            {t('renewal')}
          </h3>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p
              className={
                visa.renewal.eligible
                  ? 'font-medium text-green-600'
                  : 'font-medium text-red-600'
              }
            >
              {visa.renewal.eligible
                ? t('renewalEligible')
                : t('renewalNotEligible')}
            </p>
            {visa.renewal.maxExtensions !== undefined && (
              <p>
                <span className="font-medium text-foreground">
                  {t('maxExtensions')}:
                </span>{' '}
                {visa.renewal.maxExtensions}
              </p>
            )}
            <p>
              <span className="font-medium text-foreground">
                {t('applyBefore')}:
              </span>{' '}
              {t('applyBeforeDays', { days: visa.renewal.applyBeforeDays })}
            </p>
            {visa.renewal.fees && (
              <p>
                <span className="font-medium text-foreground">
                  {t('renewalFees')}:
                </span>{' '}
                {visa.renewal.fees}
              </p>
            )}
            {visa.renewal.requirements.length > 0 && (
              <div>
                <p className="font-medium text-foreground">
                  {t('renewalRequirements')}:
                </p>
                <ul className="mt-1 space-y-1 pl-4">
                  {visa.renewal.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 font-lora text-sm font-bold">{value}</p>
    </div>
  );
}
