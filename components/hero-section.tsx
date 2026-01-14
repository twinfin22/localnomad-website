"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmailCaptureDialog } from "@/components/email-capture-dialog";

export function HeroSection() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 overflow-hidden relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/seoul-hero.png')" }}
        />
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h1 className="text-fluid-hero font-bold text-white mb-6 text-balance px-2">
            A Softer Way to Land in Seoul
          </h1>

          <p className="text-fluid-subhero text-white/80 mb-12 font-light px-2 max-w-2xl mx-auto">
            Soft Landing Hack from arrival to daily life, designed by Local Nomads
          </p>

          <div className="px-4 sm:px-0 max-w-sm mx-auto">
            <Button
              variant="ctaPrimary"
              size="cta"
              className="w-full font-semibold"
              onClick={() => setDialogOpen(true)}
            >
              Get Curated Local Resources
            </Button>
          </div>
        </div>
      </section>

      <EmailCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
