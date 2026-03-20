import { cache } from 'react';
import type { CountryChecklist } from '@/lib/types/checklist';

const VALID_COUNTRIES = ['japan', 'korea', 'taiwan'] as const;
type ChecklistCountry = (typeof VALID_COUNTRIES)[number];

export const getChecklistData = cache(
  async (country: string): Promise<CountryChecklist | null> => {
    if (!VALID_COUNTRIES.includes(country as ChecklistCountry)) return null;
    try {
      const data = await import(`@/data/checklists/${country}.json`);
      return data.default as CountryChecklist;
    } catch {
      return null;
    }
  }
);
