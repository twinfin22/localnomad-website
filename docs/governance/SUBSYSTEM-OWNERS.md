# Subsystem Owner Matrix (서브시스템 오너 매트릭스)

> **목적**: "이 영역에 문제가 생기면 누가 책임지는가"를 명확히 하기.
> Gen님, Cowork(Claude), Claude Code — 세 주체의 역할 분담.

---

## 역할 정의

| 주체 | 할 수 있는 것 | 할 수 없는 것 |
|------|--------------|--------------|
| **Gen** | 의사결정, 브라우저 검증, 프로덕트 판단, 프롬프트 승인 | 코드 작성 |
| **Cowork** | 코드 분석, 문서 작성, 프롬프트 생성, 브라우저 조작 | 자율적 코드 변경 (Gen 승인 필요) |
| **Claude Code** | 프롬프트 기반 코드 실행, 빌드, 린트 | 의사결정 (옵션만 제시) |

---

## 오너십 매트릭스

| 서브시스템 | 오너 | 실행자 | 검증자 | 비고 |
|-----------|------|--------|--------|------|
| **프로덕트 전략** | Gen | — | Gen | 기능 우선순위, 타겟 유저, 수익 모델 |
| **법률 준수** | Gen | Claude Code | Gen + Cowork | CLAUDE.md Legal Bright Lines 기준 |
| **브랜드/디자인** | Gen | Canva/Ideogram | Gen | 로고, 컬러, 파비콘 |
| **아키텍처 결정** | Gen | Cowork(제안) | Gen(승인) | 기술 스택, 데이터 구조, 라우팅 |
| **코드 작성** | Claude Code | Claude Code | Gen(빌드/브라우저) | 프롬프트 기반 실행만 |
| **코드 리뷰** | Gen | Cowork(분석) | Gen(판단) | git diff 확인, 파일 수 확인 |
| **빌드/배포** | Gen | Claude Code / Vercel | Gen | `git push` = 자동 배포 |
| **인증 (Supabase)** | Gen | Claude Code | Gen | 계정 설정은 Gen 직접 |
| **i18n (번역)** | Gen | Claude Code | Gen | JSON 파일 편집 |
| **비자 데이터** | Gen | Claude Code | Gen + Legal | JSON 데이터 정확성 |
| **SEO** | Gen | Claude Code | Google Search Console | sitemap, hreflang, 메타데이터 |
| **기술 부채 관리** | Gen | Cowork(추적) | Gen(정산) | TECH-DEBT.md 기준 |
| **문서 관리** | Gen | Cowork | Gen | governance/ 폴더 |

---

## 승인 없이 하면 안 되는 것 (금지선)

이전에 발생한 문제들을 기반으로:

| 금지 행위 | 이유 | 사례 |
|-----------|------|------|
| AI가 자율적으로 패키지 설치 | 불필요한 의존성 추가 | Playwright 무단 추가 |
| AI가 자율적으로 빌드/검증 후 "문제 없음" 판정 | 검증 범위를 Gen이 정해야 함 | Puppeteer flickering 오판 |
| AI가 자율적으로 코드 억제 (suppressHydrationWarning 등) | 문제 숨김 | hydration 경고 숨기기 |
| AI가 추천 없이 단일 방법 실행 | 선택지를 Gen에게 줘야 함 | 아키텍처 결정 위임 |
| AI가 법률 관련 코드를 자율 작성 | 법률 위반 리스크 | 퀴즈 스코어링 |

---

## 에스컬레이션 규칙

```
문제 발생
    │
    ├─ 빌드 실패 → Claude Code가 에러 보고 → Gen 판단
    │
    ├─ 법률 관련 → Cowork가 감사 → Gen 최종 판단
    │
    ├─ 아키텍처 변경 필요 → Cowork가 옵션 제시 → Gen 선택
    │
    ├─ 기능 안 됨 → Gen이 브라우저에서 확인 → Cowork가 원인 분석
    │
    └─ "잘 모르겠다" → Gen이 Cowork에게 "왜?" 질문 → 학습
```

---

*마지막 업데이트: 2025-02-17*
