# LocalNomad — Product Spec

> Last updated: 2026-02-16

## 한줄 요약

한국·대만에서 일하거나 살고 싶은 외국인 전문직을 위한 비자 정보 + 리로케이션 툴킷.

## Mission

비자 정보의 비대칭을 해소한다. 외국인 전문직이 비자 요건·절차·서류를 직접 파악하고 준비할 수 있도록 도구를 제공한다. 법률 자문이 아닌 **정보 플랫폼**.

---

## Target Users

| 페르소나 | 예시 | 핵심 니즈 |
|----------|------|-----------|
| **디지털 노마드** | 베트남 개발자, 일본 프리랜서 | F-1-D / Gold Card 정보, 체류 계획 |
| **취업 전환자** | 미국 영어강사 E-2 → E-7 전환 | 비자 전환 경로, 필요 서류 |
| **유학생** | D-2 → D-10 → E-7 경로 | 졸업 후 취업비자 로드맵 |
| **장기 체류자** | E-7 → F-2 포인트제 | 영주권 요건, 점수 계산 |
| **워킹홀리데이** | 호주·캐나다·일본 등에서 한국/대만행 | H-1 / Working Holiday 정보, 입국 준비 |

---

## Countries & Visa Coverage

### South Korea 🇰🇷 (Primary)

Full guides (6): **F-1-D** ⭐, E-7, D-2, D-10, H-1, F-2
Stubs (6): E-2, D-7, D-8, F-6, F-4, D-4
⭐ = 최우선 강화 대상 (검색 급상승 + 원스톱 부재)

### Taiwan 🇹🇼 (Phase 1)

Full guides (4): Gold Card, **DNV** ⭐, Work ARC, Visitor
Phase 2 coming (3): Entrepreneur, Student, APRC
Stubs (4): Plum Blossom, Dependent ARC, Seeking Employment, Working Holiday
⭐ = 블루오션 (2025 출시, 정보 극소)

---

## Core Features (Free)

### 1. Visa Landing — "What's your situation?"
국가 선택 후 상황별 진입점 (이모지 카드 그리드).
"I want to work in Korea" → E-7, D-7 안내
"I'm a student" → D-2 안내

### 2. Visa Detail Pages
비자별 풀 가이드:
- 자격 요건 (at-a-glance)
- 신청 절차 (7+ 스텝)
- 필요 서류 체크리스트 (한국어 병기)
- 수수료·처리기간
- FAQ (10+개)
- 공식 출처 링크

### 3. Visa Path Simulator
"나는 E-7인데 F-2로 가려면?" → 전환 경로·요건·타임라인·서류 시각화.
30+ 전환 경로, URL state (?from=e-7&to=f-2) 공유 가능.

### 4. Visa Finder Quiz
상황 질문 → 매칭되는 비자 유형 제시.
대만: 점수/퍼센트 없음 (법률 준수), "Published Requirement vs Your Answer" 테이블만.

### 5. Visa Comparison Tool
비자 2-3개 나란히 비교 (자격, 기간, 서류, 비용).

### 6. Document Checklist
비자별 서류 체크리스트, 진행률 추적.
클라이언트 사이드 localStorage (서버 저장 없음, 대만 법률 요건).

### 7. Dashboard (로그인 필요)
- 선택한 비자의 진행 상태 추적
- D-Day 카운터 (마감일까지 남은 날)
- Health Score (준비도 %)
- 다음 액션 추천
- 상태 전이 (PREPARING → SUBMITTED → UNDER_REVIEW → APPROVED → ACTIVE)

---

## Demand Hypothesis (2026-02-16 리서치 반영)

초기 가설 "워킹홀리데이가 최고 수요"는 **부분적으로만 유효**. 시장조사 결과 수요·경쟁·기회를 종합하면:

| 순위 | 세그먼트 | 수요 트렌드 | 경쟁 | 근거 |
|------|---------|-----------|------|------|
| 1 | **한국 F-1-D (디지털 노마드)** | 📈 급상승 | 중간 (원스톱 가이드 부재) | 2024.1 출시 후 미디어 폭발, 10+ 사이트 있으나 깊은 원스톱 없음 |
| 2 | **대만 DNV (디지털 노마드)** | 📈 신규 | 낮음 (블루오션) | 2025.1 출시, 정보 극소, 2026 2년 연장으로 수요 증가 예상 |
| 3 | **한국 E-7 → F-2 전환** | ➡️ 꾸준 | 중간 (깊이 부족) | Path Simulator의 킬러 유스케이스, 기존 사이트 표면적 |
| 4 | **한국 H-1 (워킹홀리데이)** | ➡️ 꾸준 | 높음 (레드오션) | GoGoHanguk·JENZA·Allo Korea가 이미 커버. 차별화 필요 |
| 5 | **대만 Gold Card** | 📈 급상승 | 높음 | taiwangoldcard.com이 사실상 독점, 진입 어려움 |

**전략적 시사점**: F-1-D와 대만 DNV를 1순위로 강화하고, H-1은 국적별 맞춤 가이드·쿼터 오픈 알림 등 차별화 포인트로 접근. 상세: `docs/research-demand-hypothesis.md`

---

## Languages

| Locale | Language | Korea | Taiwan |
|--------|----------|-------|--------|
| en | English | ✅ | ✅ |
| ja | 日本語 | ✅ | ❌ |
| zh-tw | 繁體中文 | ✅ | ✅ |
| vi | Tiếng Việt | ✅ | ❌ |

---

## Legal Constraints

### Korea
- 행정사법: 행정사 업무 대행 불가
- 변호사법: 법률 자문 불가
- 표시광고법: 입증 안 된 수치 광고 불가
- ✅ 가능: 공개 요건 표시, 퀴즈, 계산기, 체크리스트, 정보 상품 판매
- ❌ 금지: "자격 있다", "적격", "추천 비자", 신청 대행, HiKorea 연동

### Taiwan
- Immigration Act §56: 이민 업무 무면허 영업 금지
- Attorney Act §127: 무면허 법률 자문 시 최대 1년 징역
- ❌ 금지: 점수/퍼센트/매치 레벨 표시, "자격 있다", 정부 양식 자동 작성, "諮詢" 용어 사용
- ✅ 필수: 모든 대만 페이지에 영어+繁體中文 면책조항, 클라이언트 사이드 전용 데이터 처리

---

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui
Supabase (auth) · next-intl (i18n) · Mapbox GL · Vercel (deploy)

---

## Current Status (2026-02-16)

| Metric | Score | Target |
|--------|-------|--------|
| User Experience | 74/100 | 90+ |
| Technical Health | 80/100 | 92+ |
| Legal Compliance | YELLOW | GREEN |

### Roadmap (Parallel Tracks)

> 전략: Sequential → Parallel. SEO 인덱싱은 2-6주 소요 → 컨텐츠를 빨리 올릴수록 유리.
> 상세: `docs/REFACTORING-PLAN.md`

**Sprint 0 — 배포 + SEO 씨앗** (1-2일)
1. Hydration flickering 해결 + `as any` 제거 + locale 링크 패치
2. SEO canonical + hreflang + metadataBase
3. 대만 대시보드 활성화 + nav 단순화 + git push + Google Search Console sitemap 제출

**Track A — 컨텐츠 + SEO** (Sprint 0 이후, 수익 직결)
1. **F-1-D 원스톱 가이드** 완성 + SEO 최적화 (1순위 블루오션)
2. **대만 DNV 가이드** 확충 (블루오션 선점)
3. E-7 → F-2 Path Simulator 컨텐츠 심화
4. H-1 워킹홀리데이 차별화 (국적별 맞춤, 쿼터 캘린더)
5. 나머지: 스텁 비자 전환, 대만 Phase 2, Dashboard i18n, Legal GREEN

**Track B — 코드 안정화** (Track A와 병행, 유저에게 안 보이는 작업)
1. Playwright E2E 테스트 3개
2. God Component 분할 (6개)
3. `key={index}` 제거, Dead code 정리, bundles/areas 삭제
4. 후순위: Dashboard 쓰기, 상태 관리 통일, Sentry, 번들 최적화

**Growth** (유저 유입 이후)
1. SEO: 비자별 랜딩페이지 + 롱테일 키워드
2. 커뮤니티: 비자 유형별 경험담 (UGC)
3. 알림: 쿼터 오픈·정책 변경 이메일/푸시
