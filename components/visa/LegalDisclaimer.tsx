'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCountryOptional } from '@/components/providers/country-provider';

type DisclaimerCountry = 'kr' | 'tw';

function useResolvedCountry(propCountry?: DisclaimerCountry): DisclaimerCountry {
  const contextCountry = useCountryOptional();
  if (propCountry) return propCountry;
  if (contextCountry === 'taiwan') return 'tw';
  return 'kr';
}

interface LegalDisclaimerProps {
  variant?: 'inline' | 'box' | 'banner';
  country?: DisclaimerCountry;
  className?: string;
  showIcon?: boolean;
}

export function LegalDisclaimer({
  variant = 'box',
  country: propCountry,
  className,
  showIcon = true,
}: LegalDisclaimerProps) {
  const t = useTranslations();
  const country = useResolvedCountry(propCountry);

  if (variant === 'inline') {
    if (country === 'tw') {
      return (
        <p className={cn('text-sm text-muted-foreground', className)}>
          {t.rich('legal.tw.inlineDisclaimer', {
            nia: (chunks) => (
              <a
                href="https://www.immigration.gov.tw"
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
    if (country === 'tw') {
      return (
        <div
          className={cn(
            'bg-warning/10 border-y border-warning/20 py-3 px-4',
            className
          )}
        >
          <div className="container mx-auto max-w-3xl">
            <p className="text-sm text-warning/80 text-center">
              <span className="font-medium text-warning">{t('legal.tw.bannerNote')}</span>{' '}
              {t('legal.tw.bannerDisclaimer')}
            </p>
          </div>
        </div>
      );
    }

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

  // Default: box variant
  if (country === 'tw') {
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
              {t('legal.tw.importantNotice')}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              {t('legal.tw.boxDisclaimerPara1')}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              {t('legal.tw.boxDisclaimerPara2')}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.rich('legal.tw.boxDisclaimerPara3', {
                nia: (chunks) => (
                  <a
                    href="https://www.immigration.gov.tw"
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

  // Default: box variant - Korea (existing behavior)
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
interface QuizDisclaimerProps {
  country?: DisclaimerCountry;
  className?: string;
}

export function QuizDisclaimer({ country: propCountry, className }: QuizDisclaimerProps) {
  const t = useTranslations();
  const country = useResolvedCountry(propCountry);

  if (country === 'tw') {
    return (
      <div
        className={cn(
          'bg-surface border border-border rounded-xl p-4',
          className
        )}
      >
        <p className="text-xs text-muted-foreground leading-relaxed mb-2 font-medium">
          {t('legal.tw.quizDisclaimerTitle')}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('legal.tw.quizDisclaimer')}
        </p>
      </div>
    );
  }

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
