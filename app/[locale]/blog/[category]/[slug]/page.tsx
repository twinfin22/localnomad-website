import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { routing } from '@/i18n/routing';
import { getPost, getAllPostSlugs } from '@/lib/blog';
import { extractHeadings } from '@/lib/blog/utils';
import { createMdxComponents } from '@/components/blog/mdx-components';
import { BlogToc } from '@/components/blog/blog-toc';

interface Props {
  params: Promise<{ locale: string; category: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllPostSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const post = getPost(category, slug);

  if (!post) return {};

  return {
    title: `${post.frontmatter.title} | LocalNomad Blog`,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: 'article',
      publishedTime: post.frontmatter.date,
      modifiedTime: post.frontmatter.updatedAt ?? post.frontmatter.date,
      authors: [post.frontmatter.author],
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
        <header className="mb-10">
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
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{post.frontmatter.author}</span>
            <span>&middot;</span>
            <time dateTime={post.frontmatter.date}>
              {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {post.frontmatter.updatedAt && (
              <>
                <span>&middot;</span>
                <span>
                  Updated{' '}
                  {new Date(post.frontmatter.updatedAt).toLocaleDateString(
                    'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' },
                  )}
                </span>
              </>
            )}
            <span>&middot;</span>
            <span>{post.readingTime} min read</span>
          </div>
        </header>

        <article className="prose prose-lg max-w-none prose-headings:font-lora prose-headings:text-foreground prose-a:text-[#1B4965]">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{ blockJS: false }}
          />
        </article>
      </main>
    </>
  );
}
