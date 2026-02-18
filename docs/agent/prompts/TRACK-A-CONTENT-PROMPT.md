# LocalNomad — Track A: 컨텐츠 + SEO 강화

Sprint 0 완료 후 실행. 핵심 비자 가이드를 검색 1위 수준으로 강화.
예상 시간: 4-8시간. 완전 무인 실행.

---

## How to Run

```bash
cd /Users/leegen/localnomad/localnomad-track-a
cat docs/TRACK-A-CONTENT-PROMPT.md | claude --dangerously-skip-permissions -p -
```

---

You are the content strategist + engineer for LocalNomad, a Next.js 16 visa guidance platform.
Domain: localnomad.club. Deploy: git push origin track-a/content-seo → merge to main later.

## EXECUTION MODE: FULLY UNATTENDED

- NEVER stop to ask questions.
- Commit after each task.
- Push after all tasks (Google 크롤링이 빨리 시작되도록).
- 컨텐츠 정확성이 최우선. 출처 불명확한 정보는 넣지 않는다.

## BEFORE YOU START

Read:
- `CLAUDE.md` — legal bright lines (Korea + Taiwan)
- `docs/PRODUCT-SPEC.md` — Demand Hypothesis 섹션
- `docs/research-demand-hypothesis.md` — 시장조사 결과
- `data/visas/en/` — 기존 비자 데이터 JSON 구조 파악
- `data/visas/tw/en/` — 대만 비자 데이터 JSON 구조 파악
- `app/[lang]/[country]/visa/[type]/page.tsx` — 비자 상세 페이지 구조

핵심 원칙: LocalNomad는 **정보 플랫폼**이지 법률 자문이 아님.
- ✅ "Published requirements state that..." / "According to MOFA..."
- ❌ "You qualify" / "You are eligible" / "Recommended visa"

---

# TASK 1: F-1-D 디지털 노마드 비자 원스톱 가이드 (1순위)

시장조사 결과: 검색 급상승 + 원스톱 가이드 부재 = 최고 기회.
타겟 키워드: "korea digital nomad visa", "F-1-D visa requirements", "korea workation visa"

## 1-1. 기존 데이터 확인

```bash
cat data/visas/en/f-1-d.json | head -100
```

기존 가이드의 깊이를 확인하고, 아래 항목 중 빠진 것을 보강.

## 1-2. 보강해야 할 컨텐츠

F-1-D JSON 데이터에 아래 내용이 충분히 포함되어 있는지 확인하고 보강:

**소득 요건 상세**:
- 연 $66,000 (GNI 2배) 이상, 2024년 기준 ₩88,102,000
- 증빙 방법: 고용 계약서, 급여 명세서, 세금 신고서, 은행 잔고
- 프리랜서의 경우: 최근 12개월 인보이스/계약서 합산
- 공식 출처: 법무부 출입국·외국인정책본부

**보험 요건**:
- 최소 ₩100,000,000 (약 $75,000) 보장 민간 건강보험
- 한국 입국 후 국민건강보험 가입 불가 (F-1-D는 직장가입 대상 아님)
- 추천 보험사: SafetyWing, World Nomads 등 (정보 제공만, 추천 아님)

**신청 절차 step-by-step**:
- 주한 대사관/영사관에서 신청 (한국 내 체류자격 변경 가능 여부)
- 필요 서류 체크리스트 (영어 + 한국어 병기)
- 처리 기간: 보통 2-4주
- 수수료

**FAQ 보강**:
- 세금: 183일 이상 체류 시 한국 세법상 거주자, 전 세계 소득 과세 가능성
- 비자 전환: F-1-D → E-7, D-8 전환 가능 여부
- 가족 동반: F-1 (수반) 비자로 가족 동반 가능
- 갱신: 1년 + 1년 연장, 최대 2년
- 원격 근무 제한: 한국 국내 고용 불가, 해외 고용주/자영업만

**출처 링크**:
- 법무부 비자포털: https://www.visa.go.kr
- 출입국·외국인정책본부: https://www.immigration.go.kr
- Hi Korea: https://www.hikorea.go.kr

## 1-3. SEO 메타데이터

`generateMetadata()` already reads `visa.name` and `visa.description` from JSON data.
Enriching the JSON content (name, description fields) will automatically improve SEO metadata.

Ensure the F-1-D JSON has:
- `name`: "Korea Digital Nomad Visa (F-1-D) — Complete 2026 Guide"
- `description`: "Everything about Korea's F-1-D Workation Visa: $66K income requirement, insurance, documents, step-by-step application, and FAQ. Updated for 2026."

No page.tsx code changes needed — just enrich the JSON data.

## 1-4. 다국어 (최소 en, ja)

- `data/visas/en/f-1-d.json` 보강 후
- `data/visas/ja/f-1-d.json` 에도 핵심 변경사항 반영 (일본어 자연스럽게)
- `data/visas/zh-tw/f-1-d.json` 도 가능하면

```bash
git add -A && git commit -m "content: strengthen F-1-D digital nomad visa guide — income, insurance, FAQ, SEO

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

# TASK 2: 대만 DNV 가이드 확충 (2순위 — 블루오션)

시장조사 결과: 2025.1 출시, 정보 극소, 2026 2년 연장.
타겟 키워드: "taiwan digital nomad visa", "taiwan DNV requirements 2026"

## 2-1. 기존 데이터 확인

대만 데이터는 `tw/` 서브디렉토리에 있음:
```bash
cat data/visas/tw/en/dnv.json | head -100
```

## 2-2. 보강 내용

**Gold Card와의 비교**:
- DNV: 소득 $20K-40K (추정), 1-2년, 취업 불가
- Gold Card: 전문 분야 실적 필요, 1-3년, 취업+창업 가능, 세금 혜택
- 비교 테이블 형식으로 데이터 추가

**신청 절차**:
- BOCA (Bureau of Consular Affairs) 통한 신청
- TECO (Taipei Economic and Cultural Office) 관할 지역별 라우팅
- 필요 서류 목록

**대만 법률 준수** (CLAUDE.md 엄격 준수):
- ❌ 점수, 퍼센트, 매칭 레벨 절대 불가
- ❌ "you qualify", "recommended" 불가
- ✅ "Published Requirement" vs "Your Answer" 테이블만
- ✅ 면책조항 영어 + 繁體中文

```bash
git add -A && git commit -m "content: expand Taiwan DNV guide — Gold Card comparison, application steps

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

# TASK 3: E-7 → F-2 Path Simulator 컨텐츠 심화

Path Simulator가 이 전환 경로의 킬러 유스케이스. URL 공유 가능 (?from=e-7&to=f-2).

## 3-1. 전환 데이터 확인

```bash
grep -rn 'e-7.*f-2\|E-7.*F-2' data/ lib/ --include='*.json' --include='*.ts'
```

## 3-2. 보강 내용

**E-7 → F-2 (포인트제) 전환 요건**:
- 최소 체류 기간, 소득 요건, 한국어 능력 (TOPIK), 나이, 학력 등
- 포인트 계산 예시 (80점 이상 필요)
- 예시 시나리오: "30세, 석사, TOPIK 4급, 연봉 4천만원 → 몇 점?"
- 타임라인: E-7 취득 → 3년 후 F-2 신청 가능

**주의**: 포인트 정보는 "공개된 요건 기준"으로만. "당신은 자격이 있다" 절대 불가.

```bash
git add -A && git commit -m "content: deepen E-7 to F-2 path simulator data — points examples, timeline

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

# TASK 4: H-1 워킹홀리데이 차별화

시장조사 결과: 수요 있으나 GoGoHanguk·JENZA 등이 이미 커버. 차별화 필요.

## 4-1. 차별화 포인트

기존 경쟁자가 안 하는 것:
- **국적별 맞춤 정보**: 쿼터, 연령 제한, 협정 세부사항이 국가마다 다름
  - 미국: 30세, 연장 6개월 가능
  - 호주: 30세
  - 캐나다: 30세
  - 일본: 25세 (일부 30세)
  - 프랑스/독일: 30세 or 35세
- **쿼터 오픈 캘린더**: 국가별 쿼터 오픈 시기 정리
- **비자 전환 경로**: H-1 → E-7 (취업), H-1 → D-4-1 (어학연수) 등

## 4-2. 데이터 보강

`data/visas/en/h-1.json` 에 국적별 세부사항 추가.

```bash
git add -A && git commit -m "content: differentiate H-1 working holiday — nationality-specific info, quota calendar

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

# TASK 5: 배포

```bash
npm run build && npm run lint
```

에러 있으면 수정.

```bash
git push origin track-a/content-seo
```

보고서 `docs/TRACK-A-REPORT.md`:
```markdown
# Track A Report

## F-1-D Guide
- Sections added/updated: [list]
- FAQ count: before → after
- Languages updated: [en, ja, zh-tw]

## Taiwan DNV
- Gold Card comparison: added
- Application steps: [count]

## E-7 → F-2 Path
- Points examples added: YES/NO
- Timeline data: added

## H-1 Working Holiday
- Nationalities covered: [count]
- Quota calendar: added YES/NO

## Deploy
- npm run build: PASS/FAIL
- Pushed: YES/NO
```

---

## GLOBAL RULES

### Content Accuracy
- 모든 수치는 공식 출처 기반. 출처 불명확하면 넣지 않는다.
- "약", "추정", "보통" 등의 한정 표현 사용.
- 마지막 업데이트 날짜 표기.

### Legal (Korea)
- ✅ "Published requirements state that..." / "According to the Immigration Service..."
- ❌ "You qualify" / "You are eligible" / "Recommended visa"

### Legal (Taiwan — CRITICAL)
- ❌ NEVER: match scores, percentages, match levels, "you qualify", "consulting" (諮詢)
- ✅ Disclaimers in English AND 繁體中文
- ✅ Client-side only data (localStorage)
- ✅ State LocalNomad is not a licensed 移民業務機構

### Files You Must Not Modify
- `components/**` — Track B에서 관리
- `app/**` — Sprint 0에서 SEO 처리 완료
- `tests/**` — Track B에서 관리
- `components/ui/*` — shadcn/ui managed
