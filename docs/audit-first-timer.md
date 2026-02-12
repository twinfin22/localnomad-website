# First-Timer Audit: Linh's Journey
> Persona: Linh, 29, Vietnamese, E-7-1 (Professional Employment), TOPIK 3, 4 months until visa expiry, found LocalNomad through a Facebook group for Vietnamese workers in Korea

## Executive Summary

LocalNomad currently **fails Linh on her most urgent need**: understanding whether she can switch employers on an E-7 visa with 4 months remaining. The site provides solid static E-7 information for new applicants but has **zero Vietnamese language support**, no employer-switching guidance, no expiry countdown tools accessible without login, and no content that acknowledges the emotional terror of visa expiry. The situation-based landing page is excellent UX design, but everything after that first click assumes a first-time applicant, not an existing holder in crisis. Linh would spend 3-5 minutes on the site, find the E-7 page moderately helpful for general info, but ultimately leave for a Vietnamese Facebook group or a 행정사 because the site doesn't answer her actual question: "Can I keep living in Korea if my employer doesn't renew?"

## Journey Map

| Step | Page/Component | Friction (1-5) | Anxiety Impact | What Linh Thinks | What's Missing |
|------|---------------|-----------------|----------------|-------------------|----------------|
| 1 | Homepage (`app/page.tsx` -> `components/hero-section.tsx`) | 3 | Neutral | "Your Seoul Toolkit" -- this is for tourists? "500+ Nomads Helped" -- I'm not a nomad, I'm a worker on E-7 | No Vietnamese. No "visa emergency" path. "Nomad" branding alienates E-7 workers. Primary CTA goes to `/bundles` not `/visa` |
| 2 | Header nav -> clicks "Visa" (`components/header.tsx:16-19`) | 2 | Slight relief | Good, there's a visa section | Nav links go to `/visa` without `[lang]/[country]` prefix -- routing depends on middleware to resolve. Homepage hero card links directly to `/visa` too |
| 3 | Visa Landing (`app/[lang]/[country]/visa/page.tsx:43-80`) | 2 | Relief then confusion | "What's your situation?" -- I see "I have a job offer" with E-7. But I ALREADY have E-7 and need renewal/switching help | "Already have a visa?" section exists (line 122-130) but routes to `#after-approval` which is only about post-approval steps, not crisis management |
| 4 | E-7 Detail (`components/visa/journey/VisaJourneyPage.tsx`) | 3 | Mixed | Good overview. I see documents and steps. But this is for NEW applicants. Where is "how to switch employers"? | No section on employer changes, no expiry warning, no Vietnamese, FAQ covers "Can I change jobs?" in 2 sentences with no procedure |
| 5 | E-7 FAQ: "Can I change jobs?" (`data/visas/en/e-7.json:179-181`) | 4 | Increased anxiety | "you must report the change to immigration and get your visa updated... Don't start working for the new company until this is complete." -- HOW? What documents? Timeline? | No step-by-step for employer change. No timeline. No mention of what happens if current employer refuses to cooperate |
| 6 | E-7 Checklist (`components/visa/checklist/ChecklistPage.tsx`) | 2 | Slight help | OK I can track documents. But these are for initial application, not for switching employers | Checklist is one-size-fits-all. No scenario selector for new vs. renewal vs. employer change |
| 7 | Visa Dashboard (`components/visa/dashboard/DashboardClient.tsx:457-483`) | 5 | Frustration | "Sign in to continue" -- I don't have an account. I just want quick help with my expiring visa | Dashboard requires Supabase auth. Empty state shows "Find My Visa" quiz -- but Linh already has a visa |
| 8 | Visa Quiz (`components/visa/quiz/VisaFinder.tsx` -> `data/quiz/questions.json`) | 4 | Alienation | Nationality options: US, UK, CA, AU, DE, FR, JP, "Other EU", "Other". Vietnam isn't listed! I'm just "Other"? | Vietnam not listed despite being the largest foreign worker population in Korea (~230,000+). Quiz doesn't ask about existing visa holders |
| 9 | Bundles page (`app/[lang]/[country]/bundles/page.tsx:47-84`) | 5 | Anger | $19-$69 for guides? I need help NOW with my visa, not a "Seoul Survival Playbook" or "Digital Nomad Cheatsheet" | Zero relevance to Linh's crisis. No bundle for "E-7 employer change kit" or "visa renewal guide" |
| 10 | Exits to Facebook group | -- | Defeat | "This site has nice info but doesn't help my actual problem" | -- |

## Critical Anxiety Gaps

### Gap 1: No "Existing Visa Holder in Crisis" Path
**Files**: `app/[lang]/[country]/visa/page.tsx:43-80` (situation tiles), `components/visa/journey/VisaJourneyPage.tsx:150-163` (Step 4: After approval)

The visa landing page assumes users are choosing their FIRST visa. The "Already have a visa?" section (line 122-130) links to `#after-approval` on each visa detail page, but "after approval" content only covers generic post-approval tasks (renewal basics, address reporting). There is **no content for**:
- Employer is not renewing my contract -- what are my options?
- How to switch employers on E-7 without leaving Korea
- What happens when E-7 expires and I haven't found a new sponsor
- D-10 (job-seeking visa) as a safety net -- transition timeline and procedure
- Grace period rules (the FAQ mentions "usually 30 days" but gives no procedure)

**Research link**: Pain Point #2 "비자 전환 경로 미로 -- 내 상황에서 뭐가 가능한지 모르겠다": users don't know their options when circumstances change. Pain Point #3 "비자 스폰서십의 벽": "companies might not be too keen on VISA support" + "weird rules for companies to sponsor a visa."

### Gap 2: Vietnam Not in Nationality Options
**File**: `data/quiz/questions.json:13-22`

The quiz lists 9 nationality options: US, UK, Canada, Australia, Germany, France, Japan, "Other EU", and "Other". Vietnam is absent despite Vietnamese being the **largest foreign worker population in Korea**. Chinese, Indian, Indonesian, Thai, Filipino -- none of the top worker nationalities are individually listed. This signals the product was designed for Western expats, not the actual majority of visa applicants.

**Research link**: Pain Point #6 "한국어 장벽": the research explicitly identifies Vietnamese as a priority language. The competitor Famigo already supports 8 languages including Vietnamese (`비자 대시보드 관련 조사 결과.txt:892`).

### Gap 3: E-7 FAQ on Job Change is Dangerously Incomplete
**File**: `data/visas/en/e-7.json:179-181`

The FAQ "Can I change jobs on an E-7 visa?" provides a 2-sentence answer: "Yes, but you must report the change to immigration and get your visa updated with the new employer as sponsor. Don't start working for the new company until this is complete."

This answer is **missing critical information** Linh desperately needs:
- What documents the NEW employer must prepare (사업자등록증, 고용계약서, 납세증명서, 외국인고용신고서)
- The timeline (typically 2-4 weeks for Visa Issuance Number transfer)
- Whether she can stay in Korea during the transition period
- The exact grace period if her current contract ends before the new visa is issued
- Whether she needs consent from her CURRENT employer to switch
- What happens if the new employer's sponsorship application is rejected
- D-10 as an interim option if the gap between employers is too long

**Research link**: Dev Korea Discord -- "weird rules for companies to sponsor a visa" + "one agent said no, another said yes... YMMV always." Incomplete info like this FAQ actively increases YMMV anxiety rather than resolving it.

### Gap 4: Dashboard Requires Authentication for Basic Needs
**File**: `components/visa/dashboard/DashboardClient.tsx:457-483`

The dashboard shows "Sign in to continue" with a user icon. The empty state (lines 45-108) offers "Find My Visa" quiz and quick access cards for E-7 and F-1-D. But Linh doesn't need to "find" her visa -- she already has E-7. She needs:
- A D-Day countdown to her visa expiry (no auth needed for a simple calculator)
- A step-by-step employer change or renewal guide
- A clear list of her options with 4 months remaining

None of this requires authentication. The checklist (`ChecklistPage.tsx:54-64`) already uses localStorage for persistence -- the same pattern should apply to basic dashboard features. Gating everything behind Supabase auth creates friction at the highest-anxiety moment.

**Research link**: Pain Point #4 "비용 불투명 + 행정사 의존" -- "Renewal paperwork is always easier. Just a single page form for me + some docs." Users want to self-serve simple tasks, not be gated.

### Gap 5: Zero Vietnamese Language Support
**Files**: `lib/i18n/config.ts:11` -- locales are `["en", "ja", "zh-tw"]`. `messages/` contains only `en.json`, `ja.json`, `zh-tw.json`. No `vi.json` exists.

The entire site offers English, Japanese, or Traditional Chinese. No Vietnamese. No Korean. No Simplified Chinese. With TOPIK 3 Korean, Linh can handle basic Korean better than she can parse English legal terminology like "apostilled", "immigration compliance", or "sponsoring employer." But neither Korean nor Vietnamese is available.

The language switcher (`components/language-switcher.tsx`) shows a globe icon with only 3 options. Japanese and Traditional Chinese serve Taiwan/Japan markets but miss the largest single-nationality foreign worker group in Korea.

**Research link**: The research explicitly recommends Vietnamese as a priority language. The competitor Famigo supports 8 languages including Vietnamese, Nepali, Mongolian, and Indonesian -- languages that match actual foreign worker demographics in Korea (`비자 대시보드 관련 조사 결과.txt:892`).

## Language Barrier Analysis

| Location | Content | Barrier Level | Issue |
|----------|---------|---------------|-------|
| `hero-section.tsx:29` | "Your Korea Journey Starts Here" | Medium | "Journey" is vague -- Linh might not connect this to visa help |
| `hero-section.tsx:64` | "Curated guides, area insights, and visa support" | High | "Curated" is TOPIK 5+ vocabulary. "Insights" is abstract for TOPIK 3 |
| `hero-section.tsx:88-89` | "Checklists, playbooks, and cheatsheets" | High | "Playbook" and "cheatsheet" are informal English idioms a TOPIK 3 user wouldn't know |
| `data/visas/en/e-7.json:6` | "designed for foreign professionals with specialized skills" | Medium | Does Linh consider herself "specialized"? Imposter syndrome risk |
| `data/visas/en/e-7.json:98-99` | "Original or certified copy, apostilled if from foreign country" | Very High | "Apostilled" is C1-level English. No explanation of what apostille means or how to get one in Vietnam |
| `data/visas/en/e-7.json:104-107` | "Career Certificate / Employment History" | High | Korean term is 경력증명서 -- Linh likely knows Korean admin terms better than English equivalents |
| ALL document names | English-only document names | Critical | Documents like 사업자등록증, 재직증명서, 납세증명서 are only in English. Linh needs Korean names to request them from her employer's HR department |
| `visa/page.tsx:141-148` | "What's your situation?" / "Select your situation" | Low | Clear and simple -- this is good UX |
| `visa/page.tsx:47` | "I have a job offer in Korea" | Medium | Linh ALREADY has a job, not a job offer. The framing excludes existing holders |
| `LegalDisclaimer.tsx:70` | "This information is for general guidance only. Visa requirements change frequently." | Medium | Legal disclaimer language may confuse TOPIK 3. More importantly, it increases anxiety rather than managing it |
| Bundles page | "Seoul Survival Playbook", "Digital Nomad Cheatsheet" | High | Informal English idioms. "Survival" might even alarm an anxious user |
| Social proof (`social-proof-section.tsx:7-28`) | Testimonials from "Sarah M., UX Designer, Remote", "James K., Software Engineer", "Maria L., Content Creator" | Medium | All Western names, all nomad/creative roles. Nobody who looks like Linh (Vietnamese worker on E-7) |

## Research Cross-Reference

| Research Pain Point | Site Addresses It? | How / Gap |
|--------------------|--------------------|-----------|
| #1 Information contradiction / YMMV (5-star severity) | Partially | E-7 page provides structured info with "Updated Feb 2026" date and official links. But no "verified by" badge, no update changelog, no community validation mechanism. Salary requirement says "varies by occupation" -- exactly the YMMV problem |
| #2 Visa transition path maze (5-star severity) | No | No visa path simulator. `relatedVisas` field exists in `e-7.json:215` (d-10, f-2, f-5) but is **never rendered** on the detail page (`VisaJourneyPage.tsx` does not reference `relatedVisas`). No "If E-7 doesn't work out, here are your options" flow |
| #3 Visa sponsorship wall (4-star severity) | No | No employer-side guidance. No list of companies that sponsor. No guide for when current employer won't cooperate. No template email for HR |
| #4 HiKorea UX hell (4-star severity) | Minimal | Official links include HiKorea URL (`e-7.json:221`). No guidance on navigating HiKorea. No appointment tips. No name-mismatch warnings. No 1345 hotline mention |
| #5 Remote work/freelancer confusion (4-star severity) | Partial | F-1-D page exists and is a full guide. But no content bridging E-7 -> remote work scenarios, which matters if Linh wants to switch from E-7 to freelance |
| #6 Korean language barrier (3-star severity) | No | Only 3 UI languages, none matching top foreign worker demographics. No Korean document name translations (한국어 병기) in checklist |
| #7 Cost / 행정사 dependency (3-star severity) | Minimal | Visa fees listed (`e-7.json:52-55`). No 행정사 price comparison. No "do you need a 행정사 for this?" guidance. No cost estimator |
| "embassies had no idea" | No | No embassy-specific or immigration-office-specific guidance. No "your experience may vary by office" warnings |
| "담당자마다 다른 답변" | No | No mechanism to collect or display varying experiences. No "community reports" or "success stories" section. `communityTips` type defined in `types.ts:300-310` but never populated in any visa JSON |
| Grace period after job loss | Minimal | E-7 FAQ mentions "usually 30 days" (`e-7.json:183`) but no procedure details for how to use that period, what to file, where to go |
| Salary negotiation affects visa | Yes | E-7 tip: "Negotiate salary before signing - higher salary improves visa chances" (`e-7.json:201`). Good but could specify IT salary ranges |
| Extension timing | Yes | E-7 tip: "Start extension process 2 months before visa expires" (`e-7.json:204`). Good. But no automated countdown or reminder accessible without auth |
| KIIP (사회통합프로그램) points | No | Zero mention of KIIP anywhere on the site. Linh could gain visa points for F-2 transition through KIIP but would never learn this from LocalNomad |
| Famigo as competitor | N/A | Famigo offers Vietnamese language support and 행정사 connections that LocalNomad lacks. If Linh's Vietnamese Facebook group mentions Famigo, she'd go there instead |
| ARC expiry -> SIM/bank cascade | No | No content on what happens to daily life when visa expires. No guidance on ARC, phone, banking implications |

## Competitor Escape Points

### Escape Point 1: Vietnamese Facebook Groups
**When**: Immediately after landing on homepage (or before, since she found LocalNomad through a Facebook group)
**Why**: Homepage says "Your Seoul Toolkit" with English-only content. Linh's first instinct is to ask in Vietnamese. Facebook groups like "Nguoi Viet tai Han Quoc" have thousands of members who share E-7 employer-change experiences in Vietnamese.
**What would retain Linh**: Vietnamese UI translation for the visa section. Even a single "Huong dan visa E-7 bang tieng Viet" page would be powerful.

### Escape Point 2: 행정사 (Immigration Agent)
**When**: After reading the incomplete E-7 job-change FAQ
**Why**: The FAQ tells her WHAT to do ("report the change") but not HOW. With 4 months left and rising anxiety, Linh would pay 50-80만원 for a 행정사 rather than risk getting it wrong from incomplete web info.
**What would retain Linh**: Complete employer-change guide with Korean document names, exact procedure, timeline, and what-if scenarios. If the guide is good enough, she saves the 행정사 fee.

### Escape Point 3: HiKorea Direct
**When**: When she needs to actually check visa status or book an immigration office appointment
**Why**: LocalNomad has no HiKorea integration or navigation guidance. The dashboard requires signup. Linh goes straight to the source.
**What would retain Linh**: HiKorea navigation guide (how to check status, book appointment, handle name mismatch errors). Even better: a HiKorea appointment availability checker.

### Escape Point 4: Kowork App
**When**: When Linh realizes she might need a new employer
**Why**: Kowork (kowork.kr) has E-7 sponsorship tags on job listings and a visa qualification test. LocalNomad has no job board and no employer sponsorship database.
**What would retain Linh**: Even a curated list of "companies known to sponsor E-7 for IT professionals" or a link to Kowork with context.

### Escape Point 5: 1345 Immigration Hotline
**When**: When she has a specific procedural question the site cannot answer
**Why**: The 1345 call center offers multilingual support including Vietnamese. LocalNomad never mentions it exists.
**What would retain Linh**: Prominent 1345 mention on every visa page. Tip: "Call 1345 and request Vietnamese interpreter for free immigration consultation."

## Recommendations (Prioritized)

1. **Add "I already have a visa" as a primary path on the visa landing page** -- Not just the small "Already have a visa?" dropdown, but a first-class section with dedicated flows: renewal guide, employer change guide, "what if my visa expires" emergency flow, D-10 transition path. This is the highest-impact change because it serves the most anxious and most motivated users. (`app/[lang]/[country]/visa/page.tsx`)

2. **Add Vietnamese to nationality quiz AND as a UI language** -- Vietnam should be listed explicitly in quiz nationality options (not lumped under "Other"). Vietnamese UI translation should be P0 for the visa section. Add `vi` to `lib/i18n/config.ts` locales and create `messages/vi.json`. (`data/quiz/questions.json`, `lib/i18n/config.ts`)

3. **Create employer-change flow for E-7** -- A dedicated sub-page or expanded journey step that covers: (a) documents your new employer needs (with Korean names), (b) documents you need, (c) exact procedure at immigration office, (d) timeline, (e) grace period rules, (f) what happens if rejected, (g) D-10 as fallback. (`data/visas/en/e-7.json`, new content in journey steps)

4. **Show Korean document names alongside English (한국어 병기)** -- Every document in the checklist should display its Korean name (e.g., "Business Registration -- 사업자등록증"). TOPIK 3 users know Korean administrative terms better than English ones. They need the Korean names to request documents from their employer's HR. (`data/visas/en/e-7.json` document entries, `components/visa/checklist/ChecklistItem.tsx`)

5. **Remove auth wall from basic dashboard features** -- D-Day countdown, basic visa info lookup, and next-steps guidance should work without signup. Use localStorage (already used for checklist at `ChecklistPage.tsx:46`) for basic tracking. Gate only cloud sync and notification features behind auth. (`components/visa/dashboard/DashboardClient.tsx`)

6. **Add 1345 hotline info prominently** -- The 1345 Immigration Contact Center offers Vietnamese, Chinese, and other language support. Add it to every visa detail page and the legal disclaimer section. Include tip: "Request Vietnamese interpreter for free." (`components/visa/LegalDisclaimer.tsx`, `components/visa/journey/VisaJourneyPage.tsx`)

7. **Reframe homepage for workers, not just nomads** -- "Your Seoul Toolkit" and "500+ Nomads Helped" positions the brand for digital nomads. E-7 workers are the #1 target segment per the research. The primary CTA button links to `/bundles` (paid guides) instead of `/visa` (free tool). Swap the CTA or add a "Visa Help" button as equal weight. (`components/hero-section.tsx:148-155`)

8. **Render `relatedVisas` on visa detail pages** -- The E-7 data includes `relatedVisas: ["d-10", "f-2", "f-5"]` (`e-7.json:215`) but `VisaJourneyPage.tsx` never renders this field. Displaying "Your next steps: D-10 (Job Seeking) -> F-2 (Residence) -> F-5 (Permanent Residence)" would help Linh see long-term options and reduce anxiety about the future. (`components/visa/journey/VisaJourneyPage.tsx`)

9. **Populate `communityTips` field in visa data** -- The `CommunityTip` type is defined (`lib/visa/types.ts:300-310`) and `communityTips` field exists on `VisaInfo` (`types.ts:172`), but no visa JSON files include it. Filling E-7 community tips with sanitized Discord/Reddit insights like "Start your extension process 2 months early -- offices are backed up" would address the YMMV problem and build trust.

10. **Diversify testimonials to include E-7 workers** -- Current social proof section (`components/sections/social-proof-section.tsx:6-28`) features "Sarah M., UX Designer, Remote", "James K., Software Engineer", "Maria L., Content Creator" -- all Western-sounding names in nomad/creative roles. Add at least one testimonial from an E-7 visa holder with a non-Western name. If real testimonials don't exist yet, remove the section rather than display potentially fabricated ones.

## Addendum: Legal Copy Issues in Linh's Journey (from Counsel audit)

The counsel audit identified specific copy in Linh's journey that creates a **false confidence -> YMMV crash** pattern. These directly worsen Anxiety Management and Trust Building scores:

| Component | Current Copy | Problem for Linh | Suggested Fix |
|-----------|-------------|------------------|---------------|
| `StepQualify.tsx:98` | "you appear to qualify for this visa" | Linh over-relies on this, then gets rejected when switching employers. Trust destroyed. | "Your answers match the published requirements for this visa" |
| `QuickEligibilityCheck.tsx:132` | "You may be eligible" + green checkmark | Green checkmark creates false confidence for a user 4 months from expiry | "Your answers align with published requirements" (neutral indicator) |
| `EligibilityQuiz.tsx:330` | "here are your recommended visas" | "Recommended" implies professional advice. Linh may not consult a 행정사 because the site already "recommended" | "Visas with matching requirements include..." |
| `EligibilityQuiz.tsx:369` | "Best Match" badge | Implies personalized professional assessment | "Closest requirement match" |
| `VisaComparisonTool.tsx:329` | "personalized recommendations" in CTA | Creates expectation of tailored advice that doesn't exist | "explore visa options" |

**Impact on Linh's journey**: These phrases create exactly the overconfidence that makes the YMMV problem worse. When Linh sees "you appear to qualify" and then discovers reality is more complex (employer cooperation needed, documents may be rejected, grace period uncertain), the trust gap is catastrophic. Paradoxically, **softer language builds more trust** because it's honest about uncertainty -- which matches research Pain Point #1.

This finding lowers the Trust Building score from 9/20 to **7/20** and the overall score from 34/100 to **32/100**.

## Addendum: Cross-Validated Gaps with Resident Audit (James, E-2 to E-7 switcher)

Three critical gaps from Linh's audit were independently confirmed by the resident audit (James persona). Two different personas, same walls -- this makes these findings high-confidence priorities.

### Cross-Validated Gap 1: No Visa Transition Paths (CRITICAL -- both audits rank this #1)
- **First-timer finding**: `relatedVisas` in `e-7.json:215` never rendered on detail page; no "If E-7 doesn't work, here are your options" flow
- **Resident finding**: Goes deeper -- `pathsTo`/`pathsFrom` fields defined in `lib/visa/types.ts:178-181` but zero visa JSON files populate them. Additionally, `lib/visa/stateMachine.ts:119` has defined state transitions but no UI triggers them. **The infrastructure is partially built in two places (type system + state machine) but neither is wired up.**
- **Combined impact**: The research calls Visa Path Simulator the "killer feature" (P0 priority). Zero competitors have it. Both Linh (needs E-7 -> D-10 fallback path) and James (needs E-2 -> E-7 transition path) are blocked by the same gap.

### Cross-Validated Gap 2: Quiz Useless for Existing Visa Holders
- **First-timer finding**: Quiz doesn't ask about existing visas; "Worker (E-series)" is a single bucket; Vietnam not listed
- **Resident finding**: Scored quiz 2/10 for stickiness because it has zero value for someone who already knows their visa type. Only covers 4 of 12 visa types in results. `AlreadyHaveVisa.tsx` component exists but just links to generic journey pages -- no transition-specific flow
- **Combined impact**: Both personas already know their target visa. They need help with HOW to get there from their current situation, not WHAT visa to pick.

### Cross-Validated Gap 3: Zero Employer-Side Guidance
- **First-timer finding**: E-7 FAQ on job change gives 2 sentences with no procedure. No documents list for new employer. No Korean document names.
- **Resident finding**: Zero employer-side features anywhere in codebase. No HR guidance, no employer document lists, no template letters. Especially critical for E-7 because employer does most heavy lifting (HRDX point system, company registration proof)
- **Combined impact**: Research Pain Point #3 (4/5 severity): "Neither the company nor I know the rules." Both Linh's current employer (who may not renew) and James's new employer (who needs to sponsor E-7) hit this wall.

**Recommendation to team-lead**: These three gaps should be treated as the highest-priority items in the synthesis report. They are cross-validated across two independent persona audits, supported by the #1, #2, and #3 ranked pain points in the research, and partially scaffolded in the codebase (types exist, data is empty, UI is unwired).

## The Linh Test Score

**Overall: 30/100** (revised from 34→32 after counsel cross-reference, then 32→30 after inspector i18n evidence)

- **Information Completeness: 8/20** -- Solid E-7 overview for new applicants. Eligibility, documents, and application steps are all present. But the most critical information for Linh's situation (switching employers with 4 months left, grace period procedure, D-10 transition path) does not exist. The `relatedVisas` data is available but never rendered. The `communityTips` type is defined but never populated. Korean document names are absent. KIIP is not mentioned.

- **Anxiety Management: 4/20** -- The site does not acknowledge visa anxiety. No reassuring language ("You have options"), no emergency paths, no "what if things go wrong" guidance. The legal disclaimer ("This information is for general guidance only and does not constitute legal advice") increases anxiety without providing an alternative. The dashboard auth wall creates a dead end at the highest-anxiety moment. Testimonials feature nobody who looks like Linh.

- **Language Accessibility: 5/20** -- English-only for a user with TOPIK 3 Korean and no English as native language. No Vietnamese. No Korean administrative term translations. Legal and administrative vocabulary ("apostilled", "sponsoring employer", "curated guides", "playbook") far exceeds B1 English level. The language switcher offers Japanese and Traditional Chinese -- serving tourist/expat markets but missing the largest foreign worker demographic.

- **Trust Building: 7/20** (revised down from 9 after counsel cross-reference) -- "Updated Feb 2026", "Based on official requirements", and "12 visa types covered" are good trust signals. Official links to immigration.go.kr and HiKorea are helpful and properly attributed. However: testimonials appear generic (no specifics, no photos, Western-only names), "500+ Nomads Helped" is unverifiable, and there's no indication of who created the content or their immigration expertise. The legal disclaimer actively undermines trust by distancing the site from its own content. **Additionally, quasi-legal language like "you appear to qualify" and "Best Match" creates false confidence that makes the eventual YMMV crash worse** (see Addendum above).

- **Action Clarity: 8/20** -- The situation-based visa landing page is excellent design -- clear tiles, clear CTAs, logical grouping. The 4-step accordion on the E-7 page provides good structure. But once Linh identifies her specific need (employer change), the site has no answer. The checklist tracks documents but doesn't differentiate by scenario. The dashboard requires auth. The quiz excludes her nationality. At no point does Linh get a clear "here is exactly what to do in YOUR situation" answer.

---

## Addendum 3: Marketing Copy Legal Risks (from counsel, 2026-02-11)

Counsel provided a detailed legal assessment of 6 copy claims I flagged. Two require immediate fixes:

### Immediate Fixes Required

1. **"12 visa types covered"** (`visa/page.tsx:206`) — **MEDIUM-HIGH risk**. Counsel confirmed 6 of 12 visas are `isStub: true` (d-4, d-7, d-8, e-2, f-4, f-6) rendering a "Coming Soon" stub page. Claiming "12 visa types covered" when half are empty is potentially a violation of Korea's Fair Labeling and Advertising Act (표시광고법) Article 3. Fix: Change to "6 visa types covered" or "12 visa types — 6 full guides, 6 coming soon."

2. **"500+ Nomads Helped"** (`hero-section.tsx:176`) — **MEDIUM risk**. Unverifiable marketing claim. Under 표시광고법, quantitative claims should be substantiable. If fewer than 500 actual users exist, this is false advertising. Fix: Tie to a real metric, soften to "Helping nomads navigate Korea," or remove.

### Should Fix Soon

3. **"Based on official requirements"** (`visa/page.tsx:206`) — Change to "Based on publicly available requirements" to remove government endorsement implication.

4. **"Updated Feb 2026"** (`visa/page.tsx:199-200, 206`) — Creates a maintenance obligation. If the site goes 3+ months without updates, this timestamp becomes evidence of negligence. Fix: Make dynamic or reframe as "Information as of Feb 2026 — always verify with official sources."

5. **E-7 grace period "usually 30 days"** (`data/visas/en/e-7.json:184`) — Currently leads with certainty ("You have a grace period") then qualifies with "usually." Fix: Lead with uncertainty: "A grace period may be granted (typically 30 days, but varies by case)."

6. **Quiz disclaimer** — Counsel confirmed this is adequate. No change needed.

### Impact on Linh's Journey

These marketing copy issues compound the anxiety gaps identified in the main audit. Linh encounters "12 visa types covered" and "500+ Nomads Helped" early in her journey, building trust expectations that the product cannot deliver on. When she discovers her specific visa situation (E-7 employer change) has no coverage, the trust collapse is magnified by the earlier overclaiming. The "Based on official requirements" phrasing is especially dangerous for Linh because she needs to RELY on this information for a life-altering decision with a 4-month deadline.

---

## Addendum 4: Competitive Escape Routes for Linh (from scout, 2026-02-11)

Scout provided Linh-specific competitive analysis that sharpens my "Competitor Escape Points" section. Key addition:

**Facebook/KakaoTalk Vietnamese communities are LocalNomad's hardest competitor for Linh.** My main audit identified Google, Reddit, and immigration agencies as escape routes, but missed the most obvious one: Vietnamese diaspora communities on Facebook and KakaoTalk are extremely active in Korea. Linh would get personalized answers in Vietnamese from people who recently went through E-7. Community beats static English content for a nervous first-timer every time.

This reinforces my recommendation #1 (Vietnamese language support) and adds urgency: LocalNomad isn't just competing with other tools — it's competing with warm, free, native-language peer advice. The only way to win is to offer something communities cannot: structured, verified, always-current information with clear next steps. Communities give "my friend said..." — LocalNomad should give "here is exactly what to do, verified against current policy."

Scout also confirmed Kowork is company/HR-facing (Korean-language), meaning Linh's employer might use it but Linh herself would not. This means LocalNomad's real competitive lane for the Linh persona is the English-speaking individual applicant who wants to DIY — a narrower but underserved segment.

---

## Addendum 5: i18n Technical Evidence (from inspector, 2026-02-11)

Inspector's technical audit quantifies the language barrier I flagged qualitatively in my main audit (Language Accessibility score: 5/20). The numbers are worse than I estimated:

- **Vietnamese is completely unsupported** — no `vi` locale in config, no translation file, not in the supported languages list. The Famigo competitor already supports Vietnamese.
- **~75% of content stays in English even when switching locales** — the i18n system only translates navigation/chrome. Actual substance (visa landing situations, dashboard, bundles, auth pages) is 100% hardcoded English.
- **Root page bypasses i18n entirely** — `app/page.tsx` is hardcoded English regardless of locale setting.
- **Auth pages hardcode `<html lang="en">`** — even if Linh navigated in another language, the login page declares itself English.

### Revised Language Accessibility Score

My original score of 5/20 was generous. With inspector's evidence that 75% of content is hardcoded English and the i18n system is essentially cosmetic (translating nav labels but not page content), I would revise to **3/20**. The language switcher in the header creates a false promise — it implies multilingual support that doesn't exist for the content that matters.

**Impact on overall score**: Revised from 32/100 to 30/100 (Language Accessibility 5→3).

---

*Audit completed: 2026-02-11*
*Persona: Linh, 29, Vietnamese E-7-1 holder, 4 months to expiry, TOPIK 3*
*Auditor: first-timer agent*
