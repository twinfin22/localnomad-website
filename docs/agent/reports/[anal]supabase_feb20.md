# Supabase Postgres Best Practices Audit

**Date**: 2025-02-20
**Scope**: Current Supabase schema (3 tables, 10 RLS policies, 2 triggers, OTP auth)
**Method**: Static analysis of `docs/sql/001-auth-tables.sql`, `lib/supabase/`, `lib/actions/`, `proxy.ts`

---

## 1. Current State Inventory

### Tables (3)
| Table | PK | FK | RLS | Indexes |
|-------|----|----|-----|---------|
| `profiles` | `id uuid` (from `auth.users`) | `auth.users(id)` CASCADE | 3 policies | PK only |
| `user_visas` | `id uuid` (gen_random_uuid) | `profiles(id)` CASCADE | 4 policies | PK + partial `(user_id, is_active) WHERE is_active = true` |
| `checklist_items` | `id uuid` (gen_random_uuid) | `user_visas(id)` CASCADE | 3 policies | PK + `(user_visa_id)` + UNIQUE `(user_visa_id, document_id)` |

### RLS Policies (10)
- `profiles`: SELECT, UPDATE, INSERT — direct `auth.uid() = id`
- `user_visas`: SELECT, INSERT, UPDATE, DELETE — direct `auth.uid() = user_id`
- `checklist_items`: SELECT, INSERT, UPDATE — subquery via `user_visas` join

### Triggers (2)
- `on_auth_user_created` → `handle_new_user()` — auto-creates profile row
- `set_profiles_updated_at` / `set_user_visas_updated_at` → `update_updated_at()`

### Auth
- Supabase Auth with magic link (OTP)
- Session refresh via middleware (`proxy.ts:17-33`)
- Protected routes: `/dashboard`, `/onboarding`

---

## 2. Findings by Severity

### Blocker (0)

None identified.

### Critical (2)

#### C1. `auth.uid()` called per-row — missing `(select ...)` wrapper
**Files**: `docs/sql/001-auth-tables.sql:20,24,28,47,51,55,59,83,93,103`
**Impact**: All 10 RLS policies call `auth.uid()` directly. Postgres re-evaluates this function for every row scanned. Wrapping in `(select auth.uid())` lets the planner evaluate it once as a constant.

**Current** (all policies):
```sql
using (auth.uid() = id);
```

**Recommended**:
```sql
using ((select auth.uid()) = id);
```

Per Supabase docs: this is the single most impactful RLS performance fix. At scale (~10K+ rows), this can reduce query time by 10-100x.

**Affected**: All 10 policies across 3 tables.

#### C2. Silent error swallowing in read actions
**Files**: `lib/actions/dashboard.ts:23,62,137`
**Impact**: `getProfile`, `getActiveVisa`, and `getChecklist` return `null` / `[]` on error without logging. If RLS misconfiguration blocks reads, the user sees empty data with no indication of failure.

**Current**:
```typescript
if (error) return null;  // dashboard.ts:23
if (error) return null;  // dashboard.ts:62
if (error) return [];    // dashboard.ts:137
```

**Recommended**: Log the error server-side before returning fallback:
```typescript
if (error) {
  console.error('[getProfile] Supabase error:', error.message);
  return null;
}
```

---

### Warning (7)

#### W1. No explicit index on `checklist_items.user_visa_id` FK for CASCADE
**File**: `docs/sql/001-auth-tables.sql:107`
**Impact**: An index `idx_checklist_items_visa` exists on `(user_visa_id)`, which covers CASCADE deletes. However, the RLS subquery on `checklist_items` joins `user_visas.id = checklist_items.user_visa_id AND user_visas.user_id = auth.uid()`. This requires scanning `user_visas` by `id` (PK, covered) and then `checklist_items` by `user_visa_id` (covered by existing index). **Status: adequately indexed for now.**

However, if `checklist_items` grows large, the subquery-based RLS (lines 79-85, 89-95, 99-105) will need the index to include `user_visa_id` with good selectivity. Currently adequate; re-evaluate at ~100K rows.

#### W2. UUID v4 as primary key — index fragmentation risk
**Files**: `docs/sql/001-auth-tables.sql:33,67`
**Impact**: `gen_random_uuid()` produces random UUIDs (v4). B-tree indexes on random UUIDs cause page splits and fragmentation. For `user_visas` and `checklist_items`, this is fine at current scale (<1K rows). At scale (>100K rows), consider:

**Options** (for Gen to decide at scale):
1. **UUIDv7** — time-ordered, maintains index locality. Requires Postgres 17+ or custom function
2. **bigint identity** — most efficient, but exposes row count in URLs
3. **Keep UUID v4** — acceptable if tables stay small (<100K rows)

#### W3. `visa_type TEXT` is unbounded
**File**: `docs/sql/001-auth-tables.sql:36`
**Impact**: `visa_type` has no CHECK constraint or max length. Could accept arbitrarily long strings. Since this is user-facing input (from onboarding), add a CHECK constraint:

```sql
visa_type text not null check (char_length(visa_type) <= 50)
```

Or use an enum/lookup table if visa types are from a known set.

#### W4. `country TEXT CHECK` vs Postgres ENUM
**File**: `docs/sql/001-auth-tables.sql:35`
**Impact**: `country text not null check (country in ('kr', 'tw'))` works correctly. A Postgres ENUM would provide slightly better type safety and smaller storage, but CHECK constraints are easier to extend (adding countries). **Current approach is acceptable** — just noting the tradeoff.

#### W5. No connection pooling configuration documented
**Impact**: The project relies on Supabase's default connection pooling (Supavisor). For a small app this is fine, but should verify:
- Transaction-mode pooling is active (Supabase default on port 6543)
- The JS client is connecting via the pooler URL (not direct connection)
- Max connections aren't being exhausted by middleware session refreshes

This is a configuration check, not a code change.

#### W6. Non-null assertions on env vars with no runtime guard
**Files**: `lib/supabase/client.ts:5-6`, `lib/supabase/server.ts:8-9`, `proxy.ts:18-19`
**Impact**: All three files use `process.env.NEXT_PUBLIC_SUPABASE_URL!` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!`. If env vars are missing, this produces a cryptic runtime error deep in the Supabase client.

**Recommended**: Add a runtime guard in a shared config file:
```typescript
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
```

#### W7. No pagination — queries assume single-row returns
**Files**: `lib/actions/dashboard.ts:59-60,133-135`
**Impact**: `getActiveVisa` uses `.single()` (correct for current design — one active visa). `getChecklist` returns all items with no limit. Phase 2+ may introduce multiple visas per user, requiring:
- Cursor-based pagination for visa history
- Limit clauses for checklist queries
- Count queries for UI indicators

Not a problem now, but architecture should anticipate this.

---

### Nit (3)

#### N1. `profiles.preferred_locale` CHECK constraint is incomplete
**File**: `docs/sql/001-auth-tables.sql:11`
**Impact**: CHECK allows `('en', 'ja', 'zh-tw', 'vi')` but `vi` (Vietnamese) isn't in `countryLocales` config and no Vietnamese translations exist. Dead option in schema. Consider removing `'vi'` or adding Vietnamese support.

#### N2. Missing `updated_at` trigger on `checklist_items`
**File**: `docs/sql/001-auth-tables.sql:66-73`
**Impact**: `checklist_items` has no `updated_at` column, so no trigger needed. But `checked_at` serves a similar purpose. If audit trail is needed later, add `updated_at`.

#### N3. Upsert `checked_at` set client-side
**File**: `lib/actions/dashboard.ts:159`
**Impact**: `checked_at: checked ? new Date().toISOString() : null` generates the timestamp on the server (Node.js), not in Postgres. For consistency, could use `now()` via a default or trigger. Minor — the difference is negligible unless clock drift matters.

---

## 3. Schema Gaps vs Product Spec (Phase 2-3)

The current schema covers Phase 1-4 (auth + dashboard + checklist). Future phases will need:

| Phase | Missing Tables | Purpose |
|-------|---------------|---------|
| Phase 2 | `score_trackers` | Visa requirement matching scores (Korea only — Taiwan legally prohibited) |
| Phase 2 | `visa_transitions` | Tracking visa pathway history |
| Phase 3 | `tax_residency` | Tax calendar and residency day counting |
| Phase 3 | `alert_settings` | Notification preferences (expiry alerts, deadline reminders) |
| Phase 3 | `saved_calculators` | Persisted calculator states |

These are noted for planning purposes only — no schema changes should be made until Gen approves Phase 2 design.

---

## 4. Positive Patterns (What's Working Well)

- **Checklist upsert** (`dashboard.ts:152-164`): Correctly uses `onConflict` with composite unique constraint. Clean pattern.
- **Partial index** (`001-auth-tables.sql:61-62`): `idx_user_visas_user_active WHERE is_active = true` is efficient for the primary query pattern.
- **CASCADE deletes**: All FKs use `ON DELETE CASCADE` — clean referential integrity.
- **`security definer` on trigger function** (`001-auth-tables.sql:117`): Correctly elevated for cross-schema insert into `public.profiles` from `auth.users` trigger.
- **Middleware session refresh** (`proxy.ts:17-33`): Properly refreshes auth cookies on every request, preventing stale sessions.
- **Server actions pattern** (`lib/actions/dashboard.ts`): All mutations go through server actions with `getSession()` guard — no direct client-side Supabase mutations.

---

## 5. Summary

| Severity | Count | Key Items |
|----------|-------|-----------|
| Blocker | 0 | — |
| Critical | 2 | RLS `auth.uid()` performance, silent error swallowing |
| Warning | 7 | UUID v4 at scale, unbounded text, env var guards, no pagination |
| Nit | 3 | Dead locale, missing trigger, client-side timestamp |

**Priority fix**: The `(select auth.uid())` wrapper is a one-line change per policy that prevents a performance cliff. Recommend addressing this first when any schema migration is next performed.
