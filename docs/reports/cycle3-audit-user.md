# Cycle 3 — Final User Journey Audit (Linh Persona)

**Date**: 2026-02-12
**Auditor**: Linh (Vietnamese SW engineer, 28, intermediate English, some Korean)
**Commit**: de5309c

## Overall Score: 74/100

---

### Journey 1: Discovery (16/20)

**Goal**: Starting from the visa landing page, find and complete the eligibility quiz to determine the right visa.

**Landing page** (`app/[lang]/[country]/visa/page.tsx`):
- Situation-based grid is excellent for my case. Line 56: "I have a job offer in Korea" links directly to E-7. Very intuitive.
- 12 visa situations covered across `primarySituations` (6) and `moreSituations` (6) at lines 50-127.
- A CTA links to the "Visa Path Simulator" at line 212 and a "Compare All Visa Types" link at line 243.
- Trust badges ("Free to use", "No account required", "Updated regularly") at lines 250-263 build confidence.

**VisaFinder quiz** (`components/visa/quiz/VisaFinder.tsx`):
- Accessible at `/visa/find` (line 55 of `app/[lang]/[country]/visa/find/page.tsx`).
- Uses `useReducer` with a clear 3-5 step flow: Nationality -> Status -> Goal -> (Conditional) -> Results.
- Step labels: `['Nationality', 'Status', 'Goal', 'Background', 'Results']` (QuizProgress.tsx, line 16).

**Vietnam in nationality list** (`data/quiz/questions.json`, line 21):
- `{ "value": "vietnam", "label": "Vietnam", "icon": "Globe" }` -- YES, Vietnam is present. This is critical for me.

**Quiz engine** (`lib/visa/quiz-engine.ts`):
- Scoring is sophisticated: base score * goal multiplier + bonuses for income/education/Korean level.
- H-1 Working Holiday correctly filters by `WH_AGREEMENT_COUNTRIES` (lines 100-113). Vietnam is NOT in this list, which is factually correct -- Korea and Vietnam do not have a Working Holiday agreement.
- If I select "Vietnam" as nationality and "Working Holiday" as goal, H-1 score is set to 0 (line 206, 218-219) with a warning "Country may not have Working Holiday agreement". This is accurate and helpful.

**Results page** (`components/visa/quiz/QuizResults.tsx`):
- Shows match levels: Strong/Moderate/Possible with color-coded cards (lines 25-47).
- Match reasons and warning reasons displayed (lines 213-234).
- Includes `VisaPathInline` showing multi-step paths (line 237-240).
- `QuizDisclaimer` shown at bottom (line 152).
- Links are locale-aware via `parseLocalePath` + `buildLocalePath` (lines 63-66).

**Legacy EligibilityQuiz** (`components/visa/EligibilityQuiz.tsx`):
- A second quiz component exists with 6 hardcoded questions (purpose, education, work experience, income, Korean level, employer). Lines 53-210.
- This quiz does NOT ask nationality at all -- it only scores against d-10, e-7, f-1-d, f-2 (line 299).
- Has a consent gate before showing results (lines 326-376) -- good practice.
- Unclear which quiz the user reaches; the landing page does NOT link to either quiz directly. The `/visa/find` page uses `VisaFinder`. There is no link to `/visa/find` from the landing page.

**What works**:
- Vietnam is in the nationality list.
- Questions are relevant (goal, status, nationality, conditional follow-ups).
- Results show match levels with clear explanations.
- WH agreement filtering is factually accurate for Vietnam.
- Locale-aware links in results.

**What's missing**:
- The visa landing page (`/visa`) has no link to the quiz (`/visa/find`). A user must navigate there manually or somehow discover it. The landing page focuses on situation tiles and path simulator, not the quiz. (-2)
- The `EligibilityQuiz` and `VisaFinder` are two separate quiz implementations with different logic. The `EligibilityQuiz` has no nationality question at all. Confusing if both are accessible. (-1)
- No Vietnamese language support (`vi` locale not in `locales` array at `lib/i18n/config.ts:11`). Only en, ja, zh-tw. (-1)

---

### Journey 2: Path Switching (17/20)

**Goal**: Currently on H-1 Working Holiday, want to switch to E-7. Can the path simulator help?

**Path Simulator** (`components/visa/path/visa-path-simulator.tsx`):
- Three-step flow: Select Start -> Select Destination -> View Path (line 43).
- Starting points include H-1 (`lib/visa/path-data.ts:1075`): `'h-1': ['d-4', 'd-2', 'e-7']` -- E-7 is reachable.
- URL state management: `?from=h-1&to=e-7` is persisted via `updateUrlParams` (lines 103-121). Shareable and bookmarkable.
- Disclaimer always visible at top (lines 212-230) with link to Korea Immigration Service. Uses `next-intl` for i18n.
- Mobile-responsive: dropdown on small screens, card grid on desktop (lines 354-401).

**H-1 to E-7 path** (`lib/visa/path-data.ts`, lines 857-904):
- Path ID: `h1-to-e7`, Name: "Working Holiday to Employment".
- Two steps: H-1 (1 year) -> E-7 (1-3 years).
- Total duration: "2-4 years", Difficulty: "moderate".
- Suitable for: "Skilled professionals on WH", "Those who find unexpected opportunities".
- Step 1 requirements: "Currently on H-1 visa".
- Step 1 tips: "Use the working holiday to build a professional network", "Work at companies you might want to join full-time".
- Step 1 pitfalls: "Not all jobs done on H-1 qualify as relevant experience for E-7".
- Step 2 requirements: "Job offer from a Korean employer", "Bachelor's degree or equivalent", "Employer sponsorship".
- Step 2 tips: "Start the E-7 application process well before H-1 expires", "May need to leave Korea briefly and re-enter on E-7".
- Step 2 pitfalls: "Direct H-1 to E-7 change is possible but not guaranteed".

**PathCard** (`components/visa/path/path-card.tsx`):
- Expandable cards with step numbers, duration, requirements, tips, pitfalls (lines 134-194).
- Connecting lines between steps with chevron icons (lines 43-53).
- Footer links to full visa guide per step (lines 197-211).
- Uses `next-intl` translations throughout (`pathSimulator` namespace).

**H-1 data file** (`data/visas/en/h-1.json`):
- `pathsTo` array (lines 369-429) includes E-7 entry with: requirements ("Secure a job offer from a Korean company. Must have bachelor's degree or 5+ years experience"), timeline ("2-4 weeks processing"), documents list, and notes.
- Also includes paths to D-10, D-2, D-4, and E-2 -- comprehensive.

**CTA at bottom of path viewer** (visa-path-simulator.tsx, lines 658-688):
- Primary CTA: "Start this path -- View {visa} document checklist" linking to `/visa/checklist/{type}`. Actionable.
- Secondary CTA: "Learn more about {visa}" linking to visa detail page.

**What works**:
- H-1 to E-7 path exists and is well-documented.
- Requirements, timeline, documents, tips, and pitfalls are all present.
- Alternative paths available (h1-to-d4-to-d2 also shows up).
- URL state enables sharing.
- Disclaimer always visible.
- Full i18n support via next-intl.

**What's missing**:
- The path simulator only shows the first conditional question for step 4 (`VisaFinder.tsx:243-254`, comment: "For simplicity, just show the first conditional question"). Multiple conditional questions exist but only one is displayed. (-1)
- No estimated cost information in path steps (fees are in the visa JSON but not surfaced in the path card). (-1)
- Alternative path count indicator works but there's no comparison view to see both paths side-by-side. (-1)

---

### Journey 3: Tracking Progress (14/20)

**Goal**: Decided on E-7, want to track preparation progress.

**Two dashboard implementations exist**:

1. **DashboardClient** (`components/visa/dashboard/DashboardClient.tsx`) -- Supabase-backed, requires authentication.
2. **StateDashboard** (`components/visa/StateDashboard.tsx`) -- localStorage-backed, no auth needed.

**DashboardClient** (auth-required):
- Uses `useAuth()` hook (line 354) and `createClient()` Supabase (line 372).
- Fetches from `visa_progress` and `checklist_items` tables (lines 396-438).
- If not logged in: shows sign-in prompt (lines 478-503) with links to `/auth/login` and `/auth/signup`. Links are locale-aware via `localePath()` (line 490).
- Empty state: shows "Start Your Visa Journey" with links to quiz and visa browsing (lines 47-111).
- Active state: shows HealthScoreCard, DDayPanel, NextActionCard, document progress, current status (lines 125-309).
- All internal links use `localePath()` for locale-awareness (lines 148, 234, 290, 298).
- Settings button exists (line 167) but has no `onClick` handler -- it's a dead button.
- Disclaimer: "This dashboard tracks your self-reported progress. It is not connected to HiKorea or any government system." (lines 280-286).

**StateDashboard** (localStorage):
- Uses `getStoredProgress()` / `saveProgress()` from state machine (line 725-728).
- Has a **Settings Sheet** (lines 364-483) with:
  - Change visa type (all visas listed, lines 394-409).
  - Change target date (date picker, lines 416-431).
  - Reset all progress (danger zone with confirmation, lines 434-481).
- **State advancement buttons** (lines 255-335): Users can advance through PREPARING -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> ACTIVE -> EXPIRING -> EXPIRED. Each transition has an AlertDialog confirmation.
- `getNextStates()` and `canTransition()` enforce valid transitions (line 745-746).
- Health Score via `HealthScoreCard` (line 606) with factors: documents completed, days until target, insurance (hardcoded to `true` with TODO, line 544).
- DDayCounter (line 609) tracks days to target/expiry.
- StateTimeline (line 639) shows progress visually.
- NextStepHero (line 601) shows contextual next action.
- Document progress only shown in PREPARING state (line 649).
- "While You Wait" tips for SUBMITTED/UNDER_REVIEW states (lines 662-682).
- Disclaimer present (line 685).
- All links locale-aware via `localePath()` (lines 553, 689, 697).

**HealthScoreCard** (`components/visa/dashboard/HealthScoreCard.tsx`):
- Circular progress visualization (SVG, lines 47-79).
- Score breakdown: Documents (50%), Timeline (25%), Insurance (15%) (lines 99-117).
- Score interpretation with labels: color-coded by score range (lines 67-73).
- Disclaimer: "This score reflects your document preparation progress, not approval likelihood." (line 123).

**DDayPanel** (`components/visa/dashboard/DDayPanel.tsx`):
- Handles all states: NO_VISA, PREPARING through EXPIRED (lines 24-80).
- D-Day format (D-30, D-Day, D+5) with urgency colors (lines 118-126).
- Renewal window indicator for active visas (lines 131-144).

**NextActionCard** (`components/visa/dashboard/NextActionCard.tsx`):
- State-aware next actions (lines 30-143). For PREPARING: "Start Document Collection" or "X Documents Remaining".
- **Critical issue**: Links are NOT locale-aware. Uses raw paths like `/visa/checklist/${visaType}` without `localePath()` (lines 48, 55, 65, 74, 84, 93, etc.). This means clicking these buttons on a Japanese or Chinese locale would break navigation.

**What works**:
- Two dashboard options (auth + localStorage) cover different user needs.
- State machine with proper transition validation is solid.
- Health score provides actionable feedback.
- D-Day counter is culturally appropriate (Korean concept).
- Settings sheet allows changing visa type and target date.
- Reset with confirmation prevents accidents.
- Disclaimers present in both dashboards.

**What's missing**:
- DashboardClient Settings button is non-functional (line 167, no onClick handler). (-2)
- NextActionCard links are NOT locale-aware -- hardcoded paths without `localePath()`. (-2)
- Insurance is hardcoded to `true` with a TODO comment (DashboardClient line 139, StateDashboard line 544). Not trackable. (-1)
- No way to set notes or custom milestones in the dashboard. (-1)

---

### Journey 4: Documents & Checklist (16/20)

**Goal**: Prepare documents for E-7 visa. Need a checklist with Korean names.

**ChecklistPage** (`components/visa/checklist/ChecklistPage.tsx`):
- Receives `visa: VisaInfo` as prop (line 31).
- Breadcrumb links back to visa detail page, locale-aware (line 147-151).
- Progress displayed via `ChecklistProgress` component (lines 169-174).
- Documents split into Required and Optional sections (lines 196-238).
- **Export function** (lines 89-129): Generates a `.txt` file with disclaimer, required/optional docs, and checked status. Downloaded as `{visa-type}-checklist.txt`.
- State persisted in localStorage per visa type: `visa-checklist-{type}` (lines 60-80).
- Legal disclaimer at bottom via `LegalDisclaimer variant="box"` (line 243).

**ChecklistItem** (`components/visa/checklist/ChecklistItem.tsx`):
- Shows document name with **Korean name in parentheses** (lines 73-76):
  ```tsx
  {document.nameKorean && (
    <span className="text-muted-foreground text-sm font-normal ml-1">
      ({document.nameKorean})
    </span>
  )}
  ```
- Expandable tips section (lines 109-122): shows tip count, expands to show all tips.
- Difficulty estimation based on processing time (lines 28-33): easy/medium/hard.
- Processing time badge (lines 86-91).
- Required badge (lines 100-103).
- "Where to get" info when expanded (lines 141-148).

**E-7 document data** (`data/visas/en/e-7.json`, documents array lines 58-122):
| Document | nameKorean | Required |
|----------|-----------|----------|
| Valid Passport | 여권 | Yes |
| Visa Application Form | 사증발급신청서 | Yes |
| Passport Photo | 여권사진 | Yes |
| Employment Contract | 고용계약서 | Yes |
| Company Business Registration | 사업자등록증명서 | Yes |
| Degree Certificate | 학위증명서 | Yes |
| Career Certificate | 경력증명서 | Yes |
| Tax Payment Certificates | 세금납부증명서 | No |

All 8 documents have `nameKorean` fields. This is complete and correct.

**DocumentChecklist** (`components/visa/DocumentChecklist.tsx`):
- Older implementation with visa selector (all visas, line 170-189).
- Also shows Korean names in parentheses (line 370-374).
- Export function includes Korean names in output (line 293): `[X] ${d.name}${d.nameKorean ? ` (${d.nameKorean})` : ""}`.
- Includes disclaimer in export text (lines 283-286).

**ChecklistProgress** (`components/visa/checklist/ChecklistProgress.tsx`):
- Shows total progress bar with percentage (lines 29-47).
- Separate required vs optional breakdown (lines 50-68).
- Completion message when all required docs ready (lines 71-77).

**What works**:
- All E-7 documents have Korean names (nameKorean) and they are displayed in the UI.
- Export function generates a text file with checklist state and disclaimer.
- Progress tracking works with required/optional breakdown.
- Tips are available for documents that have them (e.g., degree certificate tips at e-7.json:98-100).
- Difficulty estimation based on processing time is useful.
- Legal disclaimer present on the page.
- localStorage persistence means I can come back later.

**What's missing**:
- Export is text-only (`.txt`). No PDF export, no print stylesheet. (-2)
- Export from ChecklistPage (`ChecklistPage.tsx:89-129`) does NOT include Korean names in the output, unlike the older DocumentChecklist export which does. Inconsistency. (-1)
- No links to where to obtain documents (only the older DocumentChecklist shows `where_to_get`, and only one E-7 doc has it). (-1)

---

### Journey 5: Overall Experience (11/20)

**i18n** (`messages/en.json`):
- 16 namespaces with translations: `common`, `nav`, `home`, `hero`, `countryHub`, `visa`, `quiz`, `onboarding`, `eligibilityQuiz`, `dashboard`, `nextStepHero`, `bundles`, `areas`, `pathSimulator`, `languageBanner`, `legal`, `footer`, `auth`, `sections`.
- Additional locale files exist: `messages/ja.json`, `messages/zh-tw.json`.
- **No Vietnamese** (`vi`) locale file exists. No `ko` (Korean) locale either.
- Supported locales: `["en", "ja", "zh-tw"]` (`lib/i18n/config.ts:11`).
- For me as a Vietnamese speaker, the site is English-only. (-3)

**Legal disclaimers**:
- `LegalDisclaimer` component (`components/visa/LegalDisclaimer.tsx`) has three variants: `inline`, `box`, `banner`.
- Box variant: shows "Important Notice" with two paragraphs -- not legal advice, consult a licensed 행정사 or 변호사 (lines 72-101).
- Links to Korea Immigration Service and HiKorea (lines 80-98).
- `QuizDisclaimer`: separate component for quiz results (lines 109-124).
- `IncomeDisclaimer` and `DayTrackerDisclaimer` also exist (lines 127-153).
- Footer disclaimer (`components/footer.tsx:93-98`): "LocalNomad provides general information... does not constitute legal advice. Visa decisions are made solely by Korean immigration authorities. For personalized legal advice, consult a licensed Korean 행정사 or 변호사." -- good, present on every page.
- Footer also has Terms of Service, Privacy Policy, Refund Policy links (lines 79-89), all locale-aware.

**Navigation locale-awareness**:
- Footer uses `localePath()` for all links (line 16, used at lines 19-21, 79, 83, 87).
- Header uses locale-aware navigation (confirmed by import patterns).
- Most components use `parseLocalePath` + `buildLocalePath` for internal links.
- **Exception**: `NextActionCard` (`components/visa/dashboard/NextActionCard.tsx`) uses hardcoded paths without locale prefix (lines 48, 55, 65, 74, 84, 93, etc.). This breaks navigation for ja/zh-tw users. (-3)
- The visa landing page uses `buildHref` (line 47) consistently for all links. Good.

**Empty states**:
- DashboardClient: loading skeleton with `animate-pulse` (lines 460-474). Non-auth state with sign-in prompt (lines 478-503). Empty state with CTA (lines 47-111).
- StateDashboard: loading skeleton (lines 776-789). Empty state with CTA (lines 66-129).
- VisaFinder: "Loading question..." fallback (lines 170-176).
- Path page: `<Suspense>` with animated skeleton (lines 116-123 of path/page.tsx).

**Error handling**:
- DashboardClient: `try/catch` on fetch with `console.error` (line 441-442). Does not show an error UI to the user -- just silently fails and shows empty state. (-2)
- No error boundaries visible in any of the visa components. If a component throws, the entire page crashes with no fallback. (-2)
- The `console.error('Error fetching dashboard data')` at DashboardClient.tsx:442 does not include the actual error object -- loses debugging context. (-1)

**SEO**:
- JSON-LD structured data on visa landing page (lines 141-155 of visa/page.tsx) and path page (lines 64-72 of path/page.tsx).
- `generateMetadata` on all visa pages for proper `<title>` and `<meta description>`.

**What works**:
- Legal disclaimers are thorough, consistent, and properly translated via i18n.
- Footer has all necessary legal links and a global disclaimer.
- Most navigation is locale-aware.
- Loading states exist with skeletons.
- SEO metadata and structured data present.

**What's missing**:
- No Vietnamese language support at all. (-3)
- NextActionCard links break locale-awareness. (-3)
- No error boundaries for component-level error recovery. (-2)
- Dashboard error handling silently swallows errors without user feedback. (-2)
- No Korean (ko) language option, despite being a Korea visa tool. (-1)

---

## Top 5 Remaining Issues

1. **NextActionCard links are not locale-aware** (`components/visa/dashboard/NextActionCard.tsx:48,55,65,74,84,93`): All hrefs are hardcoded paths like `/visa/checklist/${visaType}` without using `localePath()` or `buildLocalePath()`. This breaks navigation for any non-English locale. **Severity: Critical.**

2. **No Vietnamese (vi) language support**: As a Vietnamese user, I cannot use the site in my native language. The locale system supports en/ja/zh-tw only (`lib/i18n/config.ts:11`). No `messages/vi.json` exists. **Severity: Warning** (English is understandable, but limits accessibility for less English-proficient Vietnamese users).

3. **No link from visa landing page to the quiz**: The visa landing page (`app/[lang]/[country]/visa/page.tsx`) has no CTA or link to `/visa/find` (the VisaFinder quiz). Users can only discover it by navigating directly. The landing page focuses on situation tiles, path simulator, and compare -- but the quiz is arguably the most user-friendly discovery tool. **Severity: Warning.**

4. **No error boundaries in visa components**: If any client component throws (e.g., corrupted localStorage data, API failure), the entire page crashes with no recovery UI. The `DashboardClient` catches fetch errors but shows no error state to the user (just falls through to empty state). **Severity: Critical.**

5. **ChecklistPage export does not include Korean names**: The newer `ChecklistPage` export function (`ChecklistPage.tsx:89-129`) only outputs English document names, while the older `DocumentChecklist` export includes Korean names. For a user bringing this checklist to a Korean immigration office, the Korean names are essential. **Severity: Warning.**
