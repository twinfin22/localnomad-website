---
name: instagram-repurpose
description: Transform LocalNomad blog posts into Instagram carousel content — slide extraction, caption writing, hashtag strategy, image backend delegation. Reads learned preferences from memory files each run.
---

# Instagram Repurpose — Blog → Carousel

## Before Every Run

**ALWAYS read these memory files first** (skip if missing/empty):

```bash
cat memory/skills/instagram/style-guide.md   # Gen's preferences, archetypes, visuals, template IDs, anti-patterns
cat memory/skills/instagram/performance.md   # What performs well (save rates, reach patterns)
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

## Carousel Archetype Selection

Choose based on blog category, content structure, and style-guide mapping:

| Archetype | Use When | Structure | Slides |
|-----------|----------|-----------|--------|
| **CHECKLIST** | tips, guides, how-tos, checklists | hook → numbered list 1/slide → CTA | 8-10 |
| **MYTH_BUSTER** | misconceptions, myth correction, news | hook → ❌ Myth / ✅ Fact pairs × 3-5 → CTA | 7-10 |
| **VS_COMPARE** | comparisons, country vs country, data | hook → split-screen compare × 4-5 → verdict → CTA | 7-9 |
| **PHOTO_STORY** | neighborhoods, city vibes, stories | photo hook → place photos + text overlay → CTA | 5-8 |
| **QUIZ** | visa fit, city match, interactive | question hook → choices → swipe reveal → CTA | 5-7 |

Default mapping (override with style-guide preferences):
```
tips, guides      → CHECKLIST (alt: MYTH_BUSTER)
comparisons       → VS_COMPARE (alt: QUIZ)
news, updates     → MYTH_BUSTER (alt: CHECKLIST)
stories           → PHOTO_STORY
neighborhood      → PHOTO_STORY (alt: VS_COMPARE)
```

Default to CHECKLIST when uncertain.

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

- CHECKLIST / MYTH_BUSTER / VS_COMPARE: 7-10 content slides + intro + ending = **9-12 total**
- PHOTO_STORY / QUIZ: 5-7 content slides + intro + ending = **7-9 total**
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

**CHECKLIST:**
```
[2] heading:     "1. Get a SIM card at the airport"
    description: "Pre-order online → pick up at arrival counter"
[3] heading:     "2. Grab an IC card"
    description: "Suica or Pasmo. Any station kiosk. ¥500 deposit."
```

**MYTH_BUSTER:**
```
[2] heading:     "❌ You need cash everywhere"
    description: "MYTH"
[3] heading:     "✅ Cards work at most places"
    description: "Small shops are the exception. WOWPASS covers the rest."
```

**VS_COMPARE:**
```
[2] heading:     "Seoul 🇰🇷 vs Tokyo 🇯🇵"
    description: "Rent: $500-800 vs $700-1200/mo"
[3] heading:     "Food costs"
    description: "$8-12/meal vs $6-10/meal"
```

**PHOTO_STORY:**
```
[2] heading:     "Hongdae — the creative heart"
    description: "Street art, indie cafes, live music every night"
[3] heading:     "Yeonnam-dong — the quiet side"
    description: "10 min walk from Hongdae, half the noise"
```

**QUIZ:**
```
[2] heading:     "You want to freelance remotely..."
    description: "A) Korea  B) Japan  C) Taiwan"
[3] heading:     "Answer: C — Taiwan"
    description: "Gold Card: no employer needed, 3-year stay"
```
Note: QUIZ must NEVER say "you qualify" — use "you may be able to" (행정사법).

### Ending Slide (CTA — Drives Saves)

The ending slide is the primary save driver. Make it feel worth saving.

Default (override with memory preference):
```
heading:     "Enjoy your trip ✈️"
description: "Follow @localnomad.club for more"
```

**Double CTA strategy** (from style-guide):
- Soft CTA mid-carousel (slide 3-4): sets value frame early
- Hard CTA final slide: explicit save/share prompt

Per-archetype CTA examples:
```
CHECKLIST:    "Save this checklist" + "Send to someone planning their trip"
MYTH_BUSTER:  "Which myth surprised you? Comment below"
VS_COMPARE:   "Tag someone deciding between these two"
PHOTO_STORY:  "Save this for your trip"
QUIZ:         "What did you get? Drop your answer below"
```

**NEVER** use "Save this for your trip" as CTA (style-guide anti-pattern).

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

#hashtags on final line (3-5 tags)
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

### 2026 Best Practice: 3-5 hashtags per post

Instagram now treats 20-30 hashtags as a spam signal. Use **3-5 in the caption**.
Keyword-rich captions generate ~30% more reach than hashtag-heavy posts.

### Formula (pick 1 from each row, 5 total)

```
Slot           Purpose       Pool
─────────────────────────────────────────────────────────────
1 high-volume  reach         #digitalnomad | #remotework
2 mid-tier     discovery     #digitalnomadsasia | #digitalnomadlife | #nomadlife
3 country      targeting     see Default Sets below
4 niche        topic match   #digitalnomadvisa | #coworking | #slowtravel | #expatlife
5 brand        owned         #localnomad | #softlandinasia
```

### Default Sets (copy-paste ready)

```
Korea visa:      #digitalnomadkorea #workcation #digitalnomadvisa #remoteworkasia #localnomad
Korea lifestyle: #digitalnomadkorea #seoullife #nomadlife #remotework #localnomad
Japan visa:      #digitalnomadjapan #workfromasia #digitalnomadvisa #remotework #localnomad
Japan lifestyle: #digitalnomadjapan #tokyolife #nomadlife #remotework #localnomad
Taiwan Gold Card:#taiwangoldcard #digitalnomadtaiwan #locationindependent #remotework #localnomad
Taiwan general:  #digitalnomadtaiwan #taipeilife #nomadlife #remotework #localnomad
Asia comparison: #digitalnomadsasia #remoteworkasia #digitalnomadlife #workfromanywhere #localnomad
SEA general:     #digitalnomadthailand #remotework #nomadlife #workfromasia #localnomad
```

### Hashtag Rules

- Max 5 per post. Reels: 2-3 max
- Place in caption (not first comment) for search indexing
- Rotate mid-tier/niche tags between posts to avoid shadowban patterns
- Never use: #travel (700M+), #backpacking (wrong audience), #follow/#like4like (spam risk)
- If memory/instagram-performance.md shows specific hashtags correlating with reach → prioritize those

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

Read `backend` from memory/skills/instagram/style-guide.md. Delegate all image generation to `adapters.md`.

- Read `template_ids` from style-guide for the selected archetype (checklist / myth_buster / vs_compare / photo_story / quiz)
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
