import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ScrollReveal } from './scroll-reveal';

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

export const ClosingCta = async () => {
  const t = await getTranslations('Landing');

  const countries = [
    { key: 'korea', href: '/korea/checklist', name: t('countryKorea') },
    { key: 'japan', href: '/japan/checklist', name: t('countryJapan') },
    { key: 'taiwan', href: '/taiwan/checklist', name: t('countryTaiwan') },
  ];

  return (
    <section className="bg-white px-4 py-16 sm:py-24">
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

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {countries.map((country, i) => {
            const itemKeys = CHECKLIST_ITEMS_KEYS[country.key as keyof typeof CHECKLIST_ITEMS_KEYS];
            const config = COUNTRY_CONFIG[country.key];

            return (
              <ScrollReveal key={country.key} delay={i * 100}>
                <Link
                  href={country.href}
                  className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                >
                  {/* Country image header */}
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src={config?.image}
                      alt={country.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ objectPosition: config?.objectPosition }}
                      loading="lazy"
                      width={400}
                      height={160}
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
                            className="mt-0.5 h-4 w-4 shrink-0 text-primary/60"
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

                    {/* CTA */}
                    <div className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-medium text-primary transition-all duration-300 group-hover:translate-x-0.5">
                      <span>{t('closingGetChecklist')}</span>
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
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
