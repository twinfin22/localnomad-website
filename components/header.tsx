import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { HeaderScrollWrapper } from "@/components/header-scroll-wrapper";
import { HeaderMobileMenu } from "@/components/header-mobile-menu";
import {
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface HeaderProps {
  locale: Locale;
  country?: Country;
}

export async function Header({ locale, country }: HeaderProps) {
  const t = await getTranslations();

  const localePath = (path: string) =>
    buildLocalePath(path, locale, country);

  const navLinks = [
    { href: localePath("/visa"), label: t("nav.visa") },
  ];

  const ctaHref = localePath("/visa");
  const ctaLabel = t("common.getStarted");

  return (
    <HeaderScrollWrapper>
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
            <Link href={ctaHref} className="hidden sm:block">
              <Button
                size="sm"
                variant="primary"
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                {ctaLabel}
              </Button>
            </Link>
            <HeaderMobileMenu
              navLinks={navLinks}
              ctaHref={ctaHref}
              ctaLabel={ctaLabel}
            />
          </div>
        </div>
      </div>
    </HeaderScrollWrapper>
  );
}
