---
name: instagram-repurpose
description: Transform LocalNomad blog posts into Instagram carousel content — slide extraction, caption writing, hashtag strategy, image backend delegation. Reads learned preferences from memory files each run.
---

# Instagram Repurpose — Blog → Carousel

## Before Every Run

**ALWAYS read these memory files first** (skip if missing/empty):

```bash
cat memory/instagram-style-guide.md   # Gen's preferences, backend config, template IDs, anti-patterns
cat memory/instagram-performance.md   # What performs well (save rates, reach patterns)
```

Memory overrides defaults below when they conflict. State which memory rules you applied.

---

## Dedup Check (Run Before Generating)

Before generating any content, scan for existing drafts:

```bash
ls content/instagram/draft/[slug]*
ls content/instagram/approved/[slug]*
ls content/instagram/scheduled/[slug]*
ls content/instagram/posted/[slug]*
```

If found: report "Already exists in [folder]/" and stop. Do not regenerate unless `--force` is passed.

---

## Carousel Type Selection

Choose based on blog category and content structure:

| Type | Use When | Structure |
|------|----------|-----------|
| **A — List** | tips, guides, how-tos | intro → point-per-slide → CTA |
| **B — Compare** | comparisons, country vs country | intro → side-by-side × N → verdict → CTA |
| **C — Narrative** | stories, news, journeys | intro → story beats × N → takeaway → CTA |

Default to Type A when uncertain.

---

## Slide Content Rules

### Extraction Philosophy

Blog posts are 800-2500 words. Instagram carousels are 7-10 slides × 25 words max. This is **compression, not summarization**.

```
Blog                          → Carousel
────────────────────────────────────────────
Extended explanation           → Single punchy line
"There are several factors..." → "3 things to know:"
Nuanced caveat                → Drop it
Footnote/tangent              → Drop it
Data point with context       → Data point only
Personal anecdote             → 1 line max or drop
Step-by-step (5 paragraphs)  → 1 slide per step, verb-first
Context paragraphs            → Drop entirely
```

**Prioritize**: numbers, lists, comparisons, surprising facts.
**Drop**: nuance, caveats, context paragraphs, footnotes, qualifications.

### Paragraph-Aware Chunking

When extracting content from the blog, respect paragraph boundaries:
- Never split a blog paragraph mid-sentence across two slides
- Each slide should map to one complete idea from the source
- If a blog paragraph contains multiple points, split at the point boundary, not mid-sentence
- Think "flashcard, not blog paragraph" — one point per slide with a visual rhythm

### Slide Anatomy

```
heading:     Bold/large text. ≤10 words. One idea.
description: Supporting detail. ≤15 words. Optional.
```

Total: **≤25 words per slide**. If you need more, compress harder.

### Optimal Length

- Educational content (Type A/B): 7-10 content slides + intro + ending = **9-12 total**
- Narrative content (Type C): 5-8 story beats + intro + ending = **7-10 total**
- Schema enforces 6-11 total (intro + content + ending)

### Intro Slide (Hook — Must Stop the Scroll)

The intro slide is the only slide visible before swipe. It must earn the swipe.

| Formula | Example |
|---------|---------|
| Question hook | "Landing in Tokyo for the first time?" |
| Bold claim | "You're doing your Korea arrival wrong." |
| Number hook | "7 things I wish I knew before moving to Taipei" |
| Myth buster | "You DON'T need a visa to work remotely in Japan." |
| Before/After | "What I expected in Seoul vs what actually happened" |
| Stakes | "Skip this step and your visa gets denied" |

**NEVER** use the blog title verbatim. Question and number hooks perform best for save rate.
Before/After works well for stories/comparisons. Stakes hooks drive urgency on guides.

### Content Slide Patterns

**Type A — List (tips, guides):**
```
[2] heading:     "1. Get a SIM card at the airport"
    description: "Pre-order online → pick up at arrival counter"
[3] heading:     "2. Grab an IC card"
    description: "Suica or Pasmo. Any station kiosk. ¥500 deposit."
```

**Type B — Compare:**
```
[2] heading:     "Seoul 🇰🇷 vs Tokyo 🇯🇵"
    description: "Rent: $500-800 vs $700-1200/mo"
[3] heading:     "Food costs"
    description: "$8-12/meal vs $6-10/meal"
```

Note: Contentdrips handles side-by-side layout via template. Slide text is for one side — template does the visual split.

**Type C — Narrative:**
```
[2] heading:     "Step 1: Open WeChat"
    description: "You can't survive China without it."
[3] heading:     "Step 2: Link your bank"
    description: "International cards work — sometimes."
```

### Ending Slide (CTA — Drives Saves)

The ending slide is the primary save driver. Make it feel worth saving.

Default (override with memory preference):
```
heading:     "Save this for your trip ✈️"
description: "Follow @localnomad.club for more"
```

Alternatives (use based on content type):
```
"Found this useful? Share with a friend."
"Bookmark this → you'll need it later."
"Which tip surprised you? Comment below 👇"
```

---

## Caption Writing

### Voice: Instagram ≠ Blog

Blog uses LibaD voice (personal stories, footnotes, extended metaphors, intellectual texture). Instagram voice is **stripped-down LibaD**:

```
Blog Voice                    → Instagram Voice
────────────────────────────────────────────────
Parenthetical asides          → Cut
Footnotes as side quests      → Cut
Extended metaphors            → 1 line metaphor max
Self-deprecating humor        → Keep (shorter)
Korean/Japanese sprinkles     → Keep (with translation)
Earnest idealism              → Keep
Data as single punch          → Keep
Numbered sections/essays      → Cut — no room
```

### Caption Structure

```
[Hook — 1 line, ≤15 words. Question or bold statement. NOT the intro slide hook.]

[Body — 2-3 short paragraphs. 150 words MAX excluding hashtags.]
[Expand the carousel's #1 takeaway — context the slides can't hold.]
[Use "you" directly. Short sentences. One idea per sentence.]

[CTA — 1 line. Save/share/comment prompt. Specific, not generic.]

#hashtags on final line (25-30 tags)
```

Caption total (including hashtags): max 2,200 chars (Instagram limit).

### Caption Anti-Patterns (NEVER)

- Don't rewrite the entire blog as a caption
- Don't start with "In this post, I'll share..."
- Don't use "delve", "navigate", "landscape", "comprehensive"
- Don't use more than 2 emoji in caption body (hashtags excluded)
- Don't write more than 150 words in body (excluding hashtags)
- Don't end with generic "Link in bio" unless there's a specific, relevant link
- Don't repeat slide content verbatim — caption complements, doesn't duplicate

---

## Hashtag Strategy

### Structure (25-30 total)

```
Tier 1 — Mega (500K+ posts, 5 tags):
  #digitalnomad #remotework #expat #travelasia #workabroad

Tier 2 — Mid (50K-500K, 10 tags):
  Country-specific. Examples:
  korea:  #seoullife #koreaexpat #livinginkorea #seoultravel #koreaguide
          #digitalnomadinkorea #remoteworkkorea #korealife #expatkorea #seoulnomad
  japan:  #tokyolife #japanexpat #livinginjapan #tokyotravel #japanguide
          #digitalnomadjapan #remoteworkjapan #japanlife #expatjapan #tokyonomad
  taiwan: #taiwanlife #taipeiexpat #livingintaiwan #taiwantravel #taipeiguide
          #digitalnomadindia #remoteworktaiwan #taiwanlife #expattaiwan #taipeinomad

Tier 3 — Niche (5K-50K, 10 tags):
  Topic-specific. Examples:
  visa:   #digitalnomadvisa #remoteworkasia #nomadguide #expatvisa
  work:   #workinkorea #workinjapan #workinasia #remotejobs
  life:   #nomadlife #slowtravel #longstay #expatlife

Tier 4 — Branded (3-5 tags):
  #localnomad #localnomadclub #localnomad[country]
```

### Hashtag Rules

- Rotate Tier 2-3 tags between posts to avoid shadowban patterns
- If memory/instagram-performance.md shows specific hashtags correlating with reach → prioritize those
- Drop any hashtag with <1K posts (too niche, no discovery value)
- Mix tiers in every post — never all mega tags, never all niche tags

---

## Mini Quality Gate (Phase 2 Auto-Approve)

When auto-approve is enabled (Phase 2), run these checks before moving draft → approved:

### Scroller Pass (3-second test)
- Read intro slide heading in isolation — does it make you want to swipe?
- If heading is >10 words, generic, or uses blog title verbatim → FAIL
- Criteria: specific, punchy, creates curiosity gap or urgency

### Anti-AI Pass
- Scan all slide headings + caption for banned words (delve, navigate, landscape, comprehensive, crucial, robust, etc.)
- Check caption doesn't start with "In this post..." or "Let me share..."
- Any match → FAIL

### Legal Pass
- If country = taiwan: ending slide must have dual-language disclaimer
- If tags include tax-related terms: micro-disclaimer slide must exist
- Missing disclaimer → FAIL

**PASS all 3** → auto-move to `approved/`. **Any FAIL** → stays in `draft/`, Gen notified with reason.

---

## Legal Compliance

Inherit from `skills/legal-bright-lines/SKILL_legal-bright-lines.md`. These rules are **NON-NEGOTIABLE** and override any memory preferences.

- **Taiwan content**: Ending slide OR dedicated slide with "Not legal advice. 非法律建議。"
- **Tax mentions**: Micro-disclaimer slide before CTA: "Consult a licensed tax professional."
- **Visa eligibility**: NEVER say "you qualify" or "you're eligible" — use "you may be able to" or "check if you meet the requirements"
- **Korea 행정사법**: No processing/filing language
- **Never**: Guarantee outcomes, promise processing times, use "we recommend"

Set `legalFlags` array in output JSON with all applicable flags (e.g., `["taiwan-dual-language"]`).

---

## Posting Time Defaults

```
Country    → Best Window            → Best Days
────────────────────────────────────────────────
korea      → 7-9 PM KST            → Tue, Thu
japan      → 7-9 PM JST            → Tue, Thu
taiwan     → 7-9 PM CST (UTC+8)    → Tue, Thu
china      → 7-9 PM CST (UTC+8)    → Tue, Thu
sea        → 7-9 PM SGT            → Tue, Thu
global     → 9 AM EST / 6 PM KST   → Wed
```

Override with memory/instagram-performance.md if data shows different patterns.
Output `suggestedPostTime` as ISO 8601 timestamp in KST.

---

## Image Generation

Read `backend` from memory/instagram-style-guide.md. Delegate all image generation to `adapters.md`.

- Read `template_ids` from style-guide for the selected carousel type (type_a / type_b / type_c)
- Set `images.imageStatus` in output JSON:
  - `"complete"` — all PNGs downloaded to `public/images/instagram/[slug]/`
  - `"pending"` — generation in progress
  - `"failed"` — API error; draft still created with text content intact

If `auto_generate_on_publish: false` (default), skip image generation and set `imageStatus: "pending"`.

---

## Output

Write JSON file to `content/instagram/draft/[slug].json` conforming to `contracts/instagram-output.schema.json`.

```
content/instagram/
  draft/        ← generated here
  approved/     ← Gen moves here after review
  scheduled/    ← scheduler picks up from here
  posted/       ← archived after posting
```

Announce: "Draft written to content/instagram/draft/[slug].json"
