---
name: quality-gate
description: 5-layer quality validation for LocalNomad blog posts — fact-checking, SEO audit, anti-AI checklist, legal compliance, and voice/readability checks. All layers must PASS before publication.
---

# Quality Gate — 5-Layer Validation

Run this during STAGE 4. All 5 layers must PASS. Any FAIL triggers auto-fix and re-check.

## Execution Model: Two-Phase Pipeline

Quality gate runs in two phases to prevent write collisions between layers.

### Phase 1: Parallel Verify (read-only)
All 5 layers run simultaneously. Each produces a report. No file edits happen.
- Layer 1 (Fact-Check): runs Steps 1-5 only → returns Fact-Check Report
- Layer 2 (SEO Audit): runs checklist → returns SEO Report
- Layer 3 (Anti-AI): scans for banned words/structures → returns Anti-AI Report
- Layer 4 (Legal): scans for prohibited language → returns Legal Report
- Layer 5 (Voice): checks readability/word count → returns Voice Report

### Phase 2: Sequential Fix (write operations)
After ALL Phase 1 reports are collected, apply fixes in this order:
1. **CRITICAL fact corrections** (wrong visa requirements, policy details)
2. **MODERATE fact corrections** (outdated stats, process differences)
3. **Anti-AI rewrites** (banned words, banned structures, structural fixes)
4. **Voice adjustments** (ESL-friendly, word count, jargon explanations)
5. **Source link injection** (fact-checker Step 6 — runs LAST to preserve links)
6. **Legal disclaimer insertion** (if missing)

This ordering ensures source links injected in step 5 are not overwritten by anti-AI or voice rewrites in steps 3-4.

After Phase 2, re-run Phase 1 as a verification pass (no fixes, just confirm all layers PASS).

## Layer 1: Fact-Check

Run the `fact-checker` skill (`skills/fact-checker/SKILL_fact-checker.md`) Steps 1-5 on the full post (verify phase only — Step 6 link injection runs in Phase 2). The fact-checker handles: claim extraction (with domain batching), source discovery (with fetched-pages tracker and verified-claims-cache), URL verification, freshness assessment, and context checks. It returns a structured Fact-Check Report.

**After fact-checker returns**, apply these LocalNomad-specific checks on top:
- Source tier definitions are in `fact-checker/references/government-sources.md` (Tier Classification Quick Rules section)
- Cross-verify: critical claims need ≥2 independent sources
- Check all internal links against CLAUDE.md Internal Link Map

### Fail Conditions
- Any visa requirement claim without Tier 1 source **and inline citation**
- Any statistic without source attribution **visible in the post** (link or parenthetical)
- Any claim older than 12 months without "as of [date]" qualifier
- **Internal logic contradiction**: read each Callout, list, and comparison item as a standalone claim — does it make sense without surrounding context?
- **Comparison data without source**: any comparison table or reference to another program must have verifiable source + launch date

## Layer 2: SEO Audit

Run the full 13-item checklist from `seo-engine/references/seo-checklist.md`.

### Fail Conditions (Hard rules — mandatory)
- Primary keyword missing from headline
- Primary keyword missing from meta description
- Primary keyword missing from URL slug
- Internal links < 3
- External links < 1
- Meta description > 160 characters
- Title > 70 characters

### Warning Conditions (Soft rules — flagged, not auto-fail)
- Primary keyword missing from first 100 words (natural placement preferred, not forced)
- Primary keyword missing from ≥1 H2 subheading (include if natural, flag if absent)
- Missing featured snippet structure where opportunity exists
- Image alt text missing keyword
- Link validation fails (broken link)
- Keyword present but phrasing feels forced → flag "keyword placement unnatural"

## Layer 3: Anti-AI Checklist

Read `references/anti-ai-checklist.md` for the full banned words list and structural checks.

This is a **checklist pass/fail system** (NOT a scoring rubric). Every check must pass.

### Step 1: Banned Words Scan
Scan the entire post for banned words. Find ALL instances. Replace EVERY one.

Banned words (partial list — see references for complete):
delve, crucial, landscape, tapestry, vibrant, leverage, navigate, comprehensive, foster, underscore, pivotal, nuanced, multifaceted, holistic, synergy, paradigm, robust, streamline, cutting-edge, groundbreaking, game-changer, unlock, empower, harness, spearhead, bolster, elevate, cornerstone, testament, realm, plethora, myriad, overarching, interplay, facet

**Replacement strategy**: specific, short, opinionated, varied rhythm, concrete, repeat don't rotate, punctuate simply. Replace with what you actually mean in plain English.

### Step 2: Banned Structures Scan
Find and remove/rewrite these 13 patterns (see `references/anti-ai-checklist.md` for full details):

- **Rule-of-three**: "X, Y, and Z" rhetorical triads → pick the best one, drop the rest
- **Negative parallelisms (all variants)**: "Not just X but Y" / "Not merely X but Y" / "Not only X but also Y" / "More than just X" → just assert directly
- **Meta-commentary**: "In this article, we will explore..." → delete entirely
- **Excessive transitions**: "Furthermore," "Moreover," "Additionally," → vary or remove
- **Hollow superlatives**: "truly remarkable," "incredibly important" → be specific
- **Fake authority & vague attributions**: "Experts agree," "Studies show," "Scholars suggest," "Critics have noted," "Many believe," "Widely regarded" (without citation) → cite or remove
- **"In conclusion/summary"**: → delete, just write the closing
- **Elegant variation (synonym cycling)**: same entity called 3+ different names → reuse the original term
- **Em dash overuse**: >3 per 500 words → replace excess with commas, parentheses, colons, periods
- **Significance/legacy/impact inflation**: "lasting impact," "broader significance," "cultural legacy" → state the specific measurable effect
- **"Challenges and future prospects" pattern**: "Despite its [positives], [subject] faces challenges..." → name specific problems directly
- **Promotional/advertisement-like language**: breathless enthusiasm, feature-listing, superlative stacking → report factually
- **Chatbot language remnants**: "I hope this helps," "Let me know," "Here is a detailed breakdown" → delete entirely

### Step 3: Structural Checks
All 10 must pass:

- [ ] Section opening sentences have DIFFERENT structures (not all starting with "The..." or "When...")
- [ ] Paragraph lengths VARY (mix of 1-sentence, 2-sentence, 3-4 sentence paragraphs)
- [ ] First sentence of post is NOT a definition or general statement
- [ ] No "In conclusion," "In summary," "To sum up" anywhere
- [ ] H2 headers do NOT follow a repetitive pattern (not all "The X of Y" or all questions)
- [ ] ≥2-3 informal/conversational phrases exist (contractions, fragments, asides)
- [ ] ≥1 clear opinion or judgment expressed (not just neutral reporting)
- [ ] No synonym cycling: each key entity uses max 2 natural alternatives
- [ ] Em dash density: ≤3 per 500 words
- [ ] No "Despite... challenges" formulaic template

### Result
- ALL checks pass (0 banned words, 0 banned structures, all 10 structural checks green) = **PASS**
- ANY failure = **FAIL** → auto-rewrite the failing elements → re-check
- **Max 3 auto-fix attempts**. If still failing after 3 rounds, flag in Quality Report for Gen's manual review instead of infinite loop.

## Layer 4: Legal Compliance

Read the `legal-bright-lines` skill (`skills/legal-bright-lines/SKILL_legal-bright-lines.md`) for country-specific rules.

### Checks
- [ ] No "you qualify," "you are eligible," "recommended visa," "guaranteed" language
- [ ] No filing applications or storing credentials
- [ ] Taiwan content: EN + 繁體中文 disclaimers present (above AND below quiz results)
- [ ] Taiwan: no scores, percentages, or probability language
- [ ] Every quiz/tool includes: "Based on published requirements. Not legal advice."
- [ ] Tax-related content: 3-layer disclaimer structure

### Fail Conditions
- ANY prohibited phrase found
- Missing required disclaimers for Taiwan content
- Missing disclaimer on quiz/tool content

## Layer 5: Voice & Readability

### ESL-Friendly Readability Checks
- [ ] Sentences are short (one idea per sentence — LibaD already writes this way)
- [ ] Jargon/technical terms have parenthetical explanation on first mention
- [ ] No paragraphs with 5+ sentences
- [ ] Abstract concepts have metaphor/analogy for accessibility
- [ ] Vocabulary difficulty is allowed to be high, but always with inline explanation
- [ ] Multi-language sprinkling (Korean, Japanese, etc.) always has inline translation

Note: Unlike mechanical 8th-grade measurement, ESL-friendly means short sentences + rich content. LibaD's intellectual texture (Gramsci references, etymology, layer-2 nation concepts) is preserved — not banned from the body. Footnotes are encouraged for extended tangents but not required for every intellectual reference.

### Word Count Check (category-dependent)
Target varies by content type:

| Category | Target Range | Notes |
|----------|-------------|-------|
| guides | 1500-2500w | Depth required for visa/process content |
| comparisons | 1200-1800w | Side-by-side analysis needs room |
| tips | 800-1200w | Short and practical |
| stories | 1000-1500w | Narrative length |
| news/updates | 600-1000w | Brief and timely |

- Count method: full post body (Hook through CTA, including Steps/FAQ where present)
- **Outside target range**: WARNING — review whether length serves the content
- **Egregiously short or long** (< 50% or > 150% of target range): FAIL

### Voice & Content Checks
- [ ] Each section answers "so what?" from reader's perspective
- [ ] Jargon first-mention has parenthetical translation
- [ ] CTA uses community tone (not corporate/salesy)
- [ ] Section openings lead with benefits, not features
- [ ] Structured data compatible (frontmatter → Article schema)

## Quality Report Format

After all 5 layers run, output:

```
=== QUALITY REPORT ===

Layer 1 — Fact-Check: PASS/FAIL
  [details if fail]

Layer 2 — SEO Audit: PASS/FAIL
  [list of 13 items: hard rules + soft rules with status]
  Soft rule warnings: [list if any]

Layer 3 — Anti-AI: PASS/FAIL
  Banned words found: [count] → [list + replacements]
  Banned structures found: [count] → [list + fixes]
  Structural checks: [10/10 pass or details]

Layer 4 — Legal: PASS/FAIL
  [details if fail]

Layer 5 — Voice & Readability: PASS/FAIL
  Word count: [N] (target for [category]: [range])
  ESL-friendly checks: [6/6 pass or details]

Source Table (MUST use exact page URLs, not just domains):
  | Claim | Source | Tier | Date | Exact URL |
  | [factual claim] | [source name + article title] | [1/2/3] | [date] | [full URL to specific page — NOT domain only] |
  ...
  ⚠️ "immigration.go.kr" alone = FAIL. Must be the specific page/article URL.
  If exact URL cannot be determined, write: "[domain] — specific page not retrievable, manual verification required"

Voice applied: LibaD-adapted LocalNomad
Next steps: [suggestions]
```
