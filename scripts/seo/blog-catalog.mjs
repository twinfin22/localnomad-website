import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import matter from 'gray-matter';
import { languageForPath, normalisePath } from './analytics-common.mjs';

const LOCALE_DIRS = new Set(['ja', 'zh-cn']);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.name.endsWith('.mdx') ? [path] : [];
  });
}

// Keep this in sync with next.config.ts redirects(). The report explicitly
// labels it as configured redirects, not observed redirect traffic.
const TAX_REDIRECT_SLUGS = new Set([
  'korea-double-tax-treaty-guide-2026',
  'korea-freelancer-tax-filing-guide-2026',
  'korea-5-year-rule-foreign-income-tax-2026',
  'korea-crypto-tax-2027-digital-nomads',
  '183-day-tax-trap-digital-nomads',
  'digital-nomad-tax-southeast-asia-2026',
  'leaving-korea-money-checklist-2026',
]);

export function readBlogCatalog(contentDir = join(process.cwd(), 'content', 'blog')) {
  const byPath = new Map();
  for (const file of walk(contentDir)) {
    const rel = relative(contentDir, file).split(sep);
    const [maybeLocale, maybeCategory, maybeFile] = rel;
    const isTranslation = LOCALE_DIRS.has(maybeLocale);
    const locale = isTranslation ? maybeLocale : 'en';
    const category = isTranslation ? maybeCategory : maybeLocale;
    const filename = isTranslation ? maybeFile : maybeCategory;
    const slug = filename.replace(/\.mdx$/, '');
    const { data } = matter(readFileSync(file, 'utf8'));
    const path = `/${locale}/blog/${category}/${slug}`;
    byPath.set(path, {
      path,
      language: locale,
      contentKind: isTranslation ? 'translation' : 'original',
      category,
      slug,
      publishedAt: data.date ?? null,
      updatedAt: data.updatedAt ?? null,
      draft: data.draft === true,
    });
  }
  return byPath;
}

export function configuredRedirect(pathname) {
  const path = normalisePath(pathname);
  const match = path.match(/^\/(en|ja|zh-cn)\/blog\/(guides|tips)\/([^/]+)\/?$/);
  if (match && TAX_REDIRECT_SLUGS.has(match[3])) {
    return { configured: true, destination: `/${match[1]}/blog/tax/${match[3]}`, permanent: true };
  }
  if (path.startsWith('/vi/')) {
    return { configured: true, destination: path.replace(/^\/vi\//, '/en/'), permanent: true };
  }
  return { configured: false, destination: null, permanent: null };
}

export function enrichBlogPath(pathname, catalog) {
  const path = normalisePath(pathname);
  const entry = catalog.get(path);
  return {
    path,
    language: entry?.language ?? languageForPath(path),
    contentKind: entry?.contentKind ?? 'unmatched',
    publishedAt: entry?.publishedAt ?? null,
    updatedAt: entry?.updatedAt ?? null,
    draft: entry?.draft ?? null,
    redirect: configuredRedirect(path),
  };
}
