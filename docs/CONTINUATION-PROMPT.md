# LocalNomad — Cycle 6-7 Prompt (Agent Team v2)

2 cycles using CTO/CPO/UXR/Legal agent team.
Expected time: 4-6 hours.

---

## How to Run

```bash
cat docs/CONTINUATION-PROMPT.md | claude -p -
```

IMPORTANT: Use pipe, not $(cat ...), to avoid shell backtick corruption.

---

You are the ORCHESTRATOR for LocalNomad, a Next.js 16 visa guidance platform at localnomad.club.

5 cycles completed. Current scores: User 74/100, Technical 80/100, Legal YELLOW.
Your job: run 2 cycles using the agent team defined in docs/AGENT-TEAM.md.

## EXECUTION MODE: SUPERVISED

ASK the user when:
- A decision has significant trade-offs
- Multiple valid approaches exist affecting UX or architecture
- Something seems risky or could break existing functionality

DO NOT ask for:
- Trivial decisions, file permissions, build error fixes
- Whether to proceed to the next cycle — always proceed

If no response, choose the safer option and document in the commit message.
ALWAYS complete ALL cycles.

## HOW TO USE AGENTS

You are the ORCHESTRATOR. Dispatch work via the Task tool.
"IN PARALLEL" = ONE message with MULTIPLE Task calls.
ALL agents use `subagent_type="general-purpose"`.
Max 3-4 agents per parallel batch (prevents SIGKILL).

## BEFORE YOU START

Read these files:
- `CLAUDE.md` — conventions, legal bright lines, agent team summary
- `docs/AGENT-TEAM.md` — role definitions and prompt templates
- `docs/FINAL-AUDIT-REPORT.md` — 17 remaining issues, score history
- `docs/research-*.md` — market research (if any exist)

ALREADY DONE (do NOT redo):
- hero-section.tsx: mounted/setMounted removed, CSS-only animate-fade-up
- mapbox-gl CSS: moved to SeoulNeighborhoodMap.tsx
- lazy-map.tsx: exists with dynamic() import
- Geist_Mono: removed from layout
- Font display: "swap" set
- 15 loading.tsx + 15 error.tsx: created
- Legal disclaimers: footer, quiz consent gate, path simulator, dashboard
- Visa Path Simulator: fully built (30+ paths, 3-step wizard, URL state, 3 languages)

IMPORTANT: next.config.mjs is clean. Do NOT add ignoreBuildErrors.

---

# ============================================================
# CYCLE 6: AUDIT → IMPLEMENT → GATE → UXR VERIFY
# Goal: Fix UX bugs from dog-fooding + close critical audit issues
# ============================================================

## CYCLE 6 — PHASE 1: AUDIT

Spawn 3 agents IN PARALLEL:

### Agent 1: "cto-audit"

```
You are the CTO of LocalNomad. Read CLAUDE.md for conventions.

Audit the current codebase:
1. Run npm run build — 0 errors?
2. Run npm run lint — warnings?
3. Grep for "as any" (exclude node_modules) — count
4. Grep for console.log (exclude node_modules) — PII risk?
5. Check next.config.mjs — no ignoreBuildErrors?
6. Count "use client" directives — any unnecessary?
7. Check Supabase client/server — null-safe? env guards?
8. Check auth callback — open redirect fixed? locale-aware?
9. Grep for bare links: href="/visa, href="/bundles, href="/areas without locale prefix — count all
10. Check i18n coverage: grep useTranslations vs hardcoded English in components/visa/dashboard/
11. Check package.json — name still "my-v0-project"?
12. Check if Puppeteer is in devDependencies (needed for UXR)

Score 0-100. Write to docs/cycle6-audit-tech.md.
```

### Agent 2: "cpo-audit"

```
You are the CPO of LocalNomad, a visa guidance platform for foreign professionals in South Korea. Read CLAUDE.md.

Evaluate the product:

1. USER JOURNEYS — walk through by reading code:
   a) Linh — Vietnamese, E-7 holder, 4mo to expiry, wants employer change
   b) James — American, E-2 teacher, wants to switch to E-7
   For each: Can they find what they need? Any dead ends?

2. DOG-FOODING BUGS (found in real browser testing):
   - "Back to Visa Guide" overlaps logo on detail pages (VisaJourneyPage.tsx)
   - Footer text nearly invisible (low contrast)
   - Mobile: situation cards single-column, excessive scrolling
   - "Already have a visa?" button intent unclear
   - Quick Check salary threshold shows no actual number

3. FEATURE GAPS:
   - Is Settings button on dashboard functional?
   - Are testimonials using real or fabricated names?
   - Is "Save 40+ Hours" claim substantiated?
   - Are error.tsx files translated?
   - How much of dashboard is still hardcoded English?

4. INFORMATION ARCHITECTURE:
   - Is navigation intuitive?
   - Can users find Path Simulator easily?
   - Is the CTA hierarchy logical?

Score: Product Readiness 0-100. Write to docs/cycle6-audit-product.md.
```

### Agent 3: "legal-audit"

```
You are a legal compliance reviewer for LocalNomad. Read CLAUDE.md for legal bright lines.

Korean law: 행정사법 (Admin Scrivener Act), 변호사법 (Attorney Act), 표시광고법 (Fair Labeling Act).

AUDIT:
1. Grep entire codebase (exclude node_modules) for:
   "you qualify", "you are eligible", "eligible for", "recommended visa", "Best Match",
   "official requirements", "guaranteed", "100%", "we will file", "we handle", "500+"
   Report ALL instances with file:line.

2. Check critical files:
   - components/visa/EligibilityQuiz.tsx — consent gate?
   - components/visa/VisaComparisonTool.tsx — "explore options" not "recommendations"?
   - components/visa/path/visa-path-simulator.tsx — disclaimer at top?
   - components/visa/OnboardingWizard.tsx — disclaimer after match scores?

3. Check disclaimers present:
   - Footer, Dashboard, Path Simulator, Quiz, Checklist export, Terms page

4. Marketing claims:
   - components/sections/social-proof-section.tsx — fabricated names? ("Sarah M.", "James K.")
   - components/sections/why-section.tsx — "Save 40+ Hours" without data?

Score: GREEN / YELLOW / RED. Write to docs/cycle6-audit-legal.md.
```

---

## CYCLE 6 — PHASE 2: SYNTHESIS

Read all 3 audit reports yourself:
- docs/cycle6-audit-tech.md
- docs/cycle6-audit-product.md
- docs/cycle6-audit-legal.md

Prioritize: Legal RED > UX Blocking > Product Gaps > Tech Debt > Polish.
Write docs/cycle6-synthesis.md with a numbered list of issues to fix.

---

## CYCLE 6 — PHASE 3: IMPLEMENT

Based on synthesis, spawn 3 agents IN PARALLEL:

### Agent 1: "ux-fixes"

```
You are fixing UX bugs found during dog-fooding. Read CLAUDE.md first.

BUG 1 — "Back to Visa Guide" overlaps logo:
- Read components/visa/journey/VisaJourneyPage.tsx
- Add pt-20 or mt-16 to page container so back link sits below fixed header

BUG 2 — Footer text invisible:
- Read components/footer.tsx
- Change dim text colors to text-foreground/60 or text-foreground/70
- Copyright and links at least text-foreground/50

BUG 3 — Mobile situation cards single-column:
- Read app/[lang]/[country]/visa/page.tsx
- Change grid to grid-cols-2 on mobile too. Reduce card padding to p-4.

BUG 4 — "Already have a visa?" unclear:
- Read components/visa/landing/AlreadyHaveVisa.tsx
- Change to "Already in Korea? Find your next step"
- Show two CTAs: "Track my visa progress" → dashboard, "Explore visa transitions" → /visa/path

BUG 5 — Salary threshold missing numbers:
- Read components/visa/journey/steps/StepQualify.tsx
- Read data/visas/en/e-7.json for actual threshold
- Show "Annual salary of 30M+ KRW (or GNI equivalent)" for E-7

After all changes: npm run build
```

### Agent 2: "locale-and-i18n"

```
You are fixing locale links and i18n gaps. Read CLAUDE.md first.

PART A — LOCALE LINKS:
Grep for: href="/visa, href="/bundles, href="/areas, href="/auth (without locale prefix).
Fix ALL bare links in:
- components/visa/VisaComparisonTool.tsx
- components/visa/DocumentProgress.tsx
- components/visa/journey/steps/StepAfterApproval.tsx
- components/visa/dashboard/NextActionCard.tsx (6+ bare links)
- Any others found by grep

Pattern (client): useLocale() → href={`/${locale}/korea/visa/...`}
Pattern (server): params.lang → href={`/${lang}/${country}/visa/...`}

PART B — DASHBOARD i18n:
Check CURRENT state first. Only extract strings still hardcoded.
- components/visa/StateDashboard.tsx
- components/visa/dashboard/DashboardClient.tsx
- components/visa/VisaComparisonTool.tsx
- components/visa/dashboard/NextActionCard.tsx

Add keys to messages/en.json, messages/ja.json, messages/zh-tw.json.
Replace with useTranslations(). Japanese: polite form. Chinese: Taiwan-standard.

After all changes: npm run build
```

### Agent 3: "legal-fixes"

```
You are doing legal cleanup. Read CLAUDE.md for bright lines.

1. TESTIMONIALS: Read components/sections/social-proof-section.tsx.
   Replace "Sarah M.", "James K.", "Maria L." with anonymous:
   "E-7 visa holder, Seoul" / "D-2 student, Busan"
   Add note: "Testimonials reflect real user experiences. Names omitted for privacy."

2. "SAVE 40+ HOURS": Read components/sections/why-section.tsx.
   Replace with "Save significant time" — no unsubstantiated numbers.

3. OnboardingWizard DISCLAIMER: Read components/visa/OnboardingWizard.tsx.
   After match scores, add: "These matches compare your answers against published requirements. They do not determine eligibility."

4. SETTINGS BUTTON: Read components/visa/dashboard/DashboardClient.tsx.
   Wire Settings button to open a sheet/dialog. Check if StateDashboard.tsx has one to reuse.

5. ERROR PAGE i18n: Check error.tsx files for hardcoded English.
   Add error.title and error.retry keys to all 3 message files.

6. PACKAGE.JSON: Change name from "my-v0-project" to "localnomad-website" if not already done.

After all changes: npm run build
```

---

## CYCLE 6 — PHASE 4: GATE

After all 3 agents return:
```bash
npm run build && npm run lint
```
Fix errors yourself. Commit:
```bash
git add -A && git commit -m "fix: UX bugs, locale links, dashboard i18n, legal cleanup (cycle 6)"
```

---

## CYCLE 6 — PHASE 5: UXR VERIFY

Spawn 1 agent:

### Agent: "uxr-puppeteer"

```
You are the UXR agent for LocalNomad. Test the site using Puppeteer.

SETUP:
1. npm install puppeteer --save-dev (if not installed)
2. npm run dev & (background, wait for localhost:3000)

WRITE AND RUN a Puppeteer script:

DESKTOP (1280x800):
- Navigate: localhost:3000 → /en/korea → /en/korea/visa → /en/korea/visa/e-7 → /en/korea/visa/path → /en/korea/visa/compare
- Screenshot each → docs/screenshots/desktop-{page}.png
- Check: "Back to Visa Guide" no longer overlaps header
- Check: footer text is visible (not invisible contrast)

MOBILE (390x844):
- Set viewport 390x844
- Navigate same journey
- Screenshot → docs/screenshots/mobile-{page}.png
- Check: situation grid is 2-column
- Check: no horizontal overflow (scrollWidth > clientWidth)

AUTOMATED:
- Collect all <a href> on each page, flag 404s
- Check for console errors
- Measure page load times

READ the screenshots and analyze visually.
Write findings to docs/cycle6-audit-ux.md.
Kill dev server when done.
```

If UXR finds critical bugs: fix them yourself (mini patch), rebuild, recommit.

---

# ============================================================
# CYCLE 7: FINAL POLISH + QUALITY GATE
# Goal: Close every remaining issue. Reach 88+ user, 92+ tech, GREEN legal.
# ============================================================

## CYCLE 7 — PHASE 1: AUDIT

Spawn 3 agents IN PARALLEL:

### Agent 1: "cto-final"

```
Final CTO audit. Be thorough.

1. npm run build — 0 errors?
2. Grep "as any" — target 0-2
3. Grep bare /visa/ links without locale — target 0
4. Dashboard hardcoded English — target 0
5. package.json name = "localnomad-website"?
6. error.tsx files translated?
7. Is mobile grid 2-column?
8. Footer contrast adequate?
9. Settings button functional?
10. Count all 22 issues (17 original + 5 dog-fooding) — how many fixed?

Score 0-100. Write to docs/cycle7-audit-tech.md.
```

### Agent 2: "cpo-final"

```
Final CPO audit. Walk through Linh's full journey:

1. Landing → Korea hub → Visa landing → "What's your situation?" grid
   - Is it 2-column on mobile? Cards compact?
2. Select E-7 → detail page
   - Back link below header? Salary numbers visible?
3. Path Simulator → select E-7 → see options
   - Disclaimer visible?
4. Dashboard → state advancement → settings
   - All translated? Settings works?
5. Footer
   - Text readable? Disclaimer present?
6. "Already have a visa?" section
   - Label clear? Links work?

Score 0-100. Write to docs/cycle7-audit-product.md.
```

### Agent 3: "legal-final"

```
Final legal sweep.

1. Grep for: "you qualify", "you are eligible", "eligible for", "recommended visa",
   "Best Match", "official requirements", "guaranteed", "500+", "Save 40+"
   Target: 0 instances.

2. Check all disclaimers still present (footer, quiz, path simulator, dashboard, checklist, terms)
3. Testimonials anonymous?
4. OnboardingWizard has disclaimer after scores?
5. B2B/pricing descriptions safe?

Score: GREEN / YELLOW / RED. Write to docs/cycle7-audit-legal.md.
```

---

## CYCLE 7 — PHASE 2: SYNTHESIS

Read all 3 reports + docs/cycle6-audit-ux.md (UXR from Cycle 6).
Write docs/cycle7-synthesis.md.

---

## CYCLE 7 — PHASE 3: IMPLEMENT

Spawn 2-3 agents based on synthesis. Fix everything remaining.

### Agent 1: "remaining-fixes"
```
Read docs/cycle7-synthesis.md. Fix every issue marked as NOT FIXED or FAIL.
Prioritize: legal > UX > i18n > code quality.
After all fixes: npm run build
```

### Agent 2: "accessibility"
```
Accessibility pass. Read CLAUDE.md.

1. Footer contrast: all text at least text-foreground/60
2. Button touch targets: minimum 44px (py-2 px-4 minimum)
3. Aria labels: header menu, language switcher, path simulator steps
4. Focus indicators: :focus-visible in globals.css
5. Skip navigation: add skip-to-content link in layout

After all changes: npm run build
```

---

## CYCLE 7 — PHASE 4: GATE

```bash
npm run build && npm run lint
```
Fix errors. Commit:
```bash
git add -A && git commit -m "fix: final polish, accessibility, remaining issues (cycle 7)"
```

---

## CYCLE 7 — PHASE 5: UXR VERIFY + FINAL REPORT

Spawn 1 agent for final UXR:

### Agent: "uxr-final"
```
Final Puppeteer QA. Same setup as Cycle 6 UXR.
Test all pages desktop + mobile. Check all 5 dog-fooding bugs are fixed.
Write to docs/cycle7-audit-ux.md.
Kill dev server when done.
```

Then write docs/CYCLE6-7-FINAL-REPORT.md yourself:

```markdown
# LocalNomad Cycle 6-7 Report (Agent Team v2)

## Score History
| Metric | Baseline | Cycle 3 | Cycle 5 | Cycle 7 | Target |
|--------|----------|---------|---------|---------|--------|
| User | 32/100 | 74/100 | ~74 | [score] | 88+ |
| Technical | 38/100 | 80/100 | ~80 | [score] | 92+ |
| Legal | RED | YELLOW | YELLOW | [score] | GREEN |

## What Shipped (Cycle 6-7)
[list]

## Remaining Issues
[honest list, if any]

## Dog-Fooding Bugs Status
1. Logo overlap — [FIXED/NOT]
2. Footer contrast — [FIXED/NOT]
3. Mobile grid — [FIXED/NOT]
4. "Already have visa" unclear — [FIXED/NOT]
5. Salary threshold — [FIXED/NOT]
```

---

## GLOBAL RULES

### Files You Must Not Modify
- `components/ui/*` — shadcn/ui managed
- `node_modules/*`
- `.env.local`

### Legal Bright Lines
- ✅ CAN: Display requirements, matching quizzes, calculators, checklists
- ❌ NEVER: "you are eligible", file for users, store HiKorea creds, broker for fee

### Error Recovery
- Agent fails → retry ONCE. Fails again → log it, move on.
- Build fails at GATE → fix yourself. No re-spawning.
- File conflicts → prefer later-numbered agent, reconcile manually.
- NEVER stop. Complete ALL cycles.
