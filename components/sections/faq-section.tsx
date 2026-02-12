"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedSection } from "@/components/animated-section";

const faqs = [
  {
    question: "Who are these guides for?",
    answer:
      "Our resources are designed for digital nomads, remote workers, and anyone planning to move to Korea for short-term or long-term stays. Whether you're coming for 3 months or 3 years, we have guides tailored to your journey.",
  },
  {
    question: "How are your guides different from free information online?",
    answer:
      "Unlike scattered blog posts and outdated forum threads, our guides are curated, verified, and regularly updated. We've personally navigated the Korean system and compiled everything into actionable, step-by-step formats that save you 40+ hours of research.",
  },
  {
    question: "What's included in the custom housing report?",
    answer:
      "Tell us your budget, preferred neighborhoods, and must-haves via our form. Within 48 hours, you'll receive a personalized report with 5-10 curated listings, neighborhood insights, commute times, and direct links to contact landlords or agents.",
  },
  {
    question: "Are the visa guides up to date?",
    answer:
      "Yes! We monitor Korean immigration policy changes and update our guides accordingly. Each guide includes a 'last updated' date so you know the information is current.",
  },
  {
    question: "Can I get a refund if the guide doesn't help?",
    answer:
      "We offer a 7-day money-back guarantee on all digital products. If our guides don't provide value, just reach out and we'll process your refund, no questions asked.",
  },
  {
    question: "Do you offer 1-on-1 consulting?",
    answer:
      "Currently, we focus on self-serve resources to keep prices accessible. However, our custom housing reports include a brief Q&A session if you need clarification on your options.",
  },
];

export function FaqSection() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-secondary">
      <div className="container mx-auto max-w-3xl">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-bold">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Got questions? We&apos;ve got answers.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
}
