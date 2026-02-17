'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toDateLocale } from '@/lib/i18n/config';

import type { Locale } from '@/lib/i18n/config';
import type { VisaState } from '@/lib/visa/types';

interface DDayPanelProps {
  targetDate?: string;
  expiryDate?: string;
  renewalWindowDays?: number;
  state: VisaState;
  locale?: Locale;
  className?: string;
}

export function DDayPanel({
  targetDate,
  expiryDate,
  renewalWindowDays = 60,
  state,
  locale,
  className,
}: DDayPanelProps) {
  const t = useTranslations('dashboard');
  const [computed, setComputed] = useState({
    daysRemaining: null as number | null,
    labelKey: 'noDateSet',
    isUrgent: false,
    isPast: false,
    displayDate: null as string | null,
  });

  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const isActiveState = ['ACTIVE', 'EXPIRING', 'EXPIRED'].includes(state);
    const dateToUse = isActiveState ? expiryDate : targetDate;

    if (state === 'NO_VISA') {
      setComputed({
        daysRemaining: null,
        labelKey: 'getStartedLabel',
        isUrgent: false,
        isPast: false,
        displayDate: null,
      });
      return;
    }

    if (!dateToUse) {
      setComputed({
        daysRemaining: null,
        labelKey: 'noDateSet',
        isUrgent: false,
        isPast: false,
        displayDate: null,
      });
      return;
    }

    const date = new Date(dateToUse);
    date.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let lk = '';
    if (state === 'ACTIVE' || state === 'EXPIRING') {
      lk = 'visaExpires';
    } else if (state === 'EXPIRED') {
      lk = 'expired';
    } else if (state === 'SUBMITTED' || state === 'UNDER_REVIEW') {
      lk = 'expectedDecision';
    } else {
      lk = 'targetDate';
    }

    setComputed({
      daysRemaining: diffDays,
      labelKey: lk,
      isUrgent: diffDays <= renewalWindowDays && diffDays > 0,
      isPast: diffDays < 0,
      displayDate: date.toLocaleDateString(toDateLocale(locale ?? 'en'), {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    });
  }, [targetDate, expiryDate, state, renewalWindowDays, locale]);

  const { daysRemaining, labelKey, isUrgent, isPast, displayDate } = computed;

  const getStatusColor = () => {
    if (isPast) return 'text-red-400';
    if (state === 'EXPIRED') return 'text-red-400';
    if (isUrgent) return 'text-amber-400';
    if (state === 'APPROVED' || state === 'ACTIVE') return 'text-emerald-400';
    return 'text-primary';
  };

  const getStatusBg = () => {
    if (isPast || state === 'EXPIRED') return 'bg-red-500/10';
    if (isUrgent) return 'bg-amber-500/10';
    if (state === 'APPROVED' || state === 'ACTIVE') return 'bg-emerald-500/10';
    return 'bg-primary/10';
  };

  const getIcon = () => {
    if (isPast || state === 'EXPIRED') return AlertCircle;
    if (isUrgent) return Clock;
    if (state === 'APPROVED' || state === 'ACTIVE') return CheckCircle2;
    return Calendar;
  };

  const Icon = getIcon();

  return (
    <div className={cn('bg-card border border-border rounded-2xl p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t(labelKey)}
        </h3>
        <div className={cn('p-2 rounded-lg', getStatusBg())}>
          <Icon className={cn('w-4 h-4', getStatusColor())} />
        </div>
      </div>

      {daysRemaining !== null ? (
        <div className="text-center">
          <div className={cn('text-5xl font-bold mb-1', getStatusColor())}>
            {isPast ? (
              <span>D+{Math.abs(daysRemaining)}</span>
            ) : daysRemaining === 0 ? (
              <span>{t('dDay')}</span>
            ) : (
              <span>D-{daysRemaining}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{displayDate}</p>

          {/* Renewal window indicator for active visas */}
          {(state === 'ACTIVE' || state === 'EXPIRING') && daysRemaining !== null && daysRemaining > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              {daysRemaining <= renewalWindowDays ? (
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{t('renewalWindowOpen')}</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t('renewalOpensIn', { days: daysRemaining - renewalWindowDays })}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted-foreground">{t('setTargetDate')}</p>
        </div>
      )}
    </div>
  );
}
