import { z } from 'zod';

export const BLOG_CATEGORIES = [
  'guides',
  'updates',
  'tips',
  'comparisons',
  'news',
  'stories',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_COUNTRIES = [
  'korea',
  'japan',
  'china',
  'taiwan',
  'sea',
  'global',
] as const;

export type BlogCountry = (typeof BLOG_COUNTRIES)[number];

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
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  coverImage: z.string().optional(),
  readingTime: z.number().optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
