// =============================================================================
// i18n + Multi-Country Configuration
// =============================================================================

/**
 * Supported languages
 * - en: English (default, no URL prefix)
 * - ja: Japanese
 * - zh-tw: Traditional Chinese
 */
export const locales = ["en", "ja", "zh-tw"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/**
 * Supported countries
 * - korea: South Korea (launch country)
 * - taiwan: Taiwan (future)
 */
export const countries = ["korea", "taiwan"] as const;
export type Country = (typeof countries)[number];
export const defaultCountry: Country = "korea";

/**
 * Which languages are available for each country
 */
export const countryLocales: Record<Country, readonly Locale[]> = {
  korea: ["en", "ja", "zh-tw"],
  taiwan: ["en", "zh-tw"], // No Japanese for Taiwan
};

/**
 * Display names for locales (in their native language)
 */
export const localeNames: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  "zh-tw": "繁體中文",
};

/**
 * Display names for countries (per locale)
 */
export const countryNames: Record<Country, Record<Locale, string>> = {
  korea: {
    en: "South Korea",
    ja: "韓国",
    "zh-tw": "韓國",
  },
  taiwan: {
    en: "Taiwan",
    ja: "台湾",
    "zh-tw": "台灣",
  },
};

/**
 * Country flags (emoji)
 */
export const countryFlags: Record<Country, string> = {
  korea: "🇰🇷",
  taiwan: "🇹🇼",
};

/**
 * hreflang values (ISO format for SEO)
 * Note: zh-tw uses zh-Hant-TW in hreflang
 */
export const localeHreflang: Record<Locale, string> = {
  en: "en",
  ja: "ja",
  "zh-tw": "zh-Hant-TW",
};

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

/**
 * Check if a string is a valid country
 */
export function isValidCountry(value: string): value is Country {
  return countries.includes(value as Country);
}

/**
 * Check if a locale is available for a country
 */
export function isLocaleAvailableForCountry(
  locale: Locale,
  country: Country
): boolean {
  return countryLocales[country].includes(locale);
}

/**
 * Get locale from string or default
 */
export function getLocale(locale?: string): Locale {
  if (locale && isValidLocale(locale)) {
    return locale;
  }
  return defaultLocale;
}

/**
 * Get country from string or default
 */
export function getCountry(country?: string): Country {
  if (country && isValidCountry(country)) {
    return country;
  }
  return defaultCountry;
}

// =============================================================================
// URL Building Helpers
// =============================================================================

/**
 * Build a locale-aware URL path
 * English URLs have no prefix, other locales get /{locale}/...
 */
export function buildLocalePath(
  path: string,
  locale: Locale,
  country?: Country
): string {
  const countrySegment = country ? `/${country}` : "";
  const pathSegment = path.startsWith("/") ? path : `/${path}`;

  if (locale === defaultLocale) {
    return `${countrySegment}${pathSegment}`;
  }
  return `/${locale}${countrySegment}${pathSegment}`;
}

/**
 * Parse a URL path to extract locale and country
 */
export function parseLocalePath(pathname: string): {
  locale: Locale;
  country: Country | null;
  path: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  let locale: Locale = defaultLocale;
  let country: Country | null = null;
  let pathStart = 0;

  // Check if first segment is a locale
  if (segments[0] && isValidLocale(segments[0])) {
    locale = segments[0] as Locale;
    pathStart = 1;
  }

  // Check if next segment is a country
  const countryIndex = pathStart;
  if (segments[countryIndex] && isValidCountry(segments[countryIndex])) {
    country = segments[countryIndex] as Country;
    pathStart = countryIndex + 1;
  }

  const path = "/" + segments.slice(pathStart).join("/");

  return { locale, country, path };
}

// =============================================================================
// Date Locale Helpers
// =============================================================================

/**
 * Map app locale to BCP 47 date locale string
 */
export const dateLocaleMap: Record<Locale, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  'zh-tw': 'zh-TW',
};

export function toDateLocale(locale: Locale): string {
  return dateLocaleMap[locale] ?? 'en-US';
}
