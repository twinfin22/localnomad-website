'use client';

import {
  Check,
  Zap,
  Clock,
  Calendar,
  DollarSign,
  Timer,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Visa } from '@/lib/types/visa';

interface QuickVerdictProps {
  visa: Visa;
}

export function QuickVerdict({ visa }: QuickVerdictProps) {
  const t = useTranslations('VisaDetail');

  const byPriority = visa.eligibility.filter(
    (e) => e.priority === 'essential'
  );
  const essentialEligibility =
    byPriority.length > 0
      ? byPriority
      : visa.eligibility.filter((e) => e.required);

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
          value={visa.processingTime.governmentReview}
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
  const card = (
    <div className={cn(
      'rounded-lg border border-primary/30 bg-primary/[0.04] p-4 text-center transition-all',
      detail && 'cursor-pointer hover:border-primary/60 hover:shadow-md hover:bg-primary/[0.08]'
    )}>
      <div className="flex justify-center">{icon}</div>
      <p className="mt-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
      {detail && (
        <p className="mt-1 text-[10px] text-primary/50">Click for details</p>
      )}
    </div>
  );

  if (!detail) return card;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {card}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="max-w-[280px] text-sm"
        sideOffset={8}
      >
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <p className="font-semibold text-base">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{detail}</p>
      </PopoverContent>
    </Popover>
  );
}
