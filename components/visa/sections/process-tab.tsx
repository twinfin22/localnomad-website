'use client';

import { Clock, Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApplicationSteps } from './application-steps';
import type { Visa, CommunityTip } from '@/lib/types/visa';

interface ProcessTabProps {
  visa: Visa;
  communityTips?: CommunityTip[];
}

export function ProcessTab({ visa, communityTips = [] }: ProcessTabProps) {
  const t = useTranslations('VisaDetail');

  return (
    <div>
      {/* Total timeline summary */}
      {visa.processingTime.totalEndToEnd && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] px-4 py-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t('estimatedTotal')}
            </p>
            <p className="text-base font-semibold text-primary">
              {visa.processingTime.totalEndToEnd}
            </p>
          </div>
          {visa.processingTime.notes && (
            <p className="ml-auto text-xs text-muted-foreground max-w-[200px]">
              {visa.processingTime.notes}
            </p>
          )}
        </div>
      )}

      <ApplicationSteps steps={visa.applicationSteps} />

      {/* Inline community tips */}
      {communityTips.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <ul className="space-y-2">
            {communityTips.map((ct) => (
              <li key={ct.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="italic">{ct.tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
