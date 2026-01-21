"use client";

import { Newspaper, Instagram } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

export function Footer() {
  return (
    <footer className="py-16 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0D0221]" />

      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8338EC] to-transparent" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <AnimatedSection>
          <div className="text-center mb-8">
            <p className="text-xl text-white/50 font-light italic">
              Where Nomads Become <span className="text-[#00F5D4]">Local</span>, and Locals Become <span className="text-[#FF006E]">Nomads</span>
            </p>
          </div>

          <div className="flex justify-center gap-8">
            <a
              href="https://www.instagram.com/localnomad.club/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-[#FF006E] hover:scale-110 hover:-translate-y-0.5 hover:drop-shadow-[0_0_8px_rgba(255,0,110,0.5)] transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://startofsomethingnew.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-[#00F5D4] hover:scale-110 hover:-translate-y-0.5 hover:drop-shadow-[0_0_8px_rgba(0,245,212,0.5)] transition-all duration-300"
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
