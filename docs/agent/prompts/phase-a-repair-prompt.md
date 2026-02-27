# Phase A: Immediate Repair — Backend Critical + Frontend Quick Wins

**Estimated Time**: ~2 hours
**Risk Level**: Low — all changes are targeted, isolated, and reversible
**Prerequisite**: Read `CLAUDE.md` before starting

---

## Overview

This prompt addresses the highest-ROI, lowest-risk fixes from the backend and frontend audits. Two backend critical fixes (RLS performance + error visibility) and six frontend quick wins (parallel fetches + accessibility baseline).

---

## A1. RLS Performance — Wrap `auth.uid()` in `(select ...)`

**File**: `docs/sql/001-auth-tables.sql`
**Why**: Every RLS policy calls `auth.uid()` per-row. Wrapping in `(select auth.uid())` tells Postgres to evaluate it once per query. At scale (10K+ rows), this is 10-100x faster. Zero risk — same result, less computation.

### SQL Migration

Create a new migration file: `docs/sql/002-rls-performance.sql`

```sql
-- =============================================================================
-- Phase A: RLS Performance — Wrap auth.uid() in (select auth.uid())
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================================

-- 1. profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- 2. user_visas policies
DROP POLICY IF EXISTS "Users can read own visas" ON public.user_visas;
CREATE POLICY "Users can read own visas"
  ON public.user_visas FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own visas" ON public.user_visas;
CREATE POLICY "Users can insert own visas"
  ON public.user_visas FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own visas" ON public.user_visas;
CREATE POLICY "Users can update own visas"
  ON public.user_visas FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own visas" ON public.user_visas;
CREATE POLICY "Users can delete own visas"
  ON public.user_visas FOR DELETE
  USING ((select auth.uid()) = user_id);

-- 3. checklist_items policies
DROP POLICY IF EXISTS "Users can read own checklist items" ON public.checklist_items;
CREATE POLICY "Users can read own checklist items"
  ON public.checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_visas
      WHERE user_visas.id = checklist_items.user_visa_id
        AND user_visas.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own checklist items" ON public.checklist_items;
CREATE POLICY "Users can insert own checklist items"
  ON public.checklist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_visas
      WHERE user_visas.id = checklist_items.user_visa_id
        AND user_visas.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own checklist items" ON public.checklist_items;
CREATE POLICY "Users can update own checklist items"
  ON public.checklist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_visas
      WHERE user_visas.id = checklist_items.user_visa_id
        AND user_visas.user_id = (select auth.uid())
    )
  );
```

Also update the original `docs/sql/001-auth-tables.sql` to reflect the `(select auth.uid())` pattern so future readers see the correct version.

---

## A2. Error Visibility — Add `console.error` to Silent Read Actions

**File**: `lib/actions/dashboard.ts`
**Why**: Three read functions (`getProfile`, `getActiveVisa`, `getChecklist`) silently return null/empty on error. If RLS is misconfigured, users see empty data with no server-side trace.

### Changes

**`getProfile`** (around line 23):
```typescript
// BEFORE:
if (error) return null;

// AFTER:
if (error) {
  console.error('[getProfile] Failed to fetch profile:', error.message, { userId: user.id });
  return null;
}
```

**`getActiveVisa`** (around line 62):
```typescript
// BEFORE:
if (error) return null;

// AFTER:
if (error) {
  console.error('[getActiveVisa] Failed to fetch active visa:', error.message, { userId: user.id });
  return null;
}
```

**`getChecklist`** (around line 137):
```typescript
// BEFORE:
if (error) return [];

// AFTER:
if (error) {
  console.error('[getChecklist] Failed to fetch checklist:', error.message, { userVisaId });
  return [];
}
```

---

## A3. Dashboard Page — `Promise.all` for Parallel Fetches

**File**: `app/[locale]/(protected)/dashboard/page.tsx`
**Why**: Currently `getActiveVisa()`, then `getVisaData()`, then `getChecklist()` run sequentially. `getVisaData` and `getChecklist` can run in parallel (both depend on `activeVisa` but not on each other). Saves ~200-400ms.

### Current code (lines 26-35):
```typescript
const activeVisa = await getActiveVisa();
if (!activeVisa) {
  redirect(`/${locale}/onboarding`);
}

const t = await getTranslations('Dashboard');

const countrySlug = COUNTRY_CODE_TO_SLUG[activeVisa.country] ?? 'korea';
const visa = await getVisaData(countrySlug, locale, activeVisa.visa_type);
const checklist = await getChecklist(activeVisa.id);
```

### Replace with:
```typescript
const activeVisa = await getActiveVisa();
if (!activeVisa) {
  redirect(`/${locale}/onboarding`);
}

const countrySlug = COUNTRY_CODE_TO_SLUG[activeVisa.country] ?? 'korea';

const [t, visa, checklist] = await Promise.all([
  getTranslations('Dashboard'),
  getVisaData(countrySlug, locale, activeVisa.visa_type),
  getChecklist(activeVisa.id),
]);
```

---

## A4. Visa Detail Page — `Promise.all` for Parallel Fetches

**File**: `app/[locale]/[country]/visa/[type]/page.tsx`
**Why**: Same sequential pattern. After `getSession()`, if user exists, `getActiveVisa()` and translations can run in parallel. The checklist fetch depends on `activeVisa` result but the initial fetches can be parallelized.

### Current code (lines 86-127):
```typescript
const visa = await getVisaData(country as Country, locale, type);
const tc = await getTranslations('Common');
const t = await getTranslations('VisaDetail');
const displayCountry = country === 'korea' ? 'South Korea' : 'Taiwan';
// ... then session, activeVisa, checklist sequentially
```

### Replace with:
```typescript
// Parallel: visa data + translations (independent of auth)
const [visa, tc, t] = await Promise.all([
  getVisaData(country as Country, locale, type),
  getTranslations('Common'),
  getTranslations('VisaDetail'),
]);
const displayCountry = country === 'korea' ? 'South Korea' : 'Taiwan';

if (!visa) {
  return (
    <main id="main-content" className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href={`/${country}`}
          className="text-sm text-primary hover:underline"
        >
          &larr; {tc('backToCountry', { country: displayCountry })}
        </Link>
        <h1 className="mt-6 font-lora text-4xl font-bold text-primary">
          {t('title', { type: type.toUpperCase() })}
        </h1>
        <div className="mt-8 rounded-lg border bg-white p-8 text-center text-muted-foreground">
          {t('comingSoon')}
        </div>
      </div>
    </main>
  );
}

// Auth: optionally load session + checklist for logged-in users
const user = await getSession();
let userVisaId: string | undefined;
let serverChecklist: { id: string; user_visa_id: string; document_id: string; checked: boolean; checked_at: string | null }[] | undefined;

if (user) {
  const activeVisa = await getActiveVisa();
  if (
    activeVisa &&
    activeVisa.country === COUNTRY_SLUG_TO_CODE[country] &&
    activeVisa.visa_type === type
  ) {
    userVisaId = activeVisa.id;
    serverChecklist = await getChecklist(activeVisa.id);
  }
}
```

Note: the auth section (getSession → getActiveVisa → getChecklist) must remain sequential because each depends on the previous result. But the visa data + translations are now parallel.

---

## A5. Accessibility — ARIA Labels on Checkboxes

**File**: `components/visa/action-zone.tsx`
**Why**: Screen readers announce "checkbox" with no context. Users need to hear "Passport copy — checkbox".

### In `DocumentRow` component (around line 319-324):

```typescript
// BEFORE:
<input
  type="checkbox"
  checked={isChecked}
  onChange={() => onToggle(doc.id)}
  className="h-5 w-5 cursor-pointer accent-primary"
/>

// AFTER:
<input
  type="checkbox"
  checked={isChecked}
  onChange={() => onToggle(doc.id)}
  aria-label={doc.name}
  className="h-5 w-5 cursor-pointer accent-primary"
/>
```

---

## A6. Accessibility — `id`/`htmlFor` on Onboarding Form

**File**: `components/dashboard/onboarding-form.tsx`
**Why**: The date input (line 145) and "skip date" checkbox (line 157-164) lack `id`/`htmlFor` pairing. Screen readers can't associate labels with inputs.

### Date input (around line 145):
```typescript
// BEFORE:
<input
  type="date"
  value={expiryDate}
  ...

// AFTER:
<input
  id="expiry-date"
  type="date"
  value={expiryDate}
  ...
```

### Skip date checkbox label (around line 157):
```typescript
// BEFORE:
<label className="flex min-h-[44px] items-center gap-2 text-sm">
  <input
    type="checkbox"
    checked={skipDate}
    onChange={(e) => setSkipDate(e.target.checked)}
    className="h-5 w-5 accent-primary"
  />
  {t('noVisaYet')}
</label>

// AFTER:
<label htmlFor="skip-date" className="flex min-h-[44px] items-center gap-2 text-sm">
  <input
    id="skip-date"
    type="checkbox"
    checked={skipDate}
    onChange={(e) => setSkipDate(e.target.checked)}
    className="h-5 w-5 accent-primary"
  />
  {t('noVisaYet')}
</label>
```

---

## A7. Accessibility — Nav `aria-label` + Skip-to-Content

**File**: `app/[locale]/layout.tsx`
**Why**: No `aria-label` on `<nav>` element. No skip-to-content link for keyboard users.

### Current code (around line 57):
```tsx
<nav className="flex items-center justify-end gap-4 px-6 py-3 text-sm">
  <AuthNav />
</nav>
```

### Replace with:
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
>
  Skip to content
</a>
<nav aria-label="Main navigation" className="flex items-center justify-end gap-4 px-6 py-3 text-sm">
  <AuthNav />
</nav>
```

Note: All main pages already have `<main id="main-content">` so the skip link target already exists.

---

## Verification Checklist

After all changes:
1. `npm run build` — must complete with zero errors
2. `npm run lint` — must pass
3. Manual checks:
   - Dashboard page loads (login required)
   - Visa detail page `/en/korea/visa/f-1-d` loads
   - Checkbox toggle works (both localStorage and Supabase modes)
   - Tab through page with keyboard — skip-to-content link appears on first Tab press
4. SQL migration: run in Supabase SQL Editor, verify policies exist with `SELECT * FROM pg_policies WHERE schemaname = 'public';`

---

## Files Changed Summary

| File | Change Type | Description |
|------|------------|-------------|
| `docs/sql/002-rls-performance.sql` | **NEW** | RLS `(select auth.uid())` migration |
| `docs/sql/001-auth-tables.sql` | EDIT | Update to reflect `(select auth.uid())` pattern |
| `lib/actions/dashboard.ts` | EDIT | Add `console.error` at 3 error locations |
| `app/[locale]/(protected)/dashboard/page.tsx` | EDIT | `Promise.all` for parallel fetches |
| `app/[locale]/[country]/visa/[type]/page.tsx` | EDIT | `Promise.all` for parallel fetches |
| `components/visa/action-zone.tsx` | EDIT | `aria-label` on checkbox |
| `components/dashboard/onboarding-form.tsx` | EDIT | `id`/`htmlFor` on date + checkbox inputs |
| `app/[locale]/layout.tsx` | EDIT | Skip-to-content link + nav `aria-label` |
