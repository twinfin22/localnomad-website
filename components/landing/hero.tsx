import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export const Hero = () => {
  const t = useTranslations('Landing');

  return (
    <>
      {/* Preload hero image for LCP performance */}
      <link rel="preload" as="image" type="image/webp" href="/images/hero-bg.webp" />

      <section
        className="hero-grain relative -mt-[70px] flex h-[calc(100dvh)] flex-col items-center justify-center overflow-hidden px-6 pt-[90px] pb-20"
        style={{
          backgroundImage: [
            'linear-gradient(135deg, rgba(27,73,101,0.65) 0%, rgba(20,55,78,0.70) 100%)',
            "url('/images/hero-bg.webp')",
          ].join(', '),
          backgroundSize: 'cover',
          backgroundPosition: 'center 70%',
          backgroundRepeat: 'no-repeat',
          // Fallback: teal gradient shows if image fails — no blank screen
          backgroundColor: 'var(--primary)',
        }}
      >
        <div className="relative z-[2] mx-auto w-full max-w-3xl text-center">
          <h1 className="font-lora text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl text-wrap-balance">
            {t('headline')}
          </h1>
          <p className="mt-5 text-lg text-white/75 sm:text-xl max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <p className="mt-2 text-sm tracking-widest text-white/70 uppercase">
            {t('subtitleCountries')}
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/korea"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-primary shadow-lg transition-all duration-200 hover:bg-white/90 hover:shadow-xl hover:-translate-y-0.5"
            >
              {t('exploreVisas')}
            </Link>
            <Link
              href="/korea/checklist"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5"
            >
              {t('checklistCta')}
            </Link>
          </div>
        </div>

        <p className="absolute bottom-8 left-0 right-0 z-[2] text-center text-sm text-white/60">
          {t('legalNote')}
        </p>

      </section>
    </>
  );
};
