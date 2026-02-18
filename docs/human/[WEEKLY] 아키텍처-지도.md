# [WEEKLY] 아키텍처 지도 — v2

> **목적**: "이 앱이 어떻게 돌아가는지"를 한눈에 파악
> **v1 기록**: `docs/human/v1/[WEEKLY] 아키텍처-지도.md` 참고
> **상태**: Tech stack 미정 — 확정 후 본격 작성

---

## 1. 전체 구조 (예정)

```
[사용자 브라우저 — 모바일 우선]
    │
    ├─ 비자 정보 열람 (정적 페이지 — JSON 기반)
    │   ├─ 비자 상세 페이지 (/korea/visa/[type])
    │   ├─ Visa Overview
    │   ├─ Comparison Tool
    │   └─ Path Simulator
    │
    ├─ 인증 (Supabase Auth — 매직 링크)
    │
    └─ 대시보드 (동적 — Supabase DB)
        ├─ D-Day 카운트다운
        ├─ 체크리스트 진행
        ├─ OASIS 점수 트래커
        └─ Tax Residency 트래커
```

## 2. 데이터 흐름

```
[Visa Navigator PDF] → JSON 파일 → 빌드 시 HTML 포함 → 사용자에게 서빙
[사용자 입력] → Supabase DB → 대시보드 렌더링
[매직 링크 클릭] → Supabase Auth → 세션 쿠키 → 대시보드 접근
```

## 3. URL 구조

```
/korea/visa/f-1-d          → F-1-D 비자 상세
/korea/visa/e-7             → E-7 비자 상세
/korea/visa/compare         → 비자 비교 도구
/taiwan/visa/gold-card      → Gold Card 상세
/taiwan/visa/dnv            → DNV 상세
```

## 4. 브라우저 전용 데이터

| 데이터 | 이유 |
|--------|------|
| File Sanitizer 파일 (post-MVP) | 개인정보 보호 |
| 대만 퀴즈/체크리스트 데이터 | 대만 법규 컴플라이언스 |

## 5. 파일 구조 (Tech stack 확정 후 업데이트)

```
(미정 — Phase 1-1 프로젝트 셋업 완료 후 작성)
```

## 6. 변경 영향도 맵

| 변경 대상 | 영향 범위 | 위험도 |
|-----------|----------|--------|
| (v2 개발 시작 후 작성) | — | — |

---

*마지막 업데이트: 2025-02-19*
*다음 업데이트: Tech stack 확정 시*
