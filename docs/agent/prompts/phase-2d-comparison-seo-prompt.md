# Phase 2-D: Comparison Tool + SEO

> **Goal**: (1) Visa comparison tool (side-by-side), (2) SEO fundamentals (sitemap, OG images, internal links)
> **Checkpoint**: 비교 도구 작동 + Google 검색 노출 준비 완료

---

## Pre-Flight Checks

1. Read `lib/visa-data.ts` — `getAvailableVisas()` returns VisaSummary[]
2. Read `lib/types/visa.ts` — VisaBase, VisaSummary types
3. Read `app/[locale]/[country]/page.tsx` — country listing (where comparison entry point goes)
4. Read `data/visas/en/f-1-d.json` — understand data fields available for comparison
5. Read `messages/en.json` — existing translation keys

---

## Part 1: Comparison Tool

### 1-1. New Route

Create: `app/[locale]/[country]/compare/page.tsx`

This is a **Client Component** page (needs interactivity for visa selection + comparison state).

**URL**: `/en/korea/compare` or `/en/korea/compare?visas=f-1-d,e-7`

**Runtime flow:**
1. User visits `/en/korea/compare` (or clicks "Compare" button on listing page)
2. Page loads all visa summaries via server + passes as props
3. User selects 2 visas from dropdown (mobile) or up to 4 (desktop)
4. Side-by-side comparison table renders
5. All data is client-side (no server round-trips after initial load)

### 1-2. Comparison Layout

**Mobile (default):** 2 visas side-by-side, swipe for more
**Desktop (md+):** Up to 4 visas in columns

### 1-3. Comparison Fields

Compare these fields from visa JSON:

| Section | Fields |
|---------|--------|
| Overview | `shortName`, `tagline`, `category` |
| Duration | `duration.initial`, `duration.extension`, `duration.maxTotal` |
| Fees | `fees.application`, `fees.extension` |
| Income | `incomeRequirement.amount` + `incomeRequirement.currency` (if exists) |
| Processing | `processingTime.typical` |
| Work | `workPermission.allowed`, `workPermission.restrictions[]` |
| Documents | `documents.length` (count), link to detail page |
| Key Requirement | `keyRequirement` |

### 1-4. Component Structure

```
app/[locale]/[country]/compare/
  page.tsx            — Server: loads visa data, wraps client component
components/visa/
  comparison-tool.tsx — Client: visa selector + comparison table
  comparison-card.tsx — Client: single visa column in comparison
  index.ts           — Update barrel export
```

### 1-5. Entry Points

Add a "Compare Visas" button to the country listing page (`app/[locale]/[country]/page.tsx`):

```tsx
<Link
  href={`/${country}/compare`}
  className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
>
  {t('compareVisas')}
</Link>
```

Add to `messages/en.json` `Country` section:
```json
"compareVisas": "Compare visas side by side"
```

### 1-6. Legal Compliance

- ❌ Do NOT rank visas by "fit" or "suitability"
- ❌ Do NOT show match scores, percentages, or recommendations
- ✅ Factual side-by-side data only
- ✅ Disclaimer at bottom: "Based on published requirements. Not legal advice."
- For Taiwan comparison (future): follow Taiwan legal bright lines from CLAUDE.md

---

## Part 2: SEO Fundamentals

### 2-1. Sitemap

Create: `app/sitemap.ts`

```typescript
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://localnomad.club';

const LOCALES = ['en', 'ja', 'zh-cn', 'zh-tw', 'vi'];
const COUNTRIES = ['korea', 'taiwan'];

// Korea visas available in Phase 2
const KOREA_VISAS = ['f-1-d', 'e-7', 'd-8', 'f-2', 'h-1'];

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  // Landing pages per locale
  for (const locale of LOCALES) {
    urls.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    });
  }

  // Country pages
  for (const locale of LOCALES) {
    for (const country of COUNTRIES) {
      urls.push({
        url: `${BASE_URL}/${locale}/${country}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  // Visa detail pages (Korea only for now)
  for (const locale of LOCALES) {
    for (const visa of KOREA_VISAS) {
      urls.push({
        url: `${BASE_URL}/${locale}/korea/visa/${visa}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // Comparison pages
  for (const locale of LOCALES) {
    for (const country of COUNTRIES) {
      urls.push({
        url: `${BASE_URL}/${locale}/${country}/compare`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  // Legal pages
  for (const locale of LOCALES) {
    for (const page of ['terms', 'privacy', 'refund']) {
      urls.push({
        url: `${BASE_URL}/${locale}/${page}`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      });
    }
  }

  return urls;
}
```

### 2-2. robots.txt

Create: `app/robots.ts`

```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/onboarding', '/auth/'],
      },
    ],
    sitemap: 'https://localnomad.club/sitemap.xml',
  };
}
```

### 2-3. OG Images

Add Open Graph metadata to key pages:

**File: `app/[locale]/[country]/visa/[type]/page.tsx`** (already has generateMetadata)

Ensure `generateMetadata` includes:
```typescript
openGraph: {
  title: `${visa.shortName} Visa Guide — LocalNomad`,
  description: visa.description,
  type: 'article',
  siteName: 'LocalNomad',
  url: `https://localnomad.club/${locale}/${country}/visa/${type}`,
},
twitter: {
  card: 'summary_large_image',
  title: `${visa.shortName} Visa Guide — LocalNomad`,
  description: visa.tagline,
},
```

**File: `app/[locale]/[country]/page.tsx`** (country listing)

Add similar OG tags in `generateMetadata`.

**File: `app/[locale]/layout.tsx`** (root layout)

Add default OG metadata:
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://localnomad.club'),
  title: {
    template: '%s — LocalNomad',
    default: 'LocalNomad — Visa Clarity, Finally',
  },
  description: 'Everything you need to know about Korea and Taiwan visas.',
  openGraph: {
    siteName: 'LocalNomad',
    type: 'website',
  },
};
```

### 2-4. Internal Links

Add cross-linking between pages:

**Visa detail page → Related visas section:**
The `relatedVisas` field in each JSON already lists related visa types. Render these as clickable links at the bottom of each visa detail page:

```tsx
{visa.relatedVisas?.map((relatedType) => (
  <Link
    key={relatedType}
    href={`/${country}/visa/${relatedType}`}
    className="..."
  >
    {relatedType.toUpperCase()}
  </Link>
))}
```

**Country listing → Each visa detail:**
Already handled in Part 1 (listing page links to detail).

**Visa detail → Country listing (breadcrumb):**
Already exists from Phase 1 repairs (breadcrumb component).

### 2-5. Schema.org for Country Page

Add JSON-LD to the country listing page:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${displayName} Visa Guide`,
      description: `Complete visa guide for ${displayName}`,
      url: `https://localnomad.club/${locale}/${country}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: visas.map((visa, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://localnomad.club/${locale}/${country}/visa/${visa.type}`,
          name: `${visa.shortName} — ${visa.tagline}`,
        })),
      },
    }),
  }}
/>
```

---

## Translation Keys to Add

### `messages/en.json`

```json
"Country": {
  "title": "{country} Visa Guide",
  "subtitle": "Find the right visa for your stay in {country}. Compare requirements, documents, and timelines.",
  "comingSoon": "Visa information for this country is coming soon.",
  "visaCount": "{count} visa types available",
  "compareVisas": "Compare visas side by side"
},
"Comparison": {
  "title": "Compare Visas — {country}",
  "selectVisa": "Select a visa",
  "addVisa": "Add visa to compare",
  "removeVisa": "Remove",
  "overview": "Overview",
  "duration": "Duration",
  "fees": "Fees",
  "income": "Income Requirement",
  "processing": "Processing Time",
  "work": "Work Permission",
  "documents": "Documents",
  "keyRequirement": "Key Requirement",
  "viewDetails": "View full guide",
  "noIncome": "No income requirement",
  "allowed": "Allowed",
  "restricted": "Restricted",
  "notAllowed": "Not allowed",
  "emptySlot": "Select a visa to compare",
  "disclaimer": "Based on published requirements. Not legal advice."
}
```

Add translations for all 5 locales (en, ja, zh-cn, zh-tw, vi).

---

## Verification Checklist

- [ ] `npm run build` — no build errors
- [ ] Visit `/en/korea/compare` — comparison tool loads
- [ ] Select F-1-D and E-7 — side-by-side comparison renders
- [ ] Mobile viewport (375px) — 2-column comparison works
- [ ] Desktop viewport — up to 4 columns
- [ ] Visit `/sitemap.xml` — all pages listed
- [ ] Visit `/robots.txt` — dashboard/auth excluded
- [ ] View page source of `/en/korea` — JSON-LD present
- [ ] View page source of `/en/korea/visa/e-7` — OG tags present
- [ ] Related visas links work on each visa detail page
- [ ] No legal bright-line violations in comparison tool
- [ ] `npm run lint` — no errors
- [ ] All 5 locales have Comparison translation keys
