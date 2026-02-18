# Cycle 2 -- Technical Health Audit

**Date**: 2026-02-12
**Auditor**: Claude Opus 4.6 (tech-inspector-2)
**Scope**: Full codebase at `main` branch (commit `6a3a164`)
**Previous Audit**: Cycle 1 scored **62/100**

---

## Overall Score: 72 / 100

| # | Category | Score | Weight | Weighted | Cycle 1 |
|---|----------|-------|--------|----------|---------|
| 1 | Build & Config | 8/10 | 15% | 1.20 | 8/10 |
| 2 | Error Boundaries | 9/10 | 10% | 0.90 | 8/10 |
| 3 | Security | 8/10 | 20% | 1.60 | 8/10 |
| 4 | Type Safety | 7/10 | 10% | 0.70 | 8/10 |
| 5 | Data Integrity | 7/10 | 15% | 1.05 | N/A (new) |
| 6 | i18n Coverage | 5/10 | 15% | 0.75 | 3/10 |
| 7 | Component Quality | 7/10 | 10% | 0.70 | N/A (new) |
| 8 | Nav & Locale Awareness | 5/10 | 5% | 0.25 | 6/10 |
| | **Total** | | **100%** | **7.15 -> 72/100** | **62/100** |

**Delta from Cycle 1: +10 points (+16%)**

---

## 1. Build & Config (8/10) [Weight: 15%]

### Checks Performed

| Check | Result | Severity |
|-------|--------|----------|
| `npx tsc --noEmit` | **PASS** -- 0 errors | None |
| `ignoreBuildErrors` in next.config.mjs | **Not present** -- builds enforce type correctness | None |
| `ignoreDuringBuilds` (ESLint) | **Not present** -- lint errors break builds | None |
| `images` optimization config | **Not configured** -- no `images` key in config | Warning |
| `allowedDevOrigins` | Present for local dev only (`127.0.0.1:5000`, `localhost:5000`) -- acceptable | None |

### Findings

- TypeScript compiles cleanly with zero errors.
- Build config is clean -- no error suppression flags.
- **Missing**: No `images` optimization configuration (no remote image domains, no loader config). This means `next/image` will not optimize remote images, and no CDN-level image optimization is configured.

### Comparison to Cycle 1
Unchanged at 8/10. The `images` config gap persists from Cycle 1.

---

## 2. Error Boundaries (9/10) [Weight: 10%]

### Coverage Matrix

| Route | `loading.tsx` | `error.tsx` |
|-------|:---:|:---:|
| `app/` (root) | Yes | Yes |
| `app/[lang]/` | Yes | Yes |
| `app/[lang]/[country]/` | Yes | Yes |
| `app/[lang]/[country]/visa/` | Yes | Yes |
| `app/[lang]/[country]/visa/[type]/` | Yes | Yes |
| `app/[lang]/[country]/visa/checklist/` | Yes | Yes |
| `app/[lang]/[country]/visa/checklist/[type]/` | Yes | Yes |
| `app/[lang]/[country]/visa/compare/` | Yes | Yes |
| `app/[lang]/[country]/visa/dashboard/` | Yes | Yes |
| `app/[lang]/[country]/visa/find/` | Yes | Yes |
| `app/[lang]/[country]/visa/path/` | **Yes (NEW)** | **Yes (NEW)** |
| `app/[lang]/[country]/areas/` | Yes | Yes |
| `app/[lang]/[country]/bundles/` | Yes | Yes |
| `app/auth/` | Yes | Yes |
| `app/(legal)/` | **Yes (NEW)** | **Yes (NEW)** |

### Findings

| Check | Result | Severity |
|-------|--------|----------|
| All routes under `app/` have `loading.tsx` | **PASS** -- 15/15 route groups covered | None |
| All routes under `app/` have `error.tsx` | **PASS** -- 15/15 route groups covered | None |

### Comparison to Cycle 1
**Improved from 8/10 to 9/10.** The two Cycle 1 gaps (`app/(legal)/` and `app/[lang]/[country]/visa/path/`) have been filled. Both now have `loading.tsx` and `error.tsx`. Score upgraded.

---

## 3. Security (8/10) [Weight: 20%]

### 3a. Auth Callback -- sanitizeRedirect

**File**: `app/auth/callback/route.ts`

| Check | Result | Severity |
|-------|--------|----------|
| Blocks absolute URLs | Yes -- must start with `/` | None |
| Blocks protocol-relative URLs (`//evil.com`) | Yes -- blocks `//` | None |
| Blocks backslash tricks | Yes -- blocks `\` | None |
| Requires locale prefix (`/{lang}/{country}/`) | Yes -- regex `^/[a-z]{2}/[a-z]+/` | None |
| Default fallback | `/en/korea/visa/dashboard` | None |

**Verdict**: Robust. No regressions from Cycle 1.

### 3b. dangerouslySetInnerHTML Usage

| File | Usage | Safe? | Severity |
|------|-------|-------|----------|
| `components/ui/chart.tsx` | shadcn/ui chart component (managed) | Yes -- shadcn internal | None |
| `app/[lang]/[country]/visa/page.tsx` | `JSON.stringify(landingJsonLd)` | Yes -- serialized structured data, not user input | None |
| `app/[lang]/[country]/visa/[type]/page.tsx` (2 uses) | `JSON.stringify(faqJsonLd)` | Yes -- serialized structured data from visa JSON | None |

**Verdict**: All 4 instances use `JSON.stringify()` on server-controlled data. No user input flows into `dangerouslySetInnerHTML`. Safe.

### 3c. Rate Limiting on Subscribe API

**File**: `app/api/subscribe/route.ts`

| Check | Result | Severity |
|-------|--------|----------|
| Rate limiting present | Yes -- 5 req/min per IP | None |
| Stale entry eviction | Yes -- lazy eviction on each check | None |
| Input validation | Email regex + type check | None |
| PII in logs | **None** -- all log messages are generic, no emails/names/IPs | None |

**Caveat**: In-memory rate limiting resets on serverless cold starts. Acceptable for current scale.

### 3d. PII in Logs

| File | Log Statement | Contains PII? | Severity |
|------|---------------|:---:|----------|
| `auth-provider.tsx:136` | `console.error('Error migrating localStorage data:', error)` | Possible (error object may contain user IDs) | Warning |
| `SeoulNeighborhoodMap.tsx:384,388` | `console.error("Mapbox error:", e)` | No | None |
| `DashboardClient.tsx:436` | `console.error('Error fetching dashboard data:', error)` | Possible (error may contain user context) | Warning |
| All `error.tsx` files | `console.error(error)` | No -- generic Next.js error boundaries | None |
| `subscribe/route.ts` (all 5) | Generic prefixed messages | No | None |
| `supabase/client.ts` | `console.warn(...)` | No | None |
| `stateMachine.ts` (2) | Generic state machine messages | No | None |

**Verdict**: 2 instances where error objects could leak user context to browser console. Not a blocker but should be addressed.

---

## 4. Type Safety (7/10) [Weight: 10%]

### 4a. `as any` Instances

**2 instances found** (same as Cycle 1):

| File | Line | Usage | Severity |
|------|------|-------|----------|
| `components/providers/auth-provider.tsx` | 97 | `(supabase.from('visa_progress') as any).insert(...)` | Warning |
| `components/providers/auth-provider.tsx` | 130 | `(supabase.from('checklist_items') as any).insert(items)` | Warning |

Both have `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comments. Root cause: `Database` type in `database.types.ts` does not include these tables.

**Additionally**, `DashboardClient.tsx` has 2 more `as any` casts (lines 397, 424) with `eslint-disable` comments, casting Supabase response data to local interfaces. This is a workaround for the same root cause.

**Total: 4 instances of `as any`** (up from 2 in Cycle 1).

### 4b. `@ts-ignore` / `@ts-expect-error`

**0 instances found.** No type suppression directives anywhere.

### 4c. VisaTransitionPath Type

**File**: `lib/visa/types.ts` (lines 302-310)

```typescript
export interface VisaTransitionPath {
  type: VisaType;
  name: string;
  requirements: string;
  timeline: string;
  documents: string[];
  notes: string;
}
```

| Check | Result | Severity |
|-------|--------|----------|
| `type` field uses `VisaType` union | Yes -- properly typed | None |
| All fields have proper types | Yes -- no `any`, no loose types | None |
| Used in `VisaInfo.pathsTo` and `VisaInfo.pathsFrom` | Yes -- `VisaTransitionPath[]` optional arrays | None |
| JSON data matches interface | Validated -- all visa JSONs conform to this structure | None |

**Verdict**: VisaTransitionPath is well-typed. However, `as any` usage has increased from Cycle 1, pulling the score down.

### Comparison to Cycle 1
**Decreased from 8/10 to 7/10** due to 2 additional `as any` casts in DashboardClient.tsx.

---

## 5. Data Integrity (7/10) [Weight: 15%]

### 5a. Visa JSON Structure Consistency

| Check | Result | Severity |
|-------|--------|----------|
| Same visa types in en/ja/zh-tw | **PASS** -- all 3 languages have exactly 12 types: d-2, d-4, d-7, d-8, d-10, e-2, e-7, f-1-d, f-2, f-4, f-6, h-1 | None |
| File count matches | **PASS** -- 12 files in each language directory | None |

### 5b. Structural Consistency Across Languages

The EN files have been significantly expanded with new fields (`pathsTo`, `pathsFrom`, `communityTips`, `renewal`, `eligibilityQuestions`, `gniBasedIncome`, `fixedIncomeRequirement`) while JA and ZH-TW files may not have all these new keys. Key structural mismatches are expected for the following fields on the enriched EN visas (d-2, d-10, e-7):

- `pathsTo` / `pathsFrom` -- newly added rich transition data
- `eligibilityQuestions` -- interactive eligibility check data
- `communityTips` -- research-based community tips
- `renewal` -- renewal/extension information

**Verdict**: EN is the source of truth and is well ahead of JA/ZH-TW in content completeness. The JA/ZH-TW files should be updated to include the same structural keys (with translated values).

| Severity | Issue |
|----------|-------|
| Warning | JA and ZH-TW visa files may be missing newer keys (`pathsTo`, `pathsFrom`, `eligibilityQuestions`, etc.) from enriched EN visas |

### 5c. Bidirectional Path Consistency

Ran automated validation of `pathsTo` / `pathsFrom` across all 12 EN visa types:

| Check | Result | Severity |
|-------|--------|----------|
| Broken visa type references | **PASS** -- 0 broken references. All `type` values in pathsTo/pathsFrom reference valid visa types | None |
| Bidirectional consistency | **2 ISSUES FOUND** | Warning |

**Bidirectional Issues:**

1. **E-2 `pathsFrom` references H-1, but H-1 `pathsTo` does NOT include E-2.**
   - `e-2.json` has `pathsFrom: [{ type: "h-1", ... }]`
   - `h-1.json` has `pathsTo: [d-10, d-2, d-4, e-7]` -- **missing E-2**
   - Fix: Add E-2 to H-1's `pathsTo` array

2. **F-1-D `pathsTo` references D-10, but D-10 `pathsFrom` does NOT include F-1-D.**
   - `f-1-d.json` has `pathsTo: [{ type: "d-10", ... }]`
   - `d-10.json` has `pathsFrom: [d-2, e-2, e-7, h-1, d-4, d-7, d-8]` -- **missing F-1-D**
   - Fix: Add F-1-D to D-10's `pathsFrom` array

### 5d. relatedVisas Validity

All `relatedVisas` arrays reference valid VisaType values. No broken references found.

---

## 6. i18n Coverage (5/10) [Weight: 15%]

### Translation Infrastructure
- 3 message files: `en.json`, `ja.json`, `zh-tw.json`
- `next-intl` configured via `next.config.mjs` with plugin at `./i18n/request.ts`

### Files Using i18n (9 files)

| File | Method |
|------|--------|
| `components/header.tsx` | `useTranslations()` |
| `components/footer.tsx` | `useTranslations()` |
| `components/hero-section.tsx` | `useTranslations()` |
| `components/sections/comparison-section.tsx` | `useTranslations()` |
| `components/visa/LegalDisclaimer.tsx` | `useTranslations()` |
| `components/visa/landing/SocialProofBar.tsx` | `useTranslations()` |
| `app/[lang]/page.tsx` | `getTranslations()` |
| `app/[lang]/[country]/page.tsx` | `getTranslations()` |
| `app/[lang]/[country]/visa/page.tsx` | `getTranslations()` |

### Pages / Components with Hardcoded English

| File/Component | Hardcoded String Count (approx) | Severity |
|----------------|:---:|----------|
| `app/[lang]/[country]/visa/path/page.tsx` | ~8 strings ("Visa Path Simulator", "Plan your visa journey", "Back to Visa Guide", etc.) | Warning |
| `components/visa/path/visa-path-simulator.tsx` | ~30+ strings ("What's your current visa?", "Where do you want to go?", destination labels, step labels, CTA text) | Critical |
| `components/visa/path/path-card.tsx` | ~6 strings ("Requirements", "Tips", "Common Pitfalls", "View full X guide") | Warning |
| `components/visa/dashboard/DashboardClient.tsx` | ~17 strings ("Start Your Visa Journey", "Find My Visa", "My Dashboard", status labels, etc.) | Critical |
| `components/visa/dashboard/NextActionCard.tsx` | ~5+ strings | Warning |
| `components/visa/StateDashboard.tsx` | ~15 strings | Critical |
| `components/visa/EligibilityQuiz.tsx` | ~10 strings | Warning |
| `components/visa/VisaComparisonTool.tsx` | ~8 strings | Warning |
| `components/visa/DocumentChecklist.tsx` | ~8 strings | Warning |
| `app/[lang]/[country]/bundles/page.tsx` | ~20+ strings (package names, descriptions, prices, features) | Critical |
| `app/[lang]/[country]/areas/page.tsx` | ~10+ strings | Warning |
| `app/(legal)/*` (terms, privacy, refund, business) | Full pages in English only | Warning |
| Footer legal disclaimer | Hardcoded English paragraph | Warning |

### Coverage Estimate

- **9 files** use `useTranslations` / `getTranslations`
- **~15+ page/component files** under `app/[lang]/` contain hardcoded English strings
- **Estimated i18n coverage: ~40-45%** of user-facing strings are translated

### Comparison to Cycle 1
**Improved from 3/10 to 5/10.** Key gains:
- `visa/page.tsx` (landing) now uses `getTranslations()` for ~70% of its strings (situation labels, CTA text, badges)
- `hero-section.tsx` now translated
- `LegalDisclaimer` component now translated
- `SocialProofBar` now translated

**Remaining gap**: Path simulator, dashboard, comparison tool, checklist, bundles, areas, and legal pages remain entirely in English. The new path simulator is the largest untranslated addition.

---

## 7. Component Quality (7/10) [Weight: 10%]

### 7a. Path Simulator (`components/visa/path/`)

| Check | Result | Severity |
|-------|--------|----------|
| `"use client"` directive | **PASS** -- both `visa-path-simulator.tsx` and `path-card.tsx` have it | None |
| Error handling | **WARNING** -- no try/catch around `getPathsToDestination()` or `getDestinationsFromPaths()` calls. If path data is corrupted, component crashes | Warning |
| `key` props in lists | **PASS** -- all `.map()` calls use appropriate keys (`sp.id`, `dest.visaType`, `step.key`, `altPath.id`, `audience`, `${step.visaType}-${step.order}`) | None |
| URL state management | **GOOD** -- uses `useSearchParams` + `router.replace` with `{ scroll: false }` for shareable URLs | None |
| Input validation | **PASS** -- `isValidStartId()` and `isValidVisaType()` validate URL params | None |
| Locale-aware links | **PASS** -- `buildHref()` properly constructs locale-prefixed paths | None |
| Suspense boundary | **PASS** -- `VisaPathSimulator` wrapped in `<Suspense>` with skeleton fallback on the page | None |
| Empty states | **PASS** -- handles "no destinations" case with helpful message and back button | None |

### 7b. Dashboard (`components/visa/dashboard/`)

| Check | Result | Severity |
|-------|--------|----------|
| `"use client"` directive | **PASS** -- `DashboardClient.tsx` has `'use client'` | None |
| Error handling | **PARTIAL** -- `fetchDashboardData` has try/catch, but `console.error` only (no user-facing error state shown) | Warning |
| `key` props in lists | **PASS** -- `checklistData.map()` uses stable keys | None |
| Loading state | **PASS** -- skeleton loading UI while auth/data loads | None |
| Not-logged-in state | **PASS** -- dedicated UI with sign-in/sign-up CTAs | None |
| Empty state | **PASS** -- `EmptyState` component for users with no progress data | None |
| **Locale-unaware links** | **CRITICAL** -- 8+ hardcoded links without locale prefix: `/visa/find`, `/visa`, `/visa/e-7`, `/visa/f-1-d`, `/visa/checklist/${type}`, `/auth/login`, `/auth/signup` | Critical |

### 7c. General Component Checks

| Check | Result | Severity |
|-------|--------|----------|
| All hook-using components have `"use client"` | **PASS** -- verified all 26 components using hooks have the directive (some use single quotes, some double) | None |
| `key` props using array index only (anti-pattern) | `path-card.tsx` uses `key={i}` for requirements/tips/pitfalls lists | Warning |

---

## 8. Nav & Locale Awareness (5/10) [Weight: 5%]

### 8a. Header (`components/header.tsx`)

| Check | Result | Severity |
|-------|--------|----------|
| Nav links locale-aware | **PASS** -- uses `buildLocalePath()` for `/bundles`, `/areas`, `/visa` | None |
| CTA button locale-aware | **PASS** -- links to `localePath("/bundles")` | None |
| Logo link locale-aware | **PASS** -- links to `localePath("/")` | None |
| Language switcher present | **PASS** -- `<LanguageSwitcher />` component | None |
| Mobile menu locale-aware | **PASS** -- same `navLinks` array used | None |

### 8b. Footer (`components/footer.tsx`)

| Check | Result | Severity |
|-------|--------|----------|
| Service links locale-aware | **PASS** -- `/bundles`, `/areas`, `/visa` use `localePath()` | None |
| Legal links locale-aware | **PASS (FIXED)** -- `/terms`, `/privacy`, `/refund` now use `localePath()` | None |
| Legal disclaimer text | **WARNING** -- hardcoded English paragraph at bottom (not translated) | Warning |

### 8c. Path Simulator Locale Awareness

| Check | Result | Severity |
|-------|--------|----------|
| `VisaPathSimulator` receives `lang` and `country` props | **PASS** | None |
| `buildHref()` constructs locale-prefixed paths | **PASS** -- correctly handles `en` (no prefix) vs other locales | None |
| Internal links use `buildHref()` | **PASS** -- checklist links, visa detail links | None |

### 8d. Dashboard Locale Awareness

| Check | Result | Severity |
|-------|--------|----------|
| Dashboard links are locale-aware | **FAIL** -- 8+ hardcoded paths without locale prefix | Critical |
| Auth links locale-aware | **FAIL** -- `/auth/login`, `/auth/signup` are hardcoded | Warning |

### Specific Hardcoded Links in Dashboard

```
/visa/find          (line 63)
/visa               (line 69)
/visa/e-7           (line 81)
/visa/f-1-d         (line 94)
/visa               (line 146)
/visa/checklist/... (line 233, 296)
/visa/...           (line 288)
/auth/login         (line 484)
/auth/signup        (line 489)
```

These links will lose locale context for non-English users.

### 8e. StateDashboard Locale Awareness

| Check | Result | Severity |
|-------|--------|----------|
| Links locale-aware | **FAIL** -- `/visa/start`, `/visa`, `/visa/e-7`, `/visa/d-2`, `/visa/compare` all hardcoded | Critical |

### Comparison to Cycle 1
**Decreased from 6/10 to 5/10.** While the footer legal links were fixed (Cycle 1 W1), the new dashboard and path simulator components introduced significant amounts of locale-unaware links. The StateDashboard component also has this issue.

---

## Summary of Findings

### Blockers (must fix before next deploy)
None.

### Critical Issues (should fix ASAP)

| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| C1 | Dashboard component has 8+ hardcoded links without locale prefix -- non-English users lose locale context | `components/visa/dashboard/DashboardClient.tsx` | S |
| C2 | StateDashboard has 5+ hardcoded links without locale prefix | `components/visa/StateDashboard.tsx` | S |
| C3 | Path simulator has 30+ hardcoded English strings -- untranslatable | `components/visa/path/visa-path-simulator.tsx`, `path-card.tsx` | M |
| C4 | EligibilityQuiz, VisaComparisonTool have hardcoded non-locale-aware links | `components/visa/EligibilityQuiz.tsx`, `VisaComparisonTool.tsx` | S |
| C5 | Bundles page entirely in English -- hardcoded package names, descriptions, prices, features | `app/[lang]/[country]/bundles/page.tsx` | M |

### Warnings (should fix, can defer)

| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| W1 | 4 instances of `as any` casts on Supabase operations | `auth-provider.tsx`, `DashboardClient.tsx` | S (regen types) |
| W2 | 2 bidirectional path inconsistencies (H-1 missing E-2 pathsTo, D-10 missing F-1-D pathsFrom) | `data/visas/en/h-1.json`, `data/visas/en/d-10.json` | XS |
| W3 | JA/ZH-TW visa files may lack newer keys (`pathsTo`, `pathsFrom`, `eligibilityQuestions`) | `data/visas/ja/*`, `data/visas/zh-tw/*` | M |
| W4 | No `images` optimization config in `next.config.mjs` | `next.config.mjs` | XS |
| W5 | Footer legal disclaimer is hardcoded English (not translated) | `components/footer.tsx` lines 96-102 | XS |
| W6 | `auth-provider.tsx` and `DashboardClient.tsx` log error objects that could contain user context | 2 files | XS |
| W7 | Path card uses `key={i}` (array index) for list items -- unstable keys if list order changes | `components/visa/path/path-card.tsx` | XS |
| W8 | Path simulator and dashboard have no try/catch around data-fetching utility calls | `visa-path-simulator.tsx`, `DashboardClient.tsx` (partial) | S |
| W9 | In-memory rate limiting resets on serverless cold starts | `app/api/subscribe/route.ts` | M |
| W10 | Legal pages (`/terms`, `/privacy`, `/refund`) are entirely in English | `app/(legal)/*` | L |

---

## Top 5 Technical Issues (Ranked by Severity)

1. **Dashboard & StateDashboard hardcoded links (C1, C2)** -- Non-English users navigating from the dashboard lose their locale context. Every link in these components bypasses the i18n routing. This is the highest-impact issue because the dashboard is a primary user-facing feature.

2. **Path simulator i18n gap (C3)** -- The new path simulator has 30+ hardcoded English strings and is a flagship feature. JA and ZH-TW users see a fully English experience for the entire visa path planning flow.

3. **i18n coverage at ~40-45% overall (C3, C5, W10)** -- While improved from Cycle 1's ~25-30%, the majority of feature content (bundles, areas, dashboard, path simulator, comparison tool, legal pages) remains in English. This undermines the multi-language support.

4. **Bidirectional path data inconsistencies (W2)** -- Two visa transition paths are not bidirectionally consistent. If a user looks at E-2's "how to get here from H-1" path but then navigates to H-1, they won't see E-2 as a destination. This creates a confusing data inconsistency.

5. **`as any` type casts increasing (W1)** -- Up from 2 to 4 instances. All are on Supabase table operations, meaning type safety is compromised on database interactions. A schema change could cause silent runtime failures.

---

## Comparison to Cycle 1

| Area | Cycle 1 | Cycle 2 | Change |
|------|---------|---------|--------|
| Overall Score | 62/100 | 72/100 | **+10** |
| Build & Config | 8/10 | 8/10 | Unchanged |
| Error Boundaries | 8/10 | 9/10 | **+1** (gaps filled) |
| Security | 8/10 | 8/10 | Unchanged (still robust) |
| Type Safety | 8/10 | 7/10 | **-1** (more `as any`) |
| i18n Coverage | 3/10 | 5/10 | **+2** (visa landing, hero, LegalDisclaimer translated) |
| Nav/Locale Awareness | 6/10 | 5/10 | **-1** (new components introduce hardcoded links) |

### Key Improvements from Cycle 1
- Error boundaries now cover all route groups (including `(legal)` and `visa/path`)
- Footer legal links now locale-aware (Cycle 1 W1 resolved)
- Visa landing page substantially i18n-ified
- Hero section and LegalDisclaimer component translated
- `SocialProofBar` translated

### Key Regressions from Cycle 1
- `as any` instances doubled (2 -> 4) with new DashboardClient code
- New components (path simulator, dashboard) introduced locale-unaware links
- New path simulator feature is entirely in English

---

## Recommended Priority Order

1. **C1/C2** -- Fix dashboard and StateDashboard hardcoded links to use locale-aware routing (high impact, small effort)
2. **C4** -- Fix EligibilityQuiz and VisaComparisonTool hardcoded links
3. **W2** -- Fix 2 bidirectional path inconsistencies (5-minute data fix)
4. **C3** -- Extract path simulator strings to i18n message files
5. **W1** -- Regenerate Supabase types to eliminate `as any` casts
6. **C5** -- i18n for bundles page
7. **W3** -- Sync JA/ZH-TW visa files with EN structural keys
8. **W5/W6** -- Minor fixes (disclaimer translation, log sanitization)
9. **W4** -- Add `images` config
10. **W9/W10** -- Longer-term: Redis rate limiting, legal page i18n
