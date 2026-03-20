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

const LAST_MODIFIED = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    // Landing page
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 1,
    });

    // Country pages
    for (const country of COUNTRIES) {
      entries.push({
        url: `${BASE_URL}/${locale}/${country}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly',
        priority: 0.9,
      });

      // Visa detail pages
      const visaTypes = COUNTRY_VISAS[country] ?? [];
      for (const type of visaTypes) {
        entries.push({
          url: `${BASE_URL}/${locale}/${country}/visa/${type}`,
          lastModified: LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      // Compare page (not for southeast-asia — comparison is on the country page)
      if (country !== 'southeast-asia') {
        entries.push({
          url: `${BASE_URL}/${locale}/${country}/compare`,
          lastModified: LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }

      // Visa change hub (Korea only)
      if (country === 'korea') {
        entries.push({
          url: `${BASE_URL}/${locale}/${country}/visa/change`,
          lastModified: LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        });

        const pairs = await getAllTransitionPairs('korea', locale);
        for (const { from, to } of pairs) {
          if (to === 'd-4') continue;
          entries.push({
            url: `${BASE_URL}/${locale}/${country}/visa/change/${from}-to-${to}`,
            lastModified: LAST_MODIFIED,
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        }
      }
    }

    // Neighborhood pages
    for (const neighborhoodCountry of NEIGHBORHOOD_COUNTRIES) {
      entries.push({
        url: `${BASE_URL}/${locale}/neighborhood/${neighborhoodCountry}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    // Info pages (about, contact)
    for (const page of INFO_PAGES) {
      entries.push({
        url: `${BASE_URL}/${locale}/${page}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'monthly',
        priority: 0.4,
      });
    }

    // Legal pages
    for (const page of LEGAL_PAGES) {
      entries.push({
        url: `${BASE_URL}/${locale}/${page}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'yearly',
        priority: 0.3,
      });
    }
  }

  // Blog pages
  const blogPosts = getAllPosts();

  for (const locale of LOCALES) {
    // Blog listing
    entries.push({
      url: `${BASE_URL}/${locale}/blog`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.7,
    });

    // Category pages
    for (const category of BLOG_CATEGORIES) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${category}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }

    // Individual posts
    for (const post of blogPosts) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.category}/${post.slug}`,
        lastModified: new Date(
          post.frontmatter.updatedAt ?? post.frontmatter.date,
        ),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
