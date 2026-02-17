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
OPEN:  5개 (HIGH 3 / MEDIUM 1 / LOW 1)  ← ⛔ 5개 이상 = 새 기능 차단
해결됨: 2개
```

---

## Open Items

### TD#1 — useIsMobile flickering | HIGH
- **파일**: `components/ui/use-mobile.tsx`
- **문제**: 이 hook¹은 서버에서 "모바일 아님(false)"으로 시작 → 브라우저에서 "모바일임(true)"으로 바뀜 → 화면 레이아웃이 깜빡임
- **영향**: 모바일로 접속하는 모든 사용자가 페이지 로딩 시 깜빡임을 봄
- **해결 방향 (미정)**:
  - (A) CSS media query²로 대체 — JS 없이 CSS만으로 화면 크기 대응
  - (B) 서버에서 User-Agent³으로 모바일 여부 추정
- **Deadline**: flickering 수정 스프린트 (오너십 부채 해소 후 첫 작업)
- **등록일**: 2025-02-17
- **📘**:
  > ¹ **hook**: React에서 상태(state)나 부수효과(side effect)를 관리하는 함수. `useIsMobile()`은 "지금 화면이 모바일 크기인가?"를 알려주는 hook.
  > ² **CSS media query**: `@media (max-width: 768px) { ... }` 형태로, 화면 크기에 따라 다른 스타일을 적용하는 CSS 기능. JavaScript 없이 작동하므로 서버/클라이언트 불일치가 없음.
  > ³ **User-Agent**: 브라우저가 서버에 보내는 "나는 iPhone의 Safari야" 같은 정보. 100% 정확하지는 않지만 대략적인 판단 가능.

### TD#2 — DDayCounter flickering | HIGH
- **파일**: `components/visa/DDayCounter.tsx`
- **문제**: 처음에 "날짜 없음(null)"으로 렌더 → useEffect⁴에서 날짜 계산 → null이 갑자기 "D-42"로 바뀌며 깜빡임
- **영향**: D-day 카운터가 있는 모든 비자 페이지
- **해결 방향 (미정)**:
  - (A) Server Component로 전환 — Date 계산에 브라우저 API 불필요, 서버에서 바로 계산 가능
  - (B) Skeleton placeholder — 날짜가 나올 때까지 회색 박스 표시
- **Deadline**: flickering 수정 스프린트
- **등록일**: 2025-02-17
- **📘**:
  > ⁴ **useEffect**: "브라우저에서 페이지가 뜬 직후 실행되는 코드"를 넣는 곳. 서버에서는 실행 안 됨. 그래서 useEffect 안에서 상태를 바꾸면 "서버 렌더 → 브라우저 렌더 → useEffect로 또 바뀜" = flickering 발생.

### TD#3 — VisaJourneyPage flickering | HIGH
- **파일**: `components/visa/journey/VisaJourneyPage.tsx`
- **문제**: localStorage⁵에서 배너 표시 여부를 읽음 → 서버에는 localStorage가 없어서 초기값으로 렌더 → 브라우저에서 값을 읽은 후 배너가 갑자기 나타나거나 사라짐
- **영향**: 비자 여정 페이지
- **해결 방향 (미정)**:
  - (A) 로딩 상태 표시 — localStorage 결과 나올 때까지 skeleton
  - (B) 배너 기본값을 "숨김"이 아닌 "표시"로 변경
- **Deadline**: flickering 수정 스프린트
- **등록일**: 2025-02-17
- **📘**:
  > ⁵ **localStorage**: 브라우저에 데이터를 저장하는 기능 (쿠키와 비슷하지만 더 큼). "이 배너를 이미 닫았는가?" 같은 사용자 설정을 저장. 서버에서는 접근 불가능.

### TD#4 — ChecklistStep flickering | MEDIUM
- **파일**: `components/visa/journey/ChecklistStep.tsx`
- **문제**: URL hash⁶(#step-3 같은)를 읽어서 해당 아코디언을 여는데, 서버에서는 hash를 모르므로 전부 닫힌 상태 → 브라우저에서 열림 → 깜빡임
- **영향**: 체크리스트 페이지에서 특정 단계로 링크된 경우
- **해결 방향 (미정)**:
  - (A) CSS `:target` 선택자로 대체 — JS 없이 hash 기반 스타일링
  - (B) 초기 상태를 "열림"으로 변경
- **Deadline**: flickering 수정 스프린트
- **등록일**: 2025-02-17
- **📘**:
  > ⁶ **URL hash**: URL 끝의 `#section-name` 부분. 페이지 내 특정 위치로 이동할 때 사용. 서버는 hash를 받지 못함 (브라우저만 알고 있는 정보).

### TD#5 — EligibilityQuiz 미사용 코드 | LOW
- **파일**: `components/visa/eligibility/EligibilityQuiz.tsx`
- **문제**: percentage 계산 로직이 남아있음. UI에는 안 쓰이지만 불필요한 코드가 혼란을 줄 수 있음.
- **영향**: 없음 (사용자에게 보이지 않음). 하지만 나중에 누군가 이 코드를 보고 "percentage를 표시해야 하나?" 오해할 수 있음.
- **해결 방향**: 해당 계산 로직 삭제
- **Deadline**: 다음 코드 정리 시
- **등록일**: 2025-02-17

---

## Resolved Items

| # | 등록일 | 해결일 | 파일 | 설명 |
|---|--------|--------|------|------|
| R1 | 2025-02-16 | 2025-02-17 | `EligibilitySection.tsx` 외 2개 | Dead code — export만 있고 실제 사용 없음 → 삭제 완료 |
| R2 | 2025-02-16 | 2025-02-17 | `EligibilityQuizResults.tsx` 외 5개 | Taiwan법 위반 스코어링/퍼센티지 UI → 제거 완료 (DECISION-LOG 2025-02-16 참조) |
