---
name: instagram
description: LocalNomad Instagram carousel pipeline — folder-based state machine with 6 modes (generate, batch, review, schedule, status, log). Repurposes blog posts into carousel JSON + images via configurable image backend.
---

# /instagram [slug | batch | review | schedule | status | log]

## Invocation

```
/instagram [slug]           # Generate single carousel → draft/
/instagram batch            # Scan for IG-less blogs, generate up to 5 → draft/
/instagram review           # Batch review all items in draft/
/instagram schedule         # Assign dates to approved/ items → scheduled/
/instagram status           # Show counts per folder
/instagram log [slug]       # Log 48h performance data
```

Options:
- `--force` — skip dedup check, regenerate even if slug exists in any state folder

---

## State Machine — Folder Layout

```
content/instagram/
  draft/        ← generated, awaiting review
  approved/     ← Gen-approved, awaiting scheduling
  scheduled/    ← date-assigned, awaiting posting
  posted/       ← posted to Instagram

public/images/instagram/[slug]/
  slide-01.png ... slide-NN.png    ← never moved (images stay regardless of JSON state)
```

State transition = `mv` JSON between folders. Images are fixed at `public/images/instagram/[slug]/` and never moved.

Output JSON conforms to `contracts/instagram-output.schema.json`.

---

## Before You Start

Skills loaded per mode:

- GENERATOR: `skills/instagram-repurpose/SKILL_instagram-repurpose.md`
- ALL MODES: `skills/legal-bright-lines/SKILL_legal-bright-lines.md` (if country = taiwan or content mentions tax)

Memory files — read before any generation step:
- `memory/instagram-style-guide.md` (Gen's preferences — tone, template, anti-patterns, backend config)
- `memory/instagram-performance.md` (what performs well — save rates, patterns)

If either file is missing or empty, proceed without it. Preferences will be built from session feedback.

---

## /instagram [slug] — Single Generator

### Step 1: Dedup Check

Scan all 4 state folders for a JSON file matching `[slug]`:

```bash
ls content/instagram/draft/ content/instagram/approved/ \
   content/instagram/scheduled/ content/instagram/posted/ 2>/dev/null | grep "[slug]"
```

If found: report which folder it's in and stop. Do not regenerate unless `--force` is passed.

### Step 2: Read Source Blog

```bash
cat content/blog/*/[slug].mdx
```

Extract from MDX:
- `title`, `description`, `category`, `country`, `tags` (frontmatter)
- All H2 sections and their content
- Numbered lists, checklists, comparison tables
- TL;DR content
- Key statistics or data points

If slug not found: search `content/blog/` for close matches and suggest alternatives.

### Step 3: Load Style Guide

Read `memory/instagram-style-guide.md`. Apply all preferences. Memory overrides defaults below when they conflict.

### Step 4: Load Skill

Read `skills/instagram-repurpose/SKILL_instagram-repurpose.md`.

### Step 5: Determine Carousel Type

```
Blog Category     → Carousel Type      → Slide Structure
─────────────────────────────────────────────────────────
tips, guides      → Type A (list)      → intro → point-per-slide → CTA
comparisons       → Type B (compare)   → intro → side-by-side × N → verdict → CTA
stories, news     → Type C (narrative) → intro → story beats × N → takeaway → CTA
updates           → Type A or C        → judge by content
```

Override: if `memory/instagram-style-guide.md` specifies a preferred type for this category, use that.

### Step 6: Generate Slides

**Constraints** (memory overrides these when they conflict):
- **Slide count**: 7-10 total (intro + content slides + ending)
- **Words per slide**: ≤25 words (heading + description combined)
- **Intro slide**: hook question or bold statement — NOT the blog title verbatim
- **Content slides**: one idea per slide, no walls of text
- **Ending slide**: CTA — default "Save this for your trip" (override with memory preference)

**Extraction rules**:
- Compress, don't summarize. Each slide = one actionable takeaway.
- Prioritize: numbers, lists, comparisons, surprising facts.
- Drop: nuance, caveats, context paragraphs, footnotes.
- If blog has 5+ H2 sections: pick the 5-7 most Instagram-worthy, skip the rest.

### Step 7: Generate Caption + Hashtags

Follow `skills/instagram-repurpose/SKILL_instagram-repurpose.md` caption formulas.

Caption structure:
```
[Hook — ≤15 words, question or bold statement]

[Body — 2-3 short paragraphs, ≤150 words total]
[Expand the carousel's #1 takeaway. Direct address ("you"). Short sentences.]

[CTA — save/share/comment prompt]

#hashtags on final line
```

Hashtag structure (25-30 total):
- 5 high-volume (500K+ posts): #digitalnomad #remotework #expat etc.
- 10 medium (50K-500K): country-specific
- 10 niche (5K-50K): topic-specific
- 3-5 branded: #localnomad #localnomadclub #localnomad[country]

### Step 8: Legal Flags

Check and set `legalFlags[]` in output:
- `country: taiwan` → add "taiwan-dual-language" flag; ending slide must include "Not legal advice. 非法律建議。"
- Content mentions tax → add "tax-disclaimer" flag; add micro-disclaimer slide before CTA
- Visa eligibility language → NEVER "you qualify" — use "you may be able to"

If flags triggered: load `skills/legal-bright-lines/SKILL_legal-bright-lines.md` for exact disclaimer text.

### Step 9: Image Generation

Read backend from `memory/instagram-style-guide.md`:
```
backend: contentdrips   ← current default
backend: html-png       ← future (Playwright + HTML templates)
```

**Contentdrips flow:**

```bash
# 1. Submit render job
curl -X POST "https://generate.contentdrips.com/render?tool=carousel-maker" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONTENTDRIPS_API_KEY" \
  -d '{ ... }'   # payload from slide content + templateId

# 2. Poll until status = "done" (timeout: 60s)
curl -H "Authorization: Bearer $CONTENTDRIPS_API_KEY" \
  "https://generate.contentdrips.com/status/[job_id]"

# 3. Download PNGs
mkdir -p public/images/instagram/[slug]
for i in "${!urls[@]}"; do
  curl -o "public/images/instagram/[slug]/slide-$(printf '%02d' $((i+1))).png" "${urls[$i]}"
done
```

If `CONTENTDRIPS_API_KEY` is not set: stop and ask Gen to provide it.

Set `images.imageStatus`:
- `"complete"` — all slides downloaded
- `"pending"` — job submitted but not yet polled
- `"failed"` — API error or timeout

### Step 10: Suggest Post Time

```
korea  → 7-9 PM KST (Tue/Thu optimal)
japan  → 7-9 PM JST (Tue/Thu optimal)
taiwan → 7-9 PM CST (Tue/Thu optimal)
global → 9 AM EST / 6 PM KST (Wed optimal)
```

Override with `memory/instagram-performance.md` patterns if available.

### Step 11: Write Output JSON

Write to `content/instagram/draft/[YYYY-MM-DD]_[slug].json` conforming to `contracts/instagram-output.schema.json`.

Present to Gen:
1. **Source blog**: title + category + country
2. **Carousel type**: A/B/C with reasoning
3. **Slide preview**:
   ```
   [1/8] INTRO: "Still googling what to do when you land in Tokyo?"
   [2/8] "Activate your SIM — airport counter, 5 min"
   ...
   [8/8] CTA: "Save this for your trip → @localnomad.club"
   ```
4. **Caption** (copy-paste ready)
5. **Hashtags**
6. **Legal flags**: any disclaimers applied?
7. **Image status**: complete / failed with paths or error
8. **Suggested post time**
9. Reminder: `게시 후 48시간 뒤: /instagram log [slug]`

---

## /instagram batch — Batch Generator

Scan and generate up to 5 carousels for blogs that have no Instagram post yet.

### Step 1: Build Coverage Map

```bash
# All published blog posts
grep -rl "draft: false" content/blog/ | sort

# All slugs already in pipeline (any state)
ls content/instagram/draft/ content/instagram/approved/ \
   content/instagram/scheduled/ content/instagram/posted/ 2>/dev/null
```

Cross-reference: find published blogs with no matching slug in any state folder.

### Step 2: Select Up to 5

From unmatched posts, pick up to 5 using this priority:
1. Newest first (by frontmatter `date`)
2. Diverse categories — avoid picking 3+ posts from same category
3. Skip drafts (`draft: true`)

### Step 3: Run Generator

For each selected slug, run the full single-generator flow (Steps 1-11 above) sequentially. Do not parallelize — image API calls are sequential.

### Step 4: Present Summary

```
Batch complete: 5 posts processed

  ✓ [slug-1]   → draft/2026-03-16_slug-1.json   (Type A, 8 slides)
  ✓ [slug-2]   → draft/2026-03-16_slug-2.json   (Type C, 7 slides)
  ⚠ [slug-3]   → draft/2026-03-16_slug-3.json   (Type B, imageStatus: failed)
  ✓ [slug-4]   → draft/2026-03-16_slug-4.json   (Type A, 9 slides)
  ✓ [slug-5]   → draft/2026-03-16_slug-5.json   (Type A, 7 slides)

Run /instagram review to approve, edit, or reject.
```

---

## /instagram review — Batch Review

Single checkpoint: Gen reviews all items in `draft/` and decides fate of each.

### Step 1: Load Draft Items

```bash
ls content/instagram/draft/
```

If folder is empty: report "No drafts to review." and stop.

### Step 2: Display Each Item

For each JSON in `draft/`, display:

```
─────────────────────────────────────────
[slug-name]  Type: A  Slides: 8  Country: korea
─────────────────────────────────────────
[1/8] INTRO: "Heading text here"
              "Description text"
[2/8] "Heading"
      "Description"
...
[8/8] CTA: "Save this for your trip"

Caption: [first 100 chars...]
Legal flags: [none | taiwan-dual-language | tax-disclaimer]
Image status: complete ✓  |  failed ⚠️
```

### ✅ CHECKPOINT

**STOP and wait for Gen's decision on each item.**

Per item, Gen responds with one of:
- `✅` or `approve` → `mv` JSON to `content/instagram/approved/`
- `✏️ [edits]` → apply edits to JSON in place, stay in `draft/`
- `❌` or `reject` → delete JSON from `draft/`; note: images in `public/images/instagram/[slug]/` are NOT deleted automatically (ask Gen if they should be removed)

### Step 3: Present Summary

```
Review complete:
  3 approved  → content/instagram/approved/
  1 edited    → remains in draft/ (run /instagram review again to re-review)
  1 rejected  → deleted
```

---

## /instagram schedule — Schedule Approved Posts

Assign posting dates to all items in `approved/` and move to `scheduled/`.

### Step 1: Load Approved Items

```bash
ls content/instagram/approved/
```

If empty: report "No approved posts to schedule." and stop.

### Step 2: Load Existing Schedule

```bash
ls content/instagram/scheduled/
```

Parse dates from filenames to find next available slots.

### Step 3: Assign Dates

Rules:
- Weekdays only (Mon-Fri)
- One post per day maximum
- Avoid duplicate `country` values in the same week when possible
- Start from tomorrow if no slots are taken; otherwise find next open weekday

### Step 4: Preview

Present schedule before moving files:

```
Proposed schedule:

  Mon 2026-03-17  → slug-1  (korea, Type A)
  Tue 2026-03-18  → slug-2  (japan, Type C)
  Thu 2026-03-20  → slug-3  (taiwan, Type B)

Approve? (yes / adjust)
```

**STOP and wait for Gen's response.**

### Step 5: Execute

On Gen's approval:
- Rename files with date prefix if not already dated: `[YYYY-MM-DD]_[slug].json`
- `mv` each JSON to `content/instagram/scheduled/`

Report: "Scheduled N posts. Next post: [date] — [slug]"

---

## /instagram status — Pipeline Status

```bash
echo "Instagram Pipeline Status:"
echo "  draft/      $(ls content/instagram/draft/ 2>/dev/null | wc -l | tr -d ' ') posts"
echo "  approved/   $(ls content/instagram/approved/ 2>/dev/null | wc -l | tr -d ' ') posts"
echo "  scheduled/  $(ls content/instagram/scheduled/ 2>/dev/null | wc -l | tr -d ' ') posts"
echo "  posted/     $(ls content/instagram/posted/ 2>/dev/null | wc -l | tr -d ' ') posts"
```

If `scheduled/` has items, show next scheduled date:

```
Instagram Pipeline Status:
  draft/      3 posts
  approved/   2 posts
  scheduled/  5 posts  (next: Mon 2026-03-18 — [slug])
  posted/     12 posts
```

---

## /instagram log [slug] — Performance Logging

Record 48-hour performance data for a posted carousel.

### Step 1: Find Post

```bash
ls content/instagram/posted/ | grep "[slug]"
```

If not found: check other state folders and report location. Log mode is only for `posted/` items.

### Step 2: Collect Metrics

Prompt Gen for:
- Reach (impressions)
- Saves
- Shares
- Comments
- Qualitative notes (what resonated, what didn't)

### Step 3: Append to Raw Log

Append to `memory/instagram-raw-log.md`:

```markdown
## [YYYY-MM-DD] — [slug] (PERFORMANCE)
- Type: [A/B/C], Slides: [count], Country: [country]
- Reach: [N] / Saves: [N] / Shares: [N] / Comments: [N]
- Save rate: [saves/reach × 100]%
- Gen notes: "[qualitative feedback]"
```

### Step 4: Compaction Check

Count entries since last compaction marker in `memory/instagram-raw-log.md`.

If 10+ entries:
```
Raw log has [N] entries since last compaction.
Run compaction to distill into style-guide + performance files? (yes / skip)
```

**Compaction process** (when triggered):

Read all raw-log entries since last compaction. Rewrite the two distilled files:

**memory/instagram-style-guide.md** — extract:
- Consistent preferences (template, slide count, tone)
- Repeated anti-patterns (things Gen rejected)
- Formatting rules that emerged

**memory/instagram-performance.md** — extract:
- Top 3 / Bottom 3 by save rate
- Category → performance patterns
- Optimal slide count and template type correlations

After compaction, add separator in raw-log:
```markdown
---
## COMPACTED on [date] into distilled files
## New entries below
---
```

Do NOT delete old raw entries — keep for audit trail.

---

## Phase 1 Cron

Monday 9AM KST: run `/instagram batch` automatically.

```
# cron entry (KST = UTC+9)
0 0 * * 1   /instagram batch   # Monday 09:00 KST = Monday 00:00 UTC
```

Other automation (daily posting to Instagram, Friday performance logging) = Phase 2.

---

## Error Handling

| Error | Action |
|-------|--------|
| `CONTENTDRIPS_API_KEY` not set | Stop, ask Gen |
| API returns error | Log error, show to Gen, suggest retry |
| Job timeout (>60s) | Set imageStatus: "failed", write JSON to draft/ anyway, mark with ⚠️ in review |
| Template not found | List available templates, ask Gen to pick |
| Blog slug not found | Search `content/blog/` for close matches, suggest |
| draft/ folder missing | Create it: `mkdir -p content/instagram/draft/` |
| Image download partial | Set imageStatus: "failed", list which slides succeeded |

---

## Image Backend — Swap Protocol

Backend is configured in `memory/instagram-style-guide.md`:

```
backend: contentdrips   ← current
backend: html-png       ← future (Playwright + HTML templates)
```

Steps 1-8 (content + legal) and caption/hashtag generation are identical regardless of backend. Only Step 9 (image generation) changes per backend. When swapping backends, only Step 9 needs updating.
