---
name: blog
description: LocalNomad blog content pipeline — 7 stages from research to publish with 2 checkpoints. Produces SEO-optimized, anti-AI-verified, legally compliant blog posts in LibaD voice.
---

# /blog [topic?]

## Before You Start

Read these skill files in order:
1. `skills/seo-engine/SKILL.md`
2. `skills/blog-voice/SKILL.md` + `skills/blog-voice/references/voice-examples.md`
3. `skills/quality-gate/SKILL.md`
4. `skills/legal-bright-lines/SKILL.md`
5. `skills/cover-image/SKILL.md`

## Priority Order (Conflict Resolution R7)

```
Voice > SEO when they conflict.
SEO hard rules (headline, meta desc, slug) are non-negotiable.
SEO soft rules (first 100w, subheading) apply only when natural.
```

## Article Structure (R1)

```
Hook (personal anecdote default)
  → TL;DR (1-2 sentences, primary keyword if natural)
  → Body Sections (3-5 H2, 200-300w each)
  → Actionable Steps (guides/tips only)
  → FAQ (2-3, People Also Ask based — SEO snippet opportunity)
  → Closing (75-100w, personal reflection)
  → CTA (1 primary, community tone)
```

Word count targets vary by category — see quality-gate Layer 5.

---

## STAGE 1: Research & Topic Selection

**If topic is provided**: Skip to STAGE 2.

**If no topic**:
1. Scan `content/blog/` directory:
   - List all existing posts with dates
   - Flag posts older than 12 months (refresh candidates)
   - Identify thin content (< 800 words or low depth)
   - Map topic clusters: which pillar pages exist, which supporting posts are missing
   - Check funnel gaps: awareness / consideration / decision stage coverage
2. Run competitor topic scan (web search for top-ranking content in our niche)
3. Present **5-8 topic candidates** mixing:
   - New topics (filling gaps)
   - Refresh opportunities (outdated posts)
   - Label each: [NEW] or [REFRESH], estimated category, target country
4. Ask Gen to select a topic
5. Collect inputs:
   - Target audience (if not obvious)
   - Key messages (2-4 points to cover)
   - Any specific angle or constraint

---

## STAGE 2: Keyword & SEO Strategy

Use `skills/seo-engine/SKILL.md`.

1. Research and propose:
   - **Primary keyword** (1) — the main search term to rank for
   - **Secondary keywords** (2-3) — supporting terms
2. For each keyword, estimate:
   - Search volume: high / medium / low
   - Difficulty: easy / moderate / hard
   - Intent: informational / navigational / commercial / transactional
3. Find long-tail and question-based variations (People Also Ask)
4. Match against CLAUDE.md **Internal Link Map** — identify ≥3 internal link targets
5. Identify **featured snippet opportunities** (what format would win: definition, list, table?)
6. Propose **URL slug** (short, includes primary keyword, hyphenated)

Output: keyword strategy brief.

---

## STAGE 3: Brief & Outline

### Headlines
Generate **3 headline options** (see `seo-engine/references/headline-formulas.md`):
- Option A: SEO-optimized (keyword prominent, clear structure)
- Option B: LibaD-flavored (personal, 1st person)
- Option C: Hybrid (keyword + LibaD tone)
- ALL must: contain primary keyword + ≤70 characters

### Hook
Select hook type from 6 formulas (default: **Story opening** for LibaD voice):
1. Surprising statistic
2. Contrarian statement
3. Question
4. Scenario
5. Bold claim
6. Story opening ← default

### Section Outline
Build the full outline following R1 structure:

```
BODY:
  Hook: [type] — [1-sentence description]
  TL;DR: [1-2 sentences with primary keyword]

  H2: [Section 1 title]
    - Key point + data/example
    - Snippet structure? (definition/list/table)
    - Internal link target?

  H2: [Section 2 title]
    ...

  H2: [Section 3-5 titles]
    ...

  Closing: [personal reflection angle]
  CTA: [primary CTA description]

OUTSIDE BODY:
  Actionable Steps: [include? Y/N — only for guides/tips]
  FAQ: [2-3 questions from People Also Ask — nice-to-have]
```

For each section: subheading, core point, ≥1 data/example, snippet opportunity, internal link.

### Word Count Estimation
Estimate total word count based on outline and category target:

| Category | Target Range |
|----------|-------------|
| guides | 1500-2500w |
| comparisons | 1200-1800w |
| tips | 800-1200w |
| stories | 1000-1500w |
| news/updates | 600-1000w |

- If estimate exceeds category max by >50%: propose **series split**
- Series split: design full outline, each part within category target, this `/blog` = Part 1 only

### Additional Planning
- CTA plan: 1 primary (end) + 1-2 inline (body)
- Internal links: ≥3 assigned to specific sections
- External links: ≥1 identified
- Legal flags: any country-specific compliance needed?
- Unsplash search keywords: 2-3 **broad** keyword combos (1-2 words each, not long phrases). Prefer keywords that return photos with people.

---

## ✅ CHECKPOINT 1

Present to Gen:
1. **3 headline options** → Gen picks one (or requests revision)
2. **Hook type + opening 2-3 sentences draft** → Gen reviews tone and approach (is it too aggressive? too generic? does it match the target reader?)
3. **Series split** → if applicable, confirm structure
4. **Section outline** → review and adjust
5. **Any external comparisons** → if the post references other programs/visas/products, list them with sources so Gen can verify before writing
6. **Unsplash keywords** → approve or modify

**STOP and wait for Gen's response before proceeding.**

---

## STAGE 4: Write Full Draft

### Writing Approach

**SEO keyword placement:**
- Hard rules (must): headline, meta description, slug
- Soft rules (if natural): first 100 words, ≥1 H2 subheading
- Stuffing ban: same keyword < 3 times
- If placement feels forced → skip it, preserve voice

**ESL-friendly readability (R2):**
- Short sentences (one idea each)
- Vocabulary can be high, but jargon gets parenthetical explanation on first use
- Short paragraphs (2-4 sentences, max 5)
- H2 subheading every 200-300 words
- Abstract concepts → metaphor/analogy
- Extended tangents → footnotes (LibaD side quest pattern)
- Intellectual references (Gramsci, etymology, etc.) stay in body with inline context

**LibaD Voice (primary creative driver):**
- Sentence rhythm: short-long alternation, fragment-as-paragraph
- Humor: self-deprecation, deadpan observations, (X)/(O) format
- Metaphor: sensory-first, extended metaphors, physical world imagery
- Footnotes: tangential deep-dives
- Emotional register: earnest idealism + pragmatic skepticism
- Personal → systemic pivot

### TL;DR Box
Every post must have a `<TldrBox>` immediately after the hook (before the first H2). 2-4 sentences max, plain language summary of the post's key takeaway. Use the `TldrBox` MDX component (brand teal background, white text).

### Writing Rules
- Short paragraphs (2-4 sentences)
- ≥1 data point, example, or quote per section
- Active voice, fragments OK
- Front-load key information in each section
- Every section answers "so what?" from reader's perspective
- Lead with benefits, not features

### List Rules (R3)
- Numbered sections as mini-essays: OK
- Bullet lists: only for comparisons, checklists, requirements
- Each bullet: ≥1-2 sentences
- NEVER: full-post listicle structure, one-liner bullet lists

### Table Rules (R4)
- Factual data comparisons (visa requirements, costs, timelines): OK
- Opinion/analysis tables: avoid unless clearly beneficial
- Voice > SEO: tables should not break LibaD tone

### CTA Insertion (R8)
- 1 primary CTA after Closing (community tone)
- 1-2 inline CTAs in body (contextual links, natural wording)
- Never in first paragraph

### Frontmatter (MDX)
```yaml
---
title: "[selected headline]"
description: "[≤200 chars, SERP-optimized ≤160, primary keyword included]"
category: "[guides|updates|tips|comparisons|news|stories]"
country: "[korea|japan|china|taiwan|sea|global]"
date: "[YYYY-MM-DD]"
author: "LocalNomad Team"
tags: ["tag1", "tag2", "tag3"]
featured: false
draft: true
coverImage: "/images/blog/[slug].jpg"
readingTime: [estimated minutes]
---
```

### Image Alt Text
For any images referenced in the post, include descriptive alt text with primary keyword where natural.

### Word Count Target
Category-dependent — see quality-gate Layer 5 for ranges.
If series: each part within category target, mutual internal links between parts.

---

## STAGE 5: Cover Image Search

Use `skills/cover-image/SKILL.md`.

### Search Rules
- **Keywords**: broad, 1-2 words max (e.g., "korea campus" not "korean university student studying AI in laboratory"). Avoid overly specific or compound phrases — Unsplash works best with simple terms.
- **Sort**: `order_by=popular` parameter (always)
- **People preferred**: prioritize results with people in the photo — Asian subjects preferred for relevance. Avoid empty landscapes, stock-style flat lays, or abstract graphics.
- Use approved keywords from CHECKPOINT 1 as starting point, but simplify them.

### Process
1. Search Unsplash with 2-3 broad keyword combos
2. Pull **5 candidates** (landscape orientation, people preferred, sorted by popular)
3. For each candidate, present: Unsplash page URL + photographer name + short description of what's in the photo
4. **DO NOT download yet** — present candidates at CHECKPOINT 2 for Gen to pick
5. **NEVER read image files with the Read tool** — download and resize with bash only

---

## STAGE 6: Quality Gate

Use `skills/quality-gate/SKILL.md`. Run all 5 layers:

### Layer 1: Fact-Check
- Verify all factual claims against source tiers
- Visa requirements → Tier 1 source required
- Statistics → source attribution required
- Freshness check: visa info ≤6 months

### Layer 2: SEO Audit
- Run 13-item on-page SEO checklist
- Verify all mandatory keyword placements
- Validate all links (internal + external)

### Layer 3: Anti-AI Checklist
- Scan for banned words → replace ALL instances
- Scan for 13 banned structures → remove/rewrite (includes synonym cycling, em dash overuse, vague attributions, significance inflation, "challenges" template, promotional language, chatbot remnants)
- Run 10 structural checks → all must pass
- Result: PASS (zero issues) or FAIL (auto-fix → re-scan)

### Layer 4: Legal Compliance
- Scan for prohibited phrases
- Check country-specific disclaimer requirements
- Taiwan content: verify EN + 繁中 disclaimers
- Tax content: verify 3-layer disclaimer

### Layer 5: Voice & Readability
- ESL-friendly readability checks (6 items)
- Word count: category-dependent target
- Jargon first-mention explanation
- CTA community tone
- Benefits-first section openings

### Auto-Fix
If any layer FAILs:
1. Identify specific failures
2. Auto-fix each one
3. Re-run the failing layer
4. **Max 3 attempts per layer.** If still failing → flag for Gen's manual review at CHECKPOINT 2

### Quality Report
Generate the full report (see quality-gate SKILL.md for format).

---

## ✅ CHECKPOINT 2

Present to Gen:
1. **Full draft** (formatted MDX)
2. **Quality Report** (5-layer results)
3. **Cover image 5개 후보** — 각각 Unsplash preview URL + 설명 제시. Gen이 번호로 선택.
4. **Taiwan content flag**: if country = taiwan, explicitly note: "⚠️ Taiwan 콘텐츠입니다. EN + 繁中 disclaimer 및 법적 표현을 직접 검토해 주세요."
5. **"최종본입니다. 발행해도 될까요?"**

**STOP and wait for Gen's response.**

Gen이 커버 이미지를 선택하면:
1. Download selected image
2. Resize to **960×480** using ImageMagick
3. Save to `public/images/blog/[slug].jpg`
4. Update frontmatter `coverImage` path
5. Generate alt text (primary keyword + descriptive, ≤125 chars)
6. Add Unsplash credit comment in MDX

If Gen gives other feedback:
- Apply changes
- Re-run affected Quality Gate layers
- Present updated draft

---

## STAGE 7: Publish

After Gen approves:

1. Set `draft: false` in frontmatter
2. Save to `content/blog/[category]/[slug].mdx`
3. If series:
   - Save each completed part
   - Verify mutual internal links between parts
4. Suggest git commit message:
   ```
   blog: add [slug] — [brief description]
   ```
5. Update TASKS.md if applicable
6. Suggest **1-2 "next topic" ideas** based on:
   - Topic cluster gaps identified in STAGE 1
   - Related keywords from STAGE 2
   - Internal linking opportunities

---

## Quick Reference

| Rule | Value |
|------|-------|
| Priority | Voice > SEO when they conflict |
| Word count | Category-dependent (see quality-gate) |
| Headline | Primary keyword + ≤70 chars (hard rule) |
| Meta desc | Primary keyword + ≤160 chars (hard rule) |
| First 100w keyword | Soft rule (if natural) |
| Internal links | ≥3 |
| External links | ≥1 |
| Subheading freq | Every 200-300 words |
| Paragraphs | 2-4 sentences typical |
| Keyword stuffing | Same phrase < 3 times |
| Banned AI words | 0 tolerance |
| Banned structures | 13 patterns (0 tolerance) |
| Structural checks | 10 checks (all must pass) |
| Em dash limit | ≤3 per 500 words |
| Synonym cycling | Max 2 alternatives per entity |
| Cover image | 960×480 JPEG |
