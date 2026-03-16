# Instagram Pipeline — Option C (Hybrid) Implementation Plan

## Decision
Filesystem-based queue with Phase 1 (batch review) → Phase 2 (autopilot) transition.

## Architecture

### Folder-as-State Queue

```
content/instagram/
├── draft/          ← Generator output lands here
│   └── 2026-03-17_korea-digital-nomad-visa.json
├── approved/       ← Gen moved it here after review
│   └── 2026-03-17_korea-digital-nomad-visa.json
├── scheduled/      ← Scheduler assigned a date, moved here
│   └── 2026-03-17_korea-digital-nomad-visa.json
└── posted/         ← Posted, archived
    └── 2026-03-17_korea-digital-nomad-visa.json
```

State transitions = `mv` between folders. No status field in files.

### File Format (each .json)

```json
{
  "sourceBlog": {
    "slug": "korea-digital-nomad-visa-guide",
    "title": "...",
    "category": "guides",
    "country": "korea"
  },
  "carouselType": "A",
  "slides": [
    { "heading": "...", "description": "..." }
  ],
  "caption": "...",
  "hashtags": ["#digitalnomad", ...],
  "legalFlags": ["tax-disclaimer"],
  "images": {
    "backend": "contentdrips",
    "templateId": "...",
    "paths": ["public/images/instagram/[slug]/slide-01.png", ...]
  },
  "imageStatus": "generated",
  "suggestedPostTime": "2026-03-18T19:00:00+09:00"
}
```

Images stored at: `public/images/instagram/[slug]/slide-01.png`

---

## Pipeline Stages

### Stage 1: Generate (Triggers → draft/)

Three triggers, all produce the same output in `draft/`:

**Trigger A — Manual:** `/instagram [slug]`
**Trigger B — Post-publish hook:** `/blog` Stage 5 completion → suggestion prompt (Gen confirms before running)
**Trigger C — Cron scan:** Weekly Monday batch scan for blog posts without IG counterpart

Generator steps:
1. Read blog MDX from `content/blog/[category]/[slug].mdx`
2. Read `memory/instagram-style-guide.md` (apply learned preferences)
3. Check dedup: verify no existing draft/approved/scheduled entry for this slug
4. Extract key points, select carousel type (A/B/C)
5. Generate 7-10 slide text (≤25 words per slide)
6. Generate caption (≤150 words) + hashtags (25-30)
7. Check legal flags (Taiwan dual-lang, tax disclaimer, etc.)
8. Call image backend (Contentdrips) → download PNGs to `public/images/instagram/[slug]/`
9. Write .json to `content/instagram/draft/`

### Stage 2: Review (draft/ → approved/)

**Phase 1 (weeks 1-4): Batch review**
- Weekly session (Monday suggested)
- Present all files in `draft/` as batch preview
- Gen reviews: ✅ approve → `mv` to `approved/` | ✏️ edit → fix in place | ❌ reject → delete
- 15-20 min for 5 posts

**Phase 2 (week 5+): Auto-approve with exceptions**
- Quality gate runs automatically (legal, voice, anti-AI checks)
- PASS → auto-`mv` to `approved/`
- FAIL → stays in `draft/`, Gen notified

### Stage 3: Schedule (approved/ → scheduled/)

- Scheduler assigns next available weekday
- Renames file with date prefix if not already dated
- `mv` to `scheduled/`
- Scheduling logic: fill Mon-Fri, skip weekends, no duplicate countries same week if possible

### Stage 4: Post (scheduled/ → posted/)

- Cron: daily 7PM KST (country-adjusted)
- Check `scheduled/` for today's post
- Post via Instagram Graph API (Business account required)
- Fallback: Telegram notification to Gen with images + caption for manual posting
- On success: `mv` to `posted/`

---

## Image Backend (Pluggable)

```
Generator
    ↓
ImageBackend.generate(slides, templateId)
    ↓
  ├─ ContentdripsAdapter   ← Phase 1 (API call + poll + download)
  ├─ PlaywrightAdapter     ← test later (HTML template → screenshot)
  └─ CanvaAdapter          ← future option
```

Backend selection: `memory/instagram-style-guide.md` → `backend: contentdrips`

Switch backend by changing one line in style-guide. Generator code checks this value.

Note: Contentdrips is the default from the start — no text-only MVP phase.

---

## Implementation Steps

### Step 1: Folder structure + file schema
- Create `content/instagram/{draft,approved,scheduled,posted}/` directories
- Create `content/instagram/.gitkeep` in each
- Define and validate JSON schema (extend existing `instagram-stage1.schema.json`)
- Add `public/images/instagram/` to `.gitignore` (images are large)

### Step 2: Generator skill (rewrite)
- Rewrite `skills/instagram-repurpose/SKILL_instagram-repurpose.md` to output to `draft/`
- Simplify: remove checkpoint-heavy flow, single-pass generation
- Keep: carousel type selection, slide extraction rules, caption voice, legal checks
- Add: memory-aware (read style-guide before generation)
- Add: dedup check before generating (skip if slug already in pipeline)

### Step 3: Contentdrips adapter
- Implement API integration (need: API key, template IDs, endpoint docs)
- Poll for completion, download PNGs to `public/images/instagram/[slug]/`
- Error handling: if API fails, set `imageStatus: "failed"` in json, notify Gen

### Step 4: `/instagram` command (rewrite)
- `/instagram [slug]` — generate single post → `draft/`
- `/instagram batch` — scan for IG-less blogs, generate up to 5 → `draft/`
- `/instagram review` — present all `draft/` items for batch review
- `/instagram schedule` — assign dates to `approved/` items, move to `scheduled/`
- `/instagram status` — count files in each folder
- `/instagram log [slug]` — 48h performance logging (existing)

### Step 5: Blog publish hook
- Add to `/blog` Stage 5: after publish, present suggestion prompt to Gen
- Config: `memory/instagram-style-guide.md` → `auto_generate_on_publish: true`
- Hook behavior: suggestion only, NOT auto-execution (Gen confirms before running)

### Step 6: Cron jobs (KST) — Phase 1 scope
- **Weekly Monday 9AM KST**: scan for IG-less blogs → generate batch → `draft/`

Phase 2 additions (not in Phase 1):
- Daily 7PM KST: post from `scheduled/` (or send Telegram fallback)
- Weekly Friday 6PM KST: log performance for posts from 48h+ ago

### Step 7: Phase 2 auto-approve gate
- Quality checks: legal flags, anti-AI scan, voice consistency
- Threshold from `memory/instagram-performance.md`:
  - Gen edit rate ≤ 20% over last 10 posts → enable auto-approve
  - Any FAIL → stays in `draft/`

---

## Transition Criteria (Phase 1 → Phase 2)

All must be true:
- [ ] 10+ posts published via pipeline
- [ ] Quality gate PASS rate ≥ 80%
- [ ] Gen approval-without-edit rate ≥ 80%
- [ ] Style guide has ≥ 5 hard rules populated
- [ ] At least 2 image backends tested

---

## Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| Create | `content/instagram/{draft,approved,scheduled,posted}/.gitkeep` | Folder structure |
| Create | `content/instagram/.gitignore` | Ignore `public/images/instagram/` PNGs |
| Rewrite | `localnomad-blog-plugin/commands/instagram.md` | New subcommands (batch, review, schedule, status) |
| Rewrite | `localnomad-blog-plugin/skills/instagram-repurpose/SKILL_instagram-repurpose.md` | Single-pass generator, folder output |
| Create | `localnomad-blog-plugin/skills/instagram-repurpose/adapters.md` | Image backend adapter spec |
| Update | `localnomad-blog-plugin/contracts/instagram-stage1.schema.json` | Align with new file format |
| Delete | `localnomad-blog-plugin/contracts/instagram-stage3.schema.json` | Merge into single output schema |
| Create | `localnomad-blog-plugin/contracts/instagram-output.schema.json` | Unified output (replaces stage1+stage3) |
| Update | `localnomad-blog-plugin/commands/blog.md` | Add Stage 5 → instagram hook (suggestion prompt) |
| Update | `memory/instagram-style-guide.md` | Add backend + auto_generate config fields |
| Create | `skills/instagram-repurpose/references/` | IG-specific reference files |
| Update | `localnomad-blog-plugin/.claude-plugin/plugin.json` | Verify skill registration |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Contentdrips API quality/limits | Images unusable | Set imageStatus: "failed", notify Gen; PlaywrightAdapter as backup |
| Blog backlog insufficient for daily posts | Queue runs dry | Cron scan alerts when queue < 3 days; repurpose old posts differently |
| Instagram Graph API requires Business account | Can't auto-post | Telegram fallback for manual posting (Phase 1 anyway) |
| Style guide empty in Phase 1 | Inconsistent output | Seed with reasonable defaults, iterate from Gen feedback |
| Auto-approve false positives (Phase 2) | Bad posts go live | Weekly spot-check + revert to Phase 1 if quality drops |

---

## Verification Steps

- [ ] `/instagram test-slug` generates valid .json in `draft/`
- [ ] `mv draft/X approved/X` works, scheduler picks it up
- [ ] `/instagram review` shows all drafts with preview
- [ ] `/instagram status` shows correct counts per folder
- [ ] Blog publish shows suggestion prompt (not auto-run)
- [ ] Cron scan finds blogs without IG counterparts (Monday batch only in Phase 1)
- [ ] Contentdrips adapter produces downloadable PNGs to `public/images/instagram/[slug]/`
- [ ] Legal checks flag Taiwan/tax content correctly
- [ ] Performance logging appends to raw-log correctly
- [ ] Dedup check prevents duplicate slug entries in pipeline

---

## Acceptance Criteria

1. `/instagram [slug]` produces complete carousel (text + images) in `draft/` in < 3 min
2. `/instagram batch` generates 5 posts in < 15 min
3. `/instagram review` presents batch for approval in single session
4. Folder-based state machine works with plain `mv` / `git status`
5. Image backend is swappable via single config change
6. Phase 1 → Phase 2 transition is data-driven (metrics in performance.md)
7. Daily posting works (API or Telegram fallback)

---

## Appendix: Architect Review Summary (2026-03-16)

Changes incorporated from architect review:

1. **Image paths**: moved from `content/instagram/draft/slides/` to `public/images/instagram/[slug]/` — keeps generated images in `public/` where Next.js can serve them, avoids mixing content and assets.
2. **.gitignore target**: updated from `content/instagram/draft/slides/` to `public/images/instagram/` to match new path.
3. **Contentdrips from start**: no text-only MVP phase — Contentdrips is the default image backend from day one.
4. **Phase 1 cron scope**: Monday batch scan only. Daily posting cron and Friday performance logging deferred to Phase 2 to keep Phase 1 simple.
5. **Blog hook = suggestion prompt**: Step 6.5 in blog pipeline presents a suggestion to Gen, not an auto-run. Gen must confirm before `/instagram [slug]` executes.
6. **imageStatus field**: added to file format to track image generation state (`generated`, `failed`, `pending`).
7. **Files table**: changed "Fix references/" to "Create references/" — the IG-specific references directory doesn't exist yet.
8. **Generator dedup check**: added as Step 3 in generator flow — skips generation if slug already exists in any pipeline folder.
