# Resident Audit: James's Feature Review
> Persona: James, 34, American, E-2 to E-7, 5 years in Korea, wants tools not info

## Executive Summary

LocalNomad has built an impressive **breadth** of visa-related interactive features -- eligibility quiz, document checklist, comparison tool, onboarding wizard, state dashboard, D-Day counter, and journey pages -- but nearly all of them operate as **client-side UI shells with no server persistence**. As James (E-2 holder switching to E-7), I found zero features that recognize my existing visa status, zero that help me plan an E-2-to-E-7 transition path, and zero that save my progress across devices. The features feel like a polished prototype, not a tool I'd return to daily. The "visa management" dashboard that competitors lack is here structurally, but it's a localStorage-only skeleton that doesn't survive a browser clear or device switch.

---

## Feature Audit Table

| Feature | Component Path | Functional | Value | Sticky | Complete | UX | Notes |
|---------|---------------|:----------:|:-----:|:------:|:--------:|:---:|-------|
| Eligibility Quiz | `components/visa/EligibilityQuiz.tsx:218` | 7 | 5 | 2 | 6 | 7 | Works but no E-2-to-E-7 path, no state persistence, hardcoded 4 visa results only |
| Onboarding Wizard | `components/visa/OnboardingWizard.tsx:213` | 7 | 6 | 3 | 6 | 7 | Creates localStorage progress, decent flow, but no "I already have a visa" path |
| Document Checklist | `components/visa/DocumentChecklist.tsx:48` | 8 | 7 | 4 | 7 | 8 | Best feature. localStorage persistence, export to .txt, per-visa tracking. Tips + where-to-get |
| Visa Comparison Tool | `components/visa/VisaComparisonTool.tsx:137` | 8 | 6 | 2 | 7 | 7 | Up to 4 visas, good data display. No persistence, no personalization |
| State Dashboard | `components/visa/StateDashboard.tsx:258` | 6 | 5 | 3 | 5 | 6 | localStorage-only, no way to advance state (manual only via code), empty state is dead end |
| D-Day Counter | `components/visa/DDayCounter.tsx:14` | 8 | 6 | 3 | 7 | 8 | Good urgency styling, auto-updates hourly. Only works if dashboard has progress |
| State Timeline | `components/visa/StateTimeline.tsx:44` | 7 | 5 | 2 | 7 | 8 | Visual timeline of visa states. Clean UI. Display-only, no interaction to advance states |
| Document Progress | `components/visa/DocumentProgress.tsx:29` | 7 | 6 | 4 | 7 | 7 | Separate from DocumentChecklist, uses different localStorage key. Progress circle nice |
| Next Step Hero | `components/visa/NextStepHero.tsx:138` | 7 | 5 | 2 | 7 | 7 | State-aware CTA cards. Good copy. Links mostly go to dashboard (circular) |
| Visa Detail Content | `components/visa/VisaDetailContent.tsx:66` | 8 | 7 | 3 | 8 | 8 | Rich tabbed detail page. Good info architecture. No personalization |
| Visa Journey Page | `components/visa/journey/VisaJourneyPage.tsx:29` | 7 | 7 | 3 | 7 | 8 | Accordion step-by-step guide. Good deep-linking. Quality content |
| Email Subscription | `components/sections/email-capture-section.tsx:9` | 8 | 4 | 2 | 8 | 7 | Works (Resend + Airtable). Sends resource archive. Not visa-specific |
| Email Capture Dialog | `components/email-capture-dialog.tsx:20` | 8 | 4 | 2 | 8 | 7 | Modal version of above. Same API. Clean success state |
| Language Switcher | `components/language-switcher.tsx:21` | 7 | 5 | 3 | 6 | 7 | EN/JA/ZH-TW. No Korean. Missing key languages for target audience |
| Seoul Map | `components/SeoulNeighborhoodMap.tsx:222` | 7 | 4 | 1 | 6 | 7 | Mapbox + SVG fallback. 9 neighborhoods. No link to visa features |
| Pricing Section | `components/pricing-section.tsx:8` | 6 | 3 | 1 | 5 | 6 | Mailto links only ($150/$350). No checkout, no account, pure info |
| Header Navigation | `components/header.tsx:10` | 8 | 5 | 3 | 7 | 7 | Clean nav. Links to bundles/areas/visa. Scroll behavior. Mobile menu |
| Already Have Visa | `components/visa/landing/AlreadyHaveVisa.tsx:18` | 7 | 6 | 2 | 5 | 7 | Expandable visa selector. Good idea but links to journey pages, not dashboard |
| Visa Stub Page | `components/visa/journey/VisaStubPage.tsx:13` | 6 | 3 | 1 | 4 | 6 | "Coming soon" for E-2, D-7, D-8, F-6, F-4, D-4. No real content |
| Business (B2B) Page | `app/(legal)/business/page.tsx` | 5 | 2 | 1 | 3 | 5 | Static sections. No interactive features. Mailto CTA only |

---

## Deep Feature Reviews

### 1. Eligibility Quiz
- **What it does**: 6-question multiple-choice quiz scoring users against 4 visa types (D-10, E-7, F-1-D, F-2)
- **Code location**: `components/visa/EligibilityQuiz.tsx:218`
- **State management**: React `useState` only -- answers stored in `Record<string, string>`, no persistence
- **Data source**: Hardcoded questions and visa point weights in the component itself (lines 50-207). Visa info from `lib/visa/data.ts` JSON files
- **Edge cases handled**: No -- what if James is ALREADY on an E-2? No question about current visa status. No nationality question (critical for Korean visa eligibility). No age question (relevant for H-1)
- **What James thinks**: "This doesn't help me at all. I already know I want E-7. I need help with the transition FROM E-2, not a generic quiz that doesn't even ask what visa I'm on."
- **What's missing**:
  - No "current visa" question -- the quiz assumes everyone is starting from scratch
  - Only 4 visa types in results (D-10, E-7, F-1-D, F-2) despite 12 visa types in the system
  - No visa PATH recommendations (E-2 -> E-7 transition)
  - Results vanish on page refresh
  - Max possible score is 18 (6 questions x 3 points) but the match bar rarely exceeds 50%, making results feel weak

### 2. Onboarding Wizard
- **What it does**: 4-step wizard (Goal -> Situation -> Result -> Target Date) that creates visa progress in localStorage
- **Code location**: `components/visa/OnboardingWizard.tsx:213`
- **State management**: All in `useState`. Final step calls `createProgress()` and `saveProgress()` which write to `localStorage` key `visa-progress`
- **Data source**: Hardcoded `goalOptions` and `situationOptions` with visa weights. `visaInfo` dict for display names
- **Edge cases handled**: Partially -- disabled "Start My Journey" without target date. Back navigation on each step. No validation that target date is reasonable
- **What James thinks**: "The 'Start a business' option maps to F-1-D? That's wrong. And there's no option for 'I already have a visa and want to switch.' This wizard doesn't understand my situation."
- **What's missing**:
  - No "I already have a visa" path -- critical for James
  - Business goal maps to F-1-D only (should include D-8)
  - **Bug**: `calculateMatches()` is called at line 268 BEFORE the `selectedSituation` state update from `setSelectedSituation(situation)` at line 269 takes effect. Due to React state batching, matches are computed without the situation weights. The situation's `visaWeights` are not factored into the score
  - No loading/error states
  - Target date has no guidance (how far out should James plan?)

### 3. Document Checklist (BEST FEATURE)
- **What it does**: Per-visa-type interactive checklist with checkbox persistence, progress bar, tips, "where to get", and .txt export
- **Code location**: `components/visa/DocumentChecklist.tsx:48`
- **State management**: `localStorage` key `visa-checklist` -- object keyed by visa type, containing document ID -> boolean. Loaded on mount, saved on every change
- **Data source**: `getAllVisas("en")` and `getVisaInfo()` from JSON data files. Documents defined per-visa in `data/visas/en/*.json`
- **Edge cases handled**: Yes -- handles empty localStorage, JSON parse errors silently, shows different UI for required vs optional docs
- **What James thinks**: "This is actually useful. I can check off my E-7 documents as I gather them. But why does it lose my progress when I switch devices? And the .txt export is bare-bones."
- **What's missing**:
  - localStorage only -- no cross-device sync
  - Export is plain text, not PDF or formatted checklist
  - No document upload capability
  - No timeline for how long each document takes to obtain
  - **Two separate document tracking systems exist** (DocumentChecklist uses key `visa-checklist` globally, DocumentProgress uses key `visa-checklist-{type}` per-type). These do NOT share data. James could check items in one and not see them in the other
  - No reminder/notification when documents expire

### 4. Visa Comparison Tool
- **What it does**: Side-by-side comparison of up to 4 visas across 8 attributes (duration, fees, processing time, work permission, income, audience, requirements)
- **Code location**: `components/visa/VisaComparisonTool.tsx:137`
- **State management**: `useState` for selected visa types (default: D-10 + E-7). Dropdown via CSS `:hover` group
- **Data source**: `getAllVisas("en")` for the full list, `getVisaInfo()` for each selected visa
- **Edge cases handled**: Max 4 visas enforced. Min 1 visa enforced. Dropdown closes naturally on hover-out
- **What James thinks**: "Good to see E-2 vs E-7 side by side. But I need to know what changes when I SWITCH -- what do I lose? What new requirements appear? This is a static comparison, not a transition guide."
- **What's missing**:
  - No highlight of differences between visas
  - No transition path information (what's required to go FROM visa A TO visa B)
  - **Accessibility issue**: Dropdown uses CSS `:hover` (line 209: `group-hover:opacity-100 group-hover:visible`) which doesn't work on touch/mobile devices
  - No shareable URL for a specific comparison

### 5. State Dashboard
- **What it does**: Shows visa journey progress (empty state or active dashboard) with timeline, D-Day counter, document progress, and next steps
- **Code location**: `components/visa/StateDashboard.tsx:258`
- **State management**: `localStorage` via `getStoredProgress()` from `lib/visa/stateMachine.ts`. State can only be set via OnboardingWizard initially; stuck at PREPARING forever
- **Data source**: `lib/visa/stateMachine.ts` for state config, `lib/visa/data.ts` for visa info
- **Edge cases handled**: Loading skeleton while mounting. Confirm dialog on reset. Empty state with CTAs
- **What James thinks**: "I went through the wizard and now I'm stuck at 'Preparing' forever. There's no way to advance to 'Submitted' or 'Under Review' without editing localStorage manually. This is a dead-end prototype."
- **What's missing**:
  - **No way to advance visa state through the UI** -- this is the biggest gap. The state machine has valid transitions defined (`lib/visa/stateMachine.ts:119`) and an `updateProgressState()` function (line 439) but NO UI ANYWHERE calls them
  - No account system -- localStorage vanishes on browser clear
  - **Settings button is non-functional** (line 147-152: `<Settings>` icon with no onClick handler)
  - "While You Wait" tips are generic, not visa-specific
  - No notifications or reminders
  - Empty state links to `/visa/start` and `/visa` but not to the quiz or wizard

### 6. Visa Data System
- **What it does**: JSON-based visa information for 12 visa types in 3 languages (EN, JA, ZH-TW)
- **Code location**: `lib/visa/data.ts`, `lib/visa/types.ts`, `data/visas/en/*.json`
- **Data source**: Static JSON files. 6 "full" visas (D-10, E-7, F-1-D, F-2, D-2, H-1) and 6 "stub" visas (E-2, D-7, D-8, F-6, F-4, D-4)
- **What James thinks**: "The E-7 data is detailed and helpful. But my current E-2 visa is a STUB with almost no content. The system doesn't understand visa transitions at all."
- **What's missing**:
  - E-2 (James's current visa) is a stub -- minimal data
  - No transition/path data between visas despite `pathsTo`/`pathsFrom` fields defined in types (`lib/visa/types.ts:178-181`) but NEVER POPULATED in any JSON file
  - `communityTips` field exists in types (line 172) but not populated in any visa JSON
  - `eligibilityQuestions` field exists in types (line 120) but not populated
  - No Korean language support despite Korean-based service
  - No Vietnamese language (despite being a key target market per research)

### 7. Email Subscription
- **What it does**: Captures email + first name, sends welcome email via Resend, saves to Airtable
- **Code location**: `components/sections/email-capture-section.tsx:9`, `app/api/subscribe/route.ts`
- **State management**: Form state in `useState`. API call to `/api/subscribe`
- **Data source**: Resend API for email delivery, Airtable API for subscriber storage
- **Edge cases handled**: Yes -- email validation (regex at route.ts:154), loading state, error display, success animation, form reset
- **What James thinks**: "I signed up but got a generic 'Seoul resource archive' link. Nothing about visas. Nothing about E-7. No follow-up emails about my specific situation."
- **What's missing**:
  - Not visa-specific -- same email for everyone
  - No segmentation (visa type, current status, urgency)
  - No drip campaign or follow-up sequence
  - No visa-related content in the welcome email (it's about accommodation, banking, SIM cards)
  - Source field hardcoded to `"curated-resource"` and page to `"homepage"` (route.ts:44-45)

### 8. Seoul Neighborhood Map
- **What it does**: Interactive Mapbox GL map of 9 Seoul neighborhoods with hover/click info cards, SVG fallback when token missing
- **Code location**: `components/SeoulNeighborhoodMap.tsx:222`
- **State management**: `useState` for active neighborhood, `useRef` for Mapbox instance. Map layers update via GeoJSON source
- **Data source**: Hardcoded neighborhood array (lines 17-108). Seoul boundary from `/data/seoul-boundary.geojson`. Mapbox token from env
- **Edge cases handled**: Yes -- graceful SVG fallback when Mapbox token missing or errors. Loading spinner. Error handler
- **What James thinks**: "Nice map but completely disconnected from visa features. I've lived in Seoul for 5 years -- I don't need a neighborhood guide. Where's the immigration office finder? Visa appointment booking?"
- **What's missing**: No connection to visa features. No immigration office locations. No neighborhood-specific visa tips

### 9. Pricing/Bundles Section
- **What it does**: Three-tier pricing ($150/72h, $350/14d, $150/custom add-on) with mailto: CTAs
- **Code location**: `components/pricing-section.tsx:8`
- **State management**: None -- pure static content
- **Data source**: Hardcoded prices and features
- **What James thinks**: "These are 'soft landing' packages for newcomers. I've been here 5 years. Where's the visa consulting service? The E-7 application help? This pricing is irrelevant to me."
- **What's missing**:
  - No online checkout or booking system
  - No visa-specific service packages
  - Not relevant to existing residents switching visas
  - Mailto links (`hello@localnomad.club`) feel unprofessional vs competitors like Kowork with in-app flow
  - No account required -- no upsell path from free tools to paid services

### 10. Business (B2B) Page
- **What it does**: Static landing page for employers/businesses about visa sponsoring services
- **Code location**: `app/(legal)/business/page.tsx`, `components/business/*.tsx`
- **State management**: None -- all server components or static content
- **What James thinks**: "My company HR could use this, but there's nothing interactive. No 'check if your company can sponsor E-7' tool. No document requirements for employers. Just marketing copy."
- **What's missing**: No employer-side visa tools, no cost calculator for sponsorship, no interactive features at all

---

## Stickiness Report Card

| Feature | Saves Progress | Personalized | Return Reason | Shareable |
|---------|:--------------:|:------------:|:-------------:|:---------:|
| Eligibility Quiz | No | No | None -- one-time use | No |
| Onboarding Wizard | localStorage | Minimal (goal + situation) | None after completion | No |
| Document Checklist | localStorage | Per-visa-type only | Yes -- check items over time | Export (.txt only) |
| Visa Comparison | No | No | None -- one-time use | No |
| State Dashboard | localStorage | Visa type only | Theoretically -- if state could advance | No |
| D-Day Counter | localStorage (via dashboard) | Target date | Daily check (if it worked) | No |
| Email Subscription | Server (Airtable) | First name only | Email content (if segmented) | No |
| Language Switcher | URL-based | Language pref | Cross-session via URL | Yes (URL) |
| Neighborhood Map | No | No | None | No |
| Pricing | No | No | None | No |

**Overall Stickiness**: 2/10 -- The only feature that brings James back is the Document Checklist, and even that is fragile (localStorage). Nothing personalizes to James's E-2-to-E-7 situation. Nothing sends notifications. Nothing changes state over time.

---

## Payment Readiness

| Feature | Would James Pay? | Fair Price Point | Currently Free/Paid | Research Support |
|---------|:----------------:|:----------------:|:-------------------:|:----------------:|
| Visa Path Simulator (E-2->E-7) | YES -- #1 | $15-30/one-time | Does not exist | P0 per research: "Visa Path Simulator is killer feature" |
| Document Checklist + Cloud Sync | YES | $5-10/month | Free (localStorage) | P0: "Dynamic checklist + guide = nobody does this" |
| D-Day + Renewal Alerts | YES | $5/month | Free (non-functional) | P1: "Renewal timeline calendar tool" per research |
| Income Proof Calculator/Translator | YES -- high value | $20-50/use | Does not exist | P0: "Income Summary Sheet auto-generation" per research |
| HiKorea Appointment Sniper | YES -- urgently | $10-20/month | Does not exist | P0: "Highest utility tool" per research |
| Eligibility Quiz (current) | NO | Free | Free | Quiz exists but too shallow for payment |
| Comparison Tool (current) | NO | Free | Free | Good for browsing, not paying |
| Neighborhood Map | NO | Free | Free | Irrelevant to visa users |
| Soft Landing Bundles | Not for James | N/A | $150-350 | For newcomers only, not existing residents |
| E-7 Sponsor Company List | YES | $10-20/month | Does not exist | P1: "Sponsor company database" per Discord research |

**Key Insight**: James would pay for TOOLS (path simulator, income calculator, appointment sniper) but NOT for information he can get free on Discord. The current product is information-heavy and tool-light.

---

## The Missing Features List

| Need (from Research) | Exists? | Completeness | Priority |
|---------------------|:-------:|:------------:|:--------:|
| Verified visa requirements DB | Partial | 60% -- good data for 6 visas, stubs for 6 more | P0 |
| Visa Path Simulator (A -> B -> C) | No | 0% -- types defined (`pathsTo`/`pathsFrom` at types.ts:178) but never populated | P0 |
| Modern HiKorea alternative dashboard | Partial | 30% -- UI shell exists, no state advancement, no real data | P0 |
| Dynamic document checklist with guides | Yes | 70% -- best feature but localStorage only, two competing systems | P0 |
| Visa expiry/renewal alerts | Partial | 20% -- D-Day counter exists but no notification system | P1 |
| Income proof calculator/translator | No | 0% | P1 |
| Embassy-specific requirement differences | No | 0% -- data model doesn't support per-embassy variations | P1 |
| E-7 sponsor company database | No | 0% | P1 |
| HiKorea appointment sniper/alerts | No | 0% | P1 |
| Tax simulator for visa holders | No | 0% | P2 |
| Immigration consultant marketplace | No | 0% | P2 |
| Multi-device sync (user accounts) | No | 0% -- all localStorage, Supabase types defined but unused | P0 (infrastructure) |
| Korean language support | No | 0% -- has JA/ZH-TW but no KO | P1 |
| Vietnamese language support | No | 0% | P1 |
| Community tips integration | No | 0% -- `communityTips` field defined in types but empty everywhere | P2 |
| Visa status tracking (real HiKorea) | No | 0% | P2 |
| Post-arrival onboarding bundle | Partial | 40% -- email resource archive exists but generic | P2 |

---

## Recommendations (Prioritized)

### Critical (Must-Have for James to Return)

1. **Build the Visa Path Simulator** -- The `pathsTo`/`pathsFrom` fields already exist in `lib/visa/types.ts:178-181`. Populate them in the visa JSON files and create a visual flow: "I have E-2, I want E-7" -> show the exact transition requirements, timeline, and documents needed. This is the #1 killer feature identified by all research sources and the #1 thing James needs. No competitor has this.

2. **Add user accounts with cloud sync** -- Everything is localStorage. One browser clear and James loses all his checklist progress. The Supabase types are already defined in `lib/visa/types.ts:330-365` (`UserProfile`, `UserVisaProgress`, `UserChecklistItem`). This is infrastructure that unlocks every other sticky feature.

3. **Enable state advancement in the dashboard** -- The state machine (`lib/visa/stateMachine.ts`) has valid transitions (line 119) and `updateProgressState()` (line 439) but zero UI to trigger them. Add buttons: "I submitted my application" -> advance from PREPARING to SUBMITTED. Without this, the dashboard is a dead-end that never changes.

4. **Add "I already have a visa" to the onboarding wizard** -- Both the quiz and wizard assume users start from scratch. James has an E-2. He needs to select his current visa and see his transition options. The `AlreadyHaveVisa` component (`components/visa/landing/AlreadyHaveVisa.tsx`) exists but only links to journey pages, not the dashboard flow.

### High Priority

5. **Unify the two document checklist systems** -- `DocumentChecklist` (line 51) uses localStorage key `visa-checklist` as a nested object, while `DocumentProgress` (line 27) uses key `visa-checklist-{type}` as a flat object. These are separate systems tracking the same concept. James could check items in one and not see them in the other.

6. **Fill all stub visa data** -- E-2 (James's CURRENT visa) is a stub with minimal content. The `VisaStubPage` (line 13) shows "Full guide coming soon." All 6 stub visas (E-2, D-7, D-8, F-6, F-4, D-4) need real data.

7. **Add push/email notifications for deadlines** -- D-Day counter and renewal alerts are useless without notifications. The email infrastructure (Resend) already exists in `app/api/subscribe/route.ts`. Use it for deadline reminders.

8. **Fix the OnboardingWizard calculateMatches bug** -- At `OnboardingWizard.tsx:268-270`: `handleSituationSelect` calls `setSelectedSituation(situation)` then immediately `calculateMatches()`. Due to React's state batching, `selectedSituation` is still null when `calculateMatches` reads it. The situation's `visaWeights` are never factored into the match score.

### Medium Priority

9. **Add Korean and Vietnamese language support** -- The i18n system supports EN/JA/ZH-TW. Korean is critical for a Korea-based service (immigration office staff communicate in Korean). Vietnamese is the largest non-English expat community in Korea.

10. **Make comparison tool mobile-friendly** -- The "Add Visa" dropdown uses CSS `:hover` (`VisaComparisonTool.tsx:209`) which doesn't work on touch devices. Convert to click-based dropdown or use shadcn/ui `Popover`.

11. **Add visa-specific email segmentation** -- When James subscribes, ask his visa type and current status. Send him E-7 transition content instead of generic Seoul tips. The Airtable schema already has custom fields.

12. **Fix non-functional Settings button** -- `StateDashboard.tsx:147-152` renders a Settings icon with no click handler. Either wire it up or remove it.

---

## The James Test Score

**Overall: 32/100**

| Category | Score | Reasoning |
|----------|:-----:|-----------|
| Feature Completeness | 7/20 | Good breadth but most features are 50-70% complete. Dashboard can't advance states. Quiz doesn't know current visa. 6 of 12 visas are stubs. Two competing checklist systems. Settings button broken. |
| Real-World Value | 8/20 | Document Checklist is genuinely useful. Visa detail pages have good content. But nothing helps with E-2->E-7 transition specifically. No income calculator, no path simulator, no appointment tools. |
| Stickiness | 3/20 | localStorage only. No accounts. No notifications. No state advancement. Nothing changes over time. Nothing brings James back tomorrow. Only reason to return is to check off documents. |
| UX Quality | 9/20 | Visual design is polished. Animation, theming, responsive layouts are solid. But critical flows are broken (wizard match calculation bug, no state advancement, hover-only dropdown on mobile, non-functional Settings). Empty states and dead-end flows. |
| Payment Readiness | 5/20 | Pricing exists for soft landing (newcomers only, irrelevant to James). No visa-specific paid features. The features users would pay for (path simulator, income calculator, appointment sniper) don't exist. Free-to-paid boundary doesn't exist because there are no paid tools. |

---

**James's Final Verdict**: "LocalNomad looks professional and has clearly done the research. The Document Checklist is the only feature I'd use more than once. But nothing here understands that I'm an E-2 holder wanting to switch to E-7. I'd use it once to read the E-7 requirements page, then go back to Discord for actual transition advice. If the Visa Path Simulator existed and my checklist synced to my phone, I'd pay for it in a heartbeat."
