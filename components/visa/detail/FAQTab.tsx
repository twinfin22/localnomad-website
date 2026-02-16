"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import type { VisaInfo } from "@/lib/visa/types";

interface FAQTabProps {
  visa: VisaInfo;
}

export function FAQTab({ visa }: FAQTabProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <AnimatedSection>
      <div>
        <h2 className="text-2xl font-bold  mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {visa.faqs.map((faq, index) => (
            <div
              key={`faq-${index}`}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedFaq(expandedFaq === index ? null : index)
                }
                className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
