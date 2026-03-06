import { cache } from 'react';
import type { CountryNeighborhoodData } from '@/lib/types/neighborhood';

const VALID_COUNTRIES = ['korea', 'japan', 'taiwan', 'china'] as const;
type NeighborhoodCountry = (typeof VALID_COUNTRIES)[number];

export const getNeighborhoodData = cache(
  async (country: string): Promise<CountryNeighborhoodData | null> => {
    if (!VALID_COUNTRIES.includes(country as NeighborhoodCountry)) return null;
    try {
      const data = await import(`@/data/neighborhoods/${country}.json`);
      return data.default as CountryNeighborhoodData;
    } catch {
      return null;
    }
  }
);
