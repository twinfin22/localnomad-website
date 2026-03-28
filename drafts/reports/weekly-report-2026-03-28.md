# LocalNomad 주간 보고서 — 2026-03-28

## TLDR
랜딩 페이지 전면 재설계·국가 허브 출시와 비자 SoT 57건 수정으로 프론트엔드 품질과 데이터 무결성을 동시에 확립했습니다.

## Wins
- **랜딩·국가 허브 전면 재설계**: 목적지 카드, 커스텀 Mapbox, 체크리스트 CTA 신규 구현; 동네 캐러셀 3→29개 카드 전환; 국가 허브 i18n + 스크롤 애니메이션 완료
- **Lighthouse LCP 집중 정비**: NO_LCP 7회 반복 수정 → CSS 배경이미지 전환·grain overlay 제거·Mapbox lazy-load로 안정화; 폴리필 -14KiB, CJK 폰트 로케일별 조건부 로딩 적용
- **비자 SoT 무결성 감사 2라운드 완료**: 3개국 37건 + 15개 JSON P0 20건, 합계 57개 팩트체크 수정; F-6 소득 기준·Japan BM ISA 개혁·SSW1/2 고용주 요건 반영
- **블로그 2건 신규 발행 + 32개 파일 정비**: `korea-double-tax-treaty-guide-2026`, `leaving-korea-money-checklist-2026` 공개; tips·comparisons·guides·news 4개 카테고리 정비
- **개발 인프라 하드닝**: lefthook pre-commit ESLint + pre-push tsc 도입; Turbopack 네이티브 번들 분석기 전환; IG 파이프라인 PostNitro 체크리스트 구축

## Metrics
| 지표 | 이번 주 | 지난 주 | 변화 |
|------|---------|---------|------|
| 커밋 수 | 50 | 0 | ↑ |
| 블로그 발행(신규) | 2 | 0 | ↑ |
| 블로그 수정(기존) | 30 | 0 | ↑ |
| 블로그 초안 대기 | 0 | 0 | → |
| 다룬 국가 | korea, japan, taiwan, china, sea | — | +china, sea |

## Blockers & Risks
- **[M] LCP 수정 반복 (7+ 커밋)** — 동일 증상 다회 재발은 근본 원인 미확정 시사. 성능 회귀 위험 존재.
  - 근본 원인: hero 구현 방식(next/image↔CSS bg)과 ScrollReveal 간 LCP 후보 충돌, 검증 루프 없이 수정 반복
  - 완화 계획: 다음 배포 후 Lighthouse CI 자동화 or 수동 모바일 재측정 실시
  - 결정 필요: **예** — Lighthouse 모바일 측정값 확인 후 안정화 여부 확정 요청
- **[L] Supabase TD#1 미해소** — `lib/types/database.ts` 미생성, `as` 캐스트 7개 잔존
  - 근본 원인: Supabase CLI 미연결
  - 완화 계획: 대시보드 기능 확장 전 CLI 연결로 자동생성
  - 결정 필요: **아니오** (LOW 우선순위 유지 가능)

## Next Week 우선순위
1. **Lighthouse 모바일 안정성 검증** — 완료 기준: 모바일 LCP < 2.5s, NO_LCP 0건 연속 3회 측정
2. **Reddit karma 스킬 실전 파일럿** — 완료 기준: 실제 스레드 2개 이상 답글 초안 생성 및 게시 확인
3. **Supabase CLI 연결 (TD#1 해소)** — 완료 기준: `database.ts` 자동생성 완료, `as` 캐스트 0개
