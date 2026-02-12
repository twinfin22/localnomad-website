# LocalNomad Continuation Prompt v2 — UX Polish + Remaining Fixes

2 cycles: UX/Performance fixes + Remaining audit items
Expected time: 3-5 hours

---

## How to Run

cat docs/CONTINUATION-PROMPT.md | claude --dangerously-skip-permissions -p -

Or, if you want to monitor and answer questions interactively:
cat docs/CONTINUATION-PROMPT.md | claude -p -

IMPORTANT: Use pipe, not $(cat ...), to avoid shell backtick corruption.

Below is the full prompt.

---

You are the lead engineer for LocalNomad, a Next.js 16 visa guidance platform deployed at localnomad.club. 5 cycles of development have been completed (Cycles 1-3 original, Cycles 4-5 perf/i18n). Current scores: User 74/100, Technical 80/100, Legal YELLOW.

Your job: run 2 final cycles to fix UX bugs found during dog-fooding and close remaining audit issues.

## EXECUTION MODE: SUPERVISED

The user may or may not be present. You should:

ASK the user when:
- A decision has significant trade-offs (e.g., aggressive vs conservative refactoring)
- Multiple valid approaches exist and the choice affects UX or architecture
- Something seems risky or could break existing functionality
- You discover an unexpected issue that changes scope

DO NOT ask the user for:
- Trivial decisions (variable naming, formatting, import order)
- File permission prompts — --dangerously-skip-permissions handles those
- Build error fixes — just fix them yourself
- Whether to proceed to the next cycle — always proceed

If the user does not respond within a reasonable time, make the safer/simpler choice and document it in the commit message.

ALWAYS complete ALL cycles. Do not stop early unless the user explicitly asks you to.

## HOW TO USE AGENTS

You are the ORCHESTRATOR. You dispatch work via the Task tool.

When the prompt says "IN PARALLEL", send ONE message with MULTIPLE Task tool calls:

Task(description="fix-ux", subagent_type="general-purpose", prompt="...")
Task(description="fix-links", subagent_type="general-purpose", prompt="...")

ALL agents use subagent_type="general-purpose".

After all agents return, run the GATE (build + lint), fix errors yourself, then commit.

## BEFORE YOU START

Read these files to understand context:
- CLAUDE.md (conventions, tech stack, naming rules)
- docs/FINAL-AUDIT-REPORT.md (17 remaining issues, score history)

Tech: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Supabase, next-intl, Mapbox GL.

ALREADY DONE (do NOT redo):
- hero-section.tsx: mounted/setMounted pattern already removed, uses CSS-only animate-fade-up
- mapbox-gl CSS: already moved out of root layout into SeoulNeighborhoodMap.tsx
- lazy-map.tsx: already exists with dynamic() import
- Geist_Mono: already removed from layout
- Font display: "swap" already set
- Suspense: already imported in layout
- 15 loading.tsx + 15 error.tsx: already created
- Legal disclaimers: footer, quiz consent gate, path simulator, dashboard all done
- Visa Path Simulator: fully built (30+ paths, 3-step wizard, URL state, 3 languages)

IMPORTANT: next.config.mjs is clean. Do NOT add ignoreBuildErrors.

---

# ============================================================
# CYCLE 6: UX BUGS + VISUAL POLISH
# Goal: Fix bugs found during real user testing (dog-fooding)
# Expected time: ~2 hours
# ============================================================

## CYCLE 6 -- IMPLEMENT

Spawn these 4 agents IN PARALLEL (single message, 4 Task calls):

### Agent 1: "ux-bugs"
Prompt for this agent:

You are fixing UX bugs found during dog-fooding of a Next.js 16 visa guidance app. Read CLAUDE.md first.

BUG 1 — "Back to Visa Guide" link overlaps with logo on visa detail pages:
- Read components/visa/journey/VisaJourneyPage.tsx
- Find the "Back to Visa Guide" link near the top
- It renders on the same line as the header/logo, causing visual overlap
- Fix: Add sufficient top margin or padding so the back link sits BELOW the fixed header. Use pt-20 or mt-16 on the page container, or add a spacer div.
- Also check: the link text position should be clearly separated from the LocalNomad logo in the header

BUG 2 — Footer text has extremely low contrast (nearly invisible):
- Read components/footer.tsx
- The tagline "Where Nomads Become Local, and Locals Become Nomads" and nav links are barely visible against the dark background
- Fix: Change text color from text-muted-foreground (or whatever dim color) to text-foreground/60 or text-foreground/70 for better readability
- The footer links (Bundles, Area Guide, Visa) also need higher contrast
- Copyright line and Terms/Privacy links should be at least text-foreground/50

BUG 3 — Mobile: situation cards use single-column layout, causing excessive scrolling:
- Read app/[lang]/[country]/visa/page.tsx — find the situation card grid
- Currently: grid-cols-1 on mobile, grid-cols-2 on sm+
- Fix: Change to grid-cols-2 on mobile too. Cards should show emoji + short text, which fits in 2-column even on 320px screens.
- Reduce card padding on mobile: p-4 instead of p-6 or p-8
- This reduces scroll from 6 full-width cards to 3 rows of 2

BUG 4 — "Already have a visa?" button intent is unclear:
- Read components/visa/landing/AlreadyHaveVisa.tsx
- The label "Already have a visa? | Manage your visa" is ambiguous — does it mean track progress? transition to new visa? read about current visa?
- Fix: Change the label to "Already have a visa? See your options" or "Already in Korea? Find your next step"
- When expanded, show two clear CTAs:
  a) "Track my visa progress" -> links to /dashboard
  b) "Explore visa transitions" -> links to /visa/path

BUG 5 — Quick Check "Salary meeting minimum threshold" has no actual number:
- Read components/visa/journey/steps/StepQualify.tsx
- The eligibility check asks "Salary meeting minimum threshold?" but the user has no idea what the threshold IS
- Fix: For E-7 specifically, change to "Annual salary of 30M+ KRW (or GNI equivalent)"
- The salary data should come from the visa JSON. Read data/visas/en/e-7.json to find the actual threshold mentioned in eligibility criteria.
- If the visa JSON has salary info, use it. If not, add a generic note: "Meets the salary requirement for your occupation category"
- Do the same for other visa types where applicable

After all changes, run: npm run build

### Agent 2: "locale-links-fix"
Prompt for this agent:

You are fixing locale-awareness issues across the codebase. Read CLAUDE.md first.

The app uses [lang]/[country] route structure. ALL internal links must include the locale prefix. The locale comes from next-intl useLocale() (client) or route params (server).

IMPORTANT: Read the CURRENT code first. Some of these may have been fixed in previous cycles. Only fix what is still broken.

Check and fix ALL bare links in these files:

1. components/visa/VisaComparisonTool.tsx — Any href like "/visa/..." needs locale prefix
2. components/visa/DocumentProgress.tsx — Same
3. components/visa/journey/steps/StepAfterApproval.tsx — Same
4. components/visa/dashboard/NextActionCard.tsx — Fix ALL bare links (quiz, checklist, dashboard, etc.)
5. Grep the entire codebase for: href="/visa, href="/bundles, href="/areas, href="/auth (without locale prefix). Fix any remaining.

Pattern for client components:
import { useLocale } from "next-intl"
const locale = useLocale()
Then: href={/${locale}/korea/visa/quiz}

Pattern for server components that have params:
const { lang, country } = params
Then: href={/${lang}/${country}/visa/quiz}

After all changes, run: npm run build

### Agent 3: "dashboard-i18n"
Prompt for this agent:

You are extracting hardcoded English strings from dashboard components into the i18n system. Read CLAUDE.md first. Read messages/en.json for existing key patterns.

IMPORTANT: Check the CURRENT state of each file. Some strings may already be translated from Cycle 3-5 work. Only extract strings that are STILL hardcoded.

Components to check and i18n:
1. components/visa/StateDashboard.tsx
2. components/visa/dashboard/DashboardClient.tsx
3. components/visa/VisaComparisonTool.tsx
4. components/visa/dashboard/NextActionCard.tsx
5. components/visa/OnboardingWizard.tsx

For each file:
- Read it first
- Identify all remaining hardcoded English strings
- Add translation keys to messages/en.json, messages/ja.json, messages/zh-tw.json
- Replace strings with useTranslations() calls
- Use existing namespace patterns (check what namespaces already exist in en.json)

Japanese: polite form. Traditional Chinese: Taiwan-standard.

Also: Add disclaimer to OnboardingWizard after match scores:
"These matches compare your answers against published visa requirements. They do not determine eligibility. Consult Korean immigration authorities for official guidance."

After all changes, run: npm run build

### Agent 4: "legal-cleanup"
Prompt for this agent:

You are doing final legal cleanup. Read CLAUDE.md first.

1. TESTIMONIALS: Read components/social-proof-section.tsx (root level) AND components/sections/social-proof-section.tsx (sections folder). Check BOTH files for fabricated names like "Sarah M.", "James K.", "Maria L.". Replace with anonymous attribution:
   - "E-7 visa holder, Seoul" instead of "Sarah M."
   - "D-2 student, Busan" instead of "James K."
   - Add note at bottom: "Testimonials reflect real user experiences. Names omitted for privacy."

2. "SAVE 40+ HOURS": Read components/sections/why-section.tsx. Find the "Save 40+ Hours" claim. Replace with "Save significant time" or "Cut your research time" — no specific numbers without data.

3. VISA DETAIL DISCLAIMER: Read components/visa/VisaDetailContent.tsx. If this file exists and is used, add a disclaimer banner at the top.

4. SETTINGS BUTTON: Read components/visa/dashboard/DashboardClient.tsx. Find the Settings button/icon. If it has no onClick handler, wire it to open a settings sheet/dialog. Check if StateDashboard.tsx already has a Settings Sheet that can be reused.

5. ERROR PAGE i18n: Check a few error.tsx files. If they have hardcoded "Something went wrong" / "Try again", add useTranslations with simple keys. Add error.title and error.retry keys to all 3 message files (en/ja/zh-tw).

After all changes, run: npm run build

---

### CYCLE 6 -- GATE

After all 4 agents return, run (Bash):
npm run build && npm run lint
Fix errors yourself. Commit:
git add -A && git commit -m "fix: UX bugs (logo overlap, footer contrast, mobile grid, salary threshold), locale links, dashboard i18n, legal cleanup"

---

## CYCLE 6 -- AUDIT

Spawn 2 audit agents IN PARALLEL:

### Audit Agent 1: "ux-auditor"
Prompt:

Dog-food the codebase as Linh (Vietnamese, 29, E-7 holder). Read the CURRENT code for each page in order:

1. app/[lang]/[country]/visa/page.tsx — Is the situation grid 2-column on mobile? Are cards compact?
2. components/visa/landing/AlreadyHaveVisa.tsx — Is the label clear? Does it show dashboard + path simulator links?
3. components/visa/journey/VisaJourneyPage.tsx — Does "Back to Visa Guide" still overlap with the header?
4. components/visa/journey/steps/StepQualify.tsx — Does the salary check show actual numbers?
5. components/footer.tsx — Is the text visible? Good contrast?
6. Check 5 random components for bare /visa/ links without locale prefix
7. Check DashboardClient.tsx — Is the Settings button functional?
8. Check error.tsx files — Are they translated?
9. Check social-proof-section.tsx — Are testimonials anonymous?

For each: PASS/FAIL with evidence. Score /100. Write to docs/cycle6-audit-ux.md.

### Audit Agent 2: "completeness-check"
Prompt:

Check ALL 17 remaining issues from FINAL-AUDIT-REPORT.md against the CURRENT code.

For each of the 17 issues, read the relevant file and report:
- FIXED (with file path evidence)
- NOT FIXED (what remains)
- PARTIAL (what is done vs missing)

Also check these new issues found during dog-fooding:
18. "Back to Visa Guide" overlaps logo — components/visa/journey/VisaJourneyPage.tsx
19. Footer text nearly invisible — components/footer.tsx
20. Mobile grid single-column — app/[lang]/[country]/visa/page.tsx
21. "Already have a visa?" unclear — components/visa/landing/AlreadyHaveVisa.tsx
22. Salary threshold missing numbers — components/visa/journey/steps/StepQualify.tsx

Write to docs/cycle6-audit-completeness.md.

---

### CYCLE 6 -- SYNTHESIS

Read both reports yourself. Write cycle6-synthesis.md: UX score, completeness %, top priorities for Cycle 7.

---

# ============================================================
# CYCLE 7: FINAL POLISH + TYPE SAFETY
# Goal: Close every remaining issue, clean code, final quality
# Expected time: ~1.5 hours
# ============================================================

## CYCLE 7 -- IMPLEMENT

Read docs/cycle6-synthesis.md and docs/cycle6-audit-completeness.md. Then spawn these 3 agents IN PARALLEL:

### Agent 1: "cycle6-fixes"
Prompt for this agent:

Read docs/cycle6-audit-ux.md and docs/cycle6-audit-completeness.md. Fix every issue marked as FAIL or NOT FIXED.

For each specific finding, make the fix. Prioritize:
1. Any remaining bare locale links
2. Any remaining hardcoded English strings in visible UI
3. Any visual bugs (overlap, contrast, spacing)

After all fixes, run: npm run build

### Agent 2: "type-safety-polish"
Prompt for this agent:

Final code quality pass. Read CLAUDE.md first.

1. AS-ANY CASTS: Grep for "as any" (exclude node_modules). Replace with proper types or add eslint-disable comment with explanation.

2. KEY={INDEX}: Grep for key={index} or key={i}. For static arrays, acceptable. For dynamic/filtered arrays, add unique keys.

3. CONSOLE.ERROR: Grep for console.error. Ensure error objects are serialized: console.error("msg", error instanceof Error ? error.message : String(error))

4. QUIZ NATIONALITIES: Read data/quiz/questions.json. Add Thailand, Brazil, Russia if missing.

5. PACKAGE.JSON: Read package.json. If name is "my-v0-project", change to "localnomad-website".

After all changes, run: npm run build

### Agent 3: "accessibility-polish"
Prompt for this agent:

You are doing an accessibility pass on the LocalNomad website. Read CLAUDE.md first.

1. FOOTER CONTRAST: Re-verify components/footer.tsx has adequate text contrast. All text should be at least text-foreground/60. Links should have visible hover states.

2. BUTTON TOUCH TARGETS: Read components/visa/journey/steps/StepQualify.tsx. The Yes/No buttons should have minimum 44px touch targets on mobile. If padding is less than py-2 px-4, increase it.

3. ARIA LABELS: Check the main interactive components for missing aria-labels:
   - header.tsx: mobile menu button needs aria-label="Open menu"
   - language-switcher.tsx: needs aria-label="Select language"
   - visa-path-simulator.tsx: step indicators need aria-current="step"

4. FOCUS INDICATORS: Check globals.css for :focus-visible styles. If missing, add:
   :focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

5. SKIP NAVIGATION: Add a skip-to-content link as the first element in the layout:
   <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded">Skip to content</a>
   And add id="main-content" to the main content wrapper.

After all changes, run: npm run build

---

### CYCLE 7 -- GATE

After all 3 agents return, run (Bash):
npm run build && npm run lint
Fix errors yourself. Commit:
git add -A && git commit -m "fix: remaining audit issues, type safety, accessibility, final polish"

---

## CYCLE 7 -- FINAL AUDIT

Spawn 2 audit agents IN PARALLEL:

### Final Audit 1: "final-user"
Prompt:

You are Linh. Vietnamese, 29, E-7-1 holder, 4 months to expiry. This is the ABSOLUTE FINAL quality gate. Be ruthless.

Walk through every page in the codebase:
1. Landing page (app/[lang]/page.tsx) — clear, inviting?
2. Country hub — obvious next step?
3. Visa landing — situation grid intuitive? Mobile layout good? "Already have visa" clear?
4. E-7 detail page — no logo overlap? Salary numbers visible? Accordion smooth?
5. Path simulator — works? Disclaimer visible?
6. Dashboard — settings functional? i18n complete? Disclaimer present?
7. Compare — works smoothly?
8. Footer — text visible? Disclaimer present?
9. Error pages — translated?
10. Check 5 random links for locale awareness

Score /100 (5 x 20). Target: 88+.
Write to docs/FINAL-UX-AUDIT.md.

### Final Audit 2: "final-tech"
Prompt:

Final technical audit. Check everything.

1. npm run build — passes with 0 errors?
2. Count "use client" directives
3. Grep for "as any" — target 0-2
4. Grep for bare /visa/ links without locale prefix — target 0
5. Grep for hardcoded English in dashboard components — target: all translated
6. Check all 22 issues (17 original + 5 dog-fooding) — count fixed
7. Is package.json name "localnomad-website"?
8. Do error.tsx files have i18n?
9. Are testimonials anonymous?
10. Is "Save 40+ Hours" claim removed?
11. Is footer text contrast adequate?
12. Is mobile grid 2-column?

Score 0-100. Target: 92+.
Write to docs/FINAL-TECH-AUDIT.md.

---

### FINAL SYNTHESIS

Read both final audit reports. Write docs/FINAL-CONTINUATION-REPORT.md:

# LocalNomad Final Continuation Report

## Score History
| Metric | Baseline | After Cycle 3 | After Cycle 5 | After Cycle 7 | Target |
|--------|----------|---------------|---------------|---------------|--------|
| User | 32/100 | 74/100 | [if known] | [cycle7] | 88+ |
| Technical | 38/100 | 80/100 | [if known] | [cycle7] | 92+ |
| Legal | RED | YELLOW | [if known] | [cycle7] | GREEN |

## What Shipped
[Complete list]

## Remaining Issues
[Honest list — if any]

## Recommended Next Steps
[Top items for future]

## Dog-Fooding Bugs Fixed
[List of 5 bugs found during live testing]

Output a final summary confirming all cycles complete.

---

## GLOBAL RULES

### Files You Must Not Modify
- components/ui/* (shadcn/ui managed)
- node_modules/*
- .env.local (secrets)

### Conventions
- Files: kebab-case.tsx
- Components: PascalCase
- cn() from @/lib/utils for conditional classes
- @/ path alias for imports
- Server components by default
- Barrel exports (index.ts) for feature folders

### Legal Bright Lines
CAN: Display requirements, matching quizzes, date calculators, sell info products
MUST NEVER: Say "you are eligible", file for users, store HiKorea creds, broker for fee

### Error Recovery
- Agent fails? Retry ONCE. Fails again? Log it, move on.
- Build fails at GATE? Fix it yourself. No re-spawning.
- File conflicts? Prefer later-numbered agent, reconcile manually.
- NEVER stop. Complete ALL cycles.
