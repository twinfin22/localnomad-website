# [WEEKLY] 아키텍처 지도 — v2

> **목적**: "이 앱이 어떻게 돌아가는지"를 한눈에 파악
> **v1 기록**: `docs/human/v1/[WEEKLY] 아키텍처-지도.md` 참고
> **상태**: ✅ Phase 1-3 완료 — 비자 상세 3-Layer 템플릿 + SEO + 체크리스트

---

## 1. Tech Stack

| 기술 | 버전 | 역할 |
|------|------|------|
| Next.js | 16.1.6 | 프레임워크 (App Router, RSC) |
| React | 19.2.3 | UI 라이브러리 |
| TypeScript | 5 | 타입 안전성 |
| Tailwind CSS | 4 | 스타일링 |
| shadcn/ui | New York, Slate | UI 컴포넌트 (수정 금지) |
| next-intl | 4.8.3 | 다국어 (en, ja, zh-tw) |
| Supabase | (Phase 2) | 인증 + DB |
| Mapbox GL | (Phase 3) | 지도 |
| GA4 | ✅ 설정 완료 | 애널리틱스 |

## 2. 전체 구조

```
[사용자 브라우저 — 모바일 우선]
    │
    ├─ 랜딩 (/) → 히어로 + 국가 선택
    │
    ├─ 비자 정보 열람 (정적 — JSON 기반)
    │   ├─ /[locale]/[country]              → 국가별 비자 목록
    │   ├─ /[locale]/[country]/visa/[type]  → 비자 상세
    │   ├─ Comparison Tool (Phase 2)
    │   └─ Path Simulator (Phase 2)
    │
    ├─ 인증 (Supabase Auth — 매직 링크, Phase 2)
    │
    └─ 대시보드 (동적 — Supabase DB, Phase 3)
        ├─ D-Day 카운트다운
        ├─ 체크리스트 진행
        ├─ 점수제 비자 트래커
        └─ Tax Residency 트래커
```

## 3. 데이터 흐름 (Phase 1-3 기준)

```
[data/visas/en/f-1-d.json] → getVisaData() → Server Component → 비자 상세 페이지
[messages/*.json]           → next-intl     → Server Component → UI 텍스트
[localStorage]              → useChecklist() → Client Component → 체크 상태 저장

                                    │
                        ┌───────────┴───────────┐
                        │                       │
                   layout.tsx              page.tsx (Server)
                (NextIntlClientProvider)   ├─ generateMetadata() → 동적 SEO
                   + Footer               ├─ Schema.org JSON-LD (FAQPage + HowTo)
                   + GA4                   │
                        │                  └─ 비자 상세 3-Layer:
                   Hero (Client)               ├─ GlanceableZone (Server) — 요건 표 + 요약 카드
                   └─ CountryCard              ├─ ActionZone (Client) — 체크리스트 + 절차 스텝
                                               │   └─ localStorage 저장: localnomad:checklist:{country}:{type}
                                               ├─ ContextZone (Server) — FAQ(details/summary) + 출처
                                               └─ VisaDisclaimer (Server) — 법적 면책
```

📘 **데이터 로더 (`lib/visa-data.ts`)**: JSON 파일에서 비자 데이터를 읽어오는 함수.
`getVisaData('korea', 'en', 'f-1-d')` → F-1-D JSON 반환. locale 폴백 지원 (ja 없으면 en 반환)

📘 **Server Component**: 서버에서 미리 HTML을 만들어서 보내는 방식. 빠르고 SEO에 좋음
📘 **Client Component**: 브라우저에서 실행. 클릭, 입력 등 인터랙션이 필요할 때만 사용
📘 **3-Layer 구조**: Glanceable(한눈에 파악) → Action(체크리스트/절차) → Context(FAQ/출처). 정보를 계층화하여 mobile에서 스크롤 최소화

## 4. URL 구조 (next-intl 기반)

```
/                              → 루트 리다이렉트
/en                            → 영어 랜딩 (히어로)
/ja                            → 일본어 랜딩
/zh-tw                         → 중국어 랜딩
/en/korea                      → 한국 비자 목록
/en/korea/visa/f-1-d           → F-1-D 비자 상세
/en/taiwan                     → 대만 비자 목록
/en/taiwan/visa/gold-card      → Gold Card 상세
/en/terms                      → 이용약관
/en/privacy                    → 개인정보처리방침
/en/refund                     → 환불정책
```

## 5. 파일 구조 (Phase 1-3 기준)

```
b2c-website/
├─ app/
│   ├─ layout.tsx                          # 루트 레이아웃
│   ├─ page.tsx                            # 루트 → locale 리다이렉트
│   ├─ globals.css                         # Tailwind + shadcn 테마
│   └─ [locale]/
│       ├─ layout.tsx                      # next-intl Provider + GA4 + Footer
│       ├─ page.tsx                        # 랜딩 (Hero)
│       ├─ (legal)/                        # 법적 페이지 그룹
│       │   ├─ layout.tsx                  # 법적 페이지 공통 레이아웃
│       │   ├─ terms/page.tsx              # 이용약관 (행정사법/변호사법 면책 포함)
│       │   ├─ privacy/page.tsx            # 개인정보처리방침 (Supabase/GA4)
│       │   └─ refund/page.tsx             # 환불정책 (현재 무료 서비스)
│       └─ [country]/
│           ├─ page.tsx                    # 국가별 비자 목록
│           └─ visa/[type]/page.tsx        # ⭐ 비자 상세 — 3-Layer + SEO + JSON-LD
├─ components/
│   ├─ footer/                             # 푸터
│   │   ├─ footer.tsx                      # © + Terms/Privacy/Refund + SNS
│   │   └─ index.ts
│   ├─ landing/                            # 랜딩 섹션
│   │   ├─ hero.tsx
│   │   ├─ country-card.tsx
│   │   └─ index.ts
│   ├─ visa/                               # ⭐ Phase 1-3 추가 — 비자 상세 컴포넌트
│   │   ├─ glanceable-zone.tsx             # Server — 요건 표, 요약 카드, 소득/근무 조건
│   │   ├─ action-zone.tsx                 # Client ("use client") — 체크리스트(localStorage) + 절차 스텝
│   │   ├─ context-zone.tsx                # Server — FAQ(details/summary) + 팁 + 출처 + 관련 비자
│   │   ├─ visa-disclaimer.tsx             # Server — 한국/대만 법적 면책 (대만은 영어+繁體中文)
│   │   └─ index.ts                        # 배럴 export
│   └─ ui/                                 # shadcn/ui (수정 금지 ⛔)
│       ├─ accordion.tsx
│       ├─ button.tsx
│       └─ card.tsx
├─ data/visas/                             # 비자 JSON 데이터
│   ├─ en/f-1-d.json                       # F-1-D 영어
│   ├─ ja/f-1-d.json                       # F-1-D 일본어
│   └─ zh-tw/f-1-d.json                    # F-1-D 중국어
├─ i18n/
│   ├─ navigation.ts
│   ├─ request.ts
│   └─ routing.ts
├─ lib/
│   ├─ types/
│   │   └─ visa.ts                         # VisaBase + KoreaVisa + TaiwanVisa
│   ├─ visa-data.ts                        # getVisaData() 데이터 로더
│   └─ utils.ts                            # cn() 유틸리티
├─ messages/
│   ├─ en.json                             # 영어 (+ VisaDetail 키 추가)
│   ├─ ja.json                             # 일본어
│   ├─ zh-tw.json                          # 중국어(번체)
│   └─ vi.json                             # 베트남어 (다음 페이즈에서 정리)
├─ .env.local                              # GA4 ID (git 미포함)
├─ components.json                         # shadcn/ui 설정
├─ next.config.ts                          # Next.js 설정
├─ tsconfig.json                           # TypeScript 설정
└─ package.json                            # 의존성
```

## 6. 브라우저 전용 데이터

| 데이터 | 이유 |
|--------|------|
| 서류 체크리스트 진행도 (localStorage) | Phase 1-3: 로그인 없이 브라우저 저장. Phase 1-4에서 Supabase로 전환 예정 |
| File Sanitizer 파일 (post-MVP) | 개인정보 보호 |
| 대만 퀴즈/체크리스트 데이터 | 대만 법규 컴플라이언스 (Immigration Act §56) |

## 7. 변경 영향도 맵

| 변경 대상 | 영향 범위 | 위험도 |
|-----------|----------|--------|
| `messages/*.json` | 모든 페이지 텍스트 | 🟢 낮음 |
| `data/visas/**/*.json` | 비자 상세 페이지 내용 | 🟢 낮음 |
| `components/visa/*` | 비자 상세 페이지 3-Layer — Phase 2 복제 대상 | 🟡 중간 |
| `app/globals.css` | 전체 테마/색상 | 🟡 중간 |
| `lib/types/visa.ts` | 비자 데이터 구조 — Phase 2 복제에 영향 | 🟡 중간 |
| `lib/visa-data.ts` | 비자 데이터 로딩 로직 | 🟡 중간 |
| `components/ui/*` | 수정 금지 — shadcn 관리 | 🔴 높음 |
| `i18n/routing.ts` | 전체 URL 구조 | 🔴 높음 |
| `app/[locale]/layout.tsx` | 모든 페이지 래핑 + GA4 + Footer | 🔴 높음 |

## 8. RSC 비율 현황 (Phase 1-3 기준)

| 컴포넌트 | 유형 | "use client" |
|----------|------|-------------|
| visa/[type]/page.tsx | Server | ❌ |
| glanceable-zone.tsx | Server | ❌ |
| action-zone.tsx | **Client** | ✅ — 체크리스트 localStorage |
| context-zone.tsx | Server | ❌ |
| visa-disclaimer.tsx | Server | ❌ |
| hero.tsx | Client | ✅ |
| country-card.tsx | Client | ✅ |

→ 비자 상세 페이지 Client 비율: **1/5 = 20%** ✅ 목표 달성

---

*마지막 업데이트: 2025-02-20 — Phase 1-3 완료 후*
*다음 업데이트: Phase 1-4 완료 시*
