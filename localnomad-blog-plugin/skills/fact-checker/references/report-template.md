# Fact-Checker Report Template

Use this format when returning results from the fact-checker skill. Quality-gate Layer 1 (fact-check subagent) must return output matching this template AND the JSON schema at `contracts/stage4-layer-report.schema.json`.

---

## Human-Readable Report

```
=== FACT-CHECK REPORT ===

Post: [title]
Date checked: [YYYY-MM-DD]
Claims found: [N]
Verified: [N] | Failed: [N] | Unverifiable: [N]
Tool budget used: search=[N] | scrape=[N] | extract=[N]

--- CRITICAL ISSUES ---
[list each: claim text | expected value | what was found | fix required]

--- MODERATE ISSUES ---
[list each: claim text | issue | recommended fix]

--- LOW ISSUES ---
[list each: claim text | issue]

--- UNVERIFIABLE CLAIMS ---
[list each: claim text | reason | search queries attempted (up to 3)]

--- SOURCE TABLE ---
| # | Claim | Type | Source | Tier | Date | URL | Status |
|---|-------|------|--------|------|------|-----|--------|
| 1 | [claim text] | A/B/C/D/E | [source name] | 1/2/3 | [date] | [full URL] | VERIFIED/FAILED/UNVERIFIED |

Notes:
- URLs MUST be specific pages, not domain homepages. `immigration.go.kr` alone = FAIL.
- If exact URL cannot be retrieved: "[domain] — specific page not retrievable, manual verification required"

--- CONTEXT CHECKS ---
[ ] No omitted conditions
[ ] No outdated framing
[ ] No comparison gaps
[ ] No jurisdiction confusion
[ ] No internal contradictions

--- SOURCE LINKS INJECTED ---
| # | Claim | Source URL | Placement (section + approx line) |
|---|-------|-----------|-----------------------------------|
| 1 | [claim] | [URL] | [section heading, line ~N] |

Links added: [N] | Already present: [N] | Skipped (no suitable URL): [N]

--- FETCHED-PAGES TRACKER ---
| # | URL | Tool Used | Content Summary | Claims Verified Against |
|---|-----|-----------|-----------------|------------------------|

RESULT: PASS / FAIL (CRITICAL) / FAIL (MODERATE) / NEEDS REVIEW
```

---

## JSON Report (stage4-layer-report.schema.json)

Also return a JSON object for the quality-gate orchestrator:

```json
{
  "layer": "fact-check",
  "result": "PASS",
  "critical": [],
  "moderate": [],
  "low": [],
  "fixes_applied": [],
  "metadata": {
    "claimsChecked": 0,
    "sourcesUsed": []
  }
}
```

Write this JSON to: `$TMPDIR/blog-pipeline/stage4-reports/fact-check.json`
