# Tech Debt Registry

> **규칙**: OPEN 항목이 5개 이상이면 새 기능 추가를 중단하고 부채 정리부터 진행.
> Claude는 매 작업 완료 시 이 문서를 업데이트해야 함.

## 읽는 법
- **TD#**: 추적 번호 (DECISION-LOG.md에서 "→ TD#3" 형태로 참조)
- **Severity**: HIGH(사용자가 눈으로 볼 수 있는 문제), MEDIUM(코드 품질), LOW(나중에 문제될 수 있는 것)
- **Deadline**: 언제까지 해결해야 하는지
- **📘**: 기술 용어 설명

## 현황 요약

```
OPEN:  0개  ← ✅ 새 기능 진행 가능
해결됨: 8개
```

---

## Open Items

(없음)

---

## Resolved Items

| # | 등록일 | 해결일 | 파일 | 설명 |
|---|--------|--------|------|------|
| R1 | 2025-02-16 | 2025-02-17 | `EligibilitySection.tsx` 외 2개 | Dead code — export만 있고 실제 사용 없음 → 삭제 완료 |
| R2 | 2025-02-16 | 2025-02-17 | `EligibilityQuizResults.tsx` 외 5개 | Taiwan법 위반 스코어링/퍼센티지 UI → 제거 완료 (DECISION-LOG 2025-02-16 참조) |
| TD#1 | 2025-02-17 | 2025-02-17 | `use-mobile.ts`, `use-mobile.tsx`, `sidebar.tsx` | Dead code — import 0건 확인 후 3개 파일 전체 삭제 |
| TD#2 | 2025-02-17 | 2025-02-17 | `DDayCounter.tsx` | Server Component 전환 — "use client"/useState/useEffect/interval 제거, 서버에서 직접 날짜 계산 |
| TD#3 | 2025-02-17 | 2025-02-17 | `VisaJourneyPage.tsx` | 배너 초기값 반전 — useState(true)→false + useEffect 조건 반전. 방향: "없다가 나타남"→"있다가 사라짐" |
| TD#4 | 2025-02-17 | 2025-02-17 | `ChecklistStep.tsx` | 중복 hash deep link useEffect 삭제 — 부모(VisaJourneyPage)가 이미 처리 |
| TD#5 | 2025-02-17 | 2025-02-17 | — | Skip — percentage/matchScore 코드 이미 정리 완료 (grep 결과 0건) |
| TD#6 | 2025-02-17 | 2025-02-17 | `SocialProofBar.tsx`, `DDayPanel.tsx`, `DashboardContent.tsx`, `OnboardingResults.tsx`, `visa/index.ts` | Hydration-safe 전환 — `new Date()`/`Date.now()` render-time 호출을 `useState`+`useEffect`로 이동. DDayCounter barrel export 제거 (SC는 client barrel에서 export 부적절) |
