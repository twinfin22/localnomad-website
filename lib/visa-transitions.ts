import { getVisaData, getAvailableVisas } from '@/lib/visa-data';
import type { Country, VisaTransitionPath } from '@/lib/types/visa';

/**
 * Get all visa types that a given visa can transition TO.
 * Returns pathsTo from the source visa's JSON data.
 */
export async function getTransitionsFrom(
  country: Country,
  visaType: string,
  locale = 'en',
): Promise<VisaTransitionPath[]> {
  const visa = await getVisaData(country, locale, visaType);
  return visa?.pathsTo ?? [];
}

/**
 * Get all visa types that can transition INTO a given visa.
 * Returns pathsFrom from the destination visa's JSON data.
 */
export async function getTransitionsTo(
  country: Country,
  visaType: string,
  locale = 'en',
): Promise<VisaTransitionPath[]> {
  const visa = await getVisaData(country, locale, visaType);
  return visa?.pathsFrom ?? [];
}

/**
 * Get detail for a specific transition pair (from → to).
 * Returns the source visa, target visa, and the matching transition entry.
 * Returns null if the transition is not found.
 */
export async function getTransitionDetail(
  country: Country,
  from: string,
  to: string,
  locale = 'en',
): Promise<{
  fromVisa: Awaited<ReturnType<typeof getVisaData>>;
  toVisa: Awaited<ReturnType<typeof getVisaData>>;
  transition: VisaTransitionPath;
} | null> {
  const [fromVisa, toVisa] = await Promise.all([
    getVisaData(country, locale, from),
    getVisaData(country, locale, to),
  ]);

  if (!fromVisa || !toVisa) return null;

  const transition = (fromVisa.pathsTo ?? []).find((p) => p.type === to);
  if (!transition) return null;

  return { fromVisa, toVisa, transition };
}

/**
 * Get all confirmed transition pairs for a country.
 * Iterates all available visas and collects every pathsTo entry.
 */
export async function getAllTransitionPairs(
  country: Country,
  locale = 'en',
): Promise<{ from: string; to: string }[]> {
  const summaries = await getAvailableVisas(country, locale);
  const pairs: { from: string; to: string }[] = [];

  await Promise.all(
    summaries.map(async (summary) => {
      const visa = await getVisaData(country, locale, summary.type);
      if (!visa?.pathsTo) return;
      for (const path of visa.pathsTo) {
        pairs.push({ from: summary.type, to: path.type });
      }
    }),
  );

  return pairs;
}
