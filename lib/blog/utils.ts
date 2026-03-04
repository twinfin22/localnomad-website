import type { TocHeading } from '@/components/blog/blog-toc';

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

/** Extract h2 and h3 headings from raw markdown for ToC */
export const extractHeadings = (markdown: string): TocHeading[] => {
  const headings: TocHeading[] = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+\**(.+?)\**\s*$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, '').trim();
      headings.push({ id: slugify(text), text, level });
    }
  }

  return headings;
};
