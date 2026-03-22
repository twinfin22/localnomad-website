import { cache } from 'react';
import { Briefcase, Laptop, Home, Plane } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Country, Visa } from '@/lib/types/visa';

// =============================================================================
// Category Groups
// =============================================================================

export interface CategoryGroup {
  key: string;
  label: string;
  icon: LucideIcon;
  categories: string[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { key: 'work', label: 'Work & Business', icon: Briefcase, categories: ['work', 'business', 'investment', 'job-seeking'] },
  { key: 'nomad', label: 'Digital Nomad', icon: Laptop, categories: ['digital-nomad', 'gold-card'] },
  { key: 'residence', label: 'Residence & Family', icon: Home, categories: ['residence', 'family'] },
  { key: 'short-term', label: 'Short-term & Holiday', icon: Plane, categories: ['working-holiday', 'tourist', 'visitor'] },
];

// =============================================================================
// Visa Card Data
// =============================================================================

export interface VisaCardData {
  type: string;
  shortName: string;
  category: string;
  tagline: string;
  durationInitial: string;    // from visa.duration.initial
  maxStay: string | undefined; // from visa.duration.maxTotal
  applicationFee: string;     // from visa.fees.application
  keyRequirement: string;     // from visa.keyRequirement (first line or truncated)
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  korea: 'kr',
  taiwan: 'tw',
  japan: 'jp',
  'southeast-asia': 'sea',
};

const AVAILABLE_VISAS: Record<string, string[]> = {
  korea: ['f-1-d', 'e-7', 'd-8', 'f-2', 'f-5', 'f-6', 'd-10', 'h-1', 'b-2'],
  taiwan: ['gold-card', 'dnv', 'visitor'],
  japan: ['digital-nomad-jp', 'engineer-specialist', 'business-manager', 'hsw', 'tourist', 'ssw1', 'ssw2'],
  'southeast-asia': [],
};

async function loadVisaJsonFull(
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
    if (locale !== 'en') {
      return loadVisaJsonFull(country, 'en', type);
    }
    return null;
  }
}

function extractKeyRequirement(visa: Visa): string {
  if (!visa.keyRequirement) return '';
  // Take first line only, truncate at 80 chars
  const firstLine = visa.keyRequirement.split('\n')[0].trim();
  return firstLine.length > 80 ? firstLine.slice(0, 77) + '...' : firstLine;
}

/**
 * Load all visa card data for a country. Uses React.cache for request dedup.
 */
export const getVisaCardsForCountry = cache(
  async (country: Country, locale: string): Promise<VisaCardData[]> => {
    const types = AVAILABLE_VISAS[country] ?? [];
    const visas = await Promise.all(
      types.map((type) => loadVisaJsonFull(country, locale, type))
    );

    return visas
      .filter((visa): visa is Visa => visa !== null)
      .map((visa): VisaCardData => ({
        type: visa.type,
        shortName: visa.shortName,
        category: visa.category,
        tagline: visa.tagline,
        durationInitial: visa.duration.initial,
        maxStay: visa.duration.maxTotal,
        applicationFee: visa.fees.application,
        keyRequirement: extractKeyRequirement(visa),
      }));
  },
);

// =============================================================================
// Group visas by category
// =============================================================================

export function groupVisasByCategory(
  visas: VisaCardData[],
): { group: CategoryGroup; visas: VisaCardData[] }[] {
  const assigned = new Set<string>();
  const result: { group: CategoryGroup; visas: VisaCardData[] }[] = [];

  for (const group of CATEGORY_GROUPS) {
    const matched = visas.filter((v) => group.categories.includes(v.category));
    if (matched.length > 0) {
      matched.forEach((v) => assigned.add(v.type));
      result.push({ group, visas: matched });
    }
  }

  // Fallback group for unmatched visas
  const unmatched = visas.filter((v) => !assigned.has(v.type));
  if (unmatched.length > 0) {
    result.push({
      group: {
        key: 'other',
        label: 'Other',
        icon: Briefcase,
        categories: [],
      },
      visas: unmatched,
    });
  }

  return result;
}

// =============================================================================
// Country hero config
// =============================================================================

export const COUNTRY_HERO_CONFIG: Record<string, { image: string; position: string }> = {
  korea: { image: '/images/checklist/korea-checklist-bg.jpg', position: 'center 20%' },
  japan: { image: '/images/visa/japan-visa-bg.jpg', position: 'center 20%' },
  taiwan: { image: '/images/visa/taiwan-visa-bg.jpg', position: 'center 40%' },
};
