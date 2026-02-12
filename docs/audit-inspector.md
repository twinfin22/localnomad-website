# LocalNomad Technical Quality Audit Report

**Audit Date:** 2026-02-11
**Auditor:** Inspector (Senior Frontend Engineer / Performance & Accessibility Specialist)
**Health Score:** 38/100
**Verdict:** A senior developer at a Korean tech startup would see potential but feel the product is "not quite ready for primetime." The core visa data and quiz engine are strong, but pervasive hardcoded English strings, missing loading/error states, no SEO infrastructure, and security gaps undermine the professional impression.

---

## Table of Contents

1. [Bug List by Severity](#bug-list-by-severity)
2. [i18n Completion Matrix](#i18n-completion-matrix)
3. [Performance Scorecard](#performance-scorecard)
4. [SEO Audit](#seo-audit)
5. [Accessibility Audit](#accessibility-audit)
6. [Security Review](#security-review)
7. [Code Quality Issues](#code-quality-issues)
8. [Route Map & Navigation](#route-map--navigation)
9. [Config & Build Issues](#config--build-issues)
10. [Prioritized Recommendations](#prioritized-recommendations)
11. [Top 5 "Unfinished" Signals](#top-5-unfinished-signals)
12. [Single Biggest Fix](#single-biggest-fix)

---

## Bug List by Severity

### Critical (Blocks Core Functionality)

| # | Issue | Location | Description |
|---|-------|----------|-------------|
| C1 | **`ignoreBuildErrors: true`** | `next.config.mjs` | TypeScript errors are silently suppressed in production builds. Any type error ships to users without warning. |
| C2 | **`images: { unoptimized: true }`** | `next.config.mjs` | ALL image optimization disabled. Every image serves at original size. |
| C3 | **Supabase client returns `null as any`** | `lib/supabase/client.ts:16` | When env vars are missing, `createBrowserClient()` returns `null as any`. Any component calling `.from()` or `.auth` on this will throw a runtime TypeError. |
| C4 | **Supabase server client uses `!` assertions** | `lib/supabase/server.ts` | Non-null assertions without guards. Server-side crash if env vars missing. |
| C5 | **Auth callback open redirect** | `app/auth/callback/route.ts` | Reads `next` query param and redirects to it. No validation. Attacker can craft `?next=https://evil.com`. |
| C6 | **Auth callback redirect lacks locale prefix** | `app/auth/callback/route.ts` | Redirects to `/visa/dashboard` without `/{lang}/{country}/` prefix, resulting in 404. |
| C7 | **Root page bypasses i18n entirely** | `app/page.tsx` | Imports HeroSection and marketing sections with 100% hardcoded English. Japanese/Chinese users hitting `/` see only English. |

### High (Degrades User Experience Significantly)

| # | Issue | Location | Description |
|---|-------|----------|-------------|
| H1 | **Visa landing page 100% hardcoded** | `app/[lang]/[country]/visa/page.tsx` | All situation texts ("I have a job offer in Korea", "I work remotely", trust badges, section headers) are English strings. Japanese/Chinese users see English. |
| H2 | **Bundles page ignores locale** | `app/[lang]/[country]/bundles/page.tsx` | All bundle titles, descriptions, prices, features hardcoded in English. |
| H3 | **Areas page ignores locale** | `app/[lang]/[country]/areas/page.tsx` | "Area Guide", "Coming Soon", "$99" pricing, Tally.so link all hardcoded English. |
| H4 | **Dashboard fully hardcoded** | `components/visa/dashboard/DashboardClient.tsx` | "Start Your Visa Journey", "My Dashboard", all status labels, all step descriptions in English. |
| H5 | **No loading states anywhere** | Entire `app/` directory | Zero `loading.tsx` files. Page navigation shows blank white flash before content renders. |
| H6 | **No error states** | Entire `app/` directory | Zero `error.tsx` files. API failures or data errors show React error boundary crash screen. |
| H7 | **No custom 404 page** | Missing `not-found.tsx` | Users hitting invalid URLs see Next.js default 404 page. |
| H8 | **Header/footer nav links lose locale** | `components/header.tsx`, `components/footer.tsx` | Links use hardcoded paths like `/bundles`, `/areas`, `/visa` without `/{lang}/{country}/` prefix. Clicking navigates out of locale context. |
| H9 | **Auth pages hardcode `<html lang="en">`** | `app/auth/layout.tsx` | Auth layout always renders `<html lang="en">` regardless of user's locale. |
| H10 | **Auth pages 100% hardcoded English** | `app/auth/login/page.tsx`, `app/auth/signup/page.tsx` | "Welcome back", "Sign in to track your visa progress", form labels all English. |
| H11 | **NextStepHero hardcoded** | `components/visa/NextStepHero.tsx` | All 8 step configurations (titles, descriptions, CTAs) hardcoded in English. |
| H12 | **VisaJourneyPage hardcoded** | `components/visa/journey/VisaJourneyPage.tsx` | "Back to Visa Guide", "Check if you qualify", step titles all hardcoded. |
| H13 | **LegalDisclaimer hardcoded** | `components/visa/LegalDisclaimer.tsx` | All three disclaimer variants (inline, box, banner) have English-only text. Critical for legal compliance that this be translated. |

### Medium (Polish Issues)

| # | Issue | Location | Description |
|---|-------|----------|-------------|
| M1 | **Theme toggle non-functional** | `app/[lang]/layout.tsx:64` | `forcedTheme="dark"` renders theme toggle useless. Toggle button exists but does nothing. |
| M2 | **Hero section hardcoded** | `components/hero-section.tsx` | "Your Korea Journey Starts Here", "Your Seoul Toolkit", service cards all English. |
| M3 | **WhySection hardcoded** | `components/sections/why-section.tsx` | "Why Choose Us", all value propositions hardcoded. |
| M4 | **ServicesDetailSection hardcoded** | `components/sections/services-detail-section.tsx` | All service descriptions, features, prices. |
| M5 | **Unused `_geistMono` font import** | `app/[lang]/layout.tsx` | Geist_Mono imported but assigned to unused `_geistMono` variable. |
| M6 | **Duplicate type definitions** | `lib/visa/stateMachine.ts` vs `lib/visa/types.ts` | `VisaState`, `VisaProgress`, `getDaysUntil`, `formatDaysRemaining` defined in both files. |
| M7 | **Missing hreflang tags** | All pages | No `<link rel="alternate" hreflang="...">` for SEO. |
| M8 | **Missing OG tags** | Most pages | Only basic title/description. No og:image, og:type, og:url. |

### Low (Minor Polish)

| # | Issue | Location | Description |
|---|-------|----------|-------------|
| L1 | **Error messages hardcoded** | `components/email-capture-dialog.tsx:44` | "Something went wrong" not translated. |
| L2 | **Placeholder texts hardcoded** | Various inputs | "First name", "Email address" not translated. |
| L3 | **Legal page text hardcoded** | `app/(legal)/terms/page.tsx`, `app/(legal)/privacy/page.tsx` | Entire Terms of Service and Privacy Policy in English only. |
| L4 | **Business page hardcoded** | `app/(legal)/business/page.tsx` | B2B landing page entirely English. |
| L5 | **`@types/mapbox-gl` in production deps** | `package.json` | Type definitions package in `dependencies` instead of `devDependencies`. |
| L6 | **Replit dev origins in config** | `next.config.mjs` | `*.replit.dev` in allowed origins. Should be dev-only. |

---

## i18n Completion Matrix

### Translation Files

| Locale | File | Keys | Status |
|--------|------|------|--------|
| en | `messages/en.json` | 287 | Base language, complete |
| ja | `messages/ja.json` | 287 | 100% key parity with en |
| zh-tw | `messages/zh-tw.json` | 287 | 100% key parity with en |
| ko | **MISSING** | 0 | Not created. Korean locale not in `lib/i18n/config.ts`. |
| vi | **MISSING** | 0 | Not created. Vietnamese not supported at all. |

### Supported Locales in Config

`lib/i18n/config.ts` defines: `en`, `ja`, `zh-tw`

**Missing locales critical for target audience:**
- `ko` (Korean) -- The product is ABOUT Korea but doesn't support Korean language. Research shows Korean companies struggle with visa processes too (Pain #3).
- `vi` (Vietnamese) -- Research identifies Vietnamese as a significant user base. Famigo supports 8 languages including Vietnamese.

### Actual i18n Usage in Components

| Category | Files Using `useTranslations` / `getTranslations` | Files With Hardcoded English | i18n Coverage |
|----------|---------------------------------------------------|-------------------------------|---------------|
| App routes (pages) | 6 | 14 | ~30% |
| Components (visa) | 2 | 12+ | ~15% |
| Components (sections) | 0 | 5 | 0% |
| Components (shared) | 2 | 3 | ~40% |
| Auth pages | 0 | 3 | 0% |
| Legal pages | 0 | 3 | 0% |

**Overall i18n completion: ~25%**

Translation files are 100% complete, but only ~25% of the UI actually uses them. The remaining ~75% is hardcoded English.

### Hardcoded Strings Inventory

| Component | Estimated Hardcoded Strings | Severity |
|-----------|---------------------------|----------|
| `app/page.tsx` (root page) | 50+ | Critical -- first page users see |
| `app/[lang]/[country]/visa/page.tsx` | 30+ | Critical -- core product |
| `app/[lang]/[country]/bundles/page.tsx` | 25+ | High |
| `app/[lang]/[country]/areas/page.tsx` | 20+ | High |
| `components/visa/dashboard/DashboardClient.tsx` | 40+ | High |
| `components/visa/NextStepHero.tsx` | 24+ | High |
| `components/visa/journey/VisaJourneyPage.tsx` | 15+ | High |
| `components/hero-section.tsx` | 20+ | Medium |
| `components/sections/why-section.tsx` | 15+ | Medium |
| `components/sections/services-detail-section.tsx` | 20+ | Medium |
| `components/visa/LegalDisclaimer.tsx` | 10+ | Medium (legal risk) |
| `app/auth/login/page.tsx` | 10+ | Medium |
| `app/auth/signup/page.tsx` | 10+ | Medium |
| `app/(legal)/terms/page.tsx` | 200+ | Low (entire page) |
| `app/(legal)/privacy/page.tsx` | 150+ | Low (entire page) |

**Total estimated hardcoded strings: 600+**

---

## Performance Scorecard

| Metric | Status | Details |
|--------|--------|---------|
| **Fonts** | GOOD | 1 font (Geist) via `next/font/google`. Geist_Mono imported but unused (minor waste). |
| **Image optimization** | CRITICAL | `images: { unoptimized: true }` in next.config.mjs disables ALL optimization. `sharp` is installed but not used. |
| **Bundle splitting** | MODERATE | 43 `"use client"` components found. Some could be server components. Heavy deps (mapbox-gl, recharts, date-fns) not lazily loaded. |
| **Loading states** | FAILING | Zero `loading.tsx` files. No skeleton screens. Navigation causes blank flash. |
| **Error handling** | FAILING | Zero `error.tsx` files. Unhandled errors show React crash screen. |
| **CSS** | GOOD | Tailwind CSS 4 with @theme inline. Semantic color tokens via oklch. Single stylesheet. |
| **Animations** | MODERATE | Hero has 100-700ms transition delays. AnimatedSection wrapper adds JS for scroll animations that could be CSS-only. |
| **Third-party scripts** | GOOD | Vercel Analytics and Speed Insights are lightweight. No bloated tracking scripts. |
| **LCP estimate** | MODERATE | Hero animation delays (100-700ms) push perceived load time. No critical resource preloading beyond `next/font` defaults. |

---

## SEO Audit

| Check | Status | Impact | Fix Priority |
|-------|--------|--------|-------------|
| `<title>` tags | PARTIAL | Root layout has basic title. Dynamic pages generate titles. Some pages missing. | Medium |
| `<meta description>` | PARTIAL | Inconsistent across pages. Some dynamic, some missing. | Medium |
| `robots.txt` | MISSING | Search engines have no crawl guidance. | High |
| `sitemap.xml` | MISSING | Search engines can't discover all pages efficiently. | High |
| `hreflang` tags | MISSING | Search engines can't associate language variants. Major i18n SEO gap. | Critical |
| `canonical` URLs | MISSING | Potential duplicate content issues across locales. | High |
| OpenGraph tags | MISSING | Poor social sharing appearance. No og:image on any page. | Medium |
| Twitter Card tags | MISSING | No Twitter/X card metadata. | Low |
| JSON-LD structured data | MISSING | No rich snippets (FAQ, breadcrumbs, how-to). Visa FAQ pages would benefit greatly. | Medium |
| `<h1>` hierarchy | GOOD | Pages generally have single h1 with proper hierarchy. | -- |
| Image alt text | PARTIAL | `next/image` components have alt text. Some decorative images lack `alt=""`. | Low |
| Dynamic visa page crawlability | UNCERTAIN | `generateStaticParams` present but may not cover all visa type/locale combos. | Medium |
| Custom 404 | MISSING | Default Next.js 404. Lost SEO opportunity for navigation recovery. | Medium |

---

## Accessibility Audit

| Issue | WCAG Level | Location | Impact |
|-------|-----------|----------|--------|
| **Touch targets** | GOOD (AA) | `globals.css` | 44px min-height rule for coarse pointers. Buttons use h-12 (48px). |
| **Color contrast** | NEEDS TESTING | All pages | Dark theme with oklch tokens -- contrast ratios not verified against WCAG 2.1 AA (4.5:1). |
| **Keyboard navigation** | PARTIAL | Header, forms | Header has keyboard support. Visa quiz keyboard nav not verified. |
| **Screen reader labels** | PARTIAL | Header has `aria-label`. | Many interactive elements lack aria labels (quiz options, checklist items). |
| **Focus indicators** | GOOD | shadcn/ui defaults | Ring focus styles present via Tailwind. |
| **Skip navigation** | MISSING | All pages | No "skip to main content" link. |
| **Language declaration** | BROKEN | Auth pages | `<html lang="en">` hardcoded in auth layout regardless of user locale. |
| **Form labels** | PARTIAL | Auth forms | Some inputs have labels, some use placeholder-only (anti-pattern). |
| **Error announcements** | MISSING | Forms | Form errors not announced to screen readers (no `aria-live` region). |
| **Mobile hamburger menu** | GOOD | Header | Proper aria-label, closes on link click. |
| **Heading hierarchy** | GOOD | Most pages | Generally correct h1/h2/h3 nesting. |
| **Motion preferences** | MISSING | Animations | No `prefers-reduced-motion` media query. AnimatedSection ignores this. |
| **Image alt text** | PARTIAL | Various | next/image instances have alt. Some decorative images may need `alt=""`. |

---

## Security Review

| # | Issue | Severity | Location | Description |
|---|-------|----------|----------|-------------|
| S1 | **Open redirect** | HIGH | `app/auth/callback/route.ts` | `next` query param used in redirect without validation. Phishing vector. |
| S2 | **No rate limiting** | MEDIUM | `app/api/subscribe/route.ts` | Email subscribe endpoint has no rate limiting. Enables email bombing/spam. |
| S3 | **PII logging** | MEDIUM | `app/api/subscribe/route.ts` | `console.log` likely logs email addresses in production. GDPR/privacy concern. |
| S4 | **Permissive email regex** | LOW | `app/api/subscribe/route.ts` | Basic regex for email validation. May accept malformed addresses. |
| S5 | **`null as any` type erasure** | MEDIUM | `lib/supabase/client.ts:16` | Hides null Supabase client. Runtime crashes instead of compile-time errors. |
| S6 | **Non-null assertions without guards** | MEDIUM | `lib/supabase/server.ts` | `!` assertions on env vars. Server crash if vars missing. |
| S7 | **No CSP headers** | LOW | `next.config.mjs` | No Content Security Policy. XSS mitigation gap. |
| S8 | **Replit origins in prod config** | LOW | `next.config.mjs` | `*.replit.dev` in allowed origins. Should be conditional on NODE_ENV. |

---

## Code Quality Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| Q1 | **36 `as unknown as` casts** | `lib/visa/data.ts` | Every visa JSON import cast to `as unknown as VisaInfo`. No runtime validation. |
| Q2 | **`as any` casts** | `lib/supabase/client.ts`, `components/providers/auth-provider.tsx` | Type safety bypassed. 3 instances found. |
| Q3 | **Duplicate types** | `lib/visa/stateMachine.ts` vs `lib/visa/types.ts` | VisaState, VisaProgress, getDaysUntil, formatDaysRemaining duplicated. |
| Q4 | **Package name `my-v0-project`** | `package.json` | Default v0 project name not updated to `localnomad-website`. |
| Q5 | **`ignoreBuildErrors: true`** | `next.config.mjs` | TypeScript errors invisible in builds. |
| Q6 | **No ESLint config** | Root directory | No `.eslintrc` or `eslint.config.js` found. `npm run lint` may use Next.js defaults only. |
| Q7 | **No test files** | Entire codebase | Zero test files (`*.test.ts`, `*.spec.ts`). No test framework installed. |
| Q8 | **`console.log` in production** | `app/api/subscribe/route.ts`, `lib/supabase/client.ts`, `components/providers/auth-provider.tsx` | console.log/warn/error calls that ship to production. |
| Q9 | **Unused imports** | `app/[lang]/layout.tsx` (`_geistMono`) | Geist_Mono imported but unused. |
| Q10 | **No `.env.example`** | Root directory | New developers have no reference for required env vars. |
| Q11 | **`components.json` wrong CSS path** | `components.json` | References `app/globals.css` but actual path is `styles/globals.css`. |
| Q12 | **40+ Radix UI packages** | `package.json` | Many likely unused. No tree-shaking audit done. |
| Q13 | **`@types/mapbox-gl` in prod deps** | `package.json` | Should be in `devDependencies`. |
| Q14 | **11 legacy redirects in config** | `next.config.mjs` | Old routes being redirected. May indicate URL structure churn. |
| Q15 | **Visa data has 36 raw JSON imports** | `lib/visa/data.ts` | One import per visa per locale. Could be dynamic imports or a single data index. |

---

## Route Map & Navigation

### All Routes Found

| Route | Type | Auth Required | i18n | Status |
|-------|------|---------------|------|--------|
| `/` | Static landing | No | NONE (hardcoded EN) | Live |
| `/[lang]` | Global landing | No | Partial | Live |
| `/[lang]/[country]` | Country hub | No | Uses translations | Live |
| `/[lang]/[country]/visa` | Visa landing | No | HARDCODED EN | Live |
| `/[lang]/[country]/visa/find` | Visa quiz | No | Partial | Live |
| `/[lang]/[country]/visa/compare` | Compare tool | No | HARDCODED EN | Live |
| `/[lang]/[country]/visa/[type]` | Visa detail | No | Uses visa data JSON | Live |
| `/[lang]/[country]/visa/checklist` | Checklist index | No | HARDCODED EN | Live |
| `/[lang]/[country]/visa/checklist/[type]` | Per-visa checklist | No | Partial | Live |
| `/[lang]/[country]/visa/dashboard` | Dashboard | YES | HARDCODED EN | Live |
| `/[lang]/[country]/areas` | Area guide | No | HARDCODED EN | Live |
| `/[lang]/[country]/bundles` | Bundles/pricing | No | HARDCODED EN | Live |
| `/auth/login` | Login | No | HARDCODED EN | Live |
| `/auth/signup` | Signup | No | HARDCODED EN | Live |
| `/auth/callback` | OAuth callback | -- | N/A | Live |
| `/terms` | Terms of Service | No | HARDCODED EN | Live |
| `/privacy` | Privacy Policy | No | HARDCODED EN | Live |
| `/business` | B2B landing | No | HARDCODED EN | Live |
| `/api/subscribe` | Email API | No | N/A | Live |

### Navigation Issues

1. **Header nav links**: Use hardcoded paths (`/bundles`, `/areas`, `/visa`) without locale/country prefix. Clicking from `/ja/korea/visa` would navigate to `/bundles` (broken).
2. **Footer nav links**: Same issue as header.
3. **Auth callback redirect**: Sends to `/visa/dashboard` without locale prefix. Results in 404.
4. **Country card links**: Work correctly with locale-aware paths.
5. **Visa detail internal links**: Most use relative paths correctly.

---

## Config & Build Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| B1 | `ignoreBuildErrors: true` | CRITICAL | `next.config.mjs` |
| B2 | `images: { unoptimized: true }` | CRITICAL | `next.config.mjs` |
| B3 | Package name `my-v0-project` | LOW | `package.json` |
| B4 | No ESLint config file | MEDIUM | Root |
| B5 | No `.env.example` | MEDIUM | Root |
| B6 | `components.json` wrong CSS path | LOW | `components.json` |
| B7 | `@types/mapbox-gl` in prod deps | LOW | `package.json` |
| B8 | Replit origins in prod config | LOW | `next.config.mjs` |
| B9 | No test framework or test files | HIGH | Entire project |

---

## Prioritized Recommendations

### Tier 1: Fix Now (Blocks Quality / Security)

| # | Action | Impact | Effort | Issue Ref |
|---|--------|--------|--------|-----------|
| 1 | Remove `ignoreBuildErrors: true` and fix all TS errors | Prevents shipping broken code | 1-3 days | C1, B1 |
| 2 | Fix open redirect in auth callback | Security vulnerability | 1 hour | C5, S1 |
| 3 | Remove `images: { unoptimized: true }` | Performance (LCP, bandwidth) | 30 min | C2, B2 |
| 4 | Fix Supabase `null as any` -- return proper typed null/throw | Prevents runtime crashes | 2 hours | C3, C4, S5, S6 |
| 5 | Fix header/footer nav links to include locale prefix | Navigation broken for non-EN users | 2 hours | H8 |
| 6 | Fix auth callback redirect to include locale prefix | Post-login broken for all users | 1 hour | C6 |
| 7 | Add rate limiting to subscribe API | Prevents abuse | 2 hours | S2 |
| 8 | Remove PII from console.log | Privacy compliance | 30 min | S3 |

### Tier 2: Fix This Sprint (User Experience)

| # | Action | Impact | Effort | Issue Ref |
|---|--------|--------|--------|-----------|
| 9 | Add `loading.tsx` with skeleton UI to all route groups | Eliminates blank flash | 1 day | H5 |
| 10 | Add `error.tsx` to all route groups | Graceful error handling | 1 day | H6 |
| 11 | Add `not-found.tsx` custom 404 page | Professional error page | 2 hours | H7 |
| 12 | Migrate visa landing page strings to i18n | Core product page broken for ja/zh-tw | 1 day | H1 |
| 13 | Migrate dashboard strings to i18n | Key feature broken for ja/zh-tw | 1 day | H4 |
| 14 | Migrate bundles page to i18n | Revenue page broken for ja/zh-tw | 4 hours | H2 |
| 15 | Fix auth layout `<html lang>` to use actual locale | Accessibility violation | 1 hour | H9 |

### Tier 3: Fix This Month (SEO & Polish)

| # | Action | Impact | Effort | Issue Ref |
|---|--------|--------|--------|-----------|
| 16 | Add `robots.txt` and `sitemap.xml` | SEO foundation | 2 hours | SEO |
| 17 | Add `hreflang` alternate tags | i18n SEO (major gap) | 4 hours | M7 |
| 18 | Add OpenGraph meta tags | Social sharing | 4 hours | M8 |
| 19 | Add `ko` (Korean) locale | Product about Korea needs Korean | 3 days | i18n |
| 20 | Add JSON-LD structured data for visa FAQ pages | Rich snippets in search | 1 day | SEO |
| 21 | Remove or make theme toggle functional | UX confusion | 2 hours | M1 |
| 22 | Deduplicate type definitions | Code quality | 2 hours | Q3, M6 |

### Tier 4: Backlog (Technical Debt)

| # | Action | Impact | Effort | Issue Ref |
|---|--------|--------|--------|-----------|
| 23 | Add runtime validation for visa JSON data (zod) | Data integrity | 2 days | Q1 |
| 24 | Add test framework and initial test suite | Quality assurance | 3 days | B9, Q7 |
| 25 | Lazy load Mapbox and Recharts | Bundle size | 4 hours | Perf |
| 26 | Audit and remove unused Radix packages | Bundle size | 2 hours | Q12 |
| 27 | Add `prefers-reduced-motion` support | Accessibility | 2 hours | A11y |
| 28 | Add Content Security Policy headers | Security hardening | 4 hours | S7 |
| 29 | Create `.env.example` | Developer experience | 30 min | Q10, B5 |
| 30 | Fix package name to `localnomad-website` | Professionalism | 5 min | Q4 |

---

## Top 5 "Unfinished" Signals

These are the things a senior developer would notice immediately and think "this isn't production-ready":

1. **Blank white flash on navigation** -- No loading.tsx files means every page transition shows emptiness before content renders. This is the single most visible quality gap.
2. **Japanese/Chinese users see English everywhere** -- The i18n system exists and translations are complete, but ~75% of components don't use them. Switching to Japanese changes the nav bar but the actual content stays English.
3. **No error handling visible** -- No error.tsx, no custom 404, no fallback UI. Errors show React's default crash screen.
4. **Auth flow breaks** -- Login callback redirects to wrong path, auth pages ignore locale, post-login experience is disjointed.
5. **TypeScript errors hidden** -- `ignoreBuildErrors: true` means the build succeeds even with type errors. This signals "we're shipping broken code and hiding it."

---

## Single Biggest Fix

**If you could only do ONE thing:** Remove `ignoreBuildErrors: true` from `next.config.mjs` and fix all resulting TypeScript errors.

**Why:** This single config flag is hiding an unknown number of type errors that are shipping to production. It undermines the entire type safety system. Every other fix depends on being able to trust that the build catches errors. Until this is fixed, you're building on a foundation you can't trust. A senior developer seeing this flag would immediately question the quality of everything else.

**Runner-up:** Add `loading.tsx` skeleton screens to all route groups. This is the most visible improvement for the least effort and would dramatically improve perceived performance and polish.

---

## Cross-Reference with User Research

### Research Pain Point #6: Language Barrier

The research specifically identifies language as pain point #6 and notes that Vietnamese and Chinese users are significant segments. Currently:
- Vietnamese: 0% support (no locale, no translations, not in config)
- Chinese (Traditional): Translation files complete but only ~25% of UI uses them
- Korean: Not supported despite the product being about Korea
- Famigo competitor already supports 8 languages including Vietnamese

### Research: Target Audience is Tech-Savvy Developers

The target audience is "tech-savvy devs earning 65K+ USD from Dev Korea / CodeSeoul Discord." These users:
- Will inspect the site's code quality (they'll notice `ignoreBuildErrors: true` in the config)
- Expect professional loading states and error handling
- Will test the site in their native language and notice the hardcoded English fallthrough
- Value tools over content -- the current product is mostly content with minimal tooling

### Research: Competitors Are Moving Fast

Kowork already has mobile app, eligibility test, expiry alerts. If LocalNomad's technical foundation isn't solid, it can't iterate fast enough to compete. The `ignoreBuildErrors: true` flag and missing test infrastructure mean every new feature is built on shaky ground.
