import { cache } from 'react';
import type { Visa, VisaSummary, CountryCode } from '@/lib/types/visa';

type Country = 'korea' | 'taiwan';

const COUNTRY_CODE_MAP: Record<Country, CountryCode> = {
  korea: 'kr',
  taiwan: 'tw',
};

const AVAILABLE_VISAS: Record<Country, string[]> = {
  korea: ['f-1-d'],
  taiwan: [],
};

async function loadVisaJson(
  country: Country,
  locale: string,
  type: string,
): Promise<Visa | null> {
  try {
    // Korea: data/visas/{locale}/{type}.json
    // Taiwan: data/visas/tw/{locale}/{type}.json
    let data: Record<string, unknown>;
    if (country === 'korea') {
      data = (await import(`@/data/visas/${locale}/${type}.json`)).default;
    } else {
      data = (await import(`@/data/visas/tw/${locale}/${type}.json`)).default;
    }
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
