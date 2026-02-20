'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface DDayCountdownProps {
  expiryDate: string | null;
}

export function DDayCountdown({ expiryDate }: DDayCountdownProps) {
  const t = useTranslations('Dashboard');
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiryDate) return;

    const calculate = () => {
      const now = new Date();
      const expiry = new Date(expiryDate);
      const diffMs = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays);
    };

    calculate();
    // Recalculate once a day
    const interval = setInterval(calculate, 86400000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  if (!expiryDate) {
    return (
      <div className="rounded-lg border bg-white p-6 text-center">
        <p className="text-sm text-muted-foreground">{t('setExpiryDate')}</p>
      </div>
    );
  }

  if (daysLeft === null) {
    return (
      <div className="rounded-lg border bg-white p-6 text-center">
        <div className="h-12 animate-pulse rounded bg-neutral-200" />
      </div>
    );
  }

  const isExpired = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= 30;

  return (
    <div
      className={`rounded-lg border p-6 text-center ${
        isExpired
          ? 'border-red-200 bg-red-50'
          : isUrgent
            ? 'border-amber-200 bg-amber-50'
            : 'border-neutral-200 bg-white'
      }`}
    >
      <p className="text-sm font-medium text-muted-foreground">
        {isExpired ? t('expired') : t('dDay')}
      </p>
      <p
        className={`mt-1 text-4xl font-bold ${
          isExpired
            ? 'text-red-600'
            : isUrgent
              ? 'text-amber-600'
              : 'text-primary'
        }`}
      >
        {isExpired
          ? t('expiredDays', { days: Math.abs(daysLeft) })
          : t('daysRemaining', { days: daysLeft })}
      </p>
    </div>
  );
}
