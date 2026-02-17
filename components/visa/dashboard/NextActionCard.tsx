'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ArrowRight, FileText, Upload, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseLocalePath, buildLocalePath, toDateLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import type { VisaState } from '@/lib/visa/types';

interface NextActionCardProps {
  state: VisaState;
  visaType: string;
  documentsComplete: number;
  documentsTotal: number;
  nextDeadline?: {
    title: string;
    date: string;
  };
  className?: string;
}

interface ActionConfig {
  icon: typeof FileText;
  title?: string;
  titleKey?: string;
  titleParams?: Record<string, string | number>;
  description?: string;
  descriptionKey?: string;
  descriptionParams?: Record<string, string>;
  cta?: string;
  ctaKey?: string;
  href: string;
  urgent?: boolean;
}

function getNextAction(
  state: VisaState,
  visaType: string,
  documentsComplete: number,
  documentsTotal: number,
  locale: Locale,
  nextDeadline?: { title: string; date: string }
): ActionConfig {
  const allDocumentsReady = documentsComplete === documentsTotal;

  switch (state) {
    case 'PREPARING':
      if (documentsComplete === 0) {
        return {
          icon: FileText,
          titleKey: 'startDocCollection',
          descriptionKey: 'startDocCollectionDesc',
          ctaKey: 'viewChecklist',
          href: `/visa/checklist/${visaType}`,
        };
      }
      if (!allDocumentsReady) {
        const remaining = documentsTotal - documentsComplete;
        return {
          icon: Upload,
          titleKey: 'docsRemainingTitle',
          titleParams: { count: remaining },
          descriptionKey: 'completeChecklistDesc',
          ctaKey: 'continueChecklist',
          href: `/visa/checklist/${visaType}`,
        };
      }
      return {
        icon: Calendar,
        titleKey: 'readyToSubmit',
        descriptionKey: 'readyToSubmitDesc',
        ctaKey: 'viewSubmissionGuide',
        href: `/visa/${visaType}#process`,
      };

    case 'SUBMITTED':
      return {
        icon: Calendar,
        titleKey: 'applicationSubmitted',
        descriptionKey: 'applicationSubmittedDesc',
        ctaKey: 'trackStatus',
        href: `/visa/dashboard`,
      };

    case 'UNDER_REVIEW':
      if (nextDeadline) {
        return {
          icon: AlertTriangle,
          title: nextDeadline.title,
          descriptionKey: 'dueBy',
          descriptionParams: { date: new Date(nextDeadline.date).toLocaleDateString(toDateLocale(locale)) },
          ctaKey: 'viewDetails',
          href: `/visa/dashboard`,
          urgent: true,
        };
      }
      return {
        icon: FileText,
        titleKey: 'underReviewTitle',
        descriptionKey: 'underReviewDesc',
        ctaKey: 'checkUpdates',
        href: `/visa/dashboard`,
      };

    case 'APPROVED':
      return {
        icon: Calendar,
        titleKey: 'visaApproved',
        descriptionKey: 'visaApprovedDesc',
        ctaKey: 'viewEntryGuide',
        href: `/visa/${visaType}`,
      };

    case 'ACTIVE':
      return {
        icon: RefreshCw,
        titleKey: 'maintainVisa',
        descriptionKey: 'maintainVisaDesc',
        ctaKey: 'viewRequirements',
        href: `/visa/${visaType}`,
      };

    case 'EXPIRING':
      return {
        icon: AlertTriangle,
        titleKey: 'renewalRequired',
        descriptionKey: 'renewalRequiredDesc',
        ctaKey: 'startRenewal',
        href: `/visa/${visaType}#renewal`,
        urgent: true,
      };

    case 'EXPIRED':
      return {
        icon: AlertTriangle,
        titleKey: 'visaExpired',
        descriptionKey: 'visaExpiredDesc',
        ctaKey: 'getHelp',
        href: `/visa/${visaType}`,
        urgent: true,
      };

    default:
      return {
        icon: FileText,
        titleKey: 'getStartedTitle',
        descriptionKey: 'getStartedDesc',
        ctaKey: 'findMyVisa',
        href: '/visa/find',
      };
  }
}

export function NextActionCard({
  state,
  visaType,
  documentsComplete,
  documentsTotal,
  nextDeadline,
  className,
}: NextActionCardProps) {
  const t = useTranslations('dashboard');
  const pathname = usePathname();
  const { locale, country } = parseLocalePath(pathname);
  const localePath = (path: string) => buildLocalePath(path, locale, country ?? undefined);

  const action = getNextAction(state, visaType, documentsComplete, documentsTotal, locale as Locale, nextDeadline);
  const Icon = action.icon;

  const resolvedTitle = action.titleKey ? t(action.titleKey, action.titleParams) : action.title;
  const resolvedDescription = action.descriptionKey ? t(action.descriptionKey, action.descriptionParams) : action.description;
  const resolvedCta = action.ctaKey ? t(action.ctaKey) : action.cta;

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-2xl p-6',
        action.urgent && 'border-amber-500/30 bg-amber-500/5',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            action.urgent ? 'bg-amber-500/10' : 'bg-primary/10'
          )}
        >
          <Icon
            className={cn(
              'w-6 h-6',
              action.urgent ? 'text-amber-400' : 'text-primary'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">{resolvedTitle}</h3>
          <p className="text-sm text-muted-foreground mb-4">{resolvedDescription}</p>

          <Link href={localePath(action.href)}>
            <Button
              className={cn(
                'group',
                action.urgent
                  ? 'bg-amber-500 hover:bg-amber-400 text-background'
                  : 'bg-primary hover:bg-accent-hover text-background'
              )}
            >
              {resolvedCta}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
