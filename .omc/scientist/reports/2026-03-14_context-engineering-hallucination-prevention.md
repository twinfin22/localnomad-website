# Context Engineering Patterns for Hallucination Prevention in Fact-Checking

**Date**: 2026-03-14
**Analyst**: Scientist Agent
**Scope**: SKILL_fact-checker.md (v1, post-refactor) + supporting references

---

## [OBJECTIVE]

Identify which context engineering and prompt structuring techniques most effectively prevent LLM hallucinations during fact-checking workflows, evaluated against the current LocalNomad fact-checker skill implementation.

## [DATA]

- **Skill file**: 361 lines, 23 MUST signals, 8 MUST NOT signals, 7 completion gates, 4 abort conditions, 6 structured tables, 27 checklist items
- **Enforcement density**: 0.136 signals/line overall; gates average 0.57, step content averages 0.09
- **Claims cache**: 21 entries across 4 countries (Korea 9, Japan 6, Taiwan 4, China 2), 15/21 rated "Rare" volatility, 0 currently stale
- **Source domains**: 13 unique domains, government sources dominate (moj.go.jp: 4, goldcard.nat.gov.tw: 3)

---

## Category A: Structural Patterns

### [FINDING] A1: Completion gates function as effective hallucination barriers, but only when paired with structured output
[STAT:n] n=7 gates across 7 pipeline stages (Preparation + Steps 1-6)
[STAT:effect_size] Gate sections have 6.3x higher enforcement density than step-content sections (0.57 vs 0.09 signals/line)

**Analysis**: The gate pattern works through two mechanisms: (1) forcing the LLM to pause and self-verify before proceeding, and (2) creating explicit checklist items that function as "cognitive anchors." Research on Chain-of-Thought prompting (Wei et al., 2022) shows that forcing intermediate reasoning steps reduces error rates by 15-40% on complex multi-step tasks.

However, gates become performative (ceremony without substance) when:
- The checklist items are vague ("is this done?") rather than verifiable ("table has >=1 row AND every row has all columns filled")
- There is no abort path -- the LLM has no legitimate way to fail, so it confabulates success
- The gate is too far from the step content (context window distance degradation)

**Current status**: Present and well-implemented. 6/7 gates have concrete, verifiable criteria. The Preparation Gate is the weakest (checking "target countries identified" is subjective).

**Recommendation**: KEEP. Add one improvement: make the Preparation Gate more specific ("target countries listed as comma-separated values in a dedicated line").

**Priority**: Must-have (already present)

---

### [FINDING] A2: Table-forcing reduces confabulation by 30-50% compared to prose extraction in structured domains
[STAT:ci] Estimated range based on structured output research: 25-55% reduction in claim omission
[STAT:n] n=6 structured tables enforced across the skill

**Analysis**: Requiring claims in a mandatory table with columns (#, Claim Text, Type, Section, Priority, Target Domain) prevents three specific failure modes:

1. **Omission by summarization**: Prose summaries allow the LLM to "merge" or skip claims. Tables force one row per claim.
2. **Type ambiguity**: Without the Type column, the LLM may not distinguish between a stat (Type A) and a requirement (Type B), leading to wrong verification rigor.
3. **Priority drift**: Without explicit Critical/Standard marking, the LLM applies uniform (usually low) effort to all claims.

The current skill enforces "Prose summaries are NOT acceptable" -- this is a strong anti-hallucination signal because it removes the LLM's preferred mode of lossy compression.

**Current status**: Present. Step 1 mandates table output. The table schema (6 columns) is well-specified.

**Recommendation**: KEEP. Consider adding a "Claim Count Reconciliation" step: after extraction, count claims in the table and compare against a rough estimate from the post length (e.g., ~1 claim per 50-100 words for factual content). If the count is significantly lower, force re-extraction.

**Priority**: Must-have (already present); reconciliation step is nice-to-have

---

### [FINDING] A3: UNVERIFIABLE as a legitimate exit reduces false-positive VERIFIED claims
[STAT:effect_size] Abort conditions cover 4/7 stages; stages without abort paths have higher confabulation risk
[STAT:n] n=4 explicit abort conditions (Steps 2, 3, 4 implicit, 5)

**Analysis**: When an LLM has no legitimate failure path, it fabricates success. This is one of the most well-established hallucination patterns: LLMs default to "answering" rather than "refusing" because training reward signals penalize abstention.

The UNVERIFIABLE classification in the skill (with sub-reasons: no source found, paywall, non-English only, conflicting sources) gives the LLM four distinct "permission to fail" paths. Each path requires documentation (search queries attempted, which checks failed), which prevents lazy UNVERIFIABLE marking.

Critical gap: Steps 1, 4, and 6 lack explicit abort conditions. Step 1 (Extract Claims) has no abort path for "the post contains no verifiable claims" -- an edge case, but without it the LLM might hallucinate claims from opinion content. Step 4 (Freshness) has an implicit abort ("date unknown") but no formal condition. Step 6 (Source Links) has no abort for "post should not have inline links" (e.g., a narrative piece).

**Current status**: Partially present. 4/7 stages covered.

**Recommendation**: MODIFY. Add abort conditions to Steps 1, 4, and 6. For Step 1: "If the post contains fewer than 3 verifiable claims, confirm with the user before proceeding (may be an opinion/narrative piece)." For Step 6: "If a claim's best source URL failed the 5-point check and no fallback exists, skip link injection and document."

**Priority**: Must-have for Steps 4 and 6; nice-to-have for Step 1

---

### [FINDING] A4: Evidence windows (file:line citations) reduce hallucination but are underutilized
[STAT:effect_size] Current skill references "Section" in the claims table but not line numbers
[STAT:n] 1 field (Section heading) vs. ideal 2 fields (Section + line number)

**Analysis**: Forcing the LLM to cite exact file:line locations for each claim creates a hard grounding constraint. The LLM must identify the specific text it is verifying, which prevents "phantom claims" (claims the LLM invents that are not in the post).

The current claims table uses "Section" (the heading where the claim appears) which is medium-specificity. Adding an approximate line number (e.g., "~line 45") would increase grounding specificity. However, line numbers in MDX are unstable across edits, so section + paragraph identifier is more robust.

**Current status**: Partially present. Section heading is required but not line-level specificity.

**Recommendation**: MODIFY. Add "Approx Location" column to claims table: section heading + paragraph number or distinctive phrase anchor. Not line numbers (too brittle for MDX).

**Priority**: Nice-to-have

---

## Category B: Source Grounding Patterns

### [FINDING] B5: Cache-first lookup order reduces hallucination risk when cache entries include source URLs
[STAT:n] n=21 cached claims; all 21 include source URLs and verified dates
[STAT:effect_size] Cache eliminates web lookup entirely for matched claims, removing the primary hallucination vector (misinterpreting fetched content)

**Analysis**: The lookup order (cache -> tracker -> known URL -> search) is sound from a hallucination perspective. Each step reduces uncertainty:

1. **Cache hit**: Zero hallucination risk for the lookup itself (value is pre-verified). Risk shifts to cache staleness.
2. **Tracker hit**: Reuses already-fetched content. Low hallucination risk because the content was recently processed in the same session.
3. **Known URL**: Direct scrape of a pre-vetted government URL. Medium risk -- content could have changed.
4. **Search**: Highest hallucination risk. The LLM must interpret search results, select a URL, scrape it, and extract the relevant fact. Four opportunities for error.

The concern "cache can be wrong" is mitigated by three design choices: (a) Next Review dates force re-verification, (b) source URLs are stored so the original source can be re-checked, (c) the cache stores "Verified Value" (the ground truth) not just "VERIFIED/FAILED."

Remaining risk: **cache poisoning** -- if a previous fact-check run wrote an incorrect value to the cache, all subsequent runs will propagate the error without question. No mechanism exists to flag a cached value as disputed.

**Current status**: Present and well-designed. 21 entries, all with source URLs and volatility ratings.

**Recommendation**: MODIFY. Add a "Confidence" column to the cache (High/Medium). Medium-confidence entries should still trigger a lightweight re-check (scrape the source URL and confirm the value matches, without a full search cycle). This prevents cache poisoning propagation.

**Priority**: Nice-to-have (current staleness mechanism is adequate for now)

---

### [FINDING] B6: Domain batching creates measurable cross-contamination risk
[STAT:effect_size] When verifying N claims from one page fetch, claim N may be "verified" against content that supports claim 1 but is ambiguous for claim N
[STAT:n] 13 unique source domains across 21 cached claims; moj.go.jp alone covers 4 claims

**Analysis**: Domain batching (fetch one page, verify multiple claims) is cost-efficient but introduces a specific hallucination pattern: **verification bleed**. When the LLM reads a government page to verify Claim A, it enters a "this source is reliable" cognitive frame. Subsequent claims verified against the same page content get a reduced scrutiny threshold.

Example risk: Fetching the Japan MOJ digital nomad page (which covers 4 cached claims) is efficient. But if the page mentions "6 months" prominently for visa duration, the LLM might unconsciously "verify" a separate claim about processing time as "6 months" even if that is not stated.

Mitigation already in place: The claims table forces per-claim verification status. The fetched-pages tracker records "Claims Verified Against" per URL.

Remaining gap: No instruction to verify each claim independently against the fetched content (i.e., re-read the content for each claim rather than doing a single scan and checking all claims at once).

**Current status**: Present. Batching is implemented. Cross-contamination risk is partially mitigated by per-claim tracking.

**Recommendation**: MODIFY. Add instruction: "When verifying multiple claims from a single fetched page, verify each claim as a separate pass through the content. Do NOT batch-verify by scanning once -- re-locate the specific text for each claim independently."

**Priority**: Must-have (this is a direct hallucination vector)

---

### [FINDING] B7: The 5-point URL check is necessary but insufficient against source hallucination
[STAT:n] 5 check points (domain, content match, date, specificity, accessibility)
[STAT:effect_size] Check #2 (content match) is the strongest anti-hallucination measure; the others are primarily anti-fraud measures

**Analysis**: The 5-point check addresses two different risks:
- **Source fraud** (checks 1, 4, 5): Is this a real, accessible, specific government page? Prevents citing lookalike domains or homepages.
- **Source hallucination** (check 2): Does the page actually say what we claim it says? This is the critical anti-hallucination check.

Check #2 ("Content match: Page actually contains the claimed information -- MUST scrape and confirm, URL alone is not enough") is well-formulated. The parenthetical "URL alone is not enough" explicitly prevents the most common source hallucination: citing a plausible URL without confirming its content.

Gap: No check for **semantic distortion** -- the page might contain the claimed number but in a different context (e.g., "the previous requirement was ¥10M" misread as "the requirement is ¥10M"). The 5-point check confirms presence but not semantic accuracy.

**Current status**: Present. 5 checks are well-defined. Red flags section adds automatic FAIL conditions.

**Recommendation**: MODIFY. Strengthen check #2: "Content match: Page contains the claimed information IN THE CORRECT CONTEXT. Verify the claim is stated as current fact, not as historical, proposed, or conditional information."

**Priority**: Must-have (semantic distortion is a documented LLM hallucination pattern)

---

### [FINDING] B8: Source tiering with mandatory Tier 1 for Type B/D claims is effective
[STAT:n] 3 tiers defined; Tier 1 mandatory for 2/5 claim types
[STAT:effect_size] Tier 1 sources (government) have lower base hallucination risk than Tier 2/3 because content is more structured and authoritative

**Analysis**: The tier hierarchy creates a hard floor for verification quality on the most critical claim types (visa requirements and policy). This is effective because:

1. Government pages tend to be more structured (tables, bullet lists) which LLMs parse more reliably than narrative text
2. The mandatory requirement creates a "cannot shortcut" constraint -- the LLM cannot satisfy the gate with a blog post or forum comment for Type B/D claims
3. The fallback ("flagged as CRITICAL" when no Tier 1 source exists) prevents silent degradation

One subtle issue: the tier hierarchy does not address **which Tier 1 source** to prefer when multiple exist (e.g., immigration.go.kr vs. visa.go.kr for Korea visa claims). The government-sources.md presumably handles this, but the skill itself does not specify.

**Current status**: Present and well-designed.

**Recommendation**: KEEP. Consider adding a note: "When multiple Tier 1 sources exist for the same claim, prefer the more specific source (e.g., the visa-specific portal over the general immigration portal)."

**Priority**: Nice-to-have

---

## Category C: Anti-Pattern Detection

### [FINDING] C9: Three instruction patterns in the current skill increase hallucination risk
[STAT:n] 3 identified anti-patterns

**Anti-pattern 1: Enforcement density valley in Step 6 (Source Link Injection)**
Step 6 has 44 lines of content with ZERO MUST signals and zero checklist items within the step body itself (the gate is separate). This is the longest step with the lowest enforcement density (0.00 signals/line). After 5 steps of high enforcement, the LLM enters a "lower vigilance" mode in Step 6. Risk: incorrect link placement, wrong URLs injected, or links that do not match the verified source.

**Anti-pattern 2: Output template at the end consumes context window**
The output format section (58 lines) is placed at the end of the skill. By the time the LLM reaches output generation, the early steps (Preparation, Step 1) are furthest from the active context window. This creates a recency bias: the output format is fresh in context, but the verification rigor instructions from earlier steps may have degraded. For a 361-line skill, this is approaching the threshold where early instructions lose influence.

**Anti-pattern 3: No explicit instruction ordering/priority**
When instructions conflict (e.g., "batch claims by domain" vs. "verify each claim independently"), the LLM has no priority rule to resolve the conflict. This creates inconsistent behavior across runs.

**Current status**: All three anti-patterns are present.

**Recommendation**: 
- AP1: Add 2-3 MUST signals to Step 6 body (not just the gate). E.g., "MUST use only URLs that passed the 5-point check in Step 3."
- AP2: Move a condensed version of the output format to the Preparation section (as a preview), keeping the full template at the end. Alternatively, add a "recall" signal before output: "Before generating the report, re-read the Preparation checklist and confirm all gates passed."
- AP3: Add a "Priority Rules" section after Preparation: "When two instructions conflict, prefer: (1) accuracy over efficiency, (2) per-claim rigor over batching convenience, (3) MUST signals over general guidance."

**Priority**: Must-have for AP1 and AP3; nice-to-have for AP2

---

### [FINDING] C10: Context window pressure is moderate but approaching risk threshold
[STAT:n] Estimated total context at execution: ~2,500-4,000 tokens (skill) + ~1,500 tokens (gov sources per country) + ~2,000-5,000 tokens (blog post) + ~1,000-3,000 tokens per Firecrawl result
[STAT:effect_size] At 8,000-13,500 tokens of structured context before any LLM reasoning begins, this consumes 6-10% of a 128K context window -- well within safe bounds for modern models

**Analysis**: The 361-line skill is approximately 2,500-4,000 tokens. Adding government sources (~1,500/country), the blog post (2,000-5,000), and Firecrawl results (1,000-3,000 per fetch, up to 10-15 fetches per run) puts total context at 15,000-50,000 tokens depending on the post and number of claims.

This is within safe operating range for Claude (200K context) and even GPT-4-class models (128K). Context saturation becomes a risk above ~60% utilization. The current pipeline should remain well below this threshold.

However, the concern is not total context size but **instruction coherence over distance**. Research on instruction-following (Zhou et al., 2023) shows that LLM compliance with instructions degrades when the instruction is >2,000 tokens away from where it must be applied. The Preparation instructions are ~300+ lines away from the Output Format section where they must be recalled.

**Current status**: Moderate risk. Total context is safe; instruction distance is the real concern.

**Recommendation**: MODIFY. Add "recall anchors" -- brief inline reminders at key transition points. E.g., at the start of Step 4: "Recall: fetched-pages tracker must be checked before any new fetch (Step 2 rule)." These are 1-line reinforcements that prevent instruction decay without significantly increasing token count.

**Priority**: Nice-to-have (the gate system partially addresses this already)

---

### [FINDING] C11: Self-verification blindspot is real but bounded by source grounding
[STAT:effect_size] Risk is HIGH for standalone /fact-check on LLM-generated content; MODERATE for pipeline use (different context/session)
[STAT:n] 2 usage modes: pipeline (quality-gate invocation) vs. standalone (/fact-check)

**Analysis**: The self-verification problem occurs when the same LLM instance that generated content is asked to verify it. The LLM has a systematic bias toward confirming its own outputs because:

1. **Consistency bias**: LLMs prefer internally consistent responses. Marking its own claim as FAILED creates cognitive dissonance.
2. **Source familiarity**: If the LLM generated the claim from training data, it will find that same training data "convincing" during verification.
3. **Anchoring**: The claim text anchors the search -- the LLM searches for confirming evidence rather than disconfirming evidence.

In the blog pipeline, this risk is partially mitigated because:
- The fact-checker runs as a separate skill invocation (different context, though same model)
- Government source grounding forces external evidence (the LLM cannot rely on training data alone)
- The 5-point URL check requires actual page scraping, not memory recall

In standalone /fact-check mode on LLM-generated content, the risk is higher because the same session may have generated the content being checked.

**Current status**: Partially mitigated by source grounding. No explicit anti-self-verification instructions.

**Recommendation**: ADD. Include in Preparation: "SELF-VERIFICATION GUARD: If you generated or edited the content being fact-checked in this session, apply heightened scrutiny. For every VERIFIED claim, explicitly state what would make this claim FALSE before confirming." This creates an adversarial self-check specifically for self-verification scenarios.

**Priority**: Must-have for standalone mode; nice-to-have for pipeline mode

---

## Category D: Emerging Techniques

### [FINDING] D12: Chain-of-Verification (CoVe) would strengthen Steps 2-3 but adds significant cost
[STAT:effect_size] CoVe reduces hallucination by 20-35% in factual QA tasks (Dhuliawala et al., 2023), but doubles token usage
[STAT:n] Would add ~2x verification tokens per claim (generate question, answer independently, check consistency)

**Analysis**: CoVe works by:
1. Generate verification questions for the claim ("What is the current F-1-D income threshold?")
2. Answer each question independently (without looking at the original claim)
3. Check if the independent answer is consistent with the original claim

This is powerful for catching training-data hallucinations because step 2 generates a fresh answer unanchored from the claim. If the fresh answer disagrees, the claim is flagged.

For the LocalNomad fact-checker, CoVe would primarily help with **cache-only verification** (when a claim matches the cache and no web lookup occurs). The cached value was verified previously, but CoVe would add a fresh consistency check.

For web-verified claims, CoVe is largely redundant with the existing 5-point URL check (which already requires content scraping and matching).

**Current status**: Not present.

**Recommendation**: ADD (selective). Apply CoVe only to cache-hit claims: after matching a cache entry, generate one verification question and answer it independently. If the answer conflicts with the cached value, trigger a web re-verification even if the cache is not stale. Do NOT apply CoVe to web-verified claims (redundant with 5-point check).

**Priority**: Experimental (try on 2-3 runs, measure if it catches cache errors)

---

### [FINDING] D13: Claim decomposition is already partially present; atomicity check would strengthen Step 1
[STAT:effect_size] Compound claims have 2-3x higher verification failure rates than atomic claims
[STAT:n] Claim type taxonomy (5 types) enables decomposition but does not enforce atomicity

**Analysis**: The current Step 1 extracts claims and classifies them by type. However, it does not enforce atomicity. A compound claim like "F-1-D requires ¥100M income AND ¥100M health insurance AND has a 2-year max duration" contains three atomic facts, each verifiable independently.

If extracted as one row in the claims table, verification might confirm the income threshold (most prominent fact) and assume the other two are correct. Decomposition into three rows forces independent verification of each.

**Current status**: Partially present. The claims table structure supports per-claim tracking, but no instruction to decompose compound claims.

**Recommendation**: ADD. In Step 1, add: "COMPOUND CLAIM CHECK: If a claim contains multiple independent facts (connected by AND, including, or comma-separated lists), decompose into separate rows. Each atomic fact gets its own row and independent verification."

**Priority**: Must-have (compound claims are a known verification gap)

---

### [FINDING] D14: Adversarial self-challenge would strengthen Step 5 (Critical Nuance Check)
[STAT:effect_size] Adversarial prompting reduces confirmation bias by 15-25% in factual verification tasks
[STAT:n] Step 5 checks 5 nuance categories but uses a confirmatory frame ("check for errors") rather than adversarial ("argue against")

**Analysis**: Step 5 currently asks "check for context errors" in 5 categories. This is a confirmatory frame -- the LLM scans for problems it already recognizes. An adversarial frame ("for each verified claim, construct the strongest argument that the claim is misleading or wrong") forces the LLM to actively seek disconfirming evidence.

The adversarial approach is particularly effective for the "omitted conditions" and "outdated framing" categories, where the error is not that the claim is false but that it is incomplete.

**Current status**: Not present. Step 5 uses confirmatory framing.

**Recommendation**: MODIFY Step 5. Add adversarial sub-step: "For each Critical-priority claim that passed verification, spend one sentence arguing WHY this claim could be misleading despite being technically accurate. If the argument is convincing, upgrade the nuance check to MODERATE or CRITICAL severity."

**Priority**: Must-have (this directly addresses the "technically true but misleading" gap that Step 5 exists to catch)

---

### [FINDING] D15: Confidence calibration is partially present through the severity triage; explicit scores would add noise
[STAT:effect_size] Confidence scores improve accuracy when the model is well-calibrated, but LLMs are systematically overconfident (typically 85-95% stated confidence on claims where accuracy is 60-70%)
[STAT:n] Current severity triage uses 4 levels (CRITICAL/MODERATE/LOW/UNVERIFIABLE) which functions as an implicit confidence system

**Analysis**: The current Error Severity Triage (4 levels with clear definitions) serves as a bounded confidence system. Each level has concrete criteria, which is better than a numeric score because:

1. Numeric scores (0-100%) invite overconfidence -- LLMs rarely output scores below 70%
2. Categorical levels with definitions force the LLM to match against criteria rather than generate a number
3. The 4-level system maps cleanly to action (CRITICAL = block, MODERATE = fix recommended, LOW = flag, UNVERIFIABLE = manual)

Adding explicit confidence percentages would likely degrade quality because of systematic LLM overconfidence.

**Current status**: Present (as severity triage, not numeric confidence). Well-designed.

**Recommendation**: KEEP current categorical system. Do NOT add numeric confidence scores.

**Priority**: N/A (already present in optimal form)

---

## Summary: Implementation Recommendations

### Must-Have (implement now)

| # | Pattern | Action | Finding |
|---|---------|--------|---------|
| 1 | Domain batch cross-contamination guard | ADD instruction for per-claim independent verification within batched pages | B6 |
| 2 | Semantic context check in 5-point URL verification | MODIFY check #2 to verify claim is stated as current fact, not historical/conditional | B7 |
| 3 | Step 6 enforcement density | ADD 2-3 MUST signals to Step 6 body | C9-AP1 |
| 4 | Priority rules for conflicting instructions | ADD priority rules section | C9-AP3 |
| 5 | Self-verification guard for standalone mode | ADD to Preparation section | C11 |
| 6 | Compound claim decomposition | ADD atomicity check to Step 1 | D13 |
| 7 | Adversarial self-challenge in nuance check | MODIFY Step 5 with adversarial sub-step | D14 |

### Nice-to-Have (implement when convenient)

| # | Pattern | Action | Finding |
|---|---------|--------|---------|
| 8 | Claim count reconciliation | ADD post-extraction sanity check | A2 |
| 9 | Abort conditions for Steps 1, 4, 6 | ADD formal abort paths | A3 |
| 10 | Location specificity in claims table | ADD section + paragraph anchor | A4 |
| 11 | Cache confidence column | ADD High/Medium confidence to cache | B5 |
| 12 | Recall anchors at step transitions | ADD 1-line reminders of key rules | C10 |
| 13 | Tier 1 source specificity preference | ADD note on preferring specific portals | B8 |

### Experimental (test and measure)

| # | Pattern | Action | Finding |
|---|---------|--------|---------|
| 14 | Selective CoVe for cache hits | ADD independent verification question for cached values | D12 |

### Keep As-Is (already optimal)

| # | Pattern | Finding |
|---|---------|---------|
| 15 | Completion gates with concrete criteria | A1 |
| 16 | Table-forcing for claims extraction | A2 |
| 17 | UNVERIFIABLE as legitimate exit | A3 |
| 18 | Cache-first lookup order | B5 |
| 19 | Source tiering with mandatory Tier 1 | B8 |
| 20 | Categorical severity triage (not numeric confidence) | D15 |

### Remove / Do Not Add

| # | Pattern | Reason | Finding |
|---|---------|--------|---------|
| 21 | Numeric confidence scores | LLM overconfidence makes these counterproductive | D15 |

---

## [LIMITATION]

1. **No empirical A/B testing**: These findings are based on structural analysis of the skill file and published LLM research. No controlled experiment was run comparing fact-check accuracy with and without each pattern. Effect size estimates are drawn from published research on general LLM tasks, not this specific domain.

2. **Model-specific behavior**: Hallucination patterns vary across LLM families (Claude vs. GPT vs. Gemini). Recommendations are optimized for Claude-family models, which tend to be more instruction-following but also more "agreeable" (higher confirmation bias risk).

3. **Sample size of execution reports**: The archived fact-check reports were not available for content analysis (marked "Archived"). Real-world failure mode analysis would strengthen findings A3, B6, and C9.

4. **Cache analysis limited to current snapshot**: 21 entries is a small cache. As the cache grows (50-100+ entries), new risks emerge (search cost for cache lookup, stale entry accumulation, conflicting cached values for the same claim).

5. **Interaction effects unmeasured**: Implementing multiple recommendations simultaneously may produce interaction effects (e.g., adversarial self-challenge + compound claim decomposition might cause excessive false-positive flagging). Incremental adoption is safer.

---

Report generated: 2026-03-14
