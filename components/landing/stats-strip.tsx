import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { ScrollReveal } from './scroll-reveal';

export const StatsStrip = () => {
  const t = useTranslations('Landing');

  const stats = [
    { count: t('statVisasCount'), label: t('statVisasLabel') },
    { count: t('statCountriesCount'), label: t('statCountriesLabel') },
    { count: t('statFreeCount'), label: t('statFreeLabel') },
  ];

  return (
    <section
      className="px-6 py-16"
      style={{
        background: 'linear-gradient(to right, #163d55, var(--primary), #163d55)',
      }}
    >
      <ScrollReveal>
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 text-center sm:flex-row sm:gap-16">
          {stats.map((stat, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <div className="hidden h-12 w-px bg-white/20 sm:block" aria-hidden="true" />
              )}
              <div className="flex flex-col items-center gap-1">
                <span className="font-lora text-4xl font-bold text-white sm:text-5xl">
                  {stat.count}
                </span>
                <span className="text-sm uppercase tracking-widest text-white/60">
                  {stat.label}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
};
