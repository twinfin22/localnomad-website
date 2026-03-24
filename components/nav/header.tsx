'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { cn } from '@/lib/utils';
import { CountryDropdown, COUNTRIES } from './country-dropdown';
import { MobileMenu } from './mobile-menu';
import type { CountryKey, CountryConfig } from './country-dropdown';

type SectionType = 'visa' | 'neighborhood' | 'checklist' | 'other';

function detectCountryFromPath(pathname: string): CountryKey | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  // /neighborhood/[country]
  if (segments[0] === 'neighborhood' && segments[1]) {
    const map: Record<string, CountryKey> = { korea: 'korea', japan: 'japan', taiwan: 'taiwan' };
    return map[segments[1]] ?? null;
  }

  // /[country]/... or /southeast-asia/...
  const map: Record<string, CountryKey> = {
    korea: 'korea',
    japan: 'japan',
    taiwan: 'taiwan',
    'southeast-asia': 'sea',
  };
  return map[segments[0]] ?? null;
}

function detectSectionFromPath(pathname: string): SectionType {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'neighborhood') return 'neighborhood';
  if (segments[1] === 'checklist') return 'checklist';
  const countryKeys = ['korea', 'japan', 'taiwan', 'southeast-asia'];
  if (countryKeys.includes(segments[0])) return 'visa';
  return 'other';
}

function buildCountryPath(newCountry: CountryConfig, section: SectionType): string | null {
  switch (section) {
    case 'neighborhood': return newCountry.neighborhoodPath ?? newCountry.visaPath;
    case 'checklist': return newCountry.checklistPath ?? newCountry.visaPath;
    case 'visa': return newCountry.visaPath;
    default: return null;
  }
}

function getStoredCountry(): CountryKey | null {
  try {
    const stored = localStorage.getItem('ln-selected-country');
    if (stored && ['korea', 'japan', 'taiwan', 'sea'].includes(stored)) {
      return stored as CountryKey;
    }
  } catch {}
  return null;
}

export const Header = () => {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const router = useRouter();

  // Landing page detection — next-intl usePathname strips locale prefix
  // So /en → '/', /en/korea → '/korea'
  const isLanding = pathname === '/' || pathname === '';

  const [isScrolled, setIsScrolled] = useState(false);

  // URL-derived country takes priority; user manual selection is a fallback for context-less pages
  const countryFromUrl = detectCountryFromPath(pathname);
  const [manualCountry, setManualCountry] = useState<CountryKey>('korea');

  // Hydrate from localStorage after mount
  useEffect(() => {
    const stored = getStoredCountry();
    if (stored) {
      // Reading from external system (localStorage) — not a cascading render
      startTransition(() => setManualCountry(stored));
    }
  }, []);
  const selectedCountry: CountryKey = countryFromUrl ?? manualCountry;

  // Scroll listener — only needed on landing page
  useEffect(() => {
    if (!isLanding) return;
    // Check initial scroll position (e.g. back-navigation scroll restore)
    startTransition(() => setIsScrolled(window.scrollY > 50));
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  const currentSection = detectSectionFromPath(pathname);

  const handleCountryChange = useCallback((key: CountryKey) => {
    setManualCountry(key);
    try { localStorage.setItem('ln-selected-country', key); } catch {}
    const newCountry = COUNTRIES.find((c) => c.key === key) ?? COUNTRIES[0];
    const targetPath = buildCountryPath(newCountry, currentSection);
    if (targetPath) router.push(targetPath as Parameters<typeof router.push>[0]);
  }, [currentSection, router]);

  const isTransparent = isLanding && !isScrolled;
  const country = COUNTRIES.find((c) => c.key === selectedCountry) ?? COUNTRIES[0];

  const navLinkClass = cn(
    'hidden md:inline-flex font-medium transition-colors text-sm',
    isTransparent ? 'text-white/90 hover:text-white' : 'text-foreground/80 hover:text-foreground'
  );

  const discordClass = cn(
    'hidden md:inline-flex rounded-full p-2 transition-colors',
    isTransparent
      ? 'text-white/70 hover:bg-white/10 hover:text-white'
      : 'text-muted-foreground/60 hover:bg-primary/10 hover:text-primary'
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-200',
        isTransparent
          ? 'bg-transparent [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]'
          : 'border-b border-border/60 bg-white/80 backdrop-blur-lg'
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t('skipToContent')}
      </a>
      <nav
        aria-label={t('mainNavigation')}
        className="mx-auto flex items-center justify-between gap-4 px-6 py-3 text-sm"
      >
        {/* Left side */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="transition-opacity hover:opacity-80">
            <span
              className={cn(
                'font-lora-brand text-xl italic tracking-tight transition-colors duration-200',
                isTransparent ? 'text-white' : 'text-primary'
              )}
            >
              LocalNomad
            </span>
          </Link>

          {/* Country dropdown */}
          <CountryDropdown
            selectedCountry={selectedCountry}
            onCountryChange={handleCountryChange}
            isTransparent={isTransparent}
          />

          {/* Visas */}
          <Link href={country.visaPath as Parameters<typeof Link>[0]['href']} className={navLinkClass}>
            {t('visas')}
          </Link>

          {/* Neighborhoods */}
          {country.neighborhoodPath ? (
            <Link
              href={country.neighborhoodPath as Parameters<typeof Link>[0]['href']}
              className={navLinkClass}
            >
              {t('neighborhoods')}
            </Link>
          ) : (
            <span
              className={cn(navLinkClass, 'opacity-40 cursor-not-allowed pointer-events-none')}
              aria-disabled="true"
            >
              {t('neighborhoods')}
            </span>
          )}

          {/* Blog */}
          <Link href="/blog" className={navLinkClass}>
            {t('blog')}
          </Link>

          {/* Checklist */}
          {country.checklistPath ? (
            <Link
              href={country.checklistPath as Parameters<typeof Link>[0]['href']}
              className={navLinkClass}
            >
              {t('checklist')}
            </Link>
          ) : (
            <span
              className={cn(navLinkClass, 'opacity-40 cursor-not-allowed pointer-events-none')}
              aria-disabled="true"
            >
              {t('checklist')}
            </span>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Discord — icon on desktop */}
          <a
            href="https://discord.gg/uc2eNKVF3V"
            target="_blank"
            rel="noopener noreferrer"
            className={discordClass}
            aria-label="Discord"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
          </a>

          <span className={cn(isTransparent && '[&_button]:text-white/90 [&_button:hover]:text-white [&_svg]:text-white/90')}>
            <LocaleSwitcher />
          </span>
          <MobileMenu
            selectedCountry={selectedCountry}
            onCountryChange={handleCountryChange}
            isTransparent={isTransparent}
          />
        </div>
      </nav>
    </header>
  );
};
