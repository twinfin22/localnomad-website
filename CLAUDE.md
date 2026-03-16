# LocalNomad Website

## Branding
- **"LocalNomad"** — Always one word. Never "Local Nomad" or "Local Nomad Club"
- Plural: "LocalNomads". Domain: `localnomad.club`
- Brand Color: Deep Teal Navy `#1B4965`
- Full specs: `docs/human/브랜드-가이드.md`

## Critical Rules
1. **Never modify `components/ui/`** — shadcn/ui managed
2. **`"use client"` only when needed** — hooks/browser APIs/interactivity

## Blog System
- Posts: `content/blog/[category]/[slug].mdx` (categories: guides, updates, tips, comparisons, news, stories)
- Schema: `lib/blog/schema.ts` (title, description ≤200 chars, category, country, date, tags, draft, coverImage)
- Images: `public/images/blog/[slug].jpg` (960×480)
- Countries: korea, japan, china, taiwan, sea, global
- Workflow: see `blog-write-and-publish` scheduled task

## Internal Link Map
- Visa: `/en/[country]/visa/[type]` — korea(f-1-d, e-7, d-8, f-2, h-1, b-2), japan(digital-nomad-jp, business-manager, engineer-specialist, hsw, ssw1, ssw2, tourist), taiwan(gold-card, dnv, visitor)
- Compare: `/en/[country]/compare`
- Neighborhoods: `/en/neighborhood/[country]`
- Blog: `/en/blog`, `/en/blog/[category]`

## Project Context
- Terms glossary: `memory/glossary.md`
- Session history: `memory/session-notes.md`
- Project context: `memory/context/project.md`

### Session Start Fallback
If SessionStart hook did not inject context, read these at session start:
- `memory/context/project.md`
- `memory/glossary.md`

## MCP Tool Restrictions
- **Firecrawl** (`firecrawl_search`, `firecrawl_scrape`): Only use when running `fact-checker` skill or `/blog` pipeline. Do not use for general browsing or ad-hoc web searches.

## Gen's Working Style (project-specific)
- Use 📘 footnotes for technical concepts
- ASCII diagrams over paragraphs
- AI de-detection as standard in all content
- Cron schedules in KST. All memory/notes in English
