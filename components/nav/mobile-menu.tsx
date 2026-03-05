'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { COUNTRIES } from './country-dropdown';

export const MobileMenu = () => {
  const t = useTranslations('Nav');
  const tAuth = useTranslations('Auth');
  const [open, setOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Focus close button on open
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        closeRef.current?.focus();
      });
    }
  }, [open]);

  // Escape key handler
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
    requestAnimationFrame(() => {
      hamburgerRef.current?.focus();
    });
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  return (
    <>
      {/* Hamburger button */}
      <button
        ref={hamburgerRef}
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
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
            {/* Close button */}
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

            {/* Country sections */}
            <nav className="mt-4 flex flex-col gap-6">
              {COUNTRIES.map((country) => (
                <div key={country.key}>
                  <div className="text-base font-medium text-foreground">
                    <span aria-hidden="true">{country.emoji}</span>{' '}
                    {t(country.nameKey)}
                  </div>
                  <div className="mt-2 flex flex-col gap-1">
                    <Link
                      href={country.visaPath}
                      onClick={handleLinkClick}
                      className="pl-6 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t('visaInfo')}
                    </Link>
                    <Link
                      href={country.neighborhoodPath}
                      onClick={handleLinkClick}
                      className="pl-6 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t('neighborhoods')}
                    </Link>
                    <Link
                      href={country.guidePath}
                      onClick={handleLinkClick}
                      className="pl-6 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t('guide')}
                    </Link>
                  </div>
                </div>
              ))}

              {/* Separator */}
              <div className="border-t border-border/60" />

              {/* Blog + Dashboard */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/blog"
                  onClick={handleLinkClick}
                  className="text-base font-medium text-foreground transition-colors hover:text-foreground/80"
                >
                  {t('blog')}
                </Link>
                <Link
                  href="/dashboard"
                  onClick={handleLinkClick}
                  className="text-base font-medium text-foreground transition-colors hover:text-foreground/80"
                >
                  {tAuth('dashboard')}
                </Link>
                <a
                  href="https://discord.gg/uc2eNKVF3V"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="text-base font-medium text-foreground transition-colors hover:text-foreground/80"
                >
                  Discord
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
