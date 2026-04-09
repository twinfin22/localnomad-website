import Image from 'next/image';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { BlogPost } from '@/lib/blog';
import type { BlogCategory } from '@/lib/blog/schema';

const CATEGORY_COLORS: Record<BlogCategory, string> = {
  guides: 'bg-[#1B4965] text-white',
  updates: 'bg-amber-100 text-amber-800',
  tips: 'bg-emerald-100 text-emerald-800',
  comparisons: 'bg-purple-100 text-purple-800',
  news: 'bg-blue-100 text-blue-800',
  stories: 'bg-rose-100 text-rose-800',
  tax: 'bg-teal-100 text-teal-800',
};

export const BlogCard = async ({ post, priority }: { post: BlogPost; priority?: boolean }) => {
  const [t, locale] = await Promise.all([
    getTranslations('Blog'),
    getLocale(),
  ]);
  const categoryColor = CATEGORY_COLORS[post.category];

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <Link href={`/blog/${post.category}/${post.slug}`} className="block">
        {post.frontmatter.coverImage && (
          <div className="relative aspect-[2/1] w-full overflow-hidden">
            <Image
              src={post.frontmatter.coverImage}
              alt={post.frontmatter.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </Link>
      <div className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor}`}
          >
            {t(`categories.${post.category}`)}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {post.frontmatter.country}
          </span>
        </div>
        <Link
          href={`/blog/${post.category}/${post.slug}`}
          className="block"
        >
          <h3 className="font-lora text-lg font-bold text-foreground transition-colors group-hover:text-primary">
            {post.frontmatter.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {post.frontmatter.description}
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <time dateTime={post.frontmatter.date}>
            {new Date(post.frontmatter.date).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>
          <span>&middot;</span>
          <span>{post.readingTime} {t('minuteRead')}</span>
        </div>
      </div>
    </article>
  );
};
