# localnomad-blog Plugin

Blog content pipeline for LocalNomad — from topic research to publication.

## What It Does

`/blog [topic?]` runs a 7-stage pipeline:

1. **Research** — scans existing content, identifies thin/stale posts, competitor topic scan, funnel gap analysis, suggests 5-8 topic candidates
2. **SEO Strategy** — keyword research (volume/difficulty/intent), long-tail + People Also Ask, featured snippet opportunity identification, URL slug proposal
3. **Brief & Outline** — 3 headline options (SEO + LibaD), hook type, section outline, word count estimation, series split detection, internal link mapping
4. **CHECKPOINT 1** — Gen reviews outline, picks headline, confirms series structure
5. **Write Draft** — full MDX post (category-dependent word count, LibaD voice primary, ESL-friendly readability, SEO hard+soft rules)
6. **Cover Image** — Unsplash search, download, resize to 960x480, alt text with keyword
7. **Quality Gate** — 5-layer validation: fact-check (source tiers + freshness), SEO audit (13-item checklist + link validation + structured data compatibility), anti-AI checklist (banned words/structures scan), legal compliance (country-specific disclaimers), readability + word count
8. **CHECKPOINT 2** — Gen reviews final draft + quality report
9. **Publish** — save to `content/blog/`, suggest next topic based on content gaps

## Priority Order (Conflict Resolution R7)

```
Voice > SEO when they conflict.
SEO hard rules (headline, meta desc, slug) are non-negotiable.
SEO soft rules (first 100w, subheading) apply only when natural.
```

## Skills

| Skill | Purpose |
|-------|---------|
| `blog-voice` | LibaD writing DNA adapted for SEO/readability constraints |
| `seo-engine` | Keyword strategy, on-page optimization, headline/CTA formulas |
| `cover-image` | Unsplash automation — search, download, resize, alt text |
| `quality-gate` | 5-layer validation: facts, SEO, anti-AI, legal, readability |
| `legal-bright-lines` | Korea/Taiwan/Japan compliance rules and disclaimer templates |

## Prerequisites

- `UNSPLASH_ACCESS_KEY` environment variable
- ImageMagick installed (`convert` command)
- Blog directory: `content/blog/[category]/`
- Image directory: `public/images/blog/`

## Content Rules

- Word count: category-dependent (guides 1500-2500, tips 800-1200, etc.). Overflow → series split.
- Banned AI words: zero tolerance (delve, crucial, landscape, etc.)
- Taiwan content requires EN + 繁體中文 disclaimers
- No "you qualify" / "you are eligible" language (legal constraint)

## Replaces

| Old | New |
|-----|-----|
| `weekly-blog-update` scheduled task | `/blog` STAGE 1 |
| `blog-write-and-publish` scheduled task | `/blog` STAGE 2-7 |
