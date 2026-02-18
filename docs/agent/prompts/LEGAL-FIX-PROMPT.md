# Legal Compliance Fix Prompt

> 목적: 법률 검수에서 발견된 CRITICAL~MEDIUM 위반 6건 전량 수정
> 실행: `cat docs/LEGAL-FIX-PROMPT.md | claude --dangerously-skip-permissions -p -`

---

## 프로젝트 컨텍스트

- Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
- 비자 정보 플랫폼 (법률 자문 아님)
- `components/ui/` 는 shadcn/ui 관리 — **절대 수정 금지**
- `cn()` 으로 조건부 클래스: `import { cn } from "@/lib/utils"`
- `@/` path alias 사용

## 법률 배경 (반드시 숙지)

### 한국
- 행정사법, 변호사법, 표시광고법
- ❌ 금지 표현: "you qualify", "you are eligible", "recommended visa", "official requirements", "guaranteed"
- ✅ 허용: "published requirements", "based on published information"

### 대만
- Immigration Act §56: 무면허 이민 업무 금지 (벌금 NT$200K~1M)
- Attorney Act §127: 무면허 법률 자문 시 최대 1년 징역
- ❌ **절대 금지**: 점수(score), 퍼센트(%), 확률, 매치 레벨(strong/moderate/possible), "you qualify", "consulting"(諮詢)
- ✅ 허용: "Published Requirement vs Your Answer" 테이블, 팩트 기반 비교표
- 면책조항: 모든 대만 페이지에 English + 繁體中文, 결과 위+아래에 표시

---

## Task 1: EligibilityQuiz 스코어링 제거 (CRITICAL)

### 문제
`EligibilityQuizResults.tsx`에서 Match Score 퍼센트(85%)와 컬러 바를 표시.
대만 Immigration Act §56 직접 위반.

### 수정 대상 파일
- `components/visa/eligibility/EligibilityQuizResults.tsx`

### 수정 내용

**1-A.** 131~154번 줄 — Match Bar 섹션 전체 삭제:
```tsx
{/* Match Bar */}
<div className="mb-3">
  <div className="flex items-center justify-between text-xs mb-1">
    <span className="text-muted-foreground">
      Match Score
    </span>
    <span className="font-semibold">
      {result.percentage}%
    </span>
  </div>
  <div className="h-2 bg-muted rounded-full overflow-hidden">
    <div
      className={cn(
        "h-full rounded-full transition-all duration-500",
        result.percentage >= 70
          ? "bg-green-500"
          : result.percentage >= 40
            ? "bg-amber-500"
            : "bg-red-500"
      )}
      style={{ width: `${result.percentage}%` }}
    />
  </div>
</div>
```

**1-B.** 121~125번 줄 — "Closest requirement match" 배지의 문구를 더 중립적으로:
```tsx
// BEFORE
<span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
  Closest requirement match
</span>

// AFTER
<span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
  Most requirements listed
</span>
```

**1-C.** 92번 줄 — `isTopMatch` 하이라이트 제거 (1위 시각 강조도 "ranking by fit" 암시):
```tsx
// BEFORE
const isTopMatch = index === 0;

// AFTER (제거 또는)
const isTopMatch = false; // 모든 결과를 동등하게 표시
```

**1-D.** 결과 리스트 위에 QuizDisclaimer 추가:
```tsx
import { QuizDisclaimer } from "@/components/visa/LegalDisclaimer";

// {/* Results List */} 바로 위에 추가:
<QuizDisclaimer className="mb-4" />
```

결과 리스트 아래(Actions 위)에도 QuizDisclaimer 추가:
```tsx
// {/* Actions */} 바로 위에:
<QuizDisclaimer className="mt-4" />
```

### 검증
- `npm run build` 성공
- 퀴즈 결과 화면에 퍼센트, 컬러 바, "Match Score" 텍스트가 없어야 함
- 면책조항이 결과 위+아래에 표시되어야 함

---

## Task 2: OnboardingWizard 스코어링 제거 (CRITICAL)

### 문제
`OnboardingWizard.tsx`에서 `calculateMatches()`가 퍼센트 스코어를 계산하고,
`OnboardingResults.tsx`에서 `{score}% match` 배지와 🥇🥈🥉 순위를 표시.

### 수정 대상 파일
- `components/visa/OnboardingWizard.tsx`
- `components/visa/onboarding/OnboardingResults.tsx`
- `components/visa/onboarding/onboarding-types.ts`

### 수정 내용

**2-A.** `onboarding-types.ts` — VisaMatch에서 score 제거:
```ts
// BEFORE
export interface VisaMatch {
  type: VisaType;
  score: number;
  name: string;
  tagline: string;
}

// AFTER
export interface VisaMatch {
  type: VisaType;
  name: string;
  tagline: string;
}
```

**2-B.** `OnboardingWizard.tsx` — `calculateMatches()` 에서 score 계산/정렬 제거:
```ts
// BEFORE (31-61번 줄)
const calculateMatches = (situation: SituationOption) => {
  const scores: Partial<Record<VisaType, number>> = {};
  // ... scoring logic ...
  const maxScore = Math.max(...Object.values(scores), 1);
  const matchList: VisaMatch[] = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .map(([type, score]) => ({
      type: type as VisaType,
      score: Math.round((score / maxScore) * 100),
      name: visaInfo[type as VisaType].name,
      tagline: visaInfo[type as VisaType].tagline,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  // ...
};

// AFTER — 점수를 매기지 않고, 가중치가 0보다 큰 비자만 필터링 (정렬 없음)
const calculateMatches = (situation: SituationOption) => {
  const scores: Partial<Record<VisaType, number>> = {};

  if (selectedGoal) {
    Object.entries(selectedGoal.visaWeights).forEach(([visa, weight]) => {
      scores[visa as VisaType] = (scores[visa as VisaType] || 0) + weight;
    });
  }

  Object.entries(situation.visaWeights).forEach(([visa, weight]) => {
    scores[visa as VisaType] = (scores[visa as VisaType] || 0) + weight;
  });

  const matchList: VisaMatch[] = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .map(([type]) => ({
      type: type as VisaType,
      name: visaInfo[type as VisaType].name,
      tagline: visaInfo[type as VisaType].tagline,
    }))
    .slice(0, 3);

  setMatches(matchList);
  if (matchList.length > 0) {
    setSelectedVisa(matchList[0].type);
  }
};
```

**2-C.** `OnboardingResults.tsx` — 스코어 배지와 순위 메달 제거:
```tsx
// BEFORE (39번 줄)
{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}

// AFTER — 순번만 표시 (순위 암시 제거)
{index + 1}

// BEFORE (46-51번 줄) — 스코어 배지 삭제:
<span className={cn(...)}>
  {t("onboarding.match", { score: match.score })}
</span>

// AFTER — 해당 <span> 전체 삭제

// BEFORE (55-59번 줄) — "Start" 화살표는 특정 비자 추천 암시이므로 "View" 로:
<span>Start</span>
// AFTER
<span>View</span>
```

**2-D.** 결과 위에 QuizDisclaimer 추가 (이미 아래에는 있음):
```tsx
// OnboardingResults.tsx ResultsStep 함수 시작 부분:
return (
  <div className="space-y-6">
    <QuizDisclaimer className="mb-2" />
    {matches.map((match, index) => (
    // ...
```

### 검증
- 온보딩 위저드에 퍼센트, 메달 순위, "X% match" 배지가 없어야 함
- 결과 위+아래에 면책조항 표시

---

## Task 3: Taiwan DNV eligibilityQuestions 필드명 중립화 (HIGH)

### 문제
`data/visas/tw/en/dnv.json`의 `eligibilityQuestions`에 `yesIsQualifying`, `disqualifyingMessage` 필드가 자격 판단을 암시.

### 수정 대상 파일
- `data/visas/tw/en/dnv.json`

### 수정 내용

`eligibilityQuestions` 배열 (51~72번 줄)에서 필드명 변경:
```json
// BEFORE
"yesIsQualifying": true,
"disqualifyingMessage": "The published requirements specify that the DNV is for remote workers employed outside Taiwan."

// AFTER
"publishedRequirement": "Remote employment with a company based outside Taiwan",
"mismatchNote": "The published requirements specify that the DNV is for remote workers employed outside Taiwan."
```

모든 3개 질문에 동일 적용:
1. `employment-check`: `yesIsQualifying` → 삭제, `disqualifyingMessage` → `mismatchNote`
2. `income-check`: 동일
3. `nationality-check`: 동일

각 질문에 `publishedRequirement` 필드 추가 (팩트 기반 비교용).

**주의**: 이 필드를 참조하는 컴포넌트가 있는지 grep으로 확인하고, 있으면 함께 수정할 것:
```bash
grep -r "yesIsQualifying\|disqualifyingMessage" --include="*.tsx" --include="*.ts" .
```

---

## Task 4: Gold Card 비교 테이블 면책조항 UI 확인 (HIGH)

### 문제
`dnv.json`에 `goldCardComparison.disclaimer` 텍스트가 있지만, 이 비교 테이블을 렌더링하는 컴포넌트에서 면책조항을 테이블 위+아래에 표시하는지 확인 필요.

### 수정 대상
1. 먼저 Gold Card comparison을 렌더링하는 컴포넌트를 찾을 것:
```bash
grep -r "goldCardComparison" --include="*.tsx" --include="*.ts" components/ app/
```

2. 해당 컴포넌트에서:
   - 비교 테이블 **위**에 `goldCardComparison.disclaimer` 텍스트 표시
   - 비교 테이블 **아래**에도 동일 면책조항 표시
   - 면책조항은 `<QuizDisclaimer country="tw" />` 또는 직접 텍스트로 구현

3. 만약 goldCardComparison을 렌더링하는 UI가 아직 없다면 → 이 Task는 skip (데이터만 있고 UI는 미구현 상태)

---

## Task 5: path-data.ts "guaranteed" 표현 수정 (MEDIUM)

### 수정 대상 파일
- `lib/visa/path-data.ts` (896번 줄)

### 수정 내용
```ts
// BEFORE
'Direct H-1 to E-7 change is possible but not guaranteed — depends on immigration office',

// AFTER
'Direct H-1 to E-7 status change is subject to immigration office discretion and published requirements at the time of application',
```

---

## Task 6: ConsentGate 한국 전용 텍스트 수정 (MEDIUM)

### 문제
`EligibilityQuizResults.tsx`의 ConsentGate (42~46번 줄)에 "Korean immigration authorities" 하드코딩.
대만 비자 퀴즈에서도 이 컴포넌트가 사용되면 잘못된 국가 참조.

### 수정 대상 파일
- `components/visa/eligibility/EligibilityQuizResults.tsx`

### 수정 내용
```tsx
// BEFORE (42-46번 줄)
<span className="text-sm text-muted-foreground">
  I understand this tool matches my answers against published
  requirements and does not determine my eligibility. Final
  decisions are made by Korean immigration authorities.
</span>

// AFTER — 국가 비특정적으로:
<span className="text-sm text-muted-foreground">
  I understand this tool compares my answers against published
  requirements and does not constitute an eligibility assessment
  or legal advice. Final decisions are made by the relevant
  immigration authorities.
</span>
```

---

## Task 7: i18n 메시지에서 scoring 관련 키 제거 (CRITICAL)

### 수정 대상 파일
- `messages/en.json`
- `messages/ja.json`
- `messages/zh-tw.json`
- `messages/vi.json`

### 수정 내용

**모든 4개 locale 파일에서** 다음 키들을 삭제하거나 중립적으로 변경:

삭제 대상 (사용처가 없어진 후):
```
"strongMatch"
"moderateMatch"
"possibleOption"
"strongMatchDesc"
"moderateMatchDesc"
"possibleOptionDesc"
"match" (= "{score}% match" / "{score}% 匹配" 등)
```

삭제 전에 반드시 grep으로 이 키들이 코드에서 참조되는지 확인:
```bash
grep -r "strongMatch\|moderateMatch\|possibleOption\|\"match\"" --include="*.tsx" --include="*.ts" components/ app/ lib/
```

참조가 없으면 삭제. 참조가 있으면 해당 컴포넌트도 함께 수정.

`onboarding.match` 키 (= "{score}% match"):
- Task 2에서 이 배지를 삭제하므로 이 키도 삭제 가능

---

## Task 8: 빌드 + 최종 검증

```bash
npm run build
```

빌드 성공 후, 다음 항목을 grep으로 최종 확인:

```bash
# 스코어/퍼센트 잔재 확인
grep -r "percentage\|Match Score\|matchScore" --include="*.tsx" components/
grep -r "strongMatch\|moderateMatch\|possibleOption" --include="*.tsx" --include="*.json" components/ messages/

# "guaranteed" 잔재 확인
grep -r "guaranteed" --include="*.ts" lib/

# "you qualify" / "eligible" 위반 확인
grep -ri "you qualify\|you are eligible\|recommended visa" --include="*.json" --include="*.tsx" data/ components/

# "consulting" / "諮詢" 위반 확인 (disclaimer 내 사용은 OK — 기능 설명에 사용하면 위반)
grep -r "諮詢" --include="*.json" --include="*.tsx" messages/ components/ | grep -v "disclaimer\|Disclaimer\|legal"
```

모든 검증 통과 시 커밋:
```bash
git add -A
git commit -m "legal: remove scoring/percentages from quiz, neutralize eligibility language

- Remove Match Score bar and percentage from EligibilityQuizResults
- Remove score calculation and medal ranking from OnboardingWizard
- Neutralize Taiwan DNV eligibilityQuestions field names
- Add disclaimers above+below quiz results (Taiwan law requirement)
- Replace 'guaranteed' with neutral language in path-data
- Fix ConsentGate to be country-agnostic
- Remove unused scoring i18n keys from all locale files

Fixes: Taiwan Immigration Act §56 compliance, Korea 표시광고법 compliance"
```

---

## 작업 순서

1. Task 1 (EligibilityQuiz 스코어링 제거) — CRITICAL
2. Task 2 (OnboardingWizard 스코어링 제거) — CRITICAL
3. Task 7 (i18n scoring 키 정리) — CRITICAL (Task 1,2 이후)
4. Task 3 (DNV eligibilityQuestions 필드명) — HIGH
5. Task 4 (Gold Card 비교 면책조항 확인) — HIGH
6. Task 5 (path-data guaranteed) — MEDIUM
7. Task 6 (ConsentGate 국가 텍스트) — MEDIUM
8. Task 8 (빌드 + 최종 검증)

## 제약 사항

- `components/ui/` 절대 수정 금지 (shadcn/ui)
- `data/visas/tw/zh-tw/` 폴더는 삭제됨 — 참조하지 말 것
- Taiwan 국가의 locale은 `["en"]` 만 존재 (`lib/i18n/config.ts` 참조)
- 결과물에서 점수, 퍼센트, 매치 레벨이 사용자에게 보이면 대만법 위반
