# Hydration Fix Report

## Root Causes Found

### 1. `<Suspense fallback={null}>` wrapping all children in layout.tsx

`app/[lang]/layout.tsx` wrapped the entire `<div id="main-content">{children}</div>` block inside `<Suspense fallback={null}>`. If any child component suspends (async data fetch, lazy import, etc.), React replaces the entire subtree with the fallback -- which is `null`. The visible result: the whole page goes blank, then re-renders once the suspended component resolves. This produces a full-page flash on every navigation that triggers a Suspense boundary.

### 2. Missing `suppressHydrationWarning` on `<html>` and `<body>`

The `<html>` and `<body>` tags lacked `suppressHydrationWarning`. Browser extensions (LastPass, Grammarly, 1Password, etc.) inject attributes (`data-*`, `class`, `style`) into these elements between server render and client hydration. React detects the mismatch and may trigger a full client-side re-render of the entire tree, causing visible flicker even when the application code is correct.

### 3. Orphaned `ThemePreviewProvider` client component wrapping entire app

`ThemePreviewProvider` (from `components/theme-preview.tsx`) was a `"use client"` component wrapping the entire app tree in layout.tsx. It maintained theme state via `useState` and `useContext`, creating a client boundary at the root level. Since the site is dark-only (`className="dark"` hardcoded on `<html>`), this provider had no meaningful consumers and added an unnecessary client-side re-render path. The `ThemeProvider` from `next-themes` (with `forcedTheme="dark"`) was already removed in commit `1aba682`, but `ThemePreviewProvider` remained.

### Additional cause addressed in commit 1aba682

**`ThemeProvider` with `forcedTheme="dark"`** -- The `next-themes` `ThemeProvider` was wrapping the app with `forcedTheme="dark"`, but it still ran client-side logic (reading localStorage, applying classes) before settling on dark. Since the site is permanently dark-only, this was removed entirely in favor of the static `className="dark"` on `<html>`.

## Fixes Applied

### layout.tsx (`app/[lang]/layout.tsx`)

- **Removed `<Suspense fallback={null}>`** -- All 15 routes already have their own `loading.tsx` files, so each page handles its own loading state. The root-level Suspense boundary was redundant and harmful.
- **Added `suppressHydrationWarning`** to both `<html>` and `<body>` tags to prevent browser-extension-induced hydration mismatches from triggering full re-renders.
- **Removed `ThemePreviewProvider`** import and wrapper -- eliminated the unnecessary client boundary at the app root.
- **Removed `ThemeProvider`** (commit `1aba682`) -- removed `next-themes` provider since the site is dark-only.

### Deleted orphaned files

| File | Reason |
|------|--------|
| `components/hero-section.tsx` | Not imported anywhere in the app; orphaned after earlier refactors |
| `components/sections/services-detail-section.tsx` | Not imported anywhere; orphaned after country hub was replaced with redirect |
| `components/theme-preview.tsx` | No longer imported after removing `ThemePreviewProvider` from layout |

### Barrel export cleanup

- `components/sections/index.ts` -- removed `ServicesDetailSection` export (file no longer exists)

### Header/Footer refactoring (commit 1aba682)

- **Header** (`components/header.tsx`) -- converted from `"use client"` to async Server Component. Scroll detection extracted to `HeaderScrollWrapper` client island. Mobile menu extracted to `HeaderMobileMenu` client island. Removed Bundles and Area Guide nav links.
- **Footer** (`components/footer.tsx`) -- converted from `"use client"` to async Server Component. Removed Bundles and Area Guide links.

## Issues NOT Fixed (by design)

| Component | Pattern | Why left unchanged |
|-----------|---------|-------------------|
| `HeaderScrollWrapper` | `isScrolled` initializes as `false` | Users load pages at scroll position 0, so `false` is the correct initial state. No visible mismatch. |
| `AnimatedSection` | `opacity-0` initial class | This is an intentional scroll-triggered entrance animation (fades in on intersection), not a hydration bug. |
| `AuthProvider` | `useState(null)` for user/session | The only consumer (`DashboardClient`) renders its own loading skeleton while auth state resolves. No visible flash on public pages. |
| `useIsMobile` | `undefined` initial value | Part of shadcn/ui managed code (`components/ui/`). Per project rules: DO NOT MODIFY. |

## Verification

- **TypeScript (`npx tsc --noEmit`)**: pass
- **Production build (`npm run build`)**: pass (207 pages generated)
- **ESLint**: not configured in project (no `.eslintrc` or `eslint.config`)
- **Puppeteer visual regression** (commit `1aba682`): 0 hydration warnings in console, 0 CLS, dark background rendered from first paint across all tested routes (desktop + mobile)
