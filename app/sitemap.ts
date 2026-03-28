import type { MetadataRoute } from 'next';
import { getAllPosts, getAvailableLocalesForPost } from '@/lib/blog';
import { BLOG_CATEGORIES } from '@/lib/blog/schema';
import { getAllTransitionPairs } from '@/lib/visa-transitions';

const BASE_URL = 'https://localnomad.club';

const LOCALES = ['en', 'ja', 'zh-cn'] as const;
const COUNTRIES = ['japan', 'korea', 'taiwan', 'southeast-asia'] as const;

const COUNTRY_VISAS: Record<string, string[]> = {
  japan: ['engineer-specialist', 'hsw', 'ssw1', 'ssw2', 'digital-nomad-jp', 'business-manager', 'tourist'],
  korea: ['f-1-d', 'e-7', 'd-8', 'f-2', 'f-5', 'f-6', 'd-10', 'h-1', 'b-2'],
  taiwan: ['gold-card', 'dnv', 'visitor'],
  'southeast-asia': [],
};

const NEIGHBORHOOD_COUNTRIES = ['korea', 'japan', 'taiwan'] as const;
const CHECKLIST_COUNTRIES = ['korea', 'japan', 'taiwan'] as const;

const LEGAL_PAGES = ['terms', 'privacy', 'refund'];
const INFO_PAGES = ['about', 'contact'];

import { BCP47_MAP } from '@/lib/seo';

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

function alternatesForLocales(pathname: string, locales: readonly string[]) {
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    const bcp47 = BCP47_MAP[loc];
    if (bcp47) languages[bcp47] = `${BASE_URL}/${loc}${pathname}`;
  }
  languages['x-default'] = `${BASE_URL}/en${pathname}`;
  return { languages };
}

function entryWithLocales(
  pathname: string,
  locales: readonly string[],
  opts: { lastModified?: Date; changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']; priority?: number },
): MetadataRoute.Sitemap[number][] {
  return locales.map((locale) => ({
    url: `${BASE_URL}/${locale}${pathname}`,
    lastModified: opts.lastModified ?? LAST_MODIFIED,
    changeFrequency: opts.changeFrequency ?? 'monthly',
    priority: opts.priority ?? 0.5,
    alternates: alternatesForLocales(pathname, locales),
  }));
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

      // English-only transition URLs — ja/zh-cn have incomplete pathsTo coverage
      const pairs = await getAllTransitionPairs('korea', 'en');
      for (const { from, to } of pairs) {
        if (to === 'd-4') continue;
        entries.push({
          url: `${BASE_URL}/en/${country}/visa/change/${from}-to-${to}`,
          lastModified: LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }
  }

  // Neighborhood pages
  for (const neighborhoodCountry of NEIGHBORHOOD_COUNTRIES) {
    entries.push(...entry(`/neighborhood/${neighborhoodCountry}`, { changeFrequency: 'monthly', priority: 0.7 }));
  }

  // Arrival checklist pages
  for (const checklistCountry of CHECKLIST_COUNTRIES) {
    entries.push(...entry(`/${checklistCountry}/checklist`, { changeFrequency: 'monthly', priority: 0.7 }));
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
    const availableLocales = getAvailableLocalesForPost(post.category, post.slug);
    entries.push(...entryWithLocales(`/blog/${post.category}/${post.slug}`, availableLocales, {
      lastModified: new Date(post.frontmatter.updatedAt ?? post.frontmatter.date),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  }

  return entries;
}
