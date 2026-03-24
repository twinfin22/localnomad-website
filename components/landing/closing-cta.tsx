import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ScrollReveal } from './scroll-reveal';
import { getChecklistData } from '@/lib/checklist-data';

const CHECKLIST_ITEMS_KEYS = {
  korea: ['closingKoreaItem1', 'closingKoreaItem2', 'closingKoreaItem3'] as const,
  japan: ['closingJapanItem1', 'closingJapanItem2', 'closingJapanItem3'] as const,
  taiwan: ['closingTaiwanItem1', 'closingTaiwanItem2', 'closingTaiwanItem3'] as const,
};

const COUNTRY_CONFIG: Record<string, { image: string; objectPosition: string }> = {
  korea: { image: '/images/checklist/korea-checklist-bg.jpg', objectPosition: 'center 20%' },
  japan: { image: '/images/visa/japan-visa-bg.jpg', objectPosition: 'center 20%' },
  taiwan: { image: '/images/visa/taiwan-visa-bg.jpg', objectPosition: 'center 40%' },
};

const PREVIEW_COUNT = 3;

export const ClosingCta = async () => {
  const t = await getTranslations('Landing');

  const countries = [
    { key: 'korea', href: '/korea/checklist', name: t('countryKorea') },
    { key: 'japan', href: '/japan/checklist', name: t('countryJapan') },
    { key: 'taiwan', href: '/taiwan/checklist', name: t('countryTaiwan') },
  ];

  // Load checklist data in parallel to get total item counts
  const checklistCounts = await Promise.all(
    countries.map(async (c) => {
      const data = await getChecklistData(c.key);
      if (!data) return 0;
      return data.phases.reduce((sum, phase) => sum + phase.items.length, 0);
    })
  );

  return (
    <section className="bg-neutral-50 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="font-lora text-3xl font-bold text-primary sm:text-4xl">
              {t('closingTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              {t('closingSubtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {countries.map((country, i) => {
            const itemKeys = CHECKLIST_ITEMS_KEYS[country.key as keyof typeof CHECKLIST_ITEMS_KEYS];
            const config = COUNTRY_CONFIG[country.key];
            const totalItems = checklistCounts[i];
            const progressPercent = totalItems > 0 ? (PREVIEW_COUNT / totalItems) * 100 : 0;

            return (
              <ScrollReveal key={country.key} delay={i * 100}>
                <Link
                  href={country.href}
                  className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                >
                  {/* Country image header */}
                  <div className="relative h-28 w-full overflow-hidden">
                    <Image
                      src={config?.image ?? ''}
                      alt={country.name}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ objectPosition: config?.objectPosition }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/5" />
                    <h3
                      className="absolute bottom-3 left-4 font-lora text-4xl font-bold text-white"
                      style={{
                        textShadow: '0 1px 3px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      {country.name}
                    </h3>
                  </div>

                  {/* Checklist peek */}
                  <div className="flex flex-1 flex-col p-5">
                    <ul className="flex flex-col gap-2.5">
                      {itemKeys.map((key) => (
                        <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <svg
                            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{t(key)}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Progress teaser */}
                    {totalItems > 0 && (
                      <div className="mt-4 space-y-1.5">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                          <div
                            className="h-full rounded-full bg-primary/40 transition-all duration-500 group-hover:bg-primary/60"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground/70">
                          {t('closingItemCount', { total: totalItems })}
                        </p>
                      </div>
                    )}

                    {/* CTA pill */}
                    <div className="mt-auto pt-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors duration-300 group-hover:bg-primary/20">
                        <span>{t('closingGetChecklist')}</span>
                        <svg
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
