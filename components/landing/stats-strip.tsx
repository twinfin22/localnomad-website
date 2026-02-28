import { useTranslations } from 'next-intl';
import { ScrollReveal } from './scroll-reveal';

export const StatsStrip = () => {
  const t = useTranslations('Landing');

  const stats = [t('statVisas'), t('statCountries'), t('statFree')];

  return (
    <section className="bg-primary px-6 py-12">
      <ScrollReveal>
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 text-center sm:flex-row sm:gap-16">
          {stats.map((stat, i) => (
            <p key={i} className="text-xl font-bold tabular-nums text-white sm:text-2xl">
              {stat}
            </p>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
};
