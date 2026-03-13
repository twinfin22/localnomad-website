# Source Extraction Audit — marketing 3개 스킬

각 스킬의 모든 섹션을 줄 단위로 감사.
✅ = 플랜에 반영됨 | 🆕 = 추가 추출 가능 | ⛔ = 추출 안 함 (사유 포함)

---

## 1. marketing:content-creation SKILL.md

### Content Type Templates

| 항목 | 상태 | 사유 |
|------|------|------|
| Blog Post Structure (headline, intro 100-150w, 3-5 body sections, conclusion 75-100w, meta desc) | ✅ 반영 | STAGE 3-4에 통합 |
| Social Media Post Structure | ⛔ 미추출 | 블로그 전용 플러그인. 소셜미디어 범위 밖 |
| Email Newsletter Structure | ⛔ 미추출 | 블로그 전용 |
| Landing Page Structure | ⛔ 미추출 | 블로그 전용 |
| Press Release Structure | ⛔ 미추출 | 블로그 전용 |
| Case Study Structure | ⛔ 미추출 | 블로그 전용 |

### Writing Best Practices by Channel

| 항목 | 상태 | 사유 |
|------|------|------|
| Blog: 8th-grade reading level | 🆕 추가 가능 | 현재 미반영. 단, LibaD voice는 지적 텍스처가 높아서 "8th grade" 그대로 적용하면 충돌. → **"ESL-friendly readability" 로 변형**: 문장은 짧게 쓰되, 어휘 난이도는 context에서 자연스럽게. multi-language sprinkling이 이미 접근성 역할 |
| Blog: Short paragraphs (2-4 sentences) | ✅ 반영 | STAGE 4 writing best practices |
| Blog: Subheadings every 200-300 words | ✅ 반영 | SEO checklist #11 |
| Blog: Bullet points and numbered lists | 🆕 추가 가능 | 현재 미명시. LibaD voice는 "numbered mini-essays, not listicles"라서 충돌. → **제한적 사용 규칙 필요**: numbered lists OK (LibaD가 씀), bullet lists는 데이터/비교 항목에서만 허용, listicle 구조 자체는 금지 |
| Blog: ≥1 data point/example/quote per section | ✅ 반영 | STAGE 4 writing best practices |
| Blog: Active voice | ✅ 반영 | STAGE 4 |
| Blog: Front-load key info | ✅ 반영 | STAGE 4 |
| Social Media (LinkedIn, Twitter/X, Instagram, Facebook) | ⛔ 미추출 | 블로그 전용 |
| Email best practices | ⛔ 미추출 | 블로그 전용 |
| Web: "Lead with benefits, not features" | 🆕 추가 가능 | 비자 콘텐츠에 직접 적용 가능. "E-7 비자 요건은..." (feature) 대신 "한국에서 합법적으로 일하고 싶다면..." (benefit). → **blog-voice에 규칙 추가** |
| Web: "Use 'you' language" | ✅ 이미 반영 | LibaD voice가 second-person address 사용 |
| Web: "Every section should answer 'so what?'" | 🆕 추가 가능 | 좋은 원칙. → **quality-gate에 체크 항목 추가**: 각 섹션이 reader에게 "왜 이게 중요한지" 답하는지 |
| Web: "Minimize jargon unless audience expects it" | 🆕 추가 가능 | LibaD는 전문 용어를 쓰되 inline translation 제공. → **규칙화**: 전문 용어/외국어 첫 등장 시 반드시 괄호 번역 |

### SEO Fundamentals for Content

| 항목 | 상태 | 사유 |
|------|------|------|
| Keyword Strategy (primary 1, secondary 2-3) | ✅ 반영 | seo-engine STAGE 2 |
| Primary keyword placement (headline, first para, subheading, meta desc, slug) | ✅ 반영 | seo-engine STAGE 4 |
| "Do not keyword-stuff — write for humans first" | ✅ 반영 | "voice > SEO" 원칙 |
| On-Page SEO Checklist (title ≤60, meta ≤160, H1, H2/H3, alt, internal, external) | ✅ 반영 | seo-engine 12-item checklist |
| Content-SEO Integration: comprehensive coverage | ✅ 반영 | word count target |
| Content-SEO Integration: People Also Ask | ✅ 반영 | STAGE 2 question-based keywords |
| Content-SEO Integration: refresh high-performing content | ✅ 반영 | STAGE 1 content freshness scan |
| Content-SEO Integration: featured snippet structure | ✅ 반영 | STAGE 2 + checklist #12 |

### Headline and Hook Formulas

| 항목 | 상태 | 사유 |
|------|------|------|
| 7 Headline Formulas | ✅ 반영 | seo-engine references/headline-formulas.md |
| 6 Hook Formulas | ✅ 반영 | seo-engine STAGE 3 hook type 선택 |

### CTA Best Practices

| 항목 | 상태 | 사유 |
|------|------|------|
| CTA Principles (action verbs, specific, urgency, risk reduction) | ✅ 반영 | seo-engine references/cta-playbook.md |
| Blog CTA examples | ✅ 반영 | LocalNomad 패턴으로 구체화 |
| Landing/Email/Social/Case Study CTA | ⛔ 미추출 | 블로그 전용 |
| CTA Placement (end of post + inline) | ✅ 반영 | STAGE 4 |
| "One primary CTA per page" | 🆕 추가 가능 | 현재 미명시. → **1 primary CTA (글 끝) + 1-2 contextual inline** 으로 명확화 |

---

## 2. marketing:draft-content command

### Inputs

| 항목 | 상태 | 사유 |
|------|------|------|
| Content type (blog/social/email/landing/press/case study) | ✅ 반영 | 블로그로 하드코딩 |
| Topic | ✅ 반영 | `/blog [topic?]` 인자 |
| Target audience | ✅ 반영 | STAGE 1 input 수집 |
| Key messages 2-4개 | ✅ 반영 | STAGE 1 input 수집 |
| Tone | ✅ 반영 | blog-voice 스킬로 자동 적용 |
| Length (word count) | ✅ 반영 | 1200-2500 target |

### Brand Voice

| 항목 | 상태 | 사유 |
|------|------|------|
| Auto-apply if configured | ✅ 반영 | blog-voice 항상 적용 |
| Ask if not configured | ⛔ 미추출 | 항상 configured (LibaD voice 하드코딩) |
| Apply consistently throughout | ✅ 반영 | blog-voice 스킬 |

### Content Generation — Blog Post

| 항목 | 상태 | 사유 |
|------|------|------|
| Engaging headline (2-3 options) | ✅ 반영 | STAGE 3 |
| Introduction with hook | ✅ 반영 | STAGE 3 hook type + STAGE 4 |
| 3-5 organized sections with subheadings | ✅ 반영 | STAGE 3 outline |
| Supporting points/examples/data per section | ✅ 반영 | STAGE 4 |
| Conclusion with CTA | 🆕 충돌 해결 필요 | draft-content는 "Conclusion 75-100w + CTA"를 마지막으로 놓지만, jeffrey content-style은 "FAQ→CTA"가 마지막. → **통합 규칙**: Body → Actionable Steps → FAQ (if applicable) → Closing paragraph (75-100w, LibaD 톤) → CTA. FAQ가 없는 글은 Closing → CTA로 끝남 |
| SEO: suggest primary keyword + placement | ✅ 반영 | seo-engine |
| SEO: internal/external linking | ✅ 반영 | seo-engine |
| SEO: meta description | ✅ 반영 | seo-engine |
| SEO: image alt text opportunities | ✅ 반영 | STAGE 4 + cover-image 스킬 |

### Other Content Types

| 항목 | 상태 | 사유 |
|------|------|------|
| Social Media (platform-specific) | ⛔ 미추출 | 블로그 전용 |
| Email Newsletter | ⛔ 미추출 | 블로그 전용 |
| Landing Page Copy | ⛔ 미추출 | 블로그 전용 |
| Press Release | ⛔ 미추출 | 블로그 전용 |
| Case Study | ⛔ 미추출 | 블로그 전용 |

### Output

| 항목 | 상태 | 사유 |
|------|------|------|
| Clear formatting | ✅ 반영 | MDX output |
| Brief note on voice/tone applied | ✅ 반영 | CHECKPOINT 2에서 Quality Report에 포함 |
| SEO recommendations | ✅ 반영 | Quality Report Layer 2 |
| Suggestions for next steps | ✅ 반영 | CHECKPOINT 2 |
| "Would you like me to revise?" | ✅ 반영 | CHECKPOINT 2의 피드백 루프 |

---

## 3. marketing:seo-audit command

### Keyword Research

| 항목 | 상태 | 사유 |
|------|------|------|
| Primary keywords | ✅ 반영 | seo-engine |
| Secondary keywords | ✅ 반영 | seo-engine |
| Search volume signals (high/medium/low) | 🆕 추가 가능 | 현재 미반영. SEO 도구(Ahrefs/Semrush) 없이도 web search로 rough estimate 가능. → **STAGE 2에 추가**: "estimated search demand: high/medium/low based on web search results" |
| Keyword difficulty (easy/moderate/hard) | 🆕 추가 가능 | 동일. → **STAGE 2에 추가**: "estimated competition: easy/moderate/hard based on SERP analysis" |
| Long-tail opportunities | ✅ 반영 | seo-engine |
| Question-based keywords (People Also Ask) | ✅ 반영 | seo-engine |
| Intent classification | ✅ 반영 | seo-engine |

### On-Page SEO Audit

| 항목 | 상태 | 사유 |
|------|------|------|
| Title tags | ✅ 반영 | checklist #1 |
| Meta descriptions | ✅ 반영 | checklist #2 |
| H1 tags | ✅ 반영 | checklist #4 |
| H2/H3 structure | ✅ 반영 | checklist #5 |
| Keyword usage (first 100 words etc) | ✅ 반영 | checklist #6 |
| Internal linking | ✅ 반영 | checklist #8 |
| Image alt text | ✅ 반영 | checklist #7 |
| URL structure | ✅ 반영 | checklist #3 |

### Content Gap Analysis

| 항목 | 상태 | 사유 |
|------|------|------|
| Competitor topic coverage | 🆕 추가 가능 | 현재 미반영. SerpAPI/Ahrefs 없이도 web search로 경쟁사 블로그 스캔 가능. → **STAGE 1에 추가**: 주요 경쟁사(memory/context/project.md에 있음) 블로그 topic 스캔 → 우리가 안 다룬 주제 식별 |
| Content freshness (12+ months) | ✅ 반영 | STAGE 1 |
| Thin content (< 300 words) | ✅ 반영 | STAGE 1 |
| Missing content types | ✅ 반영 | STAGE 1 |
| Funnel gaps | ✅ 반영 | STAGE 1 |
| Topic clusters (pillar + supporting) | ✅ 반영 | STAGE 1 |

### Technical SEO Checklist

| 항목 | 상태 | 사유 |
|------|------|------|
| Page speed | ⛔ 미추출 | **사이트 인프라 영역**, 개별 블로그 포스트 작성과 무관. Next.js 빌드 최적화는 개발 태스크 |
| Mobile-friendliness | ⛔ 미추출 | 사이트 인프라. Next.js 반응형은 이미 구현됨 |
| Structured data (schema markup) | 🆕 부분 추가 가능 | Article/BlogPosting schema는 보통 Next.js 레이아웃 컴포넌트에서 처리. 개별 MDX에서 할 건 없지만, **frontmatter 데이터가 schema에 올바르게 매핑되는지 확인**은 가능. → 검증 체크리스트에 추가: "생성된 frontmatter가 기존 Article schema와 호환되는지 확인" |
| Crawlability (robots.txt, sitemap) | ⛔ 미추출 | 사이트 인프라. sitemap은 Next.js가 자동 생성 |
| Broken links | 🆕 추가 가능 | **STAGE 6 Quality Gate에 추가**: 삽입된 internal/external link가 실제로 200 응답을 반환하는지 확인. → Layer 2 SEO Audit에 "link validation" 항목 추가 |
| HTTPS | ⛔ 미추출 | 사이트 인프라 |
| Core Web Vitals | ⛔ 미추출 | 사이트 인프라 |
| Indexation | ⛔ 미추출 | 사이트 인프라. draft:false만 확인하면 됨 (이미 반영) |

### Competitor SEO Comparison

| 항목 | 상태 | 사유 |
|------|------|------|
| Keyword overlap | ⛔ 미추출 | **전략 분석 도구 영역**. 개별 포스트 작성 파이프라인에서 매번 실행하면 과도. 필요 시 별도로 `/marketing:seo-audit` 직접 실행 가능 |
| Keyword gaps | ⛔ 미추출 | 동일. 다만 competitor topic coverage는 STAGE 1에 반영 |
| Domain authority signals | ⛔ 미추출 | SEO 도구 필요 (Ahrefs/Semrush). 우리 스코프 밖 |
| Content depth (avg length, frequency) | ⛔ 미추출 | 전략 분석. 개별 포스트 파이프라인과 무관 |
| Backlink profile | ⛔ 미추출 | SEO 도구 필요 |
| SERP feature ownership | ⛔ 미추출 | SEO 도구 필요. 다만 featured snippet 최적화는 이미 반영 |
| Technical advantages | ⛔ 미추출 | 사이트 인프라 비교. 개별 포스트와 무관 |

### Output Format

| 항목 | 상태 | 사유 |
|------|------|------|
| Executive Summary | ⛔ 미추출 | 전체 사이트 감사 결과물 형식. 우리는 개별 포스트 QA Report |
| Keyword Opportunity Table | ⛔ 미추출 | 전략 분석 결과물. STAGE 2에서 keyword는 선정하지만 전체 사이트 키워드 테이블은 범위 밖 |
| On-Page Issues Table | ✅ 반영 | Quality Gate Layer 2 report |
| Content Gap Recommendations | ✅ 반영 | STAGE 1 topic 후보에 반영 |
| Technical SEO Checklist | ⛔ 미추출 | 사이트 인프라 |
| Competitor Comparison Summary | ⛔ 미추출 | 전략 분석 |
| Prioritized Action Plan (Quick Wins + Strategic) | 🆕 부분 차용 가능 | "Quick Wins vs Strategic" 이분법을 Quality Report에 차용: auto-fixable items = quick wins, manual review items = strategic. → 이미 Auto-fixable 열이 있으므로 실질적으로 반영됨 |

### Follow-up

| 항목 | 상태 | 사유 |
|------|------|------|
| "Draft content briefs for top keywords" | ✅ 반영 | STAGE 3이 brief 생성 |
| "Create optimized title tags and meta descriptions" | ✅ 반영 | STAGE 3-4에서 생성 |
| "Build content calendar based on gap analysis" | 🆕 추가 가능 | STAGE 7 Publish 후 "다음에 쓸 글" 추천 기능. → **STAGE 7에 추가**: content gap + topic cluster 기반으로 "Next suggested topic" 1-2개 제안 |
| "Dive deeper into any section" | ⛔ 미추출 | 전체 감사의 follow-up. 우리 워크플로우에선 CHECKPOINT 피드백이 이 역할 |
| "Run for different competitor" | ⛔ 미추출 | 전략 분석 도구의 follow-up |

---

## 요약: 추가 추출 항목 — 전체 반영 완료 (v6)

> 아래 13개 항목 모두 플러그인 파일에 구현 완료.
> #1은 conflict resolution R2에 따라 "ESL-friendly readability" 유지. (8th-grade strict 아님)

| # | Source | 항목 | 구현 위치 | 상태 |
|---|--------|------|----------|------|
| 1 | content-creation | **ESL-friendly readability** (short sentences + high vocab OK + parenthetical explanations) | blog-voice SKILL.md + quality-gate Layer 5 | ✅ |
| 2 | content-creation | Bullet/numbered list 사용 규칙 (limited, not listicle) | blog-voice SKILL.md + blog.md STAGE 4 R3 | ✅ |
| 3 | content-creation | "Lead with benefits, not features" | blog.md STAGE 4 writing rules | ✅ |
| 4 | content-creation | "Every section answers 'so what?'" | quality-gate SKILL.md Layer 5 | ✅ |
| 5 | content-creation | Jargon → first mention 괄호 번역 규칙 | blog-voice SKILL.md + quality-gate Layer 5 | ✅ |
| 6 | content-creation | "1 primary CTA + 1-2 contextual inline" 명확화 | seo-engine/references/cta-playbook.md | ✅ |
| 7 | draft-content | Conclusion↔FAQ↔CTA 순서 충돌 해결 → R1 통합 구조 | blog.md R1 구조 | ✅ |
| 8 | seo-audit | Search volume signals (high/medium/low) | seo-engine SKILL.md + blog.md STAGE 2 | ✅ |
| 9 | seo-audit | Keyword difficulty (easy/moderate/hard) | seo-engine SKILL.md + blog.md STAGE 2 | ✅ |
| 10 | seo-audit | Competitor topic coverage scan | blog.md STAGE 1 | ✅ |
| 11 | seo-audit | Structured data (frontmatter↔schema 호환 확인) | quality-gate SKILL.md Layer 5 | ✅ |
| 12 | seo-audit | Link validation (inserted links → 200 OK?) | seo-engine/references/seo-checklist.md | ✅ |
| 13 | seo-audit | "Next suggested topic" post-publish | blog.md STAGE 7 | ✅ |
