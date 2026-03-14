---
name: source-link-injector
description: Inject verified source links into blog post prose. Runs as Phase 2 Step 5 in quality-gate pipeline, or sequentially after fact-checker in standalone /fact-check mode.
---

# Source Link Injector

## Purpose

Inject inline source links into a blog post for claims verified by the fact-checker. Separated from the fact-checker to ensure links are injected AFTER anti-AI and voice rewrites (which may destroy links if run afterward).

## Input Contract

This skill requires the fact-checker's output report, specifically:

1. **SOURCE TABLE** — the verified claims with URLs and status
2. **FETCHED-PAGES TRACKER** — all URLs fetched during verification

Only inject URLs where Status = VERIFIED in the Source Table. Do NOT fetch new URLs. Do NOT re-run verification.

If the fact-check report is not available in context, STOP and report: "Source link injection requires a fact-check report. Run fact-checker first."

---

## Which claims need inline source links?

| Claim Type | Link Required? | Example |
|-----------|---------------|---------|
| B — Requirement (visa rules, eligibility) | **YES — mandatory** | "income threshold of ₩100M — [source](https://immigration.go.kr/...)" |
| D — Policy (government programs, law) | **YES — mandatory** | "expanded to 32 universities in Dec 2025 — [source](https://...)" |
| A — Stat (numbers, dates, amounts) | Recommended if Tier 1 source exists | "birth rate hit 0.72 — [source](https://kostat.go.kr/...)" |
| C — Process (how-to, timeline) | Optional — link to official portal once per section | "Apply at [HiKorea](https://www.hikorea.go.kr/)" |
| E — Attribution | Only if the original source is linkable | "According to [Korea Times](https://...)" |

## Link placement rules

1. **Natural inline links** — weave into sentence flow, not footnotes or parenthetical dumps
   - GOOD: "The F-1-D requires [₩100M annual income](https://immigration.go.kr/...) and ₩100M health coverage."
   - BAD: "The F-1-D requires ₩100M annual income. (Source: https://immigration.go.kr/...)"
2. **One link per claim** — don't stack multiple source links on the same sentence
3. **Tier 1 preferred** — link to government/official sources over media articles when both exist
4. **Deduplicate** — if the same source URL verifies multiple claims in the same section, link it once on the most prominent claim
5. **No broken links** — only inject URLs with Status = VERIFIED from the fact-check report
6. **Existing links preserved** — if the post already has a correct source link for a claim, do not duplicate or replace it

## Source link density target

- **Minimum**: Every section containing Type B or D claims has at least 1 source link
- **Maximum**: No more than 3 source links per paragraph (avoids link spam)
- **Comparison tables**: Link the most critical row (usually income/eligibility) to its source; not every cell

## Completion Gate

- [ ] Every Type B and D claim has an inline source link in the post (or is documented as "no suitable URL")
- [ ] Links are natural inline style, not footnotes or parenthetical
- [ ] No broken or unverified URLs injected (only VERIFIED status from fact-check report)
- [ ] Existing correct links preserved (not duplicated)
- [ ] No paragraph exceeds 3 source links

MUST NOT produce output until all gates pass.

## Output

```
--- SOURCE LINKS INJECTED ---
| # | Claim | Source URL | Placement (section + approx line) |
|---|-------|-----------|-----------------------------------|
| 1 | [claim] | [URL] | [section heading, line ~N] |
...

Links added: [N] | Already present: [N] | Skipped (no suitable URL): [N]
```
