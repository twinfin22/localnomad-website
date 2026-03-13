# Deep Interview Spec: Fact-Checker Refactor & Improvement

## Metadata
- Interview ID: fact-checker-refactor-20260313
- Rounds: 8
- Final Ambiguity Score: 20%
- Type: brownfield
- Generated: 2026-03-13
- Threshold: 20%
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.92 | 35% | 0.322 |
| Constraint Clarity | 0.75 | 25% | 0.188 |
| Success Criteria | 0.65 | 25% | 0.163 |
| Context Clarity | 0.85 | 15% | 0.128 |
| **Total Clarity** | | | **0.800** |
| **Ambiguity** | | | **20%** |

## Goal

Refactor and improve the existing `SKILL_fact-checker.md` to enforce stricter step-by-step verification, optimize Firecrawl tool usage, update government source references, improve quality-gate Layer 1 integration, and add a standalone `/fact-check` slash command for ad-hoc use outside the blog pipeline.

## Scope — 5 Deliverables

### D1: Refactored SKILL_fact-checker.md — Stricter Enforcement
**Problem**: Current markdown instructions are suggestions Claude may follow loosely. Steps get skipped, checks are shallow.
**Solution**: Restructure the skill with enforcement mechanisms inspired by `claude-code-factchecker`'s approach:
- Add explicit MUST/MUST NOT gates at each step (not just descriptions)
- Add "step completion checklist" — Claude must confirm each step is done before proceeding
- Add "minimum evidence" requirements (e.g., "Step 2 is not complete until N sources have been attempted")
- Structure claims extraction as a mandatory table output (not prose) so nothing is skipped
- Add abort conditions: if a step cannot be completed, document WHY explicitly rather than silently skipping

### D2: Improved Source Discovery Logic
**Problem**: Current "max 3 search attempts per claim" is simplistic. No guidance on search query construction, no batching of related claims, no reuse of already-fetched pages.
**Solution**:
- Add search query construction guidance (how to form effective queries for government sites)
- Batch claims by domain: group all Korea visa claims → search immigration.go.kr once, verify multiple claims from same page
- Add a "sources already fetched" tracking step — before searching, check if a previously fetched page already contains the answer
- Optimize Firecrawl usage:
  - Use `firecrawl_search` for initial source discovery
  - Use `firecrawl_scrape` for targeted page verification
  - Consider `firecrawl_extract` for structured data from government tables
  - Minimize redundant calls: fetch a government page once, verify multiple claims against it
- Add fallback chain: Firecrawl → WebSearch/WebFetch → flag as UNVERIFIABLE (current behavior, but make it explicit and structured)

### D3: Reviewed & Updated government-sources.md
**Problem**: Source list may be stale. Need freshness review.
**Solution**:
- Verify all listed government URLs still resolve (spot-check key ones)
- Add any new portals launched since last update (especially China COVA system, any new SEA e-visa portals)
- Add "last verified" date to the file header
- Add guidance on how to handle government site redesigns (URL patterns change)
- Review country-specific notes for accuracy

### D4: Updated Quality-Gate Layer 1 Integration
**Problem**: Quality-gate's Layer 1 section repeats fact-checker logic and may be out of sync after refactoring.
**Solution**:
- Align quality-gate Layer 1 with refactored fact-checker (reference skill, don't repeat)
- Ensure the "LocalNomad-specific checks" that quality-gate adds ON TOP of the fact-checker are clearly separated
- Update any stale stage references

### D5: `/fact-check` Slash Command
**Problem**: Fact-checker can only run as part of the blog pipeline (quality-gate Layer 1). No standalone invocation.
**Solution**: Create `.claude/commands/fact-check.md` that:
- Accepts flexible input: file path, URL, pasted text, or single claim
- Parses input type automatically
- Runs the fact-checker skill protocol
- Outputs the standard Fact-Check Report
- Does NOT require the blog pipeline context (no category, no cover image, no SEO)
- Reuses the same SKILL_fact-checker.md logic (single source of truth)

## Non-Goals
- NOT creating a new skill from scratch (refactor existing)
- NOT changing the 5-step protocol fundamentally (improving enforcement of existing steps)
- NOT building a distributable plugin for external users
- NOT adding image/visual verification (text claims only)
- NOT changing the 3-tier source hierarchy or error severity triage (those work well)

## Acceptance Criteria
- [ ] SKILL_fact-checker.md has explicit MUST gates and step completion checklists
- [ ] Source discovery includes claim batching by domain and "already fetched" tracking
- [ ] Firecrawl usage guidance covers search, scrape, and extract with when-to-use-which
- [ ] government-sources.md has "last verified" date and all URLs spot-checked
- [ ] Quality-gate Layer 1 references fact-checker skill without duplicating logic
- [ ] `/fact-check` command exists and accepts: file path, URL, pasted text, single claim
- [ ] `/fact-check` produces the same structured Fact-Check Report format
- [ ] No orphan references to old stage numbers across skill files
- [ ] Existing blog pipeline still works (fact-checker called from quality-gate Layer 1 unchanged)

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| "Need a new skill" | Contrarian: existing skill already has all listed features | Refactor existing, don't rebuild |
| "GitHub repo has features I lack" | Compared feature-by-feature | Current skill has equivalent features; real gap is enforcement rigor |
| "Firecrawl is suboptimal" | Asked for specifics | User wants general best-practice guidance, not solving a specific bottleneck |
| "Need XML prompt format" | Not selected by user | Keep markdown skill format (consistent with all other LocalNomad skills) |

## Technical Context

### Files to Modify
| File | Change Type |
|------|------------|
| `localnomad-blog-plugin/skills/fact-checker/SKILL_fact-checker.md` | Major refactor — enforcement gates, source batching, Firecrawl optimization |
| `localnomad-blog-plugin/skills/fact-checker/references/government-sources.md` | Review & update — verify URLs, add last-verified date |
| `localnomad-blog-plugin/skills/quality-gate/SKILL_quality-gate.md` | Minor update — Layer 1 dedup, reference skill instead of repeat |
| `.claude/commands/fact-check.md` | New file — standalone slash command |

### Existing Integration Points
- Blog pipeline: `.claude/commands/blog.md` STAGE 4 → quality-gate → Layer 1 → fact-checker
- Quality gate: `localnomad-blog-plugin/skills/quality-gate/SKILL_quality-gate.md` Layer 1
- Government sources: `localnomad-blog-plugin/skills/fact-checker/references/government-sources.md`
- Fact-check tiers: `localnomad-blog-plugin/skills/quality-gate/references/fact-check-tiers.md`
- Tools: `firecrawl_search`, `firecrawl_scrape`, `firecrawl_extract` (new), `WebSearch`/`WebFetch` (fallback)

## Interview Transcript
<details>
<summary>Full Q&A (8 rounds)</summary>

### Round 1
**Q:** What specific problem is the current fact-checker NOT solving?
**A:** Verification quality + Inspired by repo features
**Ambiguity:** 66%

### Round 2
**Q:** Which specific repo features do you want?
**A:** 5-Step URL Verification Protocol, Claim Type Taxonomy, Source Classification, Output Format
**Ambiguity:** 69% (increased — these features already exist in current skill)

### Round 3
**Q:** What specifically goes wrong when the fact-checker runs?
**A:** It runs fine in the pipeline, but I want it standalone too
**Ambiguity:** 59%

### Round 4
**Q:** What's the typical standalone use case?
**A:** All of the above — file, URL, single claim, pasted text
**Ambiguity:** 51%

### Round 5 (Contrarian)
**Q:** What if you just need a slash command wrapper, not a new skill?
**A:** "I don't need a new skill. Just propose how to refactor and improve the existing fact-check cycle."
**Ambiguity:** 40% (breakthrough — real need clarified)

### Round 6
**Q:** Which improvement aspects matter most?
**A:** Stricter enforcement + better source discovery + improve government-sources.md
**Ambiguity:** 33%

### Round 7 (Simplifier)
**Q:** Is the 4-item scope complete?
**A:** Those 4 items + quality-gate integration update + Firecrawl context optimization
**Ambiguity:** 24%

### Round 8
**Q:** What's the Firecrawl pain point?
**A:** General guidance needed — make it smarter about how it uses Firecrawl calls
**Ambiguity:** 20% (threshold met)

</details>
