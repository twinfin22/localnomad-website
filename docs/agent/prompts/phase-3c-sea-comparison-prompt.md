# Phase 3-C: SEA Digital Nomad Visa Comparison Page

## Objective
Create the Southeast Asia digital nomad visa comparison page — data + UI component + routing. SEA is treated as a "country" type in our system but only has a comparison page, no individual visa detail pages.

## Reference Files

### Research data
- `docs/agent/reference/research-sea-digital-nomad-visas.md` — Full SEA visa research

### Existing comparison component (reference pattern, NOT copy)
- `components/visa/comparison-tool.tsx` — Korea/Taiwan comparison tool (different use case but similar UI patterns)
- `components/visa/comparison-card.tsx` — Card component

### Type definitions
- `lib/types/visa.ts` — VisaBase, Country, SEA-related types

### Architecture decisions
- `docs/agent/reference/research-expansion-architecture.md` — SEA decisions

---

## Decisions Already Made by Gen

1. **Countries included**: Thailand, Indonesia, Malaysia, Philippines (4 countries)
2. **Vietnam**: EXCLUDED
3. **Data format**: Separate comparison JSON at `data/comparisons/sea-digital-nomad.json`
4. **Columns**: 16 columns (all 17 candidates except #14)
5. **Language**: English only
6. **Routing**: SEA treated as Country type, comparison page is the country landing page

---

## Step 1: Create Comparison Data

Create `data/comparisons/sea-digital-nomad.json` with this structure:

```jsonc
{
  "id": "sea-digital-nomad",
  "title": "Digital Nomad Visas in Southeast Asia — 2026 Comparison",
  "description": "Side-by-side comparison of digital nomad and remote worker visa options across Southeast Asia.",
  "lastUpdated": "2026-03-03",
  "countries": ["Thailand", "Indonesia", "Malaysia", "Philippines"],

  "columns": [
    // 16 columns — see Column Definitions below
  ],

  "visas": [
    {
      "country": "Thailand",
      "visaName": "Destination Thailand Visa (DTV)",
      "data": {
        // key-value for each column ID
      }
    },
    // ... 3 more countries
  ],

  "sources": [
    { "label": "Source name", "url": "https://..." }
  ],

  "disclaimer": "This comparison is compiled from publicly available sources for general reference only. Requirements change frequently — verify with official sources before applying. This is not immigration consulting or legal advice."
}
```

### Column Definitions (16 columns)

Use these exact IDs and populate data from `research-sea-digital-nomad-visas.md`:

| # | Column ID | Display Name | Data Type |
|---|-----------|-------------|-----------|
| 1 | `officialName` | Official Visa Name | string |
| 2 | `visaCategory` | Visa Category/Type | string |
| 3 | `duration` | Initial Duration | string |
| 4 | `maxStay` | Maximum Total Stay | string |
| 5 | `extensionRules` | Extension/Renewal | string |
| 6 | `financialRequirement` | Financial Requirement | string |
| 7 | `incomeProof` | Income Proof Method | string |
| 8 | `healthInsurance` | Health Insurance | string |
| 9 | `remoteWorkAllowed` | Remote Work for Foreign Employer | boolean-text |
| 10 | `localWorkAllowed` | Local Employment Allowed | boolean-text |
| 11 | `applicationFee` | Application Fee | string |
| 12 | `processingTime` | Processing Time | string |
| 13 | `dependents` | Dependents/Family | string |
| 15 | `taxImplications` | Tax Implications | string |
| 16 | `multipleEntry` | Multiple Entry | boolean-text |
| 17 | `recentChanges` | Recent Changes (2024-2026) | string |

Note: #14 was excluded by Gen's decision.

### Data Quality Rules
- Every cell must have a value (use "Not specified" or "N/A" if genuinely unknown)
- Financial amounts in local currency + USD equivalent
- Boolean-text format: "Yes — details" or "No — explanation" (not just true/false)
- Keep each cell concise: 1-2 sentences max
- Source all data from the research file, not from assumptions

---

## Step 2: Create SEA Comparison Component

Create `components/visa/sea-comparison-table.tsx`:

### Requirements:
- **Server Component** (no "use client" — data is static)
- Read data from `data/comparisons/sea-digital-nomad.json`
- Responsive table: horizontal scroll on mobile, full table on desktop
- Sticky first column (country/visa name) on horizontal scroll
- Each country = 1 column, each row = 1 comparison attribute
- Use brand color `#1B4965` for header row
- Include `lastUpdated` display
- Include disclaimer at bottom
- Include source links

### Component signature:
```typescript
interface SEAComparisonTableProps {
  locale: string;
}

export async function SEAComparisonTable({ locale }: SEAComparisonTableProps) {
  // Load comparison data
  // Render table
}
```

### Styling:
- Use Tailwind classes + `cn()` utility
- Zebra striping on rows for readability
- `text-sm` for table cells, `text-xs` for disclaimer
- Mobile: min-width per column, horizontal overflow with `-webkit-overflow-scrolling: touch`
- Highlight cells where value is "No" or restrictive (subtle red/amber background)

---

## Step 3: Create SEA Country Page

The URL pattern should be: `/{locale}/southeast-asia/`

### Option A: Add to existing country routing
If `app/[locale]/[country]/page.tsx` exists as a country landing page, extend it to handle `southeast-asia` by rendering the SEA comparison table instead of a visa list.

### Option B: Dedicated SEA page
If no country landing page exists, create `app/[locale]/southeast-asia/page.tsx` as a dedicated page.

**Choose whichever approach matches the existing routing pattern.** The key requirement is that `/en/southeast-asia/` renders the comparison page.

### Page content:
1. **Hero section**: Title "Digital Nomad Visas in Southeast Asia", subtitle explaining this is a comparison of 4 countries
2. **SEA Comparison Table**: The component from Step 2
3. **Disclaimer**: SEA-specific disclaimer (see Step 4)
4. **Schema.org**: `ItemList` structured data for the 4 visa options

### SEO metadata:
```typescript
export async function generateMetadata({ params }: Props) {
  return {
    title: "Digital Nomad Visas in Southeast Asia — 2026 Comparison | LocalNomad",
    description: "Compare digital nomad visa options across Thailand, Indonesia, Malaysia, and Philippines. Side-by-side requirements, costs, duration, and tax implications.",
    // canonical + hreflang via getAlternates()
  };
}
```

---

## Step 4: SEA Disclaimer

The SEA comparison page needs its own disclaimer. Add to the VisaDisclaimer component OR inline it in the comparison table.

Text:
```
This comparison is compiled from publicly available sources for general reference only.
Visa requirements change frequently — always verify with the relevant country's immigration
authority before applying. This is not immigration consulting or legal advice. LocalNomad
is not affiliated with any government immigration authority.
```

This does NOT need to be bilingual (English only for SEA).

---

## Step 5: Update Visa Data Loader

In `lib/visa-data.ts`:

1. Add a new function to load comparison data:
```typescript
export async function getComparisonData(comparisonId: string) {
  const data = (await import(`@/data/comparisons/${comparisonId}.json`)).default;
  return data;
}
```

2. Keep `AVAILABLE_VISAS['southeast-asia']` as empty array `[]` — SEA has no individual visa pages.

---

## Step 6: Update Barrel Exports

In `components/visa/index.ts`, add:
```typescript
export { SEAComparisonTable } from './sea-comparison-table';
```

---

## Step 7: Sitemap

Ensure `/en/southeast-asia/` is included in the sitemap. If using `generateStaticParams`, add the southeast-asia route.

---

## Verification Commands

```bash
# Check comparison data exists and is valid JSON
python3 -c "import json; d=json.load(open('data/comparisons/sea-digital-nomad.json')); print(f'Countries: {len(d[\"visas\"])}, Columns: {len(d[\"columns\"])}')"

# Check component exists
ls -la components/visa/sea-comparison-table.tsx

# Check page exists
find app -path "*southeast-asia*" -type f

# Build test
npm run build

# Check no legal violations
grep -rn "you qualify\|you are eligible\|recommended visa\|guaranteed" components/visa/sea-comparison-table.tsx data/comparisons/
```

---

## What NOT To Do

- Do NOT create individual visa detail pages for SEA countries (comparison only)
- Do NOT add SEA visas to AVAILABLE_VISAS (keep empty array)
- Do NOT create locale translations (English only)
- Do NOT modify existing Korea/Taiwan comparison tool
- Do NOT modify `components/ui/` (shadcn/ui managed)
