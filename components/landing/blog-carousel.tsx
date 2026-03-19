import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAllPosts } from '@/lib/blog';
import { ArrowRight } from 'lucide-react';
import type { BlogCategory } from '@/lib/blog/schema';
import { BlogCarouselScrollButtons } from './blog-carousel-scroll';
import Image from 'next/image';

const CATEGORY_COLORS: Record<BlogCategory, string> = {
  guides: 'bg-primary text-white',
  updates: 'bg-amber-100 text-amber-800',
  tips: 'bg-emerald-100 text-emerald-800',
  comparisons: 'bg-purple-100 text-purple-800',
  news: 'bg-blue-100 text-blue-800',
  stories: 'bg-rose-100 text-rose-800',
};

const CATEGORY_GRADIENT_COLORS: Record<BlogCategory, string> = {
  guides: 'bg-gradient-to-r from-primary to-primary-light',
  updates: 'bg-gradient-to-r from-amber-400 to-amber-300',
  tips: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
  comparisons: 'bg-gradient-to-r from-purple-500 to-purple-400',
  news: 'bg-gradient-to-r from-blue-500 to-blue-400',
  stories: 'bg-gradient-to-r from-rose-500 to-rose-400',
};

const COUNTRY_EMOJI: Record<string, string> = {
  korea: '\uD83C\uDDF0\uD83C\uDDF7',
  japan: '\uD83C\uDDEF\uD83C\uDDF5',
  china: '\uD83C\uDDE8\uD83C\uDDF3',
  taiwan: '\uD83C\uDDF9\uD83C\uDDFC',
  sea: '\uD83C\uDF0F',
  global: '\uD83C\uDF10',
};

export const BlogCarousel = async () => {
  const t = await getTranslations('Landing');
  const posts = getAllPosts({ limit: 8 });

  if (posts.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-neutral-50 px-6 py-20 sm:py-28">
      {/* Decorative background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1B4965 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-lora text-3xl font-bold text-primary sm:text-4xl">
              {t('blogTitle')}
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              {t('blogSubtitle')}
            </p>
          </div>
          <Link
            href="/blog"
            className="group hidden items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:inline-flex"
          >
            {t('blogViewAll')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Scrollable carousel */}
        <div className="relative mt-10">
        <BlogCarouselScrollButtons />
        <div id="blog-carousel" className="blog-carousel -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 sm:mx-0 sm:px-0 scroll-smooth">
          {posts.map((post) => (
            <article
              key={`${post.category}/${post.slug}`}
              className="group w-[300px] shrink-0 snap-start sm:w-[340px]"
            >
              <Link
                href={`/blog/${post.category}/${post.slug}`}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Cover image or gradient strip fallback */}
                {post.frontmatter.coverImage ? (
                  <div className="relative aspect-[2/1] w-full overflow-hidden">
                    <Image
                      src={post.frontmatter.coverImage}
                      alt={post.frontmatter.title}
                      fill
                      sizes="(max-width: 640px) 300px, 340px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div
                    className={`h-1.5 w-full ${CATEGORY_GRADIENT_COLORS[post.category]}`}
                  />
                )}
                <div className="flex flex-1 flex-col p-5">
                {/* Category + country row */}
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${CATEGORY_COLORS[post.category]}`}
                  >
                    {post.category}
                  </span>
                  <span className="text-sm" aria-hidden="true">
                    {COUNTRY_EMOJI[post.frontmatter.country] ?? ''}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-3 font-lora text-[17px] font-bold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2">
                  {post.frontmatter.title}
                </h3>

                {/* Description */}
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {post.frontmatter.description}
                </p>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                  <time dateTime={post.frontmatter.date}>
                    {new Date(post.frontmatter.date).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </time>
                  <span className="flex items-center gap-1">
                    {post.readingTime} min read
                  </span>
                </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
        </div>

        {/* Mobile "View all" link */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            {t('blogViewAll')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
