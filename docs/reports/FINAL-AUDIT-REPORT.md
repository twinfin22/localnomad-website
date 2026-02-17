# Final Audit Report — LocalNomad Website

**Date**: 2026-02-12
**Methodology**: 3-cycle AUDIT → IMPLEMENT workflow
**Baseline commit**: `6a3a164` | **Final commit**: `de5309c`
**Auditors**: Claude Opus 4.6 (automated agents — user persona, technical, legal, completeness)

---

## Score Progression

| Metric | Baseline | After Cycle 1 | After Cycle 2 | After Cycle 3 | Total Delta |
|--------|----------|---------------|---------------|---------------|-------------|
| User (Linh) | 32/100 | 59/100 | 68/100 | **74/100** | **+42** |
| Technical | 38/100 | 62/100 | 72/100 | **80/100** | **+42** |
| Legal | RED (3 RED gaps) | YELLOW (0 RED, 3 YELLOW) | YELLOW (improved) | **YELLOW (0 RED, 4 YELLOW)** | **RED → YELLOW** |

---

## What Each Cycle Delivered

### Cycle 1: Foundation (Baseline → 59/62)
- Removed `ignoreBuildErrors`, enforced TypeScript/ESLint at build
- Fixed open redirect in auth callback (4-layer `sanitizeRedirect()`)
- Supabase null safety — browser returns null, server throws
- Rate limiting on subscribe API (5/min per IP, lazy eviction)
- Zero PII in logs, zero `console.log`
- 13 `loading.tsx` + 13 `error.tsx` covering all major routes
- 9 legal copy fixes (quiz language, stats, marketing claims)
- Header/footer locale-aware navigation

### Cycle 2: Wedge Features (59/62 → 68/72)
- **Visa Path Simulator**: 3-step wizard with URL state, 17 paths, progress bar, disclaimer
- **Dashboard wiring**: AlertDialog state advancement, Settings sheet, HealthScoreCard
- Rich `pathsTo`/`pathsFrom` in all 36 visa JSONs (12 types × 3 locales)
- `VisaTransitionPath` TypeScript interface
- Footer disclaimer with 행정사법/변호사법 on every page
- Export disclaimer on DocumentChecklist
- Consent gate before EligibilityQuiz results
- Korean law references in Terms page

### Cycle 3: Reach & Polish (68/72 → 74/80)
- **i18n**: Extracted 60+ translation keys for bundles, areas, path simulator pages (~60% coverage)
- **Locale links**: Fixed 20+ hardcoded links in dashboard, quiz, checklist to use `buildLocalePath()`
- **Korean doc names**: Added `nameKorean` to 162 document entries across 18 visa JSONs
- **Quiz nationalities**: Added Vietnam, China, India, Philippines, Indonesia
- **Data integrity**: Fixed bidirectional paths (H-1↔E-2, D-10↔F-1-D) across all locales
- **Error hygiene**: Stripped error objects from `console.error` in auth-provider and dashboard
- **Component quality**: Fixed unstable React keys, dead `/visa/start` link
- **SEO**: JSON-LD structured data on 3 page types, comprehensive sitemap (61 URLs)

---

## Final State — What's Working Well

### Security (9/10)
- Open redirect: 4-layer defense with locale-prefix regex validation
- Supabase: Null-safe client, fail-fast server
- Rate limiting: Per-IP with lazy stale-entry eviction
- PII: Zero in logs. Zero `console.log` in production
- `dangerouslySetInnerHTML`: All 4 instances use `JSON.stringify` on server-controlled data

### Build & Config (9/10)
- `npm run build`: 119 pages, 0 errors, 0 warnings
- `npx tsc --noEmit`: 0 type errors
- No `ignoreBuildErrors` or `ignoreDuringBuilds` flags
- Only caveat: Next.js 16 middleware deprecation warning (non-blocking)

### Error Boundaries (10/10)
- 15 `loading.tsx` + 15 `error.tsx` — every route covered
- Including `(legal)` and `visa/path` routes (fixed in Cycle 1-2)

### Legal Compliance (YELLOW — no RED)
- Footer disclaimer on all pages, references 행정사 and 변호사, translated to all 3 locales
- Consent gate before quiz results
- "Match" language throughout (never "you qualify" or "you are eligible")
- Terms explicitly cite 행정사법 and 변호사법 with three prohibitions
- Dashboard disclaimer: "not connected to HiKorea or any government system"
- Path simulator disclaimer always visible at top, links to official Korea Immigration Service
- Export disclaimers in both checklist components

### Data Quality (9/10)
- All pathsTo/pathsFrom bidirectional and consistent
- 162 documents with `nameKorean` across 18 visa JSONs
- 14 nationality options in quiz (including Vietnam, China, India, Philippines, Indonesia)
- 411-line translation files with perfect key parity across en/ja/zh-tw

### SEO (10/10)
- JSON-LD structured data on visa landing, detail, and path pages
- Comprehensive 61-URL sitemap with priorities and change frequencies
- Proper robots.txt (disallows `/api/` and `/auth/`)
- Dynamic meta descriptions on all key pages

---

## Remaining Issues (Prioritized)

### Critical (should fix next)

| # | Issue | Files | Impact |
|---|-------|-------|--------|
| 1 | **5 links missing locale prefix** | `VisaComparisonTool.tsx`, `DocumentProgress.tsx`, `StepAfterApproval.tsx`, `DocumentPreview.tsx` | ja/zh-tw users lose locale context. One link (`/visa/quiz`) points to non-existent route |
| 2 | **~40% dashboard strings hardcoded English** | `StateDashboard.tsx`, `DashboardClient.tsx`, `VisaComparisonTool.tsx` | Entire dashboard components outside i18n system |
| 3 | **NextActionCard links not locale-aware** | `components/visa/dashboard/NextActionCard.tsx` (6+ bare links) | Dashboard navigation breaks for non-English locales |

### Warning (should fix, can defer)

| # | Issue | Files | Impact |
|---|-------|-------|--------|
| 4 | **OnboardingWizard missing disclaimer/consent** | `components/visa/OnboardingWizard.tsx` | Shows % match scores with no legal qualifier |
| 5 | **VisaDetailContent missing legal disclaimer** | `components/visa/VisaDetailContent.tsx` | 610-line component with no disclaimer |
| 6 | **Unverifiable testimonials** | `components/sections/social-proof-section.tsx` | 표시광고법 risk — "Sarah M.", "James K.", "Maria L." may be fabricated |
| 7 | **"Save 40+ Hours" unsubstantiated** | `components/sections/why-section.tsx` | Quantitative claim without basis |
| 8 | **4 `as any` casts on Supabase operations** | `auth-provider.tsx`, `DashboardClient.tsx` | Incomplete `database.types.ts` — should regenerate |
| 9 | **47 `key={index}` instances** | Various components | Mostly static arrays (low practical risk) |
| 10 | **DashboardClient Settings button non-functional** | `DashboardClient.tsx:167` | No `onClick` handler |
| 11 | **ChecklistPage export missing Korean names** | `ChecklistPage.tsx:89-129` | Older DocumentChecklist includes them, newer one doesn't |
| 12 | **No Vietnamese language support** | `lib/i18n/config.ts` | Only en/ja/zh-tw. No `messages/vi.json` |

### Nits

| # | Issue | Files |
|---|-------|-------|
| 13 | Middleware deprecation warning (Next.js 16 "proxy" convention) | `middleware.ts` |
| 14 | Terms/Privacy pages English-only | `app/(legal)/terms/page.tsx`, `app/(legal)/privacy/page.tsx` |
| 15 | Error.tsx files have hardcoded English | All 15 error.tsx files |
| 16 | 3 `console.error` calls strip error objects | `DashboardClient.tsx`, `auth-provider.tsx`, `stateMachine.ts` |
| 17 | Quiz nationality list could add Thailand, Brazil, Russia | `data/quiz/questions.json` |

---

## Cycle-over-Cycle Delta Analysis

### User Score: 32 → 74 (+42)
| Category | Baseline | Final | Delta | Driver |
|----------|----------|-------|-------|--------|
| Discovery | 8/20 | 16/20 | +8 | Vietnam in quiz, VisaFinder engine, situation grid |
| Path Switching | 4/20 | 17/20 | +13 | Full path simulator with 17 paths, URL state, i18n |
| Tracking | 6/20 | 14/20 | +8 | State machine, health score, settings, D-Day counter |
| Documents | 6/20 | 16/20 | +10 | Korean names (162 docs), progress tracking, export |
| Overall | 8/20 | 11/20 | +3 | Disclaimers, locale links, loading states |

### Technical Score: 38 → 80 (+42)
| Category | Baseline | Final | Delta | Driver |
|----------|----------|-------|-------|--------|
| Build | 5/10 | 9/10 | +4 | Removed ignoreBuildErrors, clean TS |
| Error Boundaries | 3/10 | 10/10 | +7 | 15 loading + 15 error files |
| Security | 4/10 | 9/10 | +5 | Open redirect, null safety, rate limiting |
| Type Safety | 5/10 | 8/10 | +3 | Zero @ts-ignore, only 4 `as any` |
| Data Integrity | 4/10 | 9/10 | +5 | Bidirectional paths, nameKorean, quiz data |
| i18n | 1/10 | 6/10 | +5 | 18 namespaces, 411 keys, 22 files using i18n |
| Nav/Locale | 3/10 | 7/10 | +4 | Dashboard, footer, quiz all locale-aware |
| Component Quality | 4/10 | 6/10 | +2 | Loading states, key fixes, error hygiene |
| SEO | 2/10 | 10/10 | +8 | JSON-LD, sitemap, robots.txt, meta descriptions |

### Legal: RED → YELLOW
| Area | Baseline | Final |
|------|----------|-------|
| Marketing Claims | RED | YELLOW (2 items remain) |
| Quiz Language | RED | GREEN |
| Footer Disclaimer | RED | GREEN |
| Export Disclaimer | RED | GREEN |
| Legal Pages | RED | GREEN |
| Statistics | YELLOW | GREEN |
| Path Simulator | N/A | GREEN |
| Dashboard | N/A | GREEN |

---

## Commits

| Commit | Cycle | Summary |
|--------|-------|---------|
| `bde400d` | 1 | Legal copy, security, build integrity, loading/error states |
| `ace34f3` | Pre-2 | i18n wiring, global disclaimers, SEO foundation |
| `bfbe07b` | 2 | Visa path data (JA/ZH-TW), dashboard wiring, path simulator UI |
| `de5309c` | 3 | i18n extraction, locale-aware links, Korean doc names, nav polish |

---

## Recommended Next Steps (Priority Order)

1. **Fix 5 remaining bare links** — `VisaComparisonTool.tsx`, `DocumentProgress.tsx`, `StepAfterApproval.tsx`, `DocumentPreview.tsx` (30-minute fix)
2. **Fix NextActionCard locale links** — Add `localePath()` to all 6+ hrefs (15-minute fix)
3. **Add disclaimer to OnboardingWizard** — Import `QuizDisclaimer`, render on results step (10-minute fix)
4. **Add disclaimer to VisaDetailContent** — Or deprecate in favor of `VisaJourneyPage` (10-minute fix)
5. **i18n dashboard components** — Extract ~100 strings from `StateDashboard.tsx`, `DashboardClient.tsx`, `VisaComparisonTool.tsx` (2-3 hour effort)
6. **Verify or replace testimonials** — Address 표시광고법 risk
7. **Regenerate Supabase types** — Eliminate 4 `as any` casts
8. **Add Vietnamese locale** — Create `messages/vi.json`, add `vi` to locale config

---

*Report generated by 3-cycle automated audit workflow using Claude Opus 4.6 agents.*
*Total: 4 implementation agents + 9 audit agents across 3 cycles.*
