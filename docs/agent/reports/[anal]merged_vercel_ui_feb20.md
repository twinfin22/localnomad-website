# Merged Diagnosis & Repair Plan — Vercel BP + UI/UX Pro Max

> **Date**: 2025-02-20 (merged 2026-02-21)
> **Sources**: `[anal]vercel-react-bp_feb20.md` (Vercel Best Practices), `[anal]ui-ux-pro_feb20.md` (UI/UX Pro Max)
> **Codebase**: LocalNomad b2c-website (Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui)
> **Status**: Diagnosis only — no changes executed. Gen's Tier 3 decisions recorded below.

---

## 1. Combined Scorecard

| Category | BP Score | UX Score | Notes |
|----------|----------|----------|-------|
| Eliminating Waterfalls | 3/10 | — | Sequential awaits everywhere, zero `Promise.all` |
| Bundle Size | 7/10 | — | Lean deps, but Supabase SDK ships to all pages |
| Server-Side Performance | 5/10 | — | `getVisaData` cached, `getSession` not cached |
| Client-Side Data Fetching | 8/10 | — | Minimal client fetching, proper `useTransition` |
| Re-render Optimization | 7/10 | — | Clean derived state, but state-during-render anti-pattern |
| Rendering Performance | 8/10 | — | No `suppressHydrationWarning`, proper conditional rendering |
| JavaScript Performance | 9/10 | — | No issues |
| Mobile-First Compliance | — | 7/10 | Good touch targets, font/padding need breakpoints |
| Accessibility | — | 5/10 | Missing ARIA labels, no skip-to-content |
| Component Quality | — | 8/10 | Clean shadcn/ui, but `<details>` should be `<Accordion>` |
| Visual Design | — | 8/10 | Strong brand, accent underused |
| Loading/Error/Empty States | — | 4/10 | No skeletons, no Suspense (overlap with BP-C3) |
| Animation/Transitions | — | 7/10 | Good micro-interactions, chevron animation fragile |
| Dark Mode | — | 3/10 | **Deferred by Gen** |
| Form UX | — | 6/10 | Generic errors, no spinner |
| Navigation | — | 6/10 | No breadcrumbs, no nav `aria-label` |
| Information Architecture | — | 9/10 | 3-layer structure excellent |

**Composite: BP 6.7/10, UX 6.3/10** — Strong foundation, needs performance + accessibility polish.

---

## 2. Deduplicated Findings

### 2a. Duplicates Removed

| BP Finding | UX Finding | Merged As |
|------------|------------|-----------|
| BP-C3 (zero Suspense) | UX-X6 (no loading skeletons) | **P3** |
| BP-N3 (`console.warn`) | UX-N5 (`console.warn`) | **N2** |
| — | UX-X1 (dark mode contrast) | **Deferred** |
| — | UX-X3 (dark mode hardcoded colors) | **Deferred** |
| — | UX-W10 (dark mode toggle) | **Deferred** |

### 2b. Actionable Findings (18 items + 5 nits)

| ID | Finding | Source | Severity | File(s) |
|----|---------|--------|----------|---------|
| **P1** | Sequential awaits — dashboard | BP-C1 | Critical | `app/[locale]/(protected)/dashboard/page.tsx` |
| **P2** | Sequential awaits — visa detail | BP-C2 | Critical | `app/[locale]/[country]/visa/[type]/page.tsx` |
| **P3** | Zero Suspense / `loading.tsx` | BP-C3 + UX-X6 | Critical | `app/` directory (new files) |
| **P4** | `getSession()` not cached | BP-W1 | Warning | `lib/actions/auth.ts` |
| **P5** | Full visa object serialized to ActionZone | BP-W2 | Warning | `app/[locale]/[country]/visa/[type]/page.tsx` |
| **P6** | AuthNav ships 60KB Supabase SDK everywhere | BP-W3 | Warning | `components/auth/auth-nav.tsx`, `app/[locale]/layout.tsx` |
| **P7** | AuthNav missing `.catch()` | BP-W4 | Warning | `components/auth/auth-nav.tsx` |
| **P8** | State-during-render in useChecklist | BP-W5 | Warning | `components/visa/action-zone.tsx` |
| **P9** | Barrel file imports (latent risk) | BP-W6 | Nit | All barrel `index.ts` files |
| **A1** | Missing ARIA labels on checkboxes | UX-X2 | Critical | `components/visa/action-zone.tsx` |
| **A2** | Form input missing `id`/`htmlFor` | UX-X5 | Critical | `components/dashboard/onboarding-form.tsx` |
| **A3** | `<details>` animation cross-browser | UX-X4 | Warning | `components/visa/action-zone.tsx` (migrate to Accordion) |
| **A4** | No nav `aria-label` | UX-W3 | Warning | `app/[locale]/layout.tsx` |
| **A5** | No skip-to-content link | UX-W4 | Warning | `app/[locale]/layout.tsx` |
| **U1** | Heading font sizes not mobile-optimized | UX-W1 | Warning | `components/visa/glanceable-zone.tsx`, `components/dashboard/dashboard-header.tsx` |
| **U2** | Hero padding excessive on mobile | UX-W2 | Warning | `components/landing/hero.tsx` |
| **U3** | Silent error on checklist save | UX-W5 | Warning | `components/visa/action-zone.tsx` |
| **U4** | Generic error messages | UX-W6 | Warning | `components/auth/login-form.tsx` |
| **U5** | No submit spinner on forms | UX-W8 | Warning | `components/auth/login-form.tsx`, `components/dashboard/onboarding-form.tsx` |
| **U6** | No breadcrumb navigation | UX-W7 | Warning | `app/[locale]/[country]/visa/[type]/page.tsx` |
| **U7** | Long text overflow on mobile | UX-W9 | Nit | Multiple |
| **N1** | Sequential loop in `getAvailableVisas` | BP-N1 | Nit | `lib/visa-data.ts` |
| **N2** | `console.warn` in production | BP-N3 + UX-N5 | Nit | `components/visa/action-zone.tsx` |

### 2c. Deferred (Not in Repair Plan)

| Finding | Source | Reason |
|---------|--------|--------|
| Dark mode primary color fails WCAG AA | UX-X1 | Gen: defer — not shipping dark mode yet |
| Hardcoded colors break dark mode (`dark:` variants) | UX-X3 | Gen: defer — not shipping dark mode yet |
| No dark mode toggle | UX-W10 | Gen: defer — not shipping dark mode yet |
| Inline style objects (`login-form`, `onboarding-form`) | BP-N2 | Negligible impact at current scale |
| Brand accent color underused | UX-N1 | Design preference, not a bug |
| No ripple/press effect on buttons | UX-N2 | Nice-to-have |
| SVG arrow missing accessible title | UX-N3 | Nit — decorative element |
| Inconsistent section spacing | UX-N4 | Nit — cosmetic |
| Error toast system (sonner) for U3 | UX-W5 | Gen: defer — keep silent revert for now |
| Barrel import strategy | BP-W6 | Gen: defer — low risk at current scale |

---

## 3. Repair Plan

### Tier 0: Quick Wins (~40 min) — Biggest ROI, minimal risk

| ID | Fix | Effort | File(s) |
|----|-----|--------|---------|
| **P4** | Wrap `getSession` in `React.cache()` | 5 min | `lib/actions/auth.ts` |
| **P1** | `Promise.all` in dashboard page | 10 min | `app/[locale]/(protected)/dashboard/page.tsx` |
| **P2** | `Promise.all` in visa detail page | 10 min | `app/[locale]/[country]/visa/[type]/page.tsx` |
| **A1** | Add `aria-label` to checkboxes | 10 min | `components/visa/action-zone.tsx` |
| **A2** | Add `id`/`htmlFor` to onboarding form inputs | 5 min | `components/dashboard/onboarding-form.tsx` |
| **A4+A5** | Nav `aria-label` + skip-to-content link | 5 min | `app/[locale]/layout.tsx` |

**Expected impact**:
- P4: Eliminates 2-3 redundant Supabase auth round-trips per request
- P1+P2: ~200-900ms faster page loads (parallel fetches)
- A1+A2+A4+A5: Screen reader accessibility baseline met

---

### Tier 1: Loading & Streaming (~1.5h)

| ID | Fix | Effort | File(s) |
|----|-----|--------|---------|
| **P3a** | Add `loading.tsx` to `(protected)/` route | 30 min | `app/[locale]/(protected)/loading.tsx` (new) |
| **P3b** | Add `loading.tsx` to `[country]/visa/[type]/` route | 30 min | `app/[locale]/[country]/visa/[type]/loading.tsx` (new) |
| **P3c** | Add `error.tsx` to critical routes | 15 min | `app/[locale]/(protected)/error.tsx` (new), `app/[locale]/[country]/visa/[type]/error.tsx` (new) |
| **P3d** | `<Suspense>` around auth-dependent section of visa detail | 15 min | `app/[locale]/[country]/visa/[type]/page.tsx` |

**Expected impact**:
- Perceived load time drops to near-zero (shell renders immediately, content streams in)
- Graceful error recovery instead of blank pages

---

### Tier 2: Component Fixes (~2h)

| ID | Fix | Effort | File(s) |
|----|-----|--------|---------|
| **P5** | Slim ActionZone props (pass only needed fields) | 15 min | `app/[locale]/[country]/visa/[type]/page.tsx` |
| **P7** | Add `.catch()` to AuthNav `useEffect` | 5 min | `components/auth/auth-nav.tsx` |
| **P8** | Fix state-during-render → lazy state initializer | 15 min | `components/visa/action-zone.tsx` |
| **A3** | Migrate action-zone `<details>` → shadcn/ui `<Accordion>`; fix CSS animation in context-zone (keep `<details>` there as server component) | 30 min | `components/visa/action-zone.tsx`, `components/visa/context-zone.tsx` |
| **U1** | Mobile-optimize heading font sizes (`text-2xl sm:text-3xl`) | 10 min | `components/visa/glanceable-zone.tsx`, `components/dashboard/dashboard-header.tsx` |
| **U2** | Reduce hero padding (`py-8 sm:py-16`) | 5 min | `components/landing/hero.tsx` |
| **U5** | Add submit spinner (`Loader2` icon) to forms | 15 min | `components/auth/login-form.tsx`, `components/dashboard/onboarding-form.tsx` |
| **N1** | Preventive `Promise.all` in `getAvailableVisas` loop | 5 min | `lib/visa-data.ts` |
| **N2** | Remove/gate `console.warn` behind `NODE_ENV` | 5 min | `components/visa/action-zone.tsx` |

**Expected impact**:
- P5: ~12KB RSC payload reduction per visa page
- P8: Correctness + SSR safety
- A3: Cross-browser reliable accordion animation + keyboard accessibility
- U1+U2: Mobile-first compliance

---

### Tier 3: Architectural Changes (~2h) — Gen-approved decisions

#### P6: Rewrite AuthNav as Server Component (45 min)

**Gen's decision**: Option A — Server Component rewrite. JS 0KB, best SEO.

**Files**: `components/auth/auth-nav.tsx`, `app/[locale]/layout.tsx`

**Approach**:
1. Remove `"use client"` from AuthNav
2. Replace client-side `supabase.auth.getUser()` with server-side `getSession()` call
3. Remove `useState`, `useEffect`, `createClient` imports
4. Render auth state server-side (eliminates Supabase browser SDK from all public pages)
5. For logout action: small client component for the button only, or use server action

**Impact**: ~60KB client bundle reduction on all public pages.

#### U4: Specific Error Messages + 4-Language i18n (30 min)

**Gen's decision**: Fix now — add specific messages, 4 languages.

**Files**: `components/auth/login-form.tsx`, `components/dashboard/onboarding-form.tsx`, `messages/{en,ja,zh-tw,vi}.json`

**Approach**:
1. Replace generic `t('error')` with specific error keys: `errorInvalidEmail`, `errorNetworkFailed`, `errorTooManyAttempts`
2. Add corresponding translations to all 4 locale files
3. Map Supabase error codes to specific user-facing messages

#### U6: Add Breadcrumb Navigation (30 min)

**Gen's decision**: Add now — SEO benefit + user orientation.

**Files**: new `components/ui/breadcrumb.tsx`, `app/[locale]/[country]/visa/[type]/page.tsx`

**Approach**:
1. Create breadcrumb component with `aria-label="Breadcrumb"` and `<ol>` structure
2. Use JSON-LD `BreadcrumbList` schema for SEO
3. Integrate into visa detail page: Home → {Country} → {Visa Name}
4. Style with `text-sm text-muted-foreground`, separator `/`

---

### Summary

| Tier | Effort | Items | Key Outcome |
|------|--------|-------|-------------|
| 0: Quick Wins | ~40 min | P1, P2, P4, A1, A2, A4, A5 | Parallel fetches + accessibility baseline |
| 1: Loading & Streaming | ~1.5h | P3a-d | Streaming HTML, error recovery |
| 2: Component Fixes | ~2h | P5, P7, P8, A3, U1, U2, U5, N1, N2 | Bundle reduction, cross-browser, mobile-first |
| 3: Architectural | ~2h | P6, U4, U6 | Server AuthNav, i18n errors, breadcrumbs |
| **Total** | **~6h** | **23 items** | |

---

## 4. Positive Patterns — Preserve These

These patterns are working well and should be maintained as the codebase grows.

### Performance

| Pattern | Where | Rule |
|---------|-------|------|
| `React.cache()` on visa data loader | `lib/visa-data.ts:47,64` | `server-cache-react` |
| `useTransition` for server action mutations | `checklist-card.tsx`, `action-zone.tsx` | `rerender-transitions` |
| Derived values computed in render (not stored in state) | `action-zone.tsx:144-149` | `rerender-derived-state` |
| Server Components as default (64% ratio) | All feature folders | RSC discipline |
| `@next/third-parties/google` for GA | `layout.tsx:6` | `bundle-defer-third-party` |
| Dynamic imports for visa JSON data | `lib/visa-data.ts` | `bundle-conditional` |
| Proper conditional rendering (guarded `&&`) | All components | `rendering-conditional-render` |
| No `suppressHydrationWarning` | Entire codebase | Policy enforced |
| No `any`, `@ts-ignore`, `eslint-disable` | Entire codebase | Clean code |
| Lazy state initialization for localStorage | `action-zone.tsx` (partial) | `rerender-lazy-state-init` |

### UI/UX

| Pattern | Where |
|---------|-------|
| 44px+ touch targets everywhere | All interactive elements |
| 3-layer information architecture | Visa detail page (Glanceable → Action → Context) |
| Backloading with expandable sections | Glanceable/Context zones |
| Brand color system in CSS variables | `globals.css` |
| Lora + Inter font pairing | `layout.tsx` |
| Progress bar with smooth transition | `action-zone.tsx:168` |
| Hover micro-interactions | `country-card.tsx` |
| Error messages with `role="alert"` | `login-form.tsx`, `onboarding-form.tsx` |
| Dual checklist (localStorage + Supabase) | `action-zone.tsx` |
| Back link with 44px touch target | Visa detail page |
| Consistent border/radius/shadow | All card components |
| Emoji as accessible `img` role | `country-card.tsx:15` |

---

## 5. What's Built vs Missing — Phase 1 Status

### Built (Phase 1) ✅

| Feature | Status | Notes |
|---------|--------|-------|
| F-1-D visa detail page | Complete | 3-layer structure, SEO, Schema.org |
| Auth (magic link) | Complete | Supabase OTP |
| Dashboard (basic) | Complete | D-Day countdown + checklist |
| Onboarding flow | Complete | Country → visa → date wizard |
| i18n (4 locales) | Complete | en, ja, zh-tw, vi |
| Footer + legal pages | Complete | Terms, privacy, refund |
| Brand theming | Complete | Colors, fonts, logo, CSS variables |

### Missing (Phase 2+)

| Feature | Phase | Priority |
|---------|-------|----------|
| Korea: E-7, D-8, H-1, F-2 visa data + pages | Phase 2 | High |
| Taiwan: DNV, Gold Card visa data + pages | Phase 2 | High |
| Visa Type Overview page | Phase 2 | High |
| Visa Comparison Tool (mobile 2-up, desktop 4-up) | Phase 2 | High |
| SEO: sitemap.xml, OG images | Phase 2 | High |
| Country landing pages (currently "Coming Soon") | Phase 2 | Medium |
| Path Simulator | Phase 3 | Medium |
| Score-based visa tracker (OASIS, F-2-7, E-7-4) | Phase 3 | Medium |
| Tax Residency Tracker | Phase 3 | Low |
| Dashboard timeline alerts | Phase 3 | Low |
| Email notifications | Post-MVP | Low |
| File Sanitizer | Post-MVP | Low |
| News feed | Post-MVP | Low |

### UI/UX Gaps for Upcoming Features

- **Comparison Tool**: Will need responsive table/card layout (2-col mobile, 4-col desktop)
- **Path Simulator**: Will need flow visualization component (react-flow or similar)
- **Score Tracker**: Will need form inputs + calculated display
- **Breadcrumbs**: Should be added in Tier 3 before Phase 2 (more pages = more navigation needed)

---

*Merged report generated from Vercel React Best Practices and UI/UX Pro Max audits. No code changes were made.*
