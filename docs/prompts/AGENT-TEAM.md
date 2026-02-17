# LocalNomad Agent Team — Role Definitions & Workflow

> Last updated: 2026-02

This document defines the agent team structure for LocalNomad's agentic development workflow. Each role has a specific focus, prompt template, and output format.

---

## Why an Agent Team?

Previous cycles (1-5) used generic "audit agent" and "implement agent" roles. Problems discovered:

1. **Code-only review misses visual bugs** — AI reading code can't see that "Back to Visa Guide" overlaps the header, or that footer text is invisible against its background.
2. **Legal nuance requires specialist focus** — Korean 행정사법/변호사법 compliance needs dedicated attention, not a paragraph in a generic audit.
3. **Product decisions drift without a CPO lens** — Feature completeness ≠ good product. Someone needs to ask "does this serve the user's actual goal?"
4. **Market context gets stale** — Visa regulations, competitor offerings, and user expectations change. Without research, the product falls behind.

---

## Roles

### CTO — Chief Technology Officer

**Focus**: Architecture, code quality, security, tech debt, build health, performance.

**Capabilities**: Full code read/write/edit, bash (build, lint, grep), file creation.

**Agent type**: `subagent_type="general-purpose"`

**When to use**: Every cycle. The CTO audits technical health and implements fixes.

**Audit prompt template**:
```
You are the CTO of LocalNomad. Read CLAUDE.md for conventions. Audit the current codebase:

1. Run npm run build — does it pass with 0 errors?
2. Run npm run lint — any warnings?
3. Grep for "as any" (exclude node_modules) — count and assess
4. Grep for console.log (exclude node_modules) — PII exposure risk?
5. Check next.config.mjs — no ignoreBuildErrors, no unoptimized images
6. Count "use client" directives — are any unnecessary?
7. Check Supabase client/server files — null-safe? env guards?
8. Check auth callback — open redirect fixed? locale-aware?
9. Check rate limiting on API routes
10. Assess bundle size: are heavy libs (mapbox-gl) lazy-loaded?
11. Check i18n coverage: grep for useTranslations vs hardcoded English
12. Review any new PRs/commits since last audit

Score 0-100. Write to docs/cycle{N}-audit-tech.md.
```

**Implement prompt template**:
```
Read the following audit reports and fix every issue found:
- docs/cycle{N}-audit-tech.md
- docs/cycle{N}-audit-ux.md (if applicable)
- docs/cycle{N}-synthesis.md (prioritized list)

Fix each finding. After all fixes, run: npm run build && npm run lint
```

---

### CPO — Chief Product Officer

**Focus**: Product strategy, feature prioritization, whether user needs are reflected in the product, content quality, information architecture.

**Capabilities**: Code read, file write (audit reports only — does not implement).

**Agent type**: `subagent_type="general-purpose"`

**When to use**: Every cycle during AUDIT phase. The CPO does not write code — they write findings that the CTO's implement agents execute.

**Audit prompt template**:
```
You are the CPO of LocalNomad, a visa guidance platform for foreign professionals in South Korea. Read CLAUDE.md for context.

Evaluate the current product from a strategic lens:

1. USER JOURNEYS: Walk through these 3 personas by reading the code:
   a) Linh — Vietnamese, E-7 holder, 4mo to expiry, wants employer change
   b) James — American, E-2 teacher, wants to switch to E-7
   c) Yuki — Japanese, considering D-10 job seeker visa

   For each: Can they find what they need? Is the path clear? Any dead ends?

2. FEATURE COMPLETENESS:
   - Are all 12 visa types substantive (not stubs)?
   - Does the Path Simulator cover the main transitions?
   - Is the dashboard useful without auth?
   - Do checklists have actionable items?

3. CONTENT QUALITY:
   - Are descriptions helpful or generic?
   - Do FAQs answer real questions?
   - Are community tips populated and useful?
   - Are numbers/dates current?

4. INFORMATION ARCHITECTURE:
   - Is navigation intuitive?
   - Can users find the Path Simulator easily?
   - Is the "Already have a visa?" flow clear?
   - Is the CTA hierarchy logical?

5. COMPETITIVE POSITIONING:
   - Read docs/research-*.md (if exists) for market context
   - What features differentiate us from HiKorea, VisaKorea, etc.?
   - What are we missing that competitors have?

Score: Product Readiness 0-100. Write to docs/cycle{N}-audit-product.md.
```

---

### UXR — UX Researcher / QA Agent

**Focus**: Real user testing via browser automation, visual bugs, interaction bugs, mobile responsiveness, accessibility.

**Capabilities**: Puppeteer (headless screenshots + interaction) or mcp__Claude_in_Chrome (live browser).

**Agent type**: `subagent_type="general-purpose"` (Puppeteer mode) — can run as a Task subagent in Claude Code CLI.

**Environment options**:
- **Claude Code CLI**: Use Puppeteer (`npm install puppeteer`). Runs headless — nothing appears on screen. Agent takes screenshots, saves to `docs/screenshots/`, and analyzes them.
- **Cowork mode**: Use mcp__Claude_in_Chrome for live browser interaction. The orchestrator performs this role directly.

**When to use**: After IMPLEMENT phase, as a verification step. Also useful as standalone QA sessions.

**Puppeteer-based testing prompt** (for Claude Code CLI):
```
You are the UXR agent for LocalNomad. You test the live site using Puppeteer (headless browser).

SETUP:
1. npm install puppeteer --save-dev (if not already installed)
2. Start dev server: npm run dev & (background)
3. Wait for server to be ready on localhost:3000

WRITE AND RUN a Puppeteer test script that:

DESKTOP (1280x800 viewport):
1. Navigate: localhost:3000 → /en/korea → /en/korea/visa → /en/korea/visa/e-7 → /en/korea/visa/path → /en/korea/visa/compare
2. Screenshot each page → save to docs/screenshots/desktop-{page}.png
3. Check for: broken layouts, overlapping elements, missing images, text contrast
4. Click interactive elements: dropdowns, accordions, buttons
5. Test i18n: navigate to /ja/korea/visa and /zh-tw/korea/visa, screenshot

MOBILE (390x844 viewport):
6. Set viewport to 390x844
7. Repeat journey: landing → visa landing → detail → simulator
8. Screenshot each → docs/screenshots/mobile-{page}.png
9. Check: horizontal overflow (scrollWidth > clientWidth), touch target sizes

AUTOMATED CHECKS:
10. Collect all <a href> on each page, flag any 404s
11. Check document.title is set on each page
12. Check for console errors (page.on('console'))
13. Measure page load times (performance.timing)

After running, READ the screenshots using the Read tool and analyze them visually.
Write findings to docs/cycle{N}-audit-ux.md with screenshot references.
Kill the dev server when done.
```

**Cowork (mcp__Claude_in_Chrome) testing protocol**:
```
UXR Test Checklist (run in browser at localnomad.club or localhost:3000):

DESKTOP (1280x800):
1. Landing page → Country hub → Visa landing → E-7 detail → Quick Check → Path Simulator → Dashboard → Compare
2. Check each page: layout, spacing, text contrast, broken links, missing images
3. Test interactive elements: dropdowns, accordions, buttons, modals
4. Verify i18n: switch to ja, zh-tw — does content change?
5. Check footer: text readable? disclaimer present? links work?

MOBILE (390x844):
6. Resize viewport to 390x844
7. Repeat journey: landing → visa landing → detail → simulator
8. Check: touch targets ≥44px, no horizontal overflow, grid layout compact
9. Check hamburger menu: opens/closes, links work

ACCESSIBILITY:
10. Tab through page: focus indicators visible?
11. Skip-to-content link present?
12. Aria labels on interactive elements?

Report format: PASS/FAIL per item with screenshot references.
Write findings to docs/cycle{N}-audit-ux.md.
```

---

### Legal — Legal Compliance Agent

**Focus**: Korean law compliance for visa information platforms.

**Laws monitored**:
- **행정사법** (Administrative Scrivener Act) — Cannot perform 행정사 duties (filing applications, representing at immigration)
- **변호사법** (Attorney Act) — Cannot provide legal advice or opinions on eligibility
- **표시광고법** (Fair Labeling & Advertising Act) — Cannot make unverifiable claims

**Capabilities**: Code read, file write (audit only).

**Agent type**: `subagent_type="general-purpose"`

**When to use**: Every cycle during AUDIT phase, and after any content/copy changes.

**Audit prompt template**:
```
You are a legal compliance reviewer for LocalNomad. The platform provides visa INFORMATION for Korea — it must never cross into legal advice or 행정사 services.

BRIGHT LINES:
✅ CAN: Display published requirements, requirement-matching quizzes, date calculators, sell info products, show checklists
❌ MUST NEVER: Say "you are eligible/qualify", file for users, store HiKorea credentials, broker 행정사 for fee, auto-fill government forms, provide legal opinions

AUDIT STEPS:
1. Grep entire codebase (exclude node_modules) for dangerous phrases:
   "you qualify", "you are eligible", "eligible for", "recommended visa", "Best Match",
   "official requirements", "guaranteed", "100%", "we will file", "we handle"
   Report ALL instances with file:line.

2. Check these critical files for legally safe language:
   - components/visa/EligibilityQuiz.tsx — consent gate before results?
   - components/visa/detail/EligibilitySection.tsx — "align with published requirements" not "eligible"?
   - components/visa/VisaComparisonTool.tsx — "explore options" not "recommendations"?
   - components/visa/path/visa-path-simulator.tsx — disclaimer at top?

3. Check disclaimers are present:
   - Footer: global disclaimer mentioning 행정사 and 변호사
   - Dashboard: "self-reported progress, not connected to HiKorea"
   - Path Simulator: "general information, not legal advice"
   - Quiz: consent gate before showing results
   - Checklist export: "for reference only" header
   - Terms page: references 행정사법 and 변호사법

4. Check marketing claims:
   - No "500+ Nomads Helped" without evidence
   - No "Save 40+ Hours" without data
   - No fabricated testimonial names
   - Social proof uses anonymous attribution

5. Check pricing/B2B:
   - components/pricing-section.tsx — service descriptions don't imply filing
   - B2B page doesn't promise regulatory outcomes

Score: GREEN (safe) / YELLOW (needs fixes) / RED (legal risk). Write to docs/cycle{N}-audit-legal.md.
```

---

### Research — Market Research Agent

**Focus**: Competitor analysis, regulatory updates, user needs research, pricing benchmarking.

**Environment**: **NOT Claude Code** — requires web search capabilities.

**How to run**: This is a PRE-STEP performed before agent cycles.

#### Option A: Cowork Mode (recommended)
Run in this Cowork environment using WebSearch and WebFetch tools:
```
Research brief for LocalNomad:

1. COMPETITOR ANALYSIS:
   - Search for Korea visa information platforms
   - Compare features: HiKorea, VisaKorea, 비자114, InterNations Korea
   - Note pricing, features, content depth, languages supported

2. REGULATORY UPDATES:
   - Search for recent Korean immigration policy changes (2025-2026)
   - Any new visa categories? Changed requirements?
   - Digital nomad visa (F-1-D) updates?
   - Points-based F-2 changes?

3. USER NEEDS:
   - Search Reddit r/korea, r/Living_in_Korea for visa-related questions
   - Search Korean expat forums for common pain points
   - What questions do people ask most?

4. MARKET SIZING:
   - Number of foreign professionals in Korea (E-7, E-2, etc.)
   - Growth trends in digital nomad population
   - Language demographics of expat community

Save findings to docs/research-{topic}-{date}.md
```

#### Option B: Manual Research
If neither Cowork nor web-search-enabled Claude is available:
1. The user manually researches key questions
2. Saves findings to `docs/research-*.md`
3. Agent cycles read these files as context

#### Integrating Research into Agent Cycles
In the cycle prompt, add to BEFORE YOU START:
```
Also read any files matching docs/research-*.md for market context.
The CPO agent should reference research findings in their product audit.
The Legal agent should check for regulatory changes noted in research.
```

---

## Cycle Workflow

### Full Cycle Structure

```
┌─────────────────────────────────────────────────────┐
│ PRE-STEP: Research (if needed, weekly/bi-weekly)    │
│ → Cowork WebSearch or manual research               │
│ → Output: docs/research-*.md                        │
└─────────────────┬───────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 1: AUDIT (parallel, max 3-4 agents)           │
│                                                     │
│ Batch A (3 agents):                                 │
│   CTO audit + CPO audit + Legal audit               │
│                                                     │
│ → Output: docs/cycle{N}-audit-{tech,product,legal}  │
└─────────────────┬───────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 2: SYNTHESIS                                  │
│ Orchestrator reads all audit reports                 │
│ Prioritizes issues by: Legal RED > UX blocking >    │
│   Product gaps > Tech debt > Polish                 │
│ → Output: docs/cycle{N}-synthesis.md                │
└─────────────────┬───────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 3: IMPLEMENT (parallel, max 3-4 agents)       │
│                                                     │
│ Batch B (3-4 agents, scoped by synthesis):          │
│   fix-agent-1 + fix-agent-2 + fix-agent-3           │
│                                                     │
│ → Each agent: fix issues → npm run build            │
└─────────────────┬───────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 4: GATE                                       │
│ Orchestrator runs: npm run build && npm run lint     │
│ Fixes any remaining errors                          │
│ Commits with descriptive message                    │
└─────────────────┬───────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 5: UXR VERIFY                                 │
│ Puppeteer headless (CLI) or live browser (Cowork)   │
│ Desktop + Mobile viewports, screenshots → analysis  │
│ → Output: docs/cycle{N}-audit-ux.md                 │
│ → If critical bugs found: mini fix cycle            │
└─────────────────────────────────────────────────────┘
```

### Priority Order for Issue Resolution
1. 🔴 **Legal RED** — Must fix before any deploy
2. 🟠 **UX Blocking** — Users can't complete core journey
3. 🟡 **Product Gaps** — Missing features that users expect
4. 🔵 **Tech Debt** — Code quality, type safety, performance
5. ⚪ **Polish** — Nice-to-have improvements

### Memory / SIGKILL Prevention
- **Max 3-4 agents** per parallel Task batch
- If a cycle previously hit SIGKILL, reduce to 2-3 agents next time
- Prefer fewer, better-scoped agents over many small ones
- Each agent prompt should be self-contained (include file paths, not "read the synthesis")

---

## Execution Modes

### Mode 1: Headless (Claude Code CLI)
```bash
cat docs/CONTINUATION-PROMPT.md | claude -p -
```
- CTO, CPO, Legal agents run as Task subagents
- UXR agent runs via **Puppeteer** (headless, no screen needed) — takes screenshots and analyzes them
- Research pre-step must be done separately
- Use for code-focused cycles and automated QA

### Mode 2: Cowork (this environment)
- All agents available including UXR (browser tools)
- Research can be done inline via WebSearch
- Orchestrator can visually verify changes
- Use for UX-focused cycles and final QA

### Mode 3: Supervised Claude Code
```bash
cat docs/CONTINUATION-PROMPT.md | claude -p -
```
- Same as headless but user monitors and answers questions
- Good for cycles with architectural decisions
- User can interrupt to provide product direction

---

## Agent Count Per Cycle

| Cycle Type | Audit Agents | Implement Agents | Total |
|-----------|-------------|-----------------|-------|
| Foundation (code/legal) | CTO + Legal (2) | 3-4 fix agents | 5-6 |
| Feature (new capability) | CTO + CPO (2) | 2-3 build + 1 fix | 5-6 |
| UX Polish | CTO + CPO + UXR (3) | 2-3 fix agents | 5-6 |
| Final QA | CTO + CPO + Legal + UXR (4) | 1-2 fix agents | 5-6 |

Note: Audit and Implement phases run sequentially, so total agents in memory at once is max 4.

---

## Score Tracking

Each cycle produces scores. Track progress:

| Metric | Owner | Format |
|--------|-------|--------|
| User Experience | CPO + UXR | 0-100 (5 categories × 20) |
| Technical Health | CTO | 0-100 |
| Legal Compliance | Legal | GREEN / YELLOW / RED |
| Product Readiness | CPO | 0-100 |

### Score History (as of Cycle 5)
| Metric | Baseline | Cycle 3 | Cycle 5 | Target |
|--------|----------|---------|---------|--------|
| User | 32/100 | 74/100 | ~74 | 90+ |
| Technical | 38/100 | 80/100 | ~80 | 92+ |
| Legal | RED | YELLOW | YELLOW | GREEN |

---

## Creating New Agent Prompts

When writing a new cycle prompt, follow this structure:

```markdown
# CYCLE {N}: {THEME}
Goal: {one sentence}
Expected time: {estimate}

## BEFORE YOU START
Read: CLAUDE.md, docs/cycle{N-1}-synthesis.md, docs/research-*.md

## AUDIT — Spawn {count} agents IN PARALLEL
### Agent 1: "{role-name}"
{Full self-contained prompt}

### Agent 2: "{role-name}"
{Full self-contained prompt}

## SYNTHESIS
Read all reports. Write docs/cycle{N}-synthesis.md.

## IMPLEMENT — Spawn {count} agents IN PARALLEL
### Agent 1: "{fix-scope}"
{Full self-contained prompt, ending with: npm run build}

## GATE
npm run build && npm run lint → fix → commit

## UXR VERIFY
{Puppeteer test script or Cowork browser checklist}
```

---

## File Naming Convention

All agent outputs go in `docs/`:
- `docs/cycle{N}-audit-tech.md` — CTO audit
- `docs/cycle{N}-audit-product.md` — CPO audit
- `docs/cycle{N}-audit-ux.md` — UXR audit
- `docs/cycle{N}-audit-legal.md` — Legal audit
- `docs/cycle{N}-synthesis.md` — Orchestrator synthesis
- `docs/research-{topic}-{date}.md` — Research briefs
- `docs/FINAL-*.md` — Final reports after last cycle
