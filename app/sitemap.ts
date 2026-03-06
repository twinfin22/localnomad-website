import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { BLOG_CATEGORIES } from '@/lib/blog/schema';

const BASE_URL = 'https://localnomad.club';

const LOCALES = ['en', 'ja', 'zh-cn', 'zh-tw', 'vi'] as const;
const COUNTRIES = ['korea', 'taiwan', 'japan', 'china', 'southeast-asia'] as const;

const COUNTRY_VISAS: Record<string, string[]> = {
  korea: ['f-1-d', 'e-7', 'd-8', 'f-2', 'h-1', 'b-2'],
  taiwan: ['gold-card', 'dnv', 'visitor'],
  japan: ['engineer-specialist', 'hsw', 'ssw1', 'ssw2', 'digital-nomad-jp', 'business-manager', 'tourist'],
  china: ['z-visa', 'x1-visa', 'k-visa'],
  'southeast-asia': [],
};

const NEIGHBORHOOD_COUNTRIES = ['korea', 'japan', 'taiwan', 'china'] as const;

const LEGAL_PAGES = ['terms', 'privacy', 'refund'];

const LAST_MODIFIED = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
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
