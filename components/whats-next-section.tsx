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
      {/* Neon gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0221]/80 via-[#1A1033]/70 to-[#0D0221]/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF006E]/10 via-transparent to-[#8338EC]/10" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <AnimatedSection>
          <h2 className="text-fluid-section font-bold text-center text-white mb-12 sm:mb-16 text-balance">
            What's <span className="text-gradient">Next</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <AnimatedSection delay={0}>
            <Button size="cta" className="w-full bg-transparent border border-[#8338EC] text-white hover:bg-[#8338EC]/20 hover:border-[#00F5D4] hover:-translate-y-1 transition-all duration-300" asChild>
              <a href="/business">
                Need Boots on the ground?
              </a>
            </Button>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <Button size="cta" className="w-full bg-gradient-to-r from-[#FF006E] to-[#8338EC] hover:from-[#FF006E] hover:to-[#FF006E] text-white border-0 hover:-translate-y-1 hover:glow-magenta transition-all duration-300" asChild>
              <a href="https://www.meetup.com/localnomad/events/" target="_blank" rel="noopener noreferrer">
                Join our Deep Work Session
              </a>
            </Button>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <Button size="cta" className="w-full bg-transparent border border-[#8338EC] text-white hover:bg-[#8338EC]/20 hover:border-[#00F5D4] hover:-translate-y-1 transition-all duration-300" onClick={scrollToEmailCapture}>
              Get Curated Local Resources
            </Button>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
