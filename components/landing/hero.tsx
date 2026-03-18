import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export const Hero = () => {
  const t = useTranslations('Landing');

  return (
    <>
      {/* Preload hero image for LCP performance */}
      <link rel="preload" as="image" type="image/webp" href="/images/hero-bg.webp" />

      <section
        className="hero-grain relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-20"
        style={{
          backgroundImage: [
            'linear-gradient(135deg, rgba(27,73,101,0.65) 0%, rgba(20,55,78,0.70) 100%)',
            "url('/images/hero-bg.webp')",
          ].join(', '),
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          // Fallback: teal gradient shows if image fails — no blank screen
          backgroundColor: 'var(--primary)',
        }}
      >
        <div className="relative z-[2] mx-auto w-full max-w-3xl text-center">
          <h1 className="font-lora text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl text-wrap-balance">
            {t('headline')}
          </h1>
          <p className="mt-5 text-lg text-white/75 sm:text-xl max-w-2xl mx-auto text-wrap-balance">
            {t('subtitle')}
          </p>
          <div className="mt-10">
            <Link
              href="/korea"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-primary shadow-lg transition-all duration-200 hover:bg-white/90 hover:shadow-xl hover:-translate-y-0.5"
            >
              {t('exploreVisas')}
            </Link>
          </div>
        </div>

        <p className="absolute bottom-8 left-0 right-0 z-[2] text-center text-sm text-white/40">
          {t('legalNote')}
        </p>

        {/* Gradient fade into next section */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-16 bg-gradient-to-b from-transparent to-white" />
      </section>
    </>
  );
};
