import { useTranslations } from 'next-intl';
import { CountryCard } from './country-card';

export const Hero = () => {
  const t = useTranslations('Landing');

  return (
    <section className="flex min-h-svh flex-col items-center justify-center bg-primary px-6 py-16">
      <div className="mx-auto w-full max-w-2xl text-center">
        <h1 className="font-lora text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
          {t('headline')}
        </h1>
        <p className="mt-4 text-lg text-white/70 sm:text-xl">
          {t('subtitle')}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <CountryCard
            href="/korea"
            emoji={t('countryKoreaEmoji')}
            name={t('countryKorea')}
          />
          <CountryCard
            href="/taiwan"
            emoji={t('countryTaiwanEmoji')}
            name={t('countryTaiwan')}
          />
        </div>
      </div>
    </section>
  );
};
