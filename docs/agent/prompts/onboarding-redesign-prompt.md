# Onboarding Redesign — Implementation Prompt

## Overview
Redesign the onboarding flow from "visa-first" to "goal-first" approach. The default assumption is that users **don't have a visa yet** — they're researching. Users who already have a visa can optionally add their current visa info.

## New Flow (Confirmed by Gen — Option A)

```
1. 국가 선택 (5개국)
2. "어떤 비자에 관심 있으세요?" → 목표 비자 선택
3. "현재 이 나라에 비자가 있으세요?"
     ┌─ 없어요 (디폴트) → 대시보드
     └─ 있어요 → 현재 비자 타입 + 만료일 → 대시보드
```

Renewal vs transition is **auto-determined**: if goal visa === current visa → renewal; if different → transition.

## Current State (What Exists)

### Files to modify:
| File | Current State |
|------|--------------|
| `components/dashboard/onboarding-form.tsx` | 3-step wizard: country → visa → date. Only kr/tw. "No visa yet" is a checkbox in date step |
| `lib/actions/dashboard.ts` | `createVisa()` accepts `{country: 'kr'\|'tw', visa_type, expiry_date}` |
| `lib/types/dashboard.ts` | `UserVisa.country` typed as `'kr' \| 'tw'` only |
| `messages/en.json` (Onboarding namespace) | Keys for old flow only |
| `messages/{ja,zh-cn,zh-tw,vi}.json` | Same — old flow keys |

### Database (`user_visas` table — Supabase):
Current columns:
```
id, user_id, country ('kr'|'tw'), visa_type, expiry_date, is_active, created_at, updated_at
```

## ⚠️ Decision Required: DB Schema Change

The current schema stores ONE visa record per user (deactivating previous ones). The new flow needs to store **goal visa** + optionally **current visa**. Two approaches:

**→ Gen 결정: Option 1 — 기존 테이블에 컬럼 추가**

### Supabase Migration

```sql
-- 1. Expand country constraint to include jp, cn
ALTER TABLE user_visas DROP CONSTRAINT IF EXISTS user_visas_country_check;
ALTER TABLE user_visas ADD CONSTRAINT user_visas_country_check
  CHECK (country IN ('kr', 'tw', 'jp', 'cn'));

-- 2. Rename visa_type → goal_visa_type (what user is interested in)
ALTER TABLE user_visas RENAME COLUMN visa_type TO goal_visa_type;

-- 3. Rename expiry_date → current_expiry_date
ALTER TABLE user_visas RENAME COLUMN expiry_date TO current_expiry_date;

-- 4. Add current_visa_type (nullable — null means "no visa yet")
ALTER TABLE user_visas ADD COLUMN current_visa_type text;
```

**After migration, table shape:**
```
| id | user_id | country | goal_visa_type | current_visa_type | current_expiry_date | is_active |
|----|---------|---------|----------------|-------------------|---------------------|-----------|
```

**Examples:**
- User researching F-1-D, no current visa:
  `{ country: 'kr', goal_visa_type: 'f-1-d', current_visa_type: null, current_expiry_date: null }`
- User has F-1-D, wants to renew:
  `{ country: 'kr', goal_visa_type: 'f-1-d', current_visa_type: 'f-1-d', current_expiry_date: '2026-12-31' }`
- User has F-1-D, wants to transition to E-7:
  `{ country: 'kr', goal_visa_type: 'e-7', current_visa_type: 'f-1-d', current_expiry_date: '2026-12-31' }`

## Step 1: Expand Country Support

### 1a. Update types — `lib/types/dashboard.ts`

```typescript
export type VisaCountry = 'kr' | 'tw' | 'jp' | 'cn';

export interface UserVisa {
  id: string;
  user_id: string;
  country: VisaCountry;
  goal_visa_type: string;           // What user is interested in (always set)
  current_visa_type: string | null;  // What user currently has (null = no visa)
  current_expiry_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

> **Note:** SEA is excluded from onboarding because it's a comparison page, not a single country with trackable visas.

### 1b. Update server action — `lib/actions/dashboard.ts`

Change `createVisa` input and DB columns:
```typescript
export const createVisa = async (input: {
  country: VisaCountry;                  // was 'kr' | 'tw'
  goal_visa_type: string;                // was visa_type
  current_visa_type: string | null;      // NEW — null if no visa
  current_expiry_date: string | null;    // was expiry_date
}): Promise<UserVisa> => {
  // ... same deactivate logic ...
  const { data, error } = await supabase
    .from('user_visas')
    .insert({
      user_id: user.id,
      country: input.country,
      goal_visa_type: input.goal_visa_type,
      current_visa_type: input.current_visa_type,
      current_expiry_date: input.current_expiry_date,
      is_active: true,
    })
    .select()
    .single();
  // ...
};
```

### 1c. Update Supabase RLS / constraints (if any)
Check if there's a `CHECK` constraint on `user_visas.country` limiting to `kr`/`tw`. If so, alter it:
```sql
ALTER TABLE user_visas DROP CONSTRAINT IF EXISTS user_visas_country_check;
ALTER TABLE user_visas ADD CONSTRAINT user_visas_country_check CHECK (country IN ('kr', 'tw', 'jp', 'cn'));
```

## Step 2: Expand Visa Options

### Country + visa options config — `components/dashboard/onboarding-form.tsx`

```typescript
const COUNTRY_OPTIONS = [
  { slug: 'korea', code: 'kr' as const, emoji: '🇰🇷', label: 'korea' as const },
  { slug: 'japan', code: 'jp' as const, emoji: '🇯🇵', label: 'japan' as const },
  { slug: 'china', code: 'cn' as const, emoji: '🇨🇳', label: 'china' as const },
  { slug: 'taiwan', code: 'tw' as const, emoji: '🇹🇼', label: 'taiwan' as const },
];

const VISA_OPTIONS: Record<string, { type: string; label: string }[]> = {
  kr: [
    { type: 'f-1-d', label: 'F-1-D — Digital Nomad Visa' },
    { type: 'e-7', label: 'E-7 — Professional Employment' },
    { type: 'd-8', label: 'D-8 — Corporate Investment' },
    { type: 'f-2', label: 'F-2 — Points-Based Resident' },
    { type: 'h-1', label: 'H-1 — Working Holiday' },
  ],
  jp: [
    { type: 'digital-nomad-jp', label: 'Digital Nomad Visa' },
    { type: 'business-manager', label: 'Business Manager Visa' },
    { type: 'engineer-specialist', label: 'Engineer / Specialist in Humanities' },
    { type: 'hsw', label: 'Highly Skilled Worker (HSW)' },
    { type: 'ssw1', label: 'Specified Skilled Worker 1 (SSW1)' },
    { type: 'ssw2', label: 'Specified Skilled Worker 2 (SSW2)' },
  ],
  cn: [
    { type: 'z-visa', label: 'Z-Visa — Work Visa' },
    { type: 'r-visa', label: 'R-Visa — High-End Talent' },
    { type: 'x1-visa', label: 'X1-Visa — Long-Term Study' },
    { type: 'permanent-cn', label: 'Permanent Residence (Green Card)' },
  ],
  tw: [
    { type: 'gold-card', label: 'Gold Card — Employment Gold Card' },
    { type: 'dnv', label: 'DNV — Digital Nomad Visa' },
  ],
};
```

## Step 3: Redesign Form Steps

### New step flow:

```typescript
type Step = 'country' | 'goalVisa' | 'currentVisa';
```

### State:
```typescript
const [step, setStep] = useState<Step>('country');
const [country, setCountry] = useState<VisaCountry | null>(null);
const [goalVisa, setGoalVisa] = useState<string | null>(null);
const [hasCurrentVisa, setHasCurrentVisa] = useState(false);  // default: NO
const [currentVisaType, setCurrentVisaType] = useState<string | null>(null);
const [expiryDate, setExpiryDate] = useState('');
```

### Step 1 — Country Selection
Same as current, but with 4 countries (grid 2×2).

### Step 2 — Goal Visa (`goalVisa`)

```
"어떤 비자에 관심 있으세요?"
[Visa cards for selected country]
```

Clicking a visa card sets `goalVisa` and advances to Step 3.

### Step 3 — Current Visa (`currentVisa`)

```
"현재 이 나라에 비자가 있으세요?"

┌──────────────────────────────────────┐
│  ○ 아직 없어요  (selected by default) │
│  ○ 네, 있어요                        │
│                                      │
│  [if "있어요" selected:]              │
│  현재 비자: [dropdown of visas]       │
│  만료일: [date picker]               │
└──────────────────────────────────────┘

[Go to Dashboard] button
```

**Default state:** "아직 없어요" is pre-selected. User can immediately click "Go to Dashboard" without selecting anything extra.

**If "있어요" is selected:** Two additional fields appear:
- Current visa type dropdown (same visa list as goal step)
- Expiry date input (optional)

### Submit logic:

```typescript
const handleSubmit = async () => {
  if (!country || !goalVisa) return;

  // Single insert — one row with goal + optional current
  await createVisa({
    country,
    goal_visa_type: goalVisa,
    current_visa_type: hasCurrentVisa ? currentVisaType : null,
    current_expiry_date: hasCurrentVisa && expiryDate ? expiryDate : null,
  });

  router.push(`/${locale}/dashboard`);
};
```

## Step 4: Update i18n Messages

### `messages/en.json` — Onboarding namespace:

```json
{
  "Onboarding": {
    "title": "Set up your dashboard",
    "subtitle": "Tell us what you're looking for",
    "selectCountry": "Which country are you interested in?",
    "korea": "South Korea",
    "japan": "Japan",
    "china": "China",
    "taiwan": "Taiwan",
    "selectGoalVisa": "Which visa are you interested in?",
    "currentVisaQuestion": "Do you currently have a visa in this country?",
    "noCurrentVisa": "Not yet",
    "hasCurrentVisa": "Yes, I have one",
    "selectCurrentVisa": "Current visa type",
    "currentExpiryDate": "When does it expire?",
    "goToDashboard": "Go to Dashboard",
    "saving": "Saving...",
    "error": "Something went wrong. Please try again.",
    "errorNetwork": "Network error. Please check your connection.",
    "back": "Back"
  }
}
```

Translate for ja, zh-cn, zh-tw, vi.

**Key changes from old flow:**
- `"subtitle"`: "Tell us which visa you're tracking" → "Tell us what you're looking for" (research-friendly tone)
- `"selectVisa"` → `"selectGoalVisa"` (clarity)
- `"setExpiryDate"` → removed (merged into currentVisa step)
- `"noVisaYet"` → `"noCurrentVisa"` (rephrased as "Not yet")
- NEW: `"currentVisaQuestion"`, `"hasCurrentVisa"`, `"selectCurrentVisa"`, `"currentExpiryDate"`

## Step 5: Update Dashboard to Handle New Data

The dashboard page (`app/[locale]/(protected)/dashboard/page.tsx`) currently calls `getActiveVisa()` which returns one visa. With the new flow:

- If DB Option 3: need to fetch both goal and current visa
- Dashboard should show:
  - **Goal visa card**: "You're researching: [visa name]" with link to visa detail page
  - **Current visa card** (if exists): "Current visa: [visa name], expires [date]" with D-Day countdown
  - If goal === current: Show as renewal tracking ("Renewing your [visa name]")

> **Note:** Dashboard display changes are a SEPARATE task from onboarding form redesign. This prompt focuses on the onboarding form. Dashboard updates should be scoped after Gen confirms the DB schema.

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `components/dashboard/onboarding-form.tsx` | REWRITE | New 3-step flow: country → goal visa → current visa (optional) |
| `lib/types/dashboard.ts` | MODIFY | Expand `VisaCountry` to include jp/cn |
| `lib/actions/dashboard.ts` | MODIFY | Expand `createVisa` country types; add role handling if DB Option 3 |
| `messages/en.json` | MODIFY | Update Onboarding namespace |
| `messages/ja.json` | MODIFY | Translate new keys |
| `messages/zh-cn.json` | MODIFY | Translate new keys |
| `messages/zh-tw.json` | MODIFY | Translate new keys |
| `messages/vi.json` | MODIFY | Translate new keys |
| Supabase migration | CREATE | Schema change based on Gen's DB option choice |

## Quality Checklist

- [ ] `npm run build` — no type errors
- [ ] Onboarding loads with 4 country options (kr, jp, cn, tw)
- [ ] Selecting a country shows correct visa list
- [ ] Step 3 defaults to "Not yet" (no current visa)
- [ ] Can complete onboarding without selecting current visa → lands on dashboard
- [ ] Can select current visa + expiry → lands on dashboard with both records
- [ ] If goal === current visa, dashboard shows renewal context
- [ ] All 5 locale message files updated
- [ ] Back buttons work at each step
- [ ] Step indicator shows correct progress (3 dots)
- [ ] `npm run lint` passes

## Gen 검증 포인트

1. **DB 스키마 선택** — Option 1/2/3 중 결정 필요 (구현 전 필수)
2. **`npm run dev` → 로그인 → 온보딩 페이지**
   - 4개국이 표시되는지
   - 비자 선택 후 "현재 비자 있으세요?" 화면이 뜨는지
   - 디폴트가 "아직 없어요"인지
   - "없어요" 상태로 대시보드 진입이 되는지
3. **대시보드**에서 목표 비자가 올바르게 표시되는지
4. **현재 비자 추가 시** 만료일 카운트다운이 작동하는지
