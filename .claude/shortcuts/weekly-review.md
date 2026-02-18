# Weekly Review Shortcut

> `/weekly-review` — LocalNomad 주간 리뷰 자동 실행

---

## Prompt (Claude에게 전달)

아래 내용을 그대로 Cowork 채팅에 붙여넣거나, `/weekly-review` shortcut으로 실행하세요.

```
LocalNomad 주간 리뷰를 실행해줘. 아래 순서대로 진행하고 결과를 리포트로 보여줘.

## 1. 기술 부채 리뷰
- `docs/governance/TECH-DEBT.md` 읽어서 현재 OPEN 항목 수 확인
- OPEN 5개 이상이면 ⛔ 경고
- 각 OPEN 항목의 등록일로부터 경과 일수 계산

## 2. Mental Model Check
- `docs/governance/MENTAL-MODEL-CHECK.md`에서 아직 답변 안 한 질문 목록 보여줘
- 이번 주에 하나 골라서 Gen님에게 질문

## 3. Architecture Walkthrough
- `docs/governance/ARCHITECTURE-MAP.md`에서 랜덤 페이지 경로 하나 골라서
- "이 페이지의 데이터 흐름을 설명해보세요" 형태로 Gen님에게 질문

## 4. Self-Demo 체크리스트
- `npm run build` 성공 여부 확인
- 주요 페이지 목록 제시 (Gen님이 직접 브라우저에서 확인)

## 5. 리뷰 리포트
아래 형식으로 요약:

### 📊 주간 리뷰 리포트
- 기술 부채: OPEN ___개 / 신규 ___개 / 해결 ___개
- 멘탈 모델: 미답변 질문 ___개 / 이번 주 질문: "___"
- 아키텍처: 워크스루 질문: "___"
- 빌드 상태: ✅ / ❌
- 다음 주 우선순위 제안: ___

## 규칙
- 존댓말 사용
- 기술 용어에 📘 각주 추가
- 추천하지 말고 선택지 제시
```
