# Phase C: Architectural Changes — AuthNav Server + i18n Errors + Breadcrumb

**Estimated Time**: ~2 hours
**Risk Level**: Medium — AuthNav rewrite changes layout rendering, breadcrumb is a new component
**Prerequisite**: Phase A and Phase B must be completed first. Read `CLAUDE.md` before starting.

---

## Overview

Three architectural improvements: convert AuthNav from a 60KB client component to a server component, add specific multi-language error messages, and add breadcrumb navigation for SEO + user orientation.

---

## C1. Rewrite AuthNav as Server Component (P6)

**Files**: `components/auth/auth-nav.tsx`, `app/[locale]/layout.tsx`
**Why**: Current AuthNav is `"use client"` — it imports the entire Supabase browser SDK (~60KB) just to check if a user is logged in. This 60KB ships to EVERY page, including public pages where most visitors are anonymous. Converting to a Server Component eliminates this entirely.

### Current `components/auth/auth-nav.tsx` (full file):
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function AuthNav() {
  const t = useTranslations('Auth');
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;
  // ... renders login link or dashboard link + logout button
}
```

### Replace with Server Component:

**`components/auth/auth-nav.tsx`** (complete rewrite):
```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSession } from '@/lib/actions/auth';
import { LogoutButton } from './logout-button';

export async function AuthNav() {
  const t = await getTranslations('Auth');
  const user = await getSession();

  if (user) {
    return (
      <>
        <Link href="/dashboard" className="text-primary hover:underline">
          {t('dashboard')}
        </Link>
        <LogoutButton label={t('logOut')} />
      </>
    );
  }

  return (
    <Link href="/login" className="text-primary hover:underline">
      {t('logIn')}
    </Link>
  );
}
```

**Create new file**: `components/auth/logout-button.tsx`
```tsx
'use client';

import { signOut } from '@/lib/actions/auth';

interface LogoutButtonProps {
  label: string;
}

export function LogoutButton({ label }: LogoutButtonProps) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-muted-foreground hover:underline"
      >
        {label}
      </button>
    </form>
  );
}
```

**Update barrel export**: `components/auth/index.ts`
Make sure both `AuthNav` and `LogoutButton` are exported. Only `LogoutButton` needs to be exported if `AuthNav` is already exported.

**Update `app/[locale]/layout.tsx`**: No changes needed to the layout itself — `AuthNav` keeps the same name and import path.

### Key differences:
- No `"use client"` on AuthNav → no Supabase browser SDK shipped
- Server-side `getSession()` (already cached from Phase A) → no additional round-trip
- Only `LogoutButton` (~1KB) is a client component (needs form action)
- No loading state flicker (server-rendered, HTML comes complete)

---

## C2. Specific Error Messages + 4-Language i18n (U4)

**Files**: `components/auth/login-form.tsx`, `components/dashboard/onboarding-form.tsx`, `messages/{en,ja,zh-tw,vi}.json`
**Why**: Currently shows generic "Something went wrong" for all errors. Users can't tell if they mistyped their email, hit a rate limit, or have a network issue.

### Update `components/auth/login-form.tsx`

Replace the error handling section (around lines 29-33):
```typescript
// BEFORE:
if (signInError) {
  setError(t('error'));
  setLoading(false);
  return;
}

// AFTER:
if (signInError) {
  // Map Supabase error codes to specific user-facing messages
  const errorCode = signInError.status;
  if (errorCode === 429) {
    setError(t('errorTooManyAttempts'));
  } else if (signInError.message?.includes('Invalid email')) {
    setError(t('errorInvalidEmail'));
  } else if (signInError.message?.includes('fetch') || signInError.message?.includes('network')) {
    setError(t('errorNetwork'));
  } else {
    setError(t('error'));
  }
  setLoading(false);
  return;
}
```

### Update `components/dashboard/onboarding-form.tsx`

The error handling (around line 57-64) is already decent. Add a network-specific catch:
```typescript
// BEFORE:
} catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError(t('error'));
  }
  setLoading(false);
}

// AFTER:
} catch (err: unknown) {
  if (err instanceof Error) {
    if (err.message.includes('fetch') || err.message.includes('network')) {
      setError(t('errorNetwork'));
    } else {
      setError(t('error'));
    }
  } else {
    setError(t('error'));
  }
  setLoading(false);
}
```

### Add i18n Keys to All 4 Locale Files

**`messages/en.json`** — Add to `Auth` section:
```json
"errorInvalidEmail": "Please enter a valid email address.",
"errorTooManyAttempts": "Too many attempts. Please wait a few minutes and try again.",
"errorNetwork": "Network error. Please check your connection and try again."
```

**`messages/ja.json`** — Add to `Auth` section:
```json
"errorInvalidEmail": "有効なメールアドレスを入力してください。",
"errorTooManyAttempts": "試行回数が多すぎます。数分お待ちいただいてから再度お試しください。",
"errorNetwork": "ネットワークエラーです。接続を確認して再度お試しください。"
```

**`messages/zh-tw.json`** — Add to `Auth` section:
```json
"errorInvalidEmail": "請輸入有效的電子郵件地址。",
"errorTooManyAttempts": "嘗試次數過多，請稍後幾分鐘再試。",
"errorNetwork": "網路錯誤，請確認您的網路連線後再試。"
```

**`messages/vi.json`** — Add to `Auth` section:
```json
"errorInvalidEmail": "Please enter a valid email address.",
"errorTooManyAttempts": "Too many attempts. Please wait a few minutes and try again.",
"errorNetwork": "Network error. Please check your connection and try again."
```
(Vietnamese uses English fallback since no real translations exist yet.)

Also add `errorNetwork` to the `Onboarding` section of all 4 locale files:

**en.json Onboarding**:
```json
"errorNetwork": "Network error. Please check your connection and try again."
```

**ja.json Onboarding**:
```json
"errorNetwork": "ネットワークエラーです。接続を確認して再度お試しください。"
```

**zh-tw.json Onboarding**:
```json
"errorNetwork": "網路錯誤，請確認您的網路連線後再試。"
```

**vi.json Onboarding**:
```json
"errorNetwork": "Network error. Please check your connection and try again."
```

---

## C3. Add Breadcrumb Navigation (U6)

**Files**: new `components/ui/breadcrumb.tsx`, `app/[locale]/[country]/visa/[type]/page.tsx`
**Why**: Users on visa detail pages have no sense of where they are in the site hierarchy. Breadcrumbs help orientation + give SEO benefit (BreadcrumbList JSON-LD).

### Create `components/ui/breadcrumb.tsx`

```tsx
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

**NOTE**: This goes in `components/ui/` but it's our custom component (not a shadcn/ui primitive), so it's fine to create it there. Alternatively, place it in `components/` root if you prefer to keep `components/ui/` strictly for shadcn primitives. Gen's decision — but the report suggested `components/ui/breadcrumb.tsx`.

### Add Breadcrumb to Visa Detail Page

**File**: `app/[locale]/[country]/visa/[type]/page.tsx`

Add import:
```typescript
import { Breadcrumb } from '@/components/ui/breadcrumb';
```

Add BreadcrumbList JSON-LD (alongside existing faqJsonLd and howToJsonLd):
```typescript
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `https://localnomad.club/${locale}`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: displayCountry,
      item: `https://localnomad.club/${locale}/${country}`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: visa.name,
    },
  ],
};
```

Add the JSON-LD script alongside existing ones:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(breadcrumbJsonLd),
  }}
/>
```

Replace the back link with the Breadcrumb component:
```tsx
{/* BEFORE: */}
<Link
  href={`/${country}`}
  className="inline-flex min-h-[44px] items-center text-sm text-primary hover:underline"
>
  &larr; {tc('backToCountry', { country: displayCountry })}
</Link>

{/* AFTER: */}
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: displayCountry, href: `/${country}` },
    { label: visa.shortName || visa.name },
  ]}
/>
```

Also update the "not found" fallback case in the same file to use breadcrumbs instead of the back link.

---

## Verification Checklist

After all changes:
1. `npm run build` — must complete with zero errors
2. `npm run lint` — must pass
3. Manual checks:
   - **AuthNav**: Visit `/en/korea/visa/f-1-d` as anonymous user — see "Log in" link, NO loading flicker
   - **AuthNav**: Log in → see "Dashboard" + "Log out" links immediately (no blank → content flash)
   - **AuthNav**: Click "Log out" → redirects to home
   - **Bundle check**: Run `npm run build`, check that Supabase SDK no longer appears in public page bundles
   - **Error messages**: On login page, submit empty form → see specific error. Try rapid submissions → see rate limit message
   - **Breadcrumb**: Visit `/en/korea/visa/f-1-d` → see "Home > South Korea > F-1-D" breadcrumb at top
   - **Breadcrumb SEO**: View page source → find `BreadcrumbList` JSON-LD schema
4. Check all 4 locale files parse correctly (no JSON syntax errors)

---

## Files Changed Summary

| File | Change Type | Description |
|------|------------|-------------|
| `components/auth/auth-nav.tsx` | REWRITE | Client → Server Component |
| `components/auth/logout-button.tsx` | **NEW** | Tiny client component for logout action |
| `components/auth/index.ts` | EDIT | Add LogoutButton export |
| `components/ui/breadcrumb.tsx` | **NEW** | Breadcrumb navigation component |
| `components/auth/login-form.tsx` | EDIT | Specific error code mapping |
| `components/dashboard/onboarding-form.tsx` | EDIT | Network error handling |
| `messages/en.json` | EDIT | Add 3 Auth error keys + 1 Onboarding error key |
| `messages/ja.json` | EDIT | Add 3 Auth error keys + 1 Onboarding error key |
| `messages/zh-tw.json` | EDIT | Add 3 Auth error keys + 1 Onboarding error key |
| `messages/vi.json` | EDIT | Add 3 Auth error keys + 1 Onboarding error key |
| `app/[locale]/[country]/visa/[type]/page.tsx` | EDIT | Add Breadcrumb + BreadcrumbList JSON-LD |
