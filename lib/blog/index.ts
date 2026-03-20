import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  frontmatterSchema,
  type Frontmatter,
  type BlogCategory,
  type BlogCountry,
} from './schema';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

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
): BlogPost | null => {
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

export const getAllPosts = (options?: {
  category?: BlogCategory;
  country?: BlogCountry;
  limit?: number;
}): BlogPost[] => {
  const categories = options?.category
    ? [options.category]
    : fs
        .readdirSync(CONTENT_DIR)
        .filter((f) =>
          fs.statSync(path.join(CONTENT_DIR, f)).isDirectory(),
        );

  const posts: BlogPost[] = [];

  for (const cat of categories) {
    const catDir = path.join(CONTENT_DIR, cat);
    if (!fs.existsSync(catDir)) continue;

    const files = fs.readdirSync(catDir).filter((f) => f.endsWith('.mdx'));

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '');
      const post = getPost(cat, slug);
      if (!post) continue;
      if (options?.country && post.frontmatter.country !== options.country)
        continue;
      posts.push(post);
    }
  }

  const countryOrder: Record<string, number> = {
    japan: 0, korea: 1, taiwan: 2, china: 3, sea: 4, global: 5,
  };
  posts.sort((a, b) => {
    const dateDiff =
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (countryOrder[a.frontmatter.country] ?? 9) -
      (countryOrder[b.frontmatter.country] ?? 9);
  });

  if (options?.limit) return posts.slice(0, options.limit);
  return posts;
};

export const getRelatedPosts = (
  currentSlug: string,
  currentCategory: BlogCategory,
  currentCountry: BlogCountry,
  currentTags: string[] = [],
  limit = 6,
): BlogPost[] => {
  const all = getAllPosts();
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
  category: string;
  slug: string;
}[] => {
  return getAllPosts().map((p) => ({ category: p.category, slug: p.slug }));
};
