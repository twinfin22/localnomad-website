# Taiwan Expansion — Synthesis & Implementation Plan

**Sources**: `tw-legal-compliance-guide.md` (Legal-TW), `tw-product-spec.md` (CPO-TW), `tw-architecture-plan.md` (CTO-TW)
**Date**: 2026-02-13
**Status**: Ready for Phase 3 implementation

---

## 1. Legal Constraints → Feature Decisions

### Approved Feature List (GREEN + YELLOW with safeguards)

| Feature | Legal | CPO Priority | Decision |
|---------|-------|-------------|----------|
| Situation landing page | GREEN | Phase 1 | **BUILD** — reuse SituationGrid with Taiwan situations |
| Visa info pages (4 types) | GREEN | Phase 1 | **BUILD** — Gold Card, DNV, Work ARC, Visitor |
| Document checklist | GREEN | Phase 1 | **BUILD** — reuse ChecklistPage, add TECO auth status |
| TECO authentication router | GREEN | Phase 2 | **BUILD** — new TW-only component, high user value |
| Visa comparison tool | GREEN | Phase 1 | **BUILD** — reuse VisaComparisonTool with TW data |
| Multi-agency workflow map | GREEN | Phase 2 | **BUILD** — new TW-only component (BOCA→MOL→NIA) |
| Community forum / tips | GREEN | Phase 4 | **DEFER** — low priority for MVP |
| Visa path simulator | YELLOW | Phase 2 | **BUILD** — generic paths only, no personalization, strong disclaimer |
| Requirement filter (quiz) | YELLOW | Phase 2 | **BUILD** — fact-matching ONLY (met/not-met/review), zero scores |
| 183-day residency counter | YELLOW | Phase 3 | **BUILD** — date arithmetic only, client-side, tax disclaimer |
| Visa run calculator | YELLOW | Phase 3 | **BUILD** — countdown + checklist, no timing advice |
| Taiwan legal disclaimer | N/A | Phase 1 | **BUILD** — required on every TW page, bilingual EN+zh-TW |

### Removed Features (RED — prohibited)

| Feature | Legal Rating | Reason | CPO Impact |
|---------|-------------|--------|------------|
| Scoring quiz (match levels) | RED | §56 treats scoring as "consulting" | **Redesigned** as Requirement Filter — no scores |
| Document auto-fill | RED | §56 explicitly covers "document drafting" | **Removed** — link to official portals instead |
| Government scraping | RED | Criminal Code §358-360 + PDPA | **Removed** — no status tracking |
| AI chatbot (personalized) | RED | §56 consulting + §127 legal advice | **Removed** — not in any phase |

### YELLOW Features — Required Safeguards

| Feature | Required Safeguards |
|---------|-------------------|
| Requirement filter | No scores/percentages/match levels. Output: side-by-side table of "Published Requirement" vs "Your Answer". Disclaimer above AND below results. Client-side only. |
| Path simulator | Show ALL paths generically. No personalization. Frame as "Published visa transition routes". Include disclaimer. |
| 183-day counter | Say "X days present" not "you are a tax resident". Include CPA referral. localStorage only. |
| Visa run calculator | Say "published stay duration is X days" not "you must leave by". Include border discretion warning. |

---

## 2. Architecture Decisions — Resolved Conflicts

### 2.1 Type System

**CTO recommended**: Option C — country-scoped compound type with separate `KoreaVisaType` + `TaiwanVisaType` unions joined as `VisaType`.

**CPO proposed visa types** (13 total):
```typescript
export type TaiwanVisaType =
  | "gold-card" | "dnv" | "work-arc" | "visitor"     // Phase 1
  | "entrepreneur" | "student" | "aprc"                // Phase 2
  | "plum-blossom" | "dependent-arc" | "seeking-employment"  // Stubs
  | "missionary" | "retirement" | "working-holiday-tw";      // Stubs
```

**CTO proposed visa types** (8):
```typescript
export type TaiwanVisaType =
  | "gold-card" | "entrepreneur" | "dnv" | "visitor"
  | "resident" | "student" | "work-permit" | "investment";
```

**Resolution**: Use CPO's naming for consistency with product spec, but implement only Phase 1 types first. Final type:

```typescript
export type TaiwanVisaType =
  // Phase 1 (full guides)
  | "gold-card" | "dnv" | "work-arc" | "visitor"
  // Phase 2 (full guides)
  | "entrepreneur" | "student" | "aprc"
  // Stubs (coming soon)
  | "plum-blossom" | "dependent-arc" | "seeking-employment"
  | "working-holiday-tw";
```

Notes:
- Use `"work-arc"` (CPO) instead of `"work-permit"` (CTO) — clearer for Taiwan context
- Use `"aprc"` (CPO) instead of `"resident"` (CTO) — more specific
- Drop `"investment"` and `"missionary"` from initial type — can add later
- Drop `"retirement"` — can add later

### 2.2 Data Directory Structure

**CTO recommended**: `data/visas/{country}/{locale}/{type}.json`
**CPO recommended**: `data/visas/tw/{locale}/{type}.json`

**Resolution**: Use CTO's pattern but **don't move Korea files in Phase 1**. This is the safest migration path:
- **Phase 1**: Keep Korea at `data/visas/{locale}/` (unchanged). Add Taiwan at `data/visas/tw/{locale}/`.
- **Phase 2 (future)**: Migrate Korea to `data/visas/kr/{locale}/`.

### 2.3 Data Loader

**Resolution**: Use CTO's dual-loader approach:
- Keep existing synchronous Korea loader unchanged (`getVisaInfo()`)
- Add async Taiwan loader (`getVisaInfoAsync()`) with dynamic imports
- Taiwan JSON files are code-split — zero impact on Korea bundle

### 2.4 Route Structure

**CPO proposed** new routes: `/[lang]/tw/visa/tools/teco-router/`, `/[lang]/tw/visa/tools/tax-tracker/`, `/[lang]/tw/visa/tools/visa-run/`

**Resolution**: The `/tools/` subroutes are Phase 2-3 features. For Phase 1, use existing route patterns only. Taiwan-specific tool routes will be added when those features are built.

Phase 1 routes (reuse existing patterns):
```
/[lang]/tw/visa/           → Landing
/[lang]/tw/visa/[type]     → Visa detail (gold-card, dnv, work-arc, visitor)
/[lang]/tw/visa/compare    → Comparison
/[lang]/tw/visa/checklist  → Checklist hub
/[lang]/tw/visa/checklist/[type] → Per-visa checklist
```

### 2.5 Quiz Engine

**Resolution**: CTO's dual-engine architecture is correct:
- `quiz-engine.ts` — Korea (unchanged)
- `tw-fact-matcher.ts` — Taiwan (new, no scores)
- `quiz-dispatcher.ts` — Routes by country

Phase 1 does NOT include the quiz. It ships in Phase 2 along with the path simulator.

### 2.6 Component Strategy

**Resolution**: Don't fork existing components. Add `country` prop where needed:
- `LegalDisclaimer` — add Taiwan variant via `country` prop + i18n keys
- `VisaFinder`, `QuizResults` — dispatch to different engines/renderers by country
- New components under `components/visa/tw/` for Taiwan-only features

---

## 3. Prioritized Task List for Phase 3 Implementation

### Task 1: Type System + Data Schema (CTO scope)

**Files to create/modify:**
- `lib/visa/types.ts` — Add `KoreaVisaType`, `TaiwanVisaType`, `CountryScopedVisa`, type guards, `Country` type
- `lib/visa/tw-types.ts` — New file with `TECOAuthenticationInfo`, `AgencyStep`, `TaxResidencyDay`, `VisaRunEntry`
- Extend `VisaCategory` with `"gold-card"`, `"investment"`, `"visitor"`
- Extend `VisaInfo` with optional `country`, `agencySteps`, `tecoInfo`, `goldCardFields` fields

**Constraints:**
- All existing Korea types must remain unchanged
- `VisaType` union must include both Korea and Taiwan types
- Type guards `isKoreaVisa()` and `isTaiwanVisa()` must be exported

### Task 2: Taiwan Visa JSON Data (content scope)

**Files to create:**
- `data/visas/tw/en/gold-card.json` (full — use CTO's skeleton as base)
- `data/visas/tw/en/dnv.json` (full)
- `data/visas/tw/en/work-arc.json` (full)
- `data/visas/tw/en/visitor.json` (full)
- `data/visas/tw/zh-tw/gold-card.json` (Traditional Chinese)
- `data/visas/tw/zh-tw/dnv.json`
- `data/visas/tw/zh-tw/work-arc.json`
- `data/visas/tw/zh-tw/visitor.json`
- `data/visas/tw/ja/gold-card.json` (Japanese)
- `data/visas/tw/ja/dnv.json`
- `data/visas/tw/ja/work-arc.json`
- `data/visas/tw/ja/visitor.json`

**Constraints (from Legal):**
- All content must follow Taiwan safe language patterns
- NO "you qualify", "eligible", "recommended", "official requirements"
- Use "published requirements", "based on [source]", "as of [date]"
- Every description must cite official source (NIA, BOCA, MOL, Gold Card Portal)
- Include `"country": "tw"` field in each JSON

### Task 3: Data Loader + Country-Aware Routing (CTO scope)

**Files to modify:**
- `lib/visa/data.ts` — Add async Taiwan loader (`getVisaInfoAsync`, `getAllVisasAsync`), keep sync Korea loader
- `app/[lang]/[country]/visa/page.tsx` — Make country-aware (load Taiwan data when country=tw)
- `app/[lang]/[country]/visa/[type]/page.tsx` — Dispatch to async loader for Taiwan
- `app/[lang]/[country]/visa/compare/page.tsx` — Filter by country
- `app/[lang]/[country]/visa/checklist/page.tsx` — Filter by country
- `app/[lang]/[country]/visa/checklist/[type]/page.tsx` — Filter by country
- All `generateStaticParams()` functions — Add `"tw"` country with Taiwan visa types

**Constraints:**
- Korea pages must remain 100% unchanged in behavior
- Taiwan pages use dynamic imports (zero bundle impact on Korea)
- `generateStaticParams` must only generate Taiwan pages for locales `["en", "zh-tw"]`

### Task 4: Taiwan Legal Disclaimer Component (CTO scope)

**Files to create/modify:**
- `components/visa/LegalDisclaimer.tsx` — Add `country` prop, render Taiwan-specific text when `country === "tw"`
- New i18n keys in `messages/en.json`, `messages/zh-tw.json`, `messages/ja.json` for Taiwan disclaimers

**Requirements (from Legal):**
- Taiwan disclaimer must explicitly state: "does not constitute immigration consulting (移民諮詢)"
- Must reference Immigration Act §56 and Attorney Act
- Must state "LocalNomad is not a licensed Immigration Service Organization (移民業務機構)"
- Must appear on EVERY Taiwan visa page
- Must be bilingual (English + Traditional Chinese)
- Stronger than Korea disclaimer — see Legal guide Section 3 for exact text

### Task 5: i18n Keys + Translations (content scope)

**Files to modify:**
- `messages/en.json` — Add `visa.tw.*` namespace (situations, disclaimer, agency names, filter labels)
- `messages/zh-tw.json` — Add same keys in Traditional Chinese (MOST IMPORTANT locale for Taiwan)
- `messages/ja.json` — Add same keys in Japanese

**Key namespaces:**
```
visa.tw.landing.*       — situation descriptions
visa.tw.disclaimer.*    — legal disclaimer texts
visa.tw.agency.*        — BOCA/NIA/MOL descriptions
visa.tw.filter.*        — requirement filter labels (Phase 2, but keys can be added now)
visa.tw.teco.*          — TECO router labels (Phase 2, but keys can be added now)
```

**Constraints (from Legal):**
- NO "eligible", "qualify", "recommended" in ANY language
- English: "aligns with published requirements"
- zh-TW: 與公開要求相符 (NOT 符合資格)
- Japanese: 公開された要件と一致 (NOT 資格がある)

### Task 6: CLAUDE.md Update (meta)

Add "Taiwan Legal Bright Lines" section to CLAUDE.md. Full text is in Legal guide Section 5.

---

## 4. CLAUDE.md Update — Taiwan Legal Bright Lines

**Add to CLAUDE.md after the existing "Legal Bright Lines" section:**

```markdown
## Taiwan Legal Bright Lines (IMPORTANT)

Taiwan's Immigration Act §56 explicitly regulates "consulting" AND "document drafting" as
licensed immigration business. Attorney Act §127: up to 1 year imprisonment for unlicensed
legal consulting. Penalties: NT$200K-1M per violation.

### What LocalNomad CAN do for Taiwan:
- Display published requirements from official sources (NIA, BOCA, MOL) with source links
- Offer visa comparison tables (factual, no ranking by "fit")
- Provide document checklists (user self-checks, client-side storage only)
- Show TECO authentication routing (which office handles which jurisdiction)
- Display generic visa transition paths (not personalized)
- Offer day counters (arithmetic only, no status determination)
- Host community forums (with disclaimers, no staff advice)

### What LocalNomad MUST NEVER do for Taiwan:
- Show match scores, percentages, probability, or match levels (strong/moderate/possible)
- Rank or sort visa types by "fit" or "suitability" for a user
- Say "you qualify", "you are eligible", "recommended visa", "you should apply"
- Auto-fill, generate, or pre-populate government application forms
- Scrape government websites (NIA, BOCA) for status tracking
- Store passport numbers, ARC numbers, or application IDs on server
- Offer AI chatbot that answers personalized visa eligibility questions
- Use the word "consulting" (諮詢) to describe any LocalNomad feature

### Taiwan Quiz Rules:
- NO scores, NO percentages, NO match levels
- Output format: side-by-side table of "Published Requirement" vs "Your Answer"
- Every quiz page must show the Taiwan quiz disclaimer
- All quiz data processed client-side only (no server transmission)
- Results page must include: "This is not an eligibility assessment"

### Taiwan Disclaimer Rules:
- Every Taiwan page must show the Taiwan-specific disclaimer (not the Korea one)
- Disclaimers must appear in both English AND Traditional Chinese (繁體中文)
- Taiwan disclaimer must explicitly state LocalNomad is not a licensed 移民業務機構
- Quiz results must show disclaimer ABOVE and BELOW results

### Taiwan Data Rules:
- All user-entered data for calculators/checklists: client-side only (localStorage)
- Never transmit personal immigration data to backend for Taiwan features
- No server-side storage of Taiwan user visa status, documents, or application data
```

---

## 5. Implementation Agent Assignments (Phase 3)

### Agent 1: "CTO-Foundation" — Types + Data + Routes
**Scope**: Tasks 1, 3, 6
**Files owned**: `lib/visa/types.ts`, `lib/visa/tw-types.ts`, `lib/visa/data.ts`, all `page.tsx` files, `CLAUDE.md`

### Agent 2: "CTO-Components" — Legal Disclaimer + Taiwan Landing
**Scope**: Task 4 + landing page situation data for Taiwan
**Files owned**: `components/visa/LegalDisclaimer.tsx`, `components/visa/tw/`

### Agent 3: "CTO-i18n" — JSON Data + Translations
**Scope**: Tasks 2, 5
**Files owned**: `data/visas/tw/`, `messages/*.json`

**No file conflicts between agents.**

---

## 6. Success Criteria (Phase 1 Gate)

- [ ] `/en/tw/visa` renders with Taiwan situation grid (4 situations)
- [ ] `/en/tw/visa/gold-card` renders with full Gold Card guide
- [ ] `/en/tw/visa/dnv` renders with full DNV guide
- [ ] `/en/tw/visa/work-arc` renders with full Work ARC guide
- [ ] `/en/tw/visa/visitor` renders with full Visitor guide
- [ ] `/en/tw/visa/compare` shows 4 Taiwan visas side-by-side
- [ ] `/zh-tw/tw/visa` renders in Traditional Chinese
- [ ] Taiwan legal disclaimer visible on every TW page (EN + zh-TW)
- [ ] `/en/korea/visa` unchanged (regression-free)
- [ ] `/en/korea/visa/e-7` unchanged (regression-free)
- [ ] `npm run build` passes with 0 errors
- [ ] `npm run lint` passes
- [ ] No forbidden phrases in any Taiwan content ("you qualify", "eligible", "recommended visa", "official requirements")
- [ ] CLAUDE.md updated with Taiwan Legal Bright Lines
- [ ] All Taiwan visa JSON files cite official sources
