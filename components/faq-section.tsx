"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatedSection } from "@/components/animated-section";

const faqItems = [
  {
    value: "item-1",
    question: "Who is this for?",
    answer: (
      <p>
        For borderless nomads who want momentum, not early friction. Built from problems we faced ourselves — now
        solved in our home city.
      </p>
    ),
  },
  {
    value: "item-2",
    question: "Who is this not for?",
    answer: (
      <ul className="space-y-2">
        <li>• Tourists looking for a guide</li>
        <li>• Businesses seeking relocation services</li>
        <li>• Anyone needing professional visa, tax, or legal services</li>
      </ul>
    ),
  },
  {
    value: "item-3",
    question: "Who's behind LocalNomad? Do you live in Seoul?",
    answer: (
      <p>
        We're slowmads based in Seoul. One of us is Korea-born and raised; the other recently moved their base to
        Seoul.
      </p>
    ),
  },
  {
    value: "item-4",
    question: "I just made the purchase. What now?",
    answer: (
      <p>
        Check your inbox. You'll receive all guides (except the area orientation guide, which is customized after
        accommodation choice). You'll also receive a link to schedule your call.
      </p>
    ),
  },
  {
    value: "item-5",
    question: "Can't I just figure this out myself?",
    answer: (
      <>
        <p className="mb-3">You absolutely can.</p>
        <p className="mb-3">That's why we offer a free curated list of local resources — to help you get started on your own.</p>
        <p>LocalNomad is for people who don't want to spend their first weeks verifying generated information, comparing options, or learning through trial and error. We help you move forward with clarity and confidence.</p>
      </>
    ),
  },
  {
    value: "item-6",
    question: "What's the difference between the 72 hours and 14 days plans?",
    answer: (
      <>
        <p className="mb-3">The 72 hours plan helps you land.<br />The 14 days plan helps you feel settled.</p>
        <p className="mb-3">The 72 hours plan is designed for immediate needs right after arrival.</p>
        <p>The 14 days plan is for people who want ongoing guidance — enough time to understand their options, ask questions, and feel confident about where and how they settle in.</p>
      </>
    ),
  },
  {
    value: "item-7",
    question: "How do I know your content won't be outdated or incomplete?",
    answer: (
      <>
        <p className="mb-3">Our guidance doesn't stop at static content.</p>
        <p>Within the scope of what you purchase, you can ask unlimited questions — so we make sure the information stays relevant, complete, and tailored to your situation.</p>
      </>
    ),
  },
];

export function FaqSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden relative bg-background">
      <div className="container mx-auto max-w-3xl relative z-10">
        <AnimatedSection>
          <h2 className="text-fluid-section font-bold text-center text-foreground mb-12 sm:mb-16">
            <span className="text-primary">FAQ</span>
          </h2>
        </AnimatedSection>

        <Accordion type="single" collapsible className="space-y-4">
          {faqItems.map((item, index) => (
            <AnimatedSection key={item.value} delay={index * 75}>
              <AccordionItem
                value={item.value}
                className="bg-card border border-border rounded-xl px-4 sm:px-6 transition-all duration-300 hover:border-primary/30 shadow-card hover:shadow-card-hover"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            </AnimatedSection>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
