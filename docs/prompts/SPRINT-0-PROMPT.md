# LocalNomad — Sprint 0: 배포 + SEO 씨앗

목표: 사이트를 빠르고 정상적으로 Google에 노출시킨다.
예상 시간: 4-8시간. 완전 무인 실행.

---

## How to Run

```bash
cat docs/SPRINT-0-PROMPT.md | claude --dangerously-skip-permissions -p -
```

---

You are the lead engineer for LocalNomad, a Next.js 16 (App Router) + React 19 visa guidance platform.
Domain: localnomad.club. Deploy: git push origin main → Vercel auto-deploy.

## EXECUTION MODE: FULLY UNATTENDED

- NEVER stop to ask questions. Make reasonable decisions.
- If ambiguous, pick the safer/simpler option and note in commit message.
- If npm run build fails, fix it yourself. NEVER add ignoreBuildErrors.
- Commit after each task so progress is saved.
- Complete ALL 5 tasks.

## BEFORE YOU START

Read these files:
- `CLAUDE.md` — conventions, legal bright lines (Korea AND Taiwan)
- `app/[lang]/layout.tsx` — root layout
- `components/providers/auth-provider.tsx` — auth state
- `middleware.ts` — routing
- `lib/i18n/config.ts` — i18n config with buildLocalePath()

Tech: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Supabase (auth), next-intl (i18n: en, ja, zh-tw, vi), Mapbox GL.

---

# TASK 1: FIX HYDRATION FLICKERING (최우선)

4개 확인된 원인. 모두 수정.

## 1-1. Theme Flash

`app/[lang]/layout.tsx`에 `<html className="dark">` 하드코딩 + ThemeProvider 충돌.
- 사이트가 dark-only인 경우: ThemeProvider 제거, `className="dark"` 유지
- light/dark 모두 지원: cookie 기반 theme 감지로 서버 사이드 렌더링

검증: `grep -rn 'ThemeProvider\|next-themes\|useTheme\|forcedTheme' --include='*.tsx' --include='*.ts' | grep -v node_modules`

## 1-2. Auth State Flash

`auth-provider.tsx`에서 `useState(null)` + `useEffect` async fetch 패턴.
서버에서 null → 클라이언트에서 로그인 감지 → UI 깜빡임.

수정:
1. `app/[lang]/layout.tsx` (서버 컴포넌트)에서 `createServerClient`로 세션 읽기
2. `initialSession`, `initialUser`를 AuthProvider에 props로 전달
3. AuthProvider에서 `useState(initialUser)` 로 초기화
4. useEffect는 실시간 auth listener용으로만 유지

## 1-3. Suspense fallback={null}

`app/[lang]/layout.tsx`에서 `<Suspense fallback={null}>` 이 main content를 감싸고 있음.
→ child가 suspend하면 전체 페이지 사라짐.

수정:
- 15개 `loading.tsx`가 이미 있으므로, 감싸는 Suspense 제거
- 또는 skeleton fallback으로 교체

## 1-4. suppressHydrationWarning

`<html>` 과 `<body>` 태그에 `suppressHydrationWarning` 추가.
브라우저 확장(Grammarly, LastPass 등)의 DOM 수정으로 인한 hydration mismatch 방지.

## 1-5. 추가 진단

```bash
grep -rn 'mounted\|isClient\|hasMounted' --include='*.tsx' --include='*.ts' | grep -v node_modules
grep -rn 'typeof window' --include='*.tsx' --include='*.ts' | grep -v node_modules
```

불필요한 `"use client"` 제거, mounted 패턴을 CSS 트랜지션으로 교체.

## 1-6. Puppeteer 검증

```bash
npm install puppeteer --save-dev
npm run dev &
# wait for localhost:3000
```

Before/After 스크린샷 비교 스크립트:
1. localhost:3000/korea/visa → 200ms 간격 5장 캡처
2. /korea/visa/e-7 클릭 → 200ms 간격 5장 캡처
3. CLS 측정 via PerformanceObserver
4. console hydration warning 캡처
5. 결과: `docs/screenshots/hydration-{before|after}-*.png`

Flash 없어야 함. 있으면 추가 수정.

```bash
git add -A && git commit -m "fix: eliminate hydration flickering

- [list what you changed]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

# TASK 2: SEO 기초 (canonical + hreflang)

## 2-1. metadataBase 확인

`app/layout.tsx`에 이미 `metadataBase: new URL("https://localnomad.club")` 있음.
없으면 추가.

## 2-2. 페이지별 canonical + hreflang

비자 상세 페이지(`app/[lang]/[country]/visa/[type]/page.tsx`)에 `generateMetadata()` 추가/수정:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, country, type } = await params;
  const canonical = lang === 'en'
    ? `https://localnomad.club/${country}/visa/${type}`
    : `https://localnomad.club/${lang}/${country}/visa/${type}`;

  return {
    alternates: {
      canonical,
      languages: {
        'en': `https://localnomad.club/${country}/visa/${type}`,
        'ja': `https://localnomad.club/ja/${country}/visa/${type}`,
        'zh-Hant': `https://localnomad.club/zh-tw/${country}/visa/${type}`,
      },
    },
  };
}
```

동일 패턴을 다음 페이지에도 적용:
- `app/[lang]/[country]/visa/page.tsx` (비자 랜딩)
- `app/[lang]/[country]/visa/compare/page.tsx` (비교)
- `app/[lang]/[country]/visa/find/page.tsx` (퀴즈)
- `app/[lang]/[country]/visa/path/page.tsx` (Path Simulator)
- `app/[lang]/[country]/visa/checklist/page.tsx` (체크리스트)
- `app/[lang]/[country]/visa/dashboard/page.tsx` (대시보드)
- `app/[lang]/page.tsx` (홈)

헬퍼 함수를 만들어서 중복 최소화:
```tsx
// lib/seo/metadata.ts
export function buildAlternates(path: string, locales: string[] = ['en', 'ja', 'zh-tw']) {
  // ...
}
```

## 2-3. sitemap.xml 확인

`app/sitemap.ts` 파일이 있는지 확인. 없으면 생성:
```tsx
export default function sitemap(): MetadataRoute.Sitemap {
  // 모든 비자 페이지 + 도구 페이지 포함
  // 각 페이지의 다국어 버전도 포함
}
```

```bash
git add -A && git commit -m "feat: add SEO canonical/hreflang to all pages, generate sitemap

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

# TASK 3: `as any` 제거 + locale 링크 패치

## 3-1. Supabase 타입 재생성

```bash
# 이미 database.types.ts가 있으므로 제네릭 명시로 해결
```

4곳 수정:
```
components/providers/auth-provider.tsx:92  → 제네릭 파라미터 명시
components/providers/auth-provider.tsx:125 → 제네릭 파라미터 명시
components/visa/dashboard/DashboardClient.tsx:479 → 올바른 타입 캐스팅
components/visa/dashboard/DashboardClient.tsx:506 → 올바른 타입 캐스팅
```

## 3-2. Locale 누락 링크 패치

`lib/i18n/config.ts`의 `buildLocalePath()` 함수를 사용하여:

```
components/visa/dashboard/NextActionCard.tsx — 11곳 하드코딩 경로 → buildLocalePath() 래핑
components/visa/visa-path-simulator.tsx — buildHref() 중복 → buildLocalePath() 통일
components/whats-next-section.tsx — href="/business" → buildLocalePath("/business")
```

```bash
git add -A && git commit -m "fix: remove as any (4곳), patch locale-missing links (12곳)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

# TASK 4: 대만 대시보드 활성화 + 네비게이션 단순화

## 4-1. 대만 대시보드 활성화

```bash
grep -rn 'taiwan\|Taiwan\|disabled\|coming.soon\|isDisabled' --include='*.tsx' app/ components/ | grep -v node_modules
```

- 대만 카드의 disabled/opacity-50/pointer-events-none 제거
- `/[lang]/taiwan/visa` 라우트 정상 작동 확인
- 대만 면책조항 확인 (영어 + 繁體中文, CLAUDE.md Taiwan Legal Bright Lines 참조)

## 4-2. 네비게이션 단순화

- 국가 선택 후 Bundles/Area Guide 카드 제거
- 국가 클릭 → 비자 대시보드 직행 (redirect 또는 직접 렌더)
- Header/Footer에서 Bundles, Area Guide 링크 제거
- 실제 라우트 파일(`app/[lang]/[country]/bundles/`, `app/[lang]/[country]/areas/`)은 삭제
- `next.config.mjs`의 bundles/areas 관련 redirect도 제거

```bash
git add -A && git commit -m "feat: enable Taiwan dashboard, simplify nav (remove bundles/areas)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

# TASK 5: 빌드 + 배포

```bash
npm run build
npm run lint
```

에러 있으면 수정.

```bash
git push origin main
```

최종 보고서 `docs/SPRINT-0-REPORT.md`:
```markdown
# Sprint 0 Report

## Task 1: Hydration Fix
- Causes found and fixed: [list]
- Flash eliminated: YES/NO
- CLS before/after: [numbers]

## Task 2: SEO
- metadataBase: confirmed
- Pages with canonical/hreflang: [count]
- sitemap.xml: generated YES/NO

## Task 3: Type Safety + Locale
- as any removed: [count]/4
- Locale links patched: [count]/12

## Task 4: Taiwan + Nav
- Taiwan dashboard: enabled
- Bundles/Areas: removed
- Legal compliance: verified

## Task 5: Build + Deploy
- npm run build: PASS/FAIL
- npm run lint: PASS/FAIL
- Pushed: YES/NO
- Live at: https://localnomad.club
```

---

## GLOBAL RULES

### Files You Must Not Modify
- `components/ui/*` — shadcn/ui managed
- `node_modules/*`, `.env.local`

### Legal (Korea)
- ✅ CAN: Display requirements, quizzes, calculators, checklists
- ❌ NEVER: "you are eligible", file for users, store HiKorea creds

### Legal (Taiwan)
- ❌ NEVER: match scores, percentages, match levels, "you qualify", "consulting" (諮詢)
- ✅ MUST: Disclaimers in English AND 繁體中文 on every Taiwan page
- ✅ MUST: All user data client-side only (localStorage), never server
- ✅ MUST: State LocalNomad is not a licensed 移民業務機構

### Error Recovery
- Build fails → fix yourself. NEVER add ignoreBuildErrors.
- NEVER stop. Complete ALL 5 tasks.
- Commit after each task.
