# LocalNomad 3-Cycle Agent-Team Prompt

Audit → Implement → Audit → Implement → Audit → Implement
총 예상 시간: 8-10시간.

---

## 실행 방법

```bash
claude --dangerously-skip-permissions -p "$(cat AGENT-TEAM-3CYCLE.md)"
```

`--dangerously-skip-permissions`가 모든 퍼미션 프롬프트를 스킵해서 unattended 실행이 가능함.

아래 전체가 프롬프트 본문.

---

You are the lead engineer and QA lead for LocalNomad, a Next.js 16 visa guidance platform. Your job is to execute 3 full cycles of AUDIT → IMPLEMENT. Each cycle makes the product meaningfully better, and each audit is honest about what still sucks.

## CRITICAL: UNATTENDED EXECUTION

This session runs UNATTENDED — the user is asleep. You MUST:
- NEVER stop to ask questions. Make reasonable decisions and move on.
- NEVER wait for user confirmation. All decisions are yours.
- If something is ambiguous, pick the safer/simpler option and document your choice in the commit message.
- If an agent fails, retry once. If it fails again, log the failure in the cycle's synthesis file and move on. Do NOT block the entire pipeline.
- If `npm run build` fails after agent work, fix the errors yourself (as the orchestrator) rather than re-spawning an agent.
- Complete ALL 3 cycles. Do not stop early.

## HOW TO USE AGENTS

You are the ORCHESTRATOR. You use the `Task` tool to spawn sub-agents. Each agent runs autonomously and returns its result to you.

When the prompt says "Spawn these agents IN PARALLEL", you MUST send a SINGLE message containing MULTIPLE `Task` tool calls. This is how you get parallelism. Example:

```
// In a single message, call Task multiple times:
Task(description="legal copy fixes", subagent_type="general-purpose", prompt="...")
Task(description="security fixes", subagent_type="general-purpose", prompt="...")
Task(description="build fix", subagent_type="general-purpose", prompt="...")
```

For ALL agents in this prompt, use `subagent_type="general-purpose"`. They all need file read/write/edit/search + bash access.

When you receive results from all parallel agents, proceed to the GATE step. At the GATE, run build/lint yourself using `Bash`, fix any issues, then commit.

When the prompt says "AUDIT agents", still use the Task tool — audit agents just READ and WRITE findings instead of editing code.

## BEFORE YOU START

Read these files to understand the full context:
- `CLAUDE.md` — project conventions, tech stack, naming rules
- `IMPLEMENTATION-PLAN.md` — the phased plan
- `10x-product-audit-report.md` — the initial 5-agent audit (baseline: 32/100 user, 38/100 technical)

Also read these for detailed context:
- `audit-first-timer.md` — Linh persona (Vietnamese E-7 holder)
- `audit-resident.md` — James persona (American E-2→E-7 switcher)
- `audit-inspector.md` — Technical quality audit
- `audit-counsel.md` — Legal compliance audit

Tech stack: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Supabase, next-intl, Mapbox GL

IMPORTANT: `next.config.mjs` has ALREADY been cleaned up — `ignoreBuildErrors: true`, `images: { unoptimized: true }`, and Replit dev origins have already been removed. Do NOT try to remove them again. But you still need to ensure the build passes cleanly.

---

# ============================================================
# CYCLE 1: FOUNDATION
# Goal: Make the product trustworthy. Fix everything that's broken.
# Expected time: ~3 hours
# ============================================================

## CYCLE 1 — IMPLEMENT

Spawn these 4 agents IN PARALLEL (single message, 4 Task calls):

### Agent 1: "legal-copy"
Prompt for this agent:

```
You are fixing legal copy issues in a Next.js visa information platform. These are simple string replacements with NO i18n dependency. Read each file, find the exact string, replace it.

Changes:
1. `components/visa/detail/EligibilitySection.tsx` — Find "You may be eligible" and replace with "Your answers align with published requirements". Change any green checkmark/emerald indicator to a neutral blue/gray one.
2. `components/visa/journey/steps/StepQualify.tsx` — Find "you appear to qualify for this visa" and replace with "Your answers match the published requirements for this visa"
3. `components/visa/EligibilityQuiz.tsx` — Find "here are your recommended visas" and replace with "Visas with matching requirements include...". Find "Best Match" and replace with "Closest requirement match"
4. `components/visa/detail/QuickEligibilityCheck.tsx` — Find "You may be eligible" and replace with "Your answers match published requirements"
5. `components/visa/VisaComparisonTool.tsx` — Find "personalized recommendations" and replace with "explore visa options"
6. `app/[lang]/[country]/visa/page.tsx` — Find "12 visa types covered" and replace with "6 full guides + 6 coming soon". Find "Based on official requirements" and replace with "Based on publicly available requirements"
7. `components/hero-section.tsx` — Find "500+ Nomads Helped" and replace with "Helping nomads navigate Korea"
8. `components/pricing-section.tsx` — Find "Help prepare required paperwork" and replace with "Checklist of required paperwork"
9. `data/visas/en/e-7.json` — Find the grace period FAQ text "You have a grace period (usually 30 days)" and replace with "A grace period may be granted (typically 30 days, but varies by case). Confirm with immigration authorities."

After ALL changes, run: npm run build
If build fails, check if errors are related to your changes and fix them. If errors are pre-existing (unrelated to your changes), note them and move on.
```

### Agent 2: "security-fix"
Prompt for this agent:

```
You are fixing security vulnerabilities in a Next.js app. Read CLAUDE.md first for conventions.

1. Read `app/auth/callback/route.ts`. Fix the open redirect: validate the `next` query parameter — it must start with `/` and must NOT contain `//` or be an absolute URL. If invalid, default to `/en/korea/visa/dashboard`. Also ensure the redirect path includes the locale prefix `/{lang}/{country}/`.

2. Read `lib/supabase/client.ts`. Replace `null as any` with either: (a) throw a descriptive error "Supabase environment variables not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY", or (b) return null with proper typing so callers handle it. Choose whichever approach requires fewer changes to existing callers.

3. Read `lib/supabase/server.ts`. Replace any `!` non-null assertions on environment variables with guards that throw descriptive errors.

4. Read `app/api/subscribe/route.ts`. Add simple in-memory rate limiting (Map of IP → timestamps, max 5 requests per minute). Remove ALL console.log statements that output email addresses or PII.

After ALL changes, run: npm run build
```

### Agent 3: "build-fix"
Prompt for this agent:

```
You are ensuring the Next.js build passes cleanly. The config file `next.config.mjs` has ALREADY been cleaned up (ignoreBuildErrors and unoptimized images already removed). Your job is to make the build succeed.

1. Run `npm run build`
2. If there are TypeScript errors, fix EVERY one. Common patterns:
   - Type mismatches from `as unknown as VisaInfo` casts in `lib/visa/data.ts`
   - Null checks needed for Supabase client
   - Missing type imports
   - Unused variables (remove them or prefix with _)
3. Keep running `npm run build` until it succeeds with 0 errors.
4. Run `npm run lint` and fix any linting errors.
5. NEVER add `ignoreBuildErrors: true` back. NEVER.
6. Also fix: header/footer nav links (`components/header.tsx`, `components/footer.tsx`) should include locale prefix in all links. If they use hardcoded paths like `/bundles`, change to locale-aware paths.
7. Fix `app/auth/layout.tsx` if it hardcodes `<html lang="en">` — it should use the actual locale.
```

### Agent 4: "loading-error-states"
Prompt for this agent:

```
You are adding loading and error states to a Next.js 16 App Router project. Read CLAUDE.md first for conventions.

For EACH of these route directories, create loading.tsx, error.tsx:
- app/
- app/[lang]/
- app/[lang]/[country]/
- app/[lang]/[country]/visa/
- app/[lang]/[country]/visa/[type]/
- app/[lang]/[country]/visa/checklist/
- app/[lang]/[country]/visa/checklist/[type]/
- app/[lang]/[country]/visa/dashboard/
- app/[lang]/[country]/visa/find/
- app/[lang]/[country]/visa/compare/
- app/[lang]/[country]/areas/
- app/[lang]/[country]/bundles/
- app/auth/

Also create: app/not-found.tsx

loading.tsx pattern:
- Import Skeleton from @/components/ui/skeleton
- Return a div with 3-5 Skeleton blocks matching approximate page layout
- Use cn() from @/lib/utils for classes
- NO "use client" directive (server component)

error.tsx pattern:
- MUST have "use client" directive
- Props: { error: Error & { digest?: string }; reset: () => void }
- Show friendly message: "Something went wrong"
- Show reset/retry button
- Style with dark theme (bg-background, text-foreground)

not-found.tsx:
- Custom 404 page
- Link back to /en/korea/visa
- Styled with dark theme

After creating all files, run: npm run build
```

---

### CYCLE 1 — GATE

After receiving results from all 4 agents, run yourself (Bash tool):
```bash
cd /path/to/project && npm run build && npm run lint
```
If errors, fix them yourself. Then commit:
```bash
git add -A && git commit -m "fix: foundation — legal copy, security, build integrity, loading/error states"
```

---

## CYCLE 1 — AUDIT

Spawn these 3 audit agents IN PARALLEL (single message, 3 Task calls):

### Audit Agent 1: "user-tester"
Prompt:

```
You are Linh — Vietnamese, 29, E-7-1 visa holder, 4 months until expiry, TOPIK 3. You are auditing the LocalNomad website codebase from a user perspective. Do NOT read old audit files — evaluate the CURRENT code.

Walk through these files and evaluate:
1. Read `app/page.tsx` — Does it feel welcoming? Any misleading marketing claims?
2. Read `app/[lang]/[country]/visa/page.tsx` — Can I find my situation? Is copy honest?
3. Read `data/visas/en/e-7.json` and `components/visa/journey/VisaJourneyPage.tsx` — Does it help with employer changes? Korean document names?
4. Read quiz components (`components/visa/EligibilityQuiz.tsx`, `components/visa/detail/QuickEligibilityCheck.tsx`) — Is language legally safe now? Vietnam in nationality options?
5. Read dashboard (`components/visa/dashboard/DashboardClient.tsx`) — Can I advance state? Auth wall still there?
6. Read checklist (`components/visa/DocumentChecklist.tsx`) — Does export have disclaimer?

Score (each /20, total /100):
- Information Completeness
- Anxiety Management
- Language Accessibility
- Trust Building
- Action Clarity

Write your FULL findings to the file `cycle1-audit-user.md`. Be specific — cite file paths and line numbers.
```

### Audit Agent 2: "tech-inspector"
Prompt:

```
You are a senior frontend engineer auditing code quality. Evaluate the CURRENT codebase:

1. Read `next.config.mjs` — is ignoreBuildErrors gone? images optimized?
2. Glob for `**/loading.tsx` and `**/error.tsx` — do ALL route groups have them?
3. Read `app/auth/callback/route.ts` — is the open redirect fixed?
4. Read `lib/supabase/client.ts` and `lib/supabase/server.ts` — null-safe?
5. Read `app/api/subscribe/route.ts` — rate limiting present? PII logging removed?
6. Grep for `console.log` across the codebase (exclude node_modules) — any remaining?
7. Grep for `as any` across the codebase — count remaining instances
8. Read `components/header.tsx` and `components/footer.tsx` — are nav links locale-aware?
9. Estimate i18n coverage: grep for `useTranslations\|getTranslations` vs count files in app/[lang] with hardcoded English strings
10. Run `npm run build` (or check if it passes)

Score: 0-100 technical health.
Write findings to `cycle1-audit-tech.md`.
```

### Audit Agent 3: "legal-reviewer"
Prompt:

```
You are a legal compliance reviewer. Check Korean law compliance (행정사법, 변호사법, 표시광고법).

1. Verify ALL 9 legal copy fixes were applied. Read each file and check the EXACT current string:
   - components/visa/detail/EligibilitySection.tsx
   - components/visa/journey/steps/StepQualify.tsx
   - components/visa/EligibilityQuiz.tsx
   - components/visa/detail/QuickEligibilityCheck.tsx
   - components/visa/VisaComparisonTool.tsx
   - app/[lang]/[country]/visa/page.tsx
   - components/hero-section.tsx
   - components/pricing-section.tsx
   - data/visas/en/e-7.json

2. Grep the ENTIRE codebase for dangerous phrases: "you qualify", "you are eligible", "eligible for", "recommended visa", "Best Match", "official requirements", "500+"

3. Read `components/footer.tsx` — is there a global legal disclaimer?
4. Read `components/visa/DocumentChecklist.tsx` — does the export have a disclaimer header?
5. Read `components/visa/EligibilityQuiz.tsx` — is there a pre-results consent gate?
6. Read `components/pricing-section.tsx` — are B2B service descriptions safe?

Score each area: GREEN / YELLOW / RED.
Write to `cycle1-audit-legal.md`.
```

---

### CYCLE 1 — SYNTHESIS

After all 3 audit agents return, read their files yourself:
- `cycle1-audit-user.md`
- `cycle1-audit-tech.md`
- `cycle1-audit-legal.md`

Write a brief synthesis to `cycle1-synthesis.md`: scores, top 5 issues for Cycle 2.

---

# ============================================================
# CYCLE 2: WEDGE FEATURE + AUDIT FIXES
# Goal: Ship the killer feature. Fix Cycle 1 audit findings.
# Expected time: ~4 hours
# ============================================================

## CYCLE 2 — IMPLEMENT

Read `cycle1-synthesis.md` first. Then spawn these 4 agents IN PARALLEL:

### Agent 1: "cycle1-fixes"
Prompt:

```
Read these three audit files and fix every issue found:
- cycle1-audit-user.md
- cycle1-audit-tech.md
- cycle1-audit-legal.md

For each specific finding marked as broken/missing/regressed, make the fix. If a finding is vague, use your best judgment. After all fixes, run `npm run build`.
```

### Agent 2: "visa-path-data"
Prompt:

```
You are populating visa transition path data for a Next.js visa platform. Read CLAUDE.md for conventions.

1. Read `lib/visa/types.ts` — understand the VisaInfo type, especially `pathsTo`, `pathsFrom`, and `relatedVisas` fields
2. Read all 12 visa JSON files in `data/visas/en/`
3. Read `비자 대시보드 관련 조사 결과.txt` for research on Korean visa transition paths

4. In EVERY visa JSON file in `data/visas/en/`, populate these fields:

pathsTo: Array of objects, each with:
  - type: target visa type ID (e.g., "e-7")
  - name: target visa display name
  - requirements: brief text on what's needed for this transition
  - timeline: estimated processing time
  - documents: key documents needed
  - notes: common pitfalls or important caveats

Key paths (from research):
  - D-2 (Student) → D-10, E-7
  - D-4 (Language) → D-2, D-10
  - E-2 (Teaching) → E-7 (new employer), D-10
  - E-7 (Professional) → F-2 (points-based), D-10 (fallback)
  - F-1-D (Digital Nomad) → E-7
  - H-1 (Working Holiday) → D-10, E-7
  - D-7 (Intra-company) → E-7, D-10
  - D-8 (Investment) → F-2, D-10
  - D-10 (Job Seeking) → E-7, D-8, F-1-D
  - F-2 (Residence) → F-5 (Permanent)
  - Almost any visa → D-10 as a bridge/fallback

pathsFrom: The reverse — who can transition TO this visa type

relatedVisas: Simple array of related visa type IDs

5. Replicate the data to `data/visas/ja/` and `data/visas/zh-tw/` — translate the text portions (requirements, notes, etc.) while keeping the structure identical.

After changes, run: npm run build
```

### Agent 3: "visa-path-ui"
Prompt:

```
You are building the Visa Path Simulator — the #1 feature for this product. Read CLAUDE.md first for all conventions.

Also read:
- lib/visa/types.ts — data types
- lib/visa/data.ts — how visa data is loaded
- lib/visa/quiz-engine.ts — existing path logic
- components/visa/quiz/VisaPathMap.tsx — existing path visualization
- app/[lang]/[country]/visa/page.tsx — visa landing page (you'll add a link here)
- components/visa/journey/VisaJourneyPage.tsx — visa detail (you'll add relatedVisas section)

Create these files:
1. `app/[lang]/[country]/visa/path/page.tsx` — Server component. Load visa data, render VisaPathSimulator.
2. `app/[lang]/[country]/visa/path/loading.tsx` — Skeleton loading state.
3. `components/visa/path/visa-path-simulator.tsx` — "use client". Main interactive component.
4. `components/visa/path/path-card.tsx` — Individual step card in the path.
5. `components/visa/path/path-step.tsx` — Step connector/arrow between cards.
6. `components/visa/path/index.ts` — Barrel export.

UI spec for visa-path-simulator.tsx:
- Mobile-first vertical card layout
- Step 1: Select "What visa do you have now?" — shadcn Select with all 12 types + "No visa yet" option
- Step 2: Select "What's your goal?" — filtered to valid destinations from the selected visa's pathsTo data
- Step 3: Display path as vertical card sequence: Current → [Intermediate if needed] → Target
- Each path-card shows: visa name, key requirements, estimated timeline, key documents, link to detail page
- Disclaimer banner at top (always visible): "Paths shown are general information based on published requirements. Actual transitions depend on individual circumstances and immigration officer discretion."
- CTA at bottom: "Start this path" → links to /[lang]/[country]/visa/checklist/[target-type]
- URL state: encode selections in query params (?from=e-2&to=e-7) for shareability

Integration (modify existing files):
- Add "Visa Path Simulator" card/link to visa landing page (`app/[lang]/[country]/visa/page.tsx`)
- Add "Related Visas" section to `components/visa/journey/VisaJourneyPage.tsx` that renders the `relatedVisas` field from visa data
- In `components/visa/landing/AlreadyHaveVisa.tsx`, add a link to the path simulator

Use cn() for conditional classes. Use @/ path alias. Follow kebab-case for files, PascalCase for components.

After all changes, run: npm run build
```

### Agent 4: "dashboard-wire"
Prompt:

```
You are wiring the dashboard to actually work. Read CLAUDE.md first, then read:
- lib/visa/stateMachine.ts — state machine with transitions and updateProgressState()
- components/visa/dashboard/DashboardClient.tsx — current dashboard
- components/visa/StateDashboard.tsx — state display component
- components/visa/dashboard/HealthScoreCard.tsx — health score card component
- lib/visa/health-score.ts — health score calculation
- components/visa/OnboardingWizard.tsx — wizard with bug at line ~268-270

Implement:

1. STATE ADVANCEMENT: In StateDashboard.tsx (or DashboardClient.tsx), add buttons for each valid transition from current state:
   - PREPARING → "I submitted my application" → SUBMITTED
   - SUBMITTED → "It's under review" → UNDER_REVIEW
   - UNDER_REVIEW → "I got approved!" → APPROVED
   - APPROVED → "My visa is active" → ACTIVE
   Use shadcn AlertDialog for confirmation before each transition.
   Call updateProgressState() or equivalent from stateMachine.ts.
   Also support backward transitions with separate confirmation text.

2. SETTINGS BUTTON: Find the Settings icon (around line 147-152 in StateDashboard.tsx) that has no onClick handler. Wire it to a shadcn Sheet or Dialog that lets users: change target visa type, update target date, reset all progress (with destructive confirmation).

3. HEALTH SCORE: Import and render HealthScoreCard on the dashboard. Connect it to calculateHealthScore() from lib/visa/health-score.ts.

4. UNIFY LOCALSTORAGE: The codebase has two competing checklist systems:
   - DocumentChecklist uses key `visa-checklist` (nested object)
   - DocumentProgress uses key `visa-checklist-{type}` (flat object per type)
   Pick one format and migrate the other. Prefer the per-type format.

5. DISCLAIMER: Add to dashboard: "This dashboard tracks your self-reported progress. It is not connected to HiKorea or any government system."

6. ONBOARDING BUG: In OnboardingWizard.tsx around line 268-270, calculateMatches() is called before setSelectedSituation() state update takes effect (React batching). Fix by passing the situation value directly as a parameter to calculateMatches() instead of reading from state.

After all changes, run: npm run build
```

---

### CYCLE 2 — GATE

After all 4 agents return, run (Bash):
```bash
npm run build && npm run lint
```
Fix errors yourself. Commit:
```bash
git add -A && git commit -m "feat: visa path simulator, dashboard wiring, cycle 1 audit fixes"
```

---

## CYCLE 2 — AUDIT

Spawn 3 audit agents IN PARALLEL:

### Audit Agent 1: "journey-tester"
Prompt:

```
Test TWO complete user journeys by reading the CURRENT code:

JOURNEY A — Linh (E-7 holder, wants employer change):
1. Read app/[lang]/[country]/visa/page.tsx — is "I already have a visa" a primary path?
2. Read data/visas/en/e-7.json — is there employer change guidance?
3. Read app/[lang]/[country]/visa/path/page.tsx and components/visa/path/ — does Path Simulator exist? Can I select E-7 and see D-10 fallback?
4. Read dashboard components — can I advance state? Are there buttons?
5. Read checklist components — can I track E-7 documents?

JOURNEY B — James (E-2 → E-7 switcher):
1. Read visa landing — E-2 to E-7 transition info visible?
2. Read Path Simulator — can I select E-2 → E-7 and see the path?
3. Read quiz — does it ask about existing visa?
4. Read dashboard — can I set E-7 as target? Advance states?
5. Read comparison tool — E-2 vs E-7 comparison works?

Score each journey /100. Write to `cycle2-audit-journeys.md`.
```

### Audit Agent 2: "tech-inspector-2"
Prompt:

```
Technical audit of CURRENT codebase. Check everything from Cycle 1 PLUS new features:

1. Does app/[lang]/[country]/visa/path/page.tsx exist and export a valid component?
2. Check 3 visa JSONs (e-7, e-2, d-10) — do they have pathsTo/pathsFrom populated?
3. Read dashboard components — are state advancement buttons present?
4. Read OnboardingWizard.tsx ~line 268 — is the bug fixed?
5. Is HealthScoreCard rendered on dashboard?
6. Grep for both `visa-checklist` localStorage patterns — are they unified?
7. Is Settings button functional? (has onClick handler)
8. Read next.config.mjs — still clean?
9. Glob for loading.tsx and error.tsx — still all present?
10. Do new visa/path components follow conventions? (kebab-case files, barrel export, cn() usage)
11. Run npm run build — passes?

Score 0-100. Write to `cycle2-audit-tech.md`.
```

### Audit Agent 3: "completeness-checker"
Prompt:

```
Read IMPLEMENTATION-PLAN.md. For EVERY item in Phases 1 and 2, check if it's done in the current code.

Format as checklist:
✅ done — with evidence (file path)
❌ not done — what's missing
⚠️ partial — what's done vs what's not

Then list: What Phase 3 items should Cycle 3 prioritize? Any NEW issues from Cycle 2 implementation?

Write to `cycle2-audit-completeness.md`.
```

---

### CYCLE 2 — SYNTHESIS

Read all 3 reports yourself. Write `cycle2-synthesis.md`: journey scores, tech delta, completeness %, TOP 5 for Cycle 3.

---

# ============================================================
# CYCLE 3: REACH, POLISH, AND FINAL QUALITY
# Goal: i18n, SEO, disclaimers, stubs, community tips, polish
# Expected time: ~3 hours
# ============================================================

## CYCLE 3 — IMPLEMENT

Read `cycle2-synthesis.md`. Then spawn 6 agents IN PARALLEL:

### Agent 1: "cycle2-fixes"
Prompt:

```
Read these audit files and fix every issue found:
- cycle2-audit-journeys.md
- cycle2-audit-tech.md
- cycle2-audit-completeness.md

Fix each specific finding. After all fixes, run: npm run build
```

### Agent 2: "i18n-wire"
Prompt:

```
Wire i18n to components that still have hardcoded English. Read CLAUDE.md first. Read messages/en.json to understand existing key structure.

For EACH component below:
1. Read the file
2. Extract all hardcoded English strings
3. Add translation keys to messages/en.json, messages/ja.json, messages/zh-tw.json (use existing key naming patterns)
4. Replace hardcoded strings with useTranslations() (client components) or getTranslations() (server components) from next-intl

Priority order:
1. app/[lang]/[country]/visa/page.tsx — visa landing
2. components/visa/dashboard/DashboardClient.tsx
3. components/visa/LegalDisclaimer.tsx
4. components/hero-section.tsx
5. components/visa/NextStepHero.tsx
6. components/visa/journey/VisaJourneyPage.tsx
7. app/auth/login/page.tsx and app/auth/signup/page.tsx
8. app/auth/layout.tsx — fix <html lang="en"> to use actual locale
9. app/[lang]/[country]/bundles/page.tsx
10. app/[lang]/[country]/areas/page.tsx
11. components/sections/why-section.tsx
12. components/sections/services-detail-section.tsx
13. components/header.tsx and components/footer.tsx — make nav links locale-aware using /{lang}/{country}/ prefix

Do as many as you can. If running low on turns, prioritize items 1-6.
After changes, run: npm run build
```

### Agent 3: "vietnamese-lang"
Prompt:

```
Add Vietnamese language support to this Next.js app using next-intl.

1. Read lib/i18n/config.ts — add "vi" to the locales array
2. Read messages/en.json — create messages/vi.json with all keys translated to Vietnamese
3. Create data/visas/vi/ directory. For each of the 12 visa JSON files in data/visas/en/, create a Vietnamese version in data/visas/vi/ with translated text content (keep structure identical)
4. Read data/quiz/questions.json — add "Vietnam" / "Vietnamese" as an explicit nationality option (not lumped under "Other")
5. Read components/language-switcher.tsx — add Vietnamese as a language option with label "Tiếng Việt"
6. Read components/sections/social-proof-section.tsx (or similar) — add at least one testimonial with a Vietnamese name in an E-7 worker role

After changes, run: npm run build
```

### Agent 4: "stubs-and-tips"
Prompt:

```
Complete the 6 stub visa pages and populate community tips.

1. Read lib/visa/types.ts for the VisaInfo type structure
2. Read one complete visa file (e.g., data/visas/en/e-7.json) as a template for the data format
3. Read 비자 대시보드 관련 조사 결과.txt for research data on Korean visas

4. For each stub visa (data/visas/en/e-2.json, d-7.json, d-8.json, f-6.json, f-4.json, d-4.json):
   - Fill with real data: overview, eligibility criteria, document list (with Korean names 한국어 병기), application steps, FAQs, fees, processing times
   - Set isStub to false (or remove the flag)
   - Include pathsTo and pathsFrom (consistent with what visa-path-data agent set in Cycle 2)

5. Replicate completed stubs to data/visas/ja/ and data/visas/zh-tw/ (translate text)

6. In ALL 12 visa JSON files (not just stubs), populate the communityTips field with 3-5 tips each. Use real insights from the research file. Format per the CommunityTip type in types.ts.

7. Read components/visa/journey/VisaJourneyPage.tsx — add a "Community Tips" section below the FAQ that renders communityTips from the visa data. Style as cards with a speech bubble icon.

After changes, run: npm run build
```

### Agent 5: "seo-disclaimers"
Prompt:

```
Add SEO foundation and legal disclaimers. Read CLAUDE.md for conventions.

SEO:
1. Create public/robots.txt — allow all, reference sitemap at /sitemap.xml
2. Create app/sitemap.ts — dynamic sitemap covering all routes × all locales (en, ja, zh-tw, vi). Use Next.js Metadata API.
3. In app/[lang]/layout.tsx or app/layout.tsx, add hreflang alternate link tags for all supported locales
4. Add OpenGraph metadata (og:title, og:description, og:type, og:url) to the root layout
5. In visa detail page (app/[lang]/[country]/visa/[type]/page.tsx), add JSON-LD FAQPage structured data using the visa's FAQ data

Disclaimers:
6. Read components/footer.tsx — add global disclaimer text: "LocalNomad provides general information about Korean visa requirements for educational purposes only. This information does not constitute legal advice. Visa decisions are made solely by Korean immigration authorities. For personalized legal advice, consult a licensed Korean 행정사 (administrative scrivener) or 변호사 (attorney)."
7. Add a banner-style disclaimer component at the TOP of visa detail pages (in VisaJourneyPage.tsx or the page.tsx wrapper)
8. Read components/visa/DocumentChecklist.tsx — find the export/download function and prepend this text to exports: "Generated by LocalNomad — for reference only. Verify all requirements with Korean immigration authorities."
9. In components/visa/EligibilityQuiz.tsx, add a consent gate before showing results: checkbox "I understand this tool matches my answers against published requirements and does not determine my eligibility" + results only shown after checking
10. Read app/(legal)/terms/page.tsx — add a paragraph explicitly referencing 행정사법 and 변호사법

After changes, run: npm run build
```

### Agent 6: "nav-and-polish"
Prompt:

```
Final navigation fixes and polish. Read CLAUDE.md.

1. Read components/header.tsx — ensure ALL nav links use locale-aware paths. If links are hardcoded as /bundles, /areas, /visa, they need to be /{lang}/{country}/bundles etc. Use the current locale from next-intl or the route params.

2. Read components/footer.tsx — same fix for footer links.

3. Read app/auth/callback/route.ts — ensure post-auth redirect includes locale prefix.

4. Read app/page.tsx (root page) — if it bypasses the i18n system entirely, add a redirect to /en (or the user's detected locale) so users always land in a locale-prefixed route.

5. Remove or fix the non-functional theme toggle if `forcedTheme="dark"` is set (check app/[lang]/layout.tsx). If dark mode is forced, remove the toggle button from the header.

6. Move @types/mapbox-gl from dependencies to devDependencies in package.json.

7. Fix package name in package.json from "my-v0-project" to "b2c-website".

After changes, run: npm run build
```

---

### CYCLE 3 — GATE

After all 6 agents return, run (Bash):
```bash
npm run build && npm run lint
```
Fix errors yourself. Commit:
```bash
git add -A && git commit -m "feat: i18n wiring, Vietnamese, stub completion, community tips, SEO, disclaimers, polish"
```

---

## CYCLE 3 — FINAL AUDIT

This is the quality gate. Be HARSH. Spawn 3 agents IN PARALLEL:

### Final Audit 1: "linh-journey-final"
Prompt:

```
You are Linh. Vietnamese, 29, E-7-1 holder, 4 months to expiry, TOPIK 3. This is the FINAL quality gate. Be harsh.

Walk through EVERYTHING:
1. Read app/page.tsx — is there Vietnamese? Welcoming to workers?
2. Check if Vietnamese locale works: does messages/vi.json exist? Is "vi" in lib/i18n/config.ts?
3. Read app/[lang]/[country]/visa/page.tsx — is E-7 employer change a primary path?
4. Read data/visas/en/e-7.json — employer change guidance? Korean document names? Community tips populated?
5. Read app/[lang]/[country]/visa/path/page.tsx and components/visa/path/ — does Path Simulator exist? E-7 → D-10 fallback visible?
6. Read dashboard components — state advancement buttons? Health score? Disclaimer?
7. Read quiz — Vietnam listed? Consent gate? Language legally safe?
8. Read checklist — export has disclaimer header?
9. Read data/visas/en/e-2.json — is it still a stub or filled with real data?

Score /100 (5 categories × /20). Compare to baseline 30/100.
Write to `final-audit-user.md`.
```

### Final Audit 2: "tech-final"
Prompt:

```
Comprehensive technical audit. Be thorough.

1. Read next.config.mjs — no ignoreBuildErrors? no unoptimized images?
2. Run npm run build — passes?
3. Glob for **/loading.tsx — count. Glob for **/error.tsx — count. All routes covered?
4. Read app/auth/callback/route.ts — secure? locale-aware redirect?
5. Read lib/supabase/client.ts and server.ts — null-safe?
6. Read app/api/subscribe/route.ts — rate limiting? no PII logging?
7. Grep for "console.log" (exclude node_modules) — count remaining
8. Grep for "as any" — count remaining
9. Grep for "useTranslations\|getTranslations" — count files using i18n. Compare to total files in app/[lang]/ to estimate coverage %
10. Check messages/vi.json exists. Check "vi" in lib/i18n/config.ts.
11. Read 3 former stub visas (e-2, d-7, f-6) — real content or still stubs?
12. Check pathsTo/pathsFrom in data/visas/en/e-7.json — populated?
13. Check communityTips in data/visas/en/e-7.json — populated?
14. Check public/robots.txt exists. Check app/sitemap.ts exists.
15. Read components/footer.tsx — global disclaimer present?
16. Read package.json — name is "b2c-website"? @types/mapbox-gl in devDeps?

Score 0-100. Compare to baseline 38/100.
Write to `final-audit-tech.md`.
```

### Final Audit 3: "legal-final"
Prompt:

```
Full legal sweep. Be thorough.

1. Grep entire codebase (exclude node_modules) for: "you qualify", "you are eligible", "eligible for", "recommended visa", "Best Match", "official requirements", "500+" — report ALL remaining instances
2. Read each of the 9 files from the original legal copy fix list — verify exact current strings
3. Read components/footer.tsx — global disclaimer present? Mentions 행정사법 and 변호사법?
4. Read components/visa/EligibilityQuiz.tsx — consent gate before results?
5. Read visa detail pages — banner disclaimer at top?
6. Read components/visa/DocumentChecklist.tsx — export includes disclaimer?
7. Read components/pricing-section.tsx — B2B descriptions safe?
8. Read dashboard — self-reported disclaimer present?
9. Read path simulator components — transition disclaimer present?
10. Read app/(legal)/terms/page.tsx — references 행정사법 and 변호사법?

Score: GREEN / YELLOW / RED.
Write to `final-audit-legal.md`.
```

---

### FINAL SYNTHESIS

Read all 3 final audit reports yourself. Write `FINAL-AUDIT-REPORT.md`:

```
# LocalNomad Final Audit Report — 3-Cycle Result

## Score Comparison
| Metric | Baseline | After Cycle 1 | After Cycle 2 | Final |
|--------|----------|---------------|---------------|-------|
| User (Linh) | 30/100 | [from cycle1-audit-user] | [from cycle2-audit-journeys] | [from final-audit-user] |
| Technical | 38/100 | [from cycle1-audit-tech] | [from cycle2-audit-tech] | [from final-audit-tech] |
| Legal | YELLOW | [from cycle1-audit-legal] | [infer] | [from final-audit-legal] |

## What Shipped
[Bullet list of every feature and fix across all 3 cycles]

## What's Still Missing
[Honest list of remaining gaps]

## Recommended Next Steps
[Top 5 items for the human to prioritize]
```

Then output a final summary message confirming all 3 cycles are complete.

---

## GLOBAL RULES

### Files You Must Not Modify
- `components/ui/*` — shadcn/ui managed
- `node_modules/*`
- `.env.local` — secrets

### Conventions (from CLAUDE.md)
- Files: `kebab-case.tsx`
- Components: PascalCase
- Use `cn()` from `@/lib/utils`
- Use `@/` path alias
- Server components by default — only `"use client"` when needed
- Barrel exports (`index.ts`) for feature folders
- Import order: React/Next → external → @/components/ui → @/components → @/hooks → @/lib → types → data

### Legal Bright Lines
CAN: Display requirements, requirement-matching quizzes, date calculators, sell info products
MUST NEVER: Say "you are eligible", file for users, store HiKorea creds, broker 행정사 for fee, auto-fill documents

### Error Recovery
- If an agent fails to return, retry it ONCE with the same prompt.
- If it fails again, note the failure in the cycle synthesis and continue.
- If `npm run build` fails at a GATE, fix it yourself using Bash. Do not re-spawn agents for build fixes.
- If two agents conflict on the same file, prefer the later-numbered agent's changes and manually reconcile.
- NEVER stop the pipeline. ALWAYS complete all 3 cycles.
