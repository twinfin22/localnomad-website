import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  const t = await getTranslations({ locale: locale as (typeof routing.locales)[number], namespace: 'Blog' });
  const isKnownCategory = BLOG_CATEGORIES.includes(category as BlogCategory);
  const bc = category as BlogCategory;
  const categoryLabel = isKnownCategory ? t(`categories.${bc}`) : category.charAt(0).toUpperCase() + category.slice(1);
  const title = isKnownCategory ? t(`categoryMeta.${bc}.title`) : `Digital Nomad ${categoryLabel} | LocalNomad Blog`;
  const description = isKnownCategory ? t(`categoryMeta.${bc}.description`) : `Browse digital nomad ${category} — visa information, travel tips, and community stories.`;
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

  const t = await getTranslations('Blog');
  const posts = getAllPosts({ category: category as BlogCategory });
  const categoryLabel = t(`categories.${category as BlogCategory}`);

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-lora text-3xl font-bold text-foreground sm:text-4xl">
        {categoryLabel}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {t('allPostsIn', { category: categoryLabel })}
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          {t('noPostsInCategory')}
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {posts.map((post, index) => (
            <BlogCard key={`${post.category}/${post.slug}`} post={post} priority={index < 3} />
          ))}
        </div>
      )}
    </main>
  );
}
