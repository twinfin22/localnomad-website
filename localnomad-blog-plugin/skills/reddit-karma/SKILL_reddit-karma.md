---
name: reddit-karma
description: Two-phase Reddit karma farming — scout high-potential threads, then draft authentic replies using LocalNomad blog knowledge. Subagent architecture with JSON contracts, progressive context loading, and self-eval gates.
---

# Reddit Karma

Scout Reddit for threads where LocalNomad blog knowledge is relevant, then draft replies or posts in Gen's founder voice. Never posts automatically — all output is draft text for manual review and posting.

## Prerequisites

- Python 3 installed (stdlib only — no pip/venv needed)
- `scripts/reddit-scout.py` available (thin CLI over `scripts/common/fetch.py`)

## Architecture

```
Main (orchestrator)
├─ Phase 1: Scout Agent (Explore)
│   index → discover → search → score → JSON file
│   Returns: $TMPDIR/scout-results.json (top 10, structured)
├─ Main reads JSON → AskUserQuestion with options
└─ Phase 2: Draft Agents (executor, parallel)
    ├─ Each receives: structured JSON input (permalink, slugs, subreddit)
    ├─ Each does: progressive MDX loading → CoT analysis → draft → self-eval
    └─ Each returns: completed brief only
```

Context stays lean: main context holds the ranked table + final briefs.
Heavy lifting (blog MDX reads, comment parsing, checklist validation) happens inside subagents and is released when they complete.

---

## Phase 1 — Scout (subagent)

Spawn a single **Explore** agent with this prompt:

```
Scout Reddit for LocalNomad karma opportunities. Output structured JSON.

STEP 1 — BLOG INDEX
Run: python3 scripts/reddit-scout.py index
Parse the JSON output. Group posts by country.

STEP 2 — DISCOVER SUBREDDITS
For each country (korea, japan, taiwan, china), pick 2-3 queries from:
- Blog topics from Step 1
- Seed queries from localnomad-blog-plugin/skills/reddit-karma/references/subreddit-seed-topics.md

Run: python3 scripts/reddit-scout.py discover "<query>"
Collect all subreddits. Deduplicate. Skip any with < 1000 subscribers.

Check localnomad-blog-plugin/skills/reddit-karma/references/subreddit-profiles.json
for cached profiles. For any NEW subreddit not in the cache, note it for profile creation.

STEP 3 — SEARCH THREADS
For each viable subreddit, run:
  python3 scripts/reddit-scout.py search <sub> "<query>" --time week --limit 10
  python3 scripts/reddit-scout.py hot <sub> --listing new --limit 5

STEP 4 — SCORE & RANK
Score every thread using this formula:

  SCORE = (engagement × 0.4) + (freshness × 0.3) + (match × 0.3)

  engagement = min(score + num_comments, 100) / 100
  freshness  = max(0, 1 - (age_hours / 168))    # 1.0 at 0h, 0.0 at 7d
  match      = 1.0 if exact topic match
               0.5 if related country
               0.2 if general nomad topic

STEP 5 — OUTPUT
Write results to $TMPDIR/scout-results.json as:
{
  "generated": "ISO timestamp",
  "opportunities": [
    {
      "rank": 1,
      "score": 0.85,
      "subreddit": "digitalnomad",
      "title": "...",
      "permalink": "/r/...",
      "post_score": 45,
      "num_comments": 12,
      "age_hours": 6,
      "matching_slugs": ["korea-f1d-workation-visa-2026"],
      "why": "High engagement, unanswered visa question, exact topic match"
    }
  ],
  "new_subreddits": [
    {"name": "...", "subscribers": ..., "suggested_profile": "..."}
  ]
}

Return the top 10 only. Also return the file path.

Also update localnomad-blog-plugin/skills/reddit-karma/references/subreddit-profiles.json
with profiles for any newly discovered subreddits (tone, avoid, best_for fields).
```

### Processing Scout Results

1. Read `$TMPDIR/scout-results.json`
2. Present as a numbered table to the user
3. Use `AskUserQuestion` (multiSelect: true) to let user pick threads
4. For each selection, extract `permalink` and `matching_slugs` from the JSON

---

## Phase 2 — Draft (parallel subagents)

For each selected thread, spawn an **executor** agent. Launch all in parallel.

Each agent gets this prompt (fill `{permalink}`, `{matching_slugs}`, `{subreddit}`, `{why}`):

```
Draft a Reddit reply brief for a karma opportunity.

═══ INPUT ═══
Thread permalink: {permalink}
Subreddit: r/{subreddit}
Matching blog slugs: {matching_slugs}
Selection reason: {why}

═══ STEP 1: FETCH THREAD ═══
Run: python3 scripts/reddit-scout.py thread "{permalink}"
Parse the JSON. Note:
- Post title, body, author, score
- Top 3 comments (author, score, summary) — these are your COMPETITORS

═══ STEP 2: PROGRESSIVE BLOG LOADING ═══
For each matching slug:
1. Read ONLY the frontmatter (first 20 lines) to confirm relevance
2. Scan heading outline (grep for ^## lines) to find relevant sections
3. Read ONLY the relevant sections using offset/limit — NOT the entire file

Extract specific facts, numbers, dates that answer the thread.

═══ STEP 3: CHAIN-OF-THOUGHT ANALYSIS ═══
Before writing anything, answer these 5 questions:

1. THREAD ANALYSIS: What is the person actually asking? (1 sentence)
2. GAP ANALYSIS: What have the top 3 existing replies NOT covered? (bullets)
3. KNOWLEDGE MATCH: Which specific blog facts fill that gap? (with numbers)
4. ANGLE: What unique perspective does a founder who lived this add?
5. LENGTH DECISION: Based on thread energy, target word count? (short/medium/long)

═══ STEP 4: DRAFT ═══
Write the reply following localnomad-blog-plugin/skills/reddit-karma/references/voice-guide-reddit.md.

Check subreddit profile in localnomad-blog-plugin/skills/reddit-karma/references/subreddit-profiles.json
for tone guidance specific to r/{subreddit}.

Key rules:
- First-person founder voice
- Specific numbers, dates, opinions. No hedging.
- Match thread energy from LENGTH DECISION
- No links by default
- If draft-examples.md exists in references/, match that quality level

═══ STEP 5: ANTI-AI SELF-CHECK ═══
Verify against Quick self-check in voice-guide-reddit.md:
- [ ] Zero banned words (delve, crucial, landscape, leverage, navigate, comprehensive, robust, vibrant)
- [ ] Zero hedge phrases, filler transitions, false enthusiasm
- [ ] Sentence length varies (fragments mixed with longer)
- [ ] At least 1 specific number/date
- [ ] At least 1 opinion or judgment
If ANY violation: rewrite before proceeding.

═══ STEP 6: SELF-EVAL GATE ═══
Rate your draft 1-5 on each dimension:
- Specificity (numbers, dates, places): ___
- Voice authenticity (sounds human, not AI): ___
- Thread relevance (actually answers the question): ___
- Differentiation (new info vs existing replies): ___

If ANY dimension < 3: rewrite that aspect. Show what changed.

═══ OUTPUT ═══
Return ONLY the completed brief:

## Thread
- Subreddit: r/{subreddit}
- Title: [from thread]
- URL: [from thread]
- Age/Score/Comments: [from thread]

## Why This Thread
[from selection reason + your analysis]

## Source Blog Post(s)
| Post | Key Facts Used |
|------|---------------|

## Existing Replies (top 3)
- u/[author1] ([score]): [1-line summary]
- u/[author2] ([score]): [1-line summary]
- u/[author3] ([score]): [1-line summary]
[Or: "Thread is under-answered — opportunity to be the definitive reply."]

## Chain-of-Thought
[Your 5-question analysis from Step 3 — compressed to 3-4 lines]

## Draft
[The reply text. Linkless. Founder voice. Anti-AI compliant. Self-eval passed.]

## Self-Eval
Specificity: _/5 | Voice: _/5 | Relevance: _/5 | Differentiation: _/5

## Tone Notes
[Subreddit-specific guidance from profile]

## Link Hint (optional)
[Natural placement or "No natural link placement."]
```

### Collecting Results

When all draft agents complete, present each brief to the user in order.
The main context only holds the final briefs — all MDX content, thread comments, and analysis happened inside agents.

---

## New Post Mode

When drafting original subreddit posts (not replies), add to the agent prompt:
- Frame as sharing personal experience, never promotion
- Title should match subreddit norms (agent should check top posts via `hot` subcommand)
- Body follows same voice/anti-AI rules
- Longer format OK (300-800 words) but must earn every paragraph
- Self-eval adds a 5th dimension: "Title quality (would you click this?)"

## Degradation

If the scout agent returns zero results or errors:
- Fall back to `references/subreddit-seed-topics.md` for manual subreddit browsing
- Use `WebSearch` with `site:reddit.com [topic]` as last resort
- Report the error to the user and suggest running the scout script manually to debug

## Hard Rules

- **NEVER** post to Reddit automatically. All output is draft text only.
- **NEVER** include links by default. Blog knowledge informs the reply; links are optional hints.
- **NEVER** use hedge phrases: "It's important to note", "It's worth mentioning", "Needless to say"
- **NEVER** use filler transitions: "Additionally", "Furthermore", "Moreover", "In addition"
- **NEVER** use false enthusiasm: "exciting", "amazing", "incredible", "game-changer"
- **NEVER** use formulaic structure: claim → example → caveat. Vary the rhythm.
- **NEVER** use corporate voice: "comprehensive guide", "navigate the landscape", "leverage opportunities"
- **NEVER** start with "Great question!" or end with "Hope this helps!"
- **NEVER** write bullet-point lists of advice. Write like a person, not a FAQ.
- **NEVER** use the same sentence length throughout. Mix fragments with longer sentences.

## Soft Rules

- Prefer threads < 48h old (use `--time week` for near-real-time filtering)
- Prefer unanswered questions over threads with 50+ replies
- Vary reply length — some threads need 2 sentences, others need 5 paragraphs
- Include at least 1 specific number, date, or personal detail per reply
- Contractions always (don't, can't, it's, won't) — never formal English
- Occasional sentence fragments are good. Like this.
- Parenthetical asides add personality (just don't overdo it)

## References

- `references/subreddit-seed-topics.md` — baseline topic-to-query mapping
- `references/subreddit-profiles.json` — cached subreddit tone profiles (auto-updated by scout)
- `references/voice-guide-reddit.md` — Reddit-specific voice adaptation + anti-AI rules
- `references/brief-template.md` — structured output format for draft briefs
- `references/draft-examples.md` — gold-standard draft examples + anti-patterns (TODO: add examples)
- `localnomad-blog-plugin/skills/quality-gate/references/anti-ai-checklist.md` — full banned words list (load only if draft fails quick self-check)
- `localnomad-blog-plugin/skills/blog-voice/references/voice-examples.md` — LibaD voice DNA (load only for new post mode)
