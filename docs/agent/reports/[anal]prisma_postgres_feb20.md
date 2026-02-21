# Prisma Postgres Provisioning Evaluation

**Date**: 2025-02-20
**Scope**: Evaluate Prisma Postgres (managed PG service) vs current Supabase Postgres
**Current stack**: Supabase project (Auth + Postgres + RLS + Realtime)

---

## 1. What Is Prisma Postgres?

Prisma Postgres is a **managed PostgreSQL service** offered by Prisma. It provides:
- Serverless Postgres with auto-scaling
- Built-in connection pooling (PgBouncer)
- Query caching layer
- Integrated with Prisma ORM (required — no raw SQL access)

It is a **database-only** service — no auth, no storage, no realtime, no edge functions.

---

## 2. Comparison

| Capability | Supabase (Current) | Prisma Postgres |
|-----------|-------------------|-----------------|
| **Postgres database** | Dedicated instance | Serverless |
| **Auth** | Built-in (magic link, OAuth, SSO) | None — need third-party |
| **RLS (Row Level Security)** | Native, policy-based | N/A (Prisma ORM only) |
| **Connection pooling** | Supavisor (built-in) | PgBouncer (built-in) |
| **Realtime** | WebSocket subscriptions | None |
| **Storage** | S3-backed file storage | None |
| **Edge Functions** | Deno-based | None |
| **Query caching** | None built-in | Built-in cache layer |
| **ORM requirement** | Optional (JS client works) | Prisma ORM required |
| **Pricing** | Free tier: 500MB, 2 projects | Free tier: limited compute |
| **Dashboard** | Full SQL editor + table viewer | Prisma Studio |

---

## 3. What LocalNomad Would Lose by Switching

1. **Supabase Auth** — The entire auth flow (magic link, session refresh, `proxy.ts` middleware, `auth.uid()` in RLS) would need replacement. This is ~6 files and the core security model.
2. **10 RLS policies** — All row-level security becomes dead. Must rewrite as application-level authorization.
3. **Auto-profile creation trigger** — The `on_auth_user_created` trigger (`001-auth-tables.sql:119-122`) depends on `auth.users`, which is Supabase-specific.
4. **Deployment simplicity** — Currently zero database infra management. Supabase handles backups, scaling, and connection pooling.

---

## 4. When Prisma Postgres Makes Sense

- Projects using **Prisma ORM** that need a managed PG without existing infrastructure
- Projects that don't use Supabase Auth or RLS
- Projects needing **query caching** at the database layer
- Greenfield projects evaluating database providers

---

## 5. Recommendation

**Stay on Supabase Postgres.** It is the correct choice for LocalNomad's auth-first architecture.

Switching to Prisma Postgres would require:
- Replacing the entire auth system (Supabase Auth → Auth.js / Clerk / Lucia)
- Rewriting all RLS policies as application code
- Losing realtime capabilities for future features
- Adding Prisma ORM as a hard dependency

The cost far exceeds any benefit. Prisma Postgres solves a problem LocalNomad doesn't have — the project already has a well-integrated database with auth, RLS, and managed infrastructure.

**No action needed.**
