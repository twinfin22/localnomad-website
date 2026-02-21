# Prisma Database Setup Evaluation

**Date**: 2025-02-20
**Scope**: Evaluate whether adopting Prisma ORM benefits the current LocalNomad architecture
**Current stack**: Supabase JS client (`@supabase/ssr` v0.8, `@supabase/supabase-js` v2.97) + raw SQL migrations

---

## 1. Current Architecture

```
Browser → Next.js Server Actions → Supabase JS Client → Supabase Postgres (RLS enforced)
                                         ↑
                                   anon key + user JWT
                                   RLS evaluates auth.uid()
```

- **3 tables**: `profiles`, `user_visas`, `checklist_items`
- **10 RLS policies**: All security enforced at DB level via `auth.uid()`
- **Auth**: Supabase Auth (magic link OTP), session managed via `@supabase/ssr`
- **Migrations**: Single SQL file (`docs/sql/001-auth-tables.sql`), applied manually via Supabase SQL Editor
- **Types**: Hand-written TypeScript interfaces (`lib/types/dashboard.ts`)
- **Queries**: Simple CRUD via Supabase JS client (`lib/actions/dashboard.ts`)

---

## 2. What Prisma Would Add

| Capability | Current (Supabase JS) | With Prisma |
|-----------|----------------------|-------------|
| Type-safe queries | Manual `as Type` casts (`dashboard.ts:24,63,138`) | Auto-generated from schema |
| Schema-as-code | Raw SQL file | `schema.prisma` file |
| Migration tooling | Manual SQL editor | `prisma migrate dev/deploy` |
| Relation traversal | Manual joins / subqueries | `include: { checklist_items: true }` |
| Query builder | Supabase `.from().select().eq()` | `prisma.userVisa.findMany({ where: ... })` |

---

## 3. What Prisma Would Lose

| Concern | Impact |
|---------|--------|
| **RLS bypass** | Prisma connects with a service-role key (bypasses RLS). All 10 RLS policies become dead code. Security enforcement moves to application layer |
| **Supabase Auth integration** | `auth.uid()` in policies no longer evaluates. Must manually pass user ID to every query's WHERE clause |
| **Bundle size** | Prisma Client adds ~1.5MB to `node_modules`. Current Supabase client is already bundled |
| **Migration complexity** | Must keep Prisma migrations in sync with Supabase Auth schema (`auth.users` is managed by Supabase) |
| **Learning curve** | New abstraction layer for 3 tables and ~6 query functions |
| **Middleware conflict** | Current `proxy.ts` refreshes Supabase sessions. Prisma doesn't participate in this flow |

---

## 4. Decision Matrix

| Factor | Weight | Supabase JS | Prisma |
|--------|--------|-------------|--------|
| RLS security model | High | Native support | Must reimplement in app code |
| Type safety | Medium | Manual casts (6 locations) | Auto-generated |
| Migration tooling | Medium | Manual SQL | CLI-managed |
| Complexity vs table count | High | Proportional (3 tables = simple) | Overhead exceeds benefit |
| Auth integration | High | Seamless | Requires workarounds |
| Bundle size | Low | Already included | +1.5MB |

---

## 5. Recommendation

**Defer Prisma adoption.** The current architecture is well-suited to the project's scale and security model.

### When to reconsider:
- Schema exceeds **~8-10 tables** with complex relations (many-to-many, polymorphic)
- Team needs **migration history** and **rollback** tooling (currently one manual SQL file)
- Type safety pain increases (currently 6 manual casts — manageable)
- RLS is abandoned in favor of application-level authorization

### If adopted later:
1. Use `prisma db pull` to introspect existing Supabase schema
2. Set `directUrl` to Supabase direct connection, `url` to pooler
3. Keep Supabase Auth — use Prisma only for data tables, not `auth.*` schema
4. Re-implement all 10 RLS policies as Prisma middleware or service-layer checks

---

## 6. Alternative: Supabase Type Generation

For the immediate type-safety gap, consider `supabase gen types typescript` which auto-generates TypeScript types from the live schema — giving type safety without an ORM:

```bash
npx supabase gen types typescript --project-id <ref> > lib/types/database.ts
```

This eliminates the manual `as Type` casts while keeping the existing architecture intact.
