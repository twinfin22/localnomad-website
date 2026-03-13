---
name: cover-image
description: Automated cover image selection and processing for LocalNomad blog posts — Unsplash search, download, resize to 960x480, and frontmatter integration.
---

# Cover Image

## Overview

Every blog post starts with a cover image sourced from Unsplash. This skill automates:
1. Keyword-based Unsplash search
2. Candidate selection (3 options)
3. Download and resize to 960x480
4. Save to `public/images/blog/[slug].jpg`
5. Update frontmatter `coverImage` field
6. Generate alt text (primary keyword + descriptive)

## Process (STAGE 4 — Track B)

### Step 1: Search Keywords
- Use the Unsplash search keywords suggested in STAGE 3 Brief
- Default search strategy: `[country] + [topic visual]` (e.g., "korea office worker", "taiwan taipei street")
- Fallback: broader geographic or thematic keywords

### Step 2: Search Unsplash
```bash
# Unsplash API search
curl -s "https://api.unsplash.com/search/photos?query=KEYWORD&orientation=landscape&per_page=5" \
  -H "Authorization: Client-ID ${UNSPLASH_ACCESS_KEY}"
```

Requirements:
- Orientation: **landscape** (required for 960x480)
- Results: **3 candidates** (not 5 — faster review cycle)
- Filter: prefer photos with people, street scenes, or relevant landmarks

### Hard Rules
- **FREE images only** — URLs must be `images.unsplash.com`. Skip any result from `plus.unsplash.com` (premium/Unsplash+).
- **Horizontal/landscape orientation only** — no portrait or square.
- **Color images only** — no black & white, grayscale, or desaturated photos.
- **Asian people visible** — prioritize photos with Asian subjects or clearly Asian settings. Avoid Western-centric stock.
- **No duplicate photos** — never reuse a photo already assigned to another post in the same session. Track selected photo IDs across batches.

### Verification Before Presenting
Before including a candidate in the shortlist:
1. Check the Unsplash result URL — **skip if `plus.unsplash.com`** (premium).
2. Review the photo description/tags — skip if tagged "black and white", "monochrome", or "grayscale".
3. Confirm landscape orientation from API response (`width > height`).

### Step 3: Image Selection Presets

Read `references/image-presets.md` for category-to-visual mapping.

Default presets by blog category:
- **guides**: document/office scenes, official buildings, visa-related imagery
- **comparisons**: side-by-side visuals, split compositions, city skylines
- **tips**: lifestyle scenes, coworking spaces, coffee shops
- **stories**: street photography, cultural moments, travel scenes
- **news**: cityscapes, government buildings, news-relevant imagery
- **updates**: tech/digital scenes, notification-style imagery

### Step 4: Download and Process
```bash
# Download the raw image
curl -sL "UNSPLASH_DOWNLOAD_URL" -o /tmp/cover-raw.jpg

# Resize to 960x480 (crop center)
convert /tmp/cover-raw.jpg -resize 960x480^ -gravity center -extent 960x480 \
  public/images/blog/[slug].jpg
```

Requirements:
- Final size: **960x480 pixels** (2:1 aspect ratio)
- Format: JPEG
- Path: `public/images/blog/[slug].jpg`

### Step 5: Update Frontmatter
```yaml
coverImage: /images/blog/[slug].jpg
```

### Step 6: Alt Text
Generate alt text that:
- Describes the image content
- Includes primary keyword where natural
- ≤125 characters
- Example: "Korean office building entrance where E-7 visa holders report for work"

## Unsplash Attribution

Unsplash license allows free use without attribution, but we include photographer credit in a comment:
```mdx
{/* Cover: Photo by [Name] on Unsplash */}
```

## Prerequisites

- `UNSPLASH_ACCESS_KEY` environment variable set
- ImageMagick installed (`convert` command available)
- `public/images/blog/` directory exists
