# UI/UX Pro Max — Diagnosis Report

> **Date**: 2025-02-20
> **Scope**: Full UI/UX audit — mobile-first, accessibility, visual design, component quality, states
> **Codebase**: LocalNomad b2c-website (Next.js 16, React 19, Tailwind CSS 4, shadcn/ui)
> **Status**: Diagnosis only — no changes executed

---

## Executive Summary

The codebase has a **solid UX foundation** with consistent 44px touch targets, well-implemented 3-layer information architecture, and proper brand theming. However, there are **6 critical**, **10 warning**, and **5 nit-level** issues. The biggest gaps are: (1) incomplete dark mode support with WCAG contrast failures, (2) missing accessibility labels on interactive elements, (3) no loading skeletons or Suspense boundaries, and (4) browser-inconsistent `<details>` elements instead of shadcn/ui `<Accordion>`.

### Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| Mobile-First Compliance | 7/10 | Good touch targets, but font sizing and padding need mobile breakpoints |
| Accessibility | 5/10 | Missing ARIA labels, no skip-to-content, form ID linkage gaps |
| Component Quality | 8/10 | Clean shadcn/ui usage, but `<details>` should be `<Accordion>` |
| Visual Design | 8/10 | Strong brand colors, good typography, accent color underused |
| Loading/Error/Empty States | 4/10 | Minimal skeletons, silent errors, no Suspense boundaries |
| Animation/Transitions | 7/10 | Good micro-interactions, but chevron animation is browser-dependent |
| Dark Mode | 3/10 | Theme defined but incomplete — contrast failure, no toggle, hardcoded colors |
| Form UX | 6/10 | Functional but generic errors, no real-time validation, no spinner |
| Navigation | 6/10 | Back links present, but no breadcrumbs, no nav aria-label |
| Information Architecture | 9/10 | 3-layer structure excellent, backloading well-implemented |

**Overall: 6.3/10** — Strong foundation, needs polish in accessibility, dark mode, and loading states.

---

## Critical Issues (Must Fix)

### X1. Dark Mode Primary Color Fails WCAG AA
**File**: `app/globals.css:97`
**Spec Rule**: Color contrast minimum 4.5:1 (WCAG AA)

```css
/* Dark mode */
--primary: #2a6f97;    /* On #1a1a1a background → ~3.5:1 contrast — FAILS */
```

**Problem**: Links, buttons, and headings using `text-primary` or `bg-primary` in dark mode fail WCAG AA contrast requirements.

**Fix**: Brighten dark mode primary to `#3a8fbe` or `#4da3d4` (target 4.5:1+).

---

### X2. Missing ARIA Labels on Checkboxes
**File**: `components/visa/action-zone.tsx:319`

```tsx
<input type="checkbox" checked={!!checked[doc.id]} onChange={() => handleToggle(doc.id)} />
```

**Problem**: Screen readers announce this as "checkbox, unchecked" with no context about what the checkbox is for. Each checkbox needs an accessible name.

**Fix**: Add `aria-label={doc.name}` or wrap in `<label>`:
```tsx
<label className="flex items-center gap-3">
  <input type="checkbox" aria-label={`Mark ${doc.name} as completed`} ... />
  <span>{doc.name}</span>
</label>
```

---

### X3. Hardcoded Colors Break Dark Mode
**Files**: Multiple components

| File | Line | Classes | Issue |
|------|------|---------|-------|
| `components/visa/glanceable-zone.tsx` | 36 | `bg-amber-50 border-amber-300` | No `dark:` variant |
| `components/visa/glanceable-zone.tsx` | 247 | `bg-amber-50 border-amber-200` | No `dark:` variant |
| `components/dashboard/d-day-countdown.tsx` | 52-58 | `border-red-200 bg-red-50`, `border-amber-200 bg-amber-50`, `bg-white` | No `dark:` variant |
| `components/visa/action-zone.tsx` | 168 | `bg-neutral-200` (progress bar bg) | No `dark:` variant |

**Problem**: These components use fixed light-mode colors. In dark mode, they appear as bright patches on dark background — jarring and potentially illegible.

**Fix example** for d-day-countdown:
```tsx
// Current:
${isExpired ? 'border-red-200 bg-red-50' : ...}

// Fixed:
${isExpired ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950' : ...}
```

---

### X4. `<details>` Chevron Animation Not Cross-Browser Safe
**Files**: `components/visa/action-zone.tsx:255`, `components/visa/context-zone.tsx:44`

```tsx
// action-zone.tsx:255 — Non-standard CSS selector
<ChevronDown className="chevron h-4 w-4 transition-transform duration-200 [details[open]>summary>&]:rotate-180" />

// context-zone.tsx:44 — Uses group-open but parent isn't a group
<ChevronDown className="... group-open:rotate-180" />
```

**Problem**:
- `[details[open]>summary>&]:rotate-180` is a non-standard Tailwind arbitrary selector that may not work in all browsers
- `group-open:rotate-180` requires `group` class on parent `<details>`, which may not be present

**Fix**: Replace native `<details>` with shadcn/ui `<Accordion>` component, which handles animation, accessibility, and keyboard navigation reliably across all browsers.

---

### X5. Form Input Missing `id` for Label Association
**File**: `components/dashboard/onboarding-form.tsx:145-154`

```tsx
<label className="block text-sm font-medium text-foreground">
  {t('expiryDate')}
</label>
<input type="date" value={expiryDate} onChange={...} />
```

**Problem**: The `<label>` has no `htmlFor` attribute and the `<input>` has no `id`. Screen readers cannot associate the label with the input.

**Compare with** `login-form.tsx:41` which does it correctly:
```tsx
<label htmlFor="email">{t('emailLabel')}</label>
<input id="email" type="email" ... />  ✓
```

**Fix**: Add matching `id`/`htmlFor` to all form inputs in onboarding-form.

---

### X6. No Loading Skeletons for Async Content
**Files**: Entire `app/` directory

**Evidence**:
- Zero `loading.tsx` files
- Zero `<Suspense>` boundaries
- Only one skeleton exists: `d-day-countdown.tsx:42` (pulse animation for countdown)

**Problem**: Users see a blank white page while visa data, translations, and auth all resolve server-side. No progressive loading feedback.

**Fix (Priority Order)**:
1. Add `loading.tsx` to `app/[locale]/(protected)/` — skeleton for dashboard
2. Add `loading.tsx` to `app/[locale]/[country]/visa/[type]/` — skeleton for visa detail
3. Wrap auth-dependent sections in `<Suspense fallback={<Skeleton />}>`

---

## Warning Issues (Should Fix)

### W1. Heading Font Sizes Not Mobile-Optimized
**Files**: `components/visa/glanceable-zone.tsx:29`, `components/dashboard/dashboard-header.tsx:17`

```tsx
// Current: Fixed text-3xl (30px) on all screen sizes
<h1 className="text-3xl font-bold font-lora text-primary">
```

**Product spec**: Mobile-first means base styles are mobile, scale UP with breakpoints.

**Fix**: `text-2xl sm:text-3xl` — starts smaller on mobile, grows on larger screens.

---

### W2. Hero Section Padding Excessive on Mobile
**File**: `components/landing/hero.tsx:8`

```tsx
<section className="... px-6 py-16">
```

**Problem**: `py-16` (64px) on a mobile viewport (667px height) uses ~19% of screen just for vertical padding.

**Fix**: `py-8 sm:py-16` — 32px on mobile, 64px on desktop.

---

### W3. No Navigation ARIA Label
**File**: `app/[locale]/layout.tsx:57`

```tsx
<nav className="flex items-center justify-end gap-4 px-6 py-3 text-sm">
```

**Fix**: `<nav aria-label="Main navigation">` — required for screen readers to distinguish nav landmarks.

---

### W4. No Skip-to-Content Link
**File**: `app/[locale]/layout.tsx`

**Problem**: Keyboard users must tab through the entire nav on every page before reaching main content.

**Fix**: Add as first element in `<body>`:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-primary">
  Skip to content
</a>
```

---

### W5. Silent Error Handling on Checklist Save
**File**: `components/visa/action-zone.tsx:108`

```tsx
} catch {
  setChecked((prev) => ({ ...prev, [docId]: !newChecked }));
  // ❌ No user notification — silently reverts
}
```

**Problem**: User clicks checkbox, it visually checks, then silently unchecks if save fails. No toast, no error message. User thinks the system is broken.

**Fix**: Show error toast: "Failed to save. Please try again."

---

### W6. Generic Error Messages
**File**: `components/auth/login-form.tsx:29-31`

```tsx
if (signInError) {
  setError(t('error'));  // Just says "Error"
}
```

**Fix**: Provide actionable context: "Failed to send login link. Check your email address and try again."

---

### W7. No Breadcrumb Navigation
**File**: `app/[locale]/[country]/visa/[type]/page.tsx`

**Problem**: User navigates Landing → Korea → F-1-D Visa but has no visual breadcrumb trail showing their location in the hierarchy.

**Fix**: Add breadcrumb above page title:
```tsx
<nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4">
  <Link href="/">Home</Link> / <Link href={`/${country}`}>{country}</Link> / {visa.name}
</nav>
```

---

### W8. No Submit Spinner on Forms
**Files**: `components/auth/login-form.tsx:64`, `components/dashboard/onboarding-form.tsx:177`

**Problem**: Button text changes to "Sending..." but no visual spinner. User may think nothing is happening.

**Fix**: Add spinner icon:
```tsx
<Button disabled={loading}>
  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {loading ? t('sending') : t('sendMagicLink')}
</Button>
```

---

### W9. Long Text Overflow on Mobile
**Files**: Multiple

| Component | Issue |
|-----------|-------|
| `glanceable-zone.tsx` SummaryCard | Long values (e.g., "Up to 2 years with extension") may overflow on 320px |
| `action-zone.tsx` doc names | Long document names may wrap beyond touch target |

**Fix**: Add `truncate` or `line-clamp-2` to text containers that may overflow.

---

### W10. No Dark Mode Toggle in UI
**File**: `app/[locale]/layout.tsx`

**Problem**: Dark mode CSS variables are defined in `globals.css` but there's no way for users to toggle dark mode. Relies entirely on OS `prefers-color-scheme`.

**Fix**: Add theme toggle button in nav bar using `next-themes` or a custom implementation.

---

## Nit Issues (Optional)

### N1. Brand Accent Color (#D64045) Underused
**Files**: Warning/alert boxes use amber instead of brand accent vermillion red.

- `glanceable-zone.tsx:36`: `bg-amber-50 border-amber-300` — could be `bg-accent/10 border-accent/30`
- Decision: Keep amber for semantic warnings, use accent for CTAs and highlights.

---

### N2. No Ripple/Press Effect on Buttons
**Current**: Buttons have hover effects (`hover:shadow-md`, `hover:-translate-y-0.5`) but no press feedback.

**Nice to have**: `active:scale-95` for tactile press feedback on mobile.

---

### N3. SVG Arrow Icon Missing Accessible Title
**File**: `components/landing/country-card.tsx:21-29`

The arrow SVG inside country cards has no `<title>` or `aria-hidden`.

**Fix**: Add `aria-hidden="true"` (decorative) or `<title>Navigate to {name}</title>`.

---

### N4. Inconsistent Section Spacing
- Most sections use `mt-12` (48px)
- Some use `mt-6` (24px), `mt-8` (32px)
- Could standardize with a spacing scale

---

### N5. `console.warn` in Production
**File**: `components/visa/action-zone.tsx:41,75`

localStorage error handling uses `console.warn`. Should gate behind development mode or remove.

---

## Positive Patterns (Keep Doing)

| Pattern | Where | Score |
|---------|-------|-------|
| 44px+ touch targets everywhere | All interactive elements | Excellent |
| 3-layer info architecture | Visa detail page | Excellent |
| Backloading with expandable sections | Glanceable/Context zones | Excellent |
| Brand color system in CSS variables | globals.css | Excellent |
| Lora + Inter font pairing | layout.tsx | Excellent |
| Progress bar with smooth transition | action-zone.tsx:168 | Great |
| Hover micro-interactions | country-card.tsx | Great |
| Error messages with `role="alert"` | login-form, onboarding-form | Great |
| Dual checklist (localStorage + Supabase) | action-zone.tsx | Great |
| Back link with 44px touch target | visa detail page | Great |
| Consistent border/radius/shadow | All card components | Great |
| Emoji as accessible img role | country-card.tsx:15 | Great |

---

## Recommended Fix Priority

| # | Issue | Severity | Effort | Impact |
|---|-------|----------|--------|--------|
| 1 | Add loading.tsx skeletons to key routes | Critical | 1h | Eliminates blank page, enables streaming |
| 2 | Add ARIA labels to checkboxes | Critical | 15m | Screen reader accessibility |
| 3 | Fix form input id/htmlFor linkage | Critical | 15m | Form accessibility |
| 4 | Replace `<details>` with `<Accordion>` | Critical | 1.5h | Cross-browser reliability, a11y |
| 5 | Fix dark mode primary color contrast | Critical | 15m | WCAG AA compliance |
| 6 | Add dark: variants to colored backgrounds | Critical | 45m | Dark mode visual integrity |
| 7 | Add nav aria-label + skip-to-content | Warning | 15m | Accessibility basics |
| 8 | Add error toasts for failed actions | Warning | 45m | User trust |
| 9 | Mobile-optimize heading font sizes | Warning | 15m | Mobile-first compliance |
| 10 | Add breadcrumb navigation | Warning | 30m | Information architecture |
| 11 | Add submit spinner to forms | Warning | 15m | Perceived responsiveness |
| 12 | Reduce hero padding on mobile | Warning | 5m | Mobile space efficiency |

**Total estimated effort**: ~5.5 hours for all fixes.
**Biggest wins**: Items 1-6 (3.5h) address all critical issues.

---

## What's Built vs What's Missing (Per Product Spec)

### Built (Phase 1)
- F-1-D visa detail with 3-layer structure
- Auth (magic link) + onboarding
- Dashboard with D-Day + checklist
- i18n (en, ja, zh-tw, vi)
- Footer + legal pages
- Brand theming (colors, fonts, logo)

### Missing (Phase 2+)
- Visa Type Overview page
- Visa Comparison Tool (spec: mobile 2-up, desktop 4-up)
- Country landing pages (currently "Coming Soon" placeholder)
- Additional visa pages (E-7, D-8, H-1, F-2, DNV, Gold Card)
- SEO: sitemap.xml, OG images
- Path Simulator (Phase 3)
- Score-based visa tracker (Phase 3)
- Dashboard timeline alerts (Phase 3)

### UI/UX Gaps for Upcoming Features
- **Comparison Tool**: Will need responsive table/card layout (2-col mobile, 4-col desktop)
- **Path Simulator**: Will need flow visualization component (react-flow or similar)
- **Score Tracker**: Will need form inputs + calculated display
- **Breadcrumbs**: Should be added before Phase 2 (more pages = more navigation needed)

---

*Report generated by UI/UX Pro Max audit. No code changes were made.*
