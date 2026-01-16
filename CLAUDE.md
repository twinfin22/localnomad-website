# LocalNomad Website - Claude Code Reference

## Quick Commands
```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm run start    # Start production server
```

## Branding
- **Brand name is "LocalNomad"** - Always one word, no space. Never "Local Nomad" or "Local Nomad Club"
- Plural form: "LocalNomads" (not "Local Nomads")
- Domain: `localnomad.club` / `mail.localnomad.club`

## Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York style)
- **Maps**: Mapbox GL (token in `.env.local`)
- **Analytics**: Vercel Analytics & Speed Insights
- **Email**: Resend (API route at `/api/subscribe`)

## Project Structure
```
app/                    # Routes only - compose sections here
  page.tsx              # Home page
  business/page.tsx     # B2B landing page
  api/subscribe/        # Email capture endpoint
components/
  ui/                   # shadcn/ui primitives (DO NOT MODIFY directly)
  business/             # B2B page sections (barrel export via index.ts)
  sections/             # Home page sections
  *.tsx                 # Shared components (header, footer, etc.)
hooks/                  # Custom hooks (use-toast, use-mobile)
lib/utils.ts            # cn() helper for className merging
public/data/            # GeoJSON files for map
```

## Critical Rules
1. **Server Components by default** - Only add `"use client"` when you need hooks, browser APIs, or interactivity
2. **Never modify `components/ui/`** - These are shadcn/ui managed components
3. **Use `cn()` for conditional classes** - Import from `@/lib/utils`
4. **Barrel exports required** - Feature folders need `index.ts`
5. **Path alias**: Use `@/` for imports (maps to project root)

## Component Patterns
```typescript
// Server component (default - no directive)
export function StaticSection() { ... }

// Client component (requires directive)
"use client";
export function InteractiveFeature() { ... }

// Class merging
import { cn } from "@/lib/utils";
<div className={cn("base-class", isActive && "active-class")} />
```

## Naming Conventions
- **Files**: `kebab-case.tsx` (e.g., `hero-section.tsx`)
- **Components**: PascalCase (e.g., `HeroSection`)
- **Hooks**: `use-[name].ts` with `use` prefix
- **Handlers**: `handle` prefix (e.g., `handleClick`)
- **Boolean state**: `is/has/can` prefix (e.g., `isLoading`)

## Environment Variables
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN  # Required for interactive map
RESEND_API_KEY                   # Email service
AIRTABLE_API_KEY                 # Subscriber storage
AIRTABLE_BASE_ID                 # Airtable base
```

## Key Files to Know
- `app/layout.tsx` - Root layout with providers, fonts, analytics
- `app/globals.css` - CSS variables, fluid typography classes
- `components/header.tsx` - Navigation (client component)
- `components/SeoulNeighborhoodMap.tsx` - Interactive map with SVG fallback

## Import Order
1. React/Next.js
2. External libraries (alphabetized)
3. `@/components/ui/*`
4. Other `@/components/*`
5. `@/hooks/*`
6. `@/lib/*`
7. Types (`import type`)
8. Data/constants

## See Also
- `ARCHITECTURE.md` - Comprehensive architecture documentation
- `SPEC.md` - Product specifications
