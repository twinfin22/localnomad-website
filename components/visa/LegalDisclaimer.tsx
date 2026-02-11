'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LegalDisclaimerProps {
  variant?: 'inline' | 'box' | 'banner';
  className?: string;
  showIcon?: boolean;
}

export function LegalDisclaimer({
  variant = 'box',
  className,
  showIcon = true,
}: LegalDisclaimerProps) {
  const t = useTranslations();

  if (variant === 'inline') {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        {t.rich('legal.inlineDisclaimer', {
          kis: (chunks) => (
            <a
              href="https://www.immigration.go.kr/immigration_eng/index.do"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-accent-hover"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'bg-warning/10 border-y border-warning/20 py-3 px-4',
          className
        )}
      >
        <div className="container mx-auto max-w-3xl">
          <p className="text-sm text-warning/80 text-center">
            <span className="font-medium text-warning">{t('legal.bannerNote')}</span>{' '}
            {t('legal.bannerDisclaimer')}
          </p>
        </div>
      </div>
    );
  }

  // Default: box variant - uses warning color (semantic exception to cyan-only rule)
  return (
    <div
      className={cn(
        'bg-warning/10 border border-warning/20 rounded-xl p-6',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {showIcon && (
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
        )}
        <div>
          <h4 className="text-lg font-semibold text-warning mb-2">
            {t('legal.importantNotice')}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            {t('legal.boxDisclaimerPara1')}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.rich('legal.boxDisclaimerPara2', {
              kis: (chunks) => (
                <a
                  href="https://www.immigration.go.kr/immigration_eng/index.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-accent-hover"
                >
                  {chunks}
                </a>
              ),
              hikorea: (chunks) => (
                <a
                  href="https://www.hikorea.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-accent-hover"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Quiz-specific disclaimer
export function QuizDisclaimer({ className }: { className?: string }) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-xl p-4',
        className
      )}
    >
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t('legal.quizDisclaimer')}
      </p>
    </div>
  );
}

// Income calculator disclaimer
export function IncomeDisclaimer({ className }: { className?: string }) {
  const t = useTranslations();

  return (
    <p className={cn('text-xs text-muted-foreground', className)}>
      {t('legal.incomeDisclaimer')}
    </p>
  );
}

// 183-day tracker disclaimer
export function DayTrackerDisclaimer({ className }: { className?: string }) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg p-3',
        className
      )}
    >
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t('legal.dayTrackerDisclaimer')}
      </p>
    </div>
  );
}
