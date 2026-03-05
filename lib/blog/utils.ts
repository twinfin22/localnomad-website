import type { TocHeading } from '@/components/blog/blog-toc';

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

/** Returns a function that produces unique slugs by appending -1, -2, etc. for duplicates. */
export const createSlugTracker = () => {
  const counts = new Map<string, number>();
  return (text: string): string => {
    const base = slugify(text);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
};

/** Extract h2 and h3 headings from raw markdown for ToC */
export const extractHeadings = (markdown: string): TocHeading[] => {
  const headings: TocHeading[] = [];
  const uniqueSlug = createSlugTracker();
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+\**(.+?)\**\s*$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, '').trim();
      headings.push({ id: uniqueSlug(text), text, level });
    }
  }

  return headings;
};
