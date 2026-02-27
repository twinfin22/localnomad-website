# [WEEKLY] 의사결정 일지 — v2

> **목적**: "왜 이렇게 했지?"를 나중에 찾아볼 수 있도록 기록
> **v1 기록**: `docs/human/v1/[WEEKLY] 의사결정-일지.md` 참고

## 읽는 법
- **맥락**: 왜 이 결정이 필요했는지
- **선택지**: 어떤 옵션들이 있었는지 (장단점 포함)
- **결정**: 뭘 선택했는지
- **이유**: 왜 이걸 선택했는지
- **📘 배경지식**: 결정에 필요한 기술적 맥락 (있을 때만)

---

## 2025-02-19

### v2 재구축 결정

- **맥락**: v1에서 오너십 부채(AI에게 과도하게 위임) + 기술 부채(flickering 미해결)가 누적. 부분 수정보다 처음부터 다시 만드는 게 빠르다고 판단.
- **결정**: v1 전체 아카이브 → v2 처음부터 재구축
- **이유**: v1의 문제를 패치하면 할수록 복잡도만 증가. 클린 상태에서 올바른 아키텍처로 시작하는 게 장기적으로 빠름.
- **📘 배경지식**: `v1-archive` 브랜치에 v1 코드 보존. `git checkout v1-archive -- 파일경로`로 특정 파일을 꺼내 쓸 수 있음. 인벤토리: `docs/agent/reference/v1-archive-inventory.md`

### Tech Stack 결정 보류

- **맥락**: v1에서 Next.js flickering 미해결 → Astro가 대안이 될 수 있음
- **선택지**: (A) Next.js 16 (v1 동일) (B) Astro + React island
- **결정**: 스펙 확정 후 결정
- **이유**: 기능이 확정되어야 프레임워크 적합성 판단 가능. 특히 대시보드의 동적 기능 비중에 따라 최적 선택이 달라짐.

### MVP 빌드 순서: 옵션 C (하이브리드)

- **맥락**: 3가지 빌드 순서 옵션 비교
- **선택지**: (A) 콘텐츠 퍼스트 (B) 풀스택 슬라이스 (C) 하이브리드
- **결정**: C — 골격 + F-1-D 풀스택 → 확장
- **이유**: A의 "빠른 배포"와 B의 "Auth 리스크 조기 발견"을 동시에 달성. Phase 1에서 F-1-D 하나로 전체 아키텍처 검증 → Phase 2에서 검증된 템플릿을 복제.

### Mobile First 최우선 원칙

- **맥락**: 타겟 유저(한국/대만 체류 외국인)가 주로 모바일로 비자 정보 검색
- **결정**: Mobile First를 디자인 원칙 1번으로 확정. 다른 것을 희생해도 모바일 UX 우선. Trade-off 발생 시 Gen에게 보고 후 결정.
- **이유**: Reactive + intuitive UX가 이 제품의 핵심 가치.

### 이메일 알림 MVP 제외

- **맥락**: 대시보드 알림을 어떻게 전달할지
- **결정**: MVP에서는 대시보드 내 시각적 표시만. 이메일 알림은 post-MVP.
- **이유**: 이메일 서비스(Resend, SendGrid) 연동 + 발송 시나리오 설계는 MVP 범위를 넘김.

### 대시보드 유료화 기준

- **맥락**: 수익화 시점과 범위
- **결정**: MAU 100 도달 시 대시보드 유료 전환. 비자 정보 열람은 영구 무료.
- **이유**: 정보 열람 무료 → SEO/유입 채널 유지. 대시보드(개인화 기능)에 비용을 부과하면 가치 대비 지불 의사가 있는 유저만 남음.

### 비자 데이터 Single Source of Truth

- **맥락**: 비자 요건 데이터의 공식 출처
- **결정**: HiKorea Visa Navigator PDF를 Single Source of Truth로 지정
- **이유**: 정부 공식 자료. 블로그/커뮤니티 정보는 부정확할 수 있음.

### Tech Stack: Next.js 16 + RSC 규율

- **맥락**: v1 flickering 미해결로 Astro가 대안으로 떠올랐으나, RSC를 제대로 쓰면 같은 효과를 낼 수 있다는 판단
- **선택지**: (A) Next.js 16 + RSC 규율 (B) Astro + React island
- **결정**: A — Next.js 16 + App Router + RSC 규율
- **이유**: v1 실패 원인은 Next.js가 아니라 "use client" 남용. Server Component를 기본으로 하고 상호작용 필요한 조각만 Client로 분리하면 Astro의 island 패턴과 동일한 효과. 러닝커브 없음, next-intl/shadcn/ui 생태계 성숙, AI 도구 지원도 더 좋음. 한국/대만 4G 환경에서 React 런타임(~85KB)은 체감 불가 수준.
- **📘 배경지식**: RSC(React Server Component)는 서버에서 HTML을 완성해서 보내는 컴포넌트. JS가 브라우저에 전송되지 않아 빠름. "use client"를 붙여야만 브라우저에서 JS가 실행됨. v2의 핵심 규율: Client Component 비율 20% 이하 유지.

### Google Analytics (GA4) 확정

- **맥락**: MAU 100 유료화 기준을 측정할 Analytics 도구 선택
- **선택지**: (A) Vercel Analytics (간편) (B) Google Analytics (무료, 상세) (C) Plausible (프라이버시 친화, 유료)
- **결정**: B — Google Analytics (GA4)
- **이유**: 무료이면서 상세한 이벤트 트래킹 가능. MAU 대시보드 바로 확인 가능.

### 랜딩 페이지 히어로 확정

- **맥락**: localnomad.club 첫 화면 구성
- **결정**: 옵션 B (가치 제안 + CTA). Stripe/Linear/Notion 스타일 — 솔리드 배경(`#1B4965`) + 강한 타이포그래피, 이미지 없음.
- **헤드라인**: "Visa clarity, finally."
- **부제**: "Everything you need to know about your Korea or Taiwan visa, organized so you don't have to be."
- **CTA**: 한국/대만 카드 2개
- **이유**: 타이포그래피 + 컬러만으로 "clarity" 메시지 전달. 이미지 없음 = LCP 최소화 + Mobile First.

### Core Web Vitals 목표 확정

- **맥락**: Mobile First 제품의 성능 목표치 설정
- **결정**: Google "좋음" 구간 — LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms
- **📘 배경지식**: CWV = Google이 사이트 UX를 측정하는 3지표. LCP(로딩 체감), CLS(레이아웃 밀림), INP(터치 반응). 검색 순위에 영향.

### shadcn/ui 설정 확정

- **맥락**: shadcn/ui 초기화 시 선택 필요한 설정값
- **결정**: Style = New York, Base color = Slate, CSS variables = Yes
- **이유**: New York은 각지고 밀도 높은 UI — Linear/Stripe 레퍼런스와 톤 일치. Slate는 브랜드 컬러(`#1B4965` 딥 틸)와 푸른 톤 매칭. CSS variables는 추후 다크 모드 대비.
- **📘 배경지식**: shadcn/ui는 컴포넌트를 프로젝트에 직접 복사하는 방식. `components.json`에 스타일 설정 저장. New York vs Default = 각진 밀도 높은 UI vs 둥근 여유 있는 UI.

### 릴리즈 전략: main 직접 배포

- **맥락**: Vercel auto-deploy 기반 배포 프로세스
- **결정**: main 브랜치 직접 배포 (옵션 A). 큰 기능은 PR → Vercel Preview → 확인 → 머지.
- **이유**: 솔로 개발에 staging 브랜치나 feature flag는 과한 복잡도. Vercel Preview가 실질적 staging 역할.

### 런칭 시점: Phase 1 소프트 런칭

- **맥락**: 언제 공개할지
- **결정**: Phase 1 완료 시 소프트 런칭 (F-1-D 하나만으로). 런칭 채널/방법은 Phase 1 완료 시 별도 논의.
- **이유**: 빠른 피드백 확보. 완성도보다 속도 우선.

### JSON 스키마: 공통 베이스 + 국가별 확장 (Option B)

- **맥락**: 한국/대만 비자 데이터 타입을 어떻게 설계할지
- **선택지**: (A) 완전 분리 (`visa-korea.ts` + `visa-taiwan.ts` + `visa-common.ts`) (B) 공통 베이스 + 국가별 확장 (`VisaBase` → `KoreaVisa` / `TaiwanVisa`)
- **결정**: B — 공통 베이스 + 국가별 확장
- **이유**: 전체 필드의 ~80%가 공통 (documents, faqs, applicationSteps 등). 완전 분리하면 같은 코드가 두 벌이 됨. 한국 전용 3개 (insuranceRequirement, gniBasedIncome, fixedIncomeRequirement), 대만 전용 5개 (agencySteps, tecoInfo, goldCardFields, goldCardComparison, tecoRouting)만 확장.
- **📘 배경지식**: TypeScript의 `extends`를 사용. `KoreaVisa extends VisaBase`는 "VisaBase의 모든 필드를 포함하고, 한국 전용 필드를 추가한 타입"이라는 뜻.

### 타입 파일 단계별 분리

- **맥락**: v1은 `types.ts` 한 파일에 400줄 (비자+대시보드+퀴즈+비교+API 전부)
- **결정**: 용도별 분리 — `visa.ts` (Phase 1-2), `dashboard.ts` (Phase 1-4), `comparison.ts` (Phase 2)
- **이유**: 해당 Phase에서 필요한 파일만 만듦. 코드 가독성 향상. 성능 차이는 없음 (트리쉐이킹이 미사용 코드 자동 제거).
- **📘 배경지식**: 트리쉐이킹 = 빌드 시 실제 사용되는 코드만 최종 파일에 포함. 안 쓰는 타입/함수는 자동 제거됨.

### 법적 페이지 v2 업데이트

- **맥락**: v1 법적 페이지가 "Soft Landing" 컨설팅 서비스 기준 → v2는 비자 정보 플랫폼
- **결정**: Terms/Privacy는 v2 서비스에 맞게 수정, Refund는 "현재 무료 서비스" 한 줄로 교체
- **주요 변경**: 서비스 설명(Playbook/컨설팅 → 비자 정보 플랫폼), 제3자 서비스(LemonSqueezy/Calendly → Supabase/GA4), 결제 조항(유료 → 현재 무료)
- **유지**: 행정사법/변호사법 면책 조항 (Section 4) — v2에서도 법적으로 필수

### F-1-D 데이터: v1 그대로 사용

- **맥락**: Visa Navigator PDF와 대조하려 했으나 PDF가 2023.05 버전 → F-1-D (2024.01 도입) 정보 없음
- **결정**: v1 JSON 데이터 그대로 사용. `eligibilityQuestions` 필드만 제거 (v2에서 eligibility quiz 안 함)
- **이유**: v1 데이터가 HiKorea/출입국관리사무소 기반으로 작성됨. `lastUpdated: 2026-02-16`으로 최신.

### GA4 설정 방식

- **맥락**: GA4 Measurement ID를 코드에 어떻게 포함할지
- **결정**: `.env.local` 환경변수 (`NEXT_PUBLIC_GA_ID`). `@next/third-parties` 패키지 사용.
- **이유**: `.env.local`은 `.gitignore`에 포함되어 GitHub에 안 올라감. 단, GA4 Measurement ID 자체는 민감정보가 아님 — 웹사이트 소스코드에 공개적으로 노출되는 값.
- **📘 배경지식**: `NEXT_PUBLIC_` 접두사가 붙은 환경변수는 브라우저에서도 접근 가능 (클라이언트 번들에 포함). GA4 스크립트가 브라우저에서 실행되어야 하므로 이 접두사 필요.

---

## 2025-02-20

### 비자 상세 페이지 컴포넌트 구조: Zone별 분리 (Option B)

- **맥락**: Phase 1-3 F-1-D 비자 상세 페이지 구현 시 컴포넌트를 어떻게 나눌지
- **선택지**: (A) 단일 파일 — page.tsx 하나에 전부 (B) Zone별 분리 — 3개 Zone 각각 별도 컴포넌트 (C) 세부까지 분리 — Zone + 내부 요소별 컴포넌트 10개+
- **결정**: B — Zone별 분리
- **이유**: A는 Action Zone의 "use client"가 페이지 전체를 Client로 만들어 RSC 규율 위반. C는 Phase 1에서 과한 추상화. B가 RSC 규율 준수(Client는 ActionZone 하나만) + Phase 2 복제 용이성의 균형점.
- **📘 배경지식**: page.tsx(Server)가 orchestrator 역할, GlanceableZone(Server) + ActionZone(Client) + ContextZone(Server) + VisaDisclaimer(Server)로 구성. "use client"는 ActionZone 하나에만 존재.

### 체크리스트 인터랙션: localStorage (로컬 저장)

- **맥락**: 서류 체크리스트를 클릭했을 때 저장 방식. Supabase(서버 DB)는 Phase 1-4에서 추가 예정.
- **선택지**: (A) 읽기 전용 — 보기만, Phase 1-4에서 클릭 추가 (B) localStorage — 브라우저 임시 저장, 로그인 없이 작동
- **결정**: B — localStorage
- **이유**: 사용자가 비자 상세 페이지에서 바로 체크리스트를 사용할 수 있어 UX가 좋음. Phase 1-4에서 Supabase 연결 시 서버 저장으로 전환 예정.
- **📘 배경지식**: localStorage는 브라우저에 데이터를 저장하는 Web API. 키: `localnomad:checklist:{country}:{visaType}`, 값: `{ documentId: boolean }`. 같은 브라우저에서는 새로고침 후에도 유지되지만, 다른 기기에서는 안 보임. hydration mismatch 방지를 위해 useEffect에서 읽기.

### FAQ 구현: HTML details/summary (네이티브)

- **맥락**: FAQ 접기/펼치기 구현 방식 선택
- **선택지**: (A) shadcn Accordion — 부드러운 애니메이션, Client Component (~3-5KB JS) (B) HTML details/summary — 브라우저 네이티브, JS 0바이트, Server Component 유지
- **결정**: B — HTML details/summary
- **이유**: FAQ는 Context Zone(페이지 하단)에 위치하여 성능 체감 차이 없음. JS 0바이트로 Server Component를 유지하면 RSC 비율 목표 달성에 유리. CSS `group-open:rotate-180`으로 chevron 회전 애니메이션 가능.

---

## 2025-02-20 (Phase 1-4)

### ERD: 정규화 3테이블 (Option B)

- **맥락**: 인증 + 대시보드 구현을 위한 DB 설계. profiles, user_visas, checklist 데이터를 어떻게 저장할지
- **선택지**: (A) 최소 2테이블 — profiles + user_visas에 checklist를 JSONB로 포함 (B) 정규화 3테이블 — profiles + user_visas + checklist_items 분리 (C) JSONB 2테이블 — profiles + user_visas에 checklist를 JSON 배열로 저장
- **결정**: B — 정규화 3테이블
- **이유**: 체크 1개 토글 시 A/C는 JSONB 전체를 읽고-수정하고-덮어쓰는 반면, B는 해당 행 1개만 UPDATE. 유저 경험이 더 빠름. RLS도 테이블 단위로 적용되므로 보안 설계가 깔끔함.
- **📘 배경지식**: 정규화 = 데이터를 작은 테이블로 분리하여 중복 방지. JSONB = 하나의 컬럼에 JSON 형태로 여러 데이터를 저장. 정규화가 읽기/쓰기 단위가 작아서 성능 유리, JSONB는 유연하지만 부분 업데이트가 비효율적.

### 인터페이스: Server Action 래핑 (Option Y)

- **맥락**: 프론트엔드에서 Supabase DB를 어떻게 호출할지
- **선택지**: (X) 직접 호출 — 컴포넌트에서 Supabase 클라이언트 직접 사용 (Y) Server Action 래핑 — `lib/actions/`에 함수를 만들어 Supabase 호출을 감싸기
- **결정**: Y — Server Action 래핑
- **이유**: 비즈니스 로직(인증 확인, 에러 처리 등)이 한 곳에 모여서 유지보수 용이. 타입 안전성도 높아짐. 속도 차이는 없음 — 둘 다 서버에서 실행됨.
- **📘 배경지식**: Server Action = Next.js가 제공하는 서버 함수. "use server" 선언 후 클라이언트에서 일반 함수처럼 호출하면 자동으로 서버에서 실행됨.

### localStorage ↔ Supabase 마이그레이션: 없음

- **맥락**: Phase 1-3에서 localStorage로 저장한 체크리스트를 로그인 후 Supabase로 옮길지
- **선택지**: (A) 자동 마이그레이션 — 로그인 시 localStorage → Supabase 동기화 (B) 없음 — 로그인 후 새로 시작
- **결정**: 없음 (B)
- **이유**: 마이그레이션 로직이 복잡하고 (비자 종류 불일치, 중복 데이터 등) 에지 케이스가 많음. 체크리스트 항목이 5~10개 수준이라 다시 체크해도 30초면 됨.

### 온보딩: 온보딩 플로우

- **맥락**: 첫 로그인 후 비자 정보를 어떻게 수집할지
- **선택지**: (A) 온보딩 위저드 — 국가 → 비자 → 만료일 단계별 입력 (B) 대시보드에서 직접 설정
- **결정**: 온보딩 위저드 (A)
- **이유**: 단계별 UI가 "다음에 뭘 해야 하지?" 부담을 줄여줌. 대시보드 직접 설정은 빈 화면에서 시작해야 해서 첫 경험이 나쁨.

### preferred_locale 필드: 미리 추가

- **맥락**: profiles 테이블에 사용자 선호 언어 필드를 언제 추가할지
- **결정**: 테이블 생성 시 미리 추가
- **이유**: 나중에 ALTER TABLE 하는 것보다 처음부터 포함하는 게 마이그레이션 부담 없음. 사용은 Phase 2에서.

### user_visas UNIQUE 제거: 재신청 고려

- **맥락**: 한 유저가 같은 비자를 여러 번 신청할 수 있는지
- **결정**: (user_id, visa_type) UNIQUE 제약 없음. is_active 플래그로 현재 활성 비자만 관리.
- **이유**: 비자 재신청, 만료 후 재취득 등 현실적 시나리오 대응. UNIQUE가 있으면 이전 기록을 삭제해야 하는 문제.

---

## 2026-02-27 (수리 작업 Phase A/B/C)

### Backend Stack: Supabase 유지, Prisma 도입 보류

- **맥락**: 백엔드 감사 결과 Prisma ORM / Prisma Postgres 도입 여부 검토
- **결정**: Supabase Postgres + Supabase Auth 유지. Prisma 도입 안 함.
- **이유**: RLS 기반 보안 모델이 Prisma와 호환 불가 (Prisma는 service-role key로 RLS 우회). 3개 테이블 규모에서 ORM 도입은 오버엔지니어링. Type-safety는 `supabase gen types`로 해결 가능.
- **📘 배경지식**: RLS(Row Level Security) = DB 레벨에서 "이 행은 이 유저만 읽기/쓰기 가능" 규칙 강제. Prisma = Node.js용 ORM(Object-Relational Mapping) — DB를 코드로 조작하는 도구인데 RLS를 우회함.

### RLS 성능 최적화: `(select auth.uid())` 래핑

- **맥락**: 감사에서 RLS 정책 10개가 매 행마다 auth.uid()를 재평가하는 문제 발견
- **결정**: 모든 RLS 정책에서 `auth.uid()` → `(select auth.uid())`로 변경
- **이유**: Postgres 플래너가 한 번만 평가하게 만드는 최적화. 대규모 테이블에서 10-100배 성능 향상. 위험도 제로.

### AuthNav: Server Component로 전환

- **맥락**: UI/UX 감사에서 AuthNav가 60KB Supabase SDK를 모든 페이지에 전송하는 문제 발견
- **결정**: AuthNav를 Client → Server Component로 전환. 로그아웃 버튼만 작은 Client Component(logout-button.tsx)로 분리.
- **이유**: 60KB 번들 절감. 서버에서 인증 상태를 확인하고 HTML만 보내므로 로딩 깜빡임도 사라짐.

### Breadcrumb 위치: `components/navigation/`

- **맥락**: Breadcrumb 컴포넌트를 어디에 둘지. CLAUDE.md에서 components/ui/ 수정 금지 규칙
- **선택지**: (1) components/ui/ (2) components/navigation/ (3) components/ 루트
- **결정**: components/navigation/breadcrumb.tsx
- **이유**: components/ui/는 shadcn 전용으로 유지. 기존 기능별 폴더 패턴(visa/, auth/, dashboard/)과 일관성. Phase 2에서 네비게이션 관련 컴포넌트 추가 가능성.

### 다크모드: 보류

- **맥락**: UI/UX 감사에서 다크모드 관련 3개 항목 발견
- **결정**: 지금은 안 함
- **이유**: Phase 2 콘텐츠 확장이 우선. 다크모드는 Post-MVP에서 재검토.

### 에러 토스트 (sonner): 보류

- **맥락**: 체크리스트 저장 실패 시 토스트 알림 도입 여부
- **결정**: 보류. 현재 silent revert(실패 시 조용히 되돌림) 유지.
- **이유**: Phase 2에서 기능이 더 많아지면 재검토.

---

---

## 2026-02-27 (언어 지원 결정)

### 국가별 언어 지원: 국가 타겟 분리

- **맥락**: Phase 2 콘텐츠 확장 전에 지원 언어 범위를 확정. 기존에는 글로벌 로케일(en, ja, zh-tw, vi)이었으나, 국가별 타겟 유저가 다름
- **선택지**: (A) 글로벌 로케일 유지 — 모든 언어를 모든 국가에 동일 적용 (B) 국가별 분리 — 한국/대만 각각 타겟 언어 지정
- **결정**: B — 국가별 분리
  - 🇰🇷 **한국 타겟**: 영어(en), 중국어 간체(zh-cn), 베트남어(vi), 일본어(ja)
  - 🇹🇼 **대만 타겟**: 영어(en), 중국어 번체(zh-tw), 베트남어(vi)
- **이유**: 한국 체류 외국인 주요 국적은 중국(간체)·베트남·일본. 대만 체류 외국인 주요 국적은 동남아·중국(번체 사용). 일본어는 대만에서 수요 낮음.
- **구현 영향**:
  - `zh-cn` 로케일 신규 추가 필요 (i18n/routing.ts, messages/zh-cn.json, data/visas/zh-cn/)
  - `messages/` 전체: en, ja, zh-tw, zh-cn, vi (5개 파일)
  - `data/visas/`: 한국 비자 → en, zh-cn, vi, ja / 대만 비자 → en, zh-tw, vi
  - UI/라우팅 자체는 모든 로케일에서 작동 (국가별 제한은 콘텐츠 레벨에서 관리)
- **📘 배경지식**: zh-cn = 중국어 간체(简体中文, Simplified Chinese) — 중국 대륙에서 사용. zh-tw = 중국어 번체(繁體中文, Traditional Chinese) — 대만·홍콩에서 사용. 같은 중국어지만 글자 모양이 다르고, 표현도 일부 다름.

---

*마지막 업데이트: 2026-02-27*
