# 주간 자동 보고서

**생성일시**: 2026-03-15 (일) 15:00 KST

---

## 1. 블로그 워크플로우 현황

- `[WEEKLY] 블로그-후보.md`가 **2026-03-08**에 생성되었습니다.
- 생성된 후보 목록 (7건):
  1. South Korea's 2026 Immigration Overhaul: New Top-Tier Visas, K-Core, and Regional Worker Paths
  2. Korea's F-1-D Workation Visa in 2026: The Longest Digital Nomad Visa in East Asia
  3. Taiwan's 2026 Gold Card Revolution: 1-Year Fast-Track to Permanent Residency
  4. Japan vs Korea vs Taiwan: Digital Nomad Visa Showdown (2026 Edition)
  5. The 183-Day Tax Trap: What Digital Nomads in Korea and Japan Don't Know Until It's Too Late
  6. Japan's New Housing Proof Rule for Digital Nomads: What It Means and How to Prepare
  7. Seoul vs Tokyo in 2026: Honest Cost-of-Living Breakdown for Remote Workers
- **이번 주 발행**: 직접 새로 발행된 포스트는 확인되지 않았습니다. 다만 기존 포스트 대규모 리라이트 및 팩트체크 수정이 집중적으로 진행되었습니다.
- **상태**: Step 1 완료, Gen 선택 대기 중

---

## 2. 기술부채 현황

```
OPEN: 1개 ✅ — 새 기능 진행 가능
```

- **TD#1 — Supabase 타입 자동생성 (LOW)**: `lib/types/database.ts` 미생성, `dashboard.ts`에 수동 `as` 캐스트 7개 잔존. Supabase CLI 연결 후 해결 필요.

기술부채 상태가 양호합니다. OPEN 항목 1개로 신규 기능 개발에 제약이 없습니다.

---

## 3. 코드베이스 변경 요약 (최근 7일, 21개 커밋)

- **팩트체크 인프라 대폭 강화**: 정부 출처 14곳 추가, 반론 검증(contrarian verification) 아키텍처 도입, 3차에 걸친 팩트체크 수정 (23개 → 13개 → 7개 → 19개 deferred 항목 해소)
- **블로그 콘텐츠 품질 개선**: 25개 포스트 LibaD 보이스 리라이트 + 커버이미지 교체, F-1-D 비교 포스트 796w→1400w 확장, K-STAR 포스트 690w→1500w+ 확장
- **Reddit 마케팅 도구 구축**: `/reddit-karma` 스킬 신규 개발 — 스레드 스카우팅, 블로그 지식 기반 답글 초안, JSON 계약 기반 서브에이전트 아키텍처
- **플러그인 컨텍스트 엔지니어링**: 블로그 플러그인 서브에이전트 격리, 지연 로딩, 팩트체크 스킬 캐시/중복제거 최적화
- **TldrBox + CheckGrid 컴포넌트 추가**: 안티AI 체크리스트 확장, 파이프라인 하드닝

---

## 4. 다음 주 추천 작업

1. **블로그 후보 선택 및 발행**: 3월 8일자 후보 7건 중 선택하여 초안 작성 → 발행 진행이 필요합니다. 팩트체크 인프라가 강화된 상태이므로 품질 높은 포스트 생산이 가능합니다.
2. **Reddit karma 스킬 실전 테스트**: 스킬이 구축되었으나 실제 Reddit 스레드에 투입한 이력이 확인되지 않습니다. 파일럿 운영으로 효과를 검증해보시는 것을 추천드립니다.
3. **Supabase CLI 연결 (TD#1 해소)**: 유일한 기술부채 항목입니다. 우선순위가 LOW이지만, 대시보드 관련 기능 확장 전에 해소하시면 타입 안전성이 확보됩니다.

---

## 5. 주간 리뷰 알림

⚠️ **주간 리뷰가 밀려있습니다.** `last_review: 2026-02-27` — 16일 경과. `/weekly-review`를 실행해주세요.

---

📋 이 보고서는 자동 생성되었습니다. 질문이 있으시면 말씀해주세요.
