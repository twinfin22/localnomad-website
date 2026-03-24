import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export const Hero = () => {
  const t = useTranslations('Landing');

  return (
    <>
      <section
        className="hero-grain relative -mt-[70px] flex h-[calc(100dvh)] flex-col items-center justify-center overflow-hidden px-6 pt-[90px] pb-20"
        style={{
          // Light fallback while hero image loads — avoids dark flash on initial paint
          backgroundColor: '#f5f5f5',
        }}
      >
        <Image
          src="/images/hero-bg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="z-0 object-cover object-[center_70%]"
        />
        {/* Gradient overlay — uses ::after pseudo-element (not LCP candidate) via CSS class */}

        <div
          className="relative z-[2] mx-auto w-full max-w-3xl text-center"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          <h1 className="font-lora text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {t('headline')}
          </h1>
          <p className="mt-5 text-lg text-white/90 sm:text-xl max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <p className="mt-2 text-sm tracking-widest text-white/80 uppercase">
            {t('subtitleCountries')}
          </p>
          <div className="mt-10" style={{ textShadow: 'none' }}>
            <Link
              href="/korea"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-primary shadow-lg transition-all duration-200 hover:bg-white/90 hover:shadow-xl hover:-translate-y-0.5"
            >
              {t('exploreVisas')}
            </Link>
          </div>
        </div>

        <p
          className="absolute bottom-8 left-0 right-0 z-[2] text-center text-sm text-white/70"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          {t('legalNote')}
        </p>

      </section>
    </>
  );
};
