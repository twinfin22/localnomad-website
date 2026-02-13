import type {
  VisaInfo,
  VisaType,
  KoreaVisaType,
  TaiwanVisaType,
  Locale,
  VisaChecklist,
} from "./types";
import { KOREA_VISA_TYPES, TAIWAN_VISA_TYPES } from "./types";
import type { Country } from "@/lib/i18n/config";

// =============================================================================
// Visa Data Loader — Korea (Synchronous, Static Imports)
// =============================================================================

// English visa data imports
import d10En from "@/data/visas/en/d-10.json";
import e7En from "@/data/visas/en/e-7.json";
import f1dEn from "@/data/visas/en/f-1-d.json";
import f2En from "@/data/visas/en/f-2.json";
import d2En from "@/data/visas/en/d-2.json";
import h1En from "@/data/visas/en/h-1.json";
import e2En from "@/data/visas/en/e-2.json";
import d7En from "@/data/visas/en/d-7.json";
import d8En from "@/data/visas/en/d-8.json";
import f6En from "@/data/visas/en/f-6.json";
import f4En from "@/data/visas/en/f-4.json";
import d4En from "@/data/visas/en/d-4.json";

// Japanese visa data imports
import d10Ja from "@/data/visas/ja/d-10.json";
import e7Ja from "@/data/visas/ja/e-7.json";
import f1dJa from "@/data/visas/ja/f-1-d.json";
import f2Ja from "@/data/visas/ja/f-2.json";
import d2Ja from "@/data/visas/ja/d-2.json";
import h1Ja from "@/data/visas/ja/h-1.json";
import e2Ja from "@/data/visas/ja/e-2.json";
import d7Ja from "@/data/visas/ja/d-7.json";
import d8Ja from "@/data/visas/ja/d-8.json";
import f6Ja from "@/data/visas/ja/f-6.json";
import f4Ja from "@/data/visas/ja/f-4.json";
import d4Ja from "@/data/visas/ja/d-4.json";

// Traditional Chinese visa data imports
import d10ZhTw from "@/data/visas/zh-tw/d-10.json";
import e7ZhTw from "@/data/visas/zh-tw/e-7.json";
import f1dZhTw from "@/data/visas/zh-tw/f-1-d.json";
import f2ZhTw from "@/data/visas/zh-tw/f-2.json";
import d2ZhTw from "@/data/visas/zh-tw/d-2.json";
import h1ZhTw from "@/data/visas/zh-tw/h-1.json";
import e2ZhTw from "@/data/visas/zh-tw/e-2.json";
import d7ZhTw from "@/data/visas/zh-tw/d-7.json";
import d8ZhTw from "@/data/visas/zh-tw/d-8.json";
import f6ZhTw from "@/data/visas/zh-tw/f-6.json";
import f4ZhTw from "@/data/visas/zh-tw/f-4.json";
import d4ZhTw from "@/data/visas/zh-tw/d-4.json";

// Type the imported JSON - English
const visaDataEn: Record<KoreaVisaType, VisaInfo> = {
  "d-10": d10En as unknown as VisaInfo,
  "e-7": e7En as unknown as VisaInfo,
  "f-1-d": f1dEn as unknown as VisaInfo,
  "f-2": f2En as unknown as VisaInfo,
  "d-2": d2En as unknown as VisaInfo,
  "h-1": h1En as unknown as VisaInfo,
  "e-2": e2En as unknown as VisaInfo,
  "d-7": d7En as unknown as VisaInfo,
  "d-8": d8En as unknown as VisaInfo,
  "f-6": f6En as unknown as VisaInfo,
  "f-4": f4En as unknown as VisaInfo,
  "d-4": d4En as unknown as VisaInfo,
};

// Type the imported JSON - Japanese
const visaDataJa: Record<KoreaVisaType, VisaInfo> = {
  "d-10": d10Ja as unknown as VisaInfo,
  "e-7": e7Ja as unknown as VisaInfo,
  "f-1-d": f1dJa as unknown as VisaInfo,
  "f-2": f2Ja as unknown as VisaInfo,
  "d-2": d2Ja as unknown as VisaInfo,
  "h-1": h1Ja as unknown as VisaInfo,
  "e-2": e2Ja as unknown as VisaInfo,
  "d-7": d7Ja as unknown as VisaInfo,
  "d-8": d8Ja as unknown as VisaInfo,
  "f-6": f6Ja as unknown as VisaInfo,
  "f-4": f4Ja as unknown as VisaInfo,
  "d-4": d4Ja as unknown as VisaInfo,
};

// Type the imported JSON - Traditional Chinese
const visaDataZhTw: Record<KoreaVisaType, VisaInfo> = {
  "d-10": d10ZhTw as unknown as VisaInfo,
  "e-7": e7ZhTw as unknown as VisaInfo,
  "f-1-d": f1dZhTw as unknown as VisaInfo,
  "f-2": f2ZhTw as unknown as VisaInfo,
  "d-2": d2ZhTw as unknown as VisaInfo,
  "h-1": h1ZhTw as unknown as VisaInfo,
  "e-2": e2ZhTw as unknown as VisaInfo,
  "d-7": d7ZhTw as unknown as VisaInfo,
  "d-8": d8ZhTw as unknown as VisaInfo,
  "f-6": f6ZhTw as unknown as VisaInfo,
  "f-4": f4ZhTw as unknown as VisaInfo,
  "d-4": d4ZhTw as unknown as VisaInfo,
};

// Map of all Korea visa data by locale
const koreaVisaDataByLocale: Record<Locale, Record<KoreaVisaType, VisaInfo>> = {
  en: visaDataEn,
  ja: visaDataJa,
  "zh-tw": visaDataZhTw,
  vi: visaDataEn, // Vietnamese falls back to English visa data until translated
};

// =============================================================================
// Taiwan Async Data Loader (Dynamic Imports — zero bundle impact on Korea)
// =============================================================================

const twCache = new Map<string, VisaInfo>();

function twCacheKey(locale: Locale, type: TaiwanVisaType): string {
  return `tw:${locale}:${type}`;
}

/**
 * Dynamically import a single Taiwan visa JSON file.
 * Returns null if the file does not exist (stub visa, missing locale).
 */
async function loadTaiwanVisaJson(
  locale: Locale,
  type: TaiwanVisaType
): Promise<VisaInfo | null> {
  const key = twCacheKey(locale, type);
  if (twCache.has(key)) return twCache.get(key)!;

  try {
    const mod = await import(`@/data/visas/tw/${locale}/${type}.json`);
    const data = mod.default as unknown as VisaInfo;
    twCache.set(key, data);
    return data;
  } catch {
    return null;
  }
}

// =============================================================================
// Data Access Functions — Korea (synchronous, backward-compatible)
// =============================================================================

/**
 * Get Korea visa types (synchronous, backward-compatible).
 * When called with no arguments, returns Korea visa types only.
 * When called with a country, returns visa types for that country.
 */
export function getVisaTypes(country?: Country): VisaType[] {
  if (country === "taiwan") {
    return [...TAIWAN_VISA_TYPES];
  }
  // Default: Korea (backward-compatible)
  return [
    // Full guides
    "e-7", "d-2", "d-10", "h-1", "f-1-d", "f-2",
    // Stub visas (coming soon)
    "e-2", "d-7", "d-8", "f-6", "f-4", "d-4",
  ];
}

/**
 * Get visa info by type and locale (synchronous, Korea-only).
 * Unchanged from original — used throughout Korea pages.
 */
export function getVisaInfo(
  type: VisaType,
  locale: Locale = "en"
): VisaInfo | null {
  const data = koreaVisaDataByLocale[locale];
  return data?.[type as KoreaVisaType] ?? null;
}

/**
 * Get all visa info for a locale (synchronous, Korea-only).
 */
export function getAllVisas(locale: Locale = "en"): VisaInfo[] {
  const types = getVisaTypes();
  return types
    .map((type) => getVisaInfo(type, locale))
    .filter((visa): visa is VisaInfo => visa !== null);
}

// =============================================================================
// Data Access Functions — Country-Aware (async, for Taiwan + future countries)
// =============================================================================

/**
 * Get visa info by type, locale, and country (async).
 * For Korea, delegates to the sync loader.
 * For Taiwan, uses dynamic imports.
 */
export async function getVisaInfoAsync(
  type: VisaType,
  locale: Locale = "en",
  country: Country = "korea"
): Promise<VisaInfo | null> {
  if (country === "korea") {
    return getVisaInfo(type, locale);
  }
  if (country === "taiwan") {
    return loadTaiwanVisaJson(locale, type as TaiwanVisaType);
  }
  return null;
}

/**
 * Get all visas for a country/locale combo (async).
 */
export async function getAllVisasAsync(
  country: Country = "korea",
  locale: Locale = "en"
): Promise<VisaInfo[]> {
  if (country === "korea") {
    return getAllVisas(locale);
  }
  const types = getVisaTypes(country);
  const results = await Promise.all(
    types.map((type) =>
      loadTaiwanVisaJson(locale, type as TaiwanVisaType)
    )
  );
  return results.filter((v): v is VisaInfo => v !== null);
}

// =============================================================================
// Existing Helpers (unchanged)
// =============================================================================

/**
 * Get visa summary for list displays
 */
export function getVisaSummaries(locale: Locale = "en") {
  return getAllVisas(locale).map((visa) => ({
    type: visa.type,
    name: visa.name,
    shortName: visa.shortName,
    tagline: visa.tagline,
    category: visa.category,
    duration: visa.duration.initial,
    workPermission: visa.workPermission.allowed,
  }));
}

/**
 * Get visas by category
 */
export function getVisasByCategory(
  category: VisaInfo["category"],
  locale: Locale = "en"
): VisaInfo[] {
  return getAllVisas(locale).filter((visa) => visa.category === category);
}

/**
 * Search visas by keyword
 */
export function searchVisas(
  query: string,
  locale: Locale = "en"
): VisaInfo[] {
  const lowerQuery = query.toLowerCase();
  return getAllVisas(locale).filter(
    (visa) =>
      visa.name.toLowerCase().includes(lowerQuery) ||
      visa.shortName.toLowerCase().includes(lowerQuery) ||
      visa.description.toLowerCase().includes(lowerQuery) ||
      visa.targetAudience.some((t) => t.toLowerCase().includes(lowerQuery))
  );
}

// =============================================================================
// Comparison Helpers
// =============================================================================

/**
 * Get comparison data for multiple visas
 */
export function getVisaComparisonData(
  types: VisaType[],
  locale: Locale = "en"
) {
  return types.map((type) => {
    const visa = getVisaInfo(type, locale);
    if (!visa) return null;

    return {
      visaType: visa.type,
      name: visa.name,
      attributes: {
        duration: visa.duration.initial,
        maxDuration: visa.duration.maxTotal || visa.duration.extension || "-",
        workAllowed: visa.workPermission.allowed,
        workRestrictions: visa.workPermission.restrictions || [],
        applicationFee: visa.fees.application,
        processingTime: visa.processingTime.typical,
        incomeRequirement: visa.incomeRequirement?.amount
          ? `${visa.incomeRequirement.amount} ${visa.incomeRequirement.currency}`
          : "None",
        category: visa.category,
      },
    };
  }).filter(Boolean);
}

/**
 * Comparison attributes for the comparison table
 */
export const comparisonAttributes = [
  { key: "duration", label: "Initial Duration", category: "basic" as const },
  { key: "maxDuration", label: "Maximum Duration", category: "basic" as const },
  { key: "workAllowed", label: "Work Allowed", category: "benefits" as const },
  { key: "applicationFee", label: "Application Fee", category: "process" as const },
  { key: "processingTime", label: "Processing Time", category: "process" as const },
  { key: "incomeRequirement", label: "Income Requirement", category: "requirements" as const },
];

// =============================================================================
// Checklist Helpers
// =============================================================================

/**
 * Get checklist for a visa type
 */
export function getVisaChecklist(
  type: VisaType,
  locale: Locale = "en"
): VisaChecklist | null {
  const visa = getVisaInfo(type, locale);
  if (!visa) return null;

  // Convert documents to checklist format
  const documentItems = visa.documents.map((doc, index) => ({
    id: doc.id,
    category: "documents",
    label: doc.name,
    description: doc.description,
    tips: doc.tips,
    required: doc.required,
    order: index,
  }));

  return {
    visaType: type,
    categories: [
      {
        id: "documents",
        name: "Required Documents",
        description: "Documents needed for your visa application",
        items: documentItems,
      },
    ],
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format visa type for display
 */
export function formatVisaType(type: VisaType): string {
  return type.toUpperCase().replace(/-/g, "-");
}

/**
 * Get icon name for visa category
 */
export function getVisaCategoryIcon(category: VisaInfo["category"]): string {
  const icons: Record<string, string> = {
    work: "Briefcase",
    study: "GraduationCap",
    residence: "Home",
    "digital-nomad": "Laptop",
    "job-seeking": "Search",
    "working-holiday": "Plane",
    business: "Building",
    family: "Heart",
    "ethnic-korean": "Flag",
    "language-study": "BookOpen",
    // Taiwan categories
    "gold-card": "Award",
    investment: "TrendingUp",
    visitor: "Globe",
  };
  return icons[category] || "FileText";
}

/**
 * Get color for visa category
 */
export function getVisaCategoryColor(category: VisaInfo["category"]): string {
  const colors: Record<string, string> = {
    work: "primary",
    study: "blue",
    residence: "green",
    "digital-nomad": "accent",
    "job-seeking": "orange",
    "working-holiday": "yellow",
    business: "purple",
    family: "pink",
    "ethnic-korean": "indigo",
    "language-study": "teal",
    // Taiwan categories
    "gold-card": "amber",
    investment: "emerald",
    visitor: "sky",
  };
  return colors[category] || "muted";
}
