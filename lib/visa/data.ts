import type { VisaInfo, VisaType, Locale, VisaChecklist } from "./types";

// =============================================================================
// Visa Data Loader
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
const visaDataEn: Record<VisaType, VisaInfo> = {
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
const visaDataJa: Record<VisaType, VisaInfo> = {
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
const visaDataZhTw: Record<VisaType, VisaInfo> = {
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

// Map of all visa data by locale
const visaDataByLocale: Record<Locale, Record<VisaType, VisaInfo>> = {
  en: visaDataEn,
  ja: visaDataJa,
  "zh-tw": visaDataZhTw,
};

// =============================================================================
// Data Access Functions
// =============================================================================

/**
 * Get all available visa types
 * Priority order: E-7 (primary), D-2 (secondary), then full guides, then stubs
 */
export function getVisaTypes(): VisaType[] {
  return [
    // Full guides
    "e-7", "d-2", "d-10", "h-1", "f-1-d", "f-2",
    // Stub visas (coming soon)
    "e-2", "d-7", "d-8", "f-6", "f-4", "d-4",
  ];
}

/**
 * Get visa info by type and locale
 */
export function getVisaInfo(
  type: VisaType,
  locale: Locale = "en"
): VisaInfo | null {
  const data = visaDataByLocale[locale];
  return data?.[type] ?? null;
}

/**
 * Get all visa info for a locale
 */
export function getAllVisas(locale: Locale = "en"): VisaInfo[] {
  const types = getVisaTypes();
  return types
    .map((type) => getVisaInfo(type, locale))
    .filter((visa): visa is VisaInfo => visa !== null);
}

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
  const icons: Record<VisaInfo["category"], string> = {
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
  };
  return icons[category] || "FileText";
}

/**
 * Get color for visa category
 */
export function getVisaCategoryColor(category: VisaInfo["category"]): string {
  const colors: Record<VisaInfo["category"], string> = {
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
  };
  return colors[category] || "muted";
}
