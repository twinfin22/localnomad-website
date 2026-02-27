# [DAILY] 기술부채 현황 — v2

> **규칙**: OPEN 항목이 5개 이상이면 ⛔ 새 기능 개발 중단, 부채 해소 먼저
> **v1 기록**: `docs/human/v1/[DAILY] 기술부채-현황.md` 참고

## 읽는 법
- **TD#**: 추적 번호 (의사결정-일지에서 "→ TD#3" 형태로 참조)
- **Severity**: HIGH(사용자가 눈으로 볼 수 있는 문제), MEDIUM(코드 품질), LOW(나중에 문제될 수 있는 것)
- **📘**: 기술 용어 설명

## 현황 요약

```
OPEN:  1개  ← ✅ 새 기능 진행 가능
해결됨: 0개
```

---

## Open Items

### TD#1 — B4: Supabase 타입 자동생성 (LOW)
- **등록일**: 2026-02-27
- **파일**: `lib/types/database.ts` (미생성), `lib/actions/dashboard.ts` (수동 `as` 캐스트 7개 잔존)
- **설명**: Supabase CLI가 프로젝트에 설정되어 있지 않아 `npx supabase gen types` 실행 불가. CLI 연결 후 타입 생성 → dashboard.ts의 수동 캐스트 제거 필요
- **📘**: `supabase gen types`는 DB 스키마에서 TypeScript 타입을 자동 생성. 수동 `as` 캐스트 대신 타입 안전성 확보

---

## Resolved Items

| # | 등록일 | 해결일 | 파일 | 설명 |
|---|--------|--------|------|------|
| — | — | — | — | — |
