# Technical Audit Report -- Cycles 6-7

**Date:** 2026-02-12
**Auditor:** Claude Opus 4.6
**Scope:** Build verification, code quality, accessibility, i18n completeness, production hygiene

---

## 1. Build Verification

**Result: PASS**

- `npx tsc --noEmit` completes with zero errors.
- `npm run build` succeeds. All routes compiled (static + dynamic). No warnings or errors in build output.

---

## 2. Remaining `key={index}` Patterns

**Result: FAIL -- 28 instances remain**

Bare `key={index}` or `key={i}` patterns found in `components/`. These use array index as React key, which can cause rendering bugs during reorder/filter operations.

| File | Count |
|------|-------|
| `components/social-proof-section.tsx` | 2 |
| `components/lazy-map.tsx` | 1 |
| `components/sections/faq-section.tsx` | 1 |
| `components/sections/comparison-section.tsx` | 1 |
| `components/sections/why-section.tsx` | 1 |
| `components/sections/services-detail-section.tsx` | 2 |
| `components/sections/social-proof-section.tsx` | 2 |
| `components/business/BusinessWhyUsSection.tsx` | 1 |
| `components/business/BusinessNotForSection.tsx` | 1 |
| `components/business/BusinessProblemSection.tsx` | 1 |
| `components/business/BusinessHowItWorksSection.tsx` | 1 |
| `components/visa/EligibilityQuiz.tsx` | 1 |
| `components/visa/checklist/ChecklistItem.tsx` | 1 |
| `components/visa/quiz/QuizResults.tsx` | 2 |
| `components/visa/DocumentChecklist.tsx` | 1 |
| `components/visa/detail/ThingsToKnow.tsx` | 1 |
| `components/visa/detail/EligibilitySection.tsx` | 1 |
| `components/visa/journey/VisaJourneyPage.tsx` | 1 |
| `components/visa/journey/steps/StepQualify.tsx` | 1 |
| `components/visa/journey/steps/StepApply.tsx` | 3 |
| `components/visa/journey/steps/StepDocuments.tsx` | 1 |
| `components/visa/journey/steps/StepAfterApproval.tsx` | 1 |
| `components/ui/slider.tsx` | 1 (shadcn -- do not modify) |
| `components/ui/field.tsx` | 1 (shadcn -- do not modify) |

**Risk:** Low-to-medium. Most lists are static/non-reorderable, so functional bugs are unlikely. However, it is a React anti-pattern. The 2 instances in `components/ui/` are shadcn-managed and should not be modified per project rules.

---

## 3. Remaining Bare English Strings in Dashboard

**Result: FAIL -- Extensive hardcoded English**

All four dashboard components (`DashboardClient.tsx`, `DDayPanel.tsx`, `HealthScoreCard.tsx`, `NextActionCard.tsx`) contain hardcoded English strings instead of i18n keys. Examples:

**`DashboardClient.tsx`:**
- "Start Your Visa Journey"
- "Take our quick quiz to find the right visa..."
- "Find My Visa", "Browse All Visas"
- "Professional Work Visa", "Digital Nomad Visa"
- "My Dashboard", "Settings", "Current Visa", "Quick Links"
- "View Visa Details", "Open Checklist"
- "Sign In", "Create Account", "Sign in to continue"
- "Document Progress", "Current Status"
- "All documents ready!", "No status updates yet..."
- "This dashboard tracks your self-reported progress..."
- Status labels: "No Visa", "Preparing", "Submitted", "Under Review", etc.
- Info labels: "Submitted", "Approved", "Entry Date"

**`DDayPanel.tsx`:**
- "Get Started", "No date set", "Visa Expires", "Expired"
- "Expected Decision", "Target Date"
- "Renewal window open", "Renewal opens in N days"
- "Set a target date to track progress"

**`HealthScoreCard.tsx`:**
- "Preparation Score"
- "Documents", "Timeline", "Insurance"
- "This score reflects your document preparation progress..."

**`NextActionCard.tsx`:**
- "Start Document Collection", "View Checklist", "Continue Checklist"
- "Ready to Submit", "Application Submitted", "Under Review"
- "Visa Approved", "Maintain Your Visa", "Renewal Required"
- "Visa Expired", "Get Started", "Find Your Visa"
- Various description strings

**Impact:** Japanese and Traditional Chinese users see English-only dashboard content. This is a significant i18n gap.

---

## 4. `as any` Usage

**Result: PASS**

Found 2 instances of `as any` in `components/providers/auth-provider.tsx`:
- Line 93: `supabase.from('visa_progress') as any`
- Line 127: `supabase.from('checklist_items') as any`

Both are documented with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comments and include explanatory comments ("Database types may not include visa_progress table yet -- safe to cast"). These are acceptable given that Supabase generated types may not yet include custom tables.

Additionally, `DashboardClient.tsx` has 2 `eslint-disable` comments (lines 489, 516) for type assertions (`as VisaProgressRow | null`, `as ChecklistItemRow[] | null`) -- these are safer narrowing casts, not `as any`.

No undocumented `as any` instances found.

---

## 5. `console.log` in Production

**Result: PASS**

Zero `console.log` statements found in `components/` or `app/` directories. Only `console.error` calls are present (for legitimate error reporting in catch blocks), which is acceptable.

---

## 6. Focus-Visible CSS

**Result: PASS**

`app/globals.css` contains the `:focus-visible` rule within `@layer base` (lines 156-159):

```css
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

This provides consistent keyboard focus indication across all interactive elements.

---

## 7. Skip-to-Content

**Result: PASS**

`app/[lang]/layout.tsx` includes both required accessibility elements:

1. **Skip link** (lines 60-65): `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` -- visually hidden until focused via keyboard.
2. **Main content wrapper** (line 76): `<div id="main-content">` wrapping `{children}`.

---

## 8. i18n Key Check

**Result: PASS**

The `visa.alreadyHaveVisa` key exists in all 3 message files:

| Locale | Value |
|--------|-------|
| `en.json` | "Already have a visa?" |
| `ja.json` | "既にビザをお持ちですか？" |
| `zh-tw.json` | "已經有簽證了？" |

Related key `visa.trackProgress` also verified across all 3 locales.

---

## 9. Package Name

**Result: PASS**

`package.json` line 2: `"name": "b2c-website"` -- correct.

---

## Summary

| # | Check | Result |
|---|-------|--------|
| 1 | Build verification | PASS |
| 2 | `key={index}` patterns | FAIL (28 instances, 2 in shadcn) |
| 3 | Bare English in dashboard | FAIL (60+ hardcoded strings across 4 files) |
| 4 | `as any` usage | PASS (2 documented) |
| 5 | `console.log` in production | PASS |
| 6 | Focus-visible CSS | PASS |
| 7 | Skip-to-content | PASS |
| 8 | i18n key check | PASS |
| 9 | Package name | PASS |

**Checks passed:** 7 / 9
**Checks failed:** 2 / 9

---

## Overall Tech Score: 78 / 100

**Deductions:**
- -12 points: Dashboard i18n gap. Four components with 60+ hardcoded English strings. JA/ZH-TW users get a degraded experience on the most interactive part of the product.
- -7 points: 26 bare `key={index}` patterns outside shadcn (anti-pattern, though low functional risk for static lists).
- -3 points: Minor -- `as any` casts for Supabase tables are documented but indicate missing generated types. `toLocaleDateString('en-US')` hardcoded in DDayPanel and DashboardClient instead of using locale-aware formatting.

**Strengths:**
- Clean TypeScript compilation, zero type errors.
- Clean production build with no warnings.
- Zero `console.log` leaks.
- Solid accessibility foundation (focus-visible, skip-to-content, prefers-reduced-motion).
- i18n infrastructure in place; message files complete for existing keys.
- All `as any` documented with eslint-disable comments and justification.
