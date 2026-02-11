// =============================================================================
// i18n Configuration
// =============================================================================

export const locales = ["en", "fr", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  zh: "中文",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  fr: "🇫🇷",
  zh: "🇨🇳",
};

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
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
