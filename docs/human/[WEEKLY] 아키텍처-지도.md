# [WEEKLY] 아키텍처 지도 — v2

> **목적**: "이 앱이 어떻게 돌아가는지"를 한눈에 파악
> **v1 기록**: `docs/human/v1/[WEEKLY] 아키텍처-지도.md` 참고
> **상태**: ✅ Phase 1 완료 + 수리 A/B/C 완료 — 풀스택 F-1-D + Auth + Dashboard + 성능/접근성 최적화

---

## 1. Tech Stack

| 기술 | 버전 | 역할 |
|------|------|------|
| Next.js | 16.1.6 | 프레임워크 (App Router, RSC) |
| React | 19.2.3 | UI 라이브러리 |
| TypeScript | 5 | 타입 안전성 |
| Tailwind CSS | 4 | 스타일링 |
| shadcn/ui | New York, Slate | UI 컴포넌트 (수정 금지) |
| next-intl | 4.8.3 | 다국어 — 한국: en, zh-cn, vi, ja / 대만: en, zh-tw, vi |
| Supabase | ✅ 연동 완료 | 인증 (매직 링크) + DB (RLS) |
| Mapbox GL | (Phase 3) | 지도 |
| GA4 | ✅ 설정 완료 | 애널리틱스 |

## 2. 전체 구조

```
[사용자 브라우저 — 모바일 우선]
    │
    ├─ 랜딩 (/) → 히어로 + 국가 선택
    │
    ├─ 비자 정보 열람 (정적 — JSON 기반)
    │   ├─ /[locale]/[country]              → 국가별 비자 목록 (Phase 2에서 채워질 예정)
    │   ├─ /[locale]/[country]/visa/[type]  → 비자 상세 (F-1-D 완성)
    │   ├─ Comparison Tool (Phase 2)
    │   └─ Path Simulator (Phase 3)
    │
    ├─ 인증 (Supabase Auth — 매직 링크 OTP) ✅
    │   ├─ /login → 이메일 입력 → 매직 링크 발송
    │   ├─ /auth/confirm → "이메일 확인하세요" 안내
    │   └─ /auth/callback → 매직 링크 콜백 → 세션 생성
    │
    └─ 대시보드 (동적 — Supabase DB) ✅
        ├─ /onboarding → 국가 → 비자 → 만료일 설정
        ├─ /dashboard  → D-Day 카운트다운 + 체크리스트
        ├─ 점수제 비자 트래커 (Phase 3)
        └─ Tax Residency 트래커 (Phase 3)
```

## 3. 데이터 흐름

```
                        ┌─ 비자 정보 (정적) ─────────────────────────────┐
                        │                                                │
[data/visas/en/f-1-d.json] → getVisaData() ──→ Server Component → 비자 상세
[messages/*.json]           → next-intl     ──→ Server Component → UI 텍스트
                        │                                                │
                        └────────────────────────────────────────────────┘

                        ┌─ 사용자 데이터 (동적) ────────────────────────┐
                        │                                                │
[Supabase Auth]  → proxy.ts (세션 갱신) → getSession() (React.cache)    │
[Supabase DB]    → Server Actions (lib/actions/) ──→ 대시보드             │
                        │   ├─ getProfile()                              │
                        │   ├─ getActiveVisa()                           │
                        │   ├─ getChecklist()                            │
                        │   └─ toggleChecklistItem() (upsert)            │
                        └────────────────────────────────────────────────┘

비자 상세 페이지 렌더링 흐름:
┌──────────────────────────────────────────────────────────┐
│ page.tsx (Server)                                        │
│  ├─ Promise.all: getVisaData + getTranslations (병렬)     │
│  ├─ generateMetadata() → 동적 SEO                        │
│  ├─ Schema.org JSON-LD (FAQPage + HowTo + BreadcrumbList)│
│  │                                                       │
│  ├─ Breadcrumb (Server) — Home > Country > Visa          │
│  ├─ GlanceableZone (Server) — 요건 표 + 요약 카드         │
│  ├─ <Suspense> ← 로딩 스켈레톤 표시                       │
│  │   └─ AuthActionZone (Server) ← 인증 확인 후            │
│  │       └─ ActionZone (Client) — 체크리스트 + 절차        │
│  │           ├─ 비로그인: localStorage 저장                │
│  │           └─ 로그인: Supabase DB 저장 (optimistic)     │
│  ├─ ContextZone (Server) — FAQ + 팁 + 출처                │
│  └─ VisaDisclaimer (Server) — 법적 면책                   │
└──────────────────────────────────────────────────────────┘
```

📘 **React.cache**: 같은 요청 안에서 동일 함수 호출 결과를 재사용. getSession()이 여러 곳에서 불려도 Supabase 왕복 1회만 발생
📘 **Suspense**: 느린 서버 컴포넌트를 기다리는 동안 로딩 뼈대(스켈레톤)를 보여주는 React 기능
📘 **Server Actions**: `lib/actions/`에 모인 서버 함수들. DB 호출을 감싸서 인증 확인 + 에러 처리를 한 곳에서 관리

## 4. URL 구조 (next-intl 기반)

```
/                              → 루트 리다이렉트
/en                            → 영어 랜딩 (히어로)
/ja                            → 일본어 랜딩 (한국 타겟)
/zh-cn                         → 중국어 간체 랜딩 (한국 타겟)
/zh-tw                         → 중국어 번체 랜딩 (대만 타겟)
/vi                            → 베트남어 랜딩 (한국+대만 공통)
/en/korea                      → 한국 비자 목록 (Phase 2에서 구현)
/en/korea/visa/f-1-d           → F-1-D 비자 상세 ✅
/en/taiwan                     → 대만 비자 목록 (Phase 2에서 구현)
/en/taiwan/visa/gold-card      → Gold Card 상세 (Phase 2에서 구현)
/en/login                      → 로그인 (매직 링크) ✅
/en/auth/confirm               → 이메일 확인 안내 ✅
/en/onboarding                 → 온보딩 (국가→비자→만료일) ✅
/en/dashboard                  → 대시보드 (D-Day + 체크리스트) ✅
/en/terms                      → 이용약관
/en/privacy                    → 개인정보처리방침
/en/refund                     → 환불정책
```

## 5. 파일 구조

```
b2c-website/
├─ app/
│   ├─ layout.tsx                          # 루트 레이아웃
│   ├─ page.tsx                            # 루트 → locale 리다이렉트
│   ├─ globals.css                         # Tailwind + shadcn 테마
│   └─ [locale]/
│       ├─ layout.tsx                      # next-intl Provider + AuthNav(Server) + GA4 + Footer
│       ├─ page.tsx                        # 랜딩 (Hero)
│       ├─ (auth)/                         # 인증 페이지 그룹
│       │   ├─ login/page.tsx              # 매직 링크 로그인
│       │   └─ auth/
│       │       ├─ callback/route.ts       # 매직 링크 콜백 API
│       │       └─ confirm/page.tsx        # "이메일 확인하세요" 안내
│       ├─ (protected)/                    # 🔒 로그인 필요 (proxy.ts에서 보호)
│       │   ├─ layout.tsx                  # Protected 공통 레이아웃
│       │   ├─ loading.tsx                 # 대시보드 로딩 스켈레톤
│       │   ├─ error.tsx                   # 대시보드 에러 페이지
│       │   ├─ onboarding/page.tsx         # 온보딩 위저드
│       │   └─ dashboard/page.tsx          # ⭐ 대시보드 — D-Day + 체크리스트
│       ├─ (legal)/                        # 법적 페이지 그룹
│       │   ├─ layout.tsx
│       │   ├─ terms/page.tsx
│       │   ├─ privacy/page.tsx
│       │   └─ refund/page.tsx
│       └─ [country]/
│           ├─ page.tsx                    # 국가별 비자 목록 (Phase 2)
│           └─ visa/[type]/
│               ├─ page.tsx                # ⭐ 비자 상세 — 3-Layer + SEO + Suspense
│               ├─ loading.tsx             # 비자 상세 로딩 스켈레톤
│               └─ error.tsx               # 비자 상세 에러 페이지
├─ components/
│   ├─ auth/                               # 인증 컴포넌트
│   │   ├─ auth-nav.tsx                    # Server — 로그인/대시보드 링크 (60KB 번들 절감)
│   │   ├─ logout-button.tsx               # Client — 로그아웃 버튼만 분리
│   │   ├─ login-form.tsx                  # Client — 이메일 입력 + 에러 메시지 i18n
│   │   └─ index.ts
│   ├─ dashboard/                          # 대시보드 컴포넌트
│   │   ├─ onboarding-form.tsx             # Client — 국가→비자→만료일 위저드
│   │   ├─ dashboard-header.tsx            # Server — 비자명 + 국가
│   │   ├─ d-day-countdown.tsx             # D-Day 카운트다운
│   │   ├─ checklist-card.tsx              # 체크리스트 카드
│   │   └─ index.ts
│   ├─ visa/                               # 비자 상세 컴포넌트
│   │   ├─ glanceable-zone.tsx             # Server — 요건 표, 요약 카드
│   │   ├─ auth-action-zone.tsx            # Server — 인증 확인 → ActionZone에 props 전달
│   │   ├─ action-zone.tsx                 # Client — 체크리스트 (localStorage/Supabase 듀얼)
│   │   ├─ context-zone.tsx                # Server — FAQ + 팁 + 출처
│   │   ├─ visa-disclaimer.tsx             # Server — 법적 면책
│   │   └─ index.ts
│   ├─ navigation/                         # 네비게이션 컴포넌트
│   │   └─ breadcrumb.tsx                  # Breadcrumb (Home > Country > Visa)
│   ├─ landing/                            # 랜딩 섹션
│   │   ├─ hero.tsx
│   │   ├─ country-card.tsx
│   │   └─ index.ts
│   ├─ footer/
│   │   ├─ footer.tsx
│   │   └─ index.ts
│   └─ ui/                                 # shadcn/ui (수정 금지 ⛔)
│       ├─ accordion.tsx
│       ├─ button.tsx
│       └─ card.tsx
├─ lib/
│   ├─ actions/                            # Server Actions (DB 호출 래핑)
│   │   ├─ auth.ts                         # getSession() (React.cache), signOut()
│   │   └─ dashboard.ts                    # getProfile, getActiveVisa, getChecklist, toggleChecklistItem 등
│   ├─ supabase/                           # Supabase 클라이언트
│   │   ├─ env.ts                          # 환경변수 가드 (런타임 에러 메시지)
│   │   ├─ client.ts                       # 브라우저용
│   │   └─ server.ts                       # 서버용
│   ├─ types/
│   │   ├─ visa.ts                         # VisaBase + KoreaVisa + TaiwanVisa
│   │   └─ dashboard.ts                    # Profile, UserVisa, ChecklistItem
│   ├─ visa-data.ts                        # getVisaData(), getAvailableVisas() (Promise.all)
│   └─ utils.ts                            # cn() 유틸리티
├─ data/visas/                             # 비자 JSON 데이터 (국가별 언어 지원)
│   ├─ en/f-1-d.json                       # 한국+대만 공통
│   ├─ ja/f-1-d.json                       # 한국 타겟
│   ├─ zh-cn/                              # 한국 타겟 (간체) — Phase 2에서 추가
│   ├─ zh-tw/f-1-d.json                    # 대만 타겟 (번체)
│   └─ vi/                                 # 한국+대만 공통 — Phase 2에서 추가
├─ docs/
│   ├─ sql/                                # DB 마이그레이션
│   │   ├─ 001-auth-tables.sql             # profiles + user_visas + checklist_items + RLS
│   │   ├─ 002-rls-performance.sql         # (select auth.uid()) 최적화
│   │   └─ 003-schema-hardening.sql        # visa_type CHECK + preferred_locale 정리
│   ├─ human/                              # Gen님용 문서
│   └─ agent/                              # AI 에이전트용 문서
│       ├─ prompts/                        # 실행 프롬프트 (Phase A/B/C 등)
│       └─ reports/                        # 분석 리포트
├─ i18n/
│   ├─ navigation.ts
│   ├─ request.ts
│   └─ routing.ts
├─ messages/                                # UI 번역 파일 (5개 로케일)
│   ├─ en.json                             # 영어 — 한국+대만 공통
│   ├─ ja.json                             # 일본어 — 한국 타겟
│   ├─ zh-cn.json                          # 중국어 간체 — 한국 타겟 (추가 필요)
│   ├─ zh-tw.json                          # 중국어 번체 — 대만 타겟
│   └─ vi.json                             # 베트남어 — 한국+대만 공통
├─ proxy.ts                                # 미들웨어 — 인증 보호 + i18n + 세션 갱신
├─ .env.local                              # Supabase URL/Key + GA4 ID (git 미포함)
├─ components.json                         # shadcn/ui 설정
├─ tsconfig.json
└─ package.json
```

## 6. DB 스키마 (Supabase)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│ auth.users   │     │ profiles      │     │ user_visas        │
│ (Supabase)   │────→│ id (PK, FK)  │←────│ user_id (FK)     │
│              │     │ display_name  │     │ country           │
│              │     │ preferred_    │     │ visa_type         │
│              │     │   locale      │     │ expiry_date       │
│              │     │ created_at    │     │ is_active         │
│              │     │ updated_at    │     │ created_at        │
│              │     └──────────────┘     │ updated_at        │
│              │                           └────────┬─────────┘
│              │                                    │
│              │                           ┌────────▼─────────┐
│              │                           │ checklist_items   │
│              │                           │ user_visa_id (FK) │
│              │                           │ document_id       │
│              │                           │ checked           │
│              │                           │ checked_at        │
│              │                           └──────────────────┘

RLS: 모든 테이블에 Row Level Security 적용
     (select auth.uid()) 패턴으로 최적화됨
트리거: auth.users INSERT → profiles 자동 생성
        UPDATE → updated_at 자동 갱신
```

📘 **RLS (Row Level Security)**: "이 유저는 자기 데이터만 읽기/쓰기 가능" 규칙을 DB 레벨에서 강제. 앱 코드에서 WHERE 절을 빼먹어도 DB가 자동 필터링.

## 7. 브라우저 전용 데이터

| 데이터 | 이유 |
|--------|------|
| 서류 체크리스트 (비로그인 시 localStorage) | 로그인 없이 체크 가능. 로그인 시 Supabase로 전환 (마이그레이션 없음) |
| File Sanitizer 파일 (post-MVP) | 개인정보 보호 |
| 대만 퀴즈/체크리스트 데이터 | 대만 법규 컴플라이언스 (Immigration Act §56) |

## 8. 변경 영향도 맵

| 변경 대상 | 영향 범위 | 위험도 |
|-----------|----------|--------|
| `messages/*.json` | 모든 페이지 텍스트 | 🟢 낮음 |
| `data/visas/**/*.json` | 비자 상세 페이지 내용 | 🟢 낮음 |
| `docs/sql/*.sql` | DB 스키마 — Supabase SQL Editor에서 실행 | 🟢 낮음 |
| `components/visa/*` | 비자 상세 페이지 3-Layer — Phase 2 복제 대상 | 🟡 중간 |
| `lib/actions/*` | 서버 액션 — DB 호출 로직 | 🟡 중간 |
| `app/globals.css` | 전체 테마/색상 | 🟡 중간 |
| `lib/types/visa.ts` | 비자 데이터 구조 — Phase 2 복제에 영향 | 🟡 중간 |
| `lib/visa-data.ts` | 비자 데이터 로딩 로직 | 🟡 중간 |
| `components/ui/*` | 수정 금지 — shadcn 관리 | 🔴 높음 |
| `i18n/routing.ts` | 전체 URL 구조 | 🔴 높음 |
| `proxy.ts` | 모든 요청 경유 — 인증 + i18n + 라우트 보호 | 🔴 높음 |
| `app/[locale]/layout.tsx` | 모든 페이지 래핑 + AuthNav + GA4 + Footer | 🔴 높음 |

## 9. RSC 비율 현황

| 컴포넌트 | 유형 | "use client" |
|----------|------|-------------|
| visa/[type]/page.tsx | Server | ❌ |
| glanceable-zone.tsx | Server | ❌ |
| auth-action-zone.tsx | Server | ❌ |
| action-zone.tsx | **Client** | ✅ — 체크리스트 (localStorage/Supabase 듀얼) |
| context-zone.tsx | Server | ❌ |
| visa-disclaimer.tsx | Server | ❌ |
| auth-nav.tsx | Server | ❌ — Client→Server 전환 완료 (60KB 절감) |
| logout-button.tsx | **Client** | ✅ — signOut 액션 호출만 |
| login-form.tsx | **Client** | ✅ — 이메일 입력 + OTP |
| onboarding-form.tsx | **Client** | ✅ — 온보딩 위저드 |
| checklist-card.tsx | **Client** | ✅ — 대시보드 체크리스트 |
| hero.tsx | Client | ✅ |
| country-card.tsx | Client | ✅ |

→ 비자 상세 페이지 Client 비율: **1/6 = ~17%** ✅ 목표(20%) 달성
→ 전체 앱 Client 비율: 7/13 ≈ 54% — 대시보드/인증이 Client 비중 높음 (인터랙션 중심이므로 정상)

---

*마지막 업데이트: 2026-02-27 — Phase 1 완료 + 수리 A/B/C 완료 + 국가별 언어 지원 결정*
*다음 업데이트: Phase 2 시작 시*
