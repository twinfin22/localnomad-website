import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FAQ } from '@/lib/types/visa';

interface FaqSectionProps {
  faqs: FAQ[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <div className="rounded-lg border bg-white">
      {faqs.map((faq, index) => (
        <details
          key={index}
          className={cn(
            'group',
            index < faqs.length - 1 && 'border-b'
          )}
        >
          <summary className="flex min-h-[44px] cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium">
            <span>{faq.question}</span>
            <ChevronDown className="chevron h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-4 pt-0">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
