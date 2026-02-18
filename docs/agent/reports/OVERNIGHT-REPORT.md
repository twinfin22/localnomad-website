# Overnight Report — Hydration Fix + Cleanup

## Date: 2026-02-14

## Task 1: Fix Hydration Flickering
**Status**: Complete

### What was done

Three root causes of hydration flickering were identified and fixed:

1. **`<Suspense fallback={null}>` wrapping all children in layout.tsx** -- If any child component suspended, the entire page went blank then re-rendered. Removed the wrapper entirely since all 15 routes have their own `loading.tsx` files.

2. **Missing `suppressHydrationWarning` on `<html>` and `<body>`** -- Browser extensions injecting attributes caused React hydration mismatch warnings and potential full client-side re-renders. Added `suppressHydrationWarning` to both tags.

3. **Orphaned `ThemePreviewProvider` client component wrapping entire app** -- Added an unnecessary client boundary at the root with no meaningful consumers (site is dark-only). Removed the import and wrapper from layout.tsx.

Additionally, commit `1aba682` had already removed the `next-themes` `ThemeProvider` (which was running redundant client-side theme logic despite `forcedTheme="dark"`), split Header/Footer from monolithic `"use client"` components into async Server Components with small client islands (`HeaderScrollWrapper`, `HeaderMobileMenu`), and deleted the `ThemeToggle` component.

Three orphaned component files were deleted as cleanup, and the barrel export was updated.

### Issues NOT fixed (by design)
- `HeaderScrollWrapper` isScrolled=false init -- correct at scroll position 0
- `AnimatedSection` opacity-0 -- intentional scroll entrance animation
- `AuthProvider` useState(null) -- DashboardClient has its own loading skeleton
- `useIsMobile` undefined init -- shadcn/ui managed, DO NOT MODIFY

### Files changed
- `app/[lang]/layout.tsx` -- removed Suspense wrapper, added suppressHydrationWarning to html and body, removed ThemePreviewProvider import and wrapper

### Files deleted
- `components/hero-section.tsx` -- orphaned, not imported anywhere
- `components/sections/services-detail-section.tsx` -- orphaned after country hub redirect refactor
- `components/theme-preview.tsx` -- no longer needed after removing ThemePreviewProvider from layout

### Files edited
- `components/sections/index.ts` -- removed ServicesDetailSection barrel export

### Verification
- TypeScript: pass
- Production build: pass (207/207 pages)
- ESLint: not configured in project

---

## Task 2: Enable Taiwan Dashboard
**Status**: Already complete (commit 1aba682)

Taiwan routes, data, and disclaimers were already fully enabled. The Taiwan visa dashboard (Gold Card, DNV, Work ARC, Visitor) was built in commit `e9b01fe` and enabled for navigation in commit `1aba682`. No disabled state, feature flags, `coming-soon` labels, or `pointer-events-none` blocking was found. Country cards on the global landing page link directly to `/[lang]/taiwan/visa`.

---

## Task 3: Simplify Navigation
**Status**: Already complete (commit 1aba682)

Header and Footer were already simplified to show only the "Visa" link -- Bundles and Area Guide nav links were removed. The country hub page (`app/[lang]/[country]/page.tsx`) was replaced with a redirect to `/[lang]/[country]/visa`. The global landing page country cards link directly to `/[lang]/[country]/visa` instead of the old three-card hub.

---

## Summary

Only Task 1 required new work (removing Suspense wrapper, adding suppressHydrationWarning, removing ThemePreviewProvider, deleting orphaned files). Tasks 2 and 3 were completed in prior commit `1aba682`.
