# Scout Audit: Competitive Strategy
> Mission: Map the battlefield, find the moat, identify the winning move

## Executive Summary

LocalNomad currently occupies a **defensible but narrow** position in the Korean visa services market. It is the only product attempting to build **interactive visa management tools** (dashboard, checklist, quiz, path simulator, health score) rather than just static information pages. Every competitor -- Kowork, Famigo, HiKorea, agencies, and community groups -- provides information at varying quality levels, but **none** offer a structured, stateful, tool-first experience. LocalNomad's codebase confirms real implementations of features that competitors lack entirely (visa state machine, health score calculator, visa path engine). However, the features are at early-MVP maturity with hardcoded data, no backend persistence beyond Supabase scaffolding, and incomplete i18n. The **window of opportunity is time-limited**: Kowork already has visa eligibility tests and expiry alerts, and could add dashboard features. Speed to market with the P0 tools is the decisive factor.

---

## Competitive Landscape Matrix

| Feature / Capability | LocalNomad | Kowork | HiKorea | Agencies (행정사) | FB/Kakao/Discord Groups | Immigration Lawyers |
|---|---|---|---|---|---|---|
| **Visa Information DB** | Strong: 12 types, structured JSON, 3 languages (en/ja/zh-tw), full guides for 6 types | Partial: Visa center with basic info per type | Partial: PDF manuals, 300+ pages, not searchable | Partial: Oral/phone consultation only | Partial: Scattered across threads | Strong: Deep expertise but siloed per case |
| **Visa Eligibility Quiz** | Strong: Multi-step quiz with scoring engine (`quiz-engine.ts`), goal-based matching, conditional questions | Partial: Points-based eligibility test | Missing | Missing | Missing | Missing |
| **Visa Path Simulator** | Strong: Path visualization (F-1-D > E-7 > F-2 chains), `pathsTo`/`pathsFrom` in data model | Missing | Missing | Missing | Missing | Partial: Verbal advice per case |
| **Document Checklist** | Strong: Dynamic checklist per visa type, tips, difficulty ratings, Korean names, common mistakes | Partial: Static document list | Missing: PDF only | Strong: They prepare docs for you | Missing | Strong: They handle docs |
| **Visa Status Dashboard** | Strong: State machine (8 states), health score, D-Day counter, Supabase integration | Missing | Partial: "접수중/심사중" text status only | Missing | Missing | Missing |
| **Health Score (0-100)** | Strong: 4-factor weighted calculation (`health-score.ts`) | Missing | Missing | Missing | Missing | Missing |
| **Expiry/D-Day Alerts** | Strong: DDayPanel component, urgency levels, timeline tracking | Partial: Basic expiry reminders | Missing | Missing | Missing | Missing |
| **Visa Comparison Tool** | Strong: Side-by-side comparison of any visa types (`VisaComparisonTool.tsx`) | Missing | Missing | Missing | Missing | Missing |
| **Community Tips** | Partial: `communityTips` type defined, not yet populated in data files | Partial: Community forum | Missing | Missing | Strong: This is their core | Missing |
| **Multi-language** | Partial: en/ja/zh-tw scaffolded, visa data translated for all 3 | Partial: en/ko | Partial: ko with some en | Missing: ko only | Partial: en in expat groups | Missing: ko mostly |
| **Job Listings + Sponsor Tag** | Missing | Strong: Jobs with E-7 sponsor filter | Missing | Missing | Partial: Shared ad-hoc | Missing |
| **Mobile App** | Missing (web only) | Partial: iOS/Android (buggy per reviews) | Missing | Missing | Strong: Native app experiences | Missing |
| **B2B (Employer Tools)** | Missing (B2B landing page exists at `/business`) | Partial: Employer job posting | Missing | Strong: Agency services for employers | Missing | Strong: Corporate counsel |
| **Neighborhood/Area Guide** | Strong: Seoul map with GeoJSON, interactive neighborhood explorer | Missing | Missing | Missing | Partial: Anecdotal recs | Missing |
| **Auth/User Accounts** | Strong: Supabase auth, Google OAuth, email/password | Partial | Partial: ARC-based | Missing | Missing | Missing |
| **Price** | Free | Free | Free | $300-$500+ per case | Free | $500-$2,000+ per case |

---

## Competitor Deep Dives

### Kowork -- The Direct Threat

- **What they offer** (from research): "비자부터 취업까지 한 번에" (Visa to employment, all at once). Job board with E-7 sponsor filter, visa eligibility test (points-based), visa center with per-type info, application form generator, expiry reminder, community forum, iOS/Android app.
- **Their strengths**:
  - Already has **two-sided marketplace** (job seekers + employers)
  - E-7 sponsor tag on job listings -- a feature research identifies as high-demand ("Are Lunit sponsoring?" requires DM)
  - Visa eligibility test already exists
  - Expiry alert already exists
  - App already shipped (iOS/Android)
- **Their weaknesses** (from research):
  - App quality is poor: "white screen", "crash", "resume bug" complaints in App Store
  - No visa path visualization (A > B > C transitions)
  - Dashboard experience is weak -- visa is a side feature, jobs are core
  - Not specialized for IT/tech segment: manufacturing/service industry focus
  - Resume feature has UX bugs: "No Visa option missing", "graduation date mandatory"
  - Design is functional but emotionally flat
- **User sentiment**: "Kowork이 진짜 위협 -- 속도가 핵심" (Kowork is the real threat -- speed is key)
- **Threat level**: **8/10** -- They have the most overlap and could add dashboard features rapidly given their existing visa infrastructure.
- **Counter-strategy**:
  1. **Win on depth, not breadth**: Kowork treats visa as a supporting feature for jobs. LocalNomad treats visa as the core product. Go deeper on visa management tools (dashboard, health score, path simulator) where Kowork has 0 implementation.
  2. **Win on segment**: Target E-7 IT developers and digital nomads specifically. Kowork targets all foreign workers including manufacturing. LocalNomad should own the Dev Korea + CodeSeoul community (1,000+ English-speaking developers).
  3. **Win on speed**: Research recommends compressing MVP from 12 to 8 weeks. Kowork adding dashboard features is a matter of time.
  4. **Win on UX/emotion**: Research identifies "peace of mind" as the #1 user need. LocalNomad's "Calm Control" design philosophy (health score, reassuring states) is a genuine differentiator.

### Famigo -- The Generalist

- **What they offer** (from research): Shopping mall (food/household goods), Visa & Law section (blog-style info, agency connection forms), JobFinder, beauty panel campaigns, Famigo Walk app (walking = points = snacks). 8 languages including Vietnamese, Nepali, Mongolian.
- **Their strengths**:
  - 8-language support (Vietnamese, Nepali, etc.) targeting E-9/blue-collar workers
  - Physical touchpoints (beauty panels, consumer tests)
  - Agency connection (visa application proxy)
  - Daily engagement via walking app
- **Their weaknesses**:
  - Visa info is blog-format, not interactive
  - No visa management dashboard, no checklist, no path simulator
  - Built on imweb.me site builder -- old-school UX
  - E-7 tech segment is weak
  - "Jack of all trades, master of none" -- visa is a lead-gen channel, not the product
- **User sentiment**: Mentioned once in CodeSeoul Discord: "Foreigners in Korea! Solve your visa and job issues with a cup of coffee!" -- promotional tone, not organic endorsement.
- **Threat level**: **3/10** -- Different target segment (E-9/blue-collar vs E-7/IT), different product philosophy (marketplace vs tool). Not a direct competitor.
- **Counter-strategy**: "Win on depth." Famigo = 1cm depth x 100cm width. LocalNomad = 100cm depth x 1cm width. No need to compete directly. But benchmark their 8-language coverage for future i18n expansion.

### HiKorea (immigration.go.kr) -- The Government Portal

- **What they offer**: Official e-government portal for all foreign residents. Visa application submission, appointment booking, status tracking ("접수중/심사중"), electronic document submission.
- **Their strengths**:
  - **Official authority**: Only platform with actual visa processing power
  - **Data**: Has real-time visa status data that no competitor can replicate
  - Free
- **Their weaknesses** (from research):
  - ActiveX/security module requirements: Mac/Chrome users can't access features
  - 1MB file upload limit -- users must compress passport scans
  - "Chicken-and-egg" auth problem: Need ARC to register, need registration to get ARC
  - PDF manuals (300+ pages) as the only info source
  - Appointment slots booked 2-4 weeks out in Seoul
  - Name encoding issues: non-English characters cause file errors
  - Appointment system doesn't sync with user data in real-time
- **User sentiment**: "HiKorea checks if you have Adobe PDF Viewer installed to save the file. (WTF?)". "complete incompetence and wrong" regarding 1345 hotline.
- **Threat level**: **2/10** as a competitor. **10/10** as the ecosystem constraint. HiKorea's UX pain IS LocalNomad's opportunity.
- **Counter-strategy**: Don't compete with HiKorea. **Wrap HiKorea**. Build the modern middleware layer that makes HiKorea bearable. The research explicitly calls this out: "HiKorea 래핑의 가치가 기술적으로도 확인됨."

### Facebook/Kakao/Discord Groups -- Community Knowledge

- **What they offer**: Real-time peer advice. Discord: Dev Korea (576+ members, 242 visa threads), CodeSeoul (500+, 59 threads), DNK (3,997+ messages in visa channel alone). Facebook: Korea expat groups. Kakao: Korean-language groups.
- **Their strengths**:
  - **Most current information**: Users share live experiences ("I just got approved with X strategy")
  - **Power users** as trusted sources: Georg K. (renewal expert), FedeCr (freelancer-to-company transition), emily (US sole proprietor success story)
  - **Emotional support**: "peace of mind" from hearing others succeeded
  - Free, accessible, high engagement
- **Their weaknesses**:
  - Not searchable: Knowledge buried in thousands of messages
  - Not verified: "YMMV" is the constant refrain
  - Not structured: Same questions asked repeatedly
  - Information decays: Old advice may be outdated
  - No personalization: "Is this advice relevant to MY situation?"
- **Threat level**: **4/10** as a competitor but **10/10** as a validation source. These communities prove the demand.
- **Counter-strategy**: **Structure their knowledge**. The `communityTips` type in LocalNomad's data model (`types.ts`) is designed exactly for this. Crowdsource verified tips from Discord/Reddit power users and give them structured, searchable form. Partner with community admins (Ophelie S at DNK, Dev Korea mods) for beta distribution.

### Immigration Lawyers/Agencies (행정사)

- **What they offer**: End-to-end visa handling. Document preparation, application submission, consulate liaison, legal representation.
- **Their strengths**:
  - **Accuracy**: "Visa agencies though never get it wrong in my experience"
  - **Full service**: Handle everything the user can't
  - **Legal standing**: Licensed to handle immigration matters (행정사법)
- **Their weaknesses**:
  - **Cost**: $300-$500+ for basic services, $500-$2,000+ for complex cases
  - **Price opacity**: "honestly no idea what current rates are"
  - **No self-service**: Even simple renewals require paying an agency
  - **DN/tech gap**: Most agencies are not specialized in F-1-D digital nomad cases
- **Threat level**: **2/10** -- They complement LocalNomad, not compete with it.
- **Counter-strategy**: Build the "triage" system: "이 케이스는 셀프로 가능합니다 / 이 케이스는 전문가를 추천합니다" (This case you can self-serve / This case needs an expert). Route simple cases to self-service tools and complex cases to a curated agency directory. This is P2.

---

## Moat Assessment

| Moat Type | Current State | Buildable? | Effort | Impact |
|---|---|---|---|---|
| **Data Moat** | Weak. 12 visa types with structured JSON data in 3 languages, but all sourced from public information. GeoJSON for Seoul neighborhoods. No proprietary user data yet. | Yes -- via crowdsourced community data (embassy-specific rules, approval timelines) and user progress data from dashboard | M | 9/10 -- Embassy-specific data ("스페인 대사관은 자영업자 불가" vs "미국에서는 sole proprietor 가능") is the #1 gap in the market |
| **Network Effect** | None. Product does not get better with more users currently. | Yes -- via community intelligence layer: "이번 주 서울남부출입국사무소 F-2-7 변경, 평균 12일 소요됨" crowdsourced approval data | L | 10/10 -- This would be an unassailable moat. If LocalNomad has 1,000+ users reporting approval timelines, no competitor can replicate that dataset |
| **Switching Cost** | Low. Users can abandon LocalNomad at any time. | Yes -- via dashboard state persistence. Once a user's checklist progress, target dates, and document status are stored in LocalNomad, switching to Kowork means losing that state. Supabase integration is already scaffolded. | S | 7/10 |
| **Brand Moat** | None. LocalNomad is not yet known in the target communities. | Yes -- via community partnerships (Dev Korea, CodeSeoul, DNK Discord) and content SEO. The brand "LocalNomad" is memorable and well-suited to the target audience. | M | 6/10 |
| **Technical Moat** | Moderate. The visa state machine, health score engine, quiz engine, and path simulator represent meaningful technical implementation that competitors don't have. Coded in `lib/visa/stateMachine.ts`, `lib/visa/health-score.ts`, `lib/visa/quiz-engine.ts`. | Already exists -- keep iterating. The "Calm Control" dashboard pattern (3-layer info architecture) is a genuine UX innovation in this space. | Already built | 7/10 -- But technical features are replicable. The moat is in execution speed. |
| **Content Moat** | Moderate. 12 visa types with detailed requirements, documents, tips, FAQs, official links. Data translated to 3 languages. Structured as JSON, not blog posts -- harder to scrape meaningfully. | Yes -- via community tips integration, embassy-specific nuances, approval probability signals. The `communityTips`, `gniBasedIncome`, `fixedIncomeRequirement`, and `renewal` fields in the type system show this was planned. | M | 8/10 |

---

## LocalNomad's Current Assets

### Structured Visa Data (Unique Asset)
- **12 visa type JSON files** in `data/visas/en/` (e-7, d-2, d-10, h-1, f-1-d, f-2, e-2, d-7, d-8, f-6, f-4, d-4)
- **3 language versions**: English, Japanese, Traditional Chinese (`data/visas/ja/`, `data/visas/zh-tw/`)
- **6 full guides** (e-7, d-2, d-10, h-1, f-1-d, f-2) with complete eligibility, documents, steps, FAQs
- **6 stub pages** (e-2, d-7, d-8, f-6, f-4, d-4) with basic info, marked `isStub: true`
- Data model includes fields no competitor has: `communityTips`, `gniBasedIncome`, `pathsTo`/`pathsFrom`, `eligibilityQuestions`, `renewal` info

### Quiz Engine (`lib/visa/quiz-engine.ts`)
- Scoring configuration for 6 visa types with goal multipliers, income thresholds, age ranges, education/Korean bonuses
- Working Holiday agreement country validation
- Multi-step quiz with conditional questions based on goal
- Path generation for long-term planning (F-1-D > E-7 > F-2)

### State Machine (`lib/visa/stateMachine.ts`)
- 8 lifecycle states: NO_VISA > PREPARING > SUBMITTED > UNDER_REVIEW > APPROVED > ACTIVE > EXPIRING > EXPIRED
- Valid transition rules, progress percentage, urgency levels
- localStorage persistence with Supabase backend scaffolded

### Health Score (`lib/visa/health-score.ts`)
- 4-factor weighted score: documents (50%), timeline (25%), insurance (15%), state (10%)
- 5-tier interpretation: Excellent/Good/Needs Work/Getting Started/Not Started
- This is a **unique innovation** -- no competitor has anything equivalent

### Dashboard (`components/visa/dashboard/`)
- Full "Calm Control" pattern: HealthScoreCard + DDayPanel + NextActionCard
- Supabase integration for `visa_progress` and `checklist_items` tables
- Auth flow: Google OAuth + email/password

### GeoJSON Data (`public/data/seoul-boundary.geojson`)
- Seoul boundary polygon for interactive neighborhood map
- Renders via Mapbox GL in `SeoulNeighborhoodMap.tsx`

### i18n Architecture (`lib/i18n/config.ts`)
- 3 locales (en, ja, zh-tw), 2 countries (korea, taiwan)
- Per-country locale availability
- URL routing: `/[lang]/[country]/visa/...`
- **Missing**: Vietnamese (vi) -- critical for primary E-7 target segment per research

---

## Strategic Opportunity Ranking

| Rank | Opportunity | Effort (S/M/L) | Impact (1-10) | Competitive Advantage | Research Support |
|---|---|---|---|---|---|
| 1 | **Visa Path Simulator (visual)** -- Interactive A > B > C path visualization with requirements at each step | S (engine exists in `quiz-engine.ts`, needs UI polish) | 10 | 0 competitors have this | "Visa Path Simulator = 킬러 기능 확정". "가능한 모든 경로를 시각화" |
| 2 | **Embassy-specific data layer** -- Which embassy accepts freelancers, gross vs net income rules per consulate | M (data collection needed, schema ready in types.ts) | 10 | 0 competitors have this | "대사관별 요구사항 차이를 체계적으로 정리한 도구/데이터베이스가 없음" |
| 3 | **Complete the Dashboard** -- Production-ready health score + D-Day + document tracking with real persistence | M (components exist, need testing + production hardening) | 9 | 0 competitors have a visa dashboard | "비자 상태 대시보드 = 0개사 보유 = 최대 차별점" |
| 4 | **Vietnamese language support** -- Add vi locale for the #1 target E-7 segment | M (framework exists, need translations for all 12 visa JSONs + UI) | 9 | Famigo has Vietnamese but shallow; Kowork does not | Vietnamese E-7 workers are the largest foreign worker segment in Korea |
| 5 | **Community Intelligence integration** -- Populate `communityTips` from Discord/Reddit research, show verified tips on visa pages | S (type exists, need data entry + UI component) | 8 | No competitor has structured community tips | "비공식 지식을 구조화하고 자동화하는 도구가 가장 큰 기회" |
| 6 | **Income Calculator / GNI Tracker** -- Real-time GNI threshold display with currency conversion, gross vs net simulator | M (GNI types exist in schema, need data + UI) | 8 | 0 competitors have this | "소득 증빙 자동 번역기" is listed as dashboard killer feature |
| 7 | **HiKorea Appointment Alert** -- Monitor for cancellation slots, send push/email alerts | L (needs backend scraping infrastructure, legal review) | 8 | 0 competitors have this | "하이코리아 스나이퍼" listed as proposed feature |
| 8 | **Visa Sponsor Company Directory** -- Crowdsourced list of companies that sponsor E-7 visas | M (needs data collection strategy, schema design) | 7 | Kowork has E-7 sponsor filter on jobs; LocalNomad could have a dedicated directory | "비자 스폰서 가능 기업 리스트 (크라우드소싱)" |
| 9 | **Document template generator** -- Auto-generate income summary sheets, activity plans, employment letters | L (needs document generation pipeline, PDF export) | 7 | 0 competitors have this | "소득 요약표(Income Summary Sheet) 작성" strategy shared in communities |
| 10 | **Tax Residency Tracker** -- 183-day counter with tax implications per nationality | M (needs per-country tax treaty data, UI) | 6 | 0 competitors have this | "세금 시뮬레이터/가이드" is Gap #3 in market analysis |

---

## The Wedge

**The Visa Path Simulator is LocalNomad's wedge feature.**

### Why this feature, above all others:

1. **It solves the #2 pain point** across ALL research communities: "비자 전환 경로 미로" (Visa transition path maze). Cross-validated in Dev Korea (242 threads), CodeSeoul (59 threads), and DNK (3,997+ messages). Users ask "D-4에서 디지털노마드 비자로 전환 가능?" and get YMMV answers. A visual path simulator gives them a definitive answer.

2. **Zero competitors have it**: The research competitive matrix shows 0/3 competitors (Famigo, Kowork, Jobploy) offer visa path visualization. This is the **only P0 feature where LocalNomad has ZERO competitive overlap**.

3. **The technical foundation already exists**: `quiz-engine.ts` already defines visa paths (F-1-D > E-7 > F-2, D-2 > D-10 > E-7, etc.), and the data model has `pathsTo`/`pathsFrom` fields in every visa JSON. The `VisaPathMap.tsx` component exists in the quiz results. This is S-effort to elevate into a standalone feature.

4. **It creates the strongest switching cost**: Once a user maps their personal path (nationality + current visa + goal > optimal route), they've invested mental energy in LocalNomad's recommendation. They'll return to track progress along that path.

5. **It naturally feeds the dashboard**: Path selection > Document checklist > Status tracking > Health score. The path simulator IS the onboarding funnel for the dashboard.

6. **Research explicitly calls it the killer feature**: "Visa Path Simulator (킬러 기능 확정)", "비자 전환 시뮬레이터 = 0개사 보유 = 킬러 기능".

### How to make it unassailable:

- Add **nationality-specific** path variations (Vietnamese E-7 path differs from American F-1-D path)
- Add **embassy-specific** data overlays (which embassies are more lenient for each transition)
- Add **crowdsourced success rates** per path ("87% of D-2 > D-10 transitions in 2025 were approved within 30 days")
- Make it **shareable** (unique URL per path configuration) so users share it in Discord/Reddit

---

## Feature Priority Matrix

```
                    HIGH IMPACT
                        |
   Embassy Data [2]     |     Visa Path Sim [1]
   Vietnamese i18n [4]  |     Dashboard [3]
   Community Tips [5]   |     Income Calc [6]
                        |
LOW EFFORT ------------|------------ HIGH EFFORT
                        |
   Tax Tracker [10]     |     HiKorea Alerts [7]
   Sponsor Dir [8]      |     Doc Generator [9]
                        |
                    LOW IMPACT
```

**Competitive urgency tiebreaker**: Features where Kowork could add equivalent functionality (eligibility quiz improvements, expiry alerts) should be shipped BEFORE features Kowork is unlikely to build (path simulator, health score, embassy data).

---

## Legal Constraints on Competitive Strategy

> Cross-referenced with Counsel's detailed legal line-drawing. These constraints reshape the competitive playbook.

### Feature Legal Compliance Matrix (Counsel-Verified)

| Feature | Legal Zone | Safe Implementation | Competitive Value | Notes |
|---|---|---|---|---|
| **Visa Path Simulator** | GREEN | Pure visualization with disclaimers | HIGH — confirmed killer feature | No legal risk. Ship first. |
| **Verified Requirements DB** | GREEN | Information provision with sources | HIGH — solves YMMV | Cite official sources, add last-verified dates |
| **HiKorea Appointment Notifier** | YELLOW | Notification-only (no login, no credential storage, no booking) | HIGH — 0 competitors | Monitor public-facing slot data only. Never interact with authenticated HiKorea pages. Civil ToS risk but not criminal. |
| **Income Translator** | YELLOW-GREEN | Template + guide model (user fills in own numbers) | HIGH — unique for F-1-D | Provide blank Income Summary Sheet template + field-by-field guide. Do NOT auto-reformat uploaded documents. |
| **AI Itinerary Helper** | YELLOW | Frame as "travel planning" not "visa strategy" | MEDIUM — niche to H-1 | Never say "this will help your visa." Say "explore Korea beyond Seoul." Visa connection implicit, not explicit. |
| **행정사 Directory** | YELLOW | Static listing + flat advertising fees | MEDIUM — 로톡 precedent | Start with phone-book model (name/phone/address). No "Request a Quote" buttons, matching algorithms, or rating systems initially. Revenue = flat monthly ad fees, NOT per-transaction. |
| **Eligibility Quiz** | GREEN (current) | Scoring with match levels (strong/moderate/possible), NOT yes/no | HIGH — safer than Kowork's approach | Current `quiz-engine.ts` uses degree-of-match language. Maintain this. Kowork's definitive yes/no is 변호사법 exposed. |
| **Application Form Generator** | RED | **No safe version exists** | N/A — don't build | Auto-filling = 행정사 work ("서류의 작성"). No distinction between typing for user and pre-filling fields. |
| **HiKorea Account Integration** | RED | **No safe version exists** | N/A — don't build | Storing credentials = PIPA liability. Submitting on behalf = 출입국관리법 Article 79-2 violation. |
| **Personalized Legal Consultation** | RED | N/A | N/A — don't build | Case-specific "what should I do?" advice for pay = 변호사법 Article 109 violation. |

### Safe Alternative Implementations (Counsel-Specified)

**For document-related features:**
- GREEN: Provide blank government form PDFs + guide ("Field 3 asks for [X]. Here's what immigration expects")
- GREEN: Downloadable blank templates (Excel/PDF) with example numbers and field explanations
- RED: Auto-filling forms, reformatting uploaded documents, generating personalized documents

**For 행정사 connection features:**
- GREEN: Static directory (name, phone, address — phone book model)
- YELLOW-GREEN: Directory with flat monthly advertising fees
- YELLOW-RED: Directory with reviews + ratings + "Contact" button (creates intermediation impression)
- RED: Active marketplace with per-lead/per-transaction fees (K-Visa precedent)

**For HiKorea appointment features:**
- GREEN: Display general wait time information ("Seoul Immigration typically has 2-4 week waits")
- YELLOW: Monitor public-facing slot availability, send alerts to users
- RED: Store user credentials, book on user's behalf, interact with authenticated pages

### Strategic Implication — Legal Constraints as Competitive MOAT

**Critical insight from Counsel**: LocalNomad's legal constraints are a competitive MOAT, not a limitation.

1. **Features that are legally safe** (path simulator, verified DB, templates) are also the hardest for competitors to replicate at quality
2. **Features that are legally risky** (form generation, HiKorea scraping, personalized advice) are exactly the ones that will get competitors attacked by 행정사회
3. **Kowork is legally exposed** on their application form generator AND their definitive yes/no eligibility test. If 대한행정사회 shifts attention from K-Visa to Kowork, their differentiating features become liabilities

**LocalNomad's correct positioning**: "We make the information layer so good that users can confidently self-file simple cases and know when they need a professional." This is:
1. **Legally safe** — pure information provision, not legal consultation
2. **Competitively differentiated** — no competitor frames it this way
3. **Strategically defensible** — immune to regulatory crackdowns that could hit Kowork
4. **Honestly better** — because YMMV is real, cautious language is more trustworthy than false certainty

**Impact on Strategic Opportunity Ranking**:
- **Visa Path Simulator** (ranked #1) → CONFIRMED GREEN. Pure information visualization. This is the wedge.
- **Income Calculator** (ranked #6) → Refined to YELLOW-GREEN. Template + guide model, not document reformatting.
- **HiKorea Appointment Sniper** (ranked #7) → Refined to YELLOW. Notification-only, public data only. No credentials.
- **Document Template Generator** (previously ranked #9) → RED. Remove from roadmap entirely. Replace with "example format gallery."
- **행정사 Directory** (ranked #8) → Refined to YELLOW. Start with static listing, wait for 로톡 precedent before adding interactive features.

---

## Recommendations

### 1. Immediate (This Week)
- **Populate `communityTips`** in the 6 full visa JSONs using data from the research file. The Discord analysis contains 50+ verified tips that can be structured immediately. This is pure data entry, zero engineering.
- **Add Vietnamese (vi) to locale config** in `lib/i18n/config.ts`. Even if translations aren't ready, scaffolding the 4th language signals intent and prepares the infrastructure.
- **Fix missing Vietnamese in Working Holiday countries** in `quiz-engine.ts` -- Vietnam is not in `WH_AGREEMENT_COUNTRIES` (correct, they don't have WH), but ensure the quiz correctly handles Vietnamese nationality for E-7 recommendations.

### 2. Short-term (This Month)
- **Ship the Visa Path Simulator as a standalone page** at `/visa/path` with visual A > B > C rendering. The engine exists; it needs a polished UI with interactive step cards.
- **Complete dashboard persistence**: The Supabase tables (`visa_progress`, `checklist_items`) are referenced but need production-readiness verification. Test the full flow: quiz > select visa > start dashboard > track documents > get health score.
- **Add embassy-specific data** to at least E-7 and F-1-D JSONs. Start with US, Canada, UK, Vietnam, Japan embassies using research data.

### 3. Medium-term (This Quarter)
- **Launch Vietnamese translations** for all 12 visa JSONs + quiz questions + UI strings. Vietnamese E-7 workers are the largest segment and underserved by all competitors.
- **Build the Income Calculator**: GNI-based threshold with currency conversion, gross vs net mode. Use the `gniBasedIncome` and `fixedIncomeRequirement` types already in the schema.
- **Beta launch in Dev Korea + CodeSeoul Discords**: Research recommends recruiting 50 beta testers. These are the ideal early adopters: tech-savvy, English-speaking, high-income, community-active.
- **SEO campaign on tool-based keywords**: "visa dashboard korea", "E-7 checklist", "visa path simulator" -- keywords that Kowork and Famigo don't target because they don't have the tools.

### 4. Strategic (This Year)
- **Community Intelligence Network**: Build the crowdsourced approval timeline database. If 500+ users report their approval timelines, this becomes an unassailable data moat.
- **B2B pivot for employers**: Research validates that employers struggle too ("weird rules for companies to sponsor a visa"). The B2B landing page exists at `/business`. Build employer-facing guides and tools.
- **HiKorea middleware layer**: Explore technical feasibility of appointment monitoring, smart file resizing, and OCR-based form filling. This is the highest-effort, highest-moat opportunity.
- **Expand to Taiwan**: The `countries` config already includes Taiwan. Visa data structure is country-agnostic. Taiwan digital nomad visa (Gold Card) is a natural adjacent market.

---

## Appendix: Key Files Referenced

| File | Purpose |
|---|---|
| `/Users/leegen/localnomad/b2c-website/lib/visa/data.ts` | Visa data loader with 12 visa types, 3 locales |
| `/Users/leegen/localnomad/b2c-website/lib/visa/quiz-engine.ts` | Quiz scoring logic with visa path support |
| `/Users/leegen/localnomad/b2c-website/lib/visa/types.ts` | Type definitions including `VisaPathStep`, `pathsTo`, `pathsFrom`, `communityTips` |
| `/Users/leegen/localnomad/b2c-website/lib/visa/stateMachine.ts` | Visa state machine (NO_VISA > ACTIVE > EXPIRING) |
| `/Users/leegen/localnomad/b2c-website/lib/visa/health-score.ts` | Health score calculation (4-factor weighted) |
| `/Users/leegen/localnomad/b2c-website/components/visa/dashboard/DashboardClient.tsx` | Dashboard with Supabase integration |
| `/Users/leegen/localnomad/b2c-website/components/visa/quiz/VisaFinder.tsx` | Quiz flow with recommendations |
| `/Users/leegen/localnomad/b2c-website/components/visa/VisaComparisonTool.tsx` | Side-by-side visa comparison |
| `/Users/leegen/localnomad/b2c-website/components/visa/journey/VisaJourneyPage.tsx` | Visa detail page with 4-step journey |
| `/Users/leegen/localnomad/b2c-website/data/visas/en/` | 12 visa data JSON files (English) |
| `/Users/leegen/localnomad/b2c-website/lib/i18n/config.ts` | i18n config: 3 locales, 2 countries |
| `/Users/leegen/localnomad/b2c-website/public/data/seoul-boundary.geojson` | Seoul map data |
| `/Users/leegen/localnomad/b2c-website/비자 대시보드 관련 조사 결과.txt` | Primary research document (301+ Discord threads, Reddit, competitor analysis) |
