# LocalNomad Website Architecture

This document provides a comprehensive overview of the LocalNomad website architecture, including frontend component structure, data flow patterns, and technical decisions.

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Frontend Component Architecture](#frontend-component-architecture)
4. [Data Flow & State Management](#data-flow--state-management)
5. [Styling System](#styling-system)
6. [External Services](#external-services)
7. [Configuration](#configuration)

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 16.0.10 |
| UI Library | React | 19.2.0 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.1.9 |
| UI Components | shadcn/ui + Radix UI | - |
| Maps | Mapbox GL | 3.17.0 |
| Carousel | Embla Carousel | 8.5.1 |
| Analytics | Vercel Analytics | - |

---

## Project Structure

```
localnomad-website/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (theme, analytics, fonts)
│   ├── page.tsx                 # Home page
│   ├── business/
│   │   └── page.tsx             # B2B landing page
│   └── globals.css              # Global styles & CSS variables
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui library (~59 components)
│   ├── business/                # Business page sections
│   │   ├── BusinessHeroSection.tsx
│   │   ├── BusinessProblemSection.tsx
│   │   ├── BusinessWhyUsSection.tsx
│   │   ├── BusinessServicesSection.tsx
│   │   ├── BusinessHowItWorksSection.tsx
│   │   ├── BusinessNotForSection.tsx
│   │   ├── BusinessCtaSection.tsx
│   │   └── index.ts             # Barrel export
│   ├── header.tsx               # Navigation header
│   ├── footer.tsx               # Site footer
│   ├── hero-section.tsx         # Home hero
│   ├── value-prop-section.tsx   # Value propositions
│   ├── pricing-section.tsx      # Pricing tiers
│   ├── faq-section.tsx          # FAQ accordion
│   ├── social-proof-section.tsx # Testimonials carousel
│   ├── whats-next-section.tsx   # CTA section
│   ├── SeoulNeighborhoodMap.tsx # Interactive map
│   └── theme-provider.tsx       # Dark mode provider
│
├── hooks/                        # Custom React hooks
│   ├── use-toast.ts             # Toast notifications
│   └── use-mobile.ts            # Mobile viewport detection
│
├── lib/                          # Utilities
│   └── utils.ts                 # cn() helper (clsx + tailwind-merge)
│
├── public/                       # Static assets
│   ├── data/
│   │   └── seoul-boundary.geojson
│   └── images...
│
└── config files...
```

---

## Frontend Component Architecture

### Component Hierarchy

```
RootLayout (app/layout.tsx)
├── ThemeProvider (next-themes)
├── Vercel Analytics
├── Vercel Speed Insights
│
└── Page Content
    ├── Header (client component)
    ├── Page Sections...
    └── Footer
```

### Page Compositions

#### Home Page (`app/page.tsx`)

```
HomePage
├── Header              [client] - Navigation, theme toggle
├── HeroSection         [server] - Hero image, CTA buttons
├── ValuePropSection    [server] - 3-column feature cards
├── SocialProofSection  [client] - Testimonial carousel
├── SeoulNeighborhoodMap[client] - Interactive Mapbox map
├── PricingSection      [server] - 3 pricing tier cards
├── FaqSection          [server] - Accordion FAQ
├── WhatsNextSection    [server] - CTA with background
└── Footer              [server] - Links, social icons
```

#### Business Page (`app/business/page.tsx`)

```
BusinessPage
├── Header
├── BusinessHeroSection     [server] - B2B hero
├── BusinessProblemSection  [server] - 4 problem cards
├── BusinessWhyUsSection    [server] - Why choose us
├── BusinessServicesSection [server] - 3 service offerings
├── BusinessHowItWorksSection[server] - 4-step process
├── BusinessNotForSection   [server] - Not a fit section
├── BusinessCtaSection      [server] - Contact CTA
└── Footer
```

### Component Types

| Component | Rendering | State | Key Features |
|-----------|-----------|-------|--------------|
| `Header` | Client | `useState` | Scroll detection, theme toggle |
| `SeoulNeighborhoodMap` | Client | `useState`, `useRef` | Mapbox integration, fallback SVG |
| `SocialProofSection` | Client | `useState`, `useCallback` | Embla carousel |
| `FaqSection` | Server | None | Radix accordion |
| `PricingSection` | Server | None | Static pricing cards |
| Business sections | Server | None | Static content |

---

## Data Flow & State Management

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Page Component                        │
│                    (Server Component)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │  Section  │   │  Section  │   │  Section  │
    │ (Server)  │   │ (Client)  │   │ (Server)  │
    └───────────┘   └─────┬─────┘   └───────────┘
                          │
                    ┌─────┴─────┐
                    ▼           ▼
              ┌─────────┐ ┌─────────┐
              │ useState│ │ useRef  │
              │ (local) │ │ (DOM)   │
              └─────────┘ └─────────┘
```

### State Management Approach

**No global state library** - The project uses lightweight patterns:

1. **Theme State** (`next-themes`)
   - Persisted to localStorage
   - System preference detection
   - Available via `useTheme()` hook

2. **Local Component State** (`useState`)
   - `Header`: scroll position, mounted state
   - `SeoulNeighborhoodMap`: active neighborhood, map load state
   - `SocialProofSection`: carousel scroll state

3. **Ref-based State** (`useRef`)
   - Map container/instance references
   - Carousel instance reference

4. **Custom Hooks**
   - `useToast()`: Reducer-based notification system
   - `useIsMobile()`: Viewport detection (< 768px)

### Data Sources

| Data Type | Location | Example |
|-----------|----------|---------|
| Static Content | Hardcoded in components | FAQ items, testimonials, pricing |
| GeoJSON | `/public/data/` | Seoul boundary polygon |
| Environment | `.env` | Mapbox access token |

### Data Fetching

Only one client-side fetch exists in the application:

```typescript
// SeoulNeighborhoodMap.tsx
const response = await fetch("/data/seoul-boundary.geojson");
const seoulGeoJSON = await response.json();
```

---

## Styling System

### CSS Architecture

```
┌─────────────────────────────────────────┐
│           Tailwind CSS 4.1.9            │
│         (Utility-first classes)         │
└─────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌─────────┐   ┌───────────┐   ┌─────────┐
│   CSS   │   │  shadcn/  │   │  Fluid  │
│Variables│   │    ui     │   │  Type   │
└─────────┘   └───────────┘   └─────────┘
```

### Color System (CSS Variables)

**Light Mode (`:root`)**
```css
--primary: oklch(0.35 0.08 250)      /* Navy blue */
--background: oklch(0.99 0 0)        /* Near white */
--foreground: oklch(0.15 0.02 250)   /* Dark navy */
--secondary: oklch(0.95 0.005 250)   /* Light blue-gray */
--muted: oklch(0.96 0.005 250)       /* Lighter gray */
```

**Dark Mode (`.dark`)**
```css
--primary: #3B6EA8                   /* Bright blue */
--background: #0A1220               /* Very dark navy */
--foreground: #E6EBF2               /* Light gray */
--secondary: #1A2A40                /* Dark navy */
```

### Fluid Typography

Custom utility classes with `clamp()` for responsive sizing:

```css
.text-fluid-hero      /* clamp(2.25rem, 5vw + 1rem, 4.5rem) */
.text-fluid-section   /* clamp(1.75rem, 3vw + 0.5rem, 3rem) */
.text-fluid-subsection/* clamp(1.25rem, 2vw + 0.25rem, 1.75rem) */
.text-fluid-body      /* clamp(0.9375rem, 1vw + 0.5rem, 1.125rem) */
.text-fluid-price     /* clamp(1.5rem, 2vw + 0.5rem, 2.25rem) */
.text-fluid-subhero   /* clamp(1.125rem, 2vw + 0.5rem, 1.75rem) */
```

### Button Variants (CVA)

| Variant | Use Case |
|---------|----------|
| `default` | Standard buttons |
| `outline` | Secondary actions |
| `ghost` | Minimal emphasis |
| `ctaPrimary` | Primary call-to-action |
| `ctaSecondary` | Secondary CTA |
| `inverted` | Dark backgrounds |

### Utility Helper

```typescript
// lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

---

## External Services

### Mapbox GL

- **Purpose**: Interactive neighborhood map
- **Auth**: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- **Style**: `mapbox://styles/mapbox/light-v11`
- **Fallback**: Static SVG map when token unavailable

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
```

### External Links

- Contact: `mailto:hello@localnomad.club`
- Social: Instagram, LinkedIn
- Booking: External Luma event page

---

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx  # Required for interactive map
```

### Next.js Config (`next.config.mjs`)

```javascript
{
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  allowedDevOrigins: ["..."]
}
```

### TypeScript Config

- Strict mode enabled
- Path alias: `@/*` → root directory
- Target: ES6

### shadcn/ui Config (`components.json`)

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": { "baseColor": "neutral" },
  "iconLibrary": "lucide"
}
```

---

## Key Patterns

### Server vs Client Components

- **Server (default)**: Static sections, SEO content
- **Client (`"use client"`)**: Interactive features (map, carousel, theme toggle)

### Performance Optimizations

- Static Site Generation (SSG)
- `useCallback` for memoized handlers
- Lazy carousel rendering
- Mapbox fallback to static SVG
- Image preloading in hero sections

### Responsive Design

- Mobile-first with Tailwind breakpoints (`sm`, `md`, `lg`)
- Fluid typography with `clamp()`
- `useIsMobile()` hook for JS-based detection

### Error Handling

- Mapbox error state with fallback UI
- Try-catch in async operations
- TypeScript strict mode for type safety

---

## Folder Structure Guidelines

### Directory Purpose & Rules

```
localnomad-website/
│
├── app/                     # ROUTES ONLY - No business logic
│   ├── (routes)/           # Route groups for organization
│   │   └── [page]/
│   │       └── page.tsx    # Page composition only (import & arrange sections)
│   ├── layout.tsx          # Root layout - providers, analytics, fonts
│   └── globals.css         # Global CSS variables & base styles
│
├── components/              # ALL UI COMPONENTS
│   ├── ui/                 # Primitive UI components (shadcn/ui)
│   │   └── *.tsx          # DO NOT MODIFY - managed by shadcn CLI
│   │
│   ├── common/             # Shared components across pages
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── *.tsx
│   │
│   ├── sections/           # Page section components (home page)
│   │   ├── hero-section.tsx
│   │   ├── pricing-section.tsx
│   │   └── *.tsx
│   │
│   └── [feature]/          # Feature-specific components
│       ├── index.ts        # Barrel export (REQUIRED)
│       └── *.tsx
│
├── hooks/                   # Custom React hooks
│   └── use-[name].ts       # One hook per file
│
├── lib/                     # Utilities & helpers
│   ├── utils.ts            # General utilities (cn, formatters)
│   └── constants.ts        # App-wide constants
│
├── types/                   # TypeScript type definitions
│   ├── index.ts            # Shared types
│   └── [feature].ts        # Feature-specific types
│
├── data/                    # Static data & content
│   ├── content/            # Text content (labels, copy)
│   └── [feature].ts        # Feature-specific data
│
└── public/                  # Static assets
    ├── images/
    ├── icons/
    └── data/               # GeoJSON, JSON data files
```

### When to Create New Directories

| Scenario | Action |
|----------|--------|
| New page | Create folder in `app/` with `page.tsx` |
| New page with multiple sections | Create folder in `components/[page-name]/` |
| Reusable across 2+ pages | Move to `components/common/` |
| New interactive feature | Create `components/[feature]/` with barrel export |
| New data type | Add to `types/` |
| Static content/copy | Add to `data/content/` |

---

## Coding Conventions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | `kebab-case.tsx` | `hero-section.tsx` |
| Hooks | `use-[name].ts` | `use-mobile.ts` |
| Types | `[name].ts` | `pricing.ts` |
| Constants | `[name].ts` | `constants.ts` |
| Barrel exports | `index.ts` | `index.ts` |

### Component Structure

```typescript
// 1. "use client" directive (if needed)
"use client";

// 2. External imports (alphabetized)
import { useState } from "react";
import { motion } from "framer-motion";

// 3. Internal imports - UI components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 4. Internal imports - utilities, hooks, types
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PricingTier } from "@/types";

// 5. Types/Interfaces (component-specific)
interface HeroSectionProps {
  title: string;
  subtitle?: string;
}

// 6. Constants (component-specific, outside component)
const ANIMATION_DURATION = 300;

// 7. Component definition
export function HeroSection({ title, subtitle }: HeroSectionProps) {
  // State declarations
  const [isVisible, setIsVisible] = useState(false);

  // Hooks
  const isMobile = useIsMobile();

  // Derived values
  const displayTitle = title.toUpperCase();

  // Event handlers
  const handleClick = () => {
    setIsVisible(true);
  };

  // Render
  return (
    <section className="...">
      {/* JSX */}
    </section>
  );
}
```

### Naming Conventions

```typescript
// Components: PascalCase
export function HeroSection() {}
export function BusinessCtaSection() {}

// Hooks: camelCase with "use" prefix
export function useIsMobile() {}
export function useToast() {}

// Event handlers: camelCase with "handle" prefix
const handleClick = () => {};
const handleSubmit = () => {};
const handleNeighborhoodSelect = () => {};

// Boolean state: camelCase with "is/has/can" prefix
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
const [canSubmit, setCanSubmit] = useState(true);

// Constants: SCREAMING_SNAKE_CASE
const MAX_ITEMS = 10;
const API_ENDPOINT = "/api/data";

// Types/Interfaces: PascalCase with descriptive suffix
interface ButtonProps {}
interface PricingTier {}
type NavigationItem = {};
```

### TypeScript Guidelines

```typescript
// PREFER interfaces for component props
interface CardProps {
  title: string;
  description?: string;  // Optional with ?
  onClick: () => void;
}

// PREFER type for unions and computed types
type ButtonVariant = "primary" | "secondary" | "ghost";
type Status = "idle" | "loading" | "success" | "error";

// ALWAYS type function parameters and returns
function calculatePrice(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

// USE generics for reusable utilities
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}
```

### Import Order

```typescript
// 1. React/Next.js
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// 2. External libraries (alphabetized)
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

// 3. Internal - UI components
import { Button } from "@/components/ui/button";

// 4. Internal - Other components
import { Header } from "@/components/common/header";

// 5. Internal - Hooks
import { useIsMobile } from "@/hooks/use-mobile";

// 6. Internal - Utilities
import { cn } from "@/lib/utils";

// 7. Internal - Types (use `type` keyword)
import type { PricingTier } from "@/types";

// 8. Internal - Data/Constants
import { PRICING_TIERS } from "@/data/pricing";
```

### Component Guidelines

```typescript
// SERVER COMPONENT (default) - No directive needed
// Use for: Static content, SEO, data that doesn't change
export function PricingSection() {
  return <section>...</section>;
}

// CLIENT COMPONENT - Add "use client" directive
// Use for: Interactivity, browser APIs, hooks
"use client";
export function InteractiveMap() {
  const [selected, setSelected] = useState(null);
  return <div>...</div>;
}
```

### CSS/Tailwind Conventions

```typescript
// USE cn() for conditional classes
<div className={cn(
  "base-classes here",
  isActive && "active-classes",
  variant === "large" && "text-xl"
)} />

// PREFER Tailwind over custom CSS
// Good
<div className="flex items-center gap-4 p-6" />

// Avoid
<div style={{ display: "flex", alignItems: "center" }} />

// USE semantic class ordering
// Layout → Spacing → Sizing → Typography → Colors → Effects
<div className="flex items-center gap-4 w-full text-lg text-primary hover:opacity-80" />
```

---

## Summary

| Metric | Count |
|--------|-------|
| Pages | 2 |
| Section Components | 15 |
| UI Components (shadcn) | 59 |
| Custom Hooks | 2 |
| External APIs | 1 (Mapbox) |

The architecture prioritizes **simplicity** and **performance** through:
- No complex state management (local state only)
- Server components by default
- Static content with selective client interactivity
- Component-driven design with clear separation of concerns
