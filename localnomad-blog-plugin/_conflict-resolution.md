# Source Conflict Resolution — 전체 점검

## 발견된 충돌 8개

---

### CONFLICT 1: 글 구조 — 3개 소스가 각각 다른 구조 제안

| Source | 제안 구조 |
|--------|----------|
| content-creation | Headline → Intro (100-150w) → Body (3-5 H2 sections) → Conclusion (75-100w) → Meta desc |
| draft-content | Headline (2-3 options) → Intro with hook → 3-5 sections → Conclusion with CTA |
| jeffrey content-style | Hook → TL;DR → Body → Actionable Steps → FAQ → CTA |

**충돌 포인트**:
- content-creation/draft-content는 **Conclusion** 으로 끝남
- jeffrey는 **FAQ → CTA** 로 끝남 (Conclusion 없음)
- TL;DR 단락은 content-creation/draft-content에 없음

**해결**:
```
Hook (personal anecdote, LibaD default)
  ↓
TL;DR (1-2문장 요약 — jeffrey. SEO에도 유리: 첫 100단어에 keyword 넣는 자연스러운 방법)
  ↓
Body Sections (3-5 H2, 200-300w 간격 — content-creation + jeffrey)
  ↓
Actionable Steps (해당될 때만 — jeffrey. 비자 가이드 = 항상, 뉴스/스토리 = 생략)
  ↓
FAQ (2-3개, People Also Ask 기반 — jeffrey + seo-audit. SEO snippet 기회)
  ↓
Closing (75-100w, LibaD 톤 — content-creation. "결론" 이라기보다 개인적 마무리 소감)
  ↓
CTA (1 primary — content-creation + jeffrey)
```
- TL;DR: jeffrey에서 채택. LibaD도 글 초반에 핵심 문장을 던지는 습관 있음
- Conclusion + CTA: content-creation의 Conclusion을 "Closing paragraph"로 변형 (LibaD 톤: 개인 소감 + call to community) → 그 뒤에 CTA
- Actionable Steps: content type에 따라 조건부 (guides/tips = 포함, stories/news = 생략)
- FAQ: SEO 관점에서 항상 포함 (featured snippet 기회)

---

### CONFLICT 2: Readability Level

| Source | 제안 |
|--------|------|
| content-creation | "8th-grade reading level for broad audiences" |
| LibaD voice | 지적 텍스처 높음: Antonio Gramsci 인용, nusantara 어원, Layer-2 nation 개념 |

**충돌 포인트**: 8th grade = Flesch-Kincaid ~60-70. LibaD의 실제 글은 아마 ~50 수준.

**해결**:
"ESL-friendly readability" 로 재정의:
- **문장 길이**는 짧게 유지 (8th grade 원칙 준수) — LibaD가 이미 이렇게 씀
- **어휘 난이도**는 높아도 됨, 단 첫 등장 시 반드시 괄호 설명 — LibaD가 이미 이렇게 씀
- **개념 복잡도**는 제한 없음. 대신 비유/메타포로 접근성 확보
- **타겟 독자**: 영어가 모국어가 아닌 한국/일본/대만 거주 노마드 → 문장은 simple, 내용은 rich

---

### CONFLICT 3: Lists/Bullets 사용

| Source | 제안 |
|--------|------|
| content-creation | "Use bullet points and numbered lists to break up text" |
| LibaD voice | "Numbered mini-essays, not listicles" |

**충돌 포인트**: content-creation은 적극 사용 권장, LibaD는 리스티클 구조 반대

**해결**:
- **Numbered sections** (1, 2, 3...): OK — LibaD가 실제로 사용 (도시별 섹션 등)
- **Bullet lists**: 비교 데이터, 체크리스트, 요건 나열에서만 허용. 각 bullet은 최소 1-2문장
- **절대 금지**: 전체 글이 리스티클 구조 ("7 Things You Need to Know About..."), 한 줄짜리 bullet point 나열

---

### CONFLICT 4: Featured Snippet 구조 vs "데이터는 single punch"

| Source | 제안 |
|--------|------|
| seo-audit + content-creation | "Structure for featured snippets: definition paragraphs, numbered lists, tables" |
| LibaD voice | "Data as single punches, never tables" |

**충돌 포인트**: SEO는 table/list 구조 권장, LibaD는 table 반대

**해결**:
- **Definition paragraphs**: ✅ 허용 — LibaD 스타일과 호환. FAQ 섹션에서 자연스럽게 구현
- **Numbered lists**: ✅ 허용 — Conflict 3 규칙 준수 (mini-essay 스타일)
- **Tables**: ⚠️ 제한적 허용 — 비자 요건 비교 같은 팩트 기반 데이터에서만. 분석/의견을 table로 만들지 않음
- 우선순위: Voice > SEO. snippet을 노리되 LibaD 톤을 깨지 않는 범위에서만

---

### CONFLICT 5: Headline 톤

| Source | 제안 |
|--------|------|
| content-creation | 7 formulas (corporate 톤: "The Complete Guide to...", "7 Proven Ways to...") |
| LibaD voice | Personal, non-corporate ("I Spent 47 Days on My E-7. Here's What Nobody Tells You.") |

**충돌 포인트**: 공식 자체는 유용하지만 예시 톤이 corporate

**해결**:
- 7 formulas의 **구조**만 차용, **톤**은 LibaD로 변환
- 변환 규칙:
  - "The Complete Guide to X" → "Everything I Learned About X (The Hard Way)"
  - "7 Proven Ways to X" → "7 Things Nobody Told Me About X"
  - "How to X Without Y" → "I X'd Without Y. Here's How."
  - "Why X Is Wrong" → "X Is a Lie. Here's What's Actually Happening."
  - 항상 1인칭 경험 또는 질문형으로 변환
- Headline 옵션 3개 중 최소 1개는 **question-based** (LibaD가 자주 씀)

---

### CONFLICT 6: Word Count Target

| Source | 제안 |
|--------|------|
| jeffrey content-style | 1200-1300 words |
| content-creation | 명시 안 함 (3-5 sections → 대략 1500-2500 암시) |
| 현재 플랜 | 1200-2500 (target 1500) |

**충돌 포인트**: jeffrey는 1300 max, 실제 블로그 니즈는 더 길 수 있음

**해결**:
- jeffrey의 1200-1300은 그 프로젝트의 타겟. LocalNomad 비자 가이드는 더 길 수 있음
- **Content type별 타겟**:
  - guides (비자 가이드): 1500-2500w (깊이 필요)
  - comparisons: 1200-1800w
  - tips: 800-1200w (짧고 실용적)
  - stories: 1000-1500w
  - news/updates: 600-1000w
- Quality gate에서 category별로 다른 기준 적용

---

### CONFLICT 7: SEO Keyword Density vs Voice

| Source | 제안 |
|--------|------|
| content-creation | Primary keyword in: headline, first para, 1 subheading, meta desc, slug |
| seo-audit | Comprehensive keyword placement analysis |
| LibaD voice | "Not SEO-first. Voice > SEO." |

**충돌 포인트**: SEO 규칙 따르면 키워드가 부자연스럽게 반복될 수 있음

**해결**:
- **Hard rules** (반드시): headline에 primary keyword, meta desc에 primary keyword, slug에 primary keyword
- **Soft rules** (자연스러우면): first 100 words에 primary keyword, 1개 subheading에 secondary keyword
- **금지**: 같은 키워드 3번 이상 반복, 키워드를 위해 문장 구조 왜곡
- Voice와 SEO가 충돌하면 항상 voice 우선. Quality gate에서 "keyword present but forced" 감지 → 경고

---

### CONFLICT 8: CTA 스타일

| Source | 제안 |
|--------|------|
| content-creation | "Use action verbs: Get, Start, Download, Join, Try, See" / "Create urgency" |
| LibaD voice | "Let's swim together, enchovy school 🐟🐟🐟" / community-oriented, never salesy |

**충돌 포인트**: marketing CTA는 conversion-focused, LibaD는 community-focused

**해결**:
- **Primary CTA** (글 끝): community 톤 유지
  - ❌ "Subscribe now for weekly visa updates!"
  - ✅ "비자 미로에서 같이 헤엄치자 → [newsletter 구독]" 또는 "더 궁금하면 → [관련 가이드 링크]"
- **Inline CTA** (본문 중): contextual link, 자연스러운 문맥
  - ❌ "Click here to compare visas"
  - ✅ "E-7과 D-8 중 고민이라면 [비교 페이지]에서 나란히 볼 수 있다"
- content-creation의 CTA 원칙 중 채택할 것: "specific about what happens next", "reduce risk"
- 채택 안 할 것: "create urgency", conversion-focused verbs
