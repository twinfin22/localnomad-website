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
      <p className={cn('text-sm text-slate-500', className)}>
        This information is for general guidance only. Visa requirements change
        frequently. Always verify current requirements with the{' '}
        <a
          href="https://www.immigration.go.kr/immigration_eng/index.do"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-500 underline hover:text-cyan-400"
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
          'bg-amber-500/10 border-y border-amber-500/20 py-3 px-4',
          className
        )}
      >
        <div className="container mx-auto max-w-6xl">
          <p className="text-sm text-amber-200/80 text-center">
            <span className="font-medium text-amber-300">Note:</span> This tool
            provides general guidance only and does not constitute legal advice.
          </p>
        </div>
      </div>
    );
  }

  // Default: box variant
  return (
    <div
      className={cn(
        'bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {showIcon && (
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
        )}
        <div>
          <h4 className="text-lg font-semibold text-amber-400 mb-2">
            Important Notice
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            This information is for general guidance only. Visa requirements
            change frequently. Always verify current requirements with the{' '}
            <a
              href="https://www.immigration.go.kr/immigration_eng/index.do"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              Korea Immigration Service
            </a>{' '}
            or{' '}
            <a
              href="https://www.hikorea.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline hover:text-cyan-300"
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
        'bg-slate-800/50 border border-slate-700 rounded-xl p-4',
        className
      )}
    >
      <p className="text-xs text-slate-400 leading-relaxed">
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
    <p className={cn('text-xs text-slate-500', className)}>
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
        'bg-slate-800/50 border border-slate-700 rounded-lg p-3',
        className
      )}
    >
      <p className="text-xs text-slate-400 leading-relaxed">
        This tracker shows days physically present in Korea for informational
        purposes only. Tax residency status depends on multiple factors
        including your overall circumstances, income sources, and family
        situation. This is not tax advice. Consult a qualified tax professional
        for guidance specific to your situation.
      </p>
    </div>
  );
}
