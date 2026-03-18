import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ScrollReveal } from './scroll-reveal';

interface SelectorCardProps {
  href: string;
  emoji: string;
  name: string;
  description: string;
  delay: number;
}

const SelectorCard = ({ href, emoji, name, description, delay }: SelectorCardProps) => (
  <ScrollReveal delay={delay}>
    <Link
      href={href}
      className="group flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary/10">
          <span className="text-2xl" role="img" aria-label={name}>
            {emoji}
          </span>
        </div>
        <svg
          className="h-4 w-4 text-gray-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div>
        <span className="text-base font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
          {name}
        </span>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  </ScrollReveal>
);

export const CountrySelector = async () => {
  const t = await getTranslations('Landing');

  const countries = [
    {
      href: '/korea',
      emoji: t('countryKoreaEmoji'),
      name: t('countryKorea'),
      description: t('countryKoreaDesc'),
    },
    {
      href: '/japan',
      emoji: t('countryJapanEmoji'),
      name: t('countryJapan'),
      description: t('countryJapanDesc'),
    },
    {
      href: '/taiwan',
      emoji: t('countryTaiwanEmoji'),
      name: t('countryTaiwan'),
      description: t('countryTaiwanDesc'),
    },
    {
      href: '/southeast-asia',
      emoji: t('countrySEAEmoji'),
      name: t('countrySEA'),
      description: t('countrySEADesc'),
    },
  ];

  return (
    <section className="bg-neutral-50 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="mb-10 text-center">
            <h2 className="font-lora text-2xl font-bold text-foreground sm:text-3xl">
              {t('countrySectionTitle')}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t('countrySectionSubtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {countries.map((country, i) => (
            <SelectorCard
              key={country.href}
              href={country.href}
              emoji={country.emoji}
              name={country.name}
              description={country.description}
              delay={i * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
