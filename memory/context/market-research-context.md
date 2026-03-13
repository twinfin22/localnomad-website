# Market Research Context (2026-03)

Phase: **product-market fit exploration**. Core question: "Visa dashboard or pivot?"

## Research Scripts (`scripts/`)

- `reddit-pain-mining.py` — Hypothesis verification (pain keywords). Output: categorized pain scores, WTP signals.
- `reddit-discover.py` — Unbiased discovery (no pain keywords). Raw comments from megathreads.
- `reddit-megathreads.py` — Highest-engagement threads per country, filtered for foreigner-relevance.

Outputs → `docs/agent/reference/`. Reports → `docs/agent/reports/`.

## Key Findings (3,038 posts + 30,538 comments)

Full analysis: `docs/agent/reference/reddit-mining-full-analysis.md`

**Pain points:** Housing 58.7% (#1 Japan/overall), Language 42.4%, Visa 40.7%, Community 31.3%, Banking 29.7%.

**Unexpected:** Dating 250+, DV escape 180+, mental health 120+, work culture toxicity 150+.

**WTP signals:** 53 posts. Korea 60% (ARC, financial advice, relocation). Japan: guarantor, phone.

**Country personality:** Japan = procedural info. Korea = crisis support.

**Gold Zone:** ARC/visa admin (Korea), housing discrimination network (Japan/Korea), tax filing guides (Japan).

**Positioning:** "Visa dashboard" may be wrong. Data suggests "foreigner survival in NE Asia" — GaijinPot model.

## Competitors

Visadb (12K visas, free, info-only) · Boundless (US only, $999+) · Jobbatical (B2B SaaS, 16K relocations) · Relocate.me (€126K rev, bootstrapped) · GaijinPot (Japan, $6M rev, 73 employees, acquired by Gakken) · **No GaijinPot equivalent for Korea or Taiwan**.

## Government Survey Cross-Reference

- **Taiwan:** Gold Card Survey 2023 — Banking #1, housing #4, biz reg 54%
- **Japan:** MOJ FY2024 — Housing discrimination 17.4%, language 15.8%
- **Korea:** 외국인실태조사 — Discrimination (nationality 46.8%, language 40.5%)
