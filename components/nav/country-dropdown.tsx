'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export const COUNTRIES = [
  {
    key: 'korea',
    emoji: '\u{1F1F0}\u{1F1F7}',
    nameKey: 'countryKorea',
    visaPath: '/korea/visa',
    neighborhoodPath: '/neighborhood/korea',
    guidePath: '/blog/guides/korea-ultimate-digital-nomad-guide',
  },
  {
    key: 'japan',
    emoji: '\u{1F1EF}\u{1F1F5}',
    nameKey: 'countryJapan',
    visaPath: '/japan/visa',
    neighborhoodPath: '/neighborhood/japan',
    guidePath: '/blog/guides/japan-ultimate-digital-nomad-guide',
  },
  {
    key: 'taiwan',
    emoji: '\u{1F1F9}\u{1F1FC}',
    nameKey: 'countryTaiwan',
    visaPath: '/taiwan/visa',
    neighborhoodPath: '/neighborhood/taiwan',
    guidePath: '/blog/guides/taiwan-ultimate-digital-nomad-guide',
  },
] as const;

type CountryKey = (typeof COUNTRIES)[number]['key'];

export const CountryDropdown = () => {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryKey>('korea');
  const ref = useRef<HTMLDivElement>(null);
  const menuItemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  const selected = COUNTRIES.find((c) => c.key === selectedCountry)!;
  const otherCountries = COUNTRIES.filter((c) => c.key !== selectedCountry);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === 'ArrowDown' && !open) {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => {
          menuItemRefs.current[0]?.focus();
        });
      }
    },
    [open]
  );

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const items = menuItemRefs.current.filter(Boolean);
      const currentIndex = items.findIndex(
        (item) => item === document.activeElement
      );

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < items.length - 1) {
            items[currentIndex + 1]?.focus();
          } else {
            items[0]?.focus();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            items[currentIndex - 1]?.focus();
          } else {
            items[items.length - 1]?.focus();
          }
          break;
      }
    },
    []
  );

  return (
    <div ref={ref} className="relative hidden md:flex">
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={handleTriggerKeyDown}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span aria-hidden="true">{selected.emoji}</span>
        {t(selected.nameKey)}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          onKeyDown={handleMenuKeyDown}
          className="absolute left-0 top-full z-50 mt-1 min-w-[260px] rounded-md border bg-white py-1 shadow-md"
        >
          {/* Selected country header */}
          <div className="px-3 py-2 text-sm font-medium text-foreground">
            <span aria-hidden="true">{selected.emoji}</span>{' '}
            {t(selected.nameKey)}
          </div>

          {/* Country links */}
          <Link
            ref={(el) => {
              menuItemRefs.current[0] = el;
            }}
            href={selected.visaPath}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t('visaInfo')}
          </Link>
          <Link
            ref={(el) => {
              menuItemRefs.current[1] = el;
            }}
            href={selected.neighborhoodPath}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t('neighborhoods')}
          </Link>
          <Link
            ref={(el) => {
              menuItemRefs.current[2] = el;
            }}
            href={selected.guidePath}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t('guide')}
          </Link>

          {/* Separator */}
          <div className="border-t border-border/60 my-2" />

          {/* Other countries */}
          <div className="px-3 py-1 text-xs text-muted-foreground">
            {t('moreCountries')}
          </div>
          <div className="flex gap-1 px-3 py-1.5">
            {otherCountries.map((country, index) => (
              <button
                key={country.key}
                ref={(el) => {
                  menuItemRefs.current[3 + index] = el;
                }}
                role="menuitem"
                onClick={() => {
                  setSelectedCountry(country.key);
                }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span aria-hidden="true">{country.emoji}</span>
                {t(country.nameKey)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
