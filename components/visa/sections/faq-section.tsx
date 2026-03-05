import { ChevronDown } from 'lucide-react';
import type { FAQ } from '@/lib/types/visa';

interface FaqSectionProps {
  faqs: FAQ[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <details
          key={index}
          className="group rounded-lg border bg-white transition-shadow hover:shadow-sm"
        >
          <summary className="flex min-h-[52px] cursor-pointer items-center justify-between gap-4 px-5 py-4 text-base font-medium group-open:border-l-4 group-open:border-l-primary group-open:pl-4">
            <span>{faq.question}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="border-t px-5 pb-5 pt-3">
            <p className="text-base leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
