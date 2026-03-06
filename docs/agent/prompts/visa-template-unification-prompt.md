# Visa Template Unification — Execution Prompt

## Context

The F-2 visa detail page was the UI redesign pilot. Now we need to unify all 33 visa JSON files across 4 countries (Korea, Taiwan, Japan, China) to a consistent template, and make the rendering components data-driven instead of F-2-hardcoded.

**Reference standard**: Korea F-2 (`data/visas/en/korea/f-2.json`)

## Scope

This prompt covers 5 workstreams:
1. TypeScript interface cleanup
2. Component refactor (data-driven categories)
3. JSON data normalization (all 33 files)
4. communityTips cleanup
5. Exchange rate removal

---

## Workstream 1: TypeScript Interface Changes

**File**: `lib/types/visa.ts`

### 1A. Update `Document` interface

Replace `nameKorean` with a universal `nameLocal` field:

```typescript
export interface Document {
  id: string;
  name: string;
  nameLocal?: string;       // Was: nameKorean. Now universal: 한국어, 繁體中文, 日本語, 简体中文
  description: string;
  tips?: string[];
  where_to_get?: string;
  processing_time?: string;
  cost?: string;
  required: boolean;
  priority?: 'essential' | 'detail';
  warnings?: string[];
}
```

### 1B. Update `CommunityTip` interface

Make `source` and `dateAdded` optional (they should only be present when sourced from a real post):

```typescript
export interface CommunityTip {
  id: string;
  tip: string;
  source?: 'discord' | 'reddit' | 'community' | 'official';  // optional now
  verified: boolean;
  upvotes?: number;
  dateAdded?: string;       // Original post date, NOT date added to DB
}
```

### 1C. Update `VisaBase.processingTime`

Add 2-stage processing time:

```typescript
processingTime: {
  governmentReview: string;     // Immigration office / consulate review only
  totalEndToEnd?: string;       // Full timeline from first doc submission to visa in hand
  expedited?: string;
  notes?: string;
};
```

Remove the old `typical` field. All usages of `visa.processingTime.typical` must be updated to `visa.processingTime.governmentReview`.

### 1D. Update `VisaBase` — add `familyAllowed` as required boolean

Change from optional to required:

```typescript
familyAllowed: boolean;    // Was optional. Now required on all visas.
```

### 1E. Add `postArrivalSteps` to `VisaBase`

```typescript
postArrivalSteps?: {
  id: string;
  title: string;
  deadline?: string;        // e.g. "Within 24 hours", "Within 90 days"
  description: string;
  tips?: string[];
}[];
```

### 1F. Add `languageRequirement` to `KoreaVisa`

```typescript
export interface KoreaVisa extends VisaBase {
  country: 'kr';
  languageRequirement?: {
    required: boolean;
    minimumLevel?: string;    // e.g. "TOPIK Level 5" or "KIIP Level 5"
    notes?: string;
  };
  // ... keep existing fields
}
```

### 1G. Add `nameLocal` to `VisaBase`

```typescript
export interface VisaBase {
  // ... existing fields
  nameLocal?: string;      // Localized visa name: 한국어, 繁體中文, 日本語, 简体中文
}
```

### 1H. Add `agencySteps` to `JapanVisa`

Currently only Taiwan has `agencySteps`. Japan needs it too. Expand the `AgencyStep.agency` union:

```typescript
export interface AgencyStep {
  order: number;
  agency: 'TECO' | 'NIA' | 'MOL' | 'MOFA' | 'BOCA' | 'GoldCardOffice'
    | 'ISA' | 'Embassy' | 'PSB' | 'other';   // Added ISA, Embassy, PSB
  // ... rest unchanged
}

export interface JapanVisa extends VisaBase {
  country: 'jp';
  agencySteps?: AgencyStep[];    // NEW
  // ... keep existing fields EXCEPT remove these unused ones:
  // DELETE: pointsSystem?: JapanPointsSystem;
  // DELETE: designatedSectors?: string[];
}
```

Also delete the `JapanPointsSystem` interface — it's unused.

### 1I. Clean up `ChinaVisa` — remove unused fields

```typescript
export interface ChinaVisa extends VisaBase {
  country: 'cn';
  workPermitCategory?: 'A' | 'B' | 'C';
  puLetterRequired?: boolean;
  psbRegistration?: ChinaPSBRegistration;
  residencePermitDeadline?: number;
  invitationRequired?: boolean;
  covaOnline?: boolean;
  // REMOVED: talentCertification (unused in all JSON files)
  // REMOVED: stemFields (unused in all JSON files)
}
```

Also delete the `ChinaTalentCertification` interface.

---

## Workstream 2: Component Refactor — Data-Driven Categories

**File**: `components/visa/sections/requirements-tab.tsx`

### 2A. Replace hardcoded CATEGORY_CONFIG with dynamic config

Remove the current hardcoded 3-category system:

```typescript
// DELETE these:
// const CATEGORY_CONFIG = { visaStatus: ..., pointsSystem: ..., income: ... };
// const CATEGORY_ORDER = ['visaStatus', 'pointsSystem', 'income'];
```

Replace with a comprehensive mapping that covers all countries. Categories not found in this map get a default icon:

```typescript
import {
  Check, X, Zap, TriangleAlert, Lightbulb, DollarSign,
  Briefcase, Shield, AlertTriangle, Stamp, BarChart3,
  GraduationCap, Building2, Globe, FileText, Users,
  Landmark, Award, Clock, Heart,
} from 'lucide-react';

const CATEGORY_ICON_MAP: Record<string, typeof Check> = {
  // Korea F-2
  visaStatus: Stamp,
  pointsSystem: BarChart3,
  income: DollarSign,
  // Korea D-8
  investment: Landmark,
  'legitimate-funds': DollarSign,
  // Korea E-7
  'employer-sponsorship': Building2,
  'education-masters': GraduationCap,
  'salary-parity': DollarSign,
  // Korea general
  employment: Briefcase,
  education: GraduationCap,
  age: Clock,
  nationality: Globe,
  insurance: Shield,
  // Taiwan
  'professional-field': Award,
  'salary-threshold': DollarSign,
  'tax-residency': Landmark,
  // Japan
  'coe-required': FileText,
  'sponsor-employer': Building2,
  'language-ability': Globe,
  // China
  'work-permit': FileText,
  'psb-registration': Landmark,
  'health-check': Heart,
  // Fallback
  _uncategorized: Check,
};

// No fixed order — render categories in the order they appear in the data.
// The component already handles this via the grouped Map iteration.
```

### 2B. Update `categoryLabel` function

Replace the hardcoded label map with i18n lookup + fallback:

```typescript
const categoryLabel = (category: string) => {
  // Try i18n key first (e.g. t('category.visaStatus'))
  // If no translation exists, format the category string: "employer-sponsorship" → "Employer Sponsorship"
  try {
    return t(`category.${category}`);
  } catch {
    return category
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
};
```

### 2C. Update `renderCategoryHeader` to use CATEGORY_ICON_MAP

```typescript
const renderCategoryHeader = (category: string) => {
  if (category === '_uncategorized') return null;
  const Icon = CATEGORY_ICON_MAP[category] ?? FileText;  // default fallback icon
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="font-lora text-lg font-semibold">{categoryLabel(category)}</h3>
    </div>
  );
};
```

### 2D. Update `processingTime` references

Search all components for `visa.processingTime.typical` and replace with `visa.processingTime.governmentReview`. Files likely affected:

- `components/visa/sections/quick-verdict.tsx`
- `components/visa/visa-hero.tsx`
- Any other file referencing `processingTime.typical`

### 2E. Add i18n keys for new categories

**File**: `messages/en.json` — Add under `VisaDetail` namespace:

```json
{
  "VisaDetail": {
    "category": {
      "visaStatus": "Visa Status Requirements",
      "pointsSystem": "Points System",
      "income": "Income Requirement",
      "investment": "Investment Requirements",
      "legitimate-funds": "Proof of Funds",
      "employer-sponsorship": "Employer Sponsorship",
      "education-masters": "Education Requirements",
      "salary-parity": "Salary Requirements",
      "employment": "Employment",
      "education": "Education",
      "age": "Age Requirement",
      "nationality": "Nationality",
      "insurance": "Insurance",
      "professional-field": "Professional Field",
      "salary-threshold": "Salary Threshold",
      "tax-residency": "Tax Residency",
      "coe-required": "Certificate of Eligibility",
      "sponsor-employer": "Sponsor / Employer",
      "language-ability": "Language Ability",
      "work-permit": "Work Permit",
      "psb-registration": "PSB Registration",
      "health-check": "Health Check"
    }
  }
}
```

Add equivalent keys in `messages/ja.json`, `messages/vi.json`, `messages/zh-cn.json`, `messages/zh-tw.json`. Use appropriate translations for each language.

---

## Workstream 3: JSON Data Normalization

Apply to ALL 33 visa JSON files across all countries and locales.

### 3A. `processingTime` — migrate `typical` → 2-stage

For every visa JSON file, replace:

```json
"processingTime": {
  "typical": "2-4 weeks",
  "notes": "..."
}
```

With:

```json
"processingTime": {
  "governmentReview": "2-4 weeks",
  "totalEndToEnd": "2-3 months",
  "notes": "..."
}
```

Use these values (research each visa's actual timeline):

**Korea:**
| Visa | governmentReview | totalEndToEnd |
|------|-----------------|---------------|
| F-2 | 2-4 weeks | 2-4 months (includes KIIP, doc prep) |
| E-7 | 2-4 weeks | 2-5 months (includes CCVI, employer filing) |
| D-8 | 2-4 weeks | 3-6 months (includes FDI registration, company setup) |
| F-1-D | 2-3 weeks | 1-2 months |
| H-1 | 1-2 weeks | 2-4 weeks |
| B-2 | 1-2 weeks | 1-3 weeks |

**Taiwan:**
| Visa | governmentReview | totalEndToEnd |
|------|-----------------|---------------|
| Gold Card | 30-60 business days | 2-4 months (multi-agency) |
| DNV | 2-3 weeks | 1-2 months |
| Visitor | 3-5 business days | 1-2 weeks |

**Japan:**
| Visa | governmentReview | totalEndToEnd |
|------|-----------------|---------------|
| Engineer/Specialist | 1-3 months (COE) | 3-5 months |
| Digital Nomad | 5-10 business days | 2-4 weeks |
| Business Manager | 1-3 months (COE) | 4-6 months |
| HSW | 10 business days | 2-4 months |
| SSW1 | 1-3 months | 3-6 months |
| SSW2 | 1-3 months | 3-6 months |
| Tourist | 3-5 business days | 1-2 weeks |

**China:**
| Visa | governmentReview | totalEndToEnd |
|------|-----------------|---------------|
| Z Visa | 4-7 business days | 2-3 months |
| X1 Visa | 4-7 business days | 1-2 months |
| K Visa | 4-7 business days | 1-2 months |

### 3B. `familyAllowed` — add to every visa

Add `"familyAllowed": true/false` to every visa JSON that doesn't already have it. Values:

**Korea:** F-2: true, E-7: true, D-8: true, F-1-D: false, H-1: false, B-2: false
**Taiwan:** Gold Card: true, DNV: false, Visitor: false
**Japan:** Engineer/Specialist: true, Digital Nomad: true, Business Manager: true, HSW: true, SSW1: false, SSW2: true, Tourist: false
**China:** Z Visa: true, X1 Visa: true, K Visa: true

### 3C. `renewal` — add structured object to all visas missing it

Every visa must have a `renewal` object. For visas where renewal is not applicable:

```json
"renewal": {
  "eligible": false,
  "requirements": [],
  "documents": []
}
```

For visas where renewal IS applicable but the field is missing, add with real data. Example for Japan Engineer/Specialist:

```json
"renewal": {
  "eligible": true,
  "maxExtensions": null,
  "maxTotalStay": "Indefinite (with continuous renewal)",
  "requirements": ["Valid employment contract", "Tax payment records", "No immigration violations"],
  "documents": ["Passport", "Current residence card", "Employment certificate", "Tax certificate"],
  "applyBeforeDays": 90,
  "processingTime": "2-4 weeks",
  "fees": "¥4,000"
}
```

**Taiwan DNV**: Remove `renewal.maxTotalStay` (redundant with `duration.maxTotal`). Keep only:

```json
"renewal": {
  "eligible": true,
  "maxExtensions": 3,
  "requirements": ["..."],
  "documents": ["..."],
  "applyBeforeDays": 15,
  "processingTime": "2-3 weeks",
  "fees": "NT$3,000"
}
```

### 3D. `nameLocal` — add to all visas and documents

**Top-level `nameLocal`** — add to every visa JSON:

| Country | Visa | nameLocal |
|---------|------|-----------|
| Korea | F-2 | 점수제 거주비자 (F-2-7) |
| Korea | E-7 | 특정활동비자 (E-7) |
| Korea | D-8 | 기업투자비자 (D-8) |
| Korea | F-1-D | 디지털노마드비자 (F-1-D) |
| Korea | H-1 | 워킹홀리데이비자 (H-1) |
| Korea | B-2 | 관광비자 (B-2) |
| Taiwan | Gold Card | 就業金卡 |
| Taiwan | DNV | 數位遊牧簽證 |
| Taiwan | Visitor | 停留簽證 |
| Japan | Engineer/Specialist | 技術・人文知識・国際業務 |
| Japan | Digital Nomad | デジタルノマドビザ |
| Japan | Business Manager | 経営・管理 |
| Japan | HSW | 高度専門職 |
| Japan | SSW1 | 特定技能1号 |
| Japan | SSW2 | 特定技能2号 |
| Japan | Tourist | 短期滞在 |
| China | Z Visa | Z签证（工作签证） |
| China | X1 Visa | X1签证（留学签证） |
| China | K Visa | 字签证 (not standard — verify) |

**Document-level `nameLocal`**: In Korea visa JSONs, rename all `"nameKorean"` keys to `"nameLocal"`. For Taiwan, Japan, China visas, add `"nameLocal"` to key documents where the local-language name is important (e.g., government forms). Use these local names:

Korea documents — just rename `nameKorean` → `nameLocal` (values stay the same).

Taiwan documents — add `nameLocal` for key forms:
- Passport → 護照
- Employment contract → 聘僱合約
- Degree certificate → 學位證書
- Health check → 健康檢查證明
- Financial proof → 財力證明

Japan documents — add `nameLocal` for key forms:
- Certificate of Eligibility → 在留資格認定証明書
- Passport → パスポート
- Resume → 履歴書
- Employment contract → 雇用契約書
- Degree certificate → 卒業証明書

China documents — add `nameLocal` for key forms:
- Passport → 护照
- Work permit notification → 外国人工作许可通知
- Health check → 体检报告
- Criminal background check → 无犯罪记录证明
- PU Letter → PU邀请函

### 3E. `postArrivalSteps` — add to relevant visas

Only add where there are mandatory post-arrival obligations. Leave out for tourist/visitor visas.

**Korea (all non-tourist visas)**:
```json
"postArrivalSteps": [
  {
    "id": "arc-registration",
    "title": "Alien Registration Card (ARC)",
    "deadline": "Within 90 days of entry",
    "description": "Visit your local immigration office to apply for ARC. Required for banking, phone contracts, and most services.",
    "tips": ["Book appointment via HiKorea (hikorea.go.kr)", "Bring passport, photos, proof of address, and visa-specific documents"]
  }
]
```

**China (all visas)**:
```json
"postArrivalSteps": [
  {
    "id": "psb-registration",
    "title": "PSB Registration",
    "deadline": "Within 24 hours of arrival",
    "description": "Register at the local Public Security Bureau. Hotels do this automatically; if staying elsewhere, visit the nearest PSB station.",
    "tips": ["Bring passport, entry stamp page copy, and accommodation proof"]
  },
  {
    "id": "residence-permit",
    "title": "Residence Permit Conversion",
    "deadline": "Within 30 days of entry",
    "description": "Convert your visa entry to a formal residence permit at the local PSB Exit-Entry Administration.",
    "tips": ["Requires health check, employment docs, and PSB registration receipt"]
  }
]
```

**Japan (work/study/DN visas)**:
```json
"postArrivalSteps": [
  {
    "id": "residence-card",
    "title": "Residence Card",
    "deadline": "Issued at airport (Narita, Haneda, Kansai, Chubu)",
    "description": "Your residence card (在留カード) is issued upon arrival at designated airports. At other ports of entry, visit your local ward office within 14 days.",
    "tips": ["Always carry your residence card — it is legally required"]
  },
  {
    "id": "ward-office-registration",
    "title": "Ward Office Registration (住民届)",
    "deadline": "Within 14 days of finding address",
    "description": "Register your address at the local ward/city office. Required for health insurance enrollment and bank account opening.",
    "tips": ["Bring residence card, passport, and proof of address"]
  }
]
```

**Taiwan (work/residence visas)**:
```json
"postArrivalSteps": [
  {
    "id": "arc-application",
    "title": "ARC Application",
    "deadline": "Within 15 days of arrival (for stays over 180 days)",
    "description": "Apply for Alien Resident Certificate at the nearest NIA service center.",
    "tips": ["Bring passport, visa, 2 photos, proof of address, and fees"]
  }
]
```

### 3F. `languageRequirement` — add to Korea visas where applicable

**F-2**:
```json
"languageRequirement": {
  "required": false,
  "minimumLevel": "TOPIK Level 3+ or KIIP Level 3+ (earns bonus points)",
  "notes": "Not mandatory but contributes up to 20 points in the Korean language category of the F-2-7 points system."
}
```

**E-7**: No formal language requirement — skip (the employer handles this).

**H-1**: No language requirement.

### 3G. `agencySteps` — add to Japan visas

**Engineer/Specialist, Business Manager, HSW, SSW1, SSW2:**
```json
"agencySteps": [
  {
    "order": 1,
    "agency": "ISA",
    "agencyFullName": "Immigration Services Agency of Japan (出入国在留管理庁)",
    "action": "COE Application",
    "description": "Employer or representative files Certificate of Eligibility application.",
    "processingDays": 60,
    "tips": ["Processing varies by regional bureau — Tokyo is typically slower"]
  },
  {
    "order": 2,
    "agency": "Embassy",
    "agencyFullName": "Japanese Embassy/Consulate",
    "action": "Visa Issuance",
    "description": "Submit COE with passport and application form at nearest Japanese embassy.",
    "processingDays": 5,
    "dependsOn": 1
  }
]
```

**Digital Nomad, Tourist:** Simpler flow — single Embassy step (no COE):
```json
"agencySteps": [
  {
    "order": 1,
    "agency": "Embassy",
    "agencyFullName": "Japanese Embassy/Consulate",
    "action": "Visa Application",
    "description": "Submit application directly at nearest Japanese embassy or consulate.",
    "processingDays": 7
  }
]
```

---

## Workstream 4: communityTips Cleanup

For visa files where `source` is `"community"` AND `dateAdded` is the same batch date across all tips (indicating synthetic data), **remove** `source` and `dateAdded` fields from those tips. Keep only `id`, `tip`, `verified`, `upvotes`.

**Files to clean** (remove `source: "community"` and batch `dateAdded`):
- All Korea visas EXCEPT F-1-D and B-2 (these have real sources)
- All Taiwan visas
- All Japan visas
- All China visas

**Files to KEEP as-is**:
- Korea F-2 (already has no source/dateAdded)
- Korea F-1-D (has real reddit/discord sources with varied dates)
- Korea B-2 (has real reddit/discord sources with varied dates)

For the cleaned files, each communityTip should look like:

```json
{
  "id": "some-id",
  "tip": "The actual tip text...",
  "verified": false,
  "upvotes": 0
}
```

---

## Workstream 5: Exchange Rate Removal

In ALL 33 visa JSON files, remove USD/EUR equivalent amounts from `fees` fields.

**Pattern to find and remove**: `(~$XX USD)`, `(~$XX)`, `(approximately $XX USD)`, `(about $XX)`, etc.

Examples:
- `"₩85,000 (~$63 USD)"` → `"₩85,000"`
- `"NT$7,790-9,790 (varies by nationality, location, and duration)"` → Keep the parenthetical since it's not an exchange rate
- `"¥0–3,000 (varies by embassy; some embassies waive)"` → Keep the parenthetical
- `"¥4,000 (~$27 USD)"` → `"¥4,000"`

Only remove parentheticals that contain `$` followed by numbers and `USD`/`EUR`/`GBP`. Do NOT remove parentheticals that contain explanatory notes.

Also check `incomeRequirement.amount` fields — if they contain USD equivalents, remove those too.

---

## Workstream 6: Localized Visa Files

For Korean visa files that exist in multiple locales (`ja`, `vi`, `zh-cn`), apply the SAME structural changes:
- Rename `nameKorean` → `nameLocal` in documents
- Add `processingTime.governmentReview` / `totalEndToEnd` (same values as English)
- Add `familyAllowed`
- Add `renewal` object
- Add `postArrivalSteps` (translate to respective language)
- Remove exchange rate equivalents
- Clean communityTips

The `nameLocal` document values should stay in Korean (한국어) since that's the local language of the country, regardless of the file's UI language.

---

## Verification Checklist

After all changes, run these checks:

1. **TypeScript compilation**: `npx tsc --noEmit` — must pass with zero errors
2. **Build**: `npm run build` — must succeed
3. **Lint**: `npm run lint` — must pass
4. **JSON validity**: Every `.json` file must be valid JSON (no trailing commas, proper escaping)
5. **Field audit**: Run a quick script to verify:
   - Every visa has `familyAllowed` (boolean)
   - Every visa has `renewal` (object with `eligible` boolean)
   - Every visa has `processingTime.governmentReview` (string)
   - No visa has `processingTime.typical` (old field)
   - No visa has `nameKorean` in documents (renamed to `nameLocal`)
   - No `fees` field contains `$` + number + `USD` pattern
   - No communityTip in cleaned files has `source: "community"`
6. **Component rendering**: Check that `requirements-tab.tsx` renders categories with icons for at least:
   - Korea F-2 (visaStatus, pointsSystem, income)
   - Korea D-8 (investment, legitimate-funds)
   - A Taiwan visa
   - A Japan visa
7. **No regressions**: F-2 page must look identical to before these changes

---

## File Impact Summary

**TypeScript** (1 file):
- `lib/types/visa.ts` — Major changes (interfaces updated)

**Components** (3+ files):
- `components/visa/sections/requirements-tab.tsx` — Category system refactored
- `components/visa/sections/quick-verdict.tsx` — processingTime field rename
- `components/visa/visa-hero.tsx` — processingTime field rename

**i18n** (5 files):
- `messages/en.json`, `messages/ja.json`, `messages/vi.json`, `messages/zh-cn.json`, `messages/zh-tw.json` — Add category translation keys

**Visa JSON** (33 files):
- `data/visas/en/korea/` — 6 files
- `data/visas/en/taiwan/` — 3 files
- `data/visas/en/japan/` — 7 files
- `data/visas/en/china/` — 3 files
- `data/visas/ja/korea/` — 4 files
- `data/visas/vi/korea/` — 5 files
- `data/visas/zh-cn/korea/` — 5 files

**Total**: ~42 files modified
