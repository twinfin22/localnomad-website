# At a Glance Card Data Cleanup Prompt

## Goal
Clean up all visa JSON data so that "At a Glance" summary cards display short, scannable values. Long values (>50 chars) should be shortened in the main field, with the full explanation moved to a corresponding `*Detail` field. The component already handles hover/tap popovers via the `*Detail` fields and auto-extracts parenthetical `(...)` content.

## How the Component Works (DO NOT modify `quick-verdict.tsx`)

The `SummaryCard` in `components/visa/sections/quick-verdict.tsx` displays 4 cards:

| Card | `value` field | `detail` field |
|------|--------------|----------------|
| Duration | `duration.initial` | `duration.initialDetail` |
| Fees | `fees.application` | `fees.applicationDetail` |
| Processing Time | `processingTime.governmentReview` | `processingTime.governmentReviewDetail` |
| Max Stay | `duration.maxTotal` | `duration.maxTotalDetail` |

**Existing component behavior:**
1. If a `*Detail` field exists → card shows `value` as-is, hover/tap shows `detail`
2. If no `*Detail` but value has trailing `(parenthetical)` → auto-extracts: card shows text before `()`, hover shows parenthetical content
3. Semicolons (`;`) in the display value are rendered as line breaks on the card
4. Cards are equal height via flexbox

**So your job is DATA ONLY — edit JSON files. Do NOT touch any .tsx files.**

## Step 1: Add TypeScript types

Add these optional fields to `lib/types/visa.ts`:

In the `fees` block (after `notes?: string;`):
```
applicationDetail?: string;
```

In the `processingTime` block (after `notes?: string;`):
```
governmentReviewDetail?: string;
```

## Step 2: Wire detail fields in QuickVerdict

In `components/visa/sections/quick-verdict.tsx`, update the Fees and Processing Time `SummaryCard` calls to pass the new detail props:

```tsx
<SummaryCard
  icon={<DollarSign className="h-5 w-5 text-primary" />}
  label={t('fees')}
  value={visa.fees.application}
  detail={visa.fees.applicationDetail}
/>
<SummaryCard
  icon={<Clock className="h-5 w-5 text-primary" />}
  label={t('processingTime')}
  value={visa.processingTime.governmentReview}
  detail={visa.processingTime.governmentReviewDetail}
/>
```

## Step 3: Clean up all visa JSON files

Below is the COMPLETE list of every visa JSON field that exceeds 50 characters. For each entry, shorten the main field to ≤50 chars and move the full explanation to the corresponding `*Detail` field.

### Rules for shortening:
- **Keep the core fact**: numbers, durations, prices
- **Move qualifiers to detail**: "(varies by...)", "(where available)", explanatory clauses
- **Parenthetical content `(...)`**: The component auto-extracts these, BUT if the value even without parentheses is still >50 chars, you must manually shorten
- **Semicolons**: OK to keep in value (rendered as line breaks), but keep each segment short
- **Don't lose information**: Everything removed from the main field must appear in the detail field
- **Preserve the original language**: ja files stay in Japanese, vi files stay in Vietnamese, zh-cn files stay in Chinese

---

### CHINA

**china/en/k-visa.json** (ALREADY DONE — reference example):
- `fees.application`: `"$23–$140 USD (varies by nationality and processing speed)"` — auto-extracted by component, no change needed
- `processingTime.governmentReview`: `"Standard: 4–5 business days; Express: 2–3 business days; Rush: 1 business day (where available)"` — auto-extracted by component, no change needed (semicolons become line breaks)
- `duration.initial`: Already shortened to `"Multiple entries; varies by embassy"` with `initialDetail`
- `duration.maxTotal`: Already shortened to `"More generous than standard categories"` with `maxTotalDetail`

**china/en/x1-visa.json**:
- `duration.initial` (51): `"Aligned with program duration (typically 1-5 years)"` → auto-extracted, OK as-is
- `duration.maxTotal` (55): `"Up to 5 years; longer programs may require visa renewal"` → shorten to `"Up to 5 years"`, detail: `"Longer programs may require visa renewal during the course of study."`
- `fees.application` (57): `"X1 Visa consular fee: $30-140 USD (varies by nationality)"` → auto-extracted, OK as-is
- `processingTime.governmentReview` (61): `"1-2 weeks for visa processing (after all documents are ready)"` → auto-extracted, OK as-is

**china/en/z-visa.json**:
- `duration.initial` (53): `"1-2 years (aligned with employment contract duration)"` → auto-extracted, OK as-is
- `duration.maxTotal` (88): `"Renewable indefinitely with valid employment; path to permanent residence after 4+ years"` → shorten to `"Renewable indefinitely"`, detail: `"Renewable indefinitely with valid employment. Path to permanent residence after 4+ years of continuous work."`
- `fees.application` (85): `"Work permit: 800-1,000 RMB + Z Visa consular fee: $30-140 USD (varies by nationality)"` → shorten to `"800–1,000 RMB + $30–140 USD"`, detail: `"Work permit fee: 800–1,000 RMB. Z Visa consular fee: $30–140 USD, varies by nationality."`
- `processingTime.governmentReview` (68): `"2-3 months (end-to-end from initial application to residence permit)"` → auto-extracted, OK as-is

### JAPAN

**japan/en/business-manager.json**:
- `duration.initial` (104): → shorten to `"1, 3, or 5 years"`, detail: `"Duration determined by business scale, financial stability, and immigration officer assessment."`
- `duration.maxTotal` (80): → shorten to `"No cumulative limit"`, detail: `"Path to permanent residence through the 10-year standard route."`
- `fees.application` (109): → shorten to `"COE: free; Visa: ¥3,000–¥6,000"`, detail: `"Certificate of Eligibility (COE): ¥0 (free). Visa issuance: ¥3,000 (single-entry) or ¥6,000 (multiple-entry)."`
- `processingTime.governmentReview` (100): → shorten to `"4–8 months total"`, detail: `"Business setup: 1–3 months. COE processing: 2–3 months. Visa issuance: 5–10 working days."`

**japan/en/digital-nomad-jp.json**:
- `duration.maxTotal` (74): → shorten to `"6 months per stay"`, detail: `"6 months per application. Must exit Japan for 6+ months before reapplying."`
- `fees.application` (108): → shorten to `"¥0–¥3,000"`, detail: `"Varies by embassy. Some embassies waive the fee for designated activities visas."`

**japan/en/engineer-specialist.json**:
- `duration.initial` (103): → shorten to `"1, 3, or 5 years"`, detail: `"Duration determined by qualifications, employer stability, and immigration officer discretion."`
- `duration.maxTotal` (63): → shorten to `"No cumulative limit"`, detail: `"Renewable as long as employment continues."`
- `fees.application` (109): → shorten to `"COE: free; Visa: ¥3,000–¥6,000"`, detail: `"Certificate of Eligibility (COE): ¥0 (free). Visa issuance: ¥3,000 (single-entry) or ¥6,000 (multiple-entry)."`
- `processingTime.governmentReview` (95): → shorten to `"3–5 months total"`, detail: `"COE processing: 2–3 months. Document preparation: 1–2 months. Visa issuance: 5–10 working days."`

**japan/en/hsw.json**:
- `duration.maxTotal` (102): → shorten to `"No cumulative limit"`, detail: `"Fast-track to permanent residence: 1 year at 80+ points, 3 years at 70–79 points."`
- `fees.application` (109): → shorten to `"COE: free; Visa: ¥3,000–¥6,000"`, detail: `"Certificate of Eligibility (COE): ¥0 (free). Visa issuance: ¥3,000 (single-entry) or ¥6,000 (multiple-entry)."`
- `processingTime.governmentReview` (134): → shorten to `"3–5 months (new); 2–4 weeks (change)"`, detail: `"New applications: COE 2–3 months + visa 5–10 working days. Status change within Japan: 2–4 weeks."`

**japan/en/ssw1.json**:
- `duration.initial` (56): `"Up to 1 year (renewable in 6-month or 1-year increments)"` → auto-extracted, OK as-is
- `duration.maxTotal` (69): → shorten to `"5 years maximum"`, detail: `"Cannot be extended beyond this limit on SSW1 status."`
- `fees.application` (120): → shorten to `"Tests: ¥6,000–¥10,000; Visa: ¥3,000–¥6,000"`, detail: `"Skills test: ¥6,000–¥10,000. JLPT: ¥7,700. COE: free. Visa issuance: ¥3,000 (single-entry) or ¥6,000 (multiple-entry)."`

**japan/en/ssw2.json**:
- `duration.initial` (56): `"Up to 3 years (renewable in 1-year or 3-year increments)"` → auto-extracted, OK as-is
- `duration.maxTotal` (85): → shorten to `"No maximum"`, detail: `"SSW2 can be renewed indefinitely, allowing long-term settlement in Japan."`
- `fees.application` (120): → shorten to `"Tests: ¥6,000–¥10,000; Visa: ¥3,000–¥6,000"`, detail: `"Skills test: ¥6,000–¥10,000. JLPT: ¥7,700. COE: free. Visa issuance: ¥3,000 (single-entry) or ¥6,000 (multiple-entry)."`

**japan/en/tourist.json**:
- `duration.maxTotal` (82): → shorten to `"90 days"`, detail: `"Extensions are generally not granted except in exceptional circumstances."`
- `fees.application` (118): → shorten to `"Free (visa-waiver); ¥3,000–¥6,000 (visa)"`, detail: `"¥0 for visa-waiver entry. ¥3,000 (single entry) or ¥6,000 (multiple entry) for tourist visa. Current as of March 2026."`
- `processingTime.governmentReview` (78): → shorten to `"Instant (visa-waiver); 5–7 days (visa)"`, detail: `"Instant for visa-waiver entry. 5–7 business days for tourist visa applications."`

### KOREA

**korea/en/b-2.json**:
- `duration.maxTotal` (56): `"90 days per entry (visa-free); 30-90 days per visa grant"` → shorten to `"30–90 days per entry"`, detail: `"90 days per entry for visa-free nationals. 30–90 days per visa grant depending on nationality."`
- `fees.application` (64): `"Varies by nationality — typically ₩50,000-120,000 (single entry)"` → shorten to `"₩50,000–120,000 (single entry)"`, detail: `"Varies by nationality. Typically ₩50,000–120,000 for a single-entry visa."`
- `processingTime.governmentReview` (64): `"Visa-free: instant at port of entry; Visa application: 1-2 weeks"` → shorten to `"Instant (visa-free); 1–2 weeks (visa)"`, detail: `"Visa-free entry is instant at port of entry. Visa applications take 1–2 weeks."`

**korea/en/d-8.json**:
- `duration.initial` (88): → shorten to `"1–2 years"`, detail: `"Varies by sub-category: D-8-1/D-8-3 up to 5 years, D-8-2/D-8-4 up to 2 years."`
- `duration.maxTotal` (73): → shorten to `"No fixed maximum"`, detail: `"Renewable indefinitely with active business operations."`

**korea/en/e-7.json**:
- `duration.maxTotal` (70): → shorten to `"No fixed maximum"`, detail: `"Extensions possible as long as employment continues."`

**korea/en/h-1.json**:
- `fees.application` (53): `"₩60,000-130,000 (varies by nationality and consulate)"` → auto-extracted, OK as-is

**korea/ja/d-8.json**:
- `duration.initial` (52): → shorten to `"1〜2年"`, detail: `"サブカテゴリにより異なる：D-8-1/D-8-3は最長5年、D-8-2/D-8-4は最長2年"`

**korea/ja/f-2.json**:
- `duration.initial` (66): → shorten to `"1〜5年（スコアに応じて）"`, detail: `"80〜109点 = 1年、110〜119点 = 2年、120〜129点 = 3年、130点以上 = 5年"`

**korea/vi/d-8.json**:
- `duration.initial` (81): → shorten to `"1-2 năm"`, detail: `"Tùy phân loại phụ: D-8-1/D-8-3 lên đến 5 năm, D-8-2/D-8-4 lên đến 2 năm."`
- `duration.maxTotal` (87): → shorten to `"Không có giới hạn"`, detail: `"Có thể gia hạn vô thời hạn với hoạt động kinh doanh thực tế."`

**korea/vi/e-7.json**:
- `duration.maxTotal` (68): → shorten to `"Không có giới hạn"`, detail: `"Có thể gia hạn miễn là còn đang làm việc."`

**korea/vi/f-2.json**:
- `duration.initial` (107): → shorten to `"1-5 năm (tùy theo điểm)"`, detail: `"80-109 điểm = 1 năm, 110-119 điểm = 2 năm, 120-129 điểm = 3 năm, 130+ điểm = 5 năm."`
- `duration.maxTotal` (71): → shorten to `"Gia hạn vô thời hạn"`, detail: `"Lộ trình đến Visa thường trú F-5 sau 3 năm."`

**korea/vi/h-1.json**:
- `fees.application` (52): `"₩60,000-130,000 (tùy theo quốc tịch và lãnh sự quán)"` → auto-extracted, OK as-is

**korea/zh-cn/f-2.json**:
- `duration.initial` (64): → shorten to `"1至5年（视积分而定）"`, detail: `"80-109分 = 1年，110-119分 = 2年，120-129分 = 3年，130分以上 = 5年"`

### TAIWAN

**taiwan/en/dnv.json**:
- `fees.application` (88): → shorten to `"NT$1,600–NT$3,200; USD $50–$100"`, detail: `"NT$1,600 (single entry) or NT$3,200 (multiple entry) for domestic applications. USD $50 or $100 for overseas applications."`

**taiwan/en/gold-card.json**:
- `duration.initial` (51): `"1, 2, or 3 years (applicant chooses at application)"` → auto-extracted, OK as-is
- `duration.maxTotal` (53): `"Renewable indefinitely; APRC eligible after 1-3 years"` → shorten to `"Renewable indefinitely"`, detail: `"APRC eligible after 1–3 years of residence."`
- `fees.application` (67): `"NT$3,700 – NT$9,790 (varies by nationality, location, and duration)"` → auto-extracted, OK as-is

**taiwan/en/visitor.json**:
- `fees.application` (94): → shorten to `"Free (visa-exempt); NT$1,600–NT$3,200 (visa)"`, detail: `"Free for visa-exempt entry. Visitor visa: NT$1,600 (single entry) or NT$3,200 (multiple entry)."`
- `processingTime.governmentReview` (79): → shorten to `"Instant (visa-exempt); 3–5 days (visa)"`, detail: `"Instant for visa-exempt entry. 3–5 business days for visitor visa applications."`

---

## Step 4: Verification

After all changes:
1. Run `npx tsc --noEmit` to verify no type errors
2. Spot-check 3 visa pages in different countries to confirm cards render correctly
3. Confirm no value exceeds 50 characters in the main display fields (excluding auto-extracted parentheticals which the component handles)
