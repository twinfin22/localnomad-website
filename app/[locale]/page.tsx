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
import type { NeighborhoodCardData } from '@/components/landing';
import { getNeighborhoodData } from '@/lib/neighborhood-data';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
}

const NEIGHBORHOOD_COUNTRIES = ['japan', 'korea', 'taiwan'] as const;
const COUNTRY_FLAGS: Record<string, string> = { japan: '🇯🇵', korea: '🇰🇷', taiwan: '🇹🇼' };

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = (s >>> 0) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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

  // Flatten all neighborhoods from all countries
  const allNeighborhoods: NeighborhoodCardData[] = [];
  await Promise.all(
    NEIGHBORHOOD_COUNTRIES.map(async (country) => {
      const data = await getNeighborhoodData(country);
      if (!data) return;
      for (const city of data.cities) {
        for (const hood of city.neighborhoods) {
          allNeighborhoods.push({
            name: hood.name,
            city: hood.city,
            country,
            countryFlag: COUNTRY_FLAGS[country] ?? '',
            rent: hood.rent,
            tags: hood.tags.slice(0, 3),
            imageUrl: hood.imageUrl ?? '/images/placeholder.jpg',
            coordinates: hood.coordinates,
          });
        }
      }
    })
  );

  // Deterministic daily shuffle
  const daySeed = Math.floor(Date.now() / 86400000);
  const neighborhoods = seededShuffle(allNeighborhoods, daySeed);

  return (
    <main id="main-content" style={{ backgroundColor: 'var(--primary)' }}>
      <Hero />
      <CountrySelector />
      <NeighborhoodPreview neighborhoods={neighborhoods} />
      <ClosingCta />
      <BlogCarousel />
    </main>
  );
}
