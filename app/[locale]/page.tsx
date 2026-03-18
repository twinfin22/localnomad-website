import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import {
  Hero,
  CountrySelector,
  NeighborhoodPreview,
  BlogCarousel,
  ClosingCta,
} from '@/components/landing';
import { getNeighborhoodData } from '@/lib/neighborhood-data';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
}

const NEIGHBORHOOD_COUNTRIES = [
  { country: 'korea', displayName: 'South Korea' },
  { country: 'japan', displayName: 'Japan' },
  { country: 'taiwan', displayName: 'Taiwan' },
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'Meta' });
  const alternates = getAlternates(locale);

  return {
    title: t('landingTitle'),
    description: t('landingDescription'),
    alternates,
    openGraph: {
      title: t('landingTitle'),
      description: t('landingDescription'),
      url: `https://localnomad.club/${locale}`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('landingTitle'),
      description: t('landingDescription'),
      images: ['/og-default.png'],
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  // Load neighborhood data for all countries in parallel
  const countryDataResults = await Promise.all(
    NEIGHBORHOOD_COUNTRIES.map(async ({ country, displayName }) => {
      const data = await getNeighborhoodData(country);
      if (!data) return null;

      const totalNeighborhoods = data.cities.reduce(
        (sum, city) => sum + city.neighborhoods.length,
        0
      );

      // Compute country center from all city coordinates
      const avgLat =
        data.cities.reduce((sum, c) => sum + c.coordinates[0], 0) /
        data.cities.length;
      const avgLng =
        data.cities.reduce((sum, c) => sum + c.coordinates[1], 0) /
        data.cities.length;

      return {
        country,
        displayName,
        coordinates: [avgLat, avgLng] as [number, number],
        neighborhoodCount: totalNeighborhoods,
        cityCount: data.cities.length,
      };
    })
  );

  const countries = countryDataResults.filter(
    (c): c is NonNullable<typeof c> => c !== null
  );

  return (
    <main id="main-content" style={{ backgroundColor: 'var(--primary)' }}>
      <Hero />
      <CountrySelector />
      <NeighborhoodPreview countries={countries} />
      <BlogCarousel />
      <ClosingCta />
    </main>
  );
}
