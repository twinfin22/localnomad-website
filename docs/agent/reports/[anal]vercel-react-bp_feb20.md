# Vercel React Best Practices — Diagnosis Report

> **Date**: 2025-02-20
> **Scope**: Full codebase audit against Vercel's 57 React/Next.js performance rules
> **Codebase**: LocalNomad b2c-website (Next.js 16, React 19, TypeScript 5)
> **Status**: Diagnosis only — no changes executed

---

## Executive Summary

The codebase is **lean and well-architected** with strong Server Component defaults (64% server components), minimal dependencies, and clean state management. However, there are **3 critical**, **6 warning**, and **3 nit-level** issues against Vercel best practices. The most impactful fixes are: (1) parallelizing sequential awaits, (2) adding Suspense boundaries for streaming, and (3) wrapping `getSession` in `React.cache()`.

### Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| Eliminating Waterfalls | 3/10 | Sequential awaits everywhere, zero Suspense, zero Promise.all |
| Bundle Size | 7/10 | Lean deps, but barrel imports + Supabase SDK on all pages |
| Server-Side Performance | 5/10 | Good cache() on visa data, but getSession not cached, large serialization |
| Client-Side Data Fetching | 8/10 | Minimal client fetching, proper useTransition |
| Re-render Optimization | 7/10 | Clean derived state, but state-during-render anti-pattern |
| Rendering Performance | 8/10 | No suppressHydrationWarning, proper conditional rendering |
| JavaScript Performance | 9/10 | No issues found |
| Advanced Patterns | N/A | Not applicable at current scale |

---

## Critical Issues (Must Fix)

### C1. Sequential Awaits — Dashboard Page
**Rule**: `async-parallel` (Priority 1 — CRITICAL)
**File**: `app/[locale]/(protected)/dashboard/page.tsx:31-35`

```typescript
// CURRENT: Sequential — each waits for the previous
const t = await getTranslations('Dashboard');
const countrySlug = COUNTRY_CODE_TO_SLUG[activeVisa.country] ?? 'korea';
const visa = await getVisaData(countrySlug, locale, activeVisa.visa_type);
const checklist = await getChecklist(activeVisa.id);
```

**Problem**: Three independent fetches run in series. `getTranslations`, `getVisaData`, and `getChecklist` have zero data dependencies on each other (all depend on `activeVisa`, which is already resolved).

**Fix**:
```typescript
const countrySlug = COUNTRY_CODE_TO_SLUG[activeVisa.country] ?? 'korea';
const [t, visa, checklist] = await Promise.all([
  getTranslations('Dashboard'),
  getVisaData(countrySlug, locale, activeVisa.visa_type),
  getChecklist(activeVisa.id),
]);
```

**Impact**: ~200-600ms saved per dashboard load (depending on Supabase/i18n latency).

---

### C2. Sequential Awaits — Visa Detail Page
**Rule**: `async-parallel` (Priority 1 — CRITICAL)
**File**: `app/[locale]/[country]/visa/[type]/page.tsx:86-88`

```typescript
// CURRENT: Sequential — three independent calls
const visa = await getVisaData(country as Country, locale, type);
const tc = await getTranslations('Common');
const t = await getTranslations('VisaDetail');
```

**Fix**:
```typescript
const [visa, tc, t] = await Promise.all([
  getVisaData(country as Country, locale, type),
  getTranslations('Common'),
  getTranslations('VisaDetail'),
]);
```

**Secondary waterfall** at lines 113-125 (authenticated users):
```typescript
const user = await getSession();           // 1st auth call
if (user) {
  const activeVisa = await getActiveVisa(); // 2nd auth call (internal getSession)
  if (activeVisa && ...) {
    serverChecklist = await getChecklist(activeVisa.id); // 3rd auth call (internal getSession)
  }
}
```

**Problem**: Triple redundant `getSession()` calls within one request. See W1 below.

**Impact**: ~300-900ms saved per visa page load.

---

### C3. Zero Suspense Boundaries / Loading States
**Rule**: `async-suspense-boundaries` (Priority 1 — CRITICAL)
**Files**: Entire `app/` directory

**Evidence**:
- `<Suspense>` imported/used: **0 times**
- `loading.tsx` files: **0**
- `error.tsx` files: **0**

**Affected pages with async data fetching**:

| Page | Async Operations | Blocks Until Complete |
|------|-----------------|---------------------|
| Dashboard | getActiveVisa + getVisaData + getChecklist + getTranslations | Yes |
| Visa Detail | getVisaData + 2x getTranslations + optional auth chain | Yes |
| Protected Layout | getSession | Yes (blocks ALL child routes) |
| Onboarding | getActiveVisa + getTranslations | Yes |

**Problem**: Without Suspense boundaries, Next.js cannot stream any HTML to the client until the entire page's async tree resolves. Users see a blank white page during all data fetching.

**Fix (Priority Order)**:
1. Add `loading.tsx` to `app/[locale]/(protected)/` — enables streaming for dashboard
2. Add `loading.tsx` to `app/[locale]/[country]/visa/[type]/` — enables streaming for visa detail
3. Add `<Suspense>` around auth-dependent sections of visa detail page — main content streams immediately while auth loads
4. Add `error.tsx` to critical routes — graceful degradation

**Impact**: Perceived load time drops to near-zero (shell renders immediately, content streams in).

---

## Warning Issues (Should Fix)

### W1. `getSession()` Not Wrapped in `React.cache()`
**Rule**: `server-cache-react` (Priority 3 — HIGH)
**File**: `lib/actions/auth.ts:7`

```typescript
// CURRENT: Plain async function — no deduplication
export const getSession = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return !error && user ? user : null;
};
```

**Problem**: Called 3-4 times per request on dashboard page (layout auth check + getActiveVisa + getChecklist each call getSession internally). Each call makes a separate Supabase API round-trip.

**Compare with** `lib/visa-data.ts:47` which correctly uses `cache()`:
```typescript
export const getVisaData = cache(async (...) => { ... }); // ✅ Deduplicated
```

**Fix**:
```typescript
import { cache } from 'react';
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return !error && user ? user : null;
});
```

**Impact**: Eliminates 2-3 redundant Supabase auth round-trips per request.

---

### W2. Full Visa Object Serialized to Client Component
**Rule**: `server-serialization` (Priority 3 — HIGH)
**File**: `app/[locale]/[country]/visa/[type]/page.tsx:182-188`

```typescript
<ActionZone visa={visa} country={country} ... />  // CLIENT component receives ~18KB visa object
```

**Problem**: `ActionZone` is a `"use client"` component that receives the full `visa` object (~18KB JSON) as a prop. It only uses:
- `visa.type` (string)
- `visa.documents` (array)
- `visa.applicationSteps` (array)

It does NOT use: `eligibility`, `faqs`, `tips`, `communityTips`, `officialLinks`, `warnings`, `incomeRequirement`, `workPermission`, `duration`, `fees`, `processingTime`, `renewal`, `pathsTo`, `pathsFrom`, etc.

**Compare with** dashboard page which does it correctly:
```typescript
<ChecklistCard documents={visa.documents} ... />  // ✅ Only passes needed fields
```

**Fix**: Extract only needed fields in the server component:
```typescript
<ActionZone
  visaType={visa.type}
  documents={visa.documents}
  applicationSteps={visa.applicationSteps}
  country={country}
  ...
/>
```

**Impact**: ~12KB reduction in RSC payload per visa page load.

---

### W3. AuthNav Ships Supabase SDK to Every Page
**Rule**: `bundle-defer-third-party` (Priority 2 — CRITICAL category)
**File**: `components/auth/auth-nav.tsx` (imported in root layout)

```typescript
'use client';
import { createClient } from '@/lib/supabase/client'; // ~60KB gzipped Supabase SDK
```

**Problem**: `AuthNav` is rendered in `app/[locale]/layout.tsx` (root layout), meaning the Supabase browser client SDK ships to EVERY page — including public pages (landing, visa detail) where auth is not needed.

**Options**:
1. **Server Component AuthNav**: Use `getSession()` server action instead of client-side `getUser()`. Eliminates Supabase client bundle entirely
2. **Dynamic import**: `next/dynamic` with `ssr: false` for AuthNav — lazy loads after hydration
3. **Route-specific placement**: Only include AuthNav in protected route layouts

**Impact**: ~60KB client bundle reduction on all public pages.

---

### W4. AuthNav Missing Error Handling
**Rule**: General correctness
**File**: `components/auth/auth-nav.tsx:14-19`

```typescript
useEffect(() => {
  const supabase = createClient();
  supabase.auth.getUser().then(({ data }) => {
    setUser(data.user);
    setLoaded(true);
  });
  // ❌ No .catch() — unhandled promise rejection if getUser fails
}, []);
```

**Fix**:
```typescript
supabase.auth.getUser()
  .then(({ data }) => { setUser(data.user); setLoaded(true); })
  .catch(() => { setLoaded(true); }); // Graceful fallback: show logged-out state
```

---

### W5. State Set During Render (Outside useEffect)
**Rule**: `rerender-derived-state-no-effect` (but misapplied)
**File**: `components/visa/action-zone.tsx:52-55`

```typescript
// Inside useChecklist hook — DURING RENDER, not in useEffect:
if (!initialized && typeof window !== 'undefined') {
  setChecked(readChecklist(storageKey));  // ❌ setState during render
  setInitialized(true);                   // ❌ setState during render
}
```

**Problem**: Reads `localStorage` and calls `setState` in the render path. While React 19 handles this (synchronous re-render), it:
1. Breaks "pure render" expectations
2. Risks SSR issues if the `typeof window` guard fails
3. Is unconventional and confusing for other developers

**Fix**: Move to `useEffect` or use lazy state initializer:
```typescript
const [checked, setChecked] = useState<Record<string, boolean>>(() => {
  if (typeof window === 'undefined') return {};
  return readChecklist(storageKey);
});
```

---

### W6. All Imports Use Barrel Files
**Rule**: `bundle-barrel-imports` (Priority 2 — CRITICAL category)
**Files**: All 7 app route files import from barrel `index.ts` files

| Barrel File | Exports | Consumers |
|-------------|---------|-----------|
| `components/landing/index.ts` | Hero, CountryCard | landing page |
| `components/footer/index.ts` | Footer | root layout |
| `components/visa/index.ts` | GlanceableZone, ActionZone, ContextZone, VisaDisclaimer | visa detail page |
| `components/dashboard/index.ts` | DashboardHeader, DDayCountdown, ChecklistCard, OnboardingForm | dashboard, onboarding |
| `components/auth/index.ts` | LoginForm, AuthNav | root layout, login page |

**Problem**: Next.js with webpack generally handles barrel re-exports well, but the `dashboard/index.ts` barrel is concerning — the onboarding page imports only `OnboardingForm` but the barrel forces evaluation of all exports (including `ChecklistCard` with its Supabase imports).

**Severity**: Low risk with current webpack config, but a latent issue as the codebase grows. Consider using `optimizePackageImports` in `next.config.ts` or switching to direct imports for heavy component folders.

---

## Nit Issues (Optional)

### N1. Sequential Loop in `getAvailableVisas`
**Rule**: `async-parallel`
**File**: `lib/visa-data.ts:69-81`

```typescript
for (const type of types) {
  const visa = await loadVisaJson(country, locale, type); // Sequential
  if (visa) { summaries.push({ ... }); }
}
```

**Current impact**: Zero (only 1 visa type exists). **Future impact**: Linear waterfall as visa types are added.

**Preventive fix**:
```typescript
const visas = await Promise.all(types.map(t => loadVisaJson(country, locale, t)));
```

---

### N2. Inline Constant Style Objects
**Rule**: `rerender-memo-with-default-value`
**Files**: `login-form.tsx:52`, `onboarding-form.tsx:154`

```typescript
style={{ fontSize: '16px', minHeight: '44px' }}  // New object every render
```

Could be extracted to module-level constant. Negligible performance impact at current scale.

---

### N3. `console.warn` in Production Code
**File**: `components/visa/action-zone.tsx:41,75`

localStorage error handling uses `console.warn`. Consider removing or gating behind `process.env.NODE_ENV === 'development'`.

---

## Positive Patterns (Keep Doing)

| Pattern | Where | Rule |
|---------|-------|------|
| `React.cache()` on visa data loader | `lib/visa-data.ts:47,64` | `server-cache-react` |
| `useTransition` for server action mutations | `checklist-card.tsx`, `action-zone.tsx` | `rerender-transitions` |
| Derived values computed in render (not stored in state) | `action-zone.tsx:144-149` | `rerender-derived-state` |
| Server Components as default (64% ratio) | All feature folders | RSC discipline |
| `@next/third-parties/google` for GA | `layout.tsx:6` | `bundle-defer-third-party` |
| Proper conditional rendering (guarded &&) | All components | `rendering-conditional-render` |
| No `suppressHydrationWarning` | Entire codebase | Policy enforced |
| No `any`, `@ts-ignore`, `eslint-disable` | Entire codebase | Clean code |
| Lazy state initialization for localStorage | `action-zone.tsx` (partial) | `rerender-lazy-state-init` |
| Dynamic imports for visa JSON data | `lib/visa-data.ts` | `bundle-conditional` |

---

## Recommended Fix Priority

| # | Issue | Severity | Effort | Impact |
|---|-------|----------|--------|--------|
| 1 | Wrap `getSession` in `React.cache()` | Warning | 5 min | Eliminates 2-3 redundant auth calls per request |
| 2 | `Promise.all` in dashboard page | Critical | 10 min | ~200-600ms faster dashboard |
| 3 | `Promise.all` in visa detail page | Critical | 10 min | ~300-900ms faster visa pages |
| 4 | Add `loading.tsx` to key routes | Critical | 30 min | Enables streaming, eliminates blank page |
| 5 | Slim down ActionZone props | Warning | 15 min | ~12KB RSC payload reduction |
| 6 | Server-side AuthNav (or dynamic import) | Warning | 45 min | ~60KB bundle reduction on public pages |
| 7 | Fix state-during-render in useChecklist | Warning | 15 min | Correctness + SSR safety |
| 8 | Add error handling to AuthNav | Warning | 5 min | Prevents unhandled rejection |
| 9 | Preventive Promise.all in getAvailableVisas | Nit | 5 min | Future-proofing |

**Total estimated effort**: ~2.5 hours for all fixes.
**Biggest wins**: Items 1-4 alone (35 min effort) would dramatically improve perceived performance.

---

## Architecture Observations

### What's Built (Phase 1 Status)

| Feature | Status | Notes |
|---------|--------|-------|
| F-1-D visa detail page | ✅ Complete | 3-layer structure, SEO, Schema.org |
| Auth (magic link) | ✅ Complete | Supabase OTP |
| Dashboard (basic) | ✅ Complete | D-Day countdown + checklist |
| Onboarding flow | ✅ Complete | Country → visa → date wizard |
| i18n (4 locales) | ✅ Complete | en, ja, zh-tw, vi |
| Footer + legal pages | ✅ Complete | Terms, privacy, refund |

### What's Missing (Per Product Spec)

| Feature | Phase | Priority |
|---------|-------|----------|
| Korea: E-7, D-8, H-1, F-2 visa data + pages | Phase 2 | High |
| Taiwan: DNV, Gold Card visa data + pages | Phase 2 | High |
| Visa Type Overview page | Phase 2 | High |
| Visa Comparison Tool | Phase 2 | High |
| SEO: sitemap.xml, OG images | Phase 2 | High |
| Country landing pages (currently "Coming Soon") | Phase 2 | Medium |
| Path Simulator | Phase 3 | Medium |
| Score-based visa tracker (OASIS, F-2-7, E-7-4) | Phase 3 | Medium |
| Tax Residency Tracker | Phase 3 | Low |
| Dashboard timeline alerts | Phase 3 | Low |
| Email notifications | Post-MVP | Low |
| File Sanitizer | Post-MVP | Low |
| News feed | Post-MVP | Low |

---

*Report generated by Vercel React Best Practices audit. No code changes were made.*
