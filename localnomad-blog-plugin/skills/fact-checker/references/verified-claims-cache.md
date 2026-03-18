# Verified Claims Cache

Last updated: 2026-03-14
Seed method: All entries verified via firecrawl_scrape against listed Source URLs on 2026-03-14.

Check this cache in Step 2 before any web lookup. If a claim matches an entry and the cache is not stale (current date < Next Review), skip web verification and use the cached value. If stale, re-verify via web and update this file.

## How to Use

1. During Step 2 (Source Discovery), check this table BEFORE calling Firecrawl
2. If claim matches a cached entry AND current date < Next Review → use cached value, skip web lookup
3. If current date ≥ Next Review → re-verify via web, then update this file with new values
4. After any fact-check run that discovers new volatile data points, add them here
5. Cache entries MUST use Tier 1 or Tier 2 sources only. Tier 3 sources are not cacheable.
6. New cache entries MUST include Status column (CURRENT/ANNOUNCED/PROPOSED/DISCONTINUED).
7. When re-verifying a stale entry, also re-check its Status — a PROPOSED regulation may have become CURRENT since last verification.

---

## Korea

| Claim | Verified Value | Source URL | Verified Date | Volatility | Next Review | Status |
|-------|---------------|-----------|--------------|-----------|-------------|--------|
| F-1-D income threshold | ~₩100M (2x GNI per capita of ₩49,955,000) | https://www.visa.go.kr/openPage.do?LLANG=EN&MENU_ID=10105 | 2026-03-14 | Annual (Apr 1) | 2026-03-31 | CURRENT |
| F-1-D health insurance minimum | ₩100M coverage | https://www.immigration.go.kr/bbs/immigration_eng/229/464290/download.do | 2026-03-14 | Rare | 2026-09-14 | CURRENT |
| F-1-D duration | 1 year initial + 1 year renewal (2 years max) | https://www.immigration.go.kr/bbs/immigration_eng/229/464290/download.do | 2026-03-14 | Rare | 2026-09-14 | CURRENT |
| F-1-D visa application form (overseas) | Form No. 17 / 사증발급신청서 | https://www.visa.go.kr/downfile/VisaapplicationForm_EN.pdf | 2026-03-14 | Rare | 2027-03-14 | CURRENT |
| F-1-D visa application form (in-country) | Form No. 34 / 통합신청서 | https://www.law.go.kr/LSW/flDownload.do?flSeq=79000885 | 2026-03-14 | Rare | 2027-03-14 | CURRENT |
| GNI update cycle | Updates every April 1 based on previous year's GNI | https://www.moef.go.kr/ | 2026-03-14 | Fixed cycle | 2026-03-31 | CURRENT |
| NHIS enrollment (F-1-D) | Mandatory after 6 months of stay | https://www.nhis.or.kr/english/ | 2026-03-14 | Rare | 2026-09-14 | CURRENT |
| Korea tax treaty count | ~97 countries | https://www.nts.go.kr/ | 2026-03-14 | Annual | 2027-01-01 | CURRENT |
| Korea local income tax | 10% of national PIT | https://www.nts.go.kr/ | 2026-03-14 | Rare | 2027-03-14 | CURRENT |

## Japan

| Claim | Verified Value | Source URL | Verified Date | Volatility | Next Review | Status |
|-------|---------------|-----------|--------------|-----------|-------------|--------|
| DN visa income requirement | ¥10M/year (~$68K) | https://www.moj.go.jp/isa/applications/status/designatedactivities53_00001.html | 2026-03-14 | Rare | 2026-09-14 | CURRENT |
| DN visa duration | 6 months, non-renewable | https://www.moj.go.jp/isa/applications/status/designatedactivities53_00001.html | 2026-03-14 | Rare | 2026-09-14 | CURRENT |
| DN visa insurance requirement | ¥10M medical coverage (DN visa only, not tourist) | https://www.moj.go.jp/isa/applications/status/designatedactivities53_00001.html | 2026-03-14 | Rare | 2026-09-14 | CURRENT |
| DN visa — no Residence Card | DN visa holders do NOT receive Residence Card, cannot do ward registration | https://www.moj.go.jp/isa/applications/status/designatedactivities53_00001.html | 2026-03-14 | Rare | 2026-09-14 | CURRENT |
| Seishun 18 Kippu | ¥10,000 (3 consecutive days) or ¥12,050 (5 consecutive days); no group sharing since Oct 2024 | https://www.japan-guide.com/e/e2362.html | 2026-03-14 | Seasonal | 2026-07-01 | CURRENT |
| NTT East max residential speed | 10Gbps (FLET'S Hikari Cross); 25Gbps launching Mar 31, 2026 in central Tokyo only | https://www.ntt-east.co.jp/release/detail/20251223_01.html | 2026-03-14 | Event-based | 2026-04-15 | ANNOUNCED |

## Taiwan

| Claim | Verified Value | Source URL | Verified Date | Volatility | Next Review | Status |
|-------|---------------|-----------|--------------|-----------|-------------|--------|
| Gold Card NHI | Day one if employed or self-employed in Taiwan (employment or 6-month residence required under NHI Act) | https://goldcard.nat.gov.tw/en/ | 2026-03-14 | Rare | 2026-09-14 | CURRENT |
| Gold Card PR fast-track | 1 year for NT$6M+ earners (since Jan 2026) | https://goldcard.nat.gov.tw/en/tags/aprc/ | 2026-03-14 | Rare | 2026-09-14 | CURRENT |
| DN Visa income requirement | $40K/yr (age 30+) or $20K/yr (age 20-29) | https://digitalnomad.ndc.gov.tw | 2026-03-14 | Rare | 2026-09-14 | CURRENT |
| Taiwan labor pension (Gold Card) | Employer contributes 6%; employee may voluntarily contribute up to 6% | https://goldcard.nat.gov.tw/en/ | 2026-03-14 | Rare | 2026-09-14 | CURRENT |
| Gold Card application fee | NT$3,700–NT$9,790 (~USD $115–305), varies by nationality and permit duration | https://goldcard.nat.gov.tw/en/ | 2026-03-18 | Rare | 2026-09-18 | CURRENT |
| NHI monthly premium (Gold Card, employed) | ~NT$1,500/month | https://www.nhi.gov.tw | 2026-03-18 | Annual | 2027-03-18 | CURRENT |

## China

| Claim | Verified Value | Source URL | Verified Date | Volatility | Next Review | Status |
|-------|---------------|-----------|--------------|-----------|-------------|--------|
| WeChat Pay limits (unverified foreign card) | ¥6,000/transaction, ¥50,000/month, ¥60,000/year | https://www.tencent.com/en-us/articles/2201831.html | 2026-03-14 | Changed multiple times 2023-2025 | 2026-06-14 | CURRENT |
| Alipay foreign card limits (verified, ID registered) | $5,000 USD/transaction, $50,000 USD/year | https://english.www.gov.cn/news/202403/01/content_WS65e1dacdc6d0868f4e8e487b.html | 2026-03-18 | Rare | 2026-09-18 | CURRENT |
| Alipay foreign card limits (unverified, no ID) | $500 USD/transaction, $2,000 USD/year | https://english.www.gov.cn/news/202403/01/content_WS65e1dacdc6d0868f4e8e487b.html | 2026-03-18 | Rare | 2026-09-18 | CURRENT |
