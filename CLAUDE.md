# LocalNomad Website

## Branding
- **"LocalNomad"** — Always one word. Never "Local Nomad" or "Local Nomad Club"
- Plural: "LocalNomads". Domain: `localnomad.club`
- Brand Color: Deep Teal Navy `#1B4965`
- Full specs: `docs/human/브랜드-가이드.md`

## General Rules
- **No execution without confirmation** — Before making any changes, analyze the problem and present a **numbered plan with reasoning** for each step. Wait for explicit user approval before executing. If uncertain about a root cause, say so — don't guess.
- **Option selection requires explicit choice** — When presenting multiple options (A/B/C), wait for the user to explicitly state their choice. Do not interpret single letters like 'c' as confirmation.

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

## Code Editing Rules
- **Read before Edit** — Always `Read` a file before attempting to `Edit` it. Never edit a file based on assumptions about its contents.

## Git & Commits
- **Scope commits to current session** — Only commit changes from the current session. Do not bundle unrelated leftover changes.
- Always run lefthook/pre-commit checks unless user explicitly says to skip.

## Git Commit in Sandbox
Claude Code sandbox blocks nested process spawning (depth 3+), which prevents lefthook pre-commit hooks from executing. When committing files that match hook globs (`.mdx`, `.ts`, `.json`):
1. Run the validation script manually first (e.g., `bash scripts/validate-blog-links.sh {files}`)
2. Confirm PASS
3. Commit with `LEFTHOOK=0 git commit -m "..."`
Never skip validation — only skip the hook runner.

## Bulk Edit Verification Protocol
After every agent-based bulk edit (≥3 files modified), run these checks before reporting success:
1. `git diff --stat` — confirm expected files appear in diff
2. `grep` for OLD value — must return 0 matches
3. `grep` for NEW value — must return expected match count
4. For JSON files: `python3 -c "import json; json.load(open('file'))"` per file — parse check
5. For array fields: spot-check array length matches expected count

If any check fails, the edit did NOT succeed. Do not report success without passing all checks.

## Tech Stack
- This project uses **Next.js 16 with Turbopack**. Do not install packages or use features incompatible with Turbopack (e.g., `@next/bundle-analyzer`). Always verify Turbopack compatibility before suggesting tooling.
- Use **absolute imports** (not relative). Run `npm run build` to verify changes compile after significant edits.

## Debugging & Performance
- When diagnosing performance issues (Lighthouse, LCP, FCP), propose only **evidence-based fixes**. Do not speculate on multiple fixes without data. Use critic-agent pattern to validate hypotheses before implementing.
- Use a **systematic elimination approach**: identify one bottleneck from the report → fix → re-measure → repeat. Never propose multiple speculative fixes simultaneously.

## SEO & Social Sharing
- When fixing OG image issues, check: 1) file size limits per platform (WhatsApp: 300KB, Telegram: varies), 2) redirect chains that strip meta tags, 3) X-Frame-Options/CSP headers. Test with actual platform previews.

## MCP Tool Restrictions
- **Firecrawl** (`firecrawl_search`, `firecrawl_scrape`): Only use when running `fact-checker` skill or `/blog` pipeline. Do not use for general browsing or ad-hoc web searches.

## Gen's Working Style (project-specific)
- Use 📘 footnotes for technical concepts
- ASCII diagrams over paragraphs
- AI de-detection as standard in all content
- Cron schedules in KST. All memory/notes in English
