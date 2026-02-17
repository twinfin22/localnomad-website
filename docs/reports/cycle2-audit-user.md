# Cycle 2 User Journey Audit Report

**Persona**: Linh (Vietnamese, 28, UX designer, TOPIK 3)
**Auditor**: journey-tester
**Date**: 2026-02-12

---

## Journey 1: "What visa can I get?" (Score: 14/20)

### What I Found

**Entry point**: `/app/[lang]/[country]/visa/page.tsx` (lines 40-283)

The landing page uses a situation-based tile grid approach. Six primary situations are displayed immediately ("I have a job offer", "I want to study", "I want to work remotely", etc.) with six more behind a "Show more" expand. The tiles are clear, emoji-enhanced, and each links to a visa detail page.

**Situation tiles** (`components/visa/landing/SituationGrid.tsx`, `SituationTile.tsx`): Clean, minimal component. Tiles show emoji + translated situation text. The `visa` code is **not shown on the tile**, meaning Linh sees "I want to work remotely for a foreign company" rather than "F-1-D" -- this is good for a non-expert.

**Two quiz systems exist**:
1. **Old EligibilityQuiz** (`components/visa/EligibilityQuiz.tsx`, lines 51-207): Hardcoded 6-question quiz with scoring. Questions cover purpose, education, work experience, income, Korean level, employer. Produces a weighted score against D-10, E-7, F-1-D, F-2. Has consent gate before results (lines 320-369).
2. **New VisaFinder** (`components/visa/quiz/VisaFinder.tsx`): Data-driven from `data/quiz/questions.json`. Uses a 3-step flow (nationality, current status, goal) with conditional follow-up questions. More sophisticated, powered by `lib/visa/quiz-engine.ts`.

**Quiz data** (`data/quiz/questions.json`, lines 11-22): Nationality options are US, UK, Canada, Australia, Germany, France, Japan, "Other EU Country", and "Other Country". **Vietnam is not explicitly listed**. Linh would have to select "Other Country" (value: `"other"`, icon: `"Globe"`). This is functional but does not feel personalized for someone from Vietnam -- a major Southeast Asian nationality.

**Visa detail page** (`app/[lang]/[country]/visa/[type]/page.tsx`, lines 62-135): Loads visa data by type and locale. Uses `getVisaInfo(type, locale)` which supports `en`, `ja`, `zh-tw`. Falls back to `notFound()` if no data. Renders either `VisaJourneyPage` (full guide) or `VisaStubPage` (coming soon) based on `visa.isStub`.

**VisaJourneyPage** (`components/visa/journey/VisaJourneyPage.tsx`): Well-structured 4-step accordion: Review Requirements, Gather Documents, Submit Application, After Approval. FAQs and official links are collapsible. Legal disclaimer present. Related visas section with links.

### What Works Well
- Situation-based entry is intuitive -- Linh can identify her situation without knowing visa codes
- Two-tiered approach (primary + "show more") prevents overwhelming users
- "Already have a visa?" section provides a secondary entry point for existing holders
- Legal disclaimer is prominent on the landing page
- i18n keys are used throughout the landing page (translatable)
- Consent gate before quiz results is a responsible UX pattern
- Visa detail pages have structured JSON-LD for SEO
- Deep linking support via `#after-approval` hash for visa holders

### What's Broken or Missing
1. **Vietnam not in nationality options** (`data/quiz/questions.json`, line 22): Only 7 specific countries + "Other EU" + "Other". Vietnam is a top-5 source of foreigners in Korea. Linh selects "Other Country" -- this feels generic and may affect quiz accuracy.
2. **Two competing quiz systems**: `EligibilityQuiz.tsx` (hardcoded, English-only) and `VisaFinder.tsx` (data-driven). It is unclear which is canonical. The landing page (`visa/page.tsx`) does **not** link to either quiz directly -- there is no "Take our quiz" CTA. The quiz lives at `/visa/find` but is not prominently linked from the main visa landing.
3. **EligibilityQuiz is English-only**: All questions, options, and results are hardcoded strings (lines 51-207). Not translatable. The VisaFinder quiz uses JSON data but that data is also English-only.
4. **Quiz results link to `/visa/${result.type}`** (`EligibilityQuiz.tsx`, line 476): This is a **non-locale-aware href**. Should be using `buildLocalePath`. The same issue exists in `QuizResults.tsx` (line 109) and multiple places in the quiz system.
5. **No Vietnamese language support**: The site supports `en`, `ja`, `zh-tw` but not `vi`. Linh must use English. While the English is generally clear, some visa terminology may be unfamiliar.
6. **Working Holiday (H-1) shown prominently** but Vietnam does **not** have a Working Holiday agreement with Korea. There is no nationality-based filtering of situation tiles.

### Score Justification: 14/20
The situation-based landing is well-designed and the visa detail pages are comprehensive. Deductions: Vietnam is underrepresented in the quiz (-2), no prominent quiz CTA from the main landing (-1), hardcoded English-only quiz strings (-1), broken locale-unaware links in quiz results (-2).

---

## Journey 2: "How do I switch visas?" (Score: 16/20)

### What I Found

**Entry point**: `/app/[lang]/[country]/visa/path/page.tsx` (lines 52-124)

The path simulator is a well-structured 3-step wizard: (1) Select starting visa, (2) Select destination, (3) View path details. Wrapped in Suspense for loading state.

**VisaPathSimulator** (`components/visa/path/visa-path-simulator.tsx`, lines 69-261): Client component with URL state management (`?from=&to=`). Supports deep-linking -- you can send someone `/visa/path?from=d-10&to=e-7` and they land on the path view directly.

**Path data** (`lib/visa/path-data.ts`): Comprehensive. Covers 17 distinct paths:
- Tourist to F-1-D, D-2, H-1, E-7, D-10
- D-2 to D-10 to E-7, D-2 to E-7
- D-4 to D-2 to E-7
- D-10 to E-7, D-10 to D-8
- E-7 to F-2
- F-1-D to E-7, F-1-D to E-7 to F-2, F-1-D to D-8
- H-1 to D-4 to D-2, H-1 to E-7
- E-2 to E-7
- D-7 to F-2
- D-8 to F-2

Each path has requirements, tips, pitfalls, difficulty level, duration, and "suitable for" tags.

**PathCard** (`components/visa/path/path-card.tsx`): Expandable cards with requirements, tips, pitfalls sections. Step number indicators. Links to full visa detail pages for each step. Visual connecting lines between cards.

**Visa JSON data** (e.g., `data/visas/en/e-7.json`, lines 216-291): Rich `pathsTo` and `pathsFrom` arrays with requirements, timeline, documents list, and notes for each transition. This data is comprehensive and well-researched.

**For Linh's scenario**: She could:
1. Select "No Visa / Tourist" as starting point
2. See destinations: F-1-D, D-2, H-1, E-7, D-10, D-4, D-7, D-8
3. Select E-7 (if she has a job offer as a UX designer)
4. See the "Tourist to Employment" path with requirements, tips, pitfalls

### What Works Well
- 3-step wizard with progress bar is intuitive
- URL state enables shareable/bookmarkable paths
- Disclaimer at the top about immigration officer discretion
- Rich path cards with expandable details (requirements, tips, pitfalls)
- CTA to start the path (links to document checklist)
- Alternative paths shown when multiple routes exist
- Mobile-friendly: select dropdown on small screens, card grid on desktop
- "Back" navigation works correctly at each level

### What's Broken or Missing
1. **10 starting points, but some have zero destinations**: F-2, F-4, F-6 have empty destination arrays in the transition graph (line 1080-1083). Selecting them shows "No known transition paths" -- this is handled gracefully with a message, but these could be excluded from the starting point list or explained better.
2. **Path simulator is English-only**: All path names, descriptions, requirements, tips, and pitfalls are hardcoded in `path-data.ts`. Not translatable.
3. **No reverse path lookup**: You can go from current visa to destination, but cannot say "I want F-2, where can I start?" The UI only supports forward navigation.
4. **Some missing paths**: No D-2 to F-1-D path (student graduates and becomes digital nomad). No F-1-D to F-2 direct path (would need to go through E-7 first, which is shown).

### Score Justification: 16/20
The path simulator is one of the strongest features. Rich data, clear UI, good interactivity. Deductions: English-only path data (-2), some edge-case paths missing (-1), F-2/F-4/F-6 shown as starting points with no destinations (-1).

---

## Journey 3: "Track my progress" (Score: 11/20)

### What I Found

**Entry point**: `/app/[lang]/[country]/visa/dashboard/page.tsx` (lines 46-56)

The dashboard page renders `DashboardClient` which requires authentication via Supabase.

**Two competing dashboard implementations exist**:
1. **DashboardClient** (`components/visa/dashboard/DashboardClient.tsx`, lines 351-514): Requires Supabase auth. Shows sign-in screen if not authenticated. Fetches data from `visa_progress` and `checklist_items` tables.
2. **StateDashboard** (`components/visa/StateDashboard.tsx`, lines 710-800): Uses localStorage-based state machine. No auth required.

The page at `app/[lang]/[country]/visa/dashboard/page.tsx` uses `DashboardClient`, so **the actual dashboard requires authentication**. The `StateDashboard` component exists but is not mounted in any route page.

**DashboardClient flow** (for unauthenticated Linh):
- Sees loading skeleton
- Then sees "Sign in to continue" with "Sign In" and "Create Account" buttons
- Links go to `/auth/login` and `/auth/signup`

**If Linh is not logged in**, she hits a **dead end**. The empty state does show "Find My Visa" (links to `/visa/find`) and "Browse All Visas" (links to `/visa`), but these are only visible **after** authentication when no progress exists.

**StateDashboard (localStorage-based)** (`components/visa/StateDashboard.tsx`):
- Empty state has links to `/visa/start` (which may not exist) and `/visa`
- Active state shows: NextStepHero, HealthScoreCard, DDayCounter, StateTimeline, StateAdvancementButtons
- **Confirmation dialogs** (lines 268-329): Yes, AlertDialog is used for every state transition. Each has custom title and description. Cancel button available.
- **Settings Sheet** (lines 362-481): Change visa type, target date, and reset all progress (with confirmation)
- **Disclaimer** (lines 339-349): "This dashboard tracks your self-reported progress. It is not connected to HiKorea or any government system."

**HealthScoreCard** (`components/visa/dashboard/HealthScoreCard.tsx`): Circular progress indicator showing preparation score (0-100) based on documents completed (50% weight), timeline (25% weight), insurance status (15% weight). Has a disclaimer: "This score reflects your document preparation progress, not approval likelihood."

### What Works Well
- HealthScoreCard is visually appealing with clear factor breakdown
- State transition buttons have confirmation dialogs (good UX safety)
- Settings sheet allows changing visa type, target date, and full reset
- DDayCounter provides countdown to target date
- Disclaimer is present at the bottom
- Loading skeleton prevents layout shift

### What's Broken or Missing
1. **Auth wall blocks the entire dashboard**: `DashboardClient` requires Supabase authentication. No fallback to localStorage-based tracking. Linh cannot track anything without creating an account.
2. **StateDashboard is orphaned**: The localStorage-based dashboard exists but is not rendered on any page. It provides a complete experience without auth but is unreachable.
3. **EmptyState dead links**: In `StateDashboard.tsx` line 81, "Find My Visa" links to `/visa/start` -- this route does **not exist**. Quick access cards link to `/visa/e-7` and `/visa/d-2` without locale prefix. In `DashboardClient.tsx` line 63, it links to `/visa/find` which does exist.
4. **EmptyState quick access cards are hardcoded**: `StateDashboard.tsx` lines 99-125 hardcode E-7 and D-2. `DashboardClient.tsx` lines 81-107 hardcode E-7 and F-1-D. Neither uses locale-aware paths.
5. **Non-locale-aware links throughout**: Multiple `Link href="/visa/..."` without locale prefix in both dashboard implementations. These will 404 or redirect incorrectly in non-English locales.
6. **Insurance status is hardcoded to `true`** (line 539 in `StateDashboard.tsx`, line 137 in `DashboardClient.tsx`): `insuranceValid: true` with a TODO comment. This makes the health score misleading.
7. **No onboarding flow**: When Linh first visits the dashboard, there is no guided setup to select her visa type and target date. She must navigate to Settings to configure.
8. **Dashboard page does not pass lang/country to DashboardClient**: The page component receives these params but does not forward them (line 52-54), so the client component cannot build locale-aware links.

### Score Justification: 11/20
The underlying components (HealthScoreCard, state machine, confirmation dialogs) are well-built, but the user-facing experience is severely limited. The auth wall prevents access (-4), orphaned StateDashboard wastes a good localStorage implementation (-2), dead/broken links (-2), no onboarding (-1).

---

## Journey 4: "Get my documents ready" (Score: 14/20)

### What I Found

**Entry points**:
- Generic checklist: `/app/[lang]/[country]/visa/checklist/page.tsx` (uses `DocumentChecklist`)
- Type-specific checklist: `/app/[lang]/[country]/visa/checklist/[type]/page.tsx` (uses `ChecklistPage`)

**Two checklist implementations**:
1. **DocumentChecklist** (`components/visa/DocumentChecklist.tsx`, lines 91-319): Generic checklist with visa selector. Uses `visa-checklist-{type}` localStorage key. Includes migration from old nested format.
2. **ChecklistPage** (`components/visa/checklist/ChecklistPage.tsx`, lines 47-240): Type-specific checklist. Same localStorage pattern. Rendered at `/visa/checklist/e-7`.

**ChecklistItem** (`components/visa/checklist/ChecklistItem.tsx`): Expandable item with checkbox, difficulty badge (easy/medium/hard), processing time, tips, where-to-get info, and cost.

**For Linh's E-7 scenario** (`data/visas/en/e-7.json`):
- 8 documents listed: Passport, Application Form, Passport Photo, Employment Contract, Company Business Registration, Degree Certificate, Career Certificate, Tax Documents
- 7 required, 1 optional (tax documents)
- Tips present on Degree Certificate and Career Certificate
- No Korean names (`nameKorean` field) in any document

**Per-type localStorage**: Yes, confirmed. Key format is `visa-checklist-{type}` (e.g., `visa-checklist-e-7`). Each visa type has independent state. Migration logic exists for old format.

**Export functionality**: Both implementations have export. `DocumentChecklist` (line 281-314) exports as plain text with disclaimer at top. `ChecklistPage` (lines 83-119) also exports as text but **without** the disclaimer prefix.

### What Works Well
- Per-type localStorage prevents cross-visa contamination
- Migration from old format is graceful (backward compatible)
- ChecklistItem has difficulty estimation, tips expansion, where-to-get info
- Progress bar shows required vs total completion
- Export to text file is available
- Visa selector in generic checklist allows easy switching
- ChecklistPage has back-link to visa detail page
- Legal disclaimer present on ChecklistPage (line 234)

### What's Broken or Missing
1. **No Korean document names**: The `Document` type supports `nameKorean` (defined in `ChecklistDocument` in types.ts line 219), but none of the visa JSON files include it. Linh needs to know that "Degree Certificate" is called "학위증명서" when she goes to the office. This is a significant gap for someone with TOPIK 3 who might need to communicate in Korean.
2. **No `where_to_get` for most documents**: Only D-10's "Visa Application Form" has it. E-7 documents have no `where_to_get` fields. Linh doesn't know where to get an apostille or business registration.
3. **No `processing_time` or `cost` fields**: The `Document` type supports them, but the visa JSON data does not include them. ChecklistItem has rendering logic for these fields, but they are always empty.
4. **Export disclaimer inconsistency**: `DocumentChecklist` includes a disclaimer at export time; `ChecklistPage` does not. Exported files from the type-specific page lack any legal notice.
5. **Non-locale-aware links**: `ChecklistPage` line 139 uses `/visa/${visa.type}` without locale prefix. Works for English but breaks for ja/zh-tw.
6. **No category grouping**: The `ChecklistDocument` type supports `category` (identity, financial, education, etc.) for logical grouping, but the actual data just uses required/optional binary split. 12 document categories are defined in types but unused in practice.

### Score Justification: 14/20
The checklist is functional and usable with good persistence. Deductions: Missing Korean names for documents (-3), missing where_to_get/processing_time/cost (-2), export disclaimer inconsistency (-1).

---

## Overall User Score (Score: 13/20)

### Can Linh Complete Her Full Journey?

**Discovery to tracking flow**:
1. Linh visits the visa landing page -- clear, well-designed
2. She clicks "I have a job offer" -- goes to E-7 detail page -- informative
3. She wants to track progress -- clicks to Dashboard -- **blocked by auth wall**
4. She wants to check documents -- goes to checklist -- works, but no Korean names
5. She wants to explore switching later -- path simulator works well

**The critical gap is the auth wall on the dashboard**. The localStorage-based `StateDashboard` exists and would solve this, but it is not wired to any route. This creates a dead end in the middle of the journey.

### Dead Ends and Broken Flows
1. **Dashboard auth wall**: No way to track progress without signing up
2. **`/visa/start` does not exist**: Linked from StateDashboard empty state
3. **Non-locale-aware links**: Quiz results, dashboard quick actions, checklist breadcrumbs all use bare `/visa/...` paths
4. **H-1 prominently shown to Vietnamese users**: Vietnam has no WH agreement with Korea

### Usability for Non-Native English Speakers
- English is generally clear and accessible
- Visa terminology is explained in context
- Situation tiles use plain language ("I have a job offer") rather than visa codes
- However, no Vietnamese language option means Linh relies entirely on English
- Korean document names would help significantly when visiting immigration offices
- Some legal/technical language in disclaimers may be difficult at TOPIK 3 level

### Score Justification: 13/20
The discovery and information phases are strong, but the tracking and preparation phases have significant gaps. The auth wall is the single biggest blocker. Non-locale-aware links create a fragile experience for non-English users. The overall journey is 70% complete but the missing 30% is high-impact.

---

## Final Scores

| Journey | Score | Max |
|---------|-------|-----|
| 1. "What visa can I get?" | 14 | 20 |
| 2. "How do I switch visas?" | 16 | 20 |
| 3. "Track my progress" | 11 | 20 |
| 4. "Get my documents ready" | 14 | 20 |
| 5. Overall user experience | 13 | 20 |
| **Total** | **68** | **100** |

---

## Top 5 Issues Ranked by Impact

### 1. Dashboard Auth Wall Blocks Entire Tracking Flow (Blocker)
- **Files**: `/Users/leegen/localnomad/localnomad-website/components/visa/dashboard/DashboardClient.tsx` (lines 472-498), `/Users/leegen/localnomad/localnomad-website/components/visa/StateDashboard.tsx` (orphaned)
- **Impact**: Users cannot track visa progress without creating an account. The localStorage-based `StateDashboard` component exists and works but is not mounted on any route. The dashboard page only renders the auth-gated `DashboardClient`.
- **Fix**: Either wire `StateDashboard` as a fallback for unauthenticated users, or show a meaningful preview/onboarding on the dashboard page before requiring auth.

### 2. Non-Locale-Aware Links Throughout Quiz and Dashboard (Critical)
- **Files**: `/Users/leegen/localnomad/localnomad-website/components/visa/EligibilityQuiz.tsx` (line 476, 499), `/Users/leegen/localnomad/localnomad-website/components/visa/quiz/QuizResults.tsx` (line 109, 190), `/Users/leegen/localnomad/localnomad-website/components/visa/StateDashboard.tsx` (lines 81, 87, 99, 112, 549, 685, 694), `/Users/leegen/localnomad/localnomad-website/components/visa/dashboard/DashboardClient.tsx` (lines 63, 69, 81, 94, 146, 234, 288, 296), `/Users/leegen/localnomad/localnomad-website/components/visa/checklist/ChecklistPage.tsx` (line 139)
- **Impact**: Links using bare `/visa/...` paths will break or redirect incorrectly for Japanese and Chinese users. Affects quiz results, dashboard navigation, and checklist breadcrumbs.
- **Fix**: Pass `lang` and `country` params to all client components and use `buildLocalePath` for all internal links.

### 3. Missing Korean Document Names in Checklist Data (Warning)
- **Files**: All files in `/Users/leegen/localnomad/localnomad-website/data/visas/en/*.json`
- **Impact**: The `nameKorean` field exists in the type system (`ChecklistDocument` in types.ts line 219) but is never populated. Users with TOPIK 3+ who visit immigration offices need to know Korean names for documents like "Employment Contract" (고용계약서), "Degree Certificate" (학위증명서), "Career Certificate" (경력증명서).
- **Fix**: Add `nameKorean` field to all documents in visa JSON files. Render it in `ChecklistItem.tsx` alongside the English name.

### 4. Vietnam and Other Key Nationalities Missing from Quiz (Warning)
- **Files**: `/Users/leegen/localnomad/localnomad-website/data/quiz/questions.json` (lines 11-22)
- **Impact**: Vietnam, China, India, Philippines, Indonesia -- the top source countries for Korean immigration -- are not listed. These users must select "Other Country" which feels impersonal and may produce less accurate results.
- **Fix**: Add Vietnam, China, India, Philippines, and Indonesia to the nationality list. Consider using a searchable dropdown for comprehensive coverage.

### 5. Hardcoded English Strings in Quiz and Path Components (Warning)
- **Files**: `/Users/leegen/localnomad/localnomad-website/components/visa/EligibilityQuiz.tsx` (all question text), `/Users/leegen/localnomad/localnomad-website/lib/visa/path-data.ts` (all path names/descriptions/requirements/tips), `/Users/leegen/localnomad/localnomad-website/components/visa/path/visa-path-simulator.tsx` (UI labels)
- **Impact**: The quiz and path simulator are completely English-only. Even though the landing page uses i18n keys, these interactive components would need a complete rewrite to support translation.
- **Fix**: Extract all strings to translation files. For path data, consider a locale-indexed data structure similar to visa JSON files.
