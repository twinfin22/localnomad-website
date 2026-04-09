import { z } from 'zod';

export const BLOG_CATEGORIES = [
  'guides',
  'updates',
  'tips',
  'comparisons',
  'news',
  'stories',
  'tax',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_COUNTRIES = [
  'japan',
  'korea',
  'taiwan',
  'china',
  'sea',
  'global',
] as const;

export type BlogCountry = (typeof BLOG_COUNTRIES)[number];

export const BLOG_TAGS = [
  // Topic
  'visa',
  'tax',
  'housing',
  'banking',
  'payment',
  'cost-of-living',
  'immigration-policy',
  'daily-life',
  'food',
  'safety',
  'internet',
  'pension',
  'crypto',
  // Visa-specific (cross-country linking)
  'digital-nomad-visa',
  'permanent-residency',
  'work-visa',
  'working-holiday',
  'tourist-visa',
  // Action / Format
  'checklist',
  'comparison',
  'freelancer',
] as const;

export type BlogTag = (typeof BLOG_TAGS)[number];

export const frontmatterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required').max(200, 'Description should be under 160 characters for optimal SERP display; hard limit 200'),
  category: z.enum(BLOG_CATEGORIES),
  country: z.enum(BLOG_COUNTRIES),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  author: z.string().default('LocalNomad Team'),
  tags: z.array(z.enum(BLOG_TAGS)).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  coverImage: z.string().optional(),
  readingTime: z.number().optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
