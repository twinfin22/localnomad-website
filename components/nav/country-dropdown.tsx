'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type CountryKey = 'korea' | 'japan' | 'taiwan' | 'sea';

export type CountryConfig = {
  key: CountryKey;
  emoji: string;
  nameKey: string;
  visaPath: string;
  neighborhoodPath?: string;
  guidePath?: string;
};

export const COUNTRIES: CountryConfig[] = [
  {
    key: 'japan',
    emoji: '\u{1F1EF}\u{1F1F5}',
    nameKey: 'countryJapan',
    visaPath: '/japan',
    neighborhoodPath: '/neighborhood/japan',
    guidePath: '/blog/guides/japan-ultimate-digital-nomad-guide',
  },
  {
    key: 'korea',
    emoji: '\u{1F1F0}\u{1F1F7}',
    nameKey: 'countryKorea',
    visaPath: '/korea',
    neighborhoodPath: '/neighborhood/korea',
    guidePath: '/blog/guides/korea-ultimate-digital-nomad-guide',
  },
  {
    key: 'taiwan',
    emoji: '\u{1F1F9}\u{1F1FC}',
    nameKey: 'countryTaiwan',
    visaPath: '/taiwan',
    neighborhoodPath: '/neighborhood/taiwan',
    guidePath: '/blog/guides/taiwan-ultimate-digital-nomad-guide',
  },
  {
    key: 'sea',
    emoji: '\u{1F30F}',
    nameKey: 'countrySEA',
    visaPath: '/southeast-asia',
    neighborhoodPath: undefined,
    guidePath: undefined,
  },
];

interface CountryDropdownProps {
  selectedCountry: CountryKey;
  onCountryChange: (key: CountryKey) => void;
  isTransparent?: boolean;
}

export const CountryDropdown = ({
  selectedCountry,
  onCountryChange,
  isTransparent = false,
}: CountryDropdownProps) => {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selected = COUNTRIES.find((c) => c.key === selectedCountry) ?? COUNTRIES[0];
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

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = menuItemRefs.current.filter(Boolean) as HTMLButtonElement[];
    const currentIndex = items.findIndex((item) => item === document.activeElement);
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        items[currentIndex < items.length - 1 ? currentIndex + 1 : 0]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        items[currentIndex > 0 ? currentIndex - 1 : items.length - 1]?.focus();
        break;
    }
  }, []);

  const triggerClass = cn(
    'flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none',
    isTransparent
      ? 'text-white/90 hover:bg-white/10 hover:text-white'
      : 'text-foreground/80 hover:bg-muted hover:text-foreground'
  );

  return (
    <div ref={ref} className="relative hidden md:flex">
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={handleTriggerKeyDown}
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${t(selected.nameKey as Parameters<typeof t>[0])} — ${t('moreCountries')}`}
      >
        <span aria-hidden="true">{selected.emoji}</span>
        <span className="hidden lg:inline">{t(selected.nameKey as Parameters<typeof t>[0])}</span>
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
          className={cn('transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('moreCountries')}
          onKeyDown={handleMenuKeyDown}
          className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-md border bg-white py-1 shadow-md"
        >
          <div className="px-3 py-1 text-xs text-muted-foreground">{t('moreCountries')}</div>
          {otherCountries.map((country, index) => (
            <button
              key={country.key}
              ref={(el) => {
                menuItemRefs.current[index] = el;
              }}
              role="option"
              aria-selected={false}
              onClick={() => {
                onCountryChange(country.key);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span aria-hidden="true">{country.emoji}</span>
              {t(country.nameKey as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
