# Blog Edit Targets: Exact Line Numbers & Content to Cut

This document maps specific line ranges for each cut, making it easy for the editing tool to execute changes.

---

## FILE 1: korea-ultimate-digital-nomad-guide.mdx

**Current**: 1,149 lines | **Target**: 849 lines | **Target Savings**: 300 lines / ~1,780 words

### Cut #1: City Guides Section (Lines 58–245)

**Location**: Lines 58–245 (~188 lines)

**Action**: Replace with condensed version

**Current content**: Detailed neighborhoods for Seoul (~70 lines), Busan (~50 lines), Jeju (~60 lines)

**New content**:
```markdown
## City Guides: Seoul, Busan, Jeju

### Seoul: Digital Nomad Hub
South Korea's capital—expensive (₩1.5M–3M/month for 1BR), fast-paced, excellent coworking, international community. Best neighborhoods for nomads: Gangnam (expensive, upscale), Hongdae (creative, younger), Itaewon (diverse, expat hub).
[See detailed Seoul neighborhoods guide →](#)

### Busan: Beach + Budget
Beach city 3.5 hours south—more affordable (₩800K–1.5M/month), relaxed atmosphere, growing nomad community. Good base for road trips to nearby islands.
[See detailed Busan guide →](#)

### Jeju Island: Tropical Escape
Korea's island retreat—15–20% cheaper than Seoul (₩1.2M–2.2M/month), stunning natural scenery, perfect for short-term stays (1–3 months). Limited coworking; best as seasonal retreat, not permanent base.
```

**Expected new length**: ~40 lines (vs current ~188 lines)

**Edit instructions**:
- Delete lines 58–245
- Insert the replacement text above
- Adjust section numbering if needed

---

### Cut #2: Taxes & Legal Section Trim (Lines 787–905)

**Location**: Lines 787–905 (~119 lines)

**Action**: Condense to summary + links

**Current content**:
- 183-day tax residency rule (~25 lines)
- Tax brackets and rates (~30 lines)
- Double taxation treaties (~15 lines)
- Tax filing procedures (~30 lines)

**New content**:
```markdown
## Taxes & Legal: Residency, Income, Visa Rules

### Tax Residency (183-Day Rule)
If you spend 183+ cumulative days in Korea during a calendar year (Jan–Dec), you're classified as a tax resident. This applies whether you're working for Korean companies or earning remotely from overseas clients.

**Tax rates**: 0% if non-resident, 6–45% progressive if resident.

For full breakdown of tax brackets, filing procedures, and double taxation treaties:
[See Korea Tax Guide →](#)

### Remote Work on Tourist Visa (Legal Gray Area)
Technically permitted but not explicitly legal—you can work for overseas clients, but not for Korean companies. Risk is low for digital nomads. Many DNs do this regularly without issue.

**Not recommended**: Long-term strategy. Use F-1-D visa if staying 6+ months.
```

**Expected new length**: ~25 lines (vs current ~119 lines)

**Edit instructions**:
- Delete lines 787–905
- Insert replacement text above

---

### Cut #3: Healthcare & Insurance Trim (Lines 498–606)

**Location**: Lines 498–606 (~109 lines)

**Action**: Remove process detail, keep key info + links

**Current content**:
- NHIS eligibility and enrollment (~30 lines)
- Healthcare provider tiers (~20 lines)
- Pharmacy details (~15 lines)
- Emergency numbers (~10 lines)

**New content**:
```markdown
## Healthcare & Insurance

### National Health Insurance (NHIS)
**Eligibility**: Residents with ARC (foreign resident card) + 6-month+ stay
**Cost**: ~₩100–150K/month (employer covers 50% if working)
**Coverage**: Most treatments at public hospitals; low copay (₩1,500–10K per visit)
**Process**: Register at local community center (동주민센터) with ARC

For detailed enrollment steps and provider list: [See Korea Healthcare Guide →](#)

### Private Insurance (If Staying < 6 Months)
Get travel health insurance before arriving (covers emergency care, evacuation). Options: World Nomads, SafetyWing, or country-specific expat plans.

### Emergency
**Ambulance**: 911 (English available)
**Hospitals with English**: Seoul Hospital (Seoul), Asan Medical Center (Seoul), Busan Medical Center (Busan)
```

**Expected new length**: ~40 lines (vs current ~109 lines)

**Edit instructions**:
- Delete lines 498–606
- Insert replacement text above

---

### Cut #4: Money Matters Section Trim (Lines 310–419)

**Location**: Lines 310–419 (~110 lines)

**Action**: Remove ARC/ID duplication, trim remittance

**Current content**:
- Opening bank account details (~35 lines with ARC process)
- Card details (~30 lines)
- Remittance methods (~25 lines)

**New content**:
```markdown
## Money Matters: Banking, Cards, Remittance

### Opening a Bank Account
**Eligibility**: Must be in Korea with valid visa + ARC (foreign resident card)
**Process**: Digital; visit bank with ARC and take ~30 minutes
**Required banks**: Kakao Bank, Toss, KB, Shinhan (all work with foreigners)

For step-by-step process: [See Korea Banking Guide →](#)

### Cards & Mobile Pay in Korea
**T-Money or WOWPASS card**: Transit + convenience store payments (buy at airport)
**Credit cards**: Most places accept Visa/Mastercard
**Mobile pay**: Apple Pay, Google Pay, Samsung Pay widely accepted

[Which card fits your trip? See T-Money vs WOWPASS →](/blog/korea-wowpass-vs-tmoney-vs-cashbee-2026)

### Remittance: Getting Money Out of Korea
Easiest: Wise, TransferWise, or bank wire (check fees: typically 1–3%)
```

**Expected new length**: ~35 lines (vs current ~110 lines)

**Edit instructions**:
- Delete lines 310–419
- Insert replacement text above

---

**Total expected cuts**: ~300 lines / ~1,780 words ✅

---

## FILE 2: japan-ultimate-digital-nomad-guide.mdx

**Current**: 1,440 lines | **Target**: 1,085 lines | **Target Savings**: 355 lines / ~2,290 words

### Cut #1: City Guides Section (Lines ~60–278, ~218 lines)

**Action**: Reduce all 4 cities to 2–3 sentences each + links

**Expected new length**: ~40 lines (vs current ~218 lines)

**Suggested content**:
```markdown
## City Guides: Tokyo, Osaka, Fukuoka, Kyoto

**Tokyo** — Capital, expensive (¥120K–200K/month), electric energy, startup scene. [See Tokyo neighborhoods →](#)

**Osaka** — Kansai hub, 30% cheaper than Tokyo (¥80K–140K/month), amazing food, friendly locals. [See Osaka guide →](#)

**Fukuoka** — Rising star, 50% cheaper than Tokyo (¥60K–100K/month, best value + community. [See Fukuoka guide →](#)

**Kyoto** — Culture-focused, temples, slower pace, fewer coworking spaces. Tourist destination; consider short-term visit. [See Kyoto guide →](#)
```

---

### Cut #2: Healthcare & Insurance (Lines ~436–571, ~136 lines)

**Action**: Remove My Number Card duplication and NHI process detail

**Expected new length**: ~50 lines (vs current ~136 lines)

**Suggested content**:
```markdown
## Healthcare & Insurance

### National Health Insurance (NHI)
**Mandatory if**: Staying 3+ months
**Cost**: ¥1,500–2,500/month
**Coverage**: ~70% of treatment costs; low copay (¥200–1,500 per visit)
**Enrollment**: Register at city hall (市役所) with residence registration

[See detailed NHI guide →](#)

### My Number Card (Required for Tax Filing)
You'll need this if staying 6+ months or working. Get at city hall with residence registration.
[Learn more →](#)

### Private Insurance (Alternative for Short-Term)
World Nomads, SafetyWing, or employer plan covers emergencies.

### Healthcare Providers
Most cities have English-speaking clinics. Check [Japan Guide →](#) for Tokyo/Osaka options.
```

---

### Cut #3: Taxes & Legal (Lines ~688–808, ~121 lines)

**Action**: Condense 183-day rule and tax residency explanation

**Expected new length**: ~40 lines (vs current ~121 lines)

**Suggested content**:
```markdown
## Taxes & Legal

### Tax Residency & My Number Card
Spending 183+ days in Japan makes you a tax resident. My Number Card (required for tax ID) is obtained at city hall.

[See Japan Tax Guide →](#) for brackets, filing procedures, and double taxation treaties.

### Working on Tourist Visa (Legal Gray Area)
Technically not allowed but rarely enforced for digital nomads working for overseas clients. Not recommended long-term.

Use Digital Nomad Visa if staying 6+ months.
```

---

### Cut #4: Money Matters (Lines ~261–368, ~108 lines)

**Action**: Reduce banking and remittance detail

**Expected new length**: ~60 lines (vs current ~108 lines)

---

**Total expected cuts**: ~355 lines / ~2,290 words ✅

---

## FILE 3: taiwan-ultimate-digital-nomad-guide.mdx

**Current**: 1,132 lines | **Target**: 902 lines | **Target Savings**: 230 lines / ~1,460 words

### Cut #1: City Guides Section (Lines ~60–218, ~159 lines)

**Action**: Reduce all 5 cities to 1–2 sentences each + links

**Expected new length**: ~35 lines (vs current ~159 lines)

**Suggested content**:
```markdown
## City Guides

**TAIPEI** — Capital, vibrant, ¥20K–40K/month, best for networking. [See guide →](#)

**KAOHSIUNG** — Port city, laid-back, 30% cheaper (¥12K–25K/month), beach culture. [See guide →](#)

**TAICHUNG** — Middle ground, ¥15K–30K/month, balanced cost/vibe. [See guide →](#)

**TAINAN** — Historic, affordable (¥12K–20K/month), slower pace, temples. [See guide →](#)

**HUALIEN** — Mountain escape, nature, ¥12K–22K/month, short-term retreat. [See guide →](#)
```

---

### Cut #2: Healthcare & Insurance (Lines ~363–475, ~113 lines)

**Action**: Remove NHI process detail, condense insurance types

**Expected new length**: ~50 lines (vs current ~113 lines)

---

### Cut #3: Money Matters (Lines ~273–366, ~94 lines)

**Action**: Remove ARC/banking duplication, trim mobile payments

**Expected new length**: ~50 lines (vs current ~94 lines)

---

**Total expected cuts**: ~230 lines / ~1,460 words ✅

---

## FILE 4: china-ultimate-digital-nomad-guide.mdx

**Current**: 1,973 lines | **Target**: 1,511 lines | **Target Savings**: 462 lines / ~2,975 words

### ⚠️ PRIORITY CUT #1: Digital Life / VPN Section (Lines ~333–528, ~196 lines)

**CRITICAL REDUNDANCY**: This section duplicates the dedicated VPN guide entirely

**Action**: DELETE 80% of this section; replace with 40-line summary + link

**Current content**:
- Great Firewall blocklist (~20 lines)
- VPN protocol strategy (~25 lines)
- VPN setup checklist (~40 lines)
- Chinese alternatives (Bilibili, WeChat, etc.) (~60 lines)
- VPN troubleshooting (~30 lines)

**New content**:
```markdown
## Digital Life: Surviving the Great Firewall

China blocks most Western services (Google, WhatsApp, Instagram, Facebook, YouTube, X/Twitter, Telegram).
**This is not optional—you MUST set up before arriving. Setup takes 10 minutes at home; takes weeks or is impossible once in-country.**

### VPN: Non-Negotiable
Use obfuscated VPN (NordVPN, Surfshark, Astrill) with "stealth mode" to bypass Deep Packet Inspection.
Install on ALL devices before departure; test from home.

**Full setup guide, protocol options, and troubleshooting**:
[Surviving China's Great Firewall: Digital Nomad VPN Guide →](/blog/china-great-firewall-vpn-guide-2026)

### Chinese Apps: Your Daily Tools
**Essential**: WeChat (messaging, payments, everything), Alipay (payments), Gaode Maps (navigation)
**Entertainment**: Bilibili (YouTube equivalent), Douyin (TikTok), iQIYI (Netflix equivalent)
**Video**: Teams/Zoom work with VPN; use WeChat for team calls (faster)

[Full Chinese app ecosystem guide →](/blog/[link to detailed guide])
```

**Expected new length**: ~40 lines (vs current ~196 lines)

**Edit instructions**:
- Find line numbers for section "Digital Life: Surviving the Great Firewall"
- Delete ~196 lines (approximately lines 333–528)
- Insert replacement text above

---

### ⚠️ PRIORITY CUT #2: Money Matters / Alipay & WeChat (Lines ~784–938, ~155 lines)

**CRITICAL REDUNDANCY**: This section duplicates the dedicated Alipay/WeChat guide entirely

**Action**: DELETE 70% of this section; replace with 50-line summary + link

**Current content**:
- Why mobile payment is essential (~20 lines)
- Alipay setup steps (~40 lines)
- WeChat Pay setup steps (~35 lines)
- Comparison of limits and fees (~20 lines)
- Common pitfalls (~25 lines)

**New content**:
```markdown
## Money Matters: Banking, Payments, Remittance

### Why Mobile Payment is Essential
China is 99% digital. Alipay and WeChat Pay handle ~90% of transactions. You cannot survive without at least one.
Cash is virtually obsolete. ATMs exist but are increasingly rare.

### Setup Before You Arrive
**This is critical**: Setup takes 10 minutes at home; is impossible once in China (blocked payment processor websites).

**Options**:
1. **Direct card linking**: Link Visa/Mastercard directly to Alipay/WeChat (easiest, works for most people)
2. **TourCard**: Alipay's prepaid card for visitors (backup if direct linking fails; 5% fee)

### Full Setup Guide
[Setting Up Alipay & WeChat Pay as a Foreigner in China (2026) →](/blog/china-alipay-wechat-pay-foreigner-setup-2026)
Includes: Step-by-step setup, fees, limits, common problems, troubleshooting

### Quick Limits Reference
| | Alipay | WeChat Pay |
|---|---|---|
| Annual limit | ¥350,000 (~$48K) | ¥60,000 (~$8.3K) |
| Per transaction | ¥35,000 (~$4.8K) | ¥6,000 (~$830) |
| Fee (foreign card) | 3% over ¥200 | 3% over ¥200 |

### Banking: Opening Account as Foreigner
You need a work visa (Z/R/M) + proof of residence to open a Chinese bank account.
As a tourist/remote worker on tourist visa: **Not possible. Use Alipay/WeChat exclusively.**

### Remittance (Getting Money Out)
Complex. Wise/TransferWise works best. See [Resources →](#)
```

**Expected new length**: ~50 lines (vs current ~155 lines)

**Edit instructions**:
- Find "Money Matters" section (approximately lines 784–938)
- Identify payment subsection (~155 lines)
- Delete this subsection
- Insert replacement text above

---

### Cut #3: City Guides (Lines ~206–435, ~230 lines)

**Action**: Reduce all 5 cities to 2–3 sentences each; link to dedicated guides

**Expected new length**: ~50 lines (vs current ~230 lines)

**Suggested content**:
```markdown
## City Guides: Where to Land

**Shanghai** — Mega-hub, ¥5K–15K/month, fast-paced, international. [See guide →](#)

**Beijing** — Capital, ¥4K–12K/month, politics and culture. [See guide →](#)

**Shenzhen** — Startup hub, ¥3.5K–10K/month, fastest growth. [See guide →](#)

**Chengdu** — Rising gem, ¥2.5K–5K/month, relaxed vibe, tech scene. [See guide →](#)

**Dali** — Nomad paradise, ¥2K–4K/month, mountains and coffee shops. [See guide →](#)
```

---

### Cut #4: Housing Section Trim (Lines ~135–205, ~71 lines)

**Action**: Remove lengthy scam warnings; condense deposit strategy

**Expected new length**: ~35 lines (vs current ~71 lines)

**Suggested content**:
```markdown
## Housing: Finding, Negotiating, Avoiding Scams

### Finding Apartments
Use: Xiaozhu, Airbnb (short-term), local real estate agents (长期)

### Common Scams
- Fake listings (always video call, never wire money sight-unseen)
- Requests for upfront payment via wire (use agent instead)
- Landlord demands beyond legal terms
- Unlisted fees (utilities, deposits)

**Always verify**: Meet in person, sign official contract, pay via reputable agent

### Deposit Strategy (Sesame Credit)
Landlords sometimes hold deposits pending "Sesame Credit" verification (Alibaba's scoring system).
**Normal**: Usually returned without issue if you follow lease terms and pay on time
**Red flag**: Demands for deposits exceeding 2–3 months' rent

[See full housing guide →](#)
```

---

### Cut #5: Healthcare Section Trim (Lines ~1,062–1,129, ~68 lines)

**Action**: Remove cost examples; link to detailed guide

**Expected new length**: ~40 lines (vs current ~68 lines)

---

### Cut #6: Reality Check Intro Trim (Lines ~28–54, ~27 lines)

**Action**: Condense intro from ~27 to ~15 lines

**Current intro**: Long explanation of why China is hard
**New intro**: Cut to the chase, keep substance

```markdown
## The China Reality Check

Let's be direct: China is not an easy digital nomad destination. Here's why:

- **No legal long-term remote work visa** — You cannot legally work for foreign companies on a tourist visa
- **Great Firewall is relentless** — VPN setup (10 min at home) becomes critical; protocols get blocked constantly
- **Language matters** — Shanghai has English; outside tier-1 cities, Mandarin or app skills required
- **WeChat is non-negotiable** — Your payment method, ID verification, messaging platform, work tool, and social network

**Why come anyway?** Food, cost, tech infrastructure, and adventure. [See full reality breakdown →](#)
```

---

**Total expected cuts**: ~462 lines / ~2,975 words ✅

---

## Summary: All Cuts by File

| File | Current | Target | Cut Range | Savings |
|------|---------|--------|-----------|---------|
| korea-ultimate-digital-nomad-guide.mdx | 1,149 | 849 | City guides: ~188→40, Taxes: ~119→25, Healthcare: ~109→40, Money: ~110→35 | ~300 lines |
| japan-ultimate-digital-nomad-guide.mdx | 1,440 | 1,085 | City guides: ~218→40, Healthcare: ~136→50, Taxes: ~121→40, Money: ~108→60 | ~355 lines |
| taiwan-ultimate-digital-nomad-guide.mdx | 1,132 | 902 | City guides: ~159→35, Healthcare: ~113→50, Money: ~94→50 | ~230 lines |
| china-ultimate-digital-nomad-guide.mdx | 1,973 | 1,511 | **VPN: ~196→40**, **Alipay: ~155→50**, City guides: ~230→50, Housing: ~71→35, HC: ~68→40, Intro: ~27→15 | ~462 lines |
| **TOTAL** | **6,637** | **5,290** | | **1,347 lines** |

---

## Implementation Checklist

- [ ] Review all proposed cuts with Gen
- [ ] Get approval on specific line ranges
- [ ] Edit China guide first (highest ROI with VPN + Alipay cuts)
- [ ] Edit Korea guide (city guides + taxes)
- [ ] Edit Japan guide (city guides + healthcare)
- [ ] Edit Taiwan guide (city guides + healthcare)
- [ ] Test all internal links (make sure [See guide →](#) links resolve)
- [ ] Review final files in browser
- [ ] Commit changes with message: "Reduce blog guide verbosity by 20%; consolidate to tips articles"

---

**Generated**: March 4, 2026
