# Cycle 3 -- Final Legal Compliance Audit

**Date**: 2026-02-12
**Commit**: de5309c
**Scope**: Korean law compliance -- 행정사법 (Administrative Scrivener Act), 변호사법 (Attorney Act), 표시광고법 (Fair Labeling & Advertising Act)
**Auditor**: Legal compliance review agent (Cycle 3)

## Overall Status: YELLOW

The codebase has made significant progress since Cycle 1. Most critical legal risks identified in previous audits have been addressed. Remaining issues are moderate-severity gaps rather than blocking violations.

---

### Risk Matrix

| Area | Status | Finding |
|------|--------|---------|
| Marketing Claims | YELLOW | Testimonials use unverifiable names; "Save 40+ Hours" claim unsubstantiated |
| Quiz Language | GREEN | Consent gate present, match-level language used, disclaimers in place |
| Footer Disclaimer | GREEN | Present on all pages, references 행정사 and 변호사, translated to all locales |
| Export Disclaimer | GREEN | Both checklist components include disclaimer before/in export |
| Legal Pages | GREEN | Terms reference 행정사법 and 변호사법 explicitly, service limitation clause present |
| Statistics | GREEN | Uses verifiable data (visa count from code, "official requirements"), no inflated numbers |
| Path Simulator | GREEN | Disclaimer always visible at top, references official sources |
| Dashboard | GREEN | Explicit disclaimer: "not connected to HiKorea or any government system" |
| Onboarding Wizard | YELLOW | No consent gate or legal disclaimer before creating progress |
| Visa Detail (Legacy) | YELLOW | No legal disclaimer present on the old VisaDetailContent component |

---

### Detailed Findings

#### 1. Marketing Claims

**1.1 YELLOW -- Unverifiable testimonials**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/sections/social-proof-section.tsx`, lines 6-28
- **Exact text**:
  - `"Sarah M." / "UX Designer, Remote"` -- "The neighborhood guide saved me weeks of research..."
  - `"James K." / "Software Engineer"` -- "The visa dashboard was a lifesaver..."
  - `"Maria L." / "Content Creator"` -- "Finally, accurate information about Korea!..."
- **Issue**: Under 표시광고법 (Fair Labeling & Advertising Act), testimonials used in marketing must be genuine and verifiable. Using fabricated or unverifiable testimonial names with specific professional titles creates a misleading impression. All three testimonials have 5-star ratings, which compounds the concern.
- **Risk**: Moderate. If these testimonials are fabricated, this violates Article 3 of 표시광고법 (prohibition of deceptive advertising). If real, they should be attributable.
- **Suggested fix**: Either (a) use real testimonials with verifiable attribution (full names with consent, or linked social profiles), or (b) remove testimonials entirely, or (c) add a qualifier such as "Names have been changed for privacy" if based on real feedback.

**1.2 YELLOW -- "Save 40+ Hours" claim**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/sections/why-section.tsx`, line 24
- **Exact text**: `"Save 40+ Hours"` and `"Skip the endless research rabbit holes. Get straight to the answers with our curated, actionable guides."`
- **Issue**: The "40+ hours" claim is unsubstantiated. Under 표시광고법, quantitative marketing claims should be backed by reasonable evidence.
- **Risk**: Low-moderate. This is a common marketing pattern, but without any basis or qualifier (e.g., "based on user surveys" or "estimated"), it could be challenged.
- **Suggested fix**: Either substantiate the claim or soften to "Save dozens of hours" or add "estimated" qualifier.

**1.3 GREEN -- FAQ refund claim**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/sections/faq-section.tsx`, line 35
- **Exact text**: `"We offer a 7-day money-back guarantee on all digital products."`
- **Issue**: This is a factual business claim, not a legal claim. Acceptable as long as the actual refund policy matches. The footer links to a refund policy page.
- **No action needed** as long as the refund policy page matches this claim.

**1.4 GREEN -- Service descriptions**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/sections/services-detail-section.tsx`
- The Visa Dashboard service card (line 46) uses language "Navigate Korean visa requirements" and "Step-by-step checklists" / "Document requirements" -- all informational, not claiming to provide filing or legal services.
- **No action needed.**

**1.5 GREEN -- Home page and country hub**
- **Files**: `app/[lang]/page.tsx`, `app/[lang]/[country]/page.tsx`
- Both pages use neutral language. "Explore" CTAs. Country hub describes "Visa Guide" as an information service. No claims of guaranteed outcomes or eligibility determination.
- **No action needed.**

---

#### 2. Quiz & Results Language

**2.1 GREEN -- EligibilityQuiz consent gate**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/EligibilityQuiz.tsx`, lines 326-376
- **Implementation**: A consent gate (`showConsentGate`) is triggered after the last question. The checkbox text reads:
  > "I understand this tool matches my answers against published requirements and does not determine my eligibility. Final decisions are made by Korean immigration authorities."
- Results are only shown when `consentGiven` is true (line 366: `disabled={!consentGiven}`).
- **No action needed.**

**2.2 GREEN -- EligibilityQuiz results language**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/EligibilityQuiz.tsx`, lines 392-394
- **Results header**: `"Your Results"` with subtitle `"Visas with matching requirements include..."`
- **Match badge**: Line 432: `"Closest requirement match"` (not "you qualify" or "you are eligible")
- **Match bar label**: Line 443: `"Match Score"` (not "eligibility score")
- **No action needed.**

**2.3 GREEN -- VisaFinder / QuizResults**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/quiz/QuizResults.tsx`
- Header text (line 78): `"Based on your answers, here are the visas that may fit your situation"` -- uses "may fit," not "you qualify."
- Match levels use: `"Strong Match" / "Moderate Match" / "Possible Option"` with descriptions like `"Appears to meet published requirements"` and `"May meet requirements with some conditions"` (lines 29-47).
- Top pick label: `"Closest Match"` (line 86).
- **QuizDisclaimer component** rendered at bottom (line 152).
- **No action needed.**

**2.4 GREEN -- EligibilitySection and QuickEligibilityCheck**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/detail/EligibilitySection.tsx`, line 156
  - Result text: `"Your answers align with published requirements"` (not "you qualify").
  - Disclaimer: `"This is a preliminary check. Final eligibility is determined by Korean immigration authorities."`
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/detail/QuickEligibilityCheck.tsx`, line 132
  - Result text: `"Your answers match published requirements"` (not "you are eligible").
  - Disclaimer (line 158): `"This is a preliminary check based on publicly available requirements. Final eligibility is determined by Korean immigration authorities."`
- **No action needed.**

**2.5 GREEN -- StepQualify (Journey page)**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/journey/steps/StepQualify.tsx`, line 98
- Result text: `"Your answers match the published requirements for this visa."` (match language, not eligibility determination).
- Negative result (line 99): `"Based on your answers, your profile may not match all published requirements."`
- Disclaimer (lines 150-156): `"This is a preliminary check. Final eligibility is determined by Korean immigration authorities."`
- **No action needed.**

---

#### 3. Footer Disclaimer

**3.1 GREEN -- Global footer disclaimer present**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/footer.tsx`, lines 93-98
- Renders `{t("footer.legalDisclaimer")}` inside a dedicated disclaimer section.
- **English text** (from `messages/en.json`, line 371):
  > "LocalNomad provides general information about Korean visa requirements for educational purposes only. This information does not constitute legal advice. Visa decisions are made solely by Korean immigration authorities. For personalized legal advice, consult a licensed Korean 행정사 (administrative scrivener) or 변호사 (attorney)."
- This text references both 행정사 and 변호사 directly.

**3.2 GREEN -- Footer appears on every page**
- The `Footer` component is rendered in `app/[lang]/page.tsx` (line 71), `app/[lang]/[country]/page.tsx` (line 85), and legal pages (`app/(legal)/terms/page.tsx` line 172, `app/(legal)/privacy/page.tsx` line 164).
- Note: The layout file (`app/[lang]/layout.tsx`) does NOT render Footer globally -- each page includes it individually. This means pages that omit Footer will miss the disclaimer. However, all audited pages include it.

**3.3 GREEN -- Footer disclaimer is translated**
- **Japanese** (`messages/ja.json`, line 371): Fully translated, references 行政書士(행정사) and 弁護士(변호사).
- **Traditional Chinese** (`messages/zh-tw.json`, line 371): Fully translated, references 行政書士(행정사) and 律師(변호사).
- **No action needed.**

---

#### 4. Document Checklist Disclaimer

**4.1 GREEN -- DocumentChecklist export disclaimer**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/DocumentChecklist.tsx`, lines 282-285
- Export text begins with:
  > "DISCLAIMER: This checklist is for personal reference only and does not constitute legal advice. Verify all requirements with Korean immigration authorities (immigration.go.kr) before applying."
- This appears as the first lines of the exported text file.
- **No action needed.**

**4.2 GREEN -- ChecklistPage export disclaimer**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/checklist/ChecklistPage.tsx`, lines 93-95
- Export text begins with identical disclaimer language.
- Additionally, a `LegalDisclaimer` component (box variant) is rendered at the bottom of the page (line 243).
- **No action needed.**

---

#### 5. Legal Pages

**5.1 GREEN -- Terms of Service references Korean law**
- **File**: `/Users/leegen/localnomad/localnomad-website/app/(legal)/terms/page.tsx`, lines 100-109
- Section 4 "Limitation of Liability & Disclaimer" explicitly states:
  > "In accordance with the Korean 행정사법 (Administrative Scrivener Act) and 변호사법 (Attorney Act), LocalNomad does not file visa applications or immigration documents on behalf of users, does not provide legal representation before immigration authorities, and does not broker connections to licensed professionals for a fee."
- This directly addresses all three key prohibitions:
  1. No filing on behalf of users (행정사법 compliance)
  2. No legal representation (변호사법 compliance)
  3. No brokering/matching to professionals for fees (행정사법 Article 22(6) compliance)
- **No action needed.**

**5.2 GREEN -- Terms include service limitation clause**
- Same section includes: `"The Company does not guarantee specific outcomes, such as the successful opening of a bank account, issuance of a visa, or securing of a specific rental property"` (lines 112-116).
- **No action needed.**

**5.3 GREEN -- Terms governed by Korean law**
- Section 8 (lines 160-166): `"governed by and construed in accordance with the laws of the Republic of Korea"` with exclusive jurisdiction in Seoul courts.
- **No action needed.**

**5.4 GREEN -- Privacy Policy**
- **File**: `/Users/leegen/localnomad/localnomad-website/app/(legal)/privacy/page.tsx`
- GDPR and PIPA compliant. References Korean law for data retention (line 111: "3 years for transaction records under Korean law"). International data transfer consent clause present. Contact information provided.
- **No action needed.**

**5.5 NOTE -- Terms page is English-only**
- The Terms of Service page (`app/(legal)/terms/page.tsx`) renders hardcoded English text, not using `useTranslations()`. This means non-English users see English legal text. While not a legal compliance violation per se (Korean courts accept contracts in the language agreed upon), for best practice the Terms should be available in the user's language.
- **Severity**: Nit. Not a legal risk but a UX concern for non-English speakers.

---

#### 6. Statistics & Social Proof

**6.1 GREEN -- SocialProofBar**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/landing/SocialProofBar.tsx`
- Displays three metrics:
  1. **Visa count**: Dynamically computed from `getVisaTypes().length` (line 12) -- accurate and verifiable.
  2. **Updated date**: Dynamically computed from `new Date()` (lines 13-17) -- always shows current month/year.
  3. **"Based on official requirements"**: References official sources (line 35).
- No inflated user counts, no "X users" or "Y visitors" claims, no success/approval rates.
- **No action needed.**

**6.2 GREEN -- No inflated statistics found anywhere**
- Searched entire `components/` directory for "guarantee", "approved", "you qualify", "success rate", "approval rate" -- no problematic instances found. All uses of "approved" are in the context of self-reported state tracking on the dashboard, not claims about service outcomes.
- **No action needed.**

---

#### 7. Path Simulator & Dashboard

**7.1 GREEN -- Path Simulator disclaimer**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/path/visa-path-simulator.tsx`, lines 211-230
- A disclaimer is rendered at the top of the simulator, always visible:
  > "Paths shown are general information based on published requirements. Actual transitions depend on individual circumstances and immigration officer discretion. Always verify current requirements with the Korea Immigration Service."
- Includes a hyperlink to the official Korea Immigration Service website.
- **No action needed.**

**7.2 GREEN -- Dashboard disclaimer**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/StateDashboard.tsx`, lines 341-351
- `DashboardDisclaimer` component renders:
  > "This dashboard tracks your self-reported progress. It is not connected to HiKorea or any government system."
- This is critical because it prevents users from thinking the dashboard has official status tracking capability, which would cross into 행정사 territory.
- Rendered on the active dashboard view (line 685).
- **No action needed.**

**7.3 GREEN -- Journey page disclaimers**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/journey/VisaJourneyPage.tsx`
- Dismissible info banner at top (lines 95-115): `"Information shown is based on publicly available requirements and may not reflect recent policy changes. Verify with official sources before making decisions."`
- `LegalDisclaimer` component rendered at bottom (line 342, inline variant).
- **No action needed.**

---

#### 8. Additional Findings

**8.1 YELLOW -- OnboardingWizard has no legal disclaimer**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/OnboardingWizard.tsx`
- This is a standalone wizard that collects user goals and situations, calculates visa matches (with percentage scores like "85% match"), and then creates a VisaProgress record with `createProgress()` (line 279).
- **Missing**: No consent gate or legal disclaimer anywhere in the flow. The results page (step 3, lines 399-450) shows visa matches with percentage scores but no qualifying language.
- **Problematic text**: Line 429: `"{match.score}% match"` displayed as a badge -- this could imply a confidence level about eligibility.
- The wizard also uses step titles like `"Your Closest Match"` (line 66) and `"Based on your answers"` (line 66).
- **Risk**: Moderate. The percentage match display without any disclaimer that this does not constitute legal advice or eligibility determination is a gap.
- **Suggested fix**: Add a `QuizDisclaimer` component to the results step (step 3) and a consent acknowledgment before creating progress in step 4.

**8.2 YELLOW -- Legacy VisaDetailContent has no legal disclaimer**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/VisaDetailContent.tsx`
- This is a tabbed visa detail page with Overview, Documents, Process, and FAQs tabs.
- **Missing**: No legal disclaimer anywhere in the component (610 lines). No `LegalDisclaimer` import or render.
- The newer `VisaJourneyPage.tsx` has disclaimers, but if `VisaDetailContent` is still rendered on any route, users see visa detail information without any legal qualifier.
- **Risk**: Moderate. Users may rely on the detailed eligibility requirements, document lists, and process steps without understanding these are informational only.
- **Suggested fix**: Add `LegalDisclaimer` (inline or box variant) at the bottom of the component, after the Official Resources section.

**8.3 GREEN -- LegalDisclaimer component is well-structured**
- **File**: `/Users/leegen/localnomad/localnomad-website/components/visa/LegalDisclaimer.tsx`
- Provides three variants (inline, box, banner) plus specialized `QuizDisclaimer`, `IncomeDisclaimer`, and `DayTrackerDisclaimer` components.
- All use translated strings from `messages/*.json`.
- The box variant (default) prominently displays a warning icon and references both the Korea Immigration Service and HiKorea with hyperlinks.
- **No action needed.**

---

### Positive Findings

1. **Consent gate before quiz results**: `EligibilityQuiz.tsx` implements a proper consent gate with a checkbox that must be checked before results are shown. This is exactly what was recommended in Cycle 1.

2. **Match-level language throughout**: All quiz and eligibility check components consistently use "match" and "align" language rather than "qualify" or "eligible." Examples:
   - "Closest requirement match"
   - "Your answers match published requirements"
   - "Appears to meet published requirements"
   - "May meet requirements with some conditions"

3. **Terms of Service explicitly reference Korean statutes**: Section 4 directly cites 행정사법 and 변호사법 and lists three specific prohibitions. This was a RED finding in Cycle 1 and is now fully addressed.

4. **Footer disclaimer on all pages with translations**: The disclaimer references 행정사 and 변호사 by name in Korean, and is translated to Japanese and Traditional Chinese.

5. **Export disclaimers**: Both `DocumentChecklist.tsx` and `ChecklistPage.tsx` include disclaimers as the first content in exported files and reference `immigration.go.kr`.

6. **Dashboard explicitly states it is not connected to government systems**: The `DashboardDisclaimer` in `StateDashboard.tsx` directly addresses the K-Visa-type risk by making clear this is self-reported tracking only.

7. **Path simulator disclaimer always visible**: Unlike many components where disclaimers are at the bottom, the path simulator places its disclaimer at the top, ensuring visibility before user interaction.

8. **No filing, brokering, or matching services offered**: The codebase does not contain any functionality that files documents, connects users to 행정사/변호사 for a fee, or submits applications on behalf of users.

9. **SocialProofBar uses verifiable data**: Visa count is dynamically computed from the actual data, "last updated" is auto-generated, and the bar references "official requirements" rather than claiming proprietary analysis.

---

### Remaining Risks (Prioritized)

| Priority | Risk | File | Severity |
|----------|------|------|----------|
| 1 | Unverifiable testimonials in SocialProofSection | `components/sections/social-proof-section.tsx` | YELLOW |
| 2 | OnboardingWizard lacks any legal disclaimer or consent gate | `components/visa/OnboardingWizard.tsx` | YELLOW |
| 3 | Legacy VisaDetailContent lacks legal disclaimer | `components/visa/VisaDetailContent.tsx` | YELLOW |
| 4 | "Save 40+ Hours" unsubstantiated quantitative claim | `components/sections/why-section.tsx` | YELLOW |
| 5 | Terms of Service is English-only (not translated) | `app/(legal)/terms/page.tsx` | NIT |
| 6 | Privacy Policy is English-only (not translated) | `app/(legal)/privacy/page.tsx` | NIT |
| 7 | Footer not in layout (relies on each page including it) | `app/[lang]/layout.tsx` | NIT |

### Recommended Actions

1. **[YELLOW] Add `QuizDisclaimer` to OnboardingWizard results step** -- Import and render `QuizDisclaimer` at the bottom of step 3 (results) in `OnboardingWizard.tsx`. Consider adding a consent acknowledgment before step 4 (creating VisaProgress).

2. **[YELLOW] Add `LegalDisclaimer` to VisaDetailContent** -- Add `<LegalDisclaimer variant="inline" />` after the Official Resources section in `VisaDetailContent.tsx`, or determine if this legacy component is still in use and can be deprecated in favor of `VisaJourneyPage.tsx`.

3. **[YELLOW] Verify or replace testimonials** -- Either verify that the testimonials in `social-proof-section.tsx` are from real users (and add a note like "Used with permission"), or replace with verifiable social proof (e.g., Instagram embed, linked profile), or remove the section.

4. **[YELLOW] Substantiate or soften "Save 40+ Hours"** -- In `why-section.tsx`, either add "estimated" or "based on user feedback" qualifier, or change to qualitative language.

5. **[NIT] Consider translating Terms and Privacy pages** -- While not a legal compliance issue, having legal pages only in English when the site supports Japanese and Traditional Chinese is a best-practice gap.
