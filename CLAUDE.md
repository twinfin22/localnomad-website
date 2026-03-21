# LocalNomad Website

## Branding
- **"LocalNomad"** — Always one word. Never "Local Nomad" or "Local Nomad Club"
- Plural: "LocalNomads". Domain: `localnomad.club`
- Brand Color: Deep Teal Navy `#1B4965`
- Full specs: `docs/human/브랜드-가이드.md`

## Critical Rules
1. **Never modify `components/ui/`** — shadcn/ui managed
2. **`"use client"` only when needed** — hooks/browser APIs/interactivity
3. **i18n SoT: `i18n/Visa i18n Glossary.txt`** — All visa/immigration term translations in `messages/*.json` must match this glossary. When adding or updating translations, check the glossary first. New terms go in the glossary before going into code.
4. **No premature action on pending options** — After presenting A/B/C options, NEVER execute any option in the same turn. A confirmation question + tool call in one message = not asking. Wait for the user's explicit selection before acting. This applies especially to Approve-tier actions (data changes, published content edits).

## Visa Data Integrity Rules
1. **Primary Source Gate** — No visa JSON may be published without at least ONE verified government source (gov website, official PDF, law database). If gov sources are blocked/unavailable, the visa JSON MUST have `"draft": true` and be excluded from production rendering. Training-data-only research is never sufficient for publication.
2. **No Circular Validation** — The fact-check agent MUST use a different evidence source than the research agent. If both rely on training data only, output must be flagged as "double-unverified" and blocked from production.
3. **Reference Table First** — Before creating any visa JSON with sub-categories (e.g., F-5, F-2, E-7), first build a COMPLETE numbered reference list from an official source. Store in `data/visas/[country]/reference/`. Even if we only cover a subset, the full list prevents number-shuffling errors.
4. **Firecrawl Budget Priority** — Visa data creation/fact-check = HIGH priority for Firecrawl credits. If credits are exhausted, STOP and wait rather than proceeding with training-data-only research.
5. **Human Review for New Visas** — New visa JSONs (not updates to existing) require human review before deployment. Reviewer must verify sub-category numbers against official source.

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
