import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FAQ } from '@/lib/types/visa';

interface FaqSectionProps {
  faqs: FAQ[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`faq-${index}`} className="border-b-0">
          <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
