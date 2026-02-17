# Cycle 1 Legal Compliance Audit

**Auditor:** Legal Compliance Reviewer
**Date:** 2026-02-12
**Scope:** Korean law compliance (행정사법, 변호사법, 표시광고법)
**Codebase:** `/Users/leegen/localnomad/localnomad-website`

---

## Section 1: Verification of 9 Legal Copy Fixes

### Fix 1 — EligibilitySection.tsx (result message when all qualifying)
**File:** `components/visa/detail/EligibilitySection.tsx:156`
**Current string:** `"Your answers align with published requirements"`
**Expected:** Neutral language, no "you qualify" or "you are eligible"
**Score:** GREEN -- Fix applied correctly. Uses HelpCircle icon (not CheckCircle), and says "align with published requirements" rather than making a legal determination.

### Fix 2 — StepQualify.tsx (result messages)
**File:** `components/visa/journey/steps/StepQualify.tsx:98-99`
**Current strings:**
- Positive: `"Your answers match the published requirements for this visa."`
- Negative: `"Based on your answers, your profile may not match all published requirements."`
**Score:** GREEN -- Fix applied correctly. Uses "match published requirements" language. Includes disclaimer at line 152-155: "This is a preliminary check. Final eligibility is determined by Korean immigration authorities."

### Fix 3 — EligibilityQuiz.tsx (results header and badge)
**File:** `components/visa/EligibilityQuiz.tsx`
- **Line 330:** `"Visas with matching requirements include..."` -- FIX APPLIED (was "here are your recommended visas")
- **Line 369:** `"Closest requirement match"` -- FIX APPLIED (was "Best Match")
**Score:** GREEN -- Both fixes applied correctly. No "recommended visa" language remains.

### Fix 4 — QuickEligibilityCheck.tsx (result messages)
**File:** `components/visa/detail/QuickEligibilityCheck.tsx:132-135`
**Current strings:**
- Positive: `"Your answers match published requirements"` / `"your profile aligns with the published requirements"`
- Negative: `"Some requirements may not be met"`
**Score:** GREEN -- Fix applied correctly. Includes disclaimer at line 157-159.

### Fix 5 — VisaComparisonTool.tsx (quiz CTA text)
**File:** `components/visa/VisaComparisonTool.tsx:328-329`
**Current string:** `"Take our eligibility quiz to find visas with requirements matching your situation."`
**Score:** GREEN -- Fix applied correctly. Uses "requirements matching" instead of "find the right visa for you" or similar advisory language.

### Fix 6 — app/[lang]/[country]/visa/page.tsx (stats bar)
**File:** `app/[lang]/[country]/visa/page.tsx:206`
**Current string:** `"6 visa guides + 6 coming soon · Based on publicly available requirements"`
**Score:** GREEN -- Both fixes applied. Changed from "12 visa types covered" to "6 full guides + 6 coming soon" and from "Based on official requirements" to "Based on publicly available requirements". LegalDisclaimer component also used at line 214.

### Fix 7 — hero-section.tsx (trust indicators)
**File:** `components/hero-section.tsx:166-178`
**Current trust indicators:** "Updated Weekly", "Local Experts", "Trusted by Nomads"
**Score:** GREEN -- The "500+ Nomads Helped" string has been removed. Replaced with non-quantitative claims that are defensible under 표시광고법.

### Fix 8 — pricing-section.tsx (service descriptions)
**File:** `components/pricing-section.tsx:117`
**Current string:** `"In-person accompaniment (bank, government offices, hospital, etc.) — Logistical and language support only."`
**Score:** GREEN -- The qualifier "Logistical and language support only" is present, clearly scoping the service away from legal/immigration representation. No "help prepare paperwork" or visa consulting language found.

### Fix 9 — data/visas/en/e-7.json (FAQ content)
**File:** `data/visas/en/e-7.json`
**Reviewed all FAQs (lines 177-198):** Language uses hedging appropriately:
- "A grace period may be granted" (line 184, not "you will get")
- "you may be eligible for F-2-7" (line 192, conditional)
- "There's no fixed minimum" (line 196, factual)
**Score:** GREEN -- FAQ language is factual and appropriately hedged. No deterministic eligibility statements.

### Section 1 Summary: 9/9 fixes verified GREEN

---

## Section 2: Dangerous Phrase Codebase Grep

### "you qualify"
**Source code hits (excluding .md audit/planning docs):**
1. `data/visas/en/f-2.json:133` -- `"Determine which F-2 subcategory you qualify for."` -- This is within an applicationStep description, instructing the user to self-assess. **YELLOW** -- Borderline. "you qualify for" is a procedural instruction, but could be reframed.
2. `components/visa/journey/VisaJourneyPage.tsx:112` -- `"Check if you qualify"` -- Step title in the journey page. **YELLOW** -- This is a call-to-action for self-assessment, not a determination, but the phrasing implies the tool will tell you if you qualify.

### "you are eligible"
**Source code hits:** None in production code. All hits in audit/planning `.md` files only.
**Score:** GREEN

### "eligible for"
**Source code hits:**
1. `data/visas/en/e-7.json:192` -- `"you may be eligible for F-2-7"` -- Conditional language with "may be". **GREEN** -- Appropriately hedged.
2. `data/visas/en/f-2.json:207` -- `"you may be eligible for F-5"` -- Same hedged pattern. **GREEN**
3. `data/quiz/questions.json:215-217` -- `"Eligible for all countries"`, `"Eligible for most countries"`, `"May not be eligible"` -- These are option descriptions within the H-1 working holiday age question. **YELLOW** -- "Eligible for all countries" is stated as fact without hedging. Working holiday age requirements are publicly defined, but the phrasing is declarative.

### "recommended visa"
**Source code hits:** None in production code. All hits in audit `.md` files only.
**Score:** GREEN

### "Best Match"
**Source code hits:** None in production code. `lib/visa/quiz-engine.ts:121` has a code comment `"Returns sorted array with best matches first"` -- this is a code comment, not user-facing.
**Score:** GREEN

### "official requirements"
**Source code hits:** None in production code. Replaced with "publicly available requirements" everywhere.
**Score:** GREEN

### "500+"
**Source code hits:** None in production source code. All hits in audit/research `.md`/`.txt` docs only.
**Score:** GREEN

### Additional dangerous patterns found:

**"guarantee" in production code:**
1. `components/value-prop-section.tsx:72` -- `"We guarantee completeness through unlimited Q&A during your onboarding call"` -- **YELLOW** -- "guarantee" is a strong claim under 표시광고법, though it refers to Q&A completeness, not visa outcomes.
2. `app/(legal)/terms/page.tsx:106` -- `"No Guarantee of Results"` -- This is a protective disclaimer. **GREEN**
3. `components/business/BusinessNotForSection.tsx:9-10` -- Explicitly says "Guaranteed outcomes" is NOT offered. **GREEN** -- Protective.
4. `lib/visa/path-data.ts:896` -- `"not guaranteed"` -- Protective hedging. **GREEN**

### Section 2 Summary: GREEN overall with 3 YELLOW items needing attention

| Phrase | Production Code Hits | Severity |
|--------|---------------------|----------|
| "you qualify" | 2 (f-2.json, VisaJourneyPage.tsx) | YELLOW |
| "you are eligible" | 0 | GREEN |
| "eligible for" | 3 (hedged in 2, declarative in quiz) | YELLOW |
| "recommended visa" | 0 | GREEN |
| "Best Match" | 0 (code comment only) | GREEN |
| "official requirements" | 0 | GREEN |
| "500+" | 0 | GREEN |
| "guarantee" | 1 marketing claim | YELLOW |

---

## Section 3: Global Legal Disclaimer in Footer

**File:** `components/footer.tsx`

**Finding:** The footer does NOT contain a global legal disclaimer. It contains:
- Brand name
- Tagline (via i18n translation key)
- Navigation links (Bundles, Area Guide, Visa)
- Social links (Instagram, Newsletter)
- Copyright + Terms / Privacy / Refund links

**Missing:** No text stating that LocalNomad does not provide legal advice, no reference to 행정사법 or 변호사법, no mention that visa decisions are made by immigration authorities.

**Score:** RED

**Required action:** Add a global disclaimer visible on every page, such as:
> "LocalNomad provides general information about Korean visa requirements for educational purposes only. This information does not constitute legal advice. Visa decisions are made solely by Korean immigration authorities. For personalized legal advice, consult a licensed Korean 행정사 (administrative scrivener) or 변호사 (attorney)."

---

## Section 4: DocumentChecklist.tsx Export Disclaimer

**File:** `components/visa/DocumentChecklist.tsx`

**Finding:** The export function (lines 226-256) generates a plain text file with:
- Visa name and type
- Generation date
- Required/optional document lists with check/uncheck status

**Missing:** The exported text file contains NO legal disclaimer header. A user could share or submit this checklist, and recipients might assume it is an official document or professional advice.

**Score:** RED

**Required action:** Add a disclaimer header to the exported text, such as:
```
DISCLAIMER: This checklist is for personal reference only and does not
constitute legal advice. Verify all requirements with Korean immigration
authorities (immigration.go.kr) before applying.
```

---

## Section 5: EligibilityQuiz.tsx Pre-Results Consent Gate

**File:** `components/visa/EligibilityQuiz.tsx`

**Finding:** The quiz flows directly from the last question to the results display (line 231: `setShowResults(true)`). There is no intermediate consent gate, acknowledgment checkbox, or interstitial disclaimer before showing results.

The `QuizDisclaimer` component exists in `components/visa/LegalDisclaimer.tsx` (lines 98-114) but is NOT used in `EligibilityQuiz.tsx`. The quiz results page shows results immediately with a "Match Score" percentage and "Closest requirement match" badge -- users see what appears to be a professional eligibility assessment without any consent gate.

The `data/quiz/questions.json` file contains disclaimer text (line 253) but it is NOT rendered in the quiz component.

**Score:** RED

**Required action:** Before showing results, insert an interstitial screen or overlay requiring the user to acknowledge:
1. Results are informational, not legal advice
2. Final eligibility is determined by Korean immigration authorities
3. A checkbox or "I understand" button must be clicked before results are revealed

---

## Section 6: Pricing Section B2B Service Descriptions

**File:** `components/pricing-section.tsx`

**72 Hours ($150):**
- "Pre-arrival cheat sheet & checklist" -- GREEN (information product)
- "Living playbook for landing in Korea" -- GREEN (information product)
- "1:1 onboarding call (includes unlimited Q&A on the playbook)" -- GREEN (general orientation)
- "Area orientation guide" -- GREEN (information product)

**14 Days ($350):**
- "Everything in 72 hours" -- GREEN
- "Guided temporary accommodation setup" -- GREEN (logistical)
- "Hotel / coliving / serviced apartment options" -- GREEN
- "Checklist of required paperwork" -- GREEN (information, not preparation)
- "Check-in support" -- GREEN (logistical)
- "1:1 check-in call" -- GREEN

**Custom Add-on ($150):**
- "In-person accompaniment (bank, government offices, hospital, etc.) -- Logistical and language support only." -- GREEN (explicit scope limitation)
- "Airport pickup & drop-off" -- GREEN (logistical)
- "Open to suggestions" -- GREEN

**Score:** GREEN -- All service descriptions properly scoped as informational/logistical. The "Logistical and language support only" qualifier on the accompaniment service is important and correctly present.

**Note:** `components/value-prop-section.tsx:72` uses "We guarantee completeness" which is a separate concern (see Section 2).

---

## Section 7: Terms of Service Review

**File:** `app/(legal)/terms/page.tsx`

**Section 4 "Limitation of Liability & Disclaimer":**
- "No Professional Advice: LocalNomad is not a law firm, real estate agency, or financial institution. The information provided does not constitute legal, tax, or professional financial advice." -- GREEN
- "No Guarantee of Results" -- GREEN

**Missing:**
1. No explicit reference to 행정사법 (Administrative Scrivener Act)
2. No explicit reference to 변호사법 (Attorney Act)
3. No statement that LocalNomad does not file applications on behalf of users
4. No statement that LocalNomad does not broker connections to licensed professionals for a fee

**Score:** YELLOW -- The existing "No Professional Advice" clause provides baseline protection but should be strengthened with explicit Korean law references.

---

## Overall Scorecard

| Area | Score | Detail |
|------|-------|--------|
| **Fix 1:** EligibilitySection.tsx | GREEN | Neutral language applied |
| **Fix 2:** StepQualify.tsx | GREEN | Neutral language + disclaimer |
| **Fix 3:** EligibilityQuiz.tsx | GREEN | Both "recommended" and "Best Match" fixed |
| **Fix 4:** QuickEligibilityCheck.tsx | GREEN | Neutral language + disclaimer |
| **Fix 5:** VisaComparisonTool.tsx | GREEN | Neutral CTA language |
| **Fix 6:** visa/page.tsx | GREEN | Stats + requirements language fixed |
| **Fix 7:** hero-section.tsx | GREEN | "500+" removed |
| **Fix 8:** pricing-section.tsx | GREEN | Scoped to logistical support |
| **Fix 9:** e-7.json | GREEN | Hedged FAQ language |
| **Dangerous phrase sweep** | YELLOW | 3 minor items remain (see Section 2) |
| **Footer global disclaimer** | RED | No legal disclaimer in footer |
| **DocumentChecklist export** | RED | No disclaimer in exported file |
| **Quiz consent gate** | RED | No pre-results acknowledgment |
| **B2B pricing descriptions** | GREEN | Properly scoped |
| **Terms of Service** | YELLOW | Missing 행정사법/변호사법 references |

---

## Priority Remediation List

### Must Fix (RED)

1. **Add global legal disclaimer to footer** (`components/footer.tsx`)
   - Must appear on every page
   - Must state: not legal advice, not immigration representation
   - Should reference 행정사 and 변호사 for professional help
   - Risk: 행정사법 + 변호사법 exposure on every page without it

2. **Add disclaimer header to DocumentChecklist export** (`components/visa/DocumentChecklist.tsx`)
   - Prepend disclaimer lines to the exported `.txt` file
   - Must clarify: personal reference only, not official document
   - Risk: Users share/submit the exported list as if it were professional advice

3. **Add pre-results consent gate to EligibilityQuiz** (`components/visa/EligibilityQuiz.tsx`)
   - Insert interstitial between last question and results display
   - Use the existing `QuizDisclaimer` component from `LegalDisclaimer.tsx`
   - Require explicit acknowledgment (button click) before showing results
   - Risk: Quiz results with "Match Score %" look like professional assessment without any acknowledgment

### Should Fix (YELLOW)

4. **Rephrase "Check if you qualify"** in `VisaJourneyPage.tsx:112`
   - Suggested: "Review requirements" or "Check your profile against requirements"

5. **Rephrase "you qualify for"** in `data/visas/en/f-2.json:133`
   - Suggested: "Determine which F-2 subcategory fits your situation"

6. **Rephrase "Eligible for all/most countries"** in `data/quiz/questions.json:215-217`
   - Suggested: "Meets age requirement for all/most countries" or "Within age range for all/most countries"

7. **Rephrase "We guarantee completeness"** in `components/value-prop-section.tsx:72`
   - Suggested: "We provide unlimited Q&A during your onboarding call to cover your questions"

8. **Add 행정사법/변호사법 reference to Terms of Service** (`app/(legal)/terms/page.tsx`)
   - Add paragraph to Section 4 explicitly referencing these statutes
   - State: does not file on behalf of users, does not broker professional connections for fee
