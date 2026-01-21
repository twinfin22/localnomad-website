"use client";

import { Newspaper, Instagram } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

export function Footer() {
  return (
    <footer className="py-16 px-6 relative overflow-hidden bg-secondary">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <AnimatedSection>
          <div className="text-center mb-8">
            <p className="text-xl text-muted-foreground font-light italic">
              Where Nomads Become <span className="text-accent">Local</span>, and Locals Become <span className="text-primary">Nomads</span>
            </p>
          </div>

          <div className="flex justify-center gap-8">
            <a
              href="https://www.instagram.com/localnomad.club/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary hover:scale-110 hover:-translate-y-0.5 transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://startofsomethingnew.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent hover:scale-110 hover:-translate-y-0.5 transition-all duration-300"
              aria-label="Newsletter"
            >
              <Newspaper className="w-6 h-6" />
            </a>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
}
