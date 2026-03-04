# Phase 3-A: Directory Migration + Type Expansion

> **Purpose**: Migrate visa data to unified directory structure, expand Country/CountryCode types, and prepare scaffolding for Japan/China/SEA.
> **Prerequisite**: Phase 2 complete, all tests passing.

---

## Gen 결정 필요 사항 (이 프롬프트 실행 전에 확정)

### Decision 1: 일본 비자 타입 — 어떤 비자를 다룰 것인가?

후보 목록 (일본 체류자격 중 외국인 수요가 높은 것):

| Type slug | 일본 명칭 | 영문 | 카테고리 |
|-----------|-----------|------|----------|
| `hsw` | 高度専門職 | Highly Skilled Worker | work |
| `engineer-specialist` | 技術・人文知識・国際業務 | Engineer/Specialist in Humanities | work |
| `business-manager` | 経営・管理 | Business Manager | business |
| `specified-skilled-1` | 特定技能1号 | Specified Skilled Worker 1 | work |
| `specified-skilled-2` | 特定技能2号 | Specified Skilled Worker 2 | work |
| `working-holiday-jp` | ワーキングホリデー | Working Holiday | working-holiday |
| `student-jp` | 留学 | Student | study |
| `spouse-jp` | 日本人の配偶者等 | Spouse of Japanese National | family |
| `long-term-resident` | 定住者 | Long-term Resident | residence |
| `permanent-resident-jp` | 永住者 | Permanent Resident | residence |
| `intra-company` | 企業内転勤 | Intra-company Transferee | work |
| `digital-nomad-jp` | — | Digital Nomad (2024~) | digital-nomad |

**Gen이 선택**: ______________________ (초기에 다룰 비자 타입 slug 나열)

### Decision 2: 중국 비자 타입 — 어떤 비자를 다룰 것인가?

후보 목록:

| Type slug | 중국 명칭 | 영문 | 카테고리 |
|-----------|-----------|------|----------|
| `z-visa` | Z签证 | Work Visa | work |
| `r-visa` | R签证 | Talent Visa (high-end) | work |
| `work-permit-a` | A类 | Category A (high-end talent) | work |
| `work-permit-b` | B类 | Category B (professional) | work |
| `work-permit-c` | C类 | Category C (temporary/seasonal) | work |
| `x1-visa` | X1签证 | Long-term Student | study |
| `x2-visa` | X2签证 | Short-term Student | study |
| `s1-visa` | S1签证 | Long-term Dependent | family |
| `permanent-cn` | 永久居留 | Chinese Green Card | residence |
| `q1-visa` | Q1签证 | Family Reunion | family |

**Gen이 선택**: ______________________ (초기에 다룰 비자 타입 slug 나열)

### Decision 3: 국가 코드

| Country | 제안 코드 | 비고 |
|---------|-----------|------|
| Japan | `jp` | ISO 3166-1 표준 |
| China | `cn` | ISO 3166-1 표준 |
| Southeast Asia | `sea` | 비표준 — 실제 국가가 아님 |

**Gen 확인**: jp/cn/sea 이대로 갈까요? ______

### Decision 4: 일본/중국 국가별 고유 인터페이스 필드

Phase 3-A에서 타입 인터페이스를 미리 만들어야 합니다. 두 가지 방법:

- **A**: 지금은 `JapanVisa extends VisaBase { country: 'jp' }` 최소만. 고유 필드는 3-B에서 비자 데이터 조사 후 추가
- **B**: 지금 고유 필드를 미리 정의 (조사 필요)

**Gen이 선택**: A / B ______

### Decision 5: SEA 비교 테이블 항목

비교 테이블에 어떤 컬럼을 넣을지:

후보:
- [ ] 비자 이름 + 국가
- [ ] 체류 기간 (initial / max)
- [ ] 수수료
- [ ] 소득 요건
- [ ] 취업 허용 여부/제한
- [ ] 처리 기간
- [ ] 자격 조건 요약
- [ ] 장단점 (pros/cons)
- [ ] 공식 링크

**Gen이 선택**: 위에서 원하는 항목 체크 ______

### Decision 6: 일본/중국 페이지 초기 상태

- **A**: Coming Soon 메시지 표시
- **B**: 빈 비자 리스트 표시 (자동으로 "No visas available yet")
- **C**: 페이지 자체를 안 만듦 (3-B에서 같이)

**Gen이 선택**: A / B / C ______

---

## 실행 지침 (결정 완료 후)

### STEP 1: Migrate Korea visa data

Move all Korea visa JSON files to the new unified path:

```
data/visas/en/{type}.json      → data/visas/korea/en/{type}.json
data/visas/ja/{type}.json      → data/visas/korea/ja/{type}.json
data/visas/vi/{type}.json      → data/visas/korea/vi/{type}.json
data/visas/zh-cn/{type}.json   → data/visas/korea/zh-cn/{type}.json
```

Korea files to move:
- en/: f-1-d, e-7, d-8, f-2, h-1 (5 files)
- ja/: f-1-d, e-7, d-8, f-2 (4 files — NO h-1, already confirmed for deletion)
- vi/: f-1-d, e-7, d-8, f-2, h-1 (5 files)
- zh-cn/: f-1-d, e-7, d-8, f-2, h-1 (5 files)

Also delete `data/visas/ja/h-1.json` if it still exists.

### STEP 2: Migrate Taiwan visa data

```
data/visas/tw/en/gold-card.json → data/visas/taiwan/en/gold-card.json
data/visas/tw/en/dnv.json       → data/visas/taiwan/en/dnv.json
```

### STEP 3: Delete old directories

After migration, remove:
- `data/visas/en/` (empty after move)
- `data/visas/ja/` (empty after move)
- `data/visas/vi/` (empty after move)
- `data/visas/zh-cn/` (empty after move)
- `data/visas/tw/` (empty after move)

Verify: `ls data/visas/` should only show `korea/` and `taiwan/` directories.

### STEP 4: Update visa-data.ts loader

Update `lib/visa-data.ts`:

1. Change the `Country` type to include new countries:
```typescript
type Country = 'korea' | 'taiwan' | 'japan' | 'china' | 'southeast-asia';
```

2. Update `COUNTRY_CODE_MAP` with new entries (use codes from Decision 3).

3. Update `AVAILABLE_VISAS`:
```typescript
const AVAILABLE_VISAS: Record<Country, string[]> = {
  korea: ['f-1-d', 'e-7', 'd-8', 'f-2', 'h-1'],
  taiwan: ['gold-card', 'dnv'],
  japan: [],       // Populated in Phase 3-B
  china: [],       // Populated in Phase 3-B
  'southeast-asia': [],  // Comparison only — no individual visa pages
};
```

4. Replace the korea/taiwan if/else path branching in `loadVisaJson` with a single unified path:
```typescript
// Before (remove this):
if (country === 'korea') {
  data = (await import(`@/data/visas/${locale}/${type}.json`)).default;
} else {
  data = (await import(`@/data/visas/tw/${locale}/${type}.json`)).default;
}

// After:
data = (await import(`@/data/visas/${country}/${locale}/${type}.json`)).default;
```

Keep the locale fallback to 'en' unchanged.

### STEP 5: Update lib/types/visa.ts

1. Expand `Country` and `CountryCode`:
```typescript
export type Country = 'korea' | 'taiwan' | 'japan' | 'china' | 'southeast-asia';
export type CountryCode = 'kr' | 'tw' | [Decision 3 values];
```

2. Add visa type unions using slugs from Decision 1 and Decision 2.

3. Add type arrays and type guard functions (`isJapanVisa`, `isChinaVisa`) following the existing pattern.

4. Add country interfaces based on Decision 4:
   - If **A**: Minimal interfaces with just `country` field
   - If **B**: Include researched country-specific fields

5. Update `Visa` union type:
```typescript
export type Visa = KoreaVisa | TaiwanVisa | JapanVisa | ChinaVisa;
```

### STEP 6: Create SEA comparison type

Based on Decision 5, create the comparison data type. Add it to `lib/types/visa.ts` or a new `lib/types/comparison.ts` file:

```typescript
export interface SEAVisaComparison {
  lastUpdated: string;
  disclaimer: string;
  countries: SEACountryVisa[];
}

export interface SEACountryVisa {
  country: string;
  countryCode: string;
  flag: string;
  visaName: string;
  // ... fields based on Decision 5 selections
}
```

Also create the placeholder data file: `data/comparisons/sea-digital-nomad.json` with an empty array for now.

### STEP 7: Update routing and page params

1. In `app/[locale]/[country]/page.tsx` and related files, update country param validation to accept all 5 countries.

2. Add `generateStaticParams` entries for new countries.

3. Based on Decision 6, handle Japan/China/SEA country pages:
   - If **A**: Show translated "Coming Soon" message
   - If **B**: Let existing empty visa list render naturally
   - If **C**: Skip — don't add to generateStaticParams yet

4. For `southeast-asia`, the country page should render a comparison layout instead of the visa listing grid. Add a conditional check but do NOT build the actual comparison component — that is Phase 3-C.

### STEP 8: Update sitemap.ts

Add new countries to sitemap generation. Match the approach from Decision 6 (only include pages that exist).

### STEP 9: Update translation files

Add to ALL 5 message files (en.json, ja.json, zh-cn.json, zh-tw.json, vi.json):

```json
{
  "Countries": {
    "japan": "...",
    "china": "...",
    "southeast-asia": "..."
  }
}
```

With proper translations per locale.

### STEP 10: Verification

1. `npm run build` — zero errors
2. `npm run lint` — pass
3. `git diff --stat` — verify file count matches expectations
4. Verify `ls data/visas/` shows: `korea/`, `taiwan/` (and no old locale directories at root)
5. Verify Korea visa pages still load correctly (path changed!)

---

## Scope Boundaries

This prompt does NOT include:
- Actual visa data JSON for Japan/China (→ Phase 3-B)
- SEA comparison component or data (→ Phase 3-C)
- VisaDisclaimer refactoring (→ Phase 3-D)
- Any non-English translations for new countries
- Onboarding form updates for new countries
- Dashboard support for new countries
