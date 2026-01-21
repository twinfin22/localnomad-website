"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

export function PricingSection() {
  return (
    <section id="boots-on-ground" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A1033] to-[#0D0221]" />
      <div className="absolute inset-0 bg-gradient-radial opacity-40" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <AnimatedSection>
          <h2 className="text-fluid-section font-bold text-center text-white mb-12 sm:mb-16 text-balance">
            Choose Your <span className="text-gradient">Landing</span>
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <AnimatedSection delay={0}>
            <Card className="p-6 sm:p-8 glass-card hover:border-glow-purple hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <h3 className="text-fluid-subsection font-bold text-white mb-2">72 hours</h3>
              <div className="mb-6">
                <span className="text-fluid-price font-bold text-[#00F5D4]">$150</span>
              </div>
              <ul className="space-y-4 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#00F5D4] flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-white/70">Pre-arrival cheat sheet & checklist</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#00F5D4] flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-white/70">Living playbook for landing in Korea</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#00F5D4] flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-white/70">
                    1:1 onboarding call (includes unlimited Q&A on the playbook)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#00F5D4] flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-white/70">
                    Area orientation guide (shared after neighborhood decision)
                  </span>
                </li>
              </ul>
              <div className="mt-8">
                <Button size="cta" className="w-full bg-[#8338EC] hover:bg-[#9B4DFF] text-white border-0 hover:-translate-y-0.5 hover:glow-purple transition-all duration-300" asChild>
                  <a href="mailto:hello@localnomad.club?subject=72%20Hours%20Soft%20Landing">
                    Get Started
                  </a>
                </Button>
              </div>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <Card className="p-6 sm:p-8 relative overflow-hidden hover:-translate-y-2 transition-all duration-300 flex flex-col h-full border-0">
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF006E] via-[#8338EC] to-[#00F5D4] rounded-xl" />
              <div className="absolute inset-[2px] bg-[#1A1033] rounded-[10px]" />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-fluid-subsection font-bold text-white">14 days</h3>
                  <span className="text-xs px-2 py-0.5 bg-[#FF006E] text-white rounded-full">Popular</span>
                </div>
                <div className="mb-6">
                  <span className="text-fluid-price font-bold text-gradient">$350</span>
                </div>
                <ul className="space-y-4 flex-1">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#00F5D4] flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-white/90">Everything in 72 hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#00F5D4] flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-white/90">Guided temporary accommodation setup</span>
                  </li>
                  <li className="flex items-start gap-3 pl-8">
                    <span className="text-xs sm:text-sm text-white/70">• Hotel / coliving / serviced apartment options</span>
                  </li>
                  <li className="flex items-start gap-3 pl-8">
                    <span className="text-xs sm:text-sm text-white/70">• Help prepare required paperwork</span>
                  </li>
                  <li className="flex items-start gap-3 pl-8">
                    <span className="text-xs sm:text-sm text-white/70">• Check-in support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#00F5D4] flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-white/90">1:1 check-in call</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Button size="cta" className="w-full bg-gradient-to-r from-[#FF006E] to-[#8338EC] hover:from-[#FF006E] hover:to-[#FF006E] text-white border-0 hover:-translate-y-0.5 hover:glow-magenta transition-all duration-300" asChild>
                    <a href="mailto:hello@localnomad.club?subject=14%20Days%20Soft%20Landing">
                      Get Started
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <Card className="p-6 sm:p-8 glass-card hover:border-glow-purple hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <h3 className="text-fluid-subsection font-bold text-white mb-2">Custom Add-on</h3>
              <div className="mb-6">
                <span className="text-fluid-price font-bold text-[#00F5D4]">$150</span>
              </div>
              <ul className="space-y-4 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#00F5D4] flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-white/70">
                    In-person accompaniment (bank, government offices, hospital, etc.)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#00F5D4] flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-white/70">Airport pickup & drop-off</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#00F5D4] flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-white/70">Open to suggestions</span>
                </li>
              </ul>
              <div className="mt-8">
                <Button size="cta" className="w-full bg-transparent border border-[#8338EC] text-white hover:bg-[#8338EC]/20 hover:border-[#FF006E] hover:-translate-y-0.5 transition-all duration-300" asChild>
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
