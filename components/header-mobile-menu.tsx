"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavLink {
  href: string;
  label: string;
}

interface HeaderMobileMenuProps {
  navLinks: NavLink[];
  ctaHref: string;
  ctaLabel: string;
}

export function HeaderMobileMenu({
  navLinks,
  ctaHref,
  ctaLabel,
}: HeaderMobileMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden p-2 text-foreground cursor-pointer"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {mobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4 absolute top-full left-0 right-0 bg-surface/95 backdrop-blur-md px-4 sm:px-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href={ctaHref} onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" variant="primary" className="w-full mt-2">
                {ctaLabel}
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
