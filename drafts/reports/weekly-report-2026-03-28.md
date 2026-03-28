# LocalNomad 주간 보고서 — 2026-03-28

## TLDR
한국 세금 블로그 5건 신규 발행 및 비자 데이터 무결성 전수 감사 완료로 콘텐츠 신뢰도를 강화하고, SEO pulse·Reddit karma·Telegram 알림 등 자동화 파이프라인 3종을 가동했습니다.

## Wins
- **한국 세금 콘텐츠 5건 발행** — 프리랜서 신고, 암호화폐 과세(2027), 5년 규칙, 이중과세조약 가이드, 출국 금융 체크리스트 — 한국 세금 허브 초안 완성
- **블로그 무결성 감사 완료** — 28개 포스트 정부 출처 링크 소급 적용, 5개 포스트 사망 URL 교체, blog↔visa JSON 교차검증 11건 불일치 수정 + pre-commit 훅 도입
- **비자 SoT 감사 57건 수정** — 3개국 37건(round 2) + 15개 JSON P0 20건: F-6 소득 기준, Japan BM ISA 개혁, DN/B-2 근거 갱신; E-7·D-10·Gold Card 등 6개 비자 연간 면책 조항 동기화
- **자동화 파이프라인 3종 가동** — ① Reddit karma 일간 GitHub Action(스레드 답글 초안), ② SEO pulse GitHub Action + Telegram 포맷 확정, ③ 모든 cron job Telegram 알림 통합
- **인프라 하드닝** — drafts/auto 브랜치 트리거 정비, 사전 검증 누락 직업 보상기 seo-pulse 추가, sandbox 커밋 워크어라운드 규칙 문서화

## Metrics
| 지표 | 이번 주 | 지난 주 | 변화 |
|------|---------|---------|------|
| 커밋 수 | 50 | 95 | ↓ -47% |
| 블로그 신규 발행 | 5 | 2 | ↑ +3 |
| 블로그 수정(감사·링크) | 33 | 30 | ↑ +3 |
| 블로그 초안 대기 | 0 | 0 | → |
| 비자 팩트체크 수정 | 57 | ~20 | ↑ |
| 다룬 국가 | KR, JP, TW | KR, JP, TW | → |

## Blockers & Risks
- **[M] Lighthouse LCP 안정화 미검증** — perf 커밋 10+ 건 반영했으나 모바일 실측값 미확인
  - 근본 원인: hero 구현(CSS bg vs next/image) 전환 반복, 회귀 방지 CI 없음
  - 완화 계획: 다음 배포 후 모바일 Lighthouse 3회 연속 측정 + NO_LCP 0건 확인
  - 결정 필요: **예** — LCP < 2.5s 안정화 확인 전 추가 perf 작업 중단 여부
- **[M] IG PostNitro 파이프라인 과금 미확정** — 체크리스트·템플릿 ID 구축 완료, 운영 전환 시 과금 구조 미검토
  - 근본 원인: PostNitro 유료 전환 결정 보류 중
  - 완화 계획: PostNitro 플랜 확인 후 자체 생성 vs 구독 결정
  - 결정 필요: **예** — Gen 결정 필요
- **[L] 모바일 QA 2주 연속 미진행** — 네이버·카카오 인앱 브라우저 검증 없음, 잠재적 렌더링 이슈 누적
  - 근본 원인: 우선순위 밀림 (perf·콘텐츠 작업에 리소스 집중)
  - 완화 계획: 다음 주 QA 체크리스트 5페이지 실행 필수 배정
  - 결정 필요: **아니오**

## Next Week 우선순위
1. **Lighthouse 모바일 안정성 확인** — 완료 기준: 모바일 LCP < 2.5s, NO_LCP 0건 연속 3회 측정 후 결과 보고
2. **SEO pulse 첫 리포트 실행** — 완료 기준: seo-pulse GitHub Action 1회 성공 실행 + Telegram 리포트 수신 확인
3. **모바일 QA 실시** — 완료 기준: 주요 5페이지(랜딩, 비자상세, 블로그, 동네, 비교) 네이버/카카오/Safari 체크리스트 통과
4. **Reddit karma 실전 파일럿** — 완료 기준: 실제 스레드 2건 이상 답글 초안 생성 + subreddit 규칙 적합성 검토
5. **IG PostNitro 결정** — 완료 기준: Gen 결정 완료 + 운영 방식(유료 구독 or 자체) 확정

---
*Claude CLI로 자동 생성 (2026-03-28 KST)*
*데이터: git log, content/blog/, docs/human/[WEEKLY] 주간-자동-보고.md*
