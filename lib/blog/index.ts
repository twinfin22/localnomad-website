import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';
import {
  frontmatterSchema,
  type Frontmatter,
  type BlogCategory,
  type BlogCountry,
} from './schema';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');
const LOCALE_FOLDER_NAMES = ['ja', 'zh-cn'];

export interface BlogPost {
  slug: string;
  category: BlogCategory;
  frontmatter: Frontmatter;
  content: string;
  readingTime: number;
}

const calculateReadingTime = (content: string): number => {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
};

export const getPost = (
  category: string,
  slug: string,
  locale?: string,
): BlogPost | null => {
  // Try locale-specific path first
  if (locale && locale !== 'en') {
    const localePath = path.join(CONTENT_DIR, locale, category, `${slug}.mdx`);
    if (fs.existsSync(localePath)) {
      const raw = fs.readFileSync(localePath, 'utf-8');
      const { data, content } = matter(raw);
      const frontmatter = frontmatterSchema.parse(data);
      if (frontmatter.draft && process.env.NODE_ENV === 'production') return null;
      const readingTime = frontmatter.readingTime ?? calculateReadingTime(content);
      return {
        slug,
        category: frontmatter.category,
        frontmatter: { ...frontmatter, readingTime },
        content,
        readingTime,
      };
    }
  }

  // Fall back to EN path
  const filePath = path.join(CONTENT_DIR, category, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const frontmatter = frontmatterSchema.parse(data);

  if (frontmatter.draft && process.env.NODE_ENV === 'production') return null;

  const readingTime = frontmatter.readingTime ?? calculateReadingTime(content);

  return {
    slug,
    category: frontmatter.category,
    frontmatter: { ...frontmatter, readingTime },
    content,
    readingTime,
  };
};

const countryOrder: Record<string, number> = {
  japan: 0, korea: 1, taiwan: 2, china: 3, sea: 4, global: 5,
};

// Cached: deduplicates FS walk within the same RSC request
// Cache key includes locale to ensure separate caches per locale
const getCachedAllPosts = cache((locale: string = 'en'): BlogPost[] => {
  let scanDir: string;
  let filterFolders: string[];

  if (locale !== 'en') {
    scanDir = path.join(CONTENT_DIR, locale);
    filterFolders = [];
  } else {
    scanDir = CONTENT_DIR;
    filterFolders = LOCALE_FOLDER_NAMES;
  }

  if (!fs.existsSync(scanDir)) return [];

  const categories = fs
    .readdirSync(scanDir)
    .filter((f) => fs.statSync(path.join(scanDir, f)).isDirectory())
    .filter((f) => !filterFolders.includes(f));

  const posts: BlogPost[] = [];

  for (const cat of categories) {
    const catDir = path.join(scanDir, cat);
    if (!fs.existsSync(catDir)) continue;

    const files = fs.readdirSync(catDir).filter((f) => f.endsWith('.mdx'));

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '');
      const post = getPost(cat, slug, locale);
      if (!post) continue;
      posts.push(post);
    }
  }

  posts.sort((a, b) => {
    const dateDiff =
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (countryOrder[a.frontmatter.country] ?? 9) -
      (countryOrder[b.frontmatter.country] ?? 9);
  });

  return posts;
});

export const getAllPosts = (options?: {
  category?: BlogCategory;
  country?: BlogCountry;
  limit?: number;
  locale?: string;
}): BlogPost[] => {
  const locale = options?.locale ?? 'en';

  if (options?.category) {
    // Category-specific: do a targeted walk (cheaper than full walk)
    const catDir = locale !== 'en'
      ? path.join(CONTENT_DIR, locale, options.category)
      : path.join(CONTENT_DIR, options.category);

    if (!fs.existsSync(catDir)) return [];

    const files = fs.readdirSync(catDir).filter((f) => f.endsWith('.mdx'));
    const posts: BlogPost[] = [];
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '');
      const post = getPost(options.category, slug, locale);
      if (!post) continue;
      if (options.country && post.frontmatter.country !== options.country) continue;
      posts.push(post);
    }

    posts.sort((a, b) => {
      const dateDiff = new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (countryOrder[a.frontmatter.country] ?? 9) - (countryOrder[b.frontmatter.country] ?? 9);
    });

    if (options.limit) return posts.slice(0, options.limit);
    return posts;
  }

  // No category filter: use cached full walk
  let result = getCachedAllPosts(locale);
  if (options?.country) result = result.filter(p => p.frontmatter.country === options.country);
  if (options?.limit) result = result.slice(0, options.limit);
  return result;
};

export const getRelatedPosts = (
  currentSlug: string,
  currentCategory: BlogCategory,
  currentCountry: BlogCountry,
  currentTags: string[] = [],
  limit = 6,
  locale = 'en',
): BlogPost[] => {
  const all = getAllPosts({ locale });
  const tagSet = new Set(currentTags);

  const scored = all
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      let score = 0;
      if (p.frontmatter.country === currentCountry) score += 3;
      if (p.category === currentCategory) score += 2;
      const overlap = (p.frontmatter.tags ?? []).filter((t) => tagSet.has(t)).length;
      score += overlap;
      return { post: p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.post);
};

export const getAllPostSlugs = (): {
  locale: string;
  category: string;
  slug: string;
}[] => {
  // EN posts
  const enPosts = getAllPosts().map((p) => ({
    locale: 'en',
    category: p.category,
    slug: p.slug,
  }));

  // Locale-specific posts
  const localePosts: { locale: string; category: string; slug: string }[] = [];
  for (const localeDir of LOCALE_FOLDER_NAMES) {
    const locDir = path.join(CONTENT_DIR, localeDir);
    if (!fs.existsSync(locDir)) continue;

    const cats = fs
      .readdirSync(locDir)
      .filter((f) => fs.statSync(path.join(locDir, f)).isDirectory());

    for (const cat of cats) {
      const catDir = path.join(locDir, cat);
      const files = fs.readdirSync(catDir).filter((f) => f.endsWith('.mdx'));
      for (const file of files) {
        const slug = file.replace(/\.mdx$/, '');
        localePosts.push({ locale: localeDir, category: cat, slug });
      }
    }
  }

  return [...enPosts, ...localePosts];
};

export const getAvailableLocalesForPost = (category: string, slug: string): string[] => {
  const locales = ['en'];
  for (const locale of LOCALE_FOLDER_NAMES) {
    const filePath = path.join(CONTENT_DIR, locale, category, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      locales.push(locale);
    }
  }
  return locales;
};
