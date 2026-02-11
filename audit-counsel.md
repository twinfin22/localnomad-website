# LocalNomad Legal Compliance Audit
## Korean Regulatory Compliance Analysis for Visa Information Platform

**Prepared for:** LocalNomad (Bulpyeonham)
**Date:** February 11, 2026
**Analyst Focus:** Administrative Scrivener Act (행정사법), Attorney Act (변호사법), Immigration Control Act (출입국관리법)

---

## Executive Summary

LocalNomad operates in a legally sensitive space following the K-Visa/CU controversy of May 2025, where 대한행정사회 (Korea Administrative Scriveners Association) attacked a platform for "unlawfully brokering" visa services. This audit identifies **YELLOW-zone exposure** in the current product with **no RED-zone violations**, but recommends immediate disclaimer strengthening and architectural safeguards before adding planned features like 행정사 marketplace or HiKorea integration.

---

## 1. Feature Compliance Matrix

| Feature | Legal Zone | Specific Risk | Recommended Fix |
|---------|------------|---------------|-----------------|
| **Visa Quiz / Eligibility Checker** | YELLOW | Uses "Strong Match" / "may be eligible" language that approaches legal opinion territory | Change language from eligibility assessment to requirement matching; add explicit disclaimer on every results page |
| **Document Checklist** | YELLOW | Lists documents without generating them, but export function creates detached .txt file with NO disclaimer header — most dangerous artifact the product creates | Add disclaimer header to exports; add LegalDisclaimer to component |
| **Health Score Card** | YELLOW | Calculates "Preparation Score" (0-100) which could be misinterpreted as approval likelihood | Existing disclaimer is good: "This score reflects your document preparation progress, not approval likelihood" - ensure this is prominent |
| **D-Day / Expiry Tracker** | GREEN | Pure date calculation with no legal interpretation | No change required |
| **Next Action Card** | GREEN | Suggests generic next steps based on state machine - does not advise on legal strategy | No change required |
| **Visa Path Simulator** | YELLOW | Shows visa transition paths (D-4 → E-7, etc.) which could be seen as legal pathway advice | Add disclaimer: "Paths shown are general information; actual transitions depend on individual circumstances and immigration officer discretion" |
| **StateDashboard** | YELLOW | Self-reported progress tracker (PREPARING→SUBMITTED→APPROVED→ACTIVE) with ZERO disclaimers; users may treat dashboard state as authoritative status, not self-reported | Add prominent "self-reported, not connected to HiKorea" disclaimer; label states as "You marked: [state]" |
| **Bundles (Paid)** | YELLOW | Sells curated guides ($19-$69) but page has NO disclaimer clarifying these are information products, not legal services; money changing hands increases liability | Add "information product" disclaimer on Bundles page |
| **Terms of Service** | GREEN | Already includes "No Professional Advice" clause and limitation of liability | Strengthen to explicitly mention 행정사법 and 변호사법 |
| **Privacy Policy** | GREEN | Standard GDPR/PIPA compliant policy | No change required |

---

## 2. Detailed Legal Analysis by Statute

### 2.1 행정사법 (Administrative Scrivener Act) Article 22(6)

**The Law:**
> 누구든지 행정사 업무를 업(業)으로 알선·중개하거나, 부정한 방법으로 위임을 유치하는 행위를 금지한다.
> (No person shall broker or mediate administrative scrivener services as a business, or solicit delegation through improper means.)

**Current Risk Assessment:**
- LocalNomad does **NOT** currently connect users to 행정사
- No marketplace or referral system exists
- No commissions or fees from 행정사 referrals

**Status: COMPLIANT** - No current violation

**Future Risk:**
The planned "행정사 marketplace" (P3 feature in research document) would likely violate this provision if it:
- Collects fees from users for matching to 행정사
- Collects fees from 행정사 for leads
- Actively "matchmakes" users to specific 행정사

**Safe Harbor Alternative:**
- "Directory" model (like 로톡's revised approach): List 행정사 with their publicly available contact information without actively matching or receiving per-referral fees
- Advertising revenue only, not transaction-based

### 2.2 출입국관리법 (Immigration Control Act) Article 79-2

**The Law:**
> 외국인의 출입국 업무 대행은 등록된 행정사나 변호사만이 수행할 수 있다.
> (Only registered administrative scriveners or attorneys may represent foreigners in immigration matters.)

**Current Risk Assessment:**
- LocalNomad does **NOT** file documents on behalf of users
- No "submit to HiKorea" button exists
- Users perform all final submissions themselves

**Status: COMPLIANT** - No current violation

**Future Risk - HiKorea Appointment Sniper:**
The planned "HiKorea Appointment Sniper" feature could violate this if it:
- Books appointments on behalf of users
- Submits applications programmatically
- Acts as an intermediary between user and HiKorea

**Additionally:**
- Scraping HiKorea may violate their Terms of Service
- Privacy liability for handling user credentials

**Safe Harbor Alternative:**
- Notification-only model: Monitor for slot availability and send push/SMS alerts
- User performs booking themselves in their own browser
- Never store or transmit HiKorea login credentials

### 2.3 변호사법 (Attorney Act) Article 109

**The Law:**
> 변호사가 아닌 자가 금품·향응 또는 그 밖의 이익을 받거나 받을 것을 약속하고 법률사무를 취급하는 경우 처벌
> (Non-attorneys who receive compensation for handling legal matters shall be punished.)

**Current Risk Assessment:**

**Quiz/Eligibility Checker:**
- Uses phrases like "Strong Match," "Moderate Match," "Possible Option"
- States "You may be eligible based on these criteria"
- Does NOT use language like "you will be approved" or "you qualify"

**Linguistic Analysis:**
- Current: "Appears to meet published requirements" ← Information framing (safer)
- Dangerous: "You are eligible for this visa" ← Legal conclusion (prohibited)

**Status: YELLOW** - On the edge but currently defensible

**Critical Language Distinctions:**

| Prohibited (Legal Opinion) | Permitted (Information Display) |
|---------------------------|--------------------------------|
| "You are eligible" | "You appear to meet published requirements" |
| "You will be approved" | "These are the stated requirements" |
| "We recommend this visa" | "Based on your inputs, this visa's requirements align with your situation" |
| "You should apply for..." | "Visas with matching requirements include..." |

---

## 3. Disclaimer Audit

### 3.1 Current Disclaimers in Codebase

| Location | Text | Adequacy |
|----------|------|----------|
| `/components/visa/LegalDisclaimer.tsx` (box variant) | "This information is for general guidance only. Visa requirements change frequently. Always verify current requirements with the Korea Immigration Service or HiKorea before applying." | ADEQUATE for information pages |
| `/components/visa/LegalDisclaimer.tsx` (QuizDisclaimer) | "This tool checks your information against publicly available Korean visa requirements. It does not constitute legal advice. Final decisions on visa issuance rest solely with the Korean Ministry of Justice and immigration authorities." | GOOD - explicit about not being legal advice |
| `/components/visa/dashboard/HealthScoreCard.tsx` | "This score reflects your document preparation progress, not approval likelihood." | GOOD - specifically disclaims approval prediction |
| `/components/visa/detail/EligibilitySection.tsx` | "This is a preliminary check. Final eligibility is determined by Korean immigration authorities." | ADEQUATE but could be stronger |
| `app/(legal)/terms/page.tsx` | "LocalNomad is not a law firm, real estate agency, or financial institution. The information provided does not constitute legal, tax, or professional financial advice." | GOOD - broad disclaimer |
| `messages/en.json` (visa.disclaimer) | "This information is for guidance only and does not constitute legal advice. Always verify with official sources." | ADEQUATE |

### 3.2 Missing/Insufficient Disclaimers

| Page/Feature | Current State | Recommendation |
|--------------|---------------|----------------|
| **Quiz Results Page** | Has QuizDisclaimer | ADD: "LocalNomad does not represent you before immigration authorities. All applications must be submitted by you directly or through a licensed 행정사 or attorney." |
| **Visa Detail Pages** | LegalDisclaimer box at bottom | ADD: Banner-style disclaimer at TOP of page, not just bottom |
| **Income Calculator** | Has IncomeDisclaimer | KEEP as is - properly caveated |
| **Visa Path Simulator** | No specific disclaimer | ADD: "Visa transition paths shown are general patterns and may not apply to your specific circumstances. Immigration officers have discretion in approving category changes." |
| **Bundles Purchase Page** | No disclaimer visible | ADD: "Info Bundles are information products containing general guidance. They do not include personalized legal advice or representation." |
| **DocumentChecklist Export** | No disclaimer in component OR in exported .txt file | ADD: LegalDisclaimer to component + disclaimer header in all exports: "Generated by LocalNomad — for reference only. Verify all requirements with Korean immigration authorities." |
| **StateDashboard** | ZERO disclaimers (except HealthScoreCard sub-component) | ADD: "This dashboard tracks your self-reported progress. It is not connected to HiKorea or any government system." |
| **VisaComparisonTool** | No disclaimer | ADD: LegalDisclaimer variant="box" below comparison table |
| **Every Page (Global)** | No persistent disclaimer | ADD: Footer text on all pages (see Section 7) |

---

## 4. Top 3 Legal Risks in Current Product (Ranked by Severity)

### Risk #1: Quiz Language Approaching Legal Opinion
**Severity: MEDIUM-HIGH**

**Problem:** The quiz results use "Strong Match" and "may be eligible" language that could be construed as providing a legal opinion on visa eligibility.

**Evidence:**
```typescript
// From QuizResults.tsx
const MATCH_LEVEL_CONFIG = {
  strong: {
    label: 'Strong Match',
    description: 'Appears to meet published requirements',  // OK
  },
  // ...
};

// From EligibilitySection.tsx
<span className="text-sm text-emerald-400">
  You may be eligible based on these criteria  // RISKY
</span>
```

**Recommended Fix:**
- Change "You may be eligible" to "Your answers match the published requirements for this visa"
- Add prominent disclaimer above results
- Include: "This is not a determination of eligibility. Only immigration authorities can make that decision."

### Risk #2: Insufficient Disclaimer Visibility
**Severity: MEDIUM**

**Problem:** Disclaimers exist but are buried at the bottom of pages. K-Visa's problem was partly perception - even if legally compliant, if users PERCEIVE you're giving legal advice, regulatory scrutiny follows.

**Recommended Fix:**
- Add banner-style disclaimer at TOP of visa-related pages
- Add persistent footer disclaimer on ALL pages
- Make disclaimer unavoidable before quiz results display

### Risk #3: No Explicit 행정사법/변호사법 Reference in Terms
**Severity: LOW-MEDIUM**

**Problem:** Terms of Service disclaims legal advice but doesn't explicitly reference Korean professional licensing laws.

**Recommended Fix:**
Add to Terms of Service Section 4:
> "In accordance with the Administrative Scrivener Act (행정사법) and Attorney Act (변호사법) of the Republic of Korea, LocalNomad does not provide immigration representation services. We do not file applications on your behalf, and we do not broker or mediate connections to licensed immigration professionals for a fee."

---

## 5. Top 3 Legal Risks in Planned Features

### Risk #1: 행정사 Marketplace (P3)
**Severity: CRITICAL**

This is exactly what K-Visa was attacked for. 행정사법 Article 22(6) prohibits brokering 행정사 services for business.

**DO NOT:**
- Match users to specific 행정사 for fee
- Take commission from 행정사 per referral
- "Recommend" specific 행정사 based on user situation

**SAFE ALTERNATIVE:**
- Directory listing with advertising fees (not per-lead fees)
- User initiates contact; platform does not "connect"
- No curation, filtering, or "best match" algorithms

### Risk #2: HiKorea Integration / Appointment Sniper (P3)
**Severity: HIGH**

**Legal Issues:**
- 출입국관리법 79조의2: Representing foreigners in immigration matters
- HiKorea Terms of Service violation (automated scraping)
- Privacy liability (storing user credentials)

**SAFE ALTERNATIVE:**
- Notification service ONLY (check availability, send alert)
- User opens HiKorea in their own browser
- Never store, transmit, or act on user's HiKorea credentials

### Risk #3: AI Document Generation / Smart Document Builder
**Severity: HIGH**

The research document proposes "Income Translator Engine" and "AI Itinerary Architect" that auto-generate application documents. This risks:
- 행정사법 violation: "서류의 작성" (document preparation) is 행정사 exclusive domain
- 변호사법 violation if documents involve legal strategy

**SAFE ALTERNATIVE:**
- Provide templates and checklists (information)
- Do NOT auto-fill documents with user data
- User downloads blank template, fills it themselves
- Label as "Example format" not "Your completed document"

---

## 6. Safe Zone vs. Danger Zone Mapping

### GREEN ZONE (Safe to Operate)
- Pure information display (visa requirements, document lists)
- Deadline calculators and D-Day counters
- Checklists where user manually checks items
- Date calculations (183-day tracker with proper disclaimer)
- Selling information products (playbooks, guides, checklists)
- State tracking dashboard (user inputs their own status)
- General navigation and UI

### YELLOW ZONE (Proceed with Caution + Strong Disclaimers)
- Eligibility assessments (must NOT say "you are eligible")
- Quiz recommendations (must be framed as "requirement matching")
- Visa path visualization (must disclaim individual variation)
- Health/Preparation scores (must disclaim approval prediction)
- Any comparison tools

### RED ZONE (DO NOT DO)
- Filing applications on behalf of users
- Storing/using HiKorea credentials for users
- Brokering connections to 행정사 for fee
- Generating "completed" application documents with user data
- Stating "you will be approved" or "you are eligible"
- Providing personalized legal strategy advice
- Submitting anything to any government system on user's behalf

---

## 7. Safe Harbor Recommendations

### 7.1 Mandatory Disclaimer for EVERY Page

Add this text to the global footer (visible on every page):

> **LocalNomad is an information service. We are not a law firm, 행정사 office, or immigration agent. The information provided does not constitute legal advice. Visa decisions are made solely by Korean immigration authorities. Always verify current requirements with official sources.**

### 7.2 Pre-Quiz Consent Gate

Before quiz results display, require user acknowledgment:

> By clicking "View Results," I understand that:
> - This quiz matches my answers against publicly available requirements
> - It does not determine my actual eligibility
> - Only Korean immigration authorities can approve visa applications
> - LocalNomad is not providing legal advice or representation

### 7.3 Architectural Safeguards

1. **No "Submit" Buttons for Government Systems**
   - Never create a flow where LocalNomad submits anything to HiKorea or any embassy

2. **Template-Only Document Assistance**
   - Provide blank templates labeled "Example Format"
   - Never auto-fill with user's personal data

3. **Directory-Not-Marketplace for Professionals**
   - If listing 행정사, use advertising model only
   - No per-lead fees, no "matching," no recommendations

4. **User-Initiated Actions Only**
   - All final actions (booking, submission, contact) performed by user
   - Platform provides information; user takes action

---

## 8. The Legal Bright Line

### LocalNomad CAN:
- Display publicly available visa requirement information
- Provide tools that calculate dates, track deadlines, organize checklists
- Sell information products (guides, playbooks, templates)
- Run a quiz that matches user inputs to published requirements
- Display "Your answers match the requirements for [Visa X]"
- Provide general information about visa categories and transitions
- Offer consulting calls that provide general orientation (not case-specific legal advice)

### LocalNomad MUST NEVER:
- State "You are eligible for this visa" or "You will be approved"
- File any application or document on behalf of a user
- Store user credentials for government systems (HiKorea, etc.)
- Broker or mediate connections to 행정사 for per-transaction fees
- Generate "completed" application documents with user data auto-filled
- Provide case-specific legal strategy advice
- Represent users before immigration authorities in any capacity

---

## 9. Recommended Global Disclaimer

**Display this on EVERY page with visa-related content:**

> **Legal Notice:** LocalNomad provides general information about Korean visa requirements for educational purposes only. This information does not constitute legal advice and should not be relied upon as such. Visa eligibility and approval are determined solely by the Korean Ministry of Justice and immigration authorities. We do not represent users before any government agency. For personalized legal advice, consult a licensed Korean 행정사 (administrative scrivener) or 변호사 (attorney). Requirements change frequently; always verify with [Korea Immigration Service](https://www.immigration.go.kr) or [HiKorea](https://www.hikorea.go.kr).

---

## 10. Summary Action Items

### Immediate (Before Next Deploy)
1. Add global footer disclaimer to all pages
2. Change EligibilitySection language from "You may be eligible" to "Your answers match published requirements"
3. Add banner-style disclaimer to TOP of visa detail pages

### Short-Term (Within 2 Weeks)
4. Update Terms of Service with explicit 행정사법/변호사법 reference
5. Add pre-results consent gate to quiz flow
6. Ensure all bundles pages have "information product" disclaimer

### Before Launching New Features
7. Legal review required before: 행정사 marketplace, HiKorea integration, document generation tools
8. Architectural review to ensure no "submit on behalf of user" flows

---

## 11. Supplementary: Marketing Copy Legal Risks

*Added after cross-team review with First-Timer agent.*

### Risk #4: "12 visa types covered" — MEDIUM-HIGH
**Location:** `app/[lang]/[country]/visa/page.tsx:206`

**Problem:** 6 of the 12 listed visas are `isStub: true` (D-4, D-7, D-8, E-2, F-4, F-6) and render a "Coming Soon" stub page with no actual content. Claiming "12 visa types covered" is misleading under Korea's **표시광고법 (Fair Labeling and Advertising Act)** Article 3.

**Fix:** Change to "6 visa types covered" (non-stub count) or "12 visa types — 6 full guides, 6 coming soon."

### Risk #5: "500+ Nomads Helped" — MEDIUM
**Location:** `components/hero-section.tsx:176`

**Problem:** Unverifiable quantitative claim. Under 표시광고법, marketing claims with specific numbers should be substantiable. If actual user count is below 500, this is false advertising.

**Fix:** Either substantiate with real data, soften to "Helping nomads navigate Korea," or remove.

### Risk #6: "Based on official requirements" — LOW-MEDIUM
**Location:** `app/[lang]/[country]/visa/page.tsx:206`

**Problem:** "Official" implies government endorsement or real-time accuracy. Tensions with the legal disclaimer saying "for general guidance only."

**Fix:** Change to "Based on publicly available requirements."

### Risk #7: "Updated regularly" / "Updated Feb 2026" — LOW-MEDIUM
**Location:** `app/[lang]/[country]/visa/page.tsx:199-200, 206`

**Problem:** Creates a maintenance obligation. A hardcoded date becomes evidence of negligence if info goes stale.

**Fix:** Make date dynamic (pull from data source timestamp) or reframe: "Information as of Feb 2026 — always verify with official sources."

### Risk #8: E-7 FAQ "You have a grace period (usually 30 days)" — LOW
**Location:** `data/visas/en/e-7.json:184`

**Problem:** Leads with certainty ("You have") then qualifies with "usually." Should lead with uncertainty.

**Fix:** Reword to: "A grace period may be granted (typically 30 days, but varies by case). Confirm your specific grace period with immigration authorities."

---

### Updated Priority: Immediate Actions (Before Next Deploy)
1. Add global footer disclaimer to all pages
2. Change EligibilitySection language from "You may be eligible" to "Your answers match published requirements"
3. Add banner-style disclaimer to TOP of visa detail pages
4. **NEW:** Fix "12 visa types covered" → accurate count or honest breakdown
5. **NEW:** Substantiate or remove "500+ Nomads Helped"
6. **NEW:** Change "Based on official requirements" → "Based on publicly available requirements"

---

## 12. Supplementary: B2B Concierge Service Legal Risks

*Added after cross-team review with Resident agent — pricing discrepancy revealed separate service tier.*

LocalNomad has TWO pricing structures:
- **Consumer Bundles** (`app/[lang]/[country]/bundles/page.tsx`): $19/$39/$29/$69 — digital information products (GREEN)
- **B2B Concierge Services** (`components/pricing-section.tsx`): $150/$350/$150 — human services (YELLOW-RED)

### Risk #9: "Help prepare required paperwork" — MEDIUM-HIGH
**Location:** `components/pricing-section.tsx:86` (in $350 "14 days" tier)

**Problem:** If "paperwork" includes visa-related documents, "help prepare" is dangerously close to 행정사법 "서류의 작성" (document preparation) — an exclusive domain of licensed 행정사.

**Fix:** Change to "Checklist of required paperwork" or "Guidance on paperwork requirements."

### Risk #10: "In-person accompaniment (bank, government offices)" — MEDIUM
**Location:** `components/pricing-section.tsx:117` ($150 Custom Add-on tier)

**Problem:** Accompanying someone to government offices is generally safe as logistical support. However, if staff speaks on behalf of the foreigner at immigration offices, this approaches 출입국관리법 Article 79-2 (representation in immigration matters).

**Fix:** Add scope limitation: "Logistical and language support only. We do not represent you before government agencies or speak on your behalf in official proceedings."

### Risk #11: "1:1 onboarding call (includes unlimited Q&A)" — MEDIUM
**Location:** `components/pricing-section.tsx:40` ($150 "72 hours" tier)

**Problem:** If Q&A covers case-specific visa questions ("should I apply for E-7 or D-10 given my situation?"), this is personalized legal consultation for compensation — 변호사법 Article 109 risk.

**Fix:** Define scope: "General orientation about life in Korea. Does not include case-specific visa advice or immigration strategy."

### Required Disclaimer for Concierge Services Page:
> "Our concierge service provides general orientation and logistical support for settling in Korea. We do not provide legal advice, immigration representation, or document preparation services. For visa-specific guidance, consult a licensed 행정사 (administrative scrivener) or 변호사 (attorney)."

## 13. Implementation Sequencing (i18n Dependency)

*Added after cross-team review with Inspector agent.*

**Critical constraint:** `LegalDisclaimer.tsx` has zero i18n integration (no `useTranslations` import). All disclaimer text is hardcoded English. However, `messages/*.json` already has a `visa.disclaimer` key translated in all 3 locales (en/ja/zh-tw) that the component ignores.

**Legal implication:** An English-only disclaimer on a Japanese/Chinese page fails to effectively communicate to the user, which undermines its legal protective value. Deploying untranslated disclaimers to multilingual pages could create a worse legal position than having no disclaimer.

**Correct implementation order:**

| Step | Action | Blocks on i18n? | Do Now? |
|------|--------|-----------------|---------|
| 1 | Fix risky copy strings ("you appear to qualify" → "your answers match published requirements") | NO | YES — same-language replacement |
| 2 | Fix marketing claims ("12 visa types", "500+ Nomads", "official requirements") | NO | YES — factual corrections |
| 3 | Fix B2B service descriptions ("Help prepare paperwork" etc.) | NO | YES — same-language replacement |
| 4 | Migrate `LegalDisclaimer.tsx` to use `useTranslations` | NO — this IS the prerequisite | YES — unblocks steps 5-6 |
| 5 | Deploy LegalDisclaimer to 5+ components | YES — needs step 4 | AFTER step 4 |
| 6 | Add global footer disclaimer | YES — needs step 4 + footer locale fix | AFTER step 4 |

**Additional requirements for step 4:**
- Add new translation keys for QuizDisclaimer, IncomeDisclaimer, DayTrackerDisclaimer, and global footer disclaimer
- Have Japanese and Chinese disclaimer translations reviewed by native speakers for legal accuracy
- Existing `visa.disclaimer` translations are a starting point but insufficient for full disclaimer coverage

### Updated Priority: Immediate Actions (Before Next Deploy)

**Phase 1 — No i18n dependency (do immediately):**
1. Change "you appear to qualify" → "your answers match published requirements" (StepQualify.tsx, QuickEligibilityCheck.tsx, EligibilityQuiz.tsx)
2. Fix "12 visa types covered" → accurate count or honest breakdown
3. Substantiate or remove "500+ Nomads Helped"
4. Change "Based on official requirements" → "Based on publicly available requirements"
5. Change "Help prepare required paperwork" → "Checklist of required paperwork" (pricing-section.tsx)
6. Add concierge service disclaimer to pricing-section.tsx

**Phase 2 — Requires i18n migration first:**
7. Migrate `LegalDisclaimer.tsx` to use `useTranslations`
8. Add translated disclaimer keys to all locale files (en/ja/zh-tw)
9. Deploy LegalDisclaimer to DocumentChecklist, VisaComparisonTool, VisaDetailContent, EligibilityQuiz, Bundles page
10. Add global footer disclaimer (after footer locale fix)
11. Add StateDashboard self-reported disclaimer
12. Add disclaimer header to DocumentChecklist export function

---

**Conclusion:** LocalNomad is currently operating in a legally defensible space, but the K-Visa precedent shows that perception matters as much as legal compliance. Strengthening disclaimers, fixing misleading marketing claims, reframing B2B service descriptions, and maintaining clear architectural separation between "information provision" and "representation" will protect the platform as it scales. The Phase 1 copy fixes can and should be deployed immediately regardless of i18n status. The Phase 2 disclaimer deployment must wait for the LegalDisclaimer i18n migration. The planned P3 features (행정사 marketplace, HiKorea integration) require significant legal restructuring to proceed safely.
