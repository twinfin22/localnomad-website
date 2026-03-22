import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getAlternates } from '@/lib/seo';
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
  { country: 'japan', displayName: 'Japan', coordinates: [36.2, 138.2] as [number, number] },
  { country: 'korea', displayName: 'South Korea', coordinates: [37.5, 127.0] as [number, number] },
  { country: 'taiwan', displayName: 'Taiwan', coordinates: [24.0, 121.0] as [number, number] },
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
    },
    twitter: {
      card: 'summary_large_image',
      title: t('landingTitle'),
      description: t('landingDescription'),
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  // Load neighborhood data for all countries in parallel
  const countryDataResults = await Promise.all(
    NEIGHBORHOOD_COUNTRIES.map(async ({ country, displayName, coordinates }) => {
      const data = await getNeighborhoodData(country);
      if (!data) return null;

      const totalNeighborhoods = data.cities.reduce(
        (sum, city) => sum + city.neighborhoods.length,
        0
      );

      return {
        country,
        displayName,
        coordinates,
        neighborhoodCount: totalNeighborhoods,
        cityCount: data.cities.length,
        topCities: data.cities.slice(0, 3).map((c) => c.name),
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
