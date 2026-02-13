# Taiwan Expansion — Technical Architecture Plan

**Author**: CTO
**Date**: 2026-02-13
**Status**: DRAFT — Pending CPO + Legal review

---

## Table of Contents

1. [Type System Changes](#1-type-system-changes)
2. [Data Structure](#2-data-structure)
3. [Data Loader Changes](#3-data-loader-changes)
4. [Route Architecture](#4-route-architecture)
5. [Component Reuse Analysis](#5-component-reuse-analysis)
6. [Quiz Engine Refactor](#6-quiz-engine-refactor)
7. [I18N Impact](#7-i18n-impact)
8. [Build & Performance](#8-build--performance)

---

## 1. Type System Changes

### Recommendation: Option (c) — Country-Scoped Compound Type

**Rationale**: Options (a) and (b) both have significant drawbacks. Prefixing (a) breaks every existing reference to `"e-7"`, `"d-10"`, etc. and mixes two orthogonal dimensions (country + type) into a single string. A union of two disjoint types (b) makes shared interfaces like `VisaInfo` harder to type because `VisaInfo.type` becomes `KoreaVisaType | TaiwanVisaType` — you can never pattern-match cleanly. Option (c) keeps the type string as a free-form slug scoped to its country, enabling clean dispatch without breaking existing Korea code.

### Exact Type Changes

```typescript
// lib/visa/types.ts

// === KEEP existing Korea types untouched for backward compatibility ===
export type KoreaVisaType =
  | "d-10" | "e-7" | "f-2" | "f-1-d" | "d-2" | "h-1"
  | "e-2" | "d-7" | "d-8" | "f-6" | "f-4" | "d-4";

// === NEW: Taiwan visa type slugs ===
export type TaiwanVisaType =
  | "gold-card"        // Employment Gold Card
  | "entrepreneur"     // Entrepreneur Visa
  | "dnv"             // Digital Nomad Visa (proposed/future)
  | "visitor"         // Visitor Visa (60/90-day)
  | "resident"        // APRC (permanent residence)
  | "student"         // Student visa
  | "work-permit"     // Standard work permit + ARC
  | "investment";     // Investment visa

// === UPDATED: VisaType becomes a union ===
export type VisaType = KoreaVisaType | TaiwanVisaType;

// === NEW: Country-scoped visa identifier (for APIs, DB, routing) ===
export interface CountryScopedVisa {
  country: Country;
  type: VisaType;
}

// === NEW: Type guard helpers ===
export function isKoreaVisa(type: VisaType): type is KoreaVisaType {
  return KOREA_VISA_TYPES.includes(type as KoreaVisaType);
}

export function isTaiwanVisa(type: VisaType): type is TaiwanVisaType {
  return TAIWAN_VISA_TYPES.includes(type as TaiwanVisaType);
}

const KOREA_VISA_TYPES: KoreaVisaType[] = [
  "d-10", "e-7", "f-2", "f-1-d", "d-2", "h-1",
  "e-2", "d-7", "d-8", "f-6", "f-4", "d-4",
];

const TAIWAN_VISA_TYPES: TaiwanVisaType[] = [
  "gold-card", "entrepreneur", "dnv", "visitor",
  "resident", "student", "work-permit", "investment",
];
```

### Migration Path

- All existing code that uses `VisaType` continues to compile because `KoreaVisaType` is a subset of `VisaType`.
- Functions that are Korea-only (e.g., current `getVisaTypes()`) get an overload or a `country` parameter.
- New functions that dispatch on country use the `CountryScopedVisa` compound key.
- Database columns (`visa_type`) remain a string — the compound key is enforced at the app layer.

### New Taiwan-Specific Interfaces

```typescript
// lib/visa/tw-types.ts

import type { Country } from "@/lib/i18n/config";

/**
 * TECO (Taipei Economic and Cultural Office) document authentication step.
 * Taiwan uses TECO offices abroad instead of traditional embassies.
 */
export interface TECOAuthenticationInfo {
  country: string;           // Applicant's country
  tecoOffice: string;        // Nearest TECO office name
  tecoUrl: string;           // URL for the TECO website
  documentsRequired: string[];
  processingDays: number;
  fees: {
    amount: number;
    currency: string;
  };
  notes?: string;
}

/**
 * Step in Taiwan's multi-agency application process.
 * Unlike Korea (single HiKorea portal), Taiwan involves:
 * - TECO (abroad)
 * - NIA (National Immigration Agency)
 * - MOL (Ministry of Labor) for work permits
 * - MOFA (Ministry of Foreign Affairs)
 */
export interface AgencyStep {
  order: number;
  agency: "TECO" | "NIA" | "MOL" | "MOFA" | "BOCA" | "other";
  agencyFullName: string;
  action: string;           // e.g. "Submit work permit application"
  description: string;
  url?: string;
  processingDays?: number;
  fees?: {
    amount: number;
    currency: string;       // Usually "TWD"
  };
  documentsRequired?: string[];
  tips?: string[];
  dependsOn?: number;       // Order number of prerequisite step
}

/**
 * Tax residency day tracking for Taiwan's 183-day rule.
 * Taiwan uses calendar-year residency (not rolling window like Korea).
 */
export interface TaxResidencyDay {
  year: number;
  daysPresent: number;
  isResident: boolean;       // >= 183 days
  taxRate: "resident" | "non-resident"; // 5-40% vs flat 18%/21%
  notes?: string;
}

/**
 * Visa-run / landing visa entry for Taiwan.
 * Common pattern: leave and re-enter to reset visa-exempt stay.
 */
export interface VisaRunEntry {
  entryDate: string;         // ISO date
  exitDate: string;          // ISO date
  destination: string;       // Where they went (e.g., "Japan", "Hong Kong")
  entryType: "visa-exempt" | "visitor-visa" | "landing-visa";
  daysGranted: number;       // 30, 60, 90 depending on nationality
  purpose?: string;
}
```

### New VisaCategory Values for Taiwan

```typescript
// Extend VisaCategory union:
export type VisaCategory =
  | "work" | "study" | "residence" | "digital-nomad" | "job-seeking"
  | "working-holiday" | "business" | "family" | "ethnic-korean" | "language-study"
  // NEW for Taiwan:
  | "gold-card" | "investment" | "visitor";
```

---

## 2. Data Structure

### Directory Layout

**Recommendation**: `data/visas/{country}/{locale}/{slug}.json`

Current layout is `data/visas/{locale}/{slug}.json` — this is Korea-only. Adding Taiwan requires a country dimension.

```
data/visas/
  kr/                    # Korea (move existing files here)
    en/
      d-10.json
      e-7.json
      ...
    ja/
      d-10.json
      ...
    zh-tw/
      d-10.json
      ...
  tw/                    # Taiwan (new)
    en/
      gold-card.json
      entrepreneur.json
      work-permit.json
      ...
    zh-tw/
      gold-card.json
      entrepreneur.json
      ...
```

**Migration**: Create a one-time migration script that moves `data/visas/{locale}/*.json` to `data/visas/kr/{locale}/*.json`. Update import paths in `data.ts`. This is backward-compatible because the data loader is the only consumer.

### Schema: Extend VisaInfo with Optional Taiwan Fields

Do NOT create a separate `TaiwanVisaInfo`. Instead, make `VisaInfo` the universal interface and add optional Taiwan-specific fields:

```typescript
export interface VisaInfo {
  // ... all existing fields stay ...

  // === NEW: Country identifier ===
  country: Country;

  // === NEW: Taiwan-specific optional fields ===
  agencySteps?: AgencyStep[];        // Multi-agency process (replaces applicationSteps for TW)
  tecoInfo?: TECOAuthenticationInfo; // TECO office details
  taxResidencyRule?: {
    type: "calendar-year" | "rolling";
    threshold: number;               // 183 for both KR and TW
    consequences: string;
  };
  arcInfo?: {                        // Alien Resident Certificate (Taiwan's ARC)
    required: boolean;
    processingDays?: number;
    notes?: string;
  };
  goldCardFields?: {                 // Gold Card specific
    categories: string[];            // "Science & Technology", "Economy", etc.
    openWorkPermit: boolean;
    taxBenefit?: string;             // "First 5 years: 50% tax exemption on income > TWD 3M"
  };
}
```

### Sample `gold-card.json` Skeleton

```json
{
  "type": "gold-card",
  "country": "taiwan",
  "name": "Employment Gold Card",
  "shortName": "Gold Card",
  "category": "gold-card",
  "description": "Taiwan's Employment Gold Card is a 4-in-1 card combining work permit, resident visa, ARC, and re-entry permit. Designed for foreign professionals in 8 categories.",
  "tagline": "4-in-1 card: work, reside, stay, re-enter",
  "keyRequirement": "Senior professional in qualifying field (Science & Tech, Economy, Education, etc.)",
  "isStub": false,

  "targetAudience": [
    "Senior tech professionals (8+ years experience)",
    "Entrepreneurs and executives",
    "Academic researchers and professors",
    "Finance and legal professionals",
    "Arts and culture professionals"
  ],

  "eligibility": [
    {
      "id": "professional-field",
      "label": "Professional qualifications in 1 of 8 fields",
      "description": "Science & Technology, Economy, Education, Culture & Arts, Sport, Finance, Law, Architecture",
      "required": true
    },
    {
      "id": "salary-or-experience",
      "label": "Monthly salary TWD 160,000+ or equivalent experience",
      "description": "Applicants must demonstrate senior-level expertise or meet minimum salary threshold",
      "required": true
    },
    {
      "id": "no-criminal-record",
      "label": "No criminal record",
      "description": "Clean criminal background check from home country",
      "required": true
    }
  ],

  "eligibilityQuestions": [
    {
      "id": "field-check",
      "question": "Do you have 8+ years of professional experience in science, technology, economics, education, culture, finance, law, or architecture?",
      "helpText": "The Gold Card covers 8 professional categories. Most tech workers apply under 'Science and Technology'.",
      "yesIsQualifying": true,
      "disqualifyingMessage": "The Gold Card requires demonstrated expertise in a qualifying field."
    },
    {
      "id": "salary-check",
      "question": "Is your current or most recent monthly salary equivalent to TWD 160,000 (~USD 5,000)?",
      "helpText": "Salary thresholds vary by category. Some categories accept lower salary with stronger credentials.",
      "yesIsQualifying": true,
      "disqualifyingMessage": "Some categories have alternative qualification paths beyond salary. Review the specific category requirements."
    }
  ],

  "duration": {
    "initial": "1-3 years (applicant chooses)",
    "extension": "Renewable",
    "maxTotal": "No maximum (renewable indefinitely)"
  },

  "fees": {
    "application": "TWD 3,700 (~USD 120)",
    "notes": "Fee varies by card duration: 1yr = TWD 3,700, 2yr = TWD 5,200, 3yr = TWD 6,700"
  },

  "documents": [
    {
      "id": "passport",
      "name": "Valid Passport",
      "description": "Must be valid for at least 6 months",
      "required": true
    },
    {
      "id": "photo",
      "name": "Passport Photo",
      "description": "2-inch photo, white background, taken within 6 months",
      "required": true
    },
    {
      "id": "cv",
      "name": "Curriculum Vitae / Resume",
      "description": "Detailed professional experience relevant to your qualifying category",
      "required": true
    },
    {
      "id": "proof-of-expertise",
      "name": "Proof of Professional Qualifications",
      "description": "Salary certificates, patents, publications, awards, or employer letters",
      "required": true
    },
    {
      "id": "criminal-record",
      "name": "Criminal Record Check",
      "description": "From home country, authenticated by TECO or Hague Apostille",
      "required": true
    }
  ],

  "applicationSteps": [
    {
      "id": "online-apply",
      "step": 1,
      "title": "Submit Online Application",
      "description": "Apply through the Gold Card application portal (goldcard.nat.gov.tw)",
      "duration": "30 minutes",
      "links": [{ "label": "Gold Card Portal", "url": "https://goldcard.nat.gov.tw" }]
    },
    {
      "id": "review",
      "step": 2,
      "title": "Ministry Review",
      "description": "The relevant ministry reviews your qualifications (e.g., MOST for Science & Tech)",
      "duration": "2-4 weeks"
    },
    {
      "id": "nai-review",
      "step": 3,
      "title": "NIA Processing",
      "description": "National Immigration Agency processes the resident visa component",
      "duration": "1-2 weeks"
    },
    {
      "id": "pickup",
      "step": 4,
      "title": "Pick Up Gold Card",
      "description": "Collect at NIA in Taiwan or at a TECO office abroad",
      "duration": "1 week"
    }
  ],

  "agencySteps": [
    {
      "order": 1,
      "agency": "other",
      "agencyFullName": "Gold Card Portal (cross-ministry)",
      "action": "Submit online application",
      "description": "One portal handles routing to the correct ministry",
      "url": "https://goldcard.nat.gov.tw",
      "processingDays": 1
    },
    {
      "order": 2,
      "agency": "MOL",
      "agencyFullName": "Ministry of Labor (or relevant ministry)",
      "action": "Qualification review",
      "description": "The ministry for your category reviews your professional qualifications",
      "processingDays": 21
    },
    {
      "order": 3,
      "agency": "NIA",
      "agencyFullName": "National Immigration Agency",
      "action": "Resident visa processing",
      "description": "NIA issues the resident visa + ARC component of the Gold Card",
      "processingDays": 10,
      "dependsOn": 2
    }
  ],

  "processingTime": {
    "typical": "30-60 days",
    "notes": "Varies by ministry. Science & Technology tends to be fastest."
  },

  "workPermission": {
    "allowed": true,
    "notes": "Open work permit — can work for any employer or be self-employed"
  },

  "goldCardFields": {
    "categories": [
      "Science and Technology",
      "Economy",
      "Education",
      "Culture and Arts",
      "Sport",
      "Finance",
      "Law",
      "Architecture"
    ],
    "openWorkPermit": true,
    "taxBenefit": "First 5 years: income exceeding TWD 3 million is 50% tax-exempt (if not previously a Taiwan tax resident)"
  },

  "faqs": [
    {
      "question": "Can I apply for the Gold Card from outside Taiwan?",
      "answer": "Yes. The entire application is online. You can pick up the physical card at a TECO office abroad or collect it upon arrival at NIA in Taiwan."
    },
    {
      "question": "Do I need a job offer in Taiwan?",
      "answer": "No. The Gold Card includes an open work permit. You can freelance, start a business, or work for any employer."
    },
    {
      "question": "What counts as 'Science and Technology' expertise?",
      "answer": "Software engineering, data science, hardware engineering, biotech, and similar fields. Most tech professionals apply under this category."
    }
  ],

  "tips": [
    "The Gold Card portal is the ONLY official application channel — ignore third-party services",
    "Apply under the category where your credentials are strongest, not necessarily your current job title",
    "Processing is fastest for Science & Technology — typically 3-4 weeks"
  ],

  "communityTips": [
    {
      "id": "gc-reddit-1",
      "tip": "If your salary is borderline, supplement with patents, publications, or awards to strengthen your application",
      "source": "reddit",
      "verified": false
    }
  ],

  "lastUpdated": "2026-01-15",
  "officialLinks": [
    { "label": "Gold Card Portal", "url": "https://goldcard.nat.gov.tw" },
    { "label": "NIA", "url": "https://www.immigration.gov.tw" }
  ]
}
```

---

## 3. Data Loader Changes

### Problem

Current `data.ts` imports all 36 Korea JSON files (12 visas x 3 locales) statically at the top of the file. Adding Taiwan with, say, 8 visas x 2 locales = 16 more files would push us to 52+ static imports. This is not sustainable.

### Solution: Country-Scoped Dynamic Imports

Replace the monolithic static-import pattern with a **dynamic loader per country** that uses `import()`. Each country gets its own loader module to maintain code-splitting boundaries.

```typescript
// lib/visa/data.ts (REFACTORED)

import type { VisaInfo, VisaType, KoreaVisaType, TaiwanVisaType } from "./types";
import type { Country, Locale } from "@/lib/i18n/config";

// =============================================================================
// Country Visa Registries (type slug arrays)
// =============================================================================

const KOREA_VISAS: KoreaVisaType[] = [
  "e-7", "d-2", "d-10", "h-1", "f-1-d", "f-2",
  "e-2", "d-7", "d-8", "f-6", "f-4", "d-4",
];

const TAIWAN_VISAS: TaiwanVisaType[] = [
  "gold-card", "entrepreneur", "work-permit", "student",
  "visitor", "resident", "investment", "dnv",
];

// =============================================================================
// Dynamic Visa Data Loaders
// =============================================================================

// Cache: prevents re-importing the same JSON
const cache = new Map<string, VisaInfo>();

function cacheKey(country: Country, locale: Locale, type: VisaType): string {
  return `${country}:${locale}:${type}`;
}

/**
 * Dynamically import a single visa JSON file.
 * Returns null if the file does not exist (stub visa, missing locale).
 */
async function loadVisaJson(
  country: Country,
  locale: Locale,
  type: VisaType
): Promise<VisaInfo | null> {
  const key = cacheKey(country, locale, type);
  if (cache.has(key)) return cache.get(key)!;

  try {
    // Country slug: "korea" -> "kr", "taiwan" -> "tw"
    const countrySlug = country === "korea" ? "kr" : "tw";
    const mod = await import(`@/data/visas/${countrySlug}/${locale}/${type}.json`);
    const data = mod.default as VisaInfo;
    cache.set(key, data);
    return data;
  } catch {
    return null;
  }
}

// =============================================================================
// Public API (backward-compatible + new country-aware)
// =============================================================================

/**
 * Get visa types for a country. Defaults to Korea.
 */
export function getVisaTypes(country: Country = "korea"): VisaType[] {
  switch (country) {
    case "korea": return [...KOREA_VISAS];
    case "taiwan": return [...TAIWAN_VISAS];
    default: return [];
  }
}

/**
 * Get visa info by type, locale, and country.
 * Async because Taiwan uses dynamic imports.
 */
export async function getVisaInfoAsync(
  type: VisaType,
  locale: Locale = "en",
  country: Country = "korea"
): Promise<VisaInfo | null> {
  return loadVisaJson(country, locale, type);
}

/**
 * DEPRECATED but KEPT for backward compatibility.
 * Synchronous Korea-only loader using static imports.
 * Page.tsx files that are Korea-only can continue using this.
 */
export function getVisaInfo(
  type: VisaType,
  locale: Locale = "en"
): VisaInfo | null {
  // Keep existing static import logic for Korea only
  // ... (unchanged from current implementation)
}

/**
 * Get all visas for a country/locale combo.
 */
export async function getAllVisasAsync(
  country: Country = "korea",
  locale: Locale = "en"
): Promise<VisaInfo[]> {
  const types = getVisaTypes(country);
  const results = await Promise.all(
    types.map((type) => loadVisaJson(country, locale, type))
  );
  return results.filter((v): v is VisaInfo => v !== null);
}
```

### Migration Strategy

1. **Phase 1 (this PR)**: Keep the existing synchronous Korea loader intact. Add the async loader alongside it. New Taiwan pages use `getVisaInfoAsync()`.
2. **Phase 2 (next cycle)**: Migrate Korea pages to async loader. Move Korea JSON files from `data/visas/{locale}/` to `data/visas/kr/{locale}/`. Remove static imports from `data.ts`.
3. **Phase 3**: Remove deprecated `getVisaInfo()` synchronous function.

### Bundle Impact

- Korea pages: **zero change** in Phase 1 (same static imports).
- Taiwan pages: **only the requested visa JSON** is loaded per page (dynamic import). Each JSON is ~5-15 KB.
- Total additional bundle: ~0 KB at build time (dynamic imports are code-split by Next.js automatically).

---

## 4. Route Architecture

### Current Route Structure

```
app/[lang]/[country]/visa/
  page.tsx              # Landing page (situation grid)
  [type]/page.tsx       # Visa detail page
  find/page.tsx         # Quiz / visa finder
  compare/page.tsx      # Comparison tool
  checklist/page.tsx    # Checklist overview
  checklist/[type]/page.tsx  # Per-visa checklist
  dashboard/page.tsx    # User dashboard
  path/page.tsx         # Path simulator
```

The `[country]` param already exists. Routes are inherently country-aware. What needs to change:

### 4.1 `generateStaticParams()` — Add Taiwan

Every page.tsx that generates static params currently has:

```typescript
if (country === "korea") {
  params.push({ lang, country, type });
}
```

Change to:

```typescript
for (const country of countries) {
  for (const lang of locales) {
    if (isLocaleAvailableForCountry(lang, country)) {
      const types = getVisaTypes(country);
      for (const type of types) {
        params.push({ lang, country, type });
      }
    }
  }
}
```

### 4.2 Page Components — Country-Aware Data Loading

**`visa/page.tsx` (Landing Page)**:
- The situation grid is currently hardcoded with Korea visa slugs (`"e-7"`, `"d-2"`, etc.).
- Refactor: Create a `getSituations(country, locale)` function that returns the situation grid data per country.
- Taiwan's landing page will show Gold Card, Work Permit, Entrepreneur, Student, etc.

**`visa/[type]/page.tsx` (Detail Page)**:
- Currently calls `getVisaInfo(type, locale)` synchronously.
- Change to `await getVisaInfoAsync(type, locale, country)`.
- For Taiwan, render `agencySteps` instead of `applicationSteps` if present.

**`visa/find/page.tsx` (Quiz)**:
- Korea: existing scoring quiz.
- Taiwan: new FactMatcher engine (see Section 6).
- The page dispatches to the correct quiz component based on `country`.

**`visa/path/page.tsx` (Path Simulator)**:
- Korea: existing path data.
- Taiwan: new `tw-path-data.ts` with Taiwan transition paths.
- The simulator component accepts `country` and loads the correct path data.

### 4.3 Redirects (next.config.mjs)

Add Taiwan legacy redirects:

```javascript
// Taiwan redirects (future-proofing)
{
  source: "/taiwan",
  destination: "/taiwan/visa",
  permanent: false,  // 302 — not permanent until Taiwan launches
},
```

### 4.4 Which Pages Are Country-Agnostic vs Country-Specific?

| Page | Status | Notes |
|------|--------|-------|
| `visa/page.tsx` (landing) | Country-specific content | Situation grid differs per country |
| `visa/[type]/page.tsx` (detail) | Country-specific data | Same layout, different data source |
| `visa/find/page.tsx` (quiz) | Country-specific engine | Korea = scoring, Taiwan = fact-match |
| `visa/compare/page.tsx` | Country-specific data | Same component, filtered by country |
| `visa/checklist/` | Country-specific data | Same component, different documents |
| `visa/dashboard/page.tsx` | Country-specific data | Same layout, different visa types |
| `visa/path/page.tsx` | Country-specific data | Different transition graphs |

**Conclusion**: The page **layouts** are mostly reusable. The **data and engines** are country-specific.

---

## 5. Component Reuse Analysis

| Component | Reusable As-Is | Needs `country` Prop | Taiwan-Specific New |
|-----------|:-:|:-:|:-:|
| `LegalDisclaimer` | | X | |
| `QuizDisclaimer` | | X | |
| `IncomeDisclaimer` | X | | |
| `DayTrackerDisclaimer` | | X | |
| `SituationGrid` | X | | |
| `SituationTile` | X | | |
| `MoreSituations` | X | | |
| `AlreadyHaveVisa` | X | | |
| `QuizResults` | | X | |
| `QuizQuestion` | X | | |
| `QuizProgress` | X | | |
| `VisaFinder` | | X | |
| `VisaComparisonTool` | | X | |
| `VisaPathSimulator` | | X | |
| `PathCard` | X | | |
| `VisaJourneyPage` | | X | |
| `VisaStubPage` | X | | |
| `VisaDetailContent` | | X | |
| `EligibilityQuiz` | | X | |
| `DocumentChecklist` | X | | |
| `DDayCounter` | X | | |
| `HealthScoreCard` | X | | |
| `DDayPanel` | X | | |
| `DashboardClient` | | X | |
| `StateDashboard` | | X | |
| `StateTimeline` | X | | |
| `OnboardingWizard` | | X | |
| — | — | — | — |
| `TaiwanFactMatcher` | | | X |
| `AgencyStepTimeline` | | | X |
| `GoldCardCategoryPicker` | | | X |
| `TECOLocator` | | | X |
| `TaxResidencyTracker` | | | X |
| `VisaRunTracker` | | | X |

### Notes

- **`LegalDisclaimer`**: Currently hardcodes Korean immigration links (immigration.go.kr, hikorea.go.kr). Taiwan needs NIA links (immigration.gov.tw). Accept a `country` prop that switches the disclaimer text and links via i18n keys (`legal.boxDisclaimerPara2.kr` vs `legal.boxDisclaimerPara2.tw`).
- **`VisaFinder`**: Currently calls `calculateRecommendations()` from the Korea scoring engine. For Taiwan, it should call the FactMatcher engine. Dispatch based on country.
- **`QuizResults`**: Hardcodes `VISA_NAMES` and `MATCH_LEVEL_CONFIG` with Korea visa types. For Taiwan, the result display needs to show fact-match results (met/not-met) instead of match levels. Best approach: create a `TaiwanQuizResults` component.
- **`VisaPathSimulator`**: Currently imports `STARTING_POINTS` and `getPathsFromStart` from `path-data.ts` (Korea-only). Add a `tw-path-data.ts` and have the simulator select data source by country.

---

## 6. Quiz Engine Refactor

### Problem

Taiwan's legal environment prohibits showing "match scores" or anything resembling eligibility assessment. The current `quiz-engine.ts` uses numerical scoring (base score, multipliers, bonuses) and outputs `MatchLevel` ("strong", "moderate", "possible"). This is not acceptable for Taiwan.

### Solution: Dual-Engine Architecture

Keep the Korea scoring engine unchanged. Create a new **FactMatcher** engine for Taiwan.

```
lib/visa/
  quiz-engine.ts           # Korea (unchanged)
  tw-fact-matcher.ts       # Taiwan (new)
  quiz-dispatcher.ts       # Routes to correct engine by country (new)
```

### FactMatcher Design

```typescript
// lib/visa/tw-fact-matcher.ts

import type { TaiwanVisaType } from "./types";

// =============================================================================
// Types
// =============================================================================

/**
 * A single factual requirement that can be checked.
 * NO scores. NO probabilities. Just met/not-met.
 */
export interface FactRequirement {
  id: string;
  label: string;             // e.g. "8+ years professional experience"
  description?: string;
  check: (answers: TaiwanQuizAnswers) => FactCheckResult;
}

export type FactCheckResult = "met" | "not-met" | "unknown";

/**
 * Taiwan quiz answers — different from Korea's QuizAnswers
 */
export interface TaiwanQuizAnswers {
  nationality?: string;
  currentLocation?: "in-taiwan" | "outside-taiwan";
  purpose?: TaiwanPurpose;
  // Professional background
  yearsExperience?: number;
  professionalField?: string;
  monthlySalaryTWD?: number;
  hasJobOffer?: boolean;
  // Education
  education?: "high-school" | "bachelors" | "masters" | "phd";
  // Investment
  investmentAmountTWD?: number;
  // Student
  hasAdmissionLetter?: boolean;
}

export type TaiwanPurpose =
  | "work-professional"
  | "work-teaching"
  | "entrepreneur"
  | "student"
  | "long-term-residence"
  | "short-visit"
  | "investment"
  | "remote-work";

/**
 * Result for a single Taiwan visa — NO SCORES
 */
export interface TaiwanVisaFactResult {
  visaType: TaiwanVisaType;
  visaName: string;
  requirements: {
    id: string;
    label: string;
    result: FactCheckResult;
  }[];
  allMet: boolean;          // All requirements met
  unknownCount: number;     // How many could not be determined
  informationalNotes: string[];
}

// =============================================================================
// Requirement Definitions per Visa
// =============================================================================

const GOLD_CARD_REQUIREMENTS: FactRequirement[] = [
  {
    id: "experience",
    label: "8+ years of professional experience in a qualifying field",
    check: (a) => {
      if (a.yearsExperience === undefined) return "unknown";
      return a.yearsExperience >= 8 ? "met" : "not-met";
    },
  },
  {
    id: "salary",
    label: "Monthly salary equivalent to TWD 160,000+",
    check: (a) => {
      if (a.monthlySalaryTWD === undefined) return "unknown";
      return a.monthlySalaryTWD >= 160000 ? "met" : "not-met";
    },
  },
  {
    id: "field",
    label: "Professional field is one of the 8 Gold Card categories",
    check: (a) => {
      if (!a.professionalField) return "unknown";
      const qualifying = [
        "science-tech", "economy", "education", "culture-arts",
        "sport", "finance", "law", "architecture",
      ];
      return qualifying.includes(a.professionalField) ? "met" : "not-met";
    },
  },
];

// ... similar for other visa types

// =============================================================================
// Core Engine
// =============================================================================

/**
 * Run fact-checking against all Taiwan visa types.
 * Returns array of results — NO ranking, NO scores.
 * Frontend can sort by allMet / unknownCount if desired.
 */
export function checkTaiwanVisaFacts(
  answers: TaiwanQuizAnswers
): TaiwanVisaFactResult[] {
  const configs: { type: TaiwanVisaType; name: string; requirements: FactRequirement[] }[] = [
    { type: "gold-card", name: "Employment Gold Card", requirements: GOLD_CARD_REQUIREMENTS },
    // ... other visa configs
  ];

  return configs.map((config) => {
    const results = config.requirements.map((req) => ({
      id: req.id,
      label: req.label,
      result: req.check(answers),
    }));

    return {
      visaType: config.type,
      visaName: config.name,
      requirements: results,
      allMet: results.every((r) => r.result === "met"),
      unknownCount: results.filter((r) => r.result === "unknown").length,
      informationalNotes: [],
    };
  });
}
```

### Quiz Dispatcher

```typescript
// lib/visa/quiz-dispatcher.ts

import type { Country } from "@/lib/i18n/config";
import type { QuizAnswers, VisaRecommendation } from "./types";
import type { TaiwanQuizAnswers, TaiwanVisaFactResult } from "./tw-fact-matcher";
import { calculateRecommendations } from "./quiz-engine";
import { checkTaiwanVisaFacts } from "./tw-fact-matcher";

export type QuizResult =
  | { country: "korea"; recommendations: VisaRecommendation[] }
  | { country: "taiwan"; factResults: TaiwanVisaFactResult[] };

export function runQuiz(
  country: Country,
  answers: QuizAnswers | TaiwanQuizAnswers
): QuizResult {
  switch (country) {
    case "korea":
      return {
        country: "korea",
        recommendations: calculateRecommendations(answers as QuizAnswers),
      };
    case "taiwan":
      return {
        country: "taiwan",
        factResults: checkTaiwanVisaFacts(answers as TaiwanQuizAnswers),
      };
  }
}
```

### UI Implications

- **Korea quiz results**: Continue showing "Strong Match / Moderate Match / Possible" cards with match reasons. Unchanged.
- **Taiwan quiz results**: Show a **checklist-style** display per visa. Each requirement shows a checkmark (met), X (not met), or "?" (unknown). **No ranking. No percentages. No "best match" language.** Just: "Based on your answers, here is how your situation compares to the published requirements for each visa type."
- Both must display the legal disclaimer.

---

## 7. I18N Impact

### 7.1 New Translation Keys Needed

```
// messages/{locale}.json additions

"taiwan": {
  "countryName": "Taiwan",
  // Landing page
  "visa": {
    "situationGoldCard": "I'm a senior professional (tech, finance, etc.)",
    "situationWorkPermit": "I have a job offer in Taiwan",
    "situationEntrepreneur": "I want to start a business in Taiwan",
    "situationStudent": "I want to study in Taiwan",
    "situationVisitor": "I'm visiting Taiwan short-term",
    "situationRemoteWork": "I want to work remotely from Taiwan",
    "situationInvestment": "I want to invest in Taiwan",
    "situationResident": "I want permanent residence (APRC)"
  },
  // Legal disclaimers
  "legal": {
    "boxDisclaimerPara2": "Always verify requirements with the <nia>National Immigration Agency</nia> or your nearest <teco>TECO office</teco>.",
    "quizDisclaimer": "This tool compares your answers to published requirements. It is not immigration advice. Requirements may change without notice.",
    "factMatcherDisclaimer": "This information is provided for reference only. It does not constitute legal advice or an eligibility determination."
  },
  // Quiz
  "quiz": {
    "resultsMet": "Requirement appears to be met based on your answers",
    "resultsNotMet": "Requirement does not appear to be met",
    "resultsUnknown": "Could not be determined from your answers",
    "allMetNote": "Your answers appear to align with the published requirements for this visa type. Verify with NIA.",
    "someNotMetNote": "Some published requirements do not appear to be met based on your answers."
  },
  // Path simulator
  "pathSimulator": {
    "disclaimer": "Visa transition paths are based on published regulations. Always confirm with <link>NIA</link>."
  }
}
```

### 7.2 Taiwan Visa Data Locales

| Locale | Available for Taiwan | Notes |
|--------|:---:|-------|
| `en` | Yes | Primary — English-speaking nomads/expats |
| `zh-tw` | Yes | Native Traditional Chinese users |
| `ja` | No (Phase 1) | Could add later for Japanese expats in Taiwan |
| `vi` | No (Phase 1) | Could add later for Vietnamese workers in Taiwan |

This is already configured in `lib/i18n/config.ts`:

```typescript
export const countryLocales: Record<Country, readonly Locale[]> = {
  korea: ["en", "ja", "zh-tw", "vi"],
  taiwan: ["en", "zh-tw"],
};
```

### 7.3 No New Locale Needed

The existing locale set (`en`, `ja`, `zh-tw`, `vi`) covers Taiwan. The `zh-tw` locale is Traditional Chinese — perfect for Taiwan. No new BCP 47 tag or locale file is required.

---

## 8. Build & Performance

### 8.1 Static Pages Estimate

**Current (Korea only)**:

| Route Pattern | Locales | Visa Types | Pages |
|---|---|---|---|
| `/[lang]/korea/visa` | 4 | 1 | 4 |
| `/[lang]/korea/visa/[type]` | 4 | 12 | 48 |
| `/[lang]/korea/visa/find` | 4 | 1 | 4 |
| `/[lang]/korea/visa/compare` | 4 | 1 | 4 |
| `/[lang]/korea/visa/checklist` | 4 | 1 | 4 |
| `/[lang]/korea/visa/checklist/[type]` | 4 | 12 | 48 |
| `/[lang]/korea/visa/dashboard` | 4 | 1 | 4 |
| `/[lang]/korea/visa/path` | 4 | 1 | 4 |
| **Total** | | | **120** |

**With Taiwan**:

| Route Pattern | Locales | Visa Types | Pages |
|---|---|---|---|
| `/[lang]/taiwan/visa` | 2 | 1 | 2 |
| `/[lang]/taiwan/visa/[type]` | 2 | 8 | 16 |
| `/[lang]/taiwan/visa/find` | 2 | 1 | 2 |
| `/[lang]/taiwan/visa/compare` | 2 | 1 | 2 |
| `/[lang]/taiwan/visa/checklist` | 2 | 1 | 2 |
| `/[lang]/taiwan/visa/checklist/[type]` | 2 | 8 | 16 |
| `/[lang]/taiwan/visa/dashboard` | 2 | 1 | 2 |
| `/[lang]/taiwan/visa/path` | 2 | 1 | 2 |
| **Taiwan subtotal** | | | **44** |
| **Grand total** | | | **164** |

**Increase**: +44 pages (+37%). Vercel builds handle this easily.

### 8.2 Bundle Size Impact

| Item | Size Impact | Reason |
|------|-------------|--------|
| Taiwan visa JSONs (8 visas x 2 locales) | ~120-200 KB total | Dynamic imports = only loaded on demand |
| `tw-fact-matcher.ts` | ~3 KB | Only loaded on Taiwan quiz pages |
| `tw-path-data.ts` | ~8-15 KB | Only loaded on Taiwan path pages |
| New components (6 Taiwan-specific) | ~15-25 KB total | Code-split per route |
| **Net impact on Korea pages** | **0 KB** | Dynamic imports isolate Taiwan code |

### 8.3 Lazy Loading Strategy

```
Route                            | What loads
---------------------------------|--------------------------------------
/en/korea/visa                   | Korea situation data (static, unchanged)
/en/taiwan/visa                  | Taiwan situation data (static, new)
/en/korea/visa/e-7               | data/visas/kr/en/e-7.json (static import, unchanged)
/en/taiwan/visa/gold-card        | data/visas/tw/en/gold-card.json (dynamic import)
/en/korea/visa/find              | quiz-engine.ts (existing bundle)
/en/taiwan/visa/find             | tw-fact-matcher.ts (new, code-split)
/en/korea/visa/path              | path-data.ts (existing)
/en/taiwan/visa/path             | tw-path-data.ts (new, code-split)
```

**Key principle**: Taiwan code is never loaded on Korea pages, and vice versa. Next.js App Router with dynamic imports ensures this automatically.

### 8.4 Build Time Impact

- Current build: ~45-60 seconds (estimate for 120 pages).
- With Taiwan: ~55-75 seconds (164 pages).
- Increase is linear and well within Vercel's build timeout (30 minutes).

---

## Implementation Phases

### Phase 1: Foundation (1 sprint)
- [ ] Add `KoreaVisaType`, `TaiwanVisaType`, type guards to `types.ts`
- [ ] Create `tw-types.ts` with Taiwan-specific interfaces
- [ ] Create `data/visas/tw/en/gold-card.json` (first visa data)
- [ ] Add dynamic loader to `data.ts` (keep sync Korea loader)
- [ ] Update `generateStaticParams()` in all page.tsx files to include Taiwan
- [ ] Add `country` prop to `LegalDisclaimer` with Taiwan-specific links/text
- [ ] Add Taiwan i18n keys to `messages/en.json` and `messages/zh-tw.json`

### Phase 2: Quiz & Tools (1 sprint)
- [ ] Build `tw-fact-matcher.ts`
- [ ] Build `TaiwanFactMatchResults` component
- [ ] Create `quiz-dispatcher.ts`
- [ ] Update `VisaFinder` to dispatch by country
- [ ] Create `tw-path-data.ts` with Taiwan transition graph
- [ ] Add remaining Taiwan visa JSON files (en + zh-tw)

### Phase 3: Polish & Launch (1 sprint)
- [ ] Build Taiwan-specific components (`AgencyStepTimeline`, `TECOLocator`, etc.)
- [ ] Migrate Korea data files to `data/visas/kr/` directory
- [ ] Full i18n pass for Taiwan content in zh-tw
- [ ] Legal review of all Taiwan-facing copy
- [ ] Performance audit (bundle analyzer)
- [ ] QA: verify Korea pages are unchanged

---

## Open Questions for CPO / Legal

1. **Taiwan quiz framing**: "Find a visa" vs "Compare visa requirements" — which is legally safer for Taiwan's regulatory environment?
2. **Gold Card tax benefit**: Can we show "50% tax exemption on income > TWD 3M"? Or does displaying tax info cross into tax advisory territory?
3. **Visa-run tracker**: Is this feature legally safe to ship, or does it implicitly advise people to circumvent visa rules?
4. **Phase 1 scope**: How many Taiwan visa types for MVP? Suggest: Gold Card + Work Permit + Visitor (3 types) to validate the architecture, then expand.
