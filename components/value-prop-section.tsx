"use client";

import { CheckCircle2 } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

export function ValuePropSection() {
  return (
    <section id="soft-landing" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-secondary">
      <div className="container mx-auto max-w-5xl relative z-10">
        <AnimatedSection className="text-center mb-12 sm:mb-16">
          <h2 className="text-fluid-section font-bold text-foreground mb-4 text-balance px-2">
            Remove friction from your first{" "}
            <span className="text-primary">14 days</span> in Seoul.
          </h2>
          <p className="text-fluid-subhero text-muted-foreground font-light px-2">Focus on living, not logistics</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
          <AnimatedSection delay={0}>
            <div className="space-y-4 group p-6 rounded-xl bg-card border border-border hover:border-primary/30 shadow-card hover:shadow-card-hover transition-all duration-300">
              <CheckCircle2 className="w-8 h-8 text-accent mb-4 transition-all duration-300 group-hover:scale-110" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground text-pretty">
                Stop "Paying Attention" just to get "free" information
              </h3>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span>No more fragmented "Complete Guides"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span>Continuously updated, human-verified context</span>
                </li>
              </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="space-y-4 group p-6 rounded-xl bg-card border border-border hover:border-primary/30 shadow-card hover:shadow-card-hover transition-all duration-300">
              <CheckCircle2 className="w-8 h-8 text-accent mb-4 transition-all duration-300 group-hover:scale-110" />
              <h3 className="text-lg sm:text-xl font-bold text-foreground text-pretty">
                Stop debugging local processes.
              </h3>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span>With a local present, routine processes become simple</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span>
                    From real estate agents to public offices, a local presence keeps interactions clear and efficient
                  </span>
                </li>
              </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <div className="space-y-4 group p-6 rounded-xl bg-card border border-border hover:border-primary/30 shadow-card hover:shadow-card-hover transition-all duration-300">
              <CheckCircle2 className="w-8 h-8 text-accent mb-4 transition-all duration-300 group-hover:scale-110" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground text-pretty">
                Avoid the usual early-stage friction
              </h3>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span>Area orientation guide to keep your first 72 hours smooth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 flex-shrink-0">•</span>
                  <span>We guarantee completeness through unlimited Q&A during your onboarding call</span>
                </li>
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
