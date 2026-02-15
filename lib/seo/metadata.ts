import type { Metadata } from "next";
import {
  buildLocalePath,
  countryLocales,
  localeHreflang,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

const BASE_URL = "https://localnomad.club";

/**
 * Generate hreflang alternates for a given page.
 * Returns canonical + language alternates for all locales available in that country.
 */
export function generateAlternates({
  path,
  locale,
  country,
}: {
  path: string;
  locale: Locale;
  country: Country;
}): Metadata["alternates"] {
  const canonical = `${BASE_URL}${buildLocalePath(path, locale, country)}`;

  const availableLocales = countryLocales[country];
  const languages: Record<string, string> = {};

  for (const loc of availableLocales) {
    const hreflang = localeHreflang[loc];
    languages[hreflang] = `${BASE_URL}${buildLocalePath(path, loc, country)}`;
  }

  // x-default points to English (default locale)
  languages["x-default"] = `${BASE_URL}${buildLocalePath(path, "en", country)}`;

  return { canonical, languages };
}
