import { getAvailableLocalesForPost } from '@/lib/blog';
import type { CountryChecklist } from '@/lib/types/checklist';

interface LocalizedLink {
  href: string;
  language?: 'en';
}

function localizeBlogLink(href: string, locale: string): LocalizedLink {
  if (locale === 'en' || !href.startsWith('/en/blog/')) return { href };

  const match = href.match(/^\/en\/blog\/([^/]+)\/([^/?#]+)(.*)$/);
  if (!match) return { href, language: 'en' };

  const [, category, slug, suffix] = match;
  const locales = getAvailableLocalesForPost(category, slug);
  return locales.includes(locale)
    ? { href: `/${locale}/blog/${category}/${slug}${suffix}` }
    : { href, language: 'en' };
}

export function localizeChecklistLinks(
  checklist: CountryChecklist,
  locale: string,
): CountryChecklist {
  const blog = localizeBlogLink(checklist.blogUrl, locale);

  return {
    ...checklist,
    blogUrl: blog.href,
    ...(blog.language ? { blogUrlLanguage: blog.language } : {}),
    phases: checklist.phases.map((phase) => ({
      ...phase,
      items: phase.items.map((item) => {
        if (!item.link) return item;
        const link = localizeBlogLink(item.link, locale);
        return {
          ...item,
          link: link.href,
          ...(link.language ? { linkLanguage: link.language } : {}),
        };
      }),
    })),
  };
}
