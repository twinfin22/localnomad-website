# Phase B: Schema Hardening + Frontend Tier 1-2

**Estimated Time**: ~7-8 hours
**Risk Level**: Low-Medium — loading/error states are new files, component fixes are targeted
**Prerequisite**: Phase A must be completed first. Read `CLAUDE.md` before starting.

---

## Overview

Phase B bundles backend schema hardening (5 items) with frontend loading states (Tier 1) and component fixes (Tier 2). These prepare the codebase for Phase 2 content expansion.

---

## PART 1: Backend Schema Hardening

### B1. Add `CHECK` constraint on `visa_type` length

**File**: `docs/sql/002-rls-performance.sql` (append to existing migration, or create `docs/sql/003-schema-hardening.sql`)
**Why**: `visa_type TEXT` has no length limit. Prevents garbage data.

```sql
ALTER TABLE public.user_visas
  ADD CONSTRAINT chk_visa_type_length CHECK (char_length(visa_type) <= 50);
```

### B2. Shared Env Config with Runtime Guards

**Why**: `process.env.NEXT_PUBLIC_SUPABASE_URL!` in 3 files produces cryptic runtime errors if env vars are missing.

**Create new file**: `lib/supabase/env.ts`
```typescript
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. ` +
      `Check your .env.local file or Vercel environment settings.`
    );
  }
  return value;
}

export const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
export const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
```

**Update `lib/supabase/client.ts`**:
```typescript
import { createBrowserClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey } from './env';

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);
```

**Update `lib/supabase/server.ts`**:
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseUrl, supabaseAnonKey } from './env';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
        }
      },
    },
  });
};
```

**Update `proxy.ts`** (lines 17-19):
```typescript
import { supabaseUrl, supabaseAnonKey } from './lib/supabase/env';

// In the function body, replace:
//   process.env.NEXT_PUBLIC_SUPABASE_URL!
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// With:
//   supabaseUrl
//   supabaseAnonKey
```

### B3. Remove `'vi'` from `preferred_locale` CHECK

**Why**: Vietnamese locale is in the CHECK constraint but no Vietnamese translations exist in the app. (Note: `messages/vi.json` exists but it's a copy of English — no real translations.)

```sql
-- In migration file:
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_preferred_locale_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_preferred_locale_check
  CHECK (preferred_locale IN ('en', 'ja', 'zh-tw'));
```

**IMPORTANT**: Also update `docs/sql/001-auth-tables.sql` line 11 to match:
```sql
preferred_locale text check (preferred_locale in ('en', 'ja', 'zh-tw')),
```

### B4. Generate Supabase Types

**Why**: 6 locations use manual `as Type` casts. Auto-generated types eliminate these.

Run this command (requires Supabase CLI + project linked):
```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > lib/types/database.ts
```

Then update `lib/actions/dashboard.ts` to use generated types instead of manual `as Profile`, `as UserVisa`, `as ChecklistItem[]` casts. The generated types file will define the exact DB shape.

**Note**: This step requires Supabase project access. If the CLI is not set up, skip and document in tech debt.

### B5. Verify Supavisor Connection Pooling

**Why**: Configuration verification, not code change.

Verify in Supabase Dashboard:
1. Settings → Database → Connection Pooling is enabled (Supavisor, transaction mode)
2. Port 6543 is the pooler port
3. JS client connects via the pooler URL (check `NEXT_PUBLIC_SUPABASE_URL`)

Document findings in a comment at the top of `lib/supabase/env.ts`:
```typescript
// Connection pooling: Supavisor (transaction mode) on port 6543
// Verified: [DATE] — pooler URL used by NEXT_PUBLIC_SUPABASE_URL
```

---

## PART 2: Frontend Tier 1 — Loading & Streaming (~1.5h)

### P3a. Add `loading.tsx` to Protected Routes

**Create new file**: `app/[locale]/(protected)/loading.tsx`

```tsx
export default function DashboardLoading() {
  return (
    <main id="main-content" className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Header skeleton */}
        <div className="h-9 w-48 animate-pulse rounded-lg bg-neutral-200" />
        <div className="mt-2 h-5 w-32 animate-pulse rounded bg-neutral-200" />

        {/* D-Day skeleton */}
        <div className="mt-8 h-32 animate-pulse rounded-lg border bg-neutral-100" />

        {/* Checklist skeleton */}
        <div className="mt-8 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg border bg-neutral-100" />
          ))}
        </div>
      </div>
    </main>
  );
}
```

### P3b. Add `loading.tsx` to Visa Detail Route

**Create new file**: `app/[locale]/[country]/visa/[type]/loading.tsx`

```tsx
export default function VisaDetailLoading() {
  return (
    <main id="main-content" className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Back link skeleton */}
        <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />

        {/* Title skeleton */}
        <div className="mt-6 h-10 w-72 animate-pulse rounded-lg bg-neutral-200" />
        <div className="mt-2 h-6 w-full animate-pulse rounded bg-neutral-200" />

        {/* Summary cards skeleton */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border bg-neutral-100" />
          ))}
        </div>

        {/* Document checklist skeleton */}
        <div className="mt-12 space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-neutral-200" />
          <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-neutral-200" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg border bg-neutral-100" />
          ))}
        </div>
      </div>
    </main>
  );
}
```

### P3c. Add `error.tsx` to Critical Routes

**Create new file**: `app/[locale]/(protected)/error.tsx`

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-lora text-3xl font-bold text-primary">
          Something went wrong
        </h1>
        <p className="mt-4 text-muted-foreground">
          We encountered an error loading your dashboard. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
```

**Create new file**: `app/[locale]/[country]/visa/[type]/error.tsx`

```tsx
'use client';

export default function VisaDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-lora text-3xl font-bold text-primary">
          Something went wrong
        </h1>
        <p className="mt-4 text-muted-foreground">
          We couldn&apos;t load this visa information. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
```

### P3d. `<Suspense>` Around Auth-Dependent Section

**File**: `app/[locale]/[country]/visa/[type]/page.tsx`
**Why**: The auth section (getSession → getActiveVisa → getChecklist) blocks the entire page. Wrap it in Suspense so the visa content streams immediately.

This requires extracting the auth-dependent ActionZone into an async wrapper component:

**Create new file**: `components/visa/auth-action-zone.tsx`

```tsx
import { getSession } from '@/lib/actions/auth';
import { getActiveVisa, getChecklist } from '@/lib/actions/dashboard';
import { ActionZone } from './action-zone';
import type { Visa } from '@/lib/types/visa';

const COUNTRY_SLUG_TO_CODE: Record<string, string> = {
  korea: 'kr',
  taiwan: 'tw',
};

interface AuthActionZoneProps {
  visa: Visa;
  country: string;
}

export async function AuthActionZone({ visa, country }: AuthActionZoneProps) {
  const user = await getSession();
  let userVisaId: string | undefined;
  let serverChecklist: { id: string; user_visa_id: string; document_id: string; checked: boolean; checked_at: string | null }[] | undefined;

  if (user) {
    const activeVisa = await getActiveVisa();
    if (
      activeVisa &&
      activeVisa.country === COUNTRY_SLUG_TO_CODE[country] &&
      activeVisa.visa_type === visa.type
    ) {
      userVisaId = activeVisa.id;
      serverChecklist = await getChecklist(activeVisa.id);
    }
  }

  return (
    <ActionZone
      visa={visa}
      country={country}
      isLoggedIn={!!user}
      userVisaId={userVisaId}
      serverChecklist={serverChecklist}
    />
  );
}
```

**Update barrel export**: `components/visa/index.ts` — add `AuthActionZone`

**Update visa detail page** `app/[locale]/[country]/visa/[type]/page.tsx`:
```tsx
import { Suspense } from 'react';
import { AuthActionZone } from '@/components/visa';

// In the JSX, replace the auth loading section + ActionZone with:
{/* Layer 2: Action — streamed with auth */}
<Suspense fallback={
  <div className="mt-12 space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-14 animate-pulse rounded-lg border bg-neutral-100" />
    ))}
  </div>
}>
  <AuthActionZone visa={visa} country={country} />
</Suspense>
```

Remove the auth-related code (getSession, getActiveVisa, getChecklist, userVisaId, serverChecklist) from the page component since it's now in AuthActionZone.

**Also slim down ActionZone props (P5)**: Instead of passing the entire `visa` object, only pass what ActionZone needs:

```tsx
// In AuthActionZone, replace:
<ActionZone visa={visa} .../>

// With:
<ActionZone
  documents={visa.documents}
  applicationSteps={visa.applicationSteps}
  visaType={visa.type}
  country={country}
  isLoggedIn={!!user}
  userVisaId={userVisaId}
  serverChecklist={serverChecklist}
/>
```

Update `ActionZoneProps` interface in `action-zone.tsx` accordingly:
```typescript
interface ActionZoneProps {
  documents: VisaDocument[];
  applicationSteps: Visa['applicationSteps'];
  visaType: string;
  country: string;
  isLoggedIn?: boolean;
  userVisaId?: string;
  serverChecklist?: ChecklistItem[];
}
```

And update all internal references from `visa.documents` → `documents`, `visa.applicationSteps` → `applicationSteps`, `visa.type` → `visaType`.

---

## PART 3: Frontend Tier 2 — Component Fixes (~2h)

### P7. Add `.catch()` to AuthNav `useEffect`

**File**: `components/auth/auth-nav.tsx` (line 16)

```typescript
// BEFORE:
supabase.auth.getUser().then(({ data }) => {
  setUser(data.user);
  setLoaded(true);
});

// AFTER:
supabase.auth.getUser()
  .then(({ data }) => {
    setUser(data.user);
    setLoaded(true);
  })
  .catch(() => {
    setLoaded(true);
  });
```

### P8. Fix State-During-Render in useChecklist

**File**: `components/visa/action-zone.tsx` (lines 48-55)
**Why**: Setting state during render (`if (!initialized && typeof window !== 'undefined')`) is a React anti-pattern. Use lazy state initializer instead.

```typescript
// BEFORE:
function useChecklist(storageKey: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage after mount (avoids SSR mismatch)
  if (!initialized && typeof window !== 'undefined') {
    setChecked(readChecklist(storageKey));
    setInitialized(true);
  }

// AFTER:
function useChecklist(storageKey: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    return readChecklist(storageKey);
  });
```

Remove the `initialized` state entirely. The lazy initializer runs once on mount and returns `{}` during SSR.

### U1. Mobile-Optimize Heading Font Sizes

**File**: `components/visa/glanceable-zone.tsx` (line 29):
```tsx
// BEFORE:
<h1 className="font-lora text-3xl font-bold text-primary">

// AFTER:
<h1 className="font-lora text-2xl font-bold text-primary sm:text-3xl">
```

**File**: `components/dashboard/dashboard-header.tsx` (line 17):
```tsx
// BEFORE:
<h1 className="font-lora text-3xl font-bold text-primary">

// AFTER:
<h1 className="font-lora text-2xl font-bold text-primary sm:text-3xl">
```

### U2. Reduce Hero Padding on Mobile

**File**: `components/landing/hero.tsx` (line 8):
```tsx
// BEFORE:
<section className="flex min-h-svh flex-col items-center justify-center bg-primary px-6 py-16">

// AFTER:
<section className="flex min-h-svh flex-col items-center justify-center bg-primary px-6 py-8 sm:py-16">
```

### U5. Add Submit Spinner to Forms

**File**: `components/auth/login-form.tsx`

Add import at top:
```typescript
import { Loader2 } from 'lucide-react';
```

Update button (around line 63-68):
```tsx
// BEFORE:
{loading ? t('sending') : t('sendMagicLink')}

// AFTER:
{loading ? (
  <>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    {t('sending')}
  </>
) : (
  t('sendMagicLink')
)}
```

**File**: `components/dashboard/onboarding-form.tsx`

Add import at top:
```typescript
import { Loader2 } from 'lucide-react';
```

Update submit button (around line 177-179):
```tsx
// BEFORE:
{loading ? t('saving') : t('goToDashboard')}

// AFTER:
{loading ? (
  <>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    {t('saving')}
  </>
) : (
  t('goToDashboard')
)}
```

### N1. `Promise.all` in `getAvailableVisas`

**File**: `lib/visa-data.ts` (lines 64-84)

```typescript
// BEFORE:
export const getAvailableVisas = cache(
  async (country: Country, locale: string): Promise<VisaSummary[]> => {
    const types = AVAILABLE_VISAS[country] ?? [];
    const summaries: VisaSummary[] = [];

    for (const type of types) {
      const visa = await loadVisaJson(country, locale, type);
      if (visa) {
        summaries.push({
          type: visa.type,
          name: visa.name,
          shortName: visa.shortName,
          category: visa.category,
          tagline: visa.tagline,
          country: COUNTRY_CODE_MAP[country],
        });
      }
    }

    return summaries;
  },
);

// AFTER:
export const getAvailableVisas = cache(
  async (country: Country, locale: string): Promise<VisaSummary[]> => {
    const types = AVAILABLE_VISAS[country] ?? [];

    const visas = await Promise.all(
      types.map((type) => loadVisaJson(country, locale, type))
    );

    return visas
      .filter((visa): visa is Visa => visa !== null)
      .map((visa) => ({
        type: visa.type,
        name: visa.name,
        shortName: visa.shortName,
        category: visa.category,
        tagline: visa.tagline,
        country: COUNTRY_CODE_MAP[country],
      }));
  },
);
```

### N2. Remove/Gate `console.warn` Behind `NODE_ENV`

**File**: `components/visa/action-zone.tsx`

In `readChecklist` function (around line 41) and `toggle` function (around line 74):
```typescript
// BEFORE:
console.warn('Failed to read checklist from localStorage:', error.message);

// AFTER:
if (process.env.NODE_ENV === 'development') {
  console.warn('Failed to read checklist from localStorage:', error.message);
}
```

Apply same pattern to both `console.warn` locations in the file.

---

## Verification Checklist

After all changes:
1. `npm run build` — must complete with zero errors
2. `npm run lint` — must pass
3. Manual checks:
   - Navigate to dashboard — see loading skeleton appear briefly before content
   - Navigate to `/en/korea/visa/f-1-d` — see loading skeleton, then content streams in
   - Force an error (e.g., disconnect network) — error page appears with "Try again" button
   - Submit login form — see spinner on button while loading
   - Submit onboarding form — see spinner on button while loading
   - Checkbox still works (both localStorage and Supabase modes)
4. SQL migration: run schema hardening SQL in Supabase SQL Editor

---

## Files Changed Summary

| File | Change Type | Description |
|------|------------|-------------|
| `docs/sql/003-schema-hardening.sql` | **NEW** | visa_type CHECK + preferred_locale cleanup |
| `lib/supabase/env.ts` | **NEW** | Shared env config with runtime guards |
| `lib/supabase/client.ts` | EDIT | Use shared env config |
| `lib/supabase/server.ts` | EDIT | Use shared env config |
| `proxy.ts` | EDIT | Use shared env config |
| `docs/sql/001-auth-tables.sql` | EDIT | Update preferred_locale CHECK |
| `app/[locale]/(protected)/loading.tsx` | **NEW** | Dashboard loading skeleton |
| `app/[locale]/[country]/visa/[type]/loading.tsx` | **NEW** | Visa detail loading skeleton |
| `app/[locale]/(protected)/error.tsx` | **NEW** | Dashboard error page |
| `app/[locale]/[country]/visa/[type]/error.tsx` | **NEW** | Visa detail error page |
| `components/visa/auth-action-zone.tsx` | **NEW** | Server component wrapper for auth+ActionZone |
| `components/visa/index.ts` | EDIT | Add AuthActionZone export |
| `app/[locale]/[country]/visa/[type]/page.tsx` | EDIT | Suspense + remove auth code from page |
| `components/visa/action-zone.tsx` | EDIT | Fix state-during-render, slim props, gate console.warn |
| `components/auth/auth-nav.tsx` | EDIT | Add .catch() to useEffect |
| `components/visa/glanceable-zone.tsx` | EDIT | Mobile heading size |
| `components/dashboard/dashboard-header.tsx` | EDIT | Mobile heading size |
| `components/landing/hero.tsx` | EDIT | Mobile padding |
| `components/auth/login-form.tsx` | EDIT | Add submit spinner |
| `components/dashboard/onboarding-form.tsx` | EDIT | Add submit spinner |
| `lib/visa-data.ts` | EDIT | Promise.all in getAvailableVisas |
