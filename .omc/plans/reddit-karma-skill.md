# Plan: reddit-karma Skill (Revised)

**Date:** 2026-03-13
**Revision:** 2 (post-Critic)
**Complexity:** MEDIUM
**Scope:** 5 new files, 1 existing file modified (`scripts/common/fetch.py`)

---

## Context

LocalNomad has 28 blog posts covering digital nomad visas/living in Korea, Japan, Taiwan, and China. The goal is a Claude Code skill that helps Gen discover high-potential Reddit threads and draft authentic replies that position LocalNomad as a helpful community member — without being spammy or link-dropping.

### Key Technical Findings (from investigation + Critic review)

- **`scripts/common/fetch.py` already provides:** `reddit_search()`, `reddit_comments()`, `reddit_top_posts()` using only stdlib (`urllib`). Includes `RateLimiter` with 2s delays and exponential backoff for 429s.
- **No auth needed, no venv needed, no external dependencies.**
- **Existing scripts** (`reddit-pain-mining.py`, `reddit-discover.py`, `reddit-megathreads.py`) use inline fetch logic (pre-refactor). The new scout script will be the first Reddit script to use `common.fetch` directly.
- **Missing utility:** Subreddit discovery (`reddit_subreddit_search()`) — needs to be added to `fetch.py`. Reddit's public JSON API supports `https://www.reddit.com/subreddits/search.json?q=...`.
- **Firecrawl is off-limits** for this skill (CLAUDE.md restricts it to fact-checker and /blog pipeline only).
- **Script placement convention:** All Python scripts live in `scripts/` at repo root. Skills are markdown + `references/` only — no `scripts/` subdirectory inside skills.
- **Skill file lengths vary:** fact-checker is 324 lines, blog-voice is 84 lines. No fixed convention.
- Existing skills live in `localnomad-blog-plugin/skills/` and are symlinked from `.claude/skills/`.

---

## RALPLAN-DR Summary

### Principles
1. **Authenticity over reach** — One genuine reply > ten formulaic ones
2. **Read-only, human-in-the-loop** — Skill discovers and drafts; Gen posts manually
3. **Knowledge-first, links-second** — Blog content informs the reply; links are optional hints, never the point
4. **Reuse existing infrastructure** — Use `scripts/common/fetch.py` utilities; no new dependencies
5. **Convention-following** — Scripts in `scripts/`, skills are markdown + `references/`

### Decision Drivers
1. **Existing Reddit utilities** — `fetch.py` already handles search, comments, top posts, rate limiting, and backoff. Adding one function (`reddit_subreddit_search`) is all that's needed.
2. **Anti-AI voice quality** — The draft phase must produce text that passes the existing anti-AI checklist, written in LibaD's founder voice.
3. **Zero-dependency constraint** — stdlib-only approach means no venv, no pip, no bootstrap scripts. Just `python3 scripts/reddit-scout.py`.

### Viable Options

**Option A: Extend `fetch.py` + thin scout script in `scripts/` (CHOSEN)**
- Add `reddit_subreddit_search()` to existing `scripts/common/fetch.py`
- Create `scripts/reddit-scout.py` as a thin CLI that composes existing utilities (same pattern as `reddit-discover.py`, `reddit-pain-mining.py`)
- Skill markdown instructs Claude on the two-phase workflow
- Pros: Zero new dependencies, follows existing conventions exactly, reuses battle-tested rate limiting/backoff, one new function to maintain
- Cons: Adds to `fetch.py` (minor — it's a utility module designed for extension)

**Option B: Inline Reddit JSON API calls via Bash/curl in skill markdown**
- Skill markdown contains `curl` commands Claude runs directly
- Pros: No Python files at all
- Cons: JSON parsing in Bash is fragile, no rate limiting, no backoff, no error handling, duplicates logic that already exists in `fetch.py`

**Invalidation of Option B:** The codebase already has a robust, tested HTTP layer with rate limiting and backoff in `fetch.py`. Reimplementing this via curl/Bash would be strictly worse — fragile, duplicative, and missing the error handling that makes the existing scripts reliable.

**Invalidation of redditwarp (original Option A):** `scripts/common/fetch.py` already does everything redditwarp would do, using only stdlib. Adding redditwarp would require venv management, introduce a dependency with known bugs (`subreddit.search()` crashes on KeyError), and duplicate existing functionality.

---

## Work Objectives

Create a `/reddit-karma` skill that:
1. Discovers relevant subreddits dynamically based on blog content topics
2. Finds high-potential threads (unanswered questions, recent discussions, high engagement)
3. Presents ranked thread candidates for user selection
4. Drafts authentic, anti-AI replies in first-person founder voice sourced from blog knowledge
5. Outputs a structured brief with reply text, rationale, source posts, and tone notes

---

## Guardrails

### Must Have
- Two distinct phases: Scout (discover+rank) and Draft (compose)
- User selects threads between phases — no auto-drafting
- Anti-AI compliance (reference existing checklist)
- Blog content used as knowledge source, not link target
- Uses existing `scripts/common/fetch.py` utilities (no new dependencies)
- Script placed at `scripts/reddit-scout.py` (alongside sibling scripts)
- Skill file follows existing YAML frontmatter + sections convention

### Must NOT Have
- Auto-posting or write operations to Reddit
- Hardcoded subreddit list (must discover dynamically)
- Links in draft replies by default (linkless-first)
- Auth tokens or credentials
- Firecrawl usage (violates CLAUDE.md restrictions)
- Any pip/venv/dependency management
- A `scripts/` subdirectory inside the skill folder

---

## Task Flow

### Step 1: Add `reddit_subreddit_search()` to `scripts/common/fetch.py`

Add one new function to the existing Reddit-specific helpers section:

```
reddit_subreddit_search(query, limit=10, rate_limiter=None) -> list[dict]
```

Uses `https://www.reddit.com/subreddits/search.json?q={query}&limit={limit}` to find subreddits matching a topic. **Must filter response children by `kind == "t5"` (subreddit objects, not `t3` posts)** and extract `display_name`, `subscribers`, `public_description`, `url` from `data`. Returns list of dicts with keys: `name`, `subscribers`, `public_description`, `url`.

Also export it from `scripts/common/__init__.py`.

**Acceptance criteria:**
- [ ] Function exists in `scripts/common/fetch.py` in the "Reddit-specific helpers" section
- [ ] Returns list of dicts with `name`, `subscribers`, `public_description`, `url` keys
- [ ] Handles 404/403/429 gracefully (returns empty list + stderr warning, same pattern as siblings)
- [ ] Uses the shared `rate_limiter` and `fetch_json` — no new HTTP logic
- [ ] Filters response children by `kind == "t5"` (subreddit objects, not `t3` posts)
- [ ] Mentioned in `scripts/common/__init__.py` docstring (file is documentation-only, not programmatic exports)

### Step 2: Create the scout script at `scripts/reddit-scout.py`

A CLI script following the same patterns as `reddit-discover.py` and `reddit-pain-mining.py`. Composes existing `fetch.py` utilities into three subcommands:

- `discover <topic>` — calls `reddit_subreddit_search()`, returns JSON array of `{name, subscribers, description}`
- `search <subreddit> <query> [--sort relevance|new|top] [--time week|month|all] [--limit 10]` — calls `reddit_search()`, returns JSON array of `{title, score, num_comments, created_utc, url, permalink, id, selftext_preview}`
- `thread <permalink>` — calls `reddit_comments()`, returns JSON with `{post: {...}, comments: [{body, score, author}]}`

All output as JSON to stdout. Errors as JSON `{"error": "message"}` to stdout.

**Acceptance criteria:**
- [ ] `python3 scripts/reddit-scout.py discover "digital nomad"` returns JSON array of subreddit objects
- [ ] `python3 scripts/reddit-scout.py search digitalnomad "korea visa" --limit 5` returns JSON array of post objects
- [ ] `python3 scripts/reddit-scout.py thread "/r/digitalnomad/comments/abc123/..."` returns JSON with post + comments
- [ ] No imports outside stdlib + `scripts/common/` — zero external dependencies
- [ ] Error cases produce `{"error": "..."}` on stdout, not stack traces
- [ ] Script has a docstring header matching the style of `reddit-discover.py`

### Step 3: Create the skill markdown and reference files

**3a. Skill file:** `localnomad-blog-plugin/skills/reddit-karma/SKILL_reddit-karma.md`

Structure (following existing conventions):
- YAML frontmatter: name, description
- Overview: what the skill does, when to use it
- Phase 1 — Scout: step-by-step instructions for discovery + ranking
  - Step 1a: Read blog index to identify topics/countries
  - Step 1b: Run `python3 scripts/reddit-scout.py discover <topic>` to find subreddits
  - Step 1c: Run `python3 scripts/reddit-scout.py search <subreddit> <query>` across found subreddits
  - Step 1d: Rank results using engagement > recency+unanswered > topic match
  - Step 1e: Present ranked table to user, wait for selection
- Phase 2 — Draft: instructions for composing the reply brief
  - Step 2a: Run `python3 scripts/reddit-scout.py thread <permalink>` to fetch full context
  - Step 2b: Identify which blog post(s) contain relevant knowledge
  - Step 2c: Draft reply text following voice guide + anti-AI rules
  - Step 2d: Compose the full brief (reply text, rationale, sources, tone notes, optional link hint)
- Degradation: when scout returns zero results or errors, fall back to seed-topics list + manual subreddit browsing guidance
- New Post Mode: instructions for drafting original subreddit posts (not just replies) — same voice/anti-AI rules apply, but framed as standalone value posts rather than thread responses
- Hard Rules (NEVER): auto-post, include links by default, use hedge phrases, corporate tone, formulaic structure
- Soft Rules: prefer threads < 48h old, prefer unanswered questions, vary reply length, use `--time week` for near-real-time filtering
- Output Format: structured brief template
- References: pointers to reference files

**3b. `references/subreddit-seed-topics.md`** — Topic-to-query mapping derived from blog content:
- Korea visa/nomad: "korea digital nomad visa", "korea F-1-D", "working in korea foreigner"
- Japan visa/nomad: "japan digital nomad visa", "japan housing foreigner"
- Taiwan gold card/nomad: "taiwan gold card", "taiwan digital nomad visa"
- China nomad: "china vpn", "china alipay foreigner"
- General nomad life: "asia digital nomad", "cost of living asia nomad"
- Tax: "digital nomad taxes", "183 day tax rule"

This is a SEED list — Claude should also generate queries based on current blog content.

**3c. `references/voice-guide-reddit.md`** — Reddit-specific voice adaptation:
- First-person founder tone ("I've been living in Seoul for...")
- Casual, opinionated, specific
- Anti-patterns: no "hope this helps", no "great question!", no bullet-point lists of advice
- Length guidance: match thread energy (short thread = short reply, deep discussion = longer)
- References blog-voice skill's DNA but adapted for Reddit comment format

**3d. `references/brief-template.md`** — Output format template for the draft brief

**Acceptance criteria:**
- [ ] Skill file has valid YAML frontmatter with name and description
- [ ] Contains both Scout and Draft phases with clear step-by-step instructions referencing `scripts/reddit-scout.py`
- [ ] Hard Rules section includes anti-AI requirements
- [ ] Output Format section has a concrete brief template
- [ ] References existing anti-AI checklist and voice guide
- [ ] `subreddit-seed-topics.md` covers all 4 countries + general topics
- [ ] `voice-guide-reddit.md` includes anti-AI rules specific to Reddit comments
- [ ] `brief-template.md` has all fields: reply text, rationale, source posts, tone notes, link hint
- [ ] No reference to Firecrawl anywhere in the skill

### Step 4: Create symlink and verify end-to-end

- Symlink `localnomad-blog-plugin/skills/reddit-karma` to `.claude/skills/reddit-karma`
- Verify the skill is discoverable by Claude Code
- Dry-run: execute Scout phase against r/digitalnomad to confirm end-to-end flow

**Acceptance criteria:**
- [ ] Symlink exists at `.claude/skills/reddit-karma` pointing to `../../localnomad-blog-plugin/skills/reddit-karma`
- [ ] `ls .claude/skills/reddit-karma/SKILL_reddit-karma.md` resolves correctly
- [ ] `python3 scripts/reddit-scout.py discover "digital nomad"` returns results without errors
- [ ] `python3 scripts/reddit-scout.py search digitalnomad "korea visa" --limit 3` returns results
- [ ] Scout phase produces a ranked table of threads from at least 2 subreddits
- [ ] No pip, no venv, no external dependencies used anywhere in the flow

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Reddit rate-limits unauthenticated JSON API | Scout returns empty/partial results | Existing `RateLimiter` (2s delay) + exponential backoff in `fetch.py` already handles this; scout script inherits it automatically |
| Reddit blocks unauthenticated JSON API entirely | Entire skill breaks | Document as known limitation; if it happens, consider adding auth support to `fetch.py` (single change point for all scripts) |
| `subreddits/search.json` endpoint returns unexpected shape | `reddit_subreddit_search()` crashes | Follow the same defensive pattern as `reddit_search()`: wrap in try/except, return empty list + stderr warning |
| Draft replies sound AI-generated | Defeats the purpose | Voice guide + anti-AI checklist + explicit anti-patterns list; skill instructs Claude to self-check against checklist before outputting |
| Scout returns too many low-quality threads | User wastes time reviewing junk | Ranking criteria in skill (engagement > recency+unanswered > topic match) filters noise; limit default to 10 results |

---

## Verification Steps

1. **Utility function test:** Run `python3 -c "from scripts.common.fetch import reddit_subreddit_search; ..."` to verify the new function works
2. **Script subcommand tests:** Run each subcommand (`discover`, `search`, `thread`) and verify JSON output shape
3. **Zero-dependency check:** Confirm `reddit-scout.py` imports only from stdlib and `scripts/common/`
4. **Skill structure check:** Confirm YAML frontmatter parses, all sections present, no Firecrawl references
5. **Symlink resolution:** Verify `.claude/skills/reddit-karma/SKILL_reddit-karma.md` resolves
6. **End-to-end dry run:** Invoke `/reddit-karma` skill, complete Scout phase, select a thread, verify Draft phase produces a valid brief
7. **Anti-AI spot check:** Run draft output through the existing anti-AI checklist (Layer 3 from quality-gate) — should pass with 0 violations

---

## Success Criteria

- [ ] `reddit_subreddit_search()` added to `scripts/common/fetch.py` following existing patterns
- [ ] `scripts/reddit-scout.py` works end-to-end (discover -> search -> thread) with zero external dependencies
- [ ] Skill file at `localnomad-blog-plugin/skills/reddit-karma/SKILL_reddit-karma.md` follows existing conventions
- [ ] Scout phase discovers subreddits dynamically (not just from hardcoded list)
- [ ] Draft phase produces reply text that passes anti-AI checklist
- [ ] Only 1 existing file modified (`scripts/common/fetch.py` — adding one function)
- [ ] Total deliverable: 1 modified file + 1 new script + 1 skill file + 3 reference files + 1 symlink

---

## File Manifest

```
scripts/common/
  fetch.py                               # MODIFIED: add reddit_subreddit_search()
  __init__.py                            # MODIFIED: export reddit_subreddit_search

scripts/
  reddit-scout.py                        # NEW: CLI scout tool (~120 lines)

localnomad-blog-plugin/skills/reddit-karma/
  SKILL_reddit-karma.md                  # NEW: Main skill file (~200 lines)
  references/
    subreddit-seed-topics.md             # NEW: Topic-to-query mapping (~40 lines)
    voice-guide-reddit.md                # NEW: Reddit voice adaptation (~50 lines)
    brief-template.md                    # NEW: Output format template (~30 lines)

.claude/skills/reddit-karma -> ../../localnomad-blog-plugin/skills/reddit-karma  # NEW: Symlink
```

---

## ADR: Architecture Decision Record

**Decision:** Extend existing `scripts/common/fetch.py` with one new function + thin scout CLI script in `scripts/` + skill markdown with reference files.

**Drivers:**
1. `scripts/common/fetch.py` already provides `reddit_search()`, `reddit_comments()`, `reddit_top_posts()` with rate limiting and backoff — battle-tested by 3 existing scripts.
2. All Python scripts in the codebase live in `scripts/` at repo root. Skills contain only markdown and `references/`.
3. CLAUDE.md restricts Firecrawl to fact-checker and /blog pipeline — cannot be used as fallback.
4. Zero-dependency (stdlib-only) approach eliminates venv/pip management entirely.

**Alternatives considered:**
1. **redditwarp library** — Rejected: requires venv + `httpx` dependency, `subreddit.search()` has a known KeyError bug, duplicates functionality already in `fetch.py`.
2. **Inline curl/Bash in skill markdown** — Rejected: fragile JSON parsing, no rate limiting, no backoff, duplicates existing `fetch.py` logic.
3. **Firecrawl as fallback** — Rejected: violates CLAUDE.md project rule ("Only use when running fact-checker skill or /blog pipeline").
4. **Script inside skill directory** — Rejected: no existing skill has a `scripts/` subdirectory; convention is markdown + `references/` only.

**Why chosen:** Maximizes reuse of existing infrastructure. One new function in `fetch.py` gives subreddit discovery. The scout script is a thin CLI wrapper (~120 lines) composing existing utilities — same pattern as `reddit-discover.py` and `reddit-pain-mining.py`. Zero new dependencies.

**Consequences:**
- Adds ~30 lines to `scripts/common/fetch.py` (one function + docstring).
- `reddit-scout.py` becomes the 4th Reddit script in `scripts/`, joining `reddit-discover.py`, `reddit-megathreads.py`, `reddit-pain-mining.py`.
- If Reddit blocks unauthenticated JSON API entirely, ALL Reddit scripts break (not just this one) — single fix point in `fetch.py`.

**Follow-ups:**
- If rate limits become a problem across all Reddit scripts, add optional auth support to `fetch.py` (benefits all scripts at once).
- May want to add a `hot` subcommand to scout later for trending thread discovery.
- Consider adding `--json-pretty` flag to scout for manual debugging.

---

## Consensus Changelog

### Revision 2 (Planner, post-Critic round 1)
- Replaced redditwarp with existing `scripts/common/fetch.py` — zero dependencies
- Moved script from skill directory to `scripts/` — follows convention
- Removed Firecrawl fallback — violates CLAUDE.md restriction
- Removed all venv/pip management

### Revision 3 (Architect + Critic round 2 improvements merged)
- Renamed `reddit_scout.py` → `reddit-scout.py` (hyphen convention per Architect)
- Added `t5` kind filtering spec for `reddit_subreddit_search()` (per Architect)
- Added degradation clause for scout failures (per Architect)
- Added New Post Mode to skill markdown spec (per Critic — was in deep-interview spec but missing from plan)
- Corrected factual claim: existing Reddit scripts use inline fetch, not `common.fetch` (per Critic)
- Fixed `__init__.py` export claim — file is docstring-only (per Critic)
- Added `--time week` guidance for soft rules (per Critic)
