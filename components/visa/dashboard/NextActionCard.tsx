'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, FileText, Upload, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  title: string;
  description: string;
  cta: string;
  href: string;
  urgent?: boolean;
}

function getNextAction(
  state: VisaState,
  visaType: string,
  documentsComplete: number,
  documentsTotal: number,
  nextDeadline?: { title: string; date: string }
): ActionConfig {
  const allDocumentsReady = documentsComplete === documentsTotal;

  switch (state) {
    case 'PREPARING':
      if (documentsComplete === 0) {
        return {
          icon: FileText,
          title: 'Start Document Collection',
          description: 'Begin gathering required documents for your application.',
          cta: 'View Checklist',
          href: `/visa/checklist/${visaType}`,
        };
      }
      if (!allDocumentsReady) {
        const remaining = documentsTotal - documentsComplete;
        return {
          icon: Upload,
          title: `${remaining} Document${remaining > 1 ? 's' : ''} Remaining`,
          description: `Complete your checklist to proceed with submission.`,
          cta: 'Continue Checklist',
          href: `/visa/checklist/${visaType}`,
        };
      }
      return {
        icon: Calendar,
        title: 'Ready to Submit',
        description: 'All documents prepared. Book your appointment or submit online.',
        cta: 'View Submission Guide',
        href: `/visa/${visaType}#process`,
      };

    case 'SUBMITTED':
      return {
        icon: Calendar,
        title: 'Application Submitted',
        description: 'Your application is being processed. Check status regularly.',
        cta: 'Track Status',
        href: `/visa/dashboard`,
      };

    case 'UNDER_REVIEW':
      if (nextDeadline) {
        return {
          icon: AlertTriangle,
          title: nextDeadline.title,
          description: `Due by ${new Date(nextDeadline.date).toLocaleDateString()}`,
          cta: 'View Details',
          href: `/visa/dashboard`,
          urgent: true,
        };
      }
      return {
        icon: FileText,
        title: 'Under Review',
        description: 'Immigration is reviewing your application.',
        cta: 'Check Updates',
        href: `/visa/dashboard`,
      };

    case 'APPROVED':
      return {
        icon: Calendar,
        title: 'Visa Approved',
        description: 'Prepare for your move to Korea.',
        cta: 'View Entry Guide',
        href: `/visa/${visaType}`,
      };

    case 'ACTIVE':
      return {
        icon: RefreshCw,
        title: 'Maintain Your Visa',
        description: 'Track requirements and renewal deadlines.',
        cta: 'View Requirements',
        href: `/visa/${visaType}`,
      };

    case 'EXPIRING':
      return {
        icon: AlertTriangle,
        title: 'Renewal Required',
        description: 'Your visa is expiring soon. Start renewal process.',
        cta: 'Start Renewal',
        href: `/visa/${visaType}#renewal`,
        urgent: true,
      };

    case 'EXPIRED':
      return {
        icon: AlertTriangle,
        title: 'Visa Expired',
        description: 'Contact immigration for options.',
        cta: 'Get Help',
        href: `/visa/${visaType}`,
        urgent: true,
      };

    default:
      return {
        icon: FileText,
        title: 'Get Started',
        description: 'Begin your visa journey.',
        cta: 'Find Your Visa',
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
  const action = getNextAction(state, visaType, documentsComplete, documentsTotal, nextDeadline);
  const Icon = action.icon;

  return (
    <div
      className={cn(
        'vk-card p-6',
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
          <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{action.description}</p>

          <Link href={action.href}>
            <Button
              className={cn(
                'group',
                action.urgent
                  ? 'bg-amber-500 hover:bg-amber-400 text-background'
                  : 'bg-primary hover:bg-accent-hover text-background'
              )}
            >
              {action.cta}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
