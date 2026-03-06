'use client';

import { useState, useRef, useCallback } from 'react';
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
          detail={visa.fees.applicationDetail}
        />
        <SummaryCard
          icon={<Clock className="h-5 w-5 text-primary" />}
          label={t('processingTime')}
          value={visa.processingTime.governmentReview}
          detail={visa.processingTime.governmentReviewDetail}
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

/** Extract trailing parenthetical from a value string.
 *  e.g. "$23–$140 USD (varies by nationality)" → ["$23–$140 USD", "Varies by nationality"]
 */
function extractParenthetical(value: string): { display: string; extra: string | null } {
  const match = value.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!match) return { display: value, extra: null };
  // Capitalize first letter of extracted text
  const extra = match[2].charAt(0).toUpperCase() + match[2].slice(1);
  return { display: match[1].trim(), extra };
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
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  // If explicit detail provided, use value as-is for display.
  // Otherwise, auto-extract parenthetical content as detail.
  const { display: autoDisplay, extra } = extractParenthetical(value);
  const displayValue = detail ? value : autoDisplay;
  const resolvedDetail = detail ?? extra;
  const hasPopover = !!resolvedDetail;

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(true), 200);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(false), 300);
  }, []);

  // Split semicolon-separated values into lines for card display
  const displayLines = displayValue.includes(';')
    ? displayValue.split(';').map((s) => s.trim())
    : null;

  const card = (
    <div className={cn(
      'flex h-full flex-col items-center justify-start rounded-lg border border-primary/30 bg-primary/[0.04] p-4 text-center transition-all',
      hasPopover && 'cursor-pointer hover:border-primary/60 hover:shadow-md hover:bg-primary/[0.08]'
    )}>
      <div className="flex justify-center">{icon}</div>
      <p className="mt-1.5 text-sm font-semibold">
        {label}
      </p>
      {displayLines ? (
        <div className="mt-0.5 space-y-0.5">
          {displayLines.map((line, i) => (
            <p key={i} className="text-xs text-muted-foreground">{line}</p>
          ))}
        </div>
      ) : (
        <p className="mt-0.5 text-xs text-muted-foreground">{displayValue}</p>
      )}
    </div>
  );

  if (!hasPopover) return card;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {card}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="max-w-[280px]"
        sideOffset={8}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <p className="text-sm leading-relaxed">{resolvedDetail}</p>
      </PopoverContent>
    </Popover>
  );
}
