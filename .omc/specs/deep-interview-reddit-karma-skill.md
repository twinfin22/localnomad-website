# Deep Interview Spec: Reddit Karma Farming Skill

## Metadata
- Interview ID: reddit-karma-skill-20260313
- Rounds: 8
- Final Ambiguity Score: 17%
- Type: brownfield
- Generated: 2026-03-13
- Threshold: 20%
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.90 | 35% | 0.315 |
| Constraint Clarity | 0.85 | 25% | 0.213 |
| Success Criteria | 0.75 | 25% | 0.188 |
| Context Clarity | 0.75 | 15% | 0.113 |
| **Total Clarity** | | | **0.828** |
| **Ambiguity** | | | **17%** |

## Goal

Create a Claude Code skill (`/reddit-karma`) that helps the user farm Reddit karma efficiently through a two-phase workflow:

1. **Scout Phase**: Dynamically discover relevant subreddits and find high-potential threads where LocalNomad blog knowledge is applicable. Rank opportunities by: engagement level > recency + unanswered > topic match strength.

2. **Draft Phase**: For user-selected threads, generate full draft briefs — reply text written in a founder/expat first-person voice, sourced from existing LocalNomad blog posts (28 posts covering Korea, Japan, Taiwan, China digital nomad topics). Drafts are knowledge-driven, not link-driven. Links are optional and context-dependent.

The user reviews, edits, and posts manually. The skill never posts on the user's behalf.

## Constraints

- **Skill format**: Claude Code skill (`.claude/skills/reddit-karma/SKILL_reddit-karma.md`), NOT an MCP server
- **Reddit data access**: `redditwarp` Python library invoked via Bash CLI. No Reddit API auth required for public data.
- **No auto-posting**: Read-only from Reddit's perspective. All posting is manual by the user.
- **Non-commercial tone**: Drafts must not sound promotional, corporate, or like marketing copy. Reddit users detect and downvote this instantly.
- **Linkless by default**: Drafts use blog content as a knowledge base. Links are suggested as optional placement hints, not required.
- **Voice**: First-person founder/expat who has lived through visa processes, cost-of-living decisions, and nomad logistics. Casual, opinionated, uses "I did X" framing.
- **Anti-AI writing**: All drafts must pass anti-AI detection per [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing). No hedge phrases ("It's important to note"), no filler transitions ("Additionally", "Furthermore"), no false enthusiasm ("exciting", "amazing"), no over-hedging ("This might vary"), no formulaic structure (claim → example → caveat). Write like a real person on Reddit — sentence fragments, contractions, opinions without qualifiers, occasional typos are OK.
- **Subreddit discovery**: Dynamic — skill searches for relevant subreddits based on blog topics, not a hardcoded list.
- **Blog post catalog**: 28 posts across 6 categories (guides, comparisons, tips, news, updates, stories) and 5 countries (korea, japan, taiwan, china, global). Skill reads from `content/blog/` at runtime.
- **Existing skill conventions**: Follow `SKILL_[name].md` format with YAML frontmatter, matching the pattern in `localnomad-blog-plugin/skills/`.

## Non-Goals

- **No Reddit account management** — no login, no profile management, no karma tracking
- **No automated posting** — the skill drafts, the user posts
- **No comment monitoring** — no tracking replies to posted comments
- **No A/B testing** — no variant drafts for the same thread
- **No analytics dashboard** — no karma tracking or ROI measurement
- **No MCP server** — this is a skill file, not a protocol server

## Acceptance Criteria

- [ ] Skill file exists at `.claude/skills/reddit-karma/SKILL_reddit-karma.md` with valid YAML frontmatter
- [ ] Scout phase: uses `redditwarp` via Bash to search subreddits and fetch threads
- [ ] Scout phase: ranks threads by engagement > recency+unanswered > topic match
- [ ] Scout phase: presents a numbered list of opportunities with title, subreddit, score, age, and relevance summary
- [ ] User can select which threads to draft for (interactive selection)
- [ ] Draft phase: reads blog posts from `content/blog/` to build knowledge context
- [ ] Draft phase: produces a full brief per selection containing:
  - Draft reply/post text in first-person founder voice
  - Source blog post(s) referenced for knowledge
  - Why this thread was selected (opportunity rationale)
  - Tone notes for the specific subreddit
  - Optional link placement hint (where a link could go naturally, if at all)
- [ ] Drafts pass the "would a Redditor downvote this as self-promo?" smell test — no corporate voice, no forced links
- [ ] Drafts pass anti-AI detection: no hedge phrases, no filler transitions, no false enthusiasm, no formulaic structure per Wikipedia:Signs_of_AI_writing. Reads like a real person typed it on their phone.
- [ ] Skill can generate new subreddit posts (not just replies)
- [ ] `redditwarp` Python package is documented as a prerequisite in the skill file
- [ ] Skill follows existing naming conventions (`SKILL_reddit-karma.md` with references/ if needed)

## Assumptions Exposed & Resolved

| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| Blog posts should always be linked | Contrarian: Reddit downvotes link drops | Linkless by default — blog is knowledge source, not traffic driver |
| Fixed subreddit list is sufficient | User chose dynamic discovery | Skill discovers subreddits based on blog topics at runtime |
| Drafts just need reply text | Simplifier: what's the minimum? | Full brief needed: text + source + rationale + tone + link hint |
| Goal is traffic to blog | Contrarian exposed this | Goal is karma/authority. Traffic is secondary/optional |

## Technical Context

### Existing Skill Infrastructure
- Skill files: `SKILL_[name].md` with YAML frontmatter (`name`, `description`)
- Reference files: `references/[topic].md` subdirectory
- Invocation: via `/skill-name` or keyword trigger
- Pattern: see `localnomad-blog-plugin/skills/` for 6 existing skill examples

### Reddit Data Access
- Library: `redditwarp` (Python, same as mcp-server-reddit)
- No auth required for public data
- Key operations needed:
  - Search subreddits by topic
  - Get hot/rising/new posts from a subreddit
  - Get post content and comments
  - Get subreddit info (rules, description)
- Invoked via `python3 -c "..."` or a helper script in `scripts/`

### Blog Post Catalog (28 posts)
- Location: `content/blog/[category]/[slug].mdx`
- Categories: guides, comparisons, tips, news, updates, stories
- Countries: korea, japan, taiwan, china, global
- Schema: `lib/blog/schema.ts`
- URL pattern: `/en/blog/[category]/[slug]`
- The skill should glob and read frontmatter to build a topic index at runtime

## Ontology (Key Entities)

| Entity | Fields | Relationships |
|--------|--------|---------------|
| Opportunity | thread_id, subreddit, title, score, age, comment_count, relevance_score, matching_blog_posts | Found during Scout, selected for Draft |
| Draft Brief | draft_text, source_posts[], rationale, tone_notes, link_hint | Generated from Opportunity + Blog Posts |
| Blog Post | slug, title, category, country, tags, content | Knowledge source for Drafts |
| Subreddit | name, description, subscriber_count, rules | Discovered dynamically, contains Opportunities |

## Interview Transcript

<details>
<summary>Full Q&A (8 rounds)</summary>

### Round 1
**Q:** When you say 'farm Reddit karma faster', what's the actual workflow you envision?
**A:** Both replies + new posts, but don't make it sound commercial.
**Ambiguity:** 61% (Goal: 0.50, Constraints: 0.40, Criteria: 0.10, Context: 0.60)

### Round 2
**Q:** How do you actually use this skill day-to-day? Walk me through the workflow.
**A:** Scout first, draft second. Two-step: first shows opportunities, I pick, then it drafts.
**Ambiguity:** 52% (Goal: 0.70, Constraints: 0.40, Criteria: 0.20, Context: 0.60)

### Round 3
**Q:** How should the skill access Reddit data? (mcp-server-reddit uses redditwarp)
**A:** Install redditwarp as CLI — same library, invoked via Bash.
**Ambiguity:** 45% (Goal: 0.70, Constraints: 0.60, Criteria: 0.20, Context: 0.70)

### Round 4
**Q:** How should the skill rank 'high-potential' karma opportunities?
**A:** Priority: high engagement > recency+unanswered > topic match strength.
**Ambiguity:** 37% (Goal: 0.75, Constraints: 0.60, Criteria: 0.45, Context: 0.70)

### Round 5 (Contrarian)
**Q:** What if the highest-karma move is answering WITHOUT linking the blog? Would linkless drafts still be valuable?
**A:** Yes, linkless drafts are fine. Primary goal is karma, blog knowledge is the source.
**Ambiguity:** 32% (Goal: 0.85, Constraints: 0.60, Criteria: 0.50, Context: 0.70)

### Round 6 (Simplifier)
**Q:** What's the minimum a draft needs? Just reply text, or metadata too?
**A:** Full brief per draft: text + source blog posts + selection rationale + tone notes + link hint.
**Ambiguity:** 23% (Goal: 0.90, Constraints: 0.70, Criteria: 0.70, Context: 0.70)

### Round 7
**Q:** Which subreddits should the skill scout — fixed list or dynamic discovery?
**A:** Dynamic discovery based on blog topics.
**Ambiguity:** 30% → recalc with constraints improvement

### Round 8
**Q:** What persona should the drafts use?
**A:** Founder who lives it — first-person, experienced expat/nomad, casual and opinionated.
**Ambiguity:** 17% — PASSED

</details>
