import { useTranslations } from 'next-intl';
import { CountryCard } from './country-card';

export const Hero = () => {
  const t = useTranslations('Landing');

  return (
    <section
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-8 sm:py-16"
      style={{
        background:
          'linear-gradient(135deg, var(--primary-dark), var(--primary), var(--primary-light))',
      }}
    >
      {/* Radial glow behind headline */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-2xl text-center">
        <h1
          className="animate-in fade-in slide-in-from-bottom-4 duration-700 font-lora text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
          style={{ animationFillMode: 'backwards' }}
        >
          {t('headline')}
        </h1>
        <p
          className="animate-in fade-in slide-in-from-bottom-3 duration-700 mt-4 text-lg text-white/70 sm:text-xl"
          style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
        >
          {t('subtitle')}
        </p>

        <div
          className="animate-in fade-in zoom-in-95 duration-500 mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
          style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}
        >
          <CountryCard
            href="/korea"
            emoji={t('countryKoreaEmoji')}
            name={t('countryKorea')}
            description={t('countryKoreaDesc')}
          />
          <CountryCard
            href="/taiwan"
            emoji={t('countryTaiwanEmoji')}
            name={t('countryTaiwan')}
            description={t('countryTaiwanDesc')}
          />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce-subtle">
        <svg
          className="h-6 w-6 text-white/40"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <p className="absolute bottom-8 left-0 right-0 text-center text-sm text-white/40">
        {t('legalNote')}
      </p>
    </section>
  );
};
