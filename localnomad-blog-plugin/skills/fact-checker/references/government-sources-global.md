# Government Sources — Global (Tier Classification Rules)

Last updated: 2026-03-14

This file contains cross-country tier classification rules that apply regardless of which country a post covers. Always load this file alongside a country-specific government-sources file.

---

## Column Definitions

All country-specific source files use these columns:

| Column | Values | Purpose |
|--------|--------|---------|
| Source | Name of organization | Human-readable identifier |
| URL | Domain or specific page | Target for firecrawl_scrape |
| Covers | Topic areas + `[A-E]` claim type tags | Maps sources to claim types |
| Lang | `XX full / EN partial`, `EN only`, etc. | Indicates if native language version has more detail |
| Format | `HTML`, `HTML+PDF`, `PDF`, `eService` | Guides tool selection (scrape vs extract) |
| Scrape | `OK`, `JS`, `Login`, `N/A(app)`, `N/A(geo)` | Whether firecrawl_scrape will succeed |

**Scrape column values**:
- `OK` — Standard HTML, firecrawl_scrape works
- `JS` — Requires JS rendering, may need firecrawl_browser
- `Login` — Behind authentication wall
- `N/A(app)` — Application/service portal, not an information page (do not scrape for claim verification)
- `N/A(geo)` — Geofenced, may not be accessible from all regions

---

## Tier Classification Quick Rules

**Automatically Tier 1**:
- Any URL with a government domain (.go.kr, .go.jp, .gov.tw, .gov.cn, .go.th, .gov.vn, .go.id, .gov.my, .gov.sg, .gov.ph)
- Official government press releases (even if on a news site, IF linking to original government source)
- Law database entries (law.go.kr, law.moj.gov.tw, japaneselawtranslation.go.jp)
- Government-affiliated agencies: nhis.or.kr (Korea NHIS), investkorea.org (KOTRA), mdec.my (Malaysia MDEC)

**NOT Tier 1** (even if they look official):
- visa-agency.com, visa-online.com — generic commercial visa services
- visa-kr.com, visa-korea.com — commercial/scam Korea visa services
- visaforchina.cn — government-authorized outsourced service center, not government-operated (use nia.gov.cn for policy verification)
- evisamalaysia.online — NOT the official portal (use malaysiavisa.imi.gov.my per Malaysian Immigration directive)
- thaiextension.vfsevisa.com — VFS Global is a private vendor, not government (Tier 2 at best)
- molina.imigrasi.go.id — deprecated Indonesian system (use evisa.imigrasi.go.id)
- japanvisa.com — private visa service, not government
- Wikipedia — Tier 3 at best, use as pointer to find Tier 1 sources
- Embassy websites of NON-target countries (e.g., a US embassy page about Korea visas — this is Tier 2)

**Tier 2 and Tier 3 media/community sources**: See `references/media-sources.md` for curated list.

---

## Country-Specific Source Files

Load ONLY the file matching the post's `country` field:

| Country | File |
|---------|------|
| Korea | `government-sources-korea.md` |
| Japan | `government-sources-japan.md` |
| Taiwan | `government-sources-taiwan.md` |
| China, Thailand, Vietnam, Indonesia, Malaysia, Singapore, Philippines | `government-sources-sea.md` |
| Multi-country or global posts | Load all relevant country files |
