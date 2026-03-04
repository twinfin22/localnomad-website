import {
  ChevronDown,
  Info,
  Clock,
  TriangleAlert,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { linkifyText } from '@/lib/linkify-text';
import type { ApplicationStep } from '@/lib/types/visa';

interface ApplicationStepsProps {
  steps: ApplicationStep[];
}

export function ApplicationSteps({ steps }: ApplicationStepsProps) {
  const t = useTranslations('VisaDetail');

  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div
          key={step.id}
          className="rounded-lg border bg-white p-5"
        >
          <div className="flex items-start gap-4">
            {/* Step number circle */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {step.step}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold">{step.title}</h3>
                {step.duration && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <Clock className="h-3 w-3" />
                    {step.duration}
                  </span>
                )}
              </div>

              <details className="mt-2">
                <summary className="flex min-h-[44px] cursor-pointer items-center gap-1 text-sm text-primary hover:underline">
                  <ChevronDown className="chevron h-4 w-4 transition-transform duration-200 [details[open]>summary>&]:rotate-180" />
                  {t('details')}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {linkifyText(step.description)}
                </p>
                {step.tips && step.tips.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {step.tips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                        {linkifyText(tip)}
                      </li>
                    ))}
                  </ul>
                )}
                {step.links && step.links.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary underline underline-offset-2 hover:text-primary/80"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
                {step.warnings && step.warnings.length > 0 && (
                  <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div className="space-y-1">
                      {step.warnings.map((warning, i) => (
                        <p key={i}>{warning}</p>
                      ))}
                    </div>
                  </div>
                )}
              </details>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
