import { useTranslations } from 'next-intl';
import { CountryCard } from './country-card';

export const Hero = () => {
  const t = useTranslations('Landing');

  return (
    <section
      className="hero-grain hero-gradient-animate relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-8 sm:py-16"
      style={{
        background:
          'linear-gradient(135deg, var(--primary-dark), var(--primary), var(--primary-light))',
      }}
    >
      {/* Floating compass motif */}
      <svg
        className="hero-compass pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
        width="600"
        height="600"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="70" stroke="white" strokeWidth="0.3" />
        <path d="M100 10 L103 95 L100 100 L97 95 Z" fill="white" opacity="0.8" />
        <path d="M100 190 L103 105 L100 100 L97 105 Z" fill="white" opacity="0.4" />
        <path d="M10 100 L95 97 L100 100 L95 103 Z" fill="white" opacity="0.4" />
        <path d="M190 100 L105 97 L100 100 L105 103 Z" fill="white" opacity="0.8" />
        {/* Cardinal ticks */}
        <line x1="100" y1="10" x2="100" y2="20" stroke="white" strokeWidth="0.5" />
        <line x1="100" y1="180" x2="100" y2="190" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="100" x2="20" y2="100" stroke="white" strokeWidth="0.5" />
        <line x1="180" y1="100" x2="190" y2="100" stroke="white" strokeWidth="0.5" />
      </svg>

      {/* Large radial glow behind headline */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        }}
      />
      {/* Smaller warm glow below cards */}
      <div
        className="pointer-events-none absolute left-1/2 top-2/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,240,220,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-[2] mx-auto w-full max-w-4xl text-center">
        {/* Decorative accent line */}
        <div
          className="animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto mb-6 h-px w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{ animationFillMode: 'backwards' }}
        />
        <h1
          className="animate-in fade-in slide-in-from-bottom-4 duration-700 font-lora text-4xl font-bold leading-tight text-wrap-balance bg-gradient-to-b from-white to-white/90 bg-clip-text text-transparent sm:text-5xl md:text-6xl"
          style={{ animationFillMode: 'backwards' }}
        >
          {t('headline')}
        </h1>
        <p
          className="animate-in fade-in slide-in-from-bottom-3 duration-700 mt-4 text-lg tracking-wide text-white/75 sm:text-xl"
          style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
        >
          {t('subtitle')}
        </p>

        <div
          className="animate-in fade-in zoom-in-95 duration-500 mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*:last-child:nth-child(odd)]:sm:col-span-2 [&>*:last-child:nth-child(odd)]:lg:col-span-1 [&>*:last-child:nth-child(odd)]:lg:col-start-2"
          style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}
        >
          <CountryCard
            href="/korea"
            emoji={t('countryKoreaEmoji')}
            name={t('countryKorea')}
            description={t('countryKoreaDesc')}
          />
          <CountryCard
            href="/japan"
            emoji={t('countryJapanEmoji')}
            name={t('countryJapan')}
            description={t('countryJapanDesc')}
          />
          <CountryCard
            href="/taiwan"
            emoji={t('countryTaiwanEmoji')}
            name={t('countryTaiwan')}
            description={t('countryTaiwanDesc')}
          />
          <CountryCard
            href="/southeast-asia"
            emoji={t('countrySEAEmoji')}
            name={t('countrySEA')}
            description={t('countrySEADesc')}
          />
        </div>
      </div>

      {/* Scroll indicator — animated extending line */}
      <div className="absolute bottom-20 left-1/2 z-[2] -translate-x-1/2 hidden sm:flex flex-col items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
          Scroll
        </span>
        <div className="hero-scroll-line h-8 w-px bg-white/40" />
      </div>

      <p className="absolute bottom-8 left-0 right-0 z-[2] text-center text-sm text-white/40">
        {t('legalNote')}
      </p>

      {/* Gradient fade to white */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-1 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
};
