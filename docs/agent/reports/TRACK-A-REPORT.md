# Track A Report

> Completed: 2026-02-16
> Branch: `track-a/content-seo`
> Build: PASS (211/211 static pages)

---

## F-1-D Digital Nomad Visa Guide (Task 1)

- **Commit**: `608d032`
- Sections added/updated:
  - SEO name: "Korea Digital Nomad Visa (F-1-D) — Complete 2026 Guide"
  - SEO description with target keywords
  - Income requirement detail: 2024 GNI base ₩88,102,000, verification methods, freelancer specifics
  - Insurance: minimum ₩100M coverage, NHI ineligibility note, provider examples
  - Application steps: enhanced with in-Korea status change, processing details
  - Official source links: visa.go.kr, immigration.go.kr, hikorea.go.kr
- FAQ count: 6 → 10 (+4: tax/183-day rule, visa transitions, family F-1 dependent, renewal, remote work restrictions)
- Languages updated: en, ja, zh-tw

## Taiwan DNV Guide (Task 2)

- **Commit**: `429a9f1`
- Gold Card comparison: added (10-criterion factual table, en + zh-tw)
- TECO routing: added with 5 example regional offices
- Tax implications: added (183-day rule, Basic Income Tax / 最低稅負制)
- New FAQs: 4 (Gold Card comparison, tax, banking, renewal beyond 1 year)
- Application step 2 enhanced with TECO explanation
- SEO name/description updated
- Disclaimers in English AND 繁體中文: YES
- Languages updated: en, zh-tw

## E-7 → F-2 Path Simulator (Task 3)

- **Commit**: `dcdeacd`
- Points breakdown: 6 categories with max points and detailed criteria
- Example scenarios: 2 (Scenario A: 87pts PASS, Scenario B: 76pts FAIL)
- Timeline: 3-phase (Year 1-2, 2-3, 3+)
- Korean document names alongside English: YES
- Data mirrored in E-7 `pathsTo` and F-2 `pathsFrom`
- Disclaimer on every section: YES
- Languages updated: en (ja/zh-tw lower priority — not updated this sprint)

## H-1 Working Holiday Differentiation (Task 4)

- **Commit**: `98e69f4`
- Nationalities covered: 14 (en), 10 (ja, zh-tw)
  - Australia, Canada, Japan, France, Germany, UK, Ireland, New Zealand, Taiwan, Hong Kong, Netherlands, Sweden, Austria, Denmark
- Quota calendar: YES (monthly events: Jan/Apr/Oct/Dec)
- Age limits by country: YES
- Quota limits by country: YES (ranging from ~100 to unlimited)
- New FAQs: 2 per locale (partner countries, quota timing)
- H-1→E-7 path notes updated with timing guidance
- Languages updated: en, ja, zh-tw

## Deploy (Task 5)

- `npm run build`: **PASS** (211/211 static pages, 2.2s)
- `npm run lint`: ESLint v10 config migration issue (pre-existing, unrelated to data changes)
- Pushed: **YES** (`track-a/content-seo` → origin)

---

## Summary Statistics

| Metric | Before | After |
|--------|--------|-------|
| F-1-D FAQ count | 6 | 10 |
| Taiwan DNV FAQ count | 5 | 9 |
| E-7 pathsTo F-2 data | basic text | full points breakdown + 2 scenarios |
| H-1 nationality-specific countries | 0 | 14 (en) / 10 (ja, zh-tw) |
| Total data files modified | 0 | 9 |
| Commits | 0 | 4 |
| Languages touched | — | en, ja, zh-tw |

## Legal Compliance

- Korea: All content uses "published requirements state..." / "according to immigration service..." phrasing
- Taiwan: NO match scores, NO percentages, NO "you qualify" — factual comparison tables only
- Taiwan disclaimers in English AND 繁體中文 on Gold Card comparison
- All quiz/scenario data includes "not an eligibility determination" disclaimer
