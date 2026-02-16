import { cn } from '@/lib/utils';
import type { VisaState } from '@/lib/visa/types';
import type { useTranslations } from 'next-intl';

export function StatusBadge({ state, t }: { state: VisaState; t: ReturnType<typeof useTranslations> }) {
  const config: Record<VisaState, { labelKey: string; className: string }> = {
    NO_VISA: { labelKey: 'noVisa', className: 'bg-muted-foreground/10 text-muted-foreground' },
    PREPARING: { labelKey: 'preparing', className: 'bg-primary/10 text-primary' },
    SUBMITTED: { labelKey: 'submitted', className: 'bg-amber-500/10 text-amber-400' },
    UNDER_REVIEW: { labelKey: 'underReview', className: 'bg-amber-500/10 text-amber-400' },
    APPROVED: { labelKey: 'approved', className: 'bg-emerald-500/10 text-emerald-400' },
    ACTIVE: { labelKey: 'active', className: 'bg-emerald-500/10 text-emerald-400' },
    EXPIRING: { labelKey: 'expiring', className: 'bg-red-500/10 text-red-400' },
    EXPIRED: { labelKey: 'expired', className: 'bg-red-500/10 text-red-400' },
  };

  const { labelKey, className } = config[state] || config.PREPARING;

  return (
    <span className={cn('text-xs font-semibold px-3 py-1 rounded-full', className)}>
      {t(labelKey)}
    </span>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

export function formatDate(dateString: string, dateLocale: string): string {
  return new Date(dateString).toLocaleDateString(dateLocale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
