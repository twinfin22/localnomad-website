# On-Page SEO Checklist — 13 Items

Run this checklist during STAGE 4 (Quality Gate, Layer 2).

## Hard Rules (fail if missing)

- [ ] **Title tag**: ≤70 characters, includes primary keyword
- [ ] **Meta description**: ≤160 characters, includes primary keyword, compels click
- [ ] **URL slug**: short, descriptive, includes primary keyword, hyphen-separated
- [ ] **H1**: exactly one per page, matches or closely reflects title tag
- [ ] **Internal links**: ≥3 links to related LocalNomad pages (use CLAUDE.md Internal Link Map)
- [ ] **External links**: ≥1 link to authoritative external source
- [ ] **Link validation**: all internal and external links return HTTP 200

## Soft Rules (flag as warning, not auto-fail)

- [ ] **Primary keyword in first 100 words**: include if natural, do not force
- [ ] **Primary keyword in ≥1 H2 subheading**: include if natural
- [ ] **Image alt text**: descriptive, includes keyword where relevant
- [ ] **H2/H3 subheadings**: descriptive, include secondary keywords where natural
- [ ] **Featured snippet structure**: definition paragraph, numbered list, or table where opportunity exists
- [ ] **Structured data compatibility**: frontmatter maps cleanly to Article schema (title, description, date, author, image)

## Link Validation Process

For each link in the post:
1. Internal links: verify the target path exists in the LocalNomad site structure
2. External links: verify the URL is accessible and returns 200
3. Flag any broken links as FAIL in Quality Report
