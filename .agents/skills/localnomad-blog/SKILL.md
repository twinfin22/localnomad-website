---
name: localnomad-blog
description: Research, draft, update, review, or prepare LocalNomad blog posts without publishing. Use for LocalNomad blog candidates, MDX posts, source checks, translations, and blog performance follow-up.
---

# LocalNomad blog

Use this repository as the source of truth. Do not publish, push, deploy, contact sources, buy access, or change a public URL unless the user explicitly authorizes it.

Start by identifying the requested mode: candidate research, draft, update, review, translation synchronization, or publication preparation. Inspect `lib/blog/schema.ts`, the matching content files, and `next.config.ts` redirects before deciding a category, tag, filename, or URL.

- Read [workflow.md](references/workflow.md) for the applicable mode and review record.
- Read [writing.md](references/writing.md) when planning or editing article prose.
- Read [sources-and-images.md](references/sources-and-images.md) when making factual claims or proposing a cover image.
- Read [weekly-candidates.md](references/weekly-candidates.md) only for the weekly candidate route.

Keep originals and translations distinct. Preserve original publication dates and URLs during updates; use `updatedAt` for a verified update. For a factual update, maintain a claim/source table and report conflicts outside the requested files instead of mass-editing them.

For each independent draft, use an execution ID, article ID, and final-content SHA-256 in its review record. A review passes only when it names that same execution/article/hash, all required reports exist exactly once, and no report is FAIL. Any material content change after approval invalidates its approval.
