# Taiwan Visa Dashboard — Product Specification

**Author:** CPO (Product)
**Date:** 2026-02-13
**Status:** Draft for CTO review
**Route:** `/[lang]/tw/visa/`

---

## 0. Legal Preamble

Taiwan's Immigration Act Section 56 explicitly regulates **consulting** and **document drafting** as licensed immigration business. Violations carry fines of NTD 200,000--1,000,000. The Attorney Regulation Act Section 127 further prohibits non-lawyers from providing legal advice for profit.

**Bright-line rules for Taiwan dashboard (stricter than Korea):**

- NO match scores, probability percentages, or "recommended" labels
- NO auto-fill of government forms (NIA, BOCA, MOL)
- NO storing of passport numbers or government credentials
- NO scraping of government status-tracking systems
- NO language suggesting eligibility determination ("you qualify", "you are eligible")
- Every tool/quiz/calculator MUST display: *"Based on published requirements. Not legal advice. Consult a licensed immigration professional for your specific situation."*

**Safe territory:**

- Display published requirements from government sources
- Requirement-matching filters (factual yes/no alignment)
- Date calculators (183-day counter, visa expiry countdown)
- Document checklists with tips
- General information guides with cited sources
- Comparison tables of published data

---

## 1. Taiwan User Personas

### 1.1 The Nervous Newcomer (불안한 신규 진입자)

| Attribute | Detail |
|-----------|--------|
| **Profile** | Language teachers, students, first-time expats, 20--30s |
| **Primary goal** | Secure legal stay (visitor visa, language study, English teaching ARC) |
| **Pain points** | Information overload; cannot find the right visa for their situation; overwhelmed by TECO authentication; mobile-first, needs simple UI |
| **Tech savvy** | Mobile-centric, prefers intuitive step-by-step flows |
| **Willingness to pay** | Low (prefers free information) |
| **Korea features that serve them** | Landing page situation picker, visa detail guides, document checklists, quiz (find your visa) |
| **Missing for Taiwan** | TECO authentication router (biggest pain point); multi-agency workflow explainer (BOCA vs NIA vs MOL confusion); visa run calculator for short-stay visitors |

### 1.2 The Gold Card Elite (고효율 추구 골드카드 엘리트)

| Attribute | Detail |
|-----------|--------|
| **Profile** | High-income professionals ($68K+/yr), tech workers, finance, academics |
| **Primary goal** | Maximize tax benefits, minimize time investment, family relocation |
| **Pain points** | "Why must I get my PhD diploma authenticated at a specific TECO office 3,000 miles away?"; processing time opacity; banking exclusion after arrival |
| **Tech savvy** | High; prefers logical, data-dense systems |
| **Willingness to pay** | High (time > money) |
| **Korea features that serve them** | Compare tool (side-by-side), path simulator (Gold Card to APRC), dashboard (progress tracking), D-Day counter |
| **Missing for Taiwan** | TECO authentication router (critical); 183-day tax residency tracker; post-arrival onboarding info (banking, NHI enrollment); Gold Card category explainer (11 professional fields) |

### 1.3 The Long-Hauler (안정을 추구하는 장기 거주자)

| Attribute | Detail |
|-----------|--------|
| **Profile** | 5+ year residents, APRC seekers, family settlers |
| **Primary goal** | Secure APRC, maintain residency requirements, avoid status loss |
| **Pain points** | "Did I meet the 183-day average this year?"; fear of law changes invalidating their status; complex multi-year residency tracking |
| **Tech savvy** | Varies; values data accuracy and legal certainty over UI polish |
| **Willingness to pay** | Medium (will pay for legal certainty) |
| **Korea features that serve them** | Dashboard (visa state tracking), D-Day counter, path simulator (current visa to APRC) |
| **Missing for Taiwan** | 183-day residency tracker (annual + multi-year averaging after 2026 Talent Act); APRC countdown with exit-day impact warnings; visa run calculator with re-entry risk assessment |

---

## 2. Taiwan Visa Types to Support

### Phase 1 — Full Guides (MVP)

| ID | Name | Category | Description | Priority |
|----|------|----------|-------------|----------|
| `gold-card` | Employment Gold Card | `work` | 4-in-1 card (work permit + visa + ARC + re-entry) for professionals in 11 fields. 1--3 year terms, renewable. Path to APRC. | **P0** |
| `dnv` | Digital Nomad Visa | `digital-nomad` | 6-month visitor visa for remote workers (extendable to 1 year). Income threshold: $20K (under 30) / $40K (30+). No local employment. No APRC credit. | **P0** |
| `work-arc` | Work ARC (Employment Permit) | `work` | Standard employment permit tied to a sponsoring employer. 1--3 year terms. Requires MOL work permit + NIA ARC. | **P0** |
| `visitor` | Visitor Visa | `visitor` | Short-stay visa (30--90 days). Covers tourism, business visits, visa-exempt entry. No work permitted. | **P0** |

### Phase 2 — Full Guides

| ID | Name | Category | Description | Priority |
|----|------|----------|-------------|----------|
| `entrepreneur` | Entrepreneur Visa | `business` | For startup founders with VC investment, incubator admission, or patents. Complex multi-agency process. | **P1** |
| `student` | Student Visa (ARC) | `study` | For enrolled students at Taiwanese universities or language centers. | **P1** |
| `aprc` | APRC (Permanent Residence) | `residence` | Permanent residency. Requires 5 years continuous residence (or 3 years for Gold Card, 1 year for Global Elite). 183-day average rule applies. | **P1** |

### Phase 3 — Stubs (Coming Soon)

| ID | Name | Category | Priority |
|----|------|----------|----------|
| `plum-blossom` | PLUM Blossom Card | `residence` | **P2** |
| `dependent-arc` | Dependent ARC | `family` | **P2** |
| `seeking-employment` | Job Seeking Visa | `job-seeking` | **P2** |
| `missionary` | Missionary/Religious Worker Visa | `work` | **P3** |
| `retirement` | Retirement Visa | `residence` | **P3** |
| `working-holiday` | Working Holiday Visa | `working-holiday` | **P2** |

### Taiwan VisaType Definition (for `lib/visa/types.ts`)

```typescript
export type TaiwanVisaType =
  | "gold-card"
  | "dnv"
  | "work-arc"
  | "visitor"
  // Phase 2
  | "entrepreneur"
  | "student"
  | "aprc"
  // Stubs
  | "plum-blossom"
  | "dependent-arc"
  | "seeking-employment"
  | "missionary"
  | "retirement"
  | "working-holiday-tw";
```

---

## 3. Feature Matrix: Korea vs Taiwan

| Feature | Korea (Current) | Taiwan (Planned) | Difference & Why |
|---------|----------------|-----------------|------------------|
| **Landing Page** | Situation-based picker ("I have a job offer" -> E-7). 6 primary + 6 secondary situations. | Same pattern, adapted for Taiwan situations ("I want to work remotely" -> DNV, "I'm a specialist" -> Gold Card). 4 primary + 3 secondary initially. | Fewer visa types at launch. Taiwan situations emphasize Gold Card and DNV since these are the primary draw for foreign professionals. |
| **Quiz / Finder** | Step-by-step quiz (nationality -> status -> goal -> background). Results show match levels: "Strong Match", "Moderate Match", "Possible Option". Uses `MatchLevel` type. | **Redesigned as "Requirement Filter"** (see Section 5). No match levels. Results show factual alignment only: Met / Not Met / Review Needed. No "Closest Match" or "Other Options" framing. | **Legal constraint.** Taiwan Immigration Act S.56 treats algorithmic visa recommendation as "consulting." Korea's quiz uses `MatchLevel` which implies assessment. Taiwan version must be purely informational — a checklist filter, not a recommendation engine. |
| **Compare** | Side-by-side comparison table. Attributes: duration, fees, income requirements, work permission, processing time, APRC eligibility. | Same architecture. New attributes: issuing agency (BOCA/NIA/MOL), TECO authentication required (yes/no), tax residency impact, spouse work rights. | Taiwan has more agencies involved. Comparison must show which agency handles what. Also highlight the critical DNV caveat: no APRC credit despite long stay. |
| **Path Simulator** | Visual path map showing transitions (e.g., D-10 -> E-7 -> F-2). Uses `VisaTransitionPath` type with requirements, timeline, documents. | Same architecture. Taiwan paths: Visitor -> DNV, DNV -> Gold Card (requires leaving and re-entering on different status), Work ARC -> APRC (5yr), Gold Card -> APRC (3yr or 1yr Global Elite). | Taiwan paths are more linear but have critical "dead ends" that Korea lacks. DNV explicitly does NOT count toward APRC. Must clearly visualize these dead ends without "advising" against them. |
| **Checklist** | Per-visa document checklist with categories, difficulty ratings, tips, validity periods. Uses `ChecklistDocument` type. | Same architecture. Taiwan checklists add: TECO authentication status per document, issuing jurisdiction field, agency-specific form numbers. New document category: `authentication`. | Taiwan's TECO authentication requirement is the biggest UX differentiator. Each document needs a sub-checklist: (1) obtain original, (2) notarize/apostille in home country, (3) send to correct TECO, (4) receive authenticated copy. |
| **Dashboard** | State machine (NO_VISA -> PREPARING -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> ACTIVE -> EXPIRING -> EXPIRED). Health score. D-Day counter. Next actions. | Same state machine. Additional states for Taiwan: `TECO_PENDING` (documents at TECO), `MULTI_AGENCY` (ping-ponging between BOCA/MOL/NIA). New dashboard widgets: 183-day tax tracker, visa run countdown. | Taiwan's multi-agency process requires a more granular state machine. The "whose court is the ball in?" visualization from the research is a key UX innovation. |
| **Detail Pages** | Full visa guide: eligibility, documents, application steps, FAQs, community tips, renewal info, paths to/from. Uses `VisaInfo` type. | Same structure. Taiwan additions: issuing agency callout, TECO authentication section, processing timeline with community-reported real durations vs official estimates. | Taiwan processing times diverge significantly from official estimates (research shows 55+ days real vs 30 days official for Gold Card). Community data callouts are critical for trust. |
| **Legal Disclaimer** | `LegalDisclaimer` component with variants: box, inline, quiz-specific, income-specific. References Korean 행정사법, 변호사법. | New `TaiwanLegalDisclaimer` variant. References Taiwan Immigration Act S.56 and Attorney Regulation Act S.127. Stronger language: "This platform does not provide immigration consulting services as defined under Taiwan law." | Stricter disclaimer needed. Taiwan law explicitly covers "consulting" AND "document drafting" unlike Korea which focuses on 행정사 proxy filing. |

---

## 4. Taiwan-Only Features (NEW)

### 4.1 TECO Authentication Router

**Problem:** Taiwan is not an Apostille Convention member. All foreign documents must be legalized by the TECO office with jurisdiction over the issuing institution. Users frequently send documents to the wrong TECO and get rejected.

**Feature Spec:**

```
Input:  Document type (degree, criminal record, employment letter)
        Issuing institution (e.g., "University of Washington")
        Issuing state/country (e.g., "Washington, USA")

Output: - Correct TECO office with jurisdiction
        - TECO office address, phone, hours
        - Required forms (PDF links to official TECO site)
        - Estimated processing time (official + community-reported)
        - Mailing instructions (if applicable)
        - Estimated cost
        - Checklist: what to include in the envelope
```

**Data model:**

```typescript
interface TECOOffice {
  id: string;
  name: string;              // "Taipei Economic and Cultural Office in Houston"
  jurisdiction: string[];     // ["Texas", "Oklahoma", "Arkansas", ...]
  address: string;
  phone: string;
  email?: string;
  hours: string;
  website: string;
  processingTime: {
    official: string;         // "10-15 business days"
    communityReported: string; // "3-4 weeks"
  };
  acceptsMail: boolean;
  mailingInstructions?: string;
}

interface AuthenticationRoute {
  documentType: string;
  issuingJurisdiction: string;  // state or country
  tecoOffice: TECOOffice;
  requiredItems: string[];
  estimatedCost: string;
  tips: string[];
}
```

**Legal safety:** This is purely informational (mapping publicly available jurisdiction data). It does not fill forms or submit applications. Safe under S.56.

**UI:** Step-by-step wizard. User selects document type -> enters institution -> system displays the routing. Include a map showing TECO office locations.

**Component:** `components/visa/tw/teco-router.tsx`

### 4.2 Multi-Agency Workflow Map

**Problem:** Taiwan visa applications involve up to 3 agencies (BOCA for entry visa, MOL for work permit, NIA for ARC/APRC). Users don't know which agency they're dealing with at each step.

**Feature Spec:**

Per visa type, display a visual workflow showing:

```
[BOCA]          [MOL]           [NIA]
Entry Visa  ->  Work Permit ->  ARC Issuance
(Abroad)        (if needed)     (In Taiwan)
```

Each node shows:
- Agency name and role
- Documents required at this step
- Estimated duration
- Current status indicator (for dashboard users)

**Data model:**

```typescript
interface AgencyStep {
  agency: "BOCA" | "MOL" | "NIA" | "TECO" | "GoldCardOffice";
  agencyName: string;
  role: string;               // "Entry visa issuance"
  location: "abroad" | "taiwan";
  documentsRequired: string[];
  estimatedDuration: string;
  officialUrl: string;
  order: number;
}

interface VisaWorkflow {
  visaType: TaiwanVisaType;
  steps: AgencyStep[];
  notes: string[];
}
```

**Legal safety:** Displays publicly available procedural information. No consulting or form-filling. Safe under S.56.

**UI:** Horizontal swimlane diagram (mobile: vertical). Color-coded by agency. Clickable nodes expand to show documents and tips.

**Component:** `components/visa/tw/agency-workflow.tsx`

### 4.3 183-Day Tax Residency Tracker

**Problem:** Taiwan's tax system has a critical 183-day threshold. Below 183 days: flat 18% non-resident tax on Taiwan-source income. At/above 183 days: progressive resident rates (5--40%) with deductions. For APRC seekers, the 2026 Talent Act changed the requirement from "183 days every year" to "183-day average across qualifying years."

**Feature Spec:**

```
Input:  User manually logs entry/exit dates (stored locally in browser, NOT on server)

Output: - Days in Taiwan this calendar year (running total)
        - Days remaining to hit 183
        - Projected date to hit 183 at current pace
        - Multi-year average (for APRC tracking)
        - Warning: "If you leave Taiwan for X days, you will not reach 183 this year"
        - Tax rate comparison: resident vs non-resident at current trajectory
```

**Data model:**

```typescript
interface TravelEntry {
  id: string;
  entryDate: string;     // ISO date
  exitDate?: string;     // ISO date, null if currently in Taiwan
  purpose?: string;
}

interface ResidencyCalculation {
  year: number;
  daysInTaiwan: number;
  daysRemaining: number;  // to reach 183
  projectedDate183?: string;
  isResident: boolean;
  averageOverYears?: number;  // for multi-year APRC calculation
}
```

**Legal safety:** This is a date calculator using user-provided data. It does not access government systems or determine eligibility. The tax rate comparison shows published rates only. Disclaimer: "Tax calculations are estimates based on published rates. Consult a tax professional for your specific situation."

**Privacy:** All data stored in `localStorage` only. No server-side storage. No PII transmitted.

**UI:** Calendar view with entry/exit markers. Running counter prominently displayed. Year-over-year trend chart for APRC seekers.

**Component:** `components/visa/tw/tax-residency-tracker.tsx` (client component)

### 4.4 Visa Run Calculator

**Problem:** Visitor visa holders and visa-exempt entrants must leave Taiwan before their stay expires. They perform "visa runs" (typically to Hong Kong, Japan, Manila) but worry about re-entry denial due to frequent exits/entries.

**Feature Spec:**

```
Input:  Current visa/entry type (visa-exempt, visitor visa, DNV)
        Entry date
        Allowed stay duration (auto-populated from visa type)

Output: - Days remaining in current stay
        - Countdown with urgency indicators
        - Checklist for re-entry: return ticket, hotel booking, sufficient funds
        - General information about re-entry patterns (factual, no advice)
        - Links to official NIA overstay penalty information
```

**Data model:**

```typescript
interface VisaRunStatus {
  entryType: "visa-exempt" | "visitor-visa" | "dnv";
  entryDate: string;
  maxStayDays: number;
  lastDay: string;           // calculated
  daysRemaining: number;     // calculated
  urgency: "low" | "medium" | "high" | "critical";
  reentryChecklist: string[];
}
```

**Legal safety:** Date calculator with published stay durations. Does not advise on whether to perform visa runs or assess re-entry likelihood. Disclaimer: "Entry decisions are at the discretion of immigration officers. This calculator shows published maximum stay durations only."

**UI:** Prominent countdown. Red/amber/green status. Expandable checklist for re-entry preparation.

**Component:** `components/visa/tw/visa-run-calculator.tsx` (client component)

---

## 5. Quiz Redesign for Taiwan: "Requirement Filter"

### Design Principles

The Korea quiz uses `MatchLevel` ("Strong Match", "Moderate Match", "Possible Option") which could be interpreted as consulting under Taiwan law. The Taiwan version must be a **factual requirement filter** — it checks user-provided answers against published requirements and shows alignment, nothing more.

**Key differences from Korea quiz:**

| Aspect | Korea Quiz | Taiwan Requirement Filter |
|--------|-----------|--------------------------|
| Results framing | "Your Visa Recommendations" | "Requirement Alignment Results" |
| Scoring | Strong/Moderate/Possible match levels | Met / Not Met / Review Needed (per requirement) |
| Ranking | Sorted by match quality ("Closest Match") | Alphabetical or by category. No ranking. |
| CTA | "Start Preparing" (implies recommendation) | "View Full Requirements" (neutral) |
| Language | "Based on your answers, here are the visas that may fit" | "Below is how your answers align with published requirements for each visa type" |

### Step-by-Step Flow

**Step 1: Purpose of Visit**

```
What brings you to Taiwan?
- [ ] Remote work for a foreign employer
- [ ] Employment with a Taiwanese company
- [ ] Starting a business
- [ ] Studying
- [ ] Short-term visit / tourism
- [ ] Long-term residence
```

**Step 2: Background Information**

(Conditional questions based on Step 1 selection)

```
For "Remote work":
  - What is your annual income? [number input, USD]
  - Are you from a visa-exempt country? [yes/no]
  - Are you over or under 30? [over/under]

For "Employment with a Taiwanese company":
  - Do you have a job offer? [yes/no]
  - What is your field? [dropdown: tech, finance, education, science, etc.]
  - What is your monthly salary? [number input, NTD]
  - Highest education level? [dropdown]
  - Years of experience? [dropdown]

For "Long-term residence":
  - What is your current visa status? [dropdown]
  - How many years have you lived in Taiwan? [number]
  - Do you meet the 183-day annual average? [yes/no/unsure]
```

**Step 3: Document Readiness** (optional, can skip)

```
Do you have the following?
- [ ] Criminal background check from home country
- [ ] Documents authenticated by TECO
- [ ] Health examination certificate
- [ ] Proof of financial means
```

**Step 4: Results — Requirement Alignment**

For each applicable visa type, show a per-requirement breakdown:

```
-----------------------------------------------
EMPLOYMENT GOLD CARD
-----------------------------------------------
Published Requirements          Your Answer    Status
------------------------------------------------------
Monthly income >= NTD 160K      NTD 200K       [checkmark] Met
Professional field listed       Technology     [checkmark] Met
Criminal record check           Not ready      [warning] Review needed
TECO authentication             Not started    [warning] Review needed
------------------------------------------------------

[View Full Gold Card Guide ->]

-----------------------------------------------
DIGITAL NOMAD VISA
-----------------------------------------------
Published Requirements          Your Answer    Status
------------------------------------------------------
Annual income >= $40K (30+)     $65,000        [checkmark] Met
From visa-exempt country        Yes            [checkmark] Met
Remote employment proof         --             [warning] Review needed
------------------------------------------------------

[View Full DNV Guide ->]
```

**NO overall score. NO ranking. NO "recommended" label.**

Each visa card has equal visual weight. The only differentiation is the count of Met vs Not Met requirements, which the user can see for themselves.

### TypeScript Types

```typescript
// Replace MatchLevel with requirement-level alignment
export type RequirementStatus = "met" | "not-met" | "review-needed";

export interface RequirementAlignment {
  requirementId: string;
  requirementLabel: string;
  publishedThreshold: string;
  userValue: string | null;
  status: RequirementStatus;
}

export interface VisaAlignmentResult {
  visaType: TaiwanVisaType;
  visaName: string;
  requirements: RequirementAlignment[];
  metCount: number;
  notMetCount: number;
  reviewCount: number;
}

// Taiwan quiz answers (different from Korea QuizAnswers)
export interface TaiwanFilterAnswers {
  purpose?: "remote-work" | "employment" | "business" | "study" | "visit" | "long-term";
  annualIncome?: number;
  incomeCurrency?: "USD" | "NTD";
  isVisaExemptCountry?: boolean;
  ageRange?: "under-30" | "30-plus";
  hasJobOffer?: boolean;
  professionalField?: string;
  monthlySalary?: number;
  education?: "high-school" | "bachelors" | "masters" | "phd";
  workExperience?: "0-2" | "2-5" | "5-10" | "10+";
  currentVisaStatus?: string;
  yearsInTaiwan?: number;
  meets183DayAverage?: boolean | null;
  hasCriminalCheck?: boolean;
  hasTecoAuth?: boolean;
  hasHealthExam?: boolean;
  hasFinancialProof?: boolean;
}
```

### Component Architecture

```
components/visa/tw/
  filter/
    TaiwanVisaFilter.tsx        # Main filter container (client component)
    FilterStep.tsx              # Individual step renderer
    FilterProgress.tsx          # Step progress bar
    AlignmentResults.tsx        # Results display (no ranking)
    RequirementRow.tsx          # Single requirement alignment row
    index.ts                    # Barrel export
```

---

## 6. Information Architecture

### Route Structure

```
app/[lang]/tw/visa/
  page.tsx                      # Landing page (situation picker)
  find/
    page.tsx                    # Requirement Filter (Taiwan quiz)
  compare/
    page.tsx                    # Side-by-side comparison
  path/
    page.tsx                    # Path simulator
  checklist/
    page.tsx                    # Checklist hub (select visa type)
    [type]/
      page.tsx                  # Per-visa checklist
  dashboard/
    page.tsx                    # Personal progress dashboard
  tools/
    page.tsx                    # Taiwan-specific tools hub
    teco-router/
      page.tsx                  # TECO Authentication Router
    tax-tracker/
      page.tsx                  # 183-Day Tax Residency Tracker
    visa-run/
      page.tsx                  # Visa Run Calculator
  [type]/
    page.tsx                    # Visa detail page (gold-card, dnv, etc.)
```

### Shared vs Country-Specific Components

```
components/visa/                # Shared (Korea + Taiwan)
  LegalDisclaimer.tsx           # Add TaiwanDisclaimer variant
  DDayCounter.tsx               # Reuse as-is
  DocumentChecklist.tsx         # Reuse as-is (data-driven)
  VisaComparisonTool.tsx        # Reuse as-is (data-driven)
  StateTimeline.tsx             # Reuse with extended states
  dashboard/                    # Reuse DashboardClient, HealthScoreCard
  path/                         # Reuse visa-path-simulator
  landing/                      # Reuse SituationGrid, SituationTile
  detail/                       # Reuse ApplicationProcess, EligibilitySection

components/visa/tw/             # Taiwan-only
  filter/                       # Requirement Filter (replaces quiz for TW)
  teco-router.tsx               # TECO Authentication Router
  agency-workflow.tsx           # Multi-Agency Workflow Map
  tax-residency-tracker.tsx     # 183-Day Tracker
  visa-run-calculator.tsx       # Visa Run Calculator
  TaiwanLegalDisclaimer.tsx     # Taiwan-specific disclaimer text
  index.ts                      # Barrel export
```

### Data Structure

```
data/visas/
  en/                           # Korea visa data (existing)
    d-10.json
    e-7.json
    ...
  tw/
    en/                         # Taiwan visa data - English
      gold-card.json
      dnv.json
      work-arc.json
      visitor.json
      ...
    ja/                         # Taiwan visa data - Japanese
      ...
    zh-tw/                      # Taiwan visa data - Traditional Chinese
      ...
  tw-teco/                      # TECO office directory
    offices.json                # All TECO offices with jurisdictions
    jurisdiction-map.json       # State/country -> TECO office mapping
```

### i18n Keys

New namespace: `visa.tw.*` in `messages/{lang}.json`

```
visa.tw.pageTitle: "Taiwan Visa Guide"
visa.tw.filterTitle: "Check Requirement Alignment"
visa.tw.filterDisclaimer: "This tool checks..."
visa.tw.tecoRouterTitle: "Find Your TECO Office"
visa.tw.taxTrackerTitle: "183-Day Residency Tracker"
visa.tw.visaRunTitle: "Stay Duration Calculator"
visa.tw.agencyBOCA: "Bureau of Consular Affairs"
visa.tw.agencyMOL: "Ministry of Labor"
visa.tw.agencyNIA: "National Immigration Agency"
visa.tw.situation*: (situation picker labels)
```

---

## 7. Phased Rollout Plan

### Phase 1 — MVP (Weeks 1--4)

**Goal:** Establish Taiwan section with core information architecture. Ship enough value to validate demand.

**Deliverables:**

| Item | Description | Components |
|------|-------------|------------|
| Landing page | Situation-based picker for 4 visa types (Gold Card, DNV, Work ARC, Visitor) | Reuse `SituationGrid`, `SituationTile` |
| 4 full visa guides | Detail pages for gold-card, dnv, work-arc, visitor | Reuse `VisaDetailContent`, `ApplicationProcess` |
| Checklist | Per-visa document checklists with TECO auth status | Reuse `ChecklistPage`, `ChecklistItem` |
| Compare | Side-by-side comparison of 4 visa types | Reuse `VisaComparisonTool` |
| Legal disclaimer | Taiwan-specific disclaimer component | New `TaiwanLegalDisclaimer` |
| Data files | 4 visa JSON files (en, ja, zh-tw = 12 files) | New data in `data/visas/tw/` |
| i18n | Taiwan-specific translation keys | Update `messages/*.json` |

**Estimated effort:** 2 engineers, 4 weeks

**Success metric:** 500+ unique visitors/month to `/*/tw/visa/` within 60 days of launch

### Phase 2 — Interactive Tools (Weeks 5--8)

**Goal:** Add the tools that differentiate LocalNomad from government websites.

**Deliverables:**

| Item | Description | Components |
|------|-------------|------------|
| Requirement Filter | Taiwan quiz (no scores, factual alignment only) | New `TaiwanVisaFilter` |
| Path Simulator | Visual path: Visitor -> DNV -> Gold Card -> APRC | Reuse `visa-path-simulator` with Taiwan data |
| TECO Router | Authentication routing wizard | New `teco-router.tsx` |
| Multi-Agency Workflow | Visual workflow per visa type | New `agency-workflow.tsx` |
| 3 stub pages | Entrepreneur, Student, APRC (coming soon) | Reuse `VisaStubPage` |

**Estimated effort:** 2 engineers, 4 weeks

**Success metric:** 20%+ of landing page visitors reach Requirement Filter; TECO Router gets 100+ uses/month

### Phase 3 — Dashboard & Trackers (Weeks 9--14)

**Goal:** Personal tracking tools that drive repeat visits and create habit loops.

**Deliverables:**

| Item | Description | Components |
|------|-------------|------------|
| Dashboard | Personal visa progress tracker (state machine, D-Day, next actions) | Reuse `DashboardClient` with Taiwan states |
| 183-Day Tracker | Tax residency day counter with multi-year averaging | New `tax-residency-tracker.tsx` |
| Visa Run Calculator | Stay duration countdown with re-entry checklist | New `visa-run-calculator.tsx` |
| Phase 2 visa guides | Full guides for Entrepreneur, Student, APRC | New data + reuse detail components |

**Estimated effort:** 2 engineers, 6 weeks

**Success metric:** 500+ dashboard users (signed up); 183-day tracker daily active users > 50

### Phase 4 — Expansion (Weeks 15+)

**Goal:** Complete coverage and community features.

**Deliverables:**

| Item | Description |
|------|-------------|
| Remaining visa stubs to full guides | PLUM Blossom, Dependent ARC, Job Seeking, Working Holiday |
| Community tips integration | User-submitted processing timelines, TECO reviews |
| Post-arrival onboarding | Banking guide, NHI enrollment, tax registration information |
| SEO content | Long-form guides: "Gold Card Application Step by Step", "Taiwan vs Korea for Digital Nomads" |

**Success metric:** Full organic search coverage for "taiwan gold card", "taiwan digital nomad visa", "taiwan work permit" queries

---

## 8. Technical Dependencies & Risks

### Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| Country routing (`[country]` param supports `tw`) | CTO | Needs verification — currently `generateStaticParams` in `find/page.tsx` only generates for `country === "korea"` |
| `TaiwanVisaType` added to type system | CTO | New — must coexist with Korea `VisaType` |
| TECO office data sourced and structured | Research | New — requires manual compilation from TECO websites |
| Taiwan visa JSON data authored | CPO + Research | New — 4 files x 3 languages = 12 files for Phase 1 |
| `zh-tw` locale fully supported | CTO | Partially done (locale exists in i18n config) |

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Taiwan quiz crosses into "consulting" | **Blocker** | Legal review before launch. Requirement Filter design removes all subjective assessment. Every output cites source regulation. |
| TECO jurisdiction data becomes stale | **Warning** | TECO offices rarely change. Manual review quarterly. Display "last verified" date. |
| 183-day tracker stores PII on server | **Blocker** | Architecture decision: localStorage only. No server-side travel data storage. |
| Visa regulations change mid-build | **Warning** | All data in JSON files, not hardcoded. Quick update cycle. Display `lastUpdated` prominently. |
| Component reuse breaks for Taiwan-specific fields | **Warning** | Extend existing interfaces with optional Taiwan fields rather than forking components. Use conditional rendering. |

---

## 9. Open Questions for CTO

1. **Type system strategy:** Should `TaiwanVisaType` be a separate union type, or should we create a unified `VisaType` with country prefix (e.g., `"tw-gold-card"`)? The current Korea types use short codes (`"e-7"`, `"d-10"`) that could collide if Taiwan uses similar codes.

2. **Data loader architecture:** Current `lib/visa/` loaders are Korea-specific. Do we want a generic `loadVisaData(country, type, locale)` function, or country-specific loaders?

3. **Component strategy:** For the Requirement Filter, should we build it as a completely new component tree under `components/visa/tw/filter/`, or refactor the existing quiz to accept a `mode: "quiz" | "filter"` prop?

4. **Route generation:** The current `generateStaticParams` in several pages has `if (country === "korea")` guards. What is the preferred approach to extend this — a config-driven list of countries with visa support?

5. **localStorage encryption:** For the 183-day tracker, should we encrypt travel dates in localStorage, or is plain storage acceptable given it never leaves the browser?

---

*This document is a living specification. All features must pass Legal review before implementation. No feature should ship without the Taiwan-specific disclaimer.*
