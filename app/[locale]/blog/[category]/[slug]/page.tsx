import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { routing } from '@/i18n/routing';
import { getAlternates } from '@/lib/seo';
import { getPost, getAllPostSlugs, getRelatedPosts } from '@/lib/blog';
import { extractHeadings } from '@/lib/blog/utils';
import { createMdxComponents } from '@/components/blog/mdx-components';
import { BlogToc } from '@/components/blog/blog-toc';
import { RelatedPosts } from '@/components/blog/related-posts';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string; category: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllPostSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const post = getPost(category, slug);

  if (!post) return {};

  const alternates = getAlternates(locale, `/blog/${category}/${slug}`);

  return {
    title: `${post.frontmatter.title} | LocalNomad Blog`,
    description: post.frontmatter.description,
    alternates,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: 'article',
      publishedTime: post.frontmatter.date,
      modifiedTime: post.frontmatter.updatedAt ?? post.frontmatter.date,
      authors: [post.frontmatter.author],
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, category, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  const post = getPost(category, slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    image: post.frontmatter.coverImage
      ? `https://localnomad.club${post.frontmatter.coverImage}`
      : 'https://localnomad.club/og-default.png',
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.updatedAt ?? post.frontmatter.date,
    author: {
      '@type': 'Organization',
      name: post.frontmatter.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LocalNomad',
      url: 'https://localnomad.club',
      logo: {
        '@type': 'ImageObject',
        url: 'https://localnomad.club/logo_new_all-blue.png',
      },
    },
  };

  const headings = extractHeadings(post.content);
  const mdxComponents = createMdxComponents();

  return (
    <>
      <BlogToc headings={headings} />
      <main id="main-content" className="max-w-3xl px-6 py-12 md:ml-[200px] lg:ml-[240px] md:mr-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className="mb-12">
          {post.frontmatter.coverImage && (
            <div className="relative -mx-6 mb-8 overflow-hidden rounded-2xl sm:-mx-0">
              <Image
                src={post.frontmatter.coverImage}
                alt={post.frontmatter.title}
                width={960}
                height={480}
                sizes="(max-width: 768px) 100vw, 768px"
                className="w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    {post.category}
                  </span>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    {post.frontmatter.country}
                  </span>
                </div>
                <h1 className="font-lora text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.2)' }}>
                  {post.frontmatter.title}
                </h1>
              </div>
            </div>
          )}
          {!post.frontmatter.coverImage && (
            <>
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-[#1B4965] px-2.5 py-0.5 text-xs font-medium text-white">
                  {post.category}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {post.frontmatter.country}
                </span>
              </div>
              <h1 className="font-lora text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                {post.frontmatter.title}
              </h1>
            </>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{post.frontmatter.author}</span>
            <span className="text-gray-300">/</span>
            <time dateTime={post.frontmatter.date}>
              {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
            {post.frontmatter.updatedAt && (
              <>
                <span className="text-gray-300">/</span>
                <span>
                  Updated{' '}
                  {new Date(post.frontmatter.updatedAt).toLocaleDateString(
                    'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' },
                  )}
                </span>
              </>
            )}
            <span className="text-gray-300">/</span>
            <span>{post.readingTime} min read</span>
          </div>
        </header>

        <article className="prose prose-lg max-w-none prose-headings:font-lora prose-headings:text-foreground prose-a:text-primary">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: { remarkPlugins: [remarkGfm] },
              blockJS: false,
            }}
          />
        </article>

        {(() => {
          const related = getRelatedPosts(
            slug,
            post.category,
            post.frontmatter.country,
            post.frontmatter.tags,
          );
          if (related.length === 0) return null;
          return (
            <RelatedPosts
              posts={related.map((r) => ({
                slug: r.slug,
                category: r.category,
                title: r.frontmatter.title,
                description: r.frontmatter.description,
                coverImage: r.frontmatter.coverImage,
                country: r.frontmatter.country,
                date: r.frontmatter.date,
                readingTime: r.readingTime,
              }))}
            />
          );
        })()}
      </main>
    </>
  );
}
