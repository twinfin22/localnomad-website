import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

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
  if (variant === 'inline') {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        This information is for general guidance only. Visa requirements change
        frequently. Always verify current requirements with the{' '}
        <a
          href="https://www.immigration.go.kr/immigration_eng/index.do"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-accent-hover"
        >
          Korea Immigration Service
        </a>
        .
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
            <span className="font-medium text-warning">Note:</span> This tool
            provides general guidance only and does not constitute legal advice.
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
            Important Notice
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This information is for general guidance only. Visa requirements
            change frequently. Always verify current requirements with the{' '}
            <a
              href="https://www.immigration.go.kr/immigration_eng/index.do"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-accent-hover"
            >
              Korea Immigration Service
            </a>{' '}
            or{' '}
            <a
              href="https://www.hikorea.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-accent-hover"
            >
              HiKorea
            </a>{' '}
            before applying.
          </p>
        </div>
      </div>
    </div>
  );
}

// Quiz-specific disclaimer
export function QuizDisclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-xl p-4',
        className
      )}
    >
      <p className="text-xs text-muted-foreground leading-relaxed">
        This tool checks your information against publicly available Korean visa
        requirements. It does not constitute legal advice. Final decisions on
        visa issuance rest solely with the Korean Ministry of Justice and
        immigration authorities.
      </p>
    </div>
  );
}

// Income calculator disclaimer
export function IncomeDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn('text-xs text-muted-foreground', className)}>
      Income thresholds are based on publicly available GNI data from the Bank
      of Korea. Actual verification is performed by immigration authorities
      using official documentation.
    </p>
  );
}

// 183-day tracker disclaimer
export function DayTrackerDisclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg p-3',
        className
      )}
    >
      <p className="text-xs text-muted-foreground leading-relaxed">
        This tracker shows days physically present in Korea for informational
        purposes only. Tax residency status depends on multiple factors
        including your overall circumstances, income sources, and family
        situation. This is not tax advice. Consult a qualified tax professional
        for guidance specific to your situation.
      </p>
    </div>
  );
}
