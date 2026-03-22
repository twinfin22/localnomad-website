import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Scale, ArrowRightLeft, ClipboardCheck } from 'lucide-react';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getAvailableVisas, getComparisonData } from '@/lib/visa-data';
import { getAlternates } from '@/lib/seo';
import { SEAComparisonTable } from '@/components/visa/sea-comparison-table';
import { CountryHero } from '@/components/country/country-hero';
import { VisaCategoryGroup } from '@/components/country/visa-category-group';
import { ToolCard } from '@/components/country/tool-card';
import { NeighborhoodScroll } from '@/components/country/neighborhood-scroll';
import { CountryBlogSection } from '@/components/country/country-blog-section';
import { getVisaCardsForCountry, groupVisasByCategory } from '@/lib/country-page-data';
import { getNeighborhoodData } from '@/lib/neighborhood-data';
import { getChecklistData } from '@/lib/checklist-data';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
          /* Hub layout for KR/JP/TW */
          <HubSections
            country={country}
            displayName={displayName}
            locale={locale}
            t={t}
            tc={tc}
          />
        )}
      </main>
    </>
  );
}

// Async sub-component to handle data loading for KR/JP/TW hub layout
async function HubSections({
  country,
  displayName,
  locale,
  t,
  tc,
}: {
  country: string;
  displayName: string;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations<'Country'>>>;
  tc: Awaited<ReturnType<typeof getTranslations<'Common'>>>;
}) {
  const [visaCards, neighborhoodData, checklistData] = await Promise.all([
    getVisaCardsForCountry(country as Country, locale),
    getNeighborhoodData(country),
    getChecklistData(country, locale),
  ]);

  const groupedVisas = groupVisasByCategory(visaCards);

  const neighborhoodCount =
    neighborhoodData?.cities.reduce(
      (sum, city) => sum + city.neighborhoods.length,
      0
    ) ?? 0;
  const hasChecklist = checklistData !== null;

  const toolCount = [
    visaCards.length > 1,
    country === 'korea',
    hasChecklist,
  ].filter(Boolean).length;

  return (
    <>
      {/* S1: Country Hero */}
      <CountryHero
        country={country}
        displayName={displayName}
        visaCount={visaCards.length}
        neighborhoodCount={neighborhoodCount}
        hasChecklist={hasChecklist}
        locale={locale}
      />

      {/* S3: Visas by Category */}
      <ScrollReveal>
        <section className="bg-neutral-50 px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-lora text-2xl font-bold text-primary sm:text-3xl">
              {t('visasByCategory')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('visaCount', { count: visaCards.length })}
            </p>
            <div className="mt-8 space-y-8 sm:space-y-10">
              {groupedVisas.map(({ group, visas }) => (
                <VisaCategoryGroup
                  key={group.key}
                  label={group.label}
                  icon={group.icon}
                  visas={visas}
                  country={country}
                />
              ))}
            </div>

          </div>
        </section>
      </ScrollReveal>

      {/* S4: Tools Triptych */}
      <ScrollReveal delay={100}>
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-lora text-2xl font-bold text-primary sm:text-3xl">
              {t('planYourMove')}
            </h2>
            <div
              className={`mt-6 grid grid-cols-1 gap-4 ${
                toolCount === 2
                  ? 'max-w-2xl sm:grid-cols-2'
                  : 'sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {country === 'korea' && (
                <ToolCard
                  icon={ArrowRightLeft}
                  title={t('toolChangeTitle')}
                  description={t('toolChangeDesc')}
                  href={`/${country}/visa/change`}
                  ctaLabel={t('toolChange')}
                />
              )}
              {visaCards.length > 1 && (
                <ToolCard
                  icon={Scale}
                  title={t('toolCompareTitle')}
                  description={t('toolCompareDesc')}
                  href={`/${country}/compare`}
                  ctaLabel={t('toolCompare')}
                />
              )}
              {hasChecklist && (
                <ToolCard
                  icon={ClipboardCheck}
                  title={t('toolChecklistTitle')}
                  description={t('toolChecklistDesc', {
                    count:
                      checklistData?.phases.reduce(
                        (s, p) => s + p.items.length,
                        0
                      ) ?? 0,
                  })}
                  href={`/${country}/checklist`}
                  ctaLabel={t('toolChecklist')}
                />
              )}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* S5: Neighborhood Scroll */}
      {country !== 'southeast-asia' && (
        <ScrollReveal delay={100}>
          <NeighborhoodScroll country={country} displayName={displayName} />
        </ScrollReveal>
      )}

      {/* S6: Country Blog Section */}
      {country !== 'southeast-asia' && (
        <ScrollReveal delay={100}>
          <CountryBlogSection country={country} displayName={displayName} />
        </ScrollReveal>
      )}

      {/* S7: Disclaimer */}
      <ScrollReveal>
        <section className="bg-neutral-50 px-4 py-8 sm:py-10">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs text-muted-foreground">{tc('disclaimer')}</p>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
