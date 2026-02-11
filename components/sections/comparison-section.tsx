"use client";

import { CheckCircle, Circle } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

const comparisons = [
  {
    feature: "Pre-arrival checklist",
    nomad: true,
    longterm: true,
  },
  {
    feature: "Seoul survival playbook",
    nomad: true,
    longterm: true,
  },
  {
    feature: "Coworking & cafe guide",
    nomad: true,
    longterm: false,
  },
  {
    feature: "Neighborhood deep-dives",
    nomad: true,
    longterm: true,
  },
  {
    feature: "Custom housing report",
    nomad: false,
    longterm: true,
  },
  {
    feature: "Long-term visa guides (E-7, F-2)",
    nomad: false,
    longterm: true,
  },
  {
    feature: "Digital Nomad visa guide",
    nomad: true,
    longterm: false,
  },
  {
    feature: "Tax considerations",
    nomad: true,
    longterm: true,
  },
];

export function ComparisonSection() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-secondary">
      <div className="container mx-auto max-w-4xl">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-serif">
              Which Resources Are Right for You?
            </h2>
            <p className="text-lg text-muted-foreground">
              Different journeys need different guides
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50 p-4 font-semibold text-sm">
              <div>Resource</div>
              <div className="text-center">
                <span className="text-primary">Digital Nomad</span>
                <p className="text-xs font-normal text-muted-foreground">
                  1-6 months
                </p>
              </div>
              <div className="text-center">
                <span className="text-accent">Long-term Mover</span>
                <p className="text-xs font-normal text-muted-foreground">
                  1+ years
                </p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {comparisons.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 p-4 text-sm hover:bg-muted/30 transition-colors"
                >
                  <div>{item.feature}</div>
                  <div className="flex justify-center">
                    {item.nomad ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex justify-center">
                    {item.longterm ? (
                      <CheckCircle className="w-5 h-5 text-accent" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/30" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
