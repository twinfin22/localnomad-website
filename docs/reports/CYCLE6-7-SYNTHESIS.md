# Cycles 6-7 Synthesis Report

**Date:** 2026-02-12
**Scope:** UX polish, functional fixes, accessibility, code quality

---

## Scores

| Audit | Score |
|-------|-------|
| UX Audit (dog-food as Linh) | **100 / 100** |
| Tech Audit (build + quality) | **78 / 100** |

---

## What Shipped (Cycle 6)

### UX Bug Fixes
1. **Header overlap** — `VisaJourneyPage.tsx`: `py-8` → `pt-24 pb-8` (96px top clearance for fixed header)
2. **Mobile grid** — `SituationGrid.tsx`: `grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4` (2-column on mobile)
3. **Mobile card padding** — `SituationTile.tsx`: `p-4 sm:p-6` + responsive text sizing
4. **Footer contrast** — Graded opacity hierarchy: tagline `/70`, nav `/60`, social `/50`, copyright `/50`, legal `/40`
5. **AlreadyHaveVisa clarity** — "Manage your visa" → "See your options" + dashboard CTA + i18n (5 new keys × 3 locales)
6. **Salary numbers** — `StepQualify.tsx`: inline `visa.incomeRequirement.amount` when `req.id === "salary"`
7. **Touch targets** — Yes/No buttons: `min-h-[44px]` for WCAG compliance

### Functional Fixes
8. **Settings Sheet** — `DashboardClient.tsx`: Settings button opens shadcn Sheet with visa type, quick links, sign-out
9. **Package name** — `package.json`: `"my-v0-project"` → `"localnomad-website"`

---

## What Shipped (Cycle 7)

### Accessibility
10. **Focus-visible** — Global `*:focus-visible` rule in `@layer base` (2px solid primary outline)
11. **Skip-to-content** — `<a href="#main-content">Skip to content</a>` + `<div id="main-content">` wrapper in locale layout
12. **Language switcher** — `aria-label="Switch language"` on button, removed redundant `<span className="sr-only">`
13. **Header mobile menu** — Dynamic `aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}`

### Code Quality
14. **Stable keys** — `VisaDetailContent.tsx` and `VisaComparisonTool.tsx`: all `key={i}` / `key={index}` replaced with semantic keys (`key={req.id}`, `key={link.url}`, `key={\`tip-${i}\`}`, etc.)

---

## Files Modified (16 files)

| File | Changes |
|------|---------|
| `components/visa/journey/VisaJourneyPage.tsx` | pt-24 header clearance |
| `components/visa/landing/SituationGrid.tsx` | grid-cols-2 on mobile |
| `components/visa/landing/SituationTile.tsx` | p-4 sm:p-6 + responsive text |
| `components/footer.tsx` | Graded foreground opacity |
| `components/visa/landing/AlreadyHaveVisa.tsx` | Clear CTAs, dashboard link, i18n |
| `components/visa/journey/steps/StepQualify.tsx` | Salary inline, touch targets |
| `components/visa/dashboard/DashboardClient.tsx` | Settings Sheet |
| `package.json` | name: "localnomad-website" |
| `messages/en.json` | 5 new visa keys |
| `messages/ja.json` | 5 new visa keys |
| `messages/zh-tw.json` | 5 new visa keys |
| `app/globals.css` | :focus-visible styles |
| `app/[lang]/layout.tsx` | Skip-to-content + #main-content |
| `components/language-switcher.tsx` | aria-label |
| `components/header.tsx` | Dynamic aria-label |
| `components/visa/VisaDetailContent.tsx` | Stable keys (8 fixes) |
| `components/visa/VisaComparisonTool.tsx` | Stable keys (3 fixes) |

---

## Verification

- `npx tsc --noEmit` — **Zero errors**
- `npm run build` — **Passes cleanly** (119/119 static pages)

---

## Known Remaining Issues (for future cycles)

### High Priority
1. **Dashboard i18n** — `DashboardClient.tsx`, `DDayPanel.tsx`, `HealthScoreCard.tsx`, `NextActionCard.tsx` have 60+ hardcoded English strings. JA/ZH-TW users see English-only dashboard. (Issue from before this cycle — was listed as "done" in plan header but only partial i18n keys exist.)

### Medium Priority
2. **`key={index}` cleanup** — 26 instances in other components (outside scope of VisaDetailContent/VisaComparisonTool). Most are static arrays (low risk) but should be addressed.
3. **Locale-aware date formatting** — `toLocaleDateString('en-US')` hardcoded in DashboardClient and DDayPanel. Should use the user's locale.

### Deferred (tracked issues)
4. Vietnamese locale (#12)
5. Terms/Privacy localization (#14)
6. Settings sheet: locale-aware labels (currently English-only in the sheet content)

---

## Recommended Next Steps

1. **Dashboard i18n pass** — Extract all hardcoded strings from the 4 dashboard components into message files. This is the biggest remaining gap.
2. **Locale-aware dates** — Replace `'en-US'` with dynamic locale from `usePathname()`.
3. **Broader key cleanup** — Sweep remaining `key={i}` patterns across visa journey step components.
