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

  posts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );

  if (options?.limit) return posts.slice(0, options.limit);
  return posts;
};

export const getAllPostSlugs = (): {
  category: string;
  slug: string;
}[] => {
  return getAllPosts().map((p) => ({ category: p.category, slug: p.slug }));
};
