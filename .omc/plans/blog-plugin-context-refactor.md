# Blog Plugin Context Engineering Refactor

## Problem Statement

Two pain points: (1) Quality Gate is unreliable — 5 validation layers compete for attention in a single context, causing missed rules and inconsistent enforcement. (2) Too many tokens — skills and references load wholesale when only fragments are needed.

## Requirements Summary

- **Scope**: Surgical fixes to existing 5-stage pipeline (no structural redesign)
- **Focus areas**: Quality Gate subagent isolation, lazy-load references, JSON contracts
- **Constraints**: Keep checkpoint flow, keep all existing skills, don't break `/blog` or `/fact-check`

## RALPLAN-DR Summary

### Principles (4)
1. **Isolate concerns** — each validation layer runs in its own context with only its own rules
2. **Load only what you need** — country-scoped references, stage-scoped skills
3. **Structured contracts** — JSON interfaces between stages replace implicit context carry-forward
4. **Proven patterns first** — apply reddit-karma's subagent architecture to blog pipeline

### Decision Drivers (3)
1. Quality Gate reliability (primary pain point)
2. Token efficiency (secondary pain point)
3. Minimal disruption to working pipeline

### Viable Options

**Option A: Subagent Isolation for Quality Gate (Recommended)**
- Spawn 5 parallel subagents for Quality Gate layers, each with only its own skill + references
- Main agent receives structured reports, applies Phase 2 fixes sequentially
- Pros: Each layer gets full attention, no rule bleeding, parallelizable
- Cons: Subagent overhead (~5 spawns), need to define report contracts

**Option B: Single Agent with Chunked Prompts**
- Keep single agent but restructure Quality Gate as 5 sequential prompts, clearing context between each
- Pros: Simpler, no subagent coordination
- Cons: Sequential (slower), context clearing is fragile, doesn't solve the "competing rules" problem as cleanly
- **Rejected**: Doesn't address the root cause (attention dilution) — just reduces symptoms

## Acceptance Criteria

1. Quality Gate spawns 5 independent subagents (fact-check, SEO, anti-AI, legal, voice) — each receives ONLY its layer's skill + references
2. Each subagent returns a structured JSON report (schema defined below)
3. `government-sources.md` split by country — fact-checker loads only relevant country file
4. `verified-claims-cache.md` queried via grep, not loaded wholesale
5. Stage 2→3 and Stage 3→4 pass structured JSON briefs (not implicit context)
6. `/blog` end-to-end still works with 2 checkpoints
7. `/fact-check` standalone command still works
8. Token reduction: Stage 4 peak load drops from ~4,500 to ~1,500 per subagent

## Implementation Steps

### Step 1: Define JSON Contracts Between Stages

**File**: `localnomad-blog-plugin/contracts/` (new directory)

```
contracts/
├── stage2-output.json    # keywords, headline, outline, unsplash terms
├── stage3-output.json    # draft file path, frontmatter, word count
├── stage4-input.json     # draft text + stage2 context (keywords, links)
├── stage4-layer-report.json  # per-layer report schema
└── stage4-output.json    # aggregated quality report + cover image
```

Each contract is a JSON Schema. Stages write output to `$TMPDIR/blog-pipeline/` during execution.

**Why JSON contracts matter for context engineering**: Currently, Stage 3 carries forward keywords/outline from Stage 2 via conversation history. By Stage 4, this context may be compressed or lost. A persisted JSON brief ensures nothing is dropped.

### Step 2: Split Quality Gate Into Subagent Architecture

**File to modify**: `commands/blog.md` (Stage 4 section, ~lines 191-240)
**File to modify**: `skills/quality-gate/SKILL_quality-gate.md` (rewrite as orchestrator)

Current:
```
Stage 4 → quality-gate/SKILL.md loads ALL 5 layers into main agent
```

New:
```
Stage 4 → quality-gate/SKILL.md becomes ORCHESTRATOR
  ├─ Spawn: fact-checker agent (SKILL + country-specific sources)
  ├─ Spawn: seo-audit agent (seo-checklist.md only)
  ├─ Spawn: anti-ai agent (anti-ai-checklist.md + banned-words.md)
  ├─ Spawn: legal agent (legal-bright-lines/SKILL + disclaimers)
  └─ Spawn: voice agent (blog-voice rules + word count targets)

  All 5 run in parallel → return JSON reports → orchestrator merges
  → Phase 2: sequential fixes based on merged report
```

Each subagent prompt template:
```markdown
You are a [LAYER_NAME] reviewer for a blog post.

## Input
- Draft text: [injected]
- Country: [from stage3 output]
- Category: [from stage3 output]

## Your Rules
[READ: skills/[layer]/SKILL.md]
[READ: skills/[layer]/references/[relevant-only].md]

## Output Format
Return ONLY this JSON:
{
  "layer": "[layer_name]",
  "result": "PASS" | "FAIL",
  "critical": [...],
  "moderate": [...],
  "low": [...],
  "fixes_applied": [...],  // for Phase 2
  "metadata": {}
}
```

### Step 3: Country-Scope Government Sources

**File to split**: `skills/fact-checker/references/government-sources.md` (174 lines)

Split into:
```
references/
├── government-sources-korea.md
├── government-sources-japan.md
├── government-sources-taiwan.md
├── government-sources-sea.md
└── government-sources-global.md
```

Fact-checker subagent receives ONLY the file matching the post's `country` field.

**Estimated savings**: 174 lines → ~40-60 lines per country = ~65% reduction for fact-checker reference load.

### Step 4: Lazy-Load Verified Claims Cache

**Current**: `verified-claims-cache.md` loaded wholesale at fact-checker start.
**New**: Fact-checker subagent uses `Grep` to search cache for specific claims before fetching.

Modify fact-checker SKILL Step 1 (Preparation gate):
```
OLD: "Read verified-claims-cache.md"
NEW: "For each extracted claim, grep verified-claims-cache.md for matching keywords.
      Only load matching entries. If no match, proceed to source discovery."
```

This scales as the cache grows — O(claims) grep calls instead of O(cache_size) context load.

### Step 5: Compress Skill Files

Target the 3 largest skill files for compression:

| File | Current | Target | Method |
|------|---------|--------|--------|
| `fact-checker/SKILL.md` | 360 lines | ~200 lines | Move output format templates to `references/report-template.md`, deduplicate with quality-gate |
| `quality-gate/SKILL.md` | 208 lines | ~80 lines | Becomes thin orchestrator (subagents carry the rules) |
| `anti-ai-checklist.md` | 192 lines | ~120 lines | Merge banned-words.md inline, remove redundant examples |

### Step 6: Update `/fact-check` Standalone Command

**File**: `.claude/commands/fact-check.md`

Ensure it works independently of the blog pipeline by reading the same subagent prompt template used in Step 2, Layer 1. This avoids maintaining two copies of fact-check logic.

### Step 7: Add Pipeline State Logging

Light-touch state tracking (not full persistence, but enough for debugging):

```bash
# Each stage writes a brief status to $TMPDIR/blog-pipeline/
$TMPDIR/blog-pipeline/
├── stage2-output.json     # headline, keywords, outline
├── stage3-output.json     # draft path, frontmatter
├── stage4-reports/
│   ├── fact-check.json
│   ├── seo-audit.json
│   ├── anti-ai.json
│   ├── legal.json
│   └── voice.json
└── stage4-merged.json     # aggregated quality report
```

This is NOT cross-session persistence — it's within-run state that helps the orchestrator and aids debugging when Quality Gate fails.

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Subagent spawn overhead adds latency | Medium | Low | All 5 layers run in parallel — net faster than sequential single-agent |
| Subagent misinterprets rules without broader context | Medium | Medium | Include post country + category in each subagent prompt as minimal context |
| Splitting government-sources breaks `/fact-check` | Low | High | Step 6 updates fact-check to use same country-routing logic |
| Quality Gate Phase 2 (fix) needs cross-layer awareness | Medium | Medium | Orchestrator applies fixes sequentially with all reports visible |

## Verification Steps

1. Run `/blog` end-to-end on a test topic — verify both checkpoints fire
2. Run `/fact-check` standalone on an existing post — verify it still works
3. Compare Quality Gate output (before/after) on same post — verify no regressions
4. Measure token usage at Stage 4 peak — confirm reduction from ~4,500 to ~1,500 per subagent
5. Test with Korea, Japan, Taiwan posts — verify country-scoped source loading

## Edge Cases NOT Handled (intentional)

- **Cross-session resume**: Out of scope. Would require full state persistence + session recovery logic. Revisit if pain point persists after this refactor.
- **Batch mode**: Current batch rewrite mode is aspirational. This refactor doesn't improve it but doesn't break it either.
- **Cache invalidation**: `verified-claims-cache.md` has no TTL enforcement. The grep approach works around this but doesn't solve staleness.

## File Change Summary

| Action | File |
|--------|------|
| **Modify** | `commands/blog.md` — Stage 4 rewrite to orchestrator pattern |
| **Modify** | `skills/quality-gate/SKILL_quality-gate.md` — thin orchestrator |
| **Modify** | `skills/fact-checker/SKILL_fact-checker.md` — compress, extract templates |
| **Modify** | `skills/quality-gate/references/anti-ai-checklist.md` — merge banned-words |
| **Modify** | `.claude/commands/fact-check.md` — align with subagent pattern |
| **Split** | `government-sources.md` → 5 country-specific files |
| **Create** | `contracts/` directory with JSON schemas |
| **Create** | `skills/fact-checker/references/report-template.md` |
| **Delete** | `skills/quality-gate/references/banned-words.md` (merged into anti-ai-checklist) |

## ADR

**Decision**: Surgical refactor with subagent isolation for Quality Gate + lazy-load references + JSON contracts between stages.

**Drivers**: Quality Gate unreliability (attention dilution across 5 layers), excessive token consumption from wholesale reference loading.

**Alternatives considered**: (1) Full pipeline redesign with stage-specific commands — rejected because current structure is sound, just needs better context isolation. (2) Single agent with chunked sequential prompts — rejected because it doesn't solve root cause (attention dilution) and is slower than parallel subagents.

**Why chosen**: Applies proven reddit-karma subagent pattern to the blog pipeline. Targets the two specific pain points with minimal disruption. Each change is independently testable.

**Consequences**: Stage 4 becomes slightly more complex (orchestrator + 5 subagents), but each individual piece is simpler and more reliable. Government sources maintenance now requires updating country-specific files.

**Follow-ups**: (1) Monitor verified-claims-cache growth — may need TTL or archival strategy. (2) If batch mode becomes a real need, add cross-session state persistence. (3) Consider extracting anti-AI checker as a standalone skill (useful beyond blog).
