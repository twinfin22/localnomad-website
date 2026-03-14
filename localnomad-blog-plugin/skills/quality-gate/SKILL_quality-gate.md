---
name: quality-gate
description: Subagent orchestrator for 5-layer quality validation. Spawns parallel reviewers, collects JSON reports, applies fixes sequentially. Called during STAGE 4 of the /blog pipeline.
---

# Quality Gate — Subagent Orchestrator

Run during STAGE 4. Spawns 5 parallel subagents, each with only its own rules. All layers must PASS before publication.

## Inputs (from stage4-input.json)

- `draftText` — full MDX draft content
- `stage3.country` — post country (korea/japan/taiwan/sea/global)
- `stage3.category` — post category (guides/comparisons/tips/stories/news/updates)
- `stage3.draftFilePath` — path to draft file on disk

## Phase 1: Parallel Review (read-only)

Spawn all 5 subagents simultaneously using the Agent tool. Each subagent reads ONLY its assigned files.

### Subagent prompt template

```
You are a [LAYER_NAME] reviewer for a LocalNomad blog post.

## Input
- Draft path: [stage3.draftFilePath] — read this file
- Country: [stage3.country]
- Category: [stage3.category]

## Your Rules
[Read the files listed below — nothing else]

## Output
Return ONLY valid JSON matching contracts/stage4-layer-report.schema.json:
{
  "layer": "[layer_name]",
  "result": "PASS" or "FAIL",
  "critical": [{"id": "...", "claim": "...", "issue": "...", "fix": "..."}],
  "moderate": [...],
  "low": [...],
  "fixes_applied": [],
  "metadata": {}
}
```

### Layer assignments

| Layer | `LAYER_NAME` | Files to read |
|-------|-------------|---------------|
| fact-check | fact-checker | `skills/fact-checker/SKILL_fact-checker.md` + `skills/fact-checker/references/government-sources-{country}.md` + grep `skills/fact-checker/references/verified-claims-cache.md` for matching claims only |
| seo-audit | seo-auditor | `skills/seo-engine/references/seo-checklist.md` |
| anti-ai | anti-ai reviewer | `skills/quality-gate/references/anti-ai-checklist.md` |
| legal | legal reviewer | `skills/legal-bright-lines/SKILL_legal-bright-lines.md` + `skills/legal-bright-lines/references/disclaimer-templates.md` |
| voice | voice reviewer | `skills/blog-voice/SKILL_blog-voice.md` |

Write each subagent's JSON report to: `$TMPDIR/blog-pipeline/stage4-reports/{layer}.json`

### Layer 1b: Contrarian Verification (after fact-check completes)

After the fact-check subagent returns its JSON report, spawn a contrarian subagent:

```
Agent(subagent_type="oh-my-claudecode:critic",
      model="sonnet",
      prompt="Read skills/fact-checker/SKILL_fact-contrarian.md and execute.
              Input: [VERIFIED claims from fact-check report SOURCE TABLE only]
              Do NOT read the blog post draft. Do NOT receive blog text.")
```

Write contrarian report to: `$TMPDIR/blog-pipeline/stage4-reports/contrarian.json`

Any ESCALATED claims from the contrarian are merged into the fact-check report as CRITICAL items before Phase 2.

## Phase 2: Sequential Fix (write operations)

After ALL reports are collected (5 layers + contrarian), apply fixes to the draft in this order:

1. **Critical fact corrections** — wrong visa requirements, policy details, + ESCALATED claims from contrarian
2. **Moderate fact corrections** — outdated stats, process differences (from fact-check report)
3. **Anti-AI rewrites** — banned words, banned structures, structural fixes (from anti-ai report)
4. **Voice adjustments** — ESL-friendly, word count, jargon explanations (from voice report)
5. **Source link injection** — run `skills/fact-checker/SKILL_source-link-injector.md` using the fact-check report's SOURCE TABLE. Only inject URLs with Status=VERIFIED. Do NOT fetch new URLs.
6. **Legal disclaimer insertion** — if missing (from legal report)
7. **SEO fixes** — meta description, title, slug corrections (from seo-audit report)

This ordering ensures source links injected in step 5 are not overwritten by anti-AI or voice rewrites.

Max 3 auto-fix attempts per layer. After 3 failures, flag for Gen's manual review at CP2.

## Phase 1 Verification Pass

After Phase 2, re-spawn the same 5 subagents as a verification pass (no fixes — confirm all layers PASS). Verification pass reuses Phase 1 fetched-pages tracker as read-only cache — only re-verify claims touched by Phase 2 fixes.

## Aggregated Output

Merge all 5 layer reports into `$TMPDIR/blog-pipeline/stage4-output.json`:

```json
{
  "overallResult": "PASS" | "FAIL",
  "layers": {
    "fact-check": { ...layer-report... },
    "seo-audit": { ...layer-report... },
    "anti-ai": { ...layer-report... },
    "legal": { ...layer-report... },
    "voice": { ...layer-report... }
  },
  "fixesApplied": [...all fixes across all layers...],
  "verificationPass": "PASS" | "FAIL"
}
```

Present aggregated results at CHECKPOINT 2 using the Quality Report format:

```
=== QUALITY REPORT ===

Layer 1 — Fact-Check: PASS/FAIL
Layer 2 — SEO Audit: PASS/FAIL [hard failures listed]
  Soft rule warnings: [list if any]
Layer 3 — Anti-AI: PASS/FAIL
  Banned words found: [count] | Banned structures: [count]
Layer 4 — Legal: PASS/FAIL
Layer 5 — Voice & Readability: PASS/FAIL
  Word count: [N] (target for [category]: [range])

Source Table: [from fact-check layer report metadata.sourcesUsed]
Next steps: [suggestions]
```
