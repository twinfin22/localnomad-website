'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

import type { VisaState } from '@/lib/visa/types';

interface DDayPanelProps {
  targetDate?: string;
  expiryDate?: string;
  renewalWindowDays?: number;
  state: VisaState;
  className?: string;
}

export function DDayPanel({
  targetDate,
  expiryDate,
  renewalWindowDays = 60,
  state,
  className,
}: DDayPanelProps) {
  const { daysRemaining, label, isUrgent, isPast, displayDate } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Use expiry date for active states, target date for others
    const isActiveState = ['ACTIVE', 'EXPIRING', 'EXPIRED'].includes(state);
    const dateToUse = isActiveState ? expiryDate : targetDate;

    // Handle NO_VISA state
    if (state === 'NO_VISA') {
      return {
        daysRemaining: null,
        label: 'Get Started',
        isUrgent: false,
        isPast: false,
        displayDate: null,
      };
    }

    if (!dateToUse) {
      return {
        daysRemaining: null,
        label: 'No date set',
        isUrgent: false,
        isPast: false,
        displayDate: null,
      };
    }

    const date = new Date(dateToUse);
    date.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let label = '';
    if (state === 'ACTIVE' || state === 'EXPIRING') {
      label = 'Visa Expires';
    } else if (state === 'EXPIRED') {
      label = 'Expired';
    } else if (state === 'SUBMITTED' || state === 'UNDER_REVIEW') {
      label = 'Expected Decision';
    } else {
      label = 'Target Date';
    }

    return {
      daysRemaining: diffDays,
      label,
      isUrgent: diffDays <= renewalWindowDays && diffDays > 0,
      isPast: diffDays < 0,
      displayDate: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  }, [targetDate, expiryDate, state, renewalWindowDays]);

  const getStatusColor = () => {
    if (isPast) return 'text-red-400';
    if (state === 'EXPIRED') return 'text-red-400';
    if (isUrgent) return 'text-amber-400';
    if (state === 'APPROVED' || state === 'ACTIVE') return 'text-emerald-400';
    return 'text-cyan-400';
  };

  const getStatusBg = () => {
    if (isPast || state === 'EXPIRED') return 'bg-red-500/10';
    if (isUrgent) return 'bg-amber-500/10';
    if (state === 'APPROVED' || state === 'ACTIVE') return 'bg-emerald-500/10';
    return 'bg-cyan-500/10';
  };

  const getIcon = () => {
    if (isPast || state === 'EXPIRED') return AlertCircle;
    if (isUrgent) return Clock;
    if (state === 'APPROVED' || state === 'ACTIVE') return CheckCircle2;
    return Calendar;
  };

  const Icon = getIcon();

  return (
    <div className={cn('vk-card p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          {label}
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
              <span>D-Day</span>
            ) : (
              <span>D-{daysRemaining}</span>
            )}
          </div>
          <p className="text-sm text-slate-400">{displayDate}</p>

          {/* Renewal window indicator for active visas */}
          {(state === 'ACTIVE' || state === 'EXPIRING') && daysRemaining !== null && daysRemaining > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              {daysRemaining <= renewalWindowDays ? (
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Renewal window open</span>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Renewal opens in {daysRemaining - renewalWindowDays} days
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-slate-500">Set a target date to track progress</p>
        </div>
      )}
    </div>
  );
}
