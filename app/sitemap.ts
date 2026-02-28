import type { MetadataRoute } from 'next';

const BASE_URL = 'https://localnomad.club';

const LOCALES = ['en', 'ja', 'zh-cn', 'zh-tw', 'vi'] as const;
const COUNTRIES = ['korea', 'taiwan'] as const;

const COUNTRY_VISAS: Record<string, string[]> = {
  korea: ['f-1-d', 'e-7', 'd-8', 'f-2', 'h-1'],
  taiwan: ['gold-card', 'dnv'],
};

const LEGAL_PAGES = ['terms', 'privacy', 'refund'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    // Landing page
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    });

    // Country pages
    for (const country of COUNTRIES) {
      entries.push({
        url: `${BASE_URL}/${locale}/${country}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });

      // Visa detail pages
      const visaTypes = COUNTRY_VISAS[country] ?? [];
      for (const type of visaTypes) {
        entries.push({
          url: `${BASE_URL}/${locale}/${country}/visa/${type}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      // Compare page
      entries.push({
        url: `${BASE_URL}/${locale}/${country}/compare`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    // Legal pages
    for (const page of LEGAL_PAGES) {
      entries.push({
        url: `${BASE_URL}/${locale}/${page}`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      });
    }
  }

  return entries;
}
