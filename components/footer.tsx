"use client";

import Link from "next/link";
import { Newspaper, Instagram } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

const footerLinks = [
  { href: "/bundles", label: "Bundles" },
  { href: "/areas", label: "Area Guide" },
  { href: "/visa", label: "Visa" },
];

export function Footer() {
  return (
    <footer className="py-20 px-6 relative overflow-hidden bg-secondary">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-dots-navy opacity-30" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <AnimatedSection>
          {/* Logo */}
          <div className="text-center mb-6">
            <span className="text-2xl font-bold font-heading text-primary">LocalNomad</span>
          </div>

          <div className="text-center mb-10">
            <p className="text-lg text-muted-foreground font-light italic">
              Where Nomads Become <span className="text-accent font-medium">Local</span>, and Locals Become <span className="text-primary font-medium">Nomads</span>
            </p>
          </div>

          {/* Service Links */}
          <div className="flex justify-center gap-8 mb-10">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors link-coral-underline"
              >
                {link.label}
              </Link>
            ))}
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

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 LocalNomad ·{" "}
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>{" "}
              ·{" "}
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>{" "}
              ·{" "}
              <Link href="/refund" className="hover:text-primary transition-colors">
                Refund
              </Link>
            </p>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
}
