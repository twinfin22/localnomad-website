# Cycle 6-7 UX Audit Report

**Persona**: Linh (E-7 visa holder in Korea)
**Auditor**: Claude Opus 4.6
**Date**: 2026-02-12

---

## UX Bug Fixes (Items 1-5)

### 1. Header overlap fix — VisaJourneyPage.tsx
**PASS**

File: `/Users/leegen/localnomad/b2c-website/components/visa/journey/VisaJourneyPage.tsx`

Line 117 confirms the container uses `pt-24 pb-8` instead of the old `py-8`:
```tsx
<div className="container mx-auto max-w-3xl px-4 pt-24 pb-8">
```
The "Back to Visa Guide" link at line 119 now sits well below the fixed header (pt-24 = 96px, clearing the ~64-80px header).

---

### 2. Mobile grid fix — SituationGrid.tsx + SituationTile.tsx
**PASS**

File: `/Users/leegen/localnomad/b2c-website/components/visa/landing/SituationGrid.tsx`

Line 16 confirms the responsive grid:
```tsx
<div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
```
2 columns on mobile, 3 columns on large screens, with tighter gap on small screens.

File: `/Users/leegen/localnomad/b2c-website/components/visa/landing/SituationTile.tsx`

Line 12 confirms mobile-responsive padding:
```tsx
<div className="p-4 sm:p-6 rounded-xl ...">
```
p-4 on mobile, p-6 on sm+. Emoji and text sizing is also responsive (`text-2xl sm:text-3xl`, `text-sm sm:text-base`).

---

### 3. Footer contrast fix — footer.tsx
**PASS**

File: `/Users/leegen/localnomad/b2c-website/components/footer.tsx`

Graded opacity hierarchy verified:
- **Tagline** (line 37): `text-foreground/70`
- **Nav links** (line 48): `text-foreground/60`
- **Social icons** (lines 60, 69): `text-foreground/50`
- **Copyright** (line 77): `text-foreground/50`
- **Legal disclaimer** (line 95): `text-foreground/40`

Hierarchy is correct: tagline > nav links > social icons = copyright > legal disclaimer.

---

### 4. AlreadyHaveVisa clarity
**PASS**

File: `/Users/leegen/localnomad/b2c-website/components/visa/landing/AlreadyHaveVisa.tsx`

All requirements verified:
- Line 45: CTA text is `t("seeYourOptions")` which resolves to "See your options" (not "Manage your visa")
- Lines 58-67: Dashboard CTA with `t("trackMyProgress")` resolving to "Track my visa progress"
- Line 24: Uses `useTranslations("visa")` for i18n
- Line 42: Shows `t("alreadyHaveVisa")` ("Already have a visa?")
- Line 70: Shows `t("whichVisaDoYouHave")` ("Which visa do you have?")
- Line 97: Shows `t("exploreTransitionPaths")` for path simulator link

---

### 5. Salary numbers + touch targets — StepQualify.tsx
**PASS**

File: `/Users/leegen/localnomad/b2c-website/components/visa/journey/steps/StepQualify.tsx`

Salary inline display (lines 57-62):
```tsx
{req.id === "salary" && visa.incomeRequirement && (
  <span className="block text-xs text-muted-foreground/80 mt-0.5">
    {visa.incomeRequirement.amount} {visa.incomeRequirement.currency}
    {visa.incomeRequirement.notes && ` — ${visa.incomeRequirement.notes}`}
  </span>
)}
```

Yes/No buttons (lines 68, 79): Both have `min-h-[44px]`:
```tsx
"px-3 py-1 min-h-[44px] text-sm rounded-md transition-colors"
```

---

## Functional Fixes (Items 6-7)

### 6. Settings button — DashboardClient.tsx
**PASS**

File: `/Users/leegen/localnomad/b2c-website/components/visa/dashboard/DashboardClient.tsx`

Sheet component is imported (lines 18-24) and used (lines 194-268). The Settings button at line 176-183 opens the sheet via `onClick={() => setSettingsOpen(true)}`. The sheet contents include:
- **Current visa type** (lines 203-225): Shows `visa.shortName` and `visa.name` with link to visa detail page
- **Quick Links** (lines 228-249): Link to visa detail page and checklist
- **Sign Out button** (lines 252-265): Full-width red-styled sign-out button

---

### 7. package.json name
**PASS**

File: `/Users/leegen/localnomad/b2c-website/package.json`

Line 2:
```json
"name": "b2c-website",
```
No longer "my-v0-project".

---

## Cycle 7 Accessibility (Items 8-12)

### 8. Focus-visible — globals.css
**PASS**

File: `/Users/leegen/localnomad/b2c-website/app/globals.css`

Lines 156-159 in `@layer base`:
```css
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```
Matches the specification exactly.

---

### 9. Skip-to-content — [lang]/layout.tsx
**PASS**

File: `/Users/leegen/localnomad/b2c-website/app/[lang]/layout.tsx`

Skip link at lines 60-65 is the first child of `<body>`:
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
>
  Skip to content
</a>
```

Children wrapped in `<div id="main-content">` at line 76:
```tsx
<div id="main-content">
  {children}
</div>
```

---

### 10. Language switcher — language-switcher.tsx
**PASS**

File: `/Users/leegen/localnomad/b2c-website/components/language-switcher.tsx`

Line 36: `aria-label="Switch language"` is present on the Button.
No `<span className="sr-only">` found in the file (grep confirmed no matches). No redundant screen-reader text.

---

### 11. Header mobile menu — header.tsx
**PASS**

File: `/Users/leegen/localnomad/b2c-website/components/header.tsx`

Line 77 has dynamic aria-label:
```tsx
aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
```
Correctly toggles based on `mobileMenuOpen` state.

---

### 12. Stable keys — VisaDetailContent.tsx + VisaComparisonTool.tsx
**PASS**

File: `/Users/leegen/localnomad/b2c-website/components/visa/VisaDetailContent.tsx`
File: `/Users/leegen/localnomad/b2c-website/components/visa/VisaComparisonTool.tsx`

Grep for `key={i}` and `key={index}` in both files returned **no matches**. All keys use stable identifiers:
- `VisaDetailContent.tsx`: Uses `key={tab.id}`, `key={\`target-${i}\`}`, `key={req.id}`, `key={\`restriction-${i}\`}`, `key={\`tip-${i}\`}`, `key={\`warning-${i}\`}`, `key={doc.id}`, `key={step.id}`, `key={\`step-tip-${i}\`}`, `key={\`doc-tip-${i}\`}`, `key={\`faq-${index}\`}`, `key={link.url}`
- `VisaComparisonTool.tsx`: Uses `key={visa.type}`, `key={row.key}`, `key={\`audience-${i}\`}`, `key={req.id}`

All use prefixed composite keys or semantic identifiers instead of bare `key={i}` or `key={index}`.

**Note**: Bare `key={i}` patterns were found in other visa components (e.g., `VisaJourneyPage.tsx` line 234, `StepQualify.tsx` line 147, `StepDocuments.tsx`, `StepApply.tsx`, etc.), but these were outside the scope of this check which specifically targeted `VisaDetailContent.tsx` and `VisaComparisonTool.tsx`.

---

## i18n Keys (Item 13)

### 13. i18n keys in en.json, ja.json, zh-tw.json
**PASS**

All five keys confirmed present in all three locale files:

| Key | en.json | ja.json | zh-tw.json |
|-----|---------|---------|------------|
| `visa.alreadyHaveVisa` | "Already have a visa?" | "既にビザをお持ちですか？" | "已經有簽證了？" |
| `visa.seeYourOptions` | "See your options" | "オプションを見る" | "查看您的選項" |
| `visa.whichVisaDoYouHave` | "Which visa do you have?" | "どのビザをお持ちですか？" | "您持有哪種簽證？" |
| `visa.trackMyProgress` | "Track my visa progress" | "ビザの進捗を追跡" | "追蹤我的簽證進度" |
| `visa.exploreTransitionPaths` | "Explore visa transition paths" | "ビザ移行パスを探す" | "探索簽證轉換路徑" |

---

## Summary

| # | Item | Verdict |
|---|------|---------|
| 1 | Header overlap fix | PASS |
| 2 | Mobile grid fix | PASS |
| 3 | Footer contrast fix | PASS |
| 4 | AlreadyHaveVisa clarity | PASS |
| 5 | Salary numbers + touch targets | PASS |
| 6 | Settings button (Sheet) | PASS |
| 7 | package.json name | PASS |
| 8 | Focus-visible | PASS |
| 9 | Skip-to-content | PASS |
| 10 | Language switcher aria-label | PASS |
| 11 | Header mobile menu aria-label | PASS |
| 12 | Stable keys | PASS |
| 13 | i18n keys (3 locales) | PASS |

---

## Overall Score: **100 / 100**

All 13 audit items pass. Every specified UX bug fix, functional fix, accessibility improvement, and i18n key is correctly implemented as described. The codebase reflects disciplined, specification-compliant work across Cycles 6-7.

### Minor observations (non-blocking, outside audit scope):
- Bare `key={i}` patterns still exist in other visa journey step components (StepQualify, StepApply, StepDocuments, StepAfterApproval, VisaJourneyPage FAQs). Consider a follow-up pass to stabilize those keys.
- The `VisaJourneyPage.tsx` FAQs section (line 234) uses `key={i}` on `<details>` elements. If FAQ order can change, this could cause React reconciliation issues.
