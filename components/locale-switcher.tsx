'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { routing } from '@/i18n/routing';

const localeLabels: Record<string, string> = {
  en: 'EN',
  ja: 'JA',
  'zh-cn': '简中',
};

const localeFullLabels: Record<string, string> = {
  en: 'English',
  ja: '日本語',
  'zh-cn': '简体中文',
};

export const LocaleSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

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
        // Focus first menu item after dropdown opens
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={handleTriggerKeyDown}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
        aria-label="Switch language"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="hidden md:inline">{localeLabels[locale]}</span>
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
          className={cn('hidden md:block transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-md border bg-white py-1 shadow-md"
        >
          {routing.locales.map((loc, index) => (
            <Link
              key={loc}
              ref={(el) => {
                menuItemRefs.current[index] = el;
              }}
              href={pathname}
              locale={loc}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                'block px-3 py-1.5 text-sm transition-colors',
                loc === locale
                  ? 'bg-primary/5 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {localeFullLabels[loc]}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
