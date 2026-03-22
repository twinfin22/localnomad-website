import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getAllPosts } from '@/lib/blog';
import type { BlogCategory, BlogCountry } from '@/lib/blog/schema';

interface CountryBlogSectionProps {
  country: string;
  displayName: string;
}

const CATEGORY_COLORS: Record<BlogCategory, string> = {
  guides: 'bg-primary/10 text-primary',
  updates: 'bg-amber-100 text-amber-800',
  tips: 'bg-emerald-100 text-emerald-800',
  comparisons: 'bg-purple-100 text-purple-800',
  news: 'bg-blue-100 text-blue-800',
  stories: 'bg-rose-100 text-rose-800',
};

export function CountryBlogSection({
  country,
  displayName,
}: CountryBlogSectionProps) {
  const posts = getAllPosts({ country: country as BlogCountry, limit: 3 });

  if (posts.length === 0) return null;

  return (
    <section className="bg-white px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-lora text-2xl font-bold text-primary sm:text-3xl">
          From the Blog
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Guides, tips, and updates for {displayName}
        </p>

        {/* Blog cards grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={`${post.category}/${post.slug}`}
              href={`/blog/${post.category}/${post.slug}`}
              className="group"
            >
              <div className="rounded-xl border bg-white overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer h-full">
                {/* Cover image */}
                <div className="h-36 overflow-hidden bg-neutral-100 sm:h-40">
                  {post.frontmatter.coverImage ? (
                    <img
                      src={post.frontmatter.coverImage}
                      alt={post.frontmatter.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-neutral-100" />
                  )}
                </div>

                {/* Card content */}
                <div className="p-4">
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}
                  >
                    {post.category}
                  </span>
                  <h3 className="mt-2 font-semibold text-sm leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {post.frontmatter.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {post.readingTime} min read
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Read all {displayName} articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
