# Phase 2-A: Korea Visa JSON Data Generation (E-7, D-8, F-2, H-1)

> **Goal**: Create 4 English visa JSON files following the exact same schema as `data/visas/en/f-1-d.json`
> **Reference data**: `docs/agent/reference/research-korea-visas-e7-d8-f2-h1.md`
> **Type definition**: `lib/types/visa.ts` (KoreaVisa interface)
> **Template**: `data/visas/en/f-1-d.json`

---

## Pre-Flight Checks

1. Read `data/visas/en/f-1-d.json` — this is the TEMPLATE. Match its structure exactly.
2. Read `lib/types/visa.ts` — all JSON fields must conform to `KoreaVisa` interface.
3. Read `docs/agent/reference/research-korea-visas-e7-d8-f2-h1.md` — this is the PRIMARY DATA SOURCE. All factual content comes from here.

---

## Files to Create (4 files)

```
data/visas/en/e-7.json
data/visas/en/d-8.json
data/visas/en/f-2.json
data/visas/en/h-1.json
```

---

## Schema Requirements

Each JSON file must include ALL of these top-level fields (matching f-1-d.json structure):

```
type, name, shortName, category, description, tagline, keyRequirement,
targetAudience, eligibility, duration, fees, documents, applicationSteps,
processingTime, workPermission, faqs, tips, warnings, communityTips,
relatedVisas, pathsTo, pathsFrom, lastUpdated, officialLinks
```

Plus Korea-specific fields where applicable:
- `insuranceRequirement` — if insurance is a requirement
- `incomeRequirement` — if income threshold exists
- `gniBasedIncome` — if income is GNI-based (F-1-D style)
- `fixedIncomeRequirement` — if income is fixed amount

---

## Per-Visa Instructions

### 1. E-7 (Specific Activities — Professional Employment)

```json
{
  "type": "e-7",
  "shortName": "E-7",
  "category": "work",
  "tagline": "Work in Korea with employer sponsorship"
}
```

**Special considerations:**
- `keyRequirement`: Emphasize employer sponsorship + qualification requirements
- `eligibility`: Include the 4 paths (Master's, Bachelor's+1yr, 5yr experience, Korean uni graduate)
- `incomeRequirement`: Use 2026 salary standards (E-7-1: ₩31,120,000/year, E-7-2: ₩25,890,000/year). Present E-7-1 as primary.
- `documents`: Include BOTH applicant documents AND employer documents (business license, foreigner utilization plan, employment recommendation letter)
- `applicationSteps`: This is employer-sponsored — Step 1 is "Get a job offer", Step 2 is "Employer applies for CCVI", Step 3 is "Get visa at embassy"
- `workPermission.restrictions`: Must work ONLY for sponsoring employer. Changing jobs requires new CCVI.
- `faqs`: Write 10-12 FAQs covering: sub-categories (E-7-1/2/3/4), salary requirements, job code matching, Korean university advantage, age exemption (18-24 since April 2025), QS/THE university advantage, job change process, extension process, path to F-2/F-5
- `communityTips`: Use the 5 E-7 community tips from the research file. Set source to "community" for blog-sourced tips.
- `pathsTo`: F-2-7 (points-based resident), F-5 (permanent resident)
- `pathsFrom`: D-10 (job seeking), D-2 (student), F-1-D (digital nomad), H-1 (working holiday)
- `warnings`: Include "most difficult Korean visa to obtain", overstay penalty (₩100K/day), 30-day advance renewal

### 2. D-8 (Corporate Investment)

```json
{
  "type": "d-8",
  "shortName": "D-8",
  "category": "investment",
  "tagline": "Start or invest in a Korean business"
}
```

**Special considerations:**
- `keyRequirement`: ₩100,000,000 minimum investment + 10%+ voting shares + active management
- `eligibility`: Include sub-categories (D-8-1 foreign-invested corp, D-8-2 tech transfer, D-8-4 startup, D-8-4S startup special)
- `incomeRequirement`: NOT applicable (investment-based, not income-based). Omit this field.
- `documents`: Include investment-specific docs (FDI registration, Foreign Currency Purchase Certificate 외국환매입증명서, articles of incorporation, securities subscription deposit)
- `applicationSteps`: Include FDI registration as Step 1 BEFORE money transfer. Include company registration steps.
- `workPermission`: Allowed — managing own invested company only
- `faqs`: Write 10-12 FAQs covering: minimum investment, D-8-4S startup visa (new, no degree required), source of funds requirements, virtual office issues, company registration timeline, family visas (F-3), FDI penalty for skipping registration, path to F-5 (₩500M+ or $500K+ for 3yr)
- `communityTips`: Use the 5 D-8 community tips from research file.
- `pathsTo`: F-2 (resident), F-5 (permanent resident — ₩500M+ investment)
- `pathsFrom`: F-1-D (digital nomad), E-7 (professional), D-10 (job seeking)
- `warnings`: FDI registration MUST happen before capital remittance (50% tax penalty), report business closure within 30 days, virtual offices flagged

### 3. F-2 (Resident — Points-Based, F-2-7)

```json
{
  "type": "f-2",
  "shortName": "F-2",
  "category": "residence",
  "tagline": "Long-term residence through the points system"
}
```

**Special considerations:**
- `name`: "Korea Points-Based Resident Visa (F-2-7) — Complete 2026 Guide"
- `keyRequirement`: "Score ≥80 points (out of 170) in age, education, income, Korean language"
- `eligibility`: Include the 3-year stay requirement AND the exemptions (₩40M+ salary, Korean degree, government recognition)
- This visa has a UNIQUE field not in other visas. Add a custom section in `description` or as part of `eligibility` explaining the points breakdown: Age (max 25), Education (max 25), Korean Language TOPIK/KIIP (max 20), Annual Income (max 60), Bonus Points (max 40)
- `duration`: Score-dependent (80-109: 1yr, 110-119: 2yr, 120-129: 3yr, 130+: 5yr)
- `fees`: First-time ₩85,000, Extension ₩60,000
- `documents`: Include TOPIK/KIIP certificates, income certificate (근로소득증명서), tuberculosis screening, criminal background check (apostilled)
- `workPermission`: Full freedom — can change jobs, start business
- `faqs`: Write 10-12 FAQs covering: points calculation, income as biggest lever, KIIP vs TOPIK, 75-point exception (pre-Dec 2020 holders), K-STAR visa track (32 universities), family visa F-2-71, path to F-5, salary negotiation strategy, volunteering hours (blood donation counts)
- `communityTips`: Use the 5 F-2 community tips from research file.
- `pathsTo`: F-5 (permanent resident — after 3 years on F-2-7)
- `pathsFrom`: E-7 (professional), D-8 (investment), E-2 (teaching), D-2 (student via D-10)
- `tips`: Include "Use koreaprcalculator.com to estimate your score" and "Start KIIP early — free government program"

### 4. H-1 (Working Holiday)

```json
{
  "type": "h-1",
  "shortName": "H-1",
  "category": "working-holiday",
  "tagline": "Work and travel in Korea for young adults"
}
```

**Special considerations:**
- `keyRequirement`: "Age 18-30 (18-35 for UK/Canada) + citizen of 25+ agreement countries"
- `eligibility`: Include age limits, eligible countries list (Australia, Canada, NZ, Japan, US, France, Germany, Ireland, Sweden, Denmark, Hong Kong, Taiwan, Czech, Italy, UK, Austria, Hungary, Israel, Netherlands, Portugal, Belgium, Chile, Poland, Spain, Argentina), one-time restriction (except US/Ireland/Sweden), US-specific requirement (post-secondary student/recent grad)
- `insuranceRequirement`: Minimum coverage ₩40,000,000 (different from F-1-D's ₩100M)
- `duration`: Country-dependent (Japan: 1yr, US: 18mo, Canada/UK: 2yr). Use "1-2 years (varies by nationality)" for `duration.initial`
- `fees`: ~USD 50-100 (varies by embassy). No extension fee since most don't extend.
- `documents`: Passport, photo, insurance, bank statements (≥₩3M), application form, return ticket
- `applicationSteps`: Must apply from HOME COUNTRY (not in Korea). Step 1: Check country eligibility + quota, Step 2: Gather documents, Step 3: Apply at Korean embassy in home country, Step 4: Receive visa, Step 5: Enter Korea + ARC registration
- `workPermission`: Limited — max 25 hours/week. NOT allowed: English teaching, skilled professions, professional entertainment. Allowed: hospitality, retail, translation, internships.
- `faqs`: Write 10-12 FAQs covering: eligible countries, age limits by country, work restrictions (25hr/week), quota system (UK: 5000, Dutch: 200, etc.), can I extend?, reapplication rules (US/Ireland/Sweden can reapply), bank statement requirements, health insurance minimums, ARC registration, transitioning to other visas
- `communityTips`: Use the 5 H-1 community tips from research file.
- `pathsTo`: D-4 (language study), D-10 (job seeking), E-7 (if find employment)
- `pathsFrom`: [] (empty — H-1 is typically the first visa)
- `warnings`: One-time visa (exceptions: US, Ireland, Sweden), quota is first-come-first-served, must apply from home country, 25hr/week work limit strictly enforced

---

## Quality Rules

1. **Legal compliance**: NEVER say "you qualify", "you are eligible", "recommended visa". Use "published requirements indicate", "according to immigration guidelines". Every visa must end with disclaimer-friendly language.
2. **Source attribution**: Use "According to published requirements" or "Based on [source]" for factual claims. Include `officialLinks` pointing to HiKorea, visa.go.kr, immigration.go.kr.
3. **Data accuracy**: All numbers (fees, income thresholds, durations) must match the research file. 2026 figures where available.
4. **`lastUpdated`**: Set to `"2026-02-27"` for all files.
5. **communityTips format**: Must match f-1-d.json format exactly:
   ```json
   {
     "id": "kebab-case-id",
     "tip": "The actual tip text",
     "source": "community",
     "verified": true,
     "upvotes": 0,
     "dateAdded": "2026-02-27"
   }
   ```
   Set `upvotes` to 0 for all new tips (no real upvote data). Set `source` to `"community"`.
6. **FAQ count**: 10-12 per visa. Cover the most commonly asked questions based on research.
7. **Document `nameKorean`**: Include Korean names for all documents where known (e.g., 여권, 사업자등록증, 외국인등록증).
8. **Consistent tone**: Match f-1-d.json's tone — informative, practical, neutral. No marketing language.

---

## Verification Checklist

After creating all 4 files, verify:

- [ ] Each file is valid JSON (no trailing commas, proper escaping)
- [ ] All required fields from `KoreaVisa` interface are present
- [ ] `type` field matches filename (e.g., `"type": "e-7"` in `e-7.json`)
- [ ] No legal bright-line violations (no "you qualify", "eligible", "recommended")
- [ ] All fee amounts match research data
- [ ] All income/investment thresholds match research data
- [ ] `communityTips` follow exact format from f-1-d.json
- [ ] `pathsTo`/`pathsFrom` reference valid visa types from `lib/types/visa.ts`
- [ ] `officialLinks` include HiKorea + at least 1 other official source
- [ ] Run `npx jsonlint data/visas/en/e-7.json` (repeat for each) to validate JSON syntax
- [ ] Read each file back and confirm no placeholder text like "TODO" or "[INSERT]"
