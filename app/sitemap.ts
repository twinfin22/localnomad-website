import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { BLOG_CATEGORIES } from '@/lib/blog/schema';
import { getAllTransitionPairs } from '@/lib/visa-transitions';

const BASE_URL = 'https://localnomad.club';

const LOCALES = ['en', 'ja', 'zh-cn', 'zh-tw', 'vi'] as const;
const COUNTRIES = ['japan', 'korea', 'taiwan', 'southeast-asia'] as const;

const COUNTRY_VISAS: Record<string, string[]> = {
  japan: ['engineer-specialist', 'hsw', 'ssw1', 'ssw2', 'digital-nomad-jp', 'business-manager', 'tourist'],
  korea: ['f-1-d', 'e-7', 'd-8', 'f-2', 'f-5', 'f-6', 'd-10', 'h-1', 'b-2'],
  taiwan: ['gold-card', 'dnv', 'visitor'],
  'southeast-asia': [],
};

const NEIGHBORHOOD_COUNTRIES = ['korea', 'japan', 'taiwan'] as const;

const LEGAL_PAGES = ['terms', 'privacy', 'refund'];
const INFO_PAGES = ['about', 'contact'];

const BCP47_MAP: Record<string, string> = {
  en: 'en',
  ja: 'ja',
  'zh-cn': 'zh-Hans',
  'zh-tw': 'zh-Hant',
  vi: 'vi',
};

// Fallback for pages without a known modification date.
// Updated manually when major site-wide changes ship.
const LAST_MODIFIED = new Date('2026-03-20');

function alternates(pathname: string) {
  const languages: Record<string, string> = {};
  for (const [loc, bcp47] of Object.entries(BCP47_MAP)) {
    languages[bcp47] = `${BASE_URL}/${loc}${pathname}`;
  }
  languages['x-default'] = `${BASE_URL}/en${pathname}`;
  return { languages };
}

function entry(
  pathname: string,
  opts: { lastModified?: Date; changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']; priority?: number },
): MetadataRoute.Sitemap[number][] {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${pathname}`,
    lastModified: opts.lastModified ?? LAST_MODIFIED,
    changeFrequency: opts.changeFrequency ?? 'monthly',
    priority: opts.priority ?? 0.5,
    alternates: alternates(pathname),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Landing page
  entries.push(...entry('', { changeFrequency: 'monthly', priority: 1 }));

  // Country pages
  for (const country of COUNTRIES) {
    entries.push(...entry(`/${country}`, { changeFrequency: 'weekly', priority: 0.9 }));

    // Visa detail pages
    const visaTypes = COUNTRY_VISAS[country] ?? [];
    for (const type of visaTypes) {
      entries.push(...entry(`/${country}/visa/${type}`, { changeFrequency: 'weekly', priority: 0.8 }));
    }

    // Compare page (not for southeast-asia — comparison is on the country page)
    if (country !== 'southeast-asia') {
      entries.push(...entry(`/${country}/compare`, { changeFrequency: 'monthly', priority: 0.6 }));
    }

    // Visa change hub (Korea only)
    if (country === 'korea') {
      entries.push(...entry(`/${country}/visa/change`, { changeFrequency: 'weekly', priority: 0.8 }));

      const pairs = await getAllTransitionPairs('korea', 'en');
      for (const { from, to } of pairs) {
        if (to === 'd-4') continue;
        entries.push(...entry(`/${country}/visa/change/${from}-to-${to}`, { changeFrequency: 'monthly', priority: 0.7 }));
      }
    }
  }

  // Neighborhood pages
  for (const neighborhoodCountry of NEIGHBORHOOD_COUNTRIES) {
    entries.push(...entry(`/neighborhood/${neighborhoodCountry}`, { changeFrequency: 'monthly', priority: 0.7 }));
  }

  // Info pages (about, contact)
  for (const page of INFO_PAGES) {
    entries.push(...entry(`/${page}`, { changeFrequency: 'monthly', priority: 0.4 }));
  }

  // Legal pages
  for (const page of LEGAL_PAGES) {
    entries.push(...entry(`/${page}`, { changeFrequency: 'yearly', priority: 0.3 }));
  }

  // Blog pages
  const blogPosts = getAllPosts();

  entries.push(...entry('/blog', { changeFrequency: 'weekly', priority: 0.7 }));

  for (const category of BLOG_CATEGORIES) {
    entries.push(...entry(`/blog/${category}`, { changeFrequency: 'weekly', priority: 0.6 }));
  }

  for (const post of blogPosts) {
    entries.push(...entry(`/blog/${post.category}/${post.slug}`, {
      lastModified: new Date(post.frontmatter.updatedAt ?? post.frontmatter.date),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  }

  return entries;
}
