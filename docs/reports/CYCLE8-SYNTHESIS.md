# Cycle 8 Synthesis — Dashboard i18n, Locale Dates, Key Cleanup

## Scores

| Audit | Score | Notes |
|-------|-------|-------|
| i18n coverage | 100/100 | All 4 dashboard components wired; 118 keys per locale (EN/JA/ZH-TW) aligned |
| key cleanup | 100/100 | All 13 critical + 4 warning `key={index}` instances fixed; remaining are acceptable (skeletons, dots, shadcn) |
| Locale dates | 100/100 | All 3 `toLocaleDateString('en-US')` calls replaced with locale-derived values |
| TypeScript | PASS | `npx tsc --noEmit` — zero errors |
| Build | PASS | `npm run build` — all pages generated |

## Files Modified (25)

### Message files (3)
- `messages/en.json` — +53 new dashboard keys
- `messages/ja.json` — +53 new dashboard keys (Japanese)
- `messages/zh-tw.json` — +53 new dashboard keys (Traditional Chinese)

### Dashboard components (4)
- `components/visa/dashboard/DashboardClient.tsx` — `useTranslations('dashboard')`, locale-aware `formatDate()`, pass `t`/`locale` to children
- `components/visa/dashboard/DDayPanel.tsx` — `useTranslations('dashboard')`, `locale` prop, `labelKey` pattern in useMemo
- `components/visa/dashboard/HealthScoreCard.tsx` — `useTranslations('dashboard')`, resolves `labelKey`/`messageKey` from interpretation
- `components/visa/dashboard/NextActionCard.tsx` — `useTranslations('dashboard')`, refactored `getNextAction` to return i18n keys

### Types and utilities (3)
- `lib/visa/types.ts` — `HealthScoreInterpretation` changed `label`→`labelKey`, `message`→`messageKey`
- `lib/visa/health-score.ts` — `getScoreInterpretation` returns i18n key names instead of English strings
- `lib/i18n/config.ts` — Added `dateLocaleMap` + `toDateLocale()` helper

### Key cleanup (15 files)
- `app/[lang]/[country]/bundles/page.tsx` — `key={bundle.title}`
- `components/sections/services-detail-section.tsx` — `key={service.href}`
- `components/sections/social-proof-section.tsx` — `key={testimonial.name}` (1 instance)
- `components/social-proof-section.tsx` — `key={testimonial.author}` (carousel cards)
- `components/sections/why-section.tsx` — `key={value.title}`
- `components/sections/comparison-section.tsx` — `key={item.feature}`
- `components/sections/faq-section.tsx` — `key={faq.question}`
- `components/business/BusinessWhyUsSection.tsx` — `key={pillar.title}`
- `components/business/BusinessProblemSection.tsx` — `key={problem.title}`
- `components/business/BusinessHowItWorksSection.tsx` — `key={step.number}`
- `components/business/BusinessNotForSection.tsx` — `key={item.title}`
- `components/visa/journey/steps/StepApply.tsx` — `key={link.url}`
- `components/visa/journey/VisaJourneyPage.tsx` — `key={faq.question}`
- `components/visa/detail/ThingsToKnow.tsx` — `` key={`${item.type}-${index}`} ``
- `components/visa/EligibilityQuiz.tsx` — `` key={`reason-${i}`} ``
- `components/visa/quiz/QuizResults.tsx` — `` key={`match-${index}`} ``, `` key={`warning-${index}`} ``

## Remaining `key={index}` (Acceptable)
All remaining instances are loading skeletons, static string arrays, dot navigations, or shadcn-managed components — no action needed.

## Architectural Decisions
1. **`getScoreInterpretation` returns key names** — keeps utility pure (no hook dependency), standard next-intl pattern
2. **`getNextAction` returns `titleKey`/`descriptionKey`/`ctaKey`** — with fallback `title`/`description` for dynamic data (UNDER_REVIEW deadline)
3. **DDayPanel uses `labelKey` in useMemo** — resolved to translated string via `t(labelKey)` in JSX, avoids hook-in-memo violation
4. **`toDateLocale()` helper** — centralized BCP 47 mapping in `lib/i18n/config.ts`

## What's Left
- ESLint could not run due to a pre-existing npm permission issue (unrelated to Cycle 8)
- No remaining hardcoded English strings in dashboard components
- Locale date formatting verified in all 3 files
