import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { getAllPosts } from '@/lib/blog';
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/blog/schema';
import { BlogCard } from '@/components/blog/blog-card';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string; category: string }>;
}

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category }));
}

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  guides: {
    title: 'Visa & Relocation Guides | LocalNomad Blog',
    description: 'Step-by-step visa application guides for Korea, Japan, and Taiwan. Documents, timelines, costs, and insider tips for digital nomads.',
  },
  updates: {
    title: 'Visa Policy Updates | LocalNomad Blog',
    description: 'Latest visa policy changes and immigration updates for Korea, Japan, and Taiwan. Stay current on rules that affect your stay.',
  },
  tips: {
    title: 'Living Abroad Tips | LocalNomad Blog',
    description: 'Practical tips for daily life as a foreigner in Korea, Japan, and Taiwan. Banking, housing, healthcare, and local know-how.',
  },
  comparisons: {
    title: 'Visa & Country Comparisons | LocalNomad Blog',
    description: 'Side-by-side visa comparisons across Korea, Japan, and Taiwan. Find the best visa type and destination for your situation.',
  },
  news: {
    title: 'Digital Nomad News — East Asia | LocalNomad Blog',
    description: 'News and developments for remote workers in Korea, Japan, and Taiwan. Policy shifts, community events, and market trends.',
  },
  stories: {
    title: 'Nomad Stories | LocalNomad Blog',
    description: 'Real experiences from digital nomads and expats living in Korea, Japan, and Taiwan. Lessons learned and honest takes.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  const meta = CATEGORY_META[category];
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  const fallbackTitle = `Digital Nomad ${label} | LocalNomad Blog`;
  const fallbackDesc = `Browse digital nomad ${category} — visa information, travel tips, and community stories.`;
  const title = meta?.title ?? fallbackTitle;
  const description = meta?.description ?? fallbackDesc;
  const alternates = getAlternates(locale, `/blog/${category}`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og-default.png'],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  if (!BLOG_CATEGORIES.includes(category as BlogCategory)) {
    notFound();
  }

  const posts = getAllPosts({ category: category as BlogCategory });
  const label = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-lora text-3xl font-bold text-foreground sm:text-4xl">
        {label}
      </h1>
      <p className="mt-2 text-muted-foreground">
        All posts in {category}.
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          No posts found in this category.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <BlogCard key={`${post.category}/${post.slug}`} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
