import { Suspense } from 'react';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { getAllPosts } from '@/lib/blog';
import type { BlogCategory, BlogCountry } from '@/lib/blog/schema';
import { BLOG_CATEGORIES, BLOG_COUNTRIES } from '@/lib/blog/schema';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogFilters } from '@/components/blog/blog-filters';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; country?: string }>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const alternates = getAlternates(locale, '/blog');

  return {
    title: 'Digital Nomad Blog — Visa Guides & Travel Tips | LocalNomad',
    description:
      'Digital nomad guides, visa updates, and travel tips for Korea, Japan, Taiwan, and Southeast Asia.',
    alternates,
    openGraph: {
      title: 'Digital Nomad Blog — Visa Guides & Travel Tips | LocalNomad',
      description:
        'Digital nomad guides, visa updates, and travel tips for Korea, Japan, Taiwan, and Southeast Asia.',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og-default.png'],
    },
  };
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  const sp = await searchParams;
  const categoryFilter =
    sp.category && BLOG_CATEGORIES.includes(sp.category as BlogCategory)
      ? (sp.category as BlogCategory)
      : undefined;
  const countryFilter =
    sp.country && BLOG_COUNTRIES.includes(sp.country as BlogCountry)
      ? (sp.country as BlogCountry)
      : undefined;

  const posts = getAllPosts({
    category: categoryFilter,
    country: countryFilter,
  });

  const t = await getTranslations('Blog');

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-lora text-3xl font-bold text-foreground sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Digital nomad guides, visa updates, and travel tips.
      </p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <BlogFilters />
        </Suspense>
      </div>

      <h2 className="sr-only">Posts</h2>

      {posts.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          {t('noPosts')}
        </p>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <BlogCard key={`${post.category}/${post.slug}`} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
