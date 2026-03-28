# SEO Weekly Pulse — 2026-03-24

## 1. TLDR

- **0 clicks / ~145 impressions / 0% CTR** — 아직 클릭 전환이 전무합니다. 노출은 있으나 SERP에서 선택받지 못하는 상태.
- **노출의 ~47%가 삭제된 `/vi/` locale의 China Alipay 포스트**에 집중 — 범위 밖 콘텐츠가 인덱스에 남아있어 브랜드 시그널을 희석시키고 있습니다.
- **핵심 제품 페이지(visa, neighborhood)는 극소 노출** — f-1-d, gold-card, h-1 각 1-2회. 인덱싱/권위 구축 초기 단계.

## 2. Top Queries (by impressions, since 0 clicks across all)

| Query | Impr | CTR | Avg Pos | Page | Flag |
|-------|------|-----|---------|------|------|
| calm app payment methods alipay wechat pay china | 35 | 0% | 8.8 | /vi/.../china-alipay... | ❌ off-scope, dead locale |
| korean tips for digital nomads | 27 | 0% | 5.6 | /zh-cn/.../korea-ultimate... | ⚡ **striking distance** |
| how to korean for digital nomads | 24 | 0% | 11.1 | /zh-cn/.../korea-ultimate... | near striking |
| alipay international card support update march 2026 | 7 | 0% | 4.7 | /vi/.../china-alipay... | ❌ off-scope |
| what kind of housing...tokyo | 6 | 0% | 9.2 | /en/.../japan-housing... | ⚡ **striking distance** |
| japanese neighborhoods | 5 | 0% | 59.2 | /en/neighborhood/japan | low position |
| mandarin tips for digital nomads | 5 | 0% | 9.2 | /zh-cn/.../china-ultimate... | ❌ off-scope |
| デジタルノマドビザ | 4 | 0% | 93.5 | /ja/japan | very low position |
| alipay wechat pay international qr code... | 3 | 0% | 8.3 | /vi/.../china-alipay... | ❌ off-scope |
| how to mandarin for digital nomads | 3 | 0% | 9.7 | /zh-cn/.../china-ultimate... | ❌ off-scope |

## 3. Device Split

| Device | Impressions | Queries |
|--------|-------------|---------|
| Desktop | ~133 (92%) | 30 |
| Mobile | ~12 (8%) | 5 |

데스크톱 압도적. 모바일 노출이 거의 없음 — 모바일 인덱싱 이슈는 아닐 가능성 높고, 단순히 쿼리 볼륨이 적은 니치 시장 특성. 다만 "f1d visa korea" 모바일 **position 1** 이 유일한 하이라이트.

## 4. Content Opportunities

### High impressions, 0 CTR → Title/Meta 개선

| Query | Impr | Position | Issue |
|-------|------|----------|-------|
| korean tips for digital nomads | 27 | 5.6 | **최우선**. Position 5-6인데 클릭 0 → title/description이 쿼리 의도와 불일치. 게다가 `/zh-cn/` locale로 노출됨 (영어 쿼리에 중국어 페이지) |
| how to korean for digital nomads | 24 | 11.1 | 동일 페이지. 영어 버전(`/en/`)이 이 쿼리를 잡아야 함 |
| what kind of housing...tokyo | 6 | 9.2 | `/en/` 페이지 정상. Position 9 → title 최적화로 top 5 가능 |

### Locale Mismatch (가장 큰 구조적 문제)

**영어 쿼리 51건 중 ~67건의 노출이 `/vi/` 또는 `/zh-cn/` 페이지로 연결됨.** Google이 영어 쿼리에 대해 잘못된 locale을 서빙하고 있습니다.

원인 추정:
- `/vi/` locale 삭제 후 301 redirect 미설정 → Google 인덱스에 stale URL 잔존
- `/en/` 버전의 동일 콘텐츠가 canonical로 잡히지 않음
- hreflang이 있지만 `/vi/` 제거 후 업데이트 안 된 가능성

### New Content Candidates

| Query cluster | Signal | Action |
|---------------|--------|--------|
| Alipay/WeChat pay for foreigners | 68 impressions total | China는 scope 밖이지만 수요 존재. **결정 필요**: China payment 가이드를 `/en/` 에서 유지할지 삭제할지 |
| "f1d visa korea" / "south korea digital nomad visa f-1-d" | Position 1-4 | 이미 강한 페이지. 보강하면 첫 클릭 가능 |
| Tokyo housing for digital nomads | 7 impressions | 기존 포스트 있음. Title/meta 최적화 |

## 5. Existing Post Improvements

### `/vi/` 잔존 페이지 (긴급)
`china-alipay-wechat-pay-foreigner-setup-2026` — `/vi/` locale에서 68 impressions. Locale 삭제했는데 Google이 계속 서빙 중. 301 redirect 또는 GSC removal 필요.

### Locale 미스매치 페이지
- `korea-ultimate-digital-nomad-guide` → `/zh-cn/` 이 영어 쿼리에 노출. `/en/` 버전이 이 트래픽을 가져가야 함
- `china-ultimate-digital-nomad-guide` → `/zh-cn/` 동일 이슈

### 일본어 페이지 극저 순위
- `/ja/japan` — "デジタルノマドビザ" position 93, "ノマドビザ" position 71. 일본어 콘텐츠 품질/깊이 부족 시그널.

## 6. Action Items (이번 주)

1. **[긴급] `/vi/` 죽은 URL 처리** — `/vi/` → `/en/` 301 redirect 설정 (next.config.js redirects 또는 middleware). 현재 전체 노출의 ~47%가 삭제된 locale로 낭비 중.

2. **[긴급] hreflang + canonical 점검** — `/vi/` 제거 후 sitemap에서 `/vi/` URL 완전 삭제 확인. `/en/` 페이지가 해당 쿼리의 canonical이 되도록.

3. **[Quick Win] "korean tips for digital nomads" 최적화** — `/en/blog/guides/korea-ultimate-digital-nomad-guide` 의 title을 "Korea Digital Nomad Guide: Tips, Visa & Cost of Living (2026)" 류로. Position 5.6에서 이미 가까움. 27 impressions면 첫 클릭 발생 가능.

4. **[Quick Win] Japan housing 포스트 title 개선** — `/en/blog/guides/japan-housing-digital-nomads-2026` position 9.2. Title에 "Tokyo" 명시 + "2026" 강조.

5. **[결정 필요] China Alipay 콘텐츠 방향** — 68 impressions (전체 최대)이지만 China는 product scope 밖. 옵션:
   - **A**: `/en/` 에 영어 버전 유지, SEA 카테고리로 — 트래픽 캡처 but scope dilution
   - **B**: 301 → 홈 + GSC에서 제거 — 깔끔하지만 유일한 impression 소스 포기
   - **C**: 유지하되 투자 안 함 — 자연 감소 허용

---

**Where I'm least confident**: `/vi/` URL이 실제로 404를 반환하는지 아니면 아직 빌드에 남아있는지 확인이 필요합니다. 만약 Next.js가 여전히 `/vi/` 경로를 생성하고 있다면 redirect가 아니라 locale 설정 자체를 다시 봐야 합니다.
