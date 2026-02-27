# Phase 2-A/B: Visa Listing Page + Dashboard 7-Visa Support

> **Goal**: (1) Replace "Coming Soon" country pages with actual visa listing UI, (2) Expand dashboard to support all 7 visas
> **Checkpoint**: English로 7개 비자 다 볼 수 있고, 목록에서 상세로 이동 가능 + 온보딩~대시보드 전체 플로우 작동

---

## Pre-Flight Checks

1. Read `lib/visa-data.ts` — current AVAILABLE_VISAS registry
2. Read `app/[locale]/[country]/page.tsx` — current Coming Soon page
3. Read `components/dashboard/onboarding-form.tsx` — current hardcoded VISA_OPTIONS
4. Read `app/[locale]/(protected)/dashboard/page.tsx` — current dashboard page
5. Read `data/visas/en/` — confirm E-7, D-8, F-2, H-1 JSON files exist
6. Read `messages/en.json` — current translation keys

---

## Part 1: Update Visa Registry (visa-data.ts)

### File: `lib/visa-data.ts`

Update `AVAILABLE_VISAS` to include all Phase 2 visas:

```typescript
const AVAILABLE_VISAS: Record<Country, string[]> = {
  korea: ['f-1-d', 'e-7', 'd-8', 'f-2', 'h-1'],
  taiwan: [],  // Taiwan visas added later when JSON data is ready
};
```

**No other changes to this file.** The `loadVisaJson`, `getVisaData`, and `getAvailableVisas` functions already handle dynamic loading.

---

## Part 2: Country Page — Visa Listing (replace Coming Soon)

### File: `app/[locale]/[country]/page.tsx`

Replace the Coming Soon placeholder with a visa listing page. This is a **Server Component**.

**Runtime flow:**
1. Server receives `/en/korea` request
2. `getAvailableVisas('korea', 'en')` loads all 5 visa summaries (parallel JSON reads)
3. `getTranslations('Country')` loads i18n
4. Server renders visa cards as HTML
5. User sees list of visa cards, clicks one → navigates to `/en/korea/visa/e-7`

**Implementation:**

```tsx
import { getAvailableVisas } from '@/lib/visa-data';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import type { Country } from '@/lib/types/visa';

const VALID_COUNTRIES = ['korea', 'taiwan'] as const;

const COUNTRY_DISPLAY: Record<string, string> = {
  korea: 'South Korea',
  taiwan: 'Taiwan',
};

const CATEGORY_ICONS: Record<string, string> = {
  'digital-nomad': '💻',
  work: '💼',
  investment: '🏢',
  residence: '🏠',
  'working-holiday': '✈️',
};

export function generateStaticParams() {
  return VALID_COUNTRIES.map((country) => ({ country }));
}

interface Props {
  params: Promise<{ locale: string; country: string }>;
}

export default async function CountryPage({ params }: Props) {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) {
    notFound();
  }

  const [t, tc, visas] = await Promise.all([
    getTranslations('Country'),
    getTranslations('Common'),
    getAvailableVisas(country as Country, locale),
  ]);

  const displayName = COUNTRY_DISPLAY[country] ?? country;

  return (
    <main id="main-content" className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-primary hover:underline">
          &larr; {tc('backToHome')}
        </Link>

        <h1 className="mt-6 font-lora text-4xl font-bold text-primary">
          {t('title', { country: displayName })}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('subtitle', { country: displayName })}
        </p>

        {visas.length === 0 ? (
          <div className="mt-8 rounded-lg border bg-white p-8 text-center text-muted-foreground">
            {t('comingSoon')}
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {visas.map((visa) => (
              <Link
                key={visa.type}
                href={`/${country}/visa/${visa.type}`}
                className="flex items-center gap-4 rounded-lg border bg-white px-5 py-4 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <span className="text-2xl">
                  {CATEGORY_ICONS[visa.category] ?? '📋'}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {visa.shortName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {visa.tagline}
                  </div>
                </div>
                <span className="text-muted-foreground">&rarr;</span>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          {tc('disclaimer')}
        </p>
      </div>
    </main>
  );
}
```

**Design decisions:**
- Server Component (no "use client") — visa list is static data
- `getAvailableVisas` already uses Promise.all internally
- Category emoji icons for visual distinction
- Falls back to "Coming Soon" if no visas (Taiwan case)
- Mobile-first: stacked card layout, min 44px touch targets
- Disclaimer at bottom (legal compliance)

---

## Part 3: Onboarding Form — 7 Visa Support

### File: `components/dashboard/onboarding-form.tsx`

Update the hardcoded `VISA_OPTIONS` to include all 5 Korean visas:

**Change this:**
```typescript
const VISA_OPTIONS: Record<string, { type: string; label: string }[]> = {
  kr: [{ type: 'f-1-d', label: 'F-1-D (Accompanying Family)' }],
  tw: [],
};
```

**To this:**
```typescript
const VISA_OPTIONS: Record<string, { type: string; label: string }[]> = {
  kr: [
    { type: 'f-1-d', label: 'F-1-D — Digital Nomad Visa' },
    { type: 'e-7', label: 'E-7 — Professional Employment' },
    { type: 'd-8', label: 'D-8 — Corporate Investment' },
    { type: 'f-2', label: 'F-2 — Points-Based Resident' },
    { type: 'h-1', label: 'H-1 — Working Holiday' },
  ],
  tw: [],
};
```

Also fix the F-1-D label — it was incorrectly labeled "(Accompanying Family)". F-1-D is the Digital Nomad Visa.

**No other changes needed** — the onboarding form's `handleVisaSelect` and `handleSubmit` already work with any visa type string, and `createVisa` in `lib/actions/dashboard.ts` accepts any visa_type.

---

## Part 4: Dashboard — Already Works (Verify Only)

The dashboard page (`app/[locale]/(protected)/dashboard/page.tsx`) already:
- Calls `getActiveVisa()` to get the user's selected visa
- Calls `getVisaData(countrySlug, locale, activeVisa.visa_type)` dynamically
- Renders `DashboardHeader`, `DDayCountdown`, `ChecklistCard` from the visa data

**No code changes needed.** The dashboard will automatically work with E-7, D-8, F-2, H-1 once:
1. `AVAILABLE_VISAS` is updated (Part 1)
2. JSON files exist in `data/visas/en/` (already done in Phase 2-A)

**Verify by testing:**
- Go to `/en/onboarding` → Select Korea → Select E-7 → Set date → Dashboard should show E-7 data
- Repeat for D-8, F-2, H-1

---

## Part 5: Translation Keys

### File: `messages/en.json`

Update the `Country` section to support the listing page:

```json
"Country": {
  "title": "{country} Visa Guide",
  "subtitle": "Find the right visa for your stay in {country}. Compare requirements, documents, and timelines.",
  "comingSoon": "Visa information for this country is coming soon.",
  "visaCount": "{count} visa types available"
}
```

The `subtitle` text was generic ("Comprehensive visa information"). Update to be more action-oriented.

Also copy these changes to `messages/ja.json`, `messages/zh-tw.json`, and `messages/vi.json` — translate the new `subtitle` text. Keep `comingSoon` translations as they are.

---

## Part 6: SEO Metadata for Country Page

### File: `app/[locale]/[country]/page.tsx`

Add `generateMetadata` for dynamic SEO:

```typescript
import type { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, country } = await params;
  const displayName = COUNTRY_DISPLAY[country] ?? country;

  return {
    title: `${displayName} Visa Guide — LocalNomad`,
    description: `Complete visa guide for ${displayName}. Requirements, documents, timelines, and tips for every visa type.`,
  };
}
```

---

## Verification Checklist

After all changes:

- [ ] `npm run build` — no build errors
- [ ] Visit `/en/korea` — shows 5 visa cards (F-1-D, E-7, D-8, F-2, H-1)
- [ ] Click each visa card → navigates to correct detail page
- [ ] Visit `/en/taiwan` — shows "Coming Soon" (no Taiwan JSON yet)
- [ ] Visit `/en/onboarding` → Korea → see 5 visa options
- [ ] Select E-7 in onboarding → dashboard shows E-7 name, documents, checklist
- [ ] Select D-8 in onboarding → dashboard shows D-8 data
- [ ] Select F-2 in onboarding → dashboard shows F-2 data
- [ ] Select H-1 in onboarding → dashboard shows H-1 data
- [ ] Mobile viewport (375px) — all cards have min 44px touch targets
- [ ] `npm run lint` — no lint errors
- [ ] View source of `/en/korea` — no "use client", confirms Server Component
