# Visa Change Path Simulator — Implementation Plan (Option A)

> **Status**: Draft v2 — contrarian #2 fixes applied, pending Gen final review
> **Created**: 2026-03-18
> **Updated**: 2026-03-18 (contrarian #2 fixes: data reconciliation, F-5 dependency, RSC flow, Schema.org)
> **Based on**: Korea transition research (fact-checked, 2 passes, 0 flags), SEO keyword research, 2x contrarian review, audience/legal analysis
> **Scope**: Korea only (v1). Taiwan/Japan deferred.

---

## 1. What We're Building

A mobile-first, card-based tool that answers: **"What visa can I change to from my current one, and what do I need?"**

NOT a wizard, NOT a recommendation engine, NOT a graph visualizer. Pure factual information display with source links.

### Core Value Proposition
- SEO magnet for long-tail keywords ("E-7 to F-2 visa Korea requirements")
- #1 product discovery priority from user research
- Extends existing pathsTo/pathsFrom data in visa JSONs with new fields + fills missing transition pairs

### What It Is NOT
- NOT immigration consulting (행정사법 compliance)
- NOT an eligibility checker (no scores, no "you qualify")
- NOT personalized guidance (no nationality selector, no user data stored server-side)

---

## 2. URL Structure (SEO-validated)

**Winner: `/visa/change/`** — scored 82.5 vs "switch" (49.5), "transition" (5.4)

Rationale: Matches both official terminology (체류자격변경 = "Change of Status") AND user search behavior ("how to change visa in Korea").

```
Hub:        /en/korea/visa/change/              → "change visa status Korea"
Detail:     /en/korea/visa/change/e-7-to-f-2    → "E-7 to F-2 visa Korea requirements"
            /en/korea/visa/change/b-2-to-f-1-d  → "change from tourist visa Korea"
            /en/korea/visa/change/h-1-to-e-7    → "working holiday to work visa Korea"
```

**Rejected alternatives:**
- `/from/e-7` + `/to/f-2` split → topical authority dilution
- `/switch/` → SEO weaker, not official terminology
- `/change-status/` → too verbose for URLs

---

## 3. UX Design (Mobile-First, Card-Based)

### Why NOT Dropdowns
Contrarian review finding: primary audience is "crisis-mode recent arrivals" (0-6 months). They:
- Don't know visa codes (know "work visa" not "E-7")
- Have low patience for form interactions
- Are on mobile (iOS picker wheels = bad UX for long lists)

### Hub Page — 2-Step Card Flow

**Step 1: "What's your current visa?"**
```
┌─────────────────────────────────┐
│  💼 Work                        │
│  ┌──────────┐ ┌──────────┐     │
│  │ E-7      │ │ D-8      │     │
│  │ Prof.    │ │ Investor │     │
│  │ Employ.  │ │ Startup  │     │
│  └──────────┘ └──────────┘     │
│                                 │
│  🎓 Study / Job Seeking         │
│  ┌──────────┐ ┌──────────┐     │
│  │ D-2      │ │ D-10     │     │
│  │ Student  │ │ Job      │     │
│  │          │ │ Seeking  │     │
│  └──────────┘ └──────────┘     │
│                                 │
│  🏠 Residence / Family          │
│  ┌──────────┐ ┌──────────┐     │
│  │ F-2      │ │ F-6      │     │
│  │ Long-term│ │ Marriage │     │
│  │ Resident │ │ Spousal  │     │
│  └──────────┘ └──────────┘     │
│                                 │
│  ✈️ Short-term                   │
│  ┌──────────┐ ┌──────────┐     │
│  │ F-1-D    │ │ H-1      │     │
│  │ Digital  │ │ Working  │     │
│  │ Nomad    │ │ Holiday  │     │
│  └──────────┘ ┌──────────┐     │
│               │ B-2      │     │
│               │ Tourist  │     │
│               └──────────┘     │
│                                 │
│  Not sure about your visa? →    │
└─────────────────────────────────┘
```

**Step 2: Show valid transitions (after card tap)**
- Only transitions confirmed for that visa
- Each card: target visa + key requirement + timeline + in-country badge
- Nationality-dependent paths: amber banner
- Dead-end visas: "Limited in-country options" message with alternatives

### Detail Page — `/change/e-7-to-f-2`
- Disclaimer ABOVE content
- Title: "E-7 → F-2: Change from Professional Employment to Residency"
- Collapsible sections (accordion on mobile):
  1. Key Requirements
  2. Timeline
  3. Required Documents
  4. Important Notes
  5. "The Bigger Picture" — multi-hop path text
- Disclaimer BELOW content
- Internal links to source + destination visa detail pages

### RSC Split & Data Flow (Contrarian #2 Fix)
- ~90% Server Components (all content display)
- Client Components: only the visa card selector (useState for selection state)
- **Hub page data flow**: Card tap updates URL via `?from=e-7` searchParams (NOT client state passing). Server Component reads `searchParams` to render TransitionResults. This preserves SSR, makes results shareable/bookmarkable, and is idiomatic App Router pattern.
- **Direct landing on detail pages**: Each `/change/e-7-to-f-2` page is fully self-contained (no Step 1 context needed). Includes "Other paths from E-7" related links section + breadcrumb navigation back to hub.

---

## 4. Data Model

### Existing Infrastructure
- `VisaTransitionPath` interface already in `lib/types/visa.ts:155-162`
- `pathsTo` and `pathsFrom` optional arrays on `VisaBase` (lines 296-297)
- JSON data files exist for 8 Korea visas; pathsTo/pathsFrom ARE already populated with the base 6-field schema (type, name, requirements, timeline, documents, notes)
- **Data reconciliation needed**: existing JSON has ~14 transitions; v1 plan targets 12; overlap is ~8. See Section 5a below.

### Extended Fields (additions only)

```typescript
// Extend existing VisaTransitionPath — do NOT add difficulty/commonality (행정사법 risk)
interface VisaTransitionPath {
  type: VisaType;           // existing — target visa
  name: string;             // existing — "F-2 Residency Visa"
  requirements: string;     // existing — key requirement summary
  timeline: string;         // existing — "1-3 years on E-7 first"
  documents: string[];      // existing — required documents
  notes: string;            // existing — caveats

  // NEW fields:
  officiallyDocumented: boolean;  // is this in official government guidelines?
  mustExitCountry: boolean;       // must leave Korea to apply?
  nationalityDependent: boolean;  // varies by passport?
  nationalityNotes?: string;      // e.g., "Only 17 countries can change in-country"
  sourceUrl?: string;             // official source link
  confidenceLevel: 'high' | 'medium';  // from fact-check (no 'low' — those are excluded)
  ultimateDestination?: string;   // multi-hop text, e.g., "Step 2 of: H-1→E-7→F-2→F-5"
}
```

### Fields Explicitly REMOVED (legal compliance)
- ~~`difficulty: 'straightforward' | 'moderate' | 'complex'`~~ → 행정사법 violation risk
- ~~`commonality: 'very-common' | 'common' | 'rare'`~~ → subjective assessment

---

## 5a. Data Reconciliation (Contrarian #2 Fix)

Existing JSON data already has ~14 transitions populated. Plan v1 targets 12. Here's the reconciliation:

### In Plan AND in JSON (extend with new fields): 8 transitions
| From | To | Action |
|------|----|--------|
| E-7 | F-2 | Extend with 6 new fields |
| D-10 | E-7 | Extend |
| D-10 | D-8 | Extend |
| D-10 | F-1-D | Extend |
| H-1 | E-7 | Extend (add nationalityDependent data) |
| B-2 | F-1-D | Extend |
| F-1-D | E-7 | Extend (add confidenceLevel: medium) |
| F-1-D | D-10 | Extend (add confidenceLevel: medium) |

### In Plan but NOT in JSON (create new): 4 transitions
| From | To | Action |
|------|----|--------|
| E-7 | F-5 | **Create** (needs F-5 data file — Phase 0) |
| D-8 | F-2 | **Create** (F-2-5 route, USD 500K + 3yr or USD 300K + 2 employees) |
| D-8 | F-5 | **Create** (needs F-5 data file — Phase 0) |
| F-6 | F-5 | **Create** (needs F-5 data file — Phase 0) |
| F-2 | F-5 | **Create** (needs F-5 data file — Phase 0) |

### In JSON but NOT in Plan: 6 transitions — INCLUDE in v1
| From | To | Decision |
|------|----|----------|
| D-2 → E-7 (pathsFrom on E-7) | Already in JSON | **Include** — common graduate path |
| F-1-D → E-7 (pathsFrom on E-7) | Already in JSON | **Include** — already in plan |
| H-1 → E-7 (pathsFrom on E-7) | Already in JSON | **Include** — already in plan |
| D-10 → D-8 | Already in JSON | **Include** — startup path |
| D-10 → F-1-D | Already in JSON | **Include** — nomad pivot |
| D-2 → D-10 (pathsFrom on D-10) | Already in JSON | **Include** — graduate job-seeking |

### Deferred to v2
| From | To | Reason |
|------|----|--------|
| D-10 → D-2 | Reverse path (job-seeking back to student) — uncommon, no D-2 data file |
| E-7 → D-2 | Reframed: E-type exempt from D-2, not a formal status change |

### Phase 0 Prerequisite (NEW)
- **Create F-5 visa data file** (`data/visas/korea/en/f-5.json`) — required before 4 transition detail pages can link to it
- Add `f-5` to `AVAILABLE_VISAS` in `lib/visa-data.ts`
- D-2 deferred — no D-2 data file needed for v1

---

## 5. Verified Transition Data (Fact-Checked, 0 Flags)

### Korea Transition Matrix

```
FROM → TO      E-7   F-2   F-5   D-10  D-2   F-4
─────────────────────────────────────────────────
F-1-D          ⚠️M   ⚠️M   ❌    ⚠️M   ⚠️M    🔒
E-7             —    ✅    ✅    ⚠️    ※     🔒
D-8             —    ✅    ✅    ❌    ❌     🔒
H-1            🔒    ❌    ❌    ❌    ❌     🔒
F-2             —     —    ✅    ❌    ⚠️    🔒
F-6             —     —    ✅    ❌    ⚠️    🔒
D-10           ✅     —    ❌     —    ✅     🔒
B-2→F-1-D     ⚠️

✅ verified | ⚠️ conditional (M=medium confidence) | 🔒 nationality-dependent | ❌ impossible | ※ exempt
```

### Critical Corrections from Fact-Check

| # | Original | Corrected | Source |
|---|----------|-----------|--------|
| 1 | F-6→F-5: "TOPIK 4+ or KIIP" | **KIIP Level 5 only** (TOPIK not accepted since March 2019) | pureumlawoffice.com |
| 2 | D-8→F-2-5: "KRW 1.5B immediate" | **REMOVED** — 1.5B is F-2-12, not F-2-5. Added USD 300K + 2 employees route | KOTRA, allvisakorea |
| 3 | F-5-16: "80 points" | **Clarified** — 80pts is F-2-7 entry threshold, not F-5-16 requirement | kowork.kr |
| 4 | E-7→D-2: "in-country change" | **Reframed** — E-type holders exempt from D-2 requirement (can enroll without status change) | Yonsei GOSC |

### Passport/Nationality Dependencies

| Transition | Dependency | Detail |
|-----------|-----------|--------|
| H-1 → E-7 (in-country) | 17 countries only | JP, HK, TW, AU, CA, NZ, DE, SE, CZ, AT, ES, PL, HU, PT, NL, AR, AD |
| H-1 → E-7 (must exit) | 8 countries | FR, UK, IE, IT, BE, DK, IL, CL |
| H-1 visa itself | 26 countries | Bilateral agreement required |
| F-4 | Ethnic Koreans only | Must prove Korean descent |
| B-2 entry | Nationality-dependent | Visa-exempt duration varies |

### Common Multi-Hop Paths (text content, not algorithm)

1. **H-1 → E-7 → F-2 → F-5** (Working Holiday → PR): 5-8 years
2. **D-10 → E-7 → F-2 → F-5** (Job Seeker → PR): 4-7 years
3. **F-1-D → E-7 → F-2 → F-5** (Digital Nomad → PR): F-1-D time doesn't count
4. **D-8 → F-2-5 → F-5-5** (Investor → PR): 3-8 years
5. **F-6 → F-5-2** (Marriage → PR): ~2 years (fastest path to PR in Korea)

---

## 6. Legal Guardrails (Non-Negotiable)

### Korea (행정사법 + 변호사법)
- ✅ Display published requirements with source links
- ✅ Date calculators, checklists, factual comparison
- ❌ "You qualify", "eligible", "recommended visa"
- ❌ Difficulty ratings, scores, match percentages
- ❌ Personalized immigration guidance

### Disclaimer (appears ABOVE and BELOW results)
> Based on published Korean immigration guidelines. This is not legal advice.
> For your specific situation, consult a licensed immigration consultant (행정사) or attorney (변호사).
> Final decisions on visa status changes rest solely with Korea Immigration Service.

### Nationality Handling
- NO nationality selector input (avoids profiling / 행정사법 territory)
- Nationality-dependent paths show amber caveat banner
- Link to source visa detail page for country-specific info

### Data Storage
- All user interaction is client-side only (no server storage of visa selections)
- No cookies or tracking of which visa a user selects

---

## 7. Component Architecture

```
app/[locale]/[country]/visa/change/
├─ page.tsx                      → Hub page (Server Component)
├─ [transition]/
│  └─ page.tsx                  → Detail page: e-7-to-f-2 (Server Component)
└─ layout.tsx                   → Shared layout with disclaimers

components/visa-change/
├─ VisaCardSelector.tsx          → Step 1: select current visa (Client — useState)
├─ TransitionResults.tsx         → Step 2: show valid transitions (Server)
├─ TransitionDetailCard.tsx      → Individual transition card (Server)
├─ TransitionTimeline.tsx        → Visual timeline steps (Server, CSS only)
├─ NationalityBanner.tsx         → Amber caveat for passport-dependent (Server)
├─ MultiHopGuide.tsx            → "The bigger picture" section (Server)
├─ ChangeDisclaimer.tsx          → Legal disclaimer (Server)
└─ RenewalAlternative.tsx       → "Stay on this visa" option (Server)

lib/
├─ visa-transitions.ts          → getTransitionsFrom(visa), getTransitionsTo(visa)
└─ types/visa.ts                → Extended VisaTransitionPath (existing file)
```

### RSC Budget: ~90% Server
Only `VisaCardSelector.tsx` is Client (needs useState for selection state).

---

## 8. SEO Strategy

### Target Keywords (validated by research)

| # | Keyword | Target Page |
|---|---------|-------------|
| 1 | change visa status Korea | `/change/` hub |
| 2 | E-7 to F-2 visa Korea requirements | `/change/e-7-to-f-2` |
| 3 | how to change visa in Korea | `/change/` hub |
| 4 | Korea visa change requirements | `/change/` hub |
| 5 | D-2 to E-7 visa change Korea | `/change/d-2-to-e-7` |
| 6 | change from tourist visa Korea | `/change/b-2-to-f-1-d` |
| 7 | F-6 to F-5 permanent residence Korea | `/change/f-6-to-f-5` |
| 8 | working holiday to work visa Korea | `/change/h-1-to-e-7` |
| 9 | D-10 to E-7 Korea | `/change/d-10-to-e-7` |
| 10 | F-2-7 points visa E-7 holder | `/change/e-7-to-f-2` |

### Structured Data (Contrarian #2 Fix)
- Schema.org `Article` for each transition detail page (NOT `HowTo` — transition pages show requirements/timelines, not step-by-step procedures. `HowTo` is reserved for applicationSteps on visa detail pages.)
- Schema.org `FAQPage` for common questions
- Schema.org `BreadcrumbList` for navigation

### Internal Linking
- Each visa detail page (`/visa/e-7`) → link to `/visa/change/` in "Next Steps" section
- Each transition detail page → link back to source and target visa pages
- Hub page → link to all visa detail pages

### Static Generation
- `generateStaticParams` for all confirmed transition pairs
- ISR (revalidate: 86400) for detail pages — data changes infrequently

---

## 9. v1 Scope (Korea Only)

### Pages to Build

**Hub**: 1 page
**Detail pages**: 12 confirmed transitions

| From | To | Confidence | Nationality-dependent |
|------|----|-----------|----------------------|
| E-7 | F-2 | HIGH | No |
| E-7 | F-5 | HIGH | No |
| D-8 | F-2 | HIGH | No |
| D-8 | F-5 | HIGH | No |
| F-2 | F-5 | HIGH | No |
| F-6 | F-5 | HIGH | No |
| D-10 | E-7 | HIGH | No |
| D-10 | D-2 | HIGH | No |
| H-1 | E-7 | HIGH | **Yes** (17 countries in-country, 8 must exit) |
| B-2 | F-1-D | HIGH | No |
| F-1-D | E-7 | MEDIUM | No |
| F-1-D | D-10 | MEDIUM | No |

### Explicitly Deferred to v2
- Taiwan + Japan transitions
- Interactive graph visualization (Option B)
- TransitionMatrix table component (mobile-unfriendly)
- Multi-language (ja, vi, zh-cn for transition content)
- Renewal vs. change comparison tool
- Analytics event tracking for card interactions

---

## 10. Implementation Phases

### Phase 0: F-5 Visa Data (prerequisite, 1 day)
- Research F-5 permanent residence (all sub-categories: F-5-1, F-5-2, F-5-5, F-5-6, F-5-7, F-5-11, F-5-16, F-5-17)
- Create `data/visas/korea/en/f-5.json` following existing schema
- Add `f-5` to `AVAILABLE_VISAS` in `lib/visa-data.ts` and `visa-data.ts` registry
- Add `f-5` to `sitemap.ts` if applicable
- Fact-check F-5 data (0-flag target)

### Phase 1: Data Extension (1 day)
- **Extend** existing pathsTo/pathsFrom in 8 Korea visa JSONs with 6 new fields (officiallyDocumented, mustExitCountry, nationalityDependent, nationalityNotes, sourceUrl, confidenceLevel, ultimateDestination)
- **Add** missing transition pairs per Section 5a reconciliation table (~6 new entries)
- **Add** `lastUpdated` field per transition path (contrarian #2 recommendation)
- Create `lib/visa-transitions.ts` helper functions
- Verify TypeScript types compile
- **Route note**: Next.js App Router resolves literal `change/` before dynamic `[type]`. No conflict. Verify in QA.

### Phase 2: Pages + Components (2 days)
- Hub page with VisaCardSelector
- Detail page template with all sections
- Generate 12 detail pages from data
- `generateStaticParams` for static generation
- Disclaimers above + below
- Nationality banner component

### Phase 3: SEO + Internal Links (0.5 day)
- Schema.org structured data (HowTo, FAQ, Breadcrumb)
- Dynamic meta title/description per transition
- OG images (auto-generated)
- Sitemap additions
- Internal links from existing visa pages

### Phase 4: QA + Polish (0.5 day)
- Mobile testing (375px, 390px, 414px viewports)
- Touch target verification (44px minimum)
- Disclaimer placement check
- Source URL verification (all links work)
- Lighthouse mobile ≥ 90

**Total: ~5 days** (Phase 0 adds 1 day for F-5 data prerequisite)

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| MEDIUM confidence paths turn out wrong | Medium | High | Caveat text + "verify at immigration office" + exclude from v1 if needed |
| 행정사법 complaint | Low | Critical | No subjective ratings, no eligibility language, disclaimers everywhere |
| SEO cannibalization with existing visa pages | Medium | Medium | Transition pages target "[from] to [to]" long-tails, visa pages target "[visa] requirements" |
| Korea immigration policy change | Medium | Medium | lastUpdated field on each transition, quarterly review cycle |
| Mobile UX fails for crisis users | Medium | High | Design mockup review before build, real device testing |

---

## 12. Success Metrics (Post-Launch)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Pages indexed by Google | 13 pages within 4 weeks | Google Search Console |
| Organic clicks on "E-7 to F-2" keywords | Top 10 within 3 months | GSC |
| Hub page bounce rate | < 50% | GA4 |
| Detail page avg. time on page | > 2 minutes | GA4 |
| Click-through to visa detail pages | > 20% of visitors | GA4 events |

---

## 13. Open Questions for Gen

1. **MEDIUM confidence paths (F-1-D → E-7, F-1-D → D-10)**: Include in v1 with caveats, or defer?
2. **F-4 (Overseas Korean)**: Ethnicity-gated — include in selector or omit from v1?
3. **"Not sure about your visa?" flow**: Simple FAQ page, or brief matcher (describe your situation → we suggest which visa page to read)?
4. **Content tone**: Formal/official or friendly/approachable?

---

## 14. Source Appendix (SoT Verification)

28 claims verified. 4 Gov sources, 21 practitioner sources, 3 unverified.

### Gov Sources (Direct)

| Claim | Source | URL |
|-------|--------|-----|
| Fees: ₩200K F-5, ₩100K standard | law.go.kr 시행규칙 72조 | https://www.law.go.kr/LSW//lumLsLinkPop.do?lspttninfSeq=82731&chrClsCd=010202 |
| GNI 2024: ₩49,955,000 | korea.net (BOK announcement) | https://www.korea.net/NewsFocus/Business/view?articleId=267498 |
| ARC fee: ₩35,000 (2025.1.1~) | immigration.go.kr notice | https://www.immigration.go.kr/immigration_eng/1832/subview.do?enc=Zm5jdDF8QEB8... |
| F-1-D requirements | MOFA LA consulate | https://overseas.mofa.go.kr/us-losangeles-en/brd/m_26385/view.do?seq=12 |
| Immigration Control Act full text | law.go.kr | https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=251683 |

### Practitioner Sources (Cross-Referenced)

| Claim # | Topic | Primary Source | URL |
|---------|-------|---------------|-----|
| 1 | E-7→F-2-7 | kowork.kr | https://kowork.kr/en/visa/F-2-7 |
| 2 | E-7→F-5-1 | immikorea.com | https://immikorea.com/en/f-5-1-general-permanent-residence-requirements/ |
| 3,4 | D-8→F-2-5/F-5-5 | allvisakorea.com | https://www.allvisakorea.com/en/post/f2-visa-f-2-5-f5-permanent-residency-f-5-5... |
| 5,27 | F-2→F-5-16 | immikorea.com | https://immikorea.com/en/f-5-16-green-card-change-from-f-2-7-visa-to-f-5-visa/ |
| 6,22 | F-6→F-5-2 | pureumlawoffice.com | https://pureumlawoffice.com/blog-updates/how-to-apply-korean-f-5-visa/ |
| 7,16 | D-10 updates | kowork.kr | https://kowork.kr/en/blog/d10-2025-update-en |
| 9,10 | H-1→E-7 countries | kowork.kr | https://kowork.kr/en/blog/fromH-1toE-7-en |
| 11 | B-2→F-1-D | digitalnomadskorea.com | https://www.digitalnomadskorea.com/post/everything-you-need-to-know-about-koreas-digital-nomad-visa |
| 15 | TOPIK not accepted since 2019 | pureumlawoffice.com | https://pureumlawoffice.com/permanent-residency-in-korea-f-5-visa/ |
| 18 | F-5 ARC 10yr renewal | relinconsultants.com | https://relinconsultants.com/alien-resident-card-south-korea/ |
| 19,20 | F-5 re-entry/revocation | pureumlawoffice.com | https://pureumlawoffice.com/permanent-residency-in-korea-f-5-visa/ |
| 21 | F-5-1 requirements | immikorea.com | https://immikorea.com/en/f-5-1-general-permanent-residence-requirements/ |
| 25 | F-5-7 (F-4 route) | immikorea.com | https://immikorea.com/en/requirements-and-procedures-for-applying-for-a-permanent-resident-visa-for-overseas-koreans-f4-visa-f5-visa/ |
| 26 | F-5-11 | immikorea.com | https://immikorea.com/en/f-5-11-visa-holder-of-ability-in-a-specific-field/ |

### Unverified (3 claims, action needed)

| # | Claim | Action |
|---|-------|--------|
| 12 | F-1-D→E-7 in-country | Keep with caveat: "Verify with local immigration office" |
| 24 | F-5-6 thresholds (₩20M pension, ₩300M assets) | Keep with caveat: "Approximate, confirm at immigration office" |
| 28 | F-5-17 (HSP PhD Top200 + USD80K) | Remove from v1. No public source confirms this combination. |

### Gov Access Limitation Note

immigration.go.kr blocks automated access (HTTP errors, JS-rendered pages). The primary SoT document (Visa Navigator PDF) is image-based and requires OCR. For production, recommend:
1. Manual verification of key claims at immigration office or via 1345 hotline
2. Quarterly re-verification cycle against immigration.go.kr (manual browser check)
3. law.go.kr for legal text (accessible via API-like URLs)
4. korea.net for official government announcements

---

*Plan version: 2.0 | Updated: 2026-03-18 | Status: Ready for execution pending Gen approval*
