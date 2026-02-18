# Phase 1-2: Visa Data Structure, Legal Pages, Footer, GA4

## Context
- Phase 1-1 is complete: Next.js 16 + shadcn/ui + next-intl + landing hero
- This phase adds: visa data schema, F-1-D data, data loader, legal pages, footer, GA4
- Read CLAUDE.md before starting — especially Legal Bright Lines and Taiwan Legal Bright Lines

## Prerequisites
- Read all relevant skill files in `.claude/skills/` before writing code
- Branch: work directly on `main` (per release strategy)

---

## Step 1: Visa Type Schema — `lib/types/visa.ts`

Create the visa type definitions. Use **Option B: shared base + country extensions**.

### VisaBase (shared fields ~80%)
Port from v1 `lib/visa/types.ts` (on `v1-archive` branch) with these changes:
- **REMOVE** `isStub` — no stub pages in v2
- **REMOVE** `eligibilityQuestions` — no eligibility quiz in v2
- **REMOVE** all Quiz types (`QuizStep`, `MatchLevel`, `QuizAnswers`, `QuizQuestionConfig`, `QuizOption`, `VisaRecommendation`, `VisaPathStep`, `VisaPath`, `QuizQuestion`, `QuizResult`)
- **REMOVE** all Dashboard types — will be in `lib/types/dashboard.ts` (Phase 1-4)
- **REMOVE** all Comparison types — will be in `lib/types/comparison.ts` (Phase 2)
- **REMOVE** all API Response types — will be in separate file when needed
- **REMOVE** all User/Checklist/Notification types — Phase 1-4
- **KEEP** `renewal` field (VisaRenewalInfo) — needed for both Korea and Taiwan
- **KEEP** `communityTips` field (CommunityTip)
- **KEEP** `country` field — useful for Korea/Taiwan distinction

### KoreaVisa = VisaBase + Korea-only fields
```typescript
interface KoreaVisa extends VisaBase {
  country: "kr";
  insuranceRequirement?: { minimumCoverage: string; type: string; notes: string; source?: string };
  gniBasedIncome?: { year: number; gniPerCapita: number; multiplier: number; threshold: number; source: string; lastUpdated: string };
  fixedIncomeRequirement?: { amount: number; currency: string; period: "annual" | "monthly"; notes?: string };
}
```

### TaiwanVisa = VisaBase + Taiwan-only fields
```typescript
interface TaiwanVisa extends VisaBase {
  country: "tw";
  agencySteps?: AgencyStep[];
  tecoInfo?: TECOAuthenticationInfo;
  goldCardFields?: { categories: string[]; openWorkPermit: boolean; taxBenefit?: string };
  goldCardComparison?: { disclaimer: string; comparisonTable: { criterion: string; dnv: string; goldCard: string }[] };
  tecoRouting?: { description: string; notes: string; officialLink: { label: string; url: string }; exampleRegions: { region: string; office: string }[] };
}
```

### Supporting types to include
Port these from v1 `lib/visa/types.ts`:
- `Requirement`, `Document`, `ApplicationStep`, `FAQ`
- `VisaTransitionPath`, `CommunityTip`, `VisaRenewalInfo`
- `KoreaVisaType`, `TaiwanVisaType`, `VisaType` (union)
- `VisaCategory`
- `KOREA_VISA_TYPES`, `TAIWAN_VISA_TYPES` arrays
- `isKoreaVisa()`, `isTaiwanVisa()` type guards

Port Taiwan-specific types from v1 `lib/visa/tw-types.ts`:
- `TECOAuthenticationInfo`, `AgencyStep`

Export a union type: `type Visa = KoreaVisa | TaiwanVisa;`

---

## Step 2: F-1-D JSON Data — `data/visas/en/f-1-d.json`

Copy the F-1-D data from v1-archive branch:
```bash
git show v1-archive:data/visas/en/f-1-d.json > data/visas/en/f-1-d.json
```

Create the directory structure:
```
data/visas/
├── en/
│   └── f-1-d.json
├── ja/        (empty for now — Phase 2)
└── zh-tw/     (empty for now — Phase 2)
```

Also copy the v1 Japanese and Chinese versions for reference (Phase 2 will use them):
```bash
git show v1-archive:data/visas/ja/f-1-d.json > data/visas/ja/f-1-d.json
git show v1-archive:data/visas/zh-tw/f-1-d.json > data/visas/zh-tw/f-1-d.json
```

**IMPORTANT**: Remove `eligibilityQuestions` field from the JSON if present — we don't use eligibility quiz in v2.

---

## Step 3: Data Loader — `lib/visa-data.ts`

Create a typed data loader function:

```typescript
import type { Visa, KoreaVisa, TaiwanVisa } from "@/lib/types/visa";

export async function getVisaData(
  country: "korea" | "taiwan",
  locale: string,
  visaType: string
): Promise<Visa | null> {
  // Map country to data directory
  // For Taiwan: data/visas/tw/en/gold-card.json
  // For Korea: data/visas/en/f-1-d.json
  // Return null if file not found
  // Use dynamic import or fs.readFile for JSON
}

export async function getAvailableVisas(
  country: "korea" | "taiwan",
  locale: string
): Promise<Visa[]> {
  // Return all visa data files for a country/locale
}
```

- Use **Server Component compatible** approach (no client-side imports)
- Type-safe: return `KoreaVisa` or `TaiwanVisa` based on country parameter
- Handle missing files gracefully (return null, don't throw)

---

## Step 4: Footer Component

Create `components/footer.tsx` based on v1 footer (on `v1-archive` branch: `components/footer.tsx`).

Footer content:
```
© 2026 LocalNomad · Terms of Service · Privacy Policy · Refund Policy
```

Requirements:
- Server Component (no "use client")
- Use next-intl for translations (add footer keys to messages/*.json)
- Links point to `/[locale]/terms`, `/[locale]/privacy`, `/[locale]/refund`
- Legal disclaimer text at bottom (from v1: "Based on published requirements. Not legal advice.")
- Style: minimal, matches brand (#1B4965)
- Add footer to `app/[locale]/layout.tsx` so it appears on all pages

v1 footer also had Instagram and Substack links — keep those:
- Instagram: https://www.instagram.com/localnomad.club/
- Newsletter (Substack): https://startofsomethingnew.substack.com/

---

## Step 5: Legal Pages (v1 → v2 update)

Create three legal pages under `app/[locale]/(legal)/`:
- `terms/page.tsx`
- `privacy/page.tsx`
- `refund/page.tsx`

### Terms of Service — v2 changes from v1:
Port from `v1-archive:app/(legal)/terms/page.tsx` with these modifications:

| Section | Change |
|---------|--------|
| Intro | "purchasing our services" → "using our services" |
| 1. Description of Services | Replace Playbook/Consulting/Boots-on-the-Ground with: **Visa Information Platform** (visa detail pages, comparison tools, dashboards). "Currently free. Paid features will be announced separately when introduced." |
| 2. IP & License | Replace Playbook download license with: website content license — personal reference use only, no commercial reproduction/redistribution |
| 3. Payments and Refunds | Replace with: "LocalNomad is currently a free service. When paid features are introduced, separate payment terms and refund policies will be published." |
| 4. Limitation & Disclaimer | **KEEP AS-IS** — 행정사법/변호사법 disclaimer is critical for v2 |
| 5. Accuracy | "Playbooks" → "our website" |
| 6. User Responsibilities | "onboarding process" → "website and services" |
| 7-8 | **KEEP AS-IS** |
| Last Updated | Change to current date |

### Privacy Policy — v2 changes from v1:
Port from `v1-archive:app/(legal)/privacy/page.tsx` with these modifications:

| Section | Change |
|---------|--------|
| 1. Information We Collect | Replace "Soft Landing packages, WhatsApp/Telegram, Relocation Data" with: Email (magic link signup via Supabase). Dashboard usage: visa type selection, checklist progress. Taiwan data: browser-only (never transmitted to server per CLAUDE.md Taiwan Data Rules) |
| 2. Processing Purposes | Replace Playbook/Consulting with: Visa information delivery, dashboard functionality, service improvement analytics |
| 3. Third-Party Services | Replace LemonSqueezy/Calendly/Zoom with: **Supabase** (authentication and database), **Google Analytics (GA4)** (website analytics) |
| 4-7 | **KEEP AS-IS** — GDPR/PIPA, retention, rights, contact info |
| Last Updated | Change to current date |

### Refund Policy — v2 complete replacement:
Replace entire v1 content with a simple page:

```
Refund Policy
Last Updated: [current date]

LocalNomad is currently a free service. When paid features are introduced,
a detailed refund policy will be published here.

For questions, contact us at hey@localnomad.club.
```

### Legal page styling:
- Server Components (no "use client")
- Use the same article layout pattern from v1: `py-24 px-6`, `max-w-3xl`, `space-y-8`
- Include footer on all legal pages
- NO header component yet (not built in Phase 1-1) — just a "← Back to home" link at top

---

## Step 6: Google Analytics (GA4)

GA4 Measurement ID: `G-88CXCRYQRV`

### Setup:
1. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G-88CXCRYQRV
   ```

2. `@next/third-parties` is already installed. Add `GoogleAnalytics` to the root layout:
   ```typescript
   // app/[locale]/layout.tsx
   import { GoogleAnalytics } from "@next/third-parties/google";

   // Inside layout, after </body> or in <head>:
   <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
   ```

3. Also add GA ID to `.env.local.example` (without the actual value):
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

---

## Step 7: Update i18n Messages

Add footer and legal page translation keys to all locale files (`messages/en.json`, `messages/ja.json`, `messages/zh-tw.json`, `messages/vi.json`):

```json
{
  "Footer": {
    "copyright": "© {year} LocalNomad",
    "terms": "Terms of Service",
    "privacy": "Privacy Policy",
    "refund": "Refund Policy",
    "tagline": "Visa clarity, finally.",
    "legalDisclaimer": "Based on published requirements. Not legal advice. LocalNomad does not file applications, provide legal representation, or broker connections to licensed professionals."
  }
}
```

For ja/zh-tw/vi: translate the footer strings appropriately.

---

## Step 8: Verification Checklist

After completing all steps, verify:

- [ ] `lib/types/visa.ts` exports VisaBase, KoreaVisa, TaiwanVisa, Visa union type
- [ ] No Quiz/Dashboard/Comparison/API types in visa.ts
- [ ] `data/visas/en/f-1-d.json` loads without errors
- [ ] `lib/visa-data.ts` — `getVisaData('korea', 'en', 'f-1-d')` returns typed data
- [ ] Footer appears on all pages with correct links
- [ ] `/en/terms`, `/en/privacy`, `/en/refund` pages render correctly
- [ ] Terms Section 4 (행정사법/변호사법 disclaimer) is intact
- [ ] Privacy Section 3 lists Supabase and GA4 (not LemonSqueezy/Calendly)
- [ ] Refund page shows single-paragraph free service message
- [ ] GA4 loads on all pages (check browser DevTools → Network → filter "google")
- [ ] `npm run build` passes with no errors
- [ ] No `eligibilityQuestions` in any JSON file
- [ ] No `isStub` in any type definition

## Constraints
- Follow CLAUDE.md rules strictly (Server Components default, no modifying components/ui/, use cn(), kebab-case files, PascalCase components)
- Legal pages: KEEP 행정사법/변호사법 disclaimer intact — this is legally required
- Taiwan data rules: client-side only (localStorage), never transmit to server
- Do NOT commit `.env.local` to git
