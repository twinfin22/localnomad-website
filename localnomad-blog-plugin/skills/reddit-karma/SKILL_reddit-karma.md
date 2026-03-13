---
name: reddit-karma
description: Two-phase Reddit karma farming — scout high-potential threads, then draft authentic replies using LocalNomad blog knowledge. Read-only, human-in-the-loop. Uses subagents for context efficiency.
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
│   index → discover → search → rank → top 10 table
│   Returns: compact ranked table only
├─ User selects threads (AskUserQuestion)
└─ Phase 2: Draft Agents (executor, parallel)
    ├─ Agent per thread: fetch + read MDX + draft + anti-AI check
    └─ Each returns: completed brief only
```

Context stays lean: main context holds the ranked table + final briefs.
Heavy lifting (blog MDX reads, comment parsing, checklist validation) happens inside subagents and is released when they complete.

## Phase 1 — Scout (subagent)

Spawn a single **Explore** agent with this prompt:

```
Scout Reddit for LocalNomad karma opportunities.

1. Run `python3 scripts/reddit-scout.py index` to get the blog topic map.

2. For each country (korea, japan, taiwan, china), pick 2-3 discovery queries
   from the blog topics and from `localnomad-blog-plugin/skills/reddit-karma/references/subreddit-seed-topics.md`.
   Run `python3 scripts/reddit-scout.py discover "<query>"` for each.

3. For each discovered subreddit (deduplicated, skip < 1000 subscribers),
   run `python3 scripts/reddit-scout.py search <subreddit> "<query>" --time week --limit 10`.
   Also try `python3 scripts/reddit-scout.py hot <subreddit> --listing new --limit 5` for fresh threads.

4. Rank ALL results by:
   - Engagement: high score + active comments = more eyeballs
   - Recency + unanswered: < 48h old with few quality answers
   - Topic match: how directly a blog post answers the question

5. Return ONLY the top 10 opportunities as a markdown table:
   # | Subreddit | Title | Score | Comments | Age | Matching Blog Post(s)

   Also note any new subreddits worth tracking that aren't in seed-topics.md.
```

When the scout agent returns, present the ranked table to the user.

### User Selection

Use `AskUserQuestion` to let the user pick which threads to draft for. Allow multi-select.

## Phase 2 — Draft (parallel subagents)

For each selected thread, spawn an **executor** agent. Launch all in parallel.

Each agent gets this prompt (fill in `{permalink}`, `{blog_slugs}`, `{subreddit}`):

```
Draft a Reddit reply brief for a thread.

THREAD: Fetch context with:
  python3 scripts/reddit-scout.py thread "{permalink}"
Read the post body and top comments. Note what's already been said — don't repeat it.

KNOWLEDGE: Read these blog posts for source material:
  {for each slug: cat content/blog/{category}/{slug}.mdx}
Extract specific facts, numbers, dates, and personal experiences that answer the thread.

EXISTING REPLIES: Note the top 3 comments in the thread. The draft must differentiate
from these — add new information or a different angle, not a restatement.

VOICE: Follow `localnomad-blog-plugin/skills/reddit-karma/references/voice-guide-reddit.md` exactly.
- First-person founder: "I've been living in Seoul for..." / "When I went through the F-1-D..."
- Specific numbers, dates, opinions. No hedging.
- Match thread energy: short thread = short reply, deep discussion = longer.
- No links by default. If a link fits naturally, note as optional placement hint.

ANTI-AI CHECK: Before finalizing, verify against the Quick self-check in voice-guide-reddit.md:
- Zero banned words (delve, crucial, landscape, leverage, navigate, comprehensive, robust, vibrant)
- Zero hedge phrases, filler transitions, false enthusiasm
- Sentence length varies (mix fragments and longer sentences)
- At least 1 specific number/date and 1 opinion
If ANY violation found, rewrite before outputting.

OUTPUT: Return a completed brief using this format:

## Thread
- Subreddit: r/{subreddit}
- Title: [from fetched thread]
- URL: [from fetched thread]
- Age/Score/Comments: [from fetched thread]

## Why This Thread
[1-2 sentences on why this is a good opportunity]

## Source Blog Post(s)
| Post | Key Facts Used |
|------|---------------|
| [slug] | [specific facts pulled] |

## Existing Replies (top 3)
[Summarize what top commenters already said — 1 line each]

## Draft
[The actual reply text. Linkless. Founder voice. Anti-AI compliant.]

## Tone Notes
[Subreddit-specific guidance]

## Link Hint (optional)
[Natural placement or "No natural link placement. Value is in the answer itself."]
```

### Collecting Results

When all draft agents complete, present each brief to the user in order. The main context only holds the final briefs — all the MDX content, thread comments, and checklist validation happened inside the agents.

## New Post Mode

When drafting original subreddit posts (not replies), include in the agent prompt:
- Frame as sharing personal experience, never promotion
- Title should match subreddit norms (agent should check top posts for style)
- Body follows same voice/anti-AI rules
- Longer format OK (300-800 words) but must earn every paragraph

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
- `references/voice-guide-reddit.md` — Reddit-specific voice adaptation + anti-AI rules
- `references/brief-template.md` — structured output format for draft briefs
- `localnomad-blog-plugin/skills/quality-gate/references/anti-ai-checklist.md` — full banned words list (load only if draft fails quick self-check)
- `localnomad-blog-plugin/skills/blog-voice/references/voice-examples.md` — LibaD voice DNA (load only for new post mode)
