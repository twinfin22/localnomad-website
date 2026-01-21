"use client";

import { CheckCircle2 } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

export function ValuePropSection() {
  return (
    <section id="soft-landing" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0221] to-[#1A1033]" />
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <AnimatedSection className="text-center mb-12 sm:mb-16">
          <h2 className="text-fluid-section font-bold text-white mb-4 text-balance px-2">
            Remove friction from your first{" "}
            <span className="text-gradient">14 days</span> in Seoul.
          </h2>
          <p className="text-fluid-subhero text-white/60 font-light px-2">Focus on living, not logistics</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
          <AnimatedSection delay={0}>
            <div className="space-y-4 group p-6 rounded-xl glass-card hover:border-glow-purple transition-all duration-300">
              <CheckCircle2 className="w-8 h-8 text-[#00F5D4] mb-4 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,245,212,0.5)]" />
              <h3 className="text-lg sm:text-xl font-semibold text-white text-pretty">
                Stop "Paying Attention" just to get "free" information
              </h3>
              <ul className="space-y-2 text-white/60 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF006E] mt-1 flex-shrink-0">•</span>
                  <span>No more fragmented "Complete Guides"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF006E] mt-1 flex-shrink-0">•</span>
                  <span>Continuously updated, human-verified context</span>
                </li>
              </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="space-y-4 group p-6 rounded-xl glass-card hover:border-glow-purple transition-all duration-300">
              <CheckCircle2 className="w-8 h-8 text-[#00F5D4] mb-4 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,245,212,0.5)]" />
              <h3 className="text-lg sm:text-xl font-bold text-white text-pretty">
                Stop debugging local processes.
              </h3>
              <ul className="space-y-2 text-white/60 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF006E] mt-1 flex-shrink-0">•</span>
                  <span>With a local present, routine processes become simple</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF006E] mt-1 flex-shrink-0">•</span>
                  <span>
                    From real estate agents to public offices, a local presence keeps interactions clear and efficient
                  </span>
                </li>
              </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <div className="space-y-4 group p-6 rounded-xl glass-card hover:border-glow-purple transition-all duration-300">
              <CheckCircle2 className="w-8 h-8 text-[#00F5D4] mb-4 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,245,212,0.5)]" />
              <h3 className="text-lg sm:text-xl font-semibold text-white text-pretty">
                Avoid the usual early-stage friction
              </h3>
              <ul className="space-y-2 text-white/60 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF006E] mt-1 flex-shrink-0">•</span>
                  <span>Area orientation guide to keep your first 72 hours smooth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF006E] mt-1 flex-shrink-0">•</span>
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
