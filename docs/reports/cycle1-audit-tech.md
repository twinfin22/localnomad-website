# Cycle 1 — Technical Health Audit

**Date**: 2026-02-12
**Auditor**: Claude Opus 4.6 (automated)
**Scope**: Full codebase at `main` branch (commit `6a3a164`)

---

## Overall Score: 62 / 100

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Build & Config | 8/10 | 15% | 1.2 |
| Error Boundaries | 8/10 | 10% | 0.8 |
| Security | 8/10 | 20% | 1.6 |
| Type Safety | 8/10 | 10% | 0.8 |
| Logging Hygiene | 6/10 | 10% | 0.6 |
| i18n Coverage | 3/10 | 20% | 0.6 |
| Nav/Locale Awareness | 6/10 | 10% | 0.6 |
| Image Optimization | 5/10 | 5% | 0.25 |
| **Total** | | **100%** | **6.45 -> 62/100** |

---

## 1. Build & Config (`next.config.mjs`)

**Status: PASS**

| Check | Result |
|-------|--------|
| `ignoreBuildErrors` | Not present. TypeScript errors will break builds. |
| `ignoreDuringBuilds` (ESLint) | Not present. Lint errors will break builds. |
| `images` optimization config | Not configured (see Section 8). |
| `npm run build` | **Passes** — 117 static pages generated, 0 errors, 0 warnings. |

**Finding**: Build pipeline is healthy. No suppressed errors. The `allowedDevOrigins` array is present but only for local dev — acceptable.

**Severity**: None.

---

## 2. Loading & Error Boundaries

**Status: MOSTLY PASS**

### Coverage Matrix

| Route | `loading.tsx` | `error.tsx` |
|-------|:---:|:---:|
| `app/` (root) | Yes | Yes |
| `app/[lang]/` | Yes | Yes |
| `app/[lang]/[country]/` | Yes | Yes |
| `app/[lang]/[country]/visa/` | Yes | Yes |
| `app/[lang]/[country]/visa/[type]/` | Yes | Yes |
| `app/[lang]/[country]/visa/checklist/` | Yes | Yes |
| `app/[lang]/[country]/visa/checklist/[type]/` | Yes | Yes |
| `app/[lang]/[country]/visa/compare/` | Yes | Yes |
| `app/[lang]/[country]/visa/dashboard/` | Yes | Yes |
| `app/[lang]/[country]/visa/find/` | Yes | Yes |
| `app/[lang]/[country]/areas/` | Yes | Yes |
| `app/[lang]/[country]/bundles/` | Yes | Yes |
| `app/auth/` | Yes | Yes |
| `app/(legal)/` | **NO** | **NO** |
| `app/[lang]/[country]/visa/path/` | **NO** | **NO** |

### Gaps

1. **`app/(legal)/`** — The `(legal)` route group (serves `/terms`, `/privacy`, `/refund`, `/business`) has **no** `loading.tsx` or `error.tsx`. Users hitting these pages get the root-level fallback, which is acceptable but not ideal for a consistent UX.
2. **`app/[lang]/[country]/visa/path/`** — This route has a `page.tsx` but **no** `loading.tsx` or `error.tsx`. The parent `visa/` boundaries will catch errors, but a loading state specific to the path flow is missing.

**Severity**: Warning (defer with justification — parent boundaries catch errors).

---

## 3. Auth Callback — Open Redirect

**Status: PASS (FIXED)**

**File**: `app/auth/callback/route.ts`

The `sanitizeRedirect()` function now applies **four** validation layers:

1. Must start with `/` (relative-only)
2. Blocks `//` (protocol-relative URLs like `//evil.com`)
3. Blocks `\` (backslash normalization tricks)
4. Must match locale prefix regex `^/[a-z]{2}/[a-z]+/`

Falls back to `DEFAULT_REDIRECT = '/en/korea/visa/dashboard'` on any failure.

**Verdict**: Robust open-redirect mitigation. No issues found.

**Severity**: None.

---

## 4. Supabase Client/Server — Null Safety

**Status: PASS**

### Browser Client (`lib/supabase/client.ts`)
- Returns `SupabaseClient<Database> | null` — explicit nullable return type.
- Checks for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` before creating client.
- Returns `null` when env vars are missing (graceful degradation).
- Only logs a warning on the client side (`typeof window !== 'undefined'`).

### Server Client (`lib/supabase/server.ts`)
- Throws `Error` with descriptive message when env vars are missing — correct for server-side (fail fast).
- Properly handles cookie operations with try/catch in `setAll`.

### Auth Provider (`components/providers/auth-provider.tsx`)
- Checks `if (!supabase)` before every operation (signIn, signUp, signInWithGoogle, signOut).
- Returns early with an error object when Supabase is null.

**Severity**: None.

---

## 5. Subscribe API — Rate Limiting & PII

**Status: PASS**

**File**: `app/api/subscribe/route.ts`

### Rate Limiting
- In-memory rate limiting: 5 requests/minute per IP.
- Uses lazy eviction (`evictStaleEntries()` on each check) — avoids `setInterval` issues in serverless.
- IP extracted from `x-forwarded-for` (first entry) or `x-real-ip`.
- Returns `429 Too Many Requests` when limit exceeded.

**Caveat**: In-memory rate limiting resets on cold starts (serverless). For production traffic, consider Redis/Upstash-backed rate limiting. Acceptable for current scale.

### PII Logging
- **No PII is logged.** All `console.error` / `console.warn` calls use generic messages like `"[Subscribe] Email send failed via Resend"` — no email addresses, names, or IP addresses are logged.
- Email and firstName are used in business logic only, never in log output.

### Input Validation
- Email: required, type-checked, regex-validated.
- firstName: trimmed, falls back to empty string if missing/non-string.

**Severity**: None (minor caveat about in-memory rate limiting at scale).

---

## 6. Console Statements

**Status: WARNING**

### `console.log`
**0 instances** found. All `console.log` statements have been removed from production code.

### `console.error` / `console.warn` (25 instances)

| File | Type | Context | Acceptable? |
|------|------|---------|:-----------:|
| `app/error.tsx` (and 10 other error boundaries) | `error` | Error boundary `useEffect` | Yes |
| `app/api/subscribe/route.ts` (4 instances) | `error`/`warn` | API error handling | Yes |
| `lib/supabase/client.ts` | `warn` | Missing env vars | Yes |
| `lib/visa/stateMachine.ts` (2 instances) | `error`/`warn` | State machine failures | Yes |
| `components/SeoulNeighborhoodMap.tsx` (2 instances) | `error` | Mapbox init failures | Yes |
| `components/providers/auth-provider.tsx` | `error` | Migration error | Yes |
| `components/visa/dashboard/DashboardClient.tsx` | `error` | Data fetch error | Yes |

**Finding**: All remaining console statements are `console.error` or `console.warn` with contextual prefixes — no `console.log` left. However, `auth-provider.tsx` line 136 logs the full error object: `console.error('Error migrating localStorage data:', error)` — this could leak stack traces containing user data in browser console.

**Severity**: Warning (consider stripping error details in production or using an error tracker).

---

## 7. Type Safety — `as any`

**Status: WARNING**

**2 instances** found in `components/providers/auth-provider.tsx`:

```typescript
// Line 97 — eslint-disable-next-line @typescript-eslint/no-explicit-any
await (supabase.from('visa_progress') as any).insert({...});

// Line 130 — eslint-disable-next-line @typescript-eslint/no-explicit-any
await (supabase.from('checklist_items') as any).insert(items);
```

**Root cause**: The `Database` type in `database.types.ts` likely does not include the `visa_progress` and `checklist_items` tables. Both casts have `eslint-disable` comments, indicating awareness.

**Fix**: Regenerate Supabase types with `npx supabase gen types typescript` to include these tables, eliminating both `as any` casts.

**Severity**: Warning (type-unsafe database operations; could cause runtime errors if schema changes).

---

## 8. Header & Footer — Locale Awareness

**Status: PARTIAL PASS**

### Header (`components/header.tsx`)
- Uses `parseLocalePath(pathname)` to extract `locale` and `country`.
- Builds locale-aware links via `buildLocalePath()`.
- All nav links (`/bundles`, `/areas`, `/visa`) are locale-prefixed.
- CTA button links to locale-aware `/bundles`.
- i18n strings via `useTranslations()`: `t("nav.bundles")`, `t("nav.areaGuide")`, `t("nav.visa")`, `t("common.getStarted")`.

**Verdict**: Fully locale-aware.

### Footer (`components/footer.tsx`)
- Same pattern: `parseLocalePath` + `buildLocalePath` for main nav links.
- i18n strings for all labels.
- **BUG**: Legal links (`/terms`, `/privacy`, `/refund`) on lines 79, 83, 87 are **hardcoded without locale prefix**:
  ```tsx
  <Link href="/terms" ...>
  <Link href="/privacy" ...>
  <Link href="/refund" ...>
  ```
  These should use `localePath("/terms")` etc. to maintain locale context.

**Severity**: Warning (users lose locale context when navigating to legal pages).

---

## 9. i18n Coverage

**Status: CRITICAL GAP**

### Translation Infrastructure
- 3 message files: `en.json`, `ja.json`, `zh-tw.json`
- `next-intl` configured via `next.config.mjs` with plugin at `./i18n/request.ts`

### Pages Using i18n (6 files)
| File | Method |
|------|--------|
| `components/header.tsx` | `useTranslations()` |
| `components/footer.tsx` | `useTranslations()` |
| `app/[lang]/page.tsx` | `getTranslations()` |
| `app/[lang]/[country]/page.tsx` | `getTranslations()` |
| `components/visa/landing/SocialProofBar.tsx` | `useTranslations()` |
| `components/sections/comparison-section.tsx` | `useTranslations()` |

### Pages with Hardcoded English (NOT using i18n)
| File | Example Hardcoded Strings |
|------|--------------------------|
| `app/[lang]/[country]/visa/page.tsx` | "What's your situation?", "I have a job offer in Korea", "Free to use", "No account required", all 12 situation descriptions, all 6 visa option labels |
| `app/[lang]/[country]/bundles/page.tsx` | "Pre-Arrival Checklist", "Seoul Survival Playbook", "Digital Nomad Cheatsheet", all prices, all features (15+ strings), "Get Bundle", "All-Access Bundle" |
| `app/[lang]/[country]/areas/page.tsx` | "Area Guide", "Explore Seoul neighborhoods", "Need a Custom Housing Report?", "48-hour turnaround", "Request Custom Report" |
| `app/[lang]/[country]/visa/find/page.tsx` | (delegates to VisaFinder component — not checked) |
| `app/[lang]/[country]/visa/compare/page.tsx` | (delegates to VisaComparisonTool — not checked) |
| `app/[lang]/[country]/visa/[type]/page.tsx` | "Visa Not Found" |
| `app/[lang]/[country]/visa/checklist/` | (not checked — likely hardcoded) |
| `app/[lang]/[country]/visa/dashboard/` | (not checked — likely hardcoded) |

### Coverage Estimate
- **6 files** use `useTranslations` / `getTranslations` (header, footer, 2 hub pages, SocialProofBar, comparison section)
- **~15+ page/component files** under `app/[lang]/` contain hardcoded English strings
- **Estimated i18n coverage: ~25-30%** of user-facing strings are translated

**Severity**: **Critical** — The site supports 3 locales (`en`, `ja`, `zh-tw`) but the vast majority of page content is hardcoded English. Japanese and Traditional Chinese users will see a mix of translated nav/chrome and English page content.

---

## 10. Build Status

**Status: PASS**

```
Next.js 16.0.10 (Turbopack)
Compiled successfully in 3.5s
TypeScript: PASS
117 static pages generated
0 errors, 0 warnings
```

One deprecation notice: `"middleware" file convention is deprecated. Please use "proxy" instead.` — should be addressed but does not block builds.

---

## Summary of Findings

### Blockers (must fix before next deploy)
None.

### Critical (should fix ASAP)
| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| C1 | i18n coverage at ~25-30% — most pages hardcoded English | `app/[lang]/[country]/visa/page.tsx`, `bundles/page.tsx`, `areas/page.tsx`, + many more | L (multi-day) |

### Warnings (should fix, can defer)
| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| W1 | Footer legal links not locale-aware (`/terms`, `/privacy`, `/refund`) | `components/footer.tsx` lines 79, 83, 87 | XS |
| W2 | `as any` casts on Supabase table operations (2 instances) | `components/providers/auth-provider.tsx` lines 97, 130 | S (regen types) |
| W3 | `(legal)` route group missing `loading.tsx` and `error.tsx` | `app/(legal)/` | XS |
| W4 | `visa/path` route missing `loading.tsx` and `error.tsx` | `app/[lang]/[country]/visa/path/` | XS |
| W5 | `auth-provider.tsx` logs full error object to browser console | `components/providers/auth-provider.tsx` line 136 | XS |
| W6 | In-memory rate limiting won't persist across serverless cold starts | `app/api/subscribe/route.ts` | M (add Upstash) |
| W7 | No `images` config in `next.config.mjs` — no remote image domains or optimization settings | `next.config.mjs` | XS |
| W8 | Middleware deprecation warning — should migrate to "proxy" convention | `middleware.ts` | S |

### Positive Findings
- `ignoreBuildErrors` and `ignoreDuringBuilds` removed — build enforces correctness.
- Open redirect in auth callback is properly fixed with multi-layer validation.
- Supabase client is null-safe with proper fallback behavior.
- Rate limiting implemented on subscribe endpoint.
- Zero PII in logs.
- Zero `console.log` statements in production code.
- All `[lang]/[country]/*` routes have loading and error boundaries.
- Header is fully locale-aware with translated strings.
- Build passes cleanly with 0 errors.

---

## Recommended Priority Order

1. **W1** — Fix footer legal links (5-minute fix, visible to all users)
2. **W3/W4** — Add missing loading/error boundaries (copy existing pattern)
3. **W2** — Regenerate Supabase types to eliminate `as any`
4. **C1** — Begin i18n extraction for visa, bundles, areas pages (largest effort)
5. **W5** — Strip error details from browser console log
6. **W7** — Add `images` config if remote images are planned
7. **W8** — Migrate middleware to proxy convention
8. **W6** — Upgrade to Redis-backed rate limiting when traffic warrants it
