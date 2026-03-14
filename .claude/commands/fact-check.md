---
name: fact-check
description: Standalone fact-checker — 5-step verification + contrarian challenge + source link injection for any content (file, URL, text, or single claim). Same protocol as blog pipeline Layer 1, without quality-gate overhead.
---

# /fact-check $ARGUMENTS

## Input Parsing

Detect input type automatically from `$ARGUMENTS`:

| Input | Detection | Action |
|-------|-----------|--------|
| File path (`.md`, `.mdx`, `.txt`) | Starts with `/` or `./`, has file extension | Read file contents |
| URL | Starts with `http://` or `https://` | Fetch with `firecrawl_scrape` and extract text |
| Multi-line text | Contains newlines or >100 characters | Treat as pasted content |
| Short text | Single line, <=100 characters | Treat as single claim |

If input type is ambiguous, ask the user to clarify.

## Execution

1. Read the fact-checker skill:
   `localnomad-blog-plugin/skills/fact-checker/SKILL_fact-checker.md`
2. Auto-detect country from content (scan for country names, visa type codes like F-1-D/E-7/Gold Card, government URLs).
3. Load ONLY the country-specific government sources file(s) for detected countries:
   - Korea → `localnomad-blog-plugin/skills/fact-checker/references/government-sources-korea.md`
   - Japan → `localnomad-blog-plugin/skills/fact-checker/references/government-sources-japan.md`
   - Taiwan → `localnomad-blog-plugin/skills/fact-checker/references/government-sources-taiwan.md`
   - SEA/China → `localnomad-blog-plugin/skills/fact-checker/references/government-sources-sea.md`
   - Tier classification rules → `localnomad-blog-plugin/skills/fact-checker/references/government-sources-global.md`
   - Multi-country content → load all relevant country files
   - No country detected → load global rules only, proceed without country-specific notes
4. Run the **Preparation** preamble (lazy-load verified-claims-cache via grep per claim, initialize fetched-pages tracker and tool budget)
5. Run the **5-step protocol** (Steps 1-5) on the parsed content
6. Run **contrarian verification** — read `localnomad-blog-plugin/skills/fact-checker/SKILL_fact-contrarian.md` and invoke via `Agent(subagent_type="oh-my-claudecode:critic", model="sonnet")` on VERIFIED claims only. Do NOT pass blog source text to the contrarian.
7. Run **source link injection** — read `localnomad-blog-plugin/skills/fact-checker/SKILL_source-link-injector.md` and inject links using the fact-check report's SOURCE TABLE
8. Output the standard Fact-Check Report following `localnomad-blog-plugin/skills/fact-checker/references/report-template.md`, including contrarian results and source links

## Differences from Blog Pipeline

This command runs fact-checker → contrarian → source-link-injector sequentially. It does NOT run:

- Quality-gate Layers 2-5 (SEO density, anti-AI, legal compliance, voice)
- Blog-specific context (category, cover image, word count targets)
- SEO engine, blog-voice, or legal-bright-lines skills
- LocalNomad-specific checks (≥2-source cross-verify, internal link validation) — these are quality-gate Layer 1 additions

Country is auto-detected from content instead of being passed from blog metadata.
Report format is identical to blog pipeline output.
