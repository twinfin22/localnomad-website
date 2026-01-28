"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmailCaptureDialog } from "@/components/email-capture-dialog";

export function HeroSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 overflow-hidden relative">
        {/* Background image with parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{
            backgroundImage: "url('/seoul-hero.png')",
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        {/* Gradient overlay - softer warm tones */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 dark:from-[#1A1D21]/80 dark:via-[#1A1D21]/70 dark:to-[#1A1D21]/90" />

        {/* Subtle ambient effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h1
            className={`text-fluid-hero font-bold mb-6 text-balance px-2 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
          >
            <span className="text-white">Don't Waste Your </span>
            <span className="text-primary">Seoul</span>
          </h1>

          <p
            className={`text-fluid-subhero text-white/70 mb-12 font-light px-2 max-w-2xl mx-auto transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            style={{ transitionDelay: "200ms" }}
          >
            Stop debugging your trip with broken AI data and messy social media clips <br /> Access the LocalNomad-verified playbook
          </p>

          <div
            className={`px-4 sm:px-0 max-w-sm mx-auto transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            style={{ transitionDelay: "400ms" }}
          >
            <Button
              size="cta"
              className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground border-0 hover:-translate-y-1 shadow-soft-md hover:shadow-soft-lg transition-all duration-300"
              onClick={() => setDialogOpen(true)}
            >
              Download the Zero-Friction Checklist
            </Button>
          </div>
        </div>
      </section>

      <EmailCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
