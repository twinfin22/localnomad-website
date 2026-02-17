# CYCLE TW-1: Taiwan Visa Dashboard Expansion

> Goal: Extend LocalNomad's visa information platform from Korea-only to Korea + Taiwan, with Taiwan-specific legal safeguards and features.
> Expected time: 2-3 full agent cycles
> Pre-requisite: Research already completed — see `docs/대만 비자 대시보드 조사 결과.txt`

---

## CONTEXT FOR ALL AGENTS

LocalNomad currently has a complete Korean visa dashboard at `/[lang]/korea/visa/` with 12 visa types, quiz engine, path simulator, comparison tool, document checklist, and progress dashboard.

We are extending this to Taiwan (`/[lang]/tw/visa/`). **Taiwan's legal environment is fundamentally different from Korea's.** Key differences every agent must understand:

**Korea**: 행정사법 (individual license) — info platforms have relatively wide latitude if they don't perform 행정사 duties.

**Taiwan**: 이민업무기관 제도 (corporate license) — Immigration Act §56 explicitly regulates "consulting" AND "document drafting" as licensed immigration business. Penalties: NT$200K-1M per violation. 변호사법 §127: up to 1 year imprisonment for unlicensed legal consulting.

**Therefore**: Taiwan quiz CANNOT show match scores/probability. Taiwan pages CANNOT auto-fill government forms. All features must be "information provision" not "consulting."

---

## BEFORE YOU START

Every agent must read these files first:

```
CLAUDE.md                                    # Project conventions
docs/AGENT-TEAM.md                           # Role definitions
docs/대만 비자 대시보드 조사 결과.txt              # Taiwan market research + legal analysis
lib/visa/types.ts                            # Current type definitions
lib/visa/data.ts                             # Current data loader pattern
lib/visa/quiz-engine.ts                      # Current quiz scoring (must change for TW)
app/[lang]/[country]/visa/                   # Current route structure
data/visas/en/                               # Example visa data JSON structure
```

---

## PHASE 1: AUDIT — Spawn 3 agents IN PARALLEL

### Agent 1: "Legal-TW" (Legal Compliance — Taiwan)

```
You are the Legal Compliance Agent for LocalNomad. Your job is to produce a definitive legal compliance guide for the Taiwan visa dashboard expansion.

READ FIRST:
- CLAUDE.md (project rules, especially "Legal Bright Lines" section)
- docs/대만 비자 대시보드 조사 결과.txt (the full research report — read ALL sections, especially "법적 리스크 분석" and "법적으로 안전한 서비스" sections)
- lib/visa/types.ts (current types)
- lib/visa/quiz-engine.ts (current quiz scoring logic)
- components/visa/LegalDisclaimer.tsx (current disclaimers)

YOUR TASK — produce docs/tw-legal-compliance-guide.md with:

1. TAIWAN REGULATORY FRAMEWORK SUMMARY
   - Immigration Act §56: what is "immigration business"? What specific actions are prohibited?
   - Attorney Act §127: where is the line between "legal information" and "legal advice"?
   - PDPA (Personal Data Protection Act): what data can/cannot be stored?
   - How does this differ from Korea's 행정사법/변호사법?

2. FEATURE-BY-FEATURE LEGAL CLASSIFICATION
   For EACH planned feature, classify as GREEN (safe) / YELLOW (needs safeguards) / RED (prohibited):

   a) Situation-based landing page (like Korea's SituationGrid)
   b) Visa information pages (static content about Gold Card, DNV, ARC, etc.)
   c) Document checklist (user self-checks items)
   d) TECO authentication routing guide (which office handles which documents)
   e) Visa comparison tool (side-by-side published requirements)
   f) Visa path simulator (transition routes between visa types)
   g) Eligibility quiz with SCORING (Korea-style: "strong match 85%")
   h) Eligibility quiz with FACT MATCHING ONLY (no scores, just requirement checklist)
   i) 183-day residency counter (tax residency tracker)
   j) Visa run calculator (days remaining + re-entry checklist)
   k) Document auto-fill / form generation
   l) Status tracking via government site scraping
   m) Community forum / user-submitted tips
   n) AI chatbot answering visa questions

3. REQUIRED DISCLAIMERS
   - Draft Taiwan-specific disclaimer text (English + Traditional Chinese)
   - Where must each disclaimer appear? (every page? quiz results only? etc.)
   - How should quiz results be worded to avoid "consulting" classification?
   - Compare with current Korea disclaimers — what needs to be stronger?

4. SAFE LANGUAGE PATTERNS
   Produce a table of:
   | ❌ NEVER say (Taiwan) | ✅ Say instead |
   Example: "You qualify for Gold Card" → "Your profile aligns with the published Gold Card requirements in these areas: ..."

5. IMPLEMENTATION RULES FOR DEVELOPERS
   - Write concrete rules that CTO agents can follow when building Taiwan features
   - These should be added to CLAUDE.md under a new "Taiwan Legal Bright Lines" section

Score: GREEN / YELLOW / RED for overall Taiwan expansion feasibility.
Write output to: docs/tw-legal-compliance-guide.md
```

### Agent 2: "CPO-TW" (Product Design — Taiwan)

```
You are the CPO of LocalNomad. Your job is to design the Taiwan visa dashboard product — what features to build, in what order, and how they differ from Korea.

READ FIRST:
- CLAUDE.md
- docs/대만 비자 대시보드 조사 결과.txt (full research — especially sections on user personas, pain points, and proposed dashboard features)
- All files in components/visa/ (understand current Korea component architecture)
- app/[lang]/[country]/visa/ (current route structure)
- data/visas/en/ (examine 2-3 JSON files to understand data schema)
- lib/visa/types.ts

YOUR TASK — produce docs/tw-product-spec.md with:

1. TAIWAN USER PERSONAS (from research report)
   Map the 3 personas to LocalNomad features:
   - "불안한 신규 진입자" (Nervous Newcomer) — primarily language teachers, students
   - "고효율 추구 골드카드 엘리트" (Gold Card Elite) — high-income professionals
   - "안정을 추구하는 장기 거주자" (Long-Hauler) — APRC seekers
   Which existing Korea features serve each? What's missing?

2. TAIWAN VISA TYPES TO SUPPORT
   Define the initial set (equivalent to Korea's 12 types):
   - Full guides (Phase 1): Gold Card, Digital Nomad Visa, Work ARC, Visitor Visa
   - Full guides (Phase 2): Entrepreneur Visa, Student Visa, APRC
   - Stubs (coming soon): PLUM Blossom Card, Dependent ARC, etc.
   For each: name, category, one-line description, priority level

3. FEATURE MATRIX: KOREA vs TAIWAN
   | Feature | Korea (current) | Taiwan (planned) | Difference & Why |
   Cover: Landing, Quiz, Compare, Path, Checklist, Dashboard, Detail pages
   Explain WHY each feature needs to be different for Taiwan.

4. TAIWAN-ONLY FEATURES (NEW)
   Design spec for each:

   a) TECO Authentication Router
      - User selects: document type + issuing institution/country
      - System shows: responsible TECO office, address, mailing requirements, processing time, fees
      - Data source: public TECO directory
      - Where in the UI: embedded in document checklist per-item

   b) Multi-Agency Workflow Map
      - Visualize: BOCA → MOL → NIA pipeline
      - Show: which agency handles which step, current "ball in court" indicator
      - Where: visa detail page (StepApply section) + dashboard

   c) 183-Day Tax Residency Tracker
      - Input: user enters entry/exit dates
      - Output: days counted, projected tax residency date, tax rate comparison
      - Disclaimer: "Not tax advice. Consult a CPA for your specific situation."
      - Where: dashboard module

   d) Visa Run Calculator
      - Input: visa type, entry date, planned exit dates
      - Output: remaining days, recommended departure window, re-entry checklist
      - Where: standalone page (/tw/visa/visa-run) + dashboard widget

5. QUIZ REDESIGN FOR TAIWAN
   The Korea quiz uses scoring (strong/moderate/possible match). Taiwan cannot do this.
   Design the Taiwan quiz as a "Requirement Filter":
   - Step 1: Nationality (affects visa-free duration)
   - Step 2: Primary goal (work, remote work, study, long-term residence, business)
   - Step 3: Background facts (income, education, employment status)
   - Step 4: Results show ONLY factual alignment:
     "Gold Card — Income requirement: ✅ Met ($5,300/mo minimum) | Education: ✅ Met (PhD) | Field match: ⚠️ Review needed"
   - NO overall scores, NO "recommended" labels, NO probability percentages
   - Each result links to the detail page for more information

6. INFORMATION ARCHITECTURE
   Proposed route structure:
   ```
   /[lang]/tw/visa/           → Landing (situation selector)
   /[lang]/tw/visa/find       → Requirement filter (not "quiz")
   /[lang]/tw/visa/compare    → Comparison tool
   /[lang]/tw/visa/path       → Path simulator (3-agency aware)
   /[lang]/tw/visa/checklist  → Document checklist (with TECO routing)
   /[lang]/tw/visa/dashboard  → Progress dashboard (with 183-day tracker)
   /[lang]/tw/visa/visa-run   → Visa run calculator (TW-only)
   /[lang]/tw/visa/[type]     → Visa detail journey pages
   ```

7. PHASED ROLLOUT PLAN
   - Phase 1 (MVP): Landing + 4 full visa guides + Checklist + Compare
   - Phase 2: Quiz (requirement filter) + Path simulator + TECO router
   - Phase 3: Dashboard + 183-day tracker + Visa run calculator
   - Phase 4: Remaining visa types + community features

Write output to: docs/tw-product-spec.md
```

### Agent 3: "CTO-TW" (Architecture Planning)

```
You are the CTO of LocalNomad. Your job is to plan the technical architecture for extending the platform to support Taiwan alongside Korea.

READ FIRST:
- CLAUDE.md
- lib/visa/types.ts (VisaType, VisaInfo, all interfaces)
- lib/visa/data.ts (data loader — how visa data is imported and served)
- lib/visa/quiz-engine.ts (scoring logic)
- lib/visa/path-data.ts (path simulator data)
- lib/visa/stateMachine.ts
- lib/visa/health-score.ts
- app/[lang]/[country]/visa/ (all page.tsx files — how routes work)
- app/[lang]/[country]/visa/[type]/page.tsx (dynamic visa detail)
- components/visa/ (scan all subdirectories)
- next.config.mjs
- lib/i18n/config.ts (i18n setup)

YOUR TASK — produce docs/tw-architecture-plan.md with:

1. TYPE SYSTEM CHANGES
   Current VisaType is Korea-only ("e-7", "d-10", etc.).
   How to extend for Taiwan without breaking Korea?
   Options:
   a) Prefix approach: "tw-gold-card", "tw-dnv", "kr-e-7"
   b) Separate type: TaiwanVisaType + KoreaVisaType, union as VisaType
   c) Country-scoped type: { country: "kr" | "tw", type: string }
   Recommend ONE approach with rationale. Show the exact type changes.

   Also define new Taiwan-specific interfaces:
   - TECOAuthenticationInfo (office, jurisdiction, address, phone, hours, mailingReqs)
   - AgencyStep (agency: "BOCA" | "NIA" | "MOL", step, description, duration)
   - TaxResidencyDay (date, isInTaiwan, cumulativeDays)
   - VisaRunEntry (entryDate, maxStay, daysUsed, daysRemaining)

2. DATA STRUCTURE
   How should Taiwan visa JSON files be organized?
   - Path: data/visas/{locale}/tw/ or data/visas/tw/{locale}/ ?
   - Schema: Extend VisaInfo or create TaiwanVisaInfo?
   - What new fields does Taiwan need that Korea doesn't?
     (authenticationRequirements, responsibleAgencies, tecoRouting, visaRunRules)
   - Draft a sample gold-card.json skeleton

3. DATA LOADER CHANGES
   Current data.ts imports all Korea JSONs statically. Plan:
   - How to add Taiwan without doubling bundle size
   - Dynamic imports? Country-scoped loading?
   - New functions needed: getTaiwanVisaTypes(), getTaiwanVisaInfo(), etc.
   - Or generic: getVisaTypes(country), getVisaInfo(country, type, locale)

4. ROUTE ARCHITECTURE
   Current: /[lang]/[country]/visa/...
   [country] param already exists — good. What needs to change?
   - generateStaticParams() must include "tw" country
   - page.tsx files must be country-aware (load Korea vs Taiwan data)
   - Which components are country-agnostic (reusable) vs country-specific?

5. COMPONENT REUSE ANALYSIS
   For each component directory, classify:
   | Component | Reusable as-is | Needs country prop | Taiwan-specific new |
   Example:
   - SituationGrid → needs country prop (different situations for TW)
   - DocumentChecklist → reusable as-is (data-driven)
   - VisaFinder (quiz) → needs major refactor (no scoring for TW)
   - DDayPanel → reusable as-is
   - HealthScoreCard → reusable as-is

6. QUIZ ENGINE REFACTOR
   Current quiz-engine.ts uses numerical scoring. For Taiwan:
   - Design a FactMatcher engine (no scores, just boolean requirement checks)
   - Input: user profile (income, education, nationality, goal)
   - Output: per-visa requirement status (met / not-met / needs-review)
   - How to make this coexist with Korea's scoring engine?
   - File structure: quiz-engine-kr.ts + quiz-engine-tw.ts? Or parameterized?

7. I18N IMPACT
   - New translation keys needed in messages/{locale}.json
   - Taiwan visa data in which locales? (en, ja, zh-tw — zh-tw is especially important for Taiwan)
   - Any new locale needed? (ko for Korean users interested in Taiwan?)

8. BUILD & PERFORMANCE
   - Estimated increase in static pages (current count × 2 countries?)
   - Bundle size impact of adding Taiwan data
   - Lazy loading strategy for country-specific data
   - Build time projections

Write output to: docs/tw-architecture-plan.md
```

---

## PHASE 2: SYNTHESIS

After all 3 audit agents complete, the orchestrator reads:
- `docs/tw-legal-compliance-guide.md`
- `docs/tw-product-spec.md`
- `docs/tw-architecture-plan.md`

Synthesize into `docs/tw-expansion-synthesis.md`:

```
Read the 3 reports above. Produce a unified implementation plan:

1. LEGAL CONSTRAINTS → FEATURE DECISIONS
   Map legal findings to product decisions:
   - Which CPO-proposed features got RED from Legal? Remove them.
   - Which got YELLOW? What safeguards does Legal require?
   - Finalize the approved feature list.

2. ARCHITECTURE DECISIONS
   Resolve any conflicts between CPO's product spec and CTO's architecture:
   - Final type system approach
   - Final route structure
   - Final data schema

3. PRIORITIZED TASK LIST
   Break into implementable chunks for Phase 3 agents:
   - Task 1: Type system + data schema (CTO scope)
   - Task 2: Taiwan visa JSON data — Gold Card, DNV, Work ARC, Visitor (content scope)
   - Task 3: Country-aware routing + page scaffolding (CTO scope)
   - Task 4: Taiwan-specific components — TECO Router, Agency Map (CTO scope)
   - Task 5: Taiwan quiz engine (fact-matcher) (CTO scope)
   - Task 6: i18n keys + disclaimers (content scope)

4. CLAUDE.MD UPDATE
   Draft the "Taiwan Legal Bright Lines" section to add to CLAUDE.md.

Write to: docs/tw-expansion-synthesis.md
```

---

## PHASE 3: IMPLEMENT — Spawn 3 agents IN PARALLEL

> ⚠️ Only proceed after synthesis is approved by the orchestrator.
> Each agent's prompt includes the SPECIFIC files to create/modify.

### Agent 1: "CTO-Foundation" (Types + Data + Routes)

```
You are implementing the foundation layer for Taiwan visa support.

READ FIRST:
- CLAUDE.md
- docs/tw-expansion-synthesis.md (your task list)
- docs/tw-architecture-plan.md (technical decisions)
- docs/tw-legal-compliance-guide.md (legal constraints to embed in code)

TASKS:
1. Update lib/visa/types.ts:
   - Add Taiwan visa types (per architecture plan)
   - Add Taiwan-specific interfaces (TECOInfo, AgencyStep, etc.)
   - Ensure backward compatibility — Korea types unchanged

2. Create lib/visa/data-tw.ts:
   - Taiwan data loader (mirroring data.ts pattern)
   - Country-aware getVisaInfo(country, type, locale)

3. Create data/visas/en/tw/ directory with JSON files:
   - gold-card.json (full guide)
   - dnv.json (full guide)
   - work-arc.json (full guide)
   - visitor.json (full guide)
   IMPORTANT: All content must follow legal guidelines. No "you qualify" language.
   Every description must say "published requirements" not "official requirements".

4. Create data/visas/zh-tw/tw/ (Traditional Chinese versions)
   - Same 4 visa files in zh-tw

5. Create data/visas/ja/tw/ (Japanese versions)
   - Same 4 visa files in ja

6. Update app/[lang]/[country]/visa/ pages:
   - Make page.tsx country-aware (load Korea OR Taiwan data based on [country] param)
   - Add "tw" to generateStaticParams()
   - Ensure [type] route resolves Taiwan visa types

7. Update CLAUDE.md:
   - Add "Taiwan Legal Bright Lines" section from synthesis

After all changes: npm run build && npm run lint
Fix any errors before completing.
```

### Agent 2: "CTO-Components" (Taiwan-specific UI)

```
You are building Taiwan-specific UI components.

READ FIRST:
- CLAUDE.md
- docs/tw-expansion-synthesis.md
- docs/tw-product-spec.md (feature designs)
- docs/tw-legal-compliance-guide.md (disclaimer requirements)
- components/visa/landing/ (Korea landing components for reference)
- components/visa/journey/ (Korea journey components for reference)
- components/visa/LegalDisclaimer.tsx

TASKS:
1. Create components/visa/tw/ directory (barrel export via index.ts)

2. Create components/visa/tw/TECORouter.tsx:
   - Dropdown: select document type (degree, criminal record, etc.)
   - Dropdown: select issuing country/state
   - Display: responsible TECO office, address, mailing instructions, processing time
   - Data: create lib/visa/teco-data.ts with TECO office mappings
   - Must include disclaimer: "Information based on publicly available TECO guidelines."

3. Create components/visa/tw/AgencyWorkflowMap.tsx:
   - Visual timeline: BOCA → MOL → NIA
   - Each step shows: agency name, what they handle, estimated duration
   - Highlight current step (if user has selected their stage)
   - Use cn() for conditional styling. No external charting library needed — use Tailwind.

4. Create components/visa/tw/TaiwanLegalDisclaimer.tsx:
   - Stronger than Korea's version
   - Must reference: Immigration Act §56, Attorney Act
   - English + zh-tw text (use translations)
   - Appears on: every Taiwan visa page, quiz results, checklist

5. Create components/visa/tw/TaiwanSituationGrid.tsx:
   - Taiwan situations: Remote Work, Professional Employment, Gold Card, Study, Long-term Stay, Short Visit
   - Reuse SituationTile component pattern from Korea
   - Different emoji/icons for Taiwan context

6. Update components/visa/quiz/ for country-awareness:
   - QuizResults should render differently for tw (no match levels, fact-matching only)
   - Create lib/visa/quiz-engine-tw.ts (FactMatcher — no numerical scoring)
   - Input: same QuizAnswers interface
   - Output: per-requirement boolean status, NOT match scores

After all changes: npm run build && npm run lint
Fix any errors before completing.
```

### Agent 3: "CTO-i18n" (Translations + Content)

```
You are handling internationalization and content for Taiwan expansion.

READ FIRST:
- CLAUDE.md
- docs/tw-expansion-synthesis.md
- docs/tw-product-spec.md
- docs/tw-legal-compliance-guide.md (safe language patterns)
- messages/en.json (current English translations)
- messages/ja.json
- messages/zh-tw.json

TASKS:
1. Add Taiwan-specific translation keys to messages/en.json:
   - visa.tw.landing.* (situation descriptions)
   - visa.tw.quiz.* (requirement filter labels — NOT "quiz" or "recommendation")
   - visa.tw.disclaimer.* (legal disclaimer texts)
   - visa.tw.teco.* (TECO router labels)
   - visa.tw.agency.* (BOCA/NIA/MOL descriptions)
   - visa.tw.visaRun.* (visa run calculator labels)
   - visa.tw.taxClock.* (183-day tracker labels)

2. Add same keys to messages/zh-tw.json:
   - This is the MOST IMPORTANT locale for Taiwan
   - All disclaimers must be in natural Traditional Chinese
   - Immigration Act §56 → 入出國及移民法第56條

3. Add same keys to messages/ja.json:
   - Japanese translations for Taiwan visa content

4. Review all new translation strings for legal safety:
   - No "eligible", "qualify", "recommended" in any language
   - Use: "aligns with published requirements", "meets the stated criteria"
   - zh-tw: Never use 符合資格 (eligible), use 與公開要求相符 (aligns with published requirements)
   - ja: Never use 資格がある, use 公開された要件と一致 (matches published requirements)

5. Create/update messages structure for country-awareness:
   - Ensure existing Korea keys (visa.*) still work
   - New Taiwan keys namespaced under visa.tw.*

After all changes: npm run build && npm run lint
Fix any errors before completing.
```

---

## PHASE 4: GATE

```
Orchestrator runs:
1. npm run build — must pass with 0 errors
2. npm run lint — must pass with 0 warnings (or only pre-existing ones)
3. Quick smoke check:
   - /en/tw/visa → does it render?
   - /en/tw/visa/gold-card → does it render?
   - /zh-tw/tw/visa → does it render in Chinese?
   - /en/korea/visa → Korea pages still work? (regression check)
4. Fix any remaining issues
5. Commit: "feat(visa): add Taiwan visa dashboard foundation — Gold Card, DNV, Work ARC, Visitor with Taiwan-specific legal safeguards"
```

---

## PHASE 5: UXR VERIFY

### Puppeteer mode (Claude Code CLI):

```
You are the UXR agent. Test the new Taiwan visa pages using Puppeteer.

SETUP:
1. npm install puppeteer --save-dev (if needed)
2. npm run dev & (background)
3. Wait for localhost:3000

WRITE AND RUN a Puppeteer test script:

DESKTOP (1280x800):
1. Navigate: /en/tw/visa → screenshot
2. Click each situation tile → verify it routes to correct visa detail
3. Navigate: /en/tw/visa/gold-card → screenshot
4. Navigate: /en/tw/visa/find → screenshot (requirement filter)
5. Navigate: /en/tw/visa/compare → screenshot
6. Navigate: /zh-tw/tw/visa → screenshot (Traditional Chinese)
7. Navigate: /ja/tw/visa → screenshot (Japanese)

REGRESSION (Korea still works):
8. Navigate: /en/korea/visa → screenshot
9. Navigate: /en/korea/visa/e-7 → screenshot
10. Compare with baseline — no visual regression?

LEGAL COMPLIANCE CHECK:
11. On every Taiwan page, verify disclaimer is visible
12. On quiz results page, verify NO percentage scores or "match" levels
13. Grep rendered HTML for forbidden phrases: "you qualify", "eligible", "recommended visa", "guaranteed"

MOBILE (390x844):
14. Resize → /en/tw/visa → screenshot
15. /en/tw/visa/gold-card → screenshot
16. Check: no horizontal overflow, touch targets ≥44px

Save all screenshots to docs/screenshots/tw-*.png
Read and analyze each screenshot.
Write findings to: docs/cycle-tw1-audit-ux.md
Kill dev server when done.
```

---

## RUNNING THIS CYCLE

### Option A: Claude Code CLI (headless)

```bash
# Phase 1: Audit (parallel)
cat docs/cycle-tw-expansion-prompt.md | claude -p "Run PHASE 1 only. Spawn the 3 audit agents (Legal-TW, CPO-TW, CTO-TW) in parallel. Wait for all to complete. Do NOT proceed to Phase 2 yet."

# Phase 2: Synthesis (after reviewing audit outputs)
cat docs/cycle-tw-expansion-prompt.md | claude -p "Run PHASE 2. Read the 3 audit reports and produce the synthesis. Do NOT implement yet."

# Phase 3: Implement (after reviewing synthesis)
cat docs/cycle-tw-expansion-prompt.md | claude -p "Run PHASE 3. Spawn the 3 implement agents in parallel. Then run PHASE 4 gate."

# Phase 5: UXR (after gate passes)
cat docs/cycle-tw-expansion-prompt.md | claude -p "Run PHASE 5 UXR verification only."
```

### Option B: Cowork Mode

Run each phase interactively. The orchestrator (you or Claude) reviews outputs between phases and adjusts before proceeding.

### Option C: Full Auto

```bash
cat docs/cycle-tw-expansion-prompt.md | claude -p "Run the complete cycle: Phase 1 → 2 → 3 → 4 → 5. Between phases, auto-synthesize findings and proceed. Stop only if Legal gives RED on core features."
```

---

## SUCCESS CRITERIA

- [ ] /en/tw/visa renders with Taiwan situation grid
- [ ] 4+ Taiwan visa detail pages with accurate content
- [ ] Taiwan quiz uses fact-matching (NO scores)
- [ ] Legal disclaimers on every Taiwan page (English + zh-tw)
- [ ] Korea pages completely unaffected (regression-free)
- [ ] npm run build passes with 0 errors
- [ ] No forbidden legal phrases in any Taiwan content
- [ ] CLAUDE.md updated with Taiwan legal bright lines
