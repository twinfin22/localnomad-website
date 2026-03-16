# LLM Hallucination Taxonomy for Fact-Checking Pipelines

**Domain:** East Asian Immigration/Visa Content (Korea, Japan, Taiwan, China)
**Date:** 2026-03-14
**Evidence Base:** 132 corrections across 28 blog posts (5 verification passes)
**Pipeline:** 6-step fact-checker with MUST gates, verified-claims cache, fetched-pages tracker

---

## Executive Summary

This taxonomy classifies 10 distinct hallucination failure modes observed when an LLM
performs fact-checking on immigration and visa content. The taxonomy is grounded in
empirical evidence: 132 corrections found across 5 independent verification passes of
28 blog posts covering Korea, Japan, Taiwan, and China immigration topics.

**Key finding:** The two most dangerous failure modes are not the ones that produce
obviously wrong output. Numerical Drift (H1) and Source Confabulation (H2) are visible
and catchable. The truly dangerous modes are Anchoring Confirmation Bias (H4) and
Completion Pressure (H7) — systemic biases that cause the LLM to mark wrong claims
as VERIFIED, producing clean-looking reports that pass human review unchallenged.

### Severity Distribution

```
CRITICAL (3):  H1 Numerical Drift, H2 Source Confabulation, H3 Cross-Jurisdiction
HIGH     (5):  H4 Anchoring Bias, H5 Shallow Verification, H6 Temporal Confusion,
               H7 Completion Pressure, H8 False Verification
MODERATE (2):  H9 Cache Poisoning, H10 Omitted Condition
```

### Frequency Chart (corrections attributed per category)

```
H1  Numerical Drift          |########################### 27
H5  Shallow Verification     |########                     8
H6  Temporal Confusion       |######                       6
H3  Cross-Jurisdiction       |#####                        5
H8  False Verification       |#####                        5
H2  Source Confabulation      |####                         4
H10 Omitted Condition        |####                         4
H9  Cache Poisoning          |                             0 (potential, mitigated)
H4  Anchoring Bias           |~~~~~~~~~~~~~~               systemic
H7  Completion Pressure      |~~~~~~~~~~~~~~               systemic
                              0    5   10   15   20   25   30
```

`~` = systemic effect not directly attributable to individual corrections
Quantifiable corrections: 59 of 132. Remainder attributed to systemic H4/H7 effects.

---

## H1: Numerical Drift

**Severity: CRITICAL** | 
**Corrections: 27**

### Definition

The LLM subtly alters numbers during verification or content generation — rounding, substituting nearby plausible values, or confusing related but distinct thresholds.

### Why This Severity

Wrong financial thresholds cause applicants to under-prepare (insufficient funds) or over-prepare (unnecessary expense). Immigration applications are rejected on exact numbers.

### Real Examples from This Pipeline

- Korea F-1-D income: ₩88.1M written as ₩100M — 27 instances across 6 files. The LLM rounded 2x GNI (₩49,955,000 × 2 = ₩99,910,000) differently in different contexts.
- WeChat Pay transaction limit: ¥6,500 written instead of ¥6,000 — plausible-looking number, off by 8%.
- Japan DN visa income: incorrect threshold propagated into F-1-D comparison table (caught in pass 4).

### Detection Signals

- Numbers that are 'too round' (₩100M vs ₩99.9M vs ₩88.1M) — suspiciously clean figures
- Same data point appearing with different values across files (cross-post inconsistency)
- Numbers near but not equal to government-published thresholds
- Currency amounts that don't match any official fee schedule

### Prevention Patterns

- EXACT-MATCH CACHE: Pre-load verified numerical values in a claims cache with source URLs. The LLM checks the cache before generating any number. (Implemented: verified-claims-cache.md)
- CROSS-POST CONSISTENCY CHECK: After fixing a number, grep all files for the old value. The ₩88.1M→₩100M fix required updating 27 instances.
- VOLATILITY TAGGING: Mark numbers with update cycles (e.g., 'updates every April 1') so the LLM knows when a cached value expires.
- QUOTE-DON'T-PARAPHRASE: Instruct the LLM to copy numbers character-for-character from sources, never round or convert.

---

## H2: Source Confabulation

**Severity: CRITICAL** | 
**Corrections: 4**

### Definition

The LLM generates plausible-looking URLs, form numbers, or document references that do not exist. The fabricated references look authentic because they follow real naming conventions.

### Why This Severity

Users follow fabricated form numbers to immigration offices and are turned away. Broken URLs erode trust and waste time.

### Real Examples from This Pipeline

- Fabricated form codes TM-188 and TM-200 — these follow Thai immigration form naming conventions (TM-prefix) but were applied to KOREAN visa content. The real forms are Form No. 17 (사증발급신청서) and Form No. 34 (통합신청서).
- Homepage-level URLs (immigration.go.kr) cited as 'source' without specific page paths — the domain is real but the LLM never fetched the actual page.

### Detection Signals

- Form/document codes that mix jurisdictional naming conventions (Thai TM- prefix on Korean forms)
- URLs that resolve to domain homepages or 404 pages
- References with suspiciously specific-looking codes that don't appear in any government database
- Source citations that lack page-level specificity (domain only, no path)

### Prevention Patterns

- 5-POINT URL CHECK: Enforce domain authenticity, content match, date freshness, specificity (not homepage), and accessibility for every source URL. (Implemented: Step 3)
- FORM NUMBER REGISTRY: Maintain a reference table of real form numbers per country. Any form code not in the registry triggers a MUST-VERIFY flag.
- JURISDICTION BINDING: When verifying a Korea claim, ONLY accept Korea-origin form codes. Thai/Japanese form conventions are automatic red flags.
- SCRAPE-THEN-CITE: Never cite a URL without first scraping its content and confirming the claim appears on the page.

---

## H3: Cross-Jurisdiction Contamination

**Severity: CRITICAL** | 
**Corrections: 5**

### Definition

The LLM applies rules, form codes, processes, or requirements from one country to another. This happens because immigration systems share structural similarities (visa categories, income thresholds, form-based applications) that the LLM pattern-matches across incorrectly.

### Why This Severity

Applying Korean rules to Taiwan (or vice versa) produces completely wrong guidance. Each jurisdiction's immigration law is sovereign and non-transferable.

### Real Examples from This Pipeline

- Thai form codes TM-188/TM-200 applied to Korean visa applications — the LLM drew from Thai immigration patterns because the structural context (form + visa + application) was similar.
- Taiwan pension: stated as mandatory 6% when it's actually voluntary up to 6% for employees — confused with Korea's mandatory National Pension contribution structure.
- Risk of Korea's F-2 points system details bleeding into Taiwan Gold Card discussions (similar 'points-based' framing).

### Detection Signals

- Form codes or process names from Country A appearing in Country B content
- Structural similarities between countries (both have 'points-based' visas) producing blended descriptions
- Pension/insurance/tax rules that match a different country's system more closely than the target country
- Step 5 nuance check: 'jurisdiction confusion' category catches this

### Prevention Patterns

- COUNTRY-SCOPED VERIFICATION: During fact-checking, bind each claim to a single country. Sources from other countries are inadmissible for that claim.
- JURISDICTION FIREWALL in prompt: 'When verifying [Country X] claims, do NOT use knowledge about [Country Y] systems. If you find yourself reasoning by analogy to another country, STOP and search for the actual [Country X] source.'
- COUNTRY-SPECIFIC SOURCE LOADING: Load only the target country's government source URLs into context. (Implemented: conditional country loading in Preparation phase)
- COMPARISON TABLE AUDIT: When posts compare countries side-by-side, verify each cell independently against its own country's sources.

---

## H4: Anchoring Confirmation Bias

**Severity: HIGH** | 
**Corrections: systemic (not directly quantifiable)**

### Definition

The LLM anchors on the claim text being verified and then searches for evidence to CONFIRM it rather than TEST it. The verification becomes a confirmation exercise rather than a falsification exercise.

### Why This Severity

This is the most insidious failure mode because it produces 'VERIFIED' results for incorrect claims. The report looks clean but the underlying data is wrong.

### Real Examples from This Pipeline

- D-8 '50% tax penalty' claim: marked as verified in initial checks despite no official source confirming the specific 50% figure. The LLM found general tax penalty information and anchored it to the 50% claim.
- The fact-check summary reports 99%+ accuracy with 100+ claims verified — but the subsequent 5-pass deep check found 132 corrections. The initial 'verification' was anchored on confirming existing content.
- VERIFIED status assigned to claims where the source 'directionally' supported the claim but differed on specifics.

### Detection Signals

- VERIFIED claims where the source URL discusses the topic generally but doesn't contain the exact number/rule
- Verification reports with suspiciously high pass rates (99%+) — real fact-checking should find more issues
- Source content that 'supports' the claim only if you read it charitably
- Absence of any FAILED or UNVERIFIABLE claims in a report covering 10+ claims

### Prevention Patterns

- FALSIFICATION FRAMING: Instruct the LLM to search for evidence AGAINST the claim first. 'Try to disprove this claim. If you cannot disprove it with evidence, then it is provisionally verified.'
- EXACT-MATCH REQUIREMENT: For Type B (requirement) and Type D (policy) claims, the source must contain the EXACT value. 'Directionally correct' is not sufficient.
- MULTI-PASS ARCHITECTURE: Run multiple independent verification passes. The 5-pass approach found errors that single-pass missed because each pass starts fresh without anchoring on previous 'VERIFIED' status.
- COMPLETION PRESSURE AWARENESS: Add explicit instruction: 'It is better to mark a claim UNVERIFIABLE than to mark it VERIFIED without exact source confirmation. UNVERIFIABLE is not a failure state.'

---

## H5: Shallow Verification

**Severity: HIGH** | 
**Corrections: 8**

### Definition

The LLM checks that a relevant domain/page exists but does not verify that the specific claim appears on that page. Verification stops at 'the right website exists' rather than 'the right website says this specific thing.'

### Why This Severity

Creates false confidence. The report shows real, accessible URLs, but the URLs don't actually contain the claimed information.

### Real Examples from This Pipeline

- Homepage-level citations: immigration.go.kr cited as source without drilling to the specific visa page or PDF attachment.
- The FACT-CHECK-SUMMARY uses sources like 'Published guidelines' and 'Official requirements' without specific page URLs — indicating verification stopped at domain level.
- Korean government sites publish rules as PDF attachments. Checking the HTML page without opening the PDF misses the actual requirements.

### Detection Signals

- Source URLs that are domain homepages or section landing pages (not specific content pages)
- Source descriptions like 'Official website' or 'Published guidelines' without page-level URLs
- Government sites known to use PDF attachments — if the source URL is .html but the data is in a .pdf
- Step 3 check #4 (Specificity) catches this: 'Homepage alone = FAIL'

### Prevention Patterns

- MANDATORY SCRAPE-AND-QUOTE: For every VERIFIED claim, the LLM must quote the exact passage from the source that confirms it. No quote = UNVERIFIABLE.
- HOMEPAGE REJECTION RULE: Any URL ending at a domain root or section index is automatically rejected. Must be a specific content page. (Implemented: Step 3, point 4)
- PDF AWARENESS: For East Asian government sites, instruct the LLM to look for PDF attachments on the page and scrape those too.
- FETCHED-PAGES TRACKER with content summary: Record what each page actually contained, so the verification can be audited. (Implemented: fetched-pages tracker)

---

## H6: Temporal Confusion

**Severity: HIGH** | 
**Corrections: 6**

### Definition

The LLM conflates current and historical requirements, treats outdated information as current, or fails to note that a value has an update cycle.

### Why This Severity

Immigration rules change. Using a 2024 income threshold for a 2026 application causes rejection. Presenting a pilot program as if it's the current permanent program misleads applicants.

### Real Examples from This Pipeline

- Korea F-1-D income threshold updates every April 1 based on previous year GNI — this update cycle was not documented, causing stale values to persist across posts.
- K-STAR program described with 2023 pilot framing ('5 universities') without noting 2025 expansion to 32 universities.
- K-ETA exemption has an expiration date (Dec 31, 2026) that must be tracked — initial content didn't distinguish permanent visa-free access from temporary K-ETA exemption.
- Seishun 18 Kippu pricing and rules changed (no group sharing since Oct 2024) but old format persisted in content.

### Detection Signals

- Data points without 'as of [date]' qualifiers
- Programs described without noting their phase (pilot vs. permanent vs. expanded)
- Income/fee thresholds that match a previous year's published value but not the current year
- Step 4 freshness check: max 6 months for Type B/D claims

### Prevention Patterns

- VOLATILITY FIELD in claims cache: Each cached value includes an update cycle ('Annual Apr 1', 'Seasonal', 'Rare') and a Next Review date. (Implemented: verified-claims-cache.md)
- MANDATORY DATE QUALIFICATION: Any Type A (stat) claim older than 12 months must include 'as of [date]' in the post. (Implemented: Step 4 freshness rules)
- EXPIRATION TRACKING: Time-limited policies (K-ETA exemption, pilot programs) get explicit expiration dates in the cache.
- PROGRAM PHASE TAGGING: Require the LLM to state whether a program is pilot/permanent/expanded/sunset when describing it.

---

## H7: Completion Pressure (Clean Report Bias)

**Severity: HIGH** | 
**Corrections: systemic (not directly quantifiable)**

### Definition

The LLM has a systematic bias toward producing 'clean' reports — marking claims as VERIFIED rather than UNVERIFIABLE to avoid the appearance of incomplete work. This is an emergent property of instruction-following models optimized for helpfulness.

### Why This Severity

A false VERIFIED is worse than an honest UNVERIFIABLE. UNVERIFIABLE triggers manual review; false VERIFIED passes through the pipeline unchecked.

### Real Examples from This Pipeline

- Initial fact-check report: 99%+ pass rate across 100+ claims. Subsequent 5-pass deep check: 132 corrections found. The gap suggests the initial pass was biased toward VERIFIED.
- D-8 '50% tax penalty': initially verified, later flagged as UNVERIFIABLE when no source could confirm the specific percentage.
- 19 items deferred as LOW rather than flagged as UNVERIFIABLE in early passes — completion pressure pushed the LLM to downgrade severity rather than admit inability to verify.

### Detection Signals

- Reports with >95% VERIFIED rate — suspiciously clean for real-world immigration content
- Absence of UNVERIFIABLE claims in a report (every real verification has unknowns)
- Severity downgrading: items marked LOW that should be MODERATE or CRITICAL
- Claims verified against Tier 2/3 sources when the protocol requires Tier 1 for Type B/D

### Prevention Patterns

- NORMALIZE UNVERIFIABLE: Explicit instruction that UNVERIFIABLE is a valid, expected outcome — not a failure. 'A report with 0 UNVERIFIABLE claims is suspicious. Flag this for review.' (Partially implemented: abort conditions)
- MINIMUM UNVERIFIABLE QUOTA: For reports with 15+ claims, expect at least 1-2 UNVERIFIABLE items. If zero, the LLM must explain why every single claim was verifiable.
- SEVERITY SEPARATION: Have the LLM assign severity BEFORE determining verification status. Prevents the bias of 'this is LOW priority so I'll just mark it VERIFIED.'
- INDEPENDENT MULTI-PASS: Each pass starts fresh without seeing previous pass results. (Used: 5 passes found progressively fewer but still real errors)

---

## H8: False Verification (Source Mismatch)

**Severity: HIGH** | 
**Corrections: 5**

### Definition

The LLM declares a claim VERIFIED but the cited source actually says something different from the claim — a different number, a different condition, or a different scope.

### Why This Severity

The source URL is real and accessible, making the error hard to catch in review. The reader trusts the source link but the claim doesn't match what the source actually says.

### Real Examples from This Pipeline

- Taiwan pension: source says employee contribution is 'voluntary up to 6%' but the claim stated it as mandatory 6%. The source was real but the claim misrepresented it.
- B-2 tourist visa: '106+ countries' verified against a source that actually distinguishes between 106 visa-exempt countries and 67 K-ETA-exempt countries — the claim conflated two separate numbers.
- Verified values that are 'directionally correct' (e.g., threshold is roughly right) but differ on specifics that matter for applications.

### Detection Signals

- Claims where the source discusses the same topic but the specific values don't match exactly
- Verification notes that say 'confirmed' without quoting the exact passage
- Claims that are 'directionally correct' — right ballpark but wrong specifics
- Step 3 check #2 (Content match) catches this: 'Page actually contains the claimed information?'

### Prevention Patterns

- QUOTE EXTRACTION: For every VERIFIED Type B/D claim, extract and record the exact sentence from the source that confirms it. If no exact sentence exists, the claim is UNVERIFIABLE.
- DIFF-CHECK: Compare the claim text against the source text character-by-character for numerical claims. Flag any discrepancy, even small ones.
- TWO-COLUMN AUDIT: Present 'Claim says X' vs 'Source says Y' side-by-side. Any delta = FAILED, not VERIFIED. (Used in Taiwan quiz design per legal-bright-lines)
- CONTENT MATCH ENFORCEMENT: Step 3's 5-point check makes this a hard gate. (Implemented)

---

## H9: Cache Poisoning

**Severity: MODERATE** | 
**Corrections: 0**

### Definition

A wrong value enters the verified-claims cache (either from an initial hallucination or from a source that changed) and then propagates to all subsequent fact-check runs without re-verification.

### Why This Severity

The blast radius is large (all future runs trust the cached value) but the probability is lower if the initial verification is rigorous. The cache amplifies any H1-H8 error that makes it through.

### Real Examples from This Pipeline

- If the ₩88.1M value had been cached as the 'verified' F-1-D income threshold, every subsequent fact-check would have propagated the wrong number without re-checking.
- Cache staleness: behavior undefined on exact Next Review date (is the review date inclusive or exclusive?) — timezone ambiguity could cause a stale value to be trusted for an extra day.
- Cross-post consistency gap: cache helps within a single run but old posts published before a cache update still contain stale values.

### Detection Signals

- Cached values that were never independently verified (entered from LLM output, not from source scrape)
- Cache entries without source URLs or with homepage-level URLs
- Cache entries past their Next Review date still being used
- Multiple posts with the same wrong value (suggests cache propagation)

### Prevention Patterns

- SOURCE-URL MANDATORY: Every cache entry must have a specific (not homepage) source URL. (Implemented: verified-claims-cache.md has URL column)
- STALE-ON-BOUNDARY: If current date >= Next Review, the cache entry is stale. No grace period. (Identified gap: currently ambiguous)
- CACHE-WRITE GATE: Only values that pass the full 5-point URL check can enter the cache. No 'soft verified' entries.
- CROSS-POST SWEEP: After updating a cached value, automatically scan all published posts for the old value. (Identified gap: not yet implemented)

---

## H10: Omitted Condition Hallucination

**Severity: MODERATE** | 
**Corrections: 4**

### Definition

The LLM states a claim that is technically true but omits a critical qualifying condition, making the claim misleading. This is a hallucination of completeness — the LLM presents a partial truth as the whole truth.

### Why This Severity

Omitted conditions cause applicants to begin processes they don't qualify for, wasting time and money. Less dangerous than wrong numbers but still leads to real-world harm.

### Real Examples from This Pipeline

- Japan DN visa: ward registration described as available, but DN visa holders do NOT receive a Residence Card and therefore CANNOT do ward registration. The process step was technically describable but inapplicable to the visa type.
- 'You get F-2 on graduation' — technically possible but only with university president's recommendation (omitted condition).
- E-7 job change FAQ: 'Yes, you can change jobs' without mentioning the 15-day reporting deadline, required employer documents, or occupation category constraint.

### Detection Signals

- Claims that use unqualified 'can' or 'will' language without conditions
- Process descriptions that omit prerequisite steps
- Step 5 nuance check: 'omitted conditions' category catches this
- FAQ answers that are shorter than the complexity of the real process warrants

### Prevention Patterns

- CONDITION EXTRACTION: For every Type B/C claim, require the LLM to list ALL conditions mentioned in the source, not just the headline rule.
- PREREQUISITE CHAIN: For process claims, require the LLM to verify each step's prerequisites — 'Can step N happen if step N-1 has not been completed for this visa type?'
- NUANCE CHECK (Step 5): Explicitly check for omitted conditions as one of 5 mandatory categories. (Implemented)
- VISA-TYPE BINDING: When describing a process, always check whether it applies to the specific visa sub-type, not just the visa category.

---

## Interaction Matrix: How Failure Modes Compound

Hallucination types rarely occur in isolation. The most dangerous scenarios involve
chains where one failure mode feeds another:

```
H1 (Numerical Drift) + H4 (Anchoring) = Wrong number gets VERIFIED because the LLM
   anchors on the claim and finds 'close enough' evidence.
   Real case: F-1-D income initially verified at wrong threshold.

H2 (Source Confabulation) + H3 (Cross-Jurisdiction) = Fabricated reference uses naming
   conventions from wrong country, making it look authentic to someone unfamiliar.
   Real case: Thai TM-188 code on Korean visa form.

H5 (Shallow Verification) + H7 (Completion Pressure) = LLM checks domain existence,
   marks VERIFIED to complete the report, never reads actual page content.
   Real case: Homepage-level citations in initial fact-check reports.

H6 (Temporal Confusion) + H9 (Cache Poisoning) = Outdated value enters cache,
   propagates to all future runs until the Next Review date triggers re-verification.
   Potential case: GNI-based thresholds that update annually.

H8 (False Verification) + H10 (Omitted Condition) = Source confirms the headline claim
   but the LLM misses qualifying conditions in the same source document.
   Real case: Taiwan pension voluntary vs mandatory, Japan DN ward registration.
```

---

## Context Engineering Recommendations (Priority Order)

### Tier 1: Already Implemented (validate effectiveness)

| Pattern | Addresses | Implementation |
|---------|-----------|----------------|
| Verified-claims cache with volatility tags | H1, H6, H9 | `verified-claims-cache.md` |
| 5-point URL check with homepage rejection | H2, H5 | Step 3 of SKILL_fact-checker.md |
| Country-scoped source loading | H3 | Preparation phase conditional loading |
| MUST gates and completion checklists | H7 | All 6 steps have gates |
| Fetched-pages tracker | H5, H9 | Preparation phase initialization |
| Step 5 nuance check (5 categories) | H10, H3 | Jurisdiction confusion + omitted conditions |
| Multi-pass verification (5 passes) | H4, H7 | Manual process, not automated |

### Tier 2: Recommended Additions

| Pattern | Addresses | Effort | Impact |
|---------|-----------|--------|--------|
| QUOTE EXTRACTION gate: every VERIFIED Type B/D claim must include exact quoted passage from source | H4, H5, H8 | Medium | High |
| FALSIFICATION framing: 'try to disprove this claim first' instruction | H4, H7 | Low | High |
| MINIMUM UNVERIFIABLE quota: flag reports with 0 UNVERIFIABLE as suspicious | H7 | Low | Medium |
| CROSS-POST SWEEP after cache update: grep all posts for old value | H1, H9 | Medium | High |
| FORM NUMBER REGISTRY: per-country reference of valid form codes | H2, H3 | Low | Medium |
| DIFF-CHECK for numerical claims: character-level comparison of claim vs source | H1, H8 | Medium | High |

### Tier 3: Architectural (future consideration)

| Pattern | Addresses | Effort | Impact |
|---------|-----------|--------|--------|
| Automated multi-pass: run 2-3 independent verification passes programmatically | H4, H7 | High | Very High |
| Claim-source pair database: every verified claim stored with its source quote for audit trail | All | High | Very High |
| Watchlist for volatile claims: auto-flag claims touching known volatile data points | H1, H6 | Medium | Medium |

---

## Limitations

- **[LIMITATION]** This taxonomy is derived from a single domain (East Asian immigration). Other fact-checking
  domains (medical, financial, legal) may exhibit different failure mode distributions.
- **[LIMITATION]** The 132-correction evidence base comes from content generated and verified by the same LLM
  family (Claude). Different LLM architectures may exhibit different hallucination patterns.
- **[LIMITATION]** Systemic categories H4 and H7 are inferred from the gap between initial verification (99%+)
  and deep verification (132 corrections). The attribution is indirect — we observe the effect, not the
  internal mechanism.
- **[LIMITATION]** The corrections-per-category attribution (59 of 132 quantifiable) is approximate.
  Some corrections span multiple categories (e.g., a wrong number from the wrong country is both H1 and H3).
- **[LIMITATION]** Cache Poisoning (H9) is rated MODERATE based on potential risk, not observed frequency.
  The cache was implemented after the 5-pass audit, so its failure modes are theoretical.
- **[LIMITATION]** Sample size for some categories is small (n=3-5 examples). Larger-scale analysis across
  more content and more verification cycles would strengthen the taxonomy.

---

*Report generated: 2026-03-14 12:07 UTC*
*Research session: hallucination-taxonomy-2026-03-14*