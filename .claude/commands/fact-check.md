---
name: fact-check
description: Standalone fact-checker — 5-step verification protocol for any content (file, URL, text, or single claim). Same protocol as blog pipeline Layer 1, without quality-gate overhead.
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
2. Read the government sources reference:
   `localnomad-blog-plugin/skills/fact-checker/references/government-sources.md`
3. Auto-detect country from content (scan for country names, visa type codes like F-1-D/E-7/Gold Card, government URLs). If no country detected, proceed without country-specific notes.
4. Run the **Preparation** preamble (identify countries, pre-load government URLs, initialize fetched-pages tracker and tool budget)
5. Run the full **5-step protocol** (Steps 1-5) on the parsed content
6. Output the standard **Fact-Check Report** (see SKILL_fact-checker.md Output Format section)

## Differences from Blog Pipeline

This command runs the fact-checker skill directly. It does NOT run:

- Quality-gate Layers 2-5 (SEO density, anti-AI, legal compliance, voice)
- Blog-specific context (category, cover image, word count targets)
- SEO engine, blog-voice, or legal-bright-lines skills

Country is auto-detected from content instead of being passed from blog metadata.
Report format is identical to blog pipeline output.
