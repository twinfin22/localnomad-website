const BCP47_MAP: Record<string, string> = {
  en: 'en',
  ja: 'ja',
  'zh-cn': 'zh-Hans',
  'zh-tw': 'zh-Hant',
  vi: 'vi',
};

export function getAlternates(locale: string, pathname: string = '') {
  const base = 'https://localnomad.club';
  const languages: Record<string, string> = {};
  for (const [loc, bcp47] of Object.entries(BCP47_MAP)) {
    languages[bcp47] = `${base}/${loc}${pathname}`;
  }
  languages['x-default'] = `${base}/en${pathname}`;
  return { canonical: `${base}/${locale}${pathname}`, languages };
}

export const DEFAULT_OG_IMAGE = { url: '/og-default.png', width: 1200, height: 630 };
