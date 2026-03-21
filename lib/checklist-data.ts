import { cache } from 'react';
import type { CountryChecklist } from '@/lib/types/checklist';

const VALID_COUNTRIES = ['japan', 'korea', 'taiwan'] as const;
type ChecklistCountry = (typeof VALID_COUNTRIES)[number];

const SUPPORTED_LOCALES = ['en', 'ja', 'zh-cn'] as const;

export const getChecklistData = cache(
  async (country: string, locale: string = 'en'): Promise<CountryChecklist | null> => {
    if (!VALID_COUNTRIES.includes(country as ChecklistCountry)) return null;

    // Try locale-specific file first, fall back to EN
    if (locale !== 'en' && SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) {
      try {
        const data = await import(`@/data/checklists/${country}.${locale}.json`);
        return data.default as CountryChecklist;
      } catch {
        // Locale file not found — fall through to EN
      }
    }

    try {
      const data = await import(`@/data/checklists/${country}.json`);
      return data.default as CountryChecklist;
    } catch {
      return null;
    }
  }
);
