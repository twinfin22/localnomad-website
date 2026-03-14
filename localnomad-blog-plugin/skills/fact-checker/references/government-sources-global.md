# Government Sources — Global (Tier Classification Rules)

Last updated: 2026-03-13

This file contains cross-country tier classification rules that apply regardless of which country a post covers. Always load this file alongside a country-specific government-sources file.

---

## Tier Classification Quick Rules

**Automatically Tier 1**:
- Any URL with a government domain (.go.kr, .go.jp, .gov.tw, .gov.cn, .go.th, .gov.vn, .go.id, .gov.my, .gov.sg, .gov.ph)
- Official government press releases (even if on a news site, IF linking to original government source)
- Law database entries (law.go.kr, law.moj.gov.tw, japaneselawtranslation.go.jp)

**NOT Tier 1** (even if they look official):
- visa-agency.com, visa-online.com, visa-kr.com, visa-korea.com — commercial/scam visa services
- visaforchina.cn — affiliated private provider (use nia.gov.cn instead)
- evisamalaysia.online — NOT the official portal (use malaysiavisa.imi.gov.my per Malaysian Immigration directive)
- thaiextension.vfsevisa.com — VFS Global is a private vendor, not government (Tier 2 at best)
- molina.imigrasi.go.id — deprecated Indonesian system (use evisa.imigrasi.go.id)
- Wikipedia — Tier 3 at best, use as pointer to find Tier 1 sources
- Embassy websites of NON-target countries (e.g., a US embassy page about Korea visas — this is Tier 2)

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
