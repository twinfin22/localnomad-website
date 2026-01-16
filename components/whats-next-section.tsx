"use client";

import { Button } from "@/components/ui/button";

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
      <div className="absolute inset-0 bg-black/60 dark:bg-black/70" />
      <div className="container mx-auto max-w-4xl relative z-10">
        <h2 className="text-fluid-section font-bold text-center text-white mb-12 sm:mb-16 text-balance">
          What's Next
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <Button size="cta" variant="ctaOutline" asChild>
            <a href="/business">
              Need Boots on the ground?
            </a>
          </Button>
          <Button size="cta" variant="ctaPrimary" asChild>
            <a href="https://www.meetup.com/localnomad/events/" target="_blank" rel="noopener noreferrer">
              Join our Deep Work Session
            </a>
          </Button>
          <Button size="cta" variant="ctaOutline" onClick={scrollToEmailCapture}>
            Get Curated Local Resources
          </Button>
        </div>
      </div>
    </section>
  );
}
