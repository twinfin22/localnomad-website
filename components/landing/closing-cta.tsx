import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ScrollReveal } from './scroll-reveal';

export const ClosingCta = async () => {
  const t = await getTranslations('Landing');

  const countries = [
    { href: '/korea', emoji: t('countryKoreaEmoji'), name: t('countryKorea') },
    { href: '/japan', emoji: t('countryJapanEmoji'), name: t('countryJapan') },
    { href: '/taiwan', emoji: t('countryTaiwanEmoji'), name: t('countryTaiwan') },
    { href: '/southeast-asia', emoji: t('countrySEAEmoji'), name: t('countrySEA') },
  ];

  return (
    <section className="bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <ScrollReveal>
          <h2 className="font-lora text-2xl font-bold text-foreground sm:text-3xl">
            {t('newCtaTitle')}
          </h2>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {countries.map((country) => (
              <Link
                key={country.href}
                href={country.href}
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm transition-all duration-200 hover:border-primary/40 hover:bg-primary hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              >
                <span role="img" aria-hidden="true">{country.emoji}</span>
                {country.name}
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
