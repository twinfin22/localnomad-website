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
    <footer className="py-16 px-6 relative overflow-hidden bg-surface">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto max-w-3xl relative z-10">
        <AnimatedSection>
          {/* Logo */}
          <div className="text-center mb-6">
            <span className="text-2xl font-bold text-foreground">LocalNomad</span>
          </div>

          <div className="text-center mb-10">
            <p className="text-base text-muted-foreground">
              Where Nomads Become <span className="text-primary font-medium">Local</span>, and Locals Become <span className="text-primary font-medium">Nomads</span>
            </p>
          </div>

          {/* Service Links */}
          <div className="flex justify-center gap-8 mb-10">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
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
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://startofsomethingnew.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              aria-label="Newsletter"
            >
              <Newspaper className="w-6 h-6" />
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 LocalNomad ·{" "}
              <Link href="/terms" className="hover:text-foreground transition-colors duration-200">
                Terms
              </Link>{" "}
              ·{" "}
              <Link href="/privacy" className="hover:text-foreground transition-colors duration-200">
                Privacy
              </Link>{" "}
              ·{" "}
              <Link href="/refund" className="hover:text-foreground transition-colors duration-200">
                Refund
              </Link>
            </p>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
}
