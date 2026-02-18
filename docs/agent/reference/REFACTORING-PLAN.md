# LocalNomad — Execution Plan

> Date: 2026-02-16
> 전략 전환: Sequential Phases → Parallel Tracks

---

## 왜 바꾸는가

기존 플랜은 Phase 0(버그픽스) → 1(리팩토링) → 2(컨텐츠) 순서.
컨텐츠와 SEO가 **8-12일 뒤에야 시작**되는 구조.

이게 치명적인 이유:
- LocalNomad는 **SEO 기반 정보 사이트**. Google이 인덱싱에 **2-6주** 소요.
- F-1-D, 대만 DNV는 지금 블루오션. 12일 늦으면 12일 + 인덱싱 대기 = **1달 이상 지연**.
- God Component가 770줄이든 300줄이든 **유저는 모름**. 컨텐츠 부실은 유저가 앎.
- Dashboard 쓰기 기능은 로그인 유저가 충분해야 의미 있음. **지금은 유저가 없음**.

**결론**: 리팩토링은 "컨텐츠가 Google에 올라가는 동안" 병행하는 게 맞다.

---

## 현재 상태 요약

| 항목 | 수치 | 유저 영향 |
|------|------|----------|
| Hydration flickering | 4개 원인 | 🔴 직접 보임 |
| SEO canonical/hreflang 없음 | 전 페이지 | 🔴 Google 안 잡음 |
| God Components (>300줄) | 6개 | ⚪ 유저 모름 |
| `as any` | 4곳 | ⚪ 유저 모름 |
| `key={index}` (위험) | ~10곳 | 🟡 엣지 케이스 |
| Locale 누락 링크 | ~11곳 | 🟡 일부 유저 |
| 테스트 코드 | 0개 | ⚪ 유저 모름 |
| Dead/중복 코드 | 3쌍+5개 | ⚪ 유저 모름 |
| Dashboard 쓰기 | 0 mutation | 🟡 로그인 유저만 |

---

## Sprint 0 — 배포 + SEO 씨앗 (1-2일)

> 목표: 사이트를 빠르고 정상적으로 Google에 노출시킨다.

### 0-1. Hydration Flickering 해결
- Theme flash: `className="dark"` + ThemeProvider 충돌 해소
- Auth state flash: `useState(null)` → 서버 세션 전달
- Suspense `fallback={null}` → skeleton 또는 제거
- `suppressHydrationWarning` 추가
- 검증: Puppeteer 200ms 간격 스크린샷, CLS 측정
- 상세: `docs/HYDRATION-FIX-PROMPT.md`

### 0-2. SEO 기초 (canonical + hreflang + metadataBase)
- `app/layout.tsx`에 `metadataBase: new URL('https://localnomad.club')`
- 페이지별 `generateMetadata()`에 `alternates.canonical` + `alternates.languages`
- 다국어 페이지 간 hreflang 연결
- `as any` 4곳 제거 (같이 처리 — 작업량 작음)
- locale 누락 링크 ~11곳 패치

### 0-3. 배포
- `git push origin main` → Vercel 자동 배포
- Google Search Console에 sitemap 제출
- 대만 대시보드 활성화 + 네비게이션 단순화 (bundles/areas 제거)

**Sprint 0 완료 시**: 사이트 라이브, 깜빡임 없음, Google이 크롤링 시작.

---

## Sprint 1+ — 병렬 트랙 (이후 계속)

> Sprint 0 이후, 두 개 트랙을 병렬로 진행.

### Track A: 컨텐츠 + SEO (수익 직결)

**A-1. F-1-D 원스톱 가이드 강화** (1순위, 1-2일)
- 소득 증빙 ($66K 요건) 상세 설명, 보험 요건, 신청 절차 step-by-step
- FAQ 보강 (세금, 비자 전환, 가족 동반)
- SEO: 타겟 키워드 "korea digital nomad visa requirements", "F-1-D visa guide"
- `generateMetadata()` 최적화 (title, description, OG image)

**A-2. 대만 DNV 가이드 확충** (2순위, 1-2일)
- 2025 출시 비자 — 요건, 절차, Gold Card 비교
- 블루오션 선점: 아직 깊은 가이드 없음
- SEO: "taiwan digital nomad visa 2026", "taiwan DNV requirements"

**A-3. E-7 → F-2 Path Simulator 컨텐츠 심화** (3순위, 1일)
- 전환 요건 상세화, 포인트 계산 예시, 타임라인
- Path Simulator의 킬러 유스케이스 → 공유 가능 URL로 바이럴 가능성

**A-4. H-1 워킹홀리데이 차별화** (4순위, 1-2일)
- 국적별 맞춤 가이드 (쿼터, 연령, 협정국 차이)
- 쿼터 오픈 캘린더 (2026 시즌)
- 레드오션이므로 기존 경쟁자(GoGoHanguk, JENZA)와 다른 각도 필요

**A-5. 나머지 컨텐츠**
- 6개 한국 스텁 비자 풀 가이드 전환
- 대만 Phase 2 비자 추가 (Entrepreneur, Student, APRC)
- Dashboard i18n 완성

### Track B: 코드 안정화 (유지보수성)

**B-1. Playwright E2E 테스트 3개** (1일)
1. 홈 → 국가 선택 → 비자 대시보드 진입
2. 로그인 → 대시보드 → 데이터 로드
3. 비자 상세 → Path Simulator → 경로 선택
- CI: GitHub Actions에 `playwright test` 추가

**B-2. God Component 분할** (2-3일)

StateDashboard.tsx (770줄 → 3-4파일):
```
StateDashboard.tsx (orchestrator, ~100줄)
├── EmptyStateLanding.tsx (~200줄)
├── ActiveDashboard.tsx (~250줄)
└── dashboard-helpers.ts (~100줄)
```

DashboardClient.tsx (599줄 → 3-4파일):
```
DashboardClient.tsx (orchestrator, ~150줄)
├── DashboardDataProvider.tsx (~100줄)
├── DashboardSettings.tsx (~100줄)
└── DashboardContent.tsx (~200줄)
```

VisaDetailContent.tsx (632줄 → 5파일):
```
VisaDetailContent.tsx (tab router, ~100줄)
├── OverviewTab.tsx / DocumentsTab.tsx / ProcessTab.tsx / FAQTab.tsx
```

EligibilityQuiz.tsx (590줄 → 3파일):
```
EligibilityQuiz.tsx (stepper, ~100줄)
├── QuizStep.tsx (~150줄)
└── QuizResults.tsx (~200줄)
```

**B-3. 소규모 정리** (1일)
- `key={index}` 위험 ~10곳 → 고유 ID 사용
- Dead code: 중복 컴포넌트 3쌍 제거, 미사용 컴포넌트 확인 삭제
- bundles/areas 라우트 삭제

**B-4. 후순위 (유저 유입 이후)**
- Dashboard 쓰기 기능 (Settings 저장, 체크리스트 토글)
- 상태 관리 통일 (`useDashboardData()` 훅)
- Supabase 타입 완전 정비
- Bundle size 최적화, DOM depth 정리
- global-error.tsx + Sentry 도입

---

## 실행 순서 다이어그램

```
Day 1-2:  Sprint 0 (Hydration + SEO + Deploy)
          ↓
Day 3+:   ┌─── Track A: 컨텐츠 (F-1-D → DNV → Path Sim → H-1)
          │    Google 인덱싱 시작 ← 여기서부터 시간이 흐름
          │
          └─── Track B: 코드 (E2E 테스트 → God Component → 정리)
               유저에게 안 보이는 작업은 백그라운드로
```

---

## 실행 원칙

1. **Track A가 항상 우선** — 둘 중 하나만 할 수 있으면 컨텐츠 먼저
2. **배포는 자주** — 컨텐츠 하나 완성될 때마다 push (Google이 빨리 크롤링하도록)
3. **shadcn/ui 절대 수정 불가** — `components/ui/` 내 `key={index}`는 그대로
4. **Dashboard 쓰기는 유저 유입 이후** — 지금은 읽기 전용으로 충분
5. **Track B는 컨텐츠 배포를 블로킹하지 않는다** — 리팩토링 중에도 컨텐츠 배포 가능해야 함

---

## 예상 일정

| 항목 | 기간 | 비고 |
|------|------|------|
| Sprint 0 | 1-2일 | 즉시 시작, 배포까지 |
| Track A: F-1-D + DNV | 2-3일 | Sprint 0 직후 |
| Track A: Path Sim + H-1 | 2-3일 | 병행 |
| Track B: 테스트 + God Component | 3-4일 | Track A와 병행 |
| Track B: 소규모 정리 | 1일 | |
| **첫 배포까지** | **1-2일** | (기존 계획: 9-15일) |
| **핵심 컨텐츠 완성까지** | **5-7일** | (기존 계획: 14-22일) |
| **코드 안정화까지** | **5-7일** | Track A와 병행 |

---

## 성공 기준

| Metric | Before | After | 우선순위 |
|--------|--------|-------|---------|
| Google 인덱싱 | sitemap 미제출 | 전 페이지 인덱싱 | 🔴 최우선 |
| Hydration flash | 있음 | 없음 (CLS < 0.1) | 🔴 최우선 |
| SEO canonical/hreflang | 없음 | 전 페이지 적용 | 🔴 최우선 |
| F-1-D 가이드 깊이 | 기본 | 원스톱 완성 | 🔴 최우선 |
| 대만 DNV 가이드 | 기본 | 상세 확충 | 🔴 최우선 |
| Locale 누락 링크 | ~12곳 | 0곳 | 🟡 |
| `as any` | 4곳 | 0곳 | 🟡 |
| God Components (>300줄) | 6개 | 0개 | ⚪ |
| E2E 테스트 | 0개 | 3개+ | ⚪ |
| `key={index}` (위험) | ~10곳 | 0곳 | ⚪ |
| Dead/중복 코드 | 3쌍+5개 | 0 | ⚪ |
| Dashboard 쓰기 | 0 mutation | 3+ mutations | ⚪ 후순위 |

---

## Appendix: 외부 분석 검증 결과 (2026-02-16)

### 1차 분석 (5가지) — 검증 결과

| # | 이슈 | 검증 결과 | 실제 규모 |
|---|------|----------|----------|
| 1 | i18n 라우팅 깨짐 | ⚠️ 부분 유효 | `buildLocalePath()` 존재, 11곳만 누락 (NextActionCard 집중) |
| 2 | `as any` 타입 캐스팅 | ✅ 유효 | 4곳 (auth-provider 2, DashboardClient 2). database.types.ts 이미 존재 |
| 3 | `key={index}` | ⚠️ 과대 추정 | 47곳이 아닌 19곳. 위험한 곳 ~10곳 (나머지는 정적 스켈레톤) |
| 4 | Dashboard 빈껍데기 | ✅ 정확 | Settings 모달 저장 없음, Supabase 쓰기 0개, 보험 하드코딩 |
| 5 | 테스트 전무 | ✅ 정확 | 테스트 파일 0개 |

### 2차 분석 (5가지) — 검증 결과

| # | 이슈 | 검증 결과 | 근거 |
|---|------|----------|------|
| 6 | `unoptimized: true` | ❌ 사실 아님 | `next.config.mjs`에 해당 설정 없음. 기본값(최적화 ON) |
| 7 | Split-Brain 체크리스트 | ❌ 이미 해결 | `migrateOldChecklistData()` 함수 구현. 통일된 `visa-checklist-{type}` 키 사용 |
| 8 | 클라이언트 로직 보안 위험 | ❌ 의도적 설계 | 대만법 요건: 서버에 개인 이민 데이터 저장 금지. 퀴즈는 점수 산출 안 함 |
| 9 | Mapbox 무분별 로딩 | ❌ 이미 처리 | `lazy-map.tsx`에 `next/dynamic` + `ssr: false` + skeleton 구현 완료 |
| 10 | 에러 페이지 영어 하드코딩 | ❌ 사실 아님 | `error.tsx`에서 `useTranslations("error")` 사용, 이미 다국어 처리 |

**결론**: 1차 분석 5건 중 3건 유효 (2건은 규모 과대 추정), 2차 분석 5건 중 0건 유효.

### 3차 분석 (11-15번) — 검증 결과

| # | 이슈 | 검증 결과 | 근거 |
|---|------|----------|------|
| 11 | SEO canonical/hreflang 누락 | ✅ 유효 | metadataBase, canonical, hreflang, alternates 검색 0건. Phase 0에 추가 |
| 12 | 환경변수 미검증 | ❌ 사실 아님 | `client.ts`, `server.ts` 모두 존재 여부 체크 + 에러 메시지 구현 완료 |
| 13 | 하드코딩 비즈니스 규칙 | ❌ 과잉 우려 | 점수 산출 없음 (법률 요건). 비자 데이터는 JSON 정적 파일로 적절히 관리 |
| 14 | 접근성 법적 리스크 | ❌ 과장 | Skip-to-content 있음, shadcn/ui=Radix(aria 내장), 한국·대만 서비스에 미국 ADA 기준 부적절 |
| 15 | 미들웨어 시한폭탄 | ❌ 이미 인지 | middleware.ts:14에 TODO 주석. proxy.ts API 안정화 대기 중 (의도적) |

### 4차 분석 (16-25번) — 검증 결과

| # | 이슈 | 검증 결과 | 근거 |
|---|------|----------|------|
| 16 | 배럴 파일 저주 | ❌ 과장 | App Router 서버 컴포넌트 기반, barrel export의 클라이언트 번들 영향 제한적 |
| 17 | API Routes 과잉 | ❌ 과장 | API 라우트 1개(subscribe)뿐. 이메일 구독 용도에 적합 |
| 18 | 매직 스트링 지옥 | ❌ 사실 아님 | `lib/visa/types.ts`에 VisaType 타입 + 상수 배열 + 타입 가드 이미 존재 |
| 19 | 좀비 코드 | ⚠️ 부분 유효 | Stub/placeholder 존재하나 기존 Phase 1 Dead Code 정리에서 이미 커버 |
| 20 | Prop Drilling | ⚠️ 부분 유효 | God Component 분할(Phase 1)에서 자연 해소. 별도 항목 불필요 |
| 21 | 폼 검증 중복 | ❌ 추측 | Supabase Auth (Google OAuth). 이메일/비번 폼 검증이 핵심 경로 아님 |
| 22 | Tailwind 스파게티 | ❌ 해당 없음 | shadcn/ui 컴포넌트(수정 불가). cva 이미 사용 중 |
| 23 | 에러 로깅 부재 | ⚠️ 부분 유효 | global-error.tsx 없음, Sentry 없음. 다만 Vercel Analytics/SpeedInsights 있음. Phase 3 참고 |
| 24 | 폰트 Layout Shift | ❌ 사실 아님 | `next/font/google` Geist + `display: "swap"`. Next.js 자동 최적화 |
| 25 | Implicit Any | ❌ 사실 아님 | `tsconfig.json`에 `"strict": true` (noImplicitAny 포함) |

**총 결론**: 3·4차 분석 15건 중 **유효 1건(SEO canonical)**, 부분 유효 3건(이미 기존 계획에 포함), 나머지 11건은 코드를 읽지 않은 추측.
