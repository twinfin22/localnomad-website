'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { COUNTRIES } from './country-dropdown';
import type { CountryKey } from './country-dropdown';

interface MobileMenuProps {
  selectedCountry: CountryKey;
  onCountryChange: (key: CountryKey) => void;
  isTransparent?: boolean;
}

const localeFullLabels: Record<string, string> = {
  en: 'English',
  ja: '日本語',
  'zh-cn': '简体中文',
};

// Chevron right icon
const ChevronRight = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="text-white/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/60"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const MobileMenu = ({ selectedCountry, onCountryChange, isTransparent = false }: MobileMenuProps) => {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const selected = COUNTRIES.find((c) => c.key === selectedCountry) ?? COUNTRIES[0];

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Focus close button on open
  useEffect(() => {
    if (open) requestAnimationFrame(() => closeRef.current?.focus());
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleLinkClick = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => hamburgerRef.current?.focus());
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  const hamburgerClass = isTransparent
    ? 'md:hidden flex items-center justify-center rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-white/50 focus-visible:ring-[3px] outline-none'
    : 'md:hidden flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none';

  // Nav items config
  const countryName = t(selected.nameKey as Parameters<typeof t>[0]);
  const navItems = [
    {
      key: 'visas',
      label: t('visas'),
      subtitle: countryName,
      href: selected.visaPath,
      enabled: true,
    },
    {
      key: 'neighborhoods',
      label: t('neighborhoods'),
      subtitle: countryName,
      href: selected.neighborhoodPath,
      enabled: !!selected.neighborhoodPath,
    },
    {
      key: 'blog',
      label: t('blog'),
      subtitle: 'Guides & tips',
      href: '/blog',
      enabled: true,
    },
    {
      key: 'checklist',
      label: t('checklist'),
      subtitle: '72-hour survival kit',
      href: selected.checklistPath,
      enabled: !!selected.checklistPath,
    },
  ];

  return (
    <>
      {/* Hamburger */}
      <button
        ref={hamburgerRef}
        onClick={() => setOpen(true)}
        className={hamburgerClass}
        aria-label={t('openMenu')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      {/* Full-screen overlay — portaled to body to escape header stacking context */}
      {open && createPortal(
        <div className="fixed inset-0 z-50 bg-[#1B4965] animate-in fade-in duration-200">
          <div className="flex flex-col h-full overflow-y-auto px-6 py-6">
            {/* Top bar: logo + close */}
            <div className="flex items-center justify-between">
              <Image
                src="/logo_new_all-blue.png"
                alt="LocalNomad"
                width={120}
                height={17}
                className="brightness-0 invert opacity-80"
              />
              <button
                ref={closeRef}
                onClick={handleClose}
                className="flex items-center justify-center rounded-md p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-white/50 focus-visible:ring-[3px] outline-none"
                aria-label={t('closeMenu')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Country selector */}
            <div className="mt-7">
              <div className="text-[11px] font-medium uppercase tracking-widest text-white/40 mb-3">
                {t('moreCountries')}
              </div>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.key}
                    onClick={() => onCountryChange(country.key)}
                    className={
                      country.key === selectedCountry
                        ? 'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium bg-white text-[#1B4965] transition-colors'
                        : 'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium border border-white/25 text-white/60 transition-colors hover:border-white/50 hover:text-white/90'
                    }
                  >
                    <span aria-hidden="true">{country.emoji}</span>
                    {t(country.nameKey as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation cards */}
            <nav className="mt-6 flex flex-col gap-2.5">
              {navItems.map((item) => {
                if (!item.enabled) {
                  return (
                    <div
                      key={item.key}
                      className="rounded-xl bg-white/5 px-5 py-4 flex items-center justify-between opacity-40 cursor-not-allowed"
                    >
                      <div>
                        <div className="font-lora italic text-xl text-white/50">
                          {item.label}
                        </div>
                        <div className="text-xs text-white/25 mt-0.5">Coming soon</div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.key}
                    href={item.href as Parameters<typeof Link>[0]['href']}
                    onClick={handleLinkClick}
                    className="group rounded-xl px-5 py-4 flex items-center justify-between transition-all duration-200 bg-white/[0.07] hover:bg-white/[0.12] active:bg-white/[0.16]"
                  >
                    <div>
                      <div className="font-lora italic text-xl text-white/85">
                        {item.label}
                      </div>
                      <div className="text-xs mt-0.5 text-white/35">
                        {item.subtitle}
                      </div>
                    </div>
                    <ChevronRight />
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="mt-auto pt-6 pb-2 flex flex-col gap-4">
              {/* Language switcher */}
              <div className="flex items-center gap-2">
                {routing.locales.map((loc) => (
                  <Link
                    key={loc}
                    href={pathname}
                    locale={loc}
                    onClick={handleLinkClick}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      loc === locale
                        ? 'bg-white/15 text-white'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {localeFullLabels[loc]}
                  </Link>
                ))}
              </div>

              {/* Discord + tagline */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <a
                  href="https://discord.gg/uc2eNKVF3V"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                  Discord
                </a>
                <span className="text-[11px] text-white/20 font-lora italic">Soft Land in Asia</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
