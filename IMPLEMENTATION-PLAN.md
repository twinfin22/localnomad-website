# LocalNomad Implementation Plan

**Date:** 2026-02-12
**Based on:** 5-agent deep audit (first-timer, resident, scout, inspector, counsel)
**Current score:** 32/100 (user personas), 38/100 (technical)

---

## The Situation in One Paragraph

LocalNomad has excellent architecture and a well-designed data model — the skeleton of a 10x product. But right now it's an information site pretending to be a tool. The state machine is unwired, the health score is unrendered, 75% of the UI ignores i18n, TypeScript errors are hidden behind `ignoreBuildErrors: true`, and the #1 feature identified by research (Visa Path Simulator) exists as type definitions but zero UI. The audit consensus is clear: fix the foundation in Week 1, ship the wedge feature (Path Simulator) in Weeks 2-4, then expand reach in Month 2.

---

## Phase 1: Legal + Foundation (Week 1)

**Goal:** Stop shipping broken/risky things. Establish trust.

### 1A. Legal Copy Fixes (2 hours)

No i18n dependency — pure same-language string replacements.

| File | Current | Fix |
|------|---------|-----|
| `components/visa/detail/EligibilitySection.tsx` | "You may be eligible" + green checkmark | "Your answers align with published requirements" + neutral indicator |
| `components/visa/journey/steps/StepQualify.tsx` | "you appear to qualify for this visa" | "Your answers match the published requirements for this visa" |
| `components/visa/EligibilityQuiz.tsx` | "here are your recommended visas" / "Best Match" | "Visas with matching requirements include..." / "Closest requirement match" |
| `components/visa/detail/QuickEligibilityCheck.tsx` | "You may be eligible" | "Your answers match published requirements" |
| `components/visa/VisaComparisonTool.tsx` | "personalized recommendations" in CTA | "explore visa options" |
| `app/[lang]/[country]/visa/page.tsx` | "12 visa types covered" | "6 full guides + 6 coming soon" |
| `app/[lang]/[country]/visa/page.tsx` | "Based on official requirements" | "Based on publicly available requirements" |
| `components/hero-section.tsx` | "500+ Nomads Helped" | Remove or replace with "Helping nomads navigate Korea" |
| `components/pricing-section.tsx` | "Help prepare required paperwork" | "Checklist of required paperwork" |
| `data/visas/en/e-7.json` | "You have a grace period (usually 30 days)" | "A grace period may be granted (typically 30 days, but varies by case)" |

### 1B. Security Fixes (3 hours)

| Fix | File | What |
|-----|------|------|
| Open redirect | `app/auth/callback/route.ts` | Validate `next` param against allowlist of internal paths |
| Auth redirect locale | `app/auth/callback/route.ts` | Include `/{lang}/{country}/` prefix in redirect |
| Supabase null safety | `lib/supabase/client.ts` | Replace `null as any` with proper typed null or throw |
| Supabase server safety | `lib/supabase/server.ts` | Replace `!` assertions with env var guards |
| Rate limiting | `app/api/subscribe/route.ts` | Add basic rate limiting (IP-based, 5/min) |
| PII in logs | `app/api/subscribe/route.ts` | Remove `console.log` of email addresses |

### 1C. Build Foundation (1-3 days)

This is the non-negotiable item. Everything else is built on sand without it.

1. **Remove `ignoreBuildErrors: true`** from `next.config.mjs`
2. **Remove `images: { unoptimized: true }`** from `next.config.mjs`
3. Run `npm run build` and fix every TypeScript error that surfaces
4. Fix auth layout `<html lang="en">` to use actual locale
5. Fix header/footer nav links to include `/{lang}/{country}/` prefix

### 1D. Loading & Error States (1 day)

Add to every route group in `app/`:
- `loading.tsx` — skeleton screens matching page layout
- `error.tsx` — graceful error boundary with retry button
- `not-found.tsx` — custom 404 with navigation back to visa section

---

## Phase 2: The Wedge (Weeks 2-3)

**Goal:** Ship the one feature that no competitor has and that every user persona independently ranked #1.

### 2A. Visa Path Simulator

**Why this feature above all:** Solves Pain Point #2 (5/5 severity). 0/5 competitors have it. Engine partially exists. Research calls it "킬러 기능 확정." Creates strongest switching cost. Naturally feeds dashboard → checklist → health score funnel.

**Data work:**
- Populate `pathsTo` and `pathsFrom` in all 12 visa JSON files (all 3 locales)
- Add transition requirements, estimated timelines, and success factors per path
- Add disclaimer text to each path: "Paths shown are general information; actual transitions depend on individual circumstances and immigration officer discretion"

**UI work:**
- New route: `/[lang]/[country]/visa/path`
- Interactive visual flow: select current visa → see all reachable destinations → click path to see requirements at each step
- Mobile-first card-based layout (not a flowchart — cards work on mobile)
- Each path step shows: requirements, documents needed, estimated timeline, common pitfalls
- Shareable URLs per path configuration (deep-linking)
- CTA at end: "Start this path" → links to document checklist for target visa

**Connect to existing features:**
- Render `relatedVisas` on visa detail pages (`VisaJourneyPage.tsx`)
- Link path simulator from quiz results (`VisaPathMap.tsx` already exists)
- Link from "Already have a visa?" section on visa landing page

### 2B. Wire the Dashboard

**State advancement:** Add UI buttons to advance visa state. The state machine (`stateMachine.ts`) already has `updateProgressState()` with valid transitions. Need:
- "I submitted my application" → PREPARING → SUBMITTED
- "It's under review" → SUBMITTED → UNDER_REVIEW
- "I got approved!" → UNDER_REVIEW → APPROVED
- Confirmation dialog before each transition
- Reverse transition support (went back to PREPARING)

**Fix broken elements:**
- Wire Settings button (`StateDashboard.tsx:147-152`) — add onClick handler
- Fix empty state CTAs to link to quiz/wizard with locale prefix
- Unify two document checklist localStorage keys (`visa-checklist` vs `visa-checklist-{type}`)

**Render health score:**
- `calculateHealthScore()` in `lib/visa/health-score.ts` is ready
- Add `HealthScoreCard` to dashboard (component exists in `components/visa/dashboard/`)
- Add self-reported disclaimer: "This dashboard tracks your self-reported progress. It is not connected to HiKorea or any government system."

### 2C. "I Already Have a Visa" Path

- Promote "Already have a visa?" from small dropdown to first-class section on visa landing page
- Add flows: renewal guide, employer change guide, "my visa is expiring" emergency path
- For E-7 specifically: full employer-change procedure with Korean document names (사업자등록증, 고용계약서, etc.)
- D-10 fallback transition guidance when E-7 can't be renewed

### 2D. Fix OnboardingWizard Bug

- `OnboardingWizard.tsx:268-270`: `calculateMatches()` called before `setSelectedSituation()` takes effect
- Fix: use the situation value directly in calculation instead of reading from state

---

## Phase 3: Reach + Polish (Month 2)

**Goal:** Serve the actual user base, not just English-speaking Western expats.

### 3A. Vietnamese Language Support

- Add `vi` to `lib/i18n/config.ts` locales
- Create `messages/vi.json` (287 keys)
- Translate all 12 visa JSON files to Vietnamese (`data/visas/vi/`)
- Add Vietnam to quiz nationality options (`data/quiz/questions.json`)
- Diversify social proof testimonials to include non-Western names and E-7 worker roles

### 3B. Wire i18n to the 75% of Components Still Hardcoded

Priority order (by user impact):
1. Visa landing page (`app/[lang]/[country]/visa/page.tsx`)
2. Dashboard (`components/visa/dashboard/DashboardClient.tsx`)
3. Hero section (`components/hero-section.tsx`)
4. Auth pages (`app/auth/login/page.tsx`, `signup/page.tsx`)
5. LegalDisclaimer (`components/visa/LegalDisclaimer.tsx`) — critical for legal compliance
6. All remaining sections and pages

### 3C. Complete Stub Visa Pages

Fill the 6 stubs (E-2, D-7, D-8, F-6, F-4, D-4) with real data:
- Eligibility requirements, document lists, application steps, FAQs
- Korean document name translations (한국어 병기) in all checklists
- Community tips from Discord research

### 3D. Populate Community Tips

- The `communityTips` field exists in `lib/visa/types.ts` but is empty in all visa JSONs
- Extract 50+ verified tips from the Discord/Reddit research file
- Structure as: tip text, source (anonymized), date verified, upvote count placeholder
- Display on visa detail pages below FAQ section

### 3E. SEO Foundation

- Add `robots.txt` and `sitemap.xml`
- Add `hreflang` alternate tags for all locale variants
- Add OpenGraph meta tags (og:title, og:description, og:image)
- Add JSON-LD structured data for visa FAQ pages
- Create custom 404 page with navigation to visa section

### 3F. Global Disclaimer

After `LegalDisclaimer.tsx` is migrated to `useTranslations`:
- Add global footer disclaimer on ALL pages (citing 행정사법 and 변호사법)
- Add banner-style disclaimer at TOP of visa detail pages
- Add disclaimer header to DocumentChecklist .txt export
- Add pre-results consent gate on quiz flow

---

## Phase 4: Stickiness (Month 3)

### 4A. User Accounts with Cloud Sync

- Supabase types already defined (`UserProfile`, `UserVisaProgress`, `UserChecklistItem` in `types.ts:330-365`)
- Implement real persistence for: checklist progress, dashboard state, target dates, path selections
- Sync across devices — this is the switching cost moat

### 4B. Notification System

- Push/email notifications for visa deadlines using Resend infrastructure
- Visa-specific email segmentation (ask visa type on signup)
- D-Day countdown emails at 90/60/30/14/7 days before expiry

### 4C. Korean Language Support

- Add `ko` locale — product is about Korea but doesn't support Korean
- Critical for employer-facing features (HR staff reads Korean)

### 4D. Income Calculator

- GNI-based threshold display with currency conversion
- Use `gniBasedIncome` and `fixedIncomeRequirement` types already in schema
- Gross vs net mode
- Template-only approach (user fills in numbers, per counsel's guidance)

---

## What NOT to Build

Per counsel's legal audit, these features are RED zone:

- **Application form generator** — auto-filling = 행정사 work
- **HiKorea account integration** — storing credentials = PIPA liability
- **Personalized legal consultation** — case-specific advice = 변호사법 violation
- **행정사 marketplace with per-lead fees** — exactly what K-Visa was attacked for

---

## Success Metrics

| Metric | Current | Phase 2 Target | Phase 4 Target |
|--------|---------|----------------|----------------|
| Audit score (user persona) | 32/100 | 55/100 | 75/100 |
| Audit score (technical) | 38/100 | 65/100 | 80/100 |
| Features with server persistence | 1 (email) | 4+ | All |
| i18n coverage | ~25% | ~50% | ~90% |
| Stub visas completed | 0/6 | 0/6 | 6/6 |
| Loading/error states | 0 | All routes | All routes |
| Languages supported | 3 | 4 (add vi) | 5 (add ko) |
