import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getNeighborhoodData } from '@/lib/neighborhood-data';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { NeighborhoodExplorer } from '@/components/neighborhood';
import type { City, RentSource } from '@/lib/types/neighborhood';

export const revalidate = 3600;

const VALID_COUNTRIES = ['japan', 'korea', 'taiwan'] as const;

const COUNTRY_KEY: Record<string, 'countrySouthKorea' | 'countryJapan' | 'countryTaiwan'> = {
  korea: 'countrySouthKorea',
  japan: 'countryJapan',
  taiwan: 'countryTaiwan',
};

interface Props {
  params: Promise<{ locale: string; country: string }>;
}

export function generateStaticParams() {
  return VALID_COUNTRIES.map((country) => ({ country }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number]))
    return {};

  const t = await getTranslations({ locale, namespace: 'Neighborhood' });
  const displayName = t(COUNTRY_KEY[country] ?? 'countrySouthKorea');
  const title = t('metaTitle', { country: displayName });
  const description = t('metaDescription', { country: displayName });
  const alternates = getAlternates(locale, `/neighborhood/${country}`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://localnomad.club/${locale}/neighborhood/${country}`,
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

export default async function NeighborhoodPage({ params }: Props) {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) {
    notFound();
  }

  const data = await getNeighborhoodData(country);
  if (!data) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'Neighborhood' });
  const displayName = t(COUNTRY_KEY[country] ?? 'countrySouthKorea');

  // Collect all unique tags across all neighborhoods
  const allTags = Array.from(
    new Set(
      data.cities.flatMap((city: City) =>
        city.neighborhoods.flatMap((n) => n.tags)
      )
    )
  ).sort();

  // Schema.org structured data for each city as a Place
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('jsonLdName', { country: displayName }),
    description: t('jsonLdDescription', { country: displayName }),
    url: `https://localnomad.club/${locale}/neighborhood/${country}`,
    numberOfItems: data.cities.reduce(
      (sum: number, c: City) => sum + c.neighborhoods.length,
      0
    ),
    itemListElement: data.cities.flatMap((city: City, ci: number) =>
      city.neighborhoods.map((n, ni) => ({
        '@type': 'ListItem',
        position: ci * 100 + ni + 1,
        item: {
          '@type': 'Place',
          name: n.name,
          description: n.vibe,
          geo: {
            '@type': 'GeoCoordinates',
            latitude: n.coordinates[0],
            longitude: n.coordinates[1],
          },
          containedInPlace: {
            '@type': 'City',
            name: city.name,
            containedInPlace: {
              '@type': 'Country',
              name: displayName,
            },
          },
        },
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main id="main-content" className="min-h-svh bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Link
            href={`/${country}`}
            className="text-sm text-primary hover:underline"
          >
            &larr; {t('backToCountry', { country: displayName })}
          </Link>

          <h1 className="mt-6 font-lora text-3xl font-bold text-primary sm:text-4xl">
            {t('pageTitle', { country: displayName })}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {t('pageSubtitle')}
          </p>

          <h2 className="sr-only">Neighborhoods</h2>
          <div className="mt-8">
            <NeighborhoodExplorer cities={data.cities} allTags={allTags} />
          </div>

          {data.rentSources && data.rentSources.length > 0 && (
            <div className="mt-12 border-t pt-6 pb-2">
              <p className="text-xs text-muted-foreground">
                {t('rentSourcePrefix')}{' '}
                {data.rentSources.map((source: RentSource, i: number) => (
                  <span key={source.name}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      {source.name}
                    </a>
                    {i < data.rentSources!.length - 1 && ', '}
                  </span>
                ))}
                . {t('rentSourceSuffix')}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
