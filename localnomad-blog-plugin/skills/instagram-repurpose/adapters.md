# Image Backend Adapters

Pluggable image generation system. Backend is selected from `memory/instagram-style-guide.md` → `backend` field.

## Interface

Every adapter implements:
1. `generate(slides[], templateId)` → `imagePaths[]`
2. Returns array of local file paths saved to `public/images/instagram/[slug]/`

Slide order is preserved. Output filenames: `slide-01.png`, `slide-02.png`, ..., `slide-N.png`.

---

## PostNitroAdapter (Phase 1 — Default)

- **Env var required**: `POSTNITRO_API_KEY`
- **Base URL**: `https://embed-api.postnitro.ai`
- **Auth**: `embed-api-key: {POSTNITRO_API_KEY}` header
- **Pricing**: $10/mo = 250 credits. Import: 1 credit/slide, AI gen: 2 credits/slide
- **~25 carousels/mo** at 10 slides each = matches our weekday posting target

### API Endpoints

```
POST /post/initiate/import     → returns { requestId }  (our content → their template)
POST /post/initiate/generate   → returns { requestId }  (AI generates from topic/article)
GET  /post/status/{requestId}  → { status: "processing"|"completed"|"failed" }
GET  /post/output/{requestId}  → PNG Blob[] or PDF
```

### Import Request Payload (Primary — We Provide Content)

```json
{
  "postType": "CAROUSEL",
  "templateId": "from style-guide template_ids.type_a|b|c",
  "brandId": "from style-guide postnitro_brand_id",
  "responseType": "PNG",
  "slides": [
    {
      "type": "starting_slide",
      "heading": "intro slide heading",
      "description": "intro slide description"
    },
    {
      "type": "body_slide",
      "heading": "slide heading",
      "description": "slide description"
    },
    {
      "type": "ending_slide",
      "heading": "Save this for your trip ✈️",
      "description": "Follow @localnomad.club for more"
    }
  ]
}
```

### AI Generation Request (Bonus — Blog URL → Auto Carousel)

```json
{
  "postType": "CAROUSEL",
  "templateId": "template-id",
  "brandId": "brand-id",
  "presetId": "ai-preset-id",
  "responseType": "PNG",
  "aiGeneration": {
    "type": "article",
    "context": "full blog text or URL",
    "instructions": "Create 8-10 slides for Instagram. Educational, visa/nomad audience."
  }
}
```

Note: AI gen costs 2x credits. Use import mode by default, AI gen for testing/comparison.

### Flow

```
1. POST /post/initiate/import { postType, templateId, brandId, slides, responseType }
2. Receive { requestId }
3. Poll GET /post/status/{requestId} (every 5s, timeout 60s)
4. On "completed": GET /post/output/{requestId} → PNG images
5. Save PNGs to public/images/instagram/[slug]/slide-{01..N}.png
6. Total timeout: 5 min for full carousel
```

### Slide Type Mapping (Our Schema → PostNitro)

```
introSlide   → { type: "starting_slide", heading, description }
slides[n]    → { type: "content_slide", heading, description }
endingSlide  → { type: "ending_slide", heading, description }
```

### Success

Save PNGs to `public/images/instagram/[slug]/slide-{01..N}.png`.
Set `imageStatus: "complete"` in output JSON.

### Failure

1. Log error with requestId and API response
2. Set `imageStatus: "failed"` in output JSON
3. Continue — draft is still written with text content intact
4. `/instagram review` will show ⚠️ for failed image status

---

## ContentdripsAdapter (Backup)

- **Env var required**: `CONTENTDRIPS_API_KEY`
- **Base URL**: `https://generate.contentdrips.com`
- **Auth**: `Authorization: Bearer {CONTENTDRIPS_API_KEY}` header
- **Rate limit**: Free tier ~10 renders/day. Respect limits — do not batch-render without checking quota.

### API Endpoints

```
POST /render?tool=carousel-maker    → returns { job_id }
GET  /job/{job_id}/status           → { status: "pending"|"completed"|"failed" }
GET  /job/{job_id}/result           → { export_url: "https://..." }
```

### Request Payload

```json
{
  "template_id": "from style-guide template_ids.type_a|b|c",
  "output": "png",
  "carousel": {
    "intro_slide": { "heading": "...", "description": "..." },
    "slides": [
      { "heading": "...", "description": "..." }
    ],
    "ending_slide": { "heading": "...", "description": "..." }
  },
  "branding": {
    "name": "from style-guide branding.name",
    "handle": "from style-guide branding.handle",
    "avatar": "from style-guide branding.avatar",
    "website": "from style-guide branding.website"
  }
}
```

Note: `carousel` field maps 1:1 to our schema's `introSlide/slides/endingSlide`. Transform camelCase → snake_case for API.

### Flow

```
1. POST /render?tool=carousel-maker  { template_id, carousel, branding, output }
2. Receive { job_id }
3. Poll GET /job/{job_id}/status  (every 5s, timeout 60s)
4. On "completed": GET /job/{job_id}/result → { export_url }
5. Download export_url → save PNGs to public/images/instagram/[slug]/
6. Total timeout: 5 min for full carousel
```

### Success

Save PNGs to `public/images/instagram/[slug]/slide-{01..N}.png`.
Set `imageStatus: "complete"` in output JSON.

### Failure

1. Log error with slide index and API response
2. Set `imageStatus: "failed"` in output JSON
3. Continue — draft is still written with text content intact
4. `/instagram review` will show ⚠️ for failed image status
5. Gen can review text draft and add images manually

---

## PlaywrightAdapter (Phase 2 — Future)

- **No API dependency** — unlimited renders, no quota
- Local HTML templates in `localnomad-blog-plugin/templates/instagram/`
- Flow: render HTML template with slide data → Playwright screenshot → save PNG

Activate by setting `backend: playwright` in `memory/instagram-style-guide.md`.

---

## CanvasAdapter (Alternative — No API Dependency)

Inspired by [substack-to-instagram](https://github.com/gvmfhy/substack-to-instagram). Uses HTML5 Canvas rendering instead of external APIs.

- **No API key needed** — fully local, unlimited renders
- Render HTML template with slide data → Canvas/Playwright screenshot → save PNG
- Slide dimensions: Portrait 1080×1350 (4:5, recommended), Square 1080×1080
- Typography: serif font for editorial feel, dynamic sizing based on text length
- Background: brand-consistent gradients (Deep Teal Navy `#1B4965` base)
- Export: individual PNGs + optional ZIP bundle

Useful as:
- **Fallback** when Contentdrips API is down or quota exhausted
- **Development/testing** without burning API calls
- **Full replacement** if template quality is sufficient

Activate: `backend: canvas` in style-guide.

---

## CanvaAdapter (Future)

- Canva Connect API
- Placeholder — not yet implemented

---

## Switching Backend

Change one line in `memory/instagram-style-guide.md`:

```yaml
# Before
backend: contentdrips

# After
backend: playwright
```

Generator reads this value before each run. No code changes needed.

---

## Error Handling

If the selected backend fails:

1. Set `imageStatus: "failed"` in output JSON
2. Continue generating text content (slides, caption, hashtags)
3. Draft is still created in `content/instagram/draft/` — text is complete and reviewable
4. `/instagram review` shows ⚠️ next to image status
5. Re-run with `--images-only` flag to retry image generation without regenerating text
