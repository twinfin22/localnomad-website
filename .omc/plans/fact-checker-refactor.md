# Plan: Fact-Checker Refactor & Improvement

## Source Spec
`.omc/specs/deep-interview-fact-checker-refactor.md`

---

## RALPLAN-DR Summary

### Principles
1. **Single source of truth** — fact-checker logic lives in SKILL_fact-checker.md only; quality-gate and /fact-check reference it, never repeat it
2. **Enforcement over description** — every step has MUST gates, completion checklists, and abort conditions; "should" language is banned
3. **Tool efficiency** — batch claims by domain, track fetched pages, minimize Firecrawl calls
4. **Backward compatibility** — blog pipeline (blog.md → quality-gate → fact-checker) must work identically after refactor
5. **Standalone parity** — /fact-check produces the same report format as pipeline invocation

### Decision Drivers
1. **Enforcement rigor** — the #1 user complaint is that Claude skips steps or does shallow checks
2. **Firecrawl cost** — each search/scrape call costs time and API quota; batching saves both
3. **Maintainability** — deduplication between quality-gate and fact-checker prevents drift

### Viable Options

**Option A: In-place refactor (CHOSEN)**
- Restructure SKILL_fact-checker.md with MUST gates and completion checklists inline
- Add Firecrawl optimization as a preamble "Preparation" phase (not a numbered step)
- Dedup quality-gate Layer 1 to reference fact-checker
- Create /fact-check as a thin command wrapper
- Pros: minimal file churn, preserves existing integration, single PR
- Cons: SKILL_fact-checker.md grows longer (but more structured)

**Option B: Split into protocol + skill**
- Extract the 5-step protocol into a separate `PROTOCOL.md` file (inspired by GitHub repo's XML approach)
- SKILL_fact-checker.md becomes a thin wrapper that loads the protocol
- Pros: protocol is reusable, cleaner separation of concerns
- Cons: adds indirection, another file to maintain, breaks the pattern of all other LocalNomad skills (which are self-contained .md files)
- **Rejected**: violates Principle 1 (single source of truth becomes split across files) and breaks consistency with other skills

---

## Requirements Summary

Refactor the existing fact-checker skill for stricter enforcement, smarter source discovery, and standalone invocability. 4 deliverables, 3 files modified/created.

## Acceptance Criteria
- [ ] AC1: SKILL_fact-checker.md uses MUST/MUST NOT language at every step with explicit completion gates
- [ ] AC2: Step 1 (Extract Claims) outputs a mandatory claims table (not prose)
- [ ] AC3: New "Preparation" preamble (before Step 1) batches claims by target domain and initializes a fetched-pages tracker
- [ ] AC4: Step 2 (Source Discovery) checks fetched-pages tracker before making new Firecrawl calls
- [ ] AC5: Firecrawl tool context optimization: search vs scrape vs extract with when-to-use + cost-aware batching guidance (hard dependency — Firecrawl is installed)
- [ ] AC6: Each step has an explicit abort condition ("if X cannot be done, output Y and proceed")
- [ ] AC7: Quality-gate Layer 1 references fact-checker skill cleanly (minor wording tightening, not major restructure)
- [ ] AC8: `/fact-check` command accepts 4 input types: file path, URL, pasted text, single claim
- [ ] AC9: `/fact-check` uses explicit paths to `localnomad-blog-plugin/skills/fact-checker/...` (no ambiguous relative paths)
- [ ] AC10: Blog pipeline integration unchanged (blog.md → quality-gate → fact-checker path works)
- [ ] AC11: 5-Step numbering preserved (Preparation is a preamble, not a numbered step)
- [ ] AC12: No step section in SKILL_fact-checker.md exceeds 50 lines (hard cap to prevent bloat)

## Implementation Steps

### Step 1: Refactor SKILL_fact-checker.md (D1 + D2)
**File**: `localnomad-blog-plugin/skills/fact-checker/SKILL_fact-checker.md`

#### 1a: Add Preparation Preamble (NEW — not a numbered step)
Insert before Step 1 as `## Preparation (MUST complete before Step 1)`. Keeps 5-Step numbering intact.

```markdown
## Preparation (MUST complete before Step 1)

Before extracting claims, prepare the verification environment:

1. **Identify target countries** mentioned in the post
2. **Pre-load government source URLs** from `references/government-sources.md` for those countries
3. **Initialize fetched-pages tracker**: empty table that records every URL fetched during this run

| URL | Fetched At | Content Summary | Claims Verified Against |
|-----|-----------|-----------------|------------------------|

4. **Initialize tool budget**: track Firecrawl calls made (search, scrape, extract)

### Preparation Gate
- [ ] Target countries identified
- [ ] Government source URLs loaded for each country
- [ ] Fetched-pages tracker initialized
- [ ] Tool budget counter at 0

MUST NOT proceed to Step 1 until all gates pass.
```

#### 1b: Add MUST gates to Step 1 (Extract Claims)
Current Step 1 describes claim extraction in prose. Restructure to enforce table output:

- Change "Extract every verifiable factual claim into a list" → "MUST extract every verifiable factual claim into the following table format. Prose summaries are NOT acceptable."
- Add mandatory claims table columns: #, Claim Text, Type (A-E), Section, Priority (Critical/Standard), Target Domain
- Add "Target Domain" column — maps each claim to its likely verification source (enables batching in Step 2)
- Add completion gate: "Step 1 is NOT complete until the claims table has ≥1 row AND every row has all columns filled"

#### 1c: Add source batching to Step 2 (Source Discovery)
Current Step 2 verifies claims one-by-one. Add domain batching:

- Group claims by Target Domain from Step 1
- For each domain group: fetch the most likely page ONCE, verify all claims in that group against the fetched content
- MUST check fetched-pages tracker before every Firecrawl call: "If this URL (or a URL from the same domain path) was already fetched, reuse the cached content instead of re-fetching"
- Add Firecrawl tool selection guide:

```markdown
### Firecrawl Tool Context Optimization (hard dependency — Firecrawl MCP installed)

**Tool selection (MUST follow this order):**
1. **Check fetched-pages tracker** — if URL already fetched, reuse content. STOP.
2. **Known government URL** (from government-sources.md) → `firecrawl_scrape` (direct page fetch, no search needed)
3. **Unknown source needed** → `firecrawl_search` (discover the right page first)
4. **Structured data** (tables, forms, lists on government pages) → `firecrawl_extract` with schema

**Cost-aware batching rules:**
- Group all claims targeting the same domain → single `firecrawl_scrape` call, verify multiple claims from one fetch
- Prefer `firecrawl_scrape` over `firecrawl_search` when the exact URL is known (cheaper, faster, more precise)
- Use `firecrawl_search` only for source discovery (unknown pages), not for pages already in government-sources.md
- `firecrawl_extract` with JSON schema for structured government data (visa fee tables, requirement lists) — returns clean structured data instead of raw HTML
- Track every call in the fetched-pages tracker to prevent redundant fetches

**Fallback (Firecrawl down):** `WebSearch` / `WebFetch`. If all tools unavailable → UNVERIFIABLE with reason "no web access".
```

#### 1d: Add MUST gates to Steps 3-5
For each remaining step, add:
- Explicit completion gate (checklist that must pass)
- Abort condition ("if this step cannot be completed because X, then document Y and proceed to next step")
- MUST NOT language for critical requirements

#### 1e: Add abort conditions throughout
- Step 2 abort: "If a claim cannot be sourced after 3 search attempts AND the fetched-pages tracker has been checked, mark as UNVERIFIABLE. MUST document the search queries attempted."
- Step 3 abort: "If a URL fails the 5-point check, MUST document which check(s) failed and whether a fallback source exists."
- Step 5 abort: "If a nuance check reveals a context error, MUST classify severity and document the specific misleading framing."

### Step 2: Tighten Quality-Gate Layer 1 (D3)
**File**: `localnomad-blog-plugin/skills/quality-gate/SKILL_quality-gate.md`

**Note (Architect review):** Current Layer 1 is already lean (17 lines) and already references the fact-checker skill. This is a minor wording tightening, not a major restructure.

Changes:
- Add one line noting domain batching and fetched-pages tracker as new capabilities
- Verify Fail Conditions list is consistent with refactored skill's Error Severity Triage
- Ensure no duplicated claim-type definitions or source-tier logic (those live in fact-checker only)

### Step 3: Create /fact-check command (D4)
**File**: `.claude/commands/fact-check.md` (NEW)

```markdown
---
name: fact-check
description: Standalone fact-checker — verify claims in any content (file, URL, text, or single claim). Uses the same 5-step protocol as the blog pipeline quality gate.
---

# /fact-check [input]

## Input Parsing

Detect input type automatically:

| Input | Detection | Action |
|-------|-----------|--------|
| File path (`.md`, `.mdx`, `.txt`) | Starts with `/` or `./`, has file extension | Read file contents |
| URL (`https://...`) | Starts with `http://` or `https://` | Fetch with `firecrawl_scrape` and extract text |
| Multi-line text | Contains newlines or >100 characters | Treat as pasted content |
| Short text | Single line, ≤100 characters | Treat as single claim |

If input type is ambiguous, ask the user to clarify.

## Execution

1. Read `localnomad-blog-plugin/skills/fact-checker/SKILL_fact-checker.md`
2. Read `localnomad-blog-plugin/skills/fact-checker/references/government-sources.md`
3. Run Preparation preamble, then full 5-step protocol (Steps 1-5) on the parsed content
4. Output the standard Fact-Check Report

## Differences from Blog Pipeline

- No quality-gate wrapper (Layers 2-5 are NOT run)
- No SEO, anti-AI, legal, or voice checks
- No blog-specific context (category, country, cover image)
- Country detection is automatic from content (look for country names, visa types, government URLs)
- Report format is identical to blog pipeline output

## Output

Standard Fact-Check Report (see SKILL_fact-checker.md Output Format section).
```

### Step 4: Verification
- [ ] Read final SKILL_fact-checker.md — confirm MUST gates at every step, completion checklists, abort conditions
- [ ] Confirm no step section exceeds 50 lines (AC12)
- [ ] Confirm "5-Step" numbering preserved (Preparation is preamble, Steps 1-5 unchanged)
- [ ] Read final quality-gate Layer 1 — confirm it references fact-checker cleanly, no duplicated logic
- [ ] Read /fact-check command — confirm 4 input types, explicit paths to `localnomad-blog-plugin/skills/...`
- [ ] Grep for duplicated fact-checker logic in quality-gate (claim types, source tiers) — should return 0
- [ ] Confirm blog.md quality gate stage still references quality-gate correctly
- [ ] Verify Firecrawl tool context optimization section has search/scrape/extract guidance + batching rules

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SKILL_fact-checker.md becomes too long with all the gates | Claude may not follow a 400+ line skill | Keep each step's gate to ≤5 checklist items; use concise MUST language, not verbose explanation |
| Fetched-pages tracker adds complexity Claude forgets mid-run | Claims verified against stale/wrong cached content | Tracker is a simple table with URL + summary; completion gate at Step 0 ensures it's initialized |
| Quality-gate dedup breaks pipeline | Fact-checker no longer gets called or output format mismatches | Acceptance test: blog.md → quality-gate → fact-checker path must produce identical report format |
| /fact-check without country context may miss country-specific rules | Taiwan legal checks skipped for standalone use | Auto-detect country from content; if detected, load country-specific notes from government-sources.md |

## Execution Order

```
Step 1 (SKILL refactor) ──┐
                           ├── parallel (independent files)
Step 3 (/fact-check)  ────┘
Step 2 (quality-gate tighten) ── after Step 1 (needs to reference refactored skill)
Step 4 (verification) ── after all steps complete
```

## Edge Cases NOT Handled (by design)
- Image/visual claim verification — out of scope per spec
- Claims in non-English content — current skill handles bilingual government sites but doesn't verify claims written in Korean/Japanese
- Rate limiting on Firecrawl — no explicit handling; relies on Firecrawl's own rate limits
- Offline/cached fact-checking — requires live web access

---

## ADR (to be finalized after consensus)

**Decision**: In-place refactor of SKILL_fact-checker.md with enforcement gates
**Drivers**: Enforcement rigor, Firecrawl cost, maintainability
**Alternatives considered**: Split into protocol + skill files (rejected: breaks single-source-of-truth, inconsistent with other skills)
**Why chosen**: Minimal file churn, preserves integration, consistent with existing skill pattern
**Consequences**: Skill file grows longer but more structured; all other skills remain unchanged
**Follow-ups**: Monitor whether Claude actually follows the MUST gates in practice; if not, consider XML prompt format in future iteration

---

## Changelog
- v1.0: Initial plan from Planner
- v1.1: Architect + Critic consensus amendments (structural)
- v1.2: User feedback:
  - Firecrawl → hard dependency (installed via MCP). Added tool context optimization with cost-aware batching
  - Removed D3 (government-sources.md update) — out of scope
  - 5-Step numbering preserved. Preparation is a preamble, not "Step 0"
  - Deliverables reduced: 5 → 4, files: 4 → 3
  - Renumbered implementation steps accordingly (Step 1/2/3/4)
