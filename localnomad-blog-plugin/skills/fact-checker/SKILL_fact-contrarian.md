---
name: fact-contrarian
description: Counter-evidence verification for fact-checked claims. Receives VERIFIED claims without blog source text to prevent anchoring bias. Uses tiered model routing (sonnet default, opus escalation).
---

# Fact Contrarian — Counter-Evidence Verification

## Purpose

Challenge VERIFIED claims from the fact-checker by independently searching for counter-evidence. This skill runs as a separate agent to prevent anchoring bias — it never sees the original blog post text.

## Input Contract

**MUST receive:**
- Fact-check report's SOURCE TABLE (VERIFIED claims only)
- Each claim's: text, type, source URL, tier, verified value
- Each Type B/D claim's `effective_status` (CURRENT/ANNOUNCED/PROPOSED/DISCONTINUED)
- Each Type B/D claim's `framing_note` (how the post frames the claim vs actual status; null if effective_status = CURRENT)

**MUST NOT receive:**
- Original blog post text (prevents anchoring on the author's framing)
- The fact-checker's reasoning or confidence notes

Note: `framing_note` is a claim-level summary extracted by the fact-checker, NOT the original blog text. This preserves the no-blog-text principle while enabling E6 evaluation.

If blog post text is included in the prompt, STOP and report: "Contrarian must not receive blog source text. Remove it and re-invoke."

---

## Model Routing

- **Default**: sonnet (all VERIFIED claims, 1st pass)
- **Escalation**: opus (UNCERTAIN claims only, 2nd pass)

## Protocol (Sonnet — 1st Pass)

For each VERIFIED claim:

1. Read the claim text and its verified source URL
2. Generate 2-3 scenarios where this claim could be wrong, outdated, or misleading
3. For each scenario, run an independent web search (`WebSearch`) using different search terms than the original fact-checker likely used. Escalate to `firecrawl_search` only if WebSearch returns no relevant results after 2 attempts.
4. Evaluate search results:
   - **Counter-evidence found from a different source** → mark UNCERTAIN
   - **Same source, different interpretation** → mark UNCERTAIN
   - **No counter-evidence after 2 searches per scenario** → mark CONFIRMED

### Sonnet Output Table

```
| # | Claim | Result | Reason | Escalate? | Trigger |
|---|-------|--------|--------|-----------|---------|
```

Result: CONFIRMED or UNCERTAIN
Escalate: YES or NO
Trigger: E1-E5 code (if escalating) or N/A

---

## Escalation Triggers (Sonnet → Opus)

Mark UNCERTAIN and escalate when ANY of these apply:

| Code | Trigger | Example |
|------|---------|---------|
| E1 | Same-tier sources conflict on the data | visa.go.kr says ₩100M, immigration.go.kr says ₩88M |
| E2 | Claim compares rules across 2+ countries | "Korea F-1-D income is higher than Japan DN visa" |
| E3 | Source states the claim with conditions/exceptions | "₩100M... except for applicants over 65" |
| E4 | Policy changed within the last 6 months | Seishun 18 Kippu format changed Oct 2024 |
| E5 | Explicit uncertainty — cannot determine correctness | "I found conflicting dates and cannot resolve which is current" |
| E6 | Effective status mismatch | effective_status = ANNOUNCED/PROPOSED but framing_note indicates post presents as current law |
| E7 | Currency conversion mismatch | Source states USD equivalent that differs >15% from post's USD equivalent for same claim |

---

## Protocol (Opus — 2nd Pass)

Receives only UNCERTAIN claims from Sonnet, plus:
- Original verified source URL
- Counter-evidence source URL(s) found by Sonnet
- The specific escalation trigger code

For each UNCERTAIN claim:

1. Scrape both the original source and counter-evidence source (`firecrawl_scrape`)
2. Compare the specific data points, dates, and conditions
3. Determine which source is authoritative (higher tier, more recent, more specific)
4. Output: **CONFIRMED** (original was correct) or **ESCALATED** (original was wrong/misleading)

If ESCALATED: classify severity using fact-checker's Error Severity Triage (CRITICAL/MODERATE/LOW).

---

## Output

```
--- CONTRARIAN VERIFICATION ---
Pass 1 (Sonnet): [N] claims checked
  CONFIRMED: [N] | UNCERTAIN (escalated): [N]

Pass 2 (Opus): [N] claims re-checked
  CONFIRMED: [N] | ESCALATED: [N]

Escalated Claims:
| # | Claim | Original Source | Counter Source | Severity | Issue |
|---|-------|----------------|----------------|----------|-------|

RESULT: ALL CONFIRMED | [N] ESCALATED
```

---

## Integration

### In quality-gate pipeline (Phase 1):
```
fact-checker (Steps 1-5) → report
                              ↓
fact-contrarian (this skill) ← VERIFIED claims from report
                              ↓
ESCALATED claims → merge into fact-check report as CRITICAL
```

### In standalone /fact-check:
```
fact-checker (Steps 1-5) → report
fact-contrarian ← VERIFIED claims
source-link-injector ← final verified claims
```

Quality-gate or /fact-check invokes this skill via:
```
Agent(subagent_type="oh-my-claudecode:critic",
      model="sonnet",
      prompt="Read SKILL_fact-contrarian.md and execute on these claims: [SOURCE TABLE]")
```

Opus escalation is handled internally — the critic agent re-invokes with model="opus" for UNCERTAIN claims only.
