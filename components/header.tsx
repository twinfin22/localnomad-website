"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { parseLocalePath, buildLocalePath } from "@/lib/i18n/config";

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const { locale, country } = parseLocalePath(pathname);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const localePath = (path: string) =>
    buildLocalePath(path, locale, country ?? undefined);

  const navLinks = [
    { href: localePath("/bundles"), label: t("nav.bundles") },
    { href: localePath("/areas"), label: t("nav.areaGuide") },
    { href: localePath("/visa"), label: t("nav.visa") },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-surface/95 backdrop-blur-md border-b border-border"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <Link href={localePath("/")} className="group shrink-0">
            <span className="text-lg sm:text-xl font-bold text-foreground opacity-100 group-hover:text-primary transition-colors duration-200">
              LocalNomad
            </span>
          </Link>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8 mx-6 lg:mx-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <LanguageSwitcher />
            <Link href={localePath("/bundles")} className="hidden sm:block">
              <Button
                size="sm"
                variant="primary"
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                {t("common.getStarted")}
              </Button>
            </Link>
            <button
              className="md:hidden p-2 text-foreground cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-3">
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
              <Link href={localePath("/bundles")} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full mt-2"
                >
                  {t("common.getStarted")}
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
