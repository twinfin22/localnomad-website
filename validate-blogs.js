const fs = require('fs');
const matter = require('gray-matter');
const { z } = require('zod');

const BLOG_CATEGORIES = ['guides', 'updates', 'tips', 'comparisons', 'news', 'stories'];
const BLOG_COUNTRIES = ['korea', 'japan', 'china', 'taiwan', 'sea', 'global'];
const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  category: z.enum(BLOG_CATEGORIES),
  country: z.enum(BLOG_COUNTRIES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  author: z.string().default('LocalNomad Team'),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  coverImage: z.string().optional(),
  readingTime: z.number().optional(),
});

const BANNED = /\b(delve|crucial|landscape|tapestry|multifaceted|testament|meticulous|meticulously|pivotal|underscore|underscores|underscoring|vibrant|intricate|intricacies|interplay|garner|enduring|bolstered|boasts|showcasing|fostering|furthermore|moreover|notably|embark|spearhead|endeavor)\b/gi;

const files = [
  'content/blog/news/korea-2026-immigration-overhaul.mdx',
  'content/blog/guides/korea-f1d-workation-visa-2026.mdx',
  'content/blog/news/taiwan-gold-card-2026-changes.mdx',
  'content/blog/comparisons/japan-korea-taiwan-digital-nomad-visa-2026.mdx',
  'content/blog/tips/183-day-tax-trap-digital-nomads.mdx',
  'content/blog/guides/japan-housing-digital-nomads-2026.mdx',
  'content/blog/comparisons/seoul-vs-tokyo-cost-of-living-2026.mdx',
];

const dir = '/sessions/clever-eloquent-clarke/mnt/b2c-website';

for (const file of files) {
  const raw = fs.readFileSync(dir + '/' + file, 'utf-8');
  const { data, content } = matter(raw);
  const result = schema.safeParse(data);
  const words = content.trim().split(/\s+/).length;
  const titleLen = (data.title || '').length;
  const matches = content.match(BANNED);
  const slug = file.split('/').pop().replace('.mdx', '');

  const status = result.success ? 'PASS' : 'FAIL';
  const aiStatus = matches
    ? 'WARN ' + matches.length + ' banned: ' + [...new Set(matches.map(m => m.toLowerCase()))].join(', ')
    : 'CLEAN';

  console.log(status, slug);
  console.log('  Title:', titleLen, 'chars |', words, 'words | AI:', aiStatus);
  console.log('  ->', data.title);
  if (!result.success) {
    result.error.issues.forEach(i => console.log('  ERR', i.path.join('.'), ':', i.message));
  }
  console.log('');
}
