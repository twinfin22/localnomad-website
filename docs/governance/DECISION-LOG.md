# Decision Log

> 주요 기술/프로덕트 결정을 기록. 나중에 "왜 이렇게 했지?" 할 때 참고용.
> Claude는 의사결정이 발생할 때마다 이 문서에 기록해야 함.

## 읽는 법
- **맥락**: 왜 이 결정이 필요했는지
- **선택지**: 어떤 옵션들이 있었는지 (장단점 포함)
- **결정**: 뭘 선택했는지
- **이유**: 왜 이걸 선택했는지
- **영향 범위**: 어떤 파일/기능에 영향 미치는지
- **📘 배경지식**: 결정에 필요한 기술적 맥락 (있을 때만)

---

## 소급 기록 (프로젝트 초기 ~ 2025-02-14)

### [초기] 기술 스택 선정: Next.js 16 + App Router
- **맥락**: 비자 정보 웹사이트의 프레임워크 선택
- **선택지**:
  - (A) Next.js Pages Router — 전통적 방식, 자료 많음
  - (B) Next.js App Router — 최신 방식, Server Component¹ 지원
  - (C) Remix, Astro 등 — 대안 프레임워크
- **결정**: B — Next.js 16 App Router
- **이유**: Server Component로 비자 데이터를 서버에서 미리 렌더링하면 페이지 로딩이 빠르고, SEO(검색 노출)에 유리. 비자 정보는 자주 안 바뀌는 정적 데이터라 서버 렌더링에 적합.
- **영향 범위**: 전체 프로젝트 아키텍처
- **📘 배경지식**:
  > ¹ **Server Component**: 서버에서 HTML을 완성해서 보내는 컴포넌트. 브라우저에서 JavaScript를 실행하지 않아도 내용이 보임. 반대로 **Client Component**("use client")는 브라우저에서 JavaScript가 실행돼야 작동 (예: 버튼 클릭, 폼 입력). LocalNomad는 Server Component를 기본으로 쓰고, 사용자 상호작용이 필요한 부분만 Client Component로 분리.

### [초기] 다국어 시스템: next-intl + JSON 파일
- **맥락**: 영어, 일본어, 중국어(번체), 베트남어 4개 언어 지원 필요
- **선택지**:
  - (A) next-intl + JSON 파일 — 각 언어별 JSON 파일에 번역 저장
  - (B) 데이터베이스에 번역 저장 — Supabase에 번역 테이블
  - (C) i18next — 다른 번역 라이브러리
- **결정**: A — next-intl + `messages/{locale}.json`
- **이유**: 비자 정보처럼 정적인 콘텐츠는 JSON 파일이 가장 단순하고 빠름. DB 번역은 실시간 변경이 필요할 때 쓰는 건데 우리는 불필요.
- **영향 범위**: `messages/*.json`, `i18n/request.ts`, `lib/i18n/config.ts`

### [초기] 비자 데이터 구조: JSON 파일 (DB 아님)
- **맥락**: 비자 종류별 상세 정보(요구사항, 서류, FAQ 등)를 어디에 저장할지
- **선택지**:
  - (A) JSON 파일 — `data/visas/{locale}/{type}.json`
  - (B) Supabase DB — 테이블에 비자 데이터 저장
  - (C) CMS (Contentful, Sanity 등) — 외부 콘텐츠 관리 시스템
- **결정**: A — JSON 파일
- **이유**: 비자 데이터는 자주 안 바뀌고, 빌드 시점에 정적으로 불러오면 됨. DB를 쓰면 매 요청마다 쿼리하는데, 불필요한 복잡성. JSON 파일은 git으로 버전 관리도 되고, 번역가가 직접 편집도 가능.
- **영향 범위**: `data/visas/` 전체, `lib/visa-data-loaders.ts`
- **📘 배경지식**:
  > SQL로 비유하면: DB 테이블 대신 각 비자 종류마다 하나의 JSON 파일이 있고, 파일 안에 requirements, documents, faqs 같은 필드(컬럼)가 있는 것. `SELECT * FROM visas WHERE type='d-10'` 대신 `import d10Data from 'data/visas/en/d-10.json'`으로 불러오는 방식.

### [초기] 인증: Supabase Auth
- **맥락**: 사용자 로그인/회원가입 + 비자 진행상황 저장
- **선택지**:
  - (A) Supabase Auth — 이메일/비밀번호 + Google OAuth
  - (B) NextAuth.js — Next.js 전용 인증 라이브러리
  - (C) Clerk — 호스팅 인증 서비스
- **결정**: A — Supabase Auth
- **이유**: Supabase를 이미 DB로 쓰고 있으니 인증도 같은 서비스에서 처리. 별도 서비스 추가 불필요.
- **영향 범위**: `lib/supabase/`, `components/providers/auth-provider.tsx`, `middleware.ts`

### [2025-02-14] Hydration 문제 1차 수정 (Sprint 0)
- **맥락**: 페이지 로딩 시 화면이 깜빡이는(flickering) 문제 발생
- **선택지**:
  - (A) ThemeProvider 제거 + Header/Footer를 Server Component로 전환
  - (B) suppressHydrationWarning으로 경고만 숨기기
  - (C) 전체 아키텍처 재설계
- **결정**: A — ThemeProvider 제거, Header/Footer Server Component 전환
- **이유**: ThemeProvider가 Client Component여서 전체 레이아웃을 Client에서 다시 그리고 있었음. 제거하면 레이아웃 레벨 flickering 해결.
- **영향 범위**: `app/layout.tsx`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`
- **결과**: ⚠️ 레이아웃 레벨은 해결됐으나, 개별 컴포넌트 내부 flickering은 미해결 (→ TD#1~4)
- **📘 배경지식**:
  > **Hydration**: 서버에서 만든 HTML을 브라우저가 받은 후, React가 그 HTML에 JavaScript 기능(클릭, 입력 등)을 "붙이는" 과정. 서버 HTML과 브라우저의 React 결과가 다르면 화면이 깜빡임 = flickering.

### [2025-02-14] Puppeteer 검증 → 오판
- **맥락**: Hydration 수정 후 자동화 테스트로 검증
- **선택지**:
  - (A) Puppeteer로 랜딩 페이지만 테스트
  - (B) 모든 주요 페이지 + 모바일 뷰 테스트
  - (C) Gen님이 직접 브라우저에서 확인
- **결정**: A — 랜딩 페이지만 Puppeteer 테스트
- **이유**: 빠른 검증을 위해
- **결과**: ❌ 오판. 랜딩 페이지는 OK였으나 비자 상세/체크리스트/모바일 뷰 미검증. suppressHydrationWarning이 콘솔 에러만 숨겨서 "0 errors"로 보였음.
- **교훈**: AI가 만들고 AI가 검증하면 안 됨. 검증 대상 범위를 Gen님이 정해야 함.

---

## 2025-02-16

### [2025-02-16] 법률 위반 코드 감사 → 6건 발견
- **맥락**: Track A(콘텐츠)에서 추가된 비자 퀴즈/온보딩 코드가 한국/대만 법률을 준수하는지 점검
- **선택지**: 감사 실행 여부 — 선택의 여지 없이 필수
- **결정**: 전수 감사 실행
- **결과**: 6건 발견 (CRITICAL 2, HIGH 2, MEDIUM 2)
  - CRITICAL: 퀴즈 점수/퍼센티지 표시 → 대만 이민법 §56 위반
  - CRITICAL: Disclaimer이 UI 동작과 모순
  - HIGH: `yesIsQualifying` 필드명이 자격 판정 암시
  - HIGH: Gold Card 비교표 disclaimer 미확인
  - MEDIUM: "guaranteed" 표현 사용
  - MEDIUM: ConsentGate가 한국만 언급
- **이유**: 대만 이민법 위반 시 NT$200K-1M(약 800만~4천만원) 벌금
- **영향 범위**: `EligibilityQuizResults.tsx`, `OnboardingWizard.tsx`, `dnv.json`, `messages/*.json` 외
- **📘 배경지식**:
  > 대만 이민법 §56: "이민 업무"(자격 판정, 서류 대행 등)는 면허 필요. 퀴즈에서 "Match Score 85%"를 보여주면 사실상 "자격 판정"을 하는 것으로 해석될 수 있음.

---

## 2025-02-17

### [2025-02-17] zh-tw 대만 비자 페이지 제거
- **맥락**: 대만 비자 정보는 대만에 오려는 외국인 대상. 대만인(zh-tw 사용자)은 자국 비자 정보 불필요
- **선택지**: (A) zh-tw 유지 (B) zh-tw 제거
- **결정**: B — Taiwan countryLocales에서 zh-tw 제거, `data/visas/tw/zh-tw/` 삭제
- **이유**: 타겟 유저가 아닌 사람을 위한 콘텐츠는 유지보수 비용만 증가
- **영향 범위**: `lib/i18n/config.ts` (line 30), sitemap, hreflang, `data/visas/tw/zh-tw/`
- **📘 배경지식**:
  > `countryLocales`는 "어떤 나라 페이지를 어떤 언어로 제공할지"를 정하는 설정. 이 한 줄을 바꾸면 sitemap(검색엔진에 알려주는 페이지 목록), hreflang(이 페이지의 다른 언어 버전 링크), URL 라우팅이 전부 연동되어 바뀜.

### [2025-02-17] 브랜드 컬러 #1B4965 확정
- **맥락**: 로고/파비콘/웹사이트 통일 컬러 필요
- **선택지**:
  - (A) #2B4C7E 클래식 네이비 — 신뢰감 강, 약간 딱딱
  - (B) #3D5A80 소프트 네이비 — 모던, 회색기 섞임
  - (C) #1B4965 딥 틸 네이비 — 초록기가 살짝, 여행/탐험 뉘앙스
- **결정**: C — #1B4965
- **이유**: 남색의 신뢰감 + 초록기가 살짝 섞여 여행/탐험 뉘앙스. 비자 정보 플랫폼의 신뢰감과 노마드의 자유로움 균형
- **영향 범위**: `CLAUDE.md`, `docs/BRAND-GUIDE.md`, 향후 모든 UI 컬러

### [2025-02-17] 오너십 워크플로우 도입
- **맥락**: AI에게 실행을 과도하게 위임 → 기술적 판단력과 프로젝트 통제력 상실. flickering 반복 실패(검증 오판), 법률 위반 코드 미감지 등이 증거.
- **선택지**: (A) 현행 유지 (B) 워크플로우 규칙 추가
- **결정**: B — CLAUDE.md에 Ownership Workflow 섹션 추가, 5개 거버넌스 문서 운영
- **이유**: 구조적 장치 없이는 같은 패턴 반복. "설명 → 선택지 → 승인 → 실행 → Gen 직접 검증" 순서를 강제해야 오너십 유지 가능.
- **영향 범위**: 전체 개발 워크플로우
- **거버넌스 문서**: DECISION-LOG.md, TECH-DEBT.md, ARCHITECTURE-MAP.md, WORKFLOW-CHECKLIST.md, CLAUDE.md
