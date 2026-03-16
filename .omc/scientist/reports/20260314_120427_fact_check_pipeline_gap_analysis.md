# Fact-Check Pipeline Gap Analysis Report

**Date:** 2026-03-14
**Analyst:** Scientist Agent (oh-my-claudecode)
**Scope:** End-to-end fact-check pipeline — `/blog` pipeline invocation + `/fact-check` standalone
**Files Analyzed:** 6 (blog.md, SKILL_quality-gate.md, SKILL_fact-checker.md, government-sources.md, verified-claims-cache.md, fact-check.md)

---

## Objective

[OBJECTIVE] Trace the complete fact-check pipeline data flow after refactoring, identify information loss points, integration gaps, and potential failure modes. Produce an actionable gap analysis.

---

## Data

[DATA] 6 skill/command files analyzed. Pipeline has 2 invocation paths (pipeline via /blog, standalone via /fact-check), 2 phases (Phase 1 parallel verify, Phase 2 sequential fix), 6 internal steps, and 4 reference data stores (government-sources.md, verified-claims-cache.md, frontmatter metadata, fetched-pages tracker). 12 gaps identified across 6 categories.

---

## Data Flow Diagram

```
FACT-CHECK PIPELINE — COMPLETE DATA FLOW
=========================================

INPUT: blog post MDX content (from STAGE 3 draft)
       + country metadata (from frontmatter)
       + category (from frontmatter)

═══════════════════════════════════════════════════════════
STAGE 4: QUALITY GATE  (/blog pipeline invocation)
═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│  PHASE 1: Parallel Verify (read-only)                   │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Layer 1  │ │ Layer 2  │ │ Layer 3  │ │ Layer 4  │  │
│  │ Fact-Chk │ │ SEO Audit│ │ Anti-AI  │ │ Legal    │  │
│  │Steps 1-5 │ │          │ │ Scan     │ │ Scan     │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │             │             │             │        │
│  ┌────┴─────┐                                           │
│  │ Layer 5  │  (blog.md says Layer 5 runs AFTER —      │
│  │ Voice    │   GAP-11: contradicts quality-gate spec)  │
│  └────┬─────┘                                           │
│       └──────────┬──────────────────────────────────    │
│                  │                                      │
│    ALL 5 REPORTS COLLECTED                              │
│    [GAP-02: No structured handoff contract]             │
└──────────────────┼──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: Sequential Fix (write operations)             │
│  Step 1 → CRITICAL fact corrections                     │
│  Step 2 → MODERATE fact corrections                     │
│  Step 3 → Anti-AI rewrites   ◄─[GAP-04: destroys links]│
│  Step 4 → Voice adjustments                             │
│  Step 5 → Source link injection (fact-checker Step 6)   │
│  Step 6 → Legal disclaimer insertion                    │
│  [GAP-01: skill has no mode parameter for step 5 stop]  │
└──────────────────┼──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  VERIFICATION PHASE: Re-run Phase 1 (read-only)         │
│  [GAP-05: expensive full re-run, no cache reuse spec]   │
│  [GAP-09: fetched-pages tracker discarded]              │
└──────────────────┼──────────────────────────────────────┘
                   │
                   ▼
              QUALITY REPORT → CHECKPOINT 2 → Gen approval

═══════════════════════════════════════════════════════════
FACT-CHECKER SKILL INTERNAL FLOW (Steps 1-6)
═══════════════════════════════════════════════════════════

  PREP: identify countries → load gov-sources → load cache
        → init fetched-pages tracker → init tool budget
        [GAP-12: cache may contain Tier 3 sources]

  Step 1: Extract Claims → Claims Table (type A/B/C/D/E)
  Step 2: Source Discovery → URL per claim, or UNVERIFIABLE
    [GAP-08: UNVERIFIABLE propagation to Steps 3-6 ambiguous]
    [GAP-06: No write-back step to update cache after run]
  Step 3: URL Verification (5-point check)
  Step 4: Freshness Assessment
  Step 5: Critical Nuance Check

  ─── PIPELINE MODE: STOP HERE
  ─── [GAP-01: No enforcement mechanism]
  ─── [GAP-03: Output template still shows Step 6 section]

  Step 6: Source Link Injection (standalone only, or Phase 2 Step 5)
    [GAP-07: standalone runs Step 6 before anti-AI protection]

═══════════════════════════════════════════════════════════
STANDALONE /fact-check COMMAND
═══════════════════════════════════════════════════════════

  Runs: full 6-step protocol (Steps 1-6 uninterrupted)
  [GAP-10: LocalNomad-specific checks silently skipped]
```

---

## Gap Analysis Table

| Gap ID | Location | Description | Severity | Fix Recommendation |
|--------|----------|-------------|----------|-------------------|
| GAP-01 | quality-gate Phase 1 → fact-checker SKILL | Stop-at-Step-5 instruction is caller-side only. Skill has no mode parameter. No enforcement mechanism. | HIGH | Add mode=VERIFY (Steps 1-5) vs mode=FULL (Steps 1-6) to the skill. quality-gate passes mode=VERIFY; /fact-check passes mode=FULL. |
| GAP-02 | Phase 1 → Phase 2 handoff | No structured data contract between Phase 1 reports and Phase 2 steps. Freeform text report is information-loss-prone under context pressure. | HIGH | Define an explicit handoff object (JSON or structured table) from Phase 1 containing verified URL per claim, injection placement, tier. Phase 2 Step 5 reads this, not the full prose report. |
| GAP-03 | Fact-checker Output Format vs pipeline mode | Output Format template always includes SOURCE LINKS INJECTED section, even when running Steps 1-5 only. Creates confusion about whether Step 6 ran or was deferred. | MEDIUM | Add conditional: in pipeline mode, replace section with SOURCE LINKS DEFERRED (Phase 2 Step 5). |
| GAP-04 | Phase 2 fix order: steps 3-4 before step 5 | Anti-AI rewrites (Step 3) may silently destroy existing inline source links before Step 6 runs. Step 6 rule "existing links preserved" assumes they still exist. | HIGH | Before anti-AI rewrites, extract all existing source links as a protected set. Re-inject any that were in rewritten sentences. Step 5 then deduplicates as designed. |
| GAP-05 | Verification Phase re-run after Phase 2 | Full fact-check re-run in verification pass is expensive. No spec for reusing Phase 1 cache to skip already-verified unchanged claims. | MEDIUM | Verification pass should use Phase 1 fetched-pages tracker as read-only cache. Only re-verify claims touched by Phase 2 fixes. |
| GAP-06 | verified-claims-cache write-back | 6-step protocol has no explicit write-back step. Cache updates are aspirational ("add them here") but not procedural. | MEDIUM | Add post-output step: cache write-back for every newly verified claim with Volatility classification. Make it a gate before run completion. |
| GAP-07 | Standalone /fact-check: Step 6 timing | Standalone mode injects source links (Step 6) before any anti-AI or voice editing passes run. Links injected now will be lost if user edits later. | LOW | Document in /fact-check.md: source links injected in standalone mode may be overwritten by subsequent anti-AI passes. Run /fact-check AFTER prose editing, or use /blog pipeline. |
| GAP-08 | fact-checker Step 2: UNVERIFIABLE propagation | UNVERIFIABLE claims have no source URL. Steps 3-6 completion gates say "every source URL checked" but do not explicitly exempt UNVERIFIABLE claims. Ambiguous pass/fail behavior. | MEDIUM | Add to each Step 3-6 gate: "UNVERIFIABLE claims from Step 2 are exempt from URL gates (3-4) and link injection (6). They MUST appear in the UNVERIFIABLE CLAIMS output section." |
| GAP-09 | fetched-pages tracker: verification re-run | Tracker is re-initialized empty for the verification pass, discarding all Phase 1 fetch efficiency. Pages fetched in Phase 1 could be reused at zero cost. | LOW | Pass Phase 1 fetched-pages tracker into the verification pass as a pre-populated read-only tracker. |
| GAP-10 | quality-gate Layer 1 vs standalone /fact-check | quality-gate adds LocalNomad-specific checks after fact-checker returns: ≥2 independent sources for critical claims, internal link validation against CLAUDE.md. These are silently skipped in standalone mode. | MEDIUM | Either move LocalNomad checks into SKILL_fact-checker.md as an optional profile, or document explicitly in /fact-check.md that standalone mode skips these checks. |
| GAP-11 | blog.md STAGE 4 vs quality-gate spec | blog.md: "Layers 1-4 in parallel, Layer 5 after." quality-gate SKILL: "All 5 layers simultaneously." Direct contradiction on Layer 5 timing. | MEDIUM | quality-gate's two-phase model is correct. Update blog.md to: "Layers 1-5 run in parallel (read-only Phase 1); fixes applied sequentially in Phase 2." |
| GAP-12 | verified-claims-cache: Tier 3 source | Cache entry for "GNI update cycle" sources from pureumlawoffice.com — a private law office blog (Tier 3 at best). Step 2 cache hits bypass the Tier 1 requirement for Type D claims, silently accepting Tier 3 as authoritative. | HIGH | Replace with Tier 1 source (nts.go.kr or moef.go.kr). Add cache validation rule: Source URLs must be Tier 1 or Tier 2 only. |

---

## Findings

[FINDING] 4 HIGH-severity gaps exist in the pipeline — all involve enforcement failures, not design flaws. The two-phase architecture is sound, but the implementation relies entirely on prompt-following discipline (LLM self-regulation) with no structural enforcement.
[STAT:n] n=12 gaps across 6 source files
[STAT:effect_size] 4 HIGH gaps affect correctness guarantees; 0 gaps affect the architecture design itself

[FINDING] The most critical data integrity risk is GAP-12: the verified-claims-cache contains a Tier 3 source (pureumlawoffice.com) for a GNI policy claim classified as Type D (government program detail). This allows Step 2 to bypass the mandatory Tier 1 source requirement for Type D claims via cache hit.
[STAT:effect_size] 1 specific cache entry; affects all future fact-check runs for Korea F-1-D GNI content until fixed
[STAT:p_value] deterministic: any run checking GNI update cycle will use the Tier 3 cached source

[FINDING] GAP-01 and GAP-03 together reveal a structural incoherence: quality-gate instructs the fact-checker to stop at Step 5, but the skill has no mode parameter, and its output template always includes Step 6 fields. The pipeline currently depends on the LLM correctly interpreting "run Steps 1-5 only" from a separate document, with no guard clause in the skill itself.
[STAT:n] n=2 files with conflicting specifications (quality-gate vs SKILL_fact-checker output format)

[FINDING] GAP-04 represents a timing race condition between write phases: anti-AI rewrites (Phase 2 Step 3) may silently destroy inline source links that exist in the original draft, which Step 5's "existing links preserved" rule cannot protect because those links no longer exist by the time Step 5 runs.
[STAT:effect_size] Affected scope = any draft section containing both a banned AI word and an existing inline source link simultaneously

[FINDING] The standalone /fact-check command and the pipeline invocation produce materially different validation depth (GAP-10): pipeline adds ≥2-source cross-verification and internal link validation that standalone silently omits. These are not documented as differences in /fact-check.md, creating a false parity expectation.
[STAT:n] n=2 quality checks present in pipeline, absent in standalone
[STAT:effect_size] Quality gap is undocumented — users running /fact-check believe they are getting equivalent validation

---

## Limitations

[LIMITATION] This analysis is static — it traces documented spec behavior, not actual LLM execution behavior. Actual pipeline performance may differ depending on context window state, model generation, and prompt ordering at runtime. The gaps identified represent specification-level risks, not confirmed empirical failures.

[LIMITATION] The fetched-pages tracker and tool budget are in-memory session constructs with no persistent storage between skill calls. Their actual effectiveness under long-context conditions is unverifiable from static analysis alone.

[LIMITATION] The verification re-run cost (GAP-05) depends heavily on post-edit claim overlap — if Phase 2 fixes are minimal, the re-run is cheap. If Phase 2 heavily rewrites, the re-run cost is proportional. No empirical data exists to quantify this cost distribution.

---

## Priority Fix Order

| Priority | Gap ID | Estimated Effort | Rationale |
|----------|--------|-----------------|-----------|
| 1 | GAP-12 | 5 min | Immediate data integrity risk; single cache entry fix |
| 2 | GAP-01 | 30 min | Prevents Step 6 from running silently in pipeline mode |
| 3 | GAP-04 | 45 min | Prevents silent link destruction in anti-AI rewrites |
| 4 | GAP-02 | 60 min | Defines reliable Phase 1→2 handoff contract |
| 5 | GAP-08 | 20 min | Clarifies UNVERIFIABLE gate behavior — prevents stalls |
| 6 | GAP-06 | 30 min | Makes cache updates procedural instead of aspirational |
| 7 | GAP-03 | 15 min | Removes misleading empty Step 6 section from pipeline output |
| 8 | GAP-10 | 20 min | Documents /fact-check validation depth gap |
| 9 | GAP-11 | 15 min | Aligns blog.md with quality-gate two-phase spec |
| 10 | GAP-05 | 30 min | Adds cache reuse spec for verification re-run |
| 11 | GAP-07 | 10 min | Documents standalone mode link ordering risk |
| 12 | GAP-09 | 30 min | Passes Phase 1 tracker to verification re-run |

---

*Report generated by Scientist Agent — 2026-03-14*
*Figures: `.omc/scientist/figures/fact_check_pipeline_gaps_ascii.txt`*
