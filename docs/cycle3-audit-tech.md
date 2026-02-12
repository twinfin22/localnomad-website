# Cycle 3 -- Final Technical Health Audit

**Date**: 2026-02-12
**Commit**: de5309c
**Auditor**: Claude Opus 4.6

## Overall Score: 80/100

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Build & Config | 9/10 | 10% | 9.0 |
| Error Boundaries | 10/10 | 10% | 10.0 |
| Security | 9/10 | 10% | 9.0 |
| Type Safety | 8/10 | 10% | 8.0 |
| Data Integrity | 9/10 | 10% | 9.0 |
| i18n Coverage | 6/10 | 20% | 12.0 |
| Nav/Locale | 7/10 | 10% | 7.0 |
| Component Quality | 6/10 | 10% | 6.0 |
| SEO & Meta | 10/10 | 10% | 10.0 |
| **Total** | | **100%** | **80/100** |

---

## 1. Build & Config (9/10)

### Build
- `npm run build`: Passes cleanly. 119 static pages generated, 0 errors, 0 TypeScript errors during build.
- `npx tsc --noEmit`: Passes with zero type errors.

### Config (`next.config.mjs`)
- No `ignoreBuildErrors` or `ignoreDuringBuilds` flags. Clean.
- No `images` config needed (no `next/image` remote patterns required).
- Redirects properly handle legacy routes (`/visa` -> `/korea/visa`, etc.).
- `next-intl` plugin correctly configured.

### Middleware Deprecation
- **Warning present**: `The "middleware" file convention is deprecated. Please use "proxy" instead.`
- This is a Next.js 16 deprecation. The middleware at `middleware.ts` (259 lines) handles locale detection, auth redirects, and session management. Migration to `proxy` convention is non-trivial but should be planned.

### Deductions
- -1 pt: Middleware deprecation warning. Not a build break, but a known technical debt item.

---

## 2. Error Boundaries (10/10)

### Coverage Audit
Every route under `app/[lang]/[country]/` has both `loading.tsx` and `error.tsx`:

| Route | loading.tsx | error.tsx |
|-------|-------------|-----------|
| `app/` (root) | YES | YES |
| `app/[lang]/` | YES | YES |
| `app/[lang]/[country]/` | YES | YES |
| `app/[lang]/[country]/visa/` | YES | YES |
| `app/[lang]/[country]/visa/[type]/` | YES | YES |
| `app/[lang]/[country]/visa/checklist/` | YES | YES |
| `app/[lang]/[country]/visa/checklist/[type]/` | YES | YES |
| `app/[lang]/[country]/visa/dashboard/` | YES | YES |
| `app/[lang]/[country]/visa/find/` | YES | YES |
| `app/[lang]/[country]/visa/compare/` | YES | YES |
| `app/[lang]/[country]/visa/path/` | YES | YES |
| `app/[lang]/[country]/areas/` | YES | YES |
| `app/[lang]/[country]/bundles/` | YES | YES |
| `app/(legal)/` | YES | YES |
| `app/auth/` | YES | YES |

**15 loading.tsx files, 15 error.tsx files** -- complete coverage across all route segments.

---

## 3. Security (9/10)

### 3a. Open Redirect Mitigation
**File**: `app/auth/callback/route.ts`
- Excellent `sanitizeRedirect()` function with 4-layer defense:
  1. Rejects non-`/` prefixed paths
  2. Blocks `//` (protocol-relative URLs)
  3. Blocks `\` (backslash normalization tricks)
  4. Requires locale prefix `/{lang}/{country}/` via regex
- Default fallback: `/en/korea/visa/dashboard`

### 3b. Supabase Null Safety
- **Client** (`lib/supabase/client.ts`): Returns `null` when env vars missing, with `console.warn` (appropriate for client-side).
- **Server** (`lib/supabase/server.ts`): Throws `Error` when env vars missing (correct fail-fast behavior for server).

### 3c. Subscribe Route (`app/api/subscribe/route.ts`)
- Rate limiting: In-memory, per-IP, 5 requests/minute with lazy stale-entry eviction. Appropriate for serverless.
- Input validation: Email regex check, firstName trimming.
- PII in logs: **Clean** -- error messages use bracket-prefixed labels without email/name data (e.g., `[Subscribe] Email send failed via Resend`).

### 3d. console.log
- **0 instances** of `console.log` in `.ts`/`.tsx` files. All removed.

### 3e. dangerouslySetInnerHTML
- 4 instances in production code + 1 in `components/ui/chart.tsx` (shadcn managed):
  - `app/[lang]/[country]/visa/page.tsx:161` -- `JSON.stringify(landingJsonLd)` (safe, server-controlled)
  - `app/[lang]/[country]/visa/[type]/page.tsx:99,119` -- `JSON.stringify(faqJsonLd)` (safe)
  - `app/[lang]/[country]/visa/path/page.tsx:78` -- `JSON.stringify(jsonLd)` (safe)
- All use `JSON.stringify()` on server-generated structured data. No user input flows in. **Safe**.

### 3f. console.error Usage
- 24 instances of `console.error` across the codebase. Most are in error.tsx files (logging the error object). This is acceptable for error boundaries.
- Some strip the error object: `console.error('Error fetching dashboard data')` at `DashboardClient.tsx:442` and `console.error('Error migrating localStorage data')` at `auth-provider.tsx:136` -- these lose debugging context.

### Deductions
- -1 pt: Two `console.error` calls strip the error object, losing stack trace context for debugging. Should pass the error as a second argument.

---

## 4. Type Safety (8/10)

### as any
- **2 instances** in `components/providers/auth-provider.tsx`:
  - Line 97: `(supabase.from('visa_progress') as any).insert({...})`
  - Line 130: `(supabase.from('checklist_items') as any).insert(items)`
- Both are paired with `eslint-disable-next-line @typescript-eslint/no-explicit-any` comments.
- **Reason**: Supabase client returns untyped responses when the Database type doesn't include these tables. The `as any` casts are a workaround for incomplete `database.types.ts`.

### @ts-ignore / @ts-expect-error
- **0 instances**. Clean.

### eslint-disable
- **5 instances** total:
  - `auth-provider.tsx:96,129` -- `@typescript-eslint/no-explicit-any` (for the Supabase `as any` casts above)
  - `visa-path-simulator.tsx:144` -- `react-hooks/exhaustive-deps` (mount-only effect, justified by comment)
  - `DashboardClient.tsx:402,429` -- `@typescript-eslint/no-explicit-any` (Supabase response typing workaround)
- All have contextual justification.

### Deductions
- -2 pts: 4 `as any` + `eslint-disable` combinations across 2 files. The root cause is incomplete Supabase database types. Should define proper types in `database.types.ts` to eliminate these.

---

## 5. Data Integrity (9/10)

### PathsTo / PathsFrom Bidirectionality
Spot-checked bidirectional path consistency:

| From | To | pathsTo | pathsFrom | Bidirectional? |
|------|-----|---------|-----------|----------------|
| D-10 | E-7 | YES (d-10.json) | YES (e-7.json) | YES |
| D-10 | D-8 | YES | Not checked (stub) | N/A |
| D-10 | F-1-D | YES | YES (f-1-d.json) | YES |
| E-7 | F-2 | YES | YES (f-2.json) | YES |
| E-7 | D-10 | YES | YES (d-10.json) | YES |
| D-2 | D-10 | YES | YES (d-10.json) | YES |
| D-2 | E-7 | YES | YES (e-7.json) | YES |
| H-1 | D-10 | YES | YES (d-10.json) | YES |
| H-1 | D-2 | YES | YES (d-2.json) | YES |
| H-1 | E-7 | YES | YES (e-7.json) | YES |
| F-1-D | E-7 | YES | YES (e-7.json) | YES |
| F-1-D | D-10 | YES | YES (d-10.json) | YES |

All tested paths are bidirectional. The graph is consistent.

### nameKorean Coverage
- **162 total `nameKorean` fields** across 18 locale files (en, ja, zh-tw).
- All 6 fully-detailed visas (d-10, e-7, d-2, f-1-d, h-1, f-2) have `nameKorean` on every document entry.
- Stub visas (d-4, e-2, d-7, d-8, f-4, f-6) have empty `documents` arrays, so no `nameKorean` needed.

### Quiz Data (`data/quiz/questions.json`)
- 14 nationality options: US, UK, CA, AU, DE, FR, JP, Other EU, Vietnam, China, India, Philippines, Indonesia, Other.
- Coverage is reasonable for a Korea-focused product. Missing some notable countries (Thailand, Brazil, Russia, Mexico) but "Other Country" serves as catch-all.
- All conditional questions properly structured with required fields.

### Deductions
- -1 pt: Quiz nationality list could be more comprehensive. Missing Thailand, Brazil, Russia, and other significant source countries for Korea immigration.

---

## 6. i18n Coverage (6/10)

### Message Files
- 3 locale files: `en.json`, `ja.json`, `zh-tw.json`
- All **411 lines each** -- identical key structure across all three locales. Full key parity.
- **18 namespaces**: common, nav, home, hero, countryHub, visa, quiz, onboarding, eligibilityQuiz, dashboard, nextStepHero, bundles, areas, pathSimulator, languageBanner, legal, footer, auth

### Translation Usage
- **22 files** use `useTranslations` or `getTranslations`.
- Key components covered: header, footer, hero-section, visa landing page, quiz, path simulator, legal disclaimers, language banner, comparison section, social proof.

### Hardcoded English Strings (the main gap)
Significant hardcoded English strings found in the following components:

**`components/visa/VisaComparisonTool.tsx`** (entire component):
- Line 169: `"Select Visas to Compare"`
- Line 205: `"Add Visa"`
- Line 232: `"Select up to 4 visas to compare..."`
- Line 243: `"Attribute"`
- Line 310: `<Link href={"/visa/${visa.type}"}>`  (also a locale-missing link)
- Line 326: `"Not sure which visa is right?"`
- Line 329: `"Take our eligibility quiz..."`
- Lines 63-65: `"Duration"`, `"Max Duration"`, `"Application Fee"`, etc.
- Lines 84-94: `"Allowed"`, `"Not Allowed"`

**`components/visa/StateDashboard.tsx`** (extensive):
- Line 73: `"Start Your Visa Journey"`
- Line 77: `"Take our quick quiz..."`
- Line 84: `"Find My Visa"`
- Line 89: `"Browse All Visas"`
- Line 107-110: `"Professional Work Visa"`, `"For skilled workers"`
- Line 120-123: `"Student Visa"`, `"For degree programs"`
- Lines 157-243: All transition labels (`"I submitted my application"`, `"It's under review"`, `"I got approved!"`, etc.)
- Lines 265-268: `"Update Your Status"`
- Lines 345-348: Disclaimer text
- Lines 391-409: Settings labels (`"Target Visa Type"`, `"Target Date"`, etc.)
- Lines 563-567: `"My Journey"`, `"Visa"`
- Lines 624-636: `"Current Status"`
- Lines 664-680: `"While You Wait"`, `"Prepare for Arrival"`, `"Banking & Finance"` (entire section)

**`components/visa/dashboard/DashboardClient.tsx`**:
- Line 54-58: `"Start Your Visa Journey"`
- Line 85-93: Visa card labels (`"Professional Work Visa"`, `"Digital Nomad Visa"`)
- Line 159: `"My Dashboard"`
- Line 208-210: `"Document Progress"`
- Line 237-239: `"documents remaining"`
- Line 244-247: `"All documents ready!"`
- Line 253-257: `"Current Status"`
- Line 283-285: Disclaimer text
- Line 291-305: `"View Visa Details"`, `"Open Checklist"`
- Line 485: `"Sign in to continue"`
- Line 487: `"Create an account to track your visa progress"`

**`app/[lang]/[country]/visa/path/page.tsx`**:
- Line 93: `"Back to Visa Guide"`
- Line 102: `"Visa Path Simulator"`
- Line 105: `"Plan your visa journey step by step"`

**`components/visa/DocumentProgress.tsx`**:
- Line 253: `"View full visa requirements"`

**`app/error.tsx` and all error.tsx files**:
- Line 19-20: `"Something went wrong"`, `"An unexpected error occurred. Please try again."`
- Line 25: `"Try again"`

### Estimate
- **Message file coverage**: ~60% of user-facing UI strings are in the i18n system.
- **Remaining gap**: Dashboard components (`StateDashboard.tsx`, `DashboardClient.tsx`), comparison tool (`VisaComparisonTool.tsx`), path page hero, document progress, and all error.tsx files contain hardcoded English.
- The main user-facing pages (visa landing, hero, footer, header, quiz) are well-translated. The gap is primarily in authenticated/dashboard/tool components.

### Deductions
- -4 pts: ~40% of user-facing strings in dashboard/tool components remain hardcoded in English. The VisaComparisonTool, StateDashboard, DashboardClient, and path page hero are entirely un-i18n-ed.

---

## 7. Navigation & Locale Awareness (7/10)

### DashboardClient.tsx
- Uses `parseLocalePath` and `buildLocalePath` for all internal links. All `<Link href={localePath("/visa/...")}` patterns are locale-aware. **Good**.

### StateDashboard.tsx
- Same pattern: `parseLocalePath(pathname)` + `buildLocalePath()`. All internal links use `localePath()`. **Good**.

### Footer.tsx
- All links use `localePath()`: bundles, areas, visa, terms, privacy, refund. **Good**.

### Bare Links Without Locale Prefix
**4 files** contain links that bypass the locale system:

1. **`components/visa/VisaComparisonTool.tsx:310`**:
   ```tsx
   <Link href={`/visa/${visa.type}`}>
   ```
   Missing locale prefix. Should use `buildLocalePath`.

2. **`components/visa/VisaComparisonTool.tsx:331`**:
   ```tsx
   <Link href="/visa/quiz">
   ```
   Missing locale prefix. Also, `/visa/quiz` doesn't appear to be a valid route (the quiz is at `/visa/find`).

3. **`components/visa/DocumentProgress.tsx:250`**:
   ```tsx
   href={`/visa/${visaType}`}
   ```
   Missing locale prefix.

4. **`components/visa/journey/steps/StepAfterApproval.tsx:132`**:
   ```tsx
   href={`/visa/${v}`}
   ```
   Missing locale prefix.

5. **`components/visa/detail/DocumentPreview.tsx:67`**:
   ```tsx
   <Link href={`/visa/checklist/${visaType}`}>
   ```
   Missing locale prefix.

### Deductions
- -3 pts: 5 links across 4 component files lack locale prefix, which will break navigation for non-English users. One link (`/visa/quiz`) also points to a non-existent route.

---

## 8. Component Quality (6/10)

### Unstable React Keys (`key={index}`)
**47 instances** of `key={index}` or `key={i}` across the codebase. Notable files:

| File | Count | Notes |
|------|-------|-------|
| `components/visa/VisaDetailContent.tsx` | 10 | Static visa data arrays (low risk) |
| `components/visa/VisaComparisonTool.tsx` | 2 | Static comparison rows |
| `components/visa/journey/steps/StepApply.tsx` | 3 | Static step lists |
| `components/visa/EligibilityQuiz.tsx` | 1 | |
| `components/visa/DocumentChecklist.tsx` | 1 | |
| `components/sections/comparison-section.tsx` | 1 | Static comparison data |
| `components/social-proof-section.tsx` | 2 | Static testimonials |
| `components/sections/services-detail-section.tsx` | 2 | Static features |
| `components/business/*` | 4 | Static content arrays |
| Loading skeletons | ~8 | Static placeholder divs (acceptable) |
| `components/ui/slider.tsx`, `components/ui/field.tsx` | 2 | shadcn components (DO NOT MODIFY) |

Most are on static arrays (visa data, features lists) where items never reorder, so the practical risk is low. However, using stable keys from the data (e.g., `key={item.id}`) would be best practice.

### console.error Calls -- Error Object Stripping
Several `console.error` calls strip the error object, losing debugging context:

- `DashboardClient.tsx:442`: `console.error('Error fetching dashboard data')` -- no error object
- `auth-provider.tsx:136`: `console.error('Error migrating localStorage data')` -- no error object
- `lib/visa/stateMachine.ts:410`: `console.error("Failed to save visa progress")` -- no error object

In contrast, error.tsx files properly log `console.error(error)` with the error object.

### Loading/Empty States
- **DashboardClient.tsx**: Has loading skeleton (lines 460-474), not-logged-in state (lines 478-503), and empty state (lines 47-111). **Complete**.
- **StateDashboard.tsx**: Has SSR-safe `!mounted` loading state (lines 775-790) and empty state (lines 66-130). **Complete**.

### Suspense Boundaries
- **2 files** use `<Suspense>`:
  - `app/[lang]/[country]/visa/path/page.tsx:116` -- wraps `VisaPathSimulator` with skeleton fallback
  - `app/auth/login/page.tsx:175` -- wraps login form
- No other dynamic components use Suspense. Dashboard components rely on client-side loading states instead, which is acceptable for client components.

### Deductions
- -2 pts: 47 instances of `key={index}` -- mostly benign on static data, but several are in components that could receive dynamic data.
- -1 pt: 3 `console.error` calls strip the error object.
- -1 pt: Limited Suspense usage -- only 2 components wrapped. Client components use internal loading states (acceptable but less robust).

---

## 9. SEO & Meta (10/10)

### Structured Data (JSON-LD)
- **Visa landing page** (`app/[lang]/[country]/visa/page.tsx:141-155`): WebPage + ItemList schema with all 12 visa types.
- **Visa detail pages** (`app/[lang]/[country]/visa/[type]/page.tsx:76-90`): FAQPage schema with question/answer pairs for each visa type.
- **Visa path page** (`app/[lang]/[country]/visa/path/page.tsx:64-72`): WebApplication schema.

### Meta Descriptions
- **Visa landing**: Dynamic description using `t('visa.pageDescription', { country })`.
- **Visa detail pages**: Uses `visa.description` from JSON data.
- **Path simulator**: Static but descriptive meta.
- **Bundles page**: Uses `t('bundles.metaDescription')`.
- **Areas page**: Uses `t('areas.metaDescription')`.

### sitemap.xml and robots.txt
- **`app/sitemap.ts`**: Generates comprehensive sitemap with:
  - 3 locale home pages
  - 3 locale visa landing pages
  - 36 visa detail pages (12 types x 3 locales)
  - 9 visa tool pages (3 tools x 3 locales)
  - 6 section pages (areas + bundles x 3 locales)
  - 4 static pages (business, privacy, terms, refund)
  - Total: ~61 URLs with proper priority and change frequency.
- **`app/robots.ts`**: Allows all crawlers, disallows `/api/` and `/auth/`, includes sitemap reference.

### Score
Full marks -- structured data, meta descriptions, and sitemap/robots are all properly implemented.

---

## Summary of Findings

### Improvements Since Baseline (Cycle 1/2 -> Cycle 3)
1. **Build is clean**: Zero TypeScript errors, zero build warnings (excluding Next.js 16 middleware deprecation).
2. **Error boundaries are complete**: 15/15 routes have both loading.tsx and error.tsx.
3. **console.log eliminated**: Zero instances in production code (was a concern in earlier cycles).
4. **Open redirect hardened**: 4-layer defense in auth callback with locale-prefix regex validation.
5. **Supabase null safety**: Both client and server handle missing env vars gracefully.
6. **Rate limiting implemented**: Subscribe endpoint has per-IP rate limiting with stale-entry eviction.
7. **PII removed from logs**: All error logs use bracket-prefixed descriptive labels, no email/name leakage.
8. **dangerouslySetInnerHTML safe**: All 4 instances use `JSON.stringify` on server-controlled data.
9. **i18n key parity**: All 3 locale files (en, ja, zh-tw) have identical 411-line key structure.
10. **Visa path bidirectionality**: All tested pathsTo/pathsFrom are consistent.
11. **nameKorean coverage**: All fully-detailed visa documents have Korean names.
12. **SEO excellent**: JSON-LD structured data, comprehensive sitemap, proper robots.txt.
13. **Locale-aware links**: Footer, header, main dashboard components use `buildLocalePath`.

### Remaining Issues (Prioritized)

#### Blockers (0)
None. Build passes, no security vulnerabilities found.

#### Critical (2)
1. **5 links missing locale prefix** in `VisaComparisonTool.tsx`, `DocumentProgress.tsx`, `StepAfterApproval.tsx`, and `DocumentPreview.tsx`. These will break navigation for `ja` and `zh-tw` users. One link (`/visa/quiz`) points to a non-existent route.
2. **~40% of dashboard UI strings hardcoded in English** across `StateDashboard.tsx`, `DashboardClient.tsx`, and `VisaComparisonTool.tsx`. These components are entirely outside the i18n system.

#### Warnings (4)
3. **4 `as any` casts** in `auth-provider.tsx` and `DashboardClient.tsx` due to incomplete Supabase `database.types.ts`. Should define proper table types.
4. **47 `key={index}` instances** across component files. Most are on static arrays (low risk) but should use stable data-derived keys.
5. **3 `console.error` calls** strip the error object (lose stack traces): `DashboardClient.tsx:442`, `auth-provider.tsx:136`, `stateMachine.ts:410`.
6. **Middleware deprecation warning**: `middleware.ts` uses the deprecated `middleware` convention. Next.js 16 recommends `proxy`. Not urgent but should be migrated.

#### Nits (2)
7. **Quiz nationality list** could include Thailand, Brazil, Russia, and Mexico for broader coverage.
8. **Error.tsx files** all have hardcoded English ("Something went wrong", "Try again"). Should use i18n keys.
