---
name: fact-checker
description: Verify factual claims in LocalNomad blog posts against government sources and established media. Designed for East Asian immigration/visa content. Called by quality-gate Layer 1.
---

# Fact-Checker — LocalNomad Blog

## Purpose

Verify every factual claim in a blog post before publication. Optimized for Korean and East Asian immigration/visa content. Output a structured verification report that quality-gate Layer 1 consumes.

## When This Skill Runs

Called by `quality-gate` Layer 1 during STAGE 4 of the `/blog` pipeline. Can also be invoked standalone via `/fact-check`.

## Tools Available

**Primary (Firecrawl MCP — hard dependency, installed)**:
- `firecrawl_search` — web search for source discovery (use when target URL is unknown)
- `firecrawl_scrape` — scrape a specific URL (use when exact URL is known)
- `firecrawl_extract` — extract structured data with a JSON schema (use for tables, lists, fee schedules)

**Fallback (only if Firecrawl is down)**:
- `WebSearch` — web search
- `WebFetch` — fetch specific URLs

If all tools unavailable, mark every claim as UNVERIFIABLE with reason "no web access".

---

## Preparation (MUST complete before Step 1)

Before extracting claims, prepare the verification environment:

1. **Identify target countries** mentioned in the post (scan for country names, visa types, government URLs)
2. **Pre-load government source URLs** from `references/government-sources.md` for each identified country
3. **Initialize fetched-pages tracker** — empty table to record every URL fetched during this run:

| # | URL | Tool Used | Content Summary | Claims Verified Against |
|---|-----|-----------|-----------------|------------------------|

4. **Initialize tool budget counter** — starts at 0 for each: search calls, scrape calls, extract calls

### Preparation Gate

- [ ] Target countries identified (≥1)
- [ ] Government source URLs loaded for each country
- [ ] Fetched-pages tracker initialized (empty table present)
- [ ] Tool budget counters at 0/0/0

MUST NOT proceed to Step 1 until all gates pass.

---

## 5-Step Verification Protocol

### Step 1: Extract Claims

Read the full post. MUST extract every verifiable factual claim into the table below. Prose summaries are NOT acceptable.

**Claim types**:

| Type | Definition | Example |
|------|-----------|---------|
| A — Stat | Number, percentage, date, amount | "Korea's birth rate hit 0.72 in 2023" |
| B — Requirement | Visa rule, eligibility, process step | "K-STAR requires a master's or PhD" |
| C — Process | How-to, timeline, sequence of steps | "Apply through HiKorea, then visit immigration office" |
| D — Policy | Government program, law, regulation | "K-STAR expanded from 5 to 32 universities in Dec 2025" |
| E — Attribution | Quote or claim attributed to a source | "According to Korea Times, the program targets 400-600 per year" |

**Mandatory claims table** — every row MUST have all columns filled:

| # | Claim Text | Type | Section | Priority | Target Domain |
|---|-----------|------|---------|----------|---------------|
| 1 | [exact text from post] | A-E | [section heading] | Critical/Standard | [likely verification domain] |

- **Priority**: Critical = Type B or D claims. Standard = Type A, C, or E claims.
- **Target Domain**: The government/media domain most likely to verify this claim (enables domain batching in Step 2).

### Step 1 Completion Gate

- [ ] Claims table has ≥1 row
- [ ] Every row has all 6 columns filled (no blanks)
- [ ] All Type B and D claims marked as Critical priority
- [ ] Target Domain column populated for every row

MUST NOT proceed to Step 2 until all gates pass.

### Step 2: Source Discovery

#### Firecrawl Tool Context Optimization

**Tool selection (MUST follow this order for every claim):**

1. **Check fetched-pages tracker** — if URL (or same domain+path) already fetched, reuse content. STOP.
2. **Known government URL** (listed in government-sources.md) → `firecrawl_scrape` directly. No search needed.
3. **Unknown source needed** → `firecrawl_search` to discover the right page first.
4. **Structured data** (tables, fee schedules, requirement lists) → `firecrawl_extract` with JSON schema.

**Cost-aware batching rules:**

- Group claims by Target Domain from Step 1 → single `firecrawl_scrape` per domain, verify multiple claims from one fetch
- Prefer `firecrawl_scrape` over `firecrawl_search` when exact URL is known (cheaper, faster, more precise)
- Use `firecrawl_search` only for source discovery, never for pages already in government-sources.md
- Track every call in the fetched-pages tracker immediately after execution

**Fallback (Firecrawl down):** Use `WebSearch` / `WebFetch` with the same batching logic. If all tools unavailable → mark all remaining claims UNVERIFIABLE with reason "no web access".

#### Source Priority (try in this order)

1. **Tier 1 — Government/Official**: See `references/government-sources.md`. Mandatory for Type B and D claims.
2. **Tier 2 — Established Media**: Korea Times, Korea Herald, Japan Times, Taipei Times, Reuters, AP, OECD, World Bank, IOM, academic papers.
3. **Tier 3 — Community/Expert**: Verified expat forums, established immigration blogs, immigration lawyer commentary.

#### Abort Condition

If a claim cannot be sourced after 3 search attempts AND the fetched-pages tracker has been checked for existing relevant content → mark as UNVERIFIABLE. MUST document the 3 search queries attempted.

### Step 2 Completion Gate

- [ ] Every claim has a source URL, or is marked UNVERIFIABLE with documented search attempts
- [ ] All Type B and D claims have a Tier 1 source, or are flagged CRITICAL
- [ ] Fetched-pages tracker is updated with every URL fetched
- [ ] No redundant fetches (same URL fetched twice)

MUST NOT proceed to Step 3 until all gates pass.

### Step 3: URL Verification (5-Point Check)

For each source URL found, MUST verify all 5 points:

1. **Domain authenticity**: Real government/media domain? (Not lookalike, mirror, or aggregator)
2. **Content match**: Page actually contains the claimed information? (MUST scrape and confirm — URL alone is not enough)
3. **Date freshness**: When was this page last updated? (Apply freshness rules in Step 4)
4. **Specificity**: Exact page with the claim, not a domain homepage? (Homepage alone = FAIL)
5. **Accessibility**: URL reachable? (If behind paywall/login, note it)

**Red flags** (automatic FAIL for that source):
- Domain does not match the claimed organization
- Scraped content does not contain the claimed information
- URL redirects to a different domain than expected
- Page is cached/archived version without notation
- Page content contradicts the claim

#### Abort Condition

If a URL fails the 5-point check, MUST document which specific check(s) failed (by number) and whether a fallback source exists. If no fallback → mark claim as UNVERIFIABLE.

### Step 3 Completion Gate

- [ ] Every source URL has passed or failed the 5-point check (no unchecked URLs)
- [ ] Failed URLs have the specific failing check number(s) documented
- [ ] Claims with failed URLs have a fallback source or are marked UNVERIFIABLE

MUST NOT proceed to Step 4 until all gates pass.

### Step 4: Freshness Assessment

| Content Type | Max Age | If Older |
|-------------|---------|----------|
| Visa requirements (Type B) | 6 months | Re-verify with current Tier 1. If confirmed unchanged, add "as of [date]" |
| Policy/program details (Type D) | 6 months | Same as above |
| Statistics (Type A) | 12 months | MUST have "as of [date]" qualifier in post |
| Processes (Type C) | 12 months | Re-verify steps have not changed |
| Historical facts | No limit | N/A |

#### Abort Condition

If a source's publication date cannot be determined, MUST note "date unknown" and treat the claim as requiring "as of" qualification in the post.

### Step 4 Completion Gate

- [ ] Every verified source has a date assessment (date found, or "date unknown")
- [ ] All sources exceeding max age have been re-verified or flagged
- [ ] Claims requiring "as of [date]" qualifiers are documented

MUST NOT proceed to Step 5 until all gates pass.

### Step 5: Critical Nuance Check

After verifying individual claims, check for **context errors** — claims that are technically true but misleading:

- **Omitted conditions**: "You get F-2 on graduation" — true, but only with university president's recommendation
- **Outdated framing**: Describing a 2023 pilot as if it's current without noting 2025/2026 expansion
- **Comparison gaps**: Comparing two programs without noting they serve different audiences
- **Jurisdiction confusion**: Applying Korea rules to Taiwan or vice versa
- **Internal contradictions**: Two statements in the same post that conflict with each other

#### Abort Condition

If a nuance check reveals a context error, MUST classify severity (CRITICAL/MODERATE/LOW using Error Severity Triage below) and document the specific misleading framing.

### Step 5 Completion Gate

- [ ] All 5 nuance categories checked (omitted conditions, outdated framing, comparison gaps, jurisdiction confusion, internal contradictions)
- [ ] Every context error found has severity classification and specific description
- [ ] Taiwan content checked for prohibited eligibility language (legal-bright-lines)

---

## East Asian Government Source Handling

### Special Considerations

1. **Bilingual pages**: Many government sites have Korean/Japanese/Chinese pages with more detail than English pages. Note when English version is less complete.
2. **PDF-heavy sites**: Korean and Japanese government sites often publish rules as PDF attachments. Note the PDF filename and page number.
3. **Announcement-based updates**: Policy changes often appear as press releases before the main page is updated. Official government press releases count as Tier 1.
4. **Law database citations**: When citing law.go.kr (Korea) or law.moj.gov.tw (Taiwan), include the specific act name and article number, not just the database URL.
5. **HiKorea vs immigration.go.kr**: HiKorea = service portal (applications), immigration.go.kr = information portal (rules). Both Tier 1, but immigration.go.kr is better for policy citations.

### Country-Specific Verification Notes

**Korea**:
- Immigration rules change frequently. Always check immigration.go.kr announcement section for recent changes.
- K-STAR, Top-Tier, and other programs are announced via MOJ press releases — these count as Tier 1.
- law.go.kr has English translations of the Immigration Control Act.
- E-7, F-2, F-5 visa categories: verify the specific sub-category codes (e.g., F-2-7, F-2-T).

**Japan**:
- ISA (isa.go.jp) = residence status. MOFA (mofa.go.jp) = visa issuance at embassies.
- Digital Nomad Visa is "Designated Activities (Notification 53)" — use this official name.
- japaneselawtranslation.go.jp has official English translations.
- SSW portal: ssw.go.jp.

**Taiwan**:
- NIA (immigration.gov.tw) = residence. BOCA (boca.gov.tw) = entry visas.
- Gold Card portal (goldcard.nat.gov.tw) is authoritative for Gold Card specifics.
- law.moj.gov.tw has the Immigration Act in English — cite specific article numbers.
- **Legal requirement**: Taiwan content MUST NOT use eligibility language ("you qualify", "you are eligible").

**China**:
- NIA (nia.gov.cn) — English at en.nia.gov.cn
- COVA system (consular.mfa.gov.cn/VISA/) launched Sep 2025 for online visa applications
- Policy changes announced through NIA official channels

**SEA Countries**:
- Thailand: immigration.go.th + thaievisa.go.th
- Vietnam: immigration.gov.vn + evisa.gov.vn
- Indonesia: imigrasi.go.id + evisa.imigrasi.go.id
- Malaysia: imi.gov.my + malaysiavisa.imi.gov.my
- Singapore: ica.gov.sg
- Philippines: immigration.gov.ph

---

## Error Severity Triage

When a claim fails verification, classify the error:

### CRITICAL (MUST fix before publication)
- Visa requirement is wrong (Type B claim fails)
- Government program details are incorrect (Type D claim fails)
- Internal contradiction found
- Claim directly contradicts a Tier 1 source
- Legal bright line violation (e.g., "you qualify" language for Taiwan)

### MODERATE (fix recommended, can publish with correction note)
- Statistic is outdated but directionally correct (e.g., birth rate from 2022 instead of 2023)
- Process step is slightly different from current official process
- Source is Tier 2 when Tier 1 exists but says the same thing

### LOW (flag for review, does not block publication)
- Source URL is correct but page has moved (redirect works)
- Tier 3 source only, but claim is non-critical context
- Date qualifier missing but claim is clearly historical

### UNVERIFIABLE (requires manual action)
- No source found after 3 search attempts
- Source is behind paywall/login
- Government page exists but is in non-English language only and content cannot be confirmed
- Conflicting sources at same tier level

---

## Output Format

Return a structured report that quality-gate Layer 1 can consume:

```
=== FACT-CHECK REPORT ===

Post: [title]
Date checked: [date]
Claims found: [N]
Verified: [N] | Failed: [N] | Unverifiable: [N]
Tool budget used: search=[N] | scrape=[N] | extract=[N]

--- CRITICAL ISSUES ---
[list each critical issue with claim text, expected source, what was found]

--- MODERATE ISSUES ---
[list each moderate issue]

--- LOW ISSUES ---
[list each low issue]

--- UNVERIFIABLE CLAIMS ---
[list each with reason and search queries attempted]

--- SOURCE TABLE ---
| # | Claim | Type | Source | Tier | Date | URL | Status |
|---|-------|------|--------|------|------|-----|--------|
| 1 | [claim text] | A/B/C/D/E | [source name] | 1/2/3 | [date] | [full URL] | VERIFIED/FAILED/UNVERIFIED |
...

--- CONTEXT CHECKS ---
[ ] No omitted conditions
[ ] No outdated framing
[ ] No comparison gaps
[ ] No jurisdiction confusion
[ ] No internal contradictions

--- FETCHED-PAGES TRACKER ---
| # | URL | Tool Used | Content Summary | Claims Verified Against |
|---|-----|-----------|-----------------|------------------------|
...

RESULT: PASS / FAIL (CRITICAL) / FAIL (MODERATE) / NEEDS REVIEW
```

**Important**:
- Source Table URLs MUST be **specific pages**, not domain homepages. `immigration.go.kr` alone = FAIL. MUST be the actual page URL.
- If exact URL cannot be retrieved, write: `[domain] — specific page not retrievable, manual verification required`
- Every Type B and Type D claim MUST have a Tier 1 source or be flagged as CRITICAL.
