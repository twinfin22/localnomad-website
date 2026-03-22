import { Link } from '@/i18n/navigation';
import { COUNTRY_HERO_CONFIG } from '@/lib/country-page-data';

// Server component — no "use client"

interface CountryHeroProps {
  country: string;
  displayName: string;
  visaCount: number;
  neighborhoodCount: number;
  hasChecklist: boolean;
  locale: string;
}

export function CountryHero({
  country,
  displayName,
  visaCount,
  neighborhoodCount,
  hasChecklist,
}: CountryHeroProps) {
  const config = COUNTRY_HERO_CONFIG[country] ?? {
    image: '/images/hero-bg.webp',
    position: 'center 20%',
  };

  return (
    <>
      {/* Preload hero image for LCP performance */}
      <link rel="preload" as="image" href={config.image} />

      <section
        className="relative -mt-[70px] flex h-[45vh] min-h-[360px] flex-col items-center justify-center overflow-hidden px-6 pt-[70px] md:h-[55vh] md:min-h-[400px]"
        style={{
          backgroundImage: [
            'linear-gradient(135deg, rgba(27,73,101,0.45) 0%, rgba(20,55,78,0.50) 100%)',
            `url('${config.image}')`,
          ].join(', '),
          backgroundSize: 'cover',
          backgroundPosition: config.position,
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'var(--primary)',
        }}
      >
        <div
          className="relative z-[2] mx-auto w-full max-w-3xl text-center"
          style={{
            textShadow:
              '0 2px 4px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          {/* Breadcrumb */}
          <p className="mb-3 text-xs text-white/70">
            <Link href="/" className="hover:text-white/90 transition-colors">
              {/* Home */}
              Home
            </Link>
            {' › '}
            <span>{displayName}</span>
          </p>

          {/* H1 */}
          <h1 className="font-lora text-3xl font-bold leading-tight text-white text-wrap-balance md:text-4xl lg:text-5xl">
            {displayName} Visa Guide
          </h1>

          {/* Stat pills */}
          <p className="mt-3 text-sm text-white/70" style={{ textShadow: 'none' }}>
            {visaCount > 0 && (
              <span>{visaCount} visas</span>
            )}
            {visaCount > 0 && neighborhoodCount > 0 && (
              <span className="mx-2">·</span>
            )}
            {neighborhoodCount > 0 && (
              <span>{neighborhoodCount} neighborhoods</span>
            )}
            {hasChecklist && (visaCount > 0 || neighborhoodCount > 0) && (
              <span className="mx-2">·</span>
            )}
            {hasChecklist && (
              <span>Checklist ready</span>
            )}
          </p>

          {/* Quick action pills */}
          <div
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
            style={{ textShadow: 'none' }}
          >
            {visaCount > 1 && (
              <Link
                href={`/${country}/compare`}
                className="rounded-full border border-white/40 px-3 py-1.5 text-xs text-white transition-all hover:bg-white/10"
              >
                {/* Compare */}
                Compare
              </Link>
            )}
            {hasChecklist && (
              <Link
                href={`/${country}/checklist`}
                className="rounded-full border border-white/40 px-3 py-1.5 text-xs text-white transition-all hover:bg-white/10"
              >
                {/* Checklist */}
                Checklist
              </Link>
            )}
            {country === 'korea' && (
              <Link
                href={`/${country}/visa/change`}
                className="rounded-full border border-white/40 px-3 py-1.5 text-xs text-white transition-all hover:bg-white/10"
              >
                {/* Visa Path */}
                Visa Path
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
