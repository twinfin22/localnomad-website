import {
  Calendar,
  DollarSign,
  Clock,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Visa } from '@/lib/types/visa';

interface VisaHeroProps {
  visa: Visa;
  hideSummaryCards?: boolean;
}

export async function VisaHero({ visa, hideSummaryCards }: VisaHeroProps) {
  const t = await getTranslations('VisaDetail');

  return (
    <div className="-mx-6 rounded-xl bg-primary/[0.03] px-6 py-8">
      {/* Title area */}
      <h1 className="font-lora text-2xl font-bold text-primary sm:text-4xl">
        {visa.name}
      </h1>
      <p className="mt-2 text-lg text-foreground/70">{visa.tagline}</p>

      {/* Warnings */}
      {visa.warnings && visa.warnings.length > 0 && (
        <div className="mt-8 rounded-lg border border-amber-400 bg-amber-100 p-5">
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

      {/* Summary cards grid */}
      {!hideSummaryCards && (
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
    <div className="rounded-lg border border-primary/30 bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="flex justify-center">{icon}</div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-lora text-sm font-bold">{value}</p>
    </div>
  );
}
