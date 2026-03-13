---
name: blog
description: LocalNomad blog content pipeline — 5 stages from research to publish with 2 checkpoints. Produces SEO-optimized, anti-AI-verified, legally compliant blog posts in LibaD voice.
---

# /blog [topic?]

## Batch Rewrite Mode

When rewriting multiple posts (user specifies >1 post):
1. Group posts into batches of 3-5 by category/country
2. Run subagents in parallel per batch
3. Present CP1 per batch, wait for approval
4. After CP1 approval, write drafts in parallel
5. Present CP2 per batch, wait for approval
6. Cover images: present 3 candidates per post, full batch at once
7. Download all selected images after full batch approval
8. Track selected Unsplash photo IDs to prevent duplicates across batches

---

## Before You Start

Skills are loaded at the stage where they're needed:
- STAGE 2: `skills/seo-engine/SKILL.md`
- STAGE 3: `skills/blog-voice/SKILL.md` + `skills/blog-voice/references/voice-examples.md`
- STAGE 4: `skills/quality-gate/SKILL.md`, `skills/fact-checker/SKILL_fact-checker.md`, `skills/legal-bright-lines/SKILL.md`, `skills/cover-image/SKILL.md`

## Priority Order (Conflict Resolution R7)

```
Voice > SEO when they conflict.
SEO hard rules (headline, meta desc, slug) are non-negotiable.
SEO soft rules (first 100w, subheading) apply only when natural.
```

## Article Structure (R1)

```
TL;DR (1-2 sentences, primary keyword if natural)
  → Body Sections (3-5 H2, 200-300w each)
  → Actionable Steps (guides/tips only)
  → FAQ (2-3, People Also Ask based — SEO snippet opportunity)
  → Closing (75-100w, personal reflection)
  → CTA (1 primary, community tone)
```

Hook (personal anecdote, surprising stat, etc.) is **optional** — use only when the topic naturally lends itself to one. Do not force a hook.

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

## STAGE 2: Keyword Strategy & Outline

Use `skills/seo-engine/SKILL.md`.

### Keyword Research
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

### Headlines
Generate **3 headline options** (see `seo-engine/references/headline-formulas.md`):
- Option A: SEO-optimized (keyword prominent, clear structure)
- Option B: LibaD-flavored (personal, 1st person)
- Option C: Hybrid (keyword + LibaD tone)
- ALL must: contain primary keyword + ≤70 characters

### Section Outline
Build the full outline following R1 structure:

```
BODY:
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
Word count targets: see quality-gate Layer 5.
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
1. **Headline** — 3 options → Gen picks one (or requests revision)
2. **Outline** — section structure + word count estimate (flag series split if applicable)
3. **Unsplash keywords** — 2-3 broad combos for cover image search later

**STOP and wait for Gen's response before proceeding.**

---

## STAGE 3: Write Full Draft

Follow `blog-voice/SKILL.md` for voice, readability, and structure.
Follow `seo-engine/SKILL.md` for keyword placement and CTA rules.

### Blog-Specific Overrides

**TldrBox**: `<TldrBox>` at top of post (before first H2). If optional hook exists, TldrBox comes after it. 2-4 sentences max, plain language summary of the post's key takeaway.

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

If series: each part within category target, mutual internal links between parts.

---

## STAGE 4: Quality Gate + Cover Image (parallel)

After the draft is written, run **quality gate** and **cover image search** in parallel.

### Track A: Quality Gate

Run `quality-gate/SKILL.md`. Execution order:
- **Layers 1-4 in parallel** (fact-check, SEO, anti-AI, legal — they are independent)
- **Layer 5 after** (voice & readability — depends on anti-AI fixes)
- Auto-fix: max 3 attempts per layer, then flag for Gen's manual review at CP2

### Track B: Cover Image Search

Use `skills/cover-image/SKILL.md`.

#### Search Rules
- **Keywords**: broad, 1-2 words max (e.g., "korea campus" not "korean university student studying AI in laboratory"). Avoid overly specific or compound phrases — Unsplash works best with simple terms.
- **Sort**: `order_by=popular` parameter (always)
- **People preferred**: prioritize results with people in the photo — Asian subjects preferred for relevance. Avoid empty landscapes, stock-style flat lays, or abstract graphics.
- Use approved keywords from CHECKPOINT 1 as starting point, but simplify them.

#### Process
1. Search Unsplash with 2-3 broad keyword combos
2. Pull **3 candidates** (free only, landscape, color, people preferred, sorted by popular)
3. For each candidate, present: Unsplash page URL + photographer name + short description of what's in the photo
4. **DO NOT download yet** — present candidates at CHECKPOINT 2 for Gen to pick
5. **NEVER read image files with the Read tool** — download and resize with bash only

---

## ✅ CHECKPOINT 2

Present to Gen (quality gate + cover image results together):
1. **Full draft** (formatted MDX)
2. **Quality Report** (5-layer results)
3. **Cover image 3개 후보** — 각각 Unsplash preview URL + 설명 제시. Gen이 번호로 선택.
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

## STAGE 5: Publish

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
