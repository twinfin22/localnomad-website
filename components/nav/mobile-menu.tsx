'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { COUNTRIES } from './country-dropdown';
import type { CountryKey } from './country-dropdown';

interface MobileMenuProps {
  selectedCountry: CountryKey;
  onCountryChange: (key: CountryKey) => void;
  isTransparent?: boolean;
}

export const MobileMenu = ({ selectedCountry, onCountryChange, isTransparent = false }: MobileMenuProps) => {
  const t = useTranslations('Nav');
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

      {/* Full-screen overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full overflow-y-auto px-6 py-4">
            {/* Close */}
            <div className="flex justify-end">
              <button
                ref={closeRef}
                onClick={handleClose}
                className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                aria-label={t('closeMenu')}
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
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <nav className="mt-4 flex flex-col gap-6">
              {/* Country selector */}
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  {t('moreCountries')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.key}
                      onClick={() => {
                        onCountryChange(country.key);
                        // Don't close menu — user might want to tap Visas next
                      }}
                      className={
                        country.key === selectedCountry
                          ? 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium bg-primary text-white'
                          : 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium bg-muted text-foreground/80'
                      }
                    >
                      <span aria-hidden="true">{country.emoji}</span>
                      {t(country.nameKey as Parameters<typeof t>[0])}
                    </button>
                  ))}
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-border/60" />

              {/* Visas */}
              <Link
                href={selected.visaPath as Parameters<typeof Link>[0]['href']}
                onClick={handleLinkClick}
                className="text-base font-medium text-foreground transition-colors hover:text-foreground/80"
              >
                {t('visas')}
              </Link>

              {/* Neighborhoods */}
              {selected.neighborhoodPath ? (
                <Link
                  href={selected.neighborhoodPath as Parameters<typeof Link>[0]['href']}
                  onClick={handleLinkClick}
                  className="text-base font-medium text-foreground transition-colors hover:text-foreground/80"
                >
                  {t('neighborhoods')}
                </Link>
              ) : (
                <span className="text-base font-medium text-muted-foreground/50 cursor-not-allowed">
                  {t('neighborhoods')}
                </span>
              )}

              {/* Blog */}
              <Link
                href="/blog"
                onClick={handleLinkClick}
                className="text-base font-medium text-foreground transition-colors hover:text-foreground/80"
              >
                {t('blog')}
              </Link>

              {/* Discord */}
              <a
                href="https://discord.gg/uc2eNKVF3V"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="text-base font-medium text-foreground transition-colors hover:text-foreground/80"
              >
                Discord
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
