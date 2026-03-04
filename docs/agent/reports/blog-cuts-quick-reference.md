# Blog Content Cuts: Quick Reference Table

**Status**: Ready for review and implementation
**Total potential savings**: 1,347 lines / ~8,850 words (20% reduction across all 7 posts)

---

## Quick Cuts by File

### GUIDES (Need Cuts)

| File | Lines | Words | Issue | Recommended Cut | Savings | Link |
|------|-------|-------|-------|-----------------|---------|------|
| **Korea Ultimate Guide** | 1,149 | 7,559 | Verbose city guides, detailed taxes | -26% | ~300 lines / 1,780 words | See detailed analysis |
| **Japan Ultimate Guide** | 1,440 | 8,328 | Verbose city guides, over-explained healthcare | -25% | ~355 lines / 2,290 words | See detailed analysis |
| **Taiwan Ultimate Guide** | 1,132 | 6,867 | Verbose city guides, detailed banking | -20% | ~230 lines / 1,460 words | See detailed analysis |
| **China Ultimate Guide** | 1,973 | 11,324 | **VPN duplication** (196 lines), **Payment duplication** (155 lines), city guides | -26% | ~462 lines / 2,975 words | **PRIORITY** |

### TIPS (Consolidate, Don't Cut)

| File | Lines | Words | Issue | Action | Savings |
|------|-------|-------|-------|--------|---------|
| **China Alipay/WeChat Pay** | 305 | 2,342 | Duplicated in Ultimate Guide | Link from guide instead | +100 lines from guide |
| **China VPN/Great Firewall** | 395 | 2,615 | Duplicated in Ultimate Guide | Link from guide instead | +155 lines from guide |
| **Korea Cards Comparison** | 243 | 1,515 | Good; add cross-link from guide | Cross-link only | None |

---

## The BIG Issue: China Guide Redundancy

### Current State
- Ultimate China Guide: 1,973 lines
  - "Digital Life: Great Firewall" section: 196 lines on VPN
  - "Money Matters: Alipay/WeChat" section: 155 lines on payments
- China VPN Tips Article: 395 lines (COMPLETE coverage)
- China Alipay Tips Article: 305 lines (COMPLETE coverage)

### Problem
The Ultimate China Guide includes ~351 lines of content that are **already** fully covered in dedicated tips articles. This is pure redundancy.

### Solution
- **Cut** 196 lines of VPN content from China guide
- **Cut** 155 lines of Alipay/WeChat content from China guide
- **Replace** with: 40 lines of summary + link to tips articles
- **Net**: Save ~311 lines, force readers to tips articles for full details
- **Benefit**: Single source of truth; easier to maintain

---

## By Issue Type

### 1. CITY/NEIGHBORHOOD SECTIONS (Affects: Korea, Japan, Taiwan, China)

**Current**: All guides have 150–230 lines describing individual cities with:
- Vibe description
- Neighborhood breakdowns (5–10 neighborhoods per city)
- Pricing details
- Digital nomad notes

**Problem**: Becomes stale monthly; belongs in interactive maps or dedicated pages

**Cuts**:
| Guide | Current Lines | Target Lines | Savings |
|-------|---------------|--------------|---------|
| Korea | ~188 lines | ~40 lines | ~148 lines |
| Japan | ~218 lines | ~40 lines | ~178 lines |
| Taiwan | ~159 lines | ~35 lines | ~124 lines |
| China | ~230 lines | ~50 lines | ~180 lines |
| **TOTAL** | **~795 lines** | **~165 lines** | **~630 lines** |

**Simple approach**: Keep 1–2 sentences per city, add link to dedicated city guide (if it exists) or city comparison page

---

### 2. HEALTHCARE SECTIONS (Affects: Korea, Japan, Taiwan, China)

**Current**: All guides have 100–140 lines with detailed enrollment processes

**Problem**: Over-explains bureaucratic procedures that should be on official health ministry websites

**Cuts**:
| Guide | Current Lines | Target Lines | Savings |
|-------|---------------|--------------|---------|
| Korea | ~109 lines | ~50 lines | ~59 lines |
| Japan | ~136 lines | ~50 lines | ~86 lines |
| Taiwan | ~113 lines | ~50 lines | ~63 lines |
| China | ~68 lines | ~40 lines | ~28 lines |
| **TOTAL** | **~426 lines** | **~190 lines** | **~236 lines** |

**Action**: Keep key points (cost, eligibility, timeline); link to official guides for enrollment steps

---

### 3. BANKING & MONEY SECTIONS (Affects: Korea, Japan, Taiwan, China)

**Current**: All guides explain bank account opening (requires ARC/ID), card setup, remittance

**Problem**: ARC/ID process is already explained in visa guides; banking sections re-explain it

**Cuts**:
| Guide | Current Lines | Target Lines | Savings |
|-------|---------------|--------------|---------|
| Korea | ~110 lines | ~60 lines | ~50 lines |
| Japan | ~108 lines | ~60 lines | ~48 lines |
| Taiwan | ~94 lines | ~50 lines | ~44 lines |
| China | ~155 lines | ~75 lines | ~80 lines |
| **TOTAL** | **~467 lines** | **~245 lines** | **~222 lines** |

**Action**: Consolidate into: "Bank account (link to visa guide for ARC requirements)" + "Cards/Mobile Pay" + "Remittance overview"

---

### 4. TAX & LEGAL SECTIONS (Affects: Korea, Japan; Taiwan has none)

**Current**: Korea and Japan guides have 100–120 line tax sections with:
- 183-day tax residency rule
- Tax brackets and rates
- Double taxation treaty info
- Tax filing procedures

**Problem**: Too detailed for a general guide; belongs in specialized tax guide

**Cuts**:
| Guide | Current Lines | Target Lines | Savings |
|-------|---------------|--------------|---------|
| Korea | ~119 lines | ~40 lines | ~79 lines |
| Japan | ~121 lines | ~40 lines | ~81 lines |
| **TOTAL** | **~240 lines** | **~80 lines** | **~160 lines** |

**Action**: Mention 183-day rule (1 sentence) + link to tax guide; don't explain brackets/double tax treaties

---

## Implementation Priority

### Priority 1 (Do First)
- **China Guide**: Remove VPN duplication (save ~155 lines)
- **China Guide**: Remove Alipay duplication (save ~100 lines)
- **All Guides**: Trim city guides by 60% (save ~630 lines)
- **Benefit**: Quick wins, highest ROI

### Priority 2 (Do Next)
- **All Guides**: Reduce healthcare sections by 40% (save ~236 lines)
- **All Guides**: Reduce banking sections by 45% (save ~222 lines)
- **Benefit**: Medium effort, good cleanup

### Priority 3 (Structural)
- **All Guides**: Reduce tax sections (save ~160 lines)
- **Future**: Create dedicated city/neighborhood pages to replace city guide prose
- **Future**: Create dedicated healthcare guide per country

---

## Before/After Example: China Guide

### BEFORE (City Guides Section)
```
## City Guides: Where to Land

### Shanghai — The Mega-Hub
[60 lines describing: Huangpu/The Bund, Jing'an, Pudong, Longhua, Xujiahui...]
Cost: ¥5,000–15,000/month for 1BR
Vibe: Fast-paced, international, nightlife
Cons: Most expensive, crowded, air quality issues
[Neighborhood breakdowns, cost breakdowns, etc.]

### Beijing — The Power City
[50 lines describing: Chaoyang, Haidian, Xicheng...]
Cost: ¥4,000–12,000/month
[Similar breakdown]

### Shenzhen — The Startup Accelerator
[40 lines...]

[And 2 more cities...]

TOTAL: ~230 lines
```

### AFTER (City Guides Section)
```
## City Guides: Where to Land

**Shanghai** — Mega-hub, expensive (¥5k–15k/mo), fast-paced, international.
[See detailed Shanghai guide →](#)

**Beijing** — Power city, ¥4k–12k/mo, politics and history.
[See detailed Beijing guide →](#)

**Shenzhen** — Startup hub, ¥3.5k–10k/mo, fastest growth.
[See detailed Shenzhen guide →](#)

**Chengdu & Dali** — Cheaper alternatives (¥2.5k–5k/mo) with slower pace.
[See full city comparison →](#)

TOTAL: ~50 lines (78% reduction)
```

---

## Cross-Link Improvements

### From China Ultimate Guide
- Section "Digital Life" → link to **China VPN/Great Firewall Tips Guide** (save 155 lines)
- Section "Money Matters: Payments" → link to **China Alipay/WeChat Pay Tips Guide** (save 100 lines)

### From Korea Ultimate Guide
- Section "City Guides" → link to **Korea City Guides** (if exists) or city-specific pages
- Section "Cards & Payment" → add cross-link to **Korea Cards Comparison Tips** (243 lines)

### All Guides
- Section "Healthcare" → link to dedicated **[Country] Healthcare Guide** (create as needed)
- Section "Banking & Money" → link to dedicated **[Country] Banking Guide** (create as needed)
- Section "Taxes & Legal" → link to dedicated **[Country] Tax Guide** (create as needed)

---

## Estimated Timeline to Implement

| Phase | Tasks | Time | Person |
|-------|-------|------|--------|
| 1 | Review this analysis | 15 min | Gen |
| 2 | Approve cuts & strategy | 30 min | Gen |
| 3 | Implement China guide cuts | 1–2 hrs | Dev/Claude |
| 4 | Implement Korea/Japan/Taiwan cuts | 2–3 hrs | Dev/Claude |
| 5 | Test links & verify flow | 1 hr | Dev/Claude |
| 6 | QA in browser | 1 hr | Gen |
| **TOTAL** | | **5–7 hrs** | |

---

## Files Referenced

**Analysis Document**:
- `/sessions/clever-eloquent-clarke/mnt/b2c-website/docs/agent/reports/blog-content-analysis-2026.md`

**Blog Files to Edit**:
- `/sessions/clever-eloquent-clarke/mnt/b2c-website/content/blog/guides/korea-ultimate-digital-nomad-guide.mdx`
- `/sessions/clever-eloquent-clarke/mnt/b2c-website/content/blog/guides/japan-ultimate-digital-nomad-guide.mdx`
- `/sessions/clever-eloquent-clarke/mnt/b2c-website/content/blog/guides/taiwan-ultimate-digital-nomad-guide.mdx`
- `/sessions/clever-eloquent-clarke/mnt/b2c-website/content/blog/guides/china-ultimate-digital-nomad-guide.mdx`

**Tips Articles (Don't Cut, Just Link)**:
- `/sessions/clever-eloquent-clarke/mnt/b2c-website/content/blog/tips/china-alipay-wechat-pay-foreigner-setup-2026.mdx`
- `/sessions/clever-eloquent-clarke/mnt/b2c-website/content/blog/tips/china-great-firewall-vpn-guide-2026.mdx`
- `/sessions/clever-eloquent-clarke/mnt/b2c-website/content/blog/tips/korea-wowpass-vs-tmoney-vs-cashbee-2026.mdx`

---

**Generated**: March 4, 2026
**Last Updated**: Today
**Status**: Ready for implementation decision
