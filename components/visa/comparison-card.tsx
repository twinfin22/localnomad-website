'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Visa } from '@/lib/types/visa';

const CATEGORY_ICONS: Record<string, string> = {
  'digital-nomad': '\uD83D\uDCBB',
  work: '\uD83D\uDCBC',
  investment: '\uD83C\uDFE2',
  residence: '\uD83C\uDFE0',
  'working-holiday': '\u2708\uFE0F',
  'gold-card': '\uD83C\uDFC6',
};

interface ComparisonCardProps {
  visa: Visa;
  country: string;
}

export function ComparisonCard({ visa, country }: ComparisonCardProps) {
  const t = useTranslations('Comparison');

  const workStatus = () => {
    if (!visa.workPermission.allowed) {
      return t('notAllowed');
    }
    if (
      visa.workPermission.restrictions &&
      visa.workPermission.restrictions.length > 0
    ) {
      return `${t('restricted')} — ${visa.workPermission.restrictions[0]}`;
    }
    return t('allowed');
  };

  return (
    <div className="flex flex-col rounded-lg border bg-white">
      {/* Overview */}
      <div className="border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            {CATEGORY_ICONS[visa.category] ?? '\uD83D\uDCCB'}
          </span>
          <h3 className="font-lora text-lg font-bold text-primary">
            {visa.shortName}
          </h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{visa.tagline}</p>
      </div>

      {/* Duration */}
      <div className="border-b px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          {t('duration')}
        </p>
        <p className="mt-1 text-sm font-semibold">{visa.duration.initial}</p>
        {visa.duration.extension && (
          <p className="text-xs text-muted-foreground">
            {visa.duration.extension}
          </p>
        )}
        {visa.duration.maxTotal && (
          <p className="text-xs text-muted-foreground">
            {visa.duration.maxTotal}
          </p>
        )}
      </div>

      {/* Fees */}
      <div className="border-b px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          {t('fees')}
        </p>
        <p className="mt-1 text-sm font-semibold">{visa.fees.application}</p>
        {visa.fees.extension && (
          <p className="text-xs text-muted-foreground">
            {visa.fees.extension}
          </p>
        )}
      </div>

      {/* Income */}
      <div className="border-b px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          {t('income')}
        </p>
        <p className="mt-1 text-sm font-semibold">
          {visa.incomeRequirement
            ? `${visa.incomeRequirement.amount} ${visa.incomeRequirement.currency}`
            : t('noIncome')}
        </p>
      </div>

      {/* Processing */}
      <div className="border-b px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          {t('processing')}
        </p>
        <p className="mt-1 text-sm font-semibold">
          {visa.processingTime.typical}
        </p>
      </div>

      {/* Work Permission */}
      <div className="border-b px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          {t('work')}
        </p>
        <p className="mt-1 text-sm font-semibold">{workStatus()}</p>
      </div>

      {/* Documents */}
      <div className="border-b px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          {t('documents')}
        </p>
        <p className="mt-1 text-sm font-semibold">
          {visa.documents.length}
        </p>
      </div>

      {/* Key Requirement */}
      {visa.keyRequirement && (
        <div className="border-b px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">
            {t('keyRequirement')}
          </p>
          <p className="mt-1 text-sm">{visa.keyRequirement}</p>
        </div>
      )}

      {/* View full guide link */}
      <div className="px-4 py-4">
        <Link
          href={`/${country}/visa/${visa.type}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          {t('viewDetails')} &rarr;
        </Link>
      </div>
    </div>
  );
}
