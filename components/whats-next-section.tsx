"use client";

import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";

export function WhatsNextSection() {
  const scrollToEmailCapture = () => {
    const element = document.getElementById("email-capture");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="popup-residency" className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/whats-next-bg.png')" }}
      />
      {/* Soft gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 dark:from-[#1A1D21]/90 dark:via-[#1A1D21]/80 dark:to-[#1A1D21]/95" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <AnimatedSection>
          <h2 className="text-fluid-section font-bold text-center text-white mb-12 sm:mb-16 text-balance">
            What's <span className="text-primary">Next</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <AnimatedSection delay={0}>
            <Button size="cta" className="w-full bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:-translate-y-1 transition-all duration-300" asChild>
              <a href="/business">
                Need Boots on the ground?
              </a>
            </Button>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <Button size="cta" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0 hover:-translate-y-1 shadow-soft-md hover:shadow-soft-lg transition-all duration-300" asChild>
              <a href="https://www.meetup.com/localnomad/events/" target="_blank" rel="noopener noreferrer">
                Join our Deep Work Session
              </a>
            </Button>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <Button size="cta" className="w-full bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:-translate-y-1 transition-all duration-300" onClick={scrollToEmailCapture}>
              Download the Zero-Friction Checklist
            </Button>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
