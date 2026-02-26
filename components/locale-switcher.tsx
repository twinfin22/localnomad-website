'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { routing } from '@/i18n/routing';

const localeLabels: Record<string, string> = {
  en: 'English',
  ja: '日本語',
  'zh-tw': '繁體中文',
  vi: 'Tiếng Việt',
};

export const LocaleSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-sm">
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && (
            <span className="text-muted-foreground/50" aria-hidden="true">
              |
            </span>
          )}
          <Link
            href={pathname}
            locale={loc}
            className={cn(
              'transition-colors',
              loc === locale
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {localeLabels[loc]}
          </Link>
        </span>
      ))}
    </div>
  );
};
