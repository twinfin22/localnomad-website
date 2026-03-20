'use client';

import { useState } from 'react';
import {
  Info,
  Clock,
  ChevronRight,
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
    <div className="relative ml-5 pl-16">
      {steps.map((step, index) => (
        <TimelineStep
          key={step.id}
          step={step}
          index={index}
          total={steps.length}
          isLast={index === steps.length - 1}
          tipsLabel={t('tips')}
        />
      ))}
    </div>
  );
}

function TimelineStep({
  step,
  index,
  total,
  isLast,
  tipsLabel,
}: {
  step: ApplicationStep;
  index: number;
  total: number;
  isLast: boolean;
  tipsLabel: string;
}) {
  const [tipsOpen, setTipsOpen] = useState(false);
  const hasTips = step.tips && step.tips.length > 0;

  // Per-step line opacity: darkens as steps progress (0.15 → 0.35)
  const lineOpacity = 0.15 + (index / Math.max(total - 1, 1)) * 0.2;

  return (
    <div className={`relative ${isLast ? 'pb-0' : 'pb-10'}`}>
      {/* Line segment to next step — rendered per-step to avoid overshoot */}
      {!isLast && (
        <div
          className="absolute -left-[25px] top-8 bottom-0 w-0.5"
          style={{
            backgroundColor: 'var(--primary)',
            opacity: lineOpacity,
          }}
        />
      )}

      {/* Timeline node — larger circle with stronger visual presence */}
      <div className="absolute -left-[38px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-lora text-sm font-bold text-primary shadow-sm">
        {step.step}
      </div>

      {/* Content */}
      <div className="min-w-0 pt-0.5">
        {/* Title + duration badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="font-lora text-lg font-bold leading-snug sm:text-xl">
            {step.title}
          </h3>
          {step.duration && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-primary"
              style={{
                background:
                  'linear-gradient(135deg, rgba(42,111,151,0.1), rgba(27,73,101,0.15))',
              }}
            >
              <Clock className="h-3 w-3" />
              {step.duration}
            </span>
          )}
        </div>

        {/* Description — always visible */}
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {linkifyText(step.description)}
        </p>

        {/* Warnings — always visible */}
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

        {/* Links */}
        {step.links && step.links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {step.links.map((link, idx) => (
              <a
                key={idx}
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

        {/* Tips — collapsible with smooth animation */}
        {hasTips && (
          <>
            <button
              type="button"
              onClick={() => setTipsOpen(!tipsOpen)}
              className="mt-3 flex items-center gap-1 text-sm text-primary/70 transition-colors hover:text-primary"
            >
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform duration-200 ${tipsOpen ? 'rotate-90' : ''}`}
              />
              {step.tips!.length} {tipsLabel}
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{
                gridTemplateRows: tipsOpen ? '1fr' : '0fr',
              }}
            >
              <div className="overflow-hidden">
                <ul className="mt-2 space-y-1.5 pl-5 pb-0.5">
                  {step.tips!.map((tip, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                      {linkifyText(tip)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
