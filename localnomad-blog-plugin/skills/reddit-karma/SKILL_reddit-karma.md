---
name: reddit-karma
description: Two-phase Reddit karma farming — scout high-potential threads, then draft authentic replies using LocalNomad blog knowledge. Read-only, human-in-the-loop.
---

# Reddit Karma

Scout Reddit for threads where LocalNomad blog knowledge is relevant, then draft replies or posts in Gen's founder voice. Never posts automatically — all output is draft text for manual review and posting.

## Prerequisites

- Python 3 installed (stdlib only — no pip/venv needed)
- `scripts/reddit-scout.py` available (thin CLI over `scripts/common/fetch.py`)

## Phase 1 — Scout

Find high-potential threads where LocalNomad blog content can provide genuine value.

### Step 1: Build Topic Index

Generate the topic index from blog frontmatter:
```bash
python3 scripts/reddit-scout.py index
```
Returns JSON array of `{slug, title, category, country, tags, path}` for all published posts. Group by country and topic to plan discovery queries.

### Step 2: Discover Subreddits

For each country/topic cluster, discover relevant subreddits:
```bash
python3 scripts/reddit-scout.py discover "digital nomad korea"
python3 scripts/reddit-scout.py discover "living in japan foreigner"
python3 scripts/reddit-scout.py discover "taiwan expat"
```
Also check seed topics in `references/subreddit-seed-topics.md` for baseline queries.

### Step 3: Search Threads

Search discovered subreddits for recent threads:
```bash
python3 scripts/reddit-scout.py search digitalnomad "korea visa" --time week --limit 10
python3 scripts/reddit-scout.py search korea "digital nomad" --sort new --limit 10
```

### Step 4: Rank Opportunities

Score each thread. Priority order:
1. **Engagement** — high upvotes + active comments = more eyeballs
2. **Recency + unanswered** — fresh threads (< 48h) with few quality answers = early mover advantage
3. **Topic match** — how directly a blog post answers the thread's question

Present a ranked table:

```
# | Subreddit       | Title                          | Score | Comments | Age  | Match
1 | r/digitalnomad  | Korea visa for remote workers?  | 45    | 12       | 6h   | korea-f1d-workation-visa-2026
2 | r/korea         | Moving to Seoul, need tips      | 23    | 8        | 18h  | korea-arrival-checklist-2026
...
```

### Step 5: User Selection

Use `AskUserQuestion` to let the user pick which threads to draft for. Allow multi-select.

## Phase 2 — Draft

For each selected thread, produce a full brief.

### Step 1: Fetch Thread Context

```bash
python3 scripts/reddit-scout.py thread "/r/digitalnomad/comments/abc123/korea_visa_question/"
```
Read the post body and existing comments. Understand what's already been said — don't repeat it.

### Step 2: Match Blog Knowledge

Identify which blog post(s) contain relevant knowledge. Read their content:
```bash
cat content/blog/guides/korea-f1d-workation-visa-2026.mdx
```
Extract the specific facts, numbers, and experiences that answer the thread.

### Step 3: Draft Reply

Write the draft following `references/voice-guide-reddit.md`. Key rules:
- First-person founder voice: "I've been living in Seoul for..." / "When I went through the F-1-D process..."
- Pull specific facts from blog posts but rewrite in conversational Reddit style
- Match thread energy: short thread = short reply, deep discussion = longer
- No links by default. If a link fits naturally, note it as an optional placement hint.

### Step 4: Compose Brief

Output a structured brief per `references/brief-template.md` for each selection.

## New Post Mode

When drafting original subreddit posts (not replies):
- Frame as sharing personal experience or useful info, never as promotion
- Title should match subreddit norms (check top posts for style)
- Body follows the same voice/anti-AI rules as replies
- Longer format OK (300-800 words) but must earn every paragraph

## Degradation

If the scout script returns zero results or errors:
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

## Output Format

See `references/brief-template.md` for the full template.

## References

- `references/subreddit-seed-topics.md` — baseline topic-to-query mapping
- `references/voice-guide-reddit.md` — Reddit-specific voice adaptation + anti-AI rules
- `references/brief-template.md` — structured output format for draft briefs
- `localnomad-blog-plugin/skills/quality-gate/references/anti-ai-checklist.md` — full banned words and structures list
- `localnomad-blog-plugin/skills/blog-voice/references/voice-examples.md` — LibaD voice DNA
