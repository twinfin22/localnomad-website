import type { MetadataRoute } from "next";
import {
  countries,
  countryLocales,
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

const BASE_URL = "https://localnomad.club";

/**
 * Data-backed visa types per country.
 * Only include types that have actual JSON data files (not stubs).
 */
const SITEMAP_VISA_TYPES: Record<Country, string[]> = {
  korea: [
    "e-7", "f-1-d", "d-2", "d-10", "h-1", "f-2",
    "e-2", "d-7", "d-8", "f-6", "f-4", "d-4",
  ],
  taiwan: ["dnv", "gold-card", "work-arc", "visitor"],
};

const buildUrl = (path: string, locale: Locale, country: Country): string =>
  `${BASE_URL}${buildLocalePath(path, locale, country)}`;

const buildCountryHomeUrl = (locale: Locale, country: Country): string => {
  if (locale === "en") return `${BASE_URL}/${country}`;
  return `${BASE_URL}/${locale}/${country}`;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // ─── Country home pages ───
  for (const country of countries) {
    for (const locale of countryLocales[country]) {
      entries.push({
        url: buildCountryHomeUrl(locale, country),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1.0,
      });
    }
  }

  // ─── Visa landing pages ───
  for (const country of countries) {
    for (const locale of countryLocales[country]) {
      entries.push({
        url: buildUrl("/visa", locale, country),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1.0,
      });
    }
  }

  // ─── Visa detail pages ───
  for (const country of countries) {
    const visaTypes = SITEMAP_VISA_TYPES[country];
    for (const locale of countryLocales[country]) {
      for (const type of visaTypes) {
        entries.push({
          url: buildUrl(`/visa/${type}`, locale, country),
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  }

  // ─── Visa tools (find, compare, path, checklist, dashboard) ───
  const visaTools = ["find", "compare", "path", "checklist", "dashboard"];
  for (const country of countries) {
    for (const locale of countryLocales[country]) {
      for (const tool of visaTools) {
        entries.push({
          url: buildUrl(`/visa/${tool}`, locale, country),
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  // ─── Static pages (not locale-prefixed) ───
  const staticPages = [
    { path: "/business", priority: 0.5 as const },
    { path: "/privacy", priority: 0.3 as const },
    { path: "/terms", priority: 0.3 as const },
    { path: "/refund", priority: 0.3 as const },
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${BASE_URL}${page.path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: page.priority,
    });
  }

  return entries;
}
