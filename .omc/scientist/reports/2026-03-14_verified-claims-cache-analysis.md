# Verified-Claims-Cache Effectiveness Analysis

**Report date:** 2026-03-14  
**Analyst:** Scientist (oh-my-claudecode)  
**Research stage:** RESEARCH_STAGE:5  
**Scope:** 21 cache entries vs. 4 blog posts (48 total claims audited)

---

[OBJECTIVE] Assess the verified-claims-cache for coverage effectiveness, staleness risk, integrity, and hallucination potential across the LocalNomad fact-checker pipeline.

[DATA] 21 cache entries (Korea: 9, Japan: 6, Taiwan: 4, China: 2). 4 blog posts sampled: F-1-D Guide (13 claims), Japan-Korea-Taiwan Comparison (13 claims), Japan Ultimate Guide (12 claims), China Alipay/WeChat Guide (10 claims). Total: 48 claims audited.

---

## A. Cache Coverage

### Coverage Matrix

| Blog Post | Total Claims | Cache Hits | Cache Misses | Hit Rate | Crit (B/D) | Crit Hits | Crit Hit % |
|-----------|-------------|------------|--------------|----------|------------|-----------|------------|
| F-1-D Guide | 13 | 7 | 6 | 54% | 6 | 5 | 83% |
| Japan-Korea-Taiwan Comparison | 13 | 7 | 6 | 54% | 7 | 5 | 71% |
| Japan Ultimate Guide | 12 | 6 | 6 | 50% | 6 | 4 | 67% |
| China Alipay/WeChat Guide | 10 | 4 | 6 | 40% | 5 | 4 | 80% |
| **TOTAL** | **48** | **24** | **24** | **50%** | **24** | **18** | **75%** |

[FINDING] The cache achieves a 75% hit rate on Critical (Type B/D) claims — visa requirements, policy rules, government program details — across the 4 sampled posts.
[STAT:n] n=24 Critical claims audited across 4 posts
[STAT:effect_size] 18/24 Critical claims resolved from cache; 6 require live web fetch per run

[FINDING] Overall hit rate is 50% (24/48), with a sharp split: Critical claims hit 75%, Standard claims (A/C/E) hit only 25% (6/24).
[STAT:n] n=48 total claims; n=24 Standard claims
[STAT:effect_size] Standard claim miss rate: 75%. The cache is deliberately optimized for visa/policy facts, not cost-of-living statistics or process descriptions.

### Uncached High-Value Claims (Critical Gaps)

| Gap ID | Claim | Posts Affected | Risk |
|--------|-------|---------------|------|
| M1 | 183-day tax residency trigger (Korea + Japan) | 3 of 4 posts | HIGH |
| M6 | Japan NHI enrollment obligation (3+ months) | Japan Ultimate Guide | HIGH |
| M7 | Japan NHI exemption for DN visa holders | Japan Ultimate Guide | HIGH |
| M2 | Taiwan Gold Card — no income floor (portfolio-based) | Comparison | MEDIUM |
| M5 | Korea F-2-7 PR path after 5yr | Comparison | MEDIUM |
| M8 | Alipay ¥50K/transaction cap (direct binding) | China Guide | MEDIUM |
| M9 | Korea F-1-D eligible countries (~40 reciprocal) | Comparison | MEDIUM |
| M3 | Japan 74 tax treaties (MOF source) | Comparison | LOW-MEDIUM |
| M4 | Taiwan 35 tax treaty jurisdictions | Comparison | LOW-MEDIUM |

[FINDING] The 183-day tax trigger (M1) is the single largest cache gap: it appears in 3 of 4 sampled posts, is a Type D policy claim (Critical priority), and has no cache entry. Every fact-check run must re-fetch this from NTS/NTA.
[STAT:n] n=3 posts containing M1; n=9 total uncached Critical claims identified

---

## B. Staleness Risk

### Staleness Timeline

| Entry | Next Review | Days Remaining | Risk Level |
|-------|-------------|---------------|------------|
| K1 — F-1-D income threshold | 2026-04-15 | 32 | HIGH |
| K6 — GNI update cycle | 2026-04-15 | 32 | HIGH |
| J6 — NTT East 25Gbps | 2026-04-15 | 32 | MEDIUM |
| C1 — WeChat Pay limits | 2026-06-14 | 92 | MEDIUM |
| J5 — Seishun 18 Kippu | 2026-07-01 | 109 | LOW |
| All others (16 entries) | 2026-09-14 or later | 184+ | OK |

[FINDING] Zero entries are currently stale (all Next Review dates are in the future). However, 3 entries (K1, K6, J6) enter their review window within 32 days, and 2 of them (K1, K6) are directly linked to the April 1 GNI update — a known, calendar-bound change event.
[STAT:n] n=3 at-risk entries; n=21 total entries; n=0 currently stale

[FINDING] A structural 14-day gap exists between the GNI update date (April 1) and the cache review date for K1/K6 (April 15). During this window, any fact-check run will serve the old ₩100M income threshold as valid, even if the GNI-derived threshold changed on April 1.
[STAT:n] Gap window = 14 days; affects K1 (highest-priority visa requirement entry in the cache)

[FINDING] The WeChat Pay limits entry (C1) carries the annotation "Changed multiple times 2023-2025." Assuming approximately 5 changes over 24 months (one change per ~5 months), a 3-month review cycle gives a rough 60% probability that a change occurs between review cycles. Monthly review would be more appropriate.
[STAT:n] Historical volatility: ~5 changes / 24 months; review cycle: 3 months

---

## C. Cache Integrity

[FINDING] The write-back mechanism is advisory, not gated. The skill states "After any fact-check run that discovers new volatile data points, add them here" but no Step 6 completion gate item enforces this. The cache can grow stale by omission: a claim verified in run N continues to require a live fetch in run N+1, N+2 indefinitely.
[STAT:n] 0 of 6 completion gates mention cache write-back; 1 advisory instruction only

[FINDING] All 21 cache entries share verified_date = 2026-03-14 (today), indicating bulk population in a single session. No mechanism in the pipeline validates the initial seed values against live government sources before the cache goes into use.
[STAT:n] 21/21 entries have identical verified_date; population method undocumented

[FINDING] There is no early-invalidation mechanism. A cached entry that turns out to be wrong will continue to be served as authoritative until its Next Review date. The only trigger for re-verification is date staleness, not factual error discovery.
[STAT:n] Correction gap for K1/K6: 14 days (April 1–15, 2026)

---

## D. Hallucination Risk from Cache

[FINDING] The cache introduces a circular trust risk if its initial 21 entries were populated by an LLM pass rather than direct web verification. The skill instructs: "Check verified-claims-cache FIRST — if fresh, use cached value, STOP. No web lookup needed." If the seed values contain LLM-fabricated numbers, those numbers propagate to all future fact-check runs without challenge until the Next Review date.
[STAT:n] Validation method for initial 21 entries: not documented; all 21 entries could be affected if seed was unverified

[FINDING] The cache's primary value is Firecrawl cost reduction, not accuracy enhancement. Estimated 40–50% reduction in Firecrawl calls per multi-post fact-check run. The accuracy benefit is conditional on initial seed validity — which is currently unverifiable from the file alone.
[STAT:n] Estimated 17 calls saved across 4-post run (conservative 0.7 multiplier on 24 cache hits)

---

## Risk Summary

| Risk | Severity | Probability | Mitigation Present? |
|------|----------|-------------|---------------------|
| GNI update window (K1/K6 Apr 1-15) | HIGH | CERTAIN (annual) | Partial — review date set, but 14-day gap not acknowledged |
| WeChat limits change (C1) | MEDIUM | ~60%/quarter | Partial — 3-month cycle, but should be monthly |
| Circular trust on seed values | HIGH | UNKNOWN | None — no validation documented |
| Write-back not enforced | MEDIUM | HIGH (omission by default) | None — advisory only |
| Wrong-but-not-stale entry served | HIGH | Low (currently) | None — no early-invalidation |
| Cache coverage gap on 183-day tax | MEDIUM | CERTAIN (every run) | None — M1 not cached |

---

## Recommendations

1. **Add M1 to cache immediately** — 183-day tax residency trigger affects 3 of 4 current posts. Cache `nts.go.kr` and `nta.go.jp` entries. Review cycle: Annual.
2. **Add K1/K6 early-invalidation note** — explicitly flag in the cache: "If current date is April 1–14, treat as STALE until re-verified." Eliminates the 14-day blind spot.
3. **Upgrade C1 review to monthly** — WeChat Pay limit history warrants a 1-month not 3-month cycle. Change Next Review from 2026-06-14 to 2026-04-14.
4. **Gate write-back in Step 6** — add a completion gate item: "If new volatile claims were discovered and verified in this run, were they added to verified-claims-cache.md?" Block completion if not checked.
5. **Document seed validation** — add a note to the cache file header stating how the initial 21 entries were verified (web-scraped, human-reviewed, etc.). This breaks the circular trust ambiguity.
6. **Add NHI entries (M6/M7)** — Japan NHI rules affect the Japan Ultimate Guide and any future Japan content. Cache the 3-month enrollment rule and the DN visa exemption separately.

---

[LIMITATION] Claim classification (B/D vs A/C/E) was performed by analyst review of post text, not by running the actual fact-checker. Some claims may be reclassified by the LLM during a live run, which would change the hit rate calculation.

[LIMITATION] The Firecrawl call savings estimate (40-50%) assumes one call per domain per run. Actual savings depend on how aggressively the skill batches by domain. The estimate is directionally correct but not precise.

[LIMITATION] Hallucination risk assessment is based on structural analysis of the pipeline, not empirical testing of whether any specific cached value is actually wrong.

[LIMITATION] Only 4 of the published blog posts were sampled. Cache coverage may differ significantly for Taiwan-specific posts (Gold Card, DN visa) or SEA-region content, which currently has zero cache entries.
