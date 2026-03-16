# Blog Source Gap Analysis — Stage 3 Cross-Reference Report

**Generated:** 2026-03-14 12:49 UTC

**Scope:** All 28 blog posts in `content/blog/` cross-referenced against 5 government source reference files

---

## [OBJECTIVE]

Identify claims in existing blog posts that are NOT adequately covered by the current Tier-1 government source reference files (`government-sources-korea.md`, `-japan.md`, `-taiwan.md`, `-sea.md`, `-global.md`).

## [DATA]

**Blog posts analyzed:** 28 MDX files across 6 categories (comparisons, guides, news, tips, updates, stories)

**Source reference files:** 5 files covering Korea (13 sources), Japan (10 sources), Taiwan (12 sources), SEA/China (~20 sources)

**Analysis method:** Manual content analysis + pattern grep across all posts for: health insurance, tax rates, demographic statistics, broadband claims, labor law, pension, financial regulation

## [FINDING] Total gaps identified: 28 across 5 country groups

[STAT:n] n = 28 blog posts reviewed; 28 distinct source gaps catalogued

[STAT:effect_size] 25 of 28 gaps (89%) involve source domains entirely absent from current reference files

[STAT:n] 13 HIGH severity gaps — claims that could mislead readers if incorrect (health insurance premiums, tax rates, legal claims)

### Gap Count by Country and Severity

| Country | HIGH | MEDIUM | LOW | TOTAL |
|---------|------|--------|-----|-------|
| Korea | 5 | 1 | 1 | 7 |
| Japan | 1 | 2 | 0 | 3 |
| Taiwan | 2 | 3 | 1 | 6 |
| China | 2 | 2 | 1 | 5 |
| Multi-country | 3 | 2 | 2 | 7 |

### Top Gap Categories

| Category | Count | Impact |
|----------|-------|--------|
| Health insurance | 6 | Enrollment rules, wait periods, premium amounts, copay rates — cited in 10+ posts |
| Tax treaty network size | 3 | DTT counts (97 KR / 74 JP / 35 TW) cited in comparison posts |
| Government statistics | 2 | Birth rate / TFR claims — used to justify policy framing |
| Visa policy | 2 | K-STAR, Top-Tier details sourced from Tier-2 (korea.net, news sites) |
| Labor law | 2 | Pension contribution rates, spouse work permit rules |
| Internet speed ranking / broadband statistics | 1 | Korea 'top 3 globally' claim has no citation |
| Labor policy | 1 |  |
| Internet infrastructure | 1 |  |
| Housing law | 1 |  |
| Tax rules | 1 |  |
| Internet speed statistics | 1 |  |
| Demographic statistics | 1 |  |
| Legal claim | 1 | China VPN enforcement absence claim is inherently unsourceable |
| Financial regulation | 1 | PBoC payment limits for WeChat/Alipay foreign cards |
| Financial product | 1 |  |
| Tax rates | 1 |  |
| Exchange rate data source | 1 |  |
| Transit policy | 1 |  |

---

## [FINDING] Critical Missing Domains — 10 Government Sources Absent from All Reference Files

[STAT:n] 10 distinct government domains cited in blog posts but absent from all 5 reference files

| Domain | Country | What It Covers |
|--------|---------|----------------|
| `nhis.or.kr` | Korea | NHIS — National Health Insurance Service (foreign subscriber rules, premiums, copays) |
| `nta.go.jp` | Japan | NTA — National Tax Agency (non-resident tax rates, withholding, PE rules) |
| `mof.gov.tw` | Taiwan | MOF — Ministry of Finance (tax treaty list, income tax rules) |
| `nhi.gov.tw` | Taiwan | NHIA — National Health Insurance Administration (enrollment rules, premiums, coverage stats) |
| `mof.go.jp` | Japan | MOF — Ministry of Finance (tax treaty count, tax policy) |
| `mlit.go.jp` | Japan | MLIT — Ministry of Land, Infrastructure, Transport and Tourism (minpaku/housing law) |
| `kostat.go.kr` | Korea | Statistics Korea — birth rate, TFR, demographic data (official statistical agency) |
| `moel.go.kr` | Korea | MOEL — Ministry of Employment and Labor (wage floors, worker quotas, K-Core) |
| `bli.gov.tw` | Taiwan | BLI — Bureau of Labor Insurance (labor pension rates, Labor Pension Act) |
| `pbc.gov.cn` | China | PBoC — People's Bank of China (foreign payment card limits, payment regulations) |
| `mol.gov.tw` | Taiwan | MOL — Ministry of Labor (spouse work permit issuance rules) |
| `stats.gov.cn` | China | NBS — National Bureau of Statistics of China (demographic/population data) |

---

## Detailed Gap Inventory

### Korea (7 gaps)

**[HIGH]** `content/blog/comparisons/korea-k-star-visa-stem-fast-track-2026.mdx`
- **Claim:** Korea's birth rate hit 0.72 in 2023 (lowest in the OECD), ticked up to 0.74 in 2024
- **Type:** Government statistics — birth rate / demographic data
- **Source cited in post:** korea.net/NewsFocus/Society/view?articleId=267262
- **Needed source:** Statistics Korea (kostat.go.kr) — official birth rate / TFR data; or OECD Family Database
- **In reference files:** No
- **Notes:** korea.net is a government PR site, not the authoritative statistical source. kostat.go.kr is missing from all reference files.

**[HIGH]** `content/blog/news/korea-2026-immigration-overhaul.mdx`
- **Claim:** Korea's birth rate hit 0.72 in 2023 — dead last in the OECD. 89 municipalities classified as depopulation zones (인구소멸지역).
- **Type:** Government statistics — birth rate / demographic data
- **Source cited in post:** None (no source URL linked for this specific stat)
- **Needed source:** Statistics Korea (kostat.go.kr); Ministry of the Interior population decline designation list
- **In reference files:** No
- **Notes:** Key policy justification claim (0.72 TFR, 89 depopulation zones) has no Tier-1 citation in this post. kostat.go.kr not in reference files.

**[HIGH]** `content/blog/guides/korea-ultimate-digital-nomad-guide.mdx`
- **Claim:** F-1-D holders must enroll in NHIS after 6 months; cost ~₩150,000/month covering 70% of clinic costs
- **Type:** Health insurance — enrollment rules, wait period, coverage rates
- **Source cited in post:** None in this post (NHIS link not provided here)
- **Needed source:** nhis.or.kr — NHIS foreign subscriber enrollment rules
- **In reference files:** No
- **Notes:** Specific enrollment timeline (6 months), premium (~₩150K), and coverage ratios (70%) need NHIS Tier-1 backing. nhis.or.kr absent from reference files.

**[HIGH]** `content/blog/guides/korea-f1d-workation-visa-2026.mdx`
- **Claim:** NHIS premium ~₩150K-300K depending on income; 6.5% of income formula
- **Type:** Health insurance — premium calculation method
- **Source cited in post:** None
- **Needed source:** nhis.or.kr — NHIS premium calculation for foreign regional subscribers
- **In reference files:** No
- **Notes:** Specific premium calculation formula (6.5% of income) requires NHIS official documentation.

**[HIGH]** `content/blog/news/korea-2026-immigration-overhaul.mdx`
- **Claim:** K-Core salary floor: ₩3.2–3.8M/month; E-9 quota drops from 130,000 to 80,000 in 2026
- **Type:** Labor policy — wage floors and worker quotas
- **Source cited in post:** None (only MOJ press release mentioned generically)
- **Needed source:** Ministry of Justice press release URL; Ministry of Employment and Labor (moel.go.kr) for wage floors
- **In reference files:** No
- **Notes:** Specific E-9 quota numbers (130K→80K) and K-Core salary floors (₩3.2–3.8M) need MOJ press release URL. moel.go.kr not in any reference file.

**[MEDIUM]** `content/blog/comparisons/korea-k-star-visa-stem-fast-track-2026.mdx`
- **Claim:** Top-Tier Visa: income ≥3× GNI; launched April 2025
- **Type:** Visa policy — Top-Tier visa eligibility
- **Source cited in post:** korea.net/NewsFocus/policies/view?articleId=269172 and Korea Times
- **Needed source:** MOJ press release at immigration.go.kr for Top-Tier Visa announcement
- **In reference files:** No
- **Notes:** Both sources cited are Tier 2. Top-Tier visa announcement should be backed by immigration.go.kr official announcement.

**[LOW]** `content/blog/comparisons/japan-korea-taiwan-digital-nomad-visa-2026.mdx`
- **Claim:** Korea has tax treaties with ~97 countries
- **Type:** Tax treaty network size
- **Source cited in post:** taxlaw.nts.go.kr/st/USESTC001M.do (inline link text only, no explicit label)
- **Needed source:** nts.go.kr is already in reference files
- **In reference files:** Yes
- **Notes:** Source is valid Tier-1 but not explicitly listed in the Korea reference file under 'tax treaties'. The taxlaw.nts.go.kr subdomain should be added.

### Japan (3 gaps)

**[HIGH]** `content/blog/guides/japan-ultimate-digital-nomad-guide.mdx`
- **Claim:** NHI costs ¥33,000–78,000/month depending on declared income and municipality
- **Type:** Health insurance — NHI premium calculation
- **Source cited in post:** None
- **Needed source:** Ministry of Health, Labour and Welfare (mhlw.go.jp) or ward-level NHI calculators
- **In reference files:** No
- **Notes:** mhlw.go.jp is completely absent from government-sources-japan.md. NHI enrollment obligation (3+ months) and premium ranges lack Tier-1 sourcing.

**[MEDIUM]** `content/blog/guides/japan-ultimate-digital-nomad-guide.mdx`
- **Claim:** NTT East launching 25 Gbps fiber in Tokyo on March 31, 2026 at ¥27,500/month
- **Type:** Internet infrastructure — broadband service
- **Source cited in post:** None
- **Needed source:** NTT East press release or Ministry of Internal Affairs (soumu.go.jp) broadband statistics
- **In reference files:** No
- **Notes:** Specific product launch claim (NTT East 25Gbps, date, price) needs primary source. soumu.go.jp missing from Japan reference files.

**[MEDIUM]** `content/blog/guides/japan-housing-digital-nomads-2026.mdx`
- **Claim:** Japan's minpaku law caps each registered property at 180 operating days/year; Japan Tourism Agency enforces this
- **Type:** Housing law — minpaku (民泊) regulation
- **Source cited in post:** Japan Tourism Agency (mlit.go.jp/kankocho/minpaku/)
- **Needed source:** mlit.go.jp should be added to Japan reference files
- **In reference files:** No
- **Notes:** mlit.go.jp (Ministry of Land, Infrastructure, Transport and Tourism) cited for minpaku law but absent from government-sources-japan.md.

### Taiwan (6 gaps)

**[HIGH]** `content/blog/tips/taiwan-gold-card-vs-dn-visa-2026.mdx`
- **Claim:** NHI costs ~NT$1,500/month; copay for a doctor visit about NT$100
- **Type:** Health insurance — NHI premium and copay rates
- **Source cited in post:** None
- **Needed source:** National Health Insurance Administration (nhi.gov.tw) — premium tables and copay schedules
- **In reference files:** No
- **Notes:** nhi.gov.tw (Taiwan's NHIA) is completely absent from government-sources-taiwan.md. Multiple posts cite NHI enrollment rules, premiums, and copays with no Tier-1 backing.

**[HIGH]** `content/blog/news/taiwan-gold-card-2026-changes.mdx`
- **Claim:** Employer contributes 6% of monthly salary to labor pension from day one of employment
- **Type:** Labor law — pension contribution rates
- **Source cited in post:** None
- **Needed source:** Bureau of Labor Insurance (bli.gov.tw) or Labor Pension Act (law.moj.gov.tw)
- **In reference files:** No
- **Notes:** Pension contribution rate (6%) needs Labor Pension Act citation. bli.gov.tw (Bureau of Labor Insurance) absent from Taiwan reference files. law.moj.gov.tw is listed but no pension law article cited.

**[MEDIUM]** `content/blog/guides/taiwan-ultimate-digital-nomad-guide.mdx`
- **Claim:** Taiwan's National Health Insurance covers 99.9% of the population
- **Type:** Health insurance — population coverage rate
- **Source cited in post:** None
- **Needed source:** nhi.gov.tw or MOHW (mohw.gov.tw) — NHI coverage statistics
- **In reference files:** No
- **Notes:** 99.9% coverage claim is a significant statistic with no citation. nhi.gov.tw and mohw.gov.tw absent from Taiwan reference files.

**[MEDIUM]** `content/blog/guides/taiwan-ultimate-digital-nomad-guide.mdx`
- **Claim:** Fixed broadband averages 217 Mbps (Ookla Speedtest Global Index); mobile averages 82 Mbps
- **Type:** Internet speed statistics
- **Source cited in post:** speedtest.net/global-index
- **Needed source:** NCC (ncc.gov.tw) — Taiwan's telecom regulator broadband statistics (Tier 1)
- **In reference files:** No
- **Notes:** Ookla is Tier 2. Taiwan's NCC publishes official broadband statistics but is absent from all reference files.

**[MEDIUM]** `content/blog/tips/taiwan-gold-card-vs-dn-visa-2026.mdx`
- **Claim:** Taiwan's Ministry of Labor (MOL) grants open work permits to Gold Card spouses post-2026
- **Type:** Labor law — spouse work permit rules
- **Source cited in post:** goldcard.nat.gov.tw/en/
- **Needed source:** wda.gov.tw (Workforce Development Agency) or mol.gov.tw (Ministry of Labor) for work permit issuance rules
- **In reference files:** No
- **Notes:** Gold Card portal cites MOL as the issuing authority for spouse work permits, but mol.gov.tw is absent from Taiwan reference files.

**[LOW]** `content/blog/guides/taiwan-ultimate-digital-nomad-guide.mdx`
- **Claim:** TPASS monthly pass: NT$1,200/month covers unlimited MRT + bus across Taipei, New Taipei, Keelung, Taoyuan
- **Type:** Transit policy — pass coverage and pricing
- **Source cited in post:** None
- **Needed source:** MOTC (motc.gov.tw) or Taipei City Government transport authority
- **In reference files:** No
- **Notes:** TPASS is a government transit pass. Its price and coverage need a government source citation. motc.gov.tw absent from Taiwan reference files.

### China (5 gaps)

**[HIGH]** `content/blog/guides/china-ultimate-digital-nomad-guide.mdx`
- **Claim:** VPN use: 'no foreigner has been prosecuted for personal VPN use' under China's Cybersecurity Law
- **Type:** Legal claim — enforcement history
- **Source cited in post:** None
- **Needed source:** No government source can confirm absence of enforcement. This claim is inherently un-sourceable at Tier 1.
- **In reference files:** No
- **Notes:** This is an unsourceable legal claim. The Cybersecurity Law (law.npc.gov.cn) should be cited instead with appropriate caveats about enforcement being at government discretion.

**[HIGH]** `content/blog/tips/china-alipay-wechat-pay-foreigner-setup-2026.mdx`
- **Claim:** WeChat Pay caps foreign card at ¥6,000 single transaction / ¥50,000 monthly / ¥60,000 annual
- **Type:** Financial regulation — payment limits
- **Source cited in post:** None
- **Needed source:** People's Bank of China (pbc.gov.cn) regulations on foreign payment card limits
- **In reference files:** No
- **Notes:** pbc.gov.cn (People's Bank of China) is entirely absent from China reference files. Payment limit regulations are set by PBoC, not by Tencent/Alipay. These figures need regulatory sourcing.

**[MEDIUM]** `content/blog/guides/china-ultimate-digital-nomad-guide.mdx`
- **Claim:** Shanghai expat community: '200,000+ visa issuances, not resident population'
- **Type:** Demographic statistics — expat population
- **Source cited in post:** None
- **Needed source:** National Bureau of Statistics of China (stats.gov.cn) or Shanghai Municipal Government statistics
- **In reference files:** No
- **Notes:** stats.gov.cn (China's NSB) is entirely absent from government-sources-sea.md (China section). Population/demographic claims about China have no Tier-1 statistical backing.

**[MEDIUM]** `content/blog/tips/china-alipay-wechat-pay-foreigner-setup-2026.mdx`
- **Claim:** Alipay 180-day TourCard for short-term visitors (no bank account needed)
- **Type:** Financial product — tourist payment card
- **Source cited in post:** None
- **Needed source:** Alipay official documentation or PBOC regulatory approval notice
- **In reference files:** No
- **Notes:** TourCard is an Alipay product feature. pbc.gov.cn oversight context is missing.

**[LOW]** `content/blog/guides/china-ultimate-digital-nomad-guide.mdx`
- **Claim:** 240-hour transit visa exemption: available at 65 ports of entry across 24 provinces (expanded November 2025)
- **Type:** Visa policy — transit exemption scope
- **Source cited in post:** nia.gov.cn/n741440/n741547/c1625657/content.html (inline)
- **Needed source:** nia.gov.cn already in China reference files
- **In reference files:** Yes
- **Notes:** Source cited is Tier 1, but the specific URL path should be added to the China reference files for fact-checker automation.

### Multi-country (7 gaps)

**[HIGH]** `content/blog/comparisons/seoul-vs-tokyo-cost-of-living-2026.mdx`
- **Claim:** NHIS enrollment mandatory for F-1-D holders; minimum contribution ~₩150,000/month
- **Type:** Health insurance — enrollment rules and premium rates
- **Source cited in post:** nhis.or.kr/english/wbheaa02900m01.do
- **Needed source:** nhis.or.kr should be added to Korea reference files
- **In reference files:** No
- **Notes:** NHIS (National Health Insurance Service) is cited in 4+ blog posts but is completely absent from government-sources-korea.md. This is a significant gap for healthcare claims.

**[HIGH]** `content/blog/tips/183-day-tax-trap-digital-nomads.mdx`
- **Claim:** Japan taxes Japanese-source income at 20.42% for non-residents; PE risk for 3+ month same-client engagements
- **Type:** Tax rules — non-resident withholding and PE risk
- **Source cited in post:** nta.go.jp/english/taxes/individual/12006.htm
- **Needed source:** nta.go.jp should be in Japan reference files
- **In reference files:** No
- **Notes:** NTA (National Tax Agency, nta.go.jp) is cited in multiple posts for Japan tax rules but is completely absent from government-sources-japan.md. This is a major gap.

**[HIGH]** `content/blog/tips/183-day-tax-trap-digital-nomads.mdx`
- **Claim:** Taiwan has 35 tax treaties (vs Korea's 97, Japan's 74)
- **Type:** Tax treaty network size
- **Source cited in post:** mof.gov.tw/eng/singlehtml/264?cntId=82780
- **Needed source:** mof.gov.tw (Taiwan Ministry of Finance) should be in Taiwan reference files
- **In reference files:** No
- **Notes:** Taiwan MOF (mof.gov.tw) cited for tax treaties in multiple posts but absent from government-sources-taiwan.md. Tax authority entirely missing from Taiwan reference files.

**[MEDIUM]** `content/blog/comparisons/seoul-vs-tokyo-cost-of-living-2026.mdx`
- **Claim:** Korea consistently ranks in the global top 3 for fixed broadband speed. Fiber is ₩20–30K/month.
- **Type:** Internet speed ranking / broadband statistics
- **Source cited in post:** None for the ranking claim
- **Needed source:** Ookla Speedtest Global Index (speedtest.net/global-index) or NIPA/MSIT Korea broadband statistics
- **In reference files:** No
- **Notes:** The 'top 3 globally' claim has no source. Taiwan guide cites Ookla but Korea guide does not. NIPA/MSIT are missing from Korea reference files.

**[MEDIUM]** `content/blog/comparisons/seoul-vs-tokyo-cost-of-living-2026.mdx`
- **Claim:** Japan has 74 tax treaties (per Japan MOF, as of Dec 2025)
- **Type:** Tax treaty network size
- **Source cited in post:** mof.go.jp/english/policy/tax_policy/tax_conventions/tax_convetion_list_en.html
- **Needed source:** mof.go.jp should be added to Japan reference files
- **In reference files:** No
- **Notes:** Japan's MOF (mof.go.jp) cited for tax treaty count but absent from government-sources-japan.md. NTA (nta.go.jp) also cited but absent.

**[LOW]** `content/blog/tips/183-day-tax-trap-digital-nomads.mdx`
- **Claim:** Korea tax rates: 6–45% progressive + 10% local income surtax (listed as 8 brackets)
- **Type:** Tax rates — income tax brackets
- **Source cited in post:** nts.go.kr/english/cm/cntnts/cntntsView.do?mi=20251&cntntsId=8810
- **Needed source:** nts.go.kr already in Korea reference files
- **In reference files:** Yes
- **Notes:** Properly cited. The specific NTS English guidance page should be added explicitly to the Korea reference files.

**[LOW]** `content/blog/comparisons/seoul-vs-tokyo-cost-of-living-2026.mdx`
- **Claim:** Exchange rate note: USD/KRW and USD/JPY figures use 2025 annual averages via X-Rates
- **Type:** Exchange rate data source
- **Source cited in post:** x-rates.com
- **Needed source:** Bank of Korea (bok.or.kr) or BOJ for official exchange rate data
- **In reference files:** No
- **Notes:** x-rates.com is a Tier 3 commercial site. bok.or.kr and boj.or.jp are absent from reference files. For accuracy, central bank rate data should be preferred.

---

## [FINDING] Highest-Priority Reference File Additions

[STAT:n] 6 domains must be added to close the most HIGH-severity gaps

#### Korea → `government-sources-korea.md`

- `nhis.or.kr/english/` — NHIS foreign subscriber enrollment, premium calculation, coverage ratios — cited in 5+ posts without Tier-1 backing
- `kostat.go.kr` — Statistics Korea — TFR/birth rate claims. Korea.net (currently used) is a PR site, not statistical authority
- `moel.go.kr` — Ministry of Employment and Labor — K-Core salary floors, E-9 quota figures, labor policy

#### Japan → `government-sources-japan.md`

- `nta.go.jp` — National Tax Agency — non-resident tax rules, 20.42% withholding, PE risk. Cited repeatedly but absent from reference file
- `mof.go.jp` — Ministry of Finance — 74 tax treaty count. Cited in comparison posts
- `mlit.go.jp/kankocho/minpaku/` — Japan Tourism Agency — minpaku 180-day cap law
- `mhlw.go.jp` — Ministry of Health Labour and Welfare — NHI enrollment obligation (3-month rule), premium calculation

#### Taiwan → `government-sources-taiwan.md`

- `mof.gov.tw` — Ministry of Finance — 35 tax treaty count, income tax rates, AMT rules for Gold Card holders
- `nhi.gov.tw` — NHIA — NHI enrollment rules (6-month wait for DNV, day-1 for Gold Card), premium NT$1,500/mo, copay rates
- `bli.gov.tw` — Bureau of Labor Insurance — 6% employer pension contribution rate (Labor Pension Act)
- `mol.gov.tw` — Ministry of Labor — spouse open work permit issuance rules

#### China → `government-sources-sea.md (China section)`

- `pbc.gov.cn` — People's Bank of China — payment limits for foreign cards on WeChat Pay and Alipay
- `stats.gov.cn` — National Bureau of Statistics — population/demographic data (replaces unsourced expat count claims)
- `law.npc.gov.cn` — National People's Congress — Cybersecurity Law text (for VPN claim context)

---

## [LIMITATION]

1. **Analysis scope:** Only claims explicitly visible via grep pattern matching and manual reading of MDX content were analyzed. Embedded claims in JSX component props (e.g., table cell values without inline citations) may have been missed.
2. **Source validation:** This analysis identifies whether sources are listed in reference files — not whether the cited URLs are live or accurate. URL validity should be verified separately.
3. **Draft posts excluded from urgency:** 8 of 28 posts are marked `draft: true`. Gaps in draft posts are catalogued but are lower urgency than published posts.
4. **VPN claim unsourceability:** The China VPN enforcement absence claim cannot be resolved by adding a Tier-1 source. This requires editorial decision (removal or reframing), not just a source addition.
5. **Exchange rate/cost data:** Cost-of-living figures (rent ranges, food costs) in several posts are sourced from Tier-2/3 sources (real estate blogs, GaijinPot, 다방). These were not catalogued as gaps unless the claim type was explicitly government-domain (e.g., insurance premiums, legal wage floors).

---

*Report generated by Scientist agent — LocalNomad b2c-website*