# Architecture Map

> 시스템 전체 흐름도. Gen님이 어떤 페이지든 "데이터가 어디서 와서 어디로 가는지" 설명할 수 있어야 함.
> 주간 리뷰 시 업데이트. 새 기능 추가 시 해당 영역 업데이트 필수.

---

## 1. 전체 시스템 한 눈에 보기

```
┌─────────────────────────────────────────────────────────────┐
│                     사용자의 브라우저                          │
│  URL 입력 또는 링크 클릭                                      │
│  예: localnomad.club/ja/korea/visa/d-10                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ 요청(Request)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Vercel 서버                               │
│                                                              │
│  ① middleware.ts          "문지기" — 모든 요청을 검문          │
│       │                                                      │
│  ② app/layout.tsx         "건물 외벽" — 메타데이터 설정        │
│       │                                                      │
│  ③ app/[lang]/layout.tsx  "층" — 언어 설정 + 번역 로드        │
│       │                                                      │
│  ④ app/[lang]/[country]/  "방" — 나라 설정                    │
│    layout.tsx                                                │
│       │                                                      │
│  ⑤ page.tsx               "가구" — 비자 데이터 조립 + HTML 완성│
│                                                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ 완성된 HTML
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     사용자의 브라우저                          │
│  HTML 표시 (로딩 없이 바로 보임)                               │
│       │                                                      │
│  ⑥ JavaScript 활성화      버튼 클릭, 언어 전환 등 상호작용     │
│       │                    가능해짐 (= hydration)             │
│       │                                                      │
│  ⑦ useEffect 실행         localStorage 읽기, 화면 크기 체크   │
│                            ← ⚠️ 여기서 flickering 발생       │
└─────────────────────────────────────────────────────────────┘
```

### 외부 서비스

```
Vercel ─────── 웹사이트 호스팅, 빌드, 배포
Supabase ───── 사용자 계정(로그인) + 비자 진행상황 DB
Google Fonts ─ Geist 폰트 로드
Mapbox ─────── 지도 기능 (있는 경우)
```

---

## 2. 요청 처리 흐름 (상세)

사용자가 `localnomad.club/ja/korea/visa/d-10`에 접속하면:

### ① middleware.ts — 문지기

```
요청 도착: /ja/korea/visa/d-10
    │
    ├─ 언어 확인: "ja"가 유효한 언어인가? ✅ (en, ja, zh-tw, vi 중 하나)
    ├─ 나라 확인: "korea"가 유효한 나라인가? ✅ (korea, taiwan 중 하나)
    ├─ 인증 확인: Supabase에 로그인 여부 질의 (보호된 페이지만 차단)
    ├─ 쿠키 설정: NEXT_LOCALE = "ja"
    │
    └─ 통과 → 다음 단계로
```

**핵심 파일**: `middleware.ts`
**하는 일**: 모든 요청을 가로채서 언어/나라 유효성 검증, 인증 확인, 쿠키 설정
**영향**: 이 파일이 잘못되면 모든 페이지가 영향받음

### ② ~ ④ Layout 계층 — 겹겹이 감싸기

```
app/layout.tsx                    ← 최상위: HTML 태그, 폰트, 메타데이터
  └─ app/[lang]/layout.tsx        ← 2층: 번역 시스템 + 인증 시스템 초기화
      └─ app/[lang]/[country]/    ← 3층: 나라 정보 설정
         layout.tsx
          └─ page.tsx             ← 실제 페이지 내용
```

각 Layout이 제공하는 것:

| Layout | 파일 | 제공하는 것 |
|--------|------|------------|
| Root | `app/layout.tsx` | HTML 뼈대, Geist 폰트, 기본 메타데이터 |
| Locale | `app/[lang]/layout.tsx` | `NextIntlClientProvider`* — 번역 데이터를 하위 모든 컴포넌트에 전달. `AuthProvider`* — 로그인 상태를 하위 모든 컴포넌트에 전달 |
| Country | `app/[lang]/[country]/layout.tsx` | `CountryProvider`* — 현재 나라(korea/taiwan)를 하위 모든 컴포넌트에 전달 |

> **Provider***: "이 데이터를 안에 있는 모든 컴포넌트가 쓸 수 있게 해주는 래퍼". SQL의 VIEW와 비슷 — 원본 데이터를 가공해서 쉽게 접근 가능하게 해줌. 예: `useAuth()`를 쓰면 어디서든 로그인 여부 확인 가능.

### ⑤ Page — 실제 콘텐츠 조립

```
page.tsx가 하는 일:
    │
    ├─ 비자 JSON 로드: data/visas/ja/d-10.json    ← "D-10 비자 상세 정보"
    ├─ 번역 문자열: messages/ja.json              ← "ビザ要件", "書類" 등 UI 텍스트
    ├─ SEO 메타데이터 생성                         ← 검색엔진용 제목/설명
    │
    └─ HTML 완성 → 사용자에게 전송
```

### ⑥⑦ 브라우저 — Hydration + useEffect

```
브라우저가 HTML 수신
    │
    ├─ 사용자: 페이지가 보임 (텍스트, 이미지 등)
    │
    ├─ React hydration: HTML에 JavaScript 기능 연결
    │   (버튼 클릭, 폼 입력, 언어 전환 등이 작동하기 시작)
    │
    └─ useEffect 실행: ← ⚠️ flickering 발생 지점
        ├─ useIsMobile: "화면 크기 체크" → 모바일이면 레이아웃 변경
        ├─ DDayCounter: "날짜 계산" → null → "D-42"
        ├─ VisaJourneyPage: "localStorage 읽기" → 배너 show/hide
        └─ ChecklistStep: "URL hash 읽기" → 아코디언 open/close
```

---

## 3. 데이터 출처 (어디서 뭘 가져오나)

```
┌──────────────────────────┐
│   정적 데이터 (빌드 시)    │    ← JSON 파일, 빌드할 때 한 번 읽어서 HTML에 포함
│                           │
│  data/visas/en/d-10.json │    비자 상세 정보 (요구사항, 서류, FAQ)
│  data/visas/ja/d-10.json │    일본어 버전
│  data/visas/tw/en/dnv.json│   대만 비자 정보
│  messages/en.json         │    UI 번역 문자열
│  messages/ja.json         │    일본어 UI
│  lib/i18n/config.ts       │    언어-나라 매핑 설정
│                           │
└──────────────────────────┘

┌──────────────────────────┐
│   동적 데이터 (실시간)      │    ← Supabase DB에서 매 요청마다 조회
│                           │
│  사용자 인증 상태           │    로그인 여부, 이메일
│  visa_progress 테이블      │    비자 진행상황 (로그인 사용자만)
│  checklist_items 테이블    │    체크리스트 완료 항목
│                           │
└──────────────────────────┘

┌──────────────────────────┐
│   브라우저 전용 데이터      │    ← 서버 접근 불가 = flickering 원인
│                           │
│  localStorage             │    배너 닫힘 여부, 비로그인 진행상황
│  window.innerWidth        │    화면 크기 (모바일 판별)
│  location.hash            │    URL의 #section 부분
│  navigator                │    브라우저/OS 정보
│                           │
└──────────────────────────┘
```

> SQL로 비유하면: 정적 데이터는 `CREATE TABLE ... AS SELECT` (미리 만들어둔 뷰), 동적 데이터는 `SELECT * FROM visa_progress WHERE user_id = ?` (실시간 쿼리), 브라우저 전용 데이터는 클라이언트 앱의 로컬 변수 (서버가 볼 수 없는 것).

---

## 4. URL 구조

```
localnomad.club / {lang} / {country} / visa / {type}
                    │          │                  │
                    │          │                  └─ d-10, e-7, h-1, f-1-d (한국)
                    │          │                     dnv, gold-card, work-arc (대만)
                    │          │
                    │          └─ korea, taiwan
                    │
                    └─ en (기본, URL에 안 보임), ja, zh-tw, vi
```

**예시**:

| URL | 의미 |
|-----|------|
| `/korea/visa/d-10` | 영어(기본) + 한국 + D-10 비자 |
| `/ja/korea/visa/d-10` | 일본어 + 한국 + D-10 비자 |
| `/taiwan/visa/gold-card` | 영어 + 대만 + Gold Card |
| `/korea/visa/dashboard` | 영어 + 한국 + 대시보드 (로그인 필요) |

**영어가 기본인 이유**: `/en/korea/...` 대신 `/korea/...`로 쓸 수 있게 middleware가 내부적으로 `/en/korea/...`로 변환(rewrite)함. 사용자 URL은 깔끔하게 유지.

---

## 5. 언어-나라 매핑

```
lib/i18n/config.ts에 정의된 countryLocales:

korea  →  en, ja, zh-tw, vi   (4개 언어)
taiwan →  en                   (영어만 — 2025-02-17 결정)
```

이 설정 하나가 연쇄적으로 영향 미치는 곳:

```
countryLocales 변경
    │
    ├─ sitemap.xml 생성 → 어떤 URL을 검색엔진에 알릴지
    ├─ hreflang 태그 → "이 페이지의 다른 언어 버전" 링크
    ├─ generateStaticParams → 빌드 시 어떤 페이지를 미리 만들지
    └─ 라우팅 → 존재하지 않는 조합(예: /vi/taiwan/...)은 404
```

---

## 6. 인증 흐름

```
비로그인 사용자                           로그인 사용자
─────────────────                      ─────────────────
비자 정보 열람 ✅                         비자 정보 열람 ✅
퀴즈 응시 ✅                             퀴즈 응시 ✅
진행상황 → localStorage                 진행상황 → Supabase DB
(브라우저 바꾸면 사라짐)                   (어디서든 접근 가능)
대시보드 접근 ❌                          대시보드 접근 ✅
      │                                      │
      └─ 로그인 시: localStorage 데이터를      │
         Supabase로 마이그레이션 ────────────┘
```

**인증 방식**: 이메일/비밀번호 또는 Google OAuth → Supabase Auth 처리
**보호된 경로**: `/korea/visa/dashboard` (middleware에서 차단)

---

## 7. 주요 파일 맵

### 요청 처리 (위에서 아래로 실행)

| 순서 | 파일 | 역할 |
|------|------|------|
| 1 | `middleware.ts` | 모든 요청 검문 (언어/나라/인증) |
| 2 | `app/layout.tsx` | HTML 뼈대, 폰트, 기본 메타데이터 |
| 3 | `app/[lang]/layout.tsx` | 번역 + 인증 Provider 초기화 |
| 4 | `app/[lang]/[country]/layout.tsx` | 나라 Provider 초기화 |
| 5 | `app/[lang]/[country]/visa/[type]/page.tsx` | 비자 데이터 로드 + 페이지 렌더링 |

### 설정

| 파일 | 역할 |
|------|------|
| `lib/i18n/config.ts` | 언어-나라 매핑, 유효한 locale/country 정의 |
| `i18n/request.ts` | 쿠키에서 locale 읽어서 번역 파일 로드 |
| `next.config.mjs` | Next.js 빌드 설정 |

### 데이터

| 파일/폴더 | 역할 |
|-----------|------|
| `data/visas/{locale}/{type}.json` | 비자 상세 정보 (한국) |
| `data/visas/tw/{locale}/{type}.json` | 비자 상세 정보 (대만) |
| `messages/{locale}.json` | UI 번역 문자열 |
| `lib/supabase/client.ts` | 브라우저용 Supabase 연결 |
| `lib/supabase/server.ts` | 서버용 Supabase 연결 |
| `lib/supabase/middleware.ts` | middleware용 Supabase 연결 |

### Context Providers

| 파일 | hook | 용도 |
|------|------|------|
| `components/providers/auth-provider.tsx` | `useAuth()` | 로그인 상태 조회 |
| `components/providers/country-provider.tsx` | `useCountry()` | 현재 나라 조회 |

---

## 8. 변경 영향도 맵

> "이 파일을 바꾸면 어디까지 영향 미치는가?"

| 변경 대상 | 영향 범위 | 위험도 |
|-----------|-----------|--------|
| `middleware.ts` | 전체 사이트 (모든 요청 통과) | 🔴 최고 |
| `lib/i18n/config.ts` | sitemap, hreflang, 라우팅, 빌드 | 🔴 최고 |
| `app/layout.tsx` | 전체 사이트 레이아웃 | 🔴 높음 |
| `app/[lang]/layout.tsx` | 해당 언어의 모든 페이지 | 🟡 중간 |
| `messages/{locale}.json` | 해당 언어 UI 전체 | 🟡 중간 |
| `data/visas/{locale}/{type}.json` | 해당 비자 페이지 1개 | 🟢 낮음 |
| 개별 컴포넌트 | 해당 컴포넌트 사용처 | 🟢 낮음 |

---

*마지막 업데이트: 2025-02-17*
*다음 리뷰 예정: 주간 리뷰 시*
