import type { MetadataRoute } from 'next';

const BASE_URL = 'https://localnomad.club';

const locales = ['en', 'ja', 'zh-tw'] as const;
const country = 'korea';

const visaTypes = [
  'e-7', 'f-1-d', 'd-2', 'd-10', 'h-1', 'f-2',
  'd-4', 'd-7', 'd-8', 'e-2', 'f-4', 'f-6',
] as const;

const buildUrl = (locale: string, path: string): string => {
  const countrySegment = `/${country}`;
  const pathSegment = path.startsWith('/') ? path : `/${path}`;

  if (locale === 'en') {
    return `${BASE_URL}${countrySegment}${pathSegment}`;
  }
  return `${BASE_URL}/${locale}${countrySegment}${pathSegment}`;
};

const buildLocaleHomeUrl = (locale: string): string => {
  if (locale === 'en') {
    return `${BASE_URL}/${country}`;
  }
  return `${BASE_URL}/${locale}/${country}`;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Home pages for each locale: /en/korea, /ja/korea, /zh-tw/korea
  for (const locale of locales) {
    entries.push({
      url: buildLocaleHomeUrl(locale),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    });
  }

  // Visa landing page for each locale
  for (const locale of locales) {
    entries.push({
      url: buildUrl(locale, '/visa'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    });
  }

  // Visa detail pages: 12 types x 3 locales = 36 URLs
  for (const locale of locales) {
    for (const visaType of visaTypes) {
      entries.push({
        url: buildUrl(locale, `/visa/${visaType}`),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // Visa tools for each locale: find, compare, path
  const visaTools = ['find', 'compare', 'path'] as const;
  for (const locale of locales) {
    for (const tool of visaTools) {
      entries.push({
        url: buildUrl(locale, `/visa/${tool}`),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  // Areas and bundles for each locale
  const localeSections = ['areas', 'bundles'] as const;
  for (const locale of locales) {
    for (const section of localeSections) {
      entries.push({
        url: buildUrl(locale, `/${section}`),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  // Static pages (not locale-prefixed)
  const staticPages = [
    { path: '/business', priority: 0.5 },
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
    { path: '/refund', priority: 0.3 },
  ] as const;

  for (const page of staticPages) {
    entries.push({
      url: `${BASE_URL}${page.path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: page.priority,
    });
  }

  return entries;
}
