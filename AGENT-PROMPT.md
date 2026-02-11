# Claude Code Agent-Team Prompt: LocalNomad Sprint

Copy and paste this prompt into Claude Code to execute the implementation plan using a multi-agent structure.

---

## THE PROMPT

```
You are the lead engineer for LocalNomad, a Next.js 16 visa guidance platform for foreign professionals in South Korea. You have just completed a 5-agent deep audit that scored the product 32/100 (user personas) and 38/100 (technical quality).

Your job is to execute a phased implementation plan using parallel sub-agents. You will act as the **orchestrator** — spawning Task agents for independent work streams, coordinating their outputs, and ensuring nothing conflicts.

## CRITICAL CONTEXT

Read these files FIRST before spawning any agents:
- `CLAUDE.md` — project conventions, tech stack, naming rules
- `IMPLEMENTATION-PLAN.md` — the full phased plan with specific files and fixes
- `10x-product-audit-report.md` — synthesized audit findings

Tech stack: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Supabase, next-intl, Mapbox GL

## PHASE 1: FOUNDATION (execute all agents in parallel)

Spawn these 4 agents simultaneously:

### Agent 1: "legal-copy" (Bash agent)
Fix all legal copy issues identified by counsel. These are simple string replacements with NO i18n dependency.

Files to modify and exact changes:
1. `components/visa/detail/EligibilitySection.tsx` — "You may be eligible" → "Your answers align with published requirements". Remove green checkmark, use neutral indicator.
2. `components/visa/journey/steps/StepQualify.tsx` — "you appear to qualify for this visa" → "Your answers match the published requirements for this visa"
3. `components/visa/EligibilityQuiz.tsx` — "here are your recommended visas" → "Visas with matching requirements include...". "Best Match" → "Closest requirement match"
4. `components/visa/detail/QuickEligibilityCheck.tsx` — "You may be eligible" → "Your answers match published requirements"
5. `components/visa/VisaComparisonTool.tsx` — "personalized recommendations" → "explore visa options"
6. `app/[lang]/[country]/visa/page.tsx` — "12 visa types covered" → "6 full guides + 6 coming soon". "Based on official requirements" → "Based on publicly available requirements"
7. `components/hero-section.tsx` — "500+ Nomads Helped" → "Helping nomads navigate Korea" (or remove the stat entirely)
8. `components/pricing-section.tsx` — "Help prepare required paperwork" → "Checklist of required paperwork". Add scope limitation to accompaniment: "Logistical and language support only."
9. `data/visas/en/e-7.json` — grace period: "You have a grace period (usually 30 days)" → "A grace period may be granted (typically 30 days, but varies by case). Confirm with immigration authorities."

After making all changes, run `npm run build` to verify nothing breaks. If build fails due to `ignoreBuildErrors: true` still being present, that's expected — the build-fix agent handles that.

### Agent 2: "security-fix" (Bash agent)
Fix all security vulnerabilities identified by inspector.

1. `app/auth/callback/route.ts`:
   - Validate the `next` query parameter against an allowlist of internal paths (must start with `/` and not contain `//` or external URLs)
   - Include `/{lang}/{country}/` prefix in the redirect (default to `/en/korea/visa/dashboard`)

2. `lib/supabase/client.ts`:
   - Replace `null as any` with a proper pattern: either throw an error with a helpful message ("Supabase env vars not configured"), or return a typed null and handle it at call sites

3. `lib/supabase/server.ts`:
   - Replace `!` non-null assertions with proper env var guards that throw descriptive errors

4. `app/api/subscribe/route.ts`:
   - Add IP-based rate limiting (simple in-memory map, 5 requests per minute per IP)
   - Remove all `console.log` statements that log email addresses or PII

5. Run `npm run build` to verify.

### Agent 3: "build-fix" (general-purpose agent)
The most critical fix. Remove build escape hatches and fix all resulting TypeScript errors.

1. Open `next.config.mjs`
2. Remove `ignoreBuildErrors: true` from the `typescript` block
3. Remove `images: { unoptimized: true }` from the config (sharp is already installed)
4. Remove Replit-specific entries from `allowedDevOrigins` (keep only localhost)
5. Run `npm run build`
6. Fix EVERY TypeScript error that appears. Common patterns to expect:
   - Type mismatches from `as unknown as VisaInfo` casts in `lib/visa/data.ts`
   - Null checks needed for Supabase client (coordinate with security-fix agent)
   - Missing type imports
   - Unused variables
7. Keep running `npm run build` until it succeeds with 0 errors
8. Run `npm run lint` and fix any linting errors

This agent should be persistent — it may take many iterations. Do NOT re-add `ignoreBuildErrors: true` under any circumstances.

### Agent 4: "loading-error-states" (Bash agent)
Add loading and error handling to every route group.

For each route group in `app/`, create:

1. `loading.tsx` files with skeleton UI:
   - Use shadcn/ui `Skeleton` component
   - Match the approximate layout of the actual page (header skeleton, content blocks, etc.)
   - Keep them simple — grey blocks matching page structure

2. `error.tsx` files:
   - Must have `"use client"` directive
   - Accept `error` and `reset` props
   - Show friendly error message with retry button
   - Style consistently with the dark theme

3. `app/not-found.tsx`:
   - Custom 404 page
   - Link back to visa section (`/en/korea/visa`)
   - Styled consistently with site theme

Route groups that need these files:
- `app/` (root)
- `app/[lang]/`
- `app/[lang]/[country]/`
- `app/[lang]/[country]/visa/`
- `app/[lang]/[country]/visa/[type]/`
- `app/[lang]/[country]/visa/checklist/`
- `app/[lang]/[country]/visa/checklist/[type]/`
- `app/[lang]/[country]/visa/dashboard/`
- `app/[lang]/[country]/visa/find/`
- `app/[lang]/[country]/visa/compare/`
- `app/[lang]/[country]/areas/`
- `app/[lang]/[country]/bundles/`
- `app/auth/`

---

## PHASE 2: THE WEDGE (after Phase 1 agents complete)

Wait for all Phase 1 agents to finish and verify `npm run build` passes. Then spawn these agents:

### Agent 5: "visa-path-data" (general-purpose agent)
Populate the visa path data that the UI will consume.

1. Read `lib/visa/types.ts` to understand the `pathsTo`/`pathsFrom` field structure
2. Read all 12 visa JSON files in `data/visas/en/`
3. Read the research file `비자 대시보드 관련 조사 결과.txt` for transition path information
4. Populate `pathsTo` and `pathsFrom` in every visa JSON with accurate transition data:

   Key paths to include (from research):
   - D-2 (Student) → D-10 (Job Seeking) → E-7 (Professional)
   - D-4 (Language Study) → D-2 (Student) → D-10 → E-7
   - E-2 (Teaching) → E-7 (Professional) [requires new employer sponsor]
   - F-1-D (Digital Nomad) → E-7 (if offered employment)
   - E-7 (Professional) → F-2-7 (Residence via points) → F-5 (Permanent)
   - H-1 (Working Holiday) → D-10 or E-7 (if find sponsor)
   - D-7 (Intra-company) → E-7 (if change employers)
   - D-8 (Investment) → F-2 (Residence)
   - Any visa → D-10 (as fallback/bridge when between visas)

   Each path entry should include:
   - Target visa type
   - Brief requirements description
   - Estimated timeline
   - Key documents needed
   - Common pitfalls/notes

5. Also populate `relatedVisas` field in each visa JSON (list of related visa type IDs)
6. Replicate the same path data into `data/visas/ja/` and `data/visas/zh-tw/` (translate the text portions)

### Agent 6: "visa-path-ui" (general-purpose agent)
Build the Visa Path Simulator UI. This is the #1 feature.

1. Read `CLAUDE.md` for component conventions
2. Read `lib/visa/types.ts` for data types
3. Read `lib/visa/quiz-engine.ts` for existing path generation logic
4. Read `components/visa/quiz/VisaPathMap.tsx` for existing path visualization

Create:
- New route: `app/[lang]/[country]/visa/path/page.tsx` (server component)
- New component: `components/visa/path/VisaPathSimulator.tsx` (client component)
- New component: `components/visa/path/PathCard.tsx`
- New component: `components/visa/path/PathStep.tsx`
- Barrel export: `components/visa/path/index.ts`

UI requirements:
- Mobile-first card-based layout (NOT a flowchart)
- Step 1: "What visa do you have now?" — dropdown/select of all 12 visa types, plus "No visa yet"
- Step 2: "What's your goal?" — dropdown of target visa types (filtered to valid destinations from pathsTo)
- Step 3: Display the path as a vertical card sequence: Current → [Intermediate if needed] → Target
- Each card shows: visa name, key requirements, estimated timeline, documents needed, link to full detail page
- Disclaimer banner at top: "Paths shown are general information based on published requirements. Actual transitions depend on individual circumstances and immigration officer discretion."
- CTA at bottom: "Start this path" → link to document checklist for target visa
- Shareable URL: encode current + target in query params

Also:
- Add "Visa Path Simulator" link to the visa landing page (`app/[lang]/[country]/visa/page.tsx`)
- Render `relatedVisas` as a "Related Visas" section on `VisaJourneyPage.tsx`
- Link from "Already have a visa?" section to the path simulator

### Agent 7: "dashboard-wire" (general-purpose agent)
Wire the dashboard to actually work.

1. Read `lib/visa/stateMachine.ts` — understand state transitions and `updateProgressState()`
2. Read `components/visa/dashboard/DashboardClient.tsx` — understand current dashboard
3. Read `components/visa/StateDashboard.tsx` — understand state display
4. Read `lib/visa/health-score.ts` — understand health score calculation

Implement:
- **State advancement buttons**: For each valid transition from current state, show a button:
  - PREPARING → "I submitted my application" → SUBMITTED
  - SUBMITTED → "It's under review" → UNDER_REVIEW
  - UNDER_REVIEW → "I got approved!" → APPROVED
  - APPROVED → "My visa is active" → ACTIVE
  - Include confirmation dialog (use shadcn/ui AlertDialog) before each transition
  - Allow backward transitions (with confirmation)

- **Fix Settings button**: `StateDashboard.tsx:147-152` has a Settings icon with no onClick. Wire it to a settings sheet/dialog that lets users:
  - Change target visa type
  - Update target date
  - Reset progress (with confirmation)

- **Render HealthScoreCard**: Import and display `calculateHealthScore()` result on the dashboard

- **Unify checklist localStorage**: Merge the two competing systems:
  - `visa-checklist` (DocumentChecklist)
  - `visa-checklist-{type}` (DocumentProgress)
  - Pick one key format and migrate the other

- **Add self-reported disclaimer**: "This dashboard tracks your self-reported progress. It is not connected to HiKorea or any government system."

- **Fix OnboardingWizard bug**: At `OnboardingWizard.tsx:268-270`, `calculateMatches()` runs before `setSelectedSituation()` state update takes effect. Fix by passing the situation value directly to the calculation function instead of reading it from state.

---

## PHASE 3: REACH (after Phase 2 agents complete)

### Agent 8: "i18n-wire" (general-purpose agent)
Wire the 75% of components that ignore i18n.

Priority order:
1. `app/[lang]/[country]/visa/page.tsx` — visa landing (core product page)
2. `components/visa/dashboard/DashboardClient.tsx` — dashboard
3. `components/visa/LegalDisclaimer.tsx` — critical for legal compliance across locales
4. `components/hero-section.tsx` — first thing users see
5. `components/visa/NextStepHero.tsx`
6. `components/visa/journey/VisaJourneyPage.tsx`
7. `app/auth/login/page.tsx` and `app/auth/signup/page.tsx`
8. `app/auth/layout.tsx` — fix hardcoded `<html lang="en">`
9. `app/[lang]/[country]/bundles/page.tsx`
10. `app/[lang]/[country]/areas/page.tsx`
11. `components/sections/why-section.tsx`
12. `components/sections/services-detail-section.tsx`
13. Header and footer nav links — must include `/{lang}/{country}/` prefix

For each component:
- Extract hardcoded English strings into translation keys
- Add corresponding keys to `messages/en.json`, `messages/ja.json`, `messages/zh-tw.json`
- Use `useTranslations()` (client components) or `getTranslations()` (server components) from next-intl
- Test by switching locale in URL and verifying content changes

### Agent 9: "global-disclaimer" (Bash agent)
After Agent 8 finishes LegalDisclaimer i18n migration:

1. Add global footer disclaimer to the site footer (`components/footer.tsx`):
   "LocalNomad provides general information about Korean visa requirements for educational purposes only. This information does not constitute legal advice. Visa decisions are made solely by Korean immigration authorities. For personalized legal advice, consult a licensed Korean 행정사 or 변호사."

2. Add banner-style disclaimer at TOP of all visa detail pages (above the content, below the header)

3. Add disclaimer header to DocumentChecklist .txt export function:
   "Generated by LocalNomad — for reference only. Verify all requirements with Korean immigration authorities."

4. Add translated disclaimer keys to all locale files

### Agent 10: "seo-foundation" (Bash agent)
1. Create `public/robots.txt` with sitemap reference
2. Create dynamic `app/sitemap.ts` that generates sitemap.xml covering all routes × all locales
3. Add `hreflang` alternate link tags to root layout
4. Add OpenGraph meta tags (`og:title`, `og:description`, `og:type`, `og:url`) to layout metadata
5. Add JSON-LD structured data for visa FAQ pages (FAQPage schema)

---

## ORCHESTRATION RULES

1. **Phase 1 agents (1-4) run in parallel.** They touch different files with minimal overlap.
   - Exception: Agent 2 (security) and Agent 3 (build-fix) both touch `lib/supabase/`. Coordinate: Agent 2 goes first on Supabase files, Agent 3 inherits those changes.

2. **Phase 2 agents (5-7) run in parallel after Phase 1 completes.**
   - Agent 5 (path data) and Agent 6 (path UI) can run simultaneously — UI can use placeholder data initially, then Agent 5's data gets loaded.
   - Agent 7 (dashboard) is independent of 5 and 6.

3. **Phase 3 agents (8-10) run in parallel after Phase 2 completes.**
   - Exception: Agent 9 (global disclaimer) depends on Agent 8 finishing the LegalDisclaimer i18n migration. Run Agent 9 after Agent 8 completes that specific file.

4. **After each phase**, run:
   ```bash
   npm run build && npm run lint
   ```
   Fix any errors before proceeding to the next phase.

5. **Commit after each phase** with descriptive messages:
   - Phase 1: "fix: legal copy, security vulnerabilities, build foundation, loading states"
   - Phase 2: "feat: visa path simulator, dashboard wiring, state advancement"
   - Phase 3: "feat: i18n wiring, global disclaimers, SEO foundation"

## FILES YOU MUST NOT MODIFY

- `components/ui/*` — shadcn/ui managed components
- `node_modules/*`
- `.env.local` — contains secrets

## NAMING CONVENTIONS (from CLAUDE.md)

- Files: `kebab-case.tsx`
- Components: PascalCase
- Use `cn()` from `@/lib/utils` for conditional classes
- Use `@/` path alias for all imports
- Server components by default — only add `"use client"` when needed
- Barrel exports (`index.ts`) required for feature folders
```

---

## Usage

1. Copy everything between the triple backticks above
2. Paste it into Claude Code as your prompt
3. Claude will read the referenced files, then begin spawning parallel agents for Phase 1
4. Each phase completes with a build verification before the next begins

The prompt is designed so that each agent has clear file boundaries and can work independently without conflicts. The orchestrator coordinates handoffs between phases.
