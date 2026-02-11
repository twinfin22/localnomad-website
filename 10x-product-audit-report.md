# LocalNomad 10x Product Audit Report (Deep Audit v2)

**Date:** 2026-02-11
**Team:** 5-agent deep audit (first-timer, resident, scout, inspector, counsel)
**Method:** Line-by-line code review + 3,500-line research cross-reference + inter-agent debate
**Supersedes:** Previous surface-level audit from same date

---

## The Verdict in One Sentence

LocalNomad is a **well-designed information site that hasn't yet become the tool its users desperately need** — the architecture for a 10x product exists in the codebase (`pathsTo`/`pathsFrom`, state machine, health score, quiz engine), but it's unwired, unfilled, and ungated behind the right UX.

---

## Scores at a Glance

| Agent | Persona/Focus | Score | One-Line Summary |
|-------|--------------|:-----:|------------------|
| first-timer | Linh (Vietnamese, E-7, 4mo to expiry) | **32/100** | "Site has no answer for my actual crisis" |
| resident | James (American, E-2 to E-7 switcher) | **32/100** | "Information site pretending to be a tool" |
| inspector | Technical quality | **38/100** | "Not production-ready — hidden TS errors, 75% i18n gap, zero loading states" |
| scout | Competitive strategy | -- | "Defensible but narrow; Kowork is 8/10 threat; window closing" |
| counsel | Legal compliance | **YELLOW** | "No RED violations today, but 6 immediate fixes needed before next deploy" |

---

## I. Critical Findings

### 1. No Existing Visa Holder Path (Cross-validated: first-timer + resident)

**The #1 gap in the entire product.** Both personas — Linh (E-7 renewal/switch) and James (E-2 to E-7 transition) — hit a dead end at the same point: the site assumes every user is a first-time applicant. There is:

- No employer-change flow (E-7 FAQ gives 2 sentences: `data/visas/en/e-7.json:179-181`)
- No renewal guide beyond "start 2 months early"
- No "what if my visa expires" emergency path
- No D-10 fallback transition guidance

**The infrastructure is partially built in TWO places but neither is wired up:**
- `pathsTo`/`pathsFrom` fields defined in `lib/visa/types.ts:178-181` — zero JSON files populate them
- State machine transitions in `lib/visa/stateMachine.ts:119` — no UI triggers them
- `relatedVisas` in visa JSONs — never rendered on detail pages

**Research link:** Pain Point #2 (5/5 severity): "비자 전환 경로 미로 — 내 상황에서 뭐가 가능한지 모르겠다"

### 2. Information Site, Not a Tool (resident)

Every interactive feature is a **client-side UI shell with no server persistence**:
- Dashboard stuck at "Preparing" forever — no UI to advance state
- Settings button is non-functional (no onClick handler: `StateDashboard.tsx:147-152`)
- Two competing document checklist localStorage systems that don't share data (`visa-checklist` vs `visa-checklist-{type}`)
- OnboardingWizard has a React state batching bug — `calculateMatches()` runs before `selectedSituation` is set (`OnboardingWizard.tsx:268-270`)
- Stickiness score: **2/10** — nothing brings users back tomorrow

**Research link:** Users said they'd pay for TOOLS (path simulator, income calculator, appointment sniper), not information they can get free on Discord.

### 3. i18n Is 25% Real, 75% Theater (inspector)

Translation files are 100% complete (287 keys each for en/ja/zh-tw). But **only ~25% of components actually use them**. The remaining ~75% is hardcoded English:
- Visa landing page: 100% hardcoded English
- Dashboard: 100% hardcoded English
- Bundles, Areas, Auth pages: 100% hardcoded English
- **600+ hardcoded strings** across 15+ components
- Root page (`app/page.tsx`) bypasses i18n entirely

A Japanese user switching to `/ja/` sees the navbar change but all content stays English.

**Missing locales critical for target audience:**
- **Korean** — the product is about Korea but doesn't support Korean
- **Vietnamese** — largest foreign worker population, research-identified priority, Famigo already supports it

### 4. Technical Foundation Is Untrustworthy (inspector)

**7 Critical bugs, 13 High-severity issues.** The single biggest problem:

- **`ignoreBuildErrors: true`** in `next.config.mjs` — TypeScript errors are silently swallowed. Unknown number of type errors shipping to production. Every feature is built on a foundation you can't trust.
- **`images: { unoptimized: true }`** — ALL image optimization disabled despite `sharp` being installed
- **Supabase client returns `null as any`** when env vars missing (`lib/supabase/client.ts:16`) — runtime crash risk
- **Open redirect vulnerability** in auth callback (`app/auth/callback/route.ts`) — reads unvalidated `next` param
- Zero `loading.tsx` files — blank white flash on every navigation
- Zero `error.tsx` files — React crash screen on errors
- Zero test files in the entire codebase

### 5. Vietnam Excluded from Everything (first-timer)

Vietnam is the **largest foreign worker nationality in Korea (~230,000+)**, yet:
- Not listed in quiz nationality options (`data/quiz/questions.json:13-22`) — lumped under "Other"
- No Vietnamese UI language (`lib/i18n/config.ts:11` — only en/ja/zh-tw)
- No Vietnamese translations of any kind
- Social proof shows only Western names in creative/nomad roles (`social-proof-section.tsx:6-28`)

The competitor Famigo already supports Vietnamese, Nepali, Mongolian, and Indonesian.

---

## II. Legal Blockers (Before Next Deploy)

Counsel identified **YELLOW-zone exposure with no RED-zone violations** — but 6 fixes are needed immediately:

| # | Issue | Location | Current Copy | Required Fix |
|---|-------|----------|-------------|-------------|
| 1 | Quiz says "you appear to qualify" | `StepQualify.tsx:98` | "you appear to qualify for this visa" | "Your answers match the published requirements for this visa" |
| 2 | Quiz says "You may be eligible" | `QuickEligibilityCheck.tsx:132` | "You may be eligible" + green checkmark | "Your answers align with published requirements" (neutral indicator) |
| 3 | Quiz says "recommended visas" | `EligibilityQuiz.tsx:330` | "here are your recommended visas" | "Visas with matching requirements include..." |
| 4 | "12 visa types covered" is misleading | `visa/page.tsx:206` | "12 visa types covered" | "6 full guides + 6 coming soon" (6 are stubs) |
| 5 | "500+ Nomads Helped" is unverifiable | `hero-section.tsx:176` | "500+ Nomads Helped" | Substantiate with real data or remove |
| 6 | "Based on official requirements" | `visa/page.tsx:206` | "Based on official requirements" | "Based on publicly available requirements" |

**Additionally required:**
- Global footer disclaimer on ALL pages citing 행정사법 and 변호사법
- Banner-style disclaimer at TOP of visa detail pages (not just `text-xs` at bottom)
- Pre-results consent gate on quiz flow

**The Legal Bright Line:**

| CAN Do | MUST NEVER Do |
|--------|--------------|
| Display published requirements | Say "you are eligible/qualify" |
| Run quizzes framed as "requirement matching" | File anything on user's behalf |
| Sell information products (guides, playbooks) | Broker 행정사 connections for fee |
| Calculate dates and track deadlines | Generate completed documents with user data |
| Show visa transition paths with disclaimers | Store HiKorea credentials |

**Future feature risks (counsel):**
- **행정사 Marketplace: CRITICAL** — exactly what K-Visa was attacked for. Directory/advertising model only.
- **HiKorea Appointment Sniper: HIGH** — notification-only, never store credentials.
- **AI Document Generation: HIGH** — blank templates only, never auto-fill.

---

## III. Strategic Findings

### The Competitive Map (scout)

| Competitor | Threat Level | Key Advantage | LocalNomad Counter |
|-----------|:-----------:|---------------|-------------------|
| **Kowork** | **8/10** | Two-sided marketplace (jobs + visa), E-7 sponsor filter, mobile app | Win on depth: dashboard, health score, path simulator. Win on segment: E-7 IT developers. Win on speed: 8-week compressed MVP. |
| **Famigo** | 3/10 | 8 languages incl. Vietnamese, physical touchpoints | Different segment (E-9/blue-collar). Benchmark their i18n coverage. |
| **HiKorea** | 2/10 (as competitor) | Official authority, real-time status data | Don't compete — wrap it. Build the "modern HiKorea middleware layer." |
| **Discord/Reddit** | 4/10 | Real-time peer advice, power users, emotional support | Structure their knowledge via `communityTips`. Partner with community admins. |
| **행정사 agencies** | 2/10 | "Never get it wrong", full service | Complement, don't compete. Build triage: "self-serve this / hire a pro for that." |

### The Moat That Doesn't Exist Yet (scout)

LocalNomad has **zero moat today** — all data is public, no network effects, low switching cost, no brand recognition. But the architecture supports 3 buildable moats:

1. **Data moat** (M effort, 9/10 impact): Embassy-specific data, crowdsourced approval timelines. No competitor structures this.
2. **Network effect** (L effort, 10/10 impact): 1,000+ users reporting approval timelines = unassailable dataset. Requires user accounts first.
3. **Switching cost** (S effort, 7/10 impact): Dashboard state persistence. Once checklist progress and dates are in LocalNomad, switching means losing that state.

### The Wedge Feature (unanimous across all agents)

**The Visa Path Simulator.** Every agent independently identified this as the #1 priority:

- **first-timer**: "relatedVisas exists in data but is never rendered — Linh can't see E-7 to D-10 fallback"
- **resident**: "The #1 killer feature from research. `pathsTo`/`pathsFrom` types exist but zero JSON files populate them"
- **scout**: "Zero competitors have visa path visualization. The technical foundation already exists in `quiz-engine.ts`"
- **counsel**: "YELLOW zone — add disclaimer about individual variation and it's legally safe"
- **inspector**: "`relatedVisas` field in visa JSONs is never rendered by `VisaJourneyPage.tsx`"

**Why it wins:**
1. Solves Pain Point #2 (5/5 severity) — the visa transition maze
2. 0 competitors have it (0/5 on competitive matrix)
3. Engine already exists in `lib/visa/quiz-engine.ts` with scoring for 6 visa types and path generation
4. Creates strongest switching cost — users invest mental energy in their personal path
5. Natural onboarding funnel: path selection -> document checklist -> status tracking -> health score
6. Research explicitly calls it "킬러 기능 확정"

---

## IV. Strengths (What's Working)

Not everything is broken. Five things are genuinely excellent:

1. **Situation-based visa landing page** (`app/[lang]/[country]/visa/page.tsx:43-80`): "What's your situation?" with clear tiles is the best UX in the Korean visa information space. First-timer scored it the highest-rated element in the entire audit.

2. **Document Checklist** (`components/visa/DocumentChecklist.tsx`): Best feature per resident (8/7/4/7/8). localStorage persistence, .txt export, tips, where-to-get guidance. The only feature James would use twice.

3. **Structured visa data architecture**: 12 visa types as JSON with rich type definitions (`lib/visa/types.ts`). Fields like `communityTips`, `gniBasedIncome`, `pathsTo`/`pathsFrom`, `eligibilityQuestions`, `renewal` show the right product was designed — it just hasn't been built yet.

4. **Health Score engine** (`lib/visa/health-score.ts`): 4-factor weighted calculation (documents 50%, timeline 25%, insurance 15%, state 10%) with 5-tier interpretation. Unique innovation — no competitor has anything equivalent. The "Calm Control" dashboard pattern is a genuine differentiator.

5. **State machine architecture** (`lib/visa/stateMachine.ts`): 8 lifecycle states with valid transition rules, progress percentages, urgency levels. This IS the skeleton of the right product — it just needs UI to advance states and a backend to persist them.

---

## V. Prioritized Action Plan

### Week 1: Legal + Foundation (MUST DO)

| # | Action | Effort | Unblocks |
|---|--------|--------|----------|
| 1 | Fix 6 legal copy issues (quiz language, marketing claims) | 2 hours | Legal compliance |
| 2 | Add global footer disclaimer to all pages | 1 hour | Legal compliance |
| 3 | Add banner-style disclaimer to visa detail pages | 1 hour | Legal compliance |
| 4 | Remove `ignoreBuildErrors: true` and fix all TS errors | 1-3 days | Everything — can't trust anything until this is fixed |
| 5 | Fix open redirect in auth callback | 1 hour | Security |
| 6 | Remove `images: { unoptimized: true }` | 30 min | Performance |
| 7 | Fix Supabase `null as any` to proper typed null/throw | 2 hours | Runtime stability |

### Weeks 2-4: The Wedge + Core Tool

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 8 | **Ship Visa Path Simulator** — populate `pathsTo`/`pathsFrom` in visa JSONs, build visual A->B->C UI at `/visa/path` | M (engine exists) | 10/10 — the wedge |
| 9 | **Enable dashboard state advancement** — wire `updateProgressState()` to UI buttons | S | 8/10 — makes dashboard usable |
| 10 | **Add "I already have a visa" as primary path** — first-class flows for renewal, employer change, expiry crisis | M | 9/10 — serves both personas |
| 11 | **Unify two document checklist systems** — merge `visa-checklist` and `visa-checklist-{type}` localStorage keys | S | 7/10 — fixes data loss bug |
| 12 | Add `loading.tsx` skeleton screens to all route groups | S | 8/10 — most visible polish improvement |
| 13 | Add `error.tsx` and custom `not-found.tsx` | S | 7/10 — professional error handling |
| 14 | Fix header/footer nav links to include locale prefix | S | 7/10 — navigation broken for non-EN users |

### Month 2: Expansion

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 15 | **Add Vietnamese language** — `vi` locale, `messages/vi.json`, visa data translations | M | 9/10 — largest underserved segment |
| 16 | **Populate `communityTips`** from Discord research in all 6 full visa JSONs | S | 8/10 — addresses YMMV problem |
| 17 | **Complete 6 stub visa pages** (E-2, D-7, D-8, F-6, F-4, D-4) | M | 7/10 — "12 types covered" becomes real |
| 18 | Add Korean locale (`ko`) | M | 7/10 — product about Korea needs Korean |
| 19 | Wire i18n to the 75% of components still using hardcoded English | L | 8/10 — makes existing ja/zh-tw work |
| 20 | Add `robots.txt`, `sitemap.xml`, `hreflang` tags, OpenGraph | S | 7/10 — SEO foundation |

### Month 3: Stickiness

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 21 | **Implement real user accounts** with Supabase (types already at `lib/visa/types.ts:330-365`) | M | 9/10 — infrastructure for everything |
| 22 | Cloud sync for checklist + dashboard state | M | 8/10 — switching cost moat |
| 23 | Push/email notifications for visa deadlines | M | 8/10 — stickiness driver |
| 24 | Visa-specific email segmentation (ask visa type on signup) | S | 6/10 — retention |
| 25 | Korean document name translations (한국어 병기) in all checklists | S | 7/10 — critical for TOPIK 3 users |

### Quarter 2: Strategic

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 26 | Income Calculator / GNI Tracker | M | 8/10 |
| 27 | Embassy-specific data layer | M | 10/10 moat potential |
| 28 | Beta launch in Dev Korea + CodeSeoul (50 testers) | S | 9/10 — validation + community tips |
| 29 | HiKorea appointment notification system (notification-only, per counsel) | L | 7/10 |
| 30 | B2B employer-facing tools | M | 7/10 |

---

## VI. Conflict Resolution

Three tensions emerged between agents that required resolution:

### Tension 1: Feature Ambition vs. Legal Safety
- **resident** wants: Visa path recommendations, eligibility determination, document generation
- **counsel** flags: These cross legal lines if implemented naively

**Resolution:** All "recommendation" features are legal if framed as "requirement matching" with proper disclaimers. Counsel provided exact safe language for each feature. The Visa Path Simulator is GREEN with a disclaimer. Document generation must be templates-only.

### Tension 2: Speed-to-Market vs. Technical Debt
- **scout** says: "Compress MVP from 12 to 8 weeks. Kowork adding dashboard features is a matter of time."
- **inspector** says: "`ignoreBuildErrors: true` means you're building on a foundation you can't trust."

**Resolution:** Fix the foundation FIRST (Week 1), then ship fast. The `ignoreBuildErrors` fix is non-negotiable — it's 1-3 days that prevent unknown production bugs. After that, prioritize visible features (Path Simulator, loading states) over invisible technical debt (test framework, bundle optimization).

### Tension 3: Western Expat Branding vs. Actual User Base
- **first-timer** says: "'Your Seoul Toolkit', 'Nomad' branding, Western testimonials — this alienates Vietnamese workers"
- **scout** says: "Target E-7 IT developers from Dev Korea/CodeSeoul — that IS a Western-adjacent community"

**Resolution:** The branding should serve BOTH segments. The "LocalNomad" name works for both. But the homepage hero, testimonials, and quiz must stop excluding non-Western users. Add Vietnamese to the quiz, diversify testimonials, and lead with "visa" not "nomad" on the homepage CTA.

---

## VII. Technical Deep Dive Summary (inspector)

### Bug Counts by Severity

| Severity | Count | Examples |
|----------|:-----:|---------|
| Critical | 7 | `ignoreBuildErrors: true`, `images: { unoptimized: true }`, Supabase `null as any`, open redirect, auth redirect missing locale, root page bypasses i18n |
| High | 13 | 5+ pages 100% hardcoded English, zero `loading.tsx`, zero `error.tsx`, no custom 404, nav links lose locale, auth hardcodes `<html lang="en">` |
| Medium | 8 | Non-functional theme toggle, hardcoded hero/sections, unused font import, duplicate type definitions, missing hreflang/OG tags |
| Low | 6 | Hardcoded error messages, `@types/mapbox-gl` in prod deps, Replit origins in config |

### Security Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| S1 | Open redirect in auth callback | HIGH | `app/auth/callback/route.ts` |
| S2 | No rate limiting on subscribe API | MEDIUM | `app/api/subscribe/route.ts` |
| S3 | PII in console.log | MEDIUM | `app/api/subscribe/route.ts` |
| S4 | Supabase `null as any` type erasure | MEDIUM | `lib/supabase/client.ts:16` |
| S5 | No Content Security Policy headers | LOW | `next.config.mjs` |

### i18n Reality Check

| What It Looks Like | What's Actually Happening |
|-------------------|--------------------------|
| 3 languages supported (en/ja/zh-tw) | ~25% of UI uses translations, ~75% hardcoded English |
| 287 translation keys per locale | 600+ hardcoded strings not in any translation file |
| "Updated Feb 2026" on visa pages | "Updated" date is hardcoded, not from data source |
| 12 visa types covered | 6 full guides + 6 stubs showing "Coming Soon" |

### SEO Status: Almost Nothing Exists

Missing entirely: `robots.txt`, `sitemap.xml`, `hreflang` tags, canonical URLs, OpenGraph images, Twitter Cards, JSON-LD structured data, custom 404 page.

---

## VIII. Resident Feature Audit Summary

| Feature | Functional | Value | Sticky | Complete | UX | Key Issue |
|---------|:----------:|:-----:|:------:|:--------:|:---:|-----------|
| Eligibility Quiz | 7 | 5 | 2 | 6 | 7 | No E-2->E-7 path, only 4 visa results |
| Document Checklist | 8 | 7 | 4 | 7 | 8 | **Best feature.** Two competing localStorage systems |
| Visa Comparison | 8 | 6 | 2 | 7 | 7 | CSS `:hover` dropdown inaccessible on mobile |
| State Dashboard | 6 | 5 | 3 | 5 | 6 | No way to advance state, Settings button broken |
| D-Day Counter | 8 | 6 | 3 | 7 | 8 | Only works if dashboard has progress |
| Onboarding Wizard | 7 | 6 | 3 | 6 | 7 | `calculateMatches()` bug, no "existing visa" path |
| Email Subscription | 8 | 4 | 2 | 8 | 7 | Not visa-specific, generic welcome email |
| Seoul Map | 7 | 4 | 1 | 6 | 7 | No connection to visa features |
| Pricing/Bundles | 6 | 3 | 1 | 5 | 6 | Mailto links only, irrelevant to existing residents |

**Payment Readiness:** James would pay for Visa Path Simulator ($15-30), cloud-synced Checklist ($5-10/mo), D-Day Alerts ($5/mo), Income Calculator ($20-50/use). He would NOT pay for current bundles ($150-350 for static guides).

---

## IX. Validation Checklist

| Validation Criterion | Status |
|---------------------|--------|
| Top 3 pain points from research addressed? | Yes: YMMV (#1) -> community tips + verified data; Transition maze (#2) -> Path Simulator; Sponsorship wall (#3) -> employer-side guidance |
| Target segment fit (E-7 IT developers)? | Yes: Path Simulator + dashboard + Dev Korea beta launch directly serve this segment |
| Legal zones respected? | Yes: All recommendations reviewed by counsel. No RED-zone features recommended. YELLOW features include specific safe language. |
| Kowork threat countered? | Yes: Win on depth (dashboard, health score, path simulator), segment (E-7 IT), and speed (8-week compressed MVP) |
| Both personas benefit? | Yes: Linh gets Vietnamese support + crisis path + Korean document names. James gets Path Simulator + dashboard advancement + cloud sync. |

---

## X. The One Thing

If LocalNomad does **one thing** in the next 30 days, it should be this:

### Ship the Visa Path Simulator

**Why this, above all else:**

1. It solves the **#2 pain point** (5/5 severity) that both personas independently ranked as their #1 gap
2. **Zero** of 5 competitors have it — the only P0 feature with zero competitive overlap
3. The **engine already exists** — `quiz-engine.ts` has path generation, `types.ts` has `pathsTo`/`pathsFrom`, `VisaPathMap.tsx` exists in quiz results. This is a completion task, not a build-from-scratch
4. It creates the **strongest switching cost** — once users map their personal path, they return to track progress
5. It **naturally feeds** the dashboard -> checklist -> health score funnel
6. It's **legally safe** with one disclaimer (per counsel)
7. Research explicitly calls it **"킬러 기능 확정"** — the confirmed killer feature

**The formula:** Path Simulator (wedge) + Dashboard state advancement (retention) + Vietnamese language (reach) = a product that both Linh and James would bookmark, pay for, and recommend.

The architecture is already there. The data model was designed for this. Fill the types, wire the UI, add the disclaimer, and ship it.

---

## Individual Audit Files

Full analysis available in:
- `audit-first-timer.md` — New user journey analysis (Linh, Vietnamese E-7 applicant, 32/100)
- `audit-resident.md` — Existing user feature audit (James, American E-2 to E-7, 32/100)
- `audit-scout.md` — Competitive strategy analysis (Kowork 8/10 threat, Visa Path Simulator = wedge)
- `audit-inspector.md` — Technical quality audit (38/100, 26 bugs, 600+ hardcoded strings)
- `audit-counsel.md` — Legal compliance analysis (YELLOW zone, 6 immediate fixes, bright line map)

---

*Audit completed: 2026-02-11*
*Team: first-timer, resident, scout, inspector, counsel (5 parallel agents)*
*Method: Line-by-line code review across full codebase + 3,500-line research cross-reference + inter-agent debate and cross-validation*
