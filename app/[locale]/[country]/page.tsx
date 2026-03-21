import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getAvailableVisas, getComparisonData } from '@/lib/visa-data';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { SEAComparisonTable } from '@/components/visa/sea-comparison-table';
import type { Country } from '@/lib/types/visa';
import type { SEAComparisonData } from '@/lib/types/sea';

export const revalidate = 3600;

const VALID_COUNTRIES = ['japan', 'korea', 'taiwan', 'southeast-asia'] as const;

const COUNTRY_DISPLAY: Record<string, string> = {
  korea: 'South Korea',
  taiwan: 'Taiwan',
  japan: 'Japan',
  'southeast-asia': 'Southeast Asia',
};

const CATEGORY_ICONS: Record<string, string> = {
  'digital-nomad': '💻',
  work: '💼',
  investment: '🏢',
  residence: '🏠',
  'working-holiday': '✈️',
  'gold-card': '🏆',
};

export function generateStaticParams() {
  return VALID_COUNTRIES.map((country) => ({ country }));
}

interface Props {
  params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const [t, tm] = await Promise.all([
    getTranslations({ locale, namespace: 'Country' }),
    getTranslations({ locale, namespace: 'Meta' }),
  ]);
  const displayName = COUNTRY_DISPLAY[country] ?? country;

  const title = `${t('title', { country: displayName })} | LocalNomad`;
  const description = tm('countryDescription', { country: displayName });
  const alternates = getAlternates(locale, `/${country}`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://localnomad.club/${locale}/${country}`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-default.png'],
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) {
    notFound();
  }

  const [t, tc, visas] = await Promise.all([
    getTranslations('Country'),
    getTranslations('Common'),
    getAvailableVisas(country as Country, locale),
  ]);

  const comparisonData =
    country === 'southeast-asia'
      ? ((await getComparisonData('sea-digital-nomad')) as SEAComparisonData)
      : null;

  const displayName = COUNTRY_DISPLAY[country] ?? country;

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('title', { country: displayName }),
    description: t('subtitle', { country: displayName }),
    url: `https://localnomad.club/${locale}/${country}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: visas.length,
      itemListElement: visas.map((visa, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: visa.shortName,
        description: visa.tagline,
        url: `https://localnomad.club/${locale}/${country}/visa/${visa.type}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd),
        }}
      />
      <main id="main-content" className="min-h-svh bg-neutral-50">
        {/* SEA hero section */}
        {country === 'southeast-asia' && comparisonData ? (
          <>
            <section
              className="relative overflow-hidden px-6 py-32 sm:py-40"
              style={{
                backgroundImage: [
                  'linear-gradient(135deg, rgba(27,73,101,0.45) 0%, rgba(20,55,78,0.5) 100%)',
                  "url('/images/sea-hero-bg.webp')",
                ].join(', '),
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'var(--primary)',
              }}
            >
              <div className="mx-auto max-w-4xl text-center">
                <h1
                  className="font-lora text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
                  }}
                >
                  Southeast Asia Digital Nomad Visa Guide
                </h1>
              </div>
            </section>

            <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
              <SEAComparisonTable data={comparisonData} />

              {/* CTA: explore East Asia */}
              <div className="mt-12 rounded-xl border border-primary/10 bg-primary/[0.03] p-6 text-center sm:p-8">
                <p className="font-lora text-lg font-bold text-primary">
                  Looking at East Asia instead?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Compare digital nomad visas in Japan, Korea, and Taiwan
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/japan"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-5 py-2.5 text-sm font-medium text-primary shadow-sm transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                  >
                    🇯🇵 Japan
                  </Link>
                  <Link
                    href="/korea"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-5 py-2.5 text-sm font-medium text-primary shadow-sm transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                  >
                    🇰🇷 Korea
                  </Link>
                  <Link
                    href="/taiwan"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-5 py-2.5 text-sm font-medium text-primary shadow-sm transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                  >
                    🇹🇼 Taiwan
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Original layout for KR/JP/TW */
          <div className="mx-auto max-w-3xl px-6 py-16">
            <Link
              href="/"
              className="text-sm text-primary hover:underline"
            >
              &larr; {tc('backToHome')}
            </Link>
            <h1 className="mt-6 font-lora text-4xl font-bold text-primary">
              {t('title', { country: displayName })}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('subtitle', { country: displayName })}
            </p>

            {visas.length > 0 ? (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('visaCount', { count: visas.length })}
                </p>
                <div className="mt-8 space-y-3">
                  {visas.map((visa) => (
                    <Link
                      key={visa.type}
                      href={`/${country}/visa/${visa.type}`}
                      className="flex items-center gap-4 rounded-lg border bg-white px-5 py-4 transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      <span className="text-2xl" aria-hidden="true">
                        {CATEGORY_ICONS[visa.category] ?? '📋'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-primary">
                          {visa.shortName}
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {visa.tagline}
                        </span>
                      </div>
                      <span className="text-muted-foreground" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-8 rounded-lg border bg-white p-8 text-center text-muted-foreground">
                {t('comingSoon')}
              </div>
            )}

            {visas.length > 1 && (
              <Link
                href={`/${country}/compare`}
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {t('compareVisas')}
              </Link>
            )}

            <p className="mt-10 text-xs text-muted-foreground">
              {tc('disclaimer')}
            </p>
          </div>
        )}
    </main>
    </>
  );
}
