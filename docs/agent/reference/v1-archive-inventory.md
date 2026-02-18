# v1-archive Branch Inventory

> **Branch**: `v1-archive`
> **Created**: 2025-02-19
> **Base commit**: `55caf92` — "chore: clean up unused components, update visa UI, add governance docs"
> **Purpose**: LocalNomad v1 codebase preserved for selective reuse in v2

---

## Reusable Assets (High Value for v2)

### Visa JSON Data (`data/visas/`)
Most directly reusable — same data structure may carry over to v2.

| Path | Content | v2 Reuse Potential |
|------|---------|-------------------|
| `data/visas/en/*.json` | 12 Korea visa types (EN) | ⭐⭐⭐ — Refactor to new schema |
| `data/visas/ja/*.json` | 12 Korea visa types (JA) | ⭐⭐⭐ — Translation reuse |
| `data/visas/zh-tw/*.json` | 12 Korea visa types (ZH-TW) | ⭐⭐⭐ — Translation reuse |
| `data/visas/tw/en/*.json` | 4 Taiwan visa types (EN) | ⭐⭐⭐ — DNV, Gold Card data |
| `data/visas/tw/ja/*.json` | 4 Taiwan visa types (JA) | ⭐⭐ — May drop (TW = EN only in v2) |
| `data/visas/tw/zh-tw/dnv.json` | Taiwan DNV (ZH-TW) | ⭐ — TW is EN-only in v2 |
| `data/quiz/questions.json` | Visa finder quiz questions | ⭐⭐ — Adapt for v2 comparison tool |

### i18n Messages (`messages/`)

| Path | Content | v2 Reuse Potential |
|------|---------|-------------------|
| `messages/en.json` | English UI strings | ⭐⭐⭐ — Core translations |
| `messages/ja.json` | Japanese UI strings | ⭐⭐⭐ — Reuse directly |
| `messages/zh-tw.json` | Traditional Chinese UI strings | ⭐⭐ — Korea pages only in v2 |
| `messages/vi.json` | Vietnamese UI strings | ⭐⭐ — Reuse directly |

### Supabase Config (`lib/supabase/`)

| Path | Content | v2 Reuse Potential |
|------|---------|-------------------|
| `lib/supabase/client.ts` | Browser Supabase client | ⭐⭐⭐ — Auth pattern reuse |
| `lib/supabase/server.ts` | Server Supabase client | ⭐⭐⭐ — Server pattern reuse |
| `lib/supabase/middleware.ts` | Auth middleware | ⭐⭐⭐ — Session handling |
| `lib/supabase/database.types.ts` | DB type definitions | ⭐⭐ — Schema will change |
| `lib/supabase/index.ts` | Barrel export | ⭐ — Trivial to recreate |

### Visa Logic (`lib/visa/`)

| Path | Content | v2 Reuse Potential |
|------|---------|-------------------|
| `lib/visa/types.ts` | Visa TypeScript types | ⭐⭐⭐ — Core type definitions |
| `lib/visa/data.ts` | Visa data loader | ⭐⭐ — Adapt to new JSON schema |
| `lib/visa/path-data.ts` | Visa transition path data | ⭐⭐⭐ — Path Simulator reuse |
| `lib/visa/health-score.ts` | Dashboard health score calc | ⭐⭐ — Dashboard logic |
| `lib/visa/quiz-engine.ts` | Quiz matching engine | ⭐⭐ — Adapt for comparison tool |
| `lib/visa/stateMachine.ts` | Visa state machine | ⭐⭐ — Dashboard state logic |
| `lib/visa/tw-types.ts` | Taiwan-specific types | ⭐⭐ — Taiwan feature types |

---

## Components (Reference Value)

### Visa Components (`components/visa/`)
These had flickering issues in v1. Reference for logic, rebuild UI from scratch.

| Folder | Content | Notes |
|--------|---------|-------|
| `visa/dashboard/` | Dashboard panels (D-Day, Health, NextAction) | ⚠️ Had hydration flickering |
| `visa/detail/` | Visa detail tabs (Overview, Documents, FAQ, Process) | ⭐⭐ Tab structure reusable |
| `visa/checklist/` | Interactive checklist | ⭐⭐ Checklist logic reusable |
| `visa/path/` | Path Simulator UI | ⭐⭐ Simulator logic reusable |
| `visa/quiz/` | Visa finder quiz | Reference only |
| `visa/onboarding/` | Onboarding wizard | Reference only |
| `visa/journey/` | Visa journey steps | Reference only |
| `visa/landing/` | Visa landing page sections | Reference only |
| `visa/eligibility/` | Eligibility quiz (⚠️ legal risk) | ❌ Do NOT reuse — legal compliance |
| `visa/tw/` | Taiwan situation data | ⭐ Data structure reference |

### Layout Components

| File | Content | Notes |
|------|---------|-------|
| `components/header.tsx` | Main header | Rebuild for mobile-first |
| `components/footer.tsx` | Footer with disclaimers | ⭐⭐ Disclaimer text reuse |
| `components/header-mobile-menu.tsx` | Mobile hamburger menu | Reference for mobile UX |
| `components/language-switcher.tsx` | i18n language switcher | ⭐⭐ Logic reusable |

### shadcn/ui (`components/ui/`)
40+ components. Will be reinstalled fresh in v2 — no need to pull from archive.

---

## App Routes (`app/`)

| Route | Content | Notes |
|-------|---------|-------|
| `app/[lang]/[country]/visa/[type]/` | Visa detail pages | Route structure reference |
| `app/[lang]/[country]/visa/compare/` | Comparison tool | Reference |
| `app/[lang]/[country]/visa/dashboard/` | Dashboard | Reference |
| `app/[lang]/[country]/visa/path/` | Path Simulator | Reference |
| `app/auth/` | Login/signup pages | ⭐⭐ Auth flow reference |
| `app/api/subscribe/route.ts` | Email subscription API | ⭐ API pattern reference |
| `app/sitemap.ts` | Dynamic sitemap | ⭐⭐ SEO reuse |
| `app/robots.ts` | Robots.txt | ⭐ Reuse directly |

---

## Config Files

| File | Content | v2 Reuse |
|------|---------|----------|
| `next.config.mjs` | Next.js config (i18n, images) | ⭐ If using Next.js |
| `postcss.config.mjs` | PostCSS for Tailwind | ⭐⭐ Likely same |
| `tsconfig.json` | TypeScript config | ⭐⭐ Path aliases |
| `components.json` | shadcn/ui config | ⭐⭐ Reinstall reference |
| `middleware.ts` | i18n + auth middleware | ⭐⭐ Pattern reference |
| `i18n/request.ts` | next-intl request config | ⭐ If using next-intl |

---

## Public Assets (`public/`)

| File | Content | v2 Reuse |
|------|---------|----------|
| `logo_new.png` | Logo (color) | ✅ Keep on main |
| `logo_new_all-blue.png` | Logo (monochrome) | ✅ Keep on main |
| `fabicon.jpeg` | Favicon | ✅ Keep on main |
| `favicon-32.png`, `favicon.svg` | Favicon variants | ✅ Keep on main |
| `apple-touch-icon.png` | iOS icon | ✅ Keep on main |
| `seoul-hero.png` | Hero background image | ⭐ May reuse |
| `data/seoul-boundary.geojson` | Seoul map data | ❌ Not needed in v2 |
| `placeholder-*.{jpg,svg,png}` | Placeholder images | ❌ Not needed |

---

## How to Pull Files

```bash
# Single file
git checkout v1-archive -- data/visas/en/f-1-d.json

# Entire folder
git checkout v1-archive -- messages/

# View without pulling
git show v1-archive:lib/visa/types.ts

# Diff a file between v1 and current
git diff v1-archive -- lib/visa/types.ts
```
