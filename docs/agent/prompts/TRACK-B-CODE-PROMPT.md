# LocalNomad — Track B: 코드 안정화

Track A (컨텐츠)와 병렬로 실행. 유저에게 안 보이는 기술 부채 정리.
예상 시간: 4-8시간. 완전 무인 실행.

---

## How to Run

```bash
cd /Users/leegen/localnomad/localnomad-track-b
cat docs/TRACK-B-CODE-PROMPT.md | claude --dangerously-skip-permissions -p -
```

---

You are the lead engineer for LocalNomad, a Next.js 16 (App Router) + React 19 visa guidance platform.

## EXECUTION MODE: FULLY UNATTENDED

- NEVER stop to ask questions.
- If npm run build fails, fix it yourself. NEVER add ignoreBuildErrors.
- Commit after each task.
- Push after all tasks.
- 기존 기능을 깨뜨리지 않는 것이 최우선.

## BEFORE YOU START

Read:
- `CLAUDE.md` — conventions, critical rules
- `docs/REFACTORING-PLAN.md` — Track B 상세 계획

---

# TASK 1: Playwright E2E 테스트 3개

## 1-1. 설치

```bash
npm install -D @playwright/test
npx playwright install chromium
```

`playwright.config.ts` 생성:
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
});
```

## 1-2. 테스트 3개 작성

`tests/critical-paths.spec.ts`:

**Test 1: 네비게이션 정상**
```
홈(/) → Korea 선택 → /korea/visa 도착
→ 비자 카드 중 하나 클릭 → /korea/visa/{type} 도착
→ 페이지 콘텐츠 렌더링 확인 (h1 존재)
→ hydration 에러 없음 (console.error 감시)
```

**Test 2: 인증 플로우**
```
/korea/visa/dashboard 접근 (비로그인)
→ /auth/login 으로 리다이렉트 확인
→ 로그인 페이지 렌더링 확인
```

**Test 3: Path Simulator**
```
/korea/visa/path 접근
→ from 비자 선택 (e-7)
→ to 비자 선택 (f-2)
→ 결과 렌더링 확인 (전환 경로 표시)
→ URL 파라미터 반영 확인 (?from=e-7&to=f-2)
```

## 1-3. 실행 확인

```bash
npx playwright test
```

3개 모두 통과해야 함. 실패 시 테스트 수정 (코드가 아닌 테스트를).

```bash
git add -A && git commit -m "test: add 3 critical path E2E tests (Playwright)

- Navigation: home → country → visa detail
- Auth: dashboard redirect to login
- Path Simulator: visa transition flow

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

# TASK 2: God Component 분할

기존 기능을 깨뜨리지 않으면서 분할. 각 분할 후 `npm run build` 확인.

## 2-1. VisaDetailContent.tsx (632줄)

Read `components/visa/VisaDetailContent.tsx`.

분할 계획:
```
components/visa/detail/
├── VisaDetailContent.tsx (tab router, ~100줄)
├── OverviewTab.tsx
├── DocumentsTab.tsx
├── ProcessTab.tsx
└── FAQTab.tsx
```

## 2-2. DashboardClient.tsx (599줄)

Read `components/visa/dashboard/DashboardClient.tsx`.

분할 계획:
```
components/visa/dashboard/
├── DashboardClient.tsx (orchestrator, ~150줄)
├── DashboardDataProvider.tsx (~100줄) — Supabase fetch + context
├── DashboardSettings.tsx (~100줄) — Settings 모달
└── DashboardContent.tsx (~200줄) — 메인 UI
```

## 2-3. EligibilityQuiz.tsx (590줄)

Read `components/visa/EligibilityQuiz.tsx`.

분할 계획:
```
components/visa/quiz/
├── EligibilityQuiz.tsx (stepper, ~100줄)
├── QuizStep.tsx (~150줄)
└── QuizResults.tsx (~200줄)
```

## 2-4. visa-path-simulator.tsx (691줄) — LARGEST

Read `components/visa/path/visa-path-simulator.tsx`.

분할 계획:
```
components/visa/path/
├── visa-path-simulator.tsx (orchestrator, ~120줄)
│   - state 관리, 레이아웃, 결과 표시 분기
├── SelectorPanel.tsx (~150줄)
│   - from/to 비자 선택 UI, URL 파라미터 동기화
├── PathResults.tsx (~200줄)
│   - 전환 경로 렌더링, 단계별 표시
└── path-helpers.ts (~100줄)
    - 전환 경로 계산, 요건 매칭 로직
```

주의:
- 기존 import 경로가 깨지지 않도록 barrel export (`index.ts`) 유지
- URL 파라미터 (?from=&to=) 동작이 그대로 유지되어야 함
- `npm run build` 통과 확인

## 2-5. OnboardingWizard.tsx (534줄)

Read `components/visa/OnboardingWizard.tsx`.

분할 계획:
```
components/visa/onboarding/
├── OnboardingWizard.tsx (orchestrator, ~100줄)
│   - 단계 진행, 상태 관리
├── OnboardingSteps.tsx (~200줄)
│   - 각 단계 UI (국적, 목적, 기간 등)
├── OnboardingResults.tsx (~150줄)
│   - 결과 요약, 추천 비자 목록
└── onboarding-types.ts (~50줄)
    - 타입 정의, 상수
```

주의:
- 기존 export 시그니처(props) 유지
- `npm run build` 통과 확인

각 분할 후:
```bash
npm run build
# 통과 시 커밋
git add -A && git commit -m "refactor: split [ComponentName] into smaller modules

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

# TASK 3: 소규모 정리

## 3-1. key={index} 안티패턴 제거 (1곳 남음)

Sprint 0에서 7/8 수정 완료. 마지막 1곳:
```
components/visa/checklist/ChecklistItem.tsx:132
```

`key={index}` → 고유 ID 사용.

참고: `components/ui/` (field.tsx, slider.tsx) 의 key={index}는 shadcn/ui이므로 그대로 둠.

## 3-2. 중복 컴포넌트 제거

`components/social-proof-section.tsx`는 Sprint 0에서 이미 삭제됨.

남은 작업:
- `components/faq-section.tsx` (113줄)과 `components/sections/faq-section.tsx` (80줄) — 동일 이름 export
- 둘 다 `app/` 에서 import 안 됨. 더 완성도 높은 쪽 유지, 다른 쪽 삭제
- 삭제 후 import 경로 수정 (있으면)

## 3-3. 미사용 컴포넌트 확인 및 삭제

아래 파일들은 barrel export만 되고 실제 consumer import 0건:

```
components/visa/detail/QuickEligibilityCheck.tsx — 0 consumer imports
components/visa/detail/ThingsToKnow.tsx — 0 consumer imports
components/visa/quiz/VisaPathMap.tsx — VisaPathMap export 미사용 (VisaPathInline만 QuizResults에서 사용)
```

- `QuickEligibilityCheck.tsx`와 `ThingsToKnow.tsx` 삭제
- `VisaPathMap.tsx`에서 미사용 export 정리 (VisaPathInline은 유지)
- barrel export (`index.ts`)에서 삭제된 re-export 제거
- `npm run build` 통과 확인

## 3-4. NextActionCard 통합

```
components/visa/NextActionCard.tsx (152줄)
components/visa/dashboard/NextActionCard.tsx (222줄)
```

두 파일의 차이를 분석하고:
- 더 완성도 높은 쪽을 유지
- 다른 쪽은 삭제하고 import 경로 수정

```bash
git add -A && git commit -m "refactor: cleanup — fix key={index}, remove dead/duplicate code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

# TASK 4: 최종 검증

```bash
npm run build && npm run lint && npx playwright test
```

모두 통과해야 함.

```bash
git push origin track-b/code-stability
```

보고서 `docs/TRACK-B-REPORT.md`:
```markdown
# Track B Report

## E2E Tests
- Tests written: 3
- All passing: YES/NO

## God Component Split
- VisaDetailContent (632줄): → [결과 파일 수] files, max [줄수]줄
- DashboardClient (599줄): → [결과]
- EligibilityQuiz (590줄): → [결과]
- visa-path-simulator (691줄): → [결과]
- OnboardingWizard (534줄): → [결과]

## Cleanup
- key={index} fixed: [count]
- Duplicate components removed: [count]
- Unused components removed: [count]
- NextActionCard: merged to [path]

## Build
- npm run build: PASS/FAIL
- npm run lint: PASS/FAIL
- Playwright: [3/3]
- Pushed: YES/NO
```

---

## GLOBAL RULES

### Priority
- 기존 기능 깨뜨리지 않기 > 코드 깔끔함
- 확신 없으면 분할하지 않는다
- 분할 후 반드시 `npm run build` 확인

### Files You Must Not Modify
- `components/ui/*` — shadcn/ui managed
- `data/visas/*` — Track A에서 관리 (충돌 방지)
- `messages/*` — Track A에서 관리
- `app/**` — Sprint 0에서 SEO 처리 완료

### Commit Convention
- refactor: 구조 변경
- test: 테스트 추가
- chore: 설정, 정리
