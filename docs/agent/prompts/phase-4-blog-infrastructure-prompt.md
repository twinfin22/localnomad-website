# Phase 4: Blog Infrastructure — Implementation Prompt

## Overview
Add MDX blog infrastructure to the LocalNomad website. Uses `next-mdx-remote` for server-side MDX rendering with Zod schema validation for frontmatter type safety.

## Decisions (Confirmed by Gen)
- **URL structure**: Category in URL — `/blog/{category}/{slug}`
- **MDX processing**: next-mdx-remote + Zod frontmatter validation
- **Categories**: 6 categories — `guides`, `updates`, `tips`, `comparisons`, `news`, `stories`
- **Language**: English only for now (future: multi-locale)
- **Content location**: `content/blog/` in project root

## Step 0: Add Missing Countries to Homepage Hero

The homepage currently only shows Korea and Taiwan. Japan, China, and SEA comparison need to be added.

### 0a. Update `components/landing/hero.tsx`

**Current (lines 51-67):** 2 CountryCards in a `flex-col sm:flex-row` container.

**Replace** the CountryCard container div (lines 51-67) with a grid layout that accommodates 5 cards:

```tsx
<div
  className="animate-in fade-in zoom-in-95 duration-500 mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
  style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}
>
  <CountryCard
    href="/korea"
    emoji={t('countryKoreaEmoji')}
    name={t('countryKorea')}
    description={t('countryKoreaDesc')}
  />
  <CountryCard
    href="/japan"
    emoji={t('countryJapanEmoji')}
    name={t('countryJapan')}
    description={t('countryJapanDesc')}
  />
  <CountryCard
    href="/china"
    emoji={t('countryChinaEmoji')}
    name={t('countryChina')}
    description={t('countryChinaDesc')}
  />
  <CountryCard
    href="/taiwan"
    emoji={t('countryTaiwanEmoji')}
    name={t('countryTaiwan')}
    description={t('countryTaiwanDesc')}
  />
  <CountryCard
    href="/southeast-asia"
    emoji={t('countrySEAEmoji')}
    name={t('countrySEA')}
    description={t('countrySEADesc')}
  />
</div>
```

**Layout notes:**
- Mobile: 1 column (stacked)
- Tablet (sm): 2 columns (last card spans full or centered)
- Desktop (lg): 3 columns (top row 3, bottom row 2 centered)
- The `max-w-2xl` on the parent container may need widening to `max-w-4xl` to fit 3 columns

### 0b. Add i18n keys to `messages/{locale}.json` (all 5 locales)

Add to the existing `"Landing"` namespace:

**en.json:**
```json
"countryJapan": "Japan",
"countryJapanEmoji": "🇯🇵",
"countryJapanDesc": "Digital Nomad · Business Manager · Engineer",
"countryChina": "China",
"countryChinaEmoji": "🇨🇳",
"countryChinaDesc": "Z‑Visa · R‑Visa · X1‑Visa",
"countrySEA": "Southeast Asia",
"countrySEAEmoji": "🌏",
"countrySEADesc": "Compare Digital Nomad Visas"
```

**ja.json:**
```json
"countryJapan": "日本",
"countryJapanEmoji": "🇯🇵",
"countryJapanDesc": "デジタルノマド · 経営管理 · 技術人文知識",
"countryChina": "中国",
"countryChinaEmoji": "🇨🇳",
"countryChinaDesc": "Zビザ · Rビザ · X1ビザ",
"countrySEA": "東南アジア",
"countrySEAEmoji": "🌏",
"countrySEADesc": "デジタルノマドビザ比較"
```

**zh-cn.json:**
```json
"countryJapan": "日本",
"countryJapanEmoji": "🇯🇵",
"countryJapanDesc": "数字游民 · 经营管理 · 技术人文知识",
"countryChina": "中国",
"countryChinaEmoji": "🇨🇳",
"countryChinaDesc": "Z签证 · R签证 · X1签证",
"countrySEA": "东南亚",
"countrySEAEmoji": "🌏",
"countrySEADesc": "数字游民签证对比"
```

**zh-tw.json:**
```json
"countryJapan": "日本",
"countryJapanEmoji": "🇯🇵",
"countryJapanDesc": "數位遊牧 · 經營管理 · 技術人文知識",
"countryChina": "中國",
"countryChinaEmoji": "🇨🇳",
"countryChinaDesc": "Z簽證 · R簽證 · X1簽證",
"countrySEA": "東南亞",
"countrySEAEmoji": "🌏",
"countrySEADesc": "數位遊牧簽證比較"
```

**vi.json:**
```json
"countryJapan": "Nhật Bản",
"countryJapanEmoji": "🇯🇵",
"countryJapanDesc": "Digital Nomad · Quản lý kinh doanh · Kỹ sư",
"countryChina": "Trung Quốc",
"countryChinaEmoji": "🇨🇳",
"countryChinaDesc": "Visa Z · Visa R · Visa X1",
"countrySEA": "Đông Nam Á",
"countrySEAEmoji": "🌏",
"countrySEADesc": "So sánh Visa Digital Nomad"
```

### 0c. Files modified in Step 0

| File | Action |
|------|--------|
| `components/landing/hero.tsx` | MODIFY — Add 3 CountryCards, change layout to grid, widen max-width |
| `messages/en.json` | MODIFY — Add Japan/China/SEA keys to Landing namespace |
| `messages/ja.json` | MODIFY — Same (translated) |
| `messages/zh-cn.json` | MODIFY — Same (translated) |
| `messages/zh-tw.json` | MODIFY — Same (translated) |
| `messages/vi.json` | MODIFY — Same (translated) |

---

## Pre-Step: Install Dependencies

```bash
npm install next-mdx-remote@^5 gray-matter zod
npm install -D @tailwindcss/typography
```

> **Note:** `next-mdx-remote` v5 introduced `/rsc` export for React Server Components. Verify compatibility with Next.js 16 + React 19 after install by running `npm run build`. If v5 has issues, try `next-mdx-remote@latest`.

| Package | Purpose |
|---------|---------|
| `next-mdx-remote` | Server-side MDX → React rendering in App Router |
| `gray-matter` | Parses frontmatter (the `---` metadata block) from MDX files |
| `zod` | Runtime validation of frontmatter fields — catches missing/invalid fields at build time |
| `@tailwindcss/typography` | Tailwind `prose` classes for styled blog content (headings, lists, links, code blocks) |

## Step 1: Content Directory Structure

Create the following directory structure:

```
content/
└── blog/
    ├── guides/
    │   ├── korea-ultimate-digital-nomad-guide.mdx
    │   ├── japan-ultimate-digital-nomad-guide.mdx
    │   ├── china-ultimate-digital-nomad-guide.mdx
    │   └── taiwan-ultimate-digital-nomad-guide.mdx
    ├── updates/
    ├── tips/
    ├── comparisons/
    ├── news/
    └── stories/
```

**Rules:**
- MDX filenames: `kebab-case.mdx` (this becomes the URL slug)
- One MDX file = one blog post
- Category subdirectory determines the URL category segment
- Empty category folders should exist (ready for future content)

## Step 2: Frontmatter Schema — `lib/blog/schema.ts`

Define the Zod schema for blog post frontmatter:

```typescript
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
  'sea',        // Southeast Asia (cross-country)
  'global',     // Not country-specific
] as const;

export type BlogCountry = (typeof BLOG_COUNTRIES)[number];

export const frontmatterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(BLOG_CATEGORIES),
  country: z.enum(BLOG_COUNTRIES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  author: z.string().default('LocalNomad Team'),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  coverImage: z.string().optional(),
  readingTime: z.number().optional(),  // Auto-calculated if not provided
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
```

**Validation behavior:**
- Missing required field → build error with clear message ("Title is required")
- Invalid category → build error ("Invalid enum value. Expected 'guides' | 'updates' | ...")
- Wrong date format → build error ("Date must be YYYY-MM-DD format")
- Optional fields can be omitted safely

## Step 3: Blog Data Loader — `lib/blog/index.ts`

This is the core module that reads MDX files, validates frontmatter, and provides data to pages.

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { frontmatterSchema, type Frontmatter, type BlogCategory, type BlogCountry } from './schema';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost {
  slug: string;
  category: BlogCategory;
  frontmatter: Frontmatter;
  content: string;           // Raw MDX content (without frontmatter)
  readingTime: number;       // Minutes
}

/** Calculate reading time from word count */
function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200);  // 200 words per minute
}

/** Get a single post by category + slug */
export function getPost(category: string, slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, category, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  // Zod validation — throws descriptive error if frontmatter is invalid
  const frontmatter = frontmatterSchema.parse(data);

  // Skip draft posts in production
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

/** Get all posts, optionally filtered */
export function getAllPosts(options?: {
  category?: BlogCategory;
  country?: BlogCountry;
  limit?: number;
}): BlogPost[] {
  const categories = options?.category
    ? [options.category]
    : fs.readdirSync(CONTENT_DIR).filter(f =>
        fs.statSync(path.join(CONTENT_DIR, f)).isDirectory()
      );

  const posts: BlogPost[] = [];

  for (const cat of categories) {
    const catDir = path.join(CONTENT_DIR, cat);
    if (!fs.existsSync(catDir)) continue;

    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.mdx'));

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '');
      const post = getPost(cat, slug);
      if (!post) continue;
      if (options?.country && post.frontmatter.country !== options.country) continue;
      posts.push(post);
    }
  }

  // Sort by date (newest first)
  posts.sort((a, b) =>
    new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );

  if (options?.limit) return posts.slice(0, options.limit);
  return posts;
}

/** Get all unique tags across posts */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach(p => p.frontmatter.tags.forEach(t => tags.add(t)));
  return Array.from(tags).sort();
}

/** Get all category+slug combos for generateStaticParams */
export function getAllPostSlugs(): { category: string; slug: string }[] {
  return getAllPosts().map(p => ({ category: p.category, slug: p.slug }));
}
```

## Step 4: MDX Components — `components/blog/mdx-components.tsx`

Custom components available inside MDX content. These map standard HTML elements to styled versions, and provide custom components.

```typescript
'use client';

import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';

/** Budget table component for cost-of-living sections */
function BudgetTable({ data }: { data: { item: string; budget: string; mid: string; comfort: string }[] }) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-[#1B4965]">
            <th className="text-left py-2 pr-4">Item</th>
            <th className="text-right py-2 px-4">Budget</th>
            <th className="text-right py-2 px-4">Mid-Range</th>
            <th className="text-right py-2 px-4">Comfort</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-2 pr-4 font-medium">{row.item}</td>
              <td className="text-right py-2 px-4">{row.budget}</td>
              <td className="text-right py-2 px-4">{row.mid}</td>
              <td className="text-right py-2 px-4">{row.comfort}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Info callout box */
function Callout({ type = 'info', children }: { type?: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    tip: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  };
  const icons = { info: 'ℹ️', warning: '⚠️', tip: '💡' };

  return (
    <div className={`border-l-4 rounded-r-lg p-4 my-6 ${styles[type]}`}>
      <span className="mr-2">{icons[type]}</span>
      {children}
    </div>
  );
}

/** Disclaimer box (reusable for legal disclaimers in blog context) */
function Disclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 text-sm text-gray-600 italic">
      {children}
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  // Override default elements with Tailwind typography-friendly versions
  img: (props) => (
    <Image
      {...(props as any)}
      width={800}
      height={400}
      className="rounded-lg my-6"
      alt={props.alt || ''}
    />
  ),
  a: (props) => (
    <a {...props} className="text-[#1B4965] underline hover:text-[#1B4965]/80" target={props.href?.startsWith('http') ? '_blank' : undefined} rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined} />
  ),
  // Custom components available in MDX
  BudgetTable,
  Callout,
  Disclaimer,
};
```

**Usage in MDX:**
```mdx
<Callout type="tip">
WOWPASS cards combine T-money transit and foreign currency exchange in one card.
</Callout>

<Disclaimer>
Based on published requirements as of March 2026. Not legal advice.
</Disclaimer>

<BudgetTable data={[
  { item: "Rent (studio)", budget: "₩500,000", mid: "₩900,000", comfort: "₩1,500,000" },
  { item: "Food", budget: "₩300,000", mid: "₩500,000", comfort: "₩800,000" },
]} />
```

## Step 5: Blog Routes

### 5a. Blog listing page — `app/[locale]/blog/page.tsx`

Displays all blog posts with category filter tabs and country filter.

```
URL: /en/blog
```

**Requirements:**
- Show all non-draft posts, newest first
- Category filter tabs at top (All, Guides, Updates, Tips, Comparisons, News, Stories)
- Country filter (All, Korea, Japan, China, Taiwan, SEA)
- Each post card shows: title, description, category badge, country badge, date, reading time
- Clicking a card navigates to `/en/blog/{category}/{slug}`
- Server Component — no client-side state needed for initial render
- Use `generateMetadata` with i18n and `getAlternates()`
- Add `Blog` namespace to messages JSON files for UI text (filter labels, "Read more", etc.)

### 5b. Category listing page — `app/[locale]/blog/[category]/page.tsx`

Displays posts filtered by category.

```
URL: /en/blog/guides
```

**Requirements:**
- Validate `category` param against `BLOG_CATEGORIES` — return `notFound()` if invalid
- Same card layout as main listing, but pre-filtered
- `generateStaticParams` returns all 6 categories
- SEO: title like "Digital Nomad Guides | LocalNomad Blog"

### 5c. Blog post page — `app/[locale]/blog/[category]/[slug]/page.tsx`

Renders a single MDX blog post.

```
URL: /en/blog/guides/korea-ultimate-digital-nomad-guide
```

**Requirements:**
- Use `getPost(category, slug)` to load content
- Use `MDXRemote` from `next-mdx-remote/rsc` (RSC-compatible, no client wrapper needed)
- Pass `mdxComponents` to MDXRemote for custom component rendering
- Wrap content in `<article className="prose prose-lg max-w-none">` (Tailwind typography)
- Show post header: title, date, updated date (if exists), reading time, category + country badges
- Show author name
- `generateStaticParams` returns all category+slug combos from `getAllPostSlugs()`
- `generateMetadata` includes: title, description, OG image (coverImage or default), alternates
- Add structured data (JSON-LD) for SEO: `BlogPosting` schema with headline, datePublished, author

### 5d. Route structure summary

```
app/[locale]/blog/
├── page.tsx                           → /en/blog (all posts)
├── [category]/
│   ├── page.tsx                       → /en/blog/guides (category listing)
│   └── [slug]/
│       └── page.tsx                   → /en/blog/guides/korea-... (post)
```

## Step 6: Tailwind Typography Setup

Add `@tailwindcss/typography` to the CSS. In Tailwind v4, this is done via CSS import, NOT a config file plugin.

**In `app/globals.css`, add the typography import between line 1 and line 2:**

Current:
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
```

After:
```css
@import "tailwindcss";
@import "@tailwindcss/typography";   /* ← ADD THIS LINE */
@import "tw-animate-css";
@import "shadcn/tailwind.css";
```

**Prose customization** (if needed, add in globals.css `@theme` block or via CSS):
- Override prose link color to brand color `#1B4965`
- Override prose heading font to match site (Lora for headings)
- Adjust prose max-width for blog layout

## Step 7: Navigation Update

Add "Blog" link to the site navigation.

**Location:** `app/[locale]/layout.tsx` — navigation is inline in the layout (no separate Nav component).

**Current structure (lines 107-123):**
```tsx
<header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-lg">
  <nav aria-label={t('mainNavigation')} className="mx-auto flex items-center justify-between gap-4 px-6 py-3 text-sm">
    <Link href="/" className="transition-opacity hover:opacity-80">
      <Image src="/logo_new_all-blue.png" alt="LocalNomad" width={140} height={20} priority unoptimized />
    </Link>
    <div className="flex items-center gap-4">
      <LocaleSwitcher />
      <AuthNav />
    </div>
  </nav>
</header>
```

**Modification:** Add Blog link between logo and the right-side controls:
```tsx
<nav aria-label={t('mainNavigation')} className="mx-auto flex items-center justify-between gap-4 px-6 py-3 text-sm">
  <div className="flex items-center gap-6">
    <Link href="/" className="transition-opacity hover:opacity-80">
      <Image src="/logo_new_all-blue.png" alt="LocalNomad" width={140} height={20} priority unoptimized />
    </Link>
    <Link href="/blog" className="font-medium text-foreground/80 transition-colors hover:text-foreground">
      {t('blog')}
    </Link>
  </div>
  <div className="flex items-center gap-4">
    <LocaleSwitcher />
    <AuthNav />
  </div>
</nav>
```

**Add to `Nav` namespace in messages:** `"blog": "Blog"` (see below)

**In `messages/{locale}.json` (all 5 locale files):**
- Add `"Blog"` namespace:
```json
{
  "Blog": {
    "title": "Blog",
    "allPosts": "All Posts",
    "readMore": "Read more",
    "minuteRead": "min read",
    "publishedOn": "Published on",
    "updatedOn": "Updated on",
    "filterByCategory": "Filter by category",
    "filterByCountry": "Filter by country",
    "noPosts": "No posts found",
    "all": "All",
    "categories": {
      "guides": "Guides",
      "updates": "Updates",
      "tips": "Tips",
      "comparisons": "Comparisons",
      "news": "News",
      "stories": "Stories"
    },
    "countries": {
      "korea": "Korea",
      "japan": "Japan",
      "china": "China",
      "taiwan": "Taiwan",
      "sea": "Southeast Asia",
      "global": "Global"
    }
  }
}
```

**Also add to existing `Nav` namespace in each locale file:**
```json
{
  "Nav": {
    "blog": "Blog",
    ...existing keys
  }
}
```

For non-English locales (ja, zh-cn, zh-tw, vi): translate the Blog namespace values appropriately.

## Step 8: Blog Post Card Component — `components/blog/blog-card.tsx`

Reusable card component for listing pages.

```
Props: post (BlogPost)
```

**Display:**
- Title (linked to post URL)
- Description (2-line clamp)
- Category badge (colored by category)
- Country badge
- Date (formatted) + reading time
- Cover image (if provided, otherwise no image)

**Category badge colors (suggestions — use brand-appropriate tones):**
- guides: `bg-[#1B4965] text-white`
- updates: `bg-amber-100 text-amber-800`
- tips: `bg-emerald-100 text-emerald-800`
- comparisons: `bg-purple-100 text-purple-800`
- news: `bg-blue-100 text-blue-800`
- stories: `bg-rose-100 text-rose-800`

## Step 9: Sitemap & SEO Updates

**`app/sitemap.ts`:**
- Add blog post URLs to existing sitemap generator
- Each post gets an entry with `lastModified` from `updatedAt || date`
- Category listing pages also get sitemap entries

**`app/robots.ts`:**
- Ensure `/blog/` is not blocked (should be crawlable)

**Structured data** (JSON-LD in blog post page `<head>`):
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "datePublished": "2026-03-04",
  "dateModified": "2026-03-04",
  "author": { "@type": "Organization", "name": "LocalNomad" },
  "publisher": { "@type": "Organization", "name": "LocalNomad", "url": "https://localnomad.club" }
}
```

## Step 10: Initial Content — Convert Draft Guides to MDX

Convert the 4 existing draft guides from `docs/agent/reference/draft-guide-*.md` into MDX files:

| Source | Target |
|--------|--------|
| `docs/agent/reference/draft-guide-korea.md` | `content/blog/guides/korea-ultimate-digital-nomad-guide.mdx` |
| `docs/agent/reference/draft-guide-japan.md` | `content/blog/guides/japan-ultimate-digital-nomad-guide.mdx` |
| `docs/agent/reference/draft-guide-china.md` | `content/blog/guides/china-ultimate-digital-nomad-guide.mdx` |
| `docs/agent/reference/draft-guide-taiwan.md` | `content/blog/guides/taiwan-ultimate-digital-nomad-guide.mdx` |

**Conversion tasks per file:**
1. Add frontmatter block at top:
```yaml
---
title: "The Ultimate Digital Nomad Guide to South Korea — 2026 Edition"
description: "Everything you need to know about living and working remotely in South Korea..."
category: guides
country: korea
date: "2026-03-04"
author: "LocalNomad Team"
tags: ["korea", "digital-nomad", "guide", "2026"]
featured: true
draft: false
---
```
2. Replace markdown disclaimer blocks with `<Disclaimer>` components
3. Replace info/tip/warning callouts with `<Callout>` components
4. Replace budget tables with `<BudgetTable>` components where appropriate
5. Ensure all internal links use relative paths that work with the URL structure
6. Keep the References section as standard markdown (no special component needed)

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `components/landing/hero.tsx` | MODIFY | Add Japan/China/SEA CountryCards, grid layout |
| `lib/blog/schema.ts` | CREATE | Zod frontmatter schema + category/country types |
| `lib/blog/index.ts` | CREATE | Blog data loader (getPost, getAllPosts, etc.) |
| `components/blog/mdx-components.tsx` | CREATE | Custom MDX components (BudgetTable, Callout, Disclaimer) |
| `components/blog/blog-card.tsx` | CREATE | Post card for listing pages |
| `components/blog/index.ts` | CREATE | Barrel export |
| `app/[locale]/blog/page.tsx` | CREATE | Blog listing page |
| `app/[locale]/blog/[category]/page.tsx` | CREATE | Category listing page |
| `app/[locale]/blog/[category]/[slug]/page.tsx` | CREATE | Blog post page (MDX render) |
| `app/globals.css` | MODIFY | Add `@tailwindcss/typography` import |
| `app/sitemap.ts` | MODIFY | Add blog URLs |
| `messages/en.json` | MODIFY | Add Blog namespace |
| `messages/ja.json` | MODIFY | Add Blog namespace (translated) |
| `messages/zh-cn.json` | MODIFY | Add Blog namespace (translated) |
| `messages/zh-tw.json` | MODIFY | Add Blog namespace (translated) |
| `messages/vi.json` | MODIFY | Add Blog namespace (translated) |
| `app/[locale]/layout.tsx` | MODIFY | Add Blog link to inline nav |
| `content/blog/guides/*.mdx` | CREATE | 4 guide posts (converted from drafts) |
| `content/blog/{updates,tips,comparisons,news,stories}/` | CREATE | Empty directories for future content |

## Quality Checklist

Before marking Phase 4 complete:

- [ ] `npm install` — all new dependencies install without errors
- [ ] `npm run build` — no build errors (Zod validation catches frontmatter issues)
- [ ] All 4 guide MDX files have valid frontmatter (no Zod errors)
- [ ] `/en/blog` shows all 4 guides with correct cards
- [ ] `/en/blog/guides` shows only guides
- [ ] `/en/blog/guides/korea-ultimate-digital-nomad-guide` renders full MDX content
- [ ] Custom components (Callout, Disclaimer, BudgetTable) render correctly in posts
- [ ] Typography styles look good (prose classes applied)
- [ ] Navigation includes Blog link
- [ ] Category/country badges display correctly
- [ ] All 5 locale message files have Blog namespace
- [ ] Sitemap includes blog URLs
- [ ] `npm run lint` passes
- [ ] Draft posts (draft: true) are excluded in production build

## Gen 검증 포인트

Phase 4 실행 후 Gen님이 직접 확인해야 할 사항:

1. **`npm run dev` → `/en`** 홈페이지 접속하여 5개국 카드 확인
   - Korea, Japan, China, Taiwan, SEA 카드 5개가 모두 표시되는지
   - 각 카드 클릭 시 해당 국가 페이지로 이동하는지
   - 모바일/태블릿/데스크톱에서 그리드 레이아웃이 자연스러운지
2. **`npm run dev` → `/en/blog`** 접속하여 리스팅 페이지 확인
   - 4개 가이드가 카드 형태로 표시되는지
   - 카테고리/국가 필터가 작동하는지
2. **가이드 하나 클릭** → 본문이 올바르게 렌더링되는지
   - Callout, Disclaimer, BudgetTable 컴포넌트가 보이는지
   - 링크 색상이 브랜드 컬러(#1B4965)인지
3. **내비게이션** → Blog 링크가 추가되었는지
4. **`npm run build`** → 빌드 에러 없이 통과하는지
5. **SEO 확인** → 페이지 소스에서 JSON-LD 구조화 데이터가 있는지
