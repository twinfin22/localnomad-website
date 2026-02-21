# Merged Backend Diagnosis

**Date**: 2025-02-20
**Sources**: Supabase Postgres Audit, Prisma DB Evaluation, Prisma Postgres Evaluation
**Scope**: Full backend health assessment — schema, ORM, provider decisions

---

## 1. Executive Summary

The backend is fundamentally sound. Three tables, 10 RLS policies, and a clean auth flow give LocalNomad a solid foundation for Phase 1-4. The primary risks are performance (RLS `auth.uid()` per-row evaluation) and observability (silent error swallowing), both fixable with small targeted changes.

- **Supabase Audit**: 0 blockers, 2 critical, 7 warnings, 3 nits. The schema is well-designed for its scale; critical items are low-effort fixes.
- **Prisma DB Evaluation**: Defer. Prisma would bypass RLS and require reimplementing all 10 security policies in application code. Not worth it for 3 tables.
- **Prisma Postgres Evaluation**: No action. Switching database providers would dismantle Supabase Auth integration for zero meaningful benefit.

**Strategic decision: Stay on Supabase, fix what we have, defer ORM adoption until schema complexity demands it.**

---

## 2. Cross-Report Concordance

| Theme | Supabase Audit | Prisma DB Eval | Prisma Postgres Eval | Concordance |
|-------|---------------|----------------|---------------------|-------------|
| **RLS is the security backbone** | 10 policies enforce all access control | Prisma would bypass RLS entirely | Prisma Postgres has no RLS support | All 3 agree: RLS is non-negotiable, don't break it |
| **Type-safety gap exists** | Manual `as Type` casts at 6 locations (`dashboard.ts:24,63,138`) | `supabase gen types` solves this without ORM | N/A | 2 reports agree: `supabase gen types` is the answer |
| **Connection pooling is adequate** | Supavisor handles current load (W5) | N/A | PgBouncer in Prisma Postgres offers no advantage over Supavisor | 2 reports agree: current pooling is fine |
| **Auth integration is tightly coupled** | `auth.uid()` in all policies, session refresh in `proxy.ts` | Prisma breaks auth.uid() evaluation | Switching DB requires replacing entire auth system | All 3 agree: Supabase Auth is deeply integrated, migration cost is prohibitive |
| **Scale is small, complexity is low** | 3 tables, ~6 query functions | Overhead exceeds benefit for 3 tables | Solves a problem LocalNomad doesn't have | All 3 agree: current architecture is right-sized |

---

## 3. Finding-by-Finding Assessment

### Critical Findings

#### C1. `auth.uid()` called per-row — missing `(select ...)` wrapper
- **Source**: Supabase Audit
- **Files**: `docs/sql/001-auth-tables.sql:20,24,28,47,51,55,59,83,93,103`
- **Verdict**: `FIX NOW`
- **Rationale**: Single most impactful RLS performance fix per Supabase docs. One-line change per policy, 10 policies total. At scale (~10K+ rows), reduces query time by 10-100x. Zero risk.
- **Effort**: Low (< 1 hr) — mechanical find-and-replace across 10 policies
- **Dependencies**: None. Can be applied in any migration.

#### C2. Silent error swallowing in read actions
- **Source**: Supabase Audit
- **Files**: `lib/actions/dashboard.ts:23,62,137`
- **Verdict**: `FIX NOW`
- **Rationale**: If RLS misconfiguration blocks reads, users see empty data with no indication of failure. Adding `console.error` before returning fallback gives server-side visibility. Per `error-handling.md` rules: never silently swallow errors.
- **Effort**: Low (< 1 hr) — add one log line at 3 locations
- **Dependencies**: None.

### Warning Findings

#### W1. Checklist index adequacy
- **Source**: Supabase Audit
- **File**: `docs/sql/001-auth-tables.sql:107`
- **Verdict**: `ACCEPT RISK`
- **Rationale**: The existing `idx_checklist_items_visa` on `(user_visa_id)` covers both CASCADE deletes and the RLS subquery join. Audit confirms "adequately indexed for now." Re-evaluate at ~100K rows.
- **Effort**: N/A
- **Dependencies**: N/A

#### W2. UUID v4 index fragmentation
- **Source**: Supabase Audit
- **Files**: `docs/sql/001-auth-tables.sql:33,67`
- **Verdict**: `DEFER TO PHASE 2+`
- **Rationale**: Random UUIDs cause B-tree page splits, but this only matters at >100K rows. Current scale is <1K. UUIDv7 requires Postgres 17+ (Supabase currently on 15). Revisit when table growth metrics indicate need.
- **Effort**: Medium (1-4 hr) — requires migration + testing if switching UUID strategy
- **Dependencies**: Postgres version upgrade (for UUIDv7) or Gen decision on bigint alternative

#### W3. `visa_type TEXT` unbounded
- **Source**: Supabase Audit
- **File**: `docs/sql/001-auth-tables.sql:36`
- **Verdict**: `FIX NEXT MIGRATION`
- **Rationale**: User-facing input with no length constraint. A `CHECK (char_length(visa_type) <= 50)` prevents garbage data. Low-risk schema hardening.
- **Effort**: Low (< 1 hr) — one ALTER TABLE
- **Dependencies**: Should be bundled with next schema migration (alongside C1)

#### W4. `country TEXT CHECK` vs ENUM
- **Source**: Supabase Audit
- **File**: `docs/sql/001-auth-tables.sql:35`
- **Verdict**: `ACCEPT RISK`
- **Rationale**: CHECK constraint `country in ('kr', 'tw')` is correct and easier to extend than ENUM when adding new countries. Audit concurs: "current approach is acceptable."
- **Effort**: N/A
- **Dependencies**: N/A

#### W5. Connection pooling configuration undocumented
- **Source**: Supabase Audit
- **Verdict**: `FIX NEXT MIGRATION`
- **Rationale**: Not a code fix — a configuration verification. Confirm: (1) Supavisor transaction-mode pooling is active on port 6543, (2) JS client connects via pooler URL, (3) middleware session refreshes aren't exhausting connections. Document findings.
- **Effort**: Low (< 1 hr) — Supabase dashboard check + documentation
- **Dependencies**: Supabase dashboard access

#### W6. Non-null assertions on env vars
- **Source**: Supabase Audit
- **Files**: `lib/supabase/client.ts:5-6`, `lib/supabase/server.ts:8-9`, `proxy.ts:18-19`
- **Verdict**: `FIX NEXT MIGRATION`
- **Rationale**: `process.env.NEXT_PUBLIC_SUPABASE_URL!` in 3 files produces cryptic runtime errors if env vars are missing. A shared config with runtime guards provides clear error messages at startup.
- **Effort**: Low (< 1 hr) — create shared env config, update 3 imports
- **Dependencies**: None

#### W7. No pagination on queries
- **Source**: Supabase Audit
- **Files**: `lib/actions/dashboard.ts:59-60,133-135`
- **Verdict**: `DEFER TO PHASE 2+`
- **Rationale**: `getActiveVisa` correctly uses `.single()`. `getChecklist` returns all items unbounded, but current scale makes this fine. Phase 2 may introduce multiple visas per user, requiring cursor-based pagination. Not a problem now.
- **Effort**: Medium (1-4 hr) — when needed, requires API changes + UI updates
- **Dependencies**: Phase 2 design decisions (multi-visa support)

### Nit Findings

#### N1. `preferred_locale` CHECK includes dead `'vi'` option
- **Source**: Supabase Audit
- **File**: `docs/sql/001-auth-tables.sql:11`
- **Verdict**: `FIX NEXT MIGRATION`
- **Rationale**: Vietnamese locale is in the CHECK constraint but no Vietnamese translations exist. Clean up to match reality: `('en', 'ja', 'zh-tw')`.
- **Effort**: Low (< 1 hr) — one ALTER TABLE
- **Dependencies**: Confirm no Vietnamese support is planned before removing

#### N2. Missing `updated_at` on `checklist_items`
- **Source**: Supabase Audit
- **File**: `docs/sql/001-auth-tables.sql:66-73`
- **Verdict**: `ACCEPT RISK`
- **Rationale**: `checked_at` serves a similar purpose. Adding `updated_at` is only needed if audit trail requirements emerge. Don't add columns speculatively.
- **Effort**: N/A
- **Dependencies**: N/A

#### N3. `checked_at` timestamp set in Node.js, not Postgres
- **Source**: Supabase Audit
- **File**: `lib/actions/dashboard.ts:159`
- **Verdict**: `ACCEPT RISK`
- **Rationale**: Server-side Node.js timestamp vs Postgres `now()` — difference is negligible. Would only matter if clock drift between app server and DB is significant, which is unlikely with Supabase's managed infrastructure.
- **Effort**: N/A
- **Dependencies**: N/A

### Prisma Report Verdicts

#### P1. Adopt Prisma ORM
- **Source**: Prisma DB Evaluation
- **Verdict**: `NO ACTION`
- **Rationale**: Prisma connects with service-role key, bypassing all 10 RLS policies. Would require reimplementing security in application code — a net negative for 3 tables and 6 query functions. The type-safety gap is better solved by `supabase gen types`.
- **Effort**: N/A (deferred indefinitely)
- **Reconsider trigger**: Schema exceeds ~8-10 tables with complex relations, or RLS is abandoned

#### P2. Switch to Prisma Postgres
- **Source**: Prisma Postgres Evaluation
- **Verdict**: `NO ACTION`
- **Rationale**: Would require replacing Supabase Auth, rewriting all RLS policies, and losing realtime capabilities. Prisma Postgres solves a problem LocalNomad doesn't have. Cost vastly exceeds benefit.
- **Effort**: N/A (deferred indefinitely)
- **Reconsider trigger**: Complete departure from Supabase ecosystem (extremely unlikely)

---

## 4. Consolidated Diagnosis

### What's Healthy
- **RLS-first security model**: All data access flows through RLS policies — no client-side-only guards. This is the gold standard for Supabase apps.
- **Clean referential integrity**: All FKs use `ON DELETE CASCADE`. No orphaned rows possible.
- **Efficient indexing**: Partial index on `(user_id, is_active) WHERE is_active = true` optimizes the primary query pattern.
- **Correct trigger usage**: `security definer` on `handle_new_user()` for cross-schema access. `updated_at` triggers on mutable tables.
- **Server actions pattern**: All mutations go through server actions with `getSession()` guard. No direct client-side Supabase mutations.
- **Checklist upsert**: Clean `onConflict` usage with composite unique constraint (`dashboard.ts:152-164`).
- **Session refresh middleware**: `proxy.ts:17-33` properly refreshes auth cookies on every request.

### What Needs Immediate Attention (Critical)
1. **C1 — RLS performance**: 10 policies calling `auth.uid()` per-row. Fix: wrap in `(select auth.uid())`. One migration, zero risk, 10-100x improvement at scale.
2. **C2 — Error visibility**: 3 read actions silently swallow errors. Fix: add `console.error` at 3 locations. Makes RLS misconfigurations visible in server logs.

### What to Watch at Scale (Warnings)
- **UUID v4 fragmentation** (W2): Fine below 100K rows. Monitor table growth.
- **No pagination** (W7): Fine for single-visa design. Revisit when Phase 2 introduces multi-visa support.
- **Unbounded visa_type** (W3): Low risk now, but should be constrained in next migration.

### Strategic Decisions Confirmed
- **Stay on Supabase Postgres**: Auth integration, RLS, and managed infrastructure are tightly coupled. Migration cost to any alternative is prohibitive and unnecessary.
- **Defer Prisma ORM**: Type-safety gap is real but solvable with `supabase gen types`. Prisma's RLS bypass is a dealbreaker.
- **Defer Prisma Postgres**: Solves no current problem. Requires dismantling the auth system.

---

## 5. Repair Plan

### Phase A — Immediate (Next Schema Migration)
| Item | Finding | Action | Effort |
|------|---------|--------|--------|
| A1 | C1 | Wrap all 10 RLS policies: `auth.uid()` → `(select auth.uid())` | Low |
| A2 | C2 | Add `console.error` to `getProfile`, `getActiveVisa`, `getChecklist` in `dashboard.ts` | Low |

**Estimated total**: < 2 hours. Can be done in a single migration + one code PR.

### Phase B — Before Phase 2 (Schema Hardening)
| Item | Finding | Action | Effort |
|------|---------|--------|--------|
| B1 | W3 | Add `CHECK (char_length(visa_type) <= 50)` to `user_visas.visa_type` | Low |
| B2 | W6 | Create shared env config with runtime guards, update 3 Supabase client files | Low |
| B3 | N1 | Remove `'vi'` from `preferred_locale` CHECK (after confirming no Vietnamese plans) | Low |
| B4 | — | Run `supabase gen types typescript` → generate `lib/types/database.ts`, replace manual casts | Low |
| B5 | W5 | Verify Supavisor config in Supabase dashboard, document pooling setup | Low |

**Estimated total**: < 4 hours. Bundle into a "schema hardening" migration.

### Phase C — At Scale (When Metrics Indicate Need)
| Item | Finding | Trigger | Action |
|------|---------|---------|--------|
| C1 | W2 | `user_visas` or `checklist_items` > 100K rows | Evaluate UUIDv7 (requires PG 17+) or bigint |
| C2 | W7 | Phase 2 multi-visa design approved | Add cursor-based pagination to visa/checklist queries |
| C3 | W1 | `checklist_items` > 100K rows | Re-evaluate index selectivity on RLS subquery |

**No action now.** Set monitoring alerts on table row counts if Supabase dashboard supports it.

### Deferred — No Action Unless Context Changes
| Item | Source | Condition to Reconsider |
|------|--------|------------------------|
| Prisma ORM adoption | Prisma DB Eval | Schema > 8-10 tables with complex relations, or RLS abandoned |
| Prisma Postgres switch | Prisma Postgres Eval | Complete departure from Supabase ecosystem |
| `updated_at` on checklist_items | N2 | Audit trail requirements emerge |
| `checked_at` via Postgres `now()` | N3 | Clock drift becomes measurable |
| `country` ENUM vs CHECK | W4 | Never — CHECK is the better pattern for extensibility |

---

## 6. Decision Log Entry

**For `docs/human/[WEEKLY] 의사결정-일지.md`:**

> **2025-02-20 | Backend Stack Decision**
> **결정**: Supabase Postgres + Supabase Auth 유지. Prisma ORM 및 Prisma Postgres 도입 보류.
> **근거**: RLS 기반 보안 모델이 Prisma와 호환 불가 (Prisma는 service-role key로 RLS 우회). 3개 테이블 규모에서 ORM 도입은 오버엔지니어링. Type-safety 문제는 `supabase gen types`로 해결 가능.
> **다음 단계**: Phase A 수리 (RLS `(select auth.uid())` 래핑 + 에러 로깅) 우선 실행.
> 📘 **RLS (Row Level Security)**: DB 레벨에서 "이 행은 이 유저만 읽기/쓰기 가능" 규칙을 강제하는 Postgres 기능. 앱 코드에서 WHERE 절을 빼먹어도 DB가 자동 필터링.
> 📘 **`(select auth.uid())`**: Postgres 플래너가 auth.uid()를 한 번만 평가하게 만드는 최적화. 없으면 행마다 재평가 → 대규모 테이블에서 10-100배 느려짐.
