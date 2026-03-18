'use client';

import { Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FAQ } from '@/lib/types/visa';

interface FaqSectionProps {
  faqs: FAQ[];
  /** General tips from visa.tips — rendered below FAQs */
  generalTips?: string[];
}

const INLINE_COUNT = 3;

export function FaqSection({ faqs, generalTips }: FaqSectionProps) {
  const t = useTranslations('VisaDetail');

  if (faqs.length === 0 && (!generalTips || generalTips.length === 0)) return null;

  const inlineFaqs = faqs.slice(0, INLINE_COUNT);
  const remainingFaqs = faqs.slice(INLINE_COUNT);

  return (
    <div className="space-y-6">
      {/* Top FAQs — always visible */}
      {inlineFaqs.length > 0 && (
        <Accordion type="single" collapsible className="space-y-2">
          {inlineFaqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`} className="border-b-0">
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Remaining FAQs — behind expand */}
      {remainingFaqs.length > 0 && (
        <details>
          <summary className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium text-primary hover:underline">
            {t('showAllQuestions', { count: faqs.length })}
          </summary>
          <Accordion type="single" collapsible className="mt-3 space-y-2">
            {remainingFaqs.map((faq, index) => (
              <AccordionItem
                key={index + INLINE_COUNT}
                value={`faq-${index + INLINE_COUNT}`}
                className="border-b-0"
              >
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </details>
      )}

      {/* General tips — merged from visa.tips */}
      {generalTips && generalTips.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-primary" />
            {t('tips')}
          </h3>
          <ul className="space-y-2">
            {generalTips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
