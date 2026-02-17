# Cycle 2 Synthesis

**Date**: 2026-02-12

## Scores After Cycle 2

| Metric | Baseline | After Cycle 1 | After Cycle 2 | Delta (C1→C2) |
|--------|----------|---------------|---------------|----------------|
| User (Linh) | 32/100 | 59/100 | 68/100 | +9 |
| Technical | 38/100 | 62/100 | 72/100 | +10 |
| Completeness | N/A | N/A | 95/100 | (new metric) |

## What Cycle 2 Fixed
- Visa Path Simulator: full 3-step wizard with URL state, 17 paths, progress bar
- Dashboard state advancement: AlertDialog confirmations, forward + backward transitions
- Settings sheet: change visa type, target date, reset all progress
- HealthScoreCard: circular progress with document/timeline/insurance factors
- Rich pathsTo/pathsFrom in ALL 36 visa JSONs (12 × 3 locales) with requirements, timeline, documents, notes
- VisaTransitionPath TypeScript interface added to types.ts
- Footer disclaimer with 행정사법/변호사법 on every page
- Export disclaimer on DocumentChecklist
- Consent gate before EligibilityQuiz results
- Korean law references in Terms page
- Loading/error boundaries for (legal) and visa/path routes
- Footer legal links now locale-aware
- "You qualify" language fully removed
- Stats now honest and factual
- Per-type localStorage unification for checklists
- Path simulator linked from visa landing page and journey pages

## Top 5 Issues for Cycle 3

### 1. Dashboard Non-Locale-Aware Links (User: 11/20 Dashboard, Tech: C1/C2)
DashboardClient.tsx and StateDashboard.tsx have 13+ hardcoded links like `/visa/find`, `/visa/e-7` without locale prefix. Japanese/Chinese users lose locale context. Must fix all links to use `buildLocalePath()`.

### 2. i18n Coverage ~40-45% (Tech: 5/10)
Improved from ~25-30% but path simulator (30+ strings), dashboard, bundles, areas, comparison tool, and legal pages are entirely in English. Must extract strings to translation keys.

### 3. Vietnam Not in Quiz Nationalities (User: 14/20 Discovery)
`data/quiz/questions.json` only has 7 countries + "Other". Vietnam, China, India, Philippines — top source countries for Korean immigration — are missing. Users select "Other Country" which feels generic.

### 4. No Korean Document Names (User: 14/20 Checklist)
The `nameKorean` field exists in types but is never populated in visa JSONs. Users at immigration offices need 고용계약서, 학위증명서, 사업자등록증명서 etc.

### 5. Path Simulator Uses Hardcoded Data (Completeness: 17/20)
Simulator reads from `lib/visa/path-data.ts` (1060+ lines hardcoded) instead of the JSON visa files. Two disconnected data sources = maintenance risk. Not blocking UX but a data integrity concern.

## Cycle 3 Plan
1. **Agent "cycle2-fixes"**: Fix all locale-unaware links in dashboard/quiz/checklist, add Vietnam to quiz nationalities, fix bidirectional path data inconsistencies (H-1 missing E-2, D-10 missing F-1-D)
2. **Agent "i18n-wire"**: Extract hardcoded strings from visa landing, bundles, areas pages to i18n translation keys
3. **Agent "korean-docs"**: Add nameKorean to all document entries in visa JSONs
4. **Agent "nav-polish"**: Fix remaining dead links (/visa/start), add locale to all internal links, polish empty states
