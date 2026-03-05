'use client';

import {
  Check,
  Zap,
  Info,
  Clock,
  Calendar,
  DollarSign,
  Timer,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Visa } from '@/lib/types/visa';

interface QuickVerdictProps {
  visa: Visa;
}

export function QuickVerdict({ visa }: QuickVerdictProps) {
  const t = useTranslations('VisaDetail');

  const essentialEligibility = visa.eligibility.filter(
    (e) => e.priority === 'essential'
  );

  return (
    <section
      id="at-a-glance"
      className="scroll-mt-28 rounded-lg border-l-4 border-l-primary bg-white p-6 shadow-sm"
    >
      <h2 className="font-lora text-xl font-bold text-primary">
        {t('atAGlance')}
      </h2>

      {/* Summary cards */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard
          icon={<Calendar className="h-5 w-5 text-primary" />}
          label={t('duration')}
          value={visa.duration.initial}
          detail={visa.duration.initialDetail}
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
          detail={visa.duration.maxTotalDetail}
        />
      </div>

      {/* Essential eligibility */}
      <ul className="mt-5 space-y-3">
        {essentialEligibility.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            {item.required ? (
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            )}
            <span className="text-base font-medium">{item.label}</span>
          </li>
        ))}
      </ul>

    </section>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/[0.04] p-4 text-center transition-shadow hover:shadow-sm">
      <div className="flex justify-center">{icon}</div>
      <p className="mt-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold">
        {value}
        {detail && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="ml-1 inline-flex translate-y-[1px] items-center text-primary/40 hover:text-primary">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[240px] text-xs"
              >
                {detail}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </p>
    </div>
  );
}
