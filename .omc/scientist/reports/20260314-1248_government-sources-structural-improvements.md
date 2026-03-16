# Government Sources — Structural Improvements Analysis

**Date**: 2026-03-14  
**Analyst**: Scientist agent (oh-my-claudecode)  
**Stage**: RESEARCH_STAGE:2 — Structural Improvements

---

[OBJECTIVE] Assess 9 proposed structural improvements to government source reference files used by the LocalNomad fact-checker skill, evaluating each for value, maintenance burden, and adoption recommendation.

[DATA] Files analyzed: 5 government-sources reference files (korea, japan, taiwan, sea, global), SKILL_fact-checker.md (6-step protocol), verified-claims-cache.md (22 cached claims across 4 countries). Total sources in tables: 57 entries across 12 countries.
[STAT:n] n=9 proposed improvements, n=57 source entries analyzed, n=5 structural tensions identified

---

## Scoring Matrix

| # | Improvement | Rec | Value | Maint | Priority |
|---|-------------|-----|-------|-------|----------|
| 1 | Language Availability Column | **ADOPT** | 4/5 | 1/5 | 1st |
| 2 | Content Format Column | **ADOPT** | 3/5 | 2/5 | 3rd |
| 3 | Freshness/Update Cadence | CONSIDER | 2/5 | 3/5 | 9th |
| 4 | Scraping Reliability Notes | **ADOPT** | 4/5 | 3/5 | 6th |
| 5 | Claim Type Mapping | CONSIDER | 2/5 | 2/5 | 7th |
| 6 | URL Specificity (Subpages) | **ADOPT (selective)** | 4/5 | 4/5 | 8th |
| 7 | Cross-Reference Pointers | CONSIDER | 2/5 | 1/5 | 2nd |
| 8 | Known Pitfalls Expansion | **ADOPT** | 3/5 | 2/5 | 4th |
| 9 | Non-Tier-1 Blocklist Expansion | **ADOPT (consolidate)** | 3/5 | 2/5 | 5th |

Priority = Value/Maintenance ratio. Higher = implement first.

---

## Detailed Assessments

### #1 — Language Availability Column  ADOPT  Value: 4/5  Maintenance: 1/5

[FINDING] Adding a "Languages" column is the highest-ROI improvement: low maintenance, directly addresses a known fact-checker failure mode.
[STAT:effect_size] The skill itself flags bilingual pages as a known hazard (East Asian Government Source Handling #1). 6 of 13 Korea/Japan/Taiwan sources already have separate EN rows — but no machine-readable signal marks the native-language version as more complete.
[STAT:n] n=12 sources with bilingual versions across Korea, Japan, Taiwan files

The current table structure requires the agent to infer completeness from separate rows. A "Languages" column (e.g., `KR full / EN partial`) removes that inference. For Critical claims (Type B/D), this is the difference between scraping an incomplete EN page and correctly targeting the KR/JA/ZH page.

**Implementation**: Add `Languages` column. Values: `KR full / EN partial` | `EN only` | `JA full / EN partial` | `ZH full / EN partial`. Mark with `(*)` where native version has substantially more detail.

---

### #2 — Content Format Column  ADOPT  Value: 3/5  Maintenance: 2/5

[FINDING] A "Format" column prevents tool-selection errors (firecrawl_scrape vs firecrawl_extract) on PDF-heavy sources.
[STAT:n] n=3 PDF URLs already in verified-claims-cache (immigration.go.kr/bbs/.../download.do, visa.go.kr downfile, law.go.kr flDownload)

When firecrawl_scrape hits a PDF endpoint, it either fails or returns unstructured content. The agent currently has no pre-scrape signal that a URL leads to a PDF. The format column provides this signal at planning time.

**Implementation**: `Format` column values: `HTML` | `HTML+PDF` | `PDF` | `Announcements` | `eService(app)`.

---

### #3 — Freshness/Update Cadence per Source  CONSIDER  Value: 2/5  Maintenance: 3/5

[FINDING] Source-level cadence is redundant with the existing per-claim Volatility field in verified-claims-cache unless the workflow adds proactive sweep mode.
[STAT:n] n=22 cache entries already have Volatility and Next Review fields at claim level

The claim-centric cache already handles re-verification timing. Source-level cadence adds value only for a proactive "sweep mode" that does not currently exist in the 6-step protocol.

**Recommendation**: Defer. Adopt only if proactive sweep mode is added to the fact-checker workflow.

---

### #4 — Scraping Reliability Notes  ADOPT  Value: 4/5  Maintenance: 3/5

[FINDING] 13 eService portal URLs across all country files will return login walls or empty JS shells when scraped — with no current signal to prevent wasted tool calls.
[STAT:n] n=13 eService portals identified (hikorea.go.kr, visawebapp.boca.gov.tw, thaievisa.go.th, evisa.imigrasi.go.id, e-arrivalcard.go.kr, tdac.immigration.go.th, evisa.gov.vn, ica.gov.sg/eservicesandforms, consular.mfa.gov.cn/VISA/, enia.nia.gov.cn, malaysiavisa.imi.gov.my, e-services.immigration.gov.ph, e-arrivalcard.go.kr)

These are application portals, not information pages. Fact-checking claims against them is never valid — they are listed for completeness (users need them) but are not claim-verification targets. Without a scraping flag, the agent wastes a scrape call discovering this at runtime.

**Implementation**: `Scrape` column values: `OK` | `JS` | `Login` | `N/A(app)`. eService portals → `N/A(app)`. For `JS` entries, note recommended fallback.

[LIMITATION] Scraping behavior for some sources was inferred from URL patterns (e.g., `/BOCA_EVISA/` as a web app), not empirically tested. Actual scrape behavior requires verification.

---

### #5 — Claim Type Mapping  CONSIDER  Value: 2/5  Maintenance: 2/5

[FINDING] The existing "Covers" column already encodes claim-type information in prose; formal A-E tags add modest value at the cost of redundancy.

The Step 1 claims table already requires agents to populate "Target Domain" by inferring from the Covers text. A formal type tag would make this mechanical, but the inference from natural language is not a documented failure point. The value does not justify a new column.

**Alternative**: Annotate the Covers column inline: `Visa types [B], residence status [B,D], policy announcements [D]`. Lower maintenance, same signal.

---

### #6 — URL Specificity (Subpages)  ADOPT (selective)  Value: 4/5  Maintenance: 4/5

[FINDING] The verified-claims-cache is already the de-facto subpage directory — 3 specific subpage URLs in the cache do not appear in the source tables.
[STAT:n] n=3 subpage URLs in cache not present in source tables (immigration.go.kr/bbs/..., moj.go.jp/isa/applications/..., goldcard.nat.gov.tw/en/tags/aprc/)

The skill's Step 3 explicitly fails domain homepage sources. Yet most source table entries ARE domain-level. The gap is bridged by the cache for known claims, but uncached Critical claims will still land on domain homepages.

**Implementation constraint**: Only add subpages that (a) appear in the verified-claims-cache, OR (b) are high-frequency Critical claim targets. Avoid deep-linking volatile content. Use the cache as the authoritative source for which subpages to promote.

[LIMITATION] Subpage URLs have higher breakage risk. Selective adoption with stable-only subpages mitigates but does not eliminate this risk.

---

### #7 — Cross-Reference Pointers  CONSIDER  Value: 2/5  Maintenance: 1/5

[FINDING] The most important jurisdiction cross-references (ISA↔MOFA for Japan, NIA↔BOCA for Taiwan) are already encoded in the country notes sections.

The prose notes cover the critical patterns. Formalizing into machine-readable pointers adds minimal operational value over what the agent already reads.

**Alternative**: Expand the notes sections with an explicit "Cross-reference matrix" subsection (prose, not a new column) for edge cases where a claim spans two sources.

---

### #8 — Known Pitfalls Section Expansion  ADOPT  Value: 3/5  Maintenance: 2/5

[FINDING] The SEA file has no notes/pitfalls section despite covering 7 countries, including China's documented volatile payment landscape.
[STAT:n] n=3 country files with notes (Korea: 6 items, Japan: 3 items, Taiwan: 6 items) | n=1 country file with no notes (SEA, covering 7 countries)

Inconsistent structure means a fact-checker agent reading the SEA file gets no country-specific warnings, while one reading the Korea file gets 6. The SEA gap is particularly consequential given WeChat Pay's documented volatility (cache entry: "Changed multiple times 2023-2025").

**Implementation**: Standardize notes section format across all files. Add SEA notes with per-country subsections. Structure: `[Type] [Claim category] — [Pitfall] — [Correct approach]`.

---

### #9 — Non-Tier-1 Blocklist Expansion  ADOPT (consolidate + expand)  Value: 3/5  Maintenance: 2/5

[FINDING] Korea's existing blocklist is buried in the notes section in Korean text and is not searchable alongside the English global blocklist.
[STAT:n] n=6 entries in global blocklist | n=2 Korea entries in Korean prose (not in global blocklist) | n=1 tension: japan-guide.com appears in verified-claims-cache without tier label

The inconsistency creates two problems: (a) the Korea blocklist entries cannot be scanned alongside global entries, and (b) japan-guide.com (Tier 2 at best) appears as a source in the cache without a tier label, potentially being treated as Tier 1 in future runs.

**Implementation**: Move Korea blocklist entries to global file. Add per-country subsections in the global NOT Tier 1 section. Add a tier label convention to the verified-claims-cache for non-Tier-1 sources.

---

## Structural Tensions Found

| ID | Tension | Relevant Improvements |
|----|---------|----------------------|
| T1 | japan-guide.com in cache without tier label | #9, #5 |
| T2 | Korea blocklist in Korean text in notes (not in global file) | #9 |
| T3 | Cache contains 3 subpage URLs absent from source tables | #6 |
| T4 | SEA file has no notes/pitfalls section | #8 |
| T5 | 13 eService portals listed as scrape targets without scrape warnings | #4 |

---

## Implementation Sequence (by priority)

1. **#1 Language** — Add `Languages` column to all country files. Low effort, high signal.
2. **#8 Pitfalls** — Add SEA notes section; standardize notes format across all files.
3. **#9 Blocklist** — Consolidate Korea's blocklist into global file; add tier label to cache entries.
4. **#2 Format** — Add `Format` column; mark PDF endpoints and eService apps.
5. **#4 Scraping** — Add `Scrape` column; mark 13 eService portals as `N/A(app)`.
6. **#6 Subpages** — Selectively promote 3 cache subpage URLs into source tables; no new subpages.
7. **#7 Cross-ref** — Expand notes with cross-reference matrix subsections (prose, no new column).
8. **#5 Claim types** — Defer or implement as Covers column inline annotation only.
9. **#3 Cadence** — Defer until proactive sweep mode is designed.

---

[LIMITATION] This analysis is based on static file inspection only — no live scraping was performed to empirically verify scraping reliability of eService portals or current language availability of government sites. Scraping reliability conclusions for #4 are inferred from URL patterns and site type, not from actual firecrawl_scrape tests.

[LIMITATION] Priority scores are qualitative (1-5 scale) based on the analyst's reading of the skill protocol and file contents. They reflect relative ordering, not absolute measurement.
