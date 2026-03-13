---
name: seo-engine
description: SEO strategy and optimization engine for LocalNomad blog — keyword research, on-page optimization, headline formulas, CTA placement.
---

# SEO Engine

## Priority (Conflict Resolution R7)

```
Voice > SEO when they conflict.
Hard rules (headline, meta desc, slug) are non-negotiable.
Soft rules (first 100w, subheading) apply only when natural.
Stuffing ban: same keyword < 3 times.
```

## Keyword Strategy

### Research Phase (STAGE 2)
1. Identify **1 primary keyword** and **2-3 secondary keywords** per post
2. Classify each keyword:
   - **Search volume estimate**: high / medium / low
   - **Keyword difficulty**: easy / moderate / hard
   - **Intent**: informational / navigational / commercial / transactional
3. Find **long-tail variations** and **question-based keywords** (People Also Ask)
4. Match against CLAUDE.md Internal Link Map for internal linking opportunities
5. Identify **featured snippet opportunities** (definition, list, table)
6. Propose **URL slug** (short, descriptive, includes primary keyword)

### Keyword Placement Rules

**Hard rules** (non-negotiable):

| Location | Rule |
|----------|------|
| Headline (H1) | Primary keyword MUST appear. ≤70 chars. |
| Meta description | Primary keyword. ≤160 chars. Compel the click. |
| URL slug | Primary keyword. Short, hyphenated. |

**Soft rules** (include if natural, flag if absent):

| Location | Rule |
|----------|------|
| First 100 words | Primary keyword if it fits naturally. Do NOT distort sentence structure to insert it. |
| ≥1 Subheading (H2) | Secondary keyword if natural. Not forced. |
| Body + other subheadings | Secondary keywords, naturally placed. |

### Keyword Limits
- **Stuffing ban**: Same exact keyword phrase must NOT appear 3+ times total
- If keyword placement feels forced → skip the placement, preserve voice. Quality gate will flag as warning, not fail.

## On-Page SEO Checklist

Read `references/seo-checklist.md` for the full 13-item audit checklist.

Summary:
1. Title tag: ≤70 chars, primary keyword
2. Meta description: ≤160 chars, primary keyword, compelling
3. URL slug: short, primary keyword
4. H1: one per page, matches title tag
5. H2/H3: descriptive, secondary keywords where natural
6. Image alt text: descriptive, keyword where relevant
7. Internal links: ≥3 to related LocalNomad pages
8. External links: ≥1 to authoritative source
9. First 100 words: primary keyword present
10. Featured snippet structure where opportunity exists
11. Structured data compatibility (Article schema)
12. Link validation: all links return 200 OK
13. Content depth: comprehensive topic coverage

## Content-SEO Integration

- Answer related questions (People Also Ask → FAQ section)
- Structure for featured snippets:
  - **Definition paragraphs**: OK always
  - **Numbered lists**: OK (within R3 list rules: mini-essay style, not one-liner bullets)
  - **Tables**: OK for factual data comparisons (visa requirements, country conditions, cost/duration). NOT for opinions/analysis unless SEO snippet opportunity exists
- Update and refresh high-performing content regularly (12-month+ flag in STAGE 1)

## Headline Generation

Read `references/headline-formulas.md` for the 7 formula templates with LibaD adaptations.

Rules:
- Generate **2-3 headline options** per post
- ≥1 must be **SEO-optimized** (keyword + clear structure)
- ≥1 must be **LibaD-flavored** (personal, 1st person, non-corporate)
- 1 should be **hybrid** (keyword present + LibaD tone)
- ALL must: contain primary keyword + ≤70 characters

## CTA Strategy

Read `references/cta-playbook.md` for placement rules and tone guidelines.

Summary:
- **1 primary CTA** at end of post (community tone, not salesy)
- **1-2 inline CTAs** in body (contextual links, natural wording)
- Placement: after establishing value, never in first paragraph
- Adopt: "specific about what happens next", "reduce risk"
- Reject: "create urgency", corporate action verbs

