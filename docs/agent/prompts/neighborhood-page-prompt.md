# Neighborhood Explorer Page — Implementation Prompt

## Overview

Create a new `/neighborhood/korea` page with an interactive Mapbox mini-map (sticky sidebar on desktop) + neighborhood card grid. This is the first country; the route structure should support future expansion to `/neighborhood/japan`, `/neighborhood/taiwan`, etc.

## Decisions (Already Made)

- **Layout**: Sidebar map (left, sticky) + card grid (right, scrollable) on desktop. Stacks vertically (map on top, cards below) on mobile.
- **Map library**: Mapbox GL JS (already in tech stack, env var `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` exists in `.env.example`)
- **Scope**: Korea only (Seoul, Busan, Jeju) — English only for now
- **Route**: `/neighborhood/korea` under `app/[locale]/neighborhood/[country]/page.tsx`
- **Card content**: name, vibe, rent, tags (visible) + pros/cons in accordion
- **Filtering**: City marker click on map filters cards to that city + tag chip filter below map/above cards
- **Guide link**: Add a link from Korea guide MDX to `/neighborhood/korea`
- **Data**: JSON file, NOT fetched from API

## Data Schema

Create `data/neighborhoods/korea.json`:

```json
{
  "country": "korea",
  "cities": [
    {
      "name": "Seoul",
      "coordinates": [37.5665, 126.9780],
      "neighborhoods": [
        {
          "name": "Hongdae (弘大)",
          "city": "Seoul",
          "coordinates": [37.5563, 126.9236],
          "rent": "₩600K–₩950K",
          "vibe": "Young professionals, artists, indie shops, late-night cafes",
          "pros": ["Affordable", "Vibrant", "Cafe culture"],
          "cons": ["Noise", "Touristy parts"],
          "walkability": null,
          "safety": null,
          "tags": ["budget", "cafe", "nightlife"],
          "imageUrl": null
        },
        {
          "name": "Itaewon (이태원)",
          "city": "Seoul",
          "coordinates": [37.5345, 126.9946],
          "rent": "₩1.0M–₩1.7M",
          "vibe": "International, English-friendly, nightlife",
          "pros": ["English spoken", "Expat community", "Coworking"],
          "cons": ["Most expensive area in Seoul", "Touristy"],
          "walkability": null,
          "safety": null,
          "tags": ["expat", "international", "nightlife"],
          "imageUrl": null
        },
        {
          "name": "Gangnam (강남)",
          "city": "Seoul",
          "coordinates": [37.4979, 127.0276],
          "rent": "₩900K–₩1.5M",
          "vibe": "Fast-paced, corporate, luxury",
          "pros": ["Premium amenities", "Networking", "Safe"],
          "cons": ["Expensive", "Less authentic feel"],
          "walkability": null,
          "safety": null,
          "tags": ["luxury", "corporate", "networking"],
          "imageUrl": null
        },
        {
          "name": "Yeonnam-dong (연남동)",
          "city": "Seoul",
          "coordinates": [37.5660, 126.9218],
          "rent": "₩700K–₩1.2M",
          "vibe": "Indie shops, emerging arts scene, trendy, gentrifying",
          "pros": ["Hipster cafes", "Safe", "Less crowded", "Walkable"],
          "cons": ["Fewer English speakers", "Rising rents due to gentrification"],
          "walkability": null,
          "safety": null,
          "tags": ["hipster", "cafe", "trendy"],
          "imageUrl": null
        },
        {
          "name": "Mapo-gu (마포구)",
          "city": "Seoul",
          "coordinates": [37.5538, 126.9084],
          "rent": "₩700K–₩1.0M",
          "vibe": "Local, cafes, central, student-friendly",
          "pros": ["Central location", "Coworking accessible", "Good transit"],
          "cons": ["Less tourist infrastructure", "Rising rents"],
          "walkability": null,
          "safety": null,
          "tags": ["local", "central", "mid-range"],
          "imageUrl": null
        },
        {
          "name": "Seongsu-dong (성수동)",
          "city": "Seoul",
          "coordinates": [37.5448, 127.0591],
          "rent": "₩800K–₩1.2M",
          "vibe": "Creative hub, highest cafe density in Seoul, Brooklyn of Seoul",
          "pros": ["Best cafe culture in Seoul", "Young creatives", "Great transit (Line 2)", "Trendy pop-up scene"],
          "cons": ["Rapidly gentrifying", "Losing indie feel", "Crowded with tourists on weekends"],
          "walkability": null,
          "safety": null,
          "tags": ["cafe", "creative", "trendy"],
          "imageUrl": null
        },
        {
          "name": "Hannam-dong (한남동)",
          "city": "Seoul",
          "coordinates": [37.5356, 126.9980],
          "rent": "₩1.0M–₩1.5M",
          "vibe": "Upscale, refined, galleries, quieter than Itaewon",
          "pros": ["Museums and galleries", "Premium cafes", "Walkable tree-lined streets", "Han River access"],
          "cons": ["Expensive", "Fewer international shops", "Can feel overly curated"],
          "walkability": null,
          "safety": null,
          "tags": ["luxury", "gallery", "cafe"],
          "imageUrl": null
        }
      ]
    },
    {
      "name": "Busan",
      "coordinates": [35.1796, 129.0756],
      "neighborhoods": [
        {
          "name": "Haeundae (해운대)",
          "city": "Busan",
          "coordinates": [35.1587, 129.1604],
          "rent": "₩900K–₩1.3M",
          "vibe": "Beach, nomad hub, coliving scene",
          "pros": ["Beach access", "NOMAD LIVE coliving", "Nomad community"],
          "cons": ["Expensive for Busan", "Crowded in summer"],
          "walkability": null,
          "safety": null,
          "tags": ["beach", "coliving", "community"],
          "imageUrl": null
        },
        {
          "name": "Gwangalli (광안리)",
          "city": "Busan",
          "coordinates": [35.1532, 129.1189],
          "rent": "₩700K–₩1.1M",
          "vibe": "Beach, hipster cafes, nightlife",
          "pros": ["Affordable beach access", "Cafe scene", "Gwangan Bridge views"],
          "cons": ["Fewer nomad facilities", "Less English spoken"],
          "walkability": null,
          "safety": null,
          "tags": ["beach", "cafe", "mid-range"],
          "imageUrl": null
        },
        {
          "name": "Seomyeon (서면)",
          "city": "Busan",
          "coordinates": [35.1580, 129.0588],
          "rent": "₩500K–₩900K",
          "vibe": "Downtown hub, transit center, food and shopping",
          "pros": ["Central transit hub (Lines 1 & 2)", "Affordable", "Best food and nightlife variety"],
          "cons": ["No beach access", "Urban and busy", "Less scenic"],
          "walkability": null,
          "safety": null,
          "tags": ["central", "food", "nightlife"],
          "imageUrl": null
        },
        {
          "name": "Sasang-gu (사상구)",
          "city": "Busan",
          "coordinates": [35.1508, 128.9918],
          "rent": "₩385K–₩500K",
          "vibe": "Local, residential, minimal tourism",
          "pros": ["Very affordable", "Real Korean experience"],
          "cons": ["Few English speakers", "Fewer amenities"],
          "walkability": null,
          "safety": null,
          "tags": ["budget", "local", "quiet"],
          "imageUrl": null
        }
      ]
    },
    {
      "name": "Jeju",
      "coordinates": [33.4996, 126.5312],
      "neighborhoods": [
        {
          "name": "Jeju City (제주시)",
          "city": "Jeju",
          "coordinates": [33.5104, 126.5219],
          "rent": "₩500K–₩950K",
          "vibe": "Island escape, relaxed, growing nomad scene",
          "pros": ["15–20% cheaper than Seoul", "Nature", "Visa-free entry", "Growing coworking scene (40+ spaces)"],
          "cons": ["Typhoon season (Aug–Sep)", "Car recommended for exploring"],
          "walkability": null,
          "safety": null,
          "tags": ["island", "nature", "budget"],
          "imageUrl": null
        },
        {
          "name": "Seogwipo (서귀포시)",
          "city": "Jeju",
          "coordinates": [33.2541, 126.5600],
          "rent": "₩380K–₩650K",
          "vibe": "Quiet southern coast, nature-focused, scenic waterfalls",
          "pros": ["Cheapest option on Jeju", "Best natural scenery", "Quieter than Jeju City"],
          "cons": ["Very limited nightlife", "Fewer cafes and coworking", "Car essential"],
          "walkability": null,
          "safety": null,
          "tags": ["budget", "nature", "quiet"],
          "imageUrl": null
        }
      ]
    }
  ]
}
```

## File Changes

### New Files to Create

1. **`data/neighborhoods/korea.json`** — Neighborhood data (JSON above)

2. **`lib/types/neighborhood.ts`** — TypeScript types

```typescript
export interface Neighborhood {
  name: string;
  city: string;
  coordinates: [number, number]; // [lat, lng]
  rent: string;
  vibe: string;
  pros: string[];
  cons: string[];
  walkability: number | null;
  safety: number | null;
  tags: string[];
  imageUrl: string | null;
}

export interface City {
  name: string;
  coordinates: [number, number];
  neighborhoods: Neighborhood[];
}

export interface CountryNeighborhoodData {
  country: string;
  cities: City[];
}
```

3. **`lib/neighborhood-data.ts`** — Data loader (follow the same `cache()` pattern as `lib/visa-data.ts`)

```typescript
import { cache } from 'react';
import type { CountryNeighborhoodData } from '@/lib/types/neighborhood';

const VALID_COUNTRIES = ['korea'] as const;
type NeighborhoodCountry = (typeof VALID_COUNTRIES)[number];

export const getNeighborhoodData = cache(
  async (country: string): Promise<CountryNeighborhoodData | null> => {
    if (!VALID_COUNTRIES.includes(country as NeighborhoodCountry)) return null;
    try {
      const data = await import(`@/data/neighborhoods/${country}.json`);
      return data.default as CountryNeighborhoodData;
    } catch {
      return null;
    }
  }
);
```

4. **`components/neighborhood/neighborhood-map.tsx`** — Mapbox map component (`"use client"`)

Key requirements:
- Import `mapbox-gl` (install via `npm install mapbox-gl` + `npm install -D @types/mapbox-gl`)
- Use `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` env var
- Show Korea centered, with city markers (Seoul, Busan, Jeju)
- Clicking a city marker calls `onCitySelect(cityName)` callback
- Active city marker should be visually distinct (brand color `#1B4965` filled vs outline)
- Map style: `mapbox://styles/mapbox/light-v11` (clean, minimal)
- On mount, fit bounds to show all 3 cities
- Sticky on desktop (`sticky top-20`), fixed height on mobile (`h-[300px]`)
- Include neighborhood markers as smaller dots when a city is selected
- Disable scroll zoom by default (prevents scroll hijack) — users can ctrl+scroll or pinch to zoom

5. **`components/neighborhood/neighborhood-card.tsx`** — Individual card component

Key requirements:
- Display: name (h3, brand color), vibe (muted text), rent (semibold), tags (colored chips)
- Accordion for pros/cons using shadcn/ui Accordion component (already in ui/)
- Accordion label: "Pros & Cons" — expand to show pros (green check) and cons (red x)
- Card style: white bg, border, rounded-lg, shadow-sm (match existing card patterns)

6. **`components/neighborhood/neighborhood-grid.tsx`** — Card grid with tag filter (`"use client"`)

Key requirements:
- Accepts `neighborhoods: Neighborhood[]` and `allTags: string[]`
- Tag filter: horizontal chip row at top. Click to toggle. Multiple select. "All" chip to reset.
- Grid: `grid-cols-1 sm:grid-cols-2` on desktop (since it's in the right panel)
- Animate card entry/exit on filter change (simple opacity transition, no heavy library)

7. **`components/neighborhood/index.ts`** — Barrel export

8. **`app/[locale]/neighborhood/[country]/page.tsx`** — Page component (Server Component)

Key requirements:
- Validate `country` param (only 'korea' for now). `notFound()` for invalid.
- Load data via `getNeighborhoodData(country)`
- Layout structure:
  ```
  Desktop (lg+):
  ┌──────────────────┬────────────────────────────┐
  │                  │  Tag filters (chip row)     │
  │   Mapbox Map     │  ┌──────┐ ┌──────┐         │
  │   (sticky,       │  │ Card │ │ Card │         │
  │    40% width)    │  └──────┘ └──────┘         │
  │                  │  ┌──────┐ ┌──────┐         │
  │                  │  │ Card │ │ Card │         │
  │                  │  └──────┘ └──────┘         │
  └──────────────────┴────────────────────────────┘

  Mobile:
  ┌────────────────────────────┐
  │   Mapbox Map (300px)       │
  ├────────────────────────────┤
  │   Tag filters              │
  │   ┌──────────────────────┐ │
  │   │ Card                 │ │
  │   └──────────────────────┘ │
  │   ┌──────────────────────┐ │
  │   │ Card                 │ │
  │   └──────────────────────┘ │
  └────────────────────────────┘
  ```
- Page title: "Explore Neighborhoods — South Korea"
- Back link to `/korea` (country page)
- SEO: metadata with title, description, OG image
- Add structured data (schema.org Place)

9. **`app/[locale]/neighborhood/[country]/layout.tsx`** — Optional layout if needed

### Files to Modify

10. **`app/sitemap.ts`** — Add `/neighborhood/korea` to sitemap

11. **`content/blog/guides/korea-ultimate-digital-nomad-guide.mdx`** — Add link to neighborhood page
- In the "City Guides: Seoul, Busan, Jeju" section header area, add:
  `> 🗺️ **[Explore neighborhoods on our interactive map →](/en/neighborhood/korea)**`

## Styling Guidelines

- Brand color: `#1B4965` (use `text-primary` / `bg-primary` which maps to this)
- Font: Lora for headings (already configured as `font-lora`)
- Tag chips: small rounded pills, `bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full`
- Use `cn()` from `@/lib/utils` for conditional classes
- Follow existing patterns in `components/visa/` for component structure

## Technical Notes

- Mapbox GL JS is a client-side library. The map component MUST be `"use client"`.
- The page itself should be a Server Component. The map + grid are client components composed inside it.
- Use dynamic import for the map component to avoid SSR issues: `const NeighborhoodMap = dynamic(() => import('@/components/neighborhood/neighborhood-map'), { ssr: false })`
- Need to add `mapbox-gl` CSS import in the map component: `import 'mapbox-gl/dist/mapbox-gl.css'`
- State management: Use a client wrapper component that holds `selectedCity` and `selectedTags` state, and passes them down to both map and grid.

## Naming Conventions (per CLAUDE.md)

- Files: `kebab-case.tsx`
- Components: PascalCase
- Hooks: `use-[name].ts`
- Path alias: `@/` for all imports

## Verification Checklist

After implementation:
1. `npm run lint` passes
2. `npm run build` passes
3. `/en/neighborhood/korea` loads with map + 13 neighborhood cards
4. Clicking Seoul marker → shows 7 cards, Busan → 4 cards, Jeju → 2 cards
5. Tag filter works (e.g. clicking "budget" shows only budget-tagged neighborhoods)
6. Mobile responsive: map stacks on top, cards below
7. Accordion opens/closes for pros & cons
8. Korea guide MDX has link to neighborhood page
9. Sitemap includes new route
10. No TypeScript errors, no ESLint warnings
