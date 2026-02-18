# [WEEKLY] 의사결정 일지 — v2

> **목적**: "왜 이렇게 했지?"를 나중에 찾아볼 수 있도록 기록
> **v1 기록**: `docs/human/v1/[WEEKLY] 의사결정-일지.md` 참고

## 읽는 법
- **맥락**: 왜 이 결정이 필요했는지
- **선택지**: 어떤 옵션들이 있었는지 (장단점 포함)
- **결정**: 뭘 선택했는지
- **이유**: 왜 이걸 선택했는지
- **📘 배경지식**: 결정에 필요한 기술적 맥락 (있을 때만)

---

## 2025-02-19

### v2 재구축 결정

- **맥락**: v1에서 오너십 부채(AI에게 과도하게 위임) + 기술 부채(flickering 미해결)가 누적. 부분 수정보다 처음부터 다시 만드는 게 빠르다고 판단.
- **결정**: v1 전체 아카이브 → v2 처음부터 재구축
- **이유**: v1의 문제를 패치하면 할수록 복잡도만 증가. 클린 상태에서 올바른 아키텍처로 시작하는 게 장기적으로 빠름.
- **📘 배경지식**: `v1-archive` 브랜치에 v1 코드 보존. `git checkout v1-archive -- 파일경로`로 특정 파일을 꺼내 쓸 수 있음. 인벤토리: `docs/agent/reference/v1-archive-inventory.md`

### Tech Stack 결정 보류

- **맥락**: v1에서 Next.js flickering 미해결 → Astro가 대안이 될 수 있음
- **선택지**: (A) Next.js 16 (v1 동일) (B) Astro + React island
- **결정**: 스펙 확정 후 결정
- **이유**: 기능이 확정되어야 프레임워크 적합성 판단 가능. 특히 대시보드의 동적 기능 비중에 따라 최적 선택이 달라짐.

### MVP 빌드 순서: 옵션 C (하이브리드)

- **맥락**: 3가지 빌드 순서 옵션 비교
- **선택지**: (A) 콘텐츠 퍼스트 (B) 풀스택 슬라이스 (C) 하이브리드
- **결정**: C — 골격 + F-1-D 풀스택 → 확장
- **이유**: A의 "빠른 배포"와 B의 "Auth 리스크 조기 발견"을 동시에 달성. Phase 1에서 F-1-D 하나로 전체 아키텍처 검증 → Phase 2에서 검증된 템플릿을 복제.

### Mobile First 최우선 원칙

- **맥락**: 타겟 유저(한국/대만 체류 외국인)가 주로 모바일로 비자 정보 검색
- **결정**: Mobile First를 디자인 원칙 1번으로 확정. 다른 것을 희생해도 모바일 UX 우선. Trade-off 발생 시 Gen에게 보고 후 결정.
- **이유**: Reactive + intuitive UX가 이 제품의 핵심 가치.

### 이메일 알림 MVP 제외

- **맥락**: 대시보드 알림을 어떻게 전달할지
- **결정**: MVP에서는 대시보드 내 시각적 표시만. 이메일 알림은 post-MVP.
- **이유**: 이메일 서비스(Resend, SendGrid) 연동 + 발송 시나리오 설계는 MVP 범위를 넘김.

### 대시보드 유료화 기준

- **맥락**: 수익화 시점과 범위
- **결정**: MAU 100 도달 시 대시보드 유료 전환. 비자 정보 열람은 영구 무료.
- **이유**: 정보 열람 무료 → SEO/유입 채널 유지. 대시보드(개인화 기능)에 비용을 부과하면 가치 대비 지불 의사가 있는 유저만 남음.

### 비자 데이터 Single Source of Truth

- **맥락**: 비자 요건 데이터의 공식 출처
- **결정**: HiKorea Visa Navigator PDF를 Single Source of Truth로 지정
- **이유**: 정부 공식 자료. 블로그/커뮤니티 정보는 부정확할 수 있음.

### Tech Stack: Next.js 16 + RSC 규율

- **맥락**: v1 flickering 미해결로 Astro가 대안으로 떠올랐으나, RSC를 제대로 쓰면 같은 효과를 낼 수 있다는 판단
- **선택지**: (A) Next.js 16 + RSC 규율 (B) Astro + React island
- **결정**: A — Next.js 16 + App Router + RSC 규율
- **이유**: v1 실패 원인은 Next.js가 아니라 "use client" 남용. Server Component를 기본으로 하고 상호작용 필요한 조각만 Client로 분리하면 Astro의 island 패턴과 동일한 효과. 러닝커브 없음, next-intl/shadcn/ui 생태계 성숙, AI 도구 지원도 더 좋음. 한국/대만 4G 환경에서 React 런타임(~85KB)은 체감 불가 수준.
- **📘 배경지식**: RSC(React Server Component)는 서버에서 HTML을 완성해서 보내는 컴포넌트. JS가 브라우저에 전송되지 않아 빠름. "use client"를 붙여야만 브라우저에서 JS가 실행됨. v2의 핵심 규율: Client Component 비율 20% 이하 유지.

### Google Analytics (GA4) 확정

- **맥락**: MAU 100 유료화 기준을 측정할 Analytics 도구 선택
- **선택지**: (A) Vercel Analytics (간편) (B) Google Analytics (무료, 상세) (C) Plausible (프라이버시 친화, 유료)
- **결정**: B — Google Analytics (GA4)
- **이유**: 무료이면서 상세한 이벤트 트래킹 가능. MAU 대시보드 바로 확인 가능.

### 랜딩 페이지 히어로 확정

- **맥락**: localnomad.club 첫 화면 구성
- **결정**: 옵션 B (가치 제안 + CTA). Stripe/Linear/Notion 스타일 — 솔리드 배경(`#1B4965`) + 강한 타이포그래피, 이미지 없음.
- **헤드라인**: "Visa clarity, finally."
- **부제**: "Everything you need to know about your Korea or Taiwan visa, organized so you don't have to be."
- **CTA**: 한국/대만 카드 2개
- **이유**: 타이포그래피 + 컬러만으로 "clarity" 메시지 전달. 이미지 없음 = LCP 최소화 + Mobile First.

### Core Web Vitals 목표 확정

- **맥락**: Mobile First 제품의 성능 목표치 설정
- **결정**: Google "좋음" 구간 — LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms
- **📘 배경지식**: CWV = Google이 사이트 UX를 측정하는 3지표. LCP(로딩 체감), CLS(레이아웃 밀림), INP(터치 반응). 검색 순위에 영향.

### shadcn/ui 설정 확정

- **맥락**: shadcn/ui 초기화 시 선택 필요한 설정값
- **결정**: Style = New York, Base color = Slate, CSS variables = Yes
- **이유**: New York은 각지고 밀도 높은 UI — Linear/Stripe 레퍼런스와 톤 일치. Slate는 브랜드 컬러(`#1B4965` 딥 틸)와 푸른 톤 매칭. CSS variables는 추후 다크 모드 대비.
- **📘 배경지식**: shadcn/ui는 컴포넌트를 프로젝트에 직접 복사하는 방식. `components.json`에 스타일 설정 저장. New York vs Default = 각진 밀도 높은 UI vs 둥근 여유 있는 UI.

### 릴리즈 전략: main 직접 배포

- **맥락**: Vercel auto-deploy 기반 배포 프로세스
- **결정**: main 브랜치 직접 배포 (옵션 A). 큰 기능은 PR → Vercel Preview → 확인 → 머지.
- **이유**: 솔로 개발에 staging 브랜치나 feature flag는 과한 복잡도. Vercel Preview가 실질적 staging 역할.

### 런칭 시점: Phase 1 소프트 런칭

- **맥락**: 언제 공개할지
- **결정**: Phase 1 완료 시 소프트 런칭 (F-1-D 하나만으로). 런칭 채널/방법은 Phase 1 완료 시 별도 논의.
- **이유**: 빠른 피드백 확보. 완성도보다 속도 우선.

---

*마지막 업데이트: 2025-02-19*
