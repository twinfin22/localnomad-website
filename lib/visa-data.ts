import { cache } from 'react';
import type { Country, Visa, VisaSummary, CountryCode } from '@/lib/types/visa';

const COUNTRY_CODE_MAP: Record<Country, CountryCode> = {
  korea: 'kr',
  taiwan: 'tw',
  japan: 'jp',
  'southeast-asia': 'sea',
};

const AVAILABLE_VISAS: Record<Country, string[]> = {
  korea: ['f-1-d', 'e-7', 'd-8', 'f-2', 'f-5', 'f-6', 'd-10', 'h-1', 'b-2'],
  taiwan: ['gold-card', 'dnv', 'visitor'],
  japan: ['digital-nomad-jp', 'engineer-specialist', 'business-manager', 'hsw', 'tourist', 'ssw1', 'ssw2'],
  'southeast-asia': [],
};

async function loadVisaJson(
  country: Country,
  locale: string,
  type: string,
): Promise<Visa | null> {
  try {
    const data = (
      await import(`@/data/visas/${country}/${locale}/${type}.json`)
    ).default as Record<string, unknown>;
    return {
      ...data,
      country: COUNTRY_CODE_MAP[country],
    } as Visa;
  } catch {
    // Locale fallback: try English
    if (locale !== 'en') {
      return loadVisaJson(country, 'en', type);
    }
    return null;
  }
}

/**
 * Load visa data for a specific country, locale, and type.
 * Returns null if not found. Uses React.cache for request dedup.
 */
export const getVisaData = cache(
  async (
    country: Country,
    locale: string,
    visaType: string,
  ): Promise<Visa | null> => {
    const available = AVAILABLE_VISAS[country] ?? [];
    if (!available.includes(visaType)) {
      return null;
    }
    return loadVisaJson(country, locale, visaType);
  },
);

/**
 * Load comparison data by ID.
 */
export async function getComparisonData(comparisonId: string) {
  const data = (await import(`@/data/comparisons/${comparisonId}.json`))
    .default;
  return data;
}

/**
 * List available visas for a country/locale as summaries.
 */
export const getAvailableVisas = cache(
  async (country: Country, locale: string): Promise<VisaSummary[]> => {
    const types = AVAILABLE_VISAS[country] ?? [];
    const visas = await Promise.all(
      types.map((type) => loadVisaJson(country, locale, type))
    );

    return visas
      .filter((visa): visa is Visa => visa !== null)
      .map((visa) => ({
        type: visa.type,
        name: visa.name,
        shortName: visa.shortName,
        category: visa.category,
        tagline: visa.tagline,
        country: COUNTRY_CODE_MAP[country],
      }));
  },
);
