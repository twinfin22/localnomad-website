'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { BlogCategory } from '@/lib/blog/schema';

const CATEGORY_COLORS: Record<BlogCategory, string> = {
  guides: 'bg-primary text-white',
  updates: 'bg-amber-100 text-amber-800',
  tips: 'bg-emerald-100 text-emerald-800',
  comparisons: 'bg-purple-100 text-purple-800',
  news: 'bg-blue-100 text-blue-800',
  stories: 'bg-rose-100 text-rose-800',
};

const COUNTRY_EMOJI: Record<string, string> = {
  korea: '\uD83C\uDDF0\uD83C\uDDF7',
  japan: '\uD83C\uDDEF\uD83C\uDDF5',
  china: '\uD83C\uDDE8\uD83C\uDDF3',
  taiwan: '\uD83C\uDDF9\uD83C\uDDFC',
  sea: '\uD83C\uDF0F',
  global: '\uD83C\uDF10',
};

interface RelatedPost {
  slug: string;
  category: BlogCategory;
  title: string;
  description: string;
  coverImage?: string;
  country: string;
  date: string;
  readingTime: number;
}

export const RelatedPosts = ({ posts }: { posts: RelatedPost[] }) => {
  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = document.getElementById('related-posts-carousel');
    if (!container) return;
    container.scrollBy({
      left: direction === 'left' ? -360 : 360,
      behavior: 'smooth',
    });
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border/40 pt-12">
      <h2 className="font-lora text-2xl font-bold text-foreground">
        Related Articles
      </h2>

      <div className="relative mt-6">
        {posts.length > 2 && (
          <>
            <button
              onClick={() => scroll('left')}
              className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border bg-white p-2 shadow-md transition-all hover:shadow-lg sm:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border bg-white p-2 shadow-md transition-all hover:shadow-lg sm:flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </>
        )}

        <div
          id="related-posts-carousel"
          className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 sm:mx-0 sm:px-0 scroll-smooth"
        >
          {posts.map((post) => (
            <article
              key={`${post.category}/${post.slug}`}
              className="group w-[280px] shrink-0 snap-start sm:w-[300px]"
            >
              <Link
                href={`/blog/${post.category}/${post.slug}`}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
              >
                {post.coverImage ? (
                  <div className="relative aspect-[2/1] w-full overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 280px, 300px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary to-primary-light" />
                )}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${CATEGORY_COLORS[post.category]}`}
                    >
                      {post.category}
                    </span>
                    <span className="text-sm" aria-hidden="true">
                      {COUNTRY_EMOJI[post.country] ?? ''}
                    </span>
                  </div>
                  <h3 className="mt-2.5 font-lora text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5 text-xs text-muted-foreground">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
