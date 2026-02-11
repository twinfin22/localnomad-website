"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

export function PricingSection() {
  return (
    <section id="boots-on-ground" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-secondary" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <AnimatedSection>
          <h2 className="text-fluid-section font-bold text-center text-foreground mb-12 sm:mb-16 text-balance">
            Choose Your <span className="text-primary">Landing</span>
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <AnimatedSection delay={0}>
            <Card className="p-6 sm:p-8 bg-card border border-border hover:border-primary/30 hover:-translate-y-1 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full">
              <h3 className="text-fluid-subsection font-bold text-foreground mb-2">72 hours</h3>
              <div className="mb-6">
                <span className="text-fluid-price font-bold text-accent">$150</span>
              </div>
              <ul className="space-y-4 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-muted-foreground">Pre-arrival cheat sheet & checklist</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-muted-foreground">Living playbook for landing in Korea</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-muted-foreground">
                    1:1 onboarding call (includes unlimited Q&A on the playbook)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-muted-foreground">
                    Area orientation guide (shared after neighborhood decision)
                  </span>
                </li>
              </ul>
              <div className="mt-8">
                <Button size="cta" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground border-0 hover:-translate-y-0.5 shadow-soft hover:shadow-soft-md transition-all duration-300" asChild>
                  <a href="mailto:hello@localnomad.club?subject=72%20Hours%20Soft%20Landing">
                    Get Started
                  </a>
                </Button>
              </div>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <Card className="p-6 sm:p-8 relative overflow-hidden hover:-translate-y-2 transition-all duration-300 flex flex-col h-full border-2 border-primary shadow-elevated">
              {/* Popular badge */}
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">Popular</div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-fluid-subsection font-bold text-foreground">14 days</h3>
                </div>
                <div className="mb-6">
                  <span className="text-fluid-price font-bold text-primary">$350</span>
                </div>
                <ul className="space-y-4 flex-1">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-foreground">Everything in 72 hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-foreground">Guided temporary accommodation setup</span>
                  </li>
                  <li className="flex items-start gap-3 pl-8">
                    <span className="text-xs sm:text-sm text-muted-foreground">• Hotel / coliving / serviced apartment options</span>
                  </li>
                  <li className="flex items-start gap-3 pl-8">
                    <span className="text-xs sm:text-sm text-muted-foreground">• Checklist of required paperwork</span>
                  </li>
                  <li className="flex items-start gap-3 pl-8">
                    <span className="text-xs sm:text-sm text-muted-foreground">• Check-in support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-foreground">1:1 check-in call</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Button size="cta" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0 hover:-translate-y-0.5 shadow-soft-md hover:shadow-soft-lg transition-all duration-300" asChild>
                    <a href="mailto:hello@localnomad.club?subject=14%20Days%20Soft%20Landing">
                      Get Started
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <Card className="p-6 sm:p-8 bg-card border border-border hover:border-primary/30 hover:-translate-y-1 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full">
              <h3 className="text-fluid-subsection font-bold text-foreground mb-2">Custom Add-on</h3>
              <div className="mb-6">
                <span className="text-fluid-price font-bold text-accent">$150</span>
              </div>
              <ul className="space-y-4 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-muted-foreground">
                    In-person accompaniment (bank, government offices, hospital, etc.) — Logistical and language support only.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-muted-foreground">Airport pickup & drop-off</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-muted-foreground">Open to suggestions</span>
                </li>
              </ul>
              <div className="mt-8">
                <Button size="cta" className="w-full bg-transparent border border-border text-foreground hover:bg-secondary hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300" asChild>
                  <a href="mailto:hello@localnomad.club?subject=Custom%20Add-on%20Inquiry">
                    Contact Us
                  </a>
                </Button>
              </div>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
