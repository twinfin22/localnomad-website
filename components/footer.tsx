"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Newspaper, Instagram } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { parseLocalePath, buildLocalePath } from "@/lib/i18n/config";

export function Footer() {
  const t = useTranslations();
  const pathname = usePathname();
  const { locale, country } = parseLocalePath(pathname);

  const localePath = (path: string) =>
    buildLocalePath(path, locale, country ?? undefined);

  const footerLinks = [
    { href: localePath("/bundles"), label: t("nav.bundles") },
    { href: localePath("/areas"), label: t("nav.areaGuide") },
    { href: localePath("/visa"), label: t("nav.visa") },
  ];

  return (
    <footer className="py-16 px-6 relative overflow-hidden bg-surface">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto max-w-3xl relative z-10">
        <AnimatedSection>
          {/* Logo */}
          <div className="text-center mb-6">
            <span className="text-2xl font-bold text-foreground">{t("common.brand")}</span>
          </div>

          <div className="text-center mb-10">
            <p className="text-base text-muted-foreground">
              {t("footer.tagline")}
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
              {t("footer.copyright", { year: new Date().getFullYear() })} ·{" "}
              <Link href={localePath("/terms")} className="hover:text-foreground transition-colors duration-200">
                {t("footer.terms")}
              </Link>{" "}
              ·{" "}
              <Link href={localePath("/privacy")} className="hover:text-foreground transition-colors duration-200">
                {t("footer.privacy")}
              </Link>{" "}
              ·{" "}
              <Link href={localePath("/refund")} className="hover:text-foreground transition-colors duration-200">
                {t("footer.refund")}
              </Link>
            </p>
          </div>

          {/* Legal disclaimer */}
          <div className="mt-6 pt-4 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              LocalNomad provides general information about Korean visa
              requirements for educational purposes only. This information does
              not constitute legal advice. Visa decisions are made solely by
              Korean immigration authorities. For personalized legal advice,
              consult a licensed Korean 행정사 (administrative scrivener) or
              변호사 (attorney).
            </p>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
}
