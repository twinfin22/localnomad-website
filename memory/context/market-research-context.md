# Market Research Context (2026-03)

Phase: **product-market fit exploration**. Core question: "Visa dashboard or pivot?"

Pain rankings, WTP analysis, segment WTP, competitive landscape, country personality → see ~/.claude/memory/warm/knowledge/market-intel.md
Persona/segment data (E-6, Researchers, Students) → see ~/.claude/memory/warm/audiences.md

## Research Scripts (`scripts/`)

- `reddit-pain-mining.py` — Hypothesis verification (pain keywords). Output: categorized pain scores, WTP signals.
- `reddit-discover.py` — Unbiased discovery (no pain keywords). Raw comments from megathreads.
- `reddit-megathreads.py` — Highest-engagement threads per country, filtered for foreigner-relevance.

Outputs → `docs/agent/reference/`. Reports → `docs/agent/reports/`.
Full analysis: `docs/agent/reference/reddit-mining-full-analysis.md`

## Research-Specific Data (not in warm/)

**Unexpected findings:** Dating 250+, DV escape 180+, mental health 120+, work culture toxicity 150+.

**Gold Zone:** ARC/visa admin (Korea), housing discrimination network (Japan/Korea), tax filing guides (Japan).

## Government Survey Cross-Reference

- **Taiwan:** Gold Card Survey 2023 — Banking #1, housing #4, biz reg 54%
- **Japan:** MOJ FY2024 — Housing discrimination 17.4%, language 15.8%
- **Korea:** 외국인실태조사 — Discrimination (nationality 46.8%, language 40.5%)
